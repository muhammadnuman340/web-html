// Canonical entity: Omega X Converter · NumanX Studio
/**
 * Category page: title, one-line intro, then a grid of conversions.
 * Everything else (a free converter, background, units, FAQ) sits below the grid.
 */
import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import SEOHead from '../components/ui/SEOHead'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import ConverterCard from '../components/converter/ConverterCard'
import CategoryTool from '../components/category/CategoryTool'
import { getAllCategories } from '../engine/converter'
import { categoryContent } from '../engine/categoryContent'
import { getCategoryStandards } from '../engine/categoryStandards'
import { getRelatedCategoryIds } from '../config/relatedCategories'
import { resolveCategoryId } from '../engine/routes'
import { buildCategorySchema } from '../config/schema'
import { getGuidesForCategory } from '../config/guideRelations'
import { getCategoryAuthoritySources } from '../config/authoritySources'
import { cleanSlug } from '../utils/slug'
import { unitSymbol } from '../engine/unitSymbols'
import { SystemLabels, type CategoryDef } from '../types'

interface Props {
  categorySlug?: string
}

const sectionTitle = 'text-xl sm:text-2xl'

/** First sentence of the intro, for the one-line summary under the title. */
function firstSentence(text: string): string {
  const match = text.match(/^.*?[.!?](?=\s|$)/)
  return match ? match[0] : text
}

export default function CategoryLanding({ categorySlug }: Props) {
  const { category: paramCategory } = useParams<{ category: string }>()
  const rawCategory = categorySlug || paramCategory
  const category = rawCategory ? (resolveCategoryId(rawCategory) || rawCategory.toLowerCase()) : undefined
  const content = category ? categoryContent[category] : null
  const allCats = useMemo(() => getAllCategories(), [])
  const cat = category ? allCats.find(c => c.id === category) : undefined

  const categoryGuides = useMemo(() => (cat ? getGuidesForCategory(cat.id) : []), [cat])
  const stdInfo = useMemo(() => (cat ? getCategoryStandards(cat.id, cat.lb, cat.un.map(u => u.lb)) : null), [cat])
  const catAuthSources = useMemo(() => (cat ? getCategoryAuthoritySources(cat.id) : []), [cat])

  const pageTitle = cat ? (content?.title || `${cat.lb} Converter | Omega X`) : ''
  const pageDesc = cat ? (content?.metaDesc || `${cat.lb} converter with NIST/BIPM standards.`) : ''

  const categorySchema = useMemo(() => {
    if (!cat) return null
    return buildCategorySchema(cat, { title: pageTitle, metaDesc: pageDesc, faq: content?.faq })
  }, [cat, content, pageTitle, pageDesc])

  if (!content || !cat) {
    return (
      <div className="text-center py-16 space-y-4">
        <SEOHead
          title="Category Not Found — Omega X"
          description={`The conversion category "${category || ''}" does not exist.`}
          path={`/convert/${category || ''}`}
          noindex={true}
        />
        <h1>Category not found</h1>
        <p className="text-[var(--text2)] max-w-md mx-auto">
          The conversion category &ldquo;{category}&rdquo; does not exist.
        </p>
        <Link to="/categories" className="btn-primary">Browse all categories</Link>
      </div>
    )
  }

  const related = getRelatedCategoryIds(cat.id)
    .map(id => allCats.find(c => c.id === id))
    .filter((c): c is CategoryDef => Boolean(c))

  return (
    <article className="space-y-10 sm:space-y-12">
      <SEOHead title={pageTitle} description={pageDesc} path={`/convert/${cat.id}`} schema={categorySchema as Record<string, unknown>} />

      {/* Title, one line, grid. Nothing else above the grid. */}
      <div className="space-y-6">
        <header className="space-y-3">
          <h1>{content.h1}</h1>
          <p className="text-lg text-[var(--text2)] max-w-3xl">{firstSentence(content.intro)}</p>
        </header>

        <section aria-label={`${cat.lb} conversions`}>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {content.popularPairs.map(p => (
              <li key={`${p.from}-${p.to}`}>
                <Link
                  to={`/convert/${cat.id}/${cleanSlug(p.from)}-to-${cleanSlug(p.to)}`}
                  className="nx-card-link block h-full p-4 min-h-[44px]"
                >
                  <span className="block font-semibold text-[var(--text)]">{p.from} to {p.to}</span>
                  <span className="block mt-1 text-[15px] text-[var(--text2)] line-clamp-2">{p.desc}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Any-unit converter for this category */}
      {cat.un.length > 1 && (
        <section aria-labelledby="any-unit-heading" className="space-y-4">
          <h2 id="any-unit-heading" className={sectionTitle}>Convert any {cat.lb.toLowerCase()} unit</h2>
          <ConverterCard cat={cat} fromId={cat.un[0].id} toId={cat.un[1].id} title={`${cat.lb} converter`} />
        </section>
      )}

      <CategoryTool category={cat.id} />

      {/* Background */}
      <section aria-labelledby="about-heading" className="space-y-4 max-w-3xl">
        <h2 id="about-heading" className={sectionTitle}>About {cat.lb.toLowerCase()} units</h2>
        <p className="text-[var(--text)]">{content.intro}</p>
        {content.formula && (
          <p className="nx-card px-4 py-3 font-mono text-[15px] break-words">{content.formula}</p>
        )}
        {content.useCases && content.useCases.length > 0 && (
          <ul className="list-disc pl-5 space-y-1 text-[var(--text2)]">
            {content.useCases.map(u => <li key={u}>{u}</li>)}
          </ul>
        )}
        {stdInfo && <p className="text-[var(--text2)]">{stdInfo.standardsStatement}</p>}
        {catAuthSources.length > 0 && (
          <p className="text-sm text-[var(--text2)] nx-prose">
            Sources:{' '}
            {catAuthSources.map((src, i) => (
              <span key={src.id}>
                {i > 0 && ' · '}
                <a href={src.url} target="_blank" rel="noopener noreferrer">{src.documentRef}</a>
              </span>
            ))}
            {' · '}<Link to="/about">All standards</Link>
          </p>
        )}
      </section>

      {/* Units */}
      <section aria-labelledby="units-heading" className="space-y-4">
        <h2 id="units-heading" className={sectionTitle}>All {cat.un.length} {cat.lb.toLowerCase()} units</h2>
        <div className="overflow-x-auto nx-card">
          <table className="w-full min-w-[420px] text-left text-[15px] border-collapse">
            <thead className="bg-[var(--card2)] border-b border-[var(--border)]">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Unit</th>
                <th scope="col" className="px-4 py-3 font-semibold">Symbol</th>
                <th scope="col" className="px-4 py-3 font-semibold">System</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {cat.un.map(u => (
                <tr key={u.id}>
                  <td className="px-4 py-2.5">{u.lb}</td>
                  <td className="px-4 py-2.5 font-mono">{unitSymbol(u, cat.id)}</td>
                  <td className="px-4 py-2.5 text-[var(--text2)]">{u.s ? SystemLabels[u.s] : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {categoryGuides.length > 0 && (
        <section aria-labelledby="guides-heading" className="space-y-4">
          <h2 id="guides-heading" className={sectionTitle}>Guides</h2>
          <ul className="flex flex-wrap gap-2">
            {categoryGuides.map(g => (
              <li key={g.guideSlug}>
                <Link to={`/guides/${g.guideSlug}`} className="nx-chip">{g.title} guide</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {content.faq && content.faq.length > 0 && (
        <section aria-labelledby="faq-heading" className="space-y-4">
          <h2 id="faq-heading" className={sectionTitle}>Frequently asked questions</h2>
          <div className="nx-card divide-y divide-[var(--border)]">
            {content.faq.map(f => (
              <details key={f.q} className="group">
                <summary className="flex items-center justify-between gap-3 px-4 py-3.5 min-h-[44px] cursor-pointer font-semibold list-none [&::-webkit-details-marker]:hidden">
                  <span>{f.q}</span>
                  <ChevronDown size={18} className="shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="px-4 pb-4 text-[var(--text2)]">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="space-y-4">
          <h2 id="related-heading" className={sectionTitle}>Related converters</h2>
          <ul className="flex flex-wrap gap-2">
            {related.map(c => (
              <li key={c.id}><Link to={`/convert/${c.id}`} className="nx-chip">{c.lb}</Link></li>
            ))}
          </ul>
        </section>
      )}

      <Breadcrumbs items={[{ label: 'Categories', path: '/categories' }, { label: cat.lb }]} />
    </article>
  )
}
