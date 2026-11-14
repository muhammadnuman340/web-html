/**
 * src/config/guideRelations.ts
 * Centralized, typed relationship architecture for educational conversion guides.
 *
 * Connects:
 * - 3 Educational Guides (/guides/:slug)
 * - 36 Canonical Categories (/convert/:id)
 * - 187 Curated Popular Pairs (/convert/:category/:pair)
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
  fromUnit: string
  toUnit: string
  relatedPostSlugs: string[]
}

export const GUIDE_RELATIONSHIPS: GuideRelationship[] = [
  {
    guideSlug: 'cups-to-grams',
    title: 'Cups to Grams',
    categoryId: 'cooking',
    categoryName: 'Cooking & Recipes',
    categoryPath: '/convert/cooking',
    pairSlug: 'stick-of-butter-to-tablespoon',
    pairPath: '/convert/cooking/stick-of-butter-to-tablespoon',
    pairLabel: 'Stick of Butter to Tablespoon',
    fromUnit: 'cup_c',
    toUnit: 'mL_c',
    relatedPostSlugs: [
      'ai-powered-unit-conversions-in-2026',
    ],
  },
  {
    guideSlug: 'lakh-crore-to-million-billion',
    title: 'Lakh & Crore to Million & Billion',
    categoryId: 'pk-numbering',
    categoryName: 'South Asian Numbering',
    categoryPath: '/convert/pk-numbering',
    pairSlug: 'lakh-to-m-std',
    pairPath: '/convert/pk-numbering/lakh-to-m-std',
    pairLabel: 'Lakh to Million',
    fromUnit: 'lakh',
    toUnit: 'm_std',
    relatedPostSlugs: [
      'digital-data-storage-units-guide',
    ],
  },
  {
    guideSlug: 'binary-hex-ieee-754-guide',
    title: 'Binary, Hex & IEEE-754 Float Guide',
    categoryId: 'number-base',
    categoryName: 'Number Base',
    categoryPath: '/convert/number-base',
    pairSlug: 'bin-to-dec',
    pairPath: '/convert/number-base/bin-to-dec',
    pairLabel: 'Binary to Decimal',
    fromUnit: 'bin_radix',
    toUnit: 'hex_radix',
    relatedPostSlugs: [
      'digital-data-storage-units-guide',
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

/**
 * Robust ?val= parameter parser strictly designed for Step 4.
 */
export function parsePairQueryVal(rawVal: string | null | undefined): string {
  if (!rawVal) return '1'
  const trimmed = rawVal.trim()
  if (!trimmed) return '1'

  if (/^0[xXoObB]/.test(trimmed)) return '1'
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(trimmed)) return '1'

  const parsed = Number(trimmed)
  if (isNaN(parsed) || !isFinite(parsed)) return '1'
  if (Math.abs(parsed) > 1e100 || (parsed !== 0 && Math.abs(parsed) < 1e-100)) return '1'

  return trimmed
}
