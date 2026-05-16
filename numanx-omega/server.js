import express from 'express'
import path from 'path'
import os from 'os'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, 'dist')))

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
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
