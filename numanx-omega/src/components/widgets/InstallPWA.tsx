import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setTimeout(() => setShow(true), 5000)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice
    if (result.outcome === 'accepted') { setShow(false); setDismissed(true) }
    setDeferredPrompt(null)
  }

  return (
    <AnimatePresence>
      {show && !dismissed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-3 border border-[var(--border)] mx-4 max-w-4xl mx-auto mb-2">
            <span className="text-lg">📲</span>
            <span className="text-xs flex-1">Install <strong>NX-COS</strong> for offline access</span>
            <button onClick={install}
              className="px-3 py-1 rounded-lg text-xs bg-[var(--primary)] text-white interact-lift font-medium">Install</button>
            <button onClick={() => setDismissed(true)}
              className="text-xs opacity-30 hover:opacity-100 p-1 interact-lift">✕</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
