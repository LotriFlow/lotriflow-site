# Quick Guide: Update iOS Bundle Identifier in Xcode

**Time Required**: 2 minutes
**Goal**: Change bundle ID from `com.quitflow.app` to `za.co.yeka`

---

## Steps (Follow Along):

### 1. In Xcode (should be opening now):

Look at the **left sidebar** (Project Navigator):
```
📁 App
  📁 App
  📁 Pods
  📄 Podfile
```

### 2. Click on the **BLUE "App" icon** at the very top
   - It's the first item with a blue app icon
   - This opens the project settings

### 3. You'll see two sections:
   - **PROJECT**: App
   - **TARGETS**: App ← **Click this one!**

### 4. Make sure you're on the **"Signing & Capabilities"** tab
   - It's in the top menu bar of the main panel
   - Other tabs: General | Signing & Capabilities | Resource Tags | Info | Build Settings...

### 5. Find the **"Bundle Identifier"** field
   - Current value: `com.quitflow.app`
   - **Click in the field and change it to**: `za.co.yeka`

### 6. If you see a **"Team"** dropdown above it:
   - Select your Apple Developer account
   - If not logged in: Xcode > Preferences > Accounts > Add your Apple ID

### 7. Xcode will automatically update the provisioning profile
   - You might see a warning, then a checkmark ✓
   - This is normal - Xcode is creating a new profile

### 8. **Optional but Recommended**: Update Display Name
   - Click the **"General"** tab (next to Signing & Capabilities)
   - Find **"Display Name"** field
   - Change from `App` to `Yeka`
   - This is what users see on their home screen

### 9. **Clean and Build**:
   - Menu: Product > Clean Build Folder (or press `Cmd + Shift + K`)
   - Menu: Product > Build (or press `Cmd + B`)
   - Wait for build to complete (watch progress bar at top)

### 10. **Test Run**:
   - Select a simulator from the device menu (e.g., "iPhone 15 Pro")
   - Click the **Play button** ▶️ (or press `Cmd + R`)
   - App should launch with the name "Yeka"

---

## Troubleshooting:

### ❌ "Failed to create provisioning profile"
**Solution**:
- Make sure you're logged into Xcode with your Apple ID
- Go to Xcode > Preferences > Accounts
- Click "+" and add your Apple ID
- Select it in the "Team" dropdown

### ❌ "Bundle identifier already in use"
**Solution**:
- This shouldn't happen with `za.co.yeka` (it's unique)
- If it does, try: `za.co.yeka.app` or `com.yourname.yeka`

### ❌ "Signing certificate error"
**Solution**:
- This is usually auto-fixed by Xcode
- Try: Check "Automatically manage signing"
- Xcode will handle the rest

---

## What You Should See:

**Before**:
```
Bundle Identifier: com.quitflow.app
Display Name: App
```

**After**:
```
Bundle Identifier: za.co.yeka
Display Name: Yeka
```

---

## ✅ Done!

Once you see the build succeed (green checkmark), you're done!

The iOS app is now branded as **Yeka** with the correct bundle identifier.

---

**Next**: Run the app on your iPhone to test!

```bash
# Just plug in your iPhone and select it from the device menu in Xcode
# Then click the Play button
```

---

**Need help?**
- Xcode is opening in the background
- Look for the window that just opened
- Follow the steps above

**Can't find something?**
- Make sure you clicked the BLUE "App" icon (not the folder)
- Make sure you selected "App" under TARGETS (not PROJECT)
- Make sure you're on "Signing & Capabilities" tab
