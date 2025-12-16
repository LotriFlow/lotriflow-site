# 📱 How to View Logs from Physical iPhone

## Safari Web Inspector for Physical Devices

When running on a physical iPhone connected via cable, you can view all console logs in Safari on your Mac.

---

## 🔧 Setup (One-Time)

### Step 1: Enable Web Inspector on iPhone

1. On your **iPhone**, go to:
   - **Settings** → **Safari** → **Advanced**
   - Toggle **ON**: **Web Inspector**

### Step 2: Enable Developer Menu on Mac

1. On your **Mac**, open **Safari**
2. Go to: **Safari** → **Settings** (or Preferences)
3. Click **Advanced** tab
4. Check: **"Show features for web developers"**
   - Or on older macOS: **"Show Develop menu in menu bar"**

---

## 📺 View Logs in Real-Time

### Step 1: Connect iPhone via Cable

- Connect your iPhone to Mac with USB cable
- Unlock your iPhone
- If prompted, tap **"Trust This Computer"** on iPhone

### Step 2: Open Safari Developer Menu

1. On your **Mac**, open **Safari**
2. In the menu bar, click **Develop**
3. You should see your iPhone listed:
   ```
   Develop
   ├── Christo's iPhone
   │   ├── SmokeFree (or your app name)
   │   └── ...
   ```

### Step 3: Connect to Your App

1. Click: **Develop** → **Christo's iPhone** → **SmokeFree**
   - (The exact name might vary, look for your app)
2. A **Web Inspector** window will open
3. Click the **Console** tab at the top

### Step 4: Use the App and Watch Logs

Now as you use the app on your iPhone:
- All console logs appear in real-time
- All errors appear
- All debug messages appear

---

## 🎯 What You'll See

### When App Loads:
```javascript
[ProAccess] Initializing...
[ProAccess] RevenueCat configured
[ProAccess] Products loaded: [...]
```

### When You Navigate to Pro Settings:
```javascript
[ProAccess] Checking status (Source: Fresh Fetch)...
[ProAccess] CustomerInfo: { hasEntitlements: true, ... }
```

### When You Try to Purchase:
```javascript
[ProAccess] 🛒 Starting Lifetime purchase flow...
[ProAccess] Step 1: Fetching offerings...
[ProAccess] ✅ Offerings received: {...}
[ProAccess] Step 2: Finding lifetime package...
[ProAccess] Available packages: [...]
[ProAccess] ✅ Lifetime package found: {...}
[ProAccess] Step 3: Initiating purchase...
```

### After Purchase (Success):
```javascript
[ProAccess] Step 4: Purchase result received: {...}
[ProAccess] ✅ Purchase successful! Processing customerInfo...
[ProAccess] 📋 RECEIPT DEBUG - All Purchased Product IDs: [...]
[ProAccess] 📋 RECEIPT DEBUG - Active Entitlements: [...]
```

### After Purchase (Product Missing Error):
```javascript
[ProAccess] 📋 RECEIPT DEBUG - All Purchased Product IDs:
  ["com.lotriflow.quitcoach.pro.lifetime"]  // ✅ Product IS here

[ProAccess] 📋 RECEIPT DEBUG - Active Entitlements: []  // ❌ NO entitlements

[ProAccess] 🚨 CRITICAL: Product in receipt but NO ENTITLEMENT!
[ProAccess]   GO TO: RevenueCat dashboard → Entitlements → "LotriFlow Quit Pro"
[ProAccess]   VERIFY: Product "com.lotriflow.quitcoach.pro.lifetime" is attached
```

---

## 🛠️ Troubleshooting

### Issue: iPhone not showing in Develop menu

**Fix:**
1. Make sure iPhone is unlocked
2. Make sure you tapped "Trust This Computer" on iPhone
3. Disconnect and reconnect USB cable
4. Close and reopen Safari on Mac
5. Check Settings → Safari → Advanced → Web Inspector is ON on iPhone

### Issue: App not listed under iPhone in Develop menu

**Fix:**
1. Make sure the app is running on your iPhone
2. Make sure you're in the app (not on home screen)
3. If using Xcode, make sure app is in foreground
4. Try navigating to a different screen in the app, then back
5. Check that Web Inspector is enabled on iPhone

### Issue: Console is empty

**Fix:**
1. Click the **Console** tab in Web Inspector
2. Clear console: Click the trash icon or press ⌘K
3. Do an action in the app (navigate, click button)
4. Logs should appear

### Issue: "Develop" menu not showing

**Fix:**
1. Safari → Settings → Advanced
2. Check: "Show features for web developers"
3. Restart Safari

---

## 📋 Step-by-Step Testing Flow

### Complete Testing Session:

```bash
# 1. Setup (one-time)
iPhone: Settings → Safari → Advanced → Web Inspector ON
Mac: Safari → Settings → Advanced → Show Develop menu ON

# 2. Connect
Connect iPhone to Mac via USB cable
Unlock iPhone
Trust computer if prompted

# 3. Run app
# (App should already be running from earlier)
# If not:
npx cap run ios
# Select your physical iPhone

# 4. Open Web Inspector
Mac Safari: Develop → Christo's iPhone → SmokeFree
Click: Console tab
Clear console: ⌘K

# 5. Test in app
On iPhone:
- Navigate to Settings → Pro & Billing
- Watch Mac Safari console for logs

# 6. Try Purchase
On iPhone:
- Click "Upgrade"
- Select "Lifetime"
- Complete purchase

# 7. Watch Console on Mac
Should see detailed step-by-step logs
All receipt debug info will appear

# 8. Copy Logs
In Safari Web Inspector:
- Right-click in console
- Select "Copy All Messages"
- Or manually select and copy
```

---

## 🎥 Quick Visual Guide

```
┌─────────────────────────────────────┐
│  iPhone (Physical Device)           │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │    SmokeFree App            │   │
│  │    Running...               │   │
│  │                             │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
         │
         │ USB Cable
         ↓
┌─────────────────────────────────────┐
│  Mac                                │
│  ┌─────────────────────────────┐   │
│  │  Safari → Develop           │   │
│  │    → Christo's iPhone       │   │
│  │      → SmokeFree            │   │
│  │                             │   │
│  │  ┌─────────────────────┐   │   │
│  │  │ Web Inspector       │   │   │
│  │  │ Console Tab         │   │   │
│  │  │                     │   │   │
│  │  │ [ProAccess] logs... │   │   │
│  │  │ [ProAccess] logs... │   │   │
│  │  └─────────────────────┘   │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## 🚀 You're Ready!

Now you can:
1. ✅ See all console logs in real-time
2. ✅ Watch purchase flow step-by-step
3. ✅ See receipt debug information
4. ✅ Identify exactly where the issue is

### What to Do Now:

1. **Enable Web Inspector** on iPhone (if not done)
2. **Open Safari** on Mac
3. **Click:** Develop → Christo's iPhone → SmokeFree
4. **Navigate** to Pro settings in app
5. **Try** purchasing or restoring
6. **Watch** the console for detailed logs
7. **Copy** the logs and share them

---

## 📊 What We're Looking For

When you attempt purchase, I need to see:

```javascript
// 1. Is product found in offering?
[ProAccess] ✅ Lifetime package found: { ... }

// 2. Did purchase complete?
[ProAccess] Step 4: Purchase result received: { ... }

// 3. What's in the receipt?
[ProAccess] 📋 RECEIPT DEBUG - All Purchased Product IDs: [...]

// 4. Are entitlements granted?
[ProAccess] 📋 RECEIPT DEBUG - Active Entitlements: [...]

// 5. Any error messages?
[ProAccess] 🚨 CRITICAL: Product in receipt but NO ENTITLEMENT!
```

Copy ALL of these logs and paste them back to me!

---

**Last Updated:** 2025-12-11
