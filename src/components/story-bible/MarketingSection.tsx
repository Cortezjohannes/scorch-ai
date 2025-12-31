'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CollapsibleSection from '@/components/ui/CollapsibleSection'
import { VideoPlayer } from '@/components/VideoPlayer'

interface MarketingSectionProps {
  storyBible: any
  theme: 'light' | 'dark'
  onUpdate?: (updatedStoryBible: any) => Promise<void>
}

export default function MarketingSection({ storyBible, theme, onUpdate }: MarketingSectionProps) {
  const prefix = theme === 'dark' ? 'dark' : 'light'
  const marketing = storyBible?.marketing || {}
  const [activePlatform, setActivePlatform] = useState<'tiktok' | 'instagram' | 'youtube'>('tiktok')
  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItem(itemId)
      setTimeout(() => setCopiedItem(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const CopyButton = ({ text, itemId, label }: { text: string; itemId: string; label?: string }) => (
    <button
      onClick={() => copyToClipboard(text, itemId)}
      className={`ml-2 px-2 py-1 text-xs rounded ${prefix}-bg-primary ${prefix}-text-secondary hover:${prefix}-bg-accent hover:${prefix}-text-accent transition-colors`}
      title="Copy to clipboard"
    >
      {copiedItem === itemId ? '✓ Copied' : '📋 Copy'}
    </button>
  )

  const handleGenerateMarketing = async () => {
    if (!storyBible || !onUpdate) {
      alert('Unable to generate marketing: Story bible or update function not available')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate/marketing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          storyBible
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to generate marketing: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success && data.marketing) {
        // Clean marketing data to ensure Firestore compatibility
        // Remove any circular references or invalid nested entities
        const cleanMarketing = JSON.parse(JSON.stringify(data.marketing))
        let cleanVisualAssets = data.visualAssets ? JSON.parse(JSON.stringify(data.visualAssets)) : (storyBible.marketing?.visualAssets || {})
        
        // Validate and upload base64 images from auto-generated templates to Storage
        // CRITICAL: All images must be Storage URLs before saving to Firestore
        if (cleanVisualAssets.platformTemplates) {
          const userId = storyBible.ownerId
          if (userId) {
            const { uploadImageToStorage } = await import('@/services/image-storage-service')
            const { hashPrompt } = await import('@/services/image-cache-service')
            
            // Helper to validate and upload image if needed
            const validateAndUploadImage = async (imageUrl: string, promptText: string, context: string): Promise<string> => {
              // Already a Storage URL - validate format
              if (imageUrl.startsWith('https://firebasestorage.googleapis.com/') ||
                  imageUrl.startsWith('https://storage.googleapis.com/')) {
                return imageUrl // Already valid Storage URL
              }
              
              // Base64 - upload to Storage
              if (imageUrl.startsWith('data:image/')) {
                const hash = await hashPrompt(promptText, undefined, context)
                const storageUrl = await uploadImageToStorage(userId, imageUrl, hash)
                
                // CRITICAL: Verify we got a Storage URL
                if (!storageUrl.startsWith('https://firebasestorage.googleapis.com/') &&
                    !storageUrl.startsWith('https://storage.googleapis.com/')) {
                  throw new Error('Storage upload failed - received invalid URL format')
                }
                
                return storageUrl
              }
              
              // Invalid format
              throw new Error(`Invalid image URL format: ${imageUrl.substring(0, 50)}...`)
            }
            
            // Process character spotlight templates
            if (cleanVisualAssets.platformTemplates.characterSpotlights) {
              for (const spotlight of cleanVisualAssets.platformTemplates.characterSpotlights) {
                if (spotlight.templates) {
                  for (const platform of ['tiktok', 'instagram', 'youtube'] as const) {
                    const template = spotlight.templates[platform]
                    if (template?.imageUrl) {
                      try {
                        const promptText = template.prompt || `character-spotlight-${spotlight.characterName}-${platform}`
                        template.imageUrl = await validateAndUploadImage(template.imageUrl, promptText, 'marketing-template')
                        console.log(`✅ Validated/uploaded ${platform} template for ${spotlight.characterName} to Storage`)
                      } catch (error: any) {
                        console.error(`❌ Failed to validate/upload ${platform} template:`, error)
                        // Remove invalid image to prevent Firestore errors
                        delete template.imageUrl
                      }
                    }
                  }
                }
              }
            }
            
            // Process campaign graphics
            if (cleanVisualAssets.platformTemplates.campaignGraphics) {
              const processGraphics = async (graphics: any[], type: string) => {
                for (const graphic of graphics) {
                  if (graphic?.imageUrl) {
                    try {
                      const promptText = graphic.prompt || `campaign-${type}-${storyBible.seriesTitle || 'graphic'}`
                      graphic.imageUrl = await validateAndUploadImage(graphic.imageUrl, promptText, 'marketing-campaign')
                      console.log(`✅ Validated/uploaded ${type} campaign graphic to Storage`)
                    } catch (error: any) {
                      console.error(`❌ Failed to validate/upload ${type} graphic:`, error)
                      // Remove invalid image to prevent Firestore errors
                      delete graphic.imageUrl
                    }
                  }
                }
              }
              
              if (cleanVisualAssets.platformTemplates.campaignGraphics.launch) {
                await processGraphics(cleanVisualAssets.platformTemplates.campaignGraphics.launch, 'launch')
              }
              if (cleanVisualAssets.platformTemplates.campaignGraphics.milestones) {
                await processGraphics(cleanVisualAssets.platformTemplates.campaignGraphics.milestones, 'milestone')
              }
              if (cleanVisualAssets.platformTemplates.campaignGraphics.arcTransitions) {
                await processGraphics(cleanVisualAssets.platformTemplates.campaignGraphics.arcTransitions, 'arc-transition')
              }
            }
          }
        }
        
        const updatedStoryBible = {
          ...storyBible,
          marketing: {
            ...cleanMarketing,
            visualAssets: cleanVisualAssets
          }
        }
        await onUpdate(updatedStoryBible)
      } else {
        throw new Error('Invalid response from API')
      }
    } catch (error: any) {
      console.error('Error generating marketing:', error)
      alert(`Failed to generate marketing: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  // Check if marketing data exists
  if (!marketing || !marketing.marketingStrategy) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-3xl font-bold ${prefix}-text-primary mb-2`}>Marketing</h2>
            <p className={`text-base ${prefix}-text-secondary mb-8`}>
              Comprehensive marketing strategy for your series, including platform-specific tactics, hooks, and ready-to-use content.
            </p>
          </div>
          {onUpdate && (
            <button
              onClick={handleGenerateMarketing}
              disabled={isGenerating}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                isGenerating
                  ? `${prefix}-bg-primary ${prefix}-text-tertiary cursor-not-allowed`
                  : `bg-gradient-to-r from-[#10B981] to-[#059669] text-white hover:from-[#059669] hover:to-[#047857]`
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>Generate Marketing Strategy</span>
                </>
              )}
            </button>
          )}
        </div>
        <div className={`${prefix}-card ${prefix}-border rounded-lg p-12 text-center`}>
          <div className="text-4xl mb-4">📢</div>
          <h3 className={`text-xl font-bold ${prefix}-text-primary mb-2`}>Marketing Strategy Not Generated</h3>
          <p className={`${prefix}-text-secondary mb-4`}>
            Marketing strategy will be generated automatically when you create your story bible.
          </p>
          {onUpdate && (
            <p className={`text-sm ${prefix}-text-tertiary`}>
              Click the "Generate Marketing Strategy" button above to generate it now.
            </p>
          )}
        </div>
      </div>
    )
  }

  const strategy = marketing.marketingStrategy || {}
  const platformStrategies = marketing.platformStrategies || {}
  const marketingHooks = marketing.marketingHooks || {}
  const distribution = marketing.distribution || {}
  const ugcStrategy = marketing.ugcStrategy || {}
  const peerCastingLoop = marketing.peerCastingLoop || {}
  const kpis = marketing.kpis || {}
  const compliance = marketing.compliance || {}
  const readyToUseContent = marketing.readyToUseContent || {}
  const visualAssets = storyBible.marketing?.visualAssets || storyBible.visualAssets || {}
  const seriesPoster = visualAssets.seriesPoster
  const seriesTeaser = visualAssets.seriesTeaser
  const platformTemplates = visualAssets.platformTemplates
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false)
  const [isGeneratingTeaser, setIsGeneratingTeaser] = useState(false)
  const [isGeneratingTemplates, setIsGeneratingTemplates] = useState(false)
  
  // Log teaser data for debugging when it's loaded
  useEffect(() => {
    if (seriesTeaser) {
      console.log('📹 Series teaser loaded from story bible:', {
        hasVideoUrl: !!seriesTeaser.videoUrl,
        videoUrl: seriesTeaser.videoUrl ? seriesTeaser.videoUrl.substring(0, 80) + '...' : 'missing',
        duration: seriesTeaser.duration,
        aspectRatio: seriesTeaser.aspectRatio,
        generatedAt: seriesTeaser.generatedAt,
        source: seriesTeaser.source
      })
    }
  }, [seriesTeaser])

  const handleGeneratePoster = async () => {
    if (!storyBible || !onUpdate) return
    
    setIsGeneratingPoster(true)
    try {
      const response = await fetch('/api/generate/marketing-poster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyBible,
          marketing,
          userId: storyBible.ownerId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate poster')
      }

      const data = await response.json()
      if (data.success && data.poster) {
        // Validate and ensure Storage URL (generateImageWithStorage should already return Storage URL)
        let imageUrl = data.poster.imageUrl || ''
        
        // CRITICAL: Validate that we have a Storage URL, not base64
        const isStorageUrl = imageUrl.startsWith('https://firebasestorage.googleapis.com/') ||
                           imageUrl.startsWith('https://storage.googleapis.com/')
        
        if (!isStorageUrl && imageUrl.startsWith('data:image/')) {
          // Fallback: Upload base64 to Storage if somehow we got base64
          console.warn('⚠️ Received base64 instead of Storage URL, uploading to Storage...')
          const { uploadImageToStorage } = await import('@/services/image-storage-service')
          const { hashPrompt } = await import('@/services/image-cache-service')
          
          const promptText = data.poster.prompt || `series-poster-${storyBible.seriesTitle || 'poster'}`
          const hash = await hashPrompt(promptText, undefined, 'marketing-poster')
          
          // Upload to Storage using client-side SDK (authenticated user)
          imageUrl = await uploadImageToStorage(storyBible.ownerId, imageUrl, hash)
          console.log('✅ Poster uploaded to Storage:', imageUrl.substring(0, 60) + '...')
        } else if (!isStorageUrl && imageUrl) {
          // Invalid URL format
          throw new Error('Invalid image URL format - must be Firebase Storage URL')
        }
        
        // CRITICAL: Final validation - ensure we have a Storage URL before saving
        if (!imageUrl || (!imageUrl.startsWith('https://firebasestorage.googleapis.com/') && 
                         !imageUrl.startsWith('https://storage.googleapis.com/'))) {
          throw new Error('Cannot save poster: Image must be uploaded to Firebase Storage first (base64 not allowed in Firestore)')
        }
        
        const poster = {
          imageUrl: imageUrl, // Must be Storage URL
          prompt: data.poster.prompt || '',
          generatedAt: data.poster.generatedAt || new Date().toISOString(),
          source: data.poster.source || 'gemini',
          promptVersion: data.poster.promptVersion || '1.0'
        }
        
        const updatedStoryBible = {
          ...storyBible,
          marketing: {
            ...storyBible.marketing,
            visualAssets: {
              ...(storyBible.marketing?.visualAssets || {}),
              seriesPoster: poster
            }
          }
        }
        
        // Deep clone to prevent Firestore nested entity errors
        const cleanStoryBible = JSON.parse(JSON.stringify(updatedStoryBible))
        await onUpdate(cleanStoryBible)
      }
    } catch (error: any) {
      console.error('Error generating poster:', error)
      alert(`Failed to generate poster: ${error.message}`)
    } finally {
      setIsGeneratingPoster(false)
    }
  }

  const handleGenerateTeaser = async () => {
    if (!storyBible || !onUpdate || !marketing) return
    
    setIsGeneratingTeaser(true)
    try {
      // Get episode data if available (for viral moments)
      let episodeData: any[] = []
      try {
        // Try to get episode data from story bible if available
        if (storyBible.narrativeArcs && Array.isArray(storyBible.narrativeArcs)) {
          storyBible.narrativeArcs.forEach((arc: any) => {
            if (arc.episodes && Array.isArray(arc.episodes)) {
              episodeData.push(...arc.episodes.slice(0, 3)) // First 3 episodes
            }
          })
        }
      } catch (error) {
        console.warn('Could not load episode data for teaser:', error)
      }
      
      const response = await fetch('/api/generate/series-teaser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyBible,
          marketing,
          episodeData: episodeData.length > 0 ? episodeData : undefined,
          userId: storyBible.ownerId // Pass userId for Firestore save
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to generate teaser' }))
        throw new Error(errorData.error || 'Failed to generate teaser')
      }

      const data = await response.json()
      if (data.success && data.teaser) {
        // Clean teaser to ensure Firestore compatibility
        const cleanTeaser = JSON.parse(JSON.stringify(data.teaser))
        
        // Verify video URL is present and valid
        if (!cleanTeaser.videoUrl) {
          throw new Error('Teaser generated but video URL is missing')
        }
        
        console.log('✅ Teaser generated successfully:', {
          videoUrl: cleanTeaser.videoUrl.substring(0, 100) + '...',
          duration: cleanTeaser.duration,
          aspectRatio: cleanTeaser.aspectRatio,
          cost: cleanTeaser.cost?.amount
        })
        
        const updatedStoryBible = {
          ...storyBible,
          marketing: {
            ...storyBible.marketing,
            visualAssets: {
              ...(storyBible.marketing?.visualAssets || {}),
              seriesTeaser: cleanTeaser
            }
          }
        }
        
        // Deep clone the entire object before saving to prevent Firestore nested entity errors
        const cleanStoryBible = JSON.parse(JSON.stringify(updatedStoryBible))
        
        console.log('💾 Saving teaser to story bible...')
        await onUpdate(cleanStoryBible)
        console.log('✅ Teaser saved successfully to story bible')
      } else {
        throw new Error(data.error || 'Failed to generate teaser')
      }
    } catch (error: any) {
      console.error('Error generating teaser:', error)
      alert(`Failed to generate teaser: ${error.message}`)
    } finally {
      setIsGeneratingTeaser(false)
    }
  }

  const handleBatchGenerateTemplates = async () => {
    if (!storyBible || !onUpdate) return
    
    setIsGeneratingTemplates(true)
    try {
      const userId = storyBible.ownerId
      if (!userId) {
        throw new Error('User ID is required to generate templates')
      }

      const response = await fetch('/api/generate/marketing-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyBible,
          marketing,
          userId,
          templateTypes: ['characterSpotlights', 'campaignGraphics']
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate templates')
      }

      const data = await response.json()
      if (data.success && data.templates) {
        // Upload base64 images to Storage before saving (same as story bible images)
        const { uploadImageToStorage } = await import('@/services/image-storage-service')
        const { hashPrompt } = await import('@/services/image-cache-service')
        
        const cleanTemplates = JSON.parse(JSON.stringify(data.templates))
        
        // Helper to validate and upload image if needed
        const validateAndUploadImage = async (imageUrl: string, promptText: string, context: string): Promise<string> => {
          // Already a Storage URL - validate format
          if (imageUrl.startsWith('https://firebasestorage.googleapis.com/') ||
              imageUrl.startsWith('https://storage.googleapis.com/')) {
            return imageUrl // Already valid Storage URL
          }
          
          // Base64 - upload to Storage
          if (imageUrl.startsWith('data:image/')) {
            const hash = await hashPrompt(promptText, undefined, context)
            const storageUrl = await uploadImageToStorage(userId, imageUrl, hash)
            
            // CRITICAL: Verify we got a Storage URL
            if (!storageUrl.startsWith('https://firebasestorage.googleapis.com/') &&
                !storageUrl.startsWith('https://storage.googleapis.com/')) {
              throw new Error('Storage upload failed - received invalid URL format')
            }
            
            return storageUrl
          }
          
          // Invalid format
          throw new Error(`Invalid image URL format: ${imageUrl.substring(0, 50)}...`)
        }
        
        // Process character spotlight templates
        if (cleanTemplates.characterSpotlights) {
          for (const spotlight of cleanTemplates.characterSpotlights) {
            if (spotlight.templates) {
              // Process each platform template
              for (const platform of ['tiktok', 'instagram', 'youtube'] as const) {
                const template = spotlight.templates[platform]
                if (template?.imageUrl) {
                  try {
                    const promptText = template.prompt || `character-spotlight-${spotlight.characterName}-${platform}`
                    template.imageUrl = await validateAndUploadImage(template.imageUrl, promptText, 'marketing-template')
                    console.log(`✅ Validated/uploaded ${platform} template for ${spotlight.characterName} to Storage`)
                  } catch (error: any) {
                    console.error(`❌ Failed to validate/upload ${platform} template:`, error)
                    // Remove invalid image to prevent Firestore errors
                    delete template.imageUrl
                  }
                }
              }
            }
          }
        }
        
        // Process campaign graphics
        if (cleanTemplates.campaignGraphics) {
          const processGraphics = async (graphics: any[], type: string) => {
            for (const graphic of graphics) {
              if (graphic?.imageUrl) {
                try {
                  const promptText = graphic.prompt || `campaign-${type}-${storyBible.seriesTitle || 'graphic'}`
                  graphic.imageUrl = await validateAndUploadImage(graphic.imageUrl, promptText, 'marketing-campaign')
                  console.log(`✅ Validated/uploaded ${type} campaign graphic to Storage`)
                } catch (error: any) {
                  console.error(`❌ Failed to validate/upload ${type} graphic:`, error)
                  // Remove invalid image to prevent Firestore errors
                  delete graphic.imageUrl
                }
              }
            }
          }
          
          // Process launch graphics
          if (cleanTemplates.campaignGraphics.launch) {
            await processGraphics(cleanTemplates.campaignGraphics.launch, 'launch')
          }
          
          // Process milestone graphics
          if (cleanTemplates.campaignGraphics.milestones) {
            await processGraphics(cleanTemplates.campaignGraphics.milestones, 'milestone')
          }
          
          // Process arc transition graphics
          if (cleanTemplates.campaignGraphics.arcTransitions) {
            await processGraphics(cleanTemplates.campaignGraphics.arcTransitions, 'arc-transition')
          }
        }
        
        const updatedStoryBible = {
          ...storyBible,
          marketing: {
            ...storyBible.marketing,
            visualAssets: {
              ...(storyBible.marketing?.visualAssets || {}),
              platformTemplates: cleanTemplates
            }
          }
        }
        
        // Deep clone the entire object before saving to prevent Firestore nested entity errors
        const cleanStoryBible = JSON.parse(JSON.stringify(updatedStoryBible))
        await onUpdate(cleanStoryBible)
        console.log('✅ Templates saved to Firestore with Storage URLs')
      }
    } catch (error: any) {
      console.error('Error generating templates:', error)
      alert(`Failed to generate templates: ${error.message}`)
    } finally {
      setIsGeneratingTemplates(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-3xl font-bold ${prefix}-text-primary mb-2`}>Marketing</h2>
          <p className={`text-base ${prefix}-text-secondary mb-8`}>
            Comprehensive marketing strategy for your series, including platform-specific tactics, hooks, and ready-to-use content.
          </p>
        </div>
        {onUpdate && (
          <button
            onClick={handleGenerateMarketing}
            disabled={isGenerating}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              isGenerating
                ? `${prefix}-bg-primary ${prefix}-text-tertiary cursor-not-allowed`
                : `${prefix}-btn-secondary ${prefix}-text-secondary hover:${prefix}-bg-accent hover:${prefix}-text-accent`
            }`}
            title="Regenerate marketing strategy"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span>Regenerating...</span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>Regenerate</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Series Poster Concept */}
      {seriesPoster && (
        <CollapsibleSection
          title="Series Poster Concept"
          isEmptyDefault={false}
          theme={theme}
        >
          <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
            <div className="relative w-full max-w-2xl mx-auto">
              <img
                src={seriesPoster.imageUrl}
                alt={`${storyBible.seriesTitle} Poster`}
                className="w-full h-auto rounded-lg"
              />
              {onUpdate && (
                <button
                  onClick={handleGeneratePoster}
                  disabled={isGeneratingPoster}
                  className={`mt-4 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    isGeneratingPoster
                      ? `${prefix}-bg-primary ${prefix}-text-tertiary cursor-not-allowed`
                      : `${prefix}-btn-secondary ${prefix}-text-secondary hover:${prefix}-bg-accent`
                  }`}
                >
                  {isGeneratingPoster ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span>Regenerating...</span>
                    </>
                  ) : (
                    <>
                      <span>🔄</span>
                      <span>Regenerate Poster Concept</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </CollapsibleSection>
      )}

      {!seriesPoster && onUpdate && (
        <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-1`}>Series Poster Concept</h3>
              <p className={`text-sm ${prefix}-text-secondary`}>Generate a marketing poster concept for your series</p>
            </div>
            <button
              onClick={handleGeneratePoster}
              disabled={isGeneratingPoster}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                isGeneratingPoster
                  ? `${prefix}-bg-primary ${prefix}-text-tertiary cursor-not-allowed`
                  : `bg-gradient-to-r from-[#10B981] to-[#059669] text-white hover:from-[#059669] hover:to-[#047857]`
              }`}
            >
              {isGeneratingPoster ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span>🎨</span>
                  <span>Generate Poster Concept</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Series Teaser Trailer Concept */}
      {seriesTeaser && seriesTeaser.videoUrl && (
        <CollapsibleSection
          title="Series Teaser Trailer Concept"
          isEmptyDefault={false}
          theme={theme}
        >
          <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
            <div className="space-y-4">
              <div className="relative w-full max-w-md mx-auto">
                {seriesTeaser.videoUrl ? (
                  <VideoPlayer
                    videoUrl={seriesTeaser.videoUrl}
                    aspectRatio="9:16"
                    autoPlay={false}
                    loop={true}
                    muted={false}
                    showControls={true}
                    className="rounded-lg"
                  />
                ) : (
                  <div className={`aspect-[9/16] rounded-lg ${prefix}-bg-primary flex items-center justify-center`}>
                    <p className={`${prefix}-text-secondary text-sm`}>Video URL not available</p>
                  </div>
                )}
              </div>
              
              {seriesTeaser.metadata && (
                <div className={`${prefix}-bg-primary rounded-lg p-3 text-sm`}>
                  <div className="space-y-1">
                    {seriesTeaser.metadata.charactersFeatured && seriesTeaser.metadata.charactersFeatured.length > 0 && (
                      <p className={`${prefix}-text-secondary`}>
                        <span className="font-medium">Characters:</span> {seriesTeaser.metadata.charactersFeatured.join(', ')}
                      </p>
                    )}
                    {seriesTeaser.metadata.marketingHooksUsed && seriesTeaser.metadata.marketingHooksUsed.length > 0 && (
                      <p className={`${prefix}-text-secondary`}>
                        <span className="font-medium">Hooks:</span> {seriesTeaser.metadata.marketingHooksUsed.join(', ')}
                      </p>
                    )}
                    {seriesTeaser.cost && (
                      <p className={`${prefix}-text-tertiary text-xs`}>
                        Cost: ${seriesTeaser.cost.amount.toFixed(2)} ({seriesTeaser.cost.mode} mode)
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CollapsibleSection>
      )}

      {!seriesTeaser && onUpdate && marketing && (
        <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-1`}>Series Teaser Trailer Concept</h3>
              <p className={`text-sm ${prefix}-text-secondary`}>
                Generate an 8-second portrait teaser trailer for TikTok and Instagram Stories
              </p>
              <p className={`text-xs ${prefix}-text-tertiary mt-1`}>
                Cost: ~$0.80 (fast mode, 8 seconds)
              </p>
            </div>
            <button
              onClick={handleGenerateTeaser}
              disabled={isGeneratingTeaser || !marketing}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                isGeneratingTeaser || !marketing
                  ? `${prefix}-bg-primary ${prefix}-text-tertiary cursor-not-allowed`
                  : `bg-gradient-to-r from-[#10B981] to-[#059669] text-white hover:from-[#059669] hover:to-[#047857]`
              }`}
            >
              {isGeneratingTeaser ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span>🎬</span>
                  <span>Generate Teaser</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Marketing Strategy Overview */}
      <CollapsibleSection
        title="Marketing Strategy Overview"
        isEmptyDefault={false}
        theme={theme}
      >
        <div className="space-y-4">
          <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
            <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-2`}>Primary Approach</h3>
            <p className={`${prefix}-text-secondary`}>{strategy.primaryApproach || 'Not specified'}</p>
          </div>

          <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
            <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Target Audience</h3>
            <div className="space-y-2">
              {strategy.targetAudience?.primary && strategy.targetAudience.primary.length > 0 && (
                <div>
                  <p className={`text-sm font-medium ${prefix}-text-primary mb-1`}>Primary:</p>
                  <div className="flex flex-wrap gap-2">
                    {strategy.targetAudience.primary.map((audience: string, idx: number) => (
                      <span key={idx} className={`px-3 py-1 rounded-full text-sm ${prefix}-bg-accent ${prefix}-text-accent`}>
                        {audience}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {strategy.targetAudience?.secondary && strategy.targetAudience.secondary.length > 0 && (
                <div>
                  <p className={`text-sm font-medium ${prefix}-text-primary mb-1`}>Secondary:</p>
                  <div className="flex flex-wrap gap-2">
                    {strategy.targetAudience.secondary.map((audience: string, idx: number) => (
                      <span key={idx} className={`px-3 py-1 rounded-full text-sm ${prefix}-bg-primary ${prefix}-text-secondary`}>
                        {audience}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {strategy.targetAudience?.persona && (
                <div className="mt-3">
                  <p className={`text-sm ${prefix}-text-secondary`}>{strategy.targetAudience.persona}</p>
                </div>
              )}
            </div>
          </div>

          <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
            <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-2`}>Key Selling Points</h3>
            <ul className="space-y-2">
              {strategy.keySellingPoints && strategy.keySellingPoints.length > 0 ? (
                strategy.keySellingPoints.map((point: string, idx: number) => (
                  <li key={idx} className={`flex items-start ${prefix}-text-secondary`}>
                    <span className="mr-2">•</span>
                    <span>{point}</span>
                  </li>
                ))
              ) : (
                <li className={`${prefix}-text-tertiary`}>No selling points specified</li>
              )}
            </ul>
          </div>

          <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
            <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-2`}>Unique Value Proposition</h3>
            <p className={`${prefix}-text-secondary`}>{strategy.uniqueValueProposition || 'Not specified'}</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Platform Strategies */}
      <CollapsibleSection
        title="Platform-Specific Strategies"
        isEmptyDefault={false}
        theme={theme}
      >
        <div className="space-y-4">
          {/* Platform Tabs */}
          <div className={`flex gap-2 border-b ${prefix}-border`}>
            {['tiktok', 'instagram', 'youtube'].map((platform) => (
              <button
                key={platform}
                onClick={() => setActivePlatform(platform as 'tiktok' | 'instagram' | 'youtube')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activePlatform === platform
                    ? `${prefix}-text-accent border-b-2 border-[#10B981]`
                    : `${prefix}-text-tertiary hover:${prefix}-text-secondary`
                }`}
              >
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </button>
            ))}
          </div>

          {/* Platform Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activePlatform}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {platformStrategies[activePlatform] && (
                <>
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-2`}>Content Format</h3>
                    <p className={`${prefix}-text-secondary`}>{platformStrategies[activePlatform].contentFormat || 'Not specified'}</p>
                  </div>

                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-2`}>Posting Schedule</h3>
                    <p className={`${prefix}-text-secondary`}>{platformStrategies[activePlatform].postingSchedule || 'Not specified'}</p>
                  </div>

                  {platformStrategies[activePlatform].hashtagStrategy && platformStrategies[activePlatform].hashtagStrategy.length > 0 && (
                    <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                      <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-2`}>Hashtag Strategy</h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {platformStrategies[activePlatform].hashtagStrategy.map((tag: string, idx: number) => (
                          <span key={idx} className={`px-3 py-1 rounded-full text-sm ${prefix}-bg-primary ${prefix}-text-secondary`}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <CopyButton
                        text={platformStrategies[activePlatform].hashtagStrategy.map((t: string) => `#${t}`).join(' ')}
                        itemId={`${activePlatform}-hashtags`}
                      />
                    </div>
                  )}

                  {platformStrategies[activePlatform].contentIdeas && platformStrategies[activePlatform].contentIdeas.length > 0 && (
                    <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                      <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-2`}>Content Ideas</h3>
                      <ul className="space-y-2">
                        {platformStrategies[activePlatform].contentIdeas.map((idea: string, idx: number) => (
                          <li key={idx} className={`flex items-start ${prefix}-text-secondary`}>
                            <span className="mr-2">•</span>
                            <span>{idea}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Ready-to-Use Content */}
                  {readyToUseContent[activePlatform] && (
                    <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                      <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Ready-to-Use Posts</h3>
                      {readyToUseContent[activePlatform].captions && readyToUseContent[activePlatform].captions.length > 0 && (
                        <div className="space-y-3 mb-4">
                          {readyToUseContent[activePlatform].captions.map((caption: string, idx: number) => (
                            <div key={idx} className={`${prefix}-bg-primary rounded-lg p-3`}>
                              <p className={`${prefix}-text-secondary mb-2`}>{caption}</p>
                              <div className="flex items-center gap-2">
                                <CopyButton text={caption} itemId={`${activePlatform}-caption-${idx}`} />
                                {readyToUseContent[activePlatform].hashtags && readyToUseContent[activePlatform].hashtags.length > 0 && (
                                  <CopyButton 
                                    text={readyToUseContent[activePlatform].hashtags.map((t: string) => `#${t}`).join(' ')} 
                                    itemId={`${activePlatform}-hashtags-${idx}`}
                                    label="Copy Hashtags"
                                  />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {readyToUseContent[activePlatform].templates && readyToUseContent[activePlatform].templates.length > 0 && (
                        <div className="mt-4">
                          <h4 className={`text-md font-semibold ${prefix}-text-primary mb-2`}>Post Templates</h4>
                          <ul className="space-y-2">
                            {readyToUseContent[activePlatform].templates.map((template: string, idx: number) => (
                              <li key={idx} className={`flex items-start justify-between ${prefix}-text-secondary`}>
                                <span className="flex-1">• {template}</span>
                                <CopyButton text={template} itemId={`${activePlatform}-template-${idx}`} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </CollapsibleSection>

      {/* Marketing Hooks */}
      <CollapsibleSection
        title="Marketing Hooks"
        isEmptyDefault={true}
        theme={theme}
      >
        <div className="space-y-4">
          {marketingHooks.episodeHooks && marketingHooks.episodeHooks.length > 0 && (
            <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
              <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-2`}>Episode Hooks</h3>
              <ul className="space-y-2">
                {marketingHooks.episodeHooks.map((hook: string, idx: number) => (
                  <li key={idx} className={`flex items-start justify-between ${prefix}-text-secondary`}>
                    <div className="flex-1">
                      <span className="mr-2">•</span>
                      <span>{hook}</span>
                    </div>
                    {marketing.hookVariations?.episodeHooks?.[hook] && (
                      <div className="ml-4">
                        <details className="text-sm">
                          <summary className={`cursor-pointer ${prefix}-text-accent hover:${prefix}-text-primary`}>
                            Variations ({marketing.hookVariations.episodeHooks[hook].length})
                          </summary>
                          <ul className="mt-2 space-y-1 pl-4">
                            {marketing.hookVariations.episodeHooks[hook].map((variation: string, vIdx: number) => (
                              <li key={vIdx} className={`${prefix}-text-tertiary text-xs`}>
                                • {variation}
                                <CopyButton text={variation} itemId={`episode-hook-${idx}-var-${vIdx}`} />
                              </li>
                            ))}
                          </ul>
                        </details>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {marketingHooks.seriesHooks && marketingHooks.seriesHooks.length > 0 && (
            <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
              <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-2`}>Series Hooks</h3>
              <ul className="space-y-2">
                {marketingHooks.seriesHooks.map((hook: string, idx: number) => (
                  <li key={idx} className={`flex items-start justify-between ${prefix}-text-secondary`}>
                    <div className="flex-1">
                      <span className="mr-2">•</span>
                      <span>{hook}</span>
                    </div>
                    {marketing.hookVariations?.seriesHooks?.[hook] && (
                      <div className="ml-4">
                        <details className="text-sm">
                          <summary className={`cursor-pointer ${prefix}-text-accent hover:${prefix}-text-primary`}>
                            Variations ({marketing.hookVariations.seriesHooks[hook].length})
                          </summary>
                          <ul className="mt-2 space-y-1 pl-4">
                            {marketing.hookVariations.seriesHooks[hook].map((variation: string, vIdx: number) => (
                              <li key={vIdx} className={`${prefix}-text-tertiary text-xs`}>
                                • {variation}
                                <CopyButton text={variation} itemId={`series-hook-${idx}-var-${vIdx}`} />
                              </li>
                            ))}
                          </ul>
                        </details>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {marketingHooks.characterHooks && marketingHooks.characterHooks.length > 0 && (
            <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
              <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-2`}>Character Hooks</h3>
              <ul className="space-y-2">
                {marketingHooks.characterHooks.map((hook: string, idx: number) => (
                  <li key={idx} className={`flex items-start justify-between ${prefix}-text-secondary`}>
                    <div className="flex-1">
                      <span className="mr-2">•</span>
                      <span>{hook}</span>
                    </div>
                    {marketing.hookVariations?.characterHooks?.[hook] && (
                      <div className="ml-4">
                        <details className="text-sm">
                          <summary className={`cursor-pointer ${prefix}-text-accent hover:${prefix}-text-primary`}>
                            Variations ({marketing.hookVariations.characterHooks[hook].length})
                          </summary>
                          <ul className="mt-2 space-y-1 pl-4">
                            {marketing.hookVariations.characterHooks[hook].map((variation: string, vIdx: number) => (
                              <li key={vIdx} className={`${prefix}-text-tertiary text-xs`}>
                                • {variation}
                                <CopyButton text={variation} itemId={`character-hook-${idx}-var-${vIdx}`} />
                              </li>
                            ))}
                          </ul>
                        </details>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Distribution Timeline */}
      <CollapsibleSection
        title="Distribution Timeline"
        isEmptyDefault={true}
        theme={theme}
      >
        <div className="space-y-4">
          {distribution.preLaunch && distribution.preLaunch.length > 0 && (
            <div className={`${prefix}-card ${prefix}-border rounded-lg p-4 border-l-4 border-[#10B981]`}>
              <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-2`}>Pre-Launch (4 Weeks Out)</h3>
              <ul className="space-y-2">
                {distribution.preLaunch.map((tactic: string, idx: number) => (
                  <li key={idx} className={`flex items-start ${prefix}-text-secondary`}>
                    <span className="mr-2">•</span>
                    <span>{tactic}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {distribution.launch && distribution.launch.length > 0 && (
            <div className={`${prefix}-card ${prefix}-border rounded-lg p-4 border-l-4 border-[#10B981]`}>
              <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-2`}>Launch (Week 0)</h3>
              <ul className="space-y-2">
                {distribution.launch.map((tactic: string, idx: number) => (
                  <li key={idx} className={`flex items-start ${prefix}-text-secondary`}>
                    <span className="mr-2">•</span>
                    <span>{tactic}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {distribution.postLaunch && distribution.postLaunch.length > 0 && (
            <div className={`${prefix}-card ${prefix}-border rounded-lg p-4 border-l-4 border-[#10B981]`}>
              <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-2`}>Post-Launch (Ongoing)</h3>
              <ul className="space-y-2">
                {distribution.postLaunch.map((tactic: string, idx: number) => (
                  <li key={idx} className={`flex items-start ${prefix}-text-secondary`}>
                    <span className="mr-2">•</span>
                    <span>{tactic}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* UGC Strategy */}
      <CollapsibleSection
        title="UGC Strategy"
        isEmptyDefault={true}
        theme={theme}
      >
        <div className="space-y-4">
          {ugcStrategy.actorMarketing && ugcStrategy.actorMarketing.length > 0 && (
            <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
              <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-2`}>Actor Marketing</h3>
              <ul className="space-y-2">
                {ugcStrategy.actorMarketing.map((tactic: string, idx: number) => (
                  <li key={idx} className={`flex items-start ${prefix}-text-secondary`}>
                    <span className="mr-2">•</span>
                    <span>{tactic}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {ugcStrategy.authenticityMaintenance && ugcStrategy.authenticityMaintenance.length > 0 && (
            <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
              <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-2`}>Authenticity Maintenance</h3>
              <ul className="space-y-2">
                {ugcStrategy.authenticityMaintenance.map((tip: string, idx: number) => (
                  <li key={idx} className={`flex items-start ${prefix}-text-secondary`}>
                    <span className="mr-2">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {ugcStrategy.communityBuilding && ugcStrategy.communityBuilding.length > 0 && (
            <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
              <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-2`}>Community Building</h3>
              <ul className="space-y-2">
                {ugcStrategy.communityBuilding.map((tactic: string, idx: number) => (
                  <li key={idx} className={`flex items-start ${prefix}-text-secondary`}>
                    <span className="mr-2">•</span>
                    <span>{tactic}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Peer Casting Loop */}
      {peerCastingLoop.strategy && (
        <CollapsibleSection
          title="Peer Casting Loop"
          isEmptyDefault={true}
          theme={theme}
        >
          <div className="space-y-4">
            <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
              <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-2`}>Strategy</h3>
              <p className={`${prefix}-text-secondary`}>{peerCastingLoop.strategy}</p>
            </div>

            {peerCastingLoop.marketingDeliverables && peerCastingLoop.marketingDeliverables.length > 0 && (
              <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-2`}>Marketing Deliverables</h3>
                <ul className="space-y-2">
                  {peerCastingLoop.marketingDeliverables.map((deliverable: string, idx: number) => (
                    <li key={idx} className={`flex items-start ${prefix}-text-secondary`}>
                      <span className="mr-2">•</span>
                      <span>{deliverable}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* KPIs */}
      {(kpis.completionRate || kpis.velocity || kpis.shareRatio) && (
        <CollapsibleSection
          title="KPIs & Metrics"
          isEmptyDefault={true}
          theme={theme}
        >
          <div className="grid md:grid-cols-2 gap-4">
            {kpis.completionRate && (
              <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-2`}>Completion Rate</h3>
                <p className={`text-2xl font-bold ${prefix}-text-accent mb-1`}>{kpis.completionRate.target || '>40%'}</p>
                <p className={`text-sm ${prefix}-text-tertiary`}>{kpis.completionRate.measurement || 'Track completion rate'}</p>
              </div>
            )}

            {kpis.velocity && (
              <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-2`}>Velocity</h3>
                <p className={`text-2xl font-bold ${prefix}-text-accent mb-1`}>{kpis.velocity.target || '>1,000 views/Hour 1'}</p>
                <p className={`text-sm ${prefix}-text-tertiary`}>{kpis.velocity.measurement || 'Maximize first-hour velocity'}</p>
              </div>
            )}

            {kpis.shareRatio && (
              <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-2`}>Share Ratio</h3>
                <p className={`text-2xl font-bold ${prefix}-text-accent mb-1`}>{kpis.shareRatio.target || '>1.5%'}</p>
                <p className={`text-sm ${prefix}-text-tertiary`}>{kpis.shareRatio.measurement || 'Encourage sharing'}</p>
              </div>
            )}

            {kpis.seriesConversion && (
              <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-2`}>Series Conversion</h3>
                <p className={`text-2xl font-bold ${prefix}-text-accent mb-1`}>{kpis.seriesConversion.target || '>20%'}</p>
                <p className={`text-sm ${prefix}-text-tertiary`}>{kpis.seriesConversion.measurement || 'Ep 1 to Ep 2 conversion'}</p>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Platform Templates */}
      <CollapsibleSection
        title="Visual Templates"
        isEmptyDefault={true}
        theme={theme}
      >
        <div className="space-y-4">
          {platformTemplates && (
            <>
              {/* Character Spotlights */}
              {platformTemplates.characterSpotlights && platformTemplates.characterSpotlights.length > 0 && (
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-4`}>Character Spotlight Cards</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {platformTemplates.characterSpotlights.map((spotlight: any, idx: number) => (
                      <div key={idx} className="space-y-2">
                        <h4 className={`text-md font-medium ${prefix}-text-primary`}>{spotlight.characterName}</h4>
                        <div className="space-y-2">
                          {spotlight.templates?.instagram && (
                            <div>
                              <p className={`text-xs ${prefix}-text-tertiary mb-1`}>Instagram</p>
                              <img
                                src={spotlight.templates.instagram.imageUrl}
                                alt={`${spotlight.characterName} Instagram Spotlight`}
                                className="w-full rounded-lg"
                              />
                            </div>
                          )}
                          {spotlight.templates?.tiktok && (
                            <div>
                              <p className={`text-xs ${prefix}-text-tertiary mb-1`}>TikTok</p>
                              <img
                                src={spotlight.templates.tiktok.imageUrl}
                                alt={`${spotlight.characterName} TikTok Spotlight`}
                                className="w-full rounded-lg"
                              />
                            </div>
                          )}
                          {spotlight.templates?.youtube && (
                            <div>
                              <p className={`text-xs ${prefix}-text-tertiary mb-1`}>YouTube</p>
                              <img
                                src={spotlight.templates.youtube.imageUrl}
                                alt={`${spotlight.characterName} YouTube Spotlight`}
                                className="w-full rounded-lg"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Campaign Graphics */}
              {platformTemplates.campaignGraphics && (
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-4`}>Campaign Graphics</h3>
                  <div className="space-y-4">
                    {platformTemplates.campaignGraphics.launch && platformTemplates.campaignGraphics.launch.length > 0 && (
                      <div>
                        <h4 className={`text-md font-medium ${prefix}-text-primary mb-2`}>Launch Graphics</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {platformTemplates.campaignGraphics.launch.map((graphic: any, idx: number) => (
                            <img
                              key={idx}
                              src={graphic.imageUrl}
                              alt="Launch Campaign Graphic"
                              className="w-full rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {platformTemplates.campaignGraphics.milestones && platformTemplates.campaignGraphics.milestones.length > 0 && (
                      <div>
                        <h4 className={`text-md font-medium ${prefix}-text-primary mb-2`}>Milestone Graphics</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {platformTemplates.campaignGraphics.milestones.map((graphic: any, idx: number) => (
                            <img
                              key={idx}
                              src={graphic.imageUrl}
                              alt="Milestone Campaign Graphic"
                              className="w-full rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {platformTemplates.campaignGraphics.arcTransitions && platformTemplates.campaignGraphics.arcTransitions.length > 0 && (
                      <div>
                        <h4 className={`text-md font-medium ${prefix}-text-primary mb-2`}>Arc Transition Graphics</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {platformTemplates.campaignGraphics.arcTransitions.map((graphic: any, idx: number) => (
                            <img
                              key={idx}
                              src={graphic.imageUrl}
                              alt="Arc Transition Campaign Graphic"
                              className="w-full rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {(!platformTemplates || (!platformTemplates.characterSpotlights?.length && !platformTemplates.campaignGraphics)) && (
            <div className={`${prefix}-card ${prefix}-border rounded-lg p-4 text-center`}>
              <p className={`${prefix}-text-secondary mb-4`}>No templates generated yet</p>
              {onUpdate && (
                <button
                  onClick={handleBatchGenerateTemplates}
                  disabled={isGeneratingTemplates}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto ${
                    isGeneratingTemplates
                      ? `${prefix}-bg-primary ${prefix}-text-tertiary cursor-not-allowed`
                      : `bg-gradient-to-r from-[#10B981] to-[#059669] text-white hover:from-[#059669] hover:to-[#047857]`
                  }`}
                >
                  {isGeneratingTemplates ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <span>🎨</span>
                      <span>Batch Generate All Templates</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {platformTemplates && onUpdate && (
            <div className="flex justify-end">
              <button
                onClick={handleBatchGenerateTemplates}
                disabled={isGeneratingTemplates}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  isGeneratingTemplates
                    ? `${prefix}-bg-primary ${prefix}-text-tertiary cursor-not-allowed`
                    : `${prefix}-btn-secondary ${prefix}-text-secondary hover:${prefix}-bg-accent`
                }`}
              >
                {isGeneratingTemplates ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Regenerating...</span>
                  </>
                ) : (
                  <>
                    <span>🔄</span>
                    <span>Regenerate All Templates</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Compliance */}
      {(compliance.aiDisclosure || compliance.ipOwnership) && (
        <CollapsibleSection
          title="Compliance & Legal"
          isEmptyDefault={true}
          theme={theme}
        >
          <div className="space-y-4">
            {compliance.aiDisclosure && (
              <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-2`}>AI Disclosure</h3>
                <p className={`${prefix}-text-secondary`}>{compliance.aiDisclosure}</p>
              </div>
            )}

            {compliance.ipOwnership && (
              <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-2`}>IP Ownership Communication</h3>
                <p className={`${prefix}-text-secondary`}>{compliance.ipOwnership}</p>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}
    </div>
  )
}

