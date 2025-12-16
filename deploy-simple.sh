#!/bin/bash

# Simple deployment script for Google Cloud Run
echo "🚀 Deploying Reeled AI to Google Cloud Run..."

# Set environment variables
export GEMINI_API_KEY="AIzaSyDJEnINiuvI0SULRTqb5O1xgDYUZu_NwQo"
export NODE_ENV="production"

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
  --set-env-vars "GEMINI_API_KEY=$GEMINI_API_KEY,NODE_ENV=$NODE_ENV" \
  --timeout 3600

echo "✅ Deployment complete!"











