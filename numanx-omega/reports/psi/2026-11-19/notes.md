### Run notes

- **Live ≠ local main.** The live deploy is older than local `main`. Live serves `index-diwBKF2m.js`; local `npm run build` on `perf/pagespeed` (cut from local `main` @ `e74926b`) emits `index-DneIVKHs.js`. `main` has one unpushed commit, `e74926b fix(declutter)`, which removes `AdSlot3Tier`, `AIAssistant`, `ContextBar`, `ConversionStreaks`, Dashboard/Favorites/History and a blog post. That's why live has 242 sitemap URLs and the local build has 241 (`/blog/ai-powered-unit-conversions-in-2026` is gone locally). Live chunks `AdSlot3Tier`, `storage`, `categories` and `ConversionQuiz` don't appear as separately named files in the local build.
- **Cache headers (checked on live with curl):** hashed `/assets/*` files already return `Cache-Control: public, max-age=31536000, immutable`. HTML returns `max-age=0, must-revalidate`.
- **Build output** from this branch: `build-output.txt` in this folder (241/241 prerendered routes passed).
- **Field data:** CrUX returned no URL-level or origin-level data for this site. Every number here is lab data.
