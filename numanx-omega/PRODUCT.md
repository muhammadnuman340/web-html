# OMEGA X CONVERTER — PRODUCT SPECIFICATION (PRODUCT.md)

**Product:** Omega X Converter  
**Organization:** NumanX Studio  
**Application Root:** `numanx-omega/`  
**Governing Standard:** UI/UX Ultra Pro Max Specification  
**Status:** Canonical Product Definition (Phase 4 Step 2 Baseline)

---

## 1. PRODUCT IDENTITY

Omega X Converter is a client-side, precision-oriented unit conversion, metrology, and calculation platform. It is engineered to provide mathematically verified unit conversions across 24 standard scientific, engineering, and everyday domains, supported by authoritative standards references (NIST, BIPM, ISO, CODATA).

### Truthful Grounding & Communication Boundaries
To maintain metrological credibility, product documentation and user interfaces strictly avoid unverifiable superlative claims:
- **Prohibited assertions:** "Best converter", "most accurate converter in the world", "used by millions", "zero-latency", "guaranteed AI discovery", or "industry leading".
- **Truthful verifiable assertions:** "Client-side calculation execution", "deterministic conversion formulas", "24 canonical categories", "146 prerendered public routes", "offline PWA capability", "zero external tracking cookies".

---

## 2. JOBS-TO-BE-DONE (JTBD)

### 2.1 Primary Job-to-be-Done (Core Conversion Loop)
When a user encounters a quantity in an unfamiliar or non-target measurement unit, they need to convert it with absolute mathematical clarity, minimal friction, and zero doubt regarding the conversion factor or rounding mechanism.

**Step-by-Step Primary Flow:**
1. **Enter Value:** Input a numerical scalar or mixed mathematical expression.
2. **Select / Infer Source Unit:** Choose the source unit via keyboard, search, or let the natural language parser extract it.
3. **Select Target Unit:** Choose the desired output unit.
4. **Obtain Immediate Conversion:** Observe the computed value updated reactively on keypress without network round-trips.
5. **Understand Provenance:** View the conversion formula, NIST ratio, and step-by-step arithmetic derivation.
6. **Copy / Reuse Result:** Tap to copy the scalar or export in plain text, Markdown, or LaTeX formats.

### 2.2 Secondary Workflows (Existing Capabilities)
- **Multi-Unit Matrix Inspection:** View an input value simultaneously projected across all units within the active category.
- **Batch Processing:** Convert comma-, space-, or newline-delimited lists of values in a single operation, with CSV/JSON export.
- **Conversion Chains:** Trace relational, multi-step conversions (e.g. Energy Consumption $\to$ Fuel Required $\to$ Monetary Cost).
- **Live Financial Exchange:** Convert between 40+ world fiat currencies and cryptocurrency assets with cached API rates and offline persistence.
- **Formula & Constants Reference:** Explore static reference cards for standard physics, chemistry, engineering, and biometric equations.

### 2.3 Future Roadmap Capabilities (Not Yet Implemented)
- **Standalone Advanced Scientific Calculator Engine:** Dedicated expression parser, AST evaluator, operator precedence, and unit arithmetic (Phase 4 Step 6).
- **Compound Unit Input:** Parsing compound notation such as `5 ft 11 in` or `3 hr 25 min 10 s` directly in the conversion workbench (Phase 4 Step 6/7).
- **Live Parameterized Formula Solvers:** Dynamic variable inputs for engineering equations currently displayed as static cards (Phase 4 Step 6/7).

---

## 3. USER GROUPS & OPERATIONAL MODES

User groups are grounded strictly in the application modes evidenced in `src/components/widgets/ModeSwitcher.tsx`:

| User Group | Application Mode | Primary Workflow & UI Optimization |
| :--- | :--- | :--- |
| **Students** | `student` | Emphasizes step-by-step calculation steps, dimensional explanations, and natural language query hints ("try 5 km in miles"). |
| **Engineers** | `engineer` | Maximizes significant figures, provides decimal/fractional toggles (1/64"), and technical tolerances (sockets, wire gauges). |
| **Scientists** | `scientist` | Prioritizes physical constants ($c, \hbar, G, N_A$), scientific E-notation, SI base unit coherence, and logarithmic/radiation units. |
| **Traders / Travelers**| `trader` | Focuses on live fiat currency exchange rates, cryptocurrency tickers, rate age indicators, and currency pair toggles. |
| **General / Casual** | `fast` | Strips all ancillary widgets, chain selectors, and explanation cards; presents a minimalist, lightning-fast two-unit converter. |
| **Power Users** | `pro` | Default full intelligence mode: exposes batch conversion, multi-step chains, precision sliders, and comprehensive matrix tables. |

*Note:* No synthetic user demographics (age, geography, fabricated telemetry) are recognized or used in product planning.

---

## 4. CORE PRODUCT PRINCIPLES

1. **Tool-First Hierarchy:** The conversion workbench is the primary reason for user arrival. It must occupy prime above-the-fold visual priority on both desktop and mobile viewports.
2. **Deterministic Computation First:** Core calculations are strictly deterministic, executed offline in the client runtime via standard IEEE-754 double precision. AI or heuristics are never in the calculation critical path.
3. **Numerical Clarity:** Number displays must utilize tabular, fixed-width numerals (`tabular-nums`) to prevent horizontal jitter during rapid value manipulation.
4. **Immediate Feedback:** Conversions compute synchronously on input changes; latency is strictly governed by DOM update speed, never by network requests.
5. **Keyboard Operability:** Every conversion action (input, unit selection, unit swapping, copying) must be executable via keyboard navigation and global shortcuts (`⌘K`, `?`).
6. **Mobile Ergonomics:** Controls, unit selection drawers, and copy actions must comfortably fit one-handed thumb interaction on mobile devices with safe-area spacing.
7. **Progressive Complexity:** Default to an uncluttered two-unit conversion; reveal batch conversion, multi-step chains, and deep formula proofs through intentional disclosures.
8. **Transparent Precision:** Users must always know how many significant digits or decimal places are being displayed, with zero hidden truncation artifacts.
9. **Zero Fabricated Telemetry:** Never display synthetic counters, fake user numbers, or simulated social proof.
10. **Privacy & Offline Integrity:** User history, favorite pairs, and custom units reside exclusively in browser `localStorage`. No user telemetry is exfiltrated.

---

## 5. PRODUCT & RUNTIME CONSTRAINTS

### 5.1 Hardware Constraints (8 GB RAM & Mid-Range Mobile)
- **Target Devices:** Low- to mid-range smartphones (4–6 GB RAM), budget tablets, and standard laptops (8 GB RAM).
- **Bundle Size Discipline:** The production JavaScript bundle must remain strictly under the **350 kB** budget for the main entry chunk (`index-*.js`). Current production build: **320.88 kB** (101.83 kB gzip).
- **Rendering Overhead:** Background ambient canvas animations must cap particle counts (30 on mobile, 75 on desktop), cap device pixel ratio at 2 (`Math.min(dpr, 2)`), and pause execution when the browser tab is hidden.
- **Memory Pressure:** Minimize long-lived React component state; avoid retaining unbounded DOM trees or memory-heavy animation loops.

### 5.2 Ecosystem & Architecture Constraints
- **Prerendered SEO Baseline:** Must strictly preserve all **146 canonical public routes** and their exact XML sitemap representation (`/`, 10 core routes, 24 categories, 99 pairs, 6 guides, 6 blog posts).
- **Schema Graph Integrity:** Structured JSON-LD graphs (`WebApplication`, `Organization`, `BreadcrumbList`, `FAQPage`, `HowTo`) must match visible DOM content exactly.
- **AI Discovery Protocols:** `public/llms.txt` and `public/llms-full.txt` must remain in exact synchronization with the public route inventory.
- **Client-Side SPA Architecture:** No Node.js backend runtime in production; all capabilities must function over static hosting (Netlify) with service-worker offline caching.

---

## 6. NON-GOALS

Omega X Converter is intentionally scoped to avoid feature creep that degrades its metrological utility. Omega X must **NOT** become:

1. **A Generic SaaS Marketing Page:** It is a utility instrument, not a marketing funnel with centered promotional heroes and testimonial carousels.
2. **An AI-Chat-First Application:** It is not a conversational chatbot wrapper. The conversion interface is visual, direct, and tabular.
3. **A Neon Arcade / Cyberpunk Playground:** It will not feature eye-straining pure-black `#000000` backgrounds, neon glows, or endless hue-rotation animations.
4. **A Card-Grid Showcase:** It will not bury the primary conversion tool underneath sprawling grids of cards inside cards.
5. **A Fake Telemetry Console:** It will not present fabricated visitor statistics or synthetic live activity feeds.
6. **A Heavy Skeuomorphic Simulation:** It will not attempt to render hyper-realistic 3D metallic calipers or dials with Three.js/WebGL when a clean technical interface performs better.

---

## 7. DETERMINISTIC VS ASSISTIVE (AI) BOUNDARY

```
+-----------------------------------------------------------------------------------+
|                        ASSISTIVE & CONVENIENCE SUBSYSTEMS                         |
|   - Query Intent Parsing (src/engine/smartParser.ts)                              |
|   - Frequency-Based Recommendations (src/engine/aiEngine.ts)                      |
|   - Conversational Explanations (src/components/widgets/AIAssistant.tsx)          |
|   * ROLE: Input parsing, parameter normalization, and contextual guidance.        |
|   * AUTHORITY: 0% authority over numerical outputs. May NOT calculate.            |
+-----------------------------------------------------------------------------------+
                                          |
                                          | Passes normalized parameters:
                                          | { val: number, from: string, to: string }
                                          v
+-----------------------------------------------------------------------------------+
|                     DETERMINISTIC METROLOGICAL ENGINE (CORE)                      |
|   - Unit Ratios & Mathematical Models (src/engine/converter.ts)                   |
|   - Precision Sanitizer (src/utils/numbers.ts)                                    |
|   - Verified Authority Standards (src/config/authoritySources.ts)                |
|   * ROLE: Executes exact arithmetic: cleanFloat((v * fu.r) / tu.r).               |
|   * AUTHORITY: 100% authoritative over numerical truth and displayed results.    |
+-----------------------------------------------------------------------------------+
```

**Non-Negotiable Rule:** Assistive systems may suggest which units to compare, parse colloquial query text, or display helpful historical tips, but the calculated result must always originate exclusively from the deterministic conversion engine.

---

## 8. FUTURE CONVERSION-INTELLIGENCE ENGINEERING BACKLOG

*Note: Documented here strictly as future engineering backlog references derived from the Step 1 Architecture Audit. Mathematical remediation will occur in designated engineering steps, not in design-system steps.*

1. **`cleanFloat` Arithmetic Overflow Handling:** Refactor `src/utils/numbers.ts` line 6 so that non-finite values (`Infinity`) return `null` or an overflow error rather than collapsing silently to `0`.
2. **Intermediate Expression Overflow:** Address `(v * fu.r) / tu.r` intermediate float overflows when handling extreme astronomical or subatomic inputs ($|v| > 10^{200}$).
3. **Locale-Aware Decimal Parsing:** Resolve the ambiguity in `smartParser.ts` where `"1,500"` is unconditionally parsed as `1500` rather than allowing European decimal commas (`1.5`).
4. **Temperature Casing & Fallback Validation:** Harden `convertTemp` to validate unit IDs against the category definition and return `null` on unknown or case-mismatched inputs, rather than silently falling through to return the raw input.
5. **Astronomy Dimensional Conflation:** Separate distance units (`AU`, `ly`, `pc`) from mass units ($M_\odot$, $M_\oplus$) to prevent cross-dimensional conversions.
6. **Textile Dimensional Conflation:** Refactor `gsm` (areal density), `tc` (thread count), and `yc` (yarn count) from their current artificial `r: 1` assignment into distinct dimensional models.
7. **Dedicated Scientific Calculator Engine:** Replace the `/calculator` alias route with an actual zero-dependency Pratt-parser and AST evaluator.
