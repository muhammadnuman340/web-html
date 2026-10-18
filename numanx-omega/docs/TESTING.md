# Testing and verification

## Static validation

From the extracted package folder:

```powershell
node --check scripts/audit-site.mjs
node --check scripts/manage-history.mjs
node --check src/core.mjs
node --check src/report.mjs
node --check src/gsc.mjs
node --test
```

## Controlled local website test

1. Start a local fixture website that you own. Include pages with missing/duplicate titles, missing description, missing image alt, a broken local link, malformed JSON-LD, a mobile overflow element and a page that returns 404.
2. In PowerShell, set `SITE_URL` to the fixture site's URL and set `AUDIT_ALLOW_PRIVATE_NETWORK=true`.
3. Use `AUDIT_MAX_PAGES=10`, `AUDIT_CONCURRENCY=1`, `AUDIT_PROFILE=professional`.
4. Run `npm run audit`.
5. Open the generated HTML and PDF reports. Verify the known seeded findings appear and the missing/false positives are explainable.
6. Check that report HTML displays page-provided strings as text instead of executing script markup.
7. Test `p`, `r`, `c` in an interactive terminal.
8. Set `AUDIT_LIGHTHOUSE=true` for only 1–3 pages after the base crawl succeeds.
9. If testing GSC, use a short-lived authorised token for a property you control; then remove the environment variable.
10. Compare reports with `scripts/manage-history.mjs`, export the report bundle, and import it into a new folder.

## Regression testing in the target app

When integrating into Tools Hub, run its existing lint, type-check, test and production-build scripts. Use only commands discovered in its actual `package.json` and documentation. Test a representative sample of pre-existing routes and features; do not claim success if a command was not run.

## Known limits to verify

- Node heap monitoring does not account for Chromium subprocess memory directly.
- Site results are retained in memory for cross-page duplicate and link analysis. For huge websites, stream results to a persistent store before attempting very large scans.
- Public third parties may deny automated external link checks.
- Browser LCP and CLS samples are not field Core Web Vitals. INP is not fabricated.
- Schema checks in this CLI parse JSON-LD and discover types; they do not replace all official rich-results/schema validators.
- Accessibility heuristics plus Lighthouse do not certify full WCAG conformance.
- Ads, font and GEO/AEO checks are heuristic indicators requiring review.
