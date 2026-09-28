import { FieldValue } from 'firebase-admin/firestore'
import { requireSignedInUser, sendApiError } from './_lib/firebaseAdmin.js'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }
  try {
    const { user, db } = await requireSignedInUser(request)
    const type = String(request.body?.type || '').trim().slice(0, 50)
    const orderNumber = String(request.body?.orderNumber || '').trim().slice(0, 100)
    const message = String(request.body?.message || '').trim().slice(0, 4000)
    if (!type || !message) return response.status(400).json({ error: 'Choose a request type and describe how we can help.' })
    const ticket = await db.collection('supportRequests').add({
      uid: user.uid,
      email: user.email || '',
      type,
      orderNumber,
      message,
      status: 'open',
      createdAt: FieldValue.serverTimestamp(),
    })
    if (process.env.RESEND_API_KEY && process.env.FROM_EMAIL && process.env.SUPPORT_REPLY_TO) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.FROM_EMAIL,
          to: [process.env.SUPPORT_REPLY_TO],
          reply_to: user.email || undefined,
          subject: `[${type}] Customer request ${orderNumber || ticket.id}`,
          text: `Customer: ${user.email || user.uid}\nOrder: ${orderNumber || 'Not supplied'}\n\n${message}`,
        }),
      }).catch(() => {})
    }
    return response.status(201).json({ ticket: ticket.id })
  } catch (error) {
    return sendApiError(response, error)
  }
}
