import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function FormulaExplorer() {
  const navigate = useNavigate()

  const formulas = [
    { field: 'Physics', icon: '⚛️', items: [
      { name: 'F = ma', desc: 'Newton\'s Second Law' },
      { name: 'E = mc²', desc: 'Mass-Energy Equivalence' },
      { name: 'F = G(m₁m₂)/r²', desc: 'Universal Gravitation' },
      { name: 'v = u + at', desc: 'Equation of Motion' },
      { name: 's = ut + ½at²', desc: 'Distance (constant accel)' },
      { name: 'P = IV', desc: 'Electrical Power' },
      { name: 'V = IR', desc: "Ohm's Law" },
      { name: 'λ = h/p', desc: 'De Broglie Wavelength' }
    ]},
    { field: 'Chemistry', icon: '🧪', items: [
      { name: 'PV = nRT', desc: 'Ideal Gas Law' },
      { name: 'pH = -log[H⁺]', desc: 'pH Scale' },
      { name: 'ΔG = ΔH - TΔS', desc: 'Gibbs Free Energy' },
      { name: 'E = -13.6/n² eV', desc: 'Bohr Energy Levels' }
    ]},
    { field: 'Engineering', icon: '🔧', items: [
      { name: 'σ = F/A', desc: 'Stress' },
      { name: 'ε = ΔL/L', desc: 'Strain' },
      { name: 'τ = F × r', desc: 'Torque' },
      { name: 'Q = mcΔT', desc: 'Heat Energy' }
    ]},
    { field: 'Health', icon: '❤️', items: [
      { name: 'BMI = kg/m²', desc: 'Body Mass Index' },
      { name: 'BMR = 10w + 6.25h - 5a + s', desc: 'Basal Metabolic Rate' },
      { name: 'HRmax = 220 - age', desc: 'Max Heart Rate' }
    ]}
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">📐 Formula Explorer</h2>
      <p className="text-xs opacity-60">Physics · Chemistry · Engineering · Health</p>

      {formulas.map((section, si) => (
        <div key={section.field}>
          <div className="text-sm font-semibold mb-2 flex items-center gap-2">
            <span>{section.icon}</span> {section.field}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {section.items.map((item, ii) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: si * 0.1 + ii * 0.03 }}
                className="glass rounded-xl p-3"
              >
                <div className="font-mono text-sm font-bold" style={{ color: ['#6c63ff', '#2ecc71', '#e67e22', '#e74c3c'][si] }}>{item.name}</div>
                <div className="text-xs opacity-50 mt-0.5">{item.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
