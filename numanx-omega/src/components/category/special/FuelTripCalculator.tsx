import { useState, useMemo } from 'react'
import { fmt } from '../../../utils/numbers'

interface VehiclePreset {
  name: string
  icon: string
  l100km: number
  mpgUS: number
  desc: string
}

const VEHICLE_PRESETS: VehiclePreset[] = [
  { name: 'Hybrid Sedan', icon: '🔋', l100km: 4.2, mpgUS: 56, desc: 'e.g. Toyota Prius / Ioniq' },
  { name: 'Compact Car', icon: '🚗', l100km: 6.5, mpgUS: 36, desc: 'e.g. Civic / Corolla / Golf' },
  { name: 'Family Crossover', icon: '🚙', l100km: 9.0, mpgUS: 26, desc: 'e.g. RAV4 / CR-V / Tiguan' },
  { name: 'Pickup Truck', icon: '🛻', l100km: 13.5, mpgUS: 17, desc: 'e.g. F-150 / Silverado / Ram' },
]

export default function FuelTripCalculator() {
  const [distanceKm, setDistanceKm] = useState<number>(350)
  const [efficiencyL100km, setEfficiencyL100km] = useState<number>(7.2)
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState<number>(1.65)
  const [currencySymbol, setCurrencySymbol] = useState<string>('$')

  // Derived calculations
  const distanceMiles = useMemo(() => distanceKm * 0.621371, [distanceKm])
  const mpgUS = useMemo(() => (efficiencyL100km > 0 ? 235.215 / efficiencyL100km : 0), [efficiencyL100km])
  const mpgUK = useMemo(() => (efficiencyL100km > 0 ? 282.481 / efficiencyL100km : 0), [efficiencyL100km])

  const totalFuelLiters = useMemo(() => (distanceKm * efficiencyL100km) / 100, [distanceKm, efficiencyL100km])
  const totalFuelGallonsUS = useMemo(() => totalFuelLiters * 0.264172, [totalFuelLiters])

  const totalTripCost = useMemo(() => totalFuelLiters * fuelPricePerLiter, [totalFuelLiters, fuelPricePerLiter])
  const costPerKm = useMemo(() => (distanceKm > 0 ? totalTripCost / distanceKm : 0), [totalTripCost, distanceKm])
  const costPerMile = useMemo(() => (distanceMiles > 0 ? totalTripCost / distanceMiles : 0), [totalTripCost, distanceMiles])

  // Approx 2.31 kg of CO2 per liter of gasoline
  const estCO2Kg = useMemo(() => totalFuelLiters * 2.31, [totalFuelLiters])

  return (
    <section aria-labelledby="fuel-calc-heading" className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)]/60 pb-3">
        <div>
          <h2 id="fuel-calc-heading" className="text-sm sm:text-base font-bold flex items-center gap-2 text-[var(--text)]">
            <span role="img" aria-hidden="true">⛽</span> Road Trip Fuel Cost & Efficiency Calculator
          </h2>
          <p className="text-xs text-[var(--text2)] opacity-85 mt-0.5">
            Estimate fuel needed, trip budget, and carbon footprint across Metric and Imperial ratings.
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {['$', '€', '£', '¥'].map(curr => (
            <button
              key={curr}
              onClick={() => setCurrencySymbol(curr)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                currencySymbol === curr
                  ? 'bg-[var(--primary)] text-white shadow-sm'
                  : 'bg-[var(--card2)] border border-[var(--border)] text-[var(--text2)] hover:text-[var(--text)]'
              }`}
              aria-label={`Select currency ${curr}`}
            >
              {curr}
            </button>
          ))}
        </div>
      </div>

      {/* Input controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Distance input */}
        <div className="space-y-1.5">
          <label htmlFor="trip-distance" className="text-xs font-medium text-[var(--text)] flex justify-between">
            <span>Trip Distance</span>
            <span className="text-xs text-[var(--text2)] opacity-80">{fmt(distanceMiles, 1)} mi</span>
          </label>
          <div className="relative">
            <input
              id="trip-distance"
              type="number"
              inputMode="decimal"
              min="1"
              value={distanceKm || ''}
              onChange={e => setDistanceKm(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 pr-12 rounded-xl border border-[var(--border)] bg-[var(--card2)] text-xs text-[var(--text)] outline-none focus:border-[var(--primary)] font-mono tabular-nums"
            />
            <span className="absolute right-3 top-2 text-xs text-[var(--text2)] opacity-70 font-medium">km</span>
          </div>
        </div>

        {/* Efficiency input */}
        <div className="space-y-1.5">
          <label htmlFor="fuel-efficiency" className="text-xs font-medium text-[var(--text)] flex justify-between">
            <span>Fuel Consumption</span>
            <span className="text-xs text-[var(--text2)] opacity-80">{fmt(mpgUS, 1)} MPG US</span>
          </label>
          <div className="relative">
            <input
              id="fuel-efficiency"
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0.1"
              value={efficiencyL100km || ''}
              onChange={e => setEfficiencyL100km(Math.max(0.1, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 pr-16 rounded-xl border border-[var(--border)] bg-[var(--card2)] text-xs text-[var(--text)] outline-none focus:border-[var(--primary)] font-mono tabular-nums"
            />
            <span className="absolute right-3 top-2 text-xs text-[var(--text2)] opacity-70 font-medium">L/100km</span>
          </div>
        </div>

        {/* Price input */}
        <div className="space-y-1.5">
          <label htmlFor="fuel-price" className="text-xs font-medium text-[var(--text)] flex justify-between">
            <span>Fuel Price</span>
            <span className="text-xs text-[var(--text2)] opacity-80">≈ {currencySymbol}{fmt(fuelPricePerLiter * 3.78541, 2)}/gal</span>
          </label>
          <div className="relative">
            <input
              id="fuel-price"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={fuelPricePerLiter || ''}
              onChange={e => setFuelPricePerLiter(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 pr-12 rounded-xl border border-[var(--border)] bg-[var(--card2)] text-xs text-[var(--text)] outline-none focus:border-[var(--primary)] font-mono tabular-nums"
            />
            <span className="absolute right-3 top-2 text-xs text-[var(--text2)] opacity-70 font-medium">{currencySymbol}/L</span>
          </div>
        </div>
      </div>

      {/* Output summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        <div className="glass rounded-xl p-3 border border-[var(--border)] text-center">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Estimated Trip Cost</div>
          <div className="text-lg font-bold text-[var(--primary)] mt-0.5 font-mono">
            {currencySymbol}{fmt(totalTripCost, 2)}
          </div>
          <div className="text-xs text-[var(--text2)] opacity-70 mt-0.5">
            {currencySymbol}{fmt(costPerKm, 2)}/km · {currencySymbol}{fmt(costPerMile, 2)}/mi
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)] text-center">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Fuel Required</div>
          <div className="text-lg font-bold text-[var(--text)] mt-0.5 font-mono">
            {fmt(totalFuelLiters, 1)} <span className="text-xs font-sans">Liters</span>
          </div>
          <div className="text-xs text-[var(--text2)] opacity-70 mt-0.5">
            {fmt(totalFuelGallonsUS, 1)} Gallons (US)
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)] text-center">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Imperial Economy</div>
          <div className="text-lg font-bold text-[var(--text)] mt-0.5 font-mono">
            {fmt(mpgUS, 1)} <span className="text-xs font-sans">MPG (US)</span>
          </div>
          <div className="text-xs text-[var(--text2)] opacity-70 mt-0.5">
            {fmt(mpgUK, 1)} MPG (UK / Imp)
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)] text-center">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">CO₂ Emissions</div>
          <div className="text-lg font-bold text-[var(--text)] mt-0.5 font-mono">
            {fmt(estCO2Kg, 1)} <span className="text-xs font-sans">kg</span>
          </div>
          <div className="text-xs text-[var(--text2)] opacity-70 mt-0.5">
            Gasoline combustion est.
          </div>
        </div>
      </div>

      {/* Quick vehicle presets */}
      <div className="space-y-2 pt-1">
        <div className="text-xs font-semibold text-[var(--text)]">Or pick a standard vehicle profile:</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {VEHICLE_PRESETS.map(v => (
            <button
              key={v.name}
              onClick={() => setEfficiencyL100km(v.l100km)}
              className={`p-2.5 rounded-xl border text-left transition-all interact-lift text-xs ${
                Math.abs(efficiencyL100km - v.l100km) < 0.2
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--text)] shadow-sm'
                  : 'border-[var(--border)] glass hover:bg-[var(--border)] text-[var(--text2)]'
              }`}
              aria-label={`Select vehicle ${v.name}: ${v.l100km} liters per 100 kilometers`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-[var(--text)]">
                <span role="img" aria-hidden="true">{v.icon}</span>
                <span>{v.name}</span>
              </div>
              <div className="text-xs opacity-75 font-mono mt-0.5">{v.l100km} L/100km · {v.mpgUS} MPG</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
