import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { analytics } from '../../engine/analytics'
import { smartBehavior } from '../../engine/smartBehavior'

const CATEGORY_COMMON_PAIRS: Record<string, { from: string; to: string; label: string }[]> = {
  length: [
    { from: 'km', to: 'mi', label: 'km → miles' },
    { from: 'm', to: 'ft', label: 'm → feet' },
    { from: 'cm', to: 'in', label: 'cm → inches' },
    { from: 'mi', to: 'km', label: 'miles → km' },
  ],
  mass: [
    { from: 'kg', to: 'lb', label: 'kg → pounds' },
    { from: 'g', to: 'oz', label: 'g → ounces' },
    { from: 'lb', to: 'kg', label: 'pounds → kg' },
  ],
  volume: [
    { from: 'l', to: 'gal', label: 'L → gallons' },
    { from: 'ml', to: 'fl_oz', label: 'mL → fl oz' },
    { from: 'cup', to: 'ml', label: 'cups → mL' },
  ],
  temperature: [
    { from: 'c', to: 'f', label: '°C → °F' },
    { from: 'f', to: 'c', label: '°F → °C' },
  ],
  speed: [
    { from: 'kmh', to: 'mph', label: 'km/h → mph' },
    { from: 'ms', to: 'kmh', label: 'm/s → km/h' },
  ],
  area: [
    { from: 'sqm', to: 'sqft', label: 'm² → ft²' },
    { from: 'ha', to: 'acre', label: 'ha → acres' },
  ],
  digital: [
    { from: 'mb', to: 'gb', label: 'MB → GB' },
    { from: 'gb', to: 'tb', label: 'GB → TB' },
  ],
  currency: [
    { from: 'usd', to: 'eur', label: 'USD → EUR' },
    { from: 'usd', to: 'gbp', label: 'USD → GBP' },
  ],
}

interface Props {
  categoryId: string
  fromVal: string
  fromUnit: string
  toUnit: string
  onApply: (from: string, to: string) => void
}

export default function AIPredictions({ categoryId, fromVal, fromUnit, toUnit, onApply }: Props) {
  const predictions = useMemo(() => {
    if (!fromVal) return []

    const suggestions: { label: string; from: string; to: string; reason: string }[] = []
    const summary = analytics.getSummary()
    const profile = smartBehavior.getProfile()

    // 1. User's frequent pairs matching current fromUnit
    if (fromUnit) {
      const altTos = profile.frequentPairs
        .filter(p => p.from === fromUnit && p.to !== toUnit)
        .slice(0, 2)
      altTos.forEach(p => {
        suggestions.push({ label: `→ ${p.to}`, from: p.from, to: p.to, reason: 'You used this before' })
      })
      const common = CATEGORY_COMMON_PAIRS[categoryId] || []
      common.filter(c => c.from === fromUnit && c.to !== toUnit).slice(0, 2).forEach(p => {
        if (!suggestions.some(s => s.to === p.to)) {
          suggestions.push({ label: `→ ${p.label.split('→')[1]?.trim() || p.to}`, from: p.from, to: p.to, reason: 'Popular' })
        }
      })
    }

    // 2. Show common pairs if no fromUnit yet
    if (!fromUnit) {
      const common = CATEGORY_COMMON_PAIRS[categoryId] || []
      common.slice(0, 4).forEach(p => {
        suggestions.push({ label: p.label, from: p.from, to: p.to, reason: 'Popular' })
      })
      const matchedPairs = profile.frequentPairs.slice(0, 2)
      matchedPairs.forEach(p => {
        if (!suggestions.some(s => s.from === p.from && s.to === p.to)) {
          suggestions.push({ label: `${p.from} → ${p.to}`, from: p.from, to: p.to, reason: 'Your most used' })
        }
      })
    }

    return suggestions.slice(0, 4)
  }, [categoryId, fromVal, fromUnit, toUnit])

  if (!fromVal) return null

  return (
    <AnimatePresence>
      {predictions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="flex flex-wrap gap-1.5 mt-1"
        >
          <span className="text-xs opacity-50 uppercase tracking-wider self-center mr-0.5">AI</span>
          {predictions.map((p, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onApply(p.from, p.to)}
              className="group relative btn-chip text-xs border-[var(--primary)]/30 bg-[var(--primary)]/5 text-[var(--primary)]"
            >
              {p.label}
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-[var(--text)] text-[var(--bg)] text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {p.reason}
              </span>
            </motion.button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
