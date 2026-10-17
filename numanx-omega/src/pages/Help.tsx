import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import SEOHead from '../components/ui/SEOHead'

const FEATURES = [
  { icon: '📏', label: '30+ Conversion Categories', desc: '200+ units across length, mass, temp, and more' },
  { icon: '💵', label: 'Live Currency Rates', desc: '40+ world currencies with auto-refresh' },
  { icon: '₿', label: 'Crypto Prices', desc: 'Real-time BTC, ETH, SOL & more from CoinGecko' },
  { icon: '🧠', label: 'Natural Language Input', desc: 'Try "5 km in miles" or "(5m + 20cm) × 2"' },
  { icon: '📋', label: 'Batch Convert', desc: 'Convert hundreds of values at once, export CSV/JSON' },
  { icon: '⚒️', label: 'Custom Units', desc: 'Define your own units and conversion factors' },
  { icon: '❤️', label: 'Health Calculators', desc: 'BMI, BMR, and body metrics' },
  { icon: '⛓', label: 'Conversion Chains', desc: 'Cross-category: Energy→Cost, Fuel→Cost' },
  { icon: '📐', label: 'Formula Explorer', desc: 'Physics, chemistry & engineering formulas' },
  { icon: '🔬', label: 'Scientific Mode', desc: 'Constants, scientific notation, precision control' },
  { icon: '💎', label: '5 Themes', desc: 'AMOLED, Light, Cyberpunk, RGB, Holographic' },
  { icon: '📱', label: 'PWA & Offline', desc: 'Install as app, works without internet' },
]

export default function Help() {
  const navigate = useNavigate()
  const shortcuts = [
    ['Tab', 'Swap from ↔ to units'],
    ['Esc', 'Clear input'],
    ['/', 'Focus search'],
    ['Ctrl+C', 'Copy result'],
    ['Ctrl+D', 'Toggle dark mode'],
    ['Ctrl+S', 'Scientific notation'],
    ['Ctrl+F', 'Fraction mode'],
    ['Ctrl+E', 'Export history'],
    ['↑/↓', 'Navigate results'],
    ['Enter', 'Select result']
  ]

  return (
    <div className="space-y-4">
      <SEOHead title="Help Center — Shortcuts, Features & Tips" description="Learn how to use Omega X Converter with keyboard shortcuts, feature overview, theme guide, and pro tips for getting the most out of the platform." path="/help" />
      <h2 className="text-lg font-bold"><span aria-hidden="true">ℹ️</span> Help Center</h2>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-4 space-y-4">
        <div>
          <div className="text-sm font-semibold mb-2"><span aria-hidden="true">⌨️</span> Keyboard Shortcuts</div>
          <div className="space-y-1">
            {shortcuts.map(([key, desc]) => (
              <div key={key} className="flex justify-between text-sm p-1.5 rounded-lg hover:bg-[var(--border)]">
                <span className="font-mono font-bold px-2 py-0.5 rounded bg-[var(--border)] text-xs">{key}</span>
                <span className="opacity-60 text-xs">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold mb-3"><span aria-hidden="true">🎯</span> Features</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FEATURES.map((f, i) => (
              <motion.button key={f.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => { const p = f.label.includes('Theme') ? '/settings' : f.label.includes('Currency') ? '/currency' : f.label.includes('Crypto') ? '/crypto' : f.label.includes('Health') ? '/dashboard' : f.label.includes('Formula') ? '/formulas' : '/converter'; navigate(p) }}
                className="glass rounded-xl p-3 text-left hover:shadow-md transition-all interact-lift text-xs">
                <div className="text-lg mb-1" aria-hidden="true">{f.icon}</div>
                <div className="font-medium mb-0.5">{f.label}</div>
                <div className="opacity-50 leading-relaxed">{f.desc}</div>
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold mb-2"><span aria-hidden="true">🎨</span> Themes</div>
          <div className="text-xs opacity-60 space-y-1">
            <p><strong>AMOLED</strong> — Pure black background, perfect for OLED screens, battery saving</p>
            <p><strong>Light</strong> — Clean light mode for daytime use</p>
            <p><strong>Cyberpunk</strong> — Neon glow with dark purple, cyan & magenta accents</p>
            <p><strong>RGB</strong> — Dynamic rainbow cycling mode</p>
            <p><strong>Holographic</strong> — Frosted glass with translucent cards</p>
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold mb-2"><span aria-hidden="true">📖</span> Tips</div>
          <div className="text-xs opacity-60 space-y-1">
            <p>• Use the search bar to quickly find categories or units</p>
            <p>• Click any row in "All Conversions" to set it as your target unit</p>
            <p>• Pin your most-used conversions with the ☆ star button</p>
            <p>• Install the app via browser menu for offline access</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
