/**
 * Pure PWA & Service Worker Decision Logic
 *
 * Extracted pure helpers for deterministic testability and consistency
 * with public/sw.js.
 */

export type PwaRequestType =
  | 'UNSUPPORTED_METHOD'
  | 'UNSUPPORTED_PROTOCOL'
  | 'CROSS_ORIGIN'
  | 'DEV_PATH'
  | 'NAVIGATION'
  | 'HASHED_ASSET'
  | 'STATIC_ASSET'

export const PWA_CACHE_PREFIX = 'omega-x-'
export const PWA_CACHE_VERSION = 'v3'
export const PWA_STATIC_CACHE = `${PWA_CACHE_PREFIX}static-${PWA_CACHE_VERSION}`
export const PWA_PAGES_CACHE = `${PWA_CACHE_PREFIX}pages-${PWA_CACHE_VERSION}`

export const PRECACHE_STATIC = [
  '/favicon.svg',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
]

export const PRECACHE_PAGES = [
  '/index.html'
]

/**
 * Classifies an incoming network request based on method, protocol, origin, mode, and path.
 */
export function classifyRequest(
  urlStr: string,
  mode: string,
  method: string,
  appOrigin: string
): PwaRequestType {
  if (method !== 'GET') {
    return 'UNSUPPORTED_METHOD'
  }

  let parsed: URL
  try {
    parsed = new URL(urlStr, appOrigin)
  } catch {
    return 'UNSUPPORTED_PROTOCOL'
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return 'UNSUPPORTED_PROTOCOL'
  }

  if (parsed.origin !== appOrigin) {
    return 'CROSS_ORIGIN'
  }

  if (parsed.pathname.startsWith('/@') || parsed.pathname.startsWith('/src/')) {
    return 'DEV_PATH'
  }

  if (mode === 'navigate') {
    return 'NAVIGATION'
  }

  if (parsed.pathname.startsWith('/assets/')) {
    return 'HASHED_ASSET'
  }

  return 'STATIC_ASSET'
}

/**
 * Validates whether an HTTP response is safe to store in the static assets cache.
 * Must be 200 OK and strictly NOT HTML.
 */
export function isCacheableAssetResponse(
  status: number,
  ok: boolean,
  contentType: string | null
): boolean {
  if (!ok || status !== 200) return false
  if (contentType && contentType.toLowerCase().includes('text/html')) return false
  return true
}

/**
 * Determines whether a cache name is an obsolete Omega X cache that should be purged.
 * Unrelated caches belonging to other apps/services on the same origin are untouched.
 */
export function isStaleOmegaCache(
  cacheName: string,
  currentCaches: Set<string> | string[]
): boolean {
  const active = currentCaches instanceof Set ? currentCaches : new Set(currentCaches)
  return cacheName.startsWith(PWA_CACHE_PREFIX) && !active.has(cacheName)
}

/**
 * Determines the offline fallback URL for a given request classification.
 * CRITICAL SAFETY INVARIANT: SPA shell fallback (/index.html) is ONLY valid for NAVIGATION requests.
 * Failed JS/CSS/image/font requests MUST return null (never HTML).
 */
export function getOfflineFallbackForType(type: PwaRequestType): string | null {
  if (type === 'NAVIGATION') {
    return '/index.html'
  }
  return null
}
