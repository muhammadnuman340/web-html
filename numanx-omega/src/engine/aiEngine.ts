import { analytics } from './analytics'
import type { AnalyticsEvent } from './analytics'

export interface Suggestion {
  type: 'quick_pair' | 'category' | 'tip' | 'action'
  label: string
  description?: string
  action?: () => void
  confidence: number
}

export class AIEngine {
  private recentPatterns: Map<string, number> = new Map()

  constructor() {
    this.learn()
  }

  private learn() {
    const evs = analytics.getRecentConversions(50)
    evs.forEach(e => {
      if (e.fromUnit && e.toUnit) {
        const key = `${e.fromUnit}→${e.toUnit}`
        this.recentPatterns.set(key, (this.recentPatterns.get(key) || 0) + 1)
      }
    })
  }

  suggestQuickPairs(): { from: string; to: string }[] {
    return Array.from(this.recentPatterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([key]) => {
        const [from, to] = key.split('→')
        return { from, to }
      })
  }

  suggestCategory(categories: { id: string; label: string; icon: string }[]): string {
    const freq = analytics.getSummary().categoryCounts
    const sorted = Object.entries(freq)
      .filter(([id]) => categories.some(c => c.id === id))
      .sort((a, b) => b[1] - a[1])
    return sorted[0]?.[0] || categories[0]?.id || ''
  }

  getNextAction(pairs: { from: string; to: string }[]): Suggestion | null {
    if (pairs.length === 0) return null
    // Predict based on history
    const suggest = this.suggestQuickPairs()
    if (suggest.length > 0) {
      return {
        type: 'quick_pair',
        label: `Convert ${suggest[0].from} → ${suggest[0].to}`,
        description: 'Based on your usage patterns',
        confidence: 0.8
      }
    }
    return null
  }
}

export const aiEngine = new AIEngine()
