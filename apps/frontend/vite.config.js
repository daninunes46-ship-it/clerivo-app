import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // 🌐 Proxy pour rediriger /api vers le backend local
    // Permet l'accès mobile via tunnel (clerivo.ch)
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path // Garde /api dans l'URL
      }
    }
  },
})
