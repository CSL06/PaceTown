import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end config.
 *
 * The unit and component suites are good at "this function returns the wrong
 * number". They cannot catch "the app is broken" — a bad route, a guard that
 * never releases, a loading screen that never finishes. This suite walks the
 * paths a person actually walks, and nothing else.
 *
 * It runs against the production build, not the dev server. That was a
 * deliberate change: Vite's dev server is single-threaded, so parallel workers
 * queue behind one another on the 2.6 MB campus fetch, and the resulting
 * timing pressure produced failures that looked like app bugs and were not.
 * The preview server handles concurrency, is faster, and tests what ships.
 */
export default defineConfig({
  testDir: './e2e',
  // Every spec starts from a clean browser profile, so localStorage from one
  // journey can never decide the outcome of another.
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  /* Capped deliberately. One Node process serves ~13 MB of artwork, and at
     full worker count it stalls badly enough that the app's own timers drift —
     which surfaced as failures that looked like app bugs and were not. Two
     workers is stable and still parallel. */
  workers: process.env.CI ? 1 : 2,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],

  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // The game claims to work on a phone; that claim should be tested.
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],

  webServer: {
    command: 'npm run build && npm run preview -- --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
