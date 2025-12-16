# SmokeFree - App Store Submission Guide

## 1. Privacy & Terms URLs

Host these files and use the URLs in App Store Connect:

| Document | File | Suggested URL |
|----------|------|---------------|
| Privacy Policy | `privacy.html` | `https://lotriflow.com/smokefree/privacy` |
| Terms of Service | `terms.html` | `https://lotriflow.com/smokefree/terms` |

**Quick hosting options:**
- GitHub Pages (free)
- Your existing website
- Netlify/Vercel (free tier)

---

## 2. App Store Screenshots

### Required Sizes:

| Device | Display Size | Resolution | Required |
|--------|--------------|------------|----------|
| iPhone 15 Pro Max | 6.7" | 1290 x 2796 | ✅ Yes |
| iPhone 8 Plus | 5.5" | 1242 x 2208 | ✅ Yes |
| iPad Pro 12.9" | 12.9" | 2048 x 2732 | Optional |

### Screens to Capture (in order):

1. **Timer Screen** - Main countdown with streak counter
   - Caption: "Track your smoke-free journey"
   
2. **Stats Card** - Money saved, cigarettes avoided
   - Caption: "See your savings grow"
   
3. **Milestones Tab** - Achievement badges and health recovery
   - Caption: "Celebrate every milestone"
   
4. **Coach Tab** - Motivational tips and breathing exercises
   - Caption: "Get support when you need it"
   
5. **Settings/Pro** - Pro features upgrade card
   - Caption: "Unlock advanced features"

6. **Apple Watch** (optional) - Watch app showing quick log
   - Caption: "Log from your wrist"

### How to Capture:

1. Open Xcode, select **iPhone 15 Pro Max** simulator
2. Run the app (⌘R)
3. Navigate to each screen
4. Press **⌘S** to save screenshot
5. Screenshots save to Desktop
6. Repeat with **iPhone 8 Plus** for 5.5" size

---

## 3. App Store Description

### App Name
```
SmokeFree - Quit Smoking Tracker
```

### Subtitle (30 chars max)
```
Track Your Quit Journey
```

### Promotional Text (170 chars, can update anytime)
```
Start your smoke-free journey today! Track progress, save money, and celebrate milestones. Now with Apple Watch support.
```

### Description
```
SmokeFree helps you quit smoking by tracking your progress, showing your health recovery, and celebrating every milestone along the way.

TRACK YOUR JOURNEY
• Count smoke-free days, hours, and minutes
• Log cigarettes with one tap when you need to
• See your streak grow over time

WATCH YOUR SAVINGS
• Calculate money saved based on your pack price
• Track cigarettes avoided
• Set and achieve daily goals

CELEBRATE MILESTONES
• Health recovery timeline from 20 minutes to 15 years
• Unlock achievements as you progress
• Share your success with friends

STAY MOTIVATED
• Built-in coach with tips and encouragement
• Breathing exercises for cravings
• Craving tracker to identify patterns

APPLE WATCH
• Log cigarettes from your wrist
• View your streak at a glance
• Quick access when you need it

PRO FEATURES (Optional)
• Advanced analytics (14-day & 30-day trends)
• Export your data
• Sync & backup
• Share progress images

SmokeFree is not medical advice. Consult a healthcare professional for smoking cessation support.

Privacy-first: All data stays on your device.
```

### What's New (Version 1.0)
```
Initial release! 🎉

• Track your smoke-free journey
• Health recovery milestones
• Money savings calculator
• Apple Watch companion app
• Breathing exercises & coach
• Optional Pro features
```

---

## 4. Keywords (100 chars max)

```
quit smoking,stop smoking,smoke free,cigarette tracker,quit tracker,health,wellness,addiction,habit
```

Alternative set:
```
smoking cessation,quit cigarettes,smoke tracker,days without smoking,money saved,health recovery
```

---

## 5. App Store Connect - In-App Purchases

Create these products in App Store Connect → Your App → In-App Purchases:

### Product 1: Lifetime Pro

| Field | Value |
|-------|-------|
| Type | Non-Consumable |
| Reference Name | SmokeFree Pro Lifetime |
| Product ID | `com.lotriflow.quitcoach.pro.lifetime` |
| Price | Tier 4 ($2.99 USD) |
| Display Name | SmokeFree Pro Lifetime |
| Description | Unlock all Pro features forever. One-time purchase. |

### Product 2: Monthly Subscription

| Field | Value |
|-------|-------|
| Type | Auto-Renewable Subscription |
| Reference Name | SmokeFree Pro Monthly |
| Product ID | `com.lotriflow.quitcoach.subscription.monthly` |
| Subscription Group | SmokeFree Pro |
| Price | Tier 1 ($0.99 USD) |
| Duration | 1 Month |
| Free Trial | 1 Week |
| Display Name | SmokeFree Pro Monthly |
| Description | Unlock all premium features. Cancel anytime. |

---

## 6. App Information

### Category
- Primary: Health & Fitness
- Secondary: Lifestyle

### Age Rating
- 17+ (due to smoking-related content)

### Copyright
```
© 2025 lotriflow
```

### Support URL
```
https://lotriflow.com/smokefree/support
```
(or use email: me@lotriflow.com)

### Marketing URL (optional)
```
https://lotriflow.com/smokefree
```

---

## 7. Version Number

Set in Xcode:
1. Select project in Navigator
2. Select "App" target
3. General tab:
   - **Version**: `1.0.0`
   - **Build**: `1`

---

## 8. Pre-Submission Checklist

- [ ] Privacy Policy URL is live and accessible
- [ ] Terms of Service URL is live and accessible
- [ ] All screenshots uploaded (6.7" + 5.5")
- [ ] App description filled in
- [ ] Keywords set
- [ ] IAP products created and approved
- [ ] Version set to 1.0.0
- [ ] Build uploaded via Xcode
- [ ] App Review notes (if needed)

### App Review Notes (optional)
```
This app helps users track their smoking cessation journey. 

To test Pro features:
- Tap Settings → Pro section
- Use sandbox account to test purchases

The app stores all data locally on device for privacy.
```

---

## Ready to Submit!

1. Archive in Xcode: Product → Archive
2. Upload to App Store Connect
3. Fill in all metadata
4. Submit for Review

Good luck! 🚀
