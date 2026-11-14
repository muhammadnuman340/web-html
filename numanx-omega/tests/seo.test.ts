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
import { SystemLabels } from '../src/types'
import { Categories } from '../src/engine/categories'
import { findUnit, getPairEditorial } from '../src/config/pairEditorial'

describe('SEO Architecture: Site Identity & Authoritative Origin', () => {
  it('enforces configured domain as authoritative origin', () => {
    assert.equal(DEFAULT_SITE_URL, getSiteUrl())
    assert.equal(SITE.url, `${getSiteUrl()}/`)
  })

  it('normalizes paths without double slashes or trailing slashes, preserving root /', () => {
    assert.equal(normalizePath(''), '/')
    assert.equal(normalizePath('/'), '/')
    assert.equal(normalizePath('converter'), '/converter')
    assert.equal(normalizePath('/converter/'), '/converter')
    assert.equal(normalizePath('//convert//length//'), '/convert/length')
  })

  it('generates pristine absolute URLs with proper trailing slash on root', () => {
    const origin = getSiteUrl()
    assert.equal(absoluteUrl('/'), `${origin}/`)
    assert.equal(absoluteUrl(''), `${origin}/`)
    assert.equal(absoluteUrl('/converter'), `${origin}/converter`)
    assert.equal(absoluteUrl('categories'), `${origin}/categories`)
  })
})

describe('SEO Architecture: Canonical URL & Alias Resolution', () => {
  it('resolves home to trailing slash origin and static core routes without double slashes', () => {
    const origin = getSiteUrl()
    assert.equal(canonicalUrl('/'), `${origin}/`)
    assert.equal(canonicalUrl(''), `${origin}/`)
    assert.equal(canonicalUrl('/categories'), `${origin}/categories`)
    assert.equal(canonicalUrl('/blog'), `${origin}/blog`)
  })

  it('verifies explicit canonical examples specified in Step 4 specification', () => {
    const origin = getSiteUrl()
    assert.equal(canonicalUrl('/'), `${origin}/`)
    assert.equal(canonicalUrl('/length'), `${origin}/convert/length`)
    assert.equal(canonicalUrl('/length-converter'), `${origin}/convert/length`)
    assert.equal(canonicalUrl('/temperature'), `${origin}/convert/temp`)
    assert.equal(canonicalUrl('/weight'), `${origin}/convert/mass`)
    assert.equal(canonicalUrl('/convert/length/meter-to-feet'), `${origin}/convert/length/meter-to-feet`)
  })

  it('resolves canonical category routes to /convert/:id for all 35 categories', () => {
    const origin = getSiteUrl()
    const categories = getAllCategories()
    assert.equal(categories.length, 35)

    for (const cat of categories) {
      const canonical = canonicalUrl(`/convert/${cat.id}`)
      assert.equal(
        canonical,
        `${origin}/convert/${cat.id}`,
        `Canonical mismatch for category ${cat.id}`
      )
    }
  })

  it('maps legacy aliases and friendly URLs directly to their canonical category destination', () => {
    const origin = getSiteUrl()
    // Length aliases
    assert.equal(canonicalUrl('/length'), `${origin}/convert/length`)
    assert.equal(canonicalUrl('/length-converter'), `${origin}/convert/length`)

    // Mass / Weight aliases
    assert.equal(canonicalUrl('/mass'), `${origin}/convert/mass`)
    assert.equal(canonicalUrl('/mass-converter'), `${origin}/convert/mass`)
    assert.equal(canonicalUrl('/weight'), `${origin}/convert/mass`)
    assert.equal(canonicalUrl('/weight-converter'), `${origin}/convert/mass`)

    // Temperature aliases
    assert.equal(canonicalUrl('/temp'), `${origin}/convert/temp`)
    assert.equal(canonicalUrl('/temp-converter'), `${origin}/convert/temp`)
    assert.equal(canonicalUrl('/temperature'), `${origin}/convert/temp`)
    assert.equal(canonicalUrl('/temperature-converter'), `${origin}/convert/temp`)

    // Data aliases
    assert.equal(canonicalUrl('/data'), `${origin}/convert/data`)
    assert.equal(canonicalUrl('/data-converter'), `${origin}/convert/data`)

    // Speed alias
    assert.equal(canonicalUrl('/speed'), `${origin}/convert/speed`)
    assert.equal(canonicalUrl('/speed-converter'), `${origin}/convert/speed`)

    // Datatransfer alias
    assert.equal(canonicalUrl('/datatransfer'), `${origin}/convert/datatransfer`)
    assert.equal(canonicalUrl('/datatransfer-converter'), `${origin}/convert/datatransfer`)
  })
})

describe('SEO Architecture: Indexability & Robots Policy', () => {
  it('correctly classifies public content as indexable', () => {
    assert.equal(isIndexablePath('/'), true)
    assert.equal(isIndexablePath('/converter'), true)
    assert.equal(isIndexablePath('/categories'), true)
    assert.equal(isIndexablePath('/convert/length'), true)
    assert.equal(isIndexablePath('/convert/temp/celsius-to-fahrenheit'), true)
    assert.equal(isIndexablePath('/about'), true)
    assert.equal(isIndexablePath('/formulas'), true)
    assert.equal(isIndexablePath('/blog'), true)
    assert.equal(isIndexablePath('/guides/cups-to-grams'), true)
  })

  it('strictly ensures dist/spa.html carries robots noindex, follow and zero canonical URL', () => {
    const spaPath = path.resolve(process.cwd(), 'dist/spa.html')
    if (fs.existsSync(spaPath)) {
      const content = fs.readFileSync(spaPath, 'utf8')
      assert.ok(!content.includes('rel="canonical"'), 'spa.html must not declare a canonical URL')
      assert.match(
        content,
        /<meta[^>]*name=["']robots["'][^>]*content=["']noindex,\s*follow["']/i,
        'spa.html must have meta robots noindex, follow'
      )
      assert.ok(!/<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*\bindex,\s*follow/i.test(content), 'spa.html must not be indexable')
      assert.ok(!/<meta[^>]*name=["']googlebot["'][^>]*content=["'][^"']*(?<!no)index/i.test(content), 'spa.html must not have googlebot index tag')
    }
  })

  it('strictly excludes local state, user utility, and session routes from indexing', () => {
    assert.equal(isIndexablePath('/dashboard'), false)
    assert.equal(isIndexablePath('/favorites'), false)
    assert.equal(isIndexablePath('/history'), false)
    assert.equal(isIndexablePath('/settings'), false)
    assert.equal(isIndexablePath('/custom-units'), false)
    assert.equal(isIndexablePath('/help'), false)
  })

  it('allows crawling of application pages so noindex, follow can be observed by search engines', () => {
    const robotsPath = path.resolve(process.cwd(), 'public/robots.txt')
    assert.ok(fs.existsSync(robotsPath), 'public/robots.txt must exist')
    const content = fs.readFileSync(robotsPath, 'utf-8')

    assert.ok(content.includes(`Sitemap: ${getSiteUrl()}/sitemap.xml`))
    assert.ok(content.includes('Disallow: /_redirects'))

    // App routes with noindex must NOT be disallowed in robots.txt so crawlers can read the noindex tag
    assert.ok(!content.includes('Disallow: /dashboard'))
    assert.ok(!content.includes('Disallow: /favorites'))
    assert.ok(!content.includes('Disallow: /history'))
    assert.ok(!content.includes('Disallow: /settings'))
    assert.ok(!content.includes('Disallow: /custom-units'))
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
        e.loc.startsWith(`${getSiteUrl()}/`),
        `Loc must begin with authoritative origin with trailing slash: ${e.loc}`
      )
    }

    const xml = buildSitemapXml(entries)
    assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'))
    assert.ok(xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'))
    assert.ok(xml.trimEnd().endsWith('</urlset>'))
  })

  it('includes all 35 canonical category URLs', () => {
    const entries = generateSitemapEntries()
    const locs = new Set(entries.map(e => e.loc))

    const categories = getAllCategories()
    for (const cat of categories) {
      const expectedUrl = `${getSiteUrl()}/convert/${cat.id}`
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
      const aliasUrl = `${getSiteUrl()}${alias}`
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
      const noindexUrl = `${getSiteUrl()}${noindexPath}`
      assert.ok(
        !locs.includes(noindexUrl),
        `Sitemap must not contain noindex URL: ${noindexUrl}`
      )
    }
  })
})

describe('Phase 4 Step 4.3.3: SSG Mathematical Integrity & SI Classification Parity', () => {
  it('prerendered category pages never contain mathematically false cross-dimensional ratios', () => {
    const distConvert = path.resolve(process.cwd(), 'dist/convert')
    if (!fs.existsSync(distConvert)) return

    const forbiddenStatements = [
      '1 kV = 1000 A',
      '1 kΩ = 1000 A',
      '1 µF = 0.000001 A',
      '1 M☉ = 1 AU',
      '1 M⊕ = 0.000003 AU',
      '1 tex = 1000 dtex',
      '1 den = 9000 dtex'
    ]

    const checkDir = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          checkDir(full)
        } else if (entry.name.endsWith('.html')) {
          const html = fs.readFileSync(full, 'utf8')
          for (const stmt of forbiddenStatements) {
            assert.ok(
              !html.includes(stmt),
              `Prerendered HTML file ${path.relative(process.cwd(), full)} contains forbidden false mathematical statement: "${stmt}"`
            )
          }
        }
      }
    }
    checkDir(distConvert)
  })

  it('SystemLabels.S is designated as "Scientific" rather than "SI Base"', () => {
    assert.equal(SystemLabels.S, 'Scientific', 'Unit system "S" must be labeled "Scientific"')
  })
})

describe('Task F: Build Gate Integrity & Invariant Quality Gates', () => {
  it('scripts/verify-prerender.ts contains Invariant 9 enforcing all forbidden leak patterns', () => {
    const verifyScriptPath = path.resolve(process.cwd(), 'scripts/verify-prerender.ts')
    assert.ok(fs.existsSync(verifyScriptPath), 'verify-prerender.ts must exist')
    const verifyContent = fs.readFileSync(verifyScriptPath, 'utf8')

    assert.ok(verifyContent.includes("html.includes('undefined')"), 'Must fail on undefined')
    assert.ok(verifyContent.includes('NaN') && verifyContent.includes('failures.push'), 'Must fail on NaN')
    assert.ok(verifyContent.includes('[object Object]'), 'Must fail on [object Object]')
    assert.ok(verifyContent.includes('Skip tour'), 'Must fail on Skip tour')
    assert.ok(verifyContent.includes('uc_onboarded'), 'Must fail on uc_onboarded')
    assert.ok(verifyContent.includes('NX-COS'), 'Must fail on NX-COS')
    assert.ok(verifyContent.includes('Application Error'), 'Must fail on Application Error')
    assert.ok(verifyContent.includes('Something went wrong'), 'Must fail on Something went wrong')
  })

  it('validates gate F logic correctly catches forbidden tokens and passes clean HTML', () => {
    function evaluateGateF(sampleHtml: string): string[] {
      const errs: string[] = []
      if (sampleHtml.includes('undefined')) errs.push('undefined')
      if (/\bNaN\b/.test(sampleHtml)) errs.push('NaN')
      if (sampleHtml.includes('[object Object]') || sampleHtml.includes('object Object')) errs.push('object Object')
      if (/\$\{[a-zA-Z0-9_.-]+\}/.test(sampleHtml) || /\{\{\s*[a-zA-Z0-9_.-]+\s*\}\}/.test(sampleHtml) || /\{(?:category|title|h1|intro|fromUnit|toUnit|pairSlug|from|to|value|factor|formula)\}/i.test(sampleHtml)) {
        errs.push('placeholder')
      }
      if (sampleHtml.includes('Skip tour') || sampleHtml.includes('uc_onboarded') || sampleHtml.includes('OnboardingTour')) {
        errs.push('tour')
      }
      if (sampleHtml.includes('NX-COS') || sampleHtml.includes('Application Error') || sampleHtml.includes('Something went wrong')) {
        errs.push('error-boundary')
      }
      return errs
    }

    assert.deepEqual(evaluateGateF('<h1>Clean Title</h1><p>Value: 42</p>'), [])
    assert.deepEqual(evaluateGateF('<p>Result is undefined</p>'), ['undefined'])
    assert.deepEqual(evaluateGateF('<td>NaN</td>'), ['NaN'])
    assert.deepEqual(evaluateGateF('<div>[object Object]</div>'), ['object Object'])
    assert.deepEqual(evaluateGateF('<p>Hello ${category}</p>'), ['placeholder'])
    assert.deepEqual(evaluateGateF('<p>{{title}}</p>'), ['placeholder'])
    assert.deepEqual(evaluateGateF('<button>Skip tour</button>'), ['tour'])
    assert.deepEqual(evaluateGateF('<div>NX-COS Crash Report</div>'), ['error-boundary'])
  })
})

describe('Task C2: Textile New Converter Pages (GSM ↔ oz/yd²)', () => {
  it('verifies C2 editorial definitions for gsm-to-oz and oz-to-gsm', () => {
    const textCat = Categories.find(c => c.id === 'textile')!
    assert.ok(textCat, 'textile category must exist')
    const gsmUnit = findUnit(textCat, 'gsm')!
    const ozUnit = findUnit(textCat, 'oz')!
    assert.ok(gsmUnit, 'gsm unit must resolve')
    assert.ok(ozUnit, 'oz unit must resolve')

    const gsmToOz = getPairEditorial(textCat, gsmUnit, ozUnit, 'gsm-to-oz')
    assert.ok(gsmToOz, 'Editorial must exist for gsm-to-oz')
    assert.ok(gsmToOz.directAnswer.formulaDisplay.includes('33.906'), 'Formula must reference 33.906 factor')
    assert.ok(gsmToOz.directAnswer.summary.includes('0.029494'), 'Direct answer must include conversion factor')
    assert.ok(gsmToOz.workedExamples?.some(w => w.includes('480 GSM') && w.includes('14.16 oz/yd²')), 'workedExamples must contain 480 GSM worked example')
    assert.ok(gsmToOz.referenceTable, 'Must include common-weights reference table')
    assert.equal(gsmToOz.referenceTable?.length, 13, 'Must include 13 common weight rows')

    const weights = [120, 150, 180, 200, 250, 280, 300, 350, 400, 450, 480, 500, 600]
    for (const w of weights) {
      assert.ok(gsmToOz.referenceTable?.some(r => r.label.includes(String(w))), `Weights table must contain ${w} GSM`)
    }

    const ozToGsm = getPairEditorial(textCat, ozUnit, gsmUnit, 'oz-to-gsm')
    assert.ok(ozToGsm, 'Editorial must exist for oz-to-gsm')
    assert.ok(ozToGsm.directAnswer.formulaDisplay.includes('33.906'), 'Inverse formula must reference 33.906 factor')
  })

  it('prerendered C2 HTML files satisfy static quality gates when dist is built', () => {
    const gsmToOzPath = path.resolve(process.cwd(), 'dist/convert/textile/gsm-to-oz.html')
    const ozToGsmPath = path.resolve(process.cwd(), 'dist/convert/textile/oz-to-gsm.html')

    if (fs.existsSync(gsmToOzPath)) {
      const gsmHtml = fs.readFileSync(gsmToOzPath, 'utf8')
      assert.ok(gsmHtml.includes('480 GSM') || gsmHtml.includes('14.16'), 'gsm-to-oz must include 480 GSM worked example')
      assert.ok(gsmHtml.includes('33.906'), 'gsm-to-oz must include 33.906 formula factor')
      assert.ok(gsmHtml.includes('t-shirt') || gsmHtml.includes('T-shirt'), 'gsm-to-oz must include typical use applications')
      assert.ok(!gsmHtml.includes('undefined'), 'gsm-to-oz must not contain undefined')
      assert.ok(!/\bNaN\b/.test(gsmHtml), 'gsm-to-oz must not contain NaN')
    }

    if (fs.existsSync(ozToGsmPath)) {
      const ozHtml = fs.readFileSync(ozToGsmPath, 'utf8')
      assert.ok(ozHtml.includes('33.906'), 'oz-to-gsm must include 33.906 formula factor')
      assert.ok(!ozHtml.includes('undefined'), 'oz-to-gsm must not contain undefined')
      assert.ok(!/\bNaN\b/.test(ozHtml), 'oz-to-gsm must not contain NaN')
    }
  })
})
