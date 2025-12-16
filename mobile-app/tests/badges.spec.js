import { test, expect } from "@playwright/test";

const seedState = async (page, state) => {
  await page.addInitScript((seed) => {
    // Clear sessionStorage to prevent forced onboarding
    sessionStorage.clear();
    localStorage.setItem("lotriflow_quit_state", JSON.stringify(seed));
    // Polyfill Capacitor Preferences plugin to use localStorage in tests
    window.Capacitor = window.Capacitor || {};
    window.Capacitor.isPluginAvailable = (name) => name === "Preferences";
    window.Capacitor.Plugins = window.Capacitor.Plugins || {};
    window.Capacitor.Plugins.Preferences = {
      get: async ({ key }) => ({ value: localStorage.getItem(key) }),
      set: async ({ key, value }) => localStorage.setItem(key, value),
      remove: async ({ key }) => localStorage.removeItem(key),
      keys: async () => ({ keys: Object.keys(localStorage) }),
      clear: async () => localStorage.clear(),
    };
  }, state);
};

test.describe("Achievement Badges", () => {
  test("unlocks first hour badge after 1 hour smoke-free", async ({ page }) => {
    const oneHourAgo = new Date(Date.now() - 3600 * 1000).toISOString();
    await seedState(page, {
      firstRun: false,
      lastCigarette: oneHourAgo,
      cigaretteLog: [],
      cravingsLog: [],
      baselinePerDay: 10,
      dailyLimit: 10,
      targetInterval: 60,
      packPrice: 8,
      cigsPerPack: 20,
      currency: "USD",
      achievements: {},
    });

    await page.goto("/");
    await page.evaluate(() => window.showSection('achievements'));

    // Check if first hour badge is unlocked
    await expect(page.locator('.achievement:has-text("First Hour")')).toHaveClass(/unlocked/);
  });

  test("unlocks first day badge after 24 hours smoke-free", async ({ page }) => {
    const oneDayAgo = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    await seedState(page, {
      firstRun: false,
      lastCigarette: oneDayAgo,
      cigaretteLog: [],
      cravingsLog: [],
      baselinePerDay: 10,
      dailyLimit: 10,
      targetInterval: 60,
      packPrice: 8,
      cigsPerPack: 20,
      currency: "USD",
      achievements: {},
    });

    await page.goto("/");
    await page.evaluate(() => window.showSection('achievements'));

    await expect(page.locator('.achievement:has-text("Day One")')).toHaveClass(/unlocked/);
  });

  test("unlocks money saved badges based on savings", async ({ page }) => {
    const oneDayAgo = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    await seedState(page, {
      firstRun: false,
      lastCigarette: oneDayAgo,
      cigaretteLog: [], // No cigarettes smoked, so avoided = baseline
      cravingsLog: [],
      baselinePerDay: 30, // 30/day = 30 avoided * $0.40 = $12 saved (> $10)
      dailyLimit: 30,
      targetInterval: 60,
      packPrice: 8,
      cigsPerPack: 20, // $0.40 per cigarette
      currency: "USD",
      achievements: {},
    });

    await page.goto("/");
    await page.evaluate(() => window.showSection('achievements'));

    // Should have $12 saved, enough for $10 badge
    await expect(page.locator('.achievement:has-text("$10 Saved")')).toHaveClass(/unlocked/);
  });

  test("shows badge progress and next badge to unlock", async ({ page }) => {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    await seedState(page, {
      firstRun: false,
      lastCigarette: thirtyMinAgo,
      cigaretteLog: [],
      cravingsLog: [],
      baselinePerDay: 10,
      dailyLimit: 10,
      targetInterval: 60,
      packPrice: 8,
      cigsPerPack: 20,
      currency: "USD",
      achievements: {},
    });

    await page.goto("/");
    await page.evaluate(() => window.showSection('achievements'));

    // Should show progress towards first hour badge
    await expect(page.locator("#badgesUnlocked")).toContainText("0");
    await expect(page.locator("#badgesTotal")).toContainText(/\d+/);
    await expect(page.locator("#nextBadgeCard")).toBeVisible();
  });

  test("persists unlocked badges across sessions", async ({ page }) => {
    const oneHourAgo = new Date(Date.now() - 3600 * 1000).toISOString();
    await seedState(page, {
      firstRun: false,
      lastCigarette: oneHourAgo,
      cigaretteLog: [],
      cravingsLog: [],
      baselinePerDay: 10,
      dailyLimit: 10,
      targetInterval: 60,
      packPrice: 8,
      cigsPerPack: 20,
      currency: "USD",
      achievements: { first_hour: true },
    });

    await page.goto("/");
    await page.evaluate(() => window.showSection('achievements'));

    await expect(page.locator('.achievement:has-text("First Hour")')).toHaveClass(/unlocked/);
    await expect(page.locator("#badgesUnlocked")).toContainText("1");
  });
});