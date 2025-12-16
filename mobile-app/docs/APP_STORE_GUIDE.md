# App Store Deployment Guide

This guide explains how to build **QuitFlow** for the Google Play Store (Android) and Apple App Store (iOS) using **Capacitor**.

## Prerequisites

- **Node.js** installed.
- **Android Studio** (for Android builds).
- **Xcode** (for iOS builds - **Mac Only**).

## 1. Prepare the Build

Before building for mobile, you must build the web assets.

```bash
npm run build
```

This creates a `dist/` folder with your app files.

## 2. Sync with Capacitor

Whenever you build the web app or install new plugins, sync them to the native projects:

```bash
npx cap sync
```

## 3. Android Build (Google Play)

1.  **Open Android Project**:

    ```bash
    npx cap open android
    ```

    This will launch Android Studio.

2.  **Run on Device/Emulator**:

    - Select your device or emulator in Android Studio.
    - Click the **Run** (Play) button.

3.  **Build for Release (APK/Bundle)**:
    - Go to **Build > Generate Signed Bundle / APK**.
    - Select **Android App Bundle** (for Play Store) or **APK** (for sideloading).
    - Create a new keystore (keep it safe!) and follow the wizard.
    - Upload the generated `.aab` file to the Google Play Console.

## 4. iOS Build (Apple App Store)

> **Note**: This requires a Mac with Xcode installed.

1.  **Add iOS Platform** (if not done):

    ```bash
    npx cap add ios
    ```

2.  **Open iOS Project**:

    ```bash
    npx cap open ios
    ```

    This will launch Xcode.

3.  **Configure Signing**:

    - Click on the **App** project in the left navigator.
    - Go to **Signing & Capabilities**.
    - Select your Apple Developer Team.

4.  **Build and Archive**:
    - Select **Product > Archive**.
    - Once archived, the Organizer window will open.
    - Click **Distribute App** to upload to App Store Connect.

## Troubleshooting

- **"WebDir not found"**: Ensure you ran `npm run build` and the `dist/` folder exists.
- **Icon Updates**: If you change icons in `assets/`, you may need to use a tool like `@capacitor/assets` to generate native icons.
