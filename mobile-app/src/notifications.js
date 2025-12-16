// ==================== NOTIFICATIONS ====================
// Check if running as native iOS/Android app
function isNativeApp() {
  if (!window.Capacitor) return false;
  if (typeof Capacitor.isNativePlatform === "function") {
    try {
      return Capacitor.isNativePlatform();
    } catch (_) {}
  }
  if (typeof Capacitor.getPlatform === "function") {
    const platform = Capacitor.getPlatform();
    return platform && platform !== "web";
  }
  return false;
}

function isIosNative() {
  if (!window.Capacitor) return false;
  if (typeof Capacitor.getPlatform === "function") {
    return Capacitor.getPlatform() === "ios";
  }
  return false;
}

// Request notification permissions (native or web)
async function requestNotificationPermission() {
  const LocalNotificationsPlugin = window.Capacitor && typeof Capacitor.isPluginAvailable === 'function' && Capacitor.isPluginAvailable('LocalNotifications') ? Capacitor.Plugins.LocalNotifications : null;
  const supportsDailyReminder = !!LocalNotificationsPlugin || !!(window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.LocalNotifications) || isNativeApp() || !!window.__test_supportsDailyReminder;
  console.warn('[Notifications] enforceNotificationAvailability - LocalNotificationsPlugin:', !!LocalNotificationsPlugin, 'Capacitor:', !!window.Capacitor, 'supportsDailyReminder:', supportsDailyReminder);
  if (LocalNotificationsPlugin) {
    // Native app - use Capacitor Local Notifications
    const result = await LocalNotificationsPlugin.requestPermissions();
    return result.display === "granted";
  } else if ("Notification" in window) {
    // Web fallback
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  return false;
}

// Toggle daily reminder notifications
async function toggleDailyReminder() {
  const checkbox = document.getElementById("dailyReminderEnabled");
  const reminderTimeRow = document.getElementById("reminderTimeRow");
  console.log('[Notifications] toggleDailyReminder called, checkbox.checked:', checkbox ? checkbox.checked : 'NO-EL', 'notificationsMuted:', state.notificationsMuted);

  if (state.notificationsMuted) {
    // Defer DOM updates to avoid blocking touch events
    requestAnimationFrame(() => {
      checkbox.checked = false;
      showToast("Notifications are paused. Unpause to enable.", "info");
    });
    return;
  }

  if (checkbox.checked) {
    const granted = await requestNotificationPermission();
    if (granted) {
      state.dailyReminderEnabled = true;
      console.log('[Notifications] dailyReminderEnabled ->', state.dailyReminderEnabled);
      // Defer DOM updates to avoid blocking touch events
      requestAnimationFrame(() => {
        if (reminderTimeRow) reminderTimeRow.style.display = "";
      });
      await scheduleDailyReminder();
      showToast("Daily reminder enabled! <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"feather feather-bell\"><path d=\"M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9\"></path><path d=\"M13.73 21a2 2 0 0 1-3.46 0\"></path></svg>", "success");
    } else {
      // Defer DOM updates to avoid blocking touch events
      requestAnimationFrame(() => {
        checkbox.checked = false;
        showToast("Please allow notifications in settings", "info");
      });
    }
  } else {
    state.dailyReminderEnabled = false;
    console.log('[Notifications] dailyReminderEnabled ->', state.dailyReminderEnabled);
    if (reminderTimeRow) reminderTimeRow.style.display = "none";
    await cancelDailyReminder();
  }
  saveState();
  emitStateUpdated("settings_daily_reminder_toggle");
  scheduleUIRefresh();
}

// Update reminder time
async function updateReminderTime() {
  const timeInput = document.getElementById("reminderTime");
  if (timeInput) {
    state.dailyReminderTime = timeInput.value;
    saveState();
    emitStateUpdated("settings_daily_reminder_time");
    scheduleUIRefresh();
    
    if (state.dailyReminderEnabled) {
      await scheduleDailyReminder();
      showToast('Reminder time updated <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check"><polyline points="20 6 9 17 4 12"></polyline></svg>', "info");
    }
  }
}

// Schedule daily reminder notification
let schedulingDailyReminder = false; // Prevent concurrent scheduling
let lastDailyReminderScheduleTime = 0;
let lastScheduledDailyTime = null; // Track the last scheduled time to prevent unnecessary re-scheduling
let lastDailyReminderScheduledAt = null; // Track exact timestamp to dedupe across sessions

async function scheduleDailyReminder() {
  if (state.notificationsMuted || !state.dailyReminderEnabled) {
    console.log("[Notifications] Daily reminder scheduling skipped - muted:", state.notificationsMuted, "enabled:", state.dailyReminderEnabled);
    return;
  }

  // Debounce - don't schedule more than once per 3 seconds
  const now = Date.now();
  if (now - lastDailyReminderScheduleTime < 3000) {
    console.log("[Notifications] Debouncing scheduleDailyReminder call (called too recently)");
    return;
  }

  // Check if we're already scheduled for this exact time
  if (lastScheduledDailyTime === state.dailyReminderTime) {
    console.log("[Notifications] Daily reminder already scheduled for", state.dailyReminderTime, "- skipping");
    return;
  }

  // Prevent concurrent scheduling calls
  if (schedulingDailyReminder) {
    console.log("[Notifications] Already scheduling daily reminder, skipping duplicate call");
    return;
  }

  schedulingDailyReminder = true;
  lastDailyReminderScheduleTime = now;

  const [hours, minutes] = state.dailyReminderTime.split(":").map(Number);

  try {
    // Cancel ALL existing reminders first to prevent duplicates
    if (LocalNotifications) {
      try {
        // Get all pending notifications
        const pending = await LocalNotifications.getPending();
        console.log("[Notifications] Found", pending.notifications.length, "pending notifications before scheduling daily reminder");

        // Cancel any previously scheduled daily reminders (legacy IDs or duplicates)
        const remindersToCancel = pending.notifications.filter(n => n.id === 1001 || n.extra?.type === "daily_reminder" || /daily/i.test(n.title || ""));
        if (remindersToCancel.length) {
          await LocalNotifications.cancel({
            notifications: remindersToCancel.map(n => ({ id: n.id }))
          });
          console.log("[Notifications] Cancelled", remindersToCancel.length, "existing daily reminder(s)");
        }

        // Also list all pending notifications for debugging
        pending.notifications.forEach(n => {
          console.log("[Notifications] Pending notification:", n.id, n.title, n.schedule);
        });
      } catch (error) {
        console.warn("[Notifications] Failed to check/cancel pending:", error);
      }
    }

    if (LocalNotifications) {
      // Native app - schedule daily notification (non-repeating, will reschedule after firing)
      const currentDate = new Date();
      let scheduleDate = new Date();
      scheduleDate.setHours(hours, minutes, 0, 0);

      // If time has passed today, schedule for tomorrow
      if (scheduleDate <= currentDate) {
        scheduleDate.setDate(scheduleDate.getDate() + 1);
      }

      try {
        // If an identical reminder is already pending for this timestamp, skip re-scheduling
        try {
          const pending = await LocalNotifications.getPending();
          const targetTs = scheduleDate.getTime();
          const alreadyScheduled = pending.notifications.some(n => {
            if (!(n.id === 1001 || n.extra?.type === "daily_reminder")) return false;
            const at = n.schedule?.at;
            const pendingTs = at ? new Date(at).getTime() : NaN;
            return !Number.isNaN(pendingTs) && Math.abs(pendingTs - targetTs) < 60 * 1000; // within 1 minute
          });
          if (alreadyScheduled) {
            console.log("[Notifications] Daily reminder already pending for", new Date(targetTs).toLocaleString(), "- skipping re-schedule");
            lastScheduledDailyTime = state.dailyReminderTime;
            lastDailyReminderScheduledAt = targetTs;
            return;
          }
        } catch (e) {
          console.warn("[Notifications] Pending check failed, continuing to schedule:", e);
        }

        // Ensure permission is granted before scheduling
        const permissionStatus = await LocalNotifications.checkPermissions();
        if (permissionStatus.display !== "granted") {
          const requestResult = await LocalNotifications.requestPermissions();
          if (requestResult.display !== "granted") {
            console.log("[Notifications] Permission not granted for daily reminder - aborting schedule");
            return;
          }
        }

        // Fixed message to avoid any potential issues with random messages
        const reminderMessage = "Check your progress today! Every smoke-free moment counts.";

        // Use a simple non-repeating notification with specific date/time
        const dailyNotification = {
          id: 1001,
          title: "LotriFlow Quit Daily Check-in",
          body: reminderMessage,
          schedule: {
            at: scheduleDate,
            allowWhileIdle: true,
          },
          sound: "default",
          actionTypeId: "OPEN_APP",
          extra: { type: "daily_reminder" },
        };

        await LocalNotifications.schedule({
          notifications: [dailyNotification],
        });

        console.log("[Notifications] ========================================");
        console.log("[Notifications] DAILY REMINDER SCHEDULED");
        console.log("[Notifications] ID:", dailyNotification.id);
        console.log("[Notifications] Title:", dailyNotification.title);
        console.log("[Notifications] Body:", dailyNotification.body);
        console.log("[Notifications] Schedule for:", scheduleDate.toLocaleString(), "at", hours + ":" + minutes);
        console.log("[Notifications] Type:", dailyNotification.extra.type);
        console.log("[Notifications] ========================================");
        console.log("[Notifications] Timestamp:", scheduleDate.getTime(), "Current time:", currentDate.getTime(), "Difference (minutes):", Math.floor((scheduleDate.getTime() - currentDate.getTime()) / 60000));
        lastScheduledDailyTime = state.dailyReminderTime;
        lastDailyReminderScheduledAt = scheduleDate.getTime();

        // Verify it was scheduled
        const verifyPending = await LocalNotifications.getPending();
        const scheduledReminder = verifyPending.notifications.find(n => n.id === 1001);
        if (scheduledReminder) {
          console.log("[Notifications] ✓ Verified daily reminder is pending:", scheduledReminder);
        } else {
          console.error("[Notifications] ✗ Daily reminder was NOT found in pending notifications after scheduling!");
        }
      } catch (error) {
        console.error("[Notifications] Failed to schedule daily reminder:", error);
      }
    }
  } finally {
    schedulingDailyReminder = false;
  }
}

// Cancel daily reminder
async function cancelDailyReminder() {
  if (LocalNotifications) {
    try {
      await LocalNotifications.cancel({ notifications: [{ id: 1001 }] });
      lastScheduledDailyTime = null;
      lastDailyReminderScheduledAt = null;
      console.log("[Notifications] Daily reminder cancelled");
    } catch (error) {
      console.error("[Notifications] Failed to cancel:", error);
    }
  }
}

// Schedule milestone celebration notification
async function scheduleMilestoneNotification(milestone) {
  // Schedule milestone notifications if notifications are enabled (either general notifications
  // or daily reminders), the device supports LocalNotifications, and notifications aren't muted.
  if (
    state.notificationsMuted ||
    !LocalNotifications ||
    (!state.notificationsEnabled && !state.dailyReminderEnabled)
  )
    return;
  
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 2000 + Math.floor(Math.random() * 1000),
          title: "Milestone Achieved!",
          body: `Congratulations! ${milestone}`,
          schedule: { at: new Date(Date.now() + 1000) }, // 1 second delay
          sound: "default",
        },
      ],
    });
  } catch (error) {
    console.error("[Notifications] Failed to schedule milestone:", error);
  }
}

// Get random motivational reminder message
function getRandomReminderMessage() {
  const messages = [
    "Check your progress today! Every smoke-free moment counts.",
    "You're doing amazing! Open the app to see how far you've come.",
    "Stay strong on your journey. Your health is worth it!",
    "Time to celebrate your progress! Check your stats.",
    "Another day, another victory. Keep going!",
    "Your lungs are thanking you. See your health improvements!",
    "Remember why you started. You've got this!",
    "Small steps lead to big changes. Check your journey!",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

function toggleNotificationMute() {
  const muteToggle = document.getElementById("notificationsMuted");
  const muted = muteToggle ? muteToggle.checked : false;
  state.notificationsMuted = muted;

  // Defer DOM updates to avoid blocking the current touch event
  requestAnimationFrame(() => {
    const notificationsToggle = document.getElementById("notificationsEnabled");
    const dailyReminderCheckbox = document.getElementById("dailyReminderEnabled");
    const reminderTimeRow = document.getElementById("reminderTimeRow");

    if (muted) {
      if (notificationsToggle) {
        notificationsToggle.checked = false;
        notificationsToggle.disabled = true;
      }
      if (dailyReminderCheckbox) {
        dailyReminderCheckbox.checked = false;
        dailyReminderCheckbox.disabled = true;
      }
      if (reminderTimeRow) {
        reminderTimeRow.style.display = "none";
      }
      state.notificationsEnabled = false;
      state.dailyReminderEnabled = false;
      cancelDailyReminder();
      showToast("Notifications paused", "info");
    } else {
      if (notificationsToggle) {
        notificationsToggle.disabled = false;
      }
      if (dailyReminderCheckbox) {
        dailyReminderCheckbox.disabled = false;
      }
      enforceNotificationAvailability();
      showToast("Notifications unpaused", "info");
    }

    saveState();
    emitStateUpdated("settings_notifications_mute");
    scheduleUIRefresh();
  });
}

// Legacy web notifications toggle (kept for backwards compatibility)
async function toggleNotifications() {
  const checkbox = document.getElementById("notificationsEnabled");

  if (state.notificationsMuted) {
    checkbox.checked = false;
    showToast("Notifications are paused. Unpause to enable.", "info");
    return;
  }

  // On native iOS, redirect to daily reminder
  if (isIosNative()) {
    checkbox.checked = false;
    const row = document.getElementById("notificationsRow");
    if (row) row.style.display = "none";
    return;
  }

  if (checkbox.checked) {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        state.notificationsEnabled = true;
        showToast("Notifications enabled!", "success");
        scheduleNotification();
      } else {
        checkbox.checked = false;
        showToast("Please allow notifications in browser settings", "info");
      }
    } else {
      checkbox.checked = false;
      showToast("Notifications not supported on this device", "error");
    }
  } else {
    state.notificationsEnabled = false;
  }
  saveState();
  emitStateUpdated("settings_notifications_toggle");
  scheduleUIRefresh();
}

// Prevent concurrent scheduling of interval notifications
let schedulingIntervalNotification = false;
let lastIntervalScheduleTime = 0;

async function scheduleNotification() {
  if (state.notificationsMuted) return;
  if (!state.lastCigarette) return;

  // Prevent excessive scheduling calls (debounce to max once per 2 seconds)
  const now = Date.now();
  if (now - lastIntervalScheduleTime < 2000) {
    console.log("[Notifications] Debouncing scheduleNotification call (called too recently)");
    return;
  }

  // Prevent concurrent scheduling calls
  if (schedulingIntervalNotification) {
    console.log("[Notifications] Already scheduling interval notification, skipping duplicate call");
    return;
  }

  schedulingIntervalNotification = true;
  lastIntervalScheduleTime = now;

  try {
    const elapsed = getElapsedSeconds();
    const targetSeconds = state.targetInterval * 60;
    let remaining = targetSeconds - elapsed;

    // If interval already passed, fire ASAP (1s) instead of pushing to the next interval.
    if (remaining <= 0) {
      remaining = 1;
      console.log("[Notifications] Interval already passed; scheduling ASAP in 1 second");
    }

    // Round to the nearest second and enforce a minimum 1s lead to avoid zero/negative schedules.
    const remainingSeconds = Math.max(Math.ceil(remaining), 1);

    // Native app - use LocalNotifications plugin
    if (LocalNotifications) {
      try {
        // Check permissions first
        const permissionStatus = await LocalNotifications.checkPermissions();
        if (permissionStatus.display !== 'granted') {
          console.log("[Notifications] Permission not granted, requesting...");
          const result = await LocalNotifications.requestPermissions();
          if (result.display !== 'granted') {
            console.log("[Notifications] Permission denied, cannot schedule");
            return;
          }
        }

        // Cancel any existing interval notification (id: 1000)
        const pending = await LocalNotifications.getPending();
        // Cancel any existing interval notifications (id 1000 or tagged as interval_complete)
        const intervalPending = pending.notifications.filter(
          (n) => n.id === 1000 || n.extra?.type === "interval_complete"
        );
        if (intervalPending.length) {
          await LocalNotifications.cancel({
            notifications: intervalPending.map((n) => ({ id: n.id })),
          });
          console.log("[Notifications] Cancelled existing interval notification(s)", intervalPending.length);
        }

        // Schedule notification for when interval is complete
        const scheduleDate = new Date(Date.now() + (remainingSeconds * 1000));

        const intervalNotification = {
          id: 1000,
          title: `${state.targetInterval}-Minute Interval Reached!`,
          body: `Your target interval is complete. You can now log a cigarette or continue staying smoke-free.`,
          schedule: {
            at: scheduleDate,
            allowWhileIdle: true,
          },
          sound: "default",
          actionTypeId: "OPEN_APP",
          extra: { type: "interval_complete" },
        };

        await LocalNotifications.schedule({
          notifications: [intervalNotification],
        });

        console.log("[Notifications] ========================================");
        console.log("[Notifications] INTERVAL COMPLETE SCHEDULED");
        console.log("[Notifications] ID:", intervalNotification.id);
        console.log("[Notifications] Title:", intervalNotification.title);
        console.log("[Notifications] Body:", intervalNotification.body);
        console.log("[Notifications] Schedule for:", scheduleDate.toLocaleString());
        console.log("[Notifications] Type:", intervalNotification.extra.type);
        console.log("[Notifications] Timestamp:", scheduleDate.getTime(), "Current time:", Date.now(), "Difference (minutes):", Math.floor((scheduleDate.getTime() - Date.now()) / 60000));
        console.log("[Notifications] Elapsed:", Math.floor(elapsed / 60), "minutes | Target interval:", state.targetInterval, "minutes | Remaining:", Math.floor(remainingSeconds / 60), "minutes");
        console.log("[Notifications] ========================================");

        // Verify it was scheduled
        const verifyPending = await LocalNotifications.getPending();
        const scheduledInterval = verifyPending.notifications.find(n => n.id === 1000);
        if (scheduledInterval) {
          console.log("[Notifications] ✓ Verified interval notification is pending:", scheduledInterval);
        } else {
          console.error("[Notifications] ✗ Interval notification was NOT found in pending notifications after scheduling!");
        }
      } catch (error) {
        console.error("[Notifications] Failed to schedule interval notification:", error);
      }
    }
    // Web fallback - use setTimeout and web notifications
    else if (state.notificationsEnabled && remainingSeconds > 0) {
      setTimeout(() => {
        if (Notification.permission === "granted") {
          new Notification(`${state.targetInterval}-Minute Interval Reached!`, {
            body: "Your target interval is complete. You can now log a cigarette or continue staying smoke-free.",
            icon: "assets/icon-192x192.png",
            badge: "assets/icon-192x192.png",
            tag: "interval-reached",
          });
        }
      }, remainingSeconds * 1000);
    }
    emitStateUpdated("schedule_notification");
  } finally {
    schedulingIntervalNotification = false;
  }
}

// Test notification - fires immediately to verify notifications work
async function testNotificationNow() {
  if (!LocalNotifications) {
    showToast("LocalNotifications not available", "error");
    return;
  }

  try {
    // Check permissions
    const permissionStatus = await LocalNotifications.checkPermissions();
    console.log("[Notifications] Test - Current permission status:", permissionStatus);

    if (permissionStatus.display !== 'granted') {
      console.log("[Notifications] Test - Requesting permissions...");
      const result = await LocalNotifications.requestPermissions();
      console.log("[Notifications] Test - Permission result:", result);

      if (result.display !== 'granted') {
        showToast("Notification permission denied", "error");
        return;
      }
    }

    // Schedule a test notification for 5 seconds from now
    const testDate = new Date(Date.now() + 5000);
    console.log("[Notifications] Test - Scheduling test notification for", testDate.toLocaleString());

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 9999,
          title: "Test Notification",
          body: "This is a test notification scheduled for 5 seconds from now. If you see this, notifications are working!",
          schedule: {
            at: testDate,
            allowWhileIdle: true,
          },
          sound: "default",
          extra: { type: "test" },
        },
      ],
    });

    // Verify it was scheduled
    const pending = await LocalNotifications.getPending();
    const testNotif = pending.notifications.find(n => n.id === 9999);

    if (testNotif) {
      console.log("[Notifications] Test - ✓ Test notification scheduled successfully:", testNotif);
      showToast("Test notification scheduled for 5 seconds from now", "success");
    } else {
      console.error("[Notifications] Test - ✗ Test notification NOT found in pending!");
      showToast("Test notification failed to schedule", "error");
    }

    // List all pending notifications for debugging
    console.log("[Notifications] Test - All pending notifications:", pending.notifications);
  } catch (error) {
    console.error("[Notifications] Test - Failed:", error);
    showToast("Test notification error: " + error.message, "error");
  }
}

// Initialize notification listeners (must be called once on app startup)
function initializeNotificationListeners() {
  if (!LocalNotifications) {
    console.log("[Notifications] LocalNotifications plugin not available, skipping listeners");
    return;
  }

  console.log("[Notifications] Initializing notification event listeners");

  // Handle notification received (when notification arrives)
  LocalNotifications.addListener('localNotificationReceived', (notification) => {
    console.log("[Notifications] ========================================");
    console.log("[Notifications] NOTIFICATION RECEIVED!");
    console.log("[Notifications] ID:", notification.id);
    console.log("[Notifications] Title:", notification.title);
    console.log("[Notifications] Body:", notification.body);
    console.log("[Notifications] Type:", notification.extra?.type);
    console.log("[Notifications] Full notification:", notification);
    console.log("[Notifications] ========================================");

    // Auto-reschedule daily reminder for next day
    if (notification.extra?.type === 'daily_reminder') {
      console.log("[Notifications] ✓ This is a DAILY REMINDER - rescheduling for tomorrow");
      // Reset the time tracking so it can be rescheduled
      lastScheduledDailyTime = null;
      // Reschedule for tomorrow
      setTimeout(() => {
        if (state.dailyReminderEnabled && !state.notificationsMuted) {
          scheduleDailyReminder();
        }
      }, 1000);
    } else if (notification.extra?.type === 'interval_complete') {
      console.log("[Notifications] ✓ This is an INTERVAL COMPLETE notification");
      // No auto-rescheduling needed - will reschedule when user logs next cigarette
    } else {
      console.log("[Notifications] ⚠️ Unknown notification type!");
    }
  });

  // Handle notification action performed (when user taps notification)
  LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
    console.log("[Notifications] Notification action performed:", notificationAction);

    const notification = notificationAction.notification;

    // Handle different notification types
    if (notification.extra?.type === 'interval_complete') {
      console.log("[Notifications] User tapped interval complete notification");
      // Navigate to home/timer view
      const homeTab = document.querySelector('[data-tab="home"]');
      if (homeTab) homeTab.click();
    } else if (notification.extra?.type === 'daily_reminder') {
      console.log("[Notifications] User tapped daily reminder notification");
      // Navigate to home/timer view
      const homeTab = document.querySelector('[data-tab="home"]');
      if (homeTab) homeTab.click();
    }
  });
}

function enforceNotificationAvailability() {
  const checkbox = document.getElementById("notificationsEnabled");
  const row = document.getElementById("notificationsRow");
  const dailyReminderRow = document.getElementById("dailyReminderRow");
  const reminderTimeRow = document.getElementById("reminderTimeRow");

  if (!checkbox || !row) return;

  const muted = !!state.notificationsMuted;
  const isNative = isNativeApp();
  const LocalNotificationsPlugin = window.Capacitor && typeof Capacitor.isPluginAvailable === 'function' && Capacitor.isPluginAvailable('LocalNotifications') ? Capacitor.Plugins.LocalNotifications : null;
  const supportsDailyReminder = !!LocalNotificationsPlugin || isNative;

  // Web push row visibility/enablement
  if (isNative) {
    checkbox.checked = false;
    checkbox.disabled = true;
    row.style.display = "none";
    state.notificationsEnabled = false;
  } else {
    checkbox.disabled = muted ? true : false;
    row.style.display = "";
  }

  // Daily reminder visibility (native only)
  if (dailyReminderRow) {
    dailyReminderRow.style.display = "";
    dailyReminderRow.classList.toggle("disabled", muted || !supportsDailyReminder);
    const dailyReminderCheckbox = document.getElementById("dailyReminderEnabled");
    if (dailyReminderCheckbox) {
      dailyReminderCheckbox.disabled = muted || !supportsDailyReminder;
      dailyReminderCheckbox.checked =
        !muted && supportsDailyReminder && (state.dailyReminderEnabled || false);
    }
  }

  if (reminderTimeRow) {
    const showReminderTime =
      supportsDailyReminder && !muted && state.dailyReminderEnabled;
    reminderTimeRow.style.display = showReminderTime ? "" : "none";
  }
}
