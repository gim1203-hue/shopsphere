import {
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'

import {
  useMemo,
  useState,
} from 'react'

import {
  useSearchParams,
} from 'react-router-dom'

import PageIntro from '../components/PageIntro'
import ProductCard from '../components/ProductCard'
import { products } from '../data/products'

export default function Shop() {
  const [params, setParams] =
    useSearchParams()

  const [
    filtersOpen,
    setFiltersOpen,
  ] = useState(false)

  const query =
    params.get('q') || ''

  const category =
    params.get('category') || 'All'

  const sort =
    params.get('sort') || 'featured'

  const categories =
    useMemo(() => {
      return [
        ...new Set(
          products
            .map(
              (product) =>
                product.category
            )
            .filter(Boolean)
        ),
      ].sort()
    }, [])

  const searchOptions =
    useMemo(() => {
      return [
        ...new Set(
          products.flatMap(
            (product) => [
              product.name,
              product.brand,
              product.category,
              product.subcategory,
              product.color,
              product.description,
              ...(product.details || []),
              ...(product.tags || []),
              ...(product.keywords || []),
            ]
          )
        ),
      ]
        .filter(Boolean)
        .sort()
    }, [])

  function setParam(
    key,
    value,
    fallback = ''
  ) {
    const next =
      new URLSearchParams(params)

    if (
      value &&
      value !== fallback
    ) {
      next.set(key, value)
    } else {
      next.delete(key)
    }

    setParams(next)
  }

  function normalize(value) {
    return String(value ?? '')
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      )
      .toLowerCase()
  }

  const filtered =
    useMemo(() => {
      const queryTerms =
        normalize(query)
          .trim()
          .split(/\s+/)
          .filter(Boolean)

      const result =
        products.filter(
          (product) => {
            const searchableText =
              normalize(
                [
                  product.name,
                  product.brand,
                  product.category,
                  product.subcategory,
                  product.description,
                  product.color,
                  ...(product.details || []),
                  ...(product.tags || []),
                  ...(product.keywords || []),
                ].join(' ')
              )

            const matchesSearch =
              queryTerms.length === 0 ||
              queryTerms.every(
                (term) =>
                  searchableText.includes(
                    term
                  )
              )

            const matchesCategory =
              category === 'All' ||
              product.category ===
                category

            return (
              matchesSearch &&
              matchesCategory
            )
          }
        )

      return [...result].sort(
        (a, b) => {
          if (
            sort === 'price-low'
          ) {
            return (
              Number(a.price) -
              Number(b.price)
            )
          }

          if (
            sort === 'price-high'
          ) {
            return (
              Number(b.price) -
              Number(a.price)
            )
          }

          if (
            sort === 'rating'
          ) {
            return (
              Number(b.rating || 0) -
              Number(a.rating || 0)
            )
          }

          return (
            Number(b.featured) -
            Number(a.featured)
          )
        }
      )
    }, [
      category,
      query,
      sort,
    ])

  return (
    <>
      <PageIntro
        eyebrow="ASKKHAN MARKETPLACE"
        title="Shop everything."
        text="Search products across the AskKhan marketplace."
      />

      <section className="container shop-layout">
        <aside
          className={
            filtersOpen
              ? 'filters open'
              : 'filters'
          }
        >
          <div className="filter-mobile-head">
            <strong>
              Categories
            </strong>

            <button
              type="button"
              onClick={() =>
                setFiltersOpen(false)
              }
            >
              <X />
            </button>
          </div>

          <h3>Category</h3>

          {[
            'All',
            ...categories,
          ].map((item) => {
            const count =
              item === 'All'
                ? products.length
                : products.filter(
                    (product) =>
                      product.category ===
                      item
                  ).length

            return (
              <button
                type="button"
                key={item}
                className={
                  category === item
                    ? 'selected'
                    : ''
                }
                onClick={() =>
                  setParam(
                    'category',
                    item,
                    'All'
                  )
                }
              >
                {item}

                <span>
                  {count}
                </span>
              </button>
            )
          })}
        </aside>

        <div className="shop-results">
          <div className="shop-toolbar">
            <label>
              <Search size={18} />

              <input
                list="shop-search-options"
                value={query}
                onChange={(event) =>
                  setParam(
                    'q',
                    event.target.value
                  )
                }
                placeholder="Search AskKhan..."
              />

              <datalist id="shop-search-options">
                {searchOptions.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    />
                  )
                )}
              </datalist>
            </label>

            <button
              type="button"
              className="filter-trigger"
              onClick={() =>
                setFiltersOpen(true)
              }
            >
              <SlidersHorizontal
                size={18}
              />

              Filters
            </button>

            <span>
              {filtered.length}{' '}
              {filtered.length === 1
                ? 'product'
                : 'products'}
            </span>

            <select
              value={sort}
              onChange={(event) =>
                setParam(
                  'sort',
                  event.target.value,
                  'featured'
                )
              }
            >
              <option value="featured">
                Featured first
              </option>

              <option value="price-low">
                Price: low to high
              </option>

              <option value="price-high">
                Price: high to low
              </option>

              <option value="rating">
                Highest rated
              </option>
            </select>
          </div>

          {filtered.length ? (
            <div className="product-grid shop-grid">
              {filtered.map(
                (product) => (
                  <ProductCard
                    product={product}
                    key={product.id}
                  />
                )
              )}
            </div>
          ) : (
            <div className="no-results">
              <h2>
                No matching products
              </h2>

              <p>
                This product is not in
                the current AskKhan
                catalog yet.
              </p>

              <button
                type="button"
                className="button dark"
                onClick={() =>
                  setParams({})
                }
              >
                View all products
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}