import { Headphones, Send } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageIntro from '../components/PageIntro'
import { useAuth } from '../context/AuthContext'

export default function Support() {
  const { session } = useAuth()
  const [params] = useSearchParams()
  const product = params.get('product') || ''
  const seller = params.get('seller') || ''
  const [form, setForm] = useState({ type: params.get('type') || 'Order help', orderNumber: params.get('order') || '', message: product ? `I need help contacting the seller${seller ? ` (${seller})` : ''} about: ${product}.\n\n` : '' })
  const [working, setWorking] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const submit = async (event) => {
    event.preventDefault(); setWorking(true); setError(''); setResult('')
    try {
      const token = await session.getIdToken()
      const response = await fetch('/api/customer-support', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to send your request.')
      setResult(`Request ${data.ticket} was sent to merchant support.`); setForm((current) => ({ ...current, message: '' }))
    } catch (reason) { setError(reason.message) } finally { setWorking(false) }
  }
  return <><PageIntro eyebrow="Customer care" title="Merchant support." text="Get help with an order, cancellation, return, delivery, payment, or product listing." /><section className="container support-page"><div className="support-note"><Headphones /><h2>We’re here to help</h2><p>Send the merchant team a secure request. Include your order number when your question is about a purchase.</p></div><form className="support-form" onSubmit={submit}><label><span>What do you need help with?</span><select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option>Order help</option><option>Cancel order</option><option>Return or refund</option><option>Shipping or delivery</option><option>Invoice or payment</option><option>Product listing problem</option><option>Account access</option></select></label><label><span>Order number (optional)</span><input value={form.orderNumber} onChange={(event) => setForm({ ...form, orderNumber: event.target.value })} placeholder="Order number from your invoice" /></label><label><span>How can we help?</span><textarea rows="7" required value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Describe the problem and the outcome you need." /></label>{error && <p className="auth-error">{error}</p>}{result && <p className="auth-success">{result}</p>}<button className="button dark" disabled={working}><Send size={16} /> {working ? 'Sending…' : 'Send support request'}</button></form></section></>
}
