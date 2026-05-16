export const SCIENTIFIC_CONSTANTS = {
  speedOfLight: { value: 299792458, unit: 'm/s', label: 'Speed of Light (c)' },
  planckConstant: { value: 6.62607015e-34, unit: 'J·s', label: 'Planck Constant (h)' },
  gravitationalConstant: { value: 6.6743e-11, unit: 'm³·kg⁻¹·s⁻²', label: 'Gravitational Constant (G)' },
  avogadro: { value: 6.02214076e23, unit: 'mol⁻¹', label: "Avogadro's Number (Nₐ)" },
  boltzmann: { value: 1.380649e-23, unit: 'J/K', label: 'Boltzmann Constant (k)' },
  electronMass: { value: 9.1093837e-31, unit: 'kg', label: 'Electron Mass (mₑ)' },
  protonMass: { value: 1.6726219e-27, unit: 'kg', label: 'Proton Mass (mₚ)' },
  gasConstant: { value: 8.314462618, unit: 'J·mol⁻¹·K⁻¹', label: 'Gas Constant (R)' },
  stefanBoltzmann: { value: 5.670367e-8, unit: 'W·m⁻²·K⁻⁴', label: 'Stefan-Boltzmann Constant (σ)' },
  elementaryCharge: { value: 1.602176634e-19, unit: 'C', label: 'Elementary Charge (e)' }
}

export const COMPARISONS: Record<string, [number, string][]> = {
  length: [
    [1e-9, '~ DNA helix diameter'], [1e-6, '~ bacterium length'], [0.001, '~ paperclip wire'],
    [0.01, '~ fingernail width'], [0.1, '~ grain of rice'], [1, '~ door handle'],
    [1.7, '~ average human'], [10, '~ bus length'], [30, '~ blue whale'],
    [100, '~ football field'], [1000, '~ 10 city blocks'], [10000, '~ Mariana Trench'],
    [40000, '~ Earth circumference'], [384400000, '~ Earth-Moon distance'],
    [1.496e11, '~ Earth-Sun distance'], [9.461e15, '~ 1 light year']
  ],
  mass: [
    [1e-6, '~ grain of salt'], [0.001, '~ paperclip'], [0.005, '~ nickel'],
    [0.028, '~ bread slice'], [0.1, '~ apple'], [1, '~ liter of water'],
    [62, '~ average human'], [1000, '~ small car'], [1e6, '~ elephant'],
    [5.972e24, '~ Earth mass']
  ]
}

export const CURRENCY_LIST = [
  'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'CAD', 'AUD', 'CHF', 'MXN',
  'BRL', 'KRW', 'SEK', 'NOK', 'NZD', 'TRY', 'ZAR', 'AED', 'SAR', 'PKR',
  'RUB', 'SGD', 'HKD', 'MYR', 'THB', 'PHP', 'IDR', 'EGP', 'NGN', 'ARS',
  'COP', 'PLN', 'TWD', 'DKK', 'HUF', 'CZK', 'ILS', 'CLP', 'VND', 'BDT'
]

export const CRYPTO_LIST = [
  'BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'BNB', 'DOGE', 'USDT', 'USDC', 'DOT',
  'AVAX', 'MATIC', 'LINK', 'UNI', 'SHIB', 'LTC', 'ATOM', 'ETC', 'XLM', 'TRX'
]

export const HEALTH_FORMULAS = {
  bmi: { label: 'BMI', formula: 'kg / (m)²', unit: 'kg/m²' },
  bmr: { label: 'BMR (Mifflin-St Jeor)', formula: '10×kg + 6.25×cm - 5×age + s', unit: 'kcal/day' },
  bodyFat: { label: 'Body Fat %', formula: '(1.20×BMI) + (0.23×age) - 16.2', unit: '%' }
}
