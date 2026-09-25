import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from 'lucide-react'

import { useState } from 'react'
import {
  Link,
  NavLink,
  useNavigate,
} from 'react-router-dom'

import { useStore } from '../context/StoreContext'
import { useAuth } from '../context/AuthContext'
import {
  categories,
  products,
} from '../data/products'

export default function Header() {
  const { cartCount, favorites } = useStore()
  const { user } = useAuth()

  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  const navigate = useNavigate()

  const searchOptions = [
    ...new Set(
      products.flatMap((product) => [
        product.name,
        product.category,
        product.brand,
        product.color,
        product.description,
        ...(product.details || []),
        ...(product.tags || []),
      ])
    ),
  ]
    .filter(Boolean)
    .sort()

  function submitSearch(event) {
    event.preventDefault()

    const cleanQuery = query.trim()

    if (!cleanQuery) return

    navigate(
      `/shop?q=${encodeURIComponent(cleanQuery)}`
    )

    setSearchOpen(false)
    setMenuOpen(false)
  }

  const navClass = ({ isActive }) =>
    isActive
      ? 'nav-link active'
      : 'nav-link'

  return (
    <>
      <div className="announcement">
        AskKhan Marketplace
        <span>•</span>
        Search everything in our store
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <button
            className="icon-button mobile-only"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            aria-label="Toggle navigation"
            type="button"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>

          <Link
            to="/"
            className="logo"
            aria-label="AskKhan home"
          >
            Ask<span>Khan</span><i>.</i>
          </Link>

          <nav
            className={
              menuOpen
                ? 'main-nav open'
                : 'main-nav'
            }
          >
            <NavLink
              className={navClass}
              to="/"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              Home
            </NavLink>

            <NavLink
              className={navClass}
              to="/shop"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              Shop All
            </NavLink>

            {categories.map((category) => (
              <NavLink
                key={category.name}
                className={navClass}
                to={`/shop?category=${encodeURIComponent(
                  category.name
                )}`}
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                {category.name}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <button
              className="icon-button search-trigger"
              onClick={() =>
                setSearchOpen(!searchOpen)
              }
              aria-label="Search AskKhan"
              type="button"
            >
              <Search />
            </button>

            <Link
              className="icon-button"
              to={user ? '/account' : '/login'}
              aria-label={
                user ? 'My account' : 'Sign in'
              }
            >
              <UserRound />
            </Link>

            <Link
              className="icon-button"
              to="/favorites"
              aria-label={`Favorites, ${favorites.length} items`}
            >
              <Heart />

              {favorites.length > 0 && (
                <span className="count-badge">
                  {favorites.length}
                </span>
              )}
            </Link>

            <Link
              className="icon-button"
              to="/cart"
              aria-label={`Cart, ${cartCount} items`}
            >
              <ShoppingBag />

              {cartCount > 0 && (
                <span className="count-badge">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {searchOpen && (
          <form
            className="header-search"
            onSubmit={submitSearch}
          >
            <div className="container">
              <Search />

              <input
                list="askkhan-search-options"
                autoFocus
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Search AskKhan..."
                aria-label="Search AskKhan"
              />

              <datalist id="askkhan-search-options">
                {searchOptions.map((option) => (
                  <option
                    key={option}
                    value={option}
                  />
                ))}
              </datalist>

              <button type="submit">
                Search
              </button>
            </div>
          </form>
        )}
      </header>
    </>
  )
}