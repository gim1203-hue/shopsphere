import { createContext, useContext, useEffect, useState } from 'react'
import { products } from '../data/products'

const StoreContext = createContext(null)

const readSaved = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => readSaved('shopsphere-cart', []))
  const [favorites, setFavorites] = useState(() => readSaved('shopsphere-favorites', []))
  const [notice, setNotice] = useState('')

  useEffect(() => {
    localStorage.setItem('shopsphere-cart', JSON.stringify(cart))
  }, [cart])
  useEffect(() => {
    localStorage.setItem('shopsphere-favorites', JSON.stringify(favorites))
  }, [favorites])
  useEffect(() => {
    if (!notice) return undefined
    const timer = setTimeout(() => setNotice(''), 2400)
    return () => clearTimeout(timer)
  }, [notice])

  const addToCart = (product, quantity = 1) => {
    if (!product.stock) return
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id)
      return existing
        ? current.map((item) => item.id === product.id ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) } : item)
        : [...current, { ...product, quantity: Math.min(quantity, product.stock) }]
    })
    setNotice(`${product.name} added to your bag`)
  }

  const updateQuantity = (id, quantity) => setCart((current) => current.map((item) => item.id === id ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) } : item))
  const removeFromCart = (id) => setCart((current) => current.filter((item) => item.id !== id))
  const clearCart = () => setCart([])
  const toggleFavorite = (id) => {
    const product = products.find((item) => item.id === id)
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
    setNotice(favorites.includes(id) ? `${product.name} removed from favorites` : `${product.name} saved to favorites`)
  }

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const favoriteProducts = products.filter((product) => favorites.includes(product.id))
  const value = { cart, favorites, favoriteProducts, notice, cartCount, subtotal, addToCart, updateQuantity, removeFromCart, clearCart, toggleFavorite }

  return <StoreContext.Provider value={value}>{children}{notice && <div className="toast" role="status">{notice}</div>}</StoreContext.Provider>
}

// The hook intentionally lives beside its provider so the store API stays in one place.
// eslint-disable-next-line react-refresh/only-export-components
export const useStore = () => useContext(StoreContext)
