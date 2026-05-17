import { useCurrency } from '../hooks/useCurrency'
import CurrencyCenter from '../components/charts/CurrencyCenter'
import GlassCard from '../components/ui/GlassCard'
import SEOHead from '../components/ui/SEOHead'

export default function Currency() {
  return (
    <div className="space-y-4">
      <SEOHead title="Currency Converter — Live Exchange Rates" description="Free live currency converter with real-time exchange rates for 40+ world currencies. Convert USD, EUR, GBP, JPY and more. Auto-updates every 60 seconds." path="/currency" />
      <h2 className="text-lg font-bold">💵 Currency Center</h2>
      <p className="text-xs opacity-60">Live rates via exchangerate-api · 40+ currencies · Auto-cached</p>
      <GlassCard>
        <CurrencyCenter />
      </GlassCard>
    </div>
  )
}
