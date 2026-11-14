// scripts/generate-llms-full.ts
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
    title: "Textile Fabric Converter \u2014 GSM to oz/yd\xB2 & Fabric Weight",
    metaDesc: "Convert fabric weight and textile density online: Grams per Square Meter (GSM) to Ounces per Square Yard (oz/yd\xB2), momme, and linear mass density.",
    h1: "Textile & Fabric Weight Conversion",
    intro: "Convert textile areal weight and density metrics: Grams per Square Meter (GSM, g/m\xB2) and Ounces per Square Yard (oz/yd\xB2). Essential for fashion designers, apparel manufacturers, garment importers, and fabric sourcing specialists.",
    popularPairs: [
      { from: "GSM", to: "oz", desc: "GSM \u2192 oz/yd\xB2 \u2014 fabric weight for apparel and canvas (1 oz/yd\xB2 \u2248 33.906 GSM)" },
      { from: "oz", to: "GSM", desc: "oz/yd\xB2 \u2192 GSM \u2014 convert US imperial fabric specifications to international metric GSM" }
    ],
    useCases: [
      "T-shirt and hoodie fabric weight specification (180 GSM vs 5.3 oz/yd\xB2)",
      "Denim and canvas fabric rating (10 oz to 14 oz workwear jeans)",
      "Towel and fleece absorbency evaluation (400\u2013600 GSM bath towels)",
      "Silk momme to GSM translation for luxury garment production"
    ],
    formula: "1 oz/yd\xB2 = 33.906 g/m\xB2 (GSM). oz/yd\xB2 = GSM \xF7 33.906, and GSM = oz/yd\xB2 \xD7 33.906.",
    faq: [
      { q: "What does GSM mean in fabric?", a: "GSM stands for Grams per Square Meter (g/m\xB2) and measures the areal density of fabric. Higher GSM indicates heavier, thicker fabric (e.g. 480 GSM heavy fleece vs 150 GSM lightweight t-shirt)." },
      { q: "How do you convert GSM to oz/yd\xB2?", a: "Divide GSM by 33.906 (or multiply by 0.0294935). For example, a 480 GSM heavyweight cotton fleece equals approximately 14.16 oz/yd\xB2." },
      { q: "How do you convert oz/yd\xB2 to GSM?", a: "Multiply ounces per square yard by 33.906. For example, a classic 10 oz/yd\xB2 canvas duck fabric equals approximately 339.06 GSM." }
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
    intro: "Analyze IEEE-754 floating point representations. Visualizes the sign bit, biased exponent, and mantissa for 16-bit half precision, 32-bit single precision, and 64-bit double precision. Identifies subnormals, infinities, and special Not-a-Number representations.",
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
    formula: "Linear grade-band approximation: maps HEC grade-band floors linearly (1.0 = 50%, 4.0 = 85%). Board marks = (Percentage \xF7 100) \xD7 Total Marks (1100 or 1200).",
    faq: [
      { q: "What percentage is a 3.00 CGPA in Pakistan under HEC?", a: "The formula ((CGPA - 1) / 3) \xD7 35 + 50 is an approximation that maps HEC grade-band floors linearly (1.0 = 50%, 4.0 = 85%), giving 73.33% for 3.00 CGPA. HEC has no single nationwide CGPA-to-percentage formula. Many universities use CGPA \xD7 25; others use their own tables. For official use, get a percentage letter from your registrar." },
      { q: "What is the standard MDCAT aggregate formula in Pakistan?", a: "The PMDC formula calculates aggregate as: 50% MDCAT score + 40% FSc Pre-Medical + 10% Matriculation." }
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

// src/engine/converter.ts
var customCategories = [];
function getCategory(id) {
  return Categories.find((c) => c.id === id) || customCategories.find((c) => c.id === id);
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
function convertPkGpa(v, from, to) {
  if (from === to) return cleanFloat(v);
  let pct = v;
  if (from === "percentage" || from === "mdcat_agg") {
    pct = v;
  } else if (from === "hec_gpa4") {
    pct = Math.min(100, Math.max(0, v <= 0 ? 0 : v >= 4 ? 85 : 50 + (v - 1) * (35 / 3)));
  } else if (from === "gpa5") {
    pct = Math.min(100, Math.max(0, v / 5 * 100));
  } else if (from === "matric_fsc1100") {
    pct = v / 1100 * 100;
  } else if (from === "matric_fsc1200") {
    pct = v / 1200 * 100;
  }
  if (to === "percentage" || to === "mdcat_agg") return cleanFloat(pct, 2);
  if (to === "matric_fsc1100") return cleanFloat(pct / 100 * 1100, 1);
  if (to === "matric_fsc1200") return cleanFloat(pct / 100 * 1200, 1);
  if (to === "gpa5") return cleanFloat(pct / 100 * 5, 2);
  if (to === "hec_gpa4") {
    if (pct >= 85) return 4;
    if (pct < 50) return 0;
    return cleanFloat(1 + (pct - 50) * (3 / 35), 2);
  }
  return cleanFloat(pct, 2);
}
function convertStatistics(v, from, to) {
  if (from === to) return cleanFloat(v);
  let p = 0.5;
  if (from === "prob_pct" || from === "percentile") {
    p = Math.min(0.99999, Math.max(1e-5, v / 100));
  } else if (from === "dec_odds") {
    p = v > 1 ? 1 / v : 0.5;
  } else if (from === "frac_odds") {
    p = v > 0 ? 1 / (v + 1) : 0.5;
  } else if (from === "us_moneyline") {
    if (v > 0) p = 100 / (v + 100);
    else if (v < 0) p = Math.abs(v) / (Math.abs(v) + 100);
  } else if (from === "z_score") {
    const t = 1 / (1 + 0.2316419 * Math.abs(v));
    const d = 0.3989423 * Math.exp(-v * v / 2);
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    p = v > 0 ? 1 - prob : prob;
    p = Math.min(0.99999, Math.max(1e-5, p));
  } else if (from === "p_val_two") {
    p = Math.min(0.99999, Math.max(1e-5, 1 - v / 2));
  }
  if (to === "prob_pct") return cleanFloat(p * 100, 2);
  if (to === "percentile") return cleanFloat(p * 100, 2);
  if (to === "dec_odds") return cleanFloat(1 / p, 3);
  if (to === "frac_odds") return cleanFloat((1 - p) / p, 3);
  if (to === "us_moneyline") {
    if (p <= 0.5) return Math.round((1 - p) / p * 100);
    return Math.round(-(p / (1 - p)) * 100);
  }
  if (to === "p_val_two") {
    const tail = p > 0.5 ? 1 - p : p;
    return cleanFloat(2 * tail, 4);
  }
  if (to === "z_score") {
    const q = p > 0.5 ? 1 - p : p;
    const w = Math.sqrt(-2 * Math.log(q));
    const z = w - ((0.010328 * w + 0.802853) * w + 2.515517) / (((1308e-6 * w + 0.189269) * w + 1.432788) * w + 1);
    return cleanFloat(p > 0.5 ? z : -z, 3);
  }
  return cleanFloat(p * 100, 2);
}
function convertNumberBase(v, from, to) {
  if (from === to) return cleanFloat(v);
  let dec = Math.floor(v);
  if (from === "bin") {
    dec = parseInt(String(Math.abs(Math.floor(v))), 2) || 0;
  } else if (from === "oct") {
    dec = parseInt(String(Math.abs(Math.floor(v))), 8) || 0;
  }
  if (to === "dec") return dec;
  if (to === "bin") return parseInt(dec.toString(2), 10) || 0;
  if (to === "oct") return parseInt(dec.toString(8), 10) || 0;
  return dec;
}
function convert(v, catId, fromId, toId) {
  const cat = getCategory(catId);
  if (!cat || v !== 0 && !v || !Number.isFinite(v)) return null;
  if (cat.id === "temp") return convertTemp(v, fromId, toId);
  if (cat.id === "fuel") return convertFuel(v, fromId, toId);
  if (cat.id === "pk-gpa") return convertPkGpa(v, fromId, toId);
  if (cat.id === "statistics") return convertStatistics(v, fromId, toId);
  if (cat.id === "number-base") return convertNumberBase(v, fromId, toId);
  if (cat.id === "ieee-754") return 1;
  if (cat.id === "matrix-format") return 1;
  const fu = getUnit(cat, fromId);
  const tu = getUnit(cat, toId);
  if (!fu || !tu || !fu.r || !tu.r) return null;
  if (fu.dim && tu.dim && fu.dim !== tu.dim) return null;
  return cleanFloat(v * fu.r / tu.r);
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

// src/config/pairEditorial.ts
function cleanSlug(s) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
var PAIR_UNIT_SYNONYMS = {
  // Pakistani & Regional Units
  "marla": "marla",
  "marlas": "marla",
  "standard-marla": "marla",
  "marla-society": "marla_soc",
  "marla-capital": "marla_cap",
  "kanal": "kanal",
  "kanals": "kanal",
  "killa": "killa",
  "murabba": "murabba",
  "gaz": "gaz_sq",
  "square-gaz": "gaz_sq",
  "sarsahi": "sarsahi",
  "tola": "tola",
  "tolas": "tola",
  "masha": "masha",
  "ratti": "ratti",
  "seer": "seer",
  "pao": "pao",
  "chhatank": "chhatank",
  "dhari": "dhari",
  "maund": "maund_pk",
  "mann": "maund_pk",
  "karam": "karam",
  "girah": "girah",
  "marla-soc": "marla_soc",
  "marla-cap": "marla_cap",
  "gaz-sq": "gaz_sq",
  "maund-pk": "maund_pk",
  "dec-real": "dec_real",
  "fp32": "fp32",
  "fp64": "fp64",
  "hex-float": "hex_float",
  "m-std": "m_std",
  "b-std": "b_std",
  "k-std": "k_std",
  "t-std": "t_std",
  "z-score": "z_score",
  "p-val-two": "p_val_two",
  "dec-odds": "dec_odds",
  "frac-odds": "frac_odds",
  "us-moneyline": "us_moneyline",
  "prob-pct": "prob_pct",
  "latex-b": "latex_b",
  "latex-p": "latex_p",
  "json-2d": "json_2d",
  "dec-std": "dec_std",
  "sci-micro": "sci_micro",
  "hec-gpa4": "hec_gpa4",
  "gpa5": "gpa5",
  "matric-fsc1100": "matric_fsc1100",
  "matric-fsc1200": "matric_fsc1200",
  "mdcat-agg": "mdcat_agg",
  "overs-balls": "overs_balls",
  "true-overs": "true_overs",
  "run-rate-6": "run_rate_6",
  "oz-yd2": "oz_yd2",
  "textile:oz": "oz_yd2",
  "textile:oz-yd2": "oz_yd2",
  "textile:gsm": "gsm",
  "momme": "momme",
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
  "pound-foot": "lbft",
  "pound-feet": "lbft",
  "foot-pounds": "lbft",
  "pound-inch": "lbin",
  "pound-inches": "lbin",
  "inch-pound": "lbin",
  "inch-pounds": "lbin",
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
  "gigabyte": "GB",
  "gigabytes": "GB",
  "gibibyte": "GiB",
  "gibibytes": "GiB",
  // Time
  "seconds": "s",
  "minutes": "min",
  "hours": "hr",
  // Curated Pair Slugs & New Units
  "cubic-yard": "yd3",
  "cubic-yards": "yd3",
  "imperial-gallon": "impgal",
  "imperial-gallons": "impgal",
  "troy-ounce": "ozt",
  "troy-ounces": "ozt",
  "angstrom": "angstrom",
  "angstroms": "angstrom",
  "nanometer": "nm",
  "nanometers": "nm",
  "fathom": "fathom",
  "fathoms": "fathom",
  "hectopascal": "hPa",
  "hectopascals": "hPa",
  "millibar": "mbar",
  "millibars": "mbar",
  "inches-of-mercury": "inHg",
  "metric-horsepower": "ps",
  "ton-of-refrigeration": "tr",
  "tons-of-refrigeration": "tr",
  "stick-of-butter": "stick_c",
  "sticks-of-butter": "stick_c",
  "gallon-per-minute": "gpm",
  "gallons-per-minute": "gpm",
  "liter-per-minute": "Lmin",
  "liters-per-minute": "Lmin",
  "cubic-feet-per-minute": "cfm",
  "cubic-foot-per-minute": "cfm",
  "liter-per-second": "Ls",
  "liters-per-second": "Ls",
  "cubic-meter-per-hour": "m3h",
  "cubic-meters-per-hour": "m3h",
  "foot-candle": "fc",
  "foot-candles": "fc",
  "lux": "lx",
  "centipoise": "cP",
  "pascal-second": "Pas",
  "pascal-seconds": "Pas",
  "millipascal-second": "mPas",
  "millipascal-seconds": "mPas",
  "pixel": "px",
  "pixels": "px",
  "point": "pt",
  "points": "pt",
  "root-em": "rem",
  "rem": "rem"
};
function findUnit(cat, raw) {
  const q = raw.trim().toLowerCase();
  const qSpaced = q.replace(/-/g, " ");
  const qUnderscored = q.replace(/-/g, "_");
  const scopedKey = `${cat.id}:${q}`;
  if (PAIR_UNIT_SYNONYMS[scopedKey]) {
    const direct = cat.un.find((u) => u.id.toLowerCase() === PAIR_UNIT_SYNONYMS[scopedKey].toLowerCase());
    if (direct) return direct;
  }
  if (PAIR_UNIT_SYNONYMS[q]) {
    const direct = cat.un.find((u) => u.id.toLowerCase() === PAIR_UNIT_SYNONYMS[q].toLowerCase());
    if (direct) return direct;
  }
  const singularCandidates = [q, qSpaced, qUnderscored];
  if (q.endsWith("ies")) singularCandidates.push(q.slice(0, -3) + "y");
  if (q.endsWith("es")) {
    singularCandidates.push(q.slice(0, -2));
    singularCandidates.push(q.slice(0, -1));
  }
  if (q.endsWith("s")) singularCandidates.push(q.slice(0, -1));
  return cat.un.find((u) => {
    const uid = u.id.toLowerCase();
    const uidHyphen = uid.replace(/_/g, "-");
    const ulb = u.lb.toLowerCase();
    for (const cand of singularCandidates) {
      if (uid === cand || uidHyphen === cand || ulb === cand) return true;
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
  },
  flow: {
    dimension: "volumetric fluid flow rate and discharge per unit time ($L^3/T$)",
    siBase: "cubic meters per second (m\xB3/s)",
    systems: "SI cubic meters per second, metric liters per minute, and US engineering GPM/CFM",
    contextNote: "Standardized under ISO 5167, ASHRAE guidelines for HVAC duct ventilation, and AWWA fluid distribution standards."
  },
  illuminance: {
    dimension: "luminous flux incident on a surface per unit area ($J/L^2$)",
    siBase: "lux (lx = lm/m\xB2)",
    systems: "SI metric lux and imperial foot-candles (lm/ft\xB2)",
    contextNote: "Standardized under CIE (International Commission on Illumination) and IESNA lighting engineering standards (1 fc \u2248 10.76391 lx)."
  },
  viscosity: {
    dimension: "dynamic fluid shear resistance and internal friction ($M / (L \\cdot T)$)",
    siBase: "pascal-second (Pa\xB7s)",
    systems: "SI pascal-seconds (Pa\xB7s), metric millipascal-seconds (mPa\xB7s), and CGS poise/centipoise (cP)",
    contextNote: "Standardized under ISO 3104 and ASTM D445 with 1 cP defined as exactly 1 mPa\xB7s = 0.001 Pa\xB7s."
  },
  typography: {
    dimension: "typographical font sizing, digital screen scaling, and print layout dimensions",
    siBase: "CSS pixel (px, 1/96 inch reference pixel)",
    systems: "W3C CSS standard pixels and root-em (rem), alongside traditional DTP points (pt) and picas",
    contextNote: "Standardized under the W3C CSS Values and Units Module Level 3 where 1 inch is fixed at exactly 96 px and 72 pt (1 pt = 1.33333 px)."
  }
};
var PAIR_FIELD_NOTES = {
  "area:marla-to-ft2": {
    badge: "Regional Metrology Gotcha",
    title: "Punjab Revenue (272.25 sq ft) vs Housing Society (225 sq ft) Marla",
    note: "In Pakistani real estate, private housing societies (DHA, Bahria Town, LDA) measure 1 Marla as exactly 225 sq ft (25 sq yards). However, the Punjab Land Revenue Department, Patwaris, and statutory government registries legally define 1 Marla as 272.25 sq ft (9 square karams). Some authorities use other sizes \u2014 check your deed.",
    standard: "Punjab Land Revenue Act / LDA Manual"
  },
  "marla-to-ft2": {
    badge: "Regional Metrology Gotcha",
    title: "Punjab Revenue (272.25 sq ft) vs Housing Society (225 sq ft) Marla",
    note: "In Pakistani real estate, private housing societies (DHA, Bahria Town, LDA) measure 1 Marla as exactly 225 sq ft (25 sq yards). However, the Punjab Land Revenue Department, Patwaris, and statutory government registries legally define 1 Marla as 272.25 sq ft (9 square karams). Some authorities use other sizes \u2014 check your deed.",
    standard: "Punjab Land Revenue Act / LDA Manual"
  },
  "mass:tola-to-g": {
    badge: "Bullion Standard Gotcha",
    title: "Pakistani Tola (11.6638 g) vs 10-Gram Rates",
    note: "The official Pakistani Tola is defined as 180 troy grains = 11.6638038 grams (180 troy grains British-India standard). However, bullion markets and jewelry associations frequently quote spot gold rates per 10 grams alongside per-tola prices. Ensure you never calculate gold value by treating 1 tola as 10 grams.",
    standard: "180 troy grains (British-India standard)"
  },
  "tola-to-g": {
    badge: "Bullion Standard Gotcha",
    title: "Pakistani Tola (11.6638 g) vs 10-Gram Rates",
    note: "The official Pakistani Tola is defined as 180 troy grains = 11.6638038 grams (180 troy grains British-India standard). However, bullion markets and jewelry associations frequently quote spot gold rates per 10 grams alongside per-tola prices. Ensure you never calculate gold value by treating 1 tola as 10 grams.",
    standard: "180 troy grains (British-India standard)"
  },
  "hec-gpa4-to-percentage": {
    badge: "Academic Grading Note",
    title: "Linear Grade-Band Mapping vs University Formulas",
    note: "The formula Percentage = ((CGPA - 1) / 3) \xD7 35 + 50 is an approximation that maps HEC grade-band floors linearly (1.0 = 50%, 4.0 = 85%). HEC has no single nationwide CGPA-to-percentage formula. Many universities use CGPA \xD7 25; others use their own tables. For official use, get a percentage letter from your registrar."
  },
  "kilowatts-to-horsepower": {
    badge: "EV & Powertrain Metrology",
    title: "Mechanical Horsepower (745.7 W) vs Metric PS (735.5 W)",
    note: "1 kilowatt equals 1.34102 mechanical horsepower (imperial) or 1.35962 metric horsepower (PS). Electric vehicle powertrain specs quote kW internationally, while North American automotive markets use mechanical hp.",
    standard: "SAE J1349 / ISO 1585"
  },
  "fahrenheit-to-celsius": {
    badge: "Thermodynamics & Meteorology",
    title: "Scale Coincidence at -40\xB0 and Offset Subtraction",
    note: "Fahrenheit and Celsius intersect at exactly -40\xB0 (-40\xB0F = -40\xB0C). Converting Fahrenheit requires subtracting the 32\xB0 freezing offset before scaling by 5/9. Absolute zero is -459.67\xB0F or -273.15\xB0C.",
    standard: "BIPM SI Brochure / ITS-90"
  },
  // Mass & Weight
  "troy-ounce-to-gram": {
    badge: "Jeweler & Bullion Advisory",
    title: "Troy Ounce vs Avoirdupois Ounce Discrepancy",
    note: "A Troy Ounce (oz t = 31.1035 g) is approximately 9.7% heavier than a standard US grocery avoirdupois ounce (oz = 28.3495 g). In precious metals trading, mistaking standard ounces for troy ounces leads to significant financial undervaluation.",
    standard: "NIST SP 811 / US Mint Bullion Specifications"
  },
  "troy-ounce-to-ounce": {
    badge: "Precious Metals Standard",
    title: "1 oz t = 1.09714 oz Avoirdupois",
    note: "Because gold and silver are quoted strictly in Troy weight (12 troy ounces per troy pound), never weigh precious metals on conventional grocery scales without applying the 1.09714 multiplier.",
    standard: "BIPM SI Brochure (9th Edition) & LBMA Rules"
  },
  "kilogram-to-pounds": {
    badge: "Aerospace & Medical Protocol",
    title: "Exact Legal Ratio: 1 lb = 0.45359237 kg",
    note: "The international avoirdupois pound is legally defined as exactly 0.45359237 kg. Critical medical dosing and aviation fuel calculations must never round this to 0.45 or 2.2 without accounting for cumulative patient weight errors.",
    standard: "ISO 80000-4 / NIST Handbook 44"
  },
  "pounds-to-kilogram": {
    badge: "Aviation & Clinical Standard",
    title: "Compound Precision: Multiply by 0.45359237",
    note: "Aviation weight-and-balance manifests mandate calculating passenger and cargo payloads to 4 decimal places before computing center-of-gravity moments.",
    standard: "FAA Flight Weight & Balance Handbook"
  },
  // Pressure
  "bar-to-psi": {
    badge: "HVAC & Automotive Engineering",
    title: "Gauge (psig) vs Absolute (psia) Offset",
    note: "Most mechanical tire and pressure gauges measure relative to ambient atmosphere (reading 0 psi at sea level). For thermodynamics, engine boost, and altitude physics, add 14.696 psi (1.01325 bar) to gauge pressure to obtain absolute pressure.",
    standard: "ASME B40.100 / ISO 5167"
  },
  "psi-to-bar": {
    badge: "Pneumatics & Scuba Gotcha",
    title: "Atmospheric Normalization at 1.01325 bar",
    note: "1 standard atmosphere is 1.01325 bar (101.325 kPa), which equals 14.6959 psi. Industrial compressor ratings in bar frequently refer to bar gauge (barg); verify whether your equipment specification requires absolute or differential pressure.",
    standard: "ISO 80000-4 / DIN EN 837"
  },
  "hectopascal-to-millibar": {
    badge: "Meteorology & Altimetry",
    title: "1:1 Identical Equivalence",
    note: "1 hectopascal (hPa) is numerically and physically identical to 1 millibar (mbar = 100 Pa). Aviation altimeter subscale settings (QNH) in Europe use hPa, while marine weather barometers historically use mbar.",
    standard: "WMO Technical Regulations / ICAO Annex 3"
  },
  "inches-of-mercury-to-psi": {
    badge: "Aviation Barometry",
    title: "Standard Altimeter Baseline: 29.92 inHg = 14.696 psi",
    note: "US aircraft altimeters are calibrated to standard atmospheric pressure (29.92 inHg = 1013.25 hPa). Mercury column height varies slightly with ambient temperature, requiring barometric temperature compensation in laboratory manometers.",
    standard: "NIST Monograph 8 / FAA AIM 7-2-1"
  },
  // Cooking
  "stick-of-butter-to-tablespoon": {
    badge: "Culinary Metrology",
    title: "US Customary vs European Butter Blocks",
    note: "In the United States, 1 standard stick of butter is exactly 8 tablespoons (1/2 cup, 4 oz, or ~113.4 grams). In the UK and Europe, butter is sold in 250 g or 500 g solid blocks; 1 European 250 g block is equivalent to roughly 2.2 US sticks.",
    standard: "USDA National Nutrient Database"
  },
  // Length
  "meter-to-feet": {
    badge: "Survey & Architecture Note",
    title: "Deprecation of the US Survey Foot",
    note: "On January 1, 2023, the US National Geodetic Survey and NIST officially deprecated the historical US Survey Foot (1200/3937 m) in favor of the International Foot (0.3048 m exactly). In large-scale GIS and civil survey work, always ensure your coordinate projection matches the 1959 International standard.",
    standard: "Federal Register Notice (85 FR 62698) / NIST SP 811"
  },
  "feet-to-meters": {
    badge: "Civil Engineering Standard",
    title: "Exact Metric Definition: 1 ft = 0.3048 m",
    note: "Because 1 foot is exactly 304.8 millimeters by definition, compounding decimal conversions can be computed without rounding artifacts by dividing feet by 3.280839895 or multiplying by 0.3048.",
    standard: "1959 International Yard and Pound Agreement"
  },
  "angstrom-to-nanometer": {
    badge: "Semiconductor & Crystallography",
    title: "1 \xC5 = 0.1 nm = 100 pm",
    note: "The \xC5ngstr\xF6m is non-SI but universally employed in X-ray crystallography and optical coatings because chemical bond lengths and atomic radii range between 1 and 2 \xC5ngstr\xF6ms.",
    standard: "IUCr International Tables for Crystallography"
  },
  "fathom-to-foot": {
    badge: "Nautical Hydrography",
    title: "Traditional Depth Measure: 1 fathom = 6 ft",
    note: "1 fathom equals exactly 6 feet (1.8288 m), originally defined as the span of an adult sailor's outstretched arms. Modern bathymetric charts predominantly use meters, but nautical paper charts in US waters still report fathom depths.",
    standard: "NOAA Office of Coast Survey Standards"
  },
  // Data
  "gibibyte-to-gigabyte": {
    badge: "SysAdmin & Storage Architecture",
    title: "Binary (1024\xB3) vs Decimal (1000\xB3) Discrepancy",
    note: "Operating systems like Windows calculate file system capacities in binary gibibytes (1 GiB = 1024\xB3 bytes), whereas drive manufacturers label hard drives in decimal gigabytes (1 GB = 1000\xB3 bytes). A physical 1 TB drive has 1,000,000,000,000 bytes, which equals 931.32 GiB in Windows.",
    standard: "IEC 80000-13 / IEEE 1541"
  },
  // Torque
  "newton-meter-to-pound-inch": {
    badge: "Machinist & Fastener Caution",
    title: "Pound-Foot vs Pound-Inch Confusion",
    note: "Never confuse pound-inches (lb-in) with pound-feet (lb-ft). 1 N\xB7m is 8.8507 lb-in, but only 0.7376 lb-ft. Torquing a fastener to 25 lb-ft instead of 25 lb-in applies 12 times the intended torque, shearing small bolts and stripping aluminum threads.",
    standard: "ISO 6789 / ASME B107.14"
  },
  "pound-foot-to-pound-inch": {
    badge: "Automotive Mechanics",
    title: "Exact Factor of 12",
    note: "1 pound-foot equals exactly 12 pound-inches. Bicycle stems and small engine valve covers specify lb-in, while cylinder head bolts specify lb-ft. Always verify the scale on your click torque wrench before tightening.",
    standard: "SAE J1701 / ASME B107.300"
  },
  // Power
  "metric-horsepower-to-kilowatt": {
    badge: "Automotive Dyno Standards",
    title: "Metric HP (PS/CV) vs Mechanical HP (hp)",
    note: "Metric horsepower (Pferdest\xE4rke / PS) equals 735.49875 W, whereas imperial mechanical horsepower equals 745.69987 W. A European car rated at 300 PS produces 220.65 kW, which translates to 295.9 mechanical hp.",
    standard: "DIN 70020 / ISO 1585"
  },
  "ton-of-refrigeration-to-btu-h": {
    badge: "HVAC Plant Engineering",
    title: "Latent Heat of Ice Melting: 1 TR = 12,000 BTU/h",
    note: "One refrigeration ton (TR) represents the rate of heat extraction required to freeze one short ton (2,000 lb) of water at 32\xB0F into ice in 24 hours (12,000 BTU/h or ~3.51685 kW).",
    standard: "ASHRAE Handbook / AHRI 550/590"
  },
  // Temperature
  "celsius-to-fahrenheit": {
    badge: "Thermodynamics & Meteorology",
    title: "Equal Point at -40\xB0 and Scale Offsets",
    note: "Celsius and Fahrenheit intersect at exactly -40\xB0 (-40\xB0C = -40\xB0F). Because temperature is an affine scale with non-zero intercept, relative temperature differences (\u0394T) must not include the +32 offset: a change of 10\xB0C equals a change of 18\xB0F, not 50\xB0F.",
    standard: "BIPM SI Brochure (9th Edition) / ITS-90"
  },
  // Flow Rate
  "gallon-per-minute-to-liter-per-minute": {
    badge: "Pumping & Piping Systems",
    title: "US Liquid Gallon vs Imperial Gallon Flow",
    note: "Standard US GPM uses 3.78541 L/min. UK and Commonwealth water works historically used Imperial GPM (4.54609 L/min), which is 20% greater volume per minute.",
    standard: "Hydraulic Institute (HI) Standards / AWWA"
  },
  // Illuminance
  "foot-candle-to-lux": {
    badge: "Architectural Lighting Design",
    title: "1 fc = 10.7639 lux (Square Foot to Square Meter)",
    note: "A foot-candle represents 1 lumen per square foot, while lux represents 1 lumen per square meter. Because 1 m\xB2 = 10.7639 ft\xB2, multiplying foot-candles by ~10.76 yields exact lux.",
    standard: "IESNA Lighting Handbook / EN 12464-1"
  },
  // Viscosity
  "centipoise-to-pascal-second": {
    badge: "Rheology & Lubrication",
    title: "1 cP = 1 mPa\xB7s = 0.001 Pa\xB7s (Water Baseline)",
    note: "At 20\xB0C, liquid water has a dynamic viscosity of almost exactly 1.002 cP (1.002 mPa\xB7s). Centipoise remains the dominant unit in petrochemical, paint, and polymer processing.",
    standard: "ASTM D445 / ISO 3104"
  },
  // Typography
  "pixel-to-point": {
    badge: "Digital Publishing & DTP",
    title: "96 DPI Screen vs 72 DPI PostScript Point",
    note: "In modern CSS, 1 inch equals exactly 96 CSS pixels and 72 PostScript typographical points (pt). Thus, 1 pt equals 1.3333 CSS pixels, and 16 px equals 12 pt.",
    standard: "W3C CSS Values and Units Level 3 / Adobe PostScript"
  }
};
var CATEGORY_FIELD_NOTES = {
  length: {
    badge: "Dimensional Metrology",
    title: "SI Base Traceability",
    note: "All international length measures trace to the speed of light in vacuum (c = 299,792,458 m/s). 1 inch is legally fixed at exactly 25.4 mm.",
    standard: "NIST SP 811 / ISO 80000-3"
  },
  mass: {
    badge: "Metrology Traceability",
    title: "Planck Constant Definition",
    note: "Since 2019, the kilogram is defined by fixing the Planck constant h = 6.62607015 \xD7 10\u207B\xB3\u2074 J\xB7s. All imperial mass units derive directly from this definition.",
    standard: "BIPM SI Brochure (9th Edition)"
  },
  volume: {
    badge: "Volumetric Calibration",
    title: "Thermal Expansion & Calibration",
    note: "Liquid volumes expand with temperature. Standard volumetric glassware and hydrometers are calibrated at 20\xB0C (68\xB0F).",
    standard: "ASTM E288 / ISO 4787"
  },
  pressure: {
    badge: "Atmospheric Physics",
    title: "Standard Atmospheric Baseline",
    note: "Standard atmospheric pressure at mean sea level is defined as 101,325 Pa (1.01325 bar = 14.6959 psi = 760 mmHg).",
    standard: "ISO 2533 / Standard Atmosphere"
  },
  temp: {
    badge: "Thermodynamics",
    title: "Absolute Zero Reference",
    note: "Thermodynamic temperature begins at Absolute Zero (0 K = -273.15\xB0C = -459.67\xB0F), where molecular kinetic energy is minimal.",
    standard: "BIPM SI Brochure (9th Edition)"
  },
  power: {
    badge: "Electromechanical Conversion",
    title: "Mechanical vs Electrical Horsepower",
    note: "Mechanical horsepower is fixed at 550 ft\xB7lbf/s (\u2248745.7 W), while electrical horsepower is defined as exactly 746 W.",
    standard: "IEEE Standards / ISO 80000-4"
  },
  energy: {
    badge: "Work & Heat Thermodynamics",
    title: "First Law Equivalence: 1 cal = 4.184 J",
    note: "The mechanical equivalent of heat sets 1 thermochemical calorie to exactly 4.184 Joules. 1 kilowatt-hour equals exactly 3.6 Megajoules.",
    standard: "ISO 80000-5 / CODATA"
  },
  data: {
    badge: "Digital Information Standard",
    title: "Binary vs Decimal Multiples",
    note: "IEC 80000-13 standardizes binary prefixes (KiB = 1024 B, MiB = 1024\xB2 B) to distinguish them from SI decimal prefixes (kB = 1000 B, MB = 1000\xB2 B).",
    standard: "IEC 80000-13 / IEEE 1541"
  },
  torque: {
    badge: "Mechanical Engineering",
    title: "Rotational Moment vs Energy",
    note: "Although both torque (N\xB7m) and energy (Joules) have identical SI base dimensions (kg\xB7m\xB2/s\xB2), torque is a vector cross product and is never expressed in Joules.",
    standard: "ISO 80000-4"
  },
  cooking: {
    badge: "Culinary Precision",
    title: "Weight vs Volume in Recipes",
    note: "Professional baking recipes mandate mass (grams) over volume (cups) because ingredient settling, humidity, and sifting create up to 20% density fluctuations.",
    standard: "Culinary Institute of America Standards"
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
  "textile:gsm-to-oz": [
    { domain: "Fashion & Streetwear", context: "Converting metric fabric weights to US ounces per square yard for hoodies, t-shirts, and cut-and-sew tech packs." },
    { domain: "Textile Sourcing & Importing", context: "Validating international mill specifications (g/m\xB2) against US customs and retail merchandise standards (oz/yd\xB2)." },
    { domain: "Canvas & Heavy Goods", context: "Specifying duck canvas, tote bags, workwear jackets, and marine-grade upholstery fabric weights." }
  ],
  "textile:oz-to-gsm": [
    { domain: "Apparel Manufacturing", context: "Converting US tech pack fabric weights in oz/yd\xB2 to metric GSM for overseas knitting mills and dye houses." },
    { domain: "Denim & Workwear", context: "Translating classic 12 oz, 14 oz, and 16 oz denim and canvas ratings into exact metric grams per square meter." },
    { domain: "Customs & Metrology", context: "Ensuring import compliance with international fabric weight classification standards under ASTM D3776 and ISO 3801." }
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
  ],
  "volume:cubic-yard-to-cubic-meter": [
    { domain: "Ready-Mix Concrete & Civil Engineering", context: "Converting concrete batching orders from US cubic yards into metric cubic meters for international building projects." },
    { domain: "Excavation & Earthwork Contracting", context: "Calculating soil volume, fill material, and dump truck haulage capacities across regional measurement specifications." }
  ],
  "volume:imperial-gallon-to-gallon": [
    { domain: "Transatlantic Automotive Fuel Analysis", context: "Translating UK automotive fuel tank volumes and fuel economy data into US customary gallons." },
    { domain: "Maritime & Aviation Fluid Handling", context: "Reconciling Commonwealth bunker fuel logs with US gallon fluid storage and pumping equipment." }
  ],
  "volume:liter-to-imperial-gallon": [
    { domain: "UK Fleet Management & Fuel Economy", context: "Converting European metric liter fuel dispensation into UK Imperial gallons for fleet efficiency auditing." },
    { domain: "Brewing & Chemical Beverage Distribution", context: "Translating metric beverage packaging into traditional British Imperial casks and firkins." }
  ],
  "mass:troy-ounce-to-gram": [
    { domain: "Bullion Trading & Precious Metals Minting", context: "Calculating fine gold, silver, and platinum market weights from standard troy ounces into grams for assay certification." },
    { domain: "Jewelry Design & Gemological Valuation", context: "Translating precious metal alloy casting specifications into metric grams for high-precision weighing scales." }
  ],
  "mass:troy-ounce-to-ounce": [
    { domain: "Precious Metal vs Avoirdupois Weight Comparison", context: "Reconciling heavy troy ounces (31.1035 g) with standard avoirdupois commercial ounces (28.3495 g) to prevent costly trading confusion." },
    { domain: "Scrap Gold Buying & Estate Liquidation", context: "Converting postal scale kitchen ounces into true troy ounces for honest gold and silver scrap valuation." }
  ],
  "length:angstrom-to-nanometer": [
    { domain: "Crystallography & X-Ray Diffraction", context: "Converting atomic lattice parameters and chemical bond lengths from historic angstroms into modern SI nanometers." },
    { domain: "Semiconductor Lithography & Optics", context: "Translating extreme ultraviolet (EUV) laser wavelengths and dielectric film thicknesses between technical literature standards." }
  ],
  "length:fathom-to-foot": [
    { domain: "Nautical Depth Sounding & Hydrographic Charts", context: "Translating historic marine nautical fathoms (6 feet) into precise feet for shallow-water vessel draft navigation." },
    { domain: "Commercial Maritime Anchorage & Rigging", context: "Measuring anchor chain scope, mooring line lengths, and deep-sea cable laying depths." }
  ],
  "torque:newton-meter-to-pound-inch": [
    { domain: "Precision Electronics & Medical Robotics Assembly", context: "Translating metric N\xB7m torque ratings into delicate lb\xB7in specifications for circuit board fasteners and chassis screws." },
    { domain: "Bicycle Carbon Component Maintenance", context: "Calibrating fractional torque wrenches to prevent crushing lightweight carbon fiber handlebars and seatposts." }
  ],
  "torque:pound-foot-to-pound-inch": [
    { domain: "Automotive Engine Fastener Tightening", context: "Converting between heavy-duty ft\xB7lb wheel lug ratings and smaller in\xB7lb valve cover and oil pan bolt tolerances." },
    { domain: "Aerospace Mechanical Calibration", context: "Switching between high-torque airframe fasteners and low-torque instrument panel mounts on standardized maintenance sheets." }
  ],
  "pressure:hectopascal-to-millibar": [
    { domain: "Aviation Altimetry & Barometric Pressure Reporting", context: "Confirming the 1:1 direct relationship between meteorological hectopascals (hPa) and barometric millibars (mbar) for altimeter setting." },
    { domain: "Marine Weather Forecasting & Storm Tracking", context: "Logging atmospheric pressure drops during tropical cyclones across international meteorological bulletins." }
  ],
  "pressure:inches-of-mercury-to-psi": [
    { domain: "Automotive Turbocharger & Supercharger Boost Tuning", context: "Translating engine manifold absolute pressure and vacuum from inHg into engineering pounds per square inch." },
    { domain: "Aviation Flight Instruments & Barometric Altimeters", context: "Correlating FAA altimeter baro settings (inHg) with pneumatic system pressure instrumentation." }
  ],
  "power:metric-horsepower-to-kilowatt": [
    { domain: "European Automotive Power Rating & Vehicle Registration", context: "Converting German DIN PferdeSt\xE4rke (PS) vehicle engine output into mandatory EU kilowatts." },
    { domain: "Industrial Engine & Electric Motor Specification", context: "Comparing European commercial vehicle ratings with industrial electric drive power certifications." }
  ],
  "power:ton-of-refrigeration-to-btu-h": [
    { domain: "Commercial HVAC Chiller Sizing & Engineering", context: "Translating standard cooling capacity from Tons of Refrigeration (TR) into BTU/h (1 TR = 12,000 BTU/h)." },
    { domain: "Building Energy Modeling & Heat Load Calculation", context: "Determining total rooftop chiller and cooling tower thermal loads for architectural mechanical plans." }
  ],
  "data:gibibyte-to-gigabyte": [
    { domain: "Server RAM Provisioning & Cloud Virtual Machines", context: "Translating binary IEC memory allocations (GiB) into advertised decimal storage capacity (GB)." },
    { domain: "Operating System Drive Partitioning & Formatting", context: "Explaining why a 1,000 GB solid-state drive formats to approximately 931.3 GiB in Windows Disk Management." }
  ],
  "cooking:stick-of-butter-to-tablespoon": [
    { domain: "Baking Recipe Rescaling & Kitchen Measurement", context: "Converting standard American butter sticks into tablespoons (1 stick = 8 tbsp = 1/2 cup) for pastry recipes." },
    { domain: "Commercial Culinary Production & Portioning", context: "Scaling home recipe ingredients to commercial food service bulk prep sheets." }
  ],
  "flow:gallon-per-minute-to-liter-per-minute": [
    { domain: "Plumbing Fixture Flow Compliance & Water Efficiency", context: "Converting showerhead and faucet aerator ratings from US GPM to metric L/min to verify green building standards." },
    { domain: "Hydraulic Pumping & Irrigation System Design", context: "Sizing agricultural drip irrigation lines and submersible well pumps across global equipment catalogs." }
  ],
  "flow:cubic-feet-per-minute-to-liter-per-second": [
    { domain: "HVAC Duct Sizing & Airflow Balancing", context: "Translating ventilation fan airflow from US CFM into metric liters per second (L/s) for building commissioning." },
    { domain: "Cleanroom & Laboratory Fume Hood Exhaust", context: "Calibrating laminar flow hoods and hospital isolation room air change rates according to international air quality codes." }
  ],
  "flow:cubic-meter-per-hour-to-gallon-per-minute": [
    { domain: "Municipal Water Distribution & Wastewater Treatment", context: "Converting bulk pumping station capacity from European m\xB3/h into US GPM for municipal engineers." },
    { domain: "Industrial Chemical Process Cooling Circuits", context: "Sizing heat exchanger circulation pumps and cooling water flow rates across international plant designs." }
  ],
  "illuminance:foot-candle-to-lux": [
    { domain: "Workplace Safety & OSHA Lighting Audits", context: "Converting American industrial foot-candle illumination requirements into European and international Lux standards." },
    { domain: "Commercial Architectural Lighting Design", context: "Translating architectural lighting fixture schedules between US building codes and global photometric standards." }
  ],
  "illuminance:lux-to-foot-candle": [
    { domain: "Cinematography & Photography Light Metering", context: "Translating ambient film set lighting measurements from digital lux meters into traditional foot-candles for exposure compensation." },
    { domain: "Greenhouse Horticulture & Indoor Plant Cultivation", context: "Optimizing supplemental LED crop grow light arrays between metric target lux and foot-candle guidelines." }
  ],
  "viscosity:centipoise-to-pascal-second": [
    { domain: "Chemical Process Rheology & Polymer Formulation", context: "Converting bench laboratory viscosity readings from CGS centipoise (cP) into SI coherent Pascal-seconds (Pa\xB7s)." },
    { domain: "Industrial Pipe Flow & Pumping Friction Calculations", context: "Inputting dynamic fluid viscosity values into Navier-Stokes equations and Reynolds number flow models." }
  ],
  "viscosity:centipoise-to-millipascal-second": [
    { domain: "Scientific Laboratory Reporting & ISO Equivalence", context: "Confirming the exact 1:1 identity between 1 Centipoise and 1 Millipascal-second across chemical databases." },
    { domain: "Lubricant Quality Control & Motor Oil Grading", context: "Documenting high-temperature high-shear (HTHS) engine oil viscosity for ASTM standard compliance." }
  ],
  "typography:pixel-to-point": [
    { domain: "Digital UI Design to Print Layout Translation", context: "Translating web application UI components (Figma/CSS 96 DPI) into desktop publishing points (72 DPI) for print manuals." },
    { domain: "Mobile App Typography & Vector Rendering", context: "Harmonizing raster screen layout dimensions with vector font point sizes across iOS and Android design tokens." }
  ],
  "typography:pixel-to-root-em": [
    { domain: "Responsive Web Design & Accessible CSS Typography", context: "Converting static Figma pixel mockups into scalable, accessible rem units based on browser root font sizes." },
    { domain: "Design System Token Automation & Theme Engine", context: "Generating fluid typography clamp scales and layout spacing tokens for modern responsive frontend frameworks." }
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
  } else if (cat.id === "cricket-overs") {
    if (u2.id === "balls") {
      formulaDisplay = "Balls = (Floor(Overs) \xD7 6) + Remainder Deliveries";
      summary = `1 over equals exactly 6 legal deliveries (balls). Cricket overs notation (e.g. 14.3 overs) denotes 14 overs and 3 balls (87 balls).`;
      calculationRule = `To convert cricket overs to balls, multiply completed overs by 6 and add the remainder balls after the decimal point.`;
      inverseSummary = `6 balls equal exactly 1 complete over (Overs = Floor(Balls \xF7 6) + (Balls mod 6) \xF7 10).`;
    } else {
      formulaDisplay = "True Decimal Overs = Floor(Overs) + (Remainder Balls \xF7 6)";
      summary = `1 cricket over equals 1.00 true decimal over. Cricket notation uses base-6 (e.g. 14.3 overs = 14.50 true decimal overs).`;
      calculationRule = `To convert cricket overs to true decimal overs, take completed overs and add remainder balls divided by 6.`;
      inverseSummary = `1.00 true decimal over equals exactly 1.0 cricket over (6 balls).`;
    }
  } else if (cat.id === "ieee-754") {
    formulaDisplay = "Value = (-1)^sign \xD7 2^(exponent - bias) \xD7 (1 + mantissa)";
    summary = `Converts ${l1} to ${l2} with sign, exponent, and mantissa bitfields.`;
    calculationRule = `To convert between decimal real values and IEEE-754 representations, extract the sign bit, calculate the biased exponent, and determine the normalized mantissa bits.`;
    inverseSummary = `Converts ${l2} back to ${l1} with exact precision bitfield decoding.`;
  } else if (cat.id === "matrix-format") {
    formulaDisplay = "Format Mapping: Parser Tokenizer \u2192 Structural AST \u2192 Target Matrix Syntax";
    summary = `Converts ${l1} matrix syntax into ${l2} array representation.`;
    calculationRule = `To convert between matrix representations, parse row tokens, format column delimiters, and wrap in target syntax brackets.`;
    inverseSummary = `Converts ${l2} representation back to ${l1} matrix syntax.`;
  } else if (cat.id === "number-base") {
    formulaDisplay = "Decimal Value = Sum(Digit \xD7 Radix^Position)";
    summary = `1 ${l1} corresponds to ${unitRatio !== null ? fmt(unitRatio, 4) : "1"} ${l2}.`;
    calculationRule = `To convert between number bases, convert the source radix to decimal via Horner\u2019s polynomial method, then repeatedly divide by the target radix.`;
    inverseSummary = `1 ${l2} corresponds to ${inverseUnitRatio !== null ? fmt(inverseUnitRatio, 4) : "1"} ${l1}.`;
  } else if (cat.id === "pk-gpa") {
    formulaDisplay = "Linear Grade-Band Mapping: Percentage Marks \u2194 4.00 CGPA Scale";
    summary = `1 ${l1} corresponds to ${unitRatio !== null ? fmt(unitRatio, 4) : "1"} ${l2}.`;
    calculationRule = `To approximate equivalent marks or CGPA, apply the linear grade-band floor mapping (1.0 = 50%, 4.0 = 85%). Note that many Pakistani universities use CGPA \xD7 25 or institutional tables.`;
    inverseSummary = `1 ${l2} corresponds to ${inverseUnitRatio !== null ? fmt(inverseUnitRatio, 4) : "1"} ${l1}.`;
  } else if (cat.id === "statistics") {
    formulaDisplay = "Z = (X - \u03BC) / \u03C3; Percentile = \u03A6(Z) \xD7 100%";
    summary = `1 ${l1} corresponds to ${unitRatio !== null ? fmt(unitRatio, 4) : "1"} ${l2}.`;
    calculationRule = `To convert statistical metrics, apply the cumulative Gaussian normal distribution function or implied probability formula.`;
    inverseSummary = `1 ${l2} corresponds to ${inverseUnitRatio !== null ? fmt(inverseUnitRatio, 4) : "1"} ${l1}.`;
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
  } else if (cat.id === "cricket-overs") {
    if (u2.id === "balls") {
      workedExampleAnswer = `To convert 14.3 overs to balls: (14 \xD7 6) + 3 = 84 + 3 = 87 legal deliveries.`;
    } else {
      workedExampleAnswer = `To convert 14.3 overs to true decimal overs: 14 + (3 \xF7 6) = 14 + 0.50 = 14.50 true decimal overs.`;
    }
  } else if (cat.id === "ieee-754") {
    workedExampleAnswer = `For decimal 1.0: Sign = 0 (+), Exponent = 127 (01111111 binary), Mantissa = 0. In hex, this yields 0x3F800000.`;
  } else if (cat.id === "matrix-format") {
    workedExampleAnswer = `To convert a 2\xD72 CSV grid "1, 2\\n3, 4" into LaTeX bmatrix: wrap rows in \\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}.`;
  } else if (cat.id === "number-base") {
    workedExampleAnswer = `To convert decimal 13 to binary: 13 \xF7 2 = 6 rem 1, 6 \xF7 2 = 3 rem 0, 3 \xF7 2 = 1 rem 1, 1 \xF7 2 = 0 rem 1. Reading remainders bottom to top gives binary 1101.`;
  } else if (cat.id === "pk-gpa") {
    workedExampleAnswer = `Under the linear grade-band approximation, 85% yields a 4.00 CGPA, 73.33% yields a 3.00 CGPA, and 61.67% yields a 2.00 CGPA. Using CGPA \xD7 25, 3.00 yields 75.00%.`;
  } else if (cat.id === "statistics") {
    workedExampleAnswer = `A Z-score of +2.0 on a standard normal distribution corresponds to the 97.72 percentile (two standard deviations above the mean).`;
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
  const pairSlug = cleanSlug(pairParam);
  const fieldNote = PAIR_FIELD_NOTES[pairSlug] || CATEGORY_FIELD_NOTES[cat.id];
  let workedExamples;
  let referenceTable;
  const TEXTILE_WEIGHTS_TABLE = [
    { label: "120 GSM", value: "3.54 oz/yd\xB2", extra: "Lightweight undershirts & sheer layering" },
    { label: "150 GSM", value: "4.42 oz/yd\xB2", extra: "Standard lightweight summer t-shirts" },
    { label: "180 GSM", value: "5.31 oz/yd\xB2", extra: "Midweight everyday crewneck t-shirts" },
    { label: "200 GSM", value: "5.90 oz/yd\xB2", extra: "Heavyweight t-shirts & classic polo shirts" },
    { label: "250 GSM", value: "7.37 oz/yd\xB2", extra: "Long sleeves & lightweight french terry" },
    { label: "280 GSM", value: "8.26 oz/yd\xB2", extra: "Standard pullover hoodies & crewnecks" },
    { label: "300 GSM", value: "8.85 oz/yd\xB2", extra: "Heavyweight fleece & sweatpants" },
    { label: "350 GSM", value: "10.32 oz/yd\xB2", extra: "Premium streetwear hoodies & loopback terry" },
    { label: "400 GSM", value: "11.80 oz/yd\xB2", extra: "Dense canvas & plush cotton bath towels" },
    { label: "450 GSM", value: "13.27 oz/yd\xB2", extra: "Heavyweight canvas totes & luxury towels" },
    { label: "480 GSM", value: "14.16 oz/yd\xB2", extra: "Ultra-heavyweight luxury streetwear hoodies" },
    { label: "500 GSM", value: "14.75 oz/yd\xB2", extra: "Workwear jackets & heavy cotton bath sheets" },
    { label: "600 GSM", value: "17.70 oz/yd\xB2", extra: "Marine-grade duck canvas & hotel bath rugs" }
  ];
  if (cat.id === "textile" && pairSlug === "gsm-to-oz") {
    formulaDisplay = "oz/yd\xB2 = g/m\xB2 \xF7 33.906";
    referenceTable = TEXTILE_WEIGHTS_TABLE;
    workedExamples = [
      "Formula: oz/yd\xB2 = g/m\xB2 \xF7 33.906 (or g/m\xB2 \xD7 0.0294936)",
      "Worked Example for 480 GSM: 480 \xF7 33.906 = 14.157 oz/yd\xB2 (rounded to 14.16 oz/yd\xB2). A 480 GSM luxury custom streetwear hoodie represents exactly 14.16 ounces per square yard of heavyweight cotton fleece.",
      "Common Conversions: 180 GSM = 5.31 oz/yd\xB2 (crewneck t-shirt) \xB7 300 GSM = 8.85 oz/yd\xB2 (heavyweight fleece) \xB7 400 GSM = 11.80 oz/yd\xB2 (dense canvas)."
    ];
    faqs.push(
      { question: "What does 480 GSM equal in ounces per square yard?", answer: "480 GSM equals exactly 14.16 oz/yd\xB2 (rounded from 14.157 oz/yd\xB2). This weight is standard for premium luxury heavyweight hoodies and winter streetwear." },
      { question: "Why does 1 oz/yd\xB2 equal 33.906 GSM?", answer: "One square yard equals 0.836127 square meters, and one avoirdupois ounce equals 28.349523 grams. Dividing 28.349523 grams by 0.836127 square meters yields exactly 33.9057474 g/m\xB2 (rounded to 33.906 g/m\xB2)." }
    );
  }
  if (cat.id === "textile" && pairSlug === "oz-to-gsm") {
    formulaDisplay = "g/m\xB2 = oz/yd\xB2 \xD7 33.906";
    referenceTable = TEXTILE_WEIGHTS_TABLE.map((r) => ({ label: r.value, value: r.label, extra: r.extra }));
    workedExamples = [
      "Formula: g/m\xB2 = oz/yd\xB2 \xD7 33.906",
      "Worked Example for 14.16 oz/yd\xB2: 14.157 oz/yd\xB2 \xD7 33.906 = 480.0 g/m\xB2 (480 GSM). 14.16 ounces per square yard corresponds to the benchmark 480 GSM fabric weight used in ultra-heavyweight streetwear hoodies.",
      "Common Conversions: 5.31 oz/yd\xB2 = 180 GSM \xB7 8.85 oz/yd\xB2 = 300 GSM \xB7 11.80 oz/yd\xB2 = 400 GSM \xB7 14.75 oz/yd\xB2 = 500 GSM."
    ];
    faqs.push(
      { question: "What does 14.16 oz/yd\xB2 equal in GSM?", answer: "14.16 oz/yd\xB2 equals exactly 480 GSM (grams per square meter), standard for ultra-heavyweight luxury streetwear hoodies." },
      { question: "How do you convert oz/yd\xB2 to GSM in apparel manufacturing?", answer: "Multiply the oz/yd\xB2 fabric weight by 33.906. For example, 10 oz/yd\xB2 denim equals approximately 339 GSM, and 14 oz/yd\xB2 heavy denim equals approximately 475 GSM." }
    );
  }
  if (cat.id === "temp" && pairSlug === "celsius-to-fahrenheit") {
    workedExamples = [
      "25\xB0C \xD7 9/5 + 32 = 77\xB0F (a warm summer day in Europe is 77\xB0F)",
      "0\xB0C \xD7 9/5 + 32 = 32\xB0F (water freezes at 0\xB0C or 32\xB0F)",
      "37\xB0C \xD7 9/5 + 32 = 98.6\xB0F (normal human body temperature)",
      "100\xB0C \xD7 9/5 + 32 = 212\xB0F (water boils at 100\xB0C or 212\xB0F)",
      "-40\xB0C \xD7 9/5 + 32 = -40\xB0F (the only point where Celsius and Fahrenheit are equal)"
    ];
    faqs.push(
      {
        question: "What is the easiest way to convert Celsius to Fahrenheit?",
        answer: "Double the Celsius value and add 30 for a quick estimate. For example, 20\xB0C \xD7 2 + 30 = 70\xB0F (real answer: 68\xB0F). For precise math, use the formula \xB0F = \xB0C \xD7 9/5 + 32."
      },
      {
        question: "At what temperature are Celsius and Fahrenheit equal?",
        answer: "-40\xB0C = -40\xB0F. This is the only temperature where both scales read the same value."
      },
      {
        question: "What is normal body temperature in Fahrenheit?",
        answer: "Normal human body temperature is 37\xB0C, which equals 98.6\xB0F."
      }
    );
  } else if (cat.id === "temp" && pairSlug === "fahrenheit-to-celsius") {
    workedExamples = [
      "98.6\xB0F \u2212 32 = 66.6, \xD7 5/9 = 37.0\xB0C (normal body temperature)",
      "32\xB0F \u2212 32 = 0, \xD7 5/9 = 0\xB0C (water freezes at 32\xB0F or 0\xB0C)",
      "212\xB0F \u2212 32 = 180, \xD7 5/9 = 100\xB0C (water boils at 212\xB0F or 100\xB0C)",
      "72\xB0F \u2212 32 = 40, \xD7 5/9 = 22.2\xB0C (room temperature is about 22\xB0C)"
    ];
    faqs.push(
      {
        question: "What is the easiest way to convert Fahrenheit to Celsius?",
        answer: "Subtract 30 from Fahrenheit then divide by 2 for a quick estimate. For example, 70\xB0F \u2212 30 = 40, \xF7 2 = 20\xB0C (real answer: 21.1\xB0C)."
      },
      {
        question: "What is 0\xB0F in Celsius?",
        answer: "0\xB0F equals approximately -17.78\xB0C."
      },
      {
        question: "What is 100\xB0F in Celsius?",
        answer: "100\xB0F equals approximately 37.78\xB0C, which is near human body temperature."
      }
    );
  } else if (cat.id === "mass" && pairSlug === "kilogram-to-pounds") {
    workedExamples = [
      "68 kg \xD7 2.20462 = 149.91 lb (a 68 kg person weighs about 150 lb)",
      "5 kg \xD7 2.20462 = 11.02 lb (a 5 kg bag of rice is about 11 lb)",
      "100 kg \xD7 2.20462 = 220.46 lb (100 kg is roughly 220 lb)",
      "0.5 kg \xD7 2.20462 = 1.10 lb (half a kilogram is just over 1 pound)"
    ];
    faqs.push(
      {
        question: "How do I convert kg to lbs in my head?",
        answer: "Double the kg value and add 10%. For example, 50 kg \xD7 2 = 100, plus 10% = 110 lb (real answer: 110.23 lb)."
      },
      {
        question: "What is the difference between kg and lbs?",
        answer: "Kilogram (kg) is the SI base unit of mass used by most countries. Pound (lb) is an imperial unit used mainly in the US and UK."
      }
    );
  } else if (cat.id === "mass" && pairSlug === "pounds-to-kilogram") {
    workedExamples = [
      "150 lb \xD7 0.45359237 = 68.04 kg (a person weighing 150 lb weighs 68 kg)",
      "10 lb \xD7 0.45359237 = 4.54 kg (a 10 lb bag of flour is 4.54 kg)",
      "1 lb \xD7 0.45359237 = 0.45 kg (one pound is just under half a kilogram)",
      "200 lb \xD7 0.45359237 = 90.72 kg (an adult male weighing 200 lb is about 91 kg)"
    ];
    faqs.push(
      {
        question: "How do I convert pounds to kilograms in my head?",
        answer: "Divide pounds by 2.2 for a rough estimate. For example, 150 lb \xF7 2.2 \u2248 68 kg. For precise conversions, multiply by 0.45359237."
      },
      {
        question: "What is the difference between lb and lbs?",
        answer: 'Both are the same \u2014 "lb" is the singular abbreviation for pound (from Latin libra), and "lbs" is the plural form.'
      },
      {
        question: "Why do Americans use pounds instead of kilograms?",
        answer: "The US is one of three countries (along with Liberia and Myanmar) that still use the imperial system. Most of the world uses kilograms."
      }
    );
  } else if (cat.id === "length" && pairSlug === "feet-to-meters") {
    workedExamples = [
      "10 ft \xD7 0.3048 = 3.05 m (a 10-foot room is about 3 meters)",
      "6 ft \xD7 0.3048 = 1.83 m (a person who is 6 feet tall is 1.83 meters)",
      "100 ft \xD7 0.3048 = 30.48 m (a 100-foot building is about 30 meters)",
      "5280 ft \xD7 0.3048 = 1609.34 m (one mile in meters)"
    ];
    faqs.push(
      {
        question: "How do I convert feet to meters in my head?",
        answer: "Divide feet by 3.3 for a quick estimate. For example, 10 ft \xF7 3.3 \u2248 3.03 m (real answer: 3.05 m)."
      },
      {
        question: "What is 6 feet tall in meters?",
        answer: "6 feet equals approximately 1.83 meters, which is considered tall in many countries."
      }
    );
  } else if (cat.id === "length" && pairSlug === "meter-to-feet") {
    workedExamples = [
      "10 m \xD7 3.28084 = 32.81 ft (a 10-meter room is about 33 feet long)",
      "1.83 m \xD7 3.28084 = 6.00 ft (a person who is 1.83 m tall is exactly 6 feet)",
      "100 m \xD7 3.28084 = 328.08 ft (a football field is about 100 meters)",
      "0.3048 m \xD7 3.28084 = 1.00 ft (one foot is exactly 0.3048 meters)"
    ];
    faqs.push(
      {
        question: "How do I convert meters to feet in my head?",
        answer: "Multiply meters by 3.3 for a quick estimate. For example, 10 m \xD7 3.3 \u2248 33 ft (real answer: 32.81 ft)."
      },
      {
        question: "What is the difference between a meter and a foot?",
        answer: "A meter is the base SI unit of length used in most countries. A foot is an imperial unit used mainly in the US. One meter = 3.28084 feet."
      },
      {
        question: "How do I convert meters to feet and inches?",
        answer: "Multiply meters by 3.28084 to get decimal feet. Take the decimal part and multiply by 12 to get inches. For example: 1.83 m \xD7 3.28084 = 6.003 ft = 6 ft 0.04 in."
      }
    );
  } else if (cat.id === "pressure" && pairSlug === "psi-to-bar") {
    workedExamples = [
      "32 psi \xD7 0.0689476 = 2.21 bar (recommended cold passenger car tire pressure)",
      "35 psi \xD7 0.0689476 = 2.41 bar (common SUV / crossover tire pressure)",
      "14.7 psi \xD7 0.0689476 = 1.013 bar (standard atmospheric pressure at sea level)",
      "100 psi \xD7 0.0689476 = 6.89 bar (typical workshop air compressor output)"
    ];
    faqs.push(
      {
        question: "How do I convert PSI to bar in my head?",
        answer: "Divide the PSI value by 15 for a fast mental estimate. For example, 30 psi \xF7 15 = 2.0 bar (exact answer: 2.07 bar). 45 psi \xF7 15 = 3.0 bar (exact answer: 3.10 bar)."
      },
      {
        question: "What is the difference between psig and psia?",
        answer: "psig measures gauge pressure relative to ambient atmosphere (a tire gauge reads 0 psi when disconnected). psia measures absolute pressure including the 14.7 psi atmospheric pressure baseline."
      },
      {
        question: "What is 32 PSI in bar?",
        answer: "32 PSI equals approximately 2.21 bar, which is the standard tire pressure recommendation for most compact and midsize sedans."
      }
    );
  } else if (cat.id === "power" && pairSlug === "kilowatts-to-horsepower") {
    workedExamples = [
      "150 kW \xD7 1.34102 = 201.15 hp (standard electric vehicle motor rating)",
      "220 kW \xD7 1.34102 = 295.02 hp (performance electric sedan dual-motor setup)",
      "74.57 kW \xD7 1.34102 = 100.00 hp (exact mechanical horsepower definition)",
      "500 kW \xD7 1.34102 = 670.51 hp (high-performance electric hypercar)"
    ];
    faqs.push(
      {
        question: "How do I convert kW to HP in my head?",
        answer: "Multiply kW by 4 and divide by 3 (add one-third). For example, 150 kW \xD7 4/3 = 200 hp (exact answer: 201.15 hp). 300 kW \xD7 4/3 = 400 hp (exact answer: 402.3 hp)."
      },
      {
        question: "What is the difference between mechanical HP and metric PS?",
        answer: "Mechanical HP (imperial) is 745.69987 Watts. Metric HP (Pferdest\xE4rke / PS / CV) is 735.49875 Watts. 100 kW is 134.1 imperial hp or 136.0 metric PS."
      },
      {
        question: "Why do electric vehicles use kW instead of HP?",
        answer: "Kilowatt is the coherent SI unit for electrical power (Volts \xD7 Amperes \xF7 1000). Battery discharge capacity and charging speeds are quoted in kW and kWh, making kW mathematically consistent across the entire EV powertrain."
      },
      {
        question: "How many kW is 300 horsepower?",
        answer: "300 mechanical horsepower equals approximately 223.71 kW (300 \xF7 1.34102)."
      }
    );
  } else if (cat.id === "mass" && pairSlug === "tola-to-g") {
    referenceTable = [
      { label: "1 Tola", value: "11.6638 g", extra: "180 troy grains / 12 Masha / 96 Ratti" },
      { label: "1 Masha", value: "0.9720 g", extra: "8 Ratti (1/12 Tola)" },
      { label: "1 Ratti", value: "0.1215 g", extra: "1/96 Tola" },
      { label: "1 Chhatank", value: "58.3190 g", extra: "5 Tolas" },
      { label: "1 Seer", value: "933.1043 g", extra: "16 Chhatanks / 80 Tolas" }
    ];
    workedExamples = [
      "1 Tola 24K pure gold bar = 11.6638 grams of pure 99.99% gold",
      "10 grams into Tolas: 10 \xF7 11.6638 = 0.85735 Tolas (approx 10.29 Mashas)",
      "1 Masha of gold: 11.6638 \xF7 12 = 0.97198 grams",
      "1 Ratti of gold: 11.6638 \xF7 96 = 0.12150 grams"
    ];
    faqs.push(
      {
        question: "How many Mashas and Rattis are in 1 Tola?",
        answer: "There are exactly 12 Mashas in 1 Tola, and 8 Rattis in 1 Masha. Therefore, 1 Tola contains 96 Rattis."
      },
      {
        question: "How do you calculate 22K gold price from the 24K Tola rate?",
        answer: "Divide the 24K Tola rate by 24 and multiply by 22 (or multiply by 0.91667). For example, if 24K is PKR 240,000/tola, 22K gold is 240,000 \xD7 (22/24) = PKR 220,000/tola."
      },
      {
        question: "What is a Chhatank in mass?",
        answer: "A Chhatank is a traditional mass unit equal to exactly 5 Tolas (58.319 grams). Sixteen Chhatanks equal 1 Seer (933.1 grams)."
      }
    );
  } else if (cat.id === "area" && pairSlug === "marla-to-ft2") {
    referenceTable = [
      { label: "1 Marla (Patwari / Revenue Standard)", value: "272.25 sq ft", extra: "9 square karams / 30.25 sq yards" },
      { label: "1 Marla (Private Housing Society / DHA / Bahria)", value: "225.00 sq ft", extra: "25 square yards (Gaz)" },
      { label: "1 Kanal (Revenue Standard)", value: "5,445.00 sq ft", extra: "20 Marlas (Revenue)" },
      { label: "1 Kanal (Housing Society)", value: "4,500.00 sq ft", extra: "20 Marlas (Society)" }
    ];
    workedExamples = [
      "5 Marla plot in DHA / Bahria: 5 \xD7 225 = 1,125 sq ft (approx 125 square yards / gaz)",
      "5 Marla rural plot under Patwari Revenue Record: 5 \xD7 272.25 = 1,361.25 sq ft",
      "1 Kanal standard property: 20 Marlas \xD7 272.25 = 5,445 sq ft (or 4,500 sq ft in societies)",
      "Regional Variance: Some authorities use other sizes \u2014 check your deed."
    ];
    faqs.push(
      {
        question: "Why is a Marla 225 sq ft in some housing societies and 272.25 sq ft in village records?",
        answer: "Under traditional British Indian revenue measurement, 1 Karam equals 5.5 feet (66 inches), and 1 Sarsahi is 1 square Karam (30.25 sq ft). Nine Sarsahis make 1 Marla (9 \xD7 30.25 = 272.25 sq ft). Private urban developers adopted a simplified metric of 25 square yards (25 \xD7 9 = 225 sq ft) to allow neat decimal dimensions (e.g. 25 ft \xD7 45 ft for 5 Marla plots). Some authorities use other sizes \u2014 check your deed."
      },
      {
        question: "How many square yards (Gaz) is 1 Marla?",
        answer: "In standard revenue records, 1 Marla = 30.25 square yards. In housing societies, 1 Marla = exactly 25 square yards (Gaz)."
      },
      {
        question: "How many Marlas are in 1 Kanal?",
        answer: "In all jurisdictions across Pakistan, 1 Kanal equals exactly 20 Marlas."
      },
      {
        question: "What is a Sarsahi and how does it relate to a Marla?",
        answer: "A Sarsahi is the foundational land unit in Punjab revenue records. Exactly 9 Sarsahis equal 1 Marla (1 Sarsahi = 30.25 square feet)."
      }
    );
  } else if (cat.id === "pk-gpa" && pairSlug === "hec-gpa4-to-percentage") {
    referenceTable = [
      { label: "CGPA 4.00", value: "85.00%+", extra: "Top grade band (A floor)" },
      { label: "CGPA 3.50", value: "79.17%", extra: "B+ grade band floor" },
      { label: "CGPA 3.00", value: "73.33%", extra: "B grade band floor" },
      { label: "CGPA 2.50", value: "67.50%", extra: "C+ grade band floor" },
      { label: "CGPA 2.00", value: "61.67%", extra: "C grade band floor" }
    ];
    workedExamples = [
      "Linear grade-band approximation for CGPA 3.50: ((3.50 - 1.0) / 3.0) \xD7 35 + 50 = 79.17% marks",
      "Linear grade-band approximation for CGPA 3.00: ((3.00 - 1.0) / 3.0) \xD7 35 + 50 = 73.33% marks",
      "University multiplier method for CGPA 3.00: 3.00 \xD7 25 = 75.00% marks (comparison method used by many institutions)",
      "Converting 5.0 CGPA scale to 4.0 CGPA: CGPA 4.0 = (CGPA 5.0 \xF7 5.0) \xD7 4.0"
    ];
    faqs.push(
      {
        question: "What percentage is a 3.00 CGPA in Pakistan under HEC?",
        answer: "The formula ((CGPA - 1) / 3) \xD7 35 + 50 is an approximation that maps HEC grade-band floors linearly (1.0 = 50%, 4.0 = 85%), giving 73.33% for 3.00 CGPA. HEC has no single nationwide CGPA-to-percentage formula. Many universities use CGPA \xD7 25; others use their own tables. For official use, get a percentage letter from your registrar."
      },
      {
        question: "Does HEC have a single nationwide CGPA-to-percentage formula?",
        answer: "No. HEC has no single nationwide CGPA-to-percentage formula. Many universities use CGPA \xD7 25; others use their own tables. For official use, get a percentage letter from your registrar."
      },
      {
        question: "How do universities convert 3.00 CGPA to percentage using the multiplier method?",
        answer: "Many Pakistani universities multiply CGPA by 25. For example, 3.00 CGPA \xD7 25 = 75.00% marks, compared to 73.33% under the linear grade-band floor approximation."
      },
      {
        question: "What is required for First Division in Pakistan?",
        answer: "In Pakistan, First Division is traditionally defined by a minimum of 60% aggregate marks. HEC does not prescribe a single nationwide CGPA threshold for First Division, as grading curves and passing criteria vary by university."
      }
    );
  }
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
    faqs,
    fieldNote,
    workedExamples,
    referenceTable
  };
}

// scripts/generate-llms-full.ts
var sitemapXml = fs.readFileSync(path.resolve(process.cwd(), "public/sitemap.xml"), "utf-8");
var canonicalUrlCount = (sitemapXml.match(/<loc>/g) || []).length;
function generateLlmsFullText() {
  const sections = [];
  sections.push(`# Omega X Converter \u2014 Comprehensive Agent & LLM Knowledge Base

> Complete architectural, metrological, and routing reference for Omega X Converter, published by NumanX Studio.

- Canonical Origin: ${DEFAULT_SITE_URL}/
- Publisher: NumanX Studio
- License: Creative Commons Attribution 4.0 International (CC BY 4.0)
- Canonical XML Sitemap: ${DEFAULT_SITE_URL}/sitemap.xml
- Concise Agent Guide: ${DEFAULT_SITE_URL}/llms.txt
- Total Canonical Indexable Inventory: ${canonicalUrlCount} URLs
`);
  sections.push(`## 1. System Architecture & Metrology Standards

Omega X Converter is a client-side progressive web application (PWA) built with TypeScript, React 19, and Vite. The conversion engine evaluates conversions deterministically in the user's browser using floating-point and affine transformations based on authoritative international standards.

### Standards Grounding & Institutional Provenance
- **BIPM (Bureau International des Poids et Mesures):** SI Brochure (9th Edition, 2019) defining the redefinition of base SI units in terms of invariant fundamental physical constants.
- **NIST (National Institute of Standards and Technology):** Special Publication 811 (Guide for the Use of the International System of Units) and SP 1038 for international conversion exact factors (e.g., 1 inch = 0.0254 m exactly; 1 avoirdupois pound = 0.45359237 kg exactly).
- **ISO/IEC 80000:** International Quantities and Units standards (Parts 1\u201314), specifically standardizing binary prefix definitions (KiB = 1024 B, MiB = 1024 KiB) vs metric decimal prefixes (KB = 1000 B, MB = 1000 KB).
- **CODATA (Committee on Data for Science and Technology):** 2022 internationally recommended values of fundamental physical constants.
- **WMO (World Meteorological Organization):** Guide to Meteorological Instruments and Methods of Observation for temperature scale representations.

*Institutional Disclaimer:* Institutional citations establish factual source provenance for measurement definitions only. The BIPM, NIST, ISO, IEC, CODATA, and WMO do not endorse, sponsor, or certify Omega X Converter.
`);
  sections.push(`## 2. Core Public Application Pages (11 URLs)

All primary interactive features are accessed via deterministic canonical URLs:

- **Home Workspace:** ${canonicalUrl("/")}
  Multi-unit interactive workspace with real-time conversion, history drawer, and category search.
- **Universal Converter:** ${canonicalUrl("/converter")}
  Unified converter interface with category dropdown, unit selectors, swap function, and dynamic formula display.
- **Categories Directory:** ${canonicalUrl("/categories")}
  Full catalog of all ${Categories.length} supported conversion categories with unit counts and measurement dimensions.
- **Formula Explorer:** ${canonicalUrl("/formulas")}
  Interactive directory of algebraic conversion formulas, dimensional scale factors, and mathematical definitions.
- **Scientific Calculator:** ${canonicalUrl("/calculator")}
  Client-side mathematical calculator with standard arithmetic, trigonometry, powers, and logs.
- **Educational Blog:** ${canonicalUrl("/blog")}
  Engineering, metrology, and unit history articles written by NumanX Studio editorial teams.
- **About & Standards:** ${canonicalUrl("/about")}
  Editorial governance, source citations, privacy statement, and conversion engine architecture.
- **XML Sitemap:** ${canonicalUrl("/sitemap")}
  Human-navigable sitemap page mirroring the authoritative machine-readable XML sitemap.
- **Contact:** ${canonicalUrl("/contact")}
  How to report a wrong conversion, a security issue or a privacy question.
- **Privacy Policy:** ${canonicalUrl("/privacy")}
  No accounts, ads, cookies or analytics; history and settings stay in the browser's local storage.
- **Terms of Use:** ${canonicalUrl("/terms")}
  Accuracy, third-party price data, acceptable use and CC BY 4.0 content licensing.
`);
  sections.push(`## 3. Supported Measurement Categories (${Categories.length} Categories)

Omega X Converter provides complete unit coverage across ${Categories.length} distinct physical and financial domains:
`);
  for (const cat of Categories) {
    const url = canonicalUrl(`/convert/${cat.id}`);
    const unitList = cat.un.map((u) => `${u.lb} (${u.id})`).join(", ");
    const baseUnit = cat.un.find((u) => u.r === 1)?.lb || cat.un[0]?.lb || "Base unit";
    sections.push(`### ${cat.lb} (\`${cat.id}\`)
- **Canonical URL:** ${url}
- **Base Reference Unit:** ${baseUnit}
- **Registered Units (${cat.un.length}):** ${unitList}
- **Description:** Deterministic measurement conversions for ${cat.lb.toLowerCase()}.
`);
  }
  sections.push(`## 4. Curated Popular Conversion Pairs (${CANONICAL_PAIR_SET.size} Canonical Pairs)

Each curated pair page provides route-specific editorial commentary, exact conversion formulas, step-by-step arithmetic examples, and reciprocal pair navigation:
`);
  let pairCount = 0;
  for (const cat of Categories) {
    const content = categoryContent[cat.id];
    if (content?.popularPairs) {
      for (const pair of content.popularPairs) {
        pairCount++;
        const cleanSlug2 = (s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        const fromSlug = cleanSlug2(pair.from);
        const toSlug = cleanSlug2(pair.to);
        const pairParam = `${fromSlug}-to-${toSlug}`;
        const url = canonicalUrl(`/convert/${cat.id}/${pairParam}`);
        const u1 = findUnit(cat, pair.from);
        const u2 = findUnit(cat, pair.to);
        let formula = `Multiply ${pair.from} by conversion factor to obtain ${pair.to}.`;
        if (u1 && u2) {
          const editorial = getPairEditorial(cat, u1, u2, pairParam);
          if (editorial?.formula) {
            formula = editorial.formula;
          }
        }
        sections.push(`${pairCount}. **${pair.from} to ${pair.to}** (\`${cat.id}\`)
   - URL: ${url}
   - Formula: ${formula}
`);
      }
    }
  }
  sections.push(`## 5. Educational Guides (${Object.keys(guideContent).length} Guides)

Comprehensive technical guides detailing unit origins, math shortcuts, and real-world applications:
`);
  for (const guide of Object.values(guideContent)) {
    if (guide.slug) {
      const url = canonicalUrl(`/guides/${guide.slug}`);
      const guideRecord = guide;
      sections.push(`### ${guide.title}
- **Canonical URL:** ${url}
- **Category:** ${typeof guide.relatedCat === "string" && guide.relatedCat || typeof guideRecord.category === "string" && guideRecord.category || "General"}
- **Target Measurement System:** ${typeof guide.metaDesc === "string" && guide.metaDesc || typeof guideRecord.subtitle === "string" && guideRecord.subtitle || "Educational conversion guide."}
`);
    }
  }
  sections.push(`## 6. Technical Blog Articles (6 Articles)

In-depth technical publications on dimensional metrology, machinist tolerances, and computational architecture:
`);
  for (const post of BLOG_POSTS) {
    if (post.slug) {
      const url = canonicalUrl(`/blog/${post.slug}`);
      sections.push(`### ${post.title}
- **Canonical URL:** ${url}
- **Date Published:** ${post.date}
- **Editorial Byline:** ${post.author} (NumanX Studio)
- **Category:** ${post.category} (${post.relatedCat})
- **Summary:** ${post.excerpt}
`);
    }
  }
  sections.push(`## 7. Machine Usage, Search Engine Protocols & Agent Guidelines

### Nature of Discovery Documents
- Both \`llms.txt\` and \`llms-full.txt\` follow an emerging community convention and proposal for providing concise, LLM-oriented site documentation. They are not formal web standards, nor do they carry guarantees of crawler ingestion, AI discovery, ranking benefit, or model citation.

### Canonical URL & Route Policy
- All public URLs are normalized, lowercase, and strictly enforce the production domain \`${DEFAULT_SITE_URL}\`.
- Query strings (\`?from=...\`, \`?to=...\`, \`?value=...\`) are handled dynamically on the client for live input sharing, but canonical URLs in metadata, sitemaps, and discovery files are stripped of query parameters.
- Private, session-based routes (\`/dashboard\`, \`/favorites\`, \`/history\`, \`/settings\`, \`/custom-units\`, \`/help\`, \`/404\`) rely on local browser storage, are tagged \`noindex\`, and are excluded from the sitemap.

### IndexNow Protocol Architecture & Verification Semantics
- IndexNow is a search-engine notification protocol supported by Microsoft Bing, Yandex, Seznam, and Naver. Google Search does not participate in IndexNow.
- **Verification Key Semantics:** An IndexNow verification key is a public domain-ownership token required by the protocol to match a publicly accessible key file at the website root (e.g. \`https://<domain>/<key>.txt\`). The key file is public by design and is not a private API credential. In contrast, unrelated deployment credentials (such as CI/CD deployment tokens or repository access secrets) must remain strictly private.
- **Production Integration Boundary:** In this static architecture, IndexNow integration is architected for post-deployment CI/CD automation. Any future CI/CD implementation must account for two distinct requirements: (1) publishing the public key file at the production root, and (2) issuing the post-deployment HTTP POST notification only after successful deployment to production.
- **Local Environment Boundary:** Local builds and test suites must never make live IndexNow network requests. No IndexNow network submission has occurred or is executed during build.
- **No Indexing Guarantees:** Notification via IndexNow signals URL updates to participating search engines; it does not guarantee crawling priority, immediate indexation, or search ranking.

### Agent Discovery & Model Context Protocol (MCP) Readiness
- **WebMCP / Agent Endpoint Status:** No native WebMCP implementation was added because no verified supported runtime or interface is currently present in the application architecture.
- **Genuine Machine Readiness:** Machine readability is provided via standard semantic HTML, OpenGraph metadata, JSON-LD structured data (Schema.org WebApplication, BreadcrumbList, FAQPage, HowTo, BlogPosting), deterministic canonical URL structures, and these public \`llms.txt\` and \`llms-full.txt\` discovery documents.

### Privacy, Telemetry & Client Boundaries
- Omega X Converter does not collect personally identifiable information (PII).
- Calculations execute locally in client memory.
- No analytics trackers, marketing pixels, or advertising cookies are loaded.
`);
  return sections.join("\n");
}
function generateLlmsSummaryText() {
  return `# Omega X Converter

> Universal unit conversion platform with ${Categories.length} physical categories, deterministic conversion algorithms, offline PWA capabilities, and authoritative scientific standards alignment.

Omega X Converter is a client-side unit conversion web application developed and published by NumanX Studio. It provides exact, deterministic conversions across length, mass, temperature, area, volume, digital data, energy, pressure, speed, time, and other scientific and everyday measurement systems. All calculations execute locally in the user's browser with zero tracking, zero advertising cookies, and zero server-side telemetry.

Canonical Origin: ${DEFAULT_SITE_URL}/
Publisher: NumanX Studio
License: Creative Commons Attribution 4.0 International (CC BY 4.0)
XML Sitemap: ${DEFAULT_SITE_URL}/sitemap.xml
Full Agent Documentation: ${DEFAULT_SITE_URL}/llms-full.txt

## Primary Public Resources

- [Home](${canonicalUrl("/")}): Main interactive universal conversion workspace with multi-category search, unit selection, and real-time computation.
- [Universal Converter](${canonicalUrl("/converter")}): Dedicated conversion tool interface supporting all ${Categories.length} measurement categories.
- [Categories Directory](${canonicalUrl("/categories")}): Complete index of all ${Categories.length} conversion categories with unit counts and reference standards.
- [Formula Explorer](${canonicalUrl("/formulas")}): Mathematical conversion formulas, dimensional constants, and algebraic transformation rules.
- [Scientific Calculator](${canonicalUrl("/calculator")}): Standard and scientific arithmetic calculator with trigonometric, logarithmic, and power functions.
- [Educational Blog](${canonicalUrl("/blog")}): Technical articles on metrology, fractional machinist units, historical systems, and data prefixes.
- [Conversion Guides Hub](${canonicalUrl("/guides")}): Step-by-step conversion guides with formula derivations, worked examples, and reference tables across scientific, regional, and computing units.
- [About & Standards Methodology](${canonicalUrl("/about")}): Overview of conversion engine architecture, institutional standards citations (NIST, BIPM, ISO, CODATA), and project governance.
- [HTML Sitemap](${canonicalUrl("/sitemap")}): Authoritative index of every canonical public page.
- [Contact](${canonicalUrl("/contact")}): How to report a wrong conversion, a security issue or a privacy question.
- [Privacy Policy](${canonicalUrl("/privacy")}): No accounts, ads, cookies or analytics; history and settings stay in the browser.
- [Terms of Use](${canonicalUrl("/terms")}): Accuracy, third-party price data and content licensing.

## Category Landings

- [Length](${canonicalUrl("/convert/length")}): Meters, feet, inches, centimeters, kilometers, miles, yards, millimeters, nautical miles, micrometers, nanometers.
- [Area](${canonicalUrl("/convert/area")}): Square meters, square feet, acres, hectares, square kilometers, square miles.
- [Volume](${canonicalUrl("/convert/volume")}): Liters, milliliters, gallons, cubic meters, cubic feet, fluid ounces, cups.
- [Mass & Weight](${canonicalUrl("/convert/mass")}): Kilograms, grams, pounds, ounces, metric tons, milligrams, stones, carats.
- [Temperature](${canonicalUrl("/convert/temp")}): Celsius, Fahrenheit, Kelvin, Rankine with exact affine zero-offset formulas.
- [Time](${canonicalUrl("/convert/time")}): Seconds, minutes, hours, days, weeks, months, years, milliseconds, microseconds.
- [Speed](${canonicalUrl("/convert/speed")}): Meters per second, kilometers per hour, miles per hour, knots, feet per second.
- [Acceleration](${canonicalUrl("/convert/acceleration")}): Meters per second squared, standard gravity (g), feet per second squared, gal.
- [Force](${canonicalUrl("/convert/force")}): Newtons, kilonewtons, pound-force, dyne, kilogram-force.
- [Pressure](${canonicalUrl("/convert/pressure")}): Pascals, bars, PSI, atmospheres, millimeters of mercury, kilopascals.
- [Energy](${canonicalUrl("/convert/energy")}): Joules, calories, kilowatt-hours, British thermal units (BTU), electronvolts.
- [Power](${canonicalUrl("/convert/power")}): Watts, kilowatts, horsepower, megawatts, gigawatts.
- [Electricity & Current](${canonicalUrl("/convert/electricity")}): Amperes, milliamperes, kiloamperes, microamperes, coulombs, volts, ohms, farads.
- [Magnetism](${canonicalUrl("/convert/magnetism")}): Tesla, gauss, weber, maxwell.
- [Frequency](${canonicalUrl("/convert/frequency")}): Hertz, kilohertz, megahertz, gigahertz, revolutions per minute.
- [Digital Storage](${canonicalUrl("/convert/data")}): Bytes, kilobytes, megabytes, gigabytes, terabytes, kibibytes, mebibytes, gibibytes (decimal vs binary prefixes).
- [Data Transfer Rate](${canonicalUrl("/convert/datatransfer")}): Bits per second, megabits per second, gigabits per second, megabytes per second.
- [Angle](${canonicalUrl("/convert/angle")}): Degrees, radians, gradians, arcminutes, arcseconds.
- [Torque](${canonicalUrl("/convert/torque")}): Newton-meters, pound-feet, pound-inches.
- [Fuel Economy](${canonicalUrl("/convert/fuel")}): Miles per gallon (US), liters per 100 km, kilometers per liter.
- [Density](${canonicalUrl("/convert/density")}): Kilograms per cubic meter, grams per cubic centimeter, pounds per cubic foot.
- [Cooking](${canonicalUrl("/convert/cooking")}): Cups, tablespoons, teaspoons, fluid ounces, milliliters, grams (ingredient-aware).
- [Textile & Yarn Count](${canonicalUrl("/convert/textile")}): Tex, denier, cotton count (Ne), worsted count, metric count (Nm), oz/yd\xB2, and momme.
- [Astronomy](${canonicalUrl("/convert/astronomy")}): Astronomical units (au), light-years, parsecs, kilometers, miles.
- [Number Base & Radix](${canonicalUrl("/convert/number-base")}): Binary, octal, decimal, hexadecimal, BCD, Gray code, and two's complement.
- [IEEE-754 Floating-Point](${canonicalUrl("/convert/ieee-754")}): Half (FP16), single (FP32), double (FP64), and hexadecimal float bitfield inspection.
- [South Asian Numbering](${canonicalUrl("/convert/pk-numbering")}): Hazar, Lakh, Crore, Arab, Kharab, and Million/Billion 2,2,3 grouping.
- [Statistics & Odds](${canonicalUrl("/convert/statistics")}): Z-score, percentiles, two-tailed p-values, decimal odds, fractional odds, and American moneyline.
- [Matrix & Array Formats](${canonicalUrl("/convert/matrix-format")}): CSV grids, LaTeX bmatrix/pmatrix, Python NumPy, MATLAB, and JSON 2D arrays.
- [Scientific & Parts-Per](${canonicalUrl("/convert/scientific-notation")}): Standard decimal, engineering notation, ppm, ppb, and percentages.
- [HEC GPA & Marks](${canonicalUrl("/convert/pk-gpa")}): Pakistani HEC 4.00/5.00 CGPA, percentage marks, matric/FSc, and MDCAT aggregate.

## Educational Guides

- [Binary, Hex & IEEE-754 Floating-Point Guide](${canonicalUrl("/guides/binary-hex-ieee-754-guide")}): Radix conversion and bitfield inspection for FP16, FP32, and FP64.
- [Cups to Grams Cooking Guide](${canonicalUrl("/guides/cups-to-grams")}): Ingredient-specific volumetric kitchen conversion.
- [Lakh & Crore to Million & Billion Converter Guide](${canonicalUrl("/guides/lakh-crore-to-million-billion")}): South Asian 2,2,3 comma grouping and international conversion.

## Technical Articles

- [Compound Length Units in Construction](${canonicalUrl("/blog/compound-length-units-guide")}): Working with feet-and-inches, architectural notation, and precision tolerances.
- [Fractional Inches to Millimeters](${canonicalUrl("/blog/fractional-inches-to-mm-best-practices")}): Reference chart and tolerance best practices for machinists and engineers.
- [Metric vs Imperial Engineering Standards](${canonicalUrl("/blog/metric-vs-imperial-engineering-guide")}): Analysis of global dual-unit documentation in aerospace, automotive, and civil engineering.
- [Thermodynamic Temperature Scales](${canonicalUrl("/blog/temperature-scales-celsius-fahrenheit-kelvin")}): Deep dive into absolute zero, Boltzmann's constant, and ITS-90 temperature standards.
- [Digital Storage Measurement](${canonicalUrl("/blog/digital-data-storage-units-guide")}): Hardware disk capacity versus operating system reported file sizes.
- [AI-Assisted Conversion Architecture](${canonicalUrl("/blog/ai-powered-unit-conversions-in-2026")}): Local client regex and natural-language pattern matching for rapid unit extraction without remote data transmission.

## Machine Usage & Agent Guidelines

- Nature of this File: \`llms.txt\` is an emerging community convention and proposal for providing concise, LLM-oriented site documentation. It is not a formal web standard and carries no guarantee of crawler ingestion, AI discovery, ranking benefit, or model citation.
- URL Structure: All public routes follow deterministic paths: \`/convert/{category}\` for category landings and \`/convert/{category}/{from}-to-{to}\` for unit pairs.
- Scientific Grounding: Conversion factors follow the BIPM SI Brochure (9th Edition) and NIST Special Publication 811.
- No Commercial Endorsement: Institutional references (NIST, BIPM, ISO, IEC, CODATA, WMO) represent scientific source provenance only and do not imply institutional endorsement.
- Privacy & State: The application runs entirely on the client. Routes such as \`/history\`, \`/favorites\`, \`/settings\`, \`/custom-units\`, \`/help\`, and \`/dashboard\` rely on browser LocalStorage, are tagged noindex, and are not public indexable URLs.
`;
}
function run() {
  const content = generateLlmsFullText();
  const summary = generateLlmsSummaryText();
  const cwd = process.cwd();
  fs.writeFileSync(path.resolve(cwd, "public/llms-full.txt"), content, "utf-8");
  fs.writeFileSync(path.resolve(cwd, "public/llms.txt"), summary, "utf-8");
  console.log("\u2705 Generated public/llms-full.txt and public/llms.txt successfully.");
  const distDir = path.resolve(cwd, "dist");
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.resolve(distDir, "llms-full.txt"), content, "utf-8");
    fs.writeFileSync(path.resolve(distDir, "llms.txt"), summary, "utf-8");
    console.log("\u2705 Generated dist/llms-full.txt and dist/llms.txt successfully.");
  }
}
run();
export {
  generateLlmsFullText,
  generateLlmsSummaryText,
  run
};
