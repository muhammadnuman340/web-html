import { Categories } from './categories'

export interface CategoryRouteDef {
  categoryId: string
  canonicalPath: string
  displayName: string
  aliases: string[]
}

export interface StaticRouteDef {
  path: string
  label: string
  type: 'core' | 'feature' | 'utility' | 'editorial'
  description?: string
}

// Explicit custom aliases that exist in legacy URLs or semantic navigation
const CUSTOM_CATEGORY_ALIASES: Record<string, string[]> = {
  temp: ['/temperature-converter', '/temperature', '/temp'],
  mass: ['/mass-converter', '/mass', '/weight-converter', '/weight'],
  data: ['/data-converter', '/data'],
}

// Generate authoritative category route metadata for all 24 categories
export const CATEGORY_ROUTES: CategoryRouteDef[] = Categories.map(cat => {
  const custom = CUSTOM_CATEGORY_ALIASES[cat.id]
  const defaultAliases = [`/${cat.id}-converter`, `/${cat.id}`]
  const aliases = custom ? Array.from(new Set([...custom, ...defaultAliases])) : defaultAliases

  return {
    categoryId: cat.id,
    canonicalPath: `/convert/${cat.id}`,
    displayName: cat.lb,
    aliases,
  }
})

// Static application routes
export const STATIC_ROUTES: StaticRouteDef[] = [
  { path: '/', label: 'Home', type: 'core', description: 'Universal unit converter homepage' },
  { path: '/converter', label: 'Universal Converter', type: 'core', description: 'Standard converter workspace' },
  { path: '/convert', label: 'Converter Redirect', type: 'core', description: 'Root convert route rendering converter' },
  { path: '/categories', label: 'Browse Categories', type: 'core', description: 'Directory of all 24 categories' },
  { path: '/dashboard', label: 'Dashboard', type: 'feature', description: 'Analytics and usage control center' },
  { path: '/currency', label: 'Currency', type: 'feature', description: 'Live forex converter with 160+ currencies' },
  { path: '/crypto', label: 'Crypto', type: 'feature', description: 'Real-time cryptocurrency price converter' },
  { path: '/formulas', label: 'Formula Explorer', type: 'feature', description: 'Interactive scientific and engineering formulas' },
  { path: '/calculator', label: 'Calculator', type: 'feature', description: 'Quick calculation and conversion interface' },
  { path: '/health', label: 'Health Hub', type: 'feature', description: 'BMI, BMR, and body composition calculators' },
  { path: '/favorites', label: 'Favorites', type: 'utility', description: 'Bookmarked conversion pairs' },
  { path: '/history', label: 'History', type: 'utility', description: 'Calculation history and log' },
  { path: '/custom-units', label: 'Custom Units', type: 'utility', description: 'User-defined custom unit manager' },
  { path: '/settings', label: 'Settings', type: 'utility', description: 'Preferences and theme settings' },
  { path: '/help', label: 'Help', type: 'utility', description: 'Keyboard shortcuts and documentation' },
  { path: '/sitemap', label: 'Sitemap', type: 'utility', description: 'Complete HTML sitemap directory' },
  { path: '/blog', label: 'Blog', type: 'editorial', description: 'Metrology guides and conversion articles' },
  { path: '/about', label: 'About', type: 'editorial', description: 'Standards compliance and project info' },
]

// Fast lookup maps
const categoryById = new Map<string, CategoryRouteDef>()
const categoryByAlias = new Map<string, CategoryRouteDef>()
const categoryByCanonical = new Map<string, CategoryRouteDef>()

for (const r of CATEGORY_ROUTES) {
  categoryById.set(r.categoryId.toLowerCase(), r)
  categoryByCanonical.set(r.canonicalPath.toLowerCase(), r)
  for (const a of r.aliases) {
    categoryByAlias.set(a.toLowerCase(), r)
  }
}

// Special alias slugs that may appear in /convert/:category or /category/:category
const SLUG_DISAMBIGUATION: Record<string, string> = {
  temperature: 'temp',
  weight: 'mass',
}

/**
 * Resolves a category ID from any slug, path, or alias.
 * E.g., 'temp' -> 'temp', 'temperature' -> 'temp', '/temperature' -> 'temp', '/convert/temp' -> 'temp'
 */
export function resolveCategoryId(input: string): string | undefined {
  if (!input) return undefined
  const cleaned = input.trim().toLowerCase()
  const slug = cleaned.startsWith('/') ? cleaned : `/${cleaned}`

  // Check direct canonical path: /convert/temp
  const fromCanonical = categoryByCanonical.get(slug)
  if (fromCanonical) return fromCanonical.categoryId

  // Check direct alias path: /temperature-converter or /length
  const fromAlias = categoryByAlias.get(slug)
  if (fromAlias) return fromAlias.categoryId

  // Check raw ID: temp, length
  const fromId = categoryById.get(cleaned)
  if (fromId) return fromId.categoryId

  // Check semantic disambiguation: temperature -> temp, weight -> mass
  if (SLUG_DISAMBIGUATION[cleaned]) {
    return SLUG_DISAMBIGUATION[cleaned]
  }

  return undefined
}

/**
 * Returns the canonical path for a category ID or alias.
 */
export function getCanonicalCategoryPath(categoryIdOrAlias: string): string | undefined {
  const catId = resolveCategoryId(categoryIdOrAlias)
  if (!catId) return undefined
  return `/convert/${catId}`
}

/**
 * Returns all registered category routes.
 */
export function getAllCategoryRoutes(): CategoryRouteDef[] {
  return CATEGORY_ROUTES
}

/**
 * Checks for route collisions across static routes, canonical category routes, and aliases.
 */
export function detectRouteCollisions(): {
  collisions: { path: string; types: string[] }[]
  hasCollisions: boolean
} {
  const pathMap = new Map<string, string[]>()

  function register(path: string, type: string) {
    const list = pathMap.get(path) || []
    list.push(type)
    pathMap.set(path, list)
  }

  for (const s of STATIC_ROUTES) {
    register(s.path, `static:${s.type}`)
  }

  for (const c of CATEGORY_ROUTES) {
    register(c.canonicalPath, `canonical:${c.categoryId}`)
    for (const a of c.aliases) {
      register(a, `alias:${c.categoryId}`)
    }
  }

  const collisions: { path: string; types: string[] }[] = []
  for (const [path, types] of pathMap.entries()) {
    if (types.length > 1) {
      collisions.push({ path, types })
    }
  }

  return {
    collisions,
    hasCollisions: collisions.length > 0,
  }
}
