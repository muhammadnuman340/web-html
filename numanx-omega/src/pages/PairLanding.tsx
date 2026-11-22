import { useMemo } from 'react'
import { useParams, useSearchParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeftRight, ChevronDown } from 'lucide-react'
import SEOHead from '../components/ui/SEOHead'
import ConverterCard from '../components/converter/ConverterCard'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import { getAllCategories, convert } from '../engine/converter'
import { fmt } from '../utils/numbers'
import { resolveCategoryId } from '../engine/routes'
import { buildPairSchema } from '../config/schema'
import { parsePairQueryVal } from '../config/guideRelations'
import { findUnit, getPairEditorial, isCanonicalPair, cleanSlug } from '../config/pairEditorial'
import { categoryContent } from '../engine/categoryContent'
import { getRelatedCategoryIds } from '../config/relatedCategories'
import { unitSymbol, unitName, unitLabel, pairTitle, pairMetaDescription } from '../engine/unitSymbols'
import type { CategoryDef } from '../types'

// Common values shown in the reference table
const TABLE_VALUES = [1, 2, 3, 5, 10, 15, 20, 25, 50, 75, 100, 250, 500, 1000]

/** URL for a unit pair: the canonical slug when one exists, otherwise the id-based slug. */
function pairPath(cat: CategoryDef, fromId: string, toId: string): string {
  const canonical = (categoryContent[cat.id]?.popularPairs ?? []).find(
    p => findUnit(cat, cleanSlug(p.from))?.id === fromId && findUnit(cat, cleanSlug(p.to))?.id === toId,
  )
  const slug = canonical
    ? `${cleanSlug(canonical.from)}-to-${cleanSlug(canonical.to)}`
    : `${fromId.toLowerCase()}-to-${toId.toLowerCase()}`
  return `/convert/${cat.id}/${slug}`
}

const sectionTitle = 'text-xl sm:text-2xl'

function PairLandingInner({
  catParam,
  pairParam,
  initialVal,
}: {
  catParam?: string
  pairParam: string
  initialVal: string
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const allCats = useMemo(() => getAllCategories(), [])

  // Parse pair: "kg-to-lbs" -> from: "kg", to: "lbs"
  const { fromSlug, toSlug } = useMemo(() => {
    const parts = pairParam.toLowerCase().split('-to-')
    return parts.length === 2 ? { fromSlug: parts[0], toSlug: parts[1] } : { fromSlug: '', toSlug: '' }
  }, [pairParam])

  // Resolve category and units
  const resolution = (() => {
    if (!fromSlug || !toSlug) return null
    if (catParam) {
      const resolvedCatId = resolveCategoryId(catParam) || catParam.toLowerCase()
      const cat = allCats.find(c => c.id.toLowerCase() === resolvedCatId)
      if (cat) {
        const u1 = findUnit(cat, fromSlug)
        const u2 = findUnit(cat, toSlug)
        if (u1 && u2) return { cat, u1, u2 }
      }
    }
    for (const cat of allCats) {
      const u1 = findUnit(cat, fromSlug)
      const u2 = findUnit(cat, toSlug)
      if (u1 && u2) return { cat, u1, u2 }
    }
    return null
  })()

  const cat = resolution?.cat
  const u1 = resolution?.u1
  const u2 = resolution?.u2

  const unitRatio = resolution ? convert(1, resolution.cat.id, resolution.u1.id, resolution.u2.id) : null
  const inverseUnitRatio = resolution ? convert(1, resolution.cat.id, resolution.u2.id, resolution.u1.id) : null

  const editorial = useMemo(() => {
    if (!cat || !u1 || !u2) return null
    return getPairEditorial(cat, u1, u2, pairParam)
  }, [cat, u1, u2, pairParam])

  const schema = useMemo(() => {
    if (!cat || !u1 || !u2) return null
    return buildPairSchema(cat, u1, u2, unitRatio, inverseUnitRatio, pairParam, editorial?.faqs, editorial?.directAnswer.summary)
  }, [cat, u1, u2, pairParam, unitRatio, inverseUnitRatio, editorial])

  if (!resolution || !cat || !u1 || !u2) {
    return (
      <div className="text-center py-16 space-y-4">
        <SEOHead
          title="Conversion Pair Not Found — Omega X"
          description={`The requested conversion pair "${pairParam || ''}" could not be resolved. Browse all unit categories.`}
          path={location.pathname}
          noindex={true}
        />
        <h1>Conversion pair not found</h1>
        <p className="text-[var(--text2)] max-w-md mx-auto">
          We couldn't resolve the pair "{pairParam}". Pick a category to find your units.
        </p>
        <Link to="/categories" className="btn-primary">Browse all categories</Link>
      </div>
    )
  }

  const name1 = unitName(u1, cat.id)
  const name2 = unitName(u2, cat.id)
  const sym1 = unitSymbol(u1, cat.id)
  const sym2 = unitSymbol(u2, cat.id)
  const pageTitle = pairTitle(u1, u2, cat.id)
  const isCanonical = isCanonicalPair(cat.id, pairParam.toLowerCase())
  const metaDescription = editorial ? pairMetaDescription(u1, u2, cat.id, editorial.directAnswer.summary) : ''

  const relatedPairs = (categoryContent[cat.id]?.popularPairs ?? [])
    .map(p => ({ ...p, slug: `${cleanSlug(p.from)}-to-${cleanSlug(p.to)}` }))
    .filter(p => p.slug !== pairParam && `/convert/${cat.id}/${p.slug}` !== editorial?.reciprocal.url)
  const relatedCats = getRelatedCategoryIds(cat.id)
    .map(id => allCats.find(c => c.id === id))
    .filter((c): c is CategoryDef => c !== undefined)

  const tenResult = convert(10, cat.id, u1.id, u2.id)
  const example = editorial?.workedExamples?.[0]
    ?? `10 ${sym1} = ${fmt(tenResult, 6)} ${sym2}`

  const handleUnitsChange = (from: string, to: string, value: string) => {
    const query = value && value !== '1' ? `?val=${encodeURIComponent(value)}` : ''
    // Reverse of this page: prefer the dedicated reverse page when there is one
    if (from === u2.id && to === u1.id && editorial?.reciprocal.hasCanonicalPair) {
      navigate(`${editorial.reciprocal.url}${query}`)
      return
    }
    navigate(`${pairPath(cat, from, to)}${query}`)
  }

  return (
    <article className="space-y-10 sm:space-y-12">
      <SEOHead
        title={pageTitle}
        description={metaDescription}
        path={`/convert/${cat.id}/${pairParam}`}
        // Only the canonical pairs are indexable; other unit combinations still work for visitors
        noindex={!isCanonical}
        schema={schema as Record<string, unknown>}
      />

      {/* First screen: H1, converter, answer line */}
      <div className="space-y-5">
        <h1>Convert {name1} to {name2}</h1>
        <ConverterCard
          cat={cat}
          fromId={u1.id}
          toId={u2.id}
          initialValue={initialVal}
          onUnitsChange={handleUnitsChange}
          title={`${name1} to ${name2} converter`}
        />
      </div>

      {/* Formula and one worked example */}
      <section aria-labelledby="formula-heading" className="space-y-4">
        <h2 id="formula-heading" className={sectionTitle}>Formula</h2>
        {editorial && (
          <p className="nx-card px-4 py-3 font-mono text-base font-semibold break-words">
            {editorial.directAnswer.formulaDisplay}
          </p>
        )}
        <p className="text-[var(--text2)] tabular">
          1 {sym1} = {fmt(unitRatio, 6)} {sym2} · 1 {sym2} = {fmt(inverseUnitRatio, 6)} {sym1}
        </p>
        {editorial && <p className="text-[var(--text)]">{editorial.directAnswer.calculationRule}</p>}
        <div className="rounded-xl bg-[var(--card2)] border border-[var(--border)] p-4">
          <h3 className="text-base font-sans font-semibold tracking-normal mb-1">Example</h3>
          <p className="text-[var(--text)] tabular">{example}</p>
        </div>
        {editorial?.fieldNote && (
          <aside aria-label={editorial.fieldNote.title} className="border-l-4 border-[var(--fill)] pl-4 space-y-1">
            <p className="font-semibold">{editorial.fieldNote.title}</p>
            <p className="text-[var(--text2)]">{editorial.fieldNote.note}</p>
            {editorial.fieldNote.standard && (
              <p className="text-sm text-[var(--text2)]">Standard: {editorial.fieldNote.standard}</p>
            )}
          </aside>
        )}
      </section>

      {/* Common values table */}
      <section aria-labelledby="table-heading" className="space-y-4">
        <h2 id="table-heading" className={sectionTitle}>{name1} to {name2} table</h2>
        <div className="overflow-x-auto nx-card">
          <table className="w-full min-w-[520px] text-left text-[15px] border-collapse tabular">
            <caption className="sr-only">{name1} to {name2} conversion table with reverse values</caption>
            <thead className="bg-[var(--card2)] border-b border-[var(--border)]">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">{unitLabel(u1, cat.id)}</th>
                <th scope="col" className="px-4 py-3 font-semibold">{unitLabel(u2, cat.id)}</th>
                <th scope="col" className="px-4 py-3 font-semibold">{unitLabel(u2, cat.id)}</th>
                <th scope="col" className="px-4 py-3 font-semibold">{unitLabel(u1, cat.id)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {TABLE_VALUES.map(v => (
                <tr key={v}>
                  <th scope="row" className="px-4 py-2.5 font-medium">{v} {sym1}</th>
                  <td className="px-4 py-2.5 font-semibold">{fmt(convert(v, cat.id, u1.id, u2.id), 4)} {sym2}</td>
                  <td className="px-4 py-2.5 text-[var(--text2)]">{v} {sym2}</td>
                  <td className="px-4 py-2.5">{fmt(convert(v, cat.id, u2.id, u1.id), 4)} {sym1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editorial?.referenceTable && editorial.referenceTable.length > 0 && (
          <div className="overflow-x-auto nx-card">
            <table className="w-full min-w-[520px] text-left text-[15px] border-collapse">
              <caption className="text-left px-4 pt-3 pb-1 font-semibold">Reference values</caption>
              <thead className="border-b border-[var(--border)]">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Value</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Equivalent</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {editorial.referenceTable.map((row, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2.5 font-medium">{row.label}</td>
                    <td className="px-4 py-2.5 font-semibold tabular">{row.value}</td>
                    <td className="px-4 py-2.5 text-[var(--text2)]">{row.extra || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Related and reverse conversions */}
      <section aria-labelledby="related-heading" className="space-y-4">
        <h2 id="related-heading" className={sectionTitle}>Related conversions</h2>
        <ul className="flex flex-wrap gap-2">
          {editorial && (
            <li>
              <Link to={editorial.reciprocal.url} className="nx-chip font-semibold">
                <ArrowLeftRight size={16} aria-hidden="true" />
                {name2} to {name1}
              </Link>
            </li>
          )}
          {relatedPairs.map(p => (
            <li key={p.slug}>
              <Link to={`/convert/${cat.id}/${p.slug}`} className="nx-chip">{p.from} to {p.to}</Link>
            </li>
          ))}
        </ul>
        {relatedCats.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Related categories">
            {relatedCats.map(c => (
              <li key={c.id}>
                <Link to={`/convert/${c.id}`} className="nx-chip text-[var(--text2)]">{c.lb} converter</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* FAQ */}
      {editorial && editorial.faqs.length > 0 && (
        <section aria-labelledby="pair-faq-heading" className="space-y-4">
          <h2 id="pair-faq-heading" className={sectionTitle}>Frequently asked questions</h2>
          <div className="nx-card divide-y divide-[var(--border)]">
            {editorial.faqs.map((f, i) => (
              <details key={i} className="group">
                <summary className="flex items-center justify-between gap-3 px-4 py-3.5 min-h-[44px] cursor-pointer font-semibold list-none [&::-webkit-details-marker]:hidden">
                  <span>{f.question}</span>
                  <ChevronDown size={18} className="shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="px-4 pb-4 text-[var(--text2)]">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      <Breadcrumbs
        items={[
          { label: 'Categories', path: '/categories' },
          { label: cat.lb, path: `/convert/${cat.id}` },
          { label: `${name1} to ${name2}` },
        ]}
      />
    </article>
  )
}

export default function PairLanding() {
  const { category: catParam, pair: pairParam = '' } = useParams<{ category?: string; pair: string }>()
  const [searchParams] = useSearchParams()
  const rawVal = searchParams.get('val')
  const initialVal = parsePairQueryVal(rawVal)
  const routeKey = `${catParam ?? ''}/${pairParam}?val=${rawVal ?? ''}`

  return (
    <PairLandingInner
      key={routeKey}
      catParam={catParam}
      pairParam={pairParam}
      initialVal={initialVal}
    />
  )
}
