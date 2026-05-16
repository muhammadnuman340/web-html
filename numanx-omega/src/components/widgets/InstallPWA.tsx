import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [show, setShow] = useState(false)

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
    if (result.outcome === 'accepted') setShow(false)
    setDeferredPrompt(null)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 lg:bottom-6 left-4 right-4 z-50 max-w-sm mx-auto"
        >
          <div className="glass rounded-2xl p-4 flex items-center gap-3 shadow-2xl border border-[var(--border)]">
            <span className="text-3xl">📲</span>
            <div className="flex-1">
              <div className="text-sm font-semibold">Install NX-COS</div>
              <div className="text-[11px] opacity-50">Works offline, like a real OS</div>
            </div>
            <button onClick={install}
              className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs interact-lift">Install</button>
            <button onClick={() => setShow(false)}
              className="text-xs opacity-30 hover:opacity-100 p-1">✕</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
