import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pages serves this repository at /weather-app/
  base: process.env.GITHUB_ACTIONS ? '/weather-app/' : '/',
  plugins: [react()],
})
