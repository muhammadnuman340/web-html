# Architecture — Omega Site Audit Pro Universal V4

## Current standalone CLI architecture

```text
CLI + environment configuration
           |
           v
URL scope and resource safeguards
           |
           v
Discovery: robots.txt + sitemap(s) + internal links / route file
           |
           v
Bounded Puppeteer workers
           |
           +--> SEO and metadata checks
           +--> Accessibility heuristics
           +--> JSON-LD syntax/type discovery
           +--> HTTP headers and safe security indicators
           +--> Mobile viewport, fonts, ad-container heuristics
           +--> Browser performance samples
           +--> Failed resource / image observations
           |
           v
Cross-page analysis: duplicate metadata/content + internal links
           |
           +--> Optional external-link requests
           +--> Optional Lighthouse lab audits
           +--> Optional Search Console Search Analytics API query
           |
           v
Local report output: HTML / PDF / CSV / JSON + JSONL history index
           |
           v
History utilities: scan comparison, two-site comparison, import/export
```

## Security model

- Same-origin is the default crawl scope.
- Off-origin main-frame navigation is blocked. Public third-party resources may load, but private-network destinations are blocked.
- Local targets require an explicit opt-in flag.
- URL discovery, redirects, report HTML, imported JSON, and external links are treated as untrusted inputs.
- Authentication headers can be loaded from a separate private JSON file and are injected only for requests matching the exact configured target origin.
- No credentials are added to the report configuration or output.
- The crawler does not change the audited site. It produces findings and recommendations only.

## Scores

Scores are heuristic review aids based on issue severities. They are not Google's ranking system, a guaranteed health score, a security certification, or WCAG conformance. Categories outside the selected profile are null/unavailable instead of receiving an artificial score.

The optional Lighthouse result is a laboratory measurement. Browser-observed LCP/CLS values in this script are snapshots, not field data. INP is left unavailable unless a valid source is added. Google Search Console data is only returned when a valid access token and authorised property are supplied.

## Extension points

The current standalone version is designed as a base for integration. For a mature, extremely large-site web app, the next architecture step should add:

- A persistent scan job store and streaming result writer.
- Separate crawl workers with bounded queues and resumable checkpoints.
- A typed audit-module interface and module registry.
- Server-side API handlers for dashboard state.
- Server-side OAuth consent/token refresh for GSC.
- An optional AI adapter with explicit consent and secret management.
- An approval workflow for remediation proposals, with diffs, backups, test gates and rollback.

These are integration tasks rather than claims about functionality in the current CLI ZIP.
