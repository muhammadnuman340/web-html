import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import './index.css'

// System theme detection — auto dark/light if no saved preference
(function detectSystemTheme() {
  if (!localStorage.getItem('uc_theme_class')) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) document.body.className = 'dark'
  }
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('uc_theme_class')) {
      document.body.className = e.matches ? 'dark' : ''
    }
  })
})()

import { loadBuiltinPlugins } from './engine/pluginSystem'

loadBuiltinPlugins()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
)

// Register service worker in production / preview environments
if ('serviceWorker' in navigator && (import.meta.env.PROD || import.meta.env.MODE === 'production')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((err) => {
      if (import.meta.env.DEV) {
        console.warn('Service worker registration failed:', err)
      }
    })
  })
}

