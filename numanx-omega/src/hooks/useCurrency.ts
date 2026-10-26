import { useState, useEffect, useCallback, useRef } from 'react'
import type { CurrencyRate } from '../types'
import {
  type FinancialDataStatus,
  FIAT_FRESH_TTL_MS,
  FIAT_STALE_TTL_MS,
  classifyDataFreshness,
  loadCachedCurrency,
  saveCachedCurrency,
  fetchCurrencyRates,
  convertCurrencyAmount,
  RateLimitError
} from '../services/financialData'

export function useCurrency() {
  // Synchronous cache hydration eliminates render flicker and effect state waterfalls
  const [initialData] = useState(() => loadCachedCurrency())
  const [rates, setRates] = useState<CurrencyRate | null>(() => initialData?.rates ?? null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(() => initialData ? new Date(initialData.timestamp) : null)
  const [status, setStatus] = useState<FinancialDataStatus>(() => {
    if (!initialData) return 'loading'
    const freshness = classifyDataFreshness(initialData.timestamp, FIAT_FRESH_TTL_MS, FIAT_STALE_TTL_MS)
    return freshness === 'expired' ? 'loading' : freshness
  })
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(() => {
    if (!initialData) return true
    const freshness = classifyDataFreshness(initialData.timestamp, FIAT_FRESH_TTL_MS, FIAT_STALE_TTL_MS)
    return freshness === 'expired'
  })

  const activeAbortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const freshness = initialData
      ? classifyDataFreshness(initialData.timestamp, FIAT_FRESH_TTL_MS, FIAT_STALE_TTL_MS)
      : 'expired'

    // If cache is fresh, we do not need an immediate network fetch
    if (freshness === 'cached') {
      return
    }

    const controller = new AbortController()
    activeAbortRef.current = controller

    fetchCurrencyRates(controller.signal)
      .then(data => {
        saveCachedCurrency(data.rates, data.base, data.timestamp)
        setRates(data.rates)
        setLastUpdated(new Date(data.timestamp))
        setStatus('live')
        setStatusMessage(null)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        const cached = loadCachedCurrency()
        if (cached) {
          setRates(cached.rates)
          setLastUpdated(new Date(cached.timestamp))
          const f = classifyDataFreshness(cached.timestamp, FIAT_FRESH_TTL_MS, FIAT_STALE_TTL_MS)
          setStatus(f === 'cached' ? 'cached' : 'stale')
          setStatusMessage(
            err instanceof RateLimitError
              ? 'Rate limit reached. Displaying cached exchange rates.'
              : 'Network unavailable. Displaying cached exchange rates.'
          )
        } else {
          setStatus(err instanceof RateLimitError ? 'unavailable' : 'error')
          setStatusMessage(
            err instanceof RateLimitError
              ? 'Currency rate limit reached. Please wait a minute and retry.'
              : 'Unable to load live or cached currency rates.'
          )
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => {
      controller.abort()
      activeAbortRef.current = null
    }
  }, [initialData])

  const refresh = useCallback(async () => {
    if (activeAbortRef.current) {
      activeAbortRef.current.abort()
    }
    const controller = new AbortController()
    activeAbortRef.current = controller
    setLoading(true)
    try {
      const data = await fetchCurrencyRates(controller.signal)
      saveCachedCurrency(data.rates, data.base, data.timestamp)
      setRates(data.rates)
      setLastUpdated(new Date(data.timestamp))
      setStatus('live')
      setStatusMessage(null)
    } catch (err: unknown) {
      if (controller.signal.aborted) return
      const cached = loadCachedCurrency()
      if (cached) {
        setRates(cached.rates)
        setLastUpdated(new Date(cached.timestamp))
        const f = classifyDataFreshness(cached.timestamp, FIAT_FRESH_TTL_MS, FIAT_STALE_TTL_MS)
        setStatus(f === 'cached' ? 'cached' : 'stale')
        setStatusMessage(
          err instanceof RateLimitError
            ? 'Rate limit reached. Displaying cached exchange rates.'
            : 'Network unavailable. Displaying cached exchange rates.'
        )
      } else {
        setStatus(err instanceof RateLimitError ? 'unavailable' : 'error')
        setStatusMessage(
          err instanceof RateLimitError
            ? 'Currency rate limit reached. Please wait a minute and retry.'
            : 'Unable to load live or cached currency rates.'
        )
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
      }
    }
  }, [])

  const convert = useCallback((amount: number, from: string, to: string): number | null => {
    return convertCurrencyAmount(amount, from, to, rates)
  }, [rates])

  return {
    rates,
    loading,
    lastUpdated,
    status,
    statusMessage,
    refresh,
    convert
  }
}
