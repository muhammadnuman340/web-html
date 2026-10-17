import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import SmartSuggestions from '../widgets/SmartSuggestions'
import { MODES } from '../widgets/ModeSwitcher'
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

const NAV_CATEGORIES = [
  { path: '/convert/length', icon: '📏', label: 'Length' },
  { path: '/convert/mass', icon: '⚖️', label: 'Mass & Weight' },
  { path: '/convert/temp', icon: '🌡️', label: 'Temperature' },
  { path: '/convert/data', icon: '💾', label: 'Data Storage' },
  { path: '/convert/speed', icon: '🏎️', label: 'Speed' },
  { path: '/convert/cooking', icon: '🍳', label: 'Cooking' },
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
  { path: '/sitemap', icon: '🗺️', label: 'Sitemap' },
  { path: '/settings', icon: '⚙️', label: 'Settings' },
]

const sidebarVariants = {
  open: { x: 0, transition: { type: 'spring', damping: 28, stiffness: 260 } },
  closed: { x: '-100%', transition: { type: 'spring', damping: 30, stiffness: 300 } },
}

const backdropVariants = {
  open: { opacity: 1, transition: { duration: 0.2 } },
  closed: { opacity: 0, transition: { duration: 0.2 } },
}

export default function Sidebar({ open, onClose, mode, onModeChange, onApplyPair }: Props) {
  const location = useLocation()
  const navigate = useNavigate()
  const [showModePicker, setShowModePicker] = useState(false)

  const navItem = (item: { path: string; icon: string; label: string }) => {
    const active = location.pathname === item.path
    return (
      <motion.button
        key={item.path}
        whileTap={{ scale: 0.97 }}
        onClick={() => { navigate(item.path); onClose() }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all relative ${
          active ? 'bg-[var(--primary)] text-white shadow-md' : 'hover:bg-[var(--border)]'
        }`}
      >
        <span className="text-base" aria-hidden="true">{item.icon}</span>
        <span>{item.label}</span>
      </motion.button>
    )
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="sidebar-backdrop"
          variants={backdropVariants}
          initial="closed"
          animate="open"
          exit="closed"
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <motion.aside
        key="sidebar-panel"
        variants={sidebarVariants}
        initial="closed"
        animate={open ? 'open' : 'closed'}
        exit="closed"
        className="fixed top-0 left-0 h-full w-64 z-50 glass p-4 overflow-y-auto"
      >
        {/* Logo + close */}
        <div className="flex items-center justify-between mb-6 mt-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-[var(--glow)]">NX</div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm">NumanX</span>
                <span className="px-1 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-[var(--primary-muted)] text-[var(--primary)]">Studio</span>
              </div>
              <div className="text-xs opacity-50 tracking-wide">Omega X Converter</div>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[var(--border)] text-sm interact-lift"
            aria-label="Close sidebar"
          >
            ✕
          </motion.button>
        </div>

        {/* Mode selector */}
        <div className="relative mb-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowModePicker(!showModePicker)}
            aria-expanded={showModePicker}
            aria-haspopup="listbox"
            aria-label="Select converter mode"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl glass hover:bg-[var(--border)] transition-all text-sm"
          >
            <span aria-hidden="true">{MODES.find(m => m.id === mode)?.icon}</span>
            <span className="flex-1 text-left font-medium">{MODES.find(m => m.id === mode)?.label}</span>
            <span className="text-xs opacity-50">{showModePicker ? '▲' : '▼'}</span>
          </motion.button>
          <AnimatePresence>
            {showModePicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden rounded-xl border border-[var(--border)] mt-1 bg-[var(--card2)]"
              >
                {MODES.filter(m => m.id !== mode).map(m => (
                  <button key={m.id} onClick={() => { onModeChange(m.id); setShowModePicker(false) }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-[var(--border)] transition-colors flex items-center gap-2">
                    <span aria-hidden="true">{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main nav */}
        <div className="mb-3">
          <div className="text-xs uppercase tracking-wider text-[var(--text2)] opacity-70 px-3 mb-1.5 font-semibold">Main</div>
          <nav aria-label="Main navigation" className="space-y-0.5">{NAV_MAIN.map(navItem)}</nav>
        </div>

        {/* Top Categories */}
        <div className="mb-3">
          <div className="flex items-center justify-between px-3 mb-1.5">
            <span className="text-xs uppercase tracking-wider text-[var(--text2)] opacity-70 font-semibold">Top Categories</span>
            <button
              onClick={() => { navigate('/categories'); onClose() }}
              className="text-xs text-[var(--primary)] hover:underline font-medium"
              aria-label="View all categories"
            >
              All →
            </button>
          </div>
          <nav aria-label="Top categories navigation" className="space-y-0.5">
            {NAV_CATEGORIES.map(navItem)}
          </nav>
        </div>

        {/* Features */}
        <div className="mb-3">
          <div className="text-xs uppercase tracking-wider text-[var(--text2)] opacity-70 px-3 mb-1.5 font-semibold">Features</div>
          <nav aria-label="Feature shortcuts" className="space-y-0.5">{NAV_FEATURES.map(navItem)}</nav>
        </div>

        {/* Tools */}
        <div className="mb-3">
          <div className="text-xs uppercase tracking-wider text-[var(--text2)] opacity-70 px-3 mb-1.5 font-semibold">Tools</div>
          <nav aria-label="Utility and secondary tools" className="space-y-0.5">{NAV_SECONDARY.map(navItem)}</nav>
        </div>

        {/* Smart Insights */}
        <div className="mb-3 px-3">
          <SmartSuggestions visible={true} onApplyPair={onApplyPair} />
        </div>

        <div className="mt-4 px-3">
          <AdSense slot="3115913228" format="auto" />
        </div>
        <div className="mt-auto pt-4 text-center text-xs text-[var(--text2)] opacity-70">
          NumanX Studios &copy; 2026
        </div>
      </motion.aside>
    </AnimatePresence>
  )
}
