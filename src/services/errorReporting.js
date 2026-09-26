import { firebaseAuth } from '../lib/supabase'

export function reportClientError(error, source = 'browser') {
  if (typeof window === 'undefined') return
  const message = String(error?.message || error || 'Unspecified browser error').slice(0, 1000)
  const key = `shopsphere-error-${message.slice(0, 120)}`

  try {
    const previous = Number(sessionStorage.getItem(key) || 0)
    if (Date.now() - previous < 30000) return
    sessionStorage.setItem(key, String(Date.now()))
  } catch {
    // Continue reporting when browser storage is unavailable.
  }

  const tokenPromise = firebaseAuth?.currentUser?.getIdToken().catch(() => '') || Promise.resolve('')
  tokenPromise.then((token) => fetch('/api/error-report', {
    method: 'POST',
    keepalive: true,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      source,
      message,
      stack: String(error?.stack || '').slice(0, 6000),
      page: window.location.pathname,
    }),
  })).catch(() => {})
}