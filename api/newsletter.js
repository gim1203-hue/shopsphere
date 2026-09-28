import { FieldValue } from 'firebase-admin/firestore'
import { getFirebaseServices, sendApiError } from './_lib/firebaseAdmin.js'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }
  try {
    const email = String(request.body?.email || '').trim().toLowerCase().slice(0, 254)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return response.status(400).json({ error: 'Enter a valid email address.' })
    const { db } = getFirebaseServices()
    const id = Buffer.from(email).toString('base64url')
    await db.collection('newsletterSubscribers').doc(id).set({ email, status: 'subscribed', updatedAt: FieldValue.serverTimestamp() }, { merge: true })
    return response.status(200).json({ subscribed: true })
  } catch (error) {
    return sendApiError(response, error)
  }
}
