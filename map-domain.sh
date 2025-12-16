#!/bin/bash
# Map custom domain to Cloud Run service

set -e

PROJECT_ID="reeled-ai-production"
SERVICE_NAME="reeled-ai-v2"
REGION="us-central1"
DOMAIN="thegreenlitstudios.com"

echo "🌐 Mapping domain to Cloud Run service..."
echo "Domain: $DOMAIN"
echo "Service: $SERVICE_NAME"
echo ""

# Create domain mapping
echo "Creating domain mapping..."
gcloud beta run domain-mappings create \
  --service=$SERVICE_NAME \
  --domain=$DOMAIN \
  --region=$REGION \
  --project=$PROJECT_ID

echo ""
echo "✅ Domain mapping created!"
echo ""
echo "📋 Next steps:"
echo "1. Google Cloud will provide DNS records - check the output above"
echo "2. Add the DNS records to your domain registrar"
echo "3. Wait for DNS propagation (24-48 hours)"
echo "4. SSL certificate will be automatically provisioned"
echo ""

# Get DNS records
echo "📝 Getting DNS records..."
gcloud beta run domain-mappings describe $DOMAIN \
  --region=$REGION \
  --project=$PROJECT_ID \
  --format="value(status.resourceRecords)"

echo ""
echo "💡 For root domain (thegreenlitstudios.com), you'll need A/AAAA records"
echo "💡 For www subdomain (www.thegreenlitstudios.com), you'll need a CNAME record"


