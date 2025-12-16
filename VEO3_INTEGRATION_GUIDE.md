# VEO 3.1 Integration Guide

Complete guide for integrating Google VEO 3.1 video generation into your application, including the video player component.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Setup & Configuration](#setup--configuration)
4. [Service Usage](#service-usage)
5. [API Routes](#api-routes)
6. [Video Player Integration](#video-player-integration)
7. [Cost Management](#cost-management)
8. [Limitations & Best Practices](#limitations--best-practices)
9. [Code Examples](#code-examples)
10. [Troubleshooting](#troubleshooting)

---

## Overview

VEO 3.1 is Google's advanced video generation model that creates high-quality videos from text prompts. This integration provides:

- ✅ **Fast Mode** (`veo-3.1-fast-generate-preview`): Lower cost, faster generation
- ✅ **Quality Mode** (`veo-3.1-generate-preview`): Higher quality, more control
- ✅ **Credit Management**: 3 videos per episode limit
- ✅ **Cost Tracking**: Automatic cost calculation and estimation
- ✅ **Video Proxy**: Secure video delivery with authentication

### Key Features

- **Duration**: 4, 6, or 8 seconds per video
- **Aspect Ratios**: 16:9 (horizontal), 9:16 (vertical), 1:1 (square)
- **Resolutions**: 720p (default, cost-saving) or 1080p
- **Audio**: Always generated (cannot be disabled via API)
- **Credit System**: 3 videos per episode maximum

---

## Prerequisites

### Required

1. **Google Gemini API Key** with VEO 3.1 access
   - Requires Google Cloud project with billing enabled
   - Access may require Ultra/Pro subscription tier
   - Get your key from [Google AI Studio](https://aistudio.google.com/)

2. **Node.js Dependencies**
   ```bash
   npm install @google/generative-ai @google/genai
   ```

3. **Next.js Environment** (for API routes and proxy)

### Optional

- Firebase Storage (for video hosting, if needed)
- Service account credentials (if using Vertex AI)

---

## Setup & Configuration

### 1. Environment Variables

Add to your `.env` file:

```bash
# Required: Gemini API Key with VEO 3.1 access
GEMINI_API_KEY=your-api-key-here

# Optional: VEO 3.1 Configuration
VEO3_ENABLED=true
VEO3_MAX_VIDEOS_PER_SCENE=2
VEO3_DEFAULT_DURATION=8
```

### 2. Service Initialization

The `VEO3VideoGenerator` service is a singleton that handles all video generation:

```typescript
import { veo3VideoGenerator } from '@/services/veo3-video-generator'

// Service is already initialized and ready to use
```

---

## Service Usage

### Basic Video Generation

#### For Storyboard Videos

```typescript
import { veo3VideoGenerator } from '@/services/veo3-video-generator'

const result = await veo3VideoGenerator.generateStoryboardVideo(
  shotDescription,    // "A wide shot of a coffee shop interior"
  sceneContext,        // "Opening scene of character entering"
  episodeId,           // "episode-123"
  {
    duration: 8,        // 4, 6, or 8 seconds
    aspectRatio: '16:9', // '16:9' | '9:16' | '1:1'
    style: 'cinematic',  // 'realistic' | 'cinematic' | 'documentary'
    quality: 'standard', // 'standard' (fast) | 'high' (quality)
    hasAudio: false     // Optional: only applies to quality mode
  }
)

if (result.success) {
  console.log('Video URL:', result.videoUrl)
  console.log('Cost:', result.metadata?.cost?.amount)
} else {
  console.error('Error:', result.error)
}
```

#### For Character Performance Videos

```typescript
const result = await veo3VideoGenerator.generateCharacterVideo(
  {
    characterName: 'John Doe',
    characterDescription: 'A 30-year-old detective',
    sceneDescription: 'Interrogation room',
    performanceNotes: 'Suspicious, looking around nervously',
    videoStyle: 'cinematic',
    duration: 6,
    aspectRatio: '16:9',
    quality: 'high',
    hasAudio: false
  },
  episodeId
)
```

### Response Format

```typescript
interface VEO3VideoResponse {
  videoUrl: string              // Proxy URL: /api/veo3-video-proxy?uri=...
  thumbnailUrl?: string
  success: boolean
  error?: string
  metadata?: {
    duration: number
    aspectRatio: string
    quality: string
    generationTime: number      // Milliseconds
    creditsUsed: number
    cost?: {
      amount: number            // USD
      currency: string
      mode: 'standard' | 'fast'
      hasAudio: boolean
    }
  }
}
```

### Cost Estimation

```typescript
// Get cost estimate before generating
const estimate = veo3VideoGenerator.getCostEstimate(
  8,        // duration in seconds
  false,    // hasAudio
  true      // useFastMode
)

console.log(`Estimated cost: $${estimate.amount}`)
// Output: Estimated cost: $0.80 (fast mode, 8s, no audio)
```

### Credit Management

The service automatically manages credits (3 per episode):

```typescript
// Check credits before generating
const credits = veo3VideoGenerator.getCreditsForEpisode(episodeId)
console.log(`Credits remaining: ${credits.remaining}/${credits.max}`)

// Credits are automatically consumed on successful generation
// If credits are exhausted, generation will fail with an error
```

---

## API Routes

### 1. Video Generation Endpoint

**Route:** `POST /api/test-veo3`

**Request Body:**
```typescript
{
  shotDescription: string
  sceneContext: string
  episodeId?: string
  options: {
    duration: 4 | 6 | 8
    aspectRatio: '16:9' | '9:16' | '1:1'
    style?: 'realistic' | 'cinematic' | 'documentary'
    quality: 'standard' | 'high'
    hasAudio?: boolean  // Only for quality mode
  }
}
```

**Response:**
```typescript
{
  success: boolean
  videoUrl: string
  error?: string
  metadata?: {
    duration: number
    aspectRatio: string
    quality: string
    generationTime: number
    creditsUsed: number
    cost?: {
      amount: number
      currency: string
      mode: 'standard' | 'fast'
      hasAudio: boolean
    }
  }
}
```

**Example Usage:**
```typescript
const response = await fetch('/api/test-veo3', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    shotDescription: 'A wide shot of a coffee shop',
    sceneContext: 'Opening scene',
    episodeId: 'episode-123',
    options: {
      duration: 8,
      aspectRatio: '16:9',
      quality: 'standard',
      hasAudio: false
    }
  })
})

const result = await response.json()
```

### 2. Video Proxy Endpoint

**Route:** `GET /api/veo3-video-proxy?uri=<encoded-video-uri>`

**Purpose:** Securely proxy videos from Gemini API (requires authentication)

**Usage:** The service automatically converts Gemini video URIs to proxy URLs. Use the returned `videoUrl` directly in your video player.

**Example:**
```
GET /api/veo3-video-proxy?uri=https%3A%2F%2Fgenerativelanguage.googleapis.com%2Fv1beta%2Ffiles%2Fabc123%3Adownload%3Falt%3Dmedia
```

---

## Video Player Integration

### Basic HTML5 Video Player

```tsx
'use client'

import { useState } from 'react'

interface VideoPlayerProps {
  videoUrl: string
  aspectRatio?: '16:9' | '9:16' | '1:1'
  className?: string
}

export function VideoPlayer({ videoUrl, aspectRatio = '16:9', className }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Calculate aspect ratio padding
  const aspectRatioClass = {
    '16:9': 'aspect-video',      // 16:9
    '9:16': 'aspect-[9/16]',     // 9:16 (vertical)
    '1:1': 'aspect-square'       // 1:1 (square)
  }[aspectRatio]

  return (
    <div className={`relative ${aspectRatioClass} ${className || ''}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-white">Loading video...</div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900">
          <div className="text-white">Error: {error}</div>
        </div>
      )}

      <video
        src={videoUrl}
        controls
        autoPlay
        loop
        muted
        playsInline
        crossOrigin="anonymous"
        className="w-full h-full object-cover"
        onLoadedData={() => setIsLoading(false)}
        onError={(e) => {
          setError('Failed to load video')
          setIsLoading(false)
        }}
      />
    </div>
  )
}
```

### Advanced Video Player with Controls

```tsx
'use client'

import { useState, useRef } from 'react'

export function AdvancedVideoPlayer({ videoUrl, aspectRatio = '16:9' }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
      setDuration(videoRef.current.duration)
    }
  }

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration)
          }
        }}
        crossOrigin="anonymous"
      />
      
      {/* Custom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="text-white hover:text-gray-300"
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          
          <div className="flex-1 bg-gray-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-white h-full transition-all"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          
          <span className="text-white text-sm">
            {Math.floor(currentTime)}s / {Math.floor(duration)}s
          </span>
        </div>
      </div>
    </div>
  )
}
```

### Using the Video Player

```tsx
'use client'

import { VideoPlayer } from '@/components/VideoPlayer'

export default function MyComponent() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  const handleGenerate = async () => {
    const response = await fetch('/api/test-veo3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shotDescription: 'A coffee shop interior',
        sceneContext: 'Opening scene',
        options: {
          duration: 8,
          aspectRatio: '16:9',
          quality: 'standard'
        }
      })
    })

    const result = await response.json()
    if (result.success) {
      setVideoUrl(result.videoUrl)
    }
  }

  return (
    <div>
      <button onClick={handleGenerate}>Generate Video</button>
      
      {videoUrl && (
        <VideoPlayer
          videoUrl={videoUrl}
          aspectRatio="16:9"
          className="mt-4"
        />
      )}
    </div>
  )
}
```

---

## Cost Management

### Pricing (as of 2024)

| Mode | Audio | Cost per Second | 8s Video |
|------|-------|----------------|----------|
| **Fast** | Yes* | $0.15 | $1.20 |
| **Fast** | No* | $0.10 | $0.80 |
| **Quality** | Yes | $0.40 | $3.20 |
| **Quality** | No | $0.20 | $1.60 |

*Note: Fast Mode always generates audio (cannot be disabled), but pricing varies based on request.

### Cost Calculation

```typescript
// Automatic cost calculation
const result = await veo3VideoGenerator.generateStoryboardVideo(...)
const cost = result.metadata?.cost

console.log(`Cost: $${cost?.amount} (${cost?.mode} mode, ${cost?.hasAudio ? 'with' : 'without'} audio)`)

// Manual cost estimation
const estimate = veo3VideoGenerator.getCostEstimate(8, false, true)
console.log(`Estimated: $${estimate.amount}`)
```

### Cost Optimization Tips

1. **Use Fast Mode** when quality is acceptable ($0.10-0.15/sec vs $0.20-0.40/sec)
2. **Use 720p resolution** (default) instead of 1080p to save tokens
3. **Disable audio** in Quality Mode when not needed (saves 50% cost)
4. **Use shorter durations** (4-6s) when possible
5. **Limit videos per episode** (credit system enforces 3 max)

---

## Limitations & Best Practices

### API Limitations

1. **Duration**: Only 4, 6, or 8 seconds per video
   - For longer videos, generate multiple clips and chain them

2. **Audio**: Always generated (cannot be disabled via API)
   - Use `negativePrompt` to discourage audio, but it's not guaranteed
   - Consider post-processing to remove audio if needed

3. **Aspect Ratios**: 16:9, 9:16, or 1:1
   - Both Fast and Quality modes support all aspect ratios

4. **Resolution**: 720p (default) or 1080p
   - 720p is recommended to save costs

5. **Credits**: 3 videos per episode maximum
   - Managed automatically by the service

### Best Practices

1. **Prompt Engineering**
   - Be specific and descriptive
   - Include scene context for storyboard videos
   - Use explicit instructions for duration, aspect ratio, and style

2. **Error Handling**
   ```typescript
   try {
     const result = await veo3VideoGenerator.generateStoryboardVideo(...)
     if (!result.success) {
       console.error('Generation failed:', result.error)
       // Handle error (show user message, retry, etc.)
     }
   } catch (error) {
     console.error('Unexpected error:', error)
   }
   ```

3. **Loading States**
   - Video generation takes 30-60 seconds
   - Show loading indicators and progress
   - Consider polling for status updates

4. **Video Caching**
   - Videos are cached via proxy endpoint (1 hour)
   - Consider storing video URLs in your database
   - Reuse videos when possible

5. **Credit Management**
   - Check credits before generating
   - Inform users when credits are low
   - Consider resetting credits periodically

---

## Code Examples

### Complete Integration Example

```typescript
'use client'

import { useState } from 'react'
import { VideoPlayer } from '@/components/VideoPlayer'

export default function VideoGenerationPage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cost, setCost] = useState<number | null>(null)

  const generateVideo = async () => {
    setIsGenerating(true)
    setError(null)
    setVideoUrl(null)

    try {
      const response = await fetch('/api/test-veo3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shotDescription: 'A wide shot of a coffee shop interior, morning light streaming through windows',
          sceneContext: 'Opening scene of a character entering a coffee shop',
          episodeId: 'episode-123',
          options: {
            duration: 8,
            aspectRatio: '16:9',
            style: 'cinematic',
            quality: 'standard',
            hasAudio: false
          }
        })
      })

      const result = await response.json()

      if (result.success) {
        setVideoUrl(result.videoUrl)
        setCost(result.metadata?.cost?.amount || null)
      } else {
        setError(result.error || 'Failed to generate video')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Video Generation</h1>
      
      <button
        onClick={generateVideo}
        disabled={isGenerating}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {isGenerating ? 'Generating...' : 'Generate Video'}
      </button>

      {cost && (
        <p className="mt-2 text-sm text-gray-600">Cost: ${cost.toFixed(2)}</p>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {videoUrl && (
        <div className="mt-8">
          <VideoPlayer videoUrl={videoUrl} aspectRatio="16:9" />
        </div>
      )}
    </div>
  )
}
```

### Storyboard Integration Example

```typescript
import { veo3VideoGenerator } from '@/services/veo3-video-generator'

async function generateStoryboardWithVideos(
  storyboard: StoryboardFrame[],
  episodeId: string
) {
  const enhancedStoryboard = []

  for (const frame of storyboard) {
    // Generate video for key shots only
    if (frame.isKeyShot) {
      const videoResult = await veo3VideoGenerator.generateStoryboardVideo(
        frame.description,
        frame.sceneContext,
        episodeId,
        {
          duration: 8,
          aspectRatio: '16:9',
          quality: 'standard',
          hasAudio: false
        }
      )

      if (videoResult.success) {
        frame.referenceVideos = [videoResult.videoUrl]
      }
    }

    enhancedStoryboard.push(frame)
  }

  return enhancedStoryboard
}
```

---

## Troubleshooting

### Common Issues

#### 1. "GEMINI_API_KEY is not configured"
- **Solution**: Add `GEMINI_API_KEY` to your `.env` file
- **Verify**: Check that the key has VEO 3.1 access

#### 2. "Invalid duration: X. Must be 4, 6, or 8 seconds"
- **Solution**: Only use durations of 4, 6, or 8 seconds
- **Note**: VEO 3.1 doesn't support other durations

#### 3. "Credits exhausted for episode"
- **Solution**: Wait for credit reset or use a different episode ID
- **Note**: Credits reset daily or can be manually reset

#### 4. Video player shows "Failed to load video"
- **Solution**: Check that the proxy endpoint is working
- **Verify**: Ensure `GEMINI_API_KEY` is set on the server

#### 5. "Operation timeout"
- **Solution**: Video generation can take 30-60 seconds
- **Note**: The service polls for up to 60 attempts (5 minutes)

#### 6. Video has audio when it shouldn't
- **Note**: VEO 3.1 always generates audio (cannot be disabled)
- **Workaround**: Use post-processing to remove audio if needed

### Debug Logging

Enable detailed logging:

```typescript
// The service logs detailed information:
// - Request parameters
// - API calls
// - Operation status
// - Cost calculations
// - Video metadata

// Check server console for:
// 🎬 Video generation started
// ✅ Operation completed
// 💰 Cost calculation
// ⚠️ Warnings and errors
```

---

## Additional Resources

- [Google VEO 3.1 Documentation](https://ai.google.dev/gemini-api/docs/video)
- [Gemini API Reference](https://ai.google.dev/api)
- [VEO 3.1 API Limitations](./VEO3_API_LIMITATIONS.md)
- [Cost Tracking Guide](./GCP_PROJECTS_FOR_BILLING.md)

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs for detailed error messages
3. Verify API key has VEO 3.1 access
4. Check Google Cloud billing and quotas

---

**Last Updated**: 2024
**Version**: 1.0.0
























