import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

function createMockStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
    key: (index) => Array.from(store.keys())[index] || null,
    get length() {
      return store.size;
    },
  };
}

function setupWindow() {
  const storage = createMockStorage();
  const nav = {};
  const w = {
    location: { hostname: "app.example.com", search: "" },
    localStorage: storage,
    navigator: nav,
    __APP_METADATA__: { version: "1.2.3", build: "45" },
  };
  global.window = w;
  Object.defineProperty(global, "navigator", { value: nav, configurable: true, writable: true });
  Object.defineProperty(global, "localStorage", { value: storage, configurable: true, writable: true });
  return w;
}

function setupConsoleMocks() {
  // Preserve original console to restore after each test.
  const original = global.console;
  const mockFn = () => {};
  const mocked = {
    log: vi.fn(mockFn),
    debug: vi.fn(mockFn),
    info: vi.fn(mockFn),
    warn: vi.fn(mockFn),
    error: vi.fn(mockFn),
  };
  global.console = mocked;
  return { mocked, original };
}

async function loadLogger() {
  await import("../logger.js");
  return window.Logger;
}

describe("logger", () => {
  let originalConsole;

  beforeEach(() => {
    vi.resetModules();
    setupWindow();
    const { original } = setupConsoleMocks();
    originalConsole = original;
  });

  afterEach(() => {
    delete global.window;
    delete global.navigator;
    delete global.localStorage;
    if (originalConsole) {
      global.console = originalConsole;
    } else {
      delete global.console;
    }
    vi.useRealTimers();
  });

  it("gates messages based on level", async () => {
    const Logger = await loadLogger();
    const sink = vi.fn();
    Logger.addSink(sink);
    Logger.setLevel("info");
    const log = Logger.create("Test");

    log.debug("ignore");
    log.info("include");

    expect(sink).toHaveBeenCalledTimes(1);
    const record = sink.mock.calls[0][0];
    expect(record.level).toBe("info");
    expect(record.namespace).toBe("Test");
    expect(record.args[0]).toBe("include");
  });

  it("includes context from provider", async () => {
    const Logger = await loadLogger();
    const sink = vi.fn();
    Logger.addSink(sink);
    Logger.setLevel("debug");
    Logger.setContextProvider(() => ({ userId: "u123" }));

    Logger.create("Ctx").warn("hello");

    const ctx = sink.mock.calls[0][0].context;
    expect(ctx).toEqual({ userId: "u123" });
  });

  it("sanitizes errors and batches for remote", async () => {
    const Logger = await loadLogger();
    const sendBeacon = vi.fn(() => true);
    navigator.sendBeacon = sendBeacon;

    Logger.configureRemote({
      url: "https://logs.test/ingest",
      sampleRate: 1,
      levels: ["error"],
      batchSize: 1,
      flushIntervalMs: 10,
    });
    Logger.setLevel("debug");
    const log = Logger.create("Remote");

    log.error(new Error("boom"));

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    const [, body] = sendBeacon.mock.calls[0];
    const payload = JSON.parse(body);
    const entry = payload.entries[0];
    expect(entry.namespace).toBe("Remote");
    expect(entry.args[0]).toMatchObject({ message: "boom" });
  });
});
