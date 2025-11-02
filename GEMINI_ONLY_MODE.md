# Gemini-Only Mode

## Overview

This document explains the Gemini-only mode configuration that has been implemented to avoid API errors. By using this mode, the system will exclusively use Google's Gemini 2.5 Pro model without falling back to Azure OpenAI models, and handles system instructions properly to avoid Bad Request errors.

## Why Gemini-Only Mode?

The logs showed Bad Request errors with both Azure OpenAI and Gemini models:

### Azure OpenAI Error
```
status: 400,
statusText: 'Bad Request',
errorDetails: [
  {
    '@type': 'type.googleapis.com/google.rpc.BadRequest',
    fieldViolations: [Array]
  }
]
```

### Gemini Error with System Instructions
```
GoogleGenerativeAIFetchError: [GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent: [400 Bad Request] Invalid value at 'system_instruction'
```

To avoid these errors and ensure consistent performance, the system now:
1. Prioritizes Gemini and avoids fallbacks to Azure OpenAI models
2. Handles system instructions properly with Gemini to avoid Bad Request errors

## Configuration

### Environment Variables

The following environment variables have been added to `.env.local`:

```
# Model Preference Settings
USE_GEMINI_ONLY=true
NEXT_PUBLIC_USE_GEMINI_ONLY=true
PRIMARY_MODEL=gemini
NEXT_PUBLIC_PRIMARY_MODEL=gemini
```

### Code Changes

1. Updated `src/services/model-fallback-utils.ts`:
   - Added `useGeminiOnly` option to `ModelFallbackOptions` interface
   - Modified default fallback options to prioritize Gemini
   - Added checks to prevent fallbacks when `useGeminiOnly` is true

2. Updated `src/services/gemini-api.ts`:
   - Modified how system instructions are handled to avoid Bad Request errors
   - Instead of using the `systemInstruction` parameter, system prompts are sent as regular messages with a "SYSTEM INSTRUCTION:" prefix
   - Added error handling for system instruction failures

## Testing

A testing tool has been created to verify that Gemini-only mode is working correctly:

1. Open `test-gemini-only.html` in your browser
2. Click "Run Gemini-Only Test"
3. The test will make an API call and analyze the response to verify that:
   - Gemini is being used as the primary model
   - No fallbacks to Azure OpenAI models are occurring

## How It Works

### Model Selection Process

1. When a content generation request is made, the system first attempts to use Gemini 2.5 Pro
2. If Gemini fails and `useGeminiOnly` is true, the system will:
   - Log the error
   - Return null or throw an error
   - Not attempt any fallbacks to other models

### Fallback Prevention

The `retryWithModelFallback` function has been modified to check for `useGeminiOnly` before attempting any fallbacks:

```typescript
// Check if we should only use Gemini
if (fallbackOptions.useGeminiOnly) {
  console.error(`❌ ${operationName} - Primary Gemini model failed and useGeminiOnly is set to true`);
  return null;
}
```

## Reverting to Multi-Model Mode

If you need to revert to the previous behavior with model fallbacks:

1. Edit `.env.local` and set:
   ```
   USE_GEMINI_ONLY=false
   NEXT_PUBLIC_USE_GEMINI_ONLY=false
   ```

2. Restart the server:
   ```
   npm run dev
   ```

## Troubleshooting

If you encounter issues with Gemini-only mode:

1. Check that the Gemini API key is valid
2. Verify that the `.env.local` file contains the correct configuration
3. Ensure the server has been restarted after making changes
4. Run the test tool to verify the configuration is working
