# Antigravity prompt — integrate V4 into the existing NumanX Tools Hub

You are upgrading my EXISTING NumanX Tools Hub project. I supplied the Omega Site Audit Pro Universal V4 script package. Do not rebuild the app from scratch.

## Required workflow

1. Inspect the complete repository first: framework, package manager, source layout, routes, components, `package.json`, lockfile, current styling/UI system, tests, build scripts, and existing audit/crawler utilities.
2. Before editing, return a concise repository assessment and an exact file-by-file integration plan. Do not invent paths; map the V4 modules to real files and explain any naming changes.
3. Preserve every unrelated existing feature and route. Reuse current components, tokens, fonts, charts, navigation, and design conventions when they are suitable. Make a backup or establish a Git checkpoint before edits.
4. Integrate the CLI modules in small steps. Merge package scripts/dependencies without replacing existing scripts or switching package managers.
5. Add a premium responsive audit overview and dedicated workspace, consistent with existing branding. Include scan creation, profiles, URL include/exclude patterns, progress/status, pause/resume/cancel, findings, filters, history, comparisons, import/export, HTML/PDF/CSV/JSON reports and accessible keyboard operation.
6. Treat crawl execution as a long-running server/worker job, not a fragile UI request. If the current platform cannot host persistent jobs, explain the limitation and implement a safe local CLI workflow instead of faking live progress.
7. Use the V4 crawler for local and authorised live sites. Enforce same-origin scope, SSRF protections, DNS/redirect checks, resource limits, crawl delays, timeouts, cancellation and private-network opt-in for local targets.
8. Connect optional Lighthouse and Search Console only where their real dependencies/credentials are configured. Implement Google OAuth/token handling server-side if the existing app architecture supports it. Never show fake metrics.
9. Add GEO/AEO readiness heuristics, schema, duplicates, sitemap/robots, broken links/images, accessibility, SEO, mobile overflow, font loading, ad-layout indicators and passive security-header checks. Explain that heuristic flags are not certifications or ranking guarantees.
10. Implement AI recommendations as an optional provider adapter with consent and secret protection; deterministic findings must still work without AI.
11. Remediation must be approval-only: show the proposed diff, identify affected files, create a backup, require explicit approval, run relevant tests, report the result, and offer rollback. The crawler must never modify remote websites.
12. Keep report history local by default. Do not add a cloud database, user accounts, or scheduler unless the existing app already has them or I separately approve that scope. This release is manual-scan oriented.
13. Add tests for URL normalization, scope restrictions, robots/sitemaps, duplicate metadata/content, history import/export, report HTML escaping, cancellation, failed links/resources, and optional integrations' disconnected states.
14. Verify using the actual repository commands for tests, lint, type checking and production build. Do not claim a check passed unless you ran it. Fix any regression caused by this work.

## V4 acceptance criteria

- Existing app routes and features still work.
- CLI runs against a controlled local test site and an authorised public site.
- No fixed page cap by default, but duration, heap, concurrency, sitemap and external-link safeguards remain active.
- Scores use transparent heuristics; modules outside a profile are marked unavailable rather than receiving 100.
- HTML/PDF/CSV/JSON reports and local history work.
- Lighthouse lab values are distinguished from field data; INP is not fabricated.
- GSC uses an authorised API integration; disconnected state is honest.
- Competitor comparisons show only data actually collected and label comparability limits.
- UI is responsive, keyboard-accessible and consistent with the existing site.
- No secrets enter client bundles, logs or reports.

## Final response required

Return the architecture as actually implemented, exact changed-file list, dependency changes, setup commands, tests/build results, report file examples that you confirmed exist, unimplemented items and limitations, and rollback instructions. If you encounter a conflict or missing credential, leave the existing feature intact and report the blocker rather than making a destructive assumption.
