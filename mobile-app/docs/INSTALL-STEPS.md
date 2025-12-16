# 🔧 Step-by-Step PWA Reinstallation Guide

## CRITICAL: Follow These Steps IN ORDER

---

## ⚠️ STEP 1: UNINSTALL OLD PWA APP (MANDATORY!)

**You MUST uninstall the old installed app before proceeding!**

### Desktop (Chrome/Edge):

1. Type in address bar: `chrome://apps` (or `edge://apps`)
2. Find "BreatheFree" app
3. Right-click on it
4. Select "Remove from Chrome" (or "Remove from Edge")
5. Click "Remove" to confirm

**Alternative for Desktop:**
- In Windows Settings → Apps → Installed Apps
- Find "BreatheFree"
- Click "Uninstall"

### Android:

1. Find the BreatheFree icon on your home screen
2. Long-press the icon
3. Tap "Uninstall" or drag to "Uninstall"
4. Confirm

### iOS (Safari):

1. Find the BreatheFree icon on your home screen
2. Long-press the icon
3. Tap "Remove App"
4. Tap "Delete App" to confirm

---

## 📋 STEP 2: CLOSE ALL BROWSER TABS

1. Close ALL tabs that have BreatheFree open
2. Close any other tabs from the same domain
3. **Close the browser completely** (not just the window - EXIT the browser)

---

## 🧹 STEP 3: CLEAN CACHED DATA

1. **Start the test server** (if not already running):
   ```bash
   cd c:\BreatheFree
   python -m http.server 8080
   ```

2. **Open your browser fresh** (completely new session)

3. **Navigate to the cleaner:**
   ```
   http://localhost:8080/clean-pwa.html
   ```

4. **Click "Clear All PWA Data"**

5. **Wait for success message**

6. **Close the browser completely again**

---

## 🔄 STEP 4: RESTART BROWSER

1. **Completely quit your browser** (not just close tabs)
   - Windows: Right-click taskbar icon → Close all windows
   - Or use Task Manager to end browser process

2. **Wait 5 seconds**

3. **Open browser fresh**

---

## 🎯 STEP 5: LOAD APP WITH HARD REFRESH

1. **Open a NEW browser window**

2. **Navigate to:**
   ```
   http://localhost:8080/breathefree-timer.html
   ```

3. **Press Ctrl+F5** (Windows) or **Cmd+Shift+R** (Mac)
   - This forces a hard refresh bypassing ALL cache

4. **Open DevTools** (Press F12)

5. **Check Console for:**
   ```
   [SW] Registered: /
   Setting up PWA...
   PWA check: { https: true, serviceWorker: true, manifest: true }
   ```

6. **Check Application tab:**
   - Go to Application → Manifest
   - Should show NO errors
   - Should show `start_url: /breathefree-timer.html`

---

## 📱 STEP 6: INSTALL NEW PWA

### Desktop:

1. **Look for Install icon** (⊕ or download icon) in the address bar
2. **Click the icon**
3. Click "Install" in the prompt
4. The app should open in a new standalone window

### If Install Button Doesn't Show (Desktop):

1. Click the three dots menu (⋮)
2. Look for "Install BreatheFree" or "Install app"
3. Click it

### Mobile:

1. Look for "Add to Home Screen" banner at bottom
2. Tap "Install" or "Add"

**OR**

1. Tap the Share button (Safari) or Menu (Chrome)
2. Tap "Add to Home Screen"
3. Tap "Add"

---

## ✅ STEP 7: VERIFY INSTALLATION

1. **App should open in standalone mode**
   - No browser address bar
   - No browser UI
   - Just the app

2. **Test offline:**
   - Open the installed app
   - Turn off WiFi/disconnect internet
   - App should still work

3. **Check settings:**
   - Open the app
   - Go to Settings
   - "Install App" section should say "Already installed"

---

## 🐛 TROUBLESHOOTING

### Install button still not showing?

**Go back to STEP 1** - You probably still have the old app installed somewhere:
- Check `chrome://apps`
- Check Windows "Installed Apps"
- Check for shortcuts on desktop

### Getting old version after install?

**You didn't clean properly.** Repeat:
1. Uninstall app (STEP 1)
2. Close ALL tabs and browser
3. Run clean-pwa.html (STEP 3)
4. Restart browser (STEP 4)
5. Hard refresh (STEP 5)

### Service worker not registering?

**In DevTools Console, paste:**
```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(r => r.unregister());
  console.log('Unregistered all service workers');
  setTimeout(() => window.location.reload(), 1000);
});
```

### Still having issues?

**Nuclear option:**
1. Uninstall app
2. Clear ALL browser data:
   - Press Ctrl+Shift+Delete
   - Select "All time"
   - Check ALL boxes
   - Click "Clear data"
3. Restart browser
4. Start from STEP 5

---

## 📊 CHANGES MADE

- ✅ Fixed manifest.json paths (`.` → `/`)
- ✅ Fixed service worker paths
- ✅ Bumped cache version to v10
- ✅ Fixed target interval increment (15 → 5 minutes)
- ✅ Updated all documentation

---

## ⚙️ SETTINGS NOTE

**Target Interval now increments by 5 minutes** (was incorrectly 15 minutes)
- Click - to decrease by 5 min
- Click + to increase by 5 min
- Range: 15-480 minutes

---

## 🎉 SUCCESS INDICATORS

You'll know it worked when:
- ✅ Install button appeared and worked
- ✅ App opens WITHOUT browser UI (standalone mode)
- ✅ DevTools shows no errors in Application → Manifest
- ✅ Service worker shows "activated and running"
- ✅ App works offline
- ✅ Target interval increments by 5 (not 15)

---

## 📞 NEED MORE HELP?

1. Read [PWA-INSTALL-GUIDE.md](PWA-INSTALL-GUIDE.md) for detailed info
2. Read [UNINSTALL-OLD-PWA.md](UNINSTALL-OLD-PWA.md) for more cleanup methods
3. Check DevTools Console for specific errors
4. Try in Incognito/Private mode (guaranteed clean state)

---

**Remember: ALWAYS uninstall the old app FIRST before installing the new one!**
