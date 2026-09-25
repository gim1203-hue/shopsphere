export function getAskKhanPrice(sourcePrice) {
  const price = Number(sourcePrice)

  if (!Number.isFinite(price) || price < 0) {
    return 0
  }

  return Number((price * 1.1).toFixed(2))
}