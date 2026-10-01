import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Local dev: run the contact server with `npm --prefix server start` (DRY_RUN=1).
  server: { proxy: { '/api': 'http://127.0.0.1:3100' } },
  preview: { proxy: { '/api': 'http://127.0.0.1:3100' } },
})
