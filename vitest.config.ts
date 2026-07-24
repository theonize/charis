import { defineConfig } from 'vitest/config'

// Vitest covers the translation tooling only; the React app's tests run via
// `npm run app:test` (react-scripts/jest).
export default defineConfig({
  test: {
    include: ['tool/**/*.test.ts', 'scripts/**/*.test.ts'],
  },
})
