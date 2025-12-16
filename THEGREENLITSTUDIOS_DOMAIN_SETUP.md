# Domain Mapping for thegreenlitstudios.com

## 🎯 Mapping thegreenlitstudios.com to Cloud Run

This guide will help you map `thegreenlitstudios.com` to your Cloud Run service.

### Current Service Details

- **Service Name:** reeled-ai-v2
- **Service URL:** https://reeled-ai-v2-57725991954.us-central1.run.app
- **Region:** us-central1
- **Project:** reeled-ai-production

## 📋 Step 1: Create Domain Mapping in Google Cloud

Run these commands to create domain mappings:

```bash
# For root domain: thegreenlitstudios.com
gcloud beta run domain-mappings create \
  --service reeled-ai-v2 \
  --domain thegreenlitstudios.com \
  --region us-central1 \
  --project reeled-ai-production

# For www subdomain: www.thegreenlitstudios.com
gcloud beta run domain-mappings create \
  --service reeled-ai-v2 \
  --domain www.thegreenlitstudios.com \
  --region us-central1 \
  --project reeled-ai-production
```

## 📝 Step 2: Get DNS Records

After creating the domain mappings, get the DNS records you need:

```bash
# Get DNS records for root domain
gcloud beta run domain-mappings describe thegreenlitstudios.com \
  --region us-central1 \
  --project reeled-ai-production \
  --format="yaml(status.resourceRecords)"

# Get DNS records for www subdomain
gcloud beta run domain-mappings describe www.thegreenlitstudios.com \
  --region us-central1 \
  --project reeled-ai-production \
  --format="yaml(status.resourceRecords)"
```

## 🌐 Step 3: Add DNS Records to Your Domain Registrar

The DNS records will typically be:

### For www.thegreenlitstudios.com (CNAME):
```
Type: CNAME
Host: www
Value: ghs.googlehosted.com
TTL: 300 (or Automatic)
```

### For thegreenlitstudios.com (A Records):
You'll receive A and AAAA records from Google Cloud. Typically they look like:

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

### For thegreenlitstudios.com (AAAA Records - IPv6):
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

**Note:** The actual IP addresses may be different - use the values provided by Google Cloud from Step 2.

## ⏰ Step 4: Wait for DNS Propagation

- **DNS Propagation:** 24-48 hours
- **SSL Certificate:** Automatically provisioned by Google Cloud (can take up to 1 hour after DNS propagates)

## ✅ Step 5: Verify Domain Mapping

Check if the domain mapping is active:

```bash
gcloud beta run domain-mappings list --region us-central1 --project reeled-ai-production
```

Check DNS propagation:

```bash
nslookup thegreenlitstudios.com
nslookup www.thegreenlitstudios.com
```

## 🎉 Final URLs

Once DNS propagates, your app will be available at:
- **https://thegreenlitstudios.com**
- **https://www.thegreenlitstudios.com**

Both will point to the same Cloud Run service.

## 🔧 Troubleshooting

### Check Domain Mapping Status:
```bash
gcloud beta run domain-mappings describe thegreenlitstudios.com \
  --region us-central1 \
  --project reeled-ai-production
```

### Check DNS Propagation Online:
- Use https://dnschecker.org to check global DNS propagation

### Common Issues:
- **404 Error:** DNS not propagated yet, wait 24-48 hours
- **SSL Error:** Wait for certificate provisioning (can take up to 1 hour after DNS)
- **CNAME Error:** Make sure you're using `ghs.googlehosted.com` as the target for www subdomain

## 📞 Quick Commands Reference

```bash
# List all domain mappings
gcloud beta run domain-mappings list --region us-central1 --project reeled-ai-production

# Describe a specific domain mapping
gcloud beta run domain-mappings describe thegreenlitstudios.com --region us-central1 --project reeled-ai-production

# Delete a domain mapping (if needed)
gcloud beta run domain-mappings delete thegreenlitstudios.com --region us-central1 --project reeled-ai-production
```


