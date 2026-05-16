import { useState, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import UniversalConverter from '../components/converter/UniversalConverter'
import CurrencyCenter from '../components/charts/CurrencyCenter'
import CryptoConverter from '../pages/Crypto'
import GlassCard from '../components/ui/GlassCard'
import { getAllCategories } from '../engine/converter'
import { useHistory } from '../hooks/useHistory'
import { analytics } from '../engine/analytics'
import { fmt } from '../utils/numbers'
import { getAllChains } from '../engine/conversionChains'

const TABS = [
  { id: 'convert', icon: '🔄', label: 'Convert' },
  { id: 'currency', icon: '💵', label: 'Currency' },
  { id: 'crypto', icon: '₿', label: 'Crypto' },
  { id: 'health', icon: '❤️', label: 'Health' },
  { id: 'chains', icon: '⛓', label: 'Chains' },
  { id: 'insights', icon: '📊', label: 'Insights' },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('convert')
  const { history, addEntry } = useHistory()
  const navigate = useNavigate()
  const cats = getAllCategories()
  const summary = analytics.getSummary()
  const chains = getAllChains()

  const handleHistoryAdd = useCallback((cat: string, fv: number, fu: string, tv: number, tu: string) => {
    try {
      const h = JSON.parse(localStorage.getItem('uc_hist') || '[]')
      h.unshift({ cat, fv, fu, tv, tu, t: Date.now() })
      if (h.length > 100) h.length = 100
      localStorage.setItem('uc_hist', JSON.stringify(h))
    } catch { /* ignore */ }
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">📊 OS Control Center</h2>
        <div className="flex items-center gap-2 text-xs">
          <span className="opacity-40">{summary.totalConversions} total</span>
          <span className="px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[10px]">
            Score: {analytics.getProductivityScore()}%
          </span>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all interact-lift ${activeTab === tab.id ? 'glass font-semibold' : 'opacity-50 hover:opacity-100'}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          {activeTab === 'convert' && (
            <GlassCard><UniversalConverter onHistoryAdd={handleHistoryAdd} /></GlassCard>
          )}
          {activeTab === 'currency' && (
            <GlassCard><CurrencyCenter /></GlassCard>
          )}
          {activeTab === 'crypto' && (
            <GlassCard><CryptoConverter /></GlassCard>
          )}
          {activeTab === 'health' && <HealthTab />}
          {activeTab === 'chains' && <ChainsTab chains={chains} navigate={navigate} />}
          {activeTab === 'insights' && <InsightsTab summary={summary} analytics={analytics} />}
        </motion.div>
      </AnimatePresence>

      {/* Quick stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <GlassCard onClick={() => navigate('/categories')}>
          <div className="text-lg font-bold">{cats.length}</div>
          <div className="text-xs opacity-50">Categories</div>
        </GlassCard>
        <GlassCard onClick={() => navigate('/history')}>
          <div className="text-lg font-bold">{history.length}</div>
          <div className="text-xs opacity-50">Conversions</div>
        </GlassCard>
        <GlassCard onClick={() => navigate('/favorites')}>
          <div className="text-lg font-bold">
            {JSON.parse(localStorage.getItem('uc_fav') || '[]').length}
          </div>
          <div className="text-xs opacity-50">Favorites</div>
        </GlassCard>
        <GlassCard onClick={() => navigate('/settings')}>
          <div className="text-lg font-bold">⚙️</div>
          <div className="text-xs opacity-50">Settings</div>
        </GlassCard>
      </div>

      {/* Productivity score */}
      {summary.totalConversions > 0 && (
        <GlassCard>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide opacity-60">📈 Productivity Score</span>
            <span className="text-xs font-bold" style={{ color: analytics.getProductivityScore() > 80 ? 'var(--primary)' : analytics.getProductivityScore() > 50 ? 'var(--accent)' : 'inherit' }}>
              {analytics.getProductivityScore()}%
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-[var(--border)]">
            <div className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] transition-all duration-500"
              style={{ width: `${Math.min(100, analytics.getProductivityScore())}%` }} />
          </div>
          <div className="flex justify-between text-[10px] opacity-40 mt-1">
            <span>Most used: {summary.mostUsedCategory}</span>
            <span>Peak day: {summary.peakDay}</span>
            <span>Pairs: {Object.keys(summary.unitPairs).length}</span>
          </div>
        </GlassCard>
      )}

      {/* Live conversion stream */}
      {history.length > 0 && (
        <GlassCard>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide opacity-60">📜 Live Conversion Stream</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] opacity-40">live</span>
            </span>
          </div>
          <div className="space-y-0.5 max-h-48 overflow-y-auto">
            {history.slice(0, 8).map(h => (
              <motion.div key={h.t} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="flex justify-between text-xs p-1.5 rounded-lg hover:bg-[var(--border)] cursor-pointer interact-lift"
                onClick={() => navigate(`/converter?cat=${h.cat}`)}>
                <span>{fmt(h.fv)} {h.fu}</span>
                <span className="opacity-40 mx-1">→</span>
                <span className="font-medium">{fmt(h.tv)} {h.tu}</span>
                <span className="text-[10px] opacity-30 ml-auto">{new Date(h.t).toLocaleTimeString()}</span>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      )}

      {summary.totalConversions === 0 && (
        <div className="text-center py-8 opacity-50">
          <div className="text-4xl mb-3 animate-float">📊</div>
          <p className="text-sm">Start converting to see your dashboard come to life</p>
        </div>
      )}
    </div>
  )
}

function HealthTab() {
  const [weight, setWeight] = useState('70')
  const [height, setHeight] = useState('175')
  const [age, setAge] = useState('30')
  const [gender, setGender] = useState('male')

  const w = parseFloat(weight); const h = parseFloat(height) / 100; const a = parseFloat(age)
  const bmi = w && h ? w / (h * h) : null
  const bmr = w && h && a ? gender === 'male' ? 10 * w + 6.25 * parseFloat(height) - 5 * a + 5 : 10 * w + 6.25 * parseFloat(height) - 5 * a - 161 : null
  const bmiCategory = bmi ? (bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese') : ''

  return (
    <GlassCard>
      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wide opacity-60">❤️ Health Calculator</div>
        <div className="grid grid-cols-3 gap-2">
          <div><label className="text-xs opacity-50">Weight (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full p-2 rounded-lg border border-[var(--border)] bg-[var(--card2)] text-sm outline-none" /></div>
          <div><label className="text-xs opacity-50">Height (cm)</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full p-2 rounded-lg border border-[var(--border)] bg-[var(--card2)] text-sm outline-none" /></div>
          <div><label className="text-xs opacity-50">Age</label><input type="number" value={age} onChange={e => setAge(e.target.value)} className="w-full p-2 rounded-lg border border-[var(--border)] bg-[var(--card2)] text-sm outline-none" /></div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setGender('male')} className={`px-4 py-2 rounded-xl text-xs interact-lift ${gender === 'male' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--card2)]'}`}>Male</button>
          <button onClick={() => setGender('female')} className={`px-4 py-2 rounded-xl text-xs interact-lift ${gender === 'female' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--card2)]'}`}>Female</button>
        </div>
        {bmi && (
          <div className="text-center">
            <span className="text-3xl font-bold">{fmt(bmi, 1)}</span>
            <span className="text-sm opacity-60 ml-2">BMI</span>
            <div className={`text-xs mt-1 ${bmiCategory === 'Normal' ? 'text-green-500' : 'text-yellow-500'}`}>{bmiCategory}</div>
          </div>
        )}
        {bmr && <div className="text-center"><span className="text-2xl font-bold">{fmt(bmr, 0)}</span><span className="text-sm opacity-60 ml-2">kcal/day BMR</span></div>}
      </div>
    </GlassCard>
  )
}

function ChainsTab({ chains, navigate }: { chains: ReturnType<typeof getAllChains>; navigate: ReturnType<typeof useNavigate> }) {
  return (
    <GlassCard>
      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wide opacity-60">⛓ Cross-Category Chains</div>
        <div className="grid gap-2">
          {chains.map(chain => (
            <motion.button key={chain.id} whileHover={{ y: -2 }}
              onClick={() => navigate(`/converter`)}
              className="glass rounded-xl p-3 text-left hover:shadow-lg transition-all interact-lift">
              <div className="flex items-center gap-2">
                <span className="text-lg">{chain.icon}</span>
                <div>
                  <div className="font-semibold text-sm">{chain.label}</div>
                  <div className="text-xs opacity-50 mt-0.5">
                    {chain.links.map(l => l.catId).join(' → ')}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </GlassCard>
  )
}

function InsightsTab({ summary, analytics: _a }: { summary: ReturnType<typeof analytics.getSummary>; analytics: typeof analytics }) {
  const topCategories = Object.entries(summary.categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const topPairs = Object.entries(summary.unitPairs).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const days = Object.entries(summary.dailyCounts).sort((a, b) => a[0].localeCompare(b[0])).slice(-14)

  // Calendar heatmap data (last 7 days)
  const heatmapDays = useMemo(() => {
    const result: { day: string; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      result.push({ day: key, count: summary.dailyCounts[key] || 0 })
    }
    return result
  }, [summary.dailyCounts])

  const maxHeat = Math.max(...heatmapDays.map(d => d.count), 1)

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-2">
        <GlassCard>
          <div className="text-xl font-bold">{summary.totalConversions}</div>
          <div className="text-xs opacity-50">Total Conversions</div>
        </GlassCard>
        <GlassCard>
          <div className="text-xl font-bold">{summary.mostUsedCategory}</div>
          <div className="text-xs opacity-50">Top Category</div>
        </GlassCard>
        <GlassCard>
          <div className="text-xl font-bold">{_a.getProductivityScore()}%</div>
          <div className="text-xs opacity-50">Productivity</div>
        </GlassCard>
      </div>

      {/* Calendar heatmap */}
      {heatmapDays.length > 0 && (
        <GlassCard>
          <div className="text-xs font-semibold uppercase tracking-wide mb-2 opacity-60">📅 7-Day Activity Heatmap</div>
          <div className="flex items-end gap-1 h-20">
            {heatmapDays.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.count / maxHeat) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  className="w-full rounded-sm transition-all cursor-pointer hover:opacity-80"
                  style={{
                    height: `${(d.count / maxHeat) * 100}%`,
                    background: d.count === 0 ? 'var(--border)' :
                      `linear-gradient(to top, var(--primary), var(--accent))`,
                    opacity: 0.3 + (d.count / maxHeat) * 0.7,
                    minHeight: d.count > 0 ? '4px' : '2px'
                  }}
                />
                <span className="text-[7px] opacity-40">{d.day.slice(5)}</span>
                <span className="text-[7px] font-bold">{d.count}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Top categories with heat */}
      {topCategories.length > 0 && (
        <GlassCard>
          <div className="text-xs font-semibold uppercase tracking-wide mb-2 opacity-60">Top Categories</div>
          <div className="space-y-1">
            {topCategories.map(([cat, count], i) => {
              const maxCount = topCategories[0]?.[1] || 1
              return (
                <div key={cat} className={`flex items-center gap-2 text-xs heat-${Math.min(4, i)}`}>
                  <span className="w-20 truncate">{cat}</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden bg-[var(--border)]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxCount) * 100}%` }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      className="h-full rounded-full" style={{ background: 'var(--primary)' }} />
                  </div>
                  <span className="opacity-50">{count}</span>
                </div>
              )
            })}
          </div>
        </GlassCard>
      )}

      {/* Top pairs */}
      {topPairs.length > 0 && (
        <GlassCard>
          <div className="text-xs font-semibold uppercase tracking-wide mb-2 opacity-60">Most Used Conversions</div>
          <div className="space-y-1 text-xs">
            {topPairs.map(([pair, count], i) => (
              <div key={pair} className={`flex justify-between p-1 rounded-lg hover:bg-[var(--border)] heat-${Math.min(4, i)}`}>
                <span className="font-mono">{pair}</span>
                <span className="opacity-50">{count}x</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* 14-day activity */}
      {days.length > 0 && (
        <GlassCard>
          <div className="text-xs font-semibold uppercase tracking-wide mb-2 opacity-60">14-Day Activity</div>
          <div className="flex items-end gap-0.5 h-24">
            {days.map(([day, count]) => {
              const maxDay = Math.max(...days.map(d => d[1]), 1)
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(count / maxDay) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 50 }}
                    className="w-full rounded-sm transition-all"
                    style={{
                      height: `${(count / maxDay) * 100}%`,
                      background: 'var(--primary)',
                      opacity: 0.3 + (count / maxDay) * 0.7
                    }} />
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[var(--text)] text-[var(--bg)] text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                    {count} on {day.slice(5)}
                  </div>
                  <span className="text-[7px] opacity-40">{day.slice(5)}</span>
                </div>
              )
            })}
          </div>
        </GlassCard>
      )}

      {summary.totalConversions === 0 && (
        <div className="text-center py-12 opacity-50">
          <div className="text-4xl mb-3 animate-float">📊</div>
          <p className="text-sm">Start converting to see analytics insights</p>
        </div>
      )}
    </div>
  )
}
