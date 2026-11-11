import { useState, useMemo } from 'react'
import { fmt } from '../../../utils/numbers'

interface FreqBenchmark {
  name: string
  icon: string
  hz: number
  desc: string
  domain: 'Acoustic' | 'Mechanical' | 'RF / Wireless' | 'Computing'
}

const BENCHMARKS: FreqBenchmark[] = [
  { name: 'Human Hearing Floor', icon: '👂', hz: 20, desc: 'Deepest perceptible sub-bass rumble', domain: 'Acoustic' },
  { name: 'Concert Pitch A440', icon: '🎵', hz: 440, desc: 'Universal orchestral tuning reference', domain: 'Acoustic' },
  { name: 'Human Speech Range', icon: '🗣️', hz: 1000, desc: 'Core vocal intelligibility (1 kHz)', domain: 'Acoustic' },
  { name: 'V8 Engine at 6,000 RPM', icon: '🏎️', hz: 400, desc: '4 combustion pulses per revolution', domain: 'Mechanical' },
  { name: 'Human Hearing Ceiling', icon: '🎧', hz: 20000, desc: 'High-frequency limit for youth (20 kHz)', domain: 'Acoustic' },
  { name: 'FM Broadcast Radio', icon: '📻', hz: 100000000, desc: 'Standard VHF radio band (100 MHz)', domain: 'RF / Wireless' },
  { name: 'Wi-Fi & Microwave', icon: '📶', hz: 2400000000, desc: '2.4 GHz ISM wireless band', domain: 'RF / Wireless' },
  { name: 'Modern CPU Turbo Clock', icon: '⚡', hz: 4500000000, desc: 'Silicon processor clock cycle (4.5 GHz)', domain: 'Computing' },
]

export default function FrequencyVisualizer() {
  const [hz, setHz] = useState<number>(440)

  const khz = useMemo(() => hz / 1e3, [hz])
  const mhz = useMemo(() => hz / 1e6, [hz])
  const ghz = useMemo(() => hz / 1e9, [hz])
  const rpm = useMemo(() => hz * 60, [hz])

  // Wavelength calculations
  // Sound in air at 20°C: v = 343 m/s
  const soundWavelengthM = useMemo(() => (hz > 0 ? 343 / hz : 0), [hz])
  // Radio speed of light: c = 299,792,458 m/s
  const emWavelengthM = useMemo(() => (hz > 0 ? 299792458 / hz : 0), [hz])

  return (
    <section aria-labelledby="freq-tool-heading" className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)]/60 pb-3">
        <div>
          <h2 id="freq-tool-heading" className="text-sm sm:text-base font-bold flex items-center gap-2 text-[var(--text)]">
            <span role="img" aria-hidden="true">📡</span> Frequency Spectrum & Wavelength Analyzer
          </h2>
          <p className="text-xs text-[var(--text2)] opacity-85 mt-0.5">
            Convert oscillation rates across Hertz, rotational RPM, and acoustic vs electromagnetic wavelengths.
          </p>
        </div>

        <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 self-start sm:self-auto font-mono">
          {hz >= 1e9 ? `${fmt(ghz, 2)} GHz` : hz >= 1e6 ? `${fmt(mhz, 2)} MHz` : hz >= 1e3 ? `${fmt(khz, 2)} kHz` : `${fmt(hz, 1)} Hz`}
        </div>
      </div>

      {/* Main Multi-Unit Display Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Hertz</div>
          <div className="text-base sm:text-lg font-bold text-[var(--primary)] mt-0.5 font-mono tabular-nums">
            {fmt(hz, 2)} <span className="text-xs font-sans">Hz</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Kilohertz</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono tabular-nums">
            {fmt(khz, 4)} <span className="text-xs font-sans">kHz</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Megahertz</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono tabular-nums">
            {fmt(mhz, 6)} <span className="text-xs font-sans">MHz</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Rotational RPM</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono tabular-nums">
            {fmt(rpm, 1)} <span className="text-xs font-sans">RPM</span>
          </div>
        </div>
      </div>

      {/* Physical Wavelength Analysis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-[var(--card2)] border border-[var(--border)] space-y-1">
          <div className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
            <span>🔊</span> Acoustic Sound Wavelength (in air @ 20°C)
          </div>
          <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {soundWavelengthM >= 1
              ? `${fmt(soundWavelengthM, 2)} m`
              : soundWavelengthM >= 0.01
              ? `${fmt(soundWavelengthM * 100, 2)} cm`
              : `${fmt(soundWavelengthM * 1000, 2)} mm`}
          </div>
          <p className="text-[11px] text-[var(--text2)] opacity-75">
            Calculated at speed of sound (343 m/s). Physical crest-to-crest air pressure wave.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--card2)] border border-[var(--border)] space-y-1">
          <div className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
            <span>📡</span> Radio / EM Wavelength (Speed of Light)
          </div>
          <div className="text-base font-bold font-mono text-sky-600 dark:text-sky-400">
            {emWavelengthM >= 1000
              ? `${fmt(emWavelengthM / 1000, 2)} km`
              : emWavelengthM >= 1
              ? `${fmt(emWavelengthM, 2)} m`
              : `${fmt(emWavelengthM * 100, 2)} cm`}
          </div>
          <p className="text-[11px] text-[var(--text2)] opacity-75">
            Calculated at speed of light (299,792 km/s). Antenna resonance length ≈ λ/2 or λ/4.
          </p>
        </div>
      </div>

      {/* Presets */}
      <div className="space-y-1.5">
        <div className="text-xs font-semibold text-[var(--text)]">Standard Acoustic, RF & Computing Milestones:</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {BENCHMARKS.map((b, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setHz(b.hz)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                Math.abs(hz - b.hz) < 0.01
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)] font-semibold'
                  : 'border-[var(--border)] bg-[var(--card2)] text-[var(--text)] hover:border-[var(--border-hover)]'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs">
                <span>{b.icon}</span>
                <span className="truncate">{b.name}</span>
              </div>
              <div className="text-xs font-mono font-bold mt-1 text-[var(--primary)]">
                {b.hz >= 1e9 ? `${b.hz / 1e9} GHz` : b.hz >= 1e6 ? `${b.hz / 1e6} MHz` : b.hz >= 1e3 ? `${b.hz / 1e3} kHz` : `${b.hz} Hz`}
              </div>
              <div className="text-[10px] text-[var(--text2)] opacity-75 truncate">{b.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
