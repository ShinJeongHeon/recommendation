import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '집밥 요리 추천',
        short_name: '집밥추천',
        description: '1인 가구를 위한 저녁 메뉴 추천 — 열고, 납득하고, 15분 안에 만든다',
        lang: 'ko',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2f855a',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
    }),
  ],
});
