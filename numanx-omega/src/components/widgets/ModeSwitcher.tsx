import { motion } from 'framer-motion'

export type AppMode = 'student' | 'engineer' | 'fast' | 'pro' | 'trader' | 'scientist'

interface Props {
  mode: AppMode
  setMode: (mode: AppMode) => void
}

export const MODES: { id: AppMode; icon: string; label: string; desc: string }[] = [
  { id: 'student', icon: '🎓', label: 'Student', desc: 'Simplified UI + explanations ON' },
  { id: 'engineer', icon: '🔧', label: 'Engineer', desc: 'Precision + formulas + advanced units' },
  { id: 'scientist', icon: '🔬', label: 'Scientist', desc: 'Constants + advanced math + accuracy' },
  { id: 'trader', icon: '💹', label: 'Trader', desc: 'Currency + crypto + fast switching' },
  { id: 'fast', icon: '⚡', label: 'Fast', desc: 'Minimal UI + instant conversion' },
  { id: 'pro', icon: '🚀', label: 'Pro', desc: 'Full dashboard + analytics + AI' },
]

export default function ModeSwitcher({ mode, setMode }: Props) {
  return (
    <div className="flex gap-1 p-1 rounded-2xl glass overflow-x-auto" style={{ background: 'var(--card2)' }}>
      {MODES.map(m => (
        <motion.button
          key={m.id}
          onClick={() => setMode(m.id)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            mode === m.id
              ? 'bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/30'
              : 'opacity-50 hover:opacity-100'
          }`}
        >
          <span>{m.icon}</span>
          <span className="hidden sm:inline">{m.label}</span>
        </motion.button>
      ))}
    </div>
  )
}
