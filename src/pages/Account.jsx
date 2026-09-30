import { ChevronDown, Heart, LogOut, Mail, MapPin, MessageCircle, MessageSquareText, Package, Phone, Plus, Printer, Save, Settings, Trash2, Truck, UserRound } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../context/StoreContext'
import { formatCurrency } from '../utils/format'

const blankAddress = { name: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'US' }
const showDate = (value) => value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'To be confirmed'
const money = (cents) => formatCurrency(Number(cents || 0) / 100)
const readApiResponse = async (response) => {
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return response.json()
  const message = (await response.text()).trim()
  throw new Error(message && !message.startsWith('<') ? message.slice(0, 300) : `Account service returned HTTP ${response.status}. Please try again.`)
}

export default function Account() {
  const { hash } = useLocation()
  const { user, profile, session, signOut, updateProfile } = useAuth()
  const { favoriteProducts, cartCount } = useStore()
  const [view, setView] = useState(hash === '#orders' ? 'orders' : hash === '#addresses' ? 'addresses' : 'profile')
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ first_name: profile?.first_name || '', last_name: profile?.last_name || '' })
  const [orders, setOrders] = useState([])
  const [addresses, setAddresses] = useState([])
  const [address, setAddress] = useState(blankAddress)
  const [addingAddress, setAddingAddress] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const accountFetch = useCallback(async (url, options = {}) => {
    const token = await session.getIdToken()
    return fetch(url, { ...options, headers: { ...options.headers, Authorization: `Bearer ${token}` } })
  }, [session])

  useEffect(() => {
    let active = true
    accountFetch('/api/customer-account').then(async (response) => {
      const data = await readApiResponse(response)
      if (!response.ok) throw new Error(data.error || 'Unable to load your account.')
      if (active) { setOrders(data.orders || []); setAddresses(data.addresses || []) }
    }).catch((reason) => active && setError(reason.message)).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [accountFetch])

  useEffect(() => {
    if (hash === '#orders') setView('orders')
    else if (hash === '#addresses') setView('addresses')
    else if (hash === '#profile') setView('profile')
  }, [hash])

  const chooseView = (next) => setView(next)
  const saveProfile = async (event) => { event.preventDefault(); setSaved(false); const result = await updateProfile(form); if (!result.error) { setEditing(false); setSaved(true) } }
  const saveAddress = async (event) => {
    event.preventDefault(); setError('')
    try {
      const response = await accountFetch('/api/customer-account', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(address) })
      const data = await readApiResponse(response)
      if (!response.ok) throw new Error(data.error || 'Unable to save address.')
      setAddresses((current) => [data, ...current]); setAddress(blankAddress); setAddingAddress(false)
    } catch (reason) { setError(reason.message) }
  }
  const removeAddress = async (id) => {
    try {
      const response = await accountFetch(`/api/customer-account?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      const data = await readApiResponse(response)
      if (!response.ok) throw new Error(data.error || 'Unable to remove address.')
      setAddresses((current) => current.filter((item) => item.id !== id))
    } catch (reason) { setError(reason.message) }
  }

  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'ShopSphere member'
  return <>
    <section className="account-hero"><div className="container"><span className="eyebrow light">Your space</span><h1>Welcome, <em>{name.split(' ')[0]}</em>.</h1><p>Everything you love, all in one considered place.</p></div></section>
    <section className="container account-dashboard">
      <aside className="account-nav">
        <button className={view === 'profile' ? 'active' : ''} onClick={() => chooseView('profile')}><UserRound /> Profile</button>
        <Link to="/favorites"><Heart /> Favorites <span>{favoriteProducts.length}</span></Link>
        <button className={view === 'orders' ? 'active' : ''} onClick={() => chooseView('orders')}><Package /> Orders <span>{orders.length || ''}</span></button>
        <button className={view === 'addresses' ? 'active' : ''} onClick={() => chooseView('addresses')}><MapPin /> Addresses <span>{addresses.length || ''}</span></button>
        <Link to="/admin"><Settings /> Dashboard</Link>
        <button onClick={signOut}><LogOut /> Sign out</button>
      </aside>
      <div className="account-content">
        {error && <p className="auth-error" role="alert">{error}</p>}
        {view === 'profile' && <Profile user={user} name={name} form={form} setForm={setForm} editing={editing} setEditing={setEditing} saved={saved} save={saveProfile} favoriteCount={favoriteProducts.length} cartCount={cartCount} />}
        {view === 'orders' && <Orders orders={orders} loading={loading} expanded={expandedOrder} setExpanded={setExpandedOrder} />}
        {view === 'addresses' && <Addresses addresses={addresses} loading={loading} adding={addingAddress} setAdding={setAddingAddress} address={address} setAddress={setAddress} save={saveAddress} remove={removeAddress} />}
      </div>
    </section>
  </>
}

function Profile({ user, name, form, setForm, editing, setEditing, saved, save, favoriteCount, cartCount }) {
  return <><section className="account-card"><div className="account-card-head"><div><span className="eyebrow">Personal details</span><h2>Your profile</h2></div>{!editing && <button onClick={() => setEditing(true)}>Edit</button>}</div>{editing ? <form className="profile-form" onSubmit={save}><div className="form-row"><label><span>First name</span><input value={form.first_name} onChange={(event) => setForm({ ...form, first_name: event.target.value })} required /></label><label><span>Last name</span><input value={form.last_name} onChange={(event) => setForm({ ...form, last_name: event.target.value })} required /></label></div><label><span>Email address</span><input value={user.email} disabled /></label><div className="profile-actions"><button type="button" onClick={() => setEditing(false)}>Cancel</button><button className="button dark"><Save size={15} /> Save changes</button></div></form> : <div className="profile-details"><div><span>Name</span><strong>{name}</strong></div><div><span>Email</span><strong>{user.email}</strong></div><div><span>Member since</span><strong>{new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong></div>{saved && <p className="auth-success">Your profile has been updated.</p>}</div>}</section><div className="account-stats"><Link to="/favorites"><Heart /><span><strong>{favoriteCount}</strong>Saved favorites</span></Link><Link to="/cart"><Package /><span><strong>{cartCount}</strong>Items in your bag</span></Link></div></>
}

function Orders({ orders, loading, expanded, setExpanded }) {
  if (loading) return <section className="account-card orders-card"><p className="account-muted">Loading orders…</p></section>

  return <section className="account-card orders-card">
    <div className="account-card-head"><div><span className="eyebrow">Purchase history & invoices</span><h2>Your orders</h2></div></div>
    {orders.length ? <div className="order-history">{orders.map((order) => {
      const orderNumber = order.number || order.id.slice(-10)
      const deliverySupport = `/support?type=Shipping+or+delivery&order=${encodeURIComponent(orderNumber)}`
      return <article className={`history-order${expanded === order.id ? ' invoice-open' : ''}`} key={order.id}>
        <button className="history-order-summary" onClick={() => setExpanded(expanded === order.id ? null : order.id)}><span><small>Order #{orderNumber}</small><strong>{showDate(order.createdAt)}</strong></span><span className={`order-status ${order.status || 'processing'}`}>{order.status || 'Processing'}</span><span><small>Total</small><strong>{money(order.amountTotal)}</strong></span><ChevronDown className={expanded === order.id ? 'rotated' : ''} /></button>
        {expanded === order.id && <div className="order-details">
          <header className="invoice-heading"><div><span className="eyebrow">StopShop invoice</span><h2>Invoice #{order.invoiceNumber || orderNumber}</h2><small>Order #{orderNumber} · Paid {showDate(order.createdAt)} · {order.email}</small></div><div className="invoice-actions"><button onClick={() => window.print()}><Printer size={15} /> Print / save invoice</button><Link to={`/support?type=Cancel+order&order=${encodeURIComponent(orderNumber)}`}>Cancel or get help</Link></div></header>
          <div className="shipment-timeline"><div className="complete"><i /><span>Ordered<strong>{showDate(order.createdAt)}</strong></span></div><div><i /><span>Order status<strong>{order.status || 'Processing'}</strong></span></div><div><i /><span>Estimated delivery<Link to={deliverySupport}><strong>Contact support</strong></Link></span></div></div>
          <div className="order-detail-grid"><div><h3><Package /> Purchased items</h3>{order.items?.map((item, index) => <p key={`${item.name}-${index}`}><span>{item.quantity} × {item.name}</span><strong>{money(item.amountTotal)}</strong></p>)}<p><span>Merchandise subtotal</span><strong>{money(order.amountSubtotal)}</strong></p><p><span>Shipping</span><strong>{order.amountShipping ? money(order.amountShipping) : 'Complimentary'}</strong></p><p><span>Sales tax</span><strong>{money(order.amountTax)}</strong></p><p><span>Card processing</span><strong>Included</strong></p><p className="invoice-total"><span>Invoice total</span><strong>{money(order.amountTotal)}</strong></p></div><div><h3><Truck /> Shipping details</h3><p><span>Ships from</span><strong>{order.shipsFrom}</strong></p><p><span>Ships to</span><strong>{formatOrderAddress(order.shippingAddress)}</strong></p><p><span>Payment status</span><strong>{order.paymentStatus}</strong></p></div></div>
          <div className="invoice-support"><h3><MessageCircle /> StopShop Customer Service</h3><p>Contact support for an estimated delivery date or help with this order.</p><div><a href="mailto:support@homedepo.tech"><Mail size={15} /> Email</a><a href="tel:+13477511551"><Phone size={15} /> Call</a><a href="sms:+13477511551"><MessageSquareText size={15} /> Text</a><Link to={deliverySupport}><MessageCircle size={15} /> Delivery help</Link></div></div>
        </div>}
      </article>
    })}</div> : <div className="empty-account-card"><Package /><h2>No orders yet</h2><p>Completed purchases and invoices will be saved here with payment and order status.</p><Link className="text-link" to="/shop">Browse the collection</Link></div>}
  </section>
}

function formatOrderAddress(address) {
  if (!address) return 'Address available on Stripe receipt'
  return [address.name, address.line1, address.line2, [address.city, address.state, address.postal_code].filter(Boolean).join(' '), address.country].filter(Boolean).join(', ')
}

function Addresses({ addresses, loading, adding, setAdding, address, setAddress, save, remove }) {
  const field = (key, label, options = {}) => <label className={options.wide ? 'wide' : ''}><span>{label}</span><input value={address[key]} maxLength={options.maxLength} onChange={(event) => setAddress({ ...address, [key]: options.upper ? event.target.value.toUpperCase() : event.target.value })} required={!options.optional} /></label>
  return <section className="account-card"><div className="account-card-head"><div><span className="eyebrow">Delivery details</span><h2>Shipping addresses</h2></div><button className="address-add" onClick={() => setAdding(!adding)}><Plus size={15} /> Add address</button></div>{adding && <form className="address-form" onSubmit={save}>{field('name', 'Full name')}{field('line1', 'Address line 1', { wide: true })}{field('line2', 'Apartment, suite, etc. (optional)', { wide: true, optional: true })}{field('city', 'City')}{field('state', 'State / province')}{field('postalCode', 'Postal code')}{field('country', 'Country code', { maxLength: 2, upper: true })}<div className="address-actions"><button type="button" onClick={() => setAdding(false)}>Cancel</button><button className="button dark"><Save size={15} /> Save address</button></div></form>}{loading ? <p className="account-muted">Loading addresses…</p> : addresses.length ? <div className="address-grid">{addresses.map((item) => <article className="saved-address" key={item.id}><MapPin /><div><strong>{item.name}</strong><span>{item.line1}{item.line2 ? `, ${item.line2}` : ''}</span><span>{item.city}, {item.state} {item.postalCode}</span><span>{item.country}</span></div><button onClick={() => remove(item.id)} aria-label={`Remove ${item.name}'s address`}><Trash2 /></button></article>)}</div> : !adding && <div className="empty-account-card"><MapPin /><h2>No saved addresses</h2><p>Add a shipping address to keep your delivery details handy.</p></div>}</section>
}
