# Admin Dashboard - Deployment Setup Guide

## Current Status ✓

- ✅ Admin page created (`admin.html`) - password: `lotriflow2024`
- ✅ API function ready (`api/stats.js`)
- ✅ Vercel config ready (`vercel.json`)
- ✅ Code pushed to GitHub
- ⏳ **Waiting**: Vercel account deletion (48 hours) OR use Netlify

---

## Next Steps

### Option A: Wait for Vercel (48 hours)

1. Go to [vercel.com](https://vercel.com) and sign up with your preferred email
2. Click **"Add New Project"** → **"Import Git Repository"**
3. Connect GitHub → select `lotriflow-site`
4. Click **Deploy**

### Option B: Use Netlify Now

1. Go to [netlify.com](https://netlify.com)
2. Sign up with **GitHub**
3. Click **"Add new site"** → **"Import an existing project"**
4. Select `lotriflow-site` → Deploy

---

## After Deployment: Configure API

### 1. Get App Store Connect API Key

1. Go to [App Store Connect → Integrations](https://appstoreconnect.apple.com/access/integrations/api)
2. Click **"Team Keys"** tab (not Individual Keys)
3. Click **"+"** to generate new key
4. Download `.p8` file (only downloadable once!)
5. Note the **Key ID** and **Issuer ID**

### 2. Get Vendor Number

1. Go to [App Store Connect → Sales and Trends](https://appstoreconnect.apple.com/trends/reports)
2. Your vendor number is in the URL or account settings

### 3. Add Environment Variables

In Vercel/Netlify project → **Settings → Environment Variables**:

| Variable          | Value                          |
| ----------------- | ------------------------------ |
| `ASC_ISSUER_ID`   | Your Issuer ID                 |
| `ASC_KEY_ID`      | Your Key ID                    |
| `ASC_PRIVATE_KEY` | Base64 of .p8 file (see below) |
| `VENDOR_NUMBER`   | Your vendor number             |

**To base64 encode the .p8 file:**

```bash
base64 -i AuthKey_XXXXX.p8 | tr -d '\n'
```

### 4. Redeploy

After adding env variables, trigger a redeploy in the dashboard.

---

## Testing

1. Go to `https://your-site.vercel.app/admin.html` (or Netlify URL)
2. Enter password: `lotriflow2024`
3. Click **"Fetch from API"** button
4. Stats should populate automatically

---

## Files Reference

- `admin.html` - Password-protected dashboard
- `api/stats.js` - Serverless function for App Store API
- `vercel.json` - Deployment config (works for Vercel, adaptable for Netlify)
