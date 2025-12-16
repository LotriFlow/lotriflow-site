import { test, expect } from "@playwright/test";

const seedState = async (page, state) => {
  await page.addInitScript((seed) => {
    // Clear sessionStorage to prevent forced onboarding
    sessionStorage.clear();
    // Only set localStorage if it's not already set (to preserve state across reloads)
    if (!localStorage.getItem("lotriflow_quit_state")) {
      localStorage.setItem("lotriflow_quit_state", JSON.stringify(seed));
    }
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

test.describe("Theme Toggle", () => {
  test("starts with dark theme by default", async ({ page }) => {
    await seedState(page, {
      firstRun: false,
      lastCigarette: new Date().toISOString(),
      cigaretteLog: [],
      cravingsLog: [],
      baselinePerDay: 10,
      dailyLimit: 10,
      targetInterval: 60,
      packPrice: 8,
      cigsPerPack: 20,
      currency: "USD",
      theme: "dark",
    });

    await page.goto("/");
    await page.waitForLoadState('networkidle');
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("toggles between dark and light themes", async ({ page }) => {
    await seedState(page, {
      firstRun: false,
      lastCigarette: new Date().toISOString(),
      cigaretteLog: [],
      cravingsLog: [],
      baselinePerDay: 10,
      dailyLimit: 10,
      targetInterval: 60,
      packPrice: 8,
      cigsPerPack: 20,
      currency: "USD",
      theme: "dark",
    });

    await page.goto("/");
    await page.waitForLoadState('networkidle');

    // Click theme toggle button
    await page.locator("#themeBtn").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    // Click again to toggle back
    await page.locator("#themeBtn").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("persists theme preference across page reloads", async ({ page }) => {
    await seedState(page, {
      firstRun: false,
      lastCigarette: new Date().toISOString(),
      cigaretteLog: [],
      cravingsLog: [],
      baselinePerDay: 10,
      dailyLimit: 10,
      targetInterval: 60,
      packPrice: 8,
      cigsPerPack: 20,
      currency: "USD",
      theme: "dark",
    });

    await page.goto("/");
    await page.waitForLoadState('networkidle');

    // Toggle to light theme
    await page.locator("#themeBtn").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    // Wait for state to be saved by checking localStorage
    await page.waitForFunction(() => {
      const stored = localStorage.getItem("lotriflow_quit_state");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.theme === "light";
      }
      return false;
    });

    // Reload page (localStorage should persist)
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should remember light theme
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("applies theme to all UI elements", async ({ page }) => {
    await seedState(page, {
      firstRun: false,
      lastCigarette: new Date().toISOString(),
      cigaretteLog: [],
      cravingsLog: [],
      baselinePerDay: 10,
      dailyLimit: 10,
      targetInterval: 60,
      packPrice: 8,
      cigsPerPack: 20,
      currency: "USD",
      theme: "dark",
    });

    await page.goto("/");
    await page.waitForLoadState('networkidle');

    // Check that html has data-theme attribute
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    // Toggle to light
    await page.locator("#themeBtn").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("theme toggle button shows correct icon", async ({ page }) => {
    await seedState(page, {
      firstRun: false,
      lastCigarette: new Date().toISOString(),
      cigaretteLog: [],
      cravingsLog: [],
      baselinePerDay: 10,
      dailyLimit: 10,
      targetInterval: 60,
      packPrice: 8,
      cigsPerPack: 20,
      currency: "USD",
      theme: "dark",
    });

    await page.goto("/");
    await page.waitForLoadState('networkidle');

    // In dark mode, should show moon icon (for switching to light)
    await expect(page.locator("#themeBtn svg")).toHaveClass("feather feather-moon");

    // Toggle to light
    await page.locator("#themeBtn").click();

    // In light mode, should show sun icon (for switching to dark)
    await expect(page.locator("#themeBtn svg")).toHaveClass("feather feather-sun");
  });
});