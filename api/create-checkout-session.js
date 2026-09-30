import Stripe from 'stripe'
import { products } from '../src/data/products.js'
import { loadCatalog } from './_lib/catalog.js'
import { getFirebaseServices } from './_lib/firebaseAdmin.js'
import { requireSignedInUser } from './_lib/firebaseAdmin.js'
import { recordErrorReport } from './_lib/firebaseAdmin.js'
import { verifyProductToken } from './_lib/productToken.js'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.clover' })
  : null

const toCents = (amount) => Math.round(Number(amount) * 100)

function resolveCartItem(item, catalog) {
  const quantity = Math.max(1, Math.min(Number(item.quantity) || 1, 10))
  const catalogProduct = catalog.find((product) => String(product.id) === String(item.id))

  if (catalogProduct) {
    return {
      quantity,
      name: catalogProduct.name,
      image: catalogProduct.image,
      unitAmount: toCents(catalogProduct.price),
      productId: String(catalogProduct.id),
      sourcePrice: Number(catalogProduct.sourcePrice ?? catalogProduct.price),
      merchantName: catalogProduct.sellerName || catalogProduct.brand || 'Marketplace seller',
      merchantEmail: catalogProduct.sellerEmail || '',
      merchantContact: catalogProduct.sellerContact || '',
      purchaseUrl: catalogProduct.externalUrl || '',
    }
  }

  const signedProduct = verifyProductToken(item.checkoutToken)
  if (!signedProduct || String(signedProduct.id) !== String(item.id)) return null

  return {
    quantity,
    name: String(signedProduct.name).slice(0, 120),
    image: signedProduct.image,
    unitAmount: toCents(Number(signedProduct.sourcePrice) * 1.1),
    productId: String(signedProduct.id),
    sourcePrice: Number(signedProduct.sourcePrice),
    merchantName: signedProduct.sellerName || signedProduct.source || 'Marketplace seller',
    merchantEmail: signedProduct.sellerEmail || '',
    merchantContact: signedProduct.sellerContact || '',
    purchaseUrl: signedProduct.externalUrl || '',
  }
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  if (!stripe) return response.status(503).json({ error: 'Stripe is not configured' })

  let account
  try {
    account = await requireSignedInUser(request)
  } catch (error) {
    return response.status(error.statusCode || 401).json({ error: error.message })
  }

  const cart = Array.isArray(request.body?.cart) ? request.body.cart.slice(0, 50) : []
  let catalog = products
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const { db } = getFirebaseServices()
      catalog = await loadCatalog(db)
    } catch (error) {
      await recordErrorReport({ source: 'checkout-catalog', message: error.message }).catch(() => {})
      return response.status(503).json({ error: 'The product catalog is temporarily unavailable' })
    }
  }
  const resolved = cart.map((item) => resolveCartItem(item, catalog))

  if (!resolved.length || resolved.some((item) => !item || item.unitAmount < 50)) {
    return response.status(400).json({ error: 'One or more cart items could not be verified' })
  }

  const subtotal = resolved.reduce((sum, item) => sum + item.unitAmount * item.quantity, 0)
  const siteUrl = (process.env.SITE_URL || 'https://www.homedepo.tech').replace(/\/$/, '')

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
      phone_number_collection: { enabled: true },
      shipping_address_collection: { allowed_countries: ['US'] },
      shipping_options: [{
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: subtotal >= 10000 ? 0 : 900, currency: 'usd' },
          display_name: subtotal >= 10000 ? 'Complimentary shipping' : 'Standard shipping',
        },
      }],
      automatic_tax: { enabled: true },
      customer_creation: 'always',
      customer_email: account.user.email || undefined,
      client_reference_id: account.user.uid,
      metadata: { userId: account.user.uid },
      allow_promotion_codes: true,
      success_url: `${siteUrl}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout`,
    })

    await account.db.collection('fulfillmentOrders').doc(session.id).set({
      stripeSessionId: session.id,
      userId: account.user.uid,
      customerEmail: account.user.email || '',
      fulfillmentStatus: 'awaiting_payment',
      items: resolved.map((item) => ({
        productId: item.productId,
        name: item.name,
        image: item.image || '',
        quantity: item.quantity,
        customerUnitAmount: item.unitAmount,
        sourcePrice: item.sourcePrice,
        merchantName: item.merchantName,
        merchantEmail: item.merchantEmail,
        merchantContact: item.merchantContact,
        purchaseUrl: item.purchaseUrl,
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return response.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Stripe Checkout creation failed:', error.message)
    await recordErrorReport({ source: 'stripe-checkout', message: error.message }).catch(() => {})
    return response.status(502).json({ error: 'Unable to start secure checkout' })
  }
}
