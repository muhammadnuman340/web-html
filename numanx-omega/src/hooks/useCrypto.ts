import { useState, useEffect, useCallback, useRef } from 'react'
import {
  type FinancialDataStatus,
  CRYPTO_FRESH_TTL_MS,
  CRYPTO_STALE_TTL_MS,
  classifyDataFreshness,
  loadCachedCrypto,
  saveCachedCrypto,
  fetchCryptoPrices,
  convertCryptoAmount,
  RateLimitError
} from '../services/financialData'

export function useCrypto() {
  const [initialData] = useState(() => loadCachedCrypto())
  const [prices, setPrices] = useState<Record<string, number>>(() => initialData?.prices ?? {})
  const [lastUpdated, setLastUpdated] = useState<Date | null>(() => initialData ? new Date(initialData.timestamp) : null)
  const [status, setStatus] = useState<FinancialDataStatus>(() => {
    if (!initialData) return 'loading'
    const freshness = classifyDataFreshness(initialData.timestamp, CRYPTO_FRESH_TTL_MS, CRYPTO_STALE_TTL_MS)
    return freshness === 'expired' ? 'loading' : freshness
  })
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(() => {
    if (!initialData) return true
    const freshness = classifyDataFreshness(initialData.timestamp, CRYPTO_FRESH_TTL_MS, CRYPTO_STALE_TTL_MS)
    return freshness === 'expired'
  })

  const activeAbortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const freshness = initialData
      ? classifyDataFreshness(initialData.timestamp, CRYPTO_FRESH_TTL_MS, CRYPTO_STALE_TTL_MS)
      : 'expired'

    if (freshness === 'cached') {
      return
    }

    const controller = new AbortController()
    activeAbortRef.current = controller

    fetchCryptoPrices(controller.signal)
      .then(data => {
        saveCachedCrypto(data.prices, data.timestamp)
        setPrices(data.prices)
        setLastUpdated(new Date(data.timestamp))
        setStatus('live')
        setStatusMessage(null)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return

        const cached = loadCachedCrypto()
        if (cached) {
          setPrices(cached.prices)
          setLastUpdated(new Date(cached.timestamp))
          const f = classifyDataFreshness(cached.timestamp, CRYPTO_FRESH_TTL_MS, CRYPTO_STALE_TTL_MS)
          setStatus(f === 'cached' ? 'cached' : 'stale')
          setStatusMessage(
            err instanceof RateLimitError
              ? 'CoinGecko rate limit reached (HTTP 429). Displaying cached prices.'
              : 'Network unavailable. Displaying cached crypto prices.'
          )
        } else {
          setStatus(err instanceof RateLimitError ? 'unavailable' : 'error')
          setStatusMessage(
            err instanceof RateLimitError
              ? 'CoinGecko rate limit reached. Please wait a minute and retry.'
              : 'Unable to load live or cached cryptocurrency prices.'
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
      const data = await fetchCryptoPrices(controller.signal)
      saveCachedCrypto(data.prices, data.timestamp)
      setPrices(data.prices)
      setLastUpdated(new Date(data.timestamp))
      setStatus('live')
      setStatusMessage(null)
    } catch (err: unknown) {
      if (controller.signal.aborted) return

      const cached = loadCachedCrypto()
      if (cached) {
        setPrices(cached.prices)
        setLastUpdated(new Date(cached.timestamp))
        const f = classifyDataFreshness(cached.timestamp, CRYPTO_FRESH_TTL_MS, CRYPTO_STALE_TTL_MS)
        setStatus(f === 'cached' ? 'cached' : 'stale')
        setStatusMessage(
          err instanceof RateLimitError
            ? 'CoinGecko rate limit reached (HTTP 429). Displaying cached prices.'
            : 'Network unavailable. Displaying cached crypto prices.'
        )
      } else {
        setStatus(err instanceof RateLimitError ? 'unavailable' : 'error')
        setStatusMessage(
          err instanceof RateLimitError
            ? 'CoinGecko rate limit reached. Please wait a minute and retry.'
            : 'Unable to load live or cached cryptocurrency prices.'
        )
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
      }
    }
  }, [])

  const convert = useCallback((amount: number, from: string, to: string): number | null => {
    return convertCryptoAmount(amount, from, to, prices)
  }, [prices])

  return {
    prices,
    loading,
    lastUpdated,
    status,
    statusMessage,
    refresh,
    convert
  }
}
