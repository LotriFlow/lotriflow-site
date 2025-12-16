import { test, expect } from "@playwright/test";

test.describe("Behavior", () => {
  test("log button shows early state when interval not reached", async ({ page }) => {
    // Seed state: last cigarette just now, interval 60 minutes
    await page.addInitScript(() => {
      const now = new Date();
      localStorage.setItem(
        "lotriflow_quit_state",
        JSON.stringify({
          firstRun: false,
          lastCigarette: now.toISOString(),
          cigaretteLog: [{ timestamp: now.toISOString(), count: 1 }],
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
    await expect(
      page.getByRole("button", { name: /Log Cigarette \(Early\)/i })
    ).toBeVisible();
  });

  test("log button shows ready state when interval reached", async ({ page }) => {
    // Seed state: last cigarette over an hour ago
    await page.addInitScript(() => {
      const past = new Date(Date.now() - 90 * 60 * 1000); // 90 minutes ago
      localStorage.setItem(
        "lotriflow_quit_state",
        JSON.stringify({
          firstRun: false,
          lastCigarette: past.toISOString(),
          cigaretteLog: [{ timestamp: past.toISOString(), count: 1 }],
          cravingsLog: [],
          baselinePerDay: 10,
          dailyLimit: 10,
          targetInterval: 60,
          packPrice: 8,
          cigsPerPack: 20,
          currency: "USD",
        })
      );
    });

    await page.goto("/");
    await expect(
      page.getByRole("button", { name: /^Log Cigarette$/i })
    ).toBeVisible();
  });

  test("logging a cigarette resets timer to early state", async ({ page }) => {
    await page.addInitScript(() => {
      const past = new Date(Date.now() - 90 * 60 * 1000); // 90 minutes ago
      localStorage.setItem(
        "lotriflow_quit_state",
        JSON.stringify({
          firstRun: false,
          lastCigarette: past.toISOString(),
          cigaretteLog: [{ timestamp: past.toISOString(), count: 1 }],
          cravingsLog: [],
          baselinePerDay: 10,
          dailyLimit: 10,
          targetInterval: 60,
          packPrice: 8,
          cigsPerPack: 20,
          currency: "USD",
        })
      );
    });

    await page.goto("/");
    await page.getByRole("button", { name: /^Log Cigarette$/i }).click();
    await page.getByRole("button", { name: "Yes, I smoked" }).click();

    // After logging, button should show early state and timer should be near zero
    await expect(
      page.getByRole("button", { name: /Log Cigarette \(Early\)/i })
    ).toBeVisible();
    const secondsText = await page.locator("#seconds").textContent();
    expect(parseInt(secondsText || "99", 10)).toBeLessThanOrEqual(5);
  });

  test("shows interval complete message when target reached", async ({ page }) => {
    await page.addInitScript(() => {
      const past = new Date(Date.now() - 120 * 60 * 1000); // 2 hours ago
      localStorage.setItem(
        "lotriflow_quit_state",
        JSON.stringify({
          firstRun: false,
          lastCigarette: past.toISOString(),
          cigaretteLog: [{ timestamp: past.toISOString(), count: 1 }],
          cravingsLog: [],
          baselinePerDay: 10,
          dailyLimit: 10,
          targetInterval: 60,
          packPrice: 8,
          cigsPerPack: 20,
          currency: "USD",
        })
      );
    });

    await page.goto("/");
    await expect(page.locator("#timerSubtext")).toContainText(
      "Target interval complete"
    );
    await expect(
      page.getByRole("button", { name: /^Log Cigarette$/i })
    ).toBeVisible();
  });
});
