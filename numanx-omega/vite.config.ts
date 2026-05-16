import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { target: 'esnext', minify: 'esbuild' },
  server: { host: true, port: 3000 }
})
