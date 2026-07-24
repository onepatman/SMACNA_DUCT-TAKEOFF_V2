import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages serves this project from /SMACNA_DUCT-TAKEOFF_V2/, not the
// domain root, so assets/manifest need that prefix when built in CI.
const base = process.env.GITHUB_ACTIONS ? '/SMACNA_DUCT-TAKEOFF_V2/' : '/';

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'SMACNA Duct Material Takeoff',
        short_name: 'SMACNA Takeoff',
        description: 'SMACNA Rectangular Duct Material Takeoff calculator — offline-capable engineering tool.',
        theme_color: '#0f2942',
        background_color: '#f4f6f8',
        display: 'standalone',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      },
    }),
  ],
});
