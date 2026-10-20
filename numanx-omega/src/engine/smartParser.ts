export interface ParsedExpression {
  type: 'convert' | 'calculate' | 'compare' | 'explain' | 'learn' | 'unknown'
  value?: number
  fromUnit?: string
  toUnit?: string
  expressions?: ParsedExpression[]
  operator?: string
  raw: string
  intent?: 'convert' | 'compare' | 'learn' | 'explain'
  steps?: { label: string; value: string }[]
}

const UNIT_PATTERNS: [RegExp, string, string[]][] = [
  [/^\s*(?:km|kilometers?|kilometres?|kilo\s*meters?)\s*$/i, 'km', []],
  [/^\s*(?:cm|centimeters?|centimetres?|centi\s*meters?)\s*$/i, 'cm', []],
  [/^\s*(?:mm|millimeters?|millimetres?|milli\s*meters?)\s*$/i, 'mm', []],
  [/^\s*(?:nm|nanometers?)\s*$/i, 'nm', []],
  [/^\s*(?:um|micrometers?)\s*$/i, 'um', []],
  [/^\s*(?:m|meters?|metres?)\s*$/i, 'm', ['meter']],
  [/^\s*(?:mi|miles?)\s*$/i, 'mi', []],
  [/^\s*(?:nmi|nautical\s*miles?)\s*$/i, 'nmi', []],
  [/^\s*(?:ft|foot|feet)\s*$/i, 'ft', ['feet']],
  [/^\s*(?:in|inch|inches)\s*$/i, 'in', ['inches']],
  [/^\s*(?:yd|yards?)\s*$/i, 'yd', []],
  [/^\s*(?:kg|kilograms?|kilo\s*grams?)\s*$/i, 'kg', []],
  [/^\s*(?:mg|milligrams?)\s*$/i, 'mg', []],
  [/^\s*(?:g|grams?)\s*$/i, 'g', []],
  [/^\s*(?:lbs?|pounds?)\s*$/i, 'lb', ['poundz']],
  [/^\s*(?:oz|ounces?)\s*$/i, 'oz', []],
  [/^\s*(?:st|stones?)\s*$/i, 'stone', []],
  [/^\s*(?:mL|milliliters?|millilitres?)\s*$/i, 'mL', []],
  [/^\s*(?:L|liters?|litres?)\s*$/i, 'L', []],
  [/^\s*(?:gal|gallons?)\s*$/i, 'gal', []],
  [/^\s*(?:qt|quarts?)\s*$/i, 'qt', []],
  [/^\s*(?:pt|pints?)\s*$/i, 'pt', []],
  [/^\s*(?:fl\s*oz|floz|fluid\s*ounces?)\s*$/i, 'floz', []],
  [/^\s*(?:°?\s*C|celsius)\s*$/i, 'C', []],
  [/^\s*(?:°?\s*F|fahrenheits?)\s*$/i, 'F', []],
  [/^\s*(?:°?\s*K|kelvins?)\s*$/i, 'K', []],
  [/^\s*(?:USD|us\s*dollars?)\s*$/i, 'USD', []],
  [/^\s*(?:EUR|euros?)\s*$/i, 'EUR', []],
  [/^\s*(?:GBP|pound\s*sterling|sterling)\s*$/i, 'GBP', []],
  [/^\s*(?:PKR|pakistani\s*rupees?|rupees?)\s*$/i, 'PKR', []],
  [/^\s*(?:INR|indian\s*rupees?)\s*$/i, 'INR', []],
  [/^\s*(?:mph|miles?\s*per\s*hour)\s*$/i, 'mph', []],
  [/^\s*(?:kmh|km\/h|kph|kilometers?\s*per\s*hour)\s*$/i, 'kmh', []],
  [/^\s*(?:m\/s|mps|meters?\s*per\s*second)\s*$/i, 'mps', []],
  [/^\s*(?:kWh|kilowatt[\s-]*hours?)\s*$/i, 'kWh', []],
  [/^\s*(?:Wh|watt[\s-]*hours?)\s*$/i, 'Wh', []],
  [/^\s*(?:kW|kilowatts?)\s*$/i, 'kW', []],
  [/^\s*(?:MW|megawatts?)\s*$/i, 'MW', []],
  [/^\s*(?:W|watts?)\s*$/i, 'W', []],
  [/^\s*(?:hp|horsepower)\s*$/i, 'hp', []],
  [/^\s*(?:kcal|kilocalories?)\s*$/i, 'kcal', []],
  [/^\s*(?:cal|calories?)\s*$/i, 'cal', []],
  [/^\s*(?:kJ|kilojoules?)\s*$/i, 'kJ', []],
  [/^\s*(?:J|joules?)\s*$/i, 'J', []],
  [/^\s*(?:BTU)\s*$/i, 'BTU', []],
  [/^\s*(?:kPa|kilopascals?)\s*$/i, 'kPa', []],
  [/^\s*(?:MPa|megapascals?)\s*$/i, 'MPa', []],
  [/^\s*(?:Pa|pascals?)\s*$/i, 'Pa', []],
  [/^\s*(?:bar)\s*$/i, 'bar', []],
  [/^\s*(?:psi)\s*$/i, 'psi', []],
  [/^\s*(?:atm|atmospheres?)\s*$/i, 'atm', []],
  [/^\s*(?:mmHg)\s*$/i, 'mmHg', []],
  [/^\s*(?:N|newtons?)\s*$/i, 'N', []],
  [/^\s*(?:lbf|pound[\s-]*force)\s*$/i, 'lbf', []],
  [/^\s*(?:Hz|hertz)\s*$/i, 'Hz', []],
  [/^\s*(?:kHz|kilohertz)\s*$/i, 'kHz', []],
  [/^\s*(?:MHz|megahertz)\s*$/i, 'MHz', []],
  [/^\s*(?:GHz|gigahertz)\s*$/i, 'GHz', []],
  [/^\s*(?:TB|terabytes?)\s*$/i, 'TB', []],
  [/^\s*(?:GB|gigabytes?)\s*$/i, 'GB', []],
  [/^\s*(?:MB|megabytes?)\s*$/i, 'MB', []],
  [/^\s*(?:KB|kilobytes?)\s*$/i, 'KB', []],
  [/^\s*(?:B|bytes?)\s*$/i, 'B', []],
  [/^\s*(?:bits?)\s*$/i, 'bit', []],
]

export function correctUnit(input: string): string {
  const lower = input.trim().toLowerCase()
  for (const [, id, misspellings] of UNIT_PATTERNS) {
    for (const wrong of misspellings) {
      if (lower === wrong.toLowerCase()) return id
    }
  }
  return input
}

export function extractUnit(text: string): string | null {
  const cleaned = text.trim().replace(/^of\s+/i, '')
  for (const [pattern, id] of UNIT_PATTERNS) {
    if (pattern.test(cleaned)) return id
  }
  const corrected = correctUnit(cleaned)
  if (corrected !== cleaned) {
    for (const [pattern, id] of UNIT_PATTERNS) {
      if (pattern.test(corrected)) return id
    }
  }
  return null
}

export function extractNumber(text: string): number | null {
  const m = text.match(/(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)/i)
  return m ? parseFloat(m[1]) : null
}

export function detectIntent(input: string): 'convert' | 'compare' | 'learn' | 'explain' | 'unknown' {
  const lower = input.toLowerCase()
  if (/how\s+(many|much|far|long|heavy|big)|what\s+is|what\s+are/i.test(lower)) return 'compare'
  if (/explain|how\s+does|why\s+does|how\s+it\s+works/i.test(lower)) return 'explain'
  if (/learn|teach|what\s+is\s+a|define/i.test(lower)) return 'learn'
  if (/convert|to\s+\w+|in\s+\w+|→|->/i.test(lower)) return 'convert'
  const hasNumber = /\d+/.test(lower)
  if (hasNumber) return 'convert'
  return 'unknown'
}

export function parseNaturalLanguage(input: string): ParsedExpression {
  const raw = input.trim()
  if (!raw || raw.length > 200) return { type: 'unknown', raw }

  const intent = detectIntent(raw)
  const steps: { label: string; value: string }[] = []

  // 1. Compound feet + inches to target unit: "5 ft 10 in to cm" or "5' 10\"" in m"
  const compoundMatch = raw.match(
    /^(?:convert\s+)?(-?\d+(?:\.\d+)?)\s*(?:'|′|ft|feet)\s*(\d+(?:\.\d+)?)?\s*(?:"|″|in|inch|inches)?\s+(?:into|to|in|as|→|->)\s+(.+)$/i
  )
  if (compoundMatch) {
    const ft = parseFloat(compoundMatch[1])
    const inches = compoundMatch[2] ? parseFloat(compoundMatch[2]) : 0
    const toUnit = extractUnit(compoundMatch[3])
    if (!isNaN(ft) && toUnit) {
      const totalFeet = ft + (ft < 0 ? -inches : inches) / 12
      return {
        type: 'convert',
        value: totalFeet,
        fromUnit: 'ft',
        toUnit,
        raw,
        intent,
      }
    }
  }

  // 2. Standard & full sentence patterns with scientific & negative number support
  const convertPatterns = [
    /^(?:(?:i\s+want\s+to\s+)?(?:convert|change|transform)\s+)?(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*([a-zA-Z°/\s-]+?)\s+(?:into|to|in|as)\s+([a-zA-Z°/\s-]+?)(?:\s+and\s+show\s+steps)?$/i,
    /^(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*([a-zA-Z°/\s-]+?)\s*(?:→|->|=>|=)\s*([a-zA-Z°/\s-]+?)$/i,
  ]

  for (const pattern of convertPatterns) {
    const m = raw.match(pattern)
    if (m) {
      const val = parseFloat(m[1])
      const fromRaw = m[2].trim()
      const toRaw = m[3].trim()
      const fromUnit = extractUnit(fromRaw)
      const toUnit = extractUnit(toRaw)
      if (fromUnit && toUnit && !isNaN(val)) {
        steps.push({ label: 'Parse input', value: `${val} ${fromRaw}` })
        steps.push({ label: 'Target unit', value: toRaw })
        return {
          type: 'convert',
          value: val,
          fromUnit,
          toUnit,
          raw,
          intent,
          steps,
        }
      }
    }
  }

  // 3. "How many [toUnit] in [val] [fromUnit]"
  const howManyMatch = raw.match(/^(?:how\s+many|how\s+much)\s+([a-zA-Z°/\s-]+?)\s+(?:is|are|in)\s+(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*([a-zA-Z°/\s-]+?)$/i)
  if (howManyMatch) {
    const toUnit = extractUnit(howManyMatch[1])
    const val = parseFloat(howManyMatch[2])
    const fromUnit = extractUnit(howManyMatch[3])
    if (fromUnit && toUnit && !isNaN(val)) {
      return { type: 'convert', value: val, fromUnit, toUnit, raw, intent }
    }
  }

  // 4. Fallback single value + unit: "25 km"
  const singleMatch = raw.match(/^(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s+([a-zA-Z°/]+)$/)
  if (singleMatch) {
    const val = parseFloat(singleMatch[1])
    const unit = extractUnit(singleMatch[2])
    if (!isNaN(val) && unit) {
      return { type: 'convert', value: val, fromUnit: unit, raw, intent }
    }
  }

  return { type: 'unknown', raw, intent }
}

export function parseMixedExpression(input: string): { values: number[]; units: string[]; ops: string[] } | null {
  const parts = input.split(/\s*([+\x2d])\s*/)
  if (parts.length < 3) return null
  const values: number[] = []
  const units: string[] = []
  const ops: string[] = []

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim()
    if (!part) continue
    if (part === '+' || part === '-') {
      ops.push(part)
      continue
    }
    const m = part.match(/^(-?\d+(?:\.\d+)?)\s*([a-zA-Z°/]+)$/)
    if (!m) return null
    const val = parseFloat(m[1])
    const unit = extractUnit(m[2])
    if (!isNaN(val) && unit) {
      values.push(val)
      units.push(unit)
    } else {
      return null
    }
  }

  if (values.length >= 2 && values.length === units.length) {
    return { values, units, ops }
  }
  return null
}

export function generateSteps(value: number, fromUnit: string, toUnit: string, result: number, formula: string): { label: string; value: string }[] {
  return [
    { label: 'Input', value: `${value} ${fromUnit}` },
    { label: 'Formula', value: formula },
    { label: 'Calculation', value: `${value} → ${result}` },
    { label: 'Result', value: `${result} ${toUnit}` },
  ]
}
