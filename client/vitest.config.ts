import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

/**
 * Отдельный конфиг для тестов, а не блок в vite.config.ts.
 *
 * Сборка витрины поднимает tanstackStart и остальные плагины: в тестах они не
 * нужны и только замедляют запуск. Здесь остаётся один плагин — разбор путей
 * вида `#/shared/...`, без него импорты в тестах не находятся.
 */
export default defineConfig({
  plugins: [tsconfigPaths({ projects: ['./tsconfig.json'] })],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
