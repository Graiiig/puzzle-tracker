import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const isCapacitor = process.env.CAPACITOR_BUILD === '1';

export default defineConfig({
  base: isCapacitor ? '/' : '/puzzle-tracker/',
  // The admin page is a separate static entry, left out of the Capacitor
  // (Android) build so it never ships inside the app bundle — it's only
  // ever served from GitHub Pages, gated by the championships RLS policy.
  build: isCapacitor
    ? undefined
    : {
        rollupOptions: {
          input: {
            main: fileURLToPath(new URL('./index.html', import.meta.url)),
            admin: fileURLToPath(new URL('./admin.html', import.meta.url)),
          },
        },
      },
  plugins: [
    react(),
    ...(isCapacitor
      ? []
      : [
          VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['apple-touch-icon.png'],
            manifest: {
              name: 'Mes Puzzles',
              short_name: 'Puzzles',
              description: 'Suivi de collection de puzzles : collection, wishlist, photos.',
              lang: 'fr',
              start_url: '/puzzle-tracker/',
              scope: '/puzzle-tracker/',
              display: 'standalone',
              orientation: 'portrait',
              background_color: '#fdf1e7',
              theme_color: '#df579e',
              icons: [
                { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
                { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
                { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
              ],
            },
          }),
        ]),
  ],
});
