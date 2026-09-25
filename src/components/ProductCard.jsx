import { Heart, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { formatCurrency } from '../utils/format'

export default function ProductCard({ product }) {
  const { favorites, toggleFavorite, addToCart } = useStore()
  const saved = favorites.includes(product.id)
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <Link to={`/products/${product.id}`}><img src={product.image} alt={product.name} onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x900/f1eee7/5f665f?text=Image+unavailable' }} /></Link>
        {product.originalPrice && <span className="sale-badge">Sale</span>}
        {!product.stock && <span className="sold-badge">Sold out</span>}
        <button className={`favorite-button ${saved ? 'saved' : ''}`} onClick={() => toggleFavorite(product.id)} aria-label={saved ? 'Remove from favorites' : 'Add to favorites'}><Heart fill={saved ? 'currentColor' : 'none'} /></button>
        <button disabled={!product.stock} className="quick-add" onClick={() => addToCart(product)}><ShoppingBag size={17} /> {product.stock ? 'Quick add' : 'Unavailable'}</button>
      </div>
      <div className="product-card-info"><span>{product.category}</span><h3><Link to={`/products/${product.id}`}>{product.name}</Link></h3><div><strong>{formatCurrency(product.price)}</strong>{product.originalPrice && <del>{formatCurrency(product.originalPrice)}</del>}<small>★ {product.rating}</small></div></div>
    </article>
  )
}
