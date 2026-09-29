import { FieldValue } from 'firebase-admin/firestore'
import { emailAddress } from './_lib/email.js'
import { requireAdmin, sendApiError } from './_lib/firebaseAdmin.js'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { user: admin, auth, db } = await requireAdmin(request)
    if (!process.env.RESEND_API_KEY || !process.env.FROM_EMAIL) {
      return response.status(503).json({ error: 'Customer email is not configured on the server.' })
    }

    const uid = String(request.body?.uid || '').trim()
    if (!uid) return response.status(400).json({ error: 'Choose a customer.' })
    const customer = await auth.getUser(uid)
    const customerEmail = emailAddress(customer.email)
    if (!customerEmail) return response.status(400).json({ error: 'This customer has no valid email address.' })

    const siteUrl = String(process.env.SITE_URL || 'https://www.homedepo.tech').replace(/\/$/, '')
    const resetLink = await auth.generatePasswordResetLink(customerEmail, { url: `${siteUrl}/login` })
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL,
        to: [customerEmail],
        reply_to: emailAddress(process.env.SUPPORT_REPLY_TO) || undefined,
        subject: 'Reset your HomeDepo password',
        text: `A password reset was requested for your HomeDepo account.\n\nChoose a new password using this secure one-time link:\n${resetLink}\n\nIf you did not request this, you can ignore this email. Your password has not been changed.\n\nSupport: support@homedepo.tech or (347) 751-1551`,
      }),
    })
    const providerResult = await emailResponse.json().catch(() => ({}))
    if (!emailResponse.ok) {
      const message = String(providerResult.message || `Email provider returned ${emailResponse.status}`).slice(0, 300)
      return response.status(502).json({ error: `Reset email could not be sent: ${message}` })
    }

    await Promise.all([
      db.collection('passwordResetEmails').add({
        uid,
        email: customerEmail,
        requestedBy: admin.uid,
        resendId: providerResult.id || '',
        createdAt: FieldValue.serverTimestamp(),
      }),
      db.collection('customerMessages').add({
        uid,
        email: customerEmail,
        subject: 'Reset your HomeDepo password',
        text: 'A secure, one-time password reset link was sent. The link is intentionally hidden from the admin dashboard.',
        resendId: providerResult.id || '',
        adminUid: admin.uid,
        createdAt: FieldValue.serverTimestamp(),
      }),
    ])
    return response.status(200).json({ sent: true, email: customerEmail })
  } catch (error) {
    return sendApiError(response, error)
  }
}
