import { useState, useEffect, useCallback, startTransition } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import SEOHead from '../components/ui/SEOHead'
import { getFavorites, setItem } from '../services/storage'

export default function Favorites() {
  const [groups, setGroups] = useState<Record<string, { cat: string; from: string; to: string }[]>>({})
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const navigate = useNavigate()

  const loadGroups = useCallback(async () => {
    const favs = await getFavorites()
    const grouped: Record<string, { cat: string; from: string; to: string }[]> = { Math: [], Currency: [], Science: [], Custom: [] }
    favs.forEach(entry => {
      if (entry.cat === 'currency' || entry.cat === 'crypto') grouped.Currency.push(entry)
      else if (['length', 'mass', 'volume', 'area', 'speed', 'temp', 'time'].includes(entry.cat)) grouped.Math.push(entry)
      else if (['energy', 'force', 'pressure', 'frequency', 'density', 'astronomy'].includes(entry.cat)) grouped.Science.push(entry)
      else grouped.Custom.push(entry)
    })
    Object.keys(grouped).forEach(k => { if (grouped[k].length === 0) delete grouped[k] })
    setGroups(grouped)
  }, [])

  useEffect(() => { startTransition(() => { loadGroups() }) }, [loadGroups])

  const remove = async (groupKey: string, index: number) => {
    const entry = groups[groupKey]?.[index]
    if (!entry) return
    const favs = await getFavorites()
    const i = favs.findIndex(f => f.cat === entry.cat && f.from === entry.from && f.to === entry.to)
    if (i >= 0) {
      favs.splice(i, 1)
      await setItem('favorites', favs)
    }
    await loadGroups()
  }

  const groupIcons: Record<string, string> = { Math: '🔢', Currency: '💵', Science: '🔬', Custom: '⭐' }
  const groupColors: Record<string, string> = { Math: '#6c63ff', Currency: '#2ecc71', Science: '#9b59b6', Custom: '#f39c12' }

  const allFavs = Object.values(groups).flat()

  return (
    <div className="space-y-4">
      <SEOHead title="Favorites — Saved Conversions" description="Access your saved unit conversions organized by category. Star your most-used conversions for quick access." path="/favorites" />
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold"><span aria-hidden="true">⭐</span> Personal Library</h1>
        <div className="flex gap-1">
          <button onClick={() => setViewMode('grid')}
            className={`btn-chip text-xs ${viewMode === 'grid' ? 'active' : ''}`}>
            📱 Grid
          </button>
          <button onClick={() => setViewMode('list')}
            className={`btn-chip text-xs ${viewMode === 'list' ? 'active' : ''}`}>
            📋 List
          </button>
        </div>
      </div>

      {allFavs.length === 0 ? (
        <div className="text-center py-16 opacity-50 space-y-3">
          <div className="text-5xl mb-4 animate-float" aria-hidden="true">⭐</div>
          <p className="text-sm">Pin your favorite conversions with the star button</p>
          <p className="text-xs opacity-60">Click ☆ next to any conversion in the converter</p>
          <button onClick={() => navigate('/categories')}
            className="inline-block px-4 py-2 rounded-xl text-xs font-medium bg-[var(--primary)] text-white hover:shadow-lg hover:shadow-[var(--glow)] transition-all interact-lift">
            Browse Categories →
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="space-y-6">
          {Object.entries(groups).map(([groupKey, favs]) => (
            <div key={groupKey}>
              <div className="flex items-center gap-2 mb-2 pl-2 border-l-[3px] rounded-sm" style={{ borderColor: groupColors[groupKey] || 'var(--primary)' }}>
                <span aria-hidden="true">{groupIcons[groupKey] || '⭐'}</span>
                <span className="text-sm font-semibold">{groupKey}</span>
                <span className="text-xs opacity-40">({favs.length})</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {favs.map((f, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="glass rounded-xl p-3 hover:shadow-lg cursor-pointer group interact-lift"
                    onClick={() => navigate(`/converter?cat=${f.cat}`)}>
                    <div className="flex items-center justify-between">
                      <span className="text-lg" aria-hidden="true">{groupIcons[groupKey]}</span>
                      <button onClick={e => { e.stopPropagation(); remove(groupKey, i) }}
                         className="text-xs opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity p-1" aria-label="Remove favorite">✕</button>
                    </div>
                    <div className="mt-2">
                      <span className="font-medium text-sm">{f.from}</span>
                      <span className="opacity-40 mx-1 text-xs">→</span>
                      <span className="font-medium text-sm">{f.to}</span>
                    </div>
                    <div className="text-xs opacity-40 mt-1">{f.cat}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {Object.entries(groups).map(([groupKey, favs]) => (
            <div key={groupKey}>
              <div className="flex items-center gap-2 mb-1 mt-3 first:mt-0">
                <span>{groupIcons[groupKey]}</span>
                <span className="text-xs font-semibold opacity-60">{groupKey}</span>
              </div>
              {favs.map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-2.5 rounded-xl glass hover:shadow-md cursor-pointer transition-all interact-lift"
                  onClick={() => navigate(`/converter?cat=${f.cat}`)}>
                  <span className="text-sm">
                    <span className="font-medium">{f.from}</span>
                    <span className="opacity-40 mx-1">→</span>
                    <span className="font-medium">{f.to}</span>
                    <span className="text-xs opacity-40 ml-2">({f.cat})</span>
                  </span>
                  <button onClick={e => { e.stopPropagation(); remove(groupKey, i) }}
                     className="text-xs opacity-30 hover:opacity-100 hover:text-red-500 p-1" aria-label="Remove favorite">✕</button>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
