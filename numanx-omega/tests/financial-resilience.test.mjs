// tests/financial-resilience.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";

// src/services/financialData.ts
var FIAT_FRESH_TTL_MS = 36e5;
var FIAT_STALE_TTL_MS = 864e5;
var CRYPTO_FRESH_TTL_MS = 3e5;
var CRYPTO_STALE_TTL_MS = 864e5;
var FINANCIAL_FETCH_TIMEOUT_MS = 8e3;
var SUPPORTED_CRYPTO_ASSETS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "ripple", symbol: "XRP", name: "XRP" },
  { id: "cardano", symbol: "ADA", name: "Cardano" },
  { id: "binancecoin", symbol: "BNB", name: "BNB" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot" },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche" },
  { id: "chainlink", symbol: "LINK", name: "Chainlink" }
];
var FinancialHttpError = class extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = "FinancialHttpError";
  }
  status;
};
var RateLimitError = class extends FinancialHttpError {
  constructor(message = "Rate limit reached (HTTP 429)") {
    super(429, message);
    this.name = "RateLimitError";
  }
};
var TimeoutError = class extends Error {
  constructor(message = `Request timed out after ${FINANCIAL_FETCH_TIMEOUT_MS}ms`) {
    super(message);
    this.name = "TimeoutError";
  }
};
function validateCurrencyCache(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const candidate = raw;
  if (typeof candidate.timestamp !== "number" || !Number.isFinite(candidate.timestamp)) {
    return null;
  }
  if (candidate.timestamp <= 15778368e5 || candidate.timestamp > Date.now() + 6e4) {
    return null;
  }
  if (!candidate.rates || typeof candidate.rates !== "object" || Array.isArray(candidate.rates)) {
    return null;
  }
  const validRates = {};
  for (const [code, val] of Object.entries(candidate.rates)) {
    if (typeof val === "number" && Number.isFinite(val) && val > 0) {
      validRates[code.toUpperCase()] = val;
    }
  }
  if (Object.keys(validRates).length === 0) return null;
  return {
    version: 1,
    timestamp: candidate.timestamp,
    base: typeof candidate.base === "string" && candidate.base ? candidate.base.toUpperCase() : "USD",
    rates: validRates
  };
}
function validateCryptoCache(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const candidate = raw;
  if (typeof candidate.timestamp !== "number" || !Number.isFinite(candidate.timestamp)) {
    return null;
  }
  if (candidate.timestamp <= 15778368e5 || candidate.timestamp > Date.now() + 6e4) {
    return null;
  }
  if (!candidate.prices || typeof candidate.prices !== "object" || Array.isArray(candidate.prices)) {
    return null;
  }
  const validPrices = {};
  for (const [sym, val] of Object.entries(candidate.prices)) {
    if (typeof val === "number" && Number.isFinite(val) && val > 0) {
      validPrices[sym.toUpperCase()] = val;
    }
  }
  if (Object.keys(validPrices).length === 0) return null;
  return {
    version: 1,
    timestamp: candidate.timestamp,
    prices: validPrices
  };
}
function classifyDataFreshness(timestamp, freshTtl, staleTtl, now = Date.now()) {
  if (!Number.isFinite(timestamp) || timestamp > now + 6e4 || timestamp <= 0) {
    return "expired";
  }
  const age = now - timestamp;
  if (age < 0) return "live";
  if (age <= freshTtl) return "cached";
  if (age <= staleTtl) return "stale";
  return "expired";
}
function convertCurrencyAmount(amount, from, to, rates, base = "USD") {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return null;
  if (!rates) return null;
  const normalizedFrom = from.trim().toUpperCase();
  const normalizedTo = to.trim().toUpperCase();
  const normalizedBase = base.trim().toUpperCase();
  const sourceRate = normalizedFrom === normalizedBase ? 1 : rates[normalizedFrom];
  if (typeof sourceRate !== "number" || !Number.isFinite(sourceRate) || sourceRate <= 0) {
    return null;
  }
  const targetRate = normalizedTo === normalizedBase ? 1 : rates[normalizedTo];
  if (typeof targetRate !== "number" || !Number.isFinite(targetRate) || targetRate <= 0) {
    return null;
  }
  if (normalizedFrom === normalizedTo) return amount;
  const inBase = amount / sourceRate;
  const result = inBase * targetRate;
  return Number.isFinite(result) ? result : null;
}
function convertCryptoAmount(amount, from, to, prices) {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0) return null;
  if (!prices) return null;
  const normalizedFrom = from.trim().toUpperCase();
  const normalizedTo = to.trim().toUpperCase();
  const fromPrice = prices[normalizedFrom];
  const toPrice = prices[normalizedTo];
  if (typeof fromPrice !== "number" || !Number.isFinite(fromPrice) || fromPrice <= 0) return null;
  if (typeof toPrice !== "number" || !Number.isFinite(toPrice) || toPrice <= 0) return null;
  if (normalizedFrom === normalizedTo) return amount;
  const result = amount * fromPrice / toPrice;
  return Number.isFinite(result) ? result : null;
}

// src/utils/pwaLogic.ts
var PWA_CACHE_PREFIX = "omega-x-";
var PWA_CACHE_VERSION = "v3";
var PWA_STATIC_CACHE = `${PWA_CACHE_PREFIX}static-${PWA_CACHE_VERSION}`;
var PWA_PAGES_CACHE = `${PWA_CACHE_PREFIX}pages-${PWA_CACHE_VERSION}`;
function classifyRequest(urlStr, mode, method, appOrigin) {
  if (method !== "GET") {
    return "UNSUPPORTED_METHOD";
  }
  let parsed;
  try {
    parsed = new URL(urlStr, appOrigin);
  } catch {
    return "UNSUPPORTED_PROTOCOL";
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return "UNSUPPORTED_PROTOCOL";
  }
  if (parsed.origin !== appOrigin) {
    return "CROSS_ORIGIN";
  }
  if (parsed.pathname.startsWith("/@") || parsed.pathname.startsWith("/src/")) {
    return "DEV_PATH";
  }
  if (mode === "navigate") {
    return "NAVIGATION";
  }
  if (parsed.pathname.startsWith("/assets/")) {
    return "HASHED_ASSET";
  }
  return "STATIC_ASSET";
}
function getOfflineFallbackForType(type) {
  if (type === "NAVIGATION") {
    return "/index.html";
  }
  return null;
}

// tests/financial-resilience.test.ts
describe("Task 11 & 12: Financial Cache Validation & Malformed Cache Rejection", () => {
  it("validates a well-formed fiat currency cache payload", () => {
    const valid = {
      version: 1,
      timestamp: Date.now() - 1e4,
      base: "USD",
      rates: { EUR: 0.92, GBP: 0.79, JPY: 154.5 }
    };
    const result = validateCurrencyCache(valid);
    assert.ok(result !== null);
    assert.equal(result.version, 1);
    assert.equal(result.base, "USD");
    assert.equal(result.rates.EUR, 0.92);
    assert.equal(result.rates.GBP, 0.79);
  });
  it("validates a well-formed cryptocurrency cache payload", () => {
    const valid = {
      version: 1,
      timestamp: Date.now() - 5e3,
      prices: { BTC: 67000.5, ETH: 3500.25, SOL: 180.1 }
    };
    const result = validateCryptoCache(valid);
    assert.ok(result !== null);
    assert.equal(result.version, 1);
    assert.equal(result.prices.BTC, 67000.5);
    assert.equal(result.prices.ETH, 3500.25);
  });
  it("rejects null, non-objects, and arrays safely without crashing", () => {
    assert.equal(validateCurrencyCache(null), null);
    assert.equal(validateCurrencyCache(void 0), null);
    assert.equal(validateCurrencyCache("string data"), null);
    assert.equal(validateCurrencyCache(123456), null);
    assert.equal(validateCurrencyCache([]), null);
    assert.equal(validateCryptoCache(null), null);
    assert.equal(validateCryptoCache(void 0), null);
    assert.equal(validateCryptoCache("string data"), null);
    assert.equal(validateCryptoCache([]), null);
  });
  it("rejects missing, NaN, and non-finite timestamps", () => {
    assert.equal(validateCurrencyCache({ rates: { EUR: 0.9 } }), null);
    assert.equal(validateCurrencyCache({ timestamp: NaN, rates: { EUR: 0.9 } }), null);
    assert.equal(validateCurrencyCache({ timestamp: Infinity, rates: { EUR: 0.9 } }), null);
    assert.equal(validateCurrencyCache({ timestamp: "2026-10-21", rates: { EUR: 0.9 } }), null);
  });
  it("rejects impossible future and ancient timestamps", () => {
    const future = Date.now() + 72e5;
    assert.equal(validateCurrencyCache({ timestamp: future, rates: { EUR: 0.9 } }), null);
    const ancient = 15463008e5;
    assert.equal(validateCurrencyCache({ timestamp: ancient, rates: { EUR: 0.9 } }), null);
  });
  it("filters invalid, negative, or NaN rates and rejects empty objects", () => {
    const corrupt = {
      timestamp: Date.now() - 1e3,
      rates: {
        EUR: -0.92,
        GBP: NaN,
        JPY: Infinity,
        USD: null
      }
    };
    assert.equal(validateCurrencyCache(corrupt), null);
    const mixed = {
      timestamp: Date.now() - 1e3,
      rates: {
        EUR: 0.92,
        BAD: -5,
        ZERO: 0
      }
    };
    const validated = validateCurrencyCache(mixed);
    assert.ok(validated !== null);
    assert.equal(validated.rates.EUR, 0.92);
    assert.equal(validated.rates.BAD, void 0);
    assert.equal(validated.rates.ZERO, void 0);
  });
});
describe("Task 6 & 14: Cache Freshness Policy & Boundary Tests", () => {
  it("classifies fresh cache correctly within TTL", () => {
    const now = 17e11;
    const freshFiat = now - (FIAT_FRESH_TTL_MS - 5e3);
    assert.equal(classifyDataFreshness(freshFiat, FIAT_FRESH_TTL_MS, FIAT_STALE_TTL_MS, now), "cached");
    const freshCrypto = now - (CRYPTO_FRESH_TTL_MS - 1e3);
    assert.equal(classifyDataFreshness(freshCrypto, CRYPTO_FRESH_TTL_MS, CRYPTO_STALE_TTL_MS, now), "cached");
  });
  it("classifies exact TTL boundary correctly", () => {
    const now = 17e11;
    const boundary = now - FIAT_FRESH_TTL_MS;
    assert.equal(classifyDataFreshness(boundary, FIAT_FRESH_TTL_MS, FIAT_STALE_TTL_MS, now), "cached");
  });
  it("classifies stale cache beyond fresh TTL but within stale window", () => {
    const now = 17e11;
    const staleFiat = now - 72e5;
    assert.equal(classifyDataFreshness(staleFiat, FIAT_FRESH_TTL_MS, FIAT_STALE_TTL_MS, now), "stale");
    const staleCrypto = now - 6e5;
    assert.equal(classifyDataFreshness(staleCrypto, CRYPTO_FRESH_TTL_MS, CRYPTO_STALE_TTL_MS, now), "stale");
  });
  it("classifies expired cache exceeding stale allowance", () => {
    const now = 17e11;
    const expired = now - 9e7;
    assert.equal(classifyDataFreshness(expired, FIAT_FRESH_TTL_MS, FIAT_STALE_TTL_MS, now), "expired");
  });
  it("classifies slight clock skew / current session data as live", () => {
    const now = 17e11;
    const slightFuture = now + 500;
    assert.equal(classifyDataFreshness(slightFuture, FIAT_FRESH_TTL_MS, FIAT_STALE_TTL_MS, now), "live");
  });
});
describe("Task 14 & 15: Currency Conversion Mathematics & Fallback Elimination", () => {
  const rates = {
    EUR: 0.92,
    GBP: 0.79,
    JPY: 154.5,
    PKR: 278.5
  };
  it("converts base USD to target currency accurately", () => {
    const res = convertCurrencyAmount(100, "USD", "EUR", rates, "USD");
    assert.ok(res !== null);
    assert.equal(res, 92);
  });
  it("converts target currency to base USD accurately", () => {
    const res = convertCurrencyAmount(92, "EUR", "USD", rates, "USD");
    assert.ok(res !== null);
    assert.equal(res, 100);
  });
  it("performs cross-currency conversions accurately via base rate", () => {
    const res = convertCurrencyAmount(100, "EUR", "GBP", rates, "USD");
    assert.ok(res !== null);
    assert.ok(Math.abs(res - 85.869565) < 1e-3);
  });
  it("handles identity currency conversions safely", () => {
    assert.equal(convertCurrencyAmount(50, "USD", "USD", rates, "USD"), 50);
    assert.equal(convertCurrencyAmount(50, "EUR", "EUR", rates, "USD"), 50);
  });
  it("handles zero currency amount correctly without error", () => {
    assert.equal(convertCurrencyAmount(0, "USD", "EUR", rates, "USD"), 0);
    assert.equal(convertCurrencyAmount(0, "EUR", "GBP", rates, "USD"), 0);
  });
  it("CRITICAL SAFETY: rejects unknown source currency code without silent USD fallback", () => {
    const res = convertCurrencyAmount(100, "NONEXISTENT", "EUR", rates, "USD");
    assert.equal(res, null, "Unknown source currency must return null and never default to rate 1");
  });
  it("CRITICAL SAFETY: rejects unknown target currency code without silent USD fallback", () => {
    const res = convertCurrencyAmount(100, "USD", "NONEXISTENT", rates, "USD");
    assert.equal(res, null, "Unknown target currency must return null and never default to rate 1");
  });
  it("rejects NaN, Infinity, and non-numeric currency amounts", () => {
    assert.equal(convertCurrencyAmount(NaN, "USD", "EUR", rates, "USD"), null);
    assert.equal(convertCurrencyAmount(Infinity, "USD", "EUR", rates, "USD"), null);
    assert.equal(convertCurrencyAmount(-Infinity, "USD", "EUR", rates, "USD"), null);
    assert.equal(convertCurrencyAmount("100", "USD", "EUR", rates, "USD"), null);
  });
});
describe("Task 16 & 18: Cryptocurrency Conversion & Input Boundary Verification", () => {
  const prices = {
    BTC: 6e4,
    ETH: 3e3,
    SOL: 150
  };
  it("converts crypto pairs accurately (BTC to ETH)", () => {
    const res = convertCryptoAmount(1, "BTC", "ETH", prices);
    assert.equal(res, 20);
  });
  it("converts smaller asset to larger asset accurately (ETH to BTC)", () => {
    const res = convertCryptoAmount(20, "ETH", "BTC", prices);
    assert.equal(res, 1);
  });
  it("handles crypto identity conversion", () => {
    assert.equal(convertCryptoAmount(5, "BTC", "BTC", prices), 5);
  });
  it("handles zero crypto amount correctly", () => {
    assert.equal(convertCryptoAmount(0, "BTC", "ETH", prices), 0);
  });
  it("TASK 16/18 BOUNDARY: rejects negative crypto quantities", () => {
    const res = convertCryptoAmount(-1, "BTC", "ETH", prices);
    assert.equal(res, null, "Negative crypto quantities must return null");
  });
  it("rejects unknown cryptocurrencies without prices", () => {
    assert.equal(convertCryptoAmount(1, "UNKNOWN_COIN", "ETH", prices), null);
    assert.equal(convertCryptoAmount(1, "BTC", "UNKNOWN_COIN", prices), null);
  });
  it("verifies all supported crypto assets have defined symbols and IDs", () => {
    assert.equal(SUPPORTED_CRYPTO_ASSETS.length, 10);
    for (const asset of SUPPORTED_CRYPTO_ASSETS) {
      assert.ok(asset.id.length > 0);
      assert.ok(asset.symbol.length > 0);
      assert.ok(asset.name.length > 0);
    }
  });
});
describe("Task 7, 8 & 10: Financial HTTP Error & Rate Limit Architecture", () => {
  it("instantiates FinancialHttpError with correct status and message", () => {
    const err = new FinancialHttpError(500, "Internal Server Error");
    assert.equal(err.status, 500);
    assert.equal(err.message, "Internal Server Error");
    assert.equal(err.name, "FinancialHttpError");
  });
  it("instantiates RateLimitError with status 429", () => {
    const err = new RateLimitError("CoinGecko 429");
    assert.equal(err.status, 429);
    assert.equal(err.name, "RateLimitError");
    assert.ok(err instanceof FinancialHttpError);
  });
  it("instantiates TimeoutError with default timeout threshold", () => {
    const err = new TimeoutError();
    assert.ok(err.message.includes(`${FINANCIAL_FETCH_TIMEOUT_MS}ms`));
    assert.equal(err.name, "TimeoutError");
  });
});
describe("Task 19 & 41: Service Worker Invariant & Cross-Origin API Protection", () => {
  const APP_ORIGIN = "https://numanx-studio-omega-converter.netlify.app";
  it("strictly classifies open.er-api.com as CROSS_ORIGIN", () => {
    const classification = classifyRequest("https://open.er-api.com/v6/latest/USD", "cors", "GET", APP_ORIGIN);
    assert.equal(classification, "CROSS_ORIGIN");
  });
  it("strictly classifies api.coingecko.com as CROSS_ORIGIN", () => {
    const classification = classifyRequest(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
      "cors",
      "GET",
      APP_ORIGIN
    );
    assert.equal(classification, "CROSS_ORIGIN");
  });
  it("guarantees CROSS_ORIGIN failures NEVER receive HTML offline fallback", () => {
    const fallback = getOfflineFallbackForType("CROSS_ORIGIN");
    assert.equal(fallback, null, "Financial API failures must return null, never index.html");
  });
});
