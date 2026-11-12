/**
 * src/config/guideRelations.ts
 * Centralized, typed relationship architecture for educational conversion guides.
 *
 * Connects:
 * - 15 Educational Guides (/guides/:slug)
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
    guideSlug: 'lbs-to-kg',
    title: 'Pounds to Kilograms',
    categoryId: 'mass',
    categoryName: 'Mass & Weight',
    categoryPath: '/convert/mass',
    pairSlug: 'pounds-to-kilogram',
    pairPath: '/convert/mass/pounds-to-kilogram',
    pairLabel: 'Pounds to Kilogram',
    fromUnit: 'lb',
    toUnit: 'kg',
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
    fromUnit: 'kg',
    toUnit: 'lb',
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
    fromUnit: 'm',
    toUnit: 'ft',
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
    fromUnit: 'ft',
    toUnit: 'm',
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
    fromUnit: 'C',
    toUnit: 'F',
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
    fromUnit: 'F',
    toUnit: 'C',
    relatedPostSlugs: [
      'temperature-scales-celsius-fahrenheit-kelvin',
    ],
  },
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
    guideSlug: 'psi-to-bar',
    title: 'PSI to Bar',
    categoryId: 'pressure',
    categoryName: 'Pressure',
    categoryPath: '/convert/pressure',
    pairSlug: 'bar-to-psi',
    pairPath: '/convert/pressure/bar-to-psi',
    pairLabel: 'Bar to PSI',
    fromUnit: 'psi',
    toUnit: 'bar',
    relatedPostSlugs: [
      'metric-vs-imperial-engineering-guide',
    ],
  },
  {
    guideSlug: 'kw-to-hp',
    title: 'Kilowatts to Horsepower',
    categoryId: 'power',
    categoryName: 'Power',
    categoryPath: '/convert/power',
    pairSlug: 'metric-horsepower-to-kilowatt',
    pairPath: '/convert/power/metric-horsepower-to-kilowatt',
    pairLabel: 'Metric Horsepower to Kilowatt',
    fromUnit: 'kW',
    toUnit: 'hp',
    relatedPostSlugs: [
      'metric-vs-imperial-engineering-guide',
    ],
  },
  {
    guideSlug: 'marla-to-square-feet-pakistan',
    title: 'Marla to Square Feet in Pakistan',
    categoryId: 'area',
    categoryName: 'Area',
    categoryPath: '/convert/area',
    pairSlug: 'marla-to-ft2',
    pairPath: '/convert/area/marla-to-ft2',
    pairLabel: 'Marla to Square Feet',
    fromUnit: 'marla',
    toUnit: 'ft2',
    relatedPostSlugs: [
      'metric-vs-imperial-engineering-guide',
    ],
  },
  {
    guideSlug: 'tola-to-grams-gold-pakistan',
    title: '1 Tola in Grams, Masha & Ratti',
    categoryId: 'mass',
    categoryName: 'Mass & Weight',
    categoryPath: '/convert/mass',
    pairSlug: 'tola-to-g',
    pairPath: '/convert/mass/tola-to-g',
    pairLabel: 'Tola to Grams',
    fromUnit: 'tola',
    toUnit: 'g',
    relatedPostSlugs: [
      'metric-vs-imperial-engineering-guide',
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
    guideSlug: 'hec-cgpa-to-percentage-pakistan',
    title: 'HEC CGPA to Percentage Guide',
    categoryId: 'pk-gpa',
    categoryName: 'HEC GPA & Marks',
    categoryPath: '/convert/pk-gpa',
    pairSlug: 'hec-gpa4-to-percentage',
    pairPath: '/convert/pk-gpa/hec-gpa4-to-percentage',
    pairLabel: 'HEC CGPA 4.0 to Percentage',
    fromUnit: 'hec_gpa4',
    toUnit: 'percentage',
    relatedPostSlugs: [],
  },
  {
    guideSlug: 'cricket-overs-to-balls-nrr',
    title: 'Cricket Overs to Decimal Overs & NRR',
    categoryId: 'cricket-overs',
    categoryName: 'Cricket Base-6',
    categoryPath: '/convert/cricket-overs',
    pairSlug: 'overs-balls-to-balls',
    pairPath: '/convert/cricket-overs/overs-balls-to-balls',
    pairLabel: 'Cricket Overs to Balls',
    fromUnit: 'overs_balls',
    toUnit: 'balls',
    relatedPostSlugs: [],
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
