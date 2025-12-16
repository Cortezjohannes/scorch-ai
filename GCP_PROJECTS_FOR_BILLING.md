# Google Cloud Projects for Billing Configuration

## Projects Identified in Codebase

### 1. **reeled-ai-production** (Primary GCP Project)
- **Type**: Google Cloud Platform Project
- **Usage**: 
  - Cloud Run deployments
  - Artifact Registry (Docker images)
  - Cloud Build CI/CD
- **Location**: `deploy-to-cloud-run.sh`, `cloudbuild.yaml`, `setup-thegreenlitstudios-domain.sh`
- **Billing Required For**: 
  - ✅ **VEO 3.1 via Vertex AI** (if using Vertex AI endpoint)
  - ✅ Cloud Run hosting
  - ✅ Artifact Registry storage
  - ✅ Cloud Build compute

### 2. **greenlitai** (Firebase Project)
- **Type**: Firebase Project (also a GCP project)
- **Usage**:
  - Firebase Authentication
  - Firestore Database
  - Firebase Storage
  - Local development
  - Cloud Build pipeline (new deployments)
- **Location**: `.env.example`, `cloudbuild.yaml`, most Firebase configs
- **Billing Required For**:
  - ✅ **VEO 3.1 via Vertex AI** (if Vertex AI is enabled on this project)
  - ✅ Firebase services (if exceeding free tier)
  - ✅ Firestore storage/operations
  - ✅ Firebase Storage

### 3. **reeled-ai-48459** (Legacy Firebase Project)
- **Type**: Firebase Project (legacy production)
- **Usage**:
  - Existing production data
  - Legacy Cloud Run deployments
- **Location**: `deploy.yaml`, `build-vars.yaml`
- **Billing Required For**:
  - ⚠️ Only if still actively using for VEO 3.1
  - Firebase services (if exceeding free tier)

## VEO 3.1 Billing Configuration

### Option 1: Using Gemini API (Current Implementation)
- **Project**: Uses `GEMINI_API_KEY` (not tied to specific GCP project)
- **Billing**: Handled through Gemini API billing account
- **No GCP Project Required**: If using Gemini API directly

### Option 2: Using Vertex AI (Recommended for VEO 3.1)
- **Project**: Requires a Google Cloud Project with Vertex AI enabled
- **Recommended Project**: **reeled-ai-production** or **greenlitai**
- **Billing**: Must be configured on the GCP project

## Recommended Billing Setup

### For VEO 3.1 via Vertex AI:

1. **Primary Recommendation**: Use **reeled-ai-production**
   ```bash
   # Enable Vertex AI API
   gcloud services enable aiplatform.googleapis.com --project=reeled-ai-production
   
   # Set project for Vertex AI
   export GOOGLE_CLOUD_PROJECT_ID=reeled-ai-production
   ```

2. **Alternative**: Use **greenlitai** (if you want to keep everything in Firebase project)
   ```bash
   # Enable Vertex AI API
   gcloud services enable aiplatform.googleapis.com --project=greenlitai
   
   # Set project for Vertex AI
   export GOOGLE_CLOUD_PROJECT_ID=greenlitai
   ```

## Environment Variable Configuration

Add to `.env.local` or production environment:

```bash
# For Vertex AI VEO 3.1 access
GOOGLE_CLOUD_PROJECT_ID=reeled-ai-production
# OR
GOOGLE_CLOUD_PROJECT_ID=greenlitai

# Service account credentials (if using Vertex AI)
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
```

## Cost Tracking

VEO 3.1 pricing (as of 2024):
- Standard with audio: **$0.40/second**
- Standard without audio: **$0.20/second**
- Fast with audio: **$0.15/second**
- Fast without audio: **$0.10/second**

Example: 8-second storyboard video = **$3.20** (standard+audio) or **$1.20** (fast+audio)

## Action Items

1. ✅ **Enable billing** on the GCP project you'll use for VEO 3.1
2. ✅ **Enable Vertex AI API** on that project
3. ✅ **Set `GOOGLE_CLOUD_PROJECT_ID`** environment variable
4. ✅ **Configure service account** if using Vertex AI (optional if using Gemini API key)
5. ✅ **Monitor costs** - VEO 3.1 usage will appear in Cloud Console billing

## Quick Check Commands

```bash
# Check current project
gcloud config get-value project

# List all projects
gcloud projects list

# Check if Vertex AI is enabled
gcloud services list --enabled --project=reeled-ai-production | grep aiplatform

# Enable Vertex AI API
gcloud services enable aiplatform.googleapis.com --project=reeled-ai-production
```


























