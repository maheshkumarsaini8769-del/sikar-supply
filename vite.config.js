import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'https://star-home-design-five.vercel.app',
        changeOrigin: true,
        secure: true,
      },
      '/uploads': {
        target: process.env.VITE_BACKEND_URL || 'https://star-home-design-five.vercel.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
  },
})
