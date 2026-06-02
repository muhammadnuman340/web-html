import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SEOHead from '../components/ui/SEOHead'
import { guideContent } from '../engine/guideContent'
import UniversalConverter from '../components/converter/UniversalConverter'
import AdSense from '../components/widgets/AdSense'

export default function GuidePage() {
  const { slug } = useParams<{ slug: string }>()
  const content = slug ? guideContent[slug] : null

  if (!content) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🔍</div>
        <h1 className="text-xl font-bold mb-2">Guide not found</h1>
        <p className="text-sm opacity-60 mb-4">The guide "{slug}" does not exist yet.</p>
        <Link to="/" className="text-sm text-[var(--primary)] hover:underline">Go home →</Link>
      </div>
    )
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: content.h1,
    description: content.metaDesc,
    step: content.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text: s,
    })),
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faq.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <article className="space-y-6">
      <SEOHead title={content.title} description={content.metaDesc} path={`/guides/${content.slug}`} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs opacity-50 flex gap-1 flex-wrap">
        <Link to="/" className="hover:text-[var(--primary)]">Home</Link>
        <span>/</span>
        <Link to="/converter" className="hover:text-[var(--primary)]">Converter</Link>
        <span>/</span>
        <Link to={`/convert/${content.relatedCat}`} className="hover:text-[var(--primary)]">
          {content.relatedCat.charAt(0).toUpperCase() + content.relatedCat.slice(1)}
        </Link>
        <span>/</span>
        <span className="text-[var(--primary)]">{content.slug}</span>
      </nav>

      {/* Header */}
      <header>
        <h1 className="text-xl sm:text-2xl font-bold">{content.h1}</h1>
        <p className="text-xs sm:text-sm opacity-60 leading-relaxed mt-2">{content.intro}</p>
      </header>

      {/* Embedded converter */}
      <section aria-labelledby="convert-heading">
        <h2 id="convert-heading" className="sr-only">Try the converter</h2>
        <div className="glass-liquid rounded-2xl p-4">
          <UniversalConverter category={content.relatedCat} />
        </div>
      </section>

      {/* Ad */}
      <div className="flex justify-center">
        <AdSense slot="2750064252" format="fluid" layout="in-article" />
      </div>

      {/* Formula */}
      <section aria-labelledby="formula-heading" className="glass rounded-2xl p-4">
        <h2 id="formula-heading" className="text-sm font-semibold mb-2">Conversion Formula</h2>
        <div className="bg-[var(--bg)] rounded-lg p-3 font-mono text-sm text-center">{content.formula}</div>
        <ol className="mt-3 space-y-1.5">
          {content.steps.map((s, i) => (
            <li key={i} className="text-xs opacity-70 flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Conversion table */}
      <section aria-labelledby="table-heading" className="glass rounded-2xl p-4">
        <h2 id="table-heading" className="text-sm font-semibold mb-3">Quick Conversion Table</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 font-medium">Value</th>
                <th className="text-left py-2 font-medium">Exact</th>
                <th className="text-left py-2 font-medium">Rounded</th>
              </tr>
            </thead>
            <tbody>
              {content.table.map(row => (
                <tr key={row.from} className="border-b border-[var(--border)]/50 hover:bg-[var(--border)]/30 transition-colors">
                  <td className="py-1.5 font-medium">{row.from}</td>
                  <td className="py-1.5 opacity-70">{row.to}</td>
                  <td className="py-1.5 opacity-50">{row.rounded}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Real-world examples */}
      <section aria-labelledby="examples-heading" className="glass rounded-2xl p-4">
        <h2 id="examples-heading" className="text-sm font-semibold mb-3">Real-World Examples</h2>
        <ul className="space-y-2">
          {content.examples.map(ex => (
            <li key={ex} className="text-xs opacity-70 flex items-start gap-2">
              <span className="text-[var(--primary)] mt-0.5">•</span>
              <span>{ex}</span>
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

      {/* Related guides */}
      <section aria-labelledby="related-heading">
        <h2 id="related-heading" className="text-sm font-semibold mb-3">Related Guides</h2>
        <div className="flex gap-2 flex-wrap">
          {content.relatedGuides.map(g => (
            <Link key={g.slug} to={`/guides/${g.slug}`}
              className="px-3 py-1.5 rounded-xl glass text-xs hover:bg-[var(--border)] transition-all interact-lift">
              {g.label} →
            </Link>
          ))}
          <Link to={`/convert/${content.relatedCat}`}
            className="px-3 py-1.5 rounded-xl glass text-xs hover:bg-[var(--border)] transition-all interact-lift">
            All {content.relatedCat} converters →
          </Link>
        </div>
      </section>

      {/* Matched content */}
      <div className="pt-2">
        <AdSense slot="9262290267" format="autorelaxed" />
      </div>
    </article>
  )
}
