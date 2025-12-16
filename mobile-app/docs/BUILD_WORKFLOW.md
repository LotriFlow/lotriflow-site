# Build & Deploy Workflow

## Understanding Version vs Build Numbers

**Version Number (e.g., 1.0.6)**
- The public-facing version users see in App/Play Store
- Change this for new releases with features/fixes
- Format: `MAJOR.MINOR.PATCH` (e.g., 1.0.6)
- Examples:
  - `1.0.6` → `1.0.7` for bug fixes
  - `1.0.6` → `1.1.0` for new features
  - `1.0.6` → `2.0.0` for major updates

**Build Number (e.g., 11)**
- Internal counter for each build you create
- Increments automatically with each build
- Not visible to users
- Must always increase (App Store requirement)

## Recommended Workflow: Build Both Platforms

Use this command to build both iOS and Android with the **same build number**:

```bash
npm run sync:both
```

This command:
1. ✅ Bumps the build number (10 → 11)
2. ✅ Updates package.json and iOS/Android projects
3. ✅ Builds the web assets
4. ✅ Syncs to **both** iOS and Android

### Then build for each platform:

**iOS - Create Archive:**
1. Xcode will already be open (or open it manually)
2. Select "Any iOS Device" as target
3. Go to **Product → Archive**
4. Wait for archive to complete
5. In Organizer window, select your archive
6. Click **Distribute App**
7. Choose deployment method:
   - **TestFlight & App Store** for production
   - Follow the wizard to upload to App Store Connect

**Android - Create AAB:**
```bash
cd android && ./gradlew bundleRelease
```

The signed AAB will be at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

Upload this to Google Play Console → Internal testing

---

## Building Individual Platforms (No Version Bump)

If you've already bumped the version with `sync:both` and only need to rebuild one platform:

**iOS only:**
```bash
npm run sync:ios
```
- Builds and syncs iOS
- Opens Xcode
- Does NOT bump build number

**Android only:**
```bash
npm run sync:android
```
- Builds and syncs Android
- Does NOT bump build number

---

## Version Management

**Check current version:**
```bash
# Look at package.json
cat package.json | grep -E '(version|buildNumber)'
```

**Manually bump build number:**
```bash
npm run version:bump
```

**Set specific version:**
```bash
# Change version to 1.0.7
npm run version:set -- --version 1.0.7

# Set specific build number
npm run version:set -- --build 20

# Set both
npm run version:set -- --version 1.1.0 --build 25
```

---

## Complete Deployment Workflow

### For Internal Testing (TestFlight/Google Play Internal)

1. **Make your code changes**
2. **Build both platforms with same build number:**
   ```bash
   npm run sync:both
   ```
3. **Create iOS archive:**
   - In Xcode: Product → Archive
   - Upload to TestFlight
4. **Create Android AAB:**
   ```bash
   cd android && ./gradlew bundleRelease
   ```
   - Upload `android/app/build/outputs/bundle/release/app-release.aab` to Google Play Console
5. **Both platforms now have the same build number** ✅

### For Production Release

1. **Update version number** (e.g., 1.0.6 → 1.0.7):
   ```bash
   npm run version:set -- --version 1.0.7
   ```
2. **Follow the same steps as internal testing** (sync:both, archive, build AAB)
3. **Submit to stores:**
   - iOS: App Store Connect → Submit for Review
   - Android: Google Play Console → Production → Create Release

---

## Troubleshooting

**iOS and Android have different build numbers?**
- Make sure you used `npm run sync:both` instead of running sync:ios and sync:android separately
- Each command that includes version:bump will increment the build number

**Xcode shows old build number (e.g., Build 5)?**
- Those are old archives. Create a new archive (Product → Archive) to see the latest build number

**Archive not appearing in Xcode Organizer?**
- Make sure you selected "Any iOS Device" (not Simulator)
- Check for build errors in Xcode

**AAB not found after gradle build?**
- Make sure you ran `./gradlew bundleRelease` (not assembleRelease)
- Check `android/app/build/outputs/bundle/release/` directory

---

## Quick Reference

| Task | Command |
|------|---------|
| Build both platforms | `npm run sync:both` |
| iOS archive | Product → Archive in Xcode |
| Android AAB | `cd android && ./gradlew bundleRelease` |
| Bump build only | `npm run version:bump` |
| Change version | `npm run version:set -- --version X.Y.Z` |
| Check version | Look at `package.json` |

---

## Current Version Info

Check `package.json`:
- `"version"`: App version (e.g., "1.0.6")
- `"buildNumber"`: Build number (e.g., "11")

Both iOS and Android use these values from package.json.
