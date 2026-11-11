#!/usr/bin/env node
/**
 * scripts/ping-indexnow.mjs
 *
 * Submits the canonical URL inventory to participating IndexNow search engines (Bing, Yandex, Seznam, Naver).
 * Safe by design: Dry-run by default unless `--live` is explicitly passed.
 * Note: Google does NOT participate in IndexNow.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const HOST = 'converter.numanxstudio.com'
const KEY = 'c8d19e4a3b72456f91e0a2d48c3b7e91'
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`
const SITEMAP_PATH = path.join(rootDir, 'public', 'sitemap.xml')

if (!fs.existsSync(SITEMAP_PATH)) {
  console.error('❌ Sitemap not found at:', SITEMAP_PATH)
  process.exit(1)
}

const sitemapXml = fs.readFileSync(SITEMAP_PATH, 'utf8')
const matches = [...sitemapXml.matchAll(/<loc>(https:\/\/[^<]+)<\/loc>/g)]
const urlList = matches.map(m => m[1])

console.log(`========================================`)
console.log(`📡 IndexNow Dispatcher — Omega X Metrology`)
console.log(`========================================`)
console.log(`Host:         ${HOST}`)
console.log(`Key:          ${KEY}`)
console.log(`Key Location: ${KEY_LOCATION}`)
console.log(`Total URLs:   ${urlList.length}`)

const isLive = process.argv.includes('--live')

if (!isLive) {
  console.log(`\nℹ️  DRY RUN MODE: No network requests made.`)
  console.log(`To dispatch live IndexNow ping to Bing/Yandex/Seznam, run:`)
  console.log(`  node scripts/ping-indexnow.mjs --live\n`)
  process.exit(0)
}

console.log(`\n🚀 Sending IndexNow payload to https://api.indexnow.org/indexnow ...`)

const payload = {
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: urlList,
}

try {
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  })

  if (response.ok || response.status === 200 || response.status === 202) {
    console.log(`✅ IndexNow successfully submitted ${urlList.length} URLs (Status: ${response.status})`)
  } else {
    const errorText = await response.text()
    console.error(`⚠️ IndexNow returned HTTP ${response.status}:`, errorText)
  }
} catch (err) {
  console.error(`❌ Network error submitting to IndexNow:`, err.message)
}
