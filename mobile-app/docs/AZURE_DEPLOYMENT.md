# Azure Static Web Apps Deployment Guide

## Overview

QuitFlow is perfectly suited for **Azure Static Web Apps** - Microsoft's modern hosting solution for static sites and PWAs.

## Why Azure Static Web Apps?

✅ **Perfect for PWAs** - Automatic HTTPS, global CDN
✅ **Free Tier** - 100 GB bandwidth/month, custom domains
✅ **GitHub Integration** - Auto-deploy on push
✅ **Staging Environments** - Preview deployments for PRs
✅ **Azure Functions Ready** - Easy to add backend later
✅ **Custom Domains** - Free SSL certificates
✅ **Built-in Authentication** - Azure AD, GitHub, Twitter

## Deployment Options

### Option 1: Azure Static Web Apps (Recommended)

**Easiest deployment with GitHub integration**

#### Prerequisites

- Azure account (free tier available)
- GitHub repository
- Azure CLI (optional)

---

### Quick Deployment via Azure Portal

#### Step 1: Create Static Web App

1. Go to [Azure Portal](https://portal.azure.com)
2. Search for "Static Web Apps"
3. Click **Create**

#### Step 2: Configure Basics

- **Subscription**: Your subscription
- **Resource Group**: Create new → `quitflow-rg`
- **Name**: `quitflow-app`
- **Plan Type**: **Free** (100 GB/month bandwidth)
- **Region**: Choose closest to your users
- **Deployment**: **GitHub**

#### Step 3: GitHub Configuration

1. Click **Sign in with GitHub**
2. **Organization**: Your GitHub username
3. **Repository**: Select your QuitFlow repo
4. **Branch**: `master` or `main`

#### Step 4: Build Configuration

Since QuitFlow is a pure static PWA (no build step needed):

- **Build Presets**: Custom
- **App location**: `/`
- **Api location**: (leave empty)
- **Output location**: `/`

#### Step 5: Review and Create

1. Click **Review + Create**
2. Click **Create**
3. Wait ~2 minutes for deployment

**Result**: Live at `https://quitflow-app.azurestaticapps.net` 🎉

---

### Deployment via Azure CLI

#### Install Azure CLI

```bash
# Windows (PowerShell)
winget install Microsoft.AzureCLI

# Or download from: https://aka.ms/installazurecliwindows
```

#### Login

```bash
az login
```

#### Create Static Web App

```bash
# Set variables
RESOURCE_GROUP="quitflow-rg"
APP_NAME="quitflow-app"
LOCATION="eastus2"
GITHUB_REPO="YOUR_USERNAME/quitflow"
BRANCH="master"

# Create resource group
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

# Create static web app
az staticwebapp create \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --source https://github.com/$GITHUB_REPO \
  --location $LOCATION \
  --branch $BRANCH \
  --app-location "/" \
  --output-location "/" \
  --login-with-github
```

#### Get URL

```bash
az staticwebapp show \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "defaultHostname" \
  --output tsv
```

---

### Manual Deployment via SWA CLI

#### Install SWA CLI

```bash
npm install -g @azure/static-web-apps-cli
```

#### Deploy

```bash
cd c:\BreatheFree

# Login
az login

# Deploy
swa deploy \
  --app-location . \
  --output-location . \
  --deployment-token YOUR_DEPLOYMENT_TOKEN
```

**Get Deployment Token**:
1. Azure Portal → Your Static Web App
2. Settings → Configuration
3. Copy deployment token

---

## GitHub Actions Workflow (Auto-Generated)

Azure automatically creates `.github/workflows/azure-static-web-apps-*.yml`:

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - master
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - master

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true

      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/" # App source code path
          api_location: "" # Api source code path - optional
          output_location: "/" # Built app content directory

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

**What This Does:**
- ✅ Deploys on every push to master
- ✅ Creates staging environment for PRs
- ✅ Closes staging when PR is merged
- ✅ Automatic cache invalidation

---

## Custom Domain Configuration

### Step 1: Add Custom Domain

```bash
az staticwebapp hostname set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --hostname app.yourdomain.com
```

### Step 2: Configure DNS

Add a CNAME record in your DNS provider:

```
Type: CNAME
Name: app (or @)
Value: quitflow-app.azurestaticapps.net
TTL: 3600
```

### Step 3: Wait for SSL

Azure automatically provisions a free SSL certificate (Let's Encrypt).
Usually takes 5-15 minutes.

---

## Configuration Files

### staticwebapp.config.json

Create in project root for advanced configuration:

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/assets/*", "/src/*", "*.{js,css,png,jpg,svg,ico,json}"]
  },
  "routes": [
    {
      "route": "/sw.js",
      "headers": {
        "cache-control": "no-cache, no-store, must-revalidate",
        "content-type": "application/javascript"
      }
    },
    {
      "route": "/manifest.json",
      "headers": {
        "cache-control": "no-cache, must-revalidate",
        "content-type": "application/manifest+json"
      }
    },
    {
      "route": "/assets/*",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "route": "/src/*",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    }
  ],
  "globalHeaders": {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "mimeTypes": {
    ".json": "application/json",
    ".js": "application/javascript",
    ".css": "text/css"
  },
  "responseOverrides": {
    "404": {
      "rewrite": "/index.html",
      "statusCode": 200
    }
  }
}
```

---

## Environment Variables

### Add Secrets (if needed later)

```bash
# Via CLI
az staticwebapp appsettings set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --setting-names API_KEY="your-secret-key"
```

Or in Azure Portal:
1. Your Static Web App → Settings → Configuration
2. Click **Add**
3. Name: `API_KEY`, Value: `your-secret-key`

---

## Monitoring & Analytics

### Built-in Monitoring

Azure Static Web Apps includes:
- ✅ Request logs
- ✅ Performance metrics
- ✅ Error tracking
- ✅ Traffic analytics

**Access**:
1. Azure Portal → Your Static Web App
2. Monitoring → Metrics

### Application Insights (Optional)

```bash
# Create Application Insights
az monitor app-insights component create \
  --app quitflow-insights \
  --location eastus2 \
  --resource-group $RESOURCE_GROUP
```

Add to your HTML:
```html
<script src="https://js.monitor.azure.com/scripts/b/ai.2.min.js"></script>
<script>
  var appInsights = window.appInsights || function(config) {
    // Your instrumentation key here
  };
</script>
```

---

## Staging Environments

### Preview Deployments

Azure automatically creates staging environments for PRs:

1. Create a Pull Request
2. Wait for build (~1-2 min)
3. Get preview URL: `https://quitflow-app-{pr-number}.azurestaticapps.net`
4. Test changes
5. Merge → auto-deploy to production

**Benefits:**
- ✅ Test before merging
- ✅ Share preview links
- ✅ Auto-cleanup on merge

---

## Cost Estimate

### Free Tier (Most Apps)

**Included:**
- 100 GB bandwidth/month
- 0.5 GB storage
- 2 custom domains
- Free SSL certificates
- Unlimited staging environments

**Cost**: **FREE** 🎉

### Standard Tier (High Traffic)

**If you exceed free tier:**
- $9/month base
- $0.20/GB bandwidth after 100 GB
- Additional storage: $0.10/GB

**Typical Cost**: $0-20/month for most apps

---

## Deployment Scripts

### deploy.sh

```bash
#!/bin/bash
set -e

echo "🚀 Deploying QuitFlow to Azure Static Web Apps..."

# Variables
RESOURCE_GROUP="quitflow-rg"
APP_NAME="quitflow-app"

# Check if logged in
az account show > /dev/null 2>&1 || az login

# Deploy
echo "📦 Uploading files..."
az staticwebapp upload \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --source .

echo "✅ Deployment complete!"
echo "🌐 Visit: https://$APP_NAME.azurestaticapps.net"
```

Make executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## CI/CD Integration

### GitHub Actions (Recommended)

Already covered above - auto-created by Azure.

### Azure DevOps Pipelines

`azure-pipelines.yml`:

```yaml
trigger:
  - master

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: AzureStaticWebApp@0
    inputs:
      app_location: '/'
      output_location: '/'
      azure_static_web_apps_api_token: $(deployment_token)
```

---

## Testing & Validation

### Local Testing with SWA CLI

```bash
# Install
npm install -g @azure/static-web-apps-cli

# Run local emulator
swa start . --port 8080

# Open browser
start http://localhost:8080
```

**Benefits:**
- Test routing rules
- Test headers
- Test authentication (if added)
- Test service worker

### Validate PWA

After deployment, test:

1. **HTTPS**: ✅ Auto-enabled
2. **Manifest**: Visit `/manifest.json`
3. **Service Worker**: DevTools → Application → Service Workers
4. **Install Prompt**: Should appear on mobile
5. **Offline**: DevTools → Network → Offline

```javascript
// Console tests
// 1. Check manifest
fetch('/manifest.json').then(r => r.json()).then(console.log);

// 2. Check service worker
navigator.serviceWorker.getRegistrations().then(console.log);

// 3. Check storage
Storage.get('quitflow_state').then(console.log);
```

---

## Troubleshooting

### Build Fails

**Cause**: Wrong app_location or output_location

**Fix**: Update `staticwebapp.config.json` or GitHub workflow:
```yaml
app_location: "/"
output_location: "/"
```

### Service Worker Not Working

**Cause**: Caching or MIME type

**Fix**: Add to `staticwebapp.config.json`:
```json
{
  "routes": [
    {
      "route": "/sw.js",
      "headers": {
        "cache-control": "no-cache",
        "content-type": "application/javascript"
      }
    }
  ]
}
```

### Custom Domain Not Working

**Cause**: DNS not propagated or SSL provisioning

**Fix**:
1. Wait 15-30 minutes for DNS
2. Check DNS: `nslookup app.yourdomain.com`
3. Verify CNAME points to `.azurestaticapps.net`

### 404 Errors

**Cause**: SPA routing not configured

**Fix**: Add to `staticwebapp.config.json`:
```json
{
  "navigationFallback": {
    "rewrite": "/index.html"
  }
}
```

---

## Security Best Practices

### 1. Enable Security Headers

Already in `staticwebapp.config.json` above.

### 2. Content Security Policy

Add to `staticwebapp.config.json`:
```json
{
  "globalHeaders": {
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:;"
  }
}
```

### 3. Authentication (Optional)

If you add user accounts later:

```json
{
  "auth": {
    "identityProviders": {
      "azureActiveDirectory": {
        "registration": {
          "clientIdSettingName": "AAD_CLIENT_ID",
          "clientSecretSettingName": "AAD_CLIENT_SECRET"
        }
      }
    }
  }
}
```

---

## Backup & Disaster Recovery

### Enable Geo-Replication

Azure Static Web Apps automatically replicates to multiple regions.

### Backup Strategy

1. **Git Repository**: Source of truth (already backed up)
2. **User Data**: Stored in Capacitor Preferences (on-device)
3. **No server data**: Nothing to back up!

---

## Comparison: Azure vs AWS vs Others

| Feature | Azure SWA | AWS Amplify | Vercel | Netlify |
|---------|-----------|-------------|--------|---------|
| **Free Tier** | 100 GB/mo | 15 GB/mo | 100 GB/mo | 100 GB/mo |
| **Custom Domains** | ✅ Free SSL | ✅ Free SSL | ✅ Free SSL | ✅ Free SSL |
| **Staging Envs** | ✅ Unlimited | ❌ Paid | ✅ Limited | ✅ Limited |
| **Backend** | Azure Functions | Lambda | Serverless | Functions |
| **Auth** | Built-in | Amplify Auth | Auth0 | Identity |
| **Price** | **FREE** | ~$1-5/mo | FREE | FREE |

**Winner for QuitFlow**: Azure SWA or Netlify

---

## Migration from AWS

If you already deployed to AWS:

1. Keep AWS running
2. Deploy to Azure (takes 5 min)
3. Test Azure URL
4. Update DNS to point to Azure
5. Delete AWS resources

**Zero downtime migration!**

---

## Quick Start Commands

```bash
# 1. Install Azure CLI
winget install Microsoft.AzureCLI

# 2. Login
az login

# 3. Create Static Web App
az staticwebapp create \
  --name quitflow-app \
  --resource-group quitflow-rg \
  --source https://github.com/YOUR_USERNAME/BreatheFree \
  --branch master \
  --app-location "/" \
  --output-location "/" \
  --login-with-github

# 4. Get URL
az staticwebapp show \
  --name quitflow-app \
  --resource-group quitflow-rg \
  --query "defaultHostname" -o tsv

# 5. Open in browser
start https://quitflow-app.azurestaticapps.net
```

---

## Resources

- **Azure Static Web Apps Docs**: https://docs.microsoft.com/azure/static-web-apps/
- **SWA CLI**: https://azure.github.io/static-web-apps-cli/
- **Pricing**: https://azure.microsoft.com/pricing/details/app-service/static/
- **GitHub Actions**: https://docs.github.com/actions
- **Community**: https://github.com/Azure/static-web-apps

---

## Summary

**QuitFlow is 100% ready for Azure Static Web Apps!**

✅ **No changes needed** - Deploy as-is
✅ **5-minute setup** - Via Azure Portal or CLI
✅ **Free tier perfect** - 100 GB bandwidth included
✅ **Auto-deploy** - Push to GitHub → Live in 2 minutes
✅ **PWA-optimized** - HTTPS, caching, headers all configured
✅ **Capacitor-ready** - Works seamlessly with mobile builds

**Recommended**: Use Azure Static Web Apps with GitHub integration for the best developer experience! 🚀
