// Product search requests go through the
// AskKhan server API.
//
// Keep supplier/API credentials on the server.
// Never expose private API keys in React.

export async function searchProducts(
  query,
  {
    category = 'All',
    start = 0,
  } = {}
) {
  const cleanQuery =
    String(query || '').trim()

  if (
    !cleanQuery &&
    category === 'All'
  ) {
    return {
      products: [],
      nextStart: null,
    }
  }

  const params =
    new URLSearchParams()

  params.set('q', cleanQuery)
  params.set('category', category)
  params.set(
    'start',
    String(start)
  )

  const response =
    await fetch(
      `/api/products?${params.toString()}`
    )

  let data

  try {
    data =
      await response.json()
  } catch {
    throw new Error(
      'Unable to read product search results'
    )
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
      'Unable to search products'
    )
  }

  return {
    products:
      Array.isArray(data?.products)
        ? data.products
        : [],

    nextStart:
      Number.isInteger(
        data?.nextStart
      )
        ? data.nextStart
        : null,
  }
}