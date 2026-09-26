import { FieldValue } from 'firebase-admin/firestore'
import { requireAdmin, sendApiError } from './_lib/firebaseAdmin.js'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { db, user } = await requireAdmin(request)
    const reportId = String(request.body?.reportId || '').slice(0, 150)
    if (!reportId) return response.status(400).json({ error: 'Error report id is required' })

    await db.collection('errorReports').doc(reportId).set({
      status: 'resolved',
      resolvedBy: user.uid,
      resolvedAt: FieldValue.serverTimestamp(),
    }, { merge: true })
    return response.status(200).json({ resolved: true })
  } catch (error) {
    return sendApiError(response, error)
  }
}