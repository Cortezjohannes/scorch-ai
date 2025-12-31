/**
 * Marketing Visual Generator Service
 * 
 * Generates visual marketing assets:
 * - Series poster
 * - Character spotlight cards
 * - Campaign graphics
 * 
 * 🎯 Uses NANO BANANA PRO for all marketing visuals (high quality)
 * 
 * All generated images are uploaded to Firebase Storage for persistence.
 */

import { generateImageWithStorageAdmin, type ImageGenerationWithStorageOptions } from '@/services/image-generation-with-storage'
import { applyStoryBibleStyleToPrompt, extractGenreAndTone } from '@/services/story-bible-art-style'
import type { StoryBible, ImageAsset } from '@/services/story-bible-service'
import { STORY_BIBLE_PROMPT_VERSION } from '@/services/story-bible-art-style'

/**
 * Generate series poster for marketing
 * Image is automatically uploaded to Firebase Storage
 */
export async function generateSeriesPoster(
  storyBible: StoryBible,
  marketing: any,
  userId: string
): Promise<ImageAsset> {
  const { genre, tone } = extractGenreAndTone(storyBible)
  
  const seriesTitle = storyBible.seriesTitle || 'Untitled Series'
  const seriesOverview = storyBible.seriesOverview || ''
  const keySellingPoints = marketing?.marketingStrategy?.keySellingPoints || []
  const primaryApproach = marketing?.marketingStrategy?.primaryApproach || ''
  const marketingHooks = marketing?.marketingHooks?.seriesHooks || []
  
  // Build poster prompt
  let prompt = `Professional cinematic poster for "${seriesTitle}"`
  
  if (seriesOverview) {
    prompt += `. Series: ${seriesOverview.substring(0, 200)}`
  }
  
  if (keySellingPoints.length > 0) {
    prompt += `. Key selling points: ${keySellingPoints.slice(0, 3).join(', ')}`
  }
  
  if (primaryApproach) {
    prompt += `. Marketing approach: ${primaryApproach.substring(0, 100)}`
  }
  
  // Add character information if available
  if (storyBible.mainCharacters && storyBible.mainCharacters.length > 0) {
    const characterNames = storyBible.mainCharacters
      .slice(0, 6)
      .map((char: any) => char.name || 'Character')
      .join(', ')
    prompt += `. Main characters: ${characterNames}`
  }
  
  prompt += `. Professional movie poster design, cinematic composition, dynamic layout, series branding, high quality marketing poster`
  
  // Apply story bible style
  const finalPrompt = applyStoryBibleStyleToPrompt(
    prompt,
    genre,
    tone,
    'marketing-poster'
  )
  
  try {
    // Generate image and upload to Firebase Storage using Admin SDK (server-side)
    // 🎯 Use NANO BANANA PRO for high quality marketing visuals
    // CRITICAL: Use Admin SDK version for server-side API routes
    const result = await generateImageWithStorageAdmin(finalPrompt, {
      userId,
      context: 'marketing',
      aspectRatio: '16:9',
      quality: 'hd',
      style: 'natural',
      model: 'nano-banana-pro', // High quality for marketing
      referenceImages: storyBible.visualAssets?.heroImage?.imageUrl 
        ? [storyBible.visualAssets.heroImage.imageUrl] 
        : undefined
    })
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to generate poster')
    }
    
    return {
      imageUrl: result.imageUrl, // Firebase Storage URL
      prompt: finalPrompt,
      generatedAt: new Date().toISOString(),
      source: result.metadata?.model || 'gemini',
      promptVersion: STORY_BIBLE_PROMPT_VERSION
    }
  } catch (error: any) {
    console.error('Error generating series poster:', error)
    throw error
  }
}

/**
 * Generate character spotlight card
 * Image is automatically uploaded to Firebase Storage
 */
export async function generateCharacterSpotlightCard(
  character: any,
  storyBible: StoryBible,
  platform: 'tiktok' | 'instagram' | 'youtube',
  userId: string
): Promise<ImageAsset> {
  const { genre, tone } = extractGenreAndTone(storyBible)
  
  const characterName = character.name || 'Character'
  const characterDescription = character.description || character.physicalDescription || ''
  const seriesTitle = storyBible.seriesTitle || 'Untitled Series'
  
  // Determine aspect ratio based on platform
  const aspectRatio: '1:1' | '16:9' | '9:16' = 
    platform === 'tiktok' || platform === 'instagram' ? '9:16' :
    platform === 'youtube' ? '16:9' : '1:1'
  
  let prompt = `Character spotlight card for ${characterName} from "${seriesTitle}"`
  
  if (characterDescription) {
    prompt += `. Character: ${characterDescription.substring(0, 150)}`
  }
  
  if (character.archetype || character.role) {
    prompt += `. Role: ${character.archetype || character.role}`
  }
  
  prompt += `. Professional character spotlight design, ${platform} optimized format, marketing card style, high quality, engaging composition`
  
  // Apply story bible style
  const finalPrompt = applyStoryBibleStyleToPrompt(
    prompt,
    genre,
    tone,
    'character-spotlight'
  )
  
  try {
    // Generate image and upload to Firebase Storage using Admin SDK (server-side)
    // 🎯 Use NANO BANANA PRO for high quality marketing visuals
    const result = await generateImageWithStorage(finalPrompt, {
      userId,
      context: 'marketing',
    aspectRatio,
    quality: 'hd',
    style: 'natural',
      model: 'nano-banana-pro', // High quality for marketing
    referenceImages: character.visualReference?.imageUrl 
      ? [character.visualReference.imageUrl] 
      : undefined
    })
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to generate character spotlight')
    }
    
    return {
      imageUrl: result.imageUrl, // Firebase Storage URL
      prompt: finalPrompt,
      generatedAt: new Date().toISOString(),
      source: result.metadata?.model || 'gemini',
      promptVersion: STORY_BIBLE_PROMPT_VERSION
    }
  } catch (error: any) {
    console.error('Error generating character spotlight:', error)
    throw error
  }
}

/**
 * Generate campaign graphics
 * Image is automatically uploaded to Firebase Storage
 */
export async function generateCampaignGraphic(
  campaignType: 'launch' | 'milestone' | 'arcTransition',
  storyBible: StoryBible,
  marketing: any,
  campaignData: any, // Additional context (episode number, arc info, etc.)
  userId: string
): Promise<ImageAsset> {
  const { genre, tone } = extractGenreAndTone(storyBible)
  
  const seriesTitle = storyBible.seriesTitle || 'Untitled Series'
  
  let prompt = `Marketing campaign graphic for "${seriesTitle}"`
  
  if (campaignType === 'launch') {
    prompt += `. Launch campaign graphic, "Premiering Soon" or "Now Streaming" style, engaging announcement design`
  } else if (campaignType === 'milestone') {
    const episodeNum = campaignData?.episodeNumber || ''
    prompt += `. Milestone celebration graphic, Episode ${episodeNum} milestone, achievement announcement style`
  } else if (campaignType === 'arcTransition') {
    const arcTitle = campaignData?.arcTitle || 'Arc'
    prompt += `. Arc transition graphic, "${arcTitle}" completion, next arc announcement style`
  }
  
  const keySellingPoints = marketing?.marketingStrategy?.keySellingPoints || []
  if (keySellingPoints.length > 0) {
    prompt += `. Highlights: ${keySellingPoints.slice(0, 2).join(', ')}`
  }
  
  prompt += `. Professional marketing graphic design, social media optimized, high quality, engaging visual`
  
  // Apply story bible style
  const finalPrompt = applyStoryBibleStyleToPrompt(
    prompt,
    genre,
    tone,
    'campaign-graphic'
  )
  
  try {
    // Generate image and upload to Firebase Storage using Admin SDK (server-side)
    // 🎯 Use NANO BANANA PRO for high quality marketing visuals
    // CRITICAL: Use Admin SDK version for server-side API routes
    const result = await generateImageWithStorageAdmin(finalPrompt, {
      userId,
      context: 'marketing',
      aspectRatio: '16:9', // Standard for campaign graphics
      quality: 'hd',
      style: 'natural',
      model: 'nano-banana-pro', // High quality for marketing
      referenceImages: storyBible.visualAssets?.heroImage?.imageUrl 
        ? [storyBible.visualAssets.heroImage.imageUrl] 
        : undefined
    })
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to generate campaign graphic')
    }
    
    return {
      imageUrl: result.imageUrl, // Firebase Storage URL
      prompt: finalPrompt,
      generatedAt: new Date().toISOString(),
      source: result.metadata?.model || 'gemini',
      promptVersion: STORY_BIBLE_PROMPT_VERSION
    }
  } catch (error: any) {
    console.error('Error generating campaign graphic:', error)
    throw error
  }
}



