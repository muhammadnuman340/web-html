export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  category: 'Guides' | 'Tutorials' | 'Tips' | 'Resources' | 'Productivity' | 'Engineering' | 'AI'
  date: string
  readTime: string
  author: string
  relatedCat: string
  coverIcon: string
  tags: string[]
  content: {
    intro: string
    keyTakeaways: string[]
    sections: {
      title: string
      body: string
      bulletPoints?: string[]
      formula?: string
      table?: { col1: string; col2: string; col3?: string }[]
    }[]
    faq: { q: string; a: string }[]
  }
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'compound-length-units-guide',
    title: 'How to Convert Compound Units: Feet, Inches & Fractions Guide',
    excerpt: 'Master compound measurement conversions like 5\' 10 1/2" into decimal inches, centimeters, or meters without rounding errors.',
    category: 'Guides',
    date: '2025-01-15',
    readTime: '5 min read',
    author: 'NumanX Metrology Team',
    relatedCat: 'length',
    coverIcon: '📏',
    tags: ['Length', 'Compound Units', 'Fractions', 'Engineering'],
    content: {
      intro: 'Compound units—such as 6 feet 2 inches or 5\' 7 3/8"—are standard across construction, architecture, and aerospace engineering in the United States. However, calculating them manually often introduces compounding rounding discrepancies. This comprehensive guide details the mathematical equations and automated parsing workflows to convert any compound measurement into pure decimal millimeters, centimeters, and meters.',
      keyTakeaways: [
        'Compound inputs combine whole feet, whole inches, and fractional inch remainders.',
        '1 foot exactly equals 12 inches, and 1 international inch equals exactly 25.4 millimeters.',
        'Always convert fractions to IEEE-754 64-bit floating point decimals before applying the base SI conversion factor (0.0254 m).'
      ],
      sections: [
        {
          title: 'The Compound Conversion Formula',
          body: 'To convert feet, inches, and fractions into meters or centimeters, first decompose the measurement into pure decimal inches:',
          formula: 'Total Inches = (Feet × 12) + Inches + (Numerator / Denominator)\nMeters = Total Inches × 0.0254',
          bulletPoints: [
            'Example: Convert 5 feet 10 1/2 inches to centimeters.',
            'Step 1: Decimal inches = (5 × 12) + 10 + 0.5 = 70.5 inches.',
            'Step 2: Centimeters = 70.5 × 2.54 = 179.07 cm.',
            'Step 3: Meters = 1.7907 m.'
          ]
        },
        {
          title: 'Common Architectural & Construction Quick Reference',
          body: 'Here is a quick verification table for common human heights and construction standards:',
          table: [
            { col1: 'Compound US Customary', col2: 'Decimal Inches', col3: 'Metric (cm / m)' },
            { col1: '5\' 6"', col2: '66.0 in', col3: '167.64 cm (1.68 m)' },
            { col1: '5\' 8"', col2: '68.0 in', col3: '172.72 cm (1.73 m)' },
            { col1: '5\' 10"', col2: '70.0 in', col3: '177.80 cm (1.78 m)' },
            { col1: '6\' 0"', col2: '72.0 in', col3: '182.88 cm (1.83 m)' },
            { col1: '6\' 2"', col2: '74.0 in', col3: '187.96 cm (1.88 m)' },
            { col1: '6\' 4"', col2: '76.0 in', col3: '193.04 cm (1.93 m)' }
          ]
        }
      ],
      faq: [
        { q: 'How does NumanX handle fractions like 3/16 or 1/32?', a: 'Our smart input parser decomposes the typed string into integer and rational fractions, evaluates the division in high-precision 64-bit floats, and maps it directly to NIST base meters.' },
        { q: 'Is 1 inch internationally defined as exactly 25.4 mm?', a: 'Yes. In 1959, the International Yard and Pound Agreement standardized 1 international inch to exactly 25.4 mm.' }
      ]
    }
  },
  {
    slug: 'fractional-inches-to-mm-best-practices',
    title: 'Fractional Inches to Millimeters: Machinist & Woodworking Best Practices',
    excerpt: 'Everything you need to know about converting fractional inch drill bits and timber stock to metric with tolerance thresholds.',
    category: 'Tutorials',
    date: '2025-01-10',
    readTime: '6 min read',
    author: 'Precision Machining Lab',
    relatedCat: 'length',
    coverIcon: '📐',
    tags: ['Machining', 'Fractions', 'Woodworking', 'Millimeters'],
    content: {
      intro: 'When manufacturing precision parts, transitioning between American fractional drill bits (1/64" through 1") and metric CNC tooling requires calculating both the nominal converted value and machinist tolerance errors. This tutorial covers fractional precision intervals down to 1/64" and how to minimize tooling deflection.',
      keyTakeaways: [
        'Machining standard fractions operate on binary divisions: 1/2, 1/4, 1/8, 1/16, 1/32, and 1/64.',
        '1/64" equals 0.015625 inches or exactly 0.396875 millimeters.',
        'CNC milling feedrates require true decimal or metric coordinates to avoid step cumulative positioning errors.'
      ],
      sections: [
        {
          title: 'Binary Fraction Conversion Steps',
          body: 'To compute the exact millimeter value of any fractional inch: divide the numerator by the denominator, then multiply by 25.4.',
          formula: 'mm = (Numerator / Denominator) × 25.4',
          table: [
            { col1: 'Fraction', col2: 'Decimal Inch', col3: 'Exact Millimeters' },
            { col1: '1/16"', col2: '0.0625"', col3: '1.5875 mm' },
            { col1: '1/8"', col2: '0.1250"', col3: '3.1750 mm' },
            { col1: '3/16"', col2: '0.1875"', col3: '4.7625 mm' },
            { col1: '1/4"', col2: '0.2500"', col3: '6.3500 mm' },
            { col1: '3/8"', col2: '0.3750"', col3: '9.5250 mm' },
            { col1: '1/2"', col2: '0.5000"', col3: '12.7000 mm' },
            { col1: '5/8"', col2: '0.6250"', col3: '15.8750 mm' },
            { col1: '3/4"', col2: '0.7500"', col3: '19.0500 mm' },
            { col1: '1"', col2: '1.0000"', col3: '25.4000 mm' }
          ]
        }
      ],
      faq: [
        { q: 'What is the closest metric size to 1/4 inch?', a: '1/4 inch is exactly 6.35 mm. The closest standard metric tool is 6 mm or 6.5 mm.' },
        { q: 'How does tolerance affect CNC machining?', a: 'Standard CNC tolerances are typically ±0.005" (±0.127 mm). High-precision aerospace tooling can require ±0.0002" (±0.005 mm).' }
      ]
    }
  },
  {
    slug: 'metric-vs-imperial-engineering-guide',
    title: 'Metric vs Imperial: The Ultimate Engineering & Scientific Comparison',
    excerpt: 'Explore the history, mathematical elegance, and costly historical failures that define the battle between SI and Customary units.',
    category: 'Engineering',
    date: '2025-05-01',
    readTime: '7 min read',
    author: 'Dr. Evelyn Vance',
    relatedCat: 'length',
    coverIcon: '⚖️',
    tags: ['Engineering', 'SI Units', 'Imperial', 'Science'],
    content: {
      intro: 'In 1999, NASA lost the $125-million Mars Climate Orbiter because one engineering team used metric Newtons while another calculated impulse in pound-seconds. Why does the dichotomy between SI metric and US Customary units persist, and how do modern engineering teams enforce dimensional safety?',
      keyTakeaways: [
        'The International System of Units (SI) is base-10 coherent, linking length, mass, and energy logically.',
        'US Customary units are legally defined based on metric constants (e.g. 1 yard = 0.9144 m).',
        'Modern aerospace and automotive engineering mandate automated dimensional validation in code pipelines.'
      ],
      sections: [
        {
          title: 'Base Units Comparison Matrix',
          body: 'SI uses coherent base units with decimal prefixes (kilo, mega, micro, nano). US Customary uses non-uniform multipliers (12, 3, 1760, 16):',
          table: [
            { col1: 'Dimension', col2: 'SI Metric Base', col3: 'US Customary Base' },
            { col1: 'Length', col2: 'Meter (m)', col3: 'Foot (ft) / Inch (in)' },
            { col1: 'Mass', col2: 'Kilogram (kg)', col3: 'Pound (lb)' },
            { col1: 'Temperature', col2: 'Kelvin (K) / Celsius (°C)', col3: 'Fahrenheit (°F)' },
            { col1: 'Force', col2: 'Newton (N = kg·m/s²)', col3: 'Pound-force (lbf)' },
            { col1: 'Pressure', col2: 'Pascal (Pa = N/m²)', col3: 'PSI (lbf/in²)' }
          ]
        }
      ],
      faq: [
        { q: 'Why did the US not adopt the metric system in the 1970s?', a: 'The Metric Conversion Act of 1975 made conversion voluntary rather than mandatory, and manufacturing retooling costs led widespread industry pushback.' },
        { q: 'Is UK Imperial the same as US Customary?', a: 'Length and weight are identical, but volume units differ significantly: a British Imperial gallon is 4.546 liters, while a US liquid gallon is 3.785 liters.' }
      ]
    }
  },
  {
    slug: 'temperature-scales-celsius-fahrenheit-kelvin',
    title: 'Temperature Scales Demystified: Celsius, Fahrenheit, and Kelvin',
    excerpt: 'Understand thermodynamic temperature scales, absolute zero, and how to convert temperatures effortlessly in your head.',
    category: 'Tips',
    date: '2025-05-10',
    readTime: '4 min read',
    author: 'NumanX Science Team',
    relatedCat: 'temp',
    coverIcon: '🌡️',
    tags: ['Temperature', 'Celsius', 'Fahrenheit', 'Kelvin'],
    content: {
      intro: 'Unlike linear units of length and mass, temperature scales feature offset zero points. Water freezes at 0°C, 32°F, and 273.15 K. Here is why the affine transformation formula requires subtraction before division and how to calculate quick mental estimates.',
      keyTakeaways: [
        'Celsius and Kelvin share the identical unit step size (1 K step = 1 °C step).',
        'Fahrenheit uses a 1.8x smaller degree increment: 100 °C spans 180 °F.',
        'Quick mental estimate for °C to °F: Double the Celsius number and add 30.'
      ],
      sections: [
        {
          title: 'The Core Conversion Formulas',
          body: 'Because the zero point of Fahrenheit is shifted by 32 degrees and scaled by 9/5 (1.8):',
          formula: '°F = (°C × 9/5) + 32\n°C = (°F - 32) × 5/9\nK = °C + 273.15',
          bulletPoints: [
            'Absolute zero: -273.15 °C = -459.67 °F = 0 K',
            'Water freezing: 0 °C = 32 °F = 273.15 K',
            'Human body temp: 37 °C = 98.6 °F = 310.15 K',
            'Water boiling: 100 °C = 212 °F = 373.15 K',
            'Intersection point: -40 °C is exactly equal to -40 °F!'
          ]
        }
      ],
      faq: [
        { q: 'At what temperature do Celsius and Fahrenheit match?', a: '-40 degrees. At -40°C, the temperature is also -40°F.' },
        { q: 'Can Kelvin be negative?', a: 'In classical thermodynamics, no. 0 Kelvin represents Absolute Zero, where molecular kinetic energy ceases.' }
      ]
    }
  },
  {
    slug: 'digital-data-storage-units-guide',
    title: 'Digital Data Units: Megabytes, Mebibytes, and Transfer Speeds',
    excerpt: 'Why your 1 TB hard drive only shows 931 GB in Windows: Decimal (1000) vs Binary (1024) prefixes explained.',
    category: 'Productivity',
    date: '2025-06-10',
    readTime: '6 min read',
    author: 'Alex Turner',
    relatedCat: 'data',
    coverIcon: '💾',
    tags: ['Data Storage', 'Mebibytes', 'Gigabytes', 'Networking'],
    content: {
      intro: 'Have you ever bought a brand-new 1 Terabyte SSD, plugged it into your PC, and felt cheated because Windows reported only 931 GB? You weren\'t scammed: drive manufacturers sell storage in decimal SI prefixes (powers of 1000), while operating systems calculate file structures in binary IEC prefixes (powers of 1024).',
      keyTakeaways: [
        'Decimal prefixes (KB, MB, GB, TB) scale by 10³ = 1,000.',
        'Binary prefixes (KiB, MiB, GiB, TiB) scale by 2¹⁰ = 1,024.',
        'Network download speeds are quoted in bits per second (Mbps), while files are measured in Bytes (MB/s). Divide Mbps by 8 to get real-world download speed.'
      ],
      sections: [
        {
          title: 'The Discrepancy Breakdown',
          body: 'A 1 TB hard drive manufactured according to SI standards has 1,000,000,000,000 bytes:',
          formula: '1 TB = 1,000,000,000,000 Bytes\nIn Windows (GiB) = 1,000,000,000,000 / (1024³) ≈ 931.32 GiB',
          table: [
            { col1: 'Drive Advertised (Decimal)', col2: 'Raw Bytes', col3: 'Windows Reported (Binary)' },
            { col1: '256 GB', col2: '256,000,000,000', col3: '238.4 GiB' },
            { col1: '512 GB', col2: '512,000,000,000', col3: '476.8 GiB' },
            { col1: '1 TB', col2: '1,000,000,000,000', col3: '931.3 GiB' },
            { col1: '2 TB', col2: '2,000,000,000,000', col3: '1,862.6 GiB' },
            { col1: '4 TB', col2: '4,000,000,000,000', col3: '3,725.3 GiB' }
          ]
        }
      ],
      faq: [
        { q: 'Why is internet speed measured in Megabits (Mbps)?', a: 'Telecom standards measure serialized physical bitstreams over cable or fiber. 8 bits equal 1 Byte. A 100 Mbps broadband connection transfers at most 12.5 MB/s of file data.' }
      ]
    }
  },
  {
    slug: 'ai-powered-unit-conversions-in-2026',
    title: 'AI-Powered Unit Conversions in 2026: Natural Language Calculations',
    excerpt: 'How modern neural parsers and LLM tool-calling engines translate ambiguous human prompts like "3 cups of milk in grams" into precise physical quantities.',
    category: 'AI',
    date: '2026-01-05',
    readTime: '7 min read',
    author: 'NumanX AI Research',
    relatedCat: 'cooking',
    coverIcon: '🤖',
    tags: ['AI', 'Natural Language', 'LLM', 'Future Tech'],
    content: {
      intro: 'Traditional calculators require structured dropdowns: pick Category, choose Unit A, pick Unit B. In 2026, AI-augmented utility platforms allow users to type or speak natural sentences like "How much is 2.5 gallons of olive oil in kilograms?" and dynamically infer fluid densities, substance profiles, and multi-step dimensional analysis.',
      keyTakeaways: [
        'Natural language input parsing strips linguistic noise and extracts numerical quantities, source units, target units, and substance identities.',
        'Converting volume to mass requires substance density (e.g. water = 1.0 g/cm³, olive oil = 0.92 g/cm³, honey = 1.42 g/cm³).',
        'Hybrid architectures run lightweight deterministic WebAssembly regex locally for sub-millisecond execution, falling back to LLMs only for semantic ambiguity.'
      ],
      sections: [
        {
          title: 'The Density Bridging Formula',
          body: 'To convert volume (cups, gallons, milliliters) into mass (grams, kilograms, pounds), you must multiply volume by the density of the specific substance:',
          formula: 'Mass = Volume × Density (ρ)\nExample: 1 cup (236.59 mL) of all-purpose flour (ρ = 0.53 g/mL) = 125.4 grams',
          table: [
            { col1: 'Substance', col2: 'Density (g/mL)', col3: 'Weight of 1 US Cup' },
            { col1: 'Water', col2: '1.000 g/mL', col3: '236.6 g (8.35 oz)' },
            { col1: 'Milk (whole)', col2: '1.030 g/mL', col3: '243.7 g (8.60 oz)' },
            { col1: 'All-Purpose Flour', col2: '0.528 g/mL', col3: '125.0 g (4.41 oz)' },
            { col1: 'Granulated Sugar', col2: '0.845 g/mL', col3: '200.0 g (7.05 oz)' },
            { col1: 'Olive Oil', col2: '0.918 g/mL', col3: '217.2 g (7.66 oz)' },
            { col1: 'Honey', col2: '1.420 g/mL', col3: '336.0 g (11.85 oz)' }
          ]
        }
      ],
      faq: [
        { q: 'Can NumanX parse natural language inputs today?', a: 'Yes! Use the AI tab or press ⌘K to open the Natural Language Command Bar and type queries like "50 miles in km" or "100 F in C".' }
      ]
    }
  }
]
