import { ArrowLeft, LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { formatCurrency } from '../utils/format'

const initialForm = { email: '', firstName: '', lastName: '', address: '', city: '', state: '', zip: '', country: 'United States', card: '', expiry: '', cvc: '' }

export default function Checkout() {
  const { cart, subtotal, clearCart } = useStore()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const shipping = subtotal >= 100 ? 0 : 9
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })
  const submit = (event) => {
    event.preventDefault()
    const next = {}
    Object.entries(form).forEach(([key, value]) => { if (!value.trim()) next[key] = 'Required' })
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email'
    if (form.card.replace(/\s/g, '').length < 16) next.card = 'Enter a 16-digit card number'
    setErrors(next)
    if (!Object.keys(next).length) { const order = `SS-${Date.now().toString().slice(-6)}`; clearCart(); navigate('/order-success', { state: { order, email: form.email } }) }
  }
  if (!cart.length) return <section className="container checkout-empty"><h1>Your bag is empty.</h1><Link className="button dark" to="/shop">Return to shop</Link></section>
  const field = (name, label, options = {}) => <label className={errors[name] ? 'has-error' : ''}><span>{label}</span><input name={name} value={form[name]} onChange={update} {...options} />{errors[name] && <small>{errors[name]}</small>}</label>
  return <section className="checkout-page"><div className="container checkout-head"><Link to="/cart"><ArrowLeft size={16} /> Back to bag</Link><span className="logo">shop<span>sphere</span><i>.</i></span><span><LockKeyhole size={15} /> Secure checkout</span></div><form className="container checkout-grid" onSubmit={submit} noValidate><div className="checkout-form"><span className="eyebrow">One last step</span><h1>Checkout.</h1><fieldset><legend>Contact</legend>{field('email', 'Email address', { type: 'email', placeholder: 'you@example.com' })}</fieldset><fieldset><legend>Delivery address</legend><div className="form-row">{field('firstName', 'First name')}{field('lastName', 'Last name')}</div>{field('address', 'Street address')}<div className="form-row three">{field('city', 'City')}{field('state', 'State')}{field('zip', 'ZIP code')}</div><label><span>Country</span><select name="country" value={form.country} onChange={update}><option>United States</option><option>Canada</option><option>United Kingdom</option></select></label></fieldset><fieldset><legend>Payment</legend><p className="demo-note">Demo checkout — use any 16-digit card number. No payment will be processed.</p>{field('card', 'Card number', { inputMode: 'numeric', placeholder: '4242 4242 4242 4242', maxLength: 19 })}<div className="form-row">{field('expiry', 'Expiry', { placeholder: 'MM / YY' })}{field('cvc', 'Security code', { placeholder: 'CVC', maxLength: 4 })}</div></fieldset><button className="button dark place-order" type="submit"><LockKeyhole size={16} /> Place order · {formatCurrency(subtotal + shipping)}</button></div><aside className="checkout-summary"><h2>Your order</h2>{cart.map((item) => <div className="checkout-item" key={item.id}><div><img src={item.image} alt="" /><b>{item.quantity}</b></div><span><strong>{item.name}</strong><small>{item.color}</small></span><strong>{formatCurrency(item.price * item.quantity)}</strong></div>)}<div className="summary-lines"><p><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></p><p><span>Delivery</span><strong>{shipping ? formatCurrency(shipping) : 'Complimentary'}</strong></p><p className="grand-total"><span>Total</span><strong>{formatCurrency(subtotal + shipping)} <small>USD</small></strong></p></div></aside></form></section>
}
