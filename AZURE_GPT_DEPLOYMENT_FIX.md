# Azure GPT Deployment Fix - Breakdown, Marketing, Shot List

## Changes Made

### 1. **Script Breakdown Generator** (`script-breakdown-generator.ts`)
- **Changed**: Now uses Azure GPT-4.1 by default (instead of Gemini)
- **Fallback**: Automatically falls back to Gemini if Azure fails
- **Reason**: Azure GPT handles longer responses better, reducing truncation issues

### 2. **Shot List Generator** (`shot-list-generator.ts`)
- **Changed**: Now uses Azure GPT-4.1 by default (instead of Gemini)
- **Fallback**: Automatically falls back to Gemini if Azure fails
- **Reason**: Shot lists can be very long (12k tokens), Azure handles this better

### 3. **Marketing Generator** (`/api/generate/marketing/route.ts`)
- **Changed**: Now uses EngineAIRouter with Azure GPT-4.1 (instead of direct Gemini call)
- **Fallback**: EngineAIRouter automatically falls back to Gemini if Azure fails
- **Reason**: Marketing strategies are comprehensive and long, Azure prevents truncation

### 4. **EngineAIRouter Improvements**
- Fixed circular reference issue with Azure import
- Improved fallback logic to ensure Gemini is used if Azure fails
- Better error logging to diagnose Azure issues

## Why Azure Might Fail in Deployment

### Potential Issues:
1. **API Key Secret**: Azure API key is stored in Cloud Run secret - verify it's accessible
2. **Network Connectivity**: Cloud Run might have network restrictions
3. **Timeout Issues**: Azure requests might be timing out (currently 120s timeout)
4. **Endpoint Configuration**: Verify endpoint URL is correct in deployment

### Verification Steps:

1. **Check Azure API Key Secret**:
   ```bash
   gcloud secrets versions access latest --secret="azure-openai-api-key"
   ```

2. **Test Azure Connection from Cloud Run**:
   ```bash
   gcloud run services logs read reeled-ai-v2 --region=us-central1 --limit=100 | grep -i "azure\|gpt"
   ```

3. **Check Environment Variables**:
   ```bash
   gcloud run services describe reeled-ai-v2 --region=us-central1 --format="value(spec.template.spec.containers[0].env)" | grep AZURE
   ```

## Fallback Behavior

All three generators now:
1. **Try Azure GPT first** (better for long responses)
2. **Automatically fall back to Gemini** if Azure fails
3. **Log errors** for debugging
4. **Continue working** even if Azure is unavailable

## Testing

To test if Azure is working:
1. Generate a breakdown - check logs for "🔵 Trying Azure model"
2. If you see "❌ Azure GPT failed, falling back to Gemini" - Azure isn't working
3. If you see "✅ ENGINE ROUTER: Generated" with provider "azure" - Azure is working

## Next Steps

If Azure continues to fail in deployment:
1. Check Cloud Run logs for specific Azure errors
2. Verify Azure API key secret is accessible
3. Test Azure endpoint connectivity from Cloud Run
4. Consider increasing timeout if requests are slow
5. The system will automatically use Gemini as fallback, so functionality is preserved

















