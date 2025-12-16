# 🎯 Pro Access Setup Guide - SmokeFree App

## ✅ What's Been Implemented

Your Pro Access system with **7-day free trial** using Apple's In-App Purchase (StoreKit 2) is now fully coded and ready to deploy!

### Files Modified:
- ✅ `ios/App/App/ProAccessPlugin/ProAccessPlugin.swift` - Full StoreKit 2 implementation
- ✅ `src/app.js` - JavaScript bridge and UI integration

---

## 📋 Steps to Complete Setup

### Step 1: App Store Connect Configuration (15 minutes)

1. **Go to App Store Connect**: https://appstoreconnect.apple.com
2. **Navigate to your app** → Features → In-App Purchases
3. **Click "+" to create new subscription**

#### Subscription Details:
```
Product Type: Auto-Renewable Subscription
Reference Name: SmokeFree Pro Monthly
Product ID: com.lotriflow.quitcoach.subscription.monthly
        ⬆️ IMPORTANT: This MUST match the productId in ProAccessPlugin.swift (line 9)

Subscription Group Name: SmokeFree Pro
```

4. **Set Pricing**:
   - Select regions (e.g., United States)
   - Price: $4.99/month (or your chosen price)

5. **Add Introductory Offer (7-DAY FREE TRIAL)**:
   - Type: Free
   - Duration: 7 days
   - Eligibility: New subscribers only

6. **Fill in localization**:
   - Display Name: "SmokeFree Pro"
   - Description: "Unlock all premium features including advanced analytics, unlimited history, and more."

7. **Upload screenshot** (optional but recommended)

8. **Save & Submit for Review**

---

### Step 2: Update Product ID (if needed)

If you chose a different Product ID than `com.lotriflow.quitcoach.subscription.monthly`:

**Edit:** `ios/App/App/ProAccessPlugin/ProAccessPlugin.swift` line 9:
```swift
private let productId = "YOUR_ACTUAL_PRODUCT_ID_HERE"
```

---

### Step 3: Test in Sandbox

Before going live, test with sandbox testers:

1. **App Store Connect** → Users and Access → Sandbox Testers
2. **Create test account** with unique email
3. **On your iPhone**:
   - Settings → App Store → Sandbox Account
   - Sign in with test account
4. **Run your app from Xcode**
5. **Test the purchase flow**:
   - Tap "Start 7-Day Free Trial"
   - Should show Apple's payment sheet
   - Confirm (sandbox = no real charge)
   - Check that Pro features unlock

---

### Step 4: Build & Deploy

```bash
# 1. Sync Capacitor
npx cap sync ios

# 2. Open in Xcode
npx cap open ios

# 3. In Xcode:
# - Select "Any iOS Device" target
# - Product → Archive
# - Upload to App Store Connect

# 4. Submit for Review
```

---

## 🎨 Adding UI Elements

### Example: Add Trial Button to Settings

**Add to `index.html` in Settings section:**

```html
<div class="setting-row" id="proAccessSection">
  <div class="setting-label">
    <span>✨ Pro Access</span>
    <span class="pro-badge" style="display: none;">PRO</span>
  </div>
  <button class="btn btn-primary" onclick="startProTrial()" id="trialButton">
    Start 7-Day Free Trial
  </button>
  <button class="btn btn-secondary" onclick="restorePurchases()" style="margin-top: 10px;">
    Restore Purchases
  </button>
</div>
```

### Example: Lock a Feature Behind Pro

**In JavaScript:**

```javascript
function someProFeature() {
  if (!ProAccess.hasAccess()) {
    showToast('This feature requires Pro access. Start your free trial!', 'info');
    // Optionally: showModal with Pro upgrade prompt
    return;
  }

  // Feature code here
  console.log('Pro feature unlocked!');
}
```

---

## 🔒 How Trial Works

1. **User taps "Start 7-Day Free Trial"**
2. **Apple shows payment sheet**
   - User authenticates with Face ID / password
   - **No charge for 7 days**
3. **Trial starts immediately**
   - `ProAccess.isProActive = true`
   - `ProAccess.isInTrial = true`
   - `ProAccess.trialDaysRemaining = 7`
4. **After 7 days:**
   - Auto-converts to paid subscription ($4.99/month)
   - User can cancel anytime in Settings → Subscriptions
5. **If user cancels:**
   - Pro features lock after trial ends
   - Can re-subscribe anytime

---

## 🛡️ Security Features

✅ **Receipt validation** - Apple's servers verify all purchases
✅ **Transaction signing** - Cryptographically signed receipts
✅ **Offline support** - StoreKit caches entitlements
✅ **Unhackable** - No local overrides possible
✅ **Restore purchases** - Works across devices

---

## 📊 Checking Status

**In JavaScript (anywhere):**

```javascript
// Check if user has Pro access (trial OR paid)
if (ProAccess.hasAccess()) {
  console.log('User has Pro!');
}

// Check specific status
if (ProAccess.isInTrial) {
  console.log(`In trial with ${ProAccess.trialDaysRemaining} days left`);
}

// Manually refresh status
await ProAccess.checkStatus();
```

---

## 🐛 Testing Checklist

- [ ] Product ID matches in Swift and App Store Connect
- [ ] Sandbox tester can start trial
- [ ] Pro features unlock during trial
- [ ] Trial banner shows correct days remaining
- [ ] Restore purchases works
- [ ] After 7 days (in sandbox), auto-converts to paid
- [ ] Cancel subscription locks features

---

## 💰 Pricing Strategy

Recommended pricing tiers:

| Plan | Price | Description |
|------|-------|-------------|
| **Monthly** | $4.99/mo | 7-day free trial |
| **Yearly** | $39.99/yr | Save 33% (optional) |

---

## 📱 App Store Review Notes

When submitting, add this to "App Review Information":

```
This app includes an auto-renewable subscription:
- SmokeFree Pro: $4.99/month with 7-day free trial
- Trial converts to paid after 7 days unless cancelled
- Users can manage subscriptions in Settings → Subscriptions

No test account needed - IAP uses sandbox during review.
```

---

## 🎉 You're Ready!

Everything is coded and ready. Just need to:
1. ✅ Create subscription in App Store Connect
2. ✅ Test in sandbox
3. ✅ Submit for review

Questions? Check the code comments or Apple's docs:
https://developer.apple.com/documentation/storekit

---

**Good luck with your launch! 🚀**
