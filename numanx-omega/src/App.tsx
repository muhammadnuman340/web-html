import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, NavLink, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './components/layout/Sidebar'
import CommandBar from './components/ui/CommandBar'
import type { AppMode } from './components/widgets/ModeSwitcher'
import FloatingTools from './components/widgets/FloatingTools'
import AIAssistant from './components/widgets/AIAssistant'
import AIFloatingButton from './components/widgets/AIFloatingButton'
import ContextBar from './components/widgets/ContextBar'
import ErrorBoundary from './components/ui/ErrorBoundary'
import OnboardingTour from './components/ui/OnboardingTour'
import ShortcutsPanel from './components/ui/ShortcutsPanel'
import InstallPWA from './components/widgets/InstallPWA'
import { SkeletonPage } from './components/ui/Skeleton'
import { ToastProvider } from './hooks/useToast'
import AmbientBackground from './components/ui/AmbientBackground'
import JSONLD from './components/ui/JSONLD'
import { getAllCategories } from './engine/converter'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useGlobalShortcuts } from './hooks/useKeyboard'
import { useSwipe } from './hooks/useSwipe'

const Home = lazy(() => import('./pages/Home'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Categories = lazy(() => import('./pages/Categories'))
const ConverterPage = lazy(() => import('./pages/Converter'))
const Currency = lazy(() => import('./pages/Currency'))
const Crypto = lazy(() => import('./pages/Crypto'))
const FormulaExplorer = lazy(() => import('./pages/FormulaExplorer'))
const Favorites = lazy(() => import('./pages/Favorites'))
const History = lazy(() => import('./pages/History'))
const Settings = lazy(() => import('./pages/Settings'))
const CustomUnits = lazy(() => import('./pages/CustomUnits'))
const Help = lazy(() => import('./pages/Help'))
const CategoryLanding = lazy(() => import('./pages/CategoryLanding'))
const PairLanding = lazy(() => import('./pages/PairLanding'))
const GuidePage = lazy(() => import('./pages/GuidePage'))
const Sitemap = lazy(() => import('./pages/Sitemap'))

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [commandBarOpen, setCommandBarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ cat: string; label: string; unit: boolean }[]>([])
  const [mode, setMode] = useLocalStorage<AppMode>('uc_mode', 'pro')
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('uc_theme_class')
    return saved === null || saved === 'dark' || saved === 'theme-cosmic' || saved === 'theme-amoled' || saved === 'theme-cyberpunk' || saved === 'theme-rgb'
  })
  const [focusMode, setFocusMode] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const savedTheme = localStorage.getItem('uc_theme_class')
    if (savedTheme === null) {
      document.body.className = 'dark'
      localStorage.setItem('uc_theme_class', 'dark')
      setIsDark(true)
    } else if (savedTheme) {
      document.body.className = savedTheme
      setIsDark(savedTheme === 'dark' || savedTheme === 'theme-cosmic' || savedTheme === 'theme-amoled' || savedTheme === 'theme-cyberpunk' || savedTheme === 'theme-rgb')
    } else {
      document.body.className = ''
      setIsDark(false)
    }
    const savedFont = localStorage.getItem('uc_font') || 'inter'
    const classes = ['font-system', 'font-inter']
    document.body.classList.remove(...classes)
    if (savedFont === 'system') document.body.classList.add('font-system')
    else document.body.classList.add('font-inter')
  }, [])

  const toggleDark = useCallback(() => {
    const current = document.body.className
    const isCurrentlyDark = current === 'dark' || current === 'theme-cosmic' || current === 'theme-amoled' || current === 'theme-cyberpunk' || current === 'theme-rgb'
    const next = isCurrentlyDark ? '' : 'dark'
    document.body.className = next
    localStorage.setItem('uc_theme_class', next)
    setIsDark(next === 'dark')
  }, [])

  const toggleFocus = useCallback(() => {
    document.body.classList.toggle('focus-mode')
    setFocusMode(p => !p)
  }, [])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  const mainRef = useRef<HTMLDivElement>(null)
  useSwipe(mainRef, {
    onSwipeRight: () => setSidebarOpen(true),
    onSwipeLeft: () => setSidebarOpen(false),
  })

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q)
    if (!q.trim()) { setSearchResults([]); return }
    const cats = getAllCategories()
    const results: { cat: string; label: string; unit: boolean }[] = []
    cats.forEach(c => {
      if (c.lb.toLowerCase().includes(q.toLowerCase())) results.push({ cat: c.id, label: c.ic + ' ' + c.lb, unit: false })
      c.un.forEach(u => {
        if (u.lb.toLowerCase().includes(q.toLowerCase()) || u.id.toLowerCase().includes(q.toLowerCase()))
          results.push({ cat: c.id, label: u.lb + ' (' + c.lb + ')', unit: true })
      })
    })
    setSearchResults(results.slice(0, 12))
  }, [])

  const handleCommandConvert = useCallback((val: number, from: string, to: string) => {
    const cat = getAllCategories().find(c => c.un.some(u => u.id === from))
    if (cat) navigate(`/converter?cat=${cat.id}&from=${from}&to=${to}&val=${val}`)
  }, [navigate])

  const handleApplyPair = useCallback((from: string, to: string) => {
    const cat = getAllCategories().find(c => c.un.some(u => u.id === from))
    if (cat) navigate(`/converter?cat=${cat.id}&from=${from}&to=${to}`)
  }, [navigate])

  useGlobalShortcuts({
    onCommandBar: () => setCommandBarOpen(p => !p),
    onHistory: () => navigate('/history'),
    onDarkMode: toggleDark,
  })

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'a') {
        e.preventDefault()
        setAiAssistantOpen(p => !p)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const mode = (e as CustomEvent).detail as string
      setMode(mode as AppMode)
      localStorage.setItem('uc_mode', JSON.stringify(mode))
    }
    window.addEventListener('uc-mode-suggest', handler)
    return () => window.removeEventListener('uc-mode-suggest', handler)
  }, [setMode])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '?' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        setShortcutsOpen(p => !p)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const navItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/converter', icon: '🔄', label: 'Convert' },
    { path: '/categories', icon: '📂', label: 'Browse' },
    { path: '/settings', icon: '⚙️', label: 'Settings' },
  ]

  return (
    <>
      <JSONLD />
      <CommandBar open={commandBarOpen} onClose={() => setCommandBarOpen(false)} onConvert={handleCommandConvert} />
      <ShortcutsPanel open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <div className="distraction"><FloatingTools /></div>
      {aiAssistantOpen && <AIAssistant onClose={() => setAiAssistantOpen(false)} currentPage={location.pathname} />}
      <AIFloatingButton open={aiAssistantOpen} onToggle={() => setAiAssistantOpen(p => !p)} />
      <OnboardingTour />
      <InstallPWA />

      <AmbientBackground />
      <div className="flex min-h-screen" style={{ background: 'transparent' }} ref={mainRef}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} mode={mode} onModeChange={setMode} onApplyPair={handleApplyPair} />

        <div className="flex-1 flex flex-col min-h-screen">
          {/* Redesigned header */}
          <header className={`sticky top-0 z-30 glass border-b border-[var(--border)] transition-shadow duration-300 ${scrolled ? 'shadow-lg' : ''}`}>
            <div className="flex items-center gap-2 px-3 sm:px-5 py-2.5 max-w-5xl mx-auto">
              <button onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-xl hover:bg-[var(--border)] interact-lift text-sm" aria-label="Open sidebar">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              </button>

              {/* Logo */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-[var(--glow)]">NX</div>
                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="font-semibold text-sm">NumanX</span>
                  <span className="px-1.5 py-0.5 rounded text-xs font-semibold uppercase tracking-widest bg-[var(--primary-muted)] text-[var(--primary)]">Omega</span>
                </div>
              </div>

              {/* Search bar */}
              <div className="flex-1 relative max-w-sm">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-40 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                <input type="text" value={searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder="Search categories & units..."
                  className="w-full pl-8 pr-16 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card2)] text-sm outline-none focus:border-[var(--primary)] transition-all focus:shadow-[0_0_0_3px_var(--glow)]"
                  aria-label="Search"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <kbd className="text-xs px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--card2)] text-[var(--text2)] opacity-85 font-mono">⌘K</kbd>
                  {searchQuery && (
                    <button onClick={() => { setSearchQuery(''); setSearchResults([]) }}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-75 hover:opacity-100 transition-opacity" aria-label="Clear search">
                      ✕
                    </button>
                  )}
                </div>
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 glass rounded-xl overflow-hidden shadow-lg z-50 max-h-60 overflow-y-auto" role="listbox" tabIndex={0} aria-label="Search suggestions">
                    {searchResults.map((r, i) => (
                      <button key={i} role="option"
                        onClick={() => { navigate(r.unit ? `/converter?cat=${r.cat}` : '/categories'); setSearchQuery('') }}
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-[var(--border)] transition-colors interact-lift">
                        {r.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right side actions */}
              <div className="flex items-center gap-1">
                <button onClick={toggleFocus}
                  className={`p-2 rounded-xl hover:bg-[var(--border)] interact-lift text-sm transition-colors ${focusMode ? 'bg-[var(--primary-muted)]' : ''}`}
                  aria-label={focusMode ? 'Disable focus mode' : 'Enable focus mode'}
                  data-tooltip={focusMode ? 'Exit focus mode' : 'Focus mode'}>
                  🎯
                </button>
                <button onClick={toggleDark}
                  className="p-2 rounded-xl hover:bg-[var(--border)] interact-lift text-sm"
                  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
                  {isDark ? '☀️' : '🌙'}
                </button>
              </div>
            </div>
          </header>

          {/* Gradient accent bar below header */}
          <div className="gradient-accent" />

          {/* Install PWA banner */}
          <div className="max-w-5xl mx-auto w-full pt-1 px-3 sm:px-5 distraction">
            <InstallPWA />
          </div>

          {/* Main content */}
          <main className={`flex-1 px-3 sm:px-5 py-4 sm:py-6 max-w-5xl mx-auto w-full ${mode === 'fast' ? 'pt-8' : ''}`}>
            <ErrorBoundary>
              <AnimatePresence mode="wait">
                <Suspense fallback={<SkeletonPage />}>
                  <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  >
                    <Routes location={location}>
                      <Route path="/" element={<Home mode={mode} />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/convert/:category" element={<CategoryLanding />} />
                      <Route path="/category/:category" element={<CategoryLanding />} />
                      <Route path="/convert/:category/:pair" element={<PairLanding />} />
                      <Route path="/pair/:pair" element={<PairLanding />} />

                      {/* Dedicated Direct Category Slugs */}
                      <Route path="/length-converter" element={<CategoryLanding categorySlug="length" />} />
                      <Route path="/length" element={<CategoryLanding categorySlug="length" />} />
                      <Route path="/temperature-converter" element={<CategoryLanding categorySlug="temp" />} />
                      <Route path="/temperature" element={<CategoryLanding categorySlug="temp" />} />
                      <Route path="/temp" element={<CategoryLanding categorySlug="temp" />} />
                      <Route path="/mass-converter" element={<CategoryLanding categorySlug="mass" />} />
                      <Route path="/mass" element={<CategoryLanding categorySlug="mass" />} />
                      <Route path="/weight-converter" element={<CategoryLanding categorySlug="mass" />} />
                      <Route path="/weight" element={<CategoryLanding categorySlug="mass" />} />
                      <Route path="/speed-converter" element={<CategoryLanding categorySlug="speed" />} />
                      <Route path="/speed" element={<CategoryLanding categorySlug="speed" />} />
                      <Route path="/volume-converter" element={<CategoryLanding categorySlug="volume" />} />
                      <Route path="/volume" element={<CategoryLanding categorySlug="volume" />} />
                      <Route path="/area-converter" element={<CategoryLanding categorySlug="area" />} />
                      <Route path="/area" element={<CategoryLanding categorySlug="area" />} />
                      <Route path="/time-converter" element={<CategoryLanding categorySlug="time" />} />
                      <Route path="/time" element={<CategoryLanding categorySlug="time" />} />
                      <Route path="/pressure-converter" element={<CategoryLanding categorySlug="pressure" />} />
                      <Route path="/pressure" element={<CategoryLanding categorySlug="pressure" />} />
                      <Route path="/energy-converter" element={<CategoryLanding categorySlug="energy" />} />
                      <Route path="/energy" element={<CategoryLanding categorySlug="energy" />} />
                      <Route path="/power-converter" element={<CategoryLanding categorySlug="power" />} />
                      <Route path="/power" element={<CategoryLanding categorySlug="power" />} />
                      <Route path="/data-converter" element={<CategoryLanding categorySlug="data" />} />
                      <Route path="/fuel-converter" element={<CategoryLanding categorySlug="fuel" />} />
                      <Route path="/fuel" element={<CategoryLanding categorySlug="fuel" />} />
                      <Route path="/cooking-converter" element={<CategoryLanding categorySlug="cooking" />} />
                      <Route path="/cooking" element={<CategoryLanding categorySlug="cooking" />} />
                      <Route path="/angle-converter" element={<CategoryLanding categorySlug="angle" />} />
                      <Route path="/angle" element={<CategoryLanding categorySlug="angle" />} />
                      <Route path="/force-converter" element={<CategoryLanding categorySlug="force" />} />
                      <Route path="/force" element={<CategoryLanding categorySlug="force" />} />
                      <Route path="/acceleration-converter" element={<CategoryLanding categorySlug="acceleration" />} />
                      <Route path="/acceleration" element={<CategoryLanding categorySlug="acceleration" />} />
                      <Route path="/electricity-converter" element={<CategoryLanding categorySlug="electricity" />} />
                      <Route path="/electricity" element={<CategoryLanding categorySlug="electricity" />} />
                      <Route path="/magnetism-converter" element={<CategoryLanding categorySlug="magnetism" />} />
                      <Route path="/magnetism" element={<CategoryLanding categorySlug="magnetism" />} />
                      <Route path="/frequency-converter" element={<CategoryLanding categorySlug="frequency" />} />
                      <Route path="/frequency" element={<CategoryLanding categorySlug="frequency" />} />
                      <Route path="/datatransfer-converter" element={<CategoryLanding categorySlug="datatransfer" />} />
                      <Route path="/datatransfer" element={<CategoryLanding categorySlug="datatransfer" />} />
                      <Route path="/torque-converter" element={<CategoryLanding categorySlug="torque" />} />
                      <Route path="/torque" element={<CategoryLanding categorySlug="torque" />} />
                      <Route path="/density-converter" element={<CategoryLanding categorySlug="density" />} />
                      <Route path="/density" element={<CategoryLanding categorySlug="density" />} />
                      <Route path="/textile-converter" element={<CategoryLanding categorySlug="textile" />} />
                      <Route path="/textile" element={<CategoryLanding categorySlug="textile" />} />
                      <Route path="/astronomy-converter" element={<CategoryLanding categorySlug="astronomy" />} />
                      <Route path="/astronomy" element={<CategoryLanding categorySlug="astronomy" />} />
                      <Route path="/converter" element={<ConverterPage mode={mode} />} />
                      <Route path="/currency" element={<Currency />} />
                      <Route path="/crypto" element={<Crypto />} />
                      <Route path="/formulas" element={<FormulaExplorer />} />
                      <Route path="/favorites" element={<Favorites />} />
                      <Route path="/history" element={<History />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/custom-units" element={<CustomUnits />} />
                      <Route path="/help" element={<Help />} />
                      <Route path="/calculator" element={<ConverterPage mode={mode} />} />
                      <Route path="/health" element={<Dashboard />} />
                      <Route path="/guides/:slug" element={<GuidePage />} />
                      <Route path="/sitemap" element={<Sitemap />} />
                    </Routes>
                  </motion.div>
                </Suspense>
              </AnimatePresence>
            </ErrorBoundary>
          </main>

          {/* Context AI Bar */}
          <div className="max-w-5xl mx-auto w-full distraction">
            <ContextBar />
          </div>

          {/* Desktop footer */}
          <footer className="hidden lg:flex items-center justify-between px-5 py-3 text-xs text-[var(--text2)] border-t border-[var(--border)] distraction">
            <span>NumanX Omega X v2.0</span>
            <div className="flex gap-4 items-center">
              <Link to="/sitemap" className="hover:underline hover:text-[var(--text)] transition-colors">Sitemap</Link>
              <span aria-hidden="true" className="opacity-80 select-none">·</span>
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--card2)] border border-[var(--border)] text-[var(--text)] font-mono text-xs">⌘K</kbd> for commands</span>
              <span aria-hidden="true" className="opacity-80 select-none">·</span>
              <span>PWA · Offline-ready</span>
            </div>
          </footer>

          {/* Mobile bottom nav */}
          <nav aria-label="Mobile navigation" className="lg:hidden fixed bottom-0 left-0 right-0 z-30 glass border-t border-[var(--border)] safe-area-bottom">
            <div className="flex justify-around items-center px-1 py-1">
              {navItems.map(item => {
                const isActive = location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path))
                return (
                  <NavLink key={item.path} to={item.path}
                    className={`relative flex flex-col items-center gap-0.5 px-3 sm:px-4 py-1.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'text-[var(--primary)] bg-[var(--primary-muted)]'
                        : 'text-[var(--text3)] hover:text-[var(--text2)] hover:bg-[var(--border)]'
                    }`}
                    aria-label={item.label}>
                    <span className={`text-lg transition-all duration-200 ${isActive ? 'scale-110' : ''}`}>{item.icon}</span>
                    <span className={`text-xs font-medium leading-tight ${isActive ? 'opacity-100' : 'opacity-50'}`}>{item.label}</span>
                  </NavLink>
                )
              })}
            </div>
          </nav>
        </div>
      </div>
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
