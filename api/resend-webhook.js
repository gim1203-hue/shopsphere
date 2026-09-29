import { Resend } from 'resend'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { getFirebaseServices } from './_lib/firebaseAdmin.js'

export const config = { api: { bodyParser: false } }

async function readBody(request) {
  const chunks = []
  for await (const chunk of request) chunks.push(Buffer.from(chunk))
  return Buffer.concat(chunks).toString('utf8')
}

function plainText(html) {
  return String(html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.RESEND_INBOUND_API_KEY || process.env.RESEND_API_KEY
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET
  if (!apiKey || !webhookSecret) return response.status(503).json({ error: 'Inbound email is not configured' })

  try {
    const resend = new Resend(apiKey)
    const payload = await readBody(request)
    const event = resend.webhooks.verify({
      payload,
      headers: {
        id: String(request.headers['svix-id'] || ''),
        timestamp: String(request.headers['svix-timestamp'] || ''),
        signature: String(request.headers['svix-signature'] || ''),
      },
      webhookSecret,
    })
    if (event.type !== 'email.received') return response.status(200).json({ received: true })

    const emailId = String(event.data?.email_id || '').trim()
    if (!emailId) return response.status(400).json({ error: 'Missing email identifier' })

    let received = event.data
    try {
      const result = await resend.emails.receiving.get(emailId)
      if (result.data) received = { ...received, ...result.data }
    } catch (retrieveError) {
      console.error('Unable to retrieve inbound email body:', retrieveError.message)
    }

    const { db } = getFirebaseServices()
    const createdAt = received.created_at ? Timestamp.fromDate(new Date(received.created_at)) : FieldValue.serverTimestamp()
    await db.collection('inboundEmails').doc(emailId).set({
      resendId: emailId,
      from: String(received.from || 'Unknown sender').slice(0, 500),
      to: Array.isArray(received.to) ? received.to.slice(0, 20) : [],
      subject: String(received.subject || '(No subject)').slice(0, 500),
      text: String(received.text || plainText(received.html) || 'Message body is available in Resend.').slice(0, 20000),
      attachmentCount: Array.isArray(received.attachments) ? received.attachments.length : 0,
      status: 'new',
      createdAt,
      receivedAt: FieldValue.serverTimestamp(),
    }, { merge: true })
    return response.status(200).json({ received: true })
  } catch (error) {
    console.error('Resend webhook rejected:', error.message)
    return response.status(400).json({ error: 'Invalid webhook request' })
  }
}

