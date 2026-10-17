import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SEOHead from '../components/ui/SEOHead'

const FORMULA_DATA = [
  { field: 'Physics', icon: '⚛️', color: '#7c6fff', items: [
    { name: 'F = ma', desc: "Newton's Second Law" },
    { name: 'E = mc²', desc: 'Mass-Energy Equivalence' },
    { name: 'F = G(m₁m₂)/r²', desc: 'Universal Gravitation' },
    { name: 'v = u + at', desc: 'Equation of Motion' },
    { name: 's = ut + ½at²', desc: 'Distance (constant accel)' },
    { name: 'P = IV', desc: 'Electrical Power' },
    { name: 'V = IR', desc: "Ohm's Law" },
    { name: 'λ = h/p', desc: 'De Broglie Wavelength' },
  ]},
  { field: 'Chemistry', icon: '🧪', color: '#22c55e', items: [
    { name: 'PV = nRT', desc: 'Ideal Gas Law' },
    { name: 'pH = -log[H⁺]', desc: 'pH Scale' },
    { name: 'ΔG = ΔH - TΔS', desc: 'Gibbs Free Energy' },
    { name: 'E = -13.6/n² eV', desc: 'Bohr Energy Levels' },
  ]},
  { field: 'Engineering', icon: '🔧', color: '#f59e0b', items: [
    { name: 'σ = F/A', desc: 'Stress' },
    { name: 'ε = ΔL/L', desc: 'Strain' },
    { name: 'τ = F × r', desc: 'Torque' },
    { name: 'Q = mcΔT', desc: 'Heat Energy' },
  ]},
  { field: 'Health', icon: '❤️', color: '#ef4444', items: [
    { name: 'BMI = kg/m²', desc: 'Body Mass Index' },
    { name: 'BMR = 10w + 6.25h - 5a + s', desc: 'Basal Metabolic Rate' },
    { name: 'HRmax = 220 - age', desc: 'Max Heart Rate' },
  ]},
]

export default function FormulaExplorer() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const toggle = (field: string) => setExpanded(p => ({ ...p, [field]: !p[field] }))

  const copyFormula = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
  }, [])

  return (
    <div className="space-y-4">
      <SEOHead title="Formula Explorer — Physics, Chemistry & Engineering Formulas" description="Explore conversion formulas for physics, chemistry, engineering, and health. Includes step-by-step explanations and real-world examples." path="/formulas" />
      <h2 className="text-lg font-bold"><span aria-hidden="true">📐</span> Formula Explorer</h2>
      <p className="text-xs opacity-60">Click a section to expand · Click any formula to copy</p>

      {FORMULA_DATA.map(section => {
        const isOpen = expanded[section.field] !== false
        const colors = [section.color, `${section.color}22`]
        return (
          <div key={section.field} className="glass rounded-2xl overflow-hidden">
            <button onClick={() => toggle(section.field)}
              className="w-full flex items-center justify-between p-4 hover:bg-[var(--border)]/50 transition-colors text-left">
              <div className="flex items-center gap-2">
                <span className="text-lg" aria-hidden="true">{section.icon}</span>
                <span className="font-semibold text-sm">{section.field}</span>
                <span className="text-[10px] opacity-40">({section.items.length} formulas)</span>
              </div>
              <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}
                className="text-xs opacity-40">▼</motion.span>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden">
                  <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {section.items.map((item, ii) => (
                      <motion.div key={item.name}
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: ii * 0.04 }}
                        className="glass rounded-xl p-3 cursor-pointer group hover:shadow-md transition-all interact-lift"
                        onClick={() => copyFormula(item.name)}
                        data-tooltip="Copy formula">
                        <div className="flex items-center justify-between">
                          <div className="font-mono text-sm font-bold" style={{ color: colors[0] }}>{item.name}</div>
                          <span className="text-[9px] opacity-0 group-hover:opacity-40 transition-opacity">📋</span>
                        </div>
                        <div className="text-xs opacity-50 mt-0.5">{item.desc}</div>
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
  )
}
