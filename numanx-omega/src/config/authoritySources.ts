/**
 * src/config/authoritySources.ts
 *
 * Centralized registry of authoritative, primary, and institutional metrological sources.
 * Grounded in verified standards from BIPM, NIST, and international standards bodies.
 *
 * Requirements:
 * - Validated HTTPS URLs (verified live HTTP 200).
 * - Primary/institutional sources only.
 * - Used for transparent attribution in About, Category standards notes, Guides, and Blog posts.
 */

export interface AuthoritySource {
  id: string
  organization: string
  title: string
  url: string
  documentRef: string
  domain: string
  supports: string[]
}

export const AUTHORITY_SOURCES: Record<string, AuthoritySource> = {
  'bipm-si-brochure': {
    id: 'bipm-si-brochure',
    organization: 'Bureau International des Poids et Mesures (BIPM)',
    title: 'The International System of Units (SI Brochure, 9th Edition)',
    url: 'https://www.bipm.org/en/publications/si-brochure',
    documentRef: 'BIPM SI Brochure (2019)',
    domain: 'General SI Metrology & Base Units',
    supports: [
      'Fundamental SI base unit definitions (meter, kilogram, second, ampere, kelvin, mole, candela)',
      '2019 SI redefinition fixing fundamental physical constants (h, e, k, N_A, c, Δν_Cs, K_cd)',
      'Coherent derived units and standard SI decimal prefixes',
    ],
  },
  'bipm-base-units': {
    id: 'bipm-base-units',
    organization: 'Bureau International des Poids et Mesures (BIPM)',
    title: 'SI Base Units and Definitions',
    url: 'https://www.bipm.org/en/measurement-units/',
    documentRef: 'BIPM Measurement Units',
    domain: 'SI Base Units & Temperature Relationship',
    supports: [
      'Primary SI base unit realizations and international prototype history',
      'The kelvin and degree Celsius interval equivalence (0 °C = 273.15 K)',
    ],
  },
  'nist-sp811': {
    id: 'nist-sp811',
    organization: 'National Institute of Standards and Technology (NIST)',
    title: 'NIST Special Publication 811: Guide for the Use of the International System of Units (SI)',
    url: 'https://www.nist.gov/pml/special-publication-811',
    documentRef: 'NIST SP 811 (2008 Edition)',
    domain: 'U.S. Customary & SI Conversions',
    supports: [
      'U.S. Customary to metric SI conversion factors and conversion rounding conventions',
      'Exact conversion ratios for length (1 inch = 25.4 mm; 1 foot = 0.3048 m) and mass (1 avoirdupois pound = 0.45359237 kg)',
      'Standardized rules for unit symbols, formatting, and mathematical expressions',
    ],
  },
  'nist-hb44': {
    id: 'nist-hb44',
    organization: 'National Institute of Standards and Technology (NIST)',
    title: 'NIST Handbook 44: Specifications, Tolerances, and Other Technical Requirements for Weighing and Measuring Devices',
    url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition',
    documentRef: 'NIST Handbook 44',
    domain: 'Legal Metrology & Liquid Capacity',
    supports: [
      'Commercial liquid capacity definitions (US liquid gallons, quarts, pints, fluid ounces)',
      'Dry measure capacity regulations and commercial trade weighing tolerances',
    ],
  },
  'codata-constants': {
    id: 'codata-constants',
    organization: 'CODATA / NIST Physical Measurement Laboratory',
    title: 'CODATA Internationally Recommended Values of the Fundamental Physical Constants',
    url: 'https://physics.nist.gov/cuu/Constants/',
    documentRef: 'CODATA Recommended Values',
    domain: 'Fundamental Physical Constants',
    supports: [
      'Fundamental physical constants including the speed of light c, elementary charge e, and Boltzmann constant k',
      'Energy-to-electron-volt conversion factors (1 eV = 1.602176634 × 10^-19 J exactly)',
    ],
  },
}

export const AUTHORITY_SOURCES_LIST = Object.values(AUTHORITY_SOURCES)

export function getAuthoritySource(id: string): AuthoritySource | undefined {
  return AUTHORITY_SOURCES[id]
}

/**
 * Returns contextually relevant authority sources for a specific conversion category.
 * Prevents over-claiming authority by omitting NIST/BIPM from non-physical categories
 * (such as currency, crypto, data, or fuel) where they do not govern definitions.
 */
export function getCategoryAuthoritySources(catId: string): AuthoritySource[] {
  switch (catId) {
    case 'length':
    case 'mass':
    case 'area':
    case 'speed':
    case 'pressure':
    case 'force':
    case 'torque':
    case 'acceleration':
    case 'density':
    case 'viscosity':
    case 'flow':
      return [AUTHORITY_SOURCES['nist-sp811'], AUTHORITY_SOURCES['bipm-si-brochure']]
    case 'temp':
      return [AUTHORITY_SOURCES['bipm-base-units'], AUTHORITY_SOURCES['nist-sp811']]
    case 'energy':
    case 'power':
      return [AUTHORITY_SOURCES['nist-sp811'], AUTHORITY_SOURCES['codata-constants']]
    case 'volume':
      return [AUTHORITY_SOURCES['nist-sp811'], AUTHORITY_SOURCES['nist-hb44']]
    case 'cooking':
      return [AUTHORITY_SOURCES['nist-hb44']]
    case 'time':
    case 'angle':
      return [AUTHORITY_SOURCES['bipm-si-brochure']]
    default:
      // Non-physical / market / computing categories (currency, crypto, data, datatransfer, fuel, typography, health)
      // do not claim direct NIST/BIPM base unit realization; they reference the central standards directory
      return []
  }
}
