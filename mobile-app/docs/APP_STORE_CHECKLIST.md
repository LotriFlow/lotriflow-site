# App Store Submission Checklist

Complete guide for submitting QuitFlow to the iOS App Store and Google Play Store.

## iOS App Store

### Prerequisites
- [ ] Apple Developer Program membership ($99/year)
- [ ] App Store Connect access
- [ ] Xcode 14+ installed
- [ ] Valid code signing certificates

### App Build Requirements

#### 1. App Icon
- [ ] 1024x1024px icon (App Store)
- [x] App icons in Xcode project (already set up in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`)

#### 2. Screenshots (Required Sizes)
- [ ] iPhone 6.7" (iPhone 14 Pro Max, 15 Plus, 15 Pro Max)
  - 1290 x 2796 pixels (portrait)
  - Or 2796 x 1290 pixels (landscape)
  - 3-10 screenshots required
- [ ] iPhone 6.5" (iPhone 11 Pro Max, XS Max)
  - 1242 x 2688 pixels (portrait)
  - Or 2688 x 1242 pixels (landscape)
  - 3-10 screenshots required
- [ ] iPhone 5.5" (iPhone 8 Plus)
  - 1242 x 2208 pixels (portrait)
  - Or 2208 x 1242 pixels (landscape)
  - Optional but recommended

**Tip**: Take screenshots using iOS Simulator:
```bash
# Run app in simulator
npx cap open ios
# Select device (e.g., iPhone 15 Pro Max)
# Run the app
# Press Cmd+S to save screenshot
```

#### 3. App Store Metadata
- [ ] App Name (30 characters max)
  - Suggestion: "QuitFlow - Quit Smoking"
- [ ] Subtitle (30 characters max)
  - Suggestion: "Track Your Smoke-Free Journey"
- [ ] Description (4000 characters max)
  - See template below
- [ ] Keywords (100 characters max, comma-separated)
  - Suggestion: "quit smoking,stop smoking,cigarette tracker,smoke free,health,addiction,wellness,timer,motivation"
- [ ] Support URL
  - Your website or GitHub repo: https://github.com/lotriet/quitflow
- [ ] Privacy Policy URL (REQUIRED)
  - See template below
- [ ] Category
  - Primary: Health & Fitness
  - Secondary: Lifestyle
- [ ] Age Rating
  - Answer questionnaire (likely 4+)

#### 4. Version Information
- [ ] Version number (e.g., 1.0.0)
- [ ] Build number (must be unique for each upload)
- [ ] What's New in This Version
  - Initial release notes

#### 5. App Review Information
- [ ] Contact Information (email, phone)
- [ ] Demo Account (if app requires login) - N/A for QuitFlow
- [ ] Notes for Reviewer
  - "QuitFlow is a quit smoking tracker that stores all data locally on device. No login required, no data collection."

### Technical Requirements

#### 1. Build Configuration
- [ ] Update version in Xcode:
  - Open `ios/App/App.xcworkspace`
  - Select project > General
  - Set Version (e.g., 1.0.0)
  - Set Build (e.g., 1)
- [ ] Update bundle identifier if needed
  - Currently: `com.quitflow.app`
- [ ] Configure signing:
  - Select your Team
  - Ensure "Automatically manage signing" is checked

#### 2. Create Archive
```bash
# 1. Build production assets
npm run build
npx cap sync ios

# 2. Open in Xcode
npx cap open ios

# 3. In Xcode:
#    - Select "Any iOS Device (arm64)" as target
#    - Product > Archive
#    - Wait for archive to complete
#    - Click "Distribute App"
#    - Choose "App Store Connect"
#    - Follow the wizard
```

#### 3. TestFlight (Recommended First)
- [ ] Upload build to App Store Connect
- [ ] Enable TestFlight
- [ ] Add internal testers (up to 100)
- [ ] Test thoroughly before public release

### App Store Connect Setup

1. **Create App**:
   - Go to https://appstoreconnect.apple.com/
   - Click "My Apps" > "+" > "New App"
   - Choose iOS platform
   - Enter app name and bundle ID
   - SKU: com.quitflow.app

2. **Fill In App Information**:
   - [ ] Upload screenshots
   - [ ] Write description
   - [ ] Add keywords
   - [ ] Set category
   - [ ] Add support and privacy URLs
   - [ ] Answer age rating questionnaire

3. **Pricing and Availability**:
   - [ ] Set price (Free recommended)
   - [ ] Select countries/regions
   - [ ] Set availability date

4. **Submit for Review**:
   - [ ] Attach build from TestFlight
   - [ ] Add version information
   - [ ] Submit

### Review Process
- Initial review: 1-3 days typically
- Possible outcomes: Approved, Rejected, Needs Info
- If rejected: Read rejection reason, fix issues, resubmit

---

## Google Play Store

### Prerequisites
- [ ] Google Play Console account ($25 one-time fee)
- [ ] Android Studio installed
- [ ] Signing keystore created

### App Build Requirements

#### 1. App Icon
- [ ] 512x512px high-res icon (PNG, 32-bit)
- [ ] Feature graphic: 1024x500px (PNG or JPEG)

#### 2. Screenshots (Minimum 2, Maximum 8)
- [ ] Phone screenshots (required)
  - 320-3840px on shortest side
  - Recommended: 1080 x 1920 pixels
- [ ] 7" tablet screenshots (optional)
- [ ] 10" tablet screenshots (optional)

**Tip**: Use Android Emulator to capture screenshots

#### 3. Store Listing
- [ ] App Name (50 characters max)
- [ ] Short Description (80 characters max)
- [ ] Full Description (4000 characters max)
- [ ] App Category: Health & Fitness
- [ ] Tags: health, smoking, quit, wellness
- [ ] Contact Details (email, website)
- [ ] Privacy Policy URL (REQUIRED)

#### 4. Content Rating
- [ ] Complete questionnaire
- [ ] Likely rating: Everyone

### Technical Requirements

#### 1. Generate Signed APK/AAB

```bash
# 1. Build production assets
npm run build
npx cap sync android

# 2. Open in Android Studio
npx cap open android

# 3. Generate signed bundle:
#    Build > Generate Signed Bundle / APK
#    Select "Android App Bundle" (AAB)
#    Create new keystore (first time):
#      - Keystore path: ~/quitflow-keystore.jks
#      - Password: [secure password]
#      - Alias: quitflow
#      - Validity: 25 years minimum
#    Select "release" build variant
```

**IMPORTANT**: Save your keystore and passwords securely! You cannot update your app without it.

#### 2. Version Configuration
Edit `android/app/build.gradle`:
```gradle
android {
    defaultConfig {
        versionCode 1  // Increment for each release
        versionName "1.0.0"  // User-visible version
    }
}
```

### Google Play Console Setup

1. **Create App**:
   - Go to https://play.google.com/console
   - Click "Create app"
   - Fill in app details
   - Select free/paid
   - Agree to declarations

2. **Store Listing**:
   - [ ] Upload screenshots
   - [ ] Upload app icon and feature graphic
   - [ ] Write descriptions
   - [ ] Add contact information

3. **App Content**:
   - [ ] Privacy Policy URL
   - [ ] App access (no special access needed)
   - [ ] Ads (select "No, my app does not contain ads")
   - [ ] Content rating questionnaire
   - [ ] Target audience
   - [ ] News app declaration (No)

4. **Release**:
   - [ ] Production > Create new release
   - [ ] Upload AAB file
   - [ ] Enter release notes
   - [ ] Review and roll out

### Review Process
- Initial review: Hours to a few days
- Faster than iOS typically
- Once approved, available within hours

---

## Privacy Policy Template

Required for both App Store and Play Store. Host this on your website or GitHub Pages.

```markdown
# Privacy Policy for QuitFlow

Last updated: [DATE]

## Overview
QuitFlow is a quit smoking tracking application that respects your privacy.

## Data Collection
QuitFlow does NOT collect, store, or transmit any personal data to external servers.

## Data Storage
All data is stored locally on your device using:
- iOS: NSUserDefaults via Capacitor Preferences
- Android: SharedPreferences via Capacitor Preferences
- Web: Browser LocalStorage

Your data never leaves your device.

## Data Types Stored Locally
- Cigarette log timestamps
- User preferences (daily limit, target interval, etc.)
- App settings (theme, sound, notifications)
- Achievement progress
- Statistics calculations

## Data Deletion
You can delete all your data at any time using the "Reset All Data" button in app settings.

Uninstalling the app will permanently delete all stored data.

## Third-Party Services
QuitFlow does not use any third-party analytics, advertising, or tracking services.

## Children's Privacy
QuitFlow does not knowingly collect data from children under 13.

## Changes to Privacy Policy
We may update this policy. Changes will be posted here with an updated date.

## Contact
For questions, email: [YOUR EMAIL]
```

---

## App Description Template

### iOS App Store Description

```
QUIT SMOKING, RECLAIM YOUR LIFE

QuitFlow helps you quit smoking with powerful tracking, motivation, and support. Track your smoke-free journey, see your progress, and stay motivated with achievements and health milestones.

★ FEATURES ★

• Real-Time Smoke-Free Timer
  Track every second you're smoke-free with a beautiful countdown display

• Smart Cigarette Tracking
  Log cigarettes and see patterns in your smoking habits

• Health & Money Milestones
  Watch your body heal and see how much money you're saving

• Achievement Badges
  Unlock motivating badges as you hit major milestones

• AI Coach
  Get personalized encouragement and tips based on your progress

• Breathing Exercises
  Fight cravings with proven breathing techniques like the 4-7-8 method

• Comprehensive Statistics
  Charts and reports show your daily, weekly, and overall progress

• Dark Mode
  Beautiful dark and light themes for comfortable viewing

• 100% Private
  All your data stays on your device - no cloud, no tracking

★ WHY QUITFLOW? ★

✓ Evidence-based approach to quitting
✓ No ads, no subscriptions
✓ Works offline
✓ Clean, modern design
✓ Easy to use

★ YOUR JOURNEY STARTS NOW ★

Every cigarette you don't smoke is a victory. QuitFlow helps you celebrate each one and keeps you motivated for the next. Download now and start your smoke-free journey!

SUPPORT
Have questions or feedback? Contact us at [YOUR EMAIL]

PRIVACY
QuitFlow stores all data locally on your device. We don't collect or share any personal information.
```

### Google Play Store Description

Similar to above, but you can use more formatting and sections.

---

## Final Checklist Before Submission

### iOS
- [ ] Tested on real iPhone device
- [ ] Tested on iPad (if supporting iPad)
- [ ] All features work correctly
- [ ] No crashes or bugs
- [ ] App icon looks good
- [ ] Screenshots are high quality
- [ ] Description is compelling
- [ ] Privacy policy is published
- [ ] Support email is active
- [ ] Version and build numbers are set
- [ ] Archive uploaded successfully

### Android
- [ ] Tested on real Android device
- [ ] Tested on different screen sizes
- [ ] All features work correctly
- [ ] No crashes or bugs
- [ ] App icon and feature graphic look good
- [ ] Screenshots are high quality
- [ ] Description is compelling
- [ ] Privacy policy is published
- [ ] Support email is active
- [ ] Keystore is backed up securely
- [ ] AAB uploaded successfully

---

## Pre-Deploy Change Playbook (when code changes just before release)
- [ ] `git status` clean apart from intended changes; pull latest `main`.
- [ ] Unit tests: `npm test` (verbose) for stats/timer helpers.
- [ ] Build web bundle: `npm run build` (writes to `dist/`).
- [ ] E2E smoke on built assets: in one shell `python3 -m http.server 3000 -d dist --bind 127.0.0.1`; in another  
      `PLAYWRIGHT_NO_SERVER=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 PLAYWRIGHT_BROWSERS_PATH=./.playwright-browsers npm run test:e2e`.
- [ ] Capacitor sync: `npm run sync` (or `npx cap sync ios android`) so native projects reflect latest web build.
- [ ] Version/build bump: update iOS and Android version/build numbers; confirm icons/splash unchanged or regenerated.
- [ ] Device smoke: launch on at least one iOS device/simulator and one Android device/emulator; exercise onboarding (if present), log cigarette, settings (baseline/limits/cost), notifications toggle, reset flow, watch sync if applicable.
- [ ] Logging: ensure debug logs are minimized for release; clear test data after smoke tests.
- [ ] Artifacts: update release notes and store screenshots only if UI changed; ensure privacy/support links and emails are correct.
- [ ] Final check: `git status`, commit, and tag when ready to ship.

---

## Post-Launch

### Monitor Reviews
- [ ] Set up email notifications for reviews
- [ ] Respond to user feedback
- [ ] Track common issues

### Updates
- [ ] Plan feature updates
- [ ] Fix bugs quickly
- [ ] Increment version numbers for each update
- [ ] Keep TestFlight beta testing active

### Marketing
- [ ] Share on social media
- [ ] Create website/landing page
- [ ] Ask friends to review
- [ ] Submit to app review sites

---

## Support Resources

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy Center](https://play.google.com/about/developer-content-policy/)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
