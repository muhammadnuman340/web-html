#!/usr/bin/env node
/**
 * Local Lighthouse runs against `npm run preview` (http://localhost:4173).
 * One URL per template, mobile + desktop presets, N runs each, median reported.
 * Shells out to `npx lighthouse@13.6.0` (same major/minor PSI used on 2026-11-19).
 *
 *   node scripts/lh-local.mjs <label> [--runs 3] [--base http://localhost:4173] [--only mobile|desktop] [--urls file.json]
 *   node scripts/lh-local.mjs --compare <beforeLabel> <afterLabel>
 *
 * Output: reports/lighthouse/<label>/raw/*.json (gitignored) and reports/lighthouse/<label>/medians.json
 * Chrome: CHROME_PATH env, else puppeteer's bundled Chrome if installed.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LH = 'lighthouse@13.6.0';
const DEFAULT_URLS = {
  home: '/',
  categories: '/categories',
  'convert/<cat>': '/convert/length',
  'convert/<cat>/<pair>': '/convert/length/centimeter-to-inches',
  guides: '/guides/cups-to-grams',
  blog: '/blog/metric-vs-imperial-engineering-guide',
  static: '/about',
  other: '/calculator',
};
const METRICS = {
  score: (l) => Math.round(l.categories.performance.score * 100),
  LCP: (l) => l.audits['largest-contentful-paint'].numericValue,
  TBT: (l) => l.audits['total-blocking-time'].numericValue,
  CLS: (l) => l.audits['cumulative-layout-shift'].numericValue,
  FCP: (l) => l.audits['first-contentful-paint'].numericValue,
  SI: (l) => l.audits['speed-index'].numericValue,
  JS: (l) => (l.audits['network-requests']?.details?.items || []).filter((r) => r.resourceType === 'Script').reduce((s, r) => s + (r.transferSize || 0), 0),
};
const median = (xs) => { const v = [...xs].sort((a, b) => a - b); const m = v.length >> 1; return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
// --urls <file.json>: { "label": "/path", ... } replaces the default one-URL-per-template set.
const URLS = opt('--urls') ? JSON.parse(fs.readFileSync(path.resolve(opt('--urls')), 'utf8')) : DEFAULT_URLS;

async function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  try { return await createRequire(path.join(ROOT, 'package.json'))('puppeteer').executablePath(); } catch { return ''; }
}

function fmt(k, v) {
  if (v == null) return '–';
  if (k === 'score') return String(Math.round(v));
  if (k === 'CLS') return v.toFixed(3);
  if (k === 'JS') return `${(v / 1024).toFixed(1)} KB`;
  return v >= 1000 ? `${(v / 1000).toFixed(2)} s` : `${Math.round(v)} ms`;
}

function compare(a, b) {
  const load = (l) => JSON.parse(fs.readFileSync(path.join(ROOT, 'reports', 'lighthouse', l, 'medians.json'), 'utf8'));
  const A = load(a), B = load(b);
  const out = [];
  for (const preset of ['mobile', 'desktop']) {
    out.push(`### ${preset} (local Lighthouse ${LH.split('@')[1]}, median of ${A.runs} runs; before = \`${a}\`, after = \`${b}\`)`, '');
    out.push('| Template | URL | Score | LCP | TBT | CLS | FCP | SI | JS transfer |', '|---|---|---|---|---|---|---|---|---|');
    for (const t of Object.keys(A.results[preset] || {})) {
      const x = A.results[preset]?.[t], y = B.results[preset]?.[t];
      if (!x || !y) continue;
      const cell = (k) => `${fmt(k, x[k])} → ${fmt(k, y[k])}`;
      out.push(`| ${t} | \`${x.url}\` | ${cell('score')} | ${cell('LCP')} | ${cell('TBT')} | ${cell('CLS')} | ${cell('FCP')} | ${cell('SI')} | ${cell('JS')} |`);
    }
    out.push('');
  }
  console.log(out.join('\n'));
}

async function main() {
  if (args[0] === '--compare') return compare(args[1], args[2]);
  const label = args[0];
  if (!label || label.startsWith('--')) { console.error('usage: node scripts/lh-local.mjs <label> [--runs 3]'); process.exit(2); }
  const runs = Number(opt('--runs', 3));
  const base = opt('--base', 'http://localhost:4173');
  const presets = opt('--only') ? [opt('--only')] : ['mobile', 'desktop'];
  const chrome = await chromePath();
  const dir = path.join(ROOT, 'reports', 'lighthouse', label);
  fs.mkdirSync(path.join(dir, 'raw'), { recursive: true });
  const env = { ...process.env, ...(chrome ? { CHROME_PATH: chrome } : {}) };
  const results = {};
  for (const preset of presets) {
    results[preset] = {};
    for (const [t, p] of Object.entries(URLS)) {
      const per = [];
      for (let i = 1; i <= runs; i++) {
        const file = path.join(dir, 'raw', `${t.replace(/[^a-z0-9]+/gi, '_')}__${preset}__${i}.json`);
        const lhArgs = ['-y', LH, base + p, '--only-categories=performance', '--output=json', `--output-path=${file}`, '--quiet', '--chrome-flags=--headless=new --no-first-run'];
        if (preset === 'desktop') lhArgs.push('--preset=desktop');
        let r;
        for (let attempt = 1; attempt <= 2; attempt++) {
          if (fs.existsSync(file)) fs.rmSync(file);
          r = spawnSync('npx', lhArgs, { env, shell: true, encoding: 'utf8', cwd: ROOT });
          if (r.status === 0 && fs.existsSync(file)) break;
          console.error(`  attempt ${attempt} failed ${preset} ${t} run ${i}: ${(r.stderr || '').slice(-200).trim()}`);
        }
        if (r.status !== 0 || !fs.existsSync(file)) { console.error(`FAIL ${preset} ${t} run ${i}`); continue; }
        const lhr = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (lhr.runtimeError) { console.error(`runtimeError ${preset} ${t} run ${i}: ${lhr.runtimeError.code}`); continue; }
        const m = Object.fromEntries(Object.entries(METRICS).map(([k, f]) => [k, f(lhr)]));
        per.push(m);
        console.log(`${preset.padEnd(7)} ${t.padEnd(22)} run ${i}: score ${m.score} LCP ${Math.round(m.LCP)} TBT ${Math.round(m.TBT)} CLS ${m.CLS.toFixed(3)}`);
      }
      if (per.length) results[preset][t] = { ...Object.fromEntries(Object.keys(METRICS).map((k) => [k, median(per.map((m) => m[k]))])), n: per.length, url: p };
    }
  }
  fs.writeFileSync(path.join(dir, 'medians.json'), JSON.stringify({ label, runs, base, lighthouse: LH, at: new Date().toISOString(), results }, null, 2));
  console.log(`wrote reports/lighthouse/${label}/medians.json`);
}

main().catch((e) => { console.error(e); process.exit(1); });
