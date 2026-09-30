import {
  ArrowLeft,
  Heart,
  Mail,
  Minus,
  Plus,
  Ruler,
  ShieldCheck,
  Store,
  Truck,
} from 'lucide-react'

import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useStore } from '../context/StoreContext'
import { useCatalog } from '../context/CatalogContext'
import { getProductPrice } from '../utils/pricing'
import NotFound from './NotFound'

export default function ProductDetails() {
  const { productId } = useParams()
  const location = useLocation()
  const { products } = useCatalog()

  const product = products.find(
    (item) =>
      String(item.id) === productId
  ) || (String(location.state?.product?.id) === productId ? location.state.product : null)

  const [quantity, setQuantity] =
    useState(1)

  const {
    favorites,
    toggleFavorite,
    addToCart,
  } = useStore()

  if (!product) {
    return <NotFound compact />
  }

  const sourcePrice = Number(
    product.sourcePrice ??
      product.price ??
      0
  )

  // Your customer price including your markup
  const askKhanPrice = getProductPrice(product)

  const cartProduct = {
    ...product,
    sourcePrice,
    price: askKhanPrice,
    askKhanPrice,
  }

  const related = products
    .filter(
      (item) =>
        item.category === product.category &&
        item.id !== product.id
    )
    .slice(0, 3)

  const saved =
    favorites.includes(product.id)

  const maxQuantity = product.externalUrl ? 10 : Math.max(1, Number(product.stock) || 10)

  return (
    <>
      <section className="container product-detail">
        <Link
          className="back-link"
          to="/shop"
        >
          <ArrowLeft size={16} />
          Back to shop
        </Link>

        <div className="detail-grid">
          <div className="detail-image">
            <img
              src={product.image}
              alt={product.name}
            />

          </div>

          <div className="detail-copy">
            <span className="eyebrow">
              {product.category}
            </span>

            <h1>{product.name}</h1>

            <div className="detail-rating">
              <span>★★★★★</span>{' '}
              {product.rating} ·{' '}
              {product.reviews} reviews
            </div>

            <p className="detail-description">
              {product.description}
            </p>

            <div className="detail-meta">
              <span>Finish</span>
              <strong>
                {product.color}
              </strong>
            </div>

            {product.stock ? (
              <span className="stock in-stock">
                ● In stock — ready to ship
              </span>
            ) : (
              <span className="stock">
                Sold out
              </span>
            )}

            <div className="purchase-row">
              <div className="quantity">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() =>
                    setQuantity(
                      Math.max(
                        1,
                        quantity - 1
                      )
                    )
                  }
                  aria-label="Decrease quantity"
                  title={quantity <= 1 ? 'Minimum quantity is 1' : 'Decrease quantity'}
                >
                  <Minus />
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  disabled={quantity >= maxQuantity}
                  onClick={() =>
                    setQuantity(
                      Math.min(
                        maxQuantity,
                        quantity + 1
                      )
                    )
                  }
                  aria-label="Increase quantity"
                  title={quantity >= maxQuantity ? `Maximum quantity is ${maxQuantity}` : 'Increase quantity'}
                >
                  <Plus />
                </button>
              </div>

              <button
                disabled={!product.stock}
                className="button dark add-button"
                onClick={() =>
                  addToCart(
                    cartProduct,
                    quantity
                  )
                }
              >
                {product.stock
                  ? 'Add to bag'
                  : 'Unavailable'}
              </button>

              <button
                className={`detail-favorite ${
                  saved ? 'saved' : ''
                }`}
                onClick={() =>
                  toggleFavorite(product.id)
                }
                aria-label="Toggle favorite"
              >
                <Heart
                  fill={
                    saved
                      ? 'currentColor'
                      : 'none'
                  }
                />
              </button>
            </div>

            <div className="delivery-notes">
              <div>
                <Truck />
                <span>
                  <strong>
                    Delivery estimate
                  </strong>
                  Contact support for timing
                </span>
              </div>

              <div>
                <ShieldCheck />
                <span>
                  <strong>
                    30-day returns
                  </strong>
                  Simple and stress-free
                </span>
              </div>
            </div>

            <div className="detail-list">
              <h3>Complete product description</h3>

              <p className="full-product-description">{product.description || 'No additional description was provided by the seller.'}</p>

              <div className="product-facts">
                <div><Ruler /><span><small>Measurements / dimensions</small><strong>{product.measurements || 'Exact measurements were not provided by the seller.'}</strong></span></div>
                <div><Store /><span><small>Seller</small><strong>{product.sellerName || product.brand || 'StopShop Marketplace Seller'}</strong><em>{product.sellerEmail || product.sellerContact || 'Contact through StopShop Merchant Support'}</em></span></div>
              </div>

              <h3>Additional details</h3>

              <ul>
                {(product.details || []).map(
                  (detail) => (
                    <li key={detail}>
                      {detail}
                    </li>
                  )
                )}
              </ul>
            </div>

            <Link className="button dark contact-seller" to={`/support?type=Product+listing+problem&product=${encodeURIComponent(product.name)}&seller=${encodeURIComponent(product.sellerName || product.brand || '')}`}>Contact seller about this item</Link>
            {product.sellerEmail && <a className="button contact-seller" href={`mailto:${product.sellerEmail}?subject=${encodeURIComponent(`Question about ${product.name}`)}`}><Mail size={17} /> Email seller</a>}

            {product.externalUrl && <Link className="button light-button original-listing" to={`/shop?q=${encodeURIComponent(product.category || product.name)}`}>View similar products</Link>}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section muted-section">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  Complete the story
                </span>

                <h2>
                  You may also like.
                </h2>
              </div>
            </div>

            <div className="product-grid related-grid">
              {related.map((item) => (
                <ProductCard
                  product={item}
                  key={item.id}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
