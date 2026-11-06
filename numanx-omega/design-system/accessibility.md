# OMEGA X DESIGN SYSTEM — ACCESSIBILITY GOVERNANCE (accessibility.md)

**Product:** Omega X Converter  
**Organization:** NumanX Studio  
**Directory:** `numanx-omega/design-system/`  
**Governing Standard:** WCAG 2.2 AA / Selected AAA Standards  
**Status:** Canonical Accessibility Governance (Phase 4 Step 2 Baseline)

---

## 1. CONTRAST REQUIREMENTS (WCAG 2.2)

1. **Body & Instructional Copy:** Must maintain a minimum contrast ratio of **$\ge 4.5:1$** against its backing surface.
2. **Headings & Large Display Text:** Must maintain a minimum contrast ratio of **$\ge 3.0:1$** against its backing surface.
3. **Active UI Controls & Icons:** Interactive boundaries, input borders, and iconography must maintain **$\ge 3.0:1$** against adjacent surfaces.
4. **Primary Numerical Telemetry:** Results and input quantities must target WCAG AAA contrast (**$\ge 7.0:1$**) to guarantee readability in high ambient light environments.

---

## 2. KEYBOARD NAVIGATION & FOCUS CONTRACT

Every interactive capability in Omega X Converter must be fully operable without a mouse or touch interface:

1. **Logical Tab Sequence:** Focus flows naturally in reading order:
   `Skip Link -> Global Navigation -> Category Selection -> Numeric Input -> Source Unit -> Swap Button -> Target Unit -> Result Actions -> Supplementary Modules`.
2. **Prominent Visible Focus Indicator:**
   ```css
   *:focus-visible {
     outline: 2px solid var(--focus-ring);
     outline-offset: 2px;
   }
   ```
   `outline: none` without an accompanying high-contrast replacement is strictly prohibited.
3. **Modal & Drawer Escape Contract:**
   - Any open overlay, command palette (`⌘K`), drawer (`Sidebar`), or popup context menu must close immediately upon pressing the `Escape` key, restoring focus to the triggering element.
4. **Global Keyboard Shortcuts:**
   - `⌘K` or `Ctrl+K`: Opens the universal command palette.
   - `?`: Opens the keyboard shortcuts cheat sheet (when focus is outside text inputs).
   - `ArrowUp` / `ArrowDown`: Recalls previous input history entries within the conversion input.

---

## 3. TOUCH TARGET SIZING (MOBILE ACCESSIBILITY)

1. **Primary Touch Targets:** All primary buttons, unit selectors, tabs, and result copy triggers must maintain a minimum bounding box of **$44 \times 44\text{px}$**.
2. **Compact Controls Padding:** Where a visual element is intentionally compact (e.g. an inline tag or dismiss `✕` icon), its interactive hit area must be expanded to $44 \times 44\text{px}$ using transparent padding or pseudo-elements (`::after`).

---

## 4. SCREEN READER SEMANTICS & ARIA PRESERVATION

1. **Live Result Announcements:**
   - The converted result tile must maintain `role="region" aria-live="polite" aria-atomic="true"`. Screen readers announce result changes without interrupting active typing.
2. **Full-Sentence Text Alternatives:**
   - The dynamic result must provide an accessible sentence alternative for non-visual users:
     ```html
     <span className="sr-only">125 meters equals 410.105 feet</span>
     ```
3. **Form Labels:** Every `<input>`, `<select>`, and `<textarea>` must possess an explicit `<label>`, `aria-label`, or `aria-labelledby` attribute. Placeholders are never accepted as labels.
4. **Non-Color Dependent Status:** Warnings, errors, and success states must always combine an icon/text badge with color (e.g., `⚠️ Error: Incompatible units`), never color alone.

---

## 5. ZOOM & RESPONSIVE RESILIENCE

1. **200% Zoom Tolerance:** The complete conversion workflow must remain fully functional and legible at $200\%$ browser zoom without text clipping or functional breakage.
2. **Zero Horizontal Scrolling:** Viewports down to $320\text{px}$ width must never trigger horizontal page scrollbars on core conversion workflows.

---

## 6. REDUCED-MOTION COMPLIANCE

Omega X strictly adheres to the user’s operating system preference:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
Background particle canvas scripts must detect `window.matchMedia('(prefers-reduced-motion: reduce)')` and cancel dynamic animation loops, displaying a static background image.

---

## 7. KNOWN STEP 1 ACCESSIBILITY FINDINGS (OPEN BACKLOG)

The following accessibility issues were detected during the Step 1 audit. They are recorded here as formal implementation backlog items and will be resolved during subsequent Phase 4 UI hardening steps:

| Finding ID | Severity | Description | Current Status |
| :--- | :--- | :--- | :--- |
| **A11Y-01** | **Medium** | Muted metadata labels using `opacity-50` or `opacity-60` on `--text2` drop to $3.2:1$ contrast in light mode. | **OPEN** — Scheduled for Step 3 token migration. |
| **A11Y-02** | **Medium** | Inline dismiss buttons (`w-5 h-5`, `w-6 h-6` on tips and quick suggestions) are under $30\text{px}$, violating the $44\text{px}$ tap target rule. | **OPEN** — Scheduled for Step 4/7 workbench hardening. |
| **A11Y-03** | **Low** | Missing visual loading spinner state during live currency/crypto fetch operations. | **OPEN** — Scheduled for Step 6/7 interaction refinement. |
| **A11Y-04** | **Low** | Tabular numbers not enforced across all multi-unit matrix tables, causing slight horizontal numeral jitter. | **OPEN** — Scheduled for Step 3 typography migration. |
