import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STEPS = [
  { icon: '🔄', title: 'Welcome to NX-COS', desc: 'The Universal Conversion Operating System. Convert anything, instantly.' },
  { icon: '🧠', title: 'Natural Language Input', desc: 'Just type "5 km in miles" or "(5m + 20cm) × 2" — it understands you.' },
  { icon: '⌨️', title: 'Press ⌘K for Commands', desc: 'Open the command palette to convert, calculate, search, or navigate anywhere.' },
  { icon: '🎓', title: '6 Modes for Everyone', desc: 'Student, Engineer, Scientist, Trader, Fast, or Pro — switch anytime in the top bar.' },
  { icon: '🧠', title: 'AI Assistant', desc: 'Click the 🧠 button for a smart assistant that explains conversions and answers questions.' },
]

export default function OnboardingTour() {
  const [step, setStep] = useState(0)
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    const seen = localStorage.getItem('uc_onboarded')
    if (!seen) setDismissed(false)
  }, [])

  const finish = () => {
    setDismissed(true)
    localStorage.setItem('uc_onboarded', 'true')
  }

  if (dismissed) return null

  const s = STEPS[step]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={e => { if (e.target === e.currentTarget) finish() }}
      >
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="glass rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl"
        >
          <div className="text-6xl animate-float">{s.icon}</div>
          <h2 className="text-xl font-bold">{s.title}</h2>
          <p className="text-sm opacity-60">{s.desc}</p>
          <div className="flex justify-center gap-1.5 pt-2">
            {STEPS.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-[var(--primary)]' : 'bg-[var(--border)]'}`} />
            ))}
          </div>
          <div className="flex gap-2 justify-center pt-2">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="px-4 py-2 rounded-xl text-xs bg-[var(--border)] interact-lift">Back</button>
            )}
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)}
                className="px-6 py-2 rounded-xl text-xs bg-[var(--primary)] text-white interact-lift">Next</button>
            ) : (
              <button onClick={finish}
                className="px-6 py-2 rounded-xl text-xs bg-[var(--primary)] text-white interact-lift">Get Started 🚀</button>
            )}
          </div>
          <button onClick={finish} className="text-[10px] opacity-30 hover:opacity-100">Skip tour</button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
