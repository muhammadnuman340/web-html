# OMEGA X CONVERTER — DESIGN CONSTITUTION (DESIGN.md)

**Product:** Omega X Converter  
**Organization:** NumanX Studio  
**Application Root:** `numanx-omega/`  
**Governing Standard:** UI/UX Ultra Pro Max Specification  
**Status:** Canonical Design Governance (Phase 4 Step 2 Baseline)

---

## 1. DESIGN CHARACTER & METAPHOR

The visual and interaction character of Omega X Converter is:

```text
High-Precision Metrology Instrument
Technical Laboratory Workbench
```

It draws inspiration from precision analytical equipment, digital calipers, multimeters, and laboratory bench instruments. It communicates authority, calibrated accuracy, and quiet competence.

### Avoiding Literal Skeuomorphism
This character is expressed through:
- Crisp hairline borders and calibrated surface steps.
- Fixed-width, tabular numerical data readouts (`tabular-nums`).
- Restrained, intentional interactions with high tactile feedback.
- Clean functional hierarchy with zero ornamental chrome, faux screw heads, plastic bevels, or metallic textures.

---

## 2. PRIMARY MACROSTRUCTURE: SPATIAL BENTO WORKBENCH

Omega X Converter utilizes a single unified application macrostructure:

```text
PRIMARY MACROSTRUCTURE: Spatial Bento Workbench
```

### Architectural Principles
1. **Dominant Conversion Workspace:** The primary conversion tile (input value, source unit, target unit, swap button, result readout) is the focal center of the viewport and must dominate above-the-fold screen space.
2. **Functional Bento Cells:** Secondary and contextual modules occupy deliberate spatial perimeter cells organized by logical proximity:
   - *Quick Steppers / Increments:* Integrated directly with the input receptacle.
   - *Multi-Unit Matrix:* Lives in an adjacent cell for immediate cross-unit scanning.
   - *Mathematical Derivation & Provenance:* Resides in an expandable lower cell.
   - *Category Standards & Cheat Sheets:* Positioned below the primary conversion cluster.
3. **Responsive Linear Collapse:** On mobile viewports ($< 768\text{px}$), the multi-cell Bento grid collapses into a strict, thumb-optimized linear flow:
   `Header -> Unit Pair Selector -> Numeric Input -> Converted Result -> Secondary Actions`.

---

## 3. CORE INTERACTION LANGUAGE: UTILITARIAN SWISS TECHNICAL GRID

For precision converter controls, numerical fields, matrices, ratios, calculator surfaces, and dense technical controls, the interface strictly applies the **Utilitarian Swiss Technical Grid**:

- **Strict Columnar Alignment:** Numeric labels, units, and values adhere to rigid mathematical grids with zero visual drift.
- **Tabular Figures:** All dynamic numerical readouts require `font-variant-numeric: tabular-nums` to eliminate character jitter during typing or conversion updates.
- **Restrained Spatial Density:** Whitespace is calibrated for high information density without visual crowding.
- **Surface Luminance over Container Clutter:** Depth and elevation are communicated through subtle tonal shifts in surface luminance and delicate hairlines (`border-subtle`), rather than heavy drop-shadows or nested card borders.
- **Low Decoration:** Icons are used strictly as semantic signifiers, never as background filler or ornamental decoration.

---

## 4. CONTENT PRESENTATION LANGUAGE: EDITORIAL BROADSHEET

For documentation, standards citations, educational guides, blog articles, and FAQ sections, the interface transitions to an **Editorial Broadsheet** layout:

- **Authoritative Typographic Hierarchy:** Clear distinctions between section headlines, metrological commentary, and tabular formula charts.
- **Single-Column Narrative Flow:** Reading experiences are constrained to comfortable reading widths ($65\text{–}75$ characters per line) with generous vertical rhythm.
- **Permanent Crawlable Visibility:** Critical educational and FAQ text is rendered directly in the document flow with full semantic HTML tags to ensure search engine and accessibility parity.

---

## 5. THE 60 / 30 / 10 PROPORTION RULE

Visual composition adheres strictly to the classic 60 / 30 / 10 surface balance:

```
+-------------------------------------------------------------------------------------------------------+
|  60% — DOMINANT TECHNICAL BASE                                                                        |
|  Calibrated, neutral slate foundation surfaces (--surface-0, --surface-1).                            |
|  Provides calm visual stability and eliminates eye fatigue.                                          |
+-------------------------------------------------------------------------------------------------------+
|  30% — STRUCTURAL WORKBENCH CELLS                                                                     |
|  Elevated tool receptacles, input boxes, matrices, and navigation toolbars (--surface-2, --surface-3).|
|  Defines clear spatial boundaries and actionable surfaces.                                           |
+-------------------------------------------------------------------------------------------------------+
|  10% — HIGH-INTENT FOCAL ACCENT                                                                       |
|  High-contrast, saturated laser indigo and cyan highlights (--accent, --accent-focal).                |
|  Reserved strictly for active unit selections, primary calculation results, and focus rings.        |
+-------------------------------------------------------------------------------------------------------+
```

*Color System Note:* Colors will be formally migrated to perceptual OKLCH coordinates during Step 3. No arbitrary or disconnected color schemes are permitted outside this ratio.

---

## 6. ANTI-SLOP RULES (GOVERNANCE RESTRICTIONS)

To maintain Omega X Converter as a professional-grade metrological instrument, the following design patterns are **strictly prohibited**:

1. **Fabricated Metrics & Synthetic Social Proof:** Never display fake live counters, simulated conversion counts, or fabricated user statistics (e.g., `Math.random() + 42000`).
2. **Purple / Magenta Gradient Clichés:** Prohibit ubiquitous "AI startup" gradients combining bright violet, magenta, and pink on hero text or primary buttons.
3. **Neon Cyberpunk & Arcade Styling:** Prohibit harsh neon green/cyan on pure black backgrounds (`#000000`) that cause visual fatigue and readability failure.
4. **Rainbow Accent Bars:** Prohibit gratuitous decorative multi-color gradient strips (e.g. `.gradient-accent` below navigation headers).
5. **Card-Inside-Card Nesting:** Prohibit wrapping an interactive card inside a glass container inside a main container. Group elements via whitespace and luminance steps.
6. **Uncontrolled Glassmorphism:** Prohibit stacking multiple layers of `backdrop-filter: blur(...)` that cause GPU overdraw and degrade mobile battery life.
7. **Eyebrow Badge Clutter:** Prohibit scattering redundant badges (e.g., `AI`, `Did you mean`, `Intent: convert`) across standard interfaces.
8. **Excessive Pill Controls:** Prohibit sprawling rows of rounded pill buttons where subtle segmented controls or dropdowns provide cleaner organization.
9. **Giant Marketing Heroes:** Prohibit tall, empty promotional banners that push the functional conversion tool below the viewport fold.
10. **Infinite Looping Animations:** Prohibit continuous CPU/GPU animations such as `hue-rotate` color cycling or constant breathing pulses during idle states.

---

## 7. CHANEL RESTRAINT RULE

Before adding any new visual layer, border, container, badge, or decorative graphic to an interface, the engineer and designer must ask:

> **"What can be removed from this view without reducing comprehension, precision, or capability?"**

Every decorative addition must justify its functional utility. If an element does not assist the user in reading a value, understanding a unit relationship, or executing a conversion, it must be eliminated.
