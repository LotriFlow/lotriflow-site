import { test, expect } from "@playwright/test";

test("home renders and timer is visible", async ({ page }) => {
  // Seed state to bypass onboarding
  await page.addInitScript(() => {
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

  await page.goto("/");
  await expect(page.locator("#timerDigits")).toBeVisible();
  await expect(page.locator(".main-action-btn")).toBeVisible();
});
