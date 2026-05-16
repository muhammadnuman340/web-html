import { useMonetization } from '../../hooks/useMonetization'
import { openPaddleCheckout, isPaddleReady } from '../../engine/paddle'

export default function ProBadge() {
  const { isPro, setProSettingsOpen } = useMonetization()

  const handleClick = () => {
    if (isPro) { setProSettingsOpen(true); return }
    if (isPaddleReady()) { openPaddleCheckout(); return }
    localStorage.setItem('omega_pro_user', 'true')
    window.location.reload()
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold transition-all interact-lift ${isPro ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white shadow-md' : 'glass hover:bg-[var(--border)]'}`}
    >
      <span>{isPro ? '🚀' : '🔒'}</span>
      <span>{isPro ? 'Pro' : 'Upgrade'}</span>
    </button>
  )
}
