import { useState, useMemo } from 'react'

export default function MassWeightReference() {
  const [kg, setKg] = useState<number>(18)

  const lb = useMemo(() => kg * 2.20462, [kg])
  const oz = useMemo(() => kg * 35.274, [kg])
  const stone = useMemo(() => {
    const totalRoundedLb = Math.round(lb)
    const st = Math.floor(totalRoundedLb / 14)
    const remLb = totalRoundedLb % 14
    return `${st} st ${remLb} lb`
  }, [lb])

  // Airline luggage status
  const baggageStatus = useMemo(() => {
    if (kg <= 7) return { label: 'Carry-on Approved', desc: 'Under international 7 kg cabin limit', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' }
    if (kg <= 10) return { label: 'Domestic Carry-on', desc: 'Acceptable on most generous domestic airlines (10 kg)', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' }
    if (kg <= 23) return { label: 'Standard Checked Bag', desc: 'Within standard 23 kg (50 lb) airline checked allowance', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)' }
    if (kg <= 32) return { label: 'Heavy Baggage (Fee May Apply)', desc: 'Above 23 kg but under 32 kg (70 lb) absolute airline max', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' }
    return { label: 'Excess / Freight Cargo', desc: 'Exceeds standard 32 kg passenger limits', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' }
  }, [kg])

  const luggagePercent = Math.min(100, (kg / 32) * 100)

  return (
    <div className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)]/60 pb-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold flex items-center gap-2 text-[var(--text)]">
            <span aria-hidden="true">⚖️</span> Weight Benchmark & Luggage Allowance Tool
          </h2>
          <p className="text-xs opacity-60 mt-0.5">
            Check real-world weight equivalents across kg, lb, oz, and airline limits.
          </p>
        </div>

        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full self-start sm:self-auto"
          style={{ background: baggageStatus.bg, color: baggageStatus.color }}
        >
          {baggageStatus.label}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Controls and readouts */}
        <div className="md:col-span-6 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="glass p-3 rounded-xl border border-[var(--border)]">
              <label htmlFor="mass-kg-input" className="text-xs font-semibold opacity-60 block mb-1">Kilograms (kg)</label>
              <input
                id="mass-kg-input"
                aria-label="Weight in Kilograms"
                type="number"
                inputMode="decimal"
                min={0.1}
                step={0.5}
                value={kg}
                onChange={e => setKg(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                className="w-full bg-transparent font-bold font-mono text-lg outline-none text-[var(--text)] tabular-nums"
              />
            </div>
            <div className="glass p-3 rounded-xl border border-[var(--border)]">
              <label htmlFor="mass-lb-input" className="text-xs font-semibold opacity-60 block mb-1">Pounds (lb)</label>
              <input
                id="mass-lb-input"
                aria-label="Weight in Pounds"
                type="number"
                inputMode="decimal"
                min={0.2}
                step={1}
                value={parseFloat(lb.toFixed(1))}
                onChange={e => {
                  const val = parseFloat(e.target.value)
                  if (!isNaN(val) && val > 0) setKg(val / 2.20462)
                }}
                className="w-full bg-transparent font-bold font-mono text-lg outline-none text-[var(--primary)] tabular-nums"
              />
            </div>
          </div>

          <div className="flex gap-2 text-xs">
            <div className="flex-1 bg-[var(--card2)] p-2 rounded-lg border border-[var(--border)]">
              <span className="opacity-60 text-xs block">Ounces (oz):</span>
              <span className="font-mono font-semibold">{oz.toFixed(1)} oz</span>
            </div>
            <div className="flex-1 bg-[var(--card2)] p-2 rounded-lg border border-[var(--border)]">
              <span className="opacity-60 text-xs block">UK Stone:</span>
              <span className="font-mono font-semibold">{stone}</span>
            </div>
          </div>

          {/* Quick presets */}
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-semibold opacity-60">Luggage & Fitness Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { l: 'Cabin Bag (7 kg)', k: 7 },
                { l: 'Max Carry-on (10 kg)', k: 10 },
                { l: 'Checked Bag (23 kg / 50 lb)', k: 23 },
                { l: 'Heavy Limit (32 kg)', k: 32 },
                { l: 'Adult (70 kg)', k: 70 },
              ].map(p => (
                <button
                  key={p.l}
                  onClick={() => setKg(p.k)}
                  className={`btn-chip text-xs ${kg === p.k ? 'active' : ''}`}
                >
                  {p.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Airport Baggage Gauge Visualizer */}
        <div className="md:col-span-6 bg-[var(--card2)]/50 p-4 rounded-xl border border-[var(--border)] space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold">Airline Baggage Meter</span>
            <span className="font-mono text-xs" style={{ color: baggageStatus.color }}>
              {kg.toFixed(1)} kg / {lb.toFixed(1)} lb
            </span>
          </div>

          {/* Meter bar */}
          <div className="space-y-1">
            <div className="w-full bg-[var(--border)] h-3 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${luggagePercent}%`,
                  background: baggageStatus.color
                }}
              />
            </div>
            <div className="flex justify-between text-xs font-mono opacity-40 px-0.5">
              <span>0 kg</span>
              <span>7 kg (Cabin)</span>
              <span>23 kg (Checked)</span>
              <span>32 kg (Max)</span>
            </div>
          </div>

          <p className="text-xs opacity-75 leading-relaxed bg-[var(--border)]/20 p-2.5 rounded-lg border border-[var(--border)]/50">
            {baggageStatus.desc}
          </p>
        </div>
      </div>
    </div>
  )
}
