// tests/routing.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";

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
      { id: "dyn", lb: "Dyne", r: 1e-5, s: "M" },
      { id: "lbf", lb: "Pound-force", r: 4.44822, s: "I" },
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
      { id: "hp", lb: "Horsepower", r: 745.7, s: "I" }
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
      { id: "THz", lb: "THz", r: 1e12, s: "M" }
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
      { id: "rad", lb: "Radian", r: 57.2958, s: "S" },
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
var STATIC_ROUTES = [
  { path: "/", label: "Home", type: "core", description: "Universal unit converter homepage" },
  { path: "/converter", label: "Universal Converter", type: "core", description: "Standard converter workspace" },
  { path: "/convert", label: "Converter Redirect", type: "core", description: "Root convert route rendering converter" },
  { path: "/categories", label: "Browse Categories", type: "core", description: "Directory of all 24 categories" },
  { path: "/dashboard", label: "Dashboard", type: "feature", description: "Analytics and usage control center" },
  { path: "/currency", label: "Currency", type: "feature", description: "Live forex converter with 160+ currencies" },
  { path: "/crypto", label: "Crypto", type: "feature", description: "Real-time cryptocurrency price converter" },
  { path: "/formulas", label: "Formula Explorer", type: "feature", description: "Interactive scientific and engineering formulas" },
  { path: "/calculator", label: "Calculator", type: "feature", description: "Quick calculation and conversion interface" },
  { path: "/health", label: "Health Hub", type: "feature", description: "BMI, BMR, and body composition calculators" },
  { path: "/favorites", label: "Favorites", type: "utility", description: "Bookmarked conversion pairs" },
  { path: "/history", label: "History", type: "utility", description: "Calculation history and log" },
  { path: "/custom-units", label: "Custom Units", type: "utility", description: "User-defined custom unit manager" },
  { path: "/settings", label: "Settings", type: "utility", description: "Preferences and theme settings" },
  { path: "/help", label: "Help", type: "utility", description: "Keyboard shortcuts and documentation" },
  { path: "/sitemap", label: "Sitemap", type: "utility", description: "Complete HTML sitemap directory" },
  { path: "/blog", label: "Blog", type: "editorial", description: "Metrology guides and conversion articles" },
  { path: "/about", label: "About", type: "editorial", description: "Standards compliance and project info" }
];
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
var SLUG_DISAMBIGUATION = {
  temperature: "temp",
  weight: "mass"
};
function resolveCategoryId(input) {
  if (!input) return void 0;
  const cleaned = input.trim().toLowerCase();
  const slug = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
  const fromCanonical = categoryByCanonical.get(slug);
  if (fromCanonical) return fromCanonical.categoryId;
  const fromAlias = categoryByAlias.get(slug);
  if (fromAlias) return fromAlias.categoryId;
  const fromId = categoryById.get(cleaned);
  if (fromId) return fromId.categoryId;
  if (SLUG_DISAMBIGUATION[cleaned]) {
    return SLUG_DISAMBIGUATION[cleaned];
  }
  return void 0;
}
function getCanonicalCategoryPath(categoryIdOrAlias) {
  const catId = resolveCategoryId(categoryIdOrAlias);
  if (!catId) return void 0;
  return `/convert/${catId}`;
}
function getAllCategoryRoutes() {
  return CATEGORY_ROUTES;
}
function detectRouteCollisions() {
  const pathMap = /* @__PURE__ */ new Map();
  function register(path, type) {
    const list = pathMap.get(path) || [];
    list.push(type);
    pathMap.set(path, list);
  }
  for (const s of STATIC_ROUTES) {
    register(s.path, `static:${s.type}`);
  }
  for (const c of CATEGORY_ROUTES) {
    register(c.canonicalPath, `canonical:${c.categoryId}`);
    for (const a of c.aliases) {
      register(a, `alias:${c.categoryId}`);
    }
  }
  const collisions = [];
  for (const [path, types] of pathMap.entries()) {
    if (types.length > 1) {
      collisions.push({ path, types });
    }
  }
  return {
    collisions,
    hasCollisions: collisions.length > 0
  };
}

// tests/routing.test.ts
describe("Task 17.1 & 17.2: Canonical Category Route Integrity", () => {
  it("guarantees all 24 categories have a canonical route", () => {
    const routes = getAllCategoryRoutes();
    assert.equal(routes.length, 24, "Expected exactly 24 category route definitions");
    assert.equal(Categories.length, 24, "Expected Categories registry to have 24 definitions");
    for (const cat of Categories) {
      const r = routes.find((entry) => entry.categoryId === cat.id);
      assert.ok(r, `Missing route definition for category "${cat.id}"`);
      assert.equal(r?.canonicalPath, `/convert/${cat.id}`);
      assert.equal(r?.displayName, cat.lb);
    }
  });
  it("guarantees canonical category routes are unique and URL-safe", () => {
    const paths = CATEGORY_ROUTES.map((r) => r.canonicalPath);
    const uniquePaths = new Set(paths);
    assert.equal(uniquePaths.size, paths.length, "Canonical paths must be strictly unique");
    for (const p of paths) {
      assert.match(p, /^\/convert\/[a-zA-Z0-9]+$/, `Canonical path "${p}" is not URL-safe`);
      assert.ok(!p.includes(" "), `Canonical path "${p}" must not contain spaces`);
    }
  });
});
describe("Task 17.3 & 17.4: Route Collision & Alias Safety Audit", () => {
  it("confirms zero collisions between static routes, canonical routes, and aliases", () => {
    const audit = detectRouteCollisions();
    assert.equal(audit.hasCollisions, false, `Detected unexpected collisions: ${JSON.stringify(audit.collisions)}`);
    assert.equal(audit.collisions.length, 0);
  });
  it("verifies all category aliases are unique across categories", () => {
    const aliasToCategory = /* @__PURE__ */ new Map();
    for (const r of CATEGORY_ROUTES) {
      for (const alias of r.aliases) {
        const existing = aliasToCategory.get(alias);
        assert.ok(
          !existing,
          `Alias collision: "${alias}" is claimed by both "${existing}" and "${r.categoryId}"`
        );
        aliasToCategory.set(alias, r.categoryId);
      }
    }
  });
  it("verifies category aliases do not collide with static application routes", () => {
    const staticPaths = new Set(STATIC_ROUTES.map((s) => s.path));
    for (const r of CATEGORY_ROUTES) {
      assert.ok(
        !staticPaths.has(r.canonicalPath),
        `Canonical path "${r.canonicalPath}" collides with a static route`
      );
      for (const alias of r.aliases) {
        assert.ok(
          !staticPaths.has(alias),
          `Category alias "${alias}" collides with static route`
        );
      }
    }
  });
});
describe("Task 6: Route Resolution & Alias Compatibility", () => {
  it("resolves canonical category paths to their authoritative category ID", () => {
    for (const r of CATEGORY_ROUTES) {
      assert.equal(resolveCategoryId(r.canonicalPath), r.categoryId);
      assert.equal(getCanonicalCategoryPath(r.canonicalPath), r.canonicalPath);
    }
  });
  it("resolves raw category IDs to their authoritative category ID", () => {
    for (const r of CATEGORY_ROUTES) {
      assert.equal(resolveCategoryId(r.categoryId), r.categoryId);
      assert.equal(getCanonicalCategoryPath(r.categoryId), r.canonicalPath);
    }
  });
  it("resolves legacy and semantic aliases to their authoritative category ID", () => {
    assert.equal(resolveCategoryId("/temperature-converter"), "temp");
    assert.equal(resolveCategoryId("/temperature"), "temp");
    assert.equal(resolveCategoryId("temperature"), "temp");
    assert.equal(resolveCategoryId("/temp"), "temp");
    assert.equal(getCanonicalCategoryPath("/temperature-converter"), "/convert/temp");
    assert.equal(resolveCategoryId("/mass-converter"), "mass");
    assert.equal(resolveCategoryId("/weight-converter"), "mass");
    assert.equal(resolveCategoryId("/weight"), "mass");
    assert.equal(resolveCategoryId("weight"), "mass");
    assert.equal(getCanonicalCategoryPath("/weight-converter"), "/convert/mass");
    assert.equal(resolveCategoryId("/length-converter"), "length");
    assert.equal(resolveCategoryId("/length"), "length");
    assert.equal(getCanonicalCategoryPath("/length-converter"), "/convert/length");
    assert.equal(resolveCategoryId("/data-converter"), "data");
    assert.equal(resolveCategoryId("/data"), "data");
    assert.equal(resolveCategoryId("/speed-converter"), "speed");
    assert.equal(resolveCategoryId("/cooking-converter"), "cooking");
    assert.equal(resolveCategoryId("/astronomy-converter"), "astronomy");
  });
  it("returns undefined for invalid categories and unrecognized paths", () => {
    assert.equal(resolveCategoryId(""), void 0);
    assert.equal(resolveCategoryId("/non-existent-category"), void 0);
    assert.equal(resolveCategoryId("random-gibberish"), void 0);
    assert.equal(getCanonicalCategoryPath("unknown-xyz"), void 0);
  });
});
describe("Task 7 & 8: Static & Special Route Audit", () => {
  it("verifies all essential static routes exist and are well-formed", () => {
    const requiredStaticPaths = [
      "/",
      "/converter",
      "/convert",
      "/categories",
      "/dashboard",
      "/currency",
      "/crypto",
      "/formulas",
      "/calculator",
      "/health",
      "/favorites",
      "/history",
      "/custom-units",
      "/settings",
      "/help",
      "/sitemap",
      "/blog",
      "/about"
    ];
    const registered = new Set(STATIC_ROUTES.map((s) => s.path));
    for (const path of requiredStaticPaths) {
      assert.ok(registered.has(path), `Static route "${path}" is missing from STATIC_ROUTES registry`);
    }
  });
  it('verifies "/health" is documented and categorized as a user-facing feature route', () => {
    const health = STATIC_ROUTES.find((s) => s.path === "/health");
    assert.ok(health, 'Route "/health" must exist');
    assert.equal(health?.type, "feature");
    assert.equal(health?.label, "Health Hub");
  });
  it("guarantees static route paths are unique", () => {
    const paths = STATIC_ROUTES.map((s) => s.path);
    const unique = new Set(paths);
    assert.equal(unique.size, paths.length, "Static routes must have unique paths");
  });
});
describe("Task 13: Pair Route Parsing & URL Safety", () => {
  it("parses valid pair slugs into source and target units", () => {
    function parsePair(slug) {
      const parts = slug.toLowerCase().split("-to-");
      if (parts.length === 2 && parts[0] && parts[1]) {
        return { fromSlug: parts[0], toSlug: parts[1] };
      }
      return null;
    }
    const test1 = parsePair("kg-to-lbs");
    assert.deepEqual(test1, { fromSlug: "kg", toSlug: "lbs" });
    const test2 = parsePair("meter-to-feet");
    assert.deepEqual(test2, { fromSlug: "meter", toSlug: "feet" });
    const test3 = parsePair("celsius-to-fahrenheit");
    assert.deepEqual(test3, { fromSlug: "celsius", toSlug: "fahrenheit" });
    const test4 = parsePair("metric-ton-to-us-ton");
    assert.deepEqual(test4, { fromSlug: "metric-ton", toSlug: "us-ton" });
    assert.equal(parsePair("invalidpair"), null);
    assert.equal(parsePair("only-to"), null);
    assert.equal(parsePair("-to-feet"), null);
  });
  it("validates generated pair URLs contain no spaces and follow canonical format", () => {
    const testPairs = [
      { cat: "length", from: "m", to: "ft" },
      { cat: "mass", from: "kg", to: "lb" },
      { cat: "temp", from: "celsius", to: "fahrenheit" },
      { cat: "mass", from: "metric-ton", to: "us-ton" }
    ];
    for (const p of testPairs) {
      const canonicalPairUrl = `/convert/${p.cat}/${p.from}-to-${p.to}`;
      assert.ok(!canonicalPairUrl.includes(" "), `Pair URL "${canonicalPairUrl}" must not contain spaces`);
      assert.match(canonicalPairUrl, /^\/convert\/[a-z0-9]+\/[a-z0-9-]+-to-[a-z0-9-]+$/);
    }
  });
});
