import { useState } from 'react'
import { motion } from 'framer-motion'
import ThemeCustomizer from '../components/widgets/ThemeCustomizer'

export default function Settings() {
  const [theme, setThemeState] = useState(() => localStorage.getItem('uc_theme_class') || '')
  const [prec, setPrec] = useState(() => parseInt(localStorage.getItem('uc_prec') || '6'))
  const [clearHist, setClearHist] = useState(false)

  const setTheme = (t: string) => {
    document.body.className = t
    localStorage.setItem('uc_theme_class', t)
    setThemeState(t)
  }

  const handlePrec = (v: number) => {
    setPrec(v)
    localStorage.setItem('uc_prec', String(v))
  }

  const handleClearAll = () => {
    localStorage.removeItem('uc_hist')
    localStorage.removeItem('uc_fav')
    localStorage.removeItem('uc_custom')
    setClearHist(true)
    setTimeout(() => setClearHist(false), 2000)
  }

  return (
    <article className="space-y-4">
      <header>
        <h2 className="text-lg font-bold">⚙️ Settings</h2>
      </header>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-4 space-y-4">
        <section>
          <h3 className="text-sm font-semibold mb-2">🎨 Theme</h3>
          <ThemeCustomizer theme={theme} setTheme={setTheme} />
        </section>

        <section>
          <h3 className="text-sm font-semibold mb-2">🎯 Default Precision: {prec}</h3>
          <input type="range" min="0" max="12" value={prec} onChange={e => handlePrec(Number(e.target.value))}
            className="w-full accent-[var(--primary)]" />
        </section>

        <section>
          <h3 className="text-sm font-semibold mb-2">🧹 Data</h3>
          <button onClick={handleClearAll}
            className="px-4 py-2 rounded-xl text-sm bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors">
            {clearHist ? '✅ Cleared!' : 'Clear All Data'}
          </button>
        </section>

        <section>
          <h3 className="text-sm font-semibold mb-2">📱 About</h3>
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
