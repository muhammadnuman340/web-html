/**
 * scripts/verify-prerender.ts
 *
 * Full-coverage automated prerender validator for Omega X Converter.
 *
 * Requirements (fails build if violated for any route in sitemap):
 * 1. File exists in dist/, #root non-empty
 * 2. Exactly one <h1>, non-empty <title> and meta description
 * 3. Canonical = site URL + route, and matches sitemap entry
 * 4. Valid JSON-LD (all <script type="application/ld+json"> parse without error)
 * 5. Category pages (/convert/:id): contains a <table> element
 *
 * Diagnostic Reports (reported without failing build):
 * - Duplicate titles across routes
 * - Duplicate meta descriptions across routes
 * - Any two category pages whose intro text is >80% identical
 */

import fs from 'node:fs'
import path from 'node:path'
import { getSiteUrl } from '../src/config/site'

const siteUrl = getSiteUrl()
const cwd = process.cwd()
const distDir = path.resolve(cwd, 'dist')
const sitemapPath = path.resolve(distDir, 'sitemap.xml')

if (!fs.existsSync(sitemapPath)) {
  console.error('❌ dist/sitemap.xml not found. Please run sitemap generator first.')
  process.exit(1)
}

const sitemapXml = fs.readFileSync(sitemapPath, 'utf8')
const urls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1])

if (urls.length === 0) {
  console.error('❌ dist/sitemap.xml contains 0 URLs.')
  process.exit(1)
}

console.log(`\n🔍 Verifying ${urls.length} prerendered routes against SSG invariants...`)

interface Failure {
  url: string
  routePath: string
  reason: string
}

const failures: Failure[] = []
const titles = new Map<string, string[]>()
const metaDescriptions = new Map<string, string[]>()
const categoryIntros: { url: string; routePath: string; introText: string }[] = []

for (const url of urls) {
  let routePath = '/'
  try {
    const parsed = new URL(url)
    routePath = parsed.pathname
  } catch (e) {
    failures.push({ url, routePath: url, reason: `Invalid sitemap URL syntax: ${url}` })
    continue
  }

  const cleanRoute = routePath.replace(/^\/+/, '').replace(/\/+$/, '')
  const filePath = (routePath === '/' || routePath === '')
    ? path.join(distDir, 'index.html')
    : path.join(distDir, cleanRoute, 'index.html')

  // Invariant 1: File exists on disk
  if (!fs.existsSync(filePath)) {
    failures.push({ url, routePath, reason: `Prerender file missing on disk: ${filePath}` })
    continue
  }

  const html = fs.readFileSync(filePath, 'utf8')

  // Invariant 2: #root exists and is non-empty
  const rootMatch = html.match(/<div id="root">\s*([\s\S]*?)\s*<\/div>/i)
  if (!rootMatch || !rootMatch[1].trim()) {
    failures.push({ url, routePath, reason: '#root is empty or missing static markup' })
  }

  // Invariant 3: Exactly one <h1>
  const h1Matches = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi) || []
  if (h1Matches.length !== 1) {
    failures.push({ url, routePath, reason: `Expected exactly 1 <h1>, found ${h1Matches.length}` })
  } else {
    const h1Text = h1Matches[0].replace(/<[^>]+>/g, '').trim()
    if (!h1Text) {
      failures.push({ url, routePath, reason: '<h1> element has empty text content' })
    }
  }

  // Invariant 4: Non-empty <title>
  const titleMatch = html.match(/<title\b[^>]*>([^<]+)<\/title>/i)
  const title = titleMatch ? titleMatch[1].trim() : ''
  if (!title) {
    failures.push({ url, routePath, reason: 'Missing or empty <title>' })
  } else {
    if (!titles.has(title)) titles.set(title, [])
    titles.get(title)!.push(routePath)
  }

  // Invariant 5: Non-empty <meta name="description">
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i)
  const desc = descMatch ? descMatch[1].trim() : ''
  if (!desc) {
    failures.push({ url, routePath, reason: 'Missing or empty meta description' })
  } else {
    if (!metaDescriptions.has(desc)) metaDescriptions.set(desc, [])
    metaDescriptions.get(desc)!.push(routePath)
  }

  // Invariant 6: Canonical link matches site URL + route and matches sitemap entry exactly
  const canonMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
    || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical"/i)
  const canon = canonMatch ? canonMatch[1].trim() : ''
  if (!canon) {
    failures.push({ url, routePath, reason: 'Missing canonical <link> tag' })
  } else if (canon !== url) {
    failures.push({ url, routePath, reason: `Canonical mismatch: sitemap="${url}", html="${canon}"` })
  } else if (canon.includes('?') || canon.includes('#')) {
    failures.push({ url, routePath, reason: `Canonical URL contains query or fragment: ${canon}` })
  }

  // Invariant 7: Valid JSON-LD
  const jsonLdMatches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  if (jsonLdMatches.length === 0) {
    failures.push({ url, routePath, reason: 'Missing JSON-LD structured data script' })
  } else {
    for (const match of jsonLdMatches) {
      try {
        JSON.parse(match[1])
      } catch (e: any) {
        failures.push({ url, routePath, reason: `Invalid JSON-LD syntax: ${e.message}` })
      }
    }
  }

  // Invariant 8: Category pages (/convert/:id): contains a <table>
  const isCategoryLanding = /^\/convert\/[a-z0-9_-]+$/.test(routePath)
  if (isCategoryLanding) {
    const hasTable = /<table\b[^>]*>[\s\S]*?<\/table>/i.test(html)
    if (!hasTable) {
      failures.push({ url, routePath, reason: 'Category landing page missing <table> element' })
    }

    // Extract category intro text for similarity comparison
    const headerMatch = html.match(/<header\b[^>]*>([\s\S]*?)<\/header>/i)
    let introText = ''
    if (headerMatch) {
      const pMatches = [...headerMatch[1].matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
      introText = pMatches.map(m => m[1].replace(/<[^>]+>/g, '').trim()).join(' ')
    }
    categoryIntros.push({ url, routePath, introText })
  }
}

// -------------------------------------------------------------
// Report Diagnostic Checks (Do not fail the build)
// -------------------------------------------------------------
console.log('\n📊 --- PRERENDER AUDIT DIAGNOSTICS ---')

// A. Duplicate Titles
const dupTitles = [...titles.entries()].filter(([_, r]) => r.length > 1)
console.log(`• Duplicate Titles: ${dupTitles.length}`)
if (dupTitles.length > 0) {
  dupTitles.forEach(([t, r]) => {
    console.log(`  - Title "${t}" shared by ${r.length} routes: ${r.join(', ')}`)
  })
}

// B. Duplicate Meta Descriptions
const dupDescs = [...metaDescriptions.entries()].filter(([_, r]) => r.length > 1)
console.log(`• Duplicate Meta Descriptions: ${dupDescs.length}`)
if (dupDescs.length > 0) {
  dupDescs.forEach(([d, r]) => {
    console.log(`  - Description "${d}" shared by ${r.length} routes: ${r.join(', ')}`)
  })
}

// C. Category Page Intro Text Similarity (>80% identical)
function computeSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean))
  const words2 = new Set(text2.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean))
  if (words1.size === 0 || words2.size === 0) return 0
  const intersection = new Set([...words1].filter(x => words2.has(x)))
  const union = new Set([...words1, ...words2])
  return intersection.size / union.size
}

const similarCategoryPairs: { cat1: string; cat2: string; similarity: string }[] = []
for (let i = 0; i < categoryIntros.length; i++) {
  for (let j = i + 1; j < categoryIntros.length; j++) {
    const sim = computeSimilarity(categoryIntros[i].introText, categoryIntros[j].introText)
    if (sim > 0.8) {
      similarCategoryPairs.push({
        cat1: categoryIntros[i].routePath,
        cat2: categoryIntros[j].routePath,
        similarity: (sim * 100).toFixed(1) + '%'
      })
    }
  }
}
console.log(`• Category Intro Pairs with >80% Similarity: ${similarCategoryPairs.length}`)
if (similarCategoryPairs.length > 0) {
  similarCategoryPairs.forEach(p => {
    console.log(`  - ${p.cat1} & ${p.cat2}: ${p.similarity}`)
  })
}

// -------------------------------------------------------------
// Invariant Results & Exit Status
// -------------------------------------------------------------
console.log('\n🛡️  --- SSG HARD INVARIANT RESULTS ---')
console.log(`Total canonical routes verified: ${urls.length}`)
console.log(`Passed: ${urls.length - failures.length} / ${urls.length}`)
console.log(`Failed: ${failures.length} / ${urls.length}`)

if (failures.length > 0) {
  console.error('\n❌ FAIL: The following prerender invariants were violated:')
  failures.forEach(f => {
    console.error(`  - [${f.routePath}] ${f.reason}`)
  })
  process.exit(1)
} else {
  console.log(`✅ ALL ${urls.length} ROUTES MEET ALL PRERENDER INVARIANTS (100% PASS).\n`)
  process.exit(0)
}
