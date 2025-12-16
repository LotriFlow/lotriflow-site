# How to Uninstall Old PWA Before Testing New Version

## Problem
If you already have BreatheFree installed as a PWA, you need to remove it completely before testing the new version. Old service workers and cached data can prevent the new PWA from installing properly.

## Step 1: Uninstall the PWA App

### Chrome/Edge Desktop:
1. Go to `chrome://apps` (or `edge://apps`)
2. Find "BreatheFree" app
3. Right-click → "Remove from Chrome/Edge"
4. Confirm deletion

**OR**

1. Click the three dots in the address bar when viewing the app
2. Select "Uninstall BreatheFree"

### Chrome Android:
1. Long-press the BreatheFree icon on home screen
2. Tap "Uninstall" or "Remove"
3. Confirm deletion

**OR**

1. Open Settings → Apps
2. Find "BreatheFree"
3. Tap "Uninstall"

### iOS Safari:
1. Long-press the BreatheFree icon
2. Tap "Remove App"
3. Tap "Delete App"

## Step 2: Clear Service Workers & Cache

### Chrome/Edge:
1. Open your old BreatheFree URL (or localhost:8080)
2. Press **F12** to open DevTools
3. Go to **Application** tab
4. Click **Service Workers** (left sidebar)
5. Click "Unregister" for all BreatheFree workers
6. Click **Clear storage** (left sidebar)
7. Check ALL boxes:
   - [x] Unregister service workers
   - [x] Application cache
   - [x] Cache storage
   - [x] IndexedDB
   - [x] Local storage
   - [x] Session storage
8. Click **"Clear site data"** button
9. Close and reopen browser

### Alternative Method:
```
1. Open browser
2. Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
3. Select "All time" as time range
4. Check:
   - [x] Cached images and files
   - [x] Cookies and site data
5. Click "Clear data"
```

## Step 3: Clear DNS/Network Cache

### Windows:
```bash
ipconfig /flushdns
```

### Mac/Linux:
```bash
sudo dscacheutil -flushcache
```

## Step 4: Test Fresh Installation

1. **Close ALL browser windows**
2. Open a new browser window
3. Go to `http://localhost:8080` (if testing locally)
4. **Press Ctrl+F5** (hard refresh) to bypass any cache
5. Open DevTools (F12) → Console
6. Look for these messages:
   ```
   [SW] Registered: /
   Setting up PWA...
   ```

## Step 5: Verify Clean State

### Check Service Workers:
1. DevTools → Application → Service Workers
2. Should show NO old workers
3. Should show new worker registering

### Check Manifest:
1. DevTools → Application → Manifest
2. Should show updated manifest with:
   - `start_url: /breathefree-timer.html`
   - `scope: /`
3. No errors should be shown

### Check Cache:
1. DevTools → Application → Cache Storage
2. Should show `breathefree-v10` (new version)
3. Delete any old cache versions (v1-v9)

## Step 6: Install New PWA

### Desktop:
1. Look for Install icon (⊕) in address bar
2. Click it and follow prompts
3. OR click three dots → "Install BreatheFree"

### Mobile:
1. Look for "Add to Home Screen" banner
2. OR tap Share → "Add to Home Screen"

## Troubleshooting

### Install button still not showing:

**Clear everything again:**
```javascript
// Paste this in DevTools Console:
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister());
});
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});
localStorage.clear();
sessionStorage.clear();
console.log('✓ Cleared all PWA data');
// Then reload page (Ctrl+F5)
```

### Old app keeps reappearing:

1. Check if it's installed as Chrome extension
2. Go to `chrome://extensions` and remove
3. Check if it's in Windows "Installed Apps" and uninstall

### Service worker won't unregister:

1. Close ALL browser tabs/windows
2. Reopen browser
3. Go to `chrome://serviceworker-internals/`
4. Find BreatheFree entries and click "Unregister"
5. Restart browser

### Cache won't clear:

1. Use Incognito/Private mode for testing
2. This ensures no old cache interferes
3. Install PWA from incognito window

## If You're Deploying to Same Domain

If your old PWA is deployed at the same URL you're deploying the new one:

1. Upload all the new files
2. Increment the cache version in `sw.js`:
   ```javascript
   const CACHE_NAME = 'breathefree-v11'; // Increase this
   ```
3. Users will get an "Update available" prompt
4. OR service worker will update automatically

## Testing After Cleanup

### Checklist:
- [ ] Old app uninstalled
- [ ] Service workers cleared
- [ ] Cache cleared
- [ ] Browser restarted
- [ ] Hard refresh performed (Ctrl+F5)
- [ ] DevTools shows no errors
- [ ] New service worker registered
- [ ] Install button appears

## Quick Clean Script

Save this as `clean-pwa.html` and open in browser:

```html
<!DOCTYPE html>
<html>
<head>
  <title>PWA Cleaner</title>
</head>
<body>
  <h1>Clean Old PWA Data</h1>
  <button onclick="cleanAll()">Clear Everything</button>
  <pre id="log"></pre>

  <script>
    async function cleanAll() {
      const log = document.getElementById('log');
      log.textContent = 'Cleaning...\n';

      // Unregister service workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        log.textContent += '✓ Unregistered service worker\n';
      }

      // Clear caches
      const cacheNames = await caches.keys();
      for (const name of cacheNames) {
        await caches.delete(name);
        log.textContent += `✓ Deleted cache: ${name}\n`;
      }

      // Clear storage
      localStorage.clear();
      sessionStorage.clear();
      log.textContent += '✓ Cleared local storage\n';
      log.textContent += '✓ Cleared session storage\n';

      log.textContent += '\n✅ All cleaned! Close this tab and reload your app.\n';
    }
  </script>
</body>
</html>
```

## Success!

Once cleaned, you should see:
- ✅ Install prompt appears
- ✅ No console errors
- ✅ App installs successfully
- ✅ Opens in standalone mode
- ✅ Works offline

Now your PWA should install properly!
