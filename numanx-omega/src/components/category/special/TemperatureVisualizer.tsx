import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'

export default function TemperatureVisualizer() {
  const [celsius, setCelsius] = useState<number>(22)

  const fahrenheit = useMemo(() => (celsius * 9) / 5 + 32, [celsius])
  const kelvin = useMemo(() => celsius + 273.15, [celsius])

  // Color calculation based on Celsius
  const tempTheme = useMemo(() => {
    if (celsius <= 0) return { color: '#06b6d4', text: 'Freezing / Sub-Zero', bg: 'rgba(6, 182, 212, 0.15)' }
    if (celsius <= 18) return { color: '#38bdf8', text: 'Chilly / Cool', bg: 'rgba(56, 189, 248, 0.15)' }
    if (celsius <= 26) return { color: '#10b981', text: 'Comfortable Room Temp', bg: 'rgba(16, 185, 129, 0.15)' }
    if (celsius <= 38) return { color: '#f59e0b', text: 'Warm / Body Temp', bg: 'rgba(245, 158, 11, 0.15)' }
    return { color: '#ef4444', text: 'Hot / Boiling Zone', bg: 'rgba(239, 68, 68, 0.15)' }
  }, [celsius])

  // Height percentage for thermometer mercury (clamped -30°C to 110°C)
  const mercuryPct = useMemo(() => {
    const min = -30
    const max = 110
    const clamped = Math.max(min, Math.min(max, celsius))
    return ((clamped - min) / (max - min)) * 100
  }, [celsius])

  const presets = [
    { label: 'Freezing', c: 0, desc: 'Water freezes (0°C / 32°F)' },
    { label: 'Room Temp', c: 20, desc: 'Standard indoor ambient (20°C / 68°F)' },
    { label: 'Human Body', c: 37, desc: 'Core body temperature (37°C / 98.6°F)' },
    { label: 'Boiling', c: 100, desc: 'Water boils at 1 atm (100°C / 212°F)' },
    { label: 'Baking Oven', c: 180, desc: 'Standard cake/bread bake (180°C / 356°F)' },
  ]

  return (
    <section aria-labelledby="temp-tool-heading" className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)]/60 pb-3">
        <div>
          <h2 id="temp-tool-heading" className="text-sm sm:text-base font-bold flex items-center gap-2 text-[var(--text)]">
            <span aria-hidden="true">🌡️</span> Interactive Visual Thermometer
          </h2>
          <p className="text-xs opacity-60 mt-0.5">
            Slide or pick a benchmark to visualize how temperature scales relate.
          </p>
        </div>

        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full self-start sm:self-auto transition-colors"
          style={{ background: tempTheme.bg, color: tempTheme.color }}
        >
          {tempTheme.text}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Thermometer SVG Graphic */}
        <div className="md:col-span-4 flex items-center justify-center p-2">
          <div className="relative flex items-end justify-center w-20 h-56 bg-[var(--card2)] rounded-full border-2 border-[var(--border)] p-1 overflow-hidden shadow-inner">
            {/* Markers */}
            <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-between py-6 text-xs font-mono tabular-nums opacity-40 pointer-events-none">
              <span>100°C</span>
              <span>75°C</span>
              <span>50°C</span>
              <span>25°C</span>
              <span>0°C</span>
              <span>-25°C</span>
            </div>

            {/* Mercury Fluid Tube */}
            <div className="w-5 h-full rounded-full bg-[var(--border)]/40 relative overflow-hidden flex items-end justify-center">
              <motion.div
                className="w-full rounded-b-full transition-all duration-300"
                style={{
                  height: `${mercuryPct}%`,
                  background: tempTheme.color,
                  boxShadow: `0 0 12px ${tempTheme.color}`,
                }}
              />
            </div>

            {/* Bulb at bottom */}
            <div
              className="absolute bottom-1 w-10 h-10 rounded-full transition-colors duration-300 shadow-md"
              style={{ background: tempTheme.color }}
            />
          </div>
        </div>

        {/* Real-time Digital Readout & Controls */}
        <div className="md:col-span-8 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="glass p-3 rounded-xl border border-[var(--border)] text-center">
              <div className="text-xs font-semibold opacity-60">Celsius</div>
              <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-[var(--text)]">{celsius.toFixed(1)}°C</div>
            </div>
            <div className="glass p-3 rounded-xl border border-[var(--border)] text-center">
              <div className="text-xs font-semibold opacity-60">Fahrenheit</div>
              <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-[var(--primary)]">{fahrenheit.toFixed(1)}°F</div>
            </div>
            <div className="glass p-3 rounded-xl border border-[var(--border)] text-center">
              <div className="text-xs font-semibold opacity-60">Kelvin</div>
              <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-purple-400">{kelvin.toFixed(1)} K</div>
            </div>
          </div>

          {/* Slider input */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs opacity-60 font-medium">
              <span>-30°C</span>
              <span>Slide to adjust: {celsius}°C</span>
              <span>110°C</span>
            </div>
            <input
              type="range"
              min={-30}
              max={110}
              step={0.5}
              value={celsius}
              onChange={e => setCelsius(parseFloat(e.target.value))}
              className="w-full accent-[var(--primary)] cursor-pointer h-2 bg-[var(--border)] rounded-lg appearance-none"
              aria-label="Adjust temperature in Celsius"
            />
          </div>

          {/* Preset Buttons */}
          <div className="space-y-1.5">
            <div className="text-xs font-semibold opacity-60">Quick Environmental Presets:</div>
            <div className="flex flex-wrap gap-1.5">
              {presets.map(p => (
                <button
                  key={p.label}
                  onClick={() => setCelsius(p.c)}
                  className={`btn-chip text-xs ${celsius === p.c ? 'active' : ''}`}
                  title={p.desc}
                >
                  {p.label} ({p.c}°C)
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
