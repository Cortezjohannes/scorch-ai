# Reeled AI Prototype

A prototype for AI-powered video pre-production and post-production workflows.

## Features

- **Pre-production**: AI-assisted content generation for scripts, storyboards, casting, and visual development
- **Post-production**: Video editing, effects, sound design, and distribution
- **AI Visualization**: Generate visual representations of scenes, characters, and locations using Gemini AI

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm
- Google AI Studio account for Gemini API access
- Unsplash API account (optional, for image search)

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local` (NEVER commit `.env.local`!)
   - Add your API keys to `.env.local`:
     ```
     GEMINI_API_KEY=your_gemini_api_key
     AZURE_OPENAI_API_KEY=your_azure_openai_key
     AZURE_DALLE_API_KEY=your_azure_dalle_key
     ```
   - ⚠️ **SECURITY**: Never commit API keys or secrets to git!
   - See [SECURITY_GUIDE.md](./SECURITY_GUIDE.md) for details

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env.local` file

### Running the Project Locally

```
npm run dev
```

The app will be available at http://localhost:3000 (or the next available port).

## 🔒 Security

**IMPORTANT**: This repository uses **GitHub Secret Scanning** to prevent accidental exposure of API keys.

### ⚠️ Never Commit Secrets

- **Never commit** `.env.local` or any file containing API keys
- **Never hardcode** API keys in source code or deployment files
- **Always use** environment variables (`process.env.VARIABLE_NAME`)
- **For production**, use Google Cloud Secret Manager or GitHub Secrets

### 📚 Security Documentation

- **[SECURITY_GUIDE.md](./SECURITY_GUIDE.md)** - Complete security guide
- **[SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md)** - Pre-deployment checklist
- **[scripts/setup-secrets.sh](./scripts/setup-secrets.sh)** - Script to set up secrets in Google Cloud

### 🛡️ Quick Security Setup

```bash
# Set up secrets in Google Cloud Secret Manager (for production)
./scripts/setup-secrets.sh

# Verify no secrets in tracked files (before committing)
git grep -i "api.*key.*=" -- ':!*.template' ':!SECURITY*' ':!*.example'
```

## Deployment to Google Cloud

This application can be deployed to Google Cloud Platform with a custom subdomain (app.reeledai.com).

### Automatic Deployment

We've provided an automated deployment script:

1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install
2. Log in to Google Cloud: `gcloud auth login`
3. Set environment variables:
   ```bash
   export GEMINI_API_KEY=your_gemini_api_key
   export UNSPLASH_ACCESS_KEY=your_unsplash_access_key
   export UNSPLASH_SECRET_KEY=your_unsplash_secret_key
   ```
4. Run the deployment script:
   ```bash
   ./deploy.sh
   ```
5. Follow the prompts to complete the deployment

### Manual Deployment

For manual deployment:

1. Read through `deploy-instructions.md` for step-by-step instructions
2. Configure your DNS provider to point `app.reeledai.com` to your deployed service
3. Set up environment variables in Google Cloud Secret Manager

### Verifying Deployment

Visit https://app.reeledai.com after DNS propagation is complete (may take 24-48 hours).

## Using AI Image Generation

The application includes AI image generation powered by Google's Gemini API. This allows for:

- Visualizing storyboard scenes
- Creating character portraits
- Generating location concept art
- Designing style guides and mood boards

### Customizing Image Generation

Each image generator component accepts the following parameters:

- **Prompt**: The text description of what to generate
- **Style**: Visual style options (Realistic, Cinematic, Anime, Artistic, Fantasy)
- **Preview Size**: Size of the generated image preview

## Technology Stack

- Next.js 14
- React
- Framer Motion
- Google Generative AI (Gemini)
- Tailwind CSS
- Unsplash API (for image generation)
- Firebase (Firestore, Authentication, Storage)

## Using Firebase for Data Storage

The application uses Firebase for server-side storage and user management:

1. **Firestore**: Stores project data, user preferences, and generated content metadata
2. **Authentication**: Manages user accounts and session handling
3. **Storage**: Stores uploaded videos and generated media files

For setup instructions, see `firebase-setup.md`.

## Build Configuration

When building for production, the app uses special configuration to handle Next.js features:

- **useSearchParams() Hook**: Pages using this hook are automatically configured for client-side rendering
- **Static Optimization**: Most pages are prerendered as static content where possible
- **API Routes**: All API endpoints are server-rendered on demand

To build the application:

```bash
npm run build
```

For deployment builds, the configuration handles warnings related to `useSearchParams()` by setting the `missingSuspenseWithCSRBailout: false` experimental flag in `next.config.js`.

## Azure OpenAI Integration

This project supports both direct OpenAI API and Azure OpenAI integration. Azure OpenAI offers the same capabilities as OpenAI's direct API but with Azure's enterprise features and compliance offerings.

### Configuration

To use Azure OpenAI, set the following environment variables in your `.env.local` file:

```bash
# Azure OpenAI Configuration (Server-side)
AZURE_OPENAI_API_KEY=your_azure_openai_key_here
AZURE_OPENAI_ENDPOINT=https://your-azure-openai-resource.openai.azure.com/
AZURE_OPENAI_API_VERSION=2023-12-01-preview

# Azure OpenAI Deployment Names
AZURE_GPT4_DEPLOYMENT=your-gpt4-deployment-name
AZURE_GPT4_TURBO_DEPLOYMENT=your-gpt4-turbo-deployment-name
AZURE_GPT35_TURBO_DEPLOYMENT=your-gpt35-turbo-deployment-name
AZURE_DALLE_DEPLOYMENT=your-dalle3-deployment-name

# Client-side Azure OpenAI Configuration (if needed)
NEXT_PUBLIC_AZURE_OPENAI_API_KEY=your_azure_openai_key_here
NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT=https://your-azure-openai-resource.openai.azure.com/
NEXT_PUBLIC_AZURE_OPENAI_API_VERSION=2023-12-01-preview
```

### Setting Up Azure OpenAI

1. Create an Azure OpenAI resource in the [Azure Portal](https://portal.azure.com)
2. Deploy the models you need in the Azure OpenAI Studio
3. Copy your API key, endpoint, and deployment names to your environment variables

### Usage

Import and use the Azure OpenAI utilities:

```typescript
// Server-side usage
import { generateContent, generateImage } from '@/services/azure-openai';

// Client-side usage (if needed)
import { createChatCompletion } from '@/lib/azure-openai';
```

### Demo

Check out the Azure OpenAI integration demo at `/openai-demo` to test the functionality.

## 🧪 Testing & Narrative Coherence System

### 🎯 100% Narrative Coherence Achievement

This project features a **comprehensive narrative coherence system** that ensures all generated content (scripts, storyboards, casting, props, marketing, etc.) perfectly follows the user's workspace narrative and choices.

**Key Achievement**: Transformed from 82% to **100% narrative coherence** through systematic testing and targeted fixes.

For complete documentation, see [NARRATIVE_COHERENCE_SYSTEM.md](./NARRATIVE_COHERENCE_SYSTEM.md).

### Running Coherence Tests

```bash
# Run comprehensive narrative coherence tests (17 validation checks)
node comprehensive_narrative_coherence_test.js

# Run complete test suite with server checks
./run_narrative_coherence_tests.sh

# Open UI workflow tests in browser
python3 -m http.server 8080
# Navigate to: http://localhost:8080/ui_workflow_coherence_test.html
```

### What the Tests Validate

- **Story Bible Coherence**: Dynamic adaptation to user choices
- **Episode Generation**: User choice propagation and character consistency  
- **Pre-Production Integration**: All content types reference workspace episodes
- **Cross-Content Validation**: Character names and choices flow through everything
- **Fallback System**: Even error scenarios preserve user narrative context

### Test Results
- **17 comprehensive validation checks**
- **100% success rate achieved**
- **All content types validated**: Script, Storyboard, Casting, Props, Marketing, Post-Production, Locations, Scheduling

For detailed testing documentation, see [NARRATIVE_COHERENCE_TESTING.md](./NARRATIVE_COHERENCE_TESTING.md).
