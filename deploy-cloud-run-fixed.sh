#!/bin/bash
# Fixed deployment script for Google Cloud Run with Artifact Registry

set -e  # Exit on any error

# Configuration
PROJECT_ID="reeled-ai-production"
SERVICE_NAME="reeled-ai-v2"
REGION="us-central1"
REPOSITORY_NAME="reeled-ai-repo"
DOMAIN="app.reeledai.com"

echo "🚀 Starting deployment to Google Cloud Run..."

# 1. Authenticate with Google Cloud
echo "📋 Authenticating with Google Cloud..."
gcloud auth login
gcloud config set project $PROJECT_ID

# 2. Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# 3. Create Artifact Registry repository if it doesn't exist
echo "📦 Setting up Artifact Registry..."
gcloud artifacts repositories create $REPOSITORY_NAME \
  --repository-format=docker \
  --location=$REGION \
  --description="Repository for Reeled AI container images" \
  --quiet || echo "Repository already exists or creation failed"

# 4. Configure Docker authentication for Artifact Registry
echo "🔐 Configuring Docker authentication..."
gcloud auth configure-docker $REGION-docker.pkg.dev

# 5. Build and push the image
echo "🏗️ Building and pushing container image..."
IMAGE_NAME="$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY_NAME/$SERVICE_NAME"

# Build the image
docker build -t $IMAGE_NAME .

# Push the image
docker push $IMAGE_NAME

# 6. Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --port 8080 \
  --project $PROJECT_ID

# 7. Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')
echo "✅ Deployment complete!"
echo "🌐 Service URL: $SERVICE_URL"

# 8. Optional: Set up custom domain
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










