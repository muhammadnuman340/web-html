import { useState, useMemo } from 'react'
import { fmt } from '../../../utils/numbers'

interface MaterialDensity {
  name: string
  icon: string
  kgM3: number
  desc: string
  category: 'Gas' | 'Wood/Bio' | 'Liquid' | 'Metal/Solid'
}

const MATERIALS: MaterialDensity[] = [
  { name: 'Air (Sea Level @ 15°C)', icon: '💨', kgM3: 1.225, desc: 'Atmospheric baseline', category: 'Gas' },
  { name: 'Cork', icon: '🍾', kgM3: 240, desc: 'Highly buoyant natural polymer', category: 'Wood/Bio' },
  { name: 'Pine Lumber', icon: '🌲', kgM3: 500, desc: 'Common structural softwood', category: 'Wood/Bio' },
  { name: 'Ice', icon: '🧊', kgM3: 917, desc: 'Floats with ~91.7% submerged', category: 'Liquid' },
  { name: 'Pure Water (@ 4°C)', icon: '💧', kgM3: 1000, desc: 'Global density standard (1 g/cm³)', category: 'Liquid' },
  { name: 'Sea Water (Saline)', icon: '🌊', kgM3: 1025, desc: '3.5% salinity ocean water', category: 'Liquid' },
  { name: 'Aluminum (6061)', icon: '✈️', kgM3: 2700, desc: 'Lightweight aerospace alloy', category: 'Metal/Solid' },
  { name: 'Structural Steel', icon: '🏗️', kgM3: 7850, desc: 'Standard carbon structural alloy', category: 'Metal/Solid' },
  { name: 'Pure Copper', icon: '🥉', kgM3: 8960, desc: 'Electrical wiring element', category: 'Metal/Solid' },
  { name: 'Lead', icon: '⚓', kgM3: 11340, desc: 'Heavy ballast and radiation shielding', category: 'Metal/Solid' },
  { name: 'Pure 24k Gold', icon: '🪙', kgM3: 19300, desc: 'Extremely dense precious metal', category: 'Metal/Solid' },
  { name: 'Platinum', icon: '💍', kgM3: 21450, desc: 'Among the densest natural elements', category: 'Metal/Solid' },
]

export default function DensityVisualizer() {
  const [kgM3, setKgM3] = useState<number>(1000)

  const gCm3 = useMemo(() => kgM3 / 1000, [kgM3])
  const lbFt3 = useMemo(() => kgM3 * 0.062428, [kgM3])
  const lbIn3 = useMemo(() => kgM3 * 0.000036127, [kgM3])

  // Archimedes buoyancy in freshwater (1000 kg/m3)
  const specificGravity = useMemo(() => kgM3 / 1000, [kgM3])
  const floats = specificGravity < 1
  const submergedPct = floats ? Math.round(specificGravity * 100) : 100

  return (
    <section aria-labelledby="density-tool-heading" className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)]/60 pb-3">
        <div>
          <h2 id="density-tool-heading" className="text-sm sm:text-base font-bold flex items-center gap-2 text-[var(--text)]">
            <span role="img" aria-hidden="true">⚖️</span> Material Density & Archimedes Buoyancy Analyzer
          </h2>
          <p className="text-xs text-[var(--text2)] opacity-85 mt-0.5">
            Compare material mass per unit volume across metric, cgs, and imperial machinist standards.
          </p>
        </div>

        <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 self-start sm:self-auto font-mono">
          {fmt(kgM3, 1)} kg/m³ · {fmt(gCm3, 3)} g/cm³
        </div>
      </div>

      {/* Main Multi-Unit Display Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Kilograms / m³ (SI)</div>
          <div className="text-base sm:text-lg font-bold text-[var(--primary)] mt-0.5 font-mono tabular-nums">
            {fmt(kgM3, 1)} <span className="text-xs font-sans">kg/m³</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Grams / cm³ (cgs)</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono tabular-nums">
            {fmt(gCm3, 3)} <span className="text-xs font-sans">g/cm³</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Pounds / ft³ (US)</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono tabular-nums">
            {fmt(lbFt3, 2)} <span className="text-xs font-sans">lb/ft³</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Specific Gravity (vs Water)</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono tabular-nums">
            {fmt(specificGravity, 3)} <span className="text-xs font-sans">SG</span>
          </div>
        </div>
      </div>

      {/* Archimedes Buoyancy Simulator */}
      <div className="p-3.5 rounded-xl bg-[var(--card2)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
            <span>🌊</span> Archimedes Principle in Water (1,000 kg/m³)
          </div>
          <p className="text-xs text-[var(--text2)]">
            {floats ? (
              <span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">Floats in water:</strong> An unconstrained block will float with approximately{' '}
                <strong className="text-[var(--text)] font-semibold">{submergedPct}%</strong> of its volume submerged beneath the waterline.
              </span>
            ) : specificGravity === 1 ? (
              <span className="text-sky-600 dark:text-sky-400 font-semibold">
                Neutrally buoyant: Suspends naturally at any water depth without sinking or rising.
              </span>
            ) : (
              <span>
                <strong className="text-amber-600 dark:text-amber-400 font-semibold">Sinks in water:</strong> With a specific gravity of{' '}
                <strong className="text-[var(--text)] font-semibold">{fmt(specificGravity, 2)}</strong>, this material is denser than water and sinks to the bottom.
              </span>
            )}
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-lg border text-xs font-semibold self-start sm:self-center font-mono whitespace-nowrap bg-[var(--surface-1)]">
          {floats ? '🟢 BUOYANT' : specificGravity === 1 ? '🔵 NEUTRAL' : '🟡 SINKS'}
        </div>
      </div>

      {/* Preset Material Benchmarks */}
      <div className="space-y-1.5">
        <div className="text-xs font-semibold text-[var(--text)]">Standard Engineering Materials & Elements:</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {MATERIALS.map((m, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setKgM3(m.kgM3)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                Math.abs(kgM3 - m.kgM3) < 0.1
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)] font-semibold'
                  : 'border-[var(--border)] bg-[var(--card2)] text-[var(--text)] hover:border-[var(--border-hover)]'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs">
                <span>{m.icon}</span>
                <span className="truncate">{m.name}</span>
              </div>
              <div className="text-xs font-mono font-bold mt-1 text-[var(--primary)]">
                {m.kgM3} kg/m³
              </div>
              <div className="text-[10px] text-[var(--text2)] opacity-75 truncate">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
