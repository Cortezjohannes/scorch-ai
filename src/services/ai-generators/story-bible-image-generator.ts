/**
 * Story Bible Image Generator Service
 * 
 * Generates semi-realistic concept art images for Story Bible sections:
 * - Hero image (series overview) - NANO BANANA PRO (generated LAST with character references)
 * - Character portraits - NANO BANANA (generated first)
 * - Location concept art - NANO BANANA (generated second)
 * 
 * NOTE: Arc key art generation is DISABLED (not shown in UI, saves tokens)
 */

import { generateImageWithGemini, type GeminiImageOptions, type ImageModel } from '@/services/gemini-image-generator'
import { 
  applyStoryBibleStyleToPrompt, 
  extractGenreAndTone,
  STORY_BIBLE_PROMPT_VERSION,
  type StoryBibleImageType 
} from '@/services/story-bible-art-style'
import type { StoryBible, ImageAsset } from '@/services/story-bible-service'
import { getStyleReferenceImages, setStyleReferenceImages } from '@/services/story-bible-service'
import { generateImagesInParallel, type ParallelTask } from '@/services/parallel-image-generator'
// NOTE: Images are uploaded to Storage CLIENT-SIDE (like storyboards)
// Server returns base64, client uploads to Storage using client SDK
// This matches the working storyboard pattern

/**
 * Retry configuration
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 2000, // 2 seconds
  maxDelayMs: 8000, // 8 seconds
  backoffMultiplier: 2
}

/**
 * Generate image with retry logic and exponential backoff
 */
async function generateImageWithRetry(
  generatorFn: () => Promise<ImageAsset>,
  imageType: string,
  itemName: string,
  maxRetries: number = RETRY_CONFIG.maxRetries
): Promise<ImageAsset> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Story Bible Images] Generating ${imageType} for ${itemName} (attempt ${attempt}/${maxRetries})`)
      return await generatorFn()
    } catch (error: any) {
      lastError = error
      console.warn(`[Story Bible Images] Attempt ${attempt}/${maxRetries} failed for ${itemName}: ${error.message}`)
      
      // Handle 429 rate limit errors with longer delay
      if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('Too Many Requests')) {
        const rateLimitDelay = 5000 // 5 seconds for rate limits
        console.warn(`[Story Bible Images] Rate limit detected (429), waiting ${rateLimitDelay}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, rateLimitDelay))
        continue // Retry immediately after rate limit delay
      }
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break
      }
      
      // Calculate delay with exponential backoff
      const delayMs = Math.min(
        RETRY_CONFIG.initialDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1),
        RETRY_CONFIG.maxDelayMs
      )
      
      console.log(`[Story Bible Images] Retrying in ${delayMs}ms...`)
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }
  
  // All retries exhausted - try fallback
  console.error(`[Story Bible Images] All retries exhausted for ${itemName}, attempting fallback`)
  throw new Error(`Failed to generate ${imageType} after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`)
}

/**
 * Generate fallback placeholder image
 * Returns a simple placeholder that can be used when generation fails
 * 
 * CRITICAL: Returns empty imageUrl to prevent Firestore save errors
 * Data URLs (including SVG) cannot be saved to Firestore due to 1MB limit
 */
function createFallbackImage(itemName: string, imageType: string): ImageAsset {
  // CRITICAL: Return empty imageUrl instead of data URL
  // Data URLs (including SVG) violate IMAGE_GENERATION_AND_STORAGE.md
  // and will cause Firestore save errors
  console.warn(`⚠️ [Story Bible Images] Creating fallback for ${itemName} - no image will be displayed`)
  
  return {
    imageUrl: '', // Empty string instead of data URL - prevents Firestore errors
    prompt: `Failed to generate ${imageType} for ${itemName}`,
    generatedAt: new Date().toISOString(),
    // Use a valid ImageAsset source value; this is a non-AI fallback
    source: 'gemini',
    promptVersion: STORY_BIBLE_PROMPT_VERSION
  }
}

export interface StoryBibleWithImages extends StoryBible {
  visualAssets?: {
    heroImage?: ImageAsset
    generatedAt?: string
    lastRegenerated?: string
  }
  mainCharacters?: Array<{
    [key: string]: any
    visualReference?: ImageAsset
  }>
  narrativeArcs?: Array<{
    [key: string]: any
    keyArt?: ImageAsset
  }>
  worldBuilding?: {
    [key: string]: any
    locations?: Array<{
      [key: string]: any
      conceptArt?: ImageAsset
    }>
  }
}

export interface GenerationProgress {
  section: string
  progress: number // 0-100
  currentItem?: string
  totalItems?: number
  completedItems?: number
  errors?: Array<{
    item: string
    error: string
    section: string
  }>
}

/**
 * Generate hero image for series overview
 * This should be called LAST after characters are generated, so it can include character context
 */
export async function generateHeroImage(
  storyBible: StoryBible,
  userId: string,
  referenceImages?: string[], // Style references
  characterImages?: string[] // Character portrait images for style + composition
): Promise<ImageAsset> {
  const { genre, tone } = extractGenreAndTone(storyBible)
  
  const seriesTitle = storyBible.seriesTitle || 'Untitled Series'
  const seriesOverview = storyBible.seriesOverview || ''
  const premise = storyBible.premise?.premiseStatement || storyBible.premise || ''
  const theme = storyBible.theme || storyBible.themes?.[0] || ''
  
  // Build comprehensive hero image prompt with character context
  // CRITICAL: Hero image must be LANDSCAPE (16:9) aspect ratio for banner display
  let prompt = `Cinematic ensemble poster-style key art for "${seriesTitle}"`
  
  // Add series overview and theme context
  if (seriesOverview) {
    prompt += `. Series overview: ${seriesOverview.substring(0, 300)}`
  } else if (premise) {
    prompt += `. Premise: ${premise.substring(0, 300)}`
  }
  
  // Add theme if available
  if (theme) {
    prompt += `. Central theme: ${theme}`
  }
  
  // Add genre context
  prompt += `. ${genre} series`
  
  // Add character information for poster composition
  // CRITICAL: Emphasize that characters must match their reference images exactly
  if (storyBible.mainCharacters && storyBible.mainCharacters.length > 0) {
    const characterNames: string[] = []
    const characterDescriptions: string[] = []
    
    for (let i = 0; i < Math.min(6, storyBible.mainCharacters.length); i++) {
      const char = storyBible.mainCharacters[i]
      const charName = char.name || `Character ${i + 1}`
      const charRole = char.archetype || char.premiseFunction || char.premiseRole || char.role || ''
      const charDescription = char.physicalDescription || char.description || ''
      
      characterNames.push(charName)
      
      let charInfo = charName
      if (charRole) {
        charInfo += ` (${charRole})`
      }
      if (charDescription) {
        charInfo += `: ${charDescription.substring(0, 100)}`
      }
      
      characterDescriptions.push(charInfo)
    }
    
    if (characterDescriptions.length > 0) {
      prompt += `. Main characters featured in poster composition: ${characterDescriptions.join('; ')}`
      prompt += `. Create a cinematic poster with these characters arranged dynamically, showing their roles and relationships in the series`
      
      // CRITICAL: Emphasize character matching if character images are provided
      if (characterImages && characterImages.length > 0) {
        prompt += `. CRITICAL: Each character in the poster MUST look EXACTLY like their character portrait reference image. Match their face, ethnicity, age, body type, and core features precisely. All characters must be in the same art style as their reference images.`
      }
    }
  }
  
  // Add poster-specific instructions
  // CRITICAL: Emphasize landscape orientation for banner display
  prompt += `. Professional key art poster design, ensemble cast composition, dynamic layout, cinematic framing, series branding aesthetic. LANDSCAPE orientation (16:9 aspect ratio) - wide horizontal banner format`
  
  // Apply slightly animated style (matching character portraits)
  const finalPrompt = applyStoryBibleStyleToPrompt(
    prompt,
    genre,
    tone,
    'series-hero'
  )
  
  // Build characterImageMap for explicit character identity matching
  // This ensures characters in the hero image match their character tab portraits EXACTLY
  const characterImageMap: Record<string, string> = {}
  const allReferenceImages: string[] = []
  
  if (storyBible.mainCharacters && characterImages && characterImages.length > 0) {
    // Map each character name to their image URL for explicit matching
    for (let i = 0; i < Math.min(characterImages.length, storyBible.mainCharacters.length); i++) {
      const char = storyBible.mainCharacters[i]
      const charName = char.name || `Character ${i + 1}`
      const charImageUrl = characterImages[i]
      
      if (charImageUrl && charName) {
        characterImageMap[charName] = charImageUrl
        allReferenceImages.push(charImageUrl)
        console.log(`[Story Bible Images] Hero: Mapped character "${charName}" to their character portrait image`)
      }
    }
    
    // Add style references if available (but prioritize character images)
    if (referenceImages && referenceImages.length > 0) {
      // Only add style references that aren't already character images
      for (const styleRef of referenceImages) {
        if (!allReferenceImages.includes(styleRef) && allReferenceImages.length < 14) {
          allReferenceImages.push(styleRef)
        }
      }
    }
  } else if (referenceImages && referenceImages.length > 0) {
    // Fallback: use style references if no character images available
    allReferenceImages.push(...referenceImages.slice(0, 14))
  }
  
  console.log(`[Story Bible Images] Hero: Using ${Object.keys(characterImageMap).length} character(s) for identity matching, ${allReferenceImages.length} total reference image(s)`)
  
  // Generate with 16:9 LANDSCAPE aspect ratio for banner
  // 🎯 Use NANO BANANA PRO for hero images (high quality)
  // CRITICAL: Hero images must be landscape (16:9) for proper banner display
  const options: GeminiImageOptions = {
    aspectRatio: '16:9', // LANDSCAPE - wide horizontal banner format
    quality: 'hd',
    style: 'natural',
    referenceImages: allReferenceImages.length > 0 ? allReferenceImages : undefined,
    characterImageMap: Object.keys(characterImageMap).length > 0 ? characterImageMap : undefined, // CRITICAL: This ensures character identity matching
    model: 'nano-banana-pro' // High quality for hero images
  }
  
  try {
    const result = await generateImageWithRetry(
      async () => {
        const genResult = await generateImageWithGemini(finalPrompt, options)
        if (!genResult.success) {
          throw new Error(genResult.error || 'Gemini API returned failure')
        }
        
        // Return base64 - client will upload to Storage (same pattern as storyboards)
        // This avoids server-side permission errors and matches the working storyboard flow
        console.log(`✅ [Story Bible Images] Hero image generated with NANO BANANA PRO, returning base64 for client upload`)
        
        return {
          imageUrl: genResult.imageUrl, // Return base64 - client handles Storage upload
          prompt: finalPrompt,
          generatedAt: new Date().toISOString(),
          source: genResult.metadata?.model?.includes('gemini') ? 'gemini' : 'gemini',
          promptVersion: STORY_BIBLE_PROMPT_VERSION
        }
      },
      'hero image',
      seriesTitle
    )
    return result
  } catch (error: any) {
    console.error(`[Story Bible Images] Hero image generation failed after retries: ${error.message}`)
    // Return fallback instead of throwing - graceful degradation
    return createFallbackImage(seriesTitle, 'Hero Image')
  }
}

/**
 * Generate character portrait image
 */
export async function generateCharacterImage(
  character: any,
  storyBible: StoryBible,
  userId: string,
  referenceImages?: string[] // Optional reference images for style consistency
): Promise<ImageAsset> {
  const { genre, tone } = extractGenreAndTone(storyBible)
  
  const characterName = character.name || 'Character'
  const archetype = character.archetype || character.premiseFunction || character.premiseRole || ''
  const physicalDescription = character.physicalDescription || character.description || ''
  
  // Extract physiology attributes for detailed character description
  const physiology = character.physiology || {}
  const gender = physiology.gender || ''
  const age = physiology.age || ''
  const appearance = physiology.appearance || ''
  const build = physiology.build || ''
  const health = physiology.health || ''
  const physicalTraits = physiology.physicalTraits || []
  
  // Build comprehensive prompt with physiology details
  let prompt = `Semi-realistic character concept art: ${characterName}`
  
  if (archetype) {
    prompt += `, ${archetype}`
  }
  
  // Add physiology attributes to the prompt
  const physiologyDetails: string[] = []
  
  if (gender) {
    physiologyDetails.push(`Gender: ${gender}`)
  }
  
  if (age) {
    physiologyDetails.push(`Age: ${age}`)
  }
  
  // Use appearance from physiology if available, otherwise fall back to physicalDescription
  const characterAppearance = appearance || physicalDescription
  if (characterAppearance) {
    physiologyDetails.push(`Appearance: ${characterAppearance.substring(0, 200)}`)
  }
  
  if (build) {
    physiologyDetails.push(`Build: ${build}`)
  }
  
  if (health) {
    physiologyDetails.push(`Health: ${health}`)
  }
  
  if (physicalTraits && physicalTraits.length > 0) {
    physiologyDetails.push(`Physical traits: ${physicalTraits.join(', ')}`)
  }
  
  // Combine all physiology details
  if (physiologyDetails.length > 0) {
    prompt += `. ${physiologyDetails.join('. ')}`
  } else if (physicalDescription) {
    // Fallback to original description if no physiology data
    prompt += `. ${physicalDescription.substring(0, 150)}`
  }
  
  prompt += `. ${genre} series aesthetic`
  
  // Apply semi-realistic style
  const finalPrompt = applyStoryBibleStyleToPrompt(
    prompt,
    genre,
    tone,
    'character-portrait'
  )
  
  // Generate with 1:1 aspect ratio for portrait
  // 🎯 Use NANO BANANA for characters (fast, efficient)
  const options: GeminiImageOptions = {
    aspectRatio: '1:1',
    quality: 'standard',
    style: 'natural',
    referenceImages: referenceImages, // Pass reference images for style consistency
    model: 'nano-banana' // Fast model for characters
  }
  
  try {
    const result = await generateImageWithRetry(
      async () => {
        const genResult = await generateImageWithGemini(finalPrompt, options)
        if (!genResult.success) {
          throw new Error(genResult.error || 'Gemini API returned failure')
        }
        
        // Return base64 - client will upload to Storage (same pattern as storyboards)
        // This avoids server-side permission errors and matches the working storyboard flow
        console.log(`✅ [Story Bible Images] Character image generated with NANO BANANA, returning base64 for client upload`)
        
        return {
          imageUrl: genResult.imageUrl, // Return base64 - client handles Storage upload
          prompt: finalPrompt,
          generatedAt: new Date().toISOString(),
          source: genResult.metadata?.model?.includes('gemini') ? 'gemini' : 'gemini',
          promptVersion: STORY_BIBLE_PROMPT_VERSION
        }
      },
      'character portrait',
      characterName
    )
    return result
  } catch (error: any) {
    console.error(`[Story Bible Images] Character image generation failed after retries: ${error.message}`)
    // Return fallback instead of throwing - graceful degradation
    return createFallbackImage(characterName, 'Character Portrait')
  }
}

/**
 * Generate arc key art image
 */
export async function generateArcKeyArt(
  arc: any,
  storyBible: StoryBible,
  userId: string,
  referenceImages?: string[] // Optional reference images for style consistency
): Promise<ImageAsset> {
  const { genre, tone } = extractGenreAndTone(storyBible)
  
  const arcTitle = arc.title || 'Story Arc'
  const arcSummary = arc.summary || ''
  
  // Build prompt
  let prompt = `Semi-realistic key art: "${arcTitle}"`
  
  if (arcSummary) {
    prompt += `. ${arcSummary.substring(0, 200)}`
  }
  
  prompt += `. ${genre} series aesthetic`
  
  // Apply semi-realistic style
  const finalPrompt = applyStoryBibleStyleToPrompt(
    prompt,
    genre,
    tone,
    'arc-keyart'
  )
  
  // Generate with 16:9 aspect ratio for poster
  // 🎯 Use NANO BANANA for arcs (fast, efficient)
  const options: GeminiImageOptions = {
    aspectRatio: '16:9',
    quality: 'standard',
    style: 'natural',
    referenceImages: referenceImages, // Pass reference images for style consistency
    model: 'nano-banana' // Fast model for arcs
  }
  
  try {
    const result = await generateImageWithRetry(
      async () => {
        const genResult = await generateImageWithGemini(finalPrompt, options)
        if (!genResult.success) {
          throw new Error(genResult.error || 'Gemini API returned failure')
        }
        
        // Return base64 - client will upload to Storage (same pattern as storyboards)
        // This avoids server-side permission errors and matches the working storyboard flow
        console.log(`✅ [Story Bible Images] Arc key art generated with NANO BANANA, returning base64 for client upload`)
        
        return {
          imageUrl: genResult.imageUrl, // Return base64 - client handles Storage upload
          prompt: finalPrompt,
          generatedAt: new Date().toISOString(),
          source: genResult.metadata?.model?.includes('gemini') ? 'gemini' : 'gemini',
          promptVersion: STORY_BIBLE_PROMPT_VERSION
        }
      },
      'arc key art',
      arcTitle
    )
    return result
  } catch (error: any) {
    console.error(`[Story Bible Images] Arc key art generation failed after retries: ${error.message}`)
    // Return fallback instead of throwing - graceful degradation
    return createFallbackImage(arcTitle, 'Arc Key Art')
  }
}

/**
 * Generate location concept art
 */
export async function generateLocationConcept(
  location: any,
  storyBible: StoryBible,
  userId: string,
  referenceImages?: string[] // Optional reference images for style consistency
): Promise<ImageAsset> {
  const { genre, tone } = extractGenreAndTone(storyBible)
  
  const locationName = location.name || 'Location'
  const locationDescription = location.description || location.significance || ''
  const locationType = location.type || ''
  
  // Build prompt
  let prompt = `Semi-realistic location concept art: ${locationName}`
  
  if (locationType) {
    prompt += `, ${locationType}`
  }
  
  if (locationDescription) {
    prompt += `. ${locationDescription.substring(0, 150)}`
  }
  
  prompt += `. ${genre} series setting`
  
  // Apply semi-realistic style
  const finalPrompt = applyStoryBibleStyleToPrompt(
    prompt,
    genre,
    tone,
    'location-concept'
  )
  
  // Generate with 16:9 aspect ratio for establishing shot
  // 🎯 Use NANO BANANA for locations (fast, efficient)
  const options: GeminiImageOptions = {
    aspectRatio: '16:9',
    quality: 'standard',
    style: 'natural',
    referenceImages: referenceImages, // Pass reference images for style consistency
    model: 'nano-banana' // Fast model for locations
  }
  
  try {
    const result = await generateImageWithRetry(
      async () => {
        const genResult = await generateImageWithGemini(finalPrompt, options)
        if (!genResult.success) {
          throw new Error(genResult.error || 'Gemini API returned failure')
        }
        
        // Return base64 - client will upload to Storage (same pattern as storyboards)
        // This avoids server-side permission errors and matches the working storyboard flow
        console.log(`✅ [Story Bible Images] Location image generated with NANO BANANA, returning base64 for client upload`)
        
        return {
          imageUrl: genResult.imageUrl, // Return base64 - client handles Storage upload
          prompt: finalPrompt,
          generatedAt: new Date().toISOString(),
          source: genResult.metadata?.model?.includes('gemini') ? 'gemini' : 'gemini',
          promptVersion: STORY_BIBLE_PROMPT_VERSION
        }
      },
      'location concept',
      locationName
    )
    return result
  } catch (error: any) {
    console.error(`[Story Bible Images] Location concept generation failed after retries: ${error.message}`)
    // Return fallback instead of throwing - graceful degradation
    return createFallbackImage(locationName, 'Location Concept')
  }
}

/**
 * Generate all Story Bible images
 */
export async function generateStoryBibleImages(
  storyBible: StoryBible,
  userId: string,
  options: {
    sections: ('hero' | 'characters' | 'arcs' | 'world')[]
    regenerate?: boolean
    specificIndex?: { type: 'hero' | 'character' | 'arc' | 'location'; index?: number } // For generating single image
    onProgress?: (progress: GenerationProgress) => void
    onImageGenerated?: (imageType: 'hero' | 'character' | 'arc' | 'location', imageData: ImageAsset, itemIndex?: number, itemName?: string) => Promise<void>
  }
): Promise<StoryBibleWithImages> {
  const requestId = `img_gen_${Date.now()}_${Math.random().toString(36).substring(7)}`
  console.log(`[${requestId}] Starting Story Bible image generation`, {
    storyBibleId: storyBible.id,
    userId: userId ? `${userId.substring(0, 8)}...` : 'none',
    sections: options.sections,
    regenerate: options.regenerate || false
  })
  
  const updatedBible: StoryBibleWithImages = { ...storyBible }
  
  // Check for existing style reference images
  const referenceImages = getStyleReferenceImages(updatedBible)
  const hasStyleReferences = referenceImages.length > 0
  
  if (hasStyleReferences) {
    console.log(`🎨 [${requestId}] Using ${referenceImages.length} style reference images for consistency`)
  } else {
    console.log(`🎨 [${requestId}] First batch generation - no style references yet`)
  }
  
  // Initialize visualAssets if needed
  if (!updatedBible.visualAssets) {
    updatedBible.visualAssets = {}
  }
  
  // Track if hero should be generated (but do it last)
  const shouldGenerateHero = options.sections.includes('hero') && 
                             !options.specificIndex?.type // Not generating specific image
  
  // Calculate total sections (excluding hero from count for progress tracking)
  const sectionsWithoutHero = options.sections.filter(s => s !== 'hero')
  const totalSections = sectionsWithoutHero.length + (shouldGenerateHero ? 1 : 0)
  let completedSections = 0
  const errors: Array<{ item: string; error: string; section: string }> = []
  
  // Remove hero from sections list for now (we'll generate it last)
  const sectionsToProcess = options.sections.filter(s => s !== 'hero')
  
  // Generate hero image FIRST (only if SPECIFICALLY requested for single regeneration)
  // CRITICAL: This should NEVER run for bulk generation - hero should be LAST
  if (options.specificIndex?.type === 'hero' && options.sections.includes('hero')) {
    try {
      console.log(`[${requestId}] 🎯 SPECIFIC HERO REGENERATION REQUEST - generating hero first`)
      
      options.onProgress?.({
        section: 'hero',
        progress: (completedSections / totalSections) * 100,
        currentItem: 'Hero Image (Single)',
        totalItems: totalSections,
        completedItems: completedSections
      })
      
      // Check if hero image exists and has a valid Storage URL
      const hasHeroImage = updatedBible.visualAssets?.heroImage?.imageUrl && 
                          updatedBible.visualAssets.heroImage.imageUrl.trim() !== '' &&
                          (updatedBible.visualAssets.heroImage.imageUrl.includes('firebasestorage.googleapis.com') ||
                           updatedBible.visualAssets.heroImage.imageUrl.includes('storage.googleapis.com'))
      const shouldGenerateHeroImage = !hasHeroImage || options.regenerate
      
      if (shouldGenerateHeroImage) {
        // Collect ALL character images for hero reference (same as bulk generation)
        // This ensures characters in the hero image match their character tab portraits EXACTLY
        const characterImages: string[] = []
        if (updatedBible.mainCharacters) {
          for (let i = 0; i < updatedBible.mainCharacters.length; i++) {
            const char = updatedBible.mainCharacters[i]
            // Only include characters that have valid Storage URLs (not base64)
            const hasValidImage = char.visualReference?.imageUrl && 
                                 char.visualReference.imageUrl.trim() !== '' &&
                                 (char.visualReference.imageUrl.includes('firebasestorage.googleapis.com') ||
                                  char.visualReference.imageUrl.includes('storage.googleapis.com'))
            
            if (hasValidImage) {
              characterImages.push(char.visualReference.imageUrl)
              console.log(`[${requestId}] Including character ${i} (${char.name}) image as hero reference for identity matching`)
            } else {
              console.warn(`[${requestId}] Skipping character ${i} (${char.name}) - no valid character portrait image available`)
            }
          }
        }
        
        console.log(`[${requestId}] Generating hero with ${characterImages.length} character reference(s) for identity matching`)
        
        // For specific hero generation, pass character images for identity matching
        updatedBible.visualAssets.heroImage = await generateHeroImage(updatedBible, userId, referenceImages, characterImages)
        updatedBible.visualAssets.generatedAt = new Date().toISOString()
        updatedBible.visualAssets.lastRegenerated = new Date().toISOString()
        
        // Save image immediately if callback provided
        if (options.onImageGenerated && updatedBible.visualAssets.heroImage) {
          try {
            await options.onImageGenerated('hero', updatedBible.visualAssets.heroImage, 0, 'Hero Image')
            console.log(`[${requestId}] Hero image saved immediately`)
          } catch (saveError: any) {
            console.error(`[${requestId}] Failed to save hero image immediately:`, saveError.message)
            // Continue - image is still in updatedBible
          }
        }
      } else {
        console.log(`⏭️ [${requestId}] Skipping hero image - already has valid Storage URL`)
      }
      
      completedSections++
      console.log(`[${requestId}] Specific hero image generated, stopping`)
      return updatedBible
    } catch (error: any) {
      const errorMsg = error.message || 'Unknown error'
      console.error(`[${requestId}] Failed to generate hero image: ${errorMsg}`)
      errors.push({ item: 'Hero Image', error: errorMsg, section: 'hero' })
      return updatedBible // Return even on error for specific generation
    }
  }
  
  // Generate character images
  if (sectionsToProcess.includes('characters') && updatedBible.mainCharacters) {
    try {
      const characters = updatedBible.mainCharacters
      const totalCharacters = characters.length
      
      // If generating specific image, handle it separately (no need for parallel)
      if (options.specificIndex?.type === 'character' && options.specificIndex.index !== undefined) {
        const i = options.specificIndex.index
        const character = characters[i]
        
        if (character) {
          try {
            options.onProgress?.({
              section: 'characters',
              progress: ((completedSections + 1) / totalSections) * 100,
              currentItem: character.name || `Character ${i + 1}`,
              totalItems: totalCharacters,
              completedItems: 1
            })
            
            character.visualReference = await generateCharacterImage(character, updatedBible, userId, referenceImages)
            
            if (options.onImageGenerated && character.visualReference) {
              try {
                await options.onImageGenerated('character', character.visualReference, i, character.name)
                console.log(`[${requestId}] Character ${i} image saved immediately`)
              } catch (saveError: any) {
                console.error(`[${requestId}] Failed to save character ${i} image immediately:`, saveError.message)
              }
            }
            
            completedSections++
            console.log(`[${requestId}] Specific character ${i} image generated, stopping`)
            return updatedBible
          } catch (error: any) {
            const errorMsg = error.message || 'Unknown error'
            console.error(`[${requestId}] Failed to generate image for character ${character.name}: ${errorMsg}`)
            errors.push({ item: character.name || 'Unknown Character', error: errorMsg, section: 'characters' })
          }
        }
      } else {
        // Generate multiple characters in parallel
        const tasks: ParallelTask<{ index: number; image: ImageAsset }>[] = []
        
        for (let i = 0; i < characters.length; i++) {
          const character = characters[i]
          
          // Only generate if no image exists, or if regenerating (matches client-side check)
          const hasImage = character.visualReference?.imageUrl && 
                          character.visualReference.imageUrl.trim() !== ''
          const shouldGenerate = !hasImage || options.regenerate
          
          if (shouldGenerate) {
            tasks.push({
              id: `character-${i}`,
              execute: async () => {
                const image = await generateCharacterImage(character, updatedBible, userId, referenceImages)
                return { index: i, image }
              },
              onError: (error: Error) => {
                const errorMsg = error.message || 'Unknown error'
                console.error(`[${requestId}] Failed to generate image for character ${character.name}: ${errorMsg}`)
                errors.push({ item: character.name || 'Unknown Character', error: errorMsg, section: 'characters' })
              }
            })
          } else {
            console.log(`⏭️ [${requestId}] Skipping character ${i} (${character.name}) - already has image`)
          }
        }
        
        if (tasks.length > 0) {
          let completedCharacters = 0
          
          const parallelResult = await generateImagesInParallel<{ index: number; image: ImageAsset }>(tasks, {
            onProgress: (completed, total, currentId) => {
              completedCharacters = completed
              const characterIndex = currentId ? parseInt(currentId.split('-')[1]) : 0
              const currentCharacter = characters[characterIndex]
              
              options.onProgress?.({
                section: 'characters',
                progress: ((completedSections + (completedCharacters / totalCharacters)) / totalSections) * 100,
                currentItem: currentCharacter?.name || `Character ${characterIndex + 1}`,
                totalItems: totalCharacters,
                completedItems: completedCharacters
              })
            },
            onTaskComplete: (id, success, error) => {
              // Progress tracking only - results processed after parallel execution
            },
            rateLimitRPM: 20,
            sequentialCount: 3,
            batchSize: 12
          })
          
          // Process results and update characters
          for (const taskResult of parallelResult.results) {
            if (taskResult.success && taskResult.result) {
              const characterIndex = taskResult.result.index
              characters[characterIndex].visualReference = taskResult.result.image
              
              // Save image immediately if callback provided
              const onImageGenerated = options.onImageGenerated
              if (onImageGenerated) {
                (async () => {
                  try {
                    await onImageGenerated('character', taskResult.result!.image, characterIndex, characters[characterIndex].name)
                    console.log(`[${requestId}] Character ${characterIndex} image saved immediately`)
                  } catch (saveError: any) {
                    console.error(`[${requestId}] Failed to save character ${characterIndex} image immediately:`, saveError.message)
                  }
                })()
              }
            }
          }
        }
        
        completedSections++
      }
    } catch (error: any) {
      console.error('Failed to generate character images:', error)
      // Continue with other sections
    }
  }
  
  // Arc key art generation DISABLED - not shown in UI, saves tokens
  if (sectionsToProcess.includes('arcs')) {
    console.log(`⏭️ [${requestId}] Skipping arc key art generation - disabled to save tokens (not shown in UI)`)
    completedSections++
  }
  
  // Generate location concept art
  if (sectionsToProcess.includes('world') && updatedBible.worldBuilding?.locations) {
    try {
      const locations = updatedBible.worldBuilding.locations
      const totalLocations = locations.length
      
      // If generating specific image, handle it separately
      if (options.specificIndex?.type === 'location' && options.specificIndex.index !== undefined) {
        const i = options.specificIndex.index
        const location = locations[i]
        
        if (location) {
          try {
            options.onProgress?.({
              section: 'world',
              progress: ((completedSections + 1) / totalSections) * 100,
              currentItem: location.name || `Location ${i + 1}`,
              totalItems: totalLocations,
              completedItems: 1
            })
            
            location.conceptArt = await generateLocationConcept(location, updatedBible, userId, referenceImages)
            
            if (options.onImageGenerated && location.conceptArt) {
              try {
                await options.onImageGenerated('location', location.conceptArt, i, location.name)
                console.log(`[${requestId}] Location ${i} concept art saved immediately`)
              } catch (saveError: any) {
                console.error(`[${requestId}] Failed to save location ${i} concept art immediately:`, saveError.message)
              }
            }
            
            completedSections++
            console.log(`[${requestId}] Specific location ${i} image generated, stopping`)
            return updatedBible
          } catch (error: any) {
            const errorMsg = error.message || 'Unknown error'
            console.error(`[${requestId}] Failed to generate concept art for location ${location.name}: ${errorMsg}`)
            errors.push({ item: location.name || 'Unknown Location', error: errorMsg, section: 'world' })
          }
        }
      } else {
        // Generate multiple locations in parallel
        const tasks: ParallelTask<{ index: number; image: ImageAsset }>[] = []
        
        for (let i = 0; i < locations.length; i++) {
          const location = locations[i]
          
          // Only generate if no image exists, or if regenerating (matches client-side check)
          const hasImage = location.conceptArt?.imageUrl && 
                          location.conceptArt.imageUrl.trim() !== ''
          const shouldGenerate = !hasImage || options.regenerate
          
          if (shouldGenerate) {
            tasks.push({
              id: `location-${i}`,
              execute: async () => {
                const image = await generateLocationConcept(location, updatedBible, userId, referenceImages)
                return { index: i, image }
              },
              onError: (error: Error) => {
                const errorMsg = error.message || 'Unknown error'
                console.error(`[${requestId}] Failed to generate concept art for location ${location.name}: ${errorMsg}`)
                errors.push({ item: location.name || 'Unknown Location', error: errorMsg, section: 'world' })
              }
            })
          } else {
            console.log(`⏭️ [${requestId}] Skipping location ${i} (${location.name}) - already has concept art`)
          }
        }
        
        if (tasks.length > 0) {
          let completedLocations = 0
          
          const parallelResult = await generateImagesInParallel<{ index: number; image: ImageAsset }>(tasks, {
            onProgress: (completed, total, currentId) => {
              completedLocations = completed
              const locationIndex = currentId ? parseInt(currentId.split('-')[1]) : 0
              const currentLocation = locations[locationIndex]
              
              options.onProgress?.({
                section: 'world',
                progress: ((completedSections + (completedLocations / totalLocations)) / totalSections) * 100,
                currentItem: currentLocation?.name || `Location ${locationIndex + 1}`,
                totalItems: totalLocations,
                completedItems: completedLocations
              })
            },
            onTaskComplete: (id, success, error) => {
              // Progress tracking only
            },
            rateLimitRPM: 20,
            sequentialCount: 3,
            batchSize: 12
          })
          
          // Process results and update locations
          for (const taskResult of parallelResult.results) {
            if (taskResult.success && taskResult.result) {
              const locationIndex = taskResult.result.index
              locations[locationIndex].conceptArt = taskResult.result.image
              
              const onImageGenerated = options.onImageGenerated
              if (onImageGenerated) {
                (async () => {
                  try {
                    await onImageGenerated('location', taskResult.result!.image, locationIndex, locations[locationIndex].name)
                    console.log(`[${requestId}] Location ${locationIndex} concept art saved immediately`)
                  } catch (saveError: any) {
                    console.error(`[${requestId}] Failed to save location ${locationIndex} concept art immediately:`, saveError.message)
                  }
                })()
              }
            }
          }
        }
        
        completedSections++
      }
    } catch (error: any) {
      console.error('Failed to generate location concept art:', error)
      // Continue with other sections
    }
  }
  
  // Generate hero image LAST (after all other images, so it has character context)
  // This is for BULK generation only - hero should always be last
  if (shouldGenerateHero) {
    try {
      console.log(`[${requestId}] 🎯 BULK GENERATION: Generating hero image LAST (after all characters/arcs/locations)`)
      
      options.onProgress?.({
        section: 'hero',
        progress: ((completedSections + 0.9) / totalSections) * 100, // 90% of final section
        currentItem: 'Hero Image (Bulk)',
        totalItems: totalSections,
        completedItems: completedSections
      })
      
      // Validate hero image exists and is a valid Storage URL (not base64)
      const hasValidHeroImage = updatedBible.visualAssets?.heroImage?.imageUrl && 
                                updatedBible.visualAssets.heroImage.imageUrl.trim() !== '' &&
                                (updatedBible.visualAssets.heroImage.imageUrl.includes('firebasestorage.googleapis.com') ||
                                 updatedBible.visualAssets.heroImage.imageUrl.includes('storage.googleapis.com'))
      const shouldGenerateHeroImage = !hasValidHeroImage || options.regenerate
      
      if (!shouldGenerateHeroImage) {
        console.log(`⏭️ [${requestId}] Skipping hero image - already has valid Storage URL: ${updatedBible.visualAssets?.heroImage?.imageUrl?.substring(0, 60)}...`)
      }
      
      if (shouldGenerateHeroImage) {
        console.log(`[${requestId}] 🎨 Generating hero image LAST with character context...`)
        
        // Collect ALL character images for hero reference (not just 3)
        // This ensures all characters are included and in the same art style
        const characterImages: string[] = []
        if (updatedBible.mainCharacters) {
          for (let i = 0; i < updatedBible.mainCharacters.length; i++) {
            const char = updatedBible.mainCharacters[i]
            // Only include characters that have valid Storage URLs (not base64)
            const hasValidImage = char.visualReference?.imageUrl && 
                                 char.visualReference.imageUrl.trim() !== '' &&
                                 (char.visualReference.imageUrl.includes('firebasestorage.googleapis.com') ||
                                  char.visualReference.imageUrl.includes('storage.googleapis.com'))
            
            if (hasValidImage) {
              characterImages.push(char.visualReference.imageUrl)
              console.log(`[${requestId}] Including character ${i} (${char.name}) image as hero reference for identity matching`)
            } else {
              console.warn(`[${requestId}] Skipping character ${i} (${char.name}) - no valid character portrait image available`)
            }
          }
        }
        
        console.log(`[${requestId}] Generating hero with ${characterImages.length} character reference(s) for identity matching`)
        
        updatedBible.visualAssets.heroImage = await generateHeroImage(
          updatedBible, 
          userId, 
          referenceImages, // Style references
          characterImages  // Character portrait images - USING NANO BANANA PRO
        )
        updatedBible.visualAssets.generatedAt = new Date().toISOString()
        updatedBible.visualAssets.lastRegenerated = new Date().toISOString()
        
        // Save image immediately if callback provided
        if (options.onImageGenerated && updatedBible.visualAssets.heroImage) {
          try {
            await options.onImageGenerated('hero', updatedBible.visualAssets.heroImage, 0, 'Hero Image')
            console.log(`[${requestId}] Hero image saved immediately with NANO BANANA PRO`)
          } catch (saveError: any) {
            console.error(`[${requestId}] Failed to save hero image immediately:`, saveError.message)
            // Continue - image is still in updatedBible
          }
        }
      }
      
      completedSections++
      console.log(`[${requestId}] Hero image generated successfully LAST (with character context, using NANO BANANA PRO)`)
    } catch (error: any) {
      const errorMsg = error.message || 'Unknown error'
      console.error(`[${requestId}] Failed to generate hero image: ${errorMsg}`)
      errors.push({ item: 'Hero Image', error: errorMsg, section: 'hero' })
      // Continue - graceful degradation
    }
  }
  
  // Final progress update
  const finalProgress: GenerationProgress = {
    section: 'complete',
    progress: 100,
    totalItems: totalSections,
    completedItems: completedSections
  }
  
  if (errors.length > 0) {
    finalProgress.errors = errors
    console.warn(`[${requestId}] Generation complete with ${errors.length} error(s)`, { errors })
  } else {
    console.log(`[${requestId}] Generation complete successfully`)
  }
  
  options.onProgress?.(finalProgress)
  
  // After first batch completes, set style reference images if not already set
  if (!hasStyleReferences && updatedBible.mainCharacters) {
    // Select first 1-3 character images as style references
    const newReferenceImages: string[] = []
    for (let i = 0; i < Math.min(3, updatedBible.mainCharacters.length); i++) {
      const char = updatedBible.mainCharacters[i]
      if (char.visualReference?.imageUrl) {
        newReferenceImages.push(char.visualReference.imageUrl)
      }
    }
    
    if (newReferenceImages.length > 0) {
      console.log(`🎨 [${requestId}] Locking in ${newReferenceImages.length} style references from first batch`)
      const bibleWithReferences = setStyleReferenceImages(updatedBible, newReferenceImages)
      // Merge back into updatedBible
      updatedBible.styleReferenceImages = bibleWithReferences.styleReferenceImages
      updatedBible.styleLockedAt = bibleWithReferences.styleLockedAt
    }
  }
  
  return updatedBible
}

