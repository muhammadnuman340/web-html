import { useState, useMemo } from 'react'
import { fmt } from '../../../utils/numbers'

interface VolumeBenchmark {
  name: string
  icon: string
  liters: number
  desc: string
}

const BENCHMARKS: VolumeBenchmark[] = [
  { name: 'Water Drop', icon: '💧', liters: 0.00005, desc: 'Single medical drop (~0.05 mL)' },
  { name: 'Teaspoon', icon: '🥄', liters: 0.005, desc: 'Standard cooking metric (5 mL)' },
  { name: 'Coffee Mug', icon: '☕', liters: 0.25, desc: 'Average morning cup (250 mL)' },
  { name: 'Wine Bottle', icon: '🍾', liters: 0.75, desc: 'Standard glass bottle (750 mL)' },
  { name: 'Milk Gallon', icon: '🥛', liters: 3.78541, desc: 'Standard US gallon jug' },
  { name: 'Oil Barrel', icon: '🛢️', liters: 158.987, desc: 'Crude petroleum barrel (42 US gal)' },
  { name: 'Standard Bathtub', icon: '🛁', liters: 200, desc: 'Full soaking tub capacity' },
  { name: 'Olympic Pool', icon: '🏊', liters: 2500000, desc: 'Competition 50m pool (2.5 million L)' },
]

export default function VolumeVisualizer() {
  const [liters, setLiters] = useState<number>(5)

  const milliliters = useMemo(() => liters * 1000, [liters])
  const gallonsUS = useMemo(() => liters * 0.264172, [liters])
  const fluidOunces = useMemo(() => liters * 33.814, [liters])
  const cubicMeters = useMemo(() => liters * 0.001, [liters])
  const cups = useMemo(() => liters * 4.22675, [liters])

  return (
    <section aria-labelledby="volume-tool-heading" className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)]/60 pb-3">
        <div>
          <h2 id="volume-tool-heading" className="text-sm sm:text-base font-bold flex items-center gap-2 text-[var(--text)]">
            <span role="img" aria-hidden="true">🧪</span> Liquid Capacity & Volume Benchmarker
          </h2>
          <p className="text-xs text-[var(--text2)] opacity-85 mt-0.5">
            Visualize fluid capacities and container volumes across Metric, Imperial, and US Liquid units.
          </p>
        </div>

        <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 self-start sm:self-auto">
          {fmt(liters, 2)} L · {fmt(gallonsUS, 2)} US gal
        </div>
      </div>

      {/* Main Multi-Unit Display Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-[11px] text-[var(--text2)] opacity-80 font-medium">Liters</div>
          <div className="text-base sm:text-lg font-bold text-[var(--primary)] mt-0.5 font-mono">
            {fmt(liters, 2)} <span className="text-xs font-sans">L</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-[11px] text-[var(--text2)] opacity-80 font-medium">Milliliters</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono">
            {fmt(milliliters, 0)} <span className="text-xs font-sans">mL</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-[11px] text-[var(--text2)] opacity-80 font-medium">US Gallons</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono">
            {fmt(gallonsUS, 2)} <span className="text-xs font-sans">gal</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-[11px] text-[var(--text2)] opacity-80 font-medium">Fluid Ounces</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono">
            {fmt(fluidOunces, 1)} <span className="text-xs font-sans">fl oz</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)] col-span-2 sm:col-span-1">
          <div className="text-[11px] text-[var(--text2)] opacity-80 font-medium">Standard Cups</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono">
            {fmt(cups, 1)} <span className="text-xs font-sans">cups</span>
          </div>
        </div>
      </div>

      {/* Interactive Slider */}
      <div className="space-y-2 pt-1">
        <div className="flex justify-between items-center text-xs font-medium text-[var(--text)]">
          <label htmlFor="volume-slider" className="cursor-pointer">
            Adjust Volume: <span className="text-[var(--primary)] font-bold font-mono">{fmt(liters, 2)} Liters</span>
          </label>
          <span className="text-[11px] text-[var(--text2)] opacity-80">
            Cubic Meters: <strong className="text-[var(--text)] font-mono">{fmt(cubicMeters, 4)} m³</strong>
          </span>
        </div>

        <input
          id="volume-slider"
          type="range"
          min="0.1"
          max="200"
          step="0.5"
          value={Math.min(200, liters)}
          onChange={e => setLiters(parseFloat(e.target.value))}
          className="w-full accent-[var(--primary)] cursor-pointer h-2 bg-[var(--border)] rounded-lg outline-none"
          aria-label="Volume slider in liters"
        />

        <div className="flex justify-between text-[10px] text-[var(--text2)] opacity-70 font-mono">
          <span>0.1 L (Glass)</span>
          <span>3.8 L (Gallon)</span>
          <span>50 L (Fuel Tank)</span>
          <span>100 L</span>
          <span>200 L (Bathtub)</span>
        </div>
      </div>

      {/* Benchmark Presets */}
      <div className="space-y-2 pt-1">
        <div className="text-xs font-semibold text-[var(--text)]">Standard Vessel Capacities:</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {BENCHMARKS.map(b => (
            <button
              key={b.name}
              onClick={() => setLiters(b.liters)}
              className={`p-2.5 rounded-xl border text-left transition-all interact-lift text-xs ${
                Math.abs(liters - b.liters) < 0.01
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--text)] shadow-sm'
                  : 'border-[var(--border)] glass hover:bg-[var(--border)] text-[var(--text2)]'
              }`}
              aria-label={`Set volume to ${b.name}: ${b.liters} liters`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-[var(--text)]">
                <span role="img" aria-hidden="true">{b.icon}</span>
                <span className="truncate">{b.name}</span>
              </div>
              <div className="text-[10px] opacity-75 font-mono mt-0.5">{fmt(b.liters, b.liters < 1 ? 3 : 1)} L</div>
              <div className="text-[10px] opacity-60 truncate">{b.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
