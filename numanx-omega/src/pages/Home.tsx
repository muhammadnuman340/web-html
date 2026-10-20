import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import UniversalConverter from '../components/converter/UniversalConverter'
import SEOHead from '../components/ui/SEOHead'
import { getAllCategories } from '../engine/converter'
import { analytics } from '../engine/analytics'
import type { AppMode } from '../components/widgets/ModeSwitcher'

interface Props { mode?: AppMode }

function AnimatedLogo() {
  return (
    <motion.div
      animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.08, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      className="inline-flex mb-4"
      role="img"
      aria-label="Omega X Converter"
    >
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="52" height="52" rx="14" fill="url(#logo-grad)" fillOpacity="0.12" stroke="url(#logo-grad)" strokeWidth="2" />
        <motion.circle cx="28" cy="28" r="14" stroke="url(#logo-grad)" strokeWidth="2" fill="none"
          animate={{ pathLength: [0, 1, 1, 0], opacity: [0.4, 1, 1, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
        <text x="28" y="33" textAnchor="middle" fill="url(#logo-grad)" fontSize="18" fontWeight="700" fontFamily="Inter, sans-serif">NΩ</text>
      </svg>
    </motion.div>
  )
}

function AnimatedStat({ value, label, delay }: { value: number | string; label: string; delay: number }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const counted = useRef(false)

  useEffect(() => {
    if (typeof value !== 'number' || counted.current) return
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !counted.current) {
        counted.current = true
        const target = value
        const duration = 800
        const start = performance.now()
        const raf = () => {
          const t = Math.min((performance.now() - start) / duration, 1)
          const eased = 1 - Math.pow(1 - t, 3)
          setDisplay(Math.floor(eased * target))
          if (t < 1) requestAnimationFrame(raf)
        }
        requestAnimationFrame(raf)
      }
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [value])

  return (
    <motion.div ref={ref} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 + delay * 0.1 }} className="glass rounded-2xl p-3">
      <div className="text-xl font-bold">{typeof value === 'number' ? display : <span aria-label="Infinite">{value}</span>}</div>
      <div className="text-xs text-[var(--text2)] opacity-80">{label}</div>
    </motion.div>
  )
}

export default function Home({ mode = 'pro' }: Props) {
  const navigate = useNavigate()
  const [visitors] = useState(() => Math.floor(Math.random() * 10000) + 42000)
  const cats = getAllCategories()
  const summary = analytics.getSummary()

  const FEATURES = [
    { icon: '📏', label: 'Length & Distance', desc: 'Nanometers to parsecs', path: '/convert/length' },
    { icon: '⚖️', label: 'Mass & Weight', desc: 'AMU to metric tons', path: '/convert/mass' },
    { icon: '🌡️', label: 'Temperature', desc: '5 scales including Rankine', path: '/convert/temp' },
    { icon: '💵', label: 'Currency', desc: '40+ world currencies live', path: '/currency' },
    { icon: '₿', label: 'Crypto', desc: 'Bitcoin, Ethereum, Solana...', path: '/crypto' },
    { icon: '🧮', label: 'Scientific', desc: 'Constants & formulas', path: '/formulas' },
    { icon: '❤️', label: 'Health', desc: 'BMI, BMR, body fat', path: '/health' },
    { icon: '📐', label: 'Engineering', desc: 'Physics & mechanics', path: '/convert/pressure' },
    { icon: '⛓', label: 'Conversion Chains', desc: 'Energy→Cost, Fuel→Cost', path: '/converter' },
    { icon: '📋', label: 'Batch Convert', desc: '1000+ values at once', path: '/converter' },
  ]

  const modeFeatures: Partial<Record<AppMode, { icon: string; label: string; desc: string; path?: string }[]>> = {
    trader: [
      { icon: '💵', label: 'Currency', desc: '40+ live forex pairs', path: '/currency' },
      { icon: '₿', label: 'Crypto', desc: 'Real-time CoinGecko prices', path: '/crypto' },
      { icon: '📊', label: 'Dashboard', desc: 'Trader analytics', path: '/dashboard' },
    ],
    scientist: [
      { icon: '🔬', label: 'Scientific Constants', desc: 'c, h, G, Nₐ, k, e⁻', path: '/formulas' },
      { icon: '📐', label: 'Formulas', desc: 'Physics & chemistry', path: '/formulas' },
      { icon: '⚛️', label: 'Advanced Units', desc: 'AMU, eV, light years', path: '/convert/energy' },
    ],
  }

  const displayFeatures = modeFeatures[mode] || FEATURES.slice(0, 8)

  return (
    <div className="relative">
      <SEOHead title="Free Universal Unit Converter" description="Free online unit converter with 200+ units, 30+ categories, live currency rates, crypto prices, formula charts, and offline PWA support." path="/" />
      <div className="relative z-10 space-y-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
          <AnimatedLogo />
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 leading-tight">
            <span className="gradient-horizontal bg-clip-text text-transparent">Omega X</span> Converter
          </h1>
          <p className="text-sm text-[var(--text2)] opacity-85 max-w-md mx-auto">{cats.length} categories · {cats.reduce((a, c) => a + c.un.length, 0)}+ units · Zero backend · Free for everyone</p>
          <div className="flex gap-2 justify-center mt-3 text-xs text-[var(--text2)] opacity-80 flex-wrap">
            <span><span aria-hidden="true">⚡</span> {cats.reduce((a, c) => a + c.un.length, 0)}+ units</span>
            <span><span aria-hidden="true">🌐</span> {visitors.toLocaleString()} users</span>
            <span><span aria-hidden="true">📊</span> {summary.totalConversions} conversions today</span>
            <span><span aria-hidden="true">⛓</span> {cats.length * (cats.length - 1)} chain combinations</span>
          </div>
          {mode && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs flex gap-2 justify-center flex-wrap">
              {mode === 'student' && <span className="px-2 py-0.5 rounded-full bg-[var(--success)]/10 text-[var(--success)]"><span aria-hidden="true">🎓</span> Explanations enabled</span>}
              {mode === 'engineer' && <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500"><span aria-hidden="true">🔧</span> Precision mode</span>}
              {mode === 'scientist' && <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500"><span aria-hidden="true">🔬</span> Constants & formulas</span>}
              {mode === 'trader' && <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500"><span aria-hidden="true">💹</span> Currency & crypto focus</span>}
              {mode === 'fast' && <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500"><span aria-hidden="true">⚡</span> Minimal mode</span>}
              {mode === 'pro' && <span className="px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]"><span aria-hidden="true">🚀</span> Full intelligence</span>}
            </motion.div>
          )}
        </motion.div>

        {/* AI Quick Actions */}
        {(mode === 'pro' || mode === 'scientist') && summary.totalConversions > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass-liquid rounded-2xl p-3 flex items-center gap-3">
            <span className="text-lg" aria-hidden="true">🤖</span>
            <div className="flex-1">
              <div className="text-xs font-medium text-[var(--text)]">Smart Suggestion</div>
              <div className="text-xs text-[var(--text2)] opacity-85">Top: {summary.mostUsedCategory} · Frequent: {summary.mostUsedPair}</div>
            </div>
            <button onClick={() => navigate('/dashboard')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--primary)] text-white shadow-sm hover:brightness-110 interact-lift">View Insights</button>
          </motion.div>
        )}

        {/* Quick actions for trader */}
        {mode === 'trader' && (
          <div className="grid grid-cols-2 gap-2">
            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate('/currency')}
              className="glass-liquid rounded-2xl p-4 text-center hover:shadow-lg transition-all interact-lift">
              <div className="text-3xl mb-2" aria-hidden="true">💵</div>
              <div className="font-semibold text-sm">Currency</div>
              <div className="text-xs text-[var(--text2)] opacity-80 mt-0.5">40+ live pairs</div>
            </motion.button>
            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              onClick={() => navigate('/crypto')}
              className="glass-liquid rounded-2xl p-4 text-center hover:shadow-lg transition-all interact-lift">
              <div className="text-3xl mb-2" aria-hidden="true">₿</div>
              <div className="font-semibold text-sm">Crypto</div>
              <div className="text-xs text-[var(--text2)] opacity-80 mt-0.5">Live CoinGecko rates</div>
            </motion.button>
          </div>
        )}

        {/* Live Converter */}
        <div className="glass-liquid rounded-2xl p-4">
          <div className="text-xs font-semibold uppercase tracking-wide mb-3 opacity-60">
            {mode === 'trader' ? <><span aria-hidden="true">💹</span> Quick Trade Convert</> :
             mode === 'scientist' ? <><span aria-hidden="true">🔬</span> Precision Convert</> :
             mode === 'fast' ? <><span aria-hidden="true">⚡</span> Instant Convert</> : 'Quick Convert'}
          </div>
          <UniversalConverter mode={mode} />
        </div>

        {/* Feature Grid */}
        <section aria-labelledby="feature-heading">
          <h2 id="feature-heading" className="sr-only">Conversion Features</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {displayFeatures.map((f, i) => (
              <motion.button key={f.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} whileHover={{ y: -4, scale: 1.02 }}
                onClick={() => navigate(f.path || '/converter')}
                className="glass rounded-2xl p-4 text-left hover:shadow-lg transition-all interact-lift group border border-transparent hover:border-[var(--border)]"
                aria-label={`${f.label}: ${f.desc}`}>
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300" role="img" aria-hidden="true">{f.icon}</div>
                <div className="font-semibold text-sm text-[var(--text)]">{f.label}</div>
                <div className="text-xs text-[var(--text2)] opacity-75 mt-0.5 group-hover:opacity-100 transition-opacity">{f.desc}</div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">Platform Statistics</h2>
          <div className="grid grid-cols-4 gap-3 text-center">
            <AnimatedStat value={cats.length} label="Categories" delay={0} />
            <AnimatedStat value={cats.reduce((a, c) => a + c.un.length, 0)} label="Units" delay={1} />
            <AnimatedStat value="∞" label="Combinations" delay={2} />
            <AnimatedStat value={summary.totalConversions || 0} label="Your Conversions" delay={3} />
          </div>
        </section>

        {/* Quick tips */}
        <section aria-labelledby="tips-heading" className="glass rounded-2xl p-4 text-xs space-y-2">
          <h2 id="tips-heading" className="font-semibold flex items-center gap-1.5 text-sm opacity-80">
            <span className="text-base" aria-hidden="true">💡</span> Tips & Shortcuts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {[
              'Press <kbd>⌘K</kbd> for command palette',
              'Try "5 km in miles" or "(5m + 20cm) × 2" in the converter',
              mode === 'pro' && 'Click ⛓ for cross-category conversion chains (Energy → Cost)',
              mode === 'pro' && 'Use 📋 Batch mode to convert multiple values at once',
              'Click ☆ to save a conversion to your favorites',
              'Tap the result area to copy the value',
            ].filter(Boolean).map((tip, i) => (
              <div key={i} className="flex items-start gap-2 p-1.5" dangerouslySetInnerHTML={{
                __html: `<span class="text-[var(--primary)] mt-0.5" aria-hidden="true">•</span><span class="text-[var(--text)] opacity-85">${tip}</span>`
              }} />
            ))}
          </div>
        </section>

        <footer className="text-center text-xs text-[var(--text2)] opacity-80 py-4">
          NumanX Omega X · NumanX Studios · Frontend-Only · PWA · Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--card2)] border border-[var(--border)] text-[var(--text)] font-mono text-xs">⌘K</kbd> for commands
        </footer>
      </div>
    </div>
  )
}
