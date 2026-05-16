import { useSearchParams } from 'react-router-dom'
import UniversalConverter from '../components/converter/UniversalConverter'
import GlassCard from '../components/ui/GlassCard'
import type { AppMode } from '../components/widgets/ModeSwitcher'

interface Props { mode?: AppMode }

export default function ConverterPage({ mode }: Props) {
  const [params] = useSearchParams()
  const cat = params.get('cat') || undefined
  const initFrom = params.get('from') || undefined
  const initTo = params.get('to') || undefined
  const initVal = params.get('val') ? parseFloat(params.get('val')!) : undefined

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">🔄 Universal Converter</h2>
      {mode === 'student' && (
        <p className="text-xs opacity-60">🎓 Student Mode · Try typing "5 km in miles" or "100 USD to EUR"</p>
      )}
      <GlassCard>
        <UniversalConverter category={cat} mode={mode} initialFrom={initFrom} initialTo={initTo} initialValue={initVal} />
      </GlassCard>
    </div>
  )
}
