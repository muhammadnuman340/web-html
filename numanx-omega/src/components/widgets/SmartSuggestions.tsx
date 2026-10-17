import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { analytics } from '../../engine/analytics'

interface Props {
  visible: boolean
  onApplyPair: (from: string, to: string) => void
}

export default function SmartSuggestions({ visible, onApplyPair }: Props) {
  const [dismissed, setDismissed] = useState(false)
  const [expanded, setExpanded] = useState(false)

  if (!visible || dismissed) return null

  const summary = analytics.getSummary()
  const suggestedPairs = analytics.getSuggestedPairs()
  const isEmpty = summary.totalConversions === 0

  if (isEmpty) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-1"
      >
        <button
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className="w-full glass rounded-xl px-3 py-2 text-xs flex items-center gap-2 hover:bg-[var(--border)] transition-all cursor-pointer"
        >
          <span className="opacity-70 text-sm" aria-hidden="true">🤖</span>
          <span className="opacity-75 flex-1 text-left font-medium">Smart Insights — start converting to see analytics</span>
          <span className="text-xs opacity-40" aria-hidden="true">{expanded ? '▲' : '▼'}</span>
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="glass rounded-2xl p-3 mt-1 space-y-2">
                <div className="text-xs opacity-60 leading-relaxed">
                  Your conversion patterns, most-used categories, and productivity score will appear here once you start converting.
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-lg text-xs bg-[var(--primary)]/10 text-[var(--primary)] font-medium"><span aria-hidden="true">📏</span> Length</span>
                  <span className="px-2 py-0.5 rounded-lg text-xs bg-[var(--primary)]/10 text-[var(--primary)] font-medium"><span aria-hidden="true">⚖️</span> Mass</span>
                  <span className="px-2 py-0.5 rounded-lg text-xs bg-[var(--primary)]/10 text-[var(--primary)] font-medium"><span aria-hidden="true">🌡️</span> Temp</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="overflow-hidden"
      >
        <div className="glass rounded-2xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide opacity-60"><span aria-hidden="true">🤖</span> Smart Insights</span>
            <button onClick={() => setDismissed(true)} className="text-xs opacity-30 hover:opacity-100" aria-label="Dismiss insights">✕</button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-[var(--card2)]">
              <div className="font-bold text-sm">{summary.totalConversions}</div>
              <div className="opacity-50">Total</div>
            </div>
            <div className="p-2 rounded-xl bg-[var(--card2)]">
              <div className="font-bold text-sm">{summary.mostUsedCategory}</div>
              <div className="opacity-50">Top Category</div>
            </div>
            <div className="p-2 rounded-xl bg-[var(--card2)]">
              <div className="font-bold text-sm">{analytics.getProductivityScore()}%</div>
              <div className="opacity-50">Productivity</div>
            </div>
          </div>

          {suggestedPairs.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wide opacity-50 font-medium mb-1.5">Frequent conversions</div>
              <div className="flex gap-1.5 flex-wrap">
                {suggestedPairs.map(pair => (
                  <button
                    key={pair}
                    onClick={() => {
                      const [from, to] = pair.split('→')
                      onApplyPair(from, to)
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs border border-[var(--border)] hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] transition-all cursor-pointer font-mono"
                  >
                    {pair}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
