# PageSpeed Insights audit — 2026-11-19

- Source: `https://converter.numanxstudio.com/sitemap.xml`, PSI API lab data, Lighthouse 13.6.0
- URLs with a result: 242; results: 242 mobile, 242 desktop; failed calls: 0
- Run window (UTC): 2026-11-19T02:26:26.979Z → 2026-11-19T03:04:06.772Z
- One PSI run per URL + strategy. All numbers are measured PSI values; lab scores move a few points between runs.

### Run notes

- **Live ≠ local main.** The live deploy is older than local `main`. Live serves `index-diwBKF2m.js`; local `npm run build` on `perf/pagespeed` (cut from local `main` @ `e74926b`) emits `index-DneIVKHs.js`. `main` has one unpushed commit, `e74926b fix(declutter)`, which removes `AdSlot3Tier`, `AIAssistant`, `ContextBar`, `ConversionStreaks`, Dashboard/Favorites/History and a blog post. That's why live has 242 sitemap URLs and the local build has 241 (`/blog/ai-powered-unit-conversions-in-2026` is gone locally). Live chunks `AdSlot3Tier`, `storage`, `categories` and `ConversionQuiz` don't appear as separately named files in the local build.
- **Cache headers (checked on live with curl):** hashed `/assets/*` files already return `Cache-Control: public, max-age=31536000, immutable`. HTML returns `max-age=0, must-revalidate`.
- **Build output** from this branch: `build-output.txt` in this folder (241/241 prerendered routes passed).
- **Field data:** CrUX returned no URL-level or origin-level data for this site. Every number here is lab data.

## Per template — mobile

| Template | URLs | Median score | Worst score (URL) | Median LCP | Worst LCP | Median TBT | Worst TBT | Median CLS | Worst CLS | Median FCP | Median SI | Desktop median |
|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| home | 1 | 100 | 100 (`/`) | 902 ms | 902 ms | 0 ms | 0 ms | 0.000 | 0.000 | 902 ms | 2.22 s | 76 |
| categories | 1 | 100 | 100 (`/categories`) | 901 ms | 901 ms | 65 ms | 65 ms | 0.000 | 0.000 | 901 ms | 1.88 s | 76 |
| convert/<cat> | 35 | 100 | 90 (`/convert/volume`) | 901 ms | 3.51 s | 12 ms | 131 ms | 0.012 | 0.044 | 901 ms | 2.06 s | 75 |
| convert/<cat>/<pair> | 186 | 100 | 84 (`/convert/mass/g-to-tola`) | 901 ms | 3.30 s | 20 ms | 384 ms | 0.000 | 0.062 | 901 ms | 1.85 s | 76 |
| guides | 4 | 95 | 94 (`/guides/cups-to-grams`) | 2.96 s | 3.00 s | 38 ms | 60 ms | 0.000 | 0.000 | 901 ms | 2.31 s | 76 |
| blog | 7 | 92 | 91 (`/blog/ai-powered-unit-conversions-in-2026`) | 3.30 s | 3.45 s | 7 ms | 36 ms | 0.001 | 0.001 | 901 ms | 2.10 s | 100 |
| static | 5 | 100 | 95 (`/sitemap`) | 902 ms | 3.00 s | 6 ms | 72 ms | 0.000 | 0.003 | 901 ms | 1.76 s | 78 |
| other | 3 | 95 | 95 (`/calculator`) | 2.85 s | 3.00 s | 20 ms | 30 ms | 0.000 | 0.000 | 901 ms | 1.88 s | 88 |

## Per template — desktop

| Template | URLs | Median score | Worst score (URL) | Median LCP | Median TBT | Median CLS | Worst CLS | Median FCP | Median SI |
|---|---:|---:|---|---:|---:|---:|---:|---:|---:|
| home | 1 | 76 | 76 (`/`) | 619 ms | 4 ms | 0.696 | 0.696 | 243 ms | 836 ms |
| categories | 1 | 76 | 76 (`/categories`) | 666 ms | 18 ms | 0.814 | 0.814 | 241 ms | 956 ms |
| convert/<cat> | 35 | 75 | 69 (`/convert/electricity`) | 776 ms | 17 ms | 0.816 | 0.834 | 241 ms | 906 ms |
| convert/<cat>/<pair> | 186 | 76 | 65 (`/convert/area/ft2-to-marla`) | 681 ms | 11 ms | 0.814 | 0.816 | 241 ms | 711 ms |
| guides | 4 | 76 | 75 (`/guides/binary-hex-ieee-754-guide`) | 501 ms | 8 ms | 0.814 | 0.814 | 241 ms | 761 ms |
| blog | 7 | 100 | 76 (`/blog`) | 686 ms | 1 ms | 0.002 | 0.814 | 241 ms | 736 ms |
| static | 5 | 78 | 76 (`/about`) | 647 ms | 15 ms | 0.457 | 0.815 | 241 ms | 713 ms |
| other | 3 | 88 | 76 (`/formulas`) | 644 ms | 0 ms | 0.238 | 0.814 | 241 ms | 726 ms |

## Largest layout shift per page — by element

Element that caused the single largest shift on each page (`layout-shifts` audit), counted across URLs.

| Strategy | Element | URLs | Median shift score of that element | Median page CLS |
|---|---|---:|---:|---:|
| mobile | `section.space-y-1.5 > div.rounded-2xl > div.space-y-4 > div.flex` | 10 | 0.015 | 0.015 |
| mobile | `div#root > div.relative > div.flex-1 > nav.lg:hidden` | 6 | 0.035 | 0.035 |
| mobile | `div.rounded-2xl > div.space-y-4 > div.space-y-3 > div.flex` | 6 | 0.021 | 0.028 |
| mobile | `div.space-y-4 > div.space-y-3 > div.flex > select.p-3` | 4 | 0.014 | 0.014 |
| desktop | `div#root > div.relative > div.flex-1 > main#main-content` | 235 | 0.814 | 0.814 |
| desktop | `div.relative > div.flex-1 > header.sticky > div.max-w-6xl` | 1 | 0.073 | 0.074 |
| desktop | `div#root > div.relative > div.flex-1 > footer.px-5` | 1 | 0.111 | 0.115 |

### Other categories and weight — mobile medians

| Template | Accessibility | Best practices | SEO | Total bytes | JS bytes (transfer) | Unused JS |
|---|---:|---:|---:|---:|---:|---:|
| home | 92 | 100 | 100 | 370.7 KB | 224.1 KB | 61.6 KB |
| categories | 90 | 100 | 100 | 304.8 KB | 206.8 KB | 64.8 KB |
| convert/<cat> | 94 | 100 | 100 | 453.7 KB | 316.9 KB | 59.7 KB |
| convert/<cat>/<pair> | 92 | 100 | 100 | 415.5 KB | 278.2 KB | 62.8 KB |
| guides | 93 | 100 | 100 | 375.8 KB | 238.5 KB | 58.9 KB |
| blog | 94 | 100 | 100 | 433.5 KB | 296.6 KB | 60.8 KB |
| static | 92 | 100 | 100 | 283.6 KB | 188.7 KB | 66.3 KB |
| other | 93 | 100 | 100 | 367.1 KB | 222.0 KB | 61.7 KB |

## Field data (CrUX)

- URL-level field data: no field data for any URL
- Origin, mobile: no field data
- Origin, desktop: no field data

## 10 worst URLs — mobile

| # | URL | Template | Score | LCP | TBT | CLS | FCP | JS (transfer) | LCP element |
|---:|---|---|---:|---:|---:|---:|---:|---:|---|
| 1 | `/convert/mass/g-to-tola` | convert/<cat>/<pair> | 84 | 3.15 s | 384 ms | 0.000 | 916 ms | 278.2 KB | `header.space-y-1 > div.flex > div.flex > h1.text-xl` |
| 2 | `/convert/volume/gallons-to-liters` | convert/<cat>/<pair> | 89 | 3.17 s | 5 ms | 0.000 | 2.17 s | 278.2 KB | `div.relative > article.space-y-6 > header.space-y-1 > p.text-xs` |
| 3 | `/convert/volume` | convert/<cat> | 90 | 3.51 s | 13 ms | 0.044 | 901 ms | 317.0 KB | `div.relative > article.space-y-4 > header.rounded-2xl > p.text-xs` |
| 4 | `/convert/typography` | convert/<cat> | 91 | 3.51 s | 9 ms | 0.012 | 904 ms | 313.9 KB | `div.flex > div.flex > div > h1.text-lg` |
| 5 | `/convert/density` | convert/<cat> | 91 | 3.51 s | 6 ms | 0.015 | 901 ms | 317.3 KB | `div.relative > article.space-y-4 > header.rounded-2xl > p.text-xs` |
| 6 | `/convert/matrix-format` | convert/<cat> | 91 | 3.50 s | 4 ms | 0.012 | 901 ms | 313.9 KB | `div.flex > div.flex > div > h1.text-lg` |
| 7 | `/convert/datatransfer` | convert/<cat> | 91 | 3.50 s | 3 ms | 0.003 | 901 ms | 316.9 KB | `section.space-y-1.5 > div.flex > h2#convert-heading > span` |
| 8 | `/convert/data` | convert/<cat> | 91 | 3.50 s | 12 ms | 0.018 | 901 ms | 316.9 KB | `section.space-y-1.5 > div.flex > h2#convert-heading > span` |
| 9 | `/convert/flow` | convert/<cat> | 91 | 3.50 s | 1 ms | 0.006 | 901 ms | 313.9 KB | `div.flex > div.flex > div > h1.text-lg` |
| 10 | `/convert/power` | convert/<cat> | 91 | 3.50 s | 19 ms | 0.000 | 901 ms | 317.1 KB | `div.relative > article.space-y-4 > header.rounded-2xl > p.text-xs` |

## LCP element by template — mobile

LCP subparts from `lcp-breakdown-insight` (median across the template; "–" = subpart not reported, e.g. text LCP has no resource load).

| Template | Most common LCP element | Share | TTFB | Resource load delay | Resource load | Element render delay |
|---|---|---:|---:|---:|---:|---:|
| home | `main.max-w-5xl > header > p` | 1/1 | 1 ms | – | – | 392 ms |
| categories | `main.max-w-5xl > header > p` | 1/1 | 1 ms | – | – | 180 ms |
| convert/<cat> | `(none reported)` | 16/35 | 1 ms | – | – | 169 ms |
| convert/<cat>/<pair> | `main.max-w-5xl > section > p` | 80/186 | 2 ms | – | – | 235 ms |
| guides | `div#root > div.fixed > div.mb-1 > span` | 2/4 | 2 ms | – | – | 1.03 s |
| blog | `section.p-5 > div > h2#interactive-converter > span` | 5/7 | 1 ms | – | – | 1.27 s |
| static | `main.max-w-3xl > header > p` | 2/5 | 2 ms | – | – | 233 ms |
| other | `article.space-y-3 > header.flex > div > p.text-xs` | 1/3 | 1 ms | – | – | 1.20 s |

## Opportunities — mobile, ranked by URLs hit × median savings

Savings are Lighthouse's own per-page estimates. Rank = mobile URLs showing the audit × its median savings. Base: 242 mobile results.

| Audit | URLs hit | Median savings (time) | Median savings (bytes) | URLs × median ms | Templates |
|---|---:|---:|---:|---:|---|
| Render-blocking requests (`render-blocking-insight`) | 241 | 300 ms | 0.0 KB | 72,300 | static, blog, other, categories, convert/<cat>/<pair>, convert/<cat>, guides, home |
| Legacy JavaScript (`legacy-javascript-insight`) | 18 | 150 ms | 0.0 KB | 2,700 | blog, convert/<cat>/<pair>, convert/<cat>, static |
| Use efficient cache lifetimes (`cache-insight`) | 16 | 150 ms | 0.0 KB | 2,400 | blog, convert/<cat>/<pair>, convert/<cat>, static |
| Reduce unused JavaScript (`unused-javascript`) | 242 | 0 ms | 62.8 KB | 0 | static, blog, other, categories, convert/<cat>/<pair>, convert/<cat>, guides, home |

## Render-blocking resources — mobile

| Resource | URLs | Median est. wasted |
|---|---:|---:|
| `index-v0MF013Z.css` | 242 | 301 ms |

## Biggest JS chunks — mobile

Live sizes come from PSI network records (transfer = compressed on the wire, uncompressed = resource size). "Local build" matches the chunk name without its hash against `dist/assets` from `npm run build` on this branch; local gzip is computed with zlib level 9. A different hash means the live file differs from the local build.

| Chunk (live) | Host | Pages loading it | Transfer | Uncompressed | Median unused (pages reported) | Local build file | Local raw | Local gzip |
|---|---|---:|---:|---:|---:|---|---:|---:|
| `index-diwBKF2m.js` | converter.numanxstudio.com | 242 | 105.4 KB | 327.3 KB | 38.0 KB (242) | `index-DneIVKHs.js` | 337.0 KB | 107.4 KB |
| `vendor-motion-BjNgjhSu.js` | converter.numanxstudio.com | 242 | 46.9 KB | 132.4 KB | 24.8 KB (242) | `vendor-motion-BjNgjhSu.js` (same hash) | 132.4 KB | 43.9 KB |
| `pairEditorial-BhcVxzZj.js` | converter.numanxstudio.com | 227 | 41.9 KB | 118.4 KB | – | `pairEditorial-D_HwjYa-.js` | 114.2 KB | 39.1 KB |
| `categoryContent-z8q42iad.js` | converter.numanxstudio.com | 229 | 21.8 KB | 59.6 KB | – | `categoryContent-C_GNsuyI.js` | 59.6 KB | 19.8 KB |
| `CategoryLanding-nWqY8uE1.js` | converter.numanxstudio.com | 35 | 19.0 KB | 65.4 KB | – | `CategoryLanding-DJp_kL3o.js` | 67.5 KB | 17.4 KB |
| `UniversalConverter-cxxLW2JL.js` | converter.numanxstudio.com | 47 | 18.6 KB | 72.6 KB | – | `UniversalConverter-CDtnUOch.js` | 85.5 KB | 21.0 KB |
| `storage-9eRX9_Xb.js` | converter.numanxstudio.com | 233 | 11.4 KB | 29.9 KB | – | – | – | – |
| `vce701823e78c4301a35b7e07294d87301792088814092` | static.cloudflareinsights.com | 242 | 10.4 KB | 31.1 KB | – | – | – | – |
| `categories-hICB1ePZ.js` | converter.numanxstudio.com | 242 | 8.4 KB | 19.4 KB | – | – | – | – |
| `PairLanding-CpeY83Cu.js` | converter.numanxstudio.com | 186 | 7.8 KB | 25.5 KB | – | `PairLanding-Cq-XSa8C.js` | 51.1 KB | 14.9 KB |
| `LengthComparisonBar-alxwfsYs.js` | converter.numanxstudio.com | 1 | 7.0 KB | 22.7 KB | – | `LengthComparisonBar-B4p51MSz.js` | 22.7 KB | 5.5 KB |
| `blogPosts-BNyV0Z_a.js` | converter.numanxstudio.com | 11 | 6.9 KB | 13.0 KB | – | `blogPosts-Duag2SWp.js` | 10.7 KB | 4.6 KB |
| `ConversionQuiz-Be9L53ZH.js` | converter.numanxstudio.com | 233 | 6.0 KB | 13.2 KB | – | – | – | – |
| `FormulaExplorer-CW10-oQR.js` | converter.numanxstudio.com | 1 | 5.4 KB | 10.1 KB | – | `FormulaExplorer-BX_ZSbig.js` | 10.1 KB | 4.0 KB |
| `guideContent-Dt_fYgLM.js` | converter.numanxstudio.com | 6 | 4.9 KB | 9.9 KB | – | `guideContent-y67U6Ya3.js` | 9.9 KB | 3.6 KB |
| `ProPassModal-BBfotdsn.js` | converter.numanxstudio.com | 242 | 4.8 KB | 12.1 KB | – | `ProPassModal-B8FPeaDP.js` | 12.1 KB | 3.5 KB |
| `GuidePage-C4w60sFy.js` | converter.numanxstudio.com | 3 | 4.7 KB | 14.2 KB | – | `GuidePage-Bp9uefcr.js` | 14.1 KB | 3.3 KB |
| `Sitemap-BeM7--_Y.js` | converter.numanxstudio.com | 1 | 4.6 KB | 13.6 KB | – | `Sitemap-aSPIsdfm.js` | 13.2 KB | 3.1 KB |
| `AdSlot3Tier-CxC-28jp.js` | converter.numanxstudio.com | 221 | 4.5 KB | 9.7 KB | – | – | – | – |
| `Categories-Ekgu0Hxn.js` | converter.numanxstudio.com | 1 | 4.2 KB | 8.6 KB | – | `Categories-szP7hIUK.js` | 8.6 KB | 2.8 KB |
| `Home-BcpDmUwd.js` | converter.numanxstudio.com | 1 | 4.2 KB | 10.4 KB | – | `Home-Bh4vh4XT.js` | 10.3 KB | 2.8 KB |
| `BlogPost-JBNNHfzo.js` | converter.numanxstudio.com | 6 | 4.1 KB | 9.9 KB | – | `BlogPost-DecB69X1.js` | 9.9 KB | 2.6 KB |
| `legal-CX9eDIxD.js` | converter.numanxstudio.com | 3 | 3.8 KB | 6.1 KB | – | `legal-B1RvM-Zs.js` | 6.1 KB | 2.5 KB |
| `GuidesHub-uCIzF9p7.js` | converter.numanxstudio.com | 1 | 3.8 KB | 6.8 KB | – | `GuidesHub-BTKiiwVH.js` | 6.8 KB | 2.4 KB |
| `Blog-2SYAEai3.js` | converter.numanxstudio.com | 1 | 3.7 KB | 6.5 KB | – | `Blog-BDSzkEku.js` | 6.5 KB | 2.4 KB |

## Failed URLs

8 calls failed in the first pass and succeeded on a `--resume` rerun (results above use the rerun):

| URL | Strategy | First-pass attempts | First-pass error |
|---|---|---:|---|
| `/convert/area/hectares-to-acres` | mobile | 1 | The operation was aborted due to timeout (body read; not retried — script bug, fixed before rerun) |
| `/convert/area/hectares-to-acres` | desktop | 1 | The operation was aborted due to timeout (body read; not retried — script bug, fixed before rerun) |
| `/convert/illuminance/lux-to-foot-candle` | desktop | 1 | The operation was aborted due to timeout (body read; not retried — script bug, fixed before rerun) |
| `/convert/length` | mobile | 1 | The operation was aborted due to timeout (body read; not retried — script bug, fixed before rerun) |
| `/convert/length/angstrom-to-nanometer` | mobile | 2 | The operation was aborted due to timeout (body read; not retried — script bug, fixed before rerun) |
| `/convert/length/centimeter-to-inches` | mobile | 3 | fetch failed |
| `/convert/length/centimeter-to-inches` | desktop | 3 | The operation was aborted due to timeout (body read; not retried — script bug, fixed before rerun) |
| `/convert/mass/troy-ounce-to-gram` | desktop | 1 | HTTP 400: Lighthouse returned error: NO_FCP (not retried: 4xx) |

Still failing after rerun:

None.
