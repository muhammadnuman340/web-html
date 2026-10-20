// tests/conversion.test.ts
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
function fmtComma(v, prec = 2) {
  if (v === null || v === void 0 || !isFinite(v)) return "\u2014";
  if (v === 0) return "0";
  const abs = Math.abs(v);
  if (abs > 0 && abs < Math.pow(10, -Math.max(prec, 4)) || abs >= 1e12) {
    return cleanFloat(v, Math.max(prec, 4)).toExponential(Math.min(prec, 6));
  }
  return cleanFloat(Number(v.toFixed(prec))).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: prec
  });
}
function toFrac(v, maxDen = 64) {
  if (v === 0) return "0";
  const neg = v < 0;
  v = Math.abs(v);
  const whole = Math.floor(v);
  v -= whole;
  if (v < 1e-10) return neg && whole ? "\u2212" + whole : neg ? "0" : String(whole);
  let bestNum = 1, bestDen = 1, bestDiff = v;
  for (let d = 1; d <= maxDen; d++) {
    const num = Math.round(v * d);
    const diff = Math.abs(v - num / d);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestNum = num;
      bestDen = d;
    }
  }
  let s = neg ? "\u2212" : "";
  if (whole) s += whole + " ";
  if (bestNum) s += bestNum + "/" + bestDen;
  return s.trim();
}
function parseSmart(input, fromUnitRatioToMeter = 1) {
  if (!input || !input.trim()) return null;
  let s = input.trim();
  const compoundRegex = /^(-?\d+(?:\.\d+)?)\s*(?:'|′|ft|feet)\s*(?:(?:(\d+)\s+(\d+)\/(\d+)|(\d+)\/(\d+)|(\d+(?:\.\d+)?))\s*(?:"|″|in|inch|inches)?)?$/i;
  const compoundMatch = s.match(compoundRegex);
  if (compoundMatch) {
    const sign = compoundMatch[1].startsWith("-") ? -1 : 1;
    const feet = Math.abs(parseFloat(compoundMatch[1]) || 0);
    let inches = 0;
    if (compoundMatch[2] && compoundMatch[3] && compoundMatch[4]) {
      inches = parseFloat(compoundMatch[2]) + parseFloat(compoundMatch[3]) / parseFloat(compoundMatch[4]);
    } else if (compoundMatch[5] && compoundMatch[6]) {
      inches = parseFloat(compoundMatch[5]) / parseFloat(compoundMatch[6]);
    } else if (compoundMatch[7]) {
      inches = parseFloat(compoundMatch[7]);
    }
    const totalMeters = sign * (feet * 0.3048 + inches * 0.0254);
    return cleanFloat(totalMeters / (fromUnitRatioToMeter || 1));
  }
  const mixedFrac = s.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
  if (mixedFrac) {
    const whole = parseFloat(mixedFrac[1]);
    const den = parseFloat(mixedFrac[3]);
    if (den === 0) return null;
    const frac = parseFloat(mixedFrac[2]) / den;
    return cleanFloat(whole < 0 ? whole - frac : whole + frac);
  }
  const simpleFrac = s.match(/^(-?\d+)\/(\d+)$/);
  if (simpleFrac) {
    const den = parseFloat(simpleFrac[2]);
    if (den === 0) return null;
    return cleanFloat(parseFloat(simpleFrac[1]) / den);
  }
  if (/^-?\d+,\d+$/.test(s) && !/^-?\d{1,3},\d{3}$/.test(s)) {
    s = s.replace(",", ".");
  } else {
    s = s.replace(/,/g, "");
  }
  const parsed = Number(s);
  return Number.isFinite(parsed) ? parsed : null;
}
function toShopFraction(decimalInches, maxDenominator = 64) {
  const sign = decimalInches < 0 ? "-" : "";
  const absInches = Math.abs(decimalInches);
  const wholeInches = Math.floor(absInches);
  const remainder = absInches - wholeInches;
  const step = 1 / maxDenominator;
  const roundedSteps = Math.round(remainder / step);
  let finalWhole = wholeInches;
  let num = roundedSteps;
  let den = maxDenominator;
  if (num === maxDenominator) {
    finalWhole += 1;
    num = 0;
  }
  while (num > 0 && num % 2 === 0 && den % 2 === 0) {
    num /= 2;
    den /= 2;
  }
  const snappedValue = (decimalInches < 0 ? -1 : 1) * (finalWhole + (num > 0 ? num / den : 0));
  const errorIn = cleanFloat(decimalInches - snappedValue, 6);
  const errorMm = cleanFloat(errorIn * 25.4, 4);
  const fracStr = num === 0 ? `${sign}${finalWhole}\u2033` : finalWhole > 0 ? `${sign}${finalWhole} ${num}/${den}\u2033` : `${sign}${num}/${den}\u2033`;
  const feet = Math.floor(finalWhole / 12);
  const remInches = finalWhole % 12;
  const ftInStr = feet > 0 ? `${sign}${feet}\u2032 ${remInches}${num > 0 ? ` ${num}/${den}` : ""}\u2033` : fracStr;
  return {
    decimalInches: cleanFloat(decimalInches, 8),
    feetAndInches: ftInStr,
    nearestFractionInch: fracStr,
    errorInches: errorIn,
    errorMillimeters: errorMm,
    isExact: Math.abs(errorIn) < 1e-6
  };
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
function convertAll(v, catId, fromId) {
  const cat = getCategory(catId);
  if (!cat) return [];
  return cat.un.map((u) => ({
    id: u.id,
    label: u.lb,
    value: u.id === fromId ? v : convert(v, catId, fromId, u.id)
  }));
}
function getFormula(catId, fromId, toId) {
  const cat = getCategory(catId);
  if (!cat || fromId === toId) return "";
  if (cat.id === "temp") {
    const map = {
      "C->F": "\xB0F = (\xB0C \xD7 9/5) + 32",
      "F->C": "\xB0C = (\xB0F \u2212 32) \xD7 5/9",
      "C->K": "K = \xB0C + 273.15",
      "K->C": "\xB0C = K \u2212 273.15",
      "F->K": "K = (\xB0F \u2212 32) \xD7 5/9 + 273.15",
      "K->F": "\xB0F = (K \u2212 273.15) \xD7 9/5 + 32",
      "C->R": "\xB0R = (\xB0C + 273.15) \xD7 9/5",
      "R->C": "\xB0C = (\xB0R \u2212 491.67) \xD7 5/9"
    };
    return map[`${fromId}->${toId}`] || `${fromId} \u2192 ${toId}`;
  }
  if (cat.id === "fuel") {
    if (fromId === "mpgUS" && toId === "L100km" || fromId === "L100km" && toId === "mpgUS") {
      return "L/100km = 235.215 \xF7 MPG (US)";
    }
    if (fromId === "mpgUK" && toId === "L100km" || fromId === "L100km" && toId === "mpgUK") {
      return "L/100km = 282.481 \xF7 MPG (UK)";
    }
    const sample = convert(1, "fuel", fromId, toId);
    return sample !== null ? `1 ${fromId} \u2248 ${cleanFloat(sample, 6)} ${toId}` : "";
  }
  const fu = getUnit(cat, fromId);
  const tu = getUnit(cat, toId);
  if (!fu || !tu || !fu.r || !tu.r) return "";
  const factor = cleanFloat(fu.r / tu.r, 8);
  return `1 ${fu.lb} = ${factor} ${tu.lb}`;
}
function addCustomUnit(catId, id, label, rate) {
  const cat = getCategory(catId);
  if (!cat) return false;
  if (cat.un.find((u) => u.id === id)) return false;
  cat.un.push({ id, lb: label, r: rate, s: "C", custom: true });
  return true;
}

// src/engine/smartParser.ts
var UNIT_PATTERNS = [
  [/^\s*(?:km|kilometers?|kilometres?|kilo\s*meters?)\s*$/i, "km", []],
  [/^\s*(?:cm|centimeters?|centimetres?|centi\s*meters?)\s*$/i, "cm", []],
  [/^\s*(?:mm|millimeters?|millimetres?|milli\s*meters?)\s*$/i, "mm", []],
  [/^\s*(?:nm|nanometers?)\s*$/i, "nm", []],
  [/^\s*(?:um|micrometers?)\s*$/i, "um", []],
  [/^\s*(?:m|meters?|metres?)\s*$/i, "m", ["meter"]],
  [/^\s*(?:mi|miles?)\s*$/i, "mi", []],
  [/^\s*(?:nmi|nautical\s*miles?)\s*$/i, "nmi", []],
  [/^\s*(?:ft|foot|feet)\s*$/i, "ft", ["feet"]],
  [/^\s*(?:in|inch|inches)\s*$/i, "in", ["inches"]],
  [/^\s*(?:yd|yards?)\s*$/i, "yd", []],
  [/^\s*(?:kg|kilograms?|kilo\s*grams?)\s*$/i, "kg", []],
  [/^\s*(?:mg|milligrams?)\s*$/i, "mg", []],
  [/^\s*(?:g|grams?)\s*$/i, "g", []],
  [/^\s*(?:lbs?|pounds?)\s*$/i, "lb", ["poundz"]],
  [/^\s*(?:oz|ounces?)\s*$/i, "oz", []],
  [/^\s*(?:st|stones?)\s*$/i, "stone", []],
  [/^\s*(?:mL|milliliters?|millilitres?)\s*$/i, "mL", []],
  [/^\s*(?:L|liters?|litres?)\s*$/i, "L", []],
  [/^\s*(?:gal|gallons?)\s*$/i, "gal", []],
  [/^\s*(?:qt|quarts?)\s*$/i, "qt", []],
  [/^\s*(?:pt|pints?)\s*$/i, "pt", []],
  [/^\s*(?:fl\s*oz|floz|fluid\s*ounces?)\s*$/i, "floz", []],
  [/^\s*(?:°?\s*C|celsius)\s*$/i, "C", []],
  [/^\s*(?:°?\s*F|fahrenheits?)\s*$/i, "F", []],
  [/^\s*(?:°?\s*K|kelvins?)\s*$/i, "K", []],
  [/^\s*(?:USD|us\s*dollars?)\s*$/i, "USD", []],
  [/^\s*(?:EUR|euros?)\s*$/i, "EUR", []],
  [/^\s*(?:GBP|pound\s*sterling|sterling)\s*$/i, "GBP", []],
  [/^\s*(?:PKR|pakistani\s*rupees?|rupees?)\s*$/i, "PKR", []],
  [/^\s*(?:INR|indian\s*rupees?)\s*$/i, "INR", []],
  [/^\s*(?:mph|miles?\s*per\s*hour)\s*$/i, "mph", []],
  [/^\s*(?:kmh|km\/h|kph|kilometers?\s*per\s*hour)\s*$/i, "kmh", []],
  [/^\s*(?:m\/s|mps|meters?\s*per\s*second)\s*$/i, "mps", []],
  [/^\s*(?:kWh|kilowatt[\s-]*hours?)\s*$/i, "kWh", []],
  [/^\s*(?:Wh|watt[\s-]*hours?)\s*$/i, "Wh", []],
  [/^\s*(?:kW|kilowatts?)\s*$/i, "kW", []],
  [/^\s*(?:MW|megawatts?)\s*$/i, "MW", []],
  [/^\s*(?:W|watts?)\s*$/i, "W", []],
  [/^\s*(?:hp|horsepower)\s*$/i, "hp", []],
  [/^\s*(?:kcal|kilocalories?)\s*$/i, "kcal", []],
  [/^\s*(?:cal|calories?)\s*$/i, "cal", []],
  [/^\s*(?:kJ|kilojoules?)\s*$/i, "kJ", []],
  [/^\s*(?:J|joules?)\s*$/i, "J", []],
  [/^\s*(?:BTU)\s*$/i, "BTU", []],
  [/^\s*(?:kPa|kilopascals?)\s*$/i, "kPa", []],
  [/^\s*(?:MPa|megapascals?)\s*$/i, "MPa", []],
  [/^\s*(?:Pa|pascals?)\s*$/i, "Pa", []],
  [/^\s*(?:bar)\s*$/i, "bar", []],
  [/^\s*(?:psi)\s*$/i, "psi", []],
  [/^\s*(?:atm|atmospheres?)\s*$/i, "atm", []],
  [/^\s*(?:mmHg)\s*$/i, "mmHg", []],
  [/^\s*(?:N|newtons?)\s*$/i, "N", []],
  [/^\s*(?:lbf|pound[\s-]*force)\s*$/i, "lbf", []],
  [/^\s*(?:Hz|hertz)\s*$/i, "Hz", []],
  [/^\s*(?:kHz|kilohertz)\s*$/i, "kHz", []],
  [/^\s*(?:MHz|megahertz)\s*$/i, "MHz", []],
  [/^\s*(?:GHz|gigahertz)\s*$/i, "GHz", []],
  [/^\s*(?:TB|terabytes?)\s*$/i, "TB", []],
  [/^\s*(?:GB|gigabytes?)\s*$/i, "GB", []],
  [/^\s*(?:MB|megabytes?)\s*$/i, "MB", []],
  [/^\s*(?:KB|kilobytes?)\s*$/i, "KB", []],
  [/^\s*(?:B|bytes?)\s*$/i, "B", []],
  [/^\s*(?:bits?)\s*$/i, "bit", []]
];
function correctUnit(input) {
  const lower = input.trim().toLowerCase();
  for (const [, id, misspellings] of UNIT_PATTERNS) {
    for (const wrong of misspellings) {
      if (lower === wrong.toLowerCase()) return id;
    }
  }
  return input;
}
function extractUnit(text) {
  const cleaned = text.trim().replace(/^of\s+/i, "");
  for (const [pattern, id] of UNIT_PATTERNS) {
    if (pattern.test(cleaned)) return id;
  }
  const corrected = correctUnit(cleaned);
  if (corrected !== cleaned) {
    for (const [pattern, id] of UNIT_PATTERNS) {
      if (pattern.test(corrected)) return id;
    }
  }
  return null;
}
function detectIntent(input) {
  const lower = input.toLowerCase();
  if (/how\s+(many|much|far|long|heavy|big)|what\s+is|what\s+are/i.test(lower)) return "compare";
  if (/explain|how\s+does|why\s+does|how\s+it\s+works/i.test(lower)) return "explain";
  if (/learn|teach|what\s+is\s+a|define/i.test(lower)) return "learn";
  if (/convert|to\s+\w+|in\s+\w+|→|->/i.test(lower)) return "convert";
  const hasNumber = /\d+/.test(lower);
  if (hasNumber) return "convert";
  return "unknown";
}
function parseNaturalLanguage(input) {
  const raw = input.trim();
  if (!raw || raw.length > 200) return { type: "unknown", raw };
  const intent = detectIntent(raw);
  const steps = [];
  const compoundMatch = raw.match(
    /^(?:convert\s+)?(-?\d+(?:\.\d+)?)\s*(?:'|′|ft|feet)\s*(\d+(?:\.\d+)?)?\s*(?:"|″|in|inch|inches)?\s+(?:into|to|in|as|→|->)\s+(.+)$/i
  );
  if (compoundMatch) {
    const ft = parseFloat(compoundMatch[1]);
    const inches = compoundMatch[2] ? parseFloat(compoundMatch[2]) : 0;
    const toUnit = extractUnit(compoundMatch[3]);
    if (!isNaN(ft) && toUnit) {
      const totalFeet = ft + (ft < 0 ? -inches : inches) / 12;
      return {
        type: "convert",
        value: totalFeet,
        fromUnit: "ft",
        toUnit,
        raw,
        intent
      };
    }
  }
  const convertPatterns = [
    /^(?:(?:i\s+want\s+to\s+)?(?:convert|change|transform)\s+)?(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*([a-zA-Z°/\s-]+?)\s+(?:into|to|in|as)\s+([a-zA-Z°/\s-]+?)(?:\s+and\s+show\s+steps)?$/i,
    /^(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*([a-zA-Z°/\s-]+?)\s*(?:→|->|=>|=)\s*([a-zA-Z°/\s-]+?)$/i
  ];
  for (const pattern of convertPatterns) {
    const m = raw.match(pattern);
    if (m) {
      const val = parseFloat(m[1]);
      const fromRaw = m[2].trim();
      const toRaw = m[3].trim();
      const fromUnit = extractUnit(fromRaw);
      const toUnit = extractUnit(toRaw);
      if (fromUnit && toUnit && !isNaN(val)) {
        steps.push({ label: "Parse input", value: `${val} ${fromRaw}` });
        steps.push({ label: "Target unit", value: toRaw });
        return {
          type: "convert",
          value: val,
          fromUnit,
          toUnit,
          raw,
          intent,
          steps
        };
      }
    }
  }
  const howManyMatch = raw.match(/^(?:how\s+many|how\s+much)\s+([a-zA-Z°/\s-]+?)\s+(?:is|are|in)\s+(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*([a-zA-Z°/\s-]+?)$/i);
  if (howManyMatch) {
    const toUnit = extractUnit(howManyMatch[1]);
    const val = parseFloat(howManyMatch[2]);
    const fromUnit = extractUnit(howManyMatch[3]);
    if (fromUnit && toUnit && !isNaN(val)) {
      return { type: "convert", value: val, fromUnit, toUnit, raw, intent };
    }
  }
  const singleMatch = raw.match(/^(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s+([a-zA-Z°/]+)$/);
  if (singleMatch) {
    const val = parseFloat(singleMatch[1]);
    const unit = extractUnit(singleMatch[2]);
    if (!isNaN(val) && unit) {
      return { type: "convert", value: val, fromUnit: unit, raw, intent };
    }
  }
  return { type: "unknown", raw, intent };
}

// tests/conversion.test.ts
function approxEqual(actual, expected, tolerance = 1e-4, msg = "") {
  assert.notEqual(actual, null, `${msg}: Expected non-null value, got null`);
  const diff = Math.abs(actual - expected);
  const allowed = Math.max(tolerance, Math.abs(expected) * tolerance);
  assert.ok(
    diff <= allowed,
    `${msg}: Expected ${actual} \u2248 ${expected} within tolerance ${allowed} (diff: ${diff})`
  );
}
describe("Task 2 & 3: Category Registry & Integrity", () => {
  it("contains exactly 24 registered categories", () => {
    assert.equal(Categories.length, 24);
    assert.equal(getAllCategories().length, 24);
  });
  it("guarantees unique category IDs across the entire registry", () => {
    const ids = Categories.map((c) => c.id);
    const uniqueIds = new Set(ids);
    assert.equal(uniqueIds.size, ids.length, "Duplicate category ID found");
  });
  it("guarantees unique unit IDs within every category", () => {
    for (const cat of Categories) {
      const unitIds = cat.un.map((u) => u.id);
      const uniqueUnitIds = new Set(unitIds);
      assert.equal(
        uniqueUnitIds.size,
        unitIds.length,
        `Duplicate unit ID found in category "${cat.id}"`
      );
    }
  });
  it("verifies all required fields exist on every category definition", () => {
    for (const cat of Categories) {
      assert.ok(typeof cat.id === "string" && cat.id.length > 0, `Category missing id`);
      assert.ok(typeof cat.lb === "string" && cat.lb.length > 0, `Category ${cat.id} missing lb`);
      assert.ok(typeof cat.ic === "string" && cat.ic.length > 0, `Category ${cat.id} missing ic`);
      assert.ok(typeof cat.cl === "string" && cat.cl.length > 0, `Category ${cat.id} missing cl`);
      assert.ok(Array.isArray(cat.un) && cat.un.length > 0, `Category ${cat.id} has empty units`);
    }
  });
  it("verifies all units have valid required fields and finite positive rates where applicable", () => {
    for (const cat of Categories) {
      for (const u of cat.un) {
        assert.ok(typeof u.id === "string" && u.id.length > 0, `Unit missing id in ${cat.id}`);
        assert.ok(typeof u.lb === "string" && u.lb.length > 0, `Unit ${u.id} missing lb in ${cat.id}`);
        if (cat.id !== "temp" && cat.id !== "fuel") {
          assert.ok(
            typeof u.r === "number" && Number.isFinite(u.r) && u.r > 0,
            `Unit ${u.id} in ${cat.id} has invalid conversion rate ${u.r}`
          );
        }
      }
    }
  });
  it("verifies getCategory lookup retrieves correct category definitions", () => {
    assert.equal(getCategory("length")?.lb, "Length");
    assert.equal(getCategory("temp")?.lb, "Temperature");
    assert.equal(getCategory("fuel")?.lb, "Fuel Economy");
    assert.equal(getCategory("nonexistent"), void 0);
  });
  it("verifies base reference units exist for linear categories", () => {
    const linearCats = Categories.filter((c) => c.id !== "temp" && c.id !== "fuel");
    for (const cat of linearCats) {
      const baseUnit = cat.un.find((u) => u.r === 1);
      assert.ok(baseUnit !== void 0, `Category ${cat.id} is missing a base unit with r === 1`);
    }
  });
});
describe("Task 4: Golden Conversion Known-Answer Tests", () => {
  it("converts Length units accurately against NIST standards", () => {
    assert.equal(convert(1, "length", "m", "cm"), 100);
    assert.equal(convert(1, "length", "km", "m"), 1e3);
    assert.equal(convert(1, "length", "in", "cm"), 2.54);
    assert.equal(convert(1, "length", "ft", "in"), 12);
    assert.equal(convert(1, "length", "ft", "m"), 0.3048);
    assert.equal(convert(1, "length", "mi", "ft"), 5280);
    assert.equal(convert(1, "length", "mi", "m"), 1609.344);
    assert.equal(convert(1, "length", "yd", "ft"), 3);
    assert.equal(convert(1, "length", "yd", "m"), 0.9144);
    assert.equal(convert(1, "length", "nmi", "m"), 1852);
  });
  it("converts Mass units accurately against BIPM standards", () => {
    assert.equal(convert(1, "mass", "kg", "g"), 1e3);
    assert.equal(convert(1, "mass", "g", "mg"), 1e3);
    assert.equal(convert(1, "mass", "t", "kg"), 1e3);
    assert.equal(convert(1, "mass", "lb", "kg"), 0.453592);
    approxEqual(convert(1, "mass", "lb", "oz"), 16, 1e-4, "1 lb to oz");
    approxEqual(convert(1, "mass", "stone", "lb"), 14, 1e-4, "1 stone to lb");
    approxEqual(convert(1, "mass", "oz", "g"), 28.3495, 1e-4, "1 oz to g");
  });
  it("converts Area units accurately", () => {
    assert.equal(convert(1, "area", "m2", "cm2"), 1e4);
    assert.equal(convert(1, "area", "km2", "m2"), 1e6);
    assert.equal(convert(1, "area", "ha", "m2"), 1e4);
    assert.equal(convert(1, "area", "ac", "m2"), 4046.86);
    approxEqual(convert(1, "area", "ft2", "in2"), 144, 1e-3, "1 ft2 to in2");
  });
  it("converts Volume units accurately (US liquid definitions)", () => {
    assert.equal(convert(1, "volume", "L", "mL"), 1e3);
    assert.equal(convert(1, "volume", "m3", "L"), 1e3);
    assert.equal(convert(1, "volume", "gal", "L"), 3.78541);
    approxEqual(convert(1, "volume", "gal", "qt"), 4, 1e-4, "1 gal to qt");
    approxEqual(convert(1, "volume", "qt", "pt"), 2, 1e-4, "1 qt to pt");
    approxEqual(convert(1, "volume", "pt", "floz"), 16, 1e-4, "1 pt to floz");
  });
  it("converts Speed units accurately", () => {
    approxEqual(convert(1, "speed", "mps", "kmh"), 3.6, 1e-4, "1 mps to kmh");
    approxEqual(convert(100, "speed", "kmh", "mph"), 62.1371, 1e-3, "100 kmh to mph");
    assert.equal(convert(1, "speed", "mph", "mps"), 0.44704);
    approxEqual(convert(1, "speed", "knot", "kmh"), 1.852, 1e-4, "1 knot to kmh");
  });
  it("converts Time units accurately", () => {
    assert.equal(convert(1, "time", "min", "s"), 60);
    assert.equal(convert(1, "time", "hr", "min"), 60);
    assert.equal(convert(1, "time", "hr", "s"), 3600);
    assert.equal(convert(1, "time", "day", "hr"), 24);
    assert.equal(convert(1, "time", "day", "s"), 86400);
    assert.equal(convert(1, "time", "week", "day"), 7);
    assert.equal(convert(1, "time", "yr", "s"), 31557600);
  });
  it("converts Pressure units accurately", () => {
    assert.equal(convert(1, "pressure", "kPa", "Pa"), 1e3);
    assert.equal(convert(1, "pressure", "MPa", "kPa"), 1e3);
    assert.equal(convert(1, "pressure", "bar", "Pa"), 1e5);
    assert.equal(convert(1, "pressure", "bar", "kPa"), 100);
    assert.equal(convert(1, "pressure", "atm", "Pa"), 101325);
    assert.equal(convert(1, "pressure", "atm", "kPa"), 101.325);
  });
  it("converts Energy units accurately", () => {
    assert.equal(convert(1, "energy", "kJ", "J"), 1e3);
    assert.equal(convert(1, "energy", "cal", "J"), 4.184);
    assert.equal(convert(1, "energy", "kcal", "cal"), 1e3);
    assert.equal(convert(1, "energy", "kWh", "J"), 36e5);
    assert.equal(convert(1, "energy", "BTU", "J"), 1055.06);
  });
  it("converts Power units accurately", () => {
    assert.equal(convert(1, "power", "kW", "W"), 1e3);
    assert.equal(convert(1, "power", "MW", "kW"), 1e3);
    assert.equal(convert(1, "power", "hp", "W"), 745.7);
  });
  it("converts Digital Data units accurately", () => {
    assert.equal(convert(1, "data", "B", "bit"), 8);
    assert.equal(convert(1, "data", "KB", "B"), 1e3);
    assert.equal(convert(1, "data", "MB", "KB"), 1e3);
    assert.equal(convert(1, "data", "GB", "MB"), 1e3);
    assert.equal(convert(1, "data", "TB", "GB"), 1e3);
  });
  it("converts Angle units accurately", () => {
    assert.equal(convert(1, "angle", "deg", "arcmin"), 60);
    assert.equal(convert(1, "angle", "deg", "arcsec"), 3600);
    assert.equal(convert(1, "angle", "grad", "deg"), 0.9);
  });
});
describe("Task 5: Temperature Test Suite", () => {
  it("converts benchmark Celsius to Fahrenheit values", () => {
    assert.equal(convertTemp(0, "C", "F"), 32);
    assert.equal(convertTemp(100, "C", "F"), 212);
    assert.equal(convertTemp(-40, "C", "F"), -40);
    assert.equal(convertTemp(37, "C", "F"), 98.6);
  });
  it("converts benchmark Fahrenheit to Celsius values", () => {
    assert.equal(convertTemp(32, "F", "C"), 0);
    assert.equal(convertTemp(212, "F", "C"), 100);
    assert.equal(convertTemp(-40, "F", "C"), -40);
    approxEqual(convertTemp(98.6, "F", "C"), 37, 1e-4, "98.6F to C");
  });
  it("converts Celsius to Kelvin and vice-versa", () => {
    assert.equal(convertTemp(0, "C", "K"), 273.15);
    assert.equal(convertTemp(100, "C", "K"), 373.15);
    assert.equal(convertTemp(273.15, "K", "C"), 0);
    assert.equal(convertTemp(0, "K", "C"), -273.15);
  });
  it("converts Fahrenheit to Kelvin directly", () => {
    assert.equal(convertTemp(32, "F", "K"), 273.15);
    assert.equal(convertTemp(212, "F", "K"), 373.15);
    approxEqual(convertTemp(0, "K", "F"), -459.67, 1e-4, "0 K to F");
  });
  it("converts Rankine and R\xE9aumur scales correctly", () => {
    assert.equal(convertTemp(0, "C", "R"), 491.67);
    assert.equal(convertTemp(491.67, "R", "C"), 0);
    assert.equal(convertTemp(32, "F", "R"), 491.67);
    assert.equal(convertTemp(0, "C", "Re"), 0);
    assert.equal(convertTemp(100, "C", "Re"), 80);
    assert.equal(convertTemp(80, "Re", "C"), 100);
  });
  it("handles negative temperatures safely across all scales", () => {
    assert.equal(convertTemp(-10, "C", "F"), 14);
    assert.equal(convertTemp(-273.15, "C", "K"), 0);
    assert.equal(convertTemp(-100, "C", "F"), -148);
  });
  it("preserves identity conversion when from === to", () => {
    assert.equal(convertTemp(25, "C", "C"), 25);
    assert.equal(convertTemp(72, "F", "F"), 72);
    assert.equal(convertTemp(300, "K", "K"), 300);
  });
});
describe("Special Category: Fuel Economy Reciprocal Suite", () => {
  it("converts km/L to L/100km reciprocally", () => {
    assert.equal(convertFuel(10, "kmL", "L100km"), 10);
    assert.equal(convertFuel(20, "kmL", "L100km"), 5);
    assert.equal(convertFuel(5, "L100km", "kmL"), 20);
  });
  it("converts MPG (US) to km/L and L/100km", () => {
    assert.equal(convertFuel(1, "mpgUS", "kmL"), 0.425144);
    approxEqual(convertFuel(23.5215, "mpgUS", "L100km"), 10, 0.01, "23.52 MPG US to L100km");
  });
  it("fails safely on zero or negative fuel economy", () => {
    assert.equal(convertFuel(0, "kmL", "L100km"), null);
    assert.equal(convertFuel(-15, "mpgUS", "kmL"), null);
    assert.equal(convertFuel(NaN, "kmL", "L100km"), null);
  });
});
describe("Task 13: Universal Category Coverage \u2014 All 24 Categories Tested", () => {
  const categoryTestCases = [
    { cat: "length", from: "m", to: "cm", val: 1 },
    { cat: "area", from: "m2", to: "cm2", val: 1 },
    { cat: "volume", from: "L", to: "mL", val: 1 },
    { cat: "mass", from: "kg", to: "g", val: 1 },
    { cat: "temp", from: "C", to: "F", val: 0 },
    { cat: "time", from: "hr", to: "min", val: 1 },
    { cat: "speed", from: "mps", to: "kmh", val: 1 },
    { cat: "acceleration", from: "mps2", to: "gal", val: 1 },
    { cat: "force", from: "N", to: "dyn", val: 1 },
    { cat: "pressure", from: "kPa", to: "Pa", val: 1 },
    { cat: "energy", from: "kJ", to: "J", val: 1 },
    { cat: "power", from: "kW", to: "W", val: 1 },
    { cat: "electricity", from: "kV", to: "V", val: 1 },
    { cat: "magnetism", from: "T", to: "G", val: 1 },
    { cat: "frequency", from: "kHz", to: "Hz", val: 1 },
    { cat: "data", from: "MB", to: "KB", val: 1 },
    { cat: "datatransfer", from: "Mbps", to: "kbps", val: 1 },
    { cat: "angle", from: "deg", to: "arcmin", val: 1 },
    { cat: "torque", from: "Nm", to: "lbft", val: 1 },
    { cat: "fuel", from: "kmL", to: "L100km", val: 10 },
    { cat: "density", from: "gcm3", to: "kgm3", val: 1 },
    { cat: "cooking", from: "cup_c", to: "tbsp_c", val: 1 },
    { cat: "textile", from: "gsm", to: "tc", val: 1 },
    { cat: "astronomy", from: "ly_a", to: "au_a", val: 1 }
  ];
  it("guarantees test execution for every one of the 24 registered categories", () => {
    assert.equal(categoryTestCases.length, 24);
    for (const tc of categoryTestCases) {
      const res = convert(tc.val, tc.cat, tc.from, tc.to);
      assert.notEqual(res, null, `Category ${tc.cat} failed conversion from ${tc.from} to ${tc.to}`);
      assert.ok(typeof res === "number" && Number.isFinite(res), `Category ${tc.cat} produced non-finite result`);
    }
  });
  it("verifies convertAll returns results for all units in a category", () => {
    const list = convertAll(10, "length", "m");
    assert.equal(list.length, 23);
    const cmEntry = list.find((e) => e.id === "cm");
    assert.equal(cmEntry?.value, 1e3);
  });
});
describe("Task 6: Round-Trip Property Tests (A -> B -> A)", () => {
  const testValues = [1e-3, 1, 1.5, 100, 12345.6789, 1e6];
  it("preserves values in round-trip length conversions (m <-> ft)", () => {
    for (const v of testValues) {
      const b = convert(v, "length", "m", "ft");
      const a = convert(b, "length", "ft", "m");
      approxEqual(a, v, 1e-4, `m -> ft -> m for ${v}`);
    }
  });
  it("preserves values in round-trip mass conversions (kg <-> lb)", () => {
    for (const v of testValues) {
      const b = convert(v, "mass", "kg", "lb");
      const a = convert(b, "mass", "lb", "kg");
      approxEqual(a, v, 1e-4, `kg -> lb -> kg for ${v}`);
    }
  });
  it("preserves values in round-trip temperature conversions (C <-> F)", () => {
    const tempValues = [-100, -40, 0, 25, 37, 100, 250];
    for (const v of tempValues) {
      const b = convert(v, "temp", "C", "F");
      const a = convert(b, "temp", "F", "C");
      approxEqual(a, v, 1e-4, `C -> F -> C for ${v}`);
    }
  });
  it("preserves values in round-trip volume conversions (L <-> gal)", () => {
    for (const v of testValues) {
      const b = convert(v, "volume", "L", "gal");
      const a = convert(b, "volume", "gal", "L");
      approxEqual(a, v, 1e-4, `L -> gal -> L for ${v}`);
    }
  });
  it("preserves values in round-trip fuel conversions (kmL <-> L100km)", () => {
    for (const v of [5, 10, 15, 25]) {
      const b = convert(v, "fuel", "kmL", "L100km");
      const a = convert(b, "fuel", "L100km", "kmL");
      approxEqual(a, v, 1e-4, `kmL -> L100km -> kmL for ${v}`);
    }
  });
});
describe("Task 7: Cross-Unit Consistency (A -> B -> C vs A -> C)", () => {
  it("verifies transitive consistency in length (in -> ft -> m)", () => {
    const v = 120;
    const inToFt = convert(v, "length", "in", "ft");
    const ftToM = convert(inToFt, "length", "ft", "m");
    const directInToM = convert(v, "length", "in", "m");
    approxEqual(ftToM, directInToM, 1e-5, "120 in transitive consistency");
  });
  it("verifies transitive consistency in mass (oz -> lb -> kg)", () => {
    const v = 32;
    const ozToLb = convert(v, "mass", "oz", "lb");
    const lbToKg = convert(ozToLb, "mass", "lb", "kg");
    const directOzToKg = convert(v, "mass", "oz", "kg");
    approxEqual(lbToKg, directOzToKg, 1e-4, "32 oz transitive consistency");
  });
  it("verifies transitive consistency in time (s -> min -> hr)", () => {
    const v = 7200;
    const sToMin = convert(v, "time", "s", "min");
    const minToHr = convert(sToMin, "time", "min", "hr");
    const directSToHr = convert(v, "time", "s", "hr");
    assert.equal(minToHr, directSToHr);
  });
  it("verifies transitive consistency in energy (cal -> kcal -> J)", () => {
    const v = 5e3;
    const calToKcal = convert(v, "energy", "cal", "kcal");
    const kcalToJ = convert(calToKcal, "energy", "kcal", "J");
    const directCalToJ = convert(v, "energy", "cal", "J");
    approxEqual(kcalToJ, directCalToJ, 1e-4, "5000 cal transitive consistency");
  });
});
describe("Task 8: Smart Parser NLP Tests", () => {
  it("parses standard natural language queries correctly", () => {
    const res1 = parseNaturalLanguage("10 km to miles");
    assert.equal(res1.type, "convert");
    assert.equal(res1.value, 10);
    assert.equal(res1.fromUnit, "km");
    assert.equal(res1.toUnit, "mi");
    const res2 = parseNaturalLanguage("5 feet to meters");
    assert.equal(res2.type, "convert");
    assert.equal(res2.value, 5);
    assert.equal(res2.fromUnit, "ft");
    assert.equal(res2.toUnit, "m");
    const res3 = parseNaturalLanguage("100 c to f");
    assert.equal(res3.type, "convert");
    assert.equal(res3.value, 100);
    assert.equal(res3.fromUnit, "C");
    assert.equal(res3.toUnit, "F");
    const res4 = parseNaturalLanguage("2.5 kg to lb");
    assert.equal(res4.type, "convert");
    assert.equal(res4.value, 2.5);
    assert.equal(res4.fromUnit, "kg");
    assert.equal(res4.toUnit, "lb");
  });
  it("parses arrow and symbol expressions", () => {
    const arrow = parseNaturalLanguage("100 km -> mi");
    assert.equal(arrow.type, "convert");
    assert.equal(arrow.value, 100);
    assert.equal(arrow.fromUnit, "km");
    assert.equal(arrow.toUnit, "mi");
    const eq = parseNaturalLanguage("50 m = ft");
    assert.equal(eq.type, "convert");
    assert.equal(eq.value, 50);
    assert.equal(eq.fromUnit, "m");
    assert.equal(eq.toUnit, "ft");
  });
  it('parses "how many" sentence structures', () => {
    const hm = parseNaturalLanguage("how many miles in 10 km");
    assert.equal(hm.type, "convert");
    assert.equal(hm.value, 10);
    assert.equal(hm.fromUnit, "km");
    assert.equal(hm.toUnit, "mi");
  });
  it("parses compound feet and inches into decimal feet", () => {
    const compound = parseNaturalLanguage("5 ft 10 in to cm");
    assert.equal(compound.type, "convert");
    approxEqual(compound.value, 5 + 10 / 12, 1e-4, "5 ft 10 in to feet");
    assert.equal(compound.fromUnit, "ft");
    assert.equal(compound.toUnit, "cm");
  });
  it("handles case insensitivity and extra whitespace gracefully", () => {
    const clean = parseNaturalLanguage("   100   CELSIUS   TO   FAHRENHEIT   ");
    assert.equal(clean.type, "convert");
    assert.equal(clean.value, 100);
    assert.equal(clean.fromUnit, "C");
    assert.equal(clean.toUnit, "F");
  });
  it("parses negative numbers and scientific notation", () => {
    const neg = parseNaturalLanguage("-40 c to f");
    assert.equal(neg.type, "convert");
    assert.equal(neg.value, -40);
    assert.equal(neg.fromUnit, "C");
    assert.equal(neg.toUnit, "F");
    const sci = parseNaturalLanguage("1e3 m to km");
    assert.equal(sci.type, "convert");
    assert.equal(sci.value, 1e3);
    assert.equal(sci.fromUnit, "m");
    assert.equal(sci.toUnit, "km");
  });
  it("safely classifies unsupported or malformed expressions as unknown", () => {
    assert.equal(parseNaturalLanguage("").type, "unknown");
    assert.equal(parseNaturalLanguage("hello world").type, "unknown");
    assert.equal(parseNaturalLanguage("10 apples to oranges").type, "unknown");
  });
});
describe("Task 9: Number Parsing & Formatting Utility Suite", () => {
  it("parses simple integers and decimals", () => {
    assert.equal(parseSmart("0"), 0);
    assert.equal(parseSmart("1"), 1);
    assert.equal(parseSmart("-1"), -1);
    assert.equal(parseSmart("1.5"), 1.5);
    assert.equal(parseSmart("0.0001"), 1e-4);
    assert.equal(parseSmart("1000000"), 1e6);
  });
  it("parses locale comma decimals and thousand separators", () => {
    assert.equal(parseSmart("12,5"), 12.5);
    assert.equal(parseSmart("1,000"), 1e3);
    assert.equal(parseSmart("1,250.50"), 1250.5);
  });
  it("parses simple fractions and mixed fractions", () => {
    assert.equal(parseSmart("1/2"), 0.5);
    assert.equal(parseSmart("3/4"), 0.75);
    assert.equal(parseSmart("1 1/2"), 1.5);
    assert.equal(parseSmart("5 3/8"), 5.375);
    assert.equal(parseSmart("-1/4"), -0.25);
    assert.equal(parseSmart("-2 1/4"), -2.25);
  });
  it("parses compound imperial architectural syntax", () => {
    approxEqual(parseSmart(`5' 10"`, 0.3048), 5 + 10 / 12, 1e-6, `5' 10"`);
    assert.equal(parseSmart("5ft 6in", 0.3048), 5.5);
    approxEqual(parseSmart(`5' 3/4"`, 0.3048), 5 + 0.75 / 12, 1e-6, `5' 3/4"`);
  });
  it("fails safely with null on invalid numeric inputs", () => {
    assert.equal(parseSmart("abc"), null);
    assert.equal(parseSmart("--"), null);
    assert.equal(parseSmart("1//2"), null);
    assert.equal(parseSmart("1/0"), null);
    assert.equal(parseSmart("NaN"), null);
    assert.equal(parseSmart("Infinity"), null);
    assert.equal(parseSmart(""), null);
  });
  it("cleans floating point artifacts with cleanFloat", () => {
    assert.equal(cleanFloat(0.1 + 0.2), 0.3);
    assert.equal(cleanFloat(0), 0);
    assert.equal(cleanFloat(NaN), 0);
    assert.equal(cleanFloat(Infinity), 0);
  });
  it("formats numbers with fmt, fmtComma, and toFrac", () => {
    assert.equal(fmt(0), "0");
    assert.equal(fmt(null), "\u2014");
    assert.equal(fmt(void 0), "\u2014");
    assert.equal(fmt(12.3456789, 2), "12.35");
    assert.equal(fmtComma(123456789e-2, 2), "1,234,567.89");
    assert.equal(toFrac(0.5), "1/2");
    assert.equal(toFrac(1.75), "1 3/4");
    assert.equal(toFrac(0), "0");
  });
  it("computes shop fractional tolerance via toShopFraction", () => {
    const res = toShopFraction(5.375, 16);
    assert.equal(res.decimalInches, 5.375);
    assert.equal(res.nearestFractionInch, "5 3/8\u2033");
    assert.equal(res.isExact, true);
    assert.equal(res.errorInches, 0);
  });
});
describe("Task 10: Zero, Negative & Extreme Mathematical Values", () => {
  it("correctly handles zero without failing truthiness checks", () => {
    assert.equal(convert(0, "length", "m", "ft"), 0);
    assert.equal(convert(0, "mass", "kg", "lb"), 0);
    assert.equal(convert(0, "speed", "mps", "kmh"), 0);
    assert.equal(convert(0, "temp", "C", "F"), 32);
    assert.equal(convert(0, "temp", "C", "K"), 273.15);
  });
  it("converts negative numbers in valid physical domains", () => {
    assert.equal(convert(-40, "temp", "C", "F"), -40);
    assert.equal(convert(-90, "angle", "deg", "grad"), -100);
    assert.equal(convert(-10, "force", "N", "dyn"), -1e6);
  });
  it("handles sub-micro and extreme values without precision loss", () => {
    assert.equal(convert(1e-9, "length", "m", "nm"), 1);
    assert.equal(convert(1, "length", "nm", "m"), 1e-9);
    assert.equal(convert(1e12, "data", "B", "TB"), 1);
    assert.equal(convert(1, "data", "TB", "B"), 1e12);
    assert.equal(convert(1, "length", "ly", "m"), 9461e12);
  });
});
describe("Task 14: Contract & Error Handling Behavior", () => {
  it("returns null for unknown categories", () => {
    assert.equal(convert(10, "unknown_category", "m", "ft"), null);
    assert.equal(convert(10, "", "m", "ft"), null);
  });
  it("returns null for unknown source or destination units", () => {
    assert.equal(convert(10, "length", "nonexistent_unit", "ft"), null);
    assert.equal(convert(10, "length", "m", "nonexistent_unit"), null);
  });
  it("returns null for NaN and Infinity values", () => {
    assert.equal(convert(NaN, "length", "m", "ft"), null);
    assert.equal(convert(Infinity, "length", "m", "ft"), null);
    assert.equal(convert(-Infinity, "length", "m", "ft"), null);
  });
  it("handles custom unit registration safely", () => {
    const registered = addCustomUnit("length", "cubit_custom", "Custom Cubit", 0.5);
    assert.equal(registered, true);
    assert.equal(convert(2, "length", "cubit_custom", "m"), 1);
    const duplicate = addCustomUnit("length", "cubit_custom", "Custom Cubit 2", 0.5);
    assert.equal(duplicate, false);
  });
  it("returns formatted conversion formulas correctly", () => {
    const f1 = getFormula("temp", "C", "F");
    assert.equal(f1, "\xB0F = (\xB0C \xD7 9/5) + 32");
    const f2 = getFormula("fuel", "mpgUS", "L100km");
    assert.equal(f2, "L/100km = 235.215 \xF7 MPG (US)");
    const f3 = getFormula("length", "m", "cm");
    assert.equal(f3, "1 Meter = 100 Centimeter");
  });
});
