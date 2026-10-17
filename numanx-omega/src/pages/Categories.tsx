import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import SEOHead from '../components/ui/SEOHead'
import { getAllCategories, convert } from '../engine/converter'
import { fmt } from '../utils/numbers'
import { useTilt } from '../hooks/useTilt'
import type { CategoryDef } from '../types'

function TiltCard({ cat, index, onClick }: { cat: CategoryDef; index: number; onClick: () => void }) {
  const { ref, style } = useTilt<HTMLDivElement>(10)
  const [showQuick, setShowQuick] = useState(false)
  const [quickVal, setQuickVal] = useState('')
  const [quickResult, setQuickResult] = useState<number | null>(null)
  const quickRef = useRef<HTMLDivElement>(null)
  const previewVal = useMemo(() => cat.un.length >= 2 ? convert(1, cat.id, cat.un[0].id, cat.un[1].id) : null, [cat])

  useEffect(() => {
    if (!showQuick) return
    const handler = (e: MouseEvent) => {
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) setShowQuick(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showQuick])

  const handleQuick = (val: string) => {
    setQuickVal(val)
    const v = parseFloat(val)
    if (!isNaN(v) && cat.un.length >= 2) {
      setQuickResult(convert(v, cat.id, cat.un[0].id, cat.un[1].id))
    } else {
      setQuickResult(null)
    }
  }

  return (
    <motion.div
      ref={ref}
      style={style}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.03, type: 'spring', stiffness: 180, damping: 22 }}
      className="glass rounded-2xl overflow-hidden cursor-pointer group will-change-transform relative"
      onClick={onClick}
    >
      <div className="h-1.5" style={{ background: cat.cl || '#7c6fff' }} />
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-3xl group-hover:scale-110 transition-transform duration-300" aria-hidden="true">{cat.ic}</span>
          <span className="text-xs opacity-40">{cat.un.length} units</span>
        </div>
        <div className="font-semibold text-sm mb-1">{cat.lb}</div>

        <div className="text-[10px] opacity-50 space-y-0.5">
          {cat.un.slice(0, 3).map(u => {
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
          {cat.un.slice(0, 4).map(u => (
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

        {/* Quick convert preview on hover */}
        {showQuick && (
          <div ref={quickRef} className="mt-2 pt-2 border-t border-[var(--border)]" onClick={e => e.stopPropagation()}>
            <input type="text" value={quickVal} onChange={e => handleQuick(e.target.value)}
              placeholder="Type a value..."
              className="w-full p-1.5 rounded-lg border border-[var(--border)] bg-[var(--card2)] text-xs outline-none focus:border-[var(--primary)] transition-colors"
              autoFocus
            />
            {quickResult !== null && (
              <div className="text-[10px] mt-1 font-medium text-[var(--primary)] text-center">
                {quickVal} {cat.un[0]?.lb} = {fmt(quickResult, 4)} {cat.un[1]?.lb}
              </div>
            )}
          </div>
        )}
      </div>
      <button onClick={e => { e.stopPropagation(); setShowQuick(!showQuick) }}
        className="absolute top-2 right-2 w-5 h-5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-[9px] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--primary)] hover:text-white"
        aria-label={showQuick ? 'Hide quick convert' : 'Quick convert'}>
        {showQuick ? '✕' : '⚡'}
      </button>
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
      <SEOHead title="All Conversion Categories — 30+ Unit Types" description="Browse all 30+ conversion categories from length and mass to currency and crypto. Each category includes multiple units with metric, imperial, and scientific options." path="/categories" />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
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
            onClick={() => navigate('/convert/' + cat.id)}
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
