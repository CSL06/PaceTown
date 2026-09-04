/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Browser-served assets live beside the rest of the asset library, but in
  // one deliberately small, documented runtime bundle. Public URLs remain
  // `/game/...`, `/icons/...`, and `/sw.js`.
  publicDir: 'assets/app-runtime-v1',
  test: {
    // The domain suite is pure and should stay fast, so node is the default.
    // Component tests opt into a DOM with a `@vitest-environment jsdom`
    // docblock at the top of the file.
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
})
