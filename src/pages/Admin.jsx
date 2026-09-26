import { createElement, useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Mail, Package, Plus, RefreshCw, Search, ShieldCheck, Users, Wallet, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCatalog } from '../context/CatalogContext'
import { formatCurrency } from '../utils/format'

const emptyData = { customers: [], orders: [], products: [], messages: [], errorReports: [], customerNextCursor: null, orderNextCursor: null, errorNextCursor: null, integrations: null }
const newProduct = () => ({ id: '', name: '', category: '', price: '', stock: '', image: '', description: '', color: '', featured: false })

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
              <div className="admin-service-row"><span>Customer email</span><strong className={data.integrations.email ? 'connected' : 'disconnected'}>{data.integrations.email ? 'Connected' : 'Needs setup'}</strong></div>
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
          <div className="admin-panel-heading"><div><h2>Orders & payments</h2><p>Stripe Checkout sessions. Guest purchases are included.</p></div></div>
          {!data.integrations.stripe && <p className="admin-alert">Add the Stripe secret key to the server environment to view and refund payments.</p>}
          <div className="admin-table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Payment</th><th>Total</th><th>Action</th></tr></thead><tbody>
            {data.orders.map((order) => <tr key={order.id}><td><code>{order.id.slice(-12)}</code></td><td>{order.email || 'Guest checkout'}</td><td>{displayDate(order.createdAt)}</td><td><span className={`admin-status ${order.refunded ? 'refunded' : order.paymentStatus}`}>{order.refunded ? 'refunded' : order.paymentStatus}</span></td><td>{formatCurrency(order.amount / 100)}</td><td>{order.paymentStatus === 'paid' && !order.refunded ? <button type="button" className="admin-small-button danger" disabled={working} onClick={() => issueRefund(order)}>Full refund</button> : order.refunded ? 'Refund complete' : '—'}</td></tr>)}
          </tbody></table></div>
          {data.orderNextCursor && <button type="button" className="admin-small-button" disabled={loadingMore} onClick={() => loadMore('orders')}>{loadingMore ? 'Loading…' : 'Load more payments'}</button>}
          {!data.orders.length && <p className="admin-empty">No payment sessions found.</p>}
        </section>}

        {tab === 'products' && <section className="admin-panel">
          <div className="admin-panel-heading"><div><h2>Product catalog</h2><p>Changes are saved to Firestore and used by the storefront.</p></div><button type="button" className="admin-primary" onClick={() => setProductForm(newProduct())}><Plus size={16} /> Add product</button></div>
          <div className="admin-table-wrap"><table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th /></tr></thead><tbody>
            {data.products.map((product) => <tr key={product.id}><td className="admin-product-cell"><img src={product.image} alt="" /><strong>{product.name}</strong></td><td>{product.category}</td><td>{formatCurrency(product.price)}</td><td>{product.stock ?? '—'}</td><td className="admin-actions"><button type="button" className="admin-small-button" onClick={() => setProductForm({ ...product, price: String(product.price), stock: String(product.stock ?? 0) })}>Edit</button><button type="button" className="admin-small-button danger" disabled={working} onClick={() => deleteProduct(product)}>Remove</button></td></tr>)}
          </tbody></table></div>
        </section>}

        {tab === 'messages' && <div className="admin-messages-grid">
          <section className="admin-panel"><div className="admin-panel-heading"><div><h2>Customer email</h2><p>Replies are delivered to the support address.</p></div></div>
            {messageCustomer ? <form className="admin-message-form" onSubmit={sendMessage}><label>To<input value={`${messageCustomer.name || 'Customer'} <${messageCustomer.email}>`} disabled /></label><label>Subject<input required maxLength="160" value={messageForm.subject} onChange={(event) => setMessageForm({ ...messageForm, subject: event.target.value })} /></label><label>Message<textarea required rows="8" maxLength="6000" value={messageForm.text} onChange={(event) => setMessageForm({ ...messageForm, text: event.target.value })} /></label><div><button type="button" className="admin-small-button" onClick={() => setMessageCustomer(null)}>Cancel</button><button type="submit" className="admin-primary" disabled={working}><Mail size={16} /> Send email</button></div></form> : <p className="admin-empty">Choose a customer from the Customers tab to write them.</p>}
          </section>
          <section className="admin-panel"><div className="admin-panel-heading"><h2>Sent messages</h2></div>{data.messages.map((message) => <article className="admin-message-item" key={message.id}><strong>{message.subject}</strong><span>{message.email} · {displayDate(message.createdAt)}</span><p>{message.text}</p></article>)}{!data.messages.length && <p className="admin-empty">Sent messages will appear here.</p>}</section>
        </div>}

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
            <div className="admin-form-pair"><label>Category<input required maxLength="60" value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })} /></label><label>Price (USD)<input required min="0.50" step="0.01" type="number" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} /></label></div>
            <div className="admin-form-pair"><label>Stock<input min="0" step="1" type="number" value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })} /></label><label>Color / finish<input maxLength="80" value={productForm.color} onChange={(event) => setProductForm({ ...productForm, color: event.target.value })} /></label></div>
            <label>Image URL (HTTPS)<input required type="url" value={productForm.image} onChange={(event) => setProductForm({ ...productForm, image: event.target.value })} /></label>
            <label>Description<textarea rows="3" maxLength="1500" value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} /></label>
            <label className="admin-checkbox"><input type="checkbox" checked={Boolean(productForm.featured)} onChange={(event) => setProductForm({ ...productForm, featured: event.target.checked })} /> Feature on the homepage</label>
            <footer><button type="button" className="admin-small-button" onClick={() => setProductForm(null)}>Cancel</button><button type="submit" className="admin-primary" disabled={working}>Save product</button></footer>
          </form>
        </section>
      </div>}
    </section>
  )
}