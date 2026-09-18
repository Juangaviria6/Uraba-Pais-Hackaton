import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // El shell de la app (html/js/css/iconos) se precachea para que la
      // pagina abra aunque no haya conexion en el momento de entrar. Nunca
      // se debe interceptar /api/* aqui: esos datos ya los maneja la capa de
      // cache/sincronizacion propia (ver src/lib/offlineStore.ts).
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      manifest: {
        name: 'Urabá País',
        short_name: 'Urabá País',
        description: 'Registro de beneficiarios, programas, atenciones y seguimientos',
        start_url: '/beneficiarios',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1d4e89',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
