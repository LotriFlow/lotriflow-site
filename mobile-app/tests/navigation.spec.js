import { test, expect } from "@playwright/test";

const seedState = async (page) => {
  await page.addInitScript(() => {
    // Clear sessionStorage to prevent forced onboarding
    sessionStorage.clear();
    localStorage.setItem(
      "lotriflow_quit_state",
      JSON.stringify({
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
      })
    );
    // Polyfill Capacitor Preferences plugin to use localStorage in tests
    window.Capacitor = window.Capacitor || {};
    window.Capacitor.isPluginAvailable = (name) =>
      name === "Preferences" || name === "LocalNotifications";
    window.Capacitor.Plugins = window.Capacitor.Plugins || {};
    window.Capacitor.Plugins.Preferences = {
      get: async ({ key }) => ({ value: localStorage.getItem(key) }),
      set: async ({ key, value }) => localStorage.setItem(key, value),
      remove: async ({ key }) => localStorage.removeItem(key),
      keys: async () => ({ keys: Object.keys(localStorage) }),
      clear: async () => localStorage.clear(),
    };
    window.Capacitor.Plugins.LocalNotifications = {
      requestPermissions: async () => ({ display: "granted" }),
      schedule: async () => {},
      cancel: async () => {},
      removeAll: async () => {},
    };
    // Mock ProAccess for testing
    window.ProAccess = {
      hasAccess: () => true,
      isProActive: true,
    };
    // Add pro-active class to body for pro features
    document.body.classList.add('pro-active');
    // Remove locked class from pro features
    document.querySelectorAll('.locked').forEach(el => el.classList.remove('locked'));
  });
};

test("switch between Coach and Health sections", async ({ page }) => {
  await seedState(page);
  await page.goto("/");

  // Coach tab
  await page.getByRole("button", { name: "Coach" }).click();
  await expect(page.locator("#coachSection")).toHaveClass(/active/);
  await expect(page.locator("#milestonesSection")).not.toHaveClass(/active/);

  // Health tab
  await page.getByRole("button", { name: "Health" }).click();
  await expect(page.locator("#milestonesSection")).toHaveClass(/active/);
  await expect(page.locator("#coachSection")).not.toHaveClass(/active/);
});
