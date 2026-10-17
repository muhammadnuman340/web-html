import { useState, useMemo } from 'react'
import { fmt } from '../../../utils/numbers'

interface TimeBenchmark {
  name: string
  icon: string
  seconds: number
  desc: string
}

const BENCHMARKS: TimeBenchmark[] = [
  { name: 'Eye Blink', icon: '👁️', seconds: 0.35, desc: 'Average human blink (350 ms)' },
  { name: 'Lightning Bolt', icon: '⚡', seconds: 0.0002, desc: 'Return stroke of lightning' },
  { name: 'Pop Song', icon: '🎵', seconds: 210, desc: 'Average radio track (3.5 min)' },
  { name: 'Soccer Match', icon: '⚽', seconds: 5400, desc: 'Full regulation 90 minutes' },
  { name: 'Full Day', icon: '☀️', seconds: 86400, desc: '24 hours / 1,440 minutes' },
  { name: 'Lunar Cycle', icon: '🌕', seconds: 2551443, desc: 'Synodic month (~29.53 days)' },
  { name: 'Earth Year', icon: '🌍', seconds: 31557600, desc: '365.25 days around the Sun' },
  { name: 'Average Lifespan', icon: '🧬', seconds: 2522880000, desc: '~80 years of human life' },
]

export default function TimeVisualizer() {
  const [seconds, setSeconds] = useState<number>(86400)

  const minutes = useMemo(() => seconds / 60, [seconds])
  const hours = useMemo(() => seconds / 3600, [seconds])
  const days = useMemo(() => seconds / 86400, [seconds])
  const weeks = useMemo(() => seconds / 604800, [seconds])
  const years = useMemo(() => seconds / 31557600, [seconds])

  // Duration decomposition
  const breakdown = useMemo(() => {
    let rem = Math.floor(seconds)
    const y = Math.floor(rem / 31557600)
    rem %= 31557600
    const d = Math.floor(rem / 86400)
    rem %= 86400
    const h = Math.floor(rem / 3600)
    rem %= 3600
    const m = Math.floor(rem / 60)
    const s = rem % 60

    const parts: string[] = []
    if (y > 0) parts.push(`${y}y`)
    if (d > 0) parts.push(`${d}d`)
    if (h > 0) parts.push(`${h}h`)
    if (m > 0) parts.push(`${m}m`)
    if (s > 0 || parts.length === 0) parts.push(`${s}s`)
    return parts.join(' ')
  }, [seconds])

  return (
    <section aria-labelledby="time-tool-heading" className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)]/60 pb-3">
        <div>
          <h2 id="time-tool-heading" className="text-sm sm:text-base font-bold flex items-center gap-2 text-[var(--text)]">
            <span role="img" aria-hidden="true">⏱️</span> Temporal Duration & Scale Visualizer
          </h2>
          <p className="text-xs text-[var(--text2)] opacity-85 mt-0.5">
            Deconstruct time from fractions of a second into human and planetary life scales.
          </p>
        </div>

        <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 self-start sm:self-auto font-mono">
          {breakdown}
        </div>
      </div>

      {/* Main Multi-Unit Display Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-[11px] text-[var(--text2)] opacity-80 font-medium">Seconds</div>
          <div className="text-base sm:text-lg font-bold text-[var(--primary)] mt-0.5 font-mono">
            {fmt(seconds, 0)} <span className="text-xs font-sans">sec</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-[11px] text-[var(--text2)] opacity-80 font-medium">Minutes</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono">
            {fmt(minutes, 2)} <span className="text-xs font-sans">min</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-[11px] text-[var(--text2)] opacity-80 font-medium">Hours</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono">
            {fmt(hours, 2)} <span className="text-xs font-sans">hrs</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-[11px] text-[var(--text2)] opacity-80 font-medium">Days</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono">
            {fmt(days, 2)} <span className="text-xs font-sans">days</span>
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)] col-span-2 sm:col-span-1">
          <div className="text-[11px] text-[var(--text2)] opacity-80 font-medium">Years</div>
          <div className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5 font-mono">
            {fmt(years, 3)} <span className="text-xs font-sans">yrs</span>
          </div>
        </div>
      </div>

      {/* Interactive Input */}
      <div className="space-y-2 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-medium text-[var(--text)] gap-2">
          <label htmlFor="time-input" className="cursor-pointer">
            Duration in Seconds:
          </label>
          <div className="flex items-center gap-2">
            <input
              id="time-input"
              type="number"
              min="1"
              value={seconds || ''}
              onChange={e => setSeconds(Math.max(0.1, parseFloat(e.target.value) || 0))}
              className="w-40 px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card2)] text-xs text-[var(--text)] font-mono outline-none focus:border-[var(--primary)]"
              aria-label="Time in seconds"
            />
            <span className="text-xs text-[var(--text2)]">seconds</span>
          </div>
        </div>

        <div className="flex justify-between text-[10px] text-[var(--text2)] opacity-70 font-mono">
          <span>60s (1 min)</span>
          <span>3,600s (1 hour)</span>
          <span>86,400s (1 day)</span>
          <span>604,800s (1 week)</span>
          <span>31,557,600s (1 year)</span>
        </div>
      </div>

      {/* Benchmarks Grid */}
      <div className="space-y-2 pt-1">
        <div className="text-xs font-semibold text-[var(--text)]">Iconic Time Benchmarks:</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {BENCHMARKS.map(b => (
            <button
              key={b.name}
              onClick={() => setSeconds(b.seconds)}
              className={`p-2.5 rounded-xl border text-left transition-all interact-lift text-xs ${
                Math.abs(seconds - b.seconds) < 0.1
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--text)] shadow-sm'
                  : 'border-[var(--border)] glass hover:bg-[var(--border)] text-[var(--text2)]'
              }`}
              aria-label={`Set duration to ${b.name}: ${b.seconds} seconds`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-[var(--text)]">
                <span role="img" aria-hidden="true">{b.icon}</span>
                <span className="truncate">{b.name}</span>
              </div>
              <div className="text-[10px] opacity-75 font-mono mt-0.5">{fmt(b.seconds, 1)}s</div>
              <div className="text-[10px] opacity-60 truncate">{b.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
