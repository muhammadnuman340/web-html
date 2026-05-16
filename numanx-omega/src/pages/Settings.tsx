import { useState } from 'react'
import { motion } from 'framer-motion'
import ThemeCustomizer from '../components/widgets/ThemeCustomizer'
import { useMonetization } from '../hooks/useMonetization'

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
    <div className="space-y-4">
      <h2 className="text-lg font-bold">⚙️ Settings</h2>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-4 space-y-4">
        <div>
          <div className="text-sm font-semibold mb-2">🎨 Theme</div>
          <ThemeCustomizer theme={theme} setTheme={setTheme} />
        </div>

        <div>
          <div className="text-sm font-semibold mb-2">🎯 Default Precision: {prec}</div>
          <input type="range" min="0" max="12" value={prec} onChange={e => handlePrec(Number(e.target.value))}
            className="w-full accent-[var(--primary)]" />
        </div>

        <div>
          <div className="text-sm font-semibold mb-2">🧹 Data</div>
          <button onClick={handleClearAll}
            className="px-4 py-2 rounded-xl text-sm bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors">
            {clearHist ? '✅ Cleared!' : 'Clear All Data'}
          </button>
        </div>

        <div>
          <div className="text-sm font-semibold mb-2">📱 About</div>
          <div className="text-xs opacity-60 space-y-1">
            <p>Omega X Converter v2.0</p>
            <p>NumanX Studios</p>
            <p>Frontend-Only · PWA · Offline-Ready</p>
            <p>React + TypeScript + Vite + Tailwind CSS</p>
            <p className="pt-2">© 2026 NumanX Studios. All rights reserved.</p>
          </div>
        </div>

        <ProActivation />
      </motion.div>
    </div>
  )
}

function ProActivation() {
  const { isPro, setPro } = useMonetization()
  const [show, setShow] = useState(false)

  return (
    <div>
      <button onClick={() => setShow(!show)} className="text-[9px] opacity-20 hover:opacity-100 transition-opacity">
        {show ? '▼' : '▶'} Developer
      </button>
      {show && (
        <div className="mt-2 p-3 rounded-xl border border-dashed border-[var(--border)] space-y-2">
          <div className="text-xs font-semibold">🧪 Pro Override</div>
          <div className="text-[10px] opacity-50">Status: {isPro ? <span className="text-green-500">Active</span> : <span className="text-red-500/60">Free</span>}</div>
          <button onClick={() => { setPro(!isPro); window.location.reload() }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--primary)] text-white hover:shadow-lg transition-all">
            {isPro ? '⬇ Deactivate Pro' : '🚀 Activate Pro'}
          </button>
          <div className="text-[8px] opacity-30">Bypasses payment — sets localStorage directly</div>
        </div>
      )}
    </div>
  )
}
