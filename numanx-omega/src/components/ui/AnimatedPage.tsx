import { motion } from 'framer-motion'

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04, delayChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 24 } },
}

const itemLeft = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 24 } },
}

const itemUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 22 } },
}

const itemScale = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 250, damping: 20 } },
}

type Variant = 'fade' | 'left' | 'up' | 'scale'

interface Props {
  children: React.ReactNode
  className?: string
  variant?: Variant
  stagger?: number
}

const variants: Record<Variant, typeof item> = {
  fade: item,
  left: itemLeft,
  up: itemUp,
  scale: itemScale,
}

export default function AnimatedPage({ children, className, stagger = 0.04 }: Omit<Props, 'variant'>) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: stagger, delayChildren: 0.08 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedItem({ children, className, variant = 'fade' }: { children: React.ReactNode; className?: string; variant?: Variant }) {
  return (
    <motion.div variants={variants[variant]} className={className}>
      {children}
    </motion.div>
  )
}
