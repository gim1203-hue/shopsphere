import Stripe from 'stripe'
import { products } from '../src/data/products.js'
import { verifyProductToken } from './_lib/productToken.js'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.clover' })
  : null

const toCents = (amount) => Math.round(Number(amount) * 100)

function resolveCartItem(item) {
  const quantity = Math.max(1, Math.min(Number(item.quantity) || 1, 10))
  const catalogProduct = products.find((product) => String(product.id) === String(item.id))

  if (catalogProduct) {
    return {
      quantity,
      name: catalogProduct.name,
      image: catalogProduct.image,
      unitAmount: toCents(catalogProduct.price),
    }
  }

  const signedProduct = verifyProductToken(item.checkoutToken)
  if (!signedProduct || String(signedProduct.id) !== String(item.id)) return null

  return {
    quantity,
    name: String(signedProduct.name).slice(0, 120),
    image: signedProduct.image,
    unitAmount: toCents(Number(signedProduct.sourcePrice) * 1.1),
  }
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  if (!stripe) return response.status(503).json({ error: 'Stripe is not configured' })

  const cart = Array.isArray(request.body?.cart) ? request.body.cart.slice(0, 50) : []
  const resolved = cart.map(resolveCartItem)

  if (!resolved.length || resolved.some((item) => !item || item.unitAmount < 50)) {
    return response.status(400).json({ error: 'One or more cart items could not be verified' })
  }

  const subtotal = resolved.reduce((sum, item) => sum + item.unitAmount * item.quantity, 0)
  const siteUrl = (process.env.SITE_URL || 'https://askkhan.vercel.app').replace(/\/$/, '')

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: resolved.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: 'usd',
          unit_amount: item.unitAmount,
          product_data: {
            name: item.name,
            images: item.image?.startsWith('https://') ? [item.image] : undefined,
          },
        },
      })),
      billing_address_collection: 'auto',
      shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB'] },
      shipping_options: [{
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: subtotal >= 10000 ? 0 : 900, currency: 'usd' },
          display_name: subtotal >= 10000 ? 'Complimentary shipping' : 'Standard shipping',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 3 },
            maximum: { unit: 'business_day', value: 7 },
          },
        },
      }],
      automatic_tax: { enabled: false },
      customer_creation: 'always',
      allow_promotion_codes: true,
      success_url: `${siteUrl}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout`,
    })

    return response.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Stripe Checkout creation failed:', error.message)
    return response.status(502).json({ error: 'Unable to start secure checkout' })
  }
}
