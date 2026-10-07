import path from 'path'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // Путь, под которым открывается админка. На сервере она живёт на одном
  // домене с витриной — по адресу /admin/ (VITE_BASE_PATH=/admin/ в .env);
  // локально — в корне.
  base: loadEnv(mode, process.cwd(), '').VITE_BASE_PATH || '/',
  // Под каким именем сервера отвечает `vite preview` (на сервере админка
  // работает через него). Vite отклоняет чужие имена (403 «Blocked
  // request»), поэтому домен перечисляется в PREVIEW_ALLOWED_HOSTS через
  // запятую. localhost разрешён всегда.
  preview: {
    allowedHosts: (loadEnv(mode, process.cwd(), '').PREVIEW_ALLOWED_HOSTS || '')
      .split(',')
      .map((host) => host.trim())
      .filter(Boolean),
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3020,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:7002',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
}))
