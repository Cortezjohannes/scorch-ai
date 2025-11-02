# Deployment Instructions for app.reeledai.com

This document provides step-by-step instructions for deploying the Reeled AI application to Google Cloud with the subdomain app.reeledai.com.

## Prerequisites

1. Google Cloud account with billing enabled
2. Google Cloud SDK installed
3. Domain ownership of reeledai.com
4. Environment variables:
   - GEMINI_API_KEY
   - UNSPLASH_ACCESS_KEY
   - UNSPLASH_SECRET_KEY

## Step 1: Create Google Cloud Project

```bash
# Create a new project (or use an existing one)
gcloud projects create reeled-ai-app --name="Reeled AI Application"

# Set the newly created project as default
gcloud config set project reeled-ai-app

# Enable required services
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable dns.googleapis.com
```

## Step 2: Set Up Environment Variables in Google Cloud

```bash
# Create a secret for each environment variable
echo -n "your-gemini-api-key" | gcloud secrets create GEMINI_API_KEY --data-file=-
echo -n "your-unsplash-access-key" | gcloud secrets create UNSPLASH_ACCESS_KEY --data-file=-
echo -n "your-unsplash-secret-key" | gcloud secrets create UNSPLASH_SECRET_KEY --data-file=-
```

## Step 3: Build and Deploy the Application

```bash
# Build container image using Cloud Build
gcloud builds submit --tag gcr.io/reeled-ai-app/reeled-ai

# Deploy to Cloud Run
gcloud run deploy reeled-ai \
  --image gcr.io/reeled-ai-app/reeled-ai \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets=GEMINI_API_KEY=GEMINI_API_KEY:latest,UNSPLASH_ACCESS_KEY=UNSPLASH_ACCESS_KEY:latest,UNSPLASH_SECRET_KEY=UNSPLASH_SECRET_KEY:latest
```

## Step 4: Configure DNS for app.reeledai.com

1. Get the Cloud Run service URL:
```bash
gcloud run services describe reeled-ai --platform managed --region us-central1 --format="value(status.url)"
```

2. Configure Custom Domain in Cloud Run:
```bash
gcloud beta run domain-mappings create --service reeled-ai --domain app.reeledai.com --region us-central1
```

3. Update your DNS provider (where reeledai.com is registered) with the verification details provided by Google Cloud:
   - Add the TXT record for verification
   - Add the CNAME record: `app.reeledai.com` pointing to `ghs.googlehosted.com`

## Step 5: Verify Deployment

Wait for DNS propagation (may take 24-48 hours), then visit https://app.reeledai.com to verify the deployment.

## Troubleshooting

1. If the application isn't working, check Cloud Run logs:
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=reeled-ai" --limit 20
```

2. If environment variables aren't being set correctly, verify secrets:
```bash
gcloud secrets list
```

3. If DNS isn't resolving, check the domain mapping:
```bash
gcloud beta run domain-mappings describe --domain app.reeledai.com --region us-central1
```

## Continuous Deployment

For continuous deployment, set up a Cloud Build trigger:

```bash
gcloud builds triggers create github \
  --repo-name="your-github-repo" \
  --branch-pattern="main" \
  --build-config="cloudbuild.yaml"
``` 