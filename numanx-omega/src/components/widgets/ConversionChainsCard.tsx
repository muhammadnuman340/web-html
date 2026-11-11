import React, { useState, useMemo } from 'react'
import { getAllChains, executeChain, suggestChain } from '../../engine/conversionChains'
import { fmt } from '../../utils/numbers'

interface ConversionChainsCardProps {
  category?: string
  className?: string
}

export const ConversionChainsCard: React.FC<ConversionChainsCardProps> = ({
  category,
  className = '',
}) => {
  const chains = useMemo(() => getAllChains(), [])
  const suggestedId = category ? suggestChain(category) : null

  const [activeChainId, setActiveChainId] = useState<string>(
    suggestedId || chains[0]?.id || 'energy-cost'
  )
  const [inputValue, setInputValue] = useState<string>('100')

  const activeChain = chains.find(c => c.id === activeChainId) || chains[0]

  const numVal = parseFloat(inputValue) || 0
  const result = useMemo(() => {
    if (!activeChain) return null
    return executeChain(activeChain.id, numVal)
  }, [activeChain, numVal])

  if (!activeChain) return null

  return (
    <section
      aria-labelledby="conversion-chain-heading"
      className={`glass rounded-2xl p-4 sm:p-5 border border-sky-500/25 bg-sky-500/[0.03] space-y-4 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-bold flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            ⛓️
          </span>
          <div>
            <h2 id="conversion-chain-heading" className="text-sm font-bold text-[var(--text)]">
              Multi-Step Conversion Pipeline
            </h2>
            <p className="text-[11px] text-[var(--text2)]">
              Chain multi-domain engineering calculations in a single flow
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 self-start sm:self-auto font-mono">
          Engine Chaining
        </span>
      </div>

      {/* Chain Selector Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {chains.map(c => {
          const isActive = c.id === activeChainId
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveChainId(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 min-h-[38px] ${
                isActive
                  ? 'bg-sky-500 text-white font-semibold shadow-sm'
                  : 'bg-[var(--card2)] border border-[var(--border)] text-[var(--text2)] hover:text-[var(--text)] hover:border-[var(--border-hover)]'
              }`}
            >
              <span>{c.icon}</span>
              <span>{c.label}</span>
            </button>
          )
        })}
      </div>

      {/* Input Field */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <label htmlFor="chain-input" className="text-xs font-semibold text-[var(--text2)] whitespace-nowrap">
          Base Input Value:
        </label>
        <div className="relative flex-1">
          <input
            id="chain-input"
            type="number"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[var(--card2)] border border-[var(--border-control)] text-sm font-mono font-bold text-[var(--text)] focus:outline-none focus:border-sky-500"
            placeholder="Enter value"
          />
        </div>
      </div>

      {/* Pipeline Stage Visualization */}
      {result && result.links.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          {result.links.map((link, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-[var(--card2)] border border-[var(--border)] relative space-y-1"
            >
              <div className="flex items-center justify-between text-[11px] text-[var(--text2)]">
                <span className="font-semibold text-[var(--text)]">{link.label}</span>
                <span className="px-1.5 py-0.2 rounded bg-[var(--border)]/40 font-mono text-[10px]">
                  Step {i + 1}
                </span>
              </div>
              <div className="text-base font-bold font-mono text-sky-600 dark:text-sky-400">
                {fmt(link.value, 4)}{' '}
                <span className="text-xs text-[var(--text2)] font-normal font-sans">
                  {link.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default ConversionChainsCard
