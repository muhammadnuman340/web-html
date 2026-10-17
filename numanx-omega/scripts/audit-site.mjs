#!/usr/bin/env node
/**
 * Omega Site Audit Pro — Universal Edition
 * Read-only rendered-page audit for websites using any framework or static HTML.
 * Requires Node.js 20+ and Puppeteer. Does not modify the audited site.
 */
import puppeteer from 'puppeteer';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import process from 'node:process';

function findChromeExecutable() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  ];
  for (const c of candidates) {
    if (fsSync.existsSync(c)) return c;
  }
  return undefined;
}

const VERSION = '3.0.0';
const SITE_URL = normalizeOrigin(process.env.SITE_URL || 'http://localhost:3000');
const CONCURRENCY = intEnv('AUDIT_CONCURRENCY', 4, 1, 16);
const TIMEOUT_MS = intEnv('AUDIT_TIMEOUT_MS', 20000, 1000, 120000);
const MAX_PAGES = intEnv('AUDIT_MAX_PAGES', 1000, 1, 20000);
const CRAWL_DEPTH = intEnv('AUDIT_CRAWL_DEPTH', 5, 0, 30);
const RETRIES = intEnv('AUDIT_RETRIES', 1, 0, 5);
const OUTPUT_DIR = path.resolve(process.env.AUDIT_OUTPUT_DIR || 'audit-reports');
const DISCOVERY = String(process.env.AUDIT_DISCOVERY || 'auto').toLowerCase(); // auto | sitemap | crawl | routes
const ROUTES_FILE = process.env.AUDIT_ROUTES_FILE || '';
const WAIT_AFTER_LOAD_MS = intEnv('AUDIT_SETTLE_MS', 200, 0, 5000);
const USER_AGENT = process.env.AUDIT_USER_AGENT || `OmegaSiteAuditPro/${VERSION} (read-only quality audit)`;
const BASE_HOSTNAME = new URL(SITE_URL).hostname;

function intEnv(name, fallback, min, max) {
  const value = Number.parseInt(process.env[name] || '', 10);
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
}
function normalizeOrigin(value) {
  const u = new URL(value);
  if (!['http:', 'https:'].includes(u.protocol)) throw new Error('SITE_URL must start with http:// or https://');
  return u.origin;
}
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function xmlDecode(value) {
  return value.replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"').replaceAll('&apos;', "'");
}
function normalizeRoute(value, base = SITE_URL) {
  try {
    const url = new URL(value, base);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    if (url.origin !== SITE_URL && !['localhost', '127.0.0.1'].includes(BASE_HOSTNAME)) return null;
    if (/\.(?:avif|css|csv|eot|gif|ico|jpe?g|js|map|mp[34]|pdf|png|svg|ttf|txt|webm|webp|woff2?|xml|zip)$/i.test(url.pathname)) return null;
    url.hash = '';
    // Ignore tracking/query variants by default to avoid crawling infinite filter combinations.
    url.search = '';
    return url.pathname || '/';
  } catch { return null; }
}
function uniqueSorted(values) { return [...new Set(values)].sort((a, b) => a.localeCompare(b)); }

async function fetchText(url, timeout = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'user-agent': USER_AGENT, accept: 'application/xml,text/xml,text/plain,*/*' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally { clearTimeout(timer); }
}

function readLocs(xml) {
  return [...xml.matchAll(/<loc\b[^>]*>\s*([\s\S]*?)\s*<\/loc>/gi)].map(match => xmlDecode(match[1].trim())).filter(Boolean);
}

async function sitemapSeeds() {
  const seeds = new Set([`${SITE_URL}/sitemap.xml`, `${SITE_URL}/sitemap_index.xml`, `${SITE_URL}/sitemap-index.xml`]);
  try {
    const robots = await fetchText(`${SITE_URL}/robots.txt`);
    for (const match of robots.matchAll(/^\s*Sitemap\s*:\s*(\S+)/gim)) {
      try {
        const u = new URL(match[1]);
        if (u.origin === SITE_URL || ['localhost', '127.0.0.1'].includes(BASE_HOSTNAME)) {
          seeds.add(new URL(u.pathname, SITE_URL).href);
        }
      } catch {}
    }
  } catch { /* robots.txt is optional */ }
  return [...seeds];
}

async function discoverSitemap() {
  const queue = await sitemapSeeds();
  const visited = new Set();
  const pages = new Set();
  let readableCount = 0;
  while (queue.length && visited.size < 200 && pages.size < MAX_PAGES) {
    const sitemapUrl = queue.shift();
    if (visited.has(sitemapUrl)) continue;
    visited.add(sitemapUrl);
    let xml;
    try { xml = await fetchText(sitemapUrl); readableCount++; }
    catch { continue; }
    const isIndex = /<sitemapindex\b/i.test(xml);
    for (const location of readLocs(xml)) {
      let u;
      try { u = new URL(location, sitemapUrl); } catch { continue; }
      if (isIndex || /\.xml(?:$|\?)/i.test(u.pathname + u.search)) {
        const nextUrl = new URL(u.pathname, SITE_URL).href;
        if (!visited.has(nextUrl)) queue.push(nextUrl);
      } else {
        const route = normalizeRoute(u.pathname, SITE_URL);
        if (route) pages.add(route);
      }
      if (pages.size >= MAX_PAGES) break;
    }
  }
  if (pages.size) console.log(`🗺️ Sitemap discovery found ${pages.size} route(s) across ${readableCount} readable sitemap(s).`);
  else console.warn('⚠️ No usable page URLs were found in the sitemap(s).');
  return uniqueSorted([...pages]).slice(0, MAX_PAGES);
}

async function discoverByLinks(browser) {
  const visited = new Set(['/']);
  const queue = [{ route: '/', depth: 0 }];
  while (queue.length && visited.size < MAX_PAGES) {
    const { route, depth } = queue.shift();
    if (depth >= CRAWL_DEPTH) continue;
    const page = await browser.newPage();
    try {
      await page.setUserAgent(USER_AGENT);
      await page.goto(new URL(route, SITE_URL).href, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS });
      const hrefs = await page.$$eval('a[href]', anchors => anchors.map(anchor => anchor.href));
      for (const href of hrefs) {
        const nextRoute = normalizeRoute(href);
        if (nextRoute && !visited.has(nextRoute) && visited.size < MAX_PAGES) {
          visited.add(nextRoute);
          queue.push({ route: nextRoute, depth: depth + 1 });
        }
      }
    } catch (error) {
      console.warn(`⚠️ Route discovery could not open ${route}: ${error.message}`);
    } finally { await page.close().catch(() => {}); }
  }
  console.log(`🔎 Internal-link discovery found ${visited.size} route(s) (depth limit ${CRAWL_DEPTH}).`);
  return uniqueSorted([...visited]).slice(0, MAX_PAGES);
}

async function readRoutesFile() {
  if (!ROUTES_FILE) throw new Error('AUDIT_DISCOVERY=routes requires AUDIT_ROUTES_FILE to point to a text file.');
  const raw = await fs.readFile(path.resolve(ROUTES_FILE), 'utf8');
  return uniqueSorted(raw.split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('#'))
    .map(route => normalizeRoute(route)).filter(Boolean)).slice(0, MAX_PAGES);
}

async function getRoutes(browser) {
  if (DISCOVERY === 'routes') return readRoutesFile();
  if (DISCOVERY === 'crawl') return discoverByLinks(browser);
  if (!['auto', 'sitemap'].includes(DISCOVERY)) throw new Error(`Unknown AUDIT_DISCOVERY=${DISCOVERY}; use auto, sitemap, crawl, or routes.`);
  const sitemapRoutes = await discoverSitemap();
  if (sitemapRoutes.length) return sitemapRoutes;
  if (DISCOVERY === 'sitemap') throw new Error('Sitemap mode was requested but no usable sitemap routes were found.');
  return discoverByLinks(browser);
}

function score(points) { return Math.max(0, Math.min(100, Math.round(points))); }

async function auditOne(browser, route) {
  const requestedUrl = new URL(route, SITE_URL).href;
  let lastError = null;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    const page = await browser.newPage();
    const consoleErrors = [];
    const runtimeErrors = [];
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text().slice(0, 400)); });
    page.on('pageerror', error => runtimeErrors.push(String(error.message || error).slice(0, 400)));
    try {
      await page.setUserAgent(USER_AGENT);
      const response = await page.goto(requestedUrl, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS });
      if (WAIT_AFTER_LOAD_MS) await delay(WAIT_AFTER_LOAD_MS);
      const httpStatus = response?.status() ?? null;
      const finalUrl = page.url();
      const browserMetrics = await page.evaluate(() => {
        const text = (node) => (node?.innerText || '').trim();
        const title = document.title?.trim() || '';
        const metaDescription = document.querySelector('meta[name="description"]')?.content?.trim() || '';
        const canonical = document.querySelector('link[rel="canonical"]')?.href || '';
        const robots = document.querySelector('meta[name="robots"]')?.content?.trim() || '';
        const h1s = [...document.querySelectorAll('h1')].map(text).filter(Boolean);
        const imgs = [...document.querySelectorAll('img')];
        const missingAlt = imgs.filter(img => !img.hasAttribute('alt')).length;
        const controls = [...document.querySelectorAll('input,select,textarea')].filter(el => !['hidden','submit','button','reset','image'].includes((el.getAttribute('type') || '').toLowerCase()));
        const unlabeledControls = controls.filter(el => {
          const id = el.id;
          return !el.hasAttribute('aria-label') && !el.hasAttribute('aria-labelledby') &&
            !(id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) && !el.closest('label');
        }).length;
        const links = [...document.querySelectorAll('a[href]')];
        const unnamedLinks = links.filter(a => !text(a) && !a.getAttribute('aria-label') && !a.getAttribute('aria-labelledby') && !a.querySelector('img[alt]')).length;
        const allHeadings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => Number(h.tagName.slice(1)));
        let headingJumps = 0;
        for (let i=1; i<allHeadings.length; i++) if (allHeadings[i] > allHeadings[i-1] + 1) headingJumps++;
        const tables = [...document.querySelectorAll('table')];
        const tablesWithoutHeaders = tables.filter(t => t.querySelectorAll('th').length === 0).length;
        const viewport = !!document.querySelector('meta[name="viewport"]');
        const lang = document.documentElement.getAttribute('lang')?.trim() || '';
        const mainCount = document.querySelectorAll('main,[role="main"]').length;
        const linksData = links.map(a => a.href).filter(Boolean);
        const ldJson = [...document.querySelectorAll('script[type="application/ld+json"]')].map(script => {
          try { return JSON.parse(script.textContent || ''); } catch { return null; }
        }).filter(Boolean);
        const schemaTypes = [];
        const collect = value => {
          if (!value || typeof value !== 'object') return;
          if (value['@type']) schemaTypes.push(...(Array.isArray(value['@type']) ? value['@type'] : [value['@type']]));
          if (Array.isArray(value)) value.forEach(collect);
          else for (const [key, child] of Object.entries(value)) if (key !== '@type' && child && typeof child === 'object') collect(child);
        };
        ldJson.forEach(collect);
        const bodyText = (document.body?.innerText || '').trim();
        const imagesWithEmptyAlt = imgs.filter(img => img.hasAttribute('alt') && img.getAttribute('alt').trim() === '').length;
        const brokenAnchors = [...document.querySelectorAll('a[href^="#"]')].filter(a => {
          const hash = a.getAttribute('href');
          return hash && hash !== '#' && !document.getElementById(decodeURIComponent(hash.slice(1)));
        }).length;
        return {
          title, metaDescription, canonical, robots, h1Count: h1s.length, h1: h1s[0] || '',
          imageCount: imgs.length, missingAlt, imagesWithEmptyAlt, controlCount: controls.length, unlabeledControls,
          linkCount: links.length, unnamedLinks, tableCount: tables.length, tablesWithoutHeaders,
          headingJumps, viewport, lang, mainCount, schemaTypes: [...new Set(schemaTypes)],
          textLength: bodyText.length, brokenAnchors, internalLinks: linksData,
        };
      });
      const statusOk = httpStatus !== null && httpStatus >= 200 && httpStatus < 400;
      const titleLength = browserMetrics.title.length;
      const descriptionLength = browserMetrics.metaDescription.length;
      const titleOk = titleLength >= 30 && titleLength <= 65;
      const descriptionOk = descriptionLength >= 70 && descriptionLength <= 160;
      let canonicalOk = false;
      try { const canonical = new URL(browserMetrics.canonical); canonicalOk = ['http:', 'https:'].includes(canonical.protocol); } catch {}
      const seo = score((titleOk ? 20 : 0) + (descriptionOk ? 20 : 0) + (canonicalOk ? 20 : 0) +
        (browserMetrics.h1Count === 1 ? 15 : 0) + (browserMetrics.lang ? 10 : 0) +
        (!/\b(noindex|none)\b/i.test(browserMetrics.robots) ? 5 : 0) + (browserMetrics.textLength >= 100 ? 10 : 0));
      const accessibility = score(100 - browserMetrics.missingAlt * 8 - browserMetrics.unlabeledControls * 10 -
        browserMetrics.unnamedLinks * 5 - browserMetrics.headingJumps * 4 - browserMetrics.tablesWithoutHeaders * 5 - browserMetrics.brokenAnchors * 5);
      const technical = score((statusOk ? 40 : 0) + (browserMetrics.viewport ? 10 : 0) +
        (browserMetrics.textLength > 0 ? 15 : 0) + (browserMetrics.mainCount > 0 ? 5 : 0) +
        (consoleErrors.length === 0 ? 15 : Math.max(0, 15 - consoleErrors.length * 3)) +
        (runtimeErrors.length === 0 ? 15 : Math.max(0, 15 - runtimeErrors.length * 5)));
      const structuredData = browserMetrics.schemaTypes.length ? 100 : 50; // Informational only; not required on every page.
      const overall = score(seo * 0.4 + accessibility * 0.25 + technical * 0.25 + structuredData * 0.1);
      const issues = [];
      const add = (severity, code, message) => issues.push({ severity, code, message });
      if (!statusOk) add('critical', 'HTTP_STATUS', `Expected a successful HTTP response; received ${httpStatus ?? 'unknown'}.`);
      if (!titleOk) add('high', 'TITLE_LENGTH', `Title is ${titleLength} characters; this audit uses 30–65 as a review guideline.`);
      if (!descriptionOk) add('medium', 'META_DESCRIPTION', `Description is ${descriptionLength} characters; this audit uses 70–160 as a review guideline.`);
      if (!canonicalOk) add('high', 'CANONICAL', 'Missing or invalid canonical URL. Verify whether this page should have a canonical tag.');
      if (browserMetrics.h1Count !== 1) add('medium', 'H1_COUNT', `Detected ${browserMetrics.h1Count} H1 elements; review the page hierarchy.`);
      if (!browserMetrics.lang) add('medium', 'HTML_LANG', 'The root <html> element has no lang attribute.');
      if (browserMetrics.missingAlt) add('medium', 'IMAGE_ALT', `${browserMetrics.missingAlt} image(s) have no alt attribute. Decorative images should usually use alt="".`);
      if (browserMetrics.unlabeledControls) add('medium', 'FORM_LABELS', `${browserMetrics.unlabeledControls} form control(s) may lack an accessible label.`);
      if (browserMetrics.unnamedLinks) add('medium', 'LINK_NAME', `${browserMetrics.unnamedLinks} link(s) may lack an accessible name.`);
      if (browserMetrics.headingJumps) add('low', 'HEADING_ORDER', `${browserMetrics.headingJumps} heading-level jump(s) detected; review semantics and context.`);
      if (!browserMetrics.viewport) add('medium', 'VIEWPORT', 'Missing viewport meta tag.');
      if (!browserMetrics.mainCount) add('low', 'MAIN_LANDMARK', 'No <main> or role="main" landmark found; consider adding one if appropriate.');
      if (browserMetrics.brokenAnchors) add('medium', 'BROKEN_ANCHOR', `${browserMetrics.brokenAnchors} same-page anchor link(s) did not match an element ID.`);
      if (!browserMetrics.schemaTypes.length) add('info', 'STRUCTURED_DATA', 'No JSON-LD detected. Structured data is optional and should only be added when appropriate.');
      for (const message of consoleErrors.slice(0, 10)) add('low', 'CONSOLE_ERROR', message);
      for (const message of runtimeErrors.slice(0, 10)) add('high', 'RUNTIME_ERROR', message);
      return {
        requestedUrl, finalUrl, status: httpStatus, redirected: finalUrl !== requestedUrl,
        title: browserMetrics.title, titleLength, metaDescription: browserMetrics.metaDescription,
        metaDescriptionLength: descriptionLength, canonical: browserMetrics.canonical,
        scores: { seo, accessibility, technical, structuredData, overall },
        metrics: { ...browserMetrics, internalLinks: undefined }, internalLinks: browserMetrics.internalLinks,
        consoleErrors, runtimeErrors, issues,
      };
    } catch (error) {
      lastError = error;
      if (attempt < RETRIES) {
        console.warn(`Retry ${attempt + 1}/${RETRIES} for ${requestedUrl}: ${error.message}`);
        await delay(250 * (attempt + 1));
      }
    } finally { await page.close().catch(() => {}); }
  }
  return {
    requestedUrl, finalUrl: null, status: null, error: lastError?.message || 'Unknown navigation error',
    scores: { seo: 0, accessibility: 0, technical: 0, structuredData: 0, overall: 0 },
    metrics: {}, consoleErrors: [], runtimeErrors: [],
    issues: [{ severity: 'critical', code: 'NAVIGATION_FAILED', message: lastError?.message || 'Unknown navigation error' }],
  };
}

async function runPool(items, limit, worker) {
  const output = new Array(items.length);
  let cursor = 0;
  async function runWorker() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      output[index] = await worker(items[index], index);
      console.log(`[${index + 1}/${items.length}] HTTP ${output[index].status ?? 'ERR'} — ${new URL(items[index], SITE_URL).pathname}`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => runWorker()));
  return output;
}
function csvCell(value) {
  const text = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}
function makeCsv(pages) {
  const header = ['requestedUrl','finalUrl','status','redirected','overall','seo','accessibility','technical','structuredData','title','metaDescription','issueCount','error'];
  return [header, ...pages.map(p => [p.requestedUrl,p.finalUrl,p.status,p.redirected,p.scores?.overall,p.scores?.seo,p.scores?.accessibility,p.scores?.technical,p.scores?.structuredData,p.title,p.metaDescription,p.issues?.length ?? 0,p.error || ''])]
    .map(row => row.map(csvCell).join(',')).join('\n');
}
function escapeHtml(value) {
  return String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
}
function makeHtml(report) {
  const rows = report.pages.map(p => {
    const issues = (p.issues || []).map(i => `<li><b>${escapeHtml(i.severity)}</b> — ${escapeHtml(i.code)}: ${escapeHtml(i.message)}</li>`).join('');
    let displayPath = p.requestedUrl;
    try { displayPath = new URL(p.requestedUrl).pathname; } catch {}
    return `<tr><td><a href="${escapeHtml(p.requestedUrl)}">${escapeHtml(displayPath)}</a>${p.redirected ? '<small> → redirected</small>' : ''}</td><td>${escapeHtml(p.status ?? 'ERR')}</td><td>${p.scores?.overall ?? 0}</td><td>${p.scores?.seo ?? 0}</td><td>${p.scores?.accessibility ?? 0}</td><td>${p.scores?.technical ?? 0}</td><td><details><summary>${p.issues?.length ?? 0} finding(s)</summary><ul>${issues || '<li>No findings from configured checks.</li>'}</ul></details></td></tr>`;
  }).join('\n');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Omega Site Audit Pro ${VERSION}</title>
<style>body{margin:0;padding:28px;background:#0b1020;color:#e8edf7;font:15px/1.5 system-ui,sans-serif;max-width:1600px;margin-inline:auto}h1{margin-bottom:4px}.muted{color:#a9b5cb}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin:22px 0}.card{background:#151d32;border:1px solid #2b3854;border-radius:14px;padding:16px}.value{font-size:28px;font-weight:750}.wrap{overflow:auto;border:1px solid #2b3854;border-radius:12px}table{border-collapse:collapse;width:100%;min-width:900px}th,td{text-align:left;padding:12px;border-bottom:1px solid #2b3854;vertical-align:top}th{background:#151d32}a{color:#8db7ff}small{display:block;color:#a9b5cb}details{min-width:240px}li{margin:7px 0}</style></head><body>
<h1>Omega Site Audit Pro</h1><p class="muted">Version ${VERSION} • Read-only rendered-page audit • ${escapeHtml(report.siteUrl)} • ${escapeHtml(report.timestamp)}</p>
<div class="cards"><div class="card"><div class="muted">Pages audited</div><div class="value">${report.totalPagesAudited}</div></div><div class="card"><div class="muted">Average overall score</div><div class="value">${report.siteHealthScore}%</div></div><div class="card"><div class="muted">Failed navigations</div><div class="value">${report.failedPages}</div></div><div class="card"><div class="muted">Total findings</div><div class="value">${report.totalIssues}</div></div></div>
<p class="muted">Scores use transparent heuristic checks, not Google ranking predictions or a complete WCAG conformance evaluation. Review findings in context before changing pages.</p><div class="wrap"><table><thead><tr><th>Page</th><th>HTTP</th><th>Overall</th><th>SEO</th><th>Accessibility</th><th>Technical</th><th>Findings</th></tr></thead><tbody>${rows}</tbody></table></div></body></html>`;
}

async function main() {
  console.log(`\n🚀 Omega Site Audit Pro Universal v${VERSION}`);
  console.log(`🌐 Site: ${SITE_URL}`);
  console.log(`⚙️ Discovery: ${DISCOVERY} | Concurrency: ${CONCURRENCY} | Timeout: ${TIMEOUT_MS}ms | Max pages: ${MAX_PAGES}`);
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const launchOptions = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  };
  const execPath = findChromeExecutable();
  if (execPath) {
    launchOptions.executablePath = execPath;
  } else {
    launchOptions.channel = 'chrome';
  }
  const browser = await puppeteer.launch(launchOptions);
  let routes;
  let pages;
  try {
    routes = await getRoutes(browser);
    if (!routes.length) throw new Error('No routes discovered. Check SITE_URL, sitemap, and link accessibility.');
    console.log(`📋 Auditing ${routes.length} route(s).`);
    pages = await runPool(routes, CONCURRENCY, route => auditOne(browser, route));
  } finally { await browser.close().catch(() => {}); }
  const successful = pages.filter(p => !p.error);
  const avg = successful.length ? Math.round(successful.reduce((sum, p) => sum + (p.scores?.overall || 0), 0) / successful.length) : 0;
  const report = {
    tool: 'Omega Site Audit Pro Universal', version: VERSION, timestamp: new Date().toISOString(), siteUrl: SITE_URL,
    configuration: { discovery: DISCOVERY, concurrency: CONCURRENCY, timeoutMs: TIMEOUT_MS, maxPages: MAX_PAGES, crawlDepth: CRAWL_DEPTH, retries: RETRIES },
    totalPagesAudited: pages.length, successfulNavigations: successful.length, failedPages: pages.length - successful.length,
    siteHealthScore: avg, totalIssues: pages.reduce((sum, p) => sum + (p.issues?.length || 0), 0), pages,
  };
  const jsonFile = path.join(OUTPUT_DIR, 'omega-master-site-report.json');
  const csvFile = path.join(OUTPUT_DIR, 'omega-master-site-report.csv');
  const htmlFile = path.join(OUTPUT_DIR, 'omega-master-site-report.html');
  await Promise.all([
    fs.writeFile(jsonFile, JSON.stringify(report, null, 2), 'utf8'),
    fs.writeFile(csvFile, makeCsv(pages), 'utf8'),
    fs.writeFile(htmlFile, makeHtml(report), 'utf8'),
  ]);
  console.log('\n✅ Audit finished.');
  console.log(`JSON: ${jsonFile}\nCSV:  ${csvFile}\nHTML: ${htmlFile}`);
  console.table(pages.map(p => ({ page: new URL(p.requestedUrl).pathname, HTTP: p.status ?? 'ERR', overall: `${p.scores?.overall ?? 0}%`, SEO: `${p.scores?.seo ?? 0}%`, a11y: `${p.scores?.accessibility ?? 0}%`, technical: `${p.scores?.technical ?? 0}%`, issues: p.issues?.length ?? 0 })));
  if (report.failedPages) process.exitCode = 1;
}

main().catch(error => {
  console.error(`\n❌ Omega Site Audit Pro failed: ${error.stack || error.message || error}`);
  process.exitCode = 1;
});
