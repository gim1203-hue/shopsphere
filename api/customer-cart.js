import { FieldValue } from 'firebase-admin/firestore'
import { requireSignedInUser, sendApiError } from './_lib/firebaseAdmin.js'

export default async function handler(request, response) {
  if (request.method !== 'PUT') {
    response.setHeader('Allow', 'PUT')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { user, db } = await requireSignedInUser(request)
    const items = Array.isArray(request.body?.items)
      ? request.body.items.slice(0, 50).map((item) => ({
          id: String(item.id ?? '').slice(0, 100),
          name: String(item.name ?? 'Product').slice(0, 120),
          quantity: Math.max(1, Math.min(Number(item.quantity) || 1, 20)),
          image: typeof item.image === 'string' && item.image.startsWith('https://')
            ? item.image.slice(0, 1000)
            : '',
        })).filter((item) => item.id)
      : []

    await db.collection('customerCarts').doc(user.uid).set({
      items,
      updatedAt: FieldValue.serverTimestamp(),
    })

    return response.status(200).json({ saved: true })
  } catch (error) {
    return sendApiError(response, error)
  }
}