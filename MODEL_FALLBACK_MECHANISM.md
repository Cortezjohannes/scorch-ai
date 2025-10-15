# 🔄 Model Fallback Mechanism

## Overview

The Model Fallback Mechanism is a resilience feature that helps ensure content generation succeeds even when the primary AI model encounters issues. This system automatically tries alternative models when the primary model fails, providing a more robust generation experience.

## How It Works

1. **Primary Model Attempt**: The system first attempts to generate content using the primary model (Gemini 2.5 Pro).
2. **Retry Logic**: If the primary model fails, the system retries up to 3 times with exponential backoff.
3. **Fallback Models**: If all primary model attempts fail, the system cascades through fallback models:
   - GPT-4.1
   - GPT-4 (standard)
   - GPT-3.5 Turbo
   - Claude (if configured)
   - Custom models (if specified)
4. **Simplified Prompts**: When using fallback models, the system may use simplified prompts optimized for those models.
5. **Metadata Tracking**: The system tracks which model was used in the metadata, allowing for analysis and quality control.

## Implementation

The model fallback mechanism is implemented in `src/services/model-fallback-utils.ts` and provides two main utilities:

1. **`generateContentWithFallback`**: A direct content generation function with fallback capabilities.
2. **`retryWithModelFallback`**: A more flexible utility that wraps any operation with retry and fallback logic.

### Example Usage

```typescript
// Simple content generation with fallbacks
const content = await generateContentWithFallback(prompt, {
  temperature: 0.4,
  maxTokens: 2000,
  systemPrompt: "You are a professional writer...",
  fallbackOptions: {
    primaryModel: 'gemini',
    useGPT41: true,
    useGPT4: true,
    useGPT35Turbo: true,
    useClaude: false
  }
});

// Complex operation with fallbacks
const result = await retryWithModelFallback(
  async (useFallbackModel, modelType) => {
    console.log(`Using ${modelType} model...`);
    
    if (modelType === 'gemini') {
      // Use Gemini for primary generation
      return await generateWithGemini(prompt, options);
    } else {
      // Use OpenAI models for fallback
      return await generateWithOpenAI(prompt, options, modelType);
    }
  },
  "Operation Name",
  3, // Max retries
  { 
    primaryModel: 'gemini',
    useGPT41: true,
    useGPT4: true,
    useGPT35Turbo: true
  } // Fallback options
);
```

## Current Implementation

The model fallback mechanism is currently implemented for:

1. **Storyboard Generation**: Using Gemini 2.5 Pro as the primary model with OpenAI models (GPT-4.1, GPT-4, GPT-3.5 Turbo) as fallbacks.

## Benefits

1. **Increased Reliability**: Significantly reduces the chance of generation failures.
2. **Graceful Degradation**: Provides a "good enough" result even when optimal models are unavailable.
3. **Cost Optimization**: Can configure fallbacks to use less expensive models when appropriate.
4. **Performance Insights**: Tracking which models succeed or fail provides valuable insights for system optimization.

## Configuration Options

The fallback mechanism can be configured with the following options:

```typescript
interface ModelFallbackOptions {
  // Primary model configuration
  primaryModel?: ModelType;  // Override primary model (default: 'gemini')
  
  // Fallback options when the primary model fails
  useGPT41?: boolean;       // Use GPT-4.1 as fallback (default: true)
  useGPT4?: boolean;        // Use GPT-4 as fallback (default: true)
  useGPT35Turbo?: boolean;  // Use GPT-3.5 Turbo as fallback (default: true)
  useClaude?: boolean;      // Use Claude model as fallback (default: false)
  customFallbacks?: ModelType[]; // Custom model names to try in order
}
```

## Logging and Monitoring

The fallback mechanism includes detailed logging:

- 🚀 Attempts with primary model
- 🔄 Retries and fallback attempts
- ✅ Successful generations
- ⚠️ Warnings for failures
- ❌ Complete failure notifications

These logs can be used to monitor the health of the AI models and optimize the fallback configuration.

## Future Enhancements

1. **Expanded Coverage**: Implement model fallbacks for all engine components (Script, Props, Locations, etc.)
2. **Smart Routing**: Use past performance data to intelligently choose the best model for each task
3. **Quality Metrics**: Track and compare the quality of content from different models
4. **Cost Optimization**: Automatically balance between model quality and cost based on task importance

## Conclusion

The Model Fallback Mechanism significantly improves the robustness of our AI-powered content generation system. By gracefully handling model failures and providing alternative paths to content generation, we ensure a more reliable user experience while maintaining high-quality output.
