import { useState, useEffect, useRef } from 'react'
import { buildFeedbackPayload } from '../../engine/feedback'

export default function FeedbackModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState<'problem' | 'suggestion'>('problem')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [hp, setHp] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  const modalRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const openModal = () => {
    previousFocusRef.current = document.activeElement as HTMLElement | null
    setStatus(null)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setStatus(null)
    if (previousFocusRef.current) {
      previousFocusRef.current.focus()
    }
  }

  // Delegated click listener for [data-open-feedback] and custom event 'open-feedback'
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      const trigger = target?.closest?.('[data-open-feedback]')
      if (trigger) {
        e.preventDefault()
        openModal()
      }
    }

    const handleCustomOpen = () => openModal()

    document.addEventListener('click', handleDocumentClick)
    window.addEventListener('open-feedback', handleCustomOpen)

    return () => {
      document.removeEventListener('click', handleDocumentClick)
      window.removeEventListener('open-feedback', handleCustomOpen)
    }
  }, [])

  // Focus management and keyboard accessibility (Esc & Tab trap)
  useEffect(() => {
    if (!isOpen) return

    const timer = setTimeout(() => {
      textareaRef.current?.focus()
    }, 50)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeModal()
        return
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const visibleFocusable = Array.from(focusable).filter(el => {
          return el.offsetParent !== null && !el.hasAttribute('disabled')
        })

        if (visibleFocusable.length === 0) return

        const first = visibleFocusable[0]
        const last = visibleFocusable[visibleFocusable.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedMsg = message.trim()
    if (trimmedMsg.length < 10) {
      setStatus({ kind: 'error', text: 'Please enter at least 10 characters describing the issue or suggestion.' })
      textareaRef.current?.focus()
      return
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus({ kind: 'error', text: 'That email address looks incomplete. Please correct it or leave it blank.' })
      return
    }

    setStatus(null)
    setIsSubmitting(true)

    try {
      const payload = buildFeedbackPayload({
        type,
        message: trimmedMsg,
        email: email.trim() || undefined,
        pathname: window.location.pathname,
        hp,
      })

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; success?: boolean; message?: string; error?: string }

      if (res.ok && (data.ok || data.success)) {
        setStatus({ kind: 'success', text: data.message || 'Thank you! Your feedback has been sent.' })
        setMessage('')
        setEmail('')
        setHp('')
        setTimeout(() => {
          closeModal()
        }, 1500)
      } else {
        setStatus({ kind: 'error', text: data.error || 'Feedback could not be sent right now. Please try again later.' })
      }
    } catch {
      setStatus({ kind: 'error', text: 'Network connection error. Please check your connection and try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-dialog-title"
      aria-describedby="feedback-dialog-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={closeModal}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface-1,#121826)] text-[var(--text,#f1f5f9)] shadow-2xl p-6 sm:p-7 space-y-4 max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="feedback-dialog-title" className="text-lg font-bold text-[var(--text)]">
              Report a problem / Suggest an improvement
            </h2>
            <p id="feedback-dialog-desc" className="text-xs text-[var(--text2)] mt-0.5">
              Found a bug, wrong number, or have an idea to make this tool better? Let us know!
            </p>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="p-1 rounded-lg text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            aria-label="Close feedback dialog"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Status notification */}
        {status && (
          <div
            role={status.kind === 'error' ? 'alert' : 'status'}
            className={`p-3 rounded-xl text-xs font-medium border ${
              status.kind === 'error'
                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            }`}
          >
            {status.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot field (hidden from real users) */}
          <div style={{ display: 'none' }} aria-hidden="true">
            <label htmlFor="feedback-hp">Leave this empty</label>
            <input
              id="feedback-hp"
              type="text"
              name="hp"
              tabIndex={-1}
              autoComplete="off"
              value={hp}
              onChange={e => setHp(e.target.value)}
            />
          </div>

          {/* Feedback Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text2)] mb-1.5">
              Feedback Type
            </label>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Feedback type">
              <button
                type="button"
                role="radio"
                aria-checked={type === 'problem'}
                onClick={() => setType('problem')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  type === 'problem'
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)] shadow-sm'
                    : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text2)] hover:text-[var(--text)]'
                }`}
              >
                <span aria-hidden="true">⚠️</span> Report a problem
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={type === 'suggestion'}
                onClick={() => setType('suggestion')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  type === 'suggestion'
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)] shadow-sm'
                    : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text2)] hover:text-[var(--text)]'
                }`}
              >
                <span aria-hidden="true">💡</span> Suggest improvement
              </button>
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="feedback-message" className="text-xs font-semibold text-[var(--text2)]">
                Your message <span className="text-rose-400" aria-hidden="true">*</span>
              </label>
              <span className="text-[11px] text-[var(--text3)]">
                {message.length}/2000
              </span>
            </div>
            <textarea
              ref={textareaRef}
              id="feedback-message"
              rows={4}
              required
              aria-required="true"
              minLength={10}
              maxLength={2000}
              placeholder={
                type === 'problem'
                  ? 'Please describe the bug or incorrect conversion value...'
                  : 'Tell us how we can make this converter more helpful for you...'
              }
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text3)] text-xs leading-relaxed focus:border-[var(--primary)] focus:outline-none transition-colors resize-y min-h-[90px]"
            />
          </div>

          {/* Optional Email */}
          <div>
            <label htmlFor="feedback-email" className="block text-xs font-semibold text-[var(--text2)] mb-1.5">
              Email (optional, if you would like a reply)
            </label>
            <input
              id="feedback-email"
              type="email"
              maxLength={254}
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text3)] text-xs focus:border-[var(--primary)] focus:outline-none transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || message.trim().length < 10}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-[var(--primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              {isSubmitting && (
                <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              <span>{isSubmitting ? 'Sending...' : 'Send Feedback'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
