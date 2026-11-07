// tests/pwa.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

// src/utils/pwaLogic.ts
var PWA_CACHE_PREFIX = "omega-x-";
var PWA_CACHE_VERSION = "v4";
var PWA_STATIC_CACHE = `${PWA_CACHE_PREFIX}static-${PWA_CACHE_VERSION}`;
var PWA_PAGES_CACHE = `${PWA_CACHE_PREFIX}pages-${PWA_CACHE_VERSION}`;
var PRECACHE_STATIC = [
  "/favicon.svg",
  "/manifest.json",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg"
];
var PRECACHE_PAGES = [
  "/index.html",
  "/spa"
];
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
function isCacheableAssetResponse(status, ok, contentType) {
  if (!ok || status !== 200) return false;
  if (contentType && contentType.toLowerCase().includes("text/html")) return false;
  return true;
}
function isStaleOmegaCache(cacheName, currentCaches) {
  const active = currentCaches instanceof Set ? currentCaches : new Set(currentCaches);
  return cacheName.startsWith(PWA_CACHE_PREFIX) && !active.has(cacheName);
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

// tests/pwa.test.ts
var APP_ORIGIN = getSiteUrl();
describe("PWA Manifest & Static File Integrity", () => {
  it("public/manifest.json exists and parses as valid JSON", () => {
    assert.ok(fs.existsSync("public/manifest.json"), "manifest.json must exist in public/");
    const raw = fs.readFileSync("public/manifest.json", "utf8");
    const manifest = JSON.parse(raw);
    assert.equal(typeof manifest, "object");
  });
  it("manifest includes required standard PWA fields", () => {
    const raw = fs.readFileSync("public/manifest.json", "utf8");
    const manifest = JSON.parse(raw);
    assert.equal(manifest.name, "Omega X Converter \u2014 NumanX Studio");
    assert.equal(manifest.short_name, "Omega X");
    assert.equal(manifest.start_url, "/");
    assert.equal(manifest.scope, "/");
    assert.equal(manifest.display, "standalone");
    assert.equal(manifest.theme_color, "#060919");
    assert.equal(manifest.background_color, "#060919");
    assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0);
  });
  it("every icon referenced in manifest.json physically exists on disk", () => {
    const raw = fs.readFileSync("public/manifest.json", "utf8");
    const manifest = JSON.parse(raw);
    for (const icon of manifest.icons) {
      const rel = icon.src.replace(/^\//, "");
      const fullPath = path.join("public", rel);
      assert.ok(fs.existsSync(fullPath), `Icon file ${icon.src} must exist at ${fullPath}`);
      assert.equal(icon.type, "image/svg+xml", "SVG icons must truthfully declare image/svg+xml");
    }
    if (manifest.shortcuts) {
      for (const shortcut of manifest.shortcuts) {
        if (shortcut.icons) {
          for (const icon of shortcut.icons) {
            const rel = icon.src.replace(/^\//, "");
            const fullPath = path.join("public", rel);
            assert.ok(fs.existsSync(fullPath), `Shortcut icon ${icon.src} must exist at ${fullPath}`);
          }
        }
      }
    }
  });
  it("manifest icons are well-formed SVG files with valid graphics declarations", () => {
    const icon192 = fs.readFileSync("public/icons/icon-192.svg", "utf8");
    const icon512 = fs.readFileSync("public/icons/icon-512.svg", "utf8");
    const favicon = fs.readFileSync("public/favicon.svg", "utf8");
    assert.ok(icon192.includes("<svg") && icon192.includes("192"), "icon-192.svg must declare SVG graphics");
    assert.ok(icon512.includes("<svg") && icon512.includes("512"), "icon-512.svg must declare SVG graphics");
    assert.ok(favicon.includes("<svg"), "favicon.svg must declare SVG graphics");
  });
});
describe("HTML PWA Metadata & Theme Consistency", () => {
  it("index.html references the manifest and valid icons", () => {
    const html = fs.readFileSync("index.html", "utf8");
    assert.ok(html.includes('<link rel="manifest" href="/manifest.json" />'), "index.html must link to manifest.json");
    assert.ok(html.includes('<link rel="icon" type="image/svg+xml" href="/favicon.svg" />'), "index.html must link to favicon.svg");
    assert.ok(html.includes('<link rel="apple-touch-icon" href="/icons/icon-192.svg" />'), "index.html must link to existing apple-touch-icon");
    assert.ok(fs.existsSync("public/icons/icon-192.svg"), "apple-touch-icon must physically exist");
  });
  it("index.html dark theme-color aligns with manifest theme_color", () => {
    const html = fs.readFileSync("index.html", "utf8");
    const manifest = JSON.parse(fs.readFileSync("public/manifest.json", "utf8"));
    assert.ok(html.includes('content="#060919" media="(prefers-color-scheme: dark)"'), "index.html must set #060919 dark theme");
    assert.equal(manifest.theme_color, "#060919", "manifest theme_color must match #060919");
  });
});
describe("Service Worker Registration & Component Lifecycle", () => {
  it("src/main.tsx registers /sw.js with explicit root scope in production", () => {
    const mainTsx = fs.readFileSync("src/main.tsx", "utf8");
    assert.ok(mainTsx.includes("navigator.serviceWorker.register('/sw.js', { scope: '/' })"), "SW registration must set scope: /");
    assert.ok(mainTsx.includes("import.meta.env.PROD"), "SW registration must be production gated");
  });
  it("InstallPWA component is mounted exactly once in src/App.tsx", () => {
    const appTsx = fs.readFileSync("src/App.tsx", "utf8");
    const matches = [...appTsx.matchAll(/<InstallPWA\s*\/>/g)];
    assert.equal(matches.length, 1, "InstallPWA must be mounted exactly once");
  });
  it("InstallPWA component has event listener and timeout cleanup", () => {
    const installTsx = fs.readFileSync("src/components/widgets/InstallPWA.tsx", "utf8");
    assert.ok(installTsx.includes("removeEventListener('beforeinstallprompt'"), "Must clean up beforeinstallprompt listener");
    assert.ok(installTsx.includes("removeEventListener('appinstalled'"), "Must clean up appinstalled listener");
    assert.ok(installTsx.includes("clearTimeout(timerId)"), "Must clean up pending prompt delay timer");
    assert.ok(installTsx.includes("display-mode: standalone"), "Must check standalone display mode");
  });
});
describe("Pure Request Classification & Fallback Isolation Rules", () => {
  it("correctly classifies navigation requests", () => {
    assert.equal(classifyRequest(`${APP_ORIGIN}/`, "navigate", "GET", APP_ORIGIN), "NAVIGATION");
    assert.equal(classifyRequest(`${APP_ORIGIN}/convert/length`, "navigate", "GET", APP_ORIGIN), "NAVIGATION");
    assert.equal(classifyRequest(`${APP_ORIGIN}/convert/length/meter-to-foot`, "navigate", "GET", APP_ORIGIN), "NAVIGATION");
    assert.equal(classifyRequest(`${APP_ORIGIN}/about`, "navigate", "GET", APP_ORIGIN), "NAVIGATION");
  });
  it("correctly classifies hashed Vite assets", () => {
    assert.equal(classifyRequest(`${APP_ORIGIN}/assets/index-Dk029x.js`, "cors", "GET", APP_ORIGIN), "HASHED_ASSET");
    assert.equal(classifyRequest(`${APP_ORIGIN}/assets/style-Bx992a.css`, "no-cors", "GET", APP_ORIGIN), "HASHED_ASSET");
  });
  it("correctly classifies other same-origin static assets", () => {
    assert.equal(classifyRequest(`${APP_ORIGIN}/favicon.svg`, "no-cors", "GET", APP_ORIGIN), "STATIC_ASSET");
    assert.equal(classifyRequest(`${APP_ORIGIN}/manifest.json`, "cors", "GET", APP_ORIGIN), "STATIC_ASSET");
    assert.equal(classifyRequest(`${APP_ORIGIN}/icons/icon-192.svg`, "no-cors", "GET", APP_ORIGIN), "STATIC_ASSET");
  });
  it("correctly classifies cross-origin requests (financial APIs, fonts, analytics)", () => {
    assert.equal(classifyRequest("https://open.er-api.com/v6/latest/USD", "cors", "GET", APP_ORIGIN), "CROSS_ORIGIN");
    assert.equal(classifyRequest("https://api.coingecko.com/api/v3/simple/price", "cors", "GET", APP_ORIGIN), "CROSS_ORIGIN");
    assert.equal(classifyRequest("https://fonts.googleapis.com/css2", "cors", "GET", APP_ORIGIN), "CROSS_ORIGIN");
    assert.equal(classifyRequest("https://fonts.gstatic.com/s/inter/v13.woff2", "cors", "GET", APP_ORIGIN), "CROSS_ORIGIN");
  });
  it("correctly classifies non-GET requests as unsupported", () => {
    assert.equal(classifyRequest(`${APP_ORIGIN}/api/action`, "cors", "POST", APP_ORIGIN), "UNSUPPORTED_METHOD");
    assert.equal(classifyRequest(`${APP_ORIGIN}/settings`, "cors", "PUT", APP_ORIGIN), "UNSUPPORTED_METHOD");
    assert.equal(classifyRequest(`${APP_ORIGIN}/history`, "cors", "DELETE", APP_ORIGIN), "UNSUPPORTED_METHOD");
  });
  it("CRITICAL SAFETY RULE: SPA fallback (/index.html) is ONLY returned for NAVIGATION", () => {
    assert.equal(getOfflineFallbackForType("NAVIGATION"), "/index.html");
    assert.equal(getOfflineFallbackForType("HASHED_ASSET"), null, "Failed JS/CSS must NEVER receive HTML");
    assert.equal(getOfflineFallbackForType("STATIC_ASSET"), null, "Failed image/font must NEVER receive HTML");
    assert.equal(getOfflineFallbackForType("CROSS_ORIGIN"), null, "Failed cross-origin must NEVER receive HTML");
    assert.equal(getOfflineFallbackForType("UNSUPPORTED_METHOD"), null);
    assert.equal(getOfflineFallbackForType("UNSUPPORTED_PROTOCOL"), null);
    assert.equal(getOfflineFallbackForType("DEV_PATH"), null);
  });
  it("validates cacheable responses correctly", () => {
    assert.ok(isCacheableAssetResponse(200, true, "application/javascript"));
    assert.ok(isCacheableAssetResponse(200, true, "text/css"));
    assert.ok(isCacheableAssetResponse(200, true, "image/svg+xml"));
    assert.equal(isCacheableAssetResponse(404, false, "text/html"), false);
    assert.equal(isCacheableAssetResponse(500, false, "text/plain"), false);
    assert.equal(isCacheableAssetResponse(200, true, "text/html; charset=utf-8"), false, "HTML must never be cached as asset");
  });
});
describe("Cache Architecture, Versioning & Safe Stale Cleanup", () => {
  it("uses authoritative cache prefixes and distinct static/pages caches", () => {
    assert.ok(PWA_CACHE_PREFIX.startsWith("omega-x-"), "Cache prefix must be omega-x-");
    assert.ok(PWA_STATIC_CACHE.startsWith("omega-x-static-"), "Static cache must have versioned name");
    assert.ok(PWA_PAGES_CACHE.startsWith("omega-x-pages-"), "Pages cache must have versioned name");
    assert.notEqual(PWA_STATIC_CACHE, PWA_PAGES_CACHE, "Static and pages caches must be isolated");
  });
  it("precaches essential static assets and pages shell", () => {
    assert.ok(PRECACHE_STATIC.includes("/favicon.svg"));
    assert.ok(PRECACHE_STATIC.includes("/manifest.json"));
    assert.ok(PRECACHE_STATIC.includes("/icons/icon-192.svg"));
    assert.ok(PRECACHE_STATIC.includes("/icons/icon-512.svg"));
    assert.ok(PRECACHE_PAGES.includes("/index.html"));
    assert.ok(PRECACHE_PAGES.includes("/spa"));
  });
  it("identifies and purges obsolete Omega caches without touching unrelated origin caches", () => {
    const activeCaches = /* @__PURE__ */ new Set([PWA_STATIC_CACHE, PWA_PAGES_CACHE]);
    assert.ok(isStaleOmegaCache("omega-x-static-v2", activeCaches), "Must delete old static-v2");
    assert.ok(isStaleOmegaCache("omega-x-pages-v2", activeCaches), "Must delete old pages-v2");
    assert.ok(isStaleOmegaCache("omega-x-v1", activeCaches), "Must delete old legacy v1");
    assert.equal(isStaleOmegaCache(PWA_STATIC_CACHE, activeCaches), false, "Must keep active static cache");
    assert.equal(isStaleOmegaCache(PWA_PAGES_CACHE, activeCaches), false, "Must keep active pages cache");
    assert.equal(isStaleOmegaCache("foreign-app-cache", activeCaches), false, "Must NOT touch foreign caches");
    assert.equal(isStaleOmegaCache("analytics-v1", activeCaches), false, "Must NOT touch analytics cache");
    assert.equal(isStaleOmegaCache("other-suite-data", activeCaches), false, "Must NOT touch other origin caches");
  });
});
describe("Service Worker Runtime Execution & Routing Simulation", () => {
  it("simulates public/sw.js lifecycle and request interceptors accurately", async () => {
    const swSource = fs.readFileSync("public/sw.js", "utf8");
    const storage = /* @__PURE__ */ new Map();
    const listeners = {};
    const createMockCache = (name) => ({
      addAll: async (urls) => {
        let store = storage.get(name);
        if (!store) {
          store = /* @__PURE__ */ new Map();
          storage.set(name, store);
        }
        for (const u of urls) {
          store.set(u, new Response(`Content of ${u}`, { status: 200 }));
        }
      },
      match: async (reqOrUrl) => {
        const u = typeof reqOrUrl === "string" ? reqOrUrl : reqOrUrl.url;
        const pathOnly = u.replace(APP_ORIGIN, "");
        const store = storage.get(name);
        return store ? store.get(pathOnly) || store.get(u) || null : null;
      },
      put: async (req, res) => {
        let store = storage.get(name);
        if (!store) {
          store = /* @__PURE__ */ new Map();
          storage.set(name, store);
        }
        const u = typeof req === "string" ? req : req.url;
        const pathOnly = u.replace(APP_ORIGIN, "");
        store.set(pathOnly, res);
      }
    });
    const mockCaches = {
      open: async (name) => createMockCache(name),
      match: async (reqOrUrl) => {
        const u = typeof reqOrUrl === "string" ? reqOrUrl : reqOrUrl.url;
        const pathOnly = u.replace(APP_ORIGIN, "");
        for (const [, store] of storage.entries()) {
          const hit = store.get(pathOnly) || store.get(u);
          if (hit) return hit;
        }
        return null;
      },
      keys: async () => Array.from(storage.keys()),
      delete: async (name) => storage.delete(name)
    };
    const mockSelf = {
      location: { origin: APP_ORIGIN },
      addEventListener: (type, fn) => {
        listeners[type] = fn;
      }
    };
    let mockFetch = async () => new Response("Default Network", { status: 200 });
    const sandbox = {
      self: mockSelf,
      caches: mockCaches,
      fetch: (req) => mockFetch(req),
      URL,
      Response,
      Headers,
      Promise,
      Set,
      console
    };
    vm.runInNewContext(swSource, sandbox);
    assert.ok(listeners["install"], "Install listener must be registered");
    let installWaitPromise = null;
    listeners["install"]({ waitUntil: (p) => {
      installWaitPromise = p;
    } });
    await installWaitPromise;
    assert.ok(storage.has("omega-x-static-v4"), "Static cache must be created on install");
    assert.ok(storage.has("omega-x-pages-v4"), "Pages cache must be created on install");
    storage.set("omega-x-static-v3", /* @__PURE__ */ new Map());
    storage.set("unrelated-domain-cache", /* @__PURE__ */ new Map());
    let activateWaitPromise = null;
    listeners["activate"]({ waitUntil: (p) => {
      activateWaitPromise = p;
    } });
    await activateWaitPromise;
    assert.equal(storage.has("omega-x-static-v3"), false, "Old omega cache must be deleted on activate");
    assert.equal(storage.has("unrelated-domain-cache"), true, "Unrelated origin cache must be preserved on activate");
    const runFetch = async (req) => {
      let respondPromise = null;
      listeners["fetch"]({
        request: req,
        respondWith: (p) => {
          respondPromise = p;
        }
      });
      return respondPromise ? await respondPromise : null;
    };
    mockFetch = async () => new Response("Online Document HTML", {
      status: 200,
      headers: { "Content-Type": "text/html" }
    });
    const navOnlineRes = await runFetch({
      method: "GET",
      url: `${APP_ORIGIN}/convert/length`,
      mode: "navigate",
      headers: new Headers({ accept: "text/html" })
    });
    assert.ok(navOnlineRes);
    assert.equal(await navOnlineRes.text(), "Online Document HTML");
    mockFetch = async () => {
      throw new TypeError("Network down");
    };
    const navOfflineRes = await runFetch({
      method: "GET",
      url: `${APP_ORIGIN}/convert/mass`,
      mode: "navigate",
      headers: new Headers({ accept: "text/html" })
    });
    assert.ok(navOfflineRes, "Offline navigation must resolve to cached shell");
    const navOfflineText = await navOfflineRes.text();
    assert.equal(navOfflineText, "Content of /spa");
    mockFetch = async () => new Response('console.log("chunk");', {
      status: 200,
      headers: { "Content-Type": "application/javascript" }
    });
    const jsOnlineRes = await runFetch({
      method: "GET",
      url: `${APP_ORIGIN}/assets/bundle-123.js`,
      mode: "cors",
      headers: new Headers()
    });
    assert.ok(jsOnlineRes);
    assert.equal(await jsOnlineRes.text(), 'console.log("chunk");');
    mockFetch = async () => {
      throw new TypeError("Network failure");
    };
    await assert.rejects(
      async () => {
        await runFetch({
          method: "GET",
          url: `${APP_ORIGIN}/assets/nonexistent-chunk.js`,
          mode: "cors",
          headers: new Headers()
        });
      },
      /Network failure/,
      "Failed JS request must fail as a network error, NEVER returning index.html"
    );
    await assert.rejects(
      async () => {
        await runFetch({
          method: "GET",
          url: `${APP_ORIGIN}/assets/nonexistent-style.css`,
          mode: "no-cors",
          headers: new Headers()
        });
      },
      /Network failure/,
      "Failed CSS request must fail as a network error, NEVER returning index.html"
    );
    const imgFailRes = await runFetch({
      method: "GET",
      url: `${APP_ORIGIN}/icons/missing-icon.png`,
      mode: "no-cors",
      headers: new Headers()
    });
    assert.ok(imgFailRes, "Missing static asset returns fallback response");
    assert.equal(imgFailRes.status, 404);
    assert.equal(imgFailRes.headers.get("Content-Type"), "text/plain; charset=utf-8");
    assert.equal(await imgFailRes.text(), "Asset not found");
    const crossOriginRes = await runFetch({
      method: "GET",
      url: "https://open.er-api.com/v6/latest/USD",
      mode: "cors",
      headers: new Headers()
    });
    assert.equal(crossOriginRes, null, "Cross-origin APIs must pass through untouched");
    const postRes = await runFetch({
      method: "POST",
      url: `${APP_ORIGIN}/convert`,
      mode: "cors",
      headers: new Headers()
    });
    assert.equal(postRes, null, "Non-GET requests must pass through untouched");
  });
});
