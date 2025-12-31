# 🚀 Google Cloud Run Deployment Plan - Reeled AI

## 📋 Deployment Overview

**Project ID**: `reeled-ai-production`  
**Service Name**: `reeled-ai-v2`  
**Region**: `us-central1`  
**Domain**: `app.reeledai.com`

---

## ✅ Pre-Deployment Checklist

### 1. **Environment Variables** ✓
Your application uses the following APIs that need to be configured:

#### AI Services
- ✅ **Gemini 2.5 Pro** - Primary AI model (configured)
- ✅ **Azure OpenAI** - DALL-E 3 image generation (configured)
- ⚠️ **Unsplash API** - Image search (needs verification)

#### Firebase Services
- ⚠️ Authentication
- ⚠️ Firestore Database
- ⚠️ Storage
- ⚠️ Analytics

### 2. **Critical API Routes** ✓
Your application has these key API endpoints that will be deployed:

#### Core Generation APIs
- `/api/generate/episode/route.ts` - Episode generation
- `/api/generate/complete-narrative/route.ts` - Complete narrative generation
- `/api/generate/story-bible/route.ts` - Story bible generation
- `/api/generate/preproduction/route.ts` - Pre-production planning

#### Image & Visual APIs
- `/api/generate/image/route.ts` - AI image generation (DALL-E 3)
- `/api/generate-image/route.ts` - Legacy image generation

#### Analysis & Processing APIs
- `/api/analyze-script/route.ts` - Script analysis
- `/api/translate/taglish/route.ts` - Translation services

#### Sharing & Storage APIs
- `/api/save-episode/route.ts` - Episode persistence
- `/api/save-story-bible/route.ts` - Story bible persistence
- `/api/share-story-bible/route.ts` - Sharing functionality

### 3. **Docker Configuration** ✓
- ✅ Dockerfile configured with Node 20 Alpine
- ✅ Standalone output mode enabled in next.config.js
- ✅ Port 8080 configured for Cloud Run
- ✅ Build optimization configured

---

## 🔐 Step 1: Authentication & Setup

### Authenticate with Google Cloud
```bash
# Authenticate your account
gcloud auth login

# Set the project
gcloud config set project reeled-ai-production

# Configure Docker for Artifact Registry
gcloud auth configure-docker us-central1-docker.pkg.dev
```

---

## 🔧 Step 2: Verify Environment Variables

### Required Variables for Cloud Run
Create/verify these environment variables for deployment:

```bash
# AI Services
# Use Secret Manager for API keys - DO NOT hardcode them here
# GEMINI_API_KEY should be stored in Google Cloud Secret Manager as 'gemini-api-key'
# AZURE_OPENAI_API_KEY should be stored in Google Cloud Secret Manager as 'azure-openai-api-key'
AZURE_OPENAI_ENDPOINT=https://reeled-ai-alpha.openai.azure.com/
AZURE_OPENAI_API_KEY=[your-key]
AZURE_OPENAI_API_VERSION=2024-12-01-preview
AZURE_OPENAI_DEPLOYMENT=gpt-4.1

# Model Configuration
USE_GEMINI_ONLY=true
PRIMARY_MODEL=gemini
GEMINI_STABLE_MODE_MODEL=gemini-2.5-pro

# Firebase Configuration (NEED TO VERIFY)
NEXT_PUBLIC_FIREBASE_API_KEY=[your-firebase-key]
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=[your-domain]
NEXT_PUBLIC_FIREBASE_PROJECT_ID=[your-project-id]
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=[your-bucket]
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=[your-sender-id]
NEXT_PUBLIC_FIREBASE_APP_ID=[your-app-id]
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=[your-measurement-id]

# Unsplash API (NEED TO VERIFY)
UNSPLASH_ACCESS_KEY=[your-unsplash-key]
UNSPLASH_SECRET_KEY=[your-unsplash-secret]

# Application Configuration
NODE_ENV=production
PORT=8080
NEXT_TELEMETRY_DISABLED=1
```

---

## 🏗️ Step 3: Enable Required Services

Run this command to enable all necessary Google Cloud services:

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  --project=reeled-ai-production
```

---

## 🔒 Step 4: Store Secrets in Secret Manager

### Option A: Using Secret Manager (Recommended)
```bash
# Store Gemini API Key
echo -n "AIzaSyAvLsvx7Dm-cUZfhE1ikVp7t1jT1iCxJ_c" | gcloud secrets create GEMINI_API_KEY \
  --data-file=- --replication-policy="automatic" || \
echo -n "AIzaSyAvLsvx7Dm-cUZfhE1ikVp7t1jT1iCxJ_c" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Store Azure OpenAI credentials
echo -n "$AZURE_OPENAI_API_KEY" | gcloud secrets create AZURE_OPENAI_API_KEY \
  --data-file=- --replication-policy="automatic" || \
echo -n "$AZURE_OPENAI_API_KEY" | gcloud secrets versions add AZURE_OPENAI_API_KEY --data-file=-

# Store Firebase keys (repeat for each Firebase env var)
# ... (similar pattern for all Firebase variables)
```

### Option B: Direct Environment Variables (Simpler)
Pass environment variables directly during deployment (Step 6)

---

## 🏗️ Step 5: Verify Artifact Registry

Check if the Docker repository exists:

```bash
# List repositories
gcloud artifacts repositories list --location=us-central1

# If repository doesn't exist, create it:
gcloud artifacts repositories create docker-repo \
  --repository-format=docker \
  --location=us-central1 \
  --description="Docker repository for Reeled AI"
```

---

## 🚀 Step 6: Deploy to Cloud Run

### Method 1: Using Cloud Build (Recommended)
Deploy using the existing `cloudbuild.yaml`:

```bash
# Submit build to Cloud Build
gcloud builds submit --config cloudbuild.yaml --project=reeled-ai-production
```

### Method 2: Direct Build & Deploy
Manual build and deploy process:

```bash
# Build the Docker image
docker build -t us-central1-docker.pkg.dev/reeled-ai-production/docker-repo/reeled-ai-v2:latest .

# Push to Artifact Registry
docker push us-central1-docker.pkg.dev/reeled-ai-production/docker-repo/reeled-ai-v2:latest

# Deploy to Cloud Run with environment variables
gcloud run deploy reeled-ai-v2 \
  --image=us-central1-docker.pkg.dev/reeled-ai-production/docker-repo/reeled-ai-v2:latest \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --memory=2Gi \
  --cpu=2 \
  --min-instances=0 \
  --max-instances=10 \
  --port=8080 \
  --timeout=300 \
  --set-env-vars="NODE_ENV=production,PORT=8080,NEXT_TELEMETRY_DISABLED=1,USE_GEMINI_ONLY=true,PRIMARY_MODEL=gemini,GEMINI_STABLE_MODE_MODEL=gemini-2.5-pro" \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest,AZURE_OPENAI_API_KEY=AZURE_OPENAI_API_KEY:latest" \
  --project=reeled-ai-production
```

### Method 3: Using Existing Deploy Script
```bash
# Use the existing deployment script
./deploy-cloud-run.sh
```

---

## 🌐 Step 7: Configure Custom Domain (Optional)

Map your custom domain to Cloud Run:

```bash
# Create domain mapping
gcloud beta run domain-mappings create \
  --service=reeled-ai-v2 \
  --domain=app.reeledai.com \
  --region=us-central1 \
  --project=reeled-ai-production

# Get DNS records to configure
gcloud beta run domain-mappings describe \
  --domain=app.reeledai.com \
  --region=us-central1 \
  --project=reeled-ai-production
```

Then update your DNS records at your domain registrar.

---

## 🧪 Step 8: Verify Deployment

### Test API Endpoints
```bash
# Get the service URL
SERVICE_URL=$(gcloud run services describe reeled-ai-v2 \
  --platform=managed \
  --region=us-central1 \
  --format='value(status.url)' \
  --project=reeled-ai-production)

# Test health endpoint
curl $SERVICE_URL/api

# Test episode generation monitoring
curl "$SERVICE_URL/api/generate/episode/production-route?endpoint=health"
```

### Check Logs
```bash
# View recent logs
gcloud run services logs read reeled-ai-v2 \
  --region=us-central1 \
  --limit=50 \
  --project=reeled-ai-production
```

---

## 🎯 Critical API Verification

After deployment, test these critical endpoints:

### 1. AI Generation APIs
```bash
# Test Gemini integration
curl -X POST $SERVICE_URL/api/generate/simple \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Test story generation"}'

# Test DALL-E 3 image generation
curl -X POST $SERVICE_URL/api/generate/image \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A cinematic scene", "quality": "hd"}'
```

### 2. Firebase Integration
- Test user authentication via the UI
- Verify story bible save functionality
- Check episode persistence

### 3. Monitoring Endpoints
```bash
# System health
curl "$SERVICE_URL/api/generate/episode/production-route?endpoint=health"

# Metrics
curl "$SERVICE_URL/api/generate/episode/production-route?endpoint=metrics"
```

---

## 🔍 Troubleshooting

### Build Failures
```bash
# Check Cloud Build logs
gcloud builds list --project=reeled-ai-production --limit=5

# View specific build logs
gcloud builds log [BUILD_ID] --project=reeled-ai-production
```

### Runtime Errors
```bash
# Stream logs in real-time
gcloud run services logs tail reeled-ai-v2 \
  --region=us-central1 \
  --project=reeled-ai-production
```

### Permission Issues
```bash
# Grant Cloud Build permissions
PROJECT_NUMBER=$(gcloud projects describe reeled-ai-production --format='value(projectNumber)')

gcloud projects add-iam-policy-binding reeled-ai-production \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding reeled-ai-production \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

---

## 📊 Expected Performance

Based on your configuration:

### Resource Allocation
- **Memory**: 2 GiB (upgraded from 1 GiB for better performance)
- **CPU**: 2 vCPU (upgraded from 1 for faster AI processing)
- **Timeout**: 300 seconds (sufficient for AI generation)
- **Concurrency**: Default (80 requests per instance)

### API Performance Targets
- **Image Generation (DALL-E 3)**: ~27 seconds
- **Episode Generation**: 30-60 seconds
- **Story Bible Generation**: 1-2 minutes
- **Simple Queries**: < 5 seconds

### Cost Estimates
- **Base**: $0 (serverless, pay per use)
- **Per request**: ~$0.08 for image generation + compute time
- **Idle cost**: $0 (min instances = 0)

---

## ✅ Post-Deployment Checklist

- [ ] Service deployed successfully
- [ ] All API endpoints responding
- [ ] Gemini AI integration working
- [ ] DALL-E 3 image generation working
- [ ] Firebase authentication working
- [ ] Episode save/load working
- [ ] Story bible sharing working
- [ ] Monitoring endpoints accessible
- [ ] Custom domain configured (if applicable)
- [ ] Error logging verified

---

## 🎯 NEXT STEPS - What You Need to Do

1. **Authenticate with Google Cloud**
   ```bash
   gcloud auth login
   ```

2. **Verify Firebase Configuration**
   - Check if Firebase variables are set in `.env.local`
   - Confirm Firebase project is properly configured

3. **Verify Unsplash API Keys**
   - Check if Unsplash keys exist in `.env.local`
   - Test if they're still valid

4. **Choose Deployment Method**
   - Cloud Build (recommended) - automated
   - Direct deployment - more control
   - Existing script - quick deployment

5. **Execute Deployment**
   - I'll guide you through the chosen method

---

## 📞 Support Resources

- **Cloud Run Logs**: https://console.cloud.google.com/run/detail/us-central1/reeled-ai-v2/logs
- **Cloud Build History**: https://console.cloud.google.com/cloud-build/builds
- **Artifact Registry**: https://console.cloud.google.com/artifacts
- **Secret Manager**: https://console.cloud.google.com/security/secret-manager

---

**Status**: Ready to deploy once authentication is complete! 🚀




