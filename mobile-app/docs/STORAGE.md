# Storage Architecture

## Current Implementation: Capacitor Preferences

QuitFlow uses **Capacitor Preferences** for cross-platform, encrypted, persistent storage.

### How It Works

The app automatically detects the environment and uses the best storage option:

| Platform | Storage Backend | Encryption | Persistent |
|----------|----------------|------------|------------|
| **iOS** | Keychain | ✅ Yes | ✅ Yes |
| **Android** | EncryptedSharedPreferences | ✅ Yes | ✅ Yes |
| **Web** | localStorage (fallback) | ❌ No | ⚠️ Browser-dependent |

### API Usage

```javascript
// Get data
const value = await Storage.get('key');

// Set data
await Storage.set('key', 'value');

// Remove data
await Storage.remove('key');

// Clear all data
await Storage.clear();
```

### Key Benefits

✅ **Encrypted** - Secure on iOS and Android
✅ **Persistent** - Survives app updates and OS cleanup
✅ **Cross-platform** - Same API everywhere
✅ **Offline-first** - No network required
✅ **Auto-fallback** - Works on web without Capacitor

## Future Expansion Options

### For Complex Data / Queries

If you need relational data or complex queries:

```bash
npm install @capacitor-community/sqlite
```

Use cases:
- User history with timestamps
- Relational data (users, sessions, logs)
- Full-text search
- Complex aggregations

### For Higher-Level Abstraction

For a batteries-included storage solution:

```bash
npm install @ionic/storage-angular
```

Features:
- Multiple driver support (SQLite, IndexedDB, WebSQL, localStorage)
- Automatic driver selection
- Built-in encryption options
- Easy migration from localStorage

## Migration Guide

### From localStorage to Capacitor Preferences

```javascript
// OLD
localStorage.setItem('key', 'value');
const value = localStorage.getItem('key');

// NEW
await Storage.set('key', 'value');
const value = await Storage.get('key');
```

⚠️ **Important**: All storage operations are now async!

## Data Persistence

### What Gets Saved

- User settings (theme, notifications, etc.)
- Quit progress (lastCigarette, cigaretteLog)
- Achievements and milestones
- AI coach conversation history
- Custom goals and preferences

### When Data Gets Saved

- Automatically on state changes
- On app visibility change (going to background)
- Before app unload/close
- Manual save via settings

### Storage Keys

- `quitflow_state` - Main app state (JSON)
- `pwa_dismissed` - Install banner dismissed flag

## Testing

### Web Browser
App works with localStorage fallback - test normally in browser

### iOS/Android
After running Capacitor build, data persists in encrypted storage:
```bash
npx cap sync
npx cap open ios
# or
npx cap open android
```

## Troubleshooting

### "Storage is undefined"
Make sure Capacitor is properly initialized. On web, it falls back to localStorage automatically.

### Data not persisting on mobile
Check Capacitor Preferences is installed:
```bash
npm list @capacitor/preferences
```

### Migration from old data
The app automatically migrates from `breathefree_state` to `quitflow_state` on first load.

## Security Notes

- **iOS**: Data stored in Keychain with kSecAttrAccessibleWhenUnlockedThisDeviceOnly
- **Android**: Uses EncryptedSharedPreferences with AES-256
- **Web**: localStorage is NOT encrypted - use HTTPS in production
