/**
 * scripts/generate-sitemap.ts
 * Deterministic XML Sitemap Generator for Omega X Converter
 *
 * Enforces:
 * - Single authoritative origin from src/config/site.ts
 * - Canonical URLs only (zero aliases, zero redirect targets)
 * - Strict indexability policy (zero noindex/stateful routes)
 * - Curated high-volume pairs (Strategy B: avoiding ~1,800+ thin permutations)
 * - Deterministic, alphabetical sorting for zero-diff stability
 */

import fs from 'node:fs'
import path from 'node:path'
import { canonicalUrl, isIndexablePath } from '../src/config/site'
import { getAllCategories } from '../src/engine/converter'
import { categoryContent } from '../src/engine/categoryContent'
import { guideContent } from '../src/engine/guideContent'
import { BLOG_POSTS } from '../src/data/blogPosts'

export interface SitemapEntry {
  loc: string
  priority: string
  changefreq: string
}

export function generateSitemapEntries(): SitemapEntry[] {
  const entries: SitemapEntry[] = []
  const seenUrls = new Set<string>()

  const add = (routePath: string, priority: string, changefreq: string) => {
    if (!isIndexablePath(routePath)) return
    const canonical = canonicalUrl(routePath)
    if (!seenUrls.has(canonical)) {
      seenUrls.add(canonical)
      entries.push({ loc: canonical, priority, changefreq })
    }
  }

  // 1. Core High-Value Indexable Routes
  add('/', '1.0', 'daily')
  add('/converter', '0.9', 'daily')
  add('/categories', '0.9', 'weekly')
  add('/currency', '0.8', 'hourly')
  add('/crypto', '0.8', 'hourly')
  add('/formulas', '0.7', 'weekly')
  add('/calculator', '0.7', 'daily')
  add('/health', '0.6', 'weekly')
  add('/blog', '0.7', 'weekly')
  add('/about', '0.6', 'monthly')
  add('/sitemap', '0.5', 'weekly')

  // 2. 24 Canonical Category Landing Routes
  const categories = getAllCategories()
  for (const cat of categories) {
    add(`/convert/${cat.id}`, '0.85', 'weekly')
  }

  // 3. Curated High-Volume Pairs (Strategy B: avoiding 1,800+ thin permutations)
  for (const cat of categories) {
    const content = categoryContent[cat.id]
    if (content?.popularPairs) {
      for (const pair of content.popularPairs) {
        const cleanSlug = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        const fromSlug = cleanSlug(pair.from)
        const toSlug = cleanSlug(pair.to)
        if (fromSlug && toSlug) {
          const pairParam = `${fromSlug}-to-${toSlug}`
          add(`/convert/${cat.id}/${pairParam}`, '0.75', 'monthly')
        }
      }
    }
  }

  // 4. Educational Guides
  for (const guide of Object.values(guideContent)) {
    if (guide.slug) {
      add(`/guides/${guide.slug}`, '0.8', 'monthly')
    }
  }

  // 5. Blog Posts
  for (const post of BLOG_POSTS) {
    if (post.slug) {
      add(`/blog/${post.slug}`, '0.7', 'monthly')
    }
  }

  // Sort deterministically by loc
  entries.sort((a, b) => a.loc.localeCompare(b.loc))
  return entries
}

export function buildSitemapXml(entries: SitemapEntry[]): string {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(
      e => `  <url><loc>${e.loc}</loc><priority>${e.priority}</priority><changefreq>${e.changefreq}</changefreq></url>`
    ),
    '</urlset>',
    '',
  ]
  return lines.join('\n')
}

export function run() {
  const entries = generateSitemapEntries()
  const xml = buildSitemapXml(entries)

  const cwd = process.cwd()
  const publicPath = path.resolve(cwd, 'public/sitemap.xml')
  fs.writeFileSync(publicPath, xml, 'utf-8')
  console.log(`✅ Updated public/sitemap.xml (${entries.length} URLs)`)

  const distDir = path.resolve(cwd, 'dist')
  if (fs.existsSync(distDir)) {
    const distPath = path.resolve(distDir, 'sitemap.xml')
    fs.writeFileSync(distPath, xml, 'utf-8')
    console.log(`✅ Updated dist/sitemap.xml (${entries.length} URLs)`)
  }
}

// Auto-run if executed directly
run()
