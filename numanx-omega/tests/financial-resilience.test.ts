import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  FIAT_FRESH_TTL_MS,
  FIAT_STALE_TTL_MS,
  CRYPTO_FRESH_TTL_MS,
  CRYPTO_STALE_TTL_MS,
  FINANCIAL_FETCH_TIMEOUT_MS,
  SUPPORTED_CRYPTO_ASSETS,
  FinancialHttpError,
  RateLimitError,
  TimeoutError,
  validateCurrencyCache,
  validateCryptoCache,
  classifyDataFreshness,
  convertCurrencyAmount,
  convertCryptoAmount
} from '../src/services/financialData'
import { classifyRequest, getOfflineFallbackForType } from '../src/utils/pwaLogic'
import { getSiteUrl } from '../src/config/site'

describe('Task 11 & 12: Financial Cache Validation & Malformed Cache Rejection', () => {
  it('validates a well-formed fiat currency cache payload', () => {
    const valid = {
      version: 1,
      timestamp: Date.now() - 10000,
      base: 'USD',
      rates: { EUR: 0.92, GBP: 0.79, JPY: 154.5 }
    }
    const result = validateCurrencyCache(valid)
    assert.ok(result !== null)
    assert.equal(result.version, 1)
    assert.equal(result.base, 'USD')
    assert.equal(result.rates.EUR, 0.92)
    assert.equal(result.rates.GBP, 0.79)
  })

  it('validates a well-formed cryptocurrency cache payload', () => {
    const valid = {
      version: 1,
      timestamp: Date.now() - 5000,
      prices: { BTC: 67000.5, ETH: 3500.25, SOL: 180.1 }
    }
    const result = validateCryptoCache(valid)
    assert.ok(result !== null)
    assert.equal(result.version, 1)
    assert.equal(result.prices.BTC, 67000.5)
    assert.equal(result.prices.ETH, 3500.25)
  })

  it('rejects null, non-objects, and arrays safely without crashing', () => {
    assert.equal(validateCurrencyCache(null), null)
    assert.equal(validateCurrencyCache(undefined), null)
    assert.equal(validateCurrencyCache('string data'), null)
    assert.equal(validateCurrencyCache(123456), null)
    assert.equal(validateCurrencyCache([]), null)

    assert.equal(validateCryptoCache(null), null)
    assert.equal(validateCryptoCache(undefined), null)
    assert.equal(validateCryptoCache('string data'), null)
    assert.equal(validateCryptoCache([]), null)
  })

  it('rejects missing, NaN, and non-finite timestamps', () => {
    assert.equal(validateCurrencyCache({ rates: { EUR: 0.9 } }), null)
    assert.equal(validateCurrencyCache({ timestamp: NaN, rates: { EUR: 0.9 } }), null)
    assert.equal(validateCurrencyCache({ timestamp: Infinity, rates: { EUR: 0.9 } }), null)
    assert.equal(validateCurrencyCache({ timestamp: '2026-10-21', rates: { EUR: 0.9 } }), null)
  })

  it('rejects impossible future and ancient timestamps', () => {
    // 2 hours in the future
    const future = Date.now() + 7200000
    assert.equal(validateCurrencyCache({ timestamp: future, rates: { EUR: 0.9 } }), null)

    // Year 2019 (pre-2020 boundary)
    const ancient = 1546300800000
    assert.equal(validateCurrencyCache({ timestamp: ancient, rates: { EUR: 0.9 } }), null)
  })

  it('filters invalid, negative, or NaN rates and rejects empty objects', () => {
    const corrupt = {
      timestamp: Date.now() - 1000,
      rates: {
        EUR: -0.92,
        GBP: NaN,
        JPY: Infinity,
        USD: null
      }
    }
    assert.equal(validateCurrencyCache(corrupt), null)

    const mixed = {
      timestamp: Date.now() - 1000,
      rates: {
        EUR: 0.92,
        BAD: -5,
        ZERO: 0
      }
    }
    const validated = validateCurrencyCache(mixed)
    assert.ok(validated !== null)
    assert.equal(validated.rates.EUR, 0.92)
    assert.equal(validated.rates.BAD, undefined)
    assert.equal(validated.rates.ZERO, undefined)
  })
})

describe('Task 6 & 14: Cache Freshness Policy & Boundary Tests', () => {
  it('classifies fresh cache correctly within TTL', () => {
    const now = 1700000000000
    const freshFiat = now - (FIAT_FRESH_TTL_MS - 5000)
    assert.equal(classifyDataFreshness(freshFiat, FIAT_FRESH_TTL_MS, FIAT_STALE_TTL_MS, now), 'cached')

    const freshCrypto = now - (CRYPTO_FRESH_TTL_MS - 1000)
    assert.equal(classifyDataFreshness(freshCrypto, CRYPTO_FRESH_TTL_MS, CRYPTO_STALE_TTL_MS, now), 'cached')
  })

  it('classifies exact TTL boundary correctly', () => {
    const now = 1700000000000
    const boundary = now - FIAT_FRESH_TTL_MS
    assert.equal(classifyDataFreshness(boundary, FIAT_FRESH_TTL_MS, FIAT_STALE_TTL_MS, now), 'cached')
  })

  it('classifies stale cache beyond fresh TTL but within stale window', () => {
    const now = 1700000000000
    // 2 hours old for fiat (fresh TTL is 1 hr, stale window is 24 hrs)
    const staleFiat = now - 7200000
    assert.equal(classifyDataFreshness(staleFiat, FIAT_FRESH_TTL_MS, FIAT_STALE_TTL_MS, now), 'stale')

    // 10 minutes old for crypto (fresh TTL is 5 min, stale window is 24 hrs)
    const staleCrypto = now - 600000
    assert.equal(classifyDataFreshness(staleCrypto, CRYPTO_FRESH_TTL_MS, CRYPTO_STALE_TTL_MS, now), 'stale')
  })

  it('classifies expired cache exceeding stale allowance', () => {
    const now = 1700000000000
    // 25 hours old
    const expired = now - 90000000
    assert.equal(classifyDataFreshness(expired, FIAT_FRESH_TTL_MS, FIAT_STALE_TTL_MS, now), 'expired')
  })

  it('classifies slight clock skew / current session data as live', () => {
    const now = 1700000000000
    const slightFuture = now + 500 // 500ms ahead
    assert.equal(classifyDataFreshness(slightFuture, FIAT_FRESH_TTL_MS, FIAT_STALE_TTL_MS, now), 'live')
  })
})

describe('Task 14 & 15: Currency Conversion Mathematics & Fallback Elimination', () => {
  const rates = {
    EUR: 0.92,
    GBP: 0.79,
    JPY: 154.5,
    PKR: 278.5
  }

  it('converts base USD to target currency accurately', () => {
    const res = convertCurrencyAmount(100, 'USD', 'EUR', rates, 'USD')
    assert.ok(res !== null)
    assert.equal(res, 92)
  })

  it('converts target currency to base USD accurately', () => {
    const res = convertCurrencyAmount(92, 'EUR', 'USD', rates, 'USD')
    assert.ok(res !== null)
    assert.equal(res, 100)
  })

  it('performs cross-currency conversions accurately via base rate', () => {
    // 100 EUR in GBP: (100 / 0.92) * 0.79 = 85.869565...
    const res = convertCurrencyAmount(100, 'EUR', 'GBP', rates, 'USD')
    assert.ok(res !== null)
    assert.ok(Math.abs(res - 85.869565) < 0.001)
  })

  it('handles identity currency conversions safely', () => {
    assert.equal(convertCurrencyAmount(50, 'USD', 'USD', rates, 'USD'), 50)
    assert.equal(convertCurrencyAmount(50, 'EUR', 'EUR', rates, 'USD'), 50)
  })

  it('handles zero currency amount correctly without error', () => {
    assert.equal(convertCurrencyAmount(0, 'USD', 'EUR', rates, 'USD'), 0)
    assert.equal(convertCurrencyAmount(0, 'EUR', 'GBP', rates, 'USD'), 0)
  })

  it('CRITICAL SAFETY: rejects unknown source currency code without silent USD fallback', () => {
    // PREVIOUS DEFECT: rates['NONEXISTENT'] || 1 silently treated NONEXISTENT as USD (rate 1)!
    const res = convertCurrencyAmount(100, 'NONEXISTENT', 'EUR', rates, 'USD')
    assert.equal(res, null, 'Unknown source currency must return null and never default to rate 1')
  })

  it('CRITICAL SAFETY: rejects unknown target currency code without silent USD fallback', () => {
    const res = convertCurrencyAmount(100, 'USD', 'NONEXISTENT', rates, 'USD')
    assert.equal(res, null, 'Unknown target currency must return null and never default to rate 1')
  })

  it('rejects NaN, Infinity, and non-numeric currency amounts', () => {
    assert.equal(convertCurrencyAmount(NaN, 'USD', 'EUR', rates, 'USD'), null)
    assert.equal(convertCurrencyAmount(Infinity, 'USD', 'EUR', rates, 'USD'), null)
    assert.equal(convertCurrencyAmount(-Infinity, 'USD', 'EUR', rates, 'USD'), null)
    // @ts-expect-error test invalid type
    assert.equal(convertCurrencyAmount('100', 'USD', 'EUR', rates, 'USD'), null)
  })
})

describe('Task 16 & 18: Cryptocurrency Conversion & Input Boundary Verification', () => {
  const prices = {
    BTC: 60000,
    ETH: 3000,
    SOL: 150
  }

  it('converts crypto pairs accurately (BTC to ETH)', () => {
    // 1 BTC = $60,000; 1 ETH = $3,000 => 1 BTC = 20 ETH
    const res = convertCryptoAmount(1, 'BTC', 'ETH', prices)
    assert.equal(res, 20)
  })

  it('converts smaller asset to larger asset accurately (ETH to BTC)', () => {
    // 20 ETH = 1 BTC
    const res = convertCryptoAmount(20, 'ETH', 'BTC', prices)
    assert.equal(res, 1)
  })

  it('handles crypto identity conversion', () => {
    assert.equal(convertCryptoAmount(5, 'BTC', 'BTC', prices), 5)
  })

  it('handles zero crypto amount correctly', () => {
    assert.equal(convertCryptoAmount(0, 'BTC', 'ETH', prices), 0)
  })

  it('TASK 16/18 BOUNDARY: rejects negative crypto quantities', () => {
    const res = convertCryptoAmount(-1, 'BTC', 'ETH', prices)
    assert.equal(res, null, 'Negative crypto quantities must return null')
  })

  it('rejects unknown cryptocurrencies without prices', () => {
    assert.equal(convertCryptoAmount(1, 'UNKNOWN_COIN', 'ETH', prices), null)
    assert.equal(convertCryptoAmount(1, 'BTC', 'UNKNOWN_COIN', prices), null)
  })

  it('verifies all supported crypto assets have defined symbols and IDs', () => {
    assert.equal(SUPPORTED_CRYPTO_ASSETS.length, 10)
    for (const asset of SUPPORTED_CRYPTO_ASSETS) {
      assert.ok(asset.id.length > 0)
      assert.ok(asset.symbol.length > 0)
      assert.ok(asset.name.length > 0)
    }
  })
})

describe('Task 7, 8 & 10: Financial HTTP Error & Rate Limit Architecture', () => {
  it('instantiates FinancialHttpError with correct status and message', () => {
    const err = new FinancialHttpError(500, 'Internal Server Error')
    assert.equal(err.status, 500)
    assert.equal(err.message, 'Internal Server Error')
    assert.equal(err.name, 'FinancialHttpError')
  })

  it('instantiates RateLimitError with status 429', () => {
    const err = new RateLimitError('CoinGecko 429')
    assert.equal(err.status, 429)
    assert.equal(err.name, 'RateLimitError')
    assert.ok(err instanceof FinancialHttpError)
  })

  it('instantiates TimeoutError with default timeout threshold', () => {
    const err = new TimeoutError()
    assert.ok(err.message.includes(`${FINANCIAL_FETCH_TIMEOUT_MS}ms`))
    assert.equal(err.name, 'TimeoutError')
  })
})

describe('Task 19 & 41: Service Worker Invariant & Cross-Origin API Protection', () => {
  const APP_ORIGIN = getSiteUrl()

  it('strictly classifies open.er-api.com as CROSS_ORIGIN', () => {
    const classification = classifyRequest('https://open.er-api.com/v6/latest/USD', 'cors', 'GET', APP_ORIGIN)
    assert.equal(classification, 'CROSS_ORIGIN')
  })

  it('strictly classifies api.coingecko.com as CROSS_ORIGIN', () => {
    const classification = classifyRequest(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
      'cors',
      'GET',
      APP_ORIGIN
    )
    assert.equal(classification, 'CROSS_ORIGIN')
  })

  it('guarantees CROSS_ORIGIN failures NEVER receive HTML offline fallback', () => {
    const fallback = getOfflineFallbackForType('CROSS_ORIGIN')
    assert.equal(fallback, null, 'Financial API failures must return null, never index.html')
  })
})
