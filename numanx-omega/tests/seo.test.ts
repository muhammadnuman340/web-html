/**
 * tests/seo.test.ts
 * Automated Verification Suite for SEO, Canonical URLs, Structured Data & Sitemap Architecture
 *
 * Verifies:
 * 1. Single Authoritative Site Origin (Netlify live domain)
 * 2. URL normalization & absolute URL generation
 * 3. Canonical URL resolution (alias-to-canonical mapping across all 24 categories)
 * 4. Indexability policy & robots gating
 * 5. Deterministic sitemap generation (core routes, 24 categories, curated pairs, 0 aliases, 0 noindex)
 * 6. robots.txt compliance
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {
  DEFAULT_SITE_URL,
  SITE,
  getSiteUrl,
  normalizePath,
  absoluteUrl,
  canonicalUrl,
  INDEXABILITY_POLICY,
  isIndexablePath,
} from '../src/config/site'
import { getAllCategories } from '../src/engine/converter'
import { generateSitemapEntries, buildSitemapXml } from '../scripts/generate-sitemap'

describe('SEO Architecture: Site Identity & Authoritative Origin', () => {
  it('enforces live Netlify domain as authoritative origin', () => {
    assert.equal(DEFAULT_SITE_URL, 'https://numanx-studio-omega-converter.netlify.app')
    assert.equal(SITE.url, 'https://numanx-studio-omega-converter.netlify.app')
    assert.equal(getSiteUrl(), 'https://numanx-studio-omega-converter.netlify.app')
  })

  it('normalizes paths without double slashes or trailing slashes', () => {
    assert.equal(normalizePath(''), '')
    assert.equal(normalizePath('/'), '')
    assert.equal(normalizePath('converter'), '/converter')
    assert.equal(normalizePath('/converter/'), '/converter')
    assert.equal(normalizePath('//convert//length//'), '/convert/length')
  })

  it('generates pristine absolute URLs', () => {
    assert.equal(absoluteUrl('/'), 'https://numanx-studio-omega-converter.netlify.app')
    assert.equal(absoluteUrl(''), 'https://numanx-studio-omega-converter.netlify.app')
    assert.equal(absoluteUrl('/converter'), 'https://numanx-studio-omega-converter.netlify.app/converter')
    assert.equal(absoluteUrl('categories'), 'https://numanx-studio-omega-converter.netlify.app/categories')
  })
})

describe('SEO Architecture: Canonical URL & Alias Resolution', () => {
  it('resolves home and static core routes to themselves', () => {
    assert.equal(canonicalUrl('/'), 'https://numanx-studio-omega-converter.netlify.app')
    assert.equal(canonicalUrl('/categories'), 'https://numanx-studio-omega-converter.netlify.app/categories')
    assert.equal(canonicalUrl('/blog'), 'https://numanx-studio-omega-converter.netlify.app/blog')
  })

  it('resolves canonical category routes to /convert/:id for all 24 categories', () => {
    const categories = getAllCategories()
    assert.equal(categories.length, 24)

    for (const cat of categories) {
      const canonical = canonicalUrl(`/convert/${cat.id}`)
      assert.equal(
        canonical,
        `https://numanx-studio-omega-converter.netlify.app/convert/${cat.id}`,
        `Canonical mismatch for category ${cat.id}`
      )
    }
  })

  it('maps legacy aliases and friendly URLs directly to their canonical category destination', () => {
    // Length aliases
    assert.equal(canonicalUrl('/length'), 'https://numanx-studio-omega-converter.netlify.app/convert/length')
    assert.equal(canonicalUrl('/length-converter'), 'https://numanx-studio-omega-converter.netlify.app/convert/length')

    // Mass / Weight aliases
    assert.equal(canonicalUrl('/mass'), 'https://numanx-studio-omega-converter.netlify.app/convert/mass')
    assert.equal(canonicalUrl('/mass-converter'), 'https://numanx-studio-omega-converter.netlify.app/convert/mass')
    assert.equal(canonicalUrl('/weight'), 'https://numanx-studio-omega-converter.netlify.app/convert/mass')
    assert.equal(canonicalUrl('/weight-converter'), 'https://numanx-studio-omega-converter.netlify.app/convert/mass')

    // Temperature aliases
    assert.equal(canonicalUrl('/temp'), 'https://numanx-studio-omega-converter.netlify.app/convert/temp')
    assert.equal(canonicalUrl('/temp-converter'), 'https://numanx-studio-omega-converter.netlify.app/convert/temp')
    assert.equal(canonicalUrl('/temperature'), 'https://numanx-studio-omega-converter.netlify.app/convert/temp')
    assert.equal(canonicalUrl('/temperature-converter'), 'https://numanx-studio-omega-converter.netlify.app/convert/temp')

    // Data aliases
    assert.equal(canonicalUrl('/data'), 'https://numanx-studio-omega-converter.netlify.app/convert/data')
    assert.equal(canonicalUrl('/data-converter'), 'https://numanx-studio-omega-converter.netlify.app/convert/data')

    // Speed alias
    assert.equal(canonicalUrl('/speed'), 'https://numanx-studio-omega-converter.netlify.app/convert/speed')
    assert.equal(canonicalUrl('/speed-converter'), 'https://numanx-studio-omega-converter.netlify.app/convert/speed')

    // Datatransfer alias
    assert.equal(canonicalUrl('/datatransfer'), 'https://numanx-studio-omega-converter.netlify.app/convert/datatransfer')
    assert.equal(canonicalUrl('/datatransfer-converter'), 'https://numanx-studio-omega-converter.netlify.app/convert/datatransfer')
  })
})

describe('SEO Architecture: Indexability & Robots Policy', () => {
  it('correctly classifies public content as indexable', () => {
    assert.equal(isIndexablePath('/'), true)
    assert.equal(isIndexablePath('/converter'), true)
    assert.equal(isIndexablePath('/categories'), true)
    assert.equal(isIndexablePath('/convert/length'), true)
    assert.equal(isIndexablePath('/convert/temp/celsius-to-fahrenheit'), true)
    assert.equal(isIndexablePath('/currency'), true)
    assert.equal(isIndexablePath('/crypto'), true)
    assert.equal(isIndexablePath('/blog'), true)
    assert.equal(isIndexablePath('/guides/lbs-to-kg'), true)
  })

  it('strictly excludes local state, user utility, and session routes from indexing', () => {
    assert.equal(isIndexablePath('/dashboard'), false)
    assert.equal(isIndexablePath('/favorites'), false)
    assert.equal(isIndexablePath('/history'), false)
    assert.equal(isIndexablePath('/settings'), false)
    assert.equal(isIndexablePath('/custom-units'), false)
    assert.equal(isIndexablePath('/help'), false)
  })

  it('matches public/robots.txt disallow rules with noindex policy', () => {
    const robotsPath = path.resolve(process.cwd(), 'public/robots.txt')
    assert.ok(fs.existsSync(robotsPath), 'public/robots.txt must exist')
    const content = fs.readFileSync(robotsPath, 'utf-8')

    assert.ok(content.includes('Sitemap: https://numanx-studio-omega-converter.netlify.app/sitemap.xml'))
    assert.ok(content.includes('Disallow: /dashboard'))
    assert.ok(content.includes('Disallow: /favorites'))
    assert.ok(content.includes('Disallow: /history'))
    assert.ok(content.includes('Disallow: /settings'))
    assert.ok(content.includes('Disallow: /custom-units'))
  })
})

describe('SEO Architecture: XML Sitemap Generator', () => {
  it('generates a clean, valid XML sitemap with 0 duplicate URLs', () => {
    const entries = generateSitemapEntries()
    assert.ok(entries.length > 50, `Expected at least 50 sitemap entries, got ${entries.length}`)

    const seen = new Set<string>()
    for (const e of entries) {
      assert.ok(!seen.has(e.loc), `Duplicate loc found in sitemap: ${e.loc}`)
      seen.add(e.loc)
      assert.ok(
        e.loc.startsWith('https://numanx-studio-omega-converter.netlify.app'),
        `Loc must use authoritative origin: ${e.loc}`
      )
    }

    const xml = buildSitemapXml(entries)
    assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'))
    assert.ok(xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'))
    assert.ok(xml.trimEnd().endsWith('</urlset>'))
  })

  it('includes all 24 canonical category URLs', () => {
    const entries = generateSitemapEntries()
    const locs = new Set(entries.map(e => e.loc))

    const categories = getAllCategories()
    for (const cat of categories) {
      const expectedUrl = `https://numanx-studio-omega-converter.netlify.app/convert/${cat.id}`
      assert.ok(locs.has(expectedUrl), `Missing canonical category URL: ${expectedUrl}`)
    }
  })

  it('strictly excludes category aliases from sitemap', () => {
    const entries = generateSitemapEntries()
    const locs = entries.map(e => e.loc)

    const forbiddenAliases = [
      '/length',
      '/length-converter',
      '/weight-converter',
      '/temperature-converter',
      '/speed-converter',
      '/volume-converter',
      '/area-converter',
      '/time-converter',
      '/pressure-converter',
      '/energy-converter',
      '/power-converter',
      '/fuel-converter',
      '/cooking-converter',
      '/data-converter',
    ]

    for (const alias of forbiddenAliases) {
      const aliasUrl = `https://numanx-studio-omega-converter.netlify.app${alias}`
      assert.ok(
        !locs.includes(aliasUrl),
        `Sitemap must not contain compatibility alias URL: ${aliasUrl}`
      )
    }
  })

  it('strictly excludes noindex utility routes from sitemap', () => {
    const entries = generateSitemapEntries()
    const locs = entries.map(e => e.loc)

    for (const noindexPath of INDEXABILITY_POLICY.noindex) {
      const noindexUrl = `https://numanx-studio-omega-converter.netlify.app${noindexPath}`
      assert.ok(
        !locs.includes(noindexUrl),
        `Sitemap must not contain noindex URL: ${noindexUrl}`
      )
    }
  })
})
