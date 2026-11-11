// scripts/prerender-seo.ts
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
      { id: "yd", lb: "Yard", r: 0.9144, s: "I" },
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
      { id: "twp", lb: "Township", r: 9324e4, s: "I" }
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
      { id: "lg tn", lb: "Long Ton", r: 1016.05, s: "I" }
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
    ic: "\u26A1",
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
    ic: "\u{1F4A1}",
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

// src/config/pageMeta.ts
var BRAND_SUFFIX = " | Omega X Converter";
var MAX_TITLE = 65;
function withBrand(title) {
  if (title.includes("\u2014") || title.includes("|")) return title;
  return title.length + BRAND_SUFFIX.length <= MAX_TITLE ? title + BRAND_SUFFIX : title;
}
var PAGE_META = {
  "/": {
    title: "Omega X Converter \u2014 Free Unit Converter",
    description: "Free unit converter with 28 categories and 220+ units, plus formulas and offline support. Runs in your browser."
  },
  "/about": {
    title: "About Omega X Converter \u2014 NumanX Studio",
    description: "About Omega X Converter by NumanX Studio: private, client-side unit conversion built on NIST SP 811 and SI standards, with offline PWA support."
  },
  "/blog": {
    title: "Unit Conversion Blog \u2014 Guides & Tips | Omega X",
    description: "Guides, tutorials, formulas and cheat sheets for length, weight, temperature, data and precision conversions from NumanX Studio."
  },
  "/calculator": {
    title: "Scientific Calculator \u2014 Engineering Math | Omega X",
    description: "Free scientific and engineering calculator with trigonometric functions, memory, formula history and built-in unit conversion."
  },
  "/categories": {
    title: "All 28 Unit Conversion Categories | Omega X",
    description: "Browse all 28 measurement categories: length, mass, temperature, area, volume, pressure, data, energy and more, each with its own converter."
  },
  "/converter": {
    title: "Universal Unit Converter \u2014 28 Categories | Omega X",
    description: 'Convert metric, imperial, scientific and astronomical units across 28 categories. Type naturally, like "5 km in miles", and get an instant answer.'
  },
  "/formulas": {
    title: "Unit Conversion Formulas & Constants | Omega X",
    description: "Reference library of conversion formulas, constants and worked derivations across all 28 measurement categories."
  },
  "/health": {
    title: "Health Calculators \u2014 BMI, BMR & Body Metrics | Omega X",
    description: "Free BMI and BMR calculators: check your body mass index category and estimate daily calories burned at rest. General estimates, not medical advice."
  },
  "/sitemap": {
    title: "Sitemap \u2014 All Converters, Guides & Articles | Omega X",
    description: "Directory of every public page on Omega X: core tools, 28 conversion categories, popular conversion pairs, guides and blog articles."
  },
  "/privacy": {
    title: "Privacy Policy \u2014 No Tracking, Local-Only Data | Omega X",
    description: "How Omega X Converter handles data: no accounts, ads, cookies or analytics. Your history and settings stay in your browser. Read what is stored and why."
  },
  "/terms": {
    title: "Terms of Use | Omega X Converter",
    description: "Terms for using Omega X Converter: accuracy of conversions, health calculator limits, acceptable use and content licensing."
  },
  "/contact": {
    title: "Contact Omega X Converter \u2014 NumanX Studio",
    description: "Contact NumanX Studio about Omega X Converter: report a wrong conversion, a security issue or a privacy question."
  }
};

// src/config/legal.ts
var LEGAL = {
  operator: "NumanX Studio",
  /** Set once the new domain's mailbox exists. Until then the contact page says email is coming soon and security.txt is not published. */
  contactEmail: "",
  /** Country whose law governs the terms, e.g. 'Pakistan'. The clause is omitted until this is set. */
  governingLaw: "",
  lastUpdated: "2026-10-29"
};
var DISCLAIMERS = {
  health: "Results are general estimates for information only, not medical advice. Talk to a qualified health professional about your health.",
  finance: "Rates come from third-party providers and may be delayed or cached. For information only, not financial advice and not suitable for trading."
};
function contactSentence() {
  return LEGAL.contactEmail ? `Email us at ${LEGAL.contactEmail}.` : "A dedicated contact email is being set up and will be published on our Contact page soon.";
}
function getPrivacyPolicy() {
  return {
    path: "/privacy",
    h1: "Privacy Policy",
    intro: `This policy explains what data Omega X Converter, operated by ${LEGAL.operator}, handles when you use it. In short: there are no accounts, no ads, no analytics or tracking cookies, and every conversion is calculated in your browser.`,
    sections: [
      {
        heading: "What stays on your device",
        paragraphs: [
          "To remember your preferences and make features work, the app saves the following in your browser's local storage. This data never leaves your device and we cannot see it:"
        ],
        bullets: [
          "Settings: theme, font, decimal precision, app mode, haptic feedback and default units.",
          "Your content: conversion history, favorites, custom units and AI assistant chat history.",
          "Usage statistics shown only to you on the dashboard: conversion counts, streaks and frequently used conversions."
        ]
      },
      {
        heading: "Offline support",
        paragraphs: [
          "The app installs a service worker that stores copies of its pages and files in your browser cache, so it can load without an internet connection. Like local storage, this cache stays on your device."
        ]
      },
      {
        heading: "Requests to other services",
        paragraphs: [
          "A few features need data from outside services. When they run, your browser connects to those services directly, which means they can see your IP address and basic browser information, as any website can. The numbers you convert are never sent."
        ],
        bullets: [
          "The website is hosted by Netlify, which keeps standard server logs (such as IP address, browser type and the page requested) to operate and secure the service."
        ]
      },
      {
        heading: "What we do not do",
        paragraphs: [
          "We do not use cookies, advertising, analytics or tracking tools, and we do not sell or share personal data. Fonts are served from our own website rather than a third-party font service."
        ]
      },
      {
        heading: "Deleting your data",
        paragraphs: [
          `Use "Clear All Data" on the Settings page to delete your history, favorites, custom units, chat history, usage statistics and cached rates. Clearing your browser's site data for this website removes everything, including settings and the offline cache.`
        ]
      },
      {
        heading: "Children",
        paragraphs: [
          "The app does not ask for or collect personal information from anyone, including children."
        ]
      },
      {
        heading: "Changes to this policy",
        paragraphs: [
          `If the app starts handling data differently, we will update this page and its "last updated" date. Last updated: ${LEGAL.lastUpdated}.`
        ]
      },
      {
        heading: "Contact",
        paragraphs: [`Questions about privacy? ${contactSentence()}`]
      }
    ]
  };
}
function getTerms() {
  const sections = [
    {
      heading: "Using the service",
      paragraphs: [
        `Omega X Converter is a free tool operated by ${LEGAL.operator}. By using it you agree to these terms. If you do not agree, please do not use the service.`
      ]
    },
    {
      heading: "Accuracy of conversions",
      paragraphs: [
        "Conversions use published standard factors (such as NIST SP 811 and the BIPM SI Brochure) and are checked by automated tests, but no tool is free of errors. Results are provided for general information. Double-check any value used for engineering, medical, legal, safety-critical or financial decisions with an authoritative source."
      ]
    },
    {
      heading: "Health calculators",
      paragraphs: [
        "BMI, BMR and other health results are general estimates. They are not medical advice and do not replace guidance from a qualified health professional."
      ]
    },
    {
      heading: "Acceptable use",
      paragraphs: ["Please do not:"],
      bullets: [
        "Attempt to disrupt, overload or gain unauthorized access to the service or its hosting.",
        "Scrape or download the site in a way that degrades it for other visitors.",
        "Present the service or its content as your own without the attribution described below."
      ]
    },
    {
      heading: "Content and attribution",
      paragraphs: [
        `Written content on this site (articles, guides and explanations) is licensed under Creative Commons Attribution 4.0 (CC BY 4.0): you may reuse it if you credit "Omega X Converter by ${LEGAL.operator}" and link back. The Omega X name, logo and the app itself are not covered by that license.`
      ]
    },
    {
      heading: "Third-party services",
      paragraphs: [
        "The service relies on third parties for hosting and price data, and links to outside references such as NIST and BIPM. We are not responsible for their content or availability."
      ]
    },
    {
      heading: "No warranty and limitation of liability",
      paragraphs: [
        `The service is provided "as is" and "as available", without warranties of any kind. To the fullest extent permitted by law, ${LEGAL.operator} is not liable for any loss or damage arising from use of the service or reliance on its results.`
      ]
    },
    {
      heading: "Changes",
      paragraphs: [
        `We may update these terms. Continued use after an update means you accept the new version. Last updated: ${LEGAL.lastUpdated}.`
      ]
    }
  ];
  if (LEGAL.governingLaw) {
    sections.push({
      heading: "Governing law",
      paragraphs: [`These terms are governed by the laws of ${LEGAL.governingLaw}.`]
    });
  }
  sections.push({ heading: "Contact", paragraphs: [`Questions about these terms? ${contactSentence()}`] });
  return {
    path: "/terms",
    h1: "Terms of Use",
    intro: "These terms cover your use of Omega X Converter, including its unit converters, calculators, guides and articles.",
    sections
  };
}
function getContactPage() {
  return {
    path: "/contact",
    h1: "Contact",
    intro: `Omega X Converter is built and maintained by ${LEGAL.operator}. ${contactSentence()}`,
    sections: [
      {
        heading: "Report a wrong conversion",
        paragraphs: [
          "If a result looks wrong, tell us the page address, the value you entered and the result you expected. Accuracy reports are our top priority."
        ]
      },
      {
        heading: "Security",
        paragraphs: [
          LEGAL.contactEmail ? `To report a security vulnerability, email ${LEGAL.contactEmail} with details and steps to reproduce. Please give us reasonable time to fix the issue before disclosing it publicly. Our security contact is also listed in /.well-known/security.txt.` : "To report a security vulnerability, please use the contact email once it is published here. Please give us reasonable time to fix the issue before disclosing it publicly."
        ]
      },
      {
        heading: "Privacy",
        paragraphs: [
          "We do not collect personal data, so there is no account or profile to request or delete. See the Privacy Policy for details on what stays in your browser."
        ]
      }
    ]
  };
}
function buildSecurityTxt(siteUrl, now = /* @__PURE__ */ new Date()) {
  if (!LEGAL.contactEmail) return null;
  const expires = new Date(now);
  expires.setFullYear(expires.getFullYear() + 1);
  return [
    `Contact: mailto:${LEGAL.contactEmail}`,
    `Expires: ${expires.toISOString().replace(/\.\d{3}Z$/, "Z")}`,
    "Preferred-Languages: en",
    `Canonical: ${siteUrl}/.well-known/security.txt`,
    `Policy: ${siteUrl}/contact`,
    ""
  ].join("\n");
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
function buildGlobalSiteSchema() {
  const siteOrigin2 = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteOrigin2}/#website`,
        url: `${siteOrigin2}/`,
        name: SITE.fullName,
        description: SITE.defaultDescription,
        publisher: {
          "@id": `${siteOrigin2}/#organization`
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteOrigin2}/converter?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "@id": `${siteOrigin2}/#organization`,
        name: SITE.organization,
        url: canonicalUrl("/about"),
        logo: {
          "@type": "ImageObject",
          url: `${siteOrigin2}/favicon.svg`
        }
      }
    ]
  };
}
function buildHomeSchema() {
  const siteOrigin2 = getSiteUrl();
  const homeUrl = `${siteOrigin2}/`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${siteOrigin2}/#software`,
        name: SITE.fullName,
        url: homeUrl,
        description: SITE.defaultDescription,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "All",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        featureList: [
          "28 unit categories including length, mass, volume, temperature",
          "220+ units from metric, imperial, and scientific systems",
          'Natural language input: type "5 km in miles" or "(5m+20cm)\xD72"',
          "Batch conversion mode for 1000+ values at once",
          "Cross-category conversion chains: Energy\u2192Cost, Speed\u2192Distance, Fuel\u2192Cost",
          "Step-by-step conversion explanations and learning content",
          "PWA support: installable, works fully offline",
          "Custom unit creator for user-defined conversions"
        ]
      }
    ]
  };
}
function buildCategoriesDirectorySchema(categories) {
  const pageUrl = canonicalUrl("/categories");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#collection`,
        name: "All Unit Conversion Categories",
        url: pageUrl,
        description: "Directory of all 28 dedicated unit conversion calculators across science, engineering, and commerce."
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: canonicalUrl("/") },
          { "@type": "ListItem", position: 2, name: "Categories", item: pageUrl }
        ]
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#categories`,
        name: "Unit Conversion Categories",
        description: `All ${categories.length} conversion categories available in Omega X Converter`,
        numberOfItems: categories.length,
        itemListElement: categories.map((cat, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: `${cat.lb} Converter`,
          item: canonicalUrl(`/convert/${cat.id}`)
        }))
      }
    ]
  };
}
function buildCategorySchema(category, content) {
  const pageUrl = canonicalUrl(`/convert/${category.id}`);
  const title = content?.title || `${category.lb} Converter \u2014 Instant Precision Calculator`;
  const description = content?.metaDesc || `Free online ${category.lb.toLowerCase()} unit converter. Convert ${category.un.slice(0, 5).map((u) => u.lb).join(", ")} instantly with formulas and printable cheat sheets.`;
  const graph = [
    {
      "@type": "WebApplication",
      "@id": `${pageUrl}#software`,
      name: title,
      url: pageUrl,
      description,
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
        { "@type": "ListItem", position: 3, name: `${category.lb} Converter`, item: pageUrl }
      ]
    }
  ];
  if (content?.faq && content.faq.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      mainEntity: content.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.a
        }
      }))
    });
  }
  return {
    "@context": "https://schema.org",
    "@graph": graph
  };
}
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
function buildGuideSchema(guide) {
  const pageUrl = canonicalUrl(`/guides/${guide.slug}`);
  const catLabel = guide.relatedCat.charAt(0).toUpperCase() + guide.relatedCat.slice(1);
  const graph = [
    {
      "@type": "WebApplication",
      "@id": `${pageUrl}#software`,
      name: guide.title,
      url: pageUrl,
      description: guide.metaDesc,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "All",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: canonicalUrl("/") },
        { "@type": "ListItem", position: 2, name: "Converter", item: canonicalUrl("/converter") },
        { "@type": "ListItem", position: 3, name: catLabel, item: canonicalUrl(`/convert/${guide.relatedCat}`) },
        { "@type": "ListItem", position: 4, name: guide.h1, item: pageUrl }
      ]
    },
    {
      "@type": "HowTo",
      "@id": `${pageUrl}#howto`,
      name: guide.h1,
      description: guide.metaDesc,
      step: guide.steps.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: `Step ${i + 1}`,
        text: s
      }))
    }
  ];
  if (guide.faq && guide.faq.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      mainEntity: guide.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.a
        }
      }))
    });
  }
  return {
    "@context": "https://schema.org",
    "@graph": graph
  };
}
function buildBlogPostSchema(post) {
  const pageUrl = canonicalUrl(`/blog/${post.slug}`);
  const siteOrigin2 = getSiteUrl();
  const graph = [
    {
      "@type": "BlogPosting",
      "@id": `${pageUrl}#article`,
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      dateModified: post.date,
      author: {
        "@type": "Organization",
        name: post.author,
        url: canonicalUrl("/about")
      },
      publisher: {
        "@type": "Organization",
        name: SITE.organization,
        url: canonicalUrl("/about"),
        logo: {
          "@type": "ImageObject",
          url: `${siteOrigin2}/favicon.svg`
        }
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": pageUrl
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: canonicalUrl("/") },
        { "@type": "ListItem", position: 2, name: "Blog", item: canonicalUrl("/blog") },
        { "@type": "ListItem", position: 3, name: post.title, item: pageUrl }
      ]
    }
  ];
  if (post.content.faq && post.content.faq.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      mainEntity: post.content.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.a
        }
      }))
    });
  }
  return {
    "@context": "https://schema.org",
    "@graph": graph
  };
}
function buildBlogIndexSchema(posts) {
  const pageUrl = canonicalUrl("/blog");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${pageUrl}#blog`,
        name: "NumanX Omega Blog \u2014 Precision Metrology & Unit Conversion Guides",
        description: "Expert tips, mathematical formulas, cheat sheets, and tutorials for engineering and scientific unit conversions.",
        url: pageUrl,
        blogPost: posts.map((post) => ({
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.date,
          author: { "@type": "Organization", name: post.author },
          url: canonicalUrl(`/blog/${post.slug}`)
        }))
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: canonicalUrl("/") },
          { "@type": "ListItem", position: 2, name: "Blog", item: pageUrl }
        ]
      }
    ]
  };
}
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
      { from: "Centimeter", to: "Inches", desc: "cm \u2192 in \u2014 product dimensions & body measurements" },
      { from: "Angstrom", to: "Nanometer", desc: "\xC5 \u2192 nm \u2014 crystallography & optics" },
      { from: "Fathom", to: "Foot", desc: "fath \u2192 ft \u2014 nautical depth & marine sounding" }
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
      { from: "Troy Ounce", to: "Ounce", desc: "oz t \u2192 oz \u2014 precious metal vs avoirdupois weight" }
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
function getRelatedPosts(post, limit = 3) {
  const score = (p) => (p.relatedCat === post.relatedCat ? 10 : 0) + p.tags.filter((t) => post.tags.includes(t)).length;
  return BLOG_POSTS.filter((p) => p.slug !== post.slug).map((p, i) => ({ p, s: score(p), i })).sort((a, b) => b.s - a.s || a.i - b.i).slice(0, limit).map((x) => x.p);
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
  },
  {
    guideSlug: "cups-to-grams",
    title: "Cups to Grams",
    categoryId: "cooking",
    categoryName: "Cooking & Recipes",
    categoryPath: "/convert/cooking",
    pairSlug: "stick-of-butter-to-tablespoon",
    pairPath: "/convert/cooking/stick-of-butter-to-tablespoon",
    pairLabel: "Stick of Butter to Tablespoon",
    relatedPostSlugs: [
      "ai-powered-unit-conversions-in-2026"
    ]
  },
  {
    guideSlug: "psi-to-bar",
    title: "PSI to Bar",
    categoryId: "pressure",
    categoryName: "Pressure",
    categoryPath: "/convert/pressure",
    pairSlug: "bar-to-psi",
    pairPath: "/convert/pressure/bar-to-psi",
    pairLabel: "Bar to PSI",
    relatedPostSlugs: [
      "metric-vs-imperial-engineering-guide"
    ]
  },
  {
    guideSlug: "kw-to-hp",
    title: "Kilowatts to Horsepower",
    categoryId: "power",
    categoryName: "Power",
    categoryPath: "/convert/power",
    pairSlug: "metric-horsepower-to-kilowatt",
    pairPath: "/convert/power/metric-horsepower-to-kilowatt",
    pairLabel: "Metric Horsepower to Kilowatt",
    relatedPostSlugs: [
      "metric-vs-imperial-engineering-guide"
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
  const pairSlug = cleanSlug(pairParam);
  const fieldNote = PAIR_FIELD_NOTES[pairSlug] || CATEGORY_FIELD_NOTES[cat.id];
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
    fieldNote
  };
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
    case "illuminance":
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
  },
  flow: {
    aeoCapsule: "Volumetric flow rate conversion calculates fluid displacement volume per unit time. The SI base unit is cubic meters per second (m\xB3/s). Common engineering units include US Gallons per Minute (1 GPM \u2248 0.00006309 m\xB3/s \u2248 3.78541 L/min), Cubic Feet per Minute (1 CFM \u2248 0.00047195 m\xB3/s \u2248 0.47195 L/s), and liters per minute (1 L/min = 0.00001667 m\xB3/s).",
    standardsStatement: "Fluid flow calculations comply with ISO 5167 (Measurement of fluid flow by means of pressure differential devices), ASHRAE HVAC ventilation guidelines, and NIST Special Publication 811 volumetric time rate standards."
  },
  illuminance: {
    aeoCapsule: "Illuminance conversion translates luminous flux received per unit surface area across metric and imperial lighting standards. The SI unit is the Lux (lx, 1 lumen/m\xB2). The imperial unit is the Foot-candle (fc, 1 lumen/ft\xB2). Because 1 square meter equals approx. 10.7639 square feet, 1 foot-candle equals exactly 10.7639104 lux.",
    standardsStatement: "Illuminance algorithms adhere to CIE (International Commission on Illumination) standards, the BIPM SI Brochure (candela base unit realization), and IESNA (Illuminating Engineering Society of North America) workplace lighting guidelines."
  },
  viscosity: {
    aeoCapsule: "Dynamic viscosity conversion measures fluid resistance to gradual deformation by shear or tensile stress. The SI coherent derived unit is the Pascal-second (Pa\xB7s, 1 N\xB7s/m\xB2). In laboratory science and lubrication, the CGS centipoise (cP) is standard: exactly 1 cP = 1 mPa\xB7s = 0.001 Pa\xB7s. Water at 20 \xB0C exhibits a dynamic viscosity of ~1.002 cP.",
    standardsStatement: "Viscosity measurement factors conform to ASTM D445 / ISO 3104 petroleum product testing protocols, BIPM SI specifications, and standard rheological tables for Newtonian and non-Newtonian fluids."
  },
  typography: {
    aeoCapsule: "Typography and digital layout conversion scales font sizes and spacing across CSS, screen pixels, and physical print units. Under the W3C CSS Values and Units Module Level 3, 1 physical inch equals exactly 96 CSS pixels and 72 desktop publishing points (pt), giving 1 pt = 1.33333 px. Standard browser root font size is 16 px (1 rem = 16 px).",
    standardsStatement: "Digital typography factors strictly comply with the W3C CSS Values and Units Module Level 3 specification (96 CSS px/inch standard) and traditional PostScript / DTP typesetting standards (72 points/inch, 12 points per pica)."
  }
};
function getCategoryStandards(catId, catName, unitNames) {
  if (CATEGORY_STANDARDS[catId]) {
    return CATEGORY_STANDARDS[catId];
  }
  return {
    aeoCapsule: `${catName} conversion calculates equivalent measures across standardized metric, customary, and technical units using fixed mathematical ratios. Standardized in accordance with NIST Special Publication 811 and BIPM SI guidelines, enabling precision calculations between ${unitNames.slice(0, 4).join(", ")}, and ${Math.max(0, unitNames.length - 4)} additional units.`,
    standardsStatement: `All ${catName.toLowerCase()} conversion factors on this platform comply with NIST Special Publication 811 (Guide for the Use of the International System of Units) and the BIPM SI Brochure (9th Edition), utilizing exact rational ratios and IEEE-754 double-precision arithmetic to prevent rounding distortion.`
  };
}

// src/config/relatedCategories.ts
var RELATED_CATEGORIES = {
  length: ["area", "volume", "speed", "astronomy", "angle"],
  area: ["length", "volume", "textile", "pressure"],
  volume: ["length", "area", "cooking", "fuel", "density"],
  mass: ["density", "force", "cooking", "volume"],
  temp: ["energy", "pressure", "cooking"],
  time: ["speed", "frequency", "datatransfer"],
  speed: ["length", "time", "acceleration", "fuel"],
  acceleration: ["speed", "force", "length"],
  force: ["mass", "acceleration", "pressure", "torque"],
  pressure: ["force", "area", "temp"],
  energy: ["power", "temp", "electricity"],
  power: ["energy", "electricity", "torque"],
  electricity: ["power", "energy", "magnetism", "frequency"],
  magnetism: ["electricity", "frequency"],
  frequency: ["time", "electricity", "datatransfer"],
  data: ["datatransfer", "frequency"],
  datatransfer: ["data", "time", "frequency"],
  angle: ["length", "torque", "astronomy"],
  torque: ["force", "power", "angle"],
  fuel: ["volume", "speed", "length"],
  density: ["mass", "volume", "pressure"],
  cooking: ["volume", "mass", "temp"],
  textile: ["area", "mass", "length"],
  astronomy: ["length", "mass", "time"],
  flow: ["volume", "time", "pressure", "speed"],
  illuminance: ["energy", "power", "area"],
  viscosity: ["density", "pressure", "flow", "force"],
  typography: ["length", "area", "data"]
};
function getRelatedCategoryIds(catId) {
  return RELATED_CATEGORIES[catId] ?? [];
}

// scripts/prerender-seo.ts
var distDir = path.resolve(process.cwd(), "dist");
var baseHtmlPath = path.join(distDir, "index.html");
if (!fs.existsSync(baseHtmlPath)) {
  console.error("\u274C dist/index.html not found. Run `vite build` first.");
  process.exit(1);
}
var baseHtml = fs.readFileSync(baseHtmlPath, "utf-8");
var siteOrigin = getSiteUrl();
var ogImageUrl = `${siteOrigin}/og-image.png`;
var spaHtml = baseHtml.replace(/<link[^>]*rel=["']canonical["'][^>]*\/?>\s*/gi, "").replace(/<meta[^>]*property=["']og:url["'][^>]*\/?>\s*/gi, "");
fs.writeFileSync(path.join(distDir, "spa.html"), spaHtml, "utf-8");
console.log("\u26A1 Emitted neutral SPA shell (dist/spa.html)");
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeAttr(str) {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
var cleanSlug2 = (s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
var STATIC_FOOTER_HTML = `
    <footer style="font-family:system-ui,sans-serif;max-width:64rem;margin:2rem auto 0;padding:1rem 1.5rem;border-top:1px solid #ddd;font-size:0.85rem;color:#666;">
      <div style="margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid #eee;">
        <h3 style="margin:0 0 0.25rem;font-size:0.95rem;font-weight:600;color:#333;">More from NumanX Studio</h3>
        <p style="margin:0 0 0.5rem;font-size:0.85rem;color:#666;line-height:1.4;">NumanX Tools Hub \u2014 free online tools for images, text, QR codes, YouTube creators and cricket stats. No sign-up, works in your browser.</p>
        <a href="https://toolshub.numanxstudio.com" style="color:#0066cc;font-weight:500;text-decoration:underline;">Visit NumanX Tools Hub</a>
      </div>
      <nav aria-label="Site">
        <a href="/about">About</a> \xB7 <a href="/contact">Contact</a> \xB7 <a href="/privacy">Privacy Policy</a> \xB7 <a href="/terms">Terms of Use</a> \xB7 <a href="/sitemap">Sitemap</a>
      </nav>
      <p style="margin:0.5rem 0 0;">\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} ${LEGAL.operator} \xB7 Omega X Converter</p>
    </footer>`;
function renderLegalBody(doc) {
  return `
    <main class="max-w-3xl mx-auto p-6 space-y-6" style="font-family:system-ui,sans-serif;">
      <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:#666;margin-bottom:1rem;">
        <a href="/">Home</a> / <strong>${escapeHtml(doc.h1)}</strong>
      </nav>
      <header>
        <h1 style="font-size:2rem;font-weight:700;">${escapeHtml(doc.h1)}</h1>
        ${doc.path !== "/contact" ? `<p style="font-size:0.85rem;color:#777;">Last updated: ${LEGAL.lastUpdated}</p>` : ""}
        <p style="font-size:1.05rem;color:#444;line-height:1.6;">${escapeHtml(doc.intro)}</p>
      </header>
      ${doc.sections.map((sec) => `
        <section>
          <h2 style="font-size:1.25rem;">${escapeHtml(sec.heading)}</h2>
          ${sec.paragraphs.map((p) => `<p style="color:#444;line-height:1.6;">${escapeHtml(p)}</p>`).join("")}
          ${sec.bullets ? `<ul style="line-height:1.6;">${sec.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>` : ""}
        </section>
      `).join("")}
    </main>`;
}
function renderAndWritePage(config) {
  let html = baseHtml;
  const pageCanonical = canonicalUrl(config.routePath);
  const fullTitle = withBrand(config.title);
  html = html.replace(/<title.*?>.*?<\/title>/i, `<title data-rh="true">${escapeHtml(fullTitle)}</title>`);
  if (config.is404) {
    html = html.replace(/<link[^>]*rel=["']canonical["'][^>]*\/?>/i, "");
    html = html.replace(/<meta[^>]*property=["']og:url["'][^>]*\/?>/i, "");
    html = html.replace(/<meta[^>]*name=["']robots["'][^>]*\/?>/i, '<meta name="robots" content="noindex, follow" />');
    html = html.replace(/<meta[^>]*name=["']googlebot["'][^>]*\/?>/i, '<meta name="googlebot" content="noindex, follow" />');
  } else {
    html = html.replace(/<link[^>]*rel=["']canonical["'][^>]*\/?>/i, `<link rel="canonical" data-rh="true" href="${pageCanonical}" />`);
    html = html.replace(/<meta[^>]*property=["']og:url["'][^>]*\/?>/i, `<meta property="og:url" content="${pageCanonical}" />`);
  }
  html = html.replace(/<meta[^>]*name=["']description["'][^>]*\/?>/i, `<meta name="description" data-rh="true" content="${escapeAttr(config.description)}" />`);
  html = html.replace(/<meta[^>]*property=["']og:title["'][^>]*\/?>/i, `<meta property="og:title" content="${escapeAttr(fullTitle)}" />`);
  html = html.replace(/<meta[^>]*property=["']og:description["'][^>]*\/?>/i, `<meta property="og:description" content="${escapeAttr(config.description)}" />`);
  html = html.replace(/<meta[^>]*property=["']og:image["'][^>]*\/?>/i, `<meta property="og:image" content="${ogImageUrl}" />`);
  html = html.replace(/<meta[^>]*name=["']twitter:title["'][^>]*\/?>/i, `<meta name="twitter:title" content="${escapeAttr(fullTitle)}" />`);
  html = html.replace(/<meta[^>]*name=["']twitter:description["'][^>]*\/?>/i, `<meta name="twitter:description" content="${escapeAttr(config.description)}" />`);
  html = html.replace(/<meta[^>]*name=["']twitter:image["'][^>]*\/?>/i, `<meta name="twitter:image" content="${ogImageUrl}" />`);
  if (!config.is404) {
    const globalSiteSchema = buildGlobalSiteSchema();
    let headInjection = `  <script id="omega-global-schema" type="application/ld+json">${JSON.stringify(globalSiteSchema)}</script>
`;
    if (config.schema) {
      headInjection += `  <script id="omega-page-schema" type="application/ld+json">${JSON.stringify(config.schema)}</script>
`;
    }
    headInjection += `  </head>`;
    html = html.replace("</head>", headInjection);
  }
  html = html.replace(
    /<div id="root">\s*<\/div>/i,
    `<div id="root">
${config.staticBodyHtml}
${STATIC_FOOTER_HTML}
    </div>`
  );
  if (config.is404) {
    fs.writeFileSync(path.join(distDir, "404.html"), html, "utf-8");
  } else if (config.routePath === "/" || config.routePath === "") {
    fs.writeFileSync(path.join(distDir, "index.html"), html, "utf-8");
  } else {
    const cleanPath = config.routePath.replace(/^\/+/, "").replace(/\/+$/, "");
    const targetFile = path.join(distDir, `${cleanPath}.html`);
    fs.mkdirSync(path.dirname(targetFile), { recursive: true });
    fs.writeFileSync(targetFile, html, "utf-8");
  }
}
var generatedCount = 0;
console.log("\u26A1 Prerendering Home route (/) ...");
var homeSchema = buildHomeSchema();
var homeStaticHtml = `
  <main class="max-w-5xl mx-auto p-6 space-y-8" style="font-family:system-ui,sans-serif;">
    <header style="text-align:center;margin-bottom:2rem;">
      <h1 style="font-size:2rem;font-weight:700;margin-bottom:0.75rem;">Universal Unit Converter & Engineering Calculation Engine</h1>
      <p style="font-size:1.1rem;color:#666;max-width:750px;margin:0 auto;line-height:1.6;">
        NumanX Omega is an open, high-precision, zero-latency unit conversion and calculation engine built for engineers, researchers, students, and everyday power users. Rigorously calibrated against NIST Special Publication 811 and BIPM SI definitions.
      </p>
    </header>

    <section aria-labelledby="categories-heading" style="margin-bottom:2.5rem;">
      <h2 id="categories-heading" style="font-size:1.4rem;font-weight:600;margin-bottom:1rem;border-bottom:2px solid #eee;padding-bottom:0.5rem;">
        24 Metrology & Conversion Categories
      </h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem;">
        ${Categories.map((cat) => `
          <div style="border:1px solid #ddd;border-radius:8px;padding:1rem;background:#fafafa;">
            <div style="font-size:1.5rem;margin-bottom:0.5rem;">${cat.ic}</div>
            <h3 style="font-size:1.1rem;margin:0 0 0.25rem 0;">
              <a href="/convert/${cat.id}" style="color:#0066cc;text-decoration:none;font-weight:600;">${cat.lb}</a>
            </h3>
            <p style="font-size:0.85rem;color:#777;margin:0;">${cat.un.length} units supported</p>
          </div>
        `).join("")}
      </div>
    </section>

    <section aria-labelledby="tools-heading" style="margin-bottom:2.5rem;">
      <h2 id="tools-heading" style="font-size:1.4rem;font-weight:600;margin-bottom:1rem;border-bottom:2px solid #eee;padding-bottom:0.5rem;">
        Integrated Calculation Tools
      </h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem;">
        <div style="border:1px solid #ddd;border-radius:8px;padding:1rem;">
          <h3 style="margin-top:0;"><a href="/formulas" style="color:#0066cc;text-decoration:none;">Formula Explorer</a></h3>
          <p style="font-size:0.9rem;color:#555;">Comprehensive scientific and mathematical conversion formulas with exact derivation constants.</p>
        </div>
        <div style="border:1px solid #ddd;border-radius:8px;padding:1rem;">
          <h3 style="margin-top:0;"><a href="/calculator" style="color:#0066cc;text-decoration:none;">Engineering Calculator</a></h3>
          <p style="font-size:0.9rem;color:#555;">Full-featured scientific calculator with trigonometric functions, memory registers, and formula history.</p>
        </div>
        <div style="border:1px solid #ddd;border-radius:8px;padding:1rem;">
          <h3 style="margin-top:0;"><a href="/health" style="color:#0066cc;text-decoration:none;">Health & Biometrics</a></h3>
          <p style="font-size:0.9rem;color:#555;">BMI, Basal Metabolic Rate (BMR), Ideal Body Weight, and daily water hydration calculators.</p>
        </div>
        <div style="border:1px solid #ddd;border-radius:8px;padding:1rem;">
          <h3 style="margin-top:0;"><a href="/blog" style="color:#0066cc;text-decoration:none;">Guides & Blog</a></h3>
          <p style="font-size:0.9rem;color:#555;">In-depth metrological guides, fractional tape measure tips, and imperial vs metric tutorials.</p>
        </div>
      </div>
    </section>

    <section aria-labelledby="standards-heading" style="border-top:1px solid #eee;padding-top:1.5rem;font-size:0.9rem;color:#666;">
      <h2 id="standards-heading" style="font-size:1.1rem;font-weight:600;margin-bottom:0.5rem;">Metrological Authority & Standards Compliance</h2>
      <p>
        Omega X conversion factors comply with the BIPM 2019 SI Redefinition, NIST Special Publication 811, NIST Handbook 44, and the 1959 International Yard and Pound Agreement. Zero server telemetry ensures 100% client-side privacy.
      </p>
    </section>
  </main>
`;
renderAndWritePage({
  routePath: "/",
  title: PAGE_META["/"].title,
  description: PAGE_META["/"].description,
  schema: homeSchema,
  staticBodyHtml: homeStaticHtml
});
generatedCount++;
console.log("\u26A1 Prerendering Core Public Pages (10 pages) ...");
var corePages = [
  {
    routePath: "/about",
    title: PAGE_META["/about"].title,
    description: PAGE_META["/about"].description,
    schema: buildCorePageSchema(
      "/about",
      PAGE_META["/about"].title,
      PAGE_META["/about"].description,
      { pageType: "AboutPage" }
    ),
    staticBodyHtml: `
      <main class="max-w-4xl mx-auto p-6 space-y-6" style="font-family:system-ui,sans-serif;">
        <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:#666;margin-bottom:1rem;">
          <a href="/">Home</a> / <strong>About</strong>
        </nav>
        <header>
          <h1 style="font-size:2rem;font-weight:700;">About Omega X Converter</h1>
          <p style="font-size:1.1rem;color:#555;line-height:1.6;">
            Omega X Converter by NumanX Studio is an open, high-precision, zero-latency unit conversion and calculation engine built for engineers, researchers, students, and everyday power users.
          </p>
        </header>
        <section>
          <h2>Core Architectural Pillars</h2>
          <ul>
            <li><strong>100% Client-Side Privacy:</strong> All calculations execute directly in your browser. No personal data or calculation numbers are transmitted or stored remotely.</li>
            <li><strong>NIST & BIPM Standards:</strong> Conversion factors adhere to published ratios defined in NIST Special Publication 811 and BIPM SI definitions.</li>
            <li><strong>Sub-Nanometer Precision:</strong> 14-digit floating-point mathematical engine prevents rounding cascade errors.</li>
            <li><strong>Offline PWA Support:</strong> Full offline readiness via progressive web application architecture.</li>
          </ul>
        </section>
        <section aria-labelledby="standards-heading">
          <h2 id="standards-heading">Authoritative Standards & Primary References</h2>
          <p>Omega X Converter grounds all conversion factors in verified primary sources:</p>
          <ul>
            <li><a href="https://www.bipm.org/en/publications/si-brochure" target="_blank" rel="noopener noreferrer">BIPM SI Brochure (9th Edition)</a> \u2014 Fundamental SI base units and definitions.</li>
            <li><a href="https://www.nist.gov/pml/special-publication-811" target="_blank" rel="noopener noreferrer">NIST Special Publication 811</a> \u2014 Guide for the Use of the International System of Units (SI).</li>
            <li><a href="https://www.nist.gov/pml/owm/nist-handbook-44-current-edition" target="_blank" rel="noopener noreferrer">NIST Handbook 44</a> \u2014 Specifications and tolerances for commercial weighing and measuring.</li>
            <li><a href="https://physics.nist.gov/cuu/Constants/" target="_blank" rel="noopener noreferrer">CODATA Recommended Values</a> \u2014 Fundamental physical constants.</li>
          </ul>
          <p style="font-size:0.85rem;color:#666;"><em>Institutional Non-Affiliation Notice: Reference to standards documents does not constitute endorsement or certification by NIST, BIPM, CODATA, or government agencies.</em></p>
        </section>
        <section>
          <h2>Explore Omega X</h2>
          <p><a href="/converter">Universal Converter</a> \xB7 <a href="/categories">All 24 Categories</a> \xB7 <a href="/formulas">Formulas Reference</a> \xB7 <a href="/sitemap">HTML Sitemap</a></p>
        </section>
      </main>
    `
  },
  {
    routePath: "/blog",
    title: PAGE_META["/blog"].title,
    description: PAGE_META["/blog"].description,
    schema: buildBlogIndexSchema(BLOG_POSTS),
    staticBodyHtml: `
      <main class="max-w-4xl mx-auto p-6 space-y-6" style="font-family:system-ui,sans-serif;">
        <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:#666;margin-bottom:1rem;">
          <a href="/">Home</a> / <strong>Blog</strong>
        </nav>
        <header>
          <h1 style="font-size:2rem;font-weight:700;">Unit Conversion & Metrology Blog</h1>
          <p style="font-size:1.1rem;color:#555;line-height:1.6;">
            Guides, tutorials, precision formulas, and cheat sheets for length, weight, temperature, data, and scientific measurements.
          </p>
        </header>
        <section>
          <h2>Recent Articles & Tutorials</h2>
          <div style="display:flex;flex-direction:column;gap:1.5rem;">
            ${BLOG_POSTS.map((post) => `
              <article style="border:1px solid #ddd;border-radius:8px;padding:1.25rem;">
                <h3 style="margin:0 0 0.5rem 0;font-size:1.25rem;">
                  <a href="/blog/${post.slug}" style="color:#0066cc;text-decoration:none;">${escapeHtml(post.title)}</a>
                </h3>
                <div style="font-size:0.85rem;color:#777;margin-bottom:0.5rem;">
                  Published on ${post.date} \xB7 By ${post.author} \xB7 ${post.readTime}
                </div>
                <p style="margin:0;color:#444;font-size:0.95rem;line-height:1.5;">${post.excerpt}</p>
              </article>
            `).join("")}
          </div>
        </section>
      </main>
    `
  },
  {
    routePath: "/calculator",
    title: PAGE_META["/calculator"].title,
    description: PAGE_META["/calculator"].description,
    schema: buildCorePageSchema(
      "/calculator",
      PAGE_META["/calculator"].title,
      PAGE_META["/calculator"].description,
      { applicationCategory: "UtilitiesApplication" }
    ),
    staticBodyHtml: `
      <main class="max-w-4xl mx-auto p-6 space-y-6" style="font-family:system-ui,sans-serif;">
        <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:#666;margin-bottom:1rem;">
          <a href="/">Home</a> / <strong>Calculator</strong>
        </nav>
        <header>
          <h1 style="font-size:2rem;font-weight:700;">Engineering & Scientific Calculator</h1>
          <p style="font-size:1.1rem;color:#555;line-height:1.6;">
            High-precision mathematical workstation designed for engineers, scientists, and students. Features standard and scientific notation, trigonometric operations, powers, logarithms, memory registers, and formula history.
          </p>
        </header>
        <section>
          <h2>Features & Mathematical Capabilities</h2>
          <ul>
            <li>Standard arithmetic: addition, subtraction, multiplication, division, modulo</li>
            <li>Scientific calculations: sin, cos, tan, arcsin, arccos, arctan (deg & rad modes)</li>
            <li>Powers & roots: x\xB2, x\xB3, x\u02B8, \u221Ax, \u221Bx, \u02B8\u221Ax</li>
            <li>Logarithmic functions: natural logarithm (ln), base-10 logarithm (log\u2081\u2080), exponential (e\u02E3)</li>
            <li>Memory registers: Store (MS), Recall (MR), Clear (MC), Add (M+)</li>
          </ul>
        </section>
        <section>
          <h2>Related Conversion Workstations</h2>
          <p><a href="/converter">Universal Converter</a> \xB7 <a href="/formulas">Formula Explorer</a> \xB7 <a href="/categories">All Categories</a></p>
        </section>
      </main>
    `
  },
  {
    routePath: "/categories",
    title: PAGE_META["/categories"].title,
    description: PAGE_META["/categories"].description,
    schema: buildCategoriesDirectorySchema(Categories),
    staticBodyHtml: `
      <main class="max-w-5xl mx-auto p-6 space-y-6" style="font-family:system-ui,sans-serif;">
        <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:#666;margin-bottom:1rem;">
          <a href="/">Home</a> / <strong>Categories</strong>
        </nav>
        <header>
          <h1 style="font-size:2rem;font-weight:700;">Measurement & Conversion Categories</h1>
          <p style="font-size:1.1rem;color:#555;line-height:1.6;">
            Omega X supports 24 measurement categories across metric, imperial, astronomical, and scientific unit standards. Select any category below to access dedicated conversion tools and metrology charts.
          </p>
        </header>
        <section>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;">
            ${Categories.map((cat) => {
      const content = categoryContent[cat.id];
      return `
                <div style="border:1px solid #ddd;border-radius:8px;padding:1.25rem;background:#fafafa;">
                  <div style="font-size:1.8rem;margin-bottom:0.5rem;">${cat.ic}</div>
                  <h2 style="font-size:1.2rem;margin:0 0 0.5rem 0;">
                    <a href="/convert/${cat.id}" style="color:#0066cc;text-decoration:none;">${cat.lb}</a>
                  </h2>
                  <p style="font-size:0.85rem;color:#666;margin-bottom:0.75rem;">${content?.metaDesc || `${cat.lb} precision conversion calculator.`}</p>
                  <span style="font-size:0.8rem;color:#888;">${cat.un.length} units \xB7 <a href="/convert/${cat.id}">View Converter \u2192</a></span>
                </div>
              `;
    }).join("")}
          </div>
        </section>
      </main>
    `
  },
  {
    routePath: "/converter",
    title: PAGE_META["/converter"].title,
    description: PAGE_META["/converter"].description,
    schema: buildCorePageSchema(
      "/converter",
      PAGE_META["/converter"].title,
      PAGE_META["/converter"].description,
      { applicationCategory: "UtilitiesApplication" }
    ),
    staticBodyHtml: `
      <main class="max-w-4xl mx-auto p-6 space-y-6" style="font-family:system-ui,sans-serif;">
        <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:#666;margin-bottom:1rem;">
          <a href="/">Home</a> / <strong>Converter</strong>
        </nav>
        <header>
          <h1 style="font-size:2rem;font-weight:700;">Universal Unit Converter</h1>
          <p style="font-size:1.1rem;color:#555;line-height:1.6;">
            Convert across 24 measurement categories with sub-nanometer precision. Supports natural language queries (e.g., "5 feet 10 inches in cm", "100 km/h in mph") and architectural tape measure fractions.
          </p>
        </header>
        <section>
          <h2>Popular Categories</h2>
          <p>
            <a href="/convert/length">Length</a> \xB7
            <a href="/convert/mass">Mass & Weight</a> \xB7
            <a href="/convert/temp">Temperature</a> \xB7
            <a href="/convert/area">Area</a> \xB7
            <a href="/convert/volume">Volume</a> \xB7
            <a href="/convert/speed">Speed</a> \xB7
            <a href="/convert/time">Time</a> \xB7
            <a href="/convert/pressure">Pressure</a> \xB7
            <a href="/convert/energy">Energy</a> \xB7
            <a href="/convert/data">Digital Data</a>
          </p>
        </section>
        <section>
          <h2>Specialized Financial & Health Tools</h2>
          <p>
            <a href="/health">Health Biometrics</a> \xB7
            <a href="/calculator">Scientific Calculator</a>
          </p>
        </section>
      </main>
    `
  },
  {
    routePath: "/formulas",
    title: PAGE_META["/formulas"].title,
    description: PAGE_META["/formulas"].description,
    schema: buildCorePageSchema(
      "/formulas",
      PAGE_META["/formulas"].title,
      PAGE_META["/formulas"].description,
      { pageType: "ItemPage", applicationCategory: "UtilitiesApplication" }
    ),
    staticBodyHtml: `
      <main class="max-w-5xl mx-auto p-6 space-y-6" style="font-family:system-ui,sans-serif;">
        <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:#666;margin-bottom:1rem;">
          <a href="/">Home</a> / <strong>Formulas</strong>
        </nav>
        <header>
          <h1 style="font-size:2rem;font-weight:700;">Unit Conversion Formulas & Mathematical Derivations</h1>
          <p style="font-size:1.1rem;color:#555;line-height:1.6;">
            Authoritative reference guide to the mathematical equations, thermal constants, and SI base factors powering Omega X.
          </p>
        </header>
        <section>
          <div style="display:flex;flex-direction:column;gap:1.5rem;">
            ${Categories.map((cat) => {
      const content = categoryContent[cat.id];
      return `
                <article style="border:1px solid #ddd;border-radius:8px;padding:1.25rem;">
                  <h2 style="font-size:1.25rem;margin:0 0 0.5rem 0;">${cat.ic} ${cat.lb} Formulas</h2>
                  <p style="font-size:0.95rem;color:#444;margin-bottom:0.75rem;"><strong>Base Equation:</strong> ${content?.formula || `Derived from NIST SP 811 base factors.`}</p>
                  <p style="font-size:0.85rem;color:#666;margin:0;"><a href="/convert/${cat.id}">Open ${cat.lb} Interactive Converter \u2192</a></p>
                </article>
              `;
    }).join("")}
          </div>
        </section>
      </main>
    `
  },
  {
    routePath: "/health",
    title: PAGE_META["/health"].title,
    description: PAGE_META["/health"].description,
    schema: buildCorePageSchema(
      "/health",
      PAGE_META["/health"].title,
      PAGE_META["/health"].description,
      { applicationCategory: "HealthApplication" }
    ),
    staticBodyHtml: `
      <main class="max-w-4xl mx-auto p-6 space-y-6" style="font-family:system-ui,sans-serif;">
        <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:#666;margin-bottom:1rem;">
          <a href="/">Home</a> / <strong>Health</strong>
        </nav>
        <header>
          <h1 style="font-size:2rem;font-weight:700;">Health & Biometric Calculators</h1>
          <p style="font-size:1.1rem;color:#555;line-height:1.6;">
            Evidence-based biometric calculations for fitness, nutrition, and physiological assessment based on World Health Organization (WHO) and clinical formulas.
          </p>
        </header>
        <section>
          <h2>Supported Biometric Tools</h2>
          <ul>
            <li><strong>Body Mass Index (BMI):</strong> Calculates ratio of weight to height according to standard WHO weight classifications.</li>
            <li><strong>Basal Metabolic Rate (BMR):</strong> Estimates daily resting calorie expenditure using the Mifflin-St Jeor equation.</li>
          </ul>
        </section>
        <section>
          <h2>How BMI is calculated</h2>
          <p>BMI = weight (kg) \xF7 height (m)\xB2. Adult categories follow the World Health Organization: under 18.5 is underweight, 18.5 to 24.9 is normal, 25 to 29.9 is overweight and 30 or more is obese. For example, 70 kg at 1.75 m gives a BMI of 22.9 (normal).</p>
        </section>
        <section>
          <h2>How BMR is calculated</h2>
          <p>The Mifflin-St Jeor equation estimates calories burned at rest, using weight in kg, height in cm and age in years: men = 10 \xD7 weight + 6.25 \xD7 height \u2212 5 \xD7 age + 5; women = 10 \xD7 weight + 6.25 \xD7 height \u2212 5 \xD7 age \u2212 161. A 30-year-old man at 70 kg and 175 cm has a BMR of about 1,649 kcal per day.</p>
        </section>
        <p style="font-size:0.85rem;color:#666;">${DISCLAIMERS.health} See our <a href="/terms">Terms of Use</a>.</p>
      </main>
    `
  },
  {
    routePath: "/sitemap",
    title: PAGE_META["/sitemap"].title,
    description: PAGE_META["/sitemap"].description,
    schema: buildCorePageSchema(
      "/sitemap",
      PAGE_META["/sitemap"].title,
      PAGE_META["/sitemap"].description,
      { pageType: "CollectionPage" }
    ),
    staticBodyHtml: `
      <main class="max-w-5xl mx-auto p-6 space-y-6" style="font-family:system-ui,sans-serif;">
        <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:#666;margin-bottom:1rem;">
          <a href="/">Home</a> / <strong>Sitemap</strong>
        </nav>
        <header>
          <h1 style="font-size:2rem;font-weight:700;">Omega X HTML Sitemap</h1>
          <p style="font-size:1.1rem;color:#555;line-height:1.6;">
            Complete index of every canonical public page on the Omega X Converter platform.
          </p>
        </header>

        <section>
          <h2>Core Public Pages</h2>
          <ul style="columns:2;">
            <li><a href="/">Home (/)</a></li>
            <li><a href="/converter">Universal Converter</a></li>
            <li><a href="/categories">All Categories</a></li>
            <li><a href="/formulas">Formulas Reference</a></li>
            <li><a href="/calculator">Engineering Calculator</a></li>
            <li><a href="/health">Health & Biometrics</a></li>
            <li><a href="/blog">Metrology Blog</a></li>
            <li><a href="/about">About Omega X Converter</a></li>
            <li><a href="/sitemap">Sitemap</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Use</a></li>
          </ul>
        </section>

        <section>
          <h2>24 Measurement Categories</h2>
          <ul style="columns:3;">
            ${Categories.map((cat) => `
              <li><a href="/convert/${cat.id}">${cat.lb} Converter</a></li>
            `).join("")}
          </ul>
        </section>

        <section>
          <h2>Conversion Guides</h2>
          <ul>
            ${Object.values(guideContent).map((g) => `
              <li><a href="/guides/${g.slug}">${g.title}</a></li>
            `).join("")}
          </ul>
        </section>

        <section>
          <h2>Blog Articles</h2>
          <ul>
            ${BLOG_POSTS.map((p) => `
              <li><a href="/blog/${p.slug}">${p.title}</a></li>
            `).join("")}
          </ul>
        </section>
      </main>
    `
  }
];
for (const p of corePages) {
  renderAndWritePage(p);
  generatedCount++;
}
console.log("\u26A1 Prerendering 24 Canonical Categories ...");
for (const cat of Categories) {
  const content = categoryContent[cat.id];
  const catGuides = getGuidesForCategory(cat.id);
  const title = content?.title || `${cat.lb} Precision Converter | Omega X`;
  const metaDesc = content?.metaDesc || `Precision ${cat.lb} converter with NIST/BIPM metrology standards.`;
  const h1 = content?.h1 || `${cat.lb} Precision Converter`;
  const intro = content?.intro || `Convert between ${cat.lb} units instantly with exact standards and sub-nanometer accuracy.`;
  const formula = content?.formula || `All ${cat.lb} conversion ratios adhere to NIST Special Publication 811.`;
  const faqs = content?.faq || [
    { q: `How do I convert units in ${cat.lb}?`, a: `Select your source unit and destination unit, enter a value, and Omega X calculates the exact result instantly.` }
  ];
  const catAuthSources = getCategoryAuthoritySources(cat.id);
  const std = getCategoryStandards(cat.id, cat.lb, cat.un.map((u) => u.lb));
  const SI_BASE_UNIT_IDS = /* @__PURE__ */ new Set(["m", "kg", "s", "A", "K"]);
  const baseUnits = cat.un.filter((u) => u.r === 1);
  const isComposite = baseUnits.length > 1;
  const singleBaseUnit = baseUnits.length === 1 ? baseUnits[0] : null;
  const relatedCats = getRelatedCategoryIds(cat.id).map((id) => Categories.find((c) => c.id === id)).filter((c) => Boolean(c));
  const authorityHtml = catAuthSources.length > 0 ? `<p style="margin:0.25rem 0 0 0;font-size:0.85rem;color:#777;">Primary References: ${catAuthSources.map((s) => `<a href="${s.url}" target="_blank" rel="noopener noreferrer" style="color:#0066cc;">${s.documentRef}</a>`).join(" \xB7 ")} \xB7 <a href="/about" style="color:#0066cc;">Standards Directory</a></p>` : `<p style="margin:0.25rem 0 0 0;font-size:0.85rem;color:#777;">Standards & Data Source Note: Consult our <a href="/about" style="color:#0066cc;">standards and methodology directory</a> for data source provenance.</p>`;
  const categorySchema = buildCategorySchema(cat, content);
  const categoryBodyHtml = `
    <main class="max-w-5xl mx-auto p-6 space-y-6" style="font-family:system-ui,sans-serif;">
      <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:#666;margin-bottom:1rem;">
        <a href="/">Home</a> / <a href="/categories">Categories</a> / <strong>${cat.lb}</strong>
      </nav>
      <header>
        <h1 style="font-size:2rem;font-weight:700;">${cat.ic} ${h1}</h1>
        <p style="font-size:1.1rem;color:#555;line-height:1.6;">${intro}</p>
        <p style="color:#333;line-height:1.6;">${escapeHtml(std.aeoCapsule)}</p>
      </header>

      <section aria-labelledby="standards-heading" style="border:1px solid #ddd;border-radius:8px;padding:1.25rem;background:#fafafa;">
        <h2 id="standards-heading" style="font-size:1.2rem;margin-top:0;">Metrological Standards & Base Equation</h2>
        <p style="margin-bottom:0.5rem;font-size:0.95rem;">${formula}</p>
        <p style="margin:0;font-size:0.9rem;color:#555;line-height:1.6;">${escapeHtml(std.standardsStatement)}</p>
        ${authorityHtml}
      </section>

      <section aria-labelledby="units-heading">
        <h2 id="units-heading" style="font-size:1.25rem;margin-bottom:1rem;">Supported ${cat.lb} Units (${cat.un.length} Total)</h2>
        <div style="overflow-x:auto;">
          <table border="1" cellpadding="8" style="border-collapse:collapse;width:100%;text-align:left;border:1px solid #ddd;font-size:0.9rem;">
            <caption style="text-align:left;font-weight:600;margin-bottom:0.5rem;">${cat.lb} Unit Definitions and Scaling Factors</caption>
            <thead style="background:#f0f0f0;">
              <tr>
                <th scope="col">Unit Symbol</th>
                <th scope="col">Unit Name</th>
                <th scope="col">System</th>
                <th scope="col">${singleBaseUnit ? `Equivalent in ${escapeHtml(unitName(singleBaseUnit, cat.id))}` : isComposite ? "Metrological Standard" : "Conversion Basis"}</th>
              </tr>
            </thead>
            <tbody>
              ${cat.un.map((u) => {
    const isSiBase = (u.r === 1 || u.id === "K") && SI_BASE_UNIT_IDS.has(u.id);
    const isRef = u.r === 1 && !isSiBase;
    let equivText;
    if (singleBaseUnit) {
      if (isSiBase) {
        equivText = `SI Base Unit (1 ${escapeHtml(unitSymbol(u, cat.id))})`;
      } else if (isRef) {
        equivText = `Reference Standard (1 ${escapeHtml(unitSymbol(u, cat.id))})`;
      } else if (u.r !== void 0) {
        equivText = `1 ${escapeHtml(unitSymbol(u, cat.id))} = ${fmt(u.r, 8)} ${escapeHtml(unitSymbol(singleBaseUnit, cat.id))}`;
      } else {
        equivText = "Formula-based (non-linear)";
      }
    } else if (isComposite) {
      if (isSiBase) {
        equivText = `SI Base Unit (${escapeHtml(unitName(u, cat.id))})`;
      } else if (isRef) {
        equivText = `Reference Standard (${escapeHtml(unitName(u, cat.id))})`;
      } else {
        equivText = `Dimensional Standard (${u.s === "M" ? "Metric" : u.s === "I" ? "Imperial" : u.s === "S" ? "Scientific" : "Customary"})`;
      }
    } else {
      if (isSiBase) {
        equivText = `SI Base Unit (${escapeHtml(unitName(u, cat.id))})`;
      } else {
        equivText = cat.id === "temp" ? "Affine temperature scale" : "Formula-based (non-linear)";
      }
    }
    return `
                <tr>
                  <td><code>${escapeHtml(unitSymbol(u, cat.id))}</code></td>
                  <td><strong>${escapeHtml(unitName(u, cat.id))}</strong></td>
                  <td>${u.s === "M" ? "Metric" : u.s === "I" ? "Imperial" : u.s === "S" ? "Scientific" : "Other"}</td>
                  <td>${equivText}</td>
                </tr>
                `;
  }).join("")}
            </tbody>
          </table>
        </div>
      </section>

      ${content?.popularPairs && content.popularPairs.length > 0 ? `
        <section aria-labelledby="pairs-heading">
          <h2 id="pairs-heading" style="font-size:1.25rem;margin-bottom:1rem;">Popular ${cat.lb} Conversions</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:0.75rem;">
            ${content.popularPairs.map((p) => {
    const pairSlug = `${cleanSlug2(p.from)}-to-${cleanSlug2(p.to)}`;
    return `
                <div style="border:1px solid #ddd;border-radius:6px;padding:0.75rem;">
                  <h3 style="margin:0 0 0.25rem 0;font-size:1rem;">
                    <a href="/convert/${cat.id}/${pairSlug}" style="color:#0066cc;text-decoration:none;">${p.from} to ${p.to}</a>
                  </h3>
                  <p style="margin:0;font-size:0.8rem;color:#666;">${p.desc}</p>
                </div>
              `;
  }).join("")}
          </div>
        </section>
      ` : ""}

      ${catGuides.length > 0 ? `
        <section aria-labelledby="guides-heading" style="border:1px solid #ddd;border-radius:8px;padding:1.25rem;">
          <h2 id="guides-heading" style="font-size:1.25rem;font-weight:600;margin-bottom:0.75rem;">Conversion Guides & Step-by-Step Formulas</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:0.75rem;">
            ${catGuides.map((g) => `
              <div style="border:1px solid #eee;border-radius:6px;padding:0.75rem;">
                <div style="font-weight:600;"><a href="/guides/${g.guideSlug}" style="color:#0066cc;text-decoration:none;">${g.title} Conversion Guide</a></div>
                <div style="font-size:0.85rem;color:#666;margin-top:0.25rem;">Step-by-step formula derivation, worked examples, and quick lookup tables.</div>
              </div>
            `).join("")}
          </div>
        </section>
      ` : ""}

      ${content?.useCases && content.useCases.length > 0 ? `
        <section aria-labelledby="usecases-heading">
          <h2 id="usecases-heading" style="font-size:1.25rem;margin-bottom:0.5rem;">Common Use Cases</h2>
          <ul>
            ${content.useCases.map((uc) => `<li>${uc}</li>`).join("")}
          </ul>
        </section>
      ` : ""}

      ${relatedCats.length > 0 ? `
        <section aria-labelledby="related-heading">
          <h2 id="related-heading" style="font-size:1.25rem;margin-bottom:0.5rem;">Related Conversion Categories</h2>
          <ul>
            ${relatedCats.map((c) => `<li><a href="/convert/${c.id}" style="color:#0066cc;">${escapeHtml(c.lb)} converter</a></li>`).join("")}
            <li><a href="/categories" style="color:#0066cc;">All conversion categories</a></li>
          </ul>
        </section>
      ` : ""}

      <section aria-labelledby="faq-heading">
        <h2 id="faq-heading" style="font-size:1.25rem;margin-bottom:1rem;">Frequently Asked Questions</h2>
        <div style="display:flex;flex-direction:column;gap:1rem;">
          ${faqs.map((f) => `
            <div style="border-left:3px solid #0066cc;padding-left:1rem;">
              <h3 style="margin:0 0 0.25rem 0;font-size:1.05rem;">${escapeHtml(f.q)}</h3>
              <p style="margin:0;color:#555;font-size:0.95rem;line-height:1.5;">${escapeHtml(f.a)}</p>
            </div>
          `).join("")}
        </div>
      </section>
    </main>
  `;
  renderAndWritePage({
    routePath: `/convert/${cat.id}`,
    title,
    description: metaDesc,
    schema: categorySchema,
    staticBodyHtml: categoryBodyHtml
  });
  generatedCount++;
}
console.log("\u26A1 Prerendering 99 Popular Conversion Pairs ...");
var tableValues = [1, 2, 3, 5, 10, 15, 20, 25, 50, 75, 100, 250, 500, 1e3];
for (const cat of Categories) {
  const content = categoryContent[cat.id];
  if (!content?.popularPairs) continue;
  for (const pair of content.popularPairs) {
    const fromSlug = cleanSlug2(pair.from);
    const toSlug = cleanSlug2(pair.to);
    const pairParam = `${fromSlug}-to-${toSlug}`;
    const pageRoute = `/convert/${cat.id}/${pairParam}`;
    const u1 = findUnit(cat, fromSlug);
    const u2 = findUnit(cat, toSlug);
    if (!u1 || !u2) {
      console.warn(`\u26A0\uFE0F Warning: Could not resolve units for pair ${pair.from} -> ${pair.to} in ${cat.id}`);
      continue;
    }
    const unitRatio = convert(1, cat.id, u1.id, u2.id);
    const inverseUnitRatio = convert(1, cat.id, u2.id, u1.id);
    const editorial = getPairEditorial(cat, u1, u2, pairParam);
    const pairGuide = getGuideForPair(cat.id, pairParam);
    const pageTitle = pairTitle(u1, u2, cat.id);
    const metaDescription = pairMetaDescription(u1, u2, cat.id, editorial.directAnswer.summary);
    const pairRelatedCats = getRelatedCategoryIds(cat.id).map((id) => Categories.find((c) => c.id === id)).filter((c) => Boolean(c));
    const pairSchema = buildPairSchema(cat, u1, u2, unitRatio, inverseUnitRatio, pairParam, editorial.faqs, editorial.directAnswer.summary);
    const pairBodyHtml = `
      <main class="max-w-5xl mx-auto p-6 space-y-6" style="font-family:system-ui,sans-serif;">
        <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:#666;margin-bottom:1rem;">
          <a href="/">Home</a> / <a href="/categories">Categories</a> / <a href="/convert/${cat.id}">${cat.lb}</a> / <strong>${unitName(u1, cat.id)} to ${unitName(u2, cat.id)}</strong>
        </nav>
        <header>
          <h1 style="font-size:2rem;font-weight:700;">${pageTitle}</h1>
          <p style="font-size:1.1rem;color:#555;line-height:1.6;">
            Instant precision conversion from ${unitLabel(u1, cat.id)} to ${unitLabel(u2, cat.id)} in ${cat.lb}.
          </p>
        </header>

        <section aria-labelledby="aeo-answer-heading" style="border:1px solid #99c2ff;border-radius:12px;padding:1.5rem;background:#f0f7ff;margin-bottom:1.5rem;">
          <h2 id="aeo-answer-heading" style="font-size:1.25rem;font-weight:700;margin-top:0;margin-bottom:0.5rem;color:#004085;">
            \u26A1 ${editorial.directAnswer.heading}
          </h2>
          <p style="font-size:1.1rem;font-weight:600;color:#111;margin:0 0 0.75rem 0;">
            ${editorial.directAnswer.summary}
          </p>
          <div style="font-family:monospace;font-size:1.05rem;background:#fff;border:1px solid #b8daff;padding:0.75rem 1rem;border-radius:6px;color:#0056b3;font-weight:bold;margin-bottom:0.75rem;">
            Formula: ${editorial.directAnswer.formulaDisplay}
          </div>
          <p style="font-size:0.95rem;color:#333;margin:0;line-height:1.5;">
            ${editorial.directAnswer.calculationRule}
          </p>
        </section>

        <section aria-labelledby="explanation-heading" style="border:1px solid #ddd;border-radius:12px;padding:1.5rem;background:#fff;margin-bottom:1.5rem;">
          <h2 id="explanation-heading" style="font-size:1.2rem;font-weight:700;margin-top:0;margin-bottom:0.75rem;color:#222;">
            \u{1F4D0} ${editorial.explanation.heading}
          </h2>
          ${editorial.explanation.paragraphs.map((p) => `<p style="font-size:0.95rem;color:#444;line-height:1.6;margin:0 0 0.75rem 0;">${p}</p>`).join("")}
          <div style="font-size:0.85rem;color:#666;border-top:1px solid #eee;padding-top:0.5rem;font-family:monospace;">
            <strong>Standard Metrology:</strong> ${editorial.explanation.systemContext}
          </div>
        </section>

        <section aria-labelledby="usecases-heading" style="border:1px solid #ddd;border-radius:12px;padding:1.5rem;background:#fafafa;margin-bottom:1.5rem;">
          <h2 id="usecases-heading" style="font-size:1.2rem;font-weight:700;margin-top:0;margin-bottom:0.75rem;color:#222;">
            \u{1F3AF} Common Practical Applications
          </h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem;">
            ${editorial.useCases.map((uc) => `
              <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:1rem;">
                <h3 style="font-size:0.95rem;font-weight:700;margin:0 0 0.35rem 0;color:#1a202c;">${uc.domain}</h3>
                <p style="font-size:0.85rem;color:#4a5568;margin:0;line-height:1.5;">${uc.context}</p>
              </div>
            `).join("")}
          </div>
        </section>

        <section aria-labelledby="reciprocal-heading" style="border:1px solid #e2e8f0;border-radius:12px;padding:1.25rem 1.5rem;background:#fff;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem;">
          <div>
            <span style="display:inline-block;background:#e2e8f0;color:#4a5568;font-size:0.75rem;font-weight:700;padding:0.2rem 0.5rem;border-radius:4px;text-transform:uppercase;margin-bottom:0.25rem;">${editorial.reciprocal.badgeText}</span>
            <h2 id="reciprocal-heading" style="font-size:1.05rem;font-weight:700;margin:0 0 0.25rem 0;color:#2d3748;">Reverse Conversion Option</h2>
            <p style="font-size:0.9rem;color:#4a5568;margin:0;">${editorial.reciprocal.description}</p>
          </div>
          <a href="${editorial.reciprocal.url}" style="display:inline-block;background:#0066cc;color:#fff;text-decoration:none;font-weight:600;font-size:0.85rem;padding:0.6rem 1.2rem;border-radius:8px;">${editorial.reciprocal.anchorText} \u2192</a>
        </section>

        ${pairGuide ? `
          <section aria-labelledby="guide-callout-heading" style="border:1px solid #bbf;border-radius:8px;padding:1rem;background:#f0f7ff;margin:1rem 0;">
            <h2 id="guide-callout-heading" style="font-size:1.1rem;font-weight:700;margin-bottom:0.25rem;">Need detailed formula derivations or worked calculation steps?</h2>
            <p style="font-size:0.9rem;color:#333;margin-bottom:0.5rem;">Read our in-depth <a href="/guides/${pairGuide.guideSlug}"><strong>${pairGuide.title} Conversion Guide</strong></a> with step-by-step mathematical proofs, lookup tables, and worked examples.</p>
          </section>
        ` : ""}

        <section aria-labelledby="chart-heading">
          <h2 id="chart-heading" style="font-size:1.25rem;margin-bottom:0.75rem;">${unitName(u1, cat.id)} to ${unitName(u2, cat.id)} Conversion Table (1 to 1000)</h2>
          <div style="overflow-x:auto;">
            <table border="1" cellpadding="8" style="border-collapse:collapse;width:100%;text-align:left;border:1px solid #ddd;font-size:0.9rem;">
              <caption style="text-align:left;font-weight:600;margin-bottom:0.5rem;">${unitLabel(u1, cat.id)} to ${unitLabel(u2, cat.id)} and Reciprocal Equivalents</caption>
              <thead style="background:#f0f0f0;">
                <tr>
                  <th scope="col">${unitLabel(u1, cat.id)}</th>
                  <th scope="col">${unitLabel(u2, cat.id)}</th>
                  <th scope="col">${unitLabel(u2, cat.id)}</th>
                  <th scope="col">${unitLabel(u1, cat.id)}</th>
                </tr>
              </thead>
              <tbody>
                ${tableValues.map((v) => {
      const resFwd = convert(v, cat.id, u1.id, u2.id);
      const resBwd = convert(v, cat.id, u2.id, u1.id);
      return `
                    <tr>
                      <td>${v} ${unitSymbol(u1, cat.id)}</td>
                      <td><strong>${resFwd !== null ? fmt(resFwd, 6) : ""}</strong> ${unitSymbol(u2, cat.id)}</td>
                      <td>${v} ${unitSymbol(u2, cat.id)}</td>
                      <td><strong>${resBwd !== null ? fmt(resBwd, 6) : ""}</strong> ${unitSymbol(u1, cat.id)}</td>
                    </tr>
                  `;
    }).join("")}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="related-heading">
          <h2 id="related-heading" style="font-size:1.25rem;margin-bottom:0.75rem;">Related ${cat.lb} Conversion Pairs</h2>
          <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
            ${content.popularPairs.filter((p) => `${cleanSlug2(p.from)}-to-${cleanSlug2(p.to)}` !== pairParam).map((p) => {
      const pSlug = `${cleanSlug2(p.from)}-to-${cleanSlug2(p.to)}`;
      return `<a href="/convert/${cat.id}/${pSlug}" style="display:inline-block;border:1px solid #ccc;padding:0.4rem 0.8rem;border-radius:4px;color:#0066cc;text-decoration:none;font-size:0.85rem;">${p.from} \u2192 ${p.to}</a>`;
    }).join("")}
          </div>
          ${pairRelatedCats.length > 0 ? `<p style="font-size:0.9rem;color:#555;">More converters: ${pairRelatedCats.map((c) => `<a href="/convert/${c.id}" style="color:#0066cc;">${escapeHtml(c.lb)}</a>`).join(" \xB7 ")}</p>` : ""}
        </section>

        <section aria-labelledby="faq-heading">
          <h2 id="faq-heading" style="font-size:1.25rem;margin-bottom:0.75rem;">Frequently Asked Questions</h2>
          <div style="display:flex;flex-direction:column;gap:1rem;">
            ${editorial.faqs.map((f) => `
              <div style="border-left:3px solid #0066cc;padding-left:1rem;background:#fcfcfc;padding:0.75rem 1rem;border-radius:0 8px 8px 0;">
                <h3 style="margin:0 0 0.25rem 0;font-size:1.05rem;">${f.question}</h3>
                <p style="margin:0;color:#555;font-size:0.95rem;">${f.answer}</p>
              </div>
            `).join("")}
          </div>
        </section>
      </main>
    `;
    renderAndWritePage({
      routePath: pageRoute,
      title: pageTitle,
      description: metaDescription,
      schema: pairSchema,
      staticBodyHtml: pairBodyHtml
    });
    generatedCount++;
  }
}
console.log(`\u26A1 Prerendering ${Object.keys(guideContent).length} Educational Guides ...`);
for (const guide of Object.values(guideContent)) {
  if (!guide.slug) continue;
  const pageRoute = `/guides/${guide.slug}`;
  const rel = getGuideRelationship(guide.slug);
  const relPosts = rel && rel.relatedPostSlugs.length ? BLOG_POSTS.filter((p) => rel.relatedPostSlugs.includes(p.slug)) : [];
  const guideCombinedSchema = buildGuideSchema(guide);
  const guideBodyHtml = `
    <article class="max-w-4xl mx-auto p-6 space-y-6" style="font-family:system-ui,sans-serif;">
      <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:#666;margin-bottom:1rem;">
        <a href="/">Home</a> / <a href="/converter">Converter</a> / <a href="/convert/${guide.relatedCat}">${guide.relatedCat}</a> / <strong>${guide.slug}</strong>
      </nav>
      <header>
        <h1 style="font-size:2rem;font-weight:700;">${guide.h1}</h1>
        <p style="font-size:1.1rem;color:#555;line-height:1.6;">${guide.intro}</p>
      </header>

      <section aria-labelledby="formula-heading" style="border:1px solid #ddd;border-radius:8px;padding:1.25rem;background:#fafafa;">
        <h2 id="formula-heading" style="font-size:1.2rem;margin-top:0;">Conversion Formula & Step-by-Step Method</h2>
        <div style="font-family:monospace;font-size:1.1rem;background:#fff;border:1px solid #ccc;padding:0.75rem;border-radius:4px;margin-bottom:1rem;">
          ${guide.formula}
        </div>
        <ol style="padding-left:1.5rem;line-height:1.7;">
          ${guide.steps.map((s) => `<li>${s}</li>`).join("")}
        </ol>
      </section>

      <section aria-labelledby="table-heading">
        <h2 id="table-heading" style="font-size:1.25rem;margin-bottom:0.75rem;">Quick Conversion Table</h2>
        <div style="overflow-x:auto;">
          <table border="1" cellpadding="8" style="border-collapse:collapse;width:100%;text-align:left;border:1px solid #ddd;font-size:0.9rem;">
            <caption style="text-align:left;font-weight:600;margin-bottom:0.5rem;">${guide.h1} Conversion Reference Values</caption>
            <thead style="background:#f0f0f0;">
              <tr>
                <th scope="col">Value</th>
                <th scope="col">Exact</th>
                <th scope="col">Approximate</th>
              </tr>
            </thead>
            <tbody>
              ${guide.table.map((row) => `
                <tr>
                  <td>${row.val}</td>
                  <td><strong>${row.exact}</strong></td>
                  <td>${row.approx}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="faq-heading">
        <h2 id="faq-heading" style="font-size:1.25rem;margin-bottom:0.75rem;">Frequently Asked Questions</h2>
        <div style="display:flex;flex-direction:column;gap:1rem;">
          ${guide.faq.map((f) => `
            <div style="border-left:3px solid #0066cc;padding-left:1rem;">
              <h3 style="margin:0 0 0.25rem 0;font-size:1.05rem;">${f.q}</h3>
              <p style="margin:0;color:#555;font-size:0.95rem;line-height:1.5;">${f.a}</p>
            </div>
          `).join("")}
        </div>
      </section>

      ${rel ? `
        <section aria-labelledby="interactive-pair-heading" style="border:1px solid #ddd;border-radius:8px;padding:1.25rem;">
          <h2 id="interactive-pair-heading" style="font-size:1.25rem;font-weight:600;margin-bottom:0.75rem;">Interactive Pair Converter & Category Directory</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:0.75rem;">
            <div style="border:1px solid #eee;border-radius:6px;padding:0.75rem;">
              <div style="font-weight:600;"><a href="${rel.pairPath}" style="color:#0066cc;text-decoration:none;">Convert ${rel.title} Interactively &rarr;</a></div>
              <div style="font-size:0.85rem;color:#666;margin-top:0.25rem;">Open the full two-way interactive converter with real-time calculations.</div>
            </div>
            <div style="border:1px solid #eee;border-radius:6px;padding:0.75rem;">
              <div style="font-weight:600;"><a href="${rel.categoryPath}" style="color:#0066cc;text-decoration:none;">Explore All ${rel.categoryName} Conversions &rarr;</a></div>
              <div style="font-size:0.85rem;color:#666;margin-top:0.25rem;">Browse the comprehensive directory of all units, reference charts, and live matrices.</div>
            </div>
          </div>
        </section>
      ` : ""}

      ${relPosts.length > 0 ? `
        <section aria-labelledby="related-articles-heading" style="border:1px solid #ddd;border-radius:8px;padding:1.25rem;">
          <h2 id="related-articles-heading" style="font-size:1.25rem;font-weight:600;margin-bottom:0.75rem;">Related Technical Articles</h2>
          <ul style="padding-left:1.25rem;line-height:1.6;">
            ${relPosts.map((p) => `<li><a href="/blog/${p.slug}" style="color:#0066cc;text-decoration:none;"><strong>${p.title}</strong></a> &mdash; <span style="font-size:0.85rem;color:#666;">${p.excerpt}</span></li>`).join("")}
          </ul>
        </section>
      ` : ""}

      <section aria-labelledby="standards-grounding-heading" style="border:1px solid #ddd;border-radius:8px;padding:1.25rem;background:#fafafa;">
        <h2 id="standards-grounding-heading" style="font-size:1.1rem;margin-top:0;">Standards Reference & Metrological Grounding</h2>
        <p style="margin:0;font-size:0.85rem;color:#777;">Calculations and conversion factors in this guide adhere to NIST Special Publication 811 and BIPM SI brochure definitions. Review our complete <a href="/about" style="color:#0066cc;">institutional standards and sources directory</a>.</p>
      </section>
    </article>
  `;
  renderAndWritePage({
    routePath: pageRoute,
    title: guide.title,
    description: guide.metaDesc,
    schema: guideCombinedSchema,
    staticBodyHtml: guideBodyHtml
  });
  generatedCount++;
}
console.log("\u26A1 Prerendering 6 Blog Posts ...");
for (const post of BLOG_POSTS) {
  if (!post.slug) continue;
  const pageRoute = `/blog/${post.slug}`;
  const blogPostSchema = buildBlogPostSchema(post);
  const blogRelatedPairs = categoryContent[post.relatedCat]?.popularPairs ?? [];
  const blogRelatedCatLabel = Categories.find((c) => c.id === post.relatedCat)?.lb ?? post.relatedCat;
  const blogPostBodyHtml = `
    <article class="max-w-4xl mx-auto p-6 space-y-6" style="font-family:system-ui,sans-serif;">
      <nav aria-label="Breadcrumb" style="font-size:0.85rem;color:#666;margin-bottom:1rem;">
        <a href="/">Home</a> / <a href="/blog">Blog</a> / <strong>${escapeHtml(post.title)}</strong>
      </nav>
      <header>
        <h1 style="font-size:2rem;font-weight:700;">${escapeHtml(post.title)}</h1>
        <div style="font-size:0.85rem;color:#777;margin-top:0.5rem;">
          Published on ${post.date} \xB7 By ${post.author} \xB7 ${post.readTime}
        </div>
        <p style="font-size:1.1rem;color:#555;line-height:1.6;margin-top:0.75rem;">${escapeHtml(post.excerpt)}</p>
      </header>

      <p style="color:#333;line-height:1.7;">${escapeHtml(post.content.intro)}</p>

      ${post.content.keyTakeaways.length > 0 ? `
        <section aria-labelledby="takeaways-heading" style="border:1px solid #ddd;border-radius:8px;padding:1.25rem;background:#fafafa;">
          <h2 id="takeaways-heading" style="font-size:1.2rem;margin-top:0;">Key Takeaways</h2>
          <ul style="line-height:1.6;margin-bottom:0;">
            ${post.content.keyTakeaways.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}
          </ul>
        </section>
      ` : ""}

      <div style="display:flex;flex-direction:column;gap:1.5rem;">
        ${post.content.sections.map((sec) => `
          <section>
            <h2 style="font-size:1.3rem;margin-bottom:0.5rem;">${escapeHtml(sec.title)}</h2>
            <p style="color:#444;line-height:1.6;margin:0;">${escapeHtml(sec.body)}</p>
            ${sec.formula ? `<pre style="background:#f4f4f8;border-radius:6px;padding:0.75rem;white-space:pre-wrap;"><code>${escapeHtml(sec.formula)}</code></pre>` : ""}
            ${sec.bulletPoints?.length ? `<ul style="line-height:1.6;">${sec.bulletPoints.map((bp) => `<li>${escapeHtml(bp)}</li>`).join("")}</ul>` : ""}
            ${sec.table?.length ? `
              <table style="border-collapse:collapse;width:100%;margin-top:0.75rem;">
                <thead><tr>${[sec.table[0].col1, sec.table[0].col2, sec.table[0].col3].filter(Boolean).map((c) => `<th scope="col" style="text-align:left;border-bottom:1px solid #ddd;padding:6px;">${escapeHtml(c)}</th>`).join("")}</tr></thead>
                <tbody>${sec.table.slice(1).map((r) => `<tr>${[r.col1, r.col2, r.col3].filter(Boolean).map((c) => `<td style="border-bottom:1px solid #eee;padding:6px;">${escapeHtml(c)}</td>`).join("")}</tr>`).join("")}</tbody>
              </table>` : ""}
          </section>
        `).join("")}
      </div>

      ${post.content.faq && post.content.faq.length > 0 ? `
        <section aria-labelledby="faq-heading">
          <h2 id="faq-heading" style="font-size:1.3rem;margin-bottom:0.75rem;">Frequently Asked Questions</h2>
          <div style="display:flex;flex-direction:column;gap:1rem;">
            ${post.content.faq.map((f) => `
              <div style="border-left:3px solid #0066cc;padding-left:1rem;">
                <h3 style="margin:0 0 0.25rem 0;font-size:1.05rem;">${f.q}</h3>
                <p style="margin:0;color:#555;font-size:0.95rem;line-height:1.5;">${f.a}</p>
              </div>
            `).join("")}
          </div>
        </section>
      ` : ""}

      ${blogRelatedPairs.length > 0 ? `
        <section aria-labelledby="related-converters-heading">
          <h2 id="related-converters-heading" style="font-size:1.2rem;">Related Converters</h2>
          <ul style="line-height:1.8;">
            <li><a href="/convert/${post.relatedCat}" style="color:#0066cc;">All ${escapeHtml(blogRelatedCatLabel)} conversions</a></li>
            ${blogRelatedPairs.map((p) => `<li><a href="/convert/${post.relatedCat}/${cleanSlug2(p.from)}-to-${cleanSlug2(p.to)}" style="color:#0066cc;">${escapeHtml(p.from)} to ${escapeHtml(p.to)}</a></li>`).join("")}
          </ul>
        </section>
      ` : ""}

      <section aria-labelledby="related-articles-heading">
        <h2 id="related-articles-heading" style="font-size:1.2rem;">Related Guides & Tutorials</h2>
        <ul style="line-height:1.8;">
          ${getRelatedPosts(post).map((rp) => `<li><a href="/blog/${rp.slug}" style="color:#0066cc;">${escapeHtml(rp.title)}</a> \u2014 ${escapeHtml(rp.excerpt)}</li>`).join("")}
        </ul>
      </section>

      <div style="font-size:0.85rem;color:#777;border-top:1px solid #eee;padding-top:0.75rem;margin-top:1.5rem;">
        Published by ${post.author} on behalf of NumanX Studio. Conversion constants adhere to NIST SP 811 and BIPM SI brochure standards. Consult our <a href="/about" style="color:#0066cc;">metrology standards directory</a>.
      </div>

      <footer style="border-top:1px solid #eee;padding-top:1rem;margin-top:1rem;">
        <p><a href="/blog">\u2190 Return to All Articles</a></p>
      </footer>
    </article>
  `;
  renderAndWritePage({
    routePath: pageRoute,
    title: post.seoTitle ?? post.title,
    description: post.excerpt,
    schema: blogPostSchema,
    staticBodyHtml: blogPostBodyHtml
  });
  generatedCount++;
}
console.log("\u26A1 Prerendering legal & contact pages ...");
for (const doc of [getPrivacyPolicy(), getTerms(), getContactPage()]) {
  renderAndWritePage({
    routePath: doc.path,
    title: PAGE_META[doc.path].title,
    description: PAGE_META[doc.path].description,
    schema: buildCorePageSchema(doc.path, PAGE_META[doc.path].title, PAGE_META[doc.path].description, { pageType: "WebPage" }),
    staticBodyHtml: renderLegalBody(doc)
  });
  generatedCount++;
}
var securityTxt = buildSecurityTxt(siteOrigin);
if (securityTxt) {
  fs.mkdirSync(path.join(distDir, ".well-known"), { recursive: true });
  fs.writeFileSync(path.join(distDir, ".well-known", "security.txt"), securityTxt, "utf-8");
  console.log("\u2705 Wrote /.well-known/security.txt");
} else {
  console.log("\u2139\uFE0F  Skipped security.txt: set LEGAL.contactEmail in src/config/legal.ts to publish it");
}
console.log("\u26A1 Prerendering 404 page (dist/404.html) ...");
renderAndWritePage({
  routePath: "/404",
  title: "Page Not Found (404)",
  description: "The page you requested does not exist or has been moved. Explore 24 unit conversion categories or return home.",
  staticBodyHtml: `
    <main style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:55vh;padding:3rem 1rem;font-family:system-ui,-apple-system,sans-serif;text-align:center;">
      <div style="font-size:4rem;font-weight:900;color:#2563eb;font-family:monospace;letter-spacing:0.05em;" aria-hidden="true">404</div>
      <div style="margin:1rem 0 1.5rem;">
        <h1 style="font-size:1.75rem;font-weight:700;color:#111;margin:0 0 0.5rem;">Page Not Found</h1>
        <p style="font-size:0.95rem;color:#666;line-height:1.5;max-width:28rem;margin:0 auto;">The page you requested does not exist, was moved, or had its URL changed.</p>
      </div>
      <div style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;">
        <a href="/" style="padding:0.6rem 1.25rem;border-radius:0.75rem;background:#2563eb;color:#ffffff;text-decoration:none;font-size:0.875rem;font-weight:600;">\u2190 Return Home</a>
        <a href="/categories" style="padding:0.6rem 1.25rem;border-radius:0.75rem;border:1px solid #d1d5db;color:#374151;text-decoration:none;font-size:0.875rem;font-weight:600;background:#ffffff;">Browse All Categories</a>
      </div>
    </main>
  `,
  is404: true
});
console.log(`
\u{1F389} Prerender Complete! Generated meaningful static HTML for ${generatedCount} routes.`);
