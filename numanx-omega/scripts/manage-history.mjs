#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { compareReports } from '../src/core.mjs';

function usage() {
  console.log(`Omega Site Audit Pro V4 history utility\n\nCommands:\n  node scripts/manage-history.mjs compare <previous-report.json> <current-report.json> [output.json]\n  node scripts/manage-history.mjs compare-sites <site-a-report.json> <site-b-report.json> [output.json]\n  node scripts/manage-history.mjs import <report.json-or-bundle.json> <destination-folder>\n  node scripts/manage-history.mjs export <reports-folder> <bundle.json>\n\nImport/export format is JSON. Reports are copied, not executed. Imported report data remains local.`);
}
function validateReport(value) {
  if (!value || typeof value !== 'object' || !Array.isArray(value.pages) || typeof value.siteUrl !== 'string') {
    throw new Error('Invalid report: expected an object with siteUrl and pages[].');
  }
}
const [command, ...args] = process.argv.slice(2);
try {
  if (command === 'compare') {
    const [previousPath, currentPath, outputPath] = args;
    if (!previousPath || !currentPath) { usage(); process.exitCode = 2; }
    else {
      const previous = JSON.parse(await fs.readFile(path.resolve(previousPath), 'utf8'));
      const current = JSON.parse(await fs.readFile(path.resolve(currentPath), 'utf8'));
      validateReport(previous); validateReport(current);
      const result = { generatedAt: new Date().toISOString(), previous: path.basename(previousPath), current: path.basename(currentPath), ...compareReports(previous, current) };
      const destination = path.resolve(outputPath || `omega-comparison-${Date.now()}.json`);
      await fs.writeFile(destination, JSON.stringify(result, null, 2), 'utf8');
      console.log(`Comparison saved: ${destination}`);
      console.log(`New: ${result.newIssues.length} | Resolved: ${result.resolvedIssues.length} | Recurring: ${result.recurringIssues.length}`);
    }
  } else if (command === 'compare-sites') {
    const [reportAPath, reportBPath, outputPath] = args;
    if (!reportAPath || !reportBPath) { usage(); process.exitCode = 2; }
    else {
      const a = JSON.parse(await fs.readFile(path.resolve(reportAPath), 'utf8'));
      const b = JSON.parse(await fs.readFile(path.resolve(reportBPath), 'utf8'));
      validateReport(a); validateReport(b);
      const summarize = report => {
        const pages = report.pages || [];
        const keys = ['seo','accessibility','performance','security','mobile','content','overall'];
        const averageScores = Object.fromEntries(keys.map(key => {
          const scores = pages.map(page => page.scores?.[key]).filter(value => Number.isFinite(value));
          return [key, scores.length ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length) : null];
        }));
        const issues = pages.flatMap(page => page.issues || []);
        const bySeverity = Object.fromEntries(['critical','high','medium','low','info'].map(level => [level, issues.filter(issue => issue.severity === level).length]));
        const byCategory = {};
        for (const issue of issues) byCategory[issue.category] = (byCategory[issue.category] || 0) + 1;
        const lighthouseScores = {};
        for (const key of ['performance','accessibility','seo','best-practices']) {
          const scores = pages.map(page => page.lighthouse?.scores?.[key]).filter(value => Number.isFinite(value));
          lighthouseScores[key] = scores.length ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length) : null;
        }
        return { siteUrl: report.siteUrl, timestamp: report.timestamp, pagesAudited: pages.length, successfulPages: pages.filter(page => page.status >= 200 && page.status < 400).length, averageHeuristicScores: averageScores, lighthouseAverageScores: lighthouseScores, issueCount: issues.length, bySeverity, byCategory };
      };
      const summaryA = summarize(a); const summaryB = summarize(b);
      const scoreDelta = {};
      for (const key of Object.keys(summaryA.averageHeuristicScores)) {
        const left = summaryA.averageHeuristicScores[key]; const right = summaryB.averageHeuristicScores[key];
        scoreDelta[key] = left == null || right == null ? null : right - left;
      }
      const result = { format: 'omega-site-audit-competitor-comparison', generatedAt: new Date().toISOString(), comparabilityWarning: 'Compare only scans run with similar device/network conditions, profiles, crawl coverage, and settings. Public-scan metrics do not reveal private analytics, revenue, or competitor Search Console data.', sites: [summaryA, summaryB], heuristicScoreDeltaBMinusA: scoreDelta };
      const destination = path.resolve(outputPath || `omega-site-comparison-${Date.now()}.json`);
      await fs.writeFile(destination, JSON.stringify(result, null, 2), 'utf8');
      console.log(`Site comparison saved: ${destination}`);
      console.log(`${summaryA.siteUrl}: ${summaryA.pagesAudited} pages, ${summaryA.issueCount} findings`);
      console.log(`${summaryB.siteUrl}: ${summaryB.pagesAudited} pages, ${summaryB.issueCount} findings`);
    }
  } else if (command === 'import') {
    const [inputPath, folder] = args;
    if (!inputPath || !folder) { usage(); process.exitCode = 2; }
    else {
      const input = JSON.parse(await fs.readFile(path.resolve(inputPath), 'utf8'));
      const reports = Array.isArray(input.reports) ? input.reports : [input];
      for (const report of reports) validateReport(report);
      const destination = path.resolve(folder);
      await fs.mkdir(destination, { recursive: true });
      const indexEntries = [];
      for (const [i, report] of reports.entries()) {
        const safeHost = new URL(report.siteUrl).hostname.replace(/[^a-z0-9.-]/gi, '_');
        const stamp = String(report.timestamp || new Date().toISOString()).replace(/[^0-9TZ.-]/g, '-');
        const filename = `imported-${stamp}-${safeHost}-${i + 1}.json`;
        await fs.writeFile(path.join(destination, filename), JSON.stringify(report, null, 2), { encoding: 'utf8', flag: 'wx' });
        indexEntries.push({ timestamp: report.timestamp, siteUrl: report.siteUrl, filename, summary: report.summary || {} });
      }
      await fs.appendFile(path.join(destination, 'history.jsonl'), indexEntries.map(entry => JSON.stringify(entry)).join('\n') + '\n', 'utf8');
      console.log(`Imported ${reports.length} report(s) into ${destination}`);
    }
  } else if (command === 'export') {
    const [folder, outputPath] = args;
    if (!folder || !outputPath) { usage(); process.exitCode = 2; }
    else {
      const sourceDir = path.resolve(folder);
      const output = path.resolve(outputPath);
      const names = (await fs.readdir(sourceDir)).filter(name => name.endsWith('.json') && !name.startsWith('omega-comparison-'));
      const reports = [];
      for (const name of names) {
        try { const value = JSON.parse(await fs.readFile(path.join(sourceDir, name), 'utf8')); if (Array.isArray(value.pages) && typeof value.siteUrl === 'string') reports.push(value); }
        catch { /* ignore malformed/non-report JSON files; index separately */ }
      }
      const bundle = { format: 'omega-site-audit-history-bundle', version: 1, exportedAt: new Date().toISOString(), reportCount: reports.length, reports };
      await fs.writeFile(output, JSON.stringify(bundle), 'utf8');
      console.log(`Exported ${reports.length} full report(s) to ${output}`);
    }
  } else {
    usage(); process.exitCode = 2;
  }
} catch (error) {
  console.error(`History operation failed: ${error.message}`);
  process.exitCode = 1;
}
