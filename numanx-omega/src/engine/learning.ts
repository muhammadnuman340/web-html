export interface LearningStep {
  title: string
  explanation: string
  formula?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  steps?: { label: string; detail: string }[]
}

export interface QuizQuestion {
  question: string
  options: string[]
  correct: number
  explanation: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

const EXPLANATIONS: Record<string, LearningStep[]> = {
  length: [
    {
      title: 'Why 1 km = 1000 m?',
      explanation: 'Kilo (k) is a prefix meaning 1000. So 1 kilometer = 1000 meters. This is part of the metric system where prefixes scale by powers of 10.',
      formula: '1 km = 1000 m',
      difficulty: 'beginner',
      steps: [
        { label: 'Identify prefix', detail: '"kilo" means 1000' },
        { label: 'Apply scale', detail: '1 km = 1 × 1000 = 1000 m' }
      ]
    },
    {
      title: 'Metric vs Imperial',
      explanation: 'Metric uses powers of 10 (easy). Imperial uses arbitrary conversions. 1 foot = 12 inches, 1 yard = 3 feet, 1 mile = 5280 feet.',
      difficulty: 'beginner'
    },
    {
      title: 'Converting between systems',
      explanation: '1 inch is defined as exactly 25.4 mm. All imperial length units are based on this standard.',
      formula: '1 in = 25.4 mm',
      difficulty: 'intermediate',
      steps: [
        { label: 'Start with definition', detail: '1 in = 25.4 mm (exact)' },
        { label: 'Convert inches to cm', detail: '1 in = 2.54 cm' },
        { label: 'Convert feet to meters', detail: '1 ft = 0.3048 m' }
      ]
    },
    {
      title: 'Astronomical distances',
      explanation: 'For very large distances we use AU (Earth-Sun), light-years, and parsecs. 1 light-year ≈ 9.46 trillion km.',
      formula: '1 ly = 9.461e15 m',
      difficulty: 'advanced'
    }
  ],
  mass: [
    {
      title: 'Weight vs Mass',
      explanation: 'Mass is the amount of matter. Weight is force from gravity. The kg measures mass. On Earth, 1 kg weighs about 9.8 Newtons.',
      difficulty: 'intermediate'
    },
    {
      title: 'Metric prefixes',
      explanation: 'Milli = 1/1000, Centi = 1/100, Kilo = 1000. So 1000 g = 1 kg, 1 g = 1000 mg.',
      difficulty: 'beginner',
      steps: [
        { label: 'Milli', detail: '1 g = 1000 mg (milli = 1/1000)' },
        { label: 'Kilo', detail: '1 kg = 1000 g (kilo = 1000)' },
        { label: 'Tonne', detail: '1 t = 1000 kg' }
      ]
    },
    {
      title: 'Atomic scale mass',
      explanation: 'The atomic mass unit (amu) is defined as 1/12 the mass of a carbon-12 atom. 1 amu ≈ 1.66e-27 kg.',
      formula: '1 amu = 1.660539e-27 kg',
      difficulty: 'advanced'
    }
  ],
  temp: [
    {
      title: 'Celsius to Fahrenheit',
      explanation: 'Water freezes at 0°C (32°F) and boils at 100°C (212°F). The formula F = C × 9/5 + 32 scales and shifts.',
      formula: '°F = °C × 9/5 + 32',
      difficulty: 'beginner',
      steps: [
        { label: 'Multiply by 9/5', detail: 'Scale the Celsius value' },
        { label: 'Add 32', detail: 'Shift to Fahrenheit zero point' }
      ]
    },
    {
      title: 'Absolute Zero',
      explanation: '0 Kelvin (-273.15°C) is absolute zero — the coldest possible temperature where molecular motion stops.',
      difficulty: 'advanced'
    },
    {
      title: 'Rankine scale',
      explanation: 'Rankine is to Fahrenheit as Kelvin is to Celsius. °R = °F + 459.67. Used in some engineering fields.',
      formula: '°R = °F + 459.67',
      difficulty: 'advanced'
    }
  ],
  data: [
    {
      title: 'Bits vs Bytes',
      explanation: '1 Byte = 8 bits. Storage is measured in bytes, transfer speeds in bits per second.',
      formula: '1 B = 8 b',
      difficulty: 'beginner'
    },
    {
      title: 'Binary prefixes',
      explanation: 'Kibi (Ki) = 1024, Mebi (Mi) = 1024². Storage manufacturers often use decimal prefixes (1 KB = 1000 B).',
      difficulty: 'intermediate'
    }
  ],
  speed: [
    {
      title: 'km/h to m/s',
      explanation: 'To convert km/h to m/s, divide by 3.6. 1 km/h = 1000m/3600s = 1/3.6 m/s.',
      formula: '1 km/h = 0.27778 m/s',
      difficulty: 'beginner',
      steps: [
        { label: 'km to m', detail: 'Multiply by 1000' },
        { label: 'hours to seconds', detail: 'Divide by 3600' },
        { label: 'Combine', detail: '1000/3600 = 1/3.6' }
      ]
    }
  ],
  pressure: [
    {
      title: 'Pascal to PSI',
      explanation: '1 PSI = 6894.76 Pa. PSI measures pounds per square inch, commonly used in tire pressure.',
      formula: '1 PSI = 6894.76 Pa',
      difficulty: 'intermediate'
    },
    {
      title: 'Atmospheric pressure',
      explanation: 'Standard atmospheric pressure at sea level is 101,325 Pa (1 atm), about 14.7 PSI.',
      difficulty: 'beginner'
    }
  ],
  energy: [
    {
      title: 'Joules to Calories',
      explanation: '1 calorie = 4.184 Joules. Food energy is measured in kilocalories (Calories with capital C).',
      formula: '1 cal = 4.184 J',
      difficulty: 'beginner'
    },
    {
      title: 'kWh to Joules',
      explanation: '1 kWh = 3.6 million Joules. This is what your electricity meter measures.',
      formula: '1 kWh = 3.6e6 J',
      difficulty: 'intermediate'
    }
  ],
}

const QUIZZES: Record<string, QuizQuestion[]> = {
  length: [
    {
      question: 'How many meters are in 1 kilometer?',
      options: ['100', '1000', '10000', '0.001'],
      correct: 1,
      explanation: 'Kilo = 1000, so 1 km = 1000 m.',
      difficulty: 'beginner'
    },
    {
      question: 'How many inches are in 1 foot?',
      options: ['10', '12', '100', '24'],
      correct: 1,
      explanation: '1 foot = 12 inches.',
      difficulty: 'beginner'
    },
    {
      question: 'What is the exact definition of 1 inch in metric?',
      options: ['25.4 mm', '2.54 cm', 'Both A and B', '10 mm'],
      correct: 2,
      explanation: '1 inch = 25.4 mm = 2.54 cm exactly.',
      difficulty: 'intermediate'
    }
  ],
  mass: [
    {
      question: 'How many grams are in 1 kilogram?',
      options: ['100', '1000', '10000', '0.001'],
      correct: 1,
      explanation: 'Kilo = 1000, so 1 kg = 1000 g.',
      difficulty: 'beginner'
    },
    {
      question: 'Which is heavier: 1 Troy ounce of gold or 1 standard Avoirdupois ounce of feathers?',
      options: ['Standard ounce (28.35 g)', 'Troy ounce (31.10 g)', 'They are identical', 'Depends on temperature'],
      correct: 1,
      explanation: 'A Troy ounce is exactly 31.1035 g, while an ordinary avoirdupois ounce is 28.3495 g. Gold is measured in Troy ounces!',
      difficulty: 'intermediate'
    }
  ],
  temp: [
    {
      question: 'What is 0°C in Fahrenheit?',
      options: ['0°F', '32°F', '100°F', '-32°F'],
      correct: 1,
      explanation: 'Water freezes at 0°C = 32°F.',
      difficulty: 'beginner'
    },
    {
      question: 'What is absolute zero in Celsius?',
      options: ['0°C', '-100°C', '-273.15°C', '-459.67°C'],
      correct: 2,
      explanation: '0 K = -273.15°C is absolute zero, where molecular thermal motion ceases.',
      difficulty: 'intermediate'
    }
  ],
  cooking: [
    {
      question: 'How many teaspoons are in 1 US tablespoon?',
      options: ['2', '3', '4', '5'],
      correct: 1,
      explanation: '1 US tablespoon equals exactly 3 US teaspoons (15 mL vs 5 mL).',
      difficulty: 'beginner'
    },
    {
      question: 'How many tablespoons make up 1 standard US cup?',
      options: ['8', '12', '16', '24'],
      correct: 2,
      explanation: 'There are 16 tablespoons in 1 US liquid cup (or 8 fluid ounces).',
      difficulty: 'beginner'
    }
  ],
  data: [
    {
      question: 'How many bits are in one standard digital Byte?',
      options: ['4 bits', '8 bits', '16 bits', '1024 bits'],
      correct: 1,
      explanation: '1 Byte is universally composed of 8 bits (one octet).',
      difficulty: 'beginner'
    },
    {
      question: 'What is the exact difference between 1 Kilobyte (KB) and 1 Kibibyte (KiB)?',
      options: ['1 KB = 1000 B, 1 KiB = 1024 B', '1 KB = 1024 B, 1 KiB = 1000 B', 'They are identical', 'KiB is for network, KB is for storage'],
      correct: 0,
      explanation: 'Under IEC standard 60027-2, decimal SI prefixes like KB represent 1,000 bytes, while binary IEC prefixes like KiB represent 1,024 bytes (2^10).',
      difficulty: 'intermediate'
    }
  ],
  speed: [
    {
      question: 'What is 36 km/h converted to meters per second (m/s)?',
      options: ['3.6 m/s', '10 m/s', '100 m/s', '12.5 m/s'],
      correct: 1,
      explanation: 'To convert km/h to m/s, divide by 3.6: 36 ÷ 3.6 = 10 m/s.',
      difficulty: 'beginner'
    },
    {
      question: 'What is the speed of sound in dry air at 20°C (Mach 1)?',
      options: ['~100 m/s', '~343 m/s', '~1000 m/s', '~300,000 km/s'],
      correct: 1,
      explanation: 'Mach 1 in standard sea-level atmosphere is approximately 343 m/s (1,235 km/h or 767 mph).',
      difficulty: 'intermediate'
    }
  ],
  pressure: [
    {
      question: 'What is standard atmospheric pressure at sea level in Pascals?',
      options: ['1,000 Pa', '14.7 Pa', '101,325 Pa', '1,000,000 Pa'],
      correct: 2,
      explanation: 'Standard atmospheric pressure (1 atm) is defined by BIPM as exactly 101,325 Pascals (101.325 kPa or 1.01325 bar).',
      difficulty: 'intermediate'
    },
    {
      question: 'A typical passenger car tire is inflated to approximately 32 PSI. How many bar is that?',
      options: ['~0.5 bar', '~1.2 bar', '~2.2 bar', '~5.5 bar'],
      correct: 2,
      explanation: '1 PSI ≈ 0.0689 bar. Thus 32 PSI ≈ 2.2 bar (or 220 kPa).',
      difficulty: 'intermediate'
    }
  ],
  energy: [
    {
      question: 'How many Joules are in 1 thermochemical calorie?',
      options: ['1 J', '3.141 J', '4.184 J', '1000 J'],
      correct: 2,
      explanation: '1 thermochemical calorie is defined as exactly 4.184 Joules (the energy required to warm 1 gram of water by 1°C).',
      difficulty: 'beginner'
    },
    {
      question: 'How many Joules are represented by 1 kilowatt-hour (kWh) on an electric bill?',
      options: ['3,600 J', '360,000 J', '3,600,000 J (3.6 MJ)', '1,000,000 J'],
      correct: 2,
      explanation: '1 kWh = 1000 W × 3600 seconds = 3,600,000 Joules (3.6 Megajoules).',
      difficulty: 'intermediate'
    }
  ],
  area: [
    {
      question: 'How many square meters (m²) are in 1 hectare (ha)?',
      options: ['100 m²', '1,000 m²', '10,000 m²', '100,000 m²'],
      correct: 2,
      explanation: '1 hectare is a square of 100 meters by 100 meters = 10,000 m² (about 2.47 acres).',
      difficulty: 'beginner'
    }
  ],
  time: [
    {
      question: 'How many seconds are in 1 standard 24-hour solar day?',
      options: ['3,600 s', '24,000 s', '86,400 s', '1,440 s'],
      correct: 2,
      explanation: '24 hours × 60 minutes × 60 seconds = 86,400 seconds.',
      difficulty: 'beginner'
    }
  ]
}

export function getExplanations(categoryId: string): LearningStep[] {
  return EXPLANATIONS[categoryId] || []
}

export function getFormulaExplanation(fromUnit: string, toUnit: string, factor: number): string {
  if (factor === 1) return `${fromUnit} and ${toUnit} are the same unit.`
  if (factor > 1) return `1 ${fromUnit} = ${factor.toFixed(4)} ${toUnit}. Multiply by ${factor.toFixed(4)} to convert.`
  return `1 ${fromUnit} = ${factor.toFixed(4)} ${toUnit}. Divide by ${(1 / factor).toFixed(4)} to convert.`
}

export function getDetailedSteps(fromUnit: string, toUnit: string, value: number, result: number, factor: number): { label: string; detail: string }[] {
  return [
    { label: 'Start', detail: `${value} ${fromUnit}` },
    { label: 'Conversion factor', detail: `1 ${fromUnit} = ${factor.toFixed(6)} ${toUnit}` },
    { label: 'Calculate', detail: `${value} × ${factor.toFixed(6)} = ${result.toFixed(6)}` },
    { label: 'Result', detail: `${result.toFixed(6)} ${toUnit}` },
  ]
}

export function getQuizzes(categoryId: string): QuizQuestion[] {
  return QUIZZES[categoryId] || []
}

export function getBeginnerTopics(): { id: string; title: string; icon: string }[] {
  return [
    { id: 'length', title: 'Length Basics', icon: '📏' },
    { id: 'mass', title: 'Mass & Weight', icon: '⚖️' },
    { id: 'temp', title: 'Temperature Scales', icon: '🌡️' },
    { id: 'data', title: 'Digital Storage', icon: '💾' },
    { id: 'speed', title: 'Speed Conversions', icon: '🚀' },
    { id: 'pressure', title: 'Pressure Units', icon: '🔵' },
    { id: 'energy', title: 'Energy & Work', icon: '⚡' },
  ]
}
