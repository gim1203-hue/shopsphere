const EMAIL_PATTERN = /[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+/i

export function emailAddress(value) {
  const match = String(value || '').trim().match(EMAIL_PATTERN)
  return match?.[0] || ''
}

