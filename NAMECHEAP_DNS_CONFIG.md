# Namecheap DNS Configuration for reeledai.com

## 🎯 **Your Domain Mappings Are Ready!**

Google Cloud has created domain mappings for both domains:
- ✅ **www.reeledai.com** → CNAME record needed
- ✅ **reeledai.com** → A/AAAA records needed

## 📋 **DNS Records to Add in Namecheap**

### **Step 1: Log into Namecheap**
1. Go to [Namecheap.com](https://namecheap.com) and log in
2. Click **"Domain List"**
3. Click **"Manage"** next to your `reeledai.com` domain
4. Click **"Advanced DNS"** tab

### **Step 2: Add DNS Records**

#### **For www.reeledai.com (CNAME Record):**
```
Type: CNAME
Host: www
Value: ghs.googlehosted.com
TTL: 300 (or Automatic)
```

#### **For reeledai.com (A Records):**
```
Type: A
Host: @
Value: 216.239.32.21
TTL: 300

Type: A
Host: @
Value: 216.239.34.21
TTL: 300

Type: A
Host: @
Value: 216.239.36.21
TTL: 300

Type: A
Host: @
Value: 216.239.38.21
TTL: 300
```

#### **For reeledai.com (AAAA Records - IPv6):**
```
Type: AAAA
Host: @
Value: 2001:4860:4802:32::15
TTL: 300

Type: AAAA
Host: @
Value: 2001:4860:4802:34::15
TTL: 300

Type: AAAA
Host: @
Value: 2001:4860:4802:36::15
TTL: 300

Type: AAAA
Host: @
Value: 2001:4860:4802:38::15
TTL: 300
```

## 🔍 **Verification Commands**

After adding the DNS records, verify they're working:

```bash
# Check www subdomain
nslookup www.reeledai.com
dig www.reeledai.com

# Check root domain
nslookup reeledai.com
dig reeledai.com

# Check both domains
curl -I https://www.reeledai.com
curl -I https://reeledai.com
```

## ⏰ **Timeline**

- **DNS Propagation:** 24-48 hours
- **SSL Certificate:** Automatically provisioned by Google Cloud
- **Both domains will work:** Once DNS propagates

## 🌐 **Final URLs**

Once DNS propagates, your app will be available at:
- **https://reeledai.com**
- **https://www.reeledai.com**

## 🔧 **Alternative: Using Cloudflare (Recommended)**

For better performance and easier management:

1. **Add your domain to Cloudflare**
2. **Change nameservers in Namecheap** to Cloudflare's nameservers
3. **Add these records in Cloudflare:**
   - **CNAME:** `www` → `ghs.googlehosted.com`
   - **A:** `@` → `216.239.32.21`
   - **A:** `@` → `216.239.34.21`
   - **A:** `@` → `216.239.36.21`
   - **A:** `@` → `216.239.38.21`

## 🚨 **Important Notes**

1. **Remove existing A records** for `@` if they exist
2. **Keep other DNS records** (like email MX records) intact
3. **SSL certificates** are automatically provided by Google Cloud
4. **Both domains** will point to the same Cloud Run service

## 📞 **Troubleshooting**

### Check DNS Propagation:
- **Online tool:** https://dnschecker.org
- **Command line:** `dig reeledai.com` and `dig www.reeledai.com`

### Common Issues:
- **404 Error:** DNS not propagated yet
- **SSL Error:** Wait for certificate provisioning (can take up to 1 hour)
- **CNAME Error:** Make sure you're using `ghs.googlehosted.com`

### Check Domain Mappings:
```bash
gcloud beta run domain-mappings list --region us-central1
```










