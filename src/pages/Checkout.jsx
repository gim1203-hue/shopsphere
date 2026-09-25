import { ArrowLeft, LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { formatCurrency } from '../utils/format'

export default function Checkout() {
  const { cart, subtotal } = useStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const shipping = subtotal >= 100 ? 0 : 9

  async function beginCheckout() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart: cart.map(({ id, quantity, checkoutToken }) => ({ id, quantity, checkoutToken })) }),
      })
      const data = await response.json()
      if (!response.ok || !data.url) throw new Error(data.error || 'Unable to start checkout')
      window.location.assign(data.url)
    } catch (checkoutError) {
      setError(checkoutError.message)
      setLoading(false)
    }
  }

  if (!cart.length) return <section className="container checkout-empty"><h1>Your bag is empty.</h1><Link className="button dark" to="/shop">Return to shop</Link></section>

  return (
    <section className="checkout-page">
      <div className="container checkout-head"><Link to="/cart"><ArrowLeft size={16} /> Back to bag</Link><span className="logo">Ask<span>Khan</span><i>.</i></span><span><LockKeyhole size={15} /> Secure checkout</span></div>
      <div className="container checkout-grid">
        <div className="checkout-form">
          <span className="eyebrow">Secure payment</span><h1>Checkout.</h1>
          <fieldset><legend>Payment and delivery</legend><p className="demo-note">Stripe securely collects your email, delivery address, and payment information. AskKhan never receives or stores your card number.</p></fieldset>
          {error && <p className="checkout-error" role="alert">{error}</p>}
          <button className="button dark place-order" type="button" onClick={beginCheckout} disabled={loading}><LockKeyhole size={16} /> {loading ? 'Opening secure checkout…' : `Pay securely · ${formatCurrency(subtotal + shipping)}`}</button>
        </div>
        <aside className="checkout-summary">
          <h2>Your order</h2>
          {cart.map((item) => <div className="checkout-item" key={item.id}><div><img src={item.image} alt="" /><b>{item.quantity}</b></div><span><strong>{item.name}</strong><small>{item.color}</small></span><strong>{formatCurrency(item.price * item.quantity)}</strong></div>)}
          <div className="summary-lines"><p><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></p><p><span>Estimated delivery</span><strong>{shipping ? formatCurrency(shipping) : 'Complimentary'}</strong></p><p className="grand-total"><span>Estimated total</span><strong>{formatCurrency(subtotal + shipping)} <small>USD</small></strong></p><p><small>Final tax is calculated by Stripe.</small></p></div>
        </aside>
      </div>
    </section>
  )
}
