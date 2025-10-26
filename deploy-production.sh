#!/bin/bash

# Production Deployment Script for Reeled AI
# Custom Domain: reeledai.com

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
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

# 3. Set environment variables from .env.local
echo "🔑 Setting up environment variables from .env.local..."

# Create a temporary .env file for deployment using your actual values
cat > .env.production << EOF
NODE_ENV=production
PORT=8080
NEXT_TELEMETRY_DISABLED=1

# Gemini AI Configuration
GEMINI_API_KEY=AIzaSyB4Zv84FGbknZZ8_h_Pjc6fDdqiRa3txWQ
GEMINI_STABLE_MODE_MODEL=gemini-2.5-pro
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyB4Zv84FGbknZZ8_h_Pjc6fDdqiRa3txWQ
NEXT_PUBLIC_GEMINI_STABLE_MODE_MODEL=gemini-2.5-pro

# Model Preference Settings
USE_GEMINI_ONLY=true
NEXT_PUBLIC_USE_GEMINI_ONLY=true
PRIMARY_MODEL=gemini
NEXT_PUBLIC_PRIMARY_MODEL=gemini

# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://reeled-ai-alpha.openai.azure.com/
AZURE_OPENAI_API_KEY=FKp0kcV49TA4XVdpoyQ9zO0vluUAWQNSqqA76dvVvztBi0a13vh7JQQJ99BDACHYHv6XJ3w3AAABACOGqNKj
AZURE_OPENAI_API_VERSION=2024-12-01-preview
AZURE_OPENAI_DEPLOYMENT=gpt-4.1

# Client-side Azure OpenAI access
NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT=https://reeled-ai-alpha.openai.azure.com/
NEXT_PUBLIC_AZURE_OPENAI_API_KEY=FKp0kcV49TA4XVdpoyQ9zO0vluUAWQNSqqA76dvVvztBi0a13vh7JQQJ99BDACHYHv6XJ3w3AAABACOGqNKj
NEXT_PUBLIC_AZURE_OPENAI_API_VERSION=2024-12-01-preview
NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT=gpt-4.1

# Model Deployments
GPT_4_1_DEPLOYMENT=gpt-4.1
GPT_5_MINI_DEPLOYMENT=gpt-5-mini
GPT_4O_DEPLOYMENT=gpt-4o-2024-11-20
NEXT_PUBLIC_GPT_4_1_DEPLOYMENT=gpt-4.1
NEXT_PUBLIC_GPT_5_MINI_DEPLOYMENT=gpt-5-mini
NEXT_PUBLIC_GPT_4O_DEPLOYMENT=gpt-4o-2024-11-20

# Optional image generation settings
USE_MOCK_IMAGES=false
FALLBACK_TO_MOCK=true
EOF

echo "✅ Environment variables configured from .env.local"

# 4. Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
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
  --env-vars-file .env.production \
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

# Clean up
rm -f .env.production

echo ""
echo "📋 Next Steps:"
echo "1. Verify your DNS settings for $DOMAIN"
echo "2. Test the health endpoints"
echo "3. Monitor the deployment in Google Cloud Console"
