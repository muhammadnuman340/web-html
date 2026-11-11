#!/usr/bin/env node
/**
 * scripts/inject-canonical-robots.mjs
 * Production-grade Canonical & Robots Meta Injection Utility
 *
 * Automatically scans HTML files recursively and guarantees:
 * 1. Self-referencing canonical tag pointing strictly to the production origin:
 *    <link rel="canonical" href="https://converter.numanxstudio.com/[page-path]" />
 * 2. Meta robots tag:
 *    <meta name="robots" content="index, follow" /> (or preserves noindex on 404)
 *
 * Usage:
 *   node scripts/inject-canonical-robots.mjs
 *   node scripts/inject-canonical-robots.mjs --dir dist
 *   node scripts/inject-canonical-robots.mjs --dir dist --dry-run
 *   node scripts/inject-canonical-robots.mjs --site-url https://converter.numanxstudio.com
 */

import fs from 'node:fs';
import path from 'node:path';

// Parse command line arguments
const args = process.argv.slice(2);
let targetDir = 'dist';
let siteUrl = 'https://converter.numanxstudio.com';
let isDryRun = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--dir' && args[i + 1]) {
    targetDir = args[++i];
  } else if (args[i] === '--site-url' && args[i + 1]) {
    siteUrl = args[++i].trim().replace(/\/+$/, '');
  } else if (args[i] === '--dry-run') {
    isDryRun = true;
  }
}

const resolvedDir = path.resolve(process.cwd(), targetDir);

if (!fs.existsSync(resolvedDir)) {
  console.error(`❌ Target directory does not exist: ${resolvedDir}`);
  process.exit(1);
}

/**
 * Recursively find all HTML files in a directory
 */
function findHtmlFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Computes canonical URL path from relative file path
 */
function getCanonicalUrl(relPath, baseSiteUrl) {
  // Normalize Windows backslashes
  const cleanRel = relPath.replace(/\\/g, '/');

  // Root homepage
  if (cleanRel === 'index.html') {
    return `${baseSiteUrl}/`;
  }

  // Handle nested index.html (e.g. convert/length/index.html -> /convert/length)
  if (cleanRel.endsWith('/index.html')) {
    const subPath = cleanRel.slice(0, -'/index.html'.length);
    return `${baseSiteUrl}/${subPath}`;
  }

  // Handle flat html files (e.g. convert/length.html -> /convert/length)
  if (cleanRel.endsWith('.html')) {
    const subPath = cleanRel.slice(0, -'.html'.length);
    return `${baseSiteUrl}/${subPath}`;
  }

  return `${baseSiteUrl}/${cleanRel}`;
}

const htmlFiles = findHtmlFiles(resolvedDir);
console.log(`\n🔍 Found ${htmlFiles.length} HTML files in: ${resolvedDir}`);
if (isDryRun) {
  console.log(`⚠️ DRY RUN MODE: No files will be modified on disk.\n`);
}

let canonicalInjectedCount = 0;
let canonicalUpdatedCount = 0;
let robotsInjectedCount = 0;
let untouchedCount = 0;
let skippedCount = 0;

for (const filePath of htmlFiles) {
  const relPath = path.relative(resolvedDir, filePath).replace(/\\/g, '/');
  let content = fs.readFileSync(filePath, 'utf-8');

  // Skip verification token files or files without <head>
  if (!content.includes('</head>') && !content.includes('<head>')) {
    skippedCount++;
    continue;
  }

  // Skip SPA fallback shell (neutral shell for dynamic client routes; must not declare canonical)
  if (relPath === 'spa.html') {
    // Ensure no canonical is accidentally present in spa.html
    if (content.includes('rel="canonical"')) {
      content = content.replace(/<link[^>]*rel=["']canonical["'][^>]*\/?>\s*/gi, '');
      if (!isDryRun) fs.writeFileSync(filePath, content, 'utf-8');
    }
    skippedCount++;
    continue;
  }

  // Special case: 404 error page should remain noindex
  const is404 = relPath === '404.html';
  const targetCanonical = getCanonicalUrl(relPath, siteUrl);

  let modified = false;

  // 1. Process Canonical Tag
  if (!is404) {
    const canonicalTagRegex = /<link[^>]*rel=["']canonical["'][^>]*>/i;
    const match = content.match(canonicalTagRegex);

    if (match) {
      const existingTag = match[0];
      const hrefMatch = existingTag.match(/href=["']([^"']*)["']/i);
      const currentHref = hrefMatch ? hrefMatch[1] : '';

      if (currentHref !== targetCanonical) {
        const replacementTag = `<link rel="canonical" href="${targetCanonical}" />`;
        content = content.replace(canonicalTagRegex, replacementTag);
        canonicalUpdatedCount++;
        modified = true;
      }
    } else {
      // Inject canonical tag before </head>
      const newTag = `    <link rel="canonical" href="${targetCanonical}" />\n  </head>`;
      content = content.replace('</head>', newTag);
      canonicalInjectedCount++;
      modified = true;
    }
  }

  // 2. Process Meta Robots Tag
  const robotsTagRegex = /<meta[^>]*name=["']robots["'][^>]*>/i;
  const robotsMatch = content.match(robotsTagRegex);

  if (is404) {
    if (!robotsMatch) {
      content = content.replace('</head>', `    <meta name="robots" content="noindex, follow" />\n  </head>`);
      modified = true;
    }
  } else {
    if (robotsMatch) {
      const existingTag = robotsMatch[0];
      const contentMatch = existingTag.match(/content=["']([^"']*)["']/i);
      const currentContent = contentMatch ? contentMatch[1] : '';
      if (currentContent !== 'index, follow') {
        content = content.replace(robotsTagRegex, '<meta name="robots" content="index, follow" />');
        modified = true;
      }
    } else {
      // Inject robots tag before </head>
      const newRobotsTag = `    <meta name="robots" content="index, follow" />\n  </head>`;
      content = content.replace('</head>', newRobotsTag);
      robotsInjectedCount++;
      modified = true;
    }
  }

  if (modified) {
    if (!isDryRun) {
      fs.writeFileSync(filePath, content, 'utf-8');
    }
  } else {
    untouchedCount++;
  }
}

console.log(`========================================`);
console.log(`📊 Canonical & Robots Injection Report:`);
console.log(`========================================`);
console.log(`Total HTML files scanned:  ${htmlFiles.length}`);
console.log(`Canonicals injected:       ${canonicalInjectedCount}`);
console.log(`Canonicals updated:        ${canonicalUpdatedCount}`);
console.log(`Robots tags injected:      ${robotsInjectedCount}`);
console.log(`Already compliant:         ${untouchedCount}`);
console.log(`Skipped non-HTML/shells:   ${skippedCount}`);
console.log(`Target Production Origin:  ${siteUrl}`);
console.log(`========================================\n`);

if (isDryRun) {
  console.log(`💡 Run without --dry-run to apply changes.\n`);
} else {
  console.log(`✅ All HTML files in ${targetDir} verified and synchronized with production canonicals!\n`);
}
