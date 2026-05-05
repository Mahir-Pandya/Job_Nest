import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/__tests__/e2e",
  fullyParallel: false, // run sequentially to avoid DB state conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],

  use: {
    baseURL: "http://localhost:3000",
    // Record traces on first retry so you can inspect failures
    trace: "on-first-retry",
    // Keep screenshots on failure
    screenshot: "only-on-failure",
    // Reasonable timeout per action
    actionTimeout: 10_000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // The dev server is already running via `npm run dev`, so we don't webServer here.
  // If you want Playwright to start it automatically, uncomment:
  // webServer: {
  //   command: "npm run dev",
  //   url: "http://localhost:3000",
  //   reuseExistingServer: true,
  // },
});
