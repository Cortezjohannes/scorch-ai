# Namecheap Domain Setup for Google Cloud Run

This guide will help you configure your Namecheap domain to point to your Cloud Run service.

## 🌐 Your Cloud Run Service Details

- **Service URL:** https://reeled-ai-v2-7qcdkzzv6q-uc.a.run.app
- **Service Name:** reeled-ai-v2
- **Region:** us-central1

## 📋 Step-by-Step Setup

### Step 1: Set up Custom Domain in Google Cloud

First, let's create the domain mapping in Google Cloud:

```bash
# Create domain mapping for your custom domain
gcloud beta run domain-mappings create \
  --service reeled-ai-v2 \
  --domain app.reeledai.com \
  --region us-central1 \
  --project reeled-ai-production
```

### Step 2: Get the Required DNS Records

After running the command above, Google Cloud will provide you with DNS records that you need to add to Namecheap. The output will look something like this:

```
Domain mapping created. Please configure the following DNS records:
  Name: app
  Type: CNAME
  Value: ghs.googlehosted.com
```

### Step 3: Configure DNS in Namecheap

1. **Log into your Namecheap account**
2. **Go to Domain List** and click "Manage" next to your domain
3. **Click on "Advanced DNS" tab**
4. **Add the following DNS records:**

#### Option A: If you want `app.reeledai.com`
- **Type:** CNAME
- **Host:** app
- **Value:** ghs.googlehosted.com
- **TTL:** Automatic (or 300)

#### Option B: If you want the root domain `reeledai.com`
- **Type:** A
- **Host:** @
- **Value:** 216.58.220.129 (Google's IP)
- **TTL:** Automatic (or 300)

- **Type:** AAAA
- **Host:** @
- **Value:** 2001:4860:4802:32::71 (Google's IPv6)
- **TTL:** Automatic (or 300)

### Step 4: Verify Domain Mapping

After adding the DNS records, verify the setup:

```bash
# Check domain mapping status
gcloud beta run domain-mappings describe app.reeledai.com --region us-central1

# Check if DNS is propagating
nslookup app.reeledai.com
```

### Step 5: Test Your Domain

Once DNS propagation is complete (can take up to 48 hours), your domain should work:
- **https://app.reeledai.com** (or your chosen subdomain)

## 🔧 Alternative: Using Cloudflare (Recommended)

If you want better performance and easier management, consider using Cloudflare:

1. **Add your domain to Cloudflare**
2. **Change nameservers in Namecheap** to point to Cloudflare
3. **Add CNAME record in Cloudflare:**
   - **Name:** app
   - **Target:** ghs.googlehosted.com
   - **Proxy status:** Proxied (orange cloud)

## 📝 DNS Record Examples

### For `app.reeledai.com`:
```
Type: CNAME
Name: app
Value: ghs.googlehosted.com
TTL: 300
```

### For `www.reeledai.com`:
```
Type: CNAME
Name: www
Value: ghs.googlehosted.com
TTL: 300
```

### For root domain `reeledai.com`:
```
Type: A
Name: @
Value: 216.58.220.129
TTL: 300

Type: AAAA
Name: @
Value: 2001:4860:4802:32::71
TTL: 300
```

## 🚨 Important Notes

1. **DNS Propagation:** Changes can take 24-48 hours to fully propagate
2. **SSL Certificate:** Google Cloud Run automatically provides SSL certificates
3. **Multiple Domains:** You can map multiple domains to the same service
4. **Subdomains:** Each subdomain needs its own CNAME record

## 🔍 Troubleshooting

### Check DNS Propagation:
```bash
# Check if your domain resolves
dig app.reeledai.com
nslookup app.reeledai.com
```

### Check Domain Mapping Status:
```bash
gcloud beta run domain-mappings list --region us-central1
```

### Common Issues:
- **404 Error:** DNS not propagated yet, wait 24-48 hours
- **SSL Error:** Domain mapping not created properly
- **CNAME Error:** Make sure you're using `ghs.googlehosted.com` as the target

## 📞 Support

If you encounter issues:
1. Check DNS propagation using online tools
2. Verify the domain mapping in Google Cloud Console
3. Ensure TTL is set to a low value (300 seconds) for faster updates










