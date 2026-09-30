import Stripe from 'stripe'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { getFirebaseServices, recordErrorReport } from './_lib/firebaseAdmin.js'
import { invoiceNumber } from './_lib/order.js'
import { emailAddress } from './_lib/email.js'

export const config = { api: { bodyParser: false } }

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.clover' })
  : null

async function readRawBody(request) {
  const chunks = []
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  return Buffer.concat(chunks)
}

async function savePaidOrder(sessionId) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['line_items', 'payment_intent.latest_charge'] })
  if (session.payment_status !== 'paid') return

  const userId = String(session.metadata?.userId || session.client_reference_id || '')
  if (!userId) throw new Error(`Paid Stripe session ${session.id} has no customer user id`)

  const { db } = getFirebaseServices()
  if (session.metadata?.type === 'supplemental_invoice') {
    const originalSessionId = String(session.metadata.originalSessionId || '')
    if (!originalSessionId.startsWith('cs_')) throw new Error(`Supplemental invoice ${session.id} has no original order`)
    const fulfillmentRef = db.collection('fulfillmentOrders').doc(originalSessionId)
    const customerOrderRef = db.collection('customers').doc(userId).collection('orders').doc(originalSessionId)
    const [fulfillmentDocument, customerOrderDocument] = await Promise.all([fulfillmentRef.get(), customerOrderRef.get()])
    const charge = typeof session.payment_intent === 'object' && typeof session.payment_intent?.latest_charge === 'object' ? session.payment_intent.latest_charge : null
    const updateInvoices = (document) => (document.data()?.supplementalInvoices || []).map((invoice) => invoice.id === session.id ? {
      ...invoice,
      status: 'paid',
      amountTax: session.total_details?.amount_tax || 0,
      amountTotal: session.amount_total || 0,
      receiptUrl: charge?.receipt_url || '',
      paidAt: new Date().toISOString(),
    } : invoice)
    await Promise.all([
      fulfillmentRef.set({ supplementalInvoices: updateInvoices(fulfillmentDocument), updatedAt: FieldValue.serverTimestamp() }, { merge: true }),
      customerOrderRef.set({ supplementalInvoices: updateInvoices(customerOrderDocument), updatedAt: FieldValue.serverTimestamp() }, { merge: true }),
    ])
    const customerEmail = emailAddress(session.customer_details?.email || session.customer_email || fulfillmentDocument.data()?.customerEmail)
    if (customerEmail && charge?.receipt_url && process.env.RESEND_API_KEY && process.env.FROM_EMAIL) {
      const subject = `Receipt for StopShop order ${originalSessionId.slice(-10).toUpperCase()}`
      const text = `Your additional payment was received.\n\nAmount paid: $${((session.amount_total || 0) / 100).toFixed(2)}\nSales tax: $${((session.total_details?.amount_tax || 0) / 100).toFixed(2)}\n\nView your official Stripe receipt: ${charge.receipt_url}\n\nThis receipt is also saved under Orders in your StopShop account.`
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: process.env.FROM_EMAIL, to: [customerEmail], subject, text, reply_to: emailAddress(process.env.SUPPORT_REPLY_TO) || undefined }) })
        const emailResult = await emailResponse.json().catch(() => ({}))
        if (emailResponse.ok) await db.collection('customerMessages').add({ uid: userId, email: customerEmail, resendId: emailResult.id || '', subject, text, source: 'supplemental_receipt', createdAt: FieldValue.serverTimestamp() })
      } catch (emailError) {
        await recordErrorReport({ source: 'supplemental-receipt-email', message: emailError.message, user: userId }).catch(() => {})
      }
    }
    return
  }
  const shipping = session.collected_information?.shipping_details || session.shipping_details || null
  const paidAt = Timestamp.fromMillis((session.created || Math.floor(Date.now() / 1000)) * 1000)
  const order = {
    stripeSessionId: session.id,
    number: session.id.slice(-10).toUpperCase(),
    invoiceNumber: invoiceNumber(session.id, session.created),
    status: 'processing',
    paymentStatus: session.payment_status,
    email: session.customer_details?.email || session.customer_email || '',
    amountSubtotal: session.amount_subtotal || 0,
    amountShipping: session.total_details?.amount_shipping || 0,
    amountTax: session.total_details?.amount_tax || 0,
    amountDiscount: session.total_details?.amount_discount || 0,
    amountTotal: session.amount_total || 0,
    currency: session.currency || 'usd',
    items: (session.line_items?.data || []).map((item) => ({
      name: item.description || 'Purchased item',
      quantity: item.quantity || 1,
      amountTotal: item.amount_total || 0,
    })),
    shippingAddress: shipping ? { name: shipping.name || '', ...shipping.address } : null,
    shipsFrom: 'StopShop fulfillment network, United States',
    createdAt: paidAt,
    updatedAt: FieldValue.serverTimestamp(),
  }

  await Promise.all([
    db.collection('customers').doc(userId).collection('orders').doc(session.id).set(order, { merge: true }),
    db.collection('fulfillmentOrders').doc(session.id).set({
      userId,
      customerName: session.customer_details?.name || shipping?.name || '',
      customerEmail: order.email,
      customerPhone: session.customer_details?.phone || '',
      shippingAddress: order.shippingAddress,
      paymentStatus: session.payment_status,
      invoiceNumber: order.invoiceNumber,
      fulfillmentStatus: 'ready_to_purchase',
      amountSubtotal: session.amount_subtotal || 0,
      amountShipping: session.total_details?.amount_shipping || 0,
      amountTax: session.total_details?.amount_tax || 0,
      amountTotal: session.amount_total || 0,
      currency: session.currency || 'usd',
      paidAt,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true }),
  ])
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return response.status(503).json({ error: 'Stripe webhook is not configured' })

  try {
    const rawBody = await readRawBody(request)
    const signature = request.headers['stripe-signature']
    const event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET)
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      await savePaidOrder(event.data.object.id)
    }
    return response.status(200).json({ received: true })
  } catch (error) {
    console.error('Stripe webhook failed:', error.message)
    await recordErrorReport({ source: 'stripe-webhook', message: error.message }).catch(() => {})
    return response.status(400).json({ error: 'Webhook could not be processed' })
  }
}
