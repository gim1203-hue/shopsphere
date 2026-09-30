import Stripe from 'stripe'
import { FieldValue } from 'firebase-admin/firestore'
import { requireAdmin, sendApiError } from './_lib/firebaseAdmin.js'
import { emailAddress } from './_lib/email.js'

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.clover' }) : null
const toCents = (value) => {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount < 0 || amount > 100000) return null
  return Math.round(amount * 100)
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { db, user } = await requireAdmin(request)
    if (!stripe) return response.status(503).json({ error: 'Stripe is not configured on the server.' })

    const originalSessionId = String(request.body?.sessionId || '')
    const shippingAmount = toCents(request.body?.shipping)
    const otherAmount = toCents(request.body?.other)
    const otherDescription = String(request.body?.description || 'Additional order charge').trim().slice(0, 120)
    if (!originalSessionId.startsWith('cs_')) return response.status(400).json({ error: 'Invalid original order.' })
    if (shippingAmount === null || otherAmount === null || shippingAmount + otherAmount < 50) {
      return response.status(400).json({ error: 'Enter at least $0.50 in customer shipping or other charges.' })
    }

    const [original, fulfillmentDocument] = await Promise.all([
      stripe.checkout.sessions.retrieve(originalSessionId),
      db.collection('fulfillmentOrders').doc(originalSessionId).get(),
    ])
    const fulfillment = fulfillmentDocument.data() || {}
    if (original.payment_status !== 'paid') return response.status(400).json({ error: 'The original order must be paid first.' })
    const customerEmail = emailAddress(fulfillment.customerEmail || original.customer_details?.email || original.customer_email)
    const customerUid = String(fulfillment.userId || original.metadata?.userId || original.client_reference_id || '')
    if (!customerEmail || !customerUid) return response.status(400).json({ error: 'The order is missing a customer account or email.' })

    const lineItems = []
    if (shippingAmount) lineItems.push({ quantity: 1, price_data: { currency: 'usd', unit_amount: shippingAmount, product_data: { name: `Shipping for order ${originalSessionId.slice(-10).toUpperCase()}` } } })
    if (otherAmount) lineItems.push({ quantity: 1, price_data: { currency: 'usd', unit_amount: otherAmount, product_data: { name: otherDescription } } })
    const siteUrl = (process.env.SITE_URL || 'https://www.homedepo.tech').replace(/\/$/, '')
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      automatic_tax: { enabled: true },
      billing_address_collection: 'required',
      customer_email: customerEmail,
      client_reference_id: customerUid,
      metadata: { type: 'supplemental_invoice', userId: customerUid, originalSessionId },
      success_url: `${siteUrl}/account#orders`,
      cancel_url: `${siteUrl}/account#orders`,
    })

    const invoice = {
      id: session.id,
      originalSessionId,
      shippingAmount,
      otherAmount,
      otherDescription,
      amountBeforeTax: shippingAmount + otherAmount,
      amountTax: 0,
      amountTotal: shippingAmount + otherAmount,
      status: 'payment_due',
      paymentUrl: session.url,
      receiptUrl: '',
      createdAt: new Date().toISOString(),
    }
    const orderRef = db.collection('customers').doc(customerUid).collection('orders').doc(originalSessionId)
    await Promise.all([
      orderRef.set({ supplementalInvoices: FieldValue.arrayUnion(invoice), updatedAt: FieldValue.serverTimestamp() }, { merge: true }),
      fulfillmentDocument.ref.set({ supplementalInvoices: FieldValue.arrayUnion(invoice), updatedAt: FieldValue.serverTimestamp() }, { merge: true }),
    ])

    let emailSent = false
    let emailError = ''
    if (process.env.RESEND_API_KEY && process.env.FROM_EMAIL) {
      const subject = `Payment due for StopShop order ${originalSessionId.slice(-10).toUpperCase()}`
      const text = `A supplemental invoice is ready for your StopShop order.\n\nShipping: $${(shippingAmount / 100).toFixed(2)}\n${otherAmount ? `${otherDescription}: $${(otherAmount / 100).toFixed(2)}\n` : ''}Sales tax: calculated securely by Stripe from your billing address\n\nReview and pay securely: ${session.url}\n\nA final receipt will be saved to your account after payment.`
      const emailResponse = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: process.env.FROM_EMAIL, to: [customerEmail], subject, text, reply_to: emailAddress(process.env.SUPPORT_REPLY_TO) || undefined }) })
      const emailResult = await emailResponse.json().catch(() => ({}))
      if (emailResponse.ok) {
        emailSent = true
        await db.collection('customerMessages').add({ uid: customerUid, email: customerEmail, resendId: emailResult.id || '', subject, text, adminUid: user.uid, createdAt: FieldValue.serverTimestamp() })
      } else {
        emailError = String(emailResult.message || 'Email provider rejected the message.').slice(0, 300)
      }
    }

    return response.status(200).json({ invoice, emailSent, emailError })
  } catch (error) {
    return sendApiError(response, error)
  }
}
