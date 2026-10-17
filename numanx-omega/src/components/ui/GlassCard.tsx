import { motion } from 'framer-motion'

type CardVariant = 'default' | 'elevated' | 'interactive' | 'bordered'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  variant?: CardVariant
  glow?: boolean
  hover?: boolean
  delay?: number
  onClick?: () => void
}

const variantStyles: Record<CardVariant, string> = {
  default: 'glass rounded-2xl p-4',
  elevated: 'glass rounded-2xl p-5 shadow-lg',
  interactive: 'glass rounded-2xl p-4 cursor-pointer card-enhanced',
  bordered: 'glass rounded-2xl p-4 border-l-4',
}

export default function GlassCard({ children, className = '', variant = 'default', glow, hover, delay = 0, onClick }: GlassCardProps) {
  const base = variantStyles[variant] || variantStyles.default
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      whileHover={hover ? { y: -2, transition: { duration: 0.15 } } : undefined}
      onClick={onClick}
      className={`${base} ${glow ? 'animate-glow' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  )
}
