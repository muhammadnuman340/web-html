/**
 * scripts/prerender-seo.ts
 * Build-time Full Prerender Engine for Omega X Converter
 *
 * Generates meaningful, crawlable, route-specific static HTML and metadata
 * for every public indexable route in the XML sitemap:
 * - 1 Home route (dist/index.html)
 * - 8 Core public pages (/about, /blog, /calculator, /categories, /converter, /formulas, /health, /sitemap)
 * - 24 Canonical Category Landing pages (/convert/:category)
 * - 99 Curated Popular Pair pages (/convert/:category/:pair)
 * - 6 Educational Guides (/guides/:slug)
 * - 6 Blog Articles (/blog/:slug)
 *
 * Each page receives:
 * - Route-specific <title>
 * - Route-specific <meta name="description">
 * - Authoritative canonical <link rel="canonical">
 * - Route-aware OpenGraph & Twitter Card metadata with 1200x630 social card
 * - Complete structured data JSON-LD (WebApplication, BreadcrumbList, FAQPage, HowTo, BlogPosting)
 * - Semantic static markup inside <div id="root"> replaced cleanly on React hydration
 */

import fs from 'node:fs'
import path from 'node:path'
import { canonicalUrl, getSiteUrl } from '../src/config/site'
import { PAGE_META, withBrand } from '../src/config/pageMeta'
import { getPrivacyPolicy, getTerms, getContactPage, buildSecurityTxt, DISCLAIMERS, LEGAL, type LegalDoc } from '../src/config/legal'
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
import { BLOG_POSTS, getRelatedPosts } from '../src/data/blogPosts'
import { convert } from '../src/engine/converter'
import { fmt } from '../src/utils/numbers'
import {
  getGuidesForCategory,
  getGuideForPair,
  getGuideRelationship,
} from '../src/config/guideRelations'
import { getPairEditorial, findUnit } from '../src/config/pairEditorial'
import { unitSymbol, unitName, unitLabel, pairTitle, pairMetaDescription } from '../src/engine/unitSymbols'
import { getCategoryAuthoritySources } from '../src/config/authoritySources'
import { getCategoryStandards } from '../src/engine/categoryStandards'
import { getRelatedCategoryIds } from '../src/config/relatedCategories'

const distDir = path.resolve(process.cwd(), 'dist')
const baseHtmlPath = path.join(distDir, 'index.html')

if (!fs.existsSync(baseHtmlPath)) {
  console.error('❌ dist/index.html not found. Run `vite build` first.')
  process.exit(1)
}

const baseHtml = fs.readFileSync(baseHtmlPath, 'utf-8')
const siteOrigin = getSiteUrl()
const ogImageUrl = `${siteOrigin}/og-image.png`

// 0. Neutral SPA shell: emit dist/spa.html before homepage prerender injection
// (empty #root, generic title, no canonical, no homepage JSON-LD)
const spaHtml = baseHtml
  .replace(/<link[^>]*rel=["']canonical["'][^>]*\/?>\s*/gi, '')
  .replace(/<meta[^>]*property=["']og:url["'][^>]*\/?>\s*/gi, '')
fs.writeFileSync(path.join(distDir, 'spa.html'), spaHtml, 'utf-8')
console.log('⚡ Emitted neutral SPA shell (dist/spa.html)')

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeAttr(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const cleanSlug = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

interface PrerenderPageConfig {
  routePath: string
  title: string
  description: string
  schema?: Record<string, unknown>
  staticBodyHtml: string
  is404?: boolean
}

// Site-wide footer for prerendered HTML (mirrors the React app footer)
const STATIC_FOOTER_HTML = `
    <footer style="font-family:system-ui,sans-serif;max-width:64rem;margin:2rem auto 0;padding:1rem 1.5rem;border-top:1px solid #ddd;font-size:0.85rem;color:#666;">
      <div style="margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid #eee;">
        <h3 style="margin:0 0 0.25rem;font-size:0.95rem;font-weight:600;color:#333;">More from NumanX Studio</h3>
        <p style="margin:0 0 0.5rem;font-size:0.85rem;color:#666;line-height:1.4;">NumanX Tools Hub — free online tools for images, text, QR codes, YouTube creators and cricket stats. No sign-up, works in your browser.</p>
        <a href="https://toolshub.numanxstudio.com" style="color:#0066cc;font-weight:500;text-decoration:underline;">Visit NumanX Tools Hub</a>
      </div>
      <nav aria-label="Site">
        <a href="/about">About</a> · <a href="/contact">Contact</a> · <a href="/privacy">Privacy Policy</a> · <a href="/terms">Terms of Use</a> · <a href="/sitemap">Sitemap</a>
      </nav>
      <p style="margin:0.5rem 0 0;">© ${new Date().getFullYear()} ${LEGAL.operator} · Omega X Converter</p>
    </footer>`

function renderLegalBody(doc: LegalDoc): string {
  return `
    <main class="max-w-3xl mx-auto p-6 space-y-6" style="font-family:system-ui,sans-serif;">
      <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:#666;margin-bottom:1rem;">
        <a href="/">Home</a> / <strong>${escapeHtml(doc.h1)}</strong>
      </nav>
      <header>
        <h1 style="font-size:2rem;font-weight:700;">${escapeHtml(doc.h1)}</h1>
        ${doc.path !== '/contact' ? `<p style="font-size:0.85rem;color:#777;">Last updated: ${LEGAL.lastUpdated}</p>` : ''}
        <p style="font-size:1.05rem;color:#444;line-height:1.6;">${escapeHtml(doc.intro)}</p>
      </header>
      ${doc.sections.map(sec => `
        <section>
          <h2 style="font-size:1.25rem;">${escapeHtml(sec.heading)}</h2>
          ${sec.paragraphs.map(p => `<p style="color:#444;line-height:1.6;">${escapeHtml(p)}</p>`).join('')}
          ${sec.bullets ? `<ul style="line-height:1.6;">${sec.bullets.map(b => `<li>${escapeHtml(b)}</li>`).join('')}</ul>` : ''}
        </section>
      `).join('')}
    </main>`
}

function renderAndWritePage(config: PrerenderPageConfig) {
  let html = baseHtml
  const pageCanonical = canonicalUrl(config.routePath)
  const fullTitle = withBrand(config.title)

  // 1. Replace <title>
  html = html.replace(/<title.*?>.*?<\/title>/i, `<title data-rh="true">${escapeHtml(fullTitle)}</title>`)

  // 2. Replace Canonical Link & Robots for 404
  if (config.is404) {
    html = html.replace(/<link[^>]*rel=["']canonical["'][^>]*\/?>/i, '')
    html = html.replace(/<meta[^>]*property=["']og:url["'][^>]*\/?>/i, '')
    html = html.replace(/<meta[^>]*name=["']robots["'][^>]*\/?>/i, '<meta name="robots" content="noindex, follow" />')
    html = html.replace(/<meta[^>]*name=["']googlebot["'][^>]*\/?>/i, '<meta name="googlebot" content="noindex, follow" />')
  } else {
    html = html.replace(/<link[^>]*rel=["']canonical["'][^>]*\/?>/i, `<link rel="canonical" data-rh="true" href="${pageCanonical}" />`)
    html = html.replace(/<meta[^>]*property=["']og:url["'][^>]*\/?>/i, `<meta property="og:url" content="${pageCanonical}" />`)
  }

  // 3. Replace Meta Description
  html = html.replace(/<meta[^>]*name=["']description["'][^>]*\/?>/i, `<meta name="description" data-rh="true" content="${escapeAttr(config.description)}" />`)

  // 4. OpenGraph Tags
  html = html.replace(/<meta[^>]*property=["']og:title["'][^>]*\/?>/i, `<meta property="og:title" content="${escapeAttr(fullTitle)}" />`)
  html = html.replace(/<meta[^>]*property=["']og:description["'][^>]*\/?>/i, `<meta property="og:description" content="${escapeAttr(config.description)}" />`)
  html = html.replace(/<meta[^>]*property=["']og:image["'][^>]*\/?>/i, `<meta property="og:image" content="${ogImageUrl}" />`)

  // 5. Twitter Card Tags
  html = html.replace(/<meta[^>]*name=["']twitter:title["'][^>]*\/?>/i, `<meta name="twitter:title" content="${escapeAttr(fullTitle)}" />`)
  html = html.replace(/<meta[^>]*name=["']twitter:description["'][^>]*\/?>/i, `<meta name="twitter:description" content="${escapeAttr(config.description)}" />`)
  html = html.replace(/<meta[^>]*name=["']twitter:image["'][^>]*\/?>/i, `<meta name="twitter:image" content="${ogImageUrl}" />`)

  // 6. Schema Injection
  if (!config.is404) {
    const globalSiteSchema = buildGlobalSiteSchema()
    let headInjection = `  <script id="omega-global-schema" type="application/ld+json">${JSON.stringify(globalSiteSchema)}</script>\n`
    if (config.schema) {
      headInjection += `  <script id="omega-page-schema" type="application/ld+json">${JSON.stringify(config.schema)}</script>\n`
    }
    headInjection += `  </head>`
    html = html.replace('</head>', headInjection)
  }

  // 7. Inject static HTML inside <div id="root">
  html = html.replace(
    /<div id="root">\s*<\/div>/i,
    `<div id="root">\n${config.staticBodyHtml}\n${STATIC_FOOTER_HTML}\n    </div>`
  )

  // 8. Write to disk
  if (config.is404) {
    fs.writeFileSync(path.join(distDir, '404.html'), html, 'utf-8')
  } else if (config.routePath === '/' || config.routePath === '') {
    fs.writeFileSync(path.join(distDir, 'index.html'), html, 'utf-8')
  } else {
    const cleanPath = config.routePath.replace(/^\/+/, '').replace(/\/+$/, '')
    const targetFile = path.join(distDir, `${cleanPath}.html`)
    fs.mkdirSync(path.dirname(targetFile), { recursive: true })
    fs.writeFileSync(targetFile, html, 'utf-8')
  }
}

let generatedCount = 0

// ==========================================
// 1. HOME ROUTE (/)
// ==========================================
console.log('⚡ Prerendering Home route (/) ...')
const homeSchema = buildHomeSchema()

const homeStaticHtml = `
  <main class="max-w-5xl mx-auto p-6 space-y-8" style="font-family:system-ui,sans-serif;">
    <header style="text-align:center;margin-bottom:2rem;">
      <h1 style="font-size:2rem;font-weight:700;margin-bottom:0.75rem;">Universal Unit Converter & Engineering Calculation Engine</h1>
      <p style="font-size:1.1rem;color:#666;max-width:750px;margin:0 auto;line-height:1.6;">
        NumanX Omega is an open, high-precision, zero-latency unit conversion and calculation engine built for engineers, researchers, students, and everyday power users. Rigorously calibrated against NIST Special Publication 811 and BIPM SI definitions.
      </p>
    </header>

    <section aria-labelledby="categories-heading" style="margin-bottom:2.5rem;">
      <h2 id="categories-heading" style="font-size:1.4rem;font-weight:600;margin-bottom:1rem;border-bottom:2px solid #eee;padding-bottom:0.5rem;">
        24 Metrology & Conversion Categories
      </h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem;">
        ${Categories.map(cat => `
          <div style="border:1px solid #ddd;border-radius:8px;padding:1rem;background:#fafafa;">
            <div style="font-size:1.5rem;margin-bottom:0.5rem;">${cat.ic}</div>
            <h3 style="font-size:1.1rem;margin:0 0 0.25rem 0;">
              <a href="/convert/${cat.id}" style="color:#0066cc;text-decoration:none;font-weight:600;">${cat.lb}</a>
            </h3>
            <p style="font-size:0.85rem;color:#777;margin:0;">${cat.un.length} units supported</p>
          </div>
        `).join('')}
      </div>
    </section>

    <section aria-labelledby="tools-heading" style="margin-bottom:2.5rem;">
      <h2 id="tools-heading" style="font-size:1.4rem;font-weight:600;margin-bottom:1rem;border-bottom:2px solid #eee;padding-bottom:0.5rem;">
        Integrated Calculation Tools
      </h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem;">
        <div style="border:1px solid #ddd;border-radius:8px;padding:1rem;">
          <h3 style="margin-top:0;"><a href="/formulas" style="color:#0066cc;text-decoration:none;">Formula Explorer</a></h3>
          <p style="font-size:0.9rem;color:#555;">Comprehensive scientific and mathematical conversion formulas with exact derivation constants.</p>
        </div>
        <div style="border:1px solid #ddd;border-radius:8px;padding:1rem;">
          <h3 style="margin-top:0;"><a href="/calculator" style="color:#0066cc;text-decoration:none;">Engineering Calculator</a></h3>
          <p style="font-size:0.9rem;color:#555;">Full-featured scientific calculator with trigonometric functions, memory registers, and formula history.</p>
        </div>
        <div style="border:1px solid #ddd;border-radius:8px;padding:1rem;">
          <h3 style="margin-top:0;"><a href="/health" style="color:#0066cc;text-decoration:none;">Health & Biometrics</a></h3>
          <p style="font-size:0.9rem;color:#555;">BMI, Basal Metabolic Rate (BMR), Ideal Body Weight, and daily water hydration calculators.</p>
        </div>
        <div style="border:1px solid #ddd;border-radius:8px;padding:1rem;">
          <h3 style="margin-top:0;"><a href="/blog" style="color:#0066cc;text-decoration:none;">Guides & Blog</a></h3>
          <p style="font-size:0.9rem;color:#555;">In-depth metrological guides, fractional tape measure tips, and imperial vs metric tutorials.</p>
        </div>
      </div>
    </section>

    <section aria-labelledby="standards-heading" style="border-top:1px solid #eee;padding-top:1.5rem;font-size:0.9rem;color:#666;">
      <h2 id="standards-heading" style="font-size:1.1rem;font-weight:600;margin-bottom:0.5rem;">Metrological Authority & Standards Compliance</h2>
      <p>
        Omega X conversion factors comply with the BIPM 2019 SI Redefinition, NIST Special Publication 811, NIST Handbook 44, and the 1959 International Yard and Pound Agreement. Zero server telemetry ensures 100% client-side privacy.
      </p>
    </section>
  </main>
`

renderAndWritePage({
  routePath: '/',
  title: PAGE_META['/'].title,
  description: PAGE_META['/'].description,
  schema: homeSchema,
  staticBodyHtml: homeStaticHtml,
})
generatedCount++

// ==========================================
// 2. CORE PUBLIC PAGES (10 PAGES)
// ==========================================
console.log('⚡ Prerendering Core Public Pages (10 pages) ...')

const corePages: PrerenderPageConfig[] = [
  {
    routePath: '/about',
    title: PAGE_META['/about'].title,
    description: PAGE_META['/about'].description,
    schema: buildCorePageSchema(
      '/about',
      PAGE_META['/about'].title,
      PAGE_META['/about'].description,
      { pageType: 'AboutPage' }
    ),
    staticBodyHtml: `
      <main class="max-w-4xl mx-auto p-6 space-y-6" style="font-family:system-ui,sans-serif;">
        <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:#666;margin-bottom:1rem;">
          <a href="/">Home</a> / <strong>About</strong>
        </nav>
        <header>
          <h1 style="font-size:2rem;font-weight:700;">About Omega X Converter</h1>
          <p style="font-size:1.1rem;color:#555;line-height:1.6;">
            Omega X Converter by NumanX Studio is an open, high-precision, zero-latency unit conversion and calculation engine built for engineers, researchers, students, and everyday power users.
          </p>
        </header>
        <section>
          <h2>Core Architectural Pillars</h2>
          <ul>
            <li><strong>100% Client-Side Privacy:</strong> All calculations execute directly in your browser. No personal data or calculation numbers are transmitted or stored remotely.</li>
            <li><strong>NIST & BIPM Standards:</strong> Conversion factors adhere to published ratios defined in NIST Special Publication 811 and BIPM SI definitions.</li>
            <li><strong>Sub-Nanometer Precision:</strong> 14-digit floating-point mathematical engine prevents rounding cascade errors.</li>
            <li><strong>Offline PWA Support:</strong> Full offline readiness via progressive web application architecture.</li>
          </ul>
        </section>
        <section aria-labelledby="standards-heading">
          <h2 id="standards-heading">Authoritative Standards & Primary References</h2>
          <p>Omega X Converter grounds all conversion factors in verified primary sources:</p>
          <ul>
            <li><a href="https://www.bipm.org/en/publications/si-brochure" target="_blank" rel="noopener noreferrer">BIPM SI Brochure (9th Edition)</a> — Fundamental SI base units and definitions.</li>
            <li><a href="https://www.nist.gov/pml/special-publication-811" target="_blank" rel="noopener noreferrer">NIST Special Publication 811</a> — Guide for the Use of the International System of Units (SI).</li>
            <li><a href="https://www.nist.gov/pml/owm/nist-handbook-44-current-edition" target="_blank" rel="noopener noreferrer">NIST Handbook 44</a> — Specifications and tolerances for commercial weighing and measuring.</li>
            <li><a href="https://physics.nist.gov/cuu/Constants/" target="_blank" rel="noopener noreferrer">CODATA Recommended Values</a> — Fundamental physical constants.</li>
          </ul>
          <p style="font-size:0.85rem;color:#666;"><em>Institutional Non-Affiliation Notice: Reference to standards documents does not constitute endorsement or certification by NIST, BIPM, CODATA, or government agencies.</em></p>
        </section>
        <section>
          <h2>Explore Omega X</h2>
          <p><a href="/converter">Universal Converter</a> · <a href="/categories">All 24 Categories</a> · <a href="/formulas">Formulas Reference</a> · <a href="/sitemap">HTML Sitemap</a></p>
        </section>
      </main>
    `,
  },
  {
    routePath: '/blog',
    title: PAGE_META['/blog'].title,
    description: PAGE_META['/blog'].description,
    schema: buildBlogIndexSchema(BLOG_POSTS),
    staticBodyHtml: `
      <main class="max-w-4xl mx-auto p-6 space-y-6" style="font-family:system-ui,sans-serif;">
        <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:#666;margin-bottom:1rem;">
          <a href="/">Home</a> / <strong>Blog</strong>
        </nav>
        <header>
          <h1 style="font-size:2rem;font-weight:700;">Unit Conversion & Metrology Blog</h1>
          <p style="font-size:1.1rem;color:#555;line-height:1.6;">
            Guides, tutorials, precision formulas, and cheat sheets for length, weight, temperature, data, and scientific measurements.
          </p>
        </header>
        <section>
          <h2>Recent Articles & Tutorials</h2>
          <div style="display:flex;flex-direction:column;gap:1.5rem;">
            ${BLOG_POSTS.map(post => `
              <article style="border:1px solid #ddd;border-radius:8px;padding:1.25rem;">
                <h3 style="margin:0 0 0.5rem 0;font-size:1.25rem;">
                  <a href="/blog/${post.slug}" style="color:#0066cc;text-decoration:none;">${escapeHtml(post.title)}</a>
                </h3>
                <div style="font-size:0.85rem;color:#777;margin-bottom:0.5rem;">
                  Published on ${post.date} · By ${post.author} · ${post.readTime}
                </div>
                <p style="margin:0;color:#444;font-size:0.95rem;line-height:1.5;">${post.excerpt}</p>
              </article>
            `).join('')}
          </div>
        </section>
      </main>
    `,
  },
  {
    routePath: '/calculator',
    title: PAGE_META['/calculator'].title,
    description: PAGE_META['/calculator'].description,
    schema: buildCorePageSchema(
      '/calculator',
      PAGE_META['/calculator'].title,
      PAGE_META['/calculator'].description,
      { applicationCategory: 'UtilitiesApplication' }
    ),
    staticBodyHtml: `
      <main class="max-w-4xl mx-auto p-6 space-y-6" style="font-family:system-ui,sans-serif;">
        <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:#666;margin-bottom:1rem;">
          <a href="/">Home</a> / <strong>Calculator</strong>
        </nav>
        <header>
          <h1 style="font-size:2rem;font-weight:700;">Engineering & Scientific Calculator</h1>
          <p style="font-size:1.1rem;color:#555;line-height:1.6;">
            High-precision mathematical workstation designed for engineers, scientists, and students. Features standard and scientific notation, trigonometric operations, powers, logarithms, memory registers, and formula history.
          </p>
        </header>
        <section>
          <h2>Features & Mathematical Capabilities</h2>
          <ul>
            <li>Standard arithmetic: addition, subtraction, multiplication, division, modulo</li>
            <li>Scientific calculations: sin, cos, tan, arcsin, arccos, arctan (deg & rad modes)</li>
            <li>Powers & roots: x², x³, xʸ, √x, ∛x, ʸ√x</li>
            <li>Logarithmic functions: natural logarithm (ln), base-10 logarithm (log₁₀), exponential (eˣ)</li>
            <li>Memory registers: Store (MS), Recall (MR), Clear (MC), Add (M+)</li>
          </ul>
        </section>
        <section>
          <h2>Related Conversion Workstations</h2>
          <p><a href="/converter">Universal Converter</a> · <a href="/formulas">Formula Explorer</a> · <a href="/categories">All Categories</a></p>
        </section>
      </main>
    `,
  },
  {
    routePath: '/categories',
    title: PAGE_META['/categories'].title,
    description: PAGE_META['/categories'].description,
    schema: buildCategoriesDirectorySchema(Categories),
    staticBodyHtml: `
      <main class="max-w-5xl mx-auto p-6 space-y-6" style="font-family:system-ui,sans-serif;">
        <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:#666;margin-bottom:1rem;">
          <a href="/">Home</a> / <strong>Categories</strong>
        </nav>
        <header>
          <h1 style="font-size:2rem;font-weight:700;">Measurement & Conversion Categories</h1>
          <p style="font-size:1.1rem;color:#555;line-height:1.6;">
            Omega X supports 24 measurement categories across metric, imperial, astronomical, and scientific unit standards. Select any category below to access dedicated conversion tools and metrology charts.
          </p>
        </header>
        <section>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;">
            ${Categories.map(cat => {
              const content = categoryContent[cat.id]
              return `
                <div style="border:1px solid #ddd;border-radius:8px;padding:1.25rem;background:#fafafa;">
                  <div style="font-size:1.8rem;margin-bottom:0.5rem;">${cat.ic}</div>
                  <h2 style="font-size:1.2rem;margin:0 0 0.5rem 0;">
                    <a href="/convert/${cat.id}" style="color:#0066cc;text-decoration:none;">${cat.lb}</a>
                  </h2>
                  <p style="font-size:0.85rem;color:#666;margin-bottom:0.75rem;">${content?.metaDesc || `${cat.lb} precision conversion calculator.`}</p>
                  <span style="font-size:0.8rem;color:#888;">${cat.un.length} units · <a href="/convert/${cat.id}">View Converter →</a></span>
                </div>
              `
            }).join('')}
          </div>
        </section>
      </main>
    `,
  },
  {
    routePath: '/converter',
    title: PAGE_META['/converter'].title,
    description: PAGE_META['/converter'].description,
    schema: buildCorePageSchema(
      '/converter',
      PAGE_META['/converter'].title,
      PAGE_META['/converter'].description,
      { applicationCategory: 'UtilitiesApplication' }
    ),
    staticBodyHtml: `
      <main class="max-w-4xl mx-auto p-6 space-y-6" style="font-family:system-ui,sans-serif;">
        <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:#666;margin-bottom:1rem;">
          <a href="/">Home</a> / <strong>Converter</strong>
        </nav>
        <header>
          <h1 style="font-size:2rem;font-weight:700;">Universal Unit Converter</h1>
          <p style="font-size:1.1rem;color:#555;line-height:1.6;">
            Convert across 24 measurement categories with sub-nanometer precision. Supports natural language queries (e.g., "5 feet 10 inches in cm", "100 km/h in mph") and architectural tape measure fractions.
          </p>
        </header>
        <section>
          <h2>Popular Categories</h2>
          <p>
            <a href="/convert/length">Length</a> ·
            <a href="/convert/mass">Mass & Weight</a> ·
            <a href="/convert/temp">Temperature</a> ·
            <a href="/convert/area">Area</a> ·
            <a href="/convert/volume">Volume</a> ·
            <a href="/convert/speed">Speed</a> ·
            <a href="/convert/time">Time</a> ·
            <a href="/convert/pressure">Pressure</a> ·
            <a href="/convert/energy">Energy</a> ·
            <a href="/convert/data">Digital Data</a>
          </p>
        </section>
        <section>
          <h2>Specialized Financial & Health Tools</h2>
          <p>
            <a href="/health">Health Biometrics</a> ·
            <a href="/calculator">Scientific Calculator</a>
          </p>
        </section>
      </main>
    `,
  },
  {
    routePath: '/formulas',
    title: PAGE_META['/formulas'].title,
    description: PAGE_META['/formulas'].description,
    schema: buildCorePageSchema(
      '/formulas',
      PAGE_META['/formulas'].title,
      PAGE_META['/formulas'].description,
      { pageType: 'ItemPage', applicationCategory: 'UtilitiesApplication' }
    ),
    staticBodyHtml: `
      <main class="max-w-5xl mx-auto p-6 space-y-6" style="font-family:system-ui,sans-serif;">
        <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:#666;margin-bottom:1rem;">
          <a href="/">Home</a> / <strong>Formulas</strong>
        </nav>
        <header>
          <h1 style="font-size:2rem;font-weight:700;">Unit Conversion Formulas & Mathematical Derivations</h1>
          <p style="font-size:1.1rem;color:#555;line-height:1.6;">
            Authoritative reference guide to the mathematical equations, thermal constants, and SI base factors powering Omega X.
          </p>
        </header>
        <section>
          <div style="display:flex;flex-direction:column;gap:1.5rem;">
            ${Categories.map(cat => {
              const content = categoryContent[cat.id]
              return `
                <article style="border:1px solid #ddd;border-radius:8px;padding:1.25rem;">
                  <h2 style="font-size:1.25rem;margin:0 0 0.5rem 0;">${cat.ic} ${cat.lb} Formulas</h2>
                  <p style="font-size:0.95rem;color:#444;margin-bottom:0.75rem;"><strong>Base Equation:</strong> ${content?.formula || `Derived from NIST SP 811 base factors.`}</p>
                  <p style="font-size:0.85rem;color:#666;margin:0;"><a href="/convert/${cat.id}">Open ${cat.lb} Interactive Converter →</a></p>
                </article>
              `
            }).join('')}
          </div>
        </section>
      </main>
    `,
  },
  {
    routePath: '/health',
    title: PAGE_META['/health'].title,
    description: PAGE_META['/health'].description,
    schema: buildCorePageSchema(
      '/health',
      PAGE_META['/health'].title,
      PAGE_META['/health'].description,
      { applicationCategory: 'HealthApplication' }
    ),
    staticBodyHtml: `
      <main class="max-w-4xl mx-auto p-6 space-y-6" style="font-family:system-ui,sans-serif;">
        <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:#666;margin-bottom:1rem;">
          <a href="/">Home</a> / <strong>Health</strong>
        </nav>
        <header>
          <h1 style="font-size:2rem;font-weight:700;">Health & Biometric Calculators</h1>
          <p style="font-size:1.1rem;color:#555;line-height:1.6;">
            Evidence-based biometric calculations for fitness, nutrition, and physiological assessment based on World Health Organization (WHO) and clinical formulas.
          </p>
        </header>
        <section>
          <h2>Supported Biometric Tools</h2>
          <ul>
            <li><strong>Body Mass Index (BMI):</strong> Calculates ratio of weight to height according to standard WHO weight classifications.</li>
            <li><strong>Basal Metabolic Rate (BMR):</strong> Estimates daily resting calorie expenditure using the Mifflin-St Jeor equation.</li>
          </ul>
        </section>
        <section>
          <h2>How BMI is calculated</h2>
          <p>BMI = weight (kg) ÷ height (m)². Adult categories follow the World Health Organization: under 18.5 is underweight, 18.5 to 24.9 is normal, 25 to 29.9 is overweight and 30 or more is obese. For example, 70 kg at 1.75 m gives a BMI of 22.9 (normal).</p>
        </section>
        <section>
          <h2>How BMR is calculated</h2>
          <p>The Mifflin-St Jeor equation estimates calories burned at rest, using weight in kg, height in cm and age in years: men = 10 × weight + 6.25 × height − 5 × age + 5; women = 10 × weight + 6.25 × height − 5 × age − 161. A 30-year-old man at 70 kg and 175 cm has a BMR of about 1,649 kcal per day.</p>
        </section>
        <p style="font-size:0.85rem;color:#666;">${DISCLAIMERS.health} See our <a href="/terms">Terms of Use</a>.</p>
      </main>
    `,
  },
  {
    routePath: '/sitemap',
    title: PAGE_META['/sitemap'].title,
    description: PAGE_META['/sitemap'].description,
    schema: buildCorePageSchema(
      '/sitemap',
      PAGE_META['/sitemap'].title,
      PAGE_META['/sitemap'].description,
      { pageType: 'CollectionPage' }
    ),
    staticBodyHtml: `
      <main class="max-w-5xl mx-auto p-6 space-y-6" style="font-family:system-ui,sans-serif;">
        <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:#666;margin-bottom:1rem;">
          <a href="/">Home</a> / <strong>Sitemap</strong>
        </nav>
        <header>
          <h1 style="font-size:2rem;font-weight:700;">Omega X HTML Sitemap</h1>
          <p style="font-size:1.1rem;color:#555;line-height:1.6;">
            Complete index of every canonical public page on the Omega X Converter platform.
          </p>
        </header>

        <section>
          <h2>Core Public Pages</h2>
          <ul style="columns:2;">
            <li><a href="/">Home (/)</a></li>
            <li><a href="/converter">Universal Converter</a></li>
            <li><a href="/categories">All Categories</a></li>
            <li><a href="/formulas">Formulas Reference</a></li>
            <li><a href="/calculator">Engineering Calculator</a></li>
            <li><a href="/health">Health & Biometrics</a></li>
            <li><a href="/blog">Metrology Blog</a></li>
            <li><a href="/about">About Omega X Converter</a></li>
            <li><a href="/sitemap">Sitemap</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Use</a></li>
          </ul>
        </section>

        <section>
          <h2>24 Measurement Categories</h2>
          <ul style="columns:3;">
            ${Categories.map(cat => `
              <li><a href="/convert/${cat.id}">${cat.lb} Converter</a></li>
            `).join('')}
          </ul>
        </section>

        <section>
          <h2>Conversion Guides</h2>
          <ul>
            ${Object.values(guideContent).map(g => `
              <li><a href="/guides/${g.slug}">${g.title}</a></li>
            `).join('')}
          </ul>
        </section>

        <section>
          <h2>Blog Articles</h2>
          <ul>
            ${BLOG_POSTS.map(p => `
              <li><a href="/blog/${p.slug}">${p.title}</a></li>
            `).join('')}
          </ul>
        </section>
      </main>
    `,
  },
]

for (const p of corePages) {
  renderAndWritePage(p)
  generatedCount++
}

// ==========================================
// 3. 24 CANONICAL CATEGORIES (/convert/:id)
// ==========================================
console.log('⚡ Prerendering 24 Canonical Categories ...')

for (const cat of Categories) {
  const content = categoryContent[cat.id]
  const catGuides = getGuidesForCategory(cat.id)
  const title = content?.title || `${cat.lb} Precision Converter | Omega X`
  const metaDesc = content?.metaDesc || `Precision ${cat.lb} converter with NIST/BIPM metrology standards.`
  const h1 = content?.h1 || `${cat.lb} Precision Converter`
  const intro = content?.intro || `Convert between ${cat.lb} units instantly with exact standards and sub-nanometer accuracy.`
  const formula = content?.formula || `All ${cat.lb} conversion ratios adhere to NIST Special Publication 811.`
  const faqs = content?.faq || [
    { q: `How do I convert units in ${cat.lb}?`, a: `Select your source unit and destination unit, enter a value, and Omega X calculates the exact result instantly.` },
  ]

  const catAuthSources = getCategoryAuthoritySources(cat.id)
  const std = getCategoryStandards(cat.id, cat.lb, cat.un.map(u => u.lb))
  const SI_BASE_UNIT_IDS = new Set(['m', 'kg', 's', 'A', 'K'])
  const baseUnits = cat.un.filter(u => u.r === 1)
  const isComposite = baseUnits.length > 1
  const singleBaseUnit = baseUnits.length === 1 ? baseUnits[0] : null
  const relatedCats = getRelatedCategoryIds(cat.id)
    .map(id => Categories.find(c => c.id === id))
    .filter((c): c is (typeof Categories)[number] => Boolean(c))
  const authorityHtml = catAuthSources.length > 0
    ? `<p style="margin:0.25rem 0 0 0;font-size:0.85rem;color:#777;">Primary References: ${catAuthSources.map(s => `<a href="${s.url}" target="_blank" rel="noopener noreferrer" style="color:#0066cc;">${s.documentRef}</a>`).join(' · ')} · <a href="/about" style="color:#0066cc;">Standards Directory</a></p>`
    : `<p style="margin:0.25rem 0 0 0;font-size:0.85rem;color:#777;">Standards & Data Source Note: Consult our <a href="/about" style="color:#0066cc;">standards and methodology directory</a> for data source provenance.</p>`

  const categorySchema = buildCategorySchema(cat, content)

  const categoryBodyHtml = `
    <main class="max-w-5xl mx-auto p-6 space-y-6" style="font-family:system-ui,sans-serif;">
      <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:#666;margin-bottom:1rem;">
        <a href="/">Home</a> / <a href="/categories">Categories</a> / <strong>${cat.lb}</strong>
      </nav>
      <header>
        <h1 style="font-size:2rem;font-weight:700;">${cat.ic} ${h1}</h1>
        <p style="font-size:1.1rem;color:#555;line-height:1.6;">${intro}</p>
        <p style="color:#333;line-height:1.6;">${escapeHtml(std.aeoCapsule)}</p>
      </header>

      <section aria-labelledby="standards-heading" style="border:1px solid #ddd;border-radius:8px;padding:1.25rem;background:#fafafa;">
        <h2 id="standards-heading" style="font-size:1.2rem;margin-top:0;">Metrological Standards & Base Equation</h2>
        <p style="margin-bottom:0.5rem;font-size:0.95rem;">${formula}</p>
        <p style="margin:0;font-size:0.9rem;color:#555;line-height:1.6;">${escapeHtml(std.standardsStatement)}</p>
        ${authorityHtml}
      </section>

      <section aria-labelledby="units-heading">
        <h2 id="units-heading" style="font-size:1.25rem;margin-bottom:1rem;">Supported ${cat.lb} Units (${cat.un.length} Total)</h2>
        <div style="overflow-x:auto;">
          <table border="1" cellpadding="8" style="border-collapse:collapse;width:100%;text-align:left;border:1px solid #ddd;font-size:0.9rem;">
            <caption style="text-align:left;font-weight:600;margin-bottom:0.5rem;">${cat.lb} Unit Definitions and Scaling Factors</caption>
            <thead style="background:#f0f0f0;">
              <tr>
                <th scope="col">Unit Symbol</th>
                <th scope="col">Unit Name</th>
                <th scope="col">System</th>
                <th scope="col">${singleBaseUnit ? `Equivalent in ${escapeHtml(unitName(singleBaseUnit, cat.id))}` : (isComposite ? 'Metrological Standard' : 'Conversion Basis')}</th>
              </tr>
            </thead>
            <tbody>
              ${cat.un.map(u => {
                const isSiBase = (u.r === 1 || u.id === 'K') && SI_BASE_UNIT_IDS.has(u.id)
                const isRef = u.r === 1 && !isSiBase
                let equivText: string
                if (singleBaseUnit) {
                  if (isSiBase) {
                    equivText = `SI Base Unit (1 ${escapeHtml(unitSymbol(u, cat.id))})`
                  } else if (isRef) {
                    equivText = `Reference Standard (1 ${escapeHtml(unitSymbol(u, cat.id))})`
                  } else if (u.r !== undefined) {
                    equivText = `1 ${escapeHtml(unitSymbol(u, cat.id))} = ${fmt(u.r, 8)} ${escapeHtml(unitSymbol(singleBaseUnit, cat.id))}`
                  } else {
                    equivText = 'Formula-based (non-linear)'
                  }
                } else if (isComposite) {
                  if (isSiBase) {
                    equivText = `SI Base Unit (${escapeHtml(unitName(u, cat.id))})`
                  } else if (isRef) {
                    equivText = `Reference Standard (${escapeHtml(unitName(u, cat.id))})`
                  } else {
                    equivText = `Dimensional Standard (${u.s === 'M' ? 'Metric' : u.s === 'I' ? 'Imperial' : u.s === 'S' ? 'Scientific' : 'Customary'})`
                  }
                } else {
                  if (isSiBase) {
                    equivText = `SI Base Unit (${escapeHtml(unitName(u, cat.id))})`
                  } else {
                    equivText = cat.id === 'temp' ? 'Affine temperature scale' : 'Formula-based (non-linear)'
                  }
                }
                return `
                <tr>
                  <td><code>${escapeHtml(unitSymbol(u, cat.id))}</code></td>
                  <td><strong>${escapeHtml(unitName(u, cat.id))}</strong></td>
                  <td>${u.s === 'M' ? 'Metric' : u.s === 'I' ? 'Imperial' : u.s === 'S' ? 'Scientific' : 'Other'}</td>
                  <td>${equivText}</td>
                </tr>
                `
              }).join('')}
            </tbody>
          </table>
        </div>
      </section>

      ${content?.popularPairs && content.popularPairs.length > 0 ? `
        <section aria-labelledby="pairs-heading">
          <h2 id="pairs-heading" style="font-size:1.25rem;margin-bottom:1rem;">Popular ${cat.lb} Conversions</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:0.75rem;">
            ${content.popularPairs.map(p => {
              const pairSlug = `${cleanSlug(p.from)}-to-${cleanSlug(p.to)}`
              return `
                <div style="border:1px solid #ddd;border-radius:6px;padding:0.75rem;">
                  <h3 style="margin:0 0 0.25rem 0;font-size:1rem;">
                    <a href="/convert/${cat.id}/${pairSlug}" style="color:#0066cc;text-decoration:none;">${p.from} to ${p.to}</a>
                  </h3>
                  <p style="margin:0;font-size:0.8rem;color:#666;">${p.desc}</p>
                </div>
              `
            }).join('')}
          </div>
        </section>
      ` : ''}

      ${catGuides.length > 0 ? `
        <section aria-labelledby="guides-heading" style="border:1px solid #ddd;border-radius:8px;padding:1.25rem;">
          <h2 id="guides-heading" style="font-size:1.25rem;font-weight:600;margin-bottom:0.75rem;">Conversion Guides & Step-by-Step Formulas</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:0.75rem;">
            ${catGuides.map(g => `
              <div style="border:1px solid #eee;border-radius:6px;padding:0.75rem;">
                <div style="font-weight:600;"><a href="/guides/${g.guideSlug}" style="color:#0066cc;text-decoration:none;">${g.title} Conversion Guide</a></div>
                <div style="font-size:0.85rem;color:#666;margin-top:0.25rem;">Step-by-step formula derivation, worked examples, and quick lookup tables.</div>
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}

      ${content?.useCases && content.useCases.length > 0 ? `
        <section aria-labelledby="usecases-heading">
          <h2 id="usecases-heading" style="font-size:1.25rem;margin-bottom:0.5rem;">Common Use Cases</h2>
          <ul>
            ${content.useCases.map(uc => `<li>${uc}</li>`).join('')}
          </ul>
        </section>
      ` : ''}

      ${relatedCats.length > 0 ? `
        <section aria-labelledby="related-heading">
          <h2 id="related-heading" style="font-size:1.25rem;margin-bottom:0.5rem;">Related Conversion Categories</h2>
          <ul>
            ${relatedCats.map(c => `<li><a href="/convert/${c.id}" style="color:#0066cc;">${escapeHtml(c.lb)} converter</a></li>`).join('')}
            <li><a href="/categories" style="color:#0066cc;">All conversion categories</a></li>
          </ul>
        </section>
      ` : ''}

      <section aria-labelledby="faq-heading">
        <h2 id="faq-heading" style="font-size:1.25rem;margin-bottom:1rem;">Frequently Asked Questions</h2>
        <div style="display:flex;flex-direction:column;gap:1rem;">
          ${faqs.map(f => `
            <div style="border-left:3px solid #0066cc;padding-left:1rem;">
              <h3 style="margin:0 0 0.25rem 0;font-size:1.05rem;">${escapeHtml(f.q)}</h3>
              <p style="margin:0;color:#555;font-size:0.95rem;line-height:1.5;">${escapeHtml(f.a)}</p>
            </div>
          `).join('')}
        </div>
      </section>
    </main>
  `

  renderAndWritePage({
    routePath: `/convert/${cat.id}`,
    title,
    description: metaDesc,
    schema: categorySchema,
    staticBodyHtml: categoryBodyHtml,
  })
  generatedCount++
}

// ==========================================
// 4. 99 POPULAR CONVERSION PAIRS (/convert/:cat/:pair)
// ==========================================
console.log('⚡ Prerendering 99 Popular Conversion Pairs ...')

const tableValues = [1, 2, 3, 5, 10, 15, 20, 25, 50, 75, 100, 250, 500, 1000]

for (const cat of Categories) {
  const content = categoryContent[cat.id]
  if (!content?.popularPairs) continue

  for (const pair of content.popularPairs) {
    const fromSlug = cleanSlug(pair.from)
    const toSlug = cleanSlug(pair.to)
    const pairParam = `${fromSlug}-to-${toSlug}`
    const pageRoute = `/convert/${cat.id}/${pairParam}`

    const u1 = findUnit(cat, fromSlug)
    const u2 = findUnit(cat, toSlug)

    if (!u1 || !u2) {
      console.warn(`⚠️ Warning: Could not resolve units for pair ${pair.from} -> ${pair.to} in ${cat.id}`)
      continue
    }

    const unitRatio = convert(1, cat.id, u1.id, u2.id)
    const inverseUnitRatio = convert(1, cat.id, u2.id, u1.id)
    const editorial = getPairEditorial(cat, u1, u2, pairParam)
    const pairGuide = getGuideForPair(cat.id, pairParam)

    const pageTitle = pairTitle(u1, u2, cat.id)
    const metaDescription = pairMetaDescription(u1, u2, cat.id, editorial.directAnswer.summary)

    const pairRelatedCats = getRelatedCategoryIds(cat.id)
      .map(id => Categories.find(c => c.id === id))
      .filter((c): c is (typeof Categories)[number] => Boolean(c))

    const pairSchema = buildPairSchema(cat, u1, u2, unitRatio, inverseUnitRatio, pairParam, editorial.faqs, editorial.directAnswer.summary)

    const pairBodyHtml = `
      <main class="max-w-5xl mx-auto p-6 space-y-6" style="font-family:system-ui,sans-serif;">
        <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:#666;margin-bottom:1rem;">
          <a href="/">Home</a> / <a href="/categories">Categories</a> / <a href="/convert/${cat.id}">${cat.lb}</a> / <strong>${unitName(u1, cat.id)} to ${unitName(u2, cat.id)}</strong>
        </nav>
        <header>
          <h1 style="font-size:2rem;font-weight:700;">${pageTitle}</h1>
          <p style="font-size:1.1rem;color:#555;line-height:1.6;">
            Instant precision conversion from ${unitLabel(u1, cat.id)} to ${unitLabel(u2, cat.id)} in ${cat.lb}.
          </p>
        </header>

        <section aria-labelledby="aeo-answer-heading" style="border:1px solid #99c2ff;border-radius:12px;padding:1.5rem;background:#f0f7ff;margin-bottom:1.5rem;">
          <h2 id="aeo-answer-heading" style="font-size:1.25rem;font-weight:700;margin-top:0;margin-bottom:0.5rem;color:#004085;">
            ⚡ ${editorial.directAnswer.heading}
          </h2>
          <p style="font-size:1.1rem;font-weight:600;color:#111;margin:0 0 0.75rem 0;">
            ${editorial.directAnswer.summary}
          </p>
          <div style="font-family:monospace;font-size:1.05rem;background:#fff;border:1px solid #b8daff;padding:0.75rem 1rem;border-radius:6px;color:#0056b3;font-weight:bold;margin-bottom:0.75rem;">
            Formula: ${editorial.directAnswer.formulaDisplay}
          </div>
          <p style="font-size:0.95rem;color:#333;margin:0;line-height:1.5;">
            ${editorial.directAnswer.calculationRule}
          </p>
        </section>

        <section aria-labelledby="explanation-heading" style="border:1px solid #ddd;border-radius:12px;padding:1.5rem;background:#fff;margin-bottom:1.5rem;">
          <h2 id="explanation-heading" style="font-size:1.2rem;font-weight:700;margin-top:0;margin-bottom:0.75rem;color:#222;">
            📐 ${editorial.explanation.heading}
          </h2>
          ${editorial.explanation.paragraphs.map(p => `<p style="font-size:0.95rem;color:#444;line-height:1.6;margin:0 0 0.75rem 0;">${p}</p>`).join('')}
          <div style="font-size:0.85rem;color:#666;border-top:1px solid #eee;padding-top:0.5rem;font-family:monospace;">
            <strong>Standard Metrology:</strong> ${editorial.explanation.systemContext}
          </div>
        </section>

        <section aria-labelledby="usecases-heading" style="border:1px solid #ddd;border-radius:12px;padding:1.5rem;background:#fafafa;margin-bottom:1.5rem;">
          <h2 id="usecases-heading" style="font-size:1.2rem;font-weight:700;margin-top:0;margin-bottom:0.75rem;color:#222;">
            🎯 Common Practical Applications
          </h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem;">
            ${editorial.useCases.map(uc => `
              <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:1rem;">
                <h3 style="font-size:0.95rem;font-weight:700;margin:0 0 0.35rem 0;color:#1a202c;">${uc.domain}</h3>
                <p style="font-size:0.85rem;color:#4a5568;margin:0;line-height:1.5;">${uc.context}</p>
              </div>
            `).join('')}
          </div>
        </section>

        <section aria-labelledby="reciprocal-heading" style="border:1px solid #e2e8f0;border-radius:12px;padding:1.25rem 1.5rem;background:#fff;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem;">
          <div>
            <span style="display:inline-block;background:#e2e8f0;color:#4a5568;font-size:0.75rem;font-weight:700;padding:0.2rem 0.5rem;border-radius:4px;text-transform:uppercase;margin-bottom:0.25rem;">${editorial.reciprocal.badgeText}</span>
            <h2 id="reciprocal-heading" style="font-size:1.05rem;font-weight:700;margin:0 0 0.25rem 0;color:#2d3748;">Reverse Conversion Option</h2>
            <p style="font-size:0.9rem;color:#4a5568;margin:0;">${editorial.reciprocal.description}</p>
          </div>
          <a href="${editorial.reciprocal.url}" style="display:inline-block;background:#0066cc;color:#fff;text-decoration:none;font-weight:600;font-size:0.85rem;padding:0.6rem 1.2rem;border-radius:8px;">${editorial.reciprocal.anchorText} →</a>
        </section>

        ${pairGuide ? `
          <section aria-labelledby="guide-callout-heading" style="border:1px solid #bbf;border-radius:8px;padding:1rem;background:#f0f7ff;margin:1rem 0;">
            <h2 id="guide-callout-heading" style="font-size:1.1rem;font-weight:700;margin-bottom:0.25rem;">Need detailed formula derivations or worked calculation steps?</h2>
            <p style="font-size:0.9rem;color:#333;margin-bottom:0.5rem;">Read our in-depth <a href="/guides/${pairGuide.guideSlug}"><strong>${pairGuide.title} Conversion Guide</strong></a> with step-by-step mathematical proofs, lookup tables, and worked examples.</p>
          </section>
        ` : ''}

        <section aria-labelledby="chart-heading">
          <h2 id="chart-heading" style="font-size:1.25rem;margin-bottom:0.75rem;">${unitName(u1, cat.id)} to ${unitName(u2, cat.id)} Conversion Table (1 to 1000)</h2>
          <div style="overflow-x:auto;">
            <table border="1" cellpadding="8" style="border-collapse:collapse;width:100%;text-align:left;border:1px solid #ddd;font-size:0.9rem;">
              <caption style="text-align:left;font-weight:600;margin-bottom:0.5rem;">${unitLabel(u1, cat.id)} to ${unitLabel(u2, cat.id)} and Reciprocal Equivalents</caption>
              <thead style="background:#f0f0f0;">
                <tr>
                  <th scope="col">${unitLabel(u1, cat.id)}</th>
                  <th scope="col">${unitLabel(u2, cat.id)}</th>
                  <th scope="col">${unitLabel(u2, cat.id)}</th>
                  <th scope="col">${unitLabel(u1, cat.id)}</th>
                </tr>
              </thead>
              <tbody>
                ${tableValues.map(v => {
                  const resFwd = convert(v, cat.id, u1.id, u2.id)
                  const resBwd = convert(v, cat.id, u2.id, u1.id)
                  return `
                    <tr>
                      <td>${v} ${unitSymbol(u1, cat.id)}</td>
                      <td><strong>${resFwd !== null ? fmt(resFwd, 6) : ''}</strong> ${unitSymbol(u2, cat.id)}</td>
                      <td>${v} ${unitSymbol(u2, cat.id)}</td>
                      <td><strong>${resBwd !== null ? fmt(resBwd, 6) : ''}</strong> ${unitSymbol(u1, cat.id)}</td>
                    </tr>
                  `
                }).join('')}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="related-heading">
          <h2 id="related-heading" style="font-size:1.25rem;margin-bottom:0.75rem;">Related ${cat.lb} Conversion Pairs</h2>
          <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
            ${content.popularPairs.filter(p => `${cleanSlug(p.from)}-to-${cleanSlug(p.to)}` !== pairParam).map(p => {
              const pSlug = `${cleanSlug(p.from)}-to-${cleanSlug(p.to)}`
              return `<a href="/convert/${cat.id}/${pSlug}" style="display:inline-block;border:1px solid #ccc;padding:0.4rem 0.8rem;border-radius:4px;color:#0066cc;text-decoration:none;font-size:0.85rem;">${p.from} → ${p.to}</a>`
            }).join('')}
          </div>
          ${pairRelatedCats.length > 0 ? `<p style="font-size:0.9rem;color:#555;">More converters: ${pairRelatedCats.map(c => `<a href="/convert/${c.id}" style="color:#0066cc;">${escapeHtml(c.lb)}</a>`).join(' · ')}</p>` : ''}
        </section>

        <section aria-labelledby="faq-heading">
          <h2 id="faq-heading" style="font-size:1.25rem;margin-bottom:0.75rem;">Frequently Asked Questions</h2>
          <div style="display:flex;flex-direction:column;gap:1rem;">
            ${editorial.faqs.map(f => `
              <div style="border-left:3px solid #0066cc;padding-left:1rem;background:#fcfcfc;padding:0.75rem 1rem;border-radius:0 8px 8px 0;">
                <h3 style="margin:0 0 0.25rem 0;font-size:1.05rem;">${f.question}</h3>
                <p style="margin:0;color:#555;font-size:0.95rem;">${f.answer}</p>
              </div>
            `).join('')}
          </div>
        </section>
      </main>
    `

    renderAndWritePage({
      routePath: pageRoute,
      title: pageTitle,
      description: metaDescription,
      schema: pairSchema,
      staticBodyHtml: pairBodyHtml,
    })
    generatedCount++
  }
}

// ==========================================
// 5. 6 EDUCATIONAL GUIDES (/guides/:slug)
// ==========================================
console.log('⚡ Prerendering 6 Educational Guides ...')

for (const guide of Object.values(guideContent)) {
  if (!guide.slug) continue
  const pageRoute = `/guides/${guide.slug}`
  const rel = getGuideRelationship(guide.slug)
  const relPosts = rel && rel.relatedPostSlugs.length ? BLOG_POSTS.filter(p => rel.relatedPostSlugs.includes(p.slug)) : []

  const guideCombinedSchema = buildGuideSchema(guide)

  const guideBodyHtml = `
    <article class="max-w-4xl mx-auto p-6 space-y-6" style="font-family:system-ui,sans-serif;">
      <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:#666;margin-bottom:1rem;">
        <a href="/">Home</a> / <a href="/converter">Converter</a> / <a href="/convert/${guide.relatedCat}">${guide.relatedCat}</a> / <strong>${guide.slug}</strong>
      </nav>
      <header>
        <h1 style="font-size:2rem;font-weight:700;">${guide.h1}</h1>
        <p style="font-size:1.1rem;color:#555;line-height:1.6;">${guide.intro}</p>
      </header>

      <section aria-labelledby="formula-heading" style="border:1px solid #ddd;border-radius:8px;padding:1.25rem;background:#fafafa;">
        <h2 id="formula-heading" style="font-size:1.2rem;margin-top:0;">Conversion Formula & Step-by-Step Method</h2>
        <div style="font-family:monospace;font-size:1.1rem;background:#fff;border:1px solid #ccc;padding:0.75rem;border-radius:4px;margin-bottom:1rem;">
          ${guide.formula}
        </div>
        <ol style="padding-left:1.5rem;line-height:1.7;">
          ${guide.steps.map(s => `<li>${s}</li>`).join('')}
        </ol>
      </section>

      <section aria-labelledby="table-heading">
        <h2 id="table-heading" style="font-size:1.25rem;margin-bottom:0.75rem;">Quick Conversion Table</h2>
        <div style="overflow-x:auto;">
          <table border="1" cellpadding="8" style="border-collapse:collapse;width:100%;text-align:left;border:1px solid #ddd;font-size:0.9rem;">
            <caption style="text-align:left;font-weight:600;margin-bottom:0.5rem;">${guide.h1} Conversion Reference Values</caption>
            <thead style="background:#f0f0f0;">
              <tr>
                <th scope="col">Value</th>
                <th scope="col">Exact</th>
                <th scope="col">Approximate</th>
              </tr>
            </thead>
            <tbody>
              ${guide.table.map(row => `
                <tr>
                  <td>${row.val}</td>
                  <td><strong>${row.exact}</strong></td>
                  <td>${row.approx}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="faq-heading">
        <h2 id="faq-heading" style="font-size:1.25rem;margin-bottom:0.75rem;">Frequently Asked Questions</h2>
        <div style="display:flex;flex-direction:column;gap:1rem;">
          ${guide.faq.map(f => `
            <div style="border-left:3px solid #0066cc;padding-left:1rem;">
              <h3 style="margin:0 0 0.25rem 0;font-size:1.05rem;">${f.q}</h3>
              <p style="margin:0;color:#555;font-size:0.95rem;line-height:1.5;">${f.a}</p>
            </div>
          `).join('')}
        </div>
      </section>

      ${rel ? `
        <section aria-labelledby="interactive-pair-heading" style="border:1px solid #ddd;border-radius:8px;padding:1.25rem;">
          <h2 id="interactive-pair-heading" style="font-size:1.25rem;font-weight:600;margin-bottom:0.75rem;">Interactive Pair Converter & Category Directory</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:0.75rem;">
            <div style="border:1px solid #eee;border-radius:6px;padding:0.75rem;">
              <div style="font-weight:600;"><a href="${rel.pairPath}" style="color:#0066cc;text-decoration:none;">Convert ${rel.title} Interactively &rarr;</a></div>
              <div style="font-size:0.85rem;color:#666;margin-top:0.25rem;">Open the full two-way interactive converter with real-time calculations.</div>
            </div>
            <div style="border:1px solid #eee;border-radius:6px;padding:0.75rem;">
              <div style="font-weight:600;"><a href="${rel.categoryPath}" style="color:#0066cc;text-decoration:none;">Explore All ${rel.categoryName} Conversions &rarr;</a></div>
              <div style="font-size:0.85rem;color:#666;margin-top:0.25rem;">Browse the comprehensive directory of all units, reference charts, and live matrices.</div>
            </div>
          </div>
        </section>
      ` : ''}

      ${relPosts.length > 0 ? `
        <section aria-labelledby="related-articles-heading" style="border:1px solid #ddd;border-radius:8px;padding:1.25rem;">
          <h2 id="related-articles-heading" style="font-size:1.25rem;font-weight:600;margin-bottom:0.75rem;">Related Technical Articles</h2>
          <ul style="padding-left:1.25rem;line-height:1.6;">
            ${relPosts.map(p => `<li><a href="/blog/${p.slug}" style="color:#0066cc;text-decoration:none;"><strong>${p.title}</strong></a> &mdash; <span style="font-size:0.85rem;color:#666;">${p.excerpt}</span></li>`).join('')}
          </ul>
        </section>
      ` : ''}

      <section aria-labelledby="standards-grounding-heading" style="border:1px solid #ddd;border-radius:8px;padding:1.25rem;background:#fafafa;">
        <h2 id="standards-grounding-heading" style="font-size:1.1rem;margin-top:0;">Standards Reference & Metrological Grounding</h2>
        <p style="margin:0;font-size:0.85rem;color:#777;">Calculations and conversion factors in this guide adhere to NIST Special Publication 811 and BIPM SI brochure definitions. Review our complete <a href="/about" style="color:#0066cc;">institutional standards and sources directory</a>.</p>
      </section>
    </article>
  `

  renderAndWritePage({
    routePath: pageRoute,
    title: guide.title,
    description: guide.metaDesc,
    schema: guideCombinedSchema,
    staticBodyHtml: guideBodyHtml,
  })
  generatedCount++
}

// ==========================================
// 6. 6 BLOG POSTS (/blog/:slug)
// ==========================================
console.log('⚡ Prerendering 6 Blog Posts ...')

for (const post of BLOG_POSTS) {
  if (!post.slug) continue
  const pageRoute = `/blog/${post.slug}`

  const blogPostSchema = buildBlogPostSchema(post)

  const blogRelatedPairs = categoryContent[post.relatedCat]?.popularPairs ?? []
  const blogRelatedCatLabel = Categories.find(c => c.id === post.relatedCat)?.lb ?? post.relatedCat
  const blogPostBodyHtml = `
    <article class="max-w-4xl mx-auto p-6 space-y-6" style="font-family:system-ui,sans-serif;">
      <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:#666;margin-bottom:1rem;">
        <a href="/">Home</a> / <a href="/blog">Blog</a> / <strong>${escapeHtml(post.title)}</strong>
      </nav>
      <header>
        <h1 style="font-size:2rem;font-weight:700;">${escapeHtml(post.title)}</h1>
        <div style="font-size:0.85rem;color:#777;margin-top:0.5rem;">
          Published on ${post.date} · By ${post.author} · ${post.readTime}
        </div>
        <p style="font-size:1.1rem;color:#555;line-height:1.6;margin-top:0.75rem;">${escapeHtml(post.excerpt)}</p>
      </header>

      <p style="color:#333;line-height:1.7;">${escapeHtml(post.content.intro)}</p>

      ${post.content.keyTakeaways.length > 0 ? `
        <section aria-labelledby="takeaways-heading" style="border:1px solid #ddd;border-radius:8px;padding:1.25rem;background:#fafafa;">
          <h2 id="takeaways-heading" style="font-size:1.2rem;margin-top:0;">Key Takeaways</h2>
          <ul style="line-height:1.6;margin-bottom:0;">
            ${post.content.keyTakeaways.map(t => `<li>${escapeHtml(t)}</li>`).join('')}
          </ul>
        </section>
      ` : ''}

      <div style="display:flex;flex-direction:column;gap:1.5rem;">
        ${post.content.sections.map(sec => `
          <section>
            <h2 style="font-size:1.3rem;margin-bottom:0.5rem;">${escapeHtml(sec.title)}</h2>
            <p style="color:#444;line-height:1.6;margin:0;">${escapeHtml(sec.body)}</p>
            ${sec.formula ? `<pre style="background:#f4f4f8;border-radius:6px;padding:0.75rem;white-space:pre-wrap;"><code>${escapeHtml(sec.formula)}</code></pre>` : ''}
            ${sec.bulletPoints?.length ? `<ul style="line-height:1.6;">${sec.bulletPoints.map(bp => `<li>${escapeHtml(bp)}</li>`).join('')}</ul>` : ''}
            ${sec.table?.length ? `
              <table style="border-collapse:collapse;width:100%;margin-top:0.75rem;">
                <thead><tr>${[sec.table[0].col1, sec.table[0].col2, sec.table[0].col3].filter(Boolean).map(c => `<th scope="col" style="text-align:left;border-bottom:1px solid #ddd;padding:6px;">${escapeHtml(c!)}</th>`).join('')}</tr></thead>
                <tbody>${sec.table.slice(1).map(r => `<tr>${[r.col1, r.col2, r.col3].filter(Boolean).map(c => `<td style="border-bottom:1px solid #eee;padding:6px;">${escapeHtml(c!)}</td>`).join('')}</tr>`).join('')}</tbody>
              </table>` : ''}
          </section>
        `).join('')}
      </div>

      ${post.content.faq && post.content.faq.length > 0 ? `
        <section aria-labelledby="faq-heading">
          <h2 id="faq-heading" style="font-size:1.3rem;margin-bottom:0.75rem;">Frequently Asked Questions</h2>
          <div style="display:flex;flex-direction:column;gap:1rem;">
            ${post.content.faq.map(f => `
              <div style="border-left:3px solid #0066cc;padding-left:1rem;">
                <h3 style="margin:0 0 0.25rem 0;font-size:1.05rem;">${f.q}</h3>
                <p style="margin:0;color:#555;font-size:0.95rem;line-height:1.5;">${f.a}</p>
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}

      ${blogRelatedPairs.length > 0 ? `
        <section aria-labelledby="related-converters-heading">
          <h2 id="related-converters-heading" style="font-size:1.2rem;">Related Converters</h2>
          <ul style="line-height:1.8;">
            <li><a href="/convert/${post.relatedCat}" style="color:#0066cc;">All ${escapeHtml(blogRelatedCatLabel)} conversions</a></li>
            ${blogRelatedPairs.map(p => `<li><a href="/convert/${post.relatedCat}/${cleanSlug(p.from)}-to-${cleanSlug(p.to)}" style="color:#0066cc;">${escapeHtml(p.from)} to ${escapeHtml(p.to)}</a></li>`).join('')}
          </ul>
        </section>
      ` : ''}

      <section aria-labelledby="related-articles-heading">
        <h2 id="related-articles-heading" style="font-size:1.2rem;">Related Guides & Tutorials</h2>
        <ul style="line-height:1.8;">
          ${getRelatedPosts(post).map(rp => `<li><a href="/blog/${rp.slug}" style="color:#0066cc;">${escapeHtml(rp.title)}</a> — ${escapeHtml(rp.excerpt)}</li>`).join('')}
        </ul>
      </section>

      <div style="font-size:0.85rem;color:#777;border-top:1px solid #eee;padding-top:0.75rem;margin-top:1.5rem;">
        Published by ${post.author} on behalf of NumanX Studio. Conversion constants adhere to NIST SP 811 and BIPM SI brochure standards. Consult our <a href="/about" style="color:#0066cc;">metrology standards directory</a>.
      </div>

      <footer style="border-top:1px solid #eee;padding-top:1rem;margin-top:1rem;">
        <p><a href="/blog">← Return to All Articles</a></p>
      </footer>
    </article>
  `

  renderAndWritePage({
    routePath: pageRoute,
    title: post.seoTitle ?? post.title,
    description: post.excerpt,
    schema: blogPostSchema,
    staticBodyHtml: blogPostBodyHtml,
  })
  generatedCount++
}

console.log('⚡ Prerendering legal & contact pages ...')
for (const doc of [getPrivacyPolicy(), getTerms(), getContactPage()]) {
  renderAndWritePage({
    routePath: doc.path,
    title: PAGE_META[doc.path].title,
    description: PAGE_META[doc.path].description,
    schema: buildCorePageSchema(doc.path, PAGE_META[doc.path].title, PAGE_META[doc.path].description, { pageType: 'WebPage' }),
    staticBodyHtml: renderLegalBody(doc),
  })
  generatedCount++
}

const securityTxt = buildSecurityTxt(siteOrigin)
if (securityTxt) {
  fs.mkdirSync(path.join(distDir, '.well-known'), { recursive: true })
  fs.writeFileSync(path.join(distDir, '.well-known', 'security.txt'), securityTxt, 'utf-8')
  console.log('✅ Wrote /.well-known/security.txt')
} else {
  console.log('ℹ️  Skipped security.txt: set LEGAL.contactEmail in src/config/legal.ts to publish it')
}

console.log('⚡ Prerendering 404 page (dist/404.html) ...')
renderAndWritePage({
  routePath: '/404',
  title: 'Page Not Found (404)',
  description: 'The page you requested does not exist or has been moved. Explore 24 unit conversion categories or return home.',
  staticBodyHtml: `
    <main style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:55vh;padding:3rem 1rem;font-family:system-ui,-apple-system,sans-serif;text-align:center;">
      <div style="font-size:4rem;font-weight:900;color:#2563eb;font-family:monospace;letter-spacing:0.05em;" aria-hidden="true">404</div>
      <div style="margin:1rem 0 1.5rem;">
        <h1 style="font-size:1.75rem;font-weight:700;color:#111;margin:0 0 0.5rem;">Page Not Found</h1>
        <p style="font-size:0.95rem;color:#666;line-height:1.5;max-width:28rem;margin:0 auto;">The page you requested does not exist, was moved, or had its URL changed.</p>
      </div>
      <div style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;">
        <a href="/" style="padding:0.6rem 1.25rem;border-radius:0.75rem;background:#2563eb;color:#ffffff;text-decoration:none;font-size:0.875rem;font-weight:600;">← Return Home</a>
        <a href="/categories" style="padding:0.6rem 1.25rem;border-radius:0.75rem;border:1px solid #d1d5db;color:#374151;text-decoration:none;font-size:0.875rem;font-weight:600;background:#ffffff;">Browse All Categories</a>
      </div>
    </main>
  `,
  is404: true,
})

console.log(`\n🎉 Prerender Complete! Generated meaningful static HTML for ${generatedCount} routes.`)
