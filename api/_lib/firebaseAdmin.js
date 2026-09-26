import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

export function getFirebaseServices() {
  const serviceAccountValue = process.env.FIREBASE_SERVICE_ACCOUNT_JSON

  if (!serviceAccountValue) {
    const error = new Error('Firebase Admin is not configured on the server')
    error.statusCode = 503
    throw error
  }

  let serviceAccount
  try {
    serviceAccount = JSON.parse(serviceAccountValue)
  } catch {
    const error = new Error('Firebase Admin service account configuration is invalid')
    error.statusCode = 503
    throw error
  }

  const app = getApps().find((current) => current.name === 'shopsphere-admin')
    || initializeApp({ credential: cert(serviceAccount) }, 'shopsphere-admin')

  return {
    auth: getAuth(app),
    db: getFirestore(app),
  }
}

export async function requireSignedInUser(request) {
  const token = request.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) {
    const error = new Error('Sign in to continue')
    error.statusCode = 401
    throw error
  }

  const { auth, db } = getFirebaseServices()
  try {
    const user = await auth.verifyIdToken(token)
    return { user, auth, db }
  } catch {
    const error = new Error('Your sign-in has expired. Sign in again.')
    error.statusCode = 401
    throw error
  }
}

export async function requireAdmin(request) {
  const { user, auth, db } = await requireSignedInUser(request)
  const adminUids = (process.env.ADMIN_UIDS || '')
    .split(',')
    .map((uid) => uid.trim())
    .filter(Boolean)

  if (!adminUids.length) {
    const error = new Error('Admin access is not configured on the server')
    error.statusCode = 503
    throw error
  }

  if (!adminUids.includes(user.uid)) {
    const error = new Error('You do not have permission to manage this store')
    error.statusCode = 403
    throw error
  }

  return { user, auth, db }
}

export function sendApiError(response, error) {
  const statusCode = Number(error.statusCode) || 500
  if (statusCode >= 500) {
    console.error('Admin API error:', error.message)
    recordErrorReport({ source: 'api', message: error.message }).catch(() => {})
  }
  return response.status(statusCode).json({
    error: statusCode >= 500 ? 'The store management service is unavailable' : error.message,
  })
}

export async function recordErrorReport({ source, message, stack = '', page = '', user = '' }) {
  const { db } = getFirebaseServices()
  await db.collection('errorReports').add({
    source: String(source || 'server').slice(0, 40),
    message: String(message || 'Unspecified error').slice(0, 1000),
    stack: String(stack || '').slice(0, 6000),
    page: String(page || '').slice(0, 500),
    user: String(user || '').slice(0, 200),
    status: 'open',
    createdAt: FieldValue.serverTimestamp(),
  })
}