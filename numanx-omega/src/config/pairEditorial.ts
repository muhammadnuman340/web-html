/**
 * src/config/pairEditorial.ts
 *
 * Single Source of Truth for Pair-Page Content Differentiation and AEO Answer Quality.
 * Provides factual, mathematically accurate, category-aware, and unit-specific editorial content
 * for all 99 canonical conversion pair pages (/convert/:category/:pair).
 *
 * Consumed by:
 * - src/pages/PairLanding.tsx (Client-Side React Rendering)
 * - src/config/schema.ts (JSON-LD WebApplication + FAQPage with 100% visible parity)
 * - scripts/prerender-seo.ts (Static HTML Prerendering at Build Time)
 * - tests/pseo-aeo-content.test.ts (Acceptance & Parity Verification)
 */

import type { CategoryDef, UnitDef } from '../types'
import { convert, convertTemp, convertFuel } from '../engine/converter'
import { fmt, cleanFloat } from '../utils/numbers'
import { categoryContent } from '../engine/categoryContent'
import { unitSymbol, unitName, unitLabel } from '../engine/unitSymbols'

export function cleanSlug(s: string): string {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export const PAIR_UNIT_SYNONYMS: Record<string, string> = {
  // Area
  'square-meter': 'm2',
  'square-meters': 'm2',
  'square-foot': 'ft2',
  'square-feet': 'ft2',
  'square-kilometer': 'km2',
  'square-kilometers': 'km2',
  'square-mile': 'mi2',
  'square-miles': 'mi2',
  'square-yard': 'yd2',
  'square-yards': 'yd2',
  'square-inch': 'in2',
  'square-inches': 'in2',
  'square-millimeter': 'mm2',
  'square-millimeters': 'mm2',
  'square-centimeter': 'cm2',
  'square-centimeters': 'cm2',
  'acre': 'ac',
  'acres': 'ac',
  'hectare': 'ha',
  'hectares': 'ha',

  // Volume
  'cubic-meter': 'm3',
  'cubic-meters': 'm3',
  'cubic-foot': 'ft3',
  'cubic-feet': 'ft3',
  'cubic-inch': 'in3',
  'cubic-inches': 'in3',
  'fluid-ounce': 'floz',
  'fluid-ounces': 'floz',

  // Speed
  'speed:km-h': 'kmh',
  'speed:kmh': 'kmh',
  'speed:m-s': 'mps',
  'speed:mps': 'mps',

  // Acceleration
  'acceleration:m-s': 'mps2',
  'acceleration:g-force': 'gforce',
  'acceleration:ft-s': 'ftps2',

  // Mass
  'us-ton': 'sh tn',
  'short-ton': 'sh tn',
  'metric-ton': 't',

  // Power / Energy
  'btu-h': 'BTUh',
  'calories': 'cal',
  'calorie': 'cal',
  'joules': 'J',
  'joule': 'J',

  // Fuel
  'mpg-us': 'mpgUS',
  'mpg-uk': 'mpgUK',
  'km-l': 'kmL',
  'l-100km': 'L100km',

  // Torque
  'newton-meter': 'Nm',
  'foot-pound': 'lbft',
  'pound-foot': 'lbft',
  'pound-feet': 'lbft',
  'foot-pounds': 'lbft',
  'pound-inch': 'lbin',
  'pound-inches': 'lbin',
  'inch-pound': 'lbin',
  'inch-pounds': 'lbin',

  // Density
  'g-cm': 'gcm3',
  'kg-m': 'kgm3',
  'lb-ft': 'lbft3',

  // Force
  'force:kn': 'kN',

  // Frequency
  'rpm': 'rpm',

  // Angle
  'degrees': 'deg',
  'degree': 'deg',
  'radians': 'rad',
  'radian': 'rad',
  'gradians': 'grad',
  'gradian': 'grad',
  'arcminutes': 'arcmin',
  'arcminute': 'arcmin',
  'mrad': 'mrad',

  // Data
  'bits': 'bit',
  'bytes': 'B',
  'gigabyte': 'GB',
  'gigabytes': 'GB',
  'gibibyte': 'GiB',
  'gibibytes': 'GiB',

  // Time
  'seconds': 's',
  'minutes': 'min',
  'hours': 'hr',

  // Curated Pair Slugs & New Units
  'cubic-yard': 'yd3',
  'cubic-yards': 'yd3',
  'imperial-gallon': 'impgal',
  'imperial-gallons': 'impgal',
  'troy-ounce': 'ozt',
  'troy-ounces': 'ozt',
  'angstrom': 'angstrom',
  'angstroms': 'angstrom',
  'nanometer': 'nm',
  'nanometers': 'nm',
  'fathom': 'fathom',
  'fathoms': 'fathom',
  'hectopascal': 'hPa',
  'hectopascals': 'hPa',
  'millibar': 'mbar',
  'millibars': 'mbar',
  'inches-of-mercury': 'inHg',
  'metric-horsepower': 'ps',
  'ton-of-refrigeration': 'tr',
  'tons-of-refrigeration': 'tr',
  'stick-of-butter': 'stick_c',
  'sticks-of-butter': 'stick_c',
  'gallon-per-minute': 'gpm',
  'gallons-per-minute': 'gpm',
  'liter-per-minute': 'Lmin',
  'liters-per-minute': 'Lmin',
  'cubic-feet-per-minute': 'cfm',
  'cubic-foot-per-minute': 'cfm',
  'liter-per-second': 'Ls',
  'liters-per-second': 'Ls',
  'cubic-meter-per-hour': 'm3h',
  'cubic-meters-per-hour': 'm3h',
  'foot-candle': 'fc',
  'foot-candles': 'fc',
  'lux': 'lx',
  'centipoise': 'cP',
  'pascal-second': 'Pas',
  'pascal-seconds': 'Pas',
  'millipascal-second': 'mPas',
  'millipascal-seconds': 'mPas',
  'pixel': 'px',
  'pixels': 'px',
  'point': 'pt',
  'points': 'pt',
  'root-em': 'rem',
  'rem': 'rem',
}

export function findUnit(cat: CategoryDef, raw: string): UnitDef | undefined {
  const q = raw.trim().toLowerCase()
  const qSpaced = q.replace(/-/g, ' ')

  // 1. Check category-scoped synonym first
  const scopedKey = `${cat.id}:${q}`
  if (PAIR_UNIT_SYNONYMS[scopedKey]) {
    const direct = cat.un.find(u => u.id.toLowerCase() === PAIR_UNIT_SYNONYMS[scopedKey].toLowerCase())
    if (direct) return direct
  }

  // 2. Check global synonym
  if (PAIR_UNIT_SYNONYMS[q]) {
    const direct = cat.un.find(u => u.id.toLowerCase() === PAIR_UNIT_SYNONYMS[q].toLowerCase())
    if (direct) return direct
  }

  // 3. Clean plural forms
  const singularCandidates = [q, qSpaced]
  if (q.endsWith('ies')) singularCandidates.push(q.slice(0, -3) + 'y')
  if (q.endsWith('es')) {
    singularCandidates.push(q.slice(0, -2))
    singularCandidates.push(q.slice(0, -1))
  }
  if (q.endsWith('s')) singularCandidates.push(q.slice(0, -1))

  return cat.un.find(u => {
    const uid = u.id.toLowerCase()
    const ulb = u.lb.toLowerCase()
    for (const cand of singularCandidates) {
      if (uid === cand || ulb === cand) return true
      if (u.al?.some(a => a.toLowerCase() === cand)) return true
    }
    return false
  })
}

// Build Canonical 99 Pair Registry Set
export const CANONICAL_PAIR_SET = new Set<string>()

for (const [catId, content] of Object.entries(categoryContent)) {
  if (content?.popularPairs) {
    for (const pair of content.popularPairs) {
      const fSlug = cleanSlug(pair.from)
      const tSlug = cleanSlug(pair.to)
      CANONICAL_PAIR_SET.add(`${catId}:${fSlug}-to-${tSlug}`)
    }
  }
}

export function isCanonicalPair(catId: string, pairSlug: string): boolean {
  return CANONICAL_PAIR_SET.has(`${catId}:${pairSlug}`)
}

export interface PairEditorialUseCases {
  domain: string
  context: string
}

export interface PairEditorialFaq {
  question: string
  answer: string
}

export interface PairEditorialContent {
  directAnswer: {
    heading: string
    summary: string
    formulaDisplay: string
    inverseSummary: string
    calculationRule: string
    isAffine: boolean
    isReciprocal: boolean
  }
  explanation: {
    heading: string
    paragraphs: string[]
    systemContext: string
  }
  useCases: PairEditorialUseCases[]
  reciprocal: {
    hasCanonicalPair: boolean
    url: string
    anchorText: string
    badgeText: string
    description: string
  }
  faqs: PairEditorialFaq[]
  fieldNote?: {
    badge: string
    title: string
    note: string
    standard?: string
  }
}

// Category-Level Metrology Contexts
const CATEGORY_METROLOGY: Record<string, { dimension: string; siBase: string; systems: string; contextNote: string }> = {
  length: {
    dimension: 'linear distance and spatial extent',
    siBase: 'meter (m)',
    systems: 'International System of Units (SI) and US Customary / British Imperial units',
    contextNote: 'Standardized under the 1959 International Yard and Pound Agreement (1 yard = 0.9144 m; 1 inch = 25.4 mm).',
  },
  mass: {
    dimension: 'inertial and gravitational mass (quantity of matter)',
    siBase: 'kilogram (kg)',
    systems: 'SI metric mass units and avoirdupois imperial/customary units',
    contextNote: 'Standardized under BIPM and CGPM metrology definitions (1 avoirdupois pound = 0.45359237 kg).',
  },
  temp: {
    dimension: 'thermodynamic temperature and kinetic molecular energy',
    siBase: 'kelvin (K)',
    systems: 'Celsius (°C), Fahrenheit (°F), Kelvin (K), Rankine (°R), and Réaumur (°Re)',
    contextNote: 'The kelvin and degree Celsius share the same unit interval size under SI definitions, with 0 °C corresponding to 273.15 K.',
  },
  area: {
    dimension: 'two-dimensional surface extent ($L^2$)',
    siBase: 'square meter (m²)',
    systems: 'Metric area units and imperial/customary units (acres, square feet)',
    contextNote: 'Conversions scale quadratically with the underlying linear dimension (1 m² = 10.7639104 ft²).',
  },
  volume: {
    dimension: 'three-dimensional volumetric capacity ($L^3$)',
    siBase: 'cubic meter (m³) and liter (L)',
    systems: 'Metric liquid volume and US Customary / British Imperial liquid measures',
    contextNote: 'Standardized according to NIST Handbook 44 and OIML liquid capacity regulations.',
  },
  speed: {
    dimension: 'rate of change of position with respect to time ($L/T$)',
    siBase: 'meters per second (m/s)',
    systems: 'Metric (km/h), imperial (mph), and nautical (knots)',
    contextNote: 'Standardized internationally by ICAO (aviation), IMO (maritime), and SI transport metrology.',
  },
  time: {
    dimension: 'chronological duration and sequential progression ($T$)',
    siBase: 'second (s)',
    systems: 'SI atomic second and sexagesimal astronomical calendar units',
    contextNote: 'Defined via the cesium-133 ground-state hyperfine transition frequency under the BIPM SI Brochure.',
  },
  energy: {
    dimension: 'capacity to perform mechanical work or transfer heat ($M \\cdot L^2 / T^2$)',
    siBase: 'joule (J)',
    systems: 'SI joules, nutritional/thermal calories, electrical kilowatt-hours, and British Thermal Units (BTU)',
    contextNote: 'Standardized under ISO 80000-5 and International Steam Table thermochemical definitions.',
  },
  pressure: {
    dimension: 'force exerted perpendicularly per unit surface area ($F/A$)',
    siBase: 'pascal (Pa = N/m²)',
    systems: 'SI pascals, metric bar, engineering psi, and standard atmospheres (atm)',
    contextNote: 'Standardized under ISO 80000-4 with standard atmospheric pressure defined as exactly 101,325 Pa.',
  },
  power: {
    dimension: 'rate of energy transfer or work performed per unit time ($E/T$)',
    siBase: 'watt (W = J/s)',
    systems: 'SI watts/kilowatts and imperial/mechanical horsepower',
    contextNote: 'Mechanical horsepower is defined as 550 ft·lbf/s (approximately 745.69987 W).',
  },
  force: {
    dimension: 'rate of change of momentum according to Newton\'s second law ($M \\cdot L / T^2$)',
    siBase: 'newton (N = kg·m/s²)',
    systems: 'SI newtons and gravitational pound-force (lbf)',
    contextNote: 'Pound-force relies on standard Earth gravitational acceleration $g_0 = 9.80665\\text{ m/s}^2$ ($1\\text{ lbf} \\approx 4.448222\\text{ N}$).',
  },
  data: {
    dimension: 'digital information storage capacity',
    siBase: 'byte (B) and bit',
    systems: 'Decimal metric multiples (SI 1000-byte) and binary multiples (IEC 1024-byte)',
    contextNote: 'Standardized under IEC 80000-13 and IEEE metrology conventions.',
  },
  fuel: {
    dimension: 'fuel efficiency (distance per volume) and fuel consumption (volume per distance)',
    siBase: 'kilometers per liter (km/L) and liters per 100 kilometers (L/100km)',
    systems: 'Metric consumption (L/100km), metric efficiency (km/L), and US/UK Miles Per Gallon (MPG)',
    contextNote: 'Efficiency and consumption exhibit an inverse mathematical relationship ($L/100km = 235.215 / MPG_{US}$).',
  },
  angle: {
    dimension: 'planar angular separation and circular rotation',
    siBase: 'radian (rad)',
    systems: 'Sexagesimal degrees (360°), radians ($2\\pi$), gradians (400 gon), and arcminutes',
    contextNote: 'Standardized under ISO 80000-3 with $\\pi$ radians spanning a 180-degree half-circle.',
  },
  frequency: {
    dimension: 'rate of periodic recurrence or cycles per unit time ($1/T$)',
    siBase: 'hertz (Hz = 1/s)',
    systems: 'SI hertz multiples and rotational revolutions per minute (RPM)',
    contextNote: 'Rotational RPM relates directly to Hz via a factor of 60 ($1\\text{ Hz} = 60\\text{ RPM}$).',
  },
  acceleration: {
    dimension: 'rate of change of velocity with respect to time ($L/T^2$)',
    siBase: 'meters per second squared (m/s²)',
    systems: 'SI m/s², imperial ft/s², and standard Earth gravitational acceleration ($g$)',
    contextNote: 'Standard gravitational acceleration is fixed internationally at $1\\text{ }g = 9.80665\\text{ m/s}^2$.',
  },
  electricity: {
    dimension: 'electromagnetic potential, electric current, resistance, and capacitance',
    siBase: 'ampere (A), volt (V), ohm (Ω), farad (F)',
    systems: 'SI electromagnetic definitions',
    contextNote: 'Grounded in fundamental physical constants including the elementary charge $e = 1.602176634 \\times 10^{-19}\\text{ C}$.',
  },
  magnetism: {
    dimension: 'magnetic flux density and magnetic field strength',
    siBase: 'tesla (T)',
    systems: 'SI tesla and CGS electromagnetic gauss ($1\\text{ T} = 10,000\\text{ G}$)',
    contextNote: 'Governed by BIPM SI specifications and electromagnetic induction laws.',
  },
  datatransfer: {
    dimension: 'digital data transmission throughput and bandwidth ($bits/T$)',
    siBase: 'bits per second (bps)',
    systems: 'Telecommunication decimal transfer rates (kbps, Mbps, Gbps)',
    contextNote: 'Standardized under ITU-T and IEEE 802 telecommunications protocol specifications.',
  },
  torque: {
    dimension: 'rotational moment and torsional force ($F \\cdot L$)',
    siBase: 'newton-meter (N·m)',
    systems: 'SI newton-meters and imperial foot-pounds (lbf·ft)',
    contextNote: 'Standardized under ISO 80000-4 mechanical engineering metrology ($1\\text{ N}\\cdot\\text{m} \\approx 0.737562\\text{ lbf}\\cdot\\text{ft}$).',
  },
  density: {
    dimension: 'volumetric mass density ($M / L^3$)',
    siBase: 'kilograms per cubic meter (kg/m³)',
    systems: 'SI kg/m³, metric g/cm³, and imperial pounds per cubic foot (lb/ft³)',
    contextNote: 'Water at 4°C exhibits an approximate density of $1\\text{ g/cm}^3 = 1000\\text{ kg/m}^3 = 62.42796\\text{ lb/ft}^3$.',
  },
  cooking: {
    dimension: 'culinary recipe volumetric capacity',
    siBase: 'milliliter (mL) and culinary units (cups, tablespoons, teaspoons)',
    systems: 'US Legal Cup (240 mL), US Customary Cup (~236.588 mL), and metric liquid volumes',
    contextNote: 'Standardized according to US FDA 21 CFR § 101.9 nutritional and culinary measuring guidelines.',
  },
  textile: {
    dimension: 'fabric surface density and weave density',
    siBase: 'grams per square meter (GSM)',
    systems: 'Metric GSM and imperial thread count (threads per square inch)',
    contextNote: 'Evaluated under ASTM D3776 textile mass specifications and international fabric trade standards.',
  },
  astronomy: {
    dimension: 'astronomical interstellar distance and celestial stellar mass',
    siBase: 'astronomical unit (au), light-year (ly), parsec (pc), solar mass ($M_\\odot$)',
    systems: 'International Astronomical Union (IAU) astronomical constants',
    contextNote: 'Standardized under IAU Resolution B2 (2012) fixing $1\\text{ au} = 149,597,870,700\\text{ m}$.',
  },
  flow: {
    dimension: 'volumetric fluid flow rate and discharge per unit time ($L^3/T$)',
    siBase: 'cubic meters per second (m³/s)',
    systems: 'SI cubic meters per second, metric liters per minute, and US engineering GPM/CFM',
    contextNote: 'Standardized under ISO 5167, ASHRAE guidelines for HVAC duct ventilation, and AWWA fluid distribution standards.',
  },
  illuminance: {
    dimension: 'luminous flux incident on a surface per unit area ($J/L^2$)',
    siBase: 'lux (lx = lm/m²)',
    systems: 'SI metric lux and imperial foot-candles (lm/ft²)',
    contextNote: 'Standardized under CIE (International Commission on Illumination) and IESNA lighting engineering standards (1 fc ≈ 10.76391 lx).',
  },
  viscosity: {
    dimension: 'dynamic fluid shear resistance and internal friction ($M / (L \\cdot T)$)',
    siBase: 'pascal-second (Pa·s)',
    systems: 'SI pascal-seconds (Pa·s), metric millipascal-seconds (mPa·s), and CGS poise/centipoise (cP)',
    contextNote: 'Standardized under ISO 3104 and ASTM D445 with 1 cP defined as exactly 1 mPa·s = 0.001 Pa·s.',
  },
  typography: {
    dimension: 'typographical font sizing, digital screen scaling, and print layout dimensions',
    siBase: 'CSS pixel (px, 1/96 inch reference pixel)',
    systems: 'W3C CSS standard pixels and root-em (rem), alongside traditional DTP points (pt) and picas',
    contextNote: 'Standardized under the W3C CSS Values and Units Module Level 3 where 1 inch is fixed at exactly 96 px and 72 pt (1 pt = 1.33333 px).',
  },
}

// Field Notes & Engineering Gotchas (E-E-A-T & Practical Domain Wisdom)
export const PAIR_FIELD_NOTES: Record<string, { badge: string; title: string; note: string; standard?: string }> = {
  // Mass & Weight
  'troy-ounce-to-gram': {
    badge: 'Jeweler & Bullion Advisory',
    title: 'Troy Ounce vs Avoirdupois Ounce Discrepancy',
    note: 'A Troy Ounce (oz t = 31.1035 g) is approximately 9.7% heavier than a standard US grocery avoirdupois ounce (oz = 28.3495 g). In precious metals trading, mistaking standard ounces for troy ounces leads to significant financial undervaluation.',
    standard: 'NIST SP 811 / US Mint Bullion Specifications',
  },
  'troy-ounce-to-ounce': {
    badge: 'Precious Metals Standard',
    title: '1 oz t = 1.09714 oz Avoirdupois',
    note: 'Because gold and silver are quoted strictly in Troy weight (12 troy ounces per troy pound), never weigh precious metals on conventional grocery scales without applying the 1.09714 multiplier.',
    standard: 'BIPM SI Brochure (9th Edition) & LBMA Rules',
  },
  'kilogram-to-pounds': {
    badge: 'Aerospace & Medical Protocol',
    title: 'Exact Legal Ratio: 1 lb = 0.45359237 kg',
    note: 'The international avoirdupois pound is legally defined as exactly 0.45359237 kg. Critical medical dosing and aviation fuel calculations must never round this to 0.45 or 2.2 without accounting for cumulative patient weight errors.',
    standard: 'ISO 80000-4 / NIST Handbook 44',
  },
  'pounds-to-kilogram': {
    badge: 'Aviation & Clinical Standard',
    title: 'Compound Precision: Multiply by 0.45359237',
    note: 'Aviation weight-and-balance manifests mandate calculating passenger and cargo payloads to 4 decimal places before computing center-of-gravity moments.',
    standard: 'FAA Flight Weight & Balance Handbook',
  },
  // Pressure
  'bar-to-psi': {
    badge: 'HVAC & Automotive Engineering',
    title: 'Gauge (psig) vs Absolute (psia) Offset',
    note: 'Most mechanical tire and pressure gauges measure relative to ambient atmosphere (reading 0 psi at sea level). For thermodynamics, engine boost, and altitude physics, add 14.696 psi (1.01325 bar) to gauge pressure to obtain absolute pressure.',
    standard: 'ASME B40.100 / ISO 5167',
  },
  'psi-to-bar': {
    badge: 'Pneumatics & Scuba Gotcha',
    title: 'Atmospheric Normalization at 1.01325 bar',
    note: '1 standard atmosphere is 1.01325 bar (101.325 kPa), which equals 14.6959 psi. Industrial compressor ratings in bar frequently refer to bar gauge (barg); verify whether your equipment specification requires absolute or differential pressure.',
    standard: 'ISO 80000-4 / DIN EN 837',
  },
  'hectopascal-to-millibar': {
    badge: 'Meteorology & Altimetry',
    title: '1:1 Identical Equivalence',
    note: '1 hectopascal (hPa) is numerically and physically identical to 1 millibar (mbar = 100 Pa). Aviation altimeter subscale settings (QNH) in Europe use hPa, while marine weather barometers historically use mbar.',
    standard: 'WMO Technical Regulations / ICAO Annex 3',
  },
  'inches-of-mercury-to-psi': {
    badge: 'Aviation Barometry',
    title: 'Standard Altimeter Baseline: 29.92 inHg = 14.696 psi',
    note: 'US aircraft altimeters are calibrated to standard atmospheric pressure (29.92 inHg = 1013.25 hPa). Mercury column height varies slightly with ambient temperature, requiring barometric temperature compensation in laboratory manometers.',
    standard: 'NIST Monograph 8 / FAA AIM 7-2-1',
  },
  // Cooking
  'stick-of-butter-to-tablespoon': {
    badge: 'Culinary Metrology',
    title: 'US Customary vs European Butter Blocks',
    note: 'In the United States, 1 standard stick of butter is exactly 8 tablespoons (1/2 cup, 4 oz, or ~113.4 grams). In the UK and Europe, butter is sold in 250 g or 500 g solid blocks; 1 European 250 g block is equivalent to roughly 2.2 US sticks.',
    standard: 'USDA National Nutrient Database',
  },
  // Length
  'meter-to-feet': {
    badge: 'Survey & Architecture Note',
    title: 'Deprecation of the US Survey Foot',
    note: 'On January 1, 2023, the US National Geodetic Survey and NIST officially deprecated the historical US Survey Foot (1200/3937 m) in favor of the International Foot (0.3048 m exactly). In large-scale GIS and civil survey work, always ensure your coordinate projection matches the 1959 International standard.',
    standard: 'Federal Register Notice (85 FR 62698) / NIST SP 811',
  },
  'feet-to-meters': {
    badge: 'Civil Engineering Standard',
    title: 'Exact Metric Definition: 1 ft = 0.3048 m',
    note: 'Because 1 foot is exactly 304.8 millimeters by definition, compounding decimal conversions can be computed without rounding artifacts by dividing feet by 3.280839895 or multiplying by 0.3048.',
    standard: '1959 International Yard and Pound Agreement',
  },
  'angstrom-to-nanometer': {
    badge: 'Semiconductor & Crystallography',
    title: '1 Å = 0.1 nm = 100 pm',
    note: 'The Ångström is non-SI but universally employed in X-ray crystallography and optical coatings because chemical bond lengths and atomic radii range between 1 and 2 Ångströms.',
    standard: 'IUCr International Tables for Crystallography',
  },
  'fathom-to-foot': {
    badge: 'Nautical Hydrography',
    title: 'Traditional Depth Measure: 1 fathom = 6 ft',
    note: '1 fathom equals exactly 6 feet (1.8288 m), originally defined as the span of an adult sailor\'s outstretched arms. Modern bathymetric charts predominantly use meters, but nautical paper charts in US waters still report fathom depths.',
    standard: 'NOAA Office of Coast Survey Standards',
  },
  // Data
  'gibibyte-to-gigabyte': {
    badge: 'SysAdmin & Storage Architecture',
    title: 'Binary (1024³) vs Decimal (1000³) Discrepancy',
    note: 'Operating systems like Windows calculate file system capacities in binary gibibytes (1 GiB = 1024³ bytes), whereas drive manufacturers label hard drives in decimal gigabytes (1 GB = 1000³ bytes). A physical 1 TB drive has 1,000,000,000,000 bytes, which equals 931.32 GiB in Windows.',
    standard: 'IEC 80000-13 / IEEE 1541',
  },
  // Torque
  'newton-meter-to-pound-inch': {
    badge: 'Machinist & Fastener Caution',
    title: 'Pound-Foot vs Pound-Inch Confusion',
    note: 'Never confuse pound-inches (lb-in) with pound-feet (lb-ft). 1 N·m is 8.8507 lb-in, but only 0.7376 lb-ft. Torquing a fastener to 25 lb-ft instead of 25 lb-in applies 12 times the intended torque, shearing small bolts and stripping aluminum threads.',
    standard: 'ISO 6789 / ASME B107.14',
  },
  'pound-foot-to-pound-inch': {
    badge: 'Automotive Mechanics',
    title: 'Exact Factor of 12',
    note: '1 pound-foot equals exactly 12 pound-inches. Bicycle stems and small engine valve covers specify lb-in, while cylinder head bolts specify lb-ft. Always verify the scale on your click torque wrench before tightening.',
    standard: 'SAE J1701 / ASME B107.300',
  },
  // Power
  'metric-horsepower-to-kilowatt': {
    badge: 'Automotive Dyno Standards',
    title: 'Metric HP (PS/CV) vs Mechanical HP (hp)',
    note: 'Metric horsepower (Pferdestärke / PS) equals 735.49875 W, whereas imperial mechanical horsepower equals 745.69987 W. A European car rated at 300 PS produces 220.65 kW, which translates to 295.9 mechanical hp.',
    standard: 'DIN 70020 / ISO 1585',
  },
  'ton-of-refrigeration-to-btu-h': {
    badge: 'HVAC Plant Engineering',
    title: 'Latent Heat of Ice Melting: 1 TR = 12,000 BTU/h',
    note: 'One refrigeration ton (TR) represents the rate of heat extraction required to freeze one short ton (2,000 lb) of water at 32°F into ice in 24 hours (12,000 BTU/h or ~3.51685 kW).',
    standard: 'ASHRAE Handbook / AHRI 550/590',
  },
  // Temperature
  'celsius-to-fahrenheit': {
    badge: 'Thermodynamics & Meteorology',
    title: 'Equal Point at -40° and Scale Offsets',
    note: 'Celsius and Fahrenheit intersect at exactly -40° (-40°C = -40°F). Because temperature is an affine scale with non-zero intercept, relative temperature differences (ΔT) must not include the +32 offset: a change of 10°C equals a change of 18°F, not 50°F.',
    standard: 'BIPM SI Brochure (9th Edition) / ITS-90',
  },
  // Flow Rate
  'gallon-per-minute-to-liter-per-minute': {
    badge: 'Pumping & Piping Systems',
    title: 'US Liquid Gallon vs Imperial Gallon Flow',
    note: 'Standard US GPM uses 3.78541 L/min. UK and Commonwealth water works historically used Imperial GPM (4.54609 L/min), which is 20% greater volume per minute.',
    standard: 'Hydraulic Institute (HI) Standards / AWWA',
  },
  // Illuminance
  'foot-candle-to-lux': {
    badge: 'Architectural Lighting Design',
    title: '1 fc = 10.7639 lux (Square Foot to Square Meter)',
    note: 'A foot-candle represents 1 lumen per square foot, while lux represents 1 lumen per square meter. Because 1 m² = 10.7639 ft², multiplying foot-candles by ~10.76 yields exact lux.',
    standard: 'IESNA Lighting Handbook / EN 12464-1',
  },
  // Viscosity
  'centipoise-to-pascal-second': {
    badge: 'Rheology & Lubrication',
    title: '1 cP = 1 mPa·s = 0.001 Pa·s (Water Baseline)',
    note: 'At 20°C, liquid water has a dynamic viscosity of almost exactly 1.002 cP (1.002 mPa·s). Centipoise remains the dominant unit in petrochemical, paint, and polymer processing.',
    standard: 'ASTM D445 / ISO 3104',
  },
  // Typography
  'pixel-to-point': {
    badge: 'Digital Publishing & DTP',
    title: '96 DPI Screen vs 72 DPI PostScript Point',
    note: 'In modern CSS, 1 inch equals exactly 96 CSS pixels and 72 PostScript typographical points (pt). Thus, 1 pt equals 1.3333 CSS pixels, and 16 px equals 12 pt.',
    standard: 'W3C CSS Values and Units Level 3 / Adobe PostScript',
  },
}

export const CATEGORY_FIELD_NOTES: Record<string, { badge: string; title: string; note: string; standard?: string }> = {
  length: {
    badge: 'Dimensional Metrology',
    title: 'SI Base Traceability',
    note: 'All international length measures trace to the speed of light in vacuum (c = 299,792,458 m/s). 1 inch is legally fixed at exactly 25.4 mm.',
    standard: 'NIST SP 811 / ISO 80000-3',
  },
  mass: {
    badge: 'Metrology Traceability',
    title: 'Planck Constant Definition',
    note: 'Since 2019, the kilogram is defined by fixing the Planck constant h = 6.62607015 × 10⁻³⁴ J·s. All imperial mass units derive directly from this definition.',
    standard: 'BIPM SI Brochure (9th Edition)',
  },
  volume: {
    badge: 'Volumetric Calibration',
    title: 'Thermal Expansion & Calibration',
    note: 'Liquid volumes expand with temperature. Standard volumetric glassware and hydrometers are calibrated at 20°C (68°F).',
    standard: 'ASTM E288 / ISO 4787',
  },
  pressure: {
    badge: 'Atmospheric Physics',
    title: 'Standard Atmospheric Baseline',
    note: 'Standard atmospheric pressure at mean sea level is defined as 101,325 Pa (1.01325 bar = 14.6959 psi = 760 mmHg).',
    standard: 'ISO 2533 / Standard Atmosphere',
  },
  temp: {
    badge: 'Thermodynamics',
    title: 'Absolute Zero Reference',
    note: 'Thermodynamic temperature begins at Absolute Zero (0 K = -273.15°C = -459.67°F), where molecular kinetic energy is minimal.',
    standard: 'BIPM SI Brochure (9th Edition)',
  },
  power: {
    badge: 'Electromechanical Conversion',
    title: 'Mechanical vs Electrical Horsepower',
    note: 'Mechanical horsepower is fixed at 550 ft·lbf/s (≈745.7 W), while electrical horsepower is defined as exactly 746 W.',
    standard: 'IEEE Standards / ISO 80000-4',
  },
  energy: {
    badge: 'Work & Heat Thermodynamics',
    title: 'First Law Equivalence: 1 cal = 4.184 J',
    note: 'The mechanical equivalent of heat sets 1 thermochemical calorie to exactly 4.184 Joules. 1 kilowatt-hour equals exactly 3.6 Megajoules.',
    standard: 'ISO 80000-5 / CODATA',
  },
  data: {
    badge: 'Digital Information Standard',
    title: 'Binary vs Decimal Multiples',
    note: 'IEC 80000-13 standardizes binary prefixes (KiB = 1024 B, MiB = 1024² B) to distinguish them from SI decimal prefixes (kB = 1000 B, MB = 1000² B).',
    standard: 'IEC 80000-13 / IEEE 1541',
  },
  torque: {
    badge: 'Mechanical Engineering',
    title: 'Rotational Moment vs Energy',
    note: 'Although both torque (N·m) and energy (Joules) have identical SI base dimensions (kg·m²/s²), torque is a vector cross product and is never expressed in Joules.',
    standard: 'ISO 80000-4',
  },
  cooking: {
    badge: 'Culinary Precision',
    title: 'Weight vs Volume in Recipes',
    note: 'Professional baking recipes mandate mass (grams) over volume (cups) because ingredient settling, humidity, and sifting create up to 20% density fluctuations.',
    standard: 'Culinary Institute of America Standards',
  },
}

// 123 Defensible Practical Use Case Catalog
const PAIR_USE_CASES: Record<string, PairEditorialUseCases[]> = {
  'length:meter-to-feet': [
    { domain: 'Architectural Framing & Blueprints', context: 'Translating European and international metric architectural layouts into feet and inches for US residential framing and construction contractors.' },
    { domain: 'Athletic Track & Field Reporting', context: 'Converting international metric track and field jump distances and race heights for domestic sports broadcasts and imperial record books.' },
    { domain: 'Mountain Hiking & Trail Elevations', context: 'Comparing trail elevation gains, contour lines, and summit heights between international metric topo maps and US quadrangle maps.' },
  ],
  'length:kilometer-to-miles': [
    { domain: 'Cross-Border Road Travel & Navigation', context: 'Planning driving times, highway speed compliance, and fuel intervals when crossing between metric regions (Canada/Europe) and the United States.' },
    { domain: 'Long-Distance Athletic Endurance Training', context: 'Converting 5K, 10K, half-marathon, and marathon race splits and training logs between metric pacing and miles.' },
    { domain: 'Automotive Import & Titling Verification', context: 'Translating odometer mileage readings on imported Japanese and European vehicles for domestic registration and valuation.' },
  ],
  'length:inches-to-centimeter': [
    { domain: 'Consumer Electronics & Display Sizing', context: 'Translating TV, computer monitor, and smartphone screen diagonal specifications into metric dimensions for international buyers.' },
    { domain: 'Apparel Tailoring & Garment Measurements', context: 'Converting body measurements, waist sizing, and inseams between US customary apparel guides and metric sizing tables.' },
    { domain: 'Precision Woodworking & CNC Machining', context: 'Reconciling imperial bolt sizes and drill bit diameters with metric workshop cutting plans and stock materials.' },
  ],
  'length:feet-to-meters': [
    { domain: 'Civil Engineering Tenders & International Bids', context: 'Converting North American structural drawings, span lengths, and building heights into metric specifications for international tenders.' },
    { domain: 'Maritime Navigation & Hydrographic Surveys', context: 'Converting depth soundings and bridge clearance heights from customary feet into international hydrographic metric charts.' },
    { domain: 'Real Estate Appraisals & Commercial Floor Plans', context: 'Translating square footage and ceiling height measurements into metric meters for multinational real estate portfolios.' },
  ],
  'length:centimeter-to-inches': [
    { domain: 'International Freight & Packaging Logistics', context: 'Measuring carton dimensions in centimeters to calculate dimensional weight and courier shipping thresholds in inches.' },
    { domain: 'Graphic Arts & Print Production', context: 'Translating metric poster margins, paper trim sizes, and binding specifications into imperial desktop publishing layouts.' },
    { domain: 'Office Ergonomics & Desk Setup', context: 'Adjusting standing desk heights, monitor arm reaches, and chair clearances between metric product manuals and customary measurements.' },
  ],
  'mass:kilogram-to-pounds': [
    { domain: 'Commercial Aviation Luggage & Air Cargo', context: 'Calculating passenger checked baggage allowances where international ticket limits are posted in kilograms and domestic scales read in pounds.' },
    { domain: 'Competitive Powerlifting & Olympic Weightlifting', context: 'Converting international competition barbell loadings calibrated in kilograms into customary pounds for training logs.' },
    { domain: 'Agricultural Commodity Export Logistics', context: 'Translating wholesale bulk produce weights and livestock measurements between international metric kilograms and US customary pounds.' },
  ],
  'mass:pounds-to-kilogram': [
    { domain: 'Personal Fitness & Bodyweight Logging', context: 'Converting bodyweight logs between imperial pounds and metric kilograms for fitness applications and gym tracking.' },
    { domain: 'International Customs Declarations & Freight', context: 'Preparing commercial export invoices requiring metric kilogram tare and net weight disclosures from US shipping manifests.' },
    { domain: 'Travel Luggage & Suitcase Weighing', context: 'Checking personal luggage weight on household bathroom scales in pounds before traveling on airlines with kilogram baggage limits.' },
  ],
  'mass:ounces-to-grams': [
    { domain: 'Artisan Baking & Pastry Formulation', context: 'Converting delicate baking recipes requiring exact gram baker\'s percentages from traditional US volume and ounce recipes.' },
    { domain: 'Precious Metals & Laboratory Assays', context: 'Converting gold, silver, and precious alloy weights from avoirdupois and troy ounces into metric grams for chemical assaying.' },
    { domain: 'Postal Dispatch & Parcel Postage', context: 'Weighing lightweight international mail and envelopes to ensure compliance with postal bracket thresholds.' },
  ],
  'mass:stone-to-kilogram': [
    { domain: 'UK & Commonwealth Personal Fitness Tracking', context: 'Converting traditional British stone and pound scale readouts into metric kilograms for modern fitness apps.' },
    { domain: 'Combat Sports & Martial Arts Weigh-Ins', context: 'Reconciling British boxing, MMA, and wrestling weight divisions with international metric sanctioning standards.' },
    { domain: 'Historical Genealogy & Military Archives', context: 'Interpreting historic Commonwealth enlistment, medical, and immigration records recorded in stone.' },
  ],
  'mass:metric-ton-to-us-ton': [
    { domain: 'Intermodal Freight & Rail Cargo Logistics', context: 'Reconciling international ocean container shipping manifests in metric tonnes with North American railroad short-ton capacity limits.' },
    { domain: 'Mining Extraction & Bulk Mineral Processing', context: 'Calculating raw ore throughput, smelting yields, and stockpile inventories across multinational extraction ventures.' },
    { domain: 'Civil Infrastructure & Structural Steel Fabrication', context: 'Ordering structural steel beams and rebar tonnage from international mills for domestic civil projects.' },
  ],
  'temp:celsius-to-fahrenheit': [
    { domain: 'International Travel & Weather Forecasts', context: 'Translating overseas ambient weather forecasts into familiar Fahrenheit comfort benchmarks for American travelers.' },
    { domain: 'Culinary Baking & Kitchen Thermostats', context: 'Setting domestic US oven thermostats when preparing European and international baking recipes specified in Celsius.' },
    { domain: 'Building Environmental HVAC Systems', context: 'Calibrating dual-display thermostat controllers, chillers, and heat pump cooling thresholds in commercial buildings.' },
  ],
  'temp:fahrenheit-to-celsius': [
    { domain: 'Scientific Laboratory Environmental Monitoring', context: 'Converting incubator, water bath, and ambient laboratory temperature logs from US equipment into standard SI Celsius.' },
    { domain: 'International Cuisine & Expat Kitchens', context: 'Converting American cookbook baking temperatures for home cooks utilizing Celsius-calibrated European ovens.' },
    { domain: 'Industrial Machinery Import & Maintenance', context: 'Translating US machinery temperature safety cutoffs and operating ranges into metric SCADA process systems.' },
  ],
  'temp:celsius-to-kelvin': [
    { domain: 'Thermodynamics & Physical Chemistry Calculations', context: 'Inputting laboratory temperatures into thermodynamic equations including the Ideal Gas Law ($PV = nRT$) and entropy calculations.' },
    { domain: 'Cryogenic Science & Laboratory Physics', context: 'Comparing liquid nitrogen (-196 °C = 77.15 K) and dry ice temperatures between Celsius and thermodynamic Kelvin scales.' },
    { domain: 'Meteorology & Planetary Atmospheric Physics', context: 'Calculating atmospheric lapse rates, radiative heat balance, and blackbody emission spectra.' },
  ],
  'temp:kelvin-to-celsius': [
    { domain: 'Observational Astronomy & Stellar Physics', context: 'Converting effective stellar surface temperatures and cosmic background radiation parameters into intuitive laboratory Celsius.' },
    { domain: 'Materials Science & Superconductivity Research', context: 'Translating critical transition temperatures ($T_c$) of advanced ceramic superconductors into working Celsius scales.' },
    { domain: 'Semiconductor Fabrication & Thermal Annealing', context: 'Converting furnace process specifications between thermodynamic modeling and manufacturing equipment displays.' },
  ],
  'temp:fahrenheit-to-kelvin': [
    { domain: 'Thermodynamics Coursework & Physics Study', context: 'Converting ambient temperature benchmarks in Fahrenheit to Kelvin for undergraduate thermodynamic problem sets.' },
    { domain: 'Deep-Freeze Food Storage & Industrial Freezers', context: 'Relating sub-zero commercial freezer ratings in Fahrenheit to thermodynamic Kelvin temperatures.' },
    { domain: 'High-Temperature Industrial Combustion', context: 'Modeling gas turbine and industrial boiler flame dynamics between engineering CAD software and thermodynamic physics.' },
  ],
  'area:square-meters-to-square-feet': [
    { domain: 'Commercial Real Estate Leasing & Appraisal', context: 'Converting international office floor plates and lease contracts into North American rentable square feet.' },
    { domain: 'Flooring Installation & Material Estimation', context: 'Estimating carpet, hardwood, and ceramic tile materials from architectural floor plans drawn in metric meters.' },
    { domain: 'Interior Space Planning & Hospitality Design', context: 'Evaluating furniture layouts, guest room scale, and conference hall occupant capacities from global drawings.' },
  ],
  'area:acres-to-hectares': [
    { domain: 'Agricultural Farmland Sales & Agribusiness', context: 'Translating US farm and ranch acreage for international agricultural trade, crop yield benchmarking, and EU filings.' },
    { domain: 'Forestry & Environmental Conservation', context: 'Mapping national park boundaries, wildfire burn areas, and reforestation projects onto international GIS layers.' },
    { domain: 'Utility-Scale Solar & Wind Development', context: 'Evaluating land acquisition acreage requirements for multinational renewable energy projects.' },
  ],
  'area:square-feet-to-square-meters': [
    { domain: 'Global Architectural Submissions & Tenders', context: 'Preparing North American architectural designs and commercial proposals for international zoning and municipal approvals.' },
    { domain: 'Corporate Carbon & Energy Auditing', context: 'Standardizing facility floor area for global greenhouse gas emissions reporting and energy efficiency certifications.' },
    { domain: 'International Hotel Development & Franchising', context: 'Standardizing guest suite dimensions and public amenity areas across global hospitality brands.' },
  ],
  'area:hectares-to-acres': [
    { domain: 'International Land Investment & Timberland', context: 'Evaluating overseas agricultural land parcels, vineyards, and timberland investments for North American buyers.' },
    { domain: 'Geospatial Mapping & Cadastral Surveys', context: 'Converting satellite property boundaries and global municipal survey data into customary deeds.' },
    { domain: 'Conservation Biology & Wildlife Habitats', context: 'Comparing multinational ecological preserves and wildlife corridors with domestic public land benchmarks.' },
  ],
  'area:square-kilometers-to-square-miles': [
    { domain: 'Regional Demographics & Density Studies', context: 'Comparing municipal land areas and metropolitan population densities between international and US census records.' },
    { domain: 'Geophysical & Natural Disaster Impact Analysis', context: 'Evaluating storm surge zones, seismic rupture areas, and wildfire perimeters on regional maps.' },
    { domain: 'Regional Transit & Urban Planning', context: 'Evaluating urban growth boundaries, transit catchment corridors, and municipal utility service areas.' },
  ],
  'volume:liters-to-gallons': [
    { domain: 'Automotive Fuel Efficiency & Cross-Border Driving', context: 'Calculating fuel purchase volumes and fuel range when driving between metric gas stations and US customary pumps.' },
    { domain: 'Beverage Bottling & Commercial Distribution', context: 'Converting wine, spirits, and dairy bulk processing volumes into US retail gallon packaging formats.' },
    { domain: 'Aquaculture & Commercial Water Treatment', context: 'Calculating chemical water treatment dosages and filtration pump sizing based on reservoir liter capacities.' },
  ],
  'volume:gallons-to-liters': [
    { domain: 'Vehicle Importation & Registration Compliance', context: 'Calculating engine coolant, transmission fluid, and fuel tank capacities for vehicles imported into metric countries.' },
    { domain: 'Marine Bunkering & Commercial Vessels', context: 'Reconciling domestic US fuel delivery receipts in gallons with vessel fuel sounding tables logged in metric liters.' },
    { domain: 'Industrial Chemical Manufacturing & Mixing', context: 'Converting batch manufacturing recipes specified in US gallons for European automated chemical plant reactors.' },
  ],
  'volume:milliliters-to-fluid-ounces': [
    { domain: 'Culinary Mixology & Specialty Beverage Recipes', context: 'Converting precise European cocktail and culinary syrups into US customary bar measurements.' },
    { domain: 'Cosmetics & Personal Care Packaging', context: 'Packaging liquid skincare serums, perfumes, and lotions for dual-market international compliance.' },
    { domain: 'Travel Liquid Sizing & Airport Carry-On', context: 'Checking travel-size shampoo, sunscreen, and cosmetic bottles in milliliters against airline 3.4 fluid ounce limits.' },
  ],
  'volume:cubic-meters-to-cubic-feet': [
    { domain: 'Ocean Container Freight & Stowage Planning', context: 'Calculating cargo volume (CBM) to optimize 20-foot and 40-foot ocean container packing and air cargo charges.' },
    { domain: 'HVAC Ventilation & Cleanroom Engineering', context: 'Converting airflow delivery rates and room air exchange volumes between metric designs and imperial blowers.' },
    { domain: 'Bulk Aggregate & Concrete Placement', context: 'Ordering sand, gravel, and ready-mix concrete for international civil construction projects.' },
  ],
  'volume:quarts-to-liters': [
    { domain: 'Commercial Foodservice & Catering Operations', context: 'Scaling large-batch soup, sauce, and dressing recipes from US kitchen quarts to commercial metric kettles.' },
    { domain: 'Automotive Engine Oil & Lubricant Maintenance', context: 'Purchasing engine oil containers in metric markets for domestic vehicles specifying multi-quart crankcases.' },
    { domain: 'Educational Chemistry & Biological Science Labs', context: 'Measuring reagent solutions and buffer preparations in educational laboratory settings.' },
  ],
  'speed:km-h-to-mph': [
    { domain: 'Cross-Border Highway Navigation & Speed Limits', context: 'Interpreting highway speed limit signs and vehicle digital head-up displays when driving between Canada, Mexico, and the US.' },
    { domain: 'Sports Ballistics & Radar Speed Tracking', context: 'Translating international tennis serve speeds and soccer ball velocities into miles per hour for North American sports media.' },
    { domain: 'Accident Reconstruction & Forensic Telematics', context: 'Converting electronic control module (ECM) crash telemetry from metric km/h into statutory speed limits.' },
  ],
  'speed:mph-to-km-h': [
    { domain: 'International Driving & Rental Car Operation', context: 'Navigating European, Australian, and worldwide motorways with speedometers calibrated in statute miles per hour.' },
    { domain: 'Commercial Aviation Ground Speed Analysis', context: 'Translating low-altitude radar ground speed figures into metric meteorological wind reports.' },
    { domain: 'Automotive Performance Testing & Benchmarking', context: 'Comparing North American 0-60 mph vehicle acceleration benchmarks with international 0-100 km/h testing.' },
  ],
  'speed:knots-to-mph': [
    { domain: 'Maritime Navigation & Coastal Boating', context: 'Translating nautical chart cruise speeds and tidal current velocities into statute land miles for recreational boaters.' },
    { domain: 'Recreational Boating & Watersports', context: 'Translating marine GPS speedometer readings in nautical knots to familiar statute miles per hour for wakeboarding and lake boating.' },
    { domain: 'Marine Weather Advisories & Storm Tracking', context: 'Interpreting hurricane wind speed advisories and gale warnings posted in nautical knots for onshore civil authorities.' },
  ],
  'speed:m-s-to-km-h': [
    { domain: 'Meteorological Anemometer & Wind Reporting', context: 'Converting raw weather station anemometer readings in meters per second into public broadcast storm speed figures.' },
    { domain: 'Ballistics & Projectile Aerodynamics', context: 'Analyzing bullet muzzle velocities, aerodynamic drag coefficients, and flight times in kinetic ballistic software.' },
    { domain: 'Athletic Sprint Biomechanics', context: 'Translating Olympic 100m sprint velocity meters per second into vehicle-equivalent kilometer per hour speeds.' },
  ],
  'speed:mach-to-km-h': [
    { domain: 'Aviation Education & Acoustics Demonstration', context: 'Explaining the speed of sound at sea level (Mach 1 ≈ 1,225 km/h) for science journalism and aviation enthusiasm.' },
    { domain: 'Astronomy & High-Altitude Science Articles', context: 'Communicating high-speed atmospheric phenomena and meteor re-entry velocities in accessible km/h figures.' },
    { domain: 'Aerodynamics Coursework & Shockwave Physics', context: 'Introducing supersonic fluid dynamics and shockwave phenomena in introductory engineering physics.' },
  ],
  'time:hours-to-minutes': [
    { domain: 'Professional Consulting & Project Billing', context: 'Converting fractional consultant hours and time tracking records into granular billing and payroll minutes.' },
    { domain: 'Transit & Flight Connection Scheduling', context: 'Calculating flight layover durations, train connection windows, and total itinerary travel times.' },
    { domain: 'Broadcast Media & Audio/Video Post-Production', context: 'Timing television commercial blocks, podcast episode runtimes, and digital video timelines.' },
  ],
  'time:days-to-hours': [
    { domain: 'Intermodal Freight & Supply Chain Transit', context: 'Calculating shipment transit times, port demurrage windows, and express freight delivery commitments.' },
    { domain: 'Warranty Windows & Return Periods', context: 'Calculating consumer return deadlines and service trial guarantee windows from days to remaining hours.' },
    { domain: 'Construction Project Management & Milestones', context: 'Breaking down multi-day construction phases into specific labor shift and equipment rental hours.' },
  ],
  'time:minutes-to-seconds': [
    { domain: 'Athletic Interval Training & Sprint Splits', context: 'Measuring high-intensity interval training (HIIT) durations and competition track split times.' },
    { domain: 'Telecommunications & Cloud Function Billing', context: 'Calculating cloud server execution timeouts and serverless compute execution billing intervals.' },
    { domain: 'Laboratory Chemical Assay Incubation', context: 'Timing precise biochemical enzymatic reactions, centrifuge runs, and diagnostic test incubation periods.' },
  ],
  'time:weeks-to-days': [
    { domain: 'Obstetric & Gestational Milestones', context: 'Tracking pregnancy progression and fetal development stages by exact calendar days from gestational weeks.' },
    { domain: 'Contractor Sprint Scheduling & Agile Planning', context: 'Breaking down multi-week software development sprints into daily standup task commitments.' },
    { domain: 'Academic Terms & Instructional Schedules', context: 'Calculating instructional classroom days from institutional semester calendars.' },
  ],
  'time:years-to-days': [
    { domain: 'Financial Debt Securities & Interest Accrual', context: 'Applying exact day-count conventions (Actual/365, Actual/360) for municipal bond and mortgage interest accrual.' },
    { domain: 'Astronomical Orbital Period Modeling', context: 'Calculating planetary and satellite orbital periods, accounting for leap year calendar shifts.' },
    { domain: 'Industrial Equipment Depreciation & Warranties', context: 'Calculating warranty expiration dates and straight-line capital equipment depreciation schedules.' },
  ],
  'energy:joules-to-calories': [
    { domain: 'Nutritional Science & Dietary Labeling', context: 'Translating international food packaging energy values in kilojoules into consumer nutritional calories.' },
    { domain: 'Exercise Physiology & Ergometer Testing', context: 'Converting mechanical work recorded by cycle ergometers in joules into metabolic calories expended.' },
    { domain: 'Thermodynamics & Mechanical Heat Equivalence', context: 'Demonstrating the mechanical equivalent of heat in laboratory physics and chemistry education.' },
  ],
  'energy:kwh-to-btu': [
    { domain: 'Building HVAC Efficiency & Energy Audits', context: 'Comparing electric heat pump energy consumption with natural gas furnace heating capacity.' },
    { domain: 'Utility Bill Analysis & Energy Modeling', context: 'Reconciling electric meter kilowatt-hour consumption with building thermal load calculations.' },
    { domain: 'Industrial Boiler & Chiller Sizing', context: 'Determining total British Thermal Unit heating requirements from electrical power inputs.' },
  ],
  'energy:calories-to-joules': [
    { domain: 'Bomb Calorimetry & Combustion Chemistry', context: 'Converting chemical combustion heat measured in calories into standard SI thermodynamic joules.' },
    { domain: 'Sports Nutrition & Metabolic Rate Modeling', context: 'Translating basal metabolic rate dietary intake into SI units for scientific publication.' },
    { domain: 'Ecosystem Energetics & Biomass Energy', context: 'Quantifying solar energy capture and food web trophic energy transfers in ecological studies.' },
  ],
  'energy:ev-to-joules': [
    { domain: 'Quantum Mechanics & Particle Physics', context: 'Converting subatomic particle kinetic energies and accelerator beam energies into SI joules.' },
    { domain: 'Semiconductor Bandgap & Solar Photovoltaics', context: 'Analyzing semiconductor bandgap absorption thresholds (e.g. 1.1 eV for silicon) in joules.' },
    { domain: 'Spectroscopy & Molecular Ionization', context: 'Calculating molecular bond dissociation energies and photon emission wavelengths.' },
  ],
  'energy:btu-to-kwh': [
    { domain: 'Building Electrification & Heat Pump Transitions', context: 'Calculating electrical power required to replace legacy heating oil and natural gas heating systems.' },
    { domain: 'Commercial Refrigeration & Food Storage', context: 'Sizing electrical substation supply capacity for cold storage warehouse refrigeration plants.' },
    { domain: 'District Steam Energy Accounting', context: 'Billing municipal steam heating customers by converting thermal steam heat into kilowatt-hours.' },
  ],
  'pressure:psi-to-bar': [
    { domain: 'Automotive Tire Pressure Maintenance', context: 'Converting vehicle tire specifications in US psi to European bar inflation gauges.' },
    { domain: 'Scuba Diving Cylinder Pressure Inspection', context: 'Interpreting breathing gas cylinder pressures on international diving trips with bar-calibrated gauges.' },
    { domain: 'Industrial Pneumatics & Hydraulic Machinery', context: 'Adjusting system pressure relief valves and compressor regulators on European industrial equipment.' },
  ],
  'pressure:bar-to-psi': [
    { domain: 'Imported Machinery Calibration & Workshop Air', context: 'Configuring European workshop air compressors and hydraulic presses for North American operators.' },
    { domain: 'Motorsport & Track Day Tire Pressure Tuning', context: 'Converting tire manufacturer recommended track hot pressures from bar into digital US psi gauges.' },
    { domain: 'Industrial Gas Cylinder Manifold Regulation', context: 'Regulating specialty gas delivery manifolds calibrated in metric bar for domestic factory use.' },
  ],
  'pressure:atm-to-psi': [
    { domain: 'Atmospheric Physics & Weather Science', context: 'Relating standard sea-level atmospheric pressure (1 atm) to engineering pressure in psi.' },
    { domain: 'Recreational Scuba Diving Theory', context: 'Calculating theoretical hydrostatic water pressures in atmospheres and converting to psi for dive table study.' },
    { domain: 'Meteorology & Barometer Comparisons', context: 'Comparing standard sea-level atmospheric pressure (1 atm) to domestic weather station readings in psi.' },
  ],
  'pressure:pascals-to-psi': [
    { domain: 'HVAC Cleanroom Differential Pressure Monitoring', context: 'Converting sensitive micro-manometer cleanroom air pressure readings from pascals to psi.' },
    { domain: 'Structural Wind Engineering & Building Envelopes', context: 'Translating wind tunnel surface pressure distributions into building envelope structural design loads.' },
    { domain: 'Acoustic Sound Pressure & Loudspeaker Testing', context: 'Evaluating acoustic pressure wave amplitudes in loudspeaker development and soundproofing audits.' },
  ],
  'pressure:mmhg-to-atm': [
    { domain: 'Barometric Science & Historical Metrology', context: 'Relating traditional mercury column heights (760 mmHg) to standard atmospheric pressure (1 atm).' },
    { domain: 'Laboratory Vacuum Distillation', context: 'Monitoring low-pressure chemical distillation boiling points on mercury manometers.' },
    { domain: 'Pharmaceutical Freeze-Drying & Lyophilization', context: 'Controlling chamber vacuum sublimation pressures during drug freeze-drying cycles.' },
  ],
  'power:horsepower-to-kilowatts': [
    { domain: 'Automotive Engine Ratings & EV Comparisons', context: 'Converting traditional internal combustion horsepower into kilowatts for electric vehicle comparisons and EU taxation.' },
    { domain: 'Industrial Electric Motor Specification', context: 'Replacing imperial factory motors and pump drives with metric three-phase industrial motors.' },
    { domain: 'Marine Propulsion & Yacht Sizing', context: 'Standardizing inboard diesel engine power ratings across North American and European shipbuilders.' },
  ],
  'power:kilowatts-to-horsepower': [
    { domain: 'Electric Vehicle Consumer Marketing', context: 'Translating modern electric vehicle kilowatt drivetrain ratings into familiar automotive horsepower.' },
    { domain: 'Agricultural Tractor & Machinery Evaluation', context: 'Comparing power take-off (PTO) ratings between European tractors and North American farm equipment.' },
    { domain: 'Emergency Standby Generator Installation', context: 'Sizing commercial emergency diesel generators to drive industrial pump and motor loads.' },
  ],
  'power:watts-to-btu-h': [
    { domain: 'Data Center Cooling & Server Rack Thermal Loads', context: 'Calculating air conditioning cooling requirements (BTU/h) from server equipment electrical wattage.' },
    { domain: 'Industrial Electrical Enclosure Thermal Design', context: 'Sizing panel air conditioners and exhaust fans to dissipate heat generated by variable frequency drives.' },
    { domain: 'Residential Architectural Cooling Calculations', context: 'Modeling interior thermal heat gain from consumer electronics and lighting fixtures.' },
  ],
  'power:mw-to-kw': [
    { domain: 'Utility-Scale Renewable Power Generation', context: 'Reporting solar farm, wind turbine, and hydroelectric facility output to distribution grid operators.' },
    { domain: 'High-Voltage Substation Transformer Capacity', context: 'Monitoring transmission substation transformer loading against regional municipal power demands.' },
    { domain: 'Industrial Plant Peak Demand Management', context: 'Tracking heavy manufacturing electrical consumption to avoid peak-demand utility surcharges.' },
  ],
  'power:horsepower-to-watts': [
    { domain: 'Small Engine & Consumer Appliance Engineering', context: 'Converting lawnmower, snowblower, and shop vac power ratings into electrical wattage equivalents.' },
    { domain: 'Exercise Ergometer & Human Power Testing', context: 'Measuring athletic sprint power output on cycling ergometers relative to fractional mechanical horsepower.' },
    { domain: 'Fluid Pump & Air Compressor Calculations', context: 'Determining electrical motor input wattage needed to deliver fluid mechanical horsepower.' },
  ],
  'force:newtons-to-pound-force': [
    { domain: 'Materials Testing & Tensile Strength Audits', context: 'Converting universal testing machine load cell measurements from newtons into imperial engineering reports.' },
    { domain: 'Structural Anchor & Fastener Engineering', context: 'Verifying concrete anchor pull-out ratings and shear resistance against building code specifications.' },
    { domain: 'Fitness Cable Machine Resistance', context: 'Comparing selectorized weight stack resistance between international gym machines labeled in newtons and US customary pounds.' },
  ],
  'force:pound-force-to-newtons': [
    { domain: 'Finite Element Analysis (FEA) Structural Simulations', context: 'Inputting mechanical load vectors into CAD engineering simulation software standardized on SI units.' },
    { domain: 'Automotive Crash Safety & Restraint Systems', context: 'Converting seatbelt pretensioner tension and barrier impact loads into international safety metrics.' },
    { domain: 'Robotics Joint Torque & Actuator Sizing', context: 'Selecting robotic arm linear actuators specified in newtons to satisfy US design payload requirements.' },
  ],
  'force:kn-to-lbf': [
    { domain: 'Civil Structural Engineering & Heavy Hoisting', context: 'Converting crane lifting capacities, bridge bearing loads, and foundation pile ratings to imperial units.' },
    { domain: 'Rigging Hardware & Cable Tension Verification', context: 'Calculating wire rope, synthetic sling, and shackle working load limits on industrial construction sites.' },
    { domain: 'Rock Climbing Gear Ratings', context: 'Translating carabiner and harness breaking strength ratings stamped in kilonewtons (kN) to familiar pounds of force.' },
  ],
  'force:dynes-to-newtons': [
    { domain: 'Surface Tension & Colloid Chemistry', context: 'Converting interfacial surface tension measurements of liquid coatings and emulsions into SI newtons.' },
    { domain: 'Micro-Electro-Mechanical Systems (MEMS)', context: 'Calculating micro-scale electrostatic and magnetic actuation forces in silicon MEMS sensors.' },
    { domain: 'Geological Tectonic Fault Slip Mechanics', context: 'Analyzing micro-frictional stresses and crack propagation forces along seismic rupture surfaces.' },
  ],
  'force:kgf-to-n': [
    { domain: 'Legacy European & Asian Machinery Operation', context: 'Translating technical load ratings from vintage presses and Japanese machine tools to modern newtons.' },
    { domain: 'Ergonomic Workplace Push/Pull Evaluations', context: 'Measuring manual material handling forces on industrial carts to ensure worker physical safety.' },
    { domain: 'Mechanical Spring Calibration & Testing', context: 'Calibrating mechanical compression and extension springs against legacy kilogram-force specifications.' },
  ],
  'data:mb-to-gb': [
    { domain: 'Cellular Mobile Data Management', context: 'Tracking monthly data plan consumption, application updates, and streaming video usage against gigabyte caps.' },
    { domain: 'Computer System RAM Allocation', context: 'Allocating memory to virtual machines, Docker containers, and database buffer pools.' },
    { domain: 'Cloud Storage & Photo Archival Planning', context: 'Estimating cloud backup storage capacity required for high-resolution photo libraries.' },
  ],
  'data:gb-to-mb': [
    { domain: 'Software Installation & Disk Space Auditing', context: 'Verifying available local disk space prior to installing major software applications and updates.' },
    { domain: 'Email & Online File Upload Portals', context: 'Ensuring compressed file attachments meet maximum file size upload constraints.' },
    { domain: 'Database Backup & SQL Dump Management', context: 'Estimating disk transfer time and storage required for relational database archive dumps.' },
  ],
  'data:gb-to-tb': [
    { domain: 'Storage Hardware & SSD Drive Sizing', context: 'Selecting external hard drives, NAS network storage systems, and enterprise server storage arrays.' },
    { domain: 'Enterprise Cloud Backup & Archival Budgets', context: 'Calculating monthly recurring storage costs for enterprise multi-terabyte cloud backups.' },
    { domain: 'Video Production & Digital Cinema Storage', context: 'Estimating storage footprints for 4K and 8K uncompressed video footage on commercial shoots.' },
  ],
  'data:kb-to-mb': [
    { domain: 'Web Performance Optimization & Core Web Vitals', context: 'Auditing JavaScript bundles, web fonts, and optimized images to minimize browser download latency.' },
    { domain: 'IoT Sensor Telemetry & Bandwidth Budgets', context: 'Calculating monthly data transmission payloads for low-power remote IoT sensor gateways.' },
    { domain: 'Document Archival & PDF Compression', context: 'Compressing scanned legal documents and reports for web portal submission requirements.' },
  ],
  'data:bits-to-bytes': [
    { domain: 'Internet Connection Speed vs Download Speed', context: 'Understanding why an 800 Mbps internet connection downloads files at approximately 100 MB/s.' },
    { domain: 'Low-Level Binary Protocols & Networking', context: 'Calculating packet headers, bitmasks, and payload byte alignment in network device drivers.' },
    { domain: 'Cryptographic Key Sizes & Hashing Algorithms', context: 'Relating encryption key lengths (e.g. 256-bit AES) to raw 32-byte binary buffers.' },
  ],
  'fuel:mpg-us-to-l-100km': [
    { domain: 'International Vehicle Comparisons & Reviews', context: 'Translating US EPA window sticker fuel economy figures into metric consumption for overseas car shoppers.' },
    { domain: 'Cross-Border Road Trip Fuel Budgeting', context: 'Estimating fuel costs when driving US-registered vehicles across Canada, Mexico, and Europe.' },
    { domain: 'Corporate Fleet Greenhouse Gas Reporting', context: 'Converting fleet average fuel economy metrics into standardized metric emissions reports.' },
  ],
  'fuel:l-100km-to-mpg-us': [
    { domain: 'Imported Vehicle Fuel Economy Verification', context: 'Converting European and Asian WLTP fuel consumption ratings into familiar US EPA MPG figures.' },
    { domain: 'Automotive Journalism & International Road Tests', context: 'Reviewing global vehicle launches and international road tests for North American readers.' },
    { domain: 'Consumer Hybrid & Diesel Efficiency Analysis', context: 'Comparing foreign-market fuel-efficient diesel and hybrid models with domestic US vehicles.' },
  ],
  'fuel:km-l-to-mpg-us': [
    { domain: 'Japanese Domestic Market (JDM) Imports', context: 'Translating domestic fuel economy ratings in km/L from Japanese auction sheets into US MPG.' },
    { domain: 'Motorcycle & High-Efficiency Scooter Testing', context: 'Evaluating high-mileage commuter two-wheelers and scooters rated in kilometers per liter.' },
    { domain: 'Eco-Driving Competitions & Efficiency Rallies', context: 'Comparing fuel efficiency records between international metric teams and customary US drivers.' },
  ],
  'fuel:mpg-uk-to-mpg-us': [
    { domain: 'British vs American Automotive Reviews', context: 'Understanding why UK car reviews quote higher MPG figures due to the larger imperial gallon (4.546 L vs 3.785 L).' },
    { domain: 'Expat Vehicle Ownership & Budgeting', context: 'Reconciling fuel cost expectations when relocating between the UK and the United States.' },
    { domain: 'Classic British Sports Car Restoration', context: 'Interpreting factory owner manual fuel economy ratings on vintage Jaguar, Triumph, and MG automobiles.' },
  ],
  'fuel:l-100km-to-km-l': [
    { domain: 'Vehicle Dashboard Display Configuration', context: 'Switching multi-function vehicle instrument clusters between consumption (L/100km) and range (km/L).' },
    { domain: 'Fleet Driver Coaching & Fuel Economy Tracking', context: 'Providing intuitive real-time fuel conservation feedback to commercial freight drivers.' },
    { domain: 'Rental Car Operation in Europe & Asia', context: 'Adjusting unfamiliar rental car dashboard efficiency readouts to personal reading preferences.' },
  ],
  'angle:degrees-to-radians': [
    { domain: 'Computer Graphics & Game Development', context: 'Passing rotational angles into trigonometric functions (`Math.sin`, `Math.cos`) in 3D graphics engines.' },
    { domain: 'Robotics Kinematics & Motion Planning', context: 'Calculating robotic arm joint angle rotations and end-effector coordinate transformations.' },
    { domain: 'Physics & Orbital Mechanics Simulations', context: 'Computing satellite orbital trajectories, centripetal acceleration, and angular momentum.' },
  ],
  'angle:radians-to-degrees': [
    { domain: 'Scientific Calculator Inverse Trigonometry', context: 'Converting inverse trigonometric calculations (`atan2`, `asin`) back into intuitive degrees.' },
    { domain: 'CAD Drafting & Mechanical Schematics', context: 'Displaying angular dimensions and chamfer angles on mechanical fabrication blueprints.' },
    { domain: 'Maritime & Aviation Compass Navigation', context: 'Translating mathematical orientation vectors into standard compass degrees.' },
  ],
  'angle:degrees-to-gradians': [
    { domain: 'Civil Surveying & Cadastral Mapping', context: 'Converting property boundary bearings for European surveying instruments utilizing the 400-gradian circle.' },
    { domain: 'Underground Tunneling & Mining Alignment', context: 'Guiding underground laser tunneling and mining boring machines calibrated in grads.' },
    { domain: 'Geodetic Triangulation & Artillery Metrology', context: 'Interpreting European topographic surveying charts and specialized artillery sights.' },
  ],
  'angle:arcminutes-to-degrees': [
    { domain: 'Astronomical Telescope Optical Pointing', context: 'Converting celestial object angular coordinates and telescope field-of-view into decimal degrees.' },
    { domain: 'Precision Long-Range Ballistics & Optics', context: 'Adjusting rifle telescopic sight turrets calibrated in minutes of angle (MOA) for target shooting.' },
    { domain: 'Geodetic Latitude & Longitude Coordinates', context: 'Converting nautical and geographic coordinate minutes into decimal degree GIS coordinates.' },
  ],
  'angle:radians-to-mrad': [
    { domain: 'Tactical Optics & Precision Marksmanship', context: 'Converting ballistic bullet drop calculations into milliradian reticle holdovers.' },
    { domain: 'Optical Laser Divergence & Collimation', context: 'Measuring the angular beam expansion of industrial and communications laser systems.' },
    { domain: 'Geodetic Baseline Interferometry', context: 'Measuring ultra-precise angular shifts in continental drift and seismic monitoring arrays.' },
  ],
  'frequency:mhz-to-ghz': [
    { domain: 'Microprocessor Clock Speeds & Computing', context: 'Comparing CPU and GPU clock frequencies across generations from legacy megahertz to modern gigahertz.' },
    { domain: 'Wireless Networking & Wi-Fi Bands', context: 'Understanding frequency allocations across 2.4 GHz, 5 GHz, and 6 GHz wireless network spectrum.' },
    { domain: 'Amateur Radio & Spectrum Coordination', context: 'Coordinating high-frequency (HF) amateur bands with ultra-high frequency (UHF) microwave allocations.' },
  ],
  'frequency:ghz-to-mhz': [
    { domain: 'Radar & Satellite Receiver Downconverters', context: 'Calculating intermediate frequencies (IF) when downconverting satellite microwave signals for demodulation.' },
    { domain: 'Cellular Telecommunications Spectrum Rebanding', context: 'Refarming legacy cellular spectrum bands into modern 5G communications architectures.' },
    { domain: 'RF Test Equipment & Oscilloscope Bandwidth', context: 'Configuring radio frequency spectrum analyzers and oscilloscopes for wireless signal analysis.' },
  ],
  'frequency:khz-to-mhz': [
    { domain: 'Ultrasonic Cleaning & Medical Transducers', context: 'Specifying transducer operating frequencies for industrial ultrasonic cleaners and medical diagnostic imaging.' },
    { domain: 'Medium-Wave AM Radio Broadcasting', context: 'Converting commercial AM radio broadcast frequencies into megahertz spectrum maps.' },
    { domain: 'Marine Radio Navigation & NDB Beacons', context: 'Tuning non-directional aeronautical and maritime navigational radio beacons.' },
  ],
  'frequency:hz-to-khz': [
    { domain: 'Audio Engineering & Studio Acoustics', context: 'Analyzing human audible frequencies (20 Hz to 20 kHz) and configuring studio equalizer crossovers.' },
    { domain: 'Predictive Vibration Analysis & Machinery Health', context: 'Identifying mechanical bearing defect frequencies and gearbox resonance in industrial maintenance.' },
    { domain: 'Electrical Grid Harmonic Distortion Audits', context: 'Analyzing harmonic frequencies produced by industrial power inverters on electrical distribution systems.' },
  ],
  'frequency:rpm-to-hz': [
    { domain: 'Engine & Motor Tachometer Frequency Analysis', context: 'Converting rotational engine speeds (RPM) into fundamental cycling frequencies (Hz) for acoustic tuning.' },
    { domain: 'Centrifuge & Turbomachinery Rotor Balancing', context: 'Determining critical rotational vibration frequencies in high-speed laboratory centrifuges.' },
    { domain: 'Wind Turbine Rotor & Gearbox Monitoring', context: 'Calculating generator shaft rotational frequencies and wind turbine electrical grid synchronization.' },
  ],
  'acceleration:m-s-to-g-force': [
    { domain: 'Aerospace & Combat Flight Physiology', context: 'Monitoring pilot G-force physiological stress during high-acceleration aerobatic and tactical maneuvers.' },
    { domain: 'Automotive Crash Safety & Impact Testing', context: 'Analyzing crash test dummy accelerometer data against Federal Motor Vehicle Safety Standards.' },
    { domain: 'Amusement Park Roller Coaster Design', context: 'Ensuring vertical and lateral roller coaster accelerations remain within safe human biological tolerances.' },
  ],
  'acceleration:g-force-to-m-s': [
    { domain: 'Earthquake Seismology & Structural Design', context: 'Converting peak ground acceleration (PGA) recorded in $g$ into SI units for seismic building codes.' },
    { domain: 'Packaging Transit Shock & Drop Testing', context: 'Certifying protective packaging for delicate electronics against warehouse transit drop impacts.' },
    { domain: 'Aerospace Rocket Launch Acceleration', context: 'Calculating rocket payload stage separation forces and satellite launch vehicle acceleration profiles.' },
  ],
  'acceleration:ft-s-to-m-s': [
    { domain: 'Civil Structural Engineering & Seismic Codes', context: 'Translating American building code seismic acceleration parameters into international metric simulation software.' },
    { domain: 'Elevator & Vertical Transit Ride Comfort', context: 'Evaluating passenger elevator ride quality and acceleration rates against international standards.' },
    { domain: 'Aviation Flight Simulator Actuator Tuning', context: 'Calibrating multi-axis motion base hydraulic actuators for pilot flight training fidelity.' },
  ],
  'electricity:volt-to-kilovolt': [
    { domain: 'Electrical Grid & Power Transmission', context: 'Converting municipal distribution feeder voltages into regional high-voltage transmission grid kilovolts.' },
    { domain: 'Consumer High-Voltage Devices & Demonstrations', context: 'Understanding kilovolt output ratings on electric insect swatters, plasma lighters, and educational physics equipment.' },
    { domain: 'Industrial Dielectric Breakdown Testing', context: 'Testing high-voltage electrical insulation and transformer oil breakdown voltage thresholds.' },
  ],
  'electricity:milliampere-to-ampere': [
    { domain: 'Electronics Hardware Design & Battery Life', context: 'Calculating microcontroller sleep current and battery operating lifespans from milliampere specifications.' },
    { domain: 'Industrial 4-20 mA Process Instrumentation', context: 'Interpreting industrial current loop sensor signals into amperes for programmable logic controllers (PLCs).' },
    { domain: 'USB Charging & Power Bank Capacity', context: 'Comparing smartphone charging adapter ampere ratings with battery capacities and power consumption in milliamperes.' },
  ],
  'electricity:kilo-ohm-to-ohm': [
    { domain: 'Printed Circuit Board (PCB) Assembly', context: 'Reading surface-mount resistor codes and schematic values for electronic circuit assembly.' },
    { domain: 'Audio Equipment & Microphone Impedance', context: 'Matching electrical impedances between audio studio microphones, preamplifiers, and line inputs.' },
    { domain: 'Thermistor Temperature Sensor Calibration', context: 'Translating negative temperature coefficient (NTC) thermistor resistance curves into circuit values.' },
  ],
  'electricity:microfarad-to-farad': [
    { domain: 'DC Power Supply Smoothing & Filtering', context: 'Sizing bulk electrolytic filtering capacitors for AC-to-DC power supply rectification circuits.' },
    { domain: 'Supercapacitor Energy Storage Systems', context: 'Comparing conventional electrolytic capacitor values with high-capacity farad supercapacitor backup banks.' },
    { domain: 'Passive Speaker Crossover Network Design', context: 'Calculating capacitor values for audio crossover high-pass and low-pass filter cutoff frequencies.' },
  ],
  'magnetism:tesla-to-gauss': [
    { domain: 'Magnetic Resonance Imaging (MRI) Safety', context: 'Converting clinical MRI magnetic field ratings (1.5T, 3.0T) into gauss to delineate 5-gauss exclusion zones.' },
    { domain: 'Industrial Magnetic Separation & Chutes', context: 'Specifying neodymium rare-earth magnetic grate strengths for food processing and grain milling.' },
    { domain: 'Thermonuclear Fusion Plasma Confinement', context: 'Measuring magnetic field confinement intensities in experimental tokamak fusion reactors.' },
  ],
  'magnetism:gauss-to-tesla': [
    { domain: 'Hall Effect Sensor Calibration & Robotics', context: 'Converting magnetic field readings from digital gaussmeters into standard SI tesla for robotic navigation.' },
    { domain: 'Geomagnetic Field Mapping & Exploration', context: 'Measuring subtle local variations in the Earth\'s geomagnetic field for geological mineral exploration.' },
    { domain: 'Electromagnetic Shielding Verification', context: 'Evaluating mu-metal attenuation of ambient stray magnetic fields in sensitive electron microscopy rooms.' },
  ],
  'datatransfer:mbps-to-gbps': [
    { domain: 'High-Speed Broadband Internet Evaluation', context: 'Comparing residential and business gigabit fiber internet connections with standard megabit streaming needs.' },
    { domain: 'Enterprise Local Area Network (LAN) Design', context: 'Calculating network switch uplink bandwidth requirements between access switches and data center backbones.' },
    { domain: 'Ultra-High-Definition Video Streaming CDNs', context: 'Managing content delivery network (CDN) server egress capacity for concurrent 4K live video streams.' },
  ],
  'datatransfer:gbps-to-mbps': [
    { domain: 'Cloud Database Migration & Data Egress', context: 'Estimating data transfer duration and costs when migrating large database clusters to cloud storage.' },
    { domain: 'Storage Area Networks (SAN) & iSCSI Bandwidth', context: 'Allocating high-speed Fibre Channel storage bandwidth across clustered enterprise server nodes.' },
    { domain: 'Uncompressed Studio Video Ingestion', context: 'Compressing raw SMPTE ST 2110 uncompressed broadcast video streams for transmission distribution.' },
  ],
  'datatransfer:kbps-to-mbps': [
    { domain: 'Internet of Things (IoT) Telemetry Backhaul', context: 'Aggregating low-bandwidth sensor telemetry packets into broadband cellular backhaul connections.' },
    { domain: 'Voice over IP (VoIP) Telephony Capacity', context: 'Calculating network bandwidth required to support concurrent enterprise telephone calls with VoIP codecs.' },
    { domain: 'Digital Audio Streaming & Podcast Encoding', context: 'Comparing audio compression bitrates between mobile streaming formats and uncompressed audio.' },
  ],
  'torque:newton-meter-to-foot-pound': [
    { domain: 'Automotive Service & Wheel Lug Tightening', context: 'Setting torque wrenches to factory bolt tightening specifications across domestic and imported vehicles.' },
    { domain: 'Engine Dynamometer Performance Tuning', context: 'Translating European and Japanese engine dynamometer torque ratings into familiar foot-pounds.' },
    { domain: 'Industrial Robotic Assembly Fastening', context: 'Programming automated factory nutrunners to apply precise clamping torque on assembly lines.' },
  ],
  'torque:foot-pound-to-newton-meter': [
    { domain: 'Heavy Machinery & Fleet Maintenance', context: 'Converting North American service manual torque specifications for international mechanics.' },
    { domain: 'Bicycle Maintenance & Workshop Repairs', context: 'Torquing delicate carbon fiber stems, seat clamps, and crank bolts according to manufacturer specifications in newton-meters.' },
    { domain: 'High-Performance Bicycle Component Tuning', context: 'Setting precision torque wrenches for carbon fiber handlebars, stems, and seatposts.' },
  ],
  'density:g-cm-to-kg-m': [
    { domain: 'Materials Science & Polymer Engineering', context: 'Converting plastic resin and metal alloy physical densities into SI units for finite element simulation.' },
    { domain: 'Geological Mineral & Gemstone Identification', context: 'Identifying mineral and ore specimens by measuring specific gravity and volumetric density.' },
    { domain: 'Chemical Process Piping & Fluid Flow', context: 'Calculating liquid density parameters for Reynolds number and pipe friction calculations.' },
  ],
  'density:kg-m-to-lb-ft': [
    { domain: 'Naval Architecture & Marine Ballast Stability', context: 'Calculating seawater ballast weight, center of gravity, and vessel displacement.' },
    { domain: 'Geotechnical Soil Compaction & Foundations', context: 'Evaluating earth embankment compaction densities and soil bearing capacities for foundation design.' },
    { domain: 'Civil Structural Dead-Load Calculations', context: 'Calculating structural dead weights of reinforced concrete, structural steel, and timber framing.' },
  ],
  'cooking:cup-to-tablespoon': [
    { domain: 'Recipe Scaling & Small-Batch Baking', context: 'Scaling down cake and cookie recipes without specialized measuring spoons.' },
    { domain: 'Sauce & Salad Dressing Emulsions', context: 'Measuring vinegar, oil, and flavor bases accurately when preparing culinary marinades.' },
    { domain: 'Nutritional Meal Planning & Portions', context: 'Calculating exact portion sizes and calorie counts from bulk cup measurements.' },
  ],
  'cooking:tablespoon-to-teaspoon': [
    { domain: 'Leavening Agents & Baking Chemistry', context: 'Measuring baking powder, baking soda, and yeast accurately for dough fermentation.' },
    { domain: 'Spice Blends & Seasoning Formulations', context: 'Creating custom spice rubs and seasoning mixes from proportional culinary recipes.' },
    { domain: 'Tea, Coffee & Beverage Crafting', context: 'Measuring loose tea leaves, ground espresso, and concentrated syrups using standard kitchen spoons.' },
  ],
  'cooking:cup-to-milliliter': [
    { domain: 'International Culinary Recipe Adaptation', context: 'Translating American cup-based recipes for European home cooks using metric measuring jugs and scales.' },
    { domain: 'Commercial Bakery Batch Production', context: 'Scaling artisan bread formulas from domestic cup measures to commercial metric mixing vats.' },
    { domain: 'Nutritional Dietary Logging', context: 'Converting recipe liquid volumes into precise milliliters for digital dietary tracking apps.' },
  ],
  'cooking:fluid-ounce-to-milliliter': [
    { domain: 'Cocktail Mixology & Specialty Beverage Craft', context: 'Formulating cocktail recipes written in US fluid ounces using metric graduated bar jiggers.' },
    { domain: 'Infant Feeding & Formula Bottle Preparation', context: 'Measuring baby bottle liquid volumes accurately for powdered infant formula reconstitution.' },
    { domain: 'Specialty Coffee Brewing & Extraction', context: 'Translating espresso and pour-over water volumes between customary ounces and metric milliliters.' },
  ],
  'textile:gsm-to-thread-count': [
    { domain: 'Luxury Bedding & Linen Sourcing', context: 'Comparing bedsheet softness, durability, and fabric weight across international metric and imperial standards.' },
    { domain: 'Apparel Fabric Selection & Garment Design', context: 'Selecting appropriate cotton, linen, and synthetic fabric weights for shirts, jackets, and drapery.' },
    { domain: 'Commercial Printing & Canvas Substrates', context: 'Specifying fabric weight and weave density for custom banners, upholstery, and fine art canvases.' },
  ],
  'astronomy:light-year-to-au': [
    { domain: 'Exoplanetary Systems & Stellar Neighborhoods', context: 'Comparing the distance to nearby stars (like Proxima Centauri at 4.24 ly) to our solar system\'s scale in astronomical units.' },
    { domain: 'Oort Cloud & Deep-Space Exploration', context: 'Visualizing the outer boundary of the solar system and interstellar probes like Voyager.' },
    { domain: 'Astrophysics Education & Science Outreach', context: 'Communicating cosmic distances intuitively to students and planetarium audiences.' },
  ],
  'astronomy:parsec-to-light-year': [
    { domain: 'Astrometric Parallax & Gaia Mission Data', context: 'Converting stellar parallax angles measured by space telescopes into light-years.' },
    { domain: 'Galactic Mapping & Spiral Arm Structure', context: 'Measuring distances between star clusters, molecular clouds, and the galactic core.' },
    { domain: 'Extragalactic Distance Ladder & Cosmology', context: 'Calculating distances to neighboring galaxies and measuring cosmic expansion rates.' },
  ],
  'astronomy:solar-mass-to-earth-mass': [
    { domain: 'Exoplanet Detection & Radial Velocity Studies', context: 'Comparing exoplanetary masses with host star masses to calculate gravitational wobbles.' },
    { domain: 'Stellar Evolution & Black Hole Physics', context: 'Visualizing the immense mass of stellar-mass black holes relative to the Earth.' },
    { domain: 'Celestial Mechanics & Planetary Orbit Modeling', context: 'Inputting mass parameters into multi-body orbital simulations and gravitational models.' },
  ],
  'volume:cubic-yard-to-cubic-meter': [
    { domain: 'Ready-Mix Concrete & Civil Engineering', context: 'Converting concrete batching orders from US cubic yards into metric cubic meters for international building projects.' },
    { domain: 'Excavation & Earthwork Contracting', context: 'Calculating soil volume, fill material, and dump truck haulage capacities across regional measurement specifications.' },
  ],
  'volume:imperial-gallon-to-gallon': [
    { domain: 'Transatlantic Automotive Fuel Analysis', context: 'Translating UK automotive fuel tank volumes and fuel economy data into US customary gallons.' },
    { domain: 'Maritime & Aviation Fluid Handling', context: 'Reconciling Commonwealth bunker fuel logs with US gallon fluid storage and pumping equipment.' },
  ],
  'volume:liter-to-imperial-gallon': [
    { domain: 'UK Fleet Management & Fuel Economy', context: 'Converting European metric liter fuel dispensation into UK Imperial gallons for fleet efficiency auditing.' },
    { domain: 'Brewing & Chemical Beverage Distribution', context: 'Translating metric beverage packaging into traditional British Imperial casks and firkins.' },
  ],
  'mass:troy-ounce-to-gram': [
    { domain: 'Bullion Trading & Precious Metals Minting', context: 'Calculating fine gold, silver, and platinum market weights from standard troy ounces into grams for assay certification.' },
    { domain: 'Jewelry Design & Gemological Valuation', context: 'Translating precious metal alloy casting specifications into metric grams for high-precision weighing scales.' },
  ],
  'mass:troy-ounce-to-ounce': [
    { domain: 'Precious Metal vs Avoirdupois Weight Comparison', context: 'Reconciling heavy troy ounces (31.1035 g) with standard avoirdupois commercial ounces (28.3495 g) to prevent costly trading confusion.' },
    { domain: 'Scrap Gold Buying & Estate Liquidation', context: 'Converting postal scale kitchen ounces into true troy ounces for honest gold and silver scrap valuation.' },
  ],
  'length:angstrom-to-nanometer': [
    { domain: 'Crystallography & X-Ray Diffraction', context: 'Converting atomic lattice parameters and chemical bond lengths from historic angstroms into modern SI nanometers.' },
    { domain: 'Semiconductor Lithography & Optics', context: 'Translating extreme ultraviolet (EUV) laser wavelengths and dielectric film thicknesses between technical literature standards.' },
  ],
  'length:fathom-to-foot': [
    { domain: 'Nautical Depth Sounding & Hydrographic Charts', context: 'Translating historic marine nautical fathoms (6 feet) into precise feet for shallow-water vessel draft navigation.' },
    { domain: 'Commercial Maritime Anchorage & Rigging', context: 'Measuring anchor chain scope, mooring line lengths, and deep-sea cable laying depths.' },
  ],
  'torque:newton-meter-to-pound-inch': [
    { domain: 'Precision Electronics & Medical Robotics Assembly', context: 'Translating metric N·m torque ratings into delicate lb·in specifications for circuit board fasteners and chassis screws.' },
    { domain: 'Bicycle Carbon Component Maintenance', context: 'Calibrating fractional torque wrenches to prevent crushing lightweight carbon fiber handlebars and seatposts.' },
  ],
  'torque:pound-foot-to-pound-inch': [
    { domain: 'Automotive Engine Fastener Tightening', context: 'Converting between heavy-duty ft·lb wheel lug ratings and smaller in·lb valve cover and oil pan bolt tolerances.' },
    { domain: 'Aerospace Mechanical Calibration', context: 'Switching between high-torque airframe fasteners and low-torque instrument panel mounts on standardized maintenance sheets.' },
  ],
  'pressure:hectopascal-to-millibar': [
    { domain: 'Aviation Altimetry & Barometric Pressure Reporting', context: 'Confirming the 1:1 direct relationship between meteorological hectopascals (hPa) and barometric millibars (mbar) for altimeter setting.' },
    { domain: 'Marine Weather Forecasting & Storm Tracking', context: 'Logging atmospheric pressure drops during tropical cyclones across international meteorological bulletins.' },
  ],
  'pressure:inches-of-mercury-to-psi': [
    { domain: 'Automotive Turbocharger & Supercharger Boost Tuning', context: 'Translating engine manifold absolute pressure and vacuum from inHg into engineering pounds per square inch.' },
    { domain: 'Aviation Flight Instruments & Barometric Altimeters', context: 'Correlating FAA altimeter baro settings (inHg) with pneumatic system pressure instrumentation.' },
  ],
  'power:metric-horsepower-to-kilowatt': [
    { domain: 'European Automotive Power Rating & Vehicle Registration', context: 'Converting German DIN PferdeStärke (PS) vehicle engine output into mandatory EU kilowatts.' },
    { domain: 'Industrial Engine & Electric Motor Specification', context: 'Comparing European commercial vehicle ratings with industrial electric drive power certifications.' },
  ],
  'power:ton-of-refrigeration-to-btu-h': [
    { domain: 'Commercial HVAC Chiller Sizing & Engineering', context: 'Translating standard cooling capacity from Tons of Refrigeration (TR) into BTU/h (1 TR = 12,000 BTU/h).' },
    { domain: 'Building Energy Modeling & Heat Load Calculation', context: 'Determining total rooftop chiller and cooling tower thermal loads for architectural mechanical plans.' },
  ],
  'data:gibibyte-to-gigabyte': [
    { domain: 'Server RAM Provisioning & Cloud Virtual Machines', context: 'Translating binary IEC memory allocations (GiB) into advertised decimal storage capacity (GB).' },
    { domain: 'Operating System Drive Partitioning & Formatting', context: 'Explaining why a 1,000 GB solid-state drive formats to approximately 931.3 GiB in Windows Disk Management.' },
  ],
  'cooking:stick-of-butter-to-tablespoon': [
    { domain: 'Baking Recipe Rescaling & Kitchen Measurement', context: 'Converting standard American butter sticks into tablespoons (1 stick = 8 tbsp = 1/2 cup) for pastry recipes.' },
    { domain: 'Commercial Culinary Production & Portioning', context: 'Scaling home recipe ingredients to commercial food service bulk prep sheets.' },
  ],
  'flow:gallon-per-minute-to-liter-per-minute': [
    { domain: 'Plumbing Fixture Flow Compliance & Water Efficiency', context: 'Converting showerhead and faucet aerator ratings from US GPM to metric L/min to verify green building standards.' },
    { domain: 'Hydraulic Pumping & Irrigation System Design', context: 'Sizing agricultural drip irrigation lines and submersible well pumps across global equipment catalogs.' },
  ],
  'flow:cubic-feet-per-minute-to-liter-per-second': [
    { domain: 'HVAC Duct Sizing & Airflow Balancing', context: 'Translating ventilation fan airflow from US CFM into metric liters per second (L/s) for building commissioning.' },
    { domain: 'Cleanroom & Laboratory Fume Hood Exhaust', context: 'Calibrating laminar flow hoods and hospital isolation room air change rates according to international air quality codes.' },
  ],
  'flow:cubic-meter-per-hour-to-gallon-per-minute': [
    { domain: 'Municipal Water Distribution & Wastewater Treatment', context: 'Converting bulk pumping station capacity from European m³/h into US GPM for municipal engineers.' },
    { domain: 'Industrial Chemical Process Cooling Circuits', context: 'Sizing heat exchanger circulation pumps and cooling water flow rates across international plant designs.' },
  ],
  'illuminance:foot-candle-to-lux': [
    { domain: 'Workplace Safety & OSHA Lighting Audits', context: 'Converting American industrial foot-candle illumination requirements into European and international Lux standards.' },
    { domain: 'Commercial Architectural Lighting Design', context: 'Translating architectural lighting fixture schedules between US building codes and global photometric standards.' },
  ],
  'illuminance:lux-to-foot-candle': [
    { domain: 'Cinematography & Photography Light Metering', context: 'Translating ambient film set lighting measurements from digital lux meters into traditional foot-candles for exposure compensation.' },
    { domain: 'Greenhouse Horticulture & Indoor Plant Cultivation', context: 'Optimizing supplemental LED crop grow light arrays between metric target lux and foot-candle guidelines.' },
  ],
  'viscosity:centipoise-to-pascal-second': [
    { domain: 'Chemical Process Rheology & Polymer Formulation', context: 'Converting bench laboratory viscosity readings from CGS centipoise (cP) into SI coherent Pascal-seconds (Pa·s).' },
    { domain: 'Industrial Pipe Flow & Pumping Friction Calculations', context: 'Inputting dynamic fluid viscosity values into Navier-Stokes equations and Reynolds number flow models.' },
  ],
  'viscosity:centipoise-to-millipascal-second': [
    { domain: 'Scientific Laboratory Reporting & ISO Equivalence', context: 'Confirming the exact 1:1 identity between 1 Centipoise and 1 Millipascal-second across chemical databases.' },
    { domain: 'Lubricant Quality Control & Motor Oil Grading', context: 'Documenting high-temperature high-shear (HTHS) engine oil viscosity for ASTM standard compliance.' },
  ],
  'typography:pixel-to-point': [
    { domain: 'Digital UI Design to Print Layout Translation', context: 'Translating web application UI components (Figma/CSS 96 DPI) into desktop publishing points (72 DPI) for print manuals.' },
    { domain: 'Mobile App Typography & Vector Rendering', context: 'Harmonizing raster screen layout dimensions with vector font point sizes across iOS and Android design tokens.' },
  ],
  'typography:pixel-to-root-em': [
    { domain: 'Responsive Web Design & Accessible CSS Typography', context: 'Converting static Figma pixel mockups into scalable, accessible rem units based on browser root font sizes.' },
    { domain: 'Design System Token Automation & Theme Engine', context: 'Generating fluid typography clamp scales and layout spacing tokens for modern responsive frontend frameworks.' },
  ],
}

/**
 * Generates rich, factual, category-differentiated editorial content for a conversion pair.
 */
export function getPairEditorial(
  cat: CategoryDef,
  u1: UnitDef,
  u2: UnitDef,
  pairParam: string,
): PairEditorialContent {
  const s1 = unitSymbol(u1, cat.id)
  const s2 = unitSymbol(u2, cat.id)
  const n1 = unitName(u1, cat.id)
  const n2 = unitName(u2, cat.id)
  const l1 = unitLabel(u1, cat.id)
  const l2 = unitLabel(u2, cat.id)
  const metrology = CATEGORY_METROLOGY[cat.id] || {
    dimension: `${cat.lb} measurement`,
    siBase: u1.id,
    systems: 'Standard international measurement systems',
    contextNote: 'Calculated with double-precision IEEE 754 floating-point accuracy.',
  }

  const isTemp = cat.id === 'temp'
  const isFuel = cat.id === 'fuel'
  const isReciprocalFuel = isFuel && (
    (u1.id === 'mpgUS' && u2.id === 'L100km') ||
    (u1.id === 'L100km' && u2.id === 'mpgUS') ||
    (u1.id === 'mpgUK' && u2.id === 'L100km') ||
    (u1.id === 'L100km' && u2.id === 'mpgUK') ||
    (u1.id === 'kmL' && u2.id === 'L100km') ||
    (u1.id === 'L100km' && u2.id === 'kmL')
  )

  const unitRatio = convert(1, cat.id, u1.id, u2.id)
  const inverseUnitRatio = convert(1, cat.id, u2.id, u1.id)

  // Direct Answer & Formula Text
  let summary: string
  let formulaDisplay: string
  let inverseSummary: string
  let calculationRule: string

  if (isTemp) {
    if (u1.id === 'C' && u2.id === 'F') {
      formulaDisplay = '°F = (°C × 9/5) + 32'
      summary = `1 °C equals 33.8 °F exactly (0 °C corresponds exactly to 32 °F by the scale conversion relationship).`
      calculationRule = `To convert Celsius to Fahrenheit, multiply the Celsius temperature by 9/5 (or 1.8) and add 32.`
      inverseSummary = `1 °F equals approximately -17.2222 °C (32 °F corresponds exactly to 0 °C by the scale conversion relationship). Formula: °C = (°F - 32) × 5/9.`
    } else if (u1.id === 'F' && u2.id === 'C') {
      formulaDisplay = '°C = (°F - 32) × 5/9'
      summary = `1 °F equals approximately -17.2222 °C (32 °F corresponds exactly to 0 °C by the scale conversion relationship).`
      calculationRule = `To convert Fahrenheit to Celsius, subtract 32 from the Fahrenheit temperature and multiply the result by 5/9 (or divide by 1.8).`
      inverseSummary = `1 °C equals 33.8 °F exactly. Formula: °F = (°C × 9/5) + 32.`
    } else if (u1.id === 'C' && u2.id === 'K') {
      formulaDisplay = 'K = °C + 273.15'
      summary = `1 °C corresponds to 274.15 K (the kelvin and degree Celsius have the same interval size, with 0 °C corresponding to 273.15 K).`
      calculationRule = `To convert Celsius to Kelvin, add 273.15 to the Celsius temperature.`
      inverseSummary = `1 K corresponds to -272.15 °C (with 0 K corresponding to -273.15 °C). Formula: °C = K - 273.15.`
    } else if (u1.id === 'K' && u2.id === 'C') {
      formulaDisplay = '°C = K - 273.15'
      summary = `1 K corresponds to -272.15 °C (with 0 K corresponding to -273.15 °C).`
      calculationRule = `To convert Kelvin to Celsius, subtract 273.15 from the Kelvin value.`
      inverseSummary = `1 °C corresponds to 274.15 K (with 0 °C corresponding to 273.15 K). Formula: K = °C + 273.15.`
    } else if (u1.id === 'F' && u2.id === 'K') {
      formulaDisplay = 'K = (°F - 32) × 5/9 + 273.15'
      summary = `1 °F equals approximately 255.9278 K (32 °F corresponds to 273.15 K).`
      calculationRule = `To convert Fahrenheit to Kelvin, subtract 32 from the Fahrenheit value, multiply by 5/9, and add 273.15.`
      inverseSummary = `1 K equals approximately -457.87 °F. Formula: °F = (K - 273.15) × 9/5 + 32.`
    } else {
      formulaDisplay = `${s2} = formula(${s1})`
      summary = `1 ${l1} corresponds to approximately ${unitRatio !== null ? fmt(unitRatio, 4) : ''} ${l2}.`
      calculationRule = `To convert from ${n1} to ${n2}, apply the thermodynamic conversion formula.`
      inverseSummary = `1 ${l2} corresponds to approximately ${inverseUnitRatio !== null ? fmt(inverseUnitRatio, 4) : ''} ${l1}.`
    }
  } else if (isReciprocalFuel) {
    if ((u1.id === 'mpgUS' && u2.id === 'L100km') || (u1.id === 'L100km' && u2.id === 'mpgUS')) {
      formulaDisplay = 'L/100km ≈ 235.215 ÷ MPG (US)'
      summary = `1 MPG (US) equals approximately 235.215 L/100km. Formula: L/100km ≈ 235.215 ÷ MPG (US), where 235.215 = 100 × 3.785411784 ÷ 1.609344.`
      calculationRule = `To convert between MPG (US) and L/100km, divide 235.215 by the known value (L/100km ≈ 235.215 ÷ MPG). Note that 235.215 is a rounded constant.`
      inverseSummary = `1 L/100km equals approximately 235.215 MPG (US). Formula: MPG ≈ 235.215 ÷ (L/100km).`
    } else if ((u1.id === 'mpgUK' && u2.id === 'L100km') || (u1.id === 'L100km' && u2.id === 'mpgUK')) {
      formulaDisplay = 'L/100km ≈ 282.481 ÷ MPG (UK)'
      summary = `1 MPG (UK) equals approximately 282.481 L/100km. Formula: L/100km ≈ 282.481 ÷ MPG (UK), where 282.481 = 100 × 4.54609 ÷ 1.609344.`
      calculationRule = `To convert between MPG (UK) and L/100km, divide 282.481 by the known value (L/100km ≈ 282.481 ÷ MPG). Note that 282.481 is a rounded constant.`
      inverseSummary = `1 L/100km equals approximately 282.481 MPG (UK). Formula: MPG ≈ 282.481 ÷ (L/100km).`
    } else {
      formulaDisplay = 'L/100km = 100 ÷ km/L'
      summary = `1 km/L equals exactly 100 L/100km. Formula: L/100km = 100 ÷ km/L.`
      calculationRule = `To convert between km/L and L/100km, divide 100 by the known value (L/100km = 100 ÷ km/L).`
      inverseSummary = `1 L/100km equals exactly 100 km/L. Formula: km/L = 100 ÷ (L/100km).`
    }
    // The texts above are written MPG/km/L → L/100km; flip them for L/100km → X pages
    if (u1.id === 'L100km') {
      ;[summary, inverseSummary] = [inverseSummary, summary]
      const [lhs, rhs] = formulaDisplay.split(/ [≈=] /)
      const op = formulaDisplay.includes('≈') ? '≈' : '='
      const [constant, divisor] = rhs.split(' ÷ ')
      formulaDisplay = `${divisor} ${op} ${constant} ÷ ${lhs}`
    }
  } else {
    // Linear
    const rFmt = unitRatio !== null ? fmt(unitRatio, 6) : '—'
    const invFmt = inverseUnitRatio !== null ? fmt(inverseUnitRatio, 6) : '—'
    const isExact = unitRatio !== null && Math.abs(Number(rFmt) - unitRatio) < 1e-12
    const isInvExact = inverseUnitRatio !== null && Math.abs(Number(invFmt) - inverseUnitRatio) < 1e-12

    formulaDisplay = isExact
      ? `${s2} = ${s1} × ${unitRatio !== null ? fmt(unitRatio, 8) : ''}`
      : `${s2} ≈ ${s1} × ${unitRatio !== null ? fmt(unitRatio, 8) : ''}`

    summary = isExact
      ? `1 ${l1} equals exactly ${rFmt} ${l2}.`
      : `1 ${l1} equals approximately ${rFmt} ${l2}.`

    calculationRule = isExact
      ? `To convert from ${n1} to ${n2}, multiply the quantity by ${rFmt} (or divide by ${invFmt}).`
      : `To convert from ${n1} to ${n2}, multiply the quantity by approximately ${rFmt} (or divide by approximately ${invFmt}).`

    inverseSummary = isInvExact
      ? `1 ${l2} equals exactly ${invFmt} ${l1}. Formula: ${s1} = ${s2} × ${inverseUnitRatio !== null ? fmt(inverseUnitRatio, 8) : ''}.`
      : `1 ${l2} equals approximately ${invFmt} ${l1}. Formula: ${s1} ≈ ${s2} × ${inverseUnitRatio !== null ? fmt(inverseUnitRatio, 8) : ''}.`
  }

  // Explanation Paragraphs
  const explanationHeading = `How ${l1} and ${l2} Relate`
  const p1 = `In metrology, ${cat.lb.toLowerCase()} quantifies ${metrology.dimension}. Within this domain, ${l1} and ${l2} originate from ${metrology.systems}. ${metrology.contextNote}`
  const p2 = isTemp
    ? `Unlike purely proportional units, temperature scales differ in both their degree intervals and their zero-point reference baselines. Converting between ${n1} and ${n2} requires an affine transformation (${formulaDisplay}) that shifts the temperature offset before scaling the unit intervals.`
    : isReciprocalFuel
    ? `Fuel economy units like ${s1} and ${s2} exhibit an inverse (reciprocal) relationship rather than a direct multiplication factor. One metric measures distance traveled per volume of fuel consumed, while the other measures fuel volume consumed per standard travel distance.`
    : `Because both ${n1} and ${n2} belong to the linear ${cat.lb.toLowerCase()} domain, conversion between them is strictly proportional. The exact conversion factor (${unitRatio !== null ? fmt(unitRatio, 8) : ''}) guarantees zero precision drift across mathematical calculations.`

  // Practical Use Cases
  const pairKey = `${cat.id}:${pairParam}`
  const specificUseCases = PAIR_USE_CASES[pairKey] || [
    { domain: `Engineering & Technical Specifications`, context: `Converting ${n1} measurements to ${n2} to align design drawings and component tolerances with global partner standards.` },
    { domain: `Commercial Procurement & Logistics`, context: `Reconciling packaging, order quantities, and freight manifests between international ${s1} records and domestic ${s2} systems.` },
    { domain: `Academic Research & Educational Labs`, context: `Translating experimental laboratory readings from ${n1} into standard SI and reporting units.` },
  ]

  // Reciprocal Canonical Pair Resolution
  const catPairs = categoryContent[cat.id]?.popularPairs || []
  let canonicalReverseSlug: string | null = null

  for (const p of catPairs) {
    const pFrom = findUnit(cat, cleanSlug(p.from))
    const pTo = findUnit(cat, cleanSlug(p.to))
    if (pFrom && pTo && pFrom.id === u2.id && pTo.id === u1.id) {
      canonicalReverseSlug = `${cleanSlug(p.from)}-to-${cleanSlug(p.to)}`
      break
    }
  }

  const reciprocal = canonicalReverseSlug
    ? {
        hasCanonicalPair: true,
        url: `/convert/${cat.id}/${canonicalReverseSlug}`,
        anchorText: `Convert ${n2} to ${n1} (${s2} to ${s1})`,
        badgeText: 'Reverse Pair Available',
        description: `Looking to calculate the reverse direction? Switch directly to our dedicated ${n2} to ${n1} converter.`,
      }
    : {
        hasCanonicalPair: false,
        url: `/convert/${cat.id}`,
        anchorText: `All ${cat.lb} Converters & Tools`,
        badgeText: 'Category Hub',
        description: `Need to convert other ${cat.lb.toLowerCase()} units? Explore all combinations in the full ${cat.lb} converter.`,
      }

  // Worked Example Calculation for FAQ
  const workedExampleQuestion = `What is an example calculation converting ${n1} to ${n2}?`
  let workedExampleAnswer: string

  if (isTemp) {
    if (u1.id === 'C' && u2.id === 'F') {
      workedExampleAnswer = `To convert 25 °C to °F: multiply 25 by 9/5 (which equals 45), then add 32 to get 77 °F (25 °C = 77 °F, a comfortable room temperature).`
    } else if (u1.id === 'F' && u2.id === 'C') {
      workedExampleAnswer = `To convert 68 °F to °C: subtract 32 from 68 (which equals 36), then multiply by 5/9 to get 20 °C (68 °F = 20 °C).`
    } else if (u1.id === 'C' && u2.id === 'K') {
      workedExampleAnswer = `To convert 20 °C to Kelvin: add 273.15 to 20 to get 293.15 K.`
    } else if (u1.id === 'K' && u2.id === 'C') {
      workedExampleAnswer = `To convert 300 K to °C: subtract 273.15 from 300 to get 26.85 °C.`
    } else {
      const sampleVal = 20
      const sampleRes = convertTemp(sampleVal, u1.id, u2.id)
      workedExampleAnswer = `To convert ${sampleVal} ${s1} to ${s2}: apply the scale formula to calculate ${sampleVal} ${s1} = ${cleanFloat(sampleRes, 4)} ${s2}.`
    }
  } else if (isReciprocalFuel) {
    if (u1.id === 'mpgUS' && u2.id === 'L100km') {
      workedExampleAnswer = `To convert 30 MPG (US) to L/100km: divide 235.215 by 30, which yields 7.84 L/100km (235.215 ÷ 30 = 7.84 L/100km).`
    } else if (u1.id === 'L100km' && u2.id === 'mpgUS') {
      workedExampleAnswer = `To convert 8 L/100km to MPG (US): divide 235.215 by 8, which yields 29.40 MPG (US) (235.215 ÷ 8 = 29.40 MPG).`
    } else if (u1.id === 'kmL' && u2.id === 'L100km') {
      workedExampleAnswer = `To convert 15 km/L to L/100km: divide 100 by 15, which yields 6.67 L/100km (100 ÷ 15 = 6.67 L/100km).`
    } else {
      workedExampleAnswer = `To convert 10 ${s1} to ${s2}: apply the reciprocal formula to calculate 10 ${s1} = ${convertFuel(10, u1.id, u2.id) !== null ? fmt(convertFuel(10, u1.id, u2.id)!, 4) : ''} ${s2}.`
    }
  } else {
    const sampleVal = 10
    const sampleRes = convert(sampleVal, cat.id, u1.id, u2.id)
    const isSampleExact = sampleRes !== null && Math.abs(Number(fmt(sampleRes, 4)) - sampleRes) < 1e-12
    workedExampleAnswer = isSampleExact
      ? `To convert 10 ${n1} to ${n2}: multiply 10 by the conversion factor ${unitRatio !== null ? fmt(unitRatio, 6) : ''} to get exactly ${sampleRes !== null ? fmt(sampleRes, 4) : ''} ${l2}.`
      : `To convert 10 ${n1} to ${n2}: multiply 10 by the conversion factor ${unitRatio !== null ? fmt(unitRatio, 6) : ''} to get approximately ${sampleRes !== null ? fmt(sampleRes, 4) : ''} ${l2}.`
  }

  // Enhanced Pair-Specific FAQs with 100% Schema Parity
  const faqs: PairEditorialFaq[] = [
    {
      question: isTemp ? `What is 1 ${n1} in ${n2}?` : `How many ${n2} in 1 ${n1}?`,
      answer: `${summary} ${inverseSummary}`,
    },
    {
      question: `How to convert ${n1} to ${n2}?`,
      answer: `${calculationRule} Mathematical formula: ${formulaDisplay}.`,
    },
    {
      question: workedExampleQuestion,
      answer: workedExampleAnswer,
    },
    {
      question: `How to convert back from ${n2} to ${n1}?`,
      answer: isTemp
        ? `To convert from ${n2} to ${n1}, reverse the calculation formula: ${inverseSummary}`
        : isReciprocalFuel
        ? `Because fuel economy conversions between ${s1} and ${s2} are reciprocal, divide the exact conversion constant by your ${s2} value to get ${s1}.`
        : `To convert from ${n2} to ${n1}, multiply by the inverse factor ${inverseUnitRatio !== null ? fmt(inverseUnitRatio, 6) : ''} (or divide by ${unitRatio !== null ? fmt(unitRatio, 6) : ''}). Formula: ${s1} = ${s2} × ${inverseUnitRatio !== null ? fmt(inverseUnitRatio, 8) : ''}.`,
    },
  ]

  const pairSlug = cleanSlug(pairParam)
  const fieldNote = PAIR_FIELD_NOTES[pairSlug] || CATEGORY_FIELD_NOTES[cat.id]

  return {
    directAnswer: {
      heading: `Direct Answer: 1 ${s1} to ${s2}`,
      summary,
      formulaDisplay,
      inverseSummary,
      calculationRule,
      isAffine: isTemp,
      isReciprocal: isReciprocalFuel,
    },
    explanation: {
      heading: explanationHeading,
      paragraphs: [p1, p2],
      systemContext: metrology.systems,
    },
    useCases: specificUseCases,
    reciprocal,
    faqs,
    fieldNote,
  }
}

export interface CategoryToolkitInfo {
  title: string
  desc: string
  action: string
  icon: string
}

export const CATEGORY_TOOLKIT_MAP: Record<string, CategoryToolkitInfo> = {
  length: {
    title: 'Length Pro Metrology Toolkit & Dimensional Bar',
    desc: 'Interactive architectural tape snap, lumber dimensions, socket scales, and live comparison bars.',
    action: 'Open Length Toolkit',
    icon: '📏',
  },
  cooking: {
    title: "Culinary Recipe Scaler & Baker's Batch Tool",
    desc: 'Scale baking recipes up or down by factor or serving count with instant ingredient volume conversions.',
    action: 'Open Recipe Scaler',
    icon: '🍳',
  },
  temp: {
    title: 'Interactive Thermal Range & Phase Visualizer',
    desc: 'Visual thermometer comparing Celsius, Fahrenheit, and Kelvin against water freezing and boiling points.',
    action: 'Open Temperature Visualizer',
    icon: '🌡️',
  },
  mass: {
    title: 'Gravitational Weight & Mass Reference Matrix',
    desc: 'Compare weights against everyday objects from paperclips to blue whales across metric and imperial systems.',
    action: 'Open Mass Reference',
    icon: '⚖️',
  },
  data: {
    title: 'Network Transfer & Download Time Estimator',
    desc: 'Estimate exact download and transfer times for files across broadband, 5G, gigabit, and optical networks.',
    action: 'Open Transfer Estimator',
    icon: '💾',
  },
  datatransfer: {
    title: 'Network Throughput & Transfer Time Estimator',
    desc: 'Model broadband speeds, bandwidth utilization, and file download times under realistic network conditions.',
    action: 'Open Transfer Estimator',
    icon: '📶',
  },
  speed: {
    title: 'Velocity, Mach & Acceleration Spectrum',
    desc: 'Explore speed benchmarks from walking pace to orbital velocity and the speed of light.',
    action: 'Open Speed Spectrum',
    icon: '🚀',
  },
  fuel: {
    title: 'Fuel Trip Cost & Mileage Estimator',
    desc: 'Calculate exact trip fuel consumption, cost per mile/kilometer, and fuel economy ratings.',
    action: 'Open Fuel Trip Tool',
    icon: '⛽',
  },
  area: {
    title: 'Land & Surface Area Scale Visualizer',
    desc: 'Visualize plots from tennis courts to square kilometers and international acres.',
    action: 'Open Area Visualizer',
    icon: '▣',
  },
  volume: {
    title: 'Liquid & Spatial Volume Comparison Tool',
    desc: 'Compare metric liters and cubic meters against gallons, fluid ounces, and everyday fluid vessels.',
    action: 'Open Volume Visualizer',
    icon: '🧪',
  },
  time: {
    title: 'Temporal & Relativistic Time Visualizer',
    desc: 'Compare nanoseconds to millennia with chronological benchmarks and planetary orbital cycles.',
    action: 'Open Time Visualizer',
    icon: '⏱️',
  },
  energy: {
    title: 'Energy Work & Caloric Consumption Visualizer',
    desc: 'Compare mechanical Joules, food Calories, kilowatt-hours, and British Thermal Units side-by-side.',
    action: 'Open Energy Visualizer',
    icon: '⚡',
  },
  pressure: {
    title: 'Barometric & Hydraulic Pressure Gauge',
    desc: 'Explore atmospheric, tire, diving, and vacuum pressure scales across Pa, PSI, and bar.',
    action: 'Open Pressure Gauge',
    icon: '🔵',
  },
  power: {
    title: 'Mechanical & Electrical Power Visualizer',
    desc: 'Compare horsepower, Watts, and kilowatts from smartphone batteries to industrial wind turbines.',
    action: 'Open Power Visualizer',
    icon: '💡',
  },
  angle: {
    title: 'Trigonometric & Angular Visualizer',
    desc: 'Interactive unit circle comparing degrees, radians, gradians, and arcminutes in real time.',
    action: 'Open Angle Visualizer',
    icon: '📐',
  },
  force: {
    title: 'Newtonian Force & Vector Visualizer',
    desc: 'Explore Newtons, pounds-force, and dynes with intuitive gravitational force anchors.',
    action: 'Open Force Visualizer',
    icon: '💪',
  },
  torque: {
    title: 'Torque & Fastener Mechanical Benchmarker',
    desc: 'Compare bolt tightening specs across Newton-meters, foot-pounds, and wrench leverage forces.',
    action: 'Open Torque Benchmarker',
    icon: '🔧',
  },
  frequency: {
    title: 'Frequency Spectrum & Wavelength Analyzer',
    desc: 'Convert oscillation rates across Hertz, rotational RPM, and acoustic vs electromagnetic wavelengths.',
    action: 'Open Frequency Analyzer',
    icon: '📡',
  },
  density: {
    title: 'Material Density & Archimedes Buoyancy Analyzer',
    desc: 'Compare material mass per volume across metric, cgs, and imperial standards with flotation analysis.',
    action: 'Open Density Analyzer',
    icon: '⚖️',
  },
}
