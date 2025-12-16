# Fastlane Screenshots Setup Guide

## Overview
Fastlane is installed and configured. However, automated screenshots require a **UI Test target** in Xcode.

## Current Status
- ✅ Fastlane installed
- ✅ Snapfile configured (iPhone 15 Pro Max + iPhone 8 Plus)
- ✅ Fastfile created
- ⚠️ UI Test target needed

## Option 1: Manual Screenshots (Faster for v1.0)

Since this is your first release, manual screenshots are faster:

1. Run app in **iPhone 15 Pro Max** simulator
2. Navigate to each screen, press **⌘S**
3. Repeat with **iPhone 8 Plus** simulator
4. Screenshots save to Desktop

## Option 2: Automated Screenshots (For Future Releases)

### Step 1: Add UI Test Target in Xcode

1. Open `App.xcodeproj` in Xcode
2. File → New → Target
3. Select **UI Testing Bundle**
4. Name it: `AppUITests`
5. Click Finish

### Step 2: Add SnapshotHelper

Copy `fastlane/SnapshotHelper.swift` to the new UI Test target:

1. Drag `SnapshotHelper.swift` into `AppUITests` group
2. Make sure "Copy items if needed" is checked
3. Target membership: `AppUITests`

### Step 3: Create Screenshot Tests

Create `AppUITests/ScreenshotTests.swift`:

```swift
import XCTest

class ScreenshotTests: XCTestCase {
    
    override func setUpWithError() throws {
        continueAfterFailure = false
        let app = XCUIApplication()
        setupSnapshot(app)
        app.launch()
    }
    
    func testScreenshots() throws {
        let app = XCUIApplication()
        
        // Wait for app to load
        sleep(2)
        
        // 1. Home/Timer Screen
        snapshot("01_Timer")
        
        // 2. Tap Stats tab (if separate)
        // app.buttons["Stats"].tap()
        // snapshot("02_Stats")
        
        // 3. Milestones Tab
        app.buttons["Milestones"].tap()
        sleep(1)
        snapshot("03_Milestones")
        
        // 4. Coach Tab
        app.buttons["Coach"].tap()
        sleep(1)
        snapshot("04_Coach")
        
        // 5. Settings
        app.buttons["Settings"].tap()
        sleep(1)
        snapshot("05_Settings")
        
        // Scroll to Pro section
        app.swipeUp()
        sleep(1)
        snapshot("06_Pro_Features")
    }
}
```

### Step 4: Run Screenshots

```bash
cd /Users/christolotriet/smokefree/ios/App
fastlane screenshots
```

Screenshots will be saved to `fastlane/screenshots/`

### Quick run from terminal (current setup)

Use this when everything is already configured (Snapfile + AppUITests):

```bash
cd /Users/christolotriet/smokefree/ios/App

# optional: ensure a clean simulator
xcrun simctl shutdown all
open -a Simulator
xcrun simctl boot "iPhone 15 Pro Max"

# run and let it finish (3–5 minutes)
time /opt/homebrew/bin/fastlane snapshot --verbose

# check output
ls -la fastlane/screenshots/en-US
```

Notes:
- `SnapshotTests` seeds Capacitor storage so onboarding is skipped automatically.
- Only `iPhone 15 Pro Max` is configured in `fastlane/Snapfile` right now.
- If you want live logs while it runs:  
  `latest_log=$(ls -t ~/Library/Logs/fastlane | head -n 1); tail -f ~/Library/Logs/fastlane/$latest_log`

## Recommendation

For **v1.0 launch**: Use manual screenshots (Option 1)
For **future updates**: Set up automated screenshots (Option 2)

Manual screenshots take ~10 minutes. Automated setup takes ~30 minutes but saves time for future releases.
