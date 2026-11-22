import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, Menu, Moon, Search, Sun } from 'lucide-react'
import { getAllCategories } from '../../engine/converter'
import { categoryIcon } from '../../config/categoryIcons'

interface NavbarProps {
  isDark: boolean
  onToggleDark: () => void
  onOpenCommandBar: () => void
  onOpenMenu: () => void
}

const navLink = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center min-h-[44px] px-3 rounded-lg text-[15px] font-medium transition-colors ${
    isActive ? 'text-[var(--text)] underline underline-offset-8 decoration-2 decoration-[var(--fill)]' : 'text-[var(--text2)] hover:text-[var(--text)]'
  }`

export function Logo() {
  return (
    <Link to="/" className="inline-flex items-center gap-2 min-h-[44px] shrink-0" aria-label="NumanX Omega converter home">
      <span className="w-8 h-8 rounded-lg bg-[var(--fill)] text-[var(--on-fill)] font-display font-black text-sm flex items-center justify-center" aria-hidden="true">NX</span>
      <span className="font-display font-extrabold text-lg tracking-tight text-[var(--text)]">NumanX</span>
      <span className="hidden sm:inline text-[15px] font-medium text-[var(--text2)]">Omega X</span>
    </Link>
  )
}

export default function Navbar({ isDark, onToggleDark, onOpenCommandBar, onOpenMenu }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const location = useLocation()
  const [prevPath, setPrevPath] = useState(location.pathname)
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname)
    setMenuOpen(false)
  }

  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', onClick)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const categories = getAllCategories()

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--bg)] border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Logo />

        <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1">
          <div className="relative" ref={menuRef}>
            <button
              ref={buttonRef}
              type="button"
              onClick={() => setMenuOpen(o => !o)}
              className={`inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-lg text-[15px] font-medium transition-colors ${
                menuOpen || location.pathname.startsWith('/convert') ? 'text-[var(--text)]' : 'text-[var(--text2)] hover:text-[var(--text)]'
              }`}
              aria-expanded={menuOpen}
              aria-controls="category-menu"
            >
              Categories
              <ChevronDown size={16} className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            {menuOpen && (
              <div
                id="category-menu"
                className="absolute left-1/2 -translate-x-1/2 mt-2 w-[min(880px,calc(100vw-3rem))] nx-card p-3 bg-[var(--card)]"
              >
                <ul className="grid grid-cols-3 gap-0.5">
                  {categories.map(c => {
                    const Icon = categoryIcon(c.id)
                    return (
                      <li key={c.id}>
                        <Link
                          to={`/convert/${c.id}`}
                          className="flex items-center gap-2.5 min-h-[44px] px-3 rounded-lg text-[15px] text-[var(--text)] hover:bg-[var(--card2)]"
                        >
                          <Icon size={18} className="text-[var(--text2)] shrink-0" aria-hidden="true" />
                          {c.lb}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
                <div className="border-t border-[var(--border)] mt-2 pt-2 px-3">
                  <Link to="/categories" className="inline-flex items-center min-h-[44px] text-[15px] font-semibold text-[var(--text)] hover:underline">
                    All {categories.length} categories
                  </Link>
                </div>
              </div>
            )}
          </div>
          <NavLink to="/guides" className={navLink}>Guides</NavLink>
          <NavLink to="/blog" className={navLink}>Blog</NavLink>
          <NavLink to="/about" className={navLink}>About</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenCommandBar}
            className="inline-flex items-center gap-2 min-h-[44px] min-w-[44px] justify-center px-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--text2)] hover:border-[var(--text)] hover:text-[var(--text)] transition-colors"
            aria-label="Search conversions"
          >
            <Search size={18} aria-hidden="true" />
            <span className="hidden md:inline text-[15px]">Search</span>
            <kbd className="hidden md:inline-flex">⌘K</kbd>
          </button>
          <button
            type="button"
            onClick={onToggleDark}
            className="btn-icon border-transparent"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={onOpenMenu}
            className="btn-icon border-transparent lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  )
}
