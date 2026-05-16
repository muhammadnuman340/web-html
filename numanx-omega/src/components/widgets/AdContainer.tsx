import { useMonetization } from '../../hooks/useMonetization'

const CARBON_SCRIPT = '//cdn.carbonads.com/carbon.js?serve=YOUR_ZONE_ID&placement=YOUR_DOMAIN'

export default function AdContainer({ position }: { position: 'sidebar' | 'converter' }) {
  const { isPro } = useMonetization()

  if (isPro) return null

  return (
    <div className="omega-ad-wrapper" data-position={position}>
      <div className="omega-ad-inner glass rounded-xl p-3 text-center">
        <div className="text-[9px] uppercase tracking-wider opacity-30 mb-2">— Sponsored —</div>
        <div className="text-[10px] opacity-50 leading-relaxed">
          {/* Static fallback ad while Carbon loads */}
          <span className="block mb-1">⚡ Power up your workflow</span>
          <span className="block text-[9px] opacity-30">Your ad could be here — Carbon Ads</span>
        </div>
        {/* Carbon Ads integration */}
        <div id={`_carbonads_${position}`} className="mt-2" />
      </div>
    </div>
  )
}
