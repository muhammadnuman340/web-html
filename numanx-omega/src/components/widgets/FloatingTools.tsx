import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'

const HIDE_PATHS = ['/converter', '/currency', '/crypto', '/dashboard', '/categories', '/history', '/favorites']

export default function FloatingTools() {
  const navigate = useNavigate()
  const location = useLocation()

  const hide = HIDE_PATHS.some(p => location.pathname.startsWith(p))
  if (hide) return null

  const tools = [
    { icon: '💱', label: 'Quick Currency', path: '/currency' },
    { icon: '🧮', label: 'Calculator', path: '/calculator' },
    { icon: '📐', label: 'Formulas', path: '/formulas' },
    { icon: '❤️', label: 'Health', path: '/dashboard' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ type: 'spring', damping: 20 }}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-2"
    >
      {tools.map(t => (
        <button
          key={t.label}
          onClick={() => navigate(t.path)}
          className="relative w-10 h-10 rounded-xl glass flex items-center justify-center text-lg hover:scale-110 transition-transform group"
          aria-label={t.label}
        >
          <span aria-hidden="true">{t.icon}</span>
          <span className="absolute right-full mr-2 px-2 py-0.5 rounded-lg text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--text)] text-[var(--bg)] pointer-events-none">
            {t.label}
          </span>
        </button>
      ))}
    </motion.div>
  )
}
