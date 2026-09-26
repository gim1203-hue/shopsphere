// Keep provider credentials on the server; browser requests go through the API route.

export async function searchProducts(query, { category = 'All', start = 0 } = {}) {
  const cleanQuery = query.trim()

  if (!cleanQuery && category === 'All') {
    return []
  }

  const params = new URLSearchParams({
    q: cleanQuery,
    category,
    start: String(start),
  })
  const response = await fetch(
    `/api/products?${params}`
  )
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Unable to search products')
  }

  return {
    products: Array.isArray(data.products) ? data.products : [],
    nextStart: Number.isInteger(data.nextStart) ? data.nextStart : null,
  }
}
