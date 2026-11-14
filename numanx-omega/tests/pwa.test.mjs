// tests/pwa.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

// src/utils/pwaLogic.ts
var PWA_CACHE_PREFIX = "omega-x-";
var PWA_CACHE_VERSION = "v5";
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
      { id: "angstrom", lb: "Angstrom", r: 1e-10, s: "S", al: ["\xC5"] },
      { id: "pm", lb: "Picometer", r: 1e-12, s: "S" },
      { id: "nm", lb: "Nanometer", r: 1e-9, s: "M" },
      { id: "um", lb: "Micrometer", r: 1e-6, s: "M" },
      { id: "mm", lb: "Millimeter", r: 1e-3, s: "M" },
      { id: "cm", lb: "Centimeter", r: 0.01, s: "M" },
      { id: "dm", lb: "Decimeter", r: 0.1, s: "M" },
      { id: "m", lb: "Meter", r: 1, s: "M" },
      { id: "km", lb: "Kilometer", r: 1e3, s: "M" },
      { id: "mil", lb: "Thou / Mil", r: 254e-7, s: "I", al: ["thou"] },
      { id: "pt", lb: "Point", r: 0.0254 / 72, s: "I", al: ["points"] },
      { id: "in", lb: "Inch", r: 0.0254, s: "I" },
      { id: "hand", lb: "Hand", r: 0.1016, s: "I" },
      { id: "ft", lb: "Foot", r: 0.3048, s: "I", al: ["feet"] },
      { id: "cubit", lb: "Cubit", r: 0.4572, s: "O" },
      { id: "yd", lb: "Yard", r: 0.9144, s: "I", al: ["gaz"] },
      { id: "girah", lb: "Girah (Fabric - 2.25 in)", r: 0.05715, s: "O", al: ["girah", "gira"] },
      { id: "karam", lb: "Karam / Gatha (5.5 ft)", r: 1.6764, s: "O", al: ["karam", "gatha", "land pace"] },
      { id: "fathom", lb: "Fathom", r: 1.8288, s: "I", al: ["fathoms"] },
      { id: "rod", lb: "Rod", r: 5.0292, s: "I" },
      { id: "chain", lb: "Chain", r: 20.1168, s: "I" },
      { id: "furlong", lb: "Furlong", r: 201.168, s: "I" },
      { id: "mi", lb: "Mile", r: 1609.344, s: "I" },
      { id: "nmi", lb: "Nautical Mile", r: 1852, s: "O" },
      { id: "er", lb: "Earth Radius", r: 6371e3, s: "S" },
      { id: "ld", lb: "Lunar Distance", r: 3844e5, s: "S" },
      { id: "sr", lb: "Solar Radius", r: 6957e5, s: "S" },
      { id: "au", lb: "Astronomical Unit", r: 1496e8, s: "S" },
      { id: "ly", lb: "Light Year", r: 9461e12, s: "S" },
      { id: "pc", lb: "Parsec", r: 3086e13, s: "S" }
    ]
  },
  {
    id: "area",
    lb: "Area",
    ic: "\u25A3",
    cl: "#9b59b6",
    un: [
      { id: "barn", lb: "Barn", r: 1e-28, s: "S" },
      { id: "mm2", lb: "mm\xB2", r: 1e-6, s: "M" },
      { id: "cm2", lb: "cm\xB2", r: 1e-4, s: "M" },
      { id: "in2", lb: "in\xB2", r: 64516e-8, s: "I" },
      { id: "ft2", lb: "ft\xB2", r: 0.092903, s: "I" },
      { id: "yd2", lb: "yd\xB2", r: 0.836127, s: "I" },
      { id: "m2", lb: "m\xB2", r: 1, s: "M" },
      { id: "ac", lb: "Acre", r: 4046.86, s: "I" },
      { id: "ha", lb: "Hectare", r: 1e4, s: "M" },
      { id: "km2", lb: "km\xB2", r: 1e6, s: "M" },
      { id: "mi2", lb: "mi\xB2", r: 259e4, s: "I" },
      { id: "twp", lb: "Township", r: 9324e4, s: "I" },
      { id: "marla_soc", lb: "Marla (Society - 225 sq ft)", r: 20.903184, s: "O", al: ["marla 225", "marla society", "dha marla", "bahria marla"] },
      { id: "marla_cap", lb: "Marla (Capital - 250 sq ft)", r: 23.22576, s: "O", al: ["marla 250", "cda marla", "islamabad marla", "rawalpindi marla"] },
      { id: "marla", lb: "Marla (Standard/Govt - 272.25 sq ft)", r: 25.29285264, s: "O", al: ["marla", "marlas", "standard marla", "punjab marla", "patwari marla"] },
      { id: "gaz_sq", lb: "Square Yard / Gaz", r: 0.83612736, s: "O", al: ["gaz", "square gaz", "sq gaz", "square yard gaz"] },
      { id: "sarsahi", lb: "Sarsahi (Sq Karam)", r: 2.81031696, s: "O", al: ["sarsahi", "sq karam"] },
      { id: "kanal", lb: "Kanal (20 Marlas)", r: 505.8570528, s: "O", al: ["kanal", "kanals"] },
      { id: "killa", lb: "Killa / Acre (PK)", r: 4046.8564224, s: "O", al: ["killa", "qila"] },
      { id: "murabba", lb: "Murabba (25 Acres)", r: 101171.41056, s: "O", al: ["murabba", "morabba"] }
    ]
  },
  {
    id: "volume",
    lb: "Volume",
    ic: "\u{1F9EA}",
    cl: "#3498db",
    un: [
      { id: "drop", lb: "Drop", r: 5e-5, s: "O" },
      { id: "mL", lb: "Milliliter", r: 1e-3, s: "M" },
      { id: "cm3", lb: "Cubic Centimeter", r: 1e-3, s: "M", al: ["cc"] },
      { id: "cL", lb: "Centiliter", r: 0.01, s: "M" },
      { id: "dL", lb: "Deciliter", r: 0.1, s: "M" },
      { id: "tsp", lb: "Teaspoon", r: 492892e-8, s: "I" },
      { id: "tbsp", lb: "Tablespoon", r: 0.0147868, s: "I" },
      { id: "in3", lb: "Cubic Inch", r: 0.0163871, s: "I" },
      { id: "impfloz", lb: "Imperial Fl Oz", r: 0.0284130625, s: "I", al: ["uk fluid ounce"] },
      { id: "floz", lb: "Fluid Ounce", r: 0.0295735, s: "I", al: ["fl oz", "fluid ounces", "us fluid ounce"] },
      { id: "cup", lb: "Cup", r: 0.24, s: "I" },
      { id: "pt", lb: "Pint", r: 0.473176, s: "I", al: ["pints", "us pint"] },
      { id: "imppt", lb: "Imperial Pint", r: 0.56826125, s: "I", al: ["uk pint"] },
      { id: "L", lb: "Liter", r: 1, s: "M" },
      { id: "qt", lb: "Quart", r: 0.946353, s: "I" },
      { id: "gal", lb: "Gallon", r: 3.78541, s: "I", al: ["gallons", "us gallon"] },
      { id: "impgal", lb: "Imperial Gallon", r: 4.54609, s: "I", al: ["uk gallon"] },
      { id: "ft3", lb: "Cubic Foot", r: 28.3168, s: "I" },
      { id: "bbl", lb: "Barrel", r: 158.987, s: "I" },
      { id: "yd3", lb: "Cubic Yard", r: 764.554857984, s: "I", al: ["cubic yards", "cu yd"] },
      { id: "m3", lb: "Cubic Meter", r: 1e3, s: "M" }
    ]
  },
  {
    id: "mass",
    lb: "Mass",
    ic: "\u2696\uFE0F",
    cl: "#2ecc71",
    al: ["weight", "gram", "kilogram", "pound"],
    un: [
      { id: "amu", lb: "Atomic Mass Unit", r: 1660539e-33, s: "S" },
      { id: "ug", lb: "Microgram", r: 1e-9, s: "M" },
      { id: "mg", lb: "Milligram", r: 1e-6, s: "M" },
      { id: "gr", lb: "Grain", r: 64799e-9, s: "I" },
      { id: "ct", lb: "Carat", r: 2e-4, s: "O" },
      { id: "g", lb: "Gram", r: 1e-3, s: "M" },
      { id: "dwt", lb: "Pennyweight", r: 0.00155517384, s: "O" },
      { id: "oz", lb: "Ounce", r: 0.0283495, s: "I" },
      { id: "ozt", lb: "Troy Ounce", r: 0.0311034768, s: "O", al: ["troy oz", "gold ounce"] },
      { id: "lbt", lb: "Troy Pound", r: 0.3732417216, s: "O" },
      { id: "lb", lb: "Pound", r: 0.453592, s: "I", al: ["lbs"] },
      { id: "kg", lb: "Kilogram", r: 1, s: "M" },
      { id: "stone", lb: "Stone", r: 6.35029, s: "I" },
      { id: "slug", lb: "Slug", r: 14.5939029372, s: "I" },
      { id: "q", lb: "Metric Quintal", r: 100, s: "M", al: ["quintal"] },
      { id: "sh tn", lb: "Short Ton", r: 907.185, s: "I" },
      { id: "t", lb: "Metric Ton", r: 1e3, s: "M" },
      { id: "lg tn", lb: "Long Ton", r: 1016.05, s: "I" },
      { id: "ratti", lb: "Ratti", r: 121497956e-12, s: "O", al: ["ratti"] },
      { id: "masha", lb: "Masha", r: 97198365e-11, s: "O", al: ["masha"] },
      { id: "tola", lb: "Tola (PK Standard)", r: 0.0116638038, s: "O", al: ["tola", "tolas", "bhori"] },
      { id: "chhatank", lb: "Chhatank", r: 0.058319019, s: "O", al: ["chhatank", "chatank"] },
      { id: "pao", lb: "Pao (250g)", r: 0.25, s: "O", al: ["pao", "paao", "pow"] },
      { id: "seer", lb: "Seer", r: 0.9331043, s: "O", al: ["seer", "ser"] },
      { id: "dhari", lb: "Dhari (5 kg)", r: 5, s: "O", al: ["dhari"] },
      { id: "maund_trad", lb: "Maund (Traditional Imperial - 37.32 kg)", r: 37.324172, s: "O", al: ["traditional maund", "bengal maund"] },
      { id: "maund_pk", lb: "Maund / Mann (Mandi Standard - 40 kg)", r: 40, s: "O", al: ["maund", "mann", "mon", "pakistani maund"] }
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
    ic: "\u{1F4C8}",
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
      { id: "dyn", lb: "Dyne", r: 1e-5, s: "M" },
      { id: "N", lb: "Newton", r: 1, s: "M" },
      { id: "lbf", lb: "Pound-force", r: 4.4482216152605, s: "I" },
      { id: "kgf", lb: "Kilogram-force", r: 9.80665, s: "M" },
      { id: "kN", lb: "Kilonewton", r: 1e3, s: "M" }
    ]
  },
  {
    id: "pressure",
    lb: "Pressure",
    ic: "\u{1F535}",
    cl: "#00bcd4",
    un: [
      { id: "Pa", lb: "Pascal", r: 1, s: "M" },
      { id: "hPa", lb: "Hectopascal", r: 100, s: "M" },
      { id: "mbar", lb: "Millibar", r: 100, s: "M", al: ["mb"] },
      { id: "torr", lb: "Torr", r: 133.322, s: "O" },
      { id: "mmHg", lb: "mmHg", r: 133.322, s: "O" },
      { id: "inH2O", lb: "inH\u2082O", r: 249.08891, s: "I", al: ["inches of water"] },
      { id: "kPa", lb: "Kilopascal", r: 1e3, s: "M" },
      { id: "inHg", lb: "inHg", r: 3386.389, s: "O", al: ["inches of mercury"] },
      { id: "psi", lb: "PSI", r: 6894.76, s: "I" },
      { id: "bar", lb: "Bar", r: 1e5, s: "M" },
      { id: "atm", lb: "Atmosphere", r: 101325, s: "O" },
      { id: "MPa", lb: "Megapascal", r: 1e6, s: "M" },
      { id: "ksi", lb: "ksi", r: 6894757293e-3, s: "I", al: ["kilopound per square inch"] }
    ]
  },
  {
    id: "energy",
    lb: "Energy",
    ic: "\u26A1",
    cl: "#f39c12",
    un: [
      { id: "eV", lb: "Electronvolt", r: 1602e-22, s: "S" },
      { id: "J", lb: "Joule", r: 1, s: "M" },
      { id: "cal", lb: "Calorie", r: 4.184, s: "M" },
      { id: "BTU", lb: "BTU", r: 1055.06, s: "I" },
      { id: "kJ", lb: "Kilojoule", r: 1e3, s: "M" },
      { id: "Wh", lb: "Watt-hour", r: 3600, s: "O" },
      { id: "kcal", lb: "Kilocalorie", r: 4184, s: "M" },
      { id: "kWh", lb: "Kilowatt-hour", r: 36e5, s: "O" },
      { id: "therm", lb: "Therm", r: 1055e5, s: "I" }
    ]
  },
  {
    id: "power",
    lb: "Power",
    ic: "\u{1F4A1}",
    cl: "#ff9800",
    un: [
      { id: "BTUh", lb: "BTU/h", r: 0.29307107, s: "I" },
      { id: "W", lb: "Watt", r: 1, s: "M" },
      { id: "ps", lb: "Metric Horsepower (PS)", r: 735.49875, s: "O", al: ["ch", "cv"] },
      { id: "hp", lb: "Horsepower", r: 745.7, s: "I" },
      { id: "kW", lb: "Kilowatt", r: 1e3, s: "M" },
      { id: "tr", lb: "Ton of Refrigeration", r: 3516.852842, s: "I", al: ["refrigeration ton", "tons of ac"] },
      { id: "MW", lb: "Megawatt", r: 1e6, s: "M" },
      { id: "GW", lb: "Gigawatt", r: 1e9, s: "M" }
    ]
  },
  {
    id: "electricity",
    lb: "Electricity",
    ic: "\u{1F50C}",
    cl: "#00e5ff",
    un: [
      { id: "uF", lb: "Microfarad", r: 1e-6, s: "M", dim: "capacitance" },
      { id: "mA", lb: "Milliampere", r: 1e-3, s: "M", dim: "current" },
      { id: "A", lb: "Ampere", r: 1, s: "M", dim: "current" },
      { id: "V", lb: "Volt", r: 1, s: "M", dim: "voltage" },
      { id: "ohm", lb: "Ohm", r: 1, s: "M", dim: "resistance" },
      { id: "C", lb: "Coulomb", r: 1, s: "S", dim: "charge" },
      { id: "F", lb: "Farad", r: 1, s: "M", dim: "capacitance" },
      { id: "kV", lb: "Kilovolt", r: 1e3, s: "M", dim: "voltage" },
      { id: "kohm", lb: "Kilo-ohm", r: 1e3, s: "M", dim: "resistance" },
      { id: "Mohm", lb: "Mega-ohm", r: 1e6, s: "M", dim: "resistance" }
    ]
  },
  {
    id: "magnetism",
    lb: "Magnetism",
    ic: "\u{1F9F2}",
    cl: "#e040fb",
    un: [
      { id: "G", lb: "Gauss", r: 1e-4, s: "M", dim: "b_field" },
      { id: "T", lb: "Tesla", r: 1, s: "M", dim: "b_field" },
      { id: "Wb", lb: "Weber", r: 1, s: "S", dim: "flux" }
    ]
  },
  {
    id: "frequency",
    lb: "Frequency",
    ic: "\u3030\uFE0F",
    cl: "#607d8b",
    un: [
      { id: "rpm", lb: "RPM", r: 1 / 60, s: "O" },
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
      { id: "KiB", lb: "Kibibyte (KiB)", r: 1024, s: "S" },
      { id: "MB", lb: "MB", r: 1e6, s: "M" },
      { id: "MiB", lb: "Mebibyte (MiB)", r: 1048576, s: "S" },
      { id: "GB", lb: "GB", r: 1e9, s: "M", al: ["gigabyte", "gigabytes"] },
      { id: "GiB", lb: "Gibibyte (GiB)", r: 1073741824, s: "S", al: ["gibibyte", "gibibytes"] },
      { id: "TB", lb: "TB", r: 1e12, s: "M" },
      { id: "TiB", lb: "Tebibyte (TiB)", r: 1099511627776, s: "S" },
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
      { id: "arcsec", lb: "Arcsecond", r: 1 / 3600, s: "O" },
      { id: "arcmin", lb: "Arcminute", r: 1 / 60, s: "O" },
      { id: "mrad", lb: "Milliradian", r: 0.18 / Math.PI, s: "S" },
      { id: "grad", lb: "Gradian", r: 0.9, s: "O" },
      { id: "deg", lb: "Degree", r: 1, s: "M" },
      { id: "rad", lb: "Radian", r: 180 / Math.PI, s: "S" }
    ]
  },
  {
    id: "torque",
    lb: "Torque",
    ic: "\u{1F527}",
    cl: "#ff5722",
    un: [
      { id: "Nmm", lb: "N\xB7mm", r: 1e-3, s: "M" },
      { id: "ozin", lb: "oz-in", r: 0.007061551814226044, s: "I", al: ["ounce-inch"] },
      { id: "Ncm", lb: "N\xB7cm", r: 0.01, s: "M" },
      { id: "lbin", lb: "lb-in", r: 0.1129848290276167, s: "I", al: ["in-lb", "pound-inch", "pound-inches", "inch-pound"] },
      { id: "Nm", lb: "N\xB7m", r: 1, s: "M", al: ["newton-meter", "newton-meters"] },
      { id: "lbft", lb: "lb-ft", r: 1.35582, s: "I", al: ["pound-foot", "pound-feet", "foot-pound", "foot-pounds"] },
      { id: "kgfm", lb: "kgf\xB7m", r: 9.80665, s: "M", al: ["kgf-m"] }
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
      { id: "lbft3", lb: "lb/ft\xB3", r: 16.0185, s: "I" },
      { id: "gcm3", lb: "g/cm\xB3", r: 1e3, s: "M" }
    ]
  },
  {
    id: "cooking",
    lb: "Cooking",
    ic: "\u{1F373}",
    cl: "#ffc107",
    un: [
      { id: "pinch", lb: "Pinch", r: 0.308, s: "I" },
      { id: "dash", lb: "Dash", r: 0.615, s: "I" },
      { id: "mL_c", lb: "Milliliter", r: 1, s: "M" },
      { id: "tsp_c", lb: "Teaspoon", r: 5, s: "I" },
      { id: "tbsp_c", lb: "Tablespoon", r: 15, s: "I" },
      { id: "floz_c", lb: "Fluid Ounce", r: 29.5735, s: "I" },
      { id: "jigger", lb: "Jigger", r: 44.36029434375, s: "I", al: ["jiggers"] },
      { id: "stick_c", lb: "Stick of Butter", r: 120, s: "I", al: ["stick", "sticks"] },
      { id: "cup_c", lb: "Cup", r: 240, s: "I" }
    ]
  },
  {
    id: "textile",
    lb: "Textile",
    ic: "\u{1F9F5}",
    cl: "#ab47bc",
    un: [
      { id: "gsm", lb: "GSM (Grams per Sq Meter)", r: 1, s: "O", al: ["gsm", "g/m2"], dim: "areal_density" },
      { id: "oz_yd2", lb: "Ounce per Sq Yard (oz/yd\xB2)", r: 33.9057474, s: "O", al: ["oz", "oz/yd2", "oz-yd2", "oz/sq yd", "osy", "ounce per square yard", "ounces per square yard"], dim: "areal_density" },
      { id: "momme", lb: "Momme Silk (mm)", r: 4.34, s: "O", al: ["momme", "mm silk", "silk momme"], dim: "areal_density" }
    ]
  },
  {
    id: "astronomy",
    lb: "Astronomy",
    ic: "\u{1F30C}",
    cl: "#7c4dff",
    un: [
      { id: "em", lb: "Earth Mass", r: 3003e-9, s: "S", dim: "mass" },
      { id: "sm", lb: "Solar Mass", r: 1, s: "S", dim: "mass" },
      { id: "au_a", lb: "AU", r: 1, s: "S", dim: "distance" },
      { id: "ly_a", lb: "Light Year", r: 63241.1, s: "S", dim: "distance" },
      { id: "pc_a", lb: "Parsec", r: 206265, s: "S", dim: "distance" }
    ]
  },
  {
    id: "flow",
    lb: "Flow Rate",
    ic: "\u{1F4A7}",
    cl: "#00bcd4",
    al: ["volumetric flow", "discharge", "flow", "gpm", "cfm", "liters per minute"],
    un: [
      { id: "bpd", lb: "Barrels per Day", r: 18401307283333333e-22, s: "I", al: ["bpd", "barrel per day", "barrels per day"] },
      { id: "Lmin", lb: "Liter per Minute", r: 16666666666666667e-21, s: "M", al: ["l/min", "lpm", "liters per minute"] },
      { id: "gpm", lb: "Gallon per Minute", r: 630901964e-13, s: "I", al: ["gpm", "gallon per minute", "gallons per minute"] },
      { id: "m3h", lb: "Cubic Meter per Hour", r: 2777777777777778e-19, s: "M", al: ["m3/h", "cubic meter per hour", "cubic meters per hour"] },
      { id: "cfm", lb: "Cubic Feet per Minute", r: 4719474432e-13, s: "I", al: ["cfm", "cubic foot per minute", "cubic feet per minute"] },
      { id: "Ls", lb: "Liter per Second", r: 1e-3, s: "M", al: ["l/s", "lps", "liter per second", "liters per second"] },
      { id: "m3s", lb: "Cubic Meter per Second", r: 1, s: "M", al: ["m3/s", "cubic meter per second", "cubic meters per second"] }
    ]
  },
  {
    id: "illuminance",
    lb: "Illuminance",
    ic: "\u2600\uFE0F",
    cl: "#ffb300",
    al: ["light", "lux", "foot-candle", "illumination", "phot"],
    un: [
      { id: "nox", lb: "Nox", r: 1e-3, s: "S", al: ["nox"] },
      { id: "lx", lb: "Lux", r: 1, s: "M", al: ["lux", "lx"] },
      { id: "fc", lb: "Foot-candle", r: 10.763910416709722, s: "I", al: ["fc", "foot-candles", "foot candles", "foot candle"] },
      { id: "ph", lb: "Phot", r: 1e4, s: "S", al: ["phot", "phots"] }
    ]
  },
  {
    id: "viscosity",
    lb: "Viscosity",
    ic: "\u{1F36F}",
    cl: "#8d6e63",
    al: ["dynamic viscosity", "centipoise", "poise", "pascal second"],
    un: [
      { id: "cP", lb: "Centipoise", r: 1e-3, s: "O", al: ["cp", "centipoise"] },
      { id: "mPas", lb: "Millipascal-second", r: 1e-3, s: "M", al: ["mpas", "mpa-s", "millipascal-second"] },
      { id: "P", lb: "Poise", r: 0.1, s: "O", al: ["poise"] },
      { id: "Pas", lb: "Pascal-second", r: 1, s: "M", al: ["pas", "pa-s", "pascal-second"] },
      { id: "lbfts", lb: "Pound per Foot-second", r: 1.48816394357, s: "I", al: ["lb/ft-s", "pound per foot-second", "pound per foot second"] }
    ]
  },
  {
    id: "typography",
    lb: "Typography",
    ic: "\u{1F524}",
    cl: "#ec407a",
    al: ["css units", "font size", "pixels", "points", "rem", "em", "pica"],
    un: [
      { id: "px", lb: "Pixel", r: 1, s: "O", al: ["pixels", "pixel", "px"] },
      { id: "pt", lb: "Point", r: 1.3333333333333333, s: "I", al: ["points", "point", "pt"] },
      { id: "mm", lb: "Millimeter", r: 3.779527559055118, s: "M", al: ["millimeter", "millimeters", "mm"] },
      { id: "pica", lb: "Pica", r: 16, s: "I", al: ["picas", "pica", "pc"] },
      { id: "rem", lb: "Root EM", r: 16, s: "O", al: ["rem", "rems"] },
      { id: "em", lb: "EM", r: 16, s: "O", al: ["em", "ems"] },
      { id: "cm", lb: "Centimeter", r: 37.79527559055118, s: "M", al: ["centimeter", "centimeters", "cm"] },
      { id: "in", lb: "Inch", r: 96, s: "I", al: ["inches", "inch", "in"] }
    ]
  },
  {
    id: "number-base",
    lb: "Number Base",
    ic: "\u{1F522}",
    cl: "#00bcd4",
    sp: true,
    al: ["radix", "binary", "hexadecimal", "octal", "decimal", "base conversion", "gray code", "bcd"],
    un: [
      { id: "dec", lb: "Decimal (Base 10)", r: 1, s: "M", al: ["base 10", "denary"] },
      { id: "bin", lb: "Binary (Base 2)", s: "S", al: ["base 2"] },
      { id: "oct", lb: "Octal (Base 8)", s: "S", al: ["base 8"] },
      { id: "hex", lb: "Hexadecimal (Base 16)", s: "S", al: ["base 16", "hex"] },
      { id: "base32", lb: "Base 32", s: "S" },
      { id: "base36", lb: "Base 36", s: "S" },
      { id: "bcd", lb: "BCD (8421 Binary Coded)", s: "S" },
      { id: "gray", lb: "Gray Code (Reflected Binary)", s: "S" }
    ]
  },
  {
    id: "ieee-754",
    lb: "IEEE-754 Float",
    ic: "\u{1F9EE}",
    cl: "#ff9800",
    sp: true,
    al: ["floating point", "fp16", "fp32", "fp64", "single precision", "double precision", "half precision", "hex float"],
    un: [
      { id: "dec_real", lb: "Decimal Real Number", r: 1, s: "M" },
      { id: "fp16", lb: "FP16 Half Precision (1-5-10)", s: "S" },
      { id: "fp32", lb: "FP32 Single Precision (1-8-23)", s: "S" },
      { id: "fp64", lb: "FP64 Double Precision (1-11-52)", s: "S" },
      { id: "hex_float", lb: "Hexadecimal Float (0x...)", s: "S" }
    ]
  },
  {
    id: "pk-numbering",
    lb: "South Asian Numbering",
    ic: "\u{1F3E6}",
    cl: "#4caf50",
    al: ["lakh", "crore", "arab", "kharab", "hazar", "pakistani numbering", "desi numbers", "million billion"],
    un: [
      { id: "ones", lb: "Units / Ones", r: 1, s: "M", al: ["one", "units"] },
      { id: "hazar", lb: "Hazar (1,000)", r: 1e3, s: "O", al: ["hazar", "thousand pk"] },
      { id: "lakh", lb: "Lakh (100,000 / 10\u2075)", r: 1e5, s: "O", al: ["lakh", "lac", "lac rupees"] },
      { id: "crore", lb: "Crore (10 Million / 10\u2077)", r: 1e7, s: "O", al: ["crore", "karor", "cr"] },
      { id: "arab", lb: "Arab (1 Billion / 10\u2079)", r: 1e9, s: "O", al: ["arab", "billion pk"] },
      { id: "kharab", lb: "Kharab (100 Billion / 10\xB9\xB9)", r: 1e11, s: "O", al: ["kharab"] },
      { id: "neel", lb: "Neel (10 Trillion / 10\xB9\xB3)", r: 1e13, s: "O", al: ["neel"] },
      { id: "k_std", lb: "Thousand (K / 10\xB3)", r: 1e3, s: "S" },
      { id: "m_std", lb: "Million (M / 10\u2076)", r: 1e6, s: "S" },
      { id: "b_std", lb: "Billion (B / 10\u2079)", r: 1e9, s: "S" },
      { id: "t_std", lb: "Trillion (T / 10\xB9\xB2)", r: 1e12, s: "S" }
    ]
  },
  {
    id: "statistics",
    lb: "Statistics & Odds",
    ic: "\u{1F4CA}",
    cl: "#3f51b5",
    sp: true,
    al: ["z-score", "percentile", "probability", "betting odds", "moneyline", "p-value", "odds converter"],
    un: [
      { id: "prob_pct", lb: "Implied Probability (%)", r: 1, s: "M", al: ["probability", "chance"] },
      { id: "percentile", lb: "Percentile Rank (%)", s: "S" },
      { id: "z_score", lb: "Z-Score (\u03C3)", s: "S", al: ["z score", "standard score"] },
      { id: "p_val_two", lb: "Two-Tailed P-Value", s: "S" },
      { id: "dec_odds", lb: "Decimal Odds (European)", s: "O", al: ["decimal odds"] },
      { id: "frac_odds", lb: "Fractional Odds (UK/Traditional)", s: "O", al: ["fractional odds"] },
      { id: "us_moneyline", lb: "American Moneyline (+/-)", s: "O", al: ["moneyline", "american odds"] }
    ]
  },
  {
    id: "matrix-format",
    lb: "Matrix & Arrays",
    ic: "\u{1F9F1}",
    cl: "#009688",
    sp: true,
    al: ["matrix", "latex matrix", "numpy array", "matlab matrix", "csv grid", "json 2d array"],
    un: [
      { id: "csv", lb: "CSV / TSV Grid", r: 1, s: "M", al: ["csv", "tsv"] },
      { id: "latex_b", lb: "LaTeX bmatrix ([...])", s: "S", al: ["bmatrix"] },
      { id: "latex_p", lb: "LaTeX pmatrix ((...))", s: "S", al: ["pmatrix"] },
      { id: "numpy", lb: "Python NumPy (np.array)", s: "S", al: ["numpy", "python array"] },
      { id: "matlab", lb: "MATLAB / Octave ([a b; c d])", s: "S", al: ["matlab", "octave"] },
      { id: "json_2d", lb: "JSON 2D Array", s: "S", al: ["json", "nested array"] }
    ]
  },
  {
    id: "scientific-notation",
    lb: "Scientific & Fractions",
    ic: "\u{1F52C}",
    cl: "#9c27b0",
    al: ["scientific notation", "engineering notation", "e notation", "ppm", "ppb", "ppt", "parts per million"],
    un: [
      { id: "dec_std", lb: "Standard Decimal", r: 1, s: "M" },
      { id: "sci_kilo", lb: "Kilo (10\xB3)", r: 1e3, s: "S" },
      { id: "sci_mega", lb: "Mega (10\u2076)", r: 1e6, s: "S" },
      { id: "sci_giga", lb: "Giga (10\u2079)", r: 1e9, s: "S" },
      { id: "sci_milli", lb: "Milli (10\u207B\xB3)", r: 1e-3, s: "S" },
      { id: "sci_micro", lb: "Micro (10\u207B\u2076)", r: 1e-6, s: "S" },
      { id: "sci_nano", lb: "Nano (10\u207B\u2079)", r: 1e-9, s: "S" },
      { id: "ppm", lb: "Parts-Per-Million (ppm / 10\u207B\u2076)", r: 1e-6, s: "S", al: ["ppm"] },
      { id: "ppb", lb: "Parts-Per-Billion (ppb / 10\u207B\u2079)", r: 1e-9, s: "S", al: ["ppb"] },
      { id: "ppt", lb: "Parts-Per-Trillion (ppt / 10\u207B\xB9\xB2)", r: 1e-12, s: "S", al: ["ppt"] },
      { id: "pct", lb: "Percentage (%)", r: 0.01, s: "M", al: ["percent", "%"] },
      { id: "permille", lb: "Permille (\u2030)", r: 1e-3, s: "M", al: ["permille", "per thousand"] }
    ]
  },
  {
    id: "pk-gpa",
    lb: "HEC GPA & Marks",
    ic: "\u{1F393}",
    cl: "#e91e63",
    sp: true,
    al: ["hec gpa", "gpa converter", "fsc marks", "matric marks", "mdcat aggregate", "percentage to gpa", "ecat"],
    un: [
      { id: "percentage", lb: "Percentage Marks (%)", r: 1, s: "M", al: ["percent", "%"] },
      { id: "hec_gpa4", lb: "HEC 4.00 Scale CGPA", s: "O", al: ["hec gpa", "cgpa 4"] },
      { id: "gpa5", lb: "5.00 Scale CGPA", s: "O", al: ["cgpa 5"] },
      { id: "matric_fsc1100", lb: "Matric / FSc Marks (Out of 1100)", s: "O", al: ["fsc marks", "matric marks", "1100"] },
      { id: "matric_fsc1200", lb: "Matric / FSc Marks (Out of 1200)", s: "O", al: ["1200"] },
      { id: "mdcat_agg", lb: "MDCAT / ECAT Aggregate (%)", s: "O", al: ["mdcat", "aggregate"] }
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
  defaultTitle: "Omega X Converter \u2014 Universal Unit Calculator",
  defaultDescription: "Free universal unit converter platform with 28 categories, 220+ units, formula charts, and offline PWA support.",
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
    assert.equal(classifyRequest("https://api.example.com/v1/data", "cors", "GET", APP_ORIGIN), "CROSS_ORIGIN");
    assert.equal(classifyRequest("https://api.another.org/v2/items", "cors", "GET", APP_ORIGIN), "CROSS_ORIGIN");
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
    assert.ok(storage.has("omega-x-static-v5"), "Static cache must be created on install");
    assert.ok(storage.has("omega-x-pages-v5"), "Pages cache must be created on install");
    storage.set("omega-x-static-v4", /* @__PURE__ */ new Map());
    storage.set("unrelated-domain-cache", /* @__PURE__ */ new Map());
    let activateWaitPromise = null;
    listeners["activate"]({ waitUntil: (p) => {
      activateWaitPromise = p;
    } });
    await activateWaitPromise;
    assert.equal(storage.has("omega-x-static-v4"), false, "Old omega cache must be deleted on activate");
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
      url: "https://api.example.com/v1/data",
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
