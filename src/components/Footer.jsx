import { ArrowUpRight, Mail, MessageSquareText, Phone } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false)
  const [newsletterError, setNewsletterError] = useState('')
  const [subscribing, setSubscribing] = useState(false)

  const subscribe = async (event) => {
    event.preventDefault(); setSubscribing(true); setNewsletterError('')
    const form = event.currentTarget
    try {
      const response = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: new FormData(form).get('email') }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to subscribe.')
      setSubscribed(true); form.reset()
    } catch (error) { setNewsletterError(error.message) } finally { setSubscribing(false) }
  }
  return (
    <footer className="site-footer">
      <div className="container newsletter">
        <div><span className="eyebrow light">The Sunday edit</span><h2>Good things, thoughtfully sent.</h2></div>
        <form onSubmit={subscribe}><label className="sr-only" htmlFor="newsletter">Email address</label><input id="newsletter" name="email" type="email" placeholder="Your email address" required /><button disabled={subscribing} aria-label="Join newsletter"><ArrowUpRight /></button></form>
        {subscribed && <span className="newsletter-success" role="status">Thanks — you’re on the list.</span>}
        {newsletterError && <span className="newsletter-success newsletter-error" role="alert">{newsletterError}</span>}
      </div>
      <div className="container footer-grid">
        <div><Link className="logo footer-logo" to="/">Stop<span>Shop</span><i>.</i></Link><p>A broad marketplace for everyday goods, vehicles, business supplies, and more.</p></div>
        <div><h3>Shop</h3><Link to="/shop">All products</Link><Link to="/shop?category=Cars%20%26%20Trucks">Cars & trucks</Link><Link to="/shop?category=Motorcycles%20%26%20Powersports">Motorcycles</Link><Link to="/shop?category=Electronics%20%26%20Computers">Electronics</Link></div>
        <div><h3>Help</h3><Link to="/support">Merchant support</Link><Link to="/account#orders">Orders & invoices</Link><Link to="/account#addresses">Shipping addresses</Link><Link to="/legal/returns">Returns & cancellations</Link></div>
        <div><h3>Contact</h3><a href="mailto:support@homedepo.tech"><Mail size={17} /> Email support</a><a href="tel:+13477511551"><Phone size={17} /> Call support</a><a href="sms:+13477511551"><MessageSquareText size={17} /> Text support</a><Link to="/legal/accessibility">Accessibility help</Link></div>
      </div>
      <div className="container footer-bottom"><span>© {new Date().getFullYear()} StopShop</span><span><Link to="/legal/privacy">Privacy</Link> · <Link to="/legal/terms">Terms</Link> · <Link to="/legal/accessibility">Accessibility</Link> · <Link to="/legal/returns">Returns</Link></span><span>Merchant support available</span></div>
    </footer>
  )
}
