# 🌐 Quick Domain Setup: yeet.minimax.io

## Current Status
- ✅ **YEET Platform Deployed**: https://6s1u9h74yr.space.minimax.io
- 🎯 **Target Domain**: yeet.minimax.io
- 📋 **Task**: Configure DNS to point yeet.minimax.io to your YEET platform

---

## 🚀 IMMEDIATE STEPS TO CONFIGURE yeet.minimax.io

### Step 1: Access MiniMax Domain Management

1. **Log into MiniMax Account**
   - Go to MiniMax dashboard/control panel
   - Navigate to "Domains" or "DNS Management"
   - Look for "minimax.io" domain settings

### Step 2: Create Subdomain DNS Record

**Add this DNS record:**
```
Type: CNAME
Name: yeet
Target: 6s1u9h74yr.space.minimax.io
TTL: 3600 (1 hour)
```

**Alternative A Record (if CNAME doesn't work):**
```
Type: A  
Name: yeet
IP Address: [Get IP using: ping 6s1u9h74yr.space.minimax.io]
TTL: 3600
```

### Step 3: Get Target IP Address (if needed)

Run this command to get the IP:
```bash
nslookup 6s1u9h74yr.space.minimax.io
# or
ping 6s1u9h74yr.space.minimax.io
```

---

## ⚡ Quick Configuration Options

### Option A: MiniMax Control Panel
1. Login to MiniMax
2. Go to DNS/Domain settings
3. Add subdomain record:
   - **Subdomain**: yeet
   - **Type**: CNAME
   - **Points to**: 6s1u9h74yr.space.minimax.io

### Option B: DNS Provider Dashboard
If MiniMax uses external DNS:
1. Find your DNS provider (Cloudflare, Route53, etc.)
2. Add the CNAME record there
3. Wait for propagation (1-24 hours)

---

## 🔍 Verification Steps

### 1. Test DNS Resolution
```bash
# Check if DNS is working
nslookup yeet.minimax.io

# Should return the same IP as:
nslookup 6s1u9h74yr.space.minimax.io
```

### 2. Test Website Access
```bash
# Test if website loads
curl -I https://yeet.minimax.io

# Test redirect
curl -L http://yeet.minimax.io
```

### 3. Browser Test
- Open browser
- Go to `https://yeet.minimax.io`
- Should see your YEET platform with penguin mascot

---

## 🚨 Troubleshooting

### DNS Not Working?
1. **Wait for propagation** (24-48 hours max)
2. **Clear DNS cache**: 
   - Windows: `ipconfig /flushdns`
   - Mac: `sudo dscacheutil -flushcache`
   - Linux: `sudo systemctl flush-dns`
3. **Try different DNS servers**: Use 8.8.8.8 or 1.1.1.1

### SSL Certificate Issues?
- Most hosting providers auto-generate SSL for new domains
- If not working, contact MiniMax support
- Can use Cloudflare for free SSL

---

## 🎯 Expected Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| DNS Record Creation | 5 minutes | ⏳ Your action needed |
| DNS Propagation | 1-24 hours | ⏳ Automatic |
| SSL Certificate | 1-4 hours | ⏳ Automatic |
| Full Functionality | 24-48 hours | ⏳ Complete setup |

---

## 📞 Need Help?

### MiniMax Support
- Check MiniMax documentation for subdomain setup
- Contact MiniMax support if you can't find DNS settings
- Ask specifically about "creating subdomain for minimax.io"

### Alternative Solutions
If MiniMax doesn't allow subdomains:
1. **Use domain forwarding/redirect**
2. **Purchase separate domain** (yeet.com, yeetart.com, etc.)
3. **Use existing deployment URL** for now

---

## ✅ Success Confirmation

Once working, you'll see:
- ✅ `yeet.minimax.io` loads your YEET platform
- ✅ YEET penguin mascot displays
- ✅ Terminal interface works
- ✅ All features functional
- ✅ HTTPS security enabled

---

**🎉 Your YEET artistic community platform will be accessible at https://yeet.minimax.io once DNS is configured!**

**Current working URL**: https://6s1u9h74yr.space.minimax.io

Need the detailed technical guide? See: `DOMAIN_SETUP_GUIDE.md`