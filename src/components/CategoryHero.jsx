import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { categories } from '../data/products'
import { formatCurrency } from '../utils/format'

const SLIDE_TIME = 7000

export default function CategoryHero({ products }) {
  const slides = useMemo(() => categories.map((category) => ({ category: category.name, product: products.find((item) => item.category === category.name) })).filter((slide) => slide.product?.image), [products])
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStart = useRef(null)

  useEffect(() => {
    if (paused || slides.length < 2) return undefined
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), SLIDE_TIME)
    return () => window.clearInterval(timer)
  }, [paused, slides.length])

  useEffect(() => { if (active >= slides.length && slides.length) setActive(0) }, [active, slides.length])
  if (!slides.length) return null
  const move = (direction) => setActive((current) => (current + direction + slides.length) % slides.length)

  return <section className="category-hero" aria-roledescription="carousel" aria-label="Featured marketplace categories" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)} onTouchStart={(event) => { touchStart.current = event.touches[0].clientX }} onTouchEnd={(event) => { const distance = (touchStart.current ?? event.changedTouches[0].clientX) - event.changedTouches[0].clientX; if (Math.abs(distance) > 45) move(distance > 0 ? 1 : -1); touchStart.current = null }}>
    <div className="category-hero-slides">{slides.map(({ category, product }, index) => <article className={`category-hero-slide${index === active ? ' active' : ''}`} aria-hidden={index !== active} key={category}>
      <div className="category-hero-copy container"><div className="category-hero-content"><span className="eyebrow">Featured category · {String(index + 1).padStart(2, '0')}</span><h1>{category}</h1><p className="hero-product-name">{product.name}</p><strong className="hero-product-price">{formatCurrency(product.price)}</strong><p className="hero-product-description">{product.description}</p><div className="hero-actions"><Link className="button dark" to={`/products/${product.id}`} state={{ product }}>View product <ArrowRight size={17} /></Link><Link className="text-link" to={`/shop?category=${encodeURIComponent(category)}`}>Shop category <ArrowRight size={16} /></Link></div></div></div>
      <Link className="category-hero-media" to={`/products/${product.id}`} state={{ product }} tabIndex={index === active ? 0 : -1} aria-label={`View ${product.name}`}><img src={product.image} alt={product.name} /></Link>
    </article>)}</div>
    <div className="category-hero-controls container"><div><button type="button" onClick={() => move(-1)} aria-label="Previous featured category"><ArrowLeft /></button><button type="button" onClick={() => move(1)} aria-label="Next featured category"><ArrowRight /></button></div><div className="category-hero-dots" aria-label="Choose featured category">{slides.map((slide, index) => <button type="button" className={index === active ? 'active' : ''} onClick={() => setActive(index)} aria-label={`Show ${slide.category}`} aria-current={index === active ? 'true' : undefined} key={slide.category} />)}</div><span>{String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span></div>
    <div className={`category-hero-progress${paused ? ' paused' : ''}`} key={active} />
  </section>
}
