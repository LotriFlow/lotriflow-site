# AWS Static Site Deployment Guide

## Overview

QuitFlow is a Progressive Web App (PWA) that can be deployed entirely as a static site on AWS. No backend server required!

## Why AWS Static Hosting?

✅ **100% Compatible** - Pure HTML/CSS/JS
✅ **No Server Needed** - All logic runs in browser
✅ **Global CDN** - Fast loading worldwide
✅ **HTTPS Required** - PWAs need SSL (AWS provides free)
✅ **Scalable** - Handle millions of users
✅ **Cost-Effective** - Pay only for bandwidth

## Deployment Options

### Option 1: AWS Amplify (Recommended)

**Fastest and easiest deployment with CI/CD**

#### Setup

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure AWS credentials
amplify configure

# Initialize project
cd c:\BreatheFree
amplify init
# Project name: quitflow
# Environment: production
# Editor: VS Code
# Type: javascript
# Framework: none
# Source directory: .
# Distribution directory: .
# Build command: (leave empty)
# Start command: (leave empty)

# Add hosting
amplify add hosting
# Select: Hosting with Amplify Console
# Type: Manual deployment

# Publish
amplify publish
```

#### GitHub Integration

1. Go to AWS Amplify Console
2. Click "New App" → "Host web app"
3. Connect to GitHub
4. Select your repository
5. Build settings (auto-detected):
   ```yaml
   version: 1
   frontend:
     phases:
       build:
         commands:
           - npm ci
     artifacts:
       baseDirectory: /
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```
6. Deploy!

**Result**: Auto-deploy on every push to main

---

### Option 2: S3 + CloudFront (Manual Control)

**Best for custom configurations and learning AWS**

#### Step 1: Create S3 Bucket

```bash
# Create bucket
aws s3 mb s3://quitflow-app --region us-east-1

# Enable versioning (optional)
aws s3api put-bucket-versioning \
  --bucket quitflow-app \
  --versioning-configuration Status=Enabled
```

#### Step 2: Configure S3 Static Website

```bash
# Create bucket policy (public read)
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::quitflow-app/*"
    }
  ]
}
EOF

# Apply policy
aws s3api put-bucket-policy \
  --bucket quitflow-app \
  --policy file://bucket-policy.json

# Enable static website hosting
aws s3 website s3://quitflow-app \
  --index-document index.html \
  --error-document index.html
```

#### Step 3: Upload Files

```bash
cd c:\BreatheFree

# Upload all files
aws s3 sync . s3://quitflow-app \
  --exclude ".git/*" \
  --exclude "node_modules/*" \
  --exclude ".claude/*" \
  --exclude "*.md" \
  --exclude "android/*" \
  --exclude "ios/*" \
  --cache-control "public, max-age=31536000"

# Override cache for HTML/manifest/SW (always check for updates)
aws s3 cp index.html s3://quitflow-app/index.html \
  --cache-control "no-cache, must-revalidate"
aws s3 cp manifest.json s3://quitflow-app/manifest.json \
  --cache-control "no-cache, must-revalidate"
aws s3 cp sw.js s3://quitflow-app/sw.js \
  --cache-control "no-cache, must-revalidate"
```

#### Step 4: Create CloudFront Distribution

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name quitflow-app.s3-website-us-east-1.amazonaws.com \
  --default-root-object index.html
```

Or use AWS Console:
1. CloudFront → Create Distribution
2. Origin: `quitflow-app.s3-website-us-east-1.amazonaws.com`
3. Viewer Protocol: Redirect HTTP to HTTPS
4. Compress Objects: Yes
5. Default Root Object: `index.html`
6. Custom Error Responses:
   - 404 → /index.html (200)
   - 403 → /index.html (200)

#### Step 5: Configure Custom Domain (Optional)

1. Request SSL certificate in ACM (us-east-1 region)
2. Add domain to CloudFront distribution
3. Update DNS (Route 53 or your provider):
   ```
   Type: CNAME
   Name: app.yourdomain.com
   Value: d123456.cloudfront.net
   ```

---

### Option 3: S3 Only (Budget/Testing)

**Cheapest option, no CDN**

```bash
# Create and configure bucket
aws s3 mb s3://quitflow-app
aws s3 website s3://quitflow-app --index-document index.html

# Upload files
aws s3 sync . s3://quitflow-app --exclude ".git/*"

# Make public
aws s3api put-bucket-policy --bucket quitflow-app --policy '{
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::quitflow-app/*"
  }]
}'
```

**Access**: `http://quitflow-app.s3-website-us-east-1.amazonaws.com`

⚠️ **Note**: HTTP only (no PWA features) - use CloudFront for HTTPS

---

## Important Configurations

### MIME Types

Ensure correct content types:
```bash
# Manifest
aws s3 cp manifest.json s3://quitflow-app/ \
  --content-type "application/manifest+json"

# Service Worker
aws s3 cp sw.js s3://quitflow-app/ \
  --content-type "application/javascript"
```

### Cache Control

```bash
# Static assets (long cache)
aws s3 sync src/ s3://quitflow-app/src/ \
  --cache-control "public, max-age=31536000, immutable"

# HTML/Manifest (no cache)
aws s3 cp index.html s3://quitflow-app/ \
  --cache-control "no-cache, no-store, must-revalidate"
```

### Service Worker Considerations

The service worker (sw.js) MUST be served with:
- ✅ HTTPS
- ✅ Correct MIME type (`application/javascript`)
- ✅ Same origin as the site
- ✅ No-cache headers (to get updates quickly)

---

## Costs Estimate

### Amplify Hosting
- **Free Tier**: 1000 build minutes/month, 15 GB served
- **After Free Tier**: ~$0.01 per build minute, $0.15/GB bandwidth
- **Estimated**: $1-5/month for small app

### S3 + CloudFront
- **S3 Storage**: $0.023/GB/month
- **CloudFront**: $0.085/GB (first 10 TB)
- **Estimated**: $0.50-3/month for small app

### S3 Only
- **Storage**: $0.023/GB/month
- **Requests**: $0.0004 per 1000 GET requests
- **Estimated**: $0.10-0.50/month

---

## Deployment Scripts

### deploy.sh (Amplify)

```bash
#!/bin/bash
set -e

echo "🚀 Deploying QuitFlow to AWS Amplify..."

# Install dependencies
npm install

# Deploy
amplify publish --yes

echo "✅ Deployment complete!"
```

### deploy-s3.sh (S3 + CloudFront)

```bash
#!/bin/bash
set -e

BUCKET="quitflow-app"
DISTRIBUTION_ID="YOUR_CLOUDFRONT_ID"

echo "🚀 Deploying QuitFlow to S3..."

# Sync files
aws s3 sync . s3://$BUCKET \
  --exclude ".git/*" \
  --exclude "node_modules/*" \
  --exclude "*.md" \
  --delete

# Fix cache control
aws s3 cp s3://$BUCKET/index.html s3://$BUCKET/index.html \
  --metadata-directive REPLACE \
  --cache-control "no-cache" \
  --content-type "text/html"

aws s3 cp s3://$BUCKET/sw.js s3://$BUCKET/sw.js \
  --metadata-directive REPLACE \
  --cache-control "no-cache" \
  --content-type "application/javascript"

# Invalidate CloudFront cache
echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"

echo "✅ Deployment complete!"
echo "🌐 Visit: https://your-domain.com"
```

---

## Post-Deployment Checklist

After deployment, verify:

- [ ] Site loads over HTTPS
- [ ] PWA install prompt appears (Chrome DevTools → Application → Manifest)
- [ ] Service Worker registers (Application → Service Workers)
- [ ] Offline mode works (DevTools → Network → Offline)
- [ ] All assets load (no 404s)
- [ ] Manifest.json accessible
- [ ] Icons display correctly
- [ ] Storage works (test settings save)

### Test PWA Features

```javascript
// Open DevTools Console

// 1. Check Service Worker
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs.length);
});

// 2. Check Storage
Storage.get('quitflow_state').then(val => {
  console.log('Storage works:', !!val);
});

// 3. Check Manifest
fetch('/manifest.json').then(r => r.json()).then(m => {
  console.log('Manifest:', m.name);
});
```

---

## Troubleshooting

### PWA Install Prompt Not Showing

**Cause**: Not served over HTTPS or manifest issues

**Fix**:
1. Ensure CloudFront uses HTTPS
2. Check manifest.json loads correctly
3. Verify icons are accessible

### Service Worker Not Registering

**Cause**: Wrong MIME type or not HTTPS

**Fix**:
```bash
# Set correct content type
aws s3 cp sw.js s3://quitflow-app/sw.js \
  --content-type "application/javascript" \
  --cache-control "no-cache"
```

### Assets Not Loading

**Cause**: Incorrect paths or CORS

**Fix**: All paths in index.html should be relative (`src/app.js` not `/src/app.js`)

### App Not Updating

**Cause**: Aggressive caching

**Fix**:
```bash
# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id YOUR_ID \
  --paths "/*"
```

---

## CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy to S3
        run: |
          aws s3 sync . s3://quitflow-app \
            --exclude ".git/*" \
            --delete

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_ID }} \
            --paths "/*"
```

---

## Security Best Practices

1. **Enable CloudFront**: Always use HTTPS
2. **Bucket Policy**: Restrict to CloudFront only (use OAI)
3. **Headers**: Add security headers via CloudFront
4. **Monitoring**: Enable CloudWatch logs
5. **Backup**: Enable S3 versioning

---

## Monitoring & Analytics

### Add CloudWatch Alarms

```bash
# Monitor 4xx errors
aws cloudwatch put-metric-alarm \
  --alarm-name quitflow-4xx-errors \
  --metric-name 4xxErrorRate \
  --namespace AWS/CloudFront \
  --statistic Average \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold
```

### Add Google Analytics

Already included in the app - just ensure it loads over HTTPS.

---

## Need Help?

- **AWS Amplify Docs**: https://docs.amplify.aws/
- **S3 Static Hosting**: https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html
- **CloudFront Guide**: https://docs.aws.amazon.com/cloudfront/
- **PWA on AWS**: https://aws.amazon.com/blogs/mobile/building-pwas/

---

## Summary

**Recommended**: Use AWS Amplify for easiest deployment with CI/CD
**Alternative**: S3 + CloudFront for more control
**Testing**: S3-only for quick testing (HTTP)

Your QuitFlow app is 100% ready for AWS static hosting! 🚀
