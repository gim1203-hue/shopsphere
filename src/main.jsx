import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { StoreProvider } from './context/StoreContext'
import { AuthProvider } from './context/AuthContext'
import { CatalogProvider } from './context/CatalogContext'
import ErrorBoundary from './components/ErrorBoundary'
import App from './App'
import './index.css'
import './auth.css'
import './admin.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <ErrorBoundary><AuthProvider><CatalogProvider><StoreProvider><App /></StoreProvider></CatalogProvider></AuthProvider></ErrorBoundary>
    </HashRouter>
  </StrictMode>,
)
