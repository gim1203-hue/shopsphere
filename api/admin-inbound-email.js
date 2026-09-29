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
    const action = String(request.body?.action || '')
    if (!emailId || !['mark_read', 'mark_new', 'delete'].includes(action)) {
      return response.status(400).json({ error: 'Choose an email and a valid action.' })
    }
    const reference = db.collection('inboundEmails').doc(emailId)
    if (action === 'delete') {
      await Promise.all([
        reference.delete(),
        db.collection('hiddenAdminEmails').doc(emailId).set({ source: 'inbound', hiddenAt: FieldValue.serverTimestamp() }, { merge: true }),
      ])
      return response.status(200).json({ deleted: true })
    }
    await reference.set({
      status: action === 'mark_read' ? 'old' : 'new',
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true })
    return response.status(200).json({ updated: true })
  } catch (error) {
    return sendApiError(response, error)
  }
}
