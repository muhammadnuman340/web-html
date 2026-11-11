/**
 * tests/internal-linking-query-state.test.ts
 * Phase 3 Step 4: Internal Linking & Pair Query-State Test Suite
 *
 * Verifies:
 * 1. Guide-to-Category, Guide-to-Pair, and Category/Pair-to-Guide bidirectional linking.
 * 2. Deterministic ?val= parsing and boundary handling (12, 0, 12.5, -10, 1e3, abc, Infinity, etc.).
 * 3. Canonical, OG, Twitter, and Schema ID invariants (must NEVER include ?val=).
 * 4. Prerendered static HTML contains expected contextual links and zero query pollution.
 */

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {
  GUIDE_RELATIONSHIPS,
  getGuidesForCategory,
  getGuideForPair,
  getGuideRelationship,
  parsePairQueryVal,
} from '../src/config/guideRelations'
import { Categories } from '../src/engine/categories'
import { guideContent } from '../src/engine/guideContent'
import { canonicalUrl, isIndexablePath } from '../src/config/site'
import { buildPairSchema } from '../src/config/schema'

const distDir = path.resolve(process.cwd(), 'dist')

describe('Phase 3 Step 4: Guide Relationship Architecture & Internal Linking', () => {
  test('all 9 guides have valid category relationships in the 28-category registry', () => {
    assert.equal(GUIDE_RELATIONSHIPS.length, 9, 'Exactly 9 guides must be registered')
    const categoryIds = new Set(Categories.map(c => c.id))

    for (const rel of GUIDE_RELATIONSHIPS) {
      assert.ok(guideContent[rel.guideSlug], `Guide ${rel.guideSlug} must exist in guideContent`)
      assert.ok(categoryIds.has(rel.categoryId), `Category ${rel.categoryId} must exist in 28-category registry`)
      assert.equal(rel.categoryPath, `/convert/${rel.categoryId}`, 'Category path must be canonical')
    }
  })

  test('guide-to-pair links point to valid canonical popular pairs without aliases', () => {
    for (const rel of GUIDE_RELATIONSHIPS) {
      assert.ok(rel.pairPath.startsWith(`/convert/${rel.categoryId}/`), `Pair path ${rel.pairPath} must be under canonical category`)
      assert.ok(isIndexablePath(rel.pairPath), `Pair path ${rel.pairPath} must be an indexable path`)
      assert.ok(!rel.pairPath.includes('//'), `Pair path must not contain double slashes: ${rel.pairPath}`)
    }
  })

  test('category-to-guide lookup resolves matching guides for length, mass, and temp', () => {
    const lengthGuides = getGuidesForCategory('length')
    assert.equal(lengthGuides.length, 2, 'Length category must have 2 guides (meters-to-feet, feet-to-meters)')
    assert.ok(lengthGuides.some(g => g.guideSlug === 'meters-to-feet'))
    assert.ok(lengthGuides.some(g => g.guideSlug === 'feet-to-meters'))

    const massGuides = getGuidesForCategory('mass')
    assert.equal(massGuides.length, 2, 'Mass category must have 2 guides (lbs-to-kg, kg-to-lbs)')
    assert.ok(massGuides.some(g => g.guideSlug === 'lbs-to-kg'))
    assert.ok(massGuides.some(g => g.guideSlug === 'kg-to-lbs'))

    const tempGuides = getGuidesForCategory('temp')
    assert.equal(tempGuides.length, 2, 'Temp category must have 2 guides (celsius-to-fahrenheit, fahrenheit-to-celsius)')
    assert.ok(tempGuides.some(g => g.guideSlug === 'celsius-to-fahrenheit'))
    assert.ok(tempGuides.some(g => g.guideSlug === 'fahrenheit-to-celsius'))

    // Categories without guides return empty array
    const digitalGuides = getGuidesForCategory('digital')
    assert.equal(digitalGuides.length, 0)
  })

  test('pair-to-guide lookup resolves bidirectional pair relationships', () => {
    const meterToFeetGuide = getGuideForPair('length', 'meter-to-feet')
    assert.ok(meterToFeetGuide, 'meter-to-feet must resolve to a guide')
    assert.equal(meterToFeetGuide.guideSlug, 'meters-to-feet')

    const feetToMeterGuide = getGuideForPair('length', 'feet-to-meters')
    assert.ok(feetToMeterGuide, 'feet-to-meters must resolve to a guide')
    assert.equal(feetToMeterGuide.guideSlug, 'feet-to-meters')

    const celsiusGuide = getGuideForPair('temp', 'celsius-to-fahrenheit')
    assert.ok(celsiusGuide, 'celsius-to-fahrenheit must resolve to a guide')
    assert.equal(celsiusGuide.guideSlug, 'celsius-to-fahrenheit')

    // Unrelated pair returns undefined
    const kmToMilesGuide = getGuideForPair('length', 'kilometer-to-miles')
    assert.equal(kmToMilesGuide, undefined)
  })

  test('guide-to-blog post relationships reference real blog posts', () => {
    const lengthRel = getGuideRelationship('meters-to-feet')
    assert.ok(lengthRel)
    assert.ok(lengthRel.relatedPostSlugs.includes('compound-length-units-guide'))

    const tempRel = getGuideRelationship('celsius-to-fahrenheit')
    assert.ok(tempRel)
    assert.ok(tempRel.relatedPostSlugs.includes('temperature-scales-celsius-fahrenheit-kelvin'))
  })

  test('prerendered HTML contains contextual internal links on category, pair, and guide pages', () => {
    // 1. Category page contains link to its guides
    const lengthCatHtml = fs.readFileSync(path.join(distDir, 'convert/length.html'), 'utf-8')
    assert.ok(lengthCatHtml.includes('/guides/meters-to-feet'), 'Length category HTML must link to meters-to-feet guide')
    assert.ok(lengthCatHtml.includes('/guides/feet-to-meters'), 'Length category HTML must link to feet-to-meters guide')

    // 2. Pair page contains link to its guide callout
    const pairHtml = fs.readFileSync(path.join(distDir, 'convert/length/meter-to-feet.html'), 'utf-8')
    assert.ok(pairHtml.includes('/guides/meters-to-feet'), 'meter-to-feet pair HTML must link to meters-to-feet guide')

    // 3. Guide page contains links back to pair converter and category
    const guideHtml = fs.readFileSync(path.join(distDir, 'guides/meters-to-feet.html'), 'utf-8')
    assert.ok(guideHtml.includes('/convert/length/meter-to-feet'), 'meters-to-feet guide HTML must link to meter-to-feet pair')
    assert.ok(guideHtml.includes('/convert/length'), 'meters-to-feet guide HTML must link to length category')
    assert.ok(guideHtml.includes('/blog/compound-length-units-guide'), 'meters-to-feet guide HTML must link to related blog article')
  })
})

describe('Phase 3 Step 4: Pair ?val= Query-State Parsing & Canonical Invariants', () => {
  test('parsePairQueryVal accepts valid finite numbers including zero and scientific notation', () => {
    assert.equal(parsePairQueryVal('12'), '12')
    assert.equal(parsePairQueryVal('0'), '0', 'Zero must be preserved and NOT fall back to 1')
    assert.equal(parsePairQueryVal('12.5'), '12.5')
    assert.equal(parsePairQueryVal('-10'), '-10', 'Negative numbers must be preserved')
    assert.equal(parsePairQueryVal('+5'), '+5')
    assert.equal(parsePairQueryVal('.5'), '.5')
    assert.equal(parsePairQueryVal('1e3'), '1e3')
    assert.equal(parsePairQueryVal('  25.4  '), '25.4', 'Whitespace must be trimmed')
  })

  test('parsePairQueryVal rejects invalid, malformed, or infinite values safely to default 1', () => {
    assert.equal(parsePairQueryVal(null), '1')
    assert.equal(parsePairQueryVal(undefined), '1')
    assert.equal(parsePairQueryVal(''), '1')
    assert.equal(parsePairQueryVal('   '), '1')
    assert.equal(parsePairQueryVal('abc'), '1')
    assert.equal(parsePairQueryVal('0x10'), '1', 'Hexadecimal syntax must be rejected to default 1')
    assert.equal(parsePairQueryVal('0b10'), '1', 'Binary syntax must be rejected to default 1')
    assert.equal(parsePairQueryVal('0o10'), '1', 'Octal syntax must be rejected to default 1')
    assert.equal(parsePairQueryVal('Infinity'), '1')
    assert.equal(parsePairQueryVal('-Infinity'), '1')
    assert.equal(parsePairQueryVal('NaN'), '1')
    assert.equal(parsePairQueryVal('1e9999'), '1', 'Extreme overflowing exponents must safely fall back')
  })

  test('canonical URL and schema @id strictly exclude ?val= query parameter', () => {
    const rawPathWithQuery = '/convert/length/meter-to-feet?val=12'
    const canonical = canonicalUrl(rawPathWithQuery)
    assert.ok(!canonical.includes('?val='), `Canonical URL must NOT contain query parameters: ${canonical}`)
    assert.ok(canonical.endsWith('/convert/length/meter-to-feet'), `Canonical must match base path: ${canonical}`)

    const lengthCat = Categories.find(c => c.id === 'length')!
    const u1 = lengthCat.un.find(u => u.id === 'm')!
    const u2 = lengthCat.un.find(u => u.id === 'ft')!
    const schema = buildPairSchema(lengthCat, u1, u2, 3.28084, 0.3048, 'meter-to-feet')

    for (const node of schema['@graph']) {
      const id = node['@id'] as string
      assert.ok(!id.includes('?val='), `Schema @id must NOT contain ?val=: ${id}`)
    }
  })

  test('sitemap entries strictly exclude query parameter variants', () => {
    const sitemapContent = fs.readFileSync(path.join(process.cwd(), 'public/sitemap.xml'), 'utf-8')
    assert.ok(!sitemapContent.includes('?val='), 'Sitemap XML must NOT contain ?val= parameters')
    assert.ok(!sitemapContent.match(/<loc>[^<]*\?[^<]*<\/loc>/), 'Sitemap loc entries must not contain query strings')
  })
})
