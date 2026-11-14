import { useState, useMemo, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SEOHead from '../components/ui/SEOHead'
import { PAGE_META } from '../config/pageMeta'
import { getAllCategories, convert } from '../engine/converter'
import { fmt } from '../utils/numbers'
import { useTilt } from '../hooks/useTilt'
import { buildCategoriesDirectorySchema } from '../config/schema'
import { categoryContent } from '../engine/categoryContent'
import type { CategoryDef, UnitDef } from '../types'

function TiltCard({ cat, index }: { cat: CategoryDef; index: number }) {
  const { ref, style } = useTilt<HTMLDivElement>(10)
  const [showQuick, setShowQuick] = useState(false)
  const [quickVal, setQuickVal] = useState('')
  const [quickResult, setQuickResult] = useState<number | null>(null)
  const quickRef = useRef<HTMLDivElement>(null)

  // Resolve dimensionally valid pairs for display and quick convert
  const samplePairs = useMemo(() => {
    const content = categoryContent[cat.id]
    if (content?.popularPairs && content.popularPairs.length > 0) {
      const resolved: { from: UnitDef; to: UnitDef }[] = []
      for (const p of content.popularPairs.slice(0, 3)) {
        const fu = cat.un.find(u => u.lb.toLowerCase() === p.from.toLowerCase() || u.id.toLowerCase() === p.from.toLowerCase())
          || cat.un.find(u => u.al?.some(a => a.toLowerCase() === p.from.toLowerCase()))
        const tu = cat.un.find(u => u.lb.toLowerCase() === p.to.toLowerCase() || u.id.toLowerCase() === p.to.toLowerCase())
          || cat.un.find(u => u.al?.some(a => a.toLowerCase() === p.to.toLowerCase()))
        if (fu && tu && (!fu.dim || !tu.dim || fu.dim === tu.dim)) {
          resolved.push({ from: fu, to: tu })
        }
      }
      if (resolved.length > 0) return resolved
    }
    const fu = cat.un[0]
    if (!fu) return []
    const sameDimUnits = cat.un.filter(u => !fu.dim || !u.dim || u.dim === fu.dim)
    return sameDimUnits.slice(0, 3).map(u => ({ from: fu, to: u }))
  }, [cat])

  const primaryPair = samplePairs.find(p => p.from.id !== p.to.id) || samplePairs[0] || null
  const previewVal = useMemo(() => {
    if (!primaryPair) return null
    return convert(1, cat.id, primaryPair.from.id, primaryPair.to.id)
  }, [cat, primaryPair])

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
    if (!isNaN(v) && primaryPair) {
      setQuickResult(convert(v, cat.id, primaryPair.from.id, primaryPair.to.id))
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

        <div className="text-xs text-[var(--text2)] opacity-80 space-y-0.5">
          {samplePairs.map(pair => {
            const pv = convert(1, cat.id, pair.from.id, pair.to.id)
            return (
              <div key={`${pair.from.id}-${pair.to.id}`} className="flex justify-between">
                <span>1 {pair.from.lb}</span>
                <span>= {pv !== null ? fmt(pv, 2) : '—'} {pair.to.lb}</span>
              </div>
            )
          })}
        </div>

        <div className="flex gap-1 flex-wrap mt-3">
          {cat.un.slice(0, 4).map(u => (
            <span key={u.id} className="px-1.5 py-0.5 rounded text-xs bg-[var(--border)] text-[var(--text2)] font-medium">
              {u.lb}
            </span>
          ))}
          {cat.un.length > 4 && (
            <span className="px-1.5 py-0.5 rounded text-xs bg-[var(--border)] text-[var(--text2)] opacity-70">
              +{cat.un.length - 4}
            </span>
          )}
        </div>

        {previewVal !== null && primaryPair && (
          <div className="mt-2 pt-2 border-t border-[var(--border)] text-xs text-[var(--text2)] opacity-80 flex items-center justify-between">
            <span>1 {primaryPair.from.lb}</span>
            <span>≈ {fmt(previewVal, 2)} {primaryPair.to.lb}</span>
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
            placeholder={`Value in ${primaryPair?.from.lb || cat.un[0]?.lb}...`}
            className="w-full p-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--text)] outline-none focus:border-[var(--primary)] transition-colors"
            autoFocus
            aria-label={`Quick convert value in ${primaryPair?.from.lb || cat.un[0]?.lb}`}
          />
          {quickResult !== null && (
            <div className="text-xs mt-2 font-medium text-[var(--primary)] text-center">
              {quickVal} {primaryPair?.from.lb} = {fmt(quickResult, 4)} {primaryPair?.to.lb}
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
  const categoriesSchema = useMemo(() => buildCategoriesDirectorySchema(cats), [cats])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <SEOHead
        {...PAGE_META['/categories']}
        path="/categories"
        schema={categoriesSchema}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold page-header text-[var(--text)] flex items-center gap-2"><span role="img" aria-hidden="true">📂</span> All Conversion Categories</h1>
          <p className="text-xs text-[var(--text2)] opacity-80 mt-0.5">
            {cats.length} dedicated calculators · {totalUnits} precision units
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
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Categories</div>
        </div>
        <div className="glass rounded-xl p-2.5">
          <div className="font-bold text-lg text-[var(--primary)]">{totalUnits}</div>
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Units</div>
        </div>
        <div className="glass rounded-xl p-2.5">
          <div className="font-bold text-lg text-[var(--primary)]">{cats.filter(c => c.sp).length}</div>
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Interactive Tools</div>
        </div>
        <div className="glass rounded-xl p-2.5">
          <div className="font-bold text-lg text-[var(--primary)]">100%</div>
          <div className="text-xs text-[var(--text2)] opacity-80 font-medium">Client-Side</div>
        </div>
      </motion.div>
    </motion.div>
  )
}
