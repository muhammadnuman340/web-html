// tests/seo.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs2 from "node:fs";
import path2 from "node:path";

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
      { id: "uF", lb: "Microfarad", r: 1e-6, s: "M" },
      { id: "mA", lb: "Milliampere", r: 1e-3, s: "M" },
      { id: "A", lb: "Ampere", r: 1, s: "M" },
      { id: "V", lb: "Volt", r: 1, s: "M" },
      { id: "ohm", lb: "Ohm", r: 1, s: "M" },
      { id: "C", lb: "Coulomb", r: 1, s: "S" },
      { id: "F", lb: "Farad", r: 1, s: "M" },
      { id: "kV", lb: "Kilovolt", r: 1e3, s: "M" },
      { id: "kohm", lb: "Kilo-ohm", r: 1e3, s: "M" },
      { id: "Mohm", lb: "Mega-ohm", r: 1e6, s: "M" }
    ]
  },
  {
    id: "magnetism",
    lb: "Magnetism",
    ic: "\u{1F9F2}",
    cl: "#e040fb",
    un: [
      { id: "G", lb: "Gauss", r: 1e-4, s: "M" },
      { id: "T", lb: "Tesla", r: 1, s: "M" },
      { id: "Wb", lb: "Weber", r: 1, s: "S" }
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
      { id: "gsm", lb: "GSM (Grams per Sq Meter)", r: 1, s: "O", al: ["gsm", "g/m2"] },
      { id: "oz_yd2", lb: "Ounce per Sq Yard (oz/yd\xB2)", r: 33.9057474, s: "O", al: ["oz/yd2", "oz/sq yd", "osy", "ounce per square yard"] },
      { id: "momme", lb: "Momme Silk (mm)", r: 4.34, s: "O", al: ["momme", "mm silk", "silk momme"] },
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
      { id: "em", lb: "Earth Mass", r: 3003e-9, s: "S" },
      { id: "sm", lb: "Solar Mass", r: 1, s: "S" },
      { id: "au_a", lb: "AU", r: 1, s: "S" },
      { id: "ly_a", lb: "Light Year", r: 63241.1, s: "S" },
      { id: "pc_a", lb: "Parsec", r: 206265, s: "S" }
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
  },
  {
    id: "cricket-overs",
    lb: "Cricket Base-6",
    ic: "\u{1F3CF}",
    cl: "#8bc34a",
    sp: true,
    al: ["cricket overs", "overs to balls", "run rate", "cricket balls", "net run rate", "base 6 overs"],
    un: [
      { id: "overs_balls", lb: "Cricket Overs (e.g. 14.3)", r: 1, s: "O", al: ["overs", "overs.balls"] },
      { id: "true_overs", lb: "True Decimal Overs (14.50)", s: "S", al: ["decimal overs"] },
      { id: "balls", lb: "Legal Deliveries / Balls", s: "S", al: ["balls", "deliveries"] },
      { id: "run_rate_6", lb: "Run Rate Metric (Per 6 Balls)", s: "O", al: ["rr", "run rate"] }
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
function normalizePath(path3 = "") {
  if (!path3 || path3.trim() === "" || path3.trim() === "/") return "/";
  const withoutQuery = path3.trim().split("?")[0].split("#")[0];
  if (!withoutQuery || withoutQuery === "/") return "/";
  const withLeading = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
  const collapsed = withLeading.replace(/\/+/g, "/");
  return collapsed === "/" ? "/" : collapsed.replace(/\/+$/, "");
}
function absoluteUrl(path3 = "") {
  const base = getSiteUrl();
  const normalized = normalizePath(path3);
  return normalized === "/" ? `${base}/` : `${base}${normalized}`;
}
function canonicalUrl(path3 = "") {
  const normalized = normalizePath(path3);
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
function isIndexablePath(path3) {
  const normalized = normalizePath(path3) || "/";
  if (INDEXABILITY_POLICY.noindex.some((p) => normalized === p || normalized.startsWith(`${p}/`))) {
    return false;
  }
  return true;
}

// src/engine/converter.ts
var customCategories = [];
function getAllCategories() {
  return [...Categories, ...customCategories];
}

// scripts/generate-sitemap.ts
import fs from "node:fs";
import path from "node:path";

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
      { from: "Centimeter", to: "Inches", desc: "cm \u2192 in \u2014 product dimensions & body measurements" },
      { from: "Angstrom", to: "Nanometer", desc: "\xC5 \u2192 nm \u2014 crystallography & optics" },
      { from: "Fathom", to: "Foot", desc: "fath \u2192 ft \u2014 nautical depth & marine sounding" },
      { from: "karam", to: "ft", desc: "karam \u2192 ft \u2014 Pakistani revenue pace unit (1 karam = 5.5 feet)" },
      { from: "ft", to: "karam", desc: "ft \u2192 karam \u2014 convert field feet measurements to patwari karams" },
      { from: "girah", to: "in", desc: "girah \u2192 in \u2014 traditional textile & fabric unit (1 girah = 2.25 inches)" },
      { from: "yd", to: "ft", desc: "yd \u2192 ft \u2014 international yard to feet conversion (1 yd = 3 ft)" }
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
      { from: "Metric Ton", to: "US Ton", desc: "t \u2192 ton \u2014 industrial & freight" },
      { from: "Troy Ounce", to: "Gram", desc: "oz t \u2192 g \u2014 gold bullion & precious jewelry trade" },
      { from: "Troy Ounce", to: "Ounce", desc: "oz t \u2192 oz \u2014 precious metal vs avoirdupois weight" },
      { from: "tola", to: "g", desc: "tola \u2192 g \u2014 Pakistani gold bullion & jewelry standard (11.6638 grams)" },
      { from: "g", to: "tola", desc: "g \u2192 tola \u2014 convert grams of gold or silver into tolas" },
      { from: "tola", to: "masha", desc: "tola \u2192 masha \u2014 1 tola equals exactly 12 mashas in bullion trade" },
      { from: "masha", to: "ratti", desc: "masha \u2192 ratti \u2014 1 masha equals 8 traditional rattis" },
      { from: "tola", to: "ozt", desc: "tola \u2192 troy ounce \u2014 Pakistani bullion to international precious metal standard" },
      { from: "maund_pk", to: "kg", desc: "maund (mandi) \u2192 kg \u2014 modern Pakistani mandi trading standard (40 kg)" },
      { from: "kg", to: "maund_pk", desc: "kg \u2192 maund \u2014 convert agricultural grain weights to Pakistani maunds" },
      { from: "seer", to: "kg", desc: "seer \u2192 kg \u2014 1 traditional seer equals 0.9331 kg (16 chhatanks)" }
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
      { from: "Square Kilometers", to: "Square Miles", desc: "km\xB2 \u2192 mi\xB2 \u2014 country & region areas" },
      { from: "marla", to: "ft2", desc: "marla \u2192 sq ft \u2014 standard Pakistani land measurement (272.25 sq ft)" },
      { from: "ft2", to: "marla", desc: "sq ft \u2192 marla \u2014 calculate marlas from plot square footage" },
      { from: "marla_soc", to: "ft2", desc: "marla (society) \u2192 sq ft \u2014 private housing societies standard (225 sq ft)" },
      { from: "marla_cap", to: "ft2", desc: "marla (capital) \u2192 sq ft \u2014 Islamabad / Rawalpindi CDA standard (250 sq ft)" },
      { from: "kanal", to: "marla", desc: "kanal \u2192 marla \u2014 1 kanal equals exactly 20 marlas in revenue records" },
      { from: "marla", to: "kanal", desc: "marla \u2192 kanal \u2014 convert marlas to kanals" },
      { from: "gaz_sq", to: "marla", desc: "square gaz \u2192 marla \u2014 South Asian urban plot measurement to marla" },
      { from: "marla", to: "gaz_sq", desc: "marla \u2192 square gaz \u2014 convert marlas to square yards / gaz" },
      { from: "killa", to: "kanal", desc: "killa / acre \u2192 kanal \u2014 1 agricultural killa equals exactly 8 kanals" },
      { from: "murabba", to: "killa", desc: "murabba \u2192 killa \u2014 1 revenue murabba equals exactly 25 killas / acres" }
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
      { from: "Quarts", to: "Liters", desc: "qt \u2192 L \u2014 kitchen & cooking" },
      { from: "Cubic Yard", to: "Cubic Meter", desc: "yd\xB3 \u2192 m\xB3 \u2014 concrete, earthwork & bulk freight" },
      { from: "Imperial Gallon", to: "Gallon", desc: "gal (UK) \u2192 gal (US) \u2014 transatlantic fuel & fluid comparison" },
      { from: "Liter", to: "Imperial Gallon", desc: "L \u2192 gal (UK) \u2014 UK fuel economy & volume measurement" }
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
      { from: "mmHg", to: "ATM", desc: "mmHg \u2192 atm \u2014 blood pressure & weather" },
      { from: "Hectopascal", to: "Millibar", desc: "hPa \u2192 mbar \u2014 meteorology & barometric pressure" },
      { from: "Inches of Mercury", to: "PSI", desc: "inHg \u2192 psi \u2014 manifold vacuum & aviation altimetry" }
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
      { from: "Horsepower", to: "Watts", desc: "hp \u2192 W \u2014 mechanical power" },
      { from: "Metric Horsepower", to: "Kilowatt", desc: "PS \u2192 kW \u2014 European automotive power ratings" },
      { from: "Ton of Refrigeration", to: "BTU/h", desc: "TR \u2192 BTU/h \u2014 HVAC capacity & chiller sizing" }
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
      { from: "Bits", to: "Bytes", desc: "b \u2192 B \u2014 networking & data transfer" },
      { from: "Gibibyte", to: "Gigabyte", desc: "GiB \u2192 GB \u2014 RAM allocation vs advertised SSD drive capacity" }
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
      { from: "Foot-pound", to: "Newton-meter", desc: "lb-ft \u2192 N\xB7m \u2014 torque wrench calibration and import vehicle service" },
      { from: "Newton-meter", to: "Pound-inch", desc: "N\xB7m \u2192 lb\xB7in \u2014 electronics assembly & bicycle torque" },
      { from: "Pound-foot", to: "Pound-inch", desc: "lb\xB7ft \u2192 lb\xB7in \u2014 automotive fasteners & machinery specs" }
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
      { from: "Fluid Ounce", to: "Milliliter", desc: "fl oz \u2192 mL \u2014 liquid measuring cups (1 fl oz \u2248 29.57 mL)" },
      { from: "Stick of Butter", to: "Tablespoon", desc: "stick \u2192 tbsp \u2014 baking & culinary recipe measurement" }
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
  },
  flow: {
    title: "Flow Rate Converter \u2014 GPM, CFM, L/min, m\xB3/s & Discharge Units",
    metaDesc: "Precision flow rate converter for HVAC, plumbing, hydrology, and process engineering. Convert between GPM, CFM, L/min, m\xB3/h, L/s, and m\xB3/s with NIST SP 811 accuracy.",
    h1: "Volumetric Flow Rate & Fluid Dynamics Converter",
    intro: "Convert volumetric flow rate and discharge across metric, US customary, and imperial engineering units. Seamlessly calculate between Gallons per Minute (GPM), Cubic Feet per Minute (CFM), Liters per Minute (L/min), Cubic Meters per Hour (m\xB3/h), and SI base cubic meters per second (m\xB3/s) for HVAC duct sizing, plumbing calculations, hydraulics, and environmental hydrology.",
    popularPairs: [
      { from: "Gallon per Minute", to: "Liter per Minute", desc: "GPM \u2192 L/min \u2014 plumbing fixtures & hydraulic flow" },
      { from: "Cubic Feet per Minute", to: "Liter per Second", desc: "CFM \u2192 L/s \u2014 HVAC airflow & ventilation sizing" },
      { from: "Cubic Meter per Hour", to: "Gallon per Minute", desc: "m\xB3/h \u2192 GPM \u2014 industrial pumping & municipal water systems" }
    ],
    useCases: ["HVAC & ventilation engineering (CFM\u2194L/s)", "Plumbing & irrigation design (GPM\u2194L/min)", "Industrial pump specification (m\xB3/h\u2194GPM)", "Hydrology & open channel flow (m\xB3/s)", "Petroleum production & pipeline transport (bpd)"],
    formula: "1 US GPM = 3.785411784 L/min. 1 CFM = 0.4719474432 L/s. 1 m\xB3/h = 4.40286754 GPM. 1 m\xB3/s = 1,000 L/s = 15,850.323 GPM.",
    faq: [
      { q: "How do I convert GPM to liters per minute?", a: "Multiply Gallons per Minute (US) by 3.785411784 to obtain Liters per Minute (L/min). For example, a 5 GPM shower fixture delivers approximately 18.93 L/min." },
      { q: "What is the relationship between CFM and L/s in HVAC airflow?", a: "One Cubic Foot per Minute (CFM) equals exactly 0.028316846592 m\xB3/min, which converts to approximately 0.471947 L/s. To convert CFM to L/s, multiply CFM by 0.471947." },
      { q: "How many gallons per minute are in 1 cubic meter per hour?", a: "One cubic meter per hour (m\xB3/h) equals approximately 4.4028675 US Gallons per Minute (GPM). Multiply m\xB3/h by 4.4028675 to calculate GPM." }
    ]
  },
  illuminance: {
    title: "Illuminance Converter \u2014 Lux, Foot-candles, Nox & Phot",
    metaDesc: "Convert illuminance and luminous flux density between Lux (lx), Foot-candles (fc), Phot (ph), and Nox. Standardized for lighting design, OSHA compliance, and photography.",
    h1: "Illuminance & Lighting Design Converter",
    intro: "Convert luminous flux incident on a surface across SI metric and imperial lighting standards. Accurately translate between Lux (lumens per square meter, lx), Foot-candles (lumens per square foot, fc), Phot (ph), and Nox according to CIE (International Commission on Illumination) standards for architectural lighting, workspace safety, greenhouse horticulture, and cinematography.",
    popularPairs: [
      { from: "Foot-candle", to: "Lux", desc: "fc \u2192 lx \u2014 architectural lighting & workplace safety" },
      { from: "Lux", to: "Foot-candle", desc: "lx \u2192 fc \u2014 commercial lighting fixtures & cinematography" }
    ],
    useCases: ["Architectural lighting design (fc\u2194lx)", "Workplace safety & OSHA compliance (fc)", "Commercial greenhouse horticulture (lx)", "Cinematography & photography exposure (fc\u2194lx)", "Street and tunnel illumination engineering (lx)"],
    formula: "1 Foot-candle = exactly 1 lumen/ft\xB2 \u2248 10.7639104 Lux. 1 Lux = 1 lumen/m\xB2 \u2248 0.09290304 Foot-candles. 1 Phot = 10,000 Lux.",
    faq: [
      { q: "How do you convert foot-candles to lux?", a: "Multiply the illuminance in foot-candles by 10.76391 to calculate lux. For example, a standard 50 fc office desk illumination equals approximately 538.2 lx." },
      { q: "What is the difference between lux and foot-candles?", a: "Both measure luminous flux per unit area: Lux is metric (1 lumen per square meter), while Foot-candle is imperial (1 lumen per square foot). Because 1 square meter is approximately 10.764 square feet, 1 foot-candle equals roughly 10.764 lux." },
      { q: "What is the recommended lux level for office work?", a: "Standard commercial office and computer workstations typically require 300 to 500 lux (approx. 28 to 46 foot-candles) according to IESNA and OSHA guidelines." }
    ]
  },
  viscosity: {
    title: "Viscosity Converter \u2014 Centipoise, Pascal-seconds, Poise & mPa\xB7s",
    metaDesc: "Dynamic viscosity converter for chemical engineering, lubrication, and fluid mechanics. Convert Centipoise (cP), Pascal-seconds (Pa\xB7s), Poise (P), and mPa\xB7s accurately.",
    h1: "Dynamic Viscosity & Fluid Mechanics Converter",
    intro: "Calculate dynamic fluid viscosity across international scientific and engineering units. Convert seamlessly between Centipoise (cP), Pascal-seconds (Pa\xB7s), Millipascal-seconds (mPa\xB7s), Poise (P), and imperial pound per foot-second according to ISO 3104 and ASTM D445 standards for lubricant formulation, polymer rheology, petroleum refining, and chemical processing.",
    popularPairs: [
      { from: "Centipoise", to: "Pascal-second", desc: "cP \u2192 Pa\xB7s \u2014 chemical process engineering & fluid mechanics" },
      { from: "Centipoise", to: "Millipascal-second", desc: "cP \u2192 mPa\xB7s \u2014 1:1 direct scientific unit equivalence" }
    ],
    useCases: ["Lubrication & automotive motor oil grades (cP\u2194mPa\xB7s)", "Chemical process engineering (cP\u2194Pa\xB7s)", "Food & beverage rheology (honey, syrups, dairy)", "Paints, inks & polymer coatings manufacturing", "Petroleum pipeline hydraulics & crude oil transport"],
    formula: "1 Centipoise (cP) = 1 Millipascal-second (mPa\xB7s) = 0.001 Pascal-second (Pa\xB7s). 1 Poise (P) = 100 cP = 0.1 Pa\xB7s. 1 Pa\xB7s = 1,000 cP.",
    faq: [
      { q: "Is 1 centipoise equal to 1 millipascal-second?", a: "Yes, exactly 1 Centipoise (cP) equals 1 Millipascal-second (mPa\xB7s). Centipoise is the CGS unit, while mPa\xB7s is the SI metric coherent derived unit. Both represent 0.001 Pascal-second (Pa\xB7s)." },
      { q: "How do you convert centipoise to Pascal-seconds?", a: "Divide centipoise by 1,000 (or multiply by 0.001) to obtain Pascal-seconds. For example, water at 20 \xB0C has a viscosity of approximately 1.002 cP, which equals 0.001002 Pa\xB7s." },
      { q: "What is the viscosity of common fluids?", a: "Water at 20 \xB0C is ~1 cP; olive oil is ~80 cP; motor oil SAE 30 is ~200 cP; honey is ~10,000 cP; and peanut butter is ~250,000 cP." }
    ]
  },
  "number-base": {
    title: "Number Base Converter \u2014 Binary, Hexadecimal, Octal & Decimal Radix",
    metaDesc: "Convert numbers across Binary (Base 2), Octal (Base 8), Decimal (Base 10), and Hexadecimal (Base 16). Supports Gray code, BCD, and two's complement.",
    h1: "Number Base & Radix Precision Converter",
    intro: "Convert integers between number bases instantly. Supports binary (base 2), octal (base 8), decimal (base 10), hexadecimal (base 16), base 32, base 36, Gray code, and BCD. Designed for computer scientists, embedded firmware engineers, and digital electronics designers.",
    popularPairs: [
      { from: "bin", to: "dec", desc: "bin \u2192 dec \u2014 binary base-2 to decimal base-10 radix conversion" },
      { from: "dec", to: "bin", desc: "dec \u2192 bin \u2014 decimal integer to binary bit sequence" },
      { from: "hex", to: "dec", desc: "hex \u2192 dec \u2014 hexadecimal base-16 to decimal base-10 conversion" },
      { from: "dec", to: "hex", desc: "dec \u2192 hex \u2014 decimal integer to hexadecimal representation" },
      { from: "bin", to: "hex", desc: "bin \u2192 hex \u2014 binary 4-bit nibbles to hexadecimal characters" },
      { from: "hex", to: "bin", desc: "hex \u2192 bin \u2014 hexadecimal characters to 4-bit binary nibbles" },
      { from: "dec", to: "bcd", desc: "dec \u2192 bcd \u2014 decimal integer to 8421 binary-coded decimal" },
      { from: "bin", to: "gray", desc: "bin \u2192 gray \u2014 natural binary to reflected Gray code" }
    ],
    useCases: ["Firmware & embedded systems", "Network subnetting & IP address calculation", "Web colors & RGB/hex mapping", "Computer architecture coursework"],
    formula: "Decimal value = Sum(digit \xD7 base^position). Hexadecimal utilizes digits 0-9 and A-F representing values 10-15.",
    faq: [
      { q: "How do you convert decimal to binary?", a: "Divide the decimal integer by 2 repeatedly and record the remainders in reverse order. For example, 13 \xF7 2 = 6 rem 1, 6 \xF7 2 = 3 rem 0, 3 \xF7 2 = 1 rem 1, 1 \xF7 2 = 0 rem 1. Reading bottom to top gives 1101." },
      { q: "Why is hexadecimal so common in computing?", a: "Each hexadecimal digit represents exactly 4 binary bits (one nibble). Two hexadecimal digits represent exactly 8 bits (one byte), making hex much more compact and human-readable than long binary strings." }
    ]
  },
  "ieee-754": {
    title: "IEEE-754 Floating-Point Converter \u2014 FP16, FP32, FP64 & Hex Float",
    metaDesc: "Interactive IEEE-754 floating point converter. Inspect sign bit, exponent bias, and mantissa precision for FP16, FP32 single, and FP64 double.",
    h1: "IEEE-754 Floating-Point Visualizer & Bitfield Inspector",
    intro: "Analyze IEEE-754 floating point representations. Visualizes the sign bit, biased exponent, and mantissa for 16-bit half precision, 32-bit single precision, and 64-bit double precision. Identifies subnormals, infinities, and NaN.",
    popularPairs: [
      { from: "dec_real", to: "fp32", desc: "real \u2192 fp32 \u2014 decimal real number to 32-bit single precision IEEE-754" },
      { from: "fp32", to: "dec_real", desc: "fp32 \u2192 real \u2014 32-bit single precision bitfield to decimal real" },
      { from: "dec_real", to: "fp64", desc: "real \u2192 fp64 \u2014 decimal real number to 64-bit double precision IEEE-754" },
      { from: "hex_float", to: "fp32", desc: "0x hex \u2192 fp32 \u2014 hexadecimal bit representation to IEEE-754 single float" }
    ],
    useCases: ["Graphics programming & shaders", "Machine learning quantization (FP16 / BF16)", "Numerical analysis & rounding error debugging", "Compilers & runtime engineering"],
    formula: "Value = (-1)^sign \xD7 2^(exponent - bias) \xD7 (1 + mantissa). Bias is 127 for FP32 and 1023 for FP64.",
    faq: [
      { q: "What is the IEEE-754 single precision structure?", a: "FP32 consists of 32 bits: 1 sign bit, 8 exponent bits (with bias 127), and 23 fraction/mantissa bits, providing ~7 decimal digits of precision." },
      { q: "Why do floating point calculations have rounding errors?", a: "Many decimal fractions like 0.1 cannot be represented as finite terminating fractions in binary base 2, just as 1/3 cannot terminate in base 10." }
    ]
  },
  "pk-numbering": {
    title: "South Asian Numbering Converter \u2014 Lakh, Crore, Arab & Kharab",
    metaDesc: "Convert between Pakistani & Indian Lakh, Crore, Arab, Kharab and Western Millions, Billions, and Trillions. Free deterministic financial converter.",
    h1: "South Asian & International Numbering System Converter",
    intro: "Convert values seamlessly between the South Asian numbering system (Hazar, Lakh, Crore, Arab, Kharab) and the international system (Thousands, Millions, Billions, Trillions). Follows State Bank of Pakistan financial reporting standards and 2,2,3 comma grouping rules.",
    popularPairs: [
      { from: "lakh", to: "m_std", desc: "lakh \u2192 million \u2014 1 lakh equals 0.1 million (100,000)" },
      { from: "m_std", to: "lakh", desc: "million \u2192 lakh \u2014 1 million equals exactly 10 lakhs (10,00,000)" },
      { from: "crore", to: "m_std", desc: "crore \u2192 million \u2014 1 crore equals exactly 10 million (10,000,000)" },
      { from: "m_std", to: "crore", desc: "million \u2192 crore \u2014 convert international millions to South Asian crores" },
      { from: "arab", to: "b_std", desc: "arab \u2192 billion \u2014 1 arab equals exactly 1 billion (1,000,000,000)" },
      { from: "crore", to: "lakh", desc: "crore \u2192 lakh \u2014 1 crore equals exactly 100 lakhs" },
      { from: "kharab", to: "b_std", desc: "kharab \u2192 billion \u2014 1 kharab equals exactly 100 billion" },
      { from: "hazar", to: "lakh", desc: "hazar \u2192 lakh \u2014 100 hazar equals 1 lakh (100,000)" }
    ],
    useCases: ["Real estate transactions in Pakistan (Lakhs & Crores)", "Government budgets & macroeconomic reporting", "Banking & cross-border financial reconciliation", "Contract drafting & legal property deeds"],
    formula: "1 Lakh = 100,000 (0.1 Million). 1 Crore = 10,000,000 (10 Million). 1 Arab = 1,000,000,000 (1 Billion). 1 Kharab = 100,000,000,000 (100 Billion).",
    faq: [
      { q: "How many Millions are in 1 Crore?", a: "One Crore equals exactly 10 Million. 10 Crores equal 100 Million, and 100 Crores equal 1 Billion (1 Arab)." },
      { q: "How does comma placement differ in South Asian numbers?", a: "The international system groups digits in triplets (1,000,000). The South Asian system places the first comma after three digits, then subsequent commas after every two digits (10,00,000 = 10 Lakh = 1 Million)." }
    ]
  },
  statistics: {
    title: "Statistics & Odds Converter \u2014 Z-Score, P-Value & Betting Odds",
    metaDesc: "Convert between Z-scores, normal percentiles, two-tailed P-values, decimal odds, fractional odds, and American moneyline. Free statistical calculator.",
    h1: "Statistics, Normal Distribution & Betting Odds Converter",
    intro: "Calculate equivalent measures across statistical metrics and sports betting odds. Convert between standard normal Z-scores, percentiles, two-tailed P-values, decimal odds, fractional odds, and American moneyline with exact Gaussian probability formulas.",
    popularPairs: [
      { from: "z_score", to: "percentile", desc: "z-score \u2192 percentile \u2014 standard normal deviation to cumulative probability percentile" },
      { from: "percentile", to: "z_score", desc: "percentile \u2192 z-score \u2014 cumulative distribution percentile to standard normal z-value" },
      { from: "z_score", to: "p_val_two", desc: "z-score \u2192 p-value \u2014 standard normal z to two-tailed significance p-value" },
      { from: "dec_odds", to: "prob_pct", desc: "decimal odds \u2192 prob % \u2014 European decimal odds to implied probability percentage" },
      { from: "frac_odds", to: "prob_pct", desc: "fractional odds \u2192 prob % \u2014 UK fractional odds to implied probability percentage" },
      { from: "us_moneyline", to: "prob_pct", desc: "moneyline \u2192 prob % \u2014 American +/- odds to implied probability percentage" }
    ],
    useCases: ["Academic statistics & hypothesis testing", "Financial risk management & VaR", "Sports analytics & market making", "Psychometrics & standardized test scoring"],
    formula: "Decimal Odds = 1 / Probability. American Moneyline (for p \u2264 0.5) = +((1 - p)/p) \xD7 100. Z = (X - \u03BC) / \u03C3.",
    faq: [
      { q: "How do you convert decimal odds to probability?", a: "Divide 1 by the decimal odds. For example, decimal odds of 2.50 equal 1 / 2.50 = 0.40, or 40% implied probability." },
      { q: "What percentile does a Z-score of 2.0 represent?", a: "A Z-score of +2.0 on a standard normal distribution corresponds to approximately the 97.72 percentile (two standard deviations above the mean)." }
    ]
  },
  "matrix-format": {
    title: "Matrix Format Converter \u2014 CSV, LaTeX, NumPy, MATLAB & JSON",
    metaDesc: "Convert matrix arrays between CSV, LaTeX bmatrix/pmatrix, Python NumPy, MATLAB, and JSON 2D arrays. Instant academic & programming syntax tool.",
    h1: "Matrix Syntax & 2D Numerical Array Converter",
    intro: "Transform 2D numerical matrices between different syntax formats instantly. Supports CSV/TSV grids, LaTeX bmatrix and pmatrix, Python NumPy array declarations, MATLAB/Octave syntax, and nested JSON 2D arrays.",
    popularPairs: [
      { from: "csv", to: "latex_b", desc: "csv \u2192 latex bmatrix \u2014 tabular data to LaTeX bracketed matrix syntax" },
      { from: "csv", to: "numpy", desc: "csv \u2192 numpy \u2014 delimited matrix to Python np.array definition" },
      { from: "matlab", to: "numpy", desc: "matlab \u2192 numpy \u2014 MATLAB bracket array to Python NumPy array" },
      { from: "numpy", to: "latex_b", desc: "numpy \u2192 latex bmatrix \u2014 Python NumPy array to LaTeX bmatrix math" },
      { from: "json_2d", to: "csv", desc: "json 2d \u2192 csv \u2014 nested 2D JSON array to comma-separated values" },
      { from: "csv", to: "latex_p", desc: "csv \u2192 latex pmatrix \u2014 tabular data to LaTeX parenthesized matrix syntax" }
    ],
    useCases: ["Academic paper preparation (LaTeX amsmath)", "Data science pipeline scripting (Python NumPy)", "Engineering calculations (MATLAB / Octave)", "API data interchange (JSON 2D)"],
    formula: "Deterministic syntax formatting preserving rows, columns, decimal points, and brackets.",
    faq: [
      { q: "What is the difference between LaTeX bmatrix and pmatrix?", a: "LaTeX bmatrix renders square brackets [A], whereas pmatrix renders curved parentheses (A). Both are part of the amsmath package." },
      { q: "How does MATLAB represent a 2D matrix?", a: "MATLAB separates columns by spaces or commas and rows by semicolons, e.g., [1 2; 3 4]." }
    ]
  },
  "scientific-notation": {
    title: "Scientific Notation Converter \u2014 Engineering, Decimals, PPM & PPB",
    metaDesc: "Convert numbers between standard decimal, scientific notation (a \xD7 10\u207F), engineering notation, ppm, ppb, and percentages. Instant analytical tool.",
    h1: "Scientific, Engineering & Parts-Per Concentration Converter",
    intro: "Convert values across scientific notation, engineering notation (powers of 3), standard decimals, and parts-per concentration metrics (ppm, ppb, ppt). Essential for chemistry, physics, and electrical engineering.",
    popularPairs: [
      { from: "ppm", to: "pct", desc: "ppm \u2192 % \u2014 parts-per-million to percentage (1% = 10,000 ppm)" },
      { from: "pct", to: "ppm", desc: "% \u2192 ppm \u2014 percentage concentration to parts-per-million" },
      { from: "ppm", to: "ppb", desc: "ppm \u2192 ppb \u2014 parts-per-million to parts-per-billion (1 ppm = 1,000 ppb)" },
      { from: "dec_std", to: "sci_micro", desc: "decimal \u2192 micro \u2014 standard decimal to micro (10\u207B\u2076) scientific prefix" }
    ],
    useCases: ["Environmental monitoring & air quality (ppm/ppb)", "Water quality testing (TDS & lead concentration)", "Electrical engineering (micro/nano/pico units)", "Astronomy & quantum physics calculations"],
    formula: "Scientific notation expresses a number as a \xD7 10^b where 1 \u2264 |a| < 10. 1 ppm = 1 part in 10^6 (0.0001%). 1 ppb = 1 part in 10^9.",
    faq: [
      { q: "How many ppm are in 1 percent?", a: "1 percent equals exactly 10,000 ppm (parts-per-million). To convert percent to ppm, multiply by 10,000." },
      { q: "What is the difference between scientific and engineering notation?", a: "Scientific notation allows any integer exponent (e.g., 4.5 \xD7 10^4), whereas engineering notation restricts exponents to multiples of 3 (e.g., 45 \xD7 10^3), corresponding to SI prefixes like kilo, mega, milli, and micro." }
    ]
  },
  "pk-gpa": {
    title: "HEC GPA & Marks Converter \u2014 CGPA 4.0, 5.0, Percentage & Matric/FSc",
    metaDesc: "Convert Pakistani HEC 4.00 CGPA, 5.00 CGPA, percentage marks, matric/FSc marks (out of 1100/1200), and MDCAT aggregate. Official HEC guidelines.",
    h1: "HEC Pakistan CGPA, Percentage & Academic Marks Converter",
    intro: "Convert academic results according to Higher Education Commission (HEC) Pakistan and PMDC standards. Calculate equivalent CGPA on the 4.00 and 5.00 scales, percentage marks, FSc/Matriculation board marks (out of 1100 and 1200), and medical/engineering aggregate scores.",
    popularPairs: [
      { from: "hec_gpa4", to: "percentage", desc: "hec gpa 4.0 \u2192 % \u2014 Pakistani HEC CGPA to equivalent percentage marks" },
      { from: "percentage", to: "hec_gpa4", desc: "% \u2192 hec gpa 4.0 \u2014 percentage marks to official HEC 4.00 CGPA scale" },
      { from: "gpa5", to: "hec_gpa4", desc: "gpa 5.0 \u2192 hec gpa 4.0 \u2014 5.00 scale CGPA to HEC 4.00 scale conversion" },
      { from: "matric_fsc1100", to: "percentage", desc: "fsc/matric 1100 \u2192 % \u2014 Pakistani Board marks out of 1100 to percentage" }
    ],
    useCases: ["Pakistani university admissions & foreign scholarship applications", "HEC degree attestation and equivalence", "MDCAT / NUMS medical entrance aggregate calculation", "Job recruitment & civil service (CSS) minimum mark verification"],
    formula: "HEC 4.00 continuous model: 85%+ = 4.00; below 85% scales linearly down to 50% = 1.00. Board marks = (Percentage \xF7 100) \xD7 Total Marks (1100 or 1200).",
    faq: [
      { q: "What percentage is a 3.00 CGPA in Pakistan under HEC?", a: "Under standard HEC semester rules, a 3.00 CGPA corresponds to approximately 72% to 74% aggregate marks, representing a strong First Division (B Grade)." },
      { q: "What is the standard MDCAT aggregate formula in Pakistan?", a: "The PMDC formula calculates aggregate as: 50% MDCAT score + 40% FSc Pre-Medical + 10% Matriculation." }
    ]
  },
  "cricket-overs": {
    title: "Cricket Overs to Balls Converter \u2014 Run Rate & ICC Net Run Rate (NRR)",
    metaDesc: "Convert cricket overs (e.g. 14.3) to legal deliveries (balls) and true decimal overs (14.50). Essential for accurate Run Rate & ICC Net Run Rate (NRR).",
    h1: "Cricket Overs (Base-6), Legal Balls & Net Run Rate (NRR) Converter",
    intro: 'Accurately convert cricket overs notation into legal deliveries and true decimal overs. Because cricket uses a base-6 ball count (6 balls per over), writing "14.3 overs" is notation for 14 overs and 3 balls (87 balls), which equals 14.50 true decimal overs for run rate and ICC Net Run Rate (NRR) calculations.',
    popularPairs: [
      { from: "overs_balls", to: "balls", desc: "cricket overs \u2192 balls \u2014 cricket overs notation (e.g. 14.3) to legal deliveries" },
      { from: "overs_balls", to: "true_overs", desc: "cricket overs \u2192 decimal overs \u2014 cricket notation to true decimal overs for run rate" }
    ],
    useCases: ["ICC Tournament Net Run Rate (NRR) calculations", "Live match run rate and required run rate (RRR) analysis", "Bowler economy rate calculation (Runs / True Decimal Overs)", "Cricket database statistics & scorebook bookkeeping"],
    formula: "Total Balls = (Floor(Overs) \xD7 6) + Remainder Balls. True Decimal Overs = Total Balls \xF7 6. Run Rate = Total Runs \xF7 True Decimal Overs.",
    faq: [
      { q: "Why is 14.3 overs not equal to 14.30 decimal overs?", a: 'Cricket overs are recorded in base-6, not base-10. The ".3" means 3 balls out of 6 (3/6 = 0.50). Therefore, 14.3 overs equals exactly 14.50 true decimal overs.' },
      { q: "How does ICC calculate Net Run Rate (NRR)?", a: "NRR = (Total Runs Scored \xF7 Total True Decimal Overs Faced) \u2212 (Total Runs Conceded \xF7 Total True Decimal Overs Bowled). If a team is bowled out before completing their overs, the full quota of overs (e.g., 20 or 50) is used." }
    ]
  },
  typography: {
    title: "Typography & CSS Unit Converter \u2014 Pixels, Points, REM, EM & Picas",
    metaDesc: "Precision typography and digital layout converter. Convert Pixels (px), Points (pt), REM, EM, Millimeters, and Picas using the 96 DPI CSS web standard.",
    h1: "Typography & CSS Layout Scale Converter",
    intro: "Convert font sizes and digital layout dimensions across CSS, print, and screen units. Translate between CSS Pixels (px), Points (pt), Root EM (rem), EM (em), Picas (pc), and Millimeters (mm) based on the W3C CSS Values and Units Module Level 3 standard (96 CSS pixels per inch, 16px root font default).",
    popularPairs: [
      { from: "Pixel", to: "Point", desc: "px \u2192 pt \u2014 web design to print layout translation" },
      { from: "Pixel", to: "Root EM", desc: "px \u2192 rem \u2014 responsive CSS typography & design tokens" }
    ],
    useCases: ["Responsive web development (px\u2194rem)", "UI/UX design systems & Figma tokens (px\u2194pt)", "Print design & desktop publishing (pt\u2194pc, mm)", "Mobile app typography scaling (pt\u2194px)", "Accessible web typography audits"],
    formula: "At 96 DPI: 1 inch = 96 px = 72 pt = 6 picas. Therefore 1 pt = 4/3 px (approx. 1.3333 px). Assuming 16px browser base font: 1 rem = 16 px.",
    faq: [
      { q: "How do you convert pixels to points?", a: "At the standard CSS resolution of 96 DPI, 1 point (1/72 inch) equals 1.33333 pixels (96 \xF7 72). To convert pixels to points, divide pixels by 1.33333 (or multiply by 0.75). For example, 16 px = 12 pt." },
      { q: "How do you convert pixels to rem in CSS?", a: "Divide your pixel value by the root font size (browser default is 16 px). For example, 24 px \xF7 16 = 1.5 rem. 32 px \xF7 16 = 2 rem." },
      { q: "Why is 1 pt equal to 1.333 px in digital design?", a: "Under the W3C CSS standard, 1 physical inch is fixed at exactly 96 CSS pixels and 72 typographical points. Dividing 96 by 72 gives 4/3 or 1.33333 px per point." }
    ]
  }
};

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
      { label: "Feet to Meters Converter", slug: "feet-to-meters" },
      { label: "Kilograms to Pounds Converter", slug: "kg-to-lbs" },
      { label: "Celsius to Fahrenheit Converter", slug: "celsius-to-fahrenheit" }
    ],
    relatedCat: "length"
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
  },
  "cups-to-grams": {
    title: "Cups to Grams Converter \u2014 Volume to Weight Baking Guide",
    metaDesc: "Convert cups to grams with density formula m = V \xD7 \u03C1. Free baking converter with flour, sugar, butter lookup table, step-by-step guide and kitchen FAQ.",
    h1: "Cups to Grams Converter (cups \u2192 g)",
    slug: "cups-to-grams",
    intro: "Converting cups to grams is the single most common challenge in international baking. Unlike water where 1 mL equals 1 gram, dry ingredients like flour, sugar, and cocoa have vastly different bulk densities. A cup of all-purpose flour weighs approximately 125 grams, while a cup of granulated sugar weighs 200 grams. Professional pastry chefs always weigh dry ingredients on a digital scale to eliminate the 20% error inherent in measuring volume.",
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
      "Look up the substance density or standard cup weight (flour = 125 g/cup, sugar = 200 g/cup, butter = 227 g/cup)",
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
      { q: "How many grams is 1 cup of flour?", a: "One US legal cup of all-purpose flour weighs approximately 125 grams when spooned into the cup and leveled with a knife. Scooping directly from the bag can compress flour to 140\u2013150 grams." },
      { q: "How many grams is 1 cup of sugar?", a: "One cup of granulated white sugar weighs exactly 200 grams. One cup of powdered confectioners sugar weighs about 120 grams." },
      { q: "Why do European recipes use grams instead of cups?", a: "European culinary schools and domestic recipes use weight (grams) because it is immune to settling, sifting, and humidity variations, guaranteeing reproducible pastry results." },
      { q: "Is a US cup the same as a metric cup?", a: "A US legal cup is 240 mL, a US customary cup is 236.588 mL, and a metric cup (used in Australia and New Zealand) is exactly 250 mL." }
    ],
    relatedGuides: [
      { label: "Pounds to Kilograms Converter", slug: "lbs-to-kg" },
      { label: "Celsius to Fahrenheit Converter", slug: "celsius-to-fahrenheit" },
      { label: "PSI to Bar Converter", slug: "psi-to-bar" }
    ],
    relatedCat: "cooking"
  },
  "psi-to-bar": {
    title: "PSI to Bar Converter \u2014 Pressure Conversion & Gauge Guide",
    metaDesc: "Convert PSI to bar: 1 psi = 0.0689476 bar (1 bar = 14.5038 psi). Free converter with automotive tire table, gauge vs absolute pressure, and HVAC guide.",
    h1: "PSI to Bar Converter (psi \u2192 bar)",
    slug: "psi-to-bar",
    intro: "Converting PSI (pounds per square inch) to bar is standard in automotive maintenance, HVAC refrigerant servicing, scuba diving, and industrial hydraulics. One bar equals approximately 14.50377 psi, and one psi equals approximately 0.0689476 bar. Understanding whether a pressure reading represents gauge pressure (psig) or absolute pressure (psia) is critical for pneumatic systems and thermodynamic calculations.",
    formula: "bar = psi \xD7 0.06894757",
    table: [
      { from: 10, to: "0.69 bar", rounded: "0.7 bar" },
      { from: 15, to: "1.03 bar", rounded: "1.0 bar" },
      { from: 20, to: "1.38 bar", rounded: "1.4 bar" },
      { from: 25, to: "1.72 bar", rounded: "1.7 bar" },
      { from: 30, to: "2.07 bar", rounded: "2.1 bar" },
      { from: 32, to: "2.21 bar", rounded: "2.2 bar (passenger car tire)" },
      { from: 35, to: "2.41 bar", rounded: "2.4 bar (standard tire)" },
      { from: 40, to: "2.76 bar", rounded: "2.8 bar" },
      { from: 50, to: "3.45 bar", rounded: "3.5 bar" },
      { from: 60, to: "4.14 bar", rounded: "4.1 bar" },
      { from: 80, to: "5.52 bar", rounded: "5.5 bar (bicycle/truck)" },
      { from: 100, to: "6.89 bar", rounded: "6.9 bar (compressor)" },
      { from: 120, to: "8.27 bar", rounded: "8.3 bar" },
      { from: 150, to: "10.34 bar", rounded: "10.3 bar" },
      { from: 200, to: "13.79 bar", rounded: "13.8 bar" }
    ],
    steps: [
      "Take the pressure reading in PSI (pounds per square inch)",
      "Multiply by 0.06894757 (or divide by 14.50377)",
      "Round to 2 decimal places for tires or 4 decimal places for precision hydraulics",
      'Add the "bar" unit label'
    ],
    examples: [
      "32 psi \xD7 0.0689476 = 2.21 bar (recommended cold passenger car tire pressure)",
      "35 psi \xD7 0.0689476 = 2.41 bar (common SUV / crossover tire pressure)",
      "14.7 psi \xD7 0.0689476 = 1.013 bar (standard atmospheric pressure at sea level)",
      "100 psi \xD7 0.0689476 = 6.89 bar (typical workshop air compressor output)"
    ],
    faq: [
      { q: "How do I convert PSI to bar in my head?", a: "Divide the PSI value by 15 for a fast mental estimate. For example, 30 psi \xF7 15 = 2.0 bar (exact answer: 2.07 bar). 45 psi \xF7 15 = 3.0 bar (exact answer: 3.10 bar)." },
      { q: "What is the difference between psig and psia?", a: "psig measures gauge pressure relative to ambient atmosphere (a tire gauge reads 0 psi when disconnected). psia measures absolute pressure including the 14.7 psi atmospheric pressure baseline." },
      { q: "What is 32 PSI in bar?", a: "32 PSI equals approximately 2.21 bar, which is the standard tire pressure recommendation for most compact and midsize sedans." },
      { q: "How many PSI is in 1 bar?", a: "One bar equals exactly 100,000 Pascals (100 kPa), which translates to approximately 14.50377 PSI." }
    ],
    relatedGuides: [
      { label: "Kilowatts to Horsepower Converter", slug: "kw-to-hp" },
      { label: "Meters to Feet Converter", slug: "meters-to-feet" },
      { label: "Cups to Grams Converter", slug: "cups-to-grams" }
    ],
    relatedCat: "pressure"
  },
  "kw-to-hp": {
    title: "Kilowatts to Horsepower Converter \u2014 kW to HP Engine & EV Guide",
    metaDesc: "Convert kW to HP: 1 kW = 1.34102 hp (1 hp = 0.7457 kW). Free power converter with EV battery ratings, metric PS vs imperial HP table, and dyno guide.",
    h1: "Kilowatts to Horsepower Converter (kW \u2192 HP)",
    slug: "kw-to-hp",
    intro: "Converting kilowatts (kW) to horsepower (hp) is essential for comparing electric vehicle (EV) motor outputs with internal combustion engines, industrial pump specifications, and dynamometer tuning results. One kilowatt equals approximately 1.34102 mechanical horsepower (or 1.35962 metric horsepower / PS). Modern electric cars quote motor power in kW internationally, while North American automotive markets still demand horsepower.",
    formula: "hp = kW \xD7 1.341022",
    table: [
      { from: 10, to: "13.41 hp", rounded: "13 hp" },
      { from: 25, to: "33.53 hp", rounded: "34 hp" },
      { from: 50, to: "67.05 hp", rounded: "67 hp" },
      { from: 75, to: "100.58 hp", rounded: "101 hp" },
      { from: 100, to: "134.10 hp", rounded: "134 hp (entry EV)" },
      { from: 150, to: "201.15 hp", rounded: "201 hp (compact EV)" },
      { from: 200, to: "268.20 hp", rounded: "268 hp" },
      { from: 250, to: "335.26 hp", rounded: "335 hp (performance EV)" },
      { from: 300, to: "402.31 hp", rounded: "402 hp" },
      { from: 350, to: "469.36 hp", rounded: "469 hp" },
      { from: 400, to: "536.41 hp", rounded: "536 hp" },
      { from: 500, to: "670.51 hp", rounded: "671 hp (supercar EV)" },
      { from: 750, to: "1005.77 hp", rounded: "1,006 hp (hypercar)" },
      { from: 1e3, to: "1341.02 hp", rounded: "1,341 hp" }
    ],
    steps: [
      "Take the engine or motor power in kilowatts (kW)",
      "Multiply by 1.341022 for mechanical horsepower (US/UK) or by 1.35962 for metric PS (Europe)",
      "Round to the nearest whole horsepower or 1 decimal place",
      'Add the "hp" unit label'
    ],
    examples: [
      "150 kW \xD7 1.34102 = 201.15 hp (standard electric vehicle motor rating)",
      "220 kW \xD7 1.34102 = 295.02 hp (performance electric sedan dual-motor setup)",
      "74.57 kW \xD7 1.34102 = 100.00 hp (exact mechanical horsepower definition)",
      "500 kW \xD7 1.34102 = 670.51 hp (high-performance electric hypercar)"
    ],
    faq: [
      { q: "How do I convert kW to HP in my head?", a: "Multiply kW by 4 and divide by 3 (add one-third). For example, 150 kW \xD7 4/3 = 200 hp (exact answer: 201.15 hp). 300 kW \xD7 4/3 = 400 hp (exact answer: 402.3 hp)." },
      { q: "What is the difference between mechanical HP and metric PS?", a: "Mechanical HP (imperial) is 745.69987 Watts. Metric HP (Pferdest\xE4rke / PS / CV) is 735.49875 Watts. 100 kW is 134.1 imperial hp or 136.0 metric PS." },
      { q: "Why do electric vehicles use kW instead of HP?", a: "Kilowatt is the coherent SI unit for electrical power (Volts \xD7 Amperes \xF7 1000). Battery discharge capacity and charging speeds are quoted in kW and kWh, making kW mathematically consistent across the entire EV powertrain." },
      { q: "How many kW is 300 horsepower?", a: "300 mechanical horsepower equals approximately 223.71 kW (300 \xF7 1.34102)." }
    ],
    relatedGuides: [
      { label: "PSI to Bar Converter", slug: "psi-to-bar" },
      { label: "Pounds to Kilograms Converter", slug: "lbs-to-kg" },
      { label: "Celsius to Fahrenheit Converter", slug: "celsius-to-fahrenheit" }
    ],
    relatedCat: "power"
  },
  "marla-to-square-feet-pakistan": {
    title: "Marla to Square Feet in Pakistan: 272.25 vs 250 vs 225 Sq Ft Standards",
    metaDesc: "Convert Marla to Square Feet across Pakistan: 272.25 sq ft (Patwari / Revenue standard), 250 sq ft (CDA / Rawalpindi), and 225 sq ft (Housing societies / Bahria / DHA).",
    h1: "Marla to Square Feet in Pakistan: 272.25 vs 250 vs 225 Sq Ft Standards",
    slug: "marla-to-square-feet-pakistan",
    intro: "In Pakistani real estate, a Marla does not have a single uniform size across the country. Official Land Revenue records (Patwari / Punjab Board of Revenue) define 1 Marla as 272.25 square feet (9 square karams or 30.25 square yards). However, modern private housing authorities (DHA, Bahria Town, LDA) standardise 1 Marla at 225 square feet, while civic agencies in Islamabad and Rawalpindi (CDA / RDA) commonly benchmark 1 Marla at 250 square feet. This guide provides exact formulas, comparison tables, and boundary verification steps for property buyers and civil engineers.",
    formula: "Revenue: Sq Ft = Marla \xD7 272.25 | CDA: Sq Ft = Marla \xD7 250 | Society: Sq Ft = Marla \xD7 225",
    table: [
      { from: 1, to: "272.25 sq ft (Patwari)", rounded: "225 sq ft (Society)" },
      { from: 2, to: "544.50 sq ft (Patwari)", rounded: "450 sq ft (Society)" },
      { from: 3, to: "816.75 sq ft (Patwari)", rounded: "675 sq ft (Society)" },
      { from: 5, to: "1,361.25 sq ft (Patwari)", rounded: "1,125 sq ft (Society)" },
      { from: 7, to: "1,905.75 sq ft (Patwari)", rounded: "1,575 sq ft (Society)" },
      { from: 10, to: "2,722.50 sq ft (Patwari)", rounded: "2,250 sq ft (Society)" },
      { from: 15, to: "4,083.75 sq ft (Patwari)", rounded: "3,375 sq ft (Society)" },
      { from: 20, to: "5,445.00 sq ft (1 Kanal Std)", rounded: "4,500 sq ft (1 Kanal Soc)" }
    ],
    steps: [
      "Identify your land jurisdiction (Punjab Revenue Record, CDA Islamabad, or Private Housing Scheme like DHA / Bahria)",
      "Select the applicable conversion benchmark: 272.25 sq ft (Revenue), 250 sq ft (Capital), or 225 sq ft (Society)",
      "Multiply the number of marlas by the benchmark square footage",
      "Verify the total square feet against your registered sale deed (Fard / Allotment Letter)"
    ],
    examples: [
      "5 Marla plot in DHA / Bahria: 5 \xD7 225 = 1,125 sq ft (approx 125 square yards / gaz)",
      "5 Marla plot in Rawalpindi / CDA Sector: 5 \xD7 250 = 1,250 sq ft",
      "5 Marla rural plot under Patwari Revenue Record: 5 \xD7 272.25 = 1,361.25 sq ft",
      "1 Kanal standard property: 20 Marlas \xD7 272.25 = 5,445 sq ft (or 4,500 sq ft in societies)"
    ],
    faq: [
      { q: "Why is a Marla 225 sq ft in some housing societies and 272.25 sq ft in village records?", a: "Under traditional British Indian revenue measurement, 1 Karam equals 5.5 feet (66 inches), and 1 Sarsahi is 1 square Karam (30.25 sq ft). Nine Sarsahis make 1 Marla (9 \xD7 30.25 = 272.25 sq ft). Private urban developers adopted a simplified metric of 25 square yards (25 \xD7 9 = 225 sq ft) to allow neat decimal dimensions (e.g. 25 ft \xD7 45 ft for 5 Marla plots)." },
      { q: "How many square yards (Gaz) is 1 Marla?", a: "In standard revenue records, 1 Marla = 30.25 square yards. In housing societies, 1 Marla = exactly 25 square yards (Gaz)." },
      { q: "How many Marlas are in 1 Kanal?", a: "In all jurisdictions across Pakistan, 1 Kanal equals exactly 20 Marlas." },
      { q: "What is a Sarsahi and how does it relate to a Marla?", a: "A Sarsahi is the foundational land unit in Punjab revenue records. Exactly 9 Sarsahis equal 1 Marla (1 Sarsahi = 30.25 square feet)." }
    ],
    relatedGuides: [
      { label: "Meters to Feet Converter", slug: "meters-to-feet" },
      { label: "Lakh & Crore to Million & Billion Converter", slug: "lakh-crore-to-million-billion" },
      { label: "1 Tola in Grams Bullion Guide", slug: "tola-to-grams-gold-pakistan" }
    ],
    relatedCat: "area"
  },
  "tola-to-grams-gold-pakistan": {
    title: "1 Tola in Grams, Masha & Ratti: Pakistan Gold Bullion Guide",
    metaDesc: "Convert Tola to grams for gold and silver in Pakistan: 1 Tola = 11.6638 grams, 12 Masha, 96 Ratti. Full jewellers pricing formula and 24K to 22K karat calculator.",
    h1: "1 Tola in Grams, Masha & Ratti: Pakistan Gold Bullion Guide",
    slug: "tola-to-grams-gold-pakistan",
    intro: "The Tola is the traditional trading weight for gold bullion, silver, and precious jewelry throughout Pakistan and South Asia. Under the British Indian Standard adopted by the Pakistan Sarafa Association and State Bank of Pakistan, 1 Tola equals exactly 11.6638038 grams (180 troy grains). Furthermore, 1 Tola subdivides into 12 Mashas, and each Masha subdivides into 8 Rattis (meaning 1 Tola = 96 Rattis). This guide details exact mass conversions, bullion calculation rules, and karat deductions for 24K, 22K, and 21K gold.",
    formula: "Grams = Tola \xD7 11.6638038 | Masha = Tola \xD7 12 | Ratti = Tola \xD7 96",
    table: [
      { from: 0.25, to: "2.916 g", rounded: "3 Masha" },
      { from: 0.5, to: "5.832 g", rounded: "6 Masha" },
      { from: 1, to: "11.6638 g", rounded: "12 Masha / 96 Ratti" },
      { from: 2, to: "23.328 g", rounded: "24 Masha" },
      { from: 3, to: "34.991 g", rounded: "36 Masha" },
      { from: 5, to: "58.319 g", rounded: "1 Chhatank" },
      { from: 10, to: "116.638 g", rounded: "10 Tolas (Bar)" },
      { from: 50, to: "583.190 g", rounded: "50 Tolas" },
      { from: 100, to: "1,166.380 g", rounded: "100 Tolas (1.166 kg)" }
    ],
    steps: [
      "Take the weight in Tolas from the bullion certificate or jeweller invoice",
      "Multiply by 11.6638038 to calculate the equivalent mass in metric grams",
      "For karat adjustments: multiply 24K pure bullion rate by 22/24 (0.9167) for 22K jewelry, or 21/24 (0.875) for 21K jewelry",
      "Add jeweller making charges (ujrat) and stone deductions where applicable"
    ],
    examples: [
      "1 Tola 24K pure gold bar = 11.6638 grams of pure 99.99% gold",
      "10 grams into Tolas: 10 \xF7 11.6638 = 0.85735 Tolas (approx 10.29 Mashas)",
      "1 Masha of gold: 11.6638 \xF7 12 = 0.97198 grams",
      "1 Ratti of gold: 11.6638 \xF7 96 = 0.12150 grams"
    ],
    faq: [
      { q: "How many grams are in exactly 1 Tola of gold in Pakistan?", a: "One Tola equals exactly 11.6638038 grams (often rounded by local sarafa bazaars to 11.664 grams)." },
      { q: "How many Mashas and Rattis are in 1 Tola?", a: "There are exactly 12 Mashas in 1 Tola, and 8 Rattis in 1 Masha. Therefore, 1 Tola contains 96 Rattis." },
      { q: "How do you calculate 22K gold price from the 24K Tola rate?", a: "Divide the 24K Tola rate by 24 and multiply by 22 (or multiply by 0.91667). For example, if 24K is PKR 240,000/tola, 22K gold is 240,000 \xD7 (22/24) = PKR 220,000/tola." },
      { q: "What is a Chhatank in mass?", a: "A Chhatank is a traditional mass unit equal to exactly 5 Tolas (58.319 grams). Sixteen Chhatanks equal 1 Seer (933.1 grams)." }
    ],
    relatedGuides: [
      { label: "Pounds to Kilograms Converter", slug: "lbs-to-kg" },
      { label: "Kilograms to Pounds Converter", slug: "kg-to-lbs" },
      { label: "Marla to Square Feet Guide", slug: "marla-to-square-feet-pakistan" }
    ],
    relatedCat: "mass"
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
      { label: "Marla to Square Feet Guide", slug: "marla-to-square-feet-pakistan" },
      { label: "HEC CGPA to Percentage Guide", slug: "hec-cgpa-to-percentage-pakistan" },
      { label: "Binary & IEEE-754 Float Guide", slug: "binary-hex-ieee-754-guide" }
    ],
    relatedCat: "pk-numbering"
  },
  "hec-cgpa-to-percentage-pakistan": {
    title: "HEC CGPA to Percentage & MDCAT Aggregate Formula Guide",
    metaDesc: "Convert Pakistani HEC 4.00 CGPA to Percentage marks and calculate PMDC MDCAT / NUMS aggregate. Official continuous scale conversion guidelines.",
    h1: "HEC CGPA to Percentage & MDCAT Aggregate Formula Guide",
    slug: "hec-cgpa-to-percentage-pakistan",
    intro: "The Higher Education Commission (HEC) of Pakistan standardises university grading on a 4.00 Cumulative Grade Point Average (CGPA) scale. When applying for foreign graduate scholarships, government civil service appointments (CSS/FPSC), or medical colleges, students frequently need to convert between 4.00 CGPA, 5.00 CGPA, and equivalent percentage marks. Additionally, prospective medical students require the PMDC weighted aggregate (50% MDCAT + 40% FSc Pre-Medical + 10% Matriculation). This guide explains the official HEC continuous linear model, division equivalence, and aggregate calculations.",
    formula: "Percentage = ((CGPA - 1.0) / 3.0) \xD7 35 + 50 (for CGPA 1.00 - 4.00, with 4.00 = 85%+)",
    table: [
      { from: 2, to: "61.67%", rounded: "Second Division" },
      { from: 2.5, to: "67.50%", rounded: "Second Division" },
      { from: 2.8, to: "71.00%", rounded: "First Division" },
      { from: 3, to: "73.33%", rounded: "First Division" },
      { from: 3.2, to: "75.67%", rounded: "First Division" },
      { from: 3.5, to: "79.17%", rounded: "First Division (High)" },
      { from: 3.8, to: "82.67%", rounded: "Gold Medal / Honors" },
      { from: 4, to: "85.00%+", rounded: "Distinction / Top" }
    ],
    steps: [
      "Take your official university transcript CGPA on the 4.00 scale",
      "For continuous HEC conversion: Percentage = ((CGPA - 1.0) \xF7 3.0) \xD7 35 + 50",
      "For medical aggregate: Calculate (MDCAT/200 \xD7 50) + (FSc/1100 \xD7 40) + (Matric/1100 \xD7 10)",
      "Sum all weighted components to verify your final admission merit percentage"
    ],
    examples: [
      "CGPA 3.50 on HEC 4.0 scale: ((3.50 - 1.0)/3.0) \xD7 35 + 50 = 79.17% marks",
      "CGPA 3.00 on HEC 4.0 scale: ((3.00 - 1.0)/3.0) \xD7 35 + 50 = 73.33% marks (First Division)",
      "MDCAT Aggregate with 170/200, 1020/1100 FSc, 1000/1100 Matric: 42.5% + 37.09% + 9.09% = 88.68%",
      "Converting 5.0 CGPA scale to 4.0 CGPA: CGPA 4.0 = (CGPA 5.0 \xF7 5.0) \xD7 4.0"
    ],
    faq: [
      { q: "What percentage is a 3.00 CGPA in Pakistan under HEC?", a: "Under standard HEC semester rules, a 3.00 CGPA corresponds to approximately 72% to 74% aggregate marks, representing a strong First Division (B Grade)." },
      { q: "What is the standard PMDC MDCAT aggregate formula?", a: "The PMDC formula calculates aggregate as: 50% MDCAT entrance test score + 40% FSc Pre-Medical board score + 10% Matriculation board score." },
      { q: "Does HEC provide an official formula on degree equivalence certificates?", a: "HEC evaluates semester transcripts using the university-specific grading curve if specified on the reverse of the transcript. In the absence of an institutional curve, the standard continuous formula Percentage = ((CGPA - 1) / 3) \xD7 35 + 50 is applied." },
      { q: "What CGPA is required for First Division in Pakistan?", a: "Under HEC regulations, a CGPA of 2.80 to 3.00 (depending on university grading criteria) or a minimum of 60% marks represents First Division." }
    ],
    relatedGuides: [
      { label: "Lakh & Crore to Million & Billion Converter", slug: "lakh-crore-to-million-billion" },
      { label: "Cricket Overs to Balls & NRR Guide", slug: "cricket-overs-to-balls-nrr" },
      { label: "Binary & IEEE-754 Float Guide", slug: "binary-hex-ieee-754-guide" }
    ],
    relatedCat: "pk-gpa"
  },
  "cricket-overs-to-balls-nrr": {
    title: "Cricket Overs (14.3) to Decimal Overs & ICC Net Run Rate Guide",
    metaDesc: "Convert cricket overs notation (14.3) to legal balls (87) and true decimal overs (14.50). Complete ICC Net Run Rate (NRR) tournament tie-break formula.",
    h1: "Cricket Overs (Base-6) to Decimal Overs & ICC Net Run Rate Guide",
    slug: "cricket-overs-to-balls-nrr",
    intro: 'In cricket, bowling overs are recorded in base-6 notation: "14.3 overs" means 14 complete overs of 6 balls plus 3 additional legal deliveries, totaling 87 balls. Treating "14.3" as a standard decimal number (14.30) is a major mathematical error: 3 balls out of 6 is exactly one-half (0.50), meaning 14.3 overs equals 14.50 true decimal overs. This difference is critical for calculating bowler economy rates, team run rates, and the ICC tournament Net Run Rate (NRR) formula.',
    formula: "Balls = (Floor(Overs) \xD7 6) + Remainder Balls | Decimal Overs = Balls \xF7 6 | NRR = (Runs Scored / Overs Faced) - (Runs Conceded / Overs Bowled)",
    table: [
      { from: 1.1, to: "7 balls", rounded: "1.167 decimal overs" },
      { from: 5.3, to: "33 balls", rounded: "5.500 decimal overs" },
      { from: 10.2, to: "62 balls", rounded: "10.333 decimal overs" },
      { from: 14.3, to: "87 balls", rounded: "14.500 decimal overs" },
      { from: 16.4, to: "100 balls", rounded: "16.667 decimal overs" },
      { from: 19.5, to: "119 balls", rounded: "19.833 decimal overs" },
      { from: 20, to: "120 balls", rounded: "20.000 decimal overs (T20)" },
      { from: 50, to: "300 balls", rounded: "50.000 decimal overs (ODI)" }
    ],
    steps: [
      "Take completed overs (the integer portion before the dot)",
      "Extract remainder deliveries (the digit after the dot: 1 to 5 balls)",
      "Calculate total legal deliveries: (Completed Overs \xD7 6) + Remainder Deliveries",
      "Divide total legal deliveries by 6 to obtain true decimal overs for NRR and Run Rate calculation"
    ],
    examples: [
      "14.3 overs in a T20 match: (14 \xD7 6) + 3 = 87 balls = 87 \xF7 6 = 14.50 true decimal overs",
      "Run rate for 116 runs in 14.3 overs: 116 \xF7 14.50 = 8.00 runs per over (NOT 116 \xF7 14.3 = 8.11)",
      "Bowler bowling 3.4 overs conceding 22 runs: (3 \xD7 6) + 4 = 22 balls = 3.667 overs. Economy = 22 \xF7 3.667 = 6.00",
      "ICC NRR calculation: Team A scores 180 in 20.0 ov (9.00 RR) and concedes 150 in 20.0 ov (7.50 RR) -> NRR = +1.500"
    ],
    faq: [
      { q: "Why is 14.3 overs not equal to 14.30 decimal overs?", a: 'Cricket overs are recorded in base-6, not base-10. The ".3" means 3 balls out of 6 (3/6 = 0.50). Therefore, 14.3 overs equals exactly 14.50 true decimal overs.' },
      { q: "How does ICC calculate Net Run Rate (NRR)?", a: "NRR = (Total Runs Scored \xF7 Total True Decimal Overs Faced) \u2212 (Total Runs Conceded \xF7 Total True Decimal Overs Bowled). If a team is bowled out before completing their overs, the full quota of overs (e.g., 20 or 50) is used." },
      { q: "What happens if a team is all out in 16.2 overs?", a: "For ICC Net Run Rate calculations, if a team is bowled all out before completing their allocated overs, they are charged the full quota (e.g. 20.0 overs in T20 or 50.0 overs in ODIs) as their overs faced." },
      { q: "How do you calculate required run rate (RRR)?", a: "RRR = Runs Required \xF7 True Decimal Remaining Overs. For example, 45 runs needed from 5.3 overs (33 balls = 5.5 overs) = 45 \xF7 5.5 = 8.18 runs per over." }
    ],
    relatedGuides: [
      { label: "HEC CGPA to Percentage Guide", slug: "hec-cgpa-to-percentage-pakistan" },
      { label: "Lakh & Crore to Million & Billion Converter", slug: "lakh-crore-to-million-billion" },
      { label: "Kilowatts to Horsepower Converter", slug: "kw-to-hp" }
    ],
    relatedCat: "cricket-overs"
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
      { label: "Lakh & Crore to Million & Billion Converter", slug: "lakh-crore-to-million-billion" },
      { label: "Cricket Overs to Balls & NRR Guide", slug: "cricket-overs-to-balls-nrr" },
      { label: "HEC CGPA to Percentage Guide", slug: "hec-cgpa-to-percentage-pakistan" }
    ],
    relatedCat: "number-base"
  }
};

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

// scripts/generate-sitemap.ts
function generateSitemapEntries() {
  const entries = [];
  const seenUrls = /* @__PURE__ */ new Set();
  const add = (routePath, priority, changefreq) => {
    if (!isIndexablePath(routePath)) return;
    const canonical = canonicalUrl(routePath);
    if (!seenUrls.has(canonical)) {
      seenUrls.add(canonical);
      entries.push({ loc: canonical, priority, changefreq });
    }
  };
  add("/", "1.0", "daily");
  add("/converter", "0.9", "daily");
  add("/categories", "0.9", "weekly");
  add("/formulas", "0.7", "weekly");
  add("/calculator", "0.7", "daily");
  add("/health", "0.6", "weekly");
  add("/blog", "0.7", "weekly");
  add("/about", "0.6", "monthly");
  add("/sitemap", "0.5", "weekly");
  add("/contact", "0.4", "yearly");
  add("/privacy", "0.3", "yearly");
  add("/terms", "0.3", "yearly");
  const categories = getAllCategories();
  for (const cat of categories) {
    add(`/convert/${cat.id}`, "0.85", "weekly");
  }
  for (const cat of categories) {
    const content = categoryContent[cat.id];
    if (content?.popularPairs) {
      for (const pair of content.popularPairs) {
        const cleanSlug = (s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        const fromSlug = cleanSlug(pair.from);
        const toSlug = cleanSlug(pair.to);
        if (fromSlug && toSlug) {
          const pairParam = `${fromSlug}-to-${toSlug}`;
          add(`/convert/${cat.id}/${pairParam}`, "0.75", "monthly");
        }
      }
    }
  }
  for (const guide of Object.values(guideContent)) {
    if (guide.slug) {
      add(`/guides/${guide.slug}`, "0.8", "monthly");
    }
  }
  for (const post of BLOG_POSTS) {
    if (post.slug) {
      add(`/blog/${post.slug}`, "0.7", "monthly");
    }
  }
  entries.sort((a, b) => a.loc.localeCompare(b.loc));
  return entries;
}
function buildSitemapXml(entries) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(
      (e) => `  <url><loc>${e.loc}</loc><priority>${e.priority}</priority><changefreq>${e.changefreq}</changefreq></url>`
    ),
    "</urlset>",
    ""
  ];
  return lines.join("\n");
}
function buildRobotsTxt() {
  const origin = getSiteUrl();
  return [
    "User-agent: *",
    "Allow: /",
    "",
    "# Prevent crawling of internal infrastructure configuration",
    "Disallow: /_redirects",
    "",
    `Sitemap: ${origin}/sitemap.xml`,
    ""
  ].join("\n");
}
function run() {
  const entries = generateSitemapEntries();
  const xml = buildSitemapXml(entries);
  const cwd = process.cwd();
  const publicPath = path.resolve(cwd, "public/sitemap.xml");
  fs.writeFileSync(publicPath, xml, "utf-8");
  console.log(`\u2705 Updated public/sitemap.xml (${entries.length} URLs)`);
  const robots = buildRobotsTxt();
  const rootRobotsPath = path.resolve(cwd, "robots.txt");
  fs.writeFileSync(rootRobotsPath, robots, "utf-8");
  const publicRobotsPath = path.resolve(cwd, "public/robots.txt");
  fs.writeFileSync(publicRobotsPath, robots, "utf-8");
  console.log(`\u2705 Updated root and public robots.txt`);
  const distDir = path.resolve(cwd, "dist");
  if (fs.existsSync(distDir)) {
    const distPath = path.resolve(distDir, "sitemap.xml");
    fs.writeFileSync(distPath, xml, "utf-8");
    console.log(`\u2705 Updated dist/sitemap.xml (${entries.length} URLs)`);
    const distRobotsPath = path.resolve(distDir, "robots.txt");
    fs.writeFileSync(distRobotsPath, robots, "utf-8");
    console.log(`\u2705 Updated dist/robots.txt`);
  }
}
run();

// src/types/index.ts
var SystemLabels = { M: "Metric", I: "Imperial", S: "Scientific", O: "Other", C: "Custom" };

// tests/seo.test.ts
describe("SEO Architecture: Site Identity & Authoritative Origin", () => {
  it("enforces configured domain as authoritative origin", () => {
    assert.equal(DEFAULT_SITE_URL, getSiteUrl());
    assert.equal(SITE.url, `${getSiteUrl()}/`);
  });
  it("normalizes paths without double slashes or trailing slashes, preserving root /", () => {
    assert.equal(normalizePath(""), "/");
    assert.equal(normalizePath("/"), "/");
    assert.equal(normalizePath("converter"), "/converter");
    assert.equal(normalizePath("/converter/"), "/converter");
    assert.equal(normalizePath("//convert//length//"), "/convert/length");
  });
  it("generates pristine absolute URLs with proper trailing slash on root", () => {
    const origin = getSiteUrl();
    assert.equal(absoluteUrl("/"), `${origin}/`);
    assert.equal(absoluteUrl(""), `${origin}/`);
    assert.equal(absoluteUrl("/converter"), `${origin}/converter`);
    assert.equal(absoluteUrl("categories"), `${origin}/categories`);
  });
});
describe("SEO Architecture: Canonical URL & Alias Resolution", () => {
  it("resolves home to trailing slash origin and static core routes without double slashes", () => {
    const origin = getSiteUrl();
    assert.equal(canonicalUrl("/"), `${origin}/`);
    assert.equal(canonicalUrl(""), `${origin}/`);
    assert.equal(canonicalUrl("/categories"), `${origin}/categories`);
    assert.equal(canonicalUrl("/blog"), `${origin}/blog`);
  });
  it("verifies explicit canonical examples specified in Step 4 specification", () => {
    const origin = getSiteUrl();
    assert.equal(canonicalUrl("/"), `${origin}/`);
    assert.equal(canonicalUrl("/length"), `${origin}/convert/length`);
    assert.equal(canonicalUrl("/length-converter"), `${origin}/convert/length`);
    assert.equal(canonicalUrl("/temperature"), `${origin}/convert/temp`);
    assert.equal(canonicalUrl("/weight"), `${origin}/convert/mass`);
    assert.equal(canonicalUrl("/convert/length/meter-to-feet"), `${origin}/convert/length/meter-to-feet`);
  });
  it("resolves canonical category routes to /convert/:id for all 36 categories", () => {
    const origin = getSiteUrl();
    const categories = getAllCategories();
    assert.equal(categories.length, 36);
    for (const cat of categories) {
      const canonical = canonicalUrl(`/convert/${cat.id}`);
      assert.equal(
        canonical,
        `${origin}/convert/${cat.id}`,
        `Canonical mismatch for category ${cat.id}`
      );
    }
  });
  it("maps legacy aliases and friendly URLs directly to their canonical category destination", () => {
    const origin = getSiteUrl();
    assert.equal(canonicalUrl("/length"), `${origin}/convert/length`);
    assert.equal(canonicalUrl("/length-converter"), `${origin}/convert/length`);
    assert.equal(canonicalUrl("/mass"), `${origin}/convert/mass`);
    assert.equal(canonicalUrl("/mass-converter"), `${origin}/convert/mass`);
    assert.equal(canonicalUrl("/weight"), `${origin}/convert/mass`);
    assert.equal(canonicalUrl("/weight-converter"), `${origin}/convert/mass`);
    assert.equal(canonicalUrl("/temp"), `${origin}/convert/temp`);
    assert.equal(canonicalUrl("/temp-converter"), `${origin}/convert/temp`);
    assert.equal(canonicalUrl("/temperature"), `${origin}/convert/temp`);
    assert.equal(canonicalUrl("/temperature-converter"), `${origin}/convert/temp`);
    assert.equal(canonicalUrl("/data"), `${origin}/convert/data`);
    assert.equal(canonicalUrl("/data-converter"), `${origin}/convert/data`);
    assert.equal(canonicalUrl("/speed"), `${origin}/convert/speed`);
    assert.equal(canonicalUrl("/speed-converter"), `${origin}/convert/speed`);
    assert.equal(canonicalUrl("/datatransfer"), `${origin}/convert/datatransfer`);
    assert.equal(canonicalUrl("/datatransfer-converter"), `${origin}/convert/datatransfer`);
  });
});
describe("SEO Architecture: Indexability & Robots Policy", () => {
  it("correctly classifies public content as indexable", () => {
    assert.equal(isIndexablePath("/"), true);
    assert.equal(isIndexablePath("/converter"), true);
    assert.equal(isIndexablePath("/categories"), true);
    assert.equal(isIndexablePath("/convert/length"), true);
    assert.equal(isIndexablePath("/convert/temp/celsius-to-fahrenheit"), true);
    assert.equal(isIndexablePath("/about"), true);
    assert.equal(isIndexablePath("/formulas"), true);
    assert.equal(isIndexablePath("/blog"), true);
    assert.equal(isIndexablePath("/guides/lbs-to-kg"), true);
  });
  it("strictly excludes local state, user utility, and session routes from indexing", () => {
    assert.equal(isIndexablePath("/dashboard"), false);
    assert.equal(isIndexablePath("/favorites"), false);
    assert.equal(isIndexablePath("/history"), false);
    assert.equal(isIndexablePath("/settings"), false);
    assert.equal(isIndexablePath("/custom-units"), false);
    assert.equal(isIndexablePath("/help"), false);
  });
  it("allows crawling of application pages so noindex, follow can be observed by search engines", () => {
    const robotsPath = path2.resolve(process.cwd(), "public/robots.txt");
    assert.ok(fs2.existsSync(robotsPath), "public/robots.txt must exist");
    const content = fs2.readFileSync(robotsPath, "utf-8");
    assert.ok(content.includes(`Sitemap: ${getSiteUrl()}/sitemap.xml`));
    assert.ok(content.includes("Disallow: /_redirects"));
    assert.ok(!content.includes("Disallow: /dashboard"));
    assert.ok(!content.includes("Disallow: /favorites"));
    assert.ok(!content.includes("Disallow: /history"));
    assert.ok(!content.includes("Disallow: /settings"));
    assert.ok(!content.includes("Disallow: /custom-units"));
  });
});
describe("SEO Architecture: XML Sitemap Generator", () => {
  it("generates a clean, valid XML sitemap with 0 duplicate URLs", () => {
    const entries = generateSitemapEntries();
    assert.ok(entries.length > 50, `Expected at least 50 sitemap entries, got ${entries.length}`);
    const seen = /* @__PURE__ */ new Set();
    for (const e of entries) {
      assert.ok(!seen.has(e.loc), `Duplicate loc found in sitemap: ${e.loc}`);
      seen.add(e.loc);
      assert.ok(
        e.loc.startsWith(`${getSiteUrl()}/`),
        `Loc must begin with authoritative origin with trailing slash: ${e.loc}`
      );
    }
    const xml = buildSitemapXml(entries);
    assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
    assert.ok(xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'));
    assert.ok(xml.trimEnd().endsWith("</urlset>"));
  });
  it("includes all 36 canonical category URLs", () => {
    const entries = generateSitemapEntries();
    const locs = new Set(entries.map((e) => e.loc));
    const categories = getAllCategories();
    for (const cat of categories) {
      const expectedUrl = `${getSiteUrl()}/convert/${cat.id}`;
      assert.ok(locs.has(expectedUrl), `Missing canonical category URL: ${expectedUrl}`);
    }
  });
  it("strictly excludes category aliases from sitemap", () => {
    const entries = generateSitemapEntries();
    const locs = entries.map((e) => e.loc);
    const forbiddenAliases = [
      "/length",
      "/length-converter",
      "/weight-converter",
      "/temperature-converter",
      "/speed-converter",
      "/volume-converter",
      "/area-converter",
      "/time-converter",
      "/pressure-converter",
      "/energy-converter",
      "/power-converter",
      "/fuel-converter",
      "/cooking-converter",
      "/data-converter"
    ];
    for (const alias of forbiddenAliases) {
      const aliasUrl = `${getSiteUrl()}${alias}`;
      assert.ok(
        !locs.includes(aliasUrl),
        `Sitemap must not contain compatibility alias URL: ${aliasUrl}`
      );
    }
  });
  it("strictly excludes noindex utility routes from sitemap", () => {
    const entries = generateSitemapEntries();
    const locs = entries.map((e) => e.loc);
    for (const noindexPath of INDEXABILITY_POLICY.noindex) {
      const noindexUrl = `${getSiteUrl()}${noindexPath}`;
      assert.ok(
        !locs.includes(noindexUrl),
        `Sitemap must not contain noindex URL: ${noindexUrl}`
      );
    }
  });
});
describe("Phase 4 Step 4.3.3: SSG Mathematical Integrity & SI Classification Parity", () => {
  it("prerendered category pages never contain mathematically false cross-dimensional ratios", () => {
    const distConvert = path2.resolve(process.cwd(), "dist/convert");
    if (!fs2.existsSync(distConvert)) return;
    const forbiddenStatements = [
      "1 kV = 1000 A",
      "1 k\u03A9 = 1000 A",
      "1 \xB5F = 0.000001 A",
      "1 M\u2609 = 1 AU",
      "1 M\u2295 = 0.000003 AU",
      "1 tex = 1000 dtex",
      "1 den = 9000 dtex"
    ];
    const checkDir = (dir) => {
      for (const entry of fs2.readdirSync(dir, { withFileTypes: true })) {
        const full = path2.join(dir, entry.name);
        if (entry.isDirectory()) {
          checkDir(full);
        } else if (entry.name.endsWith(".html")) {
          const html = fs2.readFileSync(full, "utf8");
          for (const stmt of forbiddenStatements) {
            assert.ok(
              !html.includes(stmt),
              `Prerendered HTML file ${path2.relative(process.cwd(), full)} contains forbidden false mathematical statement: "${stmt}"`
            );
          }
        }
      }
    };
    checkDir(distConvert);
  });
  it('SystemLabels.S is designated as "Scientific" rather than "SI Base"', () => {
    assert.equal(SystemLabels.S, "Scientific", 'Unit system "S" must be labeled "Scientific"');
  });
});
