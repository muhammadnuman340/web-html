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
