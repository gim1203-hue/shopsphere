import Stripe from 'stripe'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { requireSignedInUser } from './_lib/firebaseAdmin.js'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.clover' })
  : null

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  if (!stripe) return response.status(503).json({ error: 'Stripe is not configured' })

  let account
  try {
    account = await requireSignedInUser(request)
  } catch (error) {
    return response.status(error.statusCode || 401).json({ error: error.message })
  }

  const sessionId = String(request.query.id || '')
  if (!sessionId.startsWith('cs_')) return response.status(400).json({ error: 'Invalid checkout session' })

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['line_items'] })
    if (session.metadata?.userId !== account.user.uid) return response.status(403).json({ error: 'This order belongs to another account.' })
    const paid = session.payment_status === 'paid'
    const shipping = session.collected_information?.shipping_details || session.shipping_details || null
    const order = {
      stripeSessionId: session.id,
      number: session.id.slice(-10).toUpperCase(),
      status: 'processing',
      paymentStatus: session.payment_status,
      email: session.customer_details?.email || account.user.email || null,
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
      createdAt: Timestamp.fromMillis((session.created || Math.floor(Date.now() / 1000)) * 1000),
      estimatedShipDate: Timestamp.fromMillis(Date.now() + 2 * 86400000),
      estimatedDeliveryDate: Timestamp.fromMillis(Date.now() + 7 * 86400000),
      updatedAt: FieldValue.serverTimestamp(),
    }
    if (paid) {
      await account.db.collection('customers').doc(account.user.uid).collection('orders').doc(session.id).set(order, { merge: true })
    }
    return response.status(200).json({ paid, order: order.number, email: order.email })
  } catch (error) {
    console.error('Checkout confirmation failed:', error.message)
    return response.status(error?.code === 'resource_missing' ? 404 : 500).json({ error: error?.code === 'resource_missing' ? 'Checkout session not found' : 'Unable to save the confirmed order' })
  }
}
