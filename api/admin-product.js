import { FieldValue } from 'firebase-admin/firestore'
import { randomUUID } from 'node:crypto'
import { requireAdmin, sendApiError } from './_lib/firebaseAdmin.js'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { db } = await requireAdmin(request)
    const { action, product: input } = request.body || {}
    const id = String(input?.id || randomUUID()).slice(0, 100)

    if (action === 'delete') {
      await db.collection('storeProducts').doc(id).set({
        deleted: true,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true })
      return response.status(200).json({ id, deleted: true })
    }

    const name = String(input?.name || '').trim().slice(0, 120)
    const category = String(input?.category || '').trim().slice(0, 60)
    const image = String(input?.image || '').trim().slice(0, 1000)
    const price = Number(input?.price)
    const stock = Math.max(0, Math.min(Math.floor(Number(input?.stock) || 0), 100000))

    if (!name || !category || !Number.isFinite(price) || price < 0.5 || price > 100000 || !/^https:\/\//i.test(image)) {
      return response.status(400).json({ error: 'Enter a name, category, valid price, and HTTPS image URL.' })
    }

    const product = {
      id,
      name,
      category,
      image,
      price: Number(price.toFixed(2)),
      sourcePrice: Number(price.toFixed(2)),
      stock,
      description: String(input.description || '').trim().slice(0, 1500),
      color: String(input.color || '').trim().slice(0, 80),
      featured: Boolean(input.featured),
      deleted: false,
      updatedAt: FieldValue.serverTimestamp(),
    }

    await db.collection('storeProducts').doc(id).set(product, { merge: true })
    return response.status(200).json({ product: { ...product, updatedAt: undefined } })
  } catch (error) {
    return sendApiError(response, error)
  }
}