import { useId, useMemo, useState } from 'react'
import { ArrowLeftRight, Check, Copy } from 'lucide-react'
import type { CategoryDef } from '../../types'
import { convert } from '../../engine/converter'
import { fmt, parseSmart } from '../../utils/numbers'
import { unitLabel, unitSymbol } from '../../engine/unitSymbols'

interface ConverterCardProps {
  cat: CategoryDef
  fromId: string
  toId: string
  initialValue?: string
  /**
   * When set, unit changes are handed to the page (pair pages navigate to the
   * matching pair URL). Without it the card keeps its own unit state.
   */
  onUnitsChange?: (from: string, to: string, value: string) => void
  /** Accessible name for the card. */
  title: string
}

const fieldLabel = 'block text-[13px] font-semibold text-[var(--text2)] mb-1.5'
const control =
  'w-full min-h-[48px] rounded-xl border border-[var(--border-control)] bg-[var(--card)] text-[var(--text)] px-3 text-base hover:border-[var(--text)] transition-colors'

export default function ConverterCard({ cat, fromId, toId, initialValue = '1', onUnitsChange, title }: ConverterCardProps) {
  const uid = useId()
  const [value, setValue] = useState(initialValue)
  const [localFrom, setLocalFrom] = useState(fromId)
  const [localTo, setLocalTo] = useState(toId)
  const [copied, setCopied] = useState(false)

  const from = onUnitsChange ? fromId : localFrom
  const to = onUnitsChange ? toId : localTo
  const u1 = cat.un.find(u => u.id === from) ?? cat.un[0]
  const u2 = cat.un.find(u => u.id === to) ?? cat.un[1] ?? cat.un[0]

  const input = useMemo(() => parseSmart(value, u1.r), [value, u1])
  const result = useMemo(
    () => (input === null ? null : convert(input, cat.id, u1.id, u2.id)),
    [input, cat.id, u1.id, u2.id],
  )
  const resultText = result === null ? '—' : fmt(result, 6)
  const sym1 = unitSymbol(u1, cat.id)
  const sym2 = unitSymbol(u2, cat.id)

  const setUnits = (nextFrom: string, nextTo: string) => {
    if (onUnitsChange) {
      onUnitsChange(nextFrom, nextTo, value)
    } else {
      setLocalFrom(nextFrom)
      setLocalTo(nextTo)
    }
  }

  const handleCopy = async () => {
    if (result === null) return
    try {
      await navigator.clipboard.writeText(resultText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* clipboard blocked */ }
  }

  return (
    <section aria-label={title} className="nx-card p-4 sm:p-6 space-y-4">
      <div>
        <label htmlFor={`${uid}-value`} className={fieldLabel}>Value</label>
        <input
          id={`${uid}-value`}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={e => setValue(e.target.value)}
          className={`${control} min-h-[56px] text-xl font-semibold tabular`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-2">
        <div className="min-w-0">
          <label htmlFor={`${uid}-from`} className={fieldLabel}>From</label>
          <select
            id={`${uid}-from`}
            value={u1.id}
            onChange={e => setUnits(e.target.value, u2.id)}
            className={`${control} truncate`}
          >
            {cat.un.map(u => (
              <option key={u.id} value={u.id}>{unitLabel(u, cat.id)}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => setUnits(u2.id, u1.id)}
          className="btn-icon w-12 min-h-[48px] rounded-xl justify-self-center rotate-90 sm:rotate-0"
          aria-label={`Swap units: convert ${unitLabel(u2, cat.id)} to ${unitLabel(u1, cat.id)}`}
        >
          <ArrowLeftRight size={20} aria-hidden="true" />
        </button>
        <div className="min-w-0">
          <label htmlFor={`${uid}-to`} className={fieldLabel}>To</label>
          <select
            id={`${uid}-to`}
            value={u2.id}
            onChange={e => setUnits(u1.id, e.target.value)}
            className={`${control} truncate`}
          >
            {cat.un.map(u => (
              <option key={u.id} value={u.id}>{unitLabel(u, cat.id)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-xl bg-[var(--card2)] border border-[var(--border)] p-4 flex items-center justify-between gap-3">
        <output
          htmlFor={`${uid}-value ${uid}-from ${uid}-to`}
          aria-live="polite"
          className="min-w-0 flex flex-wrap items-baseline gap-x-2 gap-y-1 leading-none"
        >
          <span className="font-display font-extrabold text-[32px] sm:text-[44px] tabular break-all">{resultText}</span>
          {result !== null && <span className="text-lg sm:text-xl font-semibold text-[var(--text2)] whitespace-nowrap">{sym2}</span>}
        </output>
        <button
          type="button"
          onClick={handleCopy}
          disabled={result === null}
          className="btn-primary shrink-0 text-sm"
          aria-label={copied ? 'Result copied' : 'Copy result'}
        >
          {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <p className="text-base text-[var(--text)] tabular" data-testid="answer-line">
        {input === null
          ? <span className="text-[var(--text2)]">Enter a number to convert.</span>
          : <><strong className="font-semibold">{fmt(input, 6)} {sym1}</strong> = <strong className="font-semibold">{resultText} {sym2}</strong></>}
      </p>
    </section>
  )
}
