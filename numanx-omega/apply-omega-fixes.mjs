#!/usr/bin/env node
/**
 * apply-omega-fixes.mjs
 * Single-Execution Master Auto-Patcher for NumanX Omega (web-html-main / numanx-omega)
 *
 * Usage:
 *   Place this file in the root of `web-html-main` (or inside `numanx-omega`) and run:
 *   node apply-omega-fixes.mjs
 */

import fs from 'node:fs'
import path from 'node:path'

const cwd = process.cwd()
const appDir = fs.existsSync(path.join(cwd, 'numanx-omega', 'package.json'))
  ? path.join(cwd, 'numanx-omega')
  : cwd

const LIVE_DOMAIN = 'https://numanx-studio-omega-converter.netlify.app'
const OLD_DOMAIN = 'https://numanx-omega.netlify.app'

function resolveAppFile(relPath) {
  return path.join(appDir, relPath)
}

function updateFile(relPath, transformFn, description) {
  const fullPath = resolveAppFile(relPath)
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️  Skipped (not found): ${relPath}`)
    return
  }
  const original = fs.readFileSync(fullPath, 'utf-8')
  const updated = transformFn(original)
  if (original !== updated) {
    fs.writeFileSync(fullPath, updated, 'utf-8')
    console.log(`✅ Patched ${relPath} — ${description}`)
  } else {
    console.log(`ℹ️  Already up-to-date: ${relPath}`)
  }
}

console.log(`\n🚀 Applying NumanX Omega Master Fixes in: ${appDir}\n`)

// 1. Replace old 404 canonical domain across all files
const domainFiles = [
  'index.html',
  'public/robots.txt',
  'public/sitemap.xml',
  'scripts/prerender-seo.mjs',
  'src/components/ui/SEOHead.tsx',
  'src/components/ui/JSONLD.tsx',
  'src/pages/CategoryLanding.tsx',
  'src/pages/PairLanding.tsx',
  'src/components/category/special/LengthProToolkit.tsx',
]

for (const file of domainFiles) {
  updateFile(
    file,
    (content) => content.replaceAll(OLD_DOMAIN, LIVE_DOMAIN),
    'Aligned canonical & sitemap domain with live Netlify URL'
  )
}

// 2. Fix public/robots.txt (Allow /icons/ for crawlers)
updateFile(
  'public/robots.txt',
  (content) => content.replace(/Disallow:\s*\/icons\/\s*/g, ''),
  'Allowed /icons/ in robots.txt'
)

// 3. Fix index.html broken apple-touch-icon (.png -> .svg)
updateFile(
  'index.html',
  (content) => content.replace('/icons/icon-192.png', '/icons/icon-192.svg'),
  'Fixed broken apple-touch-icon path (/icons/icon-192.svg)'
)

// 4. Fix public/sitemap.xml unencoded spaces & broken pair slugs
updateFile(
  'public/sitemap.xml',
  (content) =>
    content
      .replace('/convert/area/square meters-to-square feet', '/convert/area/m2-to-ft2')
      .replace('/convert/volume/milliliters-to-fluid ounces', '/convert/volume/ml-to-floz')
      .replace('/convert/fuel/mpg-to-l100km', '/convert/fuel/mpgus-to-l100km')
      .replace('/convert/fuel/l100km-to-mpg', '/convert/fuel/l100km-to-mpgus'),
  'Fixed unencoded spaces and invalid unit slugs in public/sitemap.xml'
)

// 5. Fix public/sw.js (Network-First for HTML navigation to prevent stale JS bundle white-screen)
updateFile(
  'public/sw.js',
  () => `const CACHE = 'omega-x-v2'
const PRECACHE_ASSETS = ['/', '/index.html', '/manifest.json', '/favicon.svg']

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_ASSETS)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return

  if (e.request.mode === 'navigate' || e.request.headers.get('accept')?.includes('text/html')) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(CACHE).then((c) => c.put(e.request, clone))
          }
          return res
        })
        .catch(() => caches.match(e.request).then((r) => r || caches.match('/index.html')))
    )
    return
  }

  e.respondWith(
    caches.match(e.request).then((cached) =>
      cached ||
      fetch(e.request).then((res) => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(CACHE).then((c) => c.put(e.request, clone))
        }
        return res
      })
    )
  )
})
`,
  'Upgraded Service Worker to Network-First HTML navigation (prevents stale bundle crashes)'
)

// 6. Fix src/utils/numbers.ts (Prevent sub-micro underflow to 0 in fmt & fmtComma)
updateFile(
  'src/utils/numbers.ts',
  (content) =>
    content
      .replace(
        `export function fmt(v: number | null | undefined, prec = 6): string {
  if (v === null || v === undefined || !isFinite(v)) return '—'
  return cleanFloat(Number(v.toFixed(prec))).toString()
}`,
        `export function fmt(v: number | null | undefined, prec = 6): string {
  if (v === null || v === undefined || !isFinite(v)) return '—'
  if (v === 0) return '0'
  const abs = Math.abs(v)
  if ((abs > 0 && abs < Math.pow(10, -Math.max(prec, 4))) || abs >= 1e12) {
    return cleanFloat(v, Math.max(prec, 4)).toExponential(Math.min(prec, 6))
  }
  return cleanFloat(Number(v.toFixed(prec))).toString()
}`
      )
      .replace(
        `export function fmtComma(v: number | null | undefined, prec = 2): string {
  if (v === null || v === undefined || !isFinite(v)) return '—'
  return Number(v.toFixed(prec)).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: prec,
  })
}`,
        `export function fmtComma(v: number | null | undefined, prec = 2): string {
  if (v === null || v === undefined || !isFinite(v)) return '—'
  if (v === 0) return '0'
  const abs = Math.abs(v)
  if ((abs > 0 && abs < Math.pow(10, -Math.max(prec, 4))) || abs >= 1e12) {
    return cleanFloat(v, Math.max(prec, 4)).toExponential(Math.min(prec, 6))
  }
  return cleanFloat(Number(v.toFixed(prec))).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: prec,
  })
}`
      ),
  'Fixed sub-micro underflow to 0 in fmt() and fmtComma()'
)

// 7. Fix src/engine/converter.ts (cleanFloat on temp/fuel, zero guard on fuel, complete formulas)
updateFile(
  'src/engine/converter.ts',
  () => `import type { CategoryDef } from '../types'
import { Categories } from './categories'
import { cleanFloat } from '../utils/numbers'

const customCategories: CategoryDef[] = []

export function getCategory(id: string): CategoryDef | undefined {
  return Categories.find(c => c.id === id) || customCategories.find(c => c.id === id)
}

export function getAllCategories(): CategoryDef[] {
  return [...Categories, ...customCategories]
}

export function getUnit(cat: CategoryDef, id: string) {
  return cat.un.find(u => u.id === id)
}

export function convertTemp(v: number, from: string, to: string): number {
  if (from === to) return cleanFloat(v)
  let c: number
  if (from === 'C') c = v
  else if (from === 'F') c = (v - 32) * 5 / 9
  else if (from === 'K') c = v - 273.15
  else if (from === 'R') c = (v - 491.67) * 5 / 9
  else if (from === 'Re') c = v * 1.25
  else c = v

  let out: number
  if (to === 'C') out = c
  else if (to === 'F') out = c * 9 / 5 + 32
  else if (to === 'K') out = c + 273.15
  else if (to === 'R') out = (c + 273.15) * 9 / 5
  else if (to === 'Re') out = c * 0.8
  else out = c
  return cleanFloat(out)
}

export function convertFuel(v: number, from: string, to: string): number | null {
  if (!Number.isFinite(v) || v <= 0) return null
  const toBase: Record<string, (n: number) => number> = {
    kmL: n => n,
    L100km: n => 100 / n,
    mpgUS: n => n * 0.425144,
    mpgUK: n => n * 0.354006
  }
  const fromBase: Record<string, (n: number) => number> = {
    kmL: n => n,
    L100km: n => 100 / n,
    mpgUS: n => n / 0.425144,
    mpgUK: n => n / 0.354006
  }
  if (!toBase[from] || !fromBase[to]) return null
  if (from === to) return cleanFloat(v)
  return cleanFloat(fromBase[to](toBase[from](v)))
}

export function convert(v: number, catId: string, fromId: string, toId: string): number | null {
  const cat = getCategory(catId)
  if (!cat || (v !== 0 && !v) || !Number.isFinite(v)) return null

  if (cat.id === 'temp') return convertTemp(v, fromId, toId)
  if (cat.id === 'fuel') return convertFuel(v, fromId, toId)

  const fu = getUnit(cat, fromId)
  const tu = getUnit(cat, toId)
  if (!fu || !tu || !fu.r || !tu.r) return null

  return cleanFloat((v * fu.r) / tu.r)
}

export function convertAll(v: number, catId: string, fromId: string): { id: string; label: string; value: number | null }[] {
  const cat = getCategory(catId)
  if (!cat) return []
  return cat.un.map(u => ({
    id: u.id,
    label: u.lb,
    value: u.id === fromId ? v : convert(v, catId, fromId, u.id)
  }))
}

export function getFormula(catId: string, fromId: string, toId: string): string {
  const cat = getCategory(catId)
  if (!cat || fromId === toId) return ''

  if (cat.id === 'temp') {
    const map: Record<string, string> = {
      'C->F': '°F = (°C × 9/5) + 32',
      'F->C': '°C = (°F − 32) × 5/9',
      'C->K': 'K = °C + 273.15',
      'K->C': '°C = K − 273.15',
      'F->K': 'K = (°F − 32) × 5/9 + 273.15',
      'K->F': '°F = (K − 273.15) × 9/5 + 32',
      'C->R': '°R = (°C + 273.15) × 9/5',
      'R->C': '°C = (°R − 491.67) × 5/9',
    }
    return map[\`\${fromId}->\${toId}\`] || \`\${fromId} → \${toId}\`
  }

  if (cat.id === 'fuel') {
    if ((fromId === 'mpgUS' && toId === 'L100km') || (fromId === 'L100km' && toId === 'mpgUS')) {
      return 'L/100km = 235.215 ÷ MPG (US)'
    }
    if ((fromId === 'mpgUK' && toId === 'L100km') || (fromId === 'L100km' && toId === 'mpgUK')) {
      return 'L/100km = 282.481 ÷ MPG (UK)'
    }
    const sample = convert(1, 'fuel', fromId, toId)
    return sample !== null ? \`1 \${fromId} ≈ \${cleanFloat(sample, 6)} \${toId}\` : ''
  }

  const fu = getUnit(cat, fromId)
  const tu = getUnit(cat, toId)
  if (!fu || !tu || !fu.r || !tu.r) return ''
  const factor = cleanFloat(fu.r / tu.r, 8)
  return \`1 \${fu.lb} = \${factor} \${tu.lb}\`
}

export function addCustomUnit(catId: string, id: string, label: string, rate: number) {
  const cat = getCategory(catId)
  if (!cat) return false
  if (cat.un.find(u => u.id === id)) return false
  cat.un.push({ id, lb: label, r: rate, s: 'C', custom: true })
  return true
}
`,
  'Hardened converter.ts math, fuel division-by-zero guard, cleanFloat wrapping, and formulas'
)

// 8. Fix src/engine/smartParser.ts (Word boundaries, negative & scientific notation, compound ft/in)
updateFile(
  'src/engine/smartParser.ts',
  () => `export interface ParsedExpression {
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
  [/^\\s*(?:km|kilometers?|kilometres?|kilo\\s*meters?)\\s*$/i, 'km', []],
  [/^\\s*(?:cm|centimeters?|centimetres?|centi\\s*meters?)\\s*$/i, 'cm', []],
  [/^\\s*(?:mm|millimeters?|millimetres?|milli\\s*meters?)\\s*$/i, 'mm', []],
  [/^\\s*(?:nm|nanometers?)\\s*$/i, 'nm', []],
  [/^\\s*(?:um|micrometers?)\\s*$/i, 'um', []],
  [/^\\s*(?:m|meters?|metres?)\\s*$/i, 'm', ['meter']],
  [/^\\s*(?:mi|miles?)\\s*$/i, 'mi', []],
  [/^\\s*(?:nmi|nautical\\s*miles?)\\s*$/i, 'nmi', []],
  [/^\\s*(?:ft|foot|feet)\\s*$/i, 'ft', ['feet']],
  [/^\\s*(?:in|inch|inches)\\s*$/i, 'in', ['inches']],
  [/^\\s*(?:yd|yards?)\\s*$/i, 'yd', []],
  [/^\\s*(?:kg|kilograms?|kilo\\s*grams?)\\s*$/i, 'kg', []],
  [/^\\s*(?:mg|milligrams?)\\s*$/i, 'mg', []],
  [/^\\s*(?:g|grams?)\\s*$/i, 'g', []],
  [/^\\s*(?:lbs?|pounds?)\\s*$/i, 'lb', ['poundz']],
  [/^\\s*(?:oz|ounces?)\\s*$/i, 'oz', []],
  [/^\\s*(?:st|stones?)\\s*$/i, 'stone', []],
  [/^\\s*(?:mL|milliliters?|millilitres?)\\s*$/i, 'mL', []],
  [/^\\s*(?:L|liters?|litres?)\\s*$/i, 'L', []],
  [/^\\s*(?:gal|gallons?)\\s*$/i, 'gal', []],
  [/^\\s*(?:qt|quarts?)\\s*$/i, 'qt', []],
  [/^\\s*(?:pt|pints?)\\s*$/i, 'pt', []],
  [/^\\s*(?:fl\\s*oz|floz|fluid\\s*ounces?)\\s*$/i, 'floz', []],
  [/^\\s*(?:°?\\s*C|celsius)\\s*$/i, 'C', []],
  [/^\\s*(?:°?\\s*F|fahrenheits?)\\s*$/i, 'F', []],
  [/^\\s*(?:°?\\s*K|kelvins?)\\s*$/i, 'K', []],
  [/^\\s*(?:USD|us\\s*dollars?)\\s*$/i, 'USD', []],
  [/^\\s*(?:EUR|euros?)\\s*$/i, 'EUR', []],
  [/^\\s*(?:GBP|pound\\s*sterling|sterling)\\s*$/i, 'GBP', []],
  [/^\\s*(?:PKR|pakistani\\s*rupees?|rupees?)\\s*$/i, 'PKR', []],
  [/^\\s*(?:INR|indian\\s*rupees?)\\s*$/i, 'INR', []],
  [/^\\s*(?:mph|miles?\\s*per\\s*hour)\\s*$/i, 'mph', []],
  [/^\\s*(?:kmh|km\\/h|kph|kilometers?\\s*per\\s*hour)\\s*$/i, 'kmh', []],
  [/^\\s*(?:m\\/s|mps|meters?\\s*per\\s*second)\\s*$/i, 'mps', []],
  [/^\\s*(?:kWh|kilowatt[\\s-]*hours?)\\s*$/i, 'kWh', []],
  [/^\\s*(?:Wh|watt[\\s-]*hours?)\\s*$/i, 'Wh', []],
  [/^\\s*(?:kW|kilowatts?)\\s*$/i, 'kW', []],
  [/^\\s*(?:MW|megawatts?)\\s*$/i, 'MW', []],
  [/^\\s*(?:W|watts?)\\s*$/i, 'W', []],
  [/^\\s*(?:hp|horsepower)\\s*$/i, 'hp', []],
  [/^\\s*(?:kcal|kilocalories?)\\s*$/i, 'kcal', []],
  [/^\\s*(?:cal|calories?)\\s*$/i, 'cal', []],
  [/^\\s*(?:kJ|kilojoules?)\\s*$/i, 'kJ', []],
  [/^\\s*(?:J|joules?)\\s*$/i, 'J', []],
  [/^\\s*(?:BTU)\\s*$/i, 'BTU', []],
  [/^\\s*(?:kPa|kilopascals?)\\s*$/i, 'kPa', []],
  [/^\\s*(?:MPa|megapascals?)\\s*$/i, 'MPa', []],
  [/^\\s*(?:Pa|pascals?)\\s*$/i, 'Pa', []],
  [/^\\s*(?:bar)\\s*$/i, 'bar', []],
  [/^\\s*(?:psi)\\s*$/i, 'psi', []],
  [/^\\s*(?:atm|atmospheres?)\\s*$/i, 'atm', []],
  [/^\\s*(?:mmHg)\\s*$/i, 'mmHg', []],
  [/^\\s*(?:N|newtons?)\\s*$/i, 'N', []],
  [/^\\s*(?:lbf|pound[\\s-]*force)\\s*$/i, 'lbf', []],
  [/^\\s*(?:Hz|hertz)\\s*$/i, 'Hz', []],
  [/^\\s*(?:kHz|kilohertz)\\s*$/i, 'kHz', []],
  [/^\\s*(?:MHz|megahertz)\\s*$/i, 'MHz', []],
  [/^\\s*(?:GHz|gigahertz)\\s*$/i, 'GHz', []],
  [/^\\s*(?:TB|terabytes?)\\s*$/i, 'TB', []],
  [/^\\s*(?:GB|gigabytes?)\\s*$/i, 'GB', []],
  [/^\\s*(?:MB|megabytes?)\\s*$/i, 'MB', []],
  [/^\\s*(?:KB|kilobytes?)\\s*$/i, 'KB', []],
  [/^\\s*(?:B|bytes?)\\s*$/i, 'B', []],
  [/^\\s*(?:bits?)\\s*$/i, 'bit', []],
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
  const cleaned = text.trim().replace(/^of\\s+/i, '')
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
  const m = text.match(/(-?\\d+(?:\\.\\d+)?(?:e[+-]?\\d+)?)/i)
  return m ? parseFloat(m[1]) : null
}

export function detectIntent(input: string): 'convert' | 'compare' | 'learn' | 'explain' | 'unknown' {
  const lower = input.toLowerCase()
  if (/how\\s+(many|much|far|long|heavy|big)|what\\s+is|what\\s+are/i.test(lower)) return 'compare'
  if (/explain|how\\s+does|why\\s+does|how\\s+it\\s+works/i.test(lower)) return 'explain'
  if (/learn|teach|what\\s+is\\s+a|define/i.test(lower)) return 'learn'
  if (/convert|to\\s+\\w+|in\\s+\\w+|→|->/i.test(lower)) return 'convert'
  const hasNumber = /\\d+/.test(lower)
  if (hasNumber) return 'convert'
  return 'unknown'
}

export function parseNaturalLanguage(input: string): ParsedExpression {
  const raw = input.trim()
  if (!raw || raw.length > 200) return { type: 'unknown', raw }

  const intent = detectIntent(raw)
  const steps: { label: string; value: string }[] = []

  // 1. Compound feet + inches to target unit: "5 ft 10 in to cm" or "5' 10\\"" in m"
  const compoundMatch = raw.match(
    /^(?:convert\\s+)?(-?\\d+(?:\\.\\d+)?)\\s*(?:'|′|ft|feet)\\s*(\\d+(?:\\.\\d+)?)?\\s*(?:"|″|in|inch|inches)?\\s+(?:into|to|in|as|→|->)\\s+(.+)$/i
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
    /^(?:(?:i\\s+want\\s+to\\s+)?(?:convert|change|transform)\\s+)?(-?\\d+(?:\\.\\d+)?(?:e[+-]?\\d+)?)\\s*([a-zA-Z°/\\s-]+?)\\s+(?:into|to|in|as)\\s+([a-zA-Z°/\\s-]+?)(?:\\s+and\\s+show\\s+steps)?$/i,
    /^(-?\\d+(?:\\.\\d+)?(?:e[+-]?\\d+)?)\\s*([a-zA-Z°/\\s-]+?)\\s*(?:→|->|=>|=)\\s*([a-zA-Z°/\\s-]+?)$/i,
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
        steps.push({ label: 'Parse input', value: \`\${val} \${fromRaw}\` })
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
  const howManyMatch = raw.match(/^(?:how\\s+many|how\\s+much)\\s+([a-zA-Z°/\\s-]+?)\\s+(?:is|are|in)\\s+(-?\\d+(?:\\.\\d+)?(?:e[+-]?\\d+)?)\\s*([a-zA-Z°/\\s-]+?)$/i)
  if (howManyMatch) {
    const toUnit = extractUnit(howManyMatch[1])
    const val = parseFloat(howManyMatch[2])
    const fromUnit = extractUnit(howManyMatch[3])
    if (fromUnit && toUnit && !isNaN(val)) {
      return { type: 'convert', value: val, fromUnit, toUnit, raw, intent }
    }
  }

  // 4. Fallback single value + unit: "25 km"
  const singleMatch = raw.match(/^(-?\\d+(?:\\.\\d+)?(?:e[+-]?\\d+)?)\\s+([a-zA-Z°/]+)$/)
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
  const parts = input.split(/\\s*([+\\x2d])\\s*/)
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
    const m = part.match(/^(-?\\d+(?:\\.\\d+)?)\\s*([a-zA-Z°/]+)$/)
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
    { label: 'Input', value: \`\${value} \${fromUnit}\` },
    { label: 'Formula', value: formula },
    { label: 'Calculation', value: \`\${value} → \${result}\` },
    { label: 'Result', value: \`\${result} \${toUnit}\` },
  ]
}
`,
  'Fixed UNIT_PATTERNS regex collisions, compound feet/inches NLP, scientific notation, and negative values'
)

// 9. Fix src/components/converter/UniversalConverter.tsx (NLP rawVal assignment + valid alsoTry IDs)
updateFile(
  'src/components/converter/UniversalConverter.tsx',
  (content) =>
    content
      .replace(
        `      const parsed = parseNaturalLanguage(fromVal)
      if (parsed.type === 'convert' && parsed.value !== undefined && parsed.fromUnit && parsed.toUnit) {
        startTransition(() => setIsNatural(true))
        if (parsed.fromUnit !== fromUnit) startTransition(() => setFromUnit(parsed.fromUnit))
        if (parsed.toUnit !== toUnit) startTransition(() => setToUnit(parsed.toUnit))
      } else {`,
        `      const parsed = parseNaturalLanguage(fromVal)
      if (parsed.type === 'convert' && parsed.value !== undefined && parsed.fromUnit && parsed.toUnit) {
        rawVal = parsed.value
        const targetCat = cats.find(c => c.un.some(u => u.id === parsed.fromUnit) && c.un.some(u => u.id === parsed.toUnit))
        if (targetCat && targetCat.id !== catId) {
          startTransition(() => {
            setCatId(targetCat.id)
            setFromUnit(parsed.fromUnit!)
            setToUnit(parsed.toUnit!)
          })
          return
        }
        startTransition(() => setIsNatural(true))
        if (parsed.fromUnit !== fromUnit) startTransition(() => setFromUnit(parsed.fromUnit!))
        if (parsed.toUnit !== toUnit) startTransition(() => setToUnit(parsed.toUnit!))
      } else {`
      )
      .replace(
        `      { from: 'l', to: 'gal', label: 'L → gallons' },
      { from: 'ml', to: 'fl_oz', label: 'mL → fl oz' },
      { from: 'c', to: 'f', label: '°C → °F' },
      { from: 'f', to: 'c', label: '°F → °C' },
      { from: 'kmh', to: 'mph', label: 'km/h → mph' },
      { from: 'sqm', to: 'sqft', label: 'm² → ft²' },
      { from: 'mb', to: 'gb', label: 'MB → GB' },`,
        `      { from: 'L', to: 'gal', label: 'L → gallons' },
      { from: 'mL', to: 'floz', label: 'mL → fl oz' },
      { from: 'C', to: 'F', label: '°C → °F' },
      { from: 'F', to: 'C', label: '°F → °C' },
      { from: 'kmh', to: 'mph', label: 'km/h → mph' },
      { from: 'm2', to: 'ft2', label: 'm² → ft²' },
      { from: 'MB', to: 'GB', label: 'MB → GB' },`
      ),
  'Fixed NLP rawVal=null bug and corrected alsoTry unit IDs in UniversalConverter.tsx'
)

// 10. Fix src/components/widgets/AIPredictions.tsx (Match actual Category & Unit IDs)
updateFile(
  'src/components/widgets/AIPredictions.tsx',
  (content) =>
    content.replace(
      `  volume: [
    { from: 'l', to: 'gal', label: 'L → gallons' },
    { from: 'ml', to: 'fl_oz', label: 'mL → fl oz' },
    { from: 'cup', to: 'ml', label: 'cups → mL' },
  ],
  temperature: [
    { from: 'c', to: 'f', label: '°C → °F' },
    { from: 'f', to: 'c', label: '°F → °C' },
  ],
  speed: [
    { from: 'kmh', to: 'mph', label: 'km/h → mph' },
    { from: 'ms', to: 'kmh', label: 'm/s → km/h' },
  ],
  area: [
    { from: 'sqm', to: 'sqft', label: 'm² → ft²' },
    { from: 'ha', to: 'acre', label: 'ha → acres' },
  ],
  digital: [
    { from: 'mb', to: 'gb', label: 'MB → GB' },
    { from: 'gb', to: 'tb', label: 'GB → TB' },
  ],`,
      `  volume: [
    { from: 'L', to: 'gal', label: 'L → gallons' },
    { from: 'mL', to: 'floz', label: 'mL → fl oz' },
    { from: 'cup', to: 'mL', label: 'cups → mL' },
  ],
  temp: [
    { from: 'C', to: 'F', label: '°C → °F' },
    { from: 'F', to: 'C', label: '°F → °C' },
  ],
  speed: [
    { from: 'kmh', to: 'mph', label: 'km/h → mph' },
    { from: 'mps', to: 'kmh', label: 'm/s → km/h' },
  ],
  area: [
    { from: 'm2', to: 'ft2', label: 'm² → ft²' },
    { from: 'ha', to: 'ac', label: 'ha → acres' },
  ],
  data: [
    { from: 'MB', to: 'GB', label: 'MB → GB' },
    { from: 'GB', to: 'TB', label: 'GB → TB' },
  ],`
    ),
  'Fixed invalid unit & category IDs in AIPredictions.tsx'
)

// 11. Fix src/components/widgets/ConversionQuiz.tsx (Eliminate infinite while loop on negative/zero answers)
updateFile(
  'src/components/widgets/ConversionQuiz.tsx',
  (content) =>
    content.replace(
      `function generateQuestion(): QuizQuestion {
  const cats = getAllCategories()
  const cat = cats[Math.floor(Math.random() * cats.length)]
  const fromIdx = Math.floor(Math.random() * cat.un.length)
  let toIdx = Math.floor(Math.random() * cat.un.length)
  while (toIdx === fromIdx) toIdx = Math.floor(Math.random() * cat.un.length)
  const fromUnit = cat.un[fromIdx]
  const toUnit = cat.un[toIdx]
  const values = [0.5, 1, 2, 5, 10, 25, 50, 100, 250, 500, 1000]
  const value = values[Math.floor(Math.random() * values.length)]
  const result = convert(value, cat.id, fromUnit.id, toUnit.id)
  const correct = result !== null ? parseFloat(result.toFixed(4)) : 0

  const options = new Set<number>([correct])
  while (options.size < 4) {
    const offset = (Math.random() > 0.5 ? 1 : -1) * Math.max(correct * 0.1, 1) * (Math.floor(Math.random() * 5) + 1)
    const alt = parseFloat((correct + offset).toFixed(4))
    if (alt > 0 && alt !== correct) options.add(alt)
  }
  const shuffled = Array.from(options).sort(() => Math.random() - 0.5)

  return {
    category: cat.lb, catIcon: cat.ic || '🔄',
    fromUnit: fromUnit.id, fromLabel: fromUnit.lb,
    toUnit: toUnit.id, toLabel: toUnit.lb,
    value, correctAnswer: correct, options: shuffled,
  }
}`,
      `function generateQuestion(): QuizQuestion {
  const validCats = getAllCategories().filter(
    c => c.un.length >= 2 && !['textile', 'electricity', 'magnetism', 'astronomy'].includes(c.id)
  )
  const cat = validCats[Math.floor(Math.random() * validCats.length)]
  const fromIdx = Math.floor(Math.random() * cat.un.length)
  let toIdx = Math.floor(Math.random() * cat.un.length)
  while (toIdx === fromIdx) toIdx = Math.floor(Math.random() * cat.un.length)
  const fromUnit = cat.un[fromIdx]
  const toUnit = cat.un[toIdx]
  const values = [1, 2, 5, 10, 25, 50, 100]
  const value = values[Math.floor(Math.random() * values.length)]
  const rawResult = convert(value, cat.id, fromUnit.id, toUnit.id) ?? 1
  const correct = Math.abs(rawResult) < 1e-3 && rawResult !== 0
    ? Number(rawResult.toPrecision(4))
    : parseFloat(rawResult.toFixed(4))

  const options = new Set<number>([correct])
  const multipliers = [0.5, 2, 10, 0.1, 1.25, 0.8]
  for (const m of multipliers) {
    if (options.size >= 4) break
    const candidate = correct === 0
      ? options.size * 5
      : Number((correct * m).toPrecision(4))
    if (candidate !== correct && Number.isFinite(candidate)) {
      options.add(candidate)
    }
  }
  while (options.size < 4) {
    options.add(Number((correct + options.size * 2.5).toFixed(4)))
  }
  const shuffled = Array.from(options).sort(() => Math.random() - 0.5)

  return {
    category: cat.lb, catIcon: cat.ic || '🔄',
    fromUnit: fromUnit.id, fromLabel: fromUnit.lb,
    toUnit: toUnit.id, toLabel: toUnit.lb,
    value, correctAnswer: correct, options: shuffled,
  }
}`
    ),
  'Fixed infinite loop on negative/small quiz answers in ConversionQuiz.tsx'
)

// 12. Fix src/pages/Sitemap.tsx (guide.category.toUpperCase() crash -> guide.relatedCat.toUpperCase())
updateFile(
  'src/pages/Sitemap.tsx',
  (content) => content.replace('{guide.category.toUpperCase()} GUIDE', '{guide.relatedCat.toUpperCase()} GUIDE'),
  'Fixed runtime crash on /sitemap (guide.relatedCat.toUpperCase())'
)

// 13. Fix src/engine/guideContent.ts (Duplicate celsius-to-fahrenheit key & wrong relatedCat values)
updateFile(
  'src/engine/guideContent.ts',
  (content) => {
    let count = 0
    let fixed = content.replace(/'celsius-to-fahrenheit':\s*\{/g, (match) => {
      count++
      return count === 2 ? "'kg-to-lbs': {" : match
    })
    fixed = fixed
      .replace(/relatedCat:\s*'temperature'/g, "relatedCat: 'temp'")
      .replace(
        `    relatedGuides: [
      { label: 'Kilograms to Pounds Converter', slug: 'kg-to-lbs' },
      { label: 'Celsius to Fahrenheit Converter', slug: 'celsius-to-fahrenheit' },
      { label: 'Meters to Feet Converter', slug: 'meters-to-feet' },
    ],
    relatedCat: 'length',`,
        `    relatedGuides: [
      { label: 'Kilograms to Pounds Converter', slug: 'kg-to-lbs' },
      { label: 'Celsius to Fahrenheit Converter', slug: 'celsius-to-fahrenheit' },
      { label: 'Meters to Feet Converter', slug: 'meters-to-feet' },
    ],
    relatedCat: 'mass',`
      )
      .replace(
        `    relatedGuides: [
      { label: 'Feet to Meters Converter', slug: 'feet-to-meters' },
      { label: 'Kilograms to Pounds Converter', slug: 'kg-to-lbs' },
      { label: 'Celsius to Fahrenheit Converter', slug: 'celsius-to-fahrenheit' },
    ],
    relatedCat: 'mass',`,
        `    relatedGuides: [
      { label: 'Feet to Meters Converter', slug: 'feet-to-meters' },
      { label: 'Kilograms to Pounds Converter', slug: 'kg-to-lbs' },
      { label: 'Celsius to Fahrenheit Converter', slug: 'celsius-to-fahrenheit' },
    ],
    relatedCat: 'length',`
      )
    return fixed
  },
  'Fixed duplicate celsius-to-fahrenheit key overwriting kg-to-lbs in guideContent.ts'
)

// 14. Fix src/components/ui/OnboardingTour.tsx (Inverted localStorage check)
updateFile(
  'src/components/ui/OnboardingTour.tsx',
  (content) =>
    content.replace(
      "const [dismissed, setDismissed] = useState(() => !localStorage.getItem('uc_onboarded'))",
      "const [dismissed, setDismissed] = useState(() => Boolean(localStorage.getItem('uc_onboarded')))"
    ),
  'Fixed inverted localStorage check in OnboardingTour.tsx'
)

// 15. Fix src/components/charts/CurrencyCenter.tsx (Inverted exchange rate chart formula)
updateFile(
  'src/components/charts/CurrencyCenter.tsx',
  (content) =>
    content.replace(
      'data: CURRENCY_LIST.slice(0, 10).map(c => rates[c] ? rates[from] / rates[c] : 0),',
      'data: CURRENCY_LIST.slice(0, 10).map(c => rates[c] && rates[from] ? rates[c] / rates[from] : 0),'
    ),
  'Fixed inverted currency rate formula in CurrencyCenter.tsx'
)

// 16. Fix src/engine/visualContext.ts (Convert value to base unit & handle negative temperatures)
updateFile(
  'src/engine/visualContext.ts',
  (content) =>
    content.replace(
      `export function findVisualContext(catId: string, value: number, _unitId: string): VisualRef | null { // eslint-disable-line @typescript-eslint/no-unused-vars
  const refs = VISUAL_CONTEXT[catId]
  if (!refs) return null

  // Find the closest reference
  let best: VisualRef | null = null
  let bestDiff = Infinity
  for (const ref of refs) {
    const diff = Math.abs(Math.log10(value) - Math.log10(ref.value))
    if (diff < bestDiff) {
      bestDiff = diff
      best = ref
    }
  }
  // Only show if within reasonable range (within 2 orders of magnitude)
  if (bestDiff > 1.5) return null
  return best
}`,
      `import { convert } from './converter'

const BASE_UNIT_BY_CAT: Record<string, string> = {
  length: 'm',
  mass: 'kg',
  area: 'm2',
  volume: 'm3',
  temp: 'C',
  speed: 'mps',
}

export function findVisualContext(catId: string, value: number, unitId: string): VisualRef | null {
  const refs = VISUAL_CONTEXT[catId]
  const baseUnit = BASE_UNIT_BY_CAT[catId]
  if (!refs || !baseUnit || !Number.isFinite(value)) return null

  const baseValue = unitId === baseUnit ? value : convert(value, catId, unitId, baseUnit)
  if (baseValue === null || !Number.isFinite(baseValue)) return null

  if (catId === 'temp') {
    let best: VisualRef | null = null
    let bestDiff = Infinity
    for (const ref of refs) {
      const diff = Math.abs(baseValue - ref.value)
      if (diff < bestDiff) {
        bestDiff = diff
        best = ref
      }
    }
    return bestDiff <= 25 ? best : null
  }

  if (baseValue <= 0) return null
  let best: VisualRef | null = null
  let bestDiff = Infinity
  for (const ref of refs) {
    if (ref.value <= 0) continue
    const diff = Math.abs(Math.log10(baseValue) - Math.log10(ref.value))
    if (diff < bestDiff) {
      bestDiff = diff
      best = ref
    }
  }
  if (bestDiff > 1.5) return null
  return best
}`
    ),
  'Fixed unit-aware base conversion and sub-zero temperature support in visualContext.ts'
)

// 17. Fix modulo rollover bugs in LengthComparisonBar.tsx and MassWeightReference.tsx
updateFile(
  'src/components/category/special/LengthComparisonBar.tsx',
  (content) =>
    content.replace(
      `  const { feet, inches, totalInches, fraction16, fraction32, fraction64 } = useMemo(() => {
    const totalIn = cm / 2.54
    const ft = Math.floor(totalIn / 12)
    const inch = Math.round(totalIn % 12)
    
    // Fractional helper
    const getFraction = (denominator: number) => {
      const remainingInches = totalIn % 12
      const wholeInches = Math.floor(remainingInches)
      const fractionalPart = remainingInches - wholeInches
      const numer = Math.round(fractionalPart * denominator)
      
      if (numer === 0) return { ft, wholeInches, numer: 0, denom: denominator, str: \`\${ft}′ \${wholeInches}″\` }
      if (numer === denominator) return { ft, wholeInches: wholeInches + 1, numer: 0, denom: denominator, str: \`\${ft}′ \${wholeInches + 1}″\` }
      
      // Simplify fraction
      let n = numer
      let d = denominator
      while (n % 2 === 0 && d % 2 === 0) {
        n /= 2
        d /= 2
      }
      return { ft, wholeInches, numer: n, denom: d, str: \`\${ft}′ \${wholeInches} \${n}/\${d}″\` }
    }

    return {
      feet: ft,
      inches: inch === 12 ? 0 : inch,
      totalInches: totalIn,
      fraction16: getFraction(16),
      fraction32: getFraction(32),
      fraction64: getFraction(64),
    }
  }, [cm])`,
      `  const { feet, inches, totalInches, fraction16, fraction32, fraction64 } = useMemo(() => {
    const totalIn = cm / 2.54
    const roundedTotalIn = Math.round(totalIn)
    const ft = Math.floor(roundedTotalIn / 12)
    const inch = roundedTotalIn % 12

    const getFraction = (denominator: number) => {
      const totalSteps = Math.round(totalIn * denominator)
      const totalWholeIn = Math.floor(totalSteps / denominator)
      const remSteps = totalSteps % denominator
      const fFt = Math.floor(totalWholeIn / 12)
      const wholeInches = totalWholeIn % 12

      if (remSteps === 0) {
        return { ft: fFt, wholeInches, numer: 0, denom: denominator, str: \`\${fFt}′ \${wholeInches}″\` }
      }
      let n = remSteps
      let d = denominator
      while (n % 2 === 0 && d % 2 === 0) {
        n /= 2
        d /= 2
      }
      return { ft: fFt, wholeInches, numer: n, denom: d, str: \`\${fFt}′ \${wholeInches} \${n}/\${d}″\` }
    }

    return {
      feet: ft,
      inches: inch,
      totalInches: totalIn,
      fraction16: getFraction(16),
      fraction32: getFraction(32),
      fraction64: getFraction(64),
    }
  }, [cm])`
    ),
  'Fixed feet/inches modulo rollover bug (5\' 12" -> 6\' 0") in LengthComparisonBar.tsx'
)

updateFile(
  'src/components/category/special/MassWeightReference.tsx',
  (content) =>
    content.replace(
      `  const stone = useMemo(() => {
    const totalSt = lb / 14
    const st = Math.floor(totalSt)
    const remLb = Math.round(lb % 14)
    return \`\${st} st \${remLb} lb\`
  }, [lb])`,
      `  const stone = useMemo(() => {
    const totalRoundedLb = Math.round(lb)
    const st = Math.floor(totalRoundedLb / 14)
    const remLb = totalRoundedLb % 14
    return \`\${st} st \${remLb} lb\`
  }, [lb])`
    ),
  'Fixed UK Stone modulo rollover bug (3 st 14 lb -> 4 st 0 lb) in MassWeightReference.tsx'
)

// 18. Fix unused locals in visualizers
updateFile(
  'src/components/category/special/AngleVisualizer.tsx',
  (content) => content.replace(/^\s*const arcsec = useMemo.*\n/m, ''),
  'Removed unused arcsec variable in AngleVisualizer.tsx'
)

updateFile(
  'src/components/category/special/AreaVisualizer.tsx',
  (content) =>
    content
      .replace(/^\s*const sqyd = useMemo.*\n/m, '')
      .replace(/^\s*const sqkm = useMemo.*\n/m, ''),
  'Removed unused sqyd and sqkm variables in AreaVisualizer.tsx'
)

updateFile(
  'src/components/category/special/PowerVisualizer.tsx',
  (content) => content.replace(/^\s*const megawatts = useMemo.*\n/m, ''),
  'Removed unused megawatts variable in PowerVisualizer.tsx'
)

updateFile(
  'src/components/category/special/SpeedVisualizer.tsx',
  (content) => content.replace(/import \{ motion \} from 'framer-motion'\n/, ''),
  'Removed unused motion import in SpeedVisualizer.tsx'
)

updateFile(
  'src/components/category/special/TimeVisualizer.tsx',
  (content) => content.replace(/^\s*const weeks = useMemo.*\n/m, ''),
  'Removed unused weeks variable in TimeVisualizer.tsx'
)

// 19. Fix AnimatedNumber.tsx duplicate formatVal & RAF cleanup
updateFile(
  'src/components/ui/AnimatedNumber.tsx',
  () => `import { useEffect, useRef, useState } from 'react'

function formatVal(v: number, d: number) {
  return v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: d })
}

export default function AnimatedNumber({ value, duration = 300, decimals = 2 }: { value: number | null; duration?: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const prevValue = useRef(value)
  const isInvalid = value === null || value === undefined || !isFinite(value)
  const [display, setDisplay] = useState(isInvalid ? '—' : formatVal(value, decimals))

  useEffect(() => {
    if (isInvalid) return
    const from = prevValue.current !== null && isFinite(prevValue.current) ? prevValue.current : value
    const to = value!
    prevValue.current = value
    if (from === to) {
      setDisplay(formatVal(to, decimals))
      return
    }

    let rafId: number
    const start = performance.now()
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      const current = from + (to - from) * eased
      setDisplay(formatVal(current, decimals))
      if (t < 1) rafId = requestAnimationFrame(animate)
    }
    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [value, duration, decimals, isInvalid])

  return <span ref={ref} className="tabular-nums">{display}</span>
}
`,
  'Removed duplicate formatVal and added cancelAnimationFrame cleanup in AnimatedNumber.tsx'
)

// 20. Fix Home.tsx broken /convert/press link, batchEngine infinite loop, and smartBehavior precedence
updateFile(
  'src/pages/Home.tsx',
  (content) => content.replace("path: '/convert/press'", "path: '/convert/pressure'"),
  'Fixed broken /convert/press link -> /convert/pressure in Home.tsx'
)

updateFile(
  'src/engine/batchEngine.ts',
  (content) =>
    content.replace(
      `export function generateSequence(start: number, end: number, step: number): number[] {
  const values: number[] = []
  for (let v = start; v <= end; v += step) {
    values.push(v)
  }
  return values
}`,
      `export function generateSequence(start: number, end: number, step: number): number[] {
  if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(step) || step <= 0 || start > end) {
    return []
  }
  const values: number[] = []
  const maxItems = 10000
  for (let v = start; v <= end && values.length < maxItems; v += step) {
    values.push(Number(v.toFixed(8)))
  }
  return values
}`
    ),
  'Added infinite-loop and memory-overflow guard to generateSequence in batchEngine.ts'
)

updateFile(
  'src/engine/smartBehavior.ts',
  (content) =>
    content
      .replace(
        "usesScientific: this.patterns.get('sci_on') || 0 > this.patterns.get('sci_off') || 0,",
        "usesScientific: (this.patterns.get('sci_on') || 0) > (this.patterns.get('sci_off') || 0),"
      )
      .replace(
        "usesFractions: this.patterns.get('frac_on') || 0 > this.patterns.get('frac_off') || 0,",
        "usesFractions: (this.patterns.get('frac_on') || 0) > (this.patterns.get('frac_off') || 0),"
      ),
  'Fixed boolean operator precedence bug in smartBehavior.ts'
)

// 21. Fix run.bat and package.json prod script to run prerender-seo.mjs
updateFile(
  'run.bat',
  (content) =>
    content.replace(
      'call npx vite build',
      'call npx vite build && node scripts/prerender-seo.mjs'
    ),
  'Added prerender-seo.mjs step to run.bat'
)

updateFile(
  'package.json',
  (content) =>
    content.replace(
      '"prod": "vite build && node server.js"',
      '"prod": "vite build && node scripts/prerender-seo.mjs && node server.js"'
    ),
  'Added prerender-seo.mjs to npm run prod script'
)

console.log('\n✨ All master fixes applied successfully!\n')
