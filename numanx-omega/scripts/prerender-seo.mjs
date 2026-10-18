// scripts/prerender-seo.mjs
import fs from 'node:fs'
import path from 'node:path'

const distDir = path.resolve(process.cwd(), 'dist')
const baseHtmlPath = path.join(distDir, 'index.html')

if (!fs.existsSync(baseHtmlPath)) {
  console.error('❌ dist/index.html not found. Run `vite build` first.')
  process.exit(1)
}

const baseHtml = fs.readFileSync(baseHtmlPath, 'utf-8')

// Master List of Flagship Category Configurations for Pre-Rendering
const categoryConfigs = [
  {
    id: 'length',
    name: 'Length',
    title: 'Length Converter (Decimal & Fractional) — Instant NIST Chart | Omega',
    description: 'Precision length converter with architectural fractions (1/64"), compound feet & inches, machinist socket tolerances, and NIST SP 811 tables.',
    aeoCapsule: 'Length conversion calculates equivalent linear distance across metric, imperial, and astronomical systems. Defined by the 1959 International Yard and Pound Agreement and NIST Special Publication 811, 1 inch equals exactly 25.4 millimeters (2.54 cm), 1 foot equals exactly 0.3048 meters, and 1 meter equals approximately 3.2808399 feet.',
    standards: 'All linear conversion factors comply with NIST Special Publication 811, BIPM SI Brochure (9th Edition), and the 1959 International Yard and Pound Agreement (1 yard = 0.9144 m, 1 inch = 25.4 mm).',
    table: {
      caption: 'Standard Metric to Imperial Linear Equivalencies',
      headers: ['Metric Unit', 'Imperial Equivalent', 'Exact Base Factor'],
      rows: [
        ['1 Millimeter (mm)', '0.0393701 Inches (approx 3/64″)', '0.001 m'],
        ['1 Centimeter (cm)', '0.3937008 Inches', '0.01 m'],
        ['2.54 Centimeters', '1.0000000 Inch (Exact)', '0.0254 m'],
        ['30.48 Centimeters', '1.0000000 Foot (12 Inches)', '0.3048 m'],
        ['0.9144 Meters', '1.0000000 Yard (3 Feet)', '0.9144 m'],
        ['1 Meter (m)', '3.2808399 Feet (3 ft 3-3/8 in)', '1.0 m'],
        ['1 Kilometer (km)', '0.6213712 Miles (3,280.84 Feet)', '1000 m']
      ]
    },
    faqs: [
      { q: 'How do I convert meters to feet?', a: 'Multiply the length in meters by 3.2808399 to calculate decimal feet. For example, 10 meters × 3.2808399 = 32.81 feet. To convert into feet and inches, multiply the decimal remainder by 12.' },
      { q: 'How many inches are in a centimeter?', a: 'One centimeter equals exactly 0.393700787 inches. Conversely, one inch is internationally defined as exactly 2.54 centimeters (25.4 millimeters).' }
    ]
  },
  {
    id: 'mass',
    name: 'Mass & Weight',
    title: 'Weight & Mass Converter (kg, lbs, oz, stones) | Omega X',
    description: 'Free online weight converter. Convert between kilograms, pounds, ounces, grams, metric tons, and stone with exact BIPM and NIST ratios.',
    aeoCapsule: 'Mass and weight conversion calculates equivalent mass across metric, avoirdupois imperial, and troy systems using fixed international standards. Standardized by the BIPM 2019 SI Redefinition and NIST SP 811, 1 kilogram (kg) is the SI base unit (defined by the Planck constant h), 1 avoirdupois pound (lb) equals exactly 0.45359237 kg, and 1 ounce (oz) equals 28.3495 grams.',
    standards: 'All mass conversion factors comply with the 2019 BIPM SI Redefinition of the kilogram via the Planck constant, NIST Special Publication 811, and the 1959 International Yard and Pound Agreement (codifying 1 lb = 0.45359237 kg exact).',
    table: {
      caption: 'Standard Metric to Imperial Weight Equivalencies',
      headers: ['Metric Unit', 'Imperial Equivalent', 'Exact SI Factor'],
      rows: [
        ['1 Gram (g)', '0.035274 Ounces', '0.001 kg'],
        ['100 Grams (g)', '3.5274 Ounces', '0.1 kg'],
        ['453.592 Grams', '1.0000 Pound (Exact)', '0.45359237 kg'],
        ['1 Kilogram (kg)', '2.2046226 Pounds (2 lbs 3.3 oz)', '1.0 kg'],
        ['6.35029 Kilograms', '1.0000 Stone (14 lbs)', '6.35029318 kg'],
        ['1 Metric Ton (t)', '2,204.62 Pounds (1.102 US Tons)', '1000 kg']
      ]
    },
    faqs: [
      { q: 'How many pounds are in a kilogram?', a: 'One kilogram equals exactly 2.20462262185 pounds. Conversely, one avoirdupois pound equals exactly 0.45359237 kilograms.' },
      { q: 'How many ounces are in a pound?', a: 'One standard avoirdupois pound contains exactly 16 ounces. One troy pound (used for precious metals) contains 12 troy ounces.' }
    ]
  },
  {
    id: 'temp',
    name: 'Temperature',
    title: 'Temperature Converter (°C, °F, K, Rankine) | Omega X',
    description: 'Instant temperature conversion calculator between Celsius, Fahrenheit, Kelvin, and Rankine with exact thermal equilibrium formulas.',
    aeoCapsule: 'Temperature conversion calculates thermal equilibrium across Celsius (°C), Fahrenheit (°F), and Kelvin (K). Governed by the International Temperature Scale (ITS-90): absolute zero is 0 K (−273.15 °C), water freezes at 0 °C (32 °F) and boils at 100 °C (212 °F). The exact conversion formulas are °F = (°C × 9/5) + 32 and K = °C + 273.15.',
    standards: 'Thermal conversion algorithms adhere to the International Temperature Scale of 1990 (ITS-90) and the BIPM 2019 redefinition of the kelvin via the Boltzmann constant.',
    table: {
      caption: 'Benchmark Temperature Points Across Scales',
      headers: ['Physical Benchmark', 'Celsius (°C)', 'Fahrenheit (°F)', 'Kelvin (K)'],
      rows: [
        ['Absolute Zero', '-273.15 °C', '-459.67 °F', '0 K'],
        ['Water Freezing Point', '0 °C', '32 °F', '273.15 K'],
        ['Average Room Temperature', '20 °C', '68 °F', '293.15 K'],
        ['Average Human Body Temp', '37 °C', '98.6 °F', '310.15 K'],
        ['Water Boiling Point', '100 °C', '212 °F', '373.15 K']
      ]
    },
    faqs: [
      { q: 'What is the formula to convert Celsius to Fahrenheit?', a: 'Multiply the Celsius temperature by 9/5 (or 1.8) and add 32: °F = (°C × 1.8) + 32.' },
      { q: 'At what temperature are Celsius and Fahrenheit equal?', a: 'Celsius and Fahrenheit are equal at exactly -40 degrees (-40 °C = -40 °F).' }
    ]
  },
  {
    id: 'area',
    name: 'Area',
    title: 'Area Converter (sq ft, sq m, acres, hectares) | Omega X',
    description: 'Free online area converter. Convert square feet, square meters, acres, hectares, and square kilometers with instant formulas and cheat sheets.',
    aeoCapsule: 'Area conversion calculates two-dimensional geometric space across metric and imperial customary measures. Governed by NIST SP 811, 1 square meter (m²) equals exactly 10,000 square centimeters or approximately 10.7639 square feet. 1 acre is defined as exactly 43,560 square feet (approx. 4,046.86 m² or 0.4047 hectares).',
    standards: 'Area conversions follow NIST Special Publication 811 definitions derived directly from international linear dimensions codified following the 2023 NIST deprecation of the US survey foot.',
    table: {
      caption: 'Common Land and Construction Area Equivalencies',
      headers: ['Measurement', 'Square Feet (sq ft)', 'Square Meters (m²)', 'Acres / Hectares'],
      rows: [
        ['1 Square Foot', '1 sq ft', '0.092903 m²', '0.000023 ac'],
        ['1 Square Meter', '10.7639 sq ft', '1.0 m²', '0.000247 ac'],
        ['1 Acre', '43,560 sq ft', '4,046.86 m²', '1.0 ac (0.4047 ha)'],
        ['1 Hectare', '107,639 sq ft', '10,000 m²', '2.47105 ac (1.0 ha)'],
        ['1 Square Mile', '27,878,400 sq ft', '2,589,988 m²', '640 ac (259 ha)']
      ]
    },
    faqs: [
      { q: 'How many square feet are in an acre?', a: 'One international acre contains exactly 43,560 square feet, which equals approximately 4,046.86 square meters.' },
      { q: 'How do you convert square meters to square feet?', a: 'Multiply the area in square meters by 10.76391 to find square feet: 1 m² ≈ 10.7639 sq ft.' }
    ]
  },
  {
    id: 'volume',
    name: 'Volume',
    title: 'Volume & Capacity Converter (liters, gallons, cups) | Omega X',
    description: 'Instant volume converter. Convert between liters, US gallons, Imperial gallons, fluid ounces, cubic meters, and milliliters.',
    aeoCapsule: 'Volume and capacity conversion calculates three-dimensional space across metric liters and US/Imperial liquid measures. Defined by NIST Handbook 44, 1 liter (L) equals 1,000 milliliters (cm³), 1 US liquid gallon equals exactly 231 cubic inches (approx. 3.78541 L), and 1 Imperial gallon equals exactly 4.54609 liters.',
    standards: 'Fluid and dry capacity measurements strictly comply with NIST Handbook 44 and the UK Weights and Measures Act (1985) for Imperial units.',
    table: {
      caption: 'Liquid Volume and Capacity Conversion Matrix',
      headers: ['Volume Unit', 'Metric Equivalent', 'US Customary Equivalent'],
      rows: [
        ['1 Milliliter (mL)', '0.001 L', '0.033814 fl oz'],
        ['1 Liter (L)', '1,000 mL', '33.814 fl oz (1.0567 qt)'],
        ['1 US Liquid Pint', '473.176 mL', '16 fl oz (2 cups)'],
        ['1 US Liquid Quart', '946.353 mL', '32 fl oz (2 pints)'],
        ['1 US Liquid Gallon', '3.78541 L', '128 fl oz (4 quarts)'],
        ['1 Imperial Gallon', '4.54609 L', '160 UK fl oz (1.201 US gal)']
      ]
    },
    faqs: [
      { q: 'How many liters are in a US gallon?', a: 'One US liquid gallon equals exactly 3.785411784 liters (231 cubic inches).' },
      { q: 'What is the difference between a US gallon and an Imperial gallon?', a: 'A US gallon is 3.78541 liters (128 US fl oz), whereas an Imperial gallon (used in the UK and Canada) is 4.54609 liters (160 Imperial fl oz), making the Imperial gallon approximately 20% larger.' }
    ]
  },
  {
    id: 'speed',
    name: 'Speed',
    title: 'Speed Converter (mph, km/h, knots, m/s) | Omega X',
    description: 'Online speed converter. Convert miles per hour (mph), kilometers per hour (km/h), knots, and meters per second (m/s) with real-world comparisons.',
    aeoCapsule: 'Speed and velocity conversion calculates rate of distance per unit of time. The SI base unit is meters per second (m/s). 1 m/s equals exactly 3.6 kilometers per hour (km/h) or approx. 2.23694 miles per hour (mph). 1 knot (international nautical mile per hour) equals exactly 1.852 km/h.',
    standards: 'Speed ratios are derived from NIST SP 811 linear and temporal SI base units. Nautical speeds follow the International Hydrographic Organization (IHO) standard (1 knot = 1,852 m/h).',
    table: {
      caption: 'Standard Travel and Velocity Conversion Rates',
      headers: ['Measurement', 'km/h', 'mph', 'Knots', 'm/s'],
      rows: [
        ['Walking Pace', '5.0 km/h', '3.1 mph', '2.7 knots', '1.39 m/s'],
        ['City Speed Limit', '50.0 km/h', '31.1 mph', '27.0 knots', '13.89 m/s'],
        ['Highway Speed Limit', '100.0 km/h', '62.1 mph', '54.0 knots', '27.78 m/s'],
        ['High-Speed Train', '300.0 km/h', '186.4 mph', '162.0 knots', '83.33 m/s'],
        ['Speed of Sound (Mach 1)', '1,234.8 km/h', '767.3 mph', '666.7 knots', '343.0 m/s']
      ]
    },
    faqs: [
      { q: 'How do you convert km/h to mph?', a: 'Multiply the speed in km/h by 0.621371 (or divide by 1.609344) to find miles per hour: 100 km/h ≈ 62.14 mph.' },
      { q: 'What is a knot in speed?', a: 'One knot represents one international nautical mile per hour, which equals exactly 1.852 km/h or approximately 1.15078 mph.' }
    ]
  },
  {
    id: 'time',
    name: 'Time',
    title: 'Time Converter (seconds, minutes, hours, days) | Omega X',
    description: 'Free time converter. Convert between seconds, minutes, hours, days, weeks, months, years, and microseconds with calendar calculations.',
    aeoCapsule: 'Time conversion calculates duration based on the international SI base second (s), standardized by BIPM/SI via 9,192,631,770 transitions of the cesium-133 atom. 1 minute equals 60 seconds, 1 hour equals 3,600 seconds, and 1 standard calendar day equals 86,400 seconds (24 hours).',
    standards: 'Temporal ratios align with the BIPM International Atomic Time (TAI) and UTC definition of the SI second established by CGPM.',
    table: {
      caption: 'Standard Time Increments and Equivalencies',
      headers: ['Duration Unit', 'Seconds (s)', 'Minutes (min)', 'Hours (hr)'],
      rows: [
        ['1 Minute', '60 s', '1 min', '0.01667 hr'],
        ['1 Hour', '3,600 s', '60 min', '1 hr'],
        ['1 Day (24 hrs)', '86,400 s', '1,440 min', '24 hr'],
        ['1 Week (7 days)', '604,800 s', '10,080 min', '168 hr'],
        ['1 Year (365 days)', '31,536,000 s', '525,600 min', '8,760 hr']
      ]
    },
    faqs: [
      { q: 'How many seconds are in a day?', a: 'There are exactly 86,400 seconds in a standard 24-hour day (24 × 60 × 60).' },
      { q: 'How many hours are in a year?', a: 'A standard non-leap calendar year (365 days) has 8,760 hours. A leap year (366 days) has 8,784 hours.' }
    ]
  },
  {
    id: 'data',
    name: 'Digital Data',
    title: 'Digital Data & Byte Converter (KB, MB, GB, TB) | Omega X',
    description: 'Instant digital storage converter. Convert between bits, bytes, KB, MB, GB, TB, and binary IEC units (KiB, MiB, GiB, TiB).',
    aeoCapsule: 'Digital data storage and bandwidth conversion calculates binary memory and network throughput. Governed by IEC 80000-13 and IEEE 1541, 1 byte equals 8 bits. Decimal SI prefixes (1 KB = 1,000 bytes, 1 GB = 10⁹ bytes) represent drive storage, while binary IEC prefixes (1 KiB = 1,024 bytes, 1 GiB = 2³⁰ bytes) represent RAM memory.',
    standards: 'Digital storage factors strictly comply with IEC 80000-13 and IEEE 1541 standards, clearly separating decimal SI prefixes from binary IEC prefixes.',
    table: {
      caption: 'Decimal (SI) vs Binary (IEC) Data Storage Comparison',
      headers: ['Prefix', 'Decimal SI Size (Disk)', 'Binary IEC Size (RAM)', 'Difference %'],
      rows: [
        ['Kilobyte vs Kibibyte', '1 KB = 1,000 B', '1 KiB = 1,024 B', '+2.4%'],
        ['Megabyte vs Mebibyte', '1 MB = 1,000,000 B', '1 MiB = 1,048,576 B', '+4.86%'],
        ['Gigabyte vs Gibibyte', '1 GB = 10⁹ B', '1 GiB = 1,073,741,824 B', '+7.37%'],
        ['Terabyte vs Tebibyte', '1 TB = 10¹² B', '1 TiB = 1,099,511,627,776 B', '+9.95%']
      ]
    },
    faqs: [
      { q: 'What is the difference between a Gigabyte (GB) and a Gibibyte (GiB)?', a: 'A Gigabyte (GB) uses the decimal standard where 1 GB = 1,000,000,000 bytes (10⁹). A Gibibyte (GiB) uses the binary standard where 1 GiB = 1,073,741,824 bytes (2³⁰), which is roughly 7.37% larger.' },
      { q: 'How many Megabytes are in a Gigabyte?', a: 'In decimal SI notation (drive manufacturers), there are 1,000 Megabytes in a Gigabyte. In binary notation (OS RAM), there are 1,024 Megabytes in a Gigabyte.' }
    ]
  },
  {
    id: 'pressure',
    name: 'Pressure',
    title: 'Pressure Converter (psi, bar, kPa, atm, mmHg) | Omega X',
    description: 'Precision pressure conversion calculator. Convert psi, bar, kilopascals, atmospheres, and mmHg with IUPAC and NIST standard formulas.',
    aeoCapsule: 'Pressure conversion calculates applied force per unit surface area. The SI base unit is the Pascal (Pa, 1 N/m²). Standard atmospheric pressure (1 atm) is internationally codified by IUPAC as exactly 101,325 Pa (101.325 kPa), equivalent to 1.01325 bar or approx. 14.6959 psi (lbf/in²).',
    standards: 'Pressure equivalents comply with IUPAC standard conditions and NIST Special Publication 811 using standard gravity g₀ = 9.80665 m/s².',
    table: {
      caption: 'Standard Pressure Unit Equivalencies',
      headers: ['Atmospheres (atm)', 'Bar', 'Kilopascals (kPa)', 'PSI (lbf/in²)'],
      rows: [
        ['0.0680 atm', '0.06895 bar', '6.8948 kPa', '1.0 psi'],
        ['0.9869 atm', '1.0000 bar', '100.00 kPa', '14.5038 psi'],
        ['1.0000 atm', '1.01325 bar', '101.325 kPa', '14.6959 psi'],
        ['2.0000 atm', '2.0265 bar', '202.65 kPa', '29.3919 psi'],
        ['10.000 atm', '10.1325 bar', '1,013.25 kPa', '146.959 psi']
      ]
    },
    faqs: [
      { q: 'How many PSI are in 1 bar?', a: 'One bar equals approximately 14.50377 PSI (pounds per square inch).' },
      { q: 'What is standard atmospheric pressure in kPa and psi?', a: 'Standard sea-level atmospheric pressure (1 atm) is defined as exactly 101.325 kPa, which equals approximately 14.6959 psi.' }
    ]
  },
  {
    id: 'energy',
    name: 'Energy',
    title: 'Energy Converter (Joules, Calories, kWh, BTU) | Omega X',
    description: 'Online energy converter. Convert between Joules, kilojoules, dietary calories, kilowatt-hours, and British Thermal Units (BTU).',
    aeoCapsule: 'Energy and work conversion calculates the capacity to perform mechanical, thermal, or electrical work. The SI unit is the Joule (J, 1 N·m). 1 kilojoule (kJ) equals 1,000 Joules, 1 dietary Calorie (kcal) equals 4,184 Joules, 1 British Thermal Unit (BTU) equals approx. 1,055.06 Joules, and 1 kilowatt-hour (kWh) equals 3,600,000 Joules.',
    standards: 'Energy conversion factors adhere to IUPAP and NIST SP 811 standard tables for thermochemical and mechanical work.',
    table: {
      caption: 'Energy and Work Conversion Matrix',
      headers: ['Energy Unit', 'Joules (J)', 'Kilowatt-Hours (kWh)', 'Calories (kcal)'],
      rows: [
        ['1 Joule (J)', '1 J', '2.7778 × 10⁻⁷ kWh', '0.000239 kcal'],
        ['1 Kilojoule (kJ)', '1,000 J', '0.000278 kWh', '0.239006 kcal'],
        ['1 Dietary Calorie (kcal)', '4,184 J', '0.001162 kWh', '1.0 kcal'],
        ['1 BTU', '1,055.06 J', '0.000293 kWh', '0.252164 kcal'],
        ['1 Kilowatt-Hour (kWh)', '3,600,000 J', '1.0 kWh', '860.421 kcal']
      ]
    },
    faqs: [
      { q: 'How many Joules are in a dietary calorie?', a: 'One nutritional Calorie (large calorie or kcal) equals exactly 4,184 Joules (4.184 kilojoules).' },
      { q: 'How many kWh are in 1 million Joules?', a: '1,000,000 Joules (1 Megajoule) equals approximately 0.2778 kilowatt-hours (kWh).' }
    ]
  }
]

function generateRouteHtml(catConfig) {
  let html = baseHtml
  const pageUrl = `https://numanx-studio-omega-converter.netlify.app/convert/${catConfig.id}`

  // 1. Replace <title>
  html = html.replace(/<title.*?>.*?<\/title>/i, `<title data-rh="true">${catConfig.title}</title>`)

  // 2. Replace existing canonical link
  html = html.replace(/<link[^>]*rel=["']canonical["'][^>]*\/?>/i, `<link rel="canonical" data-rh="true" href="${pageUrl}" />`)

  // 3. Replace existing meta description
  html = html.replace(/<meta[^>]*name=["']description["'][^>]*\/?>/i, `<meta name="description" data-rh="true" content="${catConfig.description}" />`)

  // 4. Replace OpenGraph tags
  html = html.replace(/<meta[^>]*property=["']og:title["'][^>]*\/?>/i, `<meta property="og:title" content="${catConfig.title}" />`)
  html = html.replace(/<meta[^>]*property=["']og:description["'][^>]*\/?>/i, `<meta property="og:description" content="${catConfig.description}" />`)
  html = html.replace(/<meta[^>]*property=["']og:url["'][^>]*\/?>/i, `<meta property="og:url" content="${pageUrl}" />`)

  // 5. Construct comprehensive JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `${pageUrl}#software`,
        name: `Omega ${catConfig.name} Converter`,
        url: pageUrl,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'All',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      },
      {
        '@type': 'Dataset',
        '@id': `${pageUrl}#dataset`,
        name: `${catConfig.name} Conversion Matrix & Metrology Standards`,
        description: catConfig.description,
        license: 'https://creativecommons.org/licenses/by/4.0/',
        isAccessibleForFree: true
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://numanx-studio-omega-converter.netlify.app/' },
          { '@type': 'ListItem', position: 2, name: 'Categories', item: 'https://numanx-studio-omega-converter.netlify.app/categories' },
          { '@type': 'ListItem', position: 3, name: catConfig.name, item: pageUrl }
        ]
      },
      {
        '@type': 'HowTo',
        '@id': `${pageUrl}#howto`,
        name: `How to Convert ${catConfig.name} Units`,
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Enter measurement value',
            text: 'Type your numerical or fractional value in the input field.'
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Read standardized conversion',
            text: 'The converted value updates instantly based on official NIST and BIPM SI conversion ratios.'
          }
        ]
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: catConfig.faqs.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a }
        }))
      }
    ]
  }

  // Inject JSON-LD before </head>
  const headInjection = `  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n  </head>`
  html = html.replace('</head>', headInjection)

  // Construct crawlable static fallback HTML inside <div id="root">
  const staticHtml = `
    <main class="max-w-5xl mx-auto p-6 space-y-6">
      <nav aria-label="Breadcrumb" style="font-size:12px;color:#888;">
        <a href="/">Home</a> / <a href="/categories">Categories</a> / <strong>${catConfig.name}</strong>
      </nav>
      <header>
        <h1>${catConfig.name} Precision Converter</h1>
        <p><strong>${catConfig.name} conversion</strong>: ${catConfig.aeoCapsule}</p>
      </header>

      <section>
        <h2>Metrological Authority & Standards Compliance</h2>
        <p>${catConfig.standards}</p>
      </section>

      <section>
        <h2>${catConfig.table.caption}</h2>
        <table border="1" cellpadding="6" style="border-collapse:collapse;width:100%;text-align:left;">
          <caption>${catConfig.table.caption}</caption>
          <thead>
            <tr>
              ${catConfig.table.headers.map(h => `<th scope="col">${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${catConfig.table.rows.map(row => `
              <tr>
                <th scope="row">${row[0]}</th>
                ${row.slice(1).map(c => `<td>${c}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Frequently Asked Questions</h2>
        ${catConfig.faqs.map(f => `
          <div style="margin-bottom:12px;">
            <h3>${f.q}</h3>
            <p>${f.a}</p>
          </div>
        `).join('')}
      </section>
    </main>
  `

  html = html.replace(
    /<div id="root">\s*<\/div>/i,
    `<div id="root">\n${staticHtml}\n    </div>`
  )

  const targetDir = path.join(distDir, 'convert', catConfig.id)
  fs.mkdirSync(targetDir, { recursive: true })
  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf-8')
  console.log(`✅ Pre-rendered static SEO/AEO HTML for /convert/${catConfig.id}`)
}

// Generate static pre-rendered routes for all flagship categories
for (const config of categoryConfigs) {
  generateRouteHtml(config)
}

// Pre-render /about
const aboutDir = path.join(distDir, 'about')
fs.mkdirSync(aboutDir, { recursive: true })
let aboutHtml = baseHtml
  .replace(/<title[^>]*>.*?<\/title>/i, '<title>About NumanX Omega — Universal Unit Conversion Platform</title>')
  .replace(/<meta name="description"[^>]*content=".*?"[^>]*>/i, '<meta name="description" content="Learn about NumanX Omega: 100% client-side privacy, NIST SP 811 metrology standards, offline PWA support, and sub-nanometer scientific calculation engine.">')
  .replace(/<link rel="canonical"[^>]*href=".*?"[^>]*>/i, '<link rel="canonical" href="https://numanx-studio-omega-converter.netlify.app/about">')

const aboutStatic = `
  <main style="max-width:800px;margin:40px auto;padding:0 20px;font-family:sans-serif;">
    <nav><a href="/">Home</a> &gt; <span>About</span></nav>
    <h1>About NumanX Omega</h1>
    <p>NumanX Omega is an open, high-precision, zero-latency unit conversion and calculation engine built for engineers, researchers, students, and everyday power users.</p>
    <h2>Core Pillars</h2>
    <ul>
      <li><strong>100% Client-Side Privacy:</strong> All calculations run directly in your browser without telemetry or tracking.</li>
      <li><strong>NIST & BIPM Standards:</strong> Rigorously calibrated against NIST Special Publication 811 and BIPM SI definitions.</li>
      <li><strong>Sub-Nanometer Precision:</strong> 14 significant digits floating point engine.</li>
      <li><strong>Offline PWA:</strong> Fully functioning progressive web app.</li>
    </ul>
  </main>
`
aboutHtml = aboutHtml.replace(/<div id="root">\s*<\/div>/i, `<div id="root">\n${aboutStatic}\n    </div>`)
fs.writeFileSync(path.join(aboutDir, 'index.html'), aboutHtml, 'utf-8')
console.log('✅ Pre-rendered static SEO/AEO HTML for /about')

// Pre-render /blog
const blogDir = path.join(distDir, 'blog')
fs.mkdirSync(blogDir, { recursive: true })
let blogHtml = baseHtml
  .replace(/<title[^>]*>.*?<\/title>/i, '<title>Blog — Unit Conversion Guides, Metrology & Precision Tips | NumanX</title>')
  .replace(/<meta name="description"[^>]*content=".*?"[^>]*>/i, '<meta name="description" content="Comprehensive guides, tutorials, formulas, and cheat sheets for length, weight, temperature, data, and precision conversions by NumanX.">')
  .replace(/<link rel="canonical"[^>]*href=".*?"[^>]*>/i, '<link rel="canonical" href="https://numanx-studio-omega-converter.netlify.app/blog">')

const blogStatic = `
  <main style="max-width:800px;margin:40px auto;padding:0 20px;font-family:sans-serif;">
    <nav><a href="/">Home</a> &gt; <span>Blog</span></nav>
    <h1>Blog</h1>
    <p>Tips, guides, and tutorials for working with measurements, conversions, and calculations.</p>
    <ul>
      <li><a href="/blog/compound-length-units-guide">How to Convert Compound Units: Feet, Inches & Fractions Guide</a></li>
      <li><a href="/blog/fractional-inches-to-mm-best-practices">Fractional Inches to Millimeters: Machinist & Woodworking Best Practices</a></li>
      <li><a href="/blog/metric-vs-imperial-engineering-guide">Metric vs Imperial: The Ultimate Engineering & Scientific Comparison</a></li>
      <li><a href="/blog/temperature-scales-celsius-fahrenheit-kelvin">Temperature Scales Demystified: Celsius, Fahrenheit, and Kelvin</a></li>
      <li><a href="/blog/digital-data-storage-units-guide">Digital Data Units: Megabytes, Mebibytes, and Transfer Speeds</a></li>
      <li><a href="/blog/ai-powered-unit-conversions-in-2026">AI-Powered Unit Conversions in 2026: Natural Language Calculations</a></li>
    </ul>
  </main>
`
blogHtml = blogHtml.replace(/<div id="root">\s*<\/div>/i, `<div id="root">\n${blogStatic}\n    </div>`)
fs.writeFileSync(path.join(blogDir, 'index.html'), blogHtml, 'utf-8')
console.log('✅ Pre-rendered static SEO/AEO HTML for /blog')
