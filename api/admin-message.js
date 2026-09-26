import { FieldValue } from 'firebase-admin/firestore'
import { requireAdmin, sendApiError } from './_lib/firebaseAdmin.js'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { user, auth, db } = await requireAdmin(request)
    if (!process.env.RESEND_API_KEY || !process.env.FROM_EMAIL) {
      return response.status(503).json({ error: 'Customer email is not configured on the server.' })
    }

    const uid = String(request.body?.uid || '')
    const subject = String(request.body?.subject || '').trim().slice(0, 160)
    const text = String(request.body?.text || '').trim().slice(0, 6000)
    if (!uid || !subject || !text) {
      return response.status(400).json({ error: 'Choose a customer and enter a subject and message.' })
    }

    const customer = await auth.getUser(uid)
    if (!customer.email) return response.status(400).json({ error: 'This customer has no email address.' })

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL,
        to: [customer.email],
        subject,
        text,
        reply_to: process.env.SUPPORT_REPLY_TO || undefined,
      }),
    })
    if (!emailResponse.ok) {
      console.error('Customer email provider returned:', emailResponse.status)
      return response.status(502).json({ error: 'The customer email could not be sent.' })
    }

    await db.collection('customerMessages').add({
      uid,
      email: customer.email,
      subject,
      text,
      adminUid: user.uid,
      createdAt: FieldValue.serverTimestamp(),
    })

    return response.status(200).json({ sent: true })
  } catch (error) {
    return sendApiError(response, error)
  }
}