import { useState, useMemo } from 'react'
import { fmt } from '../../../utils/numbers'

interface AreaBenchmark {
  name: string
  icon: string
  sqm: number
  desc: string
}

const BENCHMARKS: AreaBenchmark[] = [
  { name: 'Master Bedroom', icon: '🛏️', sqm: 16, desc: 'Average spacious bedroom' },
  { name: 'Tennis Court', icon: '🎾', sqm: 260.7, desc: 'Full singles & doubles court' },
  { name: 'Basketball Court', icon: '🏀', sqm: 436.6, desc: 'NBA regulation hardwood court' },
  { name: 'Olympic Pool', icon: '🏊', sqm: 1250, desc: '50m x 25m competition pool' },
  { name: 'FIFA Soccer Pitch', icon: '⚽', sqm: 7140, desc: 'Standard international field' },
  { name: 'City Block', icon: '🏙️', sqm: 20000, desc: 'Typical downtown urban block (~5 acres)' },
  { name: '18-Hole Golf Course', icon: '⛳', sqm: 600000, desc: 'Standard championship course (~150 ac)' },
  { name: 'Central Park NYC', icon: '🌳', sqm: 3410000, desc: 'World famous urban park (843 acres)' },
]

export default function AreaVisualizer() {
  const [sqm, setSqm] = useState<number>(1000)

  // Derived conversions
  const sqft = useMemo(() => sqm * 10.7639, [sqm])
  const acres = useMemo(() => sqm * 0.000247105, [sqm])
  const hectares = useMemo(() => sqm * 0.0001, [sqm])

  return (
    <section aria-labelledby="area-tool-heading" className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)]/60 pb-3">
        <div>
          <h2 id="area-tool-heading" className="text-sm sm:text-base font-bold flex items-center gap-2 text-[var(--text)]">
            <span role="img" aria-hidden="true">🏡</span> Spatial Land & Property Area Visualizer
          </h2>
          <p className="text-xs text-[var(--text2)] opacity-85 mt-0.5">
            Visualize land area, floor plans, and parcels against iconic real-world spaces.
          </p>
        </div>

        <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 self-start sm:self-auto">
          {fmt(hectares, 3)} ha · {fmt(acres, 3)} acres
        </div>
      </div>

      {/* Main Multi-Unit Display Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Square Meters</div>
          <div className="text-base sm:text-lg font-bold text-[var(--primary)] mt-0.5 font-mono">
            {fmt(sqm, 2)} <span className="text-xs font-sans">m²</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Square Feet</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono">
            {fmt(sqft, 1)} <span className="text-xs font-sans">sq ft</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Acres</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono">
            {fmt(acres, 4)} <span className="text-xs font-sans">ac</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Hectares</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono">
            {fmt(hectares, 4)} <span className="text-xs font-sans">ha</span>
          </div>
        </div>
      </div>

      {/* Interactive Input / Slider */}
      <div className="space-y-2 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-medium text-[var(--text)] gap-2">
          <label htmlFor="area-input" className="cursor-pointer">
            Enter Area in Square Meters:
          </label>
          <div className="flex items-center gap-2">
            <input
              id="area-input"
              type="number"
              inputMode="decimal"
              min="1"
              value={sqm || ''}
              onChange={e => setSqm(Math.max(1, parseFloat(e.target.value) || 0))}
              className="w-32 px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card2)] text-xs text-[var(--text)] font-mono outline-none focus:border-[var(--primary)] tabular-nums"
              aria-label="Area value in square meters"
            />
            <span className="text-xs text-[var(--text2)]">m²</span>
          </div>
        </div>

        <input
          type="range"
          min="10"
          max="50000"
          step="10"
          value={Math.min(50000, sqm)}
          onChange={e => setSqm(parseFloat(e.target.value))}
          className="w-full accent-[var(--primary)] cursor-pointer h-2 bg-[var(--border)] rounded-lg outline-none"
          aria-label="Area slider"
        />

        <div className="flex justify-between text-xs text-[var(--text2)] opacity-70 font-mono">
          <span>10 m² (Studio)</span>
          <span>436 m² (Court)</span>
          <span>7,140 m² (Soccer)</span>
          <span>20,000 m² (Block)</span>
          <span>50,000 m² (Large Lot)</span>
        </div>
      </div>

      {/* Real-World Spatial Equivalents */}
      <div className="space-y-2 pt-1">
        <div className="text-xs font-semibold text-[var(--text)]">Real-World Spatial Equivalents:</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {BENCHMARKS.map(b => {
            const count = sqm / b.sqm
            return (
              <button
                key={b.name}
                onClick={() => setSqm(b.sqm)}
                className={`p-2.5 rounded-xl border text-left transition-all interact-lift text-xs ${
                  Math.abs(sqm - b.sqm) < 1
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--text)] shadow-sm'
                    : 'border-[var(--border)] glass hover:bg-[var(--border)] text-[var(--text2)]'
                }`}
                aria-label={`Set area to ${b.name}: ${b.sqm} square meters`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-[var(--text)]">
                  <span role="img" aria-hidden="true">{b.icon}</span>
                  <span className="truncate">{b.name}</span>
                </div>
                <div className="text-xs font-mono font-medium text-[var(--primary)] mt-1">
                  ≈ {fmt(count, count < 1 ? 2 : 1)}x of this
                </div>
                <div className="text-xs opacity-70 truncate mt-0.5">{b.desc}</div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
