/**
 * src/config/site.ts
 * Authoritative Site Metadata & Canonical URL Architecture
 *
 * Single source of truth for:
 * - Production domain
 * - Site identity & organization branding
 * - Canonical URL generation
 * - Indexability & robots policies
 */

import { resolveCategoryId } from '../engine/routes'

// Authoritative default production origin (Netlify live domain)
export const DEFAULT_SITE_URL = 'https://numanx-studio-omega-converter.netlify.app'

/**
 * Returns the active production site origin without a trailing slash.
 * Supports environment override via VITE_SITE_URL if configured.
 */
export function getSiteUrl(): string {
  const envUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL
    ? import.meta.env.VITE_SITE_URL
    : undefined

  const rawUrl = envUrl || DEFAULT_SITE_URL
  return rawUrl.trim().replace(/\/+$/, '')
}

export const SITE = {
  name: 'Omega X',
  fullName: 'Omega X Converter',
  organization: 'NumanX Studio',
  url: getSiteUrl(),
  defaultTitle: 'Omega X Converter — Universal Unit & Currency Calculator',
  defaultDescription:
    'Free universal unit converter platform with 24 categories, 200+ units, live currency rates, crypto prices, formula charts, and offline PWA support.',
  twitterHandle: '@numanx',
  license: 'https://creativecommons.org/licenses/by/4.0/',
}

/**
 * Normalizes a path into a clean, URL-safe path with a leading slash.
 */
export function normalizePath(path = ''): string {
  if (!path || path === '/') return ''
  const trimmed = path.trim()
  const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  const collapsed = withLeading.replace(/\/+/g, '/')
  return collapsed === '/' ? '' : collapsed.replace(/\/+$/, '')
}

/**
 * Generates an absolute URL using the authoritative site origin.
 * Guarantees zero double slashes and deterministic output.
 */
export function absoluteUrl(path = ''): string {
  const base = getSiteUrl()
  const normalized = normalizePath(path)
  return `${base}${normalized}`
}

/**
 * Generates the canonical URL for any route, path, or category alias.
 * Automatically resolves category aliases (e.g. '/length-converter' -> '/convert/length').
 */
export function canonicalUrl(path = ''): string {
  const normalized = normalizePath(path)

  // Check if path is a category alias or direct category path
  const resolvedId = resolveCategoryId(normalized)
  if (resolvedId) {
    return absoluteUrl(`/convert/${resolvedId}`)
  }

  return absoluteUrl(normalized)
}

/**
 * Indexability Policy
 * Categorizes routes into indexable (public high-value content) and noindex (stateful, utility, or session-based).
 */
export const INDEXABILITY_POLICY = {
  index: [
    '/',
    '/converter',
    '/categories',
    '/currency',
    '/crypto',
    '/formulas',
    '/calculator',
    '/health',
    '/blog',
    '/about',
    '/sitemap',
  ],
  noindex: [
    '/dashboard',
    '/favorites',
    '/history',
    '/settings',
    '/custom-units',
    '/help',
  ],
} as const

/**
 * Returns true if a path is designated as public indexable content.
 */
export function isIndexablePath(path: string): boolean {
  const normalized = normalizePath(path) || '/'
  if (INDEXABILITY_POLICY.noindex.some(p => normalized === p || normalized.startsWith(`${p}/`))) {
    return false
  }
  return true
}
