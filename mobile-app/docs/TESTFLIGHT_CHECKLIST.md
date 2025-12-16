# TestFlight Deployment Checklist

## Current Status Summary

### ✅ COMPLETED
- **Bundle Identifier**: `com.lotriflow.smokefree` (correctly configured)
- **Version**: `1.0.0` (Marketing Version)
- **Build**: `1` (Current Project Version)
- **Privacy Policy**: Ready at `privacy.html` (needs public hosting)
- **Terms of Service**: Ready at `terms.html` (needs public hosting)
- **Screenshots**: 2 screenshots generated (iPhone 15 Pro Max, iPhone 16)
  - Location: `/ios/App/fastlane/screenshots/en-US/`

---

## 🔧 HIGH PRIORITY - Complete Before Archive

### 1. Open Xcode Project
```bash
npx cap open ios
```

### 2. Verify Configuration in Xcode
- [x] **Bundle ID**: `com.lotriflow.smokefree` ✅ Already set
- [x] **Marketing Version**: `1.0.0` ✅ Already set
- [x] **Build Number**: `1` ✅ Already set
- [ ] **Signing & Capabilities**:
  - Open Xcode → Select "App" target
  - Go to "Signing & Capabilities" tab
  - Either enable "Automatically manage signing" OR
  - Manually select your provisioning profile
  - **Action needed**: Verify your Apple Developer account is connected

### 3. Archive & Upload to TestFlight
Once signing is configured:

1. In Xcode: **Product → Archive**
2. Wait for archive to complete
3. Click **Distribute App**
4. Select **App Store Connect**
5. Follow prompts to upload
6. Upload time: ~5-10 minutes depending on internet speed

---

## 📱 MEDIUM PRIORITY - Before Adding External Testers

### 4. Host Privacy Policy & Terms Publicly

**Current files**:
- `/privacy.html`
- `/terms.html`

**Hosting Options**:

#### Option A: GitHub Pages (Recommended - Free & Fast)
```bash
# Create a new repo or use existing website repo
# Upload privacy.html and terms.html
# URLs will be:
# https://lotriflow.github.io/smokefree/privacy.html
# https://lotriflow.github.io/smokefree/terms.html
```

#### Option B: Azure Static Web Apps (Already using Azure)
```bash
# Upload to your existing Azure deployment
# URLs:
# https://yourapp.azurewebsites.net/privacy.html
# https://yourapp.azurewebsites.net/terms.html
```

#### Option C: Netlify Drop
- Go to https://app.netlify.com/drop
- Drag `privacy.html` and `terms.html`
- Get instant URLs

**Action**: Pick a hosting option and note the URLs for App Store Connect.

---

### 5. Create App in App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click **Apps** → **+** (Add App)
3. Fill in:
   - **Platform**: iOS
   - **Name**: SmokeFree
   - **Primary Language**: English (US)
   - **Bundle ID**: Select `com.lotriflow.smokefree`
   - **SKU**: `smokefree-ios-2025` (or any unique ID)
   - **User Access**: Full Access

---

### 6. Complete App Store Metadata

Navigate to your app → **App Information**:

#### General Information
- **Category**: Health & Fitness
- **Secondary Category**: Lifestyle (optional)
- **Age Rating**: Complete questionnaire
  - Answer "Yes" to: "References or depicts the use of alcohol, tobacco, or drugs"
  - Result should be **17+**

#### URLs
- **Privacy Policy URL**: `https://[YOUR-HOST]/privacy.html`
- **Terms of Service URL**: `https://[YOUR-HOST]/terms.html`
- **Support URL**: `me@lotriflow.com` or create support page
- **Marketing URL**: (optional)

#### Copyright
```
© 2025 lotriflow
```

---

### 7. Generate Missing Screenshots

**Current**: Only 6.7" screenshots (iPhone 15 Pro Max, iPhone 16)

**Still Need**: 5.5" screenshots (iPhone 8 Plus)

#### Quick Manual Method (10 minutes):
```bash
# 1. Open Xcode
npx cap open ios

# 2. Select iPhone 8 Plus simulator
# 3. Run app (⌘R)
# 4. Navigate to each screen and press ⌘S:
#    - Home/Timer screen
#    - Milestones tab
#    - Coach tab
#    - Settings/Pro section
#    - Stats view (if separate)

# 5. Screenshots save to Desktop
# 6. Upload to App Store Connect
```

**Required Screenshots** (at minimum):
1. **Home/Timer** - Main countdown with streak
2. **Milestones** - Achievement badges and health timeline
3. **Coach** - Support features
4. **Settings/Pro** - Pro features upgrade

**Sizes Required**:
- ✅ 6.7" (1290 x 2796) - Already have
- ⚠️ 5.5" (1242 x 2208) - **NEED TO CREATE**

---

### 8. Configure In-App Purchases

**In App Store Connect** → Your App → **In-App Purchases**

#### Create Product 1: Lifetime Pro
- **Type**: Non-Consumable
- **Reference Name**: SmokeFree Pro Lifetime
- **Product ID**: `com.lotriflow.quitcoach.pro.lifetime`
- **Price**: Tier 4 ($2.99 USD)
- **Display Name**: SmokeFree Pro Lifetime
- **Description**: Unlock all Pro features forever. One-time purchase.

#### Create Product 2: Monthly Subscription (Optional)
- **Type**: Auto-Renewable Subscription
- **Reference Name**: SmokeFree Pro Monthly
- **Product ID**: `com.lotriflow.quitcoach.subscription.monthly`
- **Subscription Group**: SmokeFree Pro
- **Price**: Tier 3 ($2.99 USD)
- **Duration**: 1 Month
- **Display Name**: SmokeFree Pro Monthly
- **Description**: Unlock all premium features. Cancel anytime.

**Note**: Submit IAP products for review (they're reviewed separately from the app).

---

## ⚡ FASTEST PATH TO TESTFLIGHT (Internal Testing)

If you want to get into TestFlight ASAP for internal testing only:

### Minimum Required Steps:
1. ✅ Configure Xcode signing (step 2)
2. ✅ Archive & upload (step 3)
3. ✅ Create app in App Store Connect (step 5)
4. ✅ Add yourself as internal tester
5. ⏱️ Wait 24-48 hours for processing

**You can skip for internal testing**:
- Screenshots (only needed for external testers)
- Privacy/Terms URLs (required later for App Store submission)
- Full metadata (can add later)

---

## 📋 Quick Reference Commands

### Open Xcode
```bash
cd /Users/christolotriet/smokefree
npx cap open ios
```

### Sync Capacitor Changes
```bash
npx cap sync ios
```

### Check Build Settings
```bash
grep -E "MARKETING_VERSION|CURRENT_PROJECT_VERSION|PRODUCT_BUNDLE_IDENTIFIER" \
  ios/App/App.xcodeproj/project.pbxproj | grep -v "watchkitapp" | head -10
```

---

## 🎯 Action Plan Summary

### Right Now (30 minutes):
1. Open Xcode: `npx cap open ios`
2. Configure signing (Signing & Capabilities tab)
3. Archive the app (Product → Archive)
4. Upload to TestFlight

### Today (1-2 hours):
5. Host privacy.html and terms.html publicly
6. Create app in App Store Connect
7. Generate 5.5" screenshots manually
8. Upload screenshots to App Store Connect

### This Week:
9. Configure IAP products
10. Complete all metadata
11. Submit for App Store Review

---

## Need Help?

### Common Issues:

**"No signing identity found"**
- Go to Xcode → Preferences → Accounts
- Add your Apple ID
- Download certificates

**"Archive option grayed out"**
- Select "Any iOS Device (arm64)" as target
- Clean build folder (⌘⇧K)
- Try again

**"Upload failed"**
- Check bundle ID matches App Store Connect
- Verify version/build numbers are incremented from previous uploads
- Check internet connection

---

## Next Steps After TestFlight Upload

1. Wait for processing (~15-60 minutes)
2. Add internal testers in App Store Connect
3. Testers receive email to install TestFlight
4. Gather feedback
5. Iterate and submit for App Store Review

---

**Ready to start?** Begin with opening Xcode and checking signing! 🚀
