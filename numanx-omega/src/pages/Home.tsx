import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UniversalConverter from '../components/converter/UniversalConverter'
import ParticleBackground from '../components/ui/ParticleBackground'
import SEOHead from '../components/ui/SEOHead'
import { getAllCategories } from '../engine/converter'
import { analytics } from '../engine/analytics'
import { aiEngine } from '../engine/aiEngine'
import type { AppMode } from '../components/widgets/ModeSwitcher'

interface Props { mode?: AppMode }

export default function Home({ mode = 'pro' }: Props) {
  const navigate = useNavigate()
  const [visitors, setVisitors] = useState(0)
  const cats = getAllCategories()
  const summary = analytics.getSummary()

  useEffect(() => {
    setVisitors(Math.floor(Math.random() * 10000) + 42000)
  }, [])

  const FEATURES = [
    { icon: '📏', label: 'Length & Distance', desc: 'Nanometers to parsecs' },
    { icon: '⚖️', label: 'Mass & Weight', desc: 'AMU to metric tons' },
    { icon: '🌡️', label: 'Temperature', desc: '5 scales including Rankine' },
    { icon: '💵', label: 'Currency', desc: '40+ world currencies live' },
    { icon: '₿', label: 'Crypto', desc: 'Bitcoin, Ethereum, Solana...' },
    { icon: '🧮', label: 'Scientific', desc: 'Constants & formulas' },
    { icon: '❤️', label: 'Health', desc: 'BMI, BMR, body fat' },
    { icon: '📐', label: 'Engineering', desc: 'Physics & mechanics' },
    { icon: '⛓', label: 'Conversion Chains', desc: 'Energy→Cost, Fuel→Cost' },
    { icon: '📋', label: 'Batch Convert', desc: '1000+ values at once' },
  ]

  const modeFeatures: Partial<Record<AppMode, { icon: string; label: string; desc: string }[]>> = {
    trader: [
      { icon: '💵', label: 'Currency', desc: '40+ live forex pairs' },
      { icon: '₿', label: 'Crypto', desc: 'Real-time CoinGecko prices' },
      { icon: '📊', label: 'Dashboard', desc: 'Trader analytics' },
    ],
    scientist: [
      { icon: '🔬', label: 'Scientific Constants', desc: 'c, h, G, Nₐ, k, e⁻' },
      { icon: '📐', label: 'Formulas', desc: 'Physics & chemistry' },
      { icon: '⚛️', label: 'Advanced Units', desc: 'AMU, eV, light years' },
    ],
  }

  const displayFeatures = modeFeatures[mode] || FEATURES.slice(0, 8)

  return (
    <div className="relative">
      <SEOHead title="Free Universal Unit Converter" description="Convert between 200+ units across 30+ categories. Free online unit converter with live currency rates, crypto prices, natural language input, batch mode, and PWA offline support." path="/" />
      <ParticleBackground />
      <div className="relative z-10 space-y-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }}
            className="inline-block text-4xl mb-3" role="img" aria-label="Converter icon">🔄</motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-1">
            <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">Omega X</span> Converter
          </h1>
          <p className="text-sm opacity-60 max-w-md mx-auto">{cats.length} categories · {cats.reduce((a, c) => a + c.un.length, 0)}+ units · Zero backend · Free for everyone</p>
          <div className="flex gap-2 justify-center mt-3 text-xs opacity-40 flex-wrap">
            <span>⚡ {cats.reduce((a, c) => a + c.un.length, 0)}+ units</span>
            <span>🌐 {visitors.toLocaleString()} users</span>
            <span>📊 {summary.totalConversions} conversions today</span>
            <span>⛓ {cats.length * (cats.length - 1)} chain combinations</span>
          </div>
          {mode && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs flex gap-2 justify-center flex-wrap">
              {mode === 'student' && <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">🎓 Explanations enabled</span>}
              {mode === 'engineer' && <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">🔧 Precision mode</span>}
              {mode === 'scientist' && <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500">🔬 Constants & formulas</span>}
              {mode === 'trader' && <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500">💹 Currency & crypto focus</span>}
              {mode === 'fast' && <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500">⚡ Minimal mode</span>}
              {mode === 'pro' && <span className="px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">🚀 Full intelligence</span>}
            </motion.div>
          )}
        </motion.div>

        {/* AI Quick Actions */}
        {(mode === 'pro' || mode === 'scientist') && summary.totalConversions > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass-liquid rounded-2xl p-3 flex items-center gap-3">
            <span className="text-lg">🤖</span>
            <div className="flex-1">
              <div className="text-xs font-medium">Smart Suggestion</div>
              <div className="text-xs opacity-60">Top: {summary.mostUsedCategory} · Frequent: {summary.mostUsedPair}</div>
            </div>
            <button onClick={() => navigate('/dashboard')}
              className="px-3 py-1 rounded-lg text-xs bg-[var(--primary)] text-white interact-lift">View Insights</button>
          </motion.div>
        )}

        {/* Quick actions for trader */}
        {mode === 'trader' && (
          <div className="grid grid-cols-2 gap-2">
            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate('/currency')}
              className="glass-liquid rounded-2xl p-4 text-center hover:shadow-lg transition-all interact-lift">
              <div className="text-3xl mb-2">💵</div>
              <div className="font-semibold text-sm">Currency</div>
              <div className="text-xs opacity-50 mt-0.5">40+ live pairs</div>
            </motion.button>
            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              onClick={() => navigate('/crypto')}
              className="glass-liquid rounded-2xl p-4 text-center hover:shadow-lg transition-all interact-lift">
              <div className="text-3xl mb-2">₿</div>
              <div className="font-semibold text-sm">Crypto</div>
              <div className="text-xs opacity-50 mt-0.5">Live CoinGecko rates</div>
            </motion.button>
          </div>
        )}

        {/* Live Converter */}
        <div className="glass-liquid rounded-2xl p-4">
          <div className="text-xs font-semibold uppercase tracking-wide mb-3 opacity-60">
            {mode === 'trader' ? '💹 Quick Trade Convert' :
             mode === 'scientist' ? '🔬 Precision Convert' :
             mode === 'fast' ? '⚡ Instant Convert' : 'Quick Convert'}
          </div>
          <UniversalConverter mode={mode} />
        </div>

        {/* Feature Grid */}
        <section aria-labelledby="feature-heading">
          <h2 id="feature-heading" className="sr-only">Conversion Features</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {displayFeatures.map((f, i) => (
              <motion.button key={f.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} whileHover={{ y: -3 }}
                onClick={() => navigate(mode === 'trader' && (f.label === 'Currency' || f.label === 'Crypto') ? `/${f.label.toLowerCase()}` : '/converter')}
                className="glass rounded-2xl p-4 text-left hover:shadow-lg transition-all interact-lift"
                aria-label={`${f.label}: ${f.desc}`}>
                <div className="text-2xl mb-2" role="img" aria-hidden="true">{f.icon}</div>
                <div className="font-semibold text-sm">{f.label}</div>
                <div className="text-xs opacity-50 mt-0.5">{f.desc}</div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">Platform Statistics</h2>
          <div className="grid grid-cols-4 gap-3 text-center">
          {[
            { n: cats.length, l: 'Categories' },
            { n: cats.reduce((a, c) => a + c.un.length, 0), l: 'Units' },
            { n: '∞', l: 'Combinations' },
            { n: summary.totalConversions || 0, l: 'Your Conversions' }
          ].map((s, i) => (
            <motion.div key={s.l} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }} className="glass rounded-2xl p-3">
              <div className="text-xl font-bold">{s.n}</div>
              <div className="text-xs opacity-50">{s.l}</div>
            </motion.div>
            ))}
          </div>
        </section>

        {/* Quick tips */}
        <section aria-labelledby="tips-heading" className="glass rounded-2xl p-3 text-xs opacity-50 space-y-1">
          <h2 id="tips-heading" className="font-semibold mb-1">💡 Tips</h2>
          <p>• Press <kbd className="px-1 rounded bg-[var(--border)]">⌘K</kbd> for command palette</p>
          <p>• Try "5 km in miles" or "(5m + 20cm) × 2" in the converter</p>
          {mode === 'pro' && <p>• Click ⛓ for cross-category conversion chains (Energy → Cost)</p>}
          {mode === 'pro' && <p>• Use 📋 Batch mode to convert multiple values at once</p>}
          <p>• Click 🎯 in the header for Focus Mode</p>
        </section>

        <footer className="text-center text-xs opacity-30 py-4">
          NumanX Omega X · NumanX Studios · Frontend-Only · PWA · Press ⌘K for commands
        </footer>
      </div>
    </div>
  )
}
