/*
  AskKhan live product search service.

  IMPORTANT:
  We will connect this to a real shopping/product
  search backend next.

  Do not put a private API key directly in this file
  because this React code runs in the customer's browser.
*/

export async function searchProducts(query) {
  const cleanQuery = query.trim()

  if (!cleanQuery) {
    return []
  }

  // Live product search will be connected here.
  return []
}