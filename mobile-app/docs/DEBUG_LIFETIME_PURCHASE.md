# 🔍 Debug Lifetime Purchase Failure

## Enhanced Error Logging Added

I've added comprehensive step-by-step logging to track exactly where the lifetime purchase is failing.

---

## 📋 How to Debug

### 1. **Run the App**
```bash
npx cap run ios
```

### 2. **Open Safari Web Inspector**
- Safari → Develop → [Your Device] → SmokeFree
- Go to **Console** tab
- Clear console (⌘K)

### 3. **Attempt Lifetime Purchase**
- Navigate to: Settings → Pro & Billing
- Click: Upgrade button
- Select: **Lifetime** option

### 4. **Watch Console Logs**

You'll see detailed logging for each step:

---

## 🔍 What to Look For

### **Step 1: Fetching Offerings**

```javascript
[ProAccess] 🛒 Starting Lifetime purchase flow...
[ProAccess] Step 1: Fetching offerings...
[ProAccess] ✅ Offerings received: {
  hasOfferings: true,
  hasCurrent: true,
  currentId: "default",
  allOfferingsCount: 1
}
```

**❌ If this fails:**
- Check RevenueCat dashboard → Offerings
- Verify "default" offering exists and is marked as "Current"

---

### **Step 2: Finding Lifetime Package**

```javascript
[ProAccess] Step 2: Finding lifetime package...
[ProAccess] Available packages: [
  {
    identifier: "$rc_lifetime",
    productId: "com.lotriflow.quitcoach.pro.lifetime",
    packageType: "LIFETIME",
    price: "$2.99"
  },
  {
    identifier: "$rc_monthly",
    productId: "com.lotriflow.quitcoach.subscription.monthly",
    packageType: "MONTHLY",
    price: "$0.99"
  }
]
[ProAccess] ✅ Lifetime package found: {
  identifier: "$rc_lifetime",
  productIdentifier: "com.lotriflow.quitcoach.pro.lifetime",
  packageType: "LIFETIME",
  price: "$2.99",
  title: "LotriFlow Pro Lifetime"
}
```

**❌ If package not found:**
- Check: RevenueCat dashboard → Offerings → "default" → Packages
- Verify: Lifetime package is attached to offering
- Verify: Product ID matches: `com.lotriflow.quitcoach.pro.lifetime`

**❌ If packages array is empty:**
- Check: RevenueCat dashboard → Products
- Verify: Products exist and are attached to entitlement
- Check: App Store Connect → In-App Purchases → Verify products approved

---

### **Step 3: Initiating Purchase**

```javascript
[ProAccess] Step 3: Initiating purchase...
```

**At this point:**
- Apple's purchase sheet should appear
- User authenticates with sandbox Apple ID
- User confirms purchase

**❌ If purchase sheet doesn't appear:**
- Check: Settings → App Store → Sandbox Account is signed in
- Check: Not signed in with production Apple ID
- Try: Sign out and sign in again with sandbox account

---

### **Step 4: Purchase Result**

#### ✅ **Success:**
```javascript
[ProAccess] Step 4: Purchase result received: {
  hasResult: true,
  hasCustomerInfo: true,
  userCancelled: false,
  resultKeys: ["customerInfo"]
}
[ProAccess] ✅ Purchase successful! Processing customerInfo...
[ProAccess] Checking status (Source: Purchase/Restore Result)...
[ProAccess] ✅ Active entitlement found: {
  identifier: "LotriFlow Quit Pro",
  productIdentifier: "com.lotriflow.quitcoach.pro.lifetime",
  periodType: "non_renewing",
  expirationDate: null
}
[ProAccess] ✅ Status updated - Pro active: true
```

#### ℹ️ **User Cancelled:**
```javascript
[ProAccess] Step 4: Purchase result received: {
  hasResult: true,
  hasCustomerInfo: false,
  userCancelled: true,
  resultKeys: ["userCancelled"]
}
[ProAccess] ℹ️ User cancelled the purchase
```

#### ❌ **Purchase Failed:**
```javascript
[ProAccess] ❌ Lifetime purchase failed with error:
[ProAccess] Error message: "..."
[ProAccess] Error code: "23"
[ProAccess] Error userInfo: {...}
[ProAccess] Full error object: {...}
```

---

## 🚨 Common Error Codes

### **Error Code 1** - Purchase Cancelled
```
Error code: "1"
```
**Meaning:** User cancelled in the purchase dialog
**Action:** None needed, this is expected behavior

---

### **Error Code 2** - Network Error
```
Error code: "2"
Error message: "Unable to connect to App Store"
```
**Meaning:** No internet connection or App Store unreachable
**Action:**
- Check internet connection
- Try again

---

### **Error Code 3** - Store Problem
```
Error code: "3"
Error message: "This product is not available"
```
**Meaning:** Product configuration issue
**Actions:**
1. Check App Store Connect → In-App Purchases
2. Verify product status: "Ready to Submit" or "Approved"
3. Verify product ID matches: `com.lotriflow.quitcoach.pro.lifetime`
4. Check: Banking/Tax agreements approved

---

### **Error Code 23** - RevenueCat Configuration Error
```
Error code: "23"
Error message: "None of the products registered in the RevenueCat dashboard could be fetched from App Store Connect"
```

**This is the most common error!**

**Actions:**
1. ✅ Verify Bundle ID matches across:
   - Xcode project
   - capacitor.config.json
   - RevenueCat dashboard

2. ✅ Verify Products exist in App Store Connect:
   - `com.lotriflow.quitcoach.pro.lifetime` (Non-Consumable)
   - `com.lotriflow.quitcoach.subscription.monthly` (Auto-Renewable)

3. ✅ Verify Products added to RevenueCat:
   - RevenueCat dashboard → Products
   - Both products should be listed

4. ✅ Verify Entitlement configured:
   - RevenueCat dashboard → Entitlements
   - "LotriFlow Quit Pro" exists
   - Both products attached to entitlement

5. ✅ Verify Offering configured:
   - RevenueCat dashboard → Offerings
   - "default" offering marked as **Current** ⭐
   - Packages exist in offering

6. ✅ Check StoreKit Configuration:
   - Xcode → Product → Scheme → Edit Scheme
   - Run → Options → StoreKit Configuration = **None**

7. ✅ Banking/Tax approved:
   - App Store Connect → Agreements
   - Paid Apps Agreement: **Active**
   - Banking info: **Complete**
   - Tax forms: **Submitted**

8. ✅ Wait 24-48 hours after:
   - Banking approval
   - Product creation
   - RevenueCat configuration

---

## 📊 Full Console Log Example (Success)

```
[ProAccess] 🛒 Starting Lifetime purchase flow...
[ProAccess] Step 1: Fetching offerings...
[ProAccess] ✅ Offerings received: { hasOfferings: true, hasCurrent: true, currentId: "default", allOfferingsCount: 1 }
[ProAccess] Step 2: Finding lifetime package...
[ProAccess] Available packages: [ { identifier: "$rc_lifetime", productId: "com.lotriflow.quitcoach.pro.lifetime", packageType: "LIFETIME", price: "$2.99" }, ... ]
[ProAccess] ✅ Lifetime package found: { identifier: "$rc_lifetime", productIdentifier: "com.lotriflow.quitcoach.pro.lifetime", packageType: "LIFETIME", price: "$2.99", title: "LotriFlow Pro Lifetime" }
[ProAccess] Step 3: Initiating purchase...
[User sees Apple purchase sheet and completes purchase]
[ProAccess] Step 4: Purchase result received: { hasResult: true, hasCustomerInfo: true, userCancelled: false, resultKeys: ["customerInfo"] }
[ProAccess] ✅ Purchase successful! Processing customerInfo...
[ProAccess] Checking status (Source: Purchase/Restore Result)...
[ProAccess] CustomerInfo: { hasEntitlements: true, hasActiveEntitlements: true, activeEntitlementKeys: ["LotriFlow Quit Pro"], originalAppUserId: "..." }
[ProAccess] ✅ Active entitlement found: { identifier: "LotriFlow Quit Pro", productIdentifier: "com.lotriflow.quitcoach.pro.lifetime", periodType: "non_renewing", expirationDate: null }
[ProAccess] ✅ Status updated - Pro active: true | Trial: false
```

---

## 🎬 Next Steps

1. **Run the app** with the enhanced logging
2. **Attempt lifetime purchase**
3. **Copy the console logs** (all of them!)
4. **Share the logs** so we can see exactly where it's failing

The detailed logging will pinpoint the exact failure point:
- ❌ Offerings not loading?
- ❌ Package not found?
- ❌ Purchase API error?
- ❌ Result structure unexpected?

We'll know exactly what to fix once we see the logs! 🔍
