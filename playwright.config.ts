import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 * Enterprise-grade end-to-end testing for account-chaomarket.
 *
 * Usage:
 *   pnpm test:e2e          — Run all E2E tests
 *   pnpm test:e2e:ui       — Run with Playwright UI
 */
export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['html', { open: 'never' }],
        ['list'],
    ],
    use: {
        baseURL: 'http://localhost:2000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: {
        command: 'pnpm dev',
        url: 'http://localhost:2000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});
