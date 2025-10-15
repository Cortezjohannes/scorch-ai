#!/bin/bash
# Add www.reeledai.com DNS record

echo "🌐 www.reeledai.com Domain Mapping Recreated!"
echo "============================================="
echo ""
echo "✅ Domain mapping created in Google Cloud"
echo "⏳ Status: Waiting for DNS record"
echo ""
echo "📋 DNS Record to Add in Namecheap:"
echo "=================================="
echo ""
echo "1. Log into Namecheap → Domain List → Manage → Advanced DNS"
echo ""
echo "2. Add this DNS record:"
echo ""
echo "   ┌─────────────────────────────────────────┐"
echo "   │ Type: CNAME                             │"
echo "   │ Host: www                               │"
echo "   │ Value: ghs.googlehosted.com           │"
echo "   │ TTL: 300 (or Automatic)                │"
echo "   └─────────────────────────────────────────┘"
echo ""
echo "⏰ After adding the DNS record:"
echo "   • DNS propagation: 24-48 hours"
echo "   • SSL certificate: Auto-provisioned by Google"
echo ""
echo "🌐 Once propagated, your app will be available at:"
echo "   • https://www.reeledai.com"
echo ""
echo "🔍 Verify with:"
echo "   nslookup www.reeledai.com"
echo "   curl -I https://www.reeledai.com"










