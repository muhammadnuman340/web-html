# ROUTE SPECIFICATION: UNIVERSAL CONVERTER (`/converter`)

**Route:** `/converter`  
**Page Component:** `src/pages/Converter.tsx` (wrapping `UniversalConverter.tsx` with `variant="workbench"`)  
**Governing Archetype:** Utilitarian Swiss Technical Grid inside Spatial Bento Frame  
**Status:** Implemented & Verified (Phase 4 Step 4.1 Production Delivery)

---

## 1. TASK PRIORITY & OBJECTIVE

The Universal Converter is the dedicated full-screen workhorse of the application.
- **Priority 1:** Frictionless, high-precision two-unit conversion with keyboard-first operation and immediate metrological feedback.
- **Priority 2:** Deep unit exploration via the Live Multi-Unit Matrix with instant click-to-target selection.
- **Priority 3:** Power-user instrument modules: mathematical step-by-step derivations, NIST provenance, precision slider (0–12), fraction/scientific notation, batch conversion, and conversion chains.

---

## 2. 25% SILHOUETTE & ABOVE-THE-FOLD HIERARCHY

The workbench occupies $> 65\%$ of above-the-fold viewport height on desktop with a minimal $(< 50\text{px})$ header bar:

```
+---------------------------------------------------------------------------------------------------+
|  PAGE HEADER: "Universal Converter" + Metrological Domain Metadata (< 50px vertical footprint)     |
+---------------------------------------------------------------------------------------------------+
|  CELL A: CATEGORY DIRECTORY STRIP (Level 1 Surface)                                               |
|  [ Active Category Badge ]  [ Search Input ]  [ 24 Category Chips: 📏Length  ⚖️Mass  🧪Volume ... ] |
+---------------------------------------------------------------------------------------------------+
|  CELL B: PRIMARY CONVERSION WORKBENCH (Swiss Technical Grid — 12-Column Responsive Layout)         |
|  +---------------------------------------------+-----+------------------------------------------+ |
|  | SOURCE QUANTITY WELL (Cols 1-5, Level 3)    |     | TARGET READOUT WELL (Cols 7-12, Level 3) | |
|  | [ Unit Family Chips: All|Metric|Imp|Sci ]   |     | Converted Output Display:                | |
|  | Enter Value:                                |SWAP | [ 328.08399                      ]       | |
|  | [ 100.00                      ] [Unit ▾]    | ⇅   | Target Unit: [ft ▾]                      | |
|  | STEP: [-10] [-1] [+1] [+10] [×2] [÷2] [0]    |44px | Action Row: [plain|md|latex] [📤] [📋]   | |
|  | Prec: [0 =======●== 12]  [frac]  [sci]      |     | Telemetry: Formula & NIST Ratio          | |
|  +---------------------------------------------+-----+------------------------------------------+ |
+---------------------------------------------------------------------------------------------------+
|  CELL C: SECONDARY BENTO LOWER SHELF (3 Dedicated Functional Bento Modules)                       |
|  +-------------------------+-----------------------------------+--------------------------------+ |
|  | MODULE 1:               | MODULE 2:                         | MODULE 3:                      | |
|  | Live Multi-Unit Matrix  | Step-by-Step Derivation & NIST    | Advanced Metrology Instruments | |
|  | (13 units with live     | Mathematical formula step-by-step | Value Presets (1, 5, 10...)    | |
|  | values, click to select)| context & physical equivalence    | Batch Mode & Chains Toggles    | |
|  +-------------------------+-----------------------------------+--------------------------------+ |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. SURFACES & OKLCH PALETTE HIERARCHY

- **Page Frame:** Canvas background (`--bg`, Level 0).
- **Cell A (Category Strip):** Level 1 surface (`--surface-1`) with `--border-subtle` border and horizontal scroll containment.
- **Cell B (Primary Swiss Grid Workbench):** Level 2 elevation (`--surface-2`) with 12-column CSS grid on desktop, single column on mobile.
- **Source & Target Wells:** Level 3 receptacles (`--surface-3`) with `--border-control` border (2px), switching to `--primary` focus ring when active.
- **Central Swap Bridge:** Circular 48×48px button with `--accent` background, rotating $180^\circ$ smoothly on each invocation via spring physics.
- **Typography:** Inter for structural metadata and labels; JetBrains Mono with tabular numbers (`tabular-nums`) for all numeric inputs, readouts, step modifiers, and derivation steps.

---

## 4. ARCHITECTURAL DUAL-MODE PRESENTATION

`UniversalConverter.tsx` exposes an explicit `variant?: 'workbench' | 'embedded'` prop:
- `variant="workbench"`: Full Spatial Bento metrology workstation active on `/converter`.
- `variant="embedded"`: Backward-compatible card format preserved for multi-purpose embedding across `Home.tsx`, `CategoryLanding.tsx`, `PairLanding.tsx`, `BlogPost.tsx`, `GuidePage.tsx`, and `Dashboard.tsx`.

---

## 5. FORBIDDEN PATTERNS & ANTI-SLOP COMPLIANCE

1. **NO Redundant `<GlassCard>` Wrappers:** Page wrapper in `src/pages/Converter.tsx` removed; replaced with semantic header and direct workbench mounting.
2. **NO Row of Low-Contrast Raw Stepper Pills:** Stepper buttons comply with 44×44px minimum touch targets and meet WCAG AA contrast against Level 3 background.
3. **NO Cluttered Eyebrow Badges:** Simplified, clean metrology headers without decorative or marketing tags.
4. **NO Ambient Canvas Bleed:** Contrast maintained across all six themes (`light`, `dark`, `theme-cosmic`, `theme-amoled`, `theme-cyberpunk`, `theme-rgb`, `theme-holographic`).

---

## 6. RESPONSIVE BEHAVIOR & TOUCH TARGETS

- **Mobile Viewports (320px – 430px):**
  - Grid collapses to 1-column linear vertical flow.
  - Category selector maintains touch-friendly chip list with horizontal scroll and zero page overflow (`scrollWidth === innerWidth = 320px`).
  - Source input, unit selectors, steppers, swap button, and action buttons strictly satisfy $\ge 44 \times 44\text{px}$ touch targets.
- **Tablet (768px):**
  - Balanced stacked workbench with preserved tactile controls.
- **Desktop (1024px – 1440px+):**
  - 12-column Swiss Technical grid (Cols 1–5 Source, Col 6 Swap Bridge, Cols 7–12 Target Readout).
  - Cell C renders as a 3-column lower shelf below the primary engine.

---

## 7. ACCESSIBILITY & METROLOGICAL INTEGRITY

- `input[inputMode="decimal"]` receives keyboard focus and auto-select on mount.
- `role="region" aria-live="polite"` announces converted results for screen reader users with dedicated hidden narrative (`"100 um equals 100,000 nm"`).
- Keyboard shortcuts: `Ctrl+K` (category search), `S` (swap), `C` (copy), `Esc` (close suggestions/drawers).
- Mathematical conversion engine untouched: deterministic decimal calculation via `src/engine/converterCore.ts`.
