/**
 * tests/ai-discovery.test.ts
 * Phase 3 Step 7 — Automated Verification for AI Discovery Files, Protocols & Entity Integrity
 */

import { describe, it } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { generateSitemapEntries } from '../scripts/generate-sitemap'
import { generateLlmsFullText } from '../scripts/generate-llms-full'
import { DEFAULT_SITE_URL, INDEXABILITY_POLICY } from '../src/config/site'

describe('Phase 3 Step 7 — AI Discovery Files & Agent Readiness', () => {
  const cwd = process.cwd()
  const llmsPath = path.resolve(cwd, 'public/llms.txt')
  const llmsFullPath = path.resolve(cwd, 'public/llms-full.txt')
  const robotsPath = path.resolve(cwd, 'public/robots.txt')

  // Load canonical sitemap set for strict URL validation
  const canonicalEntries = generateSitemapEntries()
  const canonicalUrls = new Set(canonicalEntries.map(e => e.loc))

  describe('1. llms.txt Architecture & Content Integrity', () => {
    it('public/llms.txt exists and is non-empty', () => {
      assert.strictEqual(fs.existsSync(llmsPath), true, 'public/llms.txt must exist')
      const content = fs.readFileSync(llmsPath, 'utf-8')
      assert.ok(content.length > 500, 'public/llms.txt must have substantive length')
    })

    it('contains canonical product and publisher identity', () => {
      const content = fs.readFileSync(llmsPath, 'utf-8')
      assert.ok(content.includes('Omega X Converter'), 'Must mention full product name')
      assert.ok(content.includes('NumanX Studio'), 'Must mention singular publisher name')
      assert.ok(!content.includes('NumanX Studios'), 'Must never mention plural NumanX Studios')
      assert.ok(content.includes(DEFAULT_SITE_URL), 'Must reference authoritative production origin')
    })

    it('describes llms.txt conservatively as an emerging community convention with zero guarantees', () => {
      const content = fs.readFileSync(llmsPath, 'utf-8')
      assert.ok(
        content.includes('emerging community convention and proposal'),
        'Must describe llms.txt conservatively as an emerging community convention'
      )
      assert.ok(
        content.includes('not a formal web standard'),
        'Must explicitly clarify that llms.txt is not a formal web standard'
      )
      assert.ok(
        !content.includes('is a formal web standard') && !content.includes('is an official web standard'),
        'Must not claim llms.txt is a formal or official web standard'
      )
      assert.ok(
        content.includes('carries no guarantee of crawler ingestion, AI discovery, ranking benefit, or model citation'),
        'Must explicitly state absence of indexing or ranking guarantees'
      )
    })

    it('references only valid approved canonical public URLs', () => {
      const content = fs.readFileSync(llmsPath, 'utf-8')
      // Extract all markdown links: [text](URL)
      const origin = DEFAULT_SITE_URL
      const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g
      let match: RegExpExecArray | null
      let linkCount = 0

      while ((match = linkRegex.exec(content)) !== null) {
        linkCount++
        const url = match[2]
        assert.ok(url.startsWith(origin), `URL must start with authoritative origin: ${url}`)
        // Allow reference to sitemap.xml and llms-full.txt
        if (url.endsWith('/sitemap.xml') || url.endsWith('/llms-full.txt')) {
          continue
        }
        assert.ok(
          canonicalUrls.has(url),
          `URL in llms.txt must exist in authoritative canonical sitemap: ${url}`
        )
      }
      assert.ok(linkCount >= 40, `Expected at least 40 canonical links in llms.txt, found ${linkCount}`)
    })

    it('strictly excludes all private and noindex routes', () => {
      const content = fs.readFileSync(llmsPath, 'utf-8')
      for (const noindexPath of INDEXABILITY_POLICY.noindex) {
        assert.ok(
          !content.includes(`${DEFAULT_SITE_URL}${noindexPath}`),
          `llms.txt must not link to private noindex route: ${noindexPath}`
        )
      }
    })
  })

  describe('2. llms-full.txt Knowledge Base & Specification', () => {
    it('public/llms-full.txt exists and provides full reference', () => {
      assert.strictEqual(fs.existsSync(llmsFullPath), true, 'public/llms-full.txt must exist')
      const content = fs.readFileSync(llmsFullPath, 'utf-8')
      assert.ok(content.length > 20000, 'public/llms-full.txt must be a comprehensive reference')
    })

    it('contains complete metrological source references and institutional disclaimer', () => {
      const content = fs.readFileSync(llmsFullPath, 'utf-8')
      assert.ok(content.includes('BIPM'), 'Must reference BIPM')
      assert.ok(content.includes('NIST'), 'Must reference NIST')
      assert.ok(content.includes('ISO/IEC 80000'), 'Must reference ISO/IEC 80000')
      assert.ok(content.includes('CODATA'), 'Must reference CODATA')
      assert.ok(
        content.includes('do not endorse, sponsor, or certify Omega X Converter'),
        'Must include explicit non-endorsement disclaimer'
      )
    })

    it('references all 28 categories and all 123 canonical conversion pairs', () => {
      const content = fs.readFileSync(llmsFullPath, 'utf-8')
      assert.ok(content.includes('Supported Measurement Categories (28 Categories)'), 'Must list 28 categories')
      assert.ok(content.includes('Curated Popular Conversion Pairs (123 Canonical Pairs)'), 'Must list 123 pairs')
      assert.ok(content.includes('Educational Guides (6 Guides)'), 'Must list 6 guides')
      assert.ok(content.includes('Technical Blog Articles (6 Articles)'), 'Must list 6 blog articles')
    })

    it('contains truthful WebMCP and accurate IndexNow public-key semantics', () => {
      const content = fs.readFileSync(llmsFullPath, 'utf-8')
      assert.ok(
        content.includes('No native WebMCP implementation was added because no verified supported runtime or interface is currently present'),
        'Must truthfully state absence of native WebMCP implementation'
      )
      assert.ok(
        content.includes('An IndexNow verification key is a public domain-ownership token required by the protocol to match a publicly accessible key file'),
        'Must correctly identify IndexNow verification key as a public domain token, not a secret credential'
      )
      assert.ok(
        content.includes('Google Search does not participate in IndexNow'),
        'Must accurately state Google Search does not participate in IndexNow'
      )
      assert.ok(
        content.includes('Local builds and test suites must never make live IndexNow network requests'),
        'Must guarantee zero local live IndexNow requests'
      )
    })

    it('contains zero occurrences of plural NumanX Studios', () => {
      const content = fs.readFileSync(llmsFullPath, 'utf-8')
      assert.ok(!content.includes('NumanX Studios'), 'Must never contain plural NumanX Studios')
    })

    it('verifies deterministic generator output with zero drift against public/llms-full.txt', () => {
      const fresh1 = generateLlmsFullText()
      const fresh2 = generateLlmsFullText()
      assert.strictEqual(fresh1, fresh2, 'Consecutive generator executions must be 100% deterministic')
      const onDisk = fs.readFileSync(llmsFullPath, 'utf-8')
      assert.strictEqual(onDisk, fresh1, 'public/llms-full.txt must exactly match generator output with zero drift')
    })
  })

  describe('3. Search Engine Crawl & Indexing Policy', () => {
    it('robots.txt points to authoritative canonical sitemap and preserves crawlability', () => {
      assert.strictEqual(fs.existsSync(robotsPath), true, 'public/robots.txt must exist')
      const content = fs.readFileSync(robotsPath, 'utf-8')
      assert.ok(content.includes('User-agent: *'), 'Must allow universal user-agents')
      assert.ok(content.includes('Allow: /'), 'Must allow crawling of root')
      assert.ok(
        content.includes(`Sitemap: ${DEFAULT_SITE_URL}/sitemap.xml`),
        'Must reference live canonical sitemap'
      )
      assert.ok(
        !content.includes('Allow: GPTBot') && !content.includes('Allow: ClaudeBot'),
        'Must not contain speculative crawler allowlists'
      )
    })

    it('canonical inventory remains exactly 175 URLs', () => {
      assert.strictEqual(canonicalEntries.length, 175, 'Canonical inventory must remain exactly 175 URLs')
    })
  })
})
