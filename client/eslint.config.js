import { tanstackConfig } from '@tanstack/eslint-config'
import { globalIgnores } from 'eslint/config'

export default [
  globalIgnores(['dist', 'src/shared/openapi/**']),
  { ignores: ['eslint.config.js'] },
  ...tanstackConfig.map((config) => {
    if (config.rules) {
      const downgraded = Object.fromEntries(
        Object.entries(config.rules).map(([rule, value]) => {
          if (Array.isArray(value)) {
            return [rule, ['warn', ...value.slice(1)]]
          }
          return [rule, value === 'error' || value === 2 ? 'warn' : value]
        }),
      )
      return { ...config, rules: downgraded }
    }
    return config
  }),
  {
    // Custom rules go here
  },
]
