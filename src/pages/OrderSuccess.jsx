import { ArrowRight, Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useStore } from '../context/StoreContext'

export default function OrderSuccess() {
  const [params] = useSearchParams()
  const { clearCart } = useStore()
  const [receipt, setReceipt] = useState(null)
  const [error, setError] = useState('')
  const sessionId = params.get('session_id')

  useEffect(() => {
    if (!sessionId) {
      setError('No payment confirmation was provided.')
      return
    }

    let cancelled = false
    fetch(`/api/checkout-session?id=${encodeURIComponent(sessionId)}`)
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok || !data.paid) throw new Error(data.error || 'Payment is not confirmed yet.')
        return data
      })
      .then((data) => {
        if (!cancelled) {
          setReceipt(data)
          clearCart()
        }
      })
      .catch((confirmationError) => {
        if (!cancelled) setError(confirmationError.message)
      })

    return () => { cancelled = true }
  }, [clearCart, sessionId])

  if (error) return <section className="success-page container"><h1>Payment confirmation pending.</h1><p>{error} Check your Stripe receipt or return to checkout.</p><Link className="button dark" to="/checkout">Return to checkout</Link></section>
  if (!receipt) return <section className="success-page container"><p>Confirming your secure payment…</p></section>

  return <section className="success-page container"><div className="success-mark"><Check /></div><span className="eyebrow">Payment received</span><h1>Thank you.<br /><em>Your order is confirmed.</em></h1><p>Order {receipt.order}. A confirmation receipt has been sent{receipt.email ? ` to ${receipt.email}` : ' to your email'}.</p><Link className="button dark" to="/shop">Keep exploring <ArrowRight size={17} /></Link></section>
}
