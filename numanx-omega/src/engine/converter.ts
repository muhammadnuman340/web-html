import type { CategoryDef } from '../types'
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


export function convertCricketOvers(v: number, from: string, to: string): number {
  if (from === to) return cleanFloat(v)
  let totalBalls = 0
  if (from === 'balls') {
    totalBalls = Math.round(v)
  } else if (from === 'true_overs' || from === 'run_rate_6') {
    totalBalls = Math.round(v * 6)
  } else {
    // overs_balls notation (e.g. 14.3 -> 14 overs and 3 balls)
    const overs = Math.floor(Math.abs(v))
    const frac = Math.round((Math.abs(v) - overs) * 10)
    const validFrac = Math.min(5, Math.max(0, frac))
    totalBalls = (overs * 6 + validFrac) * (v < 0 ? -1 : 1)
  }

  if (to === 'balls') return totalBalls
  if (to === 'true_overs' || to === 'run_rate_6') return cleanFloat(totalBalls / 6, 4)
  const sign = totalBalls < 0 ? -1 : 1
  const absBalls = Math.abs(totalBalls)
  const fullOvers = Math.floor(absBalls / 6)
  const remBalls = absBalls % 6
  return cleanFloat(sign * (fullOvers + remBalls / 10), 1)
}

export function convertPkGpa(v: number, from: string, to: string): number {
  if (from === to) return cleanFloat(v)
  let pct = v
  if (from === 'percentage' || from === 'mdcat_agg') {
    pct = v
  } else if (from === 'hec_gpa4') {
    pct = Math.min(100, Math.max(0, v <= 0 ? 0 : v >= 4 ? 85 : 50 + (v - 1) * (35 / 3)))
  } else if (from === 'gpa5') {
    pct = Math.min(100, Math.max(0, (v / 5) * 100))
  } else if (from === 'matric_fsc1100') {
    pct = (v / 1100) * 100
  } else if (from === 'matric_fsc1200') {
    pct = (v / 1200) * 100
  }

  if (to === 'percentage' || to === 'mdcat_agg') return cleanFloat(pct, 2)
  if (to === 'matric_fsc1100') return cleanFloat((pct / 100) * 1100, 1)
  if (to === 'matric_fsc1200') return cleanFloat((pct / 100) * 1200, 1)
  if (to === 'gpa5') return cleanFloat((pct / 100) * 5, 2)
  if (to === 'hec_gpa4') {
    if (pct >= 85) return 4.0
    if (pct < 50) return 0.0
    return cleanFloat(1.0 + (pct - 50) * (3 / 35), 2)
  }
  return cleanFloat(pct, 2)
}

export function convertStatistics(v: number, from: string, to: string): number {
  if (from === to) return cleanFloat(v)
  let p = 0.5
  if (from === 'prob_pct' || from === 'percentile') {
    p = Math.min(0.99999, Math.max(0.00001, v / 100))
  } else if (from === 'dec_odds') {
    p = v > 1 ? 1 / v : 0.5
  } else if (from === 'frac_odds') {
    p = v > 0 ? 1 / (v + 1) : 0.5
  } else if (from === 'us_moneyline') {
    if (v > 0) p = 100 / (v + 100)
    else if (v < 0) p = Math.abs(v) / (Math.abs(v) + 100)
  } else if (from === 'z_score') {
    const t = 1 / (1 + 0.2316419 * Math.abs(v))
    const d = 0.3989423 * Math.exp(-v * v / 2)
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
    p = v > 0 ? 1 - prob : prob
    p = Math.min(0.99999, Math.max(0.00001, p))
  } else if (from === 'p_val_two') {
    p = Math.min(0.99999, Math.max(0.00001, 1 - v / 2))
  }

  if (to === 'prob_pct') return cleanFloat(p * 100, 2)
  if (to === 'percentile') return cleanFloat(p * 100, 2)
  if (to === 'dec_odds') return cleanFloat(1 / p, 3)
  if (to === 'frac_odds') return cleanFloat((1 - p) / p, 3)
  if (to === 'us_moneyline') {
    if (p <= 0.5) return cleanFloat(((1 - p) / p) * 100, 0)
    return cleanFloat(-(p / (1 - p)) * 100, 0)
  }
  if (to === 'p_val_two') {
    const tail = p > 0.5 ? 1 - p : p
    return cleanFloat(2 * tail, 4)
  }
  if (to === 'z_score') {
    const q = p > 0.5 ? 1 - p : p
    const w = Math.sqrt(-2 * Math.log(q))
    const z = w - ((0.010328 * w + 0.802853) * w + 2.515517) / (((0.001308 * w + 0.189269) * w + 1.432788) * w + 1)
    return cleanFloat(p > 0.5 ? z : -z, 3)
  }
  return cleanFloat(p * 100, 2)
}

export function convertNumberBase(v: number, from: string, to: string): number {
  if (from === to) return cleanFloat(v)
  let dec = Math.floor(v)
  if (from === 'bin') {
    dec = parseInt(String(Math.abs(Math.floor(v))), 2) || 0
  } else if (from === 'oct') {
    dec = parseInt(String(Math.abs(Math.floor(v))), 8) || 0
  }

  if (to === 'dec') return dec
  if (to === 'bin') return parseInt(dec.toString(2), 10) || 0
  if (to === 'oct') return parseInt(dec.toString(8), 10) || 0
  return dec
}

export function convert(v: number, catId: string, fromId: string, toId: string): number | null {
  const cat = getCategory(catId)
  if (!cat || (v !== 0 && !v) || !Number.isFinite(v)) return null

  if (cat.id === 'temp') return convertTemp(v, fromId, toId)
  if (cat.id === 'fuel') return convertFuel(v, fromId, toId)
  if (cat.id === 'cricket-overs') return convertCricketOvers(v, fromId, toId)
  if (cat.id === 'pk-gpa') return convertPkGpa(v, fromId, toId)
  if (cat.id === 'statistics') return convertStatistics(v, fromId, toId)
  if (cat.id === 'number-base') return convertNumberBase(v, fromId, toId)

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
    return map[`${fromId}->${toId}`] || `${fromId} → ${toId}`
  }

  if (cat.id === 'fuel') {
    if ((fromId === 'mpgUS' && toId === 'L100km') || (fromId === 'L100km' && toId === 'mpgUS')) {
      return 'L/100km = 235.215 ÷ MPG (US)'
    }
    if ((fromId === 'mpgUK' && toId === 'L100km') || (fromId === 'L100km' && toId === 'mpgUK')) {
      return 'L/100km = 282.481 ÷ MPG (UK)'
    }
    const sample = convert(1, 'fuel', fromId, toId)
    return sample !== null ? `1 ${fromId} ≈ ${cleanFloat(sample, 6)} ${toId}` : ''
  }

  if (cat.id === 'cricket-overs') {
    if (fromId === 'overs_balls' && toId === 'balls') return 'Balls = (Floor(Overs) × 6) + Remainder Balls'
    if (fromId === 'balls' && toId === 'true_overs') return 'True Decimal Overs = Legal Deliveries ÷ 6'
    return '1 Over = 6 Legal Deliveries (ICC Standard)'
  }

  if (cat.id === 'pk-gpa') {
    return 'CGPA / Percentage Scale: Continuous HEC / PMDC Academic Model'
  }

  if (cat.id === 'statistics') {
    return 'Implied Probability = 1 ÷ Decimal Odds'
  }

  const fu = getUnit(cat, fromId)
  const tu = getUnit(cat, toId)
  if (!fu || !tu || !fu.r || !tu.r) return ''
  const factor = cleanFloat(fu.r / tu.r, 8)
  return `1 ${fu.lb} = ${factor} ${tu.lb}`
}

export function addCustomUnit(catId: string, id: string, label: string, rate: number) {
  const cat = getCategory(catId)
  if (!cat) return false
  if (cat.un.find(u => u.id === id)) return false
  cat.un.push({ id, lb: label, r: rate, s: 'C', custom: true })
  return true
}
