import { useState, useMemo } from 'react'
import { fmt } from '../../../utils/numbers'

interface PressureBenchmark {
  name: string
  icon: string
  bar: number
  desc: string
}

const BENCHMARKS: PressureBenchmark[] = [
  { name: 'Standard Atmosphere', icon: '🌍', bar: 1.01325, desc: 'Sea level standard atmospheric pressure (1 atm)' },
  { name: 'Human Blood Pressure', icon: '❤️', bar: 0.16, desc: 'Systolic arterial benchmark (120 mmHg / 2.3 psi)' },
  { name: 'Car Tire', icon: '🚗', bar: 2.2, desc: 'Typical passenger vehicle tire inflation (32 psi)' },
  { name: 'Road Bicycle Tire', icon: '🚴', bar: 7.0, desc: 'High-pressure road racing tire (100 psi)' },
  { name: 'Espresso Extraction', icon: '☕', bar: 9.0, desc: 'Optimal crema brew pressure (130 psi)' },
  { name: 'Scuba Diving Cylinder', icon: '🤿', bar: 200, desc: 'Full compressed air tank (2,900 psi)' },
  { name: 'Industrial Waterjet Cutter', icon: '💧', bar: 4000, desc: 'Precision steel cutting stream (58,000 psi)' },
  { name: 'Mariana Trench Floor', icon: '🌊', bar: 1086, desc: 'Deepest oceanic abyss point (~15,750 psi)' },
]

export default function PressureVisualizer() {
  const [bar, setBar] = useState<number>(2.2)

  const psi = useMemo(() => bar * 14.5038, [bar])
  const kpa = useMemo(() => bar * 100, [bar])
  const atm = useMemo(() => bar / 1.01325, [bar])
  const mmhg = useMemo(() => bar * 750.062, [bar])
  const pa = useMemo(() => bar * 100000, [bar])

  return (
    <section aria-labelledby="pressure-tool-heading" className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)]/60 pb-3">
        <div>
          <h2 id="pressure-tool-heading" className="text-sm sm:text-base font-bold flex items-center gap-2 text-[var(--text)]">
            <span role="img" aria-hidden="true">🔵</span> Barometric & Atmospheric Pressure Gauge
          </h2>
          <p className="text-xs text-[var(--text2)] opacity-85 mt-0.5">
            Compare pneumatic, hydraulic, and environmental atmospheric pressures.
          </p>
        </div>

        <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 self-start sm:self-auto font-mono">
          {fmt(bar, 2)} bar · {fmt(psi, 1)} PSI
        </div>
      </div>

      {/* Main Multi-Unit Display Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Bar</div>
          <div className="text-base sm:text-lg font-bold text-[var(--primary)] mt-0.5 font-mono">
            {fmt(bar, 3)} <span className="text-xs font-sans">bar</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">PSI</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono">
            {fmt(psi, 1)} <span className="text-xs font-sans">psi</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Kilopascal</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono">
            {fmt(kpa, 1)} <span className="text-xs font-sans">kPa</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Atmospheres</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono">
            {fmt(atm, 2)} <span className="text-xs font-sans">atm</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)] col-span-2 sm:col-span-1">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">mmHg / Torr</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono">
            {fmt(mmhg, 0)} <span className="text-xs font-sans">mmHg</span>
          </div>
        </div>
      </div>

      {/* Interactive Slider */}
      <div className="space-y-2 pt-1">
        <div className="flex justify-between items-center text-xs font-medium text-[var(--text)]">
          <label htmlFor="pressure-slider" className="cursor-pointer">
            Adjust Pressure: <span className="text-[var(--primary)] font-bold font-mono">{fmt(bar, 2)} bar</span> ({fmt(psi, 1)} psi)
          </label>
          <span className="text-xs text-[var(--text2)] opacity-80">
            Absolute Pascals: <strong className="text-[var(--text)] font-mono">{fmt(pa, 0)} Pa</strong>
          </span>
        </div>

        <input
          id="pressure-slider"
          type="range"
          min="0.1"
          max="50"
          step="0.1"
          value={Math.min(50, bar)}
          onChange={e => setBar(parseFloat(e.target.value))}
          className="w-full accent-[var(--primary)] cursor-pointer h-2 bg-[var(--border)] rounded-lg outline-none"
          aria-label="Pressure slider in bar"
        />

        <div className="flex justify-between text-xs text-[var(--text2)] opacity-70 font-mono">
          <span>0.1 bar</span>
          <span>1.0 bar (Atmosphere)</span>
          <span>2.2 bar (Tire)</span>
          <span>9 bar (Espresso)</span>
          <span>50 bar</span>
        </div>
      </div>

      {/* Benchmarks Grid */}
      <div className="space-y-2 pt-1">
        <div className="text-xs font-semibold text-[var(--text)]">Standard Pressure Benchmarks:</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {BENCHMARKS.map(b => (
            <button
              key={b.name}
              onClick={() => setBar(b.bar)}
              className={`p-2.5 rounded-xl border text-left transition-all interact-lift text-xs ${
                Math.abs(bar - b.bar) < 0.1
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--text)] shadow-sm'
                  : 'border-[var(--border)] glass hover:bg-[var(--border)] text-[var(--text2)]'
              }`}
              aria-label={`Set pressure to ${b.name}: ${b.bar} bar`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-[var(--text)]">
                <span role="img" aria-hidden="true">{b.icon}</span>
                <span className="truncate">{b.name}</span>
              </div>
              <div className="text-xs opacity-75 font-mono mt-0.5">{fmt(b.bar, 2)} bar · {Math.round(b.bar * 14.5038)} psi</div>
              <div className="text-xs opacity-60 truncate">{b.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
