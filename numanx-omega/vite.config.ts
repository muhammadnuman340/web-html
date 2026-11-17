import fs from 'node:fs'
import path from 'node:path'
import type { ServerResponse } from 'node:http'
import { defineConfig, type PreviewServer, type Connect } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { getSiteUrl } from './src/config/site'

function previewServerRoutingPlugin() {
  return {
    name: 'omega-preview-routing',
    configurePreviewServer(server: PreviewServer) {
      server.middlewares.use((req: Connect.IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
        const url = req.url || '/'
        const [rawPath] = url.split('?')
        const pathname = decodeURIComponent(rawPath)

        // Pass static assets and files with extensions through
        if (pathname.startsWith('/assets/') || path.extname(pathname)) {
          return next()
        }

        const distDir = path.resolve(process.cwd(), 'dist')
        const cleanPath = pathname.replace(/^\/+/, '').replace(/\/+$/, '')

        // Root path
        if (cleanPath === '') {
          return next()
        }

        // 1. Check exact html file on disk
        const htmlFile = path.join(distDir, `${cleanPath}.html`)
        const indexHtmlFile = path.join(distDir, cleanPath, 'index.html')

        if (fs.existsSync(htmlFile)) {
          res.statusCode = 200
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          return res.end(fs.readFileSync(htmlFile))
        }

        if (fs.existsSync(indexHtmlFile)) {
          res.statusCode = 200
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          return res.end(fs.readFileSync(indexHtmlFile))
        }

        // 2. Check _redirects rules
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

              // Check splat wildcard
              if (normalizedFrom.endsWith('/*')) {
                const prefix = normalizedFrom.slice(0, -2)
                if (normalizedPath.startsWith(prefix + '/')) {
                  if (code === '301') {
                    const splat = normalizedPath.slice(prefix.length + 1)
                    const target = to.replace(':splat', splat)
                    res.statusCode = 301
                    res.setHeader('Location', target)
                    return res.end()
                  }
                }
              }

              if (normalizedFrom === normalizedPath) {
                if (code === '301') {
                  res.statusCode = 301
                  res.setHeader('Location', to)
                  return res.end()
                } else if (code === '200') {
                  const targetClean = to.replace(/^\/+/, '').replace(/\/+$/, '')
                  const targetFile = path.join(distDir, `${targetClean}.html`)
                  if (fs.existsSync(targetFile)) {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'text/html; charset=utf-8')
                    return res.end(fs.readFileSync(targetFile))
                  }
                }
              }
            }
          }
        }

        // 3. Unknown route -> 404!
        const notFoundFile = path.join(distDir, '404.html')
        if (fs.existsSync(notFoundFile)) {
          res.statusCode = 404
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          return res.end(fs.readFileSync(notFoundFile))
        }

        res.statusCode = 404
        res.end('Not Found')
      })
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'omega-site-url-transform',
      transformIndexHtml(html) {
        const siteUrl = getSiteUrl()
        return html.replaceAll('%SITE_URL%', siteUrl)
      }
    },
    previewServerRoutingPlugin()
  ],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion'
          }
        }
      }
    }
  },
  server: { host: true, port: 3000 }
})
