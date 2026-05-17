import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMonetization } from '../../hooks/useMonetization'
import { openPaddleCheckout } from '../../engine/paddle'

export default function UpgradePrompt() {
  const { upgradePrompt, clearUpgrade, setPro } = useMonetization()
  const [upgrading, setUpgrading] = useState(false)

  const handleUpgrade = async () => {
    setUpgrading(true)
    const paid = await openPaddleCheckout()
    setUpgrading(false)
    if (paid) {
      setPro(true)
      clearUpgrade()
    }
  }

  return (
    <AnimatePresence>
      {upgradePrompt && !upgrading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[500] flex items-center justify-center p-4"
          onClick={clearUpgrade}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="relative glass rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[var(--border)] text-center"
          >
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-base font-bold mb-1">Pro Feature</h3>
            <div className="text-xs opacity-70 mb-4 leading-relaxed">
              <strong className="text-[var(--primary)]">{upgradePrompt.feature}</strong> is a Pro feature.
            </div>
            <div className="text-[11px] opacity-60 mb-4 leading-relaxed p-3 rounded-xl bg-[var(--card2)]">
              {upgradePrompt.description}
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={handleUpgrade}
                className="w-full py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white hover:shadow-lg hover:shadow-[var(--primary)]/30 transition-all">
                ⚡ Upgrade to Pro
              </button>
              <button onClick={clearUpgrade}
                className="w-full py-2 rounded-xl text-xs glass hover:bg-[var(--border)] transition-all">
                Maybe Later
              </button>
            </div>
            <div className="mt-3 text-[9px] opacity-30">Secure checkout via Paddle · Lifetime access</div>
          </motion.div>
        </motion.div>
      )}

      {upgrading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[600] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="relative glass rounded-2xl p-8 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.6 }}
              className="text-6xl mb-4"
            >
              🔄
            </motion.div>
            <div className="text-lg font-bold">Opening Checkout...</div>
            <div className="text-xs opacity-50 mt-1">Secure payment powered by Paddle</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
