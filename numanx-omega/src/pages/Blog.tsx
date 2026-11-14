import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import SEOHead from '../components/ui/SEOHead'
import { PAGE_META } from '../config/pageMeta'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import { BLOG_POSTS } from '../data/blogPosts'
import { guideContent } from '../engine/guideContent'
import { buildBlogIndexSchema } from '../config/schema'

const CATEGORIES = ['All', 'Guides', 'Tutorials', 'Tips', 'Resources', 'Productivity', 'Engineering', 'AI'] as const

interface FeedItem {
  id: string
  title: string
  url: string
  category: string
  badge: 'Article' | 'Conversion Guide'
  metaTag: string
  readTime: string
  excerpt: string
  formula?: string
}

export default function Blog() {
  const [selectedCat, setSelectedCat] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Unify blog posts and educational conversion guides
  const allItems = useMemo<FeedItem[]>(() => {
    const postItems: FeedItem[] = BLOG_POSTS.map(post => ({
      id: `post-${post.slug}`,
      title: post.title,
      url: `/blog/${post.slug}`,
      category: post.category,
      badge: 'Article',
      metaTag: post.date,
      readTime: post.readTime,
      excerpt: post.excerpt,
    }))

    const guideItems: FeedItem[] = Object.values(guideContent).map(g => ({
      id: `guide-${g.slug}`,
      title: g.title,
      url: `/guides/${g.slug}`,
      category: 'Guides',
      badge: 'Conversion Guide',
      metaTag: g.relatedCat.toUpperCase(),
      readTime: `${g.table.length} Rows`,
      excerpt: g.intro,
      formula: g.formula,
    }))

    return [...postItems, ...guideItems]
  }, [])

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const matchesCat = selectedCat === 'All' || item.category === selectedCat
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch = !q ||
        item.title.toLowerCase().includes(q) ||
        item.excerpt.toLowerCase().includes(q) ||
        (item.formula && item.formula.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q)
      return matchesCat && matchesSearch
    })
  }, [allItems, selectedCat, searchQuery])

  const blogSchema = useMemo(() => buildBlogIndexSchema(BLOG_POSTS), [])

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      <SEOHead
        {...PAGE_META['/blog']}
        path="/blog"
        schema={blogSchema}
      />

      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[{ label: 'Blog' }]}
        backTo={{ label: 'All Tools', path: '/categories' }}
      />

      {/* Hero Header */}
      <header className="text-center space-y-3 pt-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)]">
          Blog & Conversion Guides
        </h1>
        <p className="text-sm sm:text-base text-[var(--text2)] max-w-xl mx-auto font-normal">
          In-depth metrology guides, worked conversion proofs, engineering drafting analysis, and precision tutorials.
        </p>

        {/* Dedicated Guides Hub Pill */}
        <div className="pt-1">
          <Link
            to="/guides"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[var(--primary-muted)] text-[var(--link-text)] hover:bg-[var(--primary)] hover:text-white transition-colors"
          >
            <span>📚</span> Browse All Conversion Guides &rarr;
          </Link>
        </div>
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
            placeholder="Search articles and guides (e.g. marla, tola, fraction, metric, temperature)..."
            className="w-full pl-11 pr-10 py-3 rounded-full border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--text)] placeholder-[var(--text3)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-muted)] transition-all shadow-sm"
            aria-label="Search articles and guides"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 text-xs text-[var(--text3)] hover:text-[var(--text)]"
              aria-label="Clear article search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Pills / Filter Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
        {CATEGORIES.map(cat => {
          const isActive = selectedCat === cat
          const count = cat === 'All' 
            ? allItems.length 
            : allItems.filter(i => i.category === cat).length

          return (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-[var(--primary)] text-white shadow-sm shadow-[var(--glow)] scale-105'
                  : 'bg-[var(--card)] text-[var(--text2)] border border-[var(--border)] hover:bg-[var(--card2)] hover:border-[var(--text3)]'
              }`}
            >
              {cat} ({count})
            </button>
          )
        })}
      </div>

      {/* Unified Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-[var(--card)] rounded-2xl border border-[var(--border)] space-y-3">
          <div className="text-3xl" aria-hidden="true">📑</div>
          <h2 className="text-base font-bold text-[var(--text)]">No articles or guides found</h2>
          <p className="text-xs text-[var(--text2)]">Try searching for other keywords like "marla", "tola", "fractions", "metric", or "temperature".</p>
          <button
            onClick={() => { setSelectedCat('All'); setSearchQuery('') }}
            className="px-4 py-1.5 rounded-xl bg-[var(--primary-muted)] text-[var(--primary)] text-xs font-semibold hover:opacity-80 transition-opacity"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <AnimatePresence>
            {filteredItems.map(item => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="group flex flex-col"
              >
                <Link
                  to={item.url}
                  className="flex flex-col h-full p-5 sm:p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] hover:shadow-md transition-all duration-200 group-hover:-translate-y-0.5 justify-between"
                >
                  <div className="space-y-2.5">
                    {/* Top Metadata Badges */}
                    <div className="flex items-center gap-2 text-xs text-[var(--text3)]">
                      <span className={`px-2.5 py-0.5 rounded-md font-semibold text-[10px] uppercase tracking-wider ${
                        item.badge === 'Conversion Guide'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-[var(--primary-muted)] text-[var(--primary)]'
                      }`}>
                        {item.badge}
                      </span>
                      <span>{item.metaTag}</span>
                      <span aria-hidden="true" className="select-none opacity-60">·</span>
                      <span>{item.readTime}</span>
                    </div>

                    {/* Title */}
                    <h2 className="text-base sm:text-lg font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-xs sm:text-sm text-[var(--text2)] line-clamp-3 leading-relaxed font-normal opacity-90">
                      {item.excerpt}
                    </p>

                    {/* Formula Pill if Guide */}
                    {item.formula && (
                      <div className="p-2 rounded-lg bg-[var(--card2)] font-mono text-[11px] text-[var(--link-text)] truncate border border-[var(--border-subtle)]">
                        {item.formula}
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Hint */}
                  <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--primary)] font-semibold">
                    <span>{item.badge === 'Conversion Guide' ? 'Read step-by-step guide' : 'Read full article'}</span>
                    <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                  </div>
                </Link>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
