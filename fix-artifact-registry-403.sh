#!/bin/bash
# Script to fix Artifact Registry 403 errors

set -e

PROJECT_ID="reeled-ai-production"
REGION="us-central1"
REPOSITORY_NAME="reeled-ai-repo"

echo "🔧 Fixing Artifact Registry 403 errors..."

# 1. Authenticate and set project
echo "📋 Setting up authentication..."
gcloud auth login
gcloud config set project $PROJECT_ID

# 2. Enable required APIs
echo "🔌 Enabling required APIs..."
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com

# 3. Create Artifact Registry repository
echo "📦 Creating Artifact Registry repository..."
gcloud artifacts repositories create $REPOSITORY_NAME \
  --repository-format=docker \
  --location=$REGION \
  --description="Repository for Reeled AI container images" \
  --quiet || echo "Repository may already exist"

# 4. Configure Docker authentication
echo "🔐 Configuring Docker authentication for Artifact Registry..."
gcloud auth configure-docker $REGION-docker.pkg.dev

# 5. Get the Cloud Build service account
echo "👤 Setting up service account permissions..."
CLOUD_BUILD_SA=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")@cloudbuild.gserviceaccount.com

# 6. Grant necessary permissions to Cloud Build service account
echo "🔑 Granting permissions to Cloud Build service account..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$CLOUD_BUILD_SA" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$CLOUD_BUILD_SA" \
  --role="roles/artifactregistry.reader"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$CLOUD_BUILD_SA" \
  --role="roles/run.admin"

# 7. Grant permissions to your user account
echo "👤 Granting permissions to your user account..."
USER_EMAIL=$(gcloud config get-value account)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="user:$USER_EMAIL" \
  --role="roles/artifactregistry.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="user:$USER_EMAIL" \
  --role="roles/run.admin"

# 8. Test authentication
echo "🧪 Testing authentication..."
echo "Testing Docker authentication..."
docker pull hello-world
docker tag hello-world $REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY_NAME/hello-world:latest
docker push $REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY_NAME/hello-world:latest

echo "✅ Authentication test successful!"

# 9. Clean up test image
echo "🧹 Cleaning up test image..."
docker rmi $REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY_NAME/hello-world:latest || true

echo "🎉 Artifact Registry 403 error fix completed!"
echo "📋 Summary of changes:"
echo "   - Created Artifact Registry repository: $REPOSITORY_NAME"
echo "   - Configured Docker authentication"
echo "   - Granted necessary IAM permissions"
echo "   - Tested authentication successfully"
echo ""
echo "🚀 You can now run: ./deploy-cloud-run-fixed.sh"










