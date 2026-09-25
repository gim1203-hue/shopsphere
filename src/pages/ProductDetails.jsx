import {
  ArrowLeft,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
} from 'lucide-react'

import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useStore } from '../context/StoreContext'
import { products } from '../data/products'
import { formatCurrency } from '../utils/format'
import { getAskKhanPrice } from '../utils/pricing'
import NotFound from './NotFound'

export default function ProductDetails() {
  const { productId } = useParams()

  const product = products.find(
    (item) =>
      item.id === Number(productId)
  )

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
  const askKhanPrice = Number(
    product.askKhanPrice ??
      getAskKhanPrice(sourcePrice)
  )

  // Only a real MSRP/list/original price
  const compareAtPrice = Number(
    product.compareAtPrice ??
      product.originalPrice ??
      product.listPrice ??
      product.msrp ??
      0
  )

  const showCompareAtPrice =
    compareAtPrice > askKhanPrice

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

            {showCompareAtPrice && (
              <span className="sale-badge">
                Sale
              </span>
            )}
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

            <div className="detail-price">
              {showCompareAtPrice && (
                <del>
                  {formatCurrency(
                    compareAtPrice
                  )}
                </del>
              )}

              <strong>
                {formatCurrency(
                  askKhanPrice
                )}
              </strong>
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
                  onClick={() =>
                    setQuantity(
                      Math.max(
                        1,
                        quantity - 1
                      )
                    )
                  }
                  aria-label="Decrease"
                >
                  <Minus />
                </button>

                <span>{quantity}</span>

                <button
                  onClick={() =>
                    setQuantity(
                      Math.min(
                        product.stock,
                        quantity + 1
                      )
                    )
                  }
                  aria-label="Increase"
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
                    Free delivery
                  </strong>
                  On orders over $100
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
              <h3>Details & care</h3>

              <ul>
                {product.details.map(
                  (detail) => (
                    <li key={detail}>
                      {detail}
                    </li>
                  )
                )}
              </ul>
            </div>
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