/**
 * scripts/generate-llms-full.ts
 * Generates public/llms-full.txt from authoritative TypeScript application definitions
 */

import fs from 'node:fs'
import path from 'node:path'
import { Categories } from '../src/engine/categories'
import { categoryContent } from '../src/engine/categoryContent'
import { guideContent } from '../src/engine/guideContent'
import { BLOG_POSTS } from '../src/data/blogPosts'
import { canonicalUrl, DEFAULT_SITE_URL } from '../src/config/site'
import { getPairEditorial, findUnit } from '../src/config/pairEditorial'

// Count canonical URLs from the sitemap generated earlier in the build
const sitemapXml = fs.readFileSync(path.resolve(process.cwd(), 'public/sitemap.xml'), 'utf-8')
const canonicalUrlCount = (sitemapXml.match(/<loc>/g) || []).length

export function generateLlmsFullText(): string {
  const sections: string[] = []

  sections.push(`# Omega X Converter — Comprehensive Agent & LLM Knowledge Base

> Complete architectural, metrological, and routing reference for Omega X Converter, published by NumanX Studio.

- Canonical Origin: ${DEFAULT_SITE_URL}/
- Publisher: NumanX Studio
- License: Creative Commons Attribution 4.0 International (CC BY 4.0)
- Canonical XML Sitemap: ${DEFAULT_SITE_URL}/sitemap.xml
- Concise Agent Guide: ${DEFAULT_SITE_URL}/llms.txt
- Total Canonical Indexable Inventory: ${canonicalUrlCount} URLs
`)

  sections.push(`## 1. System Architecture & Metrology Standards

Omega X Converter is a client-side progressive web application (PWA) built with TypeScript, React 19, and Vite. The conversion engine evaluates conversions deterministically in the user's browser using floating-point and affine transformations based on authoritative international standards.

### Standards Grounding & Institutional Provenance
- **BIPM (Bureau International des Poids et Mesures):** SI Brochure (9th Edition, 2019) defining the redefinition of base SI units in terms of invariant fundamental physical constants.
- **NIST (National Institute of Standards and Technology):** Special Publication 811 (Guide for the Use of the International System of Units) and SP 1038 for international conversion exact factors (e.g., 1 inch = 0.0254 m exactly; 1 avoirdupois pound = 0.45359237 kg exactly).
- **ISO/IEC 80000:** International Quantities and Units standards (Parts 1–14), specifically standardizing binary prefix definitions (KiB = 1024 B, MiB = 1024 KiB) vs metric decimal prefixes (KB = 1000 B, MB = 1000 KB).
- **CODATA (Committee on Data for Science and Technology):** 2022 internationally recommended values of fundamental physical constants.
- **WMO (World Meteorological Organization):** Guide to Meteorological Instruments and Methods of Observation for temperature scale representations.

*Institutional Disclaimer:* Institutional citations establish factual source provenance for measurement definitions only. The BIPM, NIST, ISO, IEC, CODATA, and WMO do not endorse, sponsor, or certify Omega X Converter.
`)

  sections.push(`## 2. Core Public Application Pages (11 URLs)

All primary interactive features are accessed via deterministic canonical URLs:

- **Home Workspace:** ${canonicalUrl('/')}
  Multi-unit interactive workspace with real-time conversion, history drawer, and category search.
- **Universal Converter:** ${canonicalUrl('/converter')}
  Unified converter interface with category dropdown, unit selectors, swap function, and dynamic formula display.
- **Categories Directory:** ${canonicalUrl('/categories')}
  Full catalog of all 24 supported conversion categories with unit counts and measurement dimensions.
- **Formula Explorer:** ${canonicalUrl('/formulas')}
  Interactive directory of algebraic conversion formulas, dimensional scale factors, and mathematical definitions.
- **Scientific Calculator:** ${canonicalUrl('/calculator')}
  Client-side mathematical calculator with standard arithmetic, trigonometry, powers, and logs.
- **Health Metrics:** ${canonicalUrl('/health')}
  Body Mass Index (BMI), Basal Metabolic Rate (BMR), and daily energy requirement calculators.
- **Educational Blog:** ${canonicalUrl('/blog')}
  Engineering, metrology, and unit history articles written by NumanX Studio editorial teams.
- **About & Standards:** ${canonicalUrl('/about')}
  Editorial governance, source citations, privacy statement, and conversion engine architecture.
- **XML Sitemap:** ${canonicalUrl('/sitemap')}
  Human-navigable sitemap page mirroring the authoritative machine-readable XML sitemap.
- **Contact:** ${canonicalUrl('/contact')}
  How to report a wrong conversion, a security issue or a privacy question.
- **Privacy Policy:** ${canonicalUrl('/privacy')}
  No accounts, ads, cookies or analytics; history and settings stay in the browser's local storage.
- **Terms of Use:** ${canonicalUrl('/terms')}
  Accuracy, third-party price data, health calculator limits, acceptable use and CC BY 4.0 content licensing.
`)

  sections.push(`## 3. Supported Measurement Categories (24 Categories)

Omega X Converter provides complete unit coverage across 24 distinct physical and financial domains:
`)

  for (const cat of Categories) {
    const url = canonicalUrl(`/convert/${cat.id}`)
    const unitList = cat.un.map(u => `${u.lb} (${u.id})`).join(', ')
    const baseUnit = cat.un.find(u => u.r === 1)?.lb || cat.un[0]?.lb || 'Base unit'
    sections.push(`### ${cat.lb} (\`${cat.id}\`)
- **Canonical URL:** ${url}
- **Base Reference Unit:** ${baseUnit}
- **Registered Units (${cat.un.length}):** ${unitList}
- **Description:** Deterministic measurement conversions for ${cat.lb.toLowerCase()}.
`)
  }

  sections.push(`## 4. Curated Popular Conversion Pairs (99 Canonical Pairs)

Each curated pair page provides route-specific editorial commentary, exact conversion formulas, step-by-step arithmetic examples, and reciprocal pair navigation:
`)

  let pairCount = 0
  for (const cat of Categories) {
    const content = categoryContent[cat.id]
    if (content?.popularPairs) {
      for (const pair of content.popularPairs) {
        pairCount++
        const cleanSlug = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        const fromSlug = cleanSlug(pair.from)
        const toSlug = cleanSlug(pair.to)
        const pairParam = `${fromSlug}-to-${toSlug}`
        const url = canonicalUrl(`/convert/${cat.id}/${pairParam}`)
        const u1 = findUnit(cat, pair.from)
        const u2 = findUnit(cat, pair.to)
        let formula = `Multiply ${pair.from} by conversion factor to obtain ${pair.to}.`
        if (u1 && u2) {
          const editorial = getPairEditorial(cat, u1, u2, pairParam)
          if (editorial?.formula) {
            formula = editorial.formula
          }
        }

        sections.push(`${pairCount}. **${pair.from} to ${pair.to}** (\`${cat.id}\`)
   - URL: ${url}
   - Formula: ${formula}
`)
      }
    }
  }

  sections.push(`## 5. Educational Guides (6 Guides)

Comprehensive technical guides detailing unit origins, math shortcuts, and real-world applications:
`)

  for (const guide of Object.values(guideContent)) {
    if (guide.slug) {
      const url = canonicalUrl(`/guides/${guide.slug}`)
      sections.push(`### ${guide.title}
- **Canonical URL:** ${url}
- **Category:** ${guide.category}
- **Target Measurement System:** ${guide.metaDesc || guide.subtitle || 'Educational conversion guide.'}
`)
    }
  }

  sections.push(`## 6. Technical Blog Articles (6 Articles)

In-depth technical publications on dimensional metrology, machinist tolerances, and computational architecture:
`)

  for (const post of BLOG_POSTS) {
    if (post.slug) {
      const url = canonicalUrl(`/blog/${post.slug}`)
      sections.push(`### ${post.title}
- **Canonical URL:** ${url}
- **Date Published:** ${post.date}
- **Editorial Byline:** ${post.author} (NumanX Studio)
- **Category:** ${post.category} (${post.relatedCat})
- **Summary:** ${post.excerpt}
`)
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
`)

  return sections.join('\n')
}

export function generateLlmsSummaryText(): string {
  return `# Omega X Converter

> Universal unit conversion platform with 24 physical categories, deterministic conversion algorithms, offline PWA capabilities, and authoritative scientific standards alignment.

Omega X Converter is a client-side unit conversion web application developed and published by NumanX Studio. It provides exact, deterministic conversions across length, mass, temperature, area, volume, digital data, energy, pressure, speed, time, and other scientific and everyday measurement systems. All calculations execute locally in the user's browser with zero tracking, zero advertising cookies, and zero server-side telemetry.

Canonical Origin: ${DEFAULT_SITE_URL}/
Publisher: NumanX Studio
License: Creative Commons Attribution 4.0 International (CC BY 4.0)
XML Sitemap: ${DEFAULT_SITE_URL}/sitemap.xml
Full Agent Documentation: ${DEFAULT_SITE_URL}/llms-full.txt

## Primary Public Resources

- [Home](${canonicalUrl('/')}): Main interactive universal conversion workspace with multi-category search, unit selection, and real-time computation.
- [Universal Converter](${canonicalUrl('/converter')}): Dedicated conversion tool interface supporting all 24 measurement categories.
- [Categories Directory](${canonicalUrl('/categories')}): Complete index of all 24 conversion categories with unit counts and reference standards.
- [Formula Explorer](${canonicalUrl('/formulas')}): Mathematical conversion formulas, dimensional constants, and algebraic transformation rules.
- [Scientific Calculator](${canonicalUrl('/calculator')}): Standard and scientific arithmetic calculator with trigonometric, logarithmic, and power functions.
- [Health & Fitness Metrics](${canonicalUrl('/health')}): Body mass index (BMI), basal metabolic rate (BMR), and daily energy expenditure calculators.
- [Educational Blog](${canonicalUrl('/blog')}): Technical articles on metrology, fractional machinist units, historical systems, and data prefixes.
- [About & Standards Methodology](${canonicalUrl('/about')}): Overview of conversion engine architecture, institutional standards citations (NIST, BIPM, ISO, CODATA), and project governance.
- [HTML Sitemap](${canonicalUrl('/sitemap')}): Authoritative index of every canonical public page.
- [Contact](${canonicalUrl('/contact')}): How to report a wrong conversion, a security issue or a privacy question.
- [Privacy Policy](${canonicalUrl('/privacy')}): No accounts, ads, cookies or analytics; history and settings stay in the browser.
- [Terms of Use](${canonicalUrl('/terms')}): Accuracy, third-party price data, health calculator limits and content licensing.

## Category Landings

- [Length](${canonicalUrl('/convert/length')}): Meters, feet, inches, centimeters, kilometers, miles, yards, millimeters, nautical miles, micrometers, nanometers.
- [Area](${canonicalUrl('/convert/area')}): Square meters, square feet, acres, hectares, square kilometers, square miles.
- [Volume](${canonicalUrl('/convert/volume')}): Liters, milliliters, gallons, cubic meters, cubic feet, fluid ounces, cups.
- [Mass & Weight](${canonicalUrl('/convert/mass')}): Kilograms, grams, pounds, ounces, metric tons, milligrams, stones, carats.
- [Temperature](${canonicalUrl('/convert/temp')}): Celsius, Fahrenheit, Kelvin, Rankine with exact affine zero-offset formulas.
- [Time](${canonicalUrl('/convert/time')}): Seconds, minutes, hours, days, weeks, months, years, milliseconds, microseconds.
- [Speed](${canonicalUrl('/convert/speed')}): Meters per second, kilometers per hour, miles per hour, knots, feet per second.
- [Acceleration](${canonicalUrl('/convert/acceleration')}): Meters per second squared, standard gravity (g), feet per second squared, gal.
- [Force](${canonicalUrl('/convert/force')}): Newtons, kilonewtons, pound-force, dyne, kilogram-force.
- [Pressure](${canonicalUrl('/convert/pressure')}): Pascals, bars, PSI, atmospheres, millimeters of mercury, kilopascals.
- [Energy](${canonicalUrl('/convert/energy')}): Joules, calories, kilowatt-hours, British thermal units (BTU), electronvolts.
- [Power](${canonicalUrl('/convert/power')}): Watts, kilowatts, horsepower, megawatts, gigawatts.
- [Electricity & Current](${canonicalUrl('/convert/electricity')}): Amperes, milliamperes, kiloamperes, microamperes, coulombs, volts, ohms, farads.
- [Magnetism](${canonicalUrl('/convert/magnetism')}): Tesla, gauss, weber, maxwell.
- [Frequency](${canonicalUrl('/convert/frequency')}): Hertz, kilohertz, megahertz, gigahertz, revolutions per minute.
- [Digital Storage](${canonicalUrl('/convert/data')}): Bytes, kilobytes, megabytes, gigabytes, terabytes, kibibytes, mebibytes, gibibytes (decimal vs binary prefixes).
- [Data Transfer Rate](${canonicalUrl('/convert/datatransfer')}): Bits per second, megabits per second, gigabits per second, megabytes per second.
- [Angle](${canonicalUrl('/convert/angle')}): Degrees, radians, gradians, arcminutes, arcseconds.
- [Torque](${canonicalUrl('/convert/torque')}): Newton-meters, pound-feet, pound-inches.
- [Fuel Economy](${canonicalUrl('/convert/fuel')}): Miles per gallon (US), liters per 100 km, kilometers per liter.
- [Density](${canonicalUrl('/convert/density')}): Kilograms per cubic meter, grams per cubic centimeter, pounds per cubic foot.
- [Cooking](${canonicalUrl('/convert/cooking')}): Cups, tablespoons, teaspoons, fluid ounces, milliliters, grams (ingredient-aware).
- [Textile & Yarn Count](${canonicalUrl('/convert/textile')}): Tex, denier, cotton count (Ne), worsted count, metric count (Nm).
- [Astronomy](${canonicalUrl('/convert/astronomy')}): Astronomical units (au), light-years, parsecs, kilometers, miles.

## Educational Guides

- [Meters to Feet Conversion Guide](${canonicalUrl('/guides/meters-to-feet')}): Detailed conversion methodology, practical height and construction examples, and historical background.
- [Feet to Meters Conversion Guide](${canonicalUrl('/guides/feet-to-meters')}): Reverse length conversion reference from international feet to SI meters.
- [Celsius to Fahrenheit Conversion Guide](${canonicalUrl('/guides/celsius-to-fahrenheit')}): Exact affine formula breakdown, mental math shortcuts, and meteorological references.
- [Fahrenheit to Celsius Conversion Guide](${canonicalUrl('/guides/fahrenheit-to-celsius')}): Reverse thermal conversion reference with exact 5/9 interval ratios.
- [Kilograms to Pounds Conversion Guide](${canonicalUrl('/guides/kg-to-lbs')}): Mass conversion standard (NIST / international avoirdupois pound) with conversion tables.
- [Pounds to Kilograms Conversion Guide](${canonicalUrl('/guides/lbs-to-kg')}): Standard mass conversion reference from avoirdupois pounds to SI kilograms.

## Technical Articles

- [Compound Length Units in Construction](${canonicalUrl('/blog/compound-length-units-guide')}): Working with feet-and-inches, architectural notation, and precision tolerances.
- [Fractional Inches to Millimeters](${canonicalUrl('/blog/fractional-inches-to-mm-best-practices')}): Reference chart and tolerance best practices for machinists and engineers.
- [Metric vs Imperial Engineering Standards](${canonicalUrl('/blog/metric-vs-imperial-engineering-guide')}): Analysis of global dual-unit documentation in aerospace, automotive, and civil engineering.
- [Thermodynamic Temperature Scales](${canonicalUrl('/blog/temperature-scales-celsius-fahrenheit-kelvin')}): Deep dive into absolute zero, Boltzmann's constant, and ITS-90 temperature standards.
- [Digital Storage Measurement](${canonicalUrl('/blog/digital-data-storage-units-guide')}): Hardware disk capacity versus operating system reported file sizes.
- [AI-Assisted Conversion Architecture](${canonicalUrl('/blog/ai-powered-unit-conversions-in-2026')}): Local client regex and natural-language pattern matching for rapid unit extraction without remote data transmission.

## Machine Usage & Agent Guidelines

- Nature of this File: \`llms.txt\` is an emerging community convention and proposal for providing concise, LLM-oriented site documentation. It is not a formal web standard and carries no guarantee of crawler ingestion, AI discovery, ranking benefit, or model citation.
- URL Structure: All public routes follow deterministic paths: \`/convert/{category}\` for category landings and \`/convert/{category}/{from}-to-{to}\` for unit pairs.
- Scientific Grounding: Conversion factors follow the BIPM SI Brochure (9th Edition) and NIST Special Publication 811.
- No Commercial Endorsement: Institutional references (NIST, BIPM, ISO, IEC, CODATA, WMO) represent scientific source provenance only and do not imply institutional endorsement.
- Privacy & State: The application runs entirely on the client. Routes such as \`/history\`, \`/favorites\`, \`/settings\`, \`/custom-units\`, \`/help\`, and \`/dashboard\` rely on browser LocalStorage, are tagged noindex, and are not public indexable URLs.
`
}

export function run() {
  const content = generateLlmsFullText()
  const summary = generateLlmsSummaryText()
  const cwd = process.cwd()

  fs.writeFileSync(path.resolve(cwd, 'public/llms-full.txt'), content, 'utf-8')
  fs.writeFileSync(path.resolve(cwd, 'public/llms.txt'), summary, 'utf-8')
  console.log('✅ Generated public/llms-full.txt and public/llms.txt successfully.')

  const distDir = path.resolve(cwd, 'dist')
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.resolve(distDir, 'llms-full.txt'), content, 'utf-8')
    fs.writeFileSync(path.resolve(distDir, 'llms.txt'), summary, 'utf-8')
    console.log('✅ Generated dist/llms-full.txt and dist/llms.txt successfully.')
  }
}

// Auto-run if direct
run()
