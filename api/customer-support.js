import { FieldValue } from 'firebase-admin/firestore'
import { requireSignedInUser, sendApiError } from './_lib/firebaseAdmin.js'
import { emailAddress } from './_lib/email.js'

export default async function handler(request, response) {
  try {
    const { user, db } = await requireSignedInUser(request)
    if (request.method === 'GET') {
      const snapshot = await db.collection('supportRequests').where('uid', '==', user.uid).limit(50).get()
      const tickets = snapshot.docs.map((document) => {
        const ticket = document.data()
        return {
          id: document.id,
          type: ticket.type,
          orderNumber: ticket.orderNumber || '',
          message: ticket.message || '',
          status: ticket.status || 'open',
          conversation: Array.isArray(ticket.conversation) ? ticket.conversation : [],
          createdAt: ticket.createdAt?.toDate?.().toISOString() || null,
        }
      }).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      return response.status(200).json({ tickets })
    }

    if (request.method !== 'POST') {
      response.setHeader('Allow', 'GET, POST')
      return response.status(405).json({ error: 'Method not allowed' })
    }

    const ticketId = String(request.body?.ticketId || '').trim().slice(0, 100)
    if (ticketId) {
      const message = String(request.body?.message || '').trim().slice(0, 4000)
      if (!message) return response.status(400).json({ error: 'Enter a message.' })
      const reference = db.collection('supportRequests').doc(ticketId)
      const document = await reference.get()
      if (!document.exists || document.data().uid !== user.uid) return response.status(404).json({ error: 'Support conversation not found.' })
      await reference.update({
        conversation: FieldValue.arrayUnion({ sender: 'customer', text: message, createdAt: new Date().toISOString() }),
        status: 'open',
        updatedAt: FieldValue.serverTimestamp(),
      })
      return response.status(200).json({ sent: true })
    }

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
      conversation: [{ sender: 'customer', text: message, createdAt: new Date().toISOString() }],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
    const supportEmail = emailAddress(process.env.SUPPORT_REPLY_TO)
    if (process.env.RESEND_API_KEY && process.env.FROM_EMAIL && supportEmail) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.FROM_EMAIL,
          to: [supportEmail],
          reply_to: emailAddress(user.email) || undefined,
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
