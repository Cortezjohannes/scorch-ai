/**
 * Episode Thumbnail Selector Service
 * 
 * Selects the best storyboard frame to use as episode thumbnail
 * Uses AI to analyze frames and select most marketing-worthy/viral frame
 */

import { generateContentWithGemini } from '@/services/gemini-ai'
import type { StoryboardsData, StoryboardFrame } from '@/types/preproduction'
import type { EpisodeMarketingData } from '@/types/preproduction'

export interface ThumbnailSelectionResult {
  frameId: string
  sceneNumber: number
  frameImage: string
  reason: string
  viralScore?: number
}

/**
 * Select best thumbnail frame from storyboards
 */
export async function selectBestThumbnailFrame(
  storyboards: StoryboardsData,
  episodeMarketing: EpisodeMarketingData | null,
  episodeNumber: number
): Promise<ThumbnailSelectionResult | null> {
  if (!storyboards?.scenes || storyboards.scenes.length === 0) {
    console.log('⚠️ No storyboard scenes available for thumbnail selection')
    return null
  }
  
  // Helper function to extract image URL from frame (checks multiple possible fields)
  const getFrameImage = (frame: StoryboardFrame): string | null => {
    // Primary: frameImage (most common)
    if (frame.frameImage && typeof frame.frameImage === 'string') {
      const trimmed = frame.frameImage.trim()
      if (trimmed.length > 0 && (trimmed.startsWith('http') || trimmed.startsWith('data:') || trimmed.startsWith('blob:'))) {
        return trimmed
      }
    }
    
    // Fallback: imageUrl
    if ((frame as any).imageUrl && typeof (frame as any).imageUrl === 'string') {
      const trimmed = (frame as any).imageUrl.trim()
      if (trimmed.length > 0 && (trimmed.startsWith('http') || trimmed.startsWith('data:') || trimmed.startsWith('blob:'))) {
        return trimmed
      }
    }
    
    // Fallback: image
    if ((frame as any).image && typeof (frame as any).image === 'string') {
      const trimmed = (frame as any).image.trim()
      if (trimmed.length > 0 && (trimmed.startsWith('http') || trimmed.startsWith('data:') || trimmed.startsWith('blob:'))) {
        return trimmed
      }
    }
    
    // Fallback: referenceImages (first one)
    if (Array.isArray(frame.referenceImages) && frame.referenceImages.length > 0) {
      const firstRef = frame.referenceImages[0]
      if (typeof firstRef === 'string' && firstRef.trim().length > 0 && 
          (firstRef.startsWith('http') || firstRef.startsWith('data:') || firstRef.startsWith('blob:'))) {
        return firstRef.trim()
      }
    }
    
    return null
  }
  
  // Collect all frames with images
  const framesWithImages: Array<{
    frame: StoryboardFrame
    sceneNumber: number
    index: number
    imageUrl: string
  }> = []
  
  let totalFrames = 0
  let framesWithoutImages = 0
  
  storyboards.scenes.forEach((scene) => {
    scene.frames?.forEach((frame, frameIndex) => {
      totalFrames++
      const imageUrl = getFrameImage(frame)
      if (imageUrl) {
        framesWithImages.push({
          frame,
          sceneNumber: scene.sceneNumber,
          index: frameIndex,
          imageUrl
        })
      } else {
        framesWithoutImages++
      }
    })
  })
  
  console.log(`🔍 Thumbnail selection: Found ${framesWithImages.length} frames with images out of ${totalFrames} total frames`)
  
  if (framesWithImages.length === 0) {
    console.log('⚠️ No storyboard frames with images available for thumbnail selection')
    console.log(`   Total frames checked: ${totalFrames}`)
    console.log(`   Frames without valid images: ${framesWithoutImages}`)
    return null
  }
  
  // If we have viral potential scenes, prioritize those
  const viralScenes = episodeMarketing?.viralPotentialScenes || []
  const viralSceneNumbers = new Set(viralScenes.map(v => v.sceneNumber))
  
  // Build frame descriptions for AI analysis
  const frameDescriptions = framesWithImages.map((item, idx) => {
    const frame = item.frame
    const isViralScene = viralSceneNumbers.has(item.sceneNumber)
    const viralInfo = viralScenes.find(v => v.sceneNumber === item.sceneNumber)
    
    return {
      index: idx,
      frameId: frame.id || `frame-${idx}`,
      sceneNumber: item.sceneNumber,
      shotNumber: frame.shotNumber || 0,
      description: frame.description || frame.shotDescription || frame.action || 'No description',
      cameraAngle: frame.cameraAngle || frame.angle || 'Unknown',
      isViralScene,
      viralHook: viralInfo?.hook || null,
      viralScore: viralInfo ? 8 : (isViralScene ? 6 : 3) // Base score
    }
  })
  
  // Use AI to select best frame
  try {
    const prompt = `Analyze these storyboard frames from Episode ${episodeNumber} and select the BEST frame for a marketing thumbnail.

FRAMES:
${frameDescriptions.map((f, idx) => 
  `${idx + 1}. Scene ${f.sceneNumber}, Shot ${f.shotNumber} (Frame ID: ${f.frameId})
   Description: ${f.description}
   Camera: ${f.cameraAngle}
   ${f.isViralScene ? `⭐ VIRAL SCENE - Hook: ${f.viralHook}` : ''}
   Base Score: ${f.viralScore}/10`
).join('\n\n')}

SELECTION CRITERIA:
1. Most visually engaging and marketing-worthy
2. Represents key moment or hook from episode
3. Clear, dynamic composition
4. If viral scenes available, prioritize those
5. Best represents the episode's core story

Return ONLY a JSON object with this exact structure:
{
  "selectedFrameIndex": 0,
  "reason": "Brief explanation of why this frame was selected",
  "viralScore": 8
}

The selectedFrameIndex should be the index (0-based) from the frames list above.`

    const response = await generateContentWithGemini(prompt)
    
    // Parse AI response
    let selection: any
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        selection = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (error) {
      console.warn('⚠️ Failed to parse AI selection, using fallback logic')
      // Fallback: select frame from viral scene, or first frame
      const viralFrame = frameDescriptions.find(f => f.isViralScene)
      if (viralFrame) {
        selection = {
          selectedFrameIndex: frameDescriptions.indexOf(viralFrame),
          reason: 'Selected from viral potential scene',
          viralScore: viralFrame.viralScore
        }
      } else {
        selection = {
          selectedFrameIndex: 0,
          reason: 'Selected first available frame (fallback)',
          viralScore: 3
        }
      }
    }
    
    const selectedIndex = selection.selectedFrameIndex || 0
    if (selectedIndex < 0 || selectedIndex >= framesWithImages.length) {
      console.warn('⚠️ Invalid frame index from AI, using first frame')
      const firstFrame = framesWithImages[0]
      return {
        frameId: firstFrame.frame.id || 'frame-0',
        sceneNumber: firstFrame.sceneNumber,
        frameImage: firstFrame.imageUrl,
        reason: 'First available frame (fallback)',
        viralScore: 3
      }
    }
    
    const selected = framesWithImages[selectedIndex]
    
    return {
      frameId: selected.frame.id || `frame-${selectedIndex}`,
      sceneNumber: selected.sceneNumber,
      frameImage: selected.imageUrl,
      reason: selection.reason || 'Selected by AI analysis',
      viralScore: selection.viralScore || 5
    }
  } catch (error: any) {
    console.error('❌ Error selecting thumbnail frame:', error)
    
    // Fallback: use first frame with image
    const firstFrame = framesWithImages[0]
    return {
      frameId: firstFrame.frame.id || 'frame-0',
      sceneNumber: firstFrame.sceneNumber,
      frameImage: firstFrame.imageUrl,
      reason: 'Fallback: First available frame',
      viralScore: 3
    }
  }
}



