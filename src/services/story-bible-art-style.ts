/**
 * Story Bible Art Style Service
 * 
 * Handles art style extraction and prompt building for slightly animated
 * image generation in Story Bible sections (Characters, World, Arcs, Overview).
 * 
 * Industry Best Practices:
 * - Slightly animated concept art style (not photorealistic, not sketch)
 * - Professional production design quality
 * - Genre-appropriate visual treatment
 * - Maintains flexibility for casting and location decisions
 */

export type StoryBibleImageType = 'character-portrait' | 'location-concept' | 'arc-keyart' | 'series-hero'

/**
 * Prompt version for tracking which prompt version was used
 */
export const STORY_BIBLE_PROMPT_VERSION = '1.0.0'

export interface StoryBibleImageStyle {
  name: string
  description: string
  renderingStyle: string // e.g., "slightly animated concept art", "stylized illustration"
  colorTreatment: string // e.g., "cinematic color grading", "muted tones", "vibrant"
  lighting: string // e.g., "dramatic lighting", "soft natural light", "atmospheric"
  composition: string // e.g., "cinematic composition", "establishing shot", "portrait framing"
  genreAdaptation?: string // Genre-specific adjustments
  promptVersion?: string // Track which prompt version was used
  negativePrompts?: string[] // Things to avoid in the image
}

/**
 * Generate slightly animated art style based on genre and tone
 */
export function generateStoryBibleStyle(
  genre: string = 'drama',
  tone: string = 'realistic',
  imageType: StoryBibleImageType = 'character-portrait'
): StoryBibleImageStyle {
  const genreLower = (genre || 'drama').toLowerCase()
  const toneLower = (tone || 'realistic').toLowerCase()

  // Base slightly animated style (matching Johannes/Zola aesthetic)
  let baseStyle: StoryBibleImageStyle = {
    name: 'Slightly Animated Concept Art',
    description: 'Professional concept art with slightly animated aesthetic, smooth rendering, stylized character design, animation film quality',
    renderingStyle: 'slightly animated concept art, stylized character design',
    colorTreatment: 'vibrant controlled colors, animation-style palette',
    lighting: 'soft animated lighting with subtle gradients',
    composition: 'cinematic composition',
    promptVersion: STORY_BIBLE_PROMPT_VERSION,
    negativePrompts: []
  }

  // Detect sub-genres for more refined styling
  const isDarkComedy = genreLower.includes('dark comedy') || genreLower.includes('black comedy')
  const isPsychologicalThriller = genreLower.includes('psychological thriller') || genreLower.includes('psychological')
  const isSpaceOpera = genreLower.includes('space opera') || (genreLower.includes('sci-fi') && genreLower.includes('epic'))
  const isUrbanFantasy = genreLower.includes('urban fantasy') || (genreLower.includes('fantasy') && genreLower.includes('modern'))
  
  // Adjust based on genre (with sub-genre detection)
  if (isDarkComedy) {
    baseStyle.colorTreatment = 'muted colors with dark humor undertones'
    baseStyle.lighting = 'dramatic lighting with comedic elements'
    baseStyle.genreAdaptation = 'darkly comedic, satirical aesthetic'
  } else if (genreLower.includes('comedy') || genreLower.includes('comic')) {
    baseStyle.colorTreatment = 'bright, vibrant colors'
    baseStyle.lighting = 'soft natural light'
    baseStyle.genreAdaptation = 'lighthearted, approachable aesthetic'
  } else if (isPsychologicalThriller) {
    baseStyle.colorTreatment = 'desaturated, psychological color palette'
    baseStyle.lighting = 'unsettling, psychological lighting'
    baseStyle.genreAdaptation = 'psychological, mind-bending visual style'
  } else if (genreLower.includes('action') || genreLower.includes('thriller')) {
    baseStyle.colorTreatment = 'high contrast, saturated colors'
    baseStyle.lighting = 'dynamic, dramatic lighting'
    baseStyle.genreAdaptation = 'energetic, high-stakes visual style'
  } else if (genreLower.includes('horror')) {
    baseStyle.colorTreatment = 'muted, desaturated tones with selective color'
    baseStyle.lighting = 'atmospheric, moody lighting with deep shadows'
    baseStyle.genreAdaptation = 'dark, tense visual atmosphere'
  } else if (isSpaceOpera) {
    baseStyle.colorTreatment = 'epic, cosmic color palette with starfield elements'
    baseStyle.lighting = 'grandiose, epic lighting'
    baseStyle.genreAdaptation = 'epic space opera, grandiose aesthetic'
  } else if (genreLower.includes('sci-fi') || genreLower.includes('science fiction') || genreLower.includes('fantasy')) {
    baseStyle.colorTreatment = 'cool tones with technological accents'
    baseStyle.lighting = 'futuristic, sleek lighting'
    baseStyle.genreAdaptation = 'sleek, technological aesthetic'
  } else if (genreLower.includes('romance') || genreLower.includes('romantic')) {
    baseStyle.colorTreatment = 'warm, soft tones'
    baseStyle.lighting = 'soft, romantic lighting'
    baseStyle.genreAdaptation = 'intimate, warm visual style'
  } else {
    // Default: Drama style
    baseStyle.colorTreatment = 'cinematic color grading with natural tones'
    baseStyle.lighting = 'dramatic, cinematic lighting'
    baseStyle.genreAdaptation = 'professional, cinematic aesthetic'
  }

  // Adjust based on tone (with keyword detection)
  if (toneLower.includes('dark') || toneLower.includes('serious') || toneLower.includes('dramatic') || toneLower.includes('gritty')) {
    baseStyle.colorTreatment = 'dark, moody ' + baseStyle.colorTreatment
    baseStyle.lighting = 'heavy shadows, dramatic ' + baseStyle.lighting
  } else if (toneLower.includes('light') || toneLower.includes('comedy') || toneLower.includes('upbeat') || toneLower.includes('whimsical')) {
    baseStyle.colorTreatment = 'bright, vibrant ' + baseStyle.colorTreatment
    baseStyle.lighting = 'soft, natural ' + baseStyle.lighting
  } else if (toneLower.includes('epic') || toneLower.includes('grandiose')) {
    baseStyle.colorTreatment = 'epic, grandiose ' + baseStyle.colorTreatment
    baseStyle.lighting = 'cinematic, epic ' + baseStyle.lighting
  } else if (toneLower.includes('intimate') || toneLower.includes('personal')) {
    baseStyle.colorTreatment = 'intimate, personal ' + baseStyle.colorTreatment
    baseStyle.lighting = 'soft, intimate ' + baseStyle.lighting
  }
  
  // Add negative prompts based on image type
  if (imageType === 'character-portrait') {
    baseStyle.negativePrompts = [
      'no celebrity likeness',
      'no photorealistic faces',
      'no text',
      'no logos',
      'no watermarks',
      'stylized character design',
      'casting-flexible appearance'
    ]
  } else if (imageType === 'location-concept') {
    baseStyle.negativePrompts = [
      'no people',
      'no cars',
      'no modern signs',
      'no text overlays',
      'no logos',
      'no watermarks',
      'concept art style only'
    ]
  } else if (imageType === 'arc-keyart') {
    baseStyle.negativePrompts = [
      'no text',
      'no title cards',
      'no text overlays',
      'artistic rendering only',
      'no logos',
      'no watermarks'
    ]
  } else if (imageType === 'series-hero') {
    baseStyle.negativePrompts = [
      'no text',
      'no title cards',
      'no text overlays',
      'professional key art only',
      'no logos',
      'no watermarks'
    ]
  }

  // Adjust composition based on image type
  if (imageType === 'character-portrait') {
    baseStyle.composition = 'professional character portrait, neutral background, focus on character design'
  } else if (imageType === 'location-concept') {
    baseStyle.composition = 'establishing shot composition, professional environment design, cinematic framing'
  } else if (imageType === 'arc-keyart') {
    baseStyle.composition = 'cinematic poster composition, dynamic layout, professional key art design'
  } else if (imageType === 'series-hero') {
    baseStyle.composition = 'cinematic banner composition, professional series key art, wide format'
  }

  return baseStyle
}

/**
 * Build prompt modifier for slightly animated rendering
 * This ensures all Story Bible images use consistent slightly animated style
 */
export function buildSemiRealisticPromptModifier(
  style: StoryBibleImageStyle,
  imageType: StoryBibleImageType
): string {
  const parts: string[] = []

  // Core style directive - slightly animated aesthetic
  parts.push('slightly animated art style')
  parts.push('animation concept art quality')
  parts.push('stylized but detailed character design')
  parts.push('smooth rendering with subtle animation aesthetic')
  parts.push('not photorealistic')
  parts.push('not sketch or rough draft')
  parts.push('animation film quality')
  parts.push('polished stylized rendering')

  // Add style-specific elements
  parts.push(style.renderingStyle)
  parts.push(style.colorTreatment)
  parts.push(style.lighting)
  parts.push(style.composition)

  // Add genre adaptation if present
  if (style.genreAdaptation) {
    parts.push(style.genreAdaptation)
  }

  // Type-specific additions
  if (imageType === 'character-portrait') {
    parts.push('professional character design')
    parts.push('neutral background')
  } else if (imageType === 'location-concept') {
    parts.push('professional environment design')
    parts.push('establishing shot')
  } else if (imageType === 'arc-keyart') {
    parts.push('cinematic poster design')
    parts.push('key art composition')
  } else if (imageType === 'series-hero') {
    parts.push('series key art')
    parts.push('banner format')
  }

  return parts.join(', ')
}

/**
 * Apply slightly animated style to a prompt
 * Appends the style specification to any existing prompt
 * Includes negative prompts in the final output
 */
export function applyStoryBibleStyleToPrompt(
  originalPrompt: string,
  genre: string = 'drama',
  tone: string = 'realistic',
  imageType: StoryBibleImageType = 'character-portrait'
): string {
  const style = generateStoryBibleStyle(genre, tone, imageType)
  const styleModifier = buildSemiRealisticPromptModifier(style, imageType)
  
  // Clean the prompt to avoid conflicts
  let cleanedPrompt = originalPrompt
    .replace(/,?\s*(photorealistic|photo|hyper-realistic)/gi, '')
    .replace(/,?\s*(sketch|hand-drawn|rough|draft)/gi, '')
    .trim()

  // Build final prompt with positive and negative elements
  let finalPrompt = `${cleanedPrompt}, ${styleModifier}`
  
  // Add negative prompts if available
  if (style.negativePrompts && style.negativePrompts.length > 0) {
    // Note: Some image generation APIs don't support negative prompts directly
    // In that case, we can include them as "avoid" instructions in the prompt
    const negativeInstructions = style.negativePrompts
      .map(np => `avoid ${np}`)
      .join(', ')
    finalPrompt += `. ${negativeInstructions}`
  }

  return finalPrompt
}

/**
 * Extract genre and tone from story bible
 * Enhanced with text analysis for tone detection
 */
export function extractGenreAndTone(storyBible: any): { genre: string; tone: string } {
  const genre = storyBible?.genre || 
                storyBible?.genreEnhancement?.genre || 
                storyBible?.premise?.genre ||
                storyBible?.technical?.genre ||
                'drama'
  
  // Try explicit tone first
  let tone = storyBible?.tone || storyBible?.premise?.tone || storyBible?.technical?.tone
  
  // If no explicit tone, analyze seriesOverview text for tone keywords
  if (!tone && storyBible?.seriesOverview) {
    const overview = storyBible.seriesOverview.toLowerCase()
    
    // Tone keyword detection
    if (overview.match(/\b(gritty|dark|serious|intense|dramatic)\b/)) {
      tone = 'dramatic'
    } else if (overview.match(/\b(whimsical|light|upbeat|cheerful|bright)\b/)) {
      tone = 'light'
    } else if (overview.match(/\b(epic|grandiose|sweeping|vast)\b/)) {
      tone = 'epic'
    } else if (overview.match(/\b(intimate|personal|close|warm)\b/)) {
      tone = 'intimate'
    } else {
      tone = 'realistic'
    }
  }
  
  // Default fallback
  if (!tone) {
    tone = 'realistic'
  }

  return { genre, tone }
}

/**
 * Get default style (used when no story bible context available)
 */
export function getDefaultStoryBibleStyle(imageType: StoryBibleImageType = 'character-portrait'): StoryBibleImageStyle {
  return generateStoryBibleStyle('drama', 'realistic', imageType)
}
