import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'

import {
  classifyRequest,
  isCacheableAssetResponse,
  isStaleOmegaCache,
  getOfflineFallbackForType,
  PWA_CACHE_PREFIX,
  PWA_STATIC_CACHE,
  PWA_PAGES_CACHE,
  PRECACHE_STATIC,
  PRECACHE_PAGES
} from '../src/utils/pwaLogic'

const APP_ORIGIN = 'https://numanx-studio-omega-converter.netlify.app'

interface MockSwEvent {
  request?: {
    method: string
    url: string
    mode?: string
    headers?: Headers
  }
  waitUntil?: (promise: Promise<unknown>) => void
  respondWith?: (promise: Promise<Response>) => void
}

type SwEventListener = (event: MockSwEvent) => void

describe('PWA Manifest & Static File Integrity', () => {
  it('public/manifest.json exists and parses as valid JSON', () => {
    assert.ok(fs.existsSync('public/manifest.json'), 'manifest.json must exist in public/')
    const raw = fs.readFileSync('public/manifest.json', 'utf8')
    const manifest = JSON.parse(raw)
    assert.equal(typeof manifest, 'object')
  })

  it('manifest includes required standard PWA fields', () => {
    const raw = fs.readFileSync('public/manifest.json', 'utf8')
    const manifest = JSON.parse(raw)

    assert.equal(manifest.name, 'Omega X Converter — NumanX Studio')
    assert.equal(manifest.short_name, 'Omega X')
    assert.equal(manifest.start_url, '/')
    assert.equal(manifest.scope, '/')
    assert.equal(manifest.display, 'standalone')
    assert.equal(manifest.theme_color, '#060919')
    assert.equal(manifest.background_color, '#060919')
    assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0)
  })

  it('every icon referenced in manifest.json physically exists on disk', () => {
    const raw = fs.readFileSync('public/manifest.json', 'utf8')
    const manifest = JSON.parse(raw)

    for (const icon of manifest.icons) {
      const rel = icon.src.replace(/^\//, '')
      const fullPath = path.join('public', rel)
      assert.ok(fs.existsSync(fullPath), `Icon file ${icon.src} must exist at ${fullPath}`)
      assert.equal(icon.type, 'image/svg+xml', 'SVG icons must truthfully declare image/svg+xml')
    }

    if (manifest.shortcuts) {
      for (const shortcut of manifest.shortcuts) {
        if (shortcut.icons) {
          for (const icon of shortcut.icons) {
            const rel = icon.src.replace(/^\//, '')
            const fullPath = path.join('public', rel)
            assert.ok(fs.existsSync(fullPath), `Shortcut icon ${icon.src} must exist at ${fullPath}`)
          }
        }
      }
    }
  })

  it('manifest icons are well-formed SVG files with valid graphics declarations', () => {
    const icon192 = fs.readFileSync('public/icons/icon-192.svg', 'utf8')
    const icon512 = fs.readFileSync('public/icons/icon-512.svg', 'utf8')
    const favicon = fs.readFileSync('public/favicon.svg', 'utf8')

    assert.ok(icon192.includes('<svg') && icon192.includes('192'), 'icon-192.svg must declare SVG graphics')
    assert.ok(icon512.includes('<svg') && icon512.includes('512'), 'icon-512.svg must declare SVG graphics')
    assert.ok(favicon.includes('<svg'), 'favicon.svg must declare SVG graphics')
  })
})

describe('HTML PWA Metadata & Theme Consistency', () => {
  it('index.html references the manifest and valid icons', () => {
    const html = fs.readFileSync('index.html', 'utf8')
    assert.ok(html.includes('<link rel="manifest" href="/manifest.json" />'), 'index.html must link to manifest.json')
    assert.ok(html.includes('<link rel="icon" type="image/svg+xml" href="/favicon.svg" />'), 'index.html must link to favicon.svg')
    assert.ok(html.includes('<link rel="apple-touch-icon" href="/icons/icon-192.svg" />'), 'index.html must link to existing apple-touch-icon')
    assert.ok(fs.existsSync('public/icons/icon-192.svg'), 'apple-touch-icon must physically exist')
  })

  it('index.html dark theme-color aligns with manifest theme_color', () => {
    const html = fs.readFileSync('index.html', 'utf8')
    const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'))

    assert.ok(html.includes('content="#060919" media="(prefers-color-scheme: dark)"'), 'index.html must set #060919 dark theme')
    assert.equal(manifest.theme_color, '#060919', 'manifest theme_color must match #060919')
  })
})

describe('Service Worker Registration & Component Lifecycle', () => {
  it('src/main.tsx registers /sw.js with explicit root scope in production', () => {
    const mainTsx = fs.readFileSync('src/main.tsx', 'utf8')
    assert.ok(mainTsx.includes("navigator.serviceWorker.register('/sw.js', { scope: '/' })"), 'SW registration must set scope: /')
    assert.ok(mainTsx.includes('import.meta.env.PROD'), 'SW registration must be production gated')
  })

  it('InstallPWA component is mounted exactly once in src/App.tsx', () => {
    const appTsx = fs.readFileSync('src/App.tsx', 'utf8')
    const matches = [...appTsx.matchAll(/<InstallPWA\s*\/>/g)]
    assert.equal(matches.length, 1, 'InstallPWA must be mounted exactly once')
  })

  it('InstallPWA component has event listener and timeout cleanup', () => {
    const installTsx = fs.readFileSync('src/components/widgets/InstallPWA.tsx', 'utf8')
    assert.ok(installTsx.includes('removeEventListener(\'beforeinstallprompt\''), 'Must clean up beforeinstallprompt listener')
    assert.ok(installTsx.includes('removeEventListener(\'appinstalled\''), 'Must clean up appinstalled listener')
    assert.ok(installTsx.includes('clearTimeout(timerId)'), 'Must clean up pending prompt delay timer')
    assert.ok(installTsx.includes('display-mode: standalone'), 'Must check standalone display mode')
  })
})

describe('Pure Request Classification & Fallback Isolation Rules', () => {
  it('correctly classifies navigation requests', () => {
    assert.equal(classifyRequest(`${APP_ORIGIN}/`, 'navigate', 'GET', APP_ORIGIN), 'NAVIGATION')
    assert.equal(classifyRequest(`${APP_ORIGIN}/convert/length`, 'navigate', 'GET', APP_ORIGIN), 'NAVIGATION')
    assert.equal(classifyRequest(`${APP_ORIGIN}/convert/length/meter-to-foot`, 'navigate', 'GET', APP_ORIGIN), 'NAVIGATION')
    assert.equal(classifyRequest(`${APP_ORIGIN}/about`, 'navigate', 'GET', APP_ORIGIN), 'NAVIGATION')
  })

  it('correctly classifies hashed Vite assets', () => {
    assert.equal(classifyRequest(`${APP_ORIGIN}/assets/index-Dk029x.js`, 'cors', 'GET', APP_ORIGIN), 'HASHED_ASSET')
    assert.equal(classifyRequest(`${APP_ORIGIN}/assets/style-Bx992a.css`, 'no-cors', 'GET', APP_ORIGIN), 'HASHED_ASSET')
  })

  it('correctly classifies other same-origin static assets', () => {
    assert.equal(classifyRequest(`${APP_ORIGIN}/favicon.svg`, 'no-cors', 'GET', APP_ORIGIN), 'STATIC_ASSET')
    assert.equal(classifyRequest(`${APP_ORIGIN}/manifest.json`, 'cors', 'GET', APP_ORIGIN), 'STATIC_ASSET')
    assert.equal(classifyRequest(`${APP_ORIGIN}/icons/icon-192.svg`, 'no-cors', 'GET', APP_ORIGIN), 'STATIC_ASSET')
  })

  it('correctly classifies cross-origin requests (financial APIs, fonts, analytics)', () => {
    assert.equal(classifyRequest('https://open.er-api.com/v6/latest/USD', 'cors', 'GET', APP_ORIGIN), 'CROSS_ORIGIN')
    assert.equal(classifyRequest('https://api.coingecko.com/api/v3/simple/price', 'cors', 'GET', APP_ORIGIN), 'CROSS_ORIGIN')
    assert.equal(classifyRequest('https://fonts.googleapis.com/css2', 'cors', 'GET', APP_ORIGIN), 'CROSS_ORIGIN')
    assert.equal(classifyRequest('https://fonts.gstatic.com/s/inter/v13.woff2', 'cors', 'GET', APP_ORIGIN), 'CROSS_ORIGIN')
  })

  it('correctly classifies non-GET requests as unsupported', () => {
    assert.equal(classifyRequest(`${APP_ORIGIN}/api/action`, 'cors', 'POST', APP_ORIGIN), 'UNSUPPORTED_METHOD')
    assert.equal(classifyRequest(`${APP_ORIGIN}/settings`, 'cors', 'PUT', APP_ORIGIN), 'UNSUPPORTED_METHOD')
    assert.equal(classifyRequest(`${APP_ORIGIN}/history`, 'cors', 'DELETE', APP_ORIGIN), 'UNSUPPORTED_METHOD')
  })

  it('CRITICAL SAFETY RULE: SPA fallback (/index.html) is ONLY returned for NAVIGATION', () => {
    assert.equal(getOfflineFallbackForType('NAVIGATION'), '/index.html')
    assert.equal(getOfflineFallbackForType('HASHED_ASSET'), null, 'Failed JS/CSS must NEVER receive HTML')
    assert.equal(getOfflineFallbackForType('STATIC_ASSET'), null, 'Failed image/font must NEVER receive HTML')
    assert.equal(getOfflineFallbackForType('CROSS_ORIGIN'), null, 'Failed cross-origin must NEVER receive HTML')
    assert.equal(getOfflineFallbackForType('UNSUPPORTED_METHOD'), null)
    assert.equal(getOfflineFallbackForType('UNSUPPORTED_PROTOCOL'), null)
    assert.equal(getOfflineFallbackForType('DEV_PATH'), null)
  })

  it('validates cacheable responses correctly', () => {
    assert.ok(isCacheableAssetResponse(200, true, 'application/javascript'))
    assert.ok(isCacheableAssetResponse(200, true, 'text/css'))
    assert.ok(isCacheableAssetResponse(200, true, 'image/svg+xml'))

    // Rejects errors and HTML masquerading as assets
    assert.equal(isCacheableAssetResponse(404, false, 'text/html'), false)
    assert.equal(isCacheableAssetResponse(500, false, 'text/plain'), false)
    assert.equal(isCacheableAssetResponse(200, true, 'text/html; charset=utf-8'), false, 'HTML must never be cached as asset')
  })
})

describe('Cache Architecture, Versioning & Safe Stale Cleanup', () => {
  it('uses authoritative cache prefixes and distinct static/pages caches', () => {
    assert.ok(PWA_CACHE_PREFIX.startsWith('omega-x-'), 'Cache prefix must be omega-x-')
    assert.ok(PWA_STATIC_CACHE.startsWith('omega-x-static-'), 'Static cache must have versioned name')
    assert.ok(PWA_PAGES_CACHE.startsWith('omega-x-pages-'), 'Pages cache must have versioned name')
    assert.notEqual(PWA_STATIC_CACHE, PWA_PAGES_CACHE, 'Static and pages caches must be isolated')
  })

  it('precaches essential static assets and pages shell', () => {
    assert.ok(PRECACHE_STATIC.includes('/favicon.svg'))
    assert.ok(PRECACHE_STATIC.includes('/manifest.json'))
    assert.ok(PRECACHE_STATIC.includes('/icons/icon-192.svg'))
    assert.ok(PRECACHE_STATIC.includes('/icons/icon-512.svg'))
    assert.ok(PRECACHE_PAGES.includes('/index.html'))
  })

  it('identifies and purges obsolete Omega caches without touching unrelated origin caches', () => {
    const activeCaches = new Set([PWA_STATIC_CACHE, PWA_PAGES_CACHE])

    // Obsolete Omega X caches
    assert.ok(isStaleOmegaCache('omega-x-static-v2', activeCaches), 'Must delete old static-v2')
    assert.ok(isStaleOmegaCache('omega-x-pages-v2', activeCaches), 'Must delete old pages-v2')
    assert.ok(isStaleOmegaCache('omega-x-v1', activeCaches), 'Must delete old legacy v1')

    // Current active Omega X caches
    assert.equal(isStaleOmegaCache(PWA_STATIC_CACHE, activeCaches), false, 'Must keep active static cache')
    assert.equal(isStaleOmegaCache(PWA_PAGES_CACHE, activeCaches), false, 'Must keep active pages cache')

    // Foreign / unrelated caches on same domain
    assert.equal(isStaleOmegaCache('foreign-app-cache', activeCaches), false, 'Must NOT touch foreign caches')
    assert.equal(isStaleOmegaCache('analytics-v1', activeCaches), false, 'Must NOT touch analytics cache')
    assert.equal(isStaleOmegaCache('other-suite-data', activeCaches), false, 'Must NOT touch other origin caches')
  })
})

describe('Service Worker Runtime Execution & Routing Simulation', () => {
  it('simulates public/sw.js lifecycle and request interceptors accurately', async () => {
    const swSource = fs.readFileSync('public/sw.js', 'utf8')

    // Mock storage
    const storage = new Map<string, Map<string, Response>>()
    const listeners: Record<string, SwEventListener> = {}

    const createMockCache = (name: string) => ({
      addAll: async (urls: string[]) => {
        let store = storage.get(name)
        if (!store) {
          store = new Map<string, Response>()
          storage.set(name, store)
        }
        for (const u of urls) {
          store.set(u, new Response(`Content of ${u}`, { status: 200 }))
        }
      },
      match: async (reqOrUrl: string | { url: string }) => {
        const u = typeof reqOrUrl === 'string' ? reqOrUrl : reqOrUrl.url
        const pathOnly = u.replace(APP_ORIGIN, '')
        const store = storage.get(name)
        return store ? (store.get(pathOnly) || store.get(u) || null) : null
      },
      put: async (req: string | { url: string }, res: Response) => {
        let store = storage.get(name)
        if (!store) {
          store = new Map<string, Response>()
          storage.set(name, store)
        }
        const u = typeof req === 'string' ? req : req.url
        const pathOnly = u.replace(APP_ORIGIN, '')
        store.set(pathOnly, res)
      }
    })

    const mockCaches = {
      open: async (name: string) => createMockCache(name),
      match: async (reqOrUrl: string | { url: string }) => {
        const u = typeof reqOrUrl === 'string' ? reqOrUrl : reqOrUrl.url
        const pathOnly = u.replace(APP_ORIGIN, '')
        for (const [, store] of storage.entries()) {
          const hit = store.get(pathOnly) || store.get(u)
          if (hit) return hit
        }
        return null
      },
      keys: async () => Array.from(storage.keys()),
      delete: async (name: string) => storage.delete(name)
    }

    const mockSelf = {
      location: { origin: APP_ORIGIN },
      addEventListener: (type: string, fn: SwEventListener) => {
        listeners[type] = fn
      }
    }

    let mockFetch: (req: { url: string; method: string; mode?: string; headers?: Headers }) => Promise<Response> =
      async () => new Response('Default Network', { status: 200 })

    const sandbox = {
      self: mockSelf,
      caches: mockCaches,
      fetch: (req: { url: string; method: string; mode?: string; headers?: Headers }) => mockFetch(req),
      URL,
      Response,
      Headers,
      Promise,
      Set,
      console
    }

    vm.runInNewContext(swSource, sandbox)

    // 1. Install Event Test
    assert.ok(listeners['install'], 'Install listener must be registered')
    let installWaitPromise: Promise<unknown> | null = null
    listeners['install']({ waitUntil: (p: Promise<unknown>) => { installWaitPromise = p } })
    await installWaitPromise

    assert.ok(storage.has('omega-x-static-v3'), 'Static cache must be created on install')
    assert.ok(storage.has('omega-x-pages-v3'), 'Pages cache must be created on install')

    // 2. Activate Event Test (Stale Cache Deletion)
    storage.set('omega-x-static-v2', new Map())
    storage.set('unrelated-domain-cache', new Map())

    let activateWaitPromise: Promise<unknown> | null = null
    listeners['activate']({ waitUntil: (p: Promise<unknown>) => { activateWaitPromise = p } })
    await activateWaitPromise

    assert.equal(storage.has('omega-x-static-v2'), false, 'Old omega cache must be deleted on activate')
    assert.equal(storage.has('unrelated-domain-cache'), true, 'Unrelated origin cache must be preserved on activate')

    // 3. Fetch Event Helper
    const runFetch = async (req: {
      method: string
      url: string
      mode: string
      headers: Headers
    }): Promise<Response | null> => {
      let respondPromise: Promise<Response> | null = null
      listeners['fetch']({
        request: req,
        respondWith: (p: Promise<Response>) => { respondPromise = p }
      })
      return respondPromise ? await respondPromise : null
    }

    // A. Navigation Request Online -> returns network response
    mockFetch = async () => new Response('Online Document HTML', {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    })
    const navOnlineRes = await runFetch({
      method: 'GET',
      url: `${APP_ORIGIN}/convert/length`,
      mode: 'navigate',
      headers: new Headers({ accept: 'text/html' })
    })
    assert.ok(navOnlineRes)
    assert.equal(await navOnlineRes.text(), 'Online Document HTML')

    // B. Navigation Request Offline -> falls back to cached /index.html
    mockFetch = async () => { throw new TypeError('Network down') }
    const navOfflineRes = await runFetch({
      method: 'GET',
      url: `${APP_ORIGIN}/convert/mass`,
      mode: 'navigate',
      headers: new Headers({ accept: 'text/html' })
    })
    assert.ok(navOfflineRes, 'Offline navigation must resolve to cached shell')
    const navOfflineText = await navOfflineRes.text()
    assert.equal(navOfflineText, 'Content of /index.html')

    // C. Hashed JS Asset Request Online -> caches and returns
    mockFetch = async () => new Response('console.log("chunk");', {
      status: 200,
      headers: { 'Content-Type': 'application/javascript' }
    })
    const jsOnlineRes = await runFetch({
      method: 'GET',
      url: `${APP_ORIGIN}/assets/bundle-123.js`,
      mode: 'cors',
      headers: new Headers()
    })
    assert.ok(jsOnlineRes)
    assert.equal(await jsOnlineRes.text(), 'console.log("chunk");')

    // D. Failed Hashed JS Asset Request Offline -> MUST REJECT, NEVER RETURN HTML
    mockFetch = async () => { throw new TypeError('Network failure') }
    await assert.rejects(
      async () => {
        await runFetch({
          method: 'GET',
          url: `${APP_ORIGIN}/assets/nonexistent-chunk.js`,
          mode: 'cors',
          headers: new Headers()
        })
      },
      /Network failure/,
      'Failed JS request must fail as a network error, NEVER returning index.html'
    )

    // E. Failed CSS Asset Request Offline -> MUST REJECT, NEVER RETURN HTML
    await assert.rejects(
      async () => {
        await runFetch({
          method: 'GET',
          url: `${APP_ORIGIN}/assets/nonexistent-style.css`,
          mode: 'no-cors',
          headers: new Headers()
        })
      },
      /Network failure/,
      'Failed CSS request must fail as a network error, NEVER returning index.html'
    )

    // F. Failed Image Request Offline -> Returns 404 plain text, NEVER HTML
    const imgFailRes = await runFetch({
      method: 'GET',
      url: `${APP_ORIGIN}/icons/missing-icon.png`,
      mode: 'no-cors',
      headers: new Headers()
    })
    assert.ok(imgFailRes, 'Missing static asset returns fallback response')
    assert.equal(imgFailRes.status, 404)
    assert.equal(imgFailRes.headers.get('Content-Type'), 'text/plain; charset=utf-8')
    assert.equal(await imgFailRes.text(), 'Asset not found')

    // G. Cross-Origin Request -> NOT INTERCEPTED (respondWith not called)
    const crossOriginRes = await runFetch({
      method: 'GET',
      url: 'https://open.er-api.com/v6/latest/USD',
      mode: 'cors',
      headers: new Headers()
    })
    assert.equal(crossOriginRes, null, 'Cross-origin APIs must pass through untouched')

    // H. Non-GET Request -> NOT INTERCEPTED (respondWith not called)
    const postRes = await runFetch({
      method: 'POST',
      url: `${APP_ORIGIN}/convert`,
      mode: 'cors',
      headers: new Headers()
    })
    assert.equal(postRes, null, 'Non-GET requests must pass through untouched')
  })
})
