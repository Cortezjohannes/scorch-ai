# API Prompts Update Guide

## Overview

The current pre-production API generates free-form text that requires fragile parsing. This guide documents how to update prompts to generate structured JSON that matches our TypeScript types.

## File to Modify

`src/app/api/generate/preproduction/route.ts`

## General Principles

1. **Always request JSON only** - No markdown, no code blocks
2. **Specify exact schema** - Show the JSON structure in the prompt
3. **Lower temperature** - Use 0.7 instead of 0.9 for structured output
4. **Validate output** - Use TypeScript types to validate responses

## Prompt Updates by Tab

### 1. Storyboard Generator

**Current**: Generates free-form text descriptions
**New**: Generate strict JSON with shot details

```typescript
// In storyboard generator function
const storyboardPrompt = `Create a detailed storyboard for this scene in STRICT JSON format.

REQUIRED JSON STRUCTURE:
{
  "shots": [
    {
      "number": 1,
      "type": "establishing" | "wide" | "medium" | "close-up" | "extreme-close-up" | "insert",
      "description": "Detailed visual description of the shot",
      "camera": {
        "angle": "eye-level" | "high" | "low" | "dutch" | "birds-eye",
        "movement": "static" | "pan" | "tilt" | "dolly" | "steadicam" | "handheld"
      },
      "composition": "rule-of-thirds" | "centered" | "leading-lines" | "symmetrical",
      "lighting": "natural" | "dramatic" | "soft" | "hard" | "high-key" | "low-key",
      "duration": "2-3s" | "5-10s" | "10-15s" | "15-20s",
      "imagePrompt": "Detailed DALL-E prompt for this shot (cinematic style)"
    }
  ]
}

SCENE CONTEXT:
${sceneDescription}

REQUIREMENTS:
- Return ONLY valid JSON, no markdown formatting or code blocks
- Include 3-7 shots per scene
- Each shot must have all specified properties
- imagePrompt should be detailed and cinematic
- Focus on visual storytelling elements
- Use professional cinematography terminology

RETURN ONLY THE JSON OBJECT ABOVE.`

// Use temperature 0.7 for structured output
const response = await someEngine.generate(storyboardPrompt, { temperature: 0.7 })
```

### 2. Props & Wardrobe Generator

**Current**: Generates text lists
**New**: Generate categorized JSON inventory

```typescript
const propsPrompt = `Create a production inventory in STRICT JSON format.

REQUIRED JSON STRUCTURE:
{
  "props": [
    {
      "name": "Prop name",
      "category": "set-decoration" | "hand-prop" | "vehicle" | "weapon" | "technology" | "furniture" | "consumable",
      "description": "Detailed description of the prop",
      "quantity": 1,
      "importance": "hero" | "supporting" | "background",
      "scenes": [1, 2, 3],
      "imagePrompt": "DALL-E prompt for product photography style",
      "procurement": {
        "source": "purchase" | "rent" | "build" | "existing",
        "estimatedCost": "$50-100",
        "notes": "Special requirements or notes"
      }
    }
  ],
  "wardrobe": [
    {
      "character": "Character Name",
      "outfit": "Outfit description",
      "pieces": ["jacket", "shirt", "pants"],
      "color": "navy blue",
      "style": "casual professional",
      "scenes": [1, 2],
      "imagePrompt": "DALL-E prompt for fashion catalog style",
      "notes": "Fit and styling notes"
    }
  ]
}

EPISODE CONTEXT:
${episodeContext}

REQUIREMENTS:
- Return ONLY valid JSON, no markdown
- Separate props and wardrobe clearly
- Mark hero props (story-critical items)
- Include scene numbers for each item
- Provide realistic cost estimates
- imagePrompts should describe style and composition

RETURN ONLY THE JSON OBJECT ABOVE.`
```

### 3. Locations Generator

**Current**: Generates text descriptions
**New**: Generate location scout JSON

```typescript
const locationsPrompt = `Create a location scouting guide in STRICT JSON format.

REQUIRED JSON STRUCTURE:
{
  "locations": [
    {
      "name": "Location Name",
      "type": "interior" | "exterior" | "interior-exterior",
      "address": "123 Main St (or general area)",
      "description": "Visual and spatial description for scouting",
      "scenes": [1, 2, 3],
      "requirements": {
        "size": "Large open space with 20ft ceilings",
        "features": ["natural light", "parking", "sound isolation"],
        "accessibility": "Wheelchair accessible with elevator"
      },
      "logistics": {
        "permits": "required" | "not-required" | "pending",
        "parkingSpaces": 10,
        "nearestCity": "Los Angeles",
        "estimatedCost": "$500-1000/day"
      },
      "timeOfDay": ["morning", "afternoon", "evening", "night"],
      "weather": "Clear sky preferred, indoor backup available",
      "imagePrompt": "DALL-E prompt for architectural photography style"
    }
  ]
}

EPISODE CONTEXT:
${episodeContext}

REQUIREMENTS:
- Return ONLY valid JSON, no markdown
- Include practical filming logistics
- Specify permit requirements
- List time of day requirements
- Provide cost estimates
- imagePrompts should be architectural/location photography style

RETURN ONLY THE JSON OBJECT ABOVE.`
```

### 4. Script Generator

**Current**: Mixed format
**New**: Structured screenplay elements

```typescript
const scriptPrompt = `Create a professional screenplay in STRICT JSON format.

REQUIRED JSON STRUCTURE:
{
  "scenes": [
    {
      "sceneNumber": 1,
      "heading": "INT. LOCATION - DAY",
      "elements": [
        {
          "type": "scene_heading",
          "content": "INT. COFFEE SHOP - DAY"
        },
        {
          "type": "action",
          "content": "Brief action description in present tense"
        },
        {
          "type": "character",
          "content": "SARAH",
          "character": "SARAH"
        },
        {
          "type": "parenthetical",
          "content": "(quietly)"
        },
        {
          "type": "dialogue",
          "content": "The actual spoken words",
          "character": "SARAH"
        }
      ]
    }
  ]
}

SCENE CONTEXT:
${sceneContext}

REQUIREMENTS:
- Return ONLY valid JSON, no markdown
- Use only these element types: scene_heading, action, character, parenthetical, dialogue, transition
- Character names in ALL CAPS
- Actions in present tense
- Proper screenplay formatting structure
- Keep dialogue natural and concise

RETURN ONLY THE JSON OBJECT ABOVE.`
```

### 5. Casting Generator

**Current**: Text descriptions
**New**: Character breakdown JSON

```typescript
const castingPrompt = `Create character casting breakdowns in STRICT JSON format.

REQUIRED JSON STRUCTURE:
{
  "characters": [
    {
      "name": "Character Name",
      "ageRange": "16-18",
      "gender": "Female",
      "ethnicity": "Asian American",
      "characterArc": "Brief summary of character journey",
      "keyScenes": [1, 3, 5, 7],
      "actorReferences": [
        {
          "name": "Zendaya",
          "imageUrl": null,
          "quality": "Intensity and emotional depth",
          "reason": "Similar age range with dramatic range"
        }
      ],
      "notes": "Additional casting notes",
      "imagePrompt": "Character illustration prompt"
    }
  ],
  "totalCharacters": 5
}

STORY CONTEXT:
${storyContext}

REQUIREMENTS:
- Return ONLY valid JSON, no markdown
- Include 2-3 actor references per character (for vibe only)
- Specify age ranges accurately
- List key scenes for each character
- Include character arc summaries
- Actor references should be diverse and appropriate

RETURN ONLY THE JSON OBJECT ABOVE.`
```

### 6. Narrative Generator

**Current**: Text format
**New**: Structured episodes JSON

```typescript
const narrativePrompt = `Create episode narrative overview in STRICT JSON format.

REQUIRED JSON STRUCTURE:
{
  "episodes": [
    {
      "episodeNumber": 1,
      "episodeTitle": "Episode Title",
      "synopsis": "Episode summary",
      "scenes": [
        {
          "sceneNumber": 1,
          "content": "Scene description",
          "description": "Additional context"
        }
      ],
      "rundown": "Episode rundown",
      "branchingOptions": ["Option 1", "Option 2"],
      "estimatedRuntime": "22-25 minutes"
    }
  ],
  "totalEpisodes": 3,
  "totalScenes": 12,
  "format": "V2"
}

REQUIREMENTS:
- Return ONLY valid JSON, no markdown
- Include scene-by-scene breakdown
- Provide episode summaries
- Estimate runtime
- Include any branching narrative options

RETURN ONLY THE JSON OBJECT ABOVE.`
```

## Implementation Steps

1. **Locate generator functions** in `/src/app/api/generate/preproduction/route.ts`
2. **Update each prompt** to use the JSON schemas above
3. **Lower temperature** to 0.7 for all structured outputs
4. **Add validation** using TypeScript types:

```typescript
import { StoryboardData, PropsData, LocationsData } from '@/types/preproduction'

// After generation
const parsed = JSON.parse(response)

// Validate against types
if (!isValidStoryboardData(parsed)) {
  throw new Error('Invalid storyboard data structure')
}
```

5. **Add error handling** for JSON parsing:

```typescript
try {
  const data = JSON.parse(response)
  return data
} catch (error) {
  console.error('Failed to parse JSON:', error)
  console.error('Raw response:', response)
  // Fallback to text parsing if needed
  return parseFromText(response)
}
```

6. **Test each generator** individually before deploying

## Benefits

- **No fragile text parsing** - Direct JSON structures
- **Type safety** - Validate against TypeScript interfaces
- **Better quality** - AI generates structured data more reliably
- **Easier debugging** - Clear success/failure, no ambiguous parsing
- **Future-proof** - Easy to add new fields to JSON schemas

## Validation Functions

Create validation helpers:

```typescript
// src/lib/validators.ts

export function isValidStoryboardData(data: any): data is StoryboardData {
  return (
    data &&
    Array.isArray(data.episodes) &&
    data.episodes.every((ep: any) =>
      typeof ep.episodeNumber === 'number' &&
      Array.isArray(ep.scenes)
    )
  )
}

export function isValidPropsData(data: any): data is PropsData {
  return (
    data &&
    Array.isArray(data.episodes) &&
    data.episodes.every((ep: any) =>
      Array.isArray(ep.props) &&
      Array.isArray(ep.wardrobe)
    )
  )
}

// Add validators for all types...
```

## Testing

After updating prompts:

1. Generate one tab at a time
2. Verify JSON structure matches types
3. Check that UI displays correctly
4. Ensure no parsing errors
5. Validate all required fields are present

## Notes

- Keep existing text parsing as fallback
- Add logging to see raw responses
- Monitor generation quality
- Adjust prompts based on results
- Temperature 0.7 is optimal for structured output (balance of creativity and structure)

