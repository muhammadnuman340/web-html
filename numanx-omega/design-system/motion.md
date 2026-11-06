# OMEGA X DESIGN SYSTEM — MOTION & INTERACTION GOVERNANCE (motion.md)

**Product:** Omega X Converter  
**Organization:** NumanX Studio  
**Directory:** `numanx-omega/design-system/`  
**Governing Standard:** UI/UX Ultra Pro Max Specification  
**Status:** Canonical Motion Governance (Phase 4 Step 2 Baseline)

---

## 1. MOTION PHILOSOPHY

Motion in Omega X Converter is a tactile confirmation mechanism for physical instrument interaction. It serves to:
- Acknowledge user input instantly.
- Guide visual focus during unit reversal (swapping).
- Smoothly transition numerical changes without blocking keyboard re-entry.

Motion must **never** be used to decorate empty space, entertain the user, or show off framework capabilities.

---

## 2. MOTION CLASSIFICATION TIERS

### 2.1 Allowed (Standard Interaction Feedback)
- **Button Press & Tap Feedback:** Immediate micro-scale ($0.96\text{–}0.98\times$) compression on `:active` lasting $80\text{–}120\text{ms}$.
- **Focus Rings:** Instant or $100\text{ms}$ ease-out appearance of high-contrast outline.
- **Unit Swap Rotation:** 180-degree spring rotation on the swap icon (`⇅`) using a stiff spring (`stiffness: 300, damping: 20`) completing in $< 200\text{ms}$.
- **Result Number Roll:** Subtle vertical tick transition (`numberRoll`, $150\text{–}250\text{ms}$) on result update that operates passively and non-blockingly.
- **Page Transitions:** Crisp $150\text{–}200\text{ms}$ opacity and small vertical translate ($8\text{px}$) when switching canonical routes.
- **Progress & Loading Indicators:** Restrained linear or circular spinner during asynchronous financial network fetches.

### 2.2 Discouraged (Use Sparingly & Conditionally)
- **Ambient Decorative Movement:** Continuous star twinkling or floating canvas particles. Permitted only if strictly capped in particle density and paused on tab blur.
- **Tilt / Parallax Effects:** 3D card tilt (`useTilt`) on mouse movement. Must be disabled entirely on mobile and touch devices.
- **Large Layout Expansions:** Avoid pushing neighboring content downward when accordions expand; prefer overlay popovers or fixed-height scroll regions.

### 2.3 Prohibited (Strictly Forbidden in Omega X)
- **Infinite Hue-Rotation Loops:** CSS animations utilizing `filter: hue-rotate(360deg)` (e.g. `.rgb-shift`). These generate massive continuous GPU fillrate waste.
- **High-Cost Continuous Blur Filters:** Animating `backdrop-filter` or `box-shadow` blurs in continuous infinite keyframe loops.
- **Mandatory Motion for Comprehension:** Users must never be required to wait for an animation to finish before reading a value or interacting with a control.
- **Layout-Shifting Transitions:** Animating `width`, `height`, `top`, or `left` properties directly, which causes browser layout reflow. Always use `transform` and `opacity`.

---

## 3. SPRING PHYSICS & TIMING CURVES

When using Framer Motion or CSS transitions:

```typescript
// Standard Stiff Interaction Spring (Tactile buttons, swaps, toggles)
export const STIFF_SPRING = {
  type: 'spring',
  stiffness: 350,
  damping: 25,
  mass: 0.5,
}

// Gentle Transition Spring (Modal disclosures, toast entries)
export const GENTLE_SPRING = {
  type: 'spring',
  stiffness: 250,
  damping: 28,
  mass: 1.0,
}
```

---

## 4. REDUCED-MOTION BEHAVIOR

When `prefers-reduced-motion: reduce` is active:
1. All Framer Motion animations immediately collapse to instantaneous transitions (`duration: 0`).
2. CSS transitions and keyframes are disabled globally.
3. The background ambient canvas script must immediately halt `requestAnimationFrame` loops and render a single static frame.
4. Screen-reader announcements and calculation logic remain 100% active and unaffected.
