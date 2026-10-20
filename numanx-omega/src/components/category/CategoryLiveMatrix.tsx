import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { convert } from '../../engine/converter'
import { fmtSmart } from '../../utils/numbers'
import { useToast } from '../../hooks/useToast'
import type { CategoryDef, UnitDef } from '../../types'

interface Props {
  cat: CategoryDef
}

export default function CategoryLiveMatrix({ cat }: Props) {
  const [val, setVal] = useState<string>('1')
  const [baseUnit, setBaseUnit] = useState<string>(() => cat.un[0]?.id || '')
  const [search, setSearch] = useState('')
  const { toast } = useToast()

  const numVal = useMemo(() => {
    const parsed = parseFloat(val)
    return isNaN(parsed) ? 1 : parsed
  }, [val])

  const currentBaseUnit = useMemo(() => {
    return cat.un.find(u => u.id === baseUnit) || cat.un[0]
  }, [cat, baseUnit])

  const convertedList = useMemo(() => {
    if (!currentBaseUnit) return []
    return cat.un.map((targetUnit: UnitDef) => {
      const res = convert(numVal, cat.id, currentBaseUnit.id, targetUnit.id)
      return {
        unit: targetUnit,
        result: res,
        formatted: res !== null ? (Math.abs(res) < 0.0001 || Math.abs(res) >= 1e8 ? res.toExponential(4) : fmtSmart(res, 6)) : 'N/A'
      }
    })
  }, [cat, currentBaseUnit, numVal])

  const filteredList = useMemo(() => {
    if (!search.trim()) return convertedList
    const q = search.toLowerCase()
    return convertedList.filter(item =>
      item.unit.lb.toLowerCase().includes(q) ||
      item.unit.id.toLowerCase().includes(q)
    )
  }, [convertedList, search])

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast(`Copied ${label}: ${text}`, 'success')
  }

  const getSystemBadge = (s?: string) => {
    switch (s) {
      case 'M': return { label: 'Metric', bg: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }
      case 'I': return { label: 'Imperial', bg: 'rgba(234, 88, 12, 0.2)', color: '#fb923c' }
      case 'S': return { label: 'Scientific', bg: 'rgba(168, 85, 247, 0.2)', color: '#c084fc' }
      default: return { label: 'Standard', bg: 'rgba(107, 114, 128, 0.2)', color: 'var(--text2)' }
    }
  }

  return (
    <section aria-labelledby="matrix-heading" className="glass rounded-2xl p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 id="matrix-heading" className="text-sm sm:text-base font-bold flex items-center gap-2">
            <span aria-hidden="true">⚡</span> Live {cat.lb} Multi-Unit Matrix
          </h2>
          <p className="text-xs text-[var(--text2)] mt-0.5">
            Type any quantity to instantly compute equivalents across all {cat.un.length} units in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center rounded-xl bg-[var(--card2)] border border-[var(--border)] px-2.5 py-1">
            <span className="text-xs text-[var(--text2)] mr-1.5 font-medium">Input:</span>
            <input
              type="number"
              inputMode="decimal"
              value={val}
              onChange={e => setVal(e.target.value)}
              className="w-20 bg-transparent text-sm font-semibold outline-none text-right font-mono tabular-nums"
              placeholder="1"
              aria-label={`Input amount in ${currentBaseUnit?.lb || 'base unit'}`}
            />
          </div>

          <select
            value={baseUnit}
            onChange={e => setBaseUnit(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-[var(--card2)] border border-[var(--border)] text-xs font-semibold outline-none cursor-pointer"
            aria-label="Select base unit"
          >
            {cat.un.map(u => (
              <option key={u.id} value={u.id}>{u.lb} ({u.id})</option>
            ))}
          </select>
        </div>
      </div>

      {cat.un.length > 8 && (
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Filter ${cat.un.length} units...`}
            aria-label={`Filter ${cat.un.length} units`}
            className="w-full px-3 py-1.5 rounded-xl bg-[var(--card2)] border border-[var(--border)] text-xs outline-none focus:border-[var(--primary)] transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label="Clear filter"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text2)] hover:text-[var(--text)] transition-colors"
            >
              <span aria-hidden="true">✕</span>
            </button>
          )}
        </div>
      )}

      {/* Grid of live converted units */}
      <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-h-96 overflow-y-auto pr-1">
        <AnimatePresence>
          {filteredList.map(({ unit, formatted, result }) => {
            const badge = getSystemBadge(unit.s)
            const isSelf = unit.id === currentBaseUnit?.id
            return (
              <motion.div
                key={unit.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                  isSelf
                    ? 'bg-[var(--primary-muted)] border-[var(--primary)] shadow-sm'
                    : 'bg-[var(--card2)]/50 border-[var(--border)] hover:border-[var(--primary)]/50'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="font-semibold text-xs truncate" title={unit.lb}>
                    {unit.lb}
                  </span>
                  <span
                    className="text-xs font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0"
                    style={{ background: badge.bg, color: badge.color }}
                  >
                    {badge.label}
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-2">
                  <div className="font-mono text-sm sm:text-base font-bold text-[var(--text)] truncate" title={String(result)}>
                    {formatted}
                  </div>
                  <span className="text-xs text-[var(--text2)] font-mono font-medium flex-shrink-0">
                    {unit.id}
                  </span>
                </div>

                <div className="mt-2 pt-2 border-t border-[var(--border)]/40 flex items-center justify-between text-xs">
                  <Link
                    to={`/converter?cat=${cat.id}&from=${currentBaseUnit?.id}&to=${unit.id}&val=${numVal}`}
                    className="text-[var(--primary)] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Full calculator</span>
                    <span aria-hidden="true">→</span>
                  </Link>

                  <button
                    onClick={() => handleCopy(`${formatted} ${unit.id}`, unit.lb)}
                    className="btn-chip text-xs gap-1 py-0.5 px-2"
                    title="Copy value"
                    aria-label={`Copy converted value for ${unit.lb}`}
                  >
                    <span aria-hidden="true">📋</span>
                    <span>Copy</span>
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </section>
  )
}
