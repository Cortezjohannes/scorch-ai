#!/bin/bash

# Script to set up secrets in Google Cloud Secret Manager
# This ensures all production secrets are stored securely
#
# Usage:
#   ./scripts/setup-secrets.sh
#
# Before running:
#   1. Make sure you have gcloud CLI installed and authenticated
#   2. Set your project: gcloud config set project reeled-ai-production
#   3. Have your API keys ready (they'll be prompted for security)

set -e

PROJECT_ID="reeled-ai-production"
REQUIRED_SECRETS=(
  "gemini-api-key"
  "azure-openai-api-key"
  "azure-dalle-api-key"
  "azure-gpt45-api-key"
)

echo "🔐 Google Cloud Secret Manager Setup"
echo "======================================"
echo ""
echo "This script will help you set up secrets in Google Cloud Secret Manager."
echo "Secrets will be stored securely and used by Cloud Run services."
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
  echo "❌ Error: gcloud CLI not found"
  echo "   Install from: https://cloud.google.com/sdk/docs/install"
  exit 1
fi

# Check if authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
  echo "❌ Error: Not authenticated with gcloud"
  echo "   Run: gcloud auth login"
  exit 1
fi

# Set project
echo "📋 Setting project to $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Enable Secret Manager API
echo "🔧 Enabling Secret Manager API..."
gcloud services enable secretmanager.googleapis.com --project=$PROJECT_ID

echo ""
echo "Setting up secrets..."
echo ""

# Create or update each secret
for secret_name in "${REQUIRED_SECRETS[@]}"; do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔑 $secret_name"
  
  # Check if secret already exists
  if gcloud secrets describe "$secret_name" --project="$PROJECT_ID" &>/dev/null; then
    echo "   Secret already exists"
    read -p "   Update existing secret? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo "   Skipping..."
      continue
    fi
  fi
  
  # Prompt for secret value (hidden input)
  read -sp "   Enter API key (hidden): " secret_value
  echo
  
  if [ -z "$secret_value" ]; then
    echo "   ⚠️  Empty value, skipping..."
    continue
  fi
  
  # Create or update secret
  if gcloud secrets describe "$secret_name" --project="$PROJECT_ID" &>/dev/null; then
    # Update existing secret
    echo -n "$secret_value" | gcloud secrets versions add "$secret_name" \
      --data-file=- \
      --project="$PROJECT_ID" > /dev/null
    echo "   ✅ Secret updated"
  else
    # Create new secret
    echo -n "$secret_value" | gcloud secrets create "$secret_name" \
      --data-file=- \
      --replication-policy="automatic" \
      --project="$PROJECT_ID" > /dev/null
    echo "   ✅ Secret created"
  fi
  
  # Grant Cloud Run access to secret
  echo "   Setting IAM permissions for Cloud Run..."
  gcloud secrets add-iam-policy-binding "$secret_name" \
    --member="serviceAccount:$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')@cloudbuild.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor" \
    --project="$PROJECT_ID" > /dev/null 2>&1 || true
  
  # Also grant to Compute Engine default service account (for Cloud Run)
  gcloud secrets add-iam-policy-binding "$secret_name" \
    --member="serviceAccount:$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor" \
    --project="$PROJECT_ID" > /dev/null 2>&1 || true
  
  echo "   ✅ Permissions configured"
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Secret setup complete!"
echo ""
echo "📋 Verify secrets:"
echo "   gcloud secrets list --project=$PROJECT_ID"
echo ""
echo "🔍 View secret names (not values):"
for secret in "${REQUIRED_SECRETS[@]}"; do
  echo "   - $secret"
done
echo ""
echo "⚠️  IMPORTANT: Never commit API keys to git!"
echo "   Use these secrets in deployment scripts with --set-secrets flag"
echo ""

