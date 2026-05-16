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
      options: ['100', '1000', '10', '10000'],
      correct: 1,
      explanation: '1 kg = 1000 g.',
      difficulty: 'beginner'
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
      explanation: '0 K = -273.15°C is absolute zero.',
      difficulty: 'intermediate'
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
