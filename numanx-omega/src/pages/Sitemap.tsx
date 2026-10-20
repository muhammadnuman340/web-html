import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import SEOHead from '../components/ui/SEOHead'
import { getAllCategories } from '../engine/converter'
import { categoryContent } from '../engine/categoryContent'
import { guideContent } from '../engine/guideContent'
import { BLOG_POSTS } from '../data/blogPosts'

const CORE_ROUTES = [
  { path: '/', label: 'Home Page', icon: '🏠', desc: 'Main converter dashboard with instant input and quick pairs' },
  { path: '/converter', label: 'Universal Converter', icon: '🔄', desc: 'Precision conversion engine supporting chains & batch processing' },
  { path: '/categories', label: 'Browse Categories', icon: '📂', desc: 'Interactive directory of all 24 scientific and everyday unit systems' },
  { path: '/blog', label: 'Blog & Articles Hub', icon: '📰', desc: 'Expert guides, tutorials, precision formulas, and cheat sheets' },
  { path: '/about', label: 'About NumanX Omega', icon: 'ℹ️', desc: 'Mission, NIST metrology compliance, privacy, and scientific engine' },
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

  const allPairs = useMemo(() => {
    const list: { catId: string; catName: string; from: string; to: string; desc: string; url: string }[] = []
    for (const cat of categories) {
      const content = categoryContent[cat.id]
      if (content?.popularPairs) {
        for (const p of content.popularPairs) {
          list.push({
            catId: cat.id,
            catName: cat.lb,
            from: p.from,
            to: p.to,
            desc: p.desc,
            url: `/convert/${cat.id}/${p.from.toLowerCase().replace(/\s+/g, '-')}-to-${p.to.toLowerCase().replace(/\s+/g, '-')}`,
          })
        }
      }
    }
    return list
  }, [categories])

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

  const filteredPairs = useMemo(() => {
    if (!filter) return allPairs
    const q = filter.toLowerCase()
    return allPairs.filter(p =>
      p.from.toLowerCase().includes(q) ||
      p.to.toLowerCase().includes(q) ||
      p.catName.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q)
    )
  }, [filter, allPairs])

  const filteredGuides = useMemo(() => {
    if (!filter) return guides
    const q = filter.toLowerCase()
    return guides.filter(g =>
      g.h1.toLowerCase().includes(q) ||
      g.slug.toLowerCase().includes(q) ||
      g.intro.toLowerCase().includes(q)
    )
  }, [filter, guides])

  const filteredBlogPosts = useMemo(() => {
    if (!filter) return BLOG_POSTS
    const q = filter.toLowerCase()
    return BLOG_POSTS.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.slug.toLowerCase().includes(q) ||
      b.excerpt.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q)
    )
  }, [filter])

  return (
    <article className="space-y-8 max-w-5xl mx-auto pb-12">
      <SEOHead
        title="Site Map — Complete Directory of Calculators, Units & Guides"
        description="Explore the complete site map of NumanX Omega: 24 unit conversion categories, dedicated pair calculators, live currency and crypto hubs, and offline tools."
        path="/sitemap"
      />

      {/* Header & Search */}
      <header className="space-y-3">
        <nav aria-label="Breadcrumb" className="text-xs text-[var(--text2)] opacity-85 flex gap-1">
          <Link to="/" className="hover:text-[var(--primary)] transition-colors">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="text-[var(--primary)] font-medium">Sitemap</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text)]">Platform Directory & Sitemap</h1>
            <p className="text-xs sm:text-sm text-[var(--text2)] opacity-85 mt-1">
              Index of all {categories.length} conversion categories, {allPairs.length} pair calculators, core tools, and guides.
            </p>
          </div>
          <div className="w-full sm:w-72 relative">
            <input
              type="search"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Search sitemap pages..."
              className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--card2)] text-xs sm:text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] transition-all"
              aria-label="Filter sitemap pages"
            />
            {filter && (
              <button
                onClick={() => setFilter('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-50 hover:opacity-100"
                aria-label="Clear sitemap filter"
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
          <h2 id="core-heading" className="text-base font-semibold flex items-center gap-2 text-[var(--text)]">
            <span role="img" aria-hidden="true">🛠️</span> Core Platform & Specialized Tools ({filteredCore.length})
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCore.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className="glass p-3.5 rounded-2xl hover:border-[var(--primary)] transition-all interact-lift flex flex-col justify-between group border border-transparent"
            >
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="text-xl group-hover:scale-110 transition-transform" role="img" aria-hidden="true">{item.icon}</span>
                  <span className="font-semibold text-sm text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">{item.label}</span>
                </div>
                <p className="text-xs text-[var(--text2)] opacity-80 line-clamp-2 leading-relaxed">{item.desc}</p>
              </div>
              <div className="mt-3 text-xs font-mono text-[var(--primary)] font-medium flex items-center justify-between">
                <span>{item.path}</span>
                <span aria-hidden="true">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 2: All 24 Conversion Categories */}
      <section aria-labelledby="categories-heading" className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <h2 id="categories-heading" className="text-base font-semibold flex items-center gap-2 text-[var(--text)]">
            <span role="img" aria-hidden="true">📂</span> Unit Conversion Categories ({filteredCategories.length})
          </h2>
          <span className="text-xs text-[var(--text2)] opacity-70">Dedicated Pages</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredCategories.map(cat => (
            <Link
              key={cat.id}
              to={`/convert/${cat.id}`}
              className="glass p-3.5 rounded-2xl hover:border-[var(--primary)] transition-all interact-lift group flex flex-col justify-between border border-transparent"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl group-hover:scale-110 transition-transform" role="img" aria-hidden="true">{cat.ic}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--primary-muted)] text-[var(--primary)]">
                    {cat.un.length} units
                  </span>
                </div>
                <h3 className="font-semibold text-sm mb-1 text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                  {cat.lb}
                </h3>
                <div className="text-xs text-[var(--text2)] opacity-75 truncate">
                  {cat.un.slice(0, 3).map(u => u.lb).join(', ')}...
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-[var(--border)]/50 text-xs font-mono text-[var(--primary)] font-medium flex items-center justify-between">
                <span>/convert/{cat.id}</span>
                <span aria-hidden="true">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 3: Popular Single-Pair Micro Calculators */}
      <section aria-labelledby="pairs-heading" className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <h2 id="pairs-heading" className="text-base font-semibold flex items-center gap-2 text-[var(--text)]">
            <span role="img" aria-hidden="true">⚡</span> Popular Conversion Pairs ({filteredPairs.length})
          </h2>
          <span className="text-xs text-[var(--text2)] opacity-70">Direct Calculators</span>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredPairs.slice(0, 48).map(p => (
            <Link
              key={p.url}
              to={p.url}
              className="glass p-3 rounded-xl hover:border-[var(--primary)] transition-all interact-lift group border border-transparent flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                  <span>{p.from} → {p.to}</span>
                  <span className="text-xs font-normal text-[var(--text2)] opacity-70">{p.catName}</span>
                </div>
                <p className="text-xs text-[var(--text2)] opacity-75 truncate mt-1">{p.desc}</p>
              </div>
              <div className="mt-2 text-xs font-mono text-[var(--primary)] opacity-80 flex items-center justify-between">
                <span className="truncate">{p.url}</span>
                <span aria-hidden="true">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 4: In-Depth Guides */}
      <section aria-labelledby="guides-heading" className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <h2 id="guides-heading" className="text-base font-semibold flex items-center gap-2 text-[var(--text)]">
            <span role="img" aria-hidden="true">📖</span> Conversion Guides & Math Articles ({filteredGuides.length})
          </h2>
          <span className="text-xs text-[var(--text2)] opacity-70">Step-by-step math</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGuides.map(guide => (
            <Link
              key={guide.slug}
              to={`/guides/${guide.slug}`}
              className="glass p-4 rounded-2xl hover:border-[var(--primary)] transition-all interact-lift group flex flex-col justify-between border border-transparent"
            >
              <div>
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[var(--primary)]">
                  <span role="img" aria-hidden="true">📚</span>
                  <span>{(guide.category || 'conversion').toUpperCase()} GUIDE</span>
                </div>
                <h3 className="font-semibold text-sm text-[var(--text)] mb-1 group-hover:text-[var(--primary)] transition-colors">
                  {guide.h1}
                </h3>
                <p className="text-xs text-[var(--text2)] opacity-80 line-clamp-2 leading-relaxed">
                  {guide.intro}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-[var(--border)]/50 text-xs font-mono text-[var(--primary)] font-medium flex items-center justify-between">
                <span>/guides/{guide.slug}</span>
                <span aria-hidden="true">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 5: Blog Articles & In-Depth Tutorials */}
      <section aria-labelledby="blog-heading" className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <h2 id="blog-heading" className="text-base font-semibold flex items-center gap-2 text-[var(--text)]">
            <span role="img" aria-hidden="true">📰</span> Blog Articles & Educational Guides ({filteredBlogPosts.length})
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredBlogPosts.map(post => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="glass p-5 rounded-2xl hover:border-[var(--primary)] transition-all interact-lift group flex flex-col justify-between border border-transparent shadow-sm"
            >
              <div>
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[var(--primary)]">
                  <span className="px-2 py-0.5 rounded-md bg-[var(--primary-muted)] text-[11px]">{post.category}</span>
                  <span className="text-[var(--text3)]">·</span>
                  <span className="text-[var(--text3)]">{post.date}</span>
                  <span className="text-[var(--text3)]">·</span>
                  <span className="text-[var(--text3)]">{post.readTime}</span>
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[var(--text)] mb-1 group-hover:text-[var(--primary)] transition-colors">
                  {post.title}
                </h3>
                <p className="text-xs text-[var(--text2)] opacity-80 line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-[var(--border)]/50 text-xs font-mono text-[var(--primary)] font-medium flex items-center justify-between">
                <span>/blog/{post.slug}</span>
                <span aria-hidden="true">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </article>
  )
}
