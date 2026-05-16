const CURRENCY_CACHE_KEY = 'uc_currency_offline'
const CONSTANTS_CACHE_KEY = 'uc_constants_cache'
const FORMULA_CACHE_KEY = 'uc_formulas_cache'

export interface CachedRates {
  rates: Record<string, number>
  timestamp: number
  base: string
}

export class OfflineEngine {
  private currencyCache: CachedRates | null = null
  private ready: boolean = false

  constructor() {
    this.loadCache()
  }

  private loadCache() {
    try {
      const cc = localStorage.getItem(CURRENCY_CACHE_KEY)
      if (cc) this.currencyCache = JSON.parse(cc)
      this.ready = true
    } catch { this.ready = true }
  }

  isReady() { return this.ready }

  getCachedCurrencyRates(): CachedRates | null {
    return this.currencyCache
  }

  cacheCurrencyRates(rates: Record<string, number>, base = 'USD') {
    this.currencyCache = { rates, timestamp: Date.now(), base }
    try {
      localStorage.setItem(CURRENCY_CACHE_KEY, JSON.stringify(this.currencyCache))
    } catch { /* ignore */ }
  }

  convertOfflineCurrency(amount: number, from: string, to: string): number | null {
    if (!this.currencyCache?.rates) return null
    const r = this.currencyCache.rates
    if (from === 'USD') return amount * (r[to] || 1)
    if (to === 'USD') return amount / (r[from] || 1)
    const inUSD = amount / (r[from] || 1)
    return inUSD * (r[to] || 1)
  }

  getCacheAge(): number | null {
    if (!this.currencyCache) return null
    return Date.now() - this.currencyCache.timestamp
  }

  isCacheStale(maxAge = 3600000): boolean {
    const age = this.getCacheAge()
    return age === null || age > maxAge
  }

  clearCache() {
    this.currencyCache = null
    try { localStorage.removeItem(CURRENCY_CACHE_KEY) } catch { /* ignore */ }
  }
}

export const offlineEngine = new OfflineEngine()

export const SCIENTIFIC_CONSTANTS_OFFLINE: Record<string, { value: number; unit: string; label: string }> = {
  speedOfLight: { value: 299792458, unit: 'm/s', label: 'Speed of Light (c)' },
  planckConstant: { value: 6.62607015e-34, unit: 'J·s', label: 'Planck Constant (h)' },
  gravitationalConstant: { value: 6.6743e-11, unit: 'm³·kg⁻¹·s⁻²', label: 'Gravitational Constant (G)' },
  avogadro: { value: 6.02214076e23, unit: 'mol⁻¹', label: "Avogadro's Number (Nₐ)" },
  boltzmann: { value: 1.380649e-23, unit: 'J/K', label: 'Boltzmann Constant (k)' },
  electronMass: { value: 9.1093837e-31, unit: 'kg', label: 'Electron Mass (mₑ)' },
  protonMass: { value: 1.6726219e-27, unit: 'kg', label: 'Proton Mass (mₚ)' },
  gasConstant: { value: 8.314462618, unit: 'J·mol⁻¹·K⁻¹', label: 'Gas Constant (R)' },
  stefanBoltzmann: { value: 5.670367e-8, unit: 'W·m⁻²·K⁻⁴', label: 'Stefan-Boltzmann Constant (σ)' },
  elementaryCharge: { value: 1.602176634e-19, unit: 'C', label: 'Elementary Charge (e)' },
  earthMass: { value: 5.972e24, unit: 'kg', label: 'Earth Mass' },
  earthRadius: { value: 6371000, unit: 'm', label: 'Earth Radius' },
  solarMass: { value: 1.989e30, unit: 'kg', label: 'Solar Mass' },
  astronomicalUnit: { value: 1.496e11, unit: 'm', label: 'Astronomical Unit (AU)' },
  lightYear: { value: 9.461e15, unit: 'm', label: 'Light Year (ly)' },
}
