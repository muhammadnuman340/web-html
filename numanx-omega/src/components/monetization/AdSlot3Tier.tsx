import { useState, useEffect, useRef } from 'react'

/**
 * Hook to reactively check if user holds an active Pro Pass.
 * Reads from localStorage('nx_pro') and listens for real-time status change events.
 */
export function useIsPro(): boolean {
  const [isPro, setIsPro] = useState(() => {
    try {
      if (typeof window === 'undefined') return false
      return localStorage.getItem('nx_pro') === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleProChange = () => {
      try {
        setIsPro(localStorage.getItem('nx_pro') === 'true')
      } catch {
        setIsPro(false)
      }
    }

    window.addEventListener('storage', handleProChange)
    window.addEventListener('pro-status-changed', handleProChange)
    return () => {
      window.removeEventListener('storage', handleProChange)
      window.removeEventListener('pro-status-changed', handleProChange)
    }
  }, [])

  return isPro
}

export function openProModal() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-pro-modal'))
  }
}

interface AdSlotHeaderProps {
  label?: string
}

function AdSlotHeader({ label = 'SPONSORED' }: AdSlotHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2 py-1 text-[10px] font-mono tracking-wider text-[var(--text3)] uppercase border-b border-[var(--border)] bg-[var(--surface-sunken,#0b101b)]/40 rounded-t-lg">
      <span>{label}</span>
      <button
        type="button"
        onClick={openProModal}
        className="text-[var(--accent,#00d2ff)] hover:underline hover:text-[var(--accent2,#3a7bd5)] font-sans font-medium transition-colors cursor-pointer"
        aria-label="Hide all ads with Pro Pass"
      >
        Hide All Ads (Pro Pass) →
      </button>
    </div>
  )
}

/**
 * Desktop Slot #1: 160x600 Sticky Right Rail
 * Hidden on mobile / tablet (<1024px: hidden lg:flex).
 * Mounted via requestIdleCallback to keep Main thread completely free for initial render.
 */
export function AdSlotRail({ className = '' }: { className?: string }) {
  const isPro = useIsPro()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (isPro) return

    if ('requestIdleCallback' in window) {
      const handle = (window as any).requestIdleCallback(() => setMounted(true), { timeout: 2000 })
      return () => {
        if ('cancelIdleCallback' in window) {
          ;(window as any).cancelIdleCallback(handle)
        }
      }
    } else {
      const timer = setTimeout(() => setMounted(true), 400)
      return () => clearTimeout(timer)
    }
  }, [isPro])

  if (isPro) return null

  return (
    <aside
      className={`hidden lg:flex flex-col w-[160px] min-h-[600px] shrink-0 sticky top-24 self-start rounded-xl border border-[var(--border)] bg-[var(--surface,#121826)]/80 backdrop-blur-md shadow-sm overflow-hidden z-10 transition-opacity duration-300 ${
        mounted ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      aria-label="Advertisement rail"
    >
      <AdSlotHeader label="ADVERTISEMENT" />
      <div className="flex-1 flex flex-col items-center justify-between p-3 text-center">
        <div className="my-auto space-y-3">
          <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-tr from-[var(--primary,#2563eb)] to-[var(--accent,#00d2ff)] flex items-center justify-center text-white font-bold text-lg shadow-md">
            Ω
          </div>
          <div className="text-xs font-bold text-[var(--text,#f1f5f9)] leading-snug">
            Omega X Pro Metrology Suite
          </div>
          <p className="text-[11px] text-[var(--text2,#94a3b8)] leading-relaxed">
            Deterministic decimal conversions, zero rounding drift & offline PWA capabilities.
          </p>
        </div>
        <button
          type="button"
          onClick={openProModal}
          className="w-full py-2 px-2 text-[11px] font-semibold rounded-lg bg-[var(--primary,#2563eb)] text-white hover:brightness-110 shadow-sm transition-all"
        >
          Remove Ads ($9)
        </button>
      </div>
    </aside>
  )
}

/**
 * Slot #2: Mid-Page Responsive Banner (728x90 Desktop / 320x50 Mobile)
 * Reserved min-h-[90px] container placed 24px (my-6) below the primary converter card.
 * Strict zero Cumulative Layout Shift (0.00 CLS).
 */
export function AdSlotBanner({ className = '' }: { className?: string }) {
  const isPro = useIsPro()

  if (isPro) return null

  return (
    <section
      aria-label="Sponsored Content"
      className={`w-full my-6 flex flex-col items-center justify-center transition-all ${className}`}
    >
      <div className="w-full max-w-[728px] min-h-[90px] rounded-xl border border-[var(--border)] bg-[var(--surface,#121826)]/80 backdrop-blur-md shadow-sm overflow-hidden flex flex-col">
        <AdSlotHeader label="SPONSORED BANNER" />
        <div className="flex-1 flex items-center justify-between px-4 py-2 gap-3 max-sm:flex-col max-sm:justify-center max-sm:text-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">⚡</span>
            <div className="text-left max-sm:text-center">
              <div className="text-xs font-bold text-[var(--text,#f1f5f9)]">
                Precision Measurement Engineering
              </div>
              <div className="text-[11px] text-[var(--text2,#94a3b8)]">
                36 scientific domains · 284+ certified units · Zero drift decimal arithmetic
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={openProModal}
            className="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--surface-sunken,#0b101b)] hover:border-[var(--accent)] text-[var(--text)] transition-colors cursor-pointer"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    </section>
  )
}

/**
 * Slot #3: Pre-FAQ Rectangle (300x250)
 * Lazy-mounted via IntersectionObserver with rootMargin: 250px right above Category FAQ & Standards.
 */
export function AdSlotRectangle({ className = '' }: { className?: string }) {
  const isPro = useIsPro()
  const [inView, setInView] = useState(() => typeof window !== 'undefined' && !('IntersectionObserver' in window))
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isPro) return
    const el = containerRef.current
    if (!el || !('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '250px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [isPro])

  if (isPro) return null

  return (
    <div
      ref={containerRef}
      className={`w-full max-w-[300px] min-h-[250px] mx-auto my-6 rounded-xl border border-[var(--border)] bg-[var(--surface,#121826)]/80 backdrop-blur-md shadow-sm overflow-hidden flex flex-col z-0 transition-opacity duration-300 ${
        inView ? 'opacity-100' : 'opacity-80'
      } ${className}`}
      aria-label="Sponsored display box"
    >
      <AdSlotHeader label="RECOMMENDED RESOURCE" />
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-[var(--primary-muted,#1e293b)] border border-[var(--border)] flex items-center justify-center text-2xl">
          📐
        </div>
        <div className="text-xs font-bold text-[var(--text,#f1f5f9)]">
          Metrology & Unit Conversion API
        </div>
        <p className="text-[11px] text-[var(--text2,#94a3b8)] leading-relaxed">
          Need automated high-volume conversion for your ERP, e-commerce, or engineering pipeline?
        </p>
        <button
          type="button"
          onClick={openProModal}
          className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-[var(--primary,#2563eb)] hover:bg-[var(--primary-hover,#1d4ed8)] text-white shadow-sm transition-colors cursor-pointer"
        >
          Pro Developer Access ($9)
        </button>
      </div>
    </div>
  )
}

export default function AdSlot3Tier() {
  return <AdSlotBanner />
}
