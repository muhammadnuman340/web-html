import { useEffect, useRef } from 'react'

type ShortcutHandler = (e: KeyboardEvent) => void

interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  meta?: boolean
  handler: ShortcutHandler
}

const registeredShortcuts: Map<string, Shortcut> = new Map()

export function useKeyboard(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      for (const s of shortcuts) {
        const ctrl = s.ctrl || s.meta || false
        const shift = s.shift || false
        const keyMatch = e.key.toLowerCase() === s.key.toLowerCase()
        const ctrlMatch = ctrl ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey
        const shiftMatch = shift ? e.shiftKey : !e.shiftKey

        if (keyMatch && ctrlMatch && shiftMatch) {
          e.preventDefault()
          s.handler(e)
          return
        }
      }
    }

    document.addEventListener('keydown', handler)
    shortcuts.forEach(s => {
      const id = `${s.ctrl ? 'C+' : ''}${s.shift ? 'S+' : ''}${s.key}`
      registeredShortcuts.set(id, s)
    })

    return () => {
      document.removeEventListener('keydown', handler)
      shortcuts.forEach(s => {
        const id = `${s.ctrl ? 'C+' : ''}${s.shift ? 'S+' : ''}${s.key}`
        registeredShortcuts.delete(id)
      })
    }
  }, [shortcuts])
}

export function getAllShortcuts(): { keys: string; description: string }[] {
  return [
    { keys: '⌘K', description: 'Open command bar' },
    { keys: 'Esc', description: 'Close modals / clear input' },
    { keys: '⌘⇧C', description: 'Quick convert popup' },
    { keys: '⌘H', description: 'Open history' },
    { keys: '⌘D', description: 'Toggle dark mode' },
    { keys: '⌘S', description: 'Scientific notation' },
    { keys: '⌘F', description: 'Fraction mode' },
    { keys: '⌘E', description: 'Export history' },
    { keys: 'Tab', description: 'Swap from ↔ to units' },
    { keys: '↑/↓', description: 'Navigate results' },
    { keys: 'Enter', description: 'Select result' },
  ]
}

export function useGlobalShortcuts(handlers: {
  onCommandBar?: () => void
  onQuickConvert?: () => void
  onHistory?: () => void
  onDarkMode?: () => void
}) {
  const handlersRef = useRef(handlers)

  useEffect(() => {
    handlersRef.current = handlers
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const h = handlersRef.current
      const ctrl = e.ctrlKey || e.metaKey
      const shift = e.shiftKey

      if (ctrl && !shift && e.key === 'k') { e.preventDefault(); h.onCommandBar?.(); return }
      if (ctrl && shift && e.key === 'c') { e.preventDefault(); h.onQuickConvert?.(); return }
      if (ctrl && !shift && e.key === 'h') { e.preventDefault(); h.onHistory?.(); return }
      if (ctrl && !shift && e.key === 'd') { e.preventDefault(); h.onDarkMode?.(); return }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
}
