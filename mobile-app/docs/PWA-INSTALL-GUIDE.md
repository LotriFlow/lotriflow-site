# PWA Installation Guide - BreatheFree

## What Was Fixed

Your PWA wasn't installing because of several issues:

1. **Invalid manifest.json** - Used relative paths (`.`) instead of absolute paths (`/`)
2. **Service worker scope** - Incorrect scope configuration
3. **Cache paths** - Service worker was caching with wrong path format

## Changes Made

### 1. manifest.json
- ✅ Changed `start_url` from `.` to `/breathefree-timer.html`
- ✅ Changed `scope` from `.` to `/`
- ✅ Updated icon paths to absolute (`/icon-192x192.png`)
- ✅ Added `purpose: "any maskable"` for better compatibility
- ✅ Added `orientation` and `categories` for better PWA support

### 2. Service Worker (sw.js)
- ✅ Updated cache version to `v10`
- ✅ Changed all relative paths to absolute paths
- ✅ Fixed offline fallback path

### 3. Service Worker Registration (src/timer.js)
- ✅ Changed registration from `./sw.js` to `/sw.js`
- ✅ Changed scope from `./` to `/`

## How to Test Locally

### Option 1: Python HTTP Server (Recommended)
```bash
# In the BreatheFree directory
python -m http.server 8080
```

Then open: `http://localhost:8080/breathefree-timer.html`

### Option 2: Custom Server (Better for PWA)
```bash
python server.py
```

Then open: `http://localhost:8080`

## Testing PWA Installation

### Chrome/Edge Desktop:
1. Open `http://localhost:8080` in Chrome or Edge
2. Open DevTools (F12)
3. Go to **Application** tab → **Manifest**
4. Check for errors (should show no errors)
5. Look for **Install** icon in address bar (⊕ or download icon)
6. Click it to install

### Chrome Android:
1. Open the URL on your phone
2. Look for "Add to Home Screen" banner
3. Or tap Menu (⋮) → "Install app" or "Add to Home Screen"

### iOS Safari:
1. Open the URL in Safari
2. Tap the Share button (box with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

## Debugging PWA Issues

### Check Service Worker Status:
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Service Workers** in left sidebar
4. Should show "activated and running"

### Check Manifest:
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Manifest** in left sidebar
4. Check for errors or warnings

### Console Messages:
Look for these messages in Console:
```
[SW] Registered: /
PWA check: { https: true, serviceWorker: true, manifest: true }
```

## Deployment Checklist

Before deploying to production:

- [ ] **HTTPS Required** - PWA only works on HTTPS (or localhost)
- [ ] Upload all files to your web host
- [ ] Verify manifest.json is accessible at `https://yourdomain.com/manifest.json`
- [ ] Verify sw.js is accessible at `https://yourdomain.com/sw.js`
- [ ] Test in Chrome DevTools → Application → Manifest
- [ ] Test installation on mobile device
- [ ] Verify icons are showing (192x192 and 512x512)

## Common Issues

### "Add to Home Screen" not showing:
- ✅ Must be served over HTTPS (localhost is exempt)
- ✅ Must have valid manifest.json
- ✅ Must have registered service worker
- ✅ Must have at least one icon (192x192 or larger)
- ✅ User must visit the site at least twice (with 5 minutes between visits) on Chrome Android

### Service Worker not registering:
- Check Console for errors
- Verify `sw.js` is in root directory
- Clear browser cache and reload
- Check that scope is correct

### Icons not showing:
- Verify icon files exist: `icon-192x192.png` and `icon-512x512.png`
- Check file paths are absolute in manifest.json
- Icons must be PNG format
- Recommended sizes: 192x192, 512x512

## File Structure

Your PWA files should be organized like this:
```
BreatheFree/
├── index.html
├── breathefree-timer.html
├── manifest.json          ← PWA manifest
├── sw.js                  ← Service worker
├── icon-192x192.png       ← App icon
├── icon-512x512.png       ← App icon
└── src/
    └── timer.js           ← Main app logic
```

## Next Steps

1. **Test locally** using the HTTP server
2. **Fix any console errors** you see
3. **Test on mobile** if possible
4. **Deploy to HTTPS server** (GitHub Pages, Netlify, Vercel, etc.)
5. **Test production PWA installation**

## Deployment Options

### Free HTTPS Hosting:
- **GitHub Pages**: Free, automatic HTTPS
- **Netlify**: Free, drag-and-drop deployment
- **Vercel**: Free, automatic deployment
- **Firebase Hosting**: Free tier available

### Quick Deploy to GitHub Pages:
```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo, then:
git remote add origin https://github.com/yourusername/breathefree.git
git branch -M main
git push -u origin main

# Enable GitHub Pages in repo settings
# Site will be at: https://yourusername.github.io/breathefree/
```

## Need Help?

If the PWA still doesn't install:
1. Check browser console for errors
2. Verify all files are accessible
3. Test manifest.json with: https://manifest-validator.appspot.com/
4. Clear browser cache and service workers
5. Try in incognito/private mode

## Success Indicators

✅ Install button appears in address bar
✅ No errors in Application → Manifest
✅ Service worker shows "activated and running"
✅ App installs and opens in standalone mode
✅ App works offline after installation
