import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { getAllCategories } from '../../engine/converter'
import { categoryIcon } from '../../config/categoryIcons'
import { Logo } from './Navbar'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const SITE_LINKS = [
  { to: '/categories', label: 'All categories' },
  { to: '/converter', label: 'Universal converter' },
  { to: '/guides', label: 'Guides' },
  { to: '/blog', label: 'Blog' },
  { to: '/about', label: 'About' },
  { to: '/settings', label: 'Settings' },
]

/** Mobile menu drawer (below the lg breakpoint). */
export default function Sidebar({ open, onClose }: SidebarProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  const categories = getAllCategories()

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close menu" tabIndex={-1} onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-[min(360px,90vw)] bg-[var(--bg)] border-l border-[var(--border)] flex flex-col">
        <div className="h-16 px-4 flex items-center justify-between border-b border-[var(--border)]">
          <Logo />
          <button ref={closeRef} type="button" onClick={onClose} className="btn-icon border-transparent" aria-label="Close menu">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto px-2 py-3" onClick={e => { if ((e.target as HTMLElement).closest('a')) onClose() }}>
          <ul className="mb-3 border-b border-[var(--border)] pb-3">
            {SITE_LINKS.map(l => (
              <li key={l.to}>
                <Link to={l.to} className="flex items-center min-h-[44px] px-3 rounded-lg font-semibold text-[var(--text)] hover:bg-[var(--card2)]">{l.label}</Link>
              </li>
            ))}
          </ul>
          <p className="px-3 pb-1 text-[13px] font-semibold text-[var(--text2)]">Categories</p>
          <ul>
            {categories.map(c => {
              const Icon = categoryIcon(c.id)
              return (
                <li key={c.id}>
                  <Link to={`/convert/${c.id}`} className="flex items-center gap-3 min-h-[44px] px-3 rounded-lg text-[var(--text)] hover:bg-[var(--card2)]">
                    <Icon size={18} className="text-[var(--text2)]" aria-hidden="true" />
                    {c.lb}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <p className="px-5 py-3 border-t border-[var(--border)] text-[13px] text-[var(--text2)]">NumanX Studio &copy; 2026</p>
      </aside>
    </div>
  )
}
