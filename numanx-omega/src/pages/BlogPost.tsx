import { useParams, Link } from 'react-router-dom'
import SEOHead from '../components/ui/SEOHead'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import UniversalConverter from '../components/converter/UniversalConverter'
import { BLOG_POSTS } from '../data/blogPosts'
import { useState } from 'react'

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const post = BLOG_POSTS.find(p => p.slug === slug)
  const [copied, setCopied] = useState(false)

  if (!post) {
    return (
      <div className="text-center py-20 space-y-4 max-w-md mx-auto">
        <div className="text-4xl" aria-hidden="true">📄</div>
        <h1 className="text-xl font-bold text-[var(--text)]">Article Not Found</h1>
        <p className="text-xs text-[var(--text2)]">The blog post you requested does not exist or may have moved.</p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          ← Return to Blog
        </Link>
      </div>
    )
  }

  const relatedPosts = BLOG_POSTS.filter(p => p.slug !== post.slug).slice(0, 2)

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Organization',
      name: post.author,
      url: 'https://numanx-studio-omega-converter.netlify.app/about'
    },
    publisher: {
      '@type': 'Organization',
      name: 'NumanX Omega',
      logo: {
        '@type': 'ImageObject',
        url: 'https://numanx-studio-omega-converter.netlify.app/favicon.svg'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://numanx-studio-omega-converter.netlify.app/blog/${post.slug}`
    }
  }

  const faqSchema = post.content.faq.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.content.faq.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a
      }
    }))
  } : null

  return (
    <article className="space-y-8 max-w-3xl mx-auto py-2">
      <SEOHead
        title={`${post.title} — NumanX Blog`}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
      />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      {/* Breadcrumbs & Back Navigation matching user Image 2 */}
      <Breadcrumbs
        items={[
          { label: 'Blog', path: '/blog' },
          { label: post.title }
        ]}
        backTo={{ label: 'All Articles', path: '/blog' }}
      />

      {/* Post Header */}
      <header className="space-y-4 border-b border-[var(--border)] pb-6">
        <div className="flex items-center gap-2.5 text-xs text-[var(--text3)]">
          <span className="px-2.5 py-0.5 rounded-md font-semibold text-[11px] bg-[var(--primary-muted)] text-[var(--primary)]">
            {post.category}
          </span>
          <span>{post.date}</span>
          <span aria-hidden="true" className="select-none opacity-60">·</span>
          <span>{post.readTime}</span>
          <span aria-hidden="true" className="select-none opacity-60">·</span>
          <span className="font-medium text-[var(--text2)]">By {post.author}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--text)] tracking-tight leading-tight">
          {post.title}
        </h1>

        <p className="text-sm sm:text-base text-[var(--text2)] leading-relaxed">
          {post.content.intro}
        </p>

        {/* Share & Copy button */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={copyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card2)] text-xs font-semibold text-[var(--text)] transition-colors shadow-sm"
          >
            <span>{copied ? '✓ Copied' : '🔗 Copy Link'}</span>
          </button>
          <Link
            to={`/convert/${post.relatedCat}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--primary-muted)] text-[var(--primary)] hover:opacity-80 text-xs font-semibold transition-opacity"
          >
            <span>Try {post.relatedCat.toUpperCase()} Converter →</span>
          </Link>
        </div>
      </header>

      {/* Key Takeaways Callout */}
      {post.content.keyTakeaways.length > 0 && (
        <section aria-labelledby="takeaways-heading" className="p-5 rounded-2xl bg-[var(--primary-muted)] border border-[var(--primary)]/20 space-y-2.5">
          <h2 id="takeaways-heading" className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] flex items-center gap-1.5">
            <span aria-hidden="true">💡</span> Key Takeaways
          </h2>
          <ul className="space-y-1.5 text-xs sm:text-sm text-[var(--text)] list-disc list-inside">
            {post.content.keyTakeaways.map((point, i) => (
              <li key={i} className="leading-relaxed">{point}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Main Content Sections */}
      <div className="space-y-8 text-sm text-[var(--text)] leading-relaxed">
        {post.content.sections.map((sec, idx) => (
          <section key={idx} className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text)] tracking-tight">
              {sec.title}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text2)] leading-relaxed">
              {sec.body}
            </p>

            {/* Formula Block */}
            {sec.formula && (
              <div className="p-4 rounded-xl bg-[var(--card2)] border border-[var(--border)] font-mono text-xs sm:text-sm text-[var(--primary)] whitespace-pre-wrap overflow-x-auto shadow-inner">
                {sec.formula}
              </div>
            )}

            {/* Bullet Points */}
            {sec.bulletPoints && sec.bulletPoints.length > 0 && (
              <ul className="space-y-1.5 text-xs sm:text-sm text-[var(--text2)] list-disc list-inside">
                {sec.bulletPoints.map((bp, i) => (
                  <li key={i}>{bp}</li>
                ))}
              </ul>
            )}

            {/* Comparison Table */}
            {sec.table && (
              <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)] my-3 shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--card2)]">
                      <th scope="col" className="p-3 font-semibold text-[var(--text)]">{sec.table[0].col1}</th>
                      <th scope="col" className="p-3 font-semibold text-[var(--text)]">{sec.table[0].col2}</th>
                      {sec.table[0].col3 && (
                        <th scope="col" className="p-3 font-semibold text-[var(--text)]">{sec.table[0].col3}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {sec.table.slice(1).map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--card2)] transition-colors">
                        <td className="p-3 font-medium text-[var(--text)]">{row.col1}</td>
                        <td className="p-3 text-[var(--text2)]">{row.col2}</td>
                        {row.col3 && <td className="p-3 text-[var(--text2)] font-mono">{row.col3}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Embedded Live Tool */}
      <section aria-labelledby="interactive-converter" className="p-5 sm:p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-4 shadow-sm">
        <div>
          <h2 id="interactive-converter" className="text-base font-bold text-[var(--text)] flex items-center gap-2">
            <span>⚡ Interactive {post.relatedCat.toUpperCase()} Calculator</span>
          </h2>
          <p className="text-xs text-[var(--text2)] mt-0.5">
            Test the math live with high precision right inside this guide:
          </p>
        </div>
        <div className="p-2 sm:p-4 rounded-xl bg-[var(--card2)] border border-[var(--border)]">
          <UniversalConverter category={post.relatedCat} hideCategoryPicker={true} />
        </div>
      </section>

      {/* Frequently Asked Questions */}
      {post.content.faq.length > 0 && (
        <section aria-labelledby="faq-heading" className="space-y-4 border-t border-[var(--border)] pt-8">
          <h2 id="faq-heading" className="text-lg font-bold text-[var(--text)]">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {post.content.faq.map((f, i) => (
              <div key={i} className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-1.5">
                <h3 className="text-xs sm:text-sm font-semibold text-[var(--text)]">
                  {f.q}
                </h3>
                <p className="text-xs text-[var(--text2)] leading-relaxed">
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Articles Footer */}
      {relatedPosts.length > 0 && (
        <section aria-labelledby="related-heading" className="space-y-4 border-t border-[var(--border)] pt-8">
          <h2 id="related-heading" className="text-base font-bold text-[var(--text)]">
            Related Guides & Tutorials
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedPosts.map(rp => (
              <Link
                key={rp.slug}
                to={`/blog/${rp.slug}`}
                className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] hover:shadow-sm transition-all space-y-1.5 group"
              >
                <div className="flex items-center gap-2 text-[11px] text-[var(--text3)]">
                  <span className="font-semibold text-[var(--primary)]">{rp.category}</span>
                  <span>·</span>
                  <span>{rp.readTime}</span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                  {rp.title}
                </h3>
                <p className="text-xs text-[var(--text2)] line-clamp-2">
                  {rp.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
