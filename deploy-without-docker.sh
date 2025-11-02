#!/bin/bash
# Deploy to Cloud Run using Cloud Build (no local Docker required)

set -e

PROJECT_ID="reeled-ai-production"
SERVICE_NAME="reeled-ai-v2"
REGION="us-central1"
REPOSITORY_NAME="reeled-ai-repo"
DOMAIN="app.reeledai.com"

echo "🚀 Deploying to Google Cloud Run using Cloud Build..."

# 1. Ensure we're authenticated and project is set
echo "📋 Setting up authentication..."
gcloud config set project $PROJECT_ID

# 2. Enable required APIs
echo "🔌 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# 3. Create Artifact Registry repository if it doesn't exist
echo "📦 Setting up Artifact Registry..."
gcloud artifacts repositories create $REPOSITORY_NAME \
  --repository-format=docker \
  --location=$REGION \
  --description="Repository for Reeled AI container images" \
  --quiet || echo "Repository already exists"

# 4. Submit build to Cloud Build
echo "🏗️ Building and deploying with Cloud Build..."
gcloud builds submit \
  --config cloudbuild.yaml \
  --project $PROJECT_ID

# 5. Get the service URL
echo "🔗 Getting service URL..."
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')

echo "✅ Deployment complete!"
echo "🌐 Service URL: $SERVICE_URL"

# 6. Optional: Set up custom domain
echo "🔗 Setting up custom domain..."
gcloud beta run domain-mappings create \
  --service $SERVICE_NAME \
  --domain $DOMAIN \
  --region $REGION \
  --project $PROJECT_ID \
  --quiet || echo "Domain mapping may already exist or failed"

echo "🎉 Deployment completed successfully!"
echo "📱 Your app is available at: $SERVICE_URL"
echo "🌍 Custom domain (after DNS verification): https://$DOMAIN"










