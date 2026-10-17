import { useState } from 'react'
import { motion } from 'framer-motion'
import SEOHead from '../components/ui/SEOHead'
import ThemeCustomizer from '../components/widgets/ThemeCustomizer'

const FONTS = [
  { id: 'inter', label: 'Inter', icon: '🔤', desc: 'Modern sans-serif' },
  { id: 'system', label: 'System', icon: '💻', desc: 'OS default font' },
  { id: 'inter-mono', label: 'Inter + Mono', icon: '📝', desc: 'With JetBrains Mono for code' },
]

const FONT_KEY = 'uc_font'

function applyFont(fontId: string) {
  const classes = ['font-system', 'font-inter']
  document.body.classList.remove(...classes)
  if (fontId === 'system') document.body.classList.add('font-system')
  else document.body.classList.add('font-inter')
  localStorage.setItem(FONT_KEY, fontId)
}

export default function Settings() {
  const [theme, setThemeState] = useState(() => localStorage.getItem('uc_theme_class') || '')
  const [prec, setPrec] = useState(() => parseInt(localStorage.getItem('uc_prec') || '6'))
  const [font, setFont] = useState(() => localStorage.getItem(FONT_KEY) || 'inter')
  const [clearHist, setClearHist] = useState(false)
  const [haptic, setHaptic] = useState(() => localStorage.getItem('uc_haptic') !== 'off')

  const setTheme = (t: string) => {
    document.body.className = t
    localStorage.setItem('uc_theme_class', t)
    setThemeState(t)
  }

  const handlePrec = (v: number) => {
    setPrec(v)
    localStorage.setItem('uc_prec', String(v))
  }

  const handleFont = (id: string) => {
    setFont(id)
    applyFont(id)
  }

  const handleClearAll = () => {
    localStorage.removeItem('uc_hist')
    localStorage.removeItem('uc_fav')
    localStorage.removeItem('uc_custom')
    localStorage.removeItem('uc_unit_defaults')
    setClearHist(true)
    setTimeout(() => setClearHist(false), 2000)
  }

  return (
    <article className="space-y-4">
      <SEOHead title="Settings — Theme, Precision & Data" description="Customize your converter experience: choose from 5 themes (AMOLED, Light, Cyberpunk, RGB, Holographic), adjust precision, and manage your data." path="/settings" />
      <header>
        <h2 className="text-lg font-bold"><span aria-hidden="true">⚙️</span> Settings</h2>
      </header>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        {/* Appearance */}
        <section className="glass rounded-2xl p-4 space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2"><span className="w-1 h-4 rounded-full gradient-primary" /> Appearance</h3>
          
          <div>
            <h4 className="text-xs font-medium mb-2 opacity-70"><span aria-hidden="true">🎨</span> Theme</h4>
            <ThemeCustomizer theme={theme} setTheme={setTheme} />
          </div>

          <div>
            <h4 className="text-xs font-medium mb-2 opacity-70"><span aria-hidden="true">🔤</span> Font</h4>
            <div className="grid grid-cols-3 gap-2">
              {FONTS.map(f => (
                <button key={f.id} onClick={() => handleFont(f.id)}
                  className={`p-3 rounded-xl text-center text-xs transition-all ${font === f.id ? 'ring-2 ring-[var(--primary)] bg-[var(--card2)]' : 'glass hover:bg-[var(--border)]'}`}>
                  <div className="text-lg mb-1" aria-hidden="true">{f.icon}</div>
                  <div className="font-medium">{f.label}</div>
                  <div className="opacity-50 mt-0.5">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Behavior */}
        <section className="glass rounded-2xl p-4 space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2"><span className="w-1 h-4 rounded-full gradient-primary" /> Behavior</h3>
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium opacity-70"><span aria-hidden="true">📳</span> Haptic Feedback</h4>
            <button onClick={() => { const next = !haptic; setHaptic(next); localStorage.setItem('uc_haptic', next ? 'on' : 'off') }}
              className={`w-10 h-6 rounded-full transition-colors ${haptic ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}
              aria-label={haptic ? 'Disable haptic feedback' : 'Enable haptic feedback'}>
              <span className={`block w-4 h-4 rounded-full bg-white shadow transition-transform ${haptic ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>
          <div>
            <h4 className="text-xs font-medium mb-2 opacity-70"><span aria-hidden="true">🎯</span> Default Precision: {prec}</h4>
            <div className="flex items-center gap-3">
              <input type="range" min="0" max="12" value={prec} onChange={e => handlePrec(Number(e.target.value))}
                className="flex-1 accent-[var(--primary)]" />
              <span className="text-xs font-mono font-bold w-6 text-center">{prec}</span>
            </div>
          </div>
        </section>

        {/* Data */}
        <section className="glass rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2"><span className="w-1 h-4 rounded-full gradient-primary" /> Data</h3>
          <button onClick={handleClearAll}
            className="px-4 py-2 rounded-xl text-sm bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors interact-lift">
            {clearHist ? '✅ Cleared!' : 'Clear All Data'}
          </button>
          <p className="text-[10px] opacity-30">Removes history, favorites, custom units, and saved preferences.</p>
        </section>

        {/* About */}
        <section className="glass rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2"><span className="w-1 h-4 rounded-full gradient-primary" /> About</h3>
          <div className="text-xs opacity-60 space-y-1">
            <p>Omega X Converter v2.0</p>
            <p>NumanX Studios</p>
            <p>Frontend-Only · PWA · Offline-Ready</p>
            <p>React + TypeScript + Vite + Tailwind CSS</p>
            <p className="pt-2">© 2026 NumanX Studios. All rights reserved.</p>
          </div>
        </section>

      </motion.div>
    </article>
  )
}
