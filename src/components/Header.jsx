import { Heart, Menu, Search, ShoppingBag, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'

export default function Header() {
  const { cartCount, favorites } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const submitSearch = (event) => {
    event.preventDefault()
    if (query.trim()) navigate(`/shop?q=${encodeURIComponent(query.trim())}`)
    setSearchOpen(false); setMenuOpen(false)
  }
  const navClass = ({ isActive }) => isActive ? 'nav-link active' : 'nav-link'

  return (
    <>
      <div className="announcement">Free delivery on orders over $100 <span>•</span> Easy 30-day returns</div>
      <header className="site-header">
        <div className="container header-inner">
          <button className="icon-button mobile-only" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X /> : <Menu />}</button>
          <Link to="/" className="logo" aria-label="ShopSphere home">shop<span>sphere</span><i>.</i></Link>
          <nav className={menuOpen ? 'main-nav open' : 'main-nav'}>
            <NavLink className={navClass} to="/" onClick={() => setMenuOpen(false)}>Home</NavLink>
            <NavLink className={navClass} to="/shop" onClick={() => setMenuOpen(false)}>Shop all</NavLink>
            <NavLink className={navClass} to="/shop?category=Home" onClick={() => setMenuOpen(false)}>Home</NavLink>
            <NavLink className={navClass} to="/shop?category=Tech" onClick={() => setMenuOpen(false)}>Tech</NavLink>
            <NavLink className={navClass} to="/shop?category=Style" onClick={() => setMenuOpen(false)}>Style</NavLink>
          </nav>
          <div className="header-actions">
            <button className="icon-button search-trigger" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search"><Search /></button>
            <Link className="icon-button" to="/favorites" aria-label={`Favorites, ${favorites.length} items`}><Heart />{favorites.length > 0 && <span className="count-badge">{favorites.length}</span>}</Link>
            <Link className="icon-button" to="/cart" aria-label={`Cart, ${cartCount} items`}><ShoppingBag />{cartCount > 0 && <span className="count-badge">{cartCount}</span>}</Link>
          </div>
        </div>
        {searchOpen && <form className="header-search" onSubmit={submitSearch}><div className="container"><Search /><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search thoughtful goods…" aria-label="Search products" /><button type="submit">Search</button></div></form>}
      </header>
    </>
  )
}
