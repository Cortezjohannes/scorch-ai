# Azure OpenAI Integration Guide

This guide explains how to set up and test Azure OpenAI integration for this project.

## Current Status

All services are now working with the East US endpoint:
- **GPT-4o**: ✅ Working correctly with `gpt-4o-reeled` deployment
- **GPT-4**: ✅ Working correctly with `gpt-4-reeled` deployment
- **GPT-3.5 Turbo**: ✅ Working correctly with `gpt-35-turbo-reeled` deployment
- **DALL-E 3**: ✅ Working correctly with `dall-e-3-reeled` deployment
- **GPT-4.5 Preview**: ✅ Can be configured with a separate endpoint and API key

## Working Configuration

| Service | Deployment | API Key | Endpoint | API Version |
|---------|------------|---------|----------|-------------|
| GPT-4o | `gpt-4o-reeled` | `AZURE_OPENAI_API_KEY` | `AZURE_OPENAI_ENDPOINT` | `2025-01-01-preview` |
| GPT-4 | `gpt-4-reeled` | `AZURE_OPENAI_API_KEY` | `AZURE_OPENAI_ENDPOINT` | `2025-01-01-preview` |
| GPT-3.5 Turbo | `gpt-35-turbo-reeled` | `AZURE_OPENAI_API_KEY` | `AZURE_OPENAI_ENDPOINT` | `2025-01-01-preview` |
| DALL-E 3 | `dall-e-3-reeled` | `AZURE_OPENAI_API_KEY` | `AZURE_OPENAI_ENDPOINT` | `2025-01-01-preview` |
| GPT-4.5 Preview | `gpt-4.5-preview-reeled` | `AZURE_GPT45_API_KEY` | `AZURE_GPT45_ENDPOINT` | `2025-01-01-preview` |

## Environment Variables

The following environment variables are required in your `.env.local` file:

```
# Azure OpenAI Configuration (Main services)
AZURE_OPENAI_API_KEY=your_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource-name.cognitiveservices.azure.com/
AZURE_OPENAI_API_VERSION=2025-01-01-preview
AZURE_GPT4O_DEPLOYMENT=gpt-4o-reeled
AZURE_GPT4_DEPLOYMENT=gpt-4-reeled
AZURE_GPT35_TURBO_DEPLOYMENT=gpt-35-turbo-reeled
AZURE_DALLE_DEPLOYMENT=dall-e-3-reeled

# GPT-4.5 Preview (Separate configuration - optional)
AZURE_GPT45_API_KEY=your_gpt45_api_key_here
AZURE_GPT45_ENDPOINT=https://your-gpt45-resource.cognitiveservices.azure.com/
AZURE_GPT45_API_VERSION=2025-01-01-preview
AZURE_GPT45_PREVIEW_DEPLOYMENT=gpt-4.5-preview-reeled
```

## Testing Your Setup

### Test All Deployments

To test all deployments (DALL-E, GPT-4o, GPT-4, GPT-3.5 Turbo, and GPT-4.5):

```bash
source .env.local && node test-azure.js
```

### Test a Specific Deployment

```bash
source .env.local && node test-azure.js gpt-4o-reeled
```

Replace `gpt-4o-reeled` with the name of your deployment.

### Test DALL-E Specifically

```bash
source .env.local && node test-azure.js dall-e-3-reeled
```

### Test GPT-4.5 Preview Specifically

```bash
source .env.local && node test-azure.js gpt-4.5-preview-reeled
```

## Using Azure OpenAI in Your Code

When integrating with Azure OpenAI in your application code, use the following configuration:

### For Standard Models (GPT-4o, GPT-4, GPT-3.5)

```javascript
// Initialize the Azure OpenAI client
const client = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: process.env.AZURE_OPENAI_ENDPOINT,
  defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2025-01-01-preview' },
  defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY }
});

// Use GPT-4o for text generation
const completion = await client.chat.completions.create({
  model: process.env.AZURE_GPT4O_DEPLOYMENT,
  messages: [
    { role: 'system', content: 'You are a helpful AI assistant.' },
    { role: 'user', content: 'Hello, how are you?' }
  ],
  temperature: 0.7,
  max_tokens: 500,
});
```

### For GPT-4.5 Preview (using separate endpoint/key)

```javascript
// Initialize the GPT-4.5 Preview client
const gpt45Client = new OpenAI({
  apiKey: process.env.AZURE_GPT45_API_KEY,
  baseURL: process.env.AZURE_GPT45_ENDPOINT,
  defaultQuery: { 'api-version': process.env.AZURE_GPT45_API_VERSION || '2025-01-01-preview' },
  defaultHeaders: { 'api-key': process.env.AZURE_GPT45_API_KEY }
});

// Use GPT-4.5 Preview for text generation
const completion = await gpt45Client.chat.completions.create({
  model: process.env.AZURE_GPT45_PREVIEW_DEPLOYMENT,
  messages: [
    { role: 'system', content: 'You are a helpful AI assistant.' },
    { role: 'user', content: 'Hello, how are you?' }
  ],
  temperature: 0.7,
  max_tokens: 500,
});
```

### For DALL-E 3 (image generation)

```javascript
// Generate an image with DALL-E 3
const response = await client.images.generate({
  model: process.env.AZURE_DALLE_DEPLOYMENT,
  prompt: 'A cute cat playing with a ball of yarn',
  n: 1,
  size: '1024x1024'
});

// The response will include an image URL
const imageUrl = response.data[0].url;
```

## Troubleshooting

### 404 Resource Not Found

If you get a 404 error, check:
- The deployment name matches exactly what's in the Azure Portal
- You're using the correct endpoint URL
- The API version is set to `2025-01-01-preview`

### 401 Unauthorized

If you get a 401 error, check:
- Your API key is correct
- The API key has access to the resource
- You're using the headers correctly

### 503 Service Unavailable

If you get a 503 error with GPT-4.5 Preview:
- This may indicate that the service is temporarily overloaded or under maintenance
- This is common with new preview models that may have limited capacity
- Wait a few minutes and try again
- Check Azure status page for any outages or maintenance notices

## Additional Resources

- [Azure OpenAI Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [Azure OpenAI API Reference](https://learn.microsoft.com/en-us/azure/ai-services/openai/reference)
- [Azure OpenAI Studio](https://oai.azure.com/) 