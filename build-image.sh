#!/bin/bash
# Script to build and push Docker image to Artifact Registry

echo "Building Docker image..."
docker build -t us-central1-docker.pkg.dev/reeled-ai-production/reeled-ai-repo/reeled-ai-app:v2 -f Dockerfile.simple .

echo "Pushing Docker image to Artifact Registry..."
docker push us-central1-docker.pkg.dev/reeled-ai-production/reeled-ai-repo/reeled-ai-app:v2

echo "Image built and pushed successfully!" 