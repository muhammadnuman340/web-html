# Phase 3 report: performance fixes

Branch `perf/pagespeed`, cut from local `main` @ `e74926b`. Local commits only: nothing pushed, merged or deployed.

## Commits

| Commit | Item | What changed |
|---|---|---|
| `fb6df3b` | Phase 1 | PSI audit script + 2026-11-19 live baseline (`summary.md`, `summary.csv`) |
| `3ab4acb` | Phase 2 | Fix plan |
| `b9ab883` | tooling | PSI key read from `.env.local` (see Gates); local Lighthouse runner `scripts/lh-local.mjs` |
| `e1f9fba` | **A1** | Route-loading skeleton gets `min-h-screen` so the footer stays below the fold until the page renders |
| `d41404e` | **A2** | `cleanSlug()` moved to `src/utils/slug.ts`; category pages and blog posts no longer download the pair-editorial data |
| `c7adae3` | **A3** | `localforage` imported on first storage access instead of bundled into the pair-page chunk |
| `728a2bb` | **B1** | No route enter animation on the first hard load; client-side navigations animate as before |
| `e724465` | **B2** | Particle canvas starts after `load` + idle (1 s timeout) instead of at mount |
| `df7d0f2` | **B3** | Pro Pass modal mounted on the first `open-pro-modal` event |
| `7a4b39d` | **B4** | Ctrl+K command bar loaded on first open |
| `1e31a80` | **C1** (found in Phase 3, approved) | Converter input focused with `preventScroll` (fixes a blog-post CLS regression, see below) |
| `1655ab6` | tooling | `lh-local --urls`, random URL sample file |
| `74588f0` | **C2** (found in Phase 3, approved) | Converter no longer flashes "Can't convert" before its first result (exposed by B1, see below) |
| `93d8328` | tooling | `lh-local --resume` |

## Gates (after every fix commit)

`npm ci` (once) → `npm run build` → `npm test` → `npm run lint` → `tsc -b` → `undefined|NaN` grep on generated html/xml/txt/json → prerender count. Logs are in the session scratchpad. Every fix commit passed:

- **build:** pass, with 241/241 routes passing `verify-prerender`. That count and the 244 `.html` files in `dist` were unchanged from baseline.
- **test:** 10/10 + 211/211 pass.
- **lint:** pass.
- **`tsc -b`:** it already failed on the untouched baseline with 26 errors in 15 files (the build never runs `tsc`). With your approval the gate became "no new errors", and the count stayed at 26 after every commit, all the same errors.
- **`undefined|NaN` in generated pages:** 0 files.

Two gate-related changes, both approved:

1. **PSI key location.** `tests/routing.test.mjs` fails if `.env` contains any `AIza…` key, so the key moved to `.env.local` (gitignored via `.env.*`) and `psi-audit.mjs` reads `.env.local` first. No test was changed.
2. **`tsc -b` gate.** Defined as "no new errors vs the recorded 26".

Build side effect: every build rewrites ~17 tracked generated files (`public/*`, compiled `scripts/*.mjs`, `tests/*.mjs`) with LF endings. The gate script restores files whose only change is line endings. Content changes from A2 (module comments moving inside the esbuild test/script bundles) were committed with A2.

## Before / after: local Lighthouse

Lighthouse 13.6.0 (same version PSI used), `npm run preview`, default mobile preset and `--preset=desktop`, 3 runs per URL, median shown.

- **Before:** commit `3ab4acb` (app code identical to `e74926b`).
- **After:** `74588f0` (final app code; later commits are tooling and this report only).

All mobile numbers and the random sample's desktop "before" ran against a separate worktree build of `3ab4acb` on port 4174, with the final build on 4173.

**How to read these numbers:** this machine is much slower than PSI's.

- Mobile TBT here is 4–15 s, vs a PSI median of 20 ms, and the same URL's score moves 10–20 points between runs.
- Desktop TBT is 0.5–3 s here vs ~10 ms on PSI.
- CLS is not affected by CPU speed and matches PSI closely: before = 0.81 here, 0.81 on PSI.

So CLS and JS transfer are reliable here. Score, LCP, TBT and SI are directional only; PSI after deploy is the real comparison.

### mobile (local Lighthouse 13.6.0, median of 3 runs; before = `before-ab`, after = `after-ab`)

| Template | URL | Score | LCP | TBT | CLS | FCP | SI | JS transfer |
|---|---|---|---|---|---|---|---|---|
| home | `/` | 49 → 49 | 4.08 s → 4.30 s | 5.84 s → 5.40 s | 0.000 → 0.000 | 2.11 s → 2.19 s | 6.33 s → 5.55 s | 184.1 KB → 179.5 KB |
| categories | `/categories` | 53 → 56 | 3.42 s → 3.48 s | 9.11 s → 6.82 s | 0.000 → 0.000 | 2.16 s → 2.16 s | 6.47 s → 5.34 s | 182.9 KB → 175.4 KB |
| convert/<cat> | `/convert/length` | 45 → 45 | 4.60 s → 4.72 s | 6.13 s → 6.65 s | 0.043 → 0.041 | 2.14 s → 2.22 s | 7.09 s → 7.31 s | 269.1 KB → 225.4 KB |
| convert/<cat>/<pair> | `/convert/length/centimeter-to-inches` | 47 → 54 | 4.33 s → 3.84 s | 7.87 s → 4.99 s | 0.000 → 0.000 | 2.21 s → 2.10 s | 6.84 s → 4.59 s | 237.4 KB → 230.2 KB |
| guides | `/guides/cups-to-grams` | 44 → 44 | 4.49 s → 4.67 s | 11.90 s → 7.44 s | 0.000 → 0.000 | 1.83 s → 1.54 s | 12.90 s → 7.79 s | 194.4 KB → 189.9 KB |
| blog | `/blog/metric-vs-imperial-engineering-guide` | 45 → 48 | 4.42 s → 4.16 s | 11.51 s → 7.23 s | 0.000 → 0.000 | 1.12 s → 2.26 s | 9.84 s → 6.55 s | 249.6 KB → 205.9 KB |
| static | `/about` | 44 → 50 | 3.83 s → 3.68 s | 2.28 s → 6.99 s | 0.000 → 0.000 | 3.52 s → 2.33 s | 8.91 s → 7.07 s | 164.6 KB → 157.2 KB |
| other | `/calculator` | 42 → 47 | 4.97 s → 4.27 s | 7.19 s → 6.26 s | 0.000 → 0.000 | 2.20 s → 2.19 s | 8.71 s → 6.68 s | 182.1 KB → 177.5 KB |

Mobile ran old and new builds alternately, run by run (`before-ab` = old build on port 4174, `after-ab` = new build on 4173), so both sides got the same machine conditions. CPU benchmark index (Lighthouse's own CPU speed reading): median 912 old vs 1005 new.

**Result:** score the same or higher on 8/8 pages; JS transfer lower on 8/8; CLS unchanged (already ~0 on mobile except `/convert/length`, pre-existing).

### desktop (local Lighthouse 13.6.0, median of 3 runs; before = `before`, after = `after-final`)

| Template | URL | Score | LCP | TBT | CLS | FCP | SI | JS transfer |
|---|---|---|---|---|---|---|---|---|
| home | `/` | 37 → 60 | 1.01 s → 1.13 s | 2.08 s → 1.86 s | 0.667 → 0.005 | 594 ms → 534 ms | 3.56 s → 3.09 s | 184.1 KB → 179.5 KB |
| categories | `/categories` | 36 → 62 | 1.09 s → 904 ms | 2.11 s → 1.85 s | 0.812 → 0.000 | 513 ms → 346 ms | 3.03 s → 2.74 s | 182.9 KB → 175.4 KB |
| convert/<cat> | `/convert/length` | 35 → 68 | 1.16 s → 1.04 s | 3.09 s → 783 ms | 0.820 → 0.004 | 330 ms → 465 ms | 3.84 s → 2.06 s | 269.1 KB → 225.4 KB |
| convert/<cat>/<pair> | `/convert/length/centimeter-to-inches` | 40 → 63 | 957 ms → 996 ms | 1.31 s → 1.48 s | 0.812 → 0.000 | 514 ms → 515 ms | 2.40 s → 2.38 s | 237.4 KB → 230.2 KB |
| guides | `/guides/cups-to-grams` | 39 → 64 | 1.07 s → 951 ms | 1.88 s → 1.22 s | 0.812 → 0.002 | 290 ms → 508 ms | 2.79 s → 2.31 s | 194.4 KB → 189.9 KB |
| blog | `/blog/metric-vs-imperial-engineering-guide` | 59 → 65 | 966 ms → 914 ms | 2.62 s → 1.31 s | 0.061 → 0.000 | 286 ms → 470 ms | 3.48 s → 2.11 s | 249.6 KB → 205.9 KB |
| static | `/about` | 40 → 66 | 892 ms → 797 ms | 1.70 s → 1.58 s | 0.805 → 0.000 | 300 ms → 463 ms | 2.33 s → 1.91 s | 164.6 KB → 157.2 KB |
| other | `/calculator` | 52 → 65 | 954 ms → 964 ms | 2.35 s → 1.32 s | 0.209 → 0.000 | 301 ms → 489 ms | 3.18 s → 2.32 s | 182.1 KB → 177.5 KB |

Desktop: `before` = 2026-11-19 run of `3ab4acb`; `after-final` = final build. The `/categories` desktop "before" median is from 2 runs (one run failed).

**Result:** score up on 8/8 (35–59 → 60–68), CLS 0.06–0.82 → 0–0.005 (A1, plus C1 on blog posts).

**Discarded measurement.** The first mobile "after" set (`reports/lighthouse/after-final`, mobile half) ran while another program (`BigUpgrade_ISU`, an updater) was using the CPU. Its benchmark index median was 628 vs 808 for "before", with single runs as low as 180, and home TBT reached 45 s. Those mobile numbers measure the machine, not the code, so they were replaced by the interleaved A/B above. The desktop half of that set ran at normal speed (median 833 vs 749) and is kept.

### Random URL sample

Seed 20261119, one URL per multi-page template that isn't in the set above, plus two pair pages. `/convert/mass/g-to-tola` was added on purpose because it was PSI's worst mobile URL (TBT 384 ms in one run); it is not random. File: `reports/lighthouse/random-sample-urls.json`.

#### mobile (local Lighthouse 13.6.0, median of 3 runs; before = `before-ab-random`, after = `after-ab-random`)

| Template | URL | Score | LCP | TBT | CLS | FCP | SI | JS transfer |
|---|---|---|---|---|---|---|---|---|
| convert/<cat> | `/convert/force` | 40 → 45 | 4.88 s → 4.55 s | 8.18 s → 6.67 s | 0.007 → 0.013 | 2.54 s → 1.44 s | 9.24 s → 6.91 s | 265.2 KB → 221.4 KB |
| convert/<cat>/<pair> #1 | `/convert/volume/imperial-gallon-to-gallon` | 39 → 44 | 5.47 s → 4.60 s | 9.39 s → 9.62 s | 0.000 → 0.000 | 2.24 s → 2.18 s | 9.07 s → 8.15 s | 237.4 KB → 230.2 KB |
| convert/<cat>/<pair> #2 | `/convert/frequency/khz-to-mhz` | 47 → 47 | 4.26 s → 4.62 s | 5.81 s → 6.02 s | 0.000 → 0.000 | 2.28 s → 2.23 s | 6.42 s → 6.67 s | 237.4 KB → 230.2 KB |
| guides | `/guides/lakh-crore-to-million-billion` | 48 → 48 | 4.26 s → 4.28 s | 6.35 s → 5.36 s | 0.000 → 0.000 | 2.14 s → 2.17 s | 6.92 s → 6.84 s | 194.4 KB → 189.9 KB |
| blog | `/blog/temperature-scales-celsius-fahrenheit-kelvin` | 41 → 40 | 4.06 s → 4.63 s | 7.54 s → 7.78 s | 0.154 → 0.000 | 2.19 s → 2.94 s | 7.75 s → 8.17 s | 249.6 KB → 205.9 KB |
| static | `/sitemap` | 51 → 49 | 3.76 s → 3.81 s | 6.63 s → 8.06 s | 0.000 → 0.000 | 2.19 s → 2.22 s | 6.62 s → 7.15 s | 192.0 KB → 184.5 KB |
| other | `/formulas` | 48 → 54 | 4.47 s → 3.51 s | 5.72 s → 4.76 s | 0.000 → 0.000 | 2.15 s → 2.16 s | 6.87 s → 5.25 s | 163.8 KB → 156.3 KB |
| pair (worst PSI mobile, not random) | `/convert/mass/g-to-tola` | 47 → 45 | 4.23 s → 4.53 s | 9.10 s → 6.88 s | 0.000 → 0.000 | 2.18 s → 2.21 s | 8.61 s → 6.89 s | 237.4 KB → 230.2 KB |

Mobile: interleaved A/B as above (benchmark median 941 old vs 965 new).

**Result:** score up on 3 (+5, +5, +6), same on 2, down 1–2 points on 3: all within this machine's run-to-run noise (the same URL moves 10–20 points between runs). JS transfer lower on 8/8. Blog CLS 0.154 → 0.000 (C1).

#### desktop (local Lighthouse 13.6.0, median of 3 runs; before = `before-random`, after = `after-random`)

| Template | URL | Score | LCP | TBT | CLS | FCP | SI | JS transfer |
|---|---|---|---|---|---|---|---|---|
| convert/<cat> | `/convert/force` | 41 → 59 | 1.03 s → 1.22 s | 993 ms → 2.32 s | 0.812 → 0.007 | 474 ms → 396 ms | 2.29 s → 3.42 s | 265.2 KB → 221.4 KB |
| convert/<cat>/<pair> #1 | `/convert/volume/imperial-gallon-to-gallon` | 44 → 63 | 901 ms → 1.06 s | 907 ms → 1.52 s | 0.812 → 0.000 | 480 ms → 559 ms | 1.86 s → 2.30 s | 237.4 KB → 230.2 KB |
| convert/<cat>/<pair> #2 | `/convert/frequency/khz-to-mhz` | 43 → 63 | 942 ms → 1.07 s | 1.04 s → 1.48 s | 0.812 → 0.000 | 499 ms → 520 ms | 1.94 s → 2.35 s | 237.4 KB → 230.2 KB |
| guides | `/guides/lakh-crore-to-million-billion` | 42 → 63 | 960 ms → 1.05 s | 1.02 s → 1.32 s | 0.812 → 0.002 | 493 ms → 554 ms | 2.12 s → 2.45 s | 194.4 KB → 189.9 KB |
| blog | `/blog/temperature-scales-celsius-fahrenheit-kelvin` | 66 → 63 | 469 ms → 909 ms | 869 ms → 1.65 s | 0.097 → 0.000 | 469 ms → 263 ms | 2.15 s → 2.45 s | 249.6 KB → 205.9 KB |
| static | `/sitemap` | 44 → 63 | 823 ms → 963 ms | 1.11 s → 1.75 s | 0.812 → 0.000 | 433 ms → 456 ms | 1.64 s → 2.46 s | 192.0 KB → 184.5 KB |
| other | `/formulas` | 41 → 64 | 920 ms → 938 ms | 1.39 s → 1.51 s | 0.812 → 0.000 | 562 ms → 551 ms | 2.22 s → 2.27 s | 163.8 KB → 156.3 KB |
| pair (worst PSI mobile, not random) | `/convert/mass/g-to-tola` | 41 → 65 | 934 ms → 973 ms | 1.12 s → 1.13 s | 0.812 → 0.000 | 501 ms → 514 ms | 2.13 s → 2.10 s | 237.4 KB → 230.2 KB |

Desktop: `before-random` (old build) and `after-random` (new build) ran one after the other, not interleaved. The "after" side ran on a slower CPU (benchmark median 785 vs 1047), which is why desktop TBT and SI are higher on several rows.

**Result:** score up on 7/8 (41–44 → 59–65); the exception is the blog post that already had low CLS (66 → 63). CLS 0.812 → 0–0.007 on the 7 non-blog URLs.

**`/convert/mass/g-to-tola`** (PSI's worst mobile URL): desktop 41 → 65, CLS 0.812 → 0. Mobile 47 → 45 with TBT 9.10 s → 6.88 s. PSI's 384 ms mobile TBT came from a single PSI run and can't be reproduced on this machine, where every page has 5–10 s mobile TBT; the PSI rerun after deploy is the real check for it.

## Bundle sizes (vite build output, gzip)

| Chunk | Before | After | Note |
|---|---|---|---|
| `index` (every page) | 111.25 KB | 100.14 KB | B3 + B4 |
| `pairEditorial` | 40.37 KB, on pair + category pages + blog posts | merged into `PairLanding` | A2: category pages and blog posts no longer load it |
| `PairLanding` | 15.32 KB (+ 40.37 KB `pairEditorial`) | 46.08 KB (includes pair editorial) | A2 + A3: one request fewer; localforage moved out |
| `localforage` | inside page chunks | 9.50 KB, loaded on first storage use | A3 |
| `ProPassModal` | 3.54 KB, every page | 3.55 KB, on first "Go Pro" only | B3 |
| `CommandBar` | inside `index` | 2.17 KB, on first Ctrl+K only | B4 |
| `vendor-motion` | 45.42 KB | 45.42 KB | unchanged (A4 dropped) |

## Skipped and why

- **A4 (framer-motion `LazyMotion` + `m`).** Measured first, as planned.
  - The 650–800 ms framer-motion layout-projection frame did disappear, and `vendor-motion` would shrink 43.9 → 31.4 KB gzip.
  - But total main-thread time didn't change beyond noise (4× CPU, median of 3). Home was 10,464 ms without A4 and 9,950 / 11,350 ms with it; the pair page was 9,821 vs 9,759 / 8,790. The layout work just moved to the browser.
  - Not worth a 26-file change to every animation. The experiment is kept as `git stash` entry `a4-experiment`.
- **A1b (`scrollbar-gutter: stable`).** Not needed: A1 alone removed the 5 px scrollbar shift.
- **Non-blocking or inlined CSS; removing the Cloudflare analytics beacon; splitting pair editorial per category.** Not recommended in Phase 2; reasons there.
- **Guide-page slow first paint.** Investigated locally in Phase 2 (main-thread tasks with no JS attribution); no clear cause found, so no fix.

## Regressions found and fixed during Phase 3

Both were existing behaviours that the fixes made visible or measurable. Both were fixed with your approval.

### C1: blog-post CLS (`1e31a80`)

After A1, blog-post CLS got worse: 0.00–0.04 → 0.18–0.20 desktop, ~0 → 0.09 mobile.

- **Cause:** `UniversalConverter` focuses its input on mount with plain `focus()`. On blog posts the converter sits mid-page, so the browser scrolled to it in the same frame the post rendered. Once A1 changed where the footer starts, that scroll counted as a large shift.
- **Fix:** `focus({ preventScroll: true })`. Blog post CLS 0.000 in 10/10 runs.
- **Visible effect:** pages with an embedded converter no longer jump to it on load; the input still has focus.

### C2: "Can't convert" flash on category pages (`74588f0`)

Found by the 10-URL random smoke check.

- **Cause:** the converter's result is set in a deferred transition after its units arrive. For a frame or two the readout showed a red "⚠️ Can't convert — incompatible units" before the real result. On the baseline this was partly hidden by the first-load fade-in (still visible for 1–6 frames on 7/8 loads); after B1 it was fully visible and added ~0.02 mobile CLS.
- **Fix:** show the notice only when the null result was computed for the current inputs. No conversion code changed.
- **Measured:** 0 error frames on 8/8 category-page loads; desktop CLS ~0.18 → ~0.01; mobile `/convert/length` unchanged vs baseline (~0.04).

## Random URL smoke check (functional)

- **Sample:** 10 more URLs, seed 20261120, from all 241, excluding the Lighthouse URLs: `/convert/temp/fahrenheit-to-kelvin`, `/converter`, `/convert/time`, `/convert/statistics`, `/terms`, `/convert/temp/celsius-to-fahrenheit`, `/convert/speed/m-s-to-km-h`, `/convert/number-base/bin-to-dec`, `/convert/fuel/mpg-uk-to-mpg-us`, `/convert/statistics/z-score-to-percentile`.
- **Method:** each URL loaded at desktop and mobile on the baseline and final builds. Checked: page and console errors, failed requests, H1 present, visible text unchanged, no `NaN`/`undefined`, CLS, and that typing a value changes the converter output.
- **Result on the final build:**
  - 20/20 loads with 0 errors, H1 present, the same text length as baseline, and no `NaN`/`undefined`.
  - The converter responds on every page that has one (`/terms` has none). The binary page needs valid binary input: `101101` → `45` on both builds.
  - Desktop CLS lower on every URL (baseline 0.04–0.18 → 0–0.016).

## Out of scope, noticed

- **Prerender architecture.** Each prerendered page ships separate inline-styled SEO markup that `createRoot` throws away. Hydrating real app markup would remove the double render; it's a big change.
- **Pre-existing type errors.** `tsc -b` has 26 errors in 15 files. Worth a separate type-only cleanup, then adding `tsc -b` to the build.
- **Windows file locks.** `tests/routing.test.mjs` intermittently can't be rewritten during build ("user-mapped section open"). A rerun passes.
- **Live is behind local `main`.** Local `main` has an unpushed commit (`e74926b`), and live runs an older build. The PSI comparison after deploy will include that commit's changes too.
- **Slow layout.** Layout takes 400–600 ms per page locally with ~500 DOM nodes; worth a separate CSS-cost look.
- **Category-page mobile CLS.** ~0.04–0.05 on `/convert/length`, unchanged by this work (pre-existing).

## Next

After you deploy, rerun Phase 1 on live (`node scripts/psi-audit.mjs`, key in `.env.local`) so the comparison is PSI to PSI.
