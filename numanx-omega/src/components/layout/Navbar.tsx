import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface NavbarProps {
  isDark: boolean
  onToggleDark: () => void
  onOpenCommandBar: () => void
  onOpenSidebar: () => void
  scrolled: boolean
}

const TOP_TOOLS = [
  { label: 'Length Converter', path: '/convert/length', icon: '📏', desc: 'Meters, feet, inches, fractions' },
  { label: 'Mass & Weight', path: '/convert/mass', icon: '⚖️', desc: 'Pounds, kilograms, grams, ounces' },
  { label: 'Temperature', path: '/convert/temp', icon: '🌡️', desc: 'Celsius, Fahrenheit, Kelvin' },
  { label: 'Speed & Velocity', path: '/convert/speed', icon: '⚡', desc: 'mph, km/h, knots, m/s' },
  { label: 'Volume & Capacity', path: '/convert/volume', icon: '🧪', desc: 'Liters, gallons, cups, fluid oz' },
  { label: 'Currency Exchange', path: '/currency', icon: '💱', desc: '160+ fiat currencies with live rates' },
  { label: 'Crypto Converter', path: '/crypto', icon: '🪙', desc: 'BTC, ETH, SOL and top 100 coins' },
  { label: 'Data Storage', path: '/convert/data', icon: '💾', desc: 'MB, GB, TB, MiB, GiB binary' },
]

export default function Navbar({
  isDark,
  onToggleDark,
  onOpenCommandBar,
  onOpenSidebar,
  scrolled
}: NavbarProps) {
  const [toolsOpen, setToolsOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setToolsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close menus on route change
  useEffect(() => {
    setToolsOpen(false)
    setMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 border-b ${
        scrolled
          ? 'bg-[var(--card)]/90 backdrop-blur-md border-[var(--border)] shadow-md'
          : 'bg-[var(--card)]/80 backdrop-blur-sm border-[var(--border)]'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo matching Image 1 */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-xl text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--card2)] transition-colors"
            aria-label="Open sidebar drawer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white text-sm font-bold shadow-sm shadow-[var(--glow)] group-hover:scale-105 transition-transform">
              <span aria-hidden="true">Ω</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-[var(--text)]">NumanX</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--primary-muted)] text-[var(--primary)]">
                Omega
              </span>
            </div>
          </Link>
        </div>

        {/* Center/Right Nav Links matching user Image 1: Tools ⌵, About, Blog */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1 sm:gap-2">
          {/* Tools Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setToolsOpen(p => !p)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                toolsOpen || location.pathname.startsWith('/convert') || location.pathname === '/categories'
                  ? 'text-[var(--primary)] bg-[var(--primary-muted)]'
                  : 'text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--card2)]'
              }`}
              aria-expanded={toolsOpen}
              aria-haspopup="true"
            >
              <span>Tools</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${toolsOpen ? 'rotate-180 text-[var(--primary)]' : 'text-[var(--text3)]'}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {toolsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 mt-2 w-72 sm:w-80 rounded-2xl p-2 bg-[var(--card)] border border-[var(--border)] shadow-xl z-50 overflow-hidden"
                >
                  <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text3)] border-b border-[var(--border)]">
                    Popular Converters
                  </div>
                  <div className="py-1 max-h-[360px] overflow-y-auto">
                    {TOP_TOOLS.map(tool => (
                      <Link
                        key={tool.path}
                        to={tool.path}
                        onClick={() => setToolsOpen(false)}
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[var(--card2)] transition-colors group"
                      >
                        <span className="text-xl p-1.5 rounded-lg bg-[var(--primary-muted)] group-hover:scale-110 transition-transform flex-shrink-0" aria-hidden="true">
                          {tool.icon}
                        </span>
                        <div>
                          <div className="text-xs font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                            {tool.label}
                          </div>
                          <div className="text-[11px] text-[var(--text3)] line-clamp-1">
                            {tool.desc}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="p-2 border-t border-[var(--border)] bg-[var(--card2)]/50 rounded-b-xl">
                    <Link
                      to="/categories"
                      onClick={() => setToolsOpen(false)}
                      className="block text-center py-1.5 text-xs font-bold text-[var(--primary)] hover:underline"
                    >
                      Browse All 24 Categories →
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* About Link */}
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'text-[var(--primary)] bg-[var(--primary-muted)] font-semibold'
                  : 'text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--card2)]'
              }`
            }
          >
            About
          </NavLink>

          {/* Blog Link */}
          <NavLink
            to="/blog"
            className={({ isActive }) =>
              `px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'text-[var(--primary)] bg-[var(--primary-muted)] font-semibold'
                  : 'text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--card2)]'
              }`
            }
          >
            Blog
          </NavLink>
        </nav>

        {/* Right Actions matching Image 1: Quick Search, Dark Mode, Get Started Button */}
        <div className="flex items-center gap-2">
          {/* Command Search Trigger (⌘K) */}
          <button
            onClick={onOpenCommandBar}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card2)] hover:bg-[var(--border)] text-xs text-[var(--text2)] transition-colors"
            aria-label="Open Command Search"
          >
            <svg className="w-3.5 h-3.5 text-[var(--text3)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--card)] text-[10px] font-mono text-[var(--text3)]">
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle Button (🌙 / ☀️) matching Image 1 */}
          <button
            onClick={onToggleDark}
            className="p-2 rounded-xl text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--card2)] transition-colors text-base"
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            data-tooltip={isDark ? 'Light Mode' : 'Dark Mode'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* Get Started / All Tools CTA Button matching Image 1 */}
          <button
            onClick={() => navigate('/categories')}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm shadow-[var(--glow)]"
          >
            Get Started
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(p => !p)}
            className="md:hidden p-2 rounded-xl text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--card2)] transition-colors"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="8" x2="20" y2="8" />
                  <line x1="4" y1="16" x2="20" y2="16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[var(--border)] bg-[var(--card)] px-4 py-4 space-y-3 shadow-lg"
          >
            <div className="flex flex-col gap-1">
              <Link
                to="/categories"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-semibold text-[var(--text)] hover:bg-[var(--card2)] transition-colors flex items-center justify-between"
              >
                <span>🛠️ All Tools & Categories</span>
                <span className="text-xs text-[var(--text3)]">24 Categories</span>
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-semibold text-[var(--text)] hover:bg-[var(--card2)] transition-colors"
              >
                ℹ️ About
              </Link>
              <Link
                to="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-semibold text-[var(--text)] hover:bg-[var(--card2)] transition-colors"
              >
                📰 Blog & Guides
              </Link>
            </div>

            <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
              <span className="text-xs text-[var(--text2)] font-medium">Theme</span>
              <button
                onClick={onToggleDark}
                className="px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card2)] text-xs font-semibold text-[var(--text)]"
              >
                {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
            </div>

            <button
              onClick={() => { navigate('/categories'); setMobileMenuOpen(false) }}
              className="w-full py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-bold shadow-sm shadow-[var(--glow)] text-center block"
            >
              Get Started →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
