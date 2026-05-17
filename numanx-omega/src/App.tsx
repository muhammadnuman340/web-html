import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './components/layout/Sidebar'
import CommandBar from './components/ui/CommandBar'
import type { AppMode } from './components/widgets/ModeSwitcher'
import FloatingTools from './components/widgets/FloatingTools'
import AIAssistant from './components/widgets/AIAssistant'
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

// Lazy-loaded pages for code splitting
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

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [commandBarOpen, setCommandBarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ cat: string; label: string; unit: boolean }[]>([])
  const [mode, setMode] = useLocalStorage<AppMode>('uc_mode', 'pro')
  const [focusMode, setFocusMode] = useState(false)
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const savedTheme = localStorage.getItem('uc_theme_class')
    if (savedTheme) document.body.className = savedTheme
  }, [])

  useEffect(() => {
    if (focusMode) document.body.classList.add('focus-mode')
    else document.body.classList.remove('focus-mode')
  }, [focusMode])

  // Gesture: swipe right to open sidebar on mobile
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
    onDarkMode: () => {
      const current = document.body.className
      document.body.className = current === 'dark' ? '' : 'dark'
      localStorage.setItem('uc_theme_class', document.body.className)
    }
  })

  // ? key opens shortcuts panel (not inside input)
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
    { path: '/settings', icon: '⚙️', label: 'Settings' }
  ]

  return (
    <>
      <JSONLD />
      <CommandBar open={commandBarOpen} onClose={() => setCommandBarOpen(false)} onConvert={handleCommandConvert} />
      <ShortcutsPanel open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <FloatingTools />
      {aiAssistantOpen && <AIAssistant onClose={() => setAiAssistantOpen(false)} />}
      <OnboardingTour />
      <InstallPWA />

      <AmbientBackground />
      <div className="flex min-h-screen" style={{ background: 'transparent' }} ref={mainRef}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} mode={mode} onModeChange={setMode} onApplyPair={handleApplyPair} />

        <div className="flex-1 flex flex-col min-h-screen">
          {/* Minimal header: Logo, Search, Pro badge, Hamburger */}
          <header className="sticky top-0 z-30 glass border-b border-[var(--border)]">
            <div className="flex items-center gap-2 px-4 py-2 max-w-4xl mx-auto">
              <button onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-xl hover:bg-[var(--border)] interact-lift" aria-label="Open sidebar">☰</button>

              {/* Studio logo */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-[8px] font-bold shadow-sm shadow-[var(--primary)]/30">NX</div>
                <div className="hidden sm:flex items-center gap-1">
                  <span className="font-semibold text-xs">NumanX</span>
                  <span className="px-1 py-0.5 rounded text-[6px] font-semibold uppercase tracking-widest bg-[var(--primary)]/20 text-[var(--primary)]">Studio</span>
                </div>
              </div>

              {/* Search bar */}
              <div className="flex-1 relative max-w-xs">
                <input
                  type="text" value={searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder="Search categories & units..."
                  className="w-full px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card2)] text-sm outline-none focus:border-[var(--primary)] transition-all focus:shadow-[0_0_0_3px_var(--glow)]"
                  aria-label="Search"
                />
                <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] opacity-40 pointer-events-none">⌘K</kbd>
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(''); setSearchResults([]) }}
                    className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[var(--text3)]/20 flex items-center justify-center text-[7px] opacity-40 hover:opacity-100 transition-opacity"
                    aria-label="Clear search">
                    ✕
                  </button>
                )}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 glass rounded-xl overflow-hidden shadow-lg z-50 max-h-60 overflow-y-auto" role="listbox">
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

              {/* Empty spacer — header kept minimal */}
              <div className="flex items-center gap-1" />
            </div>
          </header>

          {/* Install PWA banner */}
          <div className="max-w-4xl mx-auto w-full pt-1">
            <InstallPWA />
          </div>

          {/* Main content with Suspense fallback */}
          <main className={`flex-1 p-4 max-w-4xl mx-auto w-full ${mode === 'fast' ? 'pt-8' : ''}`}>
            <ErrorBoundary>
              <AnimatePresence mode="wait">
                <Suspense fallback={<SkeletonPage />}>
                  <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                  >
                    <Routes location={location}>
                      <Route path="/" element={<Home mode={mode} />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/categories" element={<Categories />} />
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
                    </Routes>
                  </motion.div>
                </Suspense>
              </AnimatePresence>
            </ErrorBoundary>
          </main>

          {/* Mobile bottom nav */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 glass border-t border-[var(--border)] px-2 py-1 safe-area-bottom">
            <div className="flex justify-around">
              {navItems.map(item => {
                const isActive = location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path))
                return (
                  <NavLink key={item.path} to={item.path}
                    className={`p-2 rounded-xl text-lg transition-all interact-lift flex flex-col items-center gap-0.5 relative ${
                      isActive ? 'text-[var(--primary)]' : 'hover:bg-[var(--border)] opacity-50'
                    }`}
                    aria-label={item.label}>
                    <span>{item.icon}</span>
                    {isActive && (
                      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[var(--primary)]" />
                    )}
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
