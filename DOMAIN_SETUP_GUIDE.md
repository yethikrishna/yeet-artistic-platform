# 🌐 YEET.MINIMAX.IO Domain Setup Guide

## Complete Domain Configuration for YEET Artistic Platform

This guide will help you configure the yeet.minimax.io domain to point to your YEET artistic community platform.

---

## 📋 Prerequisites

Before starting domain setup:
- ✅ YEET platform deployed and accessible (currently at https://6s1u9h74yr.space.minimax.io)
- ✅ Access to MiniMax domain management panel
- ✅ Hosting provider account (where your website is deployed)
- ✅ SSL certificate capability for HTTPS

---

## 🎯 Domain Setup Overview

**Target**: Configure `yeet.minimax.io` to serve your YEET platform
**Current Status**: Platform deployed at temporary URL
**Goal**: Seamless redirect from yeet.minimax.io to your platform

---

## 🔧 Step 1: MiniMax Domain Configuration

### 1.1 Access MiniMax Domain Panel
```
1. Log into your MiniMax account
2. Navigate to Domain Management / DNS Settings
3. Look for subdomain configuration options
4. Find "minimax.io" domain settings
```

### 1.2 Create Subdomain Record
Add the following DNS record:
```
Type: CNAME
Name: yeet
Target: 6s1u9h74yr.space.minimax.io
TTL: 300 (5 minutes) for testing, 3600 (1 hour) for production
```

**Alternative A Record Setup:**
```
Type: A
Name: yeet
IP Address: [Get IP of 6s1u9h74yr.space.minimax.io]
TTL: 3600
```

---

## 🚀 Step 2: Get Target IP Address

Find the IP address of your current deployment:

```bash
# Method 1: Using nslookup
nslookup 6s1u9h74yr.space.minimax.io

# Method 2: Using dig
dig 6s1u9h74yr.space.minimax.io

# Method 3: Using ping
ping 6s1u9h74yr.space.minimax.io
```

---

## 🔒 Step 3: SSL Certificate Setup

### 3.1 Generate SSL Certificate

**Option A: Let's Encrypt (Free)**
```bash
# Install Certbot
sudo apt-get install certbot

# Generate certificate for yeet.minimax.io
sudo certbot certonly --standalone -d yeet.minimax.io
```

**Option B: Cloudflare (Recommended)**
1. Add yeet.minimax.io to Cloudflare
2. Update nameservers at MiniMax to point to Cloudflare
3. Enable "Full (Strict)" SSL mode
4. Set up automatic certificate renewal

### 3.2 Configure Web Server

**For Nginx:**
```nginx
server {
    listen 80;
    server_name yeet.minimax.io;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yeet.minimax.io;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**For Apache:**
```apache
<VirtualHost *:80>
    ServerName yeet.minimax.io
    Redirect permanent / https://yeet.minimax.io/
</VirtualHost>

<VirtualHost *:443>
    ServerName yeet.minimax.io
    
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    ProxyPreserveHost On
</VirtualHost>
```

---

## 🌟 Step 4: Platform Configuration Updates

### 4.1 Update Environment Variables

Update your YEET platform configuration:

```bash
# In your .env file
DOMAIN_NAME=yeet.minimax.io
BASE_URL=https://yeet.minimax.io
CORS_ORIGIN=https://yeet.minimax.io
```

### 4.2 Update Frontend Configuration

**Update package.json:**
```json
{
  "homepage": "https://yeet.minimax.io",
  "scripts": {
    "deploy": "npm run build && deploy-to-production"
  }
}
```

**Update React App Configuration:**
```typescript
// src/config/constants.ts
export const APP_CONFIG = {
  BASE_URL: 'https://yeet.minimax.io',
  API_URL: 'https://yeet.minimax.io/api',
  DOMAIN: 'yeet.minimax.io'
};
```

---

## 🔍 Step 5: DNS Propagation & Testing

### 5.1 Check DNS Propagation
```bash
# Check if DNS has propagated
nslookup yeet.minimax.io

# Test from different locations
# Use online tools like:
# - whatsmydns.net
# - dnschecker.org
```

### 5.2 Test Website Access
```bash
# Test HTTP redirect
curl -I http://yeet.minimax.io

# Test HTTPS access
curl -I https://yeet.minimax.io

# Test full page load
curl https://yeet.minimax.io
```

---

## 🚨 Step 6: Troubleshooting Common Issues

### 6.1 DNS Not Resolving
```bash
# Clear local DNS cache
sudo systemctl flush-dns     # Linux
sudo dscacheutil -flushcache # macOS
ipconfig /flushdns          # Windows

# Check DNS propagation globally
dig @8.8.8.8 yeet.minimax.io
dig @1.1.1.1 yeet.minimax.io
```

### 6.2 SSL Certificate Issues
```bash
# Check certificate validity
openssl s_client -connect yeet.minimax.io:443 -servername yeet.minimax.io

# Verify certificate chain
curl -vI https://yeet.minimax.io
```

### 6.3 CORS Issues
Update your backend CORS configuration:
```javascript
// In your Express server
app.use(cors({
  origin: [
    'https://yeet.minimax.io',
    'http://localhost:3000'  // For development
  ],
  credentials: true
}));
```

---

## 📊 Step 7: Performance Optimization

### 7.1 Enable Cloudflare Features
- ✅ Enable "Always Use HTTPS"
- ✅ Set "Security Level" to Medium
- ✅ Enable "Brotli" compression
- ✅ Set "Caching Level" to Standard
- ✅ Enable "Auto Minify" for HTML, CSS, JS

### 7.2 Configure CDN
```javascript
// Update asset URLs to use CDN
const CDN_URL = 'https://cdn.yeet.minimax.io';
```

---

## 🎯 Step 8: Final Verification Checklist

### ✅ Domain Configuration Checklist
- [ ] DNS CNAME/A record created for yeet.minimax.io
- [ ] DNS propagation completed (24-48 hours max)
- [ ] SSL certificate installed and valid
- [ ] HTTP to HTTPS redirect working
- [ ] Website loads correctly at https://yeet.minimax.io
- [ ] All assets (images, CSS, JS) loading via HTTPS
- [ ] API endpoints accessible via new domain
- [ ] Email notifications updated with new domain
- [ ] Social media links updated
- [ ] Search engines notified of domain change

### ✅ Performance Checklist
- [ ] Page load time < 3 seconds
- [ ] SSL Labs rating A or A+
- [ ] Mobile responsiveness working
- [ ] All terminal commands functional
- [ ] ART KEYS system working
- [ ] Portfolio uploads functional
- [ ] Newsletter subscription working

---

## 🌐 Alternative Domain Setup Methods

### Method A: Direct IP Pointing
```
Type: A
Name: yeet
Value: [Your server IP]
TTL: 3600
```

### Method B: Cloudflare Proxy
```
1. Add yeet.minimax.io to Cloudflare
2. Set CNAME to point to your origin server
3. Enable Cloudflare proxy (orange cloud)
4. Configure SSL/TLS settings
```

### Method C: Load Balancer Setup
```
1. Set up load balancer
2. Point yeet.minimax.io to load balancer IP
3. Configure backend servers
4. Enable health checks
```

---

## 📞 Support Information

### MiniMax Support Contacts
- **Documentation**: Check MiniMax domain management docs
- **Support Ticket**: Submit via MiniMax customer portal
- **Live Chat**: Available during business hours

### DNS Propagation Timeline
- **Local ISP**: 1-4 hours
- **Global Propagation**: 24-48 hours
- **Complete Propagation**: Up to 72 hours

### Emergency Rollback Plan
If issues occur:
```bash
# Revert DNS settings
# Point yeet.minimax.io back to original target
# Monitor for service restoration
```

---

## 🎉 Success Confirmation

Once setup is complete, you should see:

1. **https://yeet.minimax.io** loads your YEET platform
2. **YEET penguin mascot** displays correctly
3. **Terminal interface** responds to commands
4. **Creative Circles** system accessible
5. **ART KEYS** gamification working
6. **Portfolio uploads** functional
7. **All security features** operational

---

## 🚀 Post-Setup Optimization

### SEO Configuration
```html
<!-- Update meta tags -->
<meta property="og:url" content="https://yeet.minimax.io" />
<link rel="canonical" href="https://yeet.minimax.io" />
```

### Analytics Setup
```javascript
// Update Google Analytics
gtag('config', 'GA_TRACKING_ID', {
  page_location: 'https://yeet.minimax.io'
});
```

### Monitoring Setup
- Set up uptime monitoring for yeet.minimax.io
- Configure SSL certificate expiration alerts
- Monitor DNS resolution globally
- Track performance metrics

---

**🎯 Your YEET artistic community platform will be live at https://yeet.minimax.io once domain setup is complete!**

**Need immediate help?** The platform is currently accessible at: https://6s1u9h74yr.space.minimax.io