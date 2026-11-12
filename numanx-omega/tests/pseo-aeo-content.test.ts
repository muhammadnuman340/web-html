/**
 * tests/pseo-aeo-content.test.ts
 *
 * Phase 3 Step 5: pSEO Content Differentiation & AEO Answer Quality Test Suite
 *
 * Verifies:
 * 1. Completeness across all 99 canonical pairs (zero missing, zero unmapped).
 * 2. Mathematical correctness of direct answers (linear, affine/temp, reciprocal fuel).
 * 3. Absence of NaN, undefined, or Infinity across direct answers, formulas, and FAQs.
 * 4. Pair-specific metrological explanations with dimensional context.
 * 5. Factual, defensible practical use cases (at least 2 per pair).
 * 6. Deterministic reciprocal relationship resolution:
 *    - Valid canonical pair route when inverse exists in 99 set.
 *    - Graceful fallback to category hub when inverse is not in 99 set.
 * 7. Visible FAQ to Schema.org FAQPage parity across all 99 pairs.
 */

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { Categories } from '../src/engine/categories'
import { categoryContent } from '../src/engine/categoryContent'
import {
  cleanSlug,
  findUnit,
  getPairEditorial,
  isCanonicalPair,
  CANONICAL_PAIR_SET,
} from '../src/config/pairEditorial'
import { buildPairSchema } from '../src/config/schema'
import { convert } from '../src/engine/converter'
import { BLOG_POSTS } from '../src/data/blogPosts'
import { PAGE_META, withBrand } from '../src/config/pageMeta'
import { getCategoryStandards } from '../src/engine/categoryStandards'
import { getRelatedCategoryIds } from '../src/config/relatedCategories'
import { LEGAL, STORAGE_KEYS, buildSecurityTxt, getPrivacyPolicy, getTerms, getContactPage } from '../src/config/legal'

describe('Phase 3 Step 5: pSEO Content Differentiation & AEO Answer Quality', () => {
  test('canonical pair set contains exactly 123 unique pairs across 36 categories', () => {
    assert.equal(CANONICAL_PAIR_SET.size, 123, 'CANONICAL_PAIR_SET must contain exactly 123 pairs')
    assert.ok(isCanonicalPair('length', 'meter-to-feet'), 'meter-to-feet must be canonical')
    assert.ok(!isCanonicalPair('length', 'meter-to-invalid'), 'invalid pair must not be canonical')
  })

  test('all 99 canonical pairs resolve valid units, direct answers, and non-empty metadata', () => {
    let verifiedCount = 0

    for (const cat of Categories) {
      const content = categoryContent[cat.id]
      if (!content?.popularPairs) continue

      for (const pair of content.popularPairs) {
        const fromSlug = cleanSlug(pair.from)
        const toSlug = cleanSlug(pair.to)
        const pairParam = `${fromSlug}-to-${toSlug}`

        const u1 = findUnit(cat, fromSlug)
        const u2 = findUnit(cat, toSlug)
        assert.ok(u1, `Unit 1 must resolve for ${pair.from} in ${cat.id}`)
        assert.ok(u2, `Unit 2 must resolve for ${pair.to} in ${cat.id}`)

        const editorial = getPairEditorial(cat, u1, u2, pairParam)

        // 1. Direct Answer
        assert.ok(editorial.directAnswer.summary, `Summary must not be empty for ${cat.id}:${pairParam}`)
        assert.ok(!editorial.directAnswer.summary.includes('NaN'), `Summary must not contain NaN for ${cat.id}:${pairParam}`)
        assert.ok(!editorial.directAnswer.summary.includes('undefined'), `Summary must not contain undefined for ${cat.id}:${pairParam}`)
        assert.ok(!editorial.directAnswer.summary.includes('Infinity'), `Summary must not contain Infinity for ${cat.id}:${pairParam}`)

        assert.ok(editorial.directAnswer.formulaDisplay, `Formula display must not be empty for ${cat.id}:${pairParam}`)
        assert.ok(editorial.directAnswer.calculationRule, `Calculation rule must not be empty for ${cat.id}:${pairParam}`)

        // 2. Explanation
        assert.ok(editorial.explanation.heading, `Explanation heading must not be empty for ${cat.id}:${pairParam}`)
        assert.ok(editorial.explanation.paragraphs.length >= 2, `Must have at least 2 explanation paragraphs for ${cat.id}:${pairParam}`)
        for (const p of editorial.explanation.paragraphs) {
          assert.ok(p.length > 30, `Paragraph must be substantive for ${cat.id}:${pairParam}`)
          assert.ok(!p.includes('NaN'), `Paragraph must not contain NaN for ${cat.id}:${pairParam}`)
        }

        // 3. Practical Use Cases
        assert.ok(editorial.useCases.length >= 2, `Must have at least 2 use cases for ${cat.id}:${pairParam}`)
        for (const uc of editorial.useCases) {
          assert.ok(uc.domain, `Use case domain required for ${cat.id}:${pairParam}`)
          assert.ok(uc.context, `Use case context required for ${cat.id}:${pairParam}`)
        }

        // 4. Reciprocal Link
        assert.ok(editorial.reciprocal.url.startsWith('/convert/'), `Reciprocal URL must start with /convert/ for ${cat.id}:${pairParam}`)
        assert.ok(editorial.reciprocal.anchorText, `Reciprocal anchor text required for ${cat.id}:${pairParam}`)
        if (editorial.reciprocal.hasCanonicalPair) {
          assert.ok(editorial.reciprocal.url.includes('-to-'), `Canonical pair reciprocal must contain -to- for ${cat.id}:${pairParam}`)
        } else {
          assert.equal(editorial.reciprocal.url, `/convert/${cat.id}`, `Non-pair reciprocal must point to category hub for ${cat.id}:${pairParam}`)
        }

        // 5. FAQs
        assert.equal(editorial.faqs.length, 4, `Must have exactly 4 FAQ items for ${cat.id}:${pairParam}`)
        for (const f of editorial.faqs) {
          assert.ok(f.question, `FAQ question required for ${cat.id}:${pairParam}`)
          assert.ok(f.answer, `FAQ answer required for ${cat.id}:${pairParam}`)
          assert.ok(!f.answer.includes('NaN'), `FAQ answer must not contain NaN for ${cat.id}:${pairParam}`)
          assert.ok(!f.answer.includes('undefined'), `FAQ answer must not contain undefined for ${cat.id}:${pairParam}`)
          assert.ok(!f.answer.includes('Infinity'), `FAQ answer must not contain Infinity for ${cat.id}:${pairParam}`)
        }

        verifiedCount++
      }
    }

    assert.equal(verifiedCount, 123, 'Must have verified all 123 canonical pairs')
  })

  test('every pair slug resolves to two distinct units and no two slugs share a unit pair', () => {
    const seen = new Map<string, string>()
    for (const cat of Categories) {
      for (const pair of categoryContent[cat.id]?.popularPairs ?? []) {
        const slug = `${cat.id}/${cleanSlug(pair.from)}-to-${cleanSlug(pair.to)}`
        const u1 = findUnit(cat, cleanSlug(pair.from))!
        const u2 = findUnit(cat, cleanSlug(pair.to))!
        assert.notEqual(u1.id, u2.id, `${slug} resolves both sides to "${u1.id}"`)
        const key = `${cat.id}:${u1.id}->${u2.id}`
        assert.ok(!seen.has(key), `${slug} and ${seen.get(key)} both resolve to ${key}`)
        seen.set(key, slug)
      }
    }
  })

  test('pairs that rely on slug synonyms resolve to the intended units and values', () => {
    const cases: [string, string, string, string, string, number][] = [
      ['force', 'kn', 'lbf', 'kN', 'lbf', 224.808943],
      ['frequency', 'rpm', 'hz', 'rpm', 'Hz', 1 / 60],
      ['angle', 'radians', 'mrad', 'rad', 'mrad', 1000],
      ['power', 'watts', 'btu-h', 'W', 'BTUh', 3.412142],
      ['acceleration', 'ft-s', 'm-s', 'ftps2', 'mps2', 0.3048],
    ]
    for (const [catId, from, to, fromId, toId, value] of cases) {
      const cat = Categories.find(c => c.id === catId)!
      assert.equal(findUnit(cat, from)?.id, fromId, `${catId}:${from} must resolve to ${fromId}`)
      assert.equal(findUnit(cat, to)?.id, toId, `${catId}:${to} must resolve to ${toId}`)
      const result = convert(1, catId, fromId, toId)!
      assert.ok(Math.abs(result - value) / value < 1e-6, `1 ${fromId} → ${toId} expected ${value}, got ${result}`)
    }
  })

  test('temperature conversions are correctly flagged as affine with offset formulas', () => {
    const tempCat = Categories.find(c => c.id === 'temp')!
    const cUnit = tempCat.un.find(u => u.id === 'C')!
    const fUnit = tempCat.un.find(u => u.id === 'F')!

    const editorial = getPairEditorial(tempCat, cUnit, fUnit, 'celsius-to-fahrenheit')
    assert.equal(editorial.directAnswer.isAffine, true, 'Celsius to Fahrenheit must be affine')
    assert.equal(editorial.directAnswer.isReciprocal, false)
    assert.ok(editorial.directAnswer.formulaDisplay.includes('32'), 'Formula must account for 32 offset')
    assert.ok(editorial.directAnswer.summary.includes('33.8'), 'Summary must mention 1 °C = 33.8 °F')
  })

  test('fuel economy reciprocal conversions are correctly flagged with inverse division formulas', () => {
    const fuelCat = Categories.find(c => c.id === 'fuel')!
    const mpgUnit = fuelCat.un.find(u => u.id === 'mpgUS')!
    const l100Unit = fuelCat.un.find(u => u.id === 'L100km')!

    const editorial = getPairEditorial(fuelCat, mpgUnit, l100Unit, 'mpg-us-to-l-100km')
    assert.equal(editorial.directAnswer.isReciprocal, true, 'MPG to L/100km must be reciprocal')
    assert.ok(editorial.directAnswer.formulaDisplay.includes('235.215'), 'Formula must contain 235.215 constant')
    assert.ok(editorial.directAnswer.calculationRule.includes('divide 235.215'), 'Rule must specify reciprocal division')
  })

  test('exact parity between buildPairSchema and getPairEditorial FAQs', () => {
    const massCat = Categories.find(c => c.id === 'mass')!
    const kgUnit = massCat.un.find(u => u.id === 'kg')!
    const lbUnit = massCat.un.find(u => u.id === 'lb')!
    const unitRatio = convert(1, 'mass', 'kg', 'lb')
    const inverseUnitRatio = convert(1, 'mass', 'lb', 'kg')

    const editorial = getPairEditorial(massCat, kgUnit, lbUnit, 'kilogram-to-pounds')
    const schema = buildPairSchema(massCat, kgUnit, lbUnit, unitRatio, inverseUnitRatio, 'kilogram-to-pounds', editorial.faqs, editorial.directAnswer.summary)

    const graph = schema['@graph'] as Array<{ '@type': string; mainEntity?: Array<{ name: string; acceptedAnswer: { text: string } }> }>
    const faqNode = graph.find(n => n['@type'] === 'FAQPage')
    assert.ok(faqNode, 'Schema must contain FAQPage node')
    assert.ok(faqNode.mainEntity, 'FAQPage node must contain mainEntity')
    assert.equal(faqNode.mainEntity.length, editorial.faqs.length, 'FAQ count in schema must match editorial exactly')

    for (let i = 0; i < editorial.faqs.length; i++) {
      assert.equal(faqNode.mainEntity[i].name, editorial.faqs[i].question, `Question ${i} must match exactly`)
      assert.equal(faqNode.mainEntity[i].acceptedAnswer.text, editorial.faqs[i].answer, `Answer ${i} must match exactly`)
    }
  })

  test('reciprocal routing resolves to canonical pair when inverse is in sitemap, or category hub otherwise', () => {
    const lengthCat = Categories.find(c => c.id === 'length')!
    const mUnit = lengthCat.un.find(u => u.id === 'm')!
    const ftUnit = lengthCat.un.find(u => u.id === 'ft')!

    // meter-to-feet has feet-to-meters in 99 set
    const mToFt = getPairEditorial(lengthCat, mUnit, ftUnit, 'meter-to-feet')
    assert.equal(mToFt.reciprocal.hasCanonicalPair, true)
    assert.equal(mToFt.reciprocal.url, '/convert/length/feet-to-meters')

    // speed: mach-to-km-h has NO km-h-to-mach in 99 set
    const speedCat = Categories.find(c => c.id === 'speed')!
    const machUnit = speedCat.un.find(u => u.id === 'mach')!
    const kmhUnit = speedCat.un.find(u => u.id === 'kmh')!
    const machToKmh = getPairEditorial(speedCat, machUnit, kmhUnit, 'mach-to-km-h')
    assert.equal(machToKmh.reciprocal.hasCanonicalPair, false)
    assert.equal(machToKmh.reciprocal.url, '/convert/speed')
  })

  test('all 99 prerendered pair HTML files exist in dist/ and satisfy static content invariants', () => {
    const distConvert = path.resolve(process.cwd(), 'dist/convert')
    if (!fs.existsSync(distConvert)) return // skip if dist has not been generated yet

    let verifiedPrerenderCount = 0
    for (const cat of Categories) {
      const content = categoryContent[cat.id]
      if (!content?.popularPairs) continue

      for (const pair of content.popularPairs) {
        const fromSlug = cleanSlug(pair.from)
        const toSlug = cleanSlug(pair.to)
        const pairParam = `${fromSlug}-to-${toSlug}`
        const htmlPath = path.join(distConvert, cat.id, `${pairParam}.html`)

        assert.ok(fs.existsSync(htmlPath), `Prerender file must exist: dist/convert/${cat.id}/${pairParam}.html`)
        const html = fs.readFileSync(htmlPath, 'utf8')

        assert.ok(html.includes('id="aeo-answer-heading"') || html.includes('Quick Direct Answer'), `Direct answer heading missing in ${cat.id}:${pairParam}`)
        assert.ok(html.includes('id="explanation-heading"') || html.includes('Relate'), `Explanation heading missing in ${cat.id}:${pairParam}`)
        assert.ok(html.includes('id="usecases-heading"') || html.includes('Practical Applications'), `Use cases heading missing in ${cat.id}:${pairParam}`)
        assert.ok(html.includes('id="reciprocal-heading"') || html.includes('Reciprocal'), `Reciprocal heading missing in ${cat.id}:${pairParam}`)
        assert.ok(!html.includes('NaN'), `NaN found in ${cat.id}:${pairParam}`)
        assert.ok(!html.includes('undefined'), `undefined found in ${cat.id}:${pairParam}`)
        assert.ok(!html.includes('Infinity'), `Infinity found in ${cat.id}:${pairParam}`)

        verifiedPrerenderCount++
      }
    }
    assert.equal(verifiedPrerenderCount, 123, 'Must verify all 123 prerendered pair HTML files')
  })

  test('prerendered blog posts contain the full article body', () => {
    const distBlog = path.resolve(process.cwd(), 'dist/blog')
    if (!fs.existsSync(distBlog)) return // skip if dist has not been generated yet
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    for (const post of BLOG_POSTS) {
      const html = fs.readFileSync(path.join(distBlog, `${post.slug}.html`), 'utf8')
      const body = html.split(/<body[^>]*>/i)[1].replace(/<script[\s\S]*?<\/script>/gi, '')
      assert.ok(!/\bundefined\b/.test(body), `${post.slug} body must not contain "undefined"`)
      assert.ok(body.includes(esc(post.content.intro)), `${post.slug} must include its intro`)
      for (const t of post.content.keyTakeaways) assert.ok(body.includes(esc(t)), `${post.slug} must include takeaway: ${t}`)
      for (const sec of post.content.sections) {
        assert.ok(body.includes(esc(sec.title)), `${post.slug} must include section title: ${sec.title}`)
        assert.ok(body.includes(esc(sec.body)), `${post.slug} must include section body: ${sec.title}`)
      }
    }
  })
  test('prerendered titles and descriptions are readable, unique, and match shared page metadata', () => {
    const dist = path.resolve(process.cwd(), 'dist')
    if (!fs.existsSync(dist)) return // skip if dist has not been generated yet
    const decode = (s: string) => s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    const read = (route: string) => {
      const clean = route.replace(/^\/+/, '').replace(/\/+$/, '')
      const target = clean === '' ? 'index.html' : `${clean}.html`
      const html = fs.readFileSync(path.join(dist, target), 'utf8')
      return {
        title: decode(html.match(/<title[^>]*>([^<]*)<\/title>/)![1]),
        desc: decode(html.match(/<meta name="description"[^>]*content="([^"]*)"/)![1]),
      }
    }

    for (const [route, meta] of Object.entries(PAGE_META)) {
      const page = read(route)
      assert.equal(page.title, withBrand(meta.title), `${route} title must come from PAGE_META`)
      assert.equal(page.desc, meta.description, `${route} description must come from PAGE_META`)
    }

    const titles = new Map<string, string>()
    const descs = new Map<string, string>()
    const rawIds = /\((?:[^)]*_[a-z]|mps2|gforce|kmh|L100km|mpgUS|gcm3|kgm3|lbft3?|ftps2|BTUh)\b/
    for (const cat of Categories) {
      for (const pair of categoryContent[cat.id]?.popularPairs ?? []) {
        const route = `convert/${cat.id}/${cleanSlug(pair.from)}-to-${cleanSlug(pair.to)}`
        const { title, desc } = read(route)
        assert.ok(!rawIds.test(title), `${route} title shows an internal unit id: ${title}`)
        assert.ok(desc.length <= 165, `${route} description is ${desc.length} chars`)
        assert.ok(!titles.has(title), `${route} and ${titles.get(title)} share the title "${title}"`)
        assert.ok(!descs.has(desc), `${route} and ${descs.get(desc)} share a description`)
        titles.set(title, route)
        descs.set(desc, route)
      }
    }
  })
  test('every internal link in prerendered HTML points to a prerendered page', () => {
    const dist = path.resolve(process.cwd(), 'dist')
    if (!fs.existsSync(dist)) return // skip if dist has not been generated yet
    const pages: string[] = []
    const walk = (dir: string) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, e.name)
        if (e.isDirectory() && e.name !== 'assets') walk(full)
        else if (e.name.endsWith('.html') && !e.name.startsWith('google') && e.name !== 'spa.html' && e.name !== '404.html') pages.push(full)
      }
    }
    walk(dist)
    const broken: string[] = []
    for (const file of pages) {
      const body = fs.readFileSync(file, 'utf8').split(/<body[^>]*>/i)[1] ?? ''
      for (const [, href] of body.matchAll(/<a[^>]+href="(\/[^"#?]*)/g)) {
        const cleanHref = href.replace(/^\/+/, '').replace(/\/+$/, '')
        const target = path.join(dist, cleanHref === '' ? 'index.html' : `${cleanHref}.html`)
        if (href !== '/' && !fs.existsSync(target)) broken.push(`${path.relative(dist, file)} -> ${href}`)
      }
    }
    assert.deepEqual(broken, [], `Broken internal links:\n${broken.slice(0, 20).join('\n')}`)
  })

  test('category pages include standards text and topically related category links', () => {
    const dist = path.resolve(process.cwd(), 'dist/convert')
    if (!fs.existsSync(dist)) return // skip if dist has not been generated yet
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    for (const cat of Categories) {
      const html = fs.readFileSync(path.join(dist, `${cat.id}.html`), 'utf8')
      const std = getCategoryStandards(cat.id, cat.lb, cat.un.map(u => u.lb))
      assert.ok(html.includes(esc(std.aeoCapsule)), `${cat.id} must include its answer summary`)
      assert.ok(html.includes(esc(std.standardsStatement)), `${cat.id} must include its standards statement`)
      const related = getRelatedCategoryIds(cat.id)
      assert.ok(related.length >= 2, `${cat.id} needs at least 2 related categories`)
      for (const id of related) {
        assert.ok(Categories.some(c => c.id === id), `${cat.id} lists unknown related category ${id}`)
        assert.ok(html.includes(`href="/convert/${id}"`), `${cat.id} must link to related category ${id}`)
      }
    }
  })
  test('legal pages are prerendered and every page links to them in the footer', () => {
    const dist = path.resolve(process.cwd(), 'dist')
    if (!fs.existsSync(dist)) return // skip if dist has not been generated yet
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    for (const doc of [getPrivacyPolicy(), getTerms(), getContactPage()]) {
      const cleanDoc = doc.path.replace(/^\/+/, '').replace(/\/+$/, '')
      const html = fs.readFileSync(path.join(dist, `${cleanDoc}.html`), 'utf8')
      for (const sec of doc.sections) {
        assert.ok(html.includes(esc(sec.heading)), `${doc.path} must include section "${sec.heading}"`)
      }
    }
    const pages: string[] = []
    const walk = (dir: string) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, e.name)
        if (e.isDirectory() && e.name !== 'assets') walk(full)
        else if (e.name.endsWith('.html') && !e.name.startsWith('google') && e.name !== 'spa.html' && e.name !== '404.html') pages.push(full)
      }
    }
    walk(dist)
    for (const file of pages) {
      const html = fs.readFileSync(file, 'utf8')
      for (const href of ['/privacy', '/terms', '/contact']) {
        assert.ok(html.includes(`href="${href}"`), `${path.relative(dist, file)} must link to ${href}`)
      }
      assert.ok(!html.includes('fonts.googleapis.com'), `${path.relative(dist, file)} must not load Google Fonts`)
    }
  })

  test('every localStorage key used by the app is covered by the privacy policy key list', () => {
    const listed = new Set([...STORAGE_KEYS.personal, ...STORAGE_KEYS.preferences])
    const used = new Set<string>()
    const walk = (dir: string) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, e.name)
        if (e.isDirectory()) walk(full)
        else if (/\.(ts|tsx)$/.test(e.name)) {
          for (const [, key] of fs.readFileSync(full, 'utf8').matchAll(/['"`](uc_[a-zA-Z_]+)['"`]/g)) used.add(key)
        }
      }
    }
    walk(path.resolve(process.cwd(), 'src'))
    const missing = [...used].filter(k => !listed.has(k))
    assert.deepEqual(missing, [], `Add these keys to STORAGE_KEYS and the Privacy Policy: ${missing.join(', ')}`)
  })

  test('security.txt is only built once a contact email is configured', () => {
    const original = LEGAL.contactEmail
    try {
      LEGAL.contactEmail = ''
      assert.equal(buildSecurityTxt('https://example.com'), null)
      LEGAL.contactEmail = 'security@example.com'
      const txt = buildSecurityTxt('https://example.com', new Date('2026-10-29T00:00:00Z'))!
      assert.ok(txt.includes('Contact: mailto:security@example.com'))
      assert.ok(txt.includes('Expires: 2027-10-29T00:00:00Z'))
      assert.ok(txt.includes('Canonical: https://example.com/.well-known/security.txt'))
    } finally {
      LEGAL.contactEmail = original
    }
  })
})
