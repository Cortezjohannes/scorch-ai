#!/bin/bash
# Script to deploy to Cloud Run using Google Cloud Shell

# Set your project ID
PROJECT_ID="reeled-ai-production"
SERVICE_NAME="reeled-ai-v2"
REGION="us-central1"

# Set up the custom domain
DOMAIN="app.reeledai.com"

# 1. Create a temporary directory for minimal deployment files
echo "Creating minimal deployment package..."
mkdir -p deploy-temp
cp Dockerfile deploy-temp/
cp -r .next deploy-temp/ 2>/dev/null || echo ".next directory not found, will be built during deployment"
cp -r public deploy-temp/
cp package.json package-lock.json deploy-temp/
cp .env.local deploy-temp/.env.production
cp next.config.js deploy-temp/

# 2. Navigate to the temporary directory
cd deploy-temp

# 3. Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --port 8080 \
  --project $PROJECT_ID

# 4. Map the custom domain (using beta command)
echo "Setting up custom domain..."
gcloud beta run domain-mappings create \
  --service $SERVICE_NAME \
  --domain $DOMAIN \
  --region $REGION \
  --project $PROJECT_ID

echo "Deployment complete! After DNS verification, your app will be available at https://$DOMAIN"

# 5. Clean up
cd ..
rm -rf deploy-temp 