import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import SEOHead from '../components/ui/SEOHead'
import { STORAGE_KEYS } from '../config/legal'
import { getTheme, setTheme as applyTheme, type Theme } from '../utils/theme'

const FONTS = [
  { id: 'inter', label: 'Inter', desc: 'NumanX default' },
  { id: 'system', label: 'System', desc: 'Your device font' },
]

const FONT_KEY = 'uc_font'

function applyFont(fontId: string) {
  document.body.classList.remove('font-system', 'font-inter')
  document.body.classList.add(fontId === 'system' ? 'font-system' : 'font-inter')
  localStorage.setItem(FONT_KEY, fontId)
}

const optionClass = (active: boolean) =>
  `min-h-[44px] px-4 py-2.5 rounded-xl border text-sm font-semibold text-left transition-colors ${
    active
      ? 'bg-[var(--fill)] border-[var(--fill)] text-[var(--on-fill)]'
      : 'bg-[var(--card)] border-[var(--border)] text-[var(--text)] hover:border-[var(--text)]'
  }`

export default function Settings() {
  const [theme, setThemeState] = useState<Theme>(getTheme)
  const [prec, setPrec] = useState(() => parseInt(localStorage.getItem('uc_prec') || '6'))
  const [font, setFont] = useState(() => localStorage.getItem(FONT_KEY) || 'inter')
  const [cleared, setCleared] = useState(false)
  const [haptic, setHaptic] = useState(() => localStorage.getItem('uc_haptic') !== 'off')

  const chooseTheme = (t: Theme) => {
    applyTheme(t)
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

  // Removes all personal data listed in the Privacy Policy; display preferences (theme, font, precision, mode) are kept
  const handleClearAll = () => {
    for (const key of STORAGE_KEYS.personal) localStorage.removeItem(key)
    setCleared(true)
    setTimeout(() => setCleared(false), 2000)
  }

  return (
    <article className="space-y-6">
      <SEOHead title="Settings — Theme, Precision & Data" description="Customize your converter: light or dark theme, font, decimal precision, and clearing your saved data." path="/settings" />
      <h1>Settings</h1>

      <section className="nx-card p-5 space-y-5">
        <h2 className="text-lg">Appearance</h2>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold font-sans tracking-normal">Theme</h3>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => chooseTheme('light')} className={optionClass(theme === 'light')} aria-pressed={theme === 'light'}>
              <span className="inline-flex items-center gap-2"><Sun size={16} aria-hidden="true" /> Light</span>
            </button>
            <button type="button" onClick={() => chooseTheme('dark')} className={optionClass(theme === 'dark')} aria-pressed={theme === 'dark'}>
              <span className="inline-flex items-center gap-2"><Moon size={16} aria-hidden="true" /> Dark</span>
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold font-sans tracking-normal">Font</h3>
          <div className="flex flex-wrap gap-2">
            {FONTS.map(f => (
              <button key={f.id} type="button" onClick={() => handleFont(f.id)} className={optionClass(font === f.id)} aria-pressed={font === f.id}>
                <span className="block">{f.label}</span>
                <span className="block text-[13px] font-normal opacity-80">{f.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="nx-card p-5 space-y-5">
        <h2 className="text-lg">Behavior</h2>
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold font-sans tracking-normal">Haptic feedback</h3>
          <button
            type="button"
            onClick={() => { const next = !haptic; setHaptic(next); localStorage.setItem('uc_haptic', next ? 'on' : 'off') }}
            className={`btn-chip ${haptic ? 'active' : ''}`}
            aria-pressed={haptic}
          >
            {haptic ? 'On' : 'Off'}
          </button>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold font-sans tracking-normal">Default precision: {prec} decimals</h3>
          <input
            type="range"
            min="0"
            max="12"
            value={prec}
            onChange={e => handlePrec(Number(e.target.value))}
            aria-label="Default conversion precision in decimal places"
            aria-valuetext={`${prec} decimal places`}
            className="w-full accent-[var(--text)]"
          />
        </div>
      </section>

      <section className="nx-card p-5 space-y-3">
        <h2 className="text-lg">Data</h2>
        <button type="button" onClick={handleClearAll} className="btn-secondary text-sm text-[var(--status-danger)]">
          {cleared ? 'Cleared' : 'Clear all data'}
        </button>
        <p className="text-sm text-[var(--text2)]">Removes history, favorites, custom units and saved preferences.</p>
      </section>

      <section className="nx-card p-5 space-y-3">
        <h2 className="text-lg">About</h2>
        <div className="text-sm text-[var(--text2)] space-y-1">
          <p>Omega X Converter v2.0</p>
          <p>NumanX Studio</p>
          <p>Runs in your browser. Nothing is sent to a server.</p>
          <p className="pt-2">© 2026 NumanX Studio. All rights reserved.</p>
        </div>
      </section>
    </article>
  )
}
