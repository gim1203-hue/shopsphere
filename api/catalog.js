import { getFirebaseServices } from './_lib/firebaseAdmin.js'
import { loadCatalog } from './_lib/catalog.js'

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { db } = getFirebaseServices()
    const products = await loadCatalog(db)
    response.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120')
    return response.status(200).json({ products })
  } catch (error) {
    if (error.statusCode) {
      return response.status(error.statusCode).json({ products: [] })
    }
    console.error('Catalog load failed:', error.message)
    return response.status(200).json({ products: [] })
  }
}