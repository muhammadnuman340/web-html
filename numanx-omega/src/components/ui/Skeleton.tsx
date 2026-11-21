export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`glass rounded-2xl p-4 animate-pulse ${className}`}>
      <div className="h-3 w-24 rounded bg-[var(--border)] mb-3" />
      <div className="h-8 w-full rounded-lg bg-[var(--border)] mb-2" />
      <div className="h-3 w-32 rounded bg-[var(--border)]" />
    </div>
  )
}

// Route-loading fallback. min-h-screen keeps the footer below the fold while the
// lazy route chunk loads, so the real page replacing it doesn't push the footer
// down and cause a layout shift (desktop CLS ~0.81 before this).
export function SkeletonPage() {
  return (
    <div className="space-y-4 min-h-screen">
      <div className="h-6 w-48 rounded bg-[var(--border)] animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
      </div>
      <SkeletonCard />
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass rounded-xl p-3 animate-pulse">
            <div className="h-6 w-12 rounded bg-[var(--border)] mb-1" />
            <div className="h-3 w-16 rounded bg-[var(--border)]" />
          </div>
        ))}
      </div>
    </div>
  )
}
