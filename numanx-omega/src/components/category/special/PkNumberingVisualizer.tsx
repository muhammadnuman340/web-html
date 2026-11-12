import { useState, useMemo } from 'react'

export default function PkNumberingVisualizer() {
  const [amount, setAmount] = useState<number>(10000000) // Default 1 Crore = 10 Million

  // Pakistani comma format: 1,00,00,000 (after first 3 digits, every 2 digits)
  const pkFormatted = useMemo(() => {
    const s = Math.floor(Math.abs(amount)).toString()
    if (s.length <= 3) return s
    const lastThree = s.slice(-3)
    const otherNumbers = s.slice(0, -3)
    const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',')
    return (amount < 0 ? '-' : '') + formattedOther + ',' + lastThree
  }, [amount])

  // International format: 10,000,000 (every 3 digits)
  const intlFormatted = useMemo(() => {
    return amount.toLocaleString('en-US')
  }, [amount])

  // Breakdown in South Asian terms
  const breakdown = useMemo(() => {
    const abs = Math.abs(amount)
    if (abs >= 1e11) return `${(amount / 1e11).toFixed(2)} Kharab`
    if (abs >= 1e9) return `${(amount / 1e9).toFixed(2)} Arab`
    if (abs >= 1e7) return `${(amount / 1e7).toFixed(2)} Crore`
    if (abs >= 1e5) return `${(amount / 1e5).toFixed(2)} Lakh`
    if (abs >= 1e3) return `${(amount / 1e3).toFixed(2)} Hazar`
    return `${amount} Units`
  }, [amount])

  // Breakdown in Western terms
  const westernBreakdown = useMemo(() => {
    const abs = Math.abs(amount)
    if (abs >= 1e12) return `${(amount / 1e12).toFixed(2)} Trillion`
    if (abs >= 1e9) return `${(amount / 1e9).toFixed(2)} Billion`
    if (abs >= 1e6) return `${(amount / 1e6).toFixed(2)} Million`
    if (abs >= 1e3) return `${(amount / 1e3).toFixed(2)} Thousand`
    return `${amount} Units`
  }, [amount])

  const PRESETS = [
    { label: '1 Lakh (100k)', val: 100000 },
    { label: '10 Lakh (1M)', val: 1000000 },
    { label: '1 Crore (10M)', val: 10000000 },
    { label: '10 Crore (100M)', val: 100000000 },
    { label: '1 Arab (1B)', val: 1000000000 },
    { label: '1 Kharab (100B)', val: 100000000000 },
  ]

  return (
    <section aria-labelledby="pk-numbering-heading" className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)]/60 pb-3">
        <div>
          <h2 id="pk-numbering-heading" className="text-sm sm:text-base font-bold flex items-center gap-2 text-[var(--text)]">
            <span role="img" aria-hidden="true">🏦</span> South Asian (Lakh / Crore) vs International Scale Visualizer
          </h2>
          <p className="text-xs text-[var(--text2)] opacity-85 mt-0.5">
            Compare 2,2,3 comma notation against international Western million/billion grouping standards.
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => setAmount(p.val)}
              className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[var(--card2)] hover:bg-[var(--primary)]/20 hover:text-[var(--primary)] border border-[var(--border)] transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Numeric Amount Input */}
      <div>
        <label className="text-xs text-[var(--text2)] font-medium mb-1 block">Input Numerical Amount</label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          className="w-full px-3 py-1.5 rounded-xl bg-[var(--card2)] border border-[var(--border)] text-sm sm:text-base font-bold font-mono outline-none focus:border-[var(--primary)] tabular-nums"
        />
      </div>

      {/* Side-by-Side Comparison Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="glass rounded-xl p-3.5 border border-emerald-500/30 bg-emerald-500/5 space-y-1">
          <div className="text-xs text-emerald-400 font-semibold flex items-center justify-between">
            <span>🇵🇰 South Asian Format (2,2,3)</span>
            <span className="font-mono text-[11px]">Lakh / Crore</span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-[var(--text)] tabular-nums break-all">
            {pkFormatted}
          </div>
          <div className="text-xs text-[var(--text2)] font-medium pt-1 border-t border-[var(--border)]/40">
            Spoken: <span className="text-[var(--text)] font-semibold">{breakdown}</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3.5 border border-blue-500/30 bg-blue-500/5 space-y-1">
          <div className="text-xs text-blue-400 font-semibold flex items-center justify-between">
            <span>🌐 International Standard (3,3,3)</span>
            <span className="font-mono text-[11px]">Million / Billion</span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-[var(--text)] tabular-nums break-all">
            {intlFormatted}
          </div>
          <div className="text-xs text-[var(--text2)] font-medium pt-1 border-t border-[var(--border)]/40">
            Spoken: <span className="text-[var(--text)] font-semibold">{westernBreakdown}</span>
          </div>
        </div>
      </div>

      {/* Conversion Key Table */}
      <div className="text-xs bg-[var(--card2)]/60 rounded-xl p-3 border border-[var(--border)] grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-center">
        <div>
          <div className="text-[var(--text2)]">1 Lakh</div>
          <div className="font-bold text-[var(--text)]">100,000 (0.1 M)</div>
        </div>
        <div>
          <div className="text-[var(--text2)]">10 Lakh</div>
          <div className="font-bold text-[var(--primary)]">1 Million (10⁶)</div>
        </div>
        <div>
          <div className="text-[var(--text2)]">1 Crore</div>
          <div className="font-bold text-[var(--primary)]">10 Million (10⁷)</div>
        </div>
        <div>
          <div className="text-[var(--text2)]">1 Arab</div>
          <div className="font-bold text-amber-400">1 Billion (10⁹)</div>
        </div>
      </div>
    </section>
  )
}
