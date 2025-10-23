import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa' // 👈 Add this import

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 👇 Add the VitePWA plugin with its configuration
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'AI Career Copilot',
        short_name: 'Career Copilot',
        description: 'An AI-powered suite of tools to assist with your job application process, including CV generation, cover letters, and outreach messages.',
        theme_color: '#0f172a', // Corresponds to your dark-bg color
        background_color: '#0f172a',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    })
  ],
})