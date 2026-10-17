import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { analytics } from '../../engine/analytics'

interface Props {
  categoryId: string
  fromUnit: string
  toUnit: string
  result: number | null
  onRepeatBatch: () => void
  onOpenQuiz: () => void
}

export default function AIQuickActions({ categoryId, result, onRepeatBatch, onOpenQuiz }: Props) {
  const actions = useMemo(() => {
    const items: { icon: string; label: string; onClick: () => void }[] = []

    if (result !== null) {
      items.push({ icon: '📋', label: 'Batch convert', onClick: onRepeatBatch })
    }

    const recent = analytics.getRecentConversions(5).filter(e => e.category === categoryId)
    if (recent.length >= 3) {
      const pair = `${recent[0].fromUnit}→${recent[0].toUnit}`
      items.push({ icon: '🔄', label: `Redo ${pair}`, onClick: () => {} })
    }

    items.push({ icon: '🧠', label: 'Quiz me', onClick: onOpenQuiz })

    return items.slice(0, 4)
  }, [categoryId, result, onRepeatBatch, onOpenQuiz])

  if (actions.length === 0) return null

  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap gap-1.5 items-center">
      <span className="text-xs opacity-50 uppercase tracking-wider mr-0.5">Actions</span>
      {actions.map((a, i) => (
        <button key={i} onClick={a.onClick}
          className="btn-chip text-xs gap-1">
          <span aria-hidden="true">{a.icon}</span>
          {a.label}
        </button>
      ))}
    </motion.div>
  )
}
