import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // auto-register the service worker and keep it up to date
      injectRegister: 'auto',
      registerType: 'autoUpdate',

      // show SW in dev so you can test quickly (optional; remove later)
      devOptions: { enabled: true },

      workbox: {
        // cache all the usual static assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2,json}'],
        navigateFallback: 'index.html', // SPA fallback for deep links
      },

      manifest: {
        name: 'Klocking',
        short_name: 'Klocking',
        description: 'A peaceful local time tracker',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#4f46e5',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ],
})