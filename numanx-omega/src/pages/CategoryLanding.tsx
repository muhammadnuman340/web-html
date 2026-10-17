import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import SEOHead from '../components/ui/SEOHead'
import { getAllCategories } from '../engine/converter'
import { categoryContent } from '../engine/categoryContent'
import UniversalConverter from '../components/converter/UniversalConverter'
import AdSense from '../components/widgets/AdSense'
import CategoryLiveMatrix from '../components/category/CategoryLiveMatrix'
import CategoryCheatSheet from '../components/category/CategoryCheatSheet'
import CategorySpecialWidget from '../components/category/special/CategorySpecialWidget'

interface Props {
  categorySlug?: string
}

export default function CategoryLanding({ categorySlug }: Props) {
  const { category: paramCategory } = useParams<{ category: string }>()
  const category = categorySlug || paramCategory
  const content = category ? categoryContent[category] : null
  const cat = category ? getAllCategories().find(c => c.id === category) : null

  const allCats = useMemo(() => getAllCategories(), [])

  const schema = useMemo(() => {
    if (!cat || !content) return undefined
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          '@id': `https://numanx-omega.netlify.app/convert/${cat.id}#software`,
          name: `Omega ${cat.lb} Converter`,
          url: `https://numanx-omega.netlify.app/convert/${cat.id}`,
          description: content.metaDesc,
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'All',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          featureList: cat.un.map(u => u.lb),
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `https://numanx-omega.netlify.app/convert/${cat.id}#breadcrumb`,
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://numanx-omega.netlify.app/' },
            { '@type': 'ListItem', position: 2, name: 'Categories', item: 'https://numanx-omega.netlify.app/categories' },
            { '@type': 'ListItem', position: 3, name: cat.lb, item: `https://numanx-omega.netlify.app/convert/${cat.id}` },
          ],
        },
        ...(content.faq && content.faq.length > 0 ? [{
          '@type': 'FAQPage',
          '@id': `https://numanx-omega.netlify.app/convert/${cat.id}#faq`,
          mainEntity: content.faq.map(f => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.a,
            },
          })),
        }] : []),
      ],
    }
  }, [cat, content])

  if (!content || !cat) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4" role="img" aria-hidden="true">🔍</div>
        <h1 className="text-xl font-bold mb-2">Category not found</h1>
        <p className="text-sm opacity-70 mb-4">The conversion category "{category}" does not exist.</p>
        <Link to="/categories" className="text-sm text-[var(--primary)] hover:underline font-medium">Browse all categories →</Link>
      </div>
    )
  }

  const currentIndex = allCats.findIndex(c => c.id === cat.id)
  const prevCat = currentIndex > 0 ? allCats[currentIndex - 1] : allCats[allCats.length - 1]
  const nextCat = currentIndex < allCats.length - 1 ? allCats[currentIndex + 1] : allCats[0]

  return (
    <article className="space-y-6">
      <SEOHead
        title={content.title}
        description={content.metaDesc}
        path={`/convert/${category}`}
        schema={schema}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-[var(--text2)] opacity-85 flex gap-1 items-center">
        <Link to="/" className="hover:text-[var(--primary)] transition-colors">Home</Link>
        <span aria-hidden="true">/</span>
        <Link to="/categories" className="hover:text-[var(--primary)] transition-colors">Categories</Link>
        <span aria-hidden="true">/</span>
        <span className="text-[var(--primary)] font-medium">{cat.lb}</span>
      </nav>

      {/* Header */}
      <header>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl" role="img" aria-hidden="true">{cat.ic}</span>
          <h1 className="text-xl sm:text-2xl font-bold">{content.h1}</h1>
        </div>
        <p className="text-xs sm:text-sm text-[var(--text2)] opacity-85 leading-relaxed">{content.intro}</p>
      </header>

      {/* Flagship Category Interactive Widget (if available) */}
      <CategorySpecialWidget category={cat.id} />

      {/* Ad */}
      <div className="flex justify-center">
        <AdSense slot="2750064252" format="fluid" layout="in-article" />
      </div>

      {/* Embedded Primary Universal Converter */}
      <section aria-labelledby="convert-heading">
        <h2 id="convert-heading" className="text-sm font-semibold uppercase tracking-wide opacity-70 mb-2 text-[var(--text)]">
          <span aria-hidden="true">{cat.ic}</span> {cat.lb} Precision Calculator
        </h2>
        <div className="glass-liquid rounded-2xl p-4">
          <UniversalConverter category={cat.id} />
        </div>
      </section>

      {/* Live Multi-Unit Matrix (Universal across all categories) */}
      <CategoryLiveMatrix cat={cat} />

      {/* Conversion Table & Cheat Sheet */}
      <CategoryCheatSheet cat={cat} />

      {/* Popular conversion pairs */}
      <section aria-labelledby="pairs-heading">
        <h2 id="pairs-heading" className="text-sm font-semibold mb-3 text-[var(--text)]">Popular {cat.lb} Conversions</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {content.popularPairs.map(p => (
            <Link key={p.from + p.to} to={`/converter?cat=${cat.id}&from=${p.from.toLowerCase()}&to=${p.to.toLowerCase()}`}
              className="glass rounded-xl p-3 hover:shadow-md transition-all interact-lift border border-transparent hover:border-[var(--border)]">
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--text)]">
                <span>{p.from}</span>
                <span className="opacity-50" aria-hidden="true">→</span>
                <span>{p.to}</span>
              </div>
              <div className="text-xs text-[var(--text2)] opacity-75 mt-0.5">{p.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Formula */}
      {content.formula && (
        <section aria-labelledby="formula-heading" className="glass rounded-2xl p-4 border border-[var(--border)]">
          <h2 id="formula-heading" className="text-sm font-semibold mb-2 text-[var(--text)]">Conversion Formula & Ratio</h2>
          <p className="text-xs text-[var(--text2)] opacity-90 leading-relaxed font-mono">{content.formula}</p>
        </section>
      )}

      {/* Use cases */}
      <section aria-labelledby="uses-heading" className="glass rounded-2xl p-4">
        <h2 id="uses-heading" className="text-sm font-semibold mb-2 text-[var(--text)]">Common Use Cases & Applications</h2>
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {content.useCases.map(u => (
            <li key={u} className="text-xs text-[var(--text2)] opacity-85 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] flex-shrink-0" aria-hidden="true" />
              <span>{u}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Ad */}
      <div className="flex justify-center">
        <AdSense slot="6553577897" width={320} height={100} />
      </div>

      {/* Accessible Interactive FAQ Accordion */}
      {content.faq && content.faq.length > 0 && (
        <section aria-labelledby="faq-heading" className="glass rounded-2xl p-4">
          <h2 id="faq-heading" className="text-sm font-semibold mb-3 flex items-center gap-2 text-[var(--text)]">
            <span aria-hidden="true">❓</span> Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {content.faq.map((f, idx) => (
              <details key={f.q} className="group glass rounded-xl border border-[var(--border)] overflow-hidden" open={idx === 0}>
                <summary className="flex items-center justify-between p-3.5 text-xs font-semibold cursor-pointer select-none text-[var(--text)] hover:text-[var(--primary)] transition-colors list-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-2 pr-2">
                    <span className="w-5 h-5 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-[10px] font-bold flex-shrink-0" aria-hidden="true">Q</span>
                    <span>{f.q}</span>
                  </span>
                  <span className="text-xs opacity-50 group-open:rotate-180 transition-transform duration-200 flex-shrink-0" aria-hidden="true">▼</span>
                </summary>
                <div className="px-3.5 pb-3.5 pt-1 text-xs text-[var(--text2)] opacity-90 leading-relaxed border-t border-[var(--border)]/40">
                  {f.a}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Cyclical Category Navigation Strip */}
      <nav aria-label="Category pagination" className="glass rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border border-[var(--border)]">
        <Link
          to={`/convert/${prevCat.id}`}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] glass hover:bg-[var(--border)] transition-all interact-lift text-xs font-medium text-[var(--text)]"
          aria-label={`Previous category: ${prevCat.lb}`}
        >
          <span aria-hidden="true">←</span>
          <span aria-hidden="true">{prevCat.ic}</span>
          <span>{prevCat.lb}</span>
        </Link>
        <Link
          to="/categories"
          className="w-full sm:w-auto text-center px-4 py-2 text-xs font-semibold text-[var(--primary)] hover:underline"
        >
          Browse All {allCats.length} Categories
        </Link>
        <Link
          to={`/convert/${nextCat.id}`}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] glass hover:bg-[var(--border)] transition-all interact-lift text-xs font-medium text-[var(--text)]"
          aria-label={`Next category: ${nextCat.lb}`}
        >
          <span>{nextCat.lb}</span>
          <span aria-hidden="true">{nextCat.ic}</span>
          <span aria-hidden="true">→</span>
        </Link>
      </nav>

      {/* Related categories */}
      <section aria-labelledby="related-heading">
        <h2 id="related-heading" className="text-sm font-semibold mb-3 text-[var(--text)]">Related Conversion Categories</h2>
        <div className="flex gap-2 flex-wrap">
          {allCats.filter(c => c.id !== cat.id).slice(0, 10).map(c => (
            <Link key={c.id} to={`/convert/${c.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass text-xs hover:bg-[var(--border)] transition-all interact-lift border border-transparent hover:border-[var(--border)] text-[var(--text)]">
              <span aria-hidden="true">{c.ic}</span>
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
