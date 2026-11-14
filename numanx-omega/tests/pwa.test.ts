import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'

describe('Service Worker Kill-Switch & PWA Removal', () => {
  it('public/sw.js exists and implements the cache-clearing kill-switch', () => {
    assert.ok(fs.existsSync('public/sw.js'), 'public/sw.js must exist to replace installed workers')
    const swSource = fs.readFileSync('public/sw.js', 'utf8')

    // Must contain cache purge and unregister
    assert.ok(swSource.includes('caches.delete'), 'Worker must call caches.delete')
    assert.ok(swSource.includes('unregister()'), 'Worker must call unregister()')
    assert.ok(swSource.includes('skipWaiting()'), 'Worker must call skipWaiting() on install')
    assert.ok(swSource.includes('clients.matchAll'), 'Worker must query window clients on activate')
    assert.ok(swSource.includes('navigate'), 'Worker must navigate clients to reload')

    // Must NEVER contain a fetch listener or caching handler
    assert.ok(!swSource.includes("addEventListener('fetch'"), 'Worker must NOT register a fetch listener')
    assert.ok(!swSource.includes('addEventListener("fetch"'), 'Worker must NOT register a fetch listener')
    assert.ok(!swSource.includes('respondWith'), 'Worker must NOT contain respondWith')
  })

  it('simulates kill-switch lifecycle in VM environment', async () => {
    const swSource = fs.readFileSync('public/sw.js', 'utf8')

    const deletedCaches: string[] = []
    const existingCaches = ['omega-x-static-v5', 'omega-x-pages-v5', 'old-cache-v1']
    let unregistered = false
    let skippedWaiting = false
    const reloadedUrls: string[] = []

    type SwListener = (event: { waitUntil?: (p: Promise<unknown>) => void }) => void
    const listeners: Record<string, SwListener> = {}

    const mockClients = [
      {
        url: 'https://converter.numanxstudio.com/convert/length',
        navigate: (u: string) => {
          reloadedUrls.push(u)
        },
      },
    ]

    const mockSelf = {
      addEventListener: (type: string, fn: SwListener) => {
        listeners[type] = fn
      },
      skipWaiting: () => {
        skippedWaiting = true
      },
      registration: {
        unregister: async () => {
          unregistered = true
          return true
        },
      },
      clients: {
        matchAll: async () => mockClients,
      },
    }

    const mockCaches = {
      keys: async () => [...existingCaches],
      delete: async (k: string) => {
        deletedCaches.push(k)
        return true
      },
    }

    const sandbox = {
      self: mockSelf,
      caches: mockCaches,
      Promise,
      console,
    }

    vm.runInNewContext(swSource, sandbox)

    // 1. Install phase: skipWaiting
    assert.ok(listeners['install'], 'Install listener must be attached')
    listeners['install']({})
    assert.equal(skippedWaiting, true, 'Worker must skip waiting on install')

    // 2. Activate phase: purge caches, unregister, reload open windows
    assert.ok(listeners['activate'], 'Activate listener must be attached')
    let activatePromise: Promise<unknown> | null = null
    listeners['activate']({
      waitUntil: (p: Promise<unknown>) => {
        activatePromise = p
      },
    })
    await activatePromise

    assert.deepEqual(deletedCaches, existingCaches, 'Worker must delete all caches')
    assert.equal(unregistered, true, 'Worker must unregister itself on activate')
    assert.deepEqual(
      reloadedUrls,
      ['https://converter.numanxstudio.com/convert/length'],
      'Worker must reload client windows'
    )

    // 3. Confirm no fetch listener exists
    assert.equal(listeners['fetch'], undefined, 'No fetch event listener should be registered')
  })

  it('no source file in src/ registers a service worker', () => {
    const searchDir = (dir: string): string[] => {
      let results: string[] = []
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          results = results.concat(searchDir(full))
        } else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) {
          results.push(full)
        }
      }
      return results
    }

    const srcFiles = searchDir('src')
    const regToken = ['serviceWorker', 'register'].join('.')
    const regPattern = new RegExp(regToken)

    for (const file of srcFiles) {
      const code = fs.readFileSync(file, 'utf8')
      assert.ok(
        !regPattern.test(code),
        `Source file ${file} must not call serviceWorker.register`
      )
    }
  })

  it('src/main.tsx cleans up existing service worker registrations on load', () => {
    const mainCode = fs.readFileSync('src/main.tsx', 'utf8')
    assert.ok(mainCode.includes('getRegistrations()'), 'main.tsx must inspect existing registrations')
    assert.ok(mainCode.includes('registration.unregister()'), 'main.tsx must unregister registrations')
    assert.ok(mainCode.includes('try {'), 'main.tsx unregister logic must be wrapped in try/catch')
  })

  it('InstallPWA component and references are completely eliminated', () => {
    assert.ok(!fs.existsSync('src/components/widgets/InstallPWA.tsx'), 'InstallPWA.tsx must be deleted')
    const appCode = fs.readFileSync('src/App.tsx', 'utf8')
    assert.ok(!appCode.includes('InstallPWA'), 'App.tsx must not reference InstallPWA')
  })

  it('index.html omits manifest link while retaining essential web icons and theme', () => {
    const html = fs.readFileSync('index.html', 'utf8')
    assert.ok(!html.includes('<link rel="manifest"'), 'index.html must not include manifest link')
    assert.ok(html.includes('rel="icon"'), 'index.html must retain favicon')
    assert.ok(html.includes('rel="apple-touch-icon"'), 'index.html must retain apple-touch-icon')
    assert.ok(html.includes('name="theme-color"'), 'index.html must retain theme-color')
  })

  it('public/_headers configures immediate cache invalidation for kill-switch worker', () => {
    const headers = fs.readFileSync('public/_headers', 'utf8')
    assert.ok(headers.includes('/sw.js'), '_headers must configure /sw.js')
    assert.ok(
      headers.includes('no-cache, no-store, must-revalidate'),
      '_headers must serve /sw.js with no-cache, no-store, must-revalidate'
    )
  })
})
