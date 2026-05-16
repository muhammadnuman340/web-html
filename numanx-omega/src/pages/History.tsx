import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { fmt } from '../utils/numbers'
import { getHistory, clearHistory, removeHistoryEntry, searchHistory, exportAllData } from '../services/storage'

export default function History() {
  const [history, setHistory] = useState<{ cat: string; fv: number; fu: string; tv: number; tu: string; t: number }[]>([])
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline')
  const navigate = useNavigate()

  const loadHistory = useCallback(async () => {
    if (search.trim()) {
      const results = await searchHistory(search)
      setHistory(results)
    } else {
      try { setHistory(JSON.parse(localStorage.getItem('uc_hist') || '[]')) } catch { /* ignore */ }
    }
  }, [search])

  useEffect(() => { loadHistory() }, [loadHistory])

  const clear = async () => {
    await clearHistory()
    setHistory([])
    localStorage.setItem('uc_hist', '[]')
  }

  const remove = async (t: number) => {
    const next = history.filter(h => h.t !== t)
    setHistory(next)
    localStorage.setItem('uc_hist', JSON.stringify(next))
  }

  const handleExport = async () => {
    const data = await exportAllData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `nx-cos-export-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Group history by day
  const grouped = history.reduce((acc: Record<string, typeof history>, h) => {
    const day = new Date(h.t).toLocaleDateString()
    if (!acc[day]) acc[day] = []
    acc[day].push(h)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-bold">📜 History Timeline</h2>
        <div className="flex gap-1">
          <button onClick={() => setViewMode(viewMode === 'timeline' ? 'list' : 'timeline')}
            className="px-3 py-1.5 rounded-xl text-xs bg-[var(--card2)] hover:bg-[var(--border)] interact-lift">
            {viewMode === 'timeline' ? '📋 List' : '⏱ Timeline'}
          </button>
          <button onClick={handleExport}
            className="px-3 py-1.5 rounded-xl text-xs bg-[var(--card2)] hover:bg-[var(--border)] interact-lift">
            📤 Export
          </button>
          {history.length > 0 && (
            <button onClick={clear} className="px-3 py-1.5 rounded-xl text-xs text-red-500 hover:bg-red-500/10 interact-lift">
              🗑 Clear
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search history..."
          className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card2)] text-sm outline-none focus:border-[var(--primary)] transition-colors"
        />
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16 opacity-50">
          <div className="text-5xl mb-4 animate-float">📜</div>
          <p className="text-sm">Your conversion history will appear here</p>
          <p className="text-xs mt-1 opacity-60">Start converting to build your timeline</p>
        </div>
      ) : viewMode === 'timeline' ? (
        /* Timeline View */
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-[var(--border)]" />
          {Object.entries(grouped).map(([day, entries]) => (
            <div key={day} className="ml-10 mb-6 relative">
              {/* Day node */}
              <div className="absolute -left-[34px] top-1 w-3 h-3 rounded-full bg-[var(--primary)] border-2 border-[var(--bg)] animate-glow" />
              <div className="text-xs font-semibold mb-2 opacity-60">{day}</div>
              <div className="space-y-1">
                {entries.map(h => (
                  <motion.div key={h.t} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-2.5 rounded-xl glass hover:shadow-md cursor-pointer transition-all interact-lift"
                    onClick={() => navigate(`/converter?cat=${h.cat}`)}>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xs opacity-40">{new Date(h.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="font-medium">{fmt(h.fv)} {h.fu}</span>
                      <span className="opacity-40">→</span>
                      <span className="font-medium">{fmt(h.tv)} {h.tu}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--border)] opacity-60">{h.cat}</span>
                    </div>
                    <button onClick={e => { e.stopPropagation(); remove(h.t) }}
                      className="text-xs opacity-30 hover:opacity-100 hover:text-red-500 p-1">✕</button>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-0.5">
          {history.map(h => (
            <motion.div key={h.t} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center justify-between p-2.5 rounded-xl glass hover:shadow-md cursor-pointer transition-all interact-lift"
              onClick={() => navigate(`/converter?cat=${h.cat}`)}>
              <span className="text-sm">
                <span className="font-medium">{fmt(h.fv)} {h.fu}</span>
                <span className="opacity-40 mx-1">=</span>
                <span className="font-medium">{fmt(h.tv)} {h.tu}</span>
                <span className="text-xs opacity-40 ml-2">({h.cat})</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] opacity-30">{new Date(h.t).toLocaleTimeString()}</span>
                <button onClick={e => { e.stopPropagation(); remove(h.t) }} className="text-xs opacity-30 hover:opacity-100 hover:text-red-500 p-1">✕</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <div className="text-center text-xs opacity-40 py-2">{history.length} total entries</div>
      )}
    </div>
  )
}
