// tests/internal-linking-query-state.test.ts
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// src/config/guideRelations.ts
var GUIDE_RELATIONSHIPS = [
  {
    guideSlug: "lbs-to-kg",
    title: "Pounds to Kilograms",
    categoryId: "mass",
    categoryName: "Mass & Weight",
    categoryPath: "/convert/mass",
    pairSlug: "pounds-to-kilogram",
    pairPath: "/convert/mass/pounds-to-kilogram",
    pairLabel: "Pounds to Kilogram",
    relatedPostSlugs: [
      "metric-vs-imperial-engineering-guide"
    ]
  },
  {
    guideSlug: "kg-to-lbs",
    title: "Kilograms to Pounds",
    categoryId: "mass",
    categoryName: "Mass & Weight",
    categoryPath: "/convert/mass",
    pairSlug: "kilogram-to-pounds",
    pairPath: "/convert/mass/kilogram-to-pounds",
    pairLabel: "Kilogram to Pounds",
    relatedPostSlugs: [
      "metric-vs-imperial-engineering-guide"
    ]
  },
  {
    guideSlug: "meters-to-feet",
    title: "Meters to Feet",
    categoryId: "length",
    categoryName: "Length & Distance",
    categoryPath: "/convert/length",
    pairSlug: "meter-to-feet",
    pairPath: "/convert/length/meter-to-feet",
    pairLabel: "Meter to Feet",
    relatedPostSlugs: [
      "compound-length-units-guide",
      "fractional-inches-to-mm-best-practices",
      "metric-vs-imperial-engineering-guide"
    ]
  },
  {
    guideSlug: "feet-to-meters",
    title: "Feet to Meters",
    categoryId: "length",
    categoryName: "Length & Distance",
    categoryPath: "/convert/length",
    pairSlug: "feet-to-meters",
    pairPath: "/convert/length/feet-to-meters",
    pairLabel: "Feet to Meters",
    relatedPostSlugs: [
      "compound-length-units-guide",
      "metric-vs-imperial-engineering-guide"
    ]
  },
  {
    guideSlug: "celsius-to-fahrenheit",
    title: "Celsius to Fahrenheit",
    categoryId: "temp",
    categoryName: "Temperature",
    categoryPath: "/convert/temp",
    pairSlug: "celsius-to-fahrenheit",
    pairPath: "/convert/temp/celsius-to-fahrenheit",
    pairLabel: "Celsius to Fahrenheit",
    relatedPostSlugs: [
      "temperature-scales-celsius-fahrenheit-kelvin"
    ]
  },
  {
    guideSlug: "fahrenheit-to-celsius",
    title: "Fahrenheit to Celsius",
    categoryId: "temp",
    categoryName: "Temperature",
    categoryPath: "/convert/temp",
    pairSlug: "fahrenheit-to-celsius",
    pairPath: "/convert/temp/fahrenheit-to-celsius",
    pairLabel: "Fahrenheit to Celsius",
    relatedPostSlugs: [
      "temperature-scales-celsius-fahrenheit-kelvin"
    ]
  }
];
function getGuidesForCategory(categoryId) {
  return GUIDE_RELATIONSHIPS.filter((r) => r.categoryId === categoryId);
}
function getGuideForPair(categoryId, pairSlug) {
  return GUIDE_RELATIONSHIPS.find(
    (r) => r.categoryId === categoryId && r.pairSlug === pairSlug
  );
}
function getGuideRelationship(guideSlug) {
  return GUIDE_RELATIONSHIPS.find((r) => r.guideSlug === guideSlug);
}
var STRICT_DECIMAL_REGEX = /^[+-]?(?:(?:\d+\.?\d*)|(?:\.\d+))(?:[eE][+-]?\d+)?$/;
function parsePairQueryVal(rawParam) {
  if (rawParam === null || rawParam === void 0) return "1";
  const trimmed = rawParam.trim();
  if (!trimmed) return "1";
  if (!STRICT_DECIMAL_REGEX.test(trimmed)) return "1";
  const num = Number(trimmed);
  if (!Number.isFinite(num)) return "1";
  return trimmed;
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

// src/engine/guideContent.ts
var guideContent = {
  "lbs-to-kg": {
    title: "Pounds to Kilograms Converter \u2014 Convert lb to kg Instantly",
    metaDesc: "Convert pounds to kilograms: 1 lb = 0.45359237 kg exactly. Free converter with formula, a 1\u2013300 lb table, step-by-step guide and real-world examples.",
    h1: "Pounds to Kilograms Converter (lb \u2192 kg)",
    slug: "lbs-to-kg",
    intro: "Converting pounds to kilograms is essential for fitness tracking, international travel, medical dosage calculations, and shipping. One pound equals exactly 0.45359237 kilograms. Our free converter handles the math instantly \u2014 type any value in pounds and get the exact kilogram equivalent with up to 12 decimal places of precision.",
    formula: "kg = lb \xD7 0.45359237",
    table: [
      { from: 1, to: "0.45 kg", rounded: "0.5 kg" },
      { from: 5, to: "2.27 kg", rounded: "2.5 kg" },
      { from: 10, to: "4.54 kg", rounded: "5 kg" },
      { from: 20, to: "9.07 kg", rounded: "9 kg" },
      { from: 30, to: "13.61 kg", rounded: "14 kg" },
      { from: 40, to: "18.14 kg", rounded: "18 kg" },
      { from: 50, to: "22.68 kg", rounded: "23 kg" },
      { from: 60, to: "27.22 kg", rounded: "27 kg" },
      { from: 70, to: "31.75 kg", rounded: "32 kg" },
      { from: 80, to: "36.29 kg", rounded: "36 kg" },
      { from: 90, to: "40.82 kg", rounded: "41 kg" },
      { from: 100, to: "45.36 kg", rounded: "45 kg" },
      { from: 120, to: "54.43 kg", rounded: "54 kg" },
      { from: 140, to: "63.50 kg", rounded: "64 kg" },
      { from: 150, to: "68.04 kg", rounded: "68 kg" },
      { from: 160, to: "72.57 kg", rounded: "73 kg" },
      { from: 180, to: "81.65 kg", rounded: "82 kg" },
      { from: 200, to: "90.72 kg", rounded: "91 kg" },
      { from: 220, to: "99.79 kg", rounded: "100 kg" },
      { from: 250, to: "113.40 kg", rounded: "113 kg" },
      { from: 300, to: "136.08 kg", rounded: "136 kg" }
    ],
    steps: [
      "Take the weight in pounds (lb)",
      "Multiply by 0.45359237 (the conversion factor)",
      "Round the result to your desired precision",
      'Add the "kg" unit label'
    ],
    examples: [
      "150 lb \xD7 0.45359237 = 68.04 kg (a person weighing 150 lb weighs 68 kg)",
      "10 lb \xD7 0.45359237 = 4.54 kg (a 10 lb bag of flour is 4.54 kg)",
      "1 lb \xD7 0.45359237 = 0.45 kg (one pound is just under half a kilogram)",
      "200 lb \xD7 0.45359237 = 90.72 kg (an adult male weighing 200 lb is about 91 kg)"
    ],
    faq: [
      { q: "How do I convert pounds to kilograms in my head?", a: "Divide pounds by 2.2 for a rough estimate. For example, 150 lb \xF7 2.2 \u2248 68 kg. For precise conversions, multiply by 0.45359237." },
      { q: "What is the difference between lb and lbs?", a: 'Both are the same \u2014 "lb" is the singular abbreviation for pound (from Latin libra), and "lbs" is the plural form.' },
      { q: "Why do Americans use pounds instead of kilograms?", a: "The US is one of three countries (along with Liberia and Myanmar) that still use the imperial system. Most of the world uses kilograms." },
      { q: "How many kg is 1 pound?", a: "One pound equals exactly 0.45359237 kilograms." }
    ],
    relatedGuides: [
      { label: "Kilograms to Pounds Converter", slug: "kg-to-lbs" },
      { label: "Celsius to Fahrenheit Converter", slug: "celsius-to-fahrenheit" },
      { label: "Meters to Feet Converter", slug: "meters-to-feet" }
    ],
    relatedCat: "mass"
  },
  "celsius-to-fahrenheit": {
    title: "Celsius to Fahrenheit Converter \u2014 \xB0C to \xB0F Instantly",
    metaDesc: "Convert Celsius to Fahrenheit with \xB0F = \xB0C \xD7 9/5 + 32. Free converter with a \u221240\xB0C to 100\xB0C reference table, step-by-step guide and examples.",
    h1: "Celsius to Fahrenheit Converter (\xB0C \u2192 \xB0F)",
    slug: "celsius-to-fahrenheit",
    intro: "Converting Celsius to Fahrenheit is one of the most common temperature conversions used worldwide. Whether you are following a recipe from a European blog, checking weather forecasts, doing science homework, or traveling to the United States, knowing how to convert \xB0C to \xB0F is essential. The formula is simple: multiply by 9/5 and add 32.",
    formula: "\xB0F = (\xB0C \xD7 9/5) + 32",
    table: [
      { from: -40, to: "-40.0 \xB0F", rounded: "-40 \xB0F" },
      { from: -20, to: "-4.0 \xB0F", rounded: "-4 \xB0F" },
      { from: -10, to: "14.0 \xB0F", rounded: "14 \xB0F" },
      { from: 0, to: "32.0 \xB0F", rounded: "32 \xB0F" },
      { from: 10, to: "50.0 \xB0F", rounded: "50 \xB0F" },
      { from: 15, to: "59.0 \xB0F", rounded: "59 \xB0F" },
      { from: 20, to: "68.0 \xB0F", rounded: "68 \xB0F" },
      { from: 22, to: "71.6 \xB0F", rounded: "72 \xB0F" },
      { from: 25, to: "77.0 \xB0F", rounded: "77 \xB0F" },
      { from: 30, to: "86.0 \xB0F", rounded: "86 \xB0F" },
      { from: 32, to: "89.6 \xB0F", rounded: "90 \xB0F" },
      { from: 35, to: "95.0 \xB0F", rounded: "95 \xB0F" },
      { from: 37, to: "98.6 \xB0F", rounded: "99 \xB0F" },
      { from: 40, to: "104.0 \xB0F", rounded: "104 \xB0F" },
      { from: 50, to: "122.0 \xB0F", rounded: "122 \xB0F" },
      { from: 60, to: "140.0 \xB0F", rounded: "140 \xB0F" },
      { from: 80, to: "176.0 \xB0F", rounded: "176 \xB0F" },
      { from: 100, to: "212.0 \xB0F", rounded: "212 \xB0F" }
    ],
    steps: [
      "Take the temperature in Celsius (\xB0C)",
      "Multiply by 9 (numerator of 9/5)",
      "Divide by 5 (denominator of 9/5)",
      "Add 32 to the result",
      'Add the "\xB0F" unit label'
    ],
    examples: [
      "25\xB0C \xD7 9/5 + 32 = 77\xB0F (a warm summer day in Europe is 77\xB0F)",
      "0\xB0C \xD7 9/5 + 32 = 32\xB0F (water freezes at 0\xB0C or 32\xB0F)",
      "37\xB0C \xD7 9/5 + 32 = 98.6\xB0F (normal human body temperature)",
      "100\xB0C \xD7 9/5 + 32 = 212\xB0F (water boils at 100\xB0C or 212\xB0F)",
      "-40\xB0C \xD7 9/5 + 32 = -40\xB0F (the only point where Celsius and Fahrenheit are equal)"
    ],
    faq: [
      { q: "What is the easiest way to convert Celsius to Fahrenheit?", a: "Double the Celsius value and add 30 for a quick estimate. For example, 20\xB0C \xD7 2 + 30 = 70\xB0F (real answer: 68\xB0F). For precise math, use the formula \xB0F = \xB0C \xD7 9/5 + 32." },
      { q: "At what temperature are Celsius and Fahrenheit equal?", a: "-40\xB0C = -40\xB0F. This is the only temperature where both scales read the same value." },
      { q: "What is 0\xB0C in Fahrenheit?", a: "0\xB0C (the freezing point of water) equals 32\xB0F." },
      { q: "What is normal body temperature in Fahrenheit?", a: "Normal human body temperature is 37\xB0C, which equals 98.6\xB0F." }
    ],
    relatedGuides: [
      { label: "Fahrenheit to Celsius Converter", slug: "fahrenheit-to-celsius" },
      { label: "Pounds to Kilograms Converter", slug: "lbs-to-kg" },
      { label: "Meters to Feet Converter", slug: "meters-to-feet" }
    ],
    relatedCat: "temp"
  },
  "meters-to-feet": {
    title: "Meters to Feet Converter \u2014 Convert m to ft Instantly",
    metaDesc: "Convert meters to feet: 1 m = 3.28084 ft. Free converter with formula, a 1\u2013100 m table, step-by-step guide and real-world examples.",
    h1: "Meters to Feet Converter (m \u2192 ft)",
    slug: "meters-to-feet",
    intro: 'Converting meters to feet is essential for construction, real estate, hiking, aviation, and understanding product dimensions. One meter equals approximately 3.28084 feet. Our converter handles any value \u2014 from millimeters to kilometers \u2014 with precision up to 12 decimal places. Type natural phrases like "5 meters in feet" and get instant results.',
    formula: "ft = m \xD7 3.28084",
    table: [
      { from: 1, to: "3.28 ft", rounded: "3 ft 3 in" },
      { from: 2, to: "6.56 ft", rounded: "6 ft 7 in" },
      { from: 3, to: "9.84 ft", rounded: "9 ft 10 in" },
      { from: 5, to: "16.40 ft", rounded: "16 ft 5 in" },
      { from: 10, to: "32.81 ft", rounded: "32 ft 10 in" },
      { from: 15, to: "49.21 ft", rounded: "49 ft 3 in" },
      { from: 20, to: "65.62 ft", rounded: "65 ft 7 in" },
      { from: 25, to: "82.02 ft", rounded: "82 ft 0 in" },
      { from: 30, to: "98.43 ft", rounded: "98 ft 5 in" },
      { from: 40, to: "131.23 ft", rounded: "131 ft 3 in" },
      { from: 50, to: "164.04 ft", rounded: "164 ft 0 in" },
      { from: 60, to: "196.85 ft", rounded: "196 ft 10 in" },
      { from: 80, to: "262.47 ft", rounded: "262 ft 6 in" },
      { from: 100, to: "328.08 ft", rounded: "328 ft 1 in" }
    ],
    steps: [
      "Take the length in meters (m)",
      "Multiply by 3.28084 (the conversion factor)",
      "Round to your desired precision",
      'Add the "ft" unit label'
    ],
    examples: [
      "10 m \xD7 3.28084 = 32.81 ft (a 10-meter room is about 33 feet long)",
      "1.83 m \xD7 3.28084 = 6.00 ft (a person who is 1.83 m tall is exactly 6 feet)",
      "100 m \xD7 3.28084 = 328.08 ft (a football field is about 100 meters)",
      "0.3048 m \xD7 3.28084 = 1.00 ft (one foot is exactly 0.3048 meters)"
    ],
    faq: [
      { q: "How do I convert meters to feet in my head?", a: "Multiply meters by 3.3 for a quick estimate. For example, 10 m \xD7 3.3 \u2248 33 ft (real answer: 32.81 ft)." },
      { q: "How many feet is 1 meter?", a: "One meter equals approximately 3.28084 feet, or 3 feet 3.37 inches." },
      { q: "What is the difference between a meter and a foot?", a: "A meter is the base SI unit of length used in most countries. A foot is an imperial unit used mainly in the US. One meter = 3.28084 feet." },
      { q: "How do I convert meters to feet and inches?", a: "Multiply meters by 3.28084 to get decimal feet. Take the decimal part and multiply by 12 to get inches. For example: 1.83 m \xD7 3.28084 = 6.003 ft = 6 ft 0.04 in." }
    ],
    relatedGuides: [
      { label: "Kilograms to Pounds Converter", slug: "kg-to-lbs" },
      { label: "Celsius to Fahrenheit Converter", slug: "celsius-to-fahrenheit" },
      { label: "Meters to Feet Converter", slug: "meters-to-feet" }
    ],
    relatedCat: "mass"
  },
  "kg-to-lbs": {
    title: "Kilograms to Pounds Converter \u2014 Convert kg to lb Instantly",
    metaDesc: "Convert kilograms to pounds: 1 kg = 2.20462 lb. Free converter with formula, a 1\u2013150 kg table, step-by-step guide and real-world examples.",
    h1: "Kilograms to Pounds Converter (kg \u2192 lb)",
    slug: "kg-to-lbs",
    intro: "Converting kilograms to pounds is essential for fitness tracking (especially with US equipment), international shipping, medical dosing, and understanding product weights. One kilogram equals exactly 2.20462 pounds. Our free converter handles any weight instantly \u2014 type any value in kg and get the exact pound equivalent.",
    formula: "lb = kg \xD7 2.20462",
    table: [
      { from: 1, to: "2.20 lb", rounded: "2.2 lb" },
      { from: 2, to: "4.41 lb", rounded: "4.4 lb" },
      { from: 5, to: "11.02 lb", rounded: "11 lb" },
      { from: 10, to: "22.05 lb", rounded: "22 lb" },
      { from: 15, to: "33.07 lb", rounded: "33 lb" },
      { from: 20, to: "44.09 lb", rounded: "44 lb" },
      { from: 25, to: "55.12 lb", rounded: "55 lb" },
      { from: 30, to: "66.14 lb", rounded: "66 lb" },
      { from: 40, to: "88.18 lb", rounded: "88 lb" },
      { from: 50, to: "110.23 lb", rounded: "110 lb" },
      { from: 60, to: "132.28 lb", rounded: "132 lb" },
      { from: 70, to: "154.32 lb", rounded: "154 lb" },
      { from: 80, to: "176.37 lb", rounded: "176 lb" },
      { from: 90, to: "198.42 lb", rounded: "198 lb" },
      { from: 100, to: "220.46 lb", rounded: "220 lb" },
      { from: 120, to: "264.55 lb", rounded: "265 lb" },
      { from: 150, to: "330.69 lb", rounded: "331 lb" }
    ],
    steps: [
      "Take the weight in kilograms (kg)",
      "Multiply by 2.20462 (the conversion factor)",
      "Round to your desired precision",
      'Add the "lb" unit label'
    ],
    examples: [
      "68 kg \xD7 2.20462 = 149.91 lb (a 68 kg person weighs about 150 lb)",
      "5 kg \xD7 2.20462 = 11.02 lb (a 5 kg bag of rice is about 11 lb)",
      "100 kg \xD7 2.20462 = 220.46 lb (100 kg is roughly 220 lb)",
      "0.5 kg \xD7 2.20462 = 1.10 lb (half a kilogram is just over 1 pound)"
    ],
    faq: [
      { q: "How do I convert kg to lbs in my head?", a: "Double the kg value and add 10%. For example, 50 kg \xD7 2 = 100, plus 10% = 110 lb (real answer: 110.23 lb)." },
      { q: "How many pounds is 1 kilogram?", a: "One kilogram equals approximately 2.20462 pounds." },
      { q: "What is the difference between kg and lbs?", a: "Kilogram (kg) is the SI base unit of mass used by most countries. Pound (lb) is an imperial unit used mainly in the US and UK." }
    ],
    relatedGuides: [
      { label: "Pounds to Kilograms Converter", slug: "lbs-to-kg" },
      { label: "Meters to Feet Converter", slug: "meters-to-feet" },
      { label: "Celsius to Fahrenheit Converter", slug: "celsius-to-fahrenheit" }
    ],
    relatedCat: "mass"
  },
  "fahrenheit-to-celsius": {
    title: "Fahrenheit to Celsius Converter \u2014 \xB0F to \xB0C Instantly",
    metaDesc: "Convert Fahrenheit to Celsius with \xB0C = (\xB0F \u2212 32) \xD7 5/9. Free converter with a \u221240\xB0F to 212\xB0F reference table, step-by-step guide and examples.",
    h1: "Fahrenheit to Celsius Converter (\xB0F \u2192 \xB0C)",
    slug: "fahrenheit-to-celsius",
    intro: "Converting Fahrenheit to Celsius is essential when traveling to countries using the metric system, following international recipes, studying science, or checking weather forecasts from Europe and Asia. The formula subtracts 32 from Fahrenheit, then multiplies by 5/9.",
    formula: "\xB0C = (\xB0F \u2212 32) \xD7 5/9",
    table: [
      { from: -40, to: "-40.0 \xB0C", rounded: "-40 \xB0C" },
      { from: -4, to: "-20.0 \xB0C", rounded: "-20 \xB0C" },
      { from: 14, to: "-10.0 \xB0C", rounded: "-10 \xB0C" },
      { from: 32, to: "0.0 \xB0C", rounded: "0 \xB0C" },
      { from: 50, to: "10.0 \xB0C", rounded: "10 \xB0C" },
      { from: 59, to: "15.0 \xB0C", rounded: "15 \xB0C" },
      { from: 68, to: "20.0 \xB0C", rounded: "20 \xB0C" },
      { from: 77, to: "25.0 \xB0C", rounded: "25 \xB0C" },
      { from: 86, to: "30.0 \xB0C", rounded: "30 \xB0C" },
      { from: 95, to: "35.0 \xB0C", rounded: "35 \xB0C" },
      { from: 98.6, to: "37.0 \xB0C", rounded: "37 \xB0C" },
      { from: 104, to: "40.0 \xB0C", rounded: "40 \xB0C" },
      { from: 122, to: "50.0 \xB0C", rounded: "50 \xB0C" },
      { from: 140, to: "60.0 \xB0C", rounded: "60 \xB0C" },
      { from: 176, to: "80.0 \xB0C", rounded: "80 \xB0C" },
      { from: 212, to: "100.0 \xB0C", rounded: "100 \xB0C" }
    ],
    steps: [
      "Take the temperature in Fahrenheit (\xB0F)",
      "Subtract 32",
      "Multiply by 5",
      "Divide by 9",
      'Add the "\xB0C" unit label'
    ],
    examples: [
      "98.6\xB0F \u2212 32 = 66.6, \xD7 5/9 = 37.0\xB0C (normal body temperature)",
      "32\xB0F \u2212 32 = 0, \xD7 5/9 = 0\xB0C (water freezes at 32\xB0F or 0\xB0C)",
      "212\xB0F \u2212 32 = 180, \xD7 5/9 = 100\xB0C (water boils at 212\xB0F or 100\xB0C)",
      "72\xB0F \u2212 32 = 40, \xD7 5/9 = 22.2\xB0C (room temperature is about 22\xB0C)"
    ],
    faq: [
      { q: "What is the easiest way to convert Fahrenheit to Celsius?", a: "Subtract 30 from Fahrenheit then divide by 2 for a quick estimate. For example, 70\xB0F \u2212 30 = 40, \xF7 2 = 20\xB0C (real answer: 21.1\xB0C)." },
      { q: "What is 0\xB0F in Celsius?", a: "0\xB0F equals approximately -17.78\xB0C." },
      { q: "What is 100\xB0F in Celsius?", a: "100\xB0F equals approximately 37.78\xB0C, which is near human body temperature." }
    ],
    relatedGuides: [
      { label: "Celsius to Fahrenheit Converter", slug: "celsius-to-fahrenheit" },
      { label: "Pounds to Kilograms Converter", slug: "lbs-to-kg" },
      { label: "Feet to Meters Converter", slug: "feet-to-meters" }
    ],
    relatedCat: "temp"
  },
  "feet-to-meters": {
    title: "Feet to Meters Converter \u2014 Convert ft to m Instantly",
    metaDesc: "Convert feet to meters: 1 ft = 0.3048 m exactly. Free converter with formula, a 1\u2013100 ft table, step-by-step guide and real-world examples.",
    h1: "Feet to Meters Converter (ft \u2192 m)",
    slug: "feet-to-meters",
    intro: "Converting feet to meters is essential for international construction projects, real estate listings, aviation altitude readings, and understanding US product dimensions in metric units. One foot equals exactly 0.3048 meters. Our converter handles any value with precision and supports natural language input.",
    formula: "m = ft \xD7 0.3048",
    table: [
      { from: 1, to: "0.30 m", rounded: "0.3 m" },
      { from: 2, to: "0.61 m", rounded: "0.6 m" },
      { from: 3, to: "0.91 m", rounded: "0.9 m" },
      { from: 5, to: "1.52 m", rounded: "1.5 m" },
      { from: 6, to: "1.83 m", rounded: "1.8 m" },
      { from: 10, to: "3.05 m", rounded: "3.0 m" },
      { from: 15, to: "4.57 m", rounded: "4.6 m" },
      { from: 20, to: "6.10 m", rounded: "6.1 m" },
      { from: 25, to: "7.62 m", rounded: "7.6 m" },
      { from: 30, to: "9.14 m", rounded: "9.1 m" },
      { from: 40, to: "12.19 m", rounded: "12.2 m" },
      { from: 50, to: "15.24 m", rounded: "15.2 m" },
      { from: 60, to: "18.29 m", rounded: "18.3 m" },
      { from: 80, to: "24.38 m", rounded: "24.4 m" },
      { from: 100, to: "30.48 m", rounded: "30.5 m" }
    ],
    steps: [
      "Take the length in feet (ft)",
      "Multiply by 0.3048 (the exact conversion factor)",
      "Round to your desired precision",
      'Add the "m" unit label'
    ],
    examples: [
      "10 ft \xD7 0.3048 = 3.05 m (a 10-foot room is about 3 meters)",
      "6 ft \xD7 0.3048 = 1.83 m (a person who is 6 feet tall is 1.83 meters)",
      "100 ft \xD7 0.3048 = 30.48 m (a 100-foot building is about 30 meters)",
      "5280 ft \xD7 0.3048 = 1609.34 m (one mile in meters)"
    ],
    faq: [
      { q: "How many meters is 1 foot?", a: "One foot equals exactly 0.3048 meters." },
      { q: "How do I convert feet to meters in my head?", a: "Divide feet by 3.3 for a quick estimate. For example, 10 ft \xF7 3.3 \u2248 3.03 m (real answer: 3.05 m)." },
      { q: "What is 6 feet tall in meters?", a: "6 feet equals approximately 1.83 meters, which is considered tall in many countries." }
    ],
    relatedGuides: [
      { label: "Meters to Feet Converter", slug: "meters-to-feet" },
      { label: "Celsius to Fahrenheit Converter", slug: "celsius-to-fahrenheit" },
      { label: "Pounds to Kilograms Converter", slug: "lbs-to-kg" }
    ],
    relatedCat: "length"
  }
};

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
var INDEXABILITY_POLICY = {
  index: [
    "/",
    "/converter",
    "/categories",
    "/currency",
    "/crypto",
    "/formulas",
    "/calculator",
    "/health",
    "/blog",
    "/about",
    "/sitemap",
    "/privacy",
    "/terms",
    "/contact"
  ],
  noindex: [
    "/dashboard",
    "/favorites",
    "/history",
    "/settings",
    "/custom-units",
    "/help",
    "/404"
  ]
};
function isIndexablePath(path2) {
  const normalized = normalizePath(path2) || "/";
  if (INDEXABILITY_POLICY.noindex.some((p) => normalized === p || normalized.startsWith(`${p}/`))) {
    return false;
  }
  return true;
}

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
function pairTitle(u1, u2, catId) {
  const n1 = unitName(u1, catId);
  const n2 = unitName(u2, catId);
  const s1 = unitSymbol(u1, catId);
  const s2 = unitSymbol(u2, catId);
  if (s1 === n1 && s2 === n2) return `Convert ${n1} to ${n2}`;
  return `Convert ${n1} to ${n2} (${s1} to ${s2})`;
}
function pairMetaDescription(u1, u2, catId, summary) {
  const candidates = [
    `${summary} Free ${unitName(u1, catId)} to ${unitName(u2, catId)} converter with formula and chart.`,
    `${summary} Free converter with formula and chart.`,
    summary
  ];
  const fit = candidates.find((c) => c.length <= 160);
  if (fit) return fit;
  const cut = summary.slice(0, 160).lastIndexOf(". ");
  return cut > 0 ? summary.slice(0, cut + 1) : summary.slice(0, 157) + "\u2026";
}

// src/config/schema.ts
function buildPairSchema(category, u1, u2, unitRatio, inverseUnitRatio, pairParam, faqs, directAnswerSummary) {
  const pageUrl = canonicalUrl(`/convert/${category.id}/${pairParam}`);
  const pageTitle = pairTitle(u1, u2, category.id);
  const summaryText = directAnswerSummary || `1 ${unitName(u1, category.id)} = ${unitRatio !== null ? fmt(unitRatio, 4) : ""} ${unitName(u2, category.id)}.`;
  const metaDescription = pairMetaDescription(u1, u2, category.id, summaryText);
  const defaultFaqs = [
    {
      question: `How many ${unitName(u2, category.id)} in 1 ${unitName(u1, category.id)}?`,
      answer: `1 ${unitLabel(u1, category.id)} is equal to ${unitRatio !== null ? fmt(unitRatio, 6) : ""} ${unitLabel(u2, category.id)}.`
    },
    {
      question: `How to convert ${unitName(u1, category.id)} to ${unitName(u2, category.id)}?`,
      answer: `To convert from ${unitName(u1, category.id)} to ${unitName(u2, category.id)}, multiply the value by ${unitRatio !== null ? fmt(unitRatio, 6) : "the conversion factor"}.`
    }
  ];
  const activeFaqs = faqs && faqs.length > 0 ? faqs : defaultFaqs;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${pageUrl}#software`,
        name: pageTitle,
        url: pageUrl,
        description: metaDescription,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "All",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: canonicalUrl("/") },
          { "@type": "ListItem", position: 2, name: "Categories", item: canonicalUrl("/categories") },
          { "@type": "ListItem", position: 3, name: category.lb, item: canonicalUrl(`/convert/${category.id}`) },
          { "@type": "ListItem", position: 4, name: `${unitName(u1, category.id)} to ${unitName(u2, category.id)}`, item: pageUrl }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: activeFaqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.answer
          }
        }))
      }
    ]
  };
}

// tests/internal-linking-query-state.test.ts
var distDir = path.resolve(process.cwd(), "dist");
describe("Phase 3 Step 4: Guide Relationship Architecture & Internal Linking", () => {
  test("all 6 guides have valid category relationships in the 24-category registry", () => {
    assert.equal(GUIDE_RELATIONSHIPS.length, 6, "Exactly 6 guides must be registered");
    const categoryIds = new Set(Categories.map((c) => c.id));
    for (const rel of GUIDE_RELATIONSHIPS) {
      assert.ok(guideContent[rel.guideSlug], `Guide ${rel.guideSlug} must exist in guideContent`);
      assert.ok(categoryIds.has(rel.categoryId), `Category ${rel.categoryId} must exist in 24-category registry`);
      assert.equal(rel.categoryPath, `/convert/${rel.categoryId}`, "Category path must be canonical");
    }
  });
  test("guide-to-pair links point to valid canonical popular pairs without aliases", () => {
    for (const rel of GUIDE_RELATIONSHIPS) {
      assert.ok(rel.pairPath.startsWith(`/convert/${rel.categoryId}/`), `Pair path ${rel.pairPath} must be under canonical category`);
      assert.ok(isIndexablePath(rel.pairPath), `Pair path ${rel.pairPath} must be an indexable path`);
      assert.ok(!rel.pairPath.includes("//"), `Pair path must not contain double slashes: ${rel.pairPath}`);
    }
  });
  test("category-to-guide lookup resolves matching guides for length, mass, and temp", () => {
    const lengthGuides = getGuidesForCategory("length");
    assert.equal(lengthGuides.length, 2, "Length category must have 2 guides (meters-to-feet, feet-to-meters)");
    assert.ok(lengthGuides.some((g) => g.guideSlug === "meters-to-feet"));
    assert.ok(lengthGuides.some((g) => g.guideSlug === "feet-to-meters"));
    const massGuides = getGuidesForCategory("mass");
    assert.equal(massGuides.length, 2, "Mass category must have 2 guides (lbs-to-kg, kg-to-lbs)");
    assert.ok(massGuides.some((g) => g.guideSlug === "lbs-to-kg"));
    assert.ok(massGuides.some((g) => g.guideSlug === "kg-to-lbs"));
    const tempGuides = getGuidesForCategory("temp");
    assert.equal(tempGuides.length, 2, "Temp category must have 2 guides (celsius-to-fahrenheit, fahrenheit-to-celsius)");
    assert.ok(tempGuides.some((g) => g.guideSlug === "celsius-to-fahrenheit"));
    assert.ok(tempGuides.some((g) => g.guideSlug === "fahrenheit-to-celsius"));
    const digitalGuides = getGuidesForCategory("digital");
    assert.equal(digitalGuides.length, 0);
  });
  test("pair-to-guide lookup resolves bidirectional pair relationships", () => {
    const meterToFeetGuide = getGuideForPair("length", "meter-to-feet");
    assert.ok(meterToFeetGuide, "meter-to-feet must resolve to a guide");
    assert.equal(meterToFeetGuide.guideSlug, "meters-to-feet");
    const feetToMeterGuide = getGuideForPair("length", "feet-to-meters");
    assert.ok(feetToMeterGuide, "feet-to-meters must resolve to a guide");
    assert.equal(feetToMeterGuide.guideSlug, "feet-to-meters");
    const celsiusGuide = getGuideForPair("temp", "celsius-to-fahrenheit");
    assert.ok(celsiusGuide, "celsius-to-fahrenheit must resolve to a guide");
    assert.equal(celsiusGuide.guideSlug, "celsius-to-fahrenheit");
    const kmToMilesGuide = getGuideForPair("length", "kilometer-to-miles");
    assert.equal(kmToMilesGuide, void 0);
  });
  test("guide-to-blog post relationships reference real blog posts", () => {
    const lengthRel = getGuideRelationship("meters-to-feet");
    assert.ok(lengthRel);
    assert.ok(lengthRel.relatedPostSlugs.includes("compound-length-units-guide"));
    const tempRel = getGuideRelationship("celsius-to-fahrenheit");
    assert.ok(tempRel);
    assert.ok(tempRel.relatedPostSlugs.includes("temperature-scales-celsius-fahrenheit-kelvin"));
  });
  test("prerendered HTML contains contextual internal links on category, pair, and guide pages", () => {
    const lengthCatHtml = fs.readFileSync(path.join(distDir, "convert/length/index.html"), "utf-8");
    assert.ok(lengthCatHtml.includes("/guides/meters-to-feet"), "Length category HTML must link to meters-to-feet guide");
    assert.ok(lengthCatHtml.includes("/guides/feet-to-meters"), "Length category HTML must link to feet-to-meters guide");
    const pairHtml = fs.readFileSync(path.join(distDir, "convert/length/meter-to-feet/index.html"), "utf-8");
    assert.ok(pairHtml.includes("/guides/meters-to-feet"), "meter-to-feet pair HTML must link to meters-to-feet guide");
    const guideHtml = fs.readFileSync(path.join(distDir, "guides/meters-to-feet/index.html"), "utf-8");
    assert.ok(guideHtml.includes("/convert/length/meter-to-feet"), "meters-to-feet guide HTML must link to meter-to-feet pair");
    assert.ok(guideHtml.includes("/convert/length"), "meters-to-feet guide HTML must link to length category");
    assert.ok(guideHtml.includes("/blog/compound-length-units-guide"), "meters-to-feet guide HTML must link to related blog article");
  });
});
describe("Phase 3 Step 4: Pair ?val= Query-State Parsing & Canonical Invariants", () => {
  test("parsePairQueryVal accepts valid finite numbers including zero and scientific notation", () => {
    assert.equal(parsePairQueryVal("12"), "12");
    assert.equal(parsePairQueryVal("0"), "0", "Zero must be preserved and NOT fall back to 1");
    assert.equal(parsePairQueryVal("12.5"), "12.5");
    assert.equal(parsePairQueryVal("-10"), "-10", "Negative numbers must be preserved");
    assert.equal(parsePairQueryVal("+5"), "+5");
    assert.equal(parsePairQueryVal(".5"), ".5");
    assert.equal(parsePairQueryVal("1e3"), "1e3");
    assert.equal(parsePairQueryVal("  25.4  "), "25.4", "Whitespace must be trimmed");
  });
  test("parsePairQueryVal rejects invalid, malformed, or infinite values safely to default 1", () => {
    assert.equal(parsePairQueryVal(null), "1");
    assert.equal(parsePairQueryVal(void 0), "1");
    assert.equal(parsePairQueryVal(""), "1");
    assert.equal(parsePairQueryVal("   "), "1");
    assert.equal(parsePairQueryVal("abc"), "1");
    assert.equal(parsePairQueryVal("0x10"), "1", "Hexadecimal syntax must be rejected to default 1");
    assert.equal(parsePairQueryVal("0b10"), "1", "Binary syntax must be rejected to default 1");
    assert.equal(parsePairQueryVal("0o10"), "1", "Octal syntax must be rejected to default 1");
    assert.equal(parsePairQueryVal("Infinity"), "1");
    assert.equal(parsePairQueryVal("-Infinity"), "1");
    assert.equal(parsePairQueryVal("NaN"), "1");
    assert.equal(parsePairQueryVal("1e9999"), "1", "Extreme overflowing exponents must safely fall back");
  });
  test("canonical URL and schema @id strictly exclude ?val= query parameter", () => {
    const rawPathWithQuery = "/convert/length/meter-to-feet?val=12";
    const canonical = canonicalUrl(rawPathWithQuery);
    assert.ok(!canonical.includes("?val="), `Canonical URL must NOT contain query parameters: ${canonical}`);
    assert.ok(canonical.endsWith("/convert/length/meter-to-feet"), `Canonical must match base path: ${canonical}`);
    const lengthCat = Categories.find((c) => c.id === "length");
    const u1 = lengthCat.un.find((u) => u.id === "m");
    const u2 = lengthCat.un.find((u) => u.id === "ft");
    const schema = buildPairSchema(lengthCat, u1, u2, 3.28084, 0.3048, "meter-to-feet");
    for (const node of schema["@graph"]) {
      const id = node["@id"];
      assert.ok(!id.includes("?val="), `Schema @id must NOT contain ?val=: ${id}`);
    }
  });
  test("sitemap entries strictly exclude query parameter variants", () => {
    const sitemapContent = fs.readFileSync(path.join(process.cwd(), "public/sitemap.xml"), "utf-8");
    assert.ok(!sitemapContent.includes("?val="), "Sitemap XML must NOT contain ?val= parameters");
    assert.ok(!sitemapContent.match(/<loc>[^<]*\?[^<]*<\/loc>/), "Sitemap loc entries must not contain query strings");
  });
});
