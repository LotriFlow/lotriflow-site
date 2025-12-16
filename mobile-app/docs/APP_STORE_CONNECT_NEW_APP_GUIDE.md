# 🚀 Creating Your New App in App Store Connect

## Prerequisites
- Apple Developer account enrolled (paid $99/year)
- Bundle ID: `com.lotriflow.quitcoach`
- App Name: **LotriFlow Quit Pro** (or your preferred name)

---

## Step 1: Log into App Store Connect

1. Go to: **https://appstoreconnect.apple.com**
2. Sign in with your Apple ID (the one enrolled in Apple Developer Program)
3. Wait for the dashboard to load

---

## Step 2: Navigate to Apps Section

1. On the main dashboard, click **"My Apps"**
2. You'll see a list of your apps (probably empty if this is your first)

---

## Step 3: Create New App

1. Click the **"+"** button (top left, next to "My Apps")
2. Select **"New App"** from dropdown

---

## Step 4: Fill in App Information

You'll see a form with several fields. Fill them out carefully:

### **A. Platforms**
- ✅ Check **iOS**
- ☐ Leave macOS, tvOS, visionOS unchecked (unless you want those too)

### **B. Name**
```
LotriFlow Quit Pro
```
⚠️ **Note**: This is your public App Store name (30 characters max)
- Must be unique across the entire App Store
- If taken, try: "LotriFlow Quit", "Quit Coach", "LotriFlow Quit Coach"

### **C. Primary Language**
```
English (U.S.)
```

### **D. Bundle ID**
1. Click the **dropdown menu**
2. Look for: `com.lotriflow.quitcoach`

**❌ If you DON'T see it in the dropdown:**
You need to register it first:

1. Click **"Register a new bundle ID"** (link below dropdown)
2. OR go to: **https://developer.apple.com/account/resources/identifiers/list**
3. Click **"+"** button
4. Select **"App IDs"** → **"Continue"**
5. Select **"App"** → **"Continue"**
6. Fill in:
   ```
   Description: LotriFlow Quit Coach
   Bundle ID: Explicit
   Bundle ID: com.lotriflow.quitcoach
   ```
7. **Capabilities** - Check these:
   - ✅ **In-App Purchase**
   - ✅ **Push Notifications** (if you plan to use them)
   - ✅ Any other capabilities your app needs
8. Click **"Continue"** → **"Register"**
9. Go back to App Store Connect and refresh - it should now appear

**✅ Select**: `com.lotriflow.quitcoach`

### **E. SKU**
```
LOTRIFLOW-QUIT-001
```
⚠️ **What is SKU?**
- Internal identifier (YOU choose it, users never see it)
- Can be anything unique (letters, numbers, dashes)
- Can't be changed later
- Used for your own tracking/reporting

### **F. User Access**
```
● Full Access (recommended)
```
This lets all team members access the app.

---

## Step 5: Review and Create

1. Double-check all fields:
   - Platform: iOS ✅
   - Name: LotriFlow Quit Pro
   - Language: English (U.S.)
   - Bundle ID: com.lotriflow.quitcoach
   - SKU: LOTRIFLOW-QUIT-001
   - User Access: Full Access

2. Click **"Create"** button (bottom right)

---

## Step 6: Initial Setup (You'll Be Redirected)

After clicking Create, you'll land on your app's dashboard. Don't panic - there's a lot of red "Missing" warnings. This is normal!

### **What You'll See:**
- 🔴 Missing Screenshots
- 🔴 Missing App Icon
- 🔴 Missing Privacy Policy URL
- 🔴 Missing Description
- 🔴 Missing App Store Information

**Don't fill these out yet!** We'll do this when you're ready to submit.

---

## Step 7: Verify Bundle ID in Xcode (Important!)

Before proceeding, make sure Xcode knows about your new Bundle ID:

1. Open your project:
   ```bash
   cd /Users/christolotriet/smokefree
   npx cap open ios
   ```

2. In Xcode, select the **"App"** target (left sidebar)

3. Go to **"Signing & Capabilities"** tab

4. Check that:
   - **Bundle Identifier** = `com.lotriflow.quitcoach`
   - **Team** = Your Apple Developer team (select from dropdown)
   - **Signing Certificate** = "Apple Development" or "Apple Distribution"

5. If you see errors like "Failed to register bundle identifier":
   - Make sure you completed Step 4D above (registering the Bundle ID)
   - Select your Team again from dropdown
   - Click "Try Again"

---

## Step 8: What's Next?

Now that your app exists in App Store Connect, you can:

### ✅ **Immediate Next Steps:**
1. **Create In-App Purchases** (Step 2 of your payment guide)
2. **Set up RevenueCat** (Step 6 of your payment guide)
3. **Create Sandbox test account** (Step 5 of your payment guide)

### 📦 **Before First Submission:**
1. Build your app in Xcode (Archive)
2. Upload build via Xcode or Transporter
3. Add screenshots, description, keywords
4. Set up pricing & availability
5. Submit for review

---

## Step 9: Enable In-App Purchases Capability

Since you'll be adding IAP, let's enable that capability now:

### **In App Store Connect:**
1. Go to your app → **"Features"** tab (top menu)
2. You should see **"In-App Purchases"** in left sidebar
3. This confirms IAP capability is ready

### **In Xcode:**
1. Make sure Xcode project is open
2. Select **"App"** target
3. Go to **"Signing & Capabilities"** tab
4. Click **"+ Capability"** button
5. Search for and add: **"In-App Purchase"**
6. Save (Cmd+S)

---

## Troubleshooting

### "Bundle ID already in use"
- Someone else registered `com.lotriflow.quitcoach`
- You need to use a different one, like:
  - `com.lotriflow.quit`
  - `com.lotriflow.quitcoachapp`
  - `com.yourname.quitcoach`

### "Bundle ID doesn't appear in dropdown"
- Make sure you registered it at developer.apple.com (Step 4D)
- Wait 5-10 minutes and refresh App Store Connect
- Clear browser cache and try again

### "Name is already taken"
- App Store names must be globally unique
- Try variations:
  - "LotriFlow Quit"
  - "Quit Coach by LotriFlow"
  - "LotriFlow Smoking Quit"
  - "My Quit Coach"

### "Can't select team in Xcode"
- Make sure you're logged into Xcode with your Apple ID:
  - Xcode → Settings → Accounts
  - Add your Apple ID if not present
  - Download Manual Profiles

---

## Summary Checklist

- [ ] Logged into App Store Connect
- [ ] Clicked "My Apps" → "+" → "New App"
- [ ] Selected iOS platform
- [ ] Entered app name: "LotriFlow Quit Pro"
- [ ] Selected primary language: English (U.S.)
- [ ] Registered Bundle ID: `com.lotriflow.quitcoach`
- [ ] Selected Bundle ID from dropdown
- [ ] Entered SKU: `LOTRIFLOW-QUIT-001`
- [ ] Clicked "Create"
- [ ] Verified Bundle ID in Xcode
- [ ] Enabled In-App Purchase capability in Xcode
- [ ] Ready to create In-App Purchases!

---

## Next Document

Once you complete this, proceed to:
- **[STEP_BY_STEP_PAYMENT_GATE.md](./STEP_BY_STEP_PAYMENT_GATE.md)** - Step 2 (Create In-App Purchases)

---

## Quick Reference

| Field | Value |
|-------|-------|
| **Platform** | iOS |
| **App Name** | LotriFlow Quit Pro |
| **Bundle ID** | com.lotriflow.quitcoach |
| **SKU** | LOTRIFLOW-QUIT-001 |
| **Language** | English (U.S.) |
| **Capabilities** | In-App Purchase |

---

**You're ready to create your app! 🎉**

If you get stuck at any step, take a screenshot and I can help you troubleshoot.
