import { useState, useEffect, useRef } from 'react'
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
  const [dismissed, setDismissed] = useState(() => Boolean(localStorage.getItem('uc_onboarded')))
  const cardRef = useRef<HTMLDivElement>(null)

  const finish = () => {
    setDismissed(true)
    localStorage.setItem('uc_onboarded', 'true')
  }

  useEffect(() => {
    if (dismissed) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish()
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        finish()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dismissed])

  if (dismissed) return null

  const s = STEPS[step]

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-30 pointer-events-none flex items-center justify-center p-4"
      >
        <motion.div
          ref={cardRef}
          key={step}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="tour-heading"
          className="glass rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl pointer-events-auto"
        >
          <div className="text-6xl animate-float">{s.icon}</div>
          <h2 id="tour-heading" className="text-xl font-bold">{s.title}</h2>
          <p className="text-sm opacity-60">{s.desc}</p>
          <div className="flex justify-center gap-1.5 pt-2">
            {STEPS.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-[var(--primary)]' : 'bg-[var(--border)]'}`} />
            ))}
          </div>
          <div className="flex gap-2 justify-center pt-2">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="btn-secondary text-xs px-4 py-2.5 min-h-[44px] flex items-center justify-center"
              >
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                className="btn-primary text-xs px-6 py-2.5 min-h-[44px] flex items-center justify-center"
              >
                Next
              </button>
            ) : (
              <button
                onClick={finish}
                className="btn-primary text-xs px-6 py-2.5 min-h-[44px] flex items-center justify-center"
              >
                Get Started 🚀
              </button>
            )}
          </div>
          <button
            onClick={finish}
            className="text-xs font-semibold text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--card2)] transition-colors min-h-[44px] px-4 py-2 rounded-xl flex items-center justify-center mx-auto"
            aria-label="Skip tour"
          >
            Skip
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
