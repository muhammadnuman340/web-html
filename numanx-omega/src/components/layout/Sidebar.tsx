import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import SmartSuggestions from '../widgets/SmartSuggestions'
import ModeSwitcher, { MODES } from '../widgets/ModeSwitcher'
import AdSense from '../widgets/AdSense'
import type { AppMode } from '../widgets/ModeSwitcher'

interface Props {
  open: boolean
  onClose: () => void
  mode: AppMode
  onModeChange: (m: AppMode) => void
  onApplyPair: (from: string, to: string) => void
}

const NAV_MAIN = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/converter', icon: '🔄', label: 'Converter' },
  { path: '/categories', icon: '📂', label: 'All Categories' },
]

const NAV_FEATURES = [
  { path: '/currency', icon: '💵', label: 'Currency' },
  { path: '/crypto', icon: '₿', label: 'Crypto' },
  { path: '/calculator', icon: '🧮', label: 'Calculator' },
  { path: '/formulas', icon: '📐', label: 'Formulas' },
  { path: '/health', icon: '❤️', label: 'Health' },
  { path: '/favorites', icon: '⭐', label: 'Favorites' },
]

const NAV_SECONDARY = [
  { path: '/history', icon: '📜', label: 'History' },
  { path: '/custom-units', icon: '⚒️', label: 'Custom Units' },
  { path: '/dashboard', icon: '📊', label: 'Analytics' },
  { path: '/settings', icon: '⚙️', label: 'Settings' },
]

export default function Sidebar({ open, onClose, mode, onModeChange, onApplyPair }: Props) {
  const location = useLocation()
  const navigate = useNavigate()
  const [showModePicker, setShowModePicker] = useState(false)

  const navItem = (item: { path: string; icon: string; label: string }) => {
    const active = location.pathname === item.path
    return (
      <button key={item.path} onClick={() => { navigate(item.path); onClose() }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
          active ? 'bg-[var(--primary)] text-white shadow-md' : 'hover:bg-[var(--border)]'
        }`}>
        <span>{item.icon}</span>
        <span>{item.label}</span>
      </button>
    )
  }

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-64 z-50 glass p-4 transform transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full'
      } overflow-y-auto`}>
        {/* Logo + close */}
        <div className="flex items-center justify-between mb-6 mt-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-[10px] font-bold shadow-lg shadow-[var(--primary)]/30">NX</div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm">NumanX</span>
                <span className="px-1 py-0.5 rounded text-[7px] font-semibold uppercase tracking-wider bg-[var(--primary)]/20 text-[var(--primary)]">Studio</span>
              </div>
              <div className="text-[10px] opacity-40 tracking-wide">Omega X Converter</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-[var(--border)] text-sm interact-lift">✕</button>
        </div>

        {/* Mode selector */}
        <div className="relative mb-4">
          <button onClick={() => setShowModePicker(!showModePicker)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl glass hover:bg-[var(--border)] transition-all text-sm">
            <span>{MODES.find(m => m.id === mode)?.icon}</span>
            <span className="flex-1 text-left font-medium">{MODES.find(m => m.id === mode)?.label}</span>
            <span className="text-[9px] opacity-40">{showModePicker ? '▲' : '▼'}</span>
          </button>
          <AnimatePresence>
            {showModePicker && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden rounded-xl border border-[var(--border)] mt-1 bg-[var(--card2)]">
                {MODES.filter(m => m.id !== mode).map(m => (
                  <button key={m.id} onClick={() => { onModeChange(m.id); setShowModePicker(false); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-[var(--border)] transition-colors flex items-center gap-2">
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main nav */}
        <div className="mb-3">
          <div className="text-[9px] uppercase tracking-wider opacity-30 px-3 mb-1.5">Main</div>
          <nav className="space-y-0.5">{NAV_MAIN.map(navItem)}</nav>
        </div>

        {/* Features */}
        <div className="mb-3">
          <div className="text-[9px] uppercase tracking-wider opacity-30 px-3 mb-1.5">Features</div>
          <nav className="space-y-0.5">{NAV_FEATURES.map(navItem)}</nav>
        </div>

        {/* Tools */}
        <div className="mb-3">
          <div className="text-[9px] uppercase tracking-wider opacity-30 px-3 mb-1.5">Tools</div>
          <nav className="space-y-0.5">{NAV_SECONDARY.map(navItem)}</nav>
        </div>

        {/* Smart Insights in sidebar */}
        <div className="mb-3 px-3">
          <SmartSuggestions visible={true} onApplyPair={onApplyPair} />
        </div>

        <div className="mt-4 px-3">
          <AdSense slot="1234567890" format="rectangle" />
        </div>
        <div className="mt-auto pt-4 text-center text-xs opacity-40">
          NumanX Studios © 2026
        </div>
      </aside>
    </>
  )
}
