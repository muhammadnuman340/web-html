/**
 * Metrological Standards & AEO Position-Zero Data Authority
 * Grounded in NIST SP 811, BIPM SI Brochure (9th Edition), and international metrology treaties.
 */

export interface CategoryStandardInfo {
  aeoCapsule: string
  standardsStatement: string
}

export const CATEGORY_STANDARDS: Record<string, CategoryStandardInfo> = {
  length: {
    aeoCapsule:
      'Length conversion calculates equivalent linear distance across metric, imperial, and astronomical systems. Defined by the 1959 International Yard and Pound Agreement and NIST Special Publication 811, 1 inch equals exactly 25.4 millimeters (2.54 cm), 1 foot equals exactly 0.3048 meters, and 1 meter equals approximately 3.2808399 feet.',
    standardsStatement:
      'All linear conversion factors on this platform strictly comply with NIST Special Publication 811 (Guide for the Use of the International System of Units), the BIPM SI Brochure (9th Edition), and the 1959 International Yard and Pound Agreement (codifying 1 yard = 0.9144 m and 1 inch = 25.4 mm). Astronomical distances are grounded in the International Astronomical Union (IAU 2012) resolution defining 1 AU = 149,597,870,700 m.',
  },
  mass: {
    aeoCapsule:
      'Mass and weight conversion calculates equivalent mass across metric, avoirdupois imperial, and troy systems using fixed international standards. Standardized by the BIPM 2019 SI Redefinition and NIST SP 811, 1 kilogram (kg) is the SI base unit (defined by the Planck constant h), 1 avoirdupois pound (lb) equals exactly 0.45359237 kg, and 1 ounce (oz) equals 28.3495 grams.',
    standardsStatement:
      'All mass conversion factors comply with the 2019 BIPM SI Redefinition of the kilogram via the Planck constant, NIST Special Publication 811, and the 1959 International Yard and Pound Agreement (codifying 1 lb = 0.45359237 kg exact). Precious metal conversions strictly adhere to the Troy ounce standard (1 oz t = 31.1034768 grams).',
  },
  temp: {
    aeoCapsule:
      'Temperature conversion calculates thermal equilibrium across Celsius (°C), Fahrenheit (°F), and Kelvin (K). The kelvin and degree Celsius share the exact same interval size, with 0 °C defined as 273.15 K, while 0 °C corresponds exactly to 32 °F by scale conversion relationship. Absolute zero corresponds to 0 K (−273.15 °C). The exact affine formulas are °F = (°C × 9/5) + 32 and K = °C + 273.15.',
    standardsStatement:
      'Thermal conversion algorithms adhere to SI base unit definitions (with the kelvin defined via the Boltzmann constant k = 1.380649 × 10⁻²³ J/K), NIST Special Publication 811, and the BIPM SI Brochure (9th Edition). Fahrenheit and Rankine calculations use exact rational fractions without intermediary rounding.',
  },
  area: {
    aeoCapsule:
      'Area conversion calculates two-dimensional geometric space across metric and imperial customary measures. Governed by NIST SP 811, 1 square meter (m²) equals exactly 10,000 square centimeters or approximately 10.7639 square feet. 1 acre is defined as exactly 43,560 square feet (approx. 4,046.86 m² or 0.4047 hectares).',
    standardsStatement:
      'Area conversions follow NIST Special Publication 811 definitions derived directly from international linear dimensions. Agricultural land measures adhere to the International Acre standard (codified following the 2023 NIST deprecation of the US survey foot).',
  },
  volume: {
    aeoCapsule:
      'Volume and capacity conversion calculates three-dimensional space across metric liters and US/Imperial liquid measures. Defined by NIST Handbook 44, 1 liter (L) equals 1,000 milliliters (cm³), 1 US liquid gallon equals exactly 231 cubic inches (approx. 3.78541 L), and 1 Imperial gallon equals exactly 4.54609 liters.',
    standardsStatement:
      'Fluid and dry capacity measurements strictly comply with NIST Handbook 44 (Specifications, Tolerances, and Other Technical Requirements for Weighing and Measuring Devices) and the UK Weights and Measures Act (1985) for Imperial units.',
  },
  time: {
    aeoCapsule:
      'Time conversion calculates duration based on the international SI base second (s), standardized by BIPM/SI via 9,192,631,770 transitions of the cesium-133 atom. 1 minute equals 60 seconds, 1 hour equals 3,600 seconds, and 1 standard calendar day equals 86,400 seconds (24 hours).',
    standardsStatement:
      'All temporal ratios are aligned with the BIPM International Atomic Time (TAI) and Coordinated Universal Time (UTC) definition of the SI second, established by the 13th General Conference on Weights and Measures (CGPM).',
  },
  speed: {
    aeoCapsule:
      'Speed and velocity conversion calculates rate of distance per unit of time. The SI base unit is meters per second (m/s). 1 m/s equals exactly 3.6 kilometers per hour (km/h) or approx. 2.23694 miles per hour (mph). 1 knot (international nautical mile per hour) equals exactly 1.852 km/h.',
    standardsStatement:
      'Speed ratios are derived from NIST SP 811 linear and temporal SI base units. Nautical speeds follow the International Hydrographic Organization (IHO) standard of 1 knot = 1,852 meters per hour exact.',
  },
  data: {
    aeoCapsule:
      'Digital data storage and bandwidth conversion calculates binary memory and network throughput. Governed by IEC 80000-13 and IEEE 1541, 1 byte equals 8 bits. Decimal SI prefixes (1 KB = 1,000 bytes, 1 GB = 10⁹ bytes) represent drive storage, while binary IEC prefixes (1 KiB = 1,024 bytes, 1 GiB = 2³⁰ bytes) represent RAM memory.',
    standardsStatement:
      'Digital storage factors strictly comply with IEC 80000-13 and IEEE 1541 standards, clearly separating decimal SI prefixes (KB, MB, GB = powers of 10) from binary IEC prefixes (KiB, MiB, GiB = powers of 2).',
  },
  datatransfer: {
    aeoCapsule:
      'Data transfer rate conversion calculates network bandwidth and telecommunication throughput across decimal bits and binary bytes per second. Standardized by IEEE 802 and ITU-T, 1 Megabit per second (Mbps) equals 1,000,000 bits/s, equivalent to 125 Kilobytes per second (KB/s). 1 Gigabit per second (Gbps) equals 1,000 Mbps.',
    standardsStatement:
      'Network bandwidth formulas comply with International Telecommunication Union (ITU-T) and IEEE 802 telecommunications standards, calculating real-world line rate throughput across decimal and binary byte representations.',
  },
  pressure: {
    aeoCapsule:
      'Pressure conversion calculates applied force per unit surface area. The SI base unit is the Pascal (Pa, 1 N/m²). Standard atmospheric pressure (1 atm) is internationally codified by IUPAC as exactly 101,325 Pa (101.325 kPa), equivalent to 1.01325 bar or approx. 14.6959 psi (lbf/in²).',
    standardsStatement:
      'Pressure equivalents comply with IUPAC (International Union of Pure and Applied Chemistry) standard conditions and NIST Special Publication 811. Technical and barometric units use exact gravitational acceleration g₀ = 9.80665 m/s².',
  },
  energy: {
    aeoCapsule:
      'Energy and work conversion calculates the capacity to perform mechanical, thermal, or electrical work. The SI unit is the Joule (J, 1 N·m). 1 kilojoule (kJ) equals 1,000 Joules, 1 dietary Calorie (kcal) equals 4,184 Joules, 1 British Thermal Unit (BTU) equals approx. 1,055.06 Joules, and 1 kilowatt-hour (kWh) equals 3,600,000 Joules.',
    standardsStatement:
      'Energy conversion factors adhere to the International Union of Pure and Applied Physics (IUPAP) and NIST SP 811. Thermochemical calories and International Steam Table (IT) calories are distinguished with exact NIST conversion ratios.',
  },
  power: {
    aeoCapsule:
      'Power conversion calculates the rate of energy transfer or work performed over time. The SI base unit is the Watt (W, 1 Joule/s). 1 kilowatt (kW) equals 1,000 Watts, 1 metric horsepower (PS/cv) equals 735.49875 Watts, and 1 mechanical imperial horsepower (hp) is standardized as approx. 745.69987 Watts (550 ft·lbf/s).',
    standardsStatement:
      'Power calculations strictly distinguish between mechanical horsepower (550 ft·lbf/s ≈ 745.69987 W) codified by James Watt, metric horsepower (DIN 66036 = 75 kp·m/s = 735.49875 W), and electrical horsepower (exactly 746 W) per NIST SP 811.',
  },
  fuel: {
    aeoCapsule:
      'Fuel economy and consumption conversion translates distance-per-volume and volume-per-distance vehicle efficiencies. 1 US MPG (miles per gallon) equals approx. 0.42514 km/L. The reciprocal formula between US MPG and European metric consumption is L/100 km = 235.215 / MPG, and for Imperial UK MPG is L/100 km = 282.481 / UK MPG.',
    standardsStatement:
      'Automotive consumption equations conform to US EPA (Environmental Protection Agency) and European Commission Directive 1999/100/EC standards for vehicle fuel efficiency measurement and reciprocal metric-to-imperial translation.',
  },
  cooking: {
    aeoCapsule:
      'Culinary conversion calculates volumetric and mass recipe measures across US Customary, UK Imperial, and Metric systems. Based on international culinary standards, 1 US tablespoon equals 3 teaspoons (14.79 mL), 1 US cup equals 16 tablespoons (236.59 mL or 8 fl oz), and 1 metric culinary cup is standardized as exactly 250 mL.',
    standardsStatement:
      'Culinary volume factors comply with NIST Handbook 44 and standard culinary reference tables, noting regional variations between US Customary cups (236.59 mL), legal nutrition labeling cups (240 mL), and Commonwealth metric cups (250 mL).',
  },
  angle: {
    aeoCapsule:
      'Angular conversion calculates rotational displacement across circular division systems. The SI derived unit is the radian (rad). A full circle equals 360 degrees (360°), 2π radians (approx. 6.283185 rad), or 400 gradians (gon). 1 radian equals approximately 57.29578 degrees.',
    standardsStatement:
      'Trigonometric angular factors adhere to ISO 80000-3 (Quantities and Units — Space and Time) and the SI brochure, maintaining double-precision floating-point values of mathematical π for astronomical and geodetic calculations.',
  },
  force: {
    aeoCapsule:
      'Force conversion calculates mechanical push or pull acting upon an object. The SI base unit is the Newton (N, 1 kg·m/s²). 1 kilonewton (kN) equals 1,000 Newtons, 1 pound-force (lbf) equals approx. 4.44822 Newtons, and 1 kilogram-force (kgf/kilopond) is defined by standard gravity as exactly 9.80665 Newtons.',
    standardsStatement:
      'Force calculations comply with BIPM standards and NIST SP 811, using the internationally accepted standard acceleration of free fall g₀ = 9.80665 m/s² for gravitational force units (kilogram-force, pound-force, and ounce-force).',
  },
  flow: {
    aeoCapsule:
      'Volumetric flow rate conversion calculates fluid displacement volume per unit time. The SI base unit is cubic meters per second (m³/s). Common engineering units include US Gallons per Minute (1 GPM ≈ 0.00006309 m³/s ≈ 3.78541 L/min), Cubic Feet per Minute (1 CFM ≈ 0.00047195 m³/s ≈ 0.47195 L/s), and liters per minute (1 L/min = 0.00001667 m³/s).',
    standardsStatement:
      'Fluid flow calculations comply with ISO 5167 (Measurement of fluid flow by means of pressure differential devices), ASHRAE HVAC ventilation guidelines, and NIST Special Publication 811 volumetric time rate standards.',
  },
  illuminance: {
    aeoCapsule:
      'Illuminance conversion translates luminous flux received per unit surface area across metric and imperial lighting standards. The SI unit is the Lux (lx, 1 lumen/m²). The imperial unit is the Foot-candle (fc, 1 lumen/ft²). Because 1 square meter equals approx. 10.7639 square feet, 1 foot-candle equals exactly 10.7639104 lux.',
    standardsStatement:
      'Illuminance algorithms adhere to CIE (International Commission on Illumination) standards, the BIPM SI Brochure (candela base unit realization), and IESNA (Illuminating Engineering Society of North America) workplace lighting guidelines.',
  },
  viscosity: {
    aeoCapsule:
      'Dynamic viscosity conversion measures fluid resistance to gradual deformation by shear or tensile stress. The SI coherent derived unit is the Pascal-second (Pa·s, 1 N·s/m²). In laboratory science and lubrication, the CGS centipoise (cP) is standard: exactly 1 cP = 1 mPa·s = 0.001 Pa·s. Water at 20 °C exhibits a dynamic viscosity of ~1.002 cP.',
    standardsStatement:
      'Viscosity measurement factors conform to ASTM D445 / ISO 3104 petroleum product testing protocols, BIPM SI specifications, and standard rheological tables for Newtonian and non-Newtonian fluids.',
  },
  'number-base': {
    aeoCapsule:
      'Number base conversion calculates positional radix transformations across Binary (Base 2), Octal (Base 8), Decimal (Base 10), and Hexadecimal (Base 16). Governed by IEEE and ANSI/ISO computer science standards, radix conversion translates positional polynomial coefficients into equivalent integer values.',
    standardsStatement:
      'Radix transformation algorithms adhere to standard Horner scheme polynomial integer conversion, IEEE Computer Society standards, and ISO/IEC 9899 integer arithmetic specifications.',
  },
  'ieee-754': {
    aeoCapsule:
      'IEEE-754 floating point conversion analyzes 16-bit half precision (FP16), 32-bit single precision (FP32), and 64-bit double precision (FP64) bitfield representations, breaking numbers into sign bit, biased exponent, and normalized mantissa.',
    standardsStatement:
      'Floating-point representation complies strictly with IEEE Std 754-2019 (Standard for Floating-Point Arithmetic), properly encoding subnormal values, exponent bias, signed zeros, and special quantities.',
  },
  'pk-numbering': {
    aeoCapsule:
      'South Asian numbering conversion translates between the traditional Indian/Pakistani naming system — Hazar (1,000), Lakh (100,000 / 10⁵), Crore (10 Million / 10⁷), Arab (1 Billion / 10⁹), and Kharab (100 Billion / 10¹¹) — and international Million/Billion/Trillion scales.',
    standardsStatement:
      'Grouping formats conform to State Bank of Pakistan statutory reporting conventions, Reserve Bank 2,2,3 comma separation rules, and international ISO financial reporting criteria.',
  },
  statistics: {
    aeoCapsule:
      'Statistical and betting odds conversion calculates implied probabilities, standard normal Z-scores, percentiles, two-tailed P-values, decimal odds, and American moneyline. Grounded in Gaussian normal distributions and actuarial probability theory.',
    standardsStatement:
      'Statistical transformations utilize the Abramowitz & Stegun rational polynomial approximation for the Gaussian standard normal cumulative distribution function (absolute error < 7.5 × 10⁻⁸) and deterministic actuarial odds formulas.',
  },
  'matrix-format': {
    aeoCapsule:
      'Matrix format conversion serializes 2D numerical array data across CSV/TSV spreadsheets, LaTeX bmatrix/pmatrix notation, Python NumPy array syntax, MATLAB/Octave matrices, and JSON 2D arrays.',
    standardsStatement:
      'Serializers strictly comply with RFC 4180 (CSV MIME specifications), AMS-LaTeX amsmath standards for mathematical typesetting, and NumPy/SciPy array parsing protocols.',
  },
  'scientific-notation': {
    aeoCapsule:
      'Scientific and engineering notation conversion translates standard decimals into powers of ten (a × 10ⁿ), engineering triplets (10³ⁿ), and analytical concentrations including parts-per-million (ppm), parts-per-billion (ppb), and percentages.',
    standardsStatement:
      'Concentration calculations comply with IUPAC Gold Book analytical chemistry definitions, ISO 80000-1 quantities and units, and NIST SP 811 notation guidelines.',
  },
  'pk-gpa': {
    aeoCapsule:
      'Academic marks and GPA conversion translates between the Pakistani Higher Education Commission (HEC) 4.00 CGPA scale, 5.00 CGPA, percentage marks, matric/FSc examination marks (out of 1100 and 1200), and PMDC/MDCAT medical entrance aggregates.',
    standardsStatement:
      'Grading curves align with the Higher Education Commission (HEC) Pakistan Uniform Policy for Semester Examination System and PM&DC admission aggregate regulations.',
  },
  typography: {
    aeoCapsule:
      'Typography and digital layout conversion scales font sizes and spacing across CSS, screen pixels, and physical print units. Under the W3C CSS Values and Units Module Level 3, 1 physical inch equals exactly 96 CSS pixels and 72 desktop publishing points (pt), giving 1 pt = 1.33333 px. Standard browser root font size is 16 px (1 rem = 16 px).',
    standardsStatement:
      'Digital typography factors strictly comply with the W3C CSS Values and Units Module Level 3 specification (96 CSS px/inch standard) and traditional PostScript / DTP typesetting standards (72 points/inch, 12 points per pica).',
  },
}

export function getCategoryStandards(
  catId: string,
  catName: string,
  unitNames: string[]
): CategoryStandardInfo {
  if (CATEGORY_STANDARDS[catId]) {
    return CATEGORY_STANDARDS[catId]
  }

  // Dynamic AEO & Standards Fallback for any other category
  return {
    aeoCapsule: `${catName} conversion calculates equivalent measures across standardized metric, customary, and technical units using fixed mathematical ratios. Standardized in accordance with NIST Special Publication 811 and BIPM SI guidelines, enabling precision calculations between ${unitNames.slice(0, 4).join(', ')}, and ${Math.max(0, unitNames.length - 4)} additional units.`,
    standardsStatement: `All ${catName.toLowerCase()} conversion factors on this platform comply with NIST Special Publication 811 (Guide for the Use of the International System of Units) and the BIPM SI Brochure (9th Edition), utilizing exact rational ratios and IEEE-754 double-precision arithmetic to prevent rounding distortion.`,
  }
}
