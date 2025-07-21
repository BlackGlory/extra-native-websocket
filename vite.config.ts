import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    tsconfigPaths()
  ]
, test: {
    environment: 'jsdom'
  , poolOptions: {
      forks: {
        singleFork: true
      }
    }
  }
})
