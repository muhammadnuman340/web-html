import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import SEOHead from '../components/ui/SEOHead'
import { getAllCategories } from '../engine/converter'
import { guideContent } from '../engine/guideContent'

const CORE_ROUTES = [
  { path: '/', label: 'Home Page', icon: '🏠', desc: 'Main converter dashboard with instant input and quick pairs' },
  { path: '/converter', label: 'Universal Converter', icon: '🔄', desc: 'Precision conversion engine supporting chains & batch processing' },
  { path: '/categories', label: 'Browse Categories', icon: '📂', desc: 'Interactive directory of all 24 scientific and everyday unit systems' },
  { path: '/calculator', label: 'Smart Calculator', icon: '🧮', desc: 'Instant calculation and conversion hybrid tool' },
  { path: '/formulas', label: 'Formula Explorer', icon: '📐', desc: 'Interactive mathematical formulas and conversion steps' },
  { path: '/health', label: 'Health & Fitness Hub', icon: '❤️', desc: 'BMI, body mass, and fitness unit conversion utilities' },
  { path: '/currency', label: 'Live Currency Center', icon: '💵', desc: 'Real-time global foreign exchange rates with interactive historical charts' },
  { path: '/crypto', label: 'Cryptocurrency Hub', icon: '₿', desc: 'Live market prices and conversions for Bitcoin, Ethereum, and crypto tokens' },
  { path: '/dashboard', label: 'Analytics Dashboard', icon: '📊', desc: 'Personal conversion history, learning streaks, and usage insights' },
  { path: '/favorites', label: 'Saved Favorites', icon: '⭐', desc: 'Quick-access bookmarked conversion pairs' },
  { path: '/history', label: 'Conversion History', icon: '📜', desc: 'Log of recent calculations with search and export features' },
  { path: '/custom-units', label: 'Custom Unit Builder', icon: '⚒️', desc: 'Define and save custom user conversion ratios' },
  { path: '/settings', label: 'App Settings', icon: '⚙️', desc: 'Theme, precision, haptics, and display preferences' },
  { path: '/help', label: 'Help & Shortcuts', icon: '❓', desc: 'FAQ, keyboard shortcuts reference, and platform documentation' },
]

export default function Sitemap() {
  const [filter, setFilter] = useState('')
  const categories = useMemo(() => getAllCategories(), [])
  const guides = useMemo(() => Object.values(guideContent), [])

  const filteredCore = useMemo(() => {
    if (!filter) return CORE_ROUTES
    const q = filter.toLowerCase()
    return CORE_ROUTES.filter(r => r.label.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q) || r.path.toLowerCase().includes(q))
  }, [filter])

  const filteredCategories = useMemo(() => {
    if (!filter) return categories
    const q = filter.toLowerCase()
    return categories.filter(c =>
      c.lb.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.un.some(u => u.lb.toLowerCase().includes(q) || u.id.toLowerCase().includes(q))
    )
  }, [filter, categories])

  const filteredGuides = useMemo(() => {
    if (!filter) return guides
    const q = filter.toLowerCase()
    return guides.filter(g =>
      g.h1.toLowerCase().includes(q) ||
      g.slug.toLowerCase().includes(q) ||
      g.intro.toLowerCase().includes(q)
    )
  }, [filter, guides])

  return (
    <article className="space-y-8 max-w-5xl mx-auto pb-12">
      <SEOHead
        title="Site Map — Complete Directory of Calculators, Units & Guides | NumanX Omega"
        description="Explore the complete site map of NumanX Omega: 24 unit conversion categories, live currency and crypto hubs, detailed conversion guides, and offline tools."
        path="/sitemap"
      />

      {/* Header & Search */}
      <header className="space-y-3">
        <nav aria-label="Breadcrumb" className="text-xs opacity-50 flex gap-1">
          <Link to="/" className="hover:text-[var(--primary)]">Home</Link>
          <span>/</span>
          <span className="text-[var(--primary)]">Sitemap</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Platform Sitemap</h1>
            <p className="text-xs sm:text-sm opacity-60 mt-1">
              Complete index of all {categories.length} conversion categories, tools, and educational guides.
            </p>
          </div>
          <div className="w-full sm:w-72 relative">
            <input
              type="text"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Search sitemap pages..."
              className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--card2)] text-xs sm:text-sm outline-none focus:border-[var(--primary)] transition-all"
            />
            {filter && (
              <button
                onClick={() => setFilter('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-50 hover:opacity-100"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Section 1: Core Pages & Tools */}
      <section aria-labelledby="core-heading" className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <h2 id="core-heading" className="text-base font-semibold flex items-center gap-2">
            <span>🛠️</span> Core Platform & Specialized Tools ({filteredCore.length})
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCore.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className="glass p-3.5 rounded-2xl hover:border-[var(--primary)] transition-all interact-lift flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span className="font-semibold text-sm group-hover:text-[var(--primary)] transition-colors">{item.label}</span>
                </div>
                <p className="text-[11px] opacity-60 line-clamp-2 leading-relaxed">{item.desc}</p>
              </div>
              <div className="mt-3 text-[10px] font-mono text-[var(--primary)] opacity-70 flex items-center justify-between">
                <span>{item.path}</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 2: All 24 Conversion Categories */}
      <section aria-labelledby="categories-heading" className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <h2 id="categories-heading" className="text-base font-semibold flex items-center gap-2">
            <span>📂</span> Unit Conversion Categories ({filteredCategories.length})
          </h2>
          <span className="text-xs opacity-50">Direct Hub Links</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredCategories.map(cat => (
            <Link
              key={cat.id}
              to={`/convert/${cat.id}`}
              className="glass p-3.5 rounded-2xl hover:border-[var(--primary)] transition-all interact-lift group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl group-hover:scale-110 transition-transform">{cat.ic}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--primary-muted)] text-[var(--primary)]">
                    {cat.un.length} units
                  </span>
                </div>
                <h3 className="font-semibold text-sm mb-1 group-hover:text-[var(--primary)] transition-colors">
                  {cat.lb}
                </h3>
                <div className="text-[11px] opacity-50 truncate">
                  {cat.un.slice(0, 3).map(u => u.lb).join(', ')}...
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-[var(--border)]/50 text-[10px] font-mono text-[var(--primary)] flex items-center justify-between">
                <span>/convert/{cat.id}</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 3: In-Depth Guides */}
      <section aria-labelledby="guides-heading" className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <h2 id="guides-heading" className="text-base font-semibold flex items-center gap-2">
            <span>📖</span> Conversion Guides & Cheat Sheets ({filteredGuides.length})
          </h2>
          <span className="text-xs opacity-50">Step-by-step math</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGuides.map(guide => (
            <Link
              key={guide.slug}
              to={`/guides/${guide.slug}`}
              className="glass p-4 rounded-2xl hover:border-[var(--primary)] transition-all interact-lift group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-base">📝</span>
                  <h3 className="font-semibold text-xs sm:text-sm group-hover:text-[var(--primary)] transition-colors line-clamp-1">
                    {guide.h1}
                  </h3>
                </div>
                <p className="text-[11px] opacity-60 line-clamp-2 leading-relaxed mb-2">
                  {guide.intro}
                </p>
                <div className="text-[10px] font-mono px-2 py-1 rounded-lg bg-[var(--card2)] text-[var(--text2)] inline-block">
                  {guide.formula}
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-[var(--border)]/50 text-[10px] font-mono text-[var(--primary)] flex items-center justify-between">
                <span>/guides/{guide.slug}</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Crawl Meta Info Box */}
      <footer className="glass rounded-2xl p-4 text-xs opacity-60 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <span>XML Sitemap available at </span>
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--primary)] hover:underline font-mono"
          >
            /sitemap.xml
          </a>
        </div>
        <div>
          <span>Platform Version: </span>
          <span className="font-mono font-medium">NumanX Omega v2.0</span>
        </div>
      </footer>
    </article>
  )
}
