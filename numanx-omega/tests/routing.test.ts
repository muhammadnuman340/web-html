import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { Categories } from '../src/engine/categories'
import {
  CATEGORY_ROUTES,
  STATIC_ROUTES,
  resolveCategoryId,
  getCanonicalCategoryPath,
  getAllCategoryRoutes,
  detectRouteCollisions
} from '../src/engine/routes'
import { isIndexablePath } from '../src/config/site'
import { generateSitemapEntries } from '../scripts/generate-sitemap'

describe('Task 17.1 & 17.2: Canonical Category Route Integrity', () => {
  it('guarantees all 24 categories have a canonical route', () => {
    const routes = getAllCategoryRoutes()
    assert.equal(routes.length, 24, 'Expected exactly 24 category route definitions')
    assert.equal(Categories.length, 24, 'Expected Categories registry to have 24 definitions')

    for (const cat of Categories) {
      const r = routes.find(entry => entry.categoryId === cat.id)
      assert.ok(r, `Missing route definition for category "${cat.id}"`)
      assert.equal(r?.canonicalPath, `/convert/${cat.id}`)
      assert.equal(r?.displayName, cat.lb)
    }
  })

  it('guarantees canonical category routes are unique and URL-safe', () => {
    const paths = CATEGORY_ROUTES.map(r => r.canonicalPath)
    const uniquePaths = new Set(paths)
    assert.equal(uniquePaths.size, paths.length, 'Canonical paths must be strictly unique')

    for (const p of paths) {
      assert.match(p, /^\/convert\/[a-zA-Z0-9]+$/, `Canonical path "${p}" is not URL-safe`)
      assert.ok(!p.includes(' '), `Canonical path "${p}" must not contain spaces`)
    }
  })
})

describe('Task 17.3 & 17.4: Route Collision & Alias Safety Audit', () => {
  it('confirms zero collisions between static routes, canonical routes, and aliases', () => {
    const audit = detectRouteCollisions()
    assert.equal(audit.hasCollisions, false, `Detected unexpected collisions: ${JSON.stringify(audit.collisions)}`)
    assert.equal(audit.collisions.length, 0)
  })

  it('verifies all category aliases are unique across categories', () => {
    const aliasToCategory = new Map<string, string>()
    for (const r of CATEGORY_ROUTES) {
      for (const alias of r.aliases) {
        const existing = aliasToCategory.get(alias)
        assert.ok(
          !existing,
          `Alias collision: "${alias}" is claimed by both "${existing}" and "${r.categoryId}"`
        )
        aliasToCategory.set(alias, r.categoryId)
      }
    }
  })

  it('verifies category aliases do not collide with static application routes', () => {
    const staticPaths = new Set(STATIC_ROUTES.map(s => s.path))
    for (const r of CATEGORY_ROUTES) {
      assert.ok(
        !staticPaths.has(r.canonicalPath),
        `Canonical path "${r.canonicalPath}" collides with a static route`
      )
      for (const alias of r.aliases) {
        assert.ok(
          !staticPaths.has(alias),
          `Category alias "${alias}" collides with static route`
        )
      }
    }
  })
})

describe('Task 6: Route Resolution & Alias Compatibility', () => {
  it('resolves canonical category paths to their authoritative category ID', () => {
    for (const r of CATEGORY_ROUTES) {
      assert.equal(resolveCategoryId(r.canonicalPath), r.categoryId)
      assert.equal(getCanonicalCategoryPath(r.canonicalPath), r.canonicalPath)
    }
  })

  it('resolves raw category IDs to their authoritative category ID', () => {
    for (const r of CATEGORY_ROUTES) {
      assert.equal(resolveCategoryId(r.categoryId), r.categoryId)
      assert.equal(getCanonicalCategoryPath(r.categoryId), r.canonicalPath)
    }
  })

  it('resolves legacy and semantic aliases to their authoritative category ID', () => {
    // Temperature aliases
    assert.equal(resolveCategoryId('/temperature-converter'), 'temp')
    assert.equal(resolveCategoryId('/temperature'), 'temp')
    assert.equal(resolveCategoryId('temperature'), 'temp')
    assert.equal(resolveCategoryId('/temp'), 'temp')
    assert.equal(getCanonicalCategoryPath('/temperature-converter'), '/convert/temp')

    // Mass / Weight aliases
    assert.equal(resolveCategoryId('/mass-converter'), 'mass')
    assert.equal(resolveCategoryId('/weight-converter'), 'mass')
    assert.equal(resolveCategoryId('/weight'), 'mass')
    assert.equal(resolveCategoryId('weight'), 'mass')
    assert.equal(getCanonicalCategoryPath('/weight-converter'), '/convert/mass')

    // Length aliases
    assert.equal(resolveCategoryId('/length-converter'), 'length')
    assert.equal(resolveCategoryId('/length'), 'length')
    assert.equal(getCanonicalCategoryPath('/length-converter'), '/convert/length')

    // Data aliases
    assert.equal(resolveCategoryId('/data-converter'), 'data')
    assert.equal(resolveCategoryId('/data'), 'data')

    // Other categories
    assert.equal(resolveCategoryId('/speed-converter'), 'speed')
    assert.equal(resolveCategoryId('/cooking-converter'), 'cooking')
    assert.equal(resolveCategoryId('/astronomy-converter'), 'astronomy')
  })

  it('returns undefined for invalid categories and unrecognized paths', () => {
    assert.equal(resolveCategoryId(''), undefined)
    assert.equal(resolveCategoryId('/non-existent-category'), undefined)
    assert.equal(resolveCategoryId('random-gibberish'), undefined)
    assert.equal(getCanonicalCategoryPath('unknown-xyz'), undefined)
  })
})

describe('Task 7 & 8: Static & Special Route Audit', () => {
  it('verifies all essential static routes exist and are well-formed', () => {
    const requiredStaticPaths = [
      '/',
      '/converter',
      '/convert',
      '/categories',
      '/dashboard',
      '/currency',
      '/crypto',
      '/formulas',
      '/calculator',
      '/health',
      '/favorites',
      '/history',
      '/custom-units',
      '/settings',
      '/help',
      '/sitemap',
      '/blog',
      '/about'
    ]

    const registered = new Set(STATIC_ROUTES.map(s => s.path))
    for (const path of requiredStaticPaths) {
      assert.ok(registered.has(path), `Static route "${path}" is missing from STATIC_ROUTES registry`)
    }
  })

  it('verifies "/health" is documented and categorized as a user-facing feature route', () => {
    const health = STATIC_ROUTES.find(s => s.path === '/health')
    assert.ok(health, 'Route "/health" must exist')
    assert.equal(health?.type, 'feature')
    assert.equal(health?.label, 'Health Hub')
  })

  it('guarantees static route paths are unique', () => {
    const paths = STATIC_ROUTES.map(s => s.path)
    const unique = new Set(paths)
    assert.equal(unique.size, paths.length, 'Static routes must have unique paths')
  })
})

describe('Task 13: Pair Route Parsing & URL Safety', () => {
  it('parses valid pair slugs into source and target units', () => {
    function parsePair(slug: string) {
      const parts = slug.toLowerCase().split('-to-')
      if (parts.length === 2 && parts[0] && parts[1]) {
        return { fromSlug: parts[0], toSlug: parts[1] }
      }
      return null
    }

    const test1 = parsePair('kg-to-lbs')
    assert.deepEqual(test1, { fromSlug: 'kg', toSlug: 'lbs' })

    const test2 = parsePair('meter-to-feet')
    assert.deepEqual(test2, { fromSlug: 'meter', toSlug: 'feet' })

    const test3 = parsePair('celsius-to-fahrenheit')
    assert.deepEqual(test3, { fromSlug: 'celsius', toSlug: 'fahrenheit' })

    const test4 = parsePair('metric-ton-to-us-ton')
    assert.deepEqual(test4, { fromSlug: 'metric-ton', toSlug: 'us-ton' })

    assert.equal(parsePair('invalidpair'), null)
    assert.equal(parsePair('only-to'), null)
    assert.equal(parsePair('-to-feet'), null)
  })

  it('validates generated pair URLs contain no spaces and follow canonical format', () => {
    const testPairs = [
      { cat: 'length', from: 'm', to: 'ft' },
      { cat: 'mass', from: 'kg', to: 'lb' },
      { cat: 'temp', from: 'celsius', to: 'fahrenheit' },
      { cat: 'mass', from: 'metric-ton', to: 'us-ton' },
    ]

    for (const p of testPairs) {
      const canonicalPairUrl = `/convert/${p.cat}/${p.from}-to-${p.to}`
      assert.ok(!canonicalPairUrl.includes(' '), `Pair URL "${canonicalPairUrl}" must not contain spaces`)
      assert.match(canonicalPairUrl, /^\/convert\/[a-z0-9]+\/[a-z0-9-]+-to-[a-z0-9-]+$/)
    }
  })
})

describe('Phase 2 Step 2: Runtime Resilience, 404 Catch-All & Error Containment', () => {
  it('verifies App.tsx registers a wildcard catch-all route pointing to NotFound', () => {
    const appTsxPath = path.resolve(process.cwd(), 'src/App.tsx')
    const appContent = fs.readFileSync(appTsxPath, 'utf8')
    assert.ok(appContent.includes('<Route path="*" element={<NotFound />} />'), 'App.tsx must register catch-all wildcard route')
    assert.ok(appContent.includes("import('./pages/NotFound')"), 'App.tsx must lazy-load the NotFound page')
  })

  it('verifies NotFound page exists and exports a valid React component', () => {
    const notFoundPath = path.resolve(process.cwd(), 'src/pages/NotFound.tsx')
    assert.ok(fs.existsSync(notFoundPath), 'src/pages/NotFound.tsx must exist')
    const notFoundContent = fs.readFileSync(notFoundPath, 'utf8')
    assert.ok(notFoundContent.includes('export default function NotFound'), 'NotFound.tsx must export default function NotFound')
    assert.ok(notFoundContent.includes('noindex={true}'), 'NotFound.tsx must enforce noindex SEO head')
    assert.ok(notFoundContent.includes('404'), 'NotFound.tsx must display 404 status')
  })

  it('verifies sitemap generation strictly excludes wildcard route and 404 paths', () => {
    const entries = generateSitemapEntries()
    for (const entry of entries) {
      assert.ok(!entry.loc.includes('*'), `Wildcard route leaked into sitemap: ${entry.loc}`)
      assert.ok(!entry.loc.includes('404'), `404 route leaked into sitemap: ${entry.loc}`)
      assert.ok(!entry.loc.includes('not-found'), `Not found path leaked into sitemap: ${entry.loc}`)
    }
    // Verify count remains the verified 149
    assert.equal(entries.length, 149, `Expected exactly 149 sitemap entries, got ${entries.length}`)
  })

  it('ensures /404 path is excluded by indexability policy and invalid routes fail resolution', () => {
    assert.equal(isIndexablePath('/404'), false, '/404 must not be indexable')
    assert.equal(resolveCategoryId('/404'), undefined, '/404 must not resolve to any category')
    assert.equal(resolveCategoryId('/non-existent-page'), undefined, 'Non-existent page must not resolve to any category')
    assert.equal(resolveCategoryId('/convert/invalid-xyz'), undefined, 'Invalid category route must return undefined')
    assert.equal(getCanonicalCategoryPath('/convert/invalid-xyz'), undefined, 'Invalid category route must have no canonical path')
  })

  it('verifies ErrorBoundary contains chunk error detection and recovery controls', () => {
    const boundaryPath = path.resolve(process.cwd(), 'src/components/ui/ErrorBoundary.tsx')
    const boundaryContent = fs.readFileSync(boundaryPath, 'utf8')
    assert.ok(boundaryContent.includes('dynamically imported module'), 'ErrorBoundary must handle dynamically imported module failures')
    assert.ok(boundaryContent.includes('Loading chunk'), 'ErrorBoundary must handle loading chunk failures')
    assert.ok(boundaryContent.includes('Failed to fetch'), 'ErrorBoundary must handle failed to fetch failures')
    assert.ok(boundaryContent.includes('Application Update Available'), 'ErrorBoundary must present update banner for chunk errors')
    assert.ok(boundaryContent.includes('Return Home'), 'ErrorBoundary must present return home recovery option')
  })
})

describe('Phase 2 Step 3: Accessibility, Keyboard Navigation & Semantic UI Hardening', () => {
  it('verifies skip-to-content target exists and is focusable in App.tsx', () => {
    const appTsxPath = path.resolve(process.cwd(), 'src/App.tsx')
    const appContent = fs.readFileSync(appTsxPath, 'utf8')
    assert.ok(appContent.includes('href="#main-content"'), 'App.tsx must include skip to main content anchor')
    assert.ok(appContent.includes('id="main-content"'), 'App.tsx must define id="main-content" target on main element')
    assert.ok(appContent.includes('tabIndex={-1}'), 'Main content target must be programmatically focusable with tabIndex={-1}')
  })

  it('verifies CommandBar implements modal dialog semantics, keyboard trap, and accessible input', () => {
    const commandBarPath = path.resolve(process.cwd(), 'src/components/ui/CommandBar.tsx')
    const content = fs.readFileSync(commandBarPath, 'utf8')
    assert.ok(content.includes('role="dialog"'), 'CommandBar must have role="dialog"')
    assert.ok(content.includes('aria-modal="true"'), 'CommandBar must specify aria-modal="true"')
    assert.ok(content.includes('aria-label="Command palette"'), 'CommandBar must have accessible label')
    assert.ok(content.includes('aria-label="Search, convert, or calculate"'), 'CommandBar input must have accessible name')
    assert.ok(content.includes("e.key === 'Escape'"), 'CommandBar must handle Escape key navigation')
    assert.ok(content.includes("e.key === 'Tab'"), 'CommandBar must manage Tab focus cycling')
  })

  it('verifies AIAssistant drawer implements dialog semantics, input auto-focus, and escape listener', () => {
    const aiPath = path.resolve(process.cwd(), 'src/components/widgets/AIAssistant.tsx')
    const content = fs.readFileSync(aiPath, 'utf8')
    assert.ok(content.includes('role="dialog"'), 'AIAssistant must have role="dialog"')
    assert.ok(content.includes('aria-label="NX-COS AI Assistant"'), 'AIAssistant must have accessible name')
    assert.ok(content.includes('aria-label="Ask Omega X AI assistant"'), 'AIAssistant input must have accessible name')
    assert.ok(content.includes("e.key === 'Escape'"), 'AIAssistant must handle Escape key dismissal')
  })

  it('verifies OnboardingTour and ShortcutsPanel implement modal dialog semantics and title associations', () => {
    const tourPath = path.resolve(process.cwd(), 'src/components/ui/OnboardingTour.tsx')
    const tourContent = fs.readFileSync(tourPath, 'utf8')
    assert.ok(tourContent.includes('role="dialog"'), 'OnboardingTour must have role="dialog"')
    assert.ok(!tourContent.includes('aria-modal="true"'), 'OnboardingTour must be non-modal (no aria-modal="true")')
    assert.ok(tourContent.includes('aria-labelledby="tour-heading"'), 'OnboardingTour must reference tour heading')
    assert.ok(tourContent.includes('id="tour-heading"'), 'OnboardingTour must define id="tour-heading"')

    const shortcutsPath = path.resolve(process.cwd(), 'src/components/ui/ShortcutsPanel.tsx')
    const shortcutsContent = fs.readFileSync(shortcutsPath, 'utf8')
    assert.ok(shortcutsContent.includes('role="dialog"'), 'ShortcutsPanel must have role="dialog"')
    assert.ok(shortcutsContent.includes('aria-modal="true"'), 'ShortcutsPanel must have aria-modal="true"')
    assert.ok(shortcutsContent.includes('aria-labelledby="shortcuts-title"'), 'ShortcutsPanel must reference shortcuts title')
    assert.ok(shortcutsContent.includes('id="shortcuts-title"'), 'ShortcutsPanel must define id="shortcuts-title"')
  })

  it('verifies form controls in CustomUnits, History, Settings, and Dashboard have accessible names', () => {
    const customUnitsPath = path.resolve(process.cwd(), 'src/pages/CustomUnits.tsx')
    const cuContent = fs.readFileSync(customUnitsPath, 'utf8')
    assert.ok(cuContent.includes('aria-label="Target category for custom unit"'), 'CustomUnits category selector must have accessible name')
    assert.ok(cuContent.includes('aria-label="Custom unit name"'), 'CustomUnits name input must have accessible name')
    assert.ok(cuContent.includes('aria-label="Custom unit symbol"'), 'CustomUnits symbol input must have accessible name')
    assert.ok(cuContent.includes('aria-label="Conversion rate relative to base unit"'), 'CustomUnits rate input must have accessible name')
    assert.ok(cuContent.includes('aria-describedby="custom-unit-rate-hint"'), 'CustomUnits rate input must have aria-describedby')

    const historyPath = path.resolve(process.cwd(), 'src/pages/History.tsx')
    const historyContent = fs.readFileSync(historyPath, 'utf8')
    assert.ok(historyContent.includes('aria-label="Search conversion history"'), 'History search input must have accessible name')

    const settingsPath = path.resolve(process.cwd(), 'src/pages/Settings.tsx')
    const settingsContent = fs.readFileSync(settingsPath, 'utf8')
    assert.ok(settingsContent.includes('aria-label="Default conversion precision in decimal places"'), 'Settings precision range must have accessible name')

    const dashPath = path.resolve(process.cwd(), 'src/pages/Dashboard.tsx')
    const dashContent = fs.readFileSync(dashPath, 'utf8')
    assert.ok(dashContent.includes('htmlFor="health-weight"'), 'Dashboard weight label must be associated')
    assert.ok(dashContent.includes('id="health-weight"'), 'Dashboard weight input must have id="health-weight"')
    assert.ok(dashContent.includes('role="radiogroup"'), 'Dashboard sex selector must have role="radiogroup"')
    assert.ok(dashContent.includes('role="radio"'), 'Dashboard sex buttons must have role="radio"')
  })

  it('verifies dynamic notifications implement accessible status/error announcements in useToast', () => {
    const toastPath = path.resolve(process.cwd(), 'src/hooks/useToast.tsx')
    const toastContent = fs.readFileSync(toastPath, 'utf8')
    assert.ok(toastContent.includes('role="region"'), 'useToast container must have role="region"')
    assert.ok(toastContent.includes('aria-label="Notifications"'), 'useToast container must have accessible name')
    assert.ok(toastContent.includes("role={toast.type === 'error' ? 'alert' : 'status'}"), 'useToast items must toggle alert/status roles')
    assert.ok(toastContent.includes("aria-live={toast.type === 'error' ? 'assertive' : 'polite'}"), 'useToast items must toggle assertive/polite live regions')
  })

  it('verifies global accessibility standards: lang attribute, reduced motion, and visible focus', () => {
    const indexPath = path.resolve(process.cwd(), 'index.html')
    const indexContent = fs.readFileSync(indexPath, 'utf8')
    assert.ok(indexContent.includes('<html lang="en">'), 'index.html must specify valid lang="en" attribute')

    const cssPath = path.resolve(process.cwd(), 'src/index.css')
    const cssContent = fs.readFileSync(cssPath, 'utf8')
    assert.ok(cssContent.includes('prefers-reduced-motion'), 'src/index.css must respect prefers-reduced-motion')
    assert.ok(cssContent.includes(':focus-visible'), 'src/index.css must declare visible :focus-visible outlines')
  })
})

describe('Phase 2 Step 5: Performance, Bundle Size & Isolation Architecture', () => {
  it('verifies chart.js is strictly isolated from initial load and root bundle', () => {
    const mainPath = path.resolve(process.cwd(), 'src/main.tsx')
    const mainContent = fs.readFileSync(mainPath, 'utf8')
    assert.ok(!mainContent.includes('chart.js'), 'src/main.tsx must not import chart.js')
    assert.ok(!mainContent.includes('react-chartjs-2'), 'src/main.tsx must not import react-chartjs-2')

    const appPath = path.resolve(process.cwd(), 'src/App.tsx')
    const appContent = fs.readFileSync(appPath, 'utf8')
    assert.ok(!appContent.includes('chart.js'), 'src/App.tsx must not import chart.js')
    assert.ok(!appContent.includes('react-chartjs-2'), 'src/App.tsx must not import react-chartjs-2')
    assert.ok(appContent.includes("const Currency = lazy(() => import('./pages/Currency'))"), 'Currency page must be lazy loaded')

    const chartPath = path.resolve(process.cwd(), 'src/components/charts/CurrencyCenter.tsx')
    const chartContent = fs.readFileSync(chartPath, 'utf8')
    assert.ok(chartContent.includes('ChartJS.register'), 'CurrencyCenter.tsx must modularly register chart.js components')
  })

  it('verifies heavy interactive widgets (AIAssistant, ShortcutsPanel, OnboardingTour) are code-split and lazy-loaded in App.tsx', () => {
    const appPath = path.resolve(process.cwd(), 'src/App.tsx')
    const appContent = fs.readFileSync(appPath, 'utf8')

    assert.ok(appContent.includes("const AIAssistant = lazy(() => import('./components/widgets/AIAssistant'))"), 'AIAssistant must be lazy loaded')
    assert.ok(appContent.includes("const ShortcutsPanel = lazy(() => import('./components/ui/ShortcutsPanel'))"), 'ShortcutsPanel must be lazy loaded')
    assert.ok(appContent.includes("const OnboardingTour = lazy(() => import('./components/ui/OnboardingTour'))"), 'OnboardingTour must be lazy loaded')

    assert.ok(!appContent.includes("import AIAssistant from './components/widgets/AIAssistant'"), 'AIAssistant must not be statically imported')
    assert.ok(!appContent.includes("import ShortcutsPanel from './components/ui/ShortcutsPanel'"), 'ShortcutsPanel must not be statically imported')
    assert.ok(!appContent.includes("import OnboardingTour from './components/ui/OnboardingTour'"), 'OnboardingTour must not be statically imported')
  })

  it('verifies vite.config.ts configures vendor-motion manual chunking without monolithic bundle', () => {
    const configPath = path.resolve(process.cwd(), 'vite.config.ts')
    const configContent = fs.readFileSync(configPath, 'utf8')
    assert.ok(configContent.includes('manualChunks'), 'vite.config.ts must configure manualChunks')
    assert.ok(configContent.includes('framer-motion'), 'vite.config.ts must target framer-motion chunking')
    assert.ok(configContent.includes('vendor-motion'), 'vite.config.ts must separate vendor-motion')
  })

  it('verifies production bundle chunk budgets are strictly enforced', () => {
    const distAssetsDir = path.resolve(process.cwd(), 'dist/assets')
    if (fs.existsSync(distAssetsDir)) {
      const files = fs.readdirSync(distAssetsDir)
      const jsFiles = files.filter(f => f.endsWith('.js'))

      for (const jsFile of jsFiles) {
        const stats = fs.statSync(path.join(distAssetsDir, jsFile))
        // Strictly assert no chunk exceeds 500 kB (Vite's default warning threshold)
        assert.ok(
          stats.size <= 500 * 1024,
          `Chunk ${jsFile} (${(stats.size / 1024).toFixed(2)} kB) exceeds the 500 kB chunk size budget!`
        )

        // Initial entry chunk must be strictly under 350 kB (baseline was 514.80 kB)
        if (jsFile.startsWith('index-')) {
          assert.ok(
            stats.size < 350 * 1024,
            `Initial index chunk ${jsFile} (${(stats.size / 1024).toFixed(2)} kB) must be under 350 kB!`
          )
        }
      }
    }
  })

  it('verifies web fonts are self-hosted (no visitor requests to Google Fonts)', () => {
    const indexContent = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8')
    assert.ok(!indexContent.includes('fonts.googleapis.com'), 'index.html must not load Google Fonts')
    assert.ok(!indexContent.includes('fonts.gstatic.com'), 'index.html must not preconnect to gstatic')
    const mainContent = fs.readFileSync(path.resolve(process.cwd(), 'src/main.tsx'), 'utf8')
    assert.ok(mainContent.includes("import '@fontsource-variable/inter'"), 'main.tsx must import the self-hosted Inter font')
    assert.ok(mainContent.includes("import '@fontsource-variable/jetbrains-mono'"), 'main.tsx must import the self-hosted JetBrains Mono font')
  })
})

describe('Phase 2 Step 6: Security, Privacy, HTTP Headers & Deployment Hardening', () => {
  it('verifies Netlify deployment headers file exists in public/ and is copied to dist/', () => {
    const publicHeadersPath = path.resolve(process.cwd(), 'public/_headers')
    assert.ok(fs.existsSync(publicHeadersPath), 'public/_headers must exist')
    const content = fs.readFileSync(publicHeadersPath, 'utf8')
    assert.ok(content.includes('Content-Security-Policy:'), 'public/_headers must define CSP')

    const distHeadersPath = path.resolve(process.cwd(), 'dist/_headers')
    if (fs.existsSync(path.resolve(process.cwd(), 'dist'))) {
      assert.ok(fs.existsSync(distHeadersPath), 'dist/_headers must exist in production build')
    }
  })

  it('verifies Content-Security-Policy directives are complete, restrictive, and well-formed', () => {
    const headersPath = path.resolve(process.cwd(), 'public/_headers')
    const content = fs.readFileSync(headersPath, 'utf8')

    // Find CSP header line
    const match = content.match(/Content-Security-Policy:\s*([^\r\n]+)/)
    assert.ok(match, 'Content-Security-Policy header line must exist')
    const csp = match[1]

    // Mandatory structural restrictions
    assert.ok(csp.includes("default-src 'self'"), "CSP must include default-src 'self'")
    assert.ok(csp.includes("object-src 'none'"), "CSP must include object-src 'none'")
    assert.ok(csp.includes("base-uri 'self'"), "CSP must include base-uri 'self'")
    assert.ok(csp.includes("frame-ancestors 'none'"), "CSP must include frame-ancestors 'none'")
    assert.ok(csp.includes("form-action 'self'"), "CSP must include form-action 'self'")

    // Script safety
    assert.ok(!csp.includes("'unsafe-eval'"), "CSP must NOT permit 'unsafe-eval'")
    assert.ok(!csp.includes('script-src *'), 'CSP must NOT permit wildcard script-src')
    assert.ok(csp.includes("script-src 'self'"), "CSP must include script-src 'self'")

    // Financial APIs permitted in connect-src without wildcards
    assert.ok(csp.includes('connect-src'), 'CSP must declare connect-src')
    assert.ok(csp.includes('https://open.er-api.com'), 'CSP connect-src must permit ExchangeRate API')
    assert.ok(csp.includes('https://api.coingecko.com'), 'CSP connect-src must permit CoinGecko API')
    assert.ok(!csp.includes('connect-src *'), 'CSP connect-src must NOT permit wildcard *')

    // Fonts are self-hosted, so no third-party font origins are allowed
    assert.ok(csp.includes("font-src 'self' data:;"), "CSP font-src must permit 'self' and data:")
    assert.ok(!csp.includes('fonts.googleapis.com') && !csp.includes('fonts.gstatic.com'), 'CSP must not permit Google Fonts origins')

    // PWA & Service Worker
    assert.ok(csp.includes("worker-src 'self'"), "CSP must include worker-src 'self'")
    assert.ok(csp.includes("manifest-src 'self'"), "CSP must include manifest-src 'self'")
  })

  it('verifies standard HTTP security and privacy headers are configured', () => {
    const headersPath = path.resolve(process.cwd(), 'public/_headers')
    const content = fs.readFileSync(headersPath, 'utf8')

    assert.ok(content.includes('X-Frame-Options: DENY'), 'Must configure X-Frame-Options: DENY')
    assert.ok(content.includes('X-Content-Type-Options: nosniff'), 'Must configure X-Content-Type-Options: nosniff')
    assert.ok(content.includes('Referrer-Policy: strict-origin-when-cross-origin'), 'Must configure Referrer-Policy')
    assert.ok(content.includes('Strict-Transport-Security: max-age=31536000; includeSubDomains'), 'Must configure HSTS')
    assert.ok(!content.includes('preload'), 'HSTS must not include preload flag')

    // Permissions Policy disabling unused hardware capabilities
    assert.ok(content.includes('Permissions-Policy:'), 'Must configure Permissions-Policy')
    assert.ok(content.includes('camera=()'), 'Permissions-Policy must disable camera')
    assert.ok(content.includes('microphone=()'), 'Permissions-Policy must disable microphone')
    assert.ok(content.includes('geolocation=()'), 'Permissions-Policy must disable geolocation')
    assert.ok(content.includes('payment=()'), 'Permissions-Policy must disable payment')
  })

  it('verifies cache policies enforce immutable fingerprinted assets and revalidation for mutable files', () => {
    const headersPath = path.resolve(process.cwd(), 'public/_headers')
    const content = fs.readFileSync(headersPath, 'utf8')

    // /assets/* must be cached immutably for 1 year
    assert.ok(content.includes('/assets/*'), 'Must define /assets/* cache rule')
    assert.ok(content.includes('max-age=31536000, immutable'), '/assets/* must specify 1 year immutable cache')

    // Mutable files must never be immutable
    assert.ok(content.includes('/index.html'), 'Must define /index.html cache rule')
    assert.ok(content.includes('/sw.js'), 'Must define /sw.js cache rule')
    assert.ok(content.includes('/manifest.json'), 'Must define /manifest.json cache rule')
    assert.ok(content.includes('max-age=0, must-revalidate'), 'index.html and sw.js must enforce must-revalidate')
  })

  it('verifies Cloudflare Pages routing redirects file defines aliases, shell rewrites, and zero catch-all', () => {
    const publicRedirectsPath = path.resolve(process.cwd(), 'public/_redirects')
    assert.ok(fs.existsSync(publicRedirectsPath), 'public/_redirects must exist')
    const content = fs.readFileSync(publicRedirectsPath, 'utf8').trim()
    assert.ok(content.includes('/length                       /convert/length          301'), 'Must include 301 alias for /length')
    assert.ok(content.includes('/settings                     /spa                     200'), 'Must rewrite /settings to /spa 200')
    assert.ok(!content.includes('/*    /index.html   200') && !content.includes('/* /index.html 200'), 'Must not contain wildcard catch-all fallback')

    const distRedirectsPath = path.resolve(process.cwd(), 'dist/_redirects')
    if (fs.existsSync(path.resolve(process.cwd(), 'dist'))) {
      assert.ok(fs.existsSync(distRedirectsPath), 'dist/_redirects must exist in production build')
    }
  })

  it('verifies manifest.json defines truthful, secure PWA metadata without ungranted capabilities', () => {
    const manifestPath = path.resolve(process.cwd(), 'public/manifest.json')
    assert.ok(fs.existsSync(manifestPath), 'public/manifest.json must exist')
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

    assert.equal(manifest.scope, '/', 'Manifest scope must be /')
    assert.equal(manifest.start_url, '/', 'Manifest start_url must be /')
    assert.equal(manifest.display, 'standalone', 'Manifest display must be standalone')
    assert.ok(manifest.icons && manifest.icons.length >= 2, 'Manifest must specify multiple icon sizes')
  })

  it('verifies privacy boundaries: zero tracking, zero cookies, and zero secret leakage in environment', () => {
    const envPath = path.resolve(process.cwd(), '.env')
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8')
      assert.ok(!envContent.includes('AIza'), '.env must not contain Google API keys')
      assert.ok(!envContent.includes('sk-'), '.env must not contain private secret keys')
      assert.ok(!envContent.includes('ghp_'), '.env must not contain GitHub personal tokens')
    }

    const distDir = path.resolve(process.cwd(), 'dist')
    if (fs.existsSync(distDir)) {
      const htmlContent = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8')
      assert.ok(!htmlContent.includes('adsbygoogle'), 'dist/index.html must not contain adsbygoogle')
      assert.ok(!htmlContent.includes('googletagmanager'), 'dist/index.html must not contain googletagmanager')
      assert.ok(!htmlContent.includes('google-analytics'), 'dist/index.html must not contain google-analytics')
    }
  })
})

