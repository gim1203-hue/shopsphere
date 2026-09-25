import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { StoreProvider } from './context/StoreContext'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './index.css'
import './auth.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider><StoreProvider><App /></StoreProvider></AuthProvider>
    </HashRouter>
  </StrictMode>,
)
