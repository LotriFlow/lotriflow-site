# 📱 App Store Connect Setup - Step by Step

Here's the complete setup guide for creating your in-app purchases in App Store Connect test environment:

### Your App Details
- **Bundle ID**: `com.lotriflow.quitcoach`
- **Products to Create**:
  - Monthly Subscription (with 7-day trial)
  - Lifetime Purchase

---

## Step 1: Access App Store Connect

1. Go to: https://appstoreconnect.apple.com
2. Sign in with your Apple Developer account
3. Click on **"My Apps"**
4. Find and click your **SmokeFree/LotriFlow Quit** app

---

## Step 2: Create Monthly Subscription (with 7-Day Trial)

### A. Navigate to In-App Purchases
1. In your app, click **"Features"** tab (top menu)
2. Click **"In-App Purchases"** in left sidebar
3. Click the **"+"** button to create new purchase

### B. Select Type
- Choose: **"Auto-Renewable Subscription"**
- Click **"Create"**

### C. Fill in Reference Information
```
Reference Name: QuitCoach Pro Monthly
Product ID: com.lotriflow.quitcoach.subscription.monthly
```
⚠️ **IMPORTANT**: This Product ID must match exactly what's in your code!

### D. Create Subscription Group
If you don't have one yet:
```
Subscription Group Name: QuitCoach Pro
```
- Select this group for your subscription

### E. Configure Subscription Duration
- **Subscription Duration**: 1 month

### F. Set Up Pricing

1. Click **"Subscription Prices"** section
2. Click **"Add Subscription Price"**
3. Select your countries/regions (e.g., United States, or All Countries)
4. Set price: **$0.99 USD** (or your preferred price)
5. Click **"Next"** → **"Add"**

### G. Add 7-Day Free Trial (Introductory Offer)

1. Scroll to **"Introductory Offers"** section
2. Click **"Set Up Introductory Offer"**
3. Configure:
   ```
   Type: Free
   Duration: 7 days

   Availability:
   ☑ New Subscribers
   ☐ Returning Subscribers
   ☐ Existing Subscribers

   Countries/Regions: Same as your subscription (e.g., United States)
   ```
4. Click **"Create"**

### H. Add Localization (App Store Display Info)

1. Under **"Subscription Display Name"**, click **"+"** to add localization
2. Select **"English (U.S.)"**
3. Fill in:
   ```
   Display Name: QuitCoach Pro

   Description:
   Unlock all premium features:
   • Advanced Analytics (14D/30D views)
   • Craving Tracker & Pattern Analysis
   • Share Progress Images
   • Sync & Backup Your Data
   • Future Premium Features

   7-day free trial, then $0.99/month. Cancel anytime.
   ```
4. Click **"Save"**

### I. Review Information

1. Scroll to **"Review Information"** section
2. Upload screenshot (optional - you can add later)
3. Click **"Save"** in top right

---

## Step 3: Create Lifetime Purchase

### A. Create New In-App Purchase
1. Back in **"In-App Purchases"**, click **"+"** again
2. Choose: **"Non-Consumable"**
3. Click **"Create"**

### B. Fill in Product Information
```
Reference Name: QuitCoach Pro Lifetime
Product ID: com.lotriflow.quitcoach.pro.lifetime
```
⚠️ **IMPORTANT**: This must match your code!

### C. Set Pricing
1. Click **"Pricing and Availability"** section
2. Set price: **$2.99 USD** (or your preferred price - typically $19.99-$49.99 for lifetime)
3. Select availability: All territories

### D. Add Localization
1. Under **"In-App Purchase Information"**, click **"+"**
2. Select **"English (U.S.)"**
3. Fill in:
   ```
   Display Name: QuitCoach Pro Lifetime

   Description:
   One-time payment for permanent access to all premium features:
   • Advanced Analytics (14D/30D views)
   • Craving Tracker & Pattern Analysis
   • Share Progress Images
   • Sync & Backup Your Data
   • All Future Premium Features

   Pay once, unlock forever. No recurring charges.
   ```
4. Click **"Save"**

### E. Review Information
1. Upload screenshot (optional)
2. Click **"Save"**

---

## Step 4: Submit for Review (Later)

**DON'T submit yet** - you can test in sandbox first!

When ready to submit:
1. Make sure both products show status: **"Ready to Submit"**
2. Click on each product → **"Submit for Review"**
3. Apple typically reviews IAP within 24-48 hours

---

## Step 5: Create Sandbox Test Account

### A. Create Sandbox Tester
1. In App Store Connect, click your name (top right)
2. **"Users and Access"** → **"Sandbox"** tab → **"Testers"**
3. Click **"+"** to add new tester
4. Fill in:
   ```
   First Name: Test
   Last Name: User
   Email: test.quitcoach@example.com (use a UNIQUE email - not your real one)
   Password: Create a strong password
   Country/Region: United States (or your region)
   ```
5. Click **"Invite"**

⚠️ **Note**: This email doesn't need to exist - it's only for sandbox testing

### B. Sign in to Sandbox on Device
1. On your **iPhone/iPad**:
   - Go to **Settings** → **App Store**
   - Scroll down to **"Sandbox Account"**
   - Tap **"Sign In"**
   - Enter your sandbox test account credentials

---

## Step 6: Configure RevenueCat

### A. Create RevenueCat Account
1. Go to: https://app.revenuecat.com
2. Sign up or log in
3. Click **"Create New Project"**
4. Name: **"LotriFlow Quit"** or **"SmokeFree"**

### B. Add iOS App
1. In your project, click **"Apps"**
2. Click **"+ New"**
3. Fill in:
   ```
   Platform: iOS
   App Name: LotriFlow Quit
   Bundle ID: com.lotriflow.quitcoach
   ```
4. Click **"Save"**

### C. Connect to App Store
1. Go to **"App settings"** → **"Apple App Store"**
2. You'll need to generate **App Store Connect API Key**:

   **In App Store Connect:**
   - Go to **Users and Access** → **Keys** → **App Store Connect API**
   - Click **"+"** to generate key
   - Name: "RevenueCat"
   - Access: **"Admin"** or **"App Manager"**
   - Download the `.p8` file
   - Copy **Issuer ID** and **Key ID**

3. **Back in RevenueCat:**
   - Upload the `.p8` file
   - Enter **Issuer ID** and **Key ID**
   - Click **"Save"**

### D. Import Products
1. In RevenueCat, go to **"Products"**
2. Click **"Import from App Store"**
3. Select:
   - `com.lotriflow.quitcoach.subscription.monthly`
   - `com.lotriflow.quitcoach.pro.lifetime`
4. Click **"Import"**

### E. Create Entitlement
1. Go to **"Entitlements"** tab
2. Click **"+ New"**
3. Create entitlement:
   ```
   Identifier: lotriflow_quit_pro
   Name: SmokeFree Pro Access
   ```
4. Click **"Save"**

### F. Attach Products to Entitlement
1. Click on your **"lotriflow_quit_pro"** entitlement
2. Under **"Products"**, click **"+ Attach"**
3. Select both:
   - Monthly subscription
   - Lifetime purchase
4. Click **"Save"**

### G. Create Offering
1. Go to **"Offerings"** tab
2. Click **"+ New"**
3. Create offering:
   ```
   Identifier: default
   Description: Default offering
   ```
4. Click **"Create"**
5. Add packages:
   - Click **"+ Add Package"**
   - **Monthly Package:**
     ```
     Identifier: monthly
     Product: com.lotriflow.quitcoach.subscription.monthly
     ```
   - Click **"+ Add Package"** again
   - **Lifetime Package:**
     ```
     Identifier: lifetime
     Product: com.lotriflow.quitcoach.pro.lifetime
     ```
6. Click **"Save"**

### H. Get Your API Key
1. In RevenueCat, go to **"API Keys"** (gear icon → Project Settings)
2. Copy your **iOS API Key** (starts with `appl_...`)
3. Keep this handy for the next step!

---

## Step 7: Update Your App Code

### A. Update RevenueCat API Key

Open `/Users/christolotriet/smokefree/src/app.js` and find line 6444:

**BEFORE:**
```javascript
await this.storeKit.configure({
  apiKey: 'test_sTOiTjYjhHoSKcsLsYDUcwHJJes',
  appUserID: null
});
```

**AFTER:**
```javascript
await this.storeKit.configure({
  apiKey: 'appl_YOUR_REVENUECAT_API_KEY_HERE', // ← Paste your key here
  appUserID: null
});
```

### B. Install Dependencies

```bash
cd /Users/christolotriet/smokefree
npm install

cd ios/App
pod install
```

---

## Step 8: Test Purchase Flow

### A. Build and Run
```bash
cd /Users/christolotriet/smokefree
npx cap sync ios
npx cap open ios
```

### B. Test on Device
1. **In Xcode:**
   - Select your physical device (not simulator - IAP doesn't work in simulator)
   - Click **Run** (▶️)

2. **In the app:**
   - Go to **Settings** → **Pro & Billing**
   - Click **"No Purchase"** test button (to ensure locked state)
   - You should see the **"PRO"** badge on "Sync & Backup"
   - Click **"Start 7-Day Free Trial"**

3. **Expected flow:**
   - Apple payment sheet appears
   - Shows: "SmokeFree Pro - $0.99/month after 7-day trial"
   - **[Environment: Sandbox]** indicator appears
   - Authenticate with Face ID/password
   - Purchase completes (no real charge!)
   - App shows: "Welcome to your 7-day free trial! 🏆"
   - Trial card appears showing countdown
   - PRO badge disappears from Sync & Backup
   - All Pro features unlock

### C. Test Lifetime Purchase
1. First, **delete and reinstall** the app (to reset purchase state)
2. Go to **Settings → Pro & Billing**
3. Click **"💎 $2.99 - Lifetime"** button
4. Complete sandbox purchase
5. Should show: "Welcome to Pro! Lifetime access unlocked! 🏆"
6. Lifetime card should appear

### D. Test Restore Purchases
1. **Delete and reinstall** the app
2. Go to **Settings → Pro & Billing**
3. Click **"Restore Purchases"**
4. Should restore your previous purchase
5. Pro features should unlock again

---

## Product IDs Summary

Make sure these match everywhere:

| Product | Product ID | Type | Price |
|---------|-----------|------|-------|
| **Monthly** | `com.lotriflow.quitcoach.subscription.monthly` | Subscription | $0.99/mo |
| **Lifetime** | `com.lotriflow.quitcoach.pro.lifetime` | Non-consumable | $2.99 |

**Code locations:**
- [src/app.js:6545-6546](src/app.js#L6545-L6546) - Product ID constants
- [src/app.js:6659-6661](src/app.js#L6659-L6661) - Monthly purchase lookup
- [src/app.js:6622-6624](src/app.js#L6622-L6624) - Lifetime purchase lookup

**RevenueCat:**
- Entitlement: `lotriflow_quit_pro`
- Offering: `default`
- Packages: `monthly`, `lifetime`

---

## Troubleshooting

### Products not showing in app?
- ✅ Wait 2-3 hours after creating in App Store Connect (Apple's servers sync)
- ✅ Make sure product IDs match exactly in code and App Store Connect
- ✅ Check sandbox account is signed in on device
- ✅ Try "Restore Purchases" button
- ✅ Check RevenueCat dashboard shows products as "Active"

### Trial not working?
- ✅ Make sure introductory offer is configured in App Store Connect
- ✅ Must be a NEW sandbox account (never purchased before)
- ✅ Check that offer duration is 7 days
- ✅ Delete app and try with fresh sandbox account

### "No offerings available" error?
- ✅ Check RevenueCat has imported products
- ✅ Check offering "default" exists with packages
- ✅ Verify entitlement is attached to products
- ✅ Wait a few minutes for RevenueCat to sync

### Purchase fails in sandbox?
- ✅ Make sure you're signed into sandbox account (Settings → App Store → Sandbox)
- ✅ NOT your real Apple ID
- ✅ Try logging out and back in to sandbox
- ✅ Check device has internet connection

### RevenueCat API error?
- ✅ Verify API key is correct (starts with `appl_`)
- ✅ Check bundle ID matches in RevenueCat dashboard
- ✅ Verify App Store Connect API key is uploaded to RevenueCat

---

## Checklist

Before going live:

- [ ] Products created in App Store Connect
- [ ] Sandbox test account created
- [ ] RevenueCat project configured
- [ ] Products imported to RevenueCat
- [ ] Entitlement created: `lotriflow_quit_pro`
- [ ] Offering created: `default`
- [ ] API key updated in code
- [ ] `pod install` completed
- [ ] Tested monthly subscription with trial in sandbox
- [ ] Tested lifetime purchase in sandbox
- [ ] Tested restore purchases in sandbox
- [ ] Trial countdown displays correctly
- [ ] Pro features unlock during trial
- [ ] Pro features unlock after lifetime purchase
- [ ] Products submitted for review in App Store Connect
- [ ] App build submitted with IAP capability

---

## Next Steps After Testing

1. **Submit products for review** in App Store Connect
2. **Submit app update** with IAP capability
3. **Monitor RevenueCat dashboard** for analytics
4. **Set up webhooks** (optional - for server-side events)

---

## Resources

- **App Store Connect**: https://appstoreconnect.apple.com
- **RevenueCat Dashboard**: https://app.revenuecat.com
- **Apple IAP Docs**: https://developer.apple.com/app-store/subscriptions/
- **RevenueCat Docs**: https://docs.revenuecat.com/docs/ios
- **RevenueCat Quickstart**: https://docs.revenuecat.com/docs/getting-started

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review RevenueCat logs in dashboard
3. Check Xcode console for error messages
4. Contact RevenueCat support: https://community.revenuecat.com

---

**Good luck with your launch! 🚀**
