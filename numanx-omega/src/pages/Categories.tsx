import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getAllCategories, convert } from '../engine/converter'
import { fmt } from '../utils/numbers'
import { useTilt } from '../hooks/useTilt'

function TiltCard({ cat, index, onClick }: { cat: any; index: number; onClick: () => void }) {
  const { ref, style } = useTilt<HTMLDivElement>(10)
  const [previewVal, setPreviewVal] = useState<number | null>(null)

  useState(() => {
    if (cat.un.length >= 2) {
      setPreviewVal(convert(1, cat.id, cat.un[0].id, cat.un[1].id))
    }
  })

  return (
    <motion.div
      ref={ref}
      style={style}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.03, type: 'spring', stiffness: 180, damping: 22 }}
      className="glass rounded-2xl overflow-hidden cursor-pointer group will-change-transform"
      onClick={onClick}
    >
      <div className="h-1.5" style={{ background: cat.cl || '#6c63ff' }} />
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{cat.ic}</span>
          <span className="text-xs opacity-40">{cat.un.length} units</span>
        </div>
        <div className="font-semibold text-sm mb-1">{cat.lb}</div>

        <div className="text-[10px] opacity-50 space-y-0.5">
          {cat.un.slice(0, 3).map((u: any, ui: number) => {
            const pv = convert(1, cat.id, cat.un[0]?.id || u.id, u.id)
            return (
              <div key={u.id} className="flex justify-between">
                <span>1 {cat.un[0]?.lb}</span>
                <span>= {pv !== null ? fmt(pv, 2) : '—'} {u.lb}</span>
              </div>
            )
          })}
        </div>

        <div className="flex gap-1 flex-wrap mt-3">
          {cat.un.slice(0, 4).map((u: any) => (
            <span key={u.id} className="px-1.5 py-0.5 rounded text-[9px] bg-[var(--border)] opacity-60">{u.lb}</span>
          ))}
          {cat.un.length > 4 && (
            <span className="px-1.5 py-0.5 rounded text-[9px] bg-[var(--border)] opacity-40">+{cat.un.length - 4}</span>
          )}
        </div>

        {previewVal !== null && (
          <div className="mt-2 pt-2 border-t border-[var(--border)] text-[9px] opacity-40 flex items-center justify-between">
            <span>1 {cat.un[0]?.lb}</span>
            <span>≈ {fmt(previewVal, 2)} {cat.un[1]?.lb}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function Categories() {
  const cats = useMemo(() => getAllCategories(), [])
  const navigate = useNavigate()

  const totalUnits = cats.reduce((a, c) => a + c.un.length, 0)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-lg font-bold page-header">📂 Category Wheel</h2>
        <span className="text-xs opacity-40">{cats.length} categories · {totalUnits} units</span>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {cats.map((cat, i) => (
          <TiltCard
            key={cat.id}
            cat={cat}
            index={i}
            onClick={() => navigate('/converter?cat=' + cat.id)}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-4 gap-2 text-center text-xs"
      >
        <div className="glass rounded-xl p-2">
          <div className="font-bold text-lg">{cats.length}</div>
          <div className="opacity-50">Categories</div>
        </div>
        <div className="glass rounded-xl p-2">
          <div className="font-bold text-lg">{totalUnits}</div>
          <div className="opacity-50">Units</div>
        </div>
        <div className="glass rounded-xl p-2">
          <div className="font-bold text-lg">{cats.filter(c => c.sp).length}</div>
          <div className="opacity-50">Special</div>
        </div>
        <div className="glass rounded-xl p-2">
          <div className="font-bold text-lg">∞</div>
          <div className="opacity-50">Combinations</div>
        </div>
      </motion.div>
    </motion.div>
  )
}
