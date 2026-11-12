import { useSearchParams, useLocation } from 'react-router-dom'
import UniversalConverter from '../components/converter/UniversalConverter'
import SEOHead from '../components/ui/SEOHead'
import { PAGE_META } from '../config/pageMeta'
import type { AppMode } from '../components/widgets/ModeSwitcher'

interface Props { mode?: AppMode }

export default function ConverterPage({ mode }: Props) {
  const [params] = useSearchParams()
  // /calculator renders this page too; keep its own title and canonical URL
  const route = useLocation().pathname === '/calculator' ? '/calculator' : '/converter'
  const cat = params.get('cat') || undefined
  const initFrom = params.get('from') || undefined
  const initTo = params.get('to') || undefined
  const initVal = params.get('val') ? parseFloat(params.get('val')!) : undefined

  return (
    <article className="space-y-3 max-w-6xl mx-auto w-full min-w-0">
      <SEOHead {...PAGE_META[route]} path={route} />
      <header className="flex flex-wrap items-center justify-between gap-2 pb-0.5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text)] flex items-center gap-2">
            <span aria-hidden="true" className="text-[var(--accent)] font-mono text-base px-2 py-0.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border-subtle)]">NΩ</span> Universal Converter
          </h1>
          <p className="text-xs text-[var(--text2)]">Precision metrology workbench · 36 scientific & engineering categories</p>
        </div>
        {mode === 'student' && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--surface-3)] border border-[var(--border-control)] text-[var(--link-text)] font-medium">
            🎓 Student Mode Active
          </span>
        )}
      </header>
      <div className="w-full min-w-0">
        <UniversalConverter
          variant="workbench"
          category={cat}
          mode={mode}
          initialFrom={initFrom}
          initialTo={initTo}
          initialValue={initVal}
        />
      </div>
    </article>
  )
}

