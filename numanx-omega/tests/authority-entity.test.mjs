// tests/authority-entity.test.ts
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

// src/utils/numbers.ts
function cleanFloat(value, sigFigs = 14) {
  if (!Number.isFinite(value) || value === 0) return 0;
  return Number(value.toPrecision(sigFigs));
}
function fmt(v, prec = 6) {
  if (v === null || v === void 0 || !isFinite(v)) return "\u2014";
  if (v === 0) return "0";
  const abs = Math.abs(v);
  if (abs > 0 && abs < Math.pow(10, -Math.max(prec, 4)) || abs >= 1e12) {
    return cleanFloat(v, Math.max(prec, 4)).toExponential(Math.min(prec, 6));
  }
  return cleanFloat(Number(v.toFixed(prec))).toString();
}

// src/engine/converter.ts
var customCategories = [];
function getCategory(id) {
  return Categories.find((c) => c.id === id) || customCategories.find((c) => c.id === id);
}
function getAllCategories() {
  return [...Categories, ...customCategories];
}
function getUnit(cat, id) {
  return cat.un.find((u) => u.id === id);
}
function convertTemp(v, from, to) {
  if (from === to) return cleanFloat(v);
  let c;
  if (from === "C") c = v;
  else if (from === "F") c = (v - 32) * 5 / 9;
  else if (from === "K") c = v - 273.15;
  else if (from === "R") c = (v - 491.67) * 5 / 9;
  else if (from === "Re") c = v * 1.25;
  else c = v;
  let out;
  if (to === "C") out = c;
  else if (to === "F") out = c * 9 / 5 + 32;
  else if (to === "K") out = c + 273.15;
  else if (to === "R") out = (c + 273.15) * 9 / 5;
  else if (to === "Re") out = c * 0.8;
  else out = c;
  return cleanFloat(out);
}
function convertFuel(v, from, to) {
  if (!Number.isFinite(v) || v <= 0) return null;
  const toBase = {
    kmL: (n) => n,
    L100km: (n) => 100 / n,
    mpgUS: (n) => n * 0.425144,
    mpgUK: (n) => n * 0.354006
  };
  const fromBase = {
    kmL: (n) => n,
    L100km: (n) => 100 / n,
    mpgUS: (n) => n / 0.425144,
    mpgUK: (n) => n / 0.354006
  };
  if (!toBase[from] || !fromBase[to]) return null;
  if (from === to) return cleanFloat(v);
  return cleanFloat(fromBase[to](toBase[from](v)));
}
function convert(v, catId, fromId, toId) {
  const cat = getCategory(catId);
  if (!cat || v !== 0 && !v || !Number.isFinite(v)) return null;
  if (cat.id === "temp") return convertTemp(v, fromId, toId);
  if (cat.id === "fuel") return convertFuel(v, fromId, toId);
  const fu = getUnit(cat, fromId);
  const tu = getUnit(cat, toId);
  if (!fu || !tu || !fu.r || !tu.r) return null;
  return cleanFloat(v * fu.r / tu.r);
}

// src/config/authoritySources.ts
var AUTHORITY_SOURCES = {
  "bipm-si-brochure": {
    id: "bipm-si-brochure",
    organization: "Bureau International des Poids et Mesures (BIPM)",
    title: "The International System of Units (SI Brochure, 9th Edition)",
    url: "https://www.bipm.org/en/publications/si-brochure",
    documentRef: "BIPM SI Brochure (2019)",
    domain: "General SI Metrology & Base Units",
    supports: [
      "Fundamental SI base unit definitions (meter, kilogram, second, ampere, kelvin, mole, candela)",
      "2019 SI redefinition fixing fundamental physical constants (h, e, k, N_A, c, \u0394\u03BD_Cs, K_cd)",
      "Coherent derived units and standard SI decimal prefixes"
    ]
  },
  "bipm-base-units": {
    id: "bipm-base-units",
    organization: "Bureau International des Poids et Mesures (BIPM)",
    title: "SI Base Units and Definitions",
    url: "https://www.bipm.org/en/measurement-units/",
    documentRef: "BIPM Measurement Units",
    domain: "SI Base Units & Temperature Relationship",
    supports: [
      "Primary SI base unit realizations and international prototype history",
      "The kelvin and degree Celsius interval equivalence (0 \xB0C = 273.15 K)"
    ]
  },
  "nist-sp811": {
    id: "nist-sp811",
    organization: "National Institute of Standards and Technology (NIST)",
    title: "NIST Special Publication 811: Guide for the Use of the International System of Units (SI)",
    url: "https://www.nist.gov/pml/special-publication-811",
    documentRef: "NIST SP 811 (2008 Edition)",
    domain: "U.S. Customary & SI Conversions",
    supports: [
      "U.S. Customary to metric SI conversion factors and conversion rounding conventions",
      "Exact conversion ratios for length (1 inch = 25.4 mm; 1 foot = 0.3048 m) and mass (1 avoirdupois pound = 0.45359237 kg)",
      "Standardized rules for unit symbols, formatting, and mathematical expressions"
    ]
  },
  "nist-hb44": {
    id: "nist-hb44",
    organization: "National Institute of Standards and Technology (NIST)",
    title: "NIST Handbook 44: Specifications, Tolerances, and Other Technical Requirements for Weighing and Measuring Devices",
    url: "https://www.nist.gov/pml/owm/nist-handbook-44-current-edition",
    documentRef: "NIST Handbook 44",
    domain: "Legal Metrology & Liquid Capacity",
    supports: [
      "Commercial liquid capacity definitions (US liquid gallons, quarts, pints, fluid ounces)",
      "Dry measure capacity regulations and commercial trade weighing tolerances"
    ]
  },
  "codata-constants": {
    id: "codata-constants",
    organization: "CODATA / NIST Physical Measurement Laboratory",
    title: "CODATA Internationally Recommended Values of the Fundamental Physical Constants",
    url: "https://physics.nist.gov/cuu/Constants/",
    documentRef: "CODATA Recommended Values",
    domain: "Fundamental Physical Constants",
    supports: [
      "Fundamental physical constants including the speed of light c, elementary charge e, and Boltzmann constant k",
      "Energy-to-electron-volt conversion factors (1 eV = 1.602176634 \xD7 10^-19 J exactly)"
    ]
  }
};
var AUTHORITY_SOURCES_LIST = Object.values(AUTHORITY_SOURCES);
function getAuthoritySource(id) {
  return AUTHORITY_SOURCES[id];
}
function getCategoryAuthoritySources(catId) {
  switch (catId) {
    case "length":
    case "mass":
    case "area":
    case "speed":
    case "pressure":
    case "force":
    case "torque":
    case "acceleration":
    case "density":
    case "viscosity":
    case "flow":
      return [AUTHORITY_SOURCES["nist-sp811"], AUTHORITY_SOURCES["bipm-si-brochure"]];
    case "temp":
      return [AUTHORITY_SOURCES["bipm-base-units"], AUTHORITY_SOURCES["nist-sp811"]];
    case "energy":
    case "power":
      return [AUTHORITY_SOURCES["nist-sp811"], AUTHORITY_SOURCES["codata-constants"]];
    case "volume":
      return [AUTHORITY_SOURCES["nist-sp811"], AUTHORITY_SOURCES["nist-hb44"]];
    case "cooking":
      return [AUTHORITY_SOURCES["nist-hb44"]];
    case "time":
    case "angle":
      return [AUTHORITY_SOURCES["bipm-si-brochure"]];
    default:
      return [];
  }
}

// src/data/blogPosts.ts
var BLOG_POSTS = [
  {
    slug: "compound-length-units-guide",
    title: "How to Convert Compound Units: Feet, Inches & Fractions Guide",
    excerpt: `Master compound measurement conversions like 5' 10 1/2" into decimal inches, centimeters, or meters without rounding errors.`,
    category: "Guides",
    date: "2025-01-15",
    readTime: "5 min read",
    author: "NumanX Metrology Team",
    relatedCat: "length",
    coverIcon: "\u{1F4CF}",
    tags: ["Length", "Compound Units", "Fractions", "Engineering"],
    content: {
      intro: `Compound units\u2014such as 6 feet 2 inches or 5' 7 3/8"\u2014are standard across construction, architecture, and aerospace engineering in the United States. However, calculating them manually often introduces compounding rounding discrepancies. This comprehensive guide details the mathematical equations and automated parsing workflows to convert any compound measurement into pure decimal millimeters, centimeters, and meters.`,
      keyTakeaways: [
        "Compound inputs combine whole feet, whole inches, and fractional inch remainders.",
        "1 foot exactly equals 12 inches, and 1 international inch equals exactly 25.4 millimeters.",
        "Always convert fractions to IEEE-754 64-bit floating point decimals before applying the base SI conversion factor (0.0254 m)."
      ],
      sections: [
        {
          title: "The Compound Conversion Formula",
          body: "To convert feet, inches, and fractions into meters or centimeters, first decompose the measurement into pure decimal inches:",
          formula: "Total Inches = (Feet \xD7 12) + Inches + (Numerator / Denominator)\nMeters = Total Inches \xD7 0.0254",
          bulletPoints: [
            "Example: Convert 5 feet 10 1/2 inches to centimeters.",
            "Step 1: Decimal inches = (5 \xD7 12) + 10 + 0.5 = 70.5 inches.",
            "Step 2: Centimeters = 70.5 \xD7 2.54 = 179.07 cm.",
            "Step 3: Meters = 1.7907 m."
          ]
        },
        {
          title: "Common Architectural & Construction Quick Reference",
          body: "Here is a quick verification table for common human heights and construction standards:",
          table: [
            { col1: "Compound US Customary", col2: "Decimal Inches", col3: "Metric (cm / m)" },
            { col1: `5' 6"`, col2: "66.0 in", col3: "167.64 cm (1.68 m)" },
            { col1: `5' 8"`, col2: "68.0 in", col3: "172.72 cm (1.73 m)" },
            { col1: `5' 10"`, col2: "70.0 in", col3: "177.80 cm (1.78 m)" },
            { col1: `6' 0"`, col2: "72.0 in", col3: "182.88 cm (1.83 m)" },
            { col1: `6' 2"`, col2: "74.0 in", col3: "187.96 cm (1.88 m)" },
            { col1: `6' 4"`, col2: "76.0 in", col3: "193.04 cm (1.93 m)" }
          ]
        }
      ],
      faq: [
        { q: "How does NumanX handle fractions like 3/16 or 1/32?", a: "Our smart input parser decomposes the typed string into integer and rational fractions, evaluates the division in high-precision 64-bit floats, and maps it directly to NIST base meters." },
        { q: "Is 1 inch internationally defined as exactly 25.4 mm?", a: "Yes. In 1959, the International Yard and Pound Agreement standardized 1 international inch to exactly 25.4 mm." }
      ]
    }
  },
  {
    slug: "fractional-inches-to-mm-best-practices",
    title: "Fractional Inches to Millimeters: Machinist & Woodworking Best Practices",
    seoTitle: "Fractional Inches to mm: Machinist & Woodworking Guide",
    excerpt: "Everything you need to know about converting fractional inch drill bits and timber stock to metric with tolerance thresholds.",
    category: "Tutorials",
    date: "2025-01-10",
    readTime: "6 min read",
    author: "NumanX Engineering Editorial Staff",
    relatedCat: "length",
    coverIcon: "\u{1F4D0}",
    tags: ["Machining", "Fractions", "Woodworking", "Millimeters"],
    content: {
      intro: 'When manufacturing precision parts, transitioning between American fractional drill bits (1/64" through 1") and metric CNC tooling requires calculating both the nominal converted value and machinist tolerance errors. This tutorial covers fractional precision intervals down to 1/64" and how to minimize tooling deflection.',
      keyTakeaways: [
        "Machining standard fractions operate on binary divisions: 1/2, 1/4, 1/8, 1/16, 1/32, and 1/64.",
        '1/64" equals 0.015625 inches or exactly 0.396875 millimeters.',
        "CNC milling feedrates require true decimal or metric coordinates to avoid step cumulative positioning errors."
      ],
      sections: [
        {
          title: "Binary Fraction Conversion Steps",
          body: "To compute the exact millimeter value of any fractional inch: divide the numerator by the denominator, then multiply by 25.4.",
          formula: "mm = (Numerator / Denominator) \xD7 25.4",
          table: [
            { col1: "Fraction", col2: "Decimal Inch", col3: "Exact Millimeters" },
            { col1: '1/16"', col2: '0.0625"', col3: "1.5875 mm" },
            { col1: '1/8"', col2: '0.1250"', col3: "3.1750 mm" },
            { col1: '3/16"', col2: '0.1875"', col3: "4.7625 mm" },
            { col1: '1/4"', col2: '0.2500"', col3: "6.3500 mm" },
            { col1: '3/8"', col2: '0.3750"', col3: "9.5250 mm" },
            { col1: '1/2"', col2: '0.5000"', col3: "12.7000 mm" },
            { col1: '5/8"', col2: '0.6250"', col3: "15.8750 mm" },
            { col1: '3/4"', col2: '0.7500"', col3: "19.0500 mm" },
            { col1: '1"', col2: '1.0000"', col3: "25.4000 mm" }
          ]
        }
      ],
      faq: [
        { q: "What is the closest metric size to 1/4 inch?", a: "1/4 inch is exactly 6.35 mm. The closest standard metric tool is 6 mm or 6.5 mm." },
        { q: "How does tolerance affect CNC machining?", a: 'Standard CNC tolerances are typically \xB10.005" (\xB10.127 mm). High-precision aerospace tooling can require \xB10.0002" (\xB10.005 mm).' }
      ]
    }
  },
  {
    slug: "metric-vs-imperial-engineering-guide",
    title: "Metric vs Imperial: The Ultimate Engineering & Scientific Comparison",
    seoTitle: "Metric vs Imperial Units: Engineering Comparison",
    excerpt: "Explore the history, mathematical elegance, and costly historical failures that define the battle between SI and Customary units.",
    category: "Engineering",
    date: "2025-05-01",
    readTime: "7 min read",
    author: "NumanX Engineering Editorial Staff",
    relatedCat: "length",
    coverIcon: "\u2696\uFE0F",
    tags: ["Engineering", "SI Units", "Imperial", "Science"],
    content: {
      intro: "In 1999, NASA lost the $125-million Mars Climate Orbiter because one engineering team used metric Newtons while another calculated impulse in pound-seconds. Why does the dichotomy between SI metric and US Customary units persist, and how do modern engineering teams enforce dimensional safety?",
      keyTakeaways: [
        "The International System of Units (SI) is base-10 coherent, linking length, mass, and energy logically.",
        "US Customary units are legally defined based on metric constants (e.g. 1 yard = 0.9144 m).",
        "Modern aerospace and automotive engineering mandate automated dimensional validation in code pipelines."
      ],
      sections: [
        {
          title: "Base Units Comparison Matrix",
          body: "SI uses coherent base units with decimal prefixes (kilo, mega, micro, nano). US Customary uses non-uniform multipliers (12, 3, 1760, 16):",
          table: [
            { col1: "Dimension", col2: "SI Metric Base", col3: "US Customary Base" },
            { col1: "Length", col2: "Meter (m)", col3: "Foot (ft) / Inch (in)" },
            { col1: "Mass", col2: "Kilogram (kg)", col3: "Pound (lb)" },
            { col1: "Temperature", col2: "Kelvin (K) / Celsius (\xB0C)", col3: "Fahrenheit (\xB0F)" },
            { col1: "Force", col2: "Newton (N = kg\xB7m/s\xB2)", col3: "Pound-force (lbf)" },
            { col1: "Pressure", col2: "Pascal (Pa = N/m\xB2)", col3: "PSI (lbf/in\xB2)" }
          ]
        }
      ],
      faq: [
        { q: "Why did the US not adopt the metric system in the 1970s?", a: "The Metric Conversion Act of 1975 made conversion voluntary rather than mandatory, and manufacturing retooling costs led widespread industry pushback." },
        { q: "Is UK Imperial the same as US Customary?", a: "Length and weight are identical, but volume units differ significantly: a British Imperial gallon is 4.546 liters, while a US liquid gallon is 3.785 liters." }
      ]
    }
  },
  {
    slug: "temperature-scales-celsius-fahrenheit-kelvin",
    title: "Temperature Scales Demystified: Celsius, Fahrenheit, and Kelvin",
    excerpt: "Understand thermodynamic temperature scales, absolute zero, and how to convert temperatures effortlessly in your head.",
    category: "Tips",
    date: "2025-05-10",
    readTime: "4 min read",
    author: "NumanX Science Team",
    relatedCat: "temp",
    coverIcon: "\u{1F321}\uFE0F",
    tags: ["Temperature", "Celsius", "Fahrenheit", "Kelvin"],
    content: {
      intro: "Unlike linear units of length and mass, temperature scales feature offset zero points. Water freezes at 0\xB0C, 32\xB0F, and 273.15 K. Here is why the affine transformation formula requires subtraction before division and how to calculate quick mental estimates.",
      keyTakeaways: [
        "Celsius and Kelvin share the identical unit step size (1 K step = 1 \xB0C step).",
        "Fahrenheit uses a 1.8x smaller degree increment: 100 \xB0C spans 180 \xB0F.",
        "Quick mental estimate for \xB0C to \xB0F: Double the Celsius number and add 30."
      ],
      sections: [
        {
          title: "The Core Conversion Formulas",
          body: "Because the zero point of Fahrenheit is shifted by 32 degrees and scaled by 9/5 (1.8):",
          formula: "\xB0F = (\xB0C \xD7 9/5) + 32\n\xB0C = (\xB0F - 32) \xD7 5/9\nK = \xB0C + 273.15",
          bulletPoints: [
            "Absolute zero: -273.15 \xB0C = -459.67 \xB0F = 0 K",
            "Water freezing: 0 \xB0C = 32 \xB0F = 273.15 K",
            "Human body temp: 37 \xB0C = 98.6 \xB0F = 310.15 K",
            "Water boiling: 100 \xB0C = 212 \xB0F = 373.15 K",
            "Intersection point: -40 \xB0C is exactly equal to -40 \xB0F!"
          ]
        }
      ],
      faq: [
        { q: "At what temperature do Celsius and Fahrenheit match?", a: "-40 degrees. At -40\xB0C, the temperature is also -40\xB0F." },
        { q: "Can Kelvin be negative?", a: "In classical thermodynamics, no. 0 Kelvin represents Absolute Zero, where molecular kinetic energy ceases." }
      ]
    }
  },
  {
    slug: "digital-data-storage-units-guide",
    title: "Digital Data Units: Megabytes, Mebibytes, and Transfer Speeds",
    excerpt: "Why your 1 TB hard drive only shows 931 GB in Windows: Decimal (1000) vs Binary (1024) prefixes explained.",
    category: "Productivity",
    date: "2025-06-10",
    readTime: "6 min read",
    author: "NumanX Technology Editorial Team",
    relatedCat: "data",
    coverIcon: "\u{1F4BE}",
    tags: ["Data Storage", "Mebibytes", "Gigabytes", "Networking"],
    content: {
      intro: "Have you ever bought a brand-new 1 Terabyte SSD, plugged it into your PC, and felt cheated because Windows reported only 931 GB? You weren't scammed: drive manufacturers sell storage in decimal SI prefixes (powers of 1000), while operating systems calculate file structures in binary IEC prefixes (powers of 1024).",
      keyTakeaways: [
        "Decimal prefixes (KB, MB, GB, TB) scale by 10\xB3 = 1,000.",
        "Binary prefixes (KiB, MiB, GiB, TiB) scale by 2\xB9\u2070 = 1,024.",
        "Network download speeds are quoted in bits per second (Mbps), while files are measured in Bytes (MB/s). Divide Mbps by 8 to get real-world download speed."
      ],
      sections: [
        {
          title: "The Discrepancy Breakdown",
          body: "A 1 TB hard drive manufactured according to SI standards has 1,000,000,000,000 bytes:",
          formula: "1 TB = 1,000,000,000,000 Bytes\nIn Windows (GiB) = 1,000,000,000,000 / (1024\xB3) \u2248 931.32 GiB",
          table: [
            { col1: "Drive Advertised (Decimal)", col2: "Raw Bytes", col3: "Windows Reported (Binary)" },
            { col1: "256 GB", col2: "256,000,000,000", col3: "238.4 GiB" },
            { col1: "512 GB", col2: "512,000,000,000", col3: "476.8 GiB" },
            { col1: "1 TB", col2: "1,000,000,000,000", col3: "931.3 GiB" },
            { col1: "2 TB", col2: "2,000,000,000,000", col3: "1,862.6 GiB" },
            { col1: "4 TB", col2: "4,000,000,000,000", col3: "3,725.3 GiB" }
          ]
        }
      ],
      faq: [
        { q: "Why is internet speed measured in Megabits (Mbps)?", a: "Telecom standards measure serialized physical bitstreams over cable or fiber. 8 bits equal 1 Byte. A 100 Mbps broadband connection transfers at most 12.5 MB/s of file data." }
      ]
    }
  },
  {
    slug: "ai-powered-unit-conversions-in-2026",
    title: "AI-Powered Unit Conversions in 2026: Natural Language Calculations",
    seoTitle: "AI Unit Conversions in 2026: Natural Language Math",
    excerpt: 'How modern neural parsers and LLM tool-calling engines translate ambiguous human prompts like "3 cups of milk in grams" into precise physical quantities.',
    category: "AI",
    date: "2026-01-05",
    readTime: "7 min read",
    author: "NumanX AI Research",
    relatedCat: "cooking",
    coverIcon: "\u{1F916}",
    tags: ["AI", "Natural Language", "LLM", "Future Tech"],
    content: {
      intro: 'Traditional calculators require structured dropdowns: pick Category, choose Unit A, pick Unit B. In 2026, AI-augmented utility platforms allow users to type or speak natural sentences like "How much is 2.5 gallons of olive oil in kilograms?" and dynamically infer fluid densities, substance profiles, and multi-step dimensional analysis.',
      keyTakeaways: [
        "Natural language input parsing strips linguistic noise and extracts numerical quantities, source units, target units, and substance identities.",
        "Converting volume to mass requires substance density (e.g. water = 1.0 g/cm\xB3, olive oil = 0.92 g/cm\xB3, honey = 1.42 g/cm\xB3).",
        "Hybrid architectures run lightweight deterministic WebAssembly regex locally for sub-millisecond execution, falling back to LLMs only for semantic ambiguity."
      ],
      sections: [
        {
          title: "The Density Bridging Formula",
          body: "To convert volume (cups, gallons, milliliters) into mass (grams, kilograms, pounds), you must multiply volume by the density of the specific substance:",
          formula: "Mass = Volume \xD7 Density (\u03C1)\nExample: 1 cup (236.59 mL) of all-purpose flour (\u03C1 = 0.53 g/mL) = 125.4 grams",
          table: [
            { col1: "Substance", col2: "Density (g/mL)", col3: "Weight of 1 US Cup" },
            { col1: "Water", col2: "1.000 g/mL", col3: "236.6 g (8.35 oz)" },
            { col1: "Milk (whole)", col2: "1.030 g/mL", col3: "243.7 g (8.60 oz)" },
            { col1: "All-Purpose Flour", col2: "0.528 g/mL", col3: "125.0 g (4.41 oz)" },
            { col1: "Granulated Sugar", col2: "0.845 g/mL", col3: "200.0 g (7.05 oz)" },
            { col1: "Olive Oil", col2: "0.918 g/mL", col3: "217.2 g (7.66 oz)" },
            { col1: "Honey", col2: "1.420 g/mL", col3: "336.0 g (11.85 oz)" }
          ]
        }
      ],
      faq: [
        { q: "Can NumanX parse natural language inputs today?", a: 'Yes! Use the AI tab or press \u2318K to open the Natural Language Command Bar and type queries like "50 miles in km" or "100 F in C".' }
      ]
    }
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

// src/config/site.ts
var DEFAULT_SITE_URL = "https://numanx-studio-omega-converter.netlify.app";
function getSiteUrl() {
  const envUrl = typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL ? import.meta.env.VITE_SITE_URL : void 0;
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
function normalizePath(path2 = "") {
  if (!path2 || path2.trim() === "" || path2.trim() === "/") return "/";
  const withoutQuery = path2.trim().split("?")[0].split("#")[0];
  if (!withoutQuery || withoutQuery === "/") return "/";
  const withLeading = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
  const collapsed = withLeading.replace(/\/+/g, "/");
  return collapsed === "/" ? "/" : collapsed.replace(/\/+$/, "");
}
function absoluteUrl(path2 = "") {
  const base = getSiteUrl();
  const normalized = normalizePath(path2);
  return normalized === "/" ? `${base}/` : `${base}${normalized}`;
}
function canonicalUrl(path2 = "") {
  const normalized = normalizePath(path2);
  const resolvedId = resolveCategoryId(normalized);
  if (resolvedId) {
    return absoluteUrl(`/convert/${resolvedId}`);
  }
  return absoluteUrl(normalized);
}

// src/engine/unitSymbols.ts
var SCOPED = {
  "temp:C": "\xB0C",
  "temp:F": "\xB0F",
  "acceleration:gal": "Gal"
};
var SYMBOLS = {
  um: "\xB5m",
  ug: "\xB5g",
  us: "\xB5s",
  uF: "\xB5F",
  mm2: "mm\xB2",
  cm2: "cm\xB2",
  m2: "m\xB2",
  km2: "km\xB2",
  in2: "in\xB2",
  ft2: "ft\xB2",
  yd2: "yd\xB2",
  mi2: "mi\xB2",
  m3: "m\xB3",
  in3: "in\xB3",
  ft3: "ft\xB3",
  floz: "fl oz",
  floz_c: "fl oz",
  cup_c: "cup",
  tbsp_c: "tbsp",
  tsp_c: "tsp",
  mL_c: "mL",
  stone: "st",
  R: "\xB0R",
  Re: "\xB0R\xE9",
  mps: "m/s",
  kmh: "km/h",
  knot: "kn",
  mach: "Mach",
  mps2: "m/s\xB2",
  ftps2: "ft/s\xB2",
  gforce: "g-force",
  ohm: "\u03A9",
  kohm: "k\u03A9",
  Mohm: "M\u03A9",
  Nm: "N\xB7m",
  lbft: "lb\xB7ft",
  kmL: "km/L",
  mpgUS: "MPG (US)",
  mpgUK: "MPG (UK)",
  L100km: "L/100km",
  kgm3: "kg/m\xB3",
  gcm3: "g/cm\xB3",
  lbft3: "lb/ft\xB3",
  BTUh: "BTU/h",
  tc: "TC",
  au: "AU",
  au_a: "AU",
  ly_a: "ly",
  pc_a: "pc",
  sm: "M\u2609",
  em: "M\u2295",
  ld: "LD",
  sr: "R\u2609",
  er: "R\u2295"
};
var SCOPED_NAMES = {
  "temp:C": "Celsius",
  "temp:F": "Fahrenheit",
  "temp:K": "Kelvin"
};
var NAMES = {
  KB: "Kilobyte",
  MB: "Megabyte",
  GB: "Gigabyte",
  TB: "Terabyte",
  PB: "Petabyte",
  kHz: "Kilohertz",
  MHz: "Megahertz",
  GHz: "Gigahertz",
  THz: "Terahertz",
  mm2: "Square Millimeter",
  cm2: "Square Centimeter",
  m2: "Square Meter",
  km2: "Square Kilometer",
  in2: "Square Inch",
  ft2: "Square Foot",
  yd2: "Square Yard",
  mi2: "Square Mile",
  Nm: "Newton-meter",
  lbft: "Pound-foot",
  au_a: "Astronomical Unit"
};
function unitSymbol(u, catId) {
  return catId && SCOPED[`${catId}:${u.id}`] || SYMBOLS[u.id] || u.id;
}
function unitName(u, catId) {
  return catId && SCOPED_NAMES[`${catId}:${u.id}`] || NAMES[u.id] || u.lb;
}
function unitLabel(u, catId) {
  const name = unitName(u, catId);
  const sym = unitSymbol(u, catId);
  return name === sym ? name : `${name} (${sym})`;
}

// src/config/schema.ts
function buildCorePageSchema(routePath, title, description, options) {
  const pageUrl = canonicalUrl(routePath);
  const isApp = !!options?.applicationCategory;
  const primaryType = options?.pageType || (isApp ? "WebApplication" : "WebPage");
  const cleanTitle = title.split("\u2014")[0].split("|")[0].trim();
  const primaryNode = {
    "@type": primaryType,
    "@id": `${pageUrl}#${primaryType.toLowerCase()}`,
    name: title,
    url: pageUrl,
    description
  };
  if (isApp || primaryType === "WebApplication") {
    primaryNode["applicationCategory"] = options?.applicationCategory || "UtilitiesApplication";
    primaryNode["operatingSystem"] = "All";
    primaryNode["offers"] = { "@type": "Offer", price: "0", priceCurrency: "USD" };
  }
  return {
    "@context": "https://schema.org",
    "@graph": [
      primaryNode,
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: canonicalUrl("/") },
          { "@type": "ListItem", position: 2, name: cleanTitle, item: pageUrl }
        ]
      }
    ]
  };
}

// src/engine/categoryContent.ts
var categoryContent = {
  length: {
    title: "Length Converter \u2014 Metric, Imperial & Fractional Inches",
    metaDesc: 'Precision length converter with architectural fractions (1/64"), compound feet & inches, machinist socket tolerances, and NIST SP 811 tables.',
    h1: "Length Precision Converter & Architectural Scale",
    intro: 'Convert between any length units instantly \u2014 from nanometers to parsecs. Supports metric, imperial, architectural tape fractions (1/64"), and astronomical units. Meets NIST SP 811 and the 1959 International Yard Agreement standards. Natural language phrases like "5 feet 10 inches in cm" and compound expressions are handled automatically.',
    popularPairs: [
      { from: "Meter", to: "Feet", desc: "m \u2192 ft \u2014 standard construction & height conversion" },
      { from: "Kilometer", to: "Miles", desc: "km \u2192 mi \u2014 road distance & travel planning" },
      { from: "Inches", to: "Centimeter", desc: "in \u2192 cm \u2014 screen sizes & clothing dimensions" },
      { from: "Feet", to: "Meters", desc: "ft \u2192 m \u2014 real estate & architecture" },
      { from: "Centimeter", to: "Inches", desc: "cm \u2192 in \u2014 product dimensions & body measurements" }
    ],
    useCases: ["Construction & architecture (ft\u2194m)", "Travel & navigation (km\u2194mi)", "Clothing & body measurements (in\u2194cm)", "Scientific research (nm, \u03BCm, ly)", "Real estate & property (ft\u2194m, ac\u2194ha)"],
    formula: "1 meter = 3.2808399 feet. 1 inch = exactly 25.4 millimeters (1959 International Yard Agreement). 1 kilometer = 0.6213712 miles.",
    faq: [
      { q: "How do I convert meters to feet?", a: "Multiply the length in meters by 3.2808399 to calculate decimal feet. For example, 10 meters \xD7 3.2808399 = 32.81 feet. To convert into feet and inches, multiply the decimal remainder by 12." },
      { q: "How many inches are in a centimeter?", a: "One centimeter equals exactly 0.393700787 inches. Conversely, one inch is internationally defined as exactly 2.54 centimeters (25.4 millimeters)." },
      { q: "What is the difference between an international foot and a US survey foot?", a: "An international foot is defined as exactly 0.3048 meters. The historic US survey foot equals 1200/3937 meters (approx. 0.30480061 meters). NIST officially deprecated the US survey foot on January 1, 2023, standardizing all US mapping on the international foot." }
    ]
  },
  mass: {
    title: "Weight & Mass Converter \u2014 Kilograms, Pounds, Ounces, Tons & More",
    metaDesc: "Free online weight converter. Convert between kilograms, pounds, ounces, grams, metric tons, stone, and 15+ mass units. Perfect for cooking, shipping, fitness.",
    h1: "Mass & Weight Conversion",
    intro: "Convert between mass and weight units with precision. Supports metric units (kilogram, gram, milligram, metric ton), imperial units (pound, ounce, stone, US ton), and scientific units (atomic mass unit, electron volt). Whether you are tracking fitness goals, calculating shipping weights, or doing chemistry homework, the mass converter handles it all with up to 12 decimal places of precision.",
    popularPairs: [
      { from: "Kilogram", to: "Pounds", desc: "kg \u2192 lb \u2014 fitness & body weight tracking" },
      { from: "Pounds", to: "Kilogram", desc: "lb \u2192 kg \u2014 international shipping & travel" },
      { from: "Ounces", to: "Grams", desc: "oz \u2192 g \u2014 cooking & baking recipes" },
      { from: "Stone", to: "Kilogram", desc: "st \u2192 kg \u2014 UK body weight to metric" },
      { from: "Metric Ton", to: "US Ton", desc: "t \u2192 ton \u2014 industrial & freight" }
    ],
    useCases: ["Fitness & body weight (kg\u2194lb)", "Cooking & recipes (oz\u2194g, lb\u2194g)", "Shipping & logistics (kg\u2194lb, t\u2194ton)", "Science & chemistry (amu, g)", "Jewelry & precious metals (oz\u2194g)"],
    formula: "1 kilogram = 2.20462 pounds. 1 pound = 453.592 grams. 1 stone = 6.35029 kilograms.",
    faq: [
      { q: "How many pounds in a kilogram?", a: "One kilogram equals 2.20462 pounds. Multiply kg by 2.20462 to get pounds." },
      { q: "How do I convert ounces to grams?", a: "Multiply ounces by 28.3495 to get grams. For example, 8 oz \xD7 28.3495 = 226.8 grams." }
    ]
  },
  temp: {
    title: "Temperature Converter \u2014 Celsius, Fahrenheit, Kelvin & 5 Scales",
    metaDesc: "Free online temperature converter. Convert between Celsius, Fahrenheit, Kelvin, Rankine, and R\xE9aumur. Includes formula explanations and real-world reference points.",
    h1: "Temperature Conversion",
    intro: "Convert between five temperature scales: Celsius (\xB0C), Fahrenheit (\xB0F), Kelvin (K), Rankine (\xB0R), and R\xE9aumur (\xB0Re). The temperature converter uses precise formulas for each scale conversion and includes real-world reference points like freezing point (0\xB0C / 32\xB0F), boiling point (100\xB0C / 212\xB0F), and absolute zero (0 K / -273.15\xB0C).",
    popularPairs: [
      { from: "Celsius", to: "Fahrenheit", desc: "\xB0C \u2192 \xB0F \u2014 weather & daily temperature" },
      { from: "Fahrenheit", to: "Celsius", desc: "\xB0F \u2192 \xB0C \u2014 international travel" },
      { from: "Celsius", to: "Kelvin", desc: "\xB0C \u2192 K \u2014 scientific & chemistry calculations" },
      { from: "Kelvin", to: "Celsius", desc: "K \u2192 \xB0C \u2014 physics & engineering" },
      { from: "Fahrenheit", to: "Kelvin", desc: "\xB0F \u2192 K \u2014 advanced science" }
    ],
    useCases: ["Weather & climate (\xB0C\u2194\xB0F)", "Cooking & baking (\xB0C\u2194\xB0F)", "Science & chemistry (K\u2194\xB0C)", "Engineering & physics (K\u2194\xB0R)", "HVAC & refrigeration"],
    formula: "\xB0F = (\xB0C \xD7 9/5) + 32. K = \xB0C + 273.15. \xB0C = (\xB0F \u2212 32) \xD7 5/9.",
    faq: [
      { q: "How do I convert Celsius to Fahrenheit?", a: "Multiply Celsius by 9/5 (1.8) then add 32. For example, 25\xB0C \xD7 1.8 + 32 = 77\xB0F." },
      { q: "What is absolute zero in Celsius?", a: "Absolute zero is 0 Kelvin, which equals -273.15\xB0C or -459.67\xB0F." }
    ]
  },
  area: {
    title: "Area Converter \u2014 Square Meters, Acres, Hectares & Square Feet",
    metaDesc: "Free online area converter. Convert between square meters, square feet, acres, hectares, square kilometers, and 12+ area units. Perfect for real estate & land.",
    h1: "Area Conversion",
    intro: "Convert between area units for real estate, construction, agriculture, and science. Supports square meters (m\xB2), square feet (ft\xB2), square kilometers (km\xB2), acres (ac), hectares (ha), square inches (in\xB2), square yards (yd\xB2), square miles (mi\xB2), and scientific units like barns.",
    popularPairs: [
      { from: "Square Meters", to: "Square Feet", desc: "m\xB2 \u2192 ft\xB2 \u2014 real estate & property listings" },
      { from: "Acres", to: "Hectares", desc: "ac \u2192 ha \u2014 farmland & land measurement" },
      { from: "Square Feet", to: "Square Meters", desc: "ft\xB2 \u2192 m\xB2 \u2014 international property comparison" },
      { from: "Hectares", to: "Acres", desc: "ha \u2192 ac \u2014 agricultural land" },
      { from: "Square Kilometers", to: "Square Miles", desc: "km\xB2 \u2192 mi\xB2 \u2014 country & region areas" }
    ],
    useCases: ["Real estate & property (m\xB2\u2194ft\xB2)", "Agriculture & land (ac\u2194ha)", "Construction & flooring (ft\xB2\u2194m\xB2)", "Geography & mapping (km\xB2\u2194mi\xB2)", "Science (barn, mm\xB2)"],
    formula: "1 square meter = 10.7639 square feet. 1 acre = 0.404686 hectares. 1 hectare = 107,639 square feet.",
    faq: [
      { q: "How many square feet in a square meter?", a: "One square meter equals 10.7639 square feet. Multiply m\xB2 by 10.7639 to get ft\xB2." },
      { q: "How many acres in a hectare?", a: "One hectare equals 2.47105 acres. Multiply hectares by 2.47105 to get acres." }
    ]
  },
  volume: {
    title: "Volume Converter \u2014 Liters, Gallons, Cubic Meters, Quarts & More",
    metaDesc: "Free online volume converter. Convert between liters, gallons, quarts, pints, cubic meters, milliliters, and 15+ volume units. For cooking, shipping, science.",
    h1: "Volume Conversion",
    intro: "Convert between volume and capacity units for cooking, shipping, science, and industry. Supports metric units (milliliter, liter, cubic meter), US customary units (gallon, quart, pint, cup, fluid ounce), imperial units, and scientific units.",
    popularPairs: [
      { from: "Liters", to: "Gallons", desc: "L \u2192 gal \u2014 fuel economy & liquid measurement" },
      { from: "Gallons", to: "Liters", desc: "gal \u2192 L \u2014 international volume comparison" },
      { from: "Milliliters", to: "Fluid Ounces", desc: "mL \u2192 fl oz \u2014 cooking & recipes" },
      { from: "Cubic Meters", to: "Cubic Feet", desc: "m\xB3 \u2192 ft\xB3 \u2014 shipping & storage" },
      { from: "Quarts", to: "Liters", desc: "qt \u2192 L \u2014 kitchen & cooking" }
    ],
    useCases: ["Cooking & baking (mL\u2194fl oz, cup)", "Fuel & automotive (L\u2194gal)", "Shipping & storage (m\xB3\u2194ft\xB3)", "Science & chemistry (mL\u2194L)", "Aquariums & pools (L\u2194gal)"],
    formula: "1 liter = 0.264172 gallons. 1 gallon = 3.78541 liters. 1 cubic meter = 35.3147 cubic feet.",
    faq: [
      { q: "How many liters in a gallon?", a: "One US gallon equals 3.78541 liters. One UK gallon equals 4.54609 liters." },
      { q: "How do I convert milliliters to fluid ounces?", a: "Divide milliliters by 29.5735 to get US fluid ounces. For example, 250 mL \xF7 29.5735 = 8.45 fl oz." }
    ]
  },
  speed: {
    title: "Speed Converter \u2014 mph, km/h, Knots, Mach & Speed Units",
    metaDesc: "Free online speed converter. Convert between miles per hour, kilometers per hour, knots, meters per second, Mach number, and more. Perfect for travel & aviation.",
    h1: "Speed Conversion",
    intro: "Convert between speed units for travel, aviation, marine, and science. Supports kilometers per hour (km/h), miles per hour (mph), knots (kn), meters per second (m/s), feet per second (ft/s), Mach number, and speed of light.",
    popularPairs: [
      { from: "km/h", to: "mph", desc: "km/h \u2192 mph \u2014 road speed limits & travel" },
      { from: "mph", to: "km/h", desc: "mph \u2192 km/h \u2014 international driving" },
      { from: "Knots", to: "mph", desc: "kn \u2192 mph \u2014 aviation & marine" },
      { from: "m/s", to: "km/h", desc: "m/s \u2192 km/h \u2014 physics & sports" },
      { from: "Mach", to: "km/h", desc: "Mach \u2192 km/h \u2014 aerospace & aviation" }
    ],
    useCases: ["Driving & road trips (km/h\u2194mph)", "Aviation (kn\u2194mph)", "Marine navigation (kn)", "Physics calculations (m/s)", "Sports analytics (m/s\u2194km/h)"],
    formula: "1 mph = 1.60934 km/h. 1 knot = 1.15078 mph = 1.852 km/h. Mach 1 \u2248 1,235 km/h at sea level.",
    faq: [
      { q: "How do I convert km/h to mph?", a: "Divide km/h by 1.60934 to get mph. For example, 100 km/h \xF7 1.60934 = 62.14 mph." },
      { q: "What is the difference between knots and mph?", a: "One knot equals 1.15078 mph. Knots are used in aviation and marine contexts, while mph is used for road travel." }
    ]
  },
  time: {
    title: "Time Converter \u2014 Seconds, Minutes, Hours, Days & Time Units",
    metaDesc: "Free online time converter. Convert between seconds, minutes, hours, days, weeks, months, years, and more. Perfect for project planning & scheduling.",
    h1: "Time Conversion",
    intro: "Convert between time units for project management, scheduling, science, and everyday use. Supports seconds, minutes, hours, days, weeks, months, years, decades, centuries, and milliseconds.",
    popularPairs: [
      { from: "Hours", to: "Minutes", desc: "h \u2192 min \u2014 scheduling & planning" },
      { from: "Days", to: "Hours", desc: "d \u2192 h \u2014 project timelines" },
      { from: "Minutes", to: "Seconds", desc: "min \u2192 s \u2014 precise timing" },
      { from: "Weeks", to: "Days", desc: "wk \u2192 d \u2014 work & travel planning" },
      { from: "Years", to: "Days", desc: "yr \u2192 d \u2014 long-term planning" }
    ],
    useCases: ["Project management (h\u2194min)", "Fitness & workouts (min\u2194s)", "Travel planning (d\u2194h)", "Scientific experiments (ms\u2194s)", "Payroll & billing (h\u2194min)"],
    formula: "1 hour = 60 minutes = 3,600 seconds. 1 day = 24 hours. 1 year = 365.25 days (accounting for leap years).",
    faq: [
      { q: "How many minutes in a day?", a: "There are 1,440 minutes in a day (24 hours \xD7 60 minutes)." },
      { q: "How do I convert hours to seconds?", a: "Multiply hours by 3,600. For example, 2 hours \xD7 3,600 = 7,200 seconds." }
    ]
  },
  energy: {
    title: "Energy Converter \u2014 Joules, Calories, kWh, BTU & Energy Units",
    metaDesc: "Free online energy converter. Convert between joules, calories, kilowatt-hours, BTUs, electronvolts, and more. Perfect for physics, nutrition, and engineering.",
    h1: "Energy Conversion",
    intro: "Convert between energy units for physics, nutrition, engineering, and everyday use. Supports joules (J), kilojoules (kJ), calories (cal), kilocalories (Cal/kcal), watt-hours (Wh), kilowatt-hours (kWh), BTUs, electronvolts (eV), and foot-pounds.",
    popularPairs: [
      { from: "Joules", to: "Calories", desc: "J \u2192 cal \u2014 physics & nutrition" },
      { from: "kWh", to: "BTU", desc: "kWh \u2192 BTU \u2014 HVAC & energy bills" },
      { from: "Calories", to: "Joules", desc: "Cal \u2192 J \u2014 food energy conversion" },
      { from: "eV", to: "Joules", desc: "eV \u2192 J \u2014 particle physics" },
      { from: "BTU", to: "kWh", desc: "BTU \u2192 kWh \u2014 heating & cooling" }
    ],
    useCases: ["Nutrition & diet tracking (Cal\u2194kJ)", "Physics calculations (J\u2194eV)", "Energy bills (kWh\u2194BTU)", "Exercise & fitness (Cal\u2194J)", "HVAC engineering (BTU\u2194kWh)"],
    formula: "1 calorie = 4.184 joules. 1 kWh = 3,412 BTU = 3.6 \xD7 10\u2076 J. 1 eV = 1.602 \xD7 10\u207B\xB9\u2079 J.",
    faq: [
      { q: "How many joules in a calorie?", a: "One calorie equals 4.184 joules. A food Calorie (kcal) equals 4,184 joules." },
      { q: "How do I convert kWh to BTU?", a: "Multiply kWh by 3,412 to get BTU. For example, 1 kWh \xD7 3,412 = 3,412 BTU." }
    ]
  },
  pressure: {
    title: "Pressure Converter \u2014 PSI, Bar, Pascal, ATM & Pressure Units",
    metaDesc: "Free online pressure converter. Convert between PSI, bar, pascals, atmospheres, torr, mmHg, and more. Perfect for engineering, diving, and meteorology.",
    h1: "Pressure Conversion",
    intro: "Convert between pressure units for engineering, meteorology, diving, and science. Supports pascals (Pa), kilopascals (kPa), megapascals (MPa), bar, PSI (pounds per square inch), atmospheres (atm), torr, millimeters of mercury (mmHg), and inches of mercury (inHg).",
    popularPairs: [
      { from: "PSI", to: "Bar", desc: "psi \u2192 bar \u2014 tire pressure & automotive" },
      { from: "Bar", to: "PSI", desc: "bar \u2192 psi \u2014 industrial pressure gauges" },
      { from: "ATM", to: "PSI", desc: "atm \u2192 psi \u2014 scuba diving & depth" },
      { from: "Pascals", to: "PSI", desc: "Pa \u2192 psi \u2014 scientific measurements" },
      { from: "mmHg", to: "ATM", desc: "mmHg \u2192 atm \u2014 blood pressure & weather" }
    ],
    useCases: ["Tire pressure (PSI\u2194bar)", "Scuba diving (atm\u2194psi)", "Weather forecasting (hPa\u2194inHg)", "HVAC & refrigeration (PSI\u2194bar)", "Blood pressure (mmHg)"],
    formula: "1 bar = 14.5038 PSI = 100,000 Pa. 1 atm = 14.696 PSI = 101,325 Pa. 1 mmHg = 133.322 Pa.",
    faq: [
      { q: "How do I convert PSI to bar?", a: "Divide PSI by 14.5038 to get bar. For example, 36 PSI \xF7 14.5038 = 2.48 bar." },
      { q: "What is standard atmospheric pressure?", a: "Standard atmospheric pressure is 1 atm = 14.696 PSI = 101.325 kPa = 29.92 inHg." }
    ]
  },
  power: {
    title: "Power Converter \u2014 Watts, Horsepower, BTU/h & Power Units",
    metaDesc: "Free online power converter. Convert between watts, horsepower, kilowatts, BTUs per hour, and more. For engineering, automotive, and energy calculations.",
    h1: "Power Conversion",
    intro: "Convert between power units for engineering, automotive, energy, and science. Supports watts (W), kilowatts (kW), megawatts (MW), horsepower (hp), BTUs per hour (BTU/h), foot-pounds per minute, and calories per second.",
    popularPairs: [
      { from: "Horsepower", to: "Kilowatts", desc: "hp \u2192 kW \u2014 engine power & automotive" },
      { from: "Kilowatts", to: "Horsepower", desc: "kW \u2192 hp \u2014 international specs" },
      { from: "Watts", to: "BTU/h", desc: "W \u2192 BTU/h \u2014 heating & cooling" },
      { from: "MW", to: "kW", desc: "MW \u2192 kW \u2014 power plant output" },
      { from: "Horsepower", to: "Watts", desc: "hp \u2192 W \u2014 mechanical power" }
    ],
    useCases: ["Automotive engine specs (hp\u2194kW)", "Electrical appliances (W\u2194kW)", "HVAC systems (BTU/h\u2194W)", "Industrial machinery (MW\u2194kW)", "Fitness equipment (W\u2194hp)"],
    formula: "1 horsepower = 745.7 watts = 0.7457 kW. 1 kW = 1.341 horsepower. 1 W = 3.412 BTU/h.",
    faq: [
      { q: "How many kilowatts in one horsepower?", a: "One horsepower equals 0.7457 kilowatts. To convert hp to kW, multiply by 0.7457." },
      { q: "How do I convert watts to BTU/h?", a: "Multiply watts by 3.412 to get BTU per hour. For example, 1,000 W \xD7 3.412 = 3,412 BTU/h." }
    ]
  },
  force: {
    title: "Force Converter \u2014 Newtons, Pound-Force, Dynes & Force Units",
    metaDesc: "Free online force converter. Convert between newtons, pound-force, dynes, kilogram-force, and more. For physics and engineering calculations.",
    h1: "Force Conversion",
    intro: "Convert between force units for physics, engineering, and mechanics. Supports newtons (N), kilonewtons (kN), pound-force (lbf), dynes (dyn), kilogram-force (kgf), and ounce-force (ozf).",
    popularPairs: [
      { from: "Newtons", to: "Pound-Force", desc: "N \u2192 lbf \u2014 physics & engineering" },
      { from: "Pound-Force", to: "Newtons", desc: "lbf \u2192 N \u2014 mechanical systems" },
      { from: "kN", to: "lbf", desc: "kN \u2192 lbf \u2014 structural engineering" },
      { from: "Dynes", to: "Newtons", desc: "dyn \u2192 N \u2014 scientific calculations" },
      { from: "kgf", to: "N", desc: "kgf \u2192 N \u2014 metric force conversions" }
    ],
    useCases: ["Structural engineering (kN\u2194lbf)", "Physics experiments (N\u2194dyn)", "Mechanical systems (N\u2194lbf)", "Material testing (N\u2194kgf)", "Aerospace engineering (kN\u2194lbf)"],
    formula: "1 newton = 0.224809 pound-force. 1 N = 100,000 dynes. 1 kgf = 9.80665 N.",
    faq: [
      { q: "How many newtons in a pound-force?", a: "One pound-force equals 4.44822 newtons. To convert lbf to N, multiply by 4.44822." },
      { q: "What is the difference between mass and force?", a: "Mass (kg, lb) measures the amount of matter. Force (N, lbf) measures the push or pull. Weight is a force \u2014 mass \xD7 gravity." }
    ]
  },
  data: {
    title: "Data Storage Converter \u2014 Bytes, KB, MB, GB, TB & Digital Units",
    metaDesc: "Free online data storage converter. Convert between bytes, kilobytes, megabytes, gigabytes, terabytes, and more. Perfect for IT & storage planning.",
    h1: "Data Storage Conversion",
    intro: "Convert between digital storage units for IT, software development, and data management. Supports bits, bytes, kilobytes (KB), megabytes (MB), gigabytes (GB), terabytes (TB), petabytes (PB), and both binary (KiB, MiB) and decimal (KB, MB) standards.",
    popularPairs: [
      { from: "MB", to: "GB", desc: "MB \u2192 GB \u2014 storage capacity & file sizes" },
      { from: "GB", to: "MB", desc: "GB \u2192 MB \u2014 memory & disk space" },
      { from: "GB", to: "TB", desc: "GB \u2192 TB \u2014 large storage planning" },
      { from: "KB", to: "MB", desc: "KB \u2192 MB \u2014 document & image sizes" },
      { from: "Bits", to: "Bytes", desc: "b \u2192 B \u2014 networking & data transfer" }
    ],
    useCases: ["Storage capacity planning (GB\u2194TB)", "File size management (MB\u2194GB)", "Network bandwidth (bits\u2194bytes)", "Cloud storage (GB\u2194TB)", "Programming & development (KiB\u2194MiB)"],
    formula: "1 byte = 8 bits. 1 KB = 1,024 bytes. 1 MB = 1,024 KB. 1 GB = 1,024 MB. 1 TB = 1,024 GB.",
    faq: [
      { q: "How many MB in a GB?", a: "There are 1,024 MB in 1 GB (binary). For decimal (hard drive) notation, 1 GB = 1,000 MB." },
      { q: "What is the difference between a bit and a byte?", a: "A bit is the smallest digital unit (0 or 1). A byte is 8 bits. Internet speeds are usually in bits (Mbps), while file sizes are in bytes (MB)." }
    ]
  },
  fuel: {
    title: "Fuel Economy Converter \u2014 MPG, km/L, L/100km & Fuel Units",
    metaDesc: "Free online fuel economy converter. Convert between miles per gallon, kilometers per liter, liters per 100km, and more. For automotive & fuel efficiency.",
    h1: "Fuel Economy Conversion",
    intro: "Convert between fuel economy units for automotive, fleet management, and travel planning. Supports miles per gallon US (mpg US), miles per gallon UK (mpg UK), kilometers per liter (km/L), and liters per 100 kilometers (L/100km).",
    popularPairs: [
      { from: "MPG (US)", to: "L/100km", desc: "mpg \u2192 L/100km \u2014 fuel efficiency comparison" },
      { from: "L/100km", to: "MPG (US)", desc: "L/100km \u2192 mpg \u2014 international vehicle specs" },
      { from: "km/L", to: "MPG (US)", desc: "km/L \u2192 mpg \u2014 metric to imperial fuel economy" },
      { from: "MPG (UK)", to: "MPG (US)", desc: "UK mpg \u2192 US mpg \u2014 UK vs US gallon difference" },
      { from: "L/100km", to: "km/L", desc: "L/100km \u2192 km/L \u2014 common metric comparison" }
    ],
    useCases: ["Vehicle comparison (mpg\u2194L/100km)", "Trip fuel planning (km/L\u2194L/100km)", "Fleet management (mpg\u2194L/100km)", "International car imports", "Environmental impact calculation"],
    formula: "L/100km = 235.215 / mpg (US). L/100km = 282.481 / mpg (UK). 1 km/L = 2.35215 mpg (US).",
    faq: [
      { q: "How do I convert MPG to L/100km?", a: "Divide 235.215 by your MPG value. For example, 30 MPG \u2192 235.215 \xF7 30 = 7.84 L/100km." },
      { q: "What is the difference between US and UK gallons?", a: "A US gallon is 3.785 liters, while a UK (imperial) gallon is 4.546 liters. This affects MPG calculations by about 20%." }
    ]
  },
  angle: {
    title: "Angle Converter \u2014 Degrees, Radians, Gradians & Angle Units",
    metaDesc: "Free online angle converter. Convert between degrees, radians, gradians, minutes of arc, seconds of arc, and more. For math, navigation & engineering.",
    h1: "Angle Conversion",
    intro: "Convert between angle units for mathematics, navigation, engineering, and astronomy. Supports degrees (\xB0), radians (rad), gradians (gon), arcminutes (\u2032), arcseconds (\u2033), and milliradians (mrad).",
    popularPairs: [
      { from: "Degrees", to: "Radians", desc: "\xB0 \u2192 rad \u2014 trigonometry & calculus" },
      { from: "Radians", to: "Degrees", desc: "rad \u2192 \xB0 \u2014 practical geometry" },
      { from: "Degrees", to: "Gradians", desc: "\xB0 \u2192 gon \u2014 surveying & land measurement" },
      { from: "Arcminutes", to: "Degrees", desc: "\u2032 \u2192 \xB0 \u2014 astronomy & navigation" },
      { from: "Radians", to: "mrad", desc: "rad \u2192 mrad \u2014 precision targeting" }
    ],
    useCases: ["Trigonometry (\xB0\u2194rad)", "Navigation (\xB0\u2194\u2032\u2194\u2033)", "Surveying (gon\u2194\xB0)", "Astronomy (\u2032\u2194\u2033\u2194rad)", "Engineering (rad\u2194mrad)"],
    formula: "\u03C0 radians = 180\xB0. 1 radian \u2248 57.2958\xB0. 1\xB0 = 60 arcminutes = 3,600 arcseconds.",
    faq: [
      { q: "How do I convert degrees to radians?", a: "Multiply degrees by \u03C0/180. For example, 180\xB0 \xD7 \u03C0/180 = \u03C0 radians, 90\xB0 \xD7 \u03C0/180 = \u03C0/2 radians." },
      { q: "What is a gradian?", a: "A gradian (gon) divides a right angle into 100 parts. 100 gradians = 90\xB0, 400 gradians = 360\xB0. Used in surveying and some European engineering." }
    ]
  },
  frequency: {
    title: "Frequency Converter \u2014 Hertz, kHz, MHz, GHz & Frequency Units",
    metaDesc: "Free online frequency converter. Convert between hertz, kilohertz, megahertz, gigahertz, and more. For electronics, radio, and physics.",
    h1: "Frequency Conversion",
    intro: "Convert between frequency units for electronics, telecommunications, radio, and physics. Supports hertz (Hz), kilohertz (kHz), megahertz (MHz), gigahertz (GHz), terahertz (THz), rotations per minute (RPM), and beats per minute (BPM).",
    popularPairs: [
      { from: "MHz", to: "GHz", desc: "MHz \u2192 GHz \u2014 CPU clock speeds & radio frequencies" },
      { from: "GHz", to: "MHz", desc: "GHz \u2192 MHz \u2014 processor specifications" },
      { from: "kHz", to: "MHz", desc: "kHz \u2192 MHz \u2014 AM radio & audio frequencies" },
      { from: "Hz", to: "kHz", desc: "Hz \u2192 kHz \u2014 sound & audio processing" },
      { from: "RPM", to: "Hz", desc: "RPM \u2192 Hz \u2014 motor speeds & machinery" }
    ],
    useCases: ["Electronics (Hz\u2194MHz\u2194GHz)", "Radio & telecommunications (kHz\u2194MHz)", "Audio processing (Hz\u2194kHz)", "CPU & hardware specs (MHz\u2194GHz)", "Motor & machinery (RPM\u2194Hz)"],
    formula: "1 kHz = 1,000 Hz. 1 MHz = 1,000 kHz = 1,000,000 Hz. 1 GHz = 1,000 MHz. 1 RPM = 1/60 Hz.",
    faq: [
      { q: "How do I convert MHz to GHz?", a: "Divide MHz by 1,000 to get GHz. For example, 2,400 MHz \xF7 1,000 = 2.4 GHz." },
      { q: "What is the difference between Hz and RPM?", a: "Hz measures cycles per second, while RPM measures rotations per minute. 1 Hz = 60 RPM. To convert RPM to Hz, divide by 60." }
    ]
  },
  acceleration: {
    title: "Acceleration Converter \u2014 m/s\xB2, G-Force, ft/s\xB2 & More",
    metaDesc: "Convert acceleration units: m/s\xB2, g-force, ft/s\xB2 and Gal. Free online converter for physics and engineering, with formulas and charts.",
    h1: "Acceleration Conversion",
    intro: "Convert between linear acceleration and gravitational acceleration units. Supports meters per second squared (m/s\xB2), standard gravitational acceleration (g-force, 9.80665 m/s\xB2), feet per second squared (ft/s\xB2), and Galileo (Gal). Essential for physics students, automotive engineers, and aerospace calculations.",
    popularPairs: [
      { from: "m/s\xB2", to: "g-force", desc: "m/s\xB2 \u2192 g \u2014 convert acceleration into gravitational multiples" },
      { from: "g-force", to: "m/s\xB2", desc: "g \u2192 m/s\xB2 \u2014 calculate real-world physical acceleration from g-load" },
      { from: "ft/s\xB2", to: "m/s\xB2", desc: "ft/s\xB2 \u2192 m/s\xB2 \u2014 imperial to metric engineering acceleration" }
    ],
    useCases: ["Automotive performance (0-60 mph g-forces)", "Aerospace flight load analysis", "Civil engineering & seismic calculations", "Physics kinematics problem-solving"],
    formula: "1 g = 9.80665 m/s\xB2. 1 m/s\xB2 \u2248 3.28084 ft/s\xB2.",
    faq: [
      { q: "What is 1 g of acceleration in m/s\xB2?", a: "1 standard g-force equals 9.80665 meters per second squared (m/s\xB2)." },
      { q: "How do I convert m/s\xB2 to g-force?", a: "Divide your acceleration in m/s\xB2 by 9.80665 to get the load in g-force." }
    ]
  },
  electricity: {
    title: "Electricity Converter \u2014 Volts, Amperes, Ohms, Farads & Coulombs",
    metaDesc: "Free online electrical units converter. Convert between Volts, Amperes, Milliamperes, Ohms, Kilohms, Microfarads, and Coulombs for circuit design and electronics.",
    h1: "Electrical Units Conversion",
    intro: "Convert between electrical potential, current, resistance, capacitance, and charge units. Supports Volts (V, kV), Amperes (A, mA), Ohms (\u03A9, k\u03A9, M\u03A9), Farads (F, \xB5F), and Coulombs (C). Designed for electronics hobbyists, electrical engineers, and students.",
    popularPairs: [
      { from: "Volt", to: "Kilovolt", desc: "V \u2192 kV \u2014 electrical grid & power supplies" },
      { from: "Milliampere", to: "Ampere", desc: "mA \u2192 A \u2014 microelectronics & battery consumption" },
      { from: "Kilo-ohm", to: "Ohm", desc: "k\u03A9 \u2192 \u03A9 \u2014 resistor ratings & circuit design" },
      { from: "Microfarad", to: "Farad", desc: "\xB5F \u2192 F \u2014 capacitor capacitance ratings" }
    ],
    useCases: ["Circuit prototyping and breadboarding", "Power supply sizing and solar calculations", "Audio equipment impedance matching", "Battery discharge analysis"],
    formula: "Ohm's Law: V = I \xD7 R. 1 kV = 1,000 V. 1 A = 1,000 mA. 1 k\u03A9 = 1,000 \u03A9.",
    faq: [
      { q: "How many milliamperes are in an ampere?", a: "There are exactly 1,000 milliamperes (mA) in one ampere (A)." },
      { q: "How do I convert kilohms to ohms?", a: "Multiply the value in kilohms (k\u03A9) by 1,000 to get ohms (\u03A9)." }
    ]
  },
  magnetism: {
    title: "Magnetism Converter \u2014 Tesla, Gauss, Weber & Field Units",
    metaDesc: "Convert magnetic flux density and flux units online: Tesla (T), Gauss (G), and Weber (Wb). Fast and precise calculator for physics and MRI magnetism.",
    h1: "Magnetic Units Conversion",
    intro: "Convert between magnetic flux density and total magnetic field units. Supports Tesla (T, SI unit), Gauss (G, CGS unit), and Weber (Wb, magnetic flux). Essential for MRI physics, magnet manufacturing, speaker drivers, and electromagnetism.",
    popularPairs: [
      { from: "Tesla", to: "Gauss", desc: "T \u2192 G \u2014 convert high-field magnets (1 T = 10,000 G)" },
      { from: "Gauss", to: "Tesla", desc: "G \u2192 T \u2014 convert geomagnetic and surface field readings" }
    ],
    useCases: ["MRI medical scanner field strength analysis", "Permanent neodymium magnet grading (N42, N52)", "Geomagnetic Earth field measurements", "Sensor calibration (Hall effect sensors)"],
    formula: "1 Tesla (T) = 10,000 Gauss (G). 1 Gauss = 0.0001 Tesla.",
    faq: [
      { q: "How many Gauss are in one Tesla?", a: "1 Tesla equals exactly 10,000 Gauss." },
      { q: "What is the Earth's magnetic field in Gauss?", a: "The Earth's surface magnetic field is relatively weak, typically between 0.25 and 0.65 Gauss (25 to 65 microteslas)." }
    ]
  },
  datatransfer: {
    title: "Data Transfer Rate Converter \u2014 Mbps, Gbps, KB/s, MB/s",
    metaDesc: "Convert network transfer speeds instantly between bps, Kbps, Mbps, Gbps, and Tbps. Calculate internet speed, fiber optics bandwidth, and download capabilities.",
    h1: "Data Transfer Rate Conversion",
    intro: "Convert between network speed and bandwidth throughput units: bits per second (bps), Kilobits per second (Kbps), Megabits per second (Mbps), Gigabits per second (Gbps), and Terabits per second (Tbps). Understand true connection performance and file download speed.",
    popularPairs: [
      { from: "Mbps", to: "Gbps", desc: "Mbps \u2192 Gbps \u2014 broadband speed to fiber gigabit speed" },
      { from: "Gbps", to: "Mbps", desc: "Gbps \u2192 Mbps \u2014 data center and enterprise uplink bandwidth" },
      { from: "Kbps", to: "Mbps", desc: "Kbps \u2192 Mbps \u2014 audio streaming and low-bandwidth connections" }
    ],
    useCases: ["Internet service provider (ISP) speed testing", "Network router and switch throughput verification", "Live video streaming bitrate configuration", "Data backup bandwidth planning"],
    formula: "1 Gbps = 1,000 Mbps = 1,000,000 Kbps. Note: 8 bits (b) = 1 Byte (B).",
    faq: [
      { q: "What is the difference between Mbps and MB/s?", a: "Mbps is Megabits per second (used by ISPs), while MB/s is MegaBytes per second (used for file sizes). Since 8 bits equal 1 Byte, 100 Mbps equals approximately 12.5 MB/s of actual download speed." },
      { q: "How many Mbps is 1 Gbps?", a: "1 Gigabit per second (Gbps) equals 1,000 Megabits per second (Mbps)." }
    ]
  },
  torque: {
    title: "Torque Converter \u2014 Newton-Meters (N\xB7m) to Foot-Pounds (lb-ft)",
    metaDesc: "Convert torque units instantly between Newton-meters (N\xB7m) and foot-pounds (lb-ft). Accurate tool for automotive mechanics, wrench torque specs, and engine tuning.",
    h1: "Torque Conversion",
    intro: "Convert between metric and imperial rotational torque units: Newton-meters (N\xB7m) and pound-feet / foot-pounds (lb-ft). Crucial for automotive repair, lug nut tightening specs, bicycle maintenance, and engine dyno readouts.",
    popularPairs: [
      { from: "Newton-meter", to: "Foot-pound", desc: "N\xB7m \u2192 lb-ft \u2014 metric automotive specs to US wrench torque" },
      { from: "Foot-pound", to: "Newton-meter", desc: "lb-ft \u2192 N\xB7m \u2014 torque wrench calibration and import vehicle service" }
    ],
    useCases: ["Wheel lug nut torque specifications", "Engine cylinder head and manifold bolt tightening", "Bicycle bottom bracket and pedal servicing", "Industrial machinery shaft calibration"],
    formula: "1 N\xB7m \u2248 0.737562 lb-ft. 1 lb-ft \u2248 1.355818 N\xB7m.",
    faq: [
      { q: "How do I convert Newton-meters to foot-pounds?", a: "Multiply the torque in Newton-meters (N\xB7m) by 0.737562. For example, 100 N\xB7m \xD7 0.737562 = 73.76 lb-ft." },
      { q: "What torque is typical for car wheel lug nuts?", a: "Most passenger cars require lug nuts torqued to between 110 N\xB7m and 140 N\xB7m (approximately 80 to 100 lb-ft)." }
    ]
  },
  density: {
    title: "Density Converter \u2014 kg/m\xB3, g/cm\xB3, lb/ft\xB3 & Material Density",
    metaDesc: "Convert density units online: kilograms per cubic meter (kg/m\xB3), grams per cubic centimeter (g/cm\xB3), and pounds per cubic foot (lb/ft\xB3). Free engineering calculator.",
    h1: "Density Conversion",
    intro: "Convert material density and specific gravity units between metric and imperial standards: kilograms per cubic meter (kg/m\xB3), grams per cubic centimeter (g/cm\xB3), and pounds per cubic foot (lb/ft\xB3). Essential for fluid mechanics, material science, shipping freight classification, and civil engineering.",
    popularPairs: [
      { from: "g/cm\xB3", to: "kg/m\xB3", desc: "g/cm\xB3 \u2192 kg/m\xB3 \u2014 standard lab density to SI bulk density" },
      { from: "kg/m\xB3", to: "lb/ft\xB3", desc: "kg/m\xB3 \u2192 lb/ft\xB3 \u2014 metric structural materials to imperial shipping density" }
    ],
    useCases: ["Material identification and buoyancy calculations", "Concrete, steel, and timber structural design", "Freight packaging dimensional weight density", "Chemistry solution concentration analysis"],
    formula: "1 g/cm\xB3 = 1,000 kg/m\xB3. 1 kg/m\xB3 \u2248 0.062428 lb/ft\xB3. 1 lb/ft\xB3 \u2248 16.0185 kg/m\xB3.",
    faq: [
      { q: "What is the density of pure water?", a: "At 4\xB0C, pure water has a density of exactly 1 g/cm\xB3 or 1,000 kg/m\xB3 (about 62.4 lb/ft\xB3)." },
      { q: "How do I convert g/cm\xB3 to kg/m\xB3?", a: "Multiply the density in g/cm\xB3 by 1,000 to get kg/m\xB3." }
    ]
  },
  cooking: {
    title: "Cooking Converter \u2014 Cups, Tablespoons, Teaspoons & mL",
    metaDesc: "Free online kitchen and cooking converter. Easily convert cups, tablespoons, teaspoons, fluid ounces, milliliters, dashes, and pinches for perfect recipes.",
    h1: "Kitchen & Cooking Conversion",
    intro: "Convert culinary volume measurements between US recipe standards and metric kitchen measures: cups, tablespoons (tbsp), teaspoons (tsp), fluid ounces (fl oz), milliliters (mL), pinches, and dashes. Perfect for baking, doubling dinner recipes, and converting international cookbooks.",
    popularPairs: [
      { from: "Cup", to: "Tablespoon", desc: "cup \u2192 tbsp \u2014 recipe subdivision (1 cup = 16 tbsp)" },
      { from: "Tablespoon", to: "Teaspoon", desc: "tbsp \u2192 tsp \u2014 seasoning and spice adjustments (1 tbsp = 3 tsp)" },
      { from: "Cup", to: "Milliliter", desc: "cup \u2192 mL \u2014 US cups to metric liquid volume (1 cup \u2248 240 mL)" },
      { from: "Fluid Ounce", to: "Milliliter", desc: "fl oz \u2192 mL \u2014 liquid measuring cups (1 fl oz \u2248 29.57 mL)" }
    ],
    useCases: ["Scaling baking and culinary recipes", "Converting US customary recipes to metric grams/milliliters", "Bartending and cocktail liquid measurement", "Dietary portion control and nutrition tracking"],
    formula: "1 US Cup = 16 tablespoons = 48 teaspoons = 240 mL = 8 fl oz. 1 tablespoon = 3 teaspoons = 15 mL.",
    faq: [
      { q: "How many tablespoons are in one cup?", a: "There are exactly 16 tablespoons in 1 US customary cup." },
      { q: "How many teaspoons are in a tablespoon?", a: "There are 3 teaspoons in 1 tablespoon (15 mL)." },
      { q: "How many mL is one cup?", a: "In standard US cooking, 1 cup is considered 240 mL (or 250 mL in the metric cup standard used in Australia and the UK)." }
    ]
  },
  textile: {
    title: "Textile Fabric Converter \u2014 GSM, Thread Count & Yarn Count",
    metaDesc: "Convert fabric weight and textile specifications online: Grams per Square Meter (GSM), Thread Count (TC), and Yarn Count (YC) for bedding, apparel, and canvas.",
    h1: "Textile & Fabric Units Conversion",
    intro: "Convert textile density and quality metrics: Grams per Square Meter (GSM, fabric weight), Thread Count (TC, bedsheet weave density), and Yarn Count (YC). Essential for fashion designers, clothing manufacturers, bedding shoppers, and textile importers.",
    popularPairs: [
      { from: "GSM", to: "Thread Count", desc: "GSM \u2194 TC \u2014 evaluate fabric heaviness vs weave tightness" }
    ],
    useCases: ["T-shirt and hoodie weight selection (e.g. 180 GSM vs 350 GSM)", "Bedding and sheet thread count quality evaluation", "Towel absorbency assessment (400-600 GSM)", "Industrial canvas and denim specification"],
    formula: "GSM = weight in grams / area in square meters. Thread count = warp threads + weft threads per square inch.",
    faq: [
      { q: "What does GSM mean in fabric?", a: 'GSM stands for "Grams per Square Meter" and measures the physical weight and density of fabric. Higher GSM generally means thicker, heavier material (e.g. 400+ GSM fleece vs 150 GSM summer t-shirt).' },
      { q: "What is a good thread count for bed sheets?", a: "For quality cotton bed sheets, a thread count between 300 and 500 is considered ideal for softness, breathability, and durability." }
    ]
  },
  astronomy: {
    title: "Astronomy Converter \u2014 Light Years, AU, Parsecs & Solar Masses",
    metaDesc: "Convert cosmic distances and stellar masses: Astronomical Units (AU), Light Years, Parsecs, Solar Masses, and Earth Masses. Free astronomical calculator.",
    h1: "Astronomical Units Conversion",
    intro: "Convert cosmic scale distances and celestial masses: Astronomical Units (AU, distance from Earth to Sun), Light Years (distance light travels in a Julian year), Parsecs (pc), Solar Mass (mass of our Sun), and Earth Mass. Created for stargazers, astrophysics enthusiasts, and planetary science.",
    popularPairs: [
      { from: "Light Year", to: "AU", desc: "ly \u2192 AU \u2014 stellar distances to solar system scale (1 ly \u2248 63,241 AU)" },
      { from: "Parsec", to: "Light Year", desc: "pc \u2192 ly \u2014 professional astrophysics units (1 pc \u2248 3.26 ly)" },
      { from: "Solar Mass", to: "Earth Mass", desc: "M\u2609 \u2192 M\u2295 \u2014 compare star masses to planet Earth (1 M\u2609 \u2248 333,000 Earths)" }
    ],
    useCases: ["Interstellar mission travel distance estimation", "Exoplanet orbital distance comparisons", "Stellar evolution and black hole mass calculations", "Solar system planetary distance charting"],
    formula: "1 Light Year \u2248 9.461 \xD7 10\xB9\u2075 meters \u2248 63,241.1 AU. 1 Parsec \u2248 3.26156 Light Years \u2248 206,265 AU. 1 Solar Mass \u2248 333,000 Earth Masses.",
    faq: [
      { q: "How far is one Astronomical Unit (AU)?", a: "One Astronomical Unit (AU) is approximately 149.6 million kilometers (92.96 million miles), roughly the mean distance from the Earth to the Sun." },
      { q: "How many light years are in one parsec?", a: "One parsec (pc) equals approximately 3.26156 light years (or 206,265 AU)." },
      { q: "How heavy is the Sun compared to the Earth?", a: "One Solar Mass is equal to approximately 333,000 Earth Masses." }
    ]
  }
};

// src/config/pairEditorial.ts
function cleanSlug(s) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
var PAIR_UNIT_SYNONYMS = {
  // Area
  "square-meter": "m2",
  "square-meters": "m2",
  "square-foot": "ft2",
  "square-feet": "ft2",
  "square-kilometer": "km2",
  "square-kilometers": "km2",
  "square-mile": "mi2",
  "square-miles": "mi2",
  "square-yard": "yd2",
  "square-yards": "yd2",
  "square-inch": "in2",
  "square-inches": "in2",
  "square-millimeter": "mm2",
  "square-millimeters": "mm2",
  "square-centimeter": "cm2",
  "square-centimeters": "cm2",
  "acre": "ac",
  "acres": "ac",
  "hectare": "ha",
  "hectares": "ha",
  // Volume
  "cubic-meter": "m3",
  "cubic-meters": "m3",
  "cubic-foot": "ft3",
  "cubic-feet": "ft3",
  "cubic-inch": "in3",
  "cubic-inches": "in3",
  "fluid-ounce": "floz",
  "fluid-ounces": "floz",
  // Speed
  "speed:km-h": "kmh",
  "speed:kmh": "kmh",
  "speed:m-s": "mps",
  "speed:mps": "mps",
  // Acceleration
  "acceleration:m-s": "mps2",
  "acceleration:g-force": "gforce",
  "acceleration:ft-s": "ftps2",
  // Mass
  "us-ton": "sh tn",
  "short-ton": "sh tn",
  "metric-ton": "t",
  // Power / Energy
  "btu-h": "BTUh",
  "calories": "cal",
  "calorie": "cal",
  "joules": "J",
  "joule": "J",
  // Fuel
  "mpg-us": "mpgUS",
  "mpg-uk": "mpgUK",
  "km-l": "kmL",
  "l-100km": "L100km",
  // Torque
  "newton-meter": "Nm",
  "foot-pound": "lbft",
  // Density
  "g-cm": "gcm3",
  "kg-m": "kgm3",
  "lb-ft": "lbft3",
  // Force
  "force:kn": "kN",
  // Frequency
  "rpm": "rpm",
  // Angle
  "degrees": "deg",
  "degree": "deg",
  "radians": "rad",
  "radian": "rad",
  "gradians": "grad",
  "gradian": "grad",
  "arcminutes": "arcmin",
  "arcminute": "arcmin",
  "mrad": "mrad",
  // Data
  "bits": "bit",
  "bytes": "B",
  // Time
  "seconds": "s",
  "minutes": "min",
  "hours": "hr"
};
function findUnit(cat, raw) {
  const q = raw.trim().toLowerCase();
  const qSpaced = q.replace(/-/g, " ");
  const scopedKey = `${cat.id}:${q}`;
  if (PAIR_UNIT_SYNONYMS[scopedKey]) {
    const direct = cat.un.find((u) => u.id.toLowerCase() === PAIR_UNIT_SYNONYMS[scopedKey].toLowerCase());
    if (direct) return direct;
  }
  if (PAIR_UNIT_SYNONYMS[q]) {
    const direct = cat.un.find((u) => u.id.toLowerCase() === PAIR_UNIT_SYNONYMS[q].toLowerCase());
    if (direct) return direct;
  }
  const singularCandidates = [q, qSpaced];
  if (q.endsWith("ies")) singularCandidates.push(q.slice(0, -3) + "y");
  if (q.endsWith("es")) {
    singularCandidates.push(q.slice(0, -2));
    singularCandidates.push(q.slice(0, -1));
  }
  if (q.endsWith("s")) singularCandidates.push(q.slice(0, -1));
  return cat.un.find((u) => {
    const uid = u.id.toLowerCase();
    const ulb = u.lb.toLowerCase();
    for (const cand of singularCandidates) {
      if (uid === cand || ulb === cand) return true;
      if (u.al?.some((a) => a.toLowerCase() === cand)) return true;
    }
    return false;
  });
}
var CANONICAL_PAIR_SET = /* @__PURE__ */ new Set();
for (const [catId, content] of Object.entries(categoryContent)) {
  if (content?.popularPairs) {
    for (const pair of content.popularPairs) {
      const fSlug = cleanSlug(pair.from);
      const tSlug = cleanSlug(pair.to);
      CANONICAL_PAIR_SET.add(`${catId}:${fSlug}-to-${tSlug}`);
    }
  }
}
var CATEGORY_METROLOGY = {
  length: {
    dimension: "linear distance and spatial extent",
    siBase: "meter (m)",
    systems: "International System of Units (SI) and US Customary / British Imperial units",
    contextNote: "Standardized under the 1959 International Yard and Pound Agreement (1 yard = 0.9144 m; 1 inch = 25.4 mm)."
  },
  mass: {
    dimension: "inertial and gravitational mass (quantity of matter)",
    siBase: "kilogram (kg)",
    systems: "SI metric mass units and avoirdupois imperial/customary units",
    contextNote: "Standardized under BIPM and CGPM metrology definitions (1 avoirdupois pound = 0.45359237 kg)."
  },
  temp: {
    dimension: "thermodynamic temperature and kinetic molecular energy",
    siBase: "kelvin (K)",
    systems: "Celsius (\xB0C), Fahrenheit (\xB0F), Kelvin (K), Rankine (\xB0R), and R\xE9aumur (\xB0Re)",
    contextNote: "The kelvin and degree Celsius share the same unit interval size under SI definitions, with 0 \xB0C corresponding to 273.15 K."
  },
  area: {
    dimension: "two-dimensional surface extent ($L^2$)",
    siBase: "square meter (m\xB2)",
    systems: "Metric area units and imperial/customary units (acres, square feet)",
    contextNote: "Conversions scale quadratically with the underlying linear dimension (1 m\xB2 = 10.7639104 ft\xB2)."
  },
  volume: {
    dimension: "three-dimensional volumetric capacity ($L^3$)",
    siBase: "cubic meter (m\xB3) and liter (L)",
    systems: "Metric liquid volume and US Customary / British Imperial liquid measures",
    contextNote: "Standardized according to NIST Handbook 44 and OIML liquid capacity regulations."
  },
  speed: {
    dimension: "rate of change of position with respect to time ($L/T$)",
    siBase: "meters per second (m/s)",
    systems: "Metric (km/h), imperial (mph), and nautical (knots)",
    contextNote: "Standardized internationally by ICAO (aviation), IMO (maritime), and SI transport metrology."
  },
  time: {
    dimension: "chronological duration and sequential progression ($T$)",
    siBase: "second (s)",
    systems: "SI atomic second and sexagesimal astronomical calendar units",
    contextNote: "Defined via the cesium-133 ground-state hyperfine transition frequency under the BIPM SI Brochure."
  },
  energy: {
    dimension: "capacity to perform mechanical work or transfer heat ($M \\cdot L^2 / T^2$)",
    siBase: "joule (J)",
    systems: "SI joules, nutritional/thermal calories, electrical kilowatt-hours, and British Thermal Units (BTU)",
    contextNote: "Standardized under ISO 80000-5 and International Steam Table thermochemical definitions."
  },
  pressure: {
    dimension: "force exerted perpendicularly per unit surface area ($F/A$)",
    siBase: "pascal (Pa = N/m\xB2)",
    systems: "SI pascals, metric bar, engineering psi, and standard atmospheres (atm)",
    contextNote: "Standardized under ISO 80000-4 with standard atmospheric pressure defined as exactly 101,325 Pa."
  },
  power: {
    dimension: "rate of energy transfer or work performed per unit time ($E/T$)",
    siBase: "watt (W = J/s)",
    systems: "SI watts/kilowatts and imperial/mechanical horsepower",
    contextNote: "Mechanical horsepower is defined as 550 ft\xB7lbf/s (approximately 745.69987 W)."
  },
  force: {
    dimension: "rate of change of momentum according to Newton's second law ($M \\cdot L / T^2$)",
    siBase: "newton (N = kg\xB7m/s\xB2)",
    systems: "SI newtons and gravitational pound-force (lbf)",
    contextNote: "Pound-force relies on standard Earth gravitational acceleration $g_0 = 9.80665\\text{ m/s}^2$ ($1\\text{ lbf} \\approx 4.448222\\text{ N}$)."
  },
  data: {
    dimension: "digital information storage capacity",
    siBase: "byte (B) and bit",
    systems: "Decimal metric multiples (SI 1000-byte) and binary multiples (IEC 1024-byte)",
    contextNote: "Standardized under IEC 80000-13 and IEEE metrology conventions."
  },
  fuel: {
    dimension: "fuel efficiency (distance per volume) and fuel consumption (volume per distance)",
    siBase: "kilometers per liter (km/L) and liters per 100 kilometers (L/100km)",
    systems: "Metric consumption (L/100km), metric efficiency (km/L), and US/UK Miles Per Gallon (MPG)",
    contextNote: "Efficiency and consumption exhibit an inverse mathematical relationship ($L/100km = 235.215 / MPG_{US}$)."
  },
  angle: {
    dimension: "planar angular separation and circular rotation",
    siBase: "radian (rad)",
    systems: "Sexagesimal degrees (360\xB0), radians ($2\\pi$), gradians (400 gon), and arcminutes",
    contextNote: "Standardized under ISO 80000-3 with $\\pi$ radians spanning a 180-degree half-circle."
  },
  frequency: {
    dimension: "rate of periodic recurrence or cycles per unit time ($1/T$)",
    siBase: "hertz (Hz = 1/s)",
    systems: "SI hertz multiples and rotational revolutions per minute (RPM)",
    contextNote: "Rotational RPM relates directly to Hz via a factor of 60 ($1\\text{ Hz} = 60\\text{ RPM}$)."
  },
  acceleration: {
    dimension: "rate of change of velocity with respect to time ($L/T^2$)",
    siBase: "meters per second squared (m/s\xB2)",
    systems: "SI m/s\xB2, imperial ft/s\xB2, and standard Earth gravitational acceleration ($g$)",
    contextNote: "Standard gravitational acceleration is fixed internationally at $1\\text{ }g = 9.80665\\text{ m/s}^2$."
  },
  electricity: {
    dimension: "electromagnetic potential, electric current, resistance, and capacitance",
    siBase: "ampere (A), volt (V), ohm (\u03A9), farad (F)",
    systems: "SI electromagnetic definitions",
    contextNote: "Grounded in fundamental physical constants including the elementary charge $e = 1.602176634 \\times 10^{-19}\\text{ C}$."
  },
  magnetism: {
    dimension: "magnetic flux density and magnetic field strength",
    siBase: "tesla (T)",
    systems: "SI tesla and CGS electromagnetic gauss ($1\\text{ T} = 10,000\\text{ G}$)",
    contextNote: "Governed by BIPM SI specifications and electromagnetic induction laws."
  },
  datatransfer: {
    dimension: "digital data transmission throughput and bandwidth ($bits/T$)",
    siBase: "bits per second (bps)",
    systems: "Telecommunication decimal transfer rates (kbps, Mbps, Gbps)",
    contextNote: "Standardized under ITU-T and IEEE 802 telecommunications protocol specifications."
  },
  torque: {
    dimension: "rotational moment and torsional force ($F \\cdot L$)",
    siBase: "newton-meter (N\xB7m)",
    systems: "SI newton-meters and imperial foot-pounds (lbf\xB7ft)",
    contextNote: "Standardized under ISO 80000-4 mechanical engineering metrology ($1\\text{ N}\\cdot\\text{m} \\approx 0.737562\\text{ lbf}\\cdot\\text{ft}$)."
  },
  density: {
    dimension: "volumetric mass density ($M / L^3$)",
    siBase: "kilograms per cubic meter (kg/m\xB3)",
    systems: "SI kg/m\xB3, metric g/cm\xB3, and imperial pounds per cubic foot (lb/ft\xB3)",
    contextNote: "Water at 4\xB0C exhibits an approximate density of $1\\text{ g/cm}^3 = 1000\\text{ kg/m}^3 = 62.42796\\text{ lb/ft}^3$."
  },
  cooking: {
    dimension: "culinary recipe volumetric capacity",
    siBase: "milliliter (mL) and culinary units (cups, tablespoons, teaspoons)",
    systems: "US Legal Cup (240 mL), US Customary Cup (~236.588 mL), and metric liquid volumes",
    contextNote: "Standardized according to US FDA 21 CFR \xA7 101.9 nutritional and culinary measuring guidelines."
  },
  textile: {
    dimension: "fabric surface density and weave density",
    siBase: "grams per square meter (GSM)",
    systems: "Metric GSM and imperial thread count (threads per square inch)",
    contextNote: "Evaluated under ASTM D3776 textile mass specifications and international fabric trade standards."
  },
  astronomy: {
    dimension: "astronomical interstellar distance and celestial stellar mass",
    siBase: "astronomical unit (au), light-year (ly), parsec (pc), solar mass ($M_\\odot$)",
    systems: "International Astronomical Union (IAU) astronomical constants",
    contextNote: "Standardized under IAU Resolution B2 (2012) fixing $1\\text{ au} = 149,597,870,700\\text{ m}$."
  }
};
var PAIR_USE_CASES = {
  "length:meter-to-feet": [
    { domain: "Architectural Framing & Blueprints", context: "Translating European and international metric architectural layouts into feet and inches for US residential framing and construction contractors." },
    { domain: "Athletic Track & Field Reporting", context: "Converting international metric track and field jump distances and race heights for domestic sports broadcasts and imperial record books." },
    { domain: "Mountain Hiking & Trail Elevations", context: "Comparing trail elevation gains, contour lines, and summit heights between international metric topo maps and US quadrangle maps." }
  ],
  "length:kilometer-to-miles": [
    { domain: "Cross-Border Road Travel & Navigation", context: "Planning driving times, highway speed compliance, and fuel intervals when crossing between metric regions (Canada/Europe) and the United States." },
    { domain: "Long-Distance Athletic Endurance Training", context: "Converting 5K, 10K, half-marathon, and marathon race splits and training logs between metric pacing and miles." },
    { domain: "Automotive Import & Titling Verification", context: "Translating odometer mileage readings on imported Japanese and European vehicles for domestic registration and valuation." }
  ],
  "length:inches-to-centimeter": [
    { domain: "Consumer Electronics & Display Sizing", context: "Translating TV, computer monitor, and smartphone screen diagonal specifications into metric dimensions for international buyers." },
    { domain: "Apparel Tailoring & Garment Measurements", context: "Converting body measurements, waist sizing, and inseams between US customary apparel guides and metric sizing tables." },
    { domain: "Precision Woodworking & CNC Machining", context: "Reconciling imperial bolt sizes and drill bit diameters with metric workshop cutting plans and stock materials." }
  ],
  "length:feet-to-meters": [
    { domain: "Civil Engineering Tenders & International Bids", context: "Converting North American structural drawings, span lengths, and building heights into metric specifications for international tenders." },
    { domain: "Maritime Navigation & Hydrographic Surveys", context: "Converting depth soundings and bridge clearance heights from customary feet into international hydrographic metric charts." },
    { domain: "Real Estate Appraisals & Commercial Floor Plans", context: "Translating square footage and ceiling height measurements into metric meters for multinational real estate portfolios." }
  ],
  "length:centimeter-to-inches": [
    { domain: "International Freight & Packaging Logistics", context: "Measuring carton dimensions in centimeters to calculate dimensional weight and courier shipping thresholds in inches." },
    { domain: "Graphic Arts & Print Production", context: "Translating metric poster margins, paper trim sizes, and binding specifications into imperial desktop publishing layouts." },
    { domain: "Office Ergonomics & Desk Setup", context: "Adjusting standing desk heights, monitor arm reaches, and chair clearances between metric product manuals and customary measurements." }
  ],
  "mass:kilogram-to-pounds": [
    { domain: "Commercial Aviation Luggage & Air Cargo", context: "Calculating passenger checked baggage allowances where international ticket limits are posted in kilograms and domestic scales read in pounds." },
    { domain: "Competitive Powerlifting & Olympic Weightlifting", context: "Converting international competition barbell loadings calibrated in kilograms into customary pounds for training logs." },
    { domain: "Agricultural Commodity Export Logistics", context: "Translating wholesale bulk produce weights and livestock measurements between international metric kilograms and US customary pounds." }
  ],
  "mass:pounds-to-kilogram": [
    { domain: "Personal Fitness & Bodyweight Logging", context: "Converting bodyweight logs between imperial pounds and metric kilograms for fitness applications and gym tracking." },
    { domain: "International Customs Declarations & Freight", context: "Preparing commercial export invoices requiring metric kilogram tare and net weight disclosures from US shipping manifests." },
    { domain: "Travel Luggage & Suitcase Weighing", context: "Checking personal luggage weight on household bathroom scales in pounds before traveling on airlines with kilogram baggage limits." }
  ],
  "mass:ounces-to-grams": [
    { domain: "Artisan Baking & Pastry Formulation", context: "Converting delicate baking recipes requiring exact gram baker's percentages from traditional US volume and ounce recipes." },
    { domain: "Precious Metals & Laboratory Assays", context: "Converting gold, silver, and precious alloy weights from avoirdupois and troy ounces into metric grams for chemical assaying." },
    { domain: "Postal Dispatch & Parcel Postage", context: "Weighing lightweight international mail and envelopes to ensure compliance with postal bracket thresholds." }
  ],
  "mass:stone-to-kilogram": [
    { domain: "UK & Commonwealth Personal Fitness Tracking", context: "Converting traditional British stone and pound scale readouts into metric kilograms for modern fitness apps." },
    { domain: "Combat Sports & Martial Arts Weigh-Ins", context: "Reconciling British boxing, MMA, and wrestling weight divisions with international metric sanctioning standards." },
    { domain: "Historical Genealogy & Military Archives", context: "Interpreting historic Commonwealth enlistment, medical, and immigration records recorded in stone." }
  ],
  "mass:metric-ton-to-us-ton": [
    { domain: "Intermodal Freight & Rail Cargo Logistics", context: "Reconciling international ocean container shipping manifests in metric tonnes with North American railroad short-ton capacity limits." },
    { domain: "Mining Extraction & Bulk Mineral Processing", context: "Calculating raw ore throughput, smelting yields, and stockpile inventories across multinational extraction ventures." },
    { domain: "Civil Infrastructure & Structural Steel Fabrication", context: "Ordering structural steel beams and rebar tonnage from international mills for domestic civil projects." }
  ],
  "temp:celsius-to-fahrenheit": [
    { domain: "International Travel & Weather Forecasts", context: "Translating overseas ambient weather forecasts into familiar Fahrenheit comfort benchmarks for American travelers." },
    { domain: "Culinary Baking & Kitchen Thermostats", context: "Setting domestic US oven thermostats when preparing European and international baking recipes specified in Celsius." },
    { domain: "Building Environmental HVAC Systems", context: "Calibrating dual-display thermostat controllers, chillers, and heat pump cooling thresholds in commercial buildings." }
  ],
  "temp:fahrenheit-to-celsius": [
    { domain: "Scientific Laboratory Environmental Monitoring", context: "Converting incubator, water bath, and ambient laboratory temperature logs from US equipment into standard SI Celsius." },
    { domain: "International Cuisine & Expat Kitchens", context: "Converting American cookbook baking temperatures for home cooks utilizing Celsius-calibrated European ovens." },
    { domain: "Industrial Machinery Import & Maintenance", context: "Translating US machinery temperature safety cutoffs and operating ranges into metric SCADA process systems." }
  ],
  "temp:celsius-to-kelvin": [
    { domain: "Thermodynamics & Physical Chemistry Calculations", context: "Inputting laboratory temperatures into thermodynamic equations including the Ideal Gas Law ($PV = nRT$) and entropy calculations." },
    { domain: "Cryogenic Science & Laboratory Physics", context: "Comparing liquid nitrogen (-196 \xB0C = 77.15 K) and dry ice temperatures between Celsius and thermodynamic Kelvin scales." },
    { domain: "Meteorology & Planetary Atmospheric Physics", context: "Calculating atmospheric lapse rates, radiative heat balance, and blackbody emission spectra." }
  ],
  "temp:kelvin-to-celsius": [
    { domain: "Observational Astronomy & Stellar Physics", context: "Converting effective stellar surface temperatures and cosmic background radiation parameters into intuitive laboratory Celsius." },
    { domain: "Materials Science & Superconductivity Research", context: "Translating critical transition temperatures ($T_c$) of advanced ceramic superconductors into working Celsius scales." },
    { domain: "Semiconductor Fabrication & Thermal Annealing", context: "Converting furnace process specifications between thermodynamic modeling and manufacturing equipment displays." }
  ],
  "temp:fahrenheit-to-kelvin": [
    { domain: "Thermodynamics Coursework & Physics Study", context: "Converting ambient temperature benchmarks in Fahrenheit to Kelvin for undergraduate thermodynamic problem sets." },
    { domain: "Deep-Freeze Food Storage & Industrial Freezers", context: "Relating sub-zero commercial freezer ratings in Fahrenheit to thermodynamic Kelvin temperatures." },
    { domain: "High-Temperature Industrial Combustion", context: "Modeling gas turbine and industrial boiler flame dynamics between engineering CAD software and thermodynamic physics." }
  ],
  "area:square-meters-to-square-feet": [
    { domain: "Commercial Real Estate Leasing & Appraisal", context: "Converting international office floor plates and lease contracts into North American rentable square feet." },
    { domain: "Flooring Installation & Material Estimation", context: "Estimating carpet, hardwood, and ceramic tile materials from architectural floor plans drawn in metric meters." },
    { domain: "Interior Space Planning & Hospitality Design", context: "Evaluating furniture layouts, guest room scale, and conference hall occupant capacities from global drawings." }
  ],
  "area:acres-to-hectares": [
    { domain: "Agricultural Farmland Sales & Agribusiness", context: "Translating US farm and ranch acreage for international agricultural trade, crop yield benchmarking, and EU filings." },
    { domain: "Forestry & Environmental Conservation", context: "Mapping national park boundaries, wildfire burn areas, and reforestation projects onto international GIS layers." },
    { domain: "Utility-Scale Solar & Wind Development", context: "Evaluating land acquisition acreage requirements for multinational renewable energy projects." }
  ],
  "area:square-feet-to-square-meters": [
    { domain: "Global Architectural Submissions & Tenders", context: "Preparing North American architectural designs and commercial proposals for international zoning and municipal approvals." },
    { domain: "Corporate Carbon & Energy Auditing", context: "Standardizing facility floor area for global greenhouse gas emissions reporting and energy efficiency certifications." },
    { domain: "International Hotel Development & Franchising", context: "Standardizing guest suite dimensions and public amenity areas across global hospitality brands." }
  ],
  "area:hectares-to-acres": [
    { domain: "International Land Investment & Timberland", context: "Evaluating overseas agricultural land parcels, vineyards, and timberland investments for North American buyers." },
    { domain: "Geospatial Mapping & Cadastral Surveys", context: "Converting satellite property boundaries and global municipal survey data into customary deeds." },
    { domain: "Conservation Biology & Wildlife Habitats", context: "Comparing multinational ecological preserves and wildlife corridors with domestic public land benchmarks." }
  ],
  "area:square-kilometers-to-square-miles": [
    { domain: "Regional Demographics & Density Studies", context: "Comparing municipal land areas and metropolitan population densities between international and US census records." },
    { domain: "Geophysical & Natural Disaster Impact Analysis", context: "Evaluating storm surge zones, seismic rupture areas, and wildfire perimeters on regional maps." },
    { domain: "Regional Transit & Urban Planning", context: "Evaluating urban growth boundaries, transit catchment corridors, and municipal utility service areas." }
  ],
  "volume:liters-to-gallons": [
    { domain: "Automotive Fuel Efficiency & Cross-Border Driving", context: "Calculating fuel purchase volumes and fuel range when driving between metric gas stations and US customary pumps." },
    { domain: "Beverage Bottling & Commercial Distribution", context: "Converting wine, spirits, and dairy bulk processing volumes into US retail gallon packaging formats." },
    { domain: "Aquaculture & Commercial Water Treatment", context: "Calculating chemical water treatment dosages and filtration pump sizing based on reservoir liter capacities." }
  ],
  "volume:gallons-to-liters": [
    { domain: "Vehicle Importation & Registration Compliance", context: "Calculating engine coolant, transmission fluid, and fuel tank capacities for vehicles imported into metric countries." },
    { domain: "Marine Bunkering & Commercial Vessels", context: "Reconciling domestic US fuel delivery receipts in gallons with vessel fuel sounding tables logged in metric liters." },
    { domain: "Industrial Chemical Manufacturing & Mixing", context: "Converting batch manufacturing recipes specified in US gallons for European automated chemical plant reactors." }
  ],
  "volume:milliliters-to-fluid-ounces": [
    { domain: "Culinary Mixology & Specialty Beverage Recipes", context: "Converting precise European cocktail and culinary syrups into US customary bar measurements." },
    { domain: "Cosmetics & Personal Care Packaging", context: "Packaging liquid skincare serums, perfumes, and lotions for dual-market international compliance." },
    { domain: "Travel Liquid Sizing & Airport Carry-On", context: "Checking travel-size shampoo, sunscreen, and cosmetic bottles in milliliters against airline 3.4 fluid ounce limits." }
  ],
  "volume:cubic-meters-to-cubic-feet": [
    { domain: "Ocean Container Freight & Stowage Planning", context: "Calculating cargo volume (CBM) to optimize 20-foot and 40-foot ocean container packing and air cargo charges." },
    { domain: "HVAC Ventilation & Cleanroom Engineering", context: "Converting airflow delivery rates and room air exchange volumes between metric designs and imperial blowers." },
    { domain: "Bulk Aggregate & Concrete Placement", context: "Ordering sand, gravel, and ready-mix concrete for international civil construction projects." }
  ],
  "volume:quarts-to-liters": [
    { domain: "Commercial Foodservice & Catering Operations", context: "Scaling large-batch soup, sauce, and dressing recipes from US kitchen quarts to commercial metric kettles." },
    { domain: "Automotive Engine Oil & Lubricant Maintenance", context: "Purchasing engine oil containers in metric markets for domestic vehicles specifying multi-quart crankcases." },
    { domain: "Educational Chemistry & Biological Science Labs", context: "Measuring reagent solutions and buffer preparations in educational laboratory settings." }
  ],
  "speed:km-h-to-mph": [
    { domain: "Cross-Border Highway Navigation & Speed Limits", context: "Interpreting highway speed limit signs and vehicle digital head-up displays when driving between Canada, Mexico, and the US." },
    { domain: "Sports Ballistics & Radar Speed Tracking", context: "Translating international tennis serve speeds and soccer ball velocities into miles per hour for North American sports media." },
    { domain: "Accident Reconstruction & Forensic Telematics", context: "Converting electronic control module (ECM) crash telemetry from metric km/h into statutory speed limits." }
  ],
  "speed:mph-to-km-h": [
    { domain: "International Driving & Rental Car Operation", context: "Navigating European, Australian, and worldwide motorways with speedometers calibrated in statute miles per hour." },
    { domain: "Commercial Aviation Ground Speed Analysis", context: "Translating low-altitude radar ground speed figures into metric meteorological wind reports." },
    { domain: "Automotive Performance Testing & Benchmarking", context: "Comparing North American 0-60 mph vehicle acceleration benchmarks with international 0-100 km/h testing." }
  ],
  "speed:knots-to-mph": [
    { domain: "Maritime Navigation & Coastal Boating", context: "Translating nautical chart cruise speeds and tidal current velocities into statute land miles for recreational boaters." },
    { domain: "Recreational Boating & Watersports", context: "Translating marine GPS speedometer readings in nautical knots to familiar statute miles per hour for wakeboarding and lake boating." },
    { domain: "Marine Weather Advisories & Storm Tracking", context: "Interpreting hurricane wind speed advisories and gale warnings posted in nautical knots for onshore civil authorities." }
  ],
  "speed:m-s-to-km-h": [
    { domain: "Meteorological Anemometer & Wind Reporting", context: "Converting raw weather station anemometer readings in meters per second into public broadcast storm speed figures." },
    { domain: "Ballistics & Projectile Aerodynamics", context: "Analyzing bullet muzzle velocities, aerodynamic drag coefficients, and flight times in kinetic ballistic software." },
    { domain: "Athletic Sprint Biomechanics", context: "Translating Olympic 100m sprint velocity meters per second into vehicle-equivalent kilometer per hour speeds." }
  ],
  "speed:mach-to-km-h": [
    { domain: "Aviation Education & Acoustics Demonstration", context: "Explaining the speed of sound at sea level (Mach 1 \u2248 1,225 km/h) for science journalism and aviation enthusiasm." },
    { domain: "Astronomy & High-Altitude Science Articles", context: "Communicating high-speed atmospheric phenomena and meteor re-entry velocities in accessible km/h figures." },
    { domain: "Aerodynamics Coursework & Shockwave Physics", context: "Introducing supersonic fluid dynamics and shockwave phenomena in introductory engineering physics." }
  ],
  "time:hours-to-minutes": [
    { domain: "Professional Consulting & Project Billing", context: "Converting fractional consultant hours and time tracking records into granular billing and payroll minutes." },
    { domain: "Transit & Flight Connection Scheduling", context: "Calculating flight layover durations, train connection windows, and total itinerary travel times." },
    { domain: "Broadcast Media & Audio/Video Post-Production", context: "Timing television commercial blocks, podcast episode runtimes, and digital video timelines." }
  ],
  "time:days-to-hours": [
    { domain: "Intermodal Freight & Supply Chain Transit", context: "Calculating shipment transit times, port demurrage windows, and express freight delivery commitments." },
    { domain: "Warranty Windows & Return Periods", context: "Calculating consumer return deadlines and service trial guarantee windows from days to remaining hours." },
    { domain: "Construction Project Management & Milestones", context: "Breaking down multi-day construction phases into specific labor shift and equipment rental hours." }
  ],
  "time:minutes-to-seconds": [
    { domain: "Athletic Interval Training & Sprint Splits", context: "Measuring high-intensity interval training (HIIT) durations and competition track split times." },
    { domain: "Telecommunications & Cloud Function Billing", context: "Calculating cloud server execution timeouts and serverless compute execution billing intervals." },
    { domain: "Laboratory Chemical Assay Incubation", context: "Timing precise biochemical enzymatic reactions, centrifuge runs, and diagnostic test incubation periods." }
  ],
  "time:weeks-to-days": [
    { domain: "Obstetric & Gestational Milestones", context: "Tracking pregnancy progression and fetal development stages by exact calendar days from gestational weeks." },
    { domain: "Contractor Sprint Scheduling & Agile Planning", context: "Breaking down multi-week software development sprints into daily standup task commitments." },
    { domain: "Academic Terms & Instructional Schedules", context: "Calculating instructional classroom days from institutional semester calendars." }
  ],
  "time:years-to-days": [
    { domain: "Financial Debt Securities & Interest Accrual", context: "Applying exact day-count conventions (Actual/365, Actual/360) for municipal bond and mortgage interest accrual." },
    { domain: "Astronomical Orbital Period Modeling", context: "Calculating planetary and satellite orbital periods, accounting for leap year calendar shifts." },
    { domain: "Industrial Equipment Depreciation & Warranties", context: "Calculating warranty expiration dates and straight-line capital equipment depreciation schedules." }
  ],
  "energy:joules-to-calories": [
    { domain: "Nutritional Science & Dietary Labeling", context: "Translating international food packaging energy values in kilojoules into consumer nutritional calories." },
    { domain: "Exercise Physiology & Ergometer Testing", context: "Converting mechanical work recorded by cycle ergometers in joules into metabolic calories expended." },
    { domain: "Thermodynamics & Mechanical Heat Equivalence", context: "Demonstrating the mechanical equivalent of heat in laboratory physics and chemistry education." }
  ],
  "energy:kwh-to-btu": [
    { domain: "Building HVAC Efficiency & Energy Audits", context: "Comparing electric heat pump energy consumption with natural gas furnace heating capacity." },
    { domain: "Utility Bill Analysis & Energy Modeling", context: "Reconciling electric meter kilowatt-hour consumption with building thermal load calculations." },
    { domain: "Industrial Boiler & Chiller Sizing", context: "Determining total British Thermal Unit heating requirements from electrical power inputs." }
  ],
  "energy:calories-to-joules": [
    { domain: "Bomb Calorimetry & Combustion Chemistry", context: "Converting chemical combustion heat measured in calories into standard SI thermodynamic joules." },
    { domain: "Sports Nutrition & Metabolic Rate Modeling", context: "Translating basal metabolic rate dietary intake into SI units for scientific publication." },
    { domain: "Ecosystem Energetics & Biomass Energy", context: "Quantifying solar energy capture and food web trophic energy transfers in ecological studies." }
  ],
  "energy:ev-to-joules": [
    { domain: "Quantum Mechanics & Particle Physics", context: "Converting subatomic particle kinetic energies and accelerator beam energies into SI joules." },
    { domain: "Semiconductor Bandgap & Solar Photovoltaics", context: "Analyzing semiconductor bandgap absorption thresholds (e.g. 1.1 eV for silicon) in joules." },
    { domain: "Spectroscopy & Molecular Ionization", context: "Calculating molecular bond dissociation energies and photon emission wavelengths." }
  ],
  "energy:btu-to-kwh": [
    { domain: "Building Electrification & Heat Pump Transitions", context: "Calculating electrical power required to replace legacy heating oil and natural gas heating systems." },
    { domain: "Commercial Refrigeration & Food Storage", context: "Sizing electrical substation supply capacity for cold storage warehouse refrigeration plants." },
    { domain: "District Steam Energy Accounting", context: "Billing municipal steam heating customers by converting thermal steam heat into kilowatt-hours." }
  ],
  "pressure:psi-to-bar": [
    { domain: "Automotive Tire Pressure Maintenance", context: "Converting vehicle tire specifications in US psi to European bar inflation gauges." },
    { domain: "Scuba Diving Cylinder Pressure Inspection", context: "Interpreting breathing gas cylinder pressures on international diving trips with bar-calibrated gauges." },
    { domain: "Industrial Pneumatics & Hydraulic Machinery", context: "Adjusting system pressure relief valves and compressor regulators on European industrial equipment." }
  ],
  "pressure:bar-to-psi": [
    { domain: "Imported Machinery Calibration & Workshop Air", context: "Configuring European workshop air compressors and hydraulic presses for North American operators." },
    { domain: "Motorsport & Track Day Tire Pressure Tuning", context: "Converting tire manufacturer recommended track hot pressures from bar into digital US psi gauges." },
    { domain: "Industrial Gas Cylinder Manifold Regulation", context: "Regulating specialty gas delivery manifolds calibrated in metric bar for domestic factory use." }
  ],
  "pressure:atm-to-psi": [
    { domain: "Atmospheric Physics & Weather Science", context: "Relating standard sea-level atmospheric pressure (1 atm) to engineering pressure in psi." },
    { domain: "Recreational Scuba Diving Theory", context: "Calculating theoretical hydrostatic water pressures in atmospheres and converting to psi for dive table study." },
    { domain: "Meteorology & Barometer Comparisons", context: "Comparing standard sea-level atmospheric pressure (1 atm) to domestic weather station readings in psi." }
  ],
  "pressure:pascals-to-psi": [
    { domain: "HVAC Cleanroom Differential Pressure Monitoring", context: "Converting sensitive micro-manometer cleanroom air pressure readings from pascals to psi." },
    { domain: "Structural Wind Engineering & Building Envelopes", context: "Translating wind tunnel surface pressure distributions into building envelope structural design loads." },
    { domain: "Acoustic Sound Pressure & Loudspeaker Testing", context: "Evaluating acoustic pressure wave amplitudes in loudspeaker development and soundproofing audits." }
  ],
  "pressure:mmhg-to-atm": [
    { domain: "Barometric Science & Historical Metrology", context: "Relating traditional mercury column heights (760 mmHg) to standard atmospheric pressure (1 atm)." },
    { domain: "Laboratory Vacuum Distillation", context: "Monitoring low-pressure chemical distillation boiling points on mercury manometers." },
    { domain: "Pharmaceutical Freeze-Drying & Lyophilization", context: "Controlling chamber vacuum sublimation pressures during drug freeze-drying cycles." }
  ],
  "power:horsepower-to-kilowatts": [
    { domain: "Automotive Engine Ratings & EV Comparisons", context: "Converting traditional internal combustion horsepower into kilowatts for electric vehicle comparisons and EU taxation." },
    { domain: "Industrial Electric Motor Specification", context: "Replacing imperial factory motors and pump drives with metric three-phase industrial motors." },
    { domain: "Marine Propulsion & Yacht Sizing", context: "Standardizing inboard diesel engine power ratings across North American and European shipbuilders." }
  ],
  "power:kilowatts-to-horsepower": [
    { domain: "Electric Vehicle Consumer Marketing", context: "Translating modern electric vehicle kilowatt drivetrain ratings into familiar automotive horsepower." },
    { domain: "Agricultural Tractor & Machinery Evaluation", context: "Comparing power take-off (PTO) ratings between European tractors and North American farm equipment." },
    { domain: "Emergency Standby Generator Installation", context: "Sizing commercial emergency diesel generators to drive industrial pump and motor loads." }
  ],
  "power:watts-to-btu-h": [
    { domain: "Data Center Cooling & Server Rack Thermal Loads", context: "Calculating air conditioning cooling requirements (BTU/h) from server equipment electrical wattage." },
    { domain: "Industrial Electrical Enclosure Thermal Design", context: "Sizing panel air conditioners and exhaust fans to dissipate heat generated by variable frequency drives." },
    { domain: "Residential Architectural Cooling Calculations", context: "Modeling interior thermal heat gain from consumer electronics and lighting fixtures." }
  ],
  "power:mw-to-kw": [
    { domain: "Utility-Scale Renewable Power Generation", context: "Reporting solar farm, wind turbine, and hydroelectric facility output to distribution grid operators." },
    { domain: "High-Voltage Substation Transformer Capacity", context: "Monitoring transmission substation transformer loading against regional municipal power demands." },
    { domain: "Industrial Plant Peak Demand Management", context: "Tracking heavy manufacturing electrical consumption to avoid peak-demand utility surcharges." }
  ],
  "power:horsepower-to-watts": [
    { domain: "Small Engine & Consumer Appliance Engineering", context: "Converting lawnmower, snowblower, and shop vac power ratings into electrical wattage equivalents." },
    { domain: "Exercise Ergometer & Human Power Testing", context: "Measuring athletic sprint power output on cycling ergometers relative to fractional mechanical horsepower." },
    { domain: "Fluid Pump & Air Compressor Calculations", context: "Determining electrical motor input wattage needed to deliver fluid mechanical horsepower." }
  ],
  "force:newtons-to-pound-force": [
    { domain: "Materials Testing & Tensile Strength Audits", context: "Converting universal testing machine load cell measurements from newtons into imperial engineering reports." },
    { domain: "Structural Anchor & Fastener Engineering", context: "Verifying concrete anchor pull-out ratings and shear resistance against building code specifications." },
    { domain: "Fitness Cable Machine Resistance", context: "Comparing selectorized weight stack resistance between international gym machines labeled in newtons and US customary pounds." }
  ],
  "force:pound-force-to-newtons": [
    { domain: "Finite Element Analysis (FEA) Structural Simulations", context: "Inputting mechanical load vectors into CAD engineering simulation software standardized on SI units." },
    { domain: "Automotive Crash Safety & Restraint Systems", context: "Converting seatbelt pretensioner tension and barrier impact loads into international safety metrics." },
    { domain: "Robotics Joint Torque & Actuator Sizing", context: "Selecting robotic arm linear actuators specified in newtons to satisfy US design payload requirements." }
  ],
  "force:kn-to-lbf": [
    { domain: "Civil Structural Engineering & Heavy Hoisting", context: "Converting crane lifting capacities, bridge bearing loads, and foundation pile ratings to imperial units." },
    { domain: "Rigging Hardware & Cable Tension Verification", context: "Calculating wire rope, synthetic sling, and shackle working load limits on industrial construction sites." },
    { domain: "Rock Climbing Gear Ratings", context: "Translating carabiner and harness breaking strength ratings stamped in kilonewtons (kN) to familiar pounds of force." }
  ],
  "force:dynes-to-newtons": [
    { domain: "Surface Tension & Colloid Chemistry", context: "Converting interfacial surface tension measurements of liquid coatings and emulsions into SI newtons." },
    { domain: "Micro-Electro-Mechanical Systems (MEMS)", context: "Calculating micro-scale electrostatic and magnetic actuation forces in silicon MEMS sensors." },
    { domain: "Geological Tectonic Fault Slip Mechanics", context: "Analyzing micro-frictional stresses and crack propagation forces along seismic rupture surfaces." }
  ],
  "force:kgf-to-n": [
    { domain: "Legacy European & Asian Machinery Operation", context: "Translating technical load ratings from vintage presses and Japanese machine tools to modern newtons." },
    { domain: "Ergonomic Workplace Push/Pull Evaluations", context: "Measuring manual material handling forces on industrial carts to ensure worker physical safety." },
    { domain: "Mechanical Spring Calibration & Testing", context: "Calibrating mechanical compression and extension springs against legacy kilogram-force specifications." }
  ],
  "data:mb-to-gb": [
    { domain: "Cellular Mobile Data Management", context: "Tracking monthly data plan consumption, application updates, and streaming video usage against gigabyte caps." },
    { domain: "Computer System RAM Allocation", context: "Allocating memory to virtual machines, Docker containers, and database buffer pools." },
    { domain: "Cloud Storage & Photo Archival Planning", context: "Estimating cloud backup storage capacity required for high-resolution photo libraries." }
  ],
  "data:gb-to-mb": [
    { domain: "Software Installation & Disk Space Auditing", context: "Verifying available local disk space prior to installing major software applications and updates." },
    { domain: "Email & Online File Upload Portals", context: "Ensuring compressed file attachments meet maximum file size upload constraints." },
    { domain: "Database Backup & SQL Dump Management", context: "Estimating disk transfer time and storage required for relational database archive dumps." }
  ],
  "data:gb-to-tb": [
    { domain: "Storage Hardware & SSD Drive Sizing", context: "Selecting external hard drives, NAS network storage systems, and enterprise server storage arrays." },
    { domain: "Enterprise Cloud Backup & Archival Budgets", context: "Calculating monthly recurring storage costs for enterprise multi-terabyte cloud backups." },
    { domain: "Video Production & Digital Cinema Storage", context: "Estimating storage footprints for 4K and 8K uncompressed video footage on commercial shoots." }
  ],
  "data:kb-to-mb": [
    { domain: "Web Performance Optimization & Core Web Vitals", context: "Auditing JavaScript bundles, web fonts, and optimized images to minimize browser download latency." },
    { domain: "IoT Sensor Telemetry & Bandwidth Budgets", context: "Calculating monthly data transmission payloads for low-power remote IoT sensor gateways." },
    { domain: "Document Archival & PDF Compression", context: "Compressing scanned legal documents and reports for web portal submission requirements." }
  ],
  "data:bits-to-bytes": [
    { domain: "Internet Connection Speed vs Download Speed", context: "Understanding why an 800 Mbps internet connection downloads files at approximately 100 MB/s." },
    { domain: "Low-Level Binary Protocols & Networking", context: "Calculating packet headers, bitmasks, and payload byte alignment in network device drivers." },
    { domain: "Cryptographic Key Sizes & Hashing Algorithms", context: "Relating encryption key lengths (e.g. 256-bit AES) to raw 32-byte binary buffers." }
  ],
  "fuel:mpg-us-to-l-100km": [
    { domain: "International Vehicle Comparisons & Reviews", context: "Translating US EPA window sticker fuel economy figures into metric consumption for overseas car shoppers." },
    { domain: "Cross-Border Road Trip Fuel Budgeting", context: "Estimating fuel costs when driving US-registered vehicles across Canada, Mexico, and Europe." },
    { domain: "Corporate Fleet Greenhouse Gas Reporting", context: "Converting fleet average fuel economy metrics into standardized metric emissions reports." }
  ],
  "fuel:l-100km-to-mpg-us": [
    { domain: "Imported Vehicle Fuel Economy Verification", context: "Converting European and Asian WLTP fuel consumption ratings into familiar US EPA MPG figures." },
    { domain: "Automotive Journalism & International Road Tests", context: "Reviewing global vehicle launches and international road tests for North American readers." },
    { domain: "Consumer Hybrid & Diesel Efficiency Analysis", context: "Comparing foreign-market fuel-efficient diesel and hybrid models with domestic US vehicles." }
  ],
  "fuel:km-l-to-mpg-us": [
    { domain: "Japanese Domestic Market (JDM) Imports", context: "Translating domestic fuel economy ratings in km/L from Japanese auction sheets into US MPG." },
    { domain: "Motorcycle & High-Efficiency Scooter Testing", context: "Evaluating high-mileage commuter two-wheelers and scooters rated in kilometers per liter." },
    { domain: "Eco-Driving Competitions & Efficiency Rallies", context: "Comparing fuel efficiency records between international metric teams and customary US drivers." }
  ],
  "fuel:mpg-uk-to-mpg-us": [
    { domain: "British vs American Automotive Reviews", context: "Understanding why UK car reviews quote higher MPG figures due to the larger imperial gallon (4.546 L vs 3.785 L)." },
    { domain: "Expat Vehicle Ownership & Budgeting", context: "Reconciling fuel cost expectations when relocating between the UK and the United States." },
    { domain: "Classic British Sports Car Restoration", context: "Interpreting factory owner manual fuel economy ratings on vintage Jaguar, Triumph, and MG automobiles." }
  ],
  "fuel:l-100km-to-km-l": [
    { domain: "Vehicle Dashboard Display Configuration", context: "Switching multi-function vehicle instrument clusters between consumption (L/100km) and range (km/L)." },
    { domain: "Fleet Driver Coaching & Fuel Economy Tracking", context: "Providing intuitive real-time fuel conservation feedback to commercial freight drivers." },
    { domain: "Rental Car Operation in Europe & Asia", context: "Adjusting unfamiliar rental car dashboard efficiency readouts to personal reading preferences." }
  ],
  "angle:degrees-to-radians": [
    { domain: "Computer Graphics & Game Development", context: "Passing rotational angles into trigonometric functions (`Math.sin`, `Math.cos`) in 3D graphics engines." },
    { domain: "Robotics Kinematics & Motion Planning", context: "Calculating robotic arm joint angle rotations and end-effector coordinate transformations." },
    { domain: "Physics & Orbital Mechanics Simulations", context: "Computing satellite orbital trajectories, centripetal acceleration, and angular momentum." }
  ],
  "angle:radians-to-degrees": [
    { domain: "Scientific Calculator Inverse Trigonometry", context: "Converting inverse trigonometric calculations (`atan2`, `asin`) back into intuitive degrees." },
    { domain: "CAD Drafting & Mechanical Schematics", context: "Displaying angular dimensions and chamfer angles on mechanical fabrication blueprints." },
    { domain: "Maritime & Aviation Compass Navigation", context: "Translating mathematical orientation vectors into standard compass degrees." }
  ],
  "angle:degrees-to-gradians": [
    { domain: "Civil Surveying & Cadastral Mapping", context: "Converting property boundary bearings for European surveying instruments utilizing the 400-gradian circle." },
    { domain: "Underground Tunneling & Mining Alignment", context: "Guiding underground laser tunneling and mining boring machines calibrated in grads." },
    { domain: "Geodetic Triangulation & Artillery Metrology", context: "Interpreting European topographic surveying charts and specialized artillery sights." }
  ],
  "angle:arcminutes-to-degrees": [
    { domain: "Astronomical Telescope Optical Pointing", context: "Converting celestial object angular coordinates and telescope field-of-view into decimal degrees." },
    { domain: "Precision Long-Range Ballistics & Optics", context: "Adjusting rifle telescopic sight turrets calibrated in minutes of angle (MOA) for target shooting." },
    { domain: "Geodetic Latitude & Longitude Coordinates", context: "Converting nautical and geographic coordinate minutes into decimal degree GIS coordinates." }
  ],
  "angle:radians-to-mrad": [
    { domain: "Tactical Optics & Precision Marksmanship", context: "Converting ballistic bullet drop calculations into milliradian reticle holdovers." },
    { domain: "Optical Laser Divergence & Collimation", context: "Measuring the angular beam expansion of industrial and communications laser systems." },
    { domain: "Geodetic Baseline Interferometry", context: "Measuring ultra-precise angular shifts in continental drift and seismic monitoring arrays." }
  ],
  "frequency:mhz-to-ghz": [
    { domain: "Microprocessor Clock Speeds & Computing", context: "Comparing CPU and GPU clock frequencies across generations from legacy megahertz to modern gigahertz." },
    { domain: "Wireless Networking & Wi-Fi Bands", context: "Understanding frequency allocations across 2.4 GHz, 5 GHz, and 6 GHz wireless network spectrum." },
    { domain: "Amateur Radio & Spectrum Coordination", context: "Coordinating high-frequency (HF) amateur bands with ultra-high frequency (UHF) microwave allocations." }
  ],
  "frequency:ghz-to-mhz": [
    { domain: "Radar & Satellite Receiver Downconverters", context: "Calculating intermediate frequencies (IF) when downconverting satellite microwave signals for demodulation." },
    { domain: "Cellular Telecommunications Spectrum Rebanding", context: "Refarming legacy cellular spectrum bands into modern 5G communications architectures." },
    { domain: "RF Test Equipment & Oscilloscope Bandwidth", context: "Configuring radio frequency spectrum analyzers and oscilloscopes for wireless signal analysis." }
  ],
  "frequency:khz-to-mhz": [
    { domain: "Ultrasonic Cleaning & Medical Transducers", context: "Specifying transducer operating frequencies for industrial ultrasonic cleaners and medical diagnostic imaging." },
    { domain: "Medium-Wave AM Radio Broadcasting", context: "Converting commercial AM radio broadcast frequencies into megahertz spectrum maps." },
    { domain: "Marine Radio Navigation & NDB Beacons", context: "Tuning non-directional aeronautical and maritime navigational radio beacons." }
  ],
  "frequency:hz-to-khz": [
    { domain: "Audio Engineering & Studio Acoustics", context: "Analyzing human audible frequencies (20 Hz to 20 kHz) and configuring studio equalizer crossovers." },
    { domain: "Predictive Vibration Analysis & Machinery Health", context: "Identifying mechanical bearing defect frequencies and gearbox resonance in industrial maintenance." },
    { domain: "Electrical Grid Harmonic Distortion Audits", context: "Analyzing harmonic frequencies produced by industrial power inverters on electrical distribution systems." }
  ],
  "frequency:rpm-to-hz": [
    { domain: "Engine & Motor Tachometer Frequency Analysis", context: "Converting rotational engine speeds (RPM) into fundamental cycling frequencies (Hz) for acoustic tuning." },
    { domain: "Centrifuge & Turbomachinery Rotor Balancing", context: "Determining critical rotational vibration frequencies in high-speed laboratory centrifuges." },
    { domain: "Wind Turbine Rotor & Gearbox Monitoring", context: "Calculating generator shaft rotational frequencies and wind turbine electrical grid synchronization." }
  ],
  "acceleration:m-s-to-g-force": [
    { domain: "Aerospace & Combat Flight Physiology", context: "Monitoring pilot G-force physiological stress during high-acceleration aerobatic and tactical maneuvers." },
    { domain: "Automotive Crash Safety & Impact Testing", context: "Analyzing crash test dummy accelerometer data against Federal Motor Vehicle Safety Standards." },
    { domain: "Amusement Park Roller Coaster Design", context: "Ensuring vertical and lateral roller coaster accelerations remain within safe human biological tolerances." }
  ],
  "acceleration:g-force-to-m-s": [
    { domain: "Earthquake Seismology & Structural Design", context: "Converting peak ground acceleration (PGA) recorded in $g$ into SI units for seismic building codes." },
    { domain: "Packaging Transit Shock & Drop Testing", context: "Certifying protective packaging for delicate electronics against warehouse transit drop impacts." },
    { domain: "Aerospace Rocket Launch Acceleration", context: "Calculating rocket payload stage separation forces and satellite launch vehicle acceleration profiles." }
  ],
  "acceleration:ft-s-to-m-s": [
    { domain: "Civil Structural Engineering & Seismic Codes", context: "Translating American building code seismic acceleration parameters into international metric simulation software." },
    { domain: "Elevator & Vertical Transit Ride Comfort", context: "Evaluating passenger elevator ride quality and acceleration rates against international standards." },
    { domain: "Aviation Flight Simulator Actuator Tuning", context: "Calibrating multi-axis motion base hydraulic actuators for pilot flight training fidelity." }
  ],
  "electricity:volt-to-kilovolt": [
    { domain: "Electrical Grid & Power Transmission", context: "Converting municipal distribution feeder voltages into regional high-voltage transmission grid kilovolts." },
    { domain: "Consumer High-Voltage Devices & Demonstrations", context: "Understanding kilovolt output ratings on electric insect swatters, plasma lighters, and educational physics equipment." },
    { domain: "Industrial Dielectric Breakdown Testing", context: "Testing high-voltage electrical insulation and transformer oil breakdown voltage thresholds." }
  ],
  "electricity:milliampere-to-ampere": [
    { domain: "Electronics Hardware Design & Battery Life", context: "Calculating microcontroller sleep current and battery operating lifespans from milliampere specifications." },
    { domain: "Industrial 4-20 mA Process Instrumentation", context: "Interpreting industrial current loop sensor signals into amperes for programmable logic controllers (PLCs)." },
    { domain: "USB Charging & Power Bank Capacity", context: "Comparing smartphone charging adapter ampere ratings with battery capacities and power consumption in milliamperes." }
  ],
  "electricity:kilo-ohm-to-ohm": [
    { domain: "Printed Circuit Board (PCB) Assembly", context: "Reading surface-mount resistor codes and schematic values for electronic circuit assembly." },
    { domain: "Audio Equipment & Microphone Impedance", context: "Matching electrical impedances between audio studio microphones, preamplifiers, and line inputs." },
    { domain: "Thermistor Temperature Sensor Calibration", context: "Translating negative temperature coefficient (NTC) thermistor resistance curves into circuit values." }
  ],
  "electricity:microfarad-to-farad": [
    { domain: "DC Power Supply Smoothing & Filtering", context: "Sizing bulk electrolytic filtering capacitors for AC-to-DC power supply rectification circuits." },
    { domain: "Supercapacitor Energy Storage Systems", context: "Comparing conventional electrolytic capacitor values with high-capacity farad supercapacitor backup banks." },
    { domain: "Passive Speaker Crossover Network Design", context: "Calculating capacitor values for audio crossover high-pass and low-pass filter cutoff frequencies." }
  ],
  "magnetism:tesla-to-gauss": [
    { domain: "Magnetic Resonance Imaging (MRI) Safety", context: "Converting clinical MRI magnetic field ratings (1.5T, 3.0T) into gauss to delineate 5-gauss exclusion zones." },
    { domain: "Industrial Magnetic Separation & Chutes", context: "Specifying neodymium rare-earth magnetic grate strengths for food processing and grain milling." },
    { domain: "Thermonuclear Fusion Plasma Confinement", context: "Measuring magnetic field confinement intensities in experimental tokamak fusion reactors." }
  ],
  "magnetism:gauss-to-tesla": [
    { domain: "Hall Effect Sensor Calibration & Robotics", context: "Converting magnetic field readings from digital gaussmeters into standard SI tesla for robotic navigation." },
    { domain: "Geomagnetic Field Mapping & Exploration", context: "Measuring subtle local variations in the Earth's geomagnetic field for geological mineral exploration." },
    { domain: "Electromagnetic Shielding Verification", context: "Evaluating mu-metal attenuation of ambient stray magnetic fields in sensitive electron microscopy rooms." }
  ],
  "datatransfer:mbps-to-gbps": [
    { domain: "High-Speed Broadband Internet Evaluation", context: "Comparing residential and business gigabit fiber internet connections with standard megabit streaming needs." },
    { domain: "Enterprise Local Area Network (LAN) Design", context: "Calculating network switch uplink bandwidth requirements between access switches and data center backbones." },
    { domain: "Ultra-High-Definition Video Streaming CDNs", context: "Managing content delivery network (CDN) server egress capacity for concurrent 4K live video streams." }
  ],
  "datatransfer:gbps-to-mbps": [
    { domain: "Cloud Database Migration & Data Egress", context: "Estimating data transfer duration and costs when migrating large database clusters to cloud storage." },
    { domain: "Storage Area Networks (SAN) & iSCSI Bandwidth", context: "Allocating high-speed Fibre Channel storage bandwidth across clustered enterprise server nodes." },
    { domain: "Uncompressed Studio Video Ingestion", context: "Compressing raw SMPTE ST 2110 uncompressed broadcast video streams for transmission distribution." }
  ],
  "datatransfer:kbps-to-mbps": [
    { domain: "Internet of Things (IoT) Telemetry Backhaul", context: "Aggregating low-bandwidth sensor telemetry packets into broadband cellular backhaul connections." },
    { domain: "Voice over IP (VoIP) Telephony Capacity", context: "Calculating network bandwidth required to support concurrent enterprise telephone calls with VoIP codecs." },
    { domain: "Digital Audio Streaming & Podcast Encoding", context: "Comparing audio compression bitrates between mobile streaming formats and uncompressed audio." }
  ],
  "torque:newton-meter-to-foot-pound": [
    { domain: "Automotive Service & Wheel Lug Tightening", context: "Setting torque wrenches to factory bolt tightening specifications across domestic and imported vehicles." },
    { domain: "Engine Dynamometer Performance Tuning", context: "Translating European and Japanese engine dynamometer torque ratings into familiar foot-pounds." },
    { domain: "Industrial Robotic Assembly Fastening", context: "Programming automated factory nutrunners to apply precise clamping torque on assembly lines." }
  ],
  "torque:foot-pound-to-newton-meter": [
    { domain: "Heavy Machinery & Fleet Maintenance", context: "Converting North American service manual torque specifications for international mechanics." },
    { domain: "Bicycle Maintenance & Workshop Repairs", context: "Torquing delicate carbon fiber stems, seat clamps, and crank bolts according to manufacturer specifications in newton-meters." },
    { domain: "High-Performance Bicycle Component Tuning", context: "Setting precision torque wrenches for carbon fiber handlebars, stems, and seatposts." }
  ],
  "density:g-cm-to-kg-m": [
    { domain: "Materials Science & Polymer Engineering", context: "Converting plastic resin and metal alloy physical densities into SI units for finite element simulation." },
    { domain: "Geological Mineral & Gemstone Identification", context: "Identifying mineral and ore specimens by measuring specific gravity and volumetric density." },
    { domain: "Chemical Process Piping & Fluid Flow", context: "Calculating liquid density parameters for Reynolds number and pipe friction calculations." }
  ],
  "density:kg-m-to-lb-ft": [
    { domain: "Naval Architecture & Marine Ballast Stability", context: "Calculating seawater ballast weight, center of gravity, and vessel displacement." },
    { domain: "Geotechnical Soil Compaction & Foundations", context: "Evaluating earth embankment compaction densities and soil bearing capacities for foundation design." },
    { domain: "Civil Structural Dead-Load Calculations", context: "Calculating structural dead weights of reinforced concrete, structural steel, and timber framing." }
  ],
  "cooking:cup-to-tablespoon": [
    { domain: "Recipe Scaling & Small-Batch Baking", context: "Scaling down cake and cookie recipes without specialized measuring spoons." },
    { domain: "Sauce & Salad Dressing Emulsions", context: "Measuring vinegar, oil, and flavor bases accurately when preparing culinary marinades." },
    { domain: "Nutritional Meal Planning & Portions", context: "Calculating exact portion sizes and calorie counts from bulk cup measurements." }
  ],
  "cooking:tablespoon-to-teaspoon": [
    { domain: "Leavening Agents & Baking Chemistry", context: "Measuring baking powder, baking soda, and yeast accurately for dough fermentation." },
    { domain: "Spice Blends & Seasoning Formulations", context: "Creating custom spice rubs and seasoning mixes from proportional culinary recipes." },
    { domain: "Tea, Coffee & Beverage Crafting", context: "Measuring loose tea leaves, ground espresso, and concentrated syrups using standard kitchen spoons." }
  ],
  "cooking:cup-to-milliliter": [
    { domain: "International Culinary Recipe Adaptation", context: "Translating American cup-based recipes for European home cooks using metric measuring jugs and scales." },
    { domain: "Commercial Bakery Batch Production", context: "Scaling artisan bread formulas from domestic cup measures to commercial metric mixing vats." },
    { domain: "Nutritional Dietary Logging", context: "Converting recipe liquid volumes into precise milliliters for digital dietary tracking apps." }
  ],
  "cooking:fluid-ounce-to-milliliter": [
    { domain: "Cocktail Mixology & Specialty Beverage Craft", context: "Formulating cocktail recipes written in US fluid ounces using metric graduated bar jiggers." },
    { domain: "Infant Feeding & Formula Bottle Preparation", context: "Measuring baby bottle liquid volumes accurately for powdered infant formula reconstitution." },
    { domain: "Specialty Coffee Brewing & Extraction", context: "Translating espresso and pour-over water volumes between customary ounces and metric milliliters." }
  ],
  "textile:gsm-to-thread-count": [
    { domain: "Luxury Bedding & Linen Sourcing", context: "Comparing bedsheet softness, durability, and fabric weight across international metric and imperial standards." },
    { domain: "Apparel Fabric Selection & Garment Design", context: "Selecting appropriate cotton, linen, and synthetic fabric weights for shirts, jackets, and drapery." },
    { domain: "Commercial Printing & Canvas Substrates", context: "Specifying fabric weight and weave density for custom banners, upholstery, and fine art canvases." }
  ],
  "astronomy:light-year-to-au": [
    { domain: "Exoplanetary Systems & Stellar Neighborhoods", context: "Comparing the distance to nearby stars (like Proxima Centauri at 4.24 ly) to our solar system's scale in astronomical units." },
    { domain: "Oort Cloud & Deep-Space Exploration", context: "Visualizing the outer boundary of the solar system and interstellar probes like Voyager." },
    { domain: "Astrophysics Education & Science Outreach", context: "Communicating cosmic distances intuitively to students and planetarium audiences." }
  ],
  "astronomy:parsec-to-light-year": [
    { domain: "Astrometric Parallax & Gaia Mission Data", context: "Converting stellar parallax angles measured by space telescopes into light-years." },
    { domain: "Galactic Mapping & Spiral Arm Structure", context: "Measuring distances between star clusters, molecular clouds, and the galactic core." },
    { domain: "Extragalactic Distance Ladder & Cosmology", context: "Calculating distances to neighboring galaxies and measuring cosmic expansion rates." }
  ],
  "astronomy:solar-mass-to-earth-mass": [
    { domain: "Exoplanet Detection & Radial Velocity Studies", context: "Comparing exoplanetary masses with host star masses to calculate gravitational wobbles." },
    { domain: "Stellar Evolution & Black Hole Physics", context: "Visualizing the immense mass of stellar-mass black holes relative to the Earth." },
    { domain: "Celestial Mechanics & Planetary Orbit Modeling", context: "Inputting mass parameters into multi-body orbital simulations and gravitational models." }
  ]
};
function getPairEditorial(cat, u1, u2, pairParam) {
  const s1 = unitSymbol(u1, cat.id);
  const s2 = unitSymbol(u2, cat.id);
  const n1 = unitName(u1, cat.id);
  const n2 = unitName(u2, cat.id);
  const l1 = unitLabel(u1, cat.id);
  const l2 = unitLabel(u2, cat.id);
  const metrology = CATEGORY_METROLOGY[cat.id] || {
    dimension: `${cat.lb} measurement`,
    siBase: u1.id,
    systems: "Standard international measurement systems",
    contextNote: "Calculated with double-precision IEEE 754 floating-point accuracy."
  };
  const isTemp = cat.id === "temp";
  const isFuel = cat.id === "fuel";
  const isReciprocalFuel = isFuel && (u1.id === "mpgUS" && u2.id === "L100km" || u1.id === "L100km" && u2.id === "mpgUS" || u1.id === "mpgUK" && u2.id === "L100km" || u1.id === "L100km" && u2.id === "mpgUK" || u1.id === "kmL" && u2.id === "L100km" || u1.id === "L100km" && u2.id === "kmL");
  const unitRatio = convert(1, cat.id, u1.id, u2.id);
  const inverseUnitRatio = convert(1, cat.id, u2.id, u1.id);
  let summary;
  let formulaDisplay;
  let inverseSummary;
  let calculationRule;
  if (isTemp) {
    if (u1.id === "C" && u2.id === "F") {
      formulaDisplay = "\xB0F = (\xB0C \xD7 9/5) + 32";
      summary = `1 \xB0C equals 33.8 \xB0F exactly (0 \xB0C corresponds exactly to 32 \xB0F by the scale conversion relationship).`;
      calculationRule = `To convert Celsius to Fahrenheit, multiply the Celsius temperature by 9/5 (or 1.8) and add 32.`;
      inverseSummary = `1 \xB0F equals approximately -17.2222 \xB0C (32 \xB0F corresponds exactly to 0 \xB0C by the scale conversion relationship). Formula: \xB0C = (\xB0F - 32) \xD7 5/9.`;
    } else if (u1.id === "F" && u2.id === "C") {
      formulaDisplay = "\xB0C = (\xB0F - 32) \xD7 5/9";
      summary = `1 \xB0F equals approximately -17.2222 \xB0C (32 \xB0F corresponds exactly to 0 \xB0C by the scale conversion relationship).`;
      calculationRule = `To convert Fahrenheit to Celsius, subtract 32 from the Fahrenheit temperature and multiply the result by 5/9 (or divide by 1.8).`;
      inverseSummary = `1 \xB0C equals 33.8 \xB0F exactly. Formula: \xB0F = (\xB0C \xD7 9/5) + 32.`;
    } else if (u1.id === "C" && u2.id === "K") {
      formulaDisplay = "K = \xB0C + 273.15";
      summary = `1 \xB0C corresponds to 274.15 K (the kelvin and degree Celsius have the same interval size, with 0 \xB0C corresponding to 273.15 K).`;
      calculationRule = `To convert Celsius to Kelvin, add 273.15 to the Celsius temperature.`;
      inverseSummary = `1 K corresponds to -272.15 \xB0C (with 0 K corresponding to -273.15 \xB0C). Formula: \xB0C = K - 273.15.`;
    } else if (u1.id === "K" && u2.id === "C") {
      formulaDisplay = "\xB0C = K - 273.15";
      summary = `1 K corresponds to -272.15 \xB0C (with 0 K corresponding to -273.15 \xB0C).`;
      calculationRule = `To convert Kelvin to Celsius, subtract 273.15 from the Kelvin value.`;
      inverseSummary = `1 \xB0C corresponds to 274.15 K (with 0 \xB0C corresponding to 273.15 K). Formula: K = \xB0C + 273.15.`;
    } else if (u1.id === "F" && u2.id === "K") {
      formulaDisplay = "K = (\xB0F - 32) \xD7 5/9 + 273.15";
      summary = `1 \xB0F equals approximately 255.9278 K (32 \xB0F corresponds to 273.15 K).`;
      calculationRule = `To convert Fahrenheit to Kelvin, subtract 32 from the Fahrenheit value, multiply by 5/9, and add 273.15.`;
      inverseSummary = `1 K equals approximately -457.87 \xB0F. Formula: \xB0F = (K - 273.15) \xD7 9/5 + 32.`;
    } else {
      formulaDisplay = `${s2} = formula(${s1})`;
      summary = `1 ${l1} corresponds to approximately ${unitRatio !== null ? fmt(unitRatio, 4) : ""} ${l2}.`;
      calculationRule = `To convert from ${n1} to ${n2}, apply the thermodynamic conversion formula.`;
      inverseSummary = `1 ${l2} corresponds to approximately ${inverseUnitRatio !== null ? fmt(inverseUnitRatio, 4) : ""} ${l1}.`;
    }
  } else if (isReciprocalFuel) {
    if (u1.id === "mpgUS" && u2.id === "L100km" || u1.id === "L100km" && u2.id === "mpgUS") {
      formulaDisplay = "L/100km \u2248 235.215 \xF7 MPG (US)";
      summary = `1 MPG (US) equals approximately 235.215 L/100km. Formula: L/100km \u2248 235.215 \xF7 MPG (US), where 235.215 = 100 \xD7 3.785411784 \xF7 1.609344.`;
      calculationRule = `To convert between MPG (US) and L/100km, divide 235.215 by the known value (L/100km \u2248 235.215 \xF7 MPG). Note that 235.215 is a rounded constant.`;
      inverseSummary = `1 L/100km equals approximately 235.215 MPG (US). Formula: MPG \u2248 235.215 \xF7 (L/100km).`;
    } else if (u1.id === "mpgUK" && u2.id === "L100km" || u1.id === "L100km" && u2.id === "mpgUK") {
      formulaDisplay = "L/100km \u2248 282.481 \xF7 MPG (UK)";
      summary = `1 MPG (UK) equals approximately 282.481 L/100km. Formula: L/100km \u2248 282.481 \xF7 MPG (UK), where 282.481 = 100 \xD7 4.54609 \xF7 1.609344.`;
      calculationRule = `To convert between MPG (UK) and L/100km, divide 282.481 by the known value (L/100km \u2248 282.481 \xF7 MPG). Note that 282.481 is a rounded constant.`;
      inverseSummary = `1 L/100km equals approximately 282.481 MPG (UK). Formula: MPG \u2248 282.481 \xF7 (L/100km).`;
    } else {
      formulaDisplay = "L/100km = 100 \xF7 km/L";
      summary = `1 km/L equals exactly 100 L/100km. Formula: L/100km = 100 \xF7 km/L.`;
      calculationRule = `To convert between km/L and L/100km, divide 100 by the known value (L/100km = 100 \xF7 km/L).`;
      inverseSummary = `1 L/100km equals exactly 100 km/L. Formula: km/L = 100 \xF7 (L/100km).`;
    }
    if (u1.id === "L100km") {
      ;
      [summary, inverseSummary] = [inverseSummary, summary];
      const [lhs, rhs] = formulaDisplay.split(/ [≈=] /);
      const op = formulaDisplay.includes("\u2248") ? "\u2248" : "=";
      const [constant, divisor] = rhs.split(" \xF7 ");
      formulaDisplay = `${divisor} ${op} ${constant} \xF7 ${lhs}`;
    }
  } else {
    const rFmt = unitRatio !== null ? fmt(unitRatio, 6) : "\u2014";
    const invFmt = inverseUnitRatio !== null ? fmt(inverseUnitRatio, 6) : "\u2014";
    const isExact = unitRatio !== null && Math.abs(Number(rFmt) - unitRatio) < 1e-12;
    const isInvExact = inverseUnitRatio !== null && Math.abs(Number(invFmt) - inverseUnitRatio) < 1e-12;
    formulaDisplay = isExact ? `${s2} = ${s1} \xD7 ${unitRatio !== null ? fmt(unitRatio, 8) : ""}` : `${s2} \u2248 ${s1} \xD7 ${unitRatio !== null ? fmt(unitRatio, 8) : ""}`;
    summary = isExact ? `1 ${l1} equals exactly ${rFmt} ${l2}.` : `1 ${l1} equals approximately ${rFmt} ${l2}.`;
    calculationRule = isExact ? `To convert from ${n1} to ${n2}, multiply the quantity by ${rFmt} (or divide by ${invFmt}).` : `To convert from ${n1} to ${n2}, multiply the quantity by approximately ${rFmt} (or divide by approximately ${invFmt}).`;
    inverseSummary = isInvExact ? `1 ${l2} equals exactly ${invFmt} ${l1}. Formula: ${s1} = ${s2} \xD7 ${inverseUnitRatio !== null ? fmt(inverseUnitRatio, 8) : ""}.` : `1 ${l2} equals approximately ${invFmt} ${l1}. Formula: ${s1} \u2248 ${s2} \xD7 ${inverseUnitRatio !== null ? fmt(inverseUnitRatio, 8) : ""}.`;
  }
  const explanationHeading = `How ${l1} and ${l2} Relate`;
  const p1 = `In metrology, ${cat.lb.toLowerCase()} quantifies ${metrology.dimension}. Within this domain, ${l1} and ${l2} originate from ${metrology.systems}. ${metrology.contextNote}`;
  const p2 = isTemp ? `Unlike purely proportional units, temperature scales differ in both their degree intervals and their zero-point reference baselines. Converting between ${n1} and ${n2} requires an affine transformation (${formulaDisplay}) that shifts the temperature offset before scaling the unit intervals.` : isReciprocalFuel ? `Fuel economy units like ${s1} and ${s2} exhibit an inverse (reciprocal) relationship rather than a direct multiplication factor. One metric measures distance traveled per volume of fuel consumed, while the other measures fuel volume consumed per standard travel distance.` : `Because both ${n1} and ${n2} belong to the linear ${cat.lb.toLowerCase()} domain, conversion between them is strictly proportional. The exact conversion factor (${unitRatio !== null ? fmt(unitRatio, 8) : ""}) guarantees zero precision drift across mathematical calculations.`;
  const pairKey = `${cat.id}:${pairParam}`;
  const specificUseCases = PAIR_USE_CASES[pairKey] || [
    { domain: `Engineering & Technical Specifications`, context: `Converting ${n1} measurements to ${n2} to align design drawings and component tolerances with global partner standards.` },
    { domain: `Commercial Procurement & Logistics`, context: `Reconciling packaging, order quantities, and freight manifests between international ${s1} records and domestic ${s2} systems.` },
    { domain: `Academic Research & Educational Labs`, context: `Translating experimental laboratory readings from ${n1} into standard SI and reporting units.` }
  ];
  const catPairs = categoryContent[cat.id]?.popularPairs || [];
  let canonicalReverseSlug = null;
  for (const p of catPairs) {
    const pFrom = findUnit(cat, cleanSlug(p.from));
    const pTo = findUnit(cat, cleanSlug(p.to));
    if (pFrom && pTo && pFrom.id === u2.id && pTo.id === u1.id) {
      canonicalReverseSlug = `${cleanSlug(p.from)}-to-${cleanSlug(p.to)}`;
      break;
    }
  }
  const reciprocal = canonicalReverseSlug ? {
    hasCanonicalPair: true,
    url: `/convert/${cat.id}/${canonicalReverseSlug}`,
    anchorText: `Convert ${n2} to ${n1} (${s2} to ${s1})`,
    badgeText: "Reverse Pair Available",
    description: `Looking to calculate the reverse direction? Switch directly to our dedicated ${n2} to ${n1} converter.`
  } : {
    hasCanonicalPair: false,
    url: `/convert/${cat.id}`,
    anchorText: `All ${cat.lb} Converters & Tools`,
    badgeText: "Category Hub",
    description: `Need to convert other ${cat.lb.toLowerCase()} units? Explore all combinations in the full ${cat.lb} converter.`
  };
  const workedExampleQuestion = `What is an example calculation converting ${n1} to ${n2}?`;
  let workedExampleAnswer;
  if (isTemp) {
    if (u1.id === "C" && u2.id === "F") {
      workedExampleAnswer = `To convert 25 \xB0C to \xB0F: multiply 25 by 9/5 (which equals 45), then add 32 to get 77 \xB0F (25 \xB0C = 77 \xB0F, a comfortable room temperature).`;
    } else if (u1.id === "F" && u2.id === "C") {
      workedExampleAnswer = `To convert 68 \xB0F to \xB0C: subtract 32 from 68 (which equals 36), then multiply by 5/9 to get 20 \xB0C (68 \xB0F = 20 \xB0C).`;
    } else if (u1.id === "C" && u2.id === "K") {
      workedExampleAnswer = `To convert 20 \xB0C to Kelvin: add 273.15 to 20 to get 293.15 K.`;
    } else if (u1.id === "K" && u2.id === "C") {
      workedExampleAnswer = `To convert 300 K to \xB0C: subtract 273.15 from 300 to get 26.85 \xB0C.`;
    } else {
      const sampleVal = 20;
      const sampleRes = convertTemp(sampleVal, u1.id, u2.id);
      workedExampleAnswer = `To convert ${sampleVal} ${s1} to ${s2}: apply the scale formula to calculate ${sampleVal} ${s1} = ${cleanFloat(sampleRes, 4)} ${s2}.`;
    }
  } else if (isReciprocalFuel) {
    if (u1.id === "mpgUS" && u2.id === "L100km") {
      workedExampleAnswer = `To convert 30 MPG (US) to L/100km: divide 235.215 by 30, which yields 7.84 L/100km (235.215 \xF7 30 = 7.84 L/100km).`;
    } else if (u1.id === "L100km" && u2.id === "mpgUS") {
      workedExampleAnswer = `To convert 8 L/100km to MPG (US): divide 235.215 by 8, which yields 29.40 MPG (US) (235.215 \xF7 8 = 29.40 MPG).`;
    } else if (u1.id === "kmL" && u2.id === "L100km") {
      workedExampleAnswer = `To convert 15 km/L to L/100km: divide 100 by 15, which yields 6.67 L/100km (100 \xF7 15 = 6.67 L/100km).`;
    } else {
      workedExampleAnswer = `To convert 10 ${s1} to ${s2}: apply the reciprocal formula to calculate 10 ${s1} = ${convertFuel(10, u1.id, u2.id) !== null ? fmt(convertFuel(10, u1.id, u2.id), 4) : ""} ${s2}.`;
    }
  } else {
    const sampleVal = 10;
    const sampleRes = convert(sampleVal, cat.id, u1.id, u2.id);
    const isSampleExact = sampleRes !== null && Math.abs(Number(fmt(sampleRes, 4)) - sampleRes) < 1e-12;
    workedExampleAnswer = isSampleExact ? `To convert 10 ${n1} to ${n2}: multiply 10 by the conversion factor ${unitRatio !== null ? fmt(unitRatio, 6) : ""} to get exactly ${sampleRes !== null ? fmt(sampleRes, 4) : ""} ${l2}.` : `To convert 10 ${n1} to ${n2}: multiply 10 by the conversion factor ${unitRatio !== null ? fmt(unitRatio, 6) : ""} to get approximately ${sampleRes !== null ? fmt(sampleRes, 4) : ""} ${l2}.`;
  }
  const faqs = [
    {
      question: isTemp ? `What is 1 ${n1} in ${n2}?` : `How many ${n2} in 1 ${n1}?`,
      answer: `${summary} ${inverseSummary}`
    },
    {
      question: `How to convert ${n1} to ${n2}?`,
      answer: `${calculationRule} Mathematical formula: ${formulaDisplay}.`
    },
    {
      question: workedExampleQuestion,
      answer: workedExampleAnswer
    },
    {
      question: `How to convert back from ${n2} to ${n1}?`,
      answer: isTemp ? `To convert from ${n2} to ${n1}, reverse the calculation formula: ${inverseSummary}` : isReciprocalFuel ? `Because fuel economy conversions between ${s1} and ${s2} are reciprocal, divide the exact conversion constant by your ${s2} value to get ${s1}.` : `To convert from ${n2} to ${n1}, multiply by the inverse factor ${inverseUnitRatio !== null ? fmt(inverseUnitRatio, 6) : ""} (or divide by ${unitRatio !== null ? fmt(unitRatio, 6) : ""}). Formula: ${s1} = ${s2} \xD7 ${inverseUnitRatio !== null ? fmt(inverseUnitRatio, 8) : ""}.`
    }
  ];
  return {
    directAnswer: {
      heading: `Direct Answer: 1 ${s1} to ${s2}`,
      summary,
      formulaDisplay,
      inverseSummary,
      calculationRule,
      isAffine: isTemp,
      isReciprocal: isReciprocalFuel
    },
    explanation: {
      heading: explanationHeading,
      paragraphs: [p1, p2],
      systemContext: metrology.systems
    },
    useCases: specificUseCases,
    reciprocal,
    faqs
  };
}

// src/engine/categoryStandards.ts
var CATEGORY_STANDARDS = {
  length: {
    aeoCapsule: "Length conversion calculates equivalent linear distance across metric, imperial, and astronomical systems. Defined by the 1959 International Yard and Pound Agreement and NIST Special Publication 811, 1 inch equals exactly 25.4 millimeters (2.54 cm), 1 foot equals exactly 0.3048 meters, and 1 meter equals approximately 3.2808399 feet.",
    standardsStatement: "All linear conversion factors on this platform strictly comply with NIST Special Publication 811 (Guide for the Use of the International System of Units), the BIPM SI Brochure (9th Edition), and the 1959 International Yard and Pound Agreement (codifying 1 yard = 0.9144 m and 1 inch = 25.4 mm). Astronomical distances are grounded in the International Astronomical Union (IAU 2012) resolution defining 1 AU = 149,597,870,700 m."
  },
  mass: {
    aeoCapsule: "Mass and weight conversion calculates equivalent mass across metric, avoirdupois imperial, and troy systems using fixed international standards. Standardized by the BIPM 2019 SI Redefinition and NIST SP 811, 1 kilogram (kg) is the SI base unit (defined by the Planck constant h), 1 avoirdupois pound (lb) equals exactly 0.45359237 kg, and 1 ounce (oz) equals 28.3495 grams.",
    standardsStatement: "All mass conversion factors comply with the 2019 BIPM SI Redefinition of the kilogram via the Planck constant, NIST Special Publication 811, and the 1959 International Yard and Pound Agreement (codifying 1 lb = 0.45359237 kg exact). Precious metal conversions strictly adhere to the Troy ounce standard (1 oz t = 31.1034768 grams)."
  },
  temp: {
    aeoCapsule: "Temperature conversion calculates thermal equilibrium across Celsius (\xB0C), Fahrenheit (\xB0F), and Kelvin (K). The kelvin and degree Celsius share the exact same interval size, with 0 \xB0C defined as 273.15 K, while 0 \xB0C corresponds exactly to 32 \xB0F by scale conversion relationship. Absolute zero corresponds to 0 K (\u2212273.15 \xB0C). The exact affine formulas are \xB0F = (\xB0C \xD7 9/5) + 32 and K = \xB0C + 273.15.",
    standardsStatement: "Thermal conversion algorithms adhere to SI base unit definitions (with the kelvin defined via the Boltzmann constant k = 1.380649 \xD7 10\u207B\xB2\xB3 J/K), NIST Special Publication 811, and the BIPM SI Brochure (9th Edition). Fahrenheit and Rankine calculations use exact rational fractions without intermediary rounding."
  },
  area: {
    aeoCapsule: "Area conversion calculates two-dimensional geometric space across metric and imperial customary measures. Governed by NIST SP 811, 1 square meter (m\xB2) equals exactly 10,000 square centimeters or approximately 10.7639 square feet. 1 acre is defined as exactly 43,560 square feet (approx. 4,046.86 m\xB2 or 0.4047 hectares).",
    standardsStatement: "Area conversions follow NIST Special Publication 811 definitions derived directly from international linear dimensions. Agricultural land measures adhere to the International Acre standard (codified following the 2023 NIST deprecation of the US survey foot)."
  },
  volume: {
    aeoCapsule: "Volume and capacity conversion calculates three-dimensional space across metric liters and US/Imperial liquid measures. Defined by NIST Handbook 44, 1 liter (L) equals 1,000 milliliters (cm\xB3), 1 US liquid gallon equals exactly 231 cubic inches (approx. 3.78541 L), and 1 Imperial gallon equals exactly 4.54609 liters.",
    standardsStatement: "Fluid and dry capacity measurements strictly comply with NIST Handbook 44 (Specifications, Tolerances, and Other Technical Requirements for Weighing and Measuring Devices) and the UK Weights and Measures Act (1985) for Imperial units."
  },
  time: {
    aeoCapsule: "Time conversion calculates duration based on the international SI base second (s), standardized by BIPM/SI via 9,192,631,770 transitions of the cesium-133 atom. 1 minute equals 60 seconds, 1 hour equals 3,600 seconds, and 1 standard calendar day equals 86,400 seconds (24 hours).",
    standardsStatement: "All temporal ratios are aligned with the BIPM International Atomic Time (TAI) and Coordinated Universal Time (UTC) definition of the SI second, established by the 13th General Conference on Weights and Measures (CGPM)."
  },
  speed: {
    aeoCapsule: "Speed and velocity conversion calculates rate of distance per unit of time. The SI base unit is meters per second (m/s). 1 m/s equals exactly 3.6 kilometers per hour (km/h) or approx. 2.23694 miles per hour (mph). 1 knot (international nautical mile per hour) equals exactly 1.852 km/h.",
    standardsStatement: "Speed ratios are derived from NIST SP 811 linear and temporal SI base units. Nautical speeds follow the International Hydrographic Organization (IHO) standard of 1 knot = 1,852 meters per hour exact."
  },
  data: {
    aeoCapsule: "Digital data storage and bandwidth conversion calculates binary memory and network throughput. Governed by IEC 80000-13 and IEEE 1541, 1 byte equals 8 bits. Decimal SI prefixes (1 KB = 1,000 bytes, 1 GB = 10\u2079 bytes) represent drive storage, while binary IEC prefixes (1 KiB = 1,024 bytes, 1 GiB = 2\xB3\u2070 bytes) represent RAM memory.",
    standardsStatement: "Digital storage factors strictly comply with IEC 80000-13 and IEEE 1541 standards, clearly separating decimal SI prefixes (KB, MB, GB = powers of 10) from binary IEC prefixes (KiB, MiB, GiB = powers of 2)."
  },
  datatransfer: {
    aeoCapsule: "Data transfer rate conversion calculates network bandwidth and telecommunication throughput across decimal bits and binary bytes per second. Standardized by IEEE 802 and ITU-T, 1 Megabit per second (Mbps) equals 1,000,000 bits/s, equivalent to 125 Kilobytes per second (KB/s). 1 Gigabit per second (Gbps) equals 1,000 Mbps.",
    standardsStatement: "Network bandwidth formulas comply with International Telecommunication Union (ITU-T) and IEEE 802 telecommunications standards, calculating real-world line rate throughput across decimal and binary byte representations."
  },
  pressure: {
    aeoCapsule: "Pressure conversion calculates applied force per unit surface area. The SI base unit is the Pascal (Pa, 1 N/m\xB2). Standard atmospheric pressure (1 atm) is internationally codified by IUPAC as exactly 101,325 Pa (101.325 kPa), equivalent to 1.01325 bar or approx. 14.6959 psi (lbf/in\xB2).",
    standardsStatement: "Pressure equivalents comply with IUPAC (International Union of Pure and Applied Chemistry) standard conditions and NIST Special Publication 811. Technical and barometric units use exact gravitational acceleration g\u2080 = 9.80665 m/s\xB2."
  },
  energy: {
    aeoCapsule: "Energy and work conversion calculates the capacity to perform mechanical, thermal, or electrical work. The SI unit is the Joule (J, 1 N\xB7m). 1 kilojoule (kJ) equals 1,000 Joules, 1 dietary Calorie (kcal) equals 4,184 Joules, 1 British Thermal Unit (BTU) equals approx. 1,055.06 Joules, and 1 kilowatt-hour (kWh) equals 3,600,000 Joules.",
    standardsStatement: "Energy conversion factors adhere to the International Union of Pure and Applied Physics (IUPAP) and NIST SP 811. Thermochemical calories and International Steam Table (IT) calories are distinguished with exact NIST conversion ratios."
  },
  power: {
    aeoCapsule: "Power conversion calculates the rate of energy transfer or work performed over time. The SI base unit is the Watt (W, 1 Joule/s). 1 kilowatt (kW) equals 1,000 Watts, 1 metric horsepower (PS/cv) equals 735.49875 Watts, and 1 mechanical imperial horsepower (hp) is standardized as approx. 745.69987 Watts (550 ft\xB7lbf/s).",
    standardsStatement: "Power calculations strictly distinguish between mechanical horsepower (550 ft\xB7lbf/s \u2248 745.69987 W) codified by James Watt, metric horsepower (DIN 66036 = 75 kp\xB7m/s = 735.49875 W), and electrical horsepower (exactly 746 W) per NIST SP 811."
  },
  fuel: {
    aeoCapsule: "Fuel economy and consumption conversion translates distance-per-volume and volume-per-distance vehicle efficiencies. 1 US MPG (miles per gallon) equals approx. 0.42514 km/L. The reciprocal formula between US MPG and European metric consumption is L/100 km = 235.215 / MPG, and for Imperial UK MPG is L/100 km = 282.481 / UK MPG.",
    standardsStatement: "Automotive consumption equations conform to US EPA (Environmental Protection Agency) and European Commission Directive 1999/100/EC standards for vehicle fuel efficiency measurement and reciprocal metric-to-imperial translation."
  },
  cooking: {
    aeoCapsule: "Culinary conversion calculates volumetric and mass recipe measures across US Customary, UK Imperial, and Metric systems. Based on international culinary standards, 1 US tablespoon equals 3 teaspoons (14.79 mL), 1 US cup equals 16 tablespoons (236.59 mL or 8 fl oz), and 1 metric culinary cup is standardized as exactly 250 mL.",
    standardsStatement: "Culinary volume factors comply with NIST Handbook 44 and standard culinary reference tables, noting regional variations between US Customary cups (236.59 mL), legal nutrition labeling cups (240 mL), and Commonwealth metric cups (250 mL)."
  },
  angle: {
    aeoCapsule: "Angular conversion calculates rotational displacement across circular division systems. The SI derived unit is the radian (rad). A full circle equals 360 degrees (360\xB0), 2\u03C0 radians (approx. 6.283185 rad), or 400 gradians (gon). 1 radian equals approximately 57.29578 degrees.",
    standardsStatement: "Trigonometric angular factors adhere to ISO 80000-3 (Quantities and Units \u2014 Space and Time) and the SI brochure, maintaining double-precision floating-point values of mathematical \u03C0 for astronomical and geodetic calculations."
  },
  force: {
    aeoCapsule: "Force conversion calculates mechanical push or pull acting upon an object. The SI base unit is the Newton (N, 1 kg\xB7m/s\xB2). 1 kilonewton (kN) equals 1,000 Newtons, 1 pound-force (lbf) equals approx. 4.44822 Newtons, and 1 kilogram-force (kgf/kilopond) is defined by standard gravity as exactly 9.80665 Newtons.",
    standardsStatement: "Force calculations comply with BIPM standards and NIST SP 811, using the internationally accepted standard acceleration of free fall g\u2080 = 9.80665 m/s\xB2 for gravitational force units (kilogram-force, pound-force, and ounce-force)."
  }
};

// tests/authority-entity.test.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var rootDir = path.resolve(__dirname, "..");
describe("Phase 3 Step 6 \u2014 GEO Authority, Source Citations & Entity Harmonization", () => {
  describe("1. Authoritative Sources Registry Integrity", () => {
    test("contains verified institutional sources", () => {
      const keys = Object.keys(AUTHORITY_SOURCES);
      assert.ok(keys.length >= 5, "Should have at least 5 institutional sources");
      assert.ok(keys.includes("bipm-si-brochure"));
      assert.ok(keys.includes("bipm-base-units"));
      assert.ok(keys.includes("nist-sp811"));
      assert.ok(keys.includes("nist-hb44"));
      assert.ok(keys.includes("codata-constants"));
    });
    test("every source has valid HTTPS URL and complete metadata", () => {
      for (const src of AUTHORITY_SOURCES_LIST) {
        assert.ok(src.id, "Source must have id");
        assert.ok(src.organization, "Source must have organization");
        assert.ok(src.title, "Source must have title");
        assert.ok(src.url.startsWith("https://"), `URL must be HTTPS: ${src.url}`);
        assert.ok(src.documentRef, "Source must have documentRef");
        assert.ok(src.domain, "Source must have domain");
        assert.ok(Array.isArray(src.supports) && src.supports.length > 0, "Must have supports array");
      }
    });
    test("getAuthoritySource retrieves correct source by ID", () => {
      const bipm = getAuthoritySource("bipm-si-brochure");
      assert.ok(bipm);
      assert.equal(bipm?.organization, "Bureau International des Poids et Mesures (BIPM)");
      assert.equal(getAuthoritySource("non-existent"), void 0);
    });
    test("getCategoryAuthoritySources returns contextually relevant sources only", () => {
      const lengthSources = getCategoryAuthoritySources("length");
      assert.ok(lengthSources.some((s) => s.id === "nist-sp811"));
      assert.ok(lengthSources.some((s) => s.id === "bipm-si-brochure"));
      const cookingSources = getCategoryAuthoritySources("cooking");
      assert.ok(cookingSources.some((s) => s.id === "nist-hb44"));
      assert.equal(cookingSources.some((s) => s.id === "bipm-si-brochure"), false);
      const energySources = getCategoryAuthoritySources("energy");
      assert.ok(energySources.some((s) => s.id === "codata-constants"));
      assert.deepEqual(getCategoryAuthoritySources("currency"), []);
      assert.deepEqual(getCategoryAuthoritySources("crypto"), []);
      assert.deepEqual(getCategoryAuthoritySources("data"), []);
    });
  });
  describe("2. Entity Harmonization & Plural Elimination", () => {
    test('no occurrences of plural "NumanX Studios" in src/ components or pages', () => {
      const srcDir = path.join(rootDir, "src");
      const violations = [];
      function scanDir(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            scanDir(fullPath);
          } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
            const content = fs.readFileSync(fullPath, "utf-8");
            if (content.includes("NumanX Studios")) {
              violations.push(fullPath);
            }
          }
        }
      }
      scanDir(srcDir);
      assert.deepEqual(violations, [], `Found "NumanX Studios" plural in: ${violations.join(", ")}`);
    });
    test('Sidebar, Home, and Settings use singular "NumanX Studio"', () => {
      const sidebar = fs.readFileSync(path.join(rootDir, "src/components/layout/Sidebar.tsx"), "utf-8");
      assert.ok(sidebar.includes("NumanX Studio &copy; 2026"), "Sidebar must use NumanX Studio");
      const home = fs.readFileSync(path.join(rootDir, "src/pages/Home.tsx"), "utf-8");
      assert.ok(home.includes("Omega X Converter \xB7 NumanX Studio"), "Home footer must use Omega X Converter \xB7 NumanX Studio");
      const settings = fs.readFileSync(path.join(rootDir, "src/pages/Settings.tsx"), "utf-8");
      assert.ok(settings.includes("<p>NumanX Studio</p>"), "Settings must display NumanX Studio");
      assert.ok(settings.includes("\xA9 2026 NumanX Studio. All rights reserved."), "Settings copyright must use NumanX Studio");
    });
    test('About page uses "About Omega X Converter" and references "NumanX Studio"', () => {
      const about = fs.readFileSync(path.join(rootDir, "src/pages/About.tsx"), "utf-8");
      assert.ok(about.includes("About Omega X Converter"), "About page must head with About Omega X Converter");
      assert.ok(about.includes("NumanX Studio"), "About page must mention NumanX Studio");
      assert.ok(!about.includes("NumanX Studios"), "About page must not contain NumanX Studios");
    });
  });
  describe("3. Blog Editorial Provenance & Persona Elimination", () => {
    test("all 6 blog posts have non-empty truthful editorial team bylines", () => {
      assert.equal(BLOG_POSTS.length, 6, "Must have exactly 6 blog posts");
      for (const post of BLOG_POSTS) {
        assert.ok(post.author && post.author.length > 0, `Post ${post.slug} missing author`);
      }
    });
    test("synthetic placeholder personas and unverified lab names are removed", () => {
      for (const post of BLOG_POSTS) {
        assert.notEqual(post.author, "Dr. Evelyn Vance", `Post ${post.slug} still has Dr. Evelyn Vance`);
        assert.notEqual(post.author, "Alex Turner", `Post ${post.slug} still has Alex Turner`);
        assert.notEqual(post.author, "Precision Machining Lab", `Post ${post.slug} still has Precision Machining Lab`);
      }
      const engPost = BLOG_POSTS.find((p) => p.slug === "metric-vs-imperial-engineering-guide");
      assert.ok(engPost);
      assert.equal(engPost?.author, "NumanX Engineering Editorial Staff");
      const techPost = BLOG_POSTS.find((p) => p.slug === "digital-data-storage-units-guide");
      assert.ok(techPost);
      assert.equal(techPost?.author, "NumanX Technology Editorial Team");
      const machinistPost = BLOG_POSTS.find((p) => p.slug === "fractional-inches-to-mm-best-practices");
      assert.ok(machinistPost);
      assert.equal(machinistPost?.author, "NumanX Engineering Editorial Staff");
    });
  });
  describe("4. Institutional Non-Endorsement & Disclaimer Integrity", () => {
    test("About page contains explicit non-affiliation disclaimer", () => {
      const about = fs.readFileSync(path.join(rootDir, "src/pages/About.tsx"), "utf-8");
      assert.ok(
        about.includes("do not constitute an endorsement, certification, or official partnership"),
        "About page must contain institutional non-endorsement notice"
      );
    });
    test("No false claims of official certification or endorsement in public pages", () => {
      const prohibitedPhrases = [
        "NIST certified",
        "BIPM certified",
        "endorsed by NIST",
        "endorsed by BIPM",
        "official NIST partner",
        "official BIPM partner"
      ];
      const srcDir = path.join(rootDir, "src");
      function scanDir(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            scanDir(fullPath);
          } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
            const content = fs.readFileSync(fullPath, "utf-8").toLowerCase();
            for (const phrase of prohibitedPhrases) {
              assert.ok(
                !content.includes(phrase.toLowerCase()),
                `Prohibited phrase "${phrase}" found in ${fullPath}`
              );
            }
          }
        }
      }
      scanDir(srcDir);
    });
  });
  describe("5. Temperature Scientific Truthfulness & Standards Alignment", () => {
    test("Celsius to Fahrenheit pair editorial uses scale conversion relationship", () => {
      const tempCat = getAllCategories().find((c) => c.id === "temp");
      const uC = tempCat.un.find((u) => u.id === "C");
      const uF = tempCat.un.find((u) => u.id === "F");
      const cToF = getPairEditorial(tempCat, uC, uF, "celsius-to-fahrenheit");
      assert.ok(cToF.directAnswer.summary.includes("scale conversion relationship"), "cToF summary should mention scale conversion relationship");
      assert.ok(!cToF.directAnswer.summary.includes("ITS-90"), "cToF summary should not misattribute basic scale to ITS-90");
    });
    test("Celsius to Kelvin pair editorial explains equal interval size", () => {
      const tempCat = getAllCategories().find((c) => c.id === "temp");
      const uC = tempCat.un.find((u) => u.id === "C");
      const uK = tempCat.un.find((u) => u.id === "K");
      const cToK = getPairEditorial(tempCat, uC, uK, "celsius-to-kelvin");
      assert.ok(cToK.directAnswer.summary.includes("same interval size"), "cToK summary should explain interval equivalence");
      assert.ok(!cToK.directAnswer.summary.includes("ITS-90"), "cToK summary should not misattribute K = \xB0C + 273.15 to ITS-90");
    });
    test("Category standards for temp avoid ITS-90 misattribution for Kelvin interval", () => {
      const tempStd = CATEGORY_STANDARDS["temp"];
      assert.ok(tempStd);
      assert.ok(tempStd.aeoCapsule.includes("same interval size"));
      assert.ok(!tempStd.aeoCapsule.includes("ITS-90"));
    });
  });
  describe("6. Health Page Schema Verification", () => {
    test("/health page schema emits WebApplication with applicationCategory: HealthApplication", () => {
      const schema = buildCorePageSchema(
        "/health",
        "Health & Biometrics \u2014 Body Mass Index (BMI), BMR & Water Intake Calculator | Omega X",
        "Health calculator description",
        { pageType: "WebApplication", applicationCategory: "HealthApplication" }
      );
      assert.ok(schema);
      assert.ok(schema["@graph"]);
      const graph = schema["@graph"];
      const webApp = graph.find((item) => item["@type"] === "WebApplication");
      assert.ok(webApp, "Schema must contain @type: WebApplication");
      assert.equal(webApp?.applicationCategory, "HealthApplication");
    });
  });
});
