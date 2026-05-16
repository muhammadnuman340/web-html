import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useCurrency } from '../../hooks/useCurrency'
import { CURRENCY_LIST } from '../../engine/constants'

export default function FloatingTools() {
  const navigate = useNavigate()
  const { rates } = useCurrency()

  const tools = [
    { icon: '💱', label: 'Quick Currency', path: '/currency', badge: rates ? 'Live' : undefined },
    { icon: '🧮', label: 'Calculator', path: '/calculator' },
    { icon: '📐', label: 'Formulas', path: '/formulas' },
    { icon: '❤️', label: 'BMI', path: '/dashboard' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, type: 'spring', damping: 20 }}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-2"
    >
      {tools.map(t => (
        <button
          key={t.label}
          onClick={() => navigate(t.path)}
          className="relative w-10 h-10 rounded-xl glass flex items-center justify-center text-lg hover:scale-110 transition-transform group"
        >
          <span>{t.icon}</span>
          {t.badge && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          )}
          <span className="absolute right-full mr-2 px-2 py-0.5 rounded-lg text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--text)] text-[var(--bg)]">
            {t.label}
          </span>
        </button>
      ))}
    </motion.div>
  )
}
