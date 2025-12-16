// ==================== TIMER ====================
function startTimer() {
  if (!state.lastCigarette) {
    console.warn("[Timer] lastCigarette was null/undefined, initializing to now. Stack trace:", new Error().stack);
    state.lastCigarette = new Date();
    saveState();
  }
  startTimerLoop();
}

function startTimerLoop() {
  stopTimerLoop();
  // Update once per second to reduce render churn
  timerIntervalId = setInterval(() => {
    timerTickCount += 1;
    updateTimer();

    if (document.visibilityState !== "visible") {
      if (timerTickCount > 3600) timerTickCount = 0;
      return;
    }

    // Refresh milestone card every 5s
    if (timerTickCount % 5 === 0) updateNextMilestone();
    // Refresh time-based stats every 30s
    if (timerTickCount % 30 === 0) updateTimeBasedStats();
    // Coach update only when Coach tab active, max every 30s
    if (
      timerTickCount % 5 === 0 &&
      document.getElementById("coachSection")?.classList.contains("active")
    ) {
      const now = Date.now();
      if (now - lastCoachTick > COACH_MIN_INTERVAL) {
        lastCoachTick = now;
        updateCoachMessage();
      }
    }
    if (timerTickCount > 3600) timerTickCount = 0;
  }, 1000);
}

function stopTimerLoop() {
  if (timerFrameId) {
    cancelAnimationFrame(timerFrameId);
    timerFrameId = null;
  }
  if (timerIntervalId) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
    timerTickCount = 0;
  }
}

function emitStateUpdated(source = "unknown") {
  window.dispatchEvent(
    new CustomEvent("state-updated", {
      detail: { source, timestamp: Date.now() },
    })
  );
}

function scheduleUIRefresh() {
  if (pendingUIRefresh) return;
  pendingUIRefresh = true;
  requestAnimationFrame(async () => {
    pendingUIRefresh = false;
    updateUI();
    updateStats();
    await updateTimeBasedStats();
    renderReport();
    renderMilestones();
    renderAchievements();
    updateNextMilestone();
    checkAchievements();
  });
}

function setDefaultQuitDateInputs() {
  const todayStr = new Date().toISOString().split("T")[0];
  const quitValue = state.quitDate
    ? new Date(state.quitDate).toISOString().split("T")[0]
    : todayStr;

  const onboardingQuit = document.getElementById("setupQuitDate");
  if (onboardingQuit && !onboardingQuit.value) onboardingQuit.value = quitValue;

  const settingsQuit = document.getElementById("quitDateInput");
  if (settingsQuit && !settingsQuit.value) settingsQuit.value = quitValue;
}

function getElapsedSeconds() {
  if (!state.lastCigarette) return 0;
  return Math.floor((new Date() - state.lastCigarette) / 1000);
}

function getStartDate() {
  // If the user hasn't logged anything yet, use their last cigarette time
  // (set at the end of onboarding) so avoided/savings start at 0 and ramp up.
  if (state.cigaretteLog.length === 0 && state.lastCigarette) {
    return new Date(state.lastCigarette);
  }

  const candidates = [];
  if (state.quitDate) candidates.push(new Date(state.quitDate));
  if (state.cigaretteLog.length > 0) {
    const firstLog = new Date(
      Math.min(...state.cigaretteLog.map((d) => d.getTime()))
    );
    candidates.push(firstLog);
  }
  if (state.lastCigarette) candidates.push(new Date(state.lastCigarette));
  if (candidates.length === 0) return null;

  // Use the earliest timestamp as-is (no midnight rounding) so partial days
  // don't over-count avoided/savings right after onboarding.
  const minTime = Math.min(...candidates.map((d) => new Date(d).getTime()));
  return new Date(minTime);
}

function getTrackedDays() {
  const start = getStartDate();
  if (!start) return 0;
  const startDay = new Date(start);
  startDay.setHours(0, 0, 0, 0);
  const today = new Date();
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);
  const dayMs = 1000 * 60 * 60 * 24;
  return Math.max(1, Math.ceil((todayEnd - startDay) / dayMs));
}

function getCigarettesAvoided() {
  return calculateCigarettesAvoided(
    state.baselinePerDay || state.dailyLimit || 0,
    state.cigaretteLog,
    getStartDate() // Use getStartDate() which falls back to firstLog or lastCigarette
  );
}

function getMoneySaved() {
  return calculateMoneySaved(
    state.baselinePerDay || state.dailyLimit || 0,
    state.packPrice,
    state.cigsPerPack,
    state.cigaretteLog,
    getStartDate() // Use getStartDate() which falls back to firstLog or lastCigarette
  );
}

function getCurrencySymbol() {
  const symbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    AUD: "A$",
    CAD: "C$",
    CHF: "CHF",
    CNY: "¥",
    INR: "₹",
    RUB: "₽",
    BRL: "R$",
    ZAR: "R",
    MXN: "$",
    KRW: "₩",
    TRY: "₺",
    PLN: "zł",
    THB: "฿",
    IDR: "Rp",
    MYR: "RM",
    PHP: "₱",
    VND: "₫",
    AED: "AED",
    SAR: "SAR",
    EGP: "E£",
    NGN: "₦",
  };
  return symbols[state.currency] || "$";
}

async function updateTimer() {
  if (!state.lastCigarette) return;

  const elapsed = getElapsedSeconds();
  const target = state.targetInterval * 60;

  const d = Math.floor(elapsed / 86400);
  const h = Math.floor((elapsed % 86400) / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;

  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");

  if (daysEl && timerRenderCache.days !== d) {
    timerRenderCache.days = d;
    daysEl.textContent = String(d);
  }
  const paddedHours = String(h).padStart(2, "0");
  if (hoursEl && timerRenderCache.hours !== paddedHours) {
    timerRenderCache.hours = paddedHours;
    hoursEl.textContent = paddedHours;
  }
  const paddedMinutes = String(m).padStart(2, "0");
  if (minutesEl && timerRenderCache.minutes !== paddedMinutes) {
    timerRenderCache.minutes = paddedMinutes;
    minutesEl.textContent = paddedMinutes;
  }
  const paddedSeconds = String(s).padStart(2, "0");
  if (secondsEl && timerRenderCache.seconds !== paddedSeconds) {
    timerRenderCache.seconds = paddedSeconds;
    secondsEl.textContent = paddedSeconds;
  }

  const progress = Math.min(elapsed / target, 1);
  const circumference = 408.41;
  const progressRingEl = document.getElementById("progressRing");
  const progressPercentEl = document.getElementById("progressPercent");
  
  if (progressRingEl && timerRenderCache.progress !== progress) {
    progressRingEl.style.strokeDashoffset = circumference - progress * circumference;
    timerRenderCache.progress = progress;
  }
  const pctText = Math.floor(progress * 100) + "%";
  if (progressPercentEl && timerRenderCache.progressLabel !== pctText) {
    timerRenderCache.progressLabel = pctText;
    progressPercentEl.textContent = pctText;
  }

  const timerEl = document.getElementById("timerDigits");
  const smokeBtnText = document.getElementById("smokeBtnText");
  const mainActionBtn = document.querySelector(".main-action-btn");

  const goalAnchor = state.lastCigarette
    ? state.lastCigarette.getTime()
    : null;

  if (elapsed >= target) {
    if (timerEl) {
      timerEl.classList.add("can-smoke");
      timerEl.classList.remove("countdown-mode");
    }
    const progressRingEl = document.getElementById("progressRing");
    if (progressRingEl) {
      progressRingEl.classList.remove("countdown");
    }
    const subtext = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-clock"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Target interval complete`;
    const subEl = document.getElementById("timerSubtext");
    if (subEl && timerRenderCache.subtext !== subtext) {
      timerRenderCache.subtext = subtext;
      subEl.innerHTML = subtext;
    }
    if (smokeBtnText && timerRenderCache.smokeBtnText !== "Log Cigarette") {
      timerRenderCache.smokeBtnText = "Log Cigarette";
      smokeBtnText.textContent = "Log Cigarette";
    }
    const progressLabelEl = document.getElementById("progressLabel");
    if (progressLabelEl) {
      progressLabelEl.textContent = "complete";
    }
    if (mainActionBtn) {
      mainActionBtn.classList.remove("btn-early");
      mainActionBtn.classList.add("btn-ready");
    }

    // Notify once per interval, keyed to lastCigarette time to avoid repeats
    const goalKey = goalAnchor || 0;
    
    // Only notify if we have a valid goal key and haven't notified for this one yet
    if (goalKey > 0 && state.lastGoalNotified !== goalKey) {
      state.lastGoalNotified = goalKey;
      sessionLastGoalKey = goalKey;
      await notifyGoalReached();
      updateStats(); // Update stats when goal is reached
      updateWatchSnapshot(); // Sync to watch when goal reached (don't await - let it run async)
      await saveState(); // Save immediately to prevent duplicate notifications
    }
  } else {
    if (timerEl) {
      timerEl.classList.remove("can-smoke");
      timerEl.classList.add("countdown-mode");
    }
    const progressRingEl = document.getElementById("progressRing");
    if (progressRingEl) {
      progressRingEl.classList.add("countdown");
    }
    const rem = target - elapsed;
    const subtext = `⏳ ${Math.floor(rem / 60)}m ${rem % 60}s to goal`;
    const subEl = document.getElementById("timerSubtext");
    if (subEl && timerRenderCache.subtext !== subtext) {
      timerRenderCache.subtext = subtext;
      subEl.innerHTML = subtext;
    }
    if (smokeBtnText && timerRenderCache.smokeBtnText !== "Log Cigarette (Early)") {
      timerRenderCache.smokeBtnText = "Log Cigarette (Early)";
      smokeBtnText.textContent = "Log Cigarette (Early)";
    }
    const progressLabelEl = document.getElementById("progressLabel");
    if (progressLabelEl) {
      progressLabelEl.textContent = "to goal";
    }
    if (mainActionBtn) {
      mainActionBtn.classList.add("btn-early");
      mainActionBtn.classList.remove("btn-ready");
    }
  }
}

// Update Next Milestone Card
function updateNextMilestone() {
  const titleEl = document.getElementById("nextMilestoneTitle");
  const percentEl = document.getElementById("milestonePercent");
  const iconEl = document.getElementById("nextMilestoneIcon");
  const barEl = document.getElementById("nextMilestoneBar");
  
  // Guard against missing elements
  if (!titleEl || !percentEl) return;
  
  // If no last cigarette logged, show initial state
  if (!state.lastCigarette) {
    titleEl.textContent = "Start tracking to see progress";
    percentEl.textContent = "—";
    if (iconEl) iconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`;
    if (barEl) barEl.style.width = "0%";
    return;
  }
  
  const elapsed = getElapsedSeconds();
  
  // Find the next milestone
  let nextMilestone = null;
  for (const milestone of milestones) {
    if (elapsed < milestone.time) {
      nextMilestone = milestone;
      break;
    }
  }
  
  if (!nextMilestone) {
    // All milestones completed
    titleEl.textContent = "All milestones achieved!";
    percentEl.textContent = "100%";
    if (iconEl) iconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.89"></polyline></svg>`;
    if (barEl) barEl.style.width = "100%";
    return;
  }
  
  // Calculate progress to next milestone
  const prevMilestone = milestones.find((m, i) => 
    milestones[i + 1] === nextMilestone
  );
  const startTime = prevMilestone ? prevMilestone.time : 0;
  const endTime = nextMilestone.time;
  const totalDuration = endTime - startTime;
  const currentProgress = elapsed - startTime;
  const progressPercent = Math.max(0, Math.min(100, (currentProgress / totalDuration) * 100));
  
  // Update the UI
  titleEl.textContent = nextMilestone.title;
  percentEl.textContent = `${Math.floor(progressPercent)}%`;
  if (iconEl) iconEl.innerHTML = nextMilestone.icon;
  if (barEl) barEl.style.width = `${progressPercent}%`;
}

// Create falling cigarette animation
function createFallingCigarettes(count) {
  const container = document.getElementById('cigarette-animation-container');
  if (!container) return;

  // Limit to showing max 10 cigarettes at once
  const numToShow = Math.min(count, 10);

  for (let i = 0; i < numToShow; i++) {
    const cigarette = document.createElement('div');
    cigarette.className = 'falling-cigarette';
    cigarette.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="12" viewBox="0 0 24 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="16" height="4" rx="2" fill="currentColor"/><rect x="18" y="4" width="4" height="4" rx="2" fill="currentColor" opacity="0.7"/><line x1="20" y1="4" x2="20" y2="8" stroke="currentColor" stroke-width="0.5"/></svg>';

    // Random horizontal position (10% to 90% of screen width)
    const randomX = 10 + Math.random() * 80;
    cigarette.style.left = randomX + '%';

    // Stagger the start time slightly
    cigarette.style.animationDelay = (i * 0.1) + 's';

    container.appendChild(cigarette);

    // Remove element after animation completes
    setTimeout(() => {
      cigarette.remove();
    }, 2100 + (i * 100));
  }
}

// Create smoke plume animation
function createSmokePlume() {
  const container = document.getElementById('cigarette-animation-container');
  if (!container) return;

  // Create multiple smoke particles for a realistic plume effect
  const numParticles = 25 + Math.floor(Math.random() * 15); // 25-40 particles for ultra-dense smoke

  // Start from bottom third of screen (where cigarette would be)
  const centerX = 35 + Math.random() * 30; // 35-65% of screen width
  const startY = window.innerHeight * 0.7; // Start from lower position for better visibility

  for (let i = 0; i < numParticles; i++) {
    const particle = document.createElement('div');
    particle.className = 'smoke-particle';

    // Start sizes smaller for "exhale stream" look (20-60px), expanding via CSS
    const size = 20 + Math.random() * 40;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';

    // Tighter spread at source to simulate mouth/exhale point
    const spreadFactor = i / numParticles; 
    const offsetX = (Math.random() - 0.5) * (20 + spreadFactor * 30); // Tight ±10-25px
    const offsetY = (Math.random() - 0.5) * (15 + spreadFactor * 20); // Tight vertical
    particle.style.left = `calc(${centerX}% + ${offsetX}px)`;
    particle.style.top = `${startY + offsetY}px`;

    // Drift increases as smoke dissipates
    const turbulence = Math.random() > 0.5 ? 1.4 : 0.9;
    const driftX = (Math.random() - 0.5) * 180 * turbulence; 
    particle.style.setProperty('--drift-x', driftX + 'px');

    // Higher initial opacity for the "thick" part of the exhale
    // CSS keyframes handle the fade out
    const initialOpacity = 0.4 + Math.random() * 0.3; // 0.4-0.7
    particle.style.opacity = initialOpacity;

    const animations = ['smoke-rise', 'smoke-rise-alt', 'smoke-rise-slow'];
    const chosenAnimation = animations[Math.floor(Math.random() * animations.length)];

    // Duration for exhale physics (fast start -> slow drift)
    const duration = 3.5 + Math.random() * 2.5; // 3.5s - 6s
    particle.style.animation = `${chosenAnimation} ${duration}s cubic-bezier(0.2, 0.8, 0.4, 1) forwards`;

    // Stagger particle start times
    const baseDelay = i * 0.03;
    const jitter = Math.random() * 0.03; // Small random variation
    particle.style.animationDelay = (baseDelay + jitter) + 's';

    container.appendChild(particle);

    // Remove particle after animation completes
    setTimeout(() => {
      particle.remove();
    }, (duration * 1000) + (i * 50) + 200);
  }
}

function logCigarette() {
  window.logCigarette = logCigarette;
  const elapsed = getElapsedSeconds();
  const target = state.targetInterval * 60;

  const remainingRaw = target - elapsed;
  const isComplete = remainingRaw <= 0;
  const remaining = isComplete ? 0 : Math.ceil(remainingRaw);
  const early = !isComplete && remaining > 0;
  const remText =
    remaining > 60 ? `${Math.ceil(remaining / 60)} min` : `${Math.max(1, remaining)}s`;

  const titleEl = document.getElementById("smokeConfirmTitle");
  const messageEl = document.getElementById("smokeConfirmMessage");
  const primaryEl = document.getElementById("smokeConfirmPrimary");

  if (titleEl) {
    titleEl.textContent = early ? "Log before reaching your interval?" : "Log a cigarette?";
  }
  if (messageEl) {
    messageEl.textContent = early
      ? `Your ${state.targetInterval}-minute interval isn't complete yet. ${remText} remaining.\n\nLogging now will reset your smoke-free timer.`
      : "This will reset your smoke-free timer.";
  }
  if (primaryEl) {
    primaryEl.textContent = early ? "Yes, I smoked" : "Yes, I smoked";
  }

  pendingSmokeLog = { early };
  showModal("smokeConfirmModal");
}

function cancelLogCigarette() {
  pendingSmokeLog = null;
  closeModal("smokeConfirmModal");
}

async function confirmLogCigarette() {
  if (!pendingSmokeLog) {
    closeModal("smokeConfirmModal");
    return;
  }
  pendingSmokeLog = null;
  sessionLastGoalKey = null;

  const now = new Date();
  // Early smoke resets streak (commented out - streak is now calculated dynamically)

  state.cigaretteLog.push(now);
  state.lastCigarette = now;
  state.lastGoalNotified = 0; // Reset notification flag for next goal

  saveState();
  emitStateUpdated("log_cigarette");
  scheduleUIRefresh();
  await scheduleNotification();
  emitStateUpdated("log_cigarette");
  updateWatchSnapshot(); // Sync to watch after logging (don't await - let it run async)

  // Trigger falling cigarette animation
  // createFallingCigarettes(state.cigaretteLog.length);

  // Trigger smoke plume animation
  createSmokePlume();

  if (state.vibrationEnabled) triggerVibration(120);
  closeModal("smokeConfirmModal");
  showToast("Logged. Stay strong! <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"feather feather-zap\"><polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"></polygon></svg>", "success");
}

// Updates time-dependent stats (money saved, cigarettes avoided)
async function updateTimeBasedStats() {
  const moneySavedEl = document.getElementById("moneySaved");
  const cigarettesAvoidedEl = document.getElementById("cigarettesAvoided");
  const dailyAverageEl = document.getElementById("dailyAverage");
  const moneySavedSubtextEl = document.getElementById("moneySavedSubtext");
  
  const saved = getMoneySaved();
  const reduction = getCigarettesAvoided();
  const avoidedRounded = Math.round(reduction);
  const avoidedAbs = Math.abs(avoidedRounded);
  
  console.log("[MAIN STATS] reduction:", reduction, "moneySaved:", saved);
  
  // Calculate daily average for display
  const startDate = getStartDate();
  if (startDate) {
    const now = Date.now();
    const startMs = new Date(startDate).getTime();
    const dayMs = 1000 * 60 * 60 * 24;
    const elapsedDays = Math.max(1, (now - startMs) / dayMs);
    const actual = state.cigaretteLog.length;
    const dailyAverage = actual / elapsedDays;
    
    console.log("[Stats] updateTimeBasedStats - saved:", saved, "reduction:", reduction, "dailyAvg:", dailyAverage.toFixed(1), "hasElements:", !!moneySavedEl, !!cigarettesAvoidedEl);
    
    if (moneySavedEl) {
      const prefix = saved >= 0 ? getCurrencySymbol() : "-" + getCurrencySymbol();
      moneySavedEl.textContent = prefix + Math.abs(saved).toFixed(2);
      moneySavedEl.style.color = saved >= 0 ? "var(--primary-color)" : "#ff6b6b";
    }
    if (moneySavedSubtextEl) {
      moneySavedSubtextEl.textContent =
        saved >= 0
          ? "Below your baseline spend"
          : `Over baseline by ${getCurrencySymbol()}${Math.abs(saved).toFixed(2)}`;
    }
    if (cigarettesAvoidedEl) {
      cigarettesAvoidedEl.textContent =
        avoidedRounded > 0 ? "+" + avoidedRounded : avoidedRounded.toString();
      cigarettesAvoidedEl.style.color =
        avoidedRounded >= 0 ? "var(--primary-color)" : "#ff6b6b";
    }
    if (dailyAverageEl) {
      dailyAverageEl.textContent = dailyAverage.toFixed(1);
    }
  }
  
  // Update watch snapshot so phone/watch get the latest values
  emitStateUpdated("watch_log_cigarette");
  await updateWatchSnapshot();
}

// Updates event-dependent stats (streak, average interval)
function updateEventBasedStats() {
  // Calculate both streaks - only count complete days (not today)
  let streak = 0; // Days under limit
  let smokeFreeStreak = 0; // Days with zero cigarettes
  let date = new Date();
  date.setDate(date.getDate() - 1); // Start from yesterday, not today

  // Only calculate streak if we have cigarette logs or a start date
  if (state.cigaretteLog.length > 0 || state.lastCigarette) {
    const startDate = getStartDate();

    for (let i = 0; i < 365; i++) {
      // Set date to start of day for accurate comparison
      const dateStr = date.toDateString();
      // Stop counting if we've gone before the user started tracking
      if (!startDate || new Date(dateStr) < startDate) break;

      const dayLog = state.cigaretteLog.filter(
        (d) => d.toDateString() === date.toDateString()
      ).length;

      // Under-limit streak
      if (dayLog <= state.dailyLimit) streak++;
      else break;

      date.setDate(date.getDate() - 1);
    }

    // Calculate smoke-free streak (zero cigarettes only)
    date = new Date();
    date.setDate(date.getDate() - 1); // Reset and start from yesterday

    for (let i = 0; i < 365; i++) {
      const dateStr = date.toDateString();
      if (!startDate || new Date(dateStr) < startDate) break;

      const dayLog = state.cigaretteLog.filter(
        (d) => d.toDateString() === date.toDateString()
      ).length;

      // Smoke-free streak (must be exactly 0)
      if (dayLog === 0) smokeFreeStreak++;
      else break;

      date.setDate(date.getDate() - 1);
    }
  }

  state.streak = streak;
  state.smokeFreeStreak = smokeFreeStreak;
  const smokeFreeEl = document.getElementById("smokeFreeStreak");
  if (smokeFreeEl) smokeFreeEl.textContent = streak;
  const streakSubtextEl = document.getElementById("streakSubtext");
  if (streakSubtextEl) {
    streakSubtextEl.textContent = "Days under limit";
  }

  // Average interval
  if (state.cigaretteLog.length >= 2) {
    let total = 0;
    for (let i = 1; i < state.cigaretteLog.length; i++) {
      total += state.cigaretteLog[i] - state.cigaretteLog[i - 1];
    }
    const avgMin = Math.floor(total / (state.cigaretteLog.length - 1) / 60000);
    document.getElementById("avgInterval").textContent =
      avgMin >= 60
        ? Math.floor(avgMin / 60) + "h" + (avgMin % 60) + "m"
        : avgMin + "m";
  } else {
    document.getElementById("avgInterval").textContent = "--";
  }

  // Today's count
  updateTodaysCount();

  // Check auto-increase
  checkAutoIncrease();
}

function updateTodaysCount() {
  const todayStr = new Date().toDateString();
  const todayCount = state.cigaretteLog.filter(
    (ts) => new Date(ts).toDateString() === todayStr
  ).length;

  const todaysCountEl = document.getElementById("todaysCount");
  const todaysBaselineSubtextEl = document.getElementById("todaysBaselineSubtext");
  if (todaysCountEl) {
    todaysCountEl.textContent = `${todayCount} / ${state.dailyLimit}`;
    
    // Color code based on progress
    if (todayCount > state.dailyLimit) {
      todaysCountEl.style.color = "#ff6b6b"; // Red - over limit
    } else if (todayCount === state.dailyLimit) {
      todaysCountEl.style.color = "#ffa94d"; // Orange - at limit
    } else if (todayCount >= state.dailyLimit * 0.8) {
      todaysCountEl.style.color = "#ffd43b"; // Yellow - close to limit
    } else {
      todaysCountEl.style.color = "var(--primary-color)"; // Green - under limit
    }

    if (todaysBaselineSubtextEl) {
      const delta = todayCount - state.dailyLimit;
      if (delta > 0) {
        const s = delta === 1 ? "cigarette" : "cigarettes";
        todaysBaselineSubtextEl.textContent = `Over by ${delta} ${s}`;
        todaysBaselineSubtextEl.style.color = "#ff6b6b";
      } else if (delta < 0) {
        const abs = Math.abs(delta);
        const s = abs === 1 ? "cigarette" : "cigarettes";
        todaysBaselineSubtextEl.textContent = `Under by ${abs} ${s}`;
        todaysBaselineSubtextEl.style.color = "var(--text-secondary)";
      } else {
        todaysBaselineSubtextEl.textContent = "At your limit";
        todaysBaselineSubtextEl.style.color = "var(--text-secondary)";
      }
    }
  }
}

// Updates all stats (convenience function)
function updateStats() {
  updateTimeBasedStats();
  updateEventBasedStats();
}

// ==================== TIMER FULLSCREEN ====================
let isTimerFullscreen = false;
let fullscreenExitHint = null;

function initTimerFullscreen() {
  const timerEl = document.getElementById("mainTimer");
  if (!timerEl) return;

  // Add double-click listener
  timerEl.addEventListener("dblclick", toggleTimerFullscreen);

  // Add keyboard listener
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isTimerFullscreen) {
      exitTimerFullscreen();
    }
  });

  console.log("[Fullscreen] Timer fullscreen initialized");
}

function toggleTimerFullscreen() {
  if (isTimerFullscreen) {
    exitTimerFullscreen();
  } else {
    enterTimerFullscreen();
  }
}

function enterTimerFullscreen() {
  const timerDisplay = document.querySelector(".timer-display");
  if (!timerDisplay) return;

  console.log("[Fullscreen] Entering fullscreen mode");

  // Add fullscreen classes
  timerDisplay.classList.add("timer-fullscreen-mode");
  document.body.classList.add("timer-fullscreen");

  // Create exit hint
  fullscreenExitHint = document.createElement("div");
  fullscreenExitHint.className = "fullscreen-exit-hint";
  fullscreenExitHint.textContent = "Click anywhere or press ESC to exit";
  timerDisplay.appendChild(fullscreenExitHint);

  // Add click-to-exit listener
  timerDisplay.addEventListener("click", exitTimerFullscreen);

  // Mark as fullscreen
  isTimerFullscreen = true;

  // Vibrate if enabled
  if (state.vibrationEnabled) triggerVibration(50);

  // Log interaction
  logCoachInteraction("fullscreen_enter", true);
}

function exitTimerFullscreen() {
  const timerDisplay = document.querySelector(".timer-display");
  if (!timerDisplay) return;

  console.log("[Fullscreen] Exiting fullscreen mode");

  // Remove fullscreen classes
  timerDisplay.classList.remove("timer-fullscreen-mode");
  document.body.classList.remove("timer-fullscreen");

  // Remove exit hint
  if (fullscreenExitHint) {
    fullscreenExitHint.remove();
    fullscreenExitHint = null;
  }

  // Remove click listener
  timerDisplay.removeEventListener("click", exitTimerFullscreen);

  // Mark as not fullscreen
  isTimerFullscreen = false;

  // Vibrate if enabled
  if (state.vibrationEnabled) triggerVibration(50);

  // Log interaction
  logCoachInteraction("fullscreen_exit", false);
}

// Keyboard shortcut: F key
document.addEventListener("keydown", (e) => {
  if (e.key === "f" && !e.ctrlKey && !e.metaKey && !e.altKey) {
    // Only if not typing in input
    if (
      document.activeElement.tagName !== "INPUT" &&
      document.activeElement.tagName !== "TEXTAREA"
    ) {
      toggleTimerFullscreen();
    }
  }
});

function updateUI() {
  console.log("[updateUI] State values:", {
    baselinePerDay: state.baselinePerDay,
    dailyLimit: state.dailyLimit,
    targetInterval: state.targetInterval,
    cigaretteLog_length: state.cigaretteLog.length
  });
  updateTimer();
  renderMilestones();
  renderCravings();
  updateQuitPlan();
}

async function notifyGoalReached() {
  // Neutral, informative tone - not celebratory
  showToast('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-clock"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Target interval reached. You may smoke if needed.', "info");

  // Gentle notification sound (less celebratory)
  if (state.soundEnabled) {
    const ctx = ensureAudioContext();
    let playedSound = false;
    if (ctx) {
      try {
        // Two-note cue, slightly louder/longer to be more noticeable
        [440, 660].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          const start = ctx.currentTime + i * 0.15;
          gain.gain.setValueAtTime(0.18, start);
          gain.gain.exponentialRampToValueAtTime(0.01, start + 0.35);
          osc.start(start);
          osc.stop(start + 0.35);
        });
        playedSound = true;
      } catch (e) {
        console.warn("[Audio] Goal tone failed", e);
      }
    }
    // Fallback HTMLAudio blip if AudioContext failed or unavailable
    if (!playedSound && window.Audio) {
      try {
        const beep = new Audio(
          "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YQA"
        );
        beep.volume = 0.6;
        beep.play().catch(() => {});
        playedSound = true;
      } catch (_) {}
    }
    
    // iOS fallback: Use native haptics if audio didn't play
    if (!playedSound && window.Capacitor?.Plugins?.Haptics) {
      try {
        // Use "warning" type for goal reached - distinct double-tap pattern
        await window.Capacitor.Plugins.Haptics.notification({ type: 'warning' });
        console.log("[Audio] Used haptic fallback for goal notification");
      } catch (e) {
        console.warn("[Audio] Haptic fallback failed", e);
      }
    }
  }

  // Native iOS haptic feedback (always trigger on goal reached for better UX)
  if (window.Capacitor?.Plugins?.Haptics) {
    try {
      // Use success haptic for goal completion
      await window.Capacitor.Plugins.Haptics.notification({ type: 'SUCCESS' });
      console.log("[Haptics] Goal reached haptic triggered");
    } catch (e) {
      console.warn("[Haptics] Failed to trigger goal haptic", e);
    }
  } else if (state.vibrationEnabled) {
    // Fallback to web vibration API if Capacitor not available
    triggerVibration(200);
  }

  // Browser notification if enabled (works even when app is in background)
  if (state.notificationsEnabled && Notification.permission === "granted") {
    new Notification(`${state.targetInterval}-Minute Interval Reached!`, {
      body: "Your target interval is complete. You can now log a cigarette or continue staying smoke-free.",
      icon: "assets/icon-192x192.png",
      badge: "assets/icon-192x192.png",
      tag: "goal-reached", // Prevents duplicate notifications
      requireInteraction: false,
    });
  }
}

async function playSound() {
  let audioPlayed = false;
  
  // Try WebAudio first
  const ctx = ensureAudioContext();
  if (ctx) {
    try {
      // Resume context if suspended (iOS requirement)
      if (ctx.state === "suspended") {
        await ctx.resume();
      }
      
      // Play a pleasant chime sequence (C5, E5, G5)
      [523, 659, 784].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(
          0.01,
          ctx.currentTime + i * 0.15 + 0.25
        );
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.25);
      });
      audioPlayed = true;
      console.log("[Audio] Playing celebration tone via WebAudio");
    } catch (e) {
      console.warn("[Audio] WebAudio failed", e);
    }
  }
  
  // Fallback: Use Capacitor Haptics for audio-like feedback on native iOS
  if (!audioPlayed && isNativeApp()) {
    try {
      const { Haptics } = window.Capacitor?.Plugins || {};
      if (Haptics) {
        // Play a success haptic pattern as audio feedback
        await Haptics.notification({ type: 'SUCCESS' });
        console.log("[Audio] Fallback to haptic notification");
      }
    } catch (e) {
      console.warn("[Audio] Haptic fallback failed", e);
    }
  }
}

// Allow users to verify audio without waiting for the timer
async function testSound() {
  if (!state.soundEnabled) {
    showToast("Enable sound first", "info");
    return;
  }
  
  // Ensure audio context is ready
  const ctx = ensureAudioContext();
  if (ctx && ctx.state === "suspended") {
    await ctx.resume();
  }
  
  await playSound();
  showToast('Playing test sound <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-volume-2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>', "info");
}
// Test functions removed for production release

function testVibration() {
  if (!state.vibrationEnabled) {
    showToast("Enable vibration first", "info");
    return;
  }
  const success = triggerVibration(250);
  showToast(success ? 'Vibration sent <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check"><polyline points="20 6 9 17 4 12"></polyline></svg>' : "Vibration not supported", success ? "info" : "error");
}
// Test functions removed for production release

// ==================== TIMER MAXIMIZE ====================
function toggleTimerMaximize() {
  const timerDisplay = document.getElementById("timerDisplay");
  const overlay = document.getElementById("timerOverlay");
  const icon = document.getElementById("maximizeIcon");

  if (!timerDisplay || !overlay || !icon) return;

  if (timerDisplay.classList.contains("maximized")) {
    // Minimize
    timerDisplay.classList.remove("maximized");
    overlay.classList.remove("visible");
    icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>';
    document.body.style.overflow = "";
  } else {
    // Maximize
    timerDisplay.classList.add("maximized");
    overlay.classList.add("visible");
    icon.textContent = "×";
    document.body.style.overflow = "hidden";
  }
}

// Close on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const timerDisplay = document.getElementById("timerDisplay");
    if (timerDisplay && timerDisplay.classList.contains("maximized")) {
      toggleTimerMaximize();
    }
  }
});

async function dismissInstallBanner() {
  document.getElementById("installBanner").classList.remove("show");
  await Storage.set({ key: "pwa_dismissed", value: "true" });
}

function setupOfflineDetection() {
  const updateOnlineStatus = () => {
    document
      .getElementById("offlineBanner")
      .classList.toggle("show", !navigator.onLine);
  };
  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);
  updateOnlineStatus();
}
