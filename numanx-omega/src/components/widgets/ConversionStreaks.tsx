import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const STORAGE_KEY = 'uc_streaks'

interface StreakData {
  currentStreak: number
  longestStreak: number
  lastActiveDate: string
  totalActiveDays: number
}

function loadStreaks(): StreakData {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return { currentStreak: 0, longestStreak: 0, lastActiveDate: '', totalActiveDays: 0 }
  }
}

function saveStreaks(data: StreakData) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch { /* */ }
}

function updateStreaks(): StreakData {
  const data = loadStreaks()
  const today = new Date().toISOString().slice(0, 10)
  if (data.lastActiveDate === today) return data

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  if (data.lastActiveDate === yesterday) {
    data.currentStreak++
  } else if (data.lastActiveDate !== today) {
    data.currentStreak = 1
  }
  data.lastActiveDate = today
  data.longestStreak = Math.max(data.longestStreak, data.currentStreak)
  data.totalActiveDays++
  saveStreaks(data)
  return data
}

const MILESTONES = [3, 7, 14, 21, 30, 50, 100]

export default function ConversionStreaks({ compact }: { compact?: boolean }) {
  const [data, setData] = useState<StreakData>(() => updateStreaks())

  useEffect(() => {
    setData(updateStreaks())
  }, [])

  const nextMilestone = MILESTONES.find(m => m > data.currentStreak) || MILESTONES[MILESTONES.length - 1]
  const progress = nextMilestone > 0 ? (data.currentStreak / nextMilestone) * 100 : 0

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className={data.currentStreak >= 3 ? 'text-orange-500' : 'opacity-40'}>🔥</span>
        <span className="font-semibold">{data.currentStreak}</span>
        <span className="opacity-30 text-[10px]">day streak</span>
        {data.currentStreak > 0 && data.currentStreak >= data.longestStreak && data.currentStreak >= 3 && (
          <span className="px-1 py-0.5 rounded bg-orange-500/10 text-orange-500 text-[8px]">BEST</span>
        )}
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">🔥</span>
          <span className="text-sm font-semibold">Conversion Streak</span>
        </div>
        <div className="text-[10px] opacity-40">{data.totalActiveDays} total active days</div>
      </div>

      <div className="text-center py-2">
        <div className="text-3xl font-bold">{data.currentStreak}</div>
        <div className="text-xs opacity-50">day{data.currentStreak !== 1 ? 's' : ''} streak</div>
      </div>

      {/* Progress to next milestone */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px]">
          <span className="opacity-50">Next milestone: {nextMilestone} days</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden bg-[var(--border)]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ type: 'spring', stiffness: 50 }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #f59e0b, #ef4444)' }}
          />
        </div>
      </div>

      {/* Achievements */}
      <div className="flex flex-wrap gap-1.5">
        {MILESTONES.map(m => (
          <span key={m}
            className={`px-2 py-0.5 rounded-full text-[9px] border ${
              data.longestStreak >= m
                ? 'border-green-500/30 bg-green-500/10 text-green-500'
                : 'border-[var(--border)] opacity-30'
            }`}
          >
            {data.longestStreak >= m ? '🏆' : '🔒'} {m}d
          </span>
        ))}
      </div>

      <div className="text-[10px] opacity-40 text-center">
        Longest streak: <strong>{data.longestStreak}</strong> day{data.longestStreak !== 1 ? 's' : ''}
      </div>
    </motion.div>
  )
}
