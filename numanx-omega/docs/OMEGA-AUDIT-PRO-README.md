# Omega Site Audit Pro Universal V4 — Ultra Pro Max Starter

**Version:** 4.0.0  
**Purpose:** Universal, read-only website audit CLI and integration starter for NumanX Tools Hub or another existing web project.

This package is designed to be copied into an existing repository after inspecting its framework and package manager. It is not a replacement for your full Tools Hub app. The CLI works independently; connecting it to a dashboard, adding approval-based code fixes, or adding a full OAuth login screen requires integration work in the actual repository.

## Included files

- `scripts/audit-site.mjs` — universal crawler, browser checks, profile filtering, optional Lighthouse and GSC, reports, local run history.
- `scripts/manage-history.mjs` — compare scans, compare two sites, import reports and export report bundles.
- `src/core.mjs` — URL safety helpers, sitemap/robots parsing, scoring and comparison utilities.
- `src/report.mjs` — escaped HTML report, CSV/JSON exports and PDF generation with Chromium.
- `src/gsc.mjs` — optional read-only Search Console Search Analytics API adapter.
- `tests/core.test.mjs` — unit tests.
- `docs/ARCHITECTURE.md` — architecture and limitations.
- `docs/INTEGRATION-GUIDE.md` — safe integration with an existing project.
- `docs/TESTING.md` — verification steps.
- `docs/PROMPT-FOR-ANTIGRAVITY.md` — focused implementation prompt for the existing Tools Hub repository.
- `.env.example` — configuration reference.

## Requirements

- Node.js 20 or later.
- npm (or adapt the commands to the package manager already used by your project).
- Puppeteer/Chromium. Install dependencies in the standalone extracted folder first for a smoke test, or install/merge only the required dependencies in the existing app.
- Optional: Lighthouse is listed as an optional dependency. It can use significant CPU and memory, so run it on a limited sample before enabling it for a large site.

## Quick start — standalone smoke test

Extract this ZIP to a folder, open a terminal in that folder, and run:

```powershell
npm install
node --check scripts/audit-site.mjs
npm test
```

Then start your own website using its normal development command in another terminal. Use the exact URL shown by that server.

For a local development site, explicitly permit the local origin:

```powershell
$env:SITE_URL="http://localhost:4321"
$env:AUDIT_ALLOW_PRIVATE_NETWORK="true"
$env:AUDIT_MAX_PAGES="10"
$env:AUDIT_CONCURRENCY="2"
$env:AUDIT_PROFILE="quick"
npm run audit
```

Change `4321` to your real development port. This explicit flag is required for localhost/private targets. For a live public site that you own or are authorised to audit, use its HTTPS URL and normally leave `AUDIT_ALLOW_PRIVATE_NETWORK` unset.

For a first live-site test, set a small page limit:

```powershell
$env:SITE_URL="https://your-domain.example"
$env:AUDIT_MAX_PAGES="25"
$env:AUDIT_CONCURRENCY="2"
npm run audit
```

Replace the example with a real site you own or have permission to test. Remove temporary environment variables when finished, or open a new PowerShell terminal.

## Unlimited-by-count crawling

`AUDIT_MAX_PAGES=0` (the default) means there is no arbitrary page-count limit. It does **not** mean unlimited CPU, memory, storage or duration. The crawler retains page results during cross-page analysis, so extremely large websites can still consume significant memory. Resource safeguards remain active:

- `AUDIT_MAX_DURATION_MINUTES` defaults to 120.
- `AUDIT_MAX_HEAP_MB` defaults to 1536 MB for the Node.js heap.
- `AUDIT_CONCURRENCY` defaults to 2 browser pages.
- `AUDIT_REQUEST_DELAY_MS` defaults to 150 ms between top-level navigations; a supported robots.txt `Crawl-delay` is also considered.
- `AUDIT_RESPECT_ROBOTS=true` (default) skips URLs disallowed by parsed robots.txt rules where available. Setting it to `false` should be reserved for authorised tests and may violate site crawl preferences.
- `AUDIT_MAX_SITEMAPS` defaults to 1000 sitemap documents, with `AUDIT_MAX_SITEMAP_BYTES` limiting each robots/sitemap text response to 20 MiB by default.
- Browser navigation timeouts, retry limits, external-link caps, URL scoping and memory checks remain active.

Raise resource settings gradually and monitor memory. For sites with hundreds of thousands or millions of URLs, a production dashboard should stream crawl results into a persistent local database instead of keeping the complete result set in memory. That streaming/database job queue is an integration-stage improvement, not something this standalone script should claim to have solved.

## Universal URL discovery

`AUDIT_DISCOVERY` supports:

- `auto` — combine sitemap discovery with same-origin link crawling.
- `sitemap` — discover only through sitemaps.
- `crawl` — follow same-origin links from the root URL to the configured depth.
- `routes` — audit a supplied URL-list text file.

Route-list example:

```powershell
$env:SITE_URL="http://localhost:4321"
$env:AUDIT_ALLOW_PRIVATE_NETWORK="true"
$env:AUDIT_DISCOVERY="routes"
$env:AUDIT_ROUTES_FILE="./examples/audit-routes.example.txt"
npm run audit
```

A sitemap may not contain every accessible route. Link crawling may not discover orphan pages or pages that require app interactions. Use route-list mode when a controlled known route inventory is required.

## URL include/exclude patterns

Comma-separated glob patterns match a path or full URL. `*` matches within one path segment and `**` can span path segments. You may also use `re:<regular-expression>`.

```powershell
$env:AUDIT_INCLUDE_PATHS="/blog/**,/tools/*"
$env:AUDIT_EXCLUDE_PATHS="/admin/**,/logout,/preview/*"
npm run audit
```

Do not include destructive routes, logout endpoints, write APIs or transaction endpoints in a URL list. The crawler is read-only, but the target website may still execute normal page JavaScript when a page is opened.

## Audit profiles

Set `AUDIT_PROFILE` to one of:

- `professional` / `full` — all enabled heuristic categories (default).
- `quick` — basic SEO, accessibility, technical, links, images and mobile checks.
- `seo` — SEO, schema, links, content and GEO/AEO checks.
- `performance` — performance, mobile, fonts, ads and resource checks.
- `accessibility` — accessibility and mobile checks.
- `security` — passive security configuration checks and technical issues.
- `geo-aeo` — GEO/AEO, content, schema and SEO readiness checks.
- `ads-fonts` — ads, fonts, performance and mobile checks.
- `custom` — use `AUDIT_PROFILE_CATEGORIES`, a comma-separated set such as `seo,accessibility,mobile,fonts`.

The current script collects browser metrics needed by multiple checks; profiles mainly control which findings and score categories are shown. A score for a module outside the selected profile is shown as unavailable, not as 100.

## Optional Lighthouse

Lighthouse is disabled by default to reduce runtime and memory use. When the optional dependency is installed:

```powershell
$env:AUDIT_LIGHTHOUSE="true"
$env:AUDIT_LIGHTHOUSE_MAX_PAGES="3"
npm run audit
```

Lighthouse performs lab measurements. Those scores and values are not equivalent to real-user CrUX or Search Console field data. The script does not invent INP when real interaction or field data is unavailable. Large scans should not run Lighthouse on every page unless you have measured the resource cost and intentionally changed the cap.

## Optional Google Search Console (GSC)

This CLI adapter submits a read-only Search Analytics query only when a valid OAuth access token, property and date range are supplied. It does not implement an interactive OAuth consent screen or token-refresh service. Those belong in the app/server integration.

```powershell
$env:GSC_SITE_URL="https://your-domain.example/"
$env:GSC_ACCESS_TOKEN="<short-lived OAuth access token>"
$env:GSC_START_DATE="2026-10-01"
$env:GSC_END_DATE="2026-10-14"
npm run audit
```

Use your own authorised property and the minimum required Search Console API scope. Do not commit secrets or paste tokens into source files. Access tokens are not written into reports by this package. If GSC is not connected, other audit modules still work.

## Optional authenticated test environment

For an authorised staging environment only, create a local JSON file that contains request headers, for example:

```json
{
  "Authorization": "Bearer replace-with-your-short-lived-token"
}
```

Then set:

```powershell
$env:AUDIT_AUTH_HEADERS_FILE="C:\private\audit-headers.json"
```

Header values are attached only to requests whose origin exactly matches `SITE_URL` and are not copied to audit reports. Keep this file out of the repository, protect it, and remove it after testing. This mechanism does not implement browser login flows, MFA, SSO, or cookie-refresh logic. Never use this feature to access a site without permission.

## External link checks

External links are collected separately. To enable bounded HTTP HEAD/GET checks against public destinations:

```powershell
$env:AUDIT_CHECK_EXTERNAL_LINKS="true"
$env:AUDIT_MAX_EXTERNAL_LINKS="100"
npm run audit
```

Some destinations block robots, HEAD requests or automation. A timeout or HTTP block is not automatically proof that the page is broken. Confirm before changing the link.

## Interactive controls

When run in an interactive terminal:

- Type `p` and Enter to pause starting new audit work; already running page navigations may finish.
- Type `r` and Enter to resume.
- Type `c` and Enter to cancel and save results collected so far, if route discovery has already completed.
- `Ctrl+C` requests a safe cancellation.

A cancellation during early route discovery may stop before report generation if no routes have been found.

## Reports and history

The default output folder is `audit-reports/`. Each run produces:

- `omega-audit-<timestamp>.json` — full report and findings.
- `omega-audit-<timestamp>.csv` — page-level summary suitable for spreadsheets.
- `omega-audit-<timestamp>.html` — premium-styled report dashboard.
- `omega-audit-<timestamp>.pdf` — compact branded report. For more than 100 pages it details up to 100 pages ranked by issue severity; the JSON, CSV and HTML contain the full audited page list.
- `history.jsonl` — local run-history index.

Compare a scan against a previous scan:

```powershell
node scripts/manage-history.mjs compare .\audit-reports\previous.json .\audit-reports\current.json .\audit-reports\scan-comparison.json
```

Compare two separately audited sites:

```powershell
node scripts/manage-history.mjs compare-sites .\audit-reports\site-a.json .\audit-reports\site-b.json .\audit-reports\competitor-comparison.json
```

This comparison reports public technical findings and available audit scores only. It cannot expose private competitor analytics, actual revenue, or competitor Search Console data.

Export complete report JSON files from a reports folder into one JSON bundle:

```powershell
node scripts/manage-history.mjs export .\audit-reports .\audit-reports\history-bundle.json
```

Import a report or exported bundle into a folder:

```powershell
node scripts/manage-history.mjs import .\audit-reports\history-bundle.json .\audit-reports\imported
```

Imports validate basic report structure and write local copies; they do not execute imported content. Review disk usage before bundling many large scans.

## Scope and safety

- Audit only websites you own or have permission to test.
- The default crawl scope is the exact target origin; it does not crawl off-domain links as pages.
- Public external link checks are optional, rate-limited and capped.
- The browser blocks off-origin private-network destinations to reduce SSRF risk; local targets require an explicit `AUDIT_ALLOW_PRIVATE_NETWORK=true` setting.
- This is a passive/read-only audit. It does not exploit vulnerabilities, click ads, create impressions, write files to the target, or apply fixes.
- Fix proposals, diff approval, backups and rollbacks belong in the existing app integration. Do not modify production sites automatically.
- Search Console, Lighthouse field data, ad policy status, GEO/AEO rankings and complete WCAG conformance must not be fabricated.

## What's implemented vs. integration work

**Implemented in the CLI:** sitemap/robots discovery; internal crawl; page-level SEO, accessibility, schema-syntax, security-header, mobile, font and ad-container heuristics; image/resource failures; duplicate title/description/exact text checks; internal and optional external broken link checks; browser timing samples; optional Lighthouse; optional GSC Search Analytics query using a supplied authorised token; local reports/history; comparison and import/export tools; profile filtering; pause/resume/cancel controls.

**Requires integration into the actual Tools Hub repository:** an interactive in-app dashboard and live status stream; secure interactive Google OAuth and token refresh; full authentication workflows; database-backed streaming for enormous sites; persistent scheduling; AI provider user settings; approval-driven code patching with backups/rollback; and native UI profile editors. The Antigravity integration prompt describes how to add these safely after repository inspection. This ZIP has not been merged into your private project automatically.

## Verification

```powershell
node --check scripts/audit-site.mjs
node --check scripts/manage-history.mjs
node --test
```

These checks validate JavaScript syntax and unit-test the pure helper functions. A live audit still requires dependency installation, a reachable permitted website and a working Chromium environment. No target-site runtime or Lighthouse result is claimed by this package build.
