import { ArrowRight, PackageCheck, RefreshCcw, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import heroImage from '../assets/shopsphere-hero.png'
import ProductCard from '../components/ProductCard'
import { categories, products } from '../data/products'

export default function Home() {
  const featured = products.filter((product) => product.featured)
  return (
    <>
      <section className="hero" style={{ '--hero': `url(${heroImage})`, backgroundImage: `linear-gradient(90deg, rgba(245,241,231,.98) 0%, rgba(245,241,231,.91) 33%, rgba(245,241,231,.12) 66%), url(${heroImage})` }}>
        <div className="container hero-content"><span className="eyebrow">New season · considered living</span><h1>Beautiful things,<br /><em>made meaningful.</em></h1><p>A curated collection of enduring objects for your home, your rituals, and everything in between.</p><div className="hero-actions"><Link className="button dark" to="/shop">Shop the collection <ArrowRight size={17} /></Link><a className="text-link" href="#story">Our approach <ArrowRight size={16} /></a></div></div>
        <span className="hero-credit">The autumn edit / 2026</span>
      </section>

      <section className="service-strip"><div className="container"><div><PackageCheck /><span><strong>Free delivery</strong>On orders over $100</span></div><div><RefreshCcw /><span><strong>Easy returns</strong>30 days, no questions</span></div><div><Sparkles /><span><strong>Curated quality</strong>Chosen to last</span></div></div></section>

      <section className="section container"><div className="section-heading"><div><span className="eyebrow">Browse your way</span><h2>Made for everyday life.</h2></div><Link className="text-link" to="/shop">View all products <ArrowRight size={16} /></Link></div><div className="category-grid">{categories.map((category, index) => <Link className={`category-card category-${index + 1}`} to={`/shop?category=${category.name}`} key={category.name}><img src={category.image} alt="" /><div><span>0{index + 1}</span><h3>{category.name}</h3><p>Explore the edit <ArrowRight size={14} /></p></div></Link>)}</div></section>

      <section className="section muted-section"><div className="container"><div className="section-heading"><div><span className="eyebrow">Most loved</span><h2>Objects worth keeping.</h2></div><p>Quietly useful. Beautifully made.<br />Favorites chosen by our community.</p></div><div className="product-grid">{featured.map((product) => <ProductCard product={product} key={product.id} />)}</div></div></section>

      <section className="story-section" id="story"><div className="story-image"><img src="https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1400&q=85" alt="Calm modern interior" /></div><div className="story-copy"><span className="eyebrow light">A slower kind of shopping</span><h2>Less, but<br /><em>better.</em></h2><p>We believe the things you live with should earn their place. Every ShopSphere piece is selected for its material honesty, considered design, and ability to age beautifully.</p><Link className="button light-button" to="/shop">Discover our collection <ArrowRight size={17} /></Link></div></section>

      <section className="quote-section container"><span>“</span><blockquote>Objects can tell stories, hold memories, and make the everyday feel a little more considered.</blockquote><small>THE SHOPSPHERE PHILOSOPHY</small></section>
    </>
  )
}
