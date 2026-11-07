import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { getSiteUrl } from './src/config/site'

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
    }
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
