import { createContext, useContext, useEffect, useState } from 'react'
import { products as initialProducts } from '../data/products'

const CatalogContext = createContext(null)

export function CatalogProvider({ children }) {
  const [products, setProducts] = useState(initialProducts)
  const [loading, setLoading] = useState(false)

  async function refreshCatalog() {
    setLoading(true)
    try {
      const response = await fetch('/api/catalog')
      if (!response.ok) throw new Error('Catalog unavailable')
      const data = await response.json()
      if (Array.isArray(data.products) && data.products.length) {
        setProducts(data.products)
      }
    } catch {
      setProducts(initialProducts)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    fetch('/api/catalog')
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!cancelled && Array.isArray(data?.products) && data.products.length) {
          setProducts(data.products)
        }
      })
      .catch(() => {})

    return () => { cancelled = true }
  }, [])

  return (
    <CatalogContext.Provider value={{ products, loading, refreshCatalog }}>
      {children}
    </CatalogContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCatalog() {
  return useContext(CatalogContext)
}