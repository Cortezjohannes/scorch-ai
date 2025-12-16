#!/bin/bash
# Setup thegreenlitstudios.com domain mapping for Cloud Run

set -e

PROJECT_ID="reeled-ai-production"
SERVICE_NAME="reeled-ai-v2"
REGION="us-central1"
ROOT_DOMAIN="thegreenlitstudios.com"
WWW_DOMAIN="www.thegreenlitstudios.com"

echo "🌐 Setting up domain mappings for thegreenlitstudios.com"
echo ""

# Create root domain mapping
echo "📝 Creating mapping for $ROOT_DOMAIN..."
if gcloud beta run domain-mappings create \
  --service=$SERVICE_NAME \
  --domain=$ROOT_DOMAIN \
  --region=$REGION \
  --project=$PROJECT_ID 2>&1; then
    echo "✅ Root domain mapping created"
else
    echo "⚠️  Root domain mapping may already exist (this is OK)"
fi

echo ""

# Create www subdomain mapping
echo "📝 Creating mapping for $WWW_DOMAIN..."
if gcloud beta run domain-mappings create \
  --service=$SERVICE_NAME \
  --domain=$WWW_DOMAIN \
  --region=$REGION \
  --project=$PROJECT_ID 2>&1; then
    echo "✅ WWW subdomain mapping created"
else
    echo "⚠️  WWW subdomain mapping may already exist (this is OK)"
fi

echo ""
echo "📋 Getting DNS records..."
echo ""

# Get DNS records for root domain
echo "=== DNS Records for $ROOT_DOMAIN ==="
gcloud beta run domain-mappings describe $ROOT_DOMAIN \
  --region=$REGION \
  --project=$PROJECT_ID \
  --format="table(status.resourceRecords.name,status.resourceRecords.type,status.resourceRecords.rrdata)" 2>&1 || echo "Run this command manually to see DNS records"

echo ""

# Get DNS records for www subdomain
echo "=== DNS Records for $WWW_DOMAIN ==="
gcloud beta run domain-mappings describe $WWW_DOMAIN \
  --region=$REGION \
  --project=$PROJECT_ID \
  --format="table(status.resourceRecords.name,status.resourceRecords.type,status.resourceRecords.rrdata)" 2>&1 || echo "Run this command manually to see DNS records"

echo ""
echo "✅ Domain mappings created!"
echo ""
echo "📝 Next steps:"
echo "1. Copy the DNS records above"
echo "2. Add them to your domain registrar (Namecheap, GoDaddy, etc.)"
echo "3. Wait for DNS propagation (24-48 hours)"
echo "4. SSL certificates will be automatically provisioned"
echo ""
echo "🔍 To check mapping status:"
echo "   gcloud beta run domain-mappings list --region=$REGION --project=$PROJECT_ID"


