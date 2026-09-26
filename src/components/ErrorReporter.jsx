import { useEffect } from 'react'
import { reportClientError } from '../services/errorReporting'

export default function ErrorReporter() {
  useEffect(() => {
    const onError = (event) => reportClientError(event.error || event.message, 'browser')
    const onRejection = (event) => reportClientError(event.reason, 'unhandled-rejection')
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  return null
}