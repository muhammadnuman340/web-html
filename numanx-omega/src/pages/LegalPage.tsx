import { Link } from 'react-router-dom'
import SEOHead from '../components/ui/SEOHead'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import { PAGE_META } from '../config/pageMeta'
import { getPrivacyPolicy, getTerms, getContactPage, LEGAL, type LegalDoc } from '../config/legal'

const DOCS: Record<'privacy' | 'terms' | 'contact', () => LegalDoc> = {
  privacy: getPrivacyPolicy,
  terms: getTerms,
  contact: getContactPage,
}

export default function LegalPage({ doc: docKey }: { doc: keyof typeof DOCS }) {
  const doc = DOCS[docKey]()

  return (
    <article className="space-y-6 max-w-3xl mx-auto py-2">
      <SEOHead {...PAGE_META[doc.path]} path={doc.path} />

      <Breadcrumbs items={[{ label: doc.h1 }]} backTo={{ label: 'Home', path: '/' }} />

      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold text-[var(--text)] tracking-tight">{doc.h1}</h1>
        {doc.path !== '/contact' && (
          <p className="text-xs text-[var(--text3)]">Last updated: {LEGAL.lastUpdated}</p>
        )}
        <p className="text-sm text-[var(--text2)] leading-relaxed">{doc.intro}</p>
      </header>

      {doc.sections.map(section => (
        <section key={section.heading} className="space-y-2">
          <h2 className="text-lg font-bold text-[var(--text)]">{section.heading}</h2>
          {section.paragraphs.map(p => (
            <p key={p} className="text-sm text-[var(--text2)] leading-relaxed">{p}</p>
          ))}
          {section.bullets && (
            <ul className="list-disc pl-5 space-y-1 text-sm text-[var(--text2)]">
              {section.bullets.map(b => <li key={b}>{b}</li>)}
            </ul>
          )}
        </section>
      ))}

      <nav aria-label="Legal" className="flex flex-wrap gap-4 text-xs border-t border-[var(--border)] pt-4">
        <Link to="/privacy" className="text-[var(--primary)] hover:underline">Privacy Policy</Link>
        <Link to="/terms" className="text-[var(--primary)] hover:underline">Terms of Use</Link>
        <Link to="/contact" className="text-[var(--primary)] hover:underline">Contact</Link>
        <Link to="/about" className="text-[var(--primary)] hover:underline">About</Link>
      </nav>
    </article>
  )
}
