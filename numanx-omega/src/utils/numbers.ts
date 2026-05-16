export function fmt(v: number | null | undefined, prec = 6): string {
  if (v === null || v === undefined || !isFinite(v)) return '—'
  return Number(v.toFixed(prec)).toString()
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

export function parseSmart(s: string): number | null {
  if (!s || !s.trim()) return null
  s = s.trim()
  let m = s.match(/^(\d+\.?\d*)\s*(?:'|ft)\s*(\d+\.?\d*)\s*(?:"|in)?$/i)
  if (m) return parseFloat(m[1]) * 0.3048 + parseFloat(m[2]) * 0.0254
  m = s.match(/^(-?\d+)\s*\/\s*(\d+)$/)
  if (m) { const d = parseFloat(m[1]) / parseFloat(m[2]); return isFinite(d) ? d : null }
  m = s.match(/^(-?\d+)\s+(\d+)\/(\d+)$/)
  if (m) { const d = parseFloat(m[1]) + parseFloat(m[2]) / parseFloat(m[3]); return isFinite(d) ? d : null }
  const n = parseFloat(s)
  return isNaN(n) ? null : n
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}
