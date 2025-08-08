import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Set at build time by GitHub Actions: BASE_PATH='/{repo-name}/'
  base: process.env.BASE_PATH || '/',
})
