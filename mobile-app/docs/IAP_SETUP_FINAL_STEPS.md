# IAP Setup - Final Steps (When App Store Connect is Working)

**Status:** Blocked by App Store Connect outage recovery (Dec 10, 2025)

**What's working:**
- ✅ Products created in App Store Connect
- ✅ Products added to RevenueCat
- ✅ Entitlements configured
- ✅ Offerings configured with 2 packages
- ✅ Code updated and tested
- ✅ Banking & Tax approved
- ✅ Diagnostic tool shows exact error

**What's blocking:**
- ❌ Missing App Store Connect API Key in RevenueCat
- ❌ Missing In-App Purchase Key in RevenueCat
- ❌ App Store Connect Users & Access section unstable (recovering from outage)

---

## When to try again:

**Wait 3-4 hours or try tomorrow morning (Dec 11, 2025)**

App Store Connect had a 16-hour outage on Dec 9, 2025. The service is recovering but the Users & Access section keeps closing/crashing.

---

## Steps to Complete (5 minutes when site works):

### Step 1: Generate App Store Connect API Key

1. Go to: https://appstoreconnect.apple.com/access/integrations/api
2. Click **"+"** or **"Generate API Key"**
3. Settings:
   - **Name:** `RevenueCat Integration`
   - **Access:** `Admin` (required for RevenueCat)
4. Click **"Generate"**
5. **IMMEDIATELY Download the .p8 file** (you can ONLY do this ONCE!)
   - File will be named: `AuthKey_XXXXXXXXXX.p8`
   - Save to: `/Users/christolotriet/smokefree/keys/` (create folder if needed)
6. **Copy these values** (you'll need them):
   - **Issuer ID:** (at top of page, format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
   - **Key ID:** (next to your key, format: `ABCD123456`)

---

### Step 2: Generate In-App Purchase Key

1. Go to: https://appstoreconnect.apple.com/access/api
2. Click on **"In-App Purchase"** in left sidebar
3. Click **"Generate In-App Purchase Key"**
4. **Name:** `RevenueCat Notifications`
5. Click **"Generate"**
6. **IMMEDIATELY Download the .p8 file** (you can ONLY do this ONCE!)
   - Save to: `/Users/christolotriet/smokefree/keys/`
7. **Copy the Key ID**

---

### Step 3: Upload to RevenueCat

1. Go to: https://app.revenuecat.com
2. Navigate to: **Apps & providers → LotriFlow Quit Pro**
3. Scroll to **"App Store Connect API"** section
4. Fill in:
   - **Issuer ID:** (paste from Step 1)
   - **Key ID:** (paste from Step 1)
   - **P8 key file:** Drag and drop the AuthKey_*.p8 file from Step 1
5. Scroll to **"In-App Purchase Key"** section (if exists)
   - Upload the .p8 file from Step 2
6. Click **"Save changes"**

---

### Step 4: Wait for Sync

After uploading:
- RevenueCat will sync with App Store Connect
- **Wait 2-5 minutes**
- Refresh the RevenueCat Products page
- The **"Could not check"** warnings should disappear
- Products should show prices and details

---

### Step 5: Test Purchases!

1. On your device, open the app
2. Go to **Settings → Pro & Billing**
3. Click **"🔍 Run Diagnostics"**
4. You should see:
   - ✅ SDK initialized
   - ✅ Customer Info fetched
   - ✅ Offerings: 1
   - ✅ Current offering: default
   - ✅ Packages: 2
   - 📦 Lifetime package found
   - 📦 Monthly package found

5. If diagnostic passes, **try a purchase!**
6. The payment sheet should appear
7. Use your **Sandbox Apple ID** to test

---

## Troubleshooting

### If "Could not check" still shows after uploading keys:
- Wait another 5-10 minutes for sync
- Check RevenueCat logs for errors
- Verify Issuer ID and Key ID are correct
- Make sure you uploaded the correct .p8 file

### If diagnostic still fails:
- Check that offerings are marked as "Current" (⭐)
- Verify packages are attached to offering
- Check product IDs match exactly:
  - `com.lotriflow.quitcoach.pro.lifetime`
  - `com.lotriflow.quitcoach.subscription.monthly`

### If purchases still fail:
- Verify StoreKit Configuration is set to "None" in Xcode
- Make sure you're signed in with Sandbox Apple ID
- Check banking/tax are still "Active" in App Store Connect

---

## Expected Timeline

Once App Store Connect is stable:
- **Step 1-2 (Generate keys):** 3 minutes
- **Step 3 (Upload to RevenueCat):** 1 minute
- **Step 4 (Wait for sync):** 2-5 minutes
- **Step 5 (Test):** 2 minutes

**Total: ~10 minutes from start to working purchases!**

---

## Files Created/Modified This Session

- ✅ `/Users/christolotriet/smokefree/src/app.js` - Added diagnostic function
- ✅ `/Users/christolotriet/smokefree/index.html` - Added diagnostic button
- ✅ `/Users/christolotriet/smokefree/REVENUECAT_TROUBLESHOOTING_CHECKLIST.md` - Complete troubleshooting guide
- ✅ `/Users/christolotriet/smokefree/IAP_SETUP_FINAL_STEPS.md` - This file

---

## Remember

⚠️ **The .p8 files can only be downloaded ONCE!**
- If you lose them, you'll need to revoke and create new keys
- Save them somewhere safe after downloading

⚠️ **Both keys are required:**
- App Store Connect API Key - for product sync
- In-App Purchase Key - for server notifications

---

## Current Status: WAITING FOR APPLE

Everything is ready on your end. Just waiting for App Store Connect to fully recover from yesterday's outage.

Check back in a few hours or tomorrow morning!
