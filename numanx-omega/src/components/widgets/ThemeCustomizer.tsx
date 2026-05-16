export default function ThemeCustomizer({ theme, setTheme }: { theme: string; setTheme: (t: string) => void }) {
  const themes = [
    { id: 'theme-amoled', label: 'AMOLED', icon: '⬛' },
    { id: '', label: 'Light', icon: '☀️' },
    { id: 'theme-cyberpunk', label: 'Cyberpunk', icon: '🌃' },
    { id: 'theme-rgb', label: 'RGB', icon: '🌈' },
    { id: 'theme-holographic', label: 'Holographic', icon: '💎' }
  ]

  return (
    <div className="grid grid-cols-5 gap-2">
      {themes.map(t => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={`p-2 rounded-xl text-center text-xs transition-all ${theme === t.id ? 'ring-2 ring-[var(--primary)] bg-[var(--card2)]' : 'hover:bg-[var(--border)]'}`}
        >
          <div className="text-lg mb-1">{t.icon}</div>
          <div>{t.label}</div>
        </button>
      ))}
    </div>
  )
}
