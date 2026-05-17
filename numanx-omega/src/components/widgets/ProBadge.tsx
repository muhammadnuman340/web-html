import { useState } from 'react'
import { useMonetization } from '../../hooks/useMonetization'
import { openPaddleCheckout } from '../../engine/paddle'

export default function ProBadge() {
  const { isPro, setProSettingsOpen, setPro } = useMonetization()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (isPro) { setProSettingsOpen(true); return }
    setLoading(true)
    const paid = await openPaddleCheckout()
    setLoading(false)
    if (paid) {
      setPro(true)
    }
  }

  return (
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
      <span>{loading ? 'Loading...' : isPro ? 'Pro' : 'Upgrade'}</span>
    </button>
  )
}
