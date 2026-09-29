import { FieldValue } from 'firebase-admin/firestore'
import { requireSignedInUser, sendApiError } from './_lib/firebaseAdmin.js'
import { invoiceNumber } from './_lib/order.js'

const clean = (value, limit = 120) => String(value || '').trim().slice(0, limit)

export default async function handler(request, response) {
  try {
    const { user, db } = await requireSignedInUser(request)
    const customer = db.collection('customers').doc(user.uid)

    if (request.method === 'GET') {
      const [ordersSnapshot, addressesSnapshot] = await Promise.all([
        customer.collection('orders').orderBy('createdAt', 'desc').limit(50).get(),
        customer.collection('addresses').orderBy('createdAt', 'desc').limit(20).get(),
      ])
      const serialize = (document) => {
        const data = document.data()
        return {
          id: document.id,
          ...data,
          invoiceNumber: data.invoiceNumber || invoiceNumber(document.id, data.createdAt?.toMillis?.() || data.createdAt || Date.now()),
          createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt || null,
          estimatedShipDate: data.estimatedShipDate?.toDate?.().toISOString() || data.estimatedShipDate || null,
          estimatedDeliveryDate: data.estimatedDeliveryDate?.toDate?.().toISOString() || data.estimatedDeliveryDate || null,
        }
      }
      return response.status(200).json({
        orders: ordersSnapshot.docs.map(serialize),
        addresses: addressesSnapshot.docs.map(serialize),
      })
    }

    if (request.method === 'POST') {
      const address = {
        name: clean(request.body?.name),
        line1: clean(request.body?.line1),
        line2: clean(request.body?.line2),
        city: clean(request.body?.city),
        state: clean(request.body?.state),
        postalCode: clean(request.body?.postalCode, 30),
        country: clean(request.body?.country, 2).toUpperCase(),
      }
      if (!address.name || !address.line1 || !address.city || !address.state || !address.postalCode || !address.country) {
        return response.status(400).json({ error: 'Complete all required address fields.' })
      }
      const document = await customer.collection('addresses').add({ ...address, createdAt: FieldValue.serverTimestamp() })
      return response.status(201).json({ id: document.id, ...address, createdAt: new Date().toISOString() })
    }

    if (request.method === 'DELETE') {
      const id = clean(request.query?.id, 100)
      if (!id) return response.status(400).json({ error: 'Address id is required.' })
      await customer.collection('addresses').doc(id).delete()
      return response.status(200).json({ removed: true })
    }

    response.setHeader('Allow', 'GET, POST, DELETE')
    return response.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    return sendApiError(response, error)
  }
}
