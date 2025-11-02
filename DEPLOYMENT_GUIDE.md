# Reeled AI Deployment Guide

This guide provides step-by-step instructions for deploying the Reeled AI application to Google Cloud Run.

## Prerequisites

1. **Google Cloud Account**: You must have a Google Cloud account with billing enabled.
2. **Google Cloud CLI**: Install the Google Cloud CLI on your local machine.
3. **Firebase Project**: You should have already set up a Firebase project for the application.
4. **Environment Variables**: Ensure you have all required API keys and environment variables.

## Deployment Steps

### 1. Set Environment Variables

```bash
# Export environment variables
export GEMINI_API_KEY=your_gemini_api_key
export UNSPLASH_ACCESS_KEY=your_unsplash_access_key
export UNSPLASH_SECRET_KEY=your_unsplash_secret_key
export NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
export NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
export NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
export NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
export NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
export NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
export NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
```

### 2. Configure Google Cloud Project

```bash
# Set your project ID
export PROJECT_ID="reeled-ai-production"
export REGION="us-central1"
export SERVICE_NAME="reeled-ai"

# Set the active project
gcloud config set project $PROJECT_ID

# Enable required services
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com
```

### 3. Store Secrets in Secret Manager

```bash
# Store API keys in Secret Manager
echo -n "$GEMINI_API_KEY" | gcloud secrets create GEMINI_API_KEY --data-file=- --replication-policy="automatic" || \
echo -n "$GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

echo -n "$UNSPLASH_ACCESS_KEY" | gcloud secrets create UNSPLASH_ACCESS_KEY --data-file=- --replication-policy="automatic" || \
echo -n "$UNSPLASH_ACCESS_KEY" | gcloud secrets versions add UNSPLASH_ACCESS_KEY --data-file=-

echo -n "$UNSPLASH_SECRET_KEY" | gcloud secrets create UNSPLASH_SECRET_KEY --data-file=- --replication-policy="automatic" || \
echo -n "$UNSPLASH_SECRET_KEY" | gcloud secrets versions add UNSPLASH_SECRET_KEY --data-file=-

# Store Firebase configuration in Secret Manager
echo -n "$NEXT_PUBLIC_FIREBASE_API_KEY" | gcloud secrets create NEXT_PUBLIC_FIREBASE_API_KEY --data-file=- --replication-policy="automatic" || \
echo -n "$NEXT_PUBLIC_FIREBASE_API_KEY" | gcloud secrets versions add NEXT_PUBLIC_FIREBASE_API_KEY --data-file=-

echo -n "$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" | gcloud secrets create NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN --data-file=- --replication-policy="automatic" || \
echo -n "$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" | gcloud secrets versions add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN --data-file=-

echo -n "$NEXT_PUBLIC_FIREBASE_PROJECT_ID" | gcloud secrets create NEXT_PUBLIC_FIREBASE_PROJECT_ID --data-file=- --replication-policy="automatic" || \
echo -n "$NEXT_PUBLIC_FIREBASE_PROJECT_ID" | gcloud secrets versions add NEXT_PUBLIC_FIREBASE_PROJECT_ID --data-file=-

echo -n "$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" | gcloud secrets create NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET --data-file=- --replication-policy="automatic" || \
echo -n "$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" | gcloud secrets versions add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET --data-file=-

echo -n "$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" | gcloud secrets create NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --data-file=- --replication-policy="automatic" || \
echo -n "$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" | gcloud secrets versions add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --data-file=-

echo -n "$NEXT_PUBLIC_FIREBASE_APP_ID" | gcloud secrets create NEXT_PUBLIC_FIREBASE_APP_ID --data-file=- --replication-policy="automatic" || \
echo -n "$NEXT_PUBLIC_FIREBASE_APP_ID" | gcloud secrets versions add NEXT_PUBLIC_FIREBASE_APP_ID --data-file=-

echo -n "$NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID" | gcloud secrets create NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID --data-file=- --replication-policy="automatic" || \
echo -n "$NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID" | gcloud secrets versions add NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID --data-file=-
```

### 4. Manual Deployment to Cloud Run from the Google Cloud Console

1. **Visit the Google Cloud Console**: https://console.cloud.google.com/
2. **Navigate to Cloud Run**: In the navigation menu, select "Cloud Run"
3. **Create Service**:
   - Click "Create Service"
   - Select "Deploy one revision from source code"
   - Click "Next"
   - Connect your GitHub repository or upload your source code
   - Configure the build:
     - Set the source location to your code
     - Select "Node.js" as the runtime (or automatically detected)
     - Set the port to 3000
   - Configure the service:
     - Set the service name to "reeled-ai"
     - Set the region to "us-central1"
     - Choose "Allow unauthenticated invocations"
     - Set minimum instances to 0
     - Set maximum instances to 10
     - Set memory to 2GiB
     - Set CPU to 1
     - Set request timeout to 300 seconds
   - Configure environment variables:
     - Add all necessary environment variables (GEMINI_API_KEY, UNSPLASH_ACCESS_KEY, etc.)
   - Click "Create"

### 5. Configure Custom Domain (Optional)

1. **Verify Domain Ownership**:
   - In the Google Cloud Console, navigate to "Cloud Run"
   - Click on your "reeled-ai" service
   - Click on the "Domain Mappings" tab
   - Click "Add Mapping"
   - Enter your domain: "app.reeledai.com"
   - Complete domain verification if required

2. **Update DNS Records**:
   - Once the domain mapping is created, you'll receive CNAME or A records
   - Add these records to your domain's DNS configuration at your domain registrar

### Troubleshooting

1. **Build Failures**: Check the build logs for detailed error messages
2. **Permission Issues**: Ensure the Cloud Build service account has the necessary permissions:
   ```bash
   SERVICE_ACCOUNT=$(gcloud projects get-iam-policy $PROJECT_ID --format='value(bindings.members)' | grep cloudbuild | head -1 | sed 's/serviceAccount://')
   
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:$SERVICE_ACCOUNT" \
     --role="roles/run.admin"
   
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:$SERVICE_ACCOUNT" \
     --role="roles/iam.serviceAccountUser"
   
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:$SERVICE_ACCOUNT" \
     --role="roles/artifactregistry.writer"
   ```

3. **Environment Variables**: Verify all environment variables are correctly set
4. **Resource Limits**: If the application crashes, consider increasing memory or CPU

### Post-Deployment

Once deployed, your application will be available at:
- **Cloud Run URL**: https://reeled-ai-[PROJECT_ID].run.app
- **Custom Domain** (if configured): https://app.reeledai.com

### Monitoring and Logs

- **View Logs**: In the Google Cloud Console, navigate to "Cloud Run" > Your Service > "Logs"
- **Monitor Performance**: Navigate to "Cloud Run" > Your Service > "Metrics" 