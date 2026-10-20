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
import Navbar from './components/layout/Navbar'
import JSONLD from './components/ui/JSONLD'
import { getAllCategories } from './engine/converter'
import { CATEGORY_ROUTES } from './engine/routes'
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
const Blog = lazy(() => import('./pages/Blog'))
const BlogPost = lazy(() => import('./pages/BlogPost'))
const About = lazy(() => import('./pages/About'))

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [commandBarOpen, setCommandBarOpen] = useState(false)
  const [mode, setMode] = useLocalStorage<AppMode>('uc_mode', 'pro')
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('uc_theme_class')
    return saved === null || saved === 'dark' || saved === 'theme-cosmic' || saved === 'theme-amoled' || saved === 'theme-cyberpunk' || saved === 'theme-rgb'
  })
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
    { path: '/categories', icon: '🛠️', label: 'Tools' },
    { path: '/blog', icon: '📰', label: 'Blog' },
    { path: '/about', icon: 'ℹ️', label: 'About' },
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

      <AmbientBackground />
      <div className="flex min-h-screen" style={{ background: 'transparent' }} ref={mainRef}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} mode={mode} onModeChange={setMode} onApplyPair={handleApplyPair} />

        <div className="flex-1 flex flex-col min-h-screen">
          {/* Proper Nav matching user Image 1 */}
          <Navbar
            isDark={isDark}
            onToggleDark={toggleDark}
            onOpenCommandBar={() => setCommandBarOpen(true)}
            onOpenSidebar={() => setSidebarOpen(true)}
            scrolled={scrolled}
          />

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
                      <Route path="/converter" element={<ConverterPage mode={mode} />} />
                      <Route path="/convert" element={<ConverterPage mode={mode} />} />
                      <Route path="/convert/:category" element={<CategoryLanding />} />
                      <Route path="/category/:category" element={<CategoryLanding />} />
                      <Route path="/convert/:category/:pair" element={<PairLanding />} />
                      <Route path="/pair/:pair" element={<PairLanding />} />

                      {/* Authoritative Data-Driven Category Route Compatibility Aliases */}
                      {CATEGORY_ROUTES.flatMap(cat =>
                        cat.aliases.map(alias => (
                          <Route
                            key={alias}
                            path={alias}
                            element={<CategoryLanding categorySlug={cat.categoryId} />}
                          />
                        ))
                      )}
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
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/blog/:slug" element={<BlogPost />} />
                      <Route path="/about" element={<About />} />
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
