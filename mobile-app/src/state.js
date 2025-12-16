// Feather Icons: https://feathericons.com/
// All icons are licensed under the MIT License.

// ==================== PRODUCTION MODE ====================
// Disable noisy console logs in production, with a simple override via localStorage:
// localStorage.setItem('lotriflow:log-level', 'debug')  // keeps all logs
// localStorage.setItem('lotriflow:log-level', 'info')   // keeps info/log, hides debug
const PRODUCTION = true;
let LOG_LEVEL = "warn";
try {
  const storedLevel = localStorage.getItem("lotriflow:log-level");
  if (storedLevel) {
    LOG_LEVEL = storedLevel.toLowerCase();
  }
} catch (e) {
  // Ignore storage access issues
}

if (PRODUCTION) {
  const allowDebug = LOG_LEVEL === "debug";
  const allowInfo = allowDebug || LOG_LEVEL === "info";
  if (!allowDebug) {
    console.debug = () => {};
  }
  if (!allowInfo) {
    console.log = () => {};
    console.info = () => {};
  }
  // Keep console.error and console.warn for critical issues
}



// ==================== Capacitor Storage Shim ====================
// Ensure theme-color meta exists for environments that don't include it (prevents runtime errors)
try {
  if (typeof document !== 'undefined' && !document.querySelector('meta[name="theme-color"]')) {
    const m = document.createElement('meta');
    m.setAttribute('name', 'theme-color');
    m.setAttribute('content', '#0a0a0f');
    document.head && document.head.appendChild(m);
  }
} catch (e) {
  // Running in non-browser environments; ignore
}

// If Capacitor is available, use Preferences. Otherwise, fall back to localStorage.
const Storage =
      window.Capacitor && Capacitor.isPluginAvailable("Preferences") 
    ? Capacitor.Plugins.Preferences
    : {
        get: async ({ key }) => ({ value: localStorage.getItem(key) }),
        set: async ({ key, value }) => localStorage.setItem(key, value),
        remove: async ({ key }) => localStorage.removeItem(key),
        keys: async () => ({ keys: Object.keys(localStorage) }),
        clear: async () => localStorage.clear(),
      };

// Capacitor Local Notifications (native iOS/Android)
const LocalNotifications =
      window.Capacitor && Capacitor.isPluginAvailable("LocalNotifications") 
    ? Capacitor.Plugins.LocalNotifications
    : null;
      // console logs removed; debug logging should happen in loadState and enforceNotificationAvailability

// Capacitor Status Bar (to control overlay on iOS)
const StatusBar =
  window.Capacitor && Capacitor.isPluginAvailable("StatusBar")
    ? Capacitor.Plugins.StatusBar
    : null;

const AppMetadataFromScript =
  typeof window !== "undefined" && window.__APP_METADATA__
    ? window.__APP_METADATA__
    : { version: "1.0.0", build: "1" };
const AppInfo = { ...AppMetadataFromScript };

async function refreshAppMetadata() {
  if (window.Capacitor && window.Capacitor.isPluginAvailable("App")) {
    try {
      const { version, build } = await Capacitor.Plugins.App.getInfo();
      if (version) {
        AppInfo.version = version;
      }
      if (build) {
        AppInfo.build = build;
      }
    } catch (error) {
      console.warn("[AppInfo] App.getInfo failed", error);
    }
  }

  const versionEl = document.getElementById("appVersion");
  const buildEl = document.getElementById("appBuild");
  if (versionEl) {
    versionEl.textContent = `LotriFlow Quit v${AppInfo.version}`;
  }
  if (buildEl) {
    buildEl.textContent = `Build ${AppInfo.build}`;
  }

  return AppInfo;
}

function getAppVersionLabel() {
  return `App Version: ${AppInfo.version}`;
}

function getAppBuildLabel() {
  return `App Build: ${AppInfo.build}`;
}
// ==================== STATE ====================
// Storage key
const STATE_KEY = "lotriflow_quit_state";

// Global array to store interval IDs
let timerFrameId = null;
let timerIntervalId = null;
let timerTickCount = 0;
let lastWatchSnapshotTs = 0;
const WATCH_SNAPSHOT_MIN_INTERVAL = 10000;
let lastCoachTick = 0;
const COACH_MIN_INTERVAL = 30000;
let timerRenderCache = {
  days: null,
  hours: null,
  minutes: null,
  seconds: null,
  subtext: null,
  progress: null,
  progressLabel: null,
  smokeBtnText: null,
};
let pendingUIRefresh = false;
let deferredPrompt; // PWA install prompt
let state = {
  lastCigarette: null,
  quitDate: null,
  targetInterval: 60,
  dailyLimit: 10,
  baselinePerDay: null,
  packPrice: 8,
  cigsPerPack: 20,
  currency: "USD", // Currency code
  cigaretteLog: [],
  cravingsLog: [],
  totalAvoided: 0, // Deprecated - kept for backwards compatibility. Use getCigarettesAvoided() instead
  // In-app feedback
  soundEnabled: true,
  vibrationEnabled: true,
  feedbackEnabled: true,
  // Notification controls
  notificationsMuted: false,
  autoIncrease: true,
  autoIncreaseAmount: 5,
  notificationsEnabled: false,
  dailyReminderEnabled: false,
  dailyReminderTime: "09:00", // Default 9 AM
  firstRun: true,
  streak: 0, // Days under daily limit
  smokeFreeStreak: 0, // Consecutive days with zero cigarettes
  lastGoalNotified: 0, // Track last goal we notified about to avoid spam
  theme: "dark",
  achievements: {},
  // Enhanced AI Coach state
  coachMood: "neutral", // neutral, struggling, motivated, celebrating
  lastCoachInteraction: null,
  crisisMode: false
  // ...existing code...
};
let pendingSmokeLog = null;
let sessionLastGoalKey = null;
let quitPlanGranularity = "key";
let audioCtx = null;
let lastWatchLogTimestamp = 0;

// Debounce timer for heavy stats updates
let statsUpdateTimer = null;

// Debounce timer for save operations
let saveStateTimer = null;

// Track current chart view
let currentChartDays = 7;

const TARGET_INTERVAL_MIN = 1;
const TARGET_INTERVAL_STEP = 15;
const TARGET_INTERVAL_MAX = 1440; // 24 hours max

function clampTargetInterval(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= TARGET_INTERVAL_MIN) return TARGET_INTERVAL_MIN;
  const clamped = Math.max(TARGET_INTERVAL_STEP, Math.min(TARGET_INTERVAL_MAX, num));
  return Math.round(clamped / TARGET_INTERVAL_STEP) * TARGET_INTERVAL_STEP;
}

function stepTargetInterval(current, steps) {
  if (!steps) return clampTargetInterval(current);
  let result = current <= TARGET_INTERVAL_MIN ? TARGET_INTERVAL_MIN : clampTargetInterval(current);
  const direction = Math.sign(steps);
  let remaining = Math.abs(steps);

  while (remaining > 0) {
    if (direction > 0) {
      result =
        result <= TARGET_INTERVAL_MIN
          ? TARGET_INTERVAL_STEP
          : Math.min(TARGET_INTERVAL_MAX, result + TARGET_INTERVAL_STEP);
    } else {
      result =
        result <= TARGET_INTERVAL_STEP
          ? TARGET_INTERVAL_MIN
          : Math.max(TARGET_INTERVAL_STEP, result - TARGET_INTERVAL_STEP);
    }
    remaining--;
  }

  return result;
}

function ensureAudioContext() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (e) {
    console.warn("[Audio] Context unavailable", e);
    return null;
  }
}

function primeAudioContext() {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  try {
    // Send a near-silent blip to unlock audio on mobile autoplay restrictions
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.01);
  } catch (e) {
    console.warn("[Audio] Prime failed", e);
  }
  window.removeEventListener("pointerdown", primeAudioContext);
  window.removeEventListener("touchstart", primeAudioContext);
}

// ==================== COACH (RAG) LOGIC ====================
// Simple retrieval-based coach (not AI)
function getCoachMessage(type = "general") {
  // Build rich context
  const elapsed = getElapsedSeconds();
  const hours = Math.floor(elapsed / 3600);
  const days = Math.floor(hours / 24);
  const saved = getMoneySaved().toFixed(2);
  const avoided = getCigarettesAvoided();
  const todayLogs = state.cigaretteLog.filter((log) => {
    const logDate = new Date(log);
    const today = new Date();
    return logDate.toDateString() === today.toDateString();
  }).length;

  const context = {
    elapsed,
    hours,
    days,
    streak: state.streak,
    moneySaved: saved,
    cigarettesAvoided: avoided,
    todayCount: todayLogs,
    dailyLimit: state.dailyLimit,
    mood: state.coachMood,
    crisisMode: state.crisisMode,
    targetInterval: state.targetInterval,
    totalSmoked: state.cigaretteLog.length,
  };

  // SMART CONTEXTUAL MESSAGES

  // 1. Crisis/Struggling - Override everything
  if (type === "struggling" || context.crisisMode) {
    return crisisMessages[Math.floor(Math.random() * crisisMessages.length)];
  }

  // 2. Today is over limit - immediate concern
  if (context.todayCount > context.dailyLimit) {
    const over = context.todayCount - context.dailyLimit;
    const cigWord = over === 1 ? 'cigarette' : 'cigarettes';
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-alert-triangle"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> You've smoked ${over} ${cigWord} more than your limit today (${context.todayCount}/${context.dailyLimit}). It's okay - tomorrow is a fresh start. Try the breathing exercise now to resist the next one. <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`;
  }

  // 3. Close to daily limit - warning
  if (context.todayCount === context.dailyLimit) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-target"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg> You've hit your daily limit (${context.dailyLimit}). Great job staying on track! If you feel an urge, try waiting just 10 more minutes. You got this!`;
  } else if (context.todayCount === context.dailyLimit - 1) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-lightbulb"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg> You have 1 cigarette left in your limit today. Make it count, or challenge yourself to skip it entirely! Every cigarette you avoid is a victory.`;
  }

  // 4. Perfect day (zero cigarettes today)
  if (context.todayCount === 0 && context.hours > 6) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> Amazing! You haven't smoked at all today! This is HUGE progress. Your body is already healing. Keep this momentum going!`;
  }

  // 5. First 24 hours - critical period
  if (context.hours < 24 && context.hours > 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> First ${context.hours} hours - the hardest time! You're doing great. Your heart rate is already normalizing. Cravings peak now but will fade. Hang in there!`;
  }

  // 6. Major milestones - celebrate!
  if (context.hours === 24 && type === "celebrating") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.89"></polyline></svg> ONE FULL DAY! Nicotine is clearing and cravings may still be strong for a couple days. Keep using your tools—you've proven you can do this!`;
  }
  if (context.days === 3) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-fire"><path d="M12 21.5c-4-4-5-8-5-11 0-2.2 1.8-4 4-4s4 1.8 4 4c0 3-1 7-5 11z"></path><path d="M12 21.5c-4-4-5-8-5-11 0-2.2 1.8-4 4-4s4 1.8 4 4c0 3-1 7-5 11z"></path></svg> 3 DAYS! Nerve endings are regrowing and taste/smell are getting better. Physical symptoms often peak around now—keep leaning on your plan!`;
  }
  if (context.days === 7) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.89"></polyline></svg> ONE WEEK SMOKE FREE! Physical withdrawal is settling down. Stay with the routines that are working. Incredible work!`;
  }
  if (context.days === 30) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> ONE MONTH! Breathing and circulation are improving. You've saved ${getCurrencySymbol()}${context.moneySaved}. You're a champion!`;
  }

  // 7. Great streak - acknowledge it
  if (context.streak >= 7) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-fire"><path d="M12 21.5c-4-4-5-8-5-11 0-2.2 1.8-4 4-4s4 1.8 4 4c0 3-1 7-5 11z"></path><path d="M12 21.5c-4-4-5-8-5-11 0-2.2 1.8-4 4-4s4 1.8 4 4c0 3-1 7-5 11z"></path></svg> ${context.streak}-day streak staying under your limit! Your consistency is paying off. Average: ${(context.totalSmoked / Math.max(1, context.days)).toFixed(1)} per day.`;
  }

  // 8. Significant progress - money/avoided
  if (avoided >= 50 && type === "celebrating") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-dollar-sign"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg> You've avoided ${avoided} cigarettes and saved ${getCurrencySymbol()}${context.moneySaved}! Think what you could buy with that money. Your lungs thank you!`;
  }

  // 9. Time since last smoke - waiting period
  const minutes = Math.floor(elapsed / 60);
  const targetMins = context.targetInterval;
  if (minutes < targetMins && minutes > 0) {
    const remaining = targetMins - minutes;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-clock"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ${remaining} minutes until your next interval. Try to distract yourself - cravings only last 3-5 minutes. You're stronger than the urge!`;
  }

  // 10. Reached target interval
  if (minutes >= targetMins && minutes < targetMins + 30) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-8.93"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> You've reached your ${targetMins}-minute interval! You can choose to wait longer and challenge yourself, or take a break if needed. Progress over perfection!`;
  }

  // 11. Type-specific messages
  if (type === "tip") {
    const tips = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-droplet"><path d="M12 2.69L19.45 9l-7.45 12.31L4.55 9z"></path></svg> Sip water when you feel a craving—it helps urges pass.`,
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> Walk for 5 minutes—movement eases cravings quickly.`,
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-wind"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path></svg> Try box breathing: 4 seconds in, hold 4, out 4, hold 4`,
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-8.93"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Eat crunchy foods like carrots or apples to satisfy oral fixation`,
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-phone-call">
  <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.95M1 11.5V10a2 2 0 0 1 2-2h3c.67 0 1.25.18 1.74.5l2.45 1.72a2 2 0 0 0 2.21.26l3.39-1.39a2 2 0 0 1 2.45.26l2.45 1.72c.49.32 1.07.5 1.74.5h3a2 2 0 0 1 2 2v1.5a2 2 0 0 1-2 2h-3c-.67 0-1.25-.18-1.74-.5l-2.45-1.72a2 2 0 0 0-2.21-.26l-3.39 1.39a2 2 0 0 1-2.45-.26l-2.45-1.72c-.49-.32-1.07-.5-1.74-.5h-3a2 2 0 0 1-2-2z"></path>
</svg> Call someone supportive when you feel weak`,
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg> Write down 3 reasons you want to quit right now`,
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }

  if (type === "goal") {
    // Personalized goal based on current performance
    if (context.todayCount < context.dailyLimit / 2) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-target"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg> Today's goal: Try to keep it under ${Math.floor(context.dailyLimit / 2)} cigarettes. You're doing great so far!`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-target"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg> Today's goal: Stay under ${context.dailyLimit} cigarettes. Add 5 minutes to your target interval. Small steps lead to big wins!`;
  }

  // 12. Default contextual message
  if (context.days === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-leaf"><path d="M11 20A7 7 0 0 1 3 13V6H2l3-1 3 1H7v7a5 5 0 0 0 5 5h3"></path><path d="M18 13a6 6 0 0 0-5.69 3.86"></path></svg> Welcome to your quit journey! Every minute smoke-free is your body healing. You're ${minutes} minutes into a healthier life. Keep going!`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-heart"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> ${context.days} days in! You've avoided ${avoided} cigarettes. Your dedication is inspiring. Keep focusing on one day at a time.`;
}

// ==================== COACH FEATURES ====================
function initializeCoachFeatures() {
  // Set initial coach status
  updateCoachStatus();
  console.log("[Coach] Features initialized");
}

function setupCoachEventListeners() {
  // No additional event listeners needed - functions called directly via onclick
  console.log("[Coach] Event listeners initialized");
}

// ==================== COACH ACTIONS ====================
function showTip() {
  const tip = getCoachMessage("tip");
  const coachMessageEl = document.getElementById("coachMessage");
  if (coachMessageEl) {
    coachMessageEl.textContent = tip;
  }
  showToast('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-lightbulb"><line x1="9" y1="18" x2="15" y2="18"></line><line x1="10" y1="22" x2="14" y2="22"></line><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path></svg> Check the Coach tab for a tip!', "info");
  logCoachInteraction("tip", tip);
}

function suggestGoal() {
  const goal = getCoachMessage("goal");
  const coachMessageEl = document.getElementById("coachMessage");
  if (coachMessageEl) {
    coachMessageEl.textContent = goal;
  }
  showToast('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-target"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg> Check the Coach tab for your goal!', "success");
  logCoachInteraction("goal_suggestion", goal);
}

function handleCrisisSupport() {
  const support = {
    title: "Crisis Support Resources",
    message:
      "If you're struggling right now, remember you're not alone. Here are immediate resources:",
    resources: [
      "Call 988 (US Suicide & Crisis Lifeline)",
      "Text HOME to 741741 (Crisis Text Line)",
      "Talk to a trusted friend or family member",
      "Practice the breathing exercises",
      "Remember: cravings only last 5-10 minutes",
      "Take a walk outside",
      "💧 Drink a glass of cold water",
    ],
  };

  // Show crisis modal
  const modal = document.getElementById("crisisModal");
  if (modal) {
    document.getElementById("crisisTitle").textContent = support.title;
    document.getElementById("crisisMessage").textContent = support.message;
    const resourcesList = document.getElementById("crisisResources");
    resourcesList.innerHTML = support.resources
      .map((r) => `<li>${r}</li>`)
      .join("");
    modal.classList.add("open");
  }
}

// ==================== FEEDBACK & SUPPORT ====================

function openBugReport() {
  const subject = encodeURIComponent("[Bug Report] LotriFlow Quit");
  const body = encodeURIComponent(`Hi LotriFlow team,

I'd like to report a bug in LotriFlow Quit.

What happened:
- What were you doing?
- What did you expect?
- What actually happened?

Steps to reproduce:
1.
2.
3.

Device details:
- Browser/Device: ${navigator.userAgent}
- ${getAppVersionLabel()}
- ${getAppBuildLabel()}

Additional details / screenshots:
`);
  window.open(`mailto:hello@lotriflow.com?subject=${subject}&body=${body}`);
  showToast('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-mail"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> Bug report email opened', "info");
}

function openFeatureRequest() {
  const subject = encodeURIComponent("[Feature Request] LotriFlow Quit");
  const body = encodeURIComponent(`Hi LotriFlow team,

I'd like to suggest a feature for LotriFlow Quit.

Idea:
- What feature would you like?
- How would it help you?
- Any specific details or examples?

Additional context:
`);
  window.open(`mailto:hello@lotriflow.com?subject=${subject}&body=${body}`);
  showToast('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-mail"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> Feature request email opened', "info");
}

function openSupport() {
  const subject = encodeURIComponent("[Support] LotriFlow Quit");
  const body = encodeURIComponent(`Hi LotriFlow team,

I need help with LotriFlow Quit.

Issue or question:

Device details:
- Browser/Device: ${navigator.userAgent}
- ${getAppVersionLabel()}
- ${getAppBuildLabel()}

Thanks!
`);
  window.open(`mailto:hello@lotriflow.com?subject=${subject}&body=${body}`);
  showToast('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-mail"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> Support email opened', "info");
}

function openHelp() {
  const helpContent = {
    title: "❓ Help & FAQ",
    content: `
<div class="faq-container">
  <div class="faq-section">
    <div class="faq-header">
      <span class="faq-icon">🚀</span>
      <h3>Getting Started</h3>
    </div>
    <div class="faq-items">
      <div class="faq-item">
        <div class="faq-question">How do I start?</div>
        <div class="faq-answer">Set your daily cigarette limit and target interval in the welcome screen. The timer will start automatically.</div>
      </div>
      <div class="faq-item">
        <div class="faq-question">How do I log cigarettes?</div>
        <div class="faq-answer">Tap the "+" button when you smoke, or use the quick log buttons for faster entry.</div>
      </div>
    </div>
  </div>

  <div class="faq-section">
    <div class="faq-header">
      <span class="faq-icon">⚡</span>
      <h3>Features</h3>
    </div>
    <div class="faq-items">
      <div class="faq-item">
        <div class="faq-question">Timer</div>
        <div class="faq-answer">Shows how long you've been smoke-free with real-time updates.</div>
      </div>
      <div class="faq-item">
        <div class="faq-question">Reports</div>
        <div class="faq-answer">View your progress with beautiful charts and detailed statistics.</div>
      </div>
      <div class="faq-item">
        <div class="faq-question">Achievements</div>
        <div class="faq-answer">Unlock badges and celebrate milestones in your quit journey.</div>
      </div>
      <div class="faq-item">
        <div class="faq-question">Coach</div>
        <div class="faq-answer">Get personalized advice and motivation tailored to your progress.</div>
      </div>
      <div class="faq-item">
        <div class="faq-question">Breathing</div>
        <div class="faq-answer">Use guided breathing exercises to manage cravings effectively.</div>
      </div>
    </div>
  </div>

  <div class="faq-section">
    <div class="faq-header">
      <span class="faq-icon">🔧</span>
      <h3>Troubleshooting</h3>
    </div>
    <div class="faq-items">
      <div class="faq-item">
        <div class="faq-question">App not working?</div>
        <div class="faq-answer">Try refreshing the page or reinstalling the PWA. Clear browser cache if issues persist.</div>
      </div>
      <div class="faq-item">
        <div class="faq-question">Data lost?</div>
        <div class="faq-answer">Check your browser settings - data is stored locally. Enable cookies and local storage.</div>
      </div>
      <div class="faq-item">
        <div class="faq-question">Need more help?</div>
        <div class="faq-answer">Contact support at hello@lotriflow.com or use the feedback buttons in settings.</div>
      </div>
    </div>
  </div>
</div>
    `,
  };

  // Create help modal
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "helpModal";
  modal.innerHTML = `
    <div class="modal faq-modal" style="max-width: 600px; max-height: 85vh; overflow-y: auto;">
      <div class="modal-title">
        ${helpContent.title}
        <button class="close-btn" onclick="closeModal('helpModal')" style="font-size: 1.2rem; padding: 5px;">×</button>
      </div>
      <div class="modal-content">
        ${helpContent.content}
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('helpModal')">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.classList.add("open");
}

// ==================== INITIALIZATION ====================
async function ensureSettingsOpenForUITests() {
  const panel = document.getElementById("settingsPanel");
  if (panel && !panel.classList.contains("open")) {
    await toggleSettings();
  }
}

async function applyUITestOverrides() {
  try {
    const [{ value: uitestFlag }, { value: section }, { value: openSettings }, { value: disableAnimations }, { value: forcePro }, { value: freeMode }] = await Promise.all([
      Storage.get({ key: "uitest_flag" }),
      Storage.get({ key: "uitest_section" }),
      Storage.get({ key: "uitest_open_settings" }),
      Storage.get({ key: "uitest_disable_animations" }),
      Storage.get({ key: "uitest_force_pro" }),
      Storage.get({ key: "uitest_free_mode" }),
    ]);

    console.log("[UITest] applyUITestOverrides - uitest_flag:", uitestFlag, "uitest_free_mode:", freeMode);

    if (uitestFlag !== "1") {
      return;
    }

    // Check for FREE mode FIRST - this reverses any Pro enablement
    if (freeMode === "1") {
      console.log("[UITest] FREE mode requested - ENABLING CSS override for gated screenshots");
      // Add CSS class to html element that forces PRO badges to show via CSS
      document.documentElement.classList.add('uitest-free-mode');
      // Also try to remove pro-active class from body
      document.body.classList.remove('pro-active', 'web-pro-mode', 'in-trial');
      if (typeof ProAccess !== 'undefined') {
        ProAccess.isProActive = false;
        ProAccess.isInTrial = false;
        ProAccess.updateUI();
        console.log("[UITest] Pro disabled via CSS override - isProActive:", ProAccess.isProActive);
      }
    } else if (forcePro === "1" || forcePro?.toLowerCase() === "true") {
      // Force Pro access for UI tests (bypasses RevenueCat)
      console.log("[UITest] Forcing Pro access enabled");
      if (typeof ProAccess !== 'undefined') {
        ProAccess.isProActive = true;
        ProAccess.isInTrial = false; // Full Pro, not trial
        document.body.classList.add('pro-active', 'web-pro-mode');
        ProAccess.updateUI();
      }
    }

    const normalizedSection = (section || "").trim();
    const sectionKey = normalizedSection.toLowerCase();
    const sectionToShow = sectionKey === "quitplan" ? "quitPlan" : sectionKey;
    if (disableAnimations === "1" || disableAnimations?.toLowerCase() === "true") {
      document.documentElement.classList.add("uitest-no-animations");
    }

    if (sectionKey && sectionKey !== "home" && sectionKey !== "timer") {
      showSection(sectionToShow);
      // Second pass after DOM settles
      setTimeout(() => showSection(sectionToShow), 300);
    }

    if (openSettings === "1" || openSettings?.toLowerCase() === "true") {
      await ensureSettingsOpenForUITests();
    }
  } catch (e) {
    console.warn("[UITest] overrides failed", e);
  }
}

async function init() {
  // Check if this is a reset that should force onboarding
  const forceOnboarding = sessionStorage.getItem('forceOnboardingReset') === 'true';
  console.log('[INIT] forceOnboarding flag:', forceOnboarding);

  // Load state from storage first
  await loadState();

  // Check if there's a preserved theme from reset (restore user's theme preference)
  const preservedTheme = sessionStorage.getItem('preservedTheme');
  if (preservedTheme) {
    state.theme = preservedTheme;
    sessionStorage.removeItem('preservedTheme'); // Clear the flag after restoring
    console.log('[INIT] Restored theme preference after reset:', preservedTheme);
  }

  // AFTER loading state, check if we should force onboarding due to reset
  if (forceOnboarding) {
    sessionStorage.removeItem('forceOnboardingReset'); // Clear the flag
    state.firstRun = true; // Force onboarding (overrides loaded state)
    console.log('[INIT] Setting firstRun to TRUE due to reset (overriding loaded state)');
  }

  console.log('[INIT] After loadState - state.firstRun:', state.firstRun);

  // Check if we're running UI tests - if so, skip onboarding regardless of state
  try {
    const { value: uitestFlag } = await Storage.get({ key: "uitest_flag" });
    if (uitestFlag === "1") {
      console.log('[INIT] UI Test mode detected - skipping onboarding');
      state.firstRun = false;
    }
  } catch (e) {
    console.warn('[INIT] Failed to check UI test flag', e);
  }

  // Final safety check: If firstRun is false but there's NO user data, force onboarding
  // (but not if we're in UI test mode)
  const { value: uitestCheck } = await Storage.get({ key: "uitest_flag" }).catch(() => ({ value: null }));
  if (!state.firstRun && (!state.cigaretteLog || state.cigaretteLog.length === 0) && !state.lastCigarette && uitestCheck !== "1") {
    console.log('[INIT] No cigarette data found but firstRun was false - forcing onboarding');
    state.firstRun = true;
  }

  // Expose a debug getter for tests to inspect runtime state
  window.__getAppState = () => state;
  setDefaultQuitDateInputs();

  // Configure status bar based on platform
  const platform = Capacitor.getPlatform();

  if (platform === 'android') {
    // On Android: disable overlay to prevent content being pushed up
    if (StatusBar && StatusBar.setOverlaysWebView) {
      try {
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch (e) {
        console.warn("[StatusBar] setOverlaysWebView failed", e);
      }
    }

    // Set initial status bar style based on current theme
    await updateStatusBarForTheme();
  } else if (platform === 'ios') {
    // On iOS: enable overlay for full-screen experience
    if (StatusBar && StatusBar.setOverlaysWebView) {
      try {
        await StatusBar.setOverlaysWebView({ overlay: true });
      } catch (e) {
        console.warn("[StatusBar] setOverlaysWebView failed", e);
      }
    }
  }

  if (state.firstRun) {
    console.log('[INIT] Opening onboarding modal - firstRun is TRUE');
    const modal = document.getElementById("onboardingModal");
    console.log('[INIT] Modal element found:', !!modal);
    if (modal) {
      modal.classList.add("open");
      console.log('[INIT] Added .open class to modal, classes:', modal.className);
    }
    // Ensure wizard is in clean state (this also sets default quit date to today)
    resetWizard();
  } else {
    console.log('[INIT] NOT opening onboarding - firstRun is FALSE');
    startTimer();
    startTimerLoop();

    // Schedule interval notification if user has an active quit session
    if (state.lastCigarette) {
      scheduleNotification();
    }
  }

  // Initialize notification listeners (must be done early)
  initializeNotificationListeners();

  applyTheme();
  updateUI();
  updateStats(); // Initial stats calculation
  renderMilestones();
  renderAchievements();
  setRandomQuote();
  updateCoachMessage();
  updateSettingsUI();
  await refreshAppMetadata();
  renderReport();
  window.addEventListener("state-updated", scheduleUIRefresh);

  // Initialize enhanced coach features
  initializeCoachFeatures();

  // Setup coach event listeners
  setupCoachEventListeners();
  // Prime audio on first user gesture so sounds can play when timers complete
  window.addEventListener("pointerdown", primeAudioContext, { once: true });
  window.addEventListener("touchstart", primeAudioContext, { once: true });

  // Initialize timer fullscreen
  initTimerFullscreen();
  
  // Setup quit plan dropdown listener (for iOS compatibility)
  const quitPlanSelect = document.getElementById("quitPlanGranularity");
  if (quitPlanSelect) {
    quitPlanSelect.addEventListener("change", changeQuitPlanGranularity);
  }

  // Collapse background work into the timer loop
  startTimerLoop();

  setupPWA();
  setupOfflineDetection();
  registerServiceWorker();
  setupWatchBridgeListener();

  // Initialize Pro Access / IAP
  await ProAccess.init();

  // Initialize next milestone card
  updateNextMilestone();

  await applyUITestOverrides();

  document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible") {
      refreshStateFromStorage();
      // Refresh Pro status from RevenueCat when app comes back to foreground
      if (ProAccess && ProAccess.checkStatus) {
        await ProAccess.checkStatus().catch(err =>
          console.warn('[App] Pro status refresh failed:', err)
        );
      }
    } else {
      stopTimerLoop();
    }
  });

  console.log("[App] Initialization complete");
}

// ==================== PWA & SERVICE WORKER ====================
function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    console.warn("[SW] Not supported");
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", {
        scope: "/",
        updateViaCache: "none", // Always check for updates
      })
      .then((registration) => {
        swRegistration = registration;
        console.log("[SW] Registered:", registration.scope);

        // Check for updates every 60 seconds
        setInterval(() => {
          registration.update();
        }, 60000);

        // Listen for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          console.log("[SW] Update found");

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New SW installed, prompt user to reload
              showToast("Update available! Tap to refresh.", "info");
              setTimeout(() => {
                if (confirm("New version available! Reload now?")) {
                  window.location.reload();
                }
              }, 2000);
            }
          });
        });
      })
      .catch((err) => {
        console.error("[SW] Registration failed:", err);
      });
  });
}

async function setupPWA() {
  console.log("[PWA] Setting up PWA...");

  // Skip all PWA install prompts/sections when running as native iOS or Android app
  const isIosNative =
    window.Capacitor &&
    Capacitor.getPlatform &&
    Capacitor.getPlatform() === "ios";
  const isAndroidNative =
    window.Capacitor &&
    Capacitor.getPlatform &&
    Capacitor.getPlatform() === "android";
  if (isIosNative || isAndroidNative) {
    const banner = document.getElementById("installBanner");
    if (banner) banner.classList.remove("show");
    const installSection = document.getElementById("installSection");
    if (installSection) installSection.style.display = "none";
    return;
  }

  const { value: pwaDismissed } = await Storage.get({ key: "pwa_dismissed" });
  console.log("[PWA] Was dismissed before?", pwaDismissed);

  let promptFired = false;

  window.addEventListener("beforeinstallprompt", async (e) => {
    console.log("[PWA] beforeinstallprompt event FIRED!");
    promptFired = true;
    e.preventDefault();
    deferredPrompt = e;
    console.log("[PWA] Install prompt captured and ready");

    // Check if user dismissed before
    const { value: wasDismissed } = await Storage.get({
      key: "pwa_dismissed",
    });
    console.log("[PWA] Dismissed status:", wasDismissed);

    setTimeout(() => {
      console.log("[PWA] Showing install banner NOW");
      const banner = document.getElementById("installBanner");
      if (banner) {
        banner.classList.add("show");
        console.log("[PWA] Banner element found and show class added");
      } else {
        console.error("[PWA] Banner element NOT FOUND!");
      }
    }, 2000); // Reduced from 3s to 2s

    const installSection = document.getElementById("installSection");
    if (installSection) {
      installSection.style.display = "block";
      console.log("[PWA] Install section made visible");
    }
  });

  window.addEventListener("appinstalled", () => {
    console.log("✅ [PWA] App installed successfully!");
    deferredPrompt = null;
    const banner = document.getElementById("installBanner");
    if (banner) banner.classList.remove("show");
    const installSection = document.getElementById("installSection");
    if (installSection) installSection.style.display = "none";
    showToast("App installed! <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"feather feather-smartphone\"><rect x=\"5\" y=\"2\" width=\"14\" height=\"20\" rx=\"2\" ry=\"2\"></rect><line x1=\"12\" y1=\"18\" x2=\"12.01\" y2=\"18\"></line></svg>", "success");
  });

  // Check if already installed
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone;

  if (isStandalone) {
    console.log("[PWA] App is already installed (standalone mode)");
    const installSection = document.getElementById("installSection");
    if (installSection) installSection.style.display = "none";
  } else {
    console.log("[PWA] App is NOT installed - running in browser");

    // Show install section after delay if prompt hasn't fired
    setTimeout(() => {
      if (!promptFired) {
        console.log(
          "[PWA] beforeinstallprompt DID NOT FIRE after 5 seconds"
        );
        console.log(
          "[PWA] Showing install section anyway for manual installation"
        );
        const installSection = document.getElementById("installSection");
        if (installSection) {
          installSection.style.display = "block";
        }
      } else {
        console.log("✅ [PWA] beforeinstallprompt fired successfully");
      }
    }, 5000);
  }

  // Diagnostic check
  setTimeout(() => {
    const diagnostics = {
      https:
        location.protocol === "https:" || location.hostname === "localhost",
      serviceWorker: "serviceWorker" in navigator,
      manifest: !!document.querySelector('link[rel="manifest"]'),
      beforeinstallprompt: "onbeforeinstallprompt" in window,
      promptFired: promptFired,
      isStandalone: isStandalone,
      deferredPromptSet: !!deferredPrompt,
    };

    console.log("🔍 [PWA] Diagnostics:", diagnostics);

    // Show warning if criteria not met
    if (!diagnostics.https) console.error("❌ [PWA] Not secure context!");
    if (!diagnostics.serviceWorker)
      console.error("❌ [PWA] No service worker support!");
    if (!diagnostics.manifest) console.error("❌ [PWA] No manifest link!");
    if (!diagnostics.promptFired)
      console.warn("[PWA] Prompt did not fire - check manifest/SW/icons");
  }, 1000);
}

async function installPWA() {
  console.log("[PWA Install] Called, deferredPrompt:", !!deferredPrompt);

  if (deferredPrompt) {
    console.log("[PWA Install] Showing install prompt");
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log("[PWA Install] Outcome:", outcome);
      if (outcome === "accepted") {
        showToast('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-8.93"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> App installed successfully!', "success");
      } else {
        showToast("Install cancelled", "info");
      }
      deferredPrompt = null;
    } catch (err) {
      console.error("[PWA Install] Error:", err);
      showToast("Install failed: " + err.message, "error");
    }
  } else {
    console.log("[PWA Install] No deferred prompt available");
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;

    if (isStandalone) {
      showToast("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"feather feather-check-circle\"><path d=\"M22 11.08V12a10 10 0 1 1-5.93-8.93\"></path><polyline points=\"22 4 12 14.01 9 11.01\"></polyline></svg> App is already installed!", "success");
    } else if (isIOS) {
      showToast('iOS: Tap Share <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-share"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg> then "Add to Home Screen"', "info");
    } else if (isChrome) {
      showToast(
        'Chrome: Use the menu (⋮) → "Install app" or check the address bar for install icon',
        "info"
      );
    } else {
      showToast(
        'Check your browser menu for "Install" or "Add to Home Screen" option',
        "info"
      );
    }
  }
  document.getElementById("installBanner").classList.remove("show");
}

// ==================== THEME ====================
function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  applyTheme();
  saveState();
}
// Expose toggleTheme globally for inline HTML onclick
window.toggleTheme = toggleTheme;

async function updateStatusBarForTheme() {
  const platform = Capacitor.getPlatform();
  if (platform !== 'android') return;

  try {
    if (StatusBar && StatusBar.setStyle) {
      // DARK style = white icons (for dark mode)
      // LIGHT style = dark icons (for light mode)
      const style = state.theme === "dark" ? 'DARK' : 'LIGHT';
      await StatusBar.setStyle({ style: style });
    }

    if (StatusBar && StatusBar.setBackgroundColor) {
      const bgColor = state.theme === "dark" ? '#0a0a0f' : '#f5f5f7';
      await StatusBar.setBackgroundColor({ color: bgColor });
    }
  } catch (e) {
    console.warn('[updateStatusBarForTheme] failed', e);
  }
}

function applyTheme() {
  try {
    document.documentElement.setAttribute("data-theme", state.theme);
    const themeBtn = document.getElementById("themeBtn");
    if (themeBtn) {
      themeBtn.innerHTML =
        state.theme === "dark"
          ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-moon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>'
          : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sun"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
    }
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.content = state.theme === "dark" ? "#0a0a0f" : "#f5f5f7";
    }

    // Update status bar for Android
    updateStatusBarForTheme();
  } catch (e) {
    console.warn('[applyTheme] failed', e);
  }
}

// ==================== WATCH SNAPSHOT (shared to watchOS) ====================
function formatSmokeFreeDuration(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${Math.max(mins, 0)}m`;
}

// Build the payload that is stored for the watch and shared via WCSession.
function buildWatchSnapshot() {
  const lastCigaretteIso = state.lastCigarette
    ? state.lastCigarette.toISOString()
    : null;
  const lastCigaretteEpoch = state.lastCigarette
    ? state.lastCigarette.getTime()
    : null;

  // Calculate today's count
  const todayStr = new Date().toDateString();
  const todayCount = state.cigaretteLog.filter(
    (d) => new Date(d).toDateString() === todayStr
  ).length;

  return {
    type: "snapshot",
    smokeFreeDuration: formatSmokeFreeDuration(getElapsedSeconds()),
    streakDays: state.streak || 0,
    smokeFreeStreakDays: state.smokeFreeStreak || 0,
    cigarettesAvoided: getCigarettesAvoided(),
    moneySaved: getMoneySaved(),
    currency: state.currency || "USD",
    currencySymbol: getCurrencySymbol(),
    packPrice: state.packPrice || 0,
    cigsPerPack: state.cigsPerPack || 20,
    baselinePerDay: state.baselinePerDay || state.dailyLimit || 0,
    todayCount: todayCount,
    dailyLimit: state.dailyLimit || 0,
    achievements: Object.values(state.achievements || {}).map(
      (a) => a.title || ""
    ),
    targetInterval: state.targetInterval,
    cigaretteLog: (state.cigaretteLog || []).map((d) =>
      d instanceof Date ? d.toISOString() : new Date(d).toISOString()
    ),
    lastCigarette: lastCigaretteIso,
    lastCigaretteEpoch,
  };
}
window.buildWatchSnapshot = buildWatchSnapshot;

async function updateWatchSnapshot() {
  const now = Date.now();
  if (now - lastWatchSnapshotTs < WATCH_SNAPSHOT_MIN_INTERVAL) {
    return;
  }
  lastWatchSnapshotTs = now;
  try {
    const snapshot = buildWatchSnapshot();
    console.log("[Watch Snapshot] Updating:", {
      moneySaved: snapshot.moneySaved,
      cigarettesAvoided: snapshot.cigarettesAvoided,
      packPrice: state.packPrice,
      cigsPerPack: state.cigsPerPack,
      currency: snapshot.currency
    });
    await Storage.set({
      key: "watch_snapshot",
      value: JSON.stringify(snapshot),
    });
    
    // Also update widget data via App Groups (if native plugin available)
    await updateWidgetData(snapshot);
  } catch (e) {
    console.warn("[Watch] Failed to update snapshot", e);
  }
}
window.updateWatchSnapshot = updateWatchSnapshot;

// Update iOS Widget data via App Groups
async function updateWidgetData(snapshot) {
  // Check if WidgetKit plugin is available (native iOS only)
  if (window.Capacitor && Capacitor.isPluginAvailable("WidgetKit")) {
    try {
      const WidgetKit = Capacitor.Plugins.WidgetKit;
      
      // Set data in App Group UserDefaults
      await WidgetKit.setItem({
        key: "lastCigarette",
        value: String(snapshot.lastCigarette || 0),
        group: "group.com.lotriflow.quit"
      });
      
      await WidgetKit.setItem({
        key: "cigarettesAvoided",
        value: String(Math.round(getCigarettesAvoided())),
        group: "group.com.lotriflow.quit"
      });
      
      await WidgetKit.setItem({
        key: "moneySaved",
        value: String(getMoneySaved().toFixed(2)),
        group: "group.com.lotriflow.quit"
      });
      
      await WidgetKit.setItem({
        key: "streak",
        value: String(state.streak || 0),
        group: "group.com.lotriflow.quit"
      });
      
      await WidgetKit.setItem({
        key: "currencySymbol",
        value: getCurrencySymbol(),
        group: "group.com.lotriflow.quit"
      });
      
      // Request widget refresh
      await WidgetKit.reloadAllTimelines();
      console.log("[Widget] Data updated and timeline reloaded");
    } catch (e) {
      console.warn("[Widget] Failed to update widget data:", e);
    }
  }
}
window.updateWidgetData = updateWidgetData;

// ==================== STATE MANAGEMENT ====================
async function loadState() {
  try {
    // Check if this is a post-reset load that should clear state
    const clearState = sessionStorage.getItem('clearStateOnLoad') === 'true';
    if (clearState) {
      console.log('[Storage] clearStateOnLoad flag detected - reinitializing state');
      sessionStorage.removeItem('clearStateOnLoad');

      // Force reset to initial defaults (comprehensive reset)
      state.cigaretteLog = [];
      state.cravingsLog = [];
      state.lastCigarette = null;
      state.quitDate = null;
      state.totalAvoided = 0;
      state.achievements = {};
      state.coachMood = "neutral";
      state.conversationHistory = [];
      state.preferredBreathingTechnique = "478";
      state.moodLog = [];
      state.autoIncreaseAmount = 5;
      state.lastCoachInteraction = null;
      state.crisisMode = false;

      console.log('[Storage] State fully reinitialized - cigaretteLog:', state.cigaretteLog);
      return; // Skip loading from storage
    }

    // Load state from storage
    let { value: saved } = await Storage.get({
      key: STATE_KEY,
    });

    if (saved) {
      const parsed = JSON.parse(saved);
      const preserveLastCigarette = state.lastCigarette; // Preserve existing lastCigarette
      state = { ...state, ...parsed };
      // Convert lastCigarette from string to Date, or preserve existing value if parsed doesn't have one
      if (state.lastCigarette) {
        state.lastCigarette = new Date(state.lastCigarette);
      } else if (preserveLastCigarette && !parsed.lastCigarette) {
        // If parsed state doesn't have lastCigarette but we had one before, preserve it
        state.lastCigarette = preserveLastCigarette;
        console.warn('[loadState] Preserved existing lastCigarette, parsed state was missing it');
      } else {
        state.lastCigarette = null;
      }
      state.quitDate = state.quitDate ? new Date(state.quitDate) : null;
      state.cigaretteLog = (state.cigaretteLog || []).map((d) => new Date(d));
      state.cravingsLog = state.cravingsLog || [];
      state.achievements = state.achievements || {};
      state.currency = state.currency || "USD";
      // Prefer an explicit baseline; otherwise fall back to the user's daily limit so avoided/savings stay accurate.
      const parsedBaseline = Number(parsed.baselinePerDay);
      const parsedDailyLimit = Number(parsed.dailyLimit);
      const existingBaseline = Number(state.baselinePerDay);
      state.baselinePerDay =
        Number.isFinite(parsedBaseline) && parsedBaseline > 0
          ? parsedBaseline
          : Number.isFinite(parsedDailyLimit) && parsedDailyLimit > 0
          ? parsedDailyLimit
          : Number.isFinite(existingBaseline) && existingBaseline > 0
          ? existingBaseline
          : Number.isFinite(state.dailyLimit) && state.dailyLimit > 0
          ? state.dailyLimit
          : 10;
      // Enhanced coach state
      state.coachMood = state.coachMood || "neutral";
      state.conversationHistory = state.conversationHistory || [];
      state.preferredBreathingTechnique =
        state.preferredBreathingTechnique || "478";
      state.moodLog = state.moodLog || [];
      state.autoIncreaseAmount = state.autoIncreaseAmount || 5;
      if (typeof state.feedbackEnabled === "undefined") {
        state.feedbackEnabled = !!(state.soundEnabled && state.vibrationEnabled);
      }
      if (typeof state.notificationsMuted === "undefined") {
        state.notificationsMuted = false;
      }
      // Re-evaluate daily reminder support at runtime to accommodate dynamic plugin registration
      const isNative = isNativeApp();
      const supportsDailyReminder =
        !!(
          window.Capacitor &&
          ((typeof Capacitor.isPluginAvailable === 'function' && Capacitor.isPluginAvailable('LocalNotifications')) ||
            (Capacitor.Plugins && Capacitor.Plugins.LocalNotifications))
        ) || isNative || !!window.__test_supportsDailyReminder;
      console.warn('[Storage] supportsDailyReminder:', supportsDailyReminder, 'isNative:', isNative, 'CapacitorPresent:', !!window.Capacitor, '__test_flag:', !!window.__test_supportsDailyReminder);
      // Preserve user's saved preference even when plugin isn't currently detected.
      // The UI and scheduling logic will still disable or skip scheduling when not supported.
      state.dailyReminderEnabled = !!state.dailyReminderEnabled;

      // Clean up deprecated fields
      if ("performanceMode" in state) {
        delete state.performanceMode;
      }

      console.log("[Storage] State loaded successfully");
    } else {
      console.log("[Storage] No saved data found - this is first run");
      // No saved data means this is truly first run
      state.firstRun = true;
    }
    await updateWatchSnapshot();
  } catch (e) {
    console.error("[Storage] Load error:", e);
  }
}

// Reload persisted state when returning to the foreground (captures watch-side logs)
async function refreshStateFromStorage() {
  console.log("[refreshStateFromStorage] CALLED - About to reload state from storage");

  // Don't refresh if settings panel is open (to avoid overwriting unsaved changes)
  const settingsPanel = document.getElementById("settingsPanel");
  if (settingsPanel && settingsPanel.classList.contains("open")) {
    console.log("[refreshStateFromStorage] SKIPPED - Settings panel is open");
    return;
  }

  // Don't refresh if there's a pending save
  if (saveStateTimer) {
    console.log("[refreshStateFromStorage] SKIPPED - Pending save exists");
    return;
  }

  console.log("[refreshStateFromStorage] State BEFORE reload:", {
    baselinePerDay: state.baselinePerDay,
    dailyLimit: state.dailyLimit
  });

  await loadState();

  console.log("[refreshStateFromStorage] State AFTER reload:", {
    baselinePerDay: state.baselinePerDay,
    dailyLimit: state.dailyLimit
  });
  scheduleUIRefresh();
  await updateTimeBasedStats(); // Update money/avoided when state refreshes
}
window.refreshStateFromStorage = refreshStateFromStorage;

async function saveState(feedback = false) {
  try {
    const { performanceMode: _deprecatedPerfMode, ...stateToPersist } = state;
    const stateToSave = JSON.stringify({
      ...stateToPersist,
      lastCigarette: state.lastCigarette?.toISOString(),
      quitDate: state.quitDate?.toISOString(),
      cigaretteLog: state.cigaretteLog.map((d) => d.toISOString()),
      cravingsLog: state.cravingsLog || [],
      baselinePerDay: state.baselinePerDay,
    });

    console.log("[saveState] SAVING TO STORAGE:", {
      baselinePerDay: state.baselinePerDay,
      dailyLimit: state.dailyLimit,
      targetInterval: state.targetInterval,
      cigaretteLog_length: state.cigaretteLog.length
    });

    await Storage.set({
      key: STATE_KEY,
      value: stateToSave,
    });
    await updateWatchSnapshot();
    emitStateUpdated("save");

    if (feedback) showToast('Saved <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check"><polyline points="20 6 9 17 4 12"></polyline></svg>', "info");
  } catch (e) {
    console.error("[Storage] Save error:", e);
    showToast("Save error", "error");
  }
}
// Expose saveState for integration tests and external calls
window.saveState = saveState;
