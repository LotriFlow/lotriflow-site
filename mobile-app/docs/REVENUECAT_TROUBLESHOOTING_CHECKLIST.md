# RevenueCat IAP Troubleshooting Checklist

**Error:** "None of the products registered in the RevenueCat dashboard could be fetched from App Store Connect"

## Quick Diagnostic Test

**Run this FIRST before manual checks:**

1. Build and run app: `npm run build && npx cap sync ios && npx cap run ios`
2. Open Pro upgrade modal in the app
3. Click **"🔍 Run Diagnostics"** button
4. Take screenshots of all alert messages
5. The diagnostic will tell you exactly what's wrong

---

## Manual Verification Checklist

### ✅ 1. Bundle ID Configuration

**Requirement:** Bundle ID must match EXACTLY across all platforms

Check these locations:

- [ ] **Xcode:** Open project → Select "App" target → General tab → Bundle Identifier
  - Should be: `com.lotriflow.quitcoach`

- [ ] **capacitor.config.json:** Line 2
  - Should be: `"appId": "com.lotriflow.quitcoach"`

- [ ] **RevenueCat Dashboard:** Projects → App Settings → Bundle ID
  - Go to: https://app.revenuecat.com
  - Navigate to: Projects → Settings → App Settings
  - iOS Bundle ID should be: `com.lotriflow.quitcoach`

**❌ If mismatch found:** Update RevenueCat dashboard to match your Bundle ID

---

### ✅ 2. Product IDs in App Store Connect

**Requirement:** Products must exist in App Store Connect with exact IDs

Check these products exist:

- [ ] **Lifetime Product**
  - ID: `com.lotriflow.quitcoach.pro.lifetime`
  - Type: Non-Consumable
  - Status: "Ready to Submit" or "Approved"

- [ ] **Monthly Subscription**
  - ID: `com.lotriflow.quitcoach.subscription.monthly`
  - Type: Auto-Renewable Subscription
  - Subscription Group: "SmokeFree Pro"
  - Status: "Ready to Submit" or "Approved"

**How to check:**
1. Go to: https://appstoreconnect.apple.com
2. My Apps → LotriFlow Quit Pro → Features → In-App Purchases
3. Verify both products exist with correct IDs

**❌ If missing:** Create products in App Store Connect first

---

### ✅ 3. Products Added to RevenueCat

**Requirement:** Products must be manually added to RevenueCat dashboard

- [ ] **Lifetime Product Added**
  - Go to: https://app.revenuecat.com → Products
  - Click "+" to add product
  - Enter: `com.lotriflow.quitcoach.pro.lifetime`
  - Type: One-time purchase

- [ ] **Monthly Subscription Added**
  - Go to: https://app.revenuecat.com → Products
  - Click "+" to add product
  - Enter: `com.lotriflow.quitcoach.subscription.monthly`
  - Type: Subscription

**❌ If missing:** Add products to RevenueCat dashboard

---

### ✅ 4. Entitlements Configuration

**Requirement:** Products must be attached to an entitlement

- [ ] **Entitlement exists:** "LotriFlow Quit Pro"
  - Go to: https://app.revenuecat.com → Entitlements
  - Verify entitlement named: `LotriFlow Quit Pro`

- [ ] **Products attached to entitlement:**
  - Click on "LotriFlow Quit Pro" entitlement
  - Both products should be listed:
    - ✅ `com.lotriflow.quitcoach.pro.lifetime`
    - ✅ `com.lotriflow.quitcoach.subscription.monthly`

**❌ If not attached:** Click "Attach Products" and select both products

---

### ✅ 5. Offerings Configuration

**Requirement:** Products must be in an offering marked as "Current"

- [ ] **Offering exists:** "default"
  - Go to: https://app.revenuecat.com → Offerings
  - Verify offering named: `default`
  - **CRITICAL:** Must be marked as "Current Offering" ⭐

- [ ] **Packages exist in offering:**
  - Click on "default" offering
  - Should have 2 packages:
    - 📦 **$rc_lifetime** → `com.lotriflow.quitcoach.pro.lifetime`
    - 📦 **$rc_monthly** → `com.lotriflow.quitcoach.subscription.monthly`

**❌ If missing:** Create offering and add packages

---

### ✅ 6. App Store Connect Agreements

**Requirement:** All agreements must be "Active"

- [ ] **Paid Apps Agreement:** Active
  - Go to: https://appstoreconnect.apple.com → Business → Agreements, Tax, and Banking
  - Status should be "Active" (green checkmark)

- [ ] **Banking Information:** Complete
  - Bank account added and verified
  - Status: "Active"

- [ ] **Tax Forms:** Submitted
  - US W-9 (or appropriate tax form) submitted
  - Status: "Active"

**❌ If pending:** Complete all agreement sections. **IAPs WILL NOT WORK until active!**

---

### ✅ 7. StoreKit Configuration (CRITICAL!)

**Requirement:** Must be set to "None" when testing with real App Store Connect products

- [ ] **StoreKit Config set to None:**
  1. Open Xcode
  2. Product → Scheme → Edit Scheme
  3. Select "Run" on left
  4. Go to "Options" tab
  5. Find "StoreKit Configuration"
  6. **MUST be set to: "None"**

- [ ] **Rebuild after changing:**
  - Clean Build Folder: Cmd+Shift+K
  - Build: Cmd+B
  - Or run: `npm run build && npx cap sync ios`

**❌ If set to "App.storekit":** This will use local test products instead of real ones!

---

### ✅ 8. Testing Environment

**Requirement:** Test on physical device with Sandbox Apple ID

- [ ] **Using physical device** (not simulator)
  - Simulator may not work correctly with IAPs

- [ ] **Sandbox Apple ID:**
  - Go to: https://appstoreconnect.apple.com → Users and Access → Sandbox Testers
  - Create a sandbox tester if you haven't
  - **On device:** Settings → App Store → Sandbox Account → Sign in with sandbox Apple ID

- [ ] **Signed out of production Apple ID:**
  - Settings → [Your Name] → Sign Out (for testing only)
  - Or just ensure Sandbox Account is configured in Settings → App Store

**❌ If testing on simulator or production account:** Switch to physical device + sandbox account

---

### ✅ 9. Product Propagation Time

**Requirement:** Products need time to become available after approval

- [ ] **Check when banking was approved:**
  - If banking/tax were approved within last 24 hours, products may still be propagating

- [ ] **Wait 24-48 hours after:**
  - Banking agreement approved
  - Products created/modified in App Store Connect
  - Products added to RevenueCat

**⏳ If recently approved:** Wait and try again in a few hours

---

### ✅ 10. API Key Configuration

**Requirement:** Correct RevenueCat API key in code

- [ ] **API Key is correct:**
  - Open: `/Users/christolotriet/smokefree/src/app.js`
  - Line 6441 should have: `const REVENUECAT_API_KEY = 'appl_vGjWBqONTEBtXnasyzvZARaIyaY';`

- [ ] **API Key is for iOS:**
  - Go to: https://app.revenuecat.com → Project Settings → API Keys
  - Copy the **Apple App Store** API key (starts with `appl_`)
  - **NOT** the Google Play key (starts with `goog_`)

**❌ If wrong key:** Update code with correct iOS API key

---

## Common Issues and Solutions

### Issue: "No current offering found"
**Solution:** Go to RevenueCat dashboard → Offerings → Mark "default" as "Current Offering" ⭐

### Issue: "0 packages in offering"
**Solution:** Go to offering → Add packages → Select your products

### Issue: Products not fetched but everything looks correct
**Possible causes:**
1. Banking/tax agreements still processing (wait 24hrs)
2. StoreKit Configuration not set to "None" (rebuild after changing)
3. Bundle ID mismatch between RevenueCat and App Store Connect
4. Testing on simulator instead of physical device

### Issue: Error code 23 or "configuration error"
**Solution:** This is the error you're seeing. Work through checklist above systematically.

---

## Testing Steps

1. ✅ Complete ALL checklist items above
2. 🔧 Build: `npm run build && npx cap sync ios`
3. 📱 Deploy to device: `npx cap run ios` or Archive in Xcode
4. 🔍 Open app → Open Pro modal → Click "Run Diagnostics"
5. 📸 Take screenshots of diagnostic results
6. ✅ If diagnostics pass, try purchasing

---

## Resources

Based on research from:
- [RevenueCat Troubleshooting Empty Products/Offerings](https://www.revenuecat.com/docs/offerings/troubleshooting-offerings)
- [RevenueCat Community: Error 23 - Products Not Fetched](https://community.revenuecat.com/general-questions-7/ios-code-error-23-none-of-the-products-registered-in-the-revenuecat-dashboard-could-be-fetched-from-app-store-connect-3680)
- [Apple Developer: Testing In-App Purchases with Sandbox](https://developer.apple.com/documentation/storekit/testing-in-app-purchases-with-sandbox)
- [Apple Developer: Sandbox Testing Overview](https://developer.apple.com/help/app-store-connect/test-in-app-purchases/overview-of-testing-in-sandbox/)

---

## Next Steps

**Run the diagnostic tool in your app NOW:**

1. `npm run build && npx cap sync ios && npx cap run ios`
2. Open Pro modal
3. Click "🔍 Run Diagnostics"
4. Send me screenshots of the results

The diagnostic will pinpoint exactly which step is failing!
