export function getStopShopPrice(sourcePrice) {
  const price = Number(sourcePrice)

  if (!Number.isFinite(price) || price < 0) {
    return 0
  }

  return Number((price * 1.1).toFixed(2))
}

export function getProductPrice(product = {}) {
  const explicitCustomerPrice = Number(product.askKhanPrice)
  if (Number.isFinite(explicitCustomerPrice) && explicitCustomerPrice >= 0) {
    return explicitCustomerPrice
  }

  const sourcePrice = Number(product.sourcePrice)
  if (Number.isFinite(sourcePrice) && sourcePrice >= 0) {
    return getStopShopPrice(sourcePrice)
  }

  const listedPrice = Number(product.price)
  return Number.isFinite(listedPrice) && listedPrice >= 0 ? listedPrice : 0
}
