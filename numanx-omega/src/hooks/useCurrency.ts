import { useState, useEffect, useCallback } from 'react'
import type { CurrencyRate } from '../types'

const CACHE_KEY = 'uc_currency_rates'
const CACHE_TIME = 3600000 // 1 hour

export function useCurrency() {
  const [rates, setRates] = useState<CurrencyRate | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      try {
        const { rates: r, timestamp } = JSON.parse(cached)
        setRates(r)
        setLastUpdated(new Date(timestamp))
        if (Date.now() - timestamp < CACHE_TIME) { setLoading(false); return }
      } catch { /* ignore */ }
    }
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(r => r.json())
      .then(d => {
        if (d.result === 'success') {
          setRates(d.rates)
          const ts = Date.now()
          localStorage.setItem(CACHE_KEY, JSON.stringify({ rates: d.rates, timestamp: ts }))
          setLastUpdated(new Date(ts))
        }
      })
      .catch(() => { /* use cached */ })
      .finally(() => setLoading(false))
  }, [])

  const convert = useCallback((amount: number, from: string, to: string): number | null => {
    if (!rates) return null
    if (from === to) return amount
    const usd = amount / (rates[from] || 1)
    return usd * (rates[to] || 1)
  }, [rates])

  return { rates, loading, lastUpdated, convert }
}
