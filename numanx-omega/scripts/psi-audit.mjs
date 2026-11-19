#!/usr/bin/env node
/**
 * PageSpeed Insights audit of every URL in the live sitemap.
 *
 * Node built-ins + fetch only. Reads PSI_API_KEY from ./.env (or the process
 * environment). The key is never printed, logged or written to disk: every
 * error string goes through redact(), and raw responses are saved without the
 * request URL.
 *
 * Usage:
 *   node scripts/psi-audit.mjs                     full run (mobile + desktop)
 *   node scripts/psi-audit.mjs --limit 3           first N sitemap URLs only
 *   node scripts/psi-audit.mjs --only /convert/    URLs whose path contains text
 *   node scripts/psi-audit.mjs --resume            skip URL+strategy already in raw/
 *   node scripts/psi-audit.mjs --summarize-only    rebuild summary from raw/ only
 *   node scripts/psi-audit.mjs --date 2026-11-19   output folder date (default today)
 *
 * Output: reports/psi/<date>/raw/*.json, summary.csv, summary.md, failures.json
 */
import fs from 'node:fs/promises';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITEMAP_URL = 'https://converter.numanxstudio.com/sitemap.xml';
const PSI_ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const STRATEGIES = ['mobile', 'desktop'];
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];
const CONCURRENCY = 4;
const MAX_RETRIES = 2;
const TIMEOUT_MS = 60_000;
const SCREENSHOT_AUDITS = ['final-screenshot', 'screenshot-thumbnails', 'full-page-screenshot'];

// ---------- args ----------
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : undefined;
};
const LIMIT = opt('--limit') ? Number(opt('--limit')) : 0;
const ONLY = opt('--only');
const RESUME = flag('--resume');
const SUMMARIZE_ONLY = flag('--summarize-only');
const DATE = opt('--date') || localDate();

const OUT_DIR = path.join(ROOT, 'reports', 'psi', DATE);
const RAW_DIR = path.join(OUT_DIR, 'raw');
const FAIL_PATH = path.join(OUT_DIR, 'failures.json');

// ---------- key handling ----------
function loadKey() {
  if (process.env.PSI_API_KEY) return process.env.PSI_API_KEY.trim();
  const envPath = path.join(ROOT, '.env');
  if (!existsSync(envPath)) return '';
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?PSI_API_KEY\s*=\s*(.*?)\s*$/);
    if (m) return m[1].replace(/^['"]|['"]$/g, '').trim();
  }
  return '';
}
const KEY = SUMMARIZE_ONLY ? '' : loadKey();
const redact = (s) => (KEY ? String(s).split(KEY).join('<redacted>') : String(s));

// ---------- helpers ----------
function localDate() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(redact(a.join(' ')));

function slugFor(url) {
  const p = new URL(url).pathname.replace(/^\/+|\/+$/g, '');
  return (p || 'home').replace(/[^a-zA-Z0-9._-]+/g, '__');
}

export function templateFor(url) {
  const p = new URL(url).pathname.replace(/\/+$/, '') || '/';
  if (p === '/') return 'home';
  if (p === '/categories') return 'categories';
  const seg = p.split('/').filter(Boolean);
  if (seg[0] === 'convert' && seg.length === 2) return 'convert/<cat>';
  if (seg[0] === 'convert' && seg.length >= 3) return 'convert/<cat>/<pair>';
  if (seg[0] === 'guides') return 'guides';
  if (seg[0] === 'blog') return 'blog';
  if (seg.length === 1 && ['about', 'privacy', 'terms', 'contact', 'sitemap'].includes(seg[0])) return 'static';
  return 'other';
}
const TEMPLATE_ORDER = ['home', 'categories', 'convert/<cat>', 'convert/<cat>/<pair>', 'guides', 'blog', 'static', 'other'];

// ---------- sitemap ----------
async function fetchText(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}
const locs = (xml) => [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&'));

async function readSitemap(url, seen = new Set()) {
  if (seen.has(url)) return [];
  seen.add(url);
  const xml = await fetchText(url);
  if (/<sitemapindex[\s>]/.test(xml)) {
    const out = [];
    for (const child of locs(xml)) out.push(...(await readSitemap(child, seen)));
    return out;
  }
  return locs(xml);
}

// ---------- PSI call ----------
class PsiError extends Error {
  constructor(status, message, retryAfter = 0) {
    super(message);
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

async function callPsi(url, strategy) {
  const qs = new URLSearchParams({ url, strategy, key: KEY });
  for (const c of CATEGORIES) qs.append('category', c);
  let res;
  let body;
  try {
    // The timeout signal also aborts the body read, so both stay inside this try.
    res = await fetch(`${PSI_ENDPOINT}?${qs}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    body = await res.text();
  } catch (err) {
    const timeout = err?.name === 'TimeoutError' || err?.name === 'AbortError' || /aborted|timeout/i.test(err?.message || '');
    throw new PsiError(timeout ? 'timeout' : 'network', redact(timeout ? `timeout after ${TIMEOUT_MS / 1000}s` : err?.message || err));
  }
  if (!res.ok) {
    let msg = body.slice(0, 400);
    try { msg = JSON.parse(body)?.error?.message || msg; } catch { /* keep text */ }
    throw new PsiError(res.status, redact(`HTTP ${res.status}: ${msg}`), Number(res.headers.get('retry-after')) || 0);
  }
  return JSON.parse(body);
}

const retryable = (err) =>
  err.status === 429 || err.status === 'timeout' || err.status === 'network' || (typeof err.status === 'number' && err.status >= 500);

async function runJob({ url, strategy }) {
  for (let attempt = 0; ; attempt++) {
    try {
      return { ok: true, json: await callPsi(url, strategy), attempts: attempt + 1 };
    } catch (err) {
      if (attempt >= MAX_RETRIES || !retryable(err)) return { ok: false, error: err.message, status: err.status, attempts: attempt + 1 };
      const base = err.status === 429 ? 20_000 : 5_000;
      const wait = Math.max(err.retryAfter * 1000, base * 3 ** attempt) + Math.floor(Math.random() * 1000);
      log(`  retry ${attempt + 1}/${MAX_RETRIES} ${strategy} ${url} after ${err.message} (wait ${Math.round(wait / 1000)}s)`);
      await sleep(wait);
    }
  }
}

function stripScreenshots(json) {
  const audits = json?.lighthouseResult?.audits;
  if (audits) for (const id of SCREENSHOT_AUDITS) if (audits[id]) audits[id].details = { stripped: 'screenshot data removed to save space' };
  return json;
}

// ---------- extraction ----------
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

function findNode(details) {
  if (!details || typeof details !== 'object') return null;
  if (details.type === 'node' || typeof details.snippet === 'string' || (typeof details.nodeLabel === 'string' && details.path)) return details;
  for (const v of Object.values(details)) {
    const list = Array.isArray(v) ? v : v && typeof v === 'object' ? [v] : [];
    for (const x of list) { const n = findNode(x); if (n) return n; }
  }
  return null;
}

function crux(le) {
  if (!le || !le.metrics || Object.keys(le.metrics).length === 0) return null;
  const pick = (k) => (le.metrics[k] ? { p75: le.metrics[k].percentile, category: le.metrics[k].category } : null);
  return {
    id: le.id,
    originFallback: Boolean(le.origin_fallback),
    overall: le.overall_category || null,
    LCP: pick('LARGEST_CONTENTFUL_PAINT_MS'),
    CLS: pick('CUMULATIVE_LAYOUT_SHIFT_SCORE'), // CrUX reports CLS x 100
    INP: pick('INTERACTION_TO_NEXT_PAINT'),
    FCP: pick('FIRST_CONTENTFUL_PAINT_MS'),
    TTFB: pick('EXPERIMENTAL_TIME_TO_FIRST_BYTE'),
  };
}

export function extract(json) {
  const lhr = json.lighthouseResult;
  const a = lhr.audits;
  const cat = (id) => (lhr.categories?.[id]?.score == null ? null : Math.round(lhr.categories[id].score * 100));

  const reqs = a['network-requests']?.details?.items || [];
  const scripts = reqs.filter((r) => r.resourceType === 'Script').map((r) => ({ url: r.url, transfer: r.transferSize || 0, resource: r.resourceSize || 0 }));
  const jsBytes = scripts.reduce((s, r) => s + r.transfer, 0);

  const uj = a['unused-javascript'];
  const unusedItems = (uj?.details?.items || []).map((i) => ({ url: i.url, total: i.totalBytes, wasted: i.wastedBytes }));
  const unusedJsBytes = uj ? num(uj.details?.overallSavingsBytes) ?? unusedItems.reduce((s, i) => s + (i.wasted || 0), 0) : null;

  const rb = a['render-blocking-resources'] || a['render-blocking-insight'];
  const renderBlocking = (rb?.details?.items || []).filter((i) => i.url).map((i) => ({ url: i.url, wastedMs: num(i.wastedMs), bytes: num(i.totalBytes) }));

  const lcpAudit = ['lcp-breakdown-insight', 'largest-contentful-paint-element', 'lcp-discovery-insight', 'lcp-phases-insight']
    .map((id) => a[id]).find((au) => findNode(au?.details));
  const node = findNode(lcpAudit?.details);
  const lcpElement = node ? { selector: node.selector || node.snippet || null, snippet: node.snippet || null, label: node.nodeLabel || null } : null;
  const shifts = (a['layout-shifts']?.details?.items || [])
    .map((i) => ({ score: num(i.score), selector: i.node?.selector || i.node?.snippet || null }))
    .filter((s) => s.score != null)
    .sort((x, y) => y.score - x.score);
  const lcpPhases = {};
  const phaseTable = (a['lcp-breakdown-insight']?.details?.items || []).find((i) => i?.type === 'table');
  for (const p of phaseTable?.items || []) if (p.subpart) lcpPhases[p.subpart] = num(p.duration);

  // Opportunities: audits PSI lists in the performance category (not metrics/hidden) that report measured savings.
  const refs = (lhr.categories?.performance?.auditRefs || []).filter((r) => r.group !== 'metrics' && r.group !== 'hidden');
  const opps = [];
  for (const r of refs) {
    const au = a[r.id];
    if (!au || au.score === 1 || au.scoreDisplayMode === 'notApplicable') continue;
    const ms = num(au.details?.overallSavingsMs) ?? num(au.metricSavings?.LCP) ?? num(au.metricSavings?.FCP) ?? 0;
    const bytes = num(au.details?.overallSavingsBytes) ?? 0;
    if (ms <= 0 && bytes <= 0) continue;
    opps.push({ id: r.id, title: au.title, savingsMs: Math.round(ms), savingsBytes: Math.round(bytes) });
  }
  opps.sort((x, y) => y.savingsMs - x.savingsMs || y.savingsBytes - x.savingsBytes);

  return {
    lighthouseVersion: lhr.lighthouseVersion,
    fetchTime: lhr.fetchTime,
    runtimeError: lhr.runtimeError?.code || null,
    runWarnings: lhr.runWarnings || [],
    scores: { performance: cat('performance'), accessibility: cat('accessibility'), bestPractices: cat('best-practices'), seo: cat('seo') },
    LCP: num(a['largest-contentful-paint']?.numericValue),
    CLS: num(a['cumulative-layout-shift']?.numericValue),
    TBT: num(a['total-blocking-time']?.numericValue),
    FCP: num(a['first-contentful-paint']?.numericValue),
    SI: num(a['speed-index']?.numericValue),
    totalBytes: num(a['total-byte-weight']?.numericValue),
    jsBytes,
    unusedJsBytes,
    scripts,
    unusedItems,
    renderBlocking,
    lcpElement,
    lcpPhases,
    topShift: shifts[0] || null,
    topOpportunities: opps.slice(0, 5),
    allOpportunities: opps,
    fieldUrl: crux(json.loadingExperience),
    fieldOrigin: crux(json.originLoadingExperience),
  };
}

// ---------- stats / formatting ----------
const median = (xs) => {
  const v = xs.filter((x) => x != null).sort((p, q) => p - q);
  if (!v.length) return null;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
};
const fmtMs = (v) => (v == null ? '–' : v >= 1000 ? `${(v / 1000).toFixed(2)} s` : `${Math.round(v)} ms`);
const fmtCls = (v) => (v == null ? '–' : v.toFixed(3));
const fmtKb = (v) => (v == null ? '–' : `${(v / 1024).toFixed(1)} KB`);
const fmtScore = (v) => (v == null ? '–' : String(Math.round(v)));
const pathOf = (u) => new URL(u).pathname;
const chunkName = (u) => {
  try { return new URL(u).pathname.split('/').pop() || u; } catch { return u; }
};
const stripHash = (file) => file.replace(/-[A-Za-z0-9_-]{8}(\.(?:js|css))$/, '$1');
const csvCell = (v) => {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const mdCell = (s) => String(s).replace(/\|/g, '\\|');

function fieldText(f) {
  if (!f) return 'no field data';
  const parts = [];
  if (f.LCP) parts.push(`LCP ${fmtMs(f.LCP.p75)} (${f.LCP.category})`);
  if (f.INP) parts.push(`INP ${fmtMs(f.INP.p75)} (${f.INP.category})`);
  if (f.CLS) parts.push(`CLS ${(f.CLS.p75 / 100).toFixed(2)} (${f.CLS.category})`);
  if (f.FCP) parts.push(`FCP ${fmtMs(f.FCP.p75)} (${f.FCP.category})`);
  if (f.TTFB) parts.push(`TTFB ${fmtMs(f.TTFB.p75)} (${f.TTFB.category})`);
  return (f.originFallback ? '[origin fallback] ' : '') + (parts.join(', ') || 'no field data');
}

// Local build chunk sizes (dist/assets), keyed by file name without hash.
function localChunks() {
  const dir = path.join(ROOT, 'dist', 'assets');
  const map = new Map();
  if (!existsSync(dir)) return map;
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.js')) continue;
    const full = path.join(dir, f);
    map.set(stripHash(f), { file: f, raw: statSync(full).size, gzip: zlib.gzipSync(readFileSync(full), { level: 9 }).length });
  }
  return map;
}

// ---------- summary ----------
async function summarize(urlFilter) {
  const files = existsSync(RAW_DIR) ? readdirSync(RAW_DIR).filter((f) => f.endsWith('.json')) : [];
  const rows = [];
  for (const f of files) {
    const json = JSON.parse(await fs.readFile(path.join(RAW_DIR, f), 'utf8'));
    const url = json.id || json.lighthouseResult?.requestedUrl;
    if (urlFilter && !urlFilter.has(url)) continue;
    const strategy = f.endsWith('__desktop.json') ? 'desktop' : 'mobile';
    rows.push({ url, strategy, template: templateFor(url), ...extract(json) });
  }
  const failures = existsSync(FAIL_PATH) ? JSON.parse(await fs.readFile(FAIL_PATH, 'utf8')) : [];

  // ----- CSV -----
  const header = ['url', 'template', 'strategy', 'performance', 'accessibility', 'best_practices', 'seo', 'lcp_ms', 'cls', 'tbt_ms', 'fcp_ms', 'speed_index_ms', 'total_bytes', 'js_bytes', 'unused_js_bytes', 'render_blocking', 'lcp_element', 'lcp_ttfb_ms', 'lcp_resource_load_delay_ms', 'lcp_resource_load_ms', 'lcp_render_delay_ms', 'top_opportunities', 'field_data_url', 'field_data_origin', 'lighthouse_version', 'fetch_time'];
  const lines = [header.join(',')];
  for (const r of [...rows].sort((x, y) => x.url.localeCompare(y.url) || x.strategy.localeCompare(y.strategy))) {
    const round = (v) => (v == null ? '' : Math.round(v));
    lines.push([
      r.url, r.template, r.strategy, r.scores.performance, r.scores.accessibility, r.scores.bestPractices, r.scores.seo,
      round(r.LCP), r.CLS == null ? '' : r.CLS.toFixed(4), round(r.TBT), round(r.FCP), round(r.SI),
      r.totalBytes, r.jsBytes, r.unusedJsBytes,
      r.renderBlocking.map((b) => `${chunkName(b.url)}${b.wastedMs != null ? ` (${Math.round(b.wastedMs)} ms)` : ''}`).join(' | '),
      r.lcpElement ? r.lcpElement.selector || r.lcpElement.label : '',
      round(r.lcpPhases.timeToFirstByte), round(r.lcpPhases.resourceLoadDelay), round(r.lcpPhases.resourceLoadDuration), round(r.lcpPhases.elementRenderDelay),
      r.topOpportunities.map((o) => `${o.id}: ${o.savingsMs} ms / ${Math.round(o.savingsBytes / 1024)} KB`).join(' | '),
      fieldText(r.fieldUrl), fieldText(r.fieldOrigin), r.lighthouseVersion, r.fetchTime,
    ].map(csvCell).join(','));
  }
  await fs.writeFile(path.join(OUT_DIR, 'summary.csv'), lines.join('\n') + '\n');

  // ----- Markdown -----
  const mobile = rows.filter((r) => r.strategy === 'mobile' && r.scores.performance != null);
  const desktop = rows.filter((r) => r.strategy === 'desktop' && r.scores.performance != null);
  const lhVersions = [...new Set(rows.map((r) => r.lighthouseVersion))].join(', ');
  const md = [];
  md.push(`# PageSpeed Insights audit — ${DATE}`, '');
  md.push(`- Source: \`${SITEMAP_URL}\`, PSI API lab data, Lighthouse ${lhVersions || 'n/a'}`);
  md.push(`- URLs with a result: ${new Set(rows.map((r) => r.url)).size}; results: ${mobile.length} mobile, ${desktop.length} desktop; failed calls: ${failures.length}`);
  const times = rows.map((r) => r.fetchTime).filter(Boolean).sort();
  if (times.length) md.push(`- Run window (UTC): ${times[0]} → ${times[times.length - 1]}`);
  md.push('- One PSI run per URL + strategy. All numbers are measured PSI values; lab scores move a few points between runs.', '');
  const notesPath = path.join(OUT_DIR, 'notes.md');
  if (existsSync(notesPath)) md.push((await fs.readFile(notesPath, 'utf8')).trim(), '');

  md.push('## Per template — mobile', '');
  md.push('| Template | URLs | Median score | Worst score (URL) | Median LCP | Worst LCP | Median TBT | Worst TBT | Median CLS | Worst CLS | Median FCP | Median SI | Desktop median |');
  md.push('|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|');
  for (const t of TEMPLATE_ORDER) {
    const g = mobile.filter((r) => r.template === t);
    if (!g.length) continue;
    const worst = g.reduce((w, r) => (r.scores.performance < w.scores.performance ? r : w));
    const max = (k) => { const v = g.map((r) => r[k]).filter((x) => x != null); return v.length ? Math.max(...v) : null; };
    const med = (k) => median(g.map((r) => r[k]));
    const d = desktop.filter((r) => r.template === t);
    md.push(`| ${t} | ${g.length} | ${fmtScore(median(g.map((r) => r.scores.performance)))} | ${worst.scores.performance} (\`${pathOf(worst.url)}\`) | ${fmtMs(med('LCP'))} | ${fmtMs(max('LCP'))} | ${fmtMs(med('TBT'))} | ${fmtMs(max('TBT'))} | ${fmtCls(med('CLS'))} | ${fmtCls(max('CLS'))} | ${fmtMs(med('FCP'))} | ${fmtMs(med('SI'))} | ${fmtScore(median(d.map((r) => r.scores.performance)))} |`);
  }
  md.push('', '## Per template — desktop', '');
  md.push('| Template | URLs | Median score | Worst score (URL) | Median LCP | Median TBT | Median CLS | Worst CLS | Median FCP | Median SI |');
  md.push('|---|---:|---:|---|---:|---:|---:|---:|---:|---:|');
  for (const t of TEMPLATE_ORDER) {
    const g = desktop.filter((r) => r.template === t);
    if (!g.length) continue;
    const worst = g.reduce((w, r) => (r.scores.performance < w.scores.performance ? r : w));
    const med = (k) => median(g.map((r) => r[k]));
    const clsMax = Math.max(...g.map((r) => r.CLS ?? 0));
    md.push(`| ${t} | ${g.length} | ${fmtScore(median(g.map((r) => r.scores.performance)))} | ${worst.scores.performance} (\`${pathOf(worst.url)}\`) | ${fmtMs(med('LCP'))} | ${fmtMs(med('TBT'))} | ${fmtCls(med('CLS'))} | ${fmtCls(clsMax)} | ${fmtMs(med('FCP'))} | ${fmtMs(med('SI'))} |`);
  }

  md.push('', '## Largest layout shift per page — by element', '');
  md.push('Element that caused the single largest shift on each page (`layout-shifts` audit), counted across URLs.', '');
  md.push('| Strategy | Element | URLs | Median shift score of that element | Median page CLS |', '|---|---|---:|---:|---:|');
  for (const [label, set] of [['mobile', mobile], ['desktop', desktop]]) {
    const byEl = new Map();
    for (const r of set) {
      if (!r.topShift || r.topShift.score < 0.01) continue;
      const e = byEl.get(r.topShift.selector) || { s: [], cls: [] };
      e.s.push(r.topShift.score); e.cls.push(r.CLS);
      byEl.set(r.topShift.selector, e);
    }
    const list = [...byEl].sort((x, y) => y[1].s.length - x[1].s.length).slice(0, 5);
    if (!list.length) md.push(`| ${label} | no shift ≥ 0.01 on any URL | 0 | – | – |`);
    for (const [el, e] of list) md.push(`| ${label} | \`${mdCell(String(el).slice(0, 90))}\` | ${e.s.length} | ${fmtCls(median(e.s))} | ${fmtCls(median(e.cls))} |`);
  }

  md.push('', '### Other categories and weight — mobile medians', '');
  md.push('| Template | Accessibility | Best practices | SEO | Total bytes | JS bytes (transfer) | Unused JS |');
  md.push('|---|---:|---:|---:|---:|---:|---:|');
  for (const t of TEMPLATE_ORDER) {
    const g = mobile.filter((r) => r.template === t);
    if (!g.length) continue;
    const med = (f) => median(g.map(f));
    md.push(`| ${t} | ${fmtScore(med((r) => r.scores.accessibility))} | ${fmtScore(med((r) => r.scores.bestPractices))} | ${fmtScore(med((r) => r.scores.seo))} | ${fmtKb(med((r) => r.totalBytes))} | ${fmtKb(med((r) => r.jsBytes))} | ${fmtKb(med((r) => r.unusedJsBytes))} |`);
  }
  md.push('');

  md.push('## Field data (CrUX)', '');
  const urlField = rows.filter((r) => r.fieldUrl && !r.fieldUrl.originFallback);
  md.push(`- URL-level field data: ${urlField.length ? `${new Set(urlField.map((r) => r.url)).size} URLs (listed below)` : 'no field data for any URL'}`);
  md.push(`- Origin, mobile: ${fieldText(rows.find((r) => r.strategy === 'mobile' && r.fieldOrigin)?.fieldOrigin)}`);
  md.push(`- Origin, desktop: ${fieldText(rows.find((r) => r.strategy === 'desktop' && r.fieldOrigin)?.fieldOrigin)}`);
  if (urlField.length) {
    md.push('', '| URL | Strategy | Field data |', '|---|---|---|');
    for (const r of urlField) md.push(`| \`${pathOf(r.url)}\` | ${r.strategy} | ${fieldText(r.fieldUrl)} |`);
  }
  md.push('');

  md.push('## 10 worst URLs — mobile', '');
  md.push('| # | URL | Template | Score | LCP | TBT | CLS | FCP | JS (transfer) | LCP element |');
  md.push('|---:|---|---|---:|---:|---:|---:|---:|---:|---|');
  [...mobile].sort((x, y) => x.scores.performance - y.scores.performance || (y.LCP ?? 0) - (x.LCP ?? 0)).slice(0, 10).forEach((r, i) => {
    const el = r.lcpElement ? mdCell((r.lcpElement.selector || r.lcpElement.label || '').slice(0, 70)) : '–';
    md.push(`| ${i + 1} | \`${pathOf(r.url)}\` | ${r.template} | ${r.scores.performance} | ${fmtMs(r.LCP)} | ${fmtMs(r.TBT)} | ${fmtCls(r.CLS)} | ${fmtMs(r.FCP)} | ${fmtKb(r.jsBytes)} | \`${el}\` |`);
  });
  md.push('');

  md.push('## LCP element by template — mobile', '');
  md.push('LCP subparts from `lcp-breakdown-insight` (median across the template; "–" = subpart not reported, e.g. text LCP has no resource load).', '');
  md.push('| Template | Most common LCP element | Share | TTFB | Resource load delay | Resource load | Element render delay |', '|---|---|---:|---:|---:|---:|---:|');
  for (const t of TEMPLATE_ORDER) {
    const g = mobile.filter((r) => r.template === t);
    if (!g.length) continue;
    const counts = new Map();
    for (const r of g) { const k = r.lcpElement ? r.lcpElement.selector || r.lcpElement.label : '(none reported)'; counts.set(k, (counts.get(k) || 0) + 1); }
    const [k, n] = [...counts].sort((x, y) => y[1] - x[1])[0];
    const ph = (s) => fmtMs(median(g.map((r) => r.lcpPhases[s] ?? null)));
    md.push(`| ${t} | \`${mdCell(String(k).slice(0, 90))}\` | ${n}/${g.length} | ${ph('timeToFirstByte')} | ${ph('resourceLoadDelay')} | ${ph('resourceLoadDuration')} | ${ph('elementRenderDelay')} |`);
  }
  md.push('');

  md.push('## Opportunities — mobile, ranked by URLs hit × median savings', '');
  const opp = new Map();
  for (const r of mobile) for (const o of r.allOpportunities) {
    const e = opp.get(o.id) || { title: o.title, ms: [], bytes: [], templates: new Set() };
    e.ms.push(o.savingsMs); e.bytes.push(o.savingsBytes); e.templates.add(r.template);
    opp.set(o.id, e);
  }
  const oppRows = [...opp.entries()]
    .map(([id, e]) => ({ id, ...e, n: e.ms.length, medMs: median(e.ms), medBytes: median(e.bytes) }))
    .map((e) => ({ ...e, impactMs: e.n * (e.medMs || 0), impactBytes: e.n * (e.medBytes || 0) }))
    .sort((x, y) => y.impactMs - x.impactMs || y.impactBytes - x.impactBytes);
  md.push(`Savings are Lighthouse's own per-page estimates. Rank = mobile URLs showing the audit × its median savings. Base: ${mobile.length} mobile results.`, '');
  md.push('| Audit | URLs hit | Median savings (time) | Median savings (bytes) | URLs × median ms | Templates |');
  md.push('|---|---:|---:|---:|---:|---|');
  for (const e of oppRows) md.push(`| ${mdCell(e.title)} (\`${e.id}\`) | ${e.n} | ${fmtMs(e.medMs)} | ${fmtKb(e.medBytes)} | ${Math.round(e.impactMs).toLocaleString('en-US')} | ${[...e.templates].join(', ')} |`);
  if (!oppRows.length) md.push('| none | | | | | |');
  md.push('');

  md.push('## Render-blocking resources — mobile', '');
  const rbMap = new Map();
  for (const r of mobile) for (const b of r.renderBlocking) {
    const k = chunkName(b.url);
    const e = rbMap.get(k) || { n: 0, ms: [] };
    e.n++; if (b.wastedMs != null) e.ms.push(b.wastedMs);
    rbMap.set(k, e);
  }
  if (!rbMap.size) md.push('None reported.');
  else {
    md.push('| Resource | URLs | Median est. wasted |', '|---|---:|---:|');
    for (const [k, e] of [...rbMap].sort((x, y) => y[1].n - x[1].n)) md.push(`| \`${k}\` | ${e.n} | ${fmtMs(median(e.ms))} |`);
  }
  md.push('');

  md.push('## Biggest JS chunks — mobile', '');
  md.push('Live sizes come from PSI network records (transfer = compressed on the wire, uncompressed = resource size). "Local build" matches the chunk name without its hash against `dist/assets` from `npm run build` on this branch; local gzip is computed with zlib level 9. A different hash means the live file differs from the local build.', '');
  md.push('| Chunk (live) | Host | Pages loading it | Transfer | Uncompressed | Median unused (pages reported) | Local build file | Local raw | Local gzip |');
  md.push('|---|---|---:|---:|---:|---:|---|---:|---:|');
  const local = localChunks();
  const chunks = new Map();
  for (const r of mobile) {
    const unused = new Map(r.unusedItems.map((i) => [i.url, i.wasted]));
    for (const s of r.scripts) {
      const k = chunkName(s.url);
      let host = '';
      try { host = new URL(s.url).host; } catch { /* ignore */ }
      const e = chunks.get(k) || { host, transfer: [], resource: [], unused: [], n: 0 };
      e.n++; e.transfer.push(s.transfer); e.resource.push(s.resource);
      if (unused.has(s.url)) e.unused.push(unused.get(s.url));
      chunks.set(k, e);
    }
  }
  for (const [k, e] of [...chunks].sort((x, y) => median(y[1].transfer) - median(x[1].transfer)).slice(0, 25)) {
    const l = local.get(stripHash(k));
    const same = l && l.file === k ? ' (same hash)' : '';
    md.push(`| \`${k}\` | ${e.host} | ${e.n} | ${fmtKb(median(e.transfer))} | ${fmtKb(median(e.resource))} | ${e.unused.length ? `${fmtKb(median(e.unused))} (${e.unused.length})` : '–'} | ${l ? `\`${l.file}\`${same}` : '–'} | ${l ? fmtKb(l.raw) : '–'} | ${l ? fmtKb(l.gzip) : '–'} |`);
  }
  md.push('');

  md.push('## Failed URLs', '');
  const recoveredPath = path.join(OUT_DIR, 'recovered.json');
  const recovered = existsSync(recoveredPath) ? JSON.parse(await fs.readFile(recoveredPath, 'utf8')) : [];
  if (recovered.length) {
    md.push(`${recovered.length} calls failed in the first pass and succeeded on a \`--resume\` rerun (results above use the rerun):`, '');
    md.push('| URL | Strategy | First-pass attempts | First-pass error |', '|---|---|---:|---|');
    for (const f of recovered) md.push(`| \`${pathOf(f.url)}\` | ${f.strategy} | ${f.attempts} | ${mdCell(String(f.error).slice(0, 160))} |`);
    md.push('', 'Still failing after rerun:', '');
  }
  if (!failures.length) md.push('None.');
  else {
    md.push('| URL | Strategy | Attempts | Error |', '|---|---|---:|---|');
    for (const f of failures) md.push(`| \`${f.url}\` | ${f.strategy} | ${f.attempts} | ${mdCell(String(f.error).slice(0, 200))} |`);
  }
  md.push('');
  const warned = rows.filter((r) => r.runWarnings.length || r.runtimeError);
  if (warned.length) {
    md.push('## Lighthouse run warnings', '');
    for (const r of warned) md.push(`- \`${pathOf(r.url)}\` (${r.strategy}): ${r.runtimeError ? `runtimeError ${r.runtimeError}; ` : ''}${r.runWarnings.join(' / ').slice(0, 300)}`);
    md.push('');
  }
  await fs.writeFile(path.join(OUT_DIR, 'summary.md'), md.join('\n'));
  log(`summary: ${path.relative(ROOT, path.join(OUT_DIR, 'summary.md'))} (${rows.length} results, ${failures.length} failures)`);
}

// ---------- main ----------
async function main() {
  await fs.mkdir(RAW_DIR, { recursive: true });
  if (SUMMARIZE_ONLY) return summarize(null);

  if (!KEY) {
    console.error('PSI_API_KEY not found in .env or the environment.');
    process.exit(2);
  }
  log('API key: loaded');

  let urls = [...new Set(await readSitemap(SITEMAP_URL))];
  log(`sitemap: ${urls.length} URLs`);
  const partial = Boolean(ONLY || LIMIT > 0);
  if (ONLY) urls = urls.filter((u) => new URL(u).pathname.includes(ONLY));
  if (LIMIT > 0) urls = urls.slice(0, LIMIT);

  const jobs = [];
  for (const url of urls) for (const strategy of STRATEGIES) {
    const file = path.join(RAW_DIR, `${slugFor(url)}__${strategy}.json`);
    if (RESUME && existsSync(file)) continue;
    jobs.push({ url, strategy, file });
  }
  log(`jobs: ${jobs.length} (concurrency ${CONCURRENCY}, ${MAX_RETRIES} retries, ${TIMEOUT_MS / 1000}s timeout)`);

  const jobKeys = new Set(jobs.map((j) => `${j.url}|${j.strategy}`));
  let failures = RESUME && existsSync(FAIL_PATH) ? JSON.parse(readFileSync(FAIL_PATH, 'utf8')) : [];
  const retrying = failures.filter((f) => jobKeys.has(`${f.url}|${f.strategy}`));
  failures = failures.filter((f) => !jobKeys.has(`${f.url}|${f.strategy}`));
  const recoveredPath = path.join(OUT_DIR, 'recovered.json');
  const recovered = RESUME && existsSync(recoveredPath) ? JSON.parse(readFileSync(recoveredPath, 'utf8')) : [];

  let done = 0;
  let next = 0;
  const started = Date.now();
  async function worker() {
    while (next < jobs.length) {
      const job = jobs[next++];
      const r = await runJob(job);
      done++;
      if (r.ok) {
        await fs.writeFile(job.file, JSON.stringify(stripScreenshots(r.json)));
        const prior = retrying.find((f) => f.url === job.url && f.strategy === job.strategy);
        if (prior) {
          recovered.push(prior);
          await fs.writeFile(recoveredPath, JSON.stringify(recovered, null, 2));
        }
        const s = r.json.lighthouseResult?.categories?.performance?.score;
        log(`[${done}/${jobs.length}] ${job.strategy.padEnd(7)} ${s == null ? '  –' : String(Math.round(s * 100)).padStart(3)}  ${job.url}`);
      } else {
        failures.push({ url: job.url, strategy: job.strategy, attempts: r.attempts, status: r.status, error: r.error, at: new Date().toISOString() });
        await fs.writeFile(FAIL_PATH, JSON.stringify(failures, null, 2));
        log(`[${done}/${jobs.length}] ${job.strategy.padEnd(7)} FAIL ${job.url} — ${r.error}`);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, jobs.length) }, worker));
  await fs.writeFile(FAIL_PATH, JSON.stringify(failures, null, 2));
  log(`done in ${Math.round((Date.now() - started) / 1000)}s, ${failures.length} failures`);
  await summarize(partial ? new Set(urls) : null);
}

main().catch((err) => {
  console.error(redact(err?.stack || err));
  process.exit(1);
});
