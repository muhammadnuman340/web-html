#!/usr/bin/env node

/**
 * NumanX Omega Web Consistency & Code Health Audit Runner
 * Runs all validation stages sequentially and outputs a unified audit summary report.
 */

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const cwd = process.cwd()
const reportsDir = path.resolve(cwd, 'audit-reports')
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true })
}

const stages = [
  {
    name: 'TypeScript Compilation & Type Safety',
    command: 'npx tsc --noEmit',
    critical: true
  },
  {
    name: 'Code Hygiene & ESLint Validation',
    command: 'npx eslint .',
    critical: true
  },
  {
    name: 'Sitemap Inventory & Route Parity',
    command: 'node scripts/check-sitemap-inventory.mjs',
    critical: true
  },
  {
    name: 'SSG Prerender Hard Invariants',
    command: 'node scripts/verify-prerender.mjs',
    critical: true
  },
  {
    name: 'Core & Regression Test Suite',
    command: 'npm test',
    critical: true
  }
]

console.log('='.repeat(70))
console.log('⚡ NUMANX OMEGA WEB CONSISTENCY & AUDIT ENGINE')
console.log('='.repeat(70))

const results = []
let allPassed = true

for (const stage of stages) {
  process.stdout.write(`\n⏳ Running [${stage.name}]... `)
  const startTime = Date.now()
  try {
    const stdout = execSync(stage.command, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] })
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(`✅ PASS (${duration}s)`)
    results.push({ name: stage.name, command: stage.command, passed: true, duration, output: stdout.trim() })
  } catch (err) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(`❌ FAIL (${duration}s)`)
    const stderr = err.stdout || err.stderr || err.message
    results.push({ name: stage.name, command: stage.command, passed: false, duration, output: String(stderr).trim() })
    if (stage.critical) {
      allPassed = false
    }
  }
}

// Generate Latest Report
const now = new Date()
const timestamp = now.toISOString()
const status = allPassed ? 'HEALTHY' : 'DEGRADED'
const badge = allPassed ? '🟢 **ALL INVARIANTS PASSED**' : '🔴 **ACTION REQUIRED**'

let markdown = `# Daily Web Inconsistency & Code Health Audit Report\n\n`
markdown += `- **Execution Timestamp**: ${timestamp}\n`
markdown += `- **Workspace**: \`${cwd}\`\n`
markdown += `- **Overall Status**: ${badge}\n\n`
markdown += `## Stage Execution Summary\n\n`
markdown += `| Stage | Command | Status | Duration |\n`
markdown += `| :--- | :--- | :---: | :---: |\n`

for (const res of results) {
  const s = res.passed ? '🟢 PASS' : '🔴 FAIL'
  markdown += `| **${res.name}** | \`${res.command}\` | ${s} | ${res.duration}s |\n`
}

markdown += `\n---\n\n## Stage Diagnostic Details\n\n`
for (const res of results) {
  markdown += `### ${res.name} (${res.passed ? 'PASSED' : 'FAILED'})\n\n`
  markdown += '```\n'
  const lines = res.output.split('\n')
  const preview = lines.length > 25 ? [...lines.slice(0, 15), `... [${lines.length - 20} lines truncated] ...`, ...lines.slice(-5)].join('\n') : res.output
  markdown += `${preview || 'No output (clean execution)'}\n`
  markdown += '```\n\n'
}

const latestPath = path.resolve(reportsDir, 'consistency-audit-latest.md')
fs.writeFileSync(latestPath, markdown, 'utf8')
console.log(`\n📄 Report written to: ${latestPath}`)

console.log('='.repeat(70))
if (allPassed) {
  console.log('🎉 100% HEALTHY: All consistency checks, invariants, and tests passed!')
} else {
  console.error('⚠️ Inconsistencies detected. Please check the report.')
}
console.log('='.repeat(70))

process.exit(allPassed ? 0 : 1)
