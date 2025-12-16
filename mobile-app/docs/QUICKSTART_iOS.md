# Quick Start Guide - iOS Development

This guide will get you running QuitFlow on your iPhone in under 10 minutes.

## What You Already Have ✅

Based on your setup, you already have:
- ✅ Xcode installed
- ✅ CocoaPods installed
- ✅ Capacitor iOS project configured
- ✅ App icon set up
- ✅ Dependencies installed

## Steps to Run on Your iPhone

### 1. Build and Sync (1 minute)

```bash
# In the quitflow directory
npm run build
npm run sync
```

This copies your web files to the iOS project.

### 2. Open in Xcode (30 seconds)

```bash
npx cap open ios
```

**IMPORTANT**: Make sure it opens `App.xcworkspace` (NOT `App.xcodeproj`)

### 3. Configure Code Signing (2 minutes - first time only)

1. In Xcode's left sidebar, click on the blue "App" project icon at the top
2. Select the "App" target (under TARGETS)
3. Click the "Signing & Capabilities" tab
4. Under "Team", select your Apple Developer account
   - If you don't see your account, click "Add Account..." and sign in with your Apple ID
   - You can use a free Apple ID for development (no paid account needed for testing)

Xcode will automatically create a provisioning profile.

### 4. Connect Your iPhone (1 minute)

1. Connect your iPhone to your Mac via USB
2. Unlock your iPhone
3. If prompted "Trust This Computer?", tap "Trust"
4. In Xcode's top toolbar, click the device selector (next to "App >")
5. Select your iPhone from the list

### 5. Run the App (1 minute)

1. Click the Play button (▶️) in Xcode's top left, or press `Cmd + R`
2. Xcode will build and install the app on your iPhone
3. **First time only**: On your iPhone, you'll see "Untrusted Developer"
   - Go to Settings > General > VPN & Device Management
   - Find your developer profile
   - Tap "Trust [Your Name]"
4. Launch the app again from your home screen

## Done! 🎉

Your app is now running on your iPhone!

## Making Changes

After you edit any files in `src/` or `index.html`:

```bash
# Rebuild and sync
npm run build
npx cap sync ios

# Then in Xcode, just click Run again (Cmd+R)
```

## Common Issues

### "Failed to install the app"
- Make sure your iPhone is unlocked
- Disconnect and reconnect your iPhone
- In Xcode: Product > Clean Build Folder (Cmd+Shift+K), then try again

### "Signing for 'App' requires a development team"
- You need to add your Apple ID in Xcode > Preferences > Accounts
- Then select it as the Team in Signing & Capabilities

### "No provisioning profiles found"
- Xcode should create one automatically
- If not, try changing the Bundle Identifier slightly in Signing & Capabilities
- Example: `com.quitflow.app` → `com.yourname.quitflow`

### Changes not showing up
```bash
npm run build
npx cap sync ios
# Then Product > Clean Build Folder in Xcode
# Then Run (Cmd+R)
```

## Next Steps

### Test on Simulator
Don't have an iPhone handy? Use the iOS Simulator:
1. In Xcode, select a simulator from the device menu (e.g., "iPhone 15 Pro")
2. Click Run (Cmd+R)

### TestFlight (Beta Testing)
Want to share with beta testers?
1. In Xcode: Product > Archive
2. Click "Distribute App"
3. Choose "App Store Connect"
4. Upload to TestFlight
5. Add testers in App Store Connect

### App Store Release
Ready to publish?
1. Create app in [App Store Connect](https://appstoreconnect.apple.com/)
2. Archive and upload (same as TestFlight)
3. Add screenshots, description, and metadata
4. Submit for review

## Tips

- **Live Reload**: For faster development, test in Safari first
  - Run `python3 -m http.server 8080`
  - Open http://localhost:8080 in Safari
  - Use Safari's Developer tools (Cmd+Option+I)

- **Debug on Device**:
  - In Safari: Develop > [Your iPhone] > index.html
  - This shows the console for the app running on your phone

- **Keep Xcode Updated**:
  - Regularly update via Mac App Store for latest iOS features

## Resources

- [Capacitor iOS Docs](https://capacitorjs.com/docs/ios)
- [Apple Developer Portal](https://developer.apple.com/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Xcode Documentation](https://developer.apple.com/xcode/)
