#!/bin/bash

echo "🚀 Final deployment attempt..."

# Try to fix the permission issue by using a different approach
gcloud run deploy reeled-ai-v2 \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --port 8080 \
  --set-env-vars "GEMINI_API_KEY=AIzaSyB4Zv84FGbknZZ8_h_Pjc6fDdqiRa3txWQ,NODE_ENV=production" \
  --timeout 3600 \
  --quiet

echo "✅ Deployment attempt completed!"











