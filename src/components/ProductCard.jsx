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

  // Supplier/source cost
  const sourcePrice = Number(
    product.sourcePrice ??
      product.price ??
      0
  )

  // Customer price = source price + your Ask Khan markup
  const askKhanPrice = Number(
    product.askKhanPrice ??
      getAskKhanPrice(sourcePrice)
  )

  // Genuine MSRP/list/original price only
  const compareAtPrice = Number(
    product.compareAtPrice ??
      product.originalPrice ??
      product.listPrice ??
      product.msrp ??
      0
  )

  const showCompareAtPrice =
    compareAtPrice > askKhanPrice

  const available =
    product.externalUrl && !product.checkoutToken
      ? false
      : product.stock === undefined
      ? true
      : Number(product.stock) > 0

  const cartProduct = {
    ...product,
    sourcePrice,
    price: askKhanPrice,
    askKhanPrice,
  }

  const productImage = (
    <img
      src={product.image}
      alt={product.name}
      onError={(event) => {
        event.currentTarget.src =
          'https://placehold.co/800x900/f1eee7/5f665f?text=Image+unavailable'
      }}
    />
  )

  const productName = product.externalUrl ? (
    <span>{product.name}</span>
  ) : (
    <Link to={`/products/${product.id}`}>
      {product.name}
    </Link>
  )

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        {product.externalUrl ? (
          productImage
        ) : (
          <Link to={`/products/${product.id}`}>
            {productImage}
          </Link>
        )}

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
          {productName}
        </h3>

        <div className="product-price-row">
          {showCompareAtPrice && (
            <del className="original-price">
              {formatCurrency(compareAtPrice)}
            </del>
          )}

          <strong className="ask-khan-price">
            {formatCurrency(askKhanPrice)}
          </strong>

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