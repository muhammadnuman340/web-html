# Safe integration into NumanX Tools Hub

This package does not contain your actual Tools Hub repository. Follow these steps in Antigravity with the project ZIP/folder open.

1. Create a clean backup or Git commit before modifying the existing project.
2. Inspect the repository and identify the real framework, package manager, routes, dashboard layout, components, test commands and lockfile.
3. Copy `scripts/audit-site.mjs`, `scripts/manage-history.mjs`, and the `src/` modules into the existing project's corresponding directories only after checking for conflicts. Rename physical paths only if that fits the existing conventions; update imports accordingly.
4. Merge the `audit:site:pro` or `audit:site:v4` script into the existing `package.json` scripts object. Do not overwrite existing commands or replace the lockfile without a deliberate dependency install.
5. Add Puppeteer as a development dependency only if the current project does not already have a compatible browser automation dependency. Lighthouse is optional; document the extra disk and runtime cost.
6. Keep `audit-reports/`, environment files, authentication-header JSON, and OAuth secrets out of source control. Add corresponding entries to `.gitignore` after checking the existing file.
7. Test the CLI against a local fixture app before linking it to live dashboard controls.
8. Build the dashboard integration around a server-side job wrapper. Do not run long browser scans inside a short-lived client-side page handler if the runtime will time out.
9. Use the existing application's styling system. Provide an overview page and a dedicated scan/results view while preserving existing routes.
10. Implement state polling or server-sent events/websocket updates only if the current deployment stack supports persistent jobs. Add explicit handling for queued/running/paused/completed/failed/cancelled.
11. Implement Google OAuth only in a trusted server-side flow. Use the minimum Search Console scope, token refresh, disconnect and deletion controls. Do not expose access tokens to browser bundles.
12. Implement AI recommendations as optional. Keep deterministic rules working when AI is not configured. Obtain explicit consent before sending page content to an external AI service.
13. Implement remediation as proposed diffs, preview, backup and explicit approval. Run tests after applying changes and provide rollback. The crawler itself must never automatically modify a site.
14. Re-run the existing project's lint, type-check, tests and production build. Compare key routes/screens before and after.

## Integration requirements

- Preserve existing routes and current feature behaviour.
- No invented file names: map modules to the real repository.
- No breaking package-manager switch.
- Avoid duplicate styling frameworks and duplicate browser automation dependencies.
- Add acceptance tests for a controlled fixture site.
- Include a file-by-file changelog and the exact commands actually run.
