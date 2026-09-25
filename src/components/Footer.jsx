import { ArrowUpRight, Instagram, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container newsletter">
        <div><span className="eyebrow light">The Sunday edit</span><h2>Good things, thoughtfully sent.</h2></div>
        <form onSubmit={(e) => e.preventDefault()}><label className="sr-only" htmlFor="newsletter">Email address</label><input id="newsletter" type="email" placeholder="Your email address" required /><button aria-label="Join newsletter"><ArrowUpRight /></button></form>
      </div>
      <div className="container footer-grid">
        <div><Link className="logo footer-logo" to="/">shop<span>sphere</span><i>.</i></Link><p>Considered objects for everyday rituals.<br />Designed to be lived with and loved.</p></div>
        <div><h3>Shop</h3><Link to="/shop">New arrivals</Link><Link to="/shop?category=Home">Home</Link><Link to="/shop?category=Tech">Tech</Link><Link to="/shop?category=Style">Style</Link></div>
        <div><h3>About</h3><a href="#story">Our story</a><a href="mailto:hello@shopsphere.example">Contact</a><a href="#journal">Journal</a><a href="#care">Care guide</a></div>
        <div><h3>Follow along</h3><a href="#instagram"><Instagram size={17} /> Instagram</a><a href="mailto:hello@shopsphere.example"><Mail size={17} /> Email us</a></div>
      </div>
      <div className="container footer-bottom"><span>© {new Date().getFullYear()} ShopSphere</span><span>Privacy · Terms · Accessibility</span><span>Made with intention</span></div>
    </footer>
  )
}
