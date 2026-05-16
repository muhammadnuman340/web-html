export default function JSONLD() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Omega X Converter',
    description: 'Universal unit converter platform with 30+ categories, 200+ units, live currency, crypto, natural language input, and PWA offline support.',
    applicationCategory: 'Utilities',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: [
      '30+ unit categories',
      '200+ units',
      'Live currency rates',
      'Crypto prices',
      'Natural language input',
      'Batch conversion',
      'Cross-category chains',
      'Step-by-step explanations',
      'PWA offline support',
      'Custom unit creator',
    ],
    browserRequirements: 'Requires JavaScript. Supports Chrome, Firefox, Safari, Edge.',
    permissions: 'clipboard-read, clipboard-write',
    storage: { '@type': 'PropertyValue', name: 'localStorage, IndexedDB', value: 'User preferences and conversion history' },
  }

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  )
}
