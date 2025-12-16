# Pro & Billing Flow Documentation

**App:** LotriFlow Quit Pro
**Bundle ID:** `com.lotriflow.quitcoach`
**Last Updated:** December 12, 2025
**Status:** ✅ Production-Ready - Lifetime Only

---

## Table of Contents
1. [Overview](#overview)
2. [Products & Pricing](#products--pricing)
3. [Technical Architecture](#technical-architecture)
4. [User Flow](#user-flow)
5. [Code Implementation](#code-implementation)
6. [App Startup Validation](#app-startup-validation)
7. [UI States & Cards](#ui-states--cards)
8. [Testing & Troubleshooting](#testing--troubleshooting)
9. [Production Checklist](#production-checklist)

---

## Overview

The app uses **RevenueCat** as the IAP management layer on top of Apple's StoreKit. This provides:
- Server-side receipt validation
- Cross-platform purchase syncing
- Simplified entitlement management
- Analytics and webhooks
- Offline caching

### Why RevenueCat?
- ✅ Automatic receipt validation with Apple
- ✅ Restores purchases across devices
- ✅ Works offline (validates on next connection)
- ✅ One source of truth for entitlements
- ✅ No fallback modes - RevenueCat is the sole authority

---

## Products & Pricing

### Product 1: Lifetime Access
- **Product ID:** `com.lotriflow.quitcoach.pro.lifetime`
- **Type:** Non-Consumable
- **Price:** $2.99 USD
- **RevenueCat Package:** `$rc_lifetime`
- **Entitlement:** `LotriFlow Quit Pro`
- **Display:** "Lifetime Member" card with purple trophy icon
- **Features:** Permanent access to all Pro features

**Note:** Trial and monthly subscription options have been removed. The app now offers a single, simple Lifetime purchase option.

---

## Technical Architecture

### RevenueCat Configuration

#### API Keys
1. **App Store Connect API Key**
   - Key ID: `9SH9PSVZ4Y`
   - File: `AuthKey_9SH9PSVZ4Y.p8`
   - Access: Admin
   - Purpose: Syncs product metadata from App Store Connect

2. **In-App Purchase Key**
   - Key ID: `YRB4U34JFC`
   - File: `SubscriptionKey_YRB4U34JFC.p8`
   - Purpose: Server-to-server notifications for purchases

3. **Issuer ID**
   - `1d8bfdbb-7667-4e09-a85a-70d7785c7981`

#### SDK Configuration
- **SDK:** RevenueCat Capacitor Plugin (`@revenuecat/purchases-capacitor`)
- **API Key:** `appl_vGjWBqONTEBtXnasyzvZARaIyaY`
- **Offering ID:** `default` (current offering)
- **Entitlement Name:** `LotriFlow Quit Pro`

### File Structure

```
src/payments.js
  └── ProAccess object
      ├── init() - Initializes RevenueCat SDK
      ├── checkStatus() - Validates purchases with Apple
      ├── loadProducts() - Fetches available packages
      ├── purchaseLifetime() - Handles lifetime purchase
      ├── restore() - Restores previous purchases
      ├── updateUI() - Shows appropriate UI cards
      └── runRevenueCatDiagnostics() - Debug tool (console only)

index.html
  ├── proInactiveCard - Free user state
  └── proLifetimeCard - Lifetime member state
```

---

## User Flow

### 1. New User (No Purchase)

```
App Launch
   ↓
RevenueCat SDK initializes
   ↓
checkStatus() → No active entitlements
   ↓
Shows: "Unlock Pro Features" card (proInactiveCard)
   ↓
User clicks: "Upgrade to Pro"
   ↓
Shows: Upgrade modal with Lifetime option
```

### 2. Lifetime Purchase

```
User clicks: "Lifetime - $2.99"
   ↓
purchaseLifetime() called
   ↓
Fetches offerings from RevenueCat
   ↓
Finds $rc_lifetime package
   ↓
Shows: Apple's native payment sheet
   ↓
User confirms with Face ID/Touch ID
   ↓
Apple processes $2.99 payment
   ↓
RevenueCat receives purchase webhook
   ↓
Returns customerInfo with entitlement
   ↓
checkStatus() detects:
  - isProActive = true
  - planLabel = "Lifetime"
   ↓
updateUI() shows: "Lifetime Member" card (proLifetimeCard)
   ↓
Pro features unlocked permanently
```

### 3. Restore Purchases

```
User clicks: "Restore Purchases"
   ↓
restore() called
   ↓
RevenueCat.restorePurchases()
   ↓
RevenueCat validates receipt with Apple
   ↓
Returns customerInfo with active entitlements
   ↓
checkStatus() updates pro status
   ↓
updateUI() shows Lifetime card
   ↓
Pro features unlocked
```

---

## Code Implementation

### Initialization (App Startup)

**Location:** `src/payments.js`

```javascript
async init() {
  const REVENUECAT_API_KEY = 'appl_vGjWBqONTEBtXnasyzvZARaIyaY';

  // Check if RevenueCat is available
  if (!this.storeKit) {
    console.error('[ProAccess] ❌ RevenueCat not available');
    this.isProActive = false;
    return;
  }

  // Initialize RevenueCat SDK
  await this.storeKit.configure({
    apiKey: REVENUECAT_API_KEY,
    appUserID: null  // Anonymous user
  });

  // Load available products
  await this.loadProducts();

  // Check purchase status with Apple
  await this.checkStatus();

  // Update UI based on status
  this.updateUI();
}
```

### Purchase Validation

```javascript
async checkStatus() {
  // Get customer info from RevenueCat (validates with Apple)
  const customerInfo = await this.storeKit.getCustomerInfo();

  // Check for active Pro entitlement
  const proEntitlement = customerInfo.entitlements.active['LotriFlow Quit Pro'];

  if (proEntitlement) {
    this.isProActive = true;
    this.setPlanLabel('Lifetime');
  } else {
    this.isProActive = false;
  }

  this.updateUI();
}
```

### Purchase Flow

```javascript
async purchaseLifetime() {
  // 1. Fetch offerings from RevenueCat
  const offerings = await this.storeKit.getOfferings();
  const currentOffering = offerings.current;

  // 2. Find lifetime package
  const lifetimePackage = currentOffering.availablePackages.find(pkg =>
    pkg.identifier.toLowerCase().includes('lifetime')
  );

  // 3. Initiate purchase (shows Apple payment sheet)
  const result = await this.storeKit.purchasePackage({
    aPackage: lifetimePackage
  });

  // 4. Handle result
  if (result.customerInfo) {
    // Purchase successful
    await this.checkStatus();  // Refresh entitlements
    showToast('Welcome to Pro! Lifetime access unlocked!', 'pro');
    this.updateUI();  // Show Lifetime card
  } else if (result.userCancelled) {
    showToast('Purchase cancelled', 'info');
  }
}
```

---

## App Startup Validation

### Every App Launch

**The validation chain:**

```
1. App launches → payments.js loads

2. ProAccess.init() called
   ↓
3. RevenueCat SDK.configure()
   - Connects to RevenueCat servers
   - Creates/retrieves anonymous user ID
   ↓
4. checkStatus() called
   ↓
5. getCustomerInfo()
   - RevenueCat → Apple App Store servers
   - Validates receipt
   - Returns entitlements
   ↓
6. Parse entitlements
   - Extract: isProActive, planLabel
   ↓
7. updateUI()
   - Show appropriate card based on status
   - Lock/unlock Pro features
```

### Validation Frequency

- ✅ **Every cold app start**
- ✅ **After every purchase**
- ✅ **When user taps "Restore Purchases"**
- ✅ **Periodically in background** (RevenueCat handles this)

### Server-Side Validation

**No local bypass possible:**
- Receipt stored in Apple's servers
- RevenueCat validates with Apple on every check
- Entitlements come from server, not local storage
- Jailbreak detection handled by RevenueCat

---

## UI States & Cards

### State 1: Free User (No Purchase)

**Card:** `proInactiveCard` (index.html)

**Display:**
- Heading: "Unlock Pro Features"
- Icon: Star (gold)
- Features list with checkmarks
- CTA: "Upgrade to Pro"

**Code:**
```javascript
if (!this.isProActive) {
  proInactiveCard.style.display = 'block';
}
```

### State 2: Lifetime Member

**Card:** `proLifetimeCard` (index.html)

**Display:**
- Heading: "Lifetime Member"
- Icon: Trophy (purple)
- Subtitle: "Permanent Pro Access"
- Features list with checkmarks
- Message: "Thank you for supporting LotriFlow Quit!"

**Code:**
```javascript
if (this.isProActive && proLifetimeCard) {
  proLifetimeCard.style.display = 'block';
}
```

---

## Testing & Troubleshooting

### Diagnostic Tool

**Location:** Available in browser console only (not exposed in UI)

**Function:** `ProAccess.runRevenueCatDiagnostics()`

**What it checks:**
1. ✅ RevenueCat SDK initialized
2. ✅ Customer info fetchable
3. ✅ Offerings count (should be 1+)
4. ✅ Current offering set (should be "default")
5. ✅ Packages count (should include Lifetime)
6. 📦 Lifetime package details

**Expected output when working:**
```
✅ SDK initialized
✅ Customer Info fetched
📦 Total offerings: 1
   Current offering: default
📦 Packages in current offering: 1

📦 PACKAGE DETAILS:
1. Lifetime
   ID: $rc_lifetime
   Product: com.lotriflow.quitcoach.pro.lifetime
   Price: $2.99
```

### Common Issues

#### Error 23: Products Not Fetchable

**Cause:** Products not propagated through Apple's systems yet

**Solutions:**
1. Wait 24-48 hours after banking/tax approval
2. Verify IAP metadata complete in App Store Connect
3. Check API keys uploaded to RevenueCat
4. Submit to App Review (guaranteed to work after approval)

#### Black Screen on Launch

**Cause:** RevenueCat not available

**Solution:** Check that RevenueCat plugin is properly installed:
```bash
npm install @revenuecat/purchases-capacitor
npx cap sync ios
```

#### Purchase Button Does Nothing

**Causes:**
1. Not testing on physical device (simulator doesn't support IAP)
2. Not signed in with Sandbox Apple ID
3. Products not propagated yet

**Solution:**
- Use physical device
- Settings → App Store → Sandbox Account
- Wait for propagation

---

## Production Checklist

### Before Submitting to App Review

- [x] **Remove debug code:**
  - [x] Debug tools not exposed in UI (✅ Done)
  - [x] Removed test mode fallback (✅ Done)
  - [x] Production mode enabled (✅ Done)

- [x] **Verify API keys:**
  - [x] App Store Connect API key uploaded ✅
  - [x] In-App Purchase key uploaded ✅
  - [x] Both keys have correct permissions ✅

- [x] **Verify products:**
  - [x] Lifetime product in "Ready to Submit" state ✅
  - [x] Screenshots uploaded ✅
  - [x] Localization complete ✅
  - [x] Attached to app version

- [ ] **Test on device:**
  - [ ] Lifetime purchase works
  - [ ] Restore purchases works
  - [ ] Correct cards display
  - [ ] Pro features unlock

### App Review Submission

1. **Create app version 1.0** in App Store Connect
2. **Add IAP to version:**
   - Navigate to version → In-App Purchases
   - Add Lifetime product
3. **Submit together:**
   - App version + IAP must be submitted together
   - First IAP requires app submission
4. **Review notes:**
   - Mention one-time Lifetime purchase
   - Explain Pro features
   - Provide test account if needed

---

## Key Takeaways

1. **Server-Validated:** Every check goes through RevenueCat → Apple
2. **No Local Bypass:** Entitlements stored server-side only
3. **Cross-Device:** Purchases sync across user's devices via Apple ID
4. **Offline Support:** Last known state cached, validates when online
5. **One Source of Truth:** RevenueCat entitlements determine access
6. **Simplified Offering:** Lifetime-only eliminates subscription complexity

---

## Support & Resources

- **RevenueCat Dashboard:** https://app.revenuecat.com
- **RevenueCat Docs:** https://www.revenuecat.com/docs
- **App Store Connect:** https://appstoreconnect.apple.com
- **Apple IAP Docs:** https://developer.apple.com/in-app-purchase

---

**Document Version:** 2.0
**Last Updated:** December 12, 2025
**Changes:** Removed trial and monthly subscription flows, simplified to Lifetime-only
