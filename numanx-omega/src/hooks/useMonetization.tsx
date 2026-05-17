import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { ensurePaddle, onCheckoutCompleted } from '../engine/paddle'

interface MonetizationContextType {
  isPro: boolean
  setPro: (v: boolean) => void
  showUpgrade: (feature: string, description: string) => void
  upgradePrompt: { feature: string; description: string } | null
  clearUpgrade: () => void
  proSettingsOpen: boolean
  setProSettingsOpen: (v: boolean) => void
}

const MonetizationContext = createContext<MonetizationContextType>({
  isPro: false, setPro: () => {}, showUpgrade: () => {}, upgradePrompt: null,
  clearUpgrade: () => {}, proSettingsOpen: false, setProSettingsOpen: () => {},
})

export function useMonetization() { return useContext(MonetizationContext) }

function persistPro() {
  localStorage.setItem('omega_pro_user', 'true')
  document.body.classList.add('omega-pro-active')
  document.body.classList.remove('omega-free-active')
}

export function MonetizationProvider({ children }: { children: ReactNode }) {
  const [isPro, setProState] = useState(() => localStorage.getItem('omega_pro_user') === 'true')
  const [upgradePrompt, setUpgradePrompt] = useState<{ feature: string; description: string } | null>(null)
  const [proSettingsOpen, setProSettingsOpen] = useState(false)

  // Init: check URL params for ?payment=success (Paddle redirect fallback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('payment') === 'success') {
      persistPro()
      setProState(true)
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    // Pre-load Paddle in background so it's ready on click
    ensurePaddle()
    // Listen for checkout completed events from the Paddle overlay
    onCheckoutCompleted(() => {
      persistPro()
      setProState(true)
    })
  }, [])

  // Sync body class
  useEffect(() => {
    document.body.classList.toggle('omega-pro-active', isPro)
    document.body.classList.toggle('omega-free-active', !isPro)
  }, [isPro])

  const setPro = useCallback((v: boolean) => {
    localStorage.setItem('omega_pro_user', String(v))
    setProState(v)
  }, [])

  const showUpgrade = useCallback((feature: string, description: string) => {
    setUpgradePrompt({ feature, description })
  }, [])

  const clearUpgrade = useCallback(() => setUpgradePrompt(null), [])

  return (
    <MonetizationContext.Provider value={{
      isPro, setPro, showUpgrade, upgradePrompt, clearUpgrade, proSettingsOpen, setProSettingsOpen,
    }}>
      {children}
    </MonetizationContext.Provider>
  )
}
