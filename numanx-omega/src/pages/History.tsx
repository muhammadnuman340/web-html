import { useState, useEffect, useCallback, startTransition } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import SEOHead from '../components/ui/SEOHead'
import { fmt } from '../utils/numbers'
import { getHistory as getH, clearHistory, searchHistory, exportAllData, setItem } from '../services/storage'
import type { HistoryEntry } from '../types'

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(ts).toLocaleDateString()
}

function HistoryItem({ h, onRemove }: { h: HistoryEntry; onRemove: (t: number) => void }) {
  const navigate = useNavigate()
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-2.5 rounded-xl glass hover:shadow-md cursor-pointer transition-all interact-lift group"
      onClick={() => navigate(`/converter?cat=${h.cat}`)}>
      <div className="flex items-center gap-2 text-sm min-w-0">
        <span className="text-[10px] opacity-40 font-mono shrink-0 w-10 text-right">{timeAgo(h.t)}</span>
        <span className="font-medium truncate">{fmt(h.fv)} {h.fu}</span>
        <span className="opacity-40 shrink-0">→</span>
        <span className="font-medium truncate">{fmt(h.tv)} {h.tu}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--border)] opacity-60 shrink-0">{h.cat}</span>
      </div>
      <button onClick={e => { e.stopPropagation(); onRemove(h.t) }}
        className="text-xs opacity-0 group-hover:opacity-100 hover:text-red-500 p-1 transition-all" aria-label="Remove history entry">✕</button>
    </motion.div>
  )
}

export default function History() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline')
  const navigate = useNavigate()

  const loadHistory = useCallback(async (q: string) => {
    if (q.trim()) {
      const results = await searchHistory(q)
      setHistory(results)
    } else {
      const h = await getH()
      setHistory(h)
    }
  }, [])

  useEffect(() => { startTransition(() => { loadHistory(search) }) }, [search, loadHistory])

  const handleSearch = (val: string) => {
    setSearch(val)
  }

  const clear = async () => {
    await clearHistory()
    setHistory([])
  }

  const remove = async (t: number) => {
    const next = history.filter(h => h.t !== t)
    setHistory(next)
    await setItem('history', next)
  }

  const handleExport = async () => {
    const data = await exportAllData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `nx-history-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const grouped = history.reduce((acc: Record<string, typeof history>, h) => {
    const day = new Date(h.t).toLocaleDateString()
    if (!acc[day]) acc[day] = []
    acc[day].push(h)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <SEOHead title="History — Conversion Timeline" description="View your unit conversion history with day-wise grouping, search, and export. Track all your past conversions with replay and JSON export." path="/history" />
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-bold"><span aria-hidden="true">📜</span> History Timeline</h2>
        <div className="flex gap-1">
          <button onClick={() => setViewMode(viewMode === 'timeline' ? 'list' : 'timeline')}
            className="px-3 py-1.5 rounded-xl text-xs bg-[var(--card2)] hover:bg-[var(--border)] interact-lift">
            {viewMode === 'timeline' ? <><span aria-hidden="true">📋</span> List</> : <><span aria-hidden="true">⏱</span> Timeline</>}
          </button>
          <button onClick={handleExport}
            className="px-3 py-1.5 rounded-xl text-xs bg-[var(--card2)] hover:bg-[var(--border)] interact-lift">
            <span aria-hidden="true">📤</span> Export
          </button>
          {history.length > 0 && (
            <button onClick={clear} className="px-3 py-1.5 rounded-xl text-xs text-[var(--error)] hover:bg-[var(--error)]/10 interact-lift">
              <span aria-hidden="true">🗑</span> Clear
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input value={search} onChange={e => handleSearch(e.target.value)}
          placeholder="Search history..."
          className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card2)] text-sm outline-none focus:border-[var(--primary)] transition-colors"
        />
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16 opacity-50 space-y-3">
          <div className="text-5xl mb-4 animate-float" aria-hidden="true">📜</div>
          <p className="text-sm">Your conversion history will appear here</p>
          <p className="text-xs opacity-60">Start converting to build your timeline</p>
          <button onClick={() => navigate('/converter')}
            className="inline-block px-4 py-2 rounded-xl text-xs font-medium bg-[var(--primary)] text-white hover:shadow-lg hover:shadow-[var(--glow)] transition-all interact-lift">
            Start Converting →
          </button>
        </div>
      ) : viewMode === 'timeline' ? (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-[var(--border)]" />
          {Object.entries(grouped).map(([day, entries]) => (
            <div key={day} className="ml-10 mb-6 relative">
              <div className="absolute -left-[34px] top-1 w-3 h-3 rounded-full bg-[var(--primary)] border-2 border-[var(--bg)] animate-glow" />
              <div className="text-xs font-semibold mb-2 opacity-60">{day}</div>
              <div className="space-y-1">
                {entries.map(h => (
                  <HistoryItem key={h.t} h={h} onRemove={remove} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-0.5">
          {history.map(h => (
            <HistoryItem key={h.t} h={h} onRemove={remove} />
          ))}
        </div>
      )}

      {history.length > 0 && (
        <div className="text-center text-xs opacity-40 py-2">{history.length} total entries</div>
      )}
    </div>
  )
}
