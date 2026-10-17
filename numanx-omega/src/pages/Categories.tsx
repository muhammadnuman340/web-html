import { useState, useMemo, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SEOHead from '../components/ui/SEOHead'
import { getAllCategories, convert } from '../engine/converter'
import { fmt } from '../utils/numbers'
import { useTilt } from '../hooks/useTilt'
import type { CategoryDef } from '../types'

function TiltCard({ cat, index }: { cat: CategoryDef; index: number }) {
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
      transition={{ delay: index * 0.025, type: 'spring', stiffness: 180, damping: 22 }}
      className="glass rounded-2xl overflow-hidden group will-change-transform relative border border-transparent hover:border-[var(--border)] transition-colors"
    >
      <div className="h-1.5" style={{ background: cat.cl || '#7c6fff' }} />

      <Link
        to={`/convert/${cat.id}`}
        className="block p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-b-2xl"
        aria-label={`${cat.lb} conversion calculator with ${cat.un.length} units`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-3xl group-hover:scale-110 transition-transform duration-300" role="img" aria-hidden="true">{cat.ic}</span>
          <span className="text-xs text-[var(--text2)] opacity-80 font-medium">{cat.un.length} units</span>
        </div>
        <div className="font-semibold text-sm mb-1 text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
          {cat.lb}
        </div>

        <div className="text-[11px] text-[var(--text2)] opacity-80 space-y-0.5">
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
            <span key={u.id} className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--border)] text-[var(--text2)] font-medium">
              {u.lb}
            </span>
          ))}
          {cat.un.length > 4 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--border)] text-[var(--text2)] opacity-70">
              +{cat.un.length - 4}
            </span>
          )}
        </div>

        {previewVal !== null && (
          <div className="mt-2 pt-2 border-t border-[var(--border)] text-[11px] text-[var(--text2)] opacity-80 flex items-center justify-between">
            <span>1 {cat.un[0]?.lb}</span>
            <span>≈ {fmt(previewVal, 2)} {cat.un[1]?.lb}</span>
          </div>
        )}
      </Link>

      {/* Quick convert preview popup */}
      {showQuick && (
        <div
          ref={quickRef}
          className="p-3 border-t border-[var(--border)] bg-[var(--card2)]"
          onClick={e => { e.preventDefault(); e.stopPropagation() }}
        >
          <input
            type="text"
            value={quickVal}
            onChange={e => handleQuick(e.target.value)}
            placeholder={`Value in ${cat.un[0]?.lb}...`}
            className="w-full p-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--text)] outline-none focus:border-[var(--primary)] transition-colors"
            autoFocus
            aria-label={`Quick convert value in ${cat.un[0]?.lb}`}
          />
          {quickResult !== null && (
            <div className="text-xs mt-2 font-medium text-[var(--primary)] text-center">
              {quickVal} {cat.un[0]?.lb} = {fmt(quickResult, 4)} {cat.un[1]?.lb}
            </div>
          )}
        </div>
      )}

      {/* Quick convert toggle button */}
      <button
        onClick={e => {
          e.preventDefault()
          e.stopPropagation()
          setShowQuick(!showQuick)
        }}
        className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-[var(--primary)] hover:text-white"
        aria-label={showQuick ? 'Hide quick convert' : `Quick convert for ${cat.lb}`}
      >
        <span aria-hidden="true">{showQuick ? '✕' : '⚡'}</span>
      </button>
    </motion.div>
  )
}

export default function Categories() {
  const cats = useMemo(() => getAllCategories(), [])
  const [filter, setFilter] = useState('')

  const filteredCats = useMemo(() => {
    if (!filter.trim()) return cats
    const q = filter.toLowerCase()
    return cats.filter(c =>
      c.lb.toLowerCase().includes(q) ||
      c.un.some(u => u.lb.toLowerCase().includes(q) || u.id.toLowerCase().includes(q))
    )
  }, [cats, filter])

  const totalUnits = cats.reduce((a, c) => a + c.un.length, 0)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <SEOHead
        title="All Conversion Categories — 30+ Dedicated Calculators"
        description="Browse 30+ dedicated conversion calculators. From length, mass, and temperature to currency, pressure, and energy. Each category features precision tools and live cheat sheets."
        path="/categories"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold page-header text-[var(--text)] flex items-center gap-2">
            <span role="img" aria-hidden="true">📂</span> All Conversion Categories
          </h1>
          <p className="text-xs text-[var(--text2)] opacity-80 mt-0.5">
            {cats.length} dedicated calculators · {totalUnits} precision units · Offline-ready
          </p>
        </div>

        {/* Search filter input */}
        <div className="relative w-full sm:w-64">
          <input
            type="search"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Search categories or units..."
            className="w-full px-3 py-2 pl-8 rounded-xl border border-[var(--border)] bg-[var(--card2)] text-xs text-[var(--text)] outline-none focus:border-[var(--primary)] transition-colors"
            aria-label="Filter categories and units"
          />
          <span className="absolute left-2.5 top-2.5 text-xs opacity-50" aria-hidden="true">🔍</span>
          {filter && (
            <button
              onClick={() => setFilter('')}
              className="absolute right-2.5 top-2 text-xs opacity-50 hover:opacity-100"
              aria-label="Clear filter"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {filteredCats.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-xs text-[var(--text2)]">
          No categories found matching "{filter}". Try searching for length, weight, miles, or celsius.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredCats.map((cat, i) => (
            <TiltCard
              key={cat.id}
              cat={cat}
              index={i}
            />
          ))}
        </div>
      )}

      {/* Stats footer bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-4 gap-2 text-center text-xs"
      >
        <div className="glass rounded-xl p-2.5">
          <div className="font-bold text-lg text-[var(--primary)]">{cats.length}</div>
          <div className="text-[11px] text-[var(--text2)] opacity-80 font-medium">Categories</div>
        </div>
        <div className="glass rounded-xl p-2.5">
          <div className="font-bold text-lg text-[var(--primary)]">{totalUnits}</div>
          <div className="text-[11px] text-[var(--text2)] opacity-80 font-medium">Units</div>
        </div>
        <div className="glass rounded-xl p-2.5">
          <div className="font-bold text-lg text-[var(--primary)]">{cats.filter(c => c.sp).length}</div>
          <div className="text-[11px] text-[var(--text2)] opacity-80 font-medium">Interactive Tools</div>
        </div>
        <div className="glass rounded-xl p-2.5">
          <div className="font-bold text-lg text-[var(--primary)]">100%</div>
          <div className="text-[11px] text-[var(--text2)] opacity-80 font-medium">Client-Side</div>
        </div>
      </motion.div>
    </motion.div>
  )
}
