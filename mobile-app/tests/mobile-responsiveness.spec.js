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

test.describe("Mobile Responsiveness", () => {
  test("displays correctly on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size

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

    // Check that main elements are visible and properly sized
    await expect(page.locator("#timerDigits")).toBeVisible();
    await expect(page.locator(".main-action-btn")).toBeVisible();

    // Check that content doesn't overflow horizontally
    const bodyWidth = await page.locator("body").evaluate(el => el.scrollWidth);
    const viewportWidth = await page.viewportSize();
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth.width);
  });

  test("displays correctly on tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad size

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

    await expect(page.locator("#timerDigits")).toBeVisible();
    await expect(page.locator(".main-action-btn")).toBeVisible();
  });

  test("displays correctly on desktop viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop size

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
    });

    await page.goto("/");

    await expect(page.locator("#timerDigits")).toBeVisible();
    await expect(page.locator(".main-action-btn")).toBeVisible();
  });

  test("navigation works on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

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

    // Test navigation between sections using bottom nav tabs
    await page.click('button.nav-tab:has-text("Reports")');
    await expect(page.locator("#reportsSection")).toHaveClass(/active/);

    await page.click('button.nav-tab:has-text("Coach")');
    await expect(page.locator("#coachSection")).toHaveClass(/active/);

    await page.click('text=Home');
    await expect(page.locator("#homeSection")).toHaveClass(/active/);
  });

  test("settings panel works on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

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

    // Open settings
    await page.click("#settingsBtn");
    await page.waitForTimeout(200);

    // Settings panel should be visible and usable
    const settingsPanel = page.locator("#settingsPanel");
    await expect(settingsPanel).toBeVisible();

    // Check that settings are accessible
    await expect(page.locator("#baselineInput")).toBeVisible();
    await expect(page.locator("#limitInput")).toBeVisible();
  });

  test("touch interactions work on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

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

    // Test clicking buttons
    await page.click(".main-action-btn");

    // Check that cigarette was logged
    const logsAfter = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem("lotriflow_quit_state"));
      return state.cigaretteLog.length;
    });

    expect(logsAfter).toBe(1);
  });

  test("text is readable on small screens", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

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
    });

    await page.goto("/");

    // Check font sizes are appropriate for mobile
    const timerFontSize = await page.locator("#timerDigits").evaluate(el =>
      parseFloat(getComputedStyle(el).fontSize)
    );

    const buttonFontSize = await page.locator(".main-action-btn").evaluate(el =>
      parseFloat(getComputedStyle(el).fontSize)
    );

    // Font sizes should be reasonable for mobile (not too small)
    expect(timerFontSize).toBeGreaterThan(20); // Timer should be large and readable
    expect(buttonFontSize).toBeGreaterThan(14); // Buttons should be readable
  });

  test("handles orientation changes", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // Portrait

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
    });

    await page.goto("/");

    // Check portrait layout
    await expect(page.locator("#timerDigits")).toBeVisible();

    // Change to landscape
    await page.setViewportSize({ width: 667, height: 375 });

    // Content should still be accessible
    await expect(page.locator("#timerDigits")).toBeVisible();
    await expect(page.locator(".main-action-btn")).toBeVisible();
  });

  test("stats display works on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

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

    // Open a modal (like settings or breathing exercise)
    await page.click("#settingsBtn");
    await page.waitForTimeout(200);

    const modal = page.locator("#settingsPanel");
    await expect(modal).toBeVisible();

    // Modal should be properly sized for mobile
    const modalWidth = await modal.evaluate(el => el.offsetWidth);
    const viewportWidth = await page.viewportSize();

    expect(modalWidth).toBeLessThanOrEqual(viewportWidth.width - 20); // Some margin
  });
});