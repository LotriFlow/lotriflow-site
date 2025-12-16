# Testing Guide

This project currently has no automated test suite. Use the checklist below to validate critical flows after changes.

## Quick Commands
- Build web bundle: `npm run build`
- Clean dist (if needed): `rm -rf dist`

## Smoke Tests (Web/Capacitor)
1) **Load App**
   - Open the app; confirm timer digits render and no console errors.
2) **Log Cigarette**
   - Tap "Log Cigarette" (ready state) and confirm timer resets, stats update, and toast appears.
   - Tap when early; confirm early warning copy shows.
3) **Cravings**
   - Add trigger + notes; confirm entry appears in list and “log craving” toast.
4) **Settings**
   - Change interval, daily limit, baseline, currency; close settings and confirm values persist after reload.
5) **Notifications (web)**
   - Enable notifications; grant permission; ensure toggle stays on. Disable and confirm muted state.
6) **Daily Reminder (native)**
   - Enable daily reminder; set a time; confirm scheduling does not error. Disable and confirm cancel.
7) **Theme/Navigation**
   - Toggle dark/light; switch bottom tabs; verify sections render without layout jumps.
8) **Watch Sync (if available)**
   - Log a cigarette from the watch; confirm mobile timer resets and stats update once.

## Performance Checks
- Scroll main screen and switch tabs; confirm no stutter.
- Let the app sit idle 30s; ensure no runaway CPU (single rAF loop + background ticker).

## Regression Spots
- Crisis banner: should clear once interval reached and no rapid logs.
- Daily reminder toggle: should stay in sync with settings visibility state.
- Install section: hidden on native builds.
