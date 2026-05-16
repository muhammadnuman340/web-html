import { useCurrency } from '../hooks/useCurrency'
import CurrencyCenter from '../components/charts/CurrencyCenter'
import GlassCard from '../components/ui/GlassCard'

export default function Currency() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">💵 Currency Center</h2>
      <p className="text-xs opacity-60">Live rates via exchangerate-api · 40+ currencies · Auto-cached</p>
      <GlassCard>
        <CurrencyCenter />
      </GlassCard>
    </div>
  )
}
