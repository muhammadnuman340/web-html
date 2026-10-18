import test from 'node:test';
import assert from 'node:assert/strict';
import { makeHtml, makeCsv } from '../src/report.mjs';

const sample = {
  tool: 'Omega Site Audit Pro Universal', version: '4.0.0', timestamp: '2026-10-18T00:00:00.000Z', siteUrl: 'https://example.com',
  summary: { totalPagesAudited: 1, siteHealthScore: 82, failedPages: 0, totalIssues: 1, severityCounts: { high: 1 } },
  configuration: { discovery: 'routes' }, discovery: { message: 'Test report' }, integrations: {},
  pages: [{ requestedUrl: 'https://example.com/', finalUrl: 'https://example.com/', status: 200, title: '<script>alert(1)</script>', description: 'ok', scores: { seo: 82, accessibility: 90 }, issues: [{ severity: 'high', category: 'seo', code: 'TEST', message: '<img src=x onerror=alert(1)>', url: 'https://example.com/', recommendation: 'Review & fix' }], lighthouse: { status: 'not-run' }, metrics: { lcpMs: null, cls: null } }],
};

test('HTML report escapes page-controlled text and recommendations', () => {
  const html = makeHtml(sample);
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.ok(!html.includes('<img src=x onerror=alert(1)>'));
});

test('CSV report preserves page count and quotes embedded characters', () => {
  const csv = makeCsv(sample);
  assert.ok(csv.includes('requestedUrl'));
  assert.ok(csv.includes('https://example.com/'));
  assert.ok(csv.includes('"<script>alert(1)</script>"'));
});
