# ROUTE SPECIFICATION: HOME PAGE (`/`)

**Route:** `/`  
**Page Component:** `src/pages/Home.tsx`  
**Governing Archetype:** Spatial Bento Launcher & Instrument-First Gateway  
**Status:** Implemented & Verified (Phase 4 Step 4.2 Production Delivery)

---

## 1. TASK PRIORITY & OBJECTIVE

The Home page serves as the high-velocity launcher for the Omega X platform.
- **Priority 1 (80% of intent):** Immediate unit conversion via the primary embedded conversion workbench directly above the fold without forced scrolling.
- **Priority 2 (15% of intent):** Rapid one-tap navigation to all 24 canonical metrological categories and popular conversion pairs.
- **Priority 3 (5% of intent):** Exploration of educational metrological reference guides, editorial articles, and factual platform architecture metrics.

---

## 2. 25% SILHOUETTE & ABOVE-THE-FOLD HIERARCHY

### Above-The-Fold Layout (Desktop & Tablet)
```
+---------------------------------------------------------------------------------------------------+
|  NAVBAR: [Ω NumanX Omega]                [Tools ▾]  [About]  [Blog]  [Settings]   [Theme]  [Search]|
+---------------------------------------------------------------------------------------------------+
|  COMPACT MASTHEAD: [NΩ] Omega X Converter — Precision Metrology Suite (< 80px vertical footprint)  |
+---------------------------------------------------------------------------------------------------+
|  PRIMARY CONVERSION WORKBENCH (Dominant Embedded Centerpiece)                                     |
|  [Category Selector Strip]                                                                        |
|  [Value Input Receptacle]              [Unit Reversal ⇅]             [Converted Result Readout]    |
|  [Source Unit Dropdown]                                              [Target Unit Dropdown]       |
+---------------------------------------------------------------------------------------------------+
|  CANONICAL METROLOGY DOMAINS (All 24 Categories Grid: Length, Mass, Temp, Volume, Time, Area...)  |
+---------------------------------------------------------------------------------------------------+
|  POPULAR CONVERSION PAIRS (m→ft, kg→lb, °C→°F, km→mi, L→gal, g→oz, km/h→mph, bar→psi)            |
+---------------------------------------------------------------------------------------------------+
|  METROLOGICAL GUIDES & EDITORIAL REFERENCE (Meters to Feet, Pounds to Kg, Metric vs Imperial...)  |
+---------------------------------------------------------------------------------------------------+
|  FACTUAL PLATFORM ARCHITECTURE METRICS: [24 Domains] [181 Unit Listings] [99 Guides] [0 Trackers]|
+---------------------------------------------------------------------------------------------------+
```

### Mobile Silhouette ($< 640\text{px}$)
- Masthead is compressed to a clean single line title (`NΩ Omega X Converter`).
- The Primary Conversion Workbench sits directly beneath the masthead within the first $320\text{px}$ of the screen.
- Category shortcuts display in a clean, 2-column touch-friendly grid with $\ge 44\text{px}$ touch targets.
- 0px horizontal page overflow down to $320\text{px}$ width.

---

## 3. ALLOWABLE SURFACES & PALETTE RULES

- **Base Canvas:** Canvas background (`--bg`, Level 0).
- **Primary Converter Container:** Level 2 elevation (`--surface-2`) with `--border-subtle` ($1\text{px}$).
- **Active Numeric Input:** Level 3 receptacle (`--surface-3`) with `--border-control`, transitioning to `--primary` on focus.
- **Result Output Readout:** Level 3 receptacle (`--surface-3`) with monospace tabular numerals.
- **Domain & Pair Cards:** Level 1 cards (`--surface-1`) with subtle hover border transition to `--primary`.

---

## 4. FORBIDDEN PATTERNS & ANTI-SLOP ENFORCEMENT

1. **NO Fabricated Visitor / Combination Counters:** Removed the unsupported `∞ Combinations` and fabricated random visitor counters. All displayed counts are factual (24 domains, 181 category unit listings, 99 published pair guides, zero third-party trackers).
2. **NO Massive Marketing Heros:** Masthead text and badge strictly capped under $80\text{px}$ vertical footprint.
3. **NO Decorative Animations:** Removed the spinning 4-second infinite rotating logo.
4. **NO Nested Glass Cards:** The converter sits directly on Level 2 elevation without intermediate glass wrappers.
5. **NO Emojis in Headings:** H1 and H2 headings use clean, authoritative semantic typography without decorative emojis.

---

## 5. RESPONSIVE BEHAVIOR

- **320px–375px:** Input and output stack vertically. Category cards render as a 2-column grid. Full zero-overflow compliance.
- **768px:** Dual-column Swiss Technical grid activates for input/output pairing. Category grid expands to 3 columns.
- **1024px+:** Full Spatial Bento layout with 4-column category grid and 4-column pair grid.

---

## 6. ACCESSIBILITY CONSIDERATIONS

- Heading hierarchy: `H1` ("Omega X Converter") followed by semantic section headings (`H2: Primary Conversion Instrument` [screen reader only], `H2: 24 Metrological Domains`, `H2: Popular Conversion Pairs`, `H2: Metrological Guides & Editorial Reference`).
- All interactive links and controls satisfy the project's $\ge 44 \times 44\text{px}$ touch target standard.
- ARIA live region announces converted results instantly on input.
- High contrast compliant with WCAG AA/AAA across all six selectable themes.
