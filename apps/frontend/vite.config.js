import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 🌐 Configuration du Proxy (Dev + Preview)
// Force IPv4 (127.0.0.1) pour contourner les conflits DNS IPv6 sur Raspberry Pi
const proxyConfig = {
  '/api': {
    target: 'http://127.0.0.1:3000',
    changeOrigin: true,
    secure: false,
    configure: (proxy, _options) => {
      proxy.on('error', (err, _req, _res) => {
        console.log('proxy error', err);
      });
      proxy.on('proxyReq', (proxyReq, req, _res) => {
        console.log('Sending Request to the Target:', req.method, req.url);
      });
    }
  }
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: proxyConfig,
    allowedHosts: true  // Permet l'accès via tunnels Cloudflare
  },
  preview: {
    host: true,
    port: 5173,
    proxy: proxyConfig,
    allowedHosts: true  // Permet l'accès via tunnels Cloudflare
  }
})
