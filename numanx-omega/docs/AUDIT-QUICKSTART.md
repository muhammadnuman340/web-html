# Omega Site Audit Pro V4 — local workflow

The V4 audit CLI is installed in this project. It is read-only: it crawls pages,
records findings and writes reports; it never changes the audited website.

## What was added

- `scripts/audit-site.mjs` — V4 crawler and report generator.
- `scripts/manage-history.mjs` — compare scans/sites, import and export reports.
- `src/core.mjs`, `src/report.mjs`, `src/gsc.mjs` — shared audit modules.
- `tests/core.test.mjs`, `tests/report.test.mjs` — unit tests.
- `docs/` — architecture, testing and integration notes from the package.
- `examples/audit-routes.example.txt` — explicit route-list example.
- `audit.env.example` — configuration reference.

Existing `puppeteer` in `devDependencies` is used; no duplicate browser
dependency was added. Lighthouse and Search Console remain optional and
disconnected unless you install/configure them.

## Commands

```powershell
npm run audit:site:v4     # run a scan
npm run audit:history     # history/comparison/import/export utility
npm run test:audit        # unit tests for the audit helpers
```

## Local audit (recommended: production preview)

The Vite development server can be very slow under per-request audit
interception because it serves an unbundled module graph. Audit the built site
instead:

```powershell
npm run build
npm run preview -- --port 4173 --strictPort
```

In a second terminal:

```powershell
$env:SITE_URL = 'http://localhost:4173'
$env:AUDIT_ALLOW_PRIVATE_NETWORK = 'true'
$env:AUDIT_MAX_PAGES = '10'       # 0 means no page-count cap
$env:AUDIT_CONCURRENCY = '2'
$env:AUDIT_PROFILE = 'quick'
npm run audit:site:v4
```

## Authorised live audit

```powershell
$env:SITE_URL = 'https://numanx-studio-omega-converter.netlify.app'
Remove-Item Env:AUDIT_ALLOW_PRIVATE_NETWORK -ErrorAction SilentlyContinue
$env:AUDIT_MAX_PAGES = '25'       # start small
$env:AUDIT_CONCURRENCY = '2'
$env:AUDIT_PROFILE = 'quick'
npm run audit:site:v4
```

Start with a small page cap and a public site you own or are authorised to
test. Leave `AUDIT_ALLOW_PRIVATE_NETWORK` unset for public HTTPS targets.

## Reports and history

Each run writes timestamped `.json`, `.csv`, `.html` and `.pdf` reports plus
`history.jsonl` into `audit-reports/` (git-ignored). Open the HTML report in a
browser for the readable dashboard.

```powershell
node scripts/manage-history.mjs compare .\audit-reports\previous.json .\audit-reports\current.json .\audit-reports\scan-comparison.json
node scripts/manage-history.mjs compare-sites .\audit-reports\site-a.json .\audit-reports\site-b.json .\audit-reports\site-comparison.json
node scripts/manage-history.mjs export .\audit-reports .\audit-reports\history-bundle.json
node scripts/manage-history.mjs import .\audit-reports\history-bundle.json .\audit-reports\imported
```

## Optional integrations

Lighthouse is not installed. To enable lab audits:

```powershell
npm install --save-dev lighthouse@^12
$env:AUDIT_LIGHTHOUSE = 'true'
$env:AUDIT_LIGHTHOUSE_MAX_PAGES = '3'
```

Search Console requires a short-lived authorised OAuth access token. See
`audit.env.example`; tokens are not written to reports. The CLI does not run an
interactive OAuth consent flow.

## Notes and limitations

- The audit disables HTTP cache and bypasses the site service worker per page so
  reports measure network responses rather than cached/PWA responses.
- Reports are heuristic review aids, not Google rankings or WCAG/security
  certification. Lighthouse values are lab data, not field Core Web Vitals.
- Scan execution is intentionally a local CLI workflow. This repository is a
  static Vite/Netlify app, so no fake in-browser job progress or long-running
  scan API was added. A future server-side job runner can wrap the same CLI.
