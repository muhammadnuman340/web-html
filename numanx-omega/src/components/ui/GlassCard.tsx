import { motion } from 'framer-motion'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  glow?: boolean
  hover?: boolean
  delay?: number
  onClick?: () => void
}

export default function GlassCard({ children, className = '', glow, hover, delay = 0, onClick }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      whileHover={hover ? { y: -2, transition: { duration: 0.15 } } : undefined}
      onClick={onClick}
      className={`glass rounded-2xl p-4 ${glow ? 'animate-glow' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  )
}
