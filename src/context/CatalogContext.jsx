import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from 'react'

import {
  products as initialProducts,
} from '../data/products'

const CatalogContext =
  createContext(null)

function mergeProducts(
  localProducts,
  remoteProducts
) {
  const map = new Map()

  localProducts.forEach((product) => {
    map.set(
      String(product.id),
      product
    )
  })

  remoteProducts.forEach((product) => {
    const key =
      String(
        product.id ??
        product.externalUrl ??
        product.name
      )

    map.set(key, {
      ...map.get(key),
      ...product,
    })
  })

  return [...map.values()]
}

export function CatalogProvider({
  children,
}) {
  const [products, setProducts] =
    useState(initialProducts)

  const [loading, setLoading] =
    useState(false)

  const addProducts = useCallback((newProducts) => {
    if (!Array.isArray(newProducts) || !newProducts.length) return
    setProducts((current) => mergeProducts(current, newProducts))
  }, [])

  async function refreshCatalog() {
    setLoading(true)

    try {
      const response =
        await fetch('/api/catalog')

      if (!response.ok) {
        throw new Error(
          'Catalog unavailable'
        )
      }

      const data =
        await response.json()

      const remoteProducts =
        Array.isArray(data.products)
          ? data.products
          : []

      setProducts(
        mergeProducts(
          initialProducts,
          remoteProducts
        )
      )
    } catch {
      setProducts(initialProducts)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    fetch('/api/catalog')
      .then((response) =>
        response.ok
          ? response.json()
          : null
      )
      .then((data) => {
        if (cancelled) return

        const remoteProducts =
          Array.isArray(data?.products)
            ? data.products
            : []

        setProducts(
          mergeProducts(
            initialProducts,
            remoteProducts
          )
        )
      })
      .catch(() => {
        if (!cancelled) {
          setProducts(initialProducts)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <CatalogContext.Provider
      value={{
        products,
        loading,
        refreshCatalog,
        addProducts,
      }}
    >
      {children}
    </CatalogContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCatalog() {
  return useContext(CatalogContext)
}
