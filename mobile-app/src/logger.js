// Lightweight logging utility for browser runtime.
// Provides level-based logging, namespacing, and runtime toggles without relying on build tooling.
(() => {
  const LEVELS = { debug: 10, info: 20, warn: 30, error: 40, silent: 50 };
  const DEFAULT_NAMESPACE = "App";
  const STORAGE_KEY = "lotriflow:log-level";
  const QUERY_FLAG = "debug";
  const QUERY_LEVEL = "logLevel";

  // Capture native console methods before shimming to avoid recursion.
  const nativeConsole = {
    debug: console.debug ? console.debug.bind(console) : console.log.bind(console),
    info: console.info ? console.info.bind(console) : console.log.bind(console),
    warn: console.warn ? console.warn.bind(console) : console.log.bind(console),
    error: console.error ? console.error.bind(console) : console.log.bind(console),
    log: console.log.bind(console),
  };

  const sinks = [];
  let contextProvider = null;
  let recordSanitizer = null;

  // Remote logging (optional)
  const REMOTE_DEFAULTS = {
    url: null,
    headers: { "Content-Type": "application/json" },
    sampleRate: 1, // 0..1
    levels: ["warn", "error"],
    flushIntervalMs: 5000,
    batchSize: 10,
    maxQueue: 100,
  };
  let remoteConfig = null;
  let remoteQueue = [];
  let remoteFlushTimer = null;

  function isLocalLikeHost(hostname) {
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.endsWith(".local") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.16.")
    );
  }

  function detectDefaultLevel() {
    try {
      const host = window?.location?.hostname || "";
      // Dev-like hosts get debug; production hosts default to warn for a quieter surface.
      return isLocalLikeHost(host) ? "debug" : "warn";
    } catch (_) {
      return "warn";
    }
  }

  function parseQueryLevel() {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has(QUERY_FLAG)) return "debug";
      const level = params.get(QUERY_LEVEL);
      return level ? level.toLowerCase() : null;
    } catch (_) {
      return null;
    }
  }

  function readStoredLevel() {
    try {
      const val = window.localStorage.getItem(STORAGE_KEY);
      return val ? val.toLowerCase() : null;
    } catch (_) {
      return null;
    }
  }

  function persistLevel(level) {
    try {
      window.localStorage.setItem(STORAGE_KEY, level);
    } catch (_) {
      /* ignore */
    }
  }

  function validateLevel(level, fallback = "info") {
    return level && LEVELS[level] ? level : fallback;
  }

  let currentLevel = validateLevel(
    parseQueryLevel() || readStoredLevel() || detectDefaultLevel(),
    "info"
  );

  function shouldLog(level) {
    return LEVELS[level] >= LEVELS[currentLevel];
  }

  function formatTimestamp(date) {
    return date.toISOString();
  }

  function emit(record) {
    if (!shouldLog(record.level)) return null;
    const enriched = {
      ...record,
      context: typeof contextProvider === "function" ? contextProvider() : undefined,
    };

    for (const sink of sinks) {
      try {
        sink(enriched);
      } catch (err) {
        nativeConsole.error("[Logger] Sink failure:", err);
      }
    }

    return enriched;
  }

  function consoleSink(record) {
    const { level, namespace, args, timestamp } = record;
    const method = level === "debug" ? "debug" : level === "info" ? "info" : level;
    const prefix = `[${timestamp}] [${namespace || DEFAULT_NAMESPACE}]`;
    (nativeConsole[method] || nativeConsole.log)(prefix, ...args);
  }

  sinks.push(consoleSink);

  function shouldSendRemote(record) {
    if (!remoteConfig || !remoteConfig.url) return false;
    if (!remoteConfig.levels.includes(record.level)) return false;
    if (remoteConfig.sampleRate < 1 && Math.random() > remoteConfig.sampleRate) return false;
    return true;
  }

  function toSerializable(value) {
    if (value === undefined) return "[undefined]";
    if (value === null) return null;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
    if (value instanceof Error) {
      return { message: value.message, stack: value.stack, name: value.name };
    }
    if (typeof value === "function") return `[function ${value.name || "anonymous"}]`;
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (_) {
      try {
        return String(value);
      } catch (_) {
        return "[unserializable]";
      }
    }
  }

  function sanitizeRecord(record) {
    const source = recordSanitizer ? recordSanitizer({ ...record }) || record : record;
    const { args, ...rest } = source;
    return {
      ...rest,
      args: Array.isArray(args) ? args.map(toSerializable) : [],
    };
  }

  function flushRemoteQueue(reason = "timer") {
    if (!remoteQueue.length || !remoteConfig?.url) return;
    const payload = remoteQueue.splice(0, remoteConfig.batchSize);
    clearTimeout(remoteFlushTimer);
    remoteFlushTimer = null;

    let body;
    try {
      body = JSON.stringify({
        reason,
        entries: payload.map(sanitizeRecord),
      });
    } catch (_) {
      return;
    }

    try {
      if (navigator?.sendBeacon) {
        const ok = navigator.sendBeacon(remoteConfig.url, body);
        if (!ok) throw new Error("sendBeacon rejected");
      } else if (typeof fetch === "function") {
        fetch(remoteConfig.url, {
          method: "POST",
          headers: remoteConfig.headers,
          body,
          keepalive: true,
        }).catch(() => {});
      }
    } catch (_) {
      /* ignore delivery errors */
    }

    if (remoteQueue.length) {
      remoteFlushTimer = setTimeout(() => flushRemoteQueue("drain"), remoteConfig.flushIntervalMs);
    }
  }

  function enqueueRemote(record) {
    if (!shouldSendRemote(record)) return;
    if (remoteQueue.length >= remoteConfig.maxQueue) {
      remoteQueue.shift();
    }
    remoteQueue.push(record);
    if (!remoteFlushTimer) {
      remoteFlushTimer = setTimeout(() => flushRemoteQueue("interval"), remoteConfig.flushIntervalMs);
    }
    if (remoteQueue.length >= remoteConfig.batchSize) {
      flushRemoteQueue("batch");
    }
  }

  function setLevel(level, { persist = false } = {}) {
    const next = validateLevel(level, currentLevel);
    currentLevel = next;
    if (persist) {
      persistLevel(next);
    }
    return next;
  }

  function getLevel() {
    return currentLevel;
  }

  function createLogger(namespace = DEFAULT_NAMESPACE) {
    const buildLog = (level) => (...args) => {
      const record = {
        level,
        namespace,
        args,
        timestamp: formatTimestamp(new Date()),
      };
      const enriched = emit(record);
      if (enriched) {
        enqueueRemote(enriched);
      }
    };

    return {
      debug: buildLog("debug"),
      info: buildLog("info"),
      warn: buildLog("warn"),
      error: buildLog("error"),
      setLevel,
      getLevel,
    };
  }

  function installConsoleShim({ namespace = DEFAULT_NAMESPACE } = {}) {
    const shimLogger = createLogger(namespace);
    console.log = shimLogger.debug;
    console.debug = shimLogger.debug;
    console.info = shimLogger.info;
    console.warn = shimLogger.warn;
    console.error = shimLogger.error;
  }

  // Expose minimal API for the rest of the app.
  window.Logger = {
    create: createLogger,
    setLevel,
    getLevel,
    installConsoleShim,
    enableDebug(persist = false) {
      return setLevel("debug", { persist });
    },
    enableInfo(persist = false) {
      return setLevel("info", { persist });
    },
    enableWarn(persist = false) {
      return setLevel("warn", { persist });
    },
    enableError(persist = false) {
      return setLevel("error", { persist });
    },
    configureRemote(options) {
      const next = { ...REMOTE_DEFAULTS, ...(options || {}) };
      if (!next.url) {
        remoteConfig = null;
        remoteQueue = [];
        clearTimeout(remoteFlushTimer);
        remoteFlushTimer = null;
        return false;
      }
      remoteConfig = next;
      return true;
    },
    setContextProvider(fn) {
      contextProvider = typeof fn === "function" ? fn : null;
    },
    setSanitizer(fn) {
      recordSanitizer = typeof fn === "function" ? fn : null;
    },
    addSink(fn) {
      if (typeof fn === "function") {
        sinks.push(fn);
      }
    },
    levels: { ...LEVELS },
  };

  // Auto-configure remote sink if global endpoint is provided.
  try {
    const endpoint = window.__LOG_ENDPOINT__ || window.localStorage?.getItem("lotriflow:log-endpoint");
    if (endpoint) {
      window.Logger.configureRemote({ url: endpoint });
    }
  } catch (_) {
    /* ignore */
  }
})();
