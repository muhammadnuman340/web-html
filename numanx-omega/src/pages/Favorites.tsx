import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import SEOHead from '../components/ui/SEOHead'
import { groupFavorites, removeFavorite } from '../services/storage'

export default function Favorites() {
  const [groups, setGroups] = useState<Record<string, { cat: string; from: string; to: string }[]>>({})
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const navigate = useNavigate()

  const loadGroups = useCallback(async () => {
    const g = await groupFavorites()
    setGroups(g)
  }, [])

  useEffect(() => { loadGroups() }, [loadGroups])

  const remove = async (groupKey: string, index: number) => {
    const entry = groups[groupKey]?.[index]
    if (entry) {
      await removeFavorite(index)
      await loadGroups()
      // Also update localStorage
      try {
        const favs = JSON.parse(localStorage.getItem('uc_fav') || '[]')
        const i = favs.findIndex((f: any) => f.cat === entry.cat && f.from === entry.from && f.to === entry.to)
        if (i >= 0) { favs.splice(i, 1); localStorage.setItem('uc_fav', JSON.stringify(favs)) }
      } catch { /* ignore */ }
    }
  }

  const groupIcons: Record<string, string> = { Math: '🔢', Currency: '💵', Science: '🔬', Custom: '⭐' }
  const groupColors: Record<string, string> = { Math: '#6c63ff', Currency: '#2ecc71', Science: '#9b59b6', Custom: '#f39c12' }

  const allFavs = Object.values(groups).flat()

  return (
    <div className="space-y-4">
      <SEOHead title="Favorites — Saved Conversions" description="Access your saved unit conversions organized by category. Star your most-used conversions for quick access." path="/favorites" />
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">⭐ Personal Library</h2>
        <div className="flex gap-1">
          <button onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-xl text-xs interact-lift ${viewMode === 'grid' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--card2)]'}`}>
            📱 Grid
          </button>
          <button onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-xl text-xs interact-lift ${viewMode === 'list' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--card2)]'}`}>
            📋 List
          </button>
        </div>
      </div>

      {allFavs.length === 0 ? (
        <div className="text-center py-16 opacity-50">
          <div className="text-5xl mb-4 animate-float">⭐</div>
          <p className="text-sm">Pin your favorite conversions with the star button</p>
          <p className="text-xs mt-1 opacity-60">Click ☆ next to any conversion in the converter</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="space-y-6">
          {Object.entries(groups).map(([groupKey, favs]) => (
            <div key={groupKey}>
              <div className="flex items-center gap-2 mb-2">
                <span>{groupIcons[groupKey] || '⭐'}</span>
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
                      <span className="text-lg">{groupIcons[groupKey]}</span>
                      <button onClick={e => { e.stopPropagation(); remove(groupKey, i) }}
                        className="text-xs opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity p-1">✕</button>
                    </div>
                    <div className="mt-2">
                      <span className="font-medium text-sm">{f.from}</span>
                      <span className="opacity-40 mx-1 text-xs">→</span>
                      <span className="font-medium text-sm">{f.to}</span>
                    </div>
                    <div className="text-[10px] opacity-40 mt-1">{f.cat}</div>
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
                    className="text-xs opacity-30 hover:opacity-100 hover:text-red-500 p-1">✕</button>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
