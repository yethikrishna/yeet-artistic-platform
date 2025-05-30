# 🚀 YEET Platform - Vercel Deployment Guide

## 🌟 Vercel Deployment Setup

### ✅ Prerequisites
- GitHub repository: https://github.com/yethikrishna/yeet-artistic-platform
- Vercel account: https://vercel.com

## 🚀 Quick Deployment Steps

### Step 1: Connect to Vercel
1. **Go to**: https://vercel.com/new
2. **Import Git Repository**
3. **Select**: yethikrishna/yeet-artistic-platform
4. **Click**: Import

### Step 2: Configure Deployment
**Project Settings:**
- **Framework Preset**: Vite
- **Root Directory**: `yeet-website/`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 3: Environment Variables (Optional)
If you need environment variables:
- **NODE_ENV**: `production`
- **VITE_APP_TITLE**: `YEET Artistic Platform`
- **VITE_API_URL**: Your backend URL (if any)

### Step 4: Deploy
1. **Click**: Deploy
2. **Wait**: 2-3 minutes for build
3. **Success**: Your site will be live!

## 🌐 Expected Result

**Your YEET platform will be available at:**
- **Vercel URL**: `https://yeet-artistic-platform.vercel.app`
- **Custom Domain**: Configure in Vercel dashboard

## ⚙️ Configuration Files Added

### vercel.json
- ✅ Vercel deployment configuration
- ✅ Build and routing setup
- ✅ Security headers
- ✅ Framework detection

### .vercelignore
- ✅ Excludes unnecessary files
- ✅ Optimizes build size
- ✅ Faster deployments

### package.json (root)
- ✅ Vercel-compatible scripts
- ✅ All dependencies listed
- ✅ Build optimization

## 🔧 Troubleshooting

### Build Fails?
1. **Check**: Node.js version (use 18.x)
2. **Verify**: All dependencies in package.json
3. **Review**: Build logs in Vercel dashboard

### 404 Errors?
1. **Check**: Root directory is set to `yeet-website/`
2. **Verify**: Output directory is `dist`
3. **Ensure**: index.html exists in dist folder

### Slow Build?
1. **Enable**: Build cache in Vercel settings
2. **Optimize**: Dependencies in package.json
3. **Use**: Build output optimization

## 🎯 Custom Domain Setup

### Add Custom Domain (yeet.minimax.io)
1. **Go to**: Vercel project dashboard
2. **Click**: Settings → Domains
3. **Add**: yeet.minimax.io
4. **Configure**: DNS records as shown
5. **Wait**: For SSL certificate

### DNS Configuration
```
Type: CNAME
Name: yeet
Value: cname.vercel-dns.com
```

## 🚀 Automatic Deployments

**Every push to main branch will:**
- ✅ Trigger automatic build
- ✅ Deploy to production
- ✅ Update live site
- ✅ Send deployment notification

## 📊 Performance Optimization

### Build Size Optimization
- ✅ Code splitting enabled
- ✅ Vendor chunks separated
- ✅ Unused code eliminated
- ✅ Assets optimized

### Loading Performance
- ✅ Fast CDN delivery
- ✅ Edge locations worldwide
- ✅ Automatic compression
- ✅ Caching optimization

## 🔒 Security Features

### Headers Applied
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ HTTPS enforcement
- ✅ Security headers

## 🌟 Advanced Features

### Analytics
- **Enable**: Vercel Analytics in dashboard
- **Track**: Page views, performance
- **Monitor**: Core Web Vitals

### Preview Deployments
- **Every PR**: Gets preview URL
- **Test**: Changes before merge
- **Share**: Preview with team

## 🆘 Support

### Resources
- **Vercel Docs**: https://vercel.com/docs
- **Support**: https://vercel.com/support
- **Community**: https://github.com/vercel/vercel

### Contact
- **Project**: YEET Artistic Platform
- **Owner**: Yethikrishna R
- **Repository**: https://github.com/yethikrishna/yeet-artistic-platform

---

**🎨 Your revolutionary artistic community platform will be live on Vercel in minutes!**

*"Fusing Carnatic tradition with modern innovation"* - Yethikrishna R
