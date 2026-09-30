import { products } from '../src/data/products.js'
import { loadCatalog } from './_lib/catalog.js'
import { getFirebaseServices } from './_lib/firebaseAdmin.js'

const escapeXml = (value) => String(value).replace(/[<>&'"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[character]))

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return response.status(405).end('Method not allowed')
  }

  let catalog = products
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const { db } = getFirebaseServices()
      catalog = await loadCatalog(db)
    } catch {
      catalog = products
    }
  }

  const baseUrl = 'https://www.homedepo.tech'
  const urls = ['/', '/shop', ...catalog.map((product) => `/products/${encodeURIComponent(product.id)}`)]
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((path) => `<url><loc>${escapeXml(`${baseUrl}${path}`)}</loc></url>`).join('')}</urlset>`
  response.setHeader('Content-Type', 'application/xml; charset=utf-8')
  response.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600')
  return response.status(200).send(xml)
}
