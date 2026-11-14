export const guideContent: Record<string, {
  title: string
  metaDesc: string
  h1: string
  slug: string
  intro: string
  formula: string
  table: { from: number; to: string; rounded: string }[]
  steps: string[]
  examples: string[]
  faq: { q: string; a: string }[]
  relatedGuides: { label: string; slug: string }[]
  relatedCat: string
}> = {
  'cups-to-grams': {
    title: 'Cups to Grams Converter — Volume to Weight Baking Guide',
    metaDesc: 'Convert cups to grams with density formula m = V × ρ. Free baking converter with flour, sugar, butter lookup table, step-by-step guide and kitchen FAQ.',
    h1: 'Cups to Grams Converter (cups → g)',
    slug: 'cups-to-grams',
    intro: 'Converting cups to grams is the single most common challenge in international baking. Unlike water where 1 mL equals 1 gram, dry ingredients like flour, sugar, and cocoa have vastly different bulk densities. A cup of all-purpose flour weighs approximately 125 grams, while a cup of granulated sugar weighs 200 grams. Professional pastry chefs always weigh dry ingredients on a digital scale to eliminate the 20% error inherent in measuring volume.',
    formula: 'g = cups × 236.588 × density (g/mL)',
    table: [
      { from: 0.25, to: '31.25 g (flour) / 50 g (sugar)', rounded: '31 g / 50 g' },
      { from: 0.33, to: '41.25 g (flour) / 66 g (sugar)', rounded: '41 g / 66 g' },
      { from: 0.5, to: '62.5 g (flour) / 100 g (sugar)', rounded: '63 g / 100 g' },
      { from: 0.67, to: '83.75 g (flour) / 134 g (sugar)', rounded: '84 g / 134 g' },
      { from: 0.75, to: '93.75 g (flour) / 150 g (sugar)', rounded: '94 g / 150 g' },
      { from: 1, to: '125 g (flour) / 200 g (sugar)', rounded: '125 g / 200 g' },
      { from: 1.5, to: '187.5 g (flour) / 300 g (sugar)', rounded: '188 g / 300 g' },
      { from: 2, to: '250 g (flour) / 400 g (sugar)', rounded: '250 g / 400 g' },
      { from: 2.5, to: '312.5 g (flour) / 500 g (sugar)', rounded: '313 g / 500 g' },
      { from: 3, to: '375 g (flour) / 600 g (sugar)', rounded: '375 g / 600 g' },
      { from: 4, to: '500 g (flour) / 800 g (sugar)', rounded: '500 g / 800 g' },
    ],
    steps: [
      'Identify the specific baking ingredient (e.g. all-purpose flour, granulated sugar, butter)',
      'Look up the substance density or standard cup weight (flour = 125 g/cup, sugar = 200 g/cup, butter = 227 g/cup)',
      'Multiply the number of cups by the ingredient unit weight in grams',
      'Weigh your ingredient directly on a tared digital kitchen scale for accuracy',
    ],
    examples: [
      '1 cup of all-purpose flour = 125 grams (spooned and leveled, not scooped)',
      '1 cup of granulated sugar = 200 grams (white table sugar)',
      '1 cup of unsalted butter = 227 grams (2 standard US sticks)',
      '1 cup of brown sugar (packed) = 220 grams',
      '1 cup of water or milk = 237 grams (liquid density ~1.0 g/mL)',
    ],
    faq: [
      { q: 'How many grams is 1 cup of flour?', a: 'One US legal cup of all-purpose flour weighs approximately 125 grams when spooned into the cup and leveled with a knife. Scooping directly from the bag can compress flour to 140–150 grams.' },
      { q: 'How many grams is 1 cup of sugar?', a: 'One cup of granulated white sugar weighs exactly 200 grams. One cup of powdered confectioners sugar weighs about 120 grams.' },
      { q: 'Why do European recipes use grams instead of cups?', a: 'European culinary schools and domestic recipes use weight (grams) because it is immune to settling, sifting, and humidity variations, guaranteeing reproducible pastry results.' },
      { q: 'Is a US cup the same as a metric cup?', a: 'A US legal cup is 240 mL, a US customary cup is 236.588 mL, and a metric cup (used in Australia and New Zealand) is exactly 250 mL.' },
    ],
    relatedGuides: [
      { label: 'Lakh & Crore to Million & Billion Converter', slug: 'lakh-crore-to-million-billion' },
      { label: 'Binary & IEEE-754 Float Guide', slug: 'binary-hex-ieee-754-guide' },
    ],
    relatedCat: 'cooking',
  },
  'lakh-crore-to-million-billion': {
    title: 'Lakh & Crore to Million & Billion Converter Guide (2,2,3 Grouping)',
    metaDesc: 'Convert Lakh and Crore to Millions and Billions. Learn the South Asian 2,2,3 comma system: 1 Lakh = 100,000 (0.1M), 1 Crore = 10 Million, 1 Arab = 1 Billion.',
    h1: 'Lakh & Crore to Million & Billion Converter Guide (2,2,3 Grouping)',
    slug: 'lakh-crore-to-million-billion',
    intro: 'Financial reporting and commerce in Pakistan, India, Bangladesh, and Nepal use the South Asian numbering system consisting of Hazar (1,000), Lakh (100,000), Crore (10,000,000), Arab (1,000,000,000), and Kharab (100,000,000,000). While the international system places commas every 3 digits (1,000,000 = 1 Million), the South Asian system places the first comma after 3 digits, followed by commas every 2 digits (10,00,000 = 10 Lakh = 1 Million). Understanding this mapping is essential for real estate, banking, macroeconomic budgets, and multinational corporate accounting.',
    formula: 'Million = Crore × 10 | Lakh = Million × 10 | Billion = Arab × 1',
    table: [
      { from: 1, to: '100,000 (0.10 M)', rounded: '1 Lakh' },
      { from: 5, to: '500,000 (0.50 M)', rounded: '5 Lakh' },
      { from: 10, to: '1,000,000 (1.00 M)', rounded: '10 Lakh (1 Million)' },
      { from: 50, to: '5,000,000 (5.00 M)', rounded: '50 Lakh (5 Million)' },
      { from: 100, to: '10,000,000 (10.00 M)', rounded: '1 Crore (10 Million)' },
      { from: 500, to: '50,000,000 (50.00 M)', rounded: '5 Crore (50 Million)' },
      { from: 1000, to: '100,000,000 (100.00 M)', rounded: '10 Crore (100 Million)' },
      { from: 10000, to: '1,000,000,000 (1.00 B)', rounded: '1 Arab (1 Billion)' },
    ],
    steps: [
      'To convert Lakhs to Millions: divide by 10 (e.g. 50 Lakh = 50 ÷ 10 = 5 Million)',
      'To convert Millions to Lakhs: multiply by 10 (e.g. 2.5 Million = 2.5 × 10 = 25 Lakhs)',
      'To convert Crores to Millions: multiply by 10 (e.g. 3 Crore = 3 × 10 = 30 Million)',
      'To convert Millions to Crores: divide by 10 (e.g. 45 Million = 45 ÷ 10 = 4.5 Crore)',
    ],
    examples: [
      'PKR 25 Lakh property = PKR 2,500,000 = 2.5 Million PKR',
      'PKR 1.5 Crore house = PKR 15,000,000 = 15 Million PKR',
      'PKR 1 Arab federal project = PKR 1,000,000,000 = 1 Billion PKR',
      'PKR 2.5 Kharab national budget allocation = PKR 250 Billion',
    ],
    faq: [
      { q: 'How many Millions are in 1 Crore?', a: 'One Crore equals exactly 10 Million. Therefore, 10 Crores equal 100 Million, and 100 Crores equal 1 Billion (1 Arab).' },
      { q: 'How does comma placement differ in South Asian numbers?', a: 'The international system groups digits in triplets (1,000,000). The South Asian system places the first comma after three digits, then subsequent commas after every two digits (10,00,000 = 10 Lakh = 1 Million).' },
      { q: 'How many Lakhs make 1 Crore?', a: 'One Crore equals exactly 100 Lakhs (100 × 100,000 = 10,000,000).' },
      { q: 'What is 1 Arab in international terms?', a: 'One Arab equals 1,000,000,000 (100 Crore), which is identical to 1 International Billion.' },
    ],
    relatedGuides: [
      { label: 'Cups to Grams Cooking Guide', slug: 'cups-to-grams' },
      { label: 'Binary & IEEE-754 Float Guide', slug: 'binary-hex-ieee-754-guide' },
    ],
    relatedCat: 'pk-numbering',
  },
  'binary-hex-ieee-754-guide': {
    title: 'Binary, Hexadecimal & IEEE-754 Floating-Point Conversion Guide',
    metaDesc: 'Master binary, hexadecimal, and IEEE-754 FP32/FP64 floating-point conversion. Step-by-step bitfield breakdowns: sign bit, biased exponent, and mantissa.',
    h1: 'Binary, Hexadecimal & IEEE-754 Floating-Point Conversion Guide',
    slug: 'binary-hex-ieee-754-guide',
    intro: 'Digital computers store all instructions and data as binary bit sequences (base 2). For human convenience, binary strings are grouped into 4-bit nibbles and written in hexadecimal (base 16). For fractional real numbers, computers implement the IEEE-754 standard, decomposing values into three discrete bitfields: a 1-bit sign, a biased exponent (8 bits for FP32, 11 bits for FP64), and a fractional mantissa (23 bits for FP32, 52 bits for FP64). This guide walks through radix conversions, bit shifting, and floating-point quantization.',
    formula: 'FP32 = (-1)^sign × 2^(exponent - 127) × (1 + mantissa / 2^23)',
    table: [
      { from: 0, to: '0b0000 0000', rounded: '0x00 / FP32: 0x00000000' },
      { from: 1, to: '0b0000 0001', rounded: '0x01 / FP32: 0x3F800000' },
      { from: 2, to: '0b0000 0010', rounded: '0x02 / FP32: 0x40000000' },
      { from: 15, to: '0b0000 1111', rounded: '0x0F / FP32: 0x41700000' },
      { from: 16, to: '0b0001 0000', rounded: '0x10 / FP32: 0x41800000' },
      { from: 127, to: '0b0111 1111', rounded: '0x7F / Exponent Bias' },
      { from: 255, to: '0b1111 1111', rounded: '0xFF / Max Byte' },
      { from: 1024, to: '0b100 0000 0000', rounded: '0x400 / 1 KiB' },
    ],
    steps: [
      'To convert Decimal to Binary: divide by 2 repeatedly and record remainders in reverse order',
      'To convert Binary to Hex: group bits into 4-bit nibbles from right to left and map each 4-bit block to 0-9, A-F',
      'To encode IEEE-754 FP32: set sign bit (0 for positive, 1 for negative), calculate exponent + 127 bias, and encode 23-bit normalized mantissa',
      'Combine Sign (1b) + Exponent (8b) + Mantissa (23b) into 32-bit hexadecimal word',
    ],
    examples: [
      'Decimal 13 to Binary: 13 ÷ 2 = 6 r1, 6 ÷ 2 = 3 r0, 3 ÷ 2 = 1 r1, 1 ÷ 2 = 0 r1 -> 1101 binary',
      'Binary 1101 1010 to Hex: 1101 = 13 (D), 1010 = 10 (A) -> 0xDA hex (218 decimal)',
      'Decimal 1.0 in IEEE-754 FP32: Sign 0, Exp 127 (01111111), Mantissa 0 -> 0x3F800000',
      'Decimal -2.5 in IEEE-754 FP32: -1.01 × 2^1 -> Sign 1, Exp 128 (10000000), Mantissa 0100... -> 0xC0200000',
    ],
    faq: [
      { q: 'How many binary bits correspond to one hexadecimal digit?', a: 'Exactly 4 binary bits (one nibble) correspond to one hexadecimal digit. For example, binary 1111 is hex F (15 decimal).' },
      { q: 'What is the IEEE-754 single precision structure?', a: 'FP32 consists of 32 bits: 1 sign bit, 8 exponent bits (with bias 127), and 23 fraction/mantissa bits, providing ~7 decimal digits of precision.' },
      { q: 'Why do floating point calculations have rounding errors?', a: 'Many decimal fractions like 0.1 cannot be represented as finite terminating fractions in binary base 2, just as 1/3 cannot terminate in base 10.' },
      { q: 'What is the difference between FP16, FP32, and FP64?', a: 'FP16 (half precision) uses 16 bits (1-5-10) for machine learning; FP32 (single precision) uses 32 bits (1-8-23) for 3D graphics and general computing; FP64 (double precision) uses 64 bits (1-11-52) for scientific and financial calculations.' },
    ],
    relatedGuides: [
      { label: 'Cups to Grams Cooking Guide', slug: 'cups-to-grams' },
      { label: 'Lakh & Crore to Million & Billion Converter', slug: 'lakh-crore-to-million-billion' },
    ],
    relatedCat: 'number-base',
  },
}
