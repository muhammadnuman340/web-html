#!/usr/bin/env node
/**
 * Omega Site Audit Pro Universal V4 — read-only audit CLI.
 * Requires Node.js 20+ and Puppeteer. Optional Lighthouse and GSC adapter support are explicit.
 * The scanner never modifies scanned websites or applies fixes.
 */
import puppeteer from 'puppeteer';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import readline from 'node:readline';
import dns from 'node:dns/promises';
import net from 'node:net';
import { fileURLToPath } from 'node:url';
import {
  normalizePageUrl, extractXmlLocs, parseRobotsTxt, severityPriority,
  deduplicateFindings, hashText, normaliseText, scoreFromFindings, compareReports,
} from '../src/core.mjs';
import { writeReports } from '../src/report.mjs';
import { fetchGscSearchAnalytics } from '../src/gsc.mjs';

const VERSION = '4.0.0';
const SOURCE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SOURCE_DIR, '..');
const rawSiteUrl = process.env.SITE_URL || 'http://localhost:4321';
const SITE_URL = new URL(rawSiteUrl).origin;
if (!['http:', 'https:'].includes(new URL(SITE_URL).protocol)) throw new Error('SITE_URL must use http or https.');
const SITE = new URL(SITE_URL);
const USER_AGENT = process.env.AUDIT_USER_AGENT || `OmegaSiteAuditPro/${VERSION} (+read-only site quality audit)`;
const CHROME_PATH = process.env.AUDIT_CHROME_PATH || '';
const CHROME_NO_SANDBOX = String(process.env.AUDIT_CHROME_NO_SANDBOX || 'false').toLowerCase() === 'true';
const CONCURRENCY = intEnv('AUDIT_CONCURRENCY', 2, 1, 8);
const REQUEST_DELAY_MS = intEnv('AUDIT_REQUEST_DELAY_MS', 150, 0, 10000);
const TIMEOUT_MS = intEnv('AUDIT_TIMEOUT_MS', 20000, 1000, 120000);
const RETRIES = intEnv('AUDIT_RETRIES', 1, 0, 4);
const MAX_PAGES = intEnv('AUDIT_MAX_PAGES', 0, 0, 100000000); // 0 means no page-count ceiling.
const CRAWL_DEPTH = intEnv('AUDIT_CRAWL_DEPTH', 8, 0, 100);
const MAX_SITEMAPS = intEnv('AUDIT_MAX_SITEMAPS', 1000, 1, 10000);
const MAX_SITEMAP_BYTES = intEnv('AUDIT_MAX_SITEMAP_BYTES', 20 * 1024 * 1024, 1024, 100 * 1024 * 1024);
const MAX_DURATION_MINUTES = intEnv('AUDIT_MAX_DURATION_MINUTES', 120, 1, 1440);
const MAX_HEAP_MB = intEnv('AUDIT_MAX_HEAP_MB', 1536, 256, 8192);
const OUTPUT_DIR = path.resolve(process.env.AUDIT_OUTPUT_DIR || 'audit-reports');
const DISCOVERY = String(process.env.AUDIT_DISCOVERY || 'auto').toLowerCase();
const ROUTES_FILE = process.env.AUDIT_ROUTES_FILE || '';
const INCLUDE_PATHS = String(process.env.AUDIT_INCLUDE_PATHS || '').split(',').map(value => value.trim()).filter(Boolean);
const EXCLUDE_PATHS = String(process.env.AUDIT_EXCLUDE_PATHS || '').split(',').map(value => value.trim()).filter(Boolean);
const AUTH_HEADERS_FILE = process.env.AUDIT_AUTH_HEADERS_FILE || '';
let SITE_AUTH_HEADERS = {};
let ROBOTS_META = null;
const SETTLE_MS = intEnv('AUDIT_SETTLE_MS', 350, 0, 10000);
const KEEP_QUERY = String(process.env.AUDIT_KEEP_QUERY || 'false').toLowerCase() === 'true';
const CHECK_EXTERNAL_LINKS = String(process.env.AUDIT_CHECK_EXTERNAL_LINKS || 'false').toLowerCase() === 'true';
const MAX_EXTERNAL_LINKS = intEnv('AUDIT_MAX_EXTERNAL_LINKS', 300, 1, 5000);
const PROFILE = String(process.env.AUDIT_PROFILE || 'professional').toLowerCase();
const CUSTOM_PROFILE_CATEGORIES = String(process.env.AUDIT_PROFILE_CATEGORIES || '').split(',').map(value => value.trim().toLowerCase()).filter(Boolean);
const RUN_LIGHTHOUSE = String(process.env.AUDIT_LIGHTHOUSE || 'false').toLowerCase() === 'true';
const LIGHTHOUSE_MAX_PAGES = intEnv('AUDIT_LIGHTHOUSE_MAX_PAGES', 5, 1, 100);
const ALLOW_PRIVATE_TARGET = String(process.env.AUDIT_ALLOW_PRIVATE_NETWORK || 'false').toLowerCase() === 'true';
const RESPECT_ROBOTS = String(process.env.AUDIT_RESPECT_ROBOTS || 'true').toLowerCase() !== 'false';
const GSC_TOKEN = process.env.GSC_ACCESS_TOKEN || '';
const GSC_PROPERTY = process.env.GSC_SITE_URL || SITE_URL;
const GSC_START_DATE = process.env.GSC_START_DATE || '';
const GSC_END_DATE = process.env.GSC_END_DATE || '';
const COMPARE_WITH = process.env.AUDIT_COMPARE_WITH || '';
const STARTED_AT = Date.now();
const DEADLINE = STARTED_AT + MAX_DURATION_MINUTES * 60_000;
const DNS_CACHE = new Map();
const ACTIVE_PAGES = new Set();
let paused = false;
let cancelRequested = false;
let cancelledReason = '';
let uiInput = null;
let lastNavigationStart = 0;
let navigationQueue = Promise.resolve();

function intEnv(name, fallback, min, max) {
  const raw = process.env[name];
  if (raw == null || raw === '') return fallback;
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function isLocalHostname(hostname) { return ['localhost', 'localhost.localdomain'].includes(hostname.toLowerCase()); }
function ipToV4Numbers(ip) { return ip.split('.').map(Number); }
function inV4(ip, prefix, bits) {
  const value = ipToV4Numbers(ip);
  const base = ipToV4Numbers(prefix);
  let remaining = bits;
  for (let i = 0; i < 4; i++) {
    const take = Math.min(8, remaining);
    const mask = take === 0 ? 0 : (0xff << (8 - take)) & 0xff;
    if ((value[i] & mask) !== (base[i] & mask)) return false;
    remaining -= take;
  }
  return true;
}
function isPublicIp(ip) {
  if (net.isIPv4(ip)) {
    const blocked = [
      ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8],
      ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24],
      ['192.88.99.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15], ['198.51.100.0', 24],
      ['203.0.113.0', 24], ['224.0.0.0', 4], ['240.0.0.0', 4],
    ];
    return !blocked.some(([network, bits]) => inV4(ip, network, bits));
  }
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === '::' || lower === '::1' || lower.startsWith('fc') || lower.startsWith('fd') ||
        /^fe[89ab]/.test(lower) || lower.startsWith('ff') || lower.startsWith('2001:db8:')) return false;
    const mapped = lower.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPublicIp(mapped[1]);
    return true;
  }
  return false;
}
async function hostIsPublic(hostname) {
  if (DNS_CACHE.has(hostname)) return DNS_CACHE.get(hostname);
  let result = false;
  try {
    if (net.isIP(hostname)) result = isPublicIp(hostname);
    else if (isLocalHostname(hostname)) result = false;
    else {
      const rows = await dns.lookup(hostname, { all: true, verbatim: true });
      result = rows.length > 0 && rows.every(row => isPublicIp(row.address));
    }
  } catch { result = false; }
  DNS_CACHE.set(hostname, result);
  return result;
}
function routeUrl(value) { return normalizePageUrl(value, SITE_URL, { keepQuery: KEEP_QUERY }); }
function ruleMatches(urlValue, rule) {
  let url;
  try { url = new URL(urlValue, SITE_URL); } catch { return false; }
  const candidates = [url.pathname, url.href];
  if (rule.startsWith('re:')) {
    try { const regex = new RegExp(rule.slice(3)); return candidates.some(candidate => regex.test(candidate)); } catch { return false; }
  }
  const escaped = rule.replace(/[.+^${}()|[\]\\]/g, '\\$&').replaceAll('**', '§DOUBLESTAR§').replaceAll('*', '[^/]*').replaceAll('§DOUBLESTAR§', '.*');
  try { const regex = new RegExp(`^${escaped}$`); return candidates.some(candidate => regex.test(candidate)); } catch { return false; }
}
function isExcludedByUserRules(url) { return EXCLUDE_PATHS.some(rule => ruleMatches(url, rule)); }
function isIncludedByUserRules(url) { return !INCLUDE_PATHS.length || INCLUDE_PATHS.some(rule => ruleMatches(url, rule)); }
function filterRoutesByRules(routes) {
  const unique = [...new Set(routes)].filter(url => isRobotsAllowed(url));
  const filtered = unique.filter(url => {
    if (!isIncludedByUserRules(url)) return false;
    if (isExcludedByUserRules(url)) return false;
    return true;
  });
  return MAX_PAGES > 0 ? filtered.slice(0, MAX_PAGES) : filtered;
}
function isSameOrigin(value) {
  try { return new URL(value).origin === SITE_URL; } catch { return false; }
}
function withinScope(value) {
  try { return new URL(value).origin === SITE_URL; } catch { return false; }
}
function crawlDelayMs() {
  if (!RESPECT_ROBOTS || !ROBOTS_META?.robotsTxt?.rules) return 0;
  const delays = ROBOTS_META.robotsTxt.rules.filter(rule => rule.directive === 'crawl-delay' && (rule.agents || []).some(agent => agent === '*' || agent.replace(/[^a-z0-9_-]/g, '').includes('omegasiteauditpro'))).map(rule => Number.parseFloat(rule.value)).filter(value => Number.isFinite(value) && value >= 0);
  return delays.length ? Math.min(300000, Math.max(...delays) * 1000) : 0;
}
async function reserveNavigationSlot() {
  let release;
  const previous = navigationQueue;
  navigationQueue = new Promise(resolve => { release = resolve; });
  await previous;
  try {
    if (!await waitForRunPermission()) return false;
    const requiredDelay = Math.max(REQUEST_DELAY_MS, crawlDelayMs());
    const remaining = requiredDelay - (Date.now() - lastNavigationStart);
    if (remaining > 0) await delay(remaining);
    if (!await waitForRunPermission()) return false;
    lastNavigationStart = Date.now();
    return true;
  } finally { release(); }
}
async function navigatePage(page, url, options) {
  if (!await reserveNavigationSlot()) throw new Error(cancelledReason || 'Audit cancelled before next navigation.');
  return page.goto(url, options);
}
function deadlineHit() { return Date.now() > DEADLINE; }
function requestStopIfResourceLimit() {
  const heapMb = process.memoryUsage().heapUsed / 1024 / 1024;
  if (heapMb > MAX_HEAP_MB) {
    cancelRequested = true;
    cancelledReason = `Node heap safety limit reached (${heapMb.toFixed(0)} MB > ${MAX_HEAP_MB} MB).`;
  } else if (deadlineHit()) {
    cancelRequested = true;
    cancelledReason = `Maximum audit duration reached (${MAX_DURATION_MINUTES} minutes).`;
  }
  return cancelRequested;
}
async function waitForRunPermission() {
  while (paused && !cancelRequested) await delay(250);
  requestStopIfResourceLimit();
  return !cancelRequested;
}
function requestCancel(reason = 'Audit cancelled by user.') {
  if (cancelRequested) return;
  cancelRequested = true;
  cancelledReason = reason;
  for (const page of ACTIVE_PAGES) page.close().catch(() => {});
  console.warn(`\n⏹ ${cancelledReason}`);
}
function attachInteractiveControls() {
  if (!process.stdin.isTTY) {
    console.log('Controls: Ctrl+C cancels this run. Interactive pause/resume is available in a TTY terminal.');
    return;
  }
  uiInput = readline.createInterface({ input: process.stdin, output: process.stdout });
  console.log('Controls: type p + Enter to pause, r + Enter to resume, c + Enter to cancel, h + Enter for help.');
  uiInput.on('line', line => {
    const command = line.trim().toLowerCase();
    if (command === 'p' || command === 'pause') { paused = true; console.log('⏸ Pause requested; in-flight page navigation may finish.'); }
    else if (command === 'r' || command === 'resume') { paused = false; console.log('▶ Resumed.'); }
    else if (command === 'c' || command === 'cancel') requestCancel();
    else if (command === 'h' || command === 'help') console.log('p=pause, r=resume, c=cancel, h=help');
  });
}
function redactSensitiveText(value) {
  return String(value ?? '').replace(/Bearer\s+[A-Za-z0-9._~-]+/gi, 'Bearer [REDACTED]')
    .replace(/([?&](?:token|access_token|api_key|apikey|password|secret)=)[^&\s]+/gi, '$1[REDACTED]')
    .slice(0, 500);
}
function makeFinding({ severity = 'medium', category = 'technical', code, message, url, evidence = '', recommendation = '', confidence = 'medium', source = 'browser-heuristic' }) {
  return { severity, category, code, message: redactSensitiveText(message), url, evidence: redactSensitiveText(evidence), recommendation, confidence, source };
}
function score(n) { return Math.max(0, Math.min(100, Math.round(n))); }

function robotsPatternMatches(pathValue, pattern) {
  if (!pattern) return false;
  const anchored = pattern.endsWith('$');
  const raw = anchored ? pattern.slice(0, -1) : pattern;
  const escaped = raw.replace(/[.+^${}()|[\]\\]/g, '\\$&').replaceAll('*', '.*');
  const expression = new RegExp(`^${escaped}${anchored ? '' : '.*'}$`);
  return expression.test(pathValue);
}
function isRobotsAllowed(value) {
  if (!RESPECT_ROBOTS || !ROBOTS_META?.robotsTxt?.rules?.length) return true;
  let url;
  try { url = new URL(value); } catch { return false; }
  if (url.origin !== SITE_URL) return true;
  const rules = ROBOTS_META.robotsTxt.rules.filter(rule =>
    (rule.agents || []).some(agent => agent === '*' || agent.replace(/[^a-z0-9_-]/g, '').includes('omegasiteauditpro')) &&
    ['allow','disallow'].includes(rule.directive) && rule.value !== '' && robotsPatternMatches(url.pathname + url.search, rule.value));
  if (!rules.length) return true;
  const specificity = rule => rule.value.replace(/[\*$]/g, '').length;
  rules.sort((a,b) => specificity(b) - specificity(a) || (a.directive === 'allow' ? -1 : 1));
  return rules[0].directive === 'allow';
}

async function assertSafeRequestUrl(value, { forPageNavigation = false } = {}) {
  let url;
  try { url = new URL(value); } catch { return false; }
  if (!['http:', 'https:'].includes(url.protocol)) return ['about:', 'data:', 'blob:'].includes(url.protocol);
  if (url.origin === SITE_URL && !isRobotsAllowed(url.href)) return false;
  if (forPageNavigation && url.origin !== SITE_URL) return false;
  if (url.origin === SITE_URL) {
    if (ALLOW_PRIVATE_TARGET) return true;
    const host = url.hostname.toLowerCase();
    if (isLocalHostname(host) || host === '::1' || host === '127.0.0.1') return false;
    const publicHost = await hostIsPublic(host);
    return publicHost;
  }
  return await hostIsPublic(url.hostname);
}

async function readResponseTextLimited(response, maxBytes) {
  const declared = Number(response.headers.get('content-length') || 0);
  if (declared > maxBytes) throw new Error(`Response exceeds the configured text resource limit (${maxBytes} bytes).`);
  if (!response.body) return '';
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) { await reader.cancel(); throw new Error(`Response exceeded the configured text resource limit (${maxBytes} bytes).`); }
      chunks.push(Buffer.from(value));
    }
  } finally { reader.releaseLock?.(); }
  return Buffer.concat(chunks, total).toString('utf8');
}

async function safeFetchText(startUrl, timeoutMs = 10000) {
  let current = new URL(startUrl);
  for (let redirects = 0; redirects <= 5; redirects++) {
    if (!withinScope(current.href)) throw new Error('Cross-origin sitemap/robots redirect blocked.');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    try {
      response = await fetch(current.href, {
        method: 'GET', signal: controller.signal, redirect: 'manual',
        headers: { 'user-agent': USER_AGENT, accept: 'application/xml,text/xml,text/plain,*/*' },
      });
    } finally { clearTimeout(timer); }
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (!location) throw new Error(`HTTP ${response.status} redirect without Location header.`);
      await response.body?.cancel().catch(() => {});
      current = new URL(location, current);
      continue;
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return { text: await readResponseTextLimited(response, MAX_SITEMAP_BYTES), status: response.status, url: current.href };
  }
  throw new Error('Too many redirects while fetching text resource.');
}

async function getRobotsAndSitemapSeeds() {
  const result = { robotsTxt: null, sitemapUrls: [], warnings: [] };
  try {
    const response = await safeFetchText(`${SITE_URL}/robots.txt`);
    const parsed = parseRobotsTxt(response.text);
    result.robotsTxt = { status: response.status, sitemaps: parsed.sitemaps, rules: parsed.rules };
    result.sitemapUrls.push(...parsed.sitemaps.filter(value => { try { return withinScope(new URL(value, SITE_URL).href); } catch { return false; } }));
  } catch (error) {
    result.robotsTxt = { status: null, sitemaps: [], rules: [], error: error.message };
    result.warnings.push(`robots.txt could not be read: ${error.message}`);
  }
  result.sitemapUrls.push(`${SITE_URL}/sitemap.xml`, `${SITE_URL}/sitemap_index.xml`, `${SITE_URL}/sitemap-index.xml`);
  result.sitemapUrls = [...new Set(result.sitemapUrls)];
  return result;
}

async function discoverSitemap() {
  const meta = ROBOTS_META || await getRobotsAndSitemapSeeds();
  ROBOTS_META = meta;
  const queue = [...meta.sitemapUrls];
  const visited = new Set();
  const pages = new Set();
  let readableCount = 0;
  const errors = [];
  while (queue.length && visited.size < MAX_SITEMAPS && !requestStopIfResourceLimit()) {
    if (!await waitForRunPermission()) break;
    const sitemapUrl = queue.shift();
    if (visited.has(sitemapUrl)) continue;
    visited.add(sitemapUrl);
    let xml;
    try { const response = await safeFetchText(sitemapUrl); xml = response.text; readableCount++; }
    catch (error) { errors.push({ url: sitemapUrl, message: error.message }); continue; }
    if (!/<(?:urlset|sitemapindex)\b/i.test(xml)) { errors.push({ url: sitemapUrl, message: 'Response does not appear to contain a sitemap urlset or sitemapindex root.' }); continue; }
    const indexFile = /<sitemapindex\b/i.test(xml);
    for (const location of extractXmlLocs(xml)) {
      let absolute;
      try { absolute = new URL(location, sitemapUrl).href; } catch { continue; }
      if (!withinScope(absolute)) continue;
      if (indexFile || /\.xml(?:$|\?)/i.test(new URL(absolute).pathname + new URL(absolute).search)) {
        if (!visited.has(absolute)) queue.push(absolute);
      } else {
        const normalised = routeUrl(absolute);
        if (normalised) pages.add(normalised);
        if (MAX_PAGES > 0 && pages.size >= MAX_PAGES) break;
      }
    }
  }
  if (queue.length && visited.size >= MAX_SITEMAPS) errors.push({ url: '', message: `Sitemap safety ceiling (${MAX_SITEMAPS}) reached.` });
  return { pages: [...pages], meta: { ...meta, sitemapCount: visited.size, readableSitemaps: readableCount, sitemapErrors: errors, sitemapUrlsFound: pages.size } };
}

async function attachRequestGuard(page) {
  await page.setRequestInterception(true);
  page.on('request', request => {
    void (async () => {
      try {
        const url = request.url();
        const parsed = new URL(url);
        if (!['http:', 'https:', 'about:', 'data:', 'blob:'].includes(parsed.protocol)) {
          await request.abort('blockedbyclient').catch(() => {}); return;
        }
        const isMainFrameNavigation = request.isNavigationRequest() && request.frame() === page.mainFrame();
        const safe = await assertSafeRequestUrl(url, { forPageNavigation: isMainFrameNavigation });
        if (!safe) { await request.abort('blockedbyclient').catch(() => {}); return; }
        if (!request.isInterceptResolutionHandled?.()) {
          const headers = url.startsWith(SITE_URL) && new URL(url).origin === SITE_URL && Object.keys(SITE_AUTH_HEADERS).length
            ? { ...request.headers(), ...SITE_AUTH_HEADERS } : request.headers();
          await request.continue({ headers }).catch(() => {});
        }
      } catch {
        if (!request.isInterceptResolutionHandled?.()) await request.abort('blockedbyclient').catch(() => {});
      }
    })();
  });
}

async function createPage(browser) {
  const page = await browser.newPage();
  ACTIVE_PAGES.add(page);
  await page.setUserAgent(USER_AGENT);
  await page.setViewport({ width: 1365, height: 900, deviceScaleFactor: 1 });
  await page.setDefaultNavigationTimeout(TIMEOUT_MS);
  // Measure the network response rather than a cached/service-worker response.
  // Without this, PWA navigations can return a null status and be counted as failures.
  await page.setCacheEnabled(false).catch(() => {});
  if (typeof page.setBypassServiceWorker === 'function') {
    await page.setBypassServiceWorker(true).catch(() => {});
  }
  await attachRequestGuard(page);
  await page.evaluateOnNewDocument(() => {
    window.__omegaVitals = { lcp: null, cls: 0, longTaskMs: 0 };
    try {
      new PerformanceObserver(list => {
        const entries = list.getEntries();
        if (entries.length) window.__omegaVitals.lcp = entries[entries.length - 1].startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {}
    try {
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__omegaVitals.cls += entry.value;
      }).observe({ type: 'layout-shift', buffered: true });
    } catch {}
    try {
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) window.__omegaVitals.longTaskMs += entry.duration;
      }).observe({ type: 'longtask', buffered: true });
    } catch {}
  });
  return page;
}

async function readBrowserMetrics(page) {
  return page.evaluate(() => {
    const text = el => (el?.innerText || el?.textContent || '').trim();
    const title = document.title?.trim() || '';
    const description = document.querySelector('meta[name="description"]')?.content?.trim() || '';
    const canonical = document.querySelector('link[rel="canonical"]')?.href || '';
    const robotsMeta = document.querySelector('meta[name="robots"]')?.content?.trim() || '';
    const h1 = [...document.querySelectorAll('h1')].map(text).filter(Boolean);
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(el => ({ level: Number(el.tagName.slice(1)), text: text(el).slice(0, 220) }));
    let headingJumps = 0;
    for (let i = 1; i < headings.length; i++) if (headings[i].level > headings[i - 1].level + 1) headingJumps++;
    const images = [...document.querySelectorAll('img')];
    const controls = [...document.querySelectorAll('input,select,textarea')].filter(el => !['hidden','submit','button','reset','image'].includes((el.getAttribute('type') || '').toLowerCase()));
    const unlabeledControls = controls.filter(el => {
      const id = el.id;
      let linkedLabel = false;
      if (id) { try { linkedLabel = !!document.querySelector(`label[for="${CSS.escape(id)}"]`); } catch {} }
      return !el.hasAttribute('aria-label') && !el.hasAttribute('aria-labelledby') && !linkedLabel && !el.closest('label');
    }).length;
    const links = [...document.querySelectorAll('a[href]')];
    const unnamedLinks = links.filter(a => !text(a) && !a.getAttribute('aria-label') && !a.getAttribute('aria-labelledby') && !a.querySelector('img[alt]')).length;
    const tables = [...document.querySelectorAll('table')];
    const invalidJsonLd = [];
    let jsonLdWithoutContext = 0;
    const jsonLdValues = [];
    for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
      try { const value = JSON.parse(script.textContent || ''); jsonLdValues.push(value); if (!value || typeof value !== 'object' || !Object.hasOwn(value, '@context')) jsonLdWithoutContext++; }
      catch (error) { invalidJsonLd.push((error?.message || 'Invalid JSON').slice(0, 180)); }
    }
    const schemaTypes = [];
    const visitSchema = value => {
      if (!value || typeof value !== 'object') return;
      if (value['@type']) schemaTypes.push(...(Array.isArray(value['@type']) ? value['@type'] : [value['@type']]));
      if (Array.isArray(value)) value.forEach(visitSchema);
      else for (const [key, child] of Object.entries(value)) if (key !== '@type' && child && typeof child === 'object') visitSchema(child);
    };
    jsonLdValues.forEach(visitSchema);
    const bodyText = (document.body?.innerText || '').replace(/\s+/g, ' ').trim();
    const samePageBrokenAnchors = [...document.querySelectorAll('a[href^="#"]')].filter(a => {
      const hash = a.getAttribute('href');
      if (!hash || hash === '#') return false;
      try { return !document.getElementById(decodeURIComponent(hash.slice(1))); } catch { return true; }
    }).length;
    const internalLinks = [];
    const externalLinks = [];
    const seenInternal = new Set();
    const seenExternal = new Set();
    for (const anchor of links) {
      let url;
      try { url = new URL(anchor.href); } catch { continue; }
      if (!['http:', 'https:'].includes(url.protocol)) continue;
      url.hash = '';
      const record = { url: url.href, text: text(anchor).slice(0, 160) };
      if (url.origin === location.origin && !seenInternal.has(url.href) && internalLinks.length < 1500) { seenInternal.add(url.href); internalLinks.push(record); }
      else if (url.origin !== location.origin && !seenExternal.has(url.href) && externalLinks.length < 300) { seenExternal.add(url.href); externalLinks.push(record); }
    }
    const computedFontFamilies = new Set();
    for (const el of [...document.querySelectorAll('body, p, a, button, h1, h2, h3, input, label')].slice(0, 2500)) {
      const family = getComputedStyle(el).fontFamily;
      if (family) computedFontFamilies.add(family.split(',')[0].replace(/["']/g, '').trim());
    }
    const fontLinks = [...document.querySelectorAll('link[rel~="stylesheet"],link[rel="preload"][as="font"]')]
      .map(el => el.href).filter(href => /fonts\.|\.woff2?(?:\?|$)|\.ttf(?:\?|$)/i.test(href)).slice(0, 100);
    const adNodes = [...document.querySelectorAll('[id*="ad-" i],[id$="-ad" i],[id~="ad" i],[id*="advert" i],[class*="ad-" i],[class~="ad" i],[class*="advert" i],[data-ad-client],ins.adsbygoogle,iframe[src*="doubleclick" i],iframe[src*="ads" i]')].slice(0, 100);
    const adObservations = adNodes.map(el => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return { tag: el.tagName.toLowerCase(), id: el.id || '', className: String(el.className || '').slice(0, 100), width: Math.round(rect.width), height: Math.round(rect.height), position: style.position, fixedOrSticky: ['fixed','sticky'].includes(style.position), outsideViewport: rect.bottom < 0 || rect.top > innerHeight || rect.right < 0 || rect.left > innerWidth };
    });
    const textElements = [...document.querySelectorAll('p,li,label,button,a,h1,h2,h3')].filter(el => text(el)).slice(0, 600);
    const fontSizes = textElements.map(el => parseFloat(getComputedStyle(el).fontSize)).filter(Number.isFinite);
    const questionHeadings = headings.filter(item => /\?$/.test(item.text) || /^(how|what|why|when|where|who|can|does|is|are|should|will)\b/i.test(item.text));
    const hasAuthorSignal = !!document.querySelector('[rel="author"],[itemprop="author"],meta[name="author"],a[href*="author" i]');
    const hasDateSignal = !!document.querySelector('time[datetime],meta[property="article:published_time"],meta[name="date"]');
    const viewport = !!document.querySelector('meta[name="viewport"]');
    const lang = document.documentElement.getAttribute('lang')?.trim() || '';
    const mainCount = document.querySelectorAll('main,[role="main"]').length;
    const navigation = performance.getEntriesByType('navigation')[0];
    const resourceEntries = performance.getEntriesByType('resource');
    const vitals = window.__omegaVitals || {};
    return {
      title, description, canonical, robotsMeta,
      h1Count: h1.length, h1: h1[0] || '', headings: headings.slice(0, 250), headingJumps,
      contentTruncated: bodyText.length > 250000,
      imageCount: images.length, missingAlt: images.filter(img => !img.hasAttribute('alt')).length,
      controlsCount: controls.length, unlabeledControls, linksCount: links.length, unnamedLinks,
      tablesCount: tables.length, tablesWithoutHeaders: tables.filter(t => !t.querySelector('th')).length,
      viewport, lang, mainCount, textLength: bodyText.length, contentSample: bodyText.slice(0, 250000),
      jsonLdCount: document.querySelectorAll('script[type="application/ld+json"]').length,
      invalidJsonLd, jsonLdWithoutContext, schemaTypes: [...new Set(schemaTypes.map(String))],
      brokenAnchors: samePageBrokenAnchors, internalLinks, externalLinks,
      fontStatus: document.fonts?.status || 'unknown', fontFamilyCount: computedFontFamilies.size,
      fontFamilies: [...computedFontFamilies].slice(0, 30), fontLinks,
      adCount: adNodes.length, adObservations,
      minSampledFontPx: fontSizes.length ? Math.min(...fontSizes) : null,
      tinyTextCount: fontSizes.filter(size => size < 12).length,
      questionHeadingCount: questionHeadings.length, hasAuthorSignal, hasDateSignal,
      hasArticleContent: !!document.querySelector('article'),
      ttfbMs: navigation ? Math.round(navigation.responseStart) : null,
      domContentLoadedMs: navigation ? Math.round(navigation.domContentLoadedEventEnd) : null,
      resourceCount: resourceEntries.length,
      transferSizeBytes: resourceEntries.reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
      jsTransferBytes: resourceEntries.filter(entry => /\.m?js(?:\?|$)/i.test(entry.name)).reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
      lcpMs: Number.isFinite(vitals.lcp) ? Math.round(vitals.lcp) : null,
      cls: Number.isFinite(vitals.cls) ? Number(vitals.cls.toFixed(4)) : null,
      longTaskMs: Number.isFinite(vitals.longTaskMs) ? Math.round(vitals.longTaskMs) : null,
      inpMs: null,
    };
  });
}

async function mobileSnapshot(page) {
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  await delay(100);
  return page.evaluate(() => {
    const width = document.documentElement?.scrollWidth || 0;
    const viewport = window.innerWidth || 0;
    const overflowElements = [];
    for (const el of [...document.querySelectorAll('body *')].slice(0, 4000)) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && (rect.left < -3 || rect.right > viewport + 3) && getComputedStyle(el).position !== 'absolute') {
        overflowElements.push({ tag: el.tagName.toLowerCase(), id: el.id || '', className: String(el.className || '').slice(0, 70), width: Math.round(rect.width), left: Math.round(rect.left), right: Math.round(rect.right) });
        if (overflowElements.length >= 15) break;
      }
    }
    const tapTargets = [...document.querySelectorAll('button,a,input,select,textarea,[role="button"]')].slice(0, 1000);
    const smallTargets = tapTargets.filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && (rect.width < 24 || rect.height < 24);
    }).length;
    const fixedBottomAds = [...document.querySelectorAll('[id*="ad-" i],[id$="-ad" i],[id~="ad" i],[id*="advert" i],[class*="ad-" i],[class~="ad" i],[class*="advert" i],[data-ad-client],ins.adsbygoogle,iframe[src*="ads" i]')].filter(el => {
      const r = el.getBoundingClientRect(); const p = getComputedStyle(el).position;
      return ['fixed','sticky'].includes(p) && r.height > 0 && r.bottom >= innerHeight - 15;
    }).length;
    return { viewportWidth: viewport, documentWidth: width, horizontalOverflow: width > viewport + 2, overflowElements, smallTapTargets: smallTargets, fixedBottomAdCandidates: fixedBottomAds };
  });
}

function buildPageFindings(pageRecord, metrics, responseHeaders, resourceErrors) {
  const findings = [];
  const add = (params) => findings.push(makeFinding({ ...params, url: pageRecord.requestedUrl }));
  const status = pageRecord.status;
  if (status == null || status >= 400) add({ severity: status >= 500 ? 'high' : 'critical', category: 'technical', code: 'HTTP_STATUS', message: `Page returned HTTP ${status ?? 'no response'}.`, evidence: String(status ?? 'navigation failed'), recommendation: 'Check the URL, server logs, redirects, deployment status, and access configuration.', confidence: 'high', source: 'http-response' });
  if (!metrics.title) add({ severity: 'high', category: 'seo', code: 'TITLE_MISSING', message: 'The page has no document title.', recommendation: 'Add a unique, descriptive title that reflects the page content.', confidence: 'high' });
  else if (metrics.title.length < 20 || metrics.title.length > 70) add({ severity: 'low', category: 'seo', code: 'TITLE_LENGTH_REVIEW', message: `Title length is ${metrics.title.length} characters; review clarity and truncation.`, evidence: metrics.title, recommendation: 'Review the title for specificity and readable search-result presentation. Length is a guideline, not a ranking rule.', confidence: 'medium' });
  if (!metrics.description) add({ severity: 'medium', category: 'seo', code: 'META_DESCRIPTION_MISSING', message: 'No meta description was detected.', recommendation: 'Consider adding a concise, page-specific summary where useful.', confidence: 'high' });
  else if (metrics.description.length < 50 || metrics.description.length > 180) add({ severity: 'low', category: 'seo', code: 'META_DESCRIPTION_LENGTH', message: `Meta description has ${metrics.description.length} characters; review readability and truncation.`, evidence: metrics.description, recommendation: 'Review whether the description communicates the page value clearly. Length guidance is approximate.', confidence: 'medium' });
  let canonicalOk = false;
  try { canonicalOk = ['http:', 'https:'].includes(new URL(metrics.canonical).protocol); } catch {}
  if (!canonicalOk) add({ severity: 'medium', category: 'seo', code: 'CANONICAL_MISSING_OR_INVALID', message: 'A valid absolute canonical URL was not detected.', recommendation: 'Confirm whether this page needs a canonical link and ensure the target is intentional, accessible, and consistent.', confidence: 'medium' });
  if (metrics.h1Count === 0) add({ severity: 'medium', category: 'seo', code: 'H1_MISSING', message: 'No H1 heading was detected.', recommendation: 'Use a clear main heading where it improves document structure.', confidence: 'high' });
  else if (metrics.h1Count > 1) add({ severity: 'low', category: 'seo', code: 'MULTIPLE_H1', message: `${metrics.h1Count} H1 headings were detected. Review whether they represent the document structure correctly.`, recommendation: 'Use headings semantically; multiple H1s are not automatically a search-engine error.', confidence: 'medium' });
  if (!metrics.lang) add({ severity: 'medium', category: 'accessibility', code: 'HTML_LANG_MISSING', message: 'The root HTML element has no language attribute.', recommendation: 'Set an appropriate lang attribute on the html element.', confidence: 'high' });
  if (!metrics.viewport) add({ severity: 'medium', category: 'mobile', code: 'VIEWPORT_META_MISSING', message: 'No viewport meta tag was detected.', recommendation: 'Configure an appropriate viewport for responsive rendering.', confidence: 'high' });
  if (metrics.missingAlt) add({ severity: 'medium', category: 'accessibility', code: 'IMAGE_ALT_MISSING', message: `${metrics.missingAlt} of ${metrics.imageCount} images lack an alt attribute.`, evidence: `${metrics.missingAlt}/${metrics.imageCount} images`, recommendation: 'Provide meaningful alternative text for informative images and alt="" for decorative images.', confidence: 'high' });
  if (metrics.unlabeledControls) add({ severity: 'high', category: 'accessibility', code: 'FORM_LABELS_MISSING', message: `${metrics.unlabeledControls} form controls may lack a programmatic accessible name.`, recommendation: 'Associate visible labels with controls or provide a suitable accessible name.', confidence: 'medium' });
  if (metrics.unnamedLinks) add({ severity: 'medium', category: 'accessibility', code: 'LINK_NAME_MISSING', message: `${metrics.unnamedLinks} links may have no accessible name.`, recommendation: 'Give each link a descriptive text, accessible name, or suitable image alternative.', confidence: 'medium' });
  if (metrics.headingJumps) add({ severity: 'low', category: 'accessibility', code: 'HEADING_LEVEL_JUMP', message: `${metrics.headingJumps} heading-level jump(s) were detected.`, recommendation: 'Review heading hierarchy and use levels to reflect content structure.', confidence: 'medium' });
  if (metrics.tablesWithoutHeaders) add({ severity: 'low', category: 'accessibility', code: 'TABLE_HEADER_REVIEW', message: `${metrics.tablesWithoutHeaders} table(s) have no detected th element.`, recommendation: 'For data tables, add appropriate header cells and scope where needed. Layout tables may be exempt.', confidence: 'medium' });
  if (!metrics.mainCount) add({ severity: 'info', category: 'accessibility', code: 'MAIN_LANDMARK_NOT_DETECTED', message: 'No main landmark was detected.', recommendation: 'Consider a main landmark where appropriate to improve navigation for assistive technology.', confidence: 'medium' });
  if (metrics.brokenAnchors) add({ severity: 'low', category: 'technical', code: 'BROKEN_FRAGMENT_LINK', message: `${metrics.brokenAnchors} same-page fragment link(s) did not match an element ID.`, recommendation: 'Review the fragment target IDs and link hashes.', confidence: 'high' });
  if (metrics.invalidJsonLd.length) add({ severity: 'medium', category: 'schema', code: 'JSONLD_INVALID', message: `${metrics.invalidJsonLd.length} JSON-LD block(s) could not be parsed as JSON.`, evidence: metrics.invalidJsonLd.join('; '), recommendation: 'Validate JSON syntax and verify the structured data content with a trusted schema validator.', confidence: 'high' });
  if (metrics.jsonLdCount && metrics.jsonLdWithoutContext) add({ severity: 'low', category: 'schema', code: 'JSONLD_CONTEXT_REVIEW', message: `${metrics.jsonLdWithoutContext} JSON-LD top-level block(s) do not have a detected @context property.`, recommendation: 'Review each JSON-LD block against the intended vocabulary and a trusted validator.', confidence: 'medium' });
  if (metrics.jsonLdCount && !metrics.schemaTypes.length) add({ severity: 'low', category: 'schema', code: 'JSONLD_TYPE_NOT_DETECTED', message: 'JSON-LD exists, but no @type property was detected by this check.', recommendation: 'Verify the structured data type and structure; specialised vocabularies may require review by a compatible validator.', confidence: 'low' });
  if (!metrics.jsonLdCount) add({ severity: 'info', category: 'schema', code: 'JSONLD_NOT_DETECTED', message: 'No JSON-LD block was detected. Structured data is optional and not required on every page.', recommendation: 'Add structured data only when a supported type accurately describes visible page content.', confidence: 'high' });
  if (metrics.robotsMeta && /\b(noindex|none)\b/i.test(metrics.robotsMeta)) add({ severity: 'medium', category: 'seo', code: 'NOINDEX_DIRECTIVE', message: `A robots meta directive includes: ${metrics.robotsMeta}`, recommendation: 'Confirm that blocking indexing is intentional for this page.', evidence: metrics.robotsMeta, confidence: 'high' });
  if (metrics.contentSample.length < 120) add({ severity: 'low', category: 'content', code: 'LOW_VISIBLE_TEXT', message: 'The page contains very little visible text at the time of capture.', recommendation: 'Confirm that the page rendered correctly and contains the intended primary content. This check may be inappropriate for app-like or media pages.', evidence: `${metrics.contentSample.length} visible text characters`, confidence: 'low' });
  if (metrics.fontStatus === 'loading') add({ severity: 'low', category: 'fonts', code: 'FONT_LOADING_IN_PROGRESS', message: 'The document font set still reported a loading state after the configured settle delay.', recommendation: 'Check font requests, preload strategy, font-display settings and fallback behaviour. A longer settle time can change this observation.', confidence: 'low' });
  if (metrics.fontLinks.length > 10) add({ severity: 'low', category: 'fonts', code: 'MANY_FONT_RESOURCE_LINKS', message: `${metrics.fontLinks.length} font-related stylesheet/resource links were observed.`, recommendation: 'Review unnecessary font stylesheets and variants; avoid preloading every font file.', confidence: 'low' });
  if (metrics.fontFamilyCount > 7) add({ severity: 'low', category: 'fonts', code: 'MANY_FONT_FAMILIES', message: `${metrics.fontFamilyCount} font-family declarations were observed in sampled text elements.`, recommendation: 'Review whether font families can be consolidated while preserving the design.', confidence: 'low' });
  if (metrics.tinyTextCount > 0) add({ severity: 'low', category: 'fonts', code: 'SMALL_TEXT_SAMPLE', message: `${metrics.tinyTextCount} sampled text elements use font sizes under 12 CSS pixels.`, recommendation: 'Review text readability and zoom behaviour; small text may be appropriate for some metadata.', confidence: 'low' });
  if (metrics.adCount) add({ severity: 'info', category: 'ads', code: 'AD_CONTAINER_CANDIDATES', message: `${metrics.adCount} elements matched common ad-container selectors.`, evidence: JSON.stringify(metrics.adObservations.slice(0, 8)), recommendation: 'Review the candidates manually. Selector matches are heuristic and do not establish policy compliance or actual ad delivery.', confidence: 'low' });
  if (metrics.adObservations.some(ad => ad.fixedOrSticky && ad.height > 0 && ad.outsideViewport)) add({ severity: 'low', category: 'ads', code: 'FIXED_AD_LAYOUT_REVIEW', message: 'A fixed/sticky ad-like element may be positioned outside the visible viewport.', recommendation: 'Inspect mobile and desktop layouts for overlays, obstructed controls, or unexpected layout shifts.', confidence: 'low' });
  if (metrics.questionHeadingCount === 0 && metrics.textLength > 500) add({ severity: 'info', category: 'geo-aeo', code: 'ANSWER_STRUCTURE_REVIEW', message: 'No question-style headings were detected in a content-rich page.', recommendation: 'Where appropriate for the audience and intent, consider clear question-led headings and concise, self-contained answers. This is a content heuristic, not a ranking rule.', confidence: 'low' });
  if (!metrics.hasAuthorSignal && metrics.textLength > 1500) add({ severity: 'info', category: 'geo-aeo', code: 'AUTHOR_SIGNAL_NOT_DETECTED', message: 'No common author-related markup or metadata was detected.', recommendation: 'Where relevant, make authorship and editorial responsibility clear to readers.', confidence: 'low' });
  for (const resource of resourceErrors.slice(0, 100)) {
    add({ severity: resource.type === 'image' ? 'medium' : 'low', category: resource.type === 'image' ? 'images' : 'resources', code: resource.type === 'image' ? 'IMAGE_RESOURCE_FAILED' : 'RESOURCE_FAILED', message: `${resource.type} resource returned ${resource.status ?? 'a request error'}.`, evidence: resource.url, recommendation: 'Check the resource URL, response, access policy, and whether the failure is reproducible.', confidence: 'medium', source: 'browser-network' });
  }
  if (SITE.protocol === 'https:' && !responseHeaders['strict-transport-security']) add({ severity: 'low', category: 'security', code: 'HSTS_HEADER_NOT_DETECTED', message: 'Strict-Transport-Security was not detected on this response.', recommendation: 'Review whether HSTS is appropriate for the site and its subdomains before enabling it.', confidence: 'medium', source: 'http-headers' });
  if (!responseHeaders['x-content-type-options']) add({ severity: 'info', category: 'security', code: 'NOSNIFF_HEADER_NOT_DETECTED', message: 'X-Content-Type-Options was not detected.', recommendation: 'Consider nosniff where compatible with the site resource types.', confidence: 'medium', source: 'http-headers' });
  if (!responseHeaders['content-security-policy']) add({ severity: 'info', category: 'security', code: 'CSP_NOT_DETECTED', message: 'Content-Security-Policy was not detected.', recommendation: 'Review CSP as a defence-in-depth control; deploy changes carefully and test site functionality.', confidence: 'medium', source: 'http-headers' });
  if (metrics.ttfbMs != null && metrics.ttfbMs > 800) add({ severity: 'medium', category: 'performance', code: 'TTFB_BROWSER_SAMPLE_HIGH', message: `Observed navigation response-start time is ${metrics.ttfbMs} ms.`, recommendation: 'Use repeatable tests and server diagnostics to distinguish server response delays from network and browser timing. This is a browser sample, not field data.', confidence: 'low', source: 'browser-performance-api' });
  if (metrics.jsTransferBytes > 1000000) add({ severity: 'low', category: 'performance', code: 'JS_TRANSFER_SIZE_HIGH', message: `Sampled JavaScript transfer size is about ${Math.round(metrics.jsTransferBytes / 1024)} KiB where resource timing exposed sizes.`, recommendation: 'Inspect bundle analysis, code splitting, unused JavaScript and third-party scripts. Cross-origin sizes may be under-reported without timing access headers.', confidence: 'low', source: 'browser-performance-api' });
  if (metrics.lcpMs != null && metrics.lcpMs > 4000) add({ severity: 'medium', category: 'performance', code: 'LCP_LAB_HEURISTIC_HIGH', message: `Observed browser LCP candidate time is ${metrics.lcpMs} ms.`, recommendation: 'Use Lighthouse and/or field data to diagnose the actual LCP element and contributing resources. This browser sample is not field Core Web Vitals.', confidence: 'low', source: 'browser-performance-api' });
  if (metrics.cls != null && metrics.cls > 0.25) add({ severity: 'medium', category: 'performance', code: 'CLS_BROWSER_SAMPLE_HIGH', message: `Observed layout-shift score sample is ${metrics.cls}.`, recommendation: 'Inspect shift sources and reserve dimensions for images, embeds, and ad containers. This sample is not field data.', confidence: 'low', source: 'browser-performance-api' });
  if (metrics.mobile?.horizontalOverflow) add({ severity: 'medium', category: 'mobile', code: 'MOBILE_HORIZONTAL_OVERFLOW', message: `Document width (${metrics.mobile.documentWidth}px) exceeds the mobile viewport (${metrics.mobile.viewportWidth}px).`, evidence: JSON.stringify(metrics.mobile.overflowElements.slice(0, 5)), recommendation: 'Inspect the listed elements and responsive CSS. Avoid globally hiding overflow without finding the root cause.', confidence: 'medium', source: 'mobile-viewport' });
  if (metrics.mobile?.smallTapTargets) add({ severity: 'low', category: 'mobile', code: 'SMALL_TOUCH_TARGETS', message: `${metrics.mobile.smallTapTargets} sampled interactive elements are below 24 by 24 CSS pixels.`, recommendation: 'Review target size and spacing against applicable accessibility guidance and intended interaction.', confidence: 'low', source: 'mobile-viewport' });
  if (metrics.mobile?.fixedBottomAdCandidates) add({ severity: 'info', category: 'ads', code: 'MOBILE_FIXED_AD_CANDIDATE', message: `${metrics.mobile.fixedBottomAdCandidates} ad-like element(s) may be fixed near the mobile viewport bottom.`, recommendation: 'Manually verify that ads or banners do not obscure content, controls, or consent choices.', confidence: 'low', source: 'mobile-viewport' });
  return deduplicateFindings(findings);
}

async function auditOne(browser, requestedUrl, index, total) {
  if (!await waitForRunPermission()) return null;
  let lastError = null;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    let page;
    const resourceErrors = [];
    let responseHeaders = {};
    let status = null;
    try {
      page = await createPage(browser);
      const consoleErrors = [];
      const runtimeErrors = [];
      page.on('console', message => { if (message.type() === 'error') consoleErrors.push(redactSensitiveText(message.text())); });
      page.on('pageerror', error => runtimeErrors.push(redactSensitiveText(error?.message || error)));
      page.on('requestfailed', request => {
        const type = request.resourceType();
        if (['image','stylesheet','script','font','media'].includes(type)) resourceErrors.push({ url: redactSensitiveText(request.url()), status: null, type, reason: redactSensitiveText(request.failure()?.errorText || 'request failed') });
      });
      page.on('response', response => {
        try {
          const request = response.request();
          const type = request.resourceType();
          if (response.status() >= 400 && ['image','stylesheet','script','font','media','document'].includes(type)) {
            resourceErrors.push({ url: response.url(), status: response.status(), type });
          }
          if (type === 'document' && response.url() === requestedUrl) responseHeaders = response.headers();
        } catch {}
      });
      const navigationResponse = await navigatePage(page, requestedUrl, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS });
      status = navigationResponse?.status() ?? null;
      responseHeaders = navigationResponse?.headers?.() || responseHeaders;
      await delay(SETTLE_MS);
      const currentUrl = page.url();
      if (!withinScope(currentUrl)) throw new Error('Cross-origin final navigation was blocked or disallowed.');
      const metrics = await readBrowserMetrics(page);
      const mobile = await mobileSnapshot(page);
      metrics.mobile = mobile;
      const title = metrics.title;
      const pageRecord = { requestedUrl, finalUrl: currentUrl, status, title, metrics: { ...metrics, contentSample: undefined, internalLinks: undefined, externalLinks: undefined }, internalLinks: metrics.internalLinks, externalLinks: metrics.externalLinks, issues: [] };
      const issues = buildPageFindings(pageRecord, metrics, responseHeaders, resourceErrors);
      for (const message of consoleErrors.slice(0, 10)) issues.push(makeFinding({ severity: 'low', category: 'technical', code: 'BROWSER_CONSOLE_ERROR', message, url: requestedUrl, evidence: message, recommendation: 'Reproduce the console error and check whether it affects page behaviour or loading. Some third-party errors may be benign.', confidence: 'low', source: 'browser-console' }));
      for (const message of runtimeErrors.slice(0, 10)) issues.push(makeFinding({ severity: 'high', category: 'technical', code: 'BROWSER_RUNTIME_ERROR', message, url: requestedUrl, evidence: message, recommendation: 'Inspect the client-side exception and verify the affected interaction, state, and browser support.', confidence: 'medium', source: 'browser-runtime' }));
      const allForPage = deduplicateFindings([...issues]);
      const scores = {
        seo: scoreFromFindings(issues, 'seo'),
        accessibility: scoreFromFindings(issues, 'accessibility'),
        performance: scoreFromFindings(issues, 'performance'),
        security: scoreFromFindings(issues, 'security'),
        mobile: scoreFromFindings(issues, 'mobile'),
        content: scoreFromFindings(issues, 'content'),
      };
      scores.overall = score(scores.seo * 0.28 + scores.accessibility * 0.2 + scores.performance * 0.18 + scores.security * 0.12 + scores.mobile * 0.12 + scores.content * 0.1);
      console.log(`[${index + 1}/${total || '?'}] ${status ?? 'OK'} ${new URL(requestedUrl).pathname} · ${allForPage.length} findings`);
      return { ...pageRecord, status, redirected: currentUrl !== requestedUrl, title, description: metrics.description, canonical: metrics.canonical, scores, issues: allForPage, resourceErrors, consoleErrors: consoleErrors.slice(0, 50), runtimeErrors: runtimeErrors.slice(0, 50), lighthouse: { status: 'not-run' }, contentHash: metrics.contentTruncated ? '' : hashText(metrics.contentSample), contentLength: metrics.textLength };
    } catch (error) {
      lastError = error;
      if (attempt < RETRIES && !cancelRequested) { console.warn(`Retry ${attempt + 1}/${RETRIES} for ${requestedUrl}: ${error.message}`); await delay(300 * (attempt + 1)); }
      if (cancelRequested) return null;
    } finally {
      if (page) { ACTIVE_PAGES.delete(page); await page.close().catch(() => {}); }
    }
  }
  const issue = makeFinding({ severity: 'critical', category: 'technical', code: 'NAVIGATION_FAILED', message: lastError?.message || 'Navigation failed.', url: requestedUrl, recommendation: 'Check URL accessibility, TLS/redirect configuration, browser compatibility, scope restrictions, and server logs.', confidence: 'high', source: 'crawler' });
  console.log(`[${index + 1}/${total || '?'}] ERR ${new URL(requestedUrl).pathname} · navigation failed`);
  return { requestedUrl, finalUrl: null, status: null, error: lastError?.message || 'Navigation failed.', title: '', description: '', canonical: '', scores: { seo: 0, accessibility: 0, performance: 0, security: 0, mobile: 0, content: 0, overall: 0 }, metrics: {}, internalLinks: [], externalLinks: [], issues: [issue], resourceErrors: [], consoleErrors: [], runtimeErrors: [], lighthouse: { status: 'not-run' }, contentHash: '', contentLength: 0 };
}

async function discoverByLinks(browser, seedUrls = [`${SITE_URL}/`]) {
  const queue = seedUrls.map(url => ({ url, depth: 0 }));
  const queued = new Set(queue.map(x => x.url));
  const visited = new Set();
  while (queue.length && !requestStopIfResourceLimit()) {
    if (!await waitForRunPermission()) break;
    if (MAX_PAGES > 0 && visited.size >= MAX_PAGES) break;
    const { url, depth } = queue.shift();
    if (!isRobotsAllowed(url)) continue;
    if (visited.has(url)) continue;
    visited.add(url);
    if (depth >= CRAWL_DEPTH) continue;
    const page = await createPage(browser);
    try {
      await navigatePage(page, url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS });
      await delay(Math.min(SETTLE_MS, 200));
      const links = await page.$$eval('a[href]', anchors => anchors.map(anchor => anchor.href));
      for (const href of links) {
        const normalized = routeUrl(href);
        if (!normalized || !isRobotsAllowed(normalized) || isExcludedByUserRules(normalized) || visited.has(normalized) || queued.has(normalized)) continue;
        if (MAX_PAGES > 0 && visited.size + queue.length >= MAX_PAGES) break;
        queued.add(normalized);
        queue.push({ url: normalized, depth: depth + 1 });
      }
    } catch (error) {
      console.warn(`Discovery could not open ${url}: ${error.message}`);
    } finally { ACTIVE_PAGES.delete(page); await page.close().catch(() => {}); }
  }
  return [...visited];
}

async function readRoutesFile() {
  if (!ROUTES_FILE) throw new Error('AUDIT_DISCOVERY=routes requires AUDIT_ROUTES_FILE.');
  const routeFile = path.resolve(ROUTES_FILE);
  const raw = await fs.readFile(routeFile, 'utf8');
  const routes = [...new Set(raw.split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('#')).map(line => routeUrl(line)).filter(Boolean))];
  return MAX_PAGES > 0 ? routes.slice(0, MAX_PAGES) : routes;
}

async function getRoutes(browser) {
  if (!ROBOTS_META) ROBOTS_META = await getRobotsAndSitemapSeeds();
  if (DISCOVERY === 'routes') return { routes: await readRoutesFile(), meta: { ...ROBOTS_META, message: `Explicit URL list: ${path.resolve(ROUTES_FILE)}` } };
  if (DISCOVERY === 'crawl') return { routes: await discoverByLinks(browser), meta: { ...ROBOTS_META, message: `Internal-link discovery; depth ${CRAWL_DEPTH}.` } };
  if (!['auto','sitemap'].includes(DISCOVERY)) throw new Error(`Unknown AUDIT_DISCOVERY=${DISCOVERY}. Use auto, sitemap, crawl, or routes.`);
  const sitemap = await discoverSitemap();
  if (DISCOVERY === 'sitemap') {
    if (!sitemap.pages.length) throw new Error('Sitemap mode requested, but no usable sitemap routes were found.');
    return { routes: MAX_PAGES > 0 ? sitemap.pages.slice(0, MAX_PAGES) : sitemap.pages, meta: { ...sitemap.meta, message: `Sitemap discovery found ${sitemap.pages.length} page URLs.` } };
  }
  const seeded = new Set(sitemap.pages);
  const linkRoutes = await discoverByLinks(browser, [`${SITE_URL}/`]);
  for (const url of linkRoutes) seeded.add(url);
  const routes = [...seeded];
  const capped = MAX_PAGES > 0 ? routes.slice(0, MAX_PAGES) : routes;
  return { routes: capped, meta: { ...sitemap.meta, message: `Combined sitemap and internal-link discovery found ${routes.length} unique routes.` } };
}

async function runPool(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function work() {
    while (true) {
      if (cancelRequested) return;
      if (!await waitForRunPermission()) return;
      const index = cursor++;
      if (index >= items.length) return;
      try { results[index] = await worker(items[index], index, items.length); }
      catch (error) {
        results[index] = { requestedUrl: items[index], finalUrl: null, status: null, error: error.message, scores: {}, issues: [makeFinding({ severity: 'high', category: 'technical', code: 'AUDIT_WORKER_ERROR', message: error.message, url: items[index], recommendation: 'Inspect the worker log and retry the affected route.' })] };
      }
      if (requestStopIfResourceLimit()) return;
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => work()));
  return results.filter(Boolean);
}


async function checkExternalLinks(pages) {
  if (!CHECK_EXTERNAL_LINKS) return { status: 'disabled', checked: 0, message: 'External link checking is optional. Set AUDIT_CHECK_EXTERNAL_LINKS=true to enable bounded checks.' };
  const owners = new Map();
  let uniqueExternalSeen = 0;
  for (const page of pages) {
    for (const link of page.externalLinks || []) {
      let url;
      try { url = new URL(link.url); } catch { continue; }
      if (!['http:', 'https:'].includes(url.protocol)) continue;
      if (!owners.has(url.href)) {
        uniqueExternalSeen++;
        if (owners.size >= MAX_EXTERNAL_LINKS) continue;
        owners.set(url.href, []);
      }
      owners.get(url.href).push({ page, link });
    }
  }
  const urls = [...owners.keys()];
  const results = new Map();
  let cursor = 0;
  async function checkOne(urlString) {
    let current = urlString;
    const checkedChain = [];
    try {
      for (let hop = 0; hop <= 4; hop++) {
        const url = new URL(current);
        if (!['http:', 'https:'].includes(url.protocol) || !(await hostIsPublic(url.hostname))) {
          return { ok: false, status: null, error: 'Blocked: destination is not a verified public HTTP(S) address.', finalUrl: current, chain: checkedChain };
        }
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), Math.min(TIMEOUT_MS, 10000));
        let response;
        try {
          response = await fetch(current, { method: 'HEAD', redirect: 'manual', signal: controller.signal, headers: { 'user-agent': USER_AGENT } });
          if ([405, 501].includes(response.status)) {
            await response.body?.cancel().catch(() => {});
            response = await fetch(current, { method: 'GET', redirect: 'manual', signal: controller.signal, headers: { 'user-agent': USER_AGENT, range: 'bytes=0-0' } });
          }
        } finally { clearTimeout(timer); }
        checkedChain.push({ url: current, status: response.status });
        if ([301,302,303,307,308].includes(response.status)) {
          const location = response.headers.get('location');
          await response.body?.cancel().catch(() => {});
          if (!location) return { ok: false, status: response.status, error: 'Redirect response has no Location header.', finalUrl: current, chain: checkedChain };
          current = new URL(location, current).href;
          continue;
        }
        await response.body?.cancel().catch(() => {});
        return { ok: response.status >= 200 && response.status < 400, status: response.status, finalUrl: current, chain: checkedChain };
      }
      return { ok: false, status: null, error: 'Redirect limit exceeded.', finalUrl: current, chain: checkedChain };
    } catch (error) {
      return { ok: false, status: null, error: error.name === 'AbortError' ? 'Timed out.' : error.message, finalUrl: current, chain: checkedChain };
    }
  }
  async function worker() {
    while (cursor < urls.length && !cancelRequested) {
      const index = cursor++;
      results.set(urls[index], await checkOne(urls[index]));
      await delay(120);
    }
  }
  await Promise.all(Array.from({ length: Math.min(2, urls.length) }, () => worker()));
  for (const [url, result] of results) {
    if (result.ok) continue;
    for (const owner of owners.get(url) || []) {
      owner.page.issues.push(makeFinding({
        severity: result.status && result.status >= 400 && result.status < 500 ? 'low' : 'medium',
        category: 'links', code: 'BROKEN_EXTERNAL_LINK',
        message: `External link check failed${result.status ? ` with HTTP ${result.status}` : ''}${result.error ? `: ${result.error}` : '.'}`,
        url: owner.page.requestedUrl, evidence: `${url} → ${result.finalUrl}`,
        recommendation: 'Recheck the destination in a browser. Some sites block automated checks or require a different HTTP method, so confirm before changing the link.',
        confidence: result.status ? 'medium' : 'low', source: 'controlled-external-link-check',
      }));
    }
  }
  return { status: cancelRequested ? 'cancelled' : 'completed', checked: results.size, discovered: uniqueExternalSeen, limit: MAX_EXTERNAL_LINKS, truncated: uniqueExternalSeen > MAX_EXTERNAL_LINKS, message: `Checked ${results.size} unique public external URL(s); automated responses may be blocked by some sites.` };
}

function categoriesForProfile() {
  const all = ['seo','accessibility','technical','schema','links','images','resources','performance','security','mobile','content','fonts','ads','geo-aeo'];
  const map = {
    professional: all,
    full: all,
    quick: ['seo','accessibility','technical','links','images','mobile'],
    seo: ['seo','schema','links','content','geo-aeo'],
    performance: ['performance','mobile','fonts','ads','resources'],
    accessibility: ['accessibility','mobile'],
    security: ['security','technical'],
    'geo-aeo': ['geo-aeo','content','schema','seo'],
    'ads-fonts': ['ads','fonts','performance','mobile'],
    custom: CUSTOM_PROFILE_CATEGORIES.length ? CUSTOM_PROFILE_CATEGORIES : all,
  };
  if (!map[PROFILE]) throw new Error(`Unknown AUDIT_PROFILE=${PROFILE}. Supported: ${Object.keys(map).join(', ')}.`);
  return new Set(map[PROFILE]);
}

function applyProfileAndRescore(pages) {
  const allowed = categoriesForProfile();
  const scoreDefs = [
    ['seo', 0.28], ['accessibility', 0.20], ['performance', 0.18],
    ['security', 0.12], ['mobile', 0.12], ['content', 0.10],
  ];
  for (const page of pages) {
    page.issues = deduplicateFindings((page.issues || []).filter(issue => allowed.has(issue.category) || issue.category === 'technical'));
    const scores = {};
    let weighted = 0;
    let totalWeight = 0;
    for (const [category, weight] of scoreDefs) {
      if (!allowed.has(category)) { scores[category] = null; continue; }
      scores[category] = scoreFromFindings(page.issues, category);
      weighted += scores[category] * weight;
      totalWeight += weight;
    }
    scores.overall = totalWeight ? score(weighted / totalWeight) : null;
    page.scores = scores;
  }
  return [...allowed];
}

function buildSiteWideFindings(discoveryMeta) {
  const findings = [];
  const robots = discoveryMeta?.robotsTxt;
  if (robots?.error) {
    const isNotFound = /\bHTTP 404\b/i.test(robots.error);
    findings.push(makeFinding({
      severity: isNotFound ? 'info' : 'low', category: 'technical',
      code: isNotFound ? 'ROBOTS_TXT_NOT_FOUND' : 'ROBOTS_TXT_UNAVAILABLE',
      message: isNotFound ? 'robots.txt returned HTTP 404. This is not automatically an error; verify the intended crawl policy.' : `robots.txt could not be read: ${robots.error}`,
      url: `${SITE_URL}/robots.txt`, evidence: robots.error,
      recommendation: 'Check robots.txt availability and directives if the site relies on them for crawler guidance.',
      confidence: 'medium', source: 'robots-discovery',
    }));
  }
  for (const error of discoveryMeta?.sitemapErrors || []) findings.push(makeFinding({
    severity: 'low', category: 'technical', code: 'SITEMAP_UNREADABLE',
    message: `A sitemap source could not be read: ${error.message}`,
    url: error.url || SITE_URL, evidence: error.message,
    recommendation: 'Verify sitemap URL, response status, XML validity, redirects, and whether access is intentionally restricted.',
    confidence: 'medium', source: 'sitemap-discovery',
  }));
  if (Object.hasOwn(discoveryMeta || {}, 'sitemapUrlsFound') && Number(discoveryMeta?.sitemapUrlsFound || 0) === 0) findings.push(makeFinding({
    severity: 'info', category: 'technical', code: 'SITEMAP_URLS_NOT_DISCOVERED',
    message: 'No page URLs were discovered from sitemap files. This does not prove the site lacks a sitemap; route discovery may have used internal links or an explicit URL list.',
    url: SITE_URL, evidence: `${discoveryMeta?.readableSitemaps || 0} readable sitemap(s)`,
    recommendation: 'Verify the sitemap location and check that page URLs return appropriate status codes and canonical targets.',
    confidence: 'medium', source: 'sitemap-discovery',
  }));
  return findings;
}

function addCrossPageFindings(pages) {
  const byUrl = new Map();
  const titles = new Map();
  const descriptions = new Map();
  const canonicals = new Map();
  const contentHashes = new Map();
  for (const page of pages) {
    const requested = routeUrl(page.requestedUrl);
    if (requested) byUrl.set(requested, page);
    if (page.title) { const key = normaliseText(page.title); if (!titles.has(key)) titles.set(key, []); titles.get(key).push(page); }
    if (page.description) { const key = normaliseText(page.description); if (!descriptions.has(key)) descriptions.set(key, []); descriptions.get(key).push(page); }
    if (page.canonical) { try { const canonicalKey = new URL(page.canonical).href; if (!canonicals.has(canonicalKey)) canonicals.set(canonicalKey, []); canonicals.get(canonicalKey).push(page); } catch {} }
    if (page.contentHash && page.contentLength > 300) { if (!contentHashes.has(page.contentHash)) contentHashes.set(page.contentHash, []); contentHashes.get(page.contentHash).push(page); }
  }
  for (const [key, group] of titles) if (group.length > 1) for (const page of group) page.issues.push(makeFinding({ severity: 'medium', category: 'seo', code: 'DUPLICATE_TITLE', message: `The title is duplicated across ${group.length} audited pages.`, url: page.requestedUrl, evidence: key, recommendation: 'Review whether each page needs a distinct title that reflects its unique purpose.', confidence: 'high', source: 'cross-page-comparison' }));
  for (const [key, group] of descriptions) if (group.length > 1) for (const page of group) page.issues.push(makeFinding({ severity: 'low', category: 'seo', code: 'DUPLICATE_DESCRIPTION', message: `The meta description is duplicated across ${group.length} audited pages.`, url: page.requestedUrl, evidence: key, recommendation: 'Review whether page-specific descriptions would better summarise each page.', confidence: 'high', source: 'cross-page-comparison' }));
  for (const [canonical, group] of canonicals) if (group.length > 1 && group.some(page => page.requestedUrl !== canonical)) for (const page of group) page.issues.push(makeFinding({ severity: 'low', category: 'seo', code: 'DUPLICATE_CANONICAL_TARGET', message: `Multiple audited pages point to the same canonical target (${group.length} pages).`, url: page.requestedUrl, evidence: canonical, recommendation: 'Verify that these pages are intentionally consolidated to the same canonical URL and that the target is correct.', confidence: 'medium', source: 'cross-page-comparison' }));
  for (const [hash, group] of contentHashes) if (group.length > 1) for (const page of group) page.issues.push(makeFinding({ severity: 'medium', category: 'content', code: 'EXACT_DUPLICATE_CONTENT', message: `Normalised visible text exactly matches ${group.length} audited pages.`, url: page.requestedUrl, evidence: `SHA-256 ${hash.slice(0, 16)}…; ${group.map(p => p.requestedUrl).join(' | ').slice(0, 350)}`, recommendation: 'Check canonicalisation, duplicated route content, query parameters, and intended language or regional variants before changing content.', confidence: 'high', source: 'cross-page-comparison' }));
  for (const sourcePage of pages) {
    for (const link of sourcePage.internalLinks || []) {
      const targetUrl = routeUrl(link.url);
      const target = targetUrl ? byUrl.get(targetUrl) : null;
      if (target && target.status != null && target.status >= 400) sourcePage.issues.push(makeFinding({ severity: 'medium', category: 'links', code: 'BROKEN_INTERNAL_LINK', message: `Internal link target returned HTTP ${target.status}.`, url: sourcePage.requestedUrl, evidence: `${link.url} (HTTP ${target.status})`, recommendation: 'Correct the link, restore the target, or redirect to the intended destination.', confidence: 'high', source: 'cross-page-link-check' }));
    }
    sourcePage.issues = deduplicateFindings(sourcePage.issues);
    const s = sourcePage.scores || {};
    s.seo = scoreFromFindings(sourcePage.issues, 'seo');
    s.accessibility = scoreFromFindings(sourcePage.issues, 'accessibility');
    s.performance = scoreFromFindings(sourcePage.issues, 'performance');
    s.security = scoreFromFindings(sourcePage.issues, 'security');
    s.mobile = scoreFromFindings(sourcePage.issues, 'mobile');
    s.content = scoreFromFindings(sourcePage.issues, 'content');
    s.overall = score(s.seo * 0.28 + s.accessibility * 0.2 + s.performance * 0.18 + s.security * 0.12 + s.mobile * 0.12 + s.content * 0.1);
  }
}

async function runLighthouse(browser, pages) {
  if (!RUN_LIGHTHOUSE) return { status: 'disabled', message: 'Set AUDIT_LIGHTHOUSE=true to run optional Lighthouse checks.' };
  let lighthouse;
  try { ({ default: lighthouse } = await import('lighthouse')); }
  catch { return { status: 'unavailable', message: 'Lighthouse package is not installed. Run npm install -D lighthouse in the tool/project workspace.' }; }
  const port = Number(new URL(browser.wsEndpoint()).port);
  const selected = pages.filter(p => p.status != null && p.status >= 200 && p.status < 400).slice(0, LIGHTHOUSE_MAX_PAGES);
  for (let i = 0; i < selected.length; i++) {
    const page = selected[i];
    if (cancelRequested) break;
    if (!await waitForRunPermission()) break;
    try {
      console.log(`🔦 Lighthouse ${i + 1}/${selected.length}: ${page.requestedUrl}`);
      const result = await lighthouse(page.requestedUrl, {
        port, output: 'json', logLevel: 'error', onlyCategories: ['performance','accessibility','seo','best-practices'],
        formFactor: 'mobile', throttlingMethod: 'simulate', disableStorageReset: true,
      });
      const lhr = result?.lhr;
      page.lighthouse = {
        status: lhr ? 'completed' : 'failed',
        scores: Object.fromEntries(['performance','accessibility','seo','best-practices'].map(key => [key, lhr?.categories?.[key]?.score == null ? null : Math.round(lhr.categories[key].score * 100)])),
        metrics: Object.fromEntries(['largest-contentful-paint','cumulative-layout-shift','interaction-to-next-paint','first-contentful-paint','total-blocking-time','speed-index'].map(key => [key, { value: lhr?.audits?.[key]?.numericValue ?? null, displayValue: lhr?.audits?.[key]?.displayValue ?? null, score: lhr?.audits?.[key]?.score ?? null }])),
        testedAt: new Date().toISOString(),
        note: 'Lighthouse lab data; not equivalent to real-user field data.',
      };
      for (const key of ['performance','accessibility','seo','best-practices']) {
        const val = page.lighthouse.scores[key];
        if (val != null && val < 50) page.issues.push(makeFinding({ severity: val < 30 ? 'high' : 'medium', category: key === 'best-practices' ? 'security' : key, code: `LIGHTHOUSE_${key.toUpperCase().replaceAll('-', '_')}`, message: `Lighthouse ${key} score is ${val}/100.`, url: page.requestedUrl, evidence: `Lighthouse lab score: ${val}/100`, recommendation: 'Open the Lighthouse details and review failing audits and diagnostics before selecting fixes.', confidence: 'high', source: 'lighthouse' }));
      }
    } catch (error) {
      page.lighthouse = { status: 'failed', message: error.message };
      console.warn(`Lighthouse failed for ${page.requestedUrl}: ${error.message}`);
    }
  }
  return { status: 'completed', message: `Lighthouse attempted on ${selected.length} page(s), with a configured maximum of ${LIGHTHOUSE_MAX_PAGES}.` };
}

async function main() {
  if (!ALLOW_PRIVATE_TARGET && (isLocalHostname(SITE.hostname) || !await hostIsPublic(SITE.hostname))) {
    throw new Error('SITE_URL resolves to a private/local address. For your own development website only, set AUDIT_ALLOW_PRIVATE_NETWORK=true. The crawler will still block off-origin private-network requests.');
  }
  console.log(`\n🚀 Omega Site Audit Pro Universal v${VERSION}`);
  console.log(`🌐 Target: ${SITE_URL}`);
  console.log(`⚙️ Discovery: ${DISCOVERY} | Concurrency: ${CONCURRENCY} | Timeout: ${TIMEOUT_MS}ms | Page cap: ${MAX_PAGES === 0 ? 'none (resource safeguards remain active)' : MAX_PAGES}`);
  console.log(`🧰 Safeguards: ${MAX_DURATION_MINUTES}min duration, ${MAX_HEAP_MB}MB Node heap, ${MAX_SITEMAPS} sitemap ceiling, private network ${ALLOW_PRIVATE_TARGET ? 'explicitly enabled' : 'blocked'}`);
  if (AUTH_HEADERS_FILE) {
    const authPath = path.resolve(AUTH_HEADERS_FILE);
    const headers = JSON.parse(await fs.readFile(authPath, 'utf8'));
    if (!headers || typeof headers !== 'object' || Array.isArray(headers)) throw new Error('AUDIT_AUTH_HEADERS_FILE must contain a JSON object of header names to string values.');
    const forbidden = new Set(['host', 'content-length', 'connection', 'upgrade']);
    SITE_AUTH_HEADERS = Object.fromEntries(Object.entries(headers).filter(([key, value]) => {
      if (typeof value !== 'string' || forbidden.has(key.toLowerCase()) || /[\r\n]/.test(key + value)) throw new Error(`Invalid or forbidden authentication header: ${key}`);
      return true;
    }));
    console.warn('⚠️ Auth headers loaded for the target origin only. Ensure the file is private; header values will not be added to reports.');
  }
  attachInteractiveControls();
  const browserArgs = ['--disable-dev-shm-usage', ...(CHROME_NO_SANDBOX ? ['--no-sandbox', '--disable-setuid-sandbox'] : [])];
  const browser = await puppeteer.launch({ headless: true, args: browserArgs, ...(CHROME_PATH ? { executablePath: CHROME_PATH } : {}) });
  let report;
  try {
    const { routes: discoveredRoutes, meta } = await getRoutes(browser);
    const routes = filterRoutesByRules(discoveredRoutes);
    if (!routes.length) throw new Error('No routes remain after discovery and URL include/exclude filters. Check SITE_URL, sitemap, route list, and filter rules.');
    console.log(`\n📋 Discovered ${discoveredRoutes.length} route(s); ${routes.length} remain after include/exclude filters.`);
    const pages = await runPool(routes, CONCURRENCY, (url, index, total) => auditOne(browser, url, index, total));
    addCrossPageFindings(pages);
    const externalLinkSummary = await checkExternalLinks(pages);
    const lighthouseSummary = await runLighthouse(browser, pages);
    const enabledCategories = applyProfileAndRescore(pages);
    const gsc = GSC_TOKEN && GSC_START_DATE && GSC_END_DATE
      ? await fetchGscSearchAnalytics({ siteUrl: GSC_PROPERTY, accessToken: GSC_TOKEN, startDate: GSC_START_DATE, endDate: GSC_END_DATE })
      : { connected: false, status: 'not-configured', message: 'Optional GSC integration is not configured. Set GSC_ACCESS_TOKEN, GSC_SITE_URL, GSC_START_DATE, and GSC_END_DATE to make a read-only Search Analytics query.' };
    const successfullyNavigated = pages.filter(p => p.status != null && p.status >= 200 && p.status < 400);
    const scoredPages = successfullyNavigated.filter(p => Number.isFinite(p.scores?.overall));
    const avg = scoredPages.length ? score(scoredPages.reduce((sum, p) => sum + p.scores.overall, 0) / scoredPages.length) : null;
    const findings = pages.flatMap(p => p.issues || []);
    const siteIssues = buildSiteWideFindings(meta);
    const allFindings = [...siteIssues, ...findings];
    const severityCounts = Object.fromEntries(['critical','high','medium','low','info'].map(severity => [severity, allFindings.filter(f => f.severity === severity).length]));
    const config = {
      discovery: DISCOVERY, concurrency: CONCURRENCY, timeoutMs: TIMEOUT_MS, retries: RETRIES,
      maxPages: MAX_PAGES === 0 ? null : MAX_PAGES, crawlDepth: CRAWL_DEPTH, maxSitemaps: MAX_SITEMAPS, maxSitemapBytes: MAX_SITEMAP_BYTES,
      maxDurationMinutes: MAX_DURATION_MINUTES, maxHeapMb: MAX_HEAP_MB, keepQuery: KEEP_QUERY,
      includePaths: INCLUDE_PATHS, excludePaths: EXCLUDE_PATHS, authHeadersConfigured: Object.keys(SITE_AUTH_HEADERS).length > 0, requestDelayMs: REQUEST_DELAY_MS,
      externalLinkCheckEnabled: CHECK_EXTERNAL_LINKS, lighthouseEnabled: RUN_LIGHTHOUSE,
      privateNetworkEnabled: ALLOW_PRIVATE_TARGET, respectRobots: RESPECT_ROBOTS, profile: PROFILE, compareWithConfigured: Boolean(COMPARE_WITH),
      customBrowserConfigured: Boolean(CHROME_PATH), noSandboxConfigured: CHROME_NO_SANDBOX,
    };
    report = {
      tool: 'Omega Site Audit Pro Universal', version: VERSION, timestamp: new Date().toISOString(), siteUrl: SITE_URL,
      configuration: { ...config, profile: PROFILE, profileCategories: enabledCategories }, discovery: { ...meta, routeCount: routes.length }, siteIssues,
      integrations: { lighthouse: lighthouseSummary, externalLinkCheck: externalLinkSummary, gsc },
      summary: {
        totalPagesDiscovered: routes.length, totalPagesAudited: pages.length,
        successfulNavigations: successfullyNavigated.length,
        failedPages: pages.length - successfullyNavigated.length,
        siteHealthScore: avg,
        totalIssues: allFindings.length,
        severityCounts,
        cancelled: cancelRequested,
        stopReason: cancelledReason || undefined,
        durationSeconds: Math.round((Date.now() - STARTED_AT) / 1000),
        heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      }, pages: pages.map(p => ({
        ...p,
        metrics: p.metrics ? { ...p.metrics, internalLinks: undefined, externalLinks: undefined } : {},
        internalLinks: p.internalLinks || [], externalLinks: p.externalLinks || [],
      })),
      limitations: [
        'Scores are heuristic summaries, not ranking predictions or certification.',
        'LCP/CLS browser samples are not field Core Web Vitals. INP requires real interaction or field data and may be unavailable.',
        'GEO/AEO signals are content-readiness heuristics, not access to private answer-engine ranking systems.',
        'Automated accessibility checks do not establish complete WCAG conformance.',
        'GSC data is included only when a valid authorised access token and site property are configured.',
        'No website files are modified. Remediation is not automatically applied by this CLI.',
      ],
    };
    if (COMPARE_WITH) {
      try {
        const previous = JSON.parse(await fs.readFile(path.resolve(COMPARE_WITH), 'utf8'));
        if (!previous || !Array.isArray(previous.pages)) throw new Error('The comparison file is not a valid Omega report with pages[].');
        report.comparison = { status: 'completed', previousReport: path.basename(COMPARE_WITH), ...compareReports(previous, report) };
      } catch (error) {
        report.comparison = { status: 'failed', previousReport: path.basename(COMPARE_WITH), message: error.message };
      }
    } else {
      report.comparison = { status: 'not-configured', message: 'Set AUDIT_COMPARE_WITH to compare against a previous report JSON file.' };
    }
    const files = await writeReports(report, { outputDir: OUTPUT_DIR, browser, branding: process.env.AUDIT_BRAND || 'NumanX / Omega Site Audit Pro' });
    console.log('\n✅ Audit run finished.');
    console.log(`JSON: ${files.json}\nCSV:  ${files.csv}\nHTML: ${files.html}\nPDF:  ${files.pdf || `not generated${files.pdfError ? ` (${files.pdfError})` : ''}`}\nHistory: ${files.history}`);
    console.log(`Summary: ${pages.length} page(s), ${findings.length} findings, ${report.summary.failedPages} failed page(s), site health ${avg}/100 (heuristic).`);
    if (cancelRequested) process.exitCode = 2;
    else if (report.summary.failedPages > 0) process.exitCode = 1;
  } finally {
    uiInput?.close();
    await browser.close().catch(() => {});
  }
}

process.on('SIGINT', () => requestCancel('Interrupted with Ctrl+C; stopping safely and saving current results where possible.'));
process.on('SIGTERM', () => requestCancel('Received termination signal; stopping safely.'));
main().catch(error => {
  console.error(`\n❌ Omega Site Audit Pro failed: ${error.stack || error.message || error}`);
  uiInput?.close();
  process.exitCode = 1;
});
