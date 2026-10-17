export default function ThemeCustomizer({ theme, setTheme }: { theme: string; setTheme: (t: string) => void }) {
  const themes = [
    { id: 'dark', label: 'Cosmic', icon: '🌌' },
    { id: 'theme-amoled', label: 'AMOLED', icon: '⬛' },
    { id: '', label: 'Light', icon: '☀️' },
    { id: 'theme-cyberpunk', label: 'Cyberpunk', icon: '🌃' },
    { id: 'theme-rgb', label: 'RGB', icon: '🌈' },
    { id: 'theme-holographic', label: 'Holographic', icon: '💎' }
  ]

  const isThemeActive = (id: string) => {
    if (id === 'dark') {
      return theme === 'dark' || theme === 'theme-cosmic' || (!theme && document.body.classList.contains('dark'))
    }
    return theme === id
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
      {themes.map(t => {
        const active = isThemeActive(t.id)
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`p-2.5 rounded-xl text-center text-xs transition-all ${
              active
                ? 'ring-2 ring-[var(--primary)] bg-[var(--card2)] font-semibold shadow-sm'
                : 'glass hover:bg-[var(--border)]'
            }`}
          >
            <div className="text-xl mb-1" aria-hidden="true">{t.icon}</div>
            <div className="truncate">{t.label}</div>
          </button>
        )
      })}
    </div>
  )
}
