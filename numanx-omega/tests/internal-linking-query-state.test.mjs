// tests/internal-linking-query-state.test.ts
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// src/config/guideRelations.ts
var GUIDE_RELATIONSHIPS = [
  {
    guideSlug: "cups-to-grams",
    title: "Cups to Grams",
    categoryId: "cooking",
    categoryName: "Cooking & Recipes",
    categoryPath: "/convert/cooking",
    pairSlug: "stick-of-butter-to-tablespoon",
    pairPath: "/convert/cooking/stick-of-butter-to-tablespoon",
    pairLabel: "Stick of Butter to Tablespoon",
    fromUnit: "cup_c",
    toUnit: "mL_c",
    relatedPostSlugs: [
      "ai-powered-unit-conversions-in-2026"
    ]
  },
  {
    guideSlug: "lakh-crore-to-million-billion",
    title: "Lakh & Crore to Million & Billion",
    categoryId: "pk-numbering",
    categoryName: "South Asian Numbering",
    categoryPath: "/convert/pk-numbering",
    pairSlug: "lakh-to-m-std",
    pairPath: "/convert/pk-numbering/lakh-to-m-std",
    pairLabel: "Lakh to Million",
    fromUnit: "lakh",
    toUnit: "m_std",
    relatedPostSlugs: [
      "digital-data-storage-units-guide"
    ]
  },
  {
    guideSlug: "binary-hex-ieee-754-guide",
    title: "Binary, Hex & IEEE-754 Float Guide",
    categoryId: "number-base",
    categoryName: "Number Base",
    categoryPath: "/convert/number-base",
    pairSlug: "bin-to-dec",
    pairPath: "/convert/number-base/bin-to-dec",
    pairLabel: "Binary to Decimal",
    fromUnit: "bin_radix",
    toUnit: "hex_radix",
    relatedPostSlugs: [
      "digital-data-storage-units-guide"
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
function parsePairQueryVal(rawVal) {
  if (!rawVal) return "1";
  const trimmed = rawVal.trim();
  if (!trimmed) return "1";
  if (/^0[xXoObB]/.test(trimmed)) return "1";
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(trimmed)) return "1";
  const parsed = Number(trimmed);
  if (isNaN(parsed) || !isFinite(parsed)) return "1";
  if (Math.abs(parsed) > 1e100 || parsed !== 0 && Math.abs(parsed) < 1e-100) return "1";
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

// src/engine/guideContent.ts
var guideContent = {
  "cups-to-grams": {
    title: "Cups to Grams Converter \u2014 Volume to Weight Baking Guide",
    metaDesc: "Convert cups to grams with density formula m = V \xD7 \u03C1. Free baking converter with flour, sugar, butter lookup table, step-by-step guide and kitchen FAQ.",
    h1: "Cups to Grams Converter (cups \u2192 g)",
    slug: "cups-to-grams",
    intro: "Converting cups to grams is the single most common challenge in international baking. Unlike water where 1 mL equals 1 gram, dry ingredients like flour, sugar, and cocoa have vastly different bulk densities. A cup of all-purpose flour weighs approximately 125 grams, while a cup of granulated sugar weighs 200 grams, based on USDA FoodData Central / King Arthur Baking ingredient weights. Professional pastry chefs always weigh dry ingredients on a digital scale to eliminate the 20% error inherent in measuring volume.",
    formula: "g = cups \xD7 236.588 \xD7 density (g/mL)",
    table: [
      { from: 0.25, to: "31.25 g (flour) / 50 g (sugar)", rounded: "31 g / 50 g" },
      { from: 0.33, to: "41.25 g (flour) / 66 g (sugar)", rounded: "41 g / 66 g" },
      { from: 0.5, to: "62.5 g (flour) / 100 g (sugar)", rounded: "63 g / 100 g" },
      { from: 0.67, to: "83.75 g (flour) / 134 g (sugar)", rounded: "84 g / 134 g" },
      { from: 0.75, to: "93.75 g (flour) / 150 g (sugar)", rounded: "94 g / 150 g" },
      { from: 1, to: "125 g (flour) / 200 g (sugar)", rounded: "125 g / 200 g" },
      { from: 1.5, to: "187.5 g (flour) / 300 g (sugar)", rounded: "188 g / 300 g" },
      { from: 2, to: "250 g (flour) / 400 g (sugar)", rounded: "250 g / 400 g" },
      { from: 2.5, to: "312.5 g (flour) / 500 g (sugar)", rounded: "313 g / 500 g" },
      { from: 3, to: "375 g (flour) / 600 g (sugar)", rounded: "375 g / 600 g" },
      { from: 4, to: "500 g (flour) / 800 g (sugar)", rounded: "500 g / 800 g" }
    ],
    steps: [
      "Identify the specific baking ingredient (e.g. all-purpose flour, granulated sugar, butter)",
      "Look up the substance density or standard cup weight from USDA FoodData Central / King Arthur Baking ingredient weights (flour = 125 g/cup, sugar = 200 g/cup, butter = 227 g/cup)",
      "Multiply the number of cups by the ingredient unit weight in grams",
      "Weigh your ingredient directly on a tared digital kitchen scale for accuracy"
    ],
    examples: [
      "1 cup of all-purpose flour = 125 grams (spooned and leveled, not scooped)",
      "1 cup of granulated sugar = 200 grams (white table sugar)",
      "1 cup of unsalted butter = 227 grams (2 standard US sticks)",
      "1 cup of brown sugar (packed) = 220 grams",
      "1 cup of water or milk = 237 grams (liquid density ~1.0 g/mL)"
    ],
    faq: [
      { q: "How many grams is 1 cup of flour?", a: "One US legal cup of all-purpose flour weighs approximately 125 grams when spooned into the cup and leveled with a knife (source: USDA FoodData Central / King Arthur Baking ingredient weights). Scooping directly from the bag can compress flour to 140\u2013150 grams." },
      { q: "How many grams is 1 cup of sugar?", a: "One cup of granulated white sugar weighs exactly 200 grams (source: USDA FoodData Central / King Arthur Baking ingredient weights). One cup of powdered confectioners sugar weighs about 120 grams." },
      { q: "Why do European recipes use grams instead of cups?", a: "European culinary schools and domestic recipes use weight (grams) because it is immune to settling, sifting, and humidity variations, guaranteeing reproducible pastry results." },
      { q: "Is a US cup the same as a metric cup?", a: "A US legal cup is 240 mL, a US customary cup is 236.588 mL, and a metric cup (used in Australia and New Zealand) is exactly 250 mL." }
    ],
    relatedGuides: [
      { label: "Lakh & Crore to Million & Billion Converter", slug: "lakh-crore-to-million-billion" },
      { label: "Binary & IEEE-754 Float Guide", slug: "binary-hex-ieee-754-guide" }
    ],
    relatedCat: "cooking",
    source: "USDA FoodData Central / King Arthur Baking ingredient weights"
  },
  "lakh-crore-to-million-billion": {
    title: "Lakh & Crore to Million & Billion Converter Guide (2,2,3 Grouping)",
    metaDesc: "Convert Lakh and Crore to Millions and Billions. Learn the South Asian 2,2,3 comma system: 1 Lakh = 100,000 (0.1M), 1 Crore = 10 Million, 1 Arab = 1 Billion.",
    h1: "Lakh & Crore to Million & Billion Converter Guide (2,2,3 Grouping)",
    slug: "lakh-crore-to-million-billion",
    intro: "Financial reporting and commerce in Pakistan, India, Bangladesh, and Nepal use the South Asian numbering system consisting of Hazar (1,000), Lakh (100,000), Crore (10,000,000), Arab (1,000,000,000), and Kharab (100,000,000,000). While the international system places commas every 3 digits (1,000,000 = 1 Million), the South Asian system places the first comma after 3 digits, followed by commas every 2 digits (10,00,000 = 10 Lakh = 1 Million). Understanding this mapping is essential for real estate, banking, macroeconomic budgets, and multinational corporate accounting.",
    formula: "Million = Crore \xD7 10 | Lakh = Million \xD7 10 | Billion = Arab \xD7 1",
    table: [
      { from: 1, to: "100,000 (0.10 M)", rounded: "1 Lakh" },
      { from: 5, to: "500,000 (0.50 M)", rounded: "5 Lakh" },
      { from: 10, to: "1,000,000 (1.00 M)", rounded: "10 Lakh (1 Million)" },
      { from: 50, to: "5,000,000 (5.00 M)", rounded: "50 Lakh (5 Million)" },
      { from: 100, to: "10,000,000 (10.00 M)", rounded: "1 Crore (10 Million)" },
      { from: 500, to: "50,000,000 (50.00 M)", rounded: "5 Crore (50 Million)" },
      { from: 1e3, to: "100,000,000 (100.00 M)", rounded: "10 Crore (100 Million)" },
      { from: 1e4, to: "1,000,000,000 (1.00 B)", rounded: "1 Arab (1 Billion)" }
    ],
    steps: [
      "To convert Lakhs to Millions: divide by 10 (e.g. 50 Lakh = 50 \xF7 10 = 5 Million)",
      "To convert Millions to Lakhs: multiply by 10 (e.g. 2.5 Million = 2.5 \xD7 10 = 25 Lakhs)",
      "To convert Crores to Millions: multiply by 10 (e.g. 3 Crore = 3 \xD7 10 = 30 Million)",
      "To convert Millions to Crores: divide by 10 (e.g. 45 Million = 45 \xF7 10 = 4.5 Crore)"
    ],
    examples: [
      "PKR 25 Lakh property = PKR 2,500,000 = 2.5 Million PKR",
      "PKR 1.5 Crore house = PKR 15,000,000 = 15 Million PKR",
      "PKR 1 Arab federal project = PKR 1,000,000,000 = 1 Billion PKR",
      "PKR 2.5 Kharab national budget allocation = PKR 250 Billion"
    ],
    faq: [
      { q: "How many Millions are in 1 Crore?", a: "One Crore equals exactly 10 Million. Therefore, 10 Crores equal 100 Million, and 100 Crores equal 1 Billion (1 Arab)." },
      { q: "How does comma placement differ in South Asian numbers?", a: "The international system groups digits in triplets (1,000,000). The South Asian system places the first comma after three digits, then subsequent commas after every two digits (10,00,000 = 10 Lakh = 1 Million)." },
      { q: "How many Lakhs make 1 Crore?", a: "One Crore equals exactly 100 Lakhs (100 \xD7 100,000 = 10,000,000)." },
      { q: "What is 1 Arab in international terms?", a: "One Arab equals 1,000,000,000 (100 Crore), which is identical to 1 International Billion." }
    ],
    relatedGuides: [
      { label: "Cups to Grams Cooking Guide", slug: "cups-to-grams" },
      { label: "Binary & IEEE-754 Float Guide", slug: "binary-hex-ieee-754-guide" }
    ],
    relatedCat: "pk-numbering"
  },
  "binary-hex-ieee-754-guide": {
    title: "Binary, Hexadecimal & IEEE-754 Floating-Point Conversion Guide",
    metaDesc: "Master binary, hexadecimal, and IEEE-754 FP32/FP64 floating-point conversion. Step-by-step bitfield breakdowns: sign bit, biased exponent, and mantissa.",
    h1: "Binary, Hexadecimal & IEEE-754 Floating-Point Conversion Guide",
    slug: "binary-hex-ieee-754-guide",
    intro: "Digital computers store all instructions and data as binary bit sequences (base 2). For human convenience, binary strings are grouped into 4-bit nibbles and written in hexadecimal (base 16). For fractional real numbers, computers implement the IEEE-754 standard, decomposing values into three discrete bitfields: a 1-bit sign, a biased exponent (8 bits for FP32, 11 bits for FP64), and a fractional mantissa (23 bits for FP32, 52 bits for FP64). This guide walks through radix conversions, bit shifting, and floating-point quantization.",
    formula: "FP32 = (-1)^sign \xD7 2^(exponent - 127) \xD7 (1 + mantissa / 2^23)",
    table: [
      { from: 0, to: "0b0000 0000", rounded: "0x00 / FP32: 0x00000000" },
      { from: 1, to: "0b0000 0001", rounded: "0x01 / FP32: 0x3F800000" },
      { from: 2, to: "0b0000 0010", rounded: "0x02 / FP32: 0x40000000" },
      { from: 15, to: "0b0000 1111", rounded: "0x0F / FP32: 0x41700000" },
      { from: 16, to: "0b0001 0000", rounded: "0x10 / FP32: 0x41800000" },
      { from: 127, to: "0b0111 1111", rounded: "0x7F / Exponent Bias" },
      { from: 255, to: "0b1111 1111", rounded: "0xFF / Max Byte" },
      { from: 1024, to: "0b100 0000 0000", rounded: "0x400 / 1 KiB" }
    ],
    steps: [
      "To convert Decimal to Binary: divide by 2 repeatedly and record remainders in reverse order",
      "To convert Binary to Hex: group bits into 4-bit nibbles from right to left and map each 4-bit block to 0-9, A-F",
      "To encode IEEE-754 FP32: set sign bit (0 for positive, 1 for negative), calculate exponent + 127 bias, and encode 23-bit normalized mantissa",
      "Combine Sign (1b) + Exponent (8b) + Mantissa (23b) into 32-bit hexadecimal word"
    ],
    examples: [
      "Decimal 13 to Binary: 13 \xF7 2 = 6 r1, 6 \xF7 2 = 3 r0, 3 \xF7 2 = 1 r1, 1 \xF7 2 = 0 r1 -> 1101 binary",
      "Binary 1101 1010 to Hex: 1101 = 13 (D), 1010 = 10 (A) -> 0xDA hex (218 decimal)",
      "Decimal 1.0 in IEEE-754 FP32: Sign 0, Exp 127 (01111111), Mantissa 0 -> 0x3F800000",
      "Decimal -2.5 in IEEE-754 FP32: -1.01 \xD7 2^1 -> Sign 1, Exp 128 (10000000), Mantissa 0100... -> 0xC0200000"
    ],
    faq: [
      { q: "How many binary bits correspond to one hexadecimal digit?", a: "Exactly 4 binary bits (one nibble) correspond to one hexadecimal digit. For example, binary 1111 is hex F (15 decimal)." },
      { q: "What is the IEEE-754 single precision structure?", a: "FP32 consists of 32 bits: 1 sign bit, 8 exponent bits (with bias 127), and 23 fraction/mantissa bits, providing ~7 decimal digits of precision." },
      { q: "Why do floating point calculations have rounding errors?", a: "Many decimal fractions like 0.1 cannot be represented as finite terminating fractions in binary base 2, just as 1/3 cannot terminate in base 10." },
      { q: "What is the difference between FP16, FP32, and FP64?", a: "FP16 (half precision) uses 16 bits (1-5-10) for machine learning; FP32 (single precision) uses 32 bits (1-8-23) for 3D graphics and general computing; FP64 (double precision) uses 64 bits (1-11-52) for scientific and financial calculations." }
    ],
    relatedGuides: [
      { label: "Cups to Grams Cooking Guide", slug: "cups-to-grams" },
      { label: "Lakh & Crore to Million & Billion Converter", slug: "lakh-crore-to-million-billion" }
    ],
    relatedCat: "number-base"
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
  defaultTitle: "Omega X Converter \u2014 Universal Unit Calculator",
  defaultDescription: "Free universal unit converter platform with 28 categories, 220+ units, formula charts, and offline PWA support.",
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
  const digits = Math.max(1, Math.min(100, sigFigs >= 1 ? Math.floor(sigFigs) : 14));
  return Number(value.toPrecision(digits));
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
  "acceleration:gal": "Gal",
  "typography:px": "px",
  "typography:pt": "pt",
  "typography:pica": "pc",
  "typography:rem": "rem",
  "typography:em": "em",
  "typography:mm": "mm",
  "typography:cm": "cm",
  "typography:in": "in"
};
var SYMBOLS = {
  angstrom: "\xC5",
  pm: "pm",
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
  yd3: "yd\xB3",
  cm3: "cm\xB3",
  impgal: "gal (UK)",
  imppt: "pt (UK)",
  impfloz: "fl oz (UK)",
  floz: "fl oz",
  floz_c: "fl oz",
  cup_c: "cup",
  tbsp_c: "tbsp",
  tsp_c: "tsp",
  mL_c: "mL",
  stick_c: "stick",
  jigger: "jigger",
  stone: "st",
  R: "\xB0R",
  Re: "\xB0R\xE9",
  ozt: "oz t",
  lbt: "lb t",
  slug: "slug",
  dwt: "dwt",
  q: "q",
  fathom: "fath",
  mil: "mil",
  pt: "pt",
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
  lbin: "lb\xB7in",
  ozin: "oz\xB7in",
  kgfm: "kgf\xB7m",
  Ncm: "N\xB7cm",
  Nmm: "N\xB7mm",
  ps: "PS",
  tr: "TR",
  GW: "GW",
  hPa: "hPa",
  mbar: "mbar",
  inHg: "inHg",
  inH2O: "inH\u2082O",
  ksi: "ksi",
  bpd: "bbl/d",
  Lmin: "L/min",
  gpm: "GPM",
  m3h: "m\xB3/h",
  cfm: "CFM",
  Ls: "L/s",
  m3s: "m\xB3/s",
  nox: "nox",
  lx: "lx",
  fc: "fc",
  ph: "ph",
  cP: "cP",
  mPas: "mPa\xB7s",
  P: "P",
  Pas: "Pa\xB7s",
  lbfts: "lb/(ft\xB7s)",
  pica: "pc",
  rem: "rem",
  KiB: "KiB",
  MiB: "MiB",
  GiB: "GiB",
  TiB: "TiB",
  kmL: "km/L",
  mpgUS: "MPG (US)",
  mpgUK: "MPG (UK)",
  L100km: "L/100km",
  kgm3: "kg/m\xB3",
  gcm3: "g/cm\xB3",
  lbft3: "lb/ft\xB3",
  BTUh: "BTU/h",
  tc: "TC",
  oz_yd2: "oz/yd\xB2",
  momme: "mm",
  au: "AU",
  au_a: "AU",
  ly_a: "ly",
  pc_a: "pc",
  sm: "M\u2609",
  em: "M\u2295",
  ld: "LD",
  sr: "R\u2609",
  er: "R\u2295",
  marla_soc: "marla (soc)",
  marla_cap: "marla (cap)",
  gaz_sq: "sq yd (gaz)",
  maund_pk: "maund (mandi)",
  bin_radix: "bin",
  oct_radix: "oct",
  dec_radix: "dec",
  hex_radix: "hex",
  bcd_code: "BCD",
  gray_code: "Gray",
  twos_comp: "2s-comp",
  dec_real: "real",
  hex_float: "hex float",
  fp16: "FP16",
  fp32: "FP32",
  fp64: "FP64",
  m_std: "Million",
  b_std: "Billion",
  t_std: "Trillion",
  k_std: "Thousand",
  lakh: "lakh",
  crore: "crore",
  arab: "arab",
  kharab: "kharab",
  hazar: "hazar",
  z_score: "z",
  p_val_two: "p-val (2-tail)",
  p_val_one: "p-val (1-tail)",
  dec_odds: "dec odds",
  frac_odds: "frac odds",
  us_moneyline: "moneyline",
  pct_odds: "%",
  csv: "CSV",
  latex_b: "bmatrix",
  latex_p: "pmatrix",
  numpy: "NumPy",
  matlab: "MATLAB",
  json_2d: "JSON 2D",
  dec_std: "dec",
  sci_std: "sci",
  eng_std: "eng",
  sci_micro: "micro",
  sci_nano: "nano",
  sci_pico: "pico",
  ppm: "ppm",
  ppb: "ppb",
  pct: "%",
  hec_gpa4: "CGPA 4.0",
  gpa5: "GPA 5.0",
  matric_fsc1100: "marks (1100)",
  mdcat200: "marks (200)",
  percentage: "%",
  overs_balls: "overs",
  balls: "balls",
  true_overs: "dec overs"
};
var SCOPED_NAMES = {
  "temp:C": "Celsius",
  "temp:F": "Fahrenheit",
  "temp:K": "Kelvin",
  "typography:px": "Pixel",
  "typography:pt": "Point",
  "typography:pica": "Pica",
  "typography:rem": "Root EM",
  "typography:em": "EM",
  "typography:mm": "Millimeter",
  "typography:cm": "Centimeter",
  "typography:in": "Inch"
};
var NAMES = {
  KB: "Kilobyte",
  MB: "Megabyte",
  GB: "Gigabyte",
  TB: "Terabyte",
  PB: "Petabyte",
  KiB: "Kibibyte",
  MiB: "Mebibyte",
  GiB: "Gibibyte",
  TiB: "Tebibyte",
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
  m3: "Cubic Meter",
  in3: "Cubic Inch",
  ft3: "Cubic Foot",
  yd3: "Cubic Yard",
  cm3: "Cubic Centimeter",
  impgal: "Imperial Gallon",
  imppt: "Imperial Pint",
  impfloz: "Imperial Fluid Ounce",
  cL: "Centiliter",
  dL: "Deciliter",
  ozt: "Troy Ounce",
  lbt: "Troy Pound",
  q: "Metric Quintal",
  slug: "Slug",
  dwt: "Pennyweight",
  angstrom: "Angstrom",
  pm: "Picometer",
  mil: "Thou / Mil",
  fathom: "Fathom",
  pt: "Point",
  Nm: "Newton-meter",
  lbft: "Pound-foot",
  lbin: "Pound-inch",
  ozin: "Ounce-inch",
  kgfm: "Kilogram-force meter",
  Ncm: "Newton-centimeter",
  Nmm: "Newton-millimeter",
  ps: "Metric Horsepower",
  tr: "Ton of Refrigeration",
  GW: "Gigawatt",
  hPa: "Hectopascal",
  mbar: "Millibar",
  inHg: "Inches of Mercury",
  inH2O: "Inches of Water",
  ksi: "Kilopound per Square Inch",
  bpd: "Barrels per Day",
  Lmin: "Liter per Minute",
  gpm: "Gallon per Minute",
  m3h: "Cubic Meter per Hour",
  cfm: "Cubic Feet per Minute",
  Ls: "Liter per Second",
  m3s: "Cubic Meter per Second",
  nox: "Nox",
  lx: "Lux",
  fc: "Foot-candle",
  ph: "Phot",
  cP: "Centipoise",
  mPas: "Millipascal-second",
  P: "Poise",
  Pas: "Pascal-second",
  lbfts: "Pound per Foot-second",
  pica: "Pica",
  rem: "Root EM",
  stick_c: "Stick of Butter",
  jigger: "Jigger",
  au_a: "Astronomical Unit",
  oz_yd2: "Ounce per Square Yard",
  momme: "Momme Silk",
  marla_soc: "Marla (Society 225 sq ft)",
  marla_cap: "Marla (Capital 250 sq ft)",
  gaz_sq: "Square Yard (Gaz)",
  maund_pk: "Maund (40 kg Mandi)",
  bin_radix: "Binary (Base-2)",
  oct_radix: "Octal (Base-8)",
  dec_radix: "Decimal (Base-10)",
  hex_radix: "Hexadecimal (Base-16)",
  bcd_code: "Binary Coded Decimal",
  gray_code: "Gray Code",
  twos_comp: "Two's Complement",
  dec_real: "Decimal Real",
  hex_float: "Hexadecimal Float",
  fp16: "Half Precision FP16",
  fp32: "Single Precision FP32",
  fp64: "Double Precision FP64",
  m_std: "Million (Standard)",
  b_std: "Billion (Standard)",
  t_std: "Trillion (Standard)",
  k_std: "Thousand (Standard)",
  lakh: "Lakh",
  crore: "Crore",
  arab: "Arab",
  kharab: "Kharab",
  hazar: "Hazar",
  z_score: "Z-Score",
  p_val_two: "Two-Tailed P-Value",
  p_val_one: "One-Tailed P-Value",
  dec_odds: "Decimal Odds",
  frac_odds: "Fractional Odds",
  us_moneyline: "American Moneyline",
  pct_odds: "Probability Percentage",
  csv: "CSV Grid",
  latex_b: "LaTeX bmatrix",
  latex_p: "LaTeX pmatrix",
  numpy: "Python NumPy Array",
  matlab: "MATLAB Matrix",
  json_2d: "JSON 2D Array",
  dec_std: "Standard Decimal",
  sci_std: "Scientific Notation",
  eng_std: "Engineering Notation",
  sci_micro: "Scientific Micro",
  sci_nano: "Scientific Nano",
  sci_pico: "Scientific Pico",
  ppm: "Parts Per Million",
  ppb: "Parts Per Billion",
  pct: "Percentage",
  hec_gpa4: "HEC CGPA (4.00 Scale)",
  gpa5: "5.00 GPA Scale",
  matric_fsc1100: "Matric / FSc Total (1100)",
  mdcat200: "MDCAT Score (200)",
  percentage: "Percentage Marks",
  overs_balls: "Cricket Overs (O.B)",
  balls: "Legal Deliveries (Balls)",
  true_overs: "True Decimal Overs"
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
  test("all 3 guides have valid category relationships in the 36-category registry", () => {
    assert.equal(GUIDE_RELATIONSHIPS.length, 3, "Exactly 3 kept guides must be registered (12 merged/removed)");
    const categoryIds = new Set(Categories.map((c) => c.id));
    for (const rel of GUIDE_RELATIONSHIPS) {
      assert.ok(guideContent[rel.guideSlug], `Guide ${rel.guideSlug} must exist in guideContent`);
      assert.ok(categoryIds.has(rel.categoryId), `Category ${rel.categoryId} must exist in 36-category registry`);
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
  test("category-to-guide lookup resolves matching guides for cooking, pk-numbering, and number-base", () => {
    const cookingGuides = getGuidesForCategory("cooking");
    assert.equal(cookingGuides.length, 1, "Cooking category must have 1 guide (cups-to-grams)");
    assert.ok(cookingGuides.some((g) => g.guideSlug === "cups-to-grams"));
    const pkGuides = getGuidesForCategory("pk-numbering");
    assert.equal(pkGuides.length, 1, "pk-numbering category must have 1 guide (lakh-crore-to-million-billion)");
    assert.ok(pkGuides.some((g) => g.guideSlug === "lakh-crore-to-million-billion"));
    const numberBaseGuides = getGuidesForCategory("number-base");
    assert.equal(numberBaseGuides.length, 1, "number-base category must have 1 guide (binary-hex-ieee-754-guide)");
    assert.ok(numberBaseGuides.some((g) => g.guideSlug === "binary-hex-ieee-754-guide"));
    assert.equal(getGuidesForCategory("length").length, 0);
    assert.equal(getGuidesForCategory("mass").length, 0);
    assert.equal(getGuidesForCategory("temp").length, 0);
  });
  test("pair-to-guide lookup resolves pair relationships for kept guides", () => {
    const cookingGuide = getGuideForPair("cooking", "stick-of-butter-to-tablespoon");
    assert.ok(cookingGuide, "stick-of-butter-to-tablespoon must resolve to a guide");
    assert.equal(cookingGuide.guideSlug, "cups-to-grams");
    const pkGuide = getGuideForPair("pk-numbering", "lakh-to-m-std");
    assert.ok(pkGuide, "lakh-to-m-std must resolve to a guide");
    assert.equal(pkGuide.guideSlug, "lakh-crore-to-million-billion");
    const numBaseGuide = getGuideForPair("number-base", "bin-to-dec");
    assert.ok(numBaseGuide, "bin-to-dec must resolve to a guide");
    assert.equal(numBaseGuide.guideSlug, "binary-hex-ieee-754-guide");
    const kmToMilesGuide = getGuideForPair("length", "meter-to-feet");
    assert.equal(kmToMilesGuide, void 0);
  });
  test("guide-to-blog post relationships reference real blog posts", () => {
    const cookingRel = getGuideRelationship("cups-to-grams");
    assert.ok(cookingRel);
    assert.ok(cookingRel.relatedPostSlugs.includes("ai-powered-unit-conversions-in-2026"));
    const numBaseRel = getGuideRelationship("binary-hex-ieee-754-guide");
    assert.ok(numBaseRel);
    assert.ok(numBaseRel.relatedPostSlugs.includes("digital-data-storage-units-guide"));
  });
  test("prerendered HTML contains contextual internal links on category, pair, and guide pages", () => {
    const cookingCatHtml = fs.readFileSync(path.join(distDir, "convert/cooking.html"), "utf-8");
    assert.ok(cookingCatHtml.includes("/guides/cups-to-grams"), "Cooking category HTML must link to cups-to-grams guide");
    const pairHtml = fs.readFileSync(path.join(distDir, "convert/cooking/stick-of-butter-to-tablespoon.html"), "utf-8");
    assert.ok(pairHtml.includes("/guides/cups-to-grams"), "stick-of-butter-to-tablespoon pair HTML must link to cups-to-grams guide");
    const guideHtml = fs.readFileSync(path.join(distDir, "guides/cups-to-grams.html"), "utf-8");
    assert.ok(guideHtml.includes("/convert/cooking/stick-of-butter-to-tablespoon"), "cups-to-grams guide HTML must link to stick-of-butter-to-tablespoon pair");
    assert.ok(guideHtml.includes("/convert/cooking"), "cups-to-grams guide HTML must link to cooking category");
    assert.ok(guideHtml.includes("/blog/ai-powered-unit-conversions-in-2026"), "cups-to-grams guide HTML must link to related blog article");
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
