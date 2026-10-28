import fs from 'node:fs'
import path from 'node:path'

const distDir = path.resolve('dist/convert')
const pairFiles = []

for (const cat of fs.readdirSync(distDir)) {
  const catPath = path.join(distDir, cat)
  if (!fs.statSync(catPath).isDirectory()) continue
  for (const pair of fs.readdirSync(catPath)) {
    const pairPath = path.join(catPath, pair)
    if (!fs.statSync(pairPath).isDirectory()) continue
    const htmlFile = path.join(pairPath, 'index.html')
    if (fs.existsSync(htmlFile)) {
      pairFiles.push({ cat, pair, path: htmlFile })
    }
  }
}

console.log(`Found ${pairFiles.length} pair HTML files.`)

function extractMainText(html) {
  const match = html.match(/<main[\s\S]*?<\/main>/i)
  if (!match) return ''
  // Remove script and style tags
  let text = match[0].replace(/<script[\s\S]*?<\/script>/gi, ' ')
  text = text.replace(/<style[\s\S]*?<\/style>/gi, ' ')
  // Remove tags
  text = text.replace(/<[^>]+>/g, ' ')
  // Normalize whitespace
  return text.replace(/\s+/g, ' ').trim()
}

function tokenize(text) {
  return text.toLowerCase().match(/[a-z0-9]+/g) || []
}

function getShingles(tokens, n = 3) {
  const shingles = new Set()
  for (let i = 0; i <= tokens.length - n; i++) {
    shingles.add(tokens.slice(i, i + n).join(' '))
  }
  return shingles
}

function jaccardSimilarity(setA, setB) {
  if (setA.size === 0 || setB.size === 0) return 0
  let intersection = 0
  for (const item of setA) {
    if (setB.has(item)) intersection++
  }
  const union = setA.size + setB.size - intersection
  return union === 0 ? 0 : intersection / union
}

const records = pairFiles.map(f => {
  const html = fs.readFileSync(f.path, 'utf8')
  const text = extractMainText(html)
  const tokens = tokenize(text)
  const shingles3 = getShingles(tokens, 3)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  return {
    ...f,
    textLength: text.length,
    wordCount: tokens.length,
    sentenceCount: sentences.length,
    tokens,
    shingles3,
  }
})

const wordCounts = records.map(r => r.wordCount).sort((a, b) => a - b)
const minWords = wordCounts[0]
const maxWords = wordCounts[wordCounts.length - 1]
const avgWords = Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length)
const medianWords = wordCounts[Math.floor(wordCounts.length / 2)]

// Compute pairwise 3-shingle Jaccard similarity across all pairs
let totalPairwiseSim = 0
let pairComparisons = 0
let intraCatSim = 0
let intraCatComparisons = 0

for (let i = 0; i < records.length; i++) {
  for (let j = i + 1; j < records.length; j++) {
    const sim = jaccardSimilarity(records[i].shingles3, records[j].shingles3)
    totalPairwiseSim += sim
    pairComparisons++
    if (records[i].cat === records[j].cat) {
      intraCatSim += sim
      intraCatComparisons++
    }
  }
}
const avgJaccardSim = (totalPairwiseSim / pairComparisons) * 100
const avgIntraCatSim = intraCatComparisons > 0 ? (intraCatSim / intraCatComparisons) * 100 : 0

console.log('--- CONTENT SIMILARITY & VOLUME METRICS ---')
console.log(`Total pair pages analyzed: ${records.length}`)
console.log(`Word Count - Min: ${minWords}, Max: ${maxWords}, Avg: ${avgWords}, Median: ${medianWords}`)
console.log(`Average 3-gram Jaccard Similarity across all ${pairComparisons} comparisons: ${avgJaccardSim.toFixed(2)}%`)
console.log(`Average Intra-Category 3-gram Jaccard Similarity (${intraCatComparisons} comparisons): ${avgIntraCatSim.toFixed(2)}%`)
