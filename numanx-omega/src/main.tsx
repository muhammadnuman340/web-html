import React from 'react'
import ReactDOM from 'react-dom/client'
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* offline fallback */ })
  })
}
