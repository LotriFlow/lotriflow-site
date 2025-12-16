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
        cigaretteLog: [],
        cravingsLog: [],
        baselinePerDay: 10,
        dailyLimit: 10,
        targetInterval: 60,
        packPrice: 8,
        cigsPerPack: 20,
        currency: "USD",
      })
    );
    // Override Pro locks for tests
    window.ProAccess = {
      hasAccess: () => true,
      requirePro: () => true,
      isProActive: true,
      isInTrial: false,
      updateUI: () => {},
    };
    document.addEventListener("DOMContentLoaded", () => {
      document.body.classList.add("pro-active");
      document.querySelectorAll(".pro-feature").forEach((el) => {
        el.classList.remove("locked");
      });
    });
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
  });
};

test.describe("Cravings", () => {
  test.beforeEach(async ({ page }) => {
    await seedState(page);
    await page.goto("/");
    // Force Pro unlocked and remove any locks
    await page.evaluate(() => {
      window.ProAccess = {
        hasAccess: () => true,
        requirePro: () => true,
        isProActive: true,
        isInTrial: false,
        updateUI: () => {},
      };
      document.body.classList.add("pro-active");
      document.querySelectorAll(".pro-feature").forEach((el) => {
        el.classList.remove("locked");
      });
    });
    // Navigate directly to cravings to avoid overlays
    await page.evaluate(() => window.showSection && window.showSection("cravings"));
  });

  test("log a craving manually", async ({ page }) => {
    await page.locator("#cravingTriggerInput").fill("Stress");
    await page.locator("#cravingNotesInput").fill("Felt uneasy, drank water");
    await page.getByRole("button", { name: "+ Log craving" }).click();

    await expect(page.locator(".cravings-list .craving-card").first()).toContainText("Stress");
    await expect(page.locator(".cravings-list .craving-card").first()).toContainText("Felt uneasy");
  });

  test("quick chip logs a craving", async ({ page }) => {
    await page.getByText("Boredom", { exact: true }).click();
    await expect(page.locator(".cravings-list .craving-card").first()).toContainText("Boredom");
  });

  test("can delete cravings", async ({ page }) => {
    // Log multiple cravings
    await page.locator("#cravingTriggerInput").fill("Stress 1");
    await page.getByRole("button", { name: "+ Log craving" }).click();
    
    await page.locator("#cravingTriggerInput").fill("Stress 2");
    await page.getByRole("button", { name: "+ Log craving" }).click();
    
    await page.locator("#cravingTriggerInput").fill("Stress 3");
    await page.getByRole("button", { name: "+ Log craving" }).click();

    // Should have 3 cravings
    await expect(page.locator(".cravings-list .craving-card")).toHaveCount(3);

    // Get the IDs of the cravings from the DOM
    const deleteButtons = await page.locator(".craving-delete").all();
    const firstId = await deleteButtons[0].getAttribute("data-id");
    const secondId = await deleteButtons[1].getAttribute("data-id");

    // Delete cravings by calling the function directly (avoids DOM detachment issues)
    await page.evaluate((id) => window.deleteCraving(id), firstId);
    await page.waitForTimeout(50); // Allow DOM to update
    
    // Should have 2 cravings left
    await expect(page.locator(".cravings-list .craving-card")).toHaveCount(2);
    await expect(page.locator('.craving-card').first()).toContainText("Stress 2");

    // Delete another craving
    await page.evaluate((id) => window.deleteCraving(id), secondId);
    await page.waitForTimeout(50); // Allow DOM to update
    
    // Should have 1 craving left
    await expect(page.locator(".cravings-list .craving-card")).toHaveCount(1);
    await expect(page.locator('.craving-card').first()).toContainText("Stress 1");
  });

  test("can delete cravings by clicking UI buttons", async ({ page }) => {
    // Log multiple cravings
    await page.locator("#cravingTriggerInput").fill("UI Test 1");
    await page.getByRole("button", { name: "+ Log craving" }).click();
    
    await page.locator("#cravingTriggerInput").fill("UI Test 2");
    await page.getByRole("button", { name: "+ Log craving" }).click();
    
    await page.locator("#cravingTriggerInput").fill("UI Test 3");
    await page.getByRole("button", { name: "+ Log craving" }).click();

    // Should have 3 cravings
    await expect(page.locator(".cravings-list .craving-card")).toHaveCount(3);

    // Get the data-id of the first delete button before clicking
    const firstDeleteId = await page.locator('.craving-delete').first().getAttribute('data-id');
    
    // Use evaluate to trigger the click via the event handler instead of direct DOM click
    await page.evaluate((id) => {
      const button = document.querySelector(`.craving-delete[data-id="${id}"]`);
      if (button) {
        button.click();
      }
    }, firstDeleteId);
    
    // Wait for DOM update
    await page.waitForTimeout(300);
    
    // Should have 2 cravings left
    await expect(page.locator(".cravings-list .craving-card")).toHaveCount(2);
    await expect(page.locator('.craving-card').first()).toContainText("UI Test 2");

    // Get the data-id of the next delete button
    const secondDeleteId = await page.locator('.craving-delete').first().getAttribute('data-id');
    
    // Trigger click via evaluate again
    await page.evaluate((id) => {
      const button = document.querySelector(`.craving-delete[data-id="${id}"]`);
      if (button) {
        button.click();
      }
    }, secondDeleteId);
    
    await page.waitForTimeout(300);
    
    // Should have 1 craving left
    await expect(page.locator(".cravings-list .craving-card")).toHaveCount(1);
    await expect(page.locator('.craving-card').first()).toContainText("UI Test 1");
  });
});
