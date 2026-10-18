import { Link, useNavigate } from 'react-router-dom'

export interface BreadcrumbItem {
  label: string
  path?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  backTo?: {
    label: string
    path: string
  }
  className?: string
}

export default function Breadcrumbs({ items, backTo, className = '' }: BreadcrumbsProps) {
  const navigate = useNavigate()

  return (
    <div className={`space-y-3 mb-6 ${className}`}>
      {/* Breadcrumb Hierarchy */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[var(--text3)] flex-wrap">
        <Link to="/" className="hover:text-[var(--text)] transition-colors font-medium">Home</Link>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <div key={index} className="flex items-center gap-2">
              <span className="opacity-40 select-none" aria-hidden="true">›</span>
              {isLast || !item.path ? (
                <span className="text-[var(--text)] font-semibold truncate max-w-[280px] sm:max-w-md" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link to={item.path} className="hover:text-[var(--text)] transition-colors font-medium">
                  {item.label}
                </Link>
              )}
            </div>
          )
        })}
      </nav>

      {/* Back Button matching Image 2 */}
      {backTo && (
        <div>
          <button
            onClick={() => backTo.path ? navigate(backTo.path) : navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text)] hover:text-[var(--primary)] transition-colors group py-1"
            aria-label={`Back to ${backTo.label}`}
          >
            <span className="text-sm transition-transform group-hover:-translate-x-1" aria-hidden="true">←</span>
            <span>{backTo.label}</span>
          </button>
        </div>
      )}
    </div>
  )
}
