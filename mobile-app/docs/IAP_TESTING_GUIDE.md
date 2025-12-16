# 🧪 IAP Testing Guide - SmokeFree Pro

## Quick Setup Checklist

### ✅ What's Already Done
- [x] ProAccessPlugin Swift implementation
- [x] JavaScript bridge in app.js
- [x] Objective-C bridge file (.m)
- [x] Subscription created in App Store Connect
- [x] Product ID: `com.lotriflow.quitcoach.subscription.monthly`
- [x] 7-day free trial configured

---

## 🏗️ Build & Run Steps

### 1. In Xcode (Already Open)

**Add the Plugin to Xcode:**
1. In Xcode's Project Navigator (left sidebar), find the `ProAccessPlugin` folder
2. Verify both files are present:
   - ✅ `ProAccessPlugin.swift` (blue icon)
   - ✅ `ProAccessPlugin.m` (blue icon)
3. If they show as grey/missing, right-click the folder → Add Files to "App"

**Build Configuration:**
1. Select target: **App** (top left dropdown)
2. Select device: **Any iOS Device** or your connected iPhone
3. Product → Build (⌘B)
4. Fix any build errors if they appear

### 2. Create Sandbox Tester (5 minutes)

**In App Store Connect:**
1. Go to: https://appstoreconnect.apple.com
2. Navigate to: **Users and Access** → **Sandbox**
3. Click **[+]** to add tester
4. Fill in:
   ```
   First Name: Test
   Last Name: User
   Email: smokefree.test@icloud.com (must be unique, not used anywhere)
   Password: TestPass123! (or create your own)
   Country: United States
   ```
5. Save the tester

**Important Notes:**
- ⚠️ Email MUST NOT be a real Apple ID
- ⚠️ Use a fake email like `yourapp.test@example.com`
- ⚠️ Don't use your personal Apple ID for testing

### 3. Configure iPhone for Sandbox Testing

**On Your Test iPhone:**
1. Settings → App Store
2. Scroll to bottom: **Sandbox Account**
3. Tap **Sign In**
4. Enter your sandbox tester credentials:
   - Email: `smokefree.test@icloud.com`
   - Password: `TestPass123!`

**Verification:**
- You should see "Sandbox Account: smokefree.test@icloud.com"
- Leave this signed in throughout testing

---

## 🧪 Testing the Purchase Flow

### Test 1: Start Free Trial

1. **Launch app from Xcode** (not TestFlight)
   - Product → Run (⌘R)
   - App should install and launch on your device

2. **Open Developer Console**
   - In Xcode: View → Debug Area → Show Debug Area
   - Watch for `[ProAccess]` log messages

3. **Trigger Purchase** (need to add UI button)
   - For now, test via JavaScript console
   - Or add a test button to your HTML

4. **Expected Flow:**
   ```
   Tap "Start 7-Day Free Trial"
   → Apple payment sheet appears
   → Shows "7 Days Free, Then $4.99/month"
   → Authenticate with Face ID / Password
   → "You're All Set" confirmation
   → Pro features unlock immediately
   ```

5. **Verify in Console:**
   ```
   [ProAccess] Status changed: isProActive=true
   [ProAccess] Trial status: isInTrial=true, daysRemaining=7
   ```

### Test 2: Check Pro Status

**In JavaScript Console (Safari Web Inspector):**
```javascript
// Check current status
await ProAccess.checkStatus();
console.log('Pro Active:', ProAccess.isProActive);
console.log('In Trial:', ProAccess.isInTrial);
console.log('Days Remaining:', ProAccess.trialDaysRemaining);
```

### Test 3: Restore Purchases

1. **Delete app from device**
2. **Reinstall from Xcode**
3. **Tap "Restore Purchases"**
4. **Expected:** Pro status restores instantly

### Test 4: Cancel Subscription

1. **On iPhone:** Settings → Your Name → Subscriptions
2. **Find:** SmokeFree Pro [SANDBOX]
3. **Tap:** Cancel Subscription
4. **Restart app**
5. **Expected:** Pro still active until trial expires

### Test 5: Time Travel (Sandbox Only!)

**To test trial expiration without waiting 7 days:**

1. **On iPhone:** Settings → General → Date & Time
2. **Disable:** Set Automatically
3. **Set date:** 8 days in the future
4. **Restart app**
5. **Expected:** Trial expired, Pro locked
6. **Re-enable:** Set Automatically

---

## 🐛 Common Issues & Fixes

### Issue: "Product not found"
**Cause:** Product ID mismatch or not approved
**Fix:**
1. Verify Product ID in Swift: `com.lotriflow.quitcoach.subscription.monthly`
2. Check App Store Connect: Subscription status = "Ready to Submit" or "Approved"
3. Wait 15 minutes after creating subscription (sync delay)

### Issue: "Cannot connect to App Store"
**Cause:** Not signed in to sandbox account
**Fix:** Settings → App Store → Sandbox Account → Sign in

### Issue: Payment sheet doesn't show trial
**Cause:** Introductory offer not configured
**Fix:** App Store Connect → Subscription → Introductory Offers → Add 7-day free trial

### Issue: "This is not a test account"
**Cause:** Using real Apple ID instead of sandbox tester
**Fix:** Create new sandbox tester with unique email

### Issue: Build errors in Xcode
**Cause:** Plugin not added to project
**Fix:**
1. Right-click `App` target → Add Files
2. Select `ProAccessPlugin` folder
3. Check "Copy items if needed"
4. Rebuild

---

## 📊 Testing Checklist

Before submitting to App Review, verify:

- [ ] Purchase starts trial successfully
- [ ] Payment sheet shows "7 Days Free, Then $4.99/month"
- [ ] Pro features unlock immediately after purchase
- [ ] Trial days remaining shows correct count
- [ ] Restore purchases works on new device/install
- [ ] Cancel subscription works
- [ ] Trial expiration locks Pro features
- [ ] Re-subscribe after cancellation works
- [ ] No crashes during purchase flow
- [ ] Console shows no errors

---

## 🚀 Next Steps After Testing

Once all tests pass:

1. **Product → Archive** in Xcode
2. **Upload to App Store Connect**
3. **Submit for Review** with notes:
   ```
   This app includes an auto-renewable subscription:
   - SmokeFree Pro: $4.99/month with 7-day free trial
   - Trial converts to paid after 7 days unless cancelled
   - Users manage subscriptions in Settings → Subscriptions

   Test account not needed - sandbox available during review.
   ```

---

## 📱 Adding UI for Testing

**Quick test button (add to index.html):**

```html
<!-- Add to Settings section for testing -->
<div class="setting-row">
  <button class="btn btn-primary" onclick="testProPurchase()" style="width: 100%;">
    🧪 Test Pro Purchase
  </button>
</div>
```

**Add to app.js:**

```javascript
async function testProPurchase() {
  console.log('[TEST] Starting Pro purchase...');
  await ProAccess.startTrial();
}
```

---

## 📞 Support

- **Apple Documentation:** https://developer.apple.com/documentation/storekit
- **Sandbox Testing:** https://developer.apple.com/documentation/storekit/in-app_purchase/testing_in-app_purchases_with_sandbox
- **Issue Tracker:** File issues in your repo

---

**Happy Testing! 🎉**
