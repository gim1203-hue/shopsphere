import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageIntro from '../components/PageIntro'
import ProductCard from '../components/ProductCard'
import { categories, products } from '../data/products'

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const query = params.get('q') || ''
  const category = params.get('category') || 'All'
  const sort = params.get('sort') || 'featured'
  const searchOptions = [...new Set([
    ...products.map((product) => product.name),
    ...products.map((product) => product.category),
    ...products.map((product) => product.color),
    ...products.flatMap((product) => product.details || []),
  ])].filter(Boolean).sort()
  const setParam = (key, value, fallback = '') => { const next = new URLSearchParams(params); value && value !== fallback ? next.set(key, value) : next.delete(key); setParams(next) }
  const filtered = useMemo(() => {
    const normalize = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    const queryTerms = normalize(query).trim().split(/\s+/).filter(Boolean)
    const result = products.filter((product) => {
      const searchableText = normalize([
        product.name, product.category, product.description, product.color,
        product.price, product.originalPrice, product.rating, product.reviews,
        product.stock, ...(product.details || []),
      ].join(' '))
      const matchesSearch = queryTerms.length === 0 || queryTerms.every((term) => searchableText.includes(term))
      const matchesCategory = queryTerms.length > 0 || category === 'All' || product.category === category
      return matchesCategory && matchesSearch
    })
    return [...result].sort((a, b) => sort === 'price-low' ? a.price - b.price : sort === 'price-high' ? b.price - a.price : sort === 'rating' ? b.rating - a.rating : Number(b.featured) - Number(a.featured))
  }, [category, query, sort])

  return (
    <>
      <PageIntro eyebrow="The complete collection" title="Shop thoughtfully." text="Everyday objects selected for beauty, utility, and a life well lived." />
      <section className="container shop-layout">
        <aside className={filtersOpen ? 'filters open' : 'filters'}><div className="filter-mobile-head"><strong>Filters</strong><button onClick={() => setFiltersOpen(false)}><X /></button></div><h3>Category</h3>{['All', ...categories.map((item) => item.name)].map((item) => <button key={item} className={category === item ? 'selected' : ''} onClick={() => setParam('category', item, 'All')}>{item}<span>{item === 'All' ? products.length : products.filter((product) => product.category === item).length}</span></button>)}<div className="filter-note"><span>Good to know</span><p>Every order is packed in recyclable materials and shipped carbon-neutral.</p></div></aside>
        <div className="shop-results">
          <div className="shop-toolbar"><label><Search size={18} /><input list="shop-search-options" value={query} onChange={(e) => setParam('q', e.target.value)} placeholder="Search the collection" /><datalist id="shop-search-options">{searchOptions.map((option) => <option key={option} value={option} />)}</datalist></label><button className="filter-trigger" onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={18} /> Filters</button><span>{filtered.length} {filtered.length === 1 ? 'object' : 'objects'}</span><select value={sort} onChange={(e) => setParam('sort', e.target.value, 'featured')} aria-label="Sort products"><option value="featured">Featured first</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="rating">Highest rated</option></select></div>
          {filtered.length ? <div className="product-grid shop-grid">{filtered.map((product) => <ProductCard product={product} key={product.id} />)}</div> : <div className="no-results"><h2>No objects found</h2><p>Try another search or clear your filters.</p><button className="button dark" onClick={() => setParams({})}>Clear filters</button></div>}
        </div>
      </section>
    </>
  )
}
