import React from 'react'
import { getComparativeStatement, getVisualAnchors } from '../../engine/visualContext'

interface VisualComparisonCardProps {
  category: string
  value: number
  unitId: string
  unitLabel?: string
  className?: string
}

export const VisualComparisonCard: React.FC<VisualComparisonCardProps> = ({
  category,
  value,
  unitId,
  unitLabel,
  className = '',
}) => {
  const comparison = getComparativeStatement(category, value, unitId)
  const anchors = getVisualAnchors(category, 4)

  if (!comparison && anchors.length === 0) {
    return null
  }

  return (
    <section
      aria-labelledby="physical-reference-heading"
      className={`glass rounded-2xl p-4 sm:p-5 border border-emerald-500/25 bg-emerald-500/[0.03] space-y-3 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div className="flex items-center gap-2">
          <span
            className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            {comparison?.emoji || '📐'}
          </span>
          <h2 id="physical-reference-heading" className="text-sm font-bold text-[var(--text)]">
            Real-World Physical Reference
          </h2>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 self-start sm:self-auto">
          Intuitive Scale
        </span>
      </div>

      {comparison && (
        <p className="text-xs sm:text-sm font-medium text-[var(--text)] leading-relaxed">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {value} {unitLabel || unitId}
          </span>{' '}
          is {comparison.text.toLowerCase()}.
        </p>
      )}

      {anchors.length > 0 && (
        <div className="pt-2 border-t border-[var(--border)]/40 space-y-1.5">
          <div className="text-[11px] font-mono text-[var(--text2)] opacity-80 flex items-center justify-between">
            <span>Physical Metrology Scale:</span>
            <span className="text-[10px] opacity-60">Human Anchors</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {anchors.map((anchor, i) => (
              <div
                key={i}
                className="p-2 rounded-lg bg-[var(--card2)] border border-[var(--border)]/70 text-center space-y-0.5"
              >
                <div className="text-base" role="img" aria-hidden="true">
                  {anchor.emoji}
                </div>
                <div className="text-[10px] font-mono text-[var(--text2)] font-semibold truncate" title={`${anchor.value} ${anchor.unit}`}>
                  {anchor.value} {anchor.unit}
                </div>
                <div className="text-[10px] text-[var(--text2)] opacity-75 truncate" title={anchor.label}>
                  {anchor.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default VisualComparisonCard
