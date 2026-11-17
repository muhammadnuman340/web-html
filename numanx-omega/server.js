import express from 'express'
import path from 'path'
import fs from 'fs'
import os from 'os'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000
const distDir = path.join(__dirname, 'dist')

app.use(express.static(distDir))

app.use((req, res) => {
  const [rawPath] = req.url.split('?')
  const pathname = decodeURIComponent(rawPath)
  const cleanPath = pathname.replace(/^\/+/, '').replace(/\/+$/, '')

  if (cleanPath === '') {
    return res.sendFile(path.join(distDir, 'index.html'))
  }

  const htmlFile = path.join(distDir, `${cleanPath}.html`)
  const indexHtmlFile = path.join(distDir, cleanPath, 'index.html')

  if (fs.existsSync(htmlFile)) {
    return res.sendFile(htmlFile)
  }
  if (fs.existsSync(indexHtmlFile)) {
    return res.sendFile(indexHtmlFile)
  }

  // Check _redirects
  const redirectsFile = path.join(distDir, '_redirects')
  if (fs.existsSync(redirectsFile)) {
    const lines = fs.readFileSync(redirectsFile, 'utf8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const parts = trimmed.split(/\s+/)
      if (parts.length >= 3) {
        const [from, to, code] = parts
        const normalizedFrom = from.replace(/\/+$/, '')
        const normalizedPath = pathname.replace(/\/+$/, '')

        if (normalizedFrom.endsWith('/*')) {
          const prefix = normalizedFrom.slice(0, -2)
          if (normalizedPath.startsWith(prefix + '/')) {
            if (code === '301') {
              const splat = normalizedPath.slice(prefix.length + 1)
              return res.redirect(301, to.replace(':splat', splat))
            }
          }
        }

        if (normalizedFrom === normalizedPath) {
          if (code === '301') {
            return res.redirect(301, to)
          } else if (code === '200') {
            const targetClean = to.replace(/^\/+/, '').replace(/\/+$/, '')
            const targetFile = path.join(distDir, `${targetClean}.html`)
            if (fs.existsSync(targetFile)) {
              return res.sendFile(targetFile)
            }
          }
        }
      }
    }
  }

  // 404 handler
  const notFoundFile = path.join(distDir, '404.html')
  if (fs.existsSync(notFoundFile)) {
    return res.status(404).sendFile(notFoundFile)
  }
  res.status(404).send('Not Found')
})

app.listen(PORT, () => {
  const ip = Object.values(os.networkInterfaces())
    .flat()
    .find(i => i?.family === 'IPv4' && !i.internal)?.address || '0.0.0.0'
  console.log(`\n  🚀 Omega X Converter running at:`)
  console.log(`  ─────────────────────────────`)
  console.log(`  ➜  Local:   http://localhost:${PORT}`)
  console.log(`  ➜  Network: http://${ip}:${PORT}`)
  console.log(`  ─────────────────────────────\n`)
})
