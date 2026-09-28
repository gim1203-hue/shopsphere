import { ArrowUpRight, Mail } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false)
  return (
    <footer className="site-footer">
      <div className="container newsletter">
        <div><span className="eyebrow light">The Sunday edit</span><h2>Good things, thoughtfully sent.</h2></div>
        <form onSubmit={(event) => { event.preventDefault(); setSubscribed(true); event.currentTarget.reset() }}><label className="sr-only" htmlFor="newsletter">Email address</label><input id="newsletter" type="email" placeholder="Your email address" required /><button aria-label="Join newsletter"><ArrowUpRight /></button></form>
        {subscribed && <span className="newsletter-success" role="status">Thanks — you’re on the list.</span>}
      </div>
      <div className="container footer-grid">
        <div><Link className="logo footer-logo" to="/">Ask<span>Khan</span><i>.</i></Link><p>A broad marketplace for everyday goods, vehicles, business supplies, and more.</p></div>
        <div><h3>Shop</h3><Link to="/shop">All products</Link><Link to="/shop?category=Cars%20%26%20Trucks">Cars & trucks</Link><Link to="/shop?category=Motorcycles%20%26%20Powersports">Motorcycles</Link><Link to="/shop?category=Electronics%20%26%20Computers">Electronics</Link></div>
        <div><h3>Help</h3><Link to="/support">Merchant support</Link><Link to="/account#orders">Orders & invoices</Link><Link to="/account#addresses">Shipping addresses</Link><a href="mailto:hello@shopsphere.example">Email us</a></div>
        <div><h3>Contact</h3><Link to="/support"><Mail size={17} /> Contact merchant</Link><a href="mailto:hello@shopsphere.example"><Mail size={17} /> Email support</a></div>
      </div>
      <div className="container footer-bottom"><span>© {new Date().getFullYear()} AskKhan</span><span><Link to="/legal/privacy">Privacy</Link> · <Link to="/legal/terms">Terms</Link> · <Link to="/legal/accessibility">Accessibility</Link> · <Link to="/legal/returns">Returns</Link></span><span>Merchant support available</span></div>
    </footer>
  )
}
