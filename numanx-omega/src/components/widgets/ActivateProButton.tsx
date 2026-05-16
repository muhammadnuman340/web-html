import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMonetization } from '../../hooks/useMonetization'

export default function ActivateProButton() {
  const { isPro, setPro } = useMonetization()
  const [showConfirm, setShowConfirm] = useState(false)

  if (isPro) return null

  const activate = () => {
    setShowConfirm(true)
    setTimeout(() => {
      setPro(true)
      window.location.reload()
    }, 1200)
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="fixed bottom-24 right-4 z-40 w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white shadow-xl shadow-[var(--primary)]/40 flex items-center justify-center text-lg hover:scale-110 transition-transform active:scale-90"
        data-tooltip="Unlock Pro"
        data-tooltip-bottom
      >
        🚀
      </button>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] flex items-center justify-center p-4"
            onClick={() => setShowConfirm(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={e => e.stopPropagation()}
              className="relative glass rounded-2xl p-8 max-w-xs w-full text-center shadow-2xl border border-[var(--border)]"
            >
              <div className="text-5xl mb-4 animate-bounce">🚀</div>
              <h3 className="text-lg font-bold mb-1">Omega X Pro</h3>
              <p className="text-xs opacity-60 mb-4">Activate all premium features?</p>
              <button
                onClick={activate}
                className="w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white shadow-lg hover:shadow-[var(--primary)]/30 transition-all"
              >
                ⚡ Activate Now
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="w-full py-2 mt-2 rounded-xl text-xs opacity-50 hover:opacity-100 transition-all"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
