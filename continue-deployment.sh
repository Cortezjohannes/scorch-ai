#!/bin/bash
# Continue deployment after refreshing gcloud credentials
# This script pushes the already-built Docker image and deploys to Cloud Run

set -e

# Configuration (matching deploy-to-cloud-run.sh)
PROJECT_ID="reeled-ai-production"
SERVICE_NAME="reeled-ai-v2"
REGION="us-central1"
REPO_NAME="docker-repo"
IMAGE_NAME="us-central1-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${SERVICE_NAME}"

echo "🚀 Continuing Cloud Run Deployment..."
echo "===================================="
echo ""

# Verify authentication
ACTIVE_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null | head -1)
if [ -z "$ACTIVE_ACCOUNT" ]; then
    echo "❌ Not authenticated with Google Cloud"
    echo "Please run: gcloud auth login"
    exit 1
fi
echo "✓ Authenticated as: $ACTIVE_ACCOUNT"
echo ""

# Verify project
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
    echo "⚠ Switching to project: $PROJECT_ID"
    gcloud config set project $PROJECT_ID
fi
echo "✓ Project: $PROJECT_ID"
echo ""

# Configure Docker for Artifact Registry
echo "Configuring Docker authentication..."
gcloud auth configure-docker us-central1-docker.pkg.dev --quiet
echo ""

# Push to Artifact Registry
echo "Pushing Docker image to Artifact Registry..."
docker push $IMAGE_NAME:latest
echo "✓ Image pushed successfully"
echo ""

# Load environment variables from .env.local
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found!"
    exit 1
fi

GEMINI_KEY=$(grep "^GEMINI_API_KEY=" .env.local | cut -d'=' -f2 | tr -d '\n\r')
AZURE_ENDPOINT=$(grep "^AZURE_OPENAI_ENDPOINT=" .env.local | cut -d'=' -f2 | tr -d '\n\r')
AZURE_KEY=$(grep "^AZURE_OPENAI_API_KEY=" .env.local | cut -d'=' -f2 | tr -d '\n\r')
AZURE_VERSION=$(grep "^AZURE_OPENAI_API_VERSION=" .env.local | cut -d'=' -f2 | tr -d '\n\r')
AZURE_DEPLOYMENT=$(grep "^AZURE_OPENAI_DEPLOYMENT=" .env.local | cut -d'=' -f2 | tr -d '\n\r')

FB_API_KEY=$(grep "^NEXT_PUBLIC_FIREBASE_API_KEY=" .env.local | cut -d'=' -f2 | tr -d '\n\r')
FB_AUTH_DOMAIN=$(grep "^NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=" .env.local | cut -d'=' -f2 | tr -d '\n\r')
FB_PROJECT_ID=$(grep "^NEXT_PUBLIC_FIREBASE_PROJECT_ID=" .env.local | cut -d'=' -f2 | tr -d '\n\r')
FB_STORAGE_BUCKET=$(grep "^NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=" .env.local | cut -d'=' -f2 | tr -d '\n\r')
FB_SENDER_ID=$(grep "^NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=" .env.local | cut -d'=' -f2 | tr -d '\n\r')
FB_APP_ID=$(grep "^NEXT_PUBLIC_FIREBASE_APP_ID=" .env.local | cut -d'=' -f2 | tr -d '\n\r')
FB_MEASUREMENT_ID=$(grep "^NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=" .env.local | cut -d'=' -f2 | tr -d '\n\r')

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
# First, clear any existing secrets that conflict with environment variables
echo "Clearing existing secrets if any..."
gcloud run services update $SERVICE_NAME \
  --clear-secrets=GEMINI_API_KEY,NEXT_PUBLIC_GEMINI_API_KEY \
  --region=$REGION \
  --project=$PROJECT_ID 2>/dev/null || echo "Note: Some secrets may not exist (this is OK)"

echo ""
echo "Deploying with environment variables..."
gcloud run deploy $SERVICE_NAME \
  --image=$IMAGE_NAME:latest \
  --platform=managed \
  --region=$REGION \
  --allow-unauthenticated \
  --memory=2Gi \
  --cpu=2 \
  --min-instances=0 \
  --max-instances=10 \
  --port=8080 \
  --timeout=300 \
  --clear-secrets=GEMINI_API_KEY,NEXT_PUBLIC_GEMINI_API_KEY \
  --set-env-vars="NODE_ENV=production,PORT=8080,NEXT_TELEMETRY_DISABLED=1,USE_GEMINI_ONLY=true,PRIMARY_MODEL=gemini,GEMINI_STABLE_MODE_MODEL=gemini-3-pro-preview,GEMINI_API_KEY=$GEMINI_KEY,AZURE_OPENAI_ENDPOINT=$AZURE_ENDPOINT,AZURE_OPENAI_API_KEY=$AZURE_KEY,AZURE_OPENAI_API_VERSION=$AZURE_VERSION,AZURE_OPENAI_DEPLOYMENT=$AZURE_DEPLOYMENT,NEXT_PUBLIC_FIREBASE_API_KEY=$FB_API_KEY,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$FB_AUTH_DOMAIN,NEXT_PUBLIC_FIREBASE_PROJECT_ID=$FB_PROJECT_ID,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$FB_STORAGE_BUCKET,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$FB_SENDER_ID,NEXT_PUBLIC_FIREBASE_APP_ID=$FB_APP_ID,NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=$FB_MEASUREMENT_ID" \
  --project=$PROJECT_ID

echo ""
echo "✅ Deployment complete!"
echo ""

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --platform=managed \
  --region=$REGION \
  --format='value(status.url)' \
  --project=$PROJECT_ID)

echo "Service URL: $SERVICE_URL"
echo ""
echo "Quick Tests:"
echo "1. Health check:   curl $SERVICE_URL/api"
echo "2. Episode health: curl '$SERVICE_URL/api/generate/episode/production-route?endpoint=health'"
echo ""
echo "View logs:"
echo "gcloud run services logs tail $SERVICE_NAME --region=$REGION"

