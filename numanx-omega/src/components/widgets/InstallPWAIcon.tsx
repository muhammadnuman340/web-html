import { useState, useEffect } from 'react'

export default function InstallPWAIcon() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [available, setAvailable] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setAvailable(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice
    if (result.outcome === 'accepted') setAvailable(false)
    setDeferredPrompt(null)
  }

  if (!available) return null

  return (
    <button onClick={install}
      className="p-1.5 rounded-xl hover:bg-[var(--border)] text-xs transition-all interact-lift"
      data-tooltip="Install NX-COS (offline)">
      📲
    </button>
  )
}
