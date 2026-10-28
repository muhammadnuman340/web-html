import { useParams, Link } from 'react-router-dom'
import SEOHead from '../components/ui/SEOHead'
import { guideContent } from '../engine/guideContent'
import UniversalConverter from '../components/converter/UniversalConverter'
import { buildGuideSchema } from '../config/schema'
import { getGuideRelationship } from '../config/guideRelations'
import { BLOG_POSTS } from '../data/blogPosts'

export default function GuidePage() {
  const { slug } = useParams<{ slug: string }>()
  const content = slug ? guideContent[slug] : null
  const rel = slug ? getGuideRelationship(slug) : undefined
  const relatedPosts = (rel && rel.relatedPostSlugs.length)
    ? BLOG_POSTS.filter(p => rel.relatedPostSlugs.includes(p.slug))
    : []

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

  const guideSchema = buildGuideSchema(content)

  return (
    <article className="space-y-6">
      <SEOHead
        title={content.title}
        description={content.metaDesc}
        path={`/guides/${content.slug}`}
        schema={guideSchema}
      />

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

      {/* Formula */}
      <section aria-labelledby="formula-heading" className="glass rounded-2xl p-4">
        <h2 id="formula-heading" className="text-sm font-semibold mb-2">Conversion Formula</h2>
        <div className="bg-[var(--bg)] rounded-lg p-3 font-mono text-sm text-center">{content.formula}</div>
        <ol className="mt-3 space-y-1.5">
          {content.steps.map((s, i) => (
            <li key={i} className="text-xs opacity-70 flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
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
            <caption className="sr-only">{content.h1} Quick Conversion Table</caption>
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th scope="col" className="text-left py-2 font-medium">Value</th>
                <th scope="col" className="text-left py-2 font-medium">Exact</th>
                <th scope="col" className="text-left py-2 font-medium">Rounded</th>
              </tr>
            </thead>
            <tbody>
              {content.table.map(row => (
                <tr key={row.from} className="border-b border-[var(--border)]/50 hover:bg-[var(--border)]/30 transition-colors">
                  <th scope="row" className="py-1.5 font-medium text-left font-normal">{row.from}</th>
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
      {/* Interactive Pair Converter & Category Directory */}
      {rel && (
        <section aria-labelledby="interactive-pair-heading" className="glass rounded-2xl p-4 border border-[var(--border)]">
          <h2 id="interactive-pair-heading" className="text-sm font-semibold mb-3">Interactive Pair Converter & Category Directory</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to={rel.pairPath}
              className="p-3.5 rounded-xl bg-[var(--card)] hover:bg-[var(--border)] border border-[var(--border)] transition-colors group flex flex-col justify-between"
            >
              <div>
                <div className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors flex items-center justify-between">
                  <span>Convert {rel.title} Interactively</span>
                  <span aria-hidden="true">&rarr;</span>
                </div>
                <div className="text-[11px] opacity-60 mt-1">
                  Open the full two-way interactive converter with real-time calculations and copyable results.
                </div>
              </div>
              <div className="text-[11px] text-[var(--primary)] font-medium mt-2">
                Launch interactive pair tool &rarr;
              </div>
            </Link>
            <Link
              to={rel.categoryPath}
              className="p-3.5 rounded-xl bg-[var(--card)] hover:bg-[var(--border)] border border-[var(--border)] transition-colors group flex flex-col justify-between"
            >
              <div>
                <div className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors flex items-center justify-between">
                  <span>Explore All {rel.categoryName} Conversions</span>
                  <span aria-hidden="true">&rarr;</span>
                </div>
                <div className="text-[11px] opacity-60 mt-1">
                  Browse the comprehensive directory of all units, reference charts, and live matrices in {rel.categoryName.toLowerCase()}.
                </div>
              </div>
              <div className="text-[11px] text-[var(--primary)] font-medium mt-2">
                View {rel.categoryName} directory &rarr;
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Related Technical Articles */}
      {relatedPosts.length > 0 && (
        <section aria-labelledby="related-articles-heading" className="glass rounded-2xl p-4 border border-[var(--border)]">
          <h2 id="related-articles-heading" className="text-sm font-semibold mb-3">Related Technical Articles</h2>
          <div className="space-y-2">
            {relatedPosts.map(post => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="block p-3 rounded-xl bg-[var(--card)] hover:bg-[var(--border)] border border-[var(--border)] transition-colors group"
              >
                <div className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors flex items-center justify-between">
                  <span>{post.title}</span>
                  <span aria-hidden="true">&rarr;</span>
                </div>
                <div className="text-[11px] opacity-60 mt-0.5 line-clamp-1">
                  {post.excerpt}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      {/* Standards & Metrological Grounding */}
      <section aria-labelledby="standards-grounding-heading" className="glass rounded-2xl p-4 border border-[var(--border)] text-xs text-[var(--text2)] space-y-1.5">
        <div className="flex items-center gap-2 font-semibold text-[var(--text)]">
          <span aria-hidden="true">🏛️</span>
          <span id="standards-grounding-heading">Standards Reference & Metrological Grounding</span>
        </div>
        <p className="leading-relaxed text-[11px]">
          Calculations and conversion factors in this guide adhere to NIST Special Publication 811 and BIPM SI brochure definitions. Review our complete <Link to="/about" className="text-[var(--primary)] underline hover:opacity-80">institutional standards and sources directory</Link>.
        </p>
      </section>
    </article>
  )
}
