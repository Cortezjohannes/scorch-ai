'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import type { EpisodePreProductionData } from '@/types/preproduction'
import { subscribeToPreProduction, updatePreProduction } from '@/services/preproduction-firestore'
import { getEpisode } from '@/services/episode-service'
import { getStoryBible } from '@/services/story-bible-service'
import { ExportToolbar } from './shared/ExportToolbar'
import { GenerationProgressOverlay, type GenerationStep } from './shared/GenerationProgressOverlay'
import { generateAllStoryboardImages, type GenerateImageProgress, type GenerateImageOptions } from '@/services/storyboard-image-generation-service'
import type { StoryboardsData } from '@/types/preproduction'

// Episode-specific Tab Components
import { ScriptsTab } from './tabs/ScriptsTab'
import { ScriptBreakdownTab } from './tabs/ScriptBreakdownTab'
import { StoryboardsTab } from './tabs/StoryboardsTab'
import { ShotListTab } from './tabs/ShotListTab'
import { EpisodeMarketingTab } from './tabs/EpisodeMarketingTab'

type EpisodeTabType = 
  | 'scripts'
  | 'breakdown'
  | 'storyboards'
  | 'shotlist'
  | 'marketing'

const EPISODE_TABS = [
  { id: 'scripts', label: 'Script', icon: '📝', description: 'Formatted screenplay' },
  { id: 'breakdown', label: 'Breakdown', icon: '📋', description: 'Scene analysis' },
  { id: 'storyboards', label: 'Storyboards', icon: '🖼️', description: 'Visual plan' },
  { id: 'shotlist', label: 'Shot List', icon: '🎬', description: 'Camera shots' },
  { id: 'marketing', label: 'Marketing', icon: '📢', description: 'Episode marketing strategy' }
] as const

interface EpisodePreProductionShellProps {
  preProductionId: string
  userId: string
  storyBibleId: string
  episodeNumber: number
  onBack?: () => void
}

export function EpisodePreProductionShell({ 
  preProductionId, 
  userId, 
  storyBibleId,
  episodeNumber,
  onBack 
}: EpisodePreProductionShellProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<EpisodeTabType>('scripts')
  const [preProductionData, setPreProductionData] = useState<EpisodePreProductionData | null>(null)
  const [episodeData, setEpisodeData] = useState<any>(null)
  const [storyBible, setStoryBible] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  // Auto-generation state
  const [isAutoGenerating, setIsAutoGenerating] = useState(false)
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([])
  const [currentGenerationStep, setCurrentGenerationStep] = useState<string | undefined>()
  const [generationProgress, setGenerationProgress] = useState(0)
  
  // Background image generation state
  const [isGeneratingImagesInBackground, setIsGeneratingImagesInBackground] = useState(false)
  const [backgroundImageProgress, setBackgroundImageProgress] = useState<{ current: number; total: number } | null>(null)
  
  // Ref to track latest storyboards data for concurrent frame updates
  // This prevents race conditions where one update overwrites another
  const latestStoryboardsRef = useRef<StoryboardsData | null>(null)
  
  // Lock to ensure frame updates are sequential (prevents race conditions)
  const frameUpdateLock = useRef<Promise<void>>(Promise.resolve())
  
  // Track when we just saved to prevent subscription from overwriting
  const justSavedRef = useRef<{ timestamp: number; frameIds: Set<string> } | null>(null)

  // Load episode data and story bible for tabs that need it
  useEffect(() => {
    const loadEpisodeData = async () => {
      if (!storyBibleId || !episodeNumber || !user?.id) return

      try {
        // Load episode
        const episode = await getEpisode(storyBibleId, episodeNumber, user.id)
        if (episode) {
          setEpisodeData(episode)
        }

        // Load story bible
        const bible = await getStoryBible(storyBibleId, user.id)
        if (bible) {
          setStoryBible(bible)
        }
      } catch (error) {
        console.error('Error loading episode data:', error)
      }
    }

    loadEpisodeData()
  }, [storyBibleId, episodeNumber, user?.id])

  // Helper function to safely format date for logging
  const safeDateString = (timestamp: number | string | undefined | null): string => {
    if (!timestamp || timestamp === 0) return 'none'
    try {
      const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp)
      if (isNaN(date.getTime())) return 'invalid'
      return date.toISOString()
    } catch {
      return 'invalid'
    }
  }

  // Helper function to count images in pre-production data
  const countImagesInPreProduction = (data: EpisodePreProductionData | null): number => {
    if (!data?.storyboards?.scenes) return 0
    return data.storyboards.scenes.reduce((sum, scene) => 
      sum + (scene.frames || []).filter(f => f.frameImage).length, 0
    )
  }
  
  // Helper function to verify images are loaded
  const verifyImagesLoaded = async (data: EpisodePreProductionData): Promise<boolean> => {
    if (!data.storyboards?.scenes) {
      console.log('🖼️  No storyboards to verify images')
      return true // No images to verify
    }
    
    const imageUrls: string[] = []
    data.storyboards.scenes.forEach((scene: any) => {
      scene.frames?.forEach((frame: any) => {
        if (frame.frameImage) {
          imageUrls.push(frame.frameImage)
        }
      })
    })
    
    if (imageUrls.length === 0) {
      console.log('🖼️  No images to verify')
      return true // No images to verify
    }
    
    console.log(`🖼️  Verifying ${imageUrls.length} images are loaded...`)
    
    // Overall timeout: wait max 10 seconds total for all images
    const overallTimeout = new Promise<boolean>((resolve) => {
      setTimeout(() => {
        console.warn(`⏱️  Overall image verification timeout after 10s (${imageUrls.length} images)`)
        resolve(true) // Don't block loading indefinitely
      }, 10000)
    })
    
    // Verify each image is accessible (for Storage URLs) or valid (for base64)
    const verifyPromises = imageUrls.map((url, index) => {
      return new Promise<boolean>((resolve) => {
        if (url.startsWith('data:')) {
          // Base64 images are already in memory, consider them loaded immediately
          console.log(`✅ Image ${index + 1}/${imageUrls.length} (base64) verified instantly`)
          resolve(true)
        } else if (url.startsWith('https://') || url.startsWith('http://')) {
          // Verify external/Storage URLs are accessible
          const img = new Image()
          const timeout = setTimeout(() => {
            console.warn(`⏱️  Image ${index + 1}/${imageUrls.length} verification timeout after 3s: ${url.substring(0, 50)}...`)
            resolve(true) // Don't block loading on timeout
          }, 3000) // 3 second timeout per image
          
          img.onload = () => {
            clearTimeout(timeout)
            console.log(`✅ Image ${index + 1}/${imageUrls.length} verified: ${url.substring(0, 50)}...`)
            resolve(true)
          }
          
          img.onerror = () => {
            clearTimeout(timeout)
            console.warn(`⚠️  Image ${index + 1}/${imageUrls.length} failed to load: ${url.substring(0, 50)}...`)
            resolve(true) // Continue anyway, don't block
          }
          
          img.src = url
        } else {
          resolve(true) // Unknown format, assume OK
        }
      })
    })
    
    // Race between image verification and overall timeout
    const allVerified = Promise.all(verifyPromises).then(results => {
      const allLoaded = results.every(Boolean)
      if (allLoaded) {
        console.log(`✅ All ${imageUrls.length} images verified as loaded`)
      } else {
        console.warn(`⚠️  Some images may not have loaded, but continuing anyway`)
      }
      return true
    })
    
    await Promise.race([allVerified, overallTimeout])
    return true // Always return true to not block loading indefinitely
  }

  // Subscribe to real-time updates
  useEffect(() => {
    if (!preProductionId || !userId || !storyBibleId) {
      console.log('⏳ Waiting for preProductionId, userId, or storyBibleId...', {
        hasPreProductionId: !!preProductionId,
        hasUserId: !!userId,
        hasStoryBibleId: !!storyBibleId
      })
      return
    }

    setIsLoading(true)
    
    console.log('👂 Setting up subscription to pre-production document:', {
      preProductionId: preProductionId.substring(0, 20) + '...',
      userId: userId.substring(0, 8) + '...',
      storyBibleId,
      episodeNumber
    })
    
    const unsubscribe = subscribeToPreProduction(userId, storyBibleId, preProductionId, async (data) => {
      // Ensure it's episode type
      if (data && data.type === 'episode') {
        const episodeData = data as EpisodePreProductionData
        
        // CRITICAL: Check if this data is actually newer than what we have
        // Prevent overwriting with stale or empty data
        const currentData = preProductionData
        const incomingLastUpdated = episodeData.lastUpdated || 0
        const currentLastUpdated = currentData?.lastUpdated || 0
        
        // Helper function to safely format date for logging
        const safeDateString = (timestamp: number | string | undefined | null): string => {
          if (!timestamp || timestamp === 0) return 'none'
          try {
            const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp)
            if (isNaN(date.getTime())) return 'invalid'
            return date.toISOString()
          } catch {
            return 'invalid'
          }
        }
        
        // Count images before and after to detect loss
        const imageCountBefore = countImagesInPreProduction(currentData)
        const imageCountAfter = countImagesInPreProduction(episodeData)
        
        // CRITICAL: Check if we just saved frames - don't overwrite with stale subscription data
        const justSaved = justSavedRef.current
        const timeSinceSave = justSaved ? Date.now() - justSaved.timestamp : Infinity
        const recentlySavedFrames = justSaved && timeSinceSave < 10000 // 10 seconds
        
        // Check if any recently saved frames are in the incoming data
        let hasRecentlySavedFrames = false
        if (recentlySavedFrames && episodeData.storyboards) {
          const savedFrameIds = Array.from(justSaved!.frameIds)
          episodeData.storyboards.scenes?.forEach((scene: any) => {
            scene.frames?.forEach((frame: any) => {
              if (savedFrameIds.includes(frame.id)) {
                const hasImage = frame.frameImage && 
                                 (frame.frameImage.startsWith('https://firebasestorage.googleapis.com/') || 
                                  frame.frameImage.startsWith('https://storage.googleapis.com/'))
                if (hasImage) {
                  hasRecentlySavedFrames = true
                  console.log(`✅ [EpisodePreProductionShell] Subscription received recently saved frame ${frame.id} with Storage URL`)
                } else {
                  console.warn(`⚠️ [EpisodePreProductionShell] Subscription received recently saved frame ${frame.id} but WITHOUT Storage URL!`)
                }
              }
            })
          })
        }
        
        // Only update if incoming data is newer OR if we don't have data yet
        if (!currentData || incomingLastUpdated >= currentLastUpdated) {
          console.log('📥 [EpisodePreProductionShell] Updating with Firestore data:', {
            incomingLastUpdated: safeDateString(incomingLastUpdated),
            currentLastUpdated: safeDateString(currentLastUpdated),
            hasScripts: !!(episodeData as any).scripts,
            hasBreakdown: !!episodeData.scriptBreakdown,
            hasStoryboards: !!episodeData.storyboards,
            storyboardScenes: episodeData.storyboards?.scenes?.length || 0,
            imageCountBefore,
            imageCountAfter,
            recentlySavedFrames,
            hasRecentlySavedFrames,
            timeSinceSave: timeSinceSave < Infinity ? `${timeSinceSave}ms` : 'N/A'
          })
          
          // CRITICAL: If we just saved frames but subscription doesn't have them, DON'T UPDATE
          if (recentlySavedFrames && !hasRecentlySavedFrames) {
            console.warn(`⚠️ [EpisodePreProductionShell] Just saved frames but subscription doesn't have them yet - skipping update to prevent overwrite`)
            console.warn(`⚠️ [EpisodePreProductionShell] Saved frame IDs:`, Array.from(justSaved!.frameIds))
            return // Don't overwrite with stale data
          }
          
          // CRITICAL: Validate we didn't lose images
          if (imageCountBefore > 0 && imageCountAfter < imageCountBefore) {
            console.error(`❌ [EpisodePreProductionShell] IMAGE LOSS DETECTED: Had ${imageCountBefore} images, now have ${imageCountAfter}`)
            // Don't update if we're losing images and Firestore has fewer
            if (imageCountAfter === 0 && imageCountBefore > 0) {
              console.warn(`⚠️ [EpisodePreProductionShell] Firestore has no images, keeping current data to prevent loss`)
              return // Don't update
            }
          }
          
          // Log storyboards data if present
          if (episodeData.storyboards) {
            const storyboards = episodeData.storyboards
            let imageCount = 0
            let storageUrlCount = 0
            storyboards.scenes?.forEach((scene: any) => {
              scene.frames?.forEach((frame: any) => {
                if (frame.frameImage) {
                  imageCount++
                  if (frame.frameImage.startsWith('https://firebasestorage.googleapis.com/') || 
                      frame.frameImage.startsWith('https://storage.googleapis.com/')) {
                    storageUrlCount++
                  }
                }
              })
            })
            
            console.log('📥 [EpisodePreProductionShell] Storyboards data received:', {
              scenes: storyboards.scenes?.length || 0,
              totalFrames: storyboards.scenes?.reduce((sum: number, s: any) => sum + (s.frames?.length || 0), 0) || 0,
              framesWithImages: imageCount,
              framesWithStorageUrls: storageUrlCount,
              lastUpdated: storyboards.lastUpdated
            })
          }
          
          // Verify images are loaded before hiding loading state
          console.log('📥 Data received from Firestore, verifying images...')
          await verifyImagesLoaded(episodeData)
          
          setPreProductionData(episodeData)
          // Update ref with latest storyboards data from Firestore subscription
          // Only update if Firestore data is newer or ref is null (to preserve in-flight updates)
          if (episodeData.storyboards) {
            const refData = latestStoryboardsRef.current
            const firestoreLastUpdated = episodeData.storyboards.lastUpdated || 0
            const refLastUpdated = refData?.lastUpdated || 0
            
            // Only update ref if Firestore data is newer or ref is null
            // This preserves any in-flight updates that haven't been saved yet
            if (!refData || firestoreLastUpdated >= refLastUpdated) {
              latestStoryboardsRef.current = episodeData.storyboards
              console.log('🔄 Ref updated from Firestore subscription:', {
                firestoreLastUpdated: new Date(firestoreLastUpdated).toISOString(),
                refLastUpdated: refData ? new Date(refLastUpdated).toISOString() : 'null',
                imagesInFirestore: episodeData.storyboards.scenes?.reduce((sum: number, scene: any) => 
                  sum + (scene.frames || []).filter((f: any) => f.frameImage).length, 0
                ) || 0
              })
            } else {
              console.log('⏭️ Skipping ref update - ref has newer data:', {
                firestoreLastUpdated: new Date(firestoreLastUpdated).toISOString(),
                refLastUpdated: new Date(refLastUpdated).toISOString()
              })
            }
          }
          console.log('✅ Pre-production data set, hiding loading state')
        } else {
          console.log('⏭️ [EpisodePreProductionShell] Skipping update - current data is newer:', {
            incomingLastUpdated: safeDateString(incomingLastUpdated),
            currentLastUpdated: safeDateString(currentLastUpdated)
          })
        }
      } else if (data === null) {
        console.warn('⚠️  [EpisodePreProductionShell] Document does not exist in Firestore. This might be normal if the document was just created.')
        // CRITICAL: Don't set preProductionData to null if we already have data
        // This prevents triggering auto-generation when subscription fires with null
        if (!preProductionData) {
          console.log('ℹ️  No existing preProductionData, will wait for document creation')
        } else {
          console.log('ℹ️  PreProductionData already exists, keeping current data (subscription returned null)')
        }
      }
      
      setIsLoading(false)
      setIsSyncing(false)
    })

    return () => {
      unsubscribe()
    }
  }, [userId, storyBibleId, preProductionId, episodeNumber])

  // Auto-generate when data is empty (only once)
  const hasCheckedAutoGen = React.useRef(false)
  useEffect(() => {
    const checkAndAutoGenerate = async () => {
      if (hasCheckedAutoGen.current || !preProductionData || !episodeData || !storyBible || !user?.id || isAutoGenerating) return
      
      // CRITICAL: Wait a moment for subscription to load data from Firestore
      // This prevents false triggers when data is still loading
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Re-check preProductionData after wait (subscription might have updated it)
      if (!preProductionData) {
        console.log('⏳ Pre-production data still loading, skipping auto-generation check')
        return
      }
      
      // Check if pre-production is completely empty (no data at all)
      // Need to properly check if data exists (not just undefined checks)
      // CRITICAL: Check multiple possible script data structures (including V2 format)
      const scriptsData = (preProductionData as any).scripts
      const hasScript = scriptsData && (
        (scriptsData.fullScript && Object.keys(scriptsData.fullScript).length > 0) ||
        (scriptsData.pages && Array.isArray(scriptsData.pages) && scriptsData.pages.length > 0) ||
        (scriptsData.episodeScripts && Object.keys(scriptsData.episodeScripts).length > 0) ||
        (scriptsData.episodes && Array.isArray(scriptsData.episodes) && scriptsData.episodes.length > 0) || // V2 format
        (typeof scriptsData === 'object' && Object.keys(scriptsData).length > 0 && !Array.isArray(scriptsData))
      )
      
      const breakdownData = preProductionData.scriptBreakdown
      const hasBreakdown = breakdownData && typeof breakdownData === 'object' && Object.keys(breakdownData).length > 0 && (breakdownData.scenes?.length ?? 0) > 0
      
      const hasStoryboards = (preProductionData.storyboards?.scenes?.length ?? 0) > 0
      const hasShotList = (preProductionData.shotList?.scenes?.length ?? 0) > 0
      
      // Check for V2 format data (narrative, props, locations, casting, marketing, postProduction)
      const v2Data = preProductionData as any
      const hasV2Narrative = v2Data.narrative?.episodes?.length > 0
      const hasV2Props = v2Data.props?.episodes?.length > 0
      const hasV2Locations = v2Data.location?.episodes?.length > 0
      const hasV2Casting = v2Data.casting && Object.keys(v2Data.casting).length > 0
      const hasV2Marketing = v2Data.marketing?.episodes?.length > 0
      const hasV2PostProd = v2Data.postProduction?.totalScenes > 0
      
      // Equipment, props, and locations are managed at arc level, not episode level
      
      // CRITICAL: Only check for actual content, not just document existence
      // A document might exist with just metadata but no actual content - that should still trigger generation
      // Only generate if absolutely nothing exists (actual content, not just document metadata)
      const hasAnyData = hasScript || hasBreakdown || hasStoryboards || hasShotList || 
                        hasV2Narrative || hasV2Props || hasV2Locations || hasV2Casting || hasV2Marketing || hasV2PostProd
      
      // CRITICAL: Also check generationStatus - if it's 'complete' or 'in-progress', don't regenerate
      const generationStatus = (preProductionData as any).generationStatus
      const isComplete = generationStatus === 'complete' || generationStatus === 'in-progress'
      
      if (!hasAnyData && !isComplete) {
        hasCheckedAutoGen.current = true
        console.log('🚀 Starting auto-generation for episode pre-production...')
        console.log('   Data check:', { 
          hasScript, 
          hasBreakdown, 
          hasStoryboards, 
          hasShotList,
          hasV2Narrative,
          hasV2Props,
          hasV2Locations,
          hasV2Casting,
          hasV2Marketing,
          hasV2PostProd,
          generationStatus,
          lastUpdated: safeDateString(preProductionData.lastUpdated),
          preProductionId: preProductionData.id?.substring(0, 20) + '...',
          scriptsStructure: scriptsData ? Object.keys(scriptsData) : 'none'
        })
        await autoGeneratePreProduction()
      } else {
        hasCheckedAutoGen.current = true
        console.log('✅ Pre-production data exists, skipping auto-generation', {
          hasAnyData,
          isComplete,
          generationStatus,
          hasScript, 
          hasBreakdown, 
          hasStoryboards, 
          hasShotList,
          hasV2Narrative,
          hasV2Props,
          hasV2Locations,
          hasV2Casting,
          hasV2Marketing,
          hasV2PostProd
        })
      }
    }

    checkAndAutoGenerate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preProductionData, episodeData, storyBible, user?.id])

  const handleTabUpdate = async (tabName: string, tabData: any) => {
    if (!preProductionData || !user?.id) {
      console.warn('⚠️ Cannot update: missing preProductionData or user.id')
      return
    }

    // CRITICAL: For storyboards updates, use lock to ensure sequential updates
    // This prevents race conditions where concurrent frame updates overwrite each other
    if (tabName === 'storyboards') {
      // Use lock to ensure sequential storyboard updates
      frameUpdateLock.current = frameUpdateLock.current.then(async () => {
        console.log(`💾 [LOCKED] handleTabUpdate called for tab: ${tabName}`)
    console.log(`   Data keys:`, Object.keys(tabData))
        if (tabData.scenes) {
      console.log(`   Storyboards: ${tabData.scenes.length} scenes, ${tabData.totalFrames} total frames`)
          // Log ALL frames with images
          let imageCount = 0
          tabData.scenes?.forEach((scene: any) => {
            scene.frames?.forEach((frame: any) => {
              if (frame.frameImage) {
                imageCount++
                const isBase64 = frame.frameImage.startsWith('data:')
                const sizeKB = isBase64 ? Math.round((frame.frameImage.length * 3) / 4 / 1024) : 0
                console.log(`   📸 Frame ${frame.id} has image:`, {
                  scene: frame.sceneNumber,
                  shot: frame.shotNumber,
                  type: isBase64 ? `base64 (${sizeKB}KB)` : 'external URL',
                  preview: frame.frameImage.substring(0, 60) + '...'
                })
              }
            })
          })
          console.log(`   📊 Total frames with images: ${imageCount}`)
    }

    setIsSyncing(true)
    try {
          // CRITICAL: Get latest storyboards - ALWAYS use ref first (it has the most recent saves)
          // The ref is updated after each save, so it has the latest data including just-saved frames
          let currentStoryboards = latestStoryboardsRef.current
          
          // If ref is null, fall back to Firestore state
          if (!currentStoryboards) {
            currentStoryboards = preProductionData.storyboards || null
            if (currentStoryboards) {
              latestStoryboardsRef.current = currentStoryboards // Initialize ref
              console.log(`🔄 [LOCKED] Initialized ref from preProductionData.storyboards`)
            }
          } else {
            console.log(`✅ [LOCKED] Using ref data (has latest saves):`, {
              refLastUpdated: safeDateString(currentStoryboards.lastUpdated),
              refImages: currentStoryboards.scenes?.reduce((sum: number, s: any) => 
                sum + (s.frames || []).filter((f: any) => f.frameImage).length, 0
              ) || 0
            })
          }
          
          // CRITICAL: If we have ref data, it's the source of truth (has latest saves)
          // Don't use preProductionData.storyboards if ref exists - ref is newer
          
          // Log what we're merging
          if (currentStoryboards && tabData.scenes) {
            const currentImageCount = currentStoryboards.scenes?.reduce((sum: number, scene: any) => 
              sum + (scene.frames || []).filter((f: any) => f.frameImage).length, 0
            ) || 0
            const newImageCount = tabData.scenes.reduce((sum: number, scene: any) => 
              sum + (scene.frames || []).filter((f: any) => f.frameImage).length, 0
            )
            
            // Check for duplicate frame IDs in current data
            const currentFrameIds = new Set<string>()
            const currentDuplicates: string[] = []
            currentStoryboards.scenes?.forEach((scene: any) => {
              scene.frames?.forEach((frame: any) => {
                if (frame.id) {
                  if (currentFrameIds.has(frame.id)) {
                    currentDuplicates.push(frame.id)
                  } else {
                    currentFrameIds.add(frame.id)
                  }
                }
              })
            })
            
            // Check for duplicate frame IDs in new data
            const newFrameIds = new Set<string>()
            const newDuplicates: string[] = []
            tabData.scenes.forEach((scene: any) => {
              scene.frames?.forEach((frame: any) => {
                if (frame.id) {
                  if (newFrameIds.has(frame.id)) {
                    newDuplicates.push(frame.id)
                  } else {
                    newFrameIds.add(frame.id)
                  }
                }
              })
            })
            
            console.log(`🔀 [LOCKED] Merging storyboards:`, {
              currentImages: currentImageCount,
              newImages: newImageCount,
              currentScenes: currentStoryboards.scenes?.length || 0,
              newScenes: tabData.scenes.length,
              currentTotalFrames: currentStoryboards.scenes?.reduce((sum: number, s: any) => sum + (s.frames?.length || 0), 0) || 0,
              newTotalFrames: tabData.scenes.reduce((sum: number, s: any) => sum + (s.frames?.length || 0), 0),
              currentDuplicateFrameIds: currentDuplicates.length > 0 ? currentDuplicates : 'none',
              newDuplicateFrameIds: newDuplicates.length > 0 ? newDuplicates : 'none'
            })
            
            if (currentDuplicates.length > 0) {
              console.warn(`⚠️ [LOCKED] Found ${currentDuplicates.length} duplicate frame IDs in CURRENT data:`, currentDuplicates)
            }
            if (newDuplicates.length > 0) {
              console.warn(`⚠️ [LOCKED] Found ${newDuplicates.length} duplicate frame IDs in NEW data:`, newDuplicates)
            }
          }
          
          // CRITICAL: Merge with current storyboards to preserve ALL existing frames and images
          // This ensures we never lose frames or images when updating
          if (currentStoryboards && tabData.scenes) {
            // Start with current storyboards as base
            const mergedScenes = currentStoryboards.scenes.map((currentScene: any) => {
              const newScene = tabData.scenes.find(
                (s: any) => s.sceneNumber === currentScene.sceneNumber
              )
              
              if (newScene) {
                // Merge frames from both - prioritize new frame data but preserve existing images
                // CRITICAL: Use Map to deduplicate by frame.id to prevent duplicates
                const frameMap = new Map()
                
                // First, add all current frames with their images
                currentScene.frames?.forEach((frame: any) => {
                  if (frame.id) {
                    frameMap.set(frame.id, { ...frame })
                  } else {
                    console.warn(`⚠️ Current frame without ID in scene ${currentScene.sceneNumber}, skipping`)
                  }
                })
                
                // Then, update with new frame data (this preserves images if new frame doesn't have one)
                // CRITICAL: Deduplicate - if frame ID already exists, update it instead of adding duplicate
                newScene.frames?.forEach((newFrame: any) => {
                  if (!newFrame.id) {
                    console.warn(`⚠️ New frame without ID in scene ${newScene.sceneNumber}, skipping`)
                    return
                  }
                  
                  const existingFrame = frameMap.get(newFrame.id)
                  if (existingFrame) {
                    // Frame exists - merge: CRITICAL - if new frame has Storage URL, use it (it's the latest)
                    // If new frame has Storage URL, it means we just saved it - use it!
                    const newHasStorageUrl = newFrame.frameImage && 
                                            (newFrame.frameImage.startsWith('https://firebasestorage.googleapis.com/') || 
                                             newFrame.frameImage.startsWith('https://storage.googleapis.com/'))
                    const existingHasStorageUrl = existingFrame.frameImage && 
                                                  (existingFrame.frameImage.startsWith('https://firebasestorage.googleapis.com/') || 
                                                   existingFrame.frameImage.startsWith('https://storage.googleapis.com/'))
                    
                    // CRITICAL: If new frame has Storage URL, it's the latest - use it!
                    if (newHasStorageUrl) {
                      frameMap.set(newFrame.id, {
                        ...newFrame,
                        frameImage: newFrame.frameImage // Use new Storage URL - it's the latest
                      })
                      console.log(`✅ [LOCKED] Frame ${newFrame.id} merged: Using new Storage URL (latest)`)
                    } else if (existingHasStorageUrl && !newFrame.frameImage) {
                      // New frame has no image, existing has Storage URL - preserve it
                      frameMap.set(newFrame.id, {
                        ...newFrame,
                        frameImage: existingFrame.frameImage
                      })
                    } else {
                      // Fallback: use new frame data
                      frameMap.set(newFrame.id, {
                        ...newFrame,
                        frameImage: newFrame.frameImage || existingFrame.frameImage
                      })
                    }
                  } else {
                    // New frame not in current - add it (but check for duplicate shotNumbers)
                    // Check if there's already a frame with the same shotNumber in this scene
                    const existingShotNumber = Array.from(frameMap.values()).find(
                      (f: any) => f.shotNumber === newFrame.shotNumber && f.sceneNumber === newScene.sceneNumber
                    )
                    
                    if (existingShotNumber) {
                      console.warn(`⚠️ Duplicate shotNumber ${newFrame.shotNumber} in scene ${newScene.sceneNumber}`, {
                        existingFrameId: existingShotNumber.id,
                        newFrameId: newFrame.id,
                        keeping: newFrame.id // Keep the new one since it might have updates
                      })
                      // Replace the existing frame with same shotNumber (new data takes precedence)
                      frameMap.set(newFrame.id, { ...newFrame })
                      // Remove the old frame with same shotNumber but different ID
                      frameMap.delete(existingShotNumber.id)
                    } else {
                      // No duplicate shotNumber - safe to add
                      frameMap.set(newFrame.id, { ...newFrame })
                    }
                  }
                })
                
                return {
                  ...newScene, // Use new scene metadata
                  frames: Array.from(frameMap.values())
                }
              }
              
              // Scene not in new data - preserve current scene entirely
              return currentScene
            })
            
            // Also add any new scenes that don't exist in current
            // But deduplicate frames within those scenes by ID
            const existingSceneNumbers = new Set(mergedScenes.map((s: any) => s.sceneNumber))
            tabData.scenes.forEach((newScene: any) => {
              if (!existingSceneNumbers.has(newScene.sceneNumber)) {
                // Deduplicate frames by ID within the new scene (in case of duplicates)
                const frameMap = new Map()
                newScene.frames?.forEach((frame: any) => {
                  if (frame.id) {
                    // Only keep first occurrence of each frame ID
                    if (!frameMap.has(frame.id)) {
                      frameMap.set(frame.id, frame)
                    } else {
                      console.warn(`⚠️ Duplicate frame ID ${frame.id} in scene ${newScene.sceneNumber}, keeping first occurrence`)
                    }
                  } else {
                    console.warn(`⚠️ Frame without ID in scene ${newScene.sceneNumber}, skipping`)
                  }
                })
                
                mergedScenes.push({
                  ...newScene,
                  frames: Array.from(frameMap.values())
                })
              }
            })
            
            // Sort by scene number
            mergedScenes.sort((a: any, b: any) => a.sceneNumber - b.sceneNumber)
            
            // CRITICAL: Final deduplication pass - remove any duplicate frames by ID across all scenes
            let totalDuplicatesRemoved = 0
            mergedScenes.forEach((scene: any) => {
              if (scene.frames && Array.isArray(scene.frames)) {
                const beforeCount = scene.frames.length
                const seenIds = new Set<string>()
                const deduplicatedFrames: any[] = []
                
                scene.frames.forEach((frame: any) => {
                  if (frame.id) {
                    if (!seenIds.has(frame.id)) {
                      seenIds.add(frame.id)
                      deduplicatedFrames.push(frame)
                    } else {
                      console.warn(`⚠️ [DEDUPE] Removing duplicate frame ID ${frame.id} from scene ${scene.sceneNumber} (shotNumber: ${frame.shotNumber})`)
                      totalDuplicatesRemoved++
                    }
                  } else {
                    console.warn(`⚠️ [DEDUPE] Removing frame without ID from scene ${scene.sceneNumber}`)
                    totalDuplicatesRemoved++
                  }
                })
                
                scene.frames = deduplicatedFrames
                
                if (beforeCount > deduplicatedFrames.length) {
                  console.log(`✅ [DEDUPE] Scene ${scene.sceneNumber}: Removed ${beforeCount - deduplicatedFrames.length} duplicate frames (${beforeCount} → ${deduplicatedFrames.length})`)
                }
              }
            })
            
            if (totalDuplicatesRemoved > 0) {
              console.log(`✅ [DEDUPE] Total duplicates removed: ${totalDuplicatesRemoved}`)
            }
            
            // CRITICAL: Clean frames to remove undefined values and reject base64 images
            const cleanFrameForFirestore = (frame: any): Record<string, any> => {
              const cleaned: Record<string, any> = {}
              for (const [key, value] of Object.entries(frame)) {
                if (value === undefined) {
                  continue // Skip undefined values
                }
                
                // CRITICAL: frameImage MUST be a Storage URL, never base64
                if (key === 'frameImage' && typeof value === 'string') {
                  if (value.startsWith('data:')) {
                    console.error(`❌ [LOCKED] CRITICAL: Frame ${frame.id} has base64 in frameImage! Rejecting.`)
                    // Don't include this frameImage - it will cause Firestore errors
                    continue
                  } else if (value.startsWith('https://firebasestorage.googleapis.com/') || 
                             value.startsWith('https://storage.googleapis.com/')) {
                    cleaned[key] = value // Valid Storage URL
                  } else {
                    console.warn(`⚠️ [LOCKED] Frame ${frame.id} has unknown frameImage format, skipping`, {
                      frameId: frame.id,
                      frameImageType: typeof value,
                      frameImagePreview: typeof value === 'string' ? value.substring(0, 50) + '...' : 'non-string'
                    })
                    continue
                  }
                } else {
                  cleaned[key] = value
                }
              }
              return cleaned
            }
            
            const cleanedMergedScenes = mergedScenes.map(scene => ({
              ...scene,
              frames: (scene.frames || []).map(cleanFrameForFirestore).filter((f: Record<string, any>) => Object.keys(f).length > 0)
            }))
            
            // Recalculate totals
            const totalFrames = cleanedMergedScenes.reduce((sum: number, scene: any) => sum + (scene.frames?.length || 0), 0)
            const finalizedFrames = cleanedMergedScenes.reduce((sum: number, scene: any) => 
              sum + (scene.frames || []).filter((f: any) => f.status === 'final').length, 0
            )
            
            // Count images after merge
            const mergedImageCount = cleanedMergedScenes.reduce((sum: number, scene: any) => 
              sum + (scene.frames || []).filter((f: any) => f.frameImage).length, 0
            )
            
            tabData = { 
              ...tabData, 
              scenes: cleanedMergedScenes,
              totalFrames,
              finalizedFrames
            }
            
            console.log(`✅ [LOCKED] Merged storyboards complete:`, {
              currentScenes: currentStoryboards.scenes?.length || 0,
              newScenes: tabData.scenes.length,
              mergedScenes: mergedScenes.length,
              totalFrames,
              mergedImageCount,
              currentImageCount: currentStoryboards.scenes?.reduce((sum: number, scene: any) => 
                sum + (scene.frames || []).filter((f: any) => f.frameImage).length, 0
              ) || 0
            })
          }
          
          // CRITICAL: Validate Storage URLs are present before saving
          const framesWithImages = (tabData as StoryboardsData).scenes?.flatMap((scene: any) => 
            (scene.frames || []).filter((f: any) => f.frameImage)
          ) || []
          
          const storageUrlCount = framesWithImages.filter((f: any) => 
            f.frameImage.startsWith('https://firebasestorage.googleapis.com/') || 
            f.frameImage.startsWith('https://storage.googleapis.com/')
          ).length
          
          const base64Count = framesWithImages.filter((f: any) => 
            f.frameImage.startsWith('data:')
          ).length
          
          console.log(`🔍 [LOCKED] Pre-save validation:`, {
            totalFramesWithImages: framesWithImages.length,
            storageUrlCount,
            base64Count,
            framesWithStorageUrls: framesWithImages
              .filter((f: any) => f.frameImage.startsWith('https://firebasestorage.googleapis.com/') || f.frameImage.startsWith('https://storage.googleapis.com/'))
              .map((f: any) => ({
                frameId: f.id,
                scene: f.sceneNumber,
                shot: f.shotNumber,
                url: f.frameImage.substring(0, 80) + '...'
              }))
          })
          
          if (framesWithImages.length > 0 && storageUrlCount === 0) {
            console.error(`❌ [LOCKED] CRITICAL: ${framesWithImages.length} frames have images but NONE are Storage URLs! All are base64.`)
          }
          
          await updatePreProduction(
        preProductionId,
        { [tabName]: tabData },
        user.id,
        storyBibleId
      )
          // Update ref with latest storyboards data AFTER successful save
          latestStoryboardsRef.current = tabData as StoryboardsData
          
          // Verify images are preserved after save
          const savedImageCount = (tabData as StoryboardsData).scenes?.reduce((sum: number, scene: any) => 
            sum + (scene.frames || []).filter((f: any) => f.frameImage).length, 0
          ) || 0
          
          const savedStorageUrlCount = (tabData as StoryboardsData).scenes?.reduce((sum: number, scene: any) => 
            sum + (scene.frames || []).filter((f: any) => 
              f.frameImage && (f.frameImage.startsWith('https://firebasestorage.googleapis.com/') || f.frameImage.startsWith('https://storage.googleapis.com/'))
            ).length, 0
          ) || 0
          
          console.log(`✅ [LOCKED] Tab "${tabName}" saved to Firestore successfully`, {
            totalImages: savedImageCount,
            storageUrlCount: savedStorageUrlCount,
            base64Count: savedImageCount - savedStorageUrlCount,
            scenes: (tabData as StoryboardsData).scenes?.length || 0
          })
          
          if (savedImageCount > 0 && savedStorageUrlCount === 0) {
            console.error(`❌ [LOCKED] CRITICAL WARNING: Images were saved but NONE are Storage URLs! They won't persist across devices!`)
          }
    } catch (error) {
      console.error('❌ Error updating tab:', error)
      setIsSyncing(false)
      throw error // Re-throw so caller knows it failed
    } finally {
      setIsSyncing(false)
        }
      }).catch((error) => {
        setIsSyncing(false)
        throw error
      })
      
      // Wait for lock to complete
      await frameUpdateLock.current
      return
    }

    // For non-storyboards updates, proceed normally without lock
    console.log(`💾 handleTabUpdate called for tab: ${tabName}`)
    setIsSyncing(true)
    try {
      await updatePreProduction(
        preProductionId,
        { [tabName]: tabData },
        user.id,
        storyBibleId
      )
      console.log(`✅ Tab "${tabName}" saved to Firestore successfully`)
    } catch (error) {
      console.error('❌ Error updating tab:', error)
      setIsSyncing(false)
      throw error
    } finally {
      setIsSyncing(false)
    }
  }

  // Helper function to update a single storyboard frame
  // Used by bulk image generation to save individual frame updates
  // Uses a ref to track latest storyboards data and a lock to ensure sequential updates
  // This prevents race conditions where concurrent updates overwrite each other
  const updateStoryboardFrame = async (frameId: string, updates: { frameImage: string }, baseStoryboards?: StoryboardsData) => {
    if (!preProductionData || !user?.id) {
      throw new Error('Cannot update frame: missing preProductionData or user.id')
    }

    // CRITICAL: Use a lock to ensure updates are sequential
    // This prevents race conditions where two updates read the same data and overwrite each other
    frameUpdateLock.current = frameUpdateLock.current.then(async () => {
      // CRITICAL: Use ref to get the latest storyboards data to prevent race conditions
      // The ref is updated after each save, ensuring we always have the most recent data
      // Fall back to state, then baseStoryboards if ref is not set yet
      const currentStoryboards: StoryboardsData = latestStoryboardsRef.current || preProductionData.storyboards || baseStoryboards || {
        episodeNumber: preProductionData.episodeNumber || 1,
        episodeTitle: preProductionData.episodeTitle || `Episode ${preProductionData.episodeNumber || 1}`,
        totalFrames: 0,
        finalizedFrames: 0,
        scenes: [],
        lastUpdated: Date.now(),
        updatedBy: user.id
      }

      // Verify the frame exists in current storyboards
      const frameExists = currentStoryboards.scenes?.some(scene =>
        scene.frames?.some(frame => frame.id === frameId)
      )

      let storyboardsToUpdate: StoryboardsData = currentStoryboards

      if (!frameExists) {
        console.warn(`⚠️ [updateStoryboardFrame] Frame ${frameId} not found in current storyboards, checking baseStoryboards...`)
        // If frame doesn't exist in current, use baseStoryboards if provided
        if (baseStoryboards) {
          const baseFrameExists = baseStoryboards.scenes?.some(scene =>
            scene.frames?.some(frame => frame.id === frameId)
          )
          if (baseFrameExists) {
            // Frame exists in baseStoryboards - use that as the base for updating
            console.log(`✅ [updateStoryboardFrame] Frame ${frameId} found in baseStoryboards, using that as base`)
            storyboardsToUpdate = baseStoryboards
          } else {
            // CRITICAL: Don't throw error - log warning and skip this frame update
            // This allows generation to continue even if frame structure is unexpected
            console.error(`❌ [updateStoryboardFrame] Frame ${frameId} not found in baseStoryboards either!`, {
              currentScenes: currentStoryboards.scenes?.length || 0,
              baseScenes: baseStoryboards.scenes?.length || 0,
              currentFrames: currentStoryboards.scenes?.reduce((sum, s) => sum + (s.frames?.length || 0), 0) || 0,
              baseFrames: baseStoryboards.scenes?.reduce((sum, s) => sum + (s.frames?.length || 0), 0) || 0
            })
            // Skip this frame update - allows the generation to continue with other frames
            // Return void to maintain Promise<void> type for the lock
            return
          }
        } else {
          console.error(`❌ [updateStoryboardFrame] Frame ${frameId} not found in current storyboards and no baseStoryboards provided!`, {
            currentScenes: currentStoryboards.scenes?.length || 0,
            currentFrames: currentStoryboards.scenes?.reduce((sum, s) => sum + (s.frames?.length || 0), 0) || 0
          })
          // Skip this frame update - allows the generation to continue with other frames
          return
        }
      }

      // CRITICAL: Validate Storage URL before updating
      if (updates.frameImage) {
        const isStorageUrl = updates.frameImage.startsWith('https://firebasestorage.googleapis.com/') || 
                            updates.frameImage.startsWith('https://storage.googleapis.com/')
        
        if (!isStorageUrl) {
          console.error(`❌ [updateStoryboardFrame] CRITICAL: Frame ${frameId} update has NON-STORAGE URL!`, {
            frameId,
            urlType: updates.frameImage.startsWith('data:') ? 'base64' : 'unknown',
            urlPreview: updates.frameImage.substring(0, 100) + '...',
            urlLength: updates.frameImage.length
          })
          throw new Error(`Frame ${frameId}: Cannot save - frameImage must be a Firebase Storage URL, got: ${updates.frameImage.substring(0, 50)}...`)
        }
        
        console.log(`✅ [updateStoryboardFrame] Frame ${frameId} has valid Storage URL`, {
          frameId,
          storageUrl: updates.frameImage.substring(0, 80) + '...',
          fullUrl: updates.frameImage
        })
      }

      // CRITICAL: Clean updates to remove undefined values
      const cleanUpdates: any = {}
      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
          // CRITICAL: frameImage MUST be a Storage URL
          if (key === 'frameImage' && typeof value === 'string') {
            if (value.startsWith('data:')) {
              throw new Error(`Frame ${frameId}: frameImage cannot be base64 - must be Storage URL`)
            } else if (value.startsWith('https://firebasestorage.googleapis.com/') || 
                       value.startsWith('https://storage.googleapis.com/')) {
              cleanUpdates[key] = value // Valid Storage URL
            } else {
              throw new Error(`Frame ${frameId}: frameImage must be a Firebase Storage URL`)
            }
          } else {
            cleanUpdates[key] = value
          }
        }
      }
      
      // Update the frame in the storyboards data
      const updatedScenes = (storyboardsToUpdate.scenes || []).map(scene => ({
        ...scene,
        frames: (scene.frames || []).map(frame => {
          if (frame.id === frameId) {
            // Merge updates, ensuring no undefined values
            const merged: any = { ...frame }
            for (const [key, value] of Object.entries(cleanUpdates)) {
              if (value !== undefined) {
                merged[key] = value
              }
            }
            return merged
          }
          return frame
        })
      }))

      // Recalculate totals
      const totalFrames = updatedScenes.reduce((sum, scene) => sum + (scene.frames?.length || 0), 0)
      const finalizedFrames = updatedScenes.reduce((sum, scene) => 
        sum + (scene.frames || []).filter(f => f.status === 'final').length, 0
      )

      // CRITICAL: Clean the storyboards data to remove undefined values
      // Firestore cannot store undefined values
      const cleanFrame = (frame: any) => {
        const cleaned: any = {}
        for (const [key, value] of Object.entries(frame)) {
          if (value !== undefined) {
            // CRITICAL: frameImage MUST be a Storage URL, not base64
            if (key === 'frameImage' && typeof value === 'string') {
              if (value.startsWith('data:')) {
                console.error(`❌ [updateStoryboardFrame] CRITICAL: Frame ${frame.id} has base64 in frameImage! Cannot save to Firestore.`)
                throw new Error(`Frame ${frame.id}: frameImage cannot be base64 - must be Storage URL`)
              } else if (value.startsWith('https://firebasestorage.googleapis.com/') || 
                         value.startsWith('https://storage.googleapis.com/')) {
                cleaned[key] = value // Valid Storage URL
              } else {
                console.warn(`⚠️ [updateStoryboardFrame] Frame ${frame.id} has unknown frameImage format, skipping`)
                // Skip invalid frameImage
              }
            } else {
              cleaned[key] = value
            }
          }
        }
        return cleaned
      }
      
      const cleanedScenes = updatedScenes.map(scene => ({
        ...scene,
        frames: (scene.frames || []).map(cleanFrame).filter(f => Object.keys(f).length > 0)
      }))
      
      const updatedStoryboards: StoryboardsData = {
        ...storyboardsToUpdate,
        scenes: cleanedScenes,
        totalFrames,
        finalizedFrames,
        lastUpdated: Date.now(),
        updatedBy: user.id
      }

      // CRITICAL: Verify Storage URL is in the data before saving
      const frameWithImage = updatedStoryboards.scenes?.flatMap(s => s.frames || [])
        .find(f => f.id === frameId && f.frameImage)
      
      if (frameWithImage?.frameImage) {
        const isStorageUrl = frameWithImage.frameImage.startsWith('https://firebasestorage.googleapis.com/') || 
                            frameWithImage.frameImage.startsWith('https://storage.googleapis.com/')
        
        if (!isStorageUrl) {
          console.error(`❌ [updateStoryboardFrame] CRITICAL: Frame ${frameId} in updatedStoryboards has NON-STORAGE URL!`, {
            frameId,
            urlType: frameWithImage.frameImage.startsWith('data:') ? 'base64' : 'unknown',
            urlPreview: frameWithImage.frameImage.substring(0, 100) + '...'
          })
          throw new Error(`Frame ${frameId}: frameImage in updatedStoryboards is not a Storage URL`)
        }
        
        console.log(`✅ [updateStoryboardFrame] Verified Storage URL in updatedStoryboards before save`, {
          frameId,
          storageUrl: frameWithImage.frameImage.substring(0, 80) + '...'
        })
      }

      // CRITICAL: Verify Storage URL is in updatedStoryboards before saving
      const frameToSave = updatedStoryboards.scenes?.flatMap(s => s.frames || [])
        .find(f => f.id === frameId)
      
      if (!frameToSave?.frameImage) {
        console.error(`❌ [updateStoryboardFrame] CRITICAL: Frame ${frameId} has NO frameImage in updatedStoryboards!`, {
          frameId,
          frameExists: !!frameToSave,
          frameKeys: frameToSave ? Object.keys(frameToSave) : [],
          updatedStoryboardsScenes: updatedStoryboards.scenes?.length || 0
        })
        throw new Error(`Frame ${frameId} has no frameImage in updatedStoryboards - cannot save`)
      }
      
      const isStorageUrl = frameToSave.frameImage.startsWith('https://firebasestorage.googleapis.com/') || 
                          frameToSave.frameImage.startsWith('https://storage.googleapis.com/')
      
      if (!isStorageUrl) {
        console.error(`❌ [updateStoryboardFrame] CRITICAL: Frame ${frameId} frameImage is NOT a Storage URL!`, {
          frameId,
          urlType: frameToSave.frameImage.startsWith('data:') ? 'base64' : 'unknown',
          urlPreview: frameToSave.frameImage.substring(0, 100) + '...',
          urlLength: frameToSave.frameImage.length
        })
        throw new Error(`Frame ${frameId}: frameImage must be a Firebase Storage URL, got: ${frameToSave.frameImage.substring(0, 50)}...`)
      }

      // Save directly via Firestore service to avoid re-entering the storyboard lock
      try {
        console.log(`💾 [updateStoryboardFrame] ========== SAVING FRAME ${frameId} TO FIRESTORE ==========`, {
          frameId,
          storageUrl: frameToSave.frameImage,
          fullUrl: frameToSave.frameImage, // Log FULL URL
          urlLength: frameToSave.frameImage.length,
          isStorageUrl: true,
          sceneNumber: frameToSave.sceneNumber,
          shotNumber: frameToSave.shotNumber,
          preProductionId,
          storyBibleId
        })
        
        // CRITICAL: Log the exact data being saved
        const storyboardsToSave = {
          ...updatedStoryboards,
          lastUpdated: Date.now(),
          updatedBy: user.id
        }
        
        // CRITICAL: Verify the target frame is in the data being saved
        const frameInSaveData = storyboardsToSave.scenes?.flatMap(s => s.frames || [])
          .find(f => f.id === frameId)
        
        if (!frameInSaveData) {
          console.error(`❌ [updateStoryboardFrame] ========== TARGET FRAME ${frameId} NOT IN SAVE DATA! ==========`, {
            frameId,
            scenes: storyboardsToSave.scenes?.length || 0,
            totalFrames: storyboardsToSave.scenes?.reduce((sum: number, s: any) => sum + (s.frames?.length || 0), 0) || 0,
            allFrameIds: storyboardsToSave.scenes?.flatMap((s: any) => (s.frames || []).map((f: any) => f.id)) || []
          })
          throw new Error(`Frame ${frameId} not found in storyboards data being saved`)
        }
        
        if (!frameInSaveData.frameImage) {
          console.error(`❌ [updateStoryboardFrame] ========== TARGET FRAME ${frameId} HAS NO frameImage IN SAVE DATA! ==========`, {
            frameId,
            frameKeys: Object.keys(frameInSaveData),
            frameData: JSON.stringify(frameInSaveData).substring(0, 500)
          })
          throw new Error(`Frame ${frameId} has no frameImage in save data`)
        }
        
        const isStorageUrlInSave = frameInSaveData.frameImage.startsWith('https://firebasestorage.googleapis.com/') || 
                                   frameInSaveData.frameImage.startsWith('https://storage.googleapis.com/')
        
        if (!isStorageUrlInSave) {
          console.error(`❌ [updateStoryboardFrame] ========== TARGET FRAME ${frameId} frameImage IS NOT A STORAGE URL IN SAVE DATA! ==========`, {
            frameId,
            frameImageType: frameInSaveData.frameImage.startsWith('data:') ? 'base64' : 'unknown',
            frameImagePreview: frameInSaveData.frameImage.substring(0, 100) + '...'
          })
          throw new Error(`Frame ${frameId} frameImage is not a Storage URL in save data`)
        }
        
        console.log(`💾 [updateStoryboardFrame] ========== SAVING TO FIRESTORE ==========`, {
          documentId: preProductionId,
          scenes: storyboardsToSave.scenes?.length || 0,
          totalFrames: storyboardsToSave.scenes?.reduce((sum: number, s: any) => sum + (s.frames?.length || 0), 0) || 0,
          framesWithImages: storyboardsToSave.scenes?.reduce((sum: number, s: any) => 
            sum + (s.frames || []).filter((f: any) => f.frameImage).length, 0
          ) || 0,
          targetFrame: {
            frameId: frameInSaveData.id,
            scene: frameInSaveData.sceneNumber,
            shot: frameInSaveData.shotNumber,
            hasFrameImage: !!frameInSaveData.frameImage,
            isStorageUrl: true,
            storageUrl: frameInSaveData.frameImage.substring(0, 100) + '...',
            fullStorageUrl: frameInSaveData.frameImage
          }
        })
        
        await updatePreProduction(
          preProductionId,
          { storyboards: storyboardsToSave },
          user.id,
          storyBibleId
        )
        
        // CRITICAL: Verify the save by reading back from Firestore after a short delay
        // This ensures Firestore has time to propagate the write
        await new Promise(resolve => setTimeout(resolve, 500))
        
        console.log(`🔍 [updateStoryboardFrame] Verifying save by reading Firestore...`, {
          userId: user.id.substring(0, 8) + '...',
          storyBibleId,
          episodeNumber,
          preProductionId
        })
        
        const { getEpisodePreProduction } = await import('@/services/preproduction-firestore')
        const verifyData = await getEpisodePreProduction(user.id, storyBibleId, episodeNumber)
        
        // CRITICAL: Verify we're reading from the same document we saved to
        if (verifyData?.id !== preProductionId) {
          console.error(`❌ [updateStoryboardFrame] ========== DOCUMENT ID MISMATCH! ==========`, {
            frameId,
            savedToDocumentId: preProductionId,
            readFromDocumentId: verifyData?.id,
            match: verifyData?.id === preProductionId
          })
          throw new Error(`Document ID mismatch: Saved to ${preProductionId} but read from ${verifyData?.id}`)
        }
        
        console.log(`✅ [updateStoryboardFrame] Document ID verified: ${preProductionId}`)
        
        if (verifyData?.storyboards) {
          // Log ALL frames to debug
          const allFrames = verifyData.storyboards.scenes?.flatMap(s => s.frames || []) || []
          console.log(`🔍 [updateStoryboardFrame] All frames in Firestore document ${preProductionId}:`, {
            totalFrames: allFrames.length,
            frames: allFrames.map(f => ({
              frameId: f.id,
              scene: f.sceneNumber,
              shot: f.shotNumber,
              hasFrameImage: !!f.frameImage,
              frameImageType: f.frameImage ? (f.frameImage.startsWith('https://') ? 'Storage URL' : 'base64') : 'none',
              frameImagePreview: f.frameImage ? f.frameImage.substring(0, 60) + '...' : 'none'
            }))
          })
          
          const savedFrame = allFrames.find(f => f.id === frameId)
          
          if (savedFrame?.frameImage) {
            const isStorageUrl = savedFrame.frameImage.startsWith('https://firebasestorage.googleapis.com/') || 
                                savedFrame.frameImage.startsWith('https://storage.googleapis.com/')
            
            if (isStorageUrl && savedFrame.frameImage === frameToSave.frameImage) {
              console.log(`✅ [updateStoryboardFrame] ========== FRAME ${frameId} VERIFIED IN FIRESTORE ==========`, {
                frameId,
                storageUrl: savedFrame.frameImage.substring(0, 100) + '...',
                fullUrl: savedFrame.frameImage,
                verified: true,
                documentId: verifyData.id
              })
            } else {
              console.error(`❌ [updateStoryboardFrame] ========== VERIFICATION FAILED ==========`, {
                frameId,
                expected: frameToSave.frameImage.substring(0, 100) + '...',
                found: savedFrame.frameImage ? savedFrame.frameImage.substring(0, 100) + '...' : 'NONE',
                isStorageUrl,
                matches: savedFrame.frameImage === frameToSave.frameImage,
                documentId: verifyData.id
              })
              throw new Error(`Frame ${frameId} verification failed - Storage URL mismatch or not a Storage URL`)
            }
          } else {
            console.error(`❌ [updateStoryboardFrame] ========== FRAME ${frameId} NOT FOUND IN FIRESTORE AFTER SAVE! ==========`, {
              frameId,
              documentId: verifyData.id,
              savedFrames: verifyData.storyboards.scenes?.reduce((sum: number, s: any) => sum + (s.frames?.length || 0), 0) || 0,
              framesWithImages: verifyData.storyboards.scenes?.reduce((sum: number, s: any) => 
                sum + (s.frames || []).filter((f: any) => f.frameImage).length, 0
              ) || 0
            })
            throw new Error(`Frame ${frameId} not found in Firestore after save`)
          }
        } else {
          console.error(`❌ [updateStoryboardFrame] ========== STORYBOARDS NOT FOUND IN FIRESTORE AFTER SAVE! ==========`, {
            documentId: verifyData?.id,
            hasStoryboards: !!verifyData?.storyboards
          })
          throw new Error(`Storyboards not found in Firestore after save`)
        }
        
        // Mark that we just saved this frame
        if (!justSavedRef.current) {
          justSavedRef.current = { timestamp: Date.now(), frameIds: new Set() }
        }
        justSavedRef.current.frameIds.add(frameId)
        justSavedRef.current.timestamp = Date.now()
        
        console.log(`✅ [updateStoryboardFrame] ========== FRAME ${frameId} SAVED AND VERIFIED ==========`, {
          frameId,
          storageUrl: frameToSave.frameImage.substring(0, 100) + '...',
          fullUrl: frameToSave.frameImage,
          success: true,
          documentId: verifyData.id,
          verifiedInFirestore: true
        })
        
        // Clear the "just saved" flag after 5 seconds to allow normal subscription updates
        setTimeout(() => {
          if (justSavedRef.current) {
            justSavedRef.current.frameIds.delete(frameId)
            if (justSavedRef.current.frameIds.size === 0) {
              justSavedRef.current = null
            }
          }
        }, 5000)
      } catch (saveError: any) {
        console.error(`❌ [updateStoryboardFrame] ========== FIRESTORE SAVE FAILED FOR FRAME ${frameId} ==========`, {
          frameId,
          error: saveError.message,
          code: saveError.code,
          stack: saveError.stack,
          storageUrl: frameToSave?.frameImage?.substring(0, 100) + '...'
        })
        throw saveError
      }

      // Update ref AFTER saving succeeds to ensure we have the latest data for next update
      // This prevents race conditions where concurrent updates overwrite each other
      latestStoryboardsRef.current = updatedStoryboards
      console.log(`✅ [updateStoryboardFrame] Frame ${frameId} update complete - Storage URL saved to Firestore`)
      // Don't return value - lock should be Promise<void>
    }).catch((error) => {
      // CRITICAL: Log error but re-throw so caller knows it failed
      // The lock chain will continue, but the error will be caught by the service
      console.error(`❌ [updateStoryboardFrame] Error updating frame ${frameId}:`, error)
      throw error
    })

    // Wait for the lock to complete
    try {
      await frameUpdateLock.current
      
      // Return the updated storyboards from the ref
      if (!latestStoryboardsRef.current) {
        console.warn(`⚠️ [updateStoryboardFrame] Ref is null after update for frame ${frameId}, using baseStoryboards as fallback`)
        // Don't throw - return base storyboards so generation can continue
        return baseStoryboards
      }
      
      return latestStoryboardsRef.current
    } catch (error: any) {
      // CRITICAL: Don't let lock errors stop image generation
      // If the lock fails, return base storyboards so generation can continue
      console.error(`❌ [updateStoryboardFrame] Lock error for frame ${frameId}:`, error.message)
      return baseStoryboards
    }
  }

  // Auto-generate pre-production materials
  const autoGeneratePreProduction = async () => {
    if (!preProductionData || !episodeData || !storyBible || !user?.id) return

    setIsAutoGenerating(true)
    
    // Initialize steps
    const steps: GenerationStep[] = [
      { id: 'script', label: 'Script', status: 'pending' },
      { id: 'breakdown', label: 'Script Breakdown', status: 'pending' },
      { id: 'storyboards', label: 'Storyboards', status: 'pending' },
      { id: 'storyboard-images', label: 'Storyboard Images', status: 'pending' },
      { id: 'shotlist', label: 'Shot List', status: 'pending' },
      { id: 'marketing', label: 'Marketing', status: 'pending' }
      // Locations are now managed at arc level, not episode level
    ]
    
    setGenerationSteps(steps)
    setGenerationProgress(0)

    try {
      // 1. Generate Script
      updateStepStatus('script', 'generating')
      setCurrentGenerationStep('script')
      
      const scriptResponse = await fetch('/api/generate/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preProductionId,
          storyBibleId,
          episodeNumber,
          userId: user.id,
          episodeData,
          storyBibleData: storyBible
        })
      })

      if (!scriptResponse.ok) {
        throw new Error('Failed to generate script')
      }

      const scriptResult = await scriptResponse.json()
      await handleTabUpdate('scripts', {
        generated: true,
        fullScript: scriptResult.script,
        lastGenerated: Date.now(),
        status: 'generated',
        metadata: scriptResult.script.metadata
      })

      updateStepStatus('script', 'completed')
      setGenerationProgress(20)

      // 2. Generate Breakdown
      updateStepStatus('breakdown', 'generating')
      setCurrentGenerationStep('breakdown')

      const breakdownResponse = await fetch('/api/generate/script-breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preProductionId,
          storyBibleId,
          episodeNumber,
          userId: user.id,
          scriptData: scriptResult.script,
          storyBibleData: storyBible
        })
      })

      if (!breakdownResponse.ok) {
        const errorData = await breakdownResponse.json().catch(() => ({ error: 'Unknown error' }))
        const errorMessage = errorData.details || errorData.error || 'Failed to generate breakdown'
        console.error('❌ Breakdown generation failed:', errorMessage)
        throw new Error(errorMessage)
      }

      const breakdownResult = await breakdownResponse.json()
      await handleTabUpdate('scriptBreakdown', breakdownResult.breakdown)

      updateStepStatus('breakdown', 'completed')
      setGenerationProgress(15)

      // 3. Generate Storyboards
      updateStepStatus('storyboards', 'generating')
      setCurrentGenerationStep('storyboards')

      // Create AbortController with 5-minute timeout for batched generation
      const storyboardsController = new AbortController()
      const storyboardsTimeoutId = setTimeout(() => storyboardsController.abort(), 300000) // 5 minutes

      let storyboardsResponse
      try {
        storyboardsResponse = await fetch('/api/generate/storyboards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preProductionId,
            storyBibleId,
            episodeNumber,
            episodeTitle: preProductionData.episodeTitle || `Episode ${episodeNumber}`,
            userId: user.id,
            breakdownData: breakdownResult.breakdown,
            scriptData: scriptResult.script,
            storyBibleData: storyBible
          }),
          signal: storyboardsController.signal
        })
      } finally {
        clearTimeout(storyboardsTimeoutId)
      }

      if (!storyboardsResponse.ok) {
        throw new Error('Failed to generate storyboards')
      }

      const storyboardsText = await storyboardsResponse.text()
      const storyboardsResult = JSON.parse(storyboardsText)
      await handleTabUpdate('storyboards', storyboardsResult.storyboards)
      
      // Initialize ref with storyboards data for concurrent frame updates
      // (handleTabUpdate also updates the ref, but this ensures it's set before image generation starts)
      latestStoryboardsRef.current = storyboardsResult.storyboards

      updateStepStatus('storyboards', 'completed')
      setGenerationProgress(25)

      // 3.5. Generate images for all storyboard frames
      // Wait for at least 10 images before continuing, then let the rest generate in background
      updateStepStatus('storyboard-images', 'generating')
      setCurrentGenerationStep('storyboard-images')
      
      // Track when minimum images are complete to allow continuation
      let minImagesCompleteResolve: (() => void) | null = null
      let totalFramesCount = 0
      const minImagesCompletePromise = new Promise<void>((resolve) => {
        minImagesCompleteResolve = resolve
      })
      
      // Count total frames first
      if (storyboardsResult.storyboards?.scenes) {
        totalFramesCount = storyboardsResult.storyboards.scenes.reduce(
          (sum: number, scene: any) => sum + (scene.frames?.filter((f: any) => f.imagePrompt)?.length || 0),
          0
        )
      }
      
      // Start image generation with minimum 10 images first
      const imageGenerationPromise = generateAllStoryboardImages(
        storyboardsResult.storyboards,
        user.id,
        async (frameId: string, updates: { frameImage: string }) => {
          // Update the frame and save to Firestore
          // baseStoryboards is used as fallback if state doesn't have storyboards yet
          await updateStoryboardFrame(frameId, updates, storyboardsResult.storyboards)
          // Don't return value - callback expects Promise<void>
        },
        {
          onProgress: (progress: GenerateImageProgress) => {
            // Update progress in the overlay only while modal is visible
            if (isAutoGenerating) {
              const progressPercent = progress.total > 0 
                ? Math.round((progress.current / progress.total) * 100)
                : 0
              setGenerationProgress(25 + Math.round(progressPercent * 0.3)) // 25-55% for images
            }
            
            // Always update background progress for banner (even after modal dismisses)
            setBackgroundImageProgress({ current: progress.current, total: progress.total })
          },
          onMinImagesComplete: (count: number) => {
            console.log(`✅ [Auto-Generation] Minimum ${count} images completed, continuing with next steps...`)
            // Allow continuation to next step immediately
            if (minImagesCompleteResolve) {
              minImagesCompleteResolve()
            }
            // Show banner for remaining images (will persist after modal dismisses)
            setIsGeneratingImagesInBackground(true)
            setBackgroundImageProgress({ current: count, total: totalFramesCount })
          },
          onFrameComplete: (frameId: string, success: boolean, error?: string) => {
            if (!success) {
              console.error(`❌ [Auto-Generation] Failed to generate image for frame ${frameId}:`, error)
            }
          }
        },
        {
          minImagesFirst: 3 // Wait for at least 3 images before continuing (then continue in background)
        },
        storyBible, // Pass story bible for character image references
        storyBibleId, // Pass story bible ID for querying recent images
        undefined // breakdownData - not available here, will fall back to text extraction
      ).then((result) => {
        // Update step status when complete
        setIsGeneratingImagesInBackground(false)
        setBackgroundImageProgress(null)
        if (result.failed === 0) {
          updateStepStatus('storyboard-images', 'completed')
        } else {
          updateStepStatus('storyboard-images', 'error')
          console.warn(`⚠️ [Auto-Generation] Image generation completed with ${result.failed} failures:`, result.errors)
        }
        console.log(`✅ [Auto-Generation] Image generation summary: ${result.success} succeeded, ${result.failed} failed`)
      }).catch((error) => {
        console.error('❌ [Auto-Generation] Error during bulk image generation:', error)
        setIsGeneratingImagesInBackground(false)
        setBackgroundImageProgress(null)
        updateStepStatus('storyboard-images', 'error')
      })
      
      // Wait for minimum 10 images before continuing to next step
      await minImagesCompletePromise
      console.log('✅ [Auto-Generation] Minimum images complete, proceeding to shot list generation...')
      
      // Continue with remaining images in background (don't await)
      // The promise will complete on its own and update the banner

      // 4. Generate Shot List (continue while images generate in background)
      updateStepStatus('shotlist', 'generating')
      setCurrentGenerationStep('shotlist')

      const shotListResponse = await fetch('/api/generate/shot-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preProductionId,
          storyBibleId,
          episodeNumber,
          episodeTitle: preProductionData.episodeTitle || `Episode ${episodeNumber}`,
          userId: user.id,
          breakdownData: breakdownResult.breakdown,
          scriptData: scriptResult.script,
          storyBibleData: storyBible,
          storyboardsData: storyboardsResult.storyboards
        })
      })

      if (!shotListResponse.ok) {
        throw new Error('Failed to generate shot list')
      }

      const shotListText = await shotListResponse.text()
      const shotListResult = JSON.parse(shotListText)
      await handleTabUpdate('shotList', shotListResult.shotList)

      updateStepStatus('shotlist', 'completed')
      setGenerationProgress(70)

      // 5. Generate Marketing
      updateStepStatus('marketing', 'generating')
      setCurrentGenerationStep('marketing')

      const marketingResponse = await fetch('/api/generate/episode-marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyBible,
          episode: episodeData,
          narrativeEpisode: episodeData || { scenes: [] },
          episodeNumber,
          preProductionData: {
            ...preProductionData,
            scripts: scriptResult.script,
            scriptBreakdown: breakdownResult.breakdown,
            storyboards: storyboardsResult.storyboards,
            shotList: shotListResult.shotList
          }
        })
      })

      if (!marketingResponse.ok) {
        const errorData = await marketingResponse.json().catch(() => ({ error: 'Unknown error' }))
        const errorMessage = errorData.error || errorData.details || 'Failed to generate marketing'
        console.error('❌ Marketing generation failed:', errorMessage)
        // Don't throw - continue even if marketing fails
        updateStepStatus('marketing', 'error')
      } else {
        const marketingResult = await marketingResponse.json()
        if (marketingResult.success && marketingResult.marketing) {
          const updatedMarketing = {
            episodeNumber: episodeNumber,
            ...marketingResult.marketing
          }
          await handleTabUpdate('marketing', updatedMarketing)
          updateStepStatus('marketing', 'completed')
          console.log('✅ [Auto-Generation] Marketing generated successfully')
        } else {
          console.warn('⚠️ [Auto-Generation] Marketing API returned success but no marketing data')
          updateStepStatus('marketing', 'error')
        }
      }

      setGenerationProgress(100)
      
      // DON'T wait for image generation - let it continue in background
      // Images are generating in background and will complete on their own
      // User can access the page immediately while images continue generating
      
      // Locations are now managed at arc level, not episode level

      // Dismiss modal immediately after Marketing completes
      // Images will continue generating in background
      setIsAutoGenerating(false)
      setCurrentGenerationStep(undefined)
      setGenerationProgress(0)
      setGenerationSteps([])

    } catch (error: any) {
      console.error('❌ Error during auto-generation:', error)
      const currentSteps = generationSteps
      const failedStep = currentSteps.find((s: GenerationStep) => s.status === 'generating')
      if (failedStep) {
        updateStepStatus(failedStep.id, 'error', error.message || 'Generation failed')
      }
      setIsAutoGenerating(false)
      setCurrentGenerationStep(undefined)
    }
  }

  const updateStepStatus = (stepId: string, status: GenerationStep['status'], error?: string) => {
    setGenerationSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, error }
        : step
    ))
  }

  const renderTabContent = () => {
    if (!preProductionData) return null

    const commonProps = {
      preProductionData,
      onUpdate: handleTabUpdate,
      currentUserId: user?.id || '',
      currentUserName: user?.displayName || user?.email || 'User'
    }

    switch (activeTab) {
      case 'scripts':
        return <ScriptsTab {...commonProps} />
      case 'breakdown':
        return <ScriptBreakdownTab {...commonProps} />
      case 'storyboards':
        return <StoryboardsTab {...commonProps} onFrameUpdate={async (frameId: string, updates: { frameImage: string }) => {
          await updateStoryboardFrame(frameId, updates)
          // Return void to match expected signature
        }} />
      case 'shotlist':
        return <ShotListTab {...commonProps} />
      case 'marketing':
        return <EpisodeMarketingTab 
          preProductionData={preProductionData}
          onUpdate={async (updates: Partial<EpisodePreProductionData>) => {
            // Adapt the onUpdate signature to match EpisodeMarketingTab's expectations
            // EpisodeMarketingTab expects updates to be Partial<EpisodePreProductionData>
            // but handleTabUpdate expects (tabName: string, tabData: any)
            // So we need to extract the marketing data and call handleTabUpdate with 'marketing'
            if (updates.marketing) {
              await handleTabUpdate('marketing', updates.marketing)
            } else {
              // If updates don't have marketing, update the whole preProductionData
              // This is a fallback for any other properties that might be updated
              await handleTabUpdate('', updates)
            }
          }}
          currentUserId={user?.id || ''}
          currentUserName={user?.displayName || user?.email || 'User'}
          episodeData={episodeData}
          narrativeEpisode={episodeData}
        />
      default:
        return <div>Tab not implemented</div>
    }
  }

  const handleExportPDF = () => {
    console.log('Export PDF - To be implemented')
    alert('PDF export coming soon!')
  }

  const handleExportCSV = () => {
    console.log('Export CSV - To be implemented')
    alert('CSV export coming soon!')
  }

  const handlePrint = () => {
    window.print()
  }

  const handleCopyJSON = async () => {
    if (preProductionData) {
      try {
        await navigator.clipboard.writeText(JSON.stringify(preProductionData, null, 2))
        alert('Copied to clipboard!')
      } catch (error) {
        console.error('Failed to copy:', error)
      }
    }
  }

  if (isLoading) {
    const hasData = !!preProductionData
    const hasStoryboards = !!(preProductionData?.storyboards?.scenes?.length)
    const imageCount = preProductionData?.storyboards?.scenes?.reduce(
      (sum: number, scene: any) => sum + (scene.frames?.filter((f: any) => f.frameImage)?.length || 0),
      0
    ) || 0
    
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#e7e7e7] text-lg font-medium mb-2">
            {hasData && hasStoryboards && imageCount > 0
              ? 'Loading images...'
              : 'Loading episode pre-production data...'}
          </p>
          {hasData && hasStoryboards && imageCount > 0 && (
            <p className="text-[#e7e7e7]/70 text-sm mb-2">
              Verifying {imageCount} image{imageCount !== 1 ? 's' : ''} are ready...
            </p>
          )}
          <p className="text-[#e7e7e7]/50 text-xs mt-3">
            Please wait while we load all your content from Firebase
          </p>
        </div>
      </div>
    )
  }

  if (!preProductionData) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#e7e7e7] text-xl mb-4">Episode pre-production data not found</p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 bg-[#10B981] text-black font-medium rounded-lg hover:bg-[#059669] transition-colors"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Background Image Generation Banner */}
      {isGeneratingImagesInBackground && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-[#10B981]/20 border-b-2 border-[#10B981] backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="text-[#10B981] font-medium text-sm">
                  Storyboard images generating in background...
                </p>
                {backgroundImageProgress && (
                  <p className="text-[#10B981]/70 text-xs mt-0.5">
                    {backgroundImageProgress.current} of {backgroundImageProgress.total} frames completed
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsGeneratingImagesInBackground(false)}
              className="text-[#10B981]/70 hover:text-[#10B981] transition-colors text-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      
      {/* Generation Progress Overlay */}
      <GenerationProgressOverlay
        isVisible={isAutoGenerating}
        steps={generationSteps}
        currentStep={currentGenerationStep}
        progress={generationProgress}
      />

      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-[#36393f] sticky top-0 z-40">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 rounded-lg border border-[#36393f] hover:bg-[#2a2a2a] transition-colors text-[#e7e7e7]"
                >
                  ← Back
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-[#10B981]">
                  Episode Pre-Production
                </h1>
                <p className="text-sm text-[#e7e7e7]/70">
                  Episode {preProductionData.episodeNumber}: {preProductionData.episodeTitle}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isSyncing && (
                <div className="flex items-center gap-2 text-sm text-[#10B981]">
                  <div className="w-3 h-3 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
                  <span>Syncing...</span>
                </div>
              )}
              
              <div className="text-sm text-[#e7e7e7]/50">
                {preProductionData.collaborators?.length || 0} collaborator
                {preProductionData.collaborators?.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar Navigation */}
        <motion.div
          initial={false}
          animate={{ width: sidebarCollapsed ? '80px' : '280px' }}
          className="bg-[#1a1a1a] border-r border-[#36393f] flex-shrink-0 overflow-y-auto"
        >
          <div className="p-4">
            {/* Collapse Toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full mb-4 p-2 rounded-lg border border-[#36393f] hover:bg-[#2a2a2a] transition-colors text-[#e7e7e7] flex items-center justify-center"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>

      {/* Tab Navigation */}
            <div className="space-y-1">
            {EPISODE_TABS.map((tab) => {
              const isActive = activeTab === tab.id
                
                // Calculate completion percentage for this tab
                const getTabCompletion = () => {
                  if (!preProductionData) return 0
                  switch (tab.id) {
                    case 'scripts':
                      return (preProductionData as any).scripts?.fullScript ? 100 : 0
                    case 'breakdown':
                      return (preProductionData.scriptBreakdown?.scenes?.length ?? 0) > 0 ? 100 : 0
                    case 'storyboards':
                      return (preProductionData.storyboards?.scenes?.length ?? 0) > 0 ? 100 : 0
                    case 'shotlist':
                      return (preProductionData.shotList?.scenes?.length ?? 0) > 0 ? 100 : 0
                    case 'marketing':
                      return (preProductionData.marketing ? 100 : 0)
                    default:
                      return 0
                  }
                }
                
                const completion = getTabCompletion()
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as EpisodeTabType)}
                  className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative
                      ${isActive 
                        ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40' 
                        : 'text-[#e7e7e7]/70 hover:bg-[#2a2a2a] hover:text-[#e7e7e7]'
                      }
                  `}
                  >
                    <span className="text-xl flex-shrink-0">{tab.icon}</span>
                    {!sidebarCollapsed && (
                      <>
                        <div className="flex-1 text-left min-w-0">
                          <div className="font-medium text-sm">{tab.label}</div>
                          <div className="text-xs opacity-60 mt-0.5">{tab.description}</div>
                        </div>
                        {/* Progress Indicator */}
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full border-2 border-[#36393f] flex items-center justify-center text-xs font-bold"
                  style={{
                              borderColor: completion === 100 ? '#10B981' : '#36393f',
                              backgroundColor: completion === 100 ? '#10B981/20' : 'transparent',
                              color: completion === 100 ? '#10B981' : '#e7e7e7/50'
                            }}
                          >
                            {completion === 100 ? '✓' : completion}
                    </div>
                  </div>
                      </>
                    )}
                </button>
              )
            })}
          </div>
        </div>
        </motion.div>

      {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {/* Export Toolbar */}
        <ExportToolbar
          onExportPDF={handleExportPDF}
          onExportCSV={handleExportCSV}
          onPrint={handlePrint}
          onCopyJSON={handleCopyJSON}
          disabled={isSyncing}
        />

        {/* Tab Content with Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

