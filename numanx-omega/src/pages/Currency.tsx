import CurrencyCenter from '../components/charts/CurrencyCenter'
import GlassCard from '../components/ui/GlassCard'
import SEOHead from '../components/ui/SEOHead'
import { PAGE_META } from '../config/pageMeta'
import Disclaimer from '../components/ui/Disclaimer'

export default function Currency() {
  return (
    <div className="space-y-4">
      <SEOHead {...PAGE_META['/currency']} path="/currency" />
      <h1 className="text-lg font-bold"><span aria-hidden="true">💵</span> Currency Center</h1>
      <p className="text-xs opacity-60">Live rates via exchangerate-api · 40+ currencies · Auto-cached</p>
      <GlassCard>
        <CurrencyCenter />
      </GlassCard>
      <Disclaimer kind="finance" />
    </div>
  )
}
