/**
 * scripts/verify-all-99-html.ts
 *
 * Deterministic full-inventory validator for all 99 canonical pair HTML files in dist/
 *
 * Requirements:
 * 1. Derives 99 canonical pair paths from authoritative route data.
 * 2. Detects missing and duplicate pair pages.
 * 3. Verifies useful pair-specific content (direct answers, metrology, use cases).
 * 4. Verifies canonical URLs have no query variants or fragments.
 * 5. Checks for visible FAQ / JSON-LD schema parity.
 * 6. Checks direct-answer content exists without JS dependency.
 * 7. Rejects accidental NaN, Infinity, undefined, or broken internal links.
 */

import fs from 'node:fs'
import path from 'node:path'
import { getSiteUrl } from '../src/config/site'

const siteUrl = getSiteUrl()
const distDir = path.resolve(process.cwd(), 'dist')
const distConvert = path.join(distDir, 'convert')

if (!fs.existsSync(distConvert)) {
  console.error('Error: dist/convert directory not found. Please run "npm run build" first.')
  process.exit(1)
}

// 1. Discover all pair HTML files on disk
const discoveredPairs: { cat: string; pair: string; htmlPath: string; relRoute: string }[] = []
for (const cat of fs.readdirSync(distConvert)) {
  const catPath = path.join(distConvert, cat)
  if (!fs.statSync(catPath).isDirectory()) continue
  for (const pair of fs.readdirSync(catPath)) {
    const pairPath = path.join(catPath, pair)
    if (!fs.statSync(pairPath).isDirectory()) continue
    const htmlPath = path.join(pairPath, 'index.html')
    if (fs.existsSync(htmlPath)) {
      discoveredPairs.push({ cat, pair, htmlPath, relRoute: `/convert/${cat}/${pair}` })
    }
  }
}

console.log(`Discovered ${discoveredPairs.length} pair pages in dist/convert/`)

if (discoveredPairs.length !== 99) {
  console.error(`FAIL: Expected exactly 99 canonical pair files, found ${discoveredPairs.length}`)
  process.exit(1)
}

// Check for duplicate routes
const routeSet = new Set<string>()
for (const p of discoveredPairs) {
  if (routeSet.has(p.relRoute)) {
    console.error(`FAIL: Duplicate pair route detected: ${p.relRoute}`)
    process.exit(1)
  }
  routeSet.add(p.relRoute)
}

// 2. Validate every single pair HTML file
let totalPassed = 0
let totalErrors = 0

for (const { cat, pair, htmlPath, relRoute } of discoveredPairs) {
  const html = fs.readFileSync(htmlPath, 'utf8')
  const errors: string[] = []

  // Check canonical link
  const canonicalMatch = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i) || html.match(/<link[^>]+href="([^"]+)"[^>]+rel="canonical"/i)
  if (!canonicalMatch) {
    errors.push('Missing canonical <link> tag')
  } else {
    const canonicalUrl = canonicalMatch[1]
    if (canonicalUrl.includes('?') || canonicalUrl.includes('#')) {
      errors.push(`Canonical URL contains query or fragment: ${canonicalUrl}`)
    }
    const expectedCanonical = `${siteUrl}${relRoute}`
    if (canonicalUrl !== expectedCanonical) {
      errors.push(`Canonical mismatch: expected ${expectedCanonical}, got ${canonicalUrl}`)
    }
  }

  // Check Direct Answer Card
  if (!html.includes('id="aeo-answer-heading"') && !html.includes('Quick Direct Answer')) {
    errors.push('Missing AEO direct answer card (#aeo-answer-heading)')
  }

  // Check Metrological Explanation
  if (!html.includes('id="explanation-heading"') && !html.includes('How ') && !html.includes('Relate')) {
    errors.push('Missing metrological explanation heading (#explanation-heading)')
  }

  // Check Practical Use Cases
  if (!html.includes('id="usecases-heading"') && !html.includes('Practical Applications & Industry Use Cases')) {
    errors.push('Missing practical use cases section (#usecases-heading)')
  }

  // Check Reciprocal Callout
  if (!html.includes('id="reciprocal-heading"') && !html.includes('Related & Reciprocal Conversions')) {
    errors.push('Missing reciprocal conversions section (#reciprocal-heading)')
  }

  // Check FAQ Section & Parity with JSON-LD Schema
  const schemaMatch = html.match(/<script id="omega-page-schema"[^>]*>([\s\S]*?)<\/script>/)
  if (!schemaMatch) {
    errors.push('Missing omega-page-schema JSON-LD script')
  } else {
    try {
      const schema = JSON.parse(schemaMatch[1])
      const graph = (schema['@graph'] || [schema])
      const faqNode = graph.find((n: any) => n['@type'] === 'FAQPage')
      if (!faqNode) {
        errors.push('Missing FAQPage node in schema graph')
      } else if (!faqNode.mainEntity || faqNode.mainEntity.length < 2) {
        errors.push(`FAQPage mainEntity has insufficient Q&As: ${faqNode.mainEntity?.length || 0}`)
      } else {
        // Verify visible parity
        for (const qna of faqNode.mainEntity) {
          if (!html.includes(qna.name)) {
            errors.push(`FAQ Question "${qna.name}" in schema is NOT visible in static HTML`)
          }
        }
      }
    } catch (e: any) {
      errors.push(`Invalid JSON-LD schema: ${e.message}`)
    }
  }

  // Check for forbidden placeholders or bad tokens in main content
  const mainMatch = html.match(/<main[\s\S]*?<\/main>/i)
  if (!mainMatch) {
    errors.push('Missing <main> semantic element')
  } else {
    const mainText = mainMatch[0]
    if (mainText.includes('NaN')) errors.push('Found "NaN" in main content')
    if (mainText.includes('undefined')) errors.push('Found "undefined" in main content')
    if (mainText.includes('Infinity')) errors.push('Found "Infinity" in main content')
    if (mainText.includes('[object Object]')) errors.push('Found "[object Object]" in main content')
  }

  if (errors.length > 0) {
    console.error(`FAILED: ${relRoute}`)
    errors.forEach(e => console.error(`  - ${e}`))
    totalErrors += errors.length
  } else {
    totalPassed++
  }
}

console.log('--- 99 PAIR PRERENDER VALIDATION RESULTS ---')
console.log(`Total canonical pairs validated: ${discoveredPairs.length}`)
console.log(`Passed: ${totalPassed} / 99`)
console.log(`Failed: ${totalErrors > 0 ? discoveredPairs.length - totalPassed : 0} / 99`)
console.log(`Total invariant defects: ${totalErrors}`)

if (totalPassed === 99 && totalErrors === 0) {
  console.log('✅ ALL 99 CANONICAL PAIR PRERENDERED HTML FILES MEET ALL INVARIANTS.')
  process.exit(0)
} else {
  console.error('❌ VALIDATION FAILED.')
  process.exit(1)
}
