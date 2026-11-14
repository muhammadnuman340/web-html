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

// Authoritative default production origin (Cloudflare domain)
export const DEFAULT_SITE_URL = 'https://converter.numanxstudio.com'

/**
 * Returns the active production site origin without a trailing slash.
 * Supports environment override via VITE_SITE_URL if configured.
 */
export function getSiteUrl(): string {
  const envUrl = (typeof process !== 'undefined' && process.env?.VITE_SITE_URL)
    ? process.env.VITE_SITE_URL
    : (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL)
    ? import.meta.env.VITE_SITE_URL
    : undefined

  const rawUrl = envUrl || DEFAULT_SITE_URL
  return rawUrl.trim().replace(/\/+$/, '')
}

export const SITE = {
  name: 'Omega X',
  fullName: 'Omega X Converter',
  organization: 'NumanX Studio',
  url: `${getSiteUrl()}/`,
  defaultTitle: 'Omega X Converter — Universal Unit Calculator',
  defaultDescription:
    'Free universal unit converter platform with 28 categories, 220+ units, formula charts, and instant precision.',
  license: 'https://creativecommons.org/licenses/by/4.0/',
}

/**
 * Normalizes a path into a clean, URL-safe path with a leading slash.
 * Returns '/' for the root route.
 */
export function normalizePath(path = ''): string {
  if (!path || path.trim() === '' || path.trim() === '/') return '/'
  const withoutQuery = path.trim().split('?')[0].split('#')[0]
  if (!withoutQuery || withoutQuery === '/') return '/'
  const withLeading = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`
  const collapsed = withLeading.replace(/\/+/g, '/')
  return collapsed === '/' ? '/' : collapsed.replace(/\/+$/, '')
}

/**
 * Generates an absolute URL using the authoritative site origin.
 * Guarantees zero double slashes and deterministic output.
 */
export function absoluteUrl(path = ''): string {
  const base = getSiteUrl()
  const normalized = normalizePath(path)
  return normalized === '/' ? `${base}/` : `${base}${normalized}`
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
    '/formulas',
    '/calculator',
    '/health',
    '/blog',
    '/about',
    '/sitemap',
    '/privacy',
    '/terms',
    '/contact',
  ],
  noindex: [
    '/dashboard',
    '/favorites',
    '/history',
    '/settings',
    '/custom-units',
    '/help',
    '/404',
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
