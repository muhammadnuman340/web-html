import { useState, useMemo } from 'react'

export default function LengthComparisonBar() {
  const [cm, setCm] = useState<number>(175)

  // Computed feet and inches
  const { feet, inches, totalInches } = useMemo(() => {
    const totalIn = cm / 2.54
    const ft = Math.floor(totalIn / 12)
    const inch = Math.round(totalIn % 12)
    return { feet: ft, inches: inch === 12 ? 0 : inch, totalInches: totalIn }
  }, [cm])

  const meters = useMemo(() => (cm / 100).toFixed(2), [cm])

  const benchmarks = [
    { label: 'Credit Card', sizeCm: 8.5, icon: '💳' },
    { label: 'Smartphone', sizeCm: 15, icon: '📱' },
    { label: '12" Ruler', sizeCm: 30.48, icon: '📏' },
    { label: 'Average Person', sizeCm: 175, icon: '🧍' },
    { label: 'Interior Door', sizeCm: 200, icon: '🚪' },
    { label: 'Room Ceiling', sizeCm: 270, icon: '🏠' },
    { label: 'Sedan Car', sizeCm: 450, icon: '🚗' },
  ]

  const handleFeetInchesChange = (newFt: number, newIn: number) => {
    const totalIn = Math.max(0, newFt) * 12 + Math.max(0, newIn)
    setCm(Math.round(totalIn * 2.54))
  }

  return (
    <div className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)]/60 pb-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold flex items-center gap-2 text-[var(--text)]">
            <span aria-hidden="true">📏</span> Visual Scale & Height Comparison
          </h2>
          <p className="text-xs text-[var(--text2)] mt-0.5">
            Switch between metric height and feet+inches, with real-world reference scale.
          </p>
        </div>

        <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-[var(--primary-muted)] text-[var(--primary)] self-start sm:self-auto">
          {cm} cm = {feet}′ {inches}″ ({meters} m)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dual Input Controls */}
        <div className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="length-cm-input" className="text-xs font-semibold text-[var(--text2)]">Metric (Centimeters / Meters):</label>
            <div className="flex items-center gap-2">
              <input
                id="length-cm-input"
                type="number"
                min={1}
                max={1000}
                value={cm}
                onChange={e => setCm(Math.max(1, parseInt(e.target.value) || 1))}
                aria-label="Height in centimeters"
                className="w-28 px-3 py-1.5 rounded-xl bg-[var(--card2)] border border-[var(--border)] text-sm font-bold font-mono outline-none focus:border-[var(--primary)] text-[var(--text)]"
              />
              <span className="text-xs text-[var(--text2)] font-semibold">cm</span>
              <span className="text-xs text-[var(--text2)] font-mono">({meters} m)</span>
            </div>
          </div>

          <div className="space-y-1">
            <span id="imperial-label" className="text-xs font-semibold text-[var(--text2)] block">Imperial (Feet & Inches):</span>
            <div className="flex items-center gap-2" role="group" aria-labelledby="imperial-label">
              <input
                id="length-feet-input"
                type="number"
                min={0}
                max={30}
                value={feet}
                onChange={e => handleFeetInchesChange(parseInt(e.target.value) || 0, inches)}
                aria-label="Height in feet"
                className="w-16 px-3 py-1.5 rounded-xl bg-[var(--card2)] border border-[var(--border)] text-sm font-bold font-mono outline-none focus:border-[var(--primary)] text-[var(--text)]"
              />
              <label htmlFor="length-feet-input" className="text-xs text-[var(--text2)] font-semibold">ft</label>

              <input
                id="length-inches-input"
                type="number"
                min={0}
                max={11}
                value={inches}
                onChange={e => handleFeetInchesChange(feet, parseInt(e.target.value) || 0)}
                aria-label="Height in inches"
                className="w-16 px-3 py-1.5 rounded-xl bg-[var(--card2)] border border-[var(--border)] text-sm font-bold font-mono outline-none focus:border-[var(--primary)] text-[var(--text)]"
              />
              <label htmlFor="length-inches-input" className="text-xs text-[var(--text2)] font-semibold">in</label>
            </div>
          </div>

          {/* Quick preset heights */}
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-semibold text-[var(--text2)]">Common Heights:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { l: "5'4\" (163 cm)", c: 163 },
                { l: "5'7\" (170 cm)", c: 170 },
                { l: "5'10\" (178 cm)", c: 178 },
                { l: "6'0\" (183 cm)", c: 183 },
                { l: "6'2\" (188 cm)", c: 188 },
              ].map(h => (
                <button
                  key={h.l}
                  onClick={() => setCm(h.c)}
                  className={`btn-chip text-xs ${cm === h.c ? 'active' : ''}`}
                >
                  {h.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Real-World Reference Scale */}
        <div className="space-y-2.5 bg-[var(--card2)]/40 p-3 rounded-xl border border-[var(--border)]">
          <div className="text-xs font-semibold text-[var(--text2)] flex justify-between">
            <span>Everyday Landmark Comparisons</span>
            <span className="font-mono text-xs text-[var(--primary)] font-semibold">Target: {cm} cm</span>
          </div>

          <div className="space-y-2 text-xs">
            {benchmarks.map(b => {
              const ratio = (cm / b.sizeCm)
              const pct = Math.min(100, Math.max(5, (cm / (b.sizeCm * 1.5)) * 100))
              return (
                <div key={b.label} className="space-y-0.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5">
                      <span aria-hidden="true">{b.icon}</span>
                      <span className="font-medium text-[var(--text)]">{b.label}</span>
                      <span className="text-[var(--text2)]">({b.sizeCm} cm)</span>
                    </span>
                    <span className="font-mono text-xs text-[var(--text2)]">
                      {ratio >= 1 ? `${ratio.toFixed(1)}× larger` : `${(1 / ratio).toFixed(1)}× smaller`}
                    </span>
                  </div>
                  <div className="w-full bg-[var(--border)]/50 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        background: ratio >= 1 ? 'var(--primary)' : '#10b981'
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
