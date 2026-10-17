import { useState, useMemo } from 'react'
import { fmt } from '../../../utils/numbers'

interface CelestialBody {
  name: string
  icon: string
  g: number // m/s^2
  desc: string
}

const BODIES: CelestialBody[] = [
  { name: 'Earth', icon: '🌍', g: 9.80665, desc: '1.0g standard reference gravity' },
  { name: 'Moon', icon: '🌙', g: 1.622, desc: '16.5% of Earth gravity (easy jumping)' },
  { name: 'Mars', icon: '🔴', g: 3.721, desc: '37.9% of Earth gravity (Martian surface)' },
  { name: 'Venus', icon: '🟡', g: 8.87, desc: '90.4% of Earth gravity (dense atmosphere)' },
  { name: 'Jupiter', icon: '🪐', g: 24.79, desc: '252.8% of Earth gravity (gas giant core)' },
  { name: 'Sun Surface', icon: '☀️', g: 274.0, desc: '27.9x Earth gravity (stellar gravity)' },
]

export default function ForceVisualizer() {
  const [massKg, setMassKg] = useState<number>(75)

  // Force on Earth
  const earthNewtons = useMemo(() => massKg * 9.80665, [massKg])
  const earthLbf = useMemo(() => earthNewtons * 0.224809, [earthNewtons])
  const earthKiloNewtons = useMemo(() => earthNewtons / 1000, [earthNewtons])
  const dynes = useMemo(() => earthNewtons * 100000, [earthNewtons])

  return (
    <section aria-labelledby="force-tool-heading" className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)]/60 pb-3">
        <div>
          <h2 id="force-tool-heading" className="text-sm sm:text-base font-bold flex items-center gap-2 text-[var(--text)]">
            <span role="img" aria-hidden="true">💪</span> Gravitational Force & Planetary Weight Explorer
          </h2>
          <p className="text-xs text-[var(--text2)] opacity-85 mt-0.5">
            Newtonian mechanics: see how mass generates gravitational weight force across the Solar System.
          </p>
        </div>

        <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 self-start sm:self-auto font-mono">
          {fmt(earthNewtons, 1)} N · {fmt(earthLbf, 1)} lbf on Earth
        </div>
      </div>

      {/* Main Multi-Unit Display Grid on Earth */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-[11px] text-[var(--text2)] opacity-80 font-medium">Newtons (Earth)</div>
          <div className="text-base sm:text-lg font-bold text-[var(--primary)] mt-0.5 font-mono">
            {fmt(earthNewtons, 1)} <span className="text-xs font-sans">N</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-[11px] text-[var(--text2)] opacity-80 font-medium">Pound-Force (lbf)</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono">
            {fmt(earthLbf, 1)} <span className="text-xs font-sans">lbf</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-[11px] text-[var(--text2)] opacity-80 font-medium">Kilonewtons (kN)</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono">
            {fmt(earthKiloNewtons, 3)} <span className="text-xs font-sans">kN</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-[11px] text-[var(--text2)] opacity-80 font-medium">Kilogram-Force (kgf)</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono">
            {fmt(massKg, 1)} <span className="text-xs font-sans">kgf</span>
          </div>
        </div>
      </div>

      {/* Input Slider */}
      <div className="space-y-2 pt-1">
        <div className="flex justify-between items-center text-xs font-medium text-[var(--text)]">
          <label htmlFor="mass-slider" className="cursor-pointer">
            Object Mass: <span className="text-[var(--primary)] font-bold font-mono">{massKg} kg</span> ({fmt(massKg * 2.20462, 1)} lbs)
          </label>
          <span className="text-[11px] text-[var(--text2)] opacity-80">
            Dynes: <strong className="text-[var(--text)] font-mono">{fmt(dynes, 0)} dyn</strong>
          </span>
        </div>

        <input
          id="mass-slider"
          type="range"
          min="1"
          max="300"
          step="1"
          value={massKg}
          onChange={e => setMassKg(parseFloat(e.target.value))}
          className="w-full accent-[var(--primary)] cursor-pointer h-2 bg-[var(--border)] rounded-lg outline-none"
          aria-label="Object mass slider in kilograms"
        />
      </div>

      {/* Planetary Weight Comparison Grid */}
      <div className="space-y-2 pt-1">
        <div className="text-xs font-semibold text-[var(--text)]">Gravitational Downward Force Across the Solar System:</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BODIES.map(b => {
            const planetNewtons = massKg * b.g
            const planetLbf = planetNewtons * 0.224809
            const ratio = (b.g / 9.80665) * 100
            return (
              <div key={b.name} className="p-3 rounded-xl border border-[var(--border)] glass text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold text-[var(--text)]">
                  <span className="flex items-center gap-1.5">
                    <span role="img" aria-hidden="true">{b.icon}</span>
                    <span>{b.name}</span>
                  </span>
                  <span className="text-[10px] font-mono opacity-70">{fmt(ratio, 0)}% of Earth</span>
                </div>
                <div className="text-sm font-bold text-[var(--primary)] font-mono">
                  {fmt(planetNewtons, 1)} N <span className="text-[11px] text-[var(--text2)] font-normal font-sans">({fmt(planetLbf, 1)} lbf)</span>
                </div>
                <div className="text-[10px] text-[var(--text2)] opacity-60 truncate">{b.desc}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
