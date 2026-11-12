import fs from 'node:fs'
import { getSiteUrl } from '../src/config/site'

const siteUrl = getSiteUrl()
const xml = fs.readFileSync('public/sitemap.xml', 'utf8')
const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1])
console.log('Total URLs in public/sitemap.xml:', urls.length)

const distXml = fs.readFileSync('dist/sitemap.xml', 'utf8')
const distUrls = [...distXml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1])
console.log('Total URLs in dist/sitemap.xml:', distUrls.length)

const home = urls.filter(u => u === `${siteUrl}/`)
const categories = urls.filter(u => u.match(/\/convert\/[a-z0-9_-]+$/))
const pairs = urls.filter(u => u.match(/\/convert\/[a-z0-9_-]+\/[a-z0-9_-]+$/))
const guides = urls.filter(u => u.match(/\/guides\/[a-z0-9_-]+$/))
const blogArticles = urls.filter(u => u.match(/\/blog\/[a-z0-9_-]+$/))
const core = urls.filter(u => !categories.includes(u) && !pairs.includes(u) && !guides.includes(u) && !blogArticles.includes(u) && !home.includes(u))

console.log('Breakdown:')
console.log('Home (1):', home.length, home)
console.log('Core pages (11):', core.length, core)
console.log('Categories (36):', categories.length)
console.log('Pairs (187):', pairs.length)
console.log('Guides (15):', guides.length, guides)
console.log('Blog articles (6):', blogArticles.length, blogArticles)
console.log('Sum:', home.length + core.length + categories.length + pairs.length + guides.length + blogArticles.length)

// Also check dist/ file existence for every URL
let missingPrerender = 0
for (const u of urls) {
  const pathPart = u.replace(siteUrl, '')
  const clean = pathPart.replace(/^\/+/, '').replace(/\/+$/, '')
  const filePath = pathPart === '/' || clean === '' 
    ? 'dist/index.html' 
    : `dist/${clean}.html`
  if (!fs.existsSync(filePath)) {
    console.error('Missing prerender file for URL:', u, 'at', filePath)
    missingPrerender++
  }
}
console.log('Missing prerender files:', missingPrerender)
