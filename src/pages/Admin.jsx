import { createElement, useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ExternalLink, Mail, MapPin, MessageCircle, Package, Paperclip, Plus, ReceiptText, RefreshCw, Search, ShieldCheck, Store, Trash2, Users, Wallet, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCatalog } from '../context/CatalogContext'
import { formatCurrency } from '../utils/format'

const emptyData = { customers: [], orders: [], products: [], messages: [], inboundEmails: [], supportRequests: [], errorReports: [], customerNextCursor: null, orderNextCursor: null, errorNextCursor: null, integrations: null }
const newProduct = () => ({ id: '', name: '', category: '', price: '', stock: '', image: '', description: '', color: '', measurements: '', sellerName: '', sellerContact: '', sellerEmail: '', featured: false })

async function adminRequest(session, endpoint, { method = 'GET', body } = {}) {
  const token = await session.getIdToken()
  const response = await fetch(endpoint, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Admin request failed')
  return data
}

function displayDate(value) {
  const date = typeof value === 'number' ? new Date(value * 1000) : new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()
}

function displayAddress(address) {
  if (!address) return 'Shipping address will appear after successful payment confirmation.'
  return [address.name, address.line1, address.line2, [address.city, address.state, address.postal_code || address.postalCode].filter(Boolean).join(' '), address.country].filter(Boolean).join(', ')
}

export default function Admin() {
  const { session } = useAuth()
  const { refreshCatalog } = useCatalog()
  const [data, setData] = useState(emptyData)
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [productForm, setProductForm] = useState(null)
  const [messageCustomer, setMessageCustomer] = useState(null)
  const [messageForm, setMessageForm] = useState({ subject: '', text: '' })
  const [supportReplies, setSupportReplies] = useState({})
  const [mailboxView, setMailboxView] = useState('new')
  const [supportView, setSupportView] = useState('new')

  const loadData = useCallback(async () => {
    setError('')
    try {
      const nextData = await adminRequest(session, '/api/admin-data')
      setData(nextData)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (session) loadData()
  }, [loadData, session])

  useEffect(() => {
    if (tab !== 'support' || !session) return undefined
    const timer = setInterval(loadData, 15000)
    return () => clearInterval(timer)
  }, [loadData, session, tab])

  const matchingCustomers = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return data.customers
    return data.customers.filter((customer) => `${customer.name} ${customer.email}`.toLowerCase().includes(query))
  }, [data.customers, search])

  const paidOrders = data.orders.filter((order) => order.paymentStatus === 'paid' && !order.refunded)
  const paidTotal = paidOrders.reduce((total, order) => total + order.amount, 0)

  async function refresh() {
    setLoading(true)
    await loadData()
  }

  async function loadMore(collection) {
    const settings = {
      customers: ['customerNextCursor', 'customers', 'customerCursor'],
      orders: ['orderNextCursor', 'orders', 'orderCursor'],
      errors: ['errorNextCursor', 'errorReports', 'errorCursor'],
    }
    const [cursorKey, dataKey, queryKey] = settings[collection]
    const cursor = data[cursorKey]
    if (!cursor) return
    setLoadingMore(true)
    setError('')
    try {
      const page = await adminRequest(session, `/api/admin-data?${queryKey}=${encodeURIComponent(cursor)}`)
      setData((current) => ({
        ...current,
        [dataKey]: [...current[dataKey], ...page[dataKey]],
        customerNextCursor: page.customerNextCursor,
        orderNextCursor: page.orderNextCursor,
        errorNextCursor: page.errorNextCursor,
      }))
    } catch (pageError) {
      setError(pageError.message)
    } finally {
      setLoadingMore(false)
    }
  }

  async function issueRefund(order) {
    if (!window.confirm(`Issue a full refund for ${order.id}?`)) return
    setWorking(true)
    setError('')
    try {
      await adminRequest(session, '/api/admin-refund', { method: 'POST', body: { sessionId: order.id } })
      setNotice('Refund submitted to Stripe.')
      await loadData()
    } catch (actionError) {
      setError(actionError.message)
    } finally {
      setWorking(false)
    }
  }

  async function saveProduct(event) {
    event.preventDefault()
    setWorking(true)
    setError('')
    try {
      await adminRequest(session, '/api/admin-product', { method: 'POST', body: { action: 'save', product: productForm } })
      await refreshCatalog()
      setProductForm(null)
      setNotice('Product saved to the live catalog.')
      await loadData()
    } catch (actionError) {
      setError(actionError.message)
    } finally {
      setWorking(false)
    }
  }

  async function deleteProduct(product) {
    if (!window.confirm(`Remove ${product.name} from the storefront?`)) return
    setWorking(true)
    setError('')
    try {
      await adminRequest(session, '/api/admin-product', { method: 'POST', body: { action: 'delete', product: { id: product.id } } })
      await refreshCatalog()
      setNotice('Product removed from the storefront.')
      await loadData()
    } catch (actionError) {
      setError(actionError.message)
    } finally {
      setWorking(false)
    }
  }

  async function sendMessage(event) {
    event.preventDefault()
    setWorking(true)
    setError('')
    try {
      await adminRequest(session, '/api/admin-message', {
        method: 'POST',
        body: { uid: messageCustomer.uid, ...messageForm },
      })
      setMessageCustomer(null)
      setMessageForm({ subject: '', text: '' })
      setNotice(`Email sent to ${messageCustomer.email}.`)
      await loadData()
    } catch (actionError) {
      setError(actionError.message)
    } finally {
      setWorking(false)
    }
  }

  async function replyToSupport(ticket, close = false) {
    const text = String(supportReplies[ticket.id] || '').trim()
    if (!close && !text) return
    setWorking(true)
    setError('')
    try {
      const result = await adminRequest(session, '/api/admin-support', { method: 'POST', body: { ticketId: ticket.id, text, close } })
      setSupportReplies((current) => ({ ...current, [ticket.id]: '' }))
      setNotice(close ? 'Support conversation closed.' : result.emailSent ? 'Reply added to chat and sent by email.' : `Reply added to chat. Email warning: ${result.emailError}`)
      await loadData()
    } catch (actionError) {
      setError(actionError.message)
    } finally {
      setWorking(false)
    }
  }

  async function reopenSupport(ticket) {
    setWorking(true)
    setError('')
    try {
      await adminRequest(session, '/api/admin-support', { method: 'POST', body: { ticketId: ticket.id, reopen: true } })
      setNotice('Support conversation moved to New / Active.')
      setSupportView('new')
      await loadData()
    } catch (actionError) {
      setError(actionError.message)
    } finally {
      setWorking(false)
    }
  }

  async function updateInboundEmail(email, action) {
    if (action === 'delete' && !window.confirm(`Delete “${email.subject}” from this dashboard?`)) return
    setWorking(true)
    setError('')
    try {
      await adminRequest(session, '/api/admin-inbound-email', { method: 'POST', body: { emailId: email.id, action } })
      setNotice(action === 'delete' ? 'Email deleted from the store dashboard.' : action === 'mark_read' ? 'Email moved to Old.' : 'Email moved to New.')
      await loadData()
    } catch (actionError) {
      setError(actionError.message)
    } finally {
      setWorking(false)
    }
  }

  if (loading && !data.customers.length && !error) {
    return <section className="container admin-loading">Loading store management…</section>
  }

  if (error && !data.integrations) {
    return <section className="container admin-denied"><ShieldCheck /><h1>Store management unavailable</h1><p>{error}</p><button type="button" className="button dark" onClick={refresh}>Try again</button></section>
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Wallet },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'orders', label: 'Orders & payments', icon: Package },
    { id: 'support', label: 'Live support', icon: MessageCircle },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'messages', label: 'Messages', icon: Mail },
    { id: 'errors', label: 'Errors', icon: AlertTriangle },
  ]

  async function resolveError(report) {
    setWorking(true)
    setError('')
    try {
      await adminRequest(session, '/api/admin-error', { method: 'POST', body: { reportId: report.id } })
      setNotice('Error report marked resolved.')
      await loadData()
    } catch (actionError) {
      setError(actionError.message)
    } finally {
      setWorking(false)
    }
  }

  return (
    <section className="admin-page">
      <div className="container">
        <header className="admin-heading">
          <div><span className="eyebrow">PRIVATE STORE TOOLS</span><h1>Store management</h1><p>Customers, catalog, orders, and support.</p></div>
          <button type="button" className="admin-refresh" onClick={refresh} disabled={loading}><RefreshCw size={16} /> Refresh</button>
        </header>

        {(error || notice) && <p className={error ? 'admin-alert error' : 'admin-alert'} role="status">{error || notice}</p>}

        <nav className="admin-tabs" aria-label="Store management sections">
          {tabs.map((item) => <button type="button" key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => setTab(item.id)}>{createElement(item.icon, { size: 17 })}{item.label}</button>)}
        </nav>

        {tab === 'overview' && <>
          <div className="admin-metrics">
            <article><span>Registered customers</span><strong>{data.customers.length}</strong><small>Firebase accounts</small></article>
            <article><span>Net paid orders</span><strong>{paidOrders.length}</strong><small>Recent Stripe sessions, excluding refunds</small></article>
            <article><span>Gross payments</span><strong>{formatCurrency(paidTotal / 100)}</strong><small>Before refunds and fees</small></article>
            <article><span>Products</span><strong>{data.products.length}</strong><small>Live catalog items</small></article>
          </div>
          <div className="admin-overview-grid">
            <section className="admin-panel"><div className="admin-panel-heading"><h2>Recent payments</h2><button type="button" onClick={() => setTab('orders')}>All orders</button></div>
              {data.orders.slice(0, 6).map((order) => <div className="admin-list-row" key={order.id}><span><strong>{order.email || 'Guest checkout'}</strong><small>{displayDate(order.createdAt)}</small></span><span className={`admin-status ${order.refunded ? 'refunded' : order.paymentStatus}`}>{order.refunded ? 'refunded' : order.paymentStatus}</span><strong>{formatCurrency(order.amount / 100)}</strong></div>)}
              {!data.orders.length && <p className="admin-empty">No Stripe checkouts are available yet.</p>}
            </section>
            <section className="admin-panel"><div className="admin-panel-heading"><h2>Connected services</h2></div>
              <div className="admin-service-row"><span>Firebase customers and carts</span><strong className="connected">Connected</strong></div>
              <div className="admin-service-row"><span>Stripe payment management</span><strong className={data.integrations.stripe ? 'connected' : 'disconnected'}>{data.integrations.stripe ? 'Connected' : 'Needs setup'}</strong></div>
              <div className="admin-service-row"><span>Automatic paid-order saving</span><strong className={data.integrations.stripeWebhook ? 'connected' : 'disconnected'}>{data.integrations.stripeWebhook ? 'Connected' : 'Needs webhook'}</strong></div>
              <div className="admin-service-row"><span>Customer email</span><strong className={data.integrations.email ? 'connected' : 'disconnected'}>{data.integrations.email ? 'Connected' : 'Needs setup'}</strong></div>
              <div className="admin-service-row"><span>Paid-order fulfillment email</span><strong className={data.integrations.fulfillmentEmail ? 'connected' : 'disconnected'}>{data.integrations.fulfillmentEmail ? 'Connected' : 'Needs setup'}</strong></div>
              <p className="admin-note">Email replies go to your configured support inbox.</p>
            </section>
          </div>
        </>}

        {tab === 'customers' && <section className="admin-panel">
          <div className="admin-panel-heading"><div><h2>Customers</h2><p>Signed-in accounts and their most recently synced carts.</p></div><label className="admin-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find by name or email" /></label></div>
          <div className="admin-table-wrap"><table><thead><tr><th>Customer</th><th>Joined</th><th>Cart</th><th>Items</th><th /></tr></thead><tbody>
            {matchingCustomers.map((customer) => <tr key={customer.uid}><td><strong>{customer.name || 'Customer'}</strong><small>{customer.email}</small></td><td>{displayDate(customer.createdAt)}</td><td>{customer.cart.map((item) => `${item.name} ×${item.quantity}`).join(', ') || 'Cart empty / not synced'}</td><td>{customer.cart.reduce((count, item) => count + item.quantity, 0)}</td><td><button type="button" className="admin-small-button" disabled={!customer.email} onClick={() => { setMessageCustomer(customer); setTab('messages') }}>Email</button></td></tr>)}
          </tbody></table></div>
          {data.customerNextCursor && <button type="button" className="admin-small-button" disabled={loadingMore} onClick={() => loadMore('customers')}>{loadingMore ? 'Loading…' : 'Load more customers'}</button>}
          {!matchingCustomers.length && <p className="admin-empty">No customers match that search.</p>}
        </section>}

        {tab === 'orders' && <section className="admin-panel">
          <div className="admin-panel-heading"><div><h2>Orders & payments</h2><p>Stripe Checkout sessions, receipts, refunds, and private fulfillment details.</p></div><div className="admin-heading-actions">{data.integrations.stripe && <a className="admin-small-button" href="https://dashboard.stripe.com/" target="_blank" rel="noreferrer">Open Stripe dashboard <ExternalLink size={14} /></a>}<a className="admin-small-button" href="https://resend.com/emails" target="_blank" rel="noreferrer">Open Resend <ExternalLink size={14} /></a></div></div>
          {!data.integrations.stripe && <p className="admin-alert">Add the Stripe secret key to the server environment to view and refund payments.</p>}
          <div className="admin-table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Payment</th><th>Total</th><th>Action</th></tr></thead><tbody>
            {data.orders.map((order) => <tr key={order.id}><td><code>{order.id.slice(-12)}</code></td><td>{order.email || 'Guest checkout'}</td><td>{displayDate(order.createdAt)}</td><td><span className={`admin-status ${order.refunded ? 'refunded' : order.paymentStatus}`}>{order.refunded ? 'refunded' : order.paymentStatus}</span></td><td>{formatCurrency(order.amount / 100)}</td><td>{order.paymentStatus === 'paid' && !order.refunded ? <button type="button" className="admin-small-button danger" disabled={working} onClick={() => issueRefund(order)}>Full refund</button> : order.refunded ? 'Refund complete' : '—'}</td></tr>)}
          </tbody></table></div>
          {data.orderNextCursor && <button type="button" className="admin-small-button" disabled={loadingMore} onClick={() => loadMore('orders')}>{loadingMore ? 'Loading…' : 'Load more payments'}</button>}
          <div className="admin-fulfillment-list">{data.orders.filter((order) => order.paymentStatus === 'paid').map((order) => <details className="admin-fulfillment-detail" key={`fulfillment-${order.id}`}>
            <summary><span><strong>{order.name || 'Customer'}</strong><small>{order.email || 'Email unavailable'} · Order {order.id.slice(-12)}</small></span><span className="admin-status pending">{String(order.fulfillmentStatus || 'processing').replaceAll('_', ' ')}</span></summary>
            <div className="admin-fulfillment-grid">
              <article><h4><MapPin size={17} /> Customer and delivery</h4><p><span>Name</span><strong>{order.name || 'Not provided'}</strong></p><p><span>Email</span><strong>{order.email || 'Not provided'}</strong></p><p><span>Phone</span><strong>{order.phone || 'Not provided'}</strong></p><p><span>Ship to</span><strong>{displayAddress(order.shippingAddress)}</strong></p></article>
              <article><h4><Store size={17} /> Products to purchase</h4>{order.items?.length ? order.items.map((item, index) => <div className="admin-merchant-item" key={`${item.productId}-${index}`}><img src={item.image} alt="" /><div><strong>{item.quantity} × {item.name}</strong><span>Merchant: {item.merchantName || 'Not provided'}</span><span>Supplier cost: {formatCurrency(Number(item.sourcePrice || 0))} each</span>{item.merchantEmail && <span>Email: {item.merchantEmail}</span>}{item.merchantContact && <span>Contact: {item.merchantContact}</span>}{item.purchaseUrl ? <a href={item.purchaseUrl} target="_blank" rel="noreferrer">Open merchant product <ExternalLink size={14} /></a> : <span>Merchant product link unavailable</span>}</div></div>) : <p>No private item details were stored for this older order.</p>}</article>
            </div>
            <div className="admin-receipt-actions">{order.paymentIntent && <a className="admin-primary" href={order.stripeUrl} target="_blank" rel="noreferrer">Open payment in Stripe <ExternalLink size={14} /></a>}{order.receiptUrl && <a className="admin-small-button" href={order.receiptUrl} target="_blank" rel="noreferrer"><ReceiptText size={14} /> Customer receipt</a>}</div>
            <div className="admin-receipt-lines">{order.receiptItems?.map((item, index) => <p key={`${item.name}-${index}`}><span>{item.quantity} × {item.name}</span><strong>{formatCurrency(item.amount / 100)}</strong></p>)}<p className="total"><span>Paid total</span><strong>{formatCurrency(order.amount / 100)}</strong></p></div>
            <p className="admin-note">Supplier costs and merchant links are private and do not appear on the customer invoice.</p>
          </details>)}</div>
          {!data.orders.length && <p className="admin-empty">No payment sessions found.</p>}
        </section>}

        {tab === 'support' && <div className="admin-support-layout">
          <section className="admin-panel admin-support-compose">
            <div className="admin-panel-heading"><div><h2>Contact an existing customer</h2><p>Select a registered customer and send an email without leaving Live Support.</p></div></div>
            <form className="admin-message-form" onSubmit={sendMessage}><label>Customer<select value={messageCustomer?.uid || ''} onChange={(event) => { const customer = data.customers.find((item) => item.uid === event.target.value); setMessageCustomer(customer || null) }}><option value="">Choose a customer</option>{data.customers.filter((customer) => customer.email).map((customer) => <option value={customer.uid} key={customer.uid}>{customer.name || 'Customer'} — {customer.email}</option>)}</select></label><label>Subject<input required maxLength="160" disabled={!messageCustomer} value={messageForm.subject} onChange={(event) => setMessageForm({ ...messageForm, subject: event.target.value })} placeholder="How can we help?" /></label><label>Message<textarea required rows="4" maxLength="6000" disabled={!messageCustomer} value={messageForm.text} onChange={(event) => setMessageForm({ ...messageForm, text: event.target.value })} placeholder="Write your message to the customer…" /></label><div><button type="submit" className="admin-primary" disabled={working || !messageCustomer || !messageForm.subject.trim() || !messageForm.text.trim()}><Mail size={16} /> Send email</button></div></form>
          </section>
          <section className="admin-panel">
            <div className="admin-panel-heading"><div><h2>Customer help inbox</h2><p>New and active conversations stay separate from old, closed requests.</p></div><span className="admin-status pending">{data.supportRequests.filter((ticket) => ticket.status !== 'closed').length} active</span></div>
            <div className="admin-support-filters" role="tablist" aria-label="Support conversation categories"><button type="button" className={supportView === 'new' ? 'active' : ''} onClick={() => setSupportView('new')}>New / Active <span>{data.supportRequests.filter((ticket) => ticket.status !== 'closed').length}</span></button><button type="button" className={supportView === 'old' ? 'active' : ''} onClick={() => setSupportView('old')}>Old / Closed <span>{data.supportRequests.filter((ticket) => ticket.status === 'closed').length}</span></button></div>
            <div className="admin-support-list">{data.supportRequests.filter((ticket) => supportView === 'new' ? ticket.status !== 'closed' : ticket.status === 'closed').map((ticket) => <article className="admin-support-ticket" key={ticket.id}><header><div><strong>{ticket.type}</strong><small>{ticket.email || 'No email'} {ticket.orderNumber ? `· Order ${ticket.orderNumber}` : ''} · {displayDate(ticket.updatedAt || ticket.createdAt)}</small></div><span className={`admin-status ${ticket.status === 'closed' ? 'paid' : 'pending'}`}>{ticket.status.replaceAll('_', ' ')}</span></header><div className="admin-support-thread">{(ticket.conversation?.length ? ticket.conversation : [{ sender: 'customer', text: ticket.message }]).map((entry, index) => <p className={entry.sender === 'support' ? 'support' : 'customer'} key={`${ticket.id}-${index}`}><small>{entry.sender === 'support' ? 'You' : 'Customer'}</small>{entry.text}</p>)}</div>{ticket.status !== 'closed' ? <div className="admin-support-reply"><textarea rows="3" value={supportReplies[ticket.id] || ''} onChange={(event) => setSupportReplies((current) => ({ ...current, [ticket.id]: event.target.value }))} placeholder="Reply to the customer…" /><div><button type="button" className="admin-small-button" disabled={working} onClick={() => replyToSupport(ticket, true)}>Move to Old</button><button type="button" className="admin-primary" disabled={working || !String(supportReplies[ticket.id] || '').trim()} onClick={() => replyToSupport(ticket)}><Mail size={15} /> Send reply</button></div></div> : <footer className="admin-support-old-actions"><button type="button" className="admin-small-button" disabled={working} onClick={() => reopenSupport(ticket)}>Reopen conversation</button></footer>}</article>)}{!data.supportRequests.some((ticket) => supportView === 'new' ? ticket.status !== 'closed' : ticket.status === 'closed') && <p className="admin-empty">No {supportView === 'new' ? 'new or active' : 'old or closed'} conversations.</p>}</div>
          </section>
        </div>}

        {tab === 'products' && <section className="admin-panel">
          <div className="admin-panel-heading"><div><h2>Product catalog</h2><p>Changes are saved to Firestore and used by the storefront.</p></div><button type="button" className="admin-primary" onClick={() => setProductForm(newProduct())}><Plus size={16} /> Add product</button></div>
          <div className="admin-table-wrap"><table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th /></tr></thead><tbody>
            {data.products.map((product) => <tr key={product.id}><td className="admin-product-cell"><img src={product.image} alt="" /><strong>{product.name}</strong></td><td>{product.category}</td><td>{formatCurrency(product.price)}</td><td>{product.stock ?? '—'}</td><td className="admin-actions"><button type="button" className="admin-small-button" onClick={() => setProductForm({ ...product, price: String(product.sourcePrice ?? product.price), stock: String(product.stock ?? 0) })}>Edit</button><button type="button" className="admin-small-button danger" disabled={working} onClick={() => deleteProduct(product)}>Remove</button></td></tr>)}
          </tbody></table></div>
        </section>}

        {tab === 'messages' && <>
          <section className="admin-panel admin-inbox"><div className="admin-panel-heading"><div><h2>Customer inbox</h2><p>New emails received through Resend appear here automatically.</p></div><div className="admin-heading-actions"><a className="admin-small-button" href="https://resend.com/emails" target="_blank" rel="noreferrer">Open Resend <ExternalLink size={14} /></a><span className={`admin-status ${data.integrations.inboundEmail ? 'paid' : 'pending'}`}>{data.integrations.inboundEmail ? 'Receiving connected' : 'Webhook setup needed'}</span></div></div>
            <div className="admin-inbox-filters" role="tablist" aria-label="Email categories"><button type="button" className={mailboxView === 'new' ? 'active' : ''} onClick={() => setMailboxView('new')}>New <span>{data.inboundEmails.filter((email) => email.status === 'new').length}</span></button><button type="button" className={mailboxView === 'old' ? 'active' : ''} onClick={() => setMailboxView('old')}>Old <span>{data.inboundEmails.filter((email) => email.status === 'old').length}</span></button></div>
            <div className="admin-inbox-list">{data.inboundEmails.filter((email) => email.status === mailboxView).map((email) => <article className="admin-inbox-item" key={email.id}><header><div><strong>{email.subject}</strong><span>{email.from} · {displayDate(email.createdAt)}</span></div>{email.attachmentCount > 0 && <span className="admin-attachment"><Paperclip size={13} /> {email.attachmentCount}</span>}</header><p>{email.text}</p><footer><button type="button" className="admin-small-button" disabled={working} onClick={() => updateInboundEmail(email, mailboxView === 'new' ? 'mark_read' : 'mark_new')}>{mailboxView === 'new' ? 'Move to Old' : 'Move to New'}</button><button type="button" className="admin-small-button danger" disabled={working} onClick={() => updateInboundEmail(email, 'delete')}><Trash2 size={13} /> Delete</button></footer></article>)}{!data.inboundEmails.some((email) => email.status === mailboxView) && <p className="admin-empty">No {mailboxView} customer emails.</p>}</div>
          </section>
          <div className="admin-messages-grid">
          <section className="admin-panel"><div className="admin-panel-heading"><div><h2>Write a customer</h2><p>Choose a customer from the Customers tab, then send an email here.</p></div></div>
            {messageCustomer ? <form className="admin-message-form" onSubmit={sendMessage}><label>To<input value={`${messageCustomer.name || 'Customer'} <${messageCustomer.email}>`} disabled /></label><label>Subject<input required maxLength="160" value={messageForm.subject} onChange={(event) => setMessageForm({ ...messageForm, subject: event.target.value })} /></label><label>Message<textarea required rows="8" maxLength="6000" value={messageForm.text} onChange={(event) => setMessageForm({ ...messageForm, text: event.target.value })} /></label><div><button type="button" className="admin-small-button" onClick={() => setMessageCustomer(null)}>Cancel</button><button type="submit" className="admin-primary" disabled={working}><Mail size={16} /> Send email</button></div></form> : <p className="admin-empty">Choose a customer from the Customers tab to write them.</p>}
          </section>
          <section className="admin-panel"><div className="admin-panel-heading"><h2>Sent messages</h2></div>{data.messages.map((message) => <article className="admin-message-item" key={message.id}><strong>{message.subject}</strong><span>{message.email} · {displayDate(message.createdAt)}</span><p>{message.text}</p></article>)}{!data.messages.length && <p className="admin-empty">Sent messages will appear here.</p>}</section>
          </div>
        </>}

        {tab === 'errors' && <section className="admin-panel">
          <div className="admin-panel-heading"><div><h2>Error reports</h2><p>Browser crashes and server errors. Reports are retained for review.</p></div><span className="admin-status pending">{data.errorReports.filter((report) => report.status !== 'resolved').length} open</span></div>
          <div className="admin-error-list">{data.errorReports.map((report) => <article className="admin-error-item" key={report.id}><div className="admin-error-head"><span className={`admin-status ${report.status === 'resolved' ? 'paid' : 'pending'}`}>{report.status}</span><small>{report.source} · {displayDate(report.createdAt)} · {report.user}</small></div><strong>{report.message}</strong><small>{report.page}</small>{report.stack && <details><summary>Stack details</summary><pre>{report.stack}</pre></details>}{report.status !== 'resolved' && <button type="button" className="admin-small-button" disabled={working} onClick={() => resolveError(report)}>Mark resolved</button>}</article>)}{!data.errorReports.length && <p className="admin-empty">No error reports have been recorded.</p>}</div>
          {data.errorNextCursor && <button type="button" className="admin-small-button" disabled={loadingMore} onClick={() => loadMore('errors')}>{loadingMore ? 'Loading…' : 'Load older reports'}</button>}
        </section>}
      </div>

      {productForm && <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setProductForm(null) }}>
        <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="product-editor-title"><header><h2 id="product-editor-title">{productForm.id ? 'Edit product' : 'New product'}</h2><button type="button" aria-label="Close" onClick={() => setProductForm(null)}><X /></button></header>
          <form className="admin-product-form" onSubmit={saveProduct}>
            <label>Product name<input required maxLength="120" value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} /></label>
            <div className="admin-form-pair"><label>Category<input required maxLength="60" value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })} /></label><label>Supplier price (USD)<input required min="0.50" step="0.01" type="number" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} /><small>The storefront automatically shows your higher selling price.</small></label></div>
            <div className="admin-form-pair"><label>Stock<input min="0" step="1" type="number" value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })} /></label><label>Color / finish<input maxLength="80" value={productForm.color} onChange={(event) => setProductForm({ ...productForm, color: event.target.value })} /></label></div>
            <label>Image URL (HTTPS)<input required type="url" value={productForm.image} onChange={(event) => setProductForm({ ...productForm, image: event.target.value })} /></label>
            <label>Description<textarea rows="3" maxLength="1500" value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} /></label>
            <label>Exact measurements / dimensions<textarea rows="2" maxLength="500" value={productForm.measurements || ''} onChange={(event) => setProductForm({ ...productForm, measurements: event.target.value })} placeholder="Example: 32 in W × 34 in D × 36 in H" /></label>
            <div className="admin-form-pair"><label>Seller name<input maxLength="160" value={productForm.sellerName || ''} onChange={(event) => setProductForm({ ...productForm, sellerName: event.target.value })} /></label><label>Seller email<input type="email" maxLength="254" value={productForm.sellerEmail || ''} onChange={(event) => setProductForm({ ...productForm, sellerEmail: event.target.value })} placeholder="seller@example.com" /></label></div>
            <label>Other seller contact information<input maxLength="300" value={productForm.sellerContact || ''} onChange={(event) => setProductForm({ ...productForm, sellerContact: event.target.value })} placeholder="Phone number or support channel" /></label>
            <label className="admin-checkbox"><input type="checkbox" checked={Boolean(productForm.featured)} onChange={(event) => setProductForm({ ...productForm, featured: event.target.checked })} /> Feature on the homepage</label>
            <footer><button type="button" className="admin-small-button" onClick={() => setProductForm(null)}>Cancel</button><button type="submit" className="admin-primary" disabled={working}>Save product</button></footer>
          </form>
        </section>
      </div>}
    </section>
  )
}
