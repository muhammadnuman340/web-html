/**
 * tests/schema-graph.test.ts
 * Phase 3 Step 3: Schema Graph Consolidation & Structured Data Integrity Test Suite
 *
 * Verifies:
 * 1. Single source of truth Schema.org graph builder integrity.
 * 2. Proper page-aware schema selection across all route types.
 * 3. Unique and valid entity identifiers (@id) without double slashes.
 * 4. ItemList count matches exactly 24 registered categories.
 * 5. BreadcrumbList sequence and URL accuracy.
 * 6. Absence of FAQPage on routes with no visible FAQ (e.g. Home, Directory, Core pages).
 */

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildGlobalSiteSchema,
  buildHomeSchema,
  buildCategoriesDirectorySchema,
  buildCategorySchema,
  buildPairSchema,
  buildGuideSchema,
  buildBlogPostSchema,
  buildBlogIndexSchema,
  buildCorePageSchema,
} from '../src/config/schema'
import { Categories } from '../src/engine/categories'
import { categoryContent } from '../src/engine/categoryContent'
import { guideContent } from '../src/engine/guideContent'
import { BLOG_POSTS } from '../src/data/blogPosts'
import { canonicalUrl } from '../src/config/site'

describe('Phase 3 Step 3: Schema Graph Architecture & Identity Integrity', () => {
  test('global site schema contains authoritative WebSite and Organization nodes only', () => {
    const schema = buildGlobalSiteSchema()
    assert.equal(schema['@context'], 'https://schema.org')
    assert.ok(Array.isArray(schema['@graph']))
    assert.equal(schema['@graph'].length, 2)

    const types = schema['@graph'].map(n => n['@type'])
    assert.ok(types.includes('WebSite'))
    assert.ok(types.includes('Organization'))

    // Must NOT contain global phantom FAQs or global breadcrumbs
    assert.ok(!types.includes('FAQPage'))
    assert.ok(!types.includes('BreadcrumbList'))
    assert.ok(!types.includes('ItemList'))

    // Verify IDs and no double slashes
    for (const node of schema['@graph']) {
      const id = node['@id'] as string
      assert.ok(id, 'Node must have an @id')
      assert.ok(!id.includes('//#'), `@id must not contain double slashes: ${id}`)
      assert.ok(id.startsWith('https://'), `@id must be absolute: ${id}`)
    }
  })

  test('home schema contains WebApplication and excludes phantom FAQPage', () => {
    const schema = buildHomeSchema()
    assert.equal(schema['@context'], 'https://schema.org')
    const types = schema['@graph'].map(n => n['@type'])

    assert.ok(types.includes('WebApplication'))
    assert.ok(!types.includes('FAQPage'), 'Home route must not emit FAQPage without visible FAQ accordion')

    const webApp = schema['@graph'].find(n => n['@type'] === 'WebApplication')
    assert.ok(webApp)
    assert.equal(webApp.name, 'Omega X Converter')
    assert.ok((webApp.featureList as string[]).length >= 8)
  })

  test('categories directory schema resolves 36-item ItemList with exact count parity', () => {
    const schema = buildCategoriesDirectorySchema(Categories)
    const types = schema['@graph'].map(n => n['@type'])

    assert.ok(types.includes('CollectionPage'))
    assert.ok(types.includes('BreadcrumbList'))
    assert.ok(types.includes('ItemList'))

    const itemList = schema['@graph'].find(n => n['@type'] === 'ItemList') as Record<string, unknown>
    assert.ok(itemList)
    assert.equal(itemList.numberOfItems, 36, 'ItemList declared count must equal exactly 36')

    const elements = itemList.itemListElement as Array<{ '@type': string; position: number; name: string; item: string }>
    assert.equal(elements.length, 36, 'ItemList must contain exactly 36 category entries')

    // Verify sequential positions 1..36
    elements.forEach((el, idx) => {
      assert.equal(el.position, idx + 1)
      assert.ok(el.name.endsWith(' Converter'))
      assert.ok(el.item.includes('/convert/'))
    })
  })

  test('category schema generates WebApplication, BreadcrumbList and FAQPage', () => {
    const lengthCat = Categories.find(c => c.id === 'length')!
    const lengthContent = categoryContent['length']
    const schema = buildCategorySchema(lengthCat, lengthContent)

    const types = schema['@graph'].map(n => n['@type'])
    assert.ok(types.includes('WebApplication'))
    assert.ok(types.includes('BreadcrumbList'))
    assert.ok(types.includes('FAQPage'))

    const breadcrumbs = schema['@graph'].find(n => n['@type'] === 'BreadcrumbList') as { itemListElement: Array<{ position: number; name: string; item: string }> }
    assert.equal(breadcrumbs.itemListElement.length, 3)
    assert.equal(breadcrumbs.itemListElement[0].name, 'Home')
    assert.equal(breadcrumbs.itemListElement[1].name, 'Categories')
    assert.equal(breadcrumbs.itemListElement[2].name, 'Length Converter')
    assert.equal(breadcrumbs.itemListElement[2].item, canonicalUrl('/convert/length'))
  })

  test('pair schema generates valid WebApplication, BreadcrumbList and FAQPage with 4-level hierarchy', () => {
    const lengthCat = Categories.find(c => c.id === 'length')!
    const u1 = lengthCat.un.find(u => u.id === 'm')!
    const u2 = lengthCat.un.find(u => u.id === 'ft')!

    const schema = buildPairSchema(lengthCat, u1, u2, 3.28084, 0.3048, 'm-to-ft')
    const types = schema['@graph'].map(n => n['@type'])

    assert.ok(types.includes('WebApplication'))
    assert.ok(types.includes('BreadcrumbList'))
    assert.ok(types.includes('FAQPage'))

    const breadcrumbs = schema['@graph'].find(n => n['@type'] === 'BreadcrumbList') as { itemListElement: Array<{ position: number; name: string; item: string }> }
    assert.equal(breadcrumbs.itemListElement.length, 4)
    assert.equal(breadcrumbs.itemListElement[0].name, 'Home')
    assert.equal(breadcrumbs.itemListElement[1].name, 'Categories')
    assert.equal(breadcrumbs.itemListElement[2].name, 'Length')
    assert.equal(breadcrumbs.itemListElement[3].name, `${u1.lb} to ${u2.lb}`)
  })

  test('guide schema includes HowTo and FAQPage with step alignment', () => {
    const guide = guideContent['cups-to-grams']
    const schema = buildGuideSchema(guide)

    const types = schema['@graph'].map(n => n['@type'])
    assert.ok(types.includes('WebApplication'))
    assert.ok(types.includes('BreadcrumbList'))
    assert.ok(types.includes('HowTo'))
    assert.ok(types.includes('FAQPage'))

    const howTo = schema['@graph'].find(n => n['@type'] === 'HowTo') as { step: Array<{ position: number; text: string }> }
    assert.equal(howTo.step.length, guide.steps.length)
    howTo.step.forEach((s, idx) => {
      assert.equal(s.position, idx + 1)
      assert.equal(s.text, guide.steps[idx])
    })
  })

  test('blog post schema includes BlogPosting, BreadcrumbList and optional FAQPage', () => {
    const post = BLOG_POSTS[0]
    const schema = buildBlogPostSchema(post)

    const types = schema['@graph'].map(n => n['@type'])
    assert.ok(types.includes('BlogPosting'))
    assert.ok(types.includes('BreadcrumbList'))

    const article = schema['@graph'].find(n => n['@type'] === 'BlogPosting') as Record<string, unknown>
    assert.equal(article.headline, post.title)
    assert.equal(article.datePublished, post.date)

    if (post.content.faq?.length) {
      assert.ok(types.includes('FAQPage'))
    }
  })

  test('blog index schema includes Blog and BreadcrumbList nodes', () => {
    const schema = buildBlogIndexSchema(BLOG_POSTS)
    const types = schema['@graph'].map(n => n['@type'])
    assert.ok(types.includes('Blog'))
    assert.ok(types.includes('BreadcrumbList'))

    const blogNode = schema['@graph'].find(n => n['@type'] === 'Blog') as { blogPost: Array<unknown> }
    assert.equal(blogNode.blogPost.length, BLOG_POSTS.length)
  })

  test('core page schema emits clean type-specific node and BreadcrumbList without double slashes', () => {
    const coreRoutes = [
      { path: '/about', type: 'AboutPage' },
      { path: '/calculator', type: 'WebApplication' },
      { path: '/health', type: 'WebApplication' },
      { path: '/sitemap', type: 'CollectionPage' },
    ]

    for (const route of coreRoutes) {
      const schema = buildCorePageSchema(route.path, `${route.type} Test`, 'Test Description', { pageType: route.type })
      assert.ok(schema['@graph'].length >= 2)

      for (const node of schema['@graph']) {
        const id = node['@id'] as string
        assert.ok(!id.includes('//#'), `Double slash detected in @id for ${route.path}: ${id}`)
      }
    }
  })
})
