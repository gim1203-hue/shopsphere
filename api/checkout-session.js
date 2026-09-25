import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.clover' })
  : null

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  if (!stripe) return response.status(503).json({ error: 'Stripe is not configured' })

  const sessionId = String(request.query.id || '')
  if (!sessionId.startsWith('cs_')) return response.status(400).json({ error: 'Invalid checkout session' })

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return response.status(200).json({
      paid: session.payment_status === 'paid',
      order: session.id,
      email: session.customer_details?.email || null,
    })
  } catch {
    return response.status(404).json({ error: 'Checkout session not found' })
  }
}
