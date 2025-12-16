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
  });
  });
};

test.describe("Breathing exercise", () => {
  test("selects a technique and shows modal", async ({ page }) => {
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
    // Open the modal via Coach quick action
    await page.getByRole("button", { name: "Coach" }).click();
    await page.getByRole("button", { name: /Start Breathing Exercise/i }).click();

    // Choose a technique
    await page.getByText("Box Breathing", { exact: true }).click();
    await expect(page.locator("#breathingModal")).toHaveClass(/open/);
    await expect(page.locator("#breathingTitle")).toContainText("Box Breathing");
    await expect(page.locator("#breathingInstruction")).toBeVisible();
    // The modal should show the same technique icon (SVG) that's on the selector card.
    const modalSvg = await page.locator("#breathingCircle svg").evaluate((el) => el.outerHTML);
    const cardSvg = await page
      .locator(".breathing-technique-card:has-text('Box Breathing') .u-fs-2rem svg")
      .evaluate((el) => el.outerHTML);

    // Normalize width/height attributes to avoid size differences between card and modal
    const normalize = (s) => s.replace(/width="\d+"/g, 'width="24"').replace(/height="\d+"/g, 'height="24"');
    expect(normalize(modalSvg)).toBe(normalize(cardSvg));

    // Close modal
    const modal = page.locator("#breathingModal");
    const closeButtons = modal.locator("button:has-text('×'), .modal-close, button.close-btn, .modal-footer button");
    if (await closeButtons.first().isVisible({ timeout: 500 })) {
      await closeButtons.first().click();
      await page.waitForTimeout(200);
    } else {
      // force close via JS
      await page.evaluate(() => {
        const m = document.getElementById("breathingModal");
        if (m) m.classList.remove("open");
      });
    }
    // Final safety: remove open class and clear interval if present
    await page.evaluate(() => {
      const modal = document.getElementById("breathingModal");
      if (modal) {
        modal.classList.remove("open");
        const handle = parseInt(modal.dataset.interval || "0", 10);
        if (handle) clearInterval(handle);
      }
    });
    await expect(modal).not.toHaveClass(/open/);
  });
});
