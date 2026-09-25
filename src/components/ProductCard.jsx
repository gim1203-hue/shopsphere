import {
  Heart,
  ShoppingBag,
} from 'lucide-react'

import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { formatCurrency } from '../utils/format'
import { getAskKhanPrice } from '../utils/pricing'

export default function ProductCard({
  product,
}) {
  const {
    favorites,
    toggleFavorite,
    addToCart,
  } = useStore()

  const saved =
    favorites.includes(product.id)

  const sourcePrice = Number(
    product.sourcePrice ??
      product.price ??
      0
  )

  const askKhanPrice =
    product.askKhanPrice ??
    getAskKhanPrice(sourcePrice)

  const available =
    product.stock === undefined
      ? true
      : Number(product.stock) > 0

  const cartProduct = {
    ...product,
    sourcePrice,
    price: askKhanPrice,
  }

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <Link
          to={`/products/${product.id}`}
        >
          <img
            src={product.image}
            alt={product.name}
            onError={(event) => {
              event.currentTarget.src =
                'https://placehold.co/800x900/f1eee7/5f665f?text=Image+unavailable'
            }}
          />
        </Link>

        {!available && (
          <span className="sold-badge">
            Sold out
          </span>
        )}

        <button
          type="button"
          className={`favorite-button ${
            saved ? 'saved' : ''
          }`}
          onClick={() =>
            toggleFavorite(product.id)
          }
          aria-label={
            saved
              ? 'Remove from favorites'
              : 'Add to favorites'
          }
        >
          <Heart
            fill={
              saved
                ? 'currentColor'
                : 'none'
            }
          />
        </button>

        <button
          type="button"
          disabled={!available}
          className="quick-add"
          onClick={() =>
            addToCart(cartProduct)
          }
        >
          <ShoppingBag size={17} />

          {available
            ? 'Quick add'
            : 'Unavailable'}
        </button>
      </div>

      <div className="product-card-info">
        <span>
          {product.category || 'Other'}
        </span>

        <h3>
          <Link
            to={`/products/${product.id}`}
          >
            {product.name}
          </Link>
        </h3>

        {product.brand && (
          <small>
            {product.brand}
          </small>
        )}

        <div>
          <strong>
            {formatCurrency(
              askKhanPrice
            )}
          </strong>

          {sourcePrice > 0 && (
            <del>
              {formatCurrency(
                sourcePrice
              )}
            </del>
          )}

          {product.rating ? (
            <small>
              ★ {product.rating}
            </small>
          ) : null}
        </div>
      </div>
    </article>
  )
}