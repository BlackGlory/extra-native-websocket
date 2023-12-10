import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths()
  ]
  // @ts-ignore
, test: {
    environment: 'jsdom'
  , poolOptions: {
      threads: {
        singleThread: true
      }
    }
  }
})
