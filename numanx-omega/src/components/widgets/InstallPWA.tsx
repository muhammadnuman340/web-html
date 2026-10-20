import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    )
  })

  useEffect(() => {
    if (dismissed) return

    let timerId: ReturnType<typeof setTimeout> | undefined

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      timerId = setTimeout(() => setShow(true), 5000)
    }

    const appInstalledHandler = () => {
      setShow(false)
      setDismissed(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', appInstalledHandler)

    return () => {
      if (timerId) clearTimeout(timerId)
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', appInstalledHandler)
    }
  }, [dismissed])

  const install = async () => {
    if (!deferredPrompt) return
    try {
      await deferredPrompt.prompt()
      const result = await deferredPrompt.userChoice
      if (result.outcome === 'accepted') {
        setShow(false)
        setDismissed(true)
      }
    } catch (err) {
      console.warn('PWA install prompt failed:', err)
    } finally {
      setDeferredPrompt(null)
    }
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
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--primary)] text-white shadow-sm hover:brightness-110 interact-lift">Install</button>
            <button onClick={() => setDismissed(true)}
              className="w-6 h-6 flex items-center justify-center rounded-lg text-xs opacity-75 hover:opacity-100 hover:bg-[var(--border)] text-[var(--text)] transition-all interact-lift" aria-label="Dismiss install prompt">✕</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
