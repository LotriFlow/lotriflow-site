# Manual Screenshots Guide for App Store

The automated screenshot tool is having simulator issues. Here's the **quickest manual method** to get your App Store screenshots ready.

## Required Sizes

Apple requires screenshots for these sizes:
- ✅ **6.7"** (1290 x 2796) - iPhone 15 Pro Max ← Already have some
- ⚠️ **5.5"** (1242 x 2208) - iPhone 8 Plus ← Need to create

## Step-by-Step Instructions

### 1. Open Xcode

```bash
cd /Users/christolotriet/smokefree
npx cap open ios
```

### 2. Create iPhone 8 Plus Simulator (if needed)

1. In Xcode menu: **Window → Devices and Simulators**
2. Click the **+** button (bottom left)
3. Settings:
   - **Simulator Name**: iPhone 8 Plus Screenshots
   - **Device Type**: iPhone 8 Plus
   - **OS Version**: Select latest iOS available
4. Click **Create**

### 3. Take 6.7" Screenshots (iPhone 15 Pro Max)

1. Select simulator: **iPhone 15 Pro Max** from the device dropdown
2. Run the app: Press **⌘R**
3. Wait for app to fully load (3-5 seconds)
4. Navigate to each screen and press **⌘S** to save screenshot:

#### Screen 1: Home/Timer
- The main screen when app opens
- Shows countdown timer and streak
- Press **⌘S**

#### Screen 2: Milestones
- Tap **Milestones** tab at bottom
- Wait for content to load
- Press **⌘S**

#### Screen 3: Coach
- Tap **Coach** tab
- Wait for content to load
- Press **⌘S**

#### Screen 4: Report/Stats
- Tap **Report** tab
- Wait for charts to render
- Press **⌘S**

#### Screen 5: Settings
- Tap **Settings** tab
- Press **⌘S**

#### Screen 6: Pro Features (optional but recommended)
- Still in Settings tab
- Scroll down to Pro section
- Press **⌘S**

### 4. Take 5.5" Screenshots (iPhone 8 Plus)

Repeat the exact same steps but with **iPhone 8 Plus** simulator selected:

1. Stop the current simulator (⌘.)
2. Select **iPhone 8 Plus** from device dropdown
3. Run the app: **⌘R**
4. Navigate to the same 5-6 screens
5. Press **⌘S** on each screen

### 5. Organize Screenshots

Screenshots are saved to your **Desktop** by default.

1. Create folders:
```bash
mkdir -p ~/Desktop/AppStoreScreenshots/6.7-inch
mkdir -p ~/Desktop/AppStoreScreenshots/5.5-inch
```

2. Move screenshots:
- Move iPhone 15 Pro Max screenshots → `6.7-inch` folder
- Move iPhone 8 Plus screenshots → `5.5-inch` folder

3. Rename them (optional but helpful):
```
01_Home.png
02_Milestones.png
03_Coach.png
04_Report.png
05_Settings.png
06_Pro.png
```

### 6. Verify Screenshot Sizes

Check that screenshots are the correct dimensions:

```bash
# Check 6.7" screenshots (should be 1290 x 2796)
sips -g pixelWidth -g pixelHeight ~/Desktop/AppStoreScreenshots/6.7-inch/*.png

# Check 5.5" screenshots (should be 1242 x 2208)
sips -g pixelWidth -g pixelHeight ~/Desktop/AppStoreScreenshots/5.5-inch/*.png
```

Expected output:
- **6.7"**: `pixelWidth: 1290` and `pixelHeight: 2796`
- **5.5"**: `pixelWidth: 1242` and `pixelHeight: 2208`

## Alternative: Use Existing Screenshots Tool

If you want to try automated screenshots again after fixing simulator issues:

```bash
# Create iPhone 8 Plus simulator
xcrun simctl create "iPhone 8 Plus" com.apple.CoreSimulator.SimDeviceType.iPhone-8-Plus

# Boot it
xcrun simctl boot "iPhone 8 Plus"

# Try fastlane again
cd /Users/christolotriet/smokefree/ios/App
fastlane snapshot
```

## Upload to App Store Connect

Once you have all screenshots:

1. Go to https://appstoreconnect.apple.com
2. Select your app
3. Go to version → **App Store** tab
4. Scroll to **App Previews and Screenshots**
5. Select **6.7" Display**
   - Drag and drop all 6.7" screenshots
6. Select **5.5" Display**
   - Drag and drop all 5.5" screenshots

**Important**: Upload in the order you want them displayed (Home first, Pro last)

## Tips for Great Screenshots

- Make sure the app has good demo data (not all zeros)
- The timer should show a realistic time (e.g., "3 Days 5 Hours" not "0 Minutes")
- Milestones should show some progress
- Consider adding text captions in App Store Connect to explain each feature

## Estimated Time

- **Manual screenshots**: ~15 minutes total
- **Automated (if working)**: ~5 minutes

For your first release, manual is faster and more reliable!

---

## Quick Reference: Required Screens

Minimum 4 screenshots per size, recommended 5-6:

1. **Home/Timer** - Main countdown, streak
2. **Milestones** - Achievements and health recovery
3. **Coach** - Support features
4. **Report** - Charts and analytics
5. **Settings** - (optional)
6. **Pro Features** - (optional but shows upgrade path)

Good luck! 🚀
