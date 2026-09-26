const ALLOWED_METHODS = new Set(['GET'])
import { signProduct } from './_lib/productToken.js'
import { recordErrorReport } from './_lib/firebaseAdmin.js'

export default async function handler(request, response) {
  if (!ALLOWED_METHODS.has(request.method)) {
    response.setHeader('Allow', 'GET')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const query = String(request.query.q || '').trim().slice(0, 120)

  if (query.length < 2) {
    return response.status(400).json({ error: 'Enter at least two characters' })
  }

  const apiKey = process.env.SERPAPI_KEY

  if (!apiKey) {
    return response.status(503).json({ error: 'Product search is not configured' })
  }

  const url = new URL('https://serpapi.com/search.json')
  url.searchParams.set('engine', 'google_shopping')
  url.searchParams.set('q', query)
  url.searchParams.set('api_key', apiKey)
  url.searchParams.set('gl', 'us')
  url.searchParams.set('hl', 'en')

  try {
    const serpResponse = await fetch(url, { signal: AbortSignal.timeout(10000) })
    const data = await serpResponse.json()

    if (!serpResponse.ok || data.error) {
      throw new Error(data.error || 'Product provider request failed')
    }

    const products = (data.shopping_results || []).slice(0, 24).map((item, index) => ({
      id: `live-${item.product_id || item.position || index}`,
      name: item.title || 'Marketplace product',
      category: 'Marketplace',
      brand: item.source || 'Online retailer',
      sourcePrice: Number(item.extracted_price || 0),
      rating: Number(item.rating || 0),
      reviews: Number(item.reviews || 0),
      image: item.thumbnail,
      externalUrl: item.product_link || item.link,
      stock: 1,
      featured: false,
      description: item.snippet || `Available from ${item.source || 'an online retailer'}.`,
      details: ['Live marketplace result', item.delivery].filter(Boolean),
      tags: [query, item.source, 'live product'].filter(Boolean),
    })).filter((item) => item.name && item.image && item.sourcePrice > 0)
      .map((item) => ({ ...item, checkoutToken: signProduct(item) }))

    response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    return response.status(200).json({ products })
  } catch (error) {
    console.error('SerpApi product search failed:', error.message)
    await recordErrorReport({ source: 'product-search', message: error.message }).catch(() => {})
    return response.status(502).json({ error: 'Live product search is temporarily unavailable' })
  }
}
