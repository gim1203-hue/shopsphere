import Stripe from 'stripe'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { getFirebaseServices, recordErrorReport } from './_lib/firebaseAdmin.js'

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
  const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['line_items'] })
  if (session.payment_status !== 'paid') return

  const userId = String(session.metadata?.userId || session.client_reference_id || '')
  if (!userId) throw new Error(`Paid Stripe session ${session.id} has no customer user id`)

  const { db } = getFirebaseServices()
  const shipping = session.collected_information?.shipping_details || session.shipping_details || null
  const paidAt = Timestamp.fromMillis((session.created || Math.floor(Date.now() / 1000)) * 1000)
  const estimatedShipDate = Timestamp.fromMillis(Date.now() + 2 * 86400000)
  const estimatedDeliveryDate = Timestamp.fromMillis(Date.now() + 7 * 86400000)
  const order = {
    stripeSessionId: session.id,
    number: session.id.slice(-10).toUpperCase(),
    status: 'processing',
    paymentStatus: session.payment_status,
    email: session.customer_details?.email || session.customer_email || '',
    amountSubtotal: session.amount_subtotal || 0,
    amountTotal: session.amount_total || 0,
    currency: session.currency || 'usd',
    items: (session.line_items?.data || []).map((item) => ({
      name: item.description || 'Purchased item',
      quantity: item.quantity || 1,
      amountTotal: item.amount_total || 0,
    })),
    shippingAddress: shipping ? { name: shipping.name || '', ...shipping.address } : null,
    shipsFrom: 'AskKhan fulfillment network, United States',
    createdAt: paidAt,
    estimatedShipDate,
    estimatedDeliveryDate,
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
      fulfillmentStatus: 'ready_to_purchase',
      amountTotal: session.amount_total || 0,
      currency: session.currency || 'usd',
      paidAt,
      estimatedShipDate,
      estimatedDeliveryDate,
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
