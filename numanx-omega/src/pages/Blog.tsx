import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import SEOHead from '../components/ui/SEOHead'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import { BLOG_POSTS } from '../data/blogPosts'

const CATEGORIES = ['All', 'Guides', 'Tutorials', 'Tips', 'Resources', 'Productivity', 'Engineering', 'AI'] as const

export default function Blog() {
  const [selectedCat, setSelectedCat] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter(post => {
      const matchesCat = selectedCat === 'All' || post.category === selectedCat
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch = !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.tags.some(t => t.toLowerCase().includes(q))
      return matchesCat && matchesSearch
    })
  }, [selectedCat, searchQuery])

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'NumanX Omega Blog — Precision Metrology & Unit Conversion Guides',
    description: 'Expert tips, mathematical formulas, cheat sheets, and tutorials for engineering and scientific unit conversions.',
    url: 'https://numanx-studio-omega-converter.netlify.app/blog',
    blogPost: BLOG_POSTS.map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      author: { '@type': 'Organization', name: post.author },
      url: `https://numanx-studio-omega-converter.netlify.app/blog/${post.slug}`
    }))
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      <SEOHead
        title="Blog — Unit Conversion Guides, Metrology & Precision Tips"
        description="Comprehensive guides, tutorials, formulas, and cheat sheets for length, weight, temperature, data, and precision conversions by NumanX."
        path="/blog"
      />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />

      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[{ label: 'Blog' }]}
        backTo={{ label: 'All Tools', path: '/categories' }}
      />

      {/* Hero Header matching user Image 1 */}
      <header className="text-center space-y-3 pt-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)]">
          Blog
        </h1>
        <p className="text-sm sm:text-base text-[var(--text2)] max-w-xl mx-auto font-normal">
          Tips, guides, and tutorials for working with measurements, conversions, and calculations.
        </p>
      </header>

      {/* Search Input matching user Image 1 */}
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
            placeholder="Search articles..."
            className="w-full pl-11 pr-10 py-3 rounded-full border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--text)] placeholder-[var(--text3)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-muted)] transition-all shadow-sm"
            aria-label="Search articles"
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

      {/* Category Pills / Filter Tabs matching user Image 1 */}
      <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
        {CATEGORIES.map(cat => {
          const isActive = selectedCat === cat
          return (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-[var(--primary)] text-white shadow-sm shadow-[var(--glow)] scale-105'
                  : 'bg-[var(--card)] text-[var(--text2)] border border-[var(--border)] hover:bg-[var(--card2)] hover:border-[var(--text3)]'
              }`}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Blog Cards Grid matching user Image 1 & Image 3 */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 bg-[var(--card)] rounded-2xl border border-[var(--border)] space-y-3">
          <div className="text-3xl" aria-hidden="true">📑</div>
          <h2 className="text-base font-bold text-[var(--text)]">No articles found</h2>
          <p className="text-xs text-[var(--text2)]">Try searching for other keywords like "fractions", "metric", or "temperature".</p>
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
            {filteredPosts.map(post => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="group"
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="flex flex-col h-full p-5 sm:p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] hover:shadow-md transition-all duration-200 group-hover:-translate-y-0.5"
                >
                  {/* Top Metadata Badges matching Image 1 & 3 */}
                  <div className="flex items-center gap-2.5 text-xs text-[var(--text3)] mb-3">
                    <span className="px-2.5 py-0.5 rounded-md font-semibold text-[11px] bg-[var(--primary-muted)] text-[var(--primary)]">
                      {post.category}
                    </span>
                    <span>{post.date}</span>
                    <span aria-hidden="true" className="select-none opacity-60">·</span>
                    <span>{post.readTime}</span>
                  </div>

                  {/* Title */}
                  <h2 className="text-base sm:text-lg font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors line-clamp-2 leading-snug mb-2">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-xs sm:text-sm text-[var(--text2)] line-clamp-3 leading-relaxed flex-1 font-normal">
                    {post.excerpt}
                  </p>

                  {/* Bottom Action Hint */}
                  <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--primary)] font-semibold">
                    <span>Read full article</span>
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
