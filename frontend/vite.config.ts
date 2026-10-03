import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const railwayHost = 'car-price-prediction-ai-production-2b3.up.railway.app'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    allowedHosts: [railwayHost],

    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },

  preview: {
    host: '0.0.0.0',
    allowedHosts: [railwayHost],
  },
})
