import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { analytics } from '../../engine/analytics'
import { smartBehavior } from '../../engine/smartBehavior'
import { getAllCategories } from '../../engine/converter'
import GlassCard from '../ui/GlassCard'
import Sparkline from '../ui/Sparkline'

export default function AIDashboardInsights() {
  const insights = useMemo(() => {
    const summary = analytics.getSummary()
    const profile = smartBehavior.getProfile()
    const cats = getAllCategories()

    const topCatId = summary.mostUsedCategory
    const topCat = cats.find(c => c.id === topCatId)
    const topPair = summary.mostUsedPair.split('→')
    const hourlyBreakdown = Array.from({ length: 24 }, (_, h) => ({
      label: `${h}:00`, value: smartBehavior.getFrequency(`hour_${h}`) || 0
    }))
    const peakHour = profile.peakUsageHour
    const peakLabel = peakHour < 12 ? `${peakHour} AM` : peakHour === 12 ? '12 PM' : `${peakHour - 12} PM`

    const suggestions: string[] = []
    if (summary.totalConversions > 0 && topCat) {
      suggestions.push(`Your most-used category is **${topCat.ic} ${topCat.lb}** — ${summary.categoryCounts[topCatId] || 0} conversions`)
    }
    if (topPair.length === 2) {
      suggestions.push(`Your top conversion pair: **${topPair[0]} → ${topPair[1]}**`)
    }
    if (profile.totalConversions > 5) {
      suggestions.push(`You're most active around **${peakLabel}**`)
    }
    if (profile.totalConversions > 10) {
      suggestions.push(`Your productivity score: **${analytics.getProductivityScore()}%**`)
    }
    if (profile.frequentPairs.length > 0) {
      suggestions.push(`Suggested quick convert: **${profile.frequentPairs[0].from} → ${profile.frequentPairs[0].to}**`)
    }

    const dailyData = Object.entries(summary.dailyCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, count]) => ({
        label: date.slice(5), value: count
      }))

    return { summary, profile, topCat, suggestions, hourlyBreakdown, dailyData, peakLabel }
  }, [])

  return (
    <GlassCard variant="elevated">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">🧠</span>
          <span className="text-sm font-semibold">AI Insights</span>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'Total', value: insights.summary.totalConversions, icon: '🔄' },
            { label: 'Best Day', value: insights.summary.peakDay.slice(5), icon: '📈' },
            { label: 'Productivity', value: `${analytics.getProductivityScore()}%`, icon: '⚡' },
            { label: 'Peak Hour', value: insights.peakLabel, icon: '🕐' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass rounded-xl p-2 text-center">
              <span className="text-xs" aria-hidden="true">{stat.icon}</span>
              <div className="text-sm font-bold mt-0.5">{stat.value}</div>
              <div className="text-[8px] opacity-40 uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Activity sparkline */}
        {insights.dailyData.length > 1 && (
          <div>
            <div className="text-[10px] opacity-40 uppercase tracking-wide mb-1">14-Day Activity</div>
            <Sparkline data={insights.dailyData.map(d => d.value)} height={32} />
          </div>
        )}

        {/* Suggestions */}
        {insights.suggestions.length > 0 && (
          <div className="space-y-1">
            <div className="text-[10px] opacity-40 uppercase tracking-wide">Suggestions</div>
            {insights.suggestions.map((s, i) => (
              <div key={i} className="text-xs opacity-70 flex items-start gap-1.5">
                <span className="text-[var(--primary)] mt-0.5">•</span>
                <span dangerouslySetInnerHTML={{ __html: s }} />
              </div>
            ))}
          </div>
        )}

        {/* Mode recommendation */}
        {insights.summary.totalConversions > 3 && (
          <div className="text-[10px] pt-1 border-t border-[var(--border)]">
            <span className="opacity-40">💡 Tip: </span>
            <span className="opacity-70">
              Based on your activity, try switching modes in Settings to match your workflow
            </span>
          </div>
        )}
      </div>
    </GlassCard>
  )
}
