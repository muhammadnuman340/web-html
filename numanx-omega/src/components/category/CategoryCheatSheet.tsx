import { useState, useMemo } from 'react'
import { convert } from '../../engine/converter'
import { fmtSmart } from '../../utils/numbers'
import { useToast } from '../../hooks/useToast'
import type { CategoryDef } from '../../types'

interface Props {
  cat: CategoryDef
}

const PRESET_VALUES = [1, 2, 5, 10, 20, 25, 50, 100, 250, 500, 1000]

export default function CategoryCheatSheet({ cat }: Props) {
  const [fromUnit, setFromUnit] = useState<string>(() => cat.un[0]?.id || '')
  const [toUnit, setToUnit] = useState<string>(() => cat.un[1]?.id || cat.un[0]?.id || '')
  const { toast } = useToast()

  const fromDef = useMemo(() => cat.un.find(u => u.id === fromUnit) || cat.un[0], [cat, fromUnit])
  const toDef = useMemo(() => cat.un.find(u => u.id === toUnit) || cat.un[1] || cat.un[0], [cat, toUnit])

  const tableRows = useMemo(() => {
    if (!fromDef || !toDef) return []
    return PRESET_VALUES.map(val => {
      const res = convert(val, cat.id, fromDef.id, toDef.id)
      return {
        input: val,
        result: res !== null ? fmtSmart(res, 5) : '—'
      }
    })
  }, [cat, fromDef, toDef])

  const handleCopyTable = () => {
    const header = `${fromDef.lb} (${fromDef.id})\t${toDef.lb} (${toDef.id})\n`
    const body = tableRows.map(r => `${r.input}\t${r.result}`).join('\n')
    navigator.clipboard.writeText(header + body)
    toast('Copied reference table to clipboard', 'success')
  }

  const handleSwap = () => {
    const temp = fromUnit
    setFromUnit(toUnit)
    setToUnit(temp)
  }

  return (
    <section aria-labelledby="cheatsheet-heading" className="glass rounded-2xl p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 id="cheatsheet-heading" className="text-sm sm:text-base font-bold flex items-center gap-2">
            <span>📊</span> {cat.lb} Conversion Table & Cheat Sheet
          </h2>
          <p className="text-xs opacity-60 mt-0.5">
            Quick reference matrix for common benchmark values between {fromDef?.lb} and {toDef?.lb}.
          </p>
        </div>

        <button
          onClick={handleCopyTable}
          className="px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card2)] text-xs font-medium hover:border-[var(--primary)] transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>📋</span>
          <span>Copy Table</span>
        </button>
      </div>

      {/* Selectors */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <div className="flex items-center gap-1.5">
          <span className="opacity-50">From:</span>
          <select
            value={fromUnit}
            onChange={e => setFromUnit(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-[var(--card2)] border border-[var(--border)] font-semibold outline-none cursor-pointer"
            aria-label="Table source unit"
          >
            {cat.un.map(u => (
              <option key={u.id} value={u.id}>{u.lb} ({u.id})</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSwap}
          className="p-1.5 rounded-xl border border-[var(--border)] bg-[var(--card2)] hover:bg-[var(--border)] transition-colors text-xs"
          title="Swap units"
          aria-label="Swap units"
        >
          ⇄
        </button>

        <div className="flex items-center gap-1.5">
          <span className="opacity-50">To:</span>
          <select
            value={toUnit}
            onChange={e => setToUnit(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-[var(--card2)] border border-[var(--border)] font-semibold outline-none cursor-pointer"
            aria-label="Table destination unit"
          >
            {cat.un.map(u => (
              <option key={u.id} value={u.id}>{u.lb} ({u.id})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card2)]/40">
        <table className="w-full text-xs text-left">
          <thead className="bg-[var(--border)]/40 text-[11px] uppercase tracking-wider opacity-70">
            <tr>
              <th className="py-2.5 px-4 font-semibold">{fromDef?.lb} ({fromDef?.id})</th>
              <th className="py-2.5 px-4 font-semibold">{toDef?.lb} ({toDef?.id})</th>
              <th className="py-2.5 px-4 font-semibold text-right">Formula Ratio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/30 font-mono">
            {tableRows.map(({ input, result }) => (
              <tr key={input} className="hover:bg-[var(--border)]/20 transition-colors">
                <td className="py-2 px-4 font-semibold text-[var(--text)]">{input} {fromDef?.id}</td>
                <td className="py-2 px-4 text-[var(--primary)] font-bold">{result} {toDef?.id}</td>
                <td className="py-2 px-4 text-right opacity-40 text-[10px]">
                  {input === 1 ? `1 : ${result}` : `× ${input}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
