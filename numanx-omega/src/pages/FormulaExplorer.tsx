import { useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import SEOHead from '../components/ui/SEOHead'
import { PAGE_META } from '../config/pageMeta'
import { useToast } from '../hooks/useToast'

interface FormulaItem {
  name: string
  desc: string
  variables?: string
  catId?: string
  link?: string
}

interface FormulaSection {
  field: string
  icon: string
  color: string
  items: FormulaItem[]
}

const FORMULA_DATA: FormulaSection[] = [
  {
    field: 'Unit Conversion Equations',
    icon: '🔄',
    color: '#3b82f6',
    items: [
      {
        name: '°F = (°C × 9/5) + 32',
        desc: 'Temperature Affine Scale Transformation',
        variables: '°F: Fahrenheit, °C: Celsius (equal at -40°)',
        catId: 'temp',
        link: '/convert/temp/celsius-to-fahrenheit',
      },
      {
        name: 'K = °C + 273.15',
        desc: 'Thermodynamic Absolute Temperature Scale',
        variables: 'K: Kelvin (0 K = Absolute Zero), °C: Celsius',
        catId: 'temp',
        link: '/convert/temp',
      },
      {
        name: 'P = ρ · g · h',
        desc: 'Hydrostatic Fluid Head Pressure',
        variables: 'P: Pressure (Pa), ρ: Density (kg/m³), g: 9.80665 m/s², h: Depth (m)',
        catId: 'pressure',
        link: '/convert/pressure',
      },
      {
        name: '1 bar = 100 kPa = 14.5038 psi',
        desc: 'Standard Atmospheric Pressure Equivalence',
        variables: '1 atm = 101,325 Pa = 1.01325 bar = 14.6959 psi = 760 mmHg',
        catId: 'pressure',
        link: '/convert/pressure/bar-to-psi',
      },
      {
        name: 'Mass = Volume × Density (m = V · ρ)',
        desc: 'Culinary & Fluid Density Bridging',
        variables: 'm: Grams (g), V: Milliliters (mL), ρ: Substance density (g/mL)',
        catId: 'cooking',
        link: '/convert/cooking/stick-of-butter-to-tablespoon',
      },
      {
        name: '1 hp = 745.7 W = 0.7457 kW',
        desc: 'Mechanical vs Metric Horsepower',
        variables: '1 mechanical hp = 550 ft·lbf/s ≈ 745.7 W; 1 metric PS = 735.5 W',
        catId: 'power',
        link: '/convert/power/metric-horsepower-to-kilowatt',
      },
      {
        name: 'Q = A · v',
        desc: 'Volumetric Fluid Flow Continuity',
        variables: 'Q: Flow Rate (m³/s or GPM), A: Pipe Area (m²), v: Velocity (m/s)',
        catId: 'flow',
        link: '/convert/flow/gallon-per-minute-to-liter-per-minute',
      },
      {
        name: '1 GiB = 1024³ Bytes = 1.0737 GB',
        desc: 'Binary IEC (1024) vs Decimal SI (1000) Data Storage',
        variables: '1 GiB = 1,073,741,824 B; 1 GB = 1,000,000,000 B',
        catId: 'data',
        link: '/convert/data/gibibyte-to-gigabyte',
      },
    ],
  },
  {
    field: 'Physics',
    icon: '⚛️',
    color: '#7c6fff',
    items: [
      { name: 'F = ma', desc: "Newton's Second Law of Motion", variables: 'F: Force (N), m: Mass (kg), a: Acceleration (m/s²)', catId: 'force', link: '/convert/force' },
      { name: 'E = mc²', desc: 'Mass-Energy Equivalence Principle', variables: 'E: Energy (J), m: Mass (kg), c: Speed of Light (299,792,458 m/s)', catId: 'energy', link: '/convert/energy' },
      { name: 'Ek = ½mv²', desc: 'Kinetic Energy Formula', variables: 'Ek: Kinetic Energy (J), m: Mass (kg), v: Velocity (m/s)', catId: 'energy', link: '/convert/energy' },
      { name: 'F = G(m₁m₂)/r²', desc: 'Newtonian Universal Gravitation', variables: 'G: 6.67430×10⁻¹¹ N·m²/kg², m: Masses (kg), r: Distance (m)', catId: 'force', link: '/convert/force' },
      { name: 'v = u + at', desc: 'Linear Kinematic Equation of Motion', variables: 'v: Final vel (m/s), u: Initial vel, a: Accel, t: Time (s)', catId: 'speed', link: '/convert/speed' },
      { name: 's = ut + ½at²', desc: 'Displacement under Constant Acceleration', variables: 's: Distance (m), u: Initial speed, t: Seconds, a: Accel', catId: 'length', link: '/convert/length' },
      { name: 'P = IV', desc: 'Electric Power Dissipation', variables: 'P: Power (W), I: Electric Current (A), V: Electric Potential (V)', catId: 'power', link: '/convert/power' },
      { name: 'V = IR', desc: "Ohm's Law of Resistance", variables: 'V: Voltage (V), I: Current (A), R: Electrical Resistance (Ω)', catId: 'electricity', link: '/convert/electricity' },
    ],
  },
  {
    field: 'Chemistry & Thermodynamics',
    icon: '🧪',
    color: '#22c55e',
    items: [
      { name: 'PV = nRT', desc: 'Ideal Gas Equation of State', variables: 'P: Pressure (Pa), V: Volume (m³), n: Moles, R: 8.314 J/(mol·K), T: Temp (K)', catId: 'pressure', link: '/convert/pressure' },
      { name: 'pH = -log[H⁺]', desc: 'Hydrogen Ion Activity / pH Scale', variables: '[H⁺]: Hydronium ion molar concentration (mol/L)', catId: 'density', link: '/convert/density' },
      { name: 'ΔG = ΔH - TΔS', desc: 'Gibbs Free Energy Thermodynamic Criterion', variables: 'ΔG: Free energy (J), ΔH: Enthalpy, T: Temp (K), ΔS: Entropy (J/K)', catId: 'energy', link: '/convert/energy' },
      { name: 'E = -13.6/n² eV', desc: 'Bohr Hydrogen Electron Energy Levels', variables: 'E: Electron energy in electron-volts (eV), n: Principal quantum number', catId: 'energy', link: '/convert/energy' },
    ],
  },
  {
    field: 'Mechanical & Structural Engineering',
    icon: '🔧',
    color: '#f59e0b',
    items: [
      { name: 'σ = F/A', desc: 'Mechanical Normal Stress', variables: 'σ: Normal Stress (Pa or psi), F: Normal Force (N), A: Cross-section Area (m²)', catId: 'pressure', link: '/convert/pressure' },
      { name: 'ε = ΔL/L', desc: 'Dimensionless Mechanical Strain', variables: 'ε: Engineering Strain (ratio), ΔL: Deformation (m), L: Original length (m)', catId: 'length', link: '/convert/length' },
      { name: 'τ = F × r', desc: 'Torsional Moment / Torque', variables: 'τ: Torque (N·m or lb-ft), F: Applied Force (N), r: Moment Arm Radius (m)', catId: 'torque', link: '/convert/torque' },
      { name: 'Q = mcΔT', desc: 'Sensible Heat Transfer Energy', variables: 'Q: Heat Energy (J), m: Mass (kg), c: Specific Heat Capacity, ΔT: Temperature rise (K)', catId: 'energy', link: '/convert/energy' },
    ],
  },
  {
    field: 'Biometrics & Health Science',
    icon: '❤️',
    color: '#ef4444',
    items: [
      { name: 'BMI = kg/m²', desc: 'Body Mass Index Quetelet Formula', variables: 'kg: Mass in kilograms, m: Standing height in meters squared', catId: 'mass', link: '/convert/mass' },
      { name: 'BMR = 10w + 6.25h - 5a + s', desc: 'Mifflin-St Jeor Basal Metabolic Rate', variables: 'w: Weight (kg), h: Height (cm), a: Age (years), s: Sex offset (+5 male, -161 female)', catId: 'energy', link: '/convert/energy' },
      { name: 'HRmax = 220 - age', desc: 'Estimated Maximum Cardiovascular Heart Rate', variables: 'HRmax: Beats per minute (BPM), age: Biological age in years', catId: 'frequency', link: '/convert/frequency' },
    ],
  },
]

export default function FormulaExplorer() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const { showToast } = useToast()

  const toggle = (field: string) => setExpanded(p => ({ ...p, [field]: !p[field] }))

  const copyFormula = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    showToast('Copied formula to clipboard!', 'success')
  }, [showToast])

  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return FORMULA_DATA
    return FORMULA_DATA.map(sec => ({
      ...sec,
      items: sec.items.filter(it =>
        it.name.toLowerCase().includes(q) ||
        it.desc.toLowerCase().includes(q) ||
        (it.variables && it.variables.toLowerCase().includes(q))
      ),
    })).filter(sec => sec.items.length > 0)
  }, [searchQuery])

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <SEOHead {...PAGE_META['/formulas']} path="/formulas" />

      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <span aria-hidden="true">📐</span>
          <span>Formula Explorer & Equation Registry</span>
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text2)] opacity-85">
          Mathematical definitions, dimensional analysis variables, and interactive converter links for core physical laws.
        </p>
      </header>

      {/* Search Input Filter */}
      <div className="relative">
        <input
          type="search"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search formulas (e.g. pressure, F = ma, kinetic, temperature, torque)..."
          className="w-full p-3.5 pl-10 rounded-xl border border-[var(--border)] bg-[var(--card2)] text-xs font-medium text-[var(--text)] outline-none focus:border-[var(--primary)] transition-colors"
          aria-label="Filter formulas by name, variable, or keyword"
        />
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm opacity-40 select-none" aria-hidden="true">
          🔍
        </span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs opacity-50 hover:opacity-100 p-1"
            aria-label="Clear formula search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Accordion Categories */}
      <div className="space-y-3">
        {filteredData.map(section => {
          const isOpen = expanded[section.field] !== false
          const colors = [section.color, `${section.color}22`]
          return (
            <div key={section.field} className="glass rounded-2xl overflow-hidden border border-[var(--border)]">
              <button
                onClick={() => toggle(section.field)}
                className="w-full flex items-center justify-between p-4 hover:bg-[var(--border)]/40 transition-colors text-left"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl" aria-hidden="true">{section.icon}</span>
                  <span className="font-bold text-sm text-[var(--text)]">{section.field}</span>
                  <span className="text-xs opacity-50 font-mono">({section.items.length})</span>
                </div>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs opacity-50 font-mono"
                  aria-hidden="true"
                >
                  ▼
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {section.items.map((item, ii) => (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: ii * 0.02 }}
                          className="glass rounded-xl p-3.5 border border-[var(--border)] hover:border-[var(--primary)]/50 transition-all space-y-2 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <button
                                onClick={() => copyFormula(item.name)}
                                className="font-mono text-sm font-bold text-left hover:underline focus:outline-none"
                                style={{ color: colors[0] }}
                                title="Click to copy equation"
                              >
                                {item.name}
                              </button>
                              <button
                                onClick={() => copyFormula(item.name)}
                                className="text-xs opacity-40 hover:opacity-100 p-1 transition-opacity shrink-0"
                                aria-label={`Copy formula ${item.name}`}
                                title="Copy formula"
                              >
                                📋
                              </button>
                            </div>
                            <div className="text-xs font-semibold text-[var(--text)] mt-1">{item.desc}</div>
                            {item.variables && (
                              <div className="text-[11px] text-[var(--text2)] opacity-80 mt-1 font-mono leading-relaxed">
                                {item.variables}
                              </div>
                            )}
                          </div>

                          {item.link && (
                            <div className="pt-2 border-t border-[var(--border)]/40 flex items-center justify-between">
                              <Link
                                to={item.link}
                                className="text-xs font-bold text-[var(--primary)] hover:underline inline-flex items-center gap-1 min-h-[36px]"
                              >
                                <span>Calculate in Converter</span>
                                <span aria-hidden="true">→</span>
                              </Link>
                              <button
                                onClick={() => copyFormula(item.name)}
                                className="text-[10px] text-[var(--text2)] opacity-70 hover:opacity-100 uppercase tracking-wider font-mono"
                              >
                                Copy Formula
                              </button>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
