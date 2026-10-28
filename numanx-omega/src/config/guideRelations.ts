/**
 * src/config/guideRelations.ts
 * Centralized, typed relationship architecture for educational conversion guides.
 *
 * Connects:
 * - 6 Educational Guides (/guides/:slug)
 * - 24 Canonical Categories (/convert/:id)
 * - 99 Curated Popular Pairs (/convert/:category/:pair)
 * - Relevant Metrology Blog Articles (/blog/:slug)
 */

export interface GuideRelationship {
  guideSlug: string
  title: string
  categoryId: string
  categoryName: string
  categoryPath: string
  pairSlug: string
  pairPath: string
  pairLabel: string
  relatedPostSlugs: string[]
}

export const GUIDE_RELATIONSHIPS: GuideRelationship[] = [
  {
    guideSlug: 'lbs-to-kg',
    title: 'Pounds to Kilograms',
    categoryId: 'mass',
    categoryName: 'Mass & Weight',
    categoryPath: '/convert/mass',
    pairSlug: 'pounds-to-kilogram',
    pairPath: '/convert/mass/pounds-to-kilogram',
    pairLabel: 'Pounds to Kilogram',
    relatedPostSlugs: [
      'metric-vs-imperial-engineering-guide',
    ],
  },
  {
    guideSlug: 'kg-to-lbs',
    title: 'Kilograms to Pounds',
    categoryId: 'mass',
    categoryName: 'Mass & Weight',
    categoryPath: '/convert/mass',
    pairSlug: 'kilogram-to-pounds',
    pairPath: '/convert/mass/kilogram-to-pounds',
    pairLabel: 'Kilogram to Pounds',
    relatedPostSlugs: [
      'metric-vs-imperial-engineering-guide',
    ],
  },
  {
    guideSlug: 'meters-to-feet',
    title: 'Meters to Feet',
    categoryId: 'length',
    categoryName: 'Length & Distance',
    categoryPath: '/convert/length',
    pairSlug: 'meter-to-feet',
    pairPath: '/convert/length/meter-to-feet',
    pairLabel: 'Meter to Feet',
    relatedPostSlugs: [
      'compound-length-units-guide',
      'fractional-inches-to-mm-best-practices',
      'metric-vs-imperial-engineering-guide',
    ],
  },
  {
    guideSlug: 'feet-to-meters',
    title: 'Feet to Meters',
    categoryId: 'length',
    categoryName: 'Length & Distance',
    categoryPath: '/convert/length',
    pairSlug: 'feet-to-meters',
    pairPath: '/convert/length/feet-to-meters',
    pairLabel: 'Feet to Meters',
    relatedPostSlugs: [
      'compound-length-units-guide',
      'metric-vs-imperial-engineering-guide',
    ],
  },
  {
    guideSlug: 'celsius-to-fahrenheit',
    title: 'Celsius to Fahrenheit',
    categoryId: 'temp',
    categoryName: 'Temperature',
    categoryPath: '/convert/temp',
    pairSlug: 'celsius-to-fahrenheit',
    pairPath: '/convert/temp/celsius-to-fahrenheit',
    pairLabel: 'Celsius to Fahrenheit',
    relatedPostSlugs: [
      'temperature-scales-celsius-fahrenheit-kelvin',
    ],
  },
  {
    guideSlug: 'fahrenheit-to-celsius',
    title: 'Fahrenheit to Celsius',
    categoryId: 'temp',
    categoryName: 'Temperature',
    categoryPath: '/convert/temp',
    pairSlug: 'fahrenheit-to-celsius',
    pairPath: '/convert/temp/fahrenheit-to-celsius',
    pairLabel: 'Fahrenheit to Celsius',
    relatedPostSlugs: [
      'temperature-scales-celsius-fahrenheit-kelvin',
    ],
  },
]

/**
 * Returns all guides that belong to a specific category ID.
 */
export function getGuidesForCategory(categoryId: string): GuideRelationship[] {
  return GUIDE_RELATIONSHIPS.filter(r => r.categoryId === categoryId)
}

/**
 * Returns the guide corresponding to a specific category and pair slug (if one exists).
 */
export function getGuideForPair(categoryId: string, pairSlug: string): GuideRelationship | undefined {
  return GUIDE_RELATIONSHIPS.find(
    r => r.categoryId === categoryId && r.pairSlug === pairSlug
  )
}

/**
 * Returns the relationship metadata for a specific guide slug.
 */
export function getGuideRelationship(guideSlug: string): GuideRelationship | undefined {
  return GUIDE_RELATIONSHIPS.find(r => r.guideSlug === guideSlug)
}

// Strict decimal number pattern: optional sign, digits with optional decimal point, or leading decimal, optional scientific notation exponent
// Explicitly rejects hex (0x..), binary (0b..), and octal (0o..) prefixes
const STRICT_DECIMAL_REGEX = /^[+-]?(?:(?:\d+\.?\d*)|(?:\.\d+))(?:[eE][+-]?\d+)?$/

/**
 * Deterministic pair query-state parsing.
 * Validates that ?val= is a strict, finite decimal numeric string.
 * Safely falls back to default '1' for missing, empty, non-decimal, or non-finite inputs.
 */
export function parsePairQueryVal(rawParam: string | null | undefined): string {
  if (rawParam === null || rawParam === undefined) return '1'
  const trimmed = rawParam.trim()
  if (!trimmed) return '1'

  // Reject non-decimal syntax (such as 0x10 hex, 0b10 binary, or alphanumeric garbage)
  if (!STRICT_DECIMAL_REGEX.test(trimmed)) return '1'

  const num = Number(trimmed)
  if (!Number.isFinite(num)) return '1'

  return trimmed
}
