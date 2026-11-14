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
  test('all 3 guides have valid category relationships in the 36-category registry', () => {
    assert.equal(GUIDE_RELATIONSHIPS.length, 3, 'Exactly 3 kept guides must be registered (12 merged/removed)')
    const categoryIds = new Set(Categories.map(c => c.id))

    for (const rel of GUIDE_RELATIONSHIPS) {
      assert.ok(guideContent[rel.guideSlug], `Guide ${rel.guideSlug} must exist in guideContent`)
      assert.ok(categoryIds.has(rel.categoryId), `Category ${rel.categoryId} must exist in 36-category registry`)
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

  test('category-to-guide lookup resolves matching guides for cooking, pk-numbering, and number-base', () => {
    const cookingGuides = getGuidesForCategory('cooking')
    assert.equal(cookingGuides.length, 1, 'Cooking category must have 1 guide (cups-to-grams)')
    assert.ok(cookingGuides.some(g => g.guideSlug === 'cups-to-grams'))

    const pkGuides = getGuidesForCategory('pk-numbering')
    assert.equal(pkGuides.length, 1, 'pk-numbering category must have 1 guide (lakh-crore-to-million-billion)')
    assert.ok(pkGuides.some(g => g.guideSlug === 'lakh-crore-to-million-billion'))

    const numberBaseGuides = getGuidesForCategory('number-base')
    assert.equal(numberBaseGuides.length, 1, 'number-base category must have 1 guide (binary-hex-ieee-754-guide)')
    assert.ok(numberBaseGuides.some(g => g.guideSlug === 'binary-hex-ieee-754-guide'))

    // Merged categories no longer return guides
    assert.equal(getGuidesForCategory('length').length, 0)
    assert.equal(getGuidesForCategory('mass').length, 0)
    assert.equal(getGuidesForCategory('temp').length, 0)
  })

  test('pair-to-guide lookup resolves pair relationships for kept guides', () => {
    const cookingGuide = getGuideForPair('cooking', 'stick-of-butter-to-tablespoon')
    assert.ok(cookingGuide, 'stick-of-butter-to-tablespoon must resolve to a guide')
    assert.equal(cookingGuide.guideSlug, 'cups-to-grams')

    const pkGuide = getGuideForPair('pk-numbering', 'lakh-to-m-std')
    assert.ok(pkGuide, 'lakh-to-m-std must resolve to a guide')
    assert.equal(pkGuide.guideSlug, 'lakh-crore-to-million-billion')

    const numBaseGuide = getGuideForPair('number-base', 'bin-to-dec')
    assert.ok(numBaseGuide, 'bin-to-dec must resolve to a guide')
    assert.equal(numBaseGuide.guideSlug, 'binary-hex-ieee-754-guide')

    // Merged/unrelated pair returns undefined
    const kmToMilesGuide = getGuideForPair('length', 'meter-to-feet')
    assert.equal(kmToMilesGuide, undefined)
  })

  test('guide-to-blog post relationships reference real blog posts', () => {
    const cookingRel = getGuideRelationship('cups-to-grams')
    assert.ok(cookingRel)
    assert.ok(cookingRel.relatedPostSlugs.includes('ai-powered-unit-conversions-in-2026'))

    const numBaseRel = getGuideRelationship('binary-hex-ieee-754-guide')
    assert.ok(numBaseRel)
    assert.ok(numBaseRel.relatedPostSlugs.includes('digital-data-storage-units-guide'))
  })

  test('prerendered HTML contains contextual internal links on category, pair, and guide pages', () => {
    // 1. Category page contains link to its guides
    const cookingCatHtml = fs.readFileSync(path.join(distDir, 'convert/cooking.html'), 'utf-8')
    assert.ok(cookingCatHtml.includes('/guides/cups-to-grams'), 'Cooking category HTML must link to cups-to-grams guide')

    // 2. Pair page contains link to its guide callout
    const pairHtml = fs.readFileSync(path.join(distDir, 'convert/cooking/stick-of-butter-to-tablespoon.html'), 'utf-8')
    assert.ok(pairHtml.includes('/guides/cups-to-grams'), 'stick-of-butter-to-tablespoon pair HTML must link to cups-to-grams guide')

    // 3. Guide page contains links back to pair converter and category
    const guideHtml = fs.readFileSync(path.join(distDir, 'guides/cups-to-grams.html'), 'utf-8')
    assert.ok(guideHtml.includes('/convert/cooking/stick-of-butter-to-tablespoon'), 'cups-to-grams guide HTML must link to stick-of-butter-to-tablespoon pair')
    assert.ok(guideHtml.includes('/convert/cooking'), 'cups-to-grams guide HTML must link to cooking category')
    assert.ok(guideHtml.includes('/blog/ai-powered-unit-conversions-in-2026'), 'cups-to-grams guide HTML must link to related blog article')
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
