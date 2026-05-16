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
  [/(?:km|kilometer|kilometres?|kilo\s*meter)/i, 'km', []],
  [/(?<![a-zA-Z])m(?![\w])|meter|metres?/i, 'm', ['meter']],
  [/(?:cm|centimeter|centimetres?|centi\s*meter)/i, 'cm', []],
  [/(?:mm|millimeter|millimetres?|milli\s*meter)/i, 'mm', []],
  [/(?:mi|mile|miles)/i, 'mi', []],
  [/(?:ft|foot|feet)/i, 'ft', ['feet']],
  [/(?:in|inch|inches)/i, 'in', ['inches']],
  [/(?:yd|yard|yards)/i, 'yd', []],
  [/(?:kg|kilogram|kilograms|kilo\s*gram)/i, 'kg', []],
  [/(?:g|gram|grams)/i, 'g', []],
  [/(?:lb|lbs|pound|pounds)/i, 'lb', ['poundz']],
  [/(?:oz|ounce|ounces)/i, 'oz', []],
  [/(?:L|liter|liters|litre|litres)/i, 'L', []],
  [/(?:mL|milliliter|milliliters)/i, 'mL', []],
  [/(?:gal|gallon|gallons)/i, 'gal', []],
  [/(?:C|celsius)/i, 'C', []],
  [/(?:F|fahrenheit)/i, 'F', []],
  [/(?:K|kelvin)/i, 'K', []],
  [/(?:USD|usd|us\s*dollar)/i, 'USD', []],
  [/(?:EUR|eur|euro)/i, 'EUR', []],
  [/(?:GBP|gbp|pound\s*sterling|sterling)/i, 'GBP', []],
  [/(?:PKR|pkr|pakistani\s*rupee|rupee)/i, 'PKR', []],
  [/(?:INR|inr|indian\s*rupee)/i, 'INR', []],
  [/(?:mph|miles\s*per\s*hour)/i, 'mph', []],
  [/(?:kmh|km\/h|kph|kilometers?\s*per\s*hour)/i, 'kmh', []],
  [/(?:m\/s|mps|meters?\s*per\s*second)/i, 'mps', []],
  [/(?:watt|W)/i, 'W', []],
  [/(?:kW|kilowatt)/i, 'kW', []],
  [/(?:hp|horsepower)/i, 'hp', []],
  [/(?:J|joule)/i, 'J', []],
  [/(?:kWh|kilowatt.?.?hour)/i, 'kWh', []],
  [/(?:cal|calorie)/i, 'cal', []],
  [/(?:kcal|kilocalorie)/i, 'kcal', []],
  [/(?:Pa|pascal)/i, 'Pa', []],
  [/(?:bar)/i, 'bar', []],
  [/(?:psi)/i, 'psi', []],
  [/(?:mmHg)/i, 'mmHg', []],
  [/(?:N|newton)/i, 'N', []],
  [/(?:Hz|hertz)/i, 'Hz', []],
  [/(?:B|byte|bytes)/i, 'B', []],
  [/(?:GB|gigabyte)/i, 'GB', []],
  [/(?:MB|megabyte)/i, 'MB', []],
  [/(?:TB|terabyte)/i, 'TB', []],
]

export function correctUnit(input: string): string {
  const lower = input.toLowerCase()
  for (const [_, id, misspellings] of UNIT_PATTERNS) {
    for (const wrong of misspellings) {
      const regex = new RegExp(wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
      if (regex.test(lower)) return id
    }
  }
  return input
}

export function extractUnit(text: string): string | null {
  for (const [pattern, id] of UNIT_PATTERNS) {
    if (pattern.test(text.trim())) return id
  }
  const corrected = correctUnit(text)
  if (corrected !== text) {
    for (const [pattern, id] of UNIT_PATTERNS) {
      if (pattern.test(corrected)) return id
    }
  }
  return null
}

export function extractNumber(text: string): number | null {
  const m = text.match(/(\d+\.?\d*(?:e[+-]?\d+)?)/)
  return m ? parseFloat(m[1]) : null
}

export function detectIntent(input: string): 'convert' | 'compare' | 'learn' | 'explain' | 'unknown' {
  const lower = input.toLowerCase()
  if (/how\s+(many|much|far|long|heavy|big)|what\s+is|what\s+are/i.test(lower)) return 'compare'
  if (/explain|how\s+does|why\s+does|how\s+it\s+works/i.test(lower)) return 'explain'
  if (/learn|teach|what\s+is\s+a|define/i.test(lower)) return 'learn'
  if (/convert|to\s+\w+|in\s+\w+|→|->/i.test(lower)) return 'convert'
  const hasNumber = /\d+/.test(lower)
  const hasUnit = UNIT_PATTERNS.some(([p]) => p.test(lower))
  if (hasNumber && hasUnit) return 'convert'
  if (hasUnit) return 'compare'
  return 'unknown'
}

export function parseNaturalLanguage(input: string): ParsedExpression {
  const raw = input.trim()
  if (!raw) return { type: 'unknown', raw }

  const intent = detectIntent(raw)
  const steps: { label: string; value: string }[] = []

  // Full sentence: "Convert 15 kilometers into miles and show steps"
  const sentencePatterns = [
    /^(?:convert|change|transform)\s+(\d+\.?\d*)\s*(.+?)\s+(?:into|to|in|as)\s+(.+?)(?:\s+and\s+show\s+steps)?$/i,
    /^(?:i\s+want\s+to\s+)?convert\s+(\d+\.?\d*)\s*(.+?)\s+(?:into|to|in|as)\s+(.+)$/i,
    /^(\d+\.?\d*)\s*(.+?)\s+(?:into|to|in|as)\s+(.+)$/i,
  ]

  for (const pattern of sentencePatterns) {
    const m = raw.match(pattern)
    if (m) {
      const val = parseFloat(m[1])
      const fromRaw = m[2].trim()
      const toRaw = m[3].trim()
      const fromUnit = extractUnit(fromRaw)
      const toUnit = extractUnit(toRaw)
      if (fromUnit && toUnit && !isNaN(val)) {
        steps.push({ label: `Parse input`, value: `${val} ${fromRaw}` })
        steps.push({ label: `Target unit`, value: toRaw })
        return {
          type: 'convert', value: val, fromUnit, toUnit, raw,
          intent, steps
        }
      }
    }
  }

  // Standard patterns: "5 km in miles" or "100 USD to EUR"
  const convertPatterns = [
    /^(?:convert\s+)?(\d+\.?\d*)\s*(.+?)\s+(?:to|in|as)\s+(.+)$/i,
    /^(\d+\.?\d*)\s*(.+?)\s*(?:→|->|=>)\s*(.+)$/,
    /^(?:how\s+many|how\s+much)\s+(.+?)\s+(?:is|are|in)\s+(\d+\.?\d*)\s+(.+)$/i,
    /^(\d+\.?\d*)\s*(.+?)\s*=\s*(.+)$/,
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
        return { type: 'convert', value: val, fromUnit, toUnit, raw, intent }
      }
    }
  }

  // Mixed math: "(5km + 200m) × 2 in meters"
  const mathPattern = /^\(?(\d+\.?\d*)\s*(\w+)\s*([+\-×x*/])\s*(\d+\.?\d*)\s*(\w+)\s*\)?\s*(?:[×x*]\s*(\d+\.?\d*))?\s*(?:in|to)?\s*(\w+)?$/i
  const mm = raw.match(mathPattern)
  if (mm) {
    const v1 = parseFloat(mm[1]), u1 = extractUnit(mm[2])
    const op = mm[3], v2 = parseFloat(mm[4]), u2 = extractUnit(mm[5])
    const factor = mm[6] ? parseFloat(mm[6]) : 1
    const targetUnit = mm[7] ? extractUnit(mm[7]) : u1
    if (u1 && u2 && !isNaN(v1) && !isNaN(v2)) {
      return {
        type: 'calculate', value: v1, fromUnit: u1, toUnit: targetUnit || u1, raw,
        expressions: [
          { type: 'convert', value: v1, fromUnit: u1, toUnit: u1, raw: `${v1}${u1}` },
          { type: 'convert', value: v2, fromUnit: u2, toUnit: u1, raw: `${v2}${u2}` }
        ],
        operator: op === '+' ? '+' : op === '-' ? '-' : op === '×' || op === 'x' || op === '*' ? '*' : '/',
        intent
      }
    }
  }

  // Mixed expression: "5m + 20cm" or "1km + 500m"
  const mixedParts = raw.split(/\s*([+\-])\s*/)
  if (mixedParts.length >= 3) {
    const exprs: ParsedExpression[] = []
    for (let i = 0; i < mixedParts.length; i++) {
      const part = mixedParts[i].trim()
      if (part === '+' || part === '-') continue
      const val = extractNumber(part)
      const unit = extractUnit(part)
      if (val !== null && unit) {
        exprs.push({ type: 'convert', value: val, fromUnit: unit, toUnit: unit, raw: part })
      }
    }
    if (exprs.length >= 2) {
      return { type: 'calculate', expressions: exprs, operator: '+', raw, intent }
    }
  }

  // Fallback: try "value unit"
  const m = raw.match(/^(\d+\.?\d*)\s*(.+)$/)
  if (m) {
    const val = parseFloat(m[1])
    const unit = extractUnit(m[2])
    if (!isNaN(val) && unit) {
      return { type: 'convert', value: val, fromUnit: unit, raw, intent }
    }
  }

  return { type: 'unknown', raw, intent }
}

export function parseMixedExpression(input: string): { values: number[]; units: string[]; ops: string[] } | null {
  const parts = input.split(/\s*([+\-])\s*/)
  const values: number[] = []
  const units: string[] = []
  const ops: string[] = []

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim()
    if (part === '+' || part === '-') { ops.push(part); continue }
    const val = extractNumber(part)
    const unit = extractUnit(part)
    if (val !== null && unit) { values.push(val); units.push(unit) }
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
