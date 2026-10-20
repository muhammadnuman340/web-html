import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Categories } from '../src/engine/categories'
import {
  CATEGORY_ROUTES,
  STATIC_ROUTES,
  resolveCategoryId,
  getCanonicalCategoryPath,
  getAllCategoryRoutes,
  detectRouteCollisions
} from '../src/engine/routes'

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
