import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
// Fonts are self-hosted (bundled) so no visitor data is sent to Google Fonts
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
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

// Unregister any active or redundant service workers
if ('serviceWorker' in navigator) {
  try {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().catch(() => {})
      }
    }).catch(() => {})
  } catch {
    // no-op if unsupported
  }
}

