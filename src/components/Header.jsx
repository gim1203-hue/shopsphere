import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from 'lucide-react'

import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

import { useStore } from '../context/StoreContext'
import { useAuth } from '../context/AuthContext'
import { categories } from '../data/products'

export default function Header() {
  const { cartCount, favorites } = useStore()
  const { user } = useAuth()

  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  const navClass = ({ isActive }) =>
    isActive ? 'nav-link active' : 'nav-link'

  const submitSearch = (event) => {
    event.preventDefault()

    const cleanQuery = query.trim()

    if (!cleanQuery) {
      return
    }

    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(
      cleanQuery
    )}`

    window.open(
      googleSearchUrl,
      '_blank',
      'noopener,noreferrer'
    )

    setQuery('')
    setSearchOpen(false)
    setMenuOpen(false)
  }

  return (
    <>
      <div className="announcement">
        Free delivery on orders over $100
        <span>•</span>
        Easy 30-day returns
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <button
            className="icon-button mobile-only"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
            type="button"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>

          <Link
            to="/"
            className="logo"
            aria-label="ShopSphere home"
          >
            shop<span>sphere</span><i>.</i>
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
              onClick={() => setMenuOpen(false)}
            >
              Home
            </NavLink>

            <NavLink
              className={navClass}
              to="/shop"
              onClick={() => setMenuOpen(false)}
            >
              Shop all
            </NavLink>

            {categories.map((category) => (
              <NavLink
                key={category.name}
                className={navClass}
                to={`/shop?category=${encodeURIComponent(
                  category.name
                )}`}
                onClick={() => setMenuOpen(false)}
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
              aria-label="Search the web"
              type="button"
            >
              <Search />
            </button>

            <Link
              className="icon-button"
              to={user ? '/account' : '/login'}
              aria-label={
                user
                  ? 'My account'
                  : 'Sign in'
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
                autoFocus
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Search anything on the web…"
                aria-label="Search the web"
              />

              <button type="submit">
                Search Web
              </button>
            </div>
          </form>
        )}
      </header>
    </>
  )
}