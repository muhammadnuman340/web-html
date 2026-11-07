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
var PWA_CACHE_VERSION = "v4";
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

// src/engine/categories.ts
var Categories = [
  {
    id: "length",
    lb: "Length",
    ic: "\u{1F4CF}",
    cl: "#6c63ff",
    al: ["distance", "meter", "kilometer", "mile", "foot", "inch"],
    un: [
      { id: "nm", lb: "Nanometer", r: 1e-9, s: "M" },
      { id: "um", lb: "Micrometer", r: 1e-6, s: "M" },
      { id: "mm", lb: "Millimeter", r: 1e-3, s: "M" },
      { id: "cm", lb: "Centimeter", r: 0.01, s: "M" },
      { id: "dm", lb: "Decimeter", r: 0.1, s: "M" },
      { id: "m", lb: "Meter", r: 1, s: "M" },
      { id: "km", lb: "Kilometer", r: 1e3, s: "M" },
      { id: "in", lb: "Inch", r: 0.0254, s: "I" },
      { id: "ft", lb: "Foot", r: 0.3048, s: "I", al: ["feet"] },
      { id: "yd", lb: "Yard", r: 0.9144, s: "I" },
      { id: "mi", lb: "Mile", r: 1609.344, s: "I" },
      { id: "nmi", lb: "Nautical Mile", r: 1852, s: "O" },
      { id: "furlong", lb: "Furlong", r: 201.168, s: "I" },
      { id: "chain", lb: "Chain", r: 20.1168, s: "I" },
      { id: "rod", lb: "Rod", r: 5.0292, s: "I" },
      { id: "hand", lb: "Hand", r: 0.1016, s: "I" },
      { id: "cubit", lb: "Cubit", r: 0.4572, s: "O" },
      { id: "ly", lb: "Light Year", r: 9461e12, s: "S" },
      { id: "au", lb: "Astronomical Unit", r: 1496e8, s: "S" },
      { id: "pc", lb: "Parsec", r: 3086e13, s: "S" },
      { id: "ld", lb: "Lunar Distance", r: 3844e5, s: "S" },
      { id: "sr", lb: "Solar Radius", r: 6957e5, s: "S" },
      { id: "er", lb: "Earth Radius", r: 6371e3, s: "S" }
    ]
  },
  {
    id: "area",
    lb: "Area",
    ic: "\u25A3",
    cl: "#9b59b6",
    un: [
      { id: "mm2", lb: "mm\xB2", r: 1e-6, s: "M" },
      { id: "cm2", lb: "cm\xB2", r: 1e-4, s: "M" },
      { id: "m2", lb: "m\xB2", r: 1, s: "M" },
      { id: "km2", lb: "km\xB2", r: 1e6, s: "M" },
      { id: "in2", lb: "in\xB2", r: 64516e-8, s: "I" },
      { id: "ft2", lb: "ft\xB2", r: 0.092903, s: "I" },
      { id: "yd2", lb: "yd\xB2", r: 0.836127, s: "I" },
      { id: "ac", lb: "Acre", r: 4046.86, s: "I" },
      { id: "ha", lb: "Hectare", r: 1e4, s: "M" },
      { id: "mi2", lb: "mi\xB2", r: 259e4, s: "I" },
      { id: "twp", lb: "Township", r: 9324e4, s: "I" },
      { id: "barn", lb: "Barn", r: 1e-28, s: "S" }
    ]
  },
  {
    id: "volume",
    lb: "Volume",
    ic: "\u{1F9EA}",
    cl: "#3498db",
    un: [
      { id: "mL", lb: "Milliliter", r: 1e-3, s: "M" },
      { id: "L", lb: "Liter", r: 1, s: "M" },
      { id: "m3", lb: "Cubic Meter", r: 1e3, s: "M" },
      { id: "in3", lb: "Cubic Inch", r: 0.0163871, s: "I" },
      { id: "ft3", lb: "Cubic Foot", r: 28.3168, s: "I" },
      { id: "gal", lb: "Gallon", r: 3.78541, s: "I" },
      { id: "qt", lb: "Quart", r: 0.946353, s: "I" },
      { id: "pt", lb: "Pint", r: 0.473176, s: "I" },
      { id: "bbl", lb: "Barrel", r: 158.987, s: "I" },
      { id: "floz", lb: "Fluid Ounce", r: 0.0295735, s: "I" },
      { id: "tbsp", lb: "Tablespoon", r: 0.0147868, s: "I" },
      { id: "tsp", lb: "Teaspoon", r: 492892e-8, s: "I" },
      { id: "cup", lb: "Cup", r: 0.24, s: "I" },
      { id: "drop", lb: "Drop", r: 5e-5, s: "O" }
    ]
  },
  {
    id: "mass",
    lb: "Mass",
    ic: "\u2696\uFE0F",
    cl: "#2ecc71",
    al: ["weight", "gram", "kilogram", "pound"],
    un: [
      { id: "ug", lb: "Microgram", r: 1e-9, s: "M" },
      { id: "mg", lb: "Milligram", r: 1e-6, s: "M" },
      { id: "g", lb: "Gram", r: 1e-3, s: "M" },
      { id: "kg", lb: "Kilogram", r: 1, s: "M" },
      { id: "t", lb: "Metric Ton", r: 1e3, s: "M" },
      { id: "oz", lb: "Ounce", r: 0.0283495, s: "I" },
      { id: "lb", lb: "Pound", r: 0.453592, s: "I", al: ["lbs"] },
      { id: "stone", lb: "Stone", r: 6.35029, s: "I" },
      { id: "sh tn", lb: "Short Ton", r: 907.185, s: "I" },
      { id: "lg tn", lb: "Long Ton", r: 1016.05, s: "I" },
      { id: "ct", lb: "Carat", r: 2e-4, s: "O" },
      { id: "gr", lb: "Grain", r: 64799e-9, s: "I" },
      { id: "amu", lb: "Atomic Mass Unit", r: 1660539e-33, s: "S" }
    ]
  },
  {
    id: "temp",
    lb: "Temperature",
    ic: "\u{1F321}\uFE0F",
    cl: "#e74c3c",
    sp: true,
    al: ["celsius", "fahrenheit", "kelvin"],
    un: [
      { id: "C", lb: "\xB0C", s: "M", al: ["celsius"] },
      { id: "F", lb: "\xB0F", s: "I", al: ["fahrenheit"] },
      { id: "K", lb: "K", s: "S", al: ["kelvin"] },
      { id: "R", lb: "\xB0Rankine", s: "S" },
      { id: "Re", lb: "\xB0R\xE9aumur", s: "O" }
    ]
  },
  {
    id: "time",
    lb: "Time",
    ic: "\u23F1\uFE0F",
    cl: "#1abc9c",
    un: [
      { id: "ns", lb: "Nanosecond", r: 1e-9, s: "S" },
      { id: "us", lb: "Microsecond", r: 1e-6, s: "S" },
      { id: "ms", lb: "Millisecond", r: 1e-3, s: "S" },
      { id: "s", lb: "Second", r: 1, s: "S" },
      { id: "min", lb: "Minute", r: 60, s: "S" },
      { id: "hr", lb: "Hour", r: 3600, s: "S" },
      { id: "day", lb: "Day", r: 86400, s: "S" },
      { id: "week", lb: "Week", r: 604800, s: "S" },
      { id: "mo", lb: "Month", r: 2629800, s: "S" },
      { id: "yr", lb: "Year", r: 31557600, s: "S" },
      { id: "decade", lb: "Decade", r: 31558e4, s: "S" },
      { id: "century", lb: "Century", r: 31558e5, s: "S" },
      { id: "millennium", lb: "Millennium", r: 31558e6, s: "S" }
    ]
  },
  {
    id: "speed",
    lb: "Speed",
    ic: "\u{1F680}",
    cl: "#e67e22",
    un: [
      { id: "mps", lb: "m/s", r: 1, s: "M" },
      { id: "kmh", lb: "km/h", r: 0.277778, s: "M" },
      { id: "mph", lb: "mph", r: 0.44704, s: "I" },
      { id: "knot", lb: "Knot", r: 0.514444, s: "O" },
      { id: "mach", lb: "Mach", r: 343, s: "O" },
      { id: "c", lb: "Speed of Light", r: 299792458, s: "S" }
    ]
  },
  {
    id: "acceleration",
    lb: "Acceleration",
    ic: "\u{1F680}",
    cl: "#e91e63",
    un: [
      { id: "mps2", lb: "m/s\xB2", r: 1, s: "M" },
      { id: "gal", lb: "Gal", r: 0.01, s: "O" },
      { id: "ftps2", lb: "ft/s\xB2", r: 0.3048, s: "I" },
      { id: "gforce", lb: "g-force", r: 9.80665, s: "O" }
    ]
  },
  {
    id: "force",
    lb: "Force",
    ic: "\u{1F4AA}",
    cl: "#e91e63",
    un: [
      { id: "N", lb: "Newton", r: 1, s: "M" },
      { id: "kN", lb: "Kilonewton", r: 1e3, s: "M" },
      { id: "dyn", lb: "Dyne", r: 1e-5, s: "M" },
      { id: "lbf", lb: "Pound-force", r: 4.4482216152605, s: "I" },
      { id: "kgf", lb: "Kilogram-force", r: 9.80665, s: "M" }
    ]
  },
  {
    id: "pressure",
    lb: "Pressure",
    ic: "\u{1F535}",
    cl: "#00bcd4",
    un: [
      { id: "Pa", lb: "Pascal", r: 1, s: "M" },
      { id: "kPa", lb: "Kilopascal", r: 1e3, s: "M" },
      { id: "MPa", lb: "Megapascal", r: 1e6, s: "M" },
      { id: "bar", lb: "Bar", r: 1e5, s: "M" },
      { id: "psi", lb: "PSI", r: 6894.76, s: "I" },
      { id: "atm", lb: "Atmosphere", r: 101325, s: "O" },
      { id: "torr", lb: "Torr", r: 133.322, s: "O" },
      { id: "mmHg", lb: "mmHg", r: 133.322, s: "O" }
    ]
  },
  {
    id: "energy",
    lb: "Energy",
    ic: "\u26A1",
    cl: "#f39c12",
    un: [
      { id: "J", lb: "Joule", r: 1, s: "M" },
      { id: "kJ", lb: "Kilojoule", r: 1e3, s: "M" },
      { id: "cal", lb: "Calorie", r: 4.184, s: "M" },
      { id: "kcal", lb: "Kilocalorie", r: 4184, s: "M" },
      { id: "Wh", lb: "Watt-hour", r: 3600, s: "O" },
      { id: "kWh", lb: "Kilowatt-hour", r: 36e5, s: "O" },
      { id: "eV", lb: "Electronvolt", r: 1602e-22, s: "S" },
      { id: "BTU", lb: "BTU", r: 1055.06, s: "I" },
      { id: "therm", lb: "Therm", r: 1055e5, s: "I" }
    ]
  },
  {
    id: "power",
    lb: "Power",
    ic: "\u{1F4A1}",
    cl: "#ff9800",
    un: [
      { id: "W", lb: "Watt", r: 1, s: "M" },
      { id: "kW", lb: "Kilowatt", r: 1e3, s: "M" },
      { id: "MW", lb: "Megawatt", r: 1e6, s: "M" },
      { id: "hp", lb: "Horsepower", r: 745.7, s: "I" },
      { id: "BTUh", lb: "BTU/h", r: 0.29307107, s: "I" }
    ]
  },
  {
    id: "electricity",
    lb: "Electricity",
    ic: "\u26A1",
    cl: "#00e5ff",
    un: [
      { id: "A", lb: "Ampere", r: 1, s: "M" },
      { id: "mA", lb: "Milliampere", r: 1e-3, s: "M" },
      { id: "V", lb: "Volt", r: 1, s: "M" },
      { id: "kV", lb: "Kilovolt", r: 1e3, s: "M" },
      { id: "ohm", lb: "Ohm", r: 1, s: "M" },
      { id: "kohm", lb: "Kilo-ohm", r: 1e3, s: "M" },
      { id: "Mohm", lb: "Mega-ohm", r: 1e6, s: "M" },
      { id: "F", lb: "Farad", r: 1, s: "M" },
      { id: "uF", lb: "Microfarad", r: 1e-6, s: "M" },
      { id: "C", lb: "Coulomb", r: 1, s: "S" }
    ]
  },
  {
    id: "magnetism",
    lb: "Magnetism",
    ic: "\u{1F9F2}",
    cl: "#e040fb",
    un: [
      { id: "T", lb: "Tesla", r: 1, s: "M" },
      { id: "G", lb: "Gauss", r: 1e-4, s: "M" },
      { id: "Wb", lb: "Weber", r: 1, s: "S" }
    ]
  },
  {
    id: "frequency",
    lb: "Frequency",
    ic: "\u3030\uFE0F",
    cl: "#607d8b",
    un: [
      { id: "Hz", lb: "Hertz", r: 1, s: "M" },
      { id: "kHz", lb: "kHz", r: 1e3, s: "M" },
      { id: "MHz", lb: "MHz", r: 1e6, s: "M" },
      { id: "GHz", lb: "GHz", r: 1e9, s: "M" },
      { id: "THz", lb: "THz", r: 1e12, s: "M" },
      { id: "rpm", lb: "RPM", r: 1 / 60, s: "O" }
    ]
  },
  {
    id: "data",
    lb: "Data Storage",
    ic: "\u{1F4BE}",
    cl: "#34495e",
    un: [
      { id: "bit", lb: "Bit", r: 0.125, s: "M" },
      { id: "B", lb: "Byte", r: 1, s: "M" },
      { id: "KB", lb: "KB", r: 1e3, s: "M" },
      { id: "MB", lb: "MB", r: 1e6, s: "M" },
      { id: "GB", lb: "GB", r: 1e9, s: "M" },
      { id: "TB", lb: "TB", r: 1e12, s: "M" },
      { id: "PB", lb: "PB", r: 1e15, s: "M" },
      { id: "EB", lb: "EB", r: 1e18, s: "M" },
      { id: "ZB", lb: "ZB", r: 1e21, s: "M" },
      { id: "YB", lb: "YB", r: 1e24, s: "M" }
    ]
  },
  {
    id: "datatransfer",
    lb: "Data Transfer",
    ic: "\u{1F310}",
    cl: "#00acc1",
    un: [
      { id: "bps", lb: "bps", r: 1, s: "M" },
      { id: "kbps", lb: "Kbps", r: 1e3, s: "M" },
      { id: "Mbps", lb: "Mbps", r: 1e6, s: "M" },
      { id: "Gbps", lb: "Gbps", r: 1e9, s: "M" },
      { id: "Tbps", lb: "Tbps", r: 1e12, s: "M" }
    ]
  },
  {
    id: "angle",
    lb: "Angle",
    ic: "\u2221",
    cl: "#00bcd4",
    un: [
      { id: "deg", lb: "Degree", r: 1, s: "M" },
      { id: "rad", lb: "Radian", r: 180 / Math.PI, s: "S" },
      { id: "mrad", lb: "Milliradian", r: 0.18 / Math.PI, s: "S" },
      { id: "grad", lb: "Gradian", r: 0.9, s: "O" },
      { id: "arcmin", lb: "Arcminute", r: 1 / 60, s: "O" },
      { id: "arcsec", lb: "Arcsecond", r: 1 / 3600, s: "O" }
    ]
  },
  {
    id: "torque",
    lb: "Torque",
    ic: "\u{1F527}",
    cl: "#ff5722",
    un: [
      { id: "Nm", lb: "N\xB7m", r: 1, s: "M" },
      { id: "lbft", lb: "lb-ft", r: 1.35582, s: "I" }
    ]
  },
  {
    id: "fuel",
    lb: "Fuel Economy",
    ic: "\u26FD",
    cl: "#4caf50",
    sp: true,
    un: [
      { id: "mpgUS", lb: "MPG (US)" },
      { id: "mpgUK", lb: "MPG (UK)" },
      { id: "kmL", lb: "km/L" },
      { id: "L100km", lb: "L/100km" }
    ]
  },
  {
    id: "density",
    lb: "Density",
    ic: "\u2B21",
    cl: "#795548",
    un: [
      { id: "kgm3", lb: "kg/m\xB3", r: 1, s: "M" },
      { id: "gcm3", lb: "g/cm\xB3", r: 1e3, s: "M" },
      { id: "lbft3", lb: "lb/ft\xB3", r: 16.0185, s: "I" }
    ]
  },
  {
    id: "cooking",
    lb: "Cooking",
    ic: "\u{1F373}",
    cl: "#ffc107",
    un: [
      { id: "cup_c", lb: "Cup", r: 240, s: "I" },
      { id: "tbsp_c", lb: "Tablespoon", r: 15, s: "I" },
      { id: "tsp_c", lb: "Teaspoon", r: 5, s: "I" },
      { id: "dash", lb: "Dash", r: 0.615, s: "I" },
      { id: "pinch", lb: "Pinch", r: 0.308, s: "I" },
      { id: "floz_c", lb: "Fluid Ounce", r: 29.5735, s: "I" },
      { id: "mL_c", lb: "Milliliter", r: 1, s: "M" }
    ]
  },
  {
    id: "textile",
    lb: "Textile",
    ic: "\u{1F9F5}",
    cl: "#ab47bc",
    un: [
      { id: "gsm", lb: "GSM", r: 1, s: "O" },
      { id: "tc", lb: "Thread Count", r: 1, s: "O" },
      { id: "yc", lb: "Yarn Count", r: 1, s: "O" }
    ]
  },
  {
    id: "astronomy",
    lb: "Astronomy",
    ic: "\u{1F30C}",
    cl: "#7c4dff",
    un: [
      { id: "au_a", lb: "AU", r: 1, s: "S" },
      { id: "ly_a", lb: "Light Year", r: 63241.1, s: "S" },
      { id: "pc_a", lb: "Parsec", r: 206265, s: "S" },
      { id: "sm", lb: "Solar Mass", r: 1, s: "S" },
      { id: "em", lb: "Earth Mass", r: 3003e-9, s: "S" }
    ]
  }
];

// src/engine/routes.ts
var CUSTOM_CATEGORY_ALIASES = {
  temp: ["/temperature-converter", "/temperature", "/temp"],
  mass: ["/mass-converter", "/mass", "/weight-converter", "/weight"],
  data: ["/data-converter", "/data"]
};
var CATEGORY_ROUTES = Categories.map((cat) => {
  const custom = CUSTOM_CATEGORY_ALIASES[cat.id];
  const defaultAliases = [`/${cat.id}-converter`, `/${cat.id}`];
  const aliases = custom ? Array.from(/* @__PURE__ */ new Set([...custom, ...defaultAliases])) : defaultAliases;
  return {
    categoryId: cat.id,
    canonicalPath: `/convert/${cat.id}`,
    displayName: cat.lb,
    aliases
  };
});
var categoryById = /* @__PURE__ */ new Map();
var categoryByAlias = /* @__PURE__ */ new Map();
var categoryByCanonical = /* @__PURE__ */ new Map();
for (const r of CATEGORY_ROUTES) {
  categoryById.set(r.categoryId.toLowerCase(), r);
  categoryByCanonical.set(r.canonicalPath.toLowerCase(), r);
  for (const a of r.aliases) {
    categoryByAlias.set(a.toLowerCase(), r);
  }
}

// src/config/site.ts
var DEFAULT_SITE_URL = "https://converter.numanxstudio.com";
function getSiteUrl() {
  const envUrl = typeof process !== "undefined" && process.env?.VITE_SITE_URL ? process.env.VITE_SITE_URL : typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL ? import.meta.env.VITE_SITE_URL : void 0;
  const rawUrl = envUrl || DEFAULT_SITE_URL;
  return rawUrl.trim().replace(/\/+$/, "");
}
var SITE = {
  name: "Omega X",
  fullName: "Omega X Converter",
  organization: "NumanX Studio",
  url: `${getSiteUrl()}/`,
  defaultTitle: "Omega X Converter \u2014 Universal Unit & Currency Calculator",
  defaultDescription: "Free universal unit converter platform with 24 categories, 180+ units, live currency rates, crypto prices, formula charts, and offline PWA support.",
  license: "https://creativecommons.org/licenses/by/4.0/"
};

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
  const APP_ORIGIN = getSiteUrl();
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
