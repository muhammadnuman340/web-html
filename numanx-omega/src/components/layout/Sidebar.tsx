import { useLocation, useNavigate } from 'react-router-dom'
import AdContainer from '../widgets/AdContainer'
import ProBadge from '../widgets/ProBadge'

const NAV_ITEMS = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/converter', icon: '🔄', label: 'Converter' },
  { path: '/categories', icon: '📂', label: 'Categories' },
  { path: '/currency', icon: '💵', label: 'Currency' },
  { path: '/crypto', icon: '₿', label: 'Crypto' },
  { path: '/calculator', icon: '🧮', label: 'Calculator' },
  { path: '/formulas', icon: '📐', label: 'Formulas' },
  { path: '/health', icon: '❤️', label: 'Health' },
  { path: '/favorites', icon: '⭐', label: 'Favorites' },
  { path: '/history', icon: '📜', label: 'History' },
  { path: '/custom-units', icon: '⚒️', label: 'Custom Units' },
  { path: '/settings', icon: '⚙️', label: 'Settings' }
]

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-64 z-50 glass p-4 transform transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'} lg:static lg:z-auto overflow-y-auto`}>
        <div className="flex items-center gap-3 mb-6 mt-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-[10px] font-bold shadow-lg shadow-[var(--primary)]/30">NX</div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm">NumanX</span>
              <span className="px-1 py-0.5 rounded text-[7px] font-semibold uppercase tracking-wider bg-[var(--primary)]/20 text-[var(--primary)]">Studio</span>
            </div>
            <div className="text-[10px] opacity-40 tracking-wide">Omega X Converter</div>
          </div>
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); onClose() }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${active ? 'bg-[var(--primary)] text-white' : 'hover:bg-[var(--border)]'}`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
        <div className="px-3 mt-2">
          <ProBadge />
        </div>
        <AdContainer position="sidebar" />
        <div className="mt-auto pt-4 text-center text-xs opacity-40">
          NumanX Studios © 2026
        </div>
      </aside>
    </>
  )
}
