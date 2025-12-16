# IAP Metadata Requirements - Next Steps

**Date:** December 10, 2025
**Status:** IAPs created but not yet testable - missing metadata

---

## Current Situation

✅ **Completed:**
- Products created in App Store Connect
- Products added to RevenueCat
- API keys generated and uploaded to RevenueCat
- Entitlements and Offerings configured
- StoreKit Configuration removed from Xcode scheme

❌ **Issue:**
- Both products show "Ready to Submit" status (yellow warning)
- Products cannot be fetched from App Store Connect (Error 23)
- RevenueCat shows "Ready to Submit" state needs attention

---

## Products Status

### 1. QuitCoach Pro Lifetime
- **Product ID:** `com.lotriflow.quitcoach.pro.lifetime`
- **Type:** Non-Consumable
- **Price:** $2.99
- **Status:** Ready to Submit ⚠️
- **Location:** In-App Purchases section

### 2. QuitCoach Pro Monthly
- **Product ID:** `com.lotriflow.quitcoach.subscription.monthly`
- **Type:** Auto-Renewable Subscription
- **Price:** $0.99/month
- **Duration:** 1 month
- **Subscription Group:** QuitCoach Pro (ID: 21855906)
- **Status:** Ready to Submit ⚠️
- **Localization Status:** Prepare for Submission ⚠️

---

## Why Products Aren't Working

According to Apple documentation and RevenueCat community forums, products in "Ready to Submit" state **should** work for sandbox testing, but they require complete metadata first.

### Required Metadata (Likely Missing):

1. **Review Screenshot** (Critical!)
   - Apple requires a screenshot showing the IAP in your app
   - This is the most common missing item
   - Without this, products won't be available even for sandbox

2. **Complete Localization**
   - Display Name
   - Description
   - Both are currently in "Prepare for Submission" state

3. **Subscription Group Display Name**
   - The group itself needs localized metadata
   - Currently shows "Prepare for Submission"

---

## How to Complete Metadata

### For QuitCoach Pro Lifetime:

1. Go to: App Store Connect → My Apps → LotriFlow Quit Pro
2. Click: **In-App Purchases** → **QuitCoach Pro Lifetime**
3. Scroll through the form and look for:
   - **App Store Localization** section - fill in Display Name & Description
   - **Review Information** section - upload a screenshot
4. Click **Save**
5. Status should change from "Ready to Submit" (yellow) to green checkmark

### For QuitCoach Pro Monthly:

1. Go to: App Store Connect → My Apps → LotriFlow Quit Pro
2. Click: **Subscriptions** → **QuitCoach Pro** → **QuitCoach Pro Monthly**
3. Complete the same fields:
   - App Store Localization
   - Review screenshot
4. **Also important:** Edit the Subscription Group
   - Click "Edit Subscription Group"
   - Add localization for the group display name
   - This is why it shows "Prepare for Submission"

---

## Review Screenshot Requirements

### What to Include:
- A screenshot of your app showing the purchase UI
- Can be from the upgrade modal or settings screen
- Must show the product name and price
- Can be a simulator screenshot (doesn't need to be from real device)

### How to Create:
1. Run app in simulator or on device
2. Navigate to Pro & Billing section
3. Take a screenshot showing the purchase options
4. Upload to the "Review Screenshot" field in App Store Connect

---

## Testing Before App Review

Once metadata is complete:

1. Products will change to fully "Ready to Submit" (should work for sandbox)
2. RevenueCat should sync and show product details with prices
3. Test on physical device with Sandbox Apple ID
4. Run diagnostic in app - should show 2 packages fetched

You do **NOT** need to submit the IAPs for review to test them in sandbox - "Ready to Submit" with complete metadata is enough.

---

## Submitting for Review (When Ready)

According to Apple's rules:

> "Your first in-app purchase must be submitted with a new app version."

This means:

1. You cannot submit IAPs alone for your first IAP
2. You must create a new app version (e.g., 1.1)
3. Submit the app version + both IAPs together
4. Future IAPs can be submitted independently

### Submission Steps:

1. Complete all IAP metadata
2. Create a new app version in App Store Connect
3. Add both IAPs to the version's "In-App Purchases and Subscriptions" section
4. Submit app version + IAPs together for review
5. Wait for approval (typically 1-3 days)

---

## Immediate Next Steps

1. **Click on "QuitCoach Pro Lifetime" in App Store Connect**
   - Check what fields are empty or marked as required
   - Fill in all metadata
   - Upload review screenshot

2. **Click on "QuitCoach Pro Monthly" in App Store Connect**
   - Complete subscription metadata
   - Upload review screenshot
   - Edit subscription group to add localization

3. **Test again once metadata is complete**
   - Wait 2-5 minutes for RevenueCat sync
   - Run diagnostic on physical device
   - Should show offerings and packages successfully

---

## Resources

- [In-App Purchase statuses - Apple Developer](https://developer.apple.com/help/app-store-connect/reference/in-app-purchases-and-subscriptions/in-app-purchase-statuses/)
- [Zero In-app purchase products returned? Checklist](https://fluffy.es/zero-iap-products-checklist/)
- [Submit an in-app purchase - Apple Developer](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-in-app-purchase/)

---

## Current Blockers

🔴 **Cannot test IAPs until metadata is complete**

The products exist and the API keys are configured correctly, but Apple/RevenueCat cannot fetch products that don't have complete metadata, even for sandbox testing.

Once you complete the metadata (especially the review screenshots), the products should become available for sandbox testing immediately without needing App Review approval.
