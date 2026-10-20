// Omega X Converter - Service Worker (Production-Safe & Reliable)
const CACHE_VERSION = 'v3'
const CACHE_PREFIX = 'omega-x-'
const STATIC_CACHE = `${CACHE_PREFIX}static-${CACHE_VERSION}`
const PAGES_CACHE = `${CACHE_PREFIX}pages-${CACHE_VERSION}`

const PRECACHE_STATIC = [
  '/favicon.svg',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
]

const PRECACHE_PAGES = [
  '/index.html'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_STATIC)),
      caches.open(PAGES_CACHE).then((cache) => cache.addAll(PRECACHE_PAGES))
    ])
  )
})

self.addEventListener('activate', (event) => {
  const currentCaches = new Set([STATIC_CACHE, PAGES_CACHE])
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && !currentCaches.has(key))
          .map((key) => caches.delete(key))
      )
    )
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  // 1. Only intercept GET requests
  if (request.method !== 'GET') return

  // 2. Only intercept HTTP and HTTPS requests (ignore chrome-extension:, etc.)
  let url
  try {
    url = new URL(request.url)
  } catch {
    return
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return

  // 3. Pass through cross-origin requests untouched (live currency/crypto APIs, fonts, analytics)
  if (url.origin !== self.location.origin) return

  // 4. Do not interfere with Vite development or internal endpoints
  if (url.pathname.startsWith('/@') || url.pathname.startsWith('/src/')) return

  // 5. NAVIGATION / DOCUMENT REQUESTS: Network-first with cached /index.html fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(PAGES_CACHE).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(async () => {
          const cached = await caches.match(request)
          if (cached) return cached
          const shell = await caches.match('/index.html')
          if (shell) return shell
          return new Response('Offline - Omega X Converter Shell unavailable', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          })
        })
    )
    return
  }

  // 6. SAME-ORIGIN HASHED VITE ASSETS (/assets/*): Cache-first with network fallback
  // CRITICAL: A failed asset request must NEVER receive HTML!
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response.ok && response.status === 200) {
            const contentType = response.headers.get('content-type') || ''
            if (!contentType.includes('text/html')) {
              const clone = response.clone()
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone))
            }
          }
          return response
        })
      })
    )
    return
  }

  // 7. OTHER SAME-ORIGIN STATIC ASSETS (/icons/*, /favicon.svg, /manifest.json):
  // Stale-while-revalidate / Cache-first. NEVER return index.html or HTML!
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response.ok && response.status === 200) {
            const contentType = response.headers.get('content-type') || ''
            if (!contentType.includes('text/html')) {
              const clone = response.clone()
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone))
            }
          }
          return response
        })
        .catch(() => null)

      return (
        cached ||
        fetchPromise.then((networkRes) => {
          if (networkRes) return networkRes
          return new Response('Asset not found', {
            status: 404,
            statusText: 'Not Found',
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          })
        })
      )
    })
  )
})
