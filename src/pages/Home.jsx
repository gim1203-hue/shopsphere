import { ArrowRight, PackageCheck, RefreshCcw, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import CategoryHero from '../components/CategoryHero'
import ProductCard from '../components/ProductCard'
import { categories } from '../data/products'
import { useCatalog } from '../context/CatalogContext'
import { formatCurrency } from '../utils/format'

export default function Home() {
  const { products } = useCatalog()
  const featured = products.filter((product) => product.featured)
  return <>
    <CategoryHero products={products} />
    <section className="service-strip"><div className="container"><div><PackageCheck /><span><strong>Free delivery</strong>On orders over $100</span></div><div><RefreshCcw /><span><strong>Easy returns</strong>30-day support</span></div><div><Sparkles /><span><strong>Broad selection</strong>Products across categories</span></div></div></section>
    <section className="section container"><div className="section-heading"><div><span className="eyebrow">Browse your way</span><h2>Shop by category.</h2></div><Link className="text-link" to="/shop">View all products <ArrowRight size={16} /></Link></div><div className="category-grid">{categories.map((category, index) => { const product = products.find((item) => item.category === category.name); if (!product) return null; return <Link className={`category-card category-${index + 1}`} to={`/shop?category=${encodeURIComponent(category.name)}`} key={category.name}><img src={product.image} alt={product.name} /><div><span>{String(index + 1).padStart(2, '0')}</span><h3>{category.name}</h3><p>From {formatCurrency(product.price)} <ArrowRight size={14} /></p></div></Link> })}</div></section>
    <section className="section muted-section"><div className="container"><div className="section-heading"><div><span className="eyebrow">Featured marketplace</span><h2>Popular right now.</h2></div><p>Products selected from across<br />the AskKhan marketplace.</p></div><div className="product-grid">{featured.map((product) => <ProductCard product={product} key={product.id} />)}</div></div></section>
    <section className="story-section" id="story"><div className="story-image"><img src="https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1400&q=85" alt="Marketplace products in a modern space" /></div><div className="story-copy"><span className="eyebrow light">A broader way to shop</span><h2>More choice,<br /><em>one marketplace.</em></h2><p>AskKhan brings products, vehicles, tools, technology, and business supplies together in one searchable marketplace.</p><Link className="button light-button" to="/shop">Discover the marketplace <ArrowRight size={17} /></Link></div></section>
    <section className="quote-section container"><span>“</span><blockquote>Everything you need, organized by category and easy to discover.</blockquote><small>THE ASKKHAN MARKETPLACE</small></section>
  </>
}
