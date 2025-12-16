# iOS Widget Setup Guide

This guide explains how to add the SmokeFree widget to your iOS project.

## Prerequisites

- Xcode 15.4 or later (Xcode 16+ has CocoaPods compatibility issues)
- Apple Developer account
- The widget extension files in `ios/App/SmokeFreeWidget/`

## Step 1: Add Widget Extension Target in Xcode

1. Open `ios/App/App.xcworkspace` in Xcode
2. Click on the project file in the navigator (blue icon at top)
3. Click the **+** button at the bottom of the targets list
4. Search for "Widget Extension"
5. Select **Widget Extension** and click **Next**
6. Configure:
   - Product Name: `SmokeFreeWidget`
   - Team: Your development team
   - Organization Identifier: `com.lotriflow`
   - Bundle Identifier: `com.lotriflow.smokefree.widget`
   - **Uncheck** "Include Configuration App Intent"
   - **Uncheck** "Include Live Activity"
7. Click **Finish**
8. When prompted to activate the scheme, click **Cancel** (we'll use the main app scheme)

## Step 2: Replace Generated Files

1. Delete all files inside the newly created `SmokeFreeWidget` folder in Xcode
2. Drag in the files from `ios/App/SmokeFreeWidget/`:
   - `SmokeFreeWidget.swift`
   - `Assets.xcassets` folder
3. Make sure "Copy items if needed" is checked
4. Ensure target membership is set to `SmokeFreeWidgetExtension`

## Step 3: Configure App Groups

### For the Main App Target:
1. Select the **App** target
2. Go to **Signing & Capabilities**
3. Click **+ Capability**
4. Add **App Groups**
5. Click the **+** under App Groups
6. Enter: `group.com.lotriflow.smokefree`

### For the Widget Extension Target:
1. Select the **SmokeFreeWidgetExtension** target
2. Go to **Signing & Capabilities**
3. Click **+ Capability**
4. Add **App Groups**
5. Select the same group: `group.com.lotriflow.smokefree`

## Step 4: Install WidgetKit Capacitor Plugin

For the app to communicate with the widget, install the WidgetKit plugin:

```bash
npm install @nicandromira/capacitor-ios-widgetkit
npx cap sync ios
```

Then register the plugin in your iOS app's `AppDelegate.swift`:

```swift
import CapacitorWidgetKit

// In application(_:didFinishLaunchingWithOptions:)
// The plugin auto-registers with Capacitor
```

## Step 5: Update Info.plist (Widget Extension)

The widget's `Info.plist` should already be configured correctly by Xcode.

## Step 6: Build and Test

1. Select the main **App** scheme (not SmokeFreeWidget)
2. Build and run on a device or simulator
3. On the device:
   - Long-press on the home screen
   - Tap **+** in the top left
   - Search for "SmokeFree"
   - Add the widget to your home screen

## Widget Sizes

The SmokeFree widget supports:
- **Small**: Shows smoke-free time and streak
- **Medium**: Shows smoke-free time, cigarettes avoided, money saved, and streak

## Troubleshooting

### Widget shows "No data"
- Make sure App Groups are configured for both targets
- Verify the group identifier matches: `group.com.lotriflow.smokefree`
- Log some data in the app first, then check the widget

### Widget doesn't update
- The widget updates every 15 minutes automatically
- You can force refresh by removing and re-adding the widget
- In the app, any state change triggers a widget refresh

### Build errors
- Make sure the widget target's deployment target matches your iOS version
- Clean build folder: Product → Clean Build Folder (Cmd+Shift+K)

## Alternative: Manual Data Sharing

If you don't want to use the WidgetKit plugin, you can share data manually using UserDefaults with App Groups in the native iOS code. The widget is already set up to read from:

- `lastCigarette` (Double - timestamp in milliseconds)
- `cigarettesAvoided` (Int)
- `moneySaved` (Double)
- `streak` (Int)
- `currencySymbol` (String)

## App Store Considerations

When submitting to the App Store:
1. The widget extension will be included automatically
2. Add screenshots of the widget for App Store listing
3. Mention widget support in the app description
