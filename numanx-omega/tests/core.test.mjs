import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizePageUrl, extractXmlLocs, parseRobotsTxt, escapeHtml, hashText,
  deduplicateFindings, compareReports, classifyStatus, scoreFromFindings,
} from '../src/core.mjs';

test('normalizes same-origin routes and removes fragments/tracking query by default', () => {
  assert.equal(normalizePageUrl('/about#team', 'https://example.com'), 'https://example.com/about');
  assert.equal(normalizePageUrl('https://other.example/about', 'https://example.com'), null);
  assert.equal(normalizePageUrl('mailto:test@example.com', 'https://example.com'), null);
  assert.equal(normalizePageUrl('/search?q=one&utm_source=x', 'https://example.com', { keepQuery: true }), 'https://example.com/search?q=one');
});

test('extracts and XML-decodes sitemap loc values', () => {
  assert.deepEqual(extractXmlLocs('<urlset><url><loc>https://example.com/a&amp;b</loc></url></urlset>'), ['https://example.com/a&b']);
});

test('parses robots sitemap directives and crawl rules', () => {
  const parsed = parseRobotsTxt('User-agent: *\nDisallow: /private\nAllow: /private/public\nSitemap: https://example.com/sitemap.xml');
  assert.deepEqual(parsed.sitemaps, ['https://example.com/sitemap.xml']);
  assert.deepEqual(parsed.rules.map(rule => rule.directive), ['disallow', 'allow']);
  assert.equal(parsed.rules[0].value, '/private');
  const twoGroups = parseRobotsTxt('User-agent: *\nDisallow: /one\n\nUser-agent: OmegaSiteAuditPro\nDisallow: /two');
  assert.deepEqual(twoGroups.rules[0].agents, ['*']);
  assert.deepEqual(twoGroups.rules[1].agents, ['omegasiteauditpro']);
});

test('HTML escaping neutralises markup characters', () => {
  assert.equal(escapeHtml(`<script a="b">&'`), '&lt;script a=&quot;b&quot;&gt;&amp;&#39;');
});

test('content hashes normalise whitespace and case', () => {
  assert.equal(hashText('Hello   WORLD'), hashText('hello world'));
});

test('deduplicates findings using stable keys', () => {
  const finding = { code: 'TITLE', url: 'https://example.com', evidence: 'missing' };
  assert.equal(deduplicateFindings([finding, { ...finding }, { ...finding, code: 'H1' }]).length, 2);
});

test('compares old and new report findings', () => {
  const previous = { pages: [{ requestedUrl: 'https://example.com/a', issues: [{ code: 'TITLE', url: 'https://example.com/a' }, { code: 'IMG', url: 'https://example.com/a' }] }] };
  const current = { pages: [{ requestedUrl: 'https://example.com/a', issues: [{ code: 'TITLE', url: 'https://example.com/a' }, { code: 'H1', url: 'https://example.com/a' }] }] };
  const comparison = compareReports(previous, current);
  assert.deepEqual(comparison.newIssues, ['H1|https://example.com/a']);
  assert.deepEqual(comparison.resolvedIssues, ['IMG|https://example.com/a']);
  assert.deepEqual(comparison.recurringIssues, ['TITLE|https://example.com/a']);
});

test('classifies HTTP statuses and applies finding-based category scores', () => {
  assert.equal(classifyStatus(200), 'ok');
  assert.equal(classifyStatus(404), 'client-error');
  assert.equal(classifyStatus(null), 'unknown');
  assert.equal(scoreFromFindings([{ category: 'seo', severity: 'high' }], 'seo'), 85);
  assert.equal(scoreFromFindings([{ category: 'seo', severity: 'critical' }, { category: 'seo', severity: 'critical' }, { category: 'seo', severity: 'critical' }, { category: 'seo', severity: 'critical' }, { category: 'seo', severity: 'critical' }], 'seo'), 0);
});
