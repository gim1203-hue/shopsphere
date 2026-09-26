import Stripe from 'stripe'
import { requireAdmin, sendApiError } from './_lib/firebaseAdmin.js'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { db, user } = await requireAdmin(request)
    if (!process.env.STRIPE_SECRET_KEY) {
      return response.status(503).json({ error: 'Stripe is not configured on the server' })
    }

    const sessionId = String(request.body?.sessionId || '')
    if (!sessionId.startsWith('cs_')) {
      return response.status(400).json({ error: 'Invalid checkout session' })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const paymentIntent = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id

    if (session.payment_status !== 'paid' || !paymentIntent) {
      return response.status(400).json({ error: 'Only completed paid orders can be refunded.' })
    }

    const intent = await stripe.paymentIntents.retrieve(paymentIntent)
    if (intent.amount_received <= 0 || intent.amount_received <= intent.amount_refunded) {
      return response.status(409).json({ error: 'This order has already been refunded.' })
    }

    const refund = await stripe.refunds.create(
      { payment_intent: paymentIntent },
      { idempotencyKey: `admin-full-refund-${sessionId}` },
    )
    await db.collection('storeRefunds').doc(sessionId).set({
      sessionId,
      paymentIntent,
      refundId: refund.id,
      status: refund.status,
      adminUid: user.uid,
      createdAt: new Date(),
    })
    return response.status(200).json({ refundId: refund.id, status: refund.status })
  } catch (error) {
    return sendApiError(response, error)
  }
}