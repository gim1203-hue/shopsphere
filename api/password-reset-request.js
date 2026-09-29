import { createHash } from 'node:crypto'
import { FieldValue } from 'firebase-admin/firestore'
import { emailAddress } from './_lib/email.js'
import { getFirebaseServices } from './_lib/firebaseAdmin.js'

const GENERIC_RESPONSE = { received: true, message: 'If that email belongs to an account, support will review the request.' }

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const email = emailAddress(request.body?.email).toLowerCase()
  if (!email) return response.status(200).json(GENERIC_RESPONSE)

  try {
    const { auth, db } = getFirebaseServices()
    let customer
    try {
      customer = await auth.getUserByEmail(email)
    } catch {
      return response.status(200).json(GENERIC_RESPONSE)
    }

    const cooldownId = createHash('sha256').update(email).digest('hex')
    const cooldownReference = db.collection('passwordResetCooldowns').doc(cooldownId)
    const cooldownDocument = await cooldownReference.get()
    const lastRequest = cooldownDocument.data()?.requestedAt?.toMillis?.() || 0
    if (Date.now() - lastRequest < 10 * 60 * 1000) return response.status(200).json(GENERIC_RESPONSE)

    const resetRequest = await db.collection('passwordResetRequests').add({
      uid: customer.uid,
      name: customer.displayName || 'Customer',
      email,
      status: 'new',
      createdAt: FieldValue.serverTimestamp(),
    })
    await cooldownReference.set({ requestedAt: FieldValue.serverTimestamp() }, { merge: true })

    const adminEmail = emailAddress(process.env.FULFILLMENT_EMAIL || process.env.SUPPORT_REPLY_TO)
    if (adminEmail && process.env.RESEND_API_KEY && process.env.FROM_EMAIL) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.FROM_EMAIL,
          to: [adminEmail],
          subject: `Password reset requested by ${email}`,
          text: `${customer.displayName || 'A customer'} requested help resetting the password for ${email}.\n\nOpen the Customers section of the StopShop admin dashboard and press “Send reset link” beside request ${resetRequest.id}.`,
        }),
      }).catch(() => {})
    }
    return response.status(200).json(GENERIC_RESPONSE)
  } catch (error) {
    console.error('Password reset request failed:', error.message)
    return response.status(200).json(GENERIC_RESPONSE)
  }
}
