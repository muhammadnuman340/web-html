import { useState, useCallback, useEffect } from 'react'
import type { HistoryEntry } from '../types'
import { getHistory, addHistory as addH, clearHistory as clearH } from '../services/storage'

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHistory().then(h => { setHistory(h); setLoading(false) })
  }, [])

  const addEntry = useCallback(async (entry: HistoryEntry) => {
    const h = await addH(entry)
    setHistory(h)
  }, [])

  const clear = useCallback(async () => {
    await clearH()
    setHistory([])
  }, [])

  const removeEntry = useCallback((t: number) => {
    setHistory(prev => {
      const next = prev.filter(x => x.t !== t)
      try { localStorage.setItem('uc_hist', JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [])

  return { history, loading, addEntry, clear, removeEntry }
}
