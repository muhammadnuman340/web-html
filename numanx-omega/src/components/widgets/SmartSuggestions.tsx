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
          className="w-full glass rounded-xl px-3 py-1.5 text-[11px] flex items-center gap-2 hover:bg-[var(--border)] transition-all"
        >
          <span className="opacity-40">🤖</span>
          <span className="opacity-30 flex-1 text-left">Smart Insights — start converting to see analytics</span>
          <span className="text-[9px] opacity-20">{expanded ? '▲' : '▼'}</span>
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
                <div className="text-[10px] opacity-40 leading-relaxed">
                  Your conversion patterns, most-used categories, and productivity score will appear here once you start converting.
                </div>
                <div className="flex gap-1">
                  <span className="px-2 py-0.5 rounded-lg text-[9px] bg-[var(--primary)]/10 text-[var(--primary)]">📏 Length</span>
                  <span className="px-2 py-0.5 rounded-lg text-[9px] bg-[var(--primary)]/10 text-[var(--primary)]">⚖️ Mass</span>
                  <span className="px-2 py-0.5 rounded-lg text-[9px] bg-[var(--primary)]/10 text-[var(--primary)]">🌡️ Temp</span>
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
            <span className="text-xs font-semibold uppercase tracking-wide opacity-60">🤖 Smart Insights</span>
            <button onClick={() => setDismissed(true)} className="text-xs opacity-30 hover:opacity-100">✕</button>
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
              <div className="text-[10px] uppercase tracking-wide opacity-40 mb-1">Frequent conversions</div>
              <div className="flex gap-1 flex-wrap">
                {suggestedPairs.map(pair => (
                  <button
                    key={pair}
                    onClick={() => {
                      const [from, to] = pair.split('→')
                      onApplyPair(from, to)
                    }}
                    className="px-2.5 py-1 rounded-lg text-[11px] border border-[var(--border)] hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] transition-all"
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
