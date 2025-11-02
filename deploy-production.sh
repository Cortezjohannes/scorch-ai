#!/bin/bash

# Production Deployment Script for Reeled AI
# Custom Domain: reeledai.com
#
# SECURITY: This template does NOT contain hardcoded secrets.
# Secrets must be stored in Google Cloud Secret Manager and referenced during deployment.

set -e

# Configuration
PROJECT_ID="reeled-ai-production"
SERVICE_NAME="reeled-ai"
REGION="us-central1"
DOMAIN="reeledai.com"

echo "🚀 Starting production deployment for Reeled AI..."

# 1. Set the project
echo "📋 Setting project to $PROJECT_ID"
gcloud config set project $PROJECT_ID

# 2. Enable required services
echo "🔧 Enabling required Google Cloud services..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com

# 3. Verify secrets exist in Secret Manager
echo "🔑 Verifying secrets exist in Secret Manager..."
REQUIRED_SECRETS=(
  "gemini-api-key"
  "azure-openai-api-key"
  "azure-dalle-api-key"
  "azure-gpt45-api-key"
)

for secret in "${REQUIRED_SECRETS[@]}"; do
  if ! gcloud secrets describe "$secret" --project="$PROJECT_ID" &>/dev/null; then
    echo "❌ ERROR: Secret '$secret' not found in Secret Manager!"
    echo "   Create it with: gcloud secrets create $secret --data-file=-"
    exit 1
  fi
done

echo "✅ All required secrets found in Secret Manager"

# 4. Deploy to Cloud Run with secrets from Secret Manager
echo "🚀 Deploying to Cloud Run with secrets from Secret Manager..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --min-instances 0 \
  --max-instances 10 \
  --port 8080 \
  --timeout 300 \
  --concurrency 100 \
  --set-secrets="GEMINI_API_KEY=gemini-api-key:latest,NEXT_PUBLIC_GEMINI_API_KEY=gemini-api-key:latest,AZURE_OPENAI_API_KEY=azure-openai-api-key:latest,NEXT_PUBLIC_AZURE_OPENAI_API_KEY=azure-openai-api-key:latest,AZURE_DALLE_API_KEY=azure-dalle-api-key:latest,AZURE_GPT45_API_KEY=azure-gpt45-api-key:latest" \
  --set-env-vars="NODE_ENV=production,NEXT_TELEMETRY_DISABLED=1,USE_GEMINI_ONLY=true,PRIMARY_MODEL=gemini,GEMINI_STABLE_MODE_MODEL=gemini-2.5-pro,AZURE_OPENAI_ENDPOINT=https://reeled-ai-alpha.openai.azure.com/,AZURE_OPENAI_API_VERSION=2024-12-01-preview,AZURE_OPENAI_DEPLOYMENT=gpt-4.1,NEXT_PUBLIC_GEMINI_STABLE_MODE_MODEL=gemini-2.5-pro,NEXT_PUBLIC_USE_GEMINI_ONLY=true,NEXT_PUBLIC_PRIMARY_MODEL=gemini,NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT=https://reeled-ai-alpha.openai.azure.com/,NEXT_PUBLIC_AZURE_OPENAI_API_VERSION=2024-12-01-preview,NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT=gpt-4.1,GPT_4_1_DEPLOYMENT=gpt-4.1,GPT_5_MINI_DEPLOYMENT=gpt-5-mini,GPT_4O_DEPLOYMENT=gpt-4o-2024-11-20,NEXT_PUBLIC_GPT_4_1_DEPLOYMENT=gpt-4.1,NEXT_PUBLIC_GPT_5_MINI_DEPLOYMENT=gpt-5-mini,NEXT_PUBLIC_GPT_4O_DEPLOYMENT=gpt-4o-2024-11-20,NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB6yfJSsYGBE3m0B0kslIMJ86cSktV5w3U,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=greenlitai.firebaseapp.com,NEXT_PUBLIC_FIREBASE_PROJECT_ID=greenlitai,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=greenlitai.firebasestorage.app,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=42640188111,NEXT_PUBLIC_FIREBASE_APP_ID=1:42640188111:web:89e69efb3cf94522ac8dba,NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-VZNLRYMNH0" \
  --project $PROJECT_ID

# 5. Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')
echo "✅ Service deployed at: $SERVICE_URL"

# 6. Set up custom domain
echo "🌐 Setting up custom domain: $DOMAIN"
gcloud beta run domain-mappings create \
  --service $SERVICE_NAME \
  --domain $DOMAIN \
  --region $REGION \
  --project $PROJECT_ID

echo "🎉 Deployment complete!"
echo "📊 Service URL: $SERVICE_URL"
echo "🌐 Custom Domain: https://$DOMAIN (DNS verification required)"
echo ""
echo "🔍 Health Check: $SERVICE_URL/api/generate/episode?endpoint=health"
echo "📈 Metrics: $SERVICE_URL/api/generate/episode?endpoint=metrics"

echo ""
echo "📋 Next Steps:"
echo "1. Verify your DNS settings for $DOMAIN"
echo "2. Test the health endpoints"
echo "3. Monitor the deployment in Google Cloud Console"

