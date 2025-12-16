# Cloud Run Image Generation "Service Unavailable" Error - Diagnosis

## Issue
The deployed app shows "Failed to generate image: Service Unavailable" when generating storyboard images.

## Cloud Run Configuration ✅
- **Timeout**: 1800 seconds (30 minutes) - Sufficient
- **CPU**: 2 cores
- **Memory**: 2Gi - Sufficient
- **Service**: `reeled-ai-v2` in `us-central1`

## Logs Analysis

### Recent Activity
- Nano Banana Pro is successfully loading reference images (10/10)
- Image generation requests are being processed
- No obvious errors in recent logs

### Potential Causes

1. **Client-Side Timeout**
   - The browser/client may be timing out before Cloud Run responds
   - Image generation with 10 reference images can take 30-60+ seconds
   - Default fetch timeout might be too short

2. **Gemini API 503 Errors**
   - Gemini API may be returning 503 (Service Unavailable) intermittently
   - Could be rate limiting or temporary service issues
   - Not visible in Cloud Run logs if error happens before logging

3. **Network Timeout**
   - Connection between Cloud Run and Gemini API may timeout
   - Large payloads (10 reference images) may cause timeouts

4. **Error Handling**
   - The error message "Service Unavailable" suggests a 503 status code
   - May be coming from Gemini API or network layer

## Recommended Fixes

### 1. Add Timeout Configuration
Increase client-side timeout for image generation requests:

```typescript
// In StoryboardsTab.tsx or image generation service
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes

fetch('/api/generate-image', {
  signal: controller.signal,
  // ... other options
})
```

### 2. Add Better Error Logging
Log the actual error from Gemini API:

```typescript
catch (error: any) {
  console.error('Image generation error details:', {
    status: error.status,
    statusText: error.statusText,
    message: error.message,
    response: error.response
  });
}
```

### 3. Add Retry Logic
Implement retry with exponential backoff for 503 errors:

```typescript
async function generateImageWithRetry(prompt, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generateImageWithGemini(prompt, options);
    } catch (error) {
      if (error.status === 503 && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      }
      throw error;
    }
  }
}
```

### 4. Check Gemini API Status
- Visit: https://status.cloud.google.com/
- Check Gemini API service status
- Verify quota/rate limits: https://ai.dev/usage?tab=rate-limit

## Next Steps

1. **Check recent error logs** with more detail:
   ```bash
   gcloud run services logs read reeled-ai-v2 \
     --region=us-central1 \
     --limit=500 \
     --format="value(timestamp,severity,textPayload)" \
     | grep -i "error\|failed\|503\|timeout" \
     | tail -50
   ```

2. **Test image generation directly**:
   ```bash
   curl -X POST https://reeled-ai-v2-7qcdkzzv6q-uc.a.run.app/api/generate-image \
     -H "Content-Type: application/json" \
     -d '{"prompt": "test image"}'
   ```

3. **Monitor in real-time**:
   ```bash
   gcloud run services logs tail reeled-ai-v2 --region=us-central1
   ```

4. **Check Gemini API quota**: The issue might be quota-related even if not showing 429 errors










