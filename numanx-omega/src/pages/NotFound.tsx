import { Link } from 'react-router-dom'
import SEOHead from '../components/ui/SEOHead'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] py-12 px-4 text-center">
      <SEOHead
        title="Page Not Found (404) — Omega X"
        description="The page you requested does not exist or has been moved. Explore 36 unit conversion categories or return home."
        path="/404"
        noindex={true}
      />

      <div className="glass rounded-2xl p-8 max-w-md w-full border border-[var(--border)] shadow-xl space-y-5">
        <div
          className="text-6xl font-black font-mono text-[var(--primary)] tracking-wider"
          aria-hidden="true"
        >
          404
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[var(--text)]">
            Page Not Found
          </h1>
          <p className="text-sm text-[var(--text2)] leading-relaxed">
            The page you are looking for does not exist, was moved, or had its URL changed.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:brightness-110 transition-all text-center interact-lift"
          >
            ← Return Home
          </Link>
          <Link
            to="/categories"
            className="px-5 py-2.5 rounded-xl glass border border-[var(--border)] text-xs font-semibold text-[var(--text)] hover:border-[var(--primary)] transition-all text-center interact-lift"
          >
            Browse All Tools
          </Link>
        </div>
      </div>
    </div>
  )
}
