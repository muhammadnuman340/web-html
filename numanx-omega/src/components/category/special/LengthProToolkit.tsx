import React, { useState } from 'react'
import { toShopFraction } from '../../../utils/numbers'

interface LengthProToolkitProps {
  baseMeters: number // Pass the current converted value in meters
}

const ARCH_SCALES = [
  { label: '1:1 (Actual)', ratio: 1 },
  { label: '1:10 (Detail)', ratio: 10 },
  { label: '1:20 (Interior)', ratio: 20 },
  { label: '1:50 (Floor Plan)', ratio: 50 },
  { label: '1:100 (Site Plan)', ratio: 100 },
  { label: '1:87 (HO Model)', ratio: 87 }
]

const LUMBER_SIZES = [
  { nominal: '1 × 4', actualIn: '3/4″ × 3-1/2″', actualMm: '19 mm × 89 mm', use: 'Trim, fascia, shelving' },
  { nominal: '2 × 4', actualIn: '1-1/2″ × 3-1/2″', actualMm: '38 mm × 89 mm', use: 'Interior/exterior wall studs' },
  { nominal: '2 × 6', actualIn: '1-1/2″ × 5-1/2″', actualMm: '38 mm × 140 mm', use: '2x6 framing, floor joists' },
  { nominal: '2 × 8', actualIn: '1-1/2″ × 7-1/4″', actualMm: '38 mm × 184 mm', use: 'Headers, long-span joists' },
  { nominal: '2 × 10', actualIn: '1-1/2″ × 9-1/4″', actualMm: '38 mm × 235 mm', use: 'Heavy structural beams' },
  { nominal: '4 × 4', actualIn: '3-1/2″ × 3-1/2″', actualMm: '89 mm × 89 mm', use: 'Deck posts, fence columns' }
]

const SOCKET_SIZES = [
  { fraction: '1/4″', decIn: '0.2500″', mm: '6.35 mm', socket: '6.5 mm (or 7 mm loose)', tol: '+0.15 mm (Snug)', color: 'text-amber-500' },
  { fraction: '5/16″', decIn: '0.3125″', mm: '7.94 mm', socket: '8 mm', tol: '+0.06 mm (Direct Swap)', color: 'text-green-500' },
  { fraction: '3/8″', decIn: '0.3750″', mm: '9.53 mm', socket: '10 mm', tol: '+0.47 mm (Slight Play)', color: 'text-amber-500' },
  { fraction: '7/16″', decIn: '0.4375″', mm: '11.11 mm', socket: '11 mm', tol: '-0.11 mm (Tight / Tap-on)', color: 'text-red-500' },
  { fraction: '1/2″', decIn: '0.5000″', mm: '12.70 mm', socket: '13 mm', tol: '+0.30 mm (Safe Swap)', color: 'text-green-500' },
  { fraction: '9/16″', decIn: '0.5625″', mm: '14.29 mm', socket: '14 mm', tol: '-0.29 mm (Tight)', color: 'text-amber-500' },
  { fraction: '5/8″', decIn: '0.6250″', mm: '15.88 mm', socket: '16 mm', tol: '+0.12 mm (Direct Swap)', color: 'text-green-500' },
  { fraction: '3/4″', decIn: '0.7500″', mm: '19.05 mm', socket: '19 mm', tol: '-0.05 mm (Exact Fit)', color: 'text-green-500' },
]

export const LengthProToolkit: React.FC<LengthProToolkitProps> = ({ baseMeters }) => {
  const [scaleRatio, setScaleRatio] = useState<number>(50)
  const [fractionDenom, setFractionDenom] = useState<8 | 16 | 32 | 64>(64)
  const [copiedEmbed, setCopiedEmbed] = useState(false)

  const totalInches = baseMeters / 0.0254
  const fracData = toShopFraction(totalInches, fractionDenom)
  const scaledMm = ((baseMeters * 1000) / scaleRatio).toFixed(2)
  const scaledIn = (totalInches / scaleRatio).toFixed(3)

  const embedCode = `<iframe src="https://numanx-omega.netlify.app/convert/length?embed=1" width="100%" height="420" style="border:0;border-radius:12px;" loading="lazy" title="Omega Length Converter"></iframe><p style="font-size:12px;">Powered by <a href="https://numanx-omega.netlify.app/convert/length">Omega Length Converter</a></p>`

  const copyEmbed = () => {
    navigator.clipboard.writeText(embedCode)
    setCopiedEmbed(true)
    setTimeout(() => setCopiedEmbed(false), 2000)
  }

  return (
    <section aria-labelledby="toolkit-heading" className="space-y-6 my-6">
      <div className="flex items-center gap-2">
        <h2 id="toolkit-heading" className="text-sm sm:text-base font-bold text-[var(--text)] flex items-center gap-2">
          <span className="p-1 rounded-md bg-[var(--primary)]/10 text-[var(--primary)]" aria-hidden="true">🛠️</span>
          <span>Professional Length & Fabrication Toolkit</span>
        </h2>
      </div>

      {/* 1. Shop-Floor Fractional Readout + Blueprint Scale Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text2)] flex items-center gap-1.5">
              <span aria-hidden="true">📐</span>
              <span>Tape Measure Fractional Snap</span>
            </h3>
            <div className="flex gap-1" role="group" aria-label="Fractional denominator precision">
              {([8, 16, 32, 64] as const).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFractionDenom(d)}
                  className={`px-2 py-0.5 text-xs rounded-md font-mono transition ${
                    fractionDenom === d
                      ? 'bg-[var(--primary)] text-white font-bold'
                      : 'bg-[var(--card2)] text-[var(--text2)] hover:text-[var(--text)]'
                  }`}
                >
                  1/{d}″
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <div>
              <div className="text-2xl font-bold font-mono text-[var(--text)] tabular-nums">
                {fracData.nearestFractionInch}
              </div>
              <div className="text-xs text-[var(--text2)] font-mono">
                Compound: <strong>{fracData.feetAndInches}</strong>
              </div>
            </div>
            <div className="text-right font-mono text-xs">
              <span className={fracData.isExact ? 'text-green-500 font-bold' : 'text-amber-500'}>
                {fracData.isExact
                  ? 'Exact Match (0.00 mm error)'
                  : `Tolerance: ${fracData.errorMillimeters > 0 ? '+' : ''}${fracData.errorMillimeters} mm`}
              </span>
            </div>
          </div>
        </div>

        {/* Architectural Scale Multiplier */}
        <div className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text2)] flex items-center gap-1.5">
              <span aria-hidden="true">🏗️</span>
              <span>Blueprint & Model Scale ({`1:${scaleRatio}`})</span>
            </h3>
            <select
              aria-label="Select blueprint scale ratio"
              value={scaleRatio}
              onChange={e => setScaleRatio(Number(e.target.value))}
              className="text-xs bg-[var(--card2)] border border-[var(--border)] rounded-lg px-2 py-1 font-mono text-[var(--text)]"
            >
              {ARCH_SCALES.map(s => (
                <option key={s.ratio} value={s.ratio}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-baseline justify-between pt-1 font-mono">
            <div>
              <span className="text-xs text-[var(--text2)] block">On Drawing (Metric):</span>
              <span className="text-xl font-bold text-[var(--text)] tabular-nums">{scaledMm} mm</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-[var(--text2)] block">On Drawing (Imperial):</span>
              <span className="text-xl font-bold text-[var(--primary)] tabular-nums">{scaledIn} in</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. GEO Table: Nominal vs. Actual Dimensional Lumber Sizing */}
      <div aria-labelledby="lumber-heading" className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 id="lumber-heading" className="text-sm sm:text-base font-bold text-[var(--text)] flex items-center gap-2">
              <span aria-hidden="true">🪵</span>
              <span>Carpentry Reference: Nominal vs. Actual Lumber Dimensions (Softwood S4S)</span>
            </h3>
            <p className="text-xs text-[var(--text2)] mt-0.5">
              Why a &ldquo;2×4&rdquo; doesn&apos;t measure 2 inches by 4 inches: planed & kiln-dried North American lumber equivalents in inches and millimeters.
            </p>
          </div>
          <button
            type="button"
            onClick={copyEmbed}
            className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card2)] hover:border-[var(--primary)] font-semibold transition"
          >
            {copiedEmbed ? '✅ Embed Code Copied!' : '🔗 Embed This Converter'}
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card2)]/50">
          <table className="w-full text-xs text-left">
            <caption className="sr-only">Nominal vs Actual Dimensional Lumber Chart in Inches and Millimeters</caption>
            <thead className="bg-[var(--border)]/40 font-semibold text-[var(--text)]">
              <tr>
                <th scope="col" className="p-2.5 px-4">Nominal Name</th>
                <th scope="col" className="p-2.5 px-4">Actual Imperial (Dry S4S)</th>
                <th scope="col" className="p-2.5 px-4 text-[var(--primary)]">Actual Metric (mm)</th>
                <th scope="col" className="p-2.5 px-4">Primary Structural Application</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/30 font-mono">
              {LUMBER_SIZES.map(row => (
                <tr key={row.nominal} className="hover:bg-[var(--border)]/20 transition-colors">
                  <th scope="row" className="p-2.5 px-4 font-bold text-[var(--text)]">{row.nominal}</th>
                  <td className="p-2.5 px-4">{row.actualIn}</td>
                  <td className="p-2.5 px-4 font-bold text-[var(--primary)]">{row.actualMm}</td>
                  <td className="p-2.5 px-4 font-sans text-[var(--text2)]">{row.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. GEO Table: Fractional Bolt to Metric Socket Interchangeability */}
      <div aria-labelledby="machinist-heading" className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-3">
        <h3 id="machinist-heading" className="text-sm sm:text-base font-bold text-[var(--text)] flex items-center gap-2">
          <span aria-hidden="true">🔧</span>
          <span>Machinist & DIY Reference: Fractional Inch to Metric Socket Interchangeability</span>
        </h3>
        <p className="text-xs text-[var(--text2)]">
          Exact decimal conversion vs. nearest practical metric wrench/socket size with clearance tolerance fit.
        </p>
        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card2)]/50">
          <table className="w-full text-xs text-left">
            <caption className="sr-only">Fractional Inch Bolt to Metric Socket Conversion Table</caption>
            <thead className="bg-[var(--border)]/40 font-semibold text-[var(--text)]">
              <tr>
                <th scope="col" className="p-2.5 px-4">Fractional Bolt Size</th>
                <th scope="col" className="p-2.5 px-4">Decimal Equivalent</th>
                <th scope="col" className="p-2.5 px-4">Exact Metric (mm)</th>
                <th scope="col" className="p-2.5 px-4 text-[var(--primary)]">Nearest Metric Socket</th>
                <th scope="col" className="p-2.5 px-4 text-right">Fit Tolerance / Play</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/30 font-mono">
              {SOCKET_SIZES.map(row => (
                <tr key={row.fraction} className="hover:bg-[var(--border)]/20 transition-colors">
                  <th scope="row" className="p-2.5 px-4 font-bold text-[var(--text)]">{row.fraction}</th>
                  <td className="p-2.5 px-4">{row.decIn}</td>
                  <td className="p-2.5 px-4">{row.mm}</td>
                  <td className="p-2.5 px-4 font-bold text-[var(--primary)]">{row.socket}</td>
                  <td className={`p-2.5 px-4 text-right font-semibold ${row.color}`}>{row.tol}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
export default LengthProToolkit
