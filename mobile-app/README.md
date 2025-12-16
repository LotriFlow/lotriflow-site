# lotriflow SmokeFree

**Go smoke-free with lotriflow.**

A modern quit smoking app built with Capacitor, helping users track their journey to a smoke-free life. Part of the lotriflow health suite.

## Features

- Real-time smoke-free timer with visual progress
- Daily limit tracking and cigarette logging
- Comprehensive statistics and reports
- Achievement badges and milestones
- AI coach with personalized messages
- Breathing exercises (4-7-8 technique)
- Dark/Light mode support
- Money saved calculator
- Push notifications (toast reminders today, native push planned)
- PWA support for web installation
- Native iOS and Android apps

## Upcoming Features

- Background interval alerts with native sound/vibration even when the app is closed
- Watch goal haptics when the interval completes without the phone foregrounded

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Mobile**: Capacitor 7.4.4
- **Storage**: Capacitor Preferences API (native) / LocalStorage (web)
- **PWA**: Service Worker for offline support

## Prerequisites

### For Web Development
- Node.js 16+ and npm
- Modern web browser

### For iOS Development
- macOS
- Xcode 14+ (available from Mac App Store)
- CocoaPods (`sudo gem install cocoapods`)
- Active Apple Developer account (for device testing/App Store)

### For Android Development
- Android Studio
- JDK 17+
- Android SDK 33+

## Installation

```bash
# Clone the repository
git clone https://github.com/lotriet/lotriflow-smokefree.git
cd yeka

# Install dependencies
npm install

# Build the web assets
npm run build

# Sync to native platforms
npm run sync
```

## Development

### Web Development

```bash
# Start a local server
python3 -m http.server 8080

# Or use any other local server
# The app will be available at http://localhost:8080
```

### iOS Development

1. **Build and sync**:
   ```bash
   npm run build
   npm run sync
   ```

2. **Open in Xcode**:
   ```bash
   npx cap open ios
   ```
   Or manually open `ios/App/App.xcworkspace` (NOT App.xcodeproj!)

3. **Configure signing**:
   - In Xcode, select the project in the navigator
   - Select the "App" target
   - Go to "Signing & Capabilities"
   - Select your Team (Apple Developer account)
   - Xcode will automatically create a provisioning profile

4. **Run on simulator**:
   - Select a simulator device from the toolbar (e.g., "iPhone 15 Pro")
   - Click the Play button or press Cmd+R

5. **Run on physical device**:
   - Connect your iPhone via USB
   - Select your device from the toolbar
   - Click the Play button
   - If prompted, trust the developer certificate on your iPhone (Settings > General > VPN & Device Management)

> **Haptics dependency**: To enable vibration feedback (interval alerts, test button), install the Capacitor Haptics plugin once:
> ```bash
> npm install @capacitor/haptics
> npm run build && npx cap sync ios
> ```
> Without this plugin the vibration test will report "not supported."

### Android Development

1. **Build and sync**:
   ```bash
   npm run build
   npm run sync
   ```

2. **Open in Android Studio**:
   ```bash
   npx cap open android
   ```
   Or manually open the `android` folder in Android Studio

3. **Run on emulator or device**:
   - Select a device/emulator from the toolbar
   - Click the Run button or press Shift+F10

## Project Structure

```
quitflow/
├── src/
│   ├── app.js          # Main application logic
│   └── styles.css      # Styling and themes
├── assets/
│   ├── icons/          # App icons
│   └── logo.png        # Logo image
├── ios/
│   └── App/            # iOS Xcode project
├── android/
│   └── app/            # Android project
├── dist/               # Build output (generated)
├── scripts/
│   └── build.js        # Build script
├── index.html          # Main HTML file
├── manifest.json       # PWA manifest
├── sw.js              # Service worker
└── capacitor.config.json  # Capacitor configuration
```

## Building for Production

### iOS

1. **Prepare for release**:
   ```bash
   npm run build
   npx cap sync ios
   ```

2. **In Xcode**:
   - Select "Any iOS Device (arm64)" as the build target
   - Go to Product > Archive
   - Once archived, click "Distribute App"
   - Choose "App Store Connect"
   - Follow the wizard to upload to TestFlight/App Store

3. **App Store submission**:
   - Go to [App Store Connect](https://appstoreconnect.apple.com/)
   - Create a new app listing
   - Fill in metadata, screenshots, description
   - Submit for review

### Android

1. **Prepare for release**:
   ```bash
   npm run build
   npx cap sync android
   ```

2. **In Android Studio**:
   - Go to Build > Generate Signed Bundle / APK
   - Select "Android App Bundle" (recommended for Play Store)
   - Create or use existing keystore
   - Select "release" build variant
   - Sign and build

3. **Play Store submission**:
   - Go to [Google Play Console](https://play.google.com/console)
   - Create a new app
   - Upload the AAB file
   - Fill in store listing details
   - Submit for review

### Web (PWA)

Deploy the contents of the root directory to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting
- Cloudflare Pages

The app includes a service worker and manifest for PWA functionality.

## Common Commands

```bash
# Build web assets
npm run build

# Sync to native platforms
npm run sync

# Open in Xcode
npx cap open ios

# Open in Android Studio
npx cap open android

# Update Capacitor
npx cap sync

# Add a Capacitor plugin
npm install @capacitor/[plugin-name]
npx cap sync
```

## Troubleshooting

### iOS Issues

**Pod install errors**:
```bash
cd ios/App
pod install --repo-update
cd ../..
```

**Build errors in Xcode**:
- Product > Clean Build Folder (Cmd+Shift+K)
- Delete `ios/App/Pods` and `ios/App/Podfile.lock`
- Run `npx cap sync ios` again

**Code signing issues**:
- Ensure you're logged into Xcode with your Apple ID
- Go to Xcode > Preferences > Accounts
- Download manual provisioning profiles if needed

### Android Issues

**Gradle sync errors**:
- File > Invalidate Caches / Restart
- Ensure Android SDK is up to date

**Build errors**:
- Check that JDK 17 is installed and configured
- Update Gradle wrapper if needed

### General Issues

**Changes not appearing**:
```bash
npm run build
npx cap sync
# Then rebuild in Xcode/Android Studio
```

**Storage not persisting**:
- Check that Capacitor Preferences plugin is installed
- Web version uses localStorage as fallback

## Configuration

### App Metadata
Edit `capacitor.config.json`:
```json
{
  "appId": "com.quitflow.app",
  "appName": "QuitFlow",
  "webDir": "dist"
}
```

### iOS Specific
Edit `ios/App/App/Info.plist` for permissions and settings.

### Android Specific
Edit `android/app/src/main/AndroidManifest.xml` for permissions.
Edit `android/app/build.gradle` for version codes and signing.

## App Store Requirements

### iOS App Store
- App icon (1024x1024px)
- Screenshots (iPhone 6.7", 6.5", 5.5")
- Privacy Policy URL
- App description and keywords
- Age rating
- Test account (if login required)

### Google Play Store
- App icon (512x512px)
- Feature graphic (1024x500px)
- Screenshots (phone and tablet)
- Privacy Policy URL
- App description
- Content rating questionnaire
- Test account (if login required)

## Privacy & Permissions

QuitFlow stores all data locally on the device. No data is sent to external servers.

### iOS Permissions
- None required (app uses local storage only)

### Android Permissions
- None required (app uses local storage only)

## Testing

### Manual Testing Checklist
- [ ] Add cigarette log entry
- [ ] Timer counts up correctly
- [ ] Daily limit tracking works
- [ ] Statistics calculate correctly
- [ ] Achievements unlock properly
- [ ] Dark/Light mode switches
- [ ] App works offline
- [ ] Data persists after app restart
- [ ] Reset functionality works
- [ ] Share functionality works

### TestFlight (iOS)
1. Archive in Xcode
2. Upload to App Store Connect
3. Go to TestFlight tab
4. Add internal/external testers
5. Distribute build

### Internal Testing (Android)
1. Upload AAB to Play Console
2. Create internal testing track
3. Add test users
4. Testers can install via Play Store

## Disclaimer

**Important:** lotriflow SmokeFree is not medical advice and does not guarantee success in quitting smoking. Results may vary, and quitting smoking can have serious health implications. Consult a healthcare professional before making changes to your health habits. lotriflow is not responsible for any loss, harm, or outcomes resulting from the use of this app. Use at your own risk.

For full terms, see [Terms of Service](terms.html) and [Privacy Policy](privacy.html).

## License

ISC

## Support

For issues and feature requests, please open an issue on [GitHub](https://github.com/lotriet/lotriflow-smokefree) or contact us at me@lotriflow.com.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
