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
    // Mock ProAccess for tests
    window.ProAccess = {
      hasAccess: () => true,
      requirePro: () => true,
      isProActive: true,
      isInTrial: false,
      updateUI: () => {},
    };
    // Hook into DOMContentLoaded to set the app as pro-active
    document.addEventListener("DOMContentLoaded", () => {
      document.body.classList.add("pro-active");
      document.querySelectorAll(".pro-feature").forEach((el) => {
        el.classList.remove("locked");
      });
    });
  }, state);
};

test.describe("Error Handling", () => {
  test("handles invalid cigarette log data gracefully", async ({ page }) => {
    await seedState(page, {
      firstRun: false,
      lastCigarette: new Date().toISOString(),
      cigaretteLog: ["invalid-date", null, undefined, "2024-01-01T00:00:00Z"],
      cravingsLog: [],
      baselinePerDay: 10,
      dailyLimit: 10,
      targetInterval: 60,
      packPrice: 8,
      cigsPerPack: 20,
      currency: "USD",
    });

    await page.goto("/");

    // App should still load and show stats
    await expect(page.locator("#timerDigits")).toBeVisible();
    await expect(page.locator("#statsSection")).toContainText("smoked today");
  });

  test("handles negative values in settings", async ({ page }) => {
    await seedState(page, {
      firstRun: false,
      lastCigarette: new Date().toISOString(),
      cigaretteLog: [{ timestamp: new Date().toISOString(), count: 1 }],
      cravingsLog: [],
      baselinePerDay: -5,
      dailyLimit: -2,
      targetInterval: -30,
      packPrice: -8,
      cigsPerPack: -20,
      currency: "USD",
    });

    await page.goto("/");

    // App should handle negative values gracefully (probably defaults to 0 or positive)
    await expect(page.locator("#timerDigits")).toBeVisible();

    // Check that calculations don't break
    await page.click('button.nav-tab:has-text("Reports")');
    await expect(page.locator("#reportsSection")).toBeVisible();
  });

  test("handles extremely large values", async ({ page }) => {
    await seedState(page, {
      firstRun: false,
      lastCigarette: new Date().toISOString(),
      cigaretteLog: [{ timestamp: new Date().toISOString(), count: 1 }],
      cravingsLog: [],
      baselinePerDay: 10000,
      dailyLimit: 5000,
      targetInterval: 1000000, // Very long interval
      packPrice: 1000,
      cigsPerPack: 100000,
      currency: "USD",
    });

    await page.goto("/");

    // App should handle large values without crashing
    await expect(page.locator("#timerDigits")).toBeVisible();
  });

  test("handles corrupted localStorage data", async ({ page }) => {
    // Set corrupted JSON
    await page.addInitScript(() => {
      localStorage.setItem("lotriflow_quit_state", "{invalid json");
    });

    await page.goto("/");

    // App should fall back to defaults and show onboarding or main app
    await expect(page.locator("#timerDigits").or(page.locator("#onboardingModal"))).toBeVisible();
  });

  test("handles future dates in cigarette log", async ({ page }) => {
    const futureDate = new Date(Date.now() + 24 * 3600 * 1000).toISOString(); // Tomorrow
    await seedState(page, {
      firstRun: false,
      lastCigarette: new Date().toISOString(),
      cigaretteLog: [futureDate],
      cravingsLog: [],
      baselinePerDay: 10,
      dailyLimit: 10,
      targetInterval: 60,
      packPrice: 8,
      cigsPerPack: 20,
      currency: "USD",
    });

    await page.goto("/");

    // App should handle future dates gracefully
    await expect(page.locator("#timerDigits")).toBeVisible();
  });

  test("handles missing required state properties", async ({ page }) => {
    await seedState(page, {
      firstRun: false,
      // Missing lastCigarette, cigaretteLog, etc.
    });

    await page.goto("/");

    // App should initialize with defaults
    await expect(page.locator("#timerDigits")).toBeVisible();
  });

  test("handles storage quota exceeded", async ({ page }) => {
    // Mock storage quota exceeded error
    await page.addInitScript(() => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = function(key, value) {
        if (key === "lotriflow_quit_state" && value.length > 1000) {
          throw new Error("QuotaExceededError");
        }
        return originalSetItem.call(this, key, value);
      };
    });

    await seedState(page, {
      firstRun: false,
      lastCigarette: new Date().toISOString(),
      cigaretteLog: [{ timestamp: new Date().toISOString(), count: 1 }],
      cravingsLog: [],
      baselinePerDay: 10,
      dailyLimit: 10,
      targetInterval: 60,
      packPrice: 8,
      cigsPerPack: 20,
      currency: "USD",
    });

    await page.goto("/");

    // Add a lot of cigarette logs to trigger quota error
    for (let i = 0; i < 1000; i++) {
      await page.click(".main-action-btn");
      await page.waitForTimeout(10);
    }

    // App should handle the error gracefully (perhaps show a message)
    await expect(page.locator("#timerDigits")).toBeVisible();
  });

  test("handles invalid currency codes", async ({ page }) => {
    await seedState(page, {
      firstRun: false,
      lastCigarette: new Date().toISOString(),
      cigaretteLog: [{ timestamp: new Date().toISOString(), count: 1 }],
      cravingsLog: [],
      baselinePerDay: 10,
      dailyLimit: 10,
      targetInterval: 60,
      packPrice: 8,
      cigsPerPack: 20,
      currency: "INVALID",
    });

    await page.goto("/");

    // App should handle invalid currency gracefully
    await expect(page.locator("#timerDigits")).toBeVisible();
    await page.click('button.nav-tab:has-text("Reports")');
    await expect(page.locator("#reportsSection")).toBeVisible();
  });

  test("handles network errors during Capacitor operations", async ({ page }) => {
    await page.addInitScript(() => {
      // Mock Capacitor plugin errors
      window.Capacitor = window.Capacitor || {};
      window.Capacitor.isPluginAvailable = (name) => name === "Preferences";
      window.Capacitor.Plugins = window.Capacitor.Plugins || {};
      window.Capacitor.Plugins.Preferences = {
        get: async () => { throw new Error("Network error"); },
        set: async () => { throw new Error("Network error"); },
        remove: async () => { throw new Error("Network error"); },
        keys: async () => { throw new Error("Network error"); },
        clear: async () => { throw new Error("Network error"); },
      };
    });

    await seedState(page, {
      firstRun: false,
      lastCigarette: new Date().toISOString(),
      cigaretteLog: [{ timestamp: new Date().toISOString(), count: 1 }],
      cravingsLog: [],
      baselinePerDay: 10,
      dailyLimit: 10,
      targetInterval: 60,
      packPrice: 8,
      cigsPerPack: 20,
      currency: "USD",
    });

    await page.goto("/");

    // App should fall back to localStorage and work normally
    await expect(page.locator("#timerDigits")).toBeVisible();
  });
});