# ⚠️ URGENT: App Name Change Required

## The Problem

**"QuitFlow" is already taken!**

There's an existing app on the iOS App Store: [Quit Smoking Tracker: QuitFlow](https://apps.apple.com/us/app/quit-smoking-tracker-quitflow/id6744414388)
- Developer: Borhan Uddin
- Status: Actively maintained (updated April 2025)
- Features: Very similar to your app

**Apple will reject your submission** if you use this name.

## ✅ Recommended Available Names

Based on market research, these names appear **AVAILABLE**:

### Top Recommendations

1. **ClearAir** ⭐ RECOMMENDED
   - Clean, modern, memorable
   - Easy to pronounce and spell
   - Available domain: clearair.app
   - Works well as: "ClearAir - Quit Smoking"

2. **FreshStart**
   - Motivational and positive
   - Broad appeal
   - Available domain: freshstart.app
   - Works well as: "FreshStart - Quit Smoking"

3. **SmokeFree Journey**
   - Descriptive and motivational
   - Note: "Smoke Free" (two words) is taken, but "SmokeFree Journey" is unique
   - Works well as: "SmokeFree Journey"

### Other Strong Options

4. **BreatheEasy** (two words)
   - Note: "BreathFree" (one word) is taken
   - Positive, health-focused
   - Domain: breathe-easy.app

5. **QuitTrack**
   - Tech-focused, simple
   - Domain: quittrack.app

6. **LastCig**
   - Bold, memorable
   - Domain: lastcig.app

7. **NoSmoke**
   - Direct, simple
   - Domain: nosmoke.app

## What Needs to Change

### 1. App Identifier (Bundle ID)
Currently: `com.quitflow.app`

**Recommended new identifiers:**
- `com.clearair.app` (for ClearAir)
- `com.freshstart.app` (for FreshStart)
- `com.smokefreej ourney.app` (for SmokeFree Journey)

### 2. Files to Update

```bash
# Capacitor configuration
capacitor.config.json

# iOS
ios/App/App.xcodeproj/project.pbxproj (via Xcode)
ios/App/App/Info.plist

# Android
android/app/build.gradle
android/app/src/main/AndroidManifest.xml
android/app/src/main/res/values/strings.xml

# Web/PWA
manifest.json
index.html (title tag)
```

### 3. Code Changes

Search and replace in these files:
- `src/app.js` - Storage keys, display names
- `index.html` - Title, meta tags
- `manifest.json` - name, short_name
- `README.md` - All documentation

## Step-by-Step Rebrand Process

### Option A: Automated (Recommended)

I can help you rename everything automatically. Just choose your new name and I'll update all files.

### Option B: Manual

1. **Choose new name** (e.g., ClearAir)

2. **Update Capacitor config**:
   ```json
   {
     "appId": "com.clearair.app",
     "appName": "ClearAir"
   }
   ```

3. **Update iOS bundle identifier** (in Xcode):
   - Open `ios/App/App.xcworkspace`
   - Select project > Target > General
   - Change Bundle Identifier to `com.clearair.app`

4. **Update Android**:
   - Edit `android/app/build.gradle` - change applicationId
   - Edit `android/app/src/main/AndroidManifest.xml` - change package
   - Rename package folders in `android/app/src/main/java/`

5. **Update web/PWA**:
   - `manifest.json` - change name and short_name
   - `index.html` - change title

6. **Update storage keys** in `src/app.js`:
   ```javascript
   // Change from:
   await Storage.get({ key: "quitflow_state" })

   // To:
   await Storage.get({ key: "clearair_state" })
   ```

7. **Rebuild and resync**:
   ```bash
   npm run build
   npx cap sync
   ```

## Domain Availability

If you want a website for your app:

| Name | Domain | Status |
|------|--------|--------|
| ClearAir | clearair.app | Likely available |
| FreshStart | freshstart.app | Likely available |
| SmokeFree Journey | smokefreej ourney.app | Likely available |
| BreatheEasy | breathe-easy.app | Likely available |

## Trademark Considerations

Before finalizing your choice:

1. **Search USPTO**: https://tmsearch.uspto.gov/
   - Check if name is trademarked
   - File trademark if you plan to protect it

2. **Google the name**: Make sure it's not too generic or confusing

3. **Check social media**: Ensure @clearair or similar handles are available

## App Store Listing Examples

### Example: ClearAir

**Full Name**: ClearAir - Quit Smoking
**Short Name**: ClearAir
**Subtitle**: Track Your Smoke-Free Journey
**Keywords**: quit smoking, stop smoking, cigarette tracker, smoke free, clear air, health

### Example: FreshStart

**Full Name**: FreshStart - Quit Smoking
**Short Name**: FreshStart
**Subtitle**: Your New Beginning Starts Now
**Keywords**: quit smoking, fresh start, stop smoking, cigarette tracker, smoke free

## My Recommendation

**Choose: ClearAir** ⭐

**Why:**
- Short, memorable, easy to spell
- Positive health association
- Not taken on App Store
- Good SEO potential
- Works internationally
- Professional sounding

## Next Steps

1. **Decide on name** (today)
2. **Let me know your choice** - I'll help rename everything
3. **Update all files** (30 minutes)
4. **Test the app** (verify everything works)
5. **Commit changes** (save the rebrand)
6. **Proceed with App Store submission**

## Sources

- [Existing QuitFlow app](https://apps.apple.com/us/app/quit-smoking-tracker-quitflow/id6744414388)
- [BreathFree app](https://apps.apple.com/us/app/breathfree/id1485731767)
- [Smoke Free apps](https://apps.apple.com/us/app/smoke-free-quit-smoking-now/id577767592)
- [USPTO Trademark Search](https://tmsearch.uspto.gov/)
- [Apple's App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)

---

**Action Required**: Choose a new name ASAP so we can rebrand before your first submission!
