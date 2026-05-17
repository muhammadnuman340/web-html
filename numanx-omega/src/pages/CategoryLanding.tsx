import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SEOHead from '../components/ui/SEOHead'
import { getAllCategories } from '../engine/converter'
import { categoryContent } from '../engine/categoryContent'
import UniversalConverter from '../components/converter/UniversalConverter'
import AdSense from '../components/widgets/AdSense'

export default function CategoryLanding() {
  const { category } = useParams<{ category: string }>()
  const content = category ? categoryContent[category] : null
  const cat = category ? getAllCategories().find(c => c.id === category) : null

  if (!content || !cat) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🔍</div>
        <h1 className="text-xl font-bold mb-2">Category not found</h1>
        <p className="text-sm opacity-60 mb-4">The conversion category "{category}" does not exist.</p>
        <Link to="/categories" className="text-sm text-[var(--primary)] hover:underline">Browse all categories →</Link>
      </div>
    )
  }

  const allCats = getAllCategories()

  return (
    <article className="space-y-6">
      <SEOHead title={content.title} description={content.metaDesc} path={`/convert/${category}`} />
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs opacity-50 flex gap-1">
        <Link to="/" className="hover:text-[var(--primary)]">Home</Link>
        <span>/</span>
        <Link to="/converter" className="hover:text-[var(--primary)]">Converter</Link>
        <span>/</span>
        <span className="text-[var(--primary)]">{cat.lb}</span>
      </nav>

      {/* Header */}
      <header>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl" role="img" aria-hidden="true">{cat.ic}</span>
          <h1 className="text-xl sm:text-2xl font-bold">{content.h1}</h1>
        </div>
        <p className="text-xs sm:text-sm opacity-60 leading-relaxed">{content.intro}</p>
      </header>

      {/* Ad */}
      <div className="flex justify-center">
        <AdSense slot="2750064252" format="fluid" layout="in-article" />
      </div>

      {/* Embedded converter */}
      <section aria-labelledby="convert-heading">
        <h2 id="convert-heading" className="text-sm font-semibold uppercase tracking-wide opacity-60 mb-2">
          {cat.ic} {cat.lb} Converter
        </h2>
        <div className="glass-liquid rounded-2xl p-4">
          <UniversalConverter category={cat.id} />
        </div>
      </section>

      {/* Popular conversion pairs */}
      <section aria-labelledby="pairs-heading">
        <h2 id="pairs-heading" className="text-sm font-semibold mb-3">Popular {cat.lb} Conversions</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {content.popularPairs.map(p => (
            <Link key={p.from + p.to} to={`/converter?cat=${cat.id}&from=${p.from.toLowerCase()}&to=${p.to.toLowerCase()}`}
              className="glass rounded-xl p-3 hover:shadow-md transition-all interact-lift">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span>{p.from}</span>
                <span className="opacity-40">→</span>
                <span>{p.to}</span>
              </div>
              <div className="text-xs opacity-50 mt-0.5">{p.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Formula */}
      {content.formula && (
        <section aria-labelledby="formula-heading" className="glass rounded-2xl p-4">
          <h2 id="formula-heading" className="text-sm font-semibold mb-2">Conversion Formula</h2>
          <p className="text-xs opacity-70 leading-relaxed font-mono">{content.formula}</p>
        </section>
      )}

      {/* Use cases */}
      <section aria-labelledby="uses-heading" className="glass rounded-2xl p-4">
        <h2 id="uses-heading" className="text-sm font-semibold mb-2">Common Use Cases</h2>
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {content.useCases.map(u => (
            <li key={u} className="text-xs opacity-70 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] flex-shrink-0" />
              {u}
            </li>
          ))}
        </ul>
      </section>

      {/* Ad */}
      <div className="flex justify-center">
        <AdSense slot="6553577897" width={320} height={100} />
      </div>

      {/* FAQ */}
      <section aria-labelledby="faq-heading" className="glass rounded-2xl p-4">
        <h2 id="faq-heading" className="text-sm font-semibold mb-3">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {content.faq.map(f => (
            <div key={f.q}>
              <h3 className="text-xs font-medium mb-1">{f.q}</h3>
              <p className="text-xs opacity-60 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related categories */}
      <section aria-labelledby="related-heading">
        <h2 id="related-heading" className="text-sm font-semibold mb-3">Related Conversion Categories</h2>
        <div className="flex gap-2 flex-wrap">
          {allCats.filter(c => c.id !== cat.id).slice(0, 8).map(c => (
            <Link key={c.id} to={`/convert/${c.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass text-xs hover:bg-[var(--border)] transition-all interact-lift">
              <span>{c.ic}</span>
              <span>{c.lb}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Matched content */}
      <div className="pt-2">
        <AdSense slot="9262290267" format="autorelaxed" />
      </div>
    </article>
  )
}
