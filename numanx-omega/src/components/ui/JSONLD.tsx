import { SITE } from '../../config/site'

export default function JSONLD() {
  const siteUrl = SITE.url

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `${siteUrl}/#webapp`,
        name: 'Omega X Converter',
        url: `${siteUrl}/`,
        description: 'Free universal unit converter platform with 24 categories, 200+ units, live currency rates, crypto prices, natural language input, batch conversion, cross-category chains, and PWA offline support.',
        applicationCategory: 'Utilities',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: [
          '24 unit categories including length, mass, volume, temperature, currency, crypto',
          '200+ units from metric, imperial, and scientific systems',
          'Live currency rates for 40+ world currencies',
          'Real-time cryptocurrency prices via CoinGecko',
          'Natural language input: type "5 km in miles" or "(5m+20cm)×2"',
          'Batch conversion mode for 1000+ values at once',
          'Cross-category conversion chains: Energy→Cost, Speed→Distance, Fuel→Cost',
          'Step-by-step conversion explanations and learning content',
          'PWA support: installable, works fully offline',
          'Custom unit creator for user-defined conversions',
        ],
        browserRequirements: 'Requires JavaScript. Supports Chrome, Firefox, Safari, Edge.',
        permissions: 'clipboard-read, clipboard-write',
        storage: { '@type': 'PropertyValue', name: 'localStorage, IndexedDB', value: 'User preferences and conversion history' },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${siteUrl}/#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
          { '@type': 'ListItem', position: 2, name: 'Converter', item: `${siteUrl}/converter` },
          { '@type': 'ListItem', position: 3, name: 'Currency', item: `${siteUrl}/currency` },
          { '@type': 'ListItem', position: 4, name: 'Crypto', item: `${siteUrl}/crypto` },
          { '@type': 'ListItem', position: 5, name: 'Categories', item: `${siteUrl}/categories` },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${siteUrl}/#categories`,
        name: 'Unit Converter Categories',
        description: 'All 24 conversion categories available in Omega X Converter',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Length Converter' },
          { '@type': 'ListItem', position: 2, name: 'Area Converter' },
          { '@type': 'ListItem', position: 3, name: 'Volume Converter' },
          { '@type': 'ListItem', position: 4, name: 'Mass Converter' },
          { '@type': 'ListItem', position: 5, name: 'Temperature Converter' },
          { '@type': 'ListItem', position: 6, name: 'Speed Converter' },
          { '@type': 'ListItem', position: 7, name: 'Time Converter' },
          { '@type': 'ListItem', position: 8, name: 'Currency Converter' },
          { '@type': 'ListItem', position: 9, name: 'Crypto Converter' },
          { '@type': 'ListItem', position: 10, name: 'Energy Converter' },
          { '@type': 'ListItem', position: 11, name: 'Pressure Converter' },
          { '@type': 'ListItem', position: 12, name: 'Power Converter' },
          { '@type': 'ListItem', position: 13, name: 'Force Converter' },
          { '@type': 'ListItem', position: 14, name: 'Data Converter' },
          { '@type': 'ListItem', position: 15, name: 'Fuel Economy Converter' },
          { '@type': 'ListItem', position: 16, name: 'Angle Converter' },
          { '@type': 'ListItem', position: 17, name: 'Frequency Converter' },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${siteUrl}/#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is Omega X Converter?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Omega X Converter is a free universal unit converter platform supporting 24 categories including length, mass, volume, temperature, currency, crypto, and more. It features natural language input, batch conversion, cross-category chains, and works offline as a PWA.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is Omega X Converter free to use?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, Omega X Converter is completely free with no paywalls or premium tiers. All features including batch conversion, cross-category chains, and currency/crypto data are available to all users.',
            },
          },
          {
            '@type': 'Question',
            name: 'Does Omega X Converter work offline?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, Omega X Converter is a PWA (Progressive Web App) that can be installed on your device and works fully offline once loaded. All conversion calculations and cached currency rates are available without an internet connection.',
            },
          },
          {
            '@type': 'Question',
            name: 'What categories does Omega X Converter support?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Omega X Converter supports length, area, volume, mass, temperature, speed, time, currency (40+ live forex), cryptocurrency, energy, pressure, power, force, data storage, fuel economy, angle, frequency, torque, density, cooking, textile, and astronomy.',
            },
          },
          {
            '@type': 'Question',
            name: 'Does Omega X Converter support natural language input?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, you can type natural phrases like "convert 5 kilometers to miles", "5ft 3in to cm", "(5m + 20cm) × 2", or "150 lbs to kg". The smart parser automatically detects your intent and performs the conversion.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I convert multiple values at once?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, Omega X Converter includes a batch conversion mode that lets you convert 1000+ values at once. You can input comma-separated, newline-separated, or semicolon-separated values, and export results as CSV or JSON.',
            },
          },
        ],
      },
    ],
  }

  return (
    <script
      id="omega-global-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
