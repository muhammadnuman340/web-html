import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getAllCategories } from '../src/engine/converter'
import {
  AUTHORITY_SOURCES,
  AUTHORITY_SOURCES_LIST,
  getAuthoritySource,
  getCategoryAuthoritySources,
} from '../src/config/authoritySources'
import { BLOG_POSTS } from '../src/data/blogPosts'
import { buildCorePageSchema } from '../src/config/schema'
import { getPairEditorial } from '../src/config/pairEditorial'
import { CATEGORY_STANDARDS } from '../src/engine/categoryStandards'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

describe('Phase 3 Step 6 — GEO Authority, Source Citations & Entity Harmonization', () => {
  describe('1. Authoritative Sources Registry Integrity', () => {
    test('contains verified institutional sources', () => {
      const keys = Object.keys(AUTHORITY_SOURCES)
      assert.ok(keys.length >= 5, 'Should have at least 5 institutional sources')
      assert.ok(keys.includes('bipm-si-brochure'))
      assert.ok(keys.includes('bipm-base-units'))
      assert.ok(keys.includes('nist-sp811'))
      assert.ok(keys.includes('nist-hb44'))
      assert.ok(keys.includes('codata-constants'))
    })

    test('every source has valid HTTPS URL and complete metadata', () => {
      for (const src of AUTHORITY_SOURCES_LIST) {
        assert.ok(src.id, 'Source must have id')
        assert.ok(src.organization, 'Source must have organization')
        assert.ok(src.title, 'Source must have title')
        assert.ok(src.url.startsWith('https://'), `URL must be HTTPS: ${src.url}`)
        assert.ok(src.documentRef, 'Source must have documentRef')
        assert.ok(src.domain, 'Source must have domain')
        assert.ok(Array.isArray(src.supports) && src.supports.length > 0, 'Must have supports array')
      }
    })

    test('getAuthoritySource retrieves correct source by ID', () => {
      const bipm = getAuthoritySource('bipm-si-brochure')
      assert.ok(bipm)
      assert.equal(bipm?.organization, 'Bureau International des Poids et Mesures (BIPM)')
      assert.equal(getAuthoritySource('non-existent'), undefined)
    })

    test('getCategoryAuthoritySources returns contextually relevant sources only', () => {
      const lengthSources = getCategoryAuthoritySources('length')
      assert.ok(lengthSources.some(s => s.id === 'nist-sp811'))
      assert.ok(lengthSources.some(s => s.id === 'bipm-si-brochure'))

      const cookingSources = getCategoryAuthoritySources('cooking')
      assert.ok(cookingSources.some(s => s.id === 'nist-hb44'))
      assert.equal(cookingSources.some(s => s.id === 'bipm-si-brochure'), false)

      const energySources = getCategoryAuthoritySources('energy')
      assert.ok(energySources.some(s => s.id === 'codata-constants'))

      // Non-physical / market categories must NOT claim NIST or BIPM base unit authority
      assert.deepEqual(getCategoryAuthoritySources('unknown-1'), [])
      assert.deepEqual(getCategoryAuthoritySources('unknown-2'), [])
      assert.deepEqual(getCategoryAuthoritySources('data'), [])
    })
  })

  describe('2. Entity Harmonization & Plural Elimination', () => {
    test('no occurrences of plural "NumanX Studios" in src/ components or pages', () => {
      const srcDir = path.join(rootDir, 'src')
      const violations: string[] = []

      function scanDir(dir: string) {
        const entries = fs.readdirSync(dir, { withFileTypes: true })
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name)
          if (entry.isDirectory()) {
            scanDir(fullPath)
          } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
            const content = fs.readFileSync(fullPath, 'utf-8')
            if (content.includes('NumanX Studios')) {
              violations.push(fullPath)
            }
          }
        }
      }

      scanDir(srcDir)
      assert.deepEqual(violations, [], `Found "NumanX Studios" plural in: ${violations.join(', ')}`)
    })

    test('Sidebar, Home, and Settings use singular "NumanX Studio"', () => {
      const sidebar = fs.readFileSync(path.join(rootDir, 'src/components/layout/Sidebar.tsx'), 'utf-8')
      assert.ok(sidebar.includes('NumanX Studio &copy; 2026'), 'Sidebar must use NumanX Studio')

      const home = fs.readFileSync(path.join(rootDir, 'src/pages/Home.tsx'), 'utf-8')
      assert.ok(home.includes('Omega X Converter · NumanX Studio'), 'Home footer must use Omega X Converter · NumanX Studio')

      const settings = fs.readFileSync(path.join(rootDir, 'src/pages/Settings.tsx'), 'utf-8')
      assert.ok(settings.includes('<p>NumanX Studio</p>'), 'Settings must display NumanX Studio')
      assert.ok(settings.includes('© 2026 NumanX Studio. All rights reserved.'), 'Settings copyright must use NumanX Studio')
    })

    test('About page uses "About Omega X Converter" and references "NumanX Studio"', () => {
      const about = fs.readFileSync(path.join(rootDir, 'src/pages/About.tsx'), 'utf-8')
      assert.ok(about.includes('About Omega X Converter'), 'About page must head with About Omega X Converter')
      assert.ok(about.includes('NumanX Studio'), 'About page must mention NumanX Studio')
      assert.ok(!about.includes('NumanX Studios'), 'About page must not contain NumanX Studios')
    })
  })

  describe('3. Blog Editorial Provenance & Persona Elimination', () => {
    test('all 6 blog posts have non-empty truthful editorial team bylines', () => {
      assert.equal(BLOG_POSTS.length, 6, 'Must have exactly 6 blog posts')
      for (const post of BLOG_POSTS) {
        assert.ok(post.author && post.author.length > 0, `Post ${post.slug} missing author`)
      }
    })

    test('synthetic placeholder personas and unverified lab names are removed', () => {
      for (const post of BLOG_POSTS) {
        assert.notEqual(post.author, 'Dr. Evelyn Vance', `Post ${post.slug} still has Dr. Evelyn Vance`)
        assert.notEqual(post.author, 'Alex Turner', `Post ${post.slug} still has Alex Turner`)
        assert.notEqual(post.author, 'Precision Machining Lab', `Post ${post.slug} still has Precision Machining Lab`)
      }

      const engPost = BLOG_POSTS.find(p => p.slug === 'metric-vs-imperial-engineering-guide')
      assert.ok(engPost)
      assert.equal(engPost?.author, 'NumanX Engineering Editorial Staff')

      const techPost = BLOG_POSTS.find(p => p.slug === 'digital-data-storage-units-guide')
      assert.ok(techPost)
      assert.equal(techPost?.author, 'NumanX Technology Editorial Team')

      const machinistPost = BLOG_POSTS.find(p => p.slug === 'fractional-inches-to-mm-best-practices')
      assert.ok(machinistPost)
      assert.equal(machinistPost?.author, 'NumanX Engineering Editorial Staff')
    })
  })

  describe('4. Institutional Non-Endorsement & Disclaimer Integrity', () => {
    test('About page contains explicit non-affiliation disclaimer', () => {
      const about = fs.readFileSync(path.join(rootDir, 'src/pages/About.tsx'), 'utf-8')
      assert.ok(
        about.includes('do not constitute an endorsement, certification, or official partnership'),
        'About page must contain institutional non-endorsement notice'
      )
    })

    test('No false claims of official certification or endorsement in public pages', () => {
      const prohibitedPhrases = [
        'NIST certified',
        'BIPM certified',
        'endorsed by NIST',
        'endorsed by BIPM',
        'official NIST partner',
        'official BIPM partner',
      ]

      const srcDir = path.join(rootDir, 'src')
      function scanDir(dir: string) {
        const entries = fs.readdirSync(dir, { withFileTypes: true })
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name)
          if (entry.isDirectory()) {
            scanDir(fullPath)
          } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
            const content = fs.readFileSync(fullPath, 'utf-8').toLowerCase()
            for (const phrase of prohibitedPhrases) {
              assert.ok(
                !content.includes(phrase.toLowerCase()),
                `Prohibited phrase "${phrase}" found in ${fullPath}`
              )
            }
          }
        }
      }
      scanDir(srcDir)
    })
  })

  describe('5. Temperature Scientific Truthfulness & Standards Alignment', () => {
    test('Celsius to Fahrenheit pair editorial uses scale conversion relationship', () => {
      const tempCat = getAllCategories().find(c => c.id === 'temp')!
      const uC = tempCat.un.find(u => u.id === 'C')!
      const uF = tempCat.un.find(u => u.id === 'F')!
      const cToF = getPairEditorial(tempCat, uC, uF, 'celsius-to-fahrenheit')
      assert.ok(cToF.directAnswer.summary.includes('scale conversion relationship'), 'cToF summary should mention scale conversion relationship')
      assert.ok(!cToF.directAnswer.summary.includes('ITS-90'), 'cToF summary should not misattribute basic scale to ITS-90')
    })

    test('Celsius to Kelvin pair editorial explains equal interval size', () => {
      const tempCat = getAllCategories().find(c => c.id === 'temp')!
      const uC = tempCat.un.find(u => u.id === 'C')!
      const uK = tempCat.un.find(u => u.id === 'K')!
      const cToK = getPairEditorial(tempCat, uC, uK, 'celsius-to-kelvin')
      assert.ok(cToK.directAnswer.summary.includes('same interval size'), 'cToK summary should explain interval equivalence')
      assert.ok(!cToK.directAnswer.summary.includes('ITS-90'), 'cToK summary should not misattribute K = °C + 273.15 to ITS-90')
    })

    test('Category standards for temp avoid ITS-90 misattribution for Kelvin interval', () => {
      const tempStd = CATEGORY_STANDARDS['temp']
      assert.ok(tempStd)
      assert.ok(tempStd.aeoCapsule.includes('same interval size'))
      assert.ok(!tempStd.aeoCapsule.includes('ITS-90'))
    })
  })

  describe('6. Core Application Schema Verification', () => {
    test('/calculator page schema emits WebApplication with applicationCategory: UtilitiesApplication', () => {
      const schema = buildCorePageSchema(
        '/calculator',
        'Scientific Calculator | Omega X',
        'Scientific calculator description',
        { pageType: 'WebApplication', applicationCategory: 'UtilitiesApplication' }
      )
      assert.ok(schema)
      assert.ok(schema['@graph'])
      const graph = schema['@graph'] as Record<string, unknown>[]
      const webApp = graph.find(item => item['@type'] === 'WebApplication')
      assert.ok(webApp, 'Schema must contain @type: WebApplication')
      assert.equal(webApp?.applicationCategory, 'UtilitiesApplication')
    })
  })
})
