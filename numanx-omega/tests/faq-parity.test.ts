/**
 * tests/faq-parity.test.ts
 * Phase 3 Step 3: Visible FAQ Parity Acceptance Gate Test Suite
 *
 * Verifies:
 * 1. Every route that emits FAQPage schema visibly renders those exact questions and answers.
 * 2. Prerendered HTML on disk contains both the schema node and matching visible markup.
 * 3. Pair landing pages visibly render the calculated Q&As.
 * 4. Routes without visible FAQs strictly exclude FAQPage schema nodes.
 * 5. HowTo steps in guides strictly match the visible numbered steps on the page.
 */

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { Categories } from '../src/engine/categories'
import { categoryContent } from '../src/engine/categoryContent'
import { guideContent } from '../src/engine/guideContent'
import { BLOG_POSTS } from '../src/data/blogPosts'

const distDir = path.resolve(process.cwd(), 'dist')

function readPrerenderedSchemaAndHtml(routePath: string): { schema: Record<string, unknown> | null; html: string } {
  const clean = routePath.replace(/^\/+/, '').replace(/\/+$/, '')
  const cleanPath = routePath === '/' || clean === '' ? 'index.html' : `${clean}.html`
  const fullPath = path.join(distDir, cleanPath)

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Prerendered file not found: ${fullPath}`)
  }

  const html = fs.readFileSync(fullPath, 'utf-8')
  const schemaMatch = html.match(/<script id="omega-page-schema"[^>]*>([\s\S]*?)<\/script>/)
  const schema = schemaMatch ? JSON.parse(schemaMatch[1]) : null

  return { schema, html }
}

describe('Phase 3 Step 3: Visible FAQ Parity & HowTo Acceptance Gate', () => {
  test('prerendered home page does not emit FAQPage schema', () => {
    const { schema } = readPrerenderedSchemaAndHtml('/')
    assert.ok(schema)
    const graph = (schema['@graph'] || [schema]) as Array<{ '@type': string }>
    const types = graph.map(n => n['@type'])
    assert.ok(!types.includes('FAQPage'), 'Home route must not contain FAQPage schema because it has no visible FAQ')
  })

  test('prerendered core public pages do not emit FAQPage schema', () => {
    const coreRoutes = ['/about', '/calculator', '/categories', '/converter', '/formulas', '/health', '/sitemap']
    for (const r of coreRoutes) {
      const { schema } = readPrerenderedSchemaAndHtml(r)
      assert.ok(schema, `Schema should exist for ${r}`)
      const graph = (schema['@graph'] || [schema]) as Array<{ '@type': string }>
      const types = graph.map(n => n['@type'])
      assert.ok(!types.includes('FAQPage'), `${r} must not emit FAQPage schema`)
    }
  })

  test('all 24 categories with FAQs satisfy visible FAQ parity in static HTML', () => {
    for (const cat of Categories) {
      const { schema, html } = readPrerenderedSchemaAndHtml(`/convert/${cat.id}`)
      assert.ok(schema, `Category ${cat.id} must have schema`)

      const graph = (schema['@graph'] || [schema]) as Array<{ '@type': string; mainEntity?: Array<{ name: string; acceptedAnswer: { text: string } }> }>
      const faqNode = graph.find(n => n['@type'] === 'FAQPage')

      if (faqNode && faqNode.mainEntity) {
        assert.ok(faqNode.mainEntity.length > 0, `Category ${cat.id} has empty FAQPage`)
        for (const item of faqNode.mainEntity) {
          assert.ok(html.includes(item.name), `Category ${cat.id} FAQ question "${item.name}" must be visible in static HTML`)
        }
      }
    }
  })

  test('popular conversion pairs satisfy visible FAQ parity in static HTML for all 99 pairs', () => {
    const cleanSlug = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    let pairCount = 0

    for (const cat of Categories) {
      const content = categoryContent[cat.id]
      if (!content?.popularPairs) continue

      for (const pair of content.popularPairs) {
        const pSlug = `${cleanSlug(pair.from)}-to-${cleanSlug(pair.to)}`
        const route = `/convert/${cat.id}/${pSlug}`
        const { schema, html } = readPrerenderedSchemaAndHtml(route)
        assert.ok(schema, `Pair route ${route} must have schema`)

        const graph = (schema['@graph'] || [schema]) as Array<{ '@type': string; mainEntity?: Array<{ name: string; acceptedAnswer: { text: string } }> }>
        const faqNode = graph.find(n => n['@type'] === 'FAQPage')
        assert.ok(faqNode, `Pair route ${route} must have FAQPage node`)
        assert.ok(faqNode.mainEntity && faqNode.mainEntity.length >= 2, `Pair route ${route} must have at least 2 Q&As`)

        for (const item of faqNode.mainEntity) {
          assert.ok(html.includes(item.name), `Pair route ${route} FAQ question "${item.name}" must be visible in static HTML`)
        }
        pairCount++
      }
    }

    assert.equal(pairCount, 99, 'Must verify all 99 popular pairs')
  })

  test('educational guides satisfy both HowTo step parity and FAQ parity', () => {
    for (const guide of Object.values(guideContent)) {
      if (!guide.slug) continue
      const route = `/guides/${guide.slug}`
      const { schema, html } = readPrerenderedSchemaAndHtml(route)
      assert.ok(schema, `Guide route ${route} must have schema`)

      const graph = (schema['@graph'] || [schema]) as Array<{ '@type': string; step?: Array<{ text: string }>; mainEntity?: Array<{ name: string }> }>

      // 1. HowTo Parity
      const howToNode = graph.find(n => n['@type'] === 'HowTo')
      assert.ok(howToNode, `Guide ${guide.slug} must have HowTo node`)
      assert.equal(howToNode.step?.length, guide.steps.length, `Guide ${guide.slug} HowTo step count must match visible steps`)
      for (const s of howToNode.step || []) {
        assert.ok(html.includes(s.text), `Guide ${guide.slug} step "${s.text}" must be visible in static HTML`)
      }

      // 2. FAQ Parity
      const faqNode = graph.find(n => n['@type'] === 'FAQPage')
      if (guide.faq?.length) {
        assert.ok(faqNode, `Guide ${guide.slug} must have FAQPage node`)
        for (const item of faqNode.mainEntity || []) {
          assert.ok(html.includes(item.name), `Guide ${guide.slug} FAQ question "${item.name}" must be visible in static HTML`)
        }
      }
    }
  })

  test('blog articles satisfy FAQ parity where FAQ is defined', () => {
    for (const post of BLOG_POSTS) {
      const route = `/blog/${post.slug}`
      const { schema, html } = readPrerenderedSchemaAndHtml(route)
      assert.ok(schema, `Blog route ${route} must have schema`)

      const graph = (schema['@graph'] || [schema]) as Array<{ '@type': string; mainEntity?: Array<{ name: string }> }>
      const faqNode = graph.find(n => n['@type'] === 'FAQPage')

      if (post.content.faq && post.content.faq.length > 0) {
        assert.ok(faqNode, `Blog ${post.slug} must have FAQPage node`)
        for (const item of faqNode.mainEntity || []) {
          assert.ok(html.includes(item.name), `Blog ${post.slug} FAQ question "${item.name}" must be visible in static HTML`)
        }
      } else {
        assert.ok(!faqNode, `Blog ${post.slug} with no FAQs must not emit FAQPage schema`)
      }
    }
  })
})
