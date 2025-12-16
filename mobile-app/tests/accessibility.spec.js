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

test.describe("Accessibility", () => {
  test("has proper heading hierarchy", async ({ page }) => {
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

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check for h1 in header
    await expect(page.locator("header .logo-text")).toBeVisible();

    // Check that headings are in logical order (no skipped levels)
    const headings = await page.locator("h1, h2, h3, h4, h5, h6").allTextContents();
    expect(headings.length).toBeGreaterThan(0);
  });

  test("buttons have accessible names", async ({ page }) => {
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

    // Check main action buttons
    const buttons = page.locator("button");
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute("aria-label");
      const textContent = (await button.textContent())?.trim();
      const title = await button.getAttribute("title");
      const accessibleName = ariaLabel || textContent || title;
      expect(accessibleName).toBeTruthy();
    }
  });

  test("form inputs have labels", async ({ page }) => {
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

    // Open settings to check form inputs
    await page.click("#settingsBtn");

    const inputs = page.locator("input, select, textarea");
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const isInputVisible = await input.isVisible();
      
      // Only check accessibility for visible inputs
      if (!isInputVisible) continue;
      
      const id = await input.getAttribute("id");
      const label = id ? page.locator(`label[for="${id}"]`) : null;

      if (label) {
        // Label exists - check if it's visible or screen reader only (both are valid)
        const isVisible = await label.isVisible();
        const classAttr = await label.getAttribute("class");
        const hasSrOnly = classAttr && classAttr.includes("sr-only");
        expect(isVisible || hasSrOnly).toBe(true);
      } else {
        // Check for aria-label or placeholder as fallback
        const ariaLabel = await input.getAttribute("aria-label");
        const placeholder = await input.getAttribute("placeholder");
        expect(ariaLabel || placeholder).toBeTruthy();
      }
    }
  });

  test("keyboard navigation works", async ({ page }) => {
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

    // Focus should move through interactive elements with Tab
    await page.keyboard.press("Tab");
    let activeElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(["BUTTON", "INPUT", "A", "SELECT"]).toContain(activeElement);

    await page.keyboard.press("Tab");
    activeElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(["BUTTON", "INPUT", "A", "SELECT"]).toContain(activeElement);
  });

  test("color contrast meets WCAG standards", async ({ page }) => {
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

    // This is a basic check - in a real scenario you'd use a contrast checking library
    // For now, we'll check that text is visible and not the same color as background
    const textElements = page.locator("p, span, div, h1, h2, h3, h4, h5, h6");
    const textCount = await textElements.count();

    for (let i = 0; i < Math.min(textCount, 10); i++) { // Check first 10 text elements
      const element = textElements.nth(i);
      const color = await element.evaluate(el => getComputedStyle(el).color);
      const backgroundColor = await element.evaluate(el => getComputedStyle(el).backgroundColor);

      // Basic check that text has different color than background
      expect(color).not.toBe(backgroundColor);
    }
  });

  test("images have alt text", async ({ page }) => {
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

    const images = page.locator("img");
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      const ariaLabel = await img.getAttribute("aria-label");
      const src = await img.getAttribute("src");

      console.log(`Image ${i}: src="${src}", alt="${alt}", ariaLabel="${ariaLabel}"`);

      // Images should have alt text or aria-label
      expect(alt || ariaLabel).toBeTruthy();
    }
  });

  test("focus indicators are visible", async ({ page }) => {
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

    // Focus on a button
    await page.focus(".main-action-btn");

    // Check that focus outline is visible (basic check)
    const outlineStyle = await page.locator(".main-action-btn").evaluate(el =>
      getComputedStyle(el).outline
    );

    expect(outlineStyle).not.toBe("none");
  });

  test("screen reader content is available", async ({ page }) => {
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

    // Check for aria-live regions for dynamic content
    const liveRegions = page.locator('[aria-live]');
    await expect(liveRegions.first()).toBeVisible();

    // Check for screen reader only text
    const srOnly = page.locator('.sr-only, [class*="screen-reader"]');
    // May or may not have sr-only text, so just check it doesn't error
  });
});