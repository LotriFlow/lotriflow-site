// Small pure helpers to make automated testing easier without touching DOM/state.

function calculateCigarettesAvoided(
  baselinePerDay,
  cigaretteLog = [],
  quitDate = null,
  now = new Date()
) {
  if (!baselinePerDay || baselinePerDay <= 0) return 0;

  const nowDate = new Date(now);
  const nowMidnight = new Date(nowDate);
  nowMidnight.setHours(0, 0, 0, 0);

  let startDayMs;
  if (quitDate) {
    const quitDateObj = new Date(quitDate);
    const quitMidnight = new Date(quitDateObj);
    quitMidnight.setHours(0, 0, 0, 0);
    startDayMs = quitMidnight.getTime();
  } else if (cigaretteLog.length > 0) {
    const firstLogDate = new Date(
      Math.min(...cigaretteLog.map((d) => new Date(d).getTime()))
    );
    const startingMidnight = new Date(firstLogDate);
    startingMidnight.setHours(0, 0, 0, 0);
    startDayMs = startingMidnight.getTime();
  } else {
    return 0;
  }

  const msInDay = 1000 * 60 * 60 * 24;
  const diffMs = Math.max(0, nowMidnight.getTime() - startDayMs);
  const daysSinceQuit =
    Math.max(1, Math.floor(diffMs / msInDay) + 1);

  const totalBaseline = baselinePerDay * daysSinceQuit;
  return Math.round(totalBaseline - cigaretteLog.length);
}

function calculateMoneySaved(
  baselinePerDay,
  packPrice,
  cigsPerPack,
  cigaretteLog = [],
  quitDate = null,
  now = new Date()
) {
  if (!baselinePerDay || baselinePerDay <= 0 || !packPrice || !cigsPerPack) {
    return 0;
  }
  const avoided = calculateCigarettesAvoided(
    baselinePerDay,
    cigaretteLog,
    quitDate,
    now
  );
  const costPerCig = packPrice / cigsPerPack;
  const rawSavings = avoided * costPerCig;
  const rounded = Math.round(rawSavings * 100) / 100;
  return Object.is(rounded, -0) ? 0 : rounded;
}

function computeTimerState(lastCigarette, targetIntervalMinutes, now = new Date()) {
  if (!lastCigarette || !targetIntervalMinutes) {
    return {
      isEarly: false,
      elapsedSeconds: 0,
      remainingSeconds: 0,
    };
  }
  const elapsedSeconds = Math.max(
    0,
    Math.floor((now - new Date(lastCigarette)) / 1000)
  );
  const targetSeconds = targetIntervalMinutes * 60;
  const remainingSeconds = Math.max(0, targetSeconds - elapsedSeconds);
  return {
    isEarly: elapsedSeconds < targetSeconds,
    elapsedSeconds,
    remainingSeconds,
  };
}

// Expose as globals for browser
if (typeof window !== "undefined" && window) {
  window.calculateCigarettesAvoided = calculateCigarettesAvoided;
  window.calculateMoneySaved = calculateMoneySaved;
}

// Also export functions for Node/test environments
export { calculateCigarettesAvoided, calculateMoneySaved, computeTimerState };
