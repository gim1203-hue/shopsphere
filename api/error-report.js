import crypto from 'node:crypto'
import { FieldValue } from 'firebase-admin/firestore'
import { getFirebaseServices } from './_lib/firebaseAdmin.js'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const message = String(request.body?.message || '').trim().slice(0, 1000)
  if (!message) return response.status(400).json({ error: 'An error message is required' })

  try {
    const { auth, db } = getFirebaseServices()
    const token = request.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1]
    let user = null
    if (token) user = await auth.verifyIdToken(token)

    const forwardedFor = String(request.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim()
    const rateId = crypto.createHash('sha256').update(forwardedFor).digest('hex')
    const rateRef = db.collection('errorReportRateLimits').doc(rateId)
    const windowStart = Math.floor(Date.now() / 3600000) * 3600000
    const allowed = await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(rateRef)
      const previous = snapshot.data()
      if (previous?.windowStart === windowStart && previous.count >= 40) return false
      transaction.set(rateRef, {
        windowStart,
        count: previous?.windowStart === windowStart ? previous.count + 1 : 1,
        expiresAt: new Date(windowStart + 7200000),
      })
      return true
    })
    if (!allowed) return response.status(429).json({ error: 'Error report limit reached' })

    const page = String(request.body?.page || '')
    let pagePath = ''
    try {
      pagePath = new URL(page, 'https://local.invalid').pathname
    } catch {
      pagePath = ''
    }
    const stack = String(request.body?.stack || '').replace(/(https?:\/\/[^\s?#]+)\?[^\s#]*/g, '$1?[redacted]').slice(0, 6000)

    await db.collection('errorReports').add({
      source: String(request.body?.source || 'browser').slice(0, 40),
      message,
      stack,
      page: pagePath.slice(0, 500),
      user: user?.email || (user ? user.uid : 'Guest'),
      uid: user?.uid || null,
      status: 'open',
      createdAt: FieldValue.serverTimestamp(),
    })

    return response.status(202).json({ received: true })
  } catch (error) {
    console.error('Error report could not be saved:', error.message)
    return response.status(503).json({ error: 'Error reporting is unavailable' })
  }
}