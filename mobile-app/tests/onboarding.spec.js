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

test.describe("Onboarding Flow", () => {
  test("shows onboarding for first-time users", async ({ page }) => {
    await seedState(page, {
      firstRun: true,
      cigaretteLog: [],
      cravingsLog: [],
    });

    await page.goto("/");
    await page.waitForLoadState('networkidle');
    await expect(page.locator("#onboardingModal")).toBeVisible();
    await expect(page.locator("#onboardingModal")).toContainText("Welcome to LotriFlow Quit");
  });

  test("skips onboarding for returning users", async ({ page }) => {
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
    await page.waitForLoadState('networkidle');
    await expect(page.locator("#onboardingModal")).not.toBeVisible();
    await expect(page.locator("#timerDigits")).toBeVisible();
  });

  test("completes onboarding with valid data", async ({ page }) => {
    await seedState(page, {
      firstRun: true,
      cigaretteLog: [],
      cravingsLog: [],
    });

    await page.goto("/");
    await page.waitForLoadState('networkidle');
    await expect(page.locator("#onboardingModal")).toBeVisible();

    // Navigate through wizard steps using direct function calls
    await page.evaluate(() => window.nextWizardStep(2));
    await page.fill("#setupDailySmokes", "20");
    await page.fill("#setupDailyLimit", "15");
    await page.fill("#setupInterval", "45");
    await page.evaluate(() => window.nextWizardStep(3));

    // Step 3: Goals
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const quitDateStr = tomorrow.toISOString().split('T')[0];
    await page.fill("#setupQuitDate", quitDateStr);
    await page.fill("#setupPackPrice", "7.50");
    await page.fill("#setupCigsPerPack", "25");
    await page.evaluate(() => window.nextWizardStep(4));

    // Step 4: Terms and complete
    await page.check("#agreeTerms");
    await page.check("#agreePrivacy");
    await page.evaluate(() => window.completeOnboarding());

    // Should hide modal and show main app
    await expect(page.locator("#onboardingModal")).not.toBeVisible();
    await expect(page.locator("#timerDigits")).toBeVisible();

    // Check that data was saved
    const savedState = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem("lotriflow_quit_state"));
    });

    expect(savedState.firstRun).toBe(false);
    expect(savedState.baselinePerDay).toBe(20);
    expect(savedState.dailyLimit).toBe(15);
    expect(savedState.targetInterval).toBe(45);
    expect(savedState.packPrice).toBe(7.5);
    expect(savedState.cigsPerPack).toBe(25);
  });

  test("validates onboarding input fields", async ({ page }) => {
    await seedState(page, {
      firstRun: true,
      cigaretteLog: [],
      cravingsLog: [],
    });

    await page.goto("/");
    await page.waitForLoadState('networkidle');
    await expect(page.locator("#onboardingModal")).toBeVisible();

    // Navigate to step 2
    await page.evaluate(() => window.nextWizardStep(2));

    // Try to set invalid values
    await page.fill("#setupDailySmokes", "0");
    await page.fill("#setupDailyLimit", "0");
    await page.fill("#setupInterval", "10"); // Below minimum
    await page.evaluate(() => window.nextWizardStep(3));

    // Should still be on step 2 (validation prevents progression)
    await expect(page.locator("#wizardStep2")).toHaveClass(/active/);

    // Set valid values and continue
    await page.fill("#setupDailySmokes", "10");
    await page.fill("#setupDailyLimit", "8");
    await page.fill("#setupInterval", "60");
    await page.evaluate(() => window.nextWizardStep(3));

    // Should move to step 3
    await expect(page.locator("#wizardStep3")).toHaveClass(/active/);
  });

  test("forces onboarding when no cigarette data exists", async ({ page }) => {
    await seedState(page, {
      firstRun: false, // Normally false
      cigaretteLog: [], // But no data
      cravingsLog: [],
      // No lastCigarette, no baseline, etc.
    });

    await page.goto("/");
    await page.waitForLoadState('networkidle');
    await expect(page.locator("#onboardingModal")).toBeVisible();
  });

  test("allows completing onboarding with minimum data", async ({ page }) => {
    await seedState(page, {
      firstRun: true,
      cigaretteLog: [],
      cravingsLog: [],
    });

    await page.goto("/");
    await page.waitForLoadState('networkidle');
    await expect(page.locator("#onboardingModal")).toBeVisible();

    // Navigate through wizard with minimal input
    await page.evaluate(() => window.nextWizardStep(2));
    await page.evaluate(() => window.nextWizardStep(3));
    await page.evaluate(() => window.nextWizardStep(4));
    await page.check("#agreeTerms");
    await page.check("#agreePrivacy");
    await page.evaluate(() => window.completeOnboarding());

    // Should complete successfully
    await expect(page.locator("#onboardingModal")).not.toBeVisible();
    await expect(page.locator("#timerDigits")).toBeVisible();
  });
});