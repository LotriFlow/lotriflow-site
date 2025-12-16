# Pro Features Implementation Guide

## ✅ What's Been Set Up

### 1. **Pro Access UI in Settings**
- Added a beautiful Pro section in Settings panel
- Shows different cards for Pro/Free users
- "Upgrade to Lifetime" button for free users
- "Restore Purchases" button for all users

### 2. **JavaScript API**
The `ProAccess` object provides:
- `ProAccess.hasAccess()` - Returns true if user has Pro (Lifetime purchase)
- `ProAccess.requirePro(featureName)` - Shows upgrade prompt if user doesn't have Pro
- `ProAccess.purchaseLifetime()` - Opens purchase flow for Lifetime
- `ProAccess.restore()` - Restores purchases
- `ProAccess.isProActive` - Boolean flag

### 3. **CSS Classes for Gating**
- `.pro-feature` - Add to any element to gate it
- `.pro-lock-badge` - Auto-added lock icon for locked features
- `.pro-badge` - Purple "PRO" badge you can add manually
- `.pro-only-content` - Content shown only to Pro users
- `.pro-only-message` - Message shown only to free users

### 4. **Body Classes**
- `body.pro-active` - Added when user has Pro (Lifetime)

## 🔒 How to Gate Features

### Method 1: Simple HTML Gating
Add `class="pro-feature"` to any element:

\`\`\`html
<button class="pro-feature" onclick="generateShareCode()">
  Generate Share Code
</button>
\`\`\`

This will:
- Add a lock icon (🔒)
- Dim the element
- Disable interactions
- Auto-unlock when user gets Pro

### Method 2: JavaScript Function Gating
Wrap feature functions with `requirePro()`:

\`\`\`javascript
function generateShareCode() {
  if (!ProAccess.requirePro('Sync & Backup')) return;
  
  // Your sync logic here...
}
\`\`\`

This will:
- Check if user has Pro
- Show "Export Data requires Pro" toast
- Offer to start free trial
- Return false if no access

### Method 3: Conditional Content
Show different content for Pro/Free:

\`\`\`html
<div class="pro-only-content">
  <!-- This shows ONLY for Pro users -->
  <button onclick="advancedAnalytics()">Advanced Analytics</button>
</div>

<div class="pro-only-message">
  <!-- This shows ONLY for free users -->
  <p>🔒 Advanced analytics requires Pro</p>
  <button onclick="ProAccess.purchaseLifetime()">Upgrade to Lifetime</button>
</div>
\`\`\`

### Method 4: Manual Check
\`\`\`javascript
if (ProAccess.hasAccess()) {
  // Pro-only code
  showAdvancedStats();
} else {
  // Free user code
  showBasicStats();
}
\`\`\`

## 📋 Examples of Features to Gate

### Easy Wins (Add `class="pro-feature"` to HTML):
1. Export data button
2. Custom themes selector
3. Advanced analytics section
4. Detailed history view (beyond 30 days)

### Moderate (Use `requirePro()` in functions):
1. Export/Download functionality
2. PDF report generation
3. Custom notifications
4. Data sync features

### Advanced (Custom logic):
1. Limit free users to 30 days of history
2. Show 3 coach messages/day for free, unlimited for Pro
3. Basic achievements free, premium achievements locked
4. AI coach features (more sophisticated responses for Pro)

## 💰 Current Offering

### Lifetime Pro - $2.99 USD (One-time payment)
- **Product ID:** `com.lotriflow.quitcoach.pro.lifetime`
- **Type:** Non-Consumable
- **Entitlement:** `LotriFlow Quit Pro`
- **Features:** Permanent access to all Pro features

**Note:** Trial and monthly subscriptions have been removed. The app now offers Lifetime access only.

## 🎨 Example Implementation

### Example 1: Gate Export Button
\`\`\`html
<!-- In your HTML -->
<button class="pro-feature" onclick="exportHistory()">
  📥 Export History
</button>
\`\`\`

\`\`\`javascript
// In your JavaScript
function exportHistory() {
  if (!ProAccess.requirePro('Export History')) return;
  
  // Export logic here
  const data = JSON.stringify(state);
  // ... download file
}
\`\`\`

### Example 2: Limit Free Features
\`\`\`javascript
function getHistoryDays() {
  return ProAccess.hasAccess() ? 365 : 30; // Pro: 1 year, Free: 30 days
}

function canAccessAdvancedCoach() {
  if (!ProAccess.hasAccess()) {
    ProAccess.requirePro('Advanced Coach Features');
    return false;
  }
  return true;
}
\`\`\`

### Example 3: Add Pro Badge to Feature
\`\`\`html
<div class="nav-tab pro-feature" onclick="showAdvancedStats()">
  📊 Advanced Stats <span class="pro-badge">PRO</span>
</div>
\`\`\`

## 🚀 Next Steps

1. **Decide which features to gate** - Make a list
2. **Add classes or checks** - Use the methods above
3. **Test the flow**:
   - Test as free user (see locks)
   - Purchase/trial (locks disappear)
   - Restore purchases
4. **Build and test on device**
5. **Create real product in App Store Connect**
6. **Test with sandbox account**
7. **Submit for review**

## 🔧 Testing

### In Simulator (StoreKit Configuration):
1. Free state: `Debug → StoreKit → Clear Transactions`
2. Purchase: Click "Upgrade to Lifetime"
3. Check locks disappear
4. Test restore

### On Device (Production):
1. Test with real RevenueCat integration
2. Purchase Lifetime
3. Test restore on another device with same Apple ID
4. Verify entitlements persist offline

## 📝 Current Status

✅ IAP plugin working
✅ StoreKit configuration active  
✅ Purchase flow working
✅ Pro UI in settings
✅ Gating framework ready
⏳ Need to decide which features to gate
⏳ Need to create real product in App Store Connect

## 💡 Tips

- Start by gating 3-5 features
- Make sure free version is still valuable
- Test the upgrade flow thoroughly
- Consider offering a "Pro" tab/section
- Add analytics to track conversion rates
