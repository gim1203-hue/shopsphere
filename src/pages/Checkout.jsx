import { ArrowLeft, LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { formatCurrency } from '../utils/format'
import { useAuth } from '../context/AuthContext'

export default function Checkout() {
  const { cart, subtotal } = useStore()
  const { session } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function beginCheckout() {
    if (!session) {
      setError('Sign in before checkout so your order and shipping history can be saved.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const token = await session.getIdToken()
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
      <div className="container checkout-head"><Link to="/cart"><ArrowLeft size={16} /> Back to bag</Link><span className="logo">Stop<span>Shop</span><i>.</i></span><span><LockKeyhole size={15} /> Secure checkout</span></div>
      <div className="container checkout-grid">
        <div className="checkout-form">
          <span className="eyebrow">Secure payment</span><h1>Checkout.</h1>
          <fieldset><legend>Payment and delivery</legend><p className="demo-note">Stripe securely collects your email, U.S. delivery address, and payment information. Sales tax is calculated from the delivery address. Card processing is included in the price, and StopShop never receives or stores your card number.</p></fieldset>
          {!session && <p className="demo-note">Please <Link to="/login">sign in</Link> before paying. This keeps your order, shipment dates, and delivery address in your account.</p>}
          {error && <p className="checkout-error" role="alert">{error}</p>}
          <button className="button dark place-order" type="button" onClick={beginCheckout} disabled={loading}><LockKeyhole size={16} /> {loading ? 'Opening secure checkout…' : `Continue securely · ${formatCurrency(subtotal)} before tax and shipping`}</button>
        </div>
        <aside className="checkout-summary">
          <h2>Your order</h2>
          {cart.map((item) => <div className="checkout-item" key={item.id}><div><img src={item.image} alt="" /><b>{item.quantity}</b></div><span><strong>{item.name}</strong><small>{item.color}</small></span><strong>{formatCurrency(item.price * item.quantity)}</strong></div>)}
          <div className="summary-lines"><p><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></p><p><span>Shipping</span><strong>Not included</strong></p><p><span>Sales tax</span><strong>Calculated by address</strong></p><p><span>Card processing</span><strong>Included</strong></p><p className="grand-total"><span>Subtotal before tax and shipping</span><strong>{formatCurrency(subtotal)} <small>USD</small></strong></p><p><small>Stripe shows the final sales tax and charged total before payment. Shipping is not charged during checkout.</small></p></div>
        </aside>
      </div>
    </section>
  )
}
