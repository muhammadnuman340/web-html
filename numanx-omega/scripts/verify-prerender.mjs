// scripts/verify-prerender.ts
import fs from "node:fs";
import path from "node:path";

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

// scripts/verify-prerender.ts
var siteUrl = getSiteUrl();
var cwd = process.cwd();
var distDir = path.resolve(cwd, "dist");
var sitemapPath = path.resolve(distDir, "sitemap.xml");
if (!fs.existsSync(sitemapPath)) {
  console.error("\u274C dist/sitemap.xml not found. Please run sitemap generator first.");
  process.exit(1);
}
var sitemapXml = fs.readFileSync(sitemapPath, "utf8");
var urls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
if (urls.length === 0) {
  console.error("\u274C dist/sitemap.xml contains 0 URLs.");
  process.exit(1);
}
console.log(`
\u{1F50D} Verifying ${urls.length} prerendered routes against SSG invariants...`);
var failures = [];
var titles = /* @__PURE__ */ new Map();
var metaDescriptions = /* @__PURE__ */ new Map();
var categoryIntros = [];
for (const url of urls) {
  let routePath = "/";
  try {
    const parsed = new URL(url);
    routePath = parsed.pathname;
  } catch (e) {
    failures.push({ url, routePath: url, reason: `Invalid sitemap URL syntax: ${url}` });
    continue;
  }
  const cleanRoute = routePath.replace(/^\/+/, "").replace(/\/+$/, "");
  const filePath = routePath === "/" || routePath === "" ? path.join(distDir, "index.html") : path.join(distDir, `${cleanRoute}.html`);
  if (!fs.existsSync(filePath)) {
    failures.push({ url, routePath, reason: `Prerender file missing on disk: ${filePath}` });
    continue;
  }
  const html = fs.readFileSync(filePath, "utf8");
  const rootMatch = html.match(/<div id="root">\s*([\s\S]*?)\s*<\/div>/i);
  if (!rootMatch || !rootMatch[1].trim()) {
    failures.push({ url, routePath, reason: "#root is empty or missing static markup" });
  }
  const h1Matches = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  if (h1Matches.length !== 1) {
    failures.push({ url, routePath, reason: `Expected exactly 1 <h1>, found ${h1Matches.length}` });
  } else {
    const h1Text = h1Matches[0].replace(/<[^>]+>/g, "").trim();
    if (!h1Text) {
      failures.push({ url, routePath, reason: "<h1> element has empty text content" });
    }
  }
  const titleMatch = html.match(/<title\b[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";
  if (!title) {
    failures.push({ url, routePath, reason: "Missing or empty <title>" });
  } else {
    if (!titles.has(title)) titles.set(title, []);
    titles.get(title).push(routePath);
  }
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const desc = descMatch ? descMatch[1].trim() : "";
  if (!desc) {
    failures.push({ url, routePath, reason: "Missing or empty meta description" });
  } else {
    if (!metaDescriptions.has(desc)) metaDescriptions.set(desc, []);
    metaDescriptions.get(desc).push(routePath);
  }
  const canonMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical"/i);
  const canon = canonMatch ? canonMatch[1].trim() : "";
  if (!canon) {
    failures.push({ url, routePath, reason: "Missing canonical <link> tag" });
  } else if (canon !== url) {
    failures.push({ url, routePath, reason: `Canonical mismatch: sitemap="${url}", html="${canon}"` });
  } else if (canon.includes("?") || canon.includes("#")) {
    failures.push({ url, routePath, reason: `Canonical URL contains query or fragment: ${canon}` });
  }
  const jsonLdMatches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (jsonLdMatches.length === 0) {
    failures.push({ url, routePath, reason: "Missing JSON-LD structured data script" });
  } else {
    for (const match of jsonLdMatches) {
      try {
        JSON.parse(match[1]);
      } catch (e) {
        failures.push({ url, routePath, reason: `Invalid JSON-LD syntax: ${e.message}` });
      }
    }
  }
  const isCategoryLanding = /^\/convert\/[a-z0-9_-]+$/.test(routePath);
  if (isCategoryLanding) {
    const hasTable = /<table\b[^>]*>[\s\S]*?<\/table>/i.test(html);
    if (!hasTable) {
      failures.push({ url, routePath, reason: "Category landing page missing <table> element" });
    }
    const headerMatch = html.match(/<header\b[^>]*>([\s\S]*?)<\/header>/i);
    let introText = "";
    if (headerMatch) {
      const pMatches = [...headerMatch[1].matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)];
      introText = pMatches.map((m) => m[1].replace(/<[^>]+>/g, "").trim()).join(" ");
    }
    categoryIntros.push({ url, routePath, introText });
  }
}
console.log("\n\u{1F4CA} --- PRERENDER AUDIT DIAGNOSTICS ---");
var dupTitles = [...titles.entries()].filter(([_, r]) => r.length > 1);
console.log(`\u2022 Duplicate Titles: ${dupTitles.length}`);
if (dupTitles.length > 0) {
  dupTitles.forEach(([t, r]) => {
    console.log(`  - Title "${t}" shared by ${r.length} routes: ${r.join(", ")}`);
  });
}
var dupDescs = [...metaDescriptions.entries()].filter(([_, r]) => r.length > 1);
console.log(`\u2022 Duplicate Meta Descriptions: ${dupDescs.length}`);
if (dupDescs.length > 0) {
  dupDescs.forEach(([d, r]) => {
    console.log(`  - Description "${d}" shared by ${r.length} routes: ${r.join(", ")}`);
  });
}
function computeSimilarity(text1, text2) {
  const words1 = new Set(text1.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean));
  const words2 = new Set(text2.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean));
  if (words1.size === 0 || words2.size === 0) return 0;
  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = /* @__PURE__ */ new Set([...words1, ...words2]);
  return intersection.size / union.size;
}
var similarCategoryPairs = [];
for (let i = 0; i < categoryIntros.length; i++) {
  for (let j = i + 1; j < categoryIntros.length; j++) {
    const sim = computeSimilarity(categoryIntros[i].introText, categoryIntros[j].introText);
    if (sim > 0.8) {
      similarCategoryPairs.push({
        cat1: categoryIntros[i].routePath,
        cat2: categoryIntros[j].routePath,
        similarity: (sim * 100).toFixed(1) + "%"
      });
    }
  }
}
console.log(`\u2022 Category Intro Pairs with >80% Similarity: ${similarCategoryPairs.length}`);
if (similarCategoryPairs.length > 0) {
  similarCategoryPairs.forEach((p) => {
    console.log(`  - ${p.cat1} & ${p.cat2}: ${p.similarity}`);
  });
}
var spaPath = path.join(distDir, "spa.html");
if (!fs.existsSync(spaPath)) {
  failures.push({ url: "/spa.html", routePath: "/spa.html", reason: "dist/spa.html missing on disk" });
} else {
  const spaHtml = fs.readFileSync(spaPath, "utf8");
  const rootMatch = spaHtml.match(/<div id="root">\s*([\s\S]*?)\s*<\/div>/i);
  if (!rootMatch || rootMatch[1].trim().length > 0) {
    failures.push({ url: "/spa.html", routePath: "/spa.html", reason: "dist/spa.html #root must be empty" });
  }
  if (/<link[^>]*rel=["']canonical["']/i.test(spaHtml)) {
    failures.push({ url: "/spa.html", routePath: "/spa.html", reason: "dist/spa.html must not declare a canonical URL" });
  }
  if (/<h1\b/i.test(spaHtml)) {
    failures.push({ url: "/spa.html", routePath: "/spa.html", reason: "dist/spa.html must not contain an <h1>" });
  }
}
var notFoundPath = path.join(distDir, "404.html");
if (!fs.existsSync(notFoundPath)) {
  failures.push({ url: "/404.html", routePath: "/404.html", reason: "dist/404.html missing on disk" });
} else {
  const notFoundHtml = fs.readFileSync(notFoundPath, "utf8");
  if (!notFoundHtml.includes("Page Not Found") || !/<h1\b/i.test(notFoundHtml)) {
    failures.push({ url: "/404.html", routePath: "/404.html", reason: "dist/404.html must have an <h1>Page Not Found</h1>" });
  }
  if (!notFoundHtml.includes('href="/"') || !notFoundHtml.includes('href="/categories"')) {
    failures.push({ url: "/404.html", routePath: "/404.html", reason: "dist/404.html must link to / and /categories" });
  }
  if (!notFoundHtml.includes("noindex")) {
    failures.push({ url: "/404.html", routePath: "/404.html", reason: "dist/404.html must specify noindex" });
  }
}
var redirectsContent = fs.readFileSync(path.join(process.cwd(), "public/_redirects"), "utf8");
var alias301s = /* @__PURE__ */ new Set();
var spaRewrites = /* @__PURE__ */ new Set();
for (const line of redirectsContent.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 3) {
    if (parts[2] === "301") alias301s.add(parts[0]);
    else if (parts[2] === "200") spaRewrites.add(parts[0]);
  }
}
var distHtmlFiles = [];
function collectHtml(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "assets") {
      collectHtml(full);
    } else if (entry.name.endsWith(".html") && !entry.name.startsWith("google")) {
      distHtmlFiles.push(full);
    }
  }
}
collectHtml(distDir);
var totalInternalLinksChecked = 0;
var linkFailures = [];
for (const fPath of distHtmlFiles) {
  const relFile = path.relative(distDir, fPath);
  const fileHtml = fs.readFileSync(fPath, "utf8");
  for (const m of fileHtml.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)) {
    const rawHref = m[1].trim();
    if (!rawHref.startsWith("/") || rawHref.startsWith("//")) continue;
    totalInternalLinksChecked++;
    const urlPath = rawHref.split(/[?#]/)[0];
    if (urlPath !== "/" && urlPath.endsWith("/")) {
      linkFailures.push({ file: relFile, href: rawHref, reason: `Link has forbidden trailing slash: ${rawHref}` });
      continue;
    }
    if (urlPath.endsWith(".html")) {
      linkFailures.push({ file: relFile, href: rawHref, reason: `Link has forbidden .html extension: ${rawHref}` });
      continue;
    }
    if (alias301s.has(urlPath) || urlPath.startsWith("/category/")) {
      linkFailures.push({ file: relFile, href: rawHref, reason: `Link points to 301 redirect alias: ${rawHref}` });
      continue;
    }
    const clean = urlPath.replace(/^\/+/, "").replace(/\/+$/, "");
    const targetFile = clean === "" ? path.join(distDir, "index.html") : path.join(distDir, `${clean}.html`);
    const fileExists = fs.existsSync(targetFile);
    const isSpaRewrite = spaRewrites.has(urlPath) || urlPath.startsWith("/pair/") && spaRewrites.has("/pair/*");
    const isFunctionMatch = /^\/convert\/[a-z0-9_-]+\/[a-z0-9_-]+$/i.test(urlPath);
    if (!fileExists && !isSpaRewrite && !isFunctionMatch) {
      linkFailures.push({ file: relFile, href: rawHref, reason: `Target does not exist on disk and matches no rewrite/function: ${rawHref}` });
    }
  }
}
console.log(`
\u{1F517} --- INTERNAL LINK CRAWLER AUDIT ---`);
console.log(`\u2022 Total Internal <a href> Links Crawled: ${totalInternalLinksChecked}`);
console.log(`\u2022 Link Invariant Violations: ${linkFailures.length}`);
if (linkFailures.length > 0) {
  linkFailures.slice(0, 20).forEach((lf) => {
    console.error(`  - In [${lf.file}]: ${lf.reason}`);
    failures.push({ url: lf.href, routePath: lf.href, reason: `[In ${lf.file}] ${lf.reason}` });
  });
}
console.log("\n\u{1F6E1}\uFE0F  --- SSG HARD INVARIANT RESULTS ---");
console.log(`Total canonical routes verified: ${urls.length}`);
console.log(`Passed: ${urls.length - failures.length} / ${urls.length}`);
console.log(`Failed: ${failures.length} / ${urls.length}`);
if (failures.length > 0) {
  console.error("\n\u274C FAIL: The following prerender invariants were violated:");
  failures.forEach((f) => {
    console.error(`  - [${f.routePath}] ${f.reason}`);
  });
  process.exit(1);
} else {
  console.log(`\u2705 ALL ${urls.length} ROUTES MEET ALL PRERENDER INVARIANTS (100% PASS).
`);
  process.exit(0);
}
