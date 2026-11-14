/**
 * Titles and meta descriptions for static routes.
 *
 * Used by both the React pages (SEOHead) and scripts/prerender-seo.ts so the
 * prerendered HTML and the hydrated page always agree. Keep titles under ~60
 * characters and descriptions under ~160.
 */

export const BRAND_SUFFIX = ' | Omega X Converter'
const MAX_TITLE = 65

/** Adds the brand suffix only when the title has no brand separator and there is room for it. */
export function withBrand(title: string): string {
  if (title.includes('—') || title.includes('|')) return title
  return title.length + BRAND_SUFFIX.length <= MAX_TITLE ? title + BRAND_SUFFIX : title
}

export interface PageMeta {
  title: string
  description: string
}

export const PAGE_META = {
  '/': {
    title: 'Omega X Converter — Free Unit Converter',
    description: 'Free unit converter with 36 categories and 220+ units, plus formulas. Runs privately in your browser.',
  },
  '/about': {
    title: 'About Omega X Converter — NumanX Studio',
    description: 'About Omega X Converter by NumanX Studio: private, client-side unit conversion built on NIST SP 811 and SI standards.',
  },
  '/blog': {
    title: 'Unit Conversion Blog — Guides & Tips | Omega X',
    description: 'Guides, tutorials, formulas and cheat sheets for length, weight, temperature, data and precision conversions from NumanX Studio.',
  },
  '/calculator': {
    title: 'Scientific Calculator — Engineering Math | Omega X',
    description: 'Free scientific and engineering calculator with trigonometric functions, memory, formula history and built-in unit conversion.',
  },
  '/categories': {
    title: 'All 36 Unit Conversion Categories | Omega X',
    description: 'Browse all 36 measurement categories: length, mass, temperature, area, volume, pressure, data, energy and more, each with its own converter.',
  },
  '/converter': {
    title: 'Universal Unit Converter — 28 Categories | Omega X',
    description: 'Convert metric, imperial, scientific and astronomical units across 36 categories. Type naturally, like "5 km in miles", and get an instant answer.',
  },
  '/formulas': {
    title: 'Unit Conversion Formulas & Constants | Omega X',
    description: 'Reference library of conversion formulas, constants and worked derivations across all 36 measurement categories.',
  },
  '/sitemap': {
    title: 'Sitemap — All Converters, Guides & Articles | Omega X',
    description: 'Directory of every public page on Omega X: core tools, 36 conversion categories, popular conversion pairs, guides and blog articles.',
  },
  '/privacy': {
    title: 'Privacy Policy — No Tracking, Local-Only Data | Omega X',
    description: 'How Omega X Converter handles data: no accounts, ads, cookies or analytics. Your history and settings stay in your browser. Read what is stored and why.',
  },
  '/terms': {
    title: 'Terms of Use | Omega X Converter',
    description: 'Terms for using Omega X Converter: accuracy of conversions, health calculator limits, acceptable use and content licensing.',
  },
  '/contact': {
    title: 'Contact Omega X Converter — NumanX Studio',
    description: 'Contact NumanX Studio about Omega X Converter: report a wrong conversion, a security issue or a privacy question.',
  },
  '/guides': {
    title: 'Conversion Guides & Metrology Reference | Omega X',
    description: 'Step-by-step conversion guides with formula derivations, worked examples, reference tables and metrological standards for engineering and regional units.',
  },
} satisfies Record<string, PageMeta>

export type StaticPagePath = keyof typeof PAGE_META
