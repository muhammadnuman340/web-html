export interface AnalyticsEvent {
  type: string
  category?: string
  fromUnit?: string
  toUnit?: string
  timestamp: number
}

export interface AnalyticsSummary {
  totalConversions: number
  categoryCounts: Record<string, number>
  unitPairs: Record<string, number>
  dailyCounts: Record<string, number>
  mostUsedCategory: string
  mostUsedPair: string
  peakDay: string
}

const STORAGE_KEY = 'uc_analytics'

export class AnalyticsEngine {
  private events: AnalyticsEvent[] = []
  private dailyStats: Record<string, number> = {}

  constructor() {
    this.load()
  }

  private load() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      this.events = data.events || []
      this.dailyStats = data.dailyStats || {}
    } catch { /* ignore */ }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        events: this.events.slice(-500),
        dailyStats: this.dailyStats
      }))
    } catch { /* ignore */ }
  }

  track(event: Omit<AnalyticsEvent, 'timestamp'>) {
    const ev: AnalyticsEvent = { ...event, timestamp: Date.now() }
    this.events.push(ev)
    if (this.events.length > 500) this.events.shift()

    const today = new Date().toISOString().slice(0, 10)
    this.dailyStats[today] = (this.dailyStats[today] || 0) + 1

    this.save()
  }

  getSummary(): AnalyticsSummary {
    const catCounts: Record<string, number> = {}
    const pairCounts: Record<string, number> = {}

    this.events.forEach(e => {
      if (e.category) catCounts[e.category] = (catCounts[e.category] || 0) + 1
      if (e.fromUnit && e.toUnit) {
        const key = `${e.fromUnit}→${e.toUnit}`
        pairCounts[key] = (pairCounts[key] || 0) + 1
      }
    })

    const entries = Object.entries
    const topCat = entries(catCounts).sort((a, b) => b[1] - a[1])[0]
    const topPair = entries(pairCounts).sort((a, b) => b[1] - a[1])[0]
    const topDay = entries(this.dailyStats).sort((a, b) => b[1] - a[1])[0]

    return {
      totalConversions: this.events.length,
      categoryCounts: catCounts,
      unitPairs: pairCounts,
      dailyCounts: this.dailyStats,
      mostUsedCategory: topCat?.[0] || 'N/A',
      mostUsedPair: topPair?.[0] || 'N/A',
      peakDay: topDay?.[0] || 'N/A'
    }
  }

  getFrequency(category: string): number {
    return this.events.filter(e => e.category === category).length
  }

  getRecentConversions(limit = 5): AnalyticsEvent[] {
    return this.events.slice(-limit).reverse()
  }

  getSuggestedPairs(): string[] {
    const pairs = this.events
      .filter(e => e.fromUnit && e.toUnit)
      .reduce((acc: Record<string, number>, e) => {
        const key = `${e.fromUnit}→${e.toUnit}`
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})
    return Object.entries(pairs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key]) => key)
  }

  getProductivityScore(): number {
    const today = new Date().toISOString().slice(0, 10)
    const todayCount = this.dailyStats[today] || 0
    const weekDays = Object.values(this.dailyStats)
    const avg = weekDays.length ? weekDays.reduce((a, b) => a + b, 0) / weekDays.length : 1
    return Math.min(100, Math.round((todayCount / avg) * 100))
  }
}

export const analytics = new AnalyticsEngine()
