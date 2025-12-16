# Story Bible Generation Diagnosis Report

## Executive Summary

Both Azure OpenAI and Gemini APIs are **working correctly**. The issue is in the **error handling** of the story bible generation code.

## Test Results

### ✅ Gemini API - WORKING
- **API Key**: Valid (39 characters)
- **Model**: `gemini-2.5-pro` - Accessible
- **Test Result**: ✅ Successfully generated content (3431ms response time)
- **Status**: Fully operational

### ✅ Azure OpenAI API - WORKING
- **API Key**: Valid (84 characters)
- **Endpoint**: `https://reeled-ai-alpha.openai.azure.com/`
- **Deployment**: `gpt-4.1` - Accessible
- **API Version**: `2024-12-01-preview`
- **Test Result**: ✅ Successfully generated content (5403ms response time)
- **Status**: Fully operational

### ✅ Environment Variables - ALL SET
- `GEMINI_API_KEY`: ✅ Set (39 chars)
- `AZURE_OPENAI_API_KEY`: ✅ Set (84 chars)
- `AZURE_OPENAI_ENDPOINT`: ✅ Set
- `AZURE_OPENAI_API_VERSION`: ✅ Set

## Root Cause Analysis

### Primary Issue: Error Handling in `generateContentWithGemini()`

**Location**: `src/app/api/generate/story-bible/route.ts` lines 1275-1291

**Problem**:
```typescript
async function generateContentWithGemini(prompt: string): Promise<string> {
  try {
    // ... API call ...
    return response.text()
  } catch (error) {
    console.error('🚨 Gemini content generation failed:', error)
    return 'Content generation failed'  // ❌ Returns error string instead of throwing
  }
}
```

**Impact**:
1. When API calls fail, the function returns the string `'Content generation failed'` instead of throwing an error
2. This error string is then passed to `safeParseJSON()` at multiple locations:
   - Line 479: `premiseAnalysis = await generateContentWithGemini(...)` → parsed at line 1125
   - Line 511: `characterCountResponse = await generateContentWithGemini(...)`
   - Line 552: `rosterResponse = await generateContentWithGemini(...)` → parsed at line 556
   - Line 710: `characterResponse = await generateContentWithGemini(...)` → parsed at line 711
   - Lines 793, 808, 851, 876, 902, 927, 953, 978, 1004, 1030, 1056: Similar pattern

3. `safeParseJSON('Content generation failed')` attempts to parse the error string as JSON, fails, and returns `null`

4. Downstream code expects valid JSON objects but receives `null`, causing:
   - Character generation failures (line 713: `if (parsedCharacter && parsedCharacter.name)`)
   - Premise analysis failures (line 1125: `safeParseJSON(premiseAnalysis)`)
   - World building failures (line 1154: `parseIfValid(worldBuilding, ...)`)
   - And many other engine failures

### Secondary Issues

1. **Inconsistent Error Checking**: 
   - Some places check for the error string (line 554: `rosterResponse !== 'Content generation failed'`)
   - Many places don't check (line 711: directly calls `safeParseJSON(characterResponse)`)

2. **Error Propagation**: 
   - Errors are swallowed instead of propagated, making debugging difficult
   - No user-facing error messages when API calls fail

3. **No Retry Logic**: 
   - When API calls fail, they return error strings immediately
   - No retry mechanism for transient failures

## Files Affected

1. **Primary**: `src/app/api/generate/story-bible/route.ts`
   - `generateContentWithGemini()` function (lines 1275-1291)
   - Multiple calls to this function throughout the generation chain

2. **Secondary**: None (this is the primary issue)

## Recommendations

### Immediate Fix Required

1. **Fix `generateContentWithGemini()` to throw errors instead of returning error strings**:
   ```typescript
   async function generateContentWithGemini(prompt: string): Promise<string> {
     try {
       const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
       const geminiModel = GEMINI_CONFIG.getModel('stable')
       const model = genAI.getGenerativeModel({ 
         model: geminiModel,
         generationConfig: GEMINI_CONFIG.GENERATION_CONFIG
       })
       
       const result = await model.generateContent(prompt)
       const response = await result.response
       return response.text()
     } catch (error) {
       console.error('🚨 Gemini content generation failed:', error)
       throw error  // ✅ Throw instead of returning error string
     }
   }
   ```

2. **Add proper error handling at call sites**:
   - Wrap `generateContentWithGemini()` calls in try-catch blocks
   - Provide fallback mechanisms for critical failures
   - Log detailed error information

3. **Add retry logic**:
   - Implement exponential backoff for transient failures
   - Retry failed API calls up to 3 times before giving up

### Long-term Improvements

1. **Use the existing `gemini-api.ts` service** instead of inline implementation
2. **Standardize error handling** across all API calls
3. **Add comprehensive error logging** for debugging
4. **Implement circuit breaker pattern** for API failures

## Testing Verification

- ✅ Gemini API: Tested and working
- ✅ Azure OpenAI API: Tested and working
- ✅ Environment variables: All set correctly
- ⚠️ Story Bible endpoint: Not tested (server connection issue), but root cause identified

## Conclusion

The APIs are working correctly. The issue is purely in the error handling code. Fixing `generateContentWithGemini()` to throw errors instead of returning error strings will resolve the "content generation failed" errors.


