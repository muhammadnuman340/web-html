import { useState, useMemo } from 'react'
import { fmt } from '../../../utils/numbers'

interface PowerBenchmark {
  name: string
  icon: string
  watts: number
  desc: string
}

const BENCHMARKS: PowerBenchmark[] = [
  { name: 'LED Light Bulb', icon: '💡', watts: 10, desc: '60W equivalent illumination' },
  { name: 'Smartphone Charger', icon: '🔌', watts: 30, desc: 'Fast USB-C wall adapter' },
  { name: 'Microwave Oven', icon: '🍲', watts: 1200, desc: 'Standard kitchen reheating (1.2 kW)' },
  { name: 'Electric Kettle', icon: '🫖', watts: 2200, desc: 'Rapid boiling element (2.2 kW)' },
  { name: 'Sedan Car Engine', icon: '🚗', watts: 110000, desc: 'Typical passenger engine (~148 hp)' },
  { name: 'F1 Power Unit', icon: '🏎️', watts: 745700, desc: 'V6 Turbo Hybrid engine (~1,000 hp)' },
  { name: 'Wind Turbine', icon: '🌬️', watts: 3000000, desc: 'Modern commercial offshore unit (3 MW)' },
  { name: 'Commercial Nuclear Reactor', icon: '⚛️', watts: 1000000000, desc: 'Baseload electrical plant (1,000 MW / 1 GW)' },
]

export default function PowerVisualizer() {
  const [watts, setWatts] = useState<number>(1500)

  const kilowatts = useMemo(() => watts / 1000, [watts])
  const horsepower = useMemo(() => watts / 745.7, [watts])
  const megawatts = useMemo(() => watts / 1000000, [watts])
  const btuPerHour = useMemo(() => watts * 3.41214, [watts])

  // Hourly energy production in kWh
  const hourlyKwh = useMemo(() => kilowatts * 1, [kilowatts])

  return (
    <section aria-labelledby="power-tool-heading" className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)]/60 pb-3">
        <div>
          <h2 id="power-tool-heading" className="text-sm sm:text-base font-bold flex items-center gap-2 text-[var(--text)]">
            <span role="img" aria-hidden="true">💡</span> Power Output & Horsepower Benchmarker
          </h2>
          <p className="text-xs text-[var(--text2)] opacity-85 mt-0.5">
            Compare mechanical horsepower, thermal dissipation, and electrical generation rates.
          </p>
        </div>

        <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 self-start sm:self-auto font-mono">
          {fmt(kilowatts, 2)} kW · {fmt(horsepower, 2)} hp
        </div>
      </div>

      {/* Main Multi-Unit Display Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Kilowatts</div>
          <div className="text-base sm:text-lg font-bold text-[var(--primary)] mt-0.5 font-mono tabular-nums">
            {fmt(kilowatts, 3)} <span className="text-xs font-sans">kW</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Mechanical Horsepower</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono tabular-nums">
            {fmt(horsepower, 2)} <span className="text-xs font-sans">hp</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Watts</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono tabular-nums">
            {fmt(watts, 0)} <span className="text-xs font-sans">W</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Thermal BTU/hr</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono tabular-nums">
            {fmt(btuPerHour, 0)} <span className="text-xs font-sans">BTU/h</span>
          </div>
        </div>
      </div>

      {/* Input Slider */}
      <div className="space-y-2 pt-1">
        <div className="flex justify-between items-center text-xs font-medium text-[var(--text)]">
          <label htmlFor="power-slider" className="cursor-pointer">
            Power Rating: <span className="text-[var(--primary)] font-bold font-mono tabular-nums">{fmt(watts, 0)} W</span> ({fmt(horsepower, 2)} hp)
          </label>
          <span className="text-xs text-[var(--text2)] opacity-80">
            Running 1 hour consumes: <strong className="text-[var(--text)] font-mono tabular-nums">{fmt(hourlyKwh, 2)} kWh</strong>
          </span>
        </div>

        <input
          id="power-slider"
          type="range"
          min="10"
          max="10000"
          step="10"
          value={Math.min(10000, watts)}
          onChange={e => setWatts(parseFloat(e.target.value))}
          className="w-full accent-[var(--primary)] cursor-pointer h-2 bg-[var(--border)] rounded-lg outline-none"
          aria-label="Power slider in watts"
        />

        <div className="flex justify-between text-xs text-[var(--text2)] opacity-70 font-mono tabular-nums">
          <span>10 W (LED)</span>
          <span>1,500 W (Toaster)</span>
          <span>3,500 W (Oven)</span>
          <span>7,500 W (EV Level 2)</span>
          <span>10,000 W</span>
        </div>
      </div>

      {/* Benchmarks Grid */}
      <div className="space-y-2 pt-1">
        <div className="text-xs font-semibold text-[var(--text)]">Standard Power Benchmarks:</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {BENCHMARKS.map(b => (
            <button
              key={b.name}
              onClick={() => setWatts(b.watts)}
              className={`p-2.5 rounded-xl border text-left transition-all interact-lift text-xs ${
                Math.abs(watts - b.watts) < 5
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--text)] shadow-sm'
                  : 'border-[var(--border)] glass hover:bg-[var(--border)] text-[var(--text2)]'
              }`}
              aria-label={`Set power to ${b.name}: ${b.watts} Watts`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-[var(--text)]">
                <span role="img" aria-hidden="true">{b.icon}</span>
                <span className="truncate">{b.name}</span>
              </div>
              <div className="text-xs opacity-75 font-mono mt-0.5">{fmt(b.watts >= 1e6 ? b.watts / 1e6 : b.watts >= 1e3 ? b.watts / 1e3 : b.watts, 1)} {b.watts >= 1e6 ? 'MW' : b.watts >= 1e3 ? 'kW' : 'W'}</div>
              <div className="text-xs opacity-60 truncate">{b.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
