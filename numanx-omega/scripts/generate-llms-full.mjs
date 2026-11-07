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
  Full catalog of all 24 supported conversion categories with unit counts and measurement dimensions.
- **Currency Center:** ${canonicalUrl("/currency")}
  Real-time foreign exchange converter supporting 160+ fiat currencies with offline fallback rates.
- **Cryptocurrency Tracker:** ${canonicalUrl("/crypto")}
  Crypto asset pricing and unit calculator across major digital tokens with multi-currency fiat pairings.
- **Formula Explorer:** ${canonicalUrl("/formulas")}
  Interactive directory of algebraic conversion formulas, dimensional scale factors, and mathematical definitions.
- **Scientific Calculator:** ${canonicalUrl("/calculator")}
  Client-side mathematical calculator with standard arithmetic, trigonometry, powers, and logs.
- **Health Metrics:** ${canonicalUrl("/health")}
  Body Mass Index (BMI), Basal Metabolic Rate (BMR), and daily energy requirement calculators.
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
  Accuracy, third-party price data, health calculator limits, acceptable use and CC BY 4.0 content licensing.
`);
  sections.push(`## 3. Supported Measurement Categories (24 Categories)

Omega X Converter provides complete unit coverage across 24 distinct physical and financial domains:
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
  sections.push(`## 4. Curated Popular Conversion Pairs (99 Canonical Pairs)

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
  sections.push(`## 5. Educational Guides (6 Guides)

Comprehensive technical guides detailing unit origins, math shortcuts, and real-world applications:
`);
  for (const guide of Object.values(guideContent)) {
    if (guide.slug) {
      const url = canonicalUrl(`/guides/${guide.slug}`);
      sections.push(`### ${guide.title}
- **Canonical URL:** ${url}
- **Category:** ${guide.category}
- **Target Measurement System:** ${guide.metaDesc || guide.subtitle || "Educational conversion guide."}
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

> Universal unit and currency conversion platform with 24 physical and financial categories, deterministic conversion algorithms, offline PWA capabilities, and authoritative scientific standards alignment.

Omega X Converter is a client-side unit conversion web application developed and published by NumanX Studio. It provides exact, deterministic conversions across length, mass, temperature, area, volume, digital data, energy, pressure, speed, time, currency, crypto, and other scientific and everyday measurement systems. All calculations execute locally in the user's browser with zero tracking, zero advertising cookies, and zero server-side telemetry.

Canonical Origin: ${DEFAULT_SITE_URL}/
Publisher: NumanX Studio
License: Creative Commons Attribution 4.0 International (CC BY 4.0)
XML Sitemap: ${DEFAULT_SITE_URL}/sitemap.xml
Full Agent Documentation: ${DEFAULT_SITE_URL}/llms-full.txt

## Primary Public Resources

- [Home](${canonicalUrl("/")}): Main interactive universal conversion workspace with multi-category search, unit selection, and real-time computation.
- [Universal Converter](${canonicalUrl("/converter")}): Dedicated conversion tool interface supporting all 24 measurement categories.
- [Categories Directory](${canonicalUrl("/categories")}): Complete index of all 24 conversion categories with unit counts and reference standards.
- [Currency Exchange](${canonicalUrl("/currency")}): Global fiat currency conversion tool supporting 160+ fiat currencies with offline fallback rates.
- [Cryptocurrency Rates](${canonicalUrl("/crypto")}): Digital asset conversion calculator covering major cryptocurrencies against USD, EUR, GBP, and BTC.
- [Formula Explorer](${canonicalUrl("/formulas")}): Mathematical conversion formulas, dimensional constants, and algebraic transformation rules.
- [Scientific Calculator](${canonicalUrl("/calculator")}): Standard and scientific arithmetic calculator with trigonometric, logarithmic, and power functions.
- [Health & Fitness Metrics](${canonicalUrl("/health")}): Body mass index (BMI), basal metabolic rate (BMR), and daily energy expenditure calculators.
- [Educational Blog](${canonicalUrl("/blog")}): Technical articles on metrology, fractional machinist units, historical systems, and data prefixes.
- [About & Standards Methodology](${canonicalUrl("/about")}): Overview of conversion engine architecture, institutional standards citations (NIST, BIPM, ISO, CODATA), and project governance.
- [HTML Sitemap](${canonicalUrl("/sitemap")}): Authoritative index of every canonical public page.
- [Contact](${canonicalUrl("/contact")}): How to report a wrong conversion, a security issue or a privacy question.
- [Privacy Policy](${canonicalUrl("/privacy")}): No accounts, ads, cookies or analytics; history and settings stay in the browser.
- [Terms of Use](${canonicalUrl("/terms")}): Accuracy, third-party price data, health calculator limits and content licensing.

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
- [Textile & Yarn Count](${canonicalUrl("/convert/textile")}): Tex, denier, cotton count (Ne), worsted count, metric count (Nm).
- [Astronomy](${canonicalUrl("/convert/astronomy")}): Astronomical units (au), light-years, parsecs, kilometers, miles.

## Educational Guides

- [Meters to Feet Conversion Guide](${canonicalUrl("/guides/meters-to-feet")}): Detailed conversion methodology, practical height and construction examples, and historical background.
- [Feet to Meters Conversion Guide](${canonicalUrl("/guides/feet-to-meters")}): Reverse length conversion reference from international feet to SI meters.
- [Celsius to Fahrenheit Conversion Guide](${canonicalUrl("/guides/celsius-to-fahrenheit")}): Exact affine formula breakdown, mental math shortcuts, and meteorological references.
- [Fahrenheit to Celsius Conversion Guide](${canonicalUrl("/guides/fahrenheit-to-celsius")}): Reverse thermal conversion reference with exact 5/9 interval ratios.
- [Kilograms to Pounds Conversion Guide](${canonicalUrl("/guides/kg-to-lbs")}): Mass conversion standard (NIST / international avoirdupois pound) with conversion tables.
- [Pounds to Kilograms Conversion Guide](${canonicalUrl("/guides/lbs-to-kg")}): Standard mass conversion reference from avoirdupois pounds to SI kilograms.

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
