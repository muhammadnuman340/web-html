import { Link, useSearchParams, useLocation } from 'react-router-dom'
import SEOHead from '../components/ui/SEOHead'
import CategoryConverter from '../components/converter/CategoryConverter'
import { PAGE_META } from '../config/pageMeta'
import { getAllCategories } from '../engine/converter'

export default function ConverterPage() {
  const [params] = useSearchParams()
  // /calculator renders this page too; keep its own title and canonical URL
  const route = useLocation().pathname === '/calculator' ? '/calculator' : '/converter'
  const cats = getAllCategories()
  const totalUnits = cats.reduce((a, c) => a + c.un.length, 0)

  return (
    <article className="space-y-8">
      <SEOHead {...PAGE_META[route]} path={route} />
      <div className="space-y-5">
        <header className="space-y-3">
          <h1>Universal Converter</h1>
          <p className="text-lg text-[var(--text2)]">Pick a category, then convert between any of its units. {cats.length} categories, {totalUnits} units.</p>
        </header>
        <CategoryConverter
          // Query string from search and shared links: ?cat=&from=&to=&val=
          key={params.toString()}
          initialCategory={params.get('cat') || undefined}
          initialFrom={params.get('from') || undefined}
          initialTo={params.get('to') || undefined}
          initialValue={params.get('val') || undefined}
        />
      </div>
      <p className="text-[var(--text2)] nx-prose">
        Each category also has its own page with formulas, tables and FAQs. <Link to="/categories">Browse all categories</Link>.
      </p>
    </article>
  )
}
