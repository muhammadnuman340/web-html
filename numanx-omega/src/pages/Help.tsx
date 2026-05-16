import { motion } from 'framer-motion'

export default function Help() {
  const shortcuts = [
    ['Tab', 'Swap from ↔ to units'],
    ['Esc', 'Clear input'],
    ['/', 'Focus search'],
    ['Ctrl+C', 'Copy result'],
    ['Ctrl+D', 'Toggle dark mode'],
    ['Ctrl+S', 'Scientific notation'],
    ['Ctrl+F', 'Fraction mode'],
    ['Ctrl+E', 'Export history'],
    ['↑/↓', 'Navigate results'],
    ['Enter', 'Select result']
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">ℹ️ Help Center</h2>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-4 space-y-4">
        <div>
          <div className="text-sm font-semibold mb-2">⌨️ Keyboard Shortcuts</div>
          <div className="space-y-1">
            {shortcuts.map(([key, desc]) => (
              <div key={key} className="flex justify-between text-sm p-1.5 rounded-lg hover:bg-[var(--border)]">
                <span className="font-mono font-bold px-2 py-0.5 rounded bg-[var(--border)] text-xs">{key}</span>
                <span className="opacity-60 text-xs">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold mb-2">🎯 Features</div>
          <ul className="text-xs opacity-60 space-y-1 list-disc pl-4">
            <li>30+ conversion categories with 200+ units</li>
            <li>Live currency rates (40+ currencies)</li>
            <li>Crypto converter with live CoinGecko prices</li>
            <li>Smart input parsing (5ft 3in, 1/2, etc.)</li>
            <li>Scientific notation & fraction display</li>
            <li>Batch convert multiple values at once</li>
            <li>Custom units creator</li>
            <li>Voice input support</li>
            <li>BMI, BMR & health calculators</li>
            <li>Scientific calculator built-in</li>
            <li>Formula explorer with physics & chemistry</li>
            <li>All-conversions table with visual bars</li>
            <li>PWA installable, works offline</li>
            <li>5 themes: AMOLED, Light, Cyberpunk, RGB, Holographic</li>
          </ul>
        </div>

        <div>
          <div className="text-sm font-semibold mb-2">🎨 Themes</div>
          <div className="text-xs opacity-60 space-y-1">
            <p><strong>AMOLED</strong> — Pure black background, perfect for OLED screens, battery saving</p>
            <p><strong>Light</strong> — Clean light mode for daytime use</p>
            <p><strong>Cyberpunk</strong> — Neon glow with dark purple, cyan & magenta accents</p>
            <p><strong>RGB</strong> — Dynamic rainbow cycling mode</p>
            <p><strong>Holographic</strong> — Frosted glass with translucent cards</p>
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold mb-2">📖 Tips</div>
          <div className="text-xs opacity-60 space-y-1">
            <p>• Use the search bar to quickly find categories or units</p>
            <p>• Click any row in "All Conversions" to set it as your target unit</p>
            <p>• Pin your most-used conversions with the ☆ star button</p>
            <p>• Click the 🎤 mic for voice input (Chrome/Firefox)</p>
            <p>• Install the app via browser menu for offline access</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
