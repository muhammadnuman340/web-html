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

// Route-specific SEO, Schema, and Static Crawler Payload for /convert/length
const lengthRouteConfig = {
  route: '/convert/length',
  title: 'Length Converter (Decimal & Fractional) — Instant NIST Chart | Omega',
  description:
    'Precision length converter with architectural fractions (1/64"), compound feet & inches, machinist socket tolerances, and NIST SP 811 tables.',
  canonical: 'https://numanx-omega.netlify.app/convert/length',
  jsonLd: {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': 'https://numanx-omega.netlify.app/convert/length#software',
        name: 'Omega Length & Precision Unit Converter',
        url: 'https://numanx-omega.netlify.app/convert/length',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'All',
        softwareVersion: '3.8.0',
        description: 'High-precision length converter supporting decimal, compound (ft+in), architectural fractions (1/64"), human height silhouettes, and NIST metrological standards.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        },
        featureList: [
          'NIST SP 811 certified linear factors',
          'Compound imperial parsing (e.g., 5 ft 10 in)',
          'Carpentry fraction conversion down to 1/64 inch',
          'Dual real-world landmark visual comparison scale',
          'Interactive virtual tape measure with millimeter and inch tick marks',
          'Machinist bolt-to-socket tolerance chart',
          'Offline PWA capability'
        ]
      },
      {
        '@type': 'Dataset',
        '@id': 'https://numanx-omega.netlify.app/convert/length#dataset',
        name: 'NIST SP 811 Linear & Fractional Conversion Reference Matrix',
        description: 'Standardized conversion factors across metric, imperial, machinist fractional, and astronomical length units.',
        license: 'https://creativecommons.org/licenses/by/4.0/',
        isAccessibleForFree: true,
        variableMeasured: [
          'Nanometer', 'Micrometer', 'Millimeter', 'Centimeter', 'Meter', 'Kilometer',
          'Inch', 'Foot', 'Yard', 'Mile', 'Nautical Mile', 'Light Year', 'Astronomical Unit'
        ],
        measurementTechnique: '1959 International Yard and Pound Agreement & NIST Special Publication 811'
      },
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://numanx-omega.netlify.app/convert/length#breadcrumb',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://numanx-omega.netlify.app/'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Categories',
            item: 'https://numanx-omega.netlify.app/categories'
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Length Precision Converter',
            item: 'https://numanx-omega.netlify.app/convert/length'
          }
        ]
      },
      {
        '@type': 'HowTo',
        '@id': 'https://numanx-omega.netlify.app/convert/length#howto',
        name: 'How to Convert Meters to Feet and Inches Manually',
        description: 'Step-by-step mathematical guide to convert metric meters into imperial feet and fractional inches.',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Multiply meters by 3.28084 to find total decimal feet',
            text: 'Take your length in meters and multiply by 3.2808399. For example, 1.75 m × 3.2808399 = 5.74147 feet.'
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Extract the whole feet',
            text: 'The integer before the decimal is your whole feet measurement (5 feet).'
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Convert the decimal remainder to inches',
            text: 'Multiply the remaining decimal by 12. For example, 0.74147 × 12 = 8.8976 inches.'
          },
          {
            '@type': 'HowToStep',
            position: 4,
            name: 'Round or convert to nearest fraction',
            text: 'Round to the nearest whole inch (9 inches, resulting in 5′ 9″) or multiply the fractional decimal by 16 to find the 1/16th inch (0.8976 × 16 ≈ 14/16″ = 7/8″, yielding 5′ 8-7/8″).'
          }
        ]
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://numanx-omega.netlify.app/convert/length#faq',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How do I convert meters to feet?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Multiply the length in meters by 3.2808399 to calculate decimal feet. For example, 10 meters × 3.2808399 = 32.81 feet. To convert into feet and inches, multiply the decimal remainder by 12.'
            }
          },
          {
            '@type': 'Question',
            name: 'How many inches are in a centimeter?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'One centimeter equals exactly 0.393700787 inches. Conversely, one inch is internationally defined as exactly 2.54 centimeters (25.4 millimeters).'
            }
          },
          {
            '@type': 'Question',
            name: 'What is the difference between an international foot and a US survey foot?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'An international foot is defined as exactly 0.3048 meters. The historic US survey foot equals 1200/3937 meters (approx. 0.30480061 meters). NIST officially deprecated the US survey foot on January 1, 2023, standardizing all US mapping on the international foot.'
            }
          }
        ]
      }
    ]
  },
  // Injected inside <div id="root"> so AI bots (GPTBot, Perplexity, Bing) read it immediately,
  // and React seamlessly replaces it upon client hydration!
  staticSeoFallbackHtml: `
    <main class="max-w-5xl mx-auto p-6 space-y-6">
      <nav aria-label="Breadcrumb" style="font-size:12px;color:#888;">
        <a href="/">Home</a> / <a href="/categories">Categories</a> / <strong>Length</strong>
      </nav>
      <header>
        <h1>Length Precision Converter & Architectural Scale</h1>
        <p><strong>Length conversion</strong> calculates equivalent distance across metric, imperial, and astronomical systems using fixed international standards. Defined by the <strong>1959 International Yard Agreement</strong> and <strong>NIST SP 811</strong>, <strong>1 inch equals exactly 25.4 millimeters (2.54 cm)</strong>, and <strong>1 meter equals approximately 3.2808399 feet</strong>.</p>
      </header>

      <section>
        <h2>Metrological Authority & Standards Compliance</h2>
        <p>All linear conversion factors on this platform strictly comply with <strong>NIST Special Publication 811</strong> (Guide for the Use of the International System of Units), the <strong>BIPM SI Brochure (9th Edition)</strong>, and the <strong>1959 International Yard and Pound Agreement</strong> (codifying 1 yard = 0.9144 m and 1 inch = 25.4 mm). Astronomical distances are grounded in the <strong>International Astronomical Union (IAU 2012)</strong> resolution defining 1 AU = 149,597,870,700 m.</p>
      </section>

      <section>
        <h2>Metric to Imperial Length Reference Table (NIST SP 811)</h2>
        <table border="1" cellpadding="6" style="border-collapse:collapse;width:100%;text-align:left;">
          <caption>Standard Metric to Imperial Linear Equivalencies</caption>
          <thead>
            <tr>
              <th scope="col">Metric Unit</th>
              <th scope="col">Imperial Equivalent</th>
              <th scope="col">Exact Factor (Meters)</th>
            </tr>
          </thead>
          <tbody>
            <tr><th scope="row">1 Millimeter (mm)</th><td>0.0393701 Inches (approx 3/64″)</td><td>0.001 m</td></tr>
            <tr><th scope="row">1 Centimeter (cm)</th><td>0.3937008 Inches</td><td>0.01 m</td></tr>
            <tr><th scope="row">2.54 Centimeters</th><td>1.0000000 Inch (Exact)</td><td>0.0254 m</td></tr>
            <tr><th scope="row">30.48 Centimeters</th><td>1.0000000 Foot (12 Inches)</td><td>0.3048 m</td></tr>
            <tr><th scope="row">0.9144 Meters</th><td>1.0000000 Yard (3 Feet)</td><td>0.9144 m</td></tr>
            <tr><th scope="row">1 Meter (m)</th><td>3.2808399 Feet (3 ft 3-3/8 in)</td><td>1.0 m</td></tr>
            <tr><th scope="row">1 Kilometer (km)</th><td>0.6213712 Miles (3,280.84 Feet)</td><td>1000 m</td></tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Softwood Dimensional Lumber Sizing (Nominal vs. Actual)</h2>
        <table border="1" cellpadding="6" style="border-collapse:collapse;width:100%;text-align:left;">
          <caption>Nominal vs Actual Lumber Dimensions (Softwood S4S)</caption>
          <thead>
            <tr>
              <th scope="col">Nominal Name</th>
              <th scope="col">Actual Imperial</th>
              <th scope="col">Actual Metric (mm)</th>
              <th scope="col">Application</th>
            </tr>
          </thead>
          <tbody>
            <tr><th scope="row">1 × 4</th><td>3/4″ × 3-1/2″</td><td>19 mm × 89 mm</td><td>Trim, fascia, shelving</td></tr>
            <tr><th scope="row">2 × 4</th><td>1-1/2″ × 3-1/2″</td><td>38 mm × 89 mm</td><td>Interior/exterior framing</td></tr>
            <tr><th scope="row">2 × 6</th><td>1-1/2″ × 5-1/2″</td><td>38 mm × 140 mm</td><td>Floor joists, exterior walls</td></tr>
            <tr><th scope="row">2 × 8</th><td>1-1/2″ × 7-1/4″</td><td>38 mm × 184 mm</td><td>Headers, roof rafters</td></tr>
            <tr><th scope="row">4 × 4</th><td>3-1/2″ × 3-1/2″</td><td>89 mm × 89 mm</td><td>Deck posts, columns</td></tr>
          </tbody>
        </table>
      </section>
    </main>
  `
}

function generateRouteHtml(config) {
  let html = baseHtml

  // 1. Replace <title>
  html = html.replace(/<title>.*?<\/title>/i, `<title>${config.title}</title>`)

  // 2. Replace existing canonical link
  html = html.replace(/<link rel="canonical" href=".*?" \/>/i, `<link rel="canonical" href="${config.canonical}" />`)

  // 3. Replace existing meta description
  html = html.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${config.description}" />`)

  // 4. Replace OpenGraph tags
  html = html.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${config.title}" />`)
  html = html.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${config.description}" />`)
  html = html.replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${config.canonical}" />`)

  // 5. Inject JSON-LD before </head>
  const headInjection = `  <script type="application/ld+json">${JSON.stringify(config.jsonLd)}</script>\n  </head>`
  html = html.replace('</head>', headInjection)

  // 6. Inject static AEO/GEO HTML inside <div id="root"></div> for non-JS crawlers
  html = html.replace(
    /<div id="root">\s*<\/div>/i,
    `<div id="root">\n${config.staticSeoFallbackHtml}\n    </div>`
  )

  const targetDir = path.join(distDir, config.route)
  fs.mkdirSync(targetDir, { recursive: true })
  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf-8')
  console.log(`✅ Pre-rendered static SEO/AEO HTML for ${config.route}`)
}

generateRouteHtml(lengthRouteConfig)
