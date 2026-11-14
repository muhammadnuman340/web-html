// scripts/verify-prerender.ts
import fs from "node:fs";
import path from "node:path";
var cwd = process.cwd();
var distDir = path.resolve(cwd, "dist");
var sitemapPath = path.resolve(distDir, "sitemap.xml");
if (!fs.existsSync(sitemapPath)) {
  console.error("\u274C dist/sitemap.xml not found. Please run sitemap generator first.");
  process.exit(1);
}
var sitemapXml = fs.readFileSync(sitemapPath, "utf8");
var urls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
if (urls.length === 0) {
  console.error("\u274C dist/sitemap.xml contains 0 URLs.");
  process.exit(1);
}
console.log(`
\u{1F50D} Verifying ${urls.length} prerendered routes against SSG invariants...`);
var failures = [];
var titles = /* @__PURE__ */ new Map();
var metaDescriptions = /* @__PURE__ */ new Map();
var categoryIntros = [];
for (const url of urls) {
  let routePath;
  try {
    const parsed = new URL(url);
    routePath = parsed.pathname;
  } catch {
    failures.push({ url, routePath: url, reason: `Invalid sitemap URL syntax: ${url}` });
    continue;
  }
  const cleanRoute = routePath.replace(/^\/+/, "").replace(/\/+$/, "");
  const filePath = routePath === "/" || routePath === "" ? path.join(distDir, "index.html") : path.join(distDir, `${cleanRoute}.html`);
  if (!fs.existsSync(filePath)) {
    failures.push({ url, routePath, reason: `Prerender file missing on disk: ${filePath}` });
    continue;
  }
  const html = fs.readFileSync(filePath, "utf8");
  const rootMatch = html.match(/<div id="root">\s*([\s\S]*?)\s*<\/div>/i);
  if (!rootMatch || !rootMatch[1].trim()) {
    failures.push({ url, routePath, reason: "#root is empty or missing static markup" });
  }
  const h1Matches = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  if (h1Matches.length !== 1) {
    failures.push({ url, routePath, reason: `Expected exactly 1 <h1>, found ${h1Matches.length}` });
  } else {
    const h1Text = h1Matches[0].replace(/<[^>]+>/g, "").trim();
    if (!h1Text) {
      failures.push({ url, routePath, reason: "<h1> element has empty text content" });
    }
  }
  const titleMatch = html.match(/<title\b[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";
  if (!title) {
    failures.push({ url, routePath, reason: "Missing or empty <title>" });
  } else {
    if (!titles.has(title)) titles.set(title, []);
    titles.get(title).push(routePath);
  }
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const desc = descMatch ? descMatch[1].trim() : "";
  if (!desc) {
    failures.push({ url, routePath, reason: "Missing or empty meta description" });
  } else {
    if (!metaDescriptions.has(desc)) metaDescriptions.set(desc, []);
    metaDescriptions.get(desc).push(routePath);
  }
  const canonMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical"/i);
  const canon = canonMatch ? canonMatch[1].trim() : "";
  if (!canon) {
    failures.push({ url, routePath, reason: "Missing canonical <link> tag" });
  } else if (canon !== url) {
    failures.push({ url, routePath, reason: `Canonical mismatch: sitemap="${url}", html="${canon}"` });
  } else if (canon.includes("?") || canon.includes("#")) {
    failures.push({ url, routePath, reason: `Canonical URL contains query or fragment: ${canon}` });
  }
  const jsonLdMatches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (jsonLdMatches.length === 0) {
    failures.push({ url, routePath, reason: "Missing JSON-LD structured data script" });
  } else {
    for (const match of jsonLdMatches) {
      try {
        JSON.parse(match[1]);
      } catch (e) {
        failures.push({ url, routePath, reason: `Invalid JSON-LD syntax: ${e instanceof Error ? e.message : String(e)}` });
      }
    }
  }
  const isCategoryLanding = /^\/convert\/[a-z0-9_-]+$/.test(routePath);
  if (isCategoryLanding) {
    const hasTable = /<table\b[^>]*>[\s\S]*?<\/table>/i.test(html);
    if (!hasTable) {
      failures.push({ url, routePath, reason: "Category landing page missing <table> element" });
    }
    const headerMatch = html.match(/<header\b[^>]*>([\s\S]*?)<\/header>/i);
    let introText = "";
    if (headerMatch) {
      const pMatches = [...headerMatch[1].matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)];
      introText = pMatches.map((m) => m[1].replace(/<[^>]+>/g, "").trim()).join(" ");
    }
    categoryIntros.push({ url, routePath, introText });
  }
  if (html.includes("undefined")) {
    failures.push({ url, routePath, reason: "Prerender HTML contains forbidden token 'undefined'" });
  }
  if (/\bNaN\b/.test(html)) {
    failures.push({ url, routePath, reason: "Prerender HTML contains forbidden token 'NaN'" });
  }
  if (html.includes("[object Object]") || html.includes("object Object")) {
    failures.push({ url, routePath, reason: "Prerender HTML contains forbidden token '[object Object]'" });
  }
  if (/\$\{[a-zA-Z0-9_.-]+\}/.test(html) || /\{\{\s*[a-zA-Z0-9_.-]+\s*\}\}/.test(html) || /\{(?:category|title|h1|intro|fromUnit|toUnit|pairSlug|from|to|value|factor|formula)\}/i.test(html)) {
    failures.push({ url, routePath, reason: "Prerender HTML contains unreplaced placeholder pattern" });
  }
  if (html.includes("Skip tour") || html.includes("uc_onboarded") || html.includes("OnboardingTour")) {
    failures.push({ url, routePath, reason: "Prerender HTML contains onboarding tour token" });
  }
  if (html.includes("NX-COS") || html.includes("Application Error") || html.includes("Something went wrong")) {
    failures.push({ url, routePath, reason: "Prerender HTML contains error boundary token" });
  }
}
console.log("\n\u{1F4CA} --- PRERENDER AUDIT DIAGNOSTICS ---");
var dupTitles = [...titles.entries()].filter(([, r]) => r.length > 1);
console.log(`\u2022 Duplicate Titles: ${dupTitles.length}`);
if (dupTitles.length > 0) {
  dupTitles.forEach(([t, r]) => {
    console.log(`  - Title "${t}" shared by ${r.length} routes: ${r.join(", ")}`);
  });
}
var dupDescs = [...metaDescriptions.entries()].filter(([, r]) => r.length > 1);
console.log(`\u2022 Duplicate Meta Descriptions: ${dupDescs.length}`);
if (dupDescs.length > 0) {
  dupDescs.forEach(([d, r]) => {
    console.log(`  - Description "${d}" shared by ${r.length} routes: ${r.join(", ")}`);
  });
}
function computeSimilarity(text1, text2) {
  const words1 = new Set(text1.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean));
  const words2 = new Set(text2.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean));
  if (words1.size === 0 || words2.size === 0) return 0;
  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = /* @__PURE__ */ new Set([...words1, ...words2]);
  return intersection.size / union.size;
}
var similarCategoryPairs = [];
for (let i = 0; i < categoryIntros.length; i++) {
  for (let j = i + 1; j < categoryIntros.length; j++) {
    const sim = computeSimilarity(categoryIntros[i].introText, categoryIntros[j].introText);
    if (sim > 0.8) {
      similarCategoryPairs.push({
        cat1: categoryIntros[i].routePath,
        cat2: categoryIntros[j].routePath,
        similarity: (sim * 100).toFixed(1) + "%"
      });
    }
  }
}
console.log(`\u2022 Category Intro Pairs with >80% Similarity: ${similarCategoryPairs.length}`);
if (similarCategoryPairs.length > 0) {
  similarCategoryPairs.forEach((p) => {
    console.log(`  - ${p.cat1} & ${p.cat2}: ${p.similarity}`);
  });
}
var spaPath = path.join(distDir, "spa.html");
if (!fs.existsSync(spaPath)) {
  failures.push({ url: "/spa.html", routePath: "/spa.html", reason: "dist/spa.html missing on disk" });
} else {
  const spaHtml = fs.readFileSync(spaPath, "utf8");
  const rootMatch = spaHtml.match(/<div id="root">\s*([\s\S]*?)\s*<\/div>/i);
  if (!rootMatch || rootMatch[1].trim().length > 0) {
    failures.push({ url: "/spa.html", routePath: "/spa.html", reason: "dist/spa.html #root must be empty" });
  }
  if (/<link[^>]*rel=["']canonical["']/i.test(spaHtml)) {
    failures.push({ url: "/spa.html", routePath: "/spa.html", reason: "dist/spa.html must not declare a canonical URL" });
  }
  if (/<h1\b/i.test(spaHtml)) {
    failures.push({ url: "/spa.html", routePath: "/spa.html", reason: "dist/spa.html must not contain an <h1>" });
  }
  const robotsMatch = spaHtml.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (!robotsMatch || !robotsMatch[1].includes("noindex")) {
    failures.push({ url: "/spa.html", routePath: "/spa.html", reason: 'dist/spa.html must declare <meta name="robots" content="noindex, follow">' });
  }
  if (/<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*\bindex,\s*follow[^"']*["']/i.test(spaHtml) || /<meta[^>]*name=["']googlebot["'][^>]*content=["'][^"']*(?<!no)index/i.test(spaHtml)) {
    failures.push({ url: "/spa.html", routePath: "/spa.html", reason: "dist/spa.html must not declare indexable robots directives" });
  }
}
var notFoundPath = path.join(distDir, "404.html");
if (!fs.existsSync(notFoundPath)) {
  failures.push({ url: "/404.html", routePath: "/404.html", reason: "dist/404.html missing on disk" });
} else {
  const notFoundHtml = fs.readFileSync(notFoundPath, "utf8");
  if (!notFoundHtml.includes("Page Not Found") || !/<h1\b/i.test(notFoundHtml)) {
    failures.push({ url: "/404.html", routePath: "/404.html", reason: "dist/404.html must have an <h1>Page Not Found</h1>" });
  }
  if (!notFoundHtml.includes('href="/"') || !notFoundHtml.includes('href="/categories"')) {
    failures.push({ url: "/404.html", routePath: "/404.html", reason: "dist/404.html must link to / and /categories" });
  }
  if (!notFoundHtml.includes("noindex")) {
    failures.push({ url: "/404.html", routePath: "/404.html", reason: "dist/404.html must specify noindex" });
  }
}
var redirectsContent = fs.readFileSync(path.join(process.cwd(), "public/_redirects"), "utf8");
var alias301s = /* @__PURE__ */ new Set();
var spaRewrites = /* @__PURE__ */ new Set();
for (const line of redirectsContent.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 3) {
    if (parts[2] === "301") alias301s.add(parts[0]);
    else if (parts[2] === "200") spaRewrites.add(parts[0]);
  }
}
var distHtmlFiles = [];
function collectHtml(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "assets") {
      collectHtml(full);
    } else if (entry.name.endsWith(".html") && !entry.name.startsWith("google")) {
      distHtmlFiles.push(full);
    }
  }
}
collectHtml(distDir);
var totalInternalLinksChecked = 0;
var linkFailures = [];
for (const fPath of distHtmlFiles) {
  const relFile = path.relative(distDir, fPath);
  const fileHtml = fs.readFileSync(fPath, "utf8");
  for (const m of fileHtml.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)) {
    const rawHref = m[1].trim();
    if (!rawHref.startsWith("/") || rawHref.startsWith("//")) continue;
    totalInternalLinksChecked++;
    const urlPath = rawHref.split(/[?#]/)[0];
    if (urlPath !== "/" && urlPath.endsWith("/")) {
      linkFailures.push({ file: relFile, href: rawHref, reason: `Link has forbidden trailing slash: ${rawHref}` });
      continue;
    }
    if (urlPath.endsWith(".html")) {
      linkFailures.push({ file: relFile, href: rawHref, reason: `Link has forbidden .html extension: ${rawHref}` });
      continue;
    }
    if (alias301s.has(urlPath) || urlPath.startsWith("/category/")) {
      linkFailures.push({ file: relFile, href: rawHref, reason: `Link points to 301 redirect alias: ${rawHref}` });
      continue;
    }
    const clean = urlPath.replace(/^\/+/, "").replace(/\/+$/, "");
    const targetFile = clean === "" ? path.join(distDir, "index.html") : path.join(distDir, `${clean}.html`);
    const fileExists = fs.existsSync(targetFile);
    const isSpaRewrite = spaRewrites.has(urlPath) || urlPath.startsWith("/pair/") && spaRewrites.has("/pair/*");
    const isFunctionMatch = /^\/convert\/[a-z0-9_-]+\/[a-z0-9_-]+$/i.test(urlPath);
    if (!fileExists && !isSpaRewrite && !isFunctionMatch) {
      linkFailures.push({ file: relFile, href: rawHref, reason: `Target does not exist on disk and matches no rewrite/function: ${rawHref}` });
    }
  }
}
console.log(`
\u{1F517} --- INTERNAL LINK CRAWLER AUDIT ---`);
console.log(`\u2022 Total Internal <a href> Links Crawled: ${totalInternalLinksChecked}`);
console.log(`\u2022 Link Invariant Violations: ${linkFailures.length}`);
if (linkFailures.length > 0) {
  linkFailures.slice(0, 20).forEach((lf) => {
    console.error(`  - In [${lf.file}]: ${lf.reason}`);
    failures.push({ url: lf.href, routePath: lf.href, reason: `[In ${lf.file}] ${lf.reason}` });
  });
}
console.log("\n\u{1F6E1}\uFE0F  --- SSG HARD INVARIANT RESULTS ---");
console.log(`Total canonical routes verified: ${urls.length}`);
console.log(`Passed: ${urls.length - failures.length} / ${urls.length}`);
console.log(`Failed: ${failures.length} / ${urls.length}`);
if (failures.length > 0) {
  console.error("\n\u274C FAIL: The following prerender invariants were violated:");
  failures.forEach((f) => {
    console.error(`  - [${f.routePath}] ${f.reason}`);
  });
  process.exit(1);
} else {
  console.log(`\u2705 ALL ${urls.length} ROUTES MEET ALL PRERENDER INVARIANTS (100% PASS).
`);
  process.exit(0);
}
