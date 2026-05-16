import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { ensurePaddle } from '../engine/paddle'

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
  isPro: false, setPro: () => {}, showUpgrade: () => {}, upgradePrompt: null, clearUpgrade: () => {}, proSettingsOpen: false, setProSettingsOpen: () => {},
})

export function useMonetization() { return useContext(MonetizationContext) }

export function MonetizationProvider({ children }: { children: ReactNode }) {
  const [isPro, setProState] = useState(() => localStorage.getItem('omega_pro_user') === 'true')
  const [upgradePrompt, setUpgradePrompt] = useState<{ feature: string; description: string } | null>(null)
  const [proSettingsOpen, setProSettingsOpen] = useState(false)

  // Init: check URL params for /?payment=success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('payment') === 'success') {
      localStorage.setItem('omega_pro_user', 'true')
      setProState(true)
      window.history.replaceState({}, document.title, window.location.pathname)
      alert('🚀 Success! Welcome to Omega X Pro. All premium conversion features and chains are now unlocked.')
      window.location.reload()
    }
    // Pre-load Paddle in background so it's ready on click
    ensurePaddle()
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
