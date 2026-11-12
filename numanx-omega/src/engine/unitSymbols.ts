/**
 * Display symbols for units.
 *
 * Unit ids in categories.ts are internal keys (e.g. 'mps2', 'cup_c', 'ly_a') and some
 * are shared across categories ('C' is °C in temperature but coulomb in electricity).
 * Anything shown to readers or search engines should use unitSymbol() instead of u.id.
 */
import type { UnitDef } from '../types'

const SCOPED: Record<string, string> = {
  'temp:C': '°C',
  'temp:F': '°F',
  'acceleration:gal': 'Gal',
  'typography:px': 'px',
  'typography:pt': 'pt',
  'typography:pica': 'pc',
  'typography:rem': 'rem',
  'typography:em': 'em',
  'typography:mm': 'mm',
  'typography:cm': 'cm',
  'typography:in': 'in',
}

const SYMBOLS: Record<string, string> = {
  angstrom: 'Å', pm: 'pm', um: 'µm', ug: 'µg', us: 'µs', uF: 'µF',
  mm2: 'mm²', cm2: 'cm²', m2: 'm²', km2: 'km²', in2: 'in²', ft2: 'ft²', yd2: 'yd²', mi2: 'mi²',
  m3: 'm³', in3: 'in³', ft3: 'ft³', yd3: 'yd³', cm3: 'cm³',
  impgal: 'gal (UK)', imppt: 'pt (UK)', impfloz: 'fl oz (UK)',
  floz: 'fl oz', floz_c: 'fl oz', cup_c: 'cup', tbsp_c: 'tbsp', tsp_c: 'tsp', mL_c: 'mL',
  stick_c: 'stick', jigger: 'jigger',
  stone: 'st', R: '°R', Re: '°Ré',
  ozt: 'oz t', lbt: 'lb t', slug: 'slug', dwt: 'dwt', q: 'q',
  fathom: 'fath', mil: 'mil', pt: 'pt',
  mps: 'm/s', kmh: 'km/h', knot: 'kn', mach: 'Mach',
  mps2: 'm/s²', ftps2: 'ft/s²', gforce: 'g-force',
  ohm: 'Ω', kohm: 'kΩ', Mohm: 'MΩ',
  Nm: 'N·m', lbft: 'lb·ft', lbin: 'lb·in', ozin: 'oz·in', kgfm: 'kgf·m', Ncm: 'N·cm', Nmm: 'N·mm',
  ps: 'PS', tr: 'TR', GW: 'GW',
  hPa: 'hPa', mbar: 'mbar', inHg: 'inHg', inH2O: 'inH₂O', ksi: 'ksi',
  bpd: 'bbl/d', Lmin: 'L/min', gpm: 'GPM', m3h: 'm³/h', cfm: 'CFM', Ls: 'L/s', m3s: 'm³/s',
  nox: 'nox', lx: 'lx', fc: 'fc', ph: 'ph',
  cP: 'cP', mPas: 'mPa·s', P: 'P', Pas: 'Pa·s', lbfts: 'lb/(ft·s)',
  pica: 'pc', rem: 'rem',
  KiB: 'KiB', MiB: 'MiB', GiB: 'GiB', TiB: 'TiB',
  kmL: 'km/L', mpgUS: 'MPG (US)', mpgUK: 'MPG (UK)', L100km: 'L/100km',
  kgm3: 'kg/m³', gcm3: 'g/cm³', lbft3: 'lb/ft³',
  BTUh: 'BTU/h', tc: 'TC', oz_yd2: 'oz/yd²', momme: 'mm',
  au: 'AU', au_a: 'AU', ly_a: 'ly', pc_a: 'pc', sm: 'M☉', em: 'M⊕',
  ld: 'LD', sr: 'R☉', er: 'R⊕',
  marla_soc: 'marla (soc)', marla_cap: 'marla (cap)', gaz_sq: 'sq yd (gaz)', maund_pk: 'maund (mandi)',
  bin_radix: 'bin', oct_radix: 'oct', dec_radix: 'dec', hex_radix: 'hex',
  bcd_code: 'BCD', gray_code: 'Gray', twos_comp: '2s-comp',
  dec_real: 'real', hex_float: 'hex float', fp16: 'FP16', fp32: 'FP32', fp64: 'FP64',
  m_std: 'Million', b_std: 'Billion', t_std: 'Trillion', k_std: 'Thousand',
  lakh: 'lakh', crore: 'crore', arab: 'arab', kharab: 'kharab', hazar: 'hazar',
  z_score: 'z', p_val_two: 'p-val (2-tail)', p_val_one: 'p-val (1-tail)',
  dec_odds: 'dec odds', frac_odds: 'frac odds', us_moneyline: 'moneyline', pct_odds: '%',
  csv: 'CSV', latex_b: 'bmatrix', latex_p: 'pmatrix', numpy: 'NumPy', matlab: 'MATLAB', json_2d: 'JSON 2D',
  dec_std: 'dec', sci_std: 'sci', eng_std: 'eng', sci_micro: 'micro', sci_nano: 'nano', sci_pico: 'pico',
  ppm: 'ppm', ppb: 'ppb', pct: '%',
  hec_gpa4: 'CGPA 4.0', gpa5: 'GPA 5.0', matric_fsc1100: 'marks (1100)', mdcat200: 'marks (200)', percentage: '%',
  overs_balls: 'overs', balls: 'balls', true_overs: 'dec overs',
}

// Spelled-out names for units whose label in categories.ts is just a symbol.
// These match how people search ("celsius to fahrenheit", "gb to mb").
const SCOPED_NAMES: Record<string, string> = {
  'temp:C': 'Celsius',
  'temp:F': 'Fahrenheit',
  'temp:K': 'Kelvin',
  'typography:px': 'Pixel',
  'typography:pt': 'Point',
  'typography:pica': 'Pica',
  'typography:rem': 'Root EM',
  'typography:em': 'EM',
  'typography:mm': 'Millimeter',
  'typography:cm': 'Centimeter',
  'typography:in': 'Inch',
}

const NAMES: Record<string, string> = {
  KB: 'Kilobyte', MB: 'Megabyte', GB: 'Gigabyte', TB: 'Terabyte', PB: 'Petabyte',
  KiB: 'Kibibyte', MiB: 'Mebibyte', GiB: 'Gibibyte', TiB: 'Tebibyte',
  kHz: 'Kilohertz', MHz: 'Megahertz', GHz: 'Gigahertz', THz: 'Terahertz',
  mm2: 'Square Millimeter', cm2: 'Square Centimeter', m2: 'Square Meter', km2: 'Square Kilometer',
  in2: 'Square Inch', ft2: 'Square Foot', yd2: 'Square Yard', mi2: 'Square Mile',
  m3: 'Cubic Meter', in3: 'Cubic Inch', ft3: 'Cubic Foot', yd3: 'Cubic Yard', cm3: 'Cubic Centimeter',
  impgal: 'Imperial Gallon', imppt: 'Imperial Pint', impfloz: 'Imperial Fluid Ounce',
  cL: 'Centiliter', dL: 'Deciliter',
  ozt: 'Troy Ounce', lbt: 'Troy Pound', q: 'Metric Quintal', slug: 'Slug', dwt: 'Pennyweight',
  angstrom: 'Angstrom', pm: 'Picometer', mil: 'Thou / Mil', fathom: 'Fathom', pt: 'Point',
  Nm: 'Newton-meter', lbft: 'Pound-foot', lbin: 'Pound-inch', ozin: 'Ounce-inch', kgfm: 'Kilogram-force meter',
  Ncm: 'Newton-centimeter', Nmm: 'Newton-millimeter',
  ps: 'Metric Horsepower', tr: 'Ton of Refrigeration', GW: 'Gigawatt',
  hPa: 'Hectopascal', mbar: 'Millibar', inHg: 'Inches of Mercury', inH2O: 'Inches of Water', ksi: 'Kilopound per Square Inch',
  bpd: 'Barrels per Day', Lmin: 'Liter per Minute', gpm: 'Gallon per Minute', m3h: 'Cubic Meter per Hour', cfm: 'Cubic Feet per Minute', Ls: 'Liter per Second', m3s: 'Cubic Meter per Second',
  nox: 'Nox', lx: 'Lux', fc: 'Foot-candle', ph: 'Phot',
  cP: 'Centipoise', mPas: 'Millipascal-second', P: 'Poise', Pas: 'Pascal-second', lbfts: 'Pound per Foot-second',
  pica: 'Pica', rem: 'Root EM',
  stick_c: 'Stick of Butter', jigger: 'Jigger',
  au_a: 'Astronomical Unit',
  oz_yd2: 'Ounce per Square Yard', momme: 'Momme Silk',
  marla_soc: 'Marla (Society 225 sq ft)', marla_cap: 'Marla (Capital 250 sq ft)', gaz_sq: 'Square Yard (Gaz)', maund_pk: 'Maund (40 kg Mandi)',
  bin_radix: 'Binary (Base-2)', oct_radix: 'Octal (Base-8)', dec_radix: 'Decimal (Base-10)', hex_radix: 'Hexadecimal (Base-16)',
  bcd_code: 'Binary Coded Decimal', gray_code: 'Gray Code', twos_comp: "Two's Complement",
  dec_real: 'Decimal Real', hex_float: 'Hexadecimal Float', fp16: 'Half Precision FP16', fp32: 'Single Precision FP32', fp64: 'Double Precision FP64',
  m_std: 'Million (Standard)', b_std: 'Billion (Standard)', t_std: 'Trillion (Standard)', k_std: 'Thousand (Standard)',
  lakh: 'Lakh', crore: 'Crore', arab: 'Arab', kharab: 'Kharab', hazar: 'Hazar',
  z_score: 'Z-Score', p_val_two: 'Two-Tailed P-Value', p_val_one: 'One-Tailed P-Value',
  dec_odds: 'Decimal Odds', frac_odds: 'Fractional Odds', us_moneyline: 'American Moneyline', pct_odds: 'Probability Percentage',
  csv: 'CSV Grid', latex_b: 'LaTeX bmatrix', latex_p: 'LaTeX pmatrix', numpy: 'Python NumPy Array', matlab: 'MATLAB Matrix', json_2d: 'JSON 2D Array',
  dec_std: 'Standard Decimal', sci_std: 'Scientific Notation', eng_std: 'Engineering Notation', sci_micro: 'Scientific Micro', sci_nano: 'Scientific Nano', sci_pico: 'Scientific Pico',
  ppm: 'Parts Per Million', ppb: 'Parts Per Billion', pct: 'Percentage',
  hec_gpa4: 'HEC CGPA (4.00 Scale)', gpa5: '5.00 GPA Scale', matric_fsc1100: 'Matric / FSc Total (1100)', mdcat200: 'MDCAT Score (200)', percentage: 'Percentage Marks',
  overs_balls: 'Cricket Overs (O.B)', balls: 'Legal Deliveries (Balls)', true_overs: 'True Decimal Overs',
}

export function unitSymbol(u: UnitDef, catId?: string): string {
  return (catId && SCOPED[`${catId}:${u.id}`]) || SYMBOLS[u.id] || u.id
}

export function unitName(u: UnitDef, catId?: string): string {
  return (catId && SCOPED_NAMES[`${catId}:${u.id}`]) || NAMES[u.id] || u.lb
}

/** "Kilometer (km)", or just "km/L" when the name and symbol are the same. */
export function unitLabel(u: UnitDef, catId?: string): string {
  const name = unitName(u, catId)
  const sym = unitSymbol(u, catId)
  return name === sym ? name : `${name} (${sym})`
}

/** "Convert Kilometer to Mile (km to mi)"; drops the symbols when they repeat the names. */
export function pairTitle(u1: UnitDef, u2: UnitDef, catId: string): string {
  const n1 = unitName(u1, catId)
  const n2 = unitName(u2, catId)
  const s1 = unitSymbol(u1, catId)
  const s2 = unitSymbol(u2, catId)
  if (s1 === n1 && s2 === n2) return `Convert ${n1} to ${n2}`
  return `Convert ${n1} to ${n2} (${s1} to ${s2})`
}

/** Answer-first meta description for pair pages, kept under ~160 characters. */
export function pairMetaDescription(u1: UnitDef, u2: UnitDef, catId: string, summary: string): string {
  const candidates = [
    `${summary} Free ${unitName(u1, catId)} to ${unitName(u2, catId)} converter with formula and chart.`,
    `${summary} Free converter with formula and chart.`,
    summary,
  ]
  const fit = candidates.find(c => c.length <= 160)
  if (fit) return fit
  // Summary alone is too long: keep whole sentences that fit
  const cut = summary.slice(0, 160).lastIndexOf('. ')
  return cut > 0 ? summary.slice(0, cut + 1) : summary.slice(0, 157) + '…'
}
