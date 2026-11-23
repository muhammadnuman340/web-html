import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import ErrorBoundary from './components/ui/ErrorBoundary'
import { SkeletonPage } from './components/ui/Skeleton'
import { ToastProvider } from './hooks/useToast'
import Navbar from './components/layout/Navbar'
import SiteFooter from './components/layout/SiteFooter'
import JSONLD from './components/ui/JSONLD'
import { getAllCategories } from './engine/converter'
import { CATEGORY_ROUTES } from './engine/routes'
import { useGlobalShortcuts } from './hooks/useKeyboard'
import { getTheme, setTheme } from './utils/theme'

const Home = lazy(() => import('./pages/Home'))
const Categories = lazy(() => import('./pages/Categories'))
const ConverterPage = lazy(() => import('./pages/Converter'))
const FormulaExplorer = lazy(() => import('./pages/FormulaExplorer'))
const Settings = lazy(() => import('./pages/Settings'))
const CustomUnits = lazy(() => import('./pages/CustomUnits'))
const Help = lazy(() => import('./pages/Help'))
const CategoryLanding = lazy(() => import('./pages/CategoryLanding'))
const PairLanding = lazy(() => import('./pages/PairLanding'))
const GuidesHub = lazy(() => import('./pages/GuidesHub'))
const GuidePage = lazy(() => import('./pages/GuidePage'))
const Sitemap = lazy(() => import('./pages/Sitemap'))
const Blog = lazy(() => import('./pages/Blog'))
const BlogPost = lazy(() => import('./pages/BlogPost'))
const About = lazy(() => import('./pages/About'))
const LegalPage = lazy(() => import('./pages/LegalPage'))
const NotFound = lazy(() => import('./pages/NotFound'))
const ShortcutsPanel = lazy(() => import('./components/ui/ShortcutsPanel'))
const ProPassModal = lazy(() => import('./components/monetization/ProPassModal'))
const CommandBar = lazy(() => import('./components/ui/CommandBar'))

function AppContent() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [commandBarOpen, setCommandBarOpen] = useState(false)
  // CommandBar's chunk is fetched on first open (Ctrl+K / search button) and kept mounted after.
  const [commandBarLoaded, setCommandBarLoaded] = useState(false)
  if (commandBarOpen && !commandBarLoaded) setCommandBarLoaded(true)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [isDark, setIsDark] = useState(() => getTheme() === 'dark')
  const navigate = useNavigate()
  const location = useLocation()

  // ProPassModal is mounted (and its chunk fetched) only when first requested.
  // The first open-pro-modal event is captured here and passed in so the modal
  // opens on mount; later events go to the modal's own listener.
  const [proRequest, setProRequest] = useState<{ reason?: string } | null>(null)
  useEffect(() => {
    const onOpenPro = (e: Event) => {
      const reason = (e as CustomEvent<{ reason?: string }>).detail?.reason
      setProRequest(prev => prev ?? { reason })
    }
    window.addEventListener('open-pro-modal', onOpenPro)
    return () => window.removeEventListener('open-pro-modal', onOpenPro)
  }, [])

  useEffect(() => {
    const savedFont = localStorage.getItem('uc_font') || 'inter'
    document.body.classList.remove('font-system', 'font-inter')
    document.body.classList.add(savedFont === 'system' ? 'font-system' : 'font-inter')
  }, [])

  const toggleDark = useCallback(() => {
    setIsDark(prev => {
      const next = !prev
      setTheme(next ? 'dark' : 'light')
      return next
    })
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  const handleCommandConvert = useCallback((val: number, from: string, to: string) => {
    const cat = getAllCategories().find(c => c.un.some(u => u.id === from))
    if (cat) navigate(`/converter?cat=${cat.id}&from=${from}&to=${to}&val=${val}`)
  }, [navigate])

  useGlobalShortcuts({
    onCommandBar: () => setCommandBarOpen(p => !p),
    onDarkMode: toggleDark,
  })

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '?' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        setShortcutsOpen(p => !p)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[999] focus:px-4 focus:py-2.5 focus:bg-[var(--fill)] focus:text-[var(--on-fill)] focus:rounded-xl font-semibold"
      >
        Skip to main content
      </a>
      <JSONLD />
      {commandBarLoaded && (
        <Suspense fallback={null}>
          <CommandBar open={commandBarOpen} onClose={() => setCommandBarOpen(false)} onConvert={handleCommandConvert} />
        </Suspense>
      )}
      {proRequest && (
        <Suspense fallback={null}><ProPassModal initialOpen initialReason={proRequest.reason} /></Suspense>
      )}
      {shortcutsOpen && (
        <Suspense fallback={null}>
          <ShortcutsPanel open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
        </Suspense>
      )}

      <div className="flex min-h-screen flex-col">
        <Navbar
          isDark={isDark}
          onToggleDark={toggleDark}
          onOpenCommandBar={() => setCommandBarOpen(true)}
          onOpenMenu={() => setMenuOpen(true)}
        />
        <Sidebar open={menuOpen} onClose={closeMenu} />

        <main id="main-content" tabIndex={-1} className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 min-w-0 outline-none">
          <ErrorBoundary>
            <Suspense fallback={<SkeletonPage />}>
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/converter" element={<ConverterPage />} />
                <Route path="/convert" element={<ConverterPage />} />
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
                <Route path="/formulas" element={<FormulaExplorer />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/custom-units" element={<CustomUnits />} />
                <Route path="/help" element={<Help />} />
                <Route path="/calculator" element={<ConverterPage />} />
                <Route path="/guides" element={<GuidesHub />} />
                <Route path="/guides/:slug" element={<GuidePage />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/about" element={<About />} />
                <Route path="/sitemap" element={<Sitemap />} />
                <Route path="/privacy" element={<LegalPage doc="privacy" />} />
                <Route path="/terms" element={<LegalPage doc="terms" />} />
                <Route path="/contact" element={<LegalPage doc="contact" />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>

        <SiteFooter />
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
