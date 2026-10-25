import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // host: true lets phones on the same Wi-Fi open the dev server
  server: { host: true },
  preview: { host: true },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: "Let's learn English!",
        short_name: 'English',
        description: 'Giochi con audio per imparare l’inglese',
        lang: 'it',
        theme_color: '#ffd32a',
        background_color: '#fff7e6',
        display: 'standalone',
        icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
    }),
  ],
})
