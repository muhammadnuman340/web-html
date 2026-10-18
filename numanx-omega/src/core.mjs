import crypto from 'node:crypto';

const SKIP_EXTENSION = /\.(?:7z|avif|bmp|css|csv|docx?|eot|gif|gz|ico|jpe?g|js|json|map|m4a|m4v|mov|mp3|mp4|pdf|png|pptx?|rar|rss|svg|tar|tif?f|ttf|txt|wav|webm|webp|woff2?|xlsx?|xml|zip)$/i;

export function normalizePageUrl(value, baseUrl, { keepQuery = false } = {}) {
  try {
    const url = new URL(value, baseUrl);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    if (url.origin !== new URL(baseUrl).origin) return null;
    if (SKIP_EXTENSION.test(url.pathname) && !/\.html?$/i.test(url.pathname)) return null;
    url.hash = '';
    if (!keepQuery) url.search = '';
    else {
      const params = new URLSearchParams(url.search);
      for (const key of [...params.keys()]) if (/^(utm_|fbclid$|gclid$|ref$)/i.test(key)) params.delete(key);
      params.sort();
      url.search = params.toString() ? `?${params}` : '';
    }
    if (!url.pathname) url.pathname = '/';
    return url.href;
  } catch {
    return null;
  }
}

export function extractXmlLocs(xml = '') {
  return [...xml.matchAll(/<loc\b[^>]*>\s*([\s\S]*?)\s*<\/loc>/gi)]
    .map(match => match[1].trim()
      .replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>')
      .replaceAll('&quot;', '"').replaceAll('&apos;', "'"))
    .filter(Boolean);
}

export function parseRobotsTxt(text = '') {
  const sitemaps = [];
  const rules = [];
  let agents = [];
  let groupHasRules = false;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, '').trim();
    if (!line) continue;
    const colon = line.indexOf(':');
    if (colon < 0) continue;
    const key = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    if (key === 'user-agent' && value) {
      if (groupHasRules) { agents = []; groupHasRules = false; }
      agents.push(value.toLowerCase());
      continue;
    }
    if (key === 'sitemap' && value) { sitemaps.push(value); continue; }
    if (['allow', 'disallow', 'crawl-delay'].includes(key) && agents.length) {
      rules.push({ agents: [...agents], directive: key, value });
      groupHasRules = true;
    }
  }
  return { sitemaps: [...new Set(sitemaps)], rules };
}

export function severityPriority(severity) {
  return ({ critical: 1, high: 2, medium: 3, low: 4, info: 5 })[String(severity).toLowerCase()] ?? 9;
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

export function normaliseText(value = '') {
  return String(value).normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
}

export function hashText(value = '') {
  return crypto.createHash('sha256').update(normaliseText(value)).digest('hex');
}

export function findingKey(finding) {
  return `${finding.code}|${finding.url || ''}|${finding.evidence || ''}`;
}

export function deduplicateFindings(findings = []) {
  const found = new Set();
  return findings.filter(finding => {
    const key = findingKey(finding);
    if (found.has(key)) return false;
    found.add(key);
    return true;
  });
}

export function classifyStatus(status) {
  if (status == null) return 'unknown';
  if (status >= 200 && status < 400) return 'ok';
  if (status >= 400 && status < 500) return 'client-error';
  if (status >= 500) return 'server-error';
  return 'unexpected';
}

export function normaliseIssueComparison(report) {
  const result = new Set();
  for (const page of report?.pages || []) {
    for (const issue of page.issues || []) result.add(`${issue.code}|${issue.url || page.requestedUrl || ''}`);
  }
  return result;
}

export function compareReports(previous, current) {
  const oldSet = normaliseIssueComparison(previous);
  const newSet = normaliseIssueComparison(current);
  return {
    newIssues: [...newSet].filter(key => !oldSet.has(key)),
    resolvedIssues: [...oldSet].filter(key => !newSet.has(key)),
    recurringIssues: [...newSet].filter(key => oldSet.has(key)),
  };
}

export function scoreFromFindings(findings, category, maxPenalty = 100) {
  const penalty = findings.filter(f => f.category === category).reduce((sum, f) => {
    return sum + ({ critical: 25, high: 15, medium: 8, low: 3, info: 0 }[f.severity] ?? 0);
  }, 0);
  return Math.max(0, Math.min(100, 100 - Math.min(maxPenalty, penalty)));
}
