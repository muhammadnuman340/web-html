import { useState, useMemo } from 'react'
import { convert } from '../../engine/converter'
import { fmtSmart } from '../../utils/numbers'
import { useToast } from '../../hooks/useToast'
import type { CategoryDef } from '../../types'

interface Props {
  cat: CategoryDef
}

const PRESET_VALUES = [1, 2, 3, 5, 10, 15, 20, 25, 50, 75, 100, 250, 500, 1000]

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
        result: res !== null ? fmtSmart(res, 5) : '—',
      }
    })
  }, [cat, fromDef, toDef])

  const handleCopyTable = () => {
    if (!fromDef || !toDef) return
    const header = `${fromDef.lb} (${fromDef.id})\t${toDef.lb} (${toDef.id})\n`
    const body = tableRows.map(r => `${r.input}\t${r.result}`).join('\n')
    navigator.clipboard.writeText(header + body)
    toast('Copied reference table to clipboard', 'success')
  }

  const handleDownloadCSV = () => {
    if (!fromDef || !toDef) return
    const header = `"${fromDef.lb} (${fromDef.id})","${toDef.lb} (${toDef.id})","Formula Ratio"\n`
    const body = tableRows.map(r => `"${r.input}","${r.result}","${r.input === 1 ? `1 : ${r.result}` : `× ${r.input}`}"`).join('\n')
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `${cat.id}-${fromDef.id}-to-${toDef.id}-cheatsheet.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast('Downloaded CSV Cheat Sheet!', 'success')
  }

  const handlePrint = () => {
    window.print()
  }

  const handleSwap = () => {
    const temp = fromUnit
    setFromUnit(toUnit)
    setToUnit(temp)
  }

  return (
    <section aria-labelledby="cheatsheet-heading" className="glass rounded-2xl p-4 sm:p-5 space-y-4 print-sheet border border-[var(--border)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 id="cheatsheet-heading" className="text-sm sm:text-base font-bold flex items-center gap-2 text-[var(--text)]">
            <span role="img" aria-hidden="true">📊</span> {cat.lb} Conversion Table & Printable Cheat Sheet
          </h2>
          <p className="text-xs text-[var(--text2)] opacity-85 mt-0.5">
            Quick reference matrix for benchmark values between {fromDef?.lb} and {toDef?.lb}.
          </p>
        </div>

        {/* Action buttons (Print, CSV, Copy) */}
        <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto no-print">
          <button
            onClick={handlePrint}
            className="btn-secondary text-xs gap-1.5"
            title="Print or Save as PDF"
            aria-label="Print or save reference sheet as PDF"
          >
            <span aria-hidden="true">🖨️</span>
            <span>Print / PDF</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            className="btn-secondary text-xs gap-1.5"
            title="Download Excel / CSV"
            aria-label="Download conversion table as CSV"
          >
            <span aria-hidden="true">📥</span>
            <span>CSV</span>
          </button>

          <button
            onClick={handleCopyTable}
            className="btn-secondary text-xs gap-1.5"
            title="Copy table to clipboard"
            aria-label="Copy reference table to clipboard"
          >
            <span aria-hidden="true">📋</span>
            <span>Copy</span>
          </button>
        </div>
      </div>

      {/* Selectors */}
      <div className="flex items-center gap-2 flex-wrap text-xs no-print">
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--text2)] opacity-75">From:</span>
          <select
            value={fromUnit}
            onChange={e => setFromUnit(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-[var(--card2)] border border-[var(--border)] font-semibold text-[var(--text)] outline-none cursor-pointer"
            aria-label="Table source unit"
          >
            {cat.un.map(u => (
              <option key={u.id} value={u.id}>{u.lb} ({u.id})</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSwap}
          className="btn-icon w-8 h-8 rounded-xl bg-[var(--card2)] border border-[var(--border)] text-xs"
          title="Swap units"
          aria-label="Swap units"
        >
          ⇄
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-[var(--text2)] opacity-75">To:</span>
          <select
            value={toUnit}
            onChange={e => setToUnit(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-[var(--card2)] border border-[var(--border)] font-semibold text-[var(--text)] outline-none cursor-pointer"
            aria-label="Table destination unit"
          >
            {cat.un.map(u => (
              <option key={u.id} value={u.id}>{u.lb} ({u.id})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Printable Title visible during print */}
      <div className="hidden print:block text-center py-2 border-b border-gray-300">
        <h2 className="text-lg font-bold text-[var(--text)]">NumanX Omega — {cat.lb} Cheat Sheet</h2>
        <p className="text-xs text-gray-600">Reference: {fromDef?.lb} ({fromDef?.id}) to {toDef?.lb} ({toDef?.id})</p>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card2)]/40">
        <table className="w-full text-xs text-left">
          <thead className="bg-[var(--border)]/40 text-xs uppercase tracking-wider text-[var(--text)] font-semibold">
            <tr>
              <th className="py-2.5 px-4">{fromDef?.lb} ({fromDef?.id})</th>
              <th className="py-2.5 px-4 text-[var(--primary)]">{toDef?.lb} ({toDef?.id})</th>
              <th className="py-2.5 px-4 text-right">Formula Ratio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/30 font-mono text-xs">
            {tableRows.map(({ input, result }) => (
              <tr key={input} className="hover:bg-[var(--border)]/20 transition-colors">
                <td className="py-2 px-4 font-semibold text-[var(--text)]">{input} {fromDef?.id}</td>
                <td className="py-2 px-4 text-[var(--primary)] font-bold">{result} {toDef?.id}</td>
                <td className="py-2 px-4 text-right text-[var(--text2)] opacity-70 text-xs">
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
