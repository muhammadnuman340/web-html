# ROUTE SPECIFICATION: CONVERSION PAIR LANDING PAGES (`/convert/:cat/:pair`)

**Route:** `/convert/:category/:pair` (e.g. `/convert/length/meters-to-feet`, `/convert/mass/kg-to-lbs`)  
**Page Component:** `src/pages/PairLanding.tsx`  
**Governing Archetype:** Single-Purpose Utility Workbench with NIST Incremental Table  
**Status:** Canonical Page Specification (Phase 4 Step 2 Baseline)

---

## 1. TASK PRIORITY & OBJECTIVE

Pair Landing pages represent the 99 canonical high-intent conversion pair destinations.
- **Priority 1 (90% of intent):** Instant numerical conversion for the specific pair with pre-filled inputs.
- **Priority 2:** One-tap pair reversal (e.g., jump from `meters-to-feet` to `feet-to-meters`).
- **Priority 3:** Quick-reference incremental conversion table ($1, 2, 5, 10, 25, 50, 100, \dots$).
- **Priority 4:** Exact NIST mathematical ratio and conversion formula explanation.

---

## 2. 25% SILHOUETTE & HIERARCHY

```
+---------------------------------------------------------------------------------------------------+
|  BREADCRUMB: Tools / [Category] / [Unit A] to [Unit B]                                            |
+---------------------------------------------------------------------------------------------------+
|  PAIR HEADER: Convert [Unit A] to [Unit B]  (H1)                                                  |
|  Exact Metrological Ratio: 1 [Unit A] = X.XXXXXX [Unit B]                                         |
+---------------------------------------------------------------------------------------------------+
|  DEDICATED PAIR WORKBENCH (Swiss Technical Grid Tile)                                             |
|  [ Input Value Box: 1.0 ]      [ Unit A Label ]      [ ⇅ Swap ]      [ Result: X.XXXX ]  [Unit B] |
|  [ Copy Calculation 📋 ]                             [ Share Result 📤 ]                          |
+---------------------------------------------------------------------------------------------------+
|  FORMULA EXPLANATION CARD: Formula: [Unit B] = [Unit A] × [Ratio] · Standards Provenance Reference|
+---------------------------------------------------------------------------------------------------+
|  INCREMENTAL CONVERSION TABLE (1 to 1000 standard progression)                                    |
+---------------------------------------------------------------------------------------------------+
|  INVERSE PAIR CALLOUT: "Convert [Unit B] to [Unit A] →"                                           |
+---------------------------------------------------------------------------------------------------+
|  AUTHORITATIVE FAQ SECTION (Matched to JSON-LD schema)                                            |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. ALLOWABLE SURFACES & PALETTE RULES

- **Pair Workbench Tile:** Elevated Level 2 surface with focused high-contrast border.
- **Input / Result Pair:** Level 3 receptacles using monospaced tabular numerals.
- **Incremental Table:** Clean zebra-striped tabular layout with fixed-width numerical cells.

---

## 4. FORBIDDEN PATTERNS & ANTI-SLOP ENFORCEMENT

1. **NO Arbitrary Unit Selectors:** The pair workbench is hard-bound to the URL slug pair. Changing units must navigate to the target canonical pair URL.
2. **NO Promotional Clutter:** Zero interstitial promotional cards or unrelated banner ads.
3. **NO Missing Swap Link:** The `Swap Units ⇅` action must perform a canonical URL navigation to the inverse pair route (`/convert/:cat/:u2-to-:u1`).

---

## 5. RESPONSIVE BEHAVIOR

- On mobile viewports ($< 640\text{px}$):
  - Input and result stack vertically with the swap button centered between them.
  - The incremental conversion table renders a clean 2-column key-value list with touch-friendly row heights ($\ge 36\text{px}$).

---

## 6. ACCESSIBILITY CONSIDERATIONS

- Heading hierarchy: `H1` (Convert Unit A to Unit B) -> `H2` (Conversion Table, Formula, FAQ).
- Swap button has explicit `aria-label="Convert Unit B to Unit A"`.
- Table columns have explicit `<th scope="col">` headers.
- Input changes announce live results to screen readers via polite ARIA live regions.
