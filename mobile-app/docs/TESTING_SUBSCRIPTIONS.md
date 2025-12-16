# 🧪 Testing RevenueCat Subscriptions - Complete Guide

## 🎯 Quick Testing Workflow

### **Method 1: In-App Reset Button (Fastest)**

This clears **local cache only** and fetches fresh data from RevenueCat server.

1. **Open the app** on device/simulator
2. **Navigate to:** Settings → Pro & Billing
3. **Click:** "🧹 Reset & Refresh (Testing)" button
4. **Result:**
   - Clears all local Pro state
   - Refreshes from RevenueCat server
   - Shows current entitlement status

**Use this when:**
- Testing if server data is correct
- Clearing cached entitlement data
- Verifying subscription status after purchase

**Doesn't reset:**
- ❌ Server-side entitlements (RevenueCat)
- ❌ Sandbox Apple subscriptions
- ❌ App Store purchase records

---

### **Method 2: Safari Console Reset (Developer)**

For quick testing in Safari Web Inspector:

1. **Run app:** `npx cap run ios`
2. **Open Safari:** Develop → [Device] → [App]
3. **In Console, run:**
   ```javascript
   resetProForTesting()
   ```
4. **Watch console logs** for status update

---

### **Method 3: Delete User from RevenueCat (Full Reset)**

This is the **cleanest way** to completely reset a user's subscription state.

#### Steps:

1. **Get App User ID:**
   - Run diagnostics in app, or
   - Check console: `[ProAccess] CustomerInfo: { originalAppUserId: '...' }`

2. **Delete in RevenueCat Dashboard:**
   - Go to: https://app.revenuecat.com
   - Navigate to: **Customers**
   - Search for: App User ID or sandbox email
   - Click customer → **"Delete Customer"**
   - Confirm deletion

3. **Delete & Reinstall App:**
   ```bash
   # Delete app from device
   # Then reinstall:
   npx cap run ios
   ```

4. **Test fresh purchase flow**

**Result:**
- ✅ All entitlements cleared
- ✅ Purchase history cleared
- ✅ Fresh customer created on next launch
- ✅ Can test purchase flow from scratch

---

### **Method 4: Use Different Sandbox Tester**

Create a fresh test account for clean state.

#### Create New Sandbox Tester:

1. **App Store Connect:**
   - https://appstoreconnect.apple.com
   - **Users and Access** → **Sandbox Testers**
   - Click **"+"**
   - Email: `test2@example.com` (must be unique)
   - Password: (strong password)
   - Region: Your testing region
   - Click **"Invite"**

2. **On Your Device:**
   - **Settings → App Store → Sandbox Account**
   - Sign out of current tester
   - Sign in with new tester email

3. **Launch app and test:**
   ```bash
   npx cap run ios
   ```

**Benefits:**
- ✅ Completely fresh purchase history
- ✅ No cached entitlements
- ✅ Can test multiple user scenarios in parallel

---

### **Method 5: Cancel Sandbox Subscription (Testing Expiration)**

Test subscription cancellation and expiration.

#### On iOS Device:

1. **Settings → App Store**
2. Tap your **Sandbox Account** email
3. Tap **"Manage"**
4. Find **"SmokeFree"** subscription
5. Tap **"Cancel Subscription"**

#### In RevenueCat Dashboard (Alternative):

1. Go to: **Customers** → Find user
2. Click **"Grant Promotional Entitlement"** (to test active state)
3. Or click **"Revoke"** (to test expired state)

**Note:** Sandbox subscriptions auto-renew **6 times max**, then expire.

---

## 📊 Testing Scenarios

### **Scenario 1: Test Fresh Purchase**

```bash
# 1. Reset local state
# In app: Click "Reset & Refresh" button
# OR in console: resetProForTesting()

# 2. Check initial state (should be Free)
# Console should show: Pro active: false

# 3. Make purchase
# Click "Upgrade" → Select plan → Complete purchase

# 4. Verify entitlement
# Console should show: ✅ Active entitlement found
```

---

### **Scenario 2: Test Restore Purchases**

```bash
# 1. Delete app from device

# 2. Reinstall
npx cap run ios

# 3. Navigate to Settings → Pro

# 4. Click "Restore Purchases"

# 5. Should show: "Pro access restored! 🎉"
# If user has active subscription
```

---

### **Scenario 3: Test Offline Behavior**

```bash
# 1. Launch app with internet
# Pro status: Loaded from server

# 2. Enable Airplane Mode

# 3. Restart app or reset cache
resetProForTesting()

# 4. Should see cached entitlement:
# [ProAccess] ⚠️ Using cached entitlement (offline protection)
```

---

### **Scenario 4: Test Null Entitlements (Configuration Issue)**

```bash
# 1. In RevenueCat Dashboard:
# - Temporarily detach products from entitlement
# - OR delete the entitlement

# 2. Reset local cache:
resetProForTesting()

# 3. Should see diagnostic warnings:
# ⚠️ No active entitlement found in customerInfo
# This may indicate:
#   1. User has not purchased Pro
#   2. Entitlement not configured in RevenueCat dashboard
#   3. Products not attached to entitlement

# 4. Fix configuration in dashboard

# 5. Reset again to verify fix
```

---

### **Scenario 5: Test Subscription Expiration**

```bash
# Sandbox subscriptions renew every few minutes (not months)
# They auto-renew 6 times, then expire

# 1. Purchase monthly subscription

# 2. Wait ~6-8 minutes (all renewals complete)

# 3. Reset cache to fetch fresh data:
resetProForTesting()

# 4. Should see: Pro active: false (expired)
```

---

## 🛠️ Developer Functions (Safari Console)

### Available Console Commands:

```javascript
// 1. Reset all local state and fetch fresh from server
resetProForTesting()

// 2. Show debug info
debugProAccess()

// 3. Run full diagnostics
ProAccess.runRevenueCatDiagnostics()

// 4. Show debug popup
showProDebugPopup()

// 5. Manually check status
await ProAccess.checkStatus()

// 6. Show upgrade modal
ProAccess.showUpgradeModal()

// 7. Restore purchases
await ProAccess.restore()
```

---

## 🔍 What to Check in Console Logs

### ✅ Successful Purchase Flow:

```
[ProAccess] Checking status (Source: Purchase/Restore Result)...
[ProAccess] CustomerInfo: { hasActiveEntitlements: true, activeEntitlementKeys: ['LotriFlow Quit Pro'] }
[ProAccess] ✅ Active entitlement found: {
  identifier: 'LotriFlow Quit Pro',
  productIdentifier: 'com.lotriflow.quitcoach.pro.lifetime',
  periodType: 'non_renewing',
  expirationDate: null
}
[ProAccess] ✅ Status updated - Pro active: true | Trial: false
```

### ⚠️ Configuration Issue (Null Entitlements):

```
[ProAccess] CustomerInfo: { hasActiveEntitlements: false, activeEntitlementKeys: [] }
[ProAccess] ⚠️ No active entitlement found in customerInfo
[ProAccess] This may indicate:
  1. User has not purchased Pro
  2. Entitlement not configured in RevenueCat dashboard
  3. Products not attached to entitlement
[ProAccess] Debug - Active subscriptions: ['com.lotriflow.quitcoach.subscription.monthly']
```
**Action:** Check RevenueCat dashboard configuration

### 🔄 Offline/Cached Data:

```
[ProAccess] ⚠️ Using cached entitlement (offline protection)
[ProAccess] ✅ Status updated - Pro active: true | Trial: false
```

---

## 📱 Sandbox Testing Best Practices

### 1. **Use Dedicated Sandbox Accounts**
- Create 2-3 sandbox testers
- Label them: `sandbox1@test.com` (lifetime), `sandbox2@test.com` (monthly)
- Keep track of which tester has which purchases

### 2. **Sandbox Subscription Behavior**
- **Monthly** → Renews every ~5 minutes
- **Yearly** → Renews every ~1 hour
- **Max renewals:** 6 times, then expires
- **Cancellation:** Takes effect immediately (not end of period)

### 3. **Always Check Console Logs**
- Open Safari Web Inspector for every test
- Watch for errors and warnings
- Verify entitlement data structure

### 4. **Reset Between Major Tests**
- Use "Reset & Refresh" button
- Or delete user from RevenueCat dashboard
- Keeps test data clean

### 5. **Test on Real Device**
- Simulator may not show purchase UI correctly
- Real device ensures accurate testing

---

## 🚨 Troubleshooting

### Issue: "No offerings available"
**Check:**
- RevenueCat dashboard → Offerings → "default" is marked as **Current**
- Packages are attached to the offering
- Products exist in App Store Connect

### Issue: "Purchase failed"
**Check:**
- Sandbox Apple ID is signed in (Settings → App Store)
- Not signed in with production Apple ID
- Banking/tax agreements approved in App Store Connect

### Issue: "No active entitlement found" but user purchased
**Check:**
- Entitlement exists in RevenueCat dashboard
- Products are attached to the entitlement
- Entitlement identifier matches code: `LotriFlow Quit Pro` or `pro`

### Issue: App shows Pro but shouldn't
**Actions:**
1. Click "Reset & Refresh" button
2. Delete user from RevenueCat dashboard
3. Delete and reinstall app

---

## 🎬 Complete Test Cycle

### Full Testing Workflow (30 minutes):

```bash
# 1. Start fresh
# Delete user from RevenueCat dashboard
# Delete app from device
npx cap run ios

# 2. Verify Free state
# Check: Pro features are locked
resetProForTesting()  # Console should show: Pro active: false

# 3. Run diagnostics
# Click "Run Diagnostics" button
# Verify: Products loaded, offerings available

# 4. Test Monthly subscription
# Click "Upgrade" → Monthly → Complete purchase
# Verify: Pro features unlocked
# Console: ✅ Active entitlement found

# 5. Delete app and test Restore
# Delete app
npx cap run ios
# Click "Restore Purchases"
# Verify: Pro features unlocked again

# 6. Test Lifetime purchase (use different tester)
# Sign out sandbox account
# Sign in with sandbox2@test.com
# Click "Upgrade" → Lifetime → Complete purchase
# Verify: Pro active, plan shows "Lifetime"

# 7. Test offline
# Enable Airplane Mode
resetProForTesting()
# Verify: Still shows Pro (from cache)

# 8. Test configuration issue
# Remove products from entitlement in dashboard
resetProForTesting()
# Verify: Clear error message about configuration
# Re-attach products in dashboard
resetProForTesting()
# Verify: Pro status restored
```

---

## 📞 Need Help?

If you encounter issues:

1. **Check console logs** (Safari Web Inspector)
2. **Run diagnostics** (in-app button)
3. **Copy debug info** (in-app button)
4. **Check RevenueCat dashboard** for customer data
5. **Review:** `/docs/REVENUECAT_TROUBLESHOOTING_CHECKLIST.md`

---

## ✅ Before Production Release

- [ ] Remove "Reset & Refresh" button from UI
- [ ] Remove "Run Diagnostics" button from UI
- [ ] Set `console.log` to `console.debug` for Pro logs
- [ ] Test with production App Store Connect
- [ ] Verify entitlements work for real users
- [ ] Test restore purchases on fresh install

---

**Last Updated:** 2025-12-11
