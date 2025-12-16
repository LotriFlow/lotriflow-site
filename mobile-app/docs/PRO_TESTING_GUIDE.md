# Pro Features Testing Guide

## 🎯 What to Test

### Test Scenario 1: Free User Experience
**Starting State: No active subscription**

1. **Open Settings** (⚙️ icon)
   - Scroll to "SmokeFree Pro" section
   - You should see "Unlock Pro Features" card with feature list
   - Shows "$4.99/month with 7-day free trial"

2. **Try Locked Features**
   - In Settings, scroll to bottom
   - Click the **"💾 Export"** button
   - You should see:
     - Button is dimmed/grayed out
     - 🔒 lock icon appears
     - Toast: "🔒 Export Data requires Pro"
     - Popup: "Export Data is a Pro feature. Would you like to start your free 7-day trial?"

3. **Check Reports Section**
   - Go to Reports tab (📈)
   - You'll see "Advanced Analytics" card
   - It has a lock icon
   - Is dimmed/grayed out
   - Has "Unlock with Pro" button

### Test Scenario 2: Start Free Trial
**Action: Purchase subscription**

1. **Open Settings → SmokeFree Pro**
2. Click **"🚀 Start Free Trial"**
3. StoreKit purchase sheet appears:
   - "SmokeFree Pro"
   - "1-week free trial"
   - "$4.99 per month"
4. Click **Subscribe**
5. You should see:
   - Toast: "Welcome to Pro! Enjoy your 7-day free trial! 🎉"
   - Settings Pro section changes to "Pro Member" card
   - Shows "Free trial • 7 days remaining"

### Test Scenario 3: Pro User Experience
**State: Active trial or subscription**

1. **Check Settings**
   - Pro section shows purple "Pro Member" card
   - Status: "Free trial • X days remaining" or "Active subscription"
   - Thank you message displayed

2. **Locked Features Now Unlocked**
   - Export button:
     - ✅ No longer dimmed
     - ✅ No lock icon
     - ✅ Clicking it exports data (downloads JSON file)
   - Advanced Analytics card:
     - ✅ No longer dimmed
     - ✅ No lock icon visible

3. **Visual Indicators**
   - Pro badge appears on features
   - Body has `pro-active` class (check browser inspector)

### Test Scenario 4: Trial Expiration
**Action: Simulate trial ending**

In Xcode while app is running:
1. **Debug** → **StoreKit** → **Manage Transactions...**
2. Find your subscription
3. Select it → Click **"Expire Subscription"** button
4. Close the transaction manager

Back in app:
1. **Restart the app** (stop and run again)
2. Check Settings:
   - Should show "Unlock Pro Features" card again
   - No longer says "Pro Member"
3. Try Export:
   - Button is locked again
   - Shows upgrade prompt
4. Advanced Analytics:
   - Dimmed/locked again

### Test Scenario 5: Restore Purchases
**Action: Test restoration**

1. Clear transactions: **Debug** → **StoreKit** → **Clear Transactions**
2. Restart app
3. Purchase Pro again
4. Stop app
5. **Debug** → **StoreKit** → **Clear Transactions** (clears from memory only)
6. Run app again
7. Open **Settings → SmokeFree Pro**
8. Click **"Restore Purchases"**
9. Should show: "Pro access restored! 🎉"
10. Features unlock again

## 📊 Visual States Reference

### Free User (No Pro):
```
Export Button:    [Dimmed] 💾 Export 🔒
Advanced Card:    [Dimmed with lock badge]
Settings:         "Unlock Pro Features" card
Body Class:       (none)
```

### Pro Active (Trial or Paid):
```
Export Button:    [Normal] 💾 Export PRO
Advanced Card:    [Normal, no lock]
Settings:         "Pro Member" card
Body Class:       .pro-active
```

### In Trial:
```
Settings Status:  "Free trial • X days remaining"
Body Class:       .pro-active .in-trial
```

## 🔍 What Each State Should Show

| Feature | Free User | In Trial | Pro Active |
|---------|-----------|----------|------------|
| Export Button | 🔒 Dimmed, locked | ✅ Works | ✅ Works |
| Advanced Analytics | 🔒 Locked card | ✅ Unlocked | ✅ Unlocked |
| Settings Pro Card | "Unlock Pro" | "Pro Member (trial)" | "Pro Member" |
| Pro Badge | Hidden | Visible | Visible |

## 🐛 Common Issues

**Issue: Features still locked after purchase**
- Solution: Restart the app, it should call `checkStatus()` on init

**Issue: "Product not found"**
- Solution: Make sure StoreKit Configuration is set in scheme (Run → Options → App.storekit)

**Issue: Purchase sheet shows "For testing purposes only"**
- That's normal! You're using local StoreKit config file

**Issue: Can't restore purchases**
- In local testing, restore only works if transactions exist in StoreKit memory
- Test restore on real device with sandbox account for full testing

## 🎮 Quick Test Commands (Browser Console)

While app is running, open browser console:

```javascript
// Check current status
ProAccess.isProActive
ProAccess.isInTrial
ProAccess.trialDaysRemaining

// Manually trigger upgrade prompt
ProAccess.requirePro('Test Feature')

// Force status check
await ProAccess.checkStatus()

// Check if user has access
ProAccess.hasAccess()
```

## 📱 Testing on Real Device

1. **Set up Sandbox Test Account** in App Store Connect
2. **Sign out** of App Store on device
3. **Run app** from Xcode to device
4. **Purchase** → Sign in with sandbox account when prompted
5. **Test full flow** including expiration (change subscription duration in StoreKit settings)

## ✅ Success Criteria

- ✅ Free users see locked features with upgrade prompts
- ✅ Purchase flow works smoothly
- ✅ Trial status displays correctly
- ✅ Features unlock immediately after purchase
- ✅ Features lock again when trial expires
- ✅ Restore purchases works
- ✅ UI updates in real-time when status changes
- ✅ No crashes or errors during transitions

## 🚀 Next Steps After Testing

1. Decide which additional features to gate
2. Test on real device with sandbox account
3. Create real product in App Store Connect
4. Submit app for review
5. Monitor analytics and conversion rates
