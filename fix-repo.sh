#!/bin/bash
# Script to fix Artifact Registry repository issues

set -e

PROJECT_ID="reeled-ai-production"
REGION="us-central1"
SERVICE_ACCOUNT="57725991954@cloudbuild.gserviceaccount.com"
REPO_LOCATION="us"

echo "Setting up Google Cloud project..."
gcloud config set project "$PROJECT_ID"

echo "Enabling required services..."
gcloud services enable artifactregistry.googleapis.com

echo "Creating Docker repository in Artifact Registry..."
gcloud artifacts repositories create docker-repo \
  --repository-format=docker \
  --location="$REPO_LOCATION" \
  --description="Docker repository for Reeled AI" \
  --project="$PROJECT_ID" || echo "Repository already exists"

echo "Granting permissions to Cloud Build service account..."
gcloud artifacts repositories add-iam-policy-binding docker-repo \
  --location="$REPO_LOCATION" \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/artifactregistry.writer"

echo "Updating cloudbuild.yaml to use the new repository..."
cat > cloudbuild.yaml << 'EOF'
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: [
      'build', 
      '-t', 'us-docker.pkg.dev/${PROJECT_ID}/docker-repo/reeled-ai:latest', 
      '--build-arg', 'GEMINI_API_KEY=${_GEMINI_API_KEY}',
      '--build-arg', 'UNSPLASH_ACCESS_KEY=${_UNSPLASH_ACCESS_KEY}',
      '--build-arg', 'UNSPLASH_SECRET_KEY=${_UNSPLASH_SECRET_KEY}',
      '--build-arg', 'NEXT_PUBLIC_FIREBASE_API_KEY=${_NEXT_PUBLIC_FIREBASE_API_KEY}',
      '--build-arg', 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${_NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}',
      '--build-arg', 'NEXT_PUBLIC_FIREBASE_PROJECT_ID=${_NEXT_PUBLIC_FIREBASE_PROJECT_ID}',
      '--build-arg', 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${_NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}',
      '--build-arg', 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${_NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}',
      '--build-arg', 'NEXT_PUBLIC_FIREBASE_APP_ID=${_NEXT_PUBLIC_FIREBASE_APP_ID}',
      '--build-arg', 'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=${_NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID}',
      '.'
    ]
  
  # Push the container image to Artifact Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'us-docker.pkg.dev/${PROJECT_ID}/docker-repo/reeled-ai:latest']
  
  # Deploy container image to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
    - 'run'
    - 'deploy'
    - 'reeled-ai'
    - '--image'
    - 'us-docker.pkg.dev/${PROJECT_ID}/docker-repo/reeled-ai:latest'
    - '--region'
    - 'us-central1'
    - '--platform'
    - 'managed'
    - '--allow-unauthenticated'
    - '--set-env-vars'
    - 'GEMINI_API_KEY=${_GEMINI_API_KEY},UNSPLASH_ACCESS_KEY=${_UNSPLASH_ACCESS_KEY},UNSPLASH_SECRET_KEY=${_UNSPLASH_SECRET_KEY},NEXT_PUBLIC_FIREBASE_API_KEY=${_NEXT_PUBLIC_FIREBASE_API_KEY},NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${_NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN},NEXT_PUBLIC_FIREBASE_PROJECT_ID=${_NEXT_PUBLIC_FIREBASE_PROJECT_ID},NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${_NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET},NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${_NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID},NEXT_PUBLIC_FIREBASE_APP_ID=${_NEXT_PUBLIC_FIREBASE_APP_ID},NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=${_NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID}'

images:
  - 'us-docker.pkg.dev/${PROJECT_ID}/docker-repo/reeled-ai:latest'
EOF

echo "Fix completed! Now run the deploy-prod.sh script again." 