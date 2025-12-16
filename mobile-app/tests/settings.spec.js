import { test, expect } from "@playwright/test";

test.describe("Settings inputs", () => {
  const seedState = async (page) => {
    await page.addInitScript(() => {
      // Clear sessionStorage to prevent forced onboarding
      sessionStorage.clear();
      const existing = localStorage.getItem("lotriflow_quit_state");
      if (!existing) {
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
      }

      // Polyfill Capacitor Preferences and LocalNotifications plugin to use localStorage in tests
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

  const openSettings = async (page) => {
    await page.getByRole("button", { name: "Settings" }).click();
    await expect(page.locator("#settingsPanel")).toHaveClass(/open/);
  };

  const openCostAccordion = async (page) => {
    const header = page.locator("#costAccordion .accordion-header");
    await header.click();
    await expect(page.locator("#costAccordion .accordion-body")).toBeVisible();
  };

  test("edit pack price and cigs per pack", async ({ page }) => {
    await seedState(page);
    await page.goto("/");

    await openSettings(page);
    await openCostAccordion(page);

    const packPrice = page.locator("#packPriceInput");
    const cigsPerPack = page.locator("#cigsPerPackInput");

    await expect(packPrice).toBeVisible();
    await expect(cigsPerPack).toBeVisible();

    await packPrice.fill("9.5");
    await cigsPerPack.fill("22");

    // Wait for debounce save
    await page.waitForTimeout(800);

    await expect(packPrice).toHaveValue("9.5");
    await expect(cigsPerPack).toHaveValue("22");
  });

  test("settings persist across reload", async ({ page }) => {
    await seedState(page);
    await page.goto("/");

    await openSettings(page);
    await openCostAccordion(page);
    const packPrice = page.locator("#packPriceInput");
    const cigsPerPack = page.locator("#cigsPerPackInput");
    await packPrice.fill("11.25");
    await cigsPerPack.fill("18");
    await cigsPerPack.blur(); // trigger change
    await page.waitForTimeout(1200); // debounce save

    // Reload the app
    await page.reload();

    // Reopen settings and verify persistence
    await openSettings(page);
    await openCostAccordion(page);
    await expect(packPrice).toHaveValue("11.25");
    await expect(cigsPerPack).toHaveValue("18");
  });
});
