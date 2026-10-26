/**
 * OMEGA X — FINANCIAL DATA RESILIENCE SERVICE
 * 
 * Centralized resilience engine for fiat currency and cryptocurrency rates.
 * Enforces:
 * - Deterministic cache validation and freshness policies
 * - Strict timeout and AbortController execution
 * - Non-OK HTTP status and CoinGecko 429 rate-limit handling
 * - Zero silent fallback to rate 1 for missing/unknown currencies
 * - Finite-number and non-negative quantity boundaries
 * - Clear data status classification (live vs cached vs stale vs unavailable)
 */

export type FinancialDataStatus =
  | 'loading'
  | 'live'
  | 'cached'
  | 'stale'
  | 'unavailable'
  | 'error'

export interface CachedCurrencyData {
  version: 1
  timestamp: number
  base: string
  rates: Record<string, number>
}

export interface CachedCryptoData {
  version: 1
  timestamp: number
  prices: Record<string, number>
}

export interface CryptoAssetDef {
  id: string
  symbol: string
  name: string
}

export const FIAT_CACHE_KEY = 'uc_currency_rates'
export const CRYPTO_CACHE_KEY = 'uc_crypto_prices'

// Freshness thresholds
export const FIAT_FRESH_TTL_MS = 3600000 // 1 hour
export const FIAT_STALE_TTL_MS = 86400000 // 24 hours
export const CRYPTO_FRESH_TTL_MS = 300000 // 5 minutes
export const CRYPTO_STALE_TTL_MS = 86400000 // 24 hours
export const FINANCIAL_FETCH_TIMEOUT_MS = 8000 // 8 seconds

export const SUPPORTED_CRYPTO_ASSETS: CryptoAssetDef[] = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' }
]

// Custom Error Classes
export class FinancialHttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'FinancialHttpError'
  }
}

export class RateLimitError extends FinancialHttpError {
  constructor(message = 'Rate limit reached (HTTP 429)') {
    super(429, message)
    this.name = 'RateLimitError'
  }
}

export class TimeoutError extends Error {
  constructor(message = `Request timed out after ${FINANCIAL_FETCH_TIMEOUT_MS}ms`) {
    super(message)
    this.name = 'TimeoutError'
  }
}

/**
 * Validates cached fiat currency data structure from local storage.
 * Rejects corrupt, missing, or non-finite values.
 */
export function validateCurrencyCache(raw: unknown): CachedCurrencyData | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const candidate = raw as Partial<CachedCurrencyData>

  // Validate timestamp
  if (typeof candidate.timestamp !== 'number' || !Number.isFinite(candidate.timestamp)) {
    return null
  }
  // Plausibility check: timestamp between year 2020 and 1 minute in future
  if (candidate.timestamp <= 1577836800000 || candidate.timestamp > Date.now() + 60000) {
    return null
  }

  // Validate rates object
  if (!candidate.rates || typeof candidate.rates !== 'object' || Array.isArray(candidate.rates)) {
    return null
  }

  const validRates: Record<string, number> = {}
  for (const [code, val] of Object.entries(candidate.rates)) {
    if (typeof val === 'number' && Number.isFinite(val) && val > 0) {
      validRates[code.toUpperCase()] = val
    }
  }

  if (Object.keys(validRates).length === 0) return null

  return {
    version: 1,
    timestamp: candidate.timestamp,
    base: typeof candidate.base === 'string' && candidate.base ? candidate.base.toUpperCase() : 'USD',
    rates: validRates
  }
}

/**
 * Validates cached cryptocurrency data structure from local storage.
 */
export function validateCryptoCache(raw: unknown): CachedCryptoData | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const candidate = raw as Partial<CachedCryptoData>

  if (typeof candidate.timestamp !== 'number' || !Number.isFinite(candidate.timestamp)) {
    return null
  }
  if (candidate.timestamp <= 1577836800000 || candidate.timestamp > Date.now() + 60000) {
    return null
  }

  if (!candidate.prices || typeof candidate.prices !== 'object' || Array.isArray(candidate.prices)) {
    return null
  }

  const validPrices: Record<string, number> = {}
  for (const [sym, val] of Object.entries(candidate.prices)) {
    if (typeof val === 'number' && Number.isFinite(val) && val > 0) {
      validPrices[sym.toUpperCase()] = val
    }
  }

  if (Object.keys(validPrices).length === 0) return null

  return {
    version: 1,
    timestamp: candidate.timestamp,
    prices: validPrices
  }
}

/**
 * Classifies the freshness of cached data according to configured TTLs.
 */
export function classifyDataFreshness(
  timestamp: number,
  freshTtl: number,
  staleTtl: number,
  now = Date.now()
): 'live' | 'cached' | 'stale' | 'expired' {
  if (!Number.isFinite(timestamp) || timestamp > now + 60000 || timestamp <= 0) {
    return 'expired'
  }
  const age = now - timestamp
  if (age < 0) return 'live'
  if (age <= freshTtl) return 'cached'
  if (age <= staleTtl) return 'stale'
  return 'expired'
}

/**
 * Converts fiat currency amounts with zero silent rate-1 fallbacks.
 * Rejects missing currencies, NaN, Infinity, and non-finite inputs.
 */
export function convertCurrencyAmount(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number> | null,
  base = 'USD'
): number | null {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return null
  if (!rates) return null

  const normalizedFrom = from.trim().toUpperCase()
  const normalizedTo = to.trim().toUpperCase()
  const normalizedBase = base.trim().toUpperCase()

  // Resolve source rate
  const sourceRate = normalizedFrom === normalizedBase ? 1 : rates[normalizedFrom]
  if (typeof sourceRate !== 'number' || !Number.isFinite(sourceRate) || sourceRate <= 0) {
    return null
  }

  // Resolve target rate
  const targetRate = normalizedTo === normalizedBase ? 1 : rates[normalizedTo]
  if (typeof targetRate !== 'number' || !Number.isFinite(targetRate) || targetRate <= 0) {
    return null
  }

  if (normalizedFrom === normalizedTo) return amount

  const inBase = amount / sourceRate
  const result = inBase * targetRate
  return Number.isFinite(result) ? result : null
}

/**
 * Converts cryptocurrency amounts.
 * Rejects negative amounts, missing prices, NaN, and Infinity.
 */
export function convertCryptoAmount(
  amount: number,
  from: string,
  to: string,
  prices: Record<string, number> | null
): number | null {
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) return null
  if (!prices) return null

  const normalizedFrom = from.trim().toUpperCase()
  const normalizedTo = to.trim().toUpperCase()

  const fromPrice = prices[normalizedFrom]
  const toPrice = prices[normalizedTo]

  if (typeof fromPrice !== 'number' || !Number.isFinite(fromPrice) || fromPrice <= 0) return null
  if (typeof toPrice !== 'number' || !Number.isFinite(toPrice) || toPrice <= 0) return null

  if (normalizedFrom === normalizedTo) return amount

  const result = (amount * fromPrice) / toPrice
  return Number.isFinite(result) ? result : null
}

/**
 * Local storage load helper for fiat currency.
 */
export function loadCachedCurrency(): CachedCurrencyData | null {
  try {
    const raw = localStorage.getItem(FIAT_CACHE_KEY)
    if (!raw) return null
    return validateCurrencyCache(JSON.parse(raw))
  } catch {
    return null
  }
}

/**
 * Local storage save helper for fiat currency.
 */
export function saveCachedCurrency(rates: Record<string, number>, base = 'USD', timestamp = Date.now()): void {
  try {
    const data: CachedCurrencyData = {
      version: 1,
      timestamp,
      base,
      rates
    }
    localStorage.setItem(FIAT_CACHE_KEY, JSON.stringify(data))
  } catch {
    /* ignore storage quota errors */
  }
}

/**
 * Local storage load helper for cryptocurrency.
 */
export function loadCachedCrypto(): CachedCryptoData | null {
  try {
    const raw = localStorage.getItem(CRYPTO_CACHE_KEY)
    if (!raw) return null
    return validateCryptoCache(JSON.parse(raw))
  } catch {
    return null
  }
}

/**
 * Local storage save helper for cryptocurrency.
 */
export function saveCachedCrypto(prices: Record<string, number>, timestamp = Date.now()): void {
  try {
    const data: CachedCryptoData = {
      version: 1,
      timestamp,
      prices
    }
    localStorage.setItem(CRYPTO_CACHE_KEY, JSON.stringify(data))
  } catch {
    /* ignore storage quota errors */
  }
}

/**
 * Native fetch wrapped with deterministic timeout and abort chaining.
 */
export async function fetchWithTimeout(
  url: string,
  timeoutMs = FINANCIAL_FETCH_TIMEOUT_MS,
  externalSignal?: AbortSignal
): Promise<Response> {
  const controller = new AbortController()
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeoutMs)

  if (externalSignal) {
    if (externalSignal.aborted) {
      clearTimeout(timer)
      controller.abort()
    } else {
      externalSignal.addEventListener(
        'abort',
        () => {
          clearTimeout(timer)
          controller.abort()
        },
        { once: true }
      )
    }
  }

  try {
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)
    return response
  } catch (err: unknown) {
    clearTimeout(timer)
    if (timedOut) {
      throw new TimeoutError(`Request timed out after ${timeoutMs}ms`)
    }
    throw err
  }
}

/**
 * Retrieves latest fiat rates from open.er-api.com with timeout and status validation.
 */
export async function fetchCurrencyRates(
  signal?: AbortSignal
): Promise<{ rates: Record<string, number>; timestamp: number; base: string }> {
  const response = await fetchWithTimeout('https://open.er-api.com/v6/latest/USD', FINANCIAL_FETCH_TIMEOUT_MS, signal)
  if (!response.ok) {
    if (response.status === 429) throw new RateLimitError()
    throw new FinancialHttpError(response.status, `HTTP error ${response.status}`)
  }
  const data = await response.json()
  if (data?.result !== 'success' || !data.rates || typeof data.rates !== 'object') {
    throw new Error('Malformed currency payload received')
  }

  const validRates: Record<string, number> = {}
  for (const [code, val] of Object.entries(data.rates)) {
    if (typeof val === 'number' && Number.isFinite(val) && val > 0) {
      validRates[code.toUpperCase()] = val
    }
  }

  if (Object.keys(validRates).length === 0) {
    throw new Error('No valid currency rates in response')
  }

  const ts = typeof data.time_last_update_unix === 'number' && Number.isFinite(data.time_last_update_unix)
    ? data.time_last_update_unix * 1000
    : Date.now()

  return {
    rates: validRates,
    timestamp: ts,
    base: typeof data.base_code === 'string' ? data.base_code.toUpperCase() : 'USD'
  }
}

/**
 * Retrieves latest cryptocurrency prices from CoinGecko with timeout, 429 handling, and validation.
 */
export async function fetchCryptoPrices(
  signal?: AbortSignal
): Promise<{ prices: Record<string, number>; timestamp: number }> {
  const ids = SUPPORTED_CRYPTO_ASSETS.map(c => c.id).join(',')
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`

  const response = await fetchWithTimeout(url, FINANCIAL_FETCH_TIMEOUT_MS, signal)
  if (!response.ok) {
    if (response.status === 429) {
      throw new RateLimitError('CoinGecko rate limit exceeded (HTTP 429)')
    }
    throw new FinancialHttpError(response.status, `HTTP error ${response.status} from CoinGecko`)
  }

  const data = await response.json()
  if (!data || typeof data !== 'object') {
    throw new Error('Malformed crypto payload from CoinGecko')
  }

  const validPrices: Record<string, number> = {}
  for (const asset of SUPPORTED_CRYPTO_ASSETS) {
    const p = data[asset.id]?.usd
    if (typeof p === 'number' && Number.isFinite(p) && p > 0) {
      validPrices[asset.symbol] = p
    }
  }

  if (Object.keys(validPrices).length === 0) {
    throw new Error('No valid cryptocurrency prices in CoinGecko response')
  }

  return {
    prices: validPrices,
    timestamp: Date.now()
  }
}
