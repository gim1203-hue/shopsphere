import crypto from 'node:crypto'

const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url')

export function signProduct(product) {
  const secret = process.env.CHECKOUT_SIGNING_SECRET
  if (!secret) return null

  const payload = encode({
    id: product.id,
    name: product.name,
    sourcePrice: product.sourcePrice,
    image: product.image,
    source: product.brand,
  })
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

export function verifyProductToken(token) {
  const secret = process.env.CHECKOUT_SIGNING_SECRET
  if (!secret || typeof token !== 'string') return null

  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null

  const expected = crypto.createHmac('sha256', secret).update(payload).digest()
  const received = Buffer.from(signature, 'base64url')
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) return null

  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    return null
  }
}
