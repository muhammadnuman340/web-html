import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { smartBehavior } from '../../engine/smartBehavior'
import { analytics } from '../../engine/analytics'

interface ContextTip {
  icon: string
  message: string
  action?: { label: string; shortcut?: string }
}

function getPageTips(pathname: string): ContextTip[] {
  const path = pathname.replace(/\/\d+$/, '')
  const tips: Record<string, ContextTip[]> = {
    '/': [
      { icon: '🚀', message: 'Start by typing a value in the converter', action: { label: 'Go to Converter' } },
      { icon: '📊', message: 'Check your conversion stats on Dashboard', action: { label: 'Open Dashboard' } },
    ],
    '/converter': [
      { icon: '💡', message: 'Type naturally — "5 km in miles"', action: { label: 'Example', shortcut: '⌘K' } },
      { icon: '📋', message: 'Click result to copy, right-click for format options' },
    ],
    '/dashboard': [
      { icon: '📈', message: 'Your activity is tracked here in real-time' },
      { icon: '⭐', message: 'Save frequent conversions to Favorites' },
    ],
    '/categories': [
      { icon: '🔍', message: 'Search categories or browse by type' },
      { icon: '⚡', message: 'Click ⚡ on any category for quick convert' },
    ],
    '/currency': [
      { icon: '💱', message: 'Exchange rates update every 60 minutes' },
      { icon: '⭐', message: 'Favorite currency pairs for quick access' },
    ],
    '/crypto': [
      { icon: '₿', message: 'Live crypto prices with real-time updates' },
    ],
    '/history': [
      { icon: '🕒', message: 'Search and filter your conversion history' },
      { icon: '📥', message: 'Export history as CSV or JSON' },
    ],
    '/settings': [
      { icon: '🎨', message: 'Customize themes, fonts, and behavior' },
      { icon: '🔊', message: 'Toggle haptic feedback in Behavior section' },
    ],
    '/formulas': [
      { icon: '📐', message: 'Click any formula to copy it instantly' },
    ],
    '/favorites': [
      { icon: '❤️', message: 'Organize favorite conversions by category' },
    ],
    '/help': [
      { icon: '❓', message: 'Explore all features and keyboard shortcuts' },
    ],
  }
  return tips[path] || tips['/'] || []
}

function getTimeBasedTip(): ContextTip | null {
  const hour = new Date().getHours()
  const day = new Date().getDay()
  const isWeekend = day === 0 || day === 6
  const isDark = document.body.classList.contains('dark') || document.body.classList.contains('theme-cyberpunk')
  if (hour < 5) return { icon: '🌙', message: 'Late night converting? Try Focus Mode for fewer distractions' + (!isDark ? ' • Switch to Dark mode for your eyes' : '') }
  if (hour < 12) return { icon: '🌅', message: isWeekend ? 'Weekend session! Explore a new category today' : 'Good morning! Quick tip: press ⌘K to search anything' }
  if (hour < 17) return { icon: '☀️', message: isWeekend ? 'Weekend deep-dive time! Try batch converting' : 'Afternoon check: have you tried the Dashboard? 📊' }
  if (hour < 22) return { icon: '🌆', message: 'Evening converting — try History to review what you did today' + (isWeekend && !isDark ? ' • 🌈 Try Cyberpunk theme for fun!' : '') }
  return { icon: '🌙', message: 'Late session — remember to take breaks!' + (!isDark ? ' • Switch to Dark mode 🌙' : ' Use the mobile nav for quick access') }
}

export default function ContextBar() {
  const location = useLocation()
  const [dismissed, setDismissed] = useState(false)
  const [currentTipIndex, setCurrentTipIndex] = useState(0)

  useEffect(() => {
    setDismissed(false)
    setCurrentTipIndex(0)
  }, [location.pathname])

  const pageTips = useMemo(() => {
    const base = getPageTips(location.pathname)
    const profile = smartBehavior.getProfile()

    if (profile.totalConversions > 5) {
      base.push({
        icon: '🎯',
        message: `Your top: ${profile.preferredCategory} — ${profile.frequentPairs[0]?.from || ''} → ${profile.frequentPairs[0]?.to || ''}`,
      })
    }
    if (profile.totalConversions < 3 && location.pathname === '/converter') {
      base.unshift({
        icon: '👋',
        message: 'New here? Try typing a number and selecting units',
      })
    }

    const timeTip = getTimeBasedTip()
    if (timeTip && location.pathname !== '/') {
      base.push(timeTip)
    }

    const isActive = (location.pathname === '/' && base.length > 0) || location.pathname !== '/'
    return isActive ? base : []
  }, [location.pathname])

  if (dismissed || pageTips.length === 0) return null

  const tip = pageTips[currentTipIndex % pageTips.length]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${location.pathname}-${currentTipIndex}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        role="status"
        aria-live="polite"
        className="hidden lg:flex items-center justify-between px-4 py-2 mx-3 sm:mx-5 mb-1 rounded-xl glass border border-[var(--border)] text-xs"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-sm flex-shrink-0" aria-hidden="true">{tip.icon}</span>
          <span className="opacity-80 text-[var(--text)] leading-normal">{tip.message}</span>
          {tip.action && (
            <span className="px-2 py-0.5 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] text-[11px] font-semibold tracking-wide ml-1">
              {tip.action.label}{tip.action.shortcut ? ` (${tip.action.shortcut})` : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {pageTips.length > 1 && (
            <div className="flex items-center gap-0.5">
              {pageTips.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTipIndex(i)}
                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[var(--border)] transition-colors"
                  aria-label={`Show tip ${i + 1} of ${pageTips.length}`}
                  aria-current={i === currentTipIndex % pageTips.length ? 'true' : undefined}
                >
                  <span className={`block rounded-full transition-all ${
                    i === currentTipIndex % pageTips.length ? 'bg-[var(--primary)] w-3 h-1.5' : 'bg-[var(--text2)] opacity-40 w-1.5 h-1.5'
                  }`} />
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="w-6 h-6 flex items-center justify-center rounded-lg opacity-75 hover:opacity-100 hover:bg-[var(--border)] text-[var(--text)] transition-all"
            aria-label="Dismiss tip"
          >
            ✕
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
