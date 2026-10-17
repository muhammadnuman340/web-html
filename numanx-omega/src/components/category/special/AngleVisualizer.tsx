import { useState, useMemo } from 'react'
import { fmt } from '../../../utils/numbers'

interface AnglePreset {
  name: string
  deg: number
  desc: string
}

const PRESETS: AnglePreset[] = [
  { name: 'Acute 30°', deg: 30, desc: 'π/6 radians' },
  { name: 'Diagonal 45°', deg: 45, desc: 'π/4 radians (Iso triangle)' },
  { name: 'Right Angle 90°', deg: 90, desc: 'π/2 radians (Perpendicular)' },
  { name: 'Tri-Split 120°', deg: 120, desc: '2π/3 radians (Hexagon internal)' },
  { name: 'Straight 180°', deg: 180, desc: 'π radians (Linear opposition)' },
  { name: 'Reflex 270°', deg: 270, desc: '3π/2 radians (Three quarters)' },
  { name: 'Full Revolution 360°', deg: 360, desc: '2π radians (Complete circle)' },
]

export default function AngleVisualizer() {
  const [deg, setDeg] = useState<number>(45)

  const rad = useMemo(() => (deg * Math.PI) / 180, [deg])
  const grad = useMemo(() => deg * (10 / 9), [deg])
  const arcmin = useMemo(() => deg * 60, [deg])
  const arcsec = useMemo(() => deg * 3600, [deg])

  // Trig values
  const sin = useMemo(() => Math.sin(rad), [rad])
  const cos = useMemo(() => Math.cos(rad), [rad])
  const tan = useMemo(() => (Math.abs(cos) < 1e-10 ? 'Undefined' : fmt(Math.tan(rad), 4)), [rad, cos])

  // SVG arc path
  const svgPath = useMemo(() => {
    const r = 50
    const cx = 60
    const cy = 60
    const clampedDeg = ((deg % 360) + 360) % 360
    const radClamped = (clampedDeg * Math.PI) / 180
    const x = cx + r * Math.cos(radClamped)
    const y = cy - r * Math.sin(radClamped)
    const largeArc = clampedDeg > 180 ? 1 : 0

    if (clampedDeg === 0) return `M ${cx} ${cy} L ${cx + r} ${cy}`
    if (clampedDeg === 360) {
      return `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy}`
    }
    return `M ${cx} ${cy} L ${cx + r} ${cy} A ${r} ${r} 0 ${largeArc} 0 ${x} ${y} Z`
  }, [deg])

  return (
    <section aria-labelledby="angle-tool-heading" className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)]/60 pb-3">
        <div>
          <h2 id="angle-tool-heading" className="text-sm sm:text-base font-bold flex items-center gap-2 text-[var(--text)]">
            <span role="img" aria-hidden="true">∡</span> Circular Protractor & Trigonometric Visualizer
          </h2>
          <p className="text-xs text-[var(--text2)] opacity-85 mt-0.5">
            Visualize geometric angles, radian arcs, and real-time trigonometric functions.
          </p>
        </div>

        <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 self-start sm:self-auto font-mono">
          {fmt(deg, 1)}° = {fmt(rad, 4)} rad
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* SVG Circular Protractor */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-2">
          <div className="w-36 h-36 relative flex items-center justify-center">
            <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
              {/* Outer boundary */}
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="2" />
              {/* Axis crosshairs */}
              <line x1="10" y1="60" x2="110" y2="60" stroke="var(--border)" strokeDasharray="2 2" />
              <line x1="60" y1="10" x2="60" y2="110" stroke="var(--border)" strokeDasharray="2 2" />
              {/* Pie arc slice */}
              <path d={svgPath} fill="var(--primary)" opacity="0.35" stroke="var(--primary)" strokeWidth="2" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-sm font-bold font-mono text-[var(--text)]">{Math.round(deg)}°</span>
              <span className="text-xs text-[var(--text2)] font-mono">{fmt(rad, 2)} rad</span>
            </div>
          </div>
        </div>

        {/* Readouts & Trig Values */}
        <div className="md:col-span-8 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="glass rounded-xl p-2.5 border border-[var(--border)]">
              <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Degrees</div>
              <div className="text-base font-bold text-[var(--primary)] font-mono mt-0.5">{fmt(deg, 1)}°</div>
            </div>
            <div className="glass rounded-xl p-2.5 border border-[var(--border)]">
              <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Radians</div>
              <div className="text-base font-bold text-[var(--text)] font-mono mt-0.5">{fmt(rad, 4)}</div>
            </div>
            <div className="glass rounded-xl p-2.5 border border-[var(--border)]">
              <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Gradians</div>
              <div className="text-base font-bold text-[var(--text)] font-mono mt-0.5">{fmt(grad, 1)} gon</div>
            </div>
            <div className="glass rounded-xl p-2.5 border border-[var(--border)]">
              <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Arcminutes</div>
              <div className="text-base font-bold text-[var(--text)] font-mono mt-0.5">{fmt(arcmin, 0)}'</div>
            </div>
          </div>

          {/* Real-time Trigonometry Strip */}
          <div className="p-2.5 rounded-xl bg-[var(--card2)] border border-[var(--border)] grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div>
              <span className="text-[var(--text2)] opacity-70">sin(θ): </span>
              <strong className="text-[var(--text)]">{fmt(sin, 4)}</strong>
            </div>
            <div>
              <span className="text-[var(--text2)] opacity-70">cos(θ): </span>
              <strong className="text-[var(--text)]">{fmt(cos, 4)}</strong>
            </div>
            <div>
              <span className="text-[var(--text2)] opacity-70">tan(θ): </span>
              <strong className="text-[var(--text)]">{tan}</strong>
            </div>
          </div>

          {/* Slider */}
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={deg}
              onChange={e => setDeg(parseFloat(e.target.value))}
              className="w-full accent-[var(--primary)] cursor-pointer h-2 bg-[var(--border)] rounded-lg outline-none"
              aria-label="Angle in degrees"
            />
            <div className="flex justify-between text-xs text-[var(--text2)] opacity-70 font-mono">
              <span>0°</span>
              <span>90°</span>
              <span>180°</span>
              <span>270°</span>
              <span>360°</span>
            </div>
          </div>
        </div>
      </div>

      {/* Geometric Angle Presets */}
      <div className="space-y-1.5 pt-1">
        <div className="text-xs font-semibold text-[var(--text)]">Standard Geometric Presets:</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESETS.map(p => (
            <button
              key={p.name}
              onClick={() => setDeg(p.deg)}
              className={`p-2 rounded-xl border text-left transition-all interact-lift text-xs ${
                Math.abs(deg - p.deg) < 0.5
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--text)] shadow-sm'
                  : 'border-[var(--border)] glass hover:bg-[var(--border)] text-[var(--text2)]'
              }`}
              aria-label={`Set angle to ${p.name}`}
            >
              <div className="font-semibold text-[var(--text)]">{p.name}</div>
              <div className="text-xs opacity-70 truncate mt-0.5">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
