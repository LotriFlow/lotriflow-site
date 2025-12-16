// ==================== ONBOARDING WIZARD ====================
let currentWizardStep = 1;
let wizardQuitDate = null; // Store quit date when moving to step 4

function nextWizardStep(step) {
  // Validate current step before proceeding
  if (!validateWizardStep(currentWizardStep)) {
    return;
  }
  
  // Hide current slide
  const currentSlide = document.getElementById(`wizardStep${currentWizardStep}`);
  const currentStepIndicator = document.querySelector(`.wizard-step[data-step="${currentWizardStep}"]`);
  
  if (currentSlide) currentSlide.classList.remove('active');
  if (currentStepIndicator) {
    currentStepIndicator.classList.remove('active');
    currentStepIndicator.classList.add('completed');
  }
  
  // Show next slide
  currentWizardStep = step;
  const nextSlide = document.getElementById(`wizardStep${step}`);
  const nextStepIndicator = document.querySelector(`.wizard-step[data-step="${step}"]`);
  
  if (nextSlide) nextSlide.classList.add('active');
  if (nextStepIndicator) nextStepIndicator.classList.add('active');
  
  // Update summary on last step and capture quit date
  if (step === 4) {
    // Capture quit date before moving to summary (in case input gets cleared)
    const quitDateEl = document.getElementById('setupQuitDate');
    wizardQuitDate = quitDateEl?.value || null;
    console.log("[Wizard] Captured quit date on step 4:", wizardQuitDate);
    updateWizardSummary();
  }
}

function prevWizardStep(step) {
  // Hide current slide
  const currentSlide = document.getElementById(`wizardStep${currentWizardStep}`);
  const currentStepIndicator = document.querySelector(`.wizard-step[data-step="${currentWizardStep}"]`);
  
  if (currentSlide) currentSlide.classList.remove('active');
  if (currentStepIndicator) currentStepIndicator.classList.remove('active');
  
  // Show previous slide and remove completed state
  currentWizardStep = step;
  const prevSlide = document.getElementById(`wizardStep${step}`);
  const prevStepIndicator = document.querySelector(`.wizard-step[data-step="${step}"]`);
  
  if (prevSlide) prevSlide.classList.add('active');
  if (prevStepIndicator) {
    prevStepIndicator.classList.add('active');
    prevStepIndicator.classList.remove('completed');
  }
}

function validateWizardStep(step) {
  if (step === 2) {
    // Validate smoking habits
    const daily = parseInt(document.getElementById('setupDailySmokes')?.value);
    const interval = parseInt(document.getElementById('setupInterval')?.value);
    
    if (!daily || daily < 1) {
      showToast("Please enter how many cigarettes you smoke per day", "error");
      return false;
    }
    if (!interval || interval < 15) {
      showToast("Please set a target interval (minimum 15 minutes)", "error");
      return false;
    }
  }
  
  if (step === 3) {
    // Validate goals - quit date is optional (defaults to today)
    const price = parseFloat(document.getElementById('setupPackPrice')?.value);
    const cigsPerPack = parseInt(document.getElementById('setupCigsPerPack')?.value);
    
    if (!price || price < 1) {
      showToast("Please enter your pack price", "error");
      return false;
    }
    if (!cigsPerPack || cigsPerPack < 1) {
      showToast("Please enter cigarettes per pack", "error");
      return false;
    }
  }
  
  return true;
}

function adjustStepper(inputId, delta) {
  const input = document.getElementById(inputId);
  if (!input) return;
  
  const min = parseInt(input.min) || 1;
  const max = parseInt(input.max) || 999;
  let value = parseInt(input.value) || min;
  
  // Use the absolute value of delta as the step
  value += delta;
  value = Math.max(min, Math.min(max, value));
  input.value = value;
}

function updateWizardSummary() {
  const daily = document.getElementById('setupDailySmokes')?.value || '10';
  const interval = document.getElementById('setupInterval')?.value || '60';
  const quitDate = document.getElementById('setupQuitDate')?.value;
  const price = document.getElementById('setupPackPrice')?.value || '8';
  const currency = document.getElementById('setupCurrency')?.value || 'USD';
  const cigsPerPack = document.getElementById('setupCigsPerPack')?.value || '20';
  
  const currencySymbols = { USD: '$', EUR: '€', GBP: '£', AUD: 'A$', CAD: 'C$', ZAR: 'R' };
  const symbol = currencySymbols[currency] || '$';
  
  const summaryDaily = document.getElementById('summaryDaily');
  const summaryInterval = document.getElementById('summaryInterval');
  const summaryQuitDate = document.getElementById('summaryQuitDate');
  const summaryPrice = document.getElementById('summaryPrice');
  
  if (summaryDaily) summaryDaily.textContent = `${daily}/day`;
  if (summaryInterval) summaryInterval.textContent = `${interval} min`;
  if (summaryQuitDate) {
    summaryQuitDate.textContent = quitDate 
      ? new Date(quitDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Today';
  }
  if (summaryPrice) summaryPrice.textContent = `${symbol}${parseFloat(price).toFixed(2)}`;
}

function resetWizard() {
  // Reset to step 1
  currentWizardStep = 1;
  wizardQuitDate = null; // Clear captured date
  
  // Reset all slides
  document.querySelectorAll('.wizard-slide').forEach((slide, index) => {
    slide.classList.toggle('active', index === 0);
  });
  
  // Reset progress indicators
  document.querySelectorAll('.wizard-step').forEach((step, index) => {
    step.classList.toggle('active', index === 0);
    step.classList.remove('completed');
  });
  
  // Reset input values to defaults
  const setupDailySmokes = document.getElementById('setupDailySmokes');
  const setupDailyLimit = document.getElementById('setupDailyLimit');
  const setupInterval = document.getElementById('setupInterval');
  const setupPackPrice = document.getElementById('setupPackPrice');
  const setupCigsPerPack = document.getElementById('setupCigsPerPack');
  const setupCurrency = document.getElementById('setupCurrency');

  if (setupDailySmokes) setupDailySmokes.value = '10';
  if (setupDailyLimit) setupDailyLimit.value = '10';
  if (setupInterval) setupInterval.value = '60';
  if (setupPackPrice) setupPackPrice.value = '8';
  if (setupCigsPerPack) setupCigsPerPack.value = '20';
  if (setupCurrency) setupCurrency.value = 'USD';
  
  // Set default quit date to today
  const setupQuitDate = document.getElementById('setupQuitDate');
  if (setupQuitDate) {
    const todayStr = new Date().toISOString().split('T')[0];
    setupQuitDate.value = todayStr;
  }
  
  // Reset checkboxes
  const agreeTerms = document.getElementById('agreeTerms');
  const agreePrivacy = document.getElementById('agreePrivacy');
  if (agreeTerms) agreeTerms.checked = false;
  if (agreePrivacy) agreePrivacy.checked = false;
  
  // Hide error
  const agreementError = document.getElementById('agreementError');
  if (agreementError) agreementError.classList.remove('show');
}

async function completeOnboarding() {
  const termsChecked = document.getElementById("agreeTerms").checked;
  const privacyChecked = document.getElementById("agreePrivacy").checked;
  const agreementError = document.getElementById("agreementError");
  if (!termsChecked || !privacyChecked) {
    if (agreementError) {
      agreementError.classList.add("show");
      agreementError.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    showToast(
      "Please agree to the Terms of Service and Privacy Policy to continue.",
      "error"
    );
    return;
  } else if (agreementError) {
    agreementError.classList.remove("show");
  }
  
  // Get all values from wizard
  const dailySmokeVal = document.getElementById("setupDailySmokes").value;
  const dailyLimitVal = document.getElementById("setupDailyLimit")?.value || dailySmokeVal;
  const intervalVal = document.getElementById("setupInterval").value;
  const packPriceVal = document.getElementById("setupPackPrice").value;
  const cigsPerPackVal = document.getElementById("setupCigsPerPack")?.value;
  const currencyVal = document.getElementById("setupCurrency")?.value;

  console.log("[Onboarding] RAW VALUES FROM FORM:", {
    dailySmokeVal_raw: dailySmokeVal,
    dailyLimitVal_raw: dailyLimitVal,
    intervalVal_raw: intervalVal,
    packPriceVal_raw: packPriceVal,
    cigsPerPackVal_raw: cigsPerPackVal,
    currencyVal_raw: currencyVal
  });
  
  // Get quit date - check both value and valueAsDate for iOS compatibility
  const quitDateEl = document.getElementById("setupQuitDate");
  let quitDateInput = quitDateEl?.value || '';
  
  // Use captured date from step transition as fallback
  if (!quitDateInput && wizardQuitDate) {
    console.log("[Onboarding] Using captured quit date:", wizardQuitDate);
    quitDateInput = wizardQuitDate;
  }
  
  console.log("[Onboarding] Quit date element:", quitDateEl);
  console.log("[Onboarding] Quit date value:", quitDateInput);
  console.log("[Onboarding] Wizard captured date:", wizardQuitDate);
  
  console.log("[Onboarding] Saving values:", {
    dailySmokes: dailySmokeVal,
    dailyLimit: dailyLimitVal,
    interval: intervalVal,
    packPrice: packPriceVal,
    cigsPerPack: cigsPerPackVal,
    currency: currencyVal,
    quitDate: quitDateInput
  });

  // Clamp all values to reasonable ranges
  state.dailyLimit = Math.max(1, Math.min(50, parseInt(dailyLimitVal) || 10));
  state.targetInterval = clampTargetInterval(parseInt(intervalVal) || 60);
  // Always set baseline during onboarding - this is the user's starting smoking rate
  state.baselinePerDay = Math.max(1, Math.min(100, parseInt(dailySmokeVal) || 10));
  state.packPrice = Math.max(0.5, Math.min(100, parseFloat(packPriceVal) || 8));
  state.cigsPerPack = Math.max(10, Math.min(30, parseInt(cigsPerPackVal) || 20));
  state.currency = currencyVal || "USD";

  console.log("[Onboarding] VALUES SET TO STATE:", {
    dailyLimit: state.dailyLimit,
    baselinePerDay: state.baselinePerDay,
    targetInterval: state.targetInterval,
    packPrice: state.packPrice
  });
  
  state.firstRun = false;
  state.quitDate = quitDateInput
    ? new Date(quitDateInput + "T00:00:00")
    : new Date();
  state.lastCigarette = new Date();
  
  console.log("[Onboarding] State after save:", {
    dailyLimit: state.dailyLimit,
    baselinePerDay: state.baselinePerDay,
    targetInterval: state.targetInterval,
    packPrice: state.packPrice,
    cigsPerPack: state.cigsPerPack,
    currency: state.currency,
    quitDate: state.quitDate
  });
  
  await saveState();
  console.log("[Onboarding] STATE SAVED - Verifying values after save:", {
    dailyLimit: state.dailyLimit,
    baselinePerDay: state.baselinePerDay,
    targetInterval: state.targetInterval
  });

  document.getElementById("onboardingModal").classList.remove("open");
  startTimer();
  updateUI();
  updateSettingsUI(); // Update Settings UI with onboarding values
  updateStats(); // Update stats after onboarding
  renderReport();
  showToast("Welcome! Your journey begins", "success");
}

// Expose wizard functions globally for onclick handlers
window.nextWizardStep = nextWizardStep;
window.prevWizardStep = prevWizardStep;
window.adjustStepper = adjustStepper;
window.updateWizardSummary = updateWizardSummary;
window.completeOnboarding = completeOnboarding;
window.resetWizard = resetWizard;

// ==================== AUTO-INCREASE ====================
function checkAutoIncrease() {
  if (!state.autoIncrease) return;

  // Check if we should increase interval
  const now = new Date();
  const today = now.toDateString();

  // Check if we've already processed today
  if (state.lastAutoIncreaseCheck === today) {
    return; // Already checked today
  }

  // Check yesterday's performance
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const yesterdayLogs = state.cigaretteLog.filter(
    (log) => new Date(log).toDateString() === yesterdayStr
  ).length;

  // Successful if under or at limit
  const wasSuccessful = yesterdayLogs > 0 && yesterdayLogs <= state.dailyLimit;

  if (wasSuccessful) {
    // Increase interval!
    const oldInterval = state.targetInterval;
    const increaseAmount = state.autoIncreaseAmount || 5;
    const stepsToAdd = Math.max(
      1,
      Math.round(increaseAmount / TARGET_INTERVAL_STEP)
    );
    state.targetInterval = stepTargetInterval(state.targetInterval, stepsToAdd);

    if (state.targetInterval > oldInterval) {
      // Mark as checked
      state.lastAutoIncreaseCheck = today;
      saveState();

      // Notify user
      const message = `Great job yesterday! Your target interval increased from ${oldInterval} to ${state.targetInterval} minutes.`;

      // Show celebration
      showToast(message, "success");

      // Update UI
      updateSettingsUI();

      // Log event
      logCoachInteraction("auto_increase", {
        oldInterval,
        newInterval: state.targetInterval,
        yesterdayLogs,
      });

      // Celebrate with sound/vibration
      if (state.soundEnabled) playSound();
      if (state.vibrationEnabled && navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }

      console.log(
        "[Auto-Increase] Interval increased:",
        oldInterval,
        "->",
        state.targetInterval
      );
    }
  } else {
    // Not successful, just mark as checked
    state.lastAutoIncreaseCheck = today;
    saveState();

    if (yesterdayLogs > state.dailyLimit) {
      console.log(
        "[Auto-Increase] Yesterday over limit:",
        yesterdayLogs,
        "/",
        state.dailyLimit
      );
    }
  }
}

// Manual trigger (for testing)
function triggerAutoIncrease() {
  delete state.lastAutoIncreaseCheck;
  checkAutoIncrease();
}

// ==================== SECTIONS & NAVIGATION ====================
// ==================== REPORTS ====================
// Note: showSection is defined later in the file (line ~2754)

function renderReport() {
  // Update progression metrics
  const totalSmoked = state.cigaretteLog.length;
  const totalAvoidedCount = getCigarettesAvoided();
  const totalAvoidedRounded = Math.round(totalAvoidedCount);
  const totalAvoidedAbs = Math.abs(totalAvoidedRounded);

  document.getElementById("totalSmoked").textContent = totalSmoked;
  const totalAvoidedEl = document.getElementById("totalAvoided");
  if (totalAvoidedEl) {
    totalAvoidedEl.textContent =
      totalAvoidedRounded > 0
        ? "+" + totalAvoidedRounded
        : totalAvoidedRounded.toString();
    totalAvoidedEl.style.color =
      totalAvoidedRounded >= 0 ? "var(--text-primary)" : "#ff6b6b";
  }

  const now = new Date();
  let days = currentChartDays;

  // Get daily data first
  const dailyData = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const count = state.cigaretteLog.filter(
      (d) => d.toDateString() === date.toDateString()
    ).length;
    dailyData.push({ date, count, overLimit: count > state.dailyLimit });
  }

  // For 14D and 30D views, aggregate into weeks
  let data = dailyData;
  let isWeeklyView = false;

  if (days > 7) {
    isWeeklyView = true;
    const weeklyData = [];
    const numWeeks = Math.ceil(days / 7);

    for (let w = 0; w < numWeeks; w++) {
      const weekStart = w * 7;
      const weekEnd = Math.min(weekStart + 7, dailyData.length);
      const weekDays = dailyData.slice(weekStart, weekEnd);

      const weekTotal = weekDays.reduce((sum, d) => sum + d.count, 0);
      const weekAvg = weekTotal / weekDays.length;
      const weekDate = weekDays[weekDays.length - 1].date; // Use last day as reference

      weeklyData.push({
        date: weekDate,
        count: weekAvg,
        total: weekTotal,
        daysInWeek: weekDays.length,
        overLimit: weekAvg > state.dailyLimit,
        weekNumber: w + 1
      });
    }

    data = weeklyData;
  }

  // Better scaling: use limit + 2 as max, or actual max if higher
  // This gives meaningful bar heights even with low counts
  const actualMax = Math.max(...data.map((d) => d.count));
  const maxCount = Math.max(actualMax, state.dailyLimit + 2, 5);
  const limitLineHeight = (state.dailyLimit / maxCount) * 100;

  // Add limit line to the chart (only show if limit is meaningful)
  const limitLine = state.dailyLimit > 0 && state.dailyLimit < maxCount ? `
    <div style="
      position: absolute;
      bottom: ${limitLineHeight}%;
      left: 8px;
      right: 8px;
      height: 2px;
      background: linear-gradient(to right, transparent, rgba(255, 149, 0, 0.8), rgba(255, 149, 0, 0.8), transparent);
      pointer-events: none;
      z-index: 2;
      box-shadow: 0 1px 4px rgba(255, 149, 0, 0.3);
    ">
      <div style="
        position: absolute;
        right: 8px;
        top: -12px;
        font-size: 0.68rem;
        color: #ff9500;
        background: var(--bg-card);
        padding: 3px 8px;
        border-radius: 6px;
        font-weight: 700;
        border: 1.5px solid rgba(255, 149, 0, 0.4);
        box-shadow: 0 2px 6px rgba(255, 149, 0, 0.2);
        letter-spacing: 0.02em;
        text-transform: uppercase;
        font-family: 'Orbitron', monospace;
      ">Goal: ${state.dailyLimit}</div>
    </div>
  ` : '';

  const today = new Date().toDateString();

  document.getElementById("barChart").innerHTML =
    limitLine +
    data
      .map((d) => {
        // Calculate height as percentage, with minimum visible height for any value
        let height = (d.count / maxCount) * 100;
        // Ensure bars are visible: zero = 8%, others scale from 15% to 100%
        if (d.count === 0 || d.count < 0.1) {
          height = 8;
        } else {
          height = Math.max(15, height);
        }

        const isToday = !isWeeklyView && d.date.toDateString() === today;

        // Generate label based on view
        let label = "";
        if (isWeeklyView) {
          // Weekly view: show week numbers
          label = `W${d.weekNumber}`;
        } else {
          // Daily view (7D): show day of week
          label = ["S", "M", "T", "W", "T", "F", "S"][d.date.getDay()];
        }

        // Color coding
        let barColor = "";
        let barOpacity = "";
        if (d.count === 0 || d.count < 0.1) {
          barColor = "background: var(--accent-green);";
          barOpacity = "opacity: 0.6;";
        } else if (d.overLimit) {
          barColor = "background: var(--accent-orange);";
        } else {
          barColor = "background: var(--accent-blue);";
        }

        // Display value (rounded for weekly view)
        const displayValue = isWeeklyView
          ? d.count.toFixed(1)
          : (d.count > 0 ? d.count : "0");

        return `<div class="bar-group" style="${isToday ? "transform: scale(1.05);" : ""}">
        <div class="bar-value" style="color: ${
          d.count === 0 || d.count < 0.1
            ? "var(--accent-green)"
            : d.overLimit
            ? "var(--accent-orange)"
            : "var(--text-primary)"
        }; font-weight: ${d.count > 0 ? "700" : "600"}; ${isToday ? "font-size: 0.85rem;" : ""}">
          ${displayValue}
        </div>
        <div class="bar" style="height:${height}%; ${barColor} ${barOpacity} ${
          isToday
            ? "border: 2px solid var(--accent-green); box-shadow: 0 0 12px rgba(0, 255, 136, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2);"
            : ""
        }"></div>
        <div class="bar-label" style="${
          isToday ? "color: var(--accent-green); font-weight: 700; font-size: 0.75rem;" : ""
        }">
          ${label}${isToday ? " •" : ""}
        </div>
      </div>`;
      })
      .join("");

  // Calculate stats using daily data for accuracy
  const total = dailyData.reduce((s, d) => s + d.count, 0);
  document.getElementById("reportTotal").textContent = total;
  const avgDaily = dailyData.length > 0 ? total / dailyData.length : 0;
  document.getElementById("reportAvg").textContent = avgDaily.toFixed(1);

  // Best day (lowest count) - use daily data
  const bestDay = Math.min(...dailyData.map(d => d.count));
  document.getElementById("reportBest").textContent = bestDay;

  // Trend analysis - use daily data
  analyzeTrend(dailyData);

  // Estimated avoided vs current limit for this view
  const expectedWindow = state.dailyLimit * days;
  const deltaWindow = expectedWindow - total;
  const avoidedPctWindow =
    expectedWindow > 0
      ? Math.round((Math.abs(deltaWindow) / expectedWindow) * 100)
      : 0;
  const avoidedWindowEl = document.getElementById("avoidedPercentage");
  if (avoidedWindowEl) {
    avoidedWindowEl.textContent =
      deltaWindow >= 0
        ? `${avoidedPctWindow}% under limit last ${days}d`
        : `${avoidedPctWindow}% over limit last ${days}d`;
    avoidedWindowEl.style.color =
      deltaWindow >= 0 ? "var(--text-secondary)" : "#ff6b6b";
  }

  // Clarify baseline delta for overall avoided
  if (avoidedWindowEl && totalAvoidedRounded !== 0) {
    avoidedWindowEl.textContent +=
      totalAvoidedRounded > 0
        ? ` · ${totalAvoidedAbs} fewer than baseline`
        : ` · ${totalAvoidedAbs} over baseline`;
  }

  updateQuitPlan();
}

function analyzeTrend(data) {
  if (data.length < 3) {
    document.getElementById("trendValue").textContent = "Need more data";
    document.getElementById("trendChange").textContent = "";
    document.getElementById("trendIcon").innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 9l-5 5-3-3-5 5"/></svg>';
    return;
  }

  // Split data into first half and second half
  const midpoint = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, midpoint);
  const secondHalf = data.slice(midpoint);

  const firstAvg = firstHalf.reduce((s, d) => s + d.count, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((s, d) => s + d.count, 0) / secondHalf.length;

  const change = firstAvg - secondAvg;
  const absChange = Math.abs(change);

  // Use absolute change for threshold when numbers are low
  const threshold = firstAvg > 2 ? 0.1 : 0.3; // 10% for normal, 0.3 cigarettes for low counts
  const isSignificant = absChange > threshold;

  let trendText = "";
  let trendClass = "";
  let icon = "Chart";
  let changeText = "";

  if (!isSignificant) {
    trendText = "Steady";
    trendClass = "neutral";
    icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>';
    changeText = "Consistent levels";
  } else if (change > 0) {
    trendText = "Improving!";
    trendClass = "positive";
    icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>';
    const reduction = absChange.toFixed(1);
    changeText = reduction === "0.0" ? "Much better!" : `↓ ${reduction} fewer per day`;
  } else {
    trendText = "Increasing";
    trendClass = "negative";
    icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    changeText = `↑ ${absChange.toFixed(1)} more per day`;
  }

  document.getElementById("trendValue").textContent = trendText;
  document.getElementById("trendChange").textContent = changeText;
  document.getElementById("trendChange").className = `trend-change ${trendClass}`;
  const trendIconEl = document.getElementById("trendIcon");
  if (trendIconEl) {
    trendIconEl.innerHTML = icon;
  }

  // Update label
  const trendLabelEl = document.querySelector(".trend-label");
  if (trendLabelEl) {
    trendLabelEl.textContent = `${currentChartDays}-Day Trend`;
  }
}

function changeChartView(days) {
  // Check Pro access for 14D and 30D views
  if (days > 7 && !ProAccess.requirePro('Advanced Analytics (14D/30D views)')) {
    return;
  }

  currentChartDays = days;

  // Update button states
  document.querySelectorAll(".chart-view-btn").forEach(btn => {
    btn.classList.remove("active");
    if (parseInt(btn.getAttribute("data-days")) === days) {
      btn.classList.add("active");
    }
  });

  // Re-render the report with new time window
  renderReport();
}
window.changeChartView = changeChartView;
window.logCraving = logCraving;

// ==================== CRAVINGS LOG ====================
function logCraving(triggerPreset = "") {
  // Navigation already gates this section; if access is questionable, show a hint but continue so Pro users never get blocked mid-flow
  try {
    const proStatus = (localStorage.getItem("lotriflow_pro_status") || "").toLowerCase();
    const proTrial = (localStorage.getItem("lotriflow_pro_trial") || "").toLowerCase();
    const proPlan = (localStorage.getItem("lotriflow_pro_plan_label") || "").toLowerCase();
    const hasProHint =
      document.body.classList.contains("pro-active") ||
      proStatus.includes("active") ||
      proTrial.includes("active") ||
      proPlan.includes("pro");
    let hasAccess = hasProHint;
    if (!hasAccess && typeof ProAccess !== "undefined" && typeof ProAccess.hasAccess === "function") {
      hasAccess = ProAccess.hasAccess();
    }
    if (!hasAccess) {
      showToast(buildProToastMessage("Craving Tracker & Pattern Analysis", false), "info");
    }
  } catch (proErr) {
    console.warn("[Cravings] Pro gate check skipped:", proErr);
  }

  const triggerInput = document.getElementById("cravingTriggerInput");
  const notesInput = document.getElementById("cravingNotesInput");

  // Ensure cravings log is initialized
  state.cravingsLog = state.cravingsLog || [];

  const trigger = (triggerPreset || triggerInput?.value || "").trim();
  const notes = (notesInput?.value || "").trim();

  if (!trigger && !notes) {
    showToast("Add a trigger or note to log this craving", "error");
    return;
  }

  const entry = {
    id: Date.now(),
    trigger: trigger || "Unspecified trigger",
    notes,
    createdAt: new Date().toISOString(),
  };

  state.cravingsLog = [entry, ...(state.cravingsLog || [])].slice(0, 50);

  if (triggerInput) triggerInput.value = "";
  if (notesInput) notesInput.value = "";

  // Persist cravings log directly to storage even if broader state save fails
  try {
    const existing = localStorage.getItem("lotriflow_quit_state");
    const parsed = existing ? JSON.parse(existing) : {};
    parsed.cravingsLog = state.cravingsLog;
    localStorage.setItem("lotriflow_quit_state", JSON.stringify(parsed));
  } catch (persistErr) {
    console.warn("[Cravings] Direct persist failed", persistErr);
  }

  renderCravings();
  try {
    saveState();
  } catch (err) {
    // If full state save fails (e.g., bad legacy data), at least persist cravings log
    try {
      const existing = localStorage.getItem("lotriflow_quit_state");
      const parsed = existing ? JSON.parse(existing) : {};
      parsed.cravingsLog = state.cravingsLog;
      localStorage.setItem("lotriflow_quit_state", JSON.stringify(parsed));
      console.warn("[Cravings] Fallback save applied:", err);
    } catch (innerErr) {
      console.error("[Cravings] Failed to persist log", innerErr);
    }
  }
  emitStateUpdated("log_craving");
  scheduleUIRefresh();
  showToast(`Craving logged${trigger ? `: ${trigger}` : ""}`, "success");
}

function renderCravings() {
  const listEl = document.getElementById("cravingsList");
  if (!listEl) return;

  const entries = state.cravingsLog || [];
  if (entries.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state">
        No cravings logged yet. Track triggers and what helped so you can spot patterns.
      </div>
    `;
    return;
  }

  listEl.innerHTML = entries
    .slice(0, 20)
    .map((entry) => {
      const when = formatRelativeTimeFromNow(entry.createdAt);
      const notes =
        entry.notes && entry.notes.trim().length > 0
          ? escapeHtml(entry.notes)
          : "No notes added";

      return `
        <div class="craving-card">
          <div class="craving-card-header">
            <div>
              <div class="craving-trigger">${escapeHtml(entry.trigger)}</div>
              <div class="craving-time">${when}</div>
            </div>
            <button
              class="craving-delete"
              aria-label="Delete craving entry"
              data-id="${entry.id}"
            >
              ×
            </button>
          </div>
          <div class="craving-notes">${notes}</div>
        </div>
      `;
    })
    .join("");

  // Use event delegation - attach one listener to the parent instead of individual listeners
  // Remove any existing listener first to prevent duplicates
  listEl.removeEventListener('click', handleCravingDelete);
  listEl.addEventListener('click', handleCravingDelete);

  // Render pattern analysis
  renderCravingPatterns();
}

// Event handler for delete button clicks using event delegation
function handleCravingDelete(e) {
  // Check if the clicked element is a delete button
  if (e.target && e.target.classList.contains('craving-delete')) {
    e.preventDefault();
    e.stopPropagation();
    
    const id = e.target.getAttribute('data-id');
    if (id) {
      // Use a longer timeout to ensure the click event completes
      setTimeout(() => deleteCraving(id), 100);
    }
  }
}

function renderCravingPatterns() {
  const patternsEl = document.getElementById("cravingPatterns");
  if (!patternsEl) return;

  const entries = state.cravingsLog || [];

  if (entries.length < 3) {
    patternsEl.innerHTML = `
      <div class="empty-state">
        Log at least 3 cravings to see pattern insights
      </div>
    `;
    return;
  }

  // Analyze patterns
  const triggerCounts = {};
  const hourCounts = Array(24).fill(0);
  const dayCounts = Array(7).fill(0);

  entries.forEach(entry => {
    // Count triggers
    const trigger = entry.trigger.toLowerCase().trim();
    triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;

    // Count by hour of day
    const hour = new Date(entry.createdAt).getHours();
    hourCounts[hour]++;

    // Count by day of week
    const day = new Date(entry.createdAt).getDay();
    dayCounts[day]++;
  });

  // Find top triggers
  const topTriggers = Object.entries(triggerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Find peak hours
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
  const peakHourEnd = (peakHour + 1) % 24;

  // Find peak day
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const peakDay = dayCounts.indexOf(Math.max(...dayCounts));

  // Calculate recent trend (last 7 days vs previous 7 days)
  const now = new Date();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

  const recentCount = entries.filter(e => new Date(e.createdAt) >= sevenDaysAgo).length;
  const previousCount = entries.filter(e =>
    new Date(e.createdAt) >= fourteenDaysAgo && new Date(e.createdAt) < sevenDaysAgo
  ).length;

  let trendIcon = '→';
  let trendText = 'Steady';
  let trendColor = 'var(--text-secondary)';

  if (recentCount < previousCount) {
    trendIcon = '↓';
    trendText = 'Improving';
    trendColor = 'var(--accent-green)';
  } else if (recentCount > previousCount) {
    trendIcon = '↑';
    trendText = 'Worsening';
    trendColor = 'var(--accent-orange)';
  }

  // Render insights
  patternsEl.innerHTML = `
    <div class="pattern-grid">
      <div class="pattern-card">
        <div class="pattern-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M4 20V8m6 12V4m6 16v-8m4 8H2"/></svg></div>
        <div class="pattern-content">
          <div class="pattern-label">Most Common Triggers</div>
          <div class="pattern-value">
            ${topTriggers.map(([trigger, count]) =>
              `<div class="trigger-stat">
                <span class="trigger-name">${escapeHtml(trigger)}</span>
                <span class="trigger-count">${count}×</span>
              </div>`
            ).join('')}
          </div>
        </div>
      </div>

      <div class="pattern-card">
        <div class="pattern-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
        <div class="pattern-content">
          <div class="pattern-label">Peak Time</div>
          <div class="pattern-value-large">${peakHour}:00 - ${peakHourEnd}:00</div>
          <div class="pattern-subtext">Most cravings occur during this hour</div>
        </div>
      </div>

      <div class="pattern-card">
        <div class="pattern-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 9h16M9 3v4M15 3v4"/><path d="M9 13h6"/></svg></div>
        <div class="pattern-content">
          <div class="pattern-label">Peak Day</div>
          <div class="pattern-value-large">${dayNames[peakDay]}</div>
          <div class="pattern-subtext">Plan extra support on this day</div>
        </div>
      </div>

      <div class="pattern-card">
        <div class="pattern-icon" style="color: ${trendColor}">${trendIcon}</div>
        <div class="pattern-content">
          <div class="pattern-label">7-Day Trend</div>
          <div class="pattern-value-large" style="color: ${trendColor}">${trendText}</div>
          <div class="pattern-subtext">${recentCount} cravings (vs ${previousCount} previous week)</div>
        </div>
      </div>
    </div>
  `;
}

function deleteCraving(id) {
  // Convert id to number if it's a string (from HTML onclick)
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  state.cravingsLog = (state.cravingsLog || []).filter((e) => e.id !== numId);
  saveState();
  showToast("Craving removed", "info");
  
  // Defer re-rendering to avoid DOM conflicts during click events
  setTimeout(() => {
    renderCravings();
  }, 100);
}

// Expose for testing
window.deleteCraving = deleteCraving;

function formatRelativeTimeFromNow(dateInput) {
  const d = new Date(dateInput);
  if (isNaN(d)) return "";
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return d.toLocaleDateString();
}

function updateQuitPlan() {
  const card = document.getElementById("quitPlanCard");
  const headlineEl = document.getElementById("quitPlanHeadline");
  const detailEl = document.getElementById("quitPlanDetail");
  const buttonEl = document.getElementById("quitPlanButton");
  if (!card || !headlineEl || !detailEl) return;

  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0));

  if (!state.quitDate) {
    headlineEl.textContent = "Set your quit date";
    detailEl.textContent = "Pick a target day to get a tailored prep plan.";
    if (buttonEl) buttonEl.disabled = true;
    return;
  }

  const quitDate = new Date(state.quitDate);
  const quitStart = new Date(quitDate.setHours(0, 0, 0, 0));
  const diffDays = Math.round(
    (quitStart.getTime() - todayStart.getTime()) / 86400000
  );

  if (diffDays > 1) {
    headlineEl.textContent = `Quit date in ${diffDays} days`;
    detailEl.textContent =
      "Prep: remove triggers, tell supporters, line up coping tools, and plan your Day 1 routine.";
    renderQuitPlan(diffDays, "Countdown to your quit date.");
  } else if (diffDays === 1) {
    headlineEl.textContent = "Quit day is tomorrow";
    detailEl.textContent =
      "Clear cigarettes, set up reminders, stock water/snacks, and plan your first morning smoke-free.";
    renderQuitPlan(diffDays, "Final prep for tomorrow.");
  } else if (diffDays === 0) {
    headlineEl.textContent = "Quit day is today";
    detailEl.textContent =
      "Stay close to your coping plan: breathing, delay/walk, and reach out for support. One urge at a time.";
    renderQuitPlan(diffDays, "Today is your quit day—lean on your plan.");
  } else {
    headlineEl.textContent = `Quit date was ${Math.abs(diffDays)} days ago`;
    detailEl.textContent =
      "Reinforce your routines, review triggers, and celebrate every smoke-free gap you build.";
    renderQuitPlan(diffDays, "Keep strengthening your smoke-free routines.");
  }
  if (buttonEl) buttonEl.disabled = false;
}

function renderQuitPlan(diffDays = 0, subtitle = "") {
  const stepsEl = document.getElementById("quitPlanSteps");
  const subtitleEl = document.getElementById("quitPlanSubtitle");
  const summaryEl = document.getElementById("quitPlanSummary");
  if (!stepsEl || !subtitleEl) return;
  subtitleEl.textContent = subtitle || "Your personalized roadmap to freedom";
  if (summaryEl) {
    summaryEl.innerHTML = buildQuitPlanSummary(diffDays, getQuitPlanStepDays());
  }
  const sections = buildQuitPlanSections(diffDays);
  stepsEl.innerHTML = sections
    .map(
      (section) => `
        <li class="quit-plan-section">
          <div class="quit-plan-section-title">${section.title}</div>
          <div class="quit-plan-section-items">
            ${section.items.map((i) => `<div class="quit-plan-item">${i}</div>`).join("")}
          </div>
        </li>
      `
    )
    .join("");
}

function buildQuitPlanSections(diffDays) {
  // diffDays: positive = days until quit date; 0 = today; negative = days since
  const limit = state.dailyLimit;
  const base = [
    {
      title: "Daily moves",
      items: [
        "Delay each urge for 10 minutes; pair with a short walk or 4-7-8 breathing.",
        "Hydrate hourly; eat balanced meals/snacks to steady blood sugar.",
        "Use the 5 D’s: Delay, Deep breathe, Drink water, Do something else, Discuss with someone.",
      ],
    },
    {
      title: "Environment & triggers",
      items: [
        "Keep zero cigarettes on you; remove lighters/ashtrays and smoke smells.",
        "List top triggers (time, place, feeling); define one replacement action for each.",
        "Avoid alcohol-heavy settings early; set a time-limited exit plan for triggers you can’t skip.",
      ],
    },
  ];

  const sections = [...base];

  if (diffDays > 30) {
    sections.unshift({
      title: "Next 4 weeks",
      items: [
        "Set your quit date on the calendar and tell 1–2 supporters.",
        `If you smoke ~${limit} per day, practice small cuts: reduce by 1 every few days while lengthening intervals.`,
        "Start logging every cigarette to see patterns and pick target triggers to swap.",
      ],
    });
    return sections;
  }

  if (diffDays > 14) {
    sections.unshift({
      title: "Week-by-week ramp",
      items: [
        "Week 1: log everything and delay each cigarette by 5–10 minutes.",
        "Week 2: remove backup packs; keep water/gum handy at all times.",
        "Pick your quit-day reward (morning treat, walk, playlist, call with a friend).",
      ],
    });
    return sections;
  }

  if (diffDays > 7) {
    sections.unshift({
      title: "Prep week",
      items: [
        "Clean smoke smells from car, clothes, and home; stage gum/mints/water in your bag.",
        "Practice your morning routine: water, protein breakfast, 4-7-8 breathing, short walk.",
        "Tell supporters the exact quit date and how to help (check-ins, short walks, call/text).",
      ],
    });
    return sections;
  }

  if (diffDays > 1) {
    sections.unshift({
      title: "Countdown",
      items: [
        "Reduce remaining cigarettes and stretch intervals daily.",
        "Set alerts: crisis text line (741741 US), a supporter to text, and your breathing exercise.",
        "Remove all cigarettes, lighters, and ashtrays the night before quit day.",
      ],
    });
    return sections;
  }

  if (diffDays === 1) {
    sections.unshift({
      title: "Tomorrow is quit day",
      items: [
        "Throw out remaining cigarettes/lighters/ashtrays tonight.",
        "Place coping tools by your bed: water bottle, gum, plan, breathing link.",
        "Sleep a bit earlier; avoid alcohol; set a morning cue: water + breathing + short walk before screens.",
      ],
    });
    return sections;
  }

  if (diffDays === 0) {
    sections.unshift({
      title: "Quit Day",
      items: [
        "Morning: drink water, eat, do 4-7-8 breathing, take a 5–10 minute walk.",
        "For every urge: delay 10 minutes, breathe, move, and change location. Urges peak then fade.",
        "Stay fueled (protein + fiber) to blunt cravings; hydrate hourly.",
        "If you slip, log it, reset the timer, and keep going—one lapse is not a relapse.",
      ],
    });
    return sections;
  }

  if (diffDays >= -3) {
    sections.unshift({
      title: "Early smoke-free (days 1–3)",
      items: [
        "Expect strong urges; ride them with delay + move + breathe. Celebrate every interval.",
        "Keep hands/busy kit nearby (stress ball, pen, fidget, nuts).",
        "Short walks 2–3x/day stabilize mood and withdrawal.",
        "If a slip happens, log it, reset, and tighten your environment (zero cigarettes reachable).",
      ],
    });
    return sections;
  }

  if (diffDays >= -14) {
    sections.unshift({
      title: "Stabilize weeks 1–2",
      items: [
        "Audit your hardest triggers this week; add a specific swap for each (walk, water, call, breathing).",
        "Keep zero supply; avoid “just one” offers—change setting if needed.",
        "Plan a weekly reward for staying smoke-free.",
        "If cravings spike, rotate coping tools so you don’t burn out on one approach.",
      ],
    });
    return sections;
  }

  sections.unshift({
    title: "Beyond week 2",
    items: [
      "Keep reinforcing the routines that work: delay, breathe, move, hydrate, connect.",
      "Refresh your why—write it down and pin it somewhere you see daily.",
      "Rotate coping tools to prevent boredom and complacency.",
      "Stay zero-supply and clear smoking cues regularly.",
    ],
  });
  return sections;
}

function buildQuitPlanSummary(diffDays) {
  if (state.quitDate == null) {
    return `<div style="color: var(--text-secondary);">Set a quit date to generate a reduction plan.</div>`;
  }

  const daysUntil = Math.max(0, diffDays);
  const startLimit = state.dailyLimit;
  const targetLimit = 0;
  const startInterval = state.targetInterval;
  const increment = state.autoIncrease ? state.autoIncreaseAmount || 5 : 0;
  const projectedInterval = Math.min(480, startInterval + increment * daysUntil);

  // Gentle linear reduction toward quit day
  const dailyCut =
    daysUntil > 0 ? Math.max(startLimit / daysUntil, 0) : startLimit;

  const stepDays = getQuitPlanStepDays();
  const schedule = [];

  const addRow = (label, dayIndex) => {
    const limit = Math.max(
      targetLimit,
      Math.round(startLimit - dailyCut * dayIndex)
    );
    const interval = Math.min(480, startInterval + increment * dayIndex);
    schedule.push({
      label,
      limit,
      interval,
    });
  };

  addRow("Today", 0);

  if (daysUntil > 0 && stepDays) {
    for (let d = stepDays; d < daysUntil; d += stepDays) {
      addRow(`Day ${d}`, d);
    }
  } else if (daysUntil > 2) {
    const midDay = Math.floor(daysUntil / 2);
    addRow(`Day ${midDay}`, midDay);
  }

  addRow("Quit Day", daysUntil);

  const rows = schedule
    .map(
      (row) => `
      <tr>
        <td>${row.label}</td>
        <td>${row.limit}/day</td>
        <td>${row.interval}m</td>
      </tr>
    `
    )
    .join("");

  return `
    <div style="margin-bottom: 6px; font-weight: 600;">Reduction targets</div>
    <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 8px;">
      Reduce from ${startLimit}/day to ${targetLimit}/day by your quit date in ${daysUntil} day${
    daysUntil === 1 ? "" : "s"
  }. ${
    increment > 0
      ? `Auto-increase: +${increment} min each successful day.`
      : "Auto-increase is off; intervals stay as set unless you adjust them."
  }
    </div>
    <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
      <thead>
        <tr style="text-align: left; color: var(--text-secondary);">
          <th style="padding: 4px 0;">Milestone</th>
          <th style="padding: 4px 0;">Daily limit</th>
          <th style="padding: 4px 0;">Interval</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

// Expose quit plan functions for inline HTML (only granularity handler is needed)
window.changeQuitPlanGranularity = changeQuitPlanGranularity;

function changeQuitPlanGranularity() {
  const select = document.getElementById("quitPlanGranularity");
  if (!select) return;
  
  quitPlanGranularity = select.value;
  console.log("Changed granularity to:", quitPlanGranularity);
  
  // Re-render with new granularity
  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  const quitDate = state.quitDate ? new Date(state.quitDate) : null;
  
  let diffDays = 0;
  let subtitle = "Set a quit date to get a tailored plan.";
  
  if (quitDate) {
    const quitStart = new Date(new Date(quitDate).setHours(0, 0, 0, 0));
    diffDays = Math.round((quitStart.getTime() - todayStart.getTime()) / 86400000);
    
    if (diffDays > 0) {
      subtitle = `${diffDays} day${diffDays === 1 ? '' : 's'} until your quit date`;
    } else if (diffDays === 0) {
      subtitle = "Today is your quit day!";
    } else {
      subtitle = `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} smoke-free`;
    }
  }
  
  renderQuitPlan(diffDays, subtitle);
}

function getQuitPlanStepDays() {
  if (quitPlanGranularity === "daily") return 1;
  if (quitPlanGranularity === "every2") return 2;
  return null; // key milestones
}

// ==================== ACHIEVEMENTS ====================

// ==================== AI COACH ====================
async function updateCoachMessage() {
  const elapsed = getElapsedSeconds();
  const hours = Math.floor(elapsed / 3600);
  const days = Math.floor(hours / 24);

  // Detect crisis mode based on recent activity
  detectCrisisMode();

  // Determine message type
  let messageType = "general";
  if (state.crisisMode) {
    messageType = "struggling";
  } else if (state.coachMood === "celebrating") {
    messageType = "celebrating";
  } else if (state.coachMood === "struggling") {
    messageType = "struggling";
  }

  // Show loading indicator
  const coachMessageEl = document.getElementById("coachMessage");
  if (!coachMessageEl) return;

  try {
    // Use RAG-based static message retrieval
    const rawMessage = getCoachMessage(messageType);
    const { value, isHTML } = sanitizeCoachMessage(rawMessage);
    if (isHTML) {
      coachMessageEl.innerHTML = value;
    } else {
      coachMessageEl.textContent = value;
    }
    console.log("[Coach] RAG message:", messageType);
  } catch (error) {
    console.error("[Coach] Error:", error);
    // Leave existing text on error
  }

  // Update coach status
  updateCoachStatus();
}

// Typing effect for coach messages
async function typeMessage(element, text, speed = 30) {
  element.textContent = "";

  for (let i = 0; i < text.length; i++) {
    element.textContent += text[i];
    await new Promise((resolve) => setTimeout(resolve, speed));
  }
}

function getHapticsPlugin() {
  const cap = window.Capacitor || window.CapacitorCustomPlatform || null;
  if (!cap) return window.Haptics || null;
  const plugins = cap.Plugins || {};
  return (
    plugins.Haptics ||
    plugins.HapticsPlugin ||
    cap.Haptics ||
    cap.HapticsPlugin ||
    window.Haptics ||
    null
  );
}

function triggerVibration(duration = 200) {
  // Try Capacitor Haptics first (works on iOS/Android apps)
  const haptics = getHapticsPlugin();
  if (haptics && typeof haptics.impact === "function") {
    try {
      haptics.impact({ style: "medium" });
      return true;
    } catch (e) {
      console.warn("[Haptics] impact failed:", e);
    }
  }
  if (haptics && typeof haptics.vibrate === "function") {
    try {
      haptics.vibrate({ duration });
      return true;
    } catch (e) {
      console.warn("[Haptics] vibrate failed:", e);
    }
  }
  if (haptics && typeof haptics.selection === "function") {
    try {
      haptics.selection();
      return true;
    } catch (e) {
      console.warn("[Haptics] selection failed:", e);
    }
  }
  // Fallback to web vibration API
  if (navigator.vibrate) {
    navigator.vibrate(duration);
    return true;
  }
  return false;
}

function sanitizeCoachMessage(text) {
  if (!text || typeof text !== "string") {
    return { value: "Keep going—every minute smoke-free counts.", isHTML: false };
  }

  const trimmed = text.trim();

  // If message already contains markup (our own safe inline SVG/icons), allow it through
  if (/<[^>]+>/.test(trimmed)) {
    return { value: trimmed, isHTML: true };
  }

  // Otherwise clean up odd characters for plain text rendering
  let cleaned = trimmed.replace(/[^\x20-\x7E]/g, "");
  cleaned = cleaned.replace(/\s{2,}/g, " ");

  // Heuristic: if too short or too few letters, fallback
  const letterCount = (cleaned.match(/[a-zA-Z]/g) || []).length;
  if (!cleaned || cleaned.length < 10 || letterCount < cleaned.length * 0.6) {
    return { value: "Keep going—every minute smoke-free counts.", isHTML: false };
  }

  return { value: cleaned, isHTML: false };
}

// Ask AI Coach function (for chat input)
async function askAICoach() {
  const input = document.getElementById("coachChatInput");
  const question = input?.value?.trim();

  if (!question) {
    showToast("Please type a question first", "info");
    return;
  }

  // Clear input
  input.value = "";

  // Show loading
  const coachMessageEl = document.getElementById("coachMessage");
  if (!coachMessageEl) return;

  coachMessageEl.textContent = "Thinking about your question... 💭";

  try {
    // Generate smart context-aware response (local RAG)
    const response = generateSmartResponse(question);
    coachMessageEl.textContent = `Re: "${question}"\n\n${response}`;
    console.log("[Coach] RAG response to question:", question);
  } catch (error) {
    console.error("[Coach] Error:", error);
    coachMessageEl.textContent =
      "Sorry, I'm having trouble right now. Please try again or use the quick action buttons below.";
  }

  // Log interaction
  logCoachInteraction("ask_question", question);
}

// Smart response generator based on keywords and context
function generateSmartResponse(question) {
  const q = question.toLowerCase();
  const elapsed = getElapsedSeconds();
  const hours = Math.floor(elapsed / 3600);
  const days = Math.floor(hours / 24);
  // No LLM context, use only local state

  // Craving-related questions
  if (q.includes("crav") || q.includes("urge") || q.includes("want")) {
    const tips = [
      "Cravings typically last only 3-5 minutes. Try the '5 D's': Delay, Deep breathe, Drink water, Do something else, Discuss with someone. You've got this!",
      "Your brain is rewiring itself right now. Each craving you resist makes the next one easier. Try a quick walk or 10 deep breaths. The urge will pass!",
      "Cravings are strongest in the first 72 hours, then they get easier. You're at ${hours}h - keep going! Try chewing gum or snacking on carrots.",
      "This feeling is temporary. Your body is healing. Drink cold water, do 20 jumping jacks, or call a friend. You're stronger than the craving!",
    ];
    return tips[Math.floor(Math.random() * tips.length)].replace(
      "${hours}",
      hours
    );
  }

  // Time/progress questions
  if (q.includes("how long") || q.includes("when") || q.includes("time")) {
    if (hours < 72) {
      return `The first 72 hours are the hardest - you're at ${hours} hours now. Physical withdrawal peaks around 48-72h, then rapidly improves. You're almost through the worst!`;
    } else if (days < 7) {
      return `Great news! You're at ${days} days—often past the hardest physical part. Psychological cravings continue for a few weeks but get easier daily. Stay strong!`;
    } else {
      return `You're ${days} days in - amazing! Most physical withdrawal is wrapping up for many people. Occasional cravings are normal for months but brief. You're rewiring your brain!`;
    }
  }

  // Health/benefits questions
  if (
    q.includes("health") ||
    q.includes("benefit") ||
    q.includes("body") ||
    q.includes("feel")
  ) {
    if (hours < 1) {
      return "After just 20 minutes, your heart rate and blood pressure start dropping. Within hours, carbon monoxide levels fall and oxygen rises. Your body is already healing!";
    } else if (hours < 24) {
      return `At ${hours} hours, oxygen levels are rising as carbon monoxide clears. Your heart is already working more efficiently. Keep going!`;
    } else if (days < 3) {
      return `${days} day${
        days > 1 ? "s" : ""
      } smoke-free! Your taste and smell are improving, lungs are clearing, and breathing is getting easier. Amazing progress!`;
    } else if (days < 7) {
      return `At ${days} days, nerve endings are regrowing, circulation is improving, and cravings often start to shorten. Your body loves you for this!`;
    } else {
      return `${days} days in: Lung function and circulation keep improving, and heart disease risk falls the longer you stay smoke-free. Keep up the incredible work!`;
    }
  }

  // Money questions
  if (
    q.includes("money") ||
    q.includes("save") ||
    q.includes("cost") ||
    q.includes("$")
  ) {
    const saved = getMoneySaved().toFixed(2);
    const avoided = getCigarettesAvoided();
    const currSymbol = getCurrencySymbol();

    if (saved < 0 || avoided < 0) {
      return `You're going through a tough patch right now. The numbers show you're above your baseline, but that's okay - recovery isn't linear. What matters is that you're here, aware, and working on it. Every moment is a chance to get back on track.`;
    }

    return `You've saved ${currSymbol}${saved} and avoided ${avoided} cigarettes! At this rate, you'll save ${currSymbol}${(
      (saved / days) *
      365
    ).toFixed(0)} per year. Imagine what you could do with that money!`;
  }

  // Withdrawal symptoms
  if (
    q.includes("symptom") ||
    q.includes("headache") ||
    q.includes("anxiety") ||
    q.includes("irritab") ||
    q.includes("angry")
  ) {
    return "Withdrawal symptoms (headaches, anxiety, irritability) peak at 24-48 hours, then fade quickly. They're signs your body is healing! Stay hydrated, eat well, exercise, and be patient with yourself. This will pass! 🌈";
  }

  // Relapse/slip questions
  if (
    q.includes("relapse") ||
    q.includes("slip") ||
    q.includes("fail") ||
    q.includes("gave up")
  ) {
    return "A slip isn't failure - it's a learning opportunity. Most successful quitters tried multiple times. What matters is getting right back on track. You've already proven you can do this. Don't give up!";
  }

  // Tips/strategies
  if (
    q.includes("tip") ||
    q.includes("help") ||
    q.includes("strategy") ||
    q.includes("how to")
  ) {
    const strategies = [
      "Try the 4-7-8 breathing: Inhale 4 seconds, hold 7 seconds, exhale 8 seconds. Repeat 4 times. It activates your parasympathetic nervous system and can calm cravings.",
      "Keep your hands busy: Stress ball, fidget spinner, drawing, knitting. Physical distraction breaks the hand-to-mouth habit. Works incredibly well!",
      "Change your routine: If you smoked after meals, go for a walk instead. If you smoked with coffee, switch to tea. Break those trigger associations!",
      "Text a friend when you're struggling. Social support makes quitting easier—you don't have to do this alone!",
    ];
    return strategies[Math.floor(Math.random() * strategies.length)];
  }

  // Weight concerns
  if (
    q.includes("weight") ||
    q.includes("gain") ||
    q.includes("fat") ||
    q.includes("eating")
  ) {
    return "Average weight gain is 5-10 lbs and temporary. Combat it with: healthy snacks (carrots, apples), drinking water, light exercise, and chewing gum. Your metabolism normalizes in a few months. Health benefits far outweigh this! 🍎";
  }

  // Default context-aware response
  const avoided = getCigarettesAvoided();
  const moneySaved = getMoneySaved();

  const genericResponses = [
    `You're doing amazing at ${hours} hours smoke-free! ${state.streak} day streak shows real commitment. Keep focusing on your progress, not perfection. One hour at a time!`,
    `Remember why you started this journey. You're ${hours} hours into healing your body and reclaiming your life. Every minute counts!`,
    avoided > 0 && moneySaved > 0
      ? `At ${hours}h smoke-free, you've already avoided ${avoided} cigarettes and saved ${getCurrencySymbol()}${moneySaved.toFixed(2)}. That's incredible progress! Keep it up!`
      : `You're ${hours} hours into this journey. Progress isn't always linear, but every hour you're learning and growing stronger. Keep going!`,
    "The fact that you're here asking questions shows you're committed to change. That's the most important factor in success. You've got this!",
  ];

  return genericResponses[Math.floor(Math.random() * genericResponses.length)];
}

function detectCrisisMode() {
  const now = new Date();
  const recentLogs = state.cigaretteLog.filter(
    (log) => now - new Date(log) < 3600000 // Last hour
  ).length;

  const elapsed = getElapsedSeconds();
  const target = state.targetInterval * 60;

  // Crisis indicators
  const isVeryEarly = elapsed < target && elapsed < 1800; // Under 30 minutes
  const frequentLogs = recentLogs >= 2; // Multiple cigarettes recently
  const shortIntervals =
    state.cigaretteLog.length >= 2 &&
    state.cigaretteLog[state.cigaretteLog.length - 1] -
      state.cigaretteLog[state.cigaretteLog.length - 2] <
      3600000;

  const intervalComplete = elapsed >= target;
  const isCalmWindow = intervalComplete || recentLogs === 0;

  // Reset crisis when stable (at/after interval and no spikes)
  if (isCalmWindow && !frequentLogs && !shortIntervals) {
    state.crisisMode = false;
    return;
  }

  // Only enable crisis when early AND recent spike patterns
  state.crisisMode =
    (isVeryEarly && (frequentLogs || shortIntervals || recentLogs >= 2)) ||
    (frequentLogs && shortIntervals);
}

function generateSmartCoachMessage(elapsed, hours, days) {
  // Crisis mode takes priority
  if (state.crisisMode) {
    return crisisMessages[Math.floor(Math.random() * crisisMessages.length)];
  }

  // Mood-based messaging
  if (state.coachMood !== "neutral" && moodBasedMessages[state.coachMood]) {
    const moodMessages = moodBasedMessages[state.coachMood];
    return moodMessages[Math.floor(Math.random() * moodMessages.length)];
  }

  // Time-based progression (enhanced)
  if (hours < 1) {
    const minutes = Math.floor(elapsed / 60);
    return `Great start! ${minutes} minutes down. The first hour is toughest, but you're already winning!`;
  } else if (hours < 2) {
    return `${hours} hour strong! Your brain is already changing. Cravings will ease soon.`;
  } else if (hours < 6) {
    return `${hours} hours smoke-free! Physical withdrawal peaking now. Stay hydrated!`;
  } else if (hours < 24) {
    return `${hours} hours champion! Carbon monoxide is falling and oxygen is rising. Your body is healing!`;
  } else if (hours < 48) {
    return `${hours} hours warrior! Withdrawal often peaks in the first 2-3 days—keep using your coping tools. 🌅`;
  } else if (hours < 72) {
    return `${hours} hours legend! Nicotine fully cleared. Taste/smell returning! 👃`;
  } else if (days < 7) {
    return `${days} day${
      days > 1 ? "s" : ""
    } strong! Lungs clearing, energy may start to rebound.`;
  } else if (days < 14) {
    return `${days} days champion! Circulation is improving, and walks can feel easier.`;
  } else if (days < 30) {
    return `${days} days hero! Cravings usually get shorter and breathing keeps improving.`;
  } else if (days < 90) {
    return `${days} days legend! Lung function and circulation keep improving; coughing often less.`;
  } else if (days < 180) {
    return `${days} days master! Heart and lung benefits keep adding up.`;
  } else if (days < 365) {
    return `${days} days icon! Major health risks continue to decline compared to when you smoked.`;
  } else {
    const years = Math.floor(days / 365);
    return `${years} year${
      years > 1 ? "s" : ""
    } champion! Staying smoke-free keeps lowering long-term risks and protecting your health. 👑`;
  }
}

function addContextualElements(message, elapsed) {
  const elements = [];

  // Streak milestone approaching
  if (state.streak > 0) {
    const milestones = [3, 7, 14, 30, 60, 90];
    const nextMilestone = milestones.find((m) => m > state.streak);
    if (nextMilestone && nextMilestone - state.streak <= 2) {
      elements.push(
        `${
          nextMilestone - state.streak
        } days to ${nextMilestone}-day streak!`
      );
    }
  }

  // Daily goal progress
  if (state.dailyGoal) {
    const todayLogs = state.cigaretteLog.filter((log) => {
      const logDate = new Date(log);
      const today = new Date();
      return logDate.toDateString() === today.toDateString();
    }).length;

    if (todayLogs === 0) {
      elements.push('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> Perfect day so far! Keep it up!');
    } else if (todayLogs < state.dailyLimit) {
      elements.push(
        `📊 ${state.dailyLimit - todayLogs} cigarettes left in budget today.`
      );
    }
  }

  // Recent achievement
  const recentAchievements = Object.entries(state.achievements)
    .filter(([_, timestamp]) => Date.now() - timestamp < 3600000) // Last hour
    .map(([id, _]) => achievementDefs.find((a) => a.id === id)?.title)
    .filter(Boolean);

  if (recentAchievements.length > 0) {
    elements.push(`🏆 Achievement unlocked: ${recentAchievements[0]}!`);
  }

  // Add random contextual element if any exist
  if (elements.length > 0) {
    message += "\n\n" + elements[Math.floor(Math.random() * elements.length)];
  }

  return message;
}

function updateCoachStatus() {
  const statusEl = document.querySelector(".coach-status");
  if (!statusEl) return;

  const elapsed = getElapsedSeconds();
  const hours = Math.floor(elapsed / 3600);
  const days = Math.floor(hours / 24);
  const todayLogs = state.cigaretteLog.filter((log) => {
    const logDate = new Date(log);
    const today = new Date();
    return logDate.toDateString() === today.toDateString();
  }).length;

  // Contextual status
  if (state.crisisMode) {
    statusEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 19a2 2 0 0 0 4 0"/><path d="M7 9h2m6 0h2"/></svg> Crisis support active`;
    statusEl.style.color = "#ff6b6b";
  } else if (todayLogs > state.dailyLimit) {
    statusEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg> Over limit today - you got this`;
    statusEl.style.color = "#ff9500";
  } else if (todayLogs === 0 && hours > 6) {
    statusEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> Perfect day so far!`;
    statusEl.style.color = "#51cf66";
  } else if (days === 0) {
    statusEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 9h16M9 3v4M15 3v4"/><path d="M9 13h6"/></svg> ${hours}h into your journey`;
    statusEl.style.color = "#74c0fc";
  } else if (days < 3) {
    statusEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M12 3 s-1.5 2.5-1.5 4.5S12 11 12 11s1.5-1.5 1.5-3.5S12 3 12 3Z"/><path d="M8 11c-1.5 1.5-2.5 3.5-2 5.5C6.5 19.5 8.5 21 12 21s5.5-1.5 6-4.5C18.5 14.5 17.5 12.5 16 11M10.5 14c-.5.5-.8 1.1-.7 1.8.1.9.9 1.7 2.2 1.7 1.3 0 2.1-.8 2.2-1.7.1-.7-.2-1.3-.7-1.8"/></svg> Day ${days} - stay strong`;
    statusEl.style.color = "#74c0fc";
  } else if (days >= 7) {
    statusEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m8-10h2M2 12H4"/></svg> ${days} days strong!`;
    statusEl.style.color = "#51cf66";
  } else {
    statusEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 19a2 2 0 0 0 4 0"/><path d="M7 9h2m6 0h2"/></svg> Day ${days} - here to support`;
    statusEl.style.color = "#74c0fc";
  }
}

function doBreathingExercise(technique = null) {
  // If no technique specified, use the default
  let selectedTechnique =
    technique || state.preferredBreathingTechnique || "478";

  // Clear any previous running interval before starting a new exercise
  const modalEl = document.getElementById("breathingModal");
  if (modalEl?.dataset?.interval) {
    clearInterval(parseInt(modalEl.dataset.interval, 10));
    delete modalEl.dataset.interval;
  }

  const exercise = breathingTechniques[selectedTechnique];

  if (!exercise) {
    showToast("Breathing technique not found", "error");
    return;
  }

  modalEl.classList.add("open");
  // Set modal title with a small technique icon + name
  document.getElementById("breathingTitle").innerHTML =
    (exercise.icon || "").replace(/width="64" height="64"/g, 'width="20" height="20"') +
    " " +
    exercise.name;

  const phases = exercise.phases;
  let phase = 0;
  let count = phases[0].time;
  let cycleCount = 1;
  let completedPhases = 0;

  // Get all the elements
  const instructionEl = document.getElementById("breathingInstruction");
  const timerEl = document.getElementById("breathingTimer");
  const circleEl = document.getElementById("breathingCircle");
  const backgroundEl = document.getElementById("breathingBackground");
  const progressEl = document.getElementById("breathingProgress");

  // Phase color mapping
  const phaseColors = {
    inhale: { primary: "rgba(56, 189, 248, 0.8)", glow: "rgba(56, 189, 248, 0.4)", bg: "rgba(56, 189, 248, 0.15)" },
    hold: { primary: "rgba(168, 85, 247, 0.8)", glow: "rgba(168, 85, 247, 0.4)", bg: "rgba(168, 85, 247, 0.15)" },
    exhale: { primary: "rgba(16, 185, 129, 0.8)", glow: "rgba(16, 185, 129, 0.4)", bg: "rgba(16, 185, 129, 0.15)" }
  };

  const getPhaseType = (phaseText) => {
    const text = phaseText.toLowerCase();
    if (text.includes("in")) return "inhale";
    if (text.includes("hold")) return "hold";
    if (text.includes("out")) return "exhale";
    return "hold";
  };

  const applyPhaseColors = (phaseType) => {
    const colors = phaseColors[phaseType];
    if (circleEl && colors) {
      circleEl.style.borderColor = colors.primary;
      circleEl.style.boxShadow = `0 0 40px ${colors.glow}, 0 0 80px ${colors.glow}`;
    }
    if (backgroundEl && colors) {
      backgroundEl.style.background = `radial-gradient(circle, ${colors.bg} 0%, transparent 70%)`;
    }
  };

  const animateCircle = (phaseType, duration) => {
    if (!circleEl) return;

    // Remove any existing animation classes
    circleEl.classList.remove('breathing-circle-inhale', 'breathing-circle-hold', 'breathing-circle-exhale');

    // Force reflow to restart animation
    void circleEl.offsetWidth;

    // Add the appropriate animation class
    circleEl.classList.add(`breathing-circle-${phaseType}`);
    circleEl.style.animationDuration = `${duration}s`;
  };

  const renderPhase = () => {
    if (instructionEl) instructionEl.textContent = phases[phase].text;
    if (timerEl) timerEl.textContent = count;
    if (progressEl) progressEl.textContent = `Cycle ${cycleCount}`;

    // Apply visual changes on phase transition
    if (count === phases[phase].time) {
      const phaseType = getPhaseType(phases[phase].text);
      applyPhaseColors(phaseType);
      animateCircle(phaseType, phases[phase].time);

      // Haptic feedback on phase change
      if (state.vibrationEnabled) {
        triggerVibration(50);
      }
    }
  };

  // Initial render before starting the timer
  renderPhase();

  const interval = setInterval(() => {
    count--;
    if (count < 0) {
      completedPhases++;
      phase = (phase + 1) % phases.length;
      count = phases[phase].time;

      // Increment cycle count when we complete all phases
      if (phase === 0) {
        cycleCount++;
      }
    }
    renderPhase();
  }, 1000);

  // Store interval to clear on close
  modalEl.dataset.interval = interval;

  logCoachInteraction("breathing_exercise", selectedTechnique);
}

function changeBreathingTechnique(technique) {
  if (breathingTechniques[technique]) {
    state.preferredBreathingTechnique = technique;
    saveState();
    showToast(`Switched to ${breathingTechniques[technique].name}`, "info");
  }
}

function showBreathingSelector() {
  const modal = document.getElementById("breathingSelectorModal");
  modal.classList.add("open");

  // Highlight the currently preferred technique
  const cards = modal.querySelectorAll(".breathing-technique-card");
  cards.forEach((card) => {
    const technique = card.getAttribute("onclick").match(/'([^']+)'/)[1];
    if (technique === state.preferredBreathingTechnique) {
      card.style.borderColor = "rgba(0, 245, 160, 0.8)";
      card.style.background = "rgba(0, 245, 160, 0.08)";
    } else {
      card.style.borderColor = "";
      card.style.background = "";
    }

    // Ensure the card icon matches the canonical icon for the technique
    try {
      const iconContainer = card.querySelector('.u-fs-2rem');
      if (iconContainer && breathingTechniques[technique] && breathingTechniques[technique].icon) {
        iconContainer.innerHTML = breathingTechniques[technique].icon.replace(/width="64" height="64"/g, 'width="24" height="24"');
      }
    } catch (e) {
      console.warn('[UI] Failed to render breathing icon for', technique, e);
    }
  });
}

function selectBreathingTechnique(technique) {
  // Close the selector modal
  closeModal("breathingSelectorModal");

  // Save as preferred technique
  if (breathingTechniques[technique]) {
    state.preferredBreathingTechnique = technique;
    saveState();
  }

  // Start the breathing exercise
  doBreathingExercise(technique);
}

// ==================== WATCH INTEGRATION ====================
async function logCigaretteFromWatch() {
  console.log("[Watch->JS] logCigaretteFromWatch called");
  const now = new Date();
  
  // Check for duplicate within throttle window
  if (lastWatchLogTimestamp && now.getTime() - lastWatchLogTimestamp < 1500) {
    console.warn("[Watch->JS] Ignoring duplicate watch log within throttle window");
    return;
  }
  lastWatchLogTimestamp = now.getTime();
  
  // Check if this cigarette was already logged by native code
  const lastLogTime = state.lastCigarette ? new Date(state.lastCigarette).getTime() : 0;
  if (now.getTime() - lastLogTime < 2000) {
    console.log("[Watch->JS] Cigarette already logged by native, just updating UI");
    updateUI();
    updateStats();
    renderReport();
    showToast('Logged from watch <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check"><polyline points="20 6 9 17 4 12"></polyline></svg>', "info");
    return;
  }
  
  // Add the cigarette
  state.cigaretteLog.push(now);
  state.lastCigarette = now;
  state.lastGoalNotified = 0;
  sessionLastGoalKey = null;
  
  console.log("[Watch->JS] Cigarette logged, total count:", state.cigaretteLog.length);

  await saveState();
  emitStateUpdated("watch_log_cigarette");
  scheduleUIRefresh();
  await scheduleNotification();
  await updateWatchSnapshot();
  showToast('Logged from watch <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check"><polyline points="20 6 9 17 4 12"></polyline></svg>', "info");
  
  // Trigger falling cigarette animation
  // createFallingCigarettes(state.cigaretteLog.length);

  // Trigger smoke plume animation
  createSmokePlume();

  if (state.vibrationEnabled) triggerVibration(120);
}

function handleWatchAction(type) {
  console.log("[Watch->JS] handleWatchAction", type);
  switch (type) {
    case "log_cigarette":
      logCigaretteFromWatch();
      break;
    default:
      console.log("[Watch] Unknown action:", type);
  }
}

function setupWatchBridgeListener() {
  const plugin =
    window.Capacitor &&
    window.Capacitor.Plugins &&
    (window.Capacitor.Plugins.WatchBridgePlugin ||
      window.Capacitor.Plugins.WatchBridge);
  if (!plugin || !plugin.addListener) {
    console.warn("[Watch] Bridge plugin not available");
    return;
  }
  plugin.addListener("watchAction", ({ type }) => {
    console.log("[Watch] action received in JS:", type);
    handleWatchAction(type);
  });
}

// Expose to native callers that use window.handleWatchAction
window.handleWatchAction = handleWatchAction;

// Debug helper to inspect current snapshot content from JS
window.dumpWatchSnapshot = async function () {
  const { value } = await Storage.get({ key: "watch_snapshot" });
  console.log("[Watch] current watch_snapshot raw:", value);
  return value;
};

function logCoachInteraction(type, detail) {
  if (!state.conversationHistory) state.conversationHistory = [];
  state.conversationHistory.push({
    timestamp: Date.now(),
    type: type,
    detail: detail,
    context: {
      elapsed: getElapsedSeconds(),
      crisisMode: state.crisisMode,
      mood: state.coachMood,
    },
  });

  // Keep only last 50 interactions
  if (state.conversationHistory.length > 50) {
    state.conversationHistory = state.conversationHistory.slice(-50);
  }

  saveState();
  emitStateUpdated("coach_interaction");
}

function updateCoachMood(mood) {
  state.coachMood = mood;
  state.lastCoachInteraction = Date.now();
  logCoachInteraction("mood_update", mood);

  // Mood affects message selection for next hour
  setTimeout(() => {
    if (state.coachMood === mood) {
      state.coachMood = "neutral";
    }
  }, 3600000); // Reset after 1 hour

  saveState();
  updateCoachMessage();
}

function suggestDailyGoal() {
  const todayLogs = state.cigaretteLog.filter((log) => {
    const logDate = new Date(log);
    const today = new Date();
    return logDate.toDateString() === today.toDateString();
  }).length;

  const yesterdayLogs = state.cigaretteLog.filter((log) => {
    const logDate = new Date(log);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return logDate.toDateString() === yesterday.toDateString();
  }).length;

  let suggestion;

  if (todayLogs === 0 && state.streak > 0) {
    suggestion =
      "Perfect day! Try to maintain this streak. Goal: 0 cigarettes today!";
  } else if (yesterdayLogs > todayLogs) {
    suggestion = `Great progress! Yesterday: ${yesterdayLogs}, Today: ${todayLogs}. Goal: ${Math.max(
      0,
      todayLogs - 1
    )} or fewer tomorrow! 📈`;
  } else if (state.streak < 3) {
    suggestion =
      "Building your foundation. Goal: Stay under your daily limit today!";
  } else {
    suggestion = `You're doing great! Goal: Beat yesterday's count of ${yesterdayLogs} cigarettes!`;
  }

  state.dailyGoal = suggestion;
  saveState();

  showToast(`Daily Goal Set: ${suggestion}`, "info");
  logCoachInteraction("goal_set", suggestion);
}

function handleRelapseSupport() {
  const supportMessages = [
    "A setback doesn't erase your progress. Every quit attempt teaches you something valuable.",
    "Think of this as planting a seed. Sometimes seeds need to be planted multiple times before they grow.",
    "You're not starting over - you're learning. Use this experience to get stronger.",
    "The timeline to quitting is different for everyone. Your journey is uniquely yours.",
    "Most successful quitters tried multiple times. You're in good company!",
    "Focus on the next hour, not the last one. You can choose differently right now.",
    "Be kind to yourself. Recovery is a process, not a straight line.",
    "Use this as fuel. Channel that frustration into determination.",
  ];

  const message =
    supportMessages[Math.floor(Math.random() * supportMessages.length)];
  showToast(message, "info");

  // Offer immediate support options
  setTimeout(() => {
    showToast(
      "Need support? Try a breathing exercise or call a quitline. I'm here for you. 🤝",
      "info"
    );
  }, 5000);

  logCoachInteraction("relapse_support", "provided");
}

function getCoachInsights() {
  const insights = [];

  // Analyze patterns
  if (state.conversationHistory.length > 10) {
    const recentTips = state.conversationHistory
      .filter((h) => h.type === "tip")
      .slice(-10)
      .map((h) => h.detail);

    const mostUsedTip = recentTips.reduce((acc, tip) => {
      acc[tip] = (acc[tip] || 0) + 1;
      return acc;
    }, {});

    const topTip = Object.entries(mostUsedTip).sort(([, a], [, b]) => b - a)[0];

    if (topTip) {
      insights.push(
        `💡 You respond well to ${topTip[0]} tips. Keep using what works!`
      );
    }
  }

  // Time-based insights
  const elapsed = getElapsedSeconds();
  if (elapsed > 604800) {
    // 1 week
    insights.push(
      "📊 Week 1 complete! Most relapses happen in the first week - you've beaten the odds!"
    );
  }

  // Streak insights
  if (state.streak >= 7) {
    insights.push(
      "🔥 7-day streak! You're rewiring your brain - habits take 21 days to form!"
    );
  }

  if (insights.length === 0) {
    insights.push(
      "Keep going! Every day smoke-free is a victory worth celebrating."
    );
  }

  return insights[Math.floor(Math.random() * insights.length)];
}

// ==================== MILESTONES ====================
// renderMilestones function is defined later in the file (line ~2750)

function formatTime(sec) {
  if (sec < 3600) return Math.floor(sec / 60) + "m";
  if (sec < 86400) return Math.floor(sec / 3600) + "h";
  if (sec < 365 * 86400) return Math.floor(sec / 86400) + "d";
  return Math.floor(sec / (365 * 86400)) + "y";
}

function setRandomQuote() {
  const q = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById("quote").textContent = `"${q.text}"`;
  document.getElementById("quoteAuthor").textContent = `— ${q.author}`;
}

// ==================== SHARING ====================
// Expose sharing for inline HTML onclick
window.showShareModal = showShareModal;
function showShareModal() {
  // Share Progress is part of Reports section which is already Pro-gated at section level
  // No individual Pro check needed here

  const elapsed = getElapsedSeconds();
  const hours = Math.floor(elapsed / 3600);
  const days = Math.floor(hours / 24);
  const saved = getMoneySaved().toFixed(2);
  const avoided = Math.floor(getCigarettesAvoided());

  let timeText = hours < 24 ? `${hours} hours` : `${days} days`;
  const text = `I've been smoke-free for ${timeText} with LotriFlow Quit! Saved ${getCurrencySymbol()}${saved} and avoided ${avoided} cigarettes. #QuitSmoking #LotriFlowQuit`;

  // Update main text
  document.getElementById("shareText").textContent = text;

  // Update stats cards
  document.getElementById("shareAvoided").textContent = `${avoided} cigs`;
  document.getElementById(
    "shareSaved"
  ).textContent = `${getCurrencySymbol()}${saved}`;

  document.getElementById("shareModal").classList.add("open");
}

function getShareText() {
  return document.getElementById("shareText").textContent;
}

function shareToTwitter() {
  window.open(
    "https://twitter.com/intent/tweet?text=" +
      encodeURIComponent(getShareText()),
    "_blank"
  );
}

function shareToFacebook() {
  window.open(
    "https://www.facebook.com/sharer/sharer.php?quote=" +
      encodeURIComponent(getShareText()),
    "_blank"
  );
}

function shareToWhatsApp() {
  window.open(
    "https://wa.me/?text=" + encodeURIComponent(getShareText()),
    "_blank"
  );
}

function copyShareText() {
  navigator.clipboard
    .writeText(getShareText())
    .then(() => showToast("Copied! <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"feather feather-copy\"><rect x=\"9\" y=\"9\" width=\"13\" height=\"13\" rx=\"2\" ry=\"2\"></rect><path d=\"M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1\"></path></svg>", "success"));
}

// ==================== MENU ====================
function toggleMenu() {
  const panel = document.getElementById("menuPanel");
  const overlay = document.getElementById("menuOverlay");

  if (!panel || !overlay) {
    console.error("[Menu] Elements not found - panel:", panel, "overlay:", overlay);
    return;
  }

  panel.classList.toggle("open");
  overlay.classList.toggle("open");
}
window.toggleMenu = toggleMenu;

// ==================== SETTINGS ====================
// Expose toggleSettings globally for inline HTML onclick
window.toggleSettings = toggleSettings;
async function toggleSettings() {
  const panel = document.getElementById("settingsPanel");
  const wasOpen = panel.classList.contains("open");

  panel.classList.toggle("open");
  document.getElementById("settingsOverlay").classList.toggle("open");

  // If opening, refresh UI with latest state so fields match current data
  if (!wasOpen) {
    updateSettingsUI();
    // Check latest purchase status from RevenueCat
    if (ProAccess && ProAccess.checkStatus) {
      ProAccess.checkStatus().catch(err => console.log('[Settings] Purchase status check failed:', err));
    }
  }

  // If closing settings, ensure save completes then recalculate everything
  if (wasOpen) {
    // Clear any pending debounced save timer
    if (saveStateTimer) {
      clearTimeout(saveStateTimer);
      saveStateTimer = null;
    }

    // Immediately save state before recalculating
    await saveState(false);

    // Now recalculate with saved values
    updateEventBasedStats();
    updateTimeBasedStats();
    renderReport();
    updateCalculationDetails();
  }
}

function updateSettingsUI() {
  // Apply Pro lock styling for sync block
  const syncGroups = document.querySelectorAll(
    ".setting-group.pro-feature[data-pro-feature-name='Sync & Backup']"
  );
  syncGroups.forEach((group) => {
    group.classList.toggle("locked", !ProAccess.hasAccess());
  });

  // Update old display elements (if they exist)
  const intervalDisplay = document.getElementById("intervalDisplay");
  if (intervalDisplay) {
    intervalDisplay.textContent = state.targetInterval + "m";
  }
  const dailyLimitDisplay = document.getElementById("dailyLimitDisplay");
  if (dailyLimitDisplay) {
    dailyLimitDisplay.textContent = state.dailyLimit;
  }
  const baselineDisplay = document.getElementById("baselineDisplay");
  if (baselineDisplay) {
    baselineDisplay.textContent = state.baselinePerDay || state.dailyLimit;
  }

  // Update new input elements
  const intervalInput = document.getElementById("intervalInput");
  if (intervalInput) {
    intervalInput.value = state.targetInterval;
  }
  const dailyLimitInput = document.getElementById("dailyLimitInput");
  if (dailyLimitInput) {
    dailyLimitInput.value = state.dailyLimit;
  }
  const baselineInput = document.getElementById("baselineInput");
  if (baselineInput) {
    baselineInput.value = state.baselinePerDay || state.dailyLimit;
  }

  // Update auto increase input
  const autoIncreaseInput = document.getElementById("autoIncreaseInput");
  if (autoIncreaseInput) {
    autoIncreaseInput.value = state.autoIncreaseAmount || 5;
  }

  // Show/hide auto increase amount based on toggle
  const autoIncreaseToggle = document.getElementById("autoIncrease");
  const autoIncreaseContainer = document.getElementById("autoIncreaseAmountContainer");
  if (autoIncreaseToggle && autoIncreaseContainer) {
    autoIncreaseContainer.style.display = autoIncreaseToggle.checked ? "flex" : "none";
  }

  const packPriceInput = document.getElementById("packPriceInput");
  if (packPriceInput) {
    packPriceInput.value = state.packPrice;
  }
  const cigsPerPackInput = document.getElementById("cigsPerPackInput");
  if (cigsPerPackInput) {
    cigsPerPackInput.value = state.cigsPerPack;
  }
  document.getElementById("currencySelect").value = state.currency || "USD";
  document.getElementById("autoIncrease").checked = state.autoIncrease;
  const feedbackToggle = document.getElementById("feedbackEnabled");
  if (feedbackToggle) {
    const feedbackValue =
      typeof state.feedbackEnabled === "boolean"
        ? state.feedbackEnabled
        : !!(state.soundEnabled && state.vibrationEnabled);
    state.feedbackEnabled = feedbackValue;
    state.soundEnabled = feedbackValue;
    state.vibrationEnabled = feedbackValue;
    feedbackToggle.checked = feedbackValue;
  }
  const notificationMuteToggle = document.getElementById("notificationsMuted");
  if (notificationMuteToggle) {
    notificationMuteToggle.checked = !!state.notificationsMuted;
  }
  const notificationsToggle = document.getElementById("notificationsEnabled");
  if (notificationsToggle) {
    notificationsToggle.checked =
      !state.notificationsMuted && state.notificationsEnabled;
    notificationsToggle.disabled = !!state.notificationsMuted;
  }
  
  // Daily reminder settings (native apps)
  const dailyReminderCheckbox = document.getElementById("dailyReminderEnabled");
  if (dailyReminderCheckbox) {
    dailyReminderCheckbox.checked =
      !state.notificationsMuted && (state.dailyReminderEnabled || false);
    dailyReminderCheckbox.disabled = !!state.notificationsMuted;
  }
  const reminderTimeInput = document.getElementById("reminderTime");
  if (reminderTimeInput) {
    reminderTimeInput.value = state.dailyReminderTime || "09:00";
    reminderTimeInput.disabled = !!state.notificationsMuted;
  }

  // Show/hide install accordion based on platform (web only)
  const installAccordion = document.getElementById("installAccordion");
  if (installAccordion) {
    installAccordion.style.display = isNativeApp() ? "none" : "";
  }

  // Update Pro accordion meta text
  const proMeta = document.getElementById("proAccordionMeta");
  if (proMeta) {
    if (ProAccess && ProAccess.isProActive) {
      proMeta.textContent = ProAccess.isInTrial
        ? `Trial • ${ProAccess.trialDaysRemaining} days left`
        : "Active";
    } else {
      proMeta.textContent = "";
    }
  }
  
  const quitInput = document.getElementById("quitDateInput");
  if (quitInput) {
    const todayStr = new Date().toISOString().split("T")[0];
    quitInput.value = state.quitDate
      ? new Date(state.quitDate).toISOString().split("T")[0]
      : todayStr;
  }

  // LLM settings
  if (document.getElementById("llmEnabled")) {
    document.getElementById("llmEnabled").checked = state.llmEnabled;
    if (document.getElementById("llmApiKey")) {
      document.getElementById("llmApiKey").value = state.llmApiKey || "";
    }
    updateLLMUI(); // Show/hide API key field without saving
  }

  enforceNotificationAvailability();
}

function adjustInterval(d) {
  const direction = Math.sign(d || 0);
  state.targetInterval =
    direction === 0
      ? clampTargetInterval(state.targetInterval)
      : stepTargetInterval(state.targetInterval, direction);

  // Update both display and input
  const intervalDisplay = document.getElementById("intervalDisplay");
  if (intervalDisplay) {
    intervalDisplay.textContent = state.targetInterval + "m";
  }
  const intervalInput = document.getElementById("intervalInput");
  if (intervalInput) {
    intervalInput.value = state.targetInterval;
  }

  // Shorter debounce for more responsive saving
  if (saveStateTimer) clearTimeout(saveStateTimer);
  saveStateTimer = setTimeout(() => {
    saveState(true);
    emitStateUpdated("settings_interval");
    scheduleUIRefresh();
  }, 300);

  // Debounce heavy updates
  if (statsUpdateTimer) clearTimeout(statsUpdateTimer);
  statsUpdateTimer = setTimeout(() => {
    updateQuitPlan();
  }, 150);
}

function setIntervalFromInput() {
  const input = document.getElementById("intervalInput");
  const value = parseInt(input.value);
  if (!isNaN(value)) {
    state.targetInterval = clampTargetInterval(value);
    input.value = state.targetInterval; // Update input to clamped value
    const intervalDisplay = document.getElementById("intervalDisplay");
    if (intervalDisplay) {
      intervalDisplay.textContent = state.targetInterval + "m";
    }
    if (saveStateTimer) clearTimeout(saveStateTimer);
    saveStateTimer = setTimeout(() => {
      saveState(true);
      emitStateUpdated("settings_interval_input");
      scheduleUIRefresh();
    }, 300);
    if (statsUpdateTimer) clearTimeout(statsUpdateTimer);
    statsUpdateTimer = setTimeout(() => {
      updateQuitPlan();
    }, 150);
  }
}

function adjustDailyLimit(d) {
  state.dailyLimit = Math.max(1, Math.min(50, state.dailyLimit + d));
  // Update both display and input
  const dailyLimitDisplay = document.getElementById("dailyLimitDisplay");
  if (dailyLimitDisplay) {
    dailyLimitDisplay.textContent = state.dailyLimit;
  }
  const dailyLimitInput = document.getElementById("dailyLimitInput");
  if (dailyLimitInput) {
    dailyLimitInput.value = state.dailyLimit;
  }

  // Only save - recalculation happens when settings closes
  if (saveStateTimer) clearTimeout(saveStateTimer);
  saveStateTimer = setTimeout(() => {
    saveState(true);
    emitStateUpdated("settings_daily_limit");
    scheduleUIRefresh();
  }, 300);
}

function setDailyLimitFromInput() {
  const input = document.getElementById("dailyLimitInput");
  const value = parseInt(input.value);
  if (!isNaN(value)) {
    state.dailyLimit = Math.max(1, Math.min(50, value));
    input.value = state.dailyLimit; // Update input to clamped value
    const dailyLimitDisplay = document.getElementById("dailyLimitDisplay");
    if (dailyLimitDisplay) {
      dailyLimitDisplay.textContent = state.dailyLimit;
    }
    if (saveStateTimer) clearTimeout(saveStateTimer);
    saveStateTimer = setTimeout(() => {
      saveState(true);
      emitStateUpdated("settings_daily_limit_input");
      scheduleUIRefresh();
    }, 300);
  }
}

function adjustBaseline(d) {
  state.baselinePerDay = Math.max(1, Math.min(100, (state.baselinePerDay || state.dailyLimit) + d));
  // Update both display and input
  const baselineDisplay = document.getElementById("baselineDisplay");
  if (baselineDisplay) {
    baselineDisplay.textContent = state.baselinePerDay;
  }
  const baselineInput = document.getElementById("baselineInput");
  if (baselineInput) {
    baselineInput.value = state.baselinePerDay;
  }

  // Only save - recalculation happens when settings closes
  if (saveStateTimer) clearTimeout(saveStateTimer);
  saveStateTimer = setTimeout(() => {
    saveState(true);
    emitStateUpdated("settings_baseline");
    scheduleUIRefresh();
  }, 300);
}

function setBaselineFromInput() {
  const input = document.getElementById("baselineInput");
  const value = parseInt(input.value);
  if (!isNaN(value)) {
    state.baselinePerDay = Math.max(1, Math.min(100, value));
    input.value = state.baselinePerDay; // Update input to clamped value
    const baselineDisplay = document.getElementById("baselineDisplay");
    if (baselineDisplay) {
      baselineDisplay.textContent = state.baselinePerDay;
    }
    if (saveStateTimer) clearTimeout(saveStateTimer);
    saveStateTimer = setTimeout(() => {
      saveState(true);
      emitStateUpdated("settings_baseline_input");
      scheduleUIRefresh();
    }, 300);
  }
}

function adjustAutoIncrease(d) {
  state.autoIncreaseAmount = Math.max(1, Math.min(60, state.autoIncreaseAmount + d));
  const autoIncreaseInput = document.getElementById("autoIncreaseInput");
  if (autoIncreaseInput) {
    autoIncreaseInput.value = state.autoIncreaseAmount;
  }

  // Only save - recalculation happens when settings closes
  if (saveStateTimer) clearTimeout(saveStateTimer);
  saveStateTimer = setTimeout(() => {
    saveState(true);
    emitStateUpdated("settings_auto_increase");
    scheduleUIRefresh();
  }, 300);
}

function setAutoIncreaseFromInput() {
  const input = document.getElementById("autoIncreaseInput");
  const value = parseInt(input.value);
  if (!isNaN(value)) {
    state.autoIncreaseAmount = Math.max(1, Math.min(60, value));
    input.value = state.autoIncreaseAmount; // Update input to clamped value
    if (saveStateTimer) clearTimeout(saveStateTimer);
    saveStateTimer = setTimeout(() => {
      saveState(true);
      emitStateUpdated("settings_auto_increase_input");
      scheduleUIRefresh();
    }, 300);
  }
}

function adjustPackPrice(d) {
  state.packPrice = Math.max(0.5, Math.min(100, state.packPrice + d));
  const packPriceInput = document.getElementById("packPriceInput");
  if (packPriceInput) {
    packPriceInput.value = state.packPrice;
  }

  // Only save - recalculation happens when settings closes
  if (saveStateTimer) clearTimeout(saveStateTimer);
  saveStateTimer = setTimeout(() => {
    saveState(true);
    emitStateUpdated("settings_pack_price");
    scheduleUIRefresh();
  }, 300);
}
function adjustCigsPerPack(d) {
  state.cigsPerPack = Math.max(10, Math.min(50, state.cigsPerPack + d));
  const cigsPerPackInput = document.getElementById("cigsPerPackInput");
  if (cigsPerPackInput) {
    cigsPerPackInput.value = state.cigsPerPack;
  }

  // Only save - recalculation happens when settings closes
  if (saveStateTimer) clearTimeout(saveStateTimer);
  saveStateTimer = setTimeout(() => {
    saveState(true);
    emitStateUpdated("settings_cigs_per_pack");
    scheduleUIRefresh();
  }, 300);
}

function changeQuitDate() {
  const input = document.getElementById("quitDateInput");
  const val = input ? input.value : "";
  state.quitDate = val ? new Date(val + "T00:00:00") : null;
  updateSettingsUI();
  updateQuitPlan();
  renderReport();
  saveState(true);
  emitStateUpdated("settings_quit_date");
  scheduleUIRefresh();
}

function changeCurrency() {
  state.currency = document.getElementById("currencySelect").value;
  updateSettingsUI();
  // Recalculation happens when settings closes
  saveState(true);
  emitStateUpdated("settings_currency");
  scheduleUIRefresh();
}

// Allow direct edits for pack price and cigs per pack
function setPackPriceFromInput() {
  const input = document.getElementById("packPriceInput");
  if (input) {
    const val = parseFloat(input.value);
    state.packPrice = Math.max(0.5, Math.min(100, val || state.packPrice));
    input.value = state.packPrice;
    if (saveStateTimer) clearTimeout(saveStateTimer);
    saveStateTimer = setTimeout(() => {
      saveState(true);
      emitStateUpdated("settings_pack_price_input");
      scheduleUIRefresh();
    }, 300);
  }
}

function setCigsPerPackFromInput() {
  const input = document.getElementById("cigsPerPackInput");
  if (input) {
    const val = parseInt(input.value);
    state.cigsPerPack = Math.max(10, Math.min(50, val || state.cigsPerPack));
    input.value = state.cigsPerPack;
    if (saveStateTimer) clearTimeout(saveStateTimer);
    saveStateTimer = setTimeout(() => {
      saveState(true);
      emitStateUpdated("settings_cigs_per_pack_input");
      scheduleUIRefresh();
    }, 300);
  }
}

function toggleCalculationDetails() {
  const details = document.getElementById("calculationDetails");
  const toggle = document.getElementById("calcDetailsToggle");

  if (details.style.display === "none" || details.style.display === "") {
    details.style.display = "block";
    toggle.textContent = "▼";
    updateCalculationDetails();
  } else {
    details.style.display = "none";
    toggle.textContent = "▶";
  }
}

function updateCalculationDetails() {
  const startDate = getStartDate();
  if (!startDate) return;
  
  // Use the same functions as main screen for consistency
  const reduction = getCigarettesAvoided();
  const moneySaved = getMoneySaved();
  
  console.log("[CALC DETAILS] reduction:", reduction, "moneySaved:", moneySaved);
  
  const now = Date.now();
  const startMs = new Date(startDate).getTime();
  const dayMs = 1000 * 60 * 60 * 24;
  const elapsedDays = Math.max(1, (now - startMs) / dayMs);
  const totalCigs = state.cigaretteLog.length;
  const dailyAvg = totalCigs / elapsedDays;
  const baseline = Math.max(state.baselinePerDay || state.dailyLimit || 0, 0);
  const dailyReduction = baseline - dailyAvg;
  const costPerCig = state.packPrice / state.cigsPerPack;
  
  // Daily Average
  document.getElementById("calcDailyAvg").innerHTML = 
    `Total: ${totalCigs} cigarettes<br>` +
    `Days: ${elapsedDays.toFixed(2)} days<br>` +
    `Calculation: ${totalCigs} ÷ ${elapsedDays.toFixed(2)} = <strong>${dailyAvg.toFixed(1)} per day</strong>`;
  
  // Reduction (Cigarettes Avoided)
  const reductionSign = reduction >= 0 ? "+" : "";
  const daysSinceQuit = Math.max(1, Math.floor(elapsedDays));
  const expectedTotal = baseline * daysSinceQuit;
  document.getElementById("calcReduction").innerHTML =
    `Baseline: ${baseline} per day<br>` +
    `Days since quit: ${daysSinceQuit}<br>` +
    `Expected at baseline: ${baseline} × ${daysSinceQuit} = ${expectedTotal}<br>` +
    `Actual cigarettes logged: ${totalCigs}<br>` +
    `Calculation: ${expectedTotal} - ${totalCigs} = <strong>${reductionSign}${reduction.toFixed(0)} cigarettes avoided</strong>`;
  
  // Money Saved
  const moneySign = moneySaved >= 0 ? "+" : "";
  document.getElementById("calcMoneySaved").innerHTML =
    `Reduction: ${reduction.toFixed(1)} cigarettes<br>` +
    `Cost per cigarette: ${getCurrencySymbol()}${costPerCig.toFixed(2)}<br>` +
    `Calculation: ${reduction.toFixed(1)} × ${getCurrencySymbol()}${costPerCig.toFixed(2)} = <strong>${moneySign}${getCurrencySymbol()}${moneySaved.toFixed(2)}</strong>`;
  
  // Avg Interval
  if (totalCigs > 1) {
    const intervals = [];
    for (let i = 1; i < state.cigaretteLog.length; i++) {
      const prev = new Date(state.cigaretteLog[i - 1]).getTime();
      const curr = new Date(state.cigaretteLog[i]).getTime();
      intervals.push(curr - prev);
    }
    const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const avgMin = Math.round(avgMs / 60000);
    document.getElementById("calcAvgInterval").innerHTML = 
      `Total intervals: ${intervals.length}<br>` +
      `Sum: ${(avgMs * intervals.length / 60000).toFixed(0)} minutes<br>` +
      `Calculation: ${(avgMs * intervals.length / 60000).toFixed(0)} ÷ ${intervals.length} = <strong>${avgMin} minutes</strong>`;
  } else {
    document.getElementById("calcAvgInterval").innerHTML = "Need at least 2 cigarettes logged to calculate";
  }
  
  // Streak
  let streakDays = 0;
  let date = new Date();
  date.setDate(date.getDate() - 1);
  for (let i = 0; i < 365; i++) {
    const dateStr = date.toDateString();
    const count = state.cigaretteLog.filter(ts => new Date(ts).toDateString() === dateStr).length;
    if (count <= state.dailyLimit) {
      streakDays++;
      date.setDate(date.getDate() - 1);
    } else {
      break;
    }
  }
  document.getElementById("calcStreak").innerHTML = 
    `Daily limit: ${state.dailyLimit} cigarettes<br>` +
    `Checking backwards from yesterday...<br>` +
    `Consecutive days under limit: <strong>${streakDays} days</strong>`;
  
  // Today's Count
  const todayStr = new Date().toDateString();
  const todayCount = state.cigaretteLog.filter(ts => new Date(ts).toDateString() === todayStr).length;
  const todayStatus = todayCount > state.dailyLimit ? "over" : 
                      todayCount === state.dailyLimit ? "at" : 
                      todayCount >= state.dailyLimit * 0.8 ? "close to" : "under";
  document.getElementById("calcTodaysCount").innerHTML =
    `Cigarettes today: ${todayCount}<br>` +
    `Daily limit: ${state.dailyLimit}<br>` +
    `Status: <strong>${todayCount} / ${state.dailyLimit}</strong> (${todayStatus} limit)`;

  // 7-Day Trend
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toDateString();
    const count = state.cigaretteLog.filter(ts => new Date(ts).toDateString() === dateStr).length;
    last7Days.push({ date: dateStr, count });
  }

  if (last7Days.length < 3) {
    document.getElementById("calc7DayTrend").innerHTML = "Need at least 3 days of data to calculate trend";
  } else {
    const midpoint = Math.floor(last7Days.length / 2);
    const firstHalf = last7Days.slice(0, midpoint);
    const secondHalf = last7Days.slice(midpoint);
    const firstAvg = firstHalf.reduce((s, d) => s + d.count, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((s, d) => s + d.count, 0) / secondHalf.length;
    const change = firstAvg - secondAvg;
    const absChange = Math.abs(change);

    let trendDirection = "";
    if (change > 0.3) {
      trendDirection = "Improving (decreasing)";
    } else if (change < -0.3) {
      trendDirection = "Increasing";
    } else {
      trendDirection = "Steady";
    }

    document.getElementById("calc7DayTrend").innerHTML =
      `Days analyzed: 7<br>` +
      `First half average: ${firstAvg.toFixed(1)} per day<br>` +
      `Second half average: ${secondAvg.toFixed(1)} per day<br>` +
      `Change: ${change > 0 ? '-' : '+'}${absChange.toFixed(1)} per day<br>` +
      `Trend: <strong>${trendDirection}</strong>`;
  }
}

function saveSettings() {
  state.autoIncrease = document.getElementById("autoIncrease").checked;

  // Defer DOM updates to avoid blocking touch events
  requestAnimationFrame(() => {
    // Show/hide auto increase amount input based on toggle
    const autoIncreaseContainer = document.getElementById("autoIncreaseAmountContainer");
    if (autoIncreaseContainer) {
      autoIncreaseContainer.style.display = state.autoIncrease ? "flex" : "none";
    }
  });

  const feedbackToggle = document.getElementById("feedbackEnabled");
  const feedbackEnabled = feedbackToggle ? feedbackToggle.checked : true;
  state.feedbackEnabled = feedbackEnabled;
  state.soundEnabled = feedbackEnabled;
  state.vibrationEnabled = feedbackEnabled;
  saveState(true);
  emitStateUpdated("settings_save");
  scheduleUIRefresh();
  updateQuitPlan();
}

// ==================== LLM SETTINGS ====================
// Helper to just update the UI visibility (no state changes)
function updateLLMUI() {
  const apiKeySection = document.getElementById("llmApiKeySection");
  if (apiKeySection) {
    apiKeySection.style.display = state.llmEnabled ? "flex" : "none";
  }
  updateLLMStatus();
}

// Event handler for when user toggles the checkbox
function toggleLLM() {
  state.llmEnabled = document.getElementById("llmEnabled").checked;
  updateLLMUI();
  saveState();
  emitStateUpdated("settings_llm_toggle");
  scheduleUIRefresh();
}

function saveLLMApiKey() {
  const apiKey = document.getElementById("llmApiKey").value.trim();

  if (apiKey && !apiKey.startsWith("hf_")) {
    showToast("Invalid API key format. Should start with hf_", "error");
    return;
  }

  state.llmApiKey = apiKey;
  saveState(true);
  emitStateUpdated("settings_llm_key");
  scheduleUIRefresh();
  updateLLMStatus();
}

function updateLLMStatus() {
  const statusEl = document.getElementById("llmStatus");
  const apiStatusEl = document.getElementById("llmApiStatus");

  // Main status always shows intelligent coach is working
  if (statusEl) {
    statusEl.textContent = "✅ Intelligent coach enabled";
    statusEl.style.color = "var(--accent-green)";
  }

  // API status for advanced users
  if (apiStatusEl) {
    if (!state.llmEnabled) {
      apiStatusEl.textContent =
        "External API disabled - using built-in smart responses";
      apiStatusEl.style.color = "var(--text-muted)";
    } else if (!state.llmApiKey) {
      apiStatusEl.textContent = "API key required to use HuggingFace";
      apiStatusEl.style.color = "var(--accent-orange)";
    } else {
      const requests = state.llmRequestCount || 0;
      const limit = LLM_CONFIG.rateLimit.maxRequests;
      apiStatusEl.textContent = `✅ External API configured (${requests}/${limit} requests used)`;
      apiStatusEl.style.color = "var(--accent-green)";

      if (state.llmLastError) {
        apiStatusEl.textContent += ` - Last error: ${state.llmLastError}`;
      }
    }
  }
}

// testLLMConnection removed for production release

// ==================== SYNC & BACKUP ====================
function generateShareCode() {
  // Check Pro access before allowing share code generation
  if (!ProAccess.requirePro("Sync & Backup")) return;

  const data = {
    v: 3,
    lc: state.lastCigarette?.toISOString(),
    qd: state.quitDate?.toISOString(),
    ti: state.targetInterval,
    dl: state.dailyLimit,
    bp: state.baselinePerDay,
    pp: state.packPrice,
    cpp: state.cigsPerPack,
    curr: state.currency,
    ai: state.autoIncreaseAmount,
    cl: state.cigaretteLog.map((d) => d.toISOString()),
    cr: state.cravingsLog || [],
    ta: state.totalAvoided,
    s: state.streak,
    ach: state.achievements,
  };
  const code = btoa(encodeURIComponent(JSON.stringify(data)));
  navigator.clipboard
    .writeText(code)
    .then(() => showToast('Share code copied! <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-clipboard"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>', "success"));
}

function showRestoreModal() {
  // Check Pro access before allowing restore
  if (!ProAccess.requirePro("Sync & Backup")) return;

  document.getElementById("restoreModal").classList.add("open");
}

function restoreFromCode() {
  const code = document.getElementById("restoreCodeInput").value.trim();
  if (!code) {
    showToast("Enter a code", "error");
    return;
  }
  try {
    const data = JSON.parse(decodeURIComponent(atob(code)));
    const s = data.state || data;

    // VALIDATION: Ensure numeric fields are valid and within bounds
    const validateNumber = (val, min, max, fallback) => {
      const num = Number(val);
      if (isNaN(num) || num < min || num > max) return fallback;
      return num;
    };

    // VALIDATION: Ensure date is valid and not in the future
    const validateDate = (dateStr) => {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      const now = new Date();
      if (isNaN(date.getTime()) || date > now) return null;
      return date;
    };

    const normalized = {
      lastCigarette: s.lastCigarette ?? s.lc,
      quitDate: s.quitDate ?? s.qd,
      targetInterval: validateNumber(s.targetInterval ?? s.ti, 1, 1440, state.targetInterval || 60),
      dailyLimit: validateNumber(s.dailyLimit ?? s.dl, 0, 200, state.dailyLimit || 10),
      baselinePerDay: validateNumber(s.baselinePerDay ?? s.bp, 1, 200, state.baselinePerDay || 10),
      packPrice: validateNumber(s.packPrice ?? s.pp, 0, 1000, state.packPrice || 5),
      cigsPerPack: validateNumber(s.cigsPerPack ?? s.cpp, 1, 100, state.cigsPerPack || 20),
      currency: (s.currency ?? s.curr) || state.currency || '$',
      autoIncreaseAmount: validateNumber(s.autoIncreaseAmount ?? s.ai, 1, 60, state.autoIncreaseAmount || 5),
      cigaretteLog: s.cigaretteLog ?? s.cl,
      cravingsLog: s.cravingsLog ?? s.cr,
      totalAvoided: validateNumber(s.totalAvoided ?? s.ta, 0, 999999, 0),
      streak: validateNumber(s.streak ?? s.s, 0, 999999, 0),
      achievements: (s.achievements ?? s.ach) || state.achievements || {},
    };

    // Validate and parse dates
    const lastCig = validateDate(normalized.lastCigarette);
    const quitDateParsed = validateDate(normalized.quitDate);

    // Validate cigarette log dates
    const validCigLog = (normalized.cigaretteLog || [])
      .map(d => validateDate(d))
      .filter(d => d !== null);

    state = {
      ...state,
      ...normalized,
      lastCigarette: lastCig,
      quitDate: quitDateParsed,
      cigaretteLog: validCigLog,
      firstRun: false,
    };

    state.cravingsLog = state.cravingsLog || [];
    if (!state.baselinePerDay || state.baselinePerDay <= 0) {
      state.baselinePerDay =
        normalized.baselinePerDay ||
        normalized.dailyLimit ||
        state.dailyLimit ||
        10;
    }

    saveState();
    closeModal("restoreModal");

    // Recalculate all derived stats after restore
    updateUI();
    updateSettingsUI();
    updateEventBasedStats();
    updateTimeBasedStats();
    renderReport();
    renderAchievements();

    showToast("Restored! <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"feather feather-award\"><circle cx=\"12\" cy=\"8\" r=\"7\"></circle><polyline points=\"8.21 13.89 7 23 12 20 17 23 15.79 13.89\"></polyline></svg>", "success");
  } catch (e) {
    console.error('[Restore] Failed to restore from code:', e);

    // Provide specific error messages based on error type
    let errorMessage = "Invalid code";
    if (e.message && e.message.includes("atob")) {
      errorMessage = "Code format invalid - must be a valid share code";
    } else if (e.message && e.message.includes("JSON")) {
      errorMessage = "Code is corrupted - unable to read data";
    } else if (e.name === "InvalidCharacterError") {
      errorMessage = "Invalid characters in code";
    }

    showToast(errorMessage, "error");
  }
}

function resetProgress() {
  // Show custom reset modal instead of browser dialogs
  document.getElementById("resetModal").classList.add("open");
  document.getElementById("resetConfirmInput").value = "";
  document.getElementById("resetConfirmInput").focus();
}

async function confirmReset() {
  const input = document.getElementById("resetConfirmInput");

  if (input.value !== "RESET") {
    input.style.borderColor = "var(--accent-red)";
    input.style.background = "rgba(255, 68, 68, 0.1)";
    setTimeout(() => {
      input.style.borderColor = "rgba(255, 255, 255, 0.1)";
      input.style.background = "var(--bg-dark)";
    }, 500);
    showToast('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x-circle"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> Type RESET in all caps to confirm', "error");
    return;
  }

  // Close modal
  closeModal("resetModal");
  input.value = "";

  showToast("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"feather feather-alert-triangle\"><path d=\"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z\"></path><line x1=\"12\" y1=\"9\" x2=\"12\" y2=\"13\"></line><line x1=\"12\" y1=\"17\" x2=\"12.01\" y2=\"17\"></line></svg> Nuclear reset in progress...", "info");

  // Clear all data and set flag for onboarding redirect
  try {
    // Preserve Pro status, RevenueCat user ID, and theme preference (don't reset purchases or theme)
    const proStatus = localStorage.getItem('lotriflow_pro_status');
    const proTrial = localStorage.getItem('lotriflow_pro_trial');
    const proPlanLabel = localStorage.getItem('lotriflow_pro_plan_label');
    const proHasHistory = localStorage.getItem('lotriflow_pro_has_history');
    const stableUserId = localStorage.getItem('lotriflow_stable_user_id');
    const currentTheme = state.theme; // Preserve current theme preference

    // Clear Capacitor Preferences (primary storage)
    await Storage.clear();
    await Storage.remove({ key: "lotriflow_quit_state" });

    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();

    // Restore Pro status (don't reset user's purchase)
    if (proStatus) localStorage.setItem('lotriflow_pro_status', proStatus);
    if (proTrial) localStorage.setItem('lotriflow_pro_trial', proTrial);
    if (proPlanLabel) localStorage.setItem('lotriflow_pro_plan_label', proPlanLabel);
    if (proHasHistory) localStorage.setItem('lotriflow_pro_has_history', proHasHistory);
    if (stableUserId) localStorage.setItem('lotriflow_stable_user_id', stableUserId);

    // Preserve theme preference in sessionStorage (survives reload)
    if (currentTheme) sessionStorage.setItem('preservedTheme', currentTheme);

    // Clear all Cache Storage (service worker caches)
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
      console.log('[Reset] Cleared', cacheNames.length, 'caches');
    }

    // Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
      console.log('[Reset] Unregistered', registrations.length, 'service workers');
    }

    // Set a flag in sessionStorage that survives the reload to force onboarding
    sessionStorage.setItem('forceOnboardingReset', 'true');

    // Set flag to force state reinitialization
    sessionStorage.setItem('clearStateOnLoad', 'true');
  } catch (err) {
    console.warn("[Reset] Failed to clear storage:", err);
  }

  showToast("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"feather feather-check-circle\"><path d=\"M22 11.08V12a10 10 0 1 1-5.93-8.93\"></path><polyline points=\"22 4 12 14.01 9 11.01\"></polyline></svg> Reset complete! Returning to onboarding...", "success");

  // Reload the page to start fresh with onboarding
  setTimeout(() => {
    location.reload();
  }, 1500);
}

// ==================== NAVIGATION & RENDERING ====================
// Expose showSection globally for inline HTML onclick
window.showSection = showSection;
window.showHome = showHome;

function showHome() {
  window.scrollTo(0, 0); // Reset scroll position

  // Close settings panel if open so user can see the section change
  const settingsPanel = document.getElementById("settingsPanel");
  if (settingsPanel && settingsPanel.classList.contains("open")) {
    toggleSettings();
  }

  // Hide all sections
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.remove("active");
  });

  // Show the home section
  const homeSection = document.getElementById("homeSection");
  if (homeSection) {
    homeSection.classList.add("active");
  }

  // Update nav tab active state
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Find and activate the Home tab
  const homeTab = Array.from(document.querySelectorAll(".nav-tab")).find(
    (tab) => tab.onclick && tab.onclick.toString().includes("showHome")
  );
  if (homeTab) {
    homeTab.classList.add("active");
  }
}

function showSection(sectionName) {
  window.scrollTo(0, 0); // Reset scroll position

  // Close settings panel if open so user can see the section change
  const settingsPanel = document.getElementById("settingsPanel");
  if (settingsPanel && settingsPanel.classList.contains("open")) {
    toggleSettings();
  }

  // Block navigation into Pro-only sections when locked
  const targetSection = document.getElementById(sectionName + "Section");
  if (
    targetSection &&
    targetSection.classList.contains("pro-feature") &&
    !ProAccess.hasAccess()
  ) {
    const featureName =
      targetSection.getAttribute("data-pro-feature-name") || "This feature";
    showToast(buildProToastMessage(featureName, true), "info");
    ProAccess.showUpgradeModal();
    return;
  }

  // Hide all sections
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.remove("active");
  });

  // Show the selected section
  if (targetSection) {
    targetSection.classList.add("active");

    // Trigger Pro check for locked sections (overlay will show automatically)
    // The ProAccess.updateUI() will have already set .locked class if needed
    if (sectionName === "milestones") {
      renderMilestones();
    }
    if (sectionName === "achievements") {
      renderAchievements();
    }
  }

  // Update nav tab active state
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Find and activate the clicked tab
  const clickedTab = Array.from(document.querySelectorAll(".nav-tab")).find(
    (tab) => tab.onclick && tab.onclick.toString().includes(`'${sectionName}'`)
  );
  if (clickedTab) {
    clickedTab.classList.add("active");
  }

  if (sectionName === "coach") {
    updateCoachMessage();
  }
  if (sectionName === "quitPlan") {
    // Always default to Key Milestones view
    quitPlanGranularity = "key";
    const select = document.getElementById("quitPlanGranularity");
    if (select) select.value = "key";
    changeQuitPlanGranularity();
  }
}

// Expose navigation for inline HTML onclick
window.showSection = showSection;

// ==================== VERSION UPDATE ====================
function updateAppVersion() {
  const metadata = window.__APP_METADATA__ || { version: '1.0.6', build: '6' };

  // Update About section version
  const aboutVersionEl = document.getElementById('aboutVersion');
  if (aboutVersionEl) {
    aboutVersionEl.textContent = `Version ${metadata.version} (Build ${metadata.build})`;
  }

  // Update footer version (if it exists)
  const appVersionEl = document.getElementById('appVersion');
  if (appVersionEl) {
    appVersionEl.textContent = `LotriFlow Quit v${metadata.version}`;
  }

  const appBuildEl = document.getElementById('appBuild');
  if (appBuildEl) {
    appBuildEl.textContent = `Build ${metadata.build}`;
  }
}

// ==================== INIT ====================
document.addEventListener("DOMContentLoaded", () => {
  updateAppVersion();
  if (typeof init === 'function') init();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) saveState();
});
window.addEventListener("beforeunload", () => saveState());
