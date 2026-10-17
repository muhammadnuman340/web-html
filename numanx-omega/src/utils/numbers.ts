/**
 * Eliminates IEEE-754 binary floating-point artifacts (e.g., 0.1 + 0.2 -> 0.3)
 * using 14 significant digits WITHOUT truncating sub-nanometer or astronomical values to 0.
 */
export function cleanFloat(value: number, sigFigs: number = 14): number {
  if (!Number.isFinite(value) || value === 0) return 0
  return Number(value.toPrecision(sigFigs))
}

export function fmt(v: number | null | undefined, prec = 6): string {
  if (v === null || v === undefined || !isFinite(v)) return '—'
  return cleanFloat(Number(v.toFixed(prec))).toString()
}

export function fmtComma(v: number | null | undefined, prec = 2): string {
  if (v === null || v === undefined || !isFinite(v)) return '—'
  return Number(v.toFixed(prec)).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: prec,
  })
}

export function fmtSmart(v: number | null | undefined, prec = 6, frac = false): string {
  const d = fmt(v, prec)
  if (frac && v !== null && v !== undefined && isFinite(v)) {
    const f = toFrac(v)
    if (f !== '0' && f !== String(Math.round(v))) return d + '  (≈ ' + f + ')'
  }
  return d
}

export function toFrac(v: number, maxDen = 64): string {
  if (v === 0) return '0'
  const neg = v < 0
  v = Math.abs(v)
  const whole = Math.floor(v)
  v -= whole
  if (v < 1e-10) return neg && whole ? '−' + whole : neg ? '0' : String(whole)
  let bestNum = 1, bestDen = 1, bestDiff = v
  for (let d = 1; d <= maxDen; d++) {
    const num = Math.round(v * d)
    const diff = Math.abs(v - num / d)
    if (diff < bestDiff) { bestDiff = diff; bestNum = num; bestDen = d }
  }
  let s = neg ? '−' : ''
  if (whole) s += whole + ' '
  if (bestNum) s += bestNum + '/' + bestDen
  return s.trim()
}

/**
 * Context-Aware Smart Number Parser
 * @param input Raw string typed by user (e.g. "12,5", "3/8", "5' 10 1/2\"", "5' 3/4\"")
 * @param fromUnitRatioToMeter The `r` property of the active source unit (where 1 meter = 1)
 */
export function parseSmart(input: string, fromUnitRatioToMeter: number = 1): number | null {
  if (!input || !input.trim()) return null
  let s = input.trim()

  // 1. Compound Imperial Parser: handles "5' 10\"", "5ft 10.5in", "5' 10 3/8\"", AND "5' 3/4\""
  const compoundRegex = /^(-?\d+(?:\.\d+)?)\s*(?:'|′|ft|feet)\s*(?:(?:(\d+)\s+(\d+)\/(\d+)|(\d+)\/(\d+)|(\d+(?:\.\d+)?))\s*(?:"|″|in|inch|inches)?)?$/i
  const compoundMatch = s.match(compoundRegex)

  if (compoundMatch) {
    const sign = compoundMatch[1].startsWith('-') ? -1 : 1
    const feet = Math.abs(parseFloat(compoundMatch[1]) || 0)
    let inches = 0

    if (compoundMatch[2] && compoundMatch[3] && compoundMatch[4]) {
      // Case: "5' 10 3/8\"" (whole inches + fraction)
      inches = parseFloat(compoundMatch[2]) + parseFloat(compoundMatch[3]) / parseFloat(compoundMatch[4])
    } else if (compoundMatch[5] && compoundMatch[6]) {
      // Case: "5' 3/4\"" (fraction only, no whole inches)
      inches = parseFloat(compoundMatch[5]) / parseFloat(compoundMatch[6])
    } else if (compoundMatch[7]) {
      // Case: "5' 10\"" or "5' 10.5\""
      inches = parseFloat(compoundMatch[7])
    }

    const totalMeters = sign * (feet * 0.3048 + inches * 0.0254)
    // Convert base meters into whatever source unit the user currently has selected
    return cleanFloat(totalMeters / (fromUnitRatioToMeter || 1))
  }

  // 2. Mixed or Simple Fractions: "1 3/8" or "3/16"
  const mixedFrac = s.match(/^(-?\d+)\s+(\d+)\/(\d+)$/)
  if (mixedFrac) {
    const whole = parseFloat(mixedFrac[1])
    const den = parseFloat(mixedFrac[3])
    if (den === 0) return null
    const frac = parseFloat(mixedFrac[2]) / den
    return cleanFloat(whole < 0 ? whole - frac : whole + frac)
  }

  const simpleFrac = s.match(/^(-?\d+)\/(\d+)$/)
  if (simpleFrac) {
    const den = parseFloat(simpleFrac[2])
    if (den === 0) return null
    return cleanFloat(parseFloat(simpleFrac[1]) / den)
  }

  // 3. Locale-safe comma handling:
  // Single comma with 1-2 digits or non-3-digit group -> European decimal ("12,5" -> "12.5")
  if (/^-?\d+,\d+$/.test(s) && !/^-?\d{1,3},\d{3}$/.test(s)) {
    s = s.replace(',', '.')
  } else {
    // Strip thousands separators ("1,250.50" -> "1250.50")
    s = s.replace(/,/g, '')
  }

  const parsed = Number(s)
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * Architectural & Machinist Fractional Inch Breakdown with Dual Tolerance (in & mm)
 */
export interface FractionToleranceResult {
  decimalInches: number
  feetAndInches: string
  nearestFractionInch: string
  errorInches: number
  errorMillimeters: number
  isExact: boolean
}

export function toShopFraction(
  decimalInches: number,
  maxDenominator: 8 | 16 | 32 | 64 = 64
): FractionToleranceResult {
  const sign = decimalInches < 0 ? '-' : ''
  const absInches = Math.abs(decimalInches)
  const wholeInches = Math.floor(absInches)
  const remainder = absInches - wholeInches

  const step = 1 / maxDenominator
  const roundedSteps = Math.round(remainder / step)

  let finalWhole = wholeInches
  let num = roundedSteps
  let den = maxDenominator

  if (num === maxDenominator) {
    finalWhole += 1
    num = 0
  }

  // GCD simplification
  while (num > 0 && num % 2 === 0 && den % 2 === 0) {
    num /= 2
    den /= 2
  }

  const snappedValue = (decimalInches < 0 ? -1 : 1) * (finalWhole + (num > 0 ? num / den : 0))
  const errorIn = cleanFloat(decimalInches - snappedValue, 6)
  const errorMm = cleanFloat(errorIn * 25.4, 4)

  const fracStr = num === 0
    ? `${sign}${finalWhole}″`
    : finalWhole > 0
      ? `${sign}${finalWhole} ${num}/${den}″`
      : `${sign}${num}/${den}″`

  const feet = Math.floor(finalWhole / 12)
  const remInches = finalWhole % 12
  const ftInStr = feet > 0
    ? `${sign}${feet}′ ${remInches}${num > 0 ? ` ${num}/${den}` : ''}″`
    : fracStr

  return {
    decimalInches: cleanFloat(decimalInches, 8),
    feetAndInches: ftInStr,
    nearestFractionInch: fracStr,
    errorInches: errorIn,
    errorMillimeters: errorMm,
    isExact: Math.abs(errorIn) < 1e-6
  }
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}
