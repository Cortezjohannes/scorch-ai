/**
 * Storyboard Art Style Service
 * 
 * Handles art style extraction, generation, and prompt building for consistent
 * storyboard image generation across an entire episode.
 * 
 * Industry Best Practices:
 * - Single unified style guide for all panels
 * - Reference-based generation using genre conventions
 * - Visual coherence through consistent rendering
 * - Professional film industry storyboard standards
 */

export interface StoryboardArtStyle {
  name: string // e.g., "Cinematic Sketch", "Realistic", "Animated"
  description: string // Detailed style description
  colorTreatment: string // e.g., "black and white", "muted colors", "vibrant"
  renderingStyle: string // e.g., "sketch", "photorealistic", "illustrated"
  lineWeight: string // e.g., "bold", "fine", "variable"
  shadingStyle: string // e.g., "crosshatch", "soft gradient", "flat"
  referenceStyle: string // e.g., "film noir", "anime", "documentary"
}

/**
 * Extract or generate art style from story bible
 */
export function extractArtStyleFromStoryBible(storyBible: any): StoryboardArtStyle | null {
  if (!storyBible) return null

  // Try to extract from visualStyle field
  if (storyBible.visualStyle) {
    const visualStyle = storyBible.visualStyle
    if (typeof visualStyle === 'string') {
      // If it's a string, use it as reference style
      return generateStyleFromGenre(storyBible.genre || 'drama', storyBible.tone || 'realistic', visualStyle)
    } else if (typeof visualStyle === 'object') {
      // If it's an object, try to extract style information
      return {
        name: visualStyle.name || 'Custom Style',
        description: visualStyle.description || visualStyle.toString(),
        colorTreatment: visualStyle.colorTreatment || visualStyle.colorPalette || 'natural',
        renderingStyle: visualStyle.renderingStyle || 'sketch',
        lineWeight: visualStyle.lineWeight || 'fine',
        shadingStyle: visualStyle.shadingStyle || 'soft gradient',
        referenceStyle: visualStyle.referenceStyle || visualStyle.toString()
      }
    }
  }

  // Fallback to genre-based generation
  return generateStyleFromGenre(
    storyBible.genre || 'drama',
    storyBible.tone || 'realistic',
    storyBible.visualStyle || null
  )
}

/**
 * Generate art style based on genre and tone
 */
export function generateStyleFromGenre(
  genre: string,
  tone: string = 'realistic',
  visualStyleHint: string | null = null
): StoryboardArtStyle {
  const genreLower = (genre || 'drama').toLowerCase()
  const toneLower = (tone || 'realistic').toLowerCase()

  // Base style from genre
  let baseStyle: StoryboardArtStyle

  if (genreLower.includes('comedy') || genreLower.includes('comic')) {
    baseStyle = {
      name: 'Light Sketch Style',
      description: 'Clean, bright storyboard style with soft colors and clear composition',
      colorTreatment: 'soft colors',
      renderingStyle: 'sketch',
      lineWeight: 'clean',
      shadingStyle: 'soft gradient',
      referenceStyle: 'light animated'
    }
  } else if (genreLower.includes('action') || genreLower.includes('thriller')) {
    baseStyle = {
      name: 'Dynamic Storyboard Style',
      description: 'Bold, high-contrast storyboard with energetic composition',
      colorTreatment: 'high contrast',
      renderingStyle: 'sketch',
      lineWeight: 'bold',
      shadingStyle: 'crosshatch',
      referenceStyle: 'dynamic action'
    }
  } else if (genreLower.includes('horror') || genreLower.includes('thriller')) {
    baseStyle = {
      name: 'Dark Moody Sketch',
      description: 'Atmospheric storyboard with heavy shadows and moody lighting',
      colorTreatment: 'dark moody',
      renderingStyle: 'sketch',
      lineWeight: 'variable',
      shadingStyle: 'heavy shadows',
      referenceStyle: 'film noir'
    }
  } else if (genreLower.includes('sci-fi') || genreLower.includes('science fiction') || genreLower.includes('fantasy')) {
    baseStyle = {
      name: 'Futuristic Sketch Style',
      description: 'Clean, technological aesthetic with precise lines',
      colorTreatment: 'cool tones',
      renderingStyle: 'sketch',
      lineWeight: 'fine',
      shadingStyle: 'soft gradient',
      referenceStyle: 'futuristic'
    }
  } else if (genreLower.includes('romance') || genreLower.includes('romantic')) {
    baseStyle = {
      name: 'Soft Romantic Sketch',
      description: 'Warm, intimate storyboard style with soft tones',
      colorTreatment: 'warm tones',
      renderingStyle: 'sketch',
      lineWeight: 'fine',
      shadingStyle: 'soft gradient',
      referenceStyle: 'romantic'
    }
  } else {
    // Default: Drama style
    baseStyle = {
      name: 'Cinematic Black and White Sketch',
      description: 'Professional film storyboard style with fine lines and dramatic lighting',
      colorTreatment: 'black and white',
      renderingStyle: 'sketch',
      lineWeight: 'fine',
      shadingStyle: 'crosshatch',
      referenceStyle: 'cinematic'
    }
  }

  // Adjust based on tone
  if (toneLower.includes('dark') || toneLower.includes('serious') || toneLower.includes('dramatic')) {
    baseStyle.colorTreatment = 'dark ' + baseStyle.colorTreatment
    baseStyle.shadingStyle = 'heavy shadows'
    baseStyle.referenceStyle = 'dramatic ' + baseStyle.referenceStyle
  } else if (toneLower.includes('light') || toneLower.includes('comedy') || toneLower.includes('upbeat')) {
    baseStyle.colorTreatment = 'bright ' + baseStyle.colorTreatment
    baseStyle.shadingStyle = 'soft gradient'
    baseStyle.referenceStyle = 'light ' + baseStyle.referenceStyle
  }

  // Override with visual style hint if provided
  if (visualStyleHint) {
    const hintLower = visualStyleHint.toLowerCase()
    if (hintLower.includes('noir') || hintLower.includes('dark')) {
      baseStyle.colorTreatment = 'black and white'
      baseStyle.referenceStyle = 'film noir'
    } else if (hintLower.includes('color') || hintLower.includes('vibrant')) {
      baseStyle.colorTreatment = 'vibrant colors'
    } else if (hintLower.includes('muted') || hintLower.includes('subtle')) {
      baseStyle.colorTreatment = 'muted colors'
    }
  }

  return baseStyle
}

/**
 * Build style prompt suffix for image generation
 * This ensures all images use the same art style
 */
export function buildStylePromptSuffix(artStyle: StoryboardArtStyle): string {
  const parts: string[] = []

  // Add rendering style
  parts.push(`${artStyle.renderingStyle} style`)

  // Add color treatment
  if (artStyle.colorTreatment) {
    parts.push(artStyle.colorTreatment)
  }

  // Add line weight
  if (artStyle.lineWeight && artStyle.renderingStyle === 'sketch') {
    parts.push(`${artStyle.lineWeight} line work`)
  }

  // Add shading style
  if (artStyle.shadingStyle) {
    parts.push(artStyle.shadingStyle)
  }

  // Add reference style
  if (artStyle.referenceStyle) {
    parts.push(`${artStyle.referenceStyle} aesthetic`)
  }

  // Add consistency directive
  parts.push('consistent storyboard art style')

  return parts.join(', ')
}

/**
 * Build complete style prompt for image generation
 * Appends the style specification to any existing prompt
 */
export function applyArtStyleToPrompt(
  originalPrompt: string,
  artStyle: StoryboardArtStyle
): string {
  const styleSuffix = buildStylePromptSuffix(artStyle)
  
  // Ensure the prompt ends with the style specification
  // Remove any existing style directives to avoid conflicts
  let cleanedPrompt = originalPrompt
    .replace(/,?\s*consistent storyboard art style/gi, '')
    .replace(/,?\s*professional film storyboard style/gi, '')
    .trim()

  // Append the unified style
  return `${cleanedPrompt}, ${styleSuffix}`
}

/**
 * Get default art style (used when no story bible is available)
 */
export function getDefaultArtStyle(): StoryboardArtStyle {
  return {
    name: 'Professional Film Storyboard',
    description: 'Standard cinematic storyboard style with fine lines and clear composition',
    colorTreatment: 'black and white',
    renderingStyle: 'sketch',
    lineWeight: 'fine',
    shadingStyle: 'crosshatch',
    referenceStyle: 'cinematic'
  }
}

/**
 * Validate art style object
 */
export function validateArtStyle(style: any): style is StoryboardArtStyle {
  return (
    style &&
    typeof style.name === 'string' &&
    typeof style.description === 'string' &&
    typeof style.colorTreatment === 'string' &&
    typeof style.renderingStyle === 'string' &&
    typeof style.lineWeight === 'string' &&
    typeof style.shadingStyle === 'string' &&
    typeof style.referenceStyle === 'string'
  )
}








































