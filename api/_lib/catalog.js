import { products as bundledProducts } from '../../src/data/products.js'
import { getProductPrice } from '../../src/utils/pricing.js'

export async function loadCatalog(db) {
  const productsById = new Map(
    bundledProducts.map((product) => [String(product.id), product]),
  )
  const snapshot = await db.collection('storeProducts').get()

  snapshot.forEach((document) => {
    const product = document.data()
    if (product.deleted) {
      productsById.delete(document.id)
      return
    }

    productsById.set(document.id, {
      ...productsById.get(document.id),
      ...product,
      id: document.id,
    })
  })

  return [...productsById.values()].map((product) => {
    const customerPrice = getProductPrice(product)
    return {
      ...product,
      price: customerPrice,
      askKhanPrice: customerPrice,
    }
  })
}
