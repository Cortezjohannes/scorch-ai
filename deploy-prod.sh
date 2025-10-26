#!/bin/bash
# Production deployment script for Reeled AI app.reeledai.com

# Exit on any error
set -e

# Configuration variables
PROJECT_ID="reeled-ai-production"
REGION="us-central1"
SERVICE_NAME="reeled-ai"
DOMAIN="app.reeledai.com"

# Check if required environment variables are set
if [ -z "$GEMINI_API_KEY" ] || [ -z "$UNSPLASH_ACCESS_KEY" ] || [ -z "$UNSPLASH_SECRET_KEY" ]; then
  echo "Error: Missing required environment variables."
  echo "Please set the following environment variables:"
  echo "  - GEMINI_API_KEY"
  echo "  - UNSPLASH_ACCESS_KEY"
  echo "  - UNSPLASH_SECRET_KEY"
  exit 1
fi

# Create Google Cloud project if it doesn't exist
echo "Setting up Google Cloud project..."
gcloud projects describe "$PROJECT_ID" &> /dev/null || gcloud projects create "$PROJECT_ID" --name="Reeled AI Production"
gcloud config set project "$PROJECT_ID"

# Enable required services
echo "Enabling required Google Cloud services..."
gcloud services enable cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com dns.googleapis.com

# Set up secrets
echo "Setting up secrets..."
echo -n "$GEMINI_API_KEY" | gcloud secrets create GEMINI_API_KEY --data-file=- --replication-policy="automatic" 2>/dev/null || \
echo -n "$GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

echo -n "$UNSPLASH_ACCESS_KEY" | gcloud secrets create UNSPLASH_ACCESS_KEY --data-file=- --replication-policy="automatic" 2>/dev/null || \
echo -n "$UNSPLASH_ACCESS_KEY" | gcloud secrets versions add UNSPLASH_ACCESS_KEY --data-file=-

echo -n "$UNSPLASH_SECRET_KEY" | gcloud secrets create UNSPLASH_SECRET_KEY --data-file=- --replication-policy="automatic" 2>/dev/null || \
echo -n "$UNSPLASH_SECRET_KEY" | gcloud secrets versions add UNSPLASH_SECRET_KEY --data-file=-

# Set up Firebase secrets
echo -n "$NEXT_PUBLIC_FIREBASE_API_KEY" | gcloud secrets create NEXT_PUBLIC_FIREBASE_API_KEY --data-file=- --replication-policy="automatic" 2>/dev/null || \
echo -n "$NEXT_PUBLIC_FIREBASE_API_KEY" | gcloud secrets versions add NEXT_PUBLIC_FIREBASE_API_KEY --data-file=-

echo -n "$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" | gcloud secrets create NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN --data-file=- --replication-policy="automatic" 2>/dev/null || \
echo -n "$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" | gcloud secrets versions add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN --data-file=-

echo -n "$NEXT_PUBLIC_FIREBASE_PROJECT_ID" | gcloud secrets create NEXT_PUBLIC_FIREBASE_PROJECT_ID --data-file=- --replication-policy="automatic" 2>/dev/null || \
echo -n "$NEXT_PUBLIC_FIREBASE_PROJECT_ID" | gcloud secrets versions add NEXT_PUBLIC_FIREBASE_PROJECT_ID --data-file=-

echo -n "$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" | gcloud secrets create NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET --data-file=- --replication-policy="automatic" 2>/dev/null || \
echo -n "$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" | gcloud secrets versions add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET --data-file=-

echo -n "$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" | gcloud secrets create NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --data-file=- --replication-policy="automatic" 2>/dev/null || \
echo -n "$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" | gcloud secrets versions add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --data-file=-

echo -n "$NEXT_PUBLIC_FIREBASE_APP_ID" | gcloud secrets create NEXT_PUBLIC_FIREBASE_APP_ID --data-file=- --replication-policy="automatic" 2>/dev/null || \
echo -n "$NEXT_PUBLIC_FIREBASE_APP_ID" | gcloud secrets versions add NEXT_PUBLIC_FIREBASE_APP_ID --data-file=-

echo -n "$NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID" | gcloud secrets create NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID --data-file=- --replication-policy="automatic" 2>/dev/null || \
echo -n "$NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID" | gcloud secrets versions add NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID --data-file=-

# Build and deploy with Cloud Build
echo "Building and deploying application..."
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_GEMINI_API_KEY="$GEMINI_API_KEY",_UNSPLASH_ACCESS_KEY="$UNSPLASH_ACCESS_KEY",_UNSPLASH_SECRET_KEY="$UNSPLASH_SECRET_KEY",_NEXT_PUBLIC_FIREBASE_API_KEY="$NEXT_PUBLIC_FIREBASE_API_KEY",_NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",_NEXT_PUBLIC_FIREBASE_PROJECT_ID="$NEXT_PUBLIC_FIREBASE_PROJECT_ID",_NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",_NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",_NEXT_PUBLIC_FIREBASE_APP_ID="$NEXT_PUBLIC_FIREBASE_APP_ID",_NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="$NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"

# Set up domain mapping
echo "Setting up domain mapping for $DOMAIN..."
gcloud beta run domain-mappings create \
  --service="$SERVICE_NAME" \
  --domain="$DOMAIN" \
  --region="$REGION" || \
echo "Warning: Domain mapping may already exist or failed. You may need to configure it manually."

# Get service URL
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --platform managed --region "$REGION" --format="value(status.url)")
echo "Service deployed at: $SERVICE_URL"

echo "=========================================================="
echo "Deployment complete!"
echo "=========================================================="
echo "To complete the setup, update your DNS provider with:"
echo "1. A TXT record for domain verification"
echo "2. A CNAME record for $DOMAIN pointing to ghs.googlehosted.com"
echo ""
echo "Your application will be available at: https://$DOMAIN"
echo "after DNS propagation (may take 24-48 hours)." 