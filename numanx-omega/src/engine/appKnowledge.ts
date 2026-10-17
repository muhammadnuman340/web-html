export interface KnowledgeEntry {
  keywords: string[]
  title: string
  content: string
  category: 'page' | 'feature' | 'setting' | 'howto' | 'trouble' | 'shortcut' | 'mode' | 'tip'
  related?: string[]
}

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // ── App Overview ──
  {
    keywords: ['what is', 'about', 'app', 'numanx', 'omega', 'overview', 'what does'],
    title: 'About NumanX Omega',
    content: 'NumanX Omega is a universal unit converter that handles 25+ categories including length, mass, volume, temperature, currency, crypto, and more. Features include natural language input (type "5 km in miles"), batch conversion, conversion chains, step-by-step explanations, real-world comparisons, and AI-powered suggestions. It works offline as a PWA and supports 6 user modes.',
    category: 'feature',
    related: ['pages', 'modes', 'how to convert']
  },

  // ── Pages ──
  {
    keywords: ['home', 'homepage', 'main', 'start'],
    title: 'Home Page',
    content: 'The Home page shows your dashboard overview with an animated logo, quick stats, recent categories, and feature highlights. Use it as your launchpad to navigate the app.',
    category: 'page',
    related: ['dashboard']
  },
  {
    keywords: ['converter', 'convert', 'universal converter'],
    title: 'Universal Converter',
    content: 'The Universal Converter is the core feature. Select a category (length, mass, etc.), type a value, choose source and target units, and get instant results. Supports natural language input like "5 km in miles" or "100 USD to EUR". Features include batch mode, chain mode, step-by-step explanations, real-world comparisons, and multiple copy formats (plain, Markdown, LaTeX).',
    category: 'page',
    related: ['how to convert', 'batch mode', 'chain mode', 'natural language']
  },
  {
    keywords: ['categories', 'browse', 'all categories'],
    title: 'Categories Page',
    content: 'Browse all 25+ conversion categories from the Categories page. Each category card shows its icon and name. Click a card to go to that category in the converter, or use the ⚡ quick-convert button for instant access.',
    category: 'page',
    related: ['converter']
  },
  {
    keywords: ['dashboard', 'stats', 'analytics', 'insights'],
    title: 'Dashboard',
    content: 'The Dashboard has tabs for Convert, Currency, Crypto, Health, Chains, and Insights. The Insights tab shows your conversion statistics, top categories, activity heatmap, AI-powered suggestions, and your conversion streak.',
    category: 'page',
    related: ['insights', 'streaks']
  },
  {
    keywords: ['currency', 'exchange', 'forex', 'money'],
    title: 'Currency Converter',
    content: 'Convert between world currencies with real-time exchange rates. Rates are cached for 60 minutes. Access from the Currency page or use the Currency Center on the Dashboard.',
    category: 'page',
    related: ['crypto', 'how to convert']
  },
  {
    keywords: ['crypto', 'bitcoin', 'ethereum', 'cryptocurrency'],
    title: 'Crypto Converter',
    content: 'Convert between cryptocurrencies (BTC, ETH, etc.) and fiat currencies using live price data. Features a swap button to reverse the pair, a loading spinner during updates, and a "live" pulse indicator.',
    category: 'page'
  },
  {
    keywords: ['formula', 'formulas', 'formula explorer', 'learn', 'education'],
    title: 'Formula Explorer',
    content: 'Browse conversion formulas organized by category. Each formula includes a title, explanation, and the mathematical relationship. Click any formula to copy it to your clipboard. Sections are collapsible for easy navigation.',
    category: 'page',
    related: ['converter']
  },
  {
    keywords: ['favorites', 'saved', 'bookmark', 'star'],
    title: 'Favorites',
    content: 'Save your most-used conversion pairs to Favorites for quick access. They are organized into groups: Math, Currency, Science, and Custom. Click any favorite to navigate directly to its converter. The AI will also suggest saving a pair to favorites after you convert it 3+ times.',
    category: 'page',
    related: ['how to save favorites']
  },
  {
    keywords: ['history', 'past', 'recent', 'activity log'],
    title: 'History',
    content: 'View your conversion history sorted chronologically. Each entry shows the conversion details with relative timestamps ("Just now", "5m ago", "Yesterday"). Use the search bar to filter by category or unit. Delete individual entries or clear all history from Settings.',
    category: 'page',
    related: ['settings']
  },
  {
    keywords: ['settings', 'preferences', 'options', 'config'],
    title: 'Settings',
    content: 'Customize your experience in Settings. Sections include: Appearance (theme selector with 5 themes, font selector with 3 options), Behavior (precision slider with live value readout, haptic feedback toggle), Data (clear history/favorites/custom units), and About (app version info).',
    category: 'page',
    related: ['themes', 'font', 'modes', 'haptic']
  },
  {
    keywords: ['custom units', 'custom', 'user defined'],
    title: 'Custom Units',
    content: 'Create your own custom units for any category. Define the unit name, abbreviation, and conversion factor relative to the base unit. Custom units appear in the converter dropdowns alongside built-in units.',
    category: 'page',
    related: ['converter']
  },
  {
    keywords: ['help', 'guide', 'support', 'faq'],
    title: 'Help & Guide',
    content: 'The Help page has two sections: a 12-card feature grid (2×3 responsive) that navigates to relevant pages, and an in-app guide organized as collapsible sections covering Getting Started, Features, Tips, and Troubleshooting. You can also access detailed guides from the /guides/:slug routes.',
    category: 'page'
  },

  // ── Features ──
  {
    keywords: ['natural language', 'nlp', 'smart input', 'type', 'phrase'],
    title: 'Natural Language Input',
    content: 'You can type conversions naturally in the input field. Examples: "5 km in miles", "100 USD to EUR", "(5m + 20cm) × 2", "convert 30C to F". The AI detects your intent and auto-selects units. A green "🧠 AI" badge appears when natural language is detected.',
    category: 'feature',
    related: ['converter', 'how to convert']
  },
  {
    keywords: ['batch', 'batch mode', 'multiple', 'bulk', 'csv'],
    title: 'Batch Mode',
    content: 'Convert multiple values at once using Batch Mode. Enter values separated by commas, newlines, or semicolons. Click "Convert All" to see results. Export results as CSV or JSON. Use the preset buttons ("1-100", "0-1000") to quickly generate value sequences.',
    category: 'feature',
    related: ['converter']
  },
  {
    keywords: ['chain', 'chain mode', 'step by step', 'multi step'],
    title: 'Conversion Chains',
    content: 'Chain Mode lets you perform multi-step conversions automatically. For example, convert length through multiple units (km → m → cm → mm) in one click. Select a chain from the bar above the converter results to see each step individually.',
    category: 'feature',
    related: ['converter']
  },
  {
    keywords: ['explain', 'explanation', 'steps', 'step by step', 'formula'],
    title: 'Step-by-Step Explanations',
    content: 'Click the 📖 button in the converter to see a detailed breakdown of your conversion, including the formula, each calculation step, and a plain-language explanation of the conversion factor. The 🤖 AI button shows an enhanced view with real-world context.',
    category: 'feature',
    related: ['ai explain', 'visual context']
  },
  {
    keywords: ['visual context', 'real world', 'comparison', 'visualize', 'reference'],
    title: 'Real-World Visual Comparisons',
    content: 'After converting, the app shows a real-world comparison to help you visualize the result. For example, "5 km ≈ the length of 50 football fields". Comparisons are available for length, mass, area, volume, temperature, and speed categories.',
    category: 'feature',
    related: ['explain']
  },
  {
    keywords: ['copy', 'clipboard', 'format', 'markdown', 'latex', 'plain'],
    title: 'Copy Formats',
    content: 'Right-click on any conversion result to open the context menu and choose a copy format: Plain ("5 km = 3.1 mi"), Markdown ("| 5 km | 3.1 mi |"), or LaTeX ("5\\,\\mathrm{km} = 3.1\\,\\mathrm{mi}"). Your preferred format is remembered.',
    category: 'feature',
    related: ['converter']
  },
  {
    keywords: ['unit comparison', 'all units', 'show all'],
    title: 'Unit Comparison Panel',
    content: 'Click "Show in all X units" below a conversion result to see the value converted into every unit in the current category. Clicking any row changes your target unit to that one.',
    category: 'feature',
    related: ['converter']
  },
  {
    keywords: ['fraction', 'frac', 'decimal', 'scientific', 'sci', 'precision'],
    title: 'Fraction & Scientific Mode',
    content: 'Use the "frac" button to show results as fractions (e.g., "3.14 ≈ 22/7"). Use the "sci" button for scientific notation (e.g., "1.23e+4"). The precision slider (0-12 decimal places) controls how many digits are shown.',
    category: 'feature',
    related: ['converter', 'settings']
  },
  {
    keywords: ['ai predictions', 'predict', 'suggest', 'autocomplete', 'also try'],
    title: 'AI Predictions & Suggestions',
    content: 'When you type a value, AI prediction chips appear suggesting common unit pairs ("km → miles"). After conversion, "Also try" chips show related conversions. The AI also suggests saving frequent pairs to Favorites, switching modes based on your patterns, and shows "Did you mean?" suggestions when conversion fails.',
    category: 'feature',
    related: ['favorites', 'modes']
  },
  {
    keywords: ['ai explain', 'ai explanation', 'explain conversion', 'what does this mean'],
    title: 'AI Explain Feature',
    content: 'Click the 🤖 AI button in the converter action bar to see a comprehensive explanation of your conversion. It combines the formula, step-by-step calculations, plain-language explanation, and real-world comparison in one clean panel.',
    category: 'feature',
    related: ['explain', 'visual context']
  },
  {
    keywords: ['quiz', 'conversion quiz', 'practice', 'test', 'learn'],
    title: 'Conversion Quiz',
    content: 'Test your conversion knowledge with the AI-powered Quiz. Access it via the "Quiz me" button in the converter\'s AI Quick Actions bar. You get random multiple-choice questions from any category, with score tracking and streak counting.',
    category: 'feature',
    related: ['ai assistant']
  },
  {
    keywords: ['streak', 'daily streak', 'conversion streak', 'gamification'],
    title: 'Conversion Streaks',
    content: 'Your daily conversion streak tracks how many consecutive days you\'ve used the app. View it in the converter (compact display) or on the Dashboard (full card with milestone badges at 3, 7, 14, 21, 30, 50, and 100 days).',
    category: 'feature',
    related: ['dashboard']
  },
  {
    keywords: ['focus mode', 'distraction free', 'minimal'],
    title: 'Focus Mode',
    content: 'Toggle Focus Mode from the header 🎯 button to hide distractions like FloatingTools, the Install PWA banner, and the footer. Great for late-night or concentrated conversion sessions.',
    category: 'feature'
  },
  {
    keywords: ['pwa', 'offline', 'install', 'progressive web app'],
    title: 'PWA & Offline Support',
    content: 'NumanX Omega is a Progressive Web App. You can install it on your device for a native-like experience. The app works offline for previously visited pages and supports the command bar (⌘K) for quick navigation.',
    category: 'feature'
  },
  {
    keywords: ['sidebar', 'navigation', 'menu'],
    title: 'Sidebar Navigation',
    content: 'Open the sidebar by clicking the hamburger icon ☰ in the header. It shows the app logo, mode picker (switch between 6 modes), section headers (Main, Features, Tools), and navigation links. The sidebar animates with a spring motion.',
    category: 'feature'
  },
  {
    keywords: ['search', 'search bar', 'find', 'lookup'],
    title: 'Header Search',
    content: 'Use the search bar in the header to quickly find categories and units. Type a partial name to see matching results. Click a result to navigate directly to the converter for that category.',
    category: 'feature'
  },
  {
    keywords: ['command bar', 'quick command', 'palette'],
    title: 'Command Bar',
    content: 'Press ⌘K to open the Command Bar — a quick-action palette like VS Code\'s command palette. Type to search for categories, units, or actions. Use arrow keys to navigate and Enter to execute. Supports quick conversions directly from the bar.',
    category: 'feature',
    related: ['shortcuts']
  },
  {
    keywords: ['clipboard', 'paste', 'clipboard detection'],
    title: 'Smart Clipboard Detection',
    content: 'When you focus on the converter input, the app checks your clipboard. If it contains a number or a value with a unit (like "5 km" or "5 km in miles"), a badge appears offering to paste and auto-convert it.',
    category: 'feature',
    related: ['converter']
  },
  {
    keywords: ['input history', 'arrows', 'up arrow', 'down arrow'],
    title: 'Input History',
    content: 'While typing in the converter, press ↑/↓ arrow keys to recall your last 20 entered values. This works like a command-line history for quick re-entry.',
    category: 'feature',
    related: ['converter']
  },

  // ── Settings ──
  {
    keywords: ['theme', 'light', 'dark', 'amoled', 'cyberpunk', 'rgb', 'holographic', 'appearance'],
    title: 'Themes',
    content: 'Choose from 5 themes in Settings → Appearance: Light (warm background), Dark/AMOLED (pure black for OLED screens), Cyberpunk (neon green/cyan), RGB (dynamic hue rotation), and Holographic (iridescent gradient). Your theme persists across sessions.',
    category: 'setting',
    related: ['settings']
  },
  {
    keywords: ['font', 'typography', 'inter', 'system', 'mono', 'jetbrains'],
    title: 'Font Options',
    content: 'Choose your preferred font in Settings → Appearance: Inter (modern sans-serif, default), System (your device\'s system font), or Inter + JetBrains Mono (monospace for code-like display). The font is applied before the page renders to prevent layout shift.',
    category: 'setting',
    related: ['settings']
  },
  {
    keywords: ['mode', 'student', 'engineer', 'fast', 'pro', 'trader', 'scientist'],
    title: 'App Modes',
    content: 'The app has 6 modes that tailor the UI: 🎓 Student (simplified UI + explanations), 🔧 Engineer (precision + advanced units), ⚡ Fast (minimal instant mode), 🚀 Pro (full analytics + AI, default), 💹 Trader (currency + crypto focus), 🔬 Scientist (constants + math). Switch modes from the sidebar or Settings.',
    category: 'setting',
    related: ['settings', 'sidebar']
  },
  {
    keywords: ['precision', 'decimal', 'decimal places', 'accuracy'],
    title: 'Precision Setting',
    content: 'Adjust decimal precision from 0 to 12 places in Settings → Behavior or directly in the converter via the precision slider. This controls how many decimal digits are shown in conversion results.',
    category: 'setting',
    related: ['converter', 'settings']
  },
  {
    keywords: ['haptic', 'vibrate', 'feedback', 'vibration'],
    title: 'Haptic Feedback',
    content: 'Toggle haptic (vibration) feedback on/off in Settings → Behavior. When enabled, supported devices vibrate briefly (10ms) on button presses and interactions for tactile feedback.',
    category: 'setting',
    related: ['settings']
  },

  // ── How-to Guides ──
  {
    keywords: ['how to convert', 'convert units', 'do a conversion', 'how do i convert'],
    title: 'How to Convert Units',
    content: '1. Go to the Converter page (🔄). 2. Type a value in the input field (e.g., "5" or "5 km in miles"). 3. Select a source unit from the left dropdown and a target unit from the right dropdown. 4. The result appears instantly. 5. Click the result to copy it, or right-click for format options.',
    category: 'howto',
    related: ['converter', 'natural language']
  },
  {
    keywords: ['how to save favorites', 'save conversion', 'bookmark', 'favorite a pair'],
    title: 'How to Save Favorites',
    content: 'After converting a pair 3+ times, a "⭐ Save to favorites" chip appears automatically. You can also navigate directly to the Favorites page to view and manage saved pairs. Favorites are organized into Math, Currency, Science, and Custom groups.',
    category: 'howto',
    related: ['favorites']
  },
  {
    keywords: ['how to change theme', 'change color', 'switch theme', 'dark mode'],
    title: 'How to Change Theme',
    content: 'Go to Settings → Appearance → Theme. Click any of the 5 theme cards to apply it instantly. You can also toggle light/dark mode from the header ☀️/🌙 button or with the ⌘D keyboard shortcut.',
    category: 'howto',
    related: ['themes', 'settings']
  },
  {
    keywords: ['how to use batch mode', 'batch convert', 'multiple values'],
    title: 'How to Use Batch Mode',
    content: '1. In the converter, click the 📋 Batch button. 2. Enter values separated by commas, newlines, or semicolons. 3. Click "Convert All". 4. View results inline. 5. Export as CSV or JSON using the download buttons.',
    category: 'howto',
    related: ['batch mode']
  },
  {
    keywords: ['how to use chains', 'chain conversion', 'multi step'],
    title: 'How to Use Conversion Chains',
    content: '1. In the converter, click a chain button (e.g., "Metric Units") in the chain bar. 2. The chain mode activates, showing each step. 3. Enter a value to see the result cascade through all steps. 4. Click "✕ Exit Chain" to return to normal mode.',
    category: 'howto',
    related: ['chain mode']
  },
  {
    keywords: ['how to clear history', 'delete history', 'clear data'],
    title: 'How to Clear History',
    content: 'Go to Settings → Data → "Clear All Data". This removes your conversion history, favorites, custom units, and saved preferences. There is no undo, so export any data you want to keep first.',
    category: 'howto',
    related: ['history', 'settings']
  },
  {
    keywords: ['how to install', 'install app', 'add to home screen', 'pwa install'],
    title: 'How to Install the App',
    content: 'When you visit the app in a supported browser, an Install banner may appear. Click it to add NumanX Omega to your device\'s home screen. You can also use the browser\'s "Add to Home Screen" or "Install" menu option for a native-like experience with offline support.',
    category: 'howto',
    related: ['pwa']
  },

  // ── Keyboard Shortcuts ──
  {
    keywords: ['shortcuts', 'keyboard shortcuts', 'keys', 'hotkeys', '⌘k'],
    title: 'Keyboard Shortcuts',
    content: 'Available shortcuts: ⌘K — Open command bar, ⌘⇧C — Quick convert popup, ⌘H — Open history, ⌘D — Toggle dark mode, ⌘⇧A — Toggle AI assistant, Esc — Close modals / clear input, ↑/↓ — Recall input history in converter.',
    category: 'shortcut',
    related: ['command bar']
  },

  // ── Troubleshooting ──
  {
    keywords: ['not working', 'bug', 'error', 'issue', 'problem', 'broken', 'troubleshoot'],
    title: 'Troubleshooting',
    content: 'Common issues: If conversion fails, check that you selected compatible units (you can\'t convert length to mass). If the app doesn\'t load, try clearing localStorage or using a private/incognito window. If currency rates are stale, wait 60 minutes for the cache to refresh or clear app data in Settings. For PWA issues, reinstall the app.',
    category: 'trouble',
    related: ['settings']
  },
  {
    keywords: ['conversion failed', 'can\'t convert', 'incompatible', 'units not compatible'],
    title: 'Conversion Fails — What to Do',
    content: 'When you see "Can\'t convert — incompatible units", it means the source and target units belong to different categories (e.g., trying to convert meters to kilograms). The AI will show "Did you mean?" suggestions with similar unit names from other categories. Check that both units are from the same category.',
    category: 'trouble',
    related: ['converter']
  },
  {
    keywords: ['data lost', 'lost data', 'reset', 'gone'],
    title: 'Data Lost?',
    content: 'Data is stored in your browser\'s localStorage. Clearing browser data or using a different browser/device will show a fresh state. To save your data, export it from History (CSV/JSON) before clearing. Conversion streaks and preferences are stored separately.',
    category: 'trouble',
    related: ['history', 'settings']
  },

  // ── Tips ──
  {
    keywords: ['tip', 'tips', 'hack', 'pro tip', 'power user'],
    title: 'Power User Tips',
    content: '• Type "5km in miles" directly — no dropdowns needed. • Use ↑/↓ in converter input to recall history. • Right-click results for copy format options. • Press ⌘K for quick navigation. • The sidebar mode picker changes the entire UI. • Watch for AI suggestion chips — they learn from your patterns. • Enable Focus Mode (🎯) for distraction-free work.',
    category: 'tip',
    related: ['converter', 'natural language', 'shortcuts']
  },
]

export function findKnowledge(query: string): KnowledgeEntry[] {
  const lower = query.toLowerCase()
  const words = lower.split(/\s+/).filter(w => w.length > 1)

  const scored = KNOWLEDGE_BASE.map(entry => {
    let score = 0
    const allTerms = [...entry.keywords, entry.title.toLowerCase()]

    // Direct title match
    if (entry.title.toLowerCase().includes(lower)) score += 10
    // Keyword matches
    for (const keyword of entry.keywords) {
      if (lower.includes(keyword)) score += 5
      if (keyword.includes(lower)) score += 3
    }
    // Word-level matches
    for (const word of words) {
      for (const term of allTerms) {
        if (term.includes(word)) score += 1
        if (word.includes(term) && term.length > 3) score += 2
      }
    }
    return { entry, score }
  })

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(s => s.entry)
}

export function getRandomTip(): KnowledgeEntry {
  const tips = KNOWLEDGE_BASE.filter(e => e.category === 'tip')
  return tips[Math.floor(Math.random() * tips.length)]
}

export function getPageHelp(pagePath: string): KnowledgeEntry | null {
  const path = pagePath.replace(/\/$/, '').split('/').pop() || ''
  const matches = KNOWLEDGE_BASE.filter(e =>
    e.category === 'page' && e.keywords.some(k => path.includes(k) || k.includes(path))
  )
  return matches[0] || null
}

export default KNOWLEDGE_BASE
