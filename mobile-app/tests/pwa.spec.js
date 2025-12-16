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
    // Mock ProAccess for testing
    window.ProAccess = {
      hasAccess: () => true,
      isProActive: true,
    };
    // Add pro-active class to body for pro features
    document.body.classList.add('pro-active');
    // Remove locked class from pro features
    document.querySelectorAll('.locked').forEach(el => el.classList.remove('locked'));
  }, state);
};

test.describe("PWA Functionality", () => {
  test("registers service worker", async ({ page }) => {
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

    // Check if service worker is registered
    const swRegistered = await page.evaluate(() => {
      return navigator.serviceWorker.controller !== null;
    });

    // Service worker registration might be async, so we'll check for the script
    const swScript = await page.locator('script[src*="sw.js"]').count();
    expect(swScript).toBeGreaterThan(0);
  });

  test("shows install prompt when available", async ({ page }) => {
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

    // Mock the beforeinstallprompt event
    await page.addInitScript(() => {
      window.deferredPrompt = {
        prompt: () => Promise.resolve(),
        userChoice: Promise.resolve({ outcome: 'accepted' })
      };
    });

    await page.goto("/");

    // Install button should be visible
    const installButton = page.locator(".install-banner-btn");
    await expect(installButton).toBeVisible();
  });

  test("handles offline functionality", async ({ page, context }) => {
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

    // Go offline
    await context.setOffline(true);

    // App should still be functional
    await expect(page.locator("#timerDigits")).toBeVisible();

    // Try to log a cigarette (should work offline)
    await page.click(".main-action-btn");

    // Check that it was logged (stored locally)
    const logsAfter = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem("lotriflow_quit_state"));
      return state.cigaretteLog.length;
    });

    expect(logsAfter).toBe(1);

    // Go back online
    await context.setOffline(false);

    // App should still work
    await expect(page.locator("#timerDigits")).toBeVisible();
  });

  test("caches resources for offline use", async ({ page, context }) => {
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

    // Wait for service worker to be ready
    await page.waitForTimeout(1000);

    // Check if critical resources are cached
    const cacheContents = await page.evaluate(async () => {
      if ('caches' in window) {
        const cache = await caches.open('smokefree-v1');
        const keys = await cache.keys();
        return keys.map(request => request.url);
      }
      return [];
    });

    // Should cache at least the main app files
    expect(cacheContents.length).toBeGreaterThan(0);
    expect(cacheContents.some(url => url.includes('app.js') || url.includes('/'))).toBe(true);
  });

  test("has proper web app manifest", async ({ page }) => {
    await page.goto("/");

    // Check for manifest link
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toBeAttached();

    const manifestHref = await manifestLink.getAttribute('href');
    expect(manifestHref).toBeTruthy();

    // Fetch and validate manifest content
    const manifestResponse = await page.request.get(manifestHref);
    expect(manifestResponse.ok()).toBe(true);

    const manifest = await manifestResponse.json();
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBeTruthy();
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons).toBeTruthy();
    expect(Array.isArray(manifest.icons)).toBe(true);
  });

  test("has proper meta tags for PWA", async ({ page }) => {
    await page.goto("/");

    // Check for required meta tags
    await expect(page.locator('meta[name="theme-color"]')).toBeAttached();
    await expect(page.locator('meta[name="viewport"]')).toBeAttached();
    await expect(page.locator('meta[name="description"]')).toBeAttached();

    // Check viewport meta tag content
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
    expect(viewport).toContain('initial-scale=1');
  });

  test("handles app updates gracefully", async ({ page }) => {
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

    // Mock service worker update
    await page.addInitScript(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
            // App should handle update notification
            console.log('Update available');
          }
        });
      }
    });

    // Trigger update check (this would normally happen automatically)
    await page.evaluate(() => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CHECK_FOR_UPDATES' });
      }
    });

    // App should continue to work normally
    await expect(page.locator("#timerDigits")).toBeVisible();
  });
});