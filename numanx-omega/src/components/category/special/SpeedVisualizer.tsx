import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { fmt } from '../../../utils/numbers'

interface SpeedBenchmark {
  label: string
  kmh: number
  icon: string
  desc: string
}

const BENCHMARKS: SpeedBenchmark[] = [
  { label: 'Walking', kmh: 5, icon: '🚶', desc: 'Average human walking pace' },
  { label: 'City Cycling', kmh: 20, icon: '🚴', desc: 'Commuter bicycle pace' },
  { label: 'Cheetah', kmh: 110, icon: '🐆', desc: 'Fastest land mammal sprint' },
  { label: 'F1 Racecar', kmh: 350, icon: '🏎️', desc: 'Modern Formula 1 top track speed' },
  { label: 'Bullet Train', kmh: 320, icon: '🚄', desc: 'High-speed Shinkansen / TGV' },
  { label: 'Commercial Jet', kmh: 900, icon: '✈️', desc: 'Boeing 787 / Airbus A350 cruise' },
  { label: 'Speed of Sound', kmh: 1234.8, icon: '💥', desc: 'Mach 1 at sea level (20°C)' },
  { label: 'ISS Space Station', kmh: 27600, icon: '🛰️', desc: 'Low Earth orbit speed' },
]

export default function SpeedVisualizer() {
  const [speedKmh, setSpeedKmh] = useState<number>(100)

  const mph = useMemo(() => speedKmh * 0.621371, [speedKmh])
  const ms = useMemo(() => speedKmh / 3.6, [speedKmh])
  const knots = useMemo(() => speedKmh * 0.539957, [speedKmh])
  const mach = useMemo(() => speedKmh / 1234.8, [speedKmh])

  // Time to travel 100 km / 62.1 miles
  const timeFor100km = useMemo(() => {
    if (speedKmh <= 0) return 'Indefinite'
    const hours = 100 / speedKmh
    if (hours < 1 / 60) {
      return `${Math.round(hours * 3600)} sec`
    }
    if (hours < 1) {
      return `${Math.round(hours * 60)} min`
    }
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h ${m}m`
  }, [speedKmh])

  // Closest benchmark
  const closestBenchmark = useMemo(() => {
    return BENCHMARKS.reduce((prev, curr) =>
      Math.abs(curr.kmh - speedKmh) < Math.abs(prev.kmh - speedKmh) ? curr : prev
    )
  }, [speedKmh])

  return (
    <section aria-labelledby="speed-tool-heading" className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)]/60 pb-3">
        <div>
          <h2 id="speed-tool-heading" className="text-sm sm:text-base font-bold flex items-center gap-2 text-[var(--text)]">
            <span role="img" aria-hidden="true">🏎️</span> Interactive Speed & Velocity Benchmarker
          </h2>
          <p className="text-xs text-[var(--text2)] opacity-85 mt-0.5">
            Compare velocity in real-time across Metric, Imperial, Nautical, and Mach scales.
          </p>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] self-start sm:self-auto border border-[var(--primary)]/20">
          Closest to: {closestBenchmark.icon} {closestBenchmark.label}
        </span>
      </div>

      {/* Main Conversion Gauge Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Kilometers / Hour</div>
          <div className="text-base sm:text-lg font-bold text-[var(--primary)] mt-0.5 font-mono">
            {fmt(speedKmh, 2)} <span className="text-xs font-sans">km/h</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Miles / Hour</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono">
            {fmt(mph, 2)} <span className="text-xs font-sans">mph</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Meters / Second</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono">
            {fmt(ms, 2)} <span className="text-xs font-sans">m/s</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Knots (Nautical)</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono">
            {fmt(knots, 2)} <span className="text-xs font-sans">kn</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)] col-span-2 sm:col-span-1">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Mach Scale</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono">
            {fmt(mach, 3)} <span className="text-xs font-sans">Mach</span>
          </div>
        </div>
      </div>

      {/* Interactive Slider */}
      <div className="space-y-2 pt-1">
        <div className="flex justify-between items-center text-xs font-medium text-[var(--text)]">
          <label htmlFor="speed-slider" className="cursor-pointer">
            Adjust Speed: <span className="text-[var(--primary)] font-bold font-mono">{fmt(speedKmh, 1)} km/h</span> ({fmt(mph, 1)} mph)
          </label>
          <span className="text-xs text-[var(--text2)] opacity-80">
            100 km Travel Time: <strong className="text-[var(--text)]">{timeFor100km}</strong>
          </span>
        </div>

        <input
          id="speed-slider"
          type="range"
          min="1"
          max="1500"
          step="1"
          value={Math.min(1500, speedKmh)}
          onChange={e => setSpeedKmh(parseFloat(e.target.value))}
          className="w-full accent-[var(--primary)] cursor-pointer h-2 bg-[var(--border)] rounded-lg outline-none"
          aria-label="Speed slider in kilometers per hour"
        />

        <div className="flex justify-between text-xs text-[var(--text2)] opacity-70 font-mono">
          <span>1 km/h</span>
          <span>120 km/h (Highway)</span>
          <span>500 km/h</span>
          <span>1,000 km/h (Jet)</span>
          <span>1,235 km/h (Mach 1)</span>
        </div>
      </div>

      {/* Presets Grid */}
      <div className="space-y-2 pt-2">
        <div className="text-xs font-semibold text-[var(--text)]">Real-World Speed Reference Presets</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {BENCHMARKS.map(b => (
            <button
              key={b.label}
              onClick={() => setSpeedKmh(b.kmh)}
              className={`p-2.5 rounded-xl border text-left transition-all interact-lift text-xs ${
                Math.abs(speedKmh - b.kmh) < 2
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--text)] shadow-sm'
                  : 'border-[var(--border)] glass hover:bg-[var(--border)] text-[var(--text2)]'
              }`}
              aria-label={`Set speed to ${b.label}: ${b.kmh} kilometers per hour`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-[var(--text)]">
                <span role="img" aria-hidden="true">{b.icon}</span>
                <span>{b.label}</span>
              </div>
              <div className="text-xs opacity-75 font-mono mt-0.5">{b.kmh.toLocaleString()} km/h · {Math.round(b.kmh * 0.621371)} mph</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
