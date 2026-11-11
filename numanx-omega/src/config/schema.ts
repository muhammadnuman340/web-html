/**
 * src/config/schema.ts
 * Consolidated Schema.org Structured Data Architecture for Omega X Converter
 *
 * Implements a centralized, page-aware @graph builder ensuring:
 * 1. Single source of truth for all JSON-LD structured data.
 * 2. Absolute canonical URLs and IDs without duplicate slashes.
 * 3. Strict Visible FAQ Parity: FAQPage nodes are only emitted when matching questions
 *    and answers are visibly present on that exact route.
 * 4. ItemList accuracy: contains all 24 canonical categories with matching count.
 * 5. HowTo and Article parity: steps and metadata accurately mirror page content.
 */

import { canonicalUrl, getSiteUrl, SITE } from './site'
import { fmt } from '../utils/numbers'
import { unitName, unitLabel, pairTitle, pairMetaDescription } from '../engine/unitSymbols'
import type { CategoryDef, UnitDef } from '../types'
import type { BlogPost } from '../data/blogPosts'

export interface SchemaGraph {
  '@context': 'https://schema.org'
  '@graph': Array<Record<string, unknown>>
}

/**
 * Global site-wide identity schema.
 * Emitted by JSONLD component across the application.
 * Contains only authoritative WebSite and Organization nodes.
 */
export function buildGlobalSiteSchema(): SchemaGraph {
  const siteOrigin = getSiteUrl()

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteOrigin}/#website`,
        url: `${siteOrigin}/`,
        name: SITE.fullName,
        description: SITE.defaultDescription,
        publisher: {
          '@id': `${siteOrigin}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteOrigin}/converter?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${siteOrigin}/#organization`,
        name: SITE.organization,
        url: canonicalUrl('/about'),
        logo: {
          '@type': 'ImageObject',
          url: `${siteOrigin}/favicon.svg`,
        },
      },
    ],
  }
}

/**
 * Schema for the Home route (/).
 * Note: No FAQPage node is included because the Home page has no visible FAQ accordion.
 */
export function buildHomeSchema(): SchemaGraph {
  const siteOrigin = getSiteUrl()
  const homeUrl = `${siteOrigin}/`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `${siteOrigin}/#software`,
        name: SITE.fullName,
        url: homeUrl,
        description: SITE.defaultDescription,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'All',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: [
          '28 unit categories including length, mass, volume, temperature',
          '220+ units from metric, imperial, and scientific systems',
          'Natural language input: type "5 km in miles" or "(5m+20cm)×2"',
          'Batch conversion mode for 1000+ values at once',
          'Cross-category conversion chains: Energy→Cost, Speed→Distance, Fuel→Cost',
          'Step-by-step conversion explanations and learning content',
          'PWA support: installable, works fully offline',
          'Custom unit creator for user-defined conversions',
        ],
      },
    ],
  }
}

/**
 * Schema for the Categories Directory page (/categories).
 * Generates an ItemList with exactly 28 canonical category entries.
 */
export function buildCategoriesDirectorySchema(categories: CategoryDef[]): SchemaGraph {
  const pageUrl = canonicalUrl('/categories')

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#collection`,
        name: 'All Unit Conversion Categories',
        url: pageUrl,
        description: 'Directory of all 28 dedicated unit conversion calculators across science, engineering, and commerce.',
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: canonicalUrl('/') },
          { '@type': 'ListItem', position: 2, name: 'Categories', item: pageUrl },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#categories`,
        name: 'Unit Conversion Categories',
        description: `All ${categories.length} conversion categories available in Omega X Converter`,
        numberOfItems: categories.length,
        itemListElement: categories.map((cat, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: `${cat.lb} Converter`,
          item: canonicalUrl(`/convert/${cat.id}`),
        })),
      },
    ],
  }
}

/**
 * Schema for a Category Landing page (/convert/:category).
 * FAQPage node is only emitted when content has visible FAQs.
 */
export function buildCategorySchema(
  category: CategoryDef,
  content: { title?: string; metaDesc?: string; faq?: Array<{ q: string; a: string }> } | null,
): SchemaGraph {
  const pageUrl = canonicalUrl(`/convert/${category.id}`)
  const title = content?.title || `${category.lb} Converter — Instant Precision Calculator`
  const description =
    content?.metaDesc ||
    `Free online ${category.lb.toLowerCase()} unit converter. Convert ${category.un.slice(0, 5).map(u => u.lb).join(', ')} instantly with formulas and printable cheat sheets.`

  const graph: Array<Record<string, unknown>> = [
    {
      '@type': 'WebApplication',
      '@id': `${pageUrl}#software`,
      name: title,
      url: pageUrl,
      description,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: canonicalUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Categories', item: canonicalUrl('/categories') },
        { '@type': 'ListItem', position: 3, name: `${category.lb} Converter`, item: pageUrl },
      ],
    },
  ]

  if (content?.faq && content.faq.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faq`,
      mainEntity: content.faq.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a,
        },
      })),
    })
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}

/**
 * Schema for a Conversion Pair landing page (/convert/:category/:pair).
 * Emits WebApplication, BreadcrumbList, and FAQPage with exact parity to the visible FAQ.
 */
export interface PairSchemaFaq {
  question: string
  answer: string
}

export function buildPairSchema(
  category: CategoryDef,
  u1: UnitDef,
  u2: UnitDef,
  unitRatio: number | null,
  inverseUnitRatio: number | null,
  pairParam: string,
  faqs?: PairSchemaFaq[],
  directAnswerSummary?: string,
): SchemaGraph {
  const pageUrl = canonicalUrl(`/convert/${category.id}/${pairParam}`)
  const pageTitle = pairTitle(u1, u2, category.id)
  const summaryText = directAnswerSummary || `1 ${unitName(u1, category.id)} = ${unitRatio !== null ? fmt(unitRatio, 4) : ''} ${unitName(u2, category.id)}.`
  const metaDescription = pairMetaDescription(u1, u2, category.id, summaryText)

  const defaultFaqs: PairSchemaFaq[] = [
    {
      question: `How many ${unitName(u2, category.id)} in 1 ${unitName(u1, category.id)}?`,
      answer: `1 ${unitLabel(u1, category.id)} is equal to ${unitRatio !== null ? fmt(unitRatio, 6) : ''} ${unitLabel(u2, category.id)}.`,
    },
    {
      question: `How to convert ${unitName(u1, category.id)} to ${unitName(u2, category.id)}?`,
      answer: `To convert from ${unitName(u1, category.id)} to ${unitName(u2, category.id)}, multiply the value by ${unitRatio !== null ? fmt(unitRatio, 6) : 'the conversion factor'}.`,
    },
  ]

  const activeFaqs = faqs && faqs.length > 0 ? faqs : defaultFaqs

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `${pageUrl}#software`,
        name: pageTitle,
        url: pageUrl,
        description: metaDescription,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'All',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: canonicalUrl('/') },
          { '@type': 'ListItem', position: 2, name: 'Categories', item: canonicalUrl('/categories') },
          { '@type': 'ListItem', position: 3, name: category.lb, item: canonicalUrl(`/convert/${category.id}`) },
          { '@type': 'ListItem', position: 4, name: `${unitName(u1, category.id)} to ${unitName(u2, category.id)}`, item: pageUrl },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: activeFaqs.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.answer,
          },
        })),
      },
    ],
  }
}

/**
 * Schema for an Educational Guide page (/guides/:slug).
 * Emits WebApplication, BreadcrumbList, HowTo, and FAQPage nodes.
 */
export function buildGuideSchema(guide: {
  title: string
  metaDesc: string
  h1: string
  slug: string
  relatedCat: string
  steps: string[]
  faq: Array<{ q: string; a: string }>
}): SchemaGraph {
  const pageUrl = canonicalUrl(`/guides/${guide.slug}`)
  const catLabel = guide.relatedCat.charAt(0).toUpperCase() + guide.relatedCat.slice(1)

  const graph: Array<Record<string, unknown>> = [
    {
      '@type': 'WebApplication',
      '@id': `${pageUrl}#software`,
      name: guide.title,
      url: pageUrl,
      description: guide.metaDesc,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: canonicalUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Converter', item: canonicalUrl('/converter') },
        { '@type': 'ListItem', position: 3, name: catLabel, item: canonicalUrl(`/convert/${guide.relatedCat}`) },
        { '@type': 'ListItem', position: 4, name: guide.h1, item: pageUrl },
      ],
    },
    {
      '@type': 'HowTo',
      '@id': `${pageUrl}#howto`,
      name: guide.h1,
      description: guide.metaDesc,
      step: guide.steps.map((s, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: `Step ${i + 1}`,
        text: s,
      })),
    },
  ]

  if (guide.faq && guide.faq.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faq`,
      mainEntity: guide.faq.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a,
        },
      })),
    })
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}

/**
 * Schema for an Individual Blog Post (/blog/:slug).
 * Emits BlogPosting, BreadcrumbList, and optional FAQPage nodes.
 */
export function buildBlogPostSchema(post: BlogPost): SchemaGraph {
  const pageUrl = canonicalUrl(`/blog/${post.slug}`)
  const siteOrigin = getSiteUrl()

  const graph: Array<Record<string, unknown>> = [
    {
      '@type': 'BlogPosting',
      '@id': `${pageUrl}#article`,
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      dateModified: post.date,
      author: {
        '@type': 'Organization',
        name: post.author,
        url: canonicalUrl('/about'),
      },
      publisher: {
        '@type': 'Organization',
        name: SITE.organization,
        url: canonicalUrl('/about'),
        logo: {
          '@type': 'ImageObject',
          url: `${siteOrigin}/favicon.svg`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': pageUrl,
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: canonicalUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: canonicalUrl('/blog') },
        { '@type': 'ListItem', position: 3, name: post.title, item: pageUrl },
      ],
    },
  ]

  if (post.content.faq && post.content.faq.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faq`,
      mainEntity: post.content.faq.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a,
        },
      })),
    })
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}

/**
 * Schema for the Blog Index page (/blog).
 * Emits Blog directory and BreadcrumbList nodes.
 */
export function buildBlogIndexSchema(posts: BlogPost[]): SchemaGraph {
  const pageUrl = canonicalUrl('/blog')

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Blog',
        '@id': `${pageUrl}#blog`,
        name: 'NumanX Omega Blog — Precision Metrology & Unit Conversion Guides',
        description: 'Expert tips, mathematical formulas, cheat sheets, and tutorials for engineering and scientific unit conversions.',
        url: pageUrl,
        blogPost: posts.map(post => ({
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          datePublished: post.date,
          author: { '@type': 'Organization', name: post.author },
          url: canonicalUrl(`/blog/${post.slug}`),
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: canonicalUrl('/') },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: pageUrl },
        ],
      },
    ],
  }
}

/**
 * Schema for Core Public Pages (/about, /converter, /formulas, /health, /sitemap, etc.).
 */
export function buildCorePageSchema(
  routePath: string,
  title: string,
  description: string,
  options?: {
    pageType?: string
    applicationCategory?: string
  },
): SchemaGraph {
  const pageUrl = canonicalUrl(routePath)
  const isApp = !!options?.applicationCategory
  const primaryType = options?.pageType || (isApp ? 'WebApplication' : 'WebPage')
  const cleanTitle = title.split('—')[0].split('|')[0].trim()

  const primaryNode: Record<string, unknown> = {
    '@type': primaryType,
    '@id': `${pageUrl}#${primaryType.toLowerCase()}`,
    name: title,
    url: pageUrl,
    description,
  }

  if (isApp || primaryType === 'WebApplication') {
    primaryNode['applicationCategory'] = options?.applicationCategory || 'UtilitiesApplication'
    primaryNode['operatingSystem'] = 'All'
    primaryNode['offers'] = { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      primaryNode,
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: canonicalUrl('/') },
          { '@type': 'ListItem', position: 2, name: cleanTitle, item: pageUrl },
        ],
      },
    ],
  }
}
