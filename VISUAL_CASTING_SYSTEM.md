# 🎭 AI Visual Casting System

## Overview

A comprehensive AI-powered visual generation system for casting characters, integrating **DALL-E 3**, **Gemini VEO 3**, and **Imagen 3** to create professional character headshots, performance videos, and casting visuals.

## 🎨 System Architecture

### Core Services

```
📦 Visual Casting System
├── 🎨 DALL-E 3 Image Generator (Primary)
├── 🎬 Gemini VEO 3 Video Generator (Limited Credits)
├── 🖼️ Imagen 3 Backup Generator (Fallback)
└── 🎭 Visual Casting Orchestrator (Main Controller)
```

### Service Configurations

#### DALL-E 3 (Primary Image Generation)
- **Service**: Azure OpenAI DALL-E 3
- **Endpoint**: `https://johan-m9b2v62z-eastus.cognitiveservices.azure.com/`
- **Model**: `dall-e-3`
- **Capabilities**: 
  - High-quality character headshots
  - Professional casting photos
  - Multiple styles (headshot, full-body, character study)
  - Multiple moods (professional, dramatic, natural, candid)
- **Rate Limits**: Standard Azure limits
- **Image Sizes**: 1024x1024, 1792x1024, 1024x1792

#### Gemini VEO 3 (Video Generation)
- **Service**: Google Gemini VEO 3
- **Model**: `gemini-exp-1206`
- **Capabilities**:
  - Character performance videos (5-60 seconds)
  - Multiple styles (realistic, cinematic, documentary, artistic)
  - Professional acting demonstrations
  - Character interaction samples
- **Credit System**: **3 videos per episode maximum**
- **Aspect Ratios**: 16:9, 9:16, 1:1
- **Quality**: Standard and High

#### Imagen 3 (Backup Image Generation)
- **Service**: Google Imagen 3
- **Model**: `imagen-3.0-generate-001`
- **Capabilities**:
  - Backup image generation when DALL-E 3 fails
  - Character visualization
  - Safety filtering
  - Multiple aspect ratios
- **Usage**: Automatic fallback only

## 🚀 Integration with Casting System

### Enhanced Casting Function

The main casting function now supports visual generation:

```typescript
export async function generateV2Casting(
  context: any, 
  narrative: any, 
  updateProgress: Function,
  options: { 
    generateVisuals?: boolean; 
    imageCount?: number; 
    includeVideo?: boolean 
  } = {}
)
```

### Usage Examples

```typescript
// Basic casting with visuals
const result = await generateV2Casting(context, narrative, updateProgress, {
  generateVisuals: true,
  imageCount: 3,
  includeVideo: true
});

// Access visual results
const visualResults = result.visualResults;
console.log(`Generated ${visualResults.totalImages} images and ${visualResults.totalVideos} videos`);
```

### Response Structure

```typescript
{
  characters: Array<Character>,
  visualResults: {
    characters: Array<VisualResult>,
    totalImages: number,
    totalVideos: number,
    successfulGenerations: number,
    videoCreditsUsed: number,
    generatedAt: string
  }
}
```

## 🎬 Visual Generation Features

### Image Generation
- **Primary Service**: DALL-E 3 for highest quality
- **Backup Service**: Imagen 3 for reliability
- **Image Types**:
  - Professional headshots
  - Character studies
  - Full-body portraits
  - Action shots
- **Mood Options**: Professional, dramatic, natural, candid
- **Automatic Prompt Optimization**: Based on character descriptions

### Video Generation
- **Service**: Gemini VEO 3
- **Credit Management**: 3 videos per episode
- **Video Types**:
  - Character introduction videos
  - Performance samples
  - Acting demonstrations
  - Character interaction scenes
- **Styles**: Realistic, cinematic, documentary
- **Duration**: 5-60 seconds (default 30s)

### Character Analysis
Automatically extracts from casting descriptions:
- **Physical Traits**: Height, build, hair color, distinctive features
- **Age Range**: Automatically parsed from descriptions
- **Ethnicity**: Cultural context awareness
- **Performance Notes**: Acting methodology recommendations

## 💳 Credit Management System

### VEO 3 Video Credits
- **Limit**: 3 videos per episode
- **Tracking**: Per-episode credit consumption
- **Automatic**: Credits consumed on successful generation
- **Monitoring**: Real-time credit availability checking

### Credit Tracking

```typescript
// Check remaining credits
const credits = visualCastingGenerator.getVideoCreditsStatus('episode-1');
console.log(`Remaining: ${credits.remaining}/${credits.maxPerEpisode}`);

// Credits are automatically consumed during generation
const result = await veo3VideoGenerator.generateCharacterVideo(request, episodeId);
```

## 🔧 Configuration

### Environment Variables

```bash
# Required for VEO 3 and Imagen 3
GEMINI_API_KEY=your_gemini_api_key

# DALL-E 3 configuration is hardcoded (as requested)
# No additional environment variables needed
```

### Service Activation

```typescript
// In casting generation
const castingResult = await generateV2Casting(context, narrative, updateProgress, {
  generateVisuals: true,      // Enable visual generation
  imageCount: 3,              // Number of images per character
  includeVideo: true          // Enable video generation (uses credits)
});
```

## 🎭 Usage Workflows

### 1. Standard Casting with Images

```typescript
const result = await generateV2Casting(context, narrative, updateProgress, {
  generateVisuals: true,
  imageCount: 2,
  includeVideo: false  // Save video credits
});
```

### 2. Premium Casting with Videos

```typescript
const result = await generateV2Casting(context, narrative, updateProgress, {
  generateVisuals: true,
  imageCount: 3,
  includeVideo: true   // Uses 1 credit per character (max 3 per episode)
});
```

### 3. Batch Character Generation

```typescript
const batchResults = await visualCastingGenerator.generateBatchVisuals({
  characters: characterRequests,
  episodeId: 'episode-1',
  options: {
    maxConcurrent: 2,
    prioritizeVideos: false,
    fallbackToBackup: true
  }
});
```

## 📊 Testing & Demonstration

### Demo Script

Run the comprehensive demo:

```bash
./run-visual-casting-demo.sh
```

### Test Features
- Service availability checking
- Individual character generation
- Batch character processing
- Credit management testing
- Error handling and fallbacks

## 🛡️ Safety & Reliability

### Fallback Systems
1. **Primary**: DALL-E 3 for images
2. **Backup**: Imagen 3 if DALL-E 3 fails
3. **Credit Management**: Prevents VEO 3 overuse
4. **Error Handling**: Graceful degradation

### Content Safety
- **DALL-E 3**: Built-in content filters
- **Imagen 3**: Configurable safety levels
- **VEO 3**: Professional content focus
- **Prompt Optimization**: Professional casting language

## 🚀 Production Deployment

### Requirements
1. **GEMINI_API_KEY** environment variable
2. **Internet connectivity** for API calls
3. **Sufficient API quotas** for your usage

### Activation
```typescript
// Enable in your casting calls
const options = {
  generateVisuals: true,
  imageCount: 2,
  includeVideo: true
};
```

### Monitoring
- Track video credit usage per episode
- Monitor generation success rates
- Handle API failures gracefully

## 📈 Performance Metrics

### Expected Performance
- **Image Generation**: 3-10 seconds per image
- **Video Generation**: 30-120 seconds per video
- **Batch Processing**: Concurrent generation with rate limiting
- **Credit Usage**: Tracked and limited automatically

### Cost Optimization
- **Batch Processing**: Efficient API usage
- **Fallback Systems**: Reduce failure costs
- **Credit Limits**: Prevent overuse
- **Quality Prioritization**: Best results first

## 🔮 Future Enhancements

### Planned Features
1. **Actor Database Integration**: Match generated visuals with real actors
2. **Style Customization**: Project-specific visual styles
3. **Performance Analytics**: Track casting effectiveness
4. **Enhanced Prompting**: Industry-specific character types
5. **Real-time Generation**: Live casting assistance

### Integration Opportunities
- **Casting Database**: Store and manage generated visuals
- **Project Management**: Link visuals to production timelines
- **AI Recommendations**: Match visuals with actor profiles
- **Workflow Automation**: Streamline casting decisions

---

## 🎬 Ready for Hollywood-Grade Visual Casting!

Your casting system now generates professional character visuals with:
- ✅ **High-quality images** via DALL-E 3
- ✅ **Character performance videos** via VEO 3
- ✅ **Reliable backup systems** via Imagen 3
- ✅ **Smart credit management** and cost control
- ✅ **Professional prompt optimization**
- ✅ **Seamless integration** with existing casting workflow

Transform your casting process with AI-powered visual generation! 🎭✨

