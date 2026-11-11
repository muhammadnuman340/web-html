import { useState, useMemo } from 'react'
import { fmt } from '../../../utils/numbers'

interface TorqueBenchmark {
  name: string
  icon: string
  nm: number
  desc: string
}

const BENCHMARKS: TorqueBenchmark[] = [
  { name: 'Bicycle Stem Bolt', icon: '🚲', nm: 5, desc: 'Precision carbon/aluminum clamp (44 lb·in)' },
  { name: 'Spark Plug (Aluminum)', icon: '⚡', nm: 25, desc: 'Automotive thread sealing (18.4 lb·ft)' },
  { name: 'Engine Oil Drain Plug', icon: '🛢️', nm: 35, desc: 'Sump washer crush torque (25.8 lb·ft)' },
  { name: 'Car Wheel Lug Nut (M12)', icon: '🚗', nm: 110, desc: 'Standard passenger alloy wheel (81.1 lb·ft)' },
  { name: 'Truck Wheel Lug Nut (M14)', icon: '🛻', nm: 175, desc: 'Heavy SUV / pickup truck spec (129.1 lb·ft)' },
  { name: 'Axle Hub Spindle Nut', icon: '⚙️', nm: 280, desc: 'Drive axle pre-load bearing (206.5 lb·ft)' },
  { name: 'Semi-Truck Wheel Nut', icon: '🚛', nm: 650, desc: 'Commercial Class 8 wheel clamp (479.4 lb·ft)' },
  { name: 'Wind Turbine Flange Bolt', icon: '🌬️', nm: 3500, desc: 'Industrial structural M36 fastener (2,581 lb·ft)' },
]

export default function TorqueVisualizer() {
  const [nm, setNm] = useState<number>(110)

  // Conversions
  const lbfFt = useMemo(() => nm * 0.737562, [nm])
  const lbfIn = useMemo(() => nm * 8.85075, [nm])
  const kgfM = useMemo(() => nm * 0.101972, [nm])

  // Leverage calculation: Torque = Force × Distance
  const [wrenchLengthCm, setWrenchLengthCm] = useState<number>(30)
  const requiredForceN = useMemo(() => {
    const meters = wrenchLengthCm / 100
    return meters > 0 ? nm / meters : 0
  }, [nm, wrenchLengthCm])
  const requiredForceLbs = useMemo(() => requiredForceN * 0.224809, [requiredForceN])

  return (
    <section aria-labelledby="torque-tool-heading" className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)]/60 pb-3">
        <div>
          <h2 id="torque-tool-heading" className="text-sm sm:text-base font-bold flex items-center gap-2 text-[var(--text)]">
            <span role="img" aria-hidden="true">🔧</span> Torque & Fastener Mechanical Benchmarker
          </h2>
          <p className="text-xs text-[var(--text2)] opacity-85 mt-0.5">
            Compare bolt tightening specs across Newton-meters, foot-pounds, and wrench leverage forces.
          </p>
        </div>

        <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 self-start sm:self-auto font-mono">
          {fmt(nm, 1)} N·m · {fmt(lbfFt, 1)} lb·ft
        </div>
      </div>

      {/* Main Multi-Unit Display Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Newton-Meters</div>
          <div className="text-base sm:text-lg font-bold text-[var(--primary)] mt-0.5 font-mono tabular-nums">
            {fmt(nm, 2)} <span className="text-xs font-sans">N·m</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Pound-Feet (Foot-Pounds)</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono tabular-nums">
            {fmt(lbfFt, 2)} <span className="text-xs font-sans">lb·ft</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Pound-Inches</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono tabular-nums">
            {fmt(lbfIn, 1)} <span className="text-xs font-sans">lb·in</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Kilogram-Force Meter</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono tabular-nums">
            {fmt(kgfM, 3)} <span className="text-xs font-sans">kgf·m</span>
          </div>
        </div>
      </div>

      {/* Interactive Range Slider */}
      <div className="glass rounded-xl p-3.5 border border-[var(--border)] space-y-2">
        <div className="flex justify-between items-center text-xs">
          <label htmlFor="torque-slider" className="font-semibold text-[var(--text)]">
            Adjust Applied Torque:
          </label>
          <span className="font-mono text-[var(--primary)] font-bold">{fmt(nm, 1)} N·m ({fmt(lbfFt, 1)} lb·ft)</span>
        </div>
        <input
          id="torque-slider"
          type="range"
          min="1"
          max="500"
          step="1"
          value={nm}
          onChange={e => setNm(Number(e.target.value))}
          className="w-full accent-[var(--primary)] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-[var(--text2)] font-mono">
          <span>1 N·m (Delicate)</span>
          <span>110 N·m (Car Wheel)</span>
          <span>250 N·m (Axle)</span>
          <span>500 N·m (Heavy Truck)</span>
        </div>
      </div>

      {/* Wrench Leverage Arm Calculator */}
      <div className="p-3.5 rounded-xl bg-[var(--card2)] border border-[var(--border)] space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-[var(--text)]">
          <span className="flex items-center gap-1.5">
            <span>⚖️</span> Hand Wrench Effort Calculator (Torque = Force × Length)
          </span>
          <span className="font-mono text-[var(--primary)]">{wrenchLengthCm} cm wrench</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={wrenchLengthCm}
            onChange={e => setWrenchLengthCm(Number(e.target.value))}
            className="flex-1 accent-[var(--primary)] cursor-pointer"
            aria-label="Wrench Length in Centimeters"
          />
        </div>
        <div className="text-xs text-[var(--text2)] leading-relaxed">
          To achieve <strong className="text-[var(--text)] font-semibold">{fmt(nm, 1)} N·m</strong> using a{' '}
          <strong className="text-[var(--text)] font-semibold">{wrenchLengthCm} cm</strong> ({(wrenchLengthCm / 2.54).toFixed(1)} in) wrench, you must pull with{' '}
          <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{fmt(requiredForceN, 1)} N</strong> of force (~{fmt(requiredForceLbs, 1)} lbs / {(requiredForceN / 9.80665).toFixed(1)} kg weight equivalent).
        </div>
      </div>

      {/* Benchmark Presets */}
      <div className="space-y-1.5">
        <div className="text-xs font-semibold text-[var(--text)]">Standard Automotive & Mechanical Specs:</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {BENCHMARKS.map((b, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setNm(b.nm)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                Math.abs(nm - b.nm) < 1
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)] font-semibold'
                  : 'border-[var(--border)] bg-[var(--card2)] text-[var(--text)] hover:border-[var(--border-hover)]'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs">
                <span>{b.icon}</span>
                <span className="truncate">{b.name}</span>
              </div>
              <div className="text-xs font-mono font-bold mt-1 text-[var(--primary)]">{b.nm} N·m</div>
              <div className="text-[10px] text-[var(--text2)] opacity-75 truncate">{b.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
