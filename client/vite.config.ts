import { defineConfig, loadEnv } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import svgr from 'vite-plugin-svgr'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Под каким именем сервера отвечает `vite preview` (на сервере витрина
// работает через него). Vite отклоняет чужие имена (403 «Blocked request»),
// поэтому домен перечисляется в PREVIEW_ALLOWED_HOSTS через запятую.
const previewAllowedHosts = (loadEnv('production', process.cwd(), '').PREVIEW_ALLOWED_HOSTS || '')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean)

const config = defineConfig({
  preview: {
    allowedHosts: previewAllowedHosts,
  },
  server: {
    port: 3010,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:7002',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
      '/uploads': {
        target: 'http://127.0.0.1:7002',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    devtools(),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackStart({ srcDirectory: 'src/app' }),
    viteReact(),
    svgr(),
  ],
})

export default config
