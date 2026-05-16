import type { CategoryDef } from '../types'
import { Categories } from './categories'

let customCategories: CategoryDef[] = []

export function getCategory(id: string): CategoryDef | undefined {
  const found = Categories.find(c => c.id === id) || customCategories.find(c => c.id === id)
  return found
}

export function getAllCategories(): CategoryDef[] {
  return [...Categories, ...customCategories]
}

export function getUnit(cat: CategoryDef, id: string) {
  return cat.un.find(u => u.id === id)
}

export function convertTemp(v: number, from: string, to: string): number {
  let c: number
  if (from === 'C') c = v
  else if (from === 'F') c = (v - 32) * 5 / 9
  else if (from === 'K') c = v - 273.15
  else if (from === 'R') c = (v - 491.67) * 5 / 9
  else if (from === 'Re') c = v * 1.25
  else c = v

  if (to === 'C') return c
  if (to === 'F') return c * 9 / 5 + 32
  if (to === 'K') return c + 273.15
  if (to === 'R') return (c + 273.15) * 9 / 5
  if (to === 'Re') return c * 0.8
  return c
}

export function convertFuel(v: number, from: string, to: string): number {
  const toBase: Record<string, (n: number) => number> = {
    kmL: n => n,
    L100km: n => 100 / n,
    mpgUS: n => n * 0.425144,
    mpgUK: n => n * 0.354006
  }
  const fromBase: Record<string, (n: number) => number> = {
    kmL: n => n,
    L100km: n => n ? 100 / n : 0,
    mpgUS: n => n / 0.425144,
    mpgUK: n => n / 0.354006
  }
  if (from === to) return v
  return fromBase[to](toBase[from](v))
}

export function convert(v: number, catId: string, fromId: string, toId: string): number | null {
  const cat = getCategory(catId)
  if (!cat || (v !== 0 && !v)) return null

  if (cat.id === 'temp') return convertTemp(v, fromId, toId)
  if (cat.id === 'fuel') return convertFuel(v, fromId, toId)

  const fu = getUnit(cat, fromId)
  const tu = getUnit(cat, toId)
  if (!fu || !tu || !fu.r || !tu.r) return null

  return v * fu.r / tu.r
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
    if (fromId === 'C' && toId === 'F') return '°C × 9/5 + 32 = °F'
    if (fromId === 'F' && toId === 'C') return '(°F − 32) × 5/9 = °C'
    if (fromId === 'C' && toId === 'K') return '°C + 273.15 = K'
    if (fromId === 'K' && toId === 'C') return 'K − 273.15 = °C'
    return '' + fromId + ' → ' + toId
  }

  const fu = getUnit(cat, fromId)
  const tu = getUnit(cat, toId)
  if (!fu || !tu) return ''
  const factor = (fu.r || 1) / (tu.r || 1)
  return `1 ${fu.lb} = ${Number(factor.toFixed(8))} ${tu.lb}`
}

export function addCustomUnit(catId: string, id: string, label: string, rate: number) {
  let cat = getCategory(catId)
  if (!cat) return false
  if (cat.un.find(u => u.id === id)) return false
  cat.un.push({ id, lb: label, r: rate, s: 'C', custom: true })
  return true
}
