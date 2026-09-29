import { Headphones, MessageCircle, Send } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageIntro from '../components/PageIntro'
import { useAuth } from '../context/AuthContext'

export default function Support() {
  const { session } = useAuth()
  const [params] = useSearchParams()
  const product = params.get('product') || ''
  const seller = params.get('seller') || ''
  const [form, setForm] = useState({ type: params.get('type') || 'Order help', orderNumber: params.get('order') || '', message: product ? `I need help contacting the seller${seller ? ` (${seller})` : ''} about: ${product}.\n\n` : '' })
  const [tickets, setTickets] = useState([])
  const [replies, setReplies] = useState({})
  const [working, setWorking] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')

  const supportFetch = useCallback(async (options = {}) => {
    const token = await session.getIdToken()
    const response = await fetch('/api/customer-support', { ...options, headers: { ...options.headers, Authorization: `Bearer ${token}` } })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Unable to load support conversations.')
    return data
  }, [session])

  const loadTickets = useCallback(() => supportFetch().then((data) => setTickets(data.tickets || [])).catch((reason) => setError(reason.message)), [supportFetch])

  useEffect(() => {
    loadTickets()
    const timer = setInterval(loadTickets, 15000)
    return () => clearInterval(timer)
  }, [loadTickets])

  const submit = async (event) => {
    event.preventDefault(); setWorking(true); setError(''); setResult('')
    try {
      const data = await supportFetch({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      setResult(`Request ${data.ticket} was sent to support.`); setForm((current) => ({ ...current, message: '' })); await loadTickets()
    } catch (reason) { setError(reason.message) } finally { setWorking(false) }
  }

  const reply = async (ticketId) => {
    const message = String(replies[ticketId] || '').trim()
    if (!message) return
    setWorking(true); setError('')
    try {
      await supportFetch({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ticketId, message }) })
      setReplies((current) => ({ ...current, [ticketId]: '' })); await loadTickets()
    } catch (reason) { setError(reason.message) } finally { setWorking(false) }
  }

  return <><PageIntro eyebrow="Customer care" title="Merchant support." text="Get help with an order, cancellation, return, delivery, payment, or product listing." /><section className="container support-page"><div className="support-note"><Headphones /><h2>We’re here to help</h2><p>Start a secure conversation with support. Replies appear below and can also be delivered by email.</p></div><form className="support-form" onSubmit={submit}><label><span>What do you need help with?</span><select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option>Order help</option><option>Cancel order</option><option>Return or refund</option><option>Shipping or delivery</option><option>Invoice or payment</option><option>Product listing problem</option><option>Account access</option></select></label><label><span>Order number (optional)</span><input value={form.orderNumber} onChange={(event) => setForm({ ...form, orderNumber: event.target.value })} placeholder="Order number from your invoice" /></label><label><span>How can we help?</span><textarea rows="7" required value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Describe the problem and the outcome you need." /></label>{error && <p className="auth-error">{error}</p>}{result && <p className="auth-success">{result}</p>}<button className="button dark" disabled={working}><Send size={16} /> {working ? 'Sending…' : 'Start conversation'}</button></form></section>
    <section className="container support-conversations"><div className="section-heading"><div><span className="eyebrow">Secure help inbox</span><h2>Your conversations.</h2></div></div>{tickets.length ? tickets.map((ticket) => <article className="support-ticket" key={ticket.id}><header><span><MessageCircle /><strong>{ticket.type}</strong><small>{ticket.orderNumber ? `Order ${ticket.orderNumber}` : `Ticket ${ticket.id.slice(-8)}`}</small></span><b>{ticket.status?.replaceAll('_', ' ')}</b></header><div className="support-thread">{(ticket.conversation?.length ? ticket.conversation : [{ sender: 'customer', text: ticket.message }]).map((entry, index) => <p className={entry.sender === 'support' ? 'from-support' : 'from-customer'} key={`${ticket.id}-${index}`}><small>{entry.sender === 'support' ? 'AskKhan support' : 'You'}</small>{entry.text}</p>)}</div>{ticket.status !== 'closed' && <div className="support-reply"><textarea rows="3" value={replies[ticket.id] || ''} onChange={(event) => setReplies((current) => ({ ...current, [ticket.id]: event.target.value }))} placeholder="Write a reply…" /><button className="button dark" type="button" disabled={working} onClick={() => reply(ticket.id)}><Send size={15} /> Reply</button></div>}</article>) : <p className="account-muted">No support conversations yet.</p>}</section></>
}
