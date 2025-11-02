#!/bin/bash
# Script to help configure Namecheap DNS for Google Cloud Run

echo "🌐 Namecheap DNS Configuration for Google Cloud Run"
echo "=================================================="
echo ""
echo "Your Cloud Run service is already configured with domain mapping:"
echo "✅ Domain: app.reeledai.com"
echo "✅ Service: reeled-ai-v2"
echo "✅ Region: us-central1"
echo ""
echo "📋 DNS Records to Add in Namecheap:"
echo "=================================="
echo ""
echo "1. Log into your Namecheap account"
echo "2. Go to Domain List → Manage → Advanced DNS"
echo "3. Add the following DNS record:"
echo ""
echo "   Type: CNAME"
echo "   Host: app"
echo "   Value: ghs.googlehosted.com"
echo "   TTL: 300 (or Automatic)"
echo ""
echo "🔍 After adding the DNS record, verify with:"
echo "   nslookup app.reeledai.com"
echo "   dig app.reeledai.com"
echo ""
echo "⏰ DNS propagation can take 24-48 hours"
echo "🌐 Once propagated, your app will be available at:"
echo "   https://app.reeledai.com"
echo ""
echo "📞 If you need help:"
echo "   - Check DNS propagation: https://dnschecker.org"
echo "   - Verify domain mapping: gcloud beta run domain-mappings list"










