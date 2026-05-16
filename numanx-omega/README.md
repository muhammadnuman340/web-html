# NumanX Omega X — Universal Converter

A production-ready universal conversion app with 30+ categories, 200+ units, live currency/crypto rates, natural language input, analytics, and 5 themes.

## Features

- **30+ conversion categories**: Length, Mass, Volume, Area, Speed, Temperature, Time, Digital, Energy, Pressure, Angle, Frequency, Fuel, Force, and more
- **Live currency rates**: 40+ world currencies via exchangerate-api
- **Crypto converter**: 10+ cryptocurrencies via CoinGecko API
- **Natural language input**: "5 km in miles", "100 USD to EUR", "convert 30C to F"
- **Smart parsing**: Mixed expressions (5m + 20cm), fractions, imperial
- **AI-powered suggestions**: Learns from your usage patterns
- **4 modes**: Student (with explanations), Engineer (precision), Fast (minimal), Pro (full analytics)
- **5 themes**: AMOLED, Light, Cyberpunk, RGB, Holographic
- **Analytics**: Conversion tracking, productivity scoring, daily stats
- **History & Favorites**: localStorage-persisted
- **Health tools**: BMI, BMR calculators
- **Formula Explorer**: Physics, Chemistry, Engineering formulas
- **Glassmorphism UI**: Animated with Framer Motion
- **PWA**: Offline-ready with service worker
- **Zero backend**: Fully client-side

## Tech Stack

- React 19 + TypeScript 6
- Vite 8 + esbuild
- Tailwind CSS 4
- Framer Motion 12
- Chart.js + react-chartjs-2
- React Router 7
- localforage

## Scripts

```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint
npm run prod     # Build + serve
```

## Project Structure

```
src/
├── components/
│   ├── charts/       # CurrencyCenter chart component
│   ├── converter/    # UniversalConverter main component
│   ├── layout/       # Sidebar navigation
│   ├── ui/           # GlassCard, CommandBar, ParticleBackground
│   └── widgets/      # ModeSwitcher, ThemeCustomizer, SmartSuggestions, FloatingTools
├── engine/
│   ├── converter.ts  # Core conversion logic & category definitions
│   ├── categories.ts # 30+ category unit definitions
│   ├── analytics.ts  # Event tracking & productivity scoring
│   ├── aiEngine.ts   # AI-powered suggestions engine
│   ├── smartParser.ts# Natural language & mixed expression parsing
│   ├── learning.ts   # Educational explanations & formulas
│   ├── pluginSystem.ts # Plugin architecture
│   └── constants.ts  # Scientific constants, currency list, health formulas
├── hooks/
│   ├── useHistory.ts    # Conversion history
│   ├── useCurrency.ts   # Live currency rates
│   └── useLocalStorage.ts # Generic localStorage hook
├── pages/
│   ├── Home.tsx         # Landing page with quick convert
│   ├── Dashboard.tsx    # Tabbed dashboard (convert, currency, crypto, health, insights)
│   ├── Converter.tsx    # Standalone converter page
│   ├── Categories.tsx   # Category browser grid
│   ├── Currency.tsx     # Full currency converter page
│   ├── Crypto.tsx       # Crypto converter with live prices
│   ├── FormulaExplorer.tsx # Physics/chemistry formulas
│   ├── Favorites.tsx    # Saved conversion pairs
│   ├── History.tsx      # Conversion history
│   ├── Settings.tsx     # Theme, precision, data management
│   └── Help.tsx         # Keyboard shortcuts, tips
├── services/storage.ts  # localforage persistence layer
├── types/index.ts       # TypeScript type definitions
└── utils/numbers.ts     # Number formatting, fractions, parsing
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| ⌘K | Open command palette |
| Esc | Close modals / clear input |
| Tab | Swap from/to units |

## Themes

- **AMOLED** — Pure black, OLED-friendly, battery saving
- **Light** — Clean light mode
- **Cyberpunk** — Neon glow with dark purple & cyan accents
- **RGB** — Dynamic rainbow cycling
- **Holographic** — Frosted glass translucent cards
