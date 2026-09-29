import { FieldValue } from 'firebase-admin/firestore'
import { requireAdmin, sendApiError } from './_lib/firebaseAdmin.js'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { db } = await requireAdmin(request)
    const emailId = String(request.body?.emailId || '').trim().slice(0, 200)
    const source = String(request.body?.source || '')
    if (!emailId) return response.status(400).json({ error: 'Choose an email to delete.' })
    await db.collection('hiddenAdminEmails').doc(emailId).set({ source, hiddenAt: FieldValue.serverTimestamp() }, { merge: true })
    if (source === 'store') await db.collection('customerMessages').doc(emailId).delete()
    return response.status(200).json({ deleted: true })
  } catch (error) {
    return sendApiError(response, error)
  }
}
