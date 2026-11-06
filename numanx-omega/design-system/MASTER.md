# OMEGA X DESIGN SYSTEM — MASTER GOVERNANCE (MASTER.md)

**Product:** Omega X Converter  
**Organization:** NumanX Studio  
**Directory:** `numanx-omega/design-system/`  
**Governing Standard:** UI/UX Ultra Pro Max Specification  
**Status:** Canonical Design-System Specification (Phase 4 Step 2 Baseline)

---

## 1. SEMANTIC TOKEN ARCHITECTURE

The Omega X design system utilizes a semantic, role-based token architecture. Tokens represent functional intent rather than raw chromatic values, enabling seamless light/dark mode parity and accessibility enforcement.

*Note: The physical OKLCH stylesheet (`tokens.css`) will be implemented during Phase 4 Step 3. No code changes are introduced in this specification step.*

### 1.1 Semantic Token Roles

| Token Name | Semantic Role & Usage Description |
| :--- | :--- |
| `--surface-0` | **Application Canvas Base:** Deepest ground surface behind all content. |
| `--surface-1` | **Recessed Structural Panels:** Background for toolbars, sidebars, and footers. |
| `--surface-2` | **Elevated Workbench Tiles:** The primary conversion frame and matrix containers. |
| `--surface-3` | **Active Receptacles:** Input fields, dropdown triggers, and numeric readouts. |
| `--text-primary` | **Primary High-Contrast Copy:** Inputs, results, headlines, and active labels. |
| `--text-secondary` | **Secondary Instructional Copy:** Body paragraphs, explanations, and standard units. |
| `--text-muted` | **Tertiary Metadata:** Captions, timestamps, and subtotals (must maintain $\ge 4.5:1$ contrast). |
| `--border-subtle` | **Structural Dividers:** Hairline partition lines separating bento cells ($1\text{px}$). |
| `--border-default` | **Control Boundaries:** Default borders around inactive inputs and dropdowns. |
| `--border-active` | **Engaged Boundaries:** Focused, hovered, or active control perimeters. |
| `--accent` | **Primary Brand Focal:** Active unit chips, primary convert triggers, and progress bars. |
| `--accent-hover` | **Interactive Accent Hover:** High-intent state shift for interactive accent controls. |
| `--accent-focal` | **Telemetry Focal:** High-visibility laser cyan highlight for numerical outputs. |
| `--status-success` | **Confirmation State:** Copied to clipboard, successful batch completion, valid inputs. |
| `--status-warning` | **Cautionary Notice:** Stale financial exchange rates, boundary approximations. |
| `--status-danger` | **Error & Incompatible Units:** Incompatible unit pairs, syntax errors, divisions by zero. |
| `--status-info` | **Metrological Explanations:** Formula reference cards and educational notes. |
| `--focus-ring` | **Universal Accessibility Ring:** High-contrast focus indicator for keyboard navigation. |

---

## 2. THREE-TIER TYPOGRAPHY ARCHITECTURE

Omega X establishes a disciplined 3-tier typographic model that balances readability, technical authority, and mathematical precision:

```
+-------------------------------------------------------------------------------------------------------+
| TIER 1: DISPLAY LAYER                                                                                 |
| Role: Brand marks, H1 titles, major category headlines.                                               |
| Target Font Family: Space Grotesk / Refined Geometric Sans (fallback: Inter Display, -apple-system)    |
| Attributes: Letter-spacing -0.02em, font-weight 700, tight line-height 1.15–1.25.                     |
+-------------------------------------------------------------------------------------------------------+
| TIER 2: UI & INSTRUCTIONAL BODY LAYER                                                                 |
| Role: Form labels, dropdown triggers, navigation links, explanations, FAQ copy, documentation.       |
| Target Font Family: Inter / System Sans (-apple-system, BlinkMacSystemFont, Segoe UI)                 |
| Attributes: High optical legibility, open counters, regular tracking, line-height 1.5–1.6.           |
+-------------------------------------------------------------------------------------------------------+
| TIER 3: TELEMETRY, VALUES & CODE LAYER                                                                |
| Role: Numerical inputs, converted results, NIST ratios, matrix rows, formulas, timestamps.            |
| Target Font Family: JetBrains Mono / Cascadia Code (fallback: Consolas, monospace)                   |
| Mandatory Requirement: font-variant-numeric: tabular-nums;                                            |
| Attributes: Fixed-width numbers, strict vertical column alignment, distinct 0/O and 1/l glyphs.       |
+-------------------------------------------------------------------------------------------------------+
```

*Dependency Policy:* No new font dependencies are installed during Step 2. System and existing project fallbacks remain in effect until formal font configuration in Step 3.

---

## 3. FOUR-LEVEL SURFACE HIERARCHY

To permanently eradicate "card-inside-card" nesting and visual clutter, surfaces are strictly limited to four functional elevation tiers:

```
Level 0: Application Base Canvas (--surface-0)
  └─ Level 1: Structural Section / Toolbar Framing (--surface-1)
       └─ Level 2: Workbench Tile / Bento Cell Container (--surface-2)
            └─ Level 3: Active Input / Output Receptacle (--surface-3)
```

### Governance Rules
1. **Luminance Over Shadows:** Elevation between Level 0 and Level 2 is achieved by shifting background luminance and applying crisp `$1\text{px}$` borders (`--border-subtle`), not by stacking aggressive drop shadows.
2. **Zero Nested Cards:** A Level 2 container may never contain another Level 2 card. Internal groupings inside Level 2 must use Level 3 input wells or subtle hairline partitions.

---

## 4. SPACING GOVERNANCE

Spacing follows an 8-point geometric scale ($4\text{px}, 8\text{px}, 12\text{px}, 16\text{px}, 24\text{px}, 32\text{px}, 48\text{px}$):
- **Compact Technical Density:** Form fields, unit dropdowns, and stepper buttons utilize dense $8\text{px}$ internal padding and $8\text{px}\text{–}12\text{px}$ gutters to keep the entire primary converter visible above the fold.
- **Generous Content Rhythm:** Reading surfaces (guides, blog posts, standards statements) utilize $24\text{px}\text{–}32\text{px}$ section gaps to maintain comfortable reading pacing.
- **Consistent Viewport Padding:** Layouts maintain $16\text{px}$ horizontal gutters on mobile ($< 640\text{px}$) and $24\text{px}\text{–}32\text{px}$ on desktop viewports.

---

## 5. CORNER RADIUS GOVERNANCE

Omega X uses a tight, coherent corner radius family to avoid "pill saturation":

| Radius Token | Metric | Permitted Usage |
| :--- | :--- | :--- |
| `radius-sm` | `6px` | Compact buttons, tooltips, tags, code snippets, stepper controls. |
| `radius-md` | `10px` | Input fields, unit dropdown selectors, buttons, context menus. |
| `radius-lg` | `14px` | Elevated workbench tiles, bento cells, modal dialogs, drawer panels. |
| `radius-full` | `9999px` | Circular icon buttons (e.g. Unit Swap `⇅`), status indicator dots. |

**Prohibited:** Transforming full-width inputs or rectangular cards into elongated pills (`rounded-3xl` or `rounded-full` on cards).

---

## 6. MOTION & INTERACTION TIMING GOVERNANCE

Motion is used strictly as functional confirmation of user intent, never as visual spectacle:

1. **Hover & Press Feedback:** Fast transitions between $100\text{ms}$ and $150\text{ms}$ (`ease-out`) for subtle lift or background shifts.
2. **Control State Transitions:** $150\text{ms}\text{–}200\text{ms}$ spring physics for unit swapping, dropdown expansions, and toast notifications.
3. **Number Updates:** Animated scalar transitions (`numberRoll`) must finish within $250\text{ms}$ without blocking subsequent user keystrokes.
4. **Transform/Opacity Preference:** All animations must animate `transform` and `opacity` exclusively to preserve 60fps GPU acceleration.
5. **No Infinite Looping:** Prohibit infinite CSS animations (e.g., continuous hue-rotations, perpetual border glow cycling).

---

## 7. BLUR & TRANSPARENCY GOVERNANCE

To protect mobile battery life and eliminate GPU fillrate bottlenecks on 4–8 GB RAM devices:

1. **Maximum Two Blur Layers:** The viewport must never composite more than two simultaneous `backdrop-filter: blur(...)` layers.
2. **No Stacked Glass Cards:** Placing a `.glass` card inside a `.glass-liquid` container is strictly forbidden.
3. **Mobile Simplification:** On viewports $< 768\text{px}$, backdrop blurs may be automatically degraded to semi-opaque solid surfaces with high-contrast borders if device rendering drops below 60fps.
