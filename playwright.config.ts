import {defineConfig, devices} from '@playwright/test'

const PORT = 4173

/**
 * End-to-end tests against the built docs: the examples are real compositions of the kit, server-rendered and
 * hydrated the way a consumer's app is.
 *
 *   npm run test:e2e
 *
 * Locally a docs preview already running on the port is reused — rebuild it after changing the kit.
 */
export default defineConfig({
  testDir: 'e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', {open: 'never'}]] : 'list',

  use: {
    baseURL: `http://localhost:${ PORT }/eco-vue-js/`,
    trace: 'on-first-retry',
  },

  // WebKit too: scroll and layout fixes are often Safari-only.
  projects: [
    {name: 'chromium', use: devices['Desktop Chrome']},
    {name: 'webkit', use: devices['Desktop Safari']},
  ],

  webServer: {
    // Not docs:build: its stale-API check and release notes are not what these tests are about.
    command: `vitepress build docs && vitepress preview docs --port ${ PORT }`,
    url: `http://localhost:${ PORT }/eco-vue-js/`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
