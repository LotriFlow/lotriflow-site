# Fix "Product Not Found" - StoreKit Configuration Setup

## The Problem
When you click "Test Pro Purchase", you get an error: `com.lotriflow.quitcoach.subscription.monthly not found`

This happens because Xcode is trying to reach the real App Store Connect instead of using your local test configuration file.

## The Solution: Configure Xcode Scheme

Follow these steps **exactly**:

### Step 1: Open Scheme Editor
1. In Xcode, look at the **top toolbar** (where the play/stop buttons are)
2. You'll see something like: `App > iPhone 17`
3. **Click on "App"** (the scheme name)
4. A dropdown menu appears
5. Select **"Edit Scheme..."**

### Step 2: Navigate to StoreKit Settings
1. A dialog window opens with a sidebar on the left
2. In the left sidebar, click **"Run"** (it should have a play icon ▶️)
3. At the top of the dialog, you'll see tabs: Info, Arguments, Options, Diagnostics
4. Click the **"Options"** tab

### Step 3: Select StoreKit Configuration
1. In the Options tab, scroll down until you see **"StoreKit Configuration"**
2. You'll see a dropdown menu (it probably says "None")
3. Click the dropdown
4. Select **"App.storekit"** from the list
5. Click **"Close"** button at the bottom right

### Step 4: Clean and Rebuild
1. In Xcode menu bar: **Product** → **Clean Build Folder** (or press ⌥⌘⇧K)
2. Wait for it to finish
3. **Product** → **Run** (or press ⌘R)

### Step 5: Test the Purchase
1. Wait for the app to launch in the simulator
2. Navigate to your Pro features section
3. Click **"Test Pro Purchase"**
4. You should now see the Apple purchase sheet with:
   - Product: SmokeFree Pro Monthly
   - Price: $4.99/month
   - 7-day free trial
   - Subscribe button

## What This Does
By selecting `App.storekit` in the scheme, you're telling Xcode:
- ✅ Use the local test configuration file
- ✅ Don't try to connect to App Store Connect
- ✅ Use the test product we defined locally
- ✅ Allow purchase testing without real money

## Verification
After setup, you should see in the Xcode console:
```
⚡️ [log] - [ProAccess] Plugin available
⚡️ To Native -> ProAccess startPurchase
```

And then the purchase sheet will appear!

## If It Still Doesn't Work
Check:
1. Did you select the correct .storekit file? (Should be "App.storekit")
2. Did you clean build folder before running?
3. Is the product ID correct in App.storekit? (Should be `com.lotriflow.quitcoach.subscription.monthly`)

## Next Steps After This Works
Once local testing works, you'll need to:
1. Create the real product in App Store Connect
2. Set up sandbox test accounts
3. Test on a real device with sandbox account
4. Submit for App Review
