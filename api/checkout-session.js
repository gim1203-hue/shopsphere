import Stripe from 'stripe'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { requireSignedInUser } from './_lib/firebaseAdmin.js'
import { emailAddress } from './_lib/email.js'
import { invoiceNumber } from './_lib/order.js'

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
      invoiceNumber: invoiceNumber(session.id, session.created),
      status: 'processing',
      paymentStatus: session.payment_status,
      email: session.customer_details?.email || account.user.email || null,
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
      createdAt: Timestamp.fromMillis((session.created || Math.floor(Date.now() / 1000)) * 1000),
      updatedAt: FieldValue.serverTimestamp(),
    }
    if (paid) {
      await Promise.all([
        account.db.collection('customers').doc(account.user.uid).collection('orders').doc(session.id).set(order, { merge: true }),
        account.db.collection('fulfillmentOrders').doc(session.id).set({
          customerName: session.customer_details?.name || shipping?.name || '',
          customerEmail: session.customer_details?.email || account.user.email || '',
          customerPhone: session.customer_details?.phone || '',
          shippingAddress: order.shippingAddress,
          paymentStatus: session.payment_status,
          invoiceNumber: order.invoiceNumber,
          fulfillmentStatus: 'ready_to_purchase',
          amountTotal: session.amount_total || 0,
          amountSubtotal: session.amount_subtotal || 0,
          amountShipping: session.total_details?.amount_shipping || 0,
          amountTax: session.total_details?.amount_tax || 0,
          currency: session.currency || 'usd',
          paidAt: order.createdAt,
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true }),
      ])

      const fulfillmentReference = account.db.collection('fulfillmentOrders').doc(session.id)
      const fulfillmentDocument = await fulfillmentReference.get()
      const fulfillment = fulfillmentDocument.data() || {}
      const fulfillmentEmail = emailAddress(process.env.FULFILLMENT_EMAIL || process.env.SUPPORT_REPLY_TO)
      if (fulfillmentEmail && process.env.RESEND_API_KEY && process.env.FROM_EMAIL && !fulfillment.notificationSentAt) {
        const address = order.shippingAddress
          ? [order.shippingAddress.name, order.shippingAddress.line1, order.shippingAddress.line2, [order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.postal_code].filter(Boolean).join(' '), order.shippingAddress.country].filter(Boolean).join(', ')
          : 'Not supplied'
        const itemDetails = (fulfillment.items || []).map((item) => [
          `${item.quantity} x ${item.name}`,
          `Merchant: ${item.merchantName || 'Not supplied'}`,
          `Supplier price: $${Number(item.sourcePrice || 0).toFixed(2)} each`,
          `Merchant email: ${item.merchantEmail || 'Not supplied'}`,
          `Merchant contact: ${item.merchantContact || 'Not supplied'}`,
          `Purchase link: ${item.purchaseUrl || 'Not supplied'}`,
        ].join('\n')).join('\n\n')
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: process.env.FROM_EMAIL,
            to: [fulfillmentEmail],
            reply_to: emailAddress(order.email) || undefined,
            subject: `Paid order ${order.number} is ready to fulfill`,
            text: `Customer: ${session.customer_details?.name || shipping?.name || 'Not supplied'}\nEmail: ${order.email || 'Not supplied'}\nPhone: ${session.customer_details?.phone || 'Not supplied'}\nShip to: ${address}\nPaid total: $${((session.amount_total || 0) / 100).toFixed(2)}\n\nPRODUCTS TO PURCHASE\n\n${itemDetails || 'Product details unavailable. Open the admin order for more information.'}`,
          }),
        })
        if (emailResponse.ok) await fulfillmentReference.set({ notificationSentAt: FieldValue.serverTimestamp() }, { merge: true })
      }
    }
    return response.status(200).json({ paid, order: order.number, email: order.email })
  } catch (error) {
    console.error('Checkout confirmation failed:', error.message)
    return response.status(error?.code === 'resource_missing' ? 404 : 500).json({ error: error?.code === 'resource_missing' ? 'Checkout session not found' : 'Unable to save the confirmed order' })
  }
}
