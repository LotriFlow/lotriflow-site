# SmokeFree - Deployment & Hosting Documentation

## Overview
SmokeFree is a multi-platform quit smoking application built with Capacitor, supporting web, iOS, and Apple Watch.

---

## 🌐 Web Hosting

### Production Web App
- **URL**: https://jolly-rock-0c743e510.3.azurestaticapps.net/
- **Platform**: Azure Static Web Apps
- **Region**: Deployed via Azure
- **Auto-deploy**: Yes (on push to `main` branch)

### Deployment Process
1. **Source**: `/index.html`, `/src/app.js`, `/assets/`, etc.
2. **Build**: `npm run build` → outputs to `/dist/`
3. **Deploy**: GitHub Actions workflow automatically deploys `/dist/` to Azure
4. **Workflow**: `.github/workflows/azure-static-web-apps-jolly-rock-0c743e510.yml`

### Build Configuration
- **Build Script**: `scripts/build.js`
- **Output Directory**: `/dist/`
- **Service Worker**: `/sw.js` (for PWA support)
- **Manifest**: `/manifest.json`

---

## 📱 iOS App

### App Store Details
- **Bundle ID**: `com.lotriflow.smokefree`
- **Display Name**: SmokeFree Journey by Lotriflow
- **Platform**: iOS 14.0+
- **Distribution**: Not yet published

### Build Location
- **Xcode Project**: `/ios/App/App.xcodeproj`
- **Main Target**: `App`
- **Code Location**: `/ios/App/App/`
- **Assets**: `/ios/App/App/Assets.xcassets/`

### Native Plugins
- **Location**: `/ios/App/App/`
- **ProAccessPlugin**: In-App Purchase handling (`ProAccessPlugin.swift`)
- **WatchBridgePlugin**: Watch connectivity (`WatchBridgePlugin.swift`)
- **WatchSessionManager**: Watch sync (`WatchSessionManager.swift`)

### Icons
- **Main App Icon**: `/ios/App/App/Assets.xcassets/AppIcon.appiconset/appicon-1024.png`
- **Design**: Blue gradient breath/wind waves (from `smokefree-icon.svg`)

---

## ⌚ Apple Watch App

### Watch App Details
- **Bundle ID**: `com.lotriflow.smokefree.watchkitapp`
- **Display Name**: SmokeFree
- **Platform**: watchOS 11.0+
- **Embedded in**: iOS App bundle at `App.app/Watch/`

### Build Location
- **Target**: `SmokeFreeWatch Watch App`
- **Code Location**: `/ios/App/SmokeFreeWatch Watch App/`
- **Assets**: `/ios/App/SmokeFreeWatch Watch App/Assets.xcassets/`

### Icons
- **Icon Location**: `/ios/App/SmokeFreeWatch Watch App/Assets.xcassets/AppIcon.appiconset/`
- **Sizes**: 48, 55, 58, 66, 80, 87, 88, 92, 100, 102, 108, 120, 172, 180, 196, 216, 234, 258, 1024px
- **Design**: Same blue gradient breath/wind waves as iOS app

### Installation
- **Method**: Automatic when iOS app is deployed to device via Xcode
- **Cannot**: Manually install via Watch app on iPhone
- **Sync**: Uses WatchConnectivity framework for real-time data sync

---

## 🗂️ Project Structure

```
smokefree/
├── index.html                      # Main web app entry point
├── src/
│   └── app.js                      # Main application logic
├── assets/                         # Images, icons, styles
│   └── smokefree-icon.svg         # Source icon design
├── dist/                          # Built web app (generated)
│   ├── index.html
│   ├── src/app.js
│   └── assets/
├── ios/
│   └── App/
│       ├── App.xcodeproj          # Xcode project
│       ├── App/                   # iOS app code
│       │   ├── AppDelegate.swift
│       │   ├── WatchBridgePlugin.swift
│       │   ├── WatchSessionManager.swift
│       │   ├── ProAccessPlugin.swift
│       │   └── Assets.xcassets/
│       │       └── AppIcon.appiconset/
│       ├── SmokeFreeWatch Watch App/  # Watch app code
│       │   └── Assets.xcassets/
│       │       └── AppIcon.appiconset/
│       └── Podfile                # CocoaPods dependencies
├── .github/
│   └── workflows/
│       └── azure-static-web-apps-jolly-rock-0c743e510.yml
├── staticwebapp.config.json       # Azure SWA configuration
├── capacitor.config.json          # Capacitor configuration
└── package.json                   # Node dependencies
```

---

## 🔑 Configuration Files

### Azure Static Web Apps
- **File**: `staticwebapp.config.json`
- **Purpose**:
  - Route configuration
  - Cache headers
  - Security headers
  - SPA fallback routing

### Capacitor
- **File**: `capacitor.config.json`
- **Purpose**:
  - App ID: `com.lotriflow.smokefree`
  - App name configuration
  - Web directory: points to `/dist/`

### iOS CocoaPods
- **File**: `/ios/App/Podfile`
- **Dependencies**:
  - Capacitor core
  - Capacitor Haptics
  - Capacitor Local Notifications
  - Capacitor Preferences
- **Post-install**: Fixes Xcode 16.4 compatibility (version 70 → 60)

---

## 🚀 Deployment Workflows

### Web Deployment (Azure)
**Trigger**: Push to `main` branch or pull request

**Steps**:
1. GitHub Actions checks out code
2. Runs `npm ci` to install dependencies
3. Runs `npm run build` to build to `/dist/`
4. Deploys `/dist/` to Azure Static Web Apps
5. Updates live site at https://jolly-rock-0c743e510.3.azurestaticapps.net/

**Required Secret**: `AZURE_STATIC_WEB_APPS_API_TOKEN_JOLLY_ROCK_0C743E510`

### iOS Deployment
**Method**: Manual via Xcode

**Steps**:
1. Run `npm run build` to update web assets
2. Run `npx cap copy ios` to copy web assets to iOS
3. Open `/ios/App/App.xcodeproj` in Xcode
4. Select target device (iPhone or Simulator)
5. Build and Run (⌘R)
6. Watch app installs automatically with iOS app

---

## 🔧 Build Commands

### Web App
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Output: /dist/
```

### iOS App
```bash
# Build web assets
npm run build

# Copy to iOS
npx cap copy ios

# Open in Xcode
npx cap open ios

# Or manually: open ios/App/App.xcodeproj
```

### CocoaPods (iOS)
```bash
cd ios/App
pod install
```

---

## 📊 Asset Generation

### App Icons
**Source**: `/dist/assets/smokefree-icon.svg`

**Generation Script**: `/generate_icons.sh`
- Converts SVG to PNG at various sizes
- Outputs to `/ios_icons/` directory
- Manual copy to iOS and Watch app asset catalogs

**Sizes Generated**:
- iOS: 20, 29, 40, 58, 60, 76, 80, 87, 152, 167, 180, 1024px
- watchOS: 48, 55, 58, 66, 80, 87, 88, 92, 100, 102, 108, 120, 172, 180, 196, 216, 234, 258, 1024px

---

## 🔐 Secrets & Environment Variables

### GitHub Secrets (Required)
- `AZURE_STATIC_WEB_APPS_API_TOKEN_JOLLY_ROCK_0C743E510`
  - **Purpose**: Azure deployment authentication
  - **Obtain from**: Azure Portal → Static Web App → Manage deployment token

---

## 📝 Version Control

### Repository
- **Platform**: GitHub
- **Organization**: LotriFlow
- **Repository**: smokefree
- **URL**: https://github.com/LotriFlow/smokefree
- **Default Branch**: `main`

### Ignored Files
- `/dist/` - Built files (generated during deployment)
- `/node_modules/` - npm dependencies
- `/ios/App/Pods/` - CocoaPods dependencies
- `.DS_Store` - macOS system files

---

## 🐛 Known Issues & Fixes

### Xcode 16.4 Compatibility
- **Issue**: CocoaPods fails with "Unable to find compatibility version string for object version 70"
- **Fix**: Post-install hook in Podfile automatically downgrades project format from version 70 to 60
- **File**: `/ios/App/Podfile` (lines 24-38)

### watchOS Deployment Target
- **Issue**: Was incorrectly set to 26.1 (iOS version numbering)
- **Fix**: Changed to 11.0 (correct watchOS version)
- **File**: `/ios/App/App.xcodeproj/project.pbxproj`

---

## 📞 Support & Resources

### Documentation
- Capacitor: https://capacitorjs.com/docs
- Azure Static Web Apps: https://learn.microsoft.com/en-us/azure/static-web-apps/
- WatchConnectivity: https://developer.apple.com/documentation/watchconnectivity

### Development Team
- **Developer**: LotriFlow
- **Team ID**: 99FU4M3FU2

---

## 🔄 Last Updated
December 3, 2025

**Recent Changes**:
- Added Azure Static Web Apps workflow
- Fixed watchOS deployment target (26.1 → 11.0)
- Updated app icons with breath/wind waves design
- Added WatchBridge plugin for Watch app status checks
- Removed unused Watch installation UI
