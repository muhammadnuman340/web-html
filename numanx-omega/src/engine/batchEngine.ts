import { convert } from './converter'

export interface BatchResult {
  id: number
  input: number
  fromUnit: string
  toUnit: string
  result: number | null
}

export interface BatchConfig {
  values: number[]
  catId: string
  fromUnit: string
  toUnit: string
  parallel?: boolean
}

export function executeBatch({ values, catId, fromUnit, toUnit }: BatchConfig): BatchResult[] {
  return values.map((v, i) => ({
    id: i,
    input: v,
    fromUnit,
    toUnit,
    result: convert(v, catId, fromUnit, toUnit)
  }))
}

export function parseCSV(input: string): number[] {
  return input
    .split(/[\n,;]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => parseFloat(s))
    .filter(n => !isNaN(n))
}

export function generateSequence(start: number, end: number, step: number): number[] {
  const values: number[] = []
  for (let v = start; v <= end; v += step) {
    values.push(v)
  }
  return values
}

export function batchStats(results: BatchResult[]): { min: number | null; max: number | null; avg: number | null; count: number } {
  const valid = results.filter(r => r.result !== null).map(r => r.result as number)
  if (valid.length === 0) return { min: null, max: null, avg: null, count: 0 }
  return {
    min: Math.min(...valid),
    max: Math.max(...valid),
    avg: valid.reduce((a, b) => a + b, 0) / valid.length,
    count: valid.length
  }
}
