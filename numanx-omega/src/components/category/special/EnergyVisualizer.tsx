import { useState, useMemo } from 'react'
import { fmt } from '../../../utils/numbers'

interface EnergyBenchmark {
  name: string
  icon: string
  joules: number
  desc: string
}

const BENCHMARKS: EnergyBenchmark[] = [
  { name: 'Apple Fruit', icon: '🍎', joules: 397000, desc: 'Average food energy (~95 kcal)' },
  { name: 'Smartphone Charge', icon: '🔋', joules: 54000, desc: 'Full 0-100% battery charge (15 Wh)' },
  { name: '5km Jogging Run', icon: '🏃', joules: 1464000, desc: 'Cardio workout burn (~350 kcal)' },
  { name: '1 Hour of Netflix TV', icon: '📺', joules: 360000, desc: '55" 4K TV consumption (100 Wh)' },
  { name: '1 Liter Gasoline', icon: '⛽', joules: 34200000, desc: 'Combustion energy (9.5 kWh)' },
  { name: 'Daily Household Electricity', icon: '⚡', joules: 108000000, desc: 'Average home daily use (~30 kWh)' },
  { name: 'Lightning Strike', icon: '🌩️', joules: 1000000000, desc: 'Average cloud-to-ground flash (1 GJ)' },
  { name: '1 Ton of TNT', icon: '💥', joules: 4184000000, desc: 'Standard explosive benchmark (4.184 GJ)' },
]

export default function EnergyVisualizer() {
  const [joules, setJoules] = useState<number>(3600000) // 1 kWh

  const kcal = useMemo(() => joules / 4184, [joules])
  const kwh = useMemo(() => joules / 3600000, [joules])
  const kj = useMemo(() => joules / 1000, [joules])
  const btu = useMemo(() => joules / 1055.06, [joules])
  const wh = useMemo(() => joules / 3600, [joules])

  // Approx smartphone charges
  const phoneCharges = useMemo(() => joules / 54000, [joules])
  // Approx food calories
  const foodApples = useMemo(() => joules / 397000, [joules])

  return (
    <section aria-labelledby="energy-tool-heading" className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)]/60 pb-3">
        <div>
          <h2 id="energy-tool-heading" className="text-sm sm:text-base font-bold flex items-center gap-2 text-[var(--text)]">
            <span role="img" aria-hidden="true">⚡</span> Work & Energy Equivalence Calculator
          </h2>
          <p className="text-xs text-[var(--text2)] opacity-85 mt-0.5">
            Relate electrical, mechanical, and dietary caloric energy in one synchronized view.
          </p>
        </div>

        <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 self-start sm:self-auto font-mono">
          {fmt(kwh, 3)} kWh · {fmt(kcal, 1)} kcal
        </div>
      </div>

      {/* Main Multi-Unit Display Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Kilowatt-hours</div>
          <div className="text-base sm:text-lg font-bold text-[var(--primary)] mt-0.5 font-mono">
            {fmt(kwh, 3)} <span className="text-xs font-sans">kWh</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Food Calories</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono">
            {fmt(kcal, 1)} <span className="text-xs font-sans">kcal</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Kilojoules</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono">
            {fmt(kj, 1)} <span className="text-xs font-sans">kJ</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Watt-hours</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono">
            {fmt(wh, 1)} <span className="text-xs font-sans">Wh</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)] col-span-2 sm:col-span-1">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">BTU (Thermal)</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono">
            {fmt(btu, 1)} <span className="text-xs font-sans">BTU</span>
          </div>
        </div>
      </div>

      {/* Real-World Equivalence Strip */}
      <div className="p-3 rounded-xl bg-[var(--card2)] border border-[var(--border)] flex flex-col sm:flex-row items-center justify-around gap-2 text-xs text-center">
        <div>
          <span className="opacity-75">Equals battery recharge for: </span>
          <strong className="text-[var(--primary)] font-bold">{fmt(phoneCharges, 1)} smartphones 📱</strong>
        </div>
        <div className="hidden sm:block opacity-40 select-none">|</div>
        <div>
          <span className="opacity-75">Nutritional energy in: </span>
          <strong className="text-[var(--text)] font-bold">{fmt(foodApples, 1)} apples 🍏</strong>
        </div>
      </div>

      {/* Benchmarks Grid */}
      <div className="space-y-2 pt-1">
        <div className="text-xs font-semibold text-[var(--text)]">Standard Energy Benchmarks:</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {BENCHMARKS.map(b => (
            <button
              key={b.name}
              onClick={() => setJoules(b.joules)}
              className={`p-2.5 rounded-xl border text-left transition-all interact-lift text-xs ${
                Math.abs(joules - b.joules) < 100
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--text)] shadow-sm'
                  : 'border-[var(--border)] glass hover:bg-[var(--border)] text-[var(--text2)]'
              }`}
              aria-label={`Set energy to ${b.name}: ${b.joules} Joules`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-[var(--text)]">
                <span role="img" aria-hidden="true">{b.icon}</span>
                <span className="truncate">{b.name}</span>
              </div>
              <div className="text-xs opacity-75 font-mono mt-0.5">{fmt(b.joules / 3600000, 3)} kWh</div>
              <div className="text-xs opacity-60 truncate">{b.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
