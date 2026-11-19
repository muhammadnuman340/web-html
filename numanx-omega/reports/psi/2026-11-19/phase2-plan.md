# Phase 2: Performance fix plan

Based on the 2026-11-19 PSI baseline (`summary.md`) plus local measurements on the `perf/pagespeed` build (`npm run preview`, headless Chrome via the existing `puppeteer` devDependency). No code has changed yet. The "moves" column names the metric a fix targets. Gains get measured in Phase 3 with local Lighthouse, and none are estimated here.

## What the data says (measured)

1. **Desktop CLS is the only big problem.** Desktop median is 75–78 on every template except blog posts. Desktop CLS is about 0.81; LCP (0.5–0.8 s) and TBT (<20 ms) are fine. On 235/242 URLs the shifting element is `main#main-content`.
   - **Reproduced locally:** CLS 0.812 at 1350×940 on `/convert/length/centimeter-to-inches`.
   - **Cause, from the layout-shift entries:** while the lazy route chunk loads, `<main>` holds the Suspense fallback `SkeletonPage`, which is only 695 px tall. The footer therefore sits inside the viewport (y = 762). When the page renders, `<main>` grows to full height and pushes the footer below the fold (the big shift). The page also outgrows the viewport, a scrollbar appears, and everything moves 5 px left.
   - **Why mobile is unaffected:** at 412 px wide the skeleton already pushes the footer below the fold, so mobile CLS is about 0.
2. **Mobile is mostly fine.** The median is 100 on home, categories, category, pair and static pages. Guides, blog and other sit at 92–95, with LCP 2.85–3.3 s, of which 1.0–1.3 s is "element render delay". Their LCP element is drawn by the React app (converter heading/text), not by the prerendered HTML.
3. **Root architecture (context only, not a fix here):** each prerendered page ships a separate, inline-styled SEO version of the page inside `#root`. `main.tsx` uses `createRoot`, not hydration, so React throws that markup away and renders a different layout.
4. **JS:**
   - `index` chunk: about 66% of it is react-dom (175 KB) + react-router (46 KB) out of 334 KB uncompressed. App code that could be lazy-loaded is only about 20 KB uncompressed.
   - `pairEditorial` (114 KB uncompressed, 41.9 KB transfer on live) is also downloaded by category pages and blog posts. They import only the one-line `cleanSlug()` helper from it.
   - `localforage` (28.6 KB uncompressed) is bundled into the pair-page chunk for favorites/history.
   - `vendor-motion` (framer-motion, 46.9 KB transfer) loads on every page. PSI puts about 1.8 s of mobile main-thread time on it (median), but only 74 ms of that is script evaluation. Locally, one framer-motion animation frame in its layout-projection code takes 650–800 ms (4× CPU) on every template I tested (home, about, guide, pair).
5. **Main-thread loops:** the `AmbientBackground` particle canvas runs constantly: 130 frame callbacks / 363 ms in the first 6 s on home, and 17 / 35 ms on a pair page (local, 4× CPU).
6. **Render-blocking CSS** (`index-*.css`, 106 KB raw / 19.9 KB gzip) shows up on 241 URLs. Lighthouse estimates about 300 ms of savings per page on mobile.
7. **Legacy-JS and cache-lifetime warnings** come only from the Cloudflare Web Analytics beacon (`static.cloudflareinsights.com`), which Cloudflare injects. It isn't in the repo.
8. **Mobile TBT outlier:** `/convert/mass/g-to-tola` at 384 ms in a single run. The next highest is 161 ms. I'll re-measure before acting on it.

## A. Fixes that change no feature or visible design

Ordered by measured impact.

| # | Fix | Files | Moves | Templates hit | Risk |
|---|---|---|---|---|---|
| A1 | Give the route loading skeleton at least viewport height (`min-h-[100svh]` on the `SkeletonPage` wrapper). That keeps the footer below the fold before content arrives and makes the page taller than the viewport from the first app paint, so the scrollbar doesn't appear later. The skeleton exists only while a route chunk loads, so the final layout doesn't change. | `src/components/ui/Skeleton.tsx` | **CLS (desktop)**: the 0.81 shift on 235/242 URLs | all (desktop) | Low. During client-side page changes the skeleton also briefly fills the screen (it's visible for the same time as today). |
| A1b | *Only if A1 leaves the 5 px scrollbar shift:* `scrollbar-gutter: stable` on `html`. | `src/index.css` | CLS (desktop) | all (desktop) | Low. Reserves a scrollbar-wide strip on desktop pages shorter than the viewport. I'll ask before applying it. |
| A2 | Move `cleanSlug()` into `src/utils/slug.ts` and re-export it from `pairEditorial.ts`, so existing imports keep working. Point `CategoryLanding` and `BlogPost` at the new module. | `src/utils/slug.ts` (new), `src/config/pairEditorial.ts`, `src/pages/CategoryLanding.tsx`, `src/pages/BlogPost.tsx` | JS bytes / parse: removes the `pairEditorial` chunk (41.9 KB transfer, 118 KB uncompressed on live) from these pages | convert/<cat> (35), blog posts (6) | Low. Pure import move; same function. |
| A3 | Load `localforage` with a dynamic `import()` inside `services/storage.ts`. The storage API is already async, so callers don't change. | `src/services/storage.ts` | JS on the pair-page critical path: −28.6 KB uncompressed from the `PairLanding` chunk | convert/<cat>/<pair> (186), plus any page using history | Low. The first favorites/history read waits for one small extra chunk. |
| A4 | framer-motion → `LazyMotion` + `m` components: `domAnimation` features loaded async, `domMax` only where `layout` is used (`CategoryLiveMatrix`). **First** I'll measure whether this removes the 650–800 ms projection frame. If it doesn't, I'll drop A4 and say so. | 25 files that import `framer-motion`, `src/App.tsx` | JS on the critical path (`vendor-motion` 46.9 KB transfer, all pages); main-thread time / TBT | all | Medium. Every animation must behave the same; I'll check each converted component. |

## B. Changes that remove or delay a feature or visible behaviour

Each needs your yes.

| # | Change | What users would notice | Files | Moves | Templates | Risk |
|---|---|---|---|---|---|---|
| B1 | Skip the route **enter** animation on the first hard load only (`<AnimatePresence initial={false}>`). Transitions between pages stay exactly as they are. | On a fresh page load, content appears in place instead of fading/sliding in 16 px. | `src/App.tsx` | **LCP**: the app-rendered LCP element can paint without waiting for the animation start (desktop all templates; mobile guides/blog/other with 1.0–1.3 s render delay) | all | Low |
| B2 | Start the `AmbientBackground` particle canvas after `load` + idle instead of at mount. Visuals unchanged once running; it already pauses when the tab is hidden. | Background particles appear about 1–2 s later. | `src/components/ui/AmbientBackground.tsx` | Main-thread time / TBT during load (home: 363 ms in the first 6 s locally) | home most, all others less | Low |
| B3 | Mount `ProPassModal` only after the first `open-pro-modal` event (a tiny listener stays in `App`). It opens only on that event today; it has no auto-open timer. | The first "Go Pro" click loads a 4.8 KB chunk before the modal opens. | `src/App.tsx`, `src/components/monetization/ProPassModal.tsx` | JS bytes / requests: −4.8 KB transfer and one request on all 242 pages | all | Low |
| B4 | Lazy-load the Ctrl+K `CommandBar` on its first open. | The first Ctrl+K / search-button open loads a small chunk. | `src/App.tsx`, `src/components/ui/CommandBar.tsx` | JS in `index`: about 5–12 KB uncompressed (`CommandBar` 4.7 KB plus its share of `smartParser` 7.5 KB) | all | Low. Small gain, so last. |

## Not recommended / skipped

- **Making the CSS non-blocking or inlining critical CSS.** The prerendered markup uses Tailwind classes (`max-w-5xl mx-auto p-6 …`). Loading CSS async would restyle that markup after first paint and create new layout shift, which works against A1. Inlining critical CSS needs a new build dependency, and that markup gets replaced by React anyway. Mobile FCP is already 0.9 s (desktop 0.24 s).
- **Removing the Cloudflare Web Analytics beacon** to clear the legacy-JS/cache warnings. That's a feature removal for a warning worth ~150 ms of Lighthouse-estimated savings on 16–18 URLs. You can turn it off in the Cloudflare dashboard if you ever want to.
- **Splitting `pairEditorial` per category for pair pages.** It's a data restructure, and pair-page mobile LCP is already the prerendered text at FCP (901 ms), so the gain would only be bytes.

## To investigate in Phase 3, fixing only on a clear cause

- **Guide pages:** locally `/guides/cups-to-grams` paints first at 1.7–2.7 s even though every resource finishes by 0.95 s. The guides hub paints at 0.5 s. Main-thread tasks of 1.2–1.5 s have no JS attribution in the trace. If I find a clear cause I'll bring it back as a separate item.
- **g-to-tola TBT 384 ms:** re-measure locally. Act only if it reproduces.

## Order of work in Phase 3 (approved items only)

A1 → A2 → A3 → B items you approve → A4 last, because it's the widest change and goes ahead only if the projection frame turns out to be fixable. One commit per fix with all gates after each. Lighthouse runs locally (mobile preset, 3 runs, median) on one URL per template, before and after. I'll also run a desktop-preset Lighthouse on the same URLs, since desktop CLS is the main target.

## Out of scope, noticed

- The prerender ships separate inline-styled markup and the app uses `createRoot` instead of hydrating. Real hydration would remove the double render and the swap entirely, but it's a large change.
- Layout passes take 130–220 ms each, and 400–600 ms per page in total, even unthrottled with about 500 DOM nodes. That's unusually slow and worth a separate look (CSS cost).
- Accessibility medians are 90–94 on mobile.
