import Stripe from 'stripe'
import { Resend } from 'resend'
import { loadCatalog } from './_lib/catalog.js'
import { requireAdmin, sendApiError } from './_lib/firebaseAdmin.js'

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { auth, db } = await requireAdmin(request)
    const customerCursor = String(request.query?.customerCursor || '')
    const orderCursor = String(request.query?.orderCursor || '')
    const errorCursor = String(request.query?.errorCursor || '')
    let errorsQuery = db.collection('errorReports').orderBy('createdAt', 'desc')
    if (errorCursor) {
      const cursorDocument = await db.collection('errorReports').doc(errorCursor).get()
      if (cursorDocument.exists) errorsQuery = errorsQuery.startAfter(cursorDocument)
    }
    const [usersPage, cartsSnapshot, messagesSnapshot, inboundSnapshot, hiddenEmailsSnapshot, passwordResetSnapshot, supportSnapshot, catalog, errorsSnapshot, refundsSnapshot] = await Promise.all([
      auth.listUsers(100, customerCursor || undefined),
      db.collection('customerCarts').get(),
      db.collection('customerMessages').orderBy('createdAt', 'desc').limit(100).get(),
      db.collection('inboundEmails').orderBy('createdAt', 'desc').limit(100).get(),
      db.collection('hiddenAdminEmails').get(),
      db.collection('passwordResetRequests').orderBy('createdAt', 'desc').limit(100).get(),
      db.collection('supportRequests').orderBy('createdAt', 'desc').limit(100).get(),
      loadCatalog(db),
      errorsQuery.limit(50).get(),
      db.collection('storeRefunds').get(),
    ])

    const cartsByUid = new Map(cartsSnapshot.docs.map((document) => [document.id, document.data().items || []]))
    const refundsBySession = new Map(refundsSnapshot.docs.map((document) => [document.id, document.data()]))
    const customers = usersPage.users.map((user) => ({
      uid: user.uid,
      name: user.displayName || '',
      email: user.email || '',
      createdAt: user.metadata.creationTime,
      disabled: user.disabled,
      cart: cartsByUid.get(user.uid) || [],
    }))

    let orders = []
    let orderNextCursor = null
    if (process.env.STRIPE_SECRET_KEY) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
      const sessions = await stripe.checkout.sessions.list({
        limit: 50,
        expand: ['data.line_items', 'data.payment_intent.latest_charge'],
        ...(orderCursor ? { starting_after: orderCursor } : {}),
      })
      const fulfillmentDocuments = sessions.data.length
        ? await db.getAll(...sessions.data.map((session) => db.collection('fulfillmentOrders').doc(session.id)))
        : []
      const fulfillmentBySession = new Map(fulfillmentDocuments.filter((document) => document.exists).map((document) => [document.id, document.data()]))
      orders = sessions.data.map((session) => {
        const fulfillment = fulfillmentBySession.get(session.id) || {}
        const intent = typeof session.payment_intent === 'object' ? session.payment_intent : null
        const charge = typeof intent?.latest_charge === 'object' ? intent.latest_charge : null
        return {
          id: session.id,
          name: fulfillment.customerName || session.customer_details?.name || '',
          email: fulfillment.customerEmail || session.customer_details?.email || session.customer_email || '',
          phone: fulfillment.customerPhone || session.customer_details?.phone || '',
          shippingAddress: fulfillment.shippingAddress || null,
          items: fulfillment.items || [],
          receiptItems: (session.line_items?.data || []).map((item) => ({
            name: item.description || 'Purchased item',
            quantity: item.quantity || 1,
            amount: item.amount_total || 0,
          })),
          receiptUrl: charge?.receipt_url || null,
          fulfillmentStatus: fulfillment.fulfillmentStatus || (session.payment_status === 'paid' ? 'needs_order_details' : 'awaiting_payment'),
          amount: session.amount_total || 0,
          currency: session.currency || 'usd',
          paymentStatus: session.payment_status,
          refunded: refundsBySession.has(session.id),
          status: session.status,
          createdAt: session.created,
          paymentIntent: typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id || null,
          stripeUrl: `https://dashboard.stripe.com/${process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') ? 'test/' : ''}payments/${typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || ''}`,
        }
      })
      orderNextCursor = sessions.has_more ? sessions.data.at(-1)?.id || null : null
    }

    const hiddenEmailIds = new Set(hiddenEmailsSnapshot.docs.map((document) => document.id))
    const localMessages = messagesSnapshot.docs.map((document) => {
      const message = document.data()
      return {
        id: document.id,
        uid: message.uid,
        email: message.email,
        subject: message.subject,
        text: message.text,
        resendId: message.resendId || '',
        source: 'store',
        deliveryStatus: 'sent',
        createdAt: message.createdAt?.toDate?.().toISOString() || null,
      }
    }).filter((message) => !hiddenEmailIds.has(message.id) && !hiddenEmailIds.has(message.resendId))
    const storedInboundEmails = inboundSnapshot.docs.map((document) => {
      const email = document.data()
      return {
        id: document.id,
        from: email.from || 'Unknown sender',
        to: Array.isArray(email.to) ? email.to : [],
        subject: email.subject || '(No subject)',
        text: email.text || '',
        attachmentCount: Number(email.attachmentCount || 0),
        status: email.status === 'old' ? 'old' : 'new',
        createdAt: email.createdAt?.toDate?.().toISOString() || null,
      }
    }).filter((email) => !hiddenEmailIds.has(email.id))

    let resendSent = []
    let resendReceived = []
    let resendSyncError = ''
    const resendKey = process.env.RESEND_INBOUND_API_KEY || process.env.RESEND_API_KEY
    if (resendKey) {
      const resend = new Resend(resendKey)
      const [sentResult, receivedResult] = await Promise.all([
        resend.emails.list({ limit: 100 }).catch((error) => ({ data: null, error })),
        resend.emails.receiving.list({ limit: 100 }).catch((error) => ({ data: null, error })),
      ])
      if (sentResult.data?.data) resendSent = sentResult.data.data
      if (receivedResult.data?.data) resendReceived = receivedResult.data.data
      const syncErrors = [sentResult.error?.message, receivedResult.error?.message].filter(Boolean)
      resendSyncError = syncErrors.join(' ')
    }

    const localResendIds = new Set(localMessages.map((message) => message.resendId).filter(Boolean))
    const messages = [...localMessages, ...resendSent.filter((email) => !hiddenEmailIds.has(email.id) && !localResendIds.has(email.id)).map((email) => ({
      id: email.id,
      resendId: email.id,
      uid: '',
      email: Array.isArray(email.to) ? email.to.join(', ') : '',
      subject: email.subject || '(No subject)',
      text: 'Sent through Resend. Open Resend to view the complete rendered email.',
      source: 'resend',
      deliveryStatus: email.last_event || 'sent',
      createdAt: email.created_at || null,
    }))].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))

    const storedInboundById = new Map(storedInboundEmails.map((email) => [email.id, email]))
    const inboundEmails = [...storedInboundEmails, ...resendReceived.filter((email) => !hiddenEmailIds.has(email.id) && !storedInboundById.has(email.id)).map((email) => ({
      id: email.id,
      from: email.from || 'Unknown sender',
      to: Array.isArray(email.to) ? email.to : [],
      subject: email.subject || '(No subject)',
      text: 'This email is stored in Resend. Open Resend to view its complete content.',
      attachmentCount: Array.isArray(email.attachments) ? email.attachments.length : 0,
      status: 'new',
      createdAt: email.created_at || null,
    }))].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    const supportRequests = supportSnapshot.docs.map((document) => {
      const ticket = document.data()
      return {
        id: document.id,
        uid: ticket.uid || '',
        email: ticket.email || '',
        type: ticket.type || 'Customer help',
        orderNumber: ticket.orderNumber || '',
        message: ticket.message || '',
        status: ticket.status || 'open',
        conversation: Array.isArray(ticket.conversation) ? ticket.conversation : [],
        createdAt: ticket.createdAt?.toDate?.().toISOString() || null,
        updatedAt: ticket.updatedAt?.toDate?.().toISOString() || null,
      }
    })
    const passwordResetRequests = passwordResetSnapshot.docs.map((document) => {
      const resetRequest = document.data()
      return {
        id: document.id,
        uid: resetRequest.uid || '',
        name: resetRequest.name || 'Customer',
        email: resetRequest.email || '',
        status: resetRequest.status || 'new',
        createdAt: resetRequest.createdAt?.toDate?.().toISOString() || null,
        handledAt: resetRequest.handledAt?.toDate?.().toISOString() || null,
      }
    })
    const errorReports = errorsSnapshot.docs.map((document) => {
      const report = document.data()
      return {
        id: document.id,
        source: report.source || 'unknown',
        message: report.message || 'Unspecified error',
        stack: report.stack || '',
        page: report.page || '',
        user: report.user || 'Guest',
        status: report.status || 'open',
        createdAt: report.createdAt?.toDate?.().toISOString() || report.occurredAt || null,
      }
    })

    return response.status(200).json({
      customers,
      orders,
      products: catalog,
      messages,
      inboundEmails,
      supportRequests,
      passwordResetRequests,
      errorReports,
      customerNextCursor: usersPage.pageToken || null,
      orderNextCursor,
      errorNextCursor: errorsSnapshot.size === 50 ? errorsSnapshot.docs.at(-1)?.id || null : null,
      integrations: {
        stripe: Boolean(process.env.STRIPE_SECRET_KEY),
        stripeWebhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
        email: Boolean(process.env.RESEND_API_KEY && process.env.FROM_EMAIL),
        inboundEmail: Boolean(process.env.RESEND_WEBHOOK_SECRET && (process.env.RESEND_INBOUND_API_KEY || process.env.RESEND_API_KEY)),
        resendSync: Boolean(resendKey && !resendSyncError),
        resendSyncError,
        fulfillmentEmail: Boolean(process.env.RESEND_API_KEY && process.env.FROM_EMAIL && (process.env.FULFILLMENT_EMAIL || process.env.SUPPORT_REPLY_TO)),
      },
    })
  } catch (error) {
    return sendApiError(response, error)
  }
}
