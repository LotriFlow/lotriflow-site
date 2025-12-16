import { test, expect } from "@playwright/test";

const seedState = async (page, state) => {
  await page.addInitScript((seed) => {
    // Clear sessionStorage to prevent forced onboarding
    sessionStorage.clear();
    sessionStorage.setItem('hasCompletedOnboarding', 'true'); // Skip onboarding
    localStorage.setItem("lotriflow_quit_state", JSON.stringify(seed));

    // Unlock pro-gated UI for tests
    window.ProAccess = {
      hasAccess: () => true,
      requirePro: () => true,
      isProActive: true,
      isInTrial: false,
      updateUI: () => {},
      showUpgradeModal: () => {},
    };

    document.addEventListener("DOMContentLoaded", () => {
      document.body.classList.add("pro-active");
      document.querySelectorAll(".pro-feature").forEach((el) => {
        el.classList.remove("locked");
      });
      // Force close onboarding modal if it appears
      const onboarding = document.getElementById("onboardingModal");
      if (onboarding) {
        onboarding.classList.remove("open");
      }
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
    };
  }, state);
};

const validState = {
  quitDate: new Date("2024-01-01").toISOString(),
  lastCigarette: new Date("2024-01-01T12:00:00Z").toISOString(),
  targetInterval: 60,
  dailyLimit: 10,
  baselinePerDay: 15,
  packPrice: 10,
  cigsPerPack: 20,
  currency: "$",
  autoIncreaseAmount: 5,
  cigaretteLog: [
    new Date("2024-01-01T08:00:00Z").toISOString(),
    new Date("2024-01-01T10:00:00Z").toISOString(),
  ],
  cravingsLog: [
    { id: 1, trigger: "Coffee", notes: "Morning", createdAt: new Date("2024-01-01T09:00:00Z").toISOString() },
  ],
  totalAvoided: 50,
  streak: 5,
  achievements: { firstDay: true },
};

test.describe("Backup & Restore - Share Code Generation", () => {
  test("should generate valid share code", async ({ page }) => {
    await seedState(page, validState);
    await page.goto("/");

    // Open settings
    await page.click("#settingsBtn");
    await page.waitForSelector("#settingsPanel.open");

    // Click generate share code button
    await page.click('button:has-text("Generate Share Code")');

    // Wait for clipboard write (code is copied automatically)
    await page.waitForTimeout(500);

    // Get clipboard content
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

    // Verify code is base64 encoded
    expect(clipboardText).toBeTruthy();
    expect(clipboardText.length).toBeGreaterThan(0);

    // Verify code can be decoded
    const decoded = await page.evaluate((code) => {
      const data = JSON.parse(decodeURIComponent(atob(code)));
      return data;
    }, clipboardText);

    // Verify decoded data has expected structure (v3 compact format)
    expect(decoded.v).toBe(3);
    expect(decoded.ti).toBe(60); // targetInterval
    expect(decoded.dl).toBe(10); // dailyLimit
    expect(decoded.bp).toBe(15); // baselinePerDay
    expect(decoded.cl).toHaveLength(2); // cigaretteLog
    expect(decoded.cr).toHaveLength(1); // cravingsLog
  });

  test("should show success toast after generating code", async ({ page }) => {
    await seedState(page, validState);
    await page.goto("/");

    await page.click("#settingsBtn");
    await page.waitForSelector("#settingsPanel.open");

    await page.click('button:has-text("Generate Share Code")');

    // Verify success toast appears
    const toast = await page.locator(".toast").first();
    await expect(toast).toBeVisible();
    await expect(toast).toContainText("Share code copied");
  });
});

test.describe("Backup & Restore - Restore Modal UI", () => {
  test("should open restore modal with warning banner", async ({ page }) => {
    await seedState(page, validState);
    await page.goto("/");

    await page.click("#settingsBtn");
    await page.waitForSelector("#settingsPanel.open");

    await page.click('button:has-text("Restore from Code")');

    // Verify modal opens
    await expect(page.locator("#restoreModal")).toHaveClass(/open/);

    // Verify warning banner is present with Feather icon
    const warningBanner = page.locator("#restoreModal div").filter({ hasText: "Warning:" }).first();
    await expect(warningBanner).toBeVisible();

    // Verify Feather alert-triangle icon is present
    const warningIcon = warningBanner.locator("svg");
    await expect(warningIcon).toBeVisible();

    // Verify warning text
    await expect(warningBanner).toContainText("This will overwrite your current progress");
  });

  test("should have restore input field and buttons", async ({ page }) => {
    await seedState(page, validState);
    await page.goto("/");

    await page.click("#settingsBtn");
    await page.waitForSelector("#settingsPanel.open");
    await page.click('button:has-text("Restore from Code")');

    // Verify input field
    await expect(page.locator("#restoreCodeInput")).toBeVisible();

    // Verify Cancel button
    await expect(page.locator('#restoreModal button:has-text("Cancel")')).toBeVisible();

    // Verify Restore button
    await expect(page.locator('#restoreModal button:has-text("Restore")')).toBeVisible();
  });

  test("should close modal when Cancel is clicked", async ({ page }) => {
    await seedState(page, validState);
    await page.goto("/");

    await page.click("#settingsBtn");
    await page.waitForSelector("#settingsPanel.open");
    await page.click('button:has-text("Restore from Code")');

    await page.click('#restoreModal button:has-text("Cancel")');

    // Verify modal closes
    await expect(page.locator("#restoreModal")).not.toHaveClass(/open/);
  });
});

test.describe("Backup & Restore - Validation: Numeric Bounds", () => {
  test("should reject negative targetInterval and use fallback", async ({ page }) => {
    await seedState(page, validState);
    await page.goto("/");

    // Create malicious code with negative targetInterval
    const maliciousData = {
      v: 3,
      ti: -1, // Invalid: negative
      dl: 10,
      bp: 15,
    };
    const maliciousCode = await page.evaluate((data) => {
      return btoa(encodeURIComponent(JSON.stringify(data)));
    }, maliciousData);

    await page.click("#settingsBtn");
    await page.waitForSelector("#settingsPanel.open");
    await page.click('button:has-text("Restore from Code")');

    // Enter malicious code
    await page.fill("#restoreCodeInput", maliciousCode);
    await page.click('#restoreModal button:has-text("Restore")');

    // Wait for restore to complete
    await page.waitForTimeout(500);

    // Verify state uses fallback value (60) instead of -1
    const state = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem("lotriflow_quit_state"));
    });
    expect(state.targetInterval).toBe(60); // Fallback value
    expect(state.targetInterval).not.toBe(-1); // Rejected malicious value
  });

  test("should reject excessive dailyLimit and use fallback", async ({ page }) => {
    await seedState(page, validState);
    await page.goto("/");

    const maliciousData = {
      v: 3,
      ti: 60,
      dl: 99999, // Invalid: exceeds max (200)
      bp: 15,
    };
    const maliciousCode = await page.evaluate((data) => {
      return btoa(encodeURIComponent(JSON.stringify(data)));
    }, maliciousData);

    await page.click("#settingsBtn");
    await page.waitForSelector("#settingsPanel.open");
    await page.click('button:has-text("Restore from Code")');

    await page.fill("#restoreCodeInput", maliciousCode);
    await page.click('#restoreModal button:has-text("Restore")');
    await page.waitForTimeout(500);

    const state = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem("lotriflow_quit_state"));
    });
    expect(state.dailyLimit).toBe(10); // Fallback value
    expect(state.dailyLimit).not.toBe(99999);
  });

  test("should reject zero baselinePerDay and use fallback", async ({ page }) => {
    await seedState(page, validState);
    await page.goto("/");

    const maliciousData = {
      v: 3,
      ti: 60,
      dl: 10,
      bp: 0, // Invalid: must be >= 1
    };
    const maliciousCode = await page.evaluate((data) => {
      return btoa(encodeURIComponent(JSON.stringify(data)));
    }, maliciousData);

    await page.click("#settingsBtn");
    await page.waitForSelector("#settingsPanel.open");
    await page.click('button:has-text("Restore from Code")');

    await page.fill("#restoreCodeInput", maliciousCode);
    await page.click('#restoreModal button:has-text("Restore")');
    await page.waitForTimeout(500);

    const state = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem("lotriflow_quit_state"));
    });
    expect(state.baselinePerDay).toBeGreaterThanOrEqual(1);
    expect(state.baselinePerDay).not.toBe(0);
  });

  test("should reject negative packPrice and use fallback", async ({ page }) => {
    await seedState(page, validState);
    await page.goto("/");

    const maliciousData = {
      v: 3,
      ti: 60,
      dl: 10,
      bp: 15,
      pp: -100, // Invalid: negative
    };
    const maliciousCode = await page.evaluate((data) => {
      return btoa(encodeURIComponent(JSON.stringify(data)));
    }, maliciousData);

    await page.click("#settingsBtn");
    await page.waitForSelector("#settingsPanel.open");
    await page.click('button:has-text("Restore from Code")');

    await page.fill("#restoreCodeInput", maliciousCode);
    await page.click('#restoreModal button:has-text("Restore")');
    await page.waitForTimeout(500);

    const state = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem("lotriflow_quit_state"));
    });
    expect(state.packPrice).toBeGreaterThanOrEqual(0);
    expect(state.packPrice).not.toBe(-100);
  });

  test("should reject NaN values and use fallback", async ({ page }) => {
    await seedState(page, validState);
    await page.goto("/");

    const maliciousData = {
      v: 3,
      ti: NaN,
      dl: "not a number",
      bp: undefined,
    };
    const maliciousCode = await page.evaluate((data) => {
      return btoa(encodeURIComponent(JSON.stringify(data)));
    }, maliciousData);

    await page.click("#settingsBtn");
    await page.waitForSelector("#settingsPanel.open");
    await page.click('button:has-text("Restore from Code")');

    await page.fill("#restoreCodeInput", maliciousCode);
    await page.click('#restoreModal button:has-text("Restore")');
    await page.waitForTimeout(500);

    const state = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem("lotriflow_quit_state"));
    });

    // All should fall back to valid defaults
    expect(Number.isNaN(state.targetInterval)).toBe(false);
    expect(Number.isNaN(state.dailyLimit)).toBe(false);
    expect(Number.isNaN(state.baselinePerDay)).toBe(false);
  });
});

test.describe("Backup & Restore - Validation: Date Validation", () => {
  test("should reject future dates", async ({ page }) => {
    await seedState(page, validState);
    await page.goto("/");

    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    const maliciousData = {
      v: 3,
      lc: futureDate.toISOString(), // Invalid: future date
      qd: futureDate.toISOString(),
      ti: 60,
      dl: 10,
      bp: 15,
    };
    const maliciousCode = await page.evaluate((data) => {
      return btoa(encodeURIComponent(JSON.stringify(data)));
    }, maliciousData);

    await page.click("#settingsBtn");
    await page.waitForSelector("#settingsPanel.open");
    await page.click('button:has-text("Restore from Code")');

    await page.fill("#restoreCodeInput", maliciousCode);
    await page.click('#restoreModal button:has-text("Restore")');
    await page.waitForTimeout(500);

    const state = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem("lotriflow_quit_state"));
    });

    // Future dates should be rejected (null)
    expect(state.lastCigarette).toBeNull();
    expect(state.quitDate).toBeNull();
  });

  test("should filter out invalid dates from cigaretteLog", async ({ page }) => {
    await seedState(page, validState);
    await page.goto("/");

    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    const maliciousData = {
      v: 3,
      ti: 60,
      dl: 10,
      bp: 15,
      cl: [
        new Date("2024-01-01T08:00:00Z").toISOString(), // Valid
        "invalid date string", // Invalid
        futureDate.toISOString(), // Invalid: future
        new Date("2024-01-01T10:00:00Z").toISOString(), // Valid
      ],
    };
    const maliciousCode = await page.evaluate((data) => {
      return btoa(encodeURIComponent(JSON.stringify(data)));
    }, maliciousData);

    await page.click("#settingsBtn");
    await page.waitForSelector("#settingsPanel.open");
    await page.click('button:has-text("Restore from Code")');

    await page.fill("#restoreCodeInput", maliciousCode);
    await page.click('#restoreModal button:has-text("Restore")');
    await page.waitForTimeout(500);

    const state = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem("lotriflow_quit_state"));
    });

    // Only 2 valid dates should remain (invalid ones filtered out)
    expect(state.cigaretteLog).toHaveLength(2);

    // Verify all remaining dates are valid
    state.cigaretteLog.forEach((dateStr) => {
      const date = new Date(dateStr);
      expect(date.toString()).not.toBe("Invalid Date");
      expect(date.getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  test("should handle completely invalid date strings", async ({ page }) => {
    await seedState(page, validState);
    await page.goto("/");

    const maliciousData = {
      v: 3,
      lc: "not a date",
      qd: "also not a date",
      ti: 60,
      dl: 10,
      bp: 15,
      cl: ["invalid", "dates", "everywhere"],
    };
    const maliciousCode = await page.evaluate((data) => {
      return btoa(encodeURIComponent(JSON.stringify(data)));
    }, maliciousData);

    await page.click("#settingsBtn");
    await page.waitForSelector("#settingsPanel.open");
    await page.click('button:has-text("Restore from Code")');

    await page.fill("#restoreCodeInput", maliciousCode);
    await page.click('#restoreModal button:has-text("Restore")');
    await page.waitForTimeout(500);

    const state = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem("lotriflow_quit_state"));
    });

    // Invalid dates should be rejected/filtered
    expect(state.lastCigarette).toBeNull();
    expect(state.quitDate).toBeNull();
    expect(state.cigaretteLog).toHaveLength(0); // All filtered out
  });
});

test.describe("Backup & Restore - Error Handling", () => {
  test("should show error for empty code", async ({ page }) => {
    await seedState(page, validState);
    await page.goto("/");

    await page.click("#settingsBtn");
    await page.waitForSelector("#settingsPanel.open");
    await page.click('button:has-text("Restore from Code")');

    // Leave input empty and click Restore
    await page.click('#restoreModal button:has-text("Restore")');

    // Verify error toast appears
    const toast = await page.locator(".toast").first();
    await expect(toast).toBeVisible();
    await expect(toast).toContainText("Enter a code");
  });

  test("should show error for invalid base64", async ({ page }) => {
    await seedState(page, validState);
    await page.goto("/");

    await page.click("#settingsBtn");
    await page.waitForSelector("#settingsPanel.open");
    await page.click('button:has-text("Restore from Code")');

    // Enter invalid base64
    await page.fill("#restoreCodeInput", "this is not valid base64!@#$");
    await page.click('#restoreModal button:has-text("Restore")');

    // Verify error toast with improved message
    const toast = await page.locator(".toast").first();
    await expect(toast).toBeVisible();
    await expect(toast).toContainText("Invalid or corrupted code");
  });

  test("should show error for corrupted JSON", async ({ page }) => {
    await seedState(page, validState);
    await page.goto("/");

    await page.click("#settingsBtn");
    await page.waitForSelector("#settingsPanel.open");
    await page.click('button:has-text("Restore from Code")');

    // Create valid base64 but with corrupted JSON
    const corruptedCode = btoa("{ this is not valid JSON }");
    await page.fill("#restoreCodeInput", corruptedCode);
    await page.click('#restoreModal button:has-text("Restore")');

    // Verify error toast
    const toast = await page.locator(".toast").first();
    await expect(toast).toBeVisible();
    await expect(toast).toContainText("Invalid or corrupted code");
  });

  test("should log error to console", async ({ page }) => {
    await seedState(page, validState);
    await page.goto("/");

    // Listen for console errors
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.click("#settingsBtn");
    await page.waitForSelector("#settingsPanel.open");
    await page.click('button:has-text("Restore from Code")');

    await page.fill("#restoreCodeInput", "invalid");
    await page.click('#restoreModal button:has-text("Restore")');
    await page.waitForTimeout(500);

    // Verify error was logged
    expect(consoleErrors.some((err) => err.includes("Restore") || err.includes("Failed"))).toBe(true);
  });
});

test.describe("Backup & Restore - Stats Recalculation", () => {
  test("should recalculate stats after restore", async ({ page }) => {
    await seedState(page, validState);
    await page.goto("/");

    // Create restore code with different stats
    const restoreData = {
      v: 3,
      lc: new Date("2024-01-01T12:00:00Z").toISOString(),
      qd: new Date("2024-01-01").toISOString(),
      ti: 120, // Different from initial
      dl: 5, // Different
      bp: 20, // Different
      pp: 15,
      cpp: 20,
      curr: "$",
      ai: 5,
      cl: [
        new Date("2024-01-01T08:00:00Z").toISOString(),
        new Date("2024-01-01T10:00:00Z").toISOString(),
        new Date("2024-01-01T14:00:00Z").toISOString(),
      ],
      cr: [],
      ta: 0, // Will be recalculated
      s: 0, // Will be recalculated
      ach: {},
    };
    const restoreCode = await page.evaluate((data) => {
      return btoa(encodeURIComponent(JSON.stringify(data)));
    }, restoreData);

    await page.click("#settingsBtn");
    await page.waitForSelector("#settingsPanel.open");
    await page.click('button:has-text("Restore from Code")');

    await page.fill("#restoreCodeInput", restoreCode);
    await page.click('#restoreModal button:has-text("Restore")');

    // Wait for stats recalculation
    await page.waitForTimeout(1000);

    // Verify state was updated
    const state = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem("lotriflow_quit_state"));
    });

    expect(state.targetInterval).toBe(120);
    expect(state.dailyLimit).toBe(5);
    expect(state.baselinePerDay).toBe(20);
    expect(state.cigaretteLog).toHaveLength(3);

    // Verify UI reflects new stats (check timer display updated)
    const timerDisplay = await page.locator("#timerDisplay");
    await expect(timerDisplay).toBeVisible();
  });

  test("should show success toast after restore", async ({ page }) => {
    await seedState(page, validState);
    await page.goto("/");

    const restoreCode = await page.evaluate((data) => {
      return btoa(encodeURIComponent(JSON.stringify(data)));
    }, { v: 3, ti: 60, dl: 10, bp: 15 });

    await page.click("#settingsBtn");
    await page.waitForSelector("#settingsPanel.open");
    await page.click('button:has-text("Restore from Code")');

    await page.fill("#restoreCodeInput", restoreCode);
    await page.click('#restoreModal button:has-text("Restore")');

    // Verify success toast with award icon
    const toast = await page.locator(".toast").first();
    await expect(toast).toBeVisible();
    await expect(toast).toContainText("Restored!");
  });

  test("should close modal after successful restore", async ({ page }) => {
    await seedState(page, validState);
    await page.goto("/");

    const restoreCode = await page.evaluate((data) => {
      return btoa(encodeURIComponent(JSON.stringify(data)));
    }, { v: 3, ti: 60, dl: 10, bp: 15 });

    await page.click("#settingsBtn");
    await page.waitForSelector("#settingsPanel.open");
    await page.click('button:has-text("Restore from Code")');

    await page.fill("#restoreCodeInput", restoreCode);
    await page.click('#restoreModal button:has-text("Restore")');

    // Wait for modal to close
    await page.waitForTimeout(500);

    // Verify modal is closed
    await expect(page.locator("#restoreModal")).not.toHaveClass(/open/);
  });
});

test.describe("Backup & Restore - Complete Workflow", () => {
  test("should complete full backup and restore cycle", async ({ page }) => {
    await seedState(page, validState);
    await page.goto("/");

    // Step 1: Generate share code
    await page.click("#settingsBtn");
    await page.waitForSelector("#settingsPanel.open");
    await page.click('button:has-text("Generate Share Code")');
    await page.waitForTimeout(500);

    const shareCode = await page.evaluate(() => navigator.clipboard.readText());
    expect(shareCode).toBeTruthy();

    // Step 2: Modify state
    await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem("lotriflow_quit_state"));
      state.dailyLimit = 999; // Changed
      state.targetInterval = 999; // Changed
      localStorage.setItem("lotriflow_quit_state", JSON.stringify(state));
    });

    // Step 3: Restore original state
    await page.click('button:has-text("Restore from Code")');
    await page.fill("#restoreCodeInput", shareCode);
    await page.click('#restoreModal button:has-text("Restore")');
    await page.waitForTimeout(1000);

    // Step 4: Verify state was restored
    const restoredState = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem("lotriflow_quit_state"));
    });

    expect(restoredState.dailyLimit).toBe(10); // Original value restored
    expect(restoredState.targetInterval).toBe(60); // Original value restored
    expect(restoredState.baselinePerDay).toBe(15); // Original value restored
  });
});
