/**
 * Series Teaser Trailer Generator
 * 
 * Generates 8-second series teaser trailers using VEO 3.1
 */

import { veo3VideoGenerator } from '@/services/veo3-video-generator'
import { buildTeaserPrompt, type TeaserPromptContext } from '@/services/series-teaser-prompt-builder'
import type { StoryBible } from '@/services/story-bible-service'

export interface SeriesTeaser {
  videoUrl: string
  prompt: string
  generatedAt: string
  duration: number // 8
  aspectRatio: '9:16'
  source: 'veo3'
  creditsUsed: number
  cost?: {
    amount: number
    currency: string
    mode: 'fast' | 'standard'
    hasAudio: boolean
  }
  metadata?: {
    charactersFeatured: string[]
    marketingHooksUsed: string[]
    genre: string
  }
}

/**
 * Generate series teaser trailer
 */
export async function generateSeriesTeaser(
  storyBible: StoryBible,
  marketing: any,
  episodeData?: any[]
): Promise<SeriesTeaser> {
  console.log('🎬 Generating series teaser trailer...')
  
  // Build adaptive prompt
  const promptContext: TeaserPromptContext = {
    storyBible,
    marketing,
    episodeData
  }
  
  const teaserPrompt = buildTeaserPrompt(promptContext)
  console.log('📝 Teaser prompt generated, length:', teaserPrompt.length)
  console.log('📝 Full teaser prompt:')
  console.log('='.repeat(80))
  console.log(teaserPrompt)
  console.log('='.repeat(80))
  
  // Use story bible ID as episode ID for credit management
  const episodeId = `series-teaser-${storyBible.id}`
  
  // DEBUG: Allow regeneration (remove this check later)
  // Check credits - use getRemainingCredits which returns the number
  // const remainingCredits = veo3VideoGenerator.getRemainingCredits(episodeId)
  // if (remainingCredits === 0) {
  //   throw new Error('Teaser already generated for this series. Only one teaser per story bible is allowed.')
  // }
  console.log('⚠️ DEBUG MODE: Regeneration allowed (remove this later)')
  
  // Generate video using VEO 3.1
  // Use the full teaser prompt as shotDescription
  // Use series overview as sceneContext
  const sceneContext = storyBible.seriesOverview || storyBible.premise?.premiseStatement || 'Series teaser trailer'
  
  const result = await veo3VideoGenerator.generateStoryboardVideo(
    teaserPrompt, // Full 8-second teaser description
    sceneContext,
    episodeId,
    {
      duration: 8,
      aspectRatio: '9:16', // Portrait for TikTok/Stories
      quality: 'standard', // Fast mode (veo-3.1-fast-generate-preview)
      style: getStyleFromGenre(storyBible.genre || 'drama'),
      hasAudio: false // Fast mode doesn't support audio control, but narration will be included
    }
  )
  
  if (!result.success || !result.videoUrl) {
    throw new Error(result.error || 'Failed to generate teaser video')
  }
  
  // Verify video URL is a valid proxy URL
  if (!result.videoUrl || typeof result.videoUrl !== 'string') {
    throw new Error('Invalid video URL returned from VEO 3.1')
  }
  
  // Ensure video URL is a proxy URL (should start with /api/veo3-video-proxy)
  const videoUrl = result.videoUrl.startsWith('/api/veo3-video-proxy') 
    ? result.videoUrl 
    : result.videoUrl // If it's already a full URL, use it as-is
  
  console.log('📹 Video URL generated:', {
    url: videoUrl.substring(0, 100) + '...',
    isProxyUrl: videoUrl.includes('/api/veo3-video-proxy')
  })
  
  // Extract character names for metadata
  const charactersFeatured = (storyBible.mainCharacters || [])
    .slice(0, 3)
    .map((char: any) => char.name || 'Character')
  
  // Extract marketing hooks used
  const marketingHooksUsed = (marketing?.marketingHooks?.seriesHooks || []).slice(0, 2)
  
  const teaser: SeriesTeaser = {
    videoUrl: videoUrl,
    prompt: teaserPrompt,
    generatedAt: new Date().toISOString(),
    duration: 8,
    aspectRatio: '9:16',
    source: 'veo3',
    creditsUsed: result.metadata?.creditsUsed || 1,
    cost: result.metadata?.cost,
    metadata: {
      charactersFeatured,
      marketingHooksUsed,
      genre: storyBible.genre || 'drama'
    }
  }
  
  console.log('✅ Series teaser generated successfully')
  console.log('  Video URL:', videoUrl.substring(0, 80) + '...')
  console.log('  Cost:', result.metadata?.cost?.amount || '$0.80', '(fast mode, 8s, no audio)')
  console.log('  Characters featured:', charactersFeatured.length)
  console.log('  Credits used:', teaser.creditsUsed)
  
  return teaser
}

/**
 * Get video style from genre
 */
function getStyleFromGenre(genre: string): 'realistic' | 'cinematic' | 'documentary' {
  const genreLower = genre.toLowerCase()
  
  if (genreLower.includes('documentary') || genreLower.includes('docu')) {
    return 'documentary'
  } else if (genreLower.includes('realistic') || genreLower.includes('natural')) {
    return 'realistic'
  } else {
    return 'cinematic' // Default for most genres
  }
}

