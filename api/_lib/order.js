export function invoiceNumber(sessionId, createdAt = Date.now()) {
  const date = new Date(typeof createdAt === 'number' && createdAt < 1000000000000 ? createdAt * 1000 : createdAt)
  const datePart = Number.isNaN(date.getTime()) ? new Date().toISOString().slice(0, 10).replaceAll('-', '') : date.toISOString().slice(0, 10).replaceAll('-', '')
  const reference = String(sessionId || '').replace(/[^a-z0-9]/gi, '').slice(-8).toUpperCase().padStart(8, '0')
  return `AK-${datePart}-${reference}`
}

