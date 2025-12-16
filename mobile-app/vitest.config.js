import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Keep unit tests in src/__tests__, skip Playwright e2e and build artifacts
    exclude: [
      "tests/**",
      "node_modules/**",
      "dist/**",
      "android/**",
      "ios/**",
    ],
  },
});
