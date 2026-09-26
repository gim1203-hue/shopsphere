import Stripe from 'stripe'
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
    const [usersPage, cartsSnapshot, messagesSnapshot, catalog, errorsSnapshot, refundsSnapshot] = await Promise.all([
      auth.listUsers(100, customerCursor || undefined),
      db.collection('customerCarts').get(),
      db.collection('customerMessages').orderBy('createdAt', 'desc').limit(100).get(),
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
        ...(orderCursor ? { starting_after: orderCursor } : {}),
      })
      orders = sessions.data.map((session) => ({
        id: session.id,
        email: session.customer_details?.email || session.customer_email || '',
        amount: session.amount_total || 0,
        currency: session.currency || 'usd',
        paymentStatus: session.payment_status,
        refunded: refundsBySession.has(session.id),
        status: session.status,
        createdAt: session.created,
        paymentIntent: typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id || null,
      }))
      orderNextCursor = sessions.has_more ? sessions.data.at(-1)?.id || null : null
    }

    const messages = messagesSnapshot.docs.map((document) => {
      const message = document.data()
      return {
        id: document.id,
        uid: message.uid,
        email: message.email,
        subject: message.subject,
        text: message.text,
        createdAt: message.createdAt?.toDate?.().toISOString() || null,
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
      errorReports,
      customerNextCursor: usersPage.pageToken || null,
      orderNextCursor,
      errorNextCursor: errorsSnapshot.size === 50 ? errorsSnapshot.docs.at(-1)?.id || null : null,
      integrations: {
        stripe: Boolean(process.env.STRIPE_SECRET_KEY),
        email: Boolean(process.env.RESEND_API_KEY && process.env.FROM_EMAIL),
      },
    })
  } catch (error) {
    return sendApiError(response, error)
  }
}