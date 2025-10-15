# Azure OpenAI Integration Guide

This document provides instructions for setting up and using Azure OpenAI with the Reeled AI application.

## Prerequisites

Before you begin, make sure you have:

1. An Azure account with access to Azure OpenAI Service
2. Created an Azure OpenAI resource in your Azure portal
3. Deployed models in your Azure OpenAI resource

## Setup Steps

### 1. Deploy Required Models in Azure OpenAI

In your Azure OpenAI resource, deploy the following models:

- GPT-4.5 Preview (recommended deployment name: `gpt-45-preview`) - **Primary model**
- GPT-4o (recommended deployment name: `gpt-4o`) - Fallback model
- GPT-4 (recommended deployment name: `gpt-4`) - Secondary fallback model
- GPT-3.5 Turbo (recommended deployment name: `gpt-35-turbo`) - Tertiary fallback model
- DALL-E 3 (recommended deployment name: `dall-e-3`) - Image generation

### 2. Configure Environment Variables

Add the following variables to your `.env.local` file:

```
# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
AZURE_OPENAI_API_VERSION=2023-12-01-preview

# Optional: Separate endpoint for DALL-E if it's in a different Azure resource
AZURE_DALLE_ENDPOINT=https://your-dalle-resource.openai.azure.com

# Azure OpenAI Deployment Names
AZURE_GPT45_PREVIEW_DEPLOYMENT=gpt-45-preview
AZURE_GPT4O_DEPLOYMENT=gpt-4o
AZURE_GPT4_DEPLOYMENT=gpt-4
AZURE_GPT35_TURBO_DEPLOYMENT=gpt-35-turbo
AZURE_DALLE_DEPLOYMENT=dall-e-3
```

Replace the placeholder values with your actual Azure OpenAI credentials and deployment names.

If you're using Azure's DALL-E model in a separate resource or region from your other models, set the `AZURE_DALLE_ENDPOINT` to that specific endpoint. Otherwise, it will fall back to using the main `AZURE_OPENAI_ENDPOINT`.

### 3. Restart Your Application

After configuring the environment variables, restart your development server:

```bash
npm run dev
```

## How It Works

The application now uses Azure OpenAI GPT-4.5 Preview as the primary model for content generation with a cascading fallback mechanism:

1. First tries GPT-4.5 Preview for highest quality results
2. Falls back to GPT-4o if GPT-4.5 Preview fails
3. Falls back to Gemini AI if all Azure OpenAI options fail

The integration is implemented in the following files:

- `src/services/azure-openai.ts` - Azure OpenAI client and helper functions
- `src/app/api/generate/route.ts` - Main API route for content generation
- `src/app/api/generate/preproduction/route.ts` - Preproduction API route

## API Functions

The Azure OpenAI service provides the following main functions:

### `generateContent`

Generates text content using Azure OpenAI's chat completions API.

```typescript
generateContent(
  prompt: string,
  options?: {
    model?: 'gpt-4' | 'gpt-3.5-turbo' | 'gpt-4.5-preview' | 'gpt-4o';
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  }
): Promise<string>
```

### `generateStructuredContent`

Generates structured JSON content using Azure OpenAI with a provided schema.

```typescript
generateStructuredContent<T>(
  prompt: string,
  systemPrompt: string,
  outputSchema: any,
  options?: {
    model?: 'gpt-4' | 'gpt-3.5-turbo' | 'gpt-4.5-preview' | 'gpt-4o';
    temperature?: number;
    maxTokens?: number;
  }
): Promise<T>
```

### `generateImage`

Generates images using DALL-E through Azure OpenAI. Supports a separate endpoint configuration for DALL-E if needed.

```typescript
generateImage(
  prompt: string,
  options?: {
    size?: '1024x1024' | '1792x1024' | '1024x1792';
  }
): Promise<string>
```

## Model Selection Strategy

The application uses different models for different tasks based on their strengths:

- **GPT-4.5 Preview**: Primary model for all content generation, offering the most advanced capabilities
- **GPT-4o**: First fallback for all tasks, offering excellent capabilities with lower latency
- **GPT-3.5 Turbo**: Used for simpler tasks or when quota limits are reached on other models
- **Gemini AI**: Used as the final fallback if Azure OpenAI services are unavailable

## Advantages of GPT-4o as Fallback

GPT-4o offers several advantages as a fallback model:

1. **Multimodal capabilities**: While not fully utilized in this implementation, GPT-4o has multimodal capabilities that could be leveraged in future updates
2. **Lower latency**: GPT-4o typically has lower latency than other advanced models, providing faster results when used as a fallback
3. **Improved reasoning**: GPT-4o includes reasoning improvements that may provide better quality outputs for creative tasks
4. **Cost-efficient**: GPT-4o offers a good balance of capability and cost for most generative tasks

## Troubleshooting

If you encounter issues with Azure OpenAI:

1. **GPT-4.5 Preview Availability**: Ensure your Azure OpenAI resource has access to the GPT-4.5 Preview model
2. **GPT-4o Availability**: Confirm GPT-4o is enabled in your Azure OpenAI resource
3. **Rate Limiting**: Check if you're hitting rate limits in your Azure OpenAI resource
4. **Invalid Credentials**: Verify your API key and endpoint are correct
5. **Deployment Names**: Make sure the deployment names in your environment variables match your actual deployments in Azure
6. **Fallback Mechanism**: The application will automatically use fallback models in a cascading manner

## Next Steps

For production deployments, consider:

1. Adding proper error handling and user feedback for AI service failures
2. Implementing caching to reduce API calls and costs
3. Setting up usage monitoring to track API costs
4. Implementing request throttling to avoid rate limiting

For any additional questions or issues, refer to the [Azure OpenAI documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/) or create an issue in the repository. 