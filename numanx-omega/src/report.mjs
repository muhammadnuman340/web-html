import fs from 'node:fs/promises';
import path from 'node:path';
import { escapeHtml, severityPriority } from './core.mjs';

const csvCell = value => `"${String(value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : value).replaceAll('"', '""')}"`;

export function makeCsv(report) {
  const header = ['requestedUrl','finalUrl','status','title','seoScore','accessibilityScore','performanceStatus','issueCount','criticalCount','highCount','error'];
  const rows = (report.pages || []).map(page => [
    page.requestedUrl, page.finalUrl, page.status, page.title,
    page.scores?.seo, page.scores?.accessibility,
    page.lighthouse?.status || 'not-run', page.issues?.length || 0,
    page.issues?.filter(x => x.severity === 'critical').length || 0,
    page.issues?.filter(x => x.severity === 'high').length || 0,
    page.error || '',
  ]);
  return [header, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n');
}

export function makeHtml(report, branding = 'NumanX / Omega Site Audit Pro') {
  const allFindings = [...(report.siteIssues || []), ...(report.pages || []).flatMap(page => page.issues || [])].sort((a, b) => severityPriority(a.severity) - severityPriority(b.severity));
  const countBySeverity = severity => allFindings.filter(issue => issue.severity === severity).length;
  const rows = (report.pages || []).map(page => {
    const findings = (page.issues || []).sort((a, b) => severityPriority(a.severity) - severityPriority(b.severity));
    const issueHtml = findings.map(issue => `<li class="finding ${escapeHtml(issue.severity)}"><strong>${escapeHtml(issue.severity.toUpperCase())}</strong> · ${escapeHtml(issue.code)} — ${escapeHtml(issue.message)}<p>${escapeHtml(issue.recommendation || '')}</p>${issue.evidence ? `<small>Evidence: ${escapeHtml(issue.evidence)}</small>` : ''}</li>`).join('');
    const lighthouseSummary = page.lighthouse?.status === 'completed'
      ? `Perf ${page.lighthouse.scores?.performance ?? 'N/A'} · A11y ${page.lighthouse.scores?.accessibility ?? 'N/A'} · SEO ${page.lighthouse.scores?.seo ?? 'N/A'}<small>LCP ${escapeHtml(page.lighthouse.metrics?.['largest-contentful-paint']?.displayValue || 'N/A')} · CLS ${escapeHtml(page.lighthouse.metrics?.['cumulative-layout-shift']?.displayValue || 'N/A')} · INP ${escapeHtml(page.lighthouse.metrics?.['interaction-to-next-paint']?.displayValue || 'N/A')}</small>`
      : `${escapeHtml(page.lighthouse?.status || 'Not run')}<small>Browser sample LCP ${escapeHtml(page.metrics?.lcpMs ?? 'N/A')} ms · CLS ${escapeHtml(page.metrics?.cls ?? 'N/A')}</small>`;
    return `<tr><td><a rel="noopener noreferrer" href="${escapeHtml(page.requestedUrl)}">${escapeHtml(page.requestedUrl)}</a><small>Title: ${escapeHtml(page.title || 'N/A')}</small>${page.finalUrl && page.finalUrl !== page.requestedUrl ? `<small>Final: ${escapeHtml(page.finalUrl)}</small>` : ''}</td><td>${escapeHtml(page.status ?? 'N/A')}</td><td>${escapeHtml(page.scores?.seo ?? 'N/A')}</td><td>${escapeHtml(page.scores?.accessibility ?? 'N/A')}</td><td>${lighthouseSummary}</td><td><details><summary>${findings.length} finding(s)</summary><ul>${issueHtml || '<li>No findings from enabled checks.</li>'}</ul></details></td></tr>`;
  }).join('\n');
  const siteScore = report.summary?.siteHealthScore ?? 'N/A';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark light"><title>${escapeHtml(branding)} Report</title>
<style>
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color-scheme:dark;--bg:#080d1a;--panel:#111a2d;--line:#283650;--text:#edf3ff;--muted:#a6b3cb;--accent:#80aaff}*{box-sizing:border-box}body{margin:0;background:radial-gradient(ellipse at top left,#172846 0,#080d1a 48%);color:var(--text);font-size:14px;line-height:1.55}.container{max-width:1600px;margin:auto;padding:32px 22px}h1{font-size:clamp(25px,3vw,38px);margin:0}h2{font-size:20px}.muted,small{color:var(--muted)}.header{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap}.eyebrow{text-transform:uppercase;letter-spacing:.16em;color:#9bc1ff;font-size:11px;font-weight:750}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(155px,1fr));gap:12px;margin:26px 0}.card{background:linear-gradient(145deg,#17233a,#101728);border:1px solid var(--line);border-radius:17px;padding:17px;min-height:105px}.label{color:var(--muted);font-size:12px}.value{font-size:30px;font-weight:780;letter-spacing:-.04em}.panel{background:#0d1424eF;border:1px solid var(--line);border-radius:16px;padding:18px;margin:16px 0}.wrap{overflow:auto;border:1px solid var(--line);border-radius:13px}table{border-collapse:collapse;width:100%;min-width:920px}th,td{text-align:left;padding:12px;border-bottom:1px solid var(--line);vertical-align:top}th{background:#18243a;position:sticky;top:0}tr:hover td{background:#ffffff05}a{color:var(--accent);overflow-wrap:anywhere}details{min-width:260px}li{margin:10px 0}.finding{padding:9px;border-left:3px solid #64748b;background:#ffffff05;border-radius:3px 8px 8px 3px}.critical{border-color:#fb7185}.high{border-color:#fb923c}.medium{border-color:#facc15}.low{border-color:#60a5fa}.info{border-color:#94a3b8}.finding p{margin:4px 0}.pill{display:inline-block;padding:3px 8px;border-radius:99px;background:#ffffff0b;border:1px solid var(--line);margin:3px 4px 3px 0}.warning{border-color:#b27c24;background:#3a2b13}.footer{padding:20px 0;color:var(--muted);font-size:12px}.section-title{display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap}@media(max-width:600px){.container{padding:20px 12px}.panel{padding:12px}.cards{grid-template-columns:repeat(2,minmax(0,1fr))}}@media print{body{background:#fff!important;color:#111!important}.panel,.card{background:#fff!important;color:#111!important;box-shadow:none!important}.muted,small{color:#555!important}details>summary{display:none!important}details>:not(summary){display:block!important}a{color:#164fa0!important}tr,.card,.finding{break-inside:avoid}}
</style></head><body><main class="container"><header class="header"><div><div class="eyebrow">Professional Website Intelligence</div><h1>${escapeHtml(branding)}</h1><p class="muted">Universal Audit Report · ${escapeHtml(report.siteUrl)}<br>Generated ${escapeHtml(report.timestamp)}</p></div><div><span class="pill">Version ${escapeHtml(report.version)}</span><span class="pill">${escapeHtml(report.configuration?.discovery || 'auto')} discovery</span></div></header>
<section class="cards"><div class="card"><div class="label">Pages audited</div><div class="value">${report.summary?.totalPagesAudited ?? 0}</div></div><div class="card"><div class="label">Heuristic site health</div><div class="value">${siteScore}${siteScore === 'N/A' ? '' : '%'}</div></div><div class="card"><div class="label">Critical findings</div><div class="value">${countBySeverity('critical')}</div></div><div class="card"><div class="label">High findings</div><div class="value">${countBySeverity('high')}</div></div><div class="card"><div class="label">Failed pages</div><div class="value">${report.summary?.failedPages ?? 0}</div></div><div class="card"><div class="label">Total findings</div><div class="value">${allFindings.length}</div></div></section>
<section class="panel"><div class="section-title"><h2>Audit scope and coverage</h2></div><p>${escapeHtml(report.discovery?.message || 'URL discovery completed.')}</p><p class="muted">This report combines browser-observed findings and transparent heuristics. Lighthouse, field Core Web Vitals, Search Console, accessibility standards conformance, and answer-engine visibility are only reported when the relevant checks or integrations actually provide data. A score is not a ranking guarantee.</p>${report.discovery?.robotsTxt ? `<p>robots.txt: HTTP ${escapeHtml(report.discovery.robotsTxt.status ?? 'N/A')} · sitemap URLs declared: ${report.discovery.robotsTxt.sitemaps?.length ?? 0}</p>` : ''}${report.integrations?.gsc ? `<p>Google Search Console: <span class="pill">${escapeHtml(report.integrations.gsc.status)}</span> ${escapeHtml(report.integrations.gsc.message || `${report.integrations.gsc.rowCount || 0} rows`)}</p>` : ''}</section>
<section class="panel"><div class="section-title"><h2>Site-wide findings</h2><span class="muted">${(report.siteIssues || []).length} finding(s)</span></div>${(report.siteIssues || []).map(issue => `<div class="finding ${escapeHtml(issue.severity)}"><strong>${escapeHtml(issue.severity.toUpperCase())}</strong> · ${escapeHtml(issue.code)} — ${escapeHtml(issue.message)}<p>${escapeHtml(issue.recommendation || '')}</p></div>`).join('') || '<p>No site-wide discovery warnings.</p>'}</section>
<section class="panel"><div class="section-title"><h2>Page-by-page findings</h2><span class="muted">${(report.pages || []).length} page(s)</span></div><div class="wrap"><table><thead><tr><th>URL</th><th>HTTP</th><th>SEO</th><th>Accessibility</th><th>Lighthouse</th><th>Findings</th></tr></thead><tbody>${rows || '<tr><td colspan="6">No pages were audited.</td></tr>'}</tbody></table></div></section>
<section class="panel"><h2>Priority action list</h2>${allFindings.slice(0, 100).map(issue => `<div class="finding ${escapeHtml(issue.severity)}"><strong>${escapeHtml(issue.severity.toUpperCase())}</strong> · ${escapeHtml(issue.code)} — ${escapeHtml(issue.message)}<p class="muted">${escapeHtml(issue.url || '')}</p><p>${escapeHtml(issue.recommendation || '')}</p></div>`).join('') || '<p>No findings were produced by the enabled checks.</p>'}${allFindings.length > 100 ? `<p class="muted">Showing first 100 prioritised findings in this section. See page details and JSON/CSV exports for the full data.</p>` : ''}</section>
<footer class="footer">${escapeHtml(branding)} · Read-only audit starter. Fixes are not automatically applied. Review context, permissions, and test results before changing a website.</footer></main></body></html>`;
}

export async function writeReports(report, { outputDir, browser, branding = 'NumanX / Omega Site Audit Pro' }) {
  await fs.mkdir(outputDir, { recursive: true });
  const stamp = new Date().toISOString().replaceAll(':', '-');
  const base = `omega-audit-${stamp}`;
  const files = {
    json: path.join(outputDir, `${base}.json`),
    csv: path.join(outputDir, `${base}.csv`),
    html: path.join(outputDir, `${base}.html`),
    pdf: path.join(outputDir, `${base}.pdf`),
    history: path.join(outputDir, 'history.jsonl'),
  };
  const html = makeHtml(report, branding);
  await Promise.all([
    fs.writeFile(files.json, JSON.stringify(report, null, 2), 'utf8'),
    fs.writeFile(files.csv, makeCsv(report), 'utf8'),
    fs.writeFile(files.html, html, 'utf8'),
    fs.appendFile(files.history, `${JSON.stringify({ timestamp: report.timestamp, siteUrl: report.siteUrl, version: report.version, summary: report.summary, jsonFile: path.basename(files.json), htmlFile: path.basename(files.html) })}\n`, 'utf8'),
  ]);
  if (browser) {
    const page = await browser.newPage();
    try {
      const pdfPages = [...(report.pages || [])].sort((a, b) => {
        const rank = page => (page.issues || []).reduce((sum, issue) => sum + ({ critical: 100, high: 30, medium: 8, low: 2, info: 0 }[issue.severity] || 0), 0);
        return rank(b) - rank(a);
      }).slice(0, 100);
      const pdfReport = { ...report, pages: pdfPages };
      if ((report.pages || []).length > pdfPages.length) {
        pdfReport.discovery = { ...(report.discovery || {}), message: `${report.discovery?.message || 'Audit complete.'} Compact PDF includes the 100 highest-priority page summaries; JSON, CSV, and HTML reports retain all audited pages.` };
      }
      await page.setContent(makeHtml(pdfReport, branding), { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.pdf({ path: files.pdf, format: 'A4', printBackground: true, preferCSSPageSize: true, margin: { top: '12mm', right: '10mm', bottom: '12mm', left: '10mm' } });
    } catch (error) {
      files.pdf = null;
      files.pdfError = error.message;
    } finally { await page.close().catch(() => {}); }
  }
  return files;
}
