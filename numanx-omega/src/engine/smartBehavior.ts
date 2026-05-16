import { analytics } from './analytics'
import { getAllCategories } from './converter'

export interface BehaviorProfile {
  preferredCategory: string
  preferredMode: 'student' | 'engineer' | 'fast' | 'pro' | 'trader' | 'scientist'
  frequentPairs: { from: string; to: string }[]
  peakUsageHour: number
  totalConversions: number
  averagePrecision: number
  usesScientific: boolean
  usesFractions: boolean
}

export interface AdaptiveAction {
  type: 'shortcut' | 'simplify' | 'prioritize' | 'tip' | 'learning'
  label: string
  description: string
  priority: number
}

export class SmartBehaviorEngine {
  private patterns: Map<string, number> = new Map()
  private lastAction: string | null = null
  private actionCount: number = 0

  constructor() {
    this.loadPatterns()
  }

  private loadPatterns() {
    try {
      const data = JSON.parse(localStorage.getItem('uc_patterns') || '{}')
      Object.entries(data).forEach(([k, v]) => this.patterns.set(k, v as number))
    } catch { /* ignore */ }
  }

  private savePatterns() {
    const data: Record<string, number> = {}
    this.patterns.forEach((v, k) => { data[k] = v })
    try { localStorage.setItem('uc_patterns', JSON.stringify(data)) } catch { /* ignore */ }
  }

  recordAction(action: string) {
    this.patterns.set(action, (this.patterns.get(action) || 0) + 1)
    this.lastAction = action
    this.actionCount++
    if (this.actionCount % 10 === 0) this.savePatterns()
  }

  getFrequency(action: string): number {
    return this.patterns.get(action) || 0
  }

  getProfile(): BehaviorProfile {
    const summary = analytics.getSummary()
    const pairs = analytics.getSuggestedPairs()
    const parsed = pairs.map(p => {
      const [from, to] = p.split('→')
      return { from, to }
    })

    return {
      preferredCategory: summary.mostUsedCategory,
      preferredMode: this.detectPreferredMode(),
      frequentPairs: parsed.slice(0, 3),
      peakUsageHour: this.detectPeakHour(),
      totalConversions: summary.totalConversions,
      averagePrecision: 6,
      usesScientific: this.patterns.get('sci_on') || 0 > this.patterns.get('sci_off') || 0,
      usesFractions: this.patterns.get('frac_on') || 0 > this.patterns.get('frac_off') || 0,
    }
  }

  private detectPreferredMode(): BehaviorProfile['preferredMode'] {
    const counts = {
      student: this.patterns.get('mode_student') || 0,
      engineer: this.patterns.get('mode_engineer') || 0,
      fast: this.patterns.get('mode_fast') || 0,
      pro: this.patterns.get('mode_pro') || 0,
      trader: this.patterns.get('mode_trader') || 0,
      scientist: this.patterns.get('mode_scientist') || 0,
    }
    return (Object.entries(counts) as [string, number][]).sort((a, b) => b[1] - a[1])[0]?.[0] as BehaviorProfile['preferredMode'] || 'pro'
  }

  private detectPeakHour(): number {
    let peak = 0
    let maxCount = 0
    for (let h = 0; h < 24; h++) {
      const count = this.patterns.get(`hour_${h}`) || 0
      if (count > maxCount) { maxCount = count; peak = h }
    }
    return peak
  }

  getAdaptiveActions(): AdaptiveAction[] {
    const actions: AdaptiveAction[] = []
    const profile = this.getProfile()

    if (profile.totalConversions > 5) {
      actions.push({
        type: 'shortcut',
        label: `Quick ${profile.preferredCategory}`,
        description: `Your most-used category`,
        priority: 100
      })
    }

    if (profile.frequentPairs.length > 0) {
      actions.push({
        type: 'shortcut',
        label: `${profile.frequentPairs[0].from} → ${profile.frequentPairs[0].to}`,
        description: 'Your most frequent conversion',
        priority: 90
      })
    }

    if (profile.totalConversions < 3) {
      actions.push({
        type: 'tip',
        label: 'Try typing "5 km in miles"',
        description: 'Natural language input supported',
        priority: 80
      })
    }

    if (profile.totalConversions > 10 && !profile.usesScientific) {
      actions.push({
        type: 'learning',
        label: 'Enable scientific notation',
        description: 'For large numbers, click "sci" button',
        priority: 50
      })
    }

    return actions.sort((a, b) => b.priority - a.priority)
  }

  shouldSimplifyUI(): boolean {
    const profile = this.getProfile()
    return profile.totalConversions < 5 && profile.frequentPairs.length < 2
  }

  shouldPrioritizeCategory(catId: string): boolean {
    return this.getFrequency(`cat_${catId}`) > 5
  }

  getCategoryPriority(catId: string): number {
    return this.getFrequency(`cat_${catId}`)
  }
}

export const smartBehavior = new SmartBehaviorEngine()
