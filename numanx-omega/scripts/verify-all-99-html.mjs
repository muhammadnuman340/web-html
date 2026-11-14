// scripts/verify-all-99-html.ts
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
  defaultDescription: "Free universal unit converter platform with 28 categories, 220+ units, formula charts, and instant precision.",
  license: "https://creativecommons.org/licenses/by/4.0/"
};

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

// src/config/pairEditorial.ts
function cleanSlug(s) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
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

// scripts/verify-all-99-html.ts
var siteUrl = getSiteUrl();
var distDir = path.resolve(process.cwd(), "dist");
var distConvert = path.join(distDir, "convert");
if (!fs.existsSync(distConvert)) {
  console.error('Error: dist/convert directory not found. Please run "npm run build" first.');
  process.exit(1);
}
var discoveredPairs = [];
for (const cat of fs.readdirSync(distConvert)) {
  const catPath = path.join(distConvert, cat);
  if (!fs.statSync(catPath).isDirectory()) continue;
  for (const file of fs.readdirSync(catPath)) {
    if (!file.endsWith(".html")) continue;
    const pair = file.replace(/\.html$/, "");
    const htmlPath = path.join(catPath, file);
    discoveredPairs.push({ cat, pair, htmlPath, relRoute: `/convert/${cat}/${pair}` });
  }
}
console.log(`Discovered ${discoveredPairs.length} pair pages in dist/convert/`);
if (discoveredPairs.length !== CANONICAL_PAIR_SET.size) {
  console.error(`FAIL: Expected exactly ${CANONICAL_PAIR_SET.size} canonical pair files, found ${discoveredPairs.length}`);
  process.exit(1);
}
var routeSet = /* @__PURE__ */ new Set();
for (const p of discoveredPairs) {
  if (routeSet.has(p.relRoute)) {
    console.error(`FAIL: Duplicate pair route detected: ${p.relRoute}`);
    process.exit(1);
  }
  routeSet.add(p.relRoute);
}
var totalPassed = 0;
var totalErrors = 0;
for (const { htmlPath, relRoute } of discoveredPairs) {
  const html = fs.readFileSync(htmlPath, "utf8");
  const errors = [];
  const canonicalMatch = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i) || html.match(/<link[^>]+href="([^"]+)"[^>]+rel="canonical"/i);
  if (!canonicalMatch) {
    errors.push("Missing canonical <link> tag");
  } else {
    const canonicalUrl = canonicalMatch[1];
    if (canonicalUrl.includes("?") || canonicalUrl.includes("#")) {
      errors.push(`Canonical URL contains query or fragment: ${canonicalUrl}`);
    }
    const expectedCanonical = `${siteUrl}${relRoute}`;
    if (canonicalUrl !== expectedCanonical) {
      errors.push(`Canonical mismatch: expected ${expectedCanonical}, got ${canonicalUrl}`);
    }
  }
  if (!html.includes('id="aeo-answer-heading"') && !html.includes("Quick Direct Answer")) {
    errors.push("Missing AEO direct answer card (#aeo-answer-heading)");
  }
  if (!html.includes('id="explanation-heading"') && !html.includes("How ") && !html.includes("Relate")) {
    errors.push("Missing metrological explanation heading (#explanation-heading)");
  }
  if (!html.includes('id="usecases-heading"') && !html.includes("Practical Applications & Industry Use Cases")) {
    errors.push("Missing practical use cases section (#usecases-heading)");
  }
  if (!html.includes('id="reciprocal-heading"') && !html.includes("Related & Reciprocal Conversions")) {
    errors.push("Missing reciprocal conversions section (#reciprocal-heading)");
  }
  const schemaMatch = html.match(/<script id="omega-page-schema"[^>]*>([\s\S]*?)<\/script>/);
  if (!schemaMatch) {
    errors.push("Missing omega-page-schema JSON-LD script");
  } else {
    try {
      const schema = JSON.parse(schemaMatch[1]);
      const graph = schema["@graph"] || [schema];
      const faqNode = graph.find((n) => n["@type"] === "FAQPage");
      if (!faqNode) {
        errors.push("Missing FAQPage node in schema graph");
      } else if (!faqNode.mainEntity || faqNode.mainEntity.length < 2) {
        errors.push(`FAQPage mainEntity has insufficient Q&As: ${faqNode.mainEntity?.length || 0}`);
      } else {
        for (const qna of faqNode.mainEntity) {
          if (!html.includes(qna.name)) {
            errors.push(`FAQ Question "${qna.name}" in schema is NOT visible in static HTML`);
          }
        }
      }
    } catch (e) {
      errors.push(`Invalid JSON-LD schema: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  const mainMatch = html.match(/<main[\s\S]*?<\/main>/i);
  if (!mainMatch) {
    errors.push("Missing <main> semantic element");
  } else {
    const mainText = mainMatch[0];
    if (mainText.includes("NaN")) errors.push('Found "NaN" in main content');
    if (mainText.includes("undefined")) errors.push('Found "undefined" in main content');
    if (mainText.includes("Infinity")) errors.push('Found "Infinity" in main content');
    if (mainText.includes("[object Object]")) errors.push('Found "[object Object]" in main content');
  }
  if (errors.length > 0) {
    console.error(`FAILED: ${relRoute}`);
    errors.forEach((e) => console.error(`  - ${e}`));
    totalErrors += errors.length;
  } else {
    totalPassed++;
  }
}
console.log(`--- ${CANONICAL_PAIR_SET.size} PAIR PRERENDER VALIDATION RESULTS ---`);
console.log(`Total canonical pairs validated: ${discoveredPairs.length}`);
console.log(`Passed: ${totalPassed} / ${CANONICAL_PAIR_SET.size}`);
console.log(`Failed: ${totalErrors > 0 ? discoveredPairs.length - totalPassed : 0} / ${CANONICAL_PAIR_SET.size}`);
console.log(`Total invariant defects: ${totalErrors}`);
if (totalPassed === CANONICAL_PAIR_SET.size && totalErrors === 0) {
  console.log(`\u2705 ALL ${CANONICAL_PAIR_SET.size} CANONICAL PAIR PRERENDERED HTML FILES MEET ALL INVARIANTS.`);
  process.exit(0);
} else {
  console.error("\u274C VALIDATION FAILED.");
  process.exit(1);
}
