# Pro & Billing Feature - Context Document

## Overview

SmokeFree app offers Pro features via Apple StoreKit with two purchase paths:

- **Lifetime** ($2.99) - One-time purchase, permanent access
- **Monthly** ($0.99/month) - Subscription with 7-day free trial

## User States

| State    | Description                 | Card Shown                             |
| -------- | --------------------------- | -------------------------------------- |
| Free     | No purchase history         | proInactiveCard (upgrade prompt)       |
| Trial    | 7-day free trial active     | proTrialCard (countdown + upgrade CTA) |
| Monthly  | Active monthly subscription | proMonthlyCard                         |
| Lifetime | Permanent Pro member        | proLifetimeCard                        |

## Product IDs

```
com.lotriflow.smokefree.pro.lifetime
com.lotriflow.smokefree.subscription.monthly
```

## Gated Features

Features marked with `class="pro-feature"` and `data-pro-feature-name="..."`:

- Advanced Reports & Analytics (14D/30D views)
- Craving Tracker & Pattern Analysis
- Share Progress
- Sync & Backup

## UI Guidelines

- **Trial countdown**: Granular (e.g., "5 days 12 hours remaining")
- **Lock indicator**: Simple overlay, keep current approach
- **Colors**: Modern, clean, subtle - no heavy/bold colors
- **Cards**: Minimal, consistent with app design language

## Key Files

- `src/app.js` - ProAccess class (lines ~6400-6770)
- `index.html` - Pro cards in settings (lines ~690-750)
- `src/styles.css` - Upgrade modal styles (lines ~5449-5650)

## StoreKit Integration

Uses Capacitor plugin for native iOS StoreKit integration:

- `this.storeKit.startPurchase({ productId })`
- `this.storeKit.restore()`
- `this.storeKit.getStatus()` → returns `{ isProActive, isInTrial, trialDaysRemaining, activeProductId }`
