import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMonetization } from '../../hooks/useMonetization'
import { openPaddleCheckout, retryPaddle, wasSdkBlocked } from '../../engine/paddle'
import { useToast } from '../../hooks/useToast'

export default function ProBadge() {
  const { isPro, setProSettingsOpen, setPro } = useMonetization()
  const [loading, setLoading] = useState(false)
  const [showBlocked, setShowBlocked] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const { addToast } = useToast()

  const handleClick = async () => {
    if (isPro) { setProSettingsOpen(true); return }
    setLoading(true)
    const paid = await openPaddleCheckout()
    setLoading(false)
    if (paid) {
      setPro(true)
      addToast('🚀 Welcome to Omega X Pro! All features unlocked.', 'success', '🚀')
    } else if (wasSdkBlocked()) {
      setShowBlocked(true)
    }
  }

  const handleRetry = async () => {
    setRetrying(true)
    const ok = await retryPaddle()
    setRetrying(false)
    if (ok) {
      setShowBlocked(false)
      handleClick()
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold transition-all interact-lift ${
          isPro
            ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white shadow-md'
            : 'glass hover:bg-[var(--border)]'
        } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {loading ? (
          <span className="inline-block w-3 h-3 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        ) : (
          <span>{isPro ? '🚀' : '🔒'}</span>
        )}
        <span>{loading ? 'Opening...' : isPro ? 'Pro' : 'Upgrade'}</span>
      </button>

      <AnimatePresence>
        {showBlocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center p-4"
            onClick={() => setShowBlocked(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="relative glass rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[var(--border)] text-center"
            >
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="text-base font-bold mb-1">Checkout Blocked</h3>
              <p className="text-xs opacity-60 mb-4 leading-relaxed">
                Your browser or an extension is blocking the payment gateway (Paddle).
              </p>
              <div className="text-[11px] opacity-50 mb-4 leading-relaxed p-3 rounded-xl bg-[var(--card2)] text-left space-y-2">
                <p><strong>Try these steps:</strong></p>
                <p>1. Disable ad-blockers (uBlock, AdBlock, Brave Shield) for this site</p>
                <p>2. Try a different browser (Chrome, Edge, Firefox)</p>
                <p>3. Disable VPN or firewall temporarily</p>
                <p className="pt-1 text-[10px] opacity-40">Then click Retry below.</p>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={handleRetry} disabled={retrying}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white hover:shadow-lg transition-all ${retrying ? 'opacity-50 pointer-events-none' : ''}`}>
                  {retrying ? 'Retrying...' : '🔄 Retry Checkout'}
                </button>
                <button onClick={() => setShowBlocked(false)}
                  className="w-full py-2 rounded-xl text-xs glass hover:bg-[var(--border)] transition-all">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
