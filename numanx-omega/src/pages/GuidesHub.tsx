import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import SEOHead from '../components/ui/SEOHead'
import { PAGE_META } from '../config/pageMeta'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import { guideContent } from '../engine/guideContent'

const FILTERS = ['All', 'Pakistani & Regional', 'Engineering & Physics', 'Computing & Math', 'Everyday & Culinary'] as const

export default function GuidesHub() {
  const [selectedFilter, setSelectedFilter] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const allGuides = useMemo(() => Object.values(guideContent), [])

  const filteredGuides = useMemo(() => {
    return allGuides.filter(guide => {
      // Filter grouping
      let matchesFilter = true
      if (selectedFilter === 'Pakistani & Regional') {
        matchesFilter = ['area', 'mass', 'pk-numbering', 'pk-gpa', 'cricket-overs'].includes(guide.relatedCat)
      } else if (selectedFilter === 'Engineering & Physics') {
        matchesFilter = ['length', 'temp', 'pressure', 'power'].includes(guide.relatedCat)
      } else if (selectedFilter === 'Computing & Math') {
        matchesFilter = ['number-base', 'ieee-754', 'statistics'].includes(guide.relatedCat)
      } else if (selectedFilter === 'Everyday & Culinary') {
        matchesFilter = ['cooking', 'mass', 'length'].includes(guide.relatedCat)
      }

      // Search query
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch = !q ||
        guide.title.toLowerCase().includes(q) ||
        guide.intro.toLowerCase().includes(q) ||
        guide.formula.toLowerCase().includes(q) ||
        guide.relatedCat.toLowerCase().includes(q) ||
        guide.slug.toLowerCase().includes(q)

      return matchesFilter && matchesSearch
    })
  }, [allGuides, selectedFilter, searchQuery])

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      <SEOHead
        {...PAGE_META['/guides']}
        path="/guides"
      />

      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[{ label: 'Guides' }]}
        backTo={{ label: 'Home', path: '/' }}
      />

      {/* Hero Header */}
      <header className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--primary-muted)] text-[var(--link-text)]">
          <span>📚</span> {allGuides.length} Authoritative Conversion Guides
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)]">
          Conversion Guides & Metrology Reference
        </h1>
        <p className="text-sm sm:text-base text-[var(--text2)] max-w-2xl mx-auto font-normal">
          In-depth mathematical proofs, worked engineering examples, reference tables, and statutory definitions for culinary, Pakistani regional, and computer science units.
        </p>
      </header>

      {/* Search Input */}
      <div className="max-w-2xl mx-auto relative">
        <div className="relative flex items-center">
          <svg
            className="absolute left-4 w-4 h-4 text-[var(--text3)] pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search guides by keyword, unit, or formula (e.g. cups, grams, lakh, crore, ieee, binary)..."
            className="w-full pl-11 pr-10 py-3 rounded-full border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--text)] placeholder-[var(--text3)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-muted)] transition-all shadow-sm"
            aria-label="Search conversion guides"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 text-xs text-[var(--text3)] hover:text-[var(--text)]"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Pills / Filter Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
        {FILTERS.map(f => {
          const isActive = selectedFilter === f
          return (
            <button
              key={f}
              onClick={() => setSelectedFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-[var(--primary)] text-white shadow-sm shadow-[var(--glow)] scale-105'
                  : 'bg-[var(--card)] text-[var(--text2)] border border-[var(--border)] hover:bg-[var(--card2)] hover:border-[var(--text3)]'
              }`}
            >
              {f}
            </button>
          )
        })}
      </div>

      {/* Guides Grid */}
      {filteredGuides.length === 0 ? (
        <div className="text-center py-16 bg-[var(--card)] rounded-2xl border border-[var(--border)] space-y-3">
          <div className="text-3xl" aria-hidden="true">🔍</div>
          <h2 className="text-base font-bold text-[var(--text)]">No conversion guides found</h2>
          <p className="text-xs text-[var(--text2)]">Try searching for other units like "marla", "tola", "celsius", or "overs".</p>
          <button
            onClick={() => { setSelectedFilter('All'); setSearchQuery('') }}
            className="px-4 py-1.5 rounded-xl bg-[var(--primary-muted)] text-[var(--primary)] text-xs font-semibold hover:opacity-80 transition-opacity"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <AnimatePresence>
            {filteredGuides.map(guide => (
              <motion.article
                key={guide.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="group flex flex-col"
              >
                <Link
                  to={`/guides/${guide.slug}`}
                  className="flex flex-col h-full p-5 sm:p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] hover:shadow-md transition-all duration-200 group-hover:-translate-y-0.5 justify-between"
                >
                  <div className="space-y-2.5">
                    {/* Top Metadata Badges */}
                    <div className="flex items-center justify-between text-xs text-[var(--text3)]">
                      <span className="px-2.5 py-0.5 rounded-md font-semibold text-[10px] uppercase tracking-wider bg-[var(--primary-muted)] text-[var(--primary)]">
                        {guide.relatedCat}
                      </span>
                      <span className="text-[11px] opacity-75">{guide.table.length} Reference Rows</span>
                    </div>

                    {/* Title */}
                    <h2 className="text-base font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors line-clamp-2 leading-snug">
                      {guide.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-xs text-[var(--text2)] line-clamp-2 leading-relaxed font-normal opacity-90">
                      {guide.intro}
                    </p>

                    {/* Formula Pill */}
                    <div className="p-2 rounded-lg bg-[var(--card2)] font-mono text-[11px] text-[var(--link-text)] truncate border border-[var(--border-subtle)]">
                      {guide.formula}
                    </div>
                  </div>

                  {/* Bottom Action */}
                  <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--primary)] font-semibold">
                    <span>Read step-by-step guide</span>
                    <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                  </div>
                </Link>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Cross-Link to Technical Blog */}
      <section className="glass rounded-2xl p-5 border border-[var(--border)] text-center space-y-2 mt-8">
        <h2 className="text-sm font-bold text-[var(--text)]">Looking for deep metrology history and standards analysis?</h2>
        <p className="text-xs text-[var(--text2)] max-w-xl mx-auto">
          Explore our editorial blog articles on dual-unit engineering drafting, thermodynamic ITS-90 scales, and machinist drill tolerances.
        </p>
        <div className="pt-1">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--primary-muted)] text-[var(--link-text)] text-xs font-semibold hover:bg-[var(--primary)] hover:text-white transition-colors"
          >
            Visit Technical Blog Articles Hub &rarr;
          </Link>
        </div>
      </section>
    </div>
  )
}
