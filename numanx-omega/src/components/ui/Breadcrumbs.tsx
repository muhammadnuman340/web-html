import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  path?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={`text-sm text-[var(--text2)] ${className}`}>
      <ol className="flex flex-wrap items-center gap-x-1">
        <li><Link to="/" className="inline-flex items-center min-h-[44px] hover:text-[var(--text)] hover:underline">Home</Link></li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={index} className="flex items-center gap-x-1 min-w-0">
              <ChevronRight size={14} aria-hidden="true" />
              {isLast || !item.path ? (
                <span className="text-[var(--text)] font-medium truncate" aria-current="page">{item.label}</span>
              ) : (
                <Link to={item.path} className="inline-flex items-center min-h-[44px] hover:text-[var(--text)] hover:underline">{item.label}</Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
