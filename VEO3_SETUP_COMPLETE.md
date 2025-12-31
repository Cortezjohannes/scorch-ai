# VEO 3.1 Setup Complete ✅

## Steps Completed

### ✅ Step 1: Set GOOGLE_CLOUD_PROJECT_ID
- Set in `.env.local`: `GOOGLE_CLOUD_PROJECT_ID=greenlitai` (or `reeled-ai-production`)

### ✅ Step 2: Enable Vertex AI API
- Enabled: `gcloud services enable aiplatform.googleapis.com --project=greenlitai`

### ✅ Step 3: Authentication Setup
- Service account key found: `lib/firebase-admin/serviceAccountKey.json`
- Service account: `firebase-adminsdk-fbsvc@greenlitai.iam.gserviceaccount.com`
- Vertex AI User role granted
- Code updated to automatically use service account key

### ✅ Step 4: Billing Verification
- Billing enabled on project (you confirmed this)

## Environment Variables

Add to `.env.local`:

```bash
# VEO 3.1 Configuration
GOOGLE_CLOUD_PROJECT_ID=greenlitai
# OR use reeled-ai-production if you prefer:
# GOOGLE_CLOUD_PROJECT_ID=reeled-ai-production

# Service account (automatically detected from lib/firebase-admin/serviceAccountKey.json)
# Or set explicitly:
# GOOGLE_APPLICATION_CREDENTIALS=lib/firebase-admin/serviceAccountKey.json
```

## Testing

1. **Test the connection:**
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/lib/firebase-admin/serviceAccountKey.json"
   node scripts/test-veo3-vertex-ai.js
   ```

2. **Test video generation:**
   - Navigate to: `http://localhost:3000/test-veo3`
   - Fill in the form
   - Click "Generate Video"
   - Wait 60-90 seconds for generation

## Expected Behavior

- ✅ Authentication should work automatically using service account
- ✅ Vertex AI API calls should succeed
- ✅ Video generation should start (may take 60-90 seconds)
- ✅ Cost tracking will show actual costs

## Troubleshooting

If you see permission errors:
1. Make sure Vertex AI API is enabled: `gcloud services enable aiplatform.googleapis.com --project=greenlitai`
2. Grant Vertex AI User role: `gcloud projects add-iam-policy-binding greenlitai --member="serviceAccount:firebase-adminsdk-fbsvc@greenlitai.iam.gserviceaccount.com" --role="roles/aiplatform.user"`
3. Wait a few minutes for IAM changes to propagate

If VEO 3.1 model returns 404:
- VEO 3.1 might not be available in your region yet
- You may need to request access through Google Cloud Console
- Check: https://console.cloud.google.com/vertex-ai/generative/models?project=greenlitai

## Next Steps

1. Set `GOOGLE_CLOUD_PROJECT_ID` in `.env.local`
2. Restart your dev server
3. Test at `/test-veo3`
4. Once working, enable video generation in storyboard options


































