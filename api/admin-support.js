import { FieldValue } from 'firebase-admin/firestore'
import { requireAdmin, sendApiError } from './_lib/firebaseAdmin.js'
import { emailAddress } from './_lib/email.js'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { db } = await requireAdmin(request)
    const ticketId = String(request.body?.ticketId || '').trim().slice(0, 100)
    const text = String(request.body?.text || '').trim().slice(0, 6000)
    const close = Boolean(request.body?.close)
    if (!ticketId || (!text && !close)) return response.status(400).json({ error: 'Choose a ticket and enter a reply.' })

    const reference = db.collection('supportRequests').doc(ticketId)
    const document = await reference.get()
    if (!document.exists) return response.status(404).json({ error: 'Support request not found.' })
    const ticket = document.data()

    let emailError = ''
    const customerEmail = emailAddress(ticket.email)
    if (text && process.env.RESEND_API_KEY && process.env.FROM_EMAIL && customerEmail) {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.FROM_EMAIL,
          to: [customerEmail],
          reply_to: emailAddress(process.env.SUPPORT_REPLY_TO) || undefined,
          subject: `Re: ${ticket.type || 'Your support request'} ${ticket.orderNumber || ticketId}`,
          text,
        }),
      })
      if (!emailResponse.ok) {
        const providerError = await emailResponse.json().catch(() => ({}))
        emailError = String(providerError.message || `Email provider returned ${emailResponse.status}`).slice(0, 300)
        console.error('Support reply email failed:', emailResponse.status, emailError)
      }
    } else if (text) {
      emailError = 'Email delivery is not configured.'
    }

    const update = {
      status: close ? 'closed' : 'waiting_for_customer',
      updatedAt: FieldValue.serverTimestamp(),
    }
    if (text) update.conversation = FieldValue.arrayUnion({ sender: 'support', text, createdAt: new Date().toISOString() })
    await reference.update(update)
    return response.status(200).json({ sent: Boolean(text), emailSent: Boolean(text) && !emailError, emailError, closed: close })
  } catch (error) {
    return sendApiError(response, error)
  }
}
