#!/bin/bash
# Streamlined Cloud Run Deployment Script
# This script deploys Reeled AI to Google Cloud Run

set -e  # Exit on error

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="reeled-ai-production"
SERVICE_NAME="reeled-ai-v2"
REGION="us-central1"
REPO_NAME="docker-repo"
IMAGE_NAME="us-central1-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${SERVICE_NAME}"

echo -e "${BLUE}🚀 REELED AI - Cloud Run Deployment${NC}"
echo "===================================="
echo ""

# Step 1: Verify authentication
echo -e "${BLUE}📋 Step 1: Verifying Google Cloud authentication...${NC}"
ACTIVE_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null | head -1)
if [ -z "$ACTIVE_ACCOUNT" ]; then
    echo -e "${RED}✗ Not authenticated with Google Cloud${NC}"
    echo "Please run: gcloud auth login"
    exit 1
fi
echo -e "${GREEN}✓ Authenticated as: $ACTIVE_ACCOUNT${NC}"
echo ""

# Step 2: Verify project
echo -e "${BLUE}📋 Step 2: Verifying project configuration...${NC}"
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
    echo -e "${YELLOW}⚠ Current project is $CURRENT_PROJECT, switching to $PROJECT_ID${NC}"
    gcloud config set project $PROJECT_ID
fi
echo -e "${GREEN}✓ Project: $PROJECT_ID${NC}"
echo ""

# Step 3: Enable required services
echo -e "${BLUE}📋 Step 3: Ensuring required services are enabled...${NC}"
echo "This may take a minute if services need to be enabled..."
if gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  --project=$PROJECT_ID \
  --quiet 2>/dev/null; then
    echo -e "${GREEN}✓ Required services enabled${NC}"
else
    echo -e "${YELLOW}⚠ Could not verify/enable services (auth may be expired, assuming already enabled)${NC}"
fi
echo ""

# Step 4: Verify Artifact Registry
echo -e "${BLUE}📋 Step 4: Checking Artifact Registry...${NC}"
if gcloud artifacts repositories describe $REPO_NAME --location=$REGION --project=$PROJECT_ID &>/dev/null; then
    echo -e "${GREEN}✓ Artifact Registry repository exists${NC}"
else
    echo -e "${YELLOW}⚠ Creating Artifact Registry repository...${NC}"
    if gcloud artifacts repositories create $REPO_NAME \
      --repository-format=docker \
      --location=$REGION \
      --description="Docker repository for Reeled AI" \
      --project=$PROJECT_ID 2>/dev/null; then
        echo -e "${GREEN}✓ Repository created${NC}"
    else
        echo -e "${YELLOW}⚠ Could not verify/create repository (auth may be expired, assuming it exists)${NC}"
    fi
fi
echo ""

# Step 5: Prepare environment variables
echo -e "${BLUE}📋 Step 5: Preparing environment variables...${NC}"
if [ ! -f .env.local ]; then
    echo -e "${RED}✗ .env.local not found!${NC}"
    exit 1
fi

# Extract key environment variables
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

echo -e "${GREEN}✓ Environment variables loaded${NC}"
echo ""

# Step 6: Choose deployment method
echo -e "${BLUE}📋 Step 6: Select deployment method${NC}"
echo ""
echo "Choose deployment method:"
echo "1) Cloud Build (Recommended) - Google builds and deploys"
echo "2) Local Build + Deploy - Build locally, deploy to Cloud Run"
echo "3) Cancel"
echo ""
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        # Cloud Build deployment
        echo ""
        echo -e "${BLUE}🏗️  Deploying with Cloud Build...${NC}"
        echo "This will use cloudbuild.yaml to build and deploy"
        echo ""
        
        gcloud builds submit \
          --config cloudbuild.yaml \
          --project=$PROJECT_ID \
          --substitutions=_SERVICE_NAME=$SERVICE_NAME,_REGION=$REGION
        
        echo -e "${GREEN}✓ Cloud Build deployment submitted${NC}"
        ;;
        
    2)
        # Local build + deploy
        echo ""
        echo -e "${BLUE}🏗️  Building and deploying locally...${NC}"
        echo ""
        
        # Check if Docker is running
        if ! docker info &>/dev/null; then
            echo -e "${RED}✗ Docker is not running${NC}"
            echo "Please start Docker Desktop and try again"
            exit 1
        fi
        
        # Configure Docker for Artifact Registry
        echo -e "${BLUE}Configuring Docker authentication...${NC}"
        gcloud auth configure-docker us-central1-docker.pkg.dev --quiet
        
        # Build the image
        echo -e "${BLUE}Building Docker image...${NC}"
        docker build -t $IMAGE_NAME:latest .
        
        # Push to Artifact Registry
        echo -e "${BLUE}Pushing to Artifact Registry...${NC}"
        docker push $IMAGE_NAME:latest
        
        # Deploy to Cloud Run
        echo -e "${BLUE}Deploying to Cloud Run...${NC}"
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
          --timeout=1800 \
          --set-env-vars="NODE_ENV=production,NEXT_TELEMETRY_DISABLED=1,USE_GEMINI_ONLY=true,PRIMARY_MODEL=gemini,GEMINI_STABLE_MODE_MODEL=gemini-3-pro-preview,AZURE_OPENAI_ENDPOINT=$AZURE_ENDPOINT,AZURE_OPENAI_API_KEY=$AZURE_KEY,AZURE_OPENAI_API_VERSION=$AZURE_VERSION,AZURE_OPENAI_DEPLOYMENT=$AZURE_DEPLOYMENT,NEXT_PUBLIC_FIREBASE_API_KEY=$FB_API_KEY,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$FB_AUTH_DOMAIN,NEXT_PUBLIC_FIREBASE_PROJECT_ID=$FB_PROJECT_ID,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$FB_STORAGE_BUCKET,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$FB_SENDER_ID,NEXT_PUBLIC_FIREBASE_APP_ID=$FB_APP_ID,NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=$FB_MEASUREMENT_ID" \
          --set-secrets="GEMINI_API_KEY=gemini-api-key:latest" \
          --project=$PROJECT_ID
        
        echo -e "${GREEN}✓ Deployment complete${NC}"
        ;;
        
    3)
        echo "Deployment cancelled"
        exit 0
        ;;
        
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

# Get service URL
echo ""
echo -e "${BLUE}📋 Getting service URL...${NC}"
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --platform=managed \
  --region=$REGION \
  --format='value(status.url)' \
  --project=$PROJECT_ID)

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}✅ DEPLOYMENT SUCCESSFUL!${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "${BLUE}Service URL:${NC} $SERVICE_URL"
echo ""
echo -e "${BLUE}Quick Tests:${NC}"
echo "1. Health check:   curl $SERVICE_URL/api"
echo "2. Episode health: curl '$SERVICE_URL/api/generate/episode/production-route?endpoint=health'"
echo ""
echo -e "${BLUE}View logs:${NC}"
echo "gcloud run services logs tail $SERVICE_NAME --region=$REGION"
echo ""
echo -e "${BLUE}Console:${NC}"
echo "https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME/metrics?project=$PROJECT_ID"
echo ""




