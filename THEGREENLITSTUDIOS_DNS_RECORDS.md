# DNS Records for thegreenlitstudios.com

## ✅ Domain Mappings Created

Both domain mappings have been created in Google Cloud Run:
- ✅ **thegreenlitstudios.com** (root domain)
- ✅ **www.thegreenlitstudios.com** (www subdomain)

## 📋 DNS Records to Add to Your Domain Registrar

### For www.thegreenlitstudios.com (CNAME Record):

Add this **CNAME** record in your domain registrar:

```
Type: CNAME
Host/Name: www
Value/Target: ghs.googlehosted.com
TTL: 300 (or Automatic)
```

### For thegreenlitstudios.com (Root Domain - A Records):

Add these **A** records in your domain registrar:

```
Type: A
Host/Name: @ (or leave blank, depending on your registrar)
Value: 216.239.32.21
TTL: 300

Type: A
Host/Name: @
Value: 216.239.34.21
TTL: 300

Type: A
Host/Name: @
Value: 216.239.36.21
TTL: 300

Type: A
Host/Name: @
Value: 216.239.38.21
TTL: 300
```

### For thegreenlitstudios.com (Root Domain - AAAA Records - IPv6):

Add these **AAAA** records in your domain registrar:

```
Type: AAAA
Host/Name: @
Value: 2001:4860:4802:32::15
TTL: 300

Type: AAAA
Host/Name: @
Value: 2001:4860:4802:34::15
TTL: 300

Type: AAAA
Host/Name: @
Value: 2001:4860:4802:36::15
TTL: 300

Type: AAAA
Host/Name: @
Value: 2001:4860:4802:38::15
TTL: 300
```

## 📝 Step-by-Step Instructions

1. **Log into your domain registrar** (Namecheap, GoDaddy, Cloudflare, etc.)

2. **Navigate to DNS Management** for `thegreenlitstudios.com`

3. **Add the DNS records above:**
   - For **www subdomain**: Add 1 CNAME record
   - For **root domain**: Add 4 A records + 4 AAAA records

4. **Save the changes**

5. **Wait for DNS propagation** (24-48 hours)

6. **SSL certificates** will be automatically provisioned by Google Cloud once DNS propagates

## ✅ Verification

After adding DNS records, verify they're working:

```bash
# Check root domain
nslookup thegreenlitstudios.com

# Check www subdomain
nslookup www.thegreenlitstudios.com

# Check domain mapping status
gcloud beta run domain-mappings list --region us-central1 --project reeled-ai-production
```

## 🎉 Final URLs

Once DNS propagates (24-48 hours), your app will be available at:
- **https://thegreenlitstudios.com**
- **https://www.thegreenlitstudios.com**

Both will point to your Cloud Run service: `reeled-ai-v2`

## ⚠️ Important Notes

- **DNS Propagation:** Can take 24-48 hours to fully propagate globally
- **SSL Certificates:** Automatically provisioned by Google Cloud (may take up to 1 hour after DNS propagates)
- **Don't delete existing records:** Only add these new records, keep any existing MX, TXT, or other records
- **Both domains work:** Once set up, both the root domain and www subdomain will work















































