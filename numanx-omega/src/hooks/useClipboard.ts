import { useState, useCallback, useEffect } from 'react'

export interface ClipboardSuggestion {
  text: string
  value: number | null
  unit?: string
  label: string
}

const UNIT_PATTERNS = [
  { re: /(\d+\.?\d*)\s*(km|kilometer|kilometers)/i, unit: 'km' },
  { re: /(\d+\.?\d*)\s*(m|meter|meters)/i, unit: 'm' },
  { re: /(\d+\.?\d*)\s*(cm|centimeter|centimeters)/i, unit: 'cm' },
  { re: /(\d+\.?\d*)\s*(ft|feet|foot)/i, unit: 'ft' },
  { re: /(\d+\.?\d*)\s*(in|inch|inches)/i, unit: 'in' },
  { re: /(\d+\.?\d*)\s*(mi|mile|miles)/i, unit: 'mi' },
  { re: /(\d+\.?\d*)\s*(lbs?|pounds?|pound)/i, unit: 'lb' },
  { re: /(\d+\.?\d*)\s*(kg|kilo|kilograms?)/i, unit: 'kg' },
  { re: /(\d+\.?\d*)\s*(oz|ounce|ounces)/i, unit: 'oz' },
  { re: /(\d+\.?\d*)\s*(°?f|fahrenheit)/i, unit: 'F' },
  { re: /(\d+\.?\d*)\s*(°?c|celsius)/i, unit: 'C' },
]

export function useClipboardDetection() {
  const [suggestion, setSuggestion] = useState<ClipboardSuggestion | null>(null)
  const [dismissed, setDismissed] = useState(false)

  const checkClipboard = useCallback(async () => {
    if (dismissed) return
    try {
      const text = await navigator.clipboard.readText()
      if (!text || text.length > 100) return

      const trimmed = text.trim()
      const num = parseFloat(trimmed)
      if (!isNaN(num) && trimmed.length < 20) {
        setSuggestion({ text: trimmed, value: num, label: `Convert "${trimmed}"?` })
        return
      }

      for (const p of UNIT_PATTERNS) {
        const m = trimmed.match(p.re)
        if (m) {
          setSuggestion({
            text: trimmed,
            value: parseFloat(m[1]),
            unit: p.unit,
            label: `Convert "${m[0]}"?`,
          })
          return
        }
      }
    } catch {
      // Permission denied or no clipboard access
    }
  }, [dismissed])

  const clear = useCallback(() => { setSuggestion(null); setDismissed(true) }, [])

  return { suggestion, checkClipboard, clear }
}
