import { defineConfig } from "@playwright/test";

const port = process.env.PLAYWRIGHT_PORT || 3000;
const host = process.env.PLAYWRIGHT_HOST || "127.0.0.1";
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL || `http://${host}:${port}`;
const startServer = process.env.PLAYWRIGHT_NO_SERVER !== "1";

export default defineConfig({
  testDir: "tests",
  timeout: 30_000,
  use: {
    baseURL,
    headless: true,
  },
  webServer: startServer
    ? {
        command:
          process.env.PLAYWRIGHT_START_SERVER ||
          `python3 -m http.server ${port} -d dist --bind ${host}`,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      }
    : undefined,
});
