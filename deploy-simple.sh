#!/bin/bash

# Simple deployment script for Google Cloud Run
echo "🚀 Deploying Reeled AI to Google Cloud Run..."

# Set environment variables (use Secret Manager for API keys)
export NODE_ENV="production"

# Check if GEMINI_API_KEY is set, otherwise use Secret Manager
if [ -z "$GEMINI_API_KEY" ]; then
  echo "⚠️  GEMINI_API_KEY not set, using Secret Manager..."
  SECRET_FLAG="--set-secrets GEMINI_API_KEY=gemini-api-key:latest"
else
  echo "⚠️  WARNING: Using GEMINI_API_KEY from environment (not recommended for production)"
  SECRET_FLAG="--set-env-vars GEMINI_API_KEY=$GEMINI_API_KEY"
fi

# Deploy using gcloud run deploy with source
gcloud run deploy reeled-ai-v2 \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --port 8080 \
  $SECRET_FLAG \
  --set-env-vars "NODE_ENV=$NODE_ENV" \
  --timeout 3600

echo "✅ Deployment complete!"











