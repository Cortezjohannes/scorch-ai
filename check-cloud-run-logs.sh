#!/bin/bash
# Check Cloud Run logs for image generation errors

echo "🔍 Checking Cloud Run logs for image generation errors..."
echo ""

# Get recent errors
echo "📋 Recent errors (last 100 logs):"
gcloud run services logs read reeled-ai-v2 \
  --region=us-central1 \
  --limit=100 \
  --format="table(timestamp,severity,textPayload)" \
  | grep -i -E "(error|failed|unavailable|503|timeout)" \
  | tail -20

echo ""
echo "📋 Recent Nano Banana logs:"
gcloud run services logs read reeled-ai-v2 \
  --region=us-central1 \
  --limit=100 \
  --format="value(textPayload)" \
  | grep -i "NANO BANANA" \
  | tail -10

echo ""
echo "📋 Service configuration:"
gcloud run services describe reeled-ai-v2 \
  --region=us-central1 \
  --format="yaml(spec.template.spec.timeoutSeconds,spec.template.spec.containers[0].resources)" \
  2>&1 | head -20










