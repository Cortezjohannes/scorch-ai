'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import type { PreProductionData, EpisodePreProductionData, StoryboardFrame, StoryboardsData } from '@/types/preproduction'
import { EditableField } from '../shared/EditableField'
import { CollaborativeNotes } from '../shared/CollaborativeNotes'
import { getStoryBible } from '@/services/story-bible-service'
import { dataUrlToBlobUrl, revokeBlobUrl, isDataUrl } from '@/utils/image-utils'
import { getStoryboardReferenceImages } from '@/services/storyboard-reference-service'
import { generateAllStoryboardImages } from '@/services/storyboard-image-generation-service'
import type { StoryBible } from '@/services/story-bible-service'

interface StoryboardsTabProps {
  preProductionData: PreProductionData
  onUpdate: (tabName: string, tabData: any) => Promise<void>
  onFrameUpdate?: (frameId: string, updates: { frameImage: string }) => Promise<void>
  currentUserId: string
  currentUserName: string
}

export function StoryboardsTab({
  preProductionData,
  onUpdate,
  onFrameUpdate,
  currentUserId,
  currentUserName
}: StoryboardsTabProps) {
  const router = useRouter()
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [generatingImageFrameId, setGeneratingImageFrameId] = useState<string | null>(null)
  const [imageGenerationProgress, setImageGenerationProgress] = useState<{ current: number; total: number } | null>(null)
  const [isGeneratingAllImages, setIsGeneratingAllImages] = useState(false)
  const [bulkImageProgress, setBulkImageProgress] = useState<{ current: number; total: number; frameId: string | null } | null>(null)
  const [currentlyGeneratingFrameId, setCurrentlyGeneratingFrameId] = useState<string | null>(null)
  const [bulkGenerationStartTime, setBulkGenerationStartTime] = useState<number | null>(null)
  const [bulkGenerationElapsedTime, setBulkGenerationElapsedTime] = useState(0)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmModalData, setConfirmModalData] = useState<{ framesCount: number; onConfirm: () => void } | null>(null)
  
  const episodeData = preProductionData as EpisodePreProductionData
  
  // LocalStorage utility functions for storyboard images
  const getStorageKey = () => `storyboard-images-${episodeData.storyBibleId}-ep${episodeData.episodeNumber}`
  
  // Helper to create a stable key for a frame (sceneNumber-shotNumber)
  const getFrameKey = (sceneNumber: number, shotNumber: string): string => {
    return `s${sceneNumber}-shot${shotNumber}`
  }
  
  const saveImagesToLocalStorage = (storyboards: StoryboardsData) => {
    try {
      // Use stable keys (sceneNumber-shotNumber) instead of frame.id
      // This ensures images persist even if frame IDs are regenerated
      const imageMap: Record<string, string> = {}
      storyboards.scenes?.forEach(scene => {
        scene.frames?.forEach(frame => {
          if (frame.frameImage) {
            const stableKey = getFrameKey(frame.sceneNumber, frame.shotNumber)
            imageMap[stableKey] = frame.frameImage
            // Also save by frame.id for backward compatibility
            imageMap[frame.id] = frame.frameImage
          }
        })
      })
      localStorage.setItem(getStorageKey(), JSON.stringify(imageMap))
      console.log('✅ Saved images to localStorage:', Object.keys(imageMap).length, 'entries')
    } catch (e) {
      console.warn('❌ Failed to save images to localStorage:', e)
    }
  }
  
  const loadImagesFromLocalStorage = (): Record<string, string> => {
    try {
      const data = localStorage.getItem(getStorageKey())
      if (data) {
        const imageMap = JSON.parse(data) as Record<string, string>
        console.log('✅ Loaded images from localStorage:', Object.keys(imageMap).length, 'entries')
        return imageMap
      }
    } catch (e) {
      console.warn('❌ Failed to load images from localStorage:', e)
    }
    return {}
  }
  
  // Use local state for storyboards to allow immediate UI updates
  const [localStoryboardsData, setLocalStoryboardsData] = useState<StoryboardsData | null>(null)
  
  // Track if we have pending local changes to prevent useEffect from overwriting them
  const hasPendingLocalChanges = useRef(false)
  const lastLocalUpdateTime = useRef<number>(0)
  const previousPropDataRef = useRef<StoryboardsData | null>(null)
  
  // Helper function to check if local data has images that prop data is missing
  const localHasImagesPropMissing = (local: StoryboardsData | null, prop: StoryboardsData): boolean => {
    if (!local) return false
    
    // Check each scene and frame in local data
    for (const localScene of local.scenes || []) {
      const propScene = prop.scenes?.find(s => s.sceneNumber === localScene.sceneNumber)
      if (!propScene) continue
      
      for (const localFrame of localScene.frames || []) {
        const propFrame = propScene.frames?.find(f => f.id === localFrame.id)
        // If local frame has an image but prop frame doesn't, we should preserve local
        if (localFrame.frameImage && (!propFrame || !propFrame.frameImage)) {
          return true
        }
      }
    }
    return false
  }
  
  // Helper function to deduplicate frames by ID within storyboards data
  const deduplicateFrames = (storyboards: StoryboardsData): StoryboardsData => {
    let totalDuplicatesRemoved = 0
    const deduplicatedScenes = storyboards.scenes.map(scene => {
      if (!scene.frames || !Array.isArray(scene.frames)) {
        return scene
      }
      
      const seenIds = new Set<string>()
      const deduplicatedFrames: any[] = []
      const beforeCount = scene.frames.length
      
      scene.frames.forEach((frame: any) => {
        if (!frame.id) {
          console.warn(`⚠️ [DEDUPE] Frame without ID in scene ${scene.sceneNumber} (shotNumber: ${frame.shotNumber})`)
          totalDuplicatesRemoved++
          return
        }
        
        if (seenIds.has(frame.id)) {
          console.warn(`⚠️ [DEDUPE] Duplicate frame ID ${frame.id} in scene ${scene.sceneNumber} (shotNumber: ${frame.shotNumber})`)
          totalDuplicatesRemoved++
          return
        }
        
        seenIds.add(frame.id)
        deduplicatedFrames.push(frame)
      })
      
      if (beforeCount > deduplicatedFrames.length) {
        console.log(`✅ [DEDUPE] Scene ${scene.sceneNumber}: Removed ${beforeCount - deduplicatedFrames.length} duplicate frames (${beforeCount} → ${deduplicatedFrames.length})`)
      }
      
      return {
        ...scene,
        frames: deduplicatedFrames
      }
    })
    
    if (totalDuplicatesRemoved > 0) {
      console.log(`✅ [DEDUPE] Total duplicates removed from storyboards: ${totalDuplicatesRemoved}`)
    }
    
    return {
      ...storyboards,
      scenes: deduplicatedScenes
    }
  }
  
  // Helper function to merge localStorage images into storyboards data
  // CRITICAL: Only fill gaps - NEVER override Firestore Storage URLs
  // CRITICAL: If Firestore has ANY images, DO NOT use localStorage at all
  const mergeLocalStorageImages = (
    storyboards: StoryboardsData, 
    storedImages: Record<string, string>,
    options?: { preserveFirestore?: boolean }
  ): StoryboardsData => {
    // CRITICAL: If Firestore has images, DO NOT merge localStorage
    // This prevents localStorage from being used when Firestore should be the source
    const firestoreImageCount = countImagesInStoryboards(storyboards)
    if (firestoreImageCount > 0) {
      console.log(`⏭️ Skipping localStorage merge - Firestore has ${firestoreImageCount} images (Firestore is source of truth)`)
      return storyboards
    }
    // If preserveFirestore is true, NEVER overwrite Storage URLs
    const preserveFirestore = options?.preserveFirestore ?? true
    
    // First, deduplicate frames before merging
    const deduplicatedStoryboards = deduplicateFrames(storyboards)
    
    let appliedCount = 0
    let skippedCount = 0
    let preservedCount = 0
    const mergedScenes = deduplicatedStoryboards.scenes.map(scene => ({
      ...scene,
      frames: scene.frames.map(frame => {
        // CRITICAL: If frame has Firestore Storage URL, NEVER overwrite
        if (preserveFirestore && frame.frameImage && 
            (frame.frameImage.startsWith('https://firebasestorage.googleapis.com/') ||
             frame.frameImage.startsWith('https://storage.googleapis.com/'))) {
          preservedCount++
          return frame // Keep Firestore Storage URL - this is the source of truth
        }
        
        // Only fill gaps - don't overwrite existing images
        if (!frame.frameImage) {
        // Try to find image by stable key first (sceneNumber-shotNumber)
        const stableKey = getFrameKey(frame.sceneNumber, frame.shotNumber)
        let storedImage = storedImages[stableKey]
        
        // Fallback to frame.id for backward compatibility
        if (!storedImage) {
          storedImage = storedImages[frame.id]
        }
        
        if (storedImage) {
            console.log(`✅ Filling gap: Applying stored image for Scene ${frame.sceneNumber} Shot ${frame.shotNumber} (key: ${stableKey}) from localStorage`, {
              imageType: storedImage.startsWith('https://') ? 'Storage URL' : 'base64',
              imageLength: storedImage.length
            })
            appliedCount++
            return { ...frame, frameImage: storedImage }
          }
        }
        
        // If frame has an image (but not Storage URL) and localStorage has one, log but don't override
        if (frame.frameImage) {
          const stableKey = getFrameKey(frame.sceneNumber, frame.shotNumber)
          const storedImage = storedImages[stableKey] || storedImages[frame.id]
          if (storedImage) {
            skippedCount++
          }
        }
        
        return frame
      })
    }))
    
    if (preservedCount > 0) {
      console.log(`🔒 Preserved ${preservedCount} Firestore Storage URLs (source of truth)`)
    }
    if (appliedCount > 0) {
      console.log(`✅ Applied ${appliedCount} images from localStorage (filled gaps only)`)
    }
    if (skippedCount > 0) {
      console.log(`⏭️ Skipped ${skippedCount} localStorage images - existing images take priority`)
    }
    if (Object.keys(storedImages).length > 0 && appliedCount === 0 && skippedCount === 0 && preservedCount === 0) {
      console.log(`⚠️ Found ${Object.keys(storedImages).length} stored images but none matched current frames`)
    }
    
    return {
      ...storyboards,
      scenes: mergedScenes
    }
  }
  
  // Helper function to merge prop data with local images
  // CRITICAL: Never overwrite Firestore Storage URLs from prop data
  const mergePropWithLocalImages = (prop: StoryboardsData, local: StoryboardsData): StoryboardsData => {
    const mergedScenes = prop.scenes.map(propScene => {
      const localScene = local.scenes?.find(s => s.sceneNumber === propScene.sceneNumber)
      if (!localScene) return propScene
      
      const mergedFrames = propScene.frames.map(propFrame => {
        const localFrame = localScene.frames?.find(f => f.id === propFrame.id)
        
        // CRITICAL: If prop has Firestore Storage URL, NEVER overwrite it
        if (propFrame.frameImage && 
            (propFrame.frameImage.startsWith('https://firebasestorage.googleapis.com/') ||
             propFrame.frameImage.startsWith('https://storage.googleapis.com/'))) {
          return propFrame // Keep Firestore Storage URL - source of truth
        }
        
        // If local has an image but prop doesn't, use local's image
        if (localFrame?.frameImage && !propFrame.frameImage) {
          return { ...propFrame, frameImage: localFrame.frameImage }
        }
        return propFrame
      })
      
      return { ...propScene, frames: mergedFrames }
    })
    
    return {
      ...prop,
      scenes: mergedScenes,
      lastUpdated: Math.max(prop.lastUpdated || 0, local.lastUpdated || 0)
    }
  }
  
  // Helper function to count images in storyboards
  const countImagesInStoryboards = (storyboards: StoryboardsData): number => {
    if (!storyboards?.scenes) return 0
    return storyboards.scenes.reduce((sum, scene) => 
      sum + (scene.frames || []).filter(f => f.frameImage).length, 0
    )
  }
  
  // Initialize or sync with prop data - Firestore Storage URLs are the source of truth
  useEffect(() => {
    const loadId = `load_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    // Log what we're receiving from Firestore
      if (episodeData.storyboards) {
      const storyboards = episodeData.storyboards
      let imagesInFirestore = 0
      let storageUrlsInFirestore = 0
      storyboards.scenes?.forEach((scene: any) => {
        scene.frames?.forEach((frame: any) => {
          if (frame.frameImage) {
            imagesInFirestore++
            const isStorageUrl = frame.frameImage.startsWith('https://firebasestorage.googleapis.com/') || 
                                 frame.frameImage.startsWith('https://storage.googleapis.com/')
            if (isStorageUrl) {
              storageUrlsInFirestore++
            }
            console.log(`📸 [${loadId}] Image found in Firestore data:`, {
              frameId: frame.id,
              scene: frame.sceneNumber,
              shot: frame.shotNumber,
              imageType: isStorageUrl ? 'Firebase Storage URL ✅' : frame.frameImage.startsWith('data:') ? 'base64' : 'external URL',
              imageLength: frame.frameImage.length,
              imagePreview: frame.frameImage.substring(0, 60) + '...',
              fullUrl: isStorageUrl ? frame.frameImage : undefined // Log full Storage URL
            })
          }
        })
      })
      console.log(`📥 [${loadId}] Received storyboards from Firestore:`, {
        scenes: storyboards.scenes?.length || 0,
        totalFrames: storyboards.scenes?.reduce((sum: number, s: any) => sum + (s.frames?.length || 0), 0) || 0,
        framesWithImages: imagesInFirestore,
        framesWithStorageUrls: storageUrlsInFirestore,
        lastUpdated: storyboards.lastUpdated,
        lastUpdatedDate: storyboards.lastUpdated ? new Date(storyboards.lastUpdated).toISOString() : 'none'
      })
          } else {
      console.log(`📥 [${loadId}] No storyboards data in episodeData`)
    }
    
    // CRITICAL: Firestore data is source of truth - never overwrite images from Firestore
    if (episodeData.storyboards) {
      // Validate images are present in Firestore data
      const firestoreImageCount = countImagesInStoryboards(episodeData.storyboards)
      console.log(`📊 [${loadId}] Firestore image count: ${firestoreImageCount}`)
      
      // Always use Firestore data as base, only fill gaps from localStorage
      setLocalStoryboardsData(prevLocalData => {
        // Count images in previous data to detect loss
        const prevImageCount = prevLocalData ? countImagesInStoryboards(prevLocalData) : 0
        
        // If Firestore has data, use it as base
        const base = deduplicateFrames(episodeData.storyboards!)
        const baseImageCount = countImagesInStoryboards(base)
        
        // Only merge localStorage for frames that don't have images in Firestore
        const storedImages = loadImagesFromLocalStorage()
        const merged = mergeLocalStorageImages(base, storedImages, { preserveFirestore: true })
        const mergedImageCount = countImagesInStoryboards(merged)
        
        // CRITICAL: Validate we didn't lose images
        if (prevImageCount > 0 && mergedImageCount < prevImageCount && baseImageCount < prevImageCount) {
          console.error(`❌ [${loadId}] IMAGE LOSS DETECTED: Had ${prevImageCount} images, now have ${mergedImageCount} (Firestore: ${baseImageCount})`)
          // If we're losing images and Firestore doesn't have them, keep previous data
          if (baseImageCount === 0) {
            console.warn(`⚠️ [${loadId}] Firestore has no images, keeping previous data to prevent loss`)
            return prevLocalData || base
          }
        }
        
        console.log(`✅ [${loadId}] Merged storyboards: ${mergedImageCount} images total (Firestore: ${baseImageCount}, localStorage fill: ${mergedImageCount - baseImageCount})`)
        
        previousPropDataRef.current = merged
            hasPendingLocalChanges.current = false
                return merged
      })
      } else {
      // No Firestore data - initialize with default or keep existing
      setLocalStoryboardsData(prevLocalData => {
        if (!prevLocalData) {
          const defaultData = {
            episodeNumber: episodeData.episodeNumber,
            episodeTitle: episodeData.episodeTitle || `Episode ${episodeData.episodeNumber}`,
            totalFrames: 0,
            finalizedFrames: 0,
            scenes: [],
            lastUpdated: Date.now(),
            updatedBy: currentUserId
          }
          hasPendingLocalChanges.current = false
          return defaultData
        }
        return prevLocalData
    })
    }
  }, [episodeData.storyboards, episodeData.episodeNumber, episodeData.episodeTitle, currentUserId])
  
  // Monitor image state to detect loss
  useEffect(() => {
    if (!localStoryboardsData) return
    
    const imageCount = localStoryboardsData.scenes.reduce((sum, scene) => 
      sum + (scene.frames || []).filter(f => f.frameImage).length, 0
    )
    
    const totalFrames = localStoryboardsData.scenes.reduce((sum, s) => 
      sum + (s.frames?.length || 0), 0
    )
    
    console.log(`🖼️ [StoryboardsTab] Current image state:`, {
      imageCount,
      totalFrames,
      scenes: localStoryboardsData.scenes.length,
      imagesByScene: localStoryboardsData.scenes.map(s => ({
        scene: s.sceneNumber,
        frames: s.frames?.length || 0,
        images: s.frames?.filter(f => f.frameImage).length || 0,
        framesWithStorageUrls: s.frames?.filter(f => 
          f.frameImage && (
            f.frameImage.startsWith('https://firebasestorage.googleapis.com/') ||
            f.frameImage.startsWith('https://storage.googleapis.com/')
          )
        ).length || 0
      }))
    })
  }, [localStoryboardsData])
  
  // Force load images from localStorage on mount and whenever storyboards data changes
  // Only fills gaps - never overrides Firestore Storage URLs
  useEffect(() => {
    if (!localStoryboardsData) return
    
    const storedImages = loadImagesFromLocalStorage()
    if (Object.keys(storedImages).length > 0) {
      console.log('🔄 Checking localStorage for missing images (gaps only):', Object.keys(storedImages).length, 'entries')
      
      // Check if any frames are missing images that we have in storage
      // Only fill gaps - don't override existing Storage URLs
      const needsUpdate = localStoryboardsData.scenes.some(scene => 
        scene.frames.some(frame => {
          // Skip if frame already has a Storage URL from Firestore
          if (frame.frameImage && 
              (frame.frameImage.startsWith('https://firebasestorage.googleapis.com/') || 
               frame.frameImage.startsWith('https://storage.googleapis.com/'))) {
            return false // Don't override Storage URLs
          }
          // Only fill if frame has no image
          const stableKey = getFrameKey(frame.sceneNumber, frame.shotNumber)
          return (storedImages[stableKey] || storedImages[frame.id]) && !frame.frameImage
        })
      )
      
      if (needsUpdate) {
        console.log('✅ Filling gaps: Applying missing images from localStorage (Storage URLs preserved)')
        setLocalStoryboardsData(prev => {
          if (!prev) return prev
          return mergeLocalStorageImages(prev, storedImages)
        })
      } else {
        console.log('⏭️ No gaps to fill - all frames have images or localStorage has no matches')
      }
    }
  }, [localStoryboardsData?.scenes?.length, episodeData.storyBibleId, episodeData.episodeNumber]) // Run when storyboards change
  
  const storyboardsData: StoryboardsData = localStoryboardsData || {
    episodeNumber: episodeData.episodeNumber,
    episodeTitle: episodeData.episodeTitle || `Episode ${episodeData.episodeNumber}`,
    totalFrames: 0,
    finalizedFrames: 0,
    scenes: [],
    lastUpdated: Date.now(),
    updatedBy: currentUserId
  }

  const breakdownData = episodeData.scriptBreakdown
  const scriptsData = (episodeData as any).scripts

  const handleFrameUpdate = async (frameId: string, updates: Partial<StoryboardFrame>) => {
    console.log('🔄 handleFrameUpdate called for frame:', frameId, 'updates:', Object.keys(updates))
    
    // Use functional update to always work with latest state
    let updatedStoryboards: StoryboardsData | null = null
    let previousData: StoryboardsData | null = null
    
    setLocalStoryboardsData((prevData): StoryboardsData | null => {
      // Save previous data for potential revert
      previousData = prevData
      
      // CRITICAL: Get current data - prioritize prevData, then Firestore data from props, then fallback
      // This ensures we never lose existing scenes/frames when updating
      const currentData: StoryboardsData = prevData || episodeData.storyboards || {
        episodeNumber: episodeData.episodeNumber,
        episodeTitle: episodeData.episodeTitle || `Episode ${episodeData.episodeNumber}`,
        totalFrames: 0,
        finalizedFrames: 0,
        scenes: [],
        lastUpdated: Date.now(),
        updatedBy: currentUserId
      }
      
      // Log the source of current data for debugging
      console.log(`🔍 [${frameId}] Building storyboards data for save:`, {
        hasPrevData: !!prevData,
        prevDataScenes: prevData?.scenes?.length || 0,
        prevDataFrames: prevData?.scenes?.reduce((sum: number, s: any) => sum + (s.frames?.length || 0), 0) || 0,
        hasEpisodeData: !!episodeData.storyboards,
        episodeDataScenes: episodeData.storyboards?.scenes?.length || 0,
        episodeDataFrames: episodeData.storyboards?.scenes?.reduce((sum: number, s: any) => sum + (s.frames?.length || 0), 0) || 0,
        dataSource: prevData ? 'prevData (local state)' : episodeData.storyboards ? 'episodeData.storyboards (Firestore props)' : 'fallback (empty)'
      })
      
      const updatedScenes = (currentData.scenes || []).map(scene => ({
        ...scene,
        frames: (scene.frames || []).map(frame =>
          frame.id === frameId ? { ...frame, ...updates } : frame
        )
      }))
      
      // Recalculate totals
      const totalFrames = updatedScenes.reduce((sum, scene) => sum + (scene.frames?.length || 0), 0)
      const finalizedFrames = updatedScenes.reduce((sum, scene) => 
        sum + (scene.frames || []).filter(f => f.status === 'final').length, 0
      )
      
      const updateTime = Date.now()
      updatedStoryboards = {
        ...currentData,
        scenes: updatedScenes,
        totalFrames,
        finalizedFrames,
        lastUpdated: updateTime,
        updatedBy: currentUserId
      }
      
      // Mark that we have pending local changes
      hasPendingLocalChanges.current = true
      lastLocalUpdateTime.current = updateTime
      
      console.log('✅ Local state updated, frame should now show image')
      return updatedStoryboards
    })
    
    // Then save to Firestore (setState callback executes synchronously, so updatedStoryboards is set)
    if (updatedStoryboards) {
      try {
        // Verify the update includes the image before saving
        const storyboards: StoryboardsData = updatedStoryboards
        const scenes = storyboards.scenes || []
        const frameWithImage = scenes
          .flatMap((s: any) => s.frames || [])
          .find((f: StoryboardFrame) => f.id === frameId && f.frameImage)
        
        if (frameWithImage && 'frameImage' in updates && updates.frameImage) {
          console.log('✅ Verifying image is included in save:', {
            frameId,
            hasImage: !!frameWithImage.frameImage,
            imageLength: frameWithImage.frameImage?.length || 0
          })
          // Save to localStorage immediately after image generation
          saveImagesToLocalStorage(updatedStoryboards)
        }
        
        // Log detailed info about what we're saving
        const imageInfo = {
          frameId,
          hasImage: !!frameWithImage?.frameImage,
          imageLength: frameWithImage?.frameImage?.length || 0,
          imageType: frameWithImage?.frameImage?.startsWith('data:') ? 'base64' : 'external URL',
          imagePreview: frameWithImage?.frameImage?.substring(0, 60) + '...' || 'none',
          totalFramesWithImages: scenes
            .flatMap(s => s.frames || [])
            .filter(f => f.frameImage).length
        }
        
        // CRITICAL: Log FULL image data to verify it's included
        if (frameWithImage?.frameImage) {
          console.log(`🔗 [${frameId}] FULL IMAGE URL IN STORYBOARDS DATA:`, frameWithImage.frameImage)
          
          // Verify it's a Storage URL
          if (frameWithImage.frameImage.startsWith('https://firebasestorage.googleapis.com/') || 
              frameWithImage.frameImage.startsWith('https://storage.googleapis.com/')) {
            console.log(`✅ [${frameId}] Verified: Image is a Firebase Storage URL`)
          } else {
            console.error(`❌ [${frameId}] ERROR: Image is NOT a Storage URL!`, {
              url: frameWithImage.frameImage.substring(0, 100) + '...'
            })
          }
        } else {
          console.error(`❌ [${frameId}] ERROR: Frame with image NOT FOUND in storyboards data being saved!`)
          console.error(`❌ [${frameId}] Available frames:`, scenes.flatMap(s => s.frames || []).map(f => ({
            id: f.id,
            sceneNumber: f.sceneNumber,
            shotNumber: f.shotNumber,
            hasImage: !!f.frameImage
          })))
        }
        
        // CRITICAL: Verify we're not losing scenes/frames
        const scenesCount = (updatedStoryboards as StoryboardsData).scenes?.length || 0
        const framesCount = (updatedStoryboards as StoryboardsData).scenes?.reduce((sum: number, s: any) => sum + (s.frames?.length || 0), 0) || 0
        const originalScenesCount = episodeData.storyboards?.scenes?.length || 0
        const originalFramesCount = episodeData.storyboards?.scenes?.reduce((sum: number, s: any) => sum + (s.frames?.length || 0), 0) || 0
        
        if (scenesCount < originalScenesCount || framesCount < originalFramesCount) {
          console.error(`❌ [${frameId}] CRITICAL: LOSING DATA! Saving fewer scenes/frames than exist in Firestore!`, {
            savingScenes: scenesCount,
            originalScenes: originalScenesCount,
            savingFrames: framesCount,
            originalFrames: originalFramesCount,
            lostScenes: originalScenesCount - scenesCount,
            lostFrames: originalFramesCount - framesCount
          })
        }
        
        console.log(`💾 [${frameId}] ========== SAVING STORYBOARDS TO FIRESTORE ==========`)
        console.log(`💾 [${frameId}] Storyboards data being saved:`, {
          ...imageInfo,
          scenes: scenesCount,
          totalFrames: framesCount,
          originalScenes: originalScenesCount,
          originalFrames: originalFramesCount,
          frameWithImage: frameWithImage ? {
            frameId: frameWithImage.id,
            sceneNumber: frameWithImage.sceneNumber,
            shotNumber: frameWithImage.shotNumber,
            hasImage: !!frameWithImage.frameImage,
            imageType: frameWithImage.frameImage?.startsWith('https://firebasestorage.googleapis.com/') || 
                       frameWithImage.frameImage?.startsWith('https://storage.googleapis.com/') 
                       ? 'Storage URL ✅' : frameWithImage.frameImage?.startsWith('data:') ? 'base64 ⚠️' : 'unknown',
            imagePreview: frameWithImage.frameImage?.substring(0, 80) + '...' || 'none'
          } : 'none'
        })
        
        const saveStartTime = Date.now()
        try {
        await onUpdate('storyboards', updatedStoryboards)
          const saveDuration = Date.now() - saveStartTime
          
          console.log(`✅ [${frameId}] ========== STORYBOARDS SAVED TO FIRESTORE ==========`, {
            duration: `${saveDuration}ms`,
            ...imageInfo,
            imageType: frameWithImage?.frameImage?.startsWith('https://') ? 'Storage URL ✅' : frameWithImage?.frameImage?.startsWith('data:') ? 'base64 ⚠️' : 'none'
          })
        } catch (saveError: any) {
          console.error(`❌ [${frameId}] ========== FIRESTORE SAVE FAILED ==========`, {
            error: saveError.message,
            stack: saveError.stack,
            code: saveError.code,
            ...imageInfo
          })
          throw saveError
        }
        
        // Also save to localStorage after Firestore save (in case image was added)
        saveImagesToLocalStorage(updatedStoryboards)
        console.log(`💾 [${frameId}] Images also saved to localStorage`)
        
        // Don't reset the flag immediately - let it persist to prevent overwrite
        // The flag will be reset when useEffect successfully merges with prop data
      } catch (error: any) {
        console.error(`❌ [${frameId}] Error saving to Firestore:`, {
          error: error.message,
          stack: error.stack,
          code: error.code,
          frameId,
          hasImage: !!updates.frameImage,
          imageLength: updates.frameImage?.length || 0
        })
        // Revert local state on error
        if (previousData !== null) {
          console.warn(`⚠️  [${frameId}] Reverting to previous state due to save error`)
          setLocalStoryboardsData(previousData)
          // Reset flags on error
          hasPendingLocalChanges.current = false
          lastLocalUpdateTime.current = 0
        }
      }
    }
  }

  const handleAddFrame = async (sceneNumber: number) => {
    const scene = storyboardsData.scenes.find(s => s.sceneNumber === sceneNumber)
    const shotNumber = scene ? String(scene.frames.length + 1) : '1'
    
    const newFrame: StoryboardFrame = {
      id: `frame_${Date.now()}`,
      sceneNumber: sceneNumber,
      shotNumber: shotNumber,
      cameraAngle: 'medium',
      cameraMovement: 'static',
      dialogueSnippet: '',
      lightingNotes: '',
      propsInFrame: [],
      referenceImages: [],
      status: 'draft',
      notes: '',
      comments: []
    }
    
    const updatedScenes = (storyboardsData?.scenes || []).map(s =>
      s.sceneNumber === sceneNumber
        ? { ...s, frames: [...(s.frames || []), newFrame] }
        : s
    )
    
    // If scene doesn't exist, create it
    if (!scene) {
      updatedScenes.push({
        sceneNumber: sceneNumber,
        sceneTitle: `Scene ${sceneNumber}`,
        frames: [newFrame]
      })
    }
    
    const totalFrames = updatedScenes.reduce((sum, scene) => sum + scene.frames.length, 0)
    
    await onUpdate('storyboards', {
      ...storyboardsData,
      scenes: updatedScenes,
      totalFrames,
      lastUpdated: Date.now()
    })
  }

  const handleGenerateStoryboards = async () => {
    setIsGenerating(true)
    setGenerationError(null)

    try {
      console.log('🖼️ Generating storyboards...')

      // 1. Check prerequisites
      if (!breakdownData) {
        setGenerationError('Please generate script breakdown first. Go to Script Breakdown tab and generate a breakdown.')
        setIsGenerating(false)
        return
      }

      console.log('✅ Script breakdown found')
      console.log('  Total scenes:', breakdownData.scenes?.length || 0)

      if (!breakdownData.scenes || breakdownData.scenes.length === 0) {
        setGenerationError('Script breakdown has no scenes. Please regenerate script breakdown.')
        setIsGenerating(false)
        return
      }

      // Script data is optional but helpful
      if (!scriptsData?.fullScript) {
        console.warn('⚠️ Script data not found, will use breakdown data only')
      } else {
        console.log('✅ Script data found')
      }

      // 2. Fetch story bible
      console.log('📖 Fetching story bible...')
      const storyBible = await getStoryBible(episodeData.storyBibleId, currentUserId)

      if (!storyBible) {
        throw new Error('Story bible not found')
      }

      console.log('✅ Story bible loaded:', storyBible.seriesTitle || storyBible.title)
      
      // VERIFY: Check if story bible has character images
      if (storyBible.mainCharacters && storyBible.mainCharacters.length > 0) {
        const charactersWithImages = storyBible.mainCharacters.filter((char: any) => char.visualReference?.imageUrl).length
        console.log(`📸 Story bible has ${storyBible.mainCharacters.length} characters, ${charactersWithImages} have images`)
        if (charactersWithImages === 0) {
          console.error(`⚠️⚠️⚠️ WARNING: NO CHARACTER IMAGES IN STORY BIBLE! Storyboards will NOT match character appearances! ⚠️⚠️⚠️`)
        } else {
          storyBible.mainCharacters.forEach((char: any, idx: number) => {
            if (char.visualReference?.imageUrl) {
              console.log(`  ✅ ${char.name || 'Unnamed'}: HAS IMAGE - ${char.visualReference.imageUrl.substring(0, 60)}...`)
            }
          })
        }
      } else {
        console.warn(`⚠️ Story bible has no mainCharacters array`)
      }

      // 3. Call generation API with extended timeout
      console.log('🤖 Calling storyboard generation API...')
      
      // Create AbortController with 3-minute timeout (storyboards can take 80+ seconds)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 180000) // 3 minutes
      
      let response
      try {
        response = await fetch('/api/generate/storyboards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            preProductionId: episodeData.id,
            storyBibleId: episodeData.storyBibleId,
            episodeNumber: episodeData.episodeNumber,
            userId: currentUserId,
            breakdownData,
            scriptData: scriptsData?.fullScript || null,
            storyBibleData: storyBible
          }),
          signal: controller.signal
        })
      } finally {
        clearTimeout(timeoutId)
      }

      if (!response.ok) {
        let errorMessage = 'Generation failed'
        try {
          const text = await response.text()
          if (text) {
            try {
              const errorData = JSON.parse(text)
              errorMessage = errorData.details || errorData.error || errorMessage
            } catch {
              errorMessage = text || `Server error: ${response.status} ${response.statusText}`
            }
          } else {
            errorMessage = `Server error: ${response.status} ${response.statusText}`
          }
        } catch (e) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const text = await response.text()
      if (!text) {
        throw new Error('Empty response from server')
      }

      let result
      try {
        result = JSON.parse(text)
      } catch (e) {
        console.error('Failed to parse JSON response:', text.substring(0, 500))
        throw new Error(`Invalid response format: ${e instanceof Error ? e.message : 'Unknown error'}`)
      }

      if (!result.storyboards) {
        throw new Error('Invalid response: storyboards data missing')
      }

      console.log('✅ Storyboards generated:', result.storyboards.totalFrames, 'frames')

      // 4. Update local state with generated storyboards
      const updatedStoryboards: StoryboardsData = {
        ...result.storyboards,
        lastUpdated: Date.now(),
        updatedBy: currentUserId
      }
      
      // Ensure art style is preserved
      if (result.storyboards.artStyle) {
        updatedStoryboards.artStyle = result.storyboards.artStyle
        console.log('✅ Art style stored:', result.storyboards.artStyle.name)
      }
      
      setLocalStoryboardsData(updatedStoryboards)

      // 5. Save to Firestore
      await onUpdate('storyboards', updatedStoryboards)

      console.log('✅ Storyboards saved to Firestore')

      // 6. Generate images for all frames
      console.log('🎨 Starting image generation for all frames...')
      const allFrames: Array<{ frame: StoryboardFrame; sceneNumber: number }> = []
      result.storyboards.scenes?.forEach((scene: any) => {
        scene.frames?.forEach((frame: StoryboardFrame) => {
          if (frame.imagePrompt) {
            allFrames.push({ frame, sceneNumber: scene.sceneNumber })
          }
        })
      })

      console.log(`📸 Found ${allFrames.length} frames with image prompts`)

      if (allFrames.length > 0) {
        setImageGenerationProgress({ current: 0, total: allFrames.length })
        
        // Get art style from storyboards data if available
        const artStyle = result.storyboards.artStyle || updatedStoryboards?.artStyle
        
        // Generate images sequentially to avoid overwhelming the API
        for (let i = 0; i < allFrames.length; i++) {
          const { frame, sceneNumber } = allFrames[i]
          try {
            console.log(`🎨 Generating image ${i + 1}/${allFrames.length} for frame ${frame.id} (Scene ${sceneNumber}, Shot ${frame.shotNumber})`)
            
            setGeneratingImageFrameId(frame.id)
            setImageGenerationProgress({ current: i + 1, total: allFrames.length })
            
            // Get reference images (character images + recent storyboard images) and character descriptions
            let referenceImages: string[] = []
            let characterDescriptions: Array<{ name: string; description: string }> = []
            let characterImageMap: Record<string, string> = {}
            if (storyBible && episodeData.storyBibleId) {
              try {
                const refData = await getStoryboardReferenceImages(
                  frame,
                  storyBible,
                  episodeData.storyBibleId,
                  currentUserId,
                  episodeData.episodeNumber
                )
                referenceImages = refData.images
                characterDescriptions = refData.characterDescriptions
                characterImageMap = refData.characterImageMap || {}
                console.log(`🎨 Frame ${frame.id}: Using ${referenceImages.length} reference image(s), ${characterDescriptions.length} character description(s), ${Object.keys(characterImageMap).length} character image mapping(s)`)
                if (referenceImages.length === 0) {
                  console.error(`⚠️⚠️⚠️ WARNING: NO REFERENCE IMAGES FOR FRAME ${frame.id}! Images will NOT match story bible characters! ⚠️⚠️⚠️`)
                } else {
                  console.log(`✅ Frame ${frame.id}: Reference images found - first image: ${referenceImages[0]?.substring(0, 80)}...`)
                  if (Object.keys(characterImageMap).length > 0) {
                    console.log(`✅ Frame ${frame.id}: Character mappings: ${Object.keys(characterImageMap).join(', ')}`)
                  }
                }
              } catch (refError: any) {
                console.warn(`⚠️ Failed to get reference images for frame ${frame.id}:`, refError.message)
                // Continue without reference images - graceful degradation
              }
            }
            
            const imageResponse = await fetch('/api/generate-image', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                prompt: frame.imagePrompt,
                artStyle: artStyle || undefined,
                userId: currentUserId,
                referenceImages: referenceImages.length > 0 ? referenceImages : undefined,
                characterDescriptions: characterDescriptions.length > 0 ? characterDescriptions : undefined,
                characterImageMap: Object.keys(characterImageMap).length > 0 ? characterImageMap : undefined
              })
            })

            if (!imageResponse.ok) {
              const contentType = imageResponse.headers.get('content-type') || ''
              const isJSON = contentType.includes('application/json')
              const text = await imageResponse.text()
              
              if (!isJSON && (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html'))) {
                console.error(`❌ Frame ${frame.id}: Server returned HTML error page`)
                continue // Skip this frame and continue with others
              }
              
              let errorMessage = 'Image generation failed'
              if (isJSON && text) {
                try {
                  const errorData = JSON.parse(text)
                  errorMessage = errorData.error || errorData.message || errorMessage
                } catch {
                  errorMessage = text.substring(0, 200) || `Server error: ${imageResponse.status}`
                }
              } else {
                errorMessage = text.substring(0, 200) || `Server error: ${imageResponse.status}`
              }
              console.error(`❌ Frame ${frame.id}: ${errorMessage}`)
              continue // Skip this frame and continue with others
            }

            const imageText = await imageResponse.text()
            if (!imageText) {
              console.error(`❌ Frame ${frame.id}: Empty response from server`)
              continue
            }

            // Check if response is HTML (error page)
            if (imageText.trim().startsWith('<!DOCTYPE') || imageText.trim().startsWith('<html')) {
              console.error(`❌ Frame ${frame.id}: Server returned HTML instead of JSON`)
              continue
            }

            let imageResult
            try {
              imageResult = JSON.parse(imageText)
            } catch (e) {
              console.error(`❌ Frame ${frame.id}: Failed to parse JSON response`)
              continue
            }

            let imageUrl = imageResult.imageUrl || imageResult.url
            if (!imageUrl) {
              console.error(`❌ Frame ${frame.id}: No image URL in response`)
              continue
            }

            // SIMPLIFIED: Always upload to Storage (same as single image generation)
            let finalImageUrl: string
            const isAlreadyStorageUrl = imageUrl.includes('firebasestorage.googleapis.com') || 
                                         imageUrl.startsWith('https://storage.googleapis.com/')
            
            if (isAlreadyStorageUrl) {
              finalImageUrl = imageUrl
              console.log(`✅ Frame ${frame.id}: API returned Storage URL`)
            } else {
              // Upload to Storage client-side
              console.log(`📤 Uploading frame ${frame.id} to Firebase Storage...`)
              try {
                const { uploadImageToStorage } = await import('@/services/image-storage-service')
                const { hashPrompt } = await import('@/services/image-cache-service')
                
                // Convert external URLs to base64 if needed
                let imageDataToUpload = imageUrl
                if (!imageUrl.startsWith('data:')) {
                  const imageResponse = await fetch(imageUrl)
                  if (!imageResponse.ok) {
                    throw new Error(`Failed to fetch external image: ${imageResponse.statusText}`)
                  }
                  const imageBlob = await imageResponse.blob()
                  imageDataToUpload = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader()
                    reader.onloadend = () => resolve(reader.result as string)
                    reader.onerror = reject
                    reader.readAsDataURL(imageBlob)
                  })
                }
                
                const promptHash = await hashPrompt(frame.imagePrompt || `frame-${frame.id}`, artStyle || undefined)
                finalImageUrl = await uploadImageToStorage(currentUserId, imageDataToUpload, promptHash)
                console.log(`✅ Frame ${frame.id} uploaded to Storage: ${finalImageUrl.substring(0, 50)}...`)
                // Log FULL URL separately so it's not truncated
                console.log(`🔗 Frame ${frame.id} FULL Storage URL:`, finalImageUrl)
              } catch (uploadError: any) {
                console.error(`❌ Failed to upload frame ${frame.id} to Storage:`, uploadError.message)
                throw new Error(`Failed to upload frame ${frame.id} to Storage: ${uploadError.message}`)
              }
            }

            // Validate Storage URL before saving
            if (finalImageUrl.startsWith('data:') || 
                (!finalImageUrl.startsWith('https://firebasestorage.googleapis.com/') && 
                 !finalImageUrl.startsWith('https://storage.googleapis.com/'))) {
              console.error(`❌ Frame ${frame.id}: Invalid URL format - not a Storage URL!`)
              throw new Error(`Invalid URL format for frame ${frame.id}`)
            }

            // Update local state with Storage URL
            setLocalStoryboardsData(prev => {
              if (!prev) return prev
              return {
                ...prev,
                scenes: prev.scenes.map(scene => ({
                  ...scene,
                  frames: scene.frames.map(f => 
                    f.id === frame.id ? { ...f, frameImage: finalImageUrl } : f
                  )
                }))
              }
            })
            
            // Then save to Firestore (with Storage URL!)
            await handleFrameUpdate(frame.id, {
              frameImage: finalImageUrl
            })

            console.log(`✅ Image ${i + 1}/${allFrames.length} generated successfully for frame ${frame.id}`)
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500))
          } catch (error: any) {
            console.error(`❌ Error generating image for frame ${frame.id}:`, error.message)
            // Continue with next frame even if one fails
          } finally {
            setGeneratingImageFrameId(null)
          }
        }

        console.log('✅ Image generation completed for all frames')
        setImageGenerationProgress(null)
      } else {
        console.log('ℹ️ No frames with image prompts found, skipping image generation')
        setImageGenerationProgress(null)
      }
    } catch (error: any) {
      console.error('❌ Error generating storyboards:', error)
      
      // Check if this is an abort/timeout error
      if (error.name === 'AbortError') {
        console.log('⏱️ Request timed out after 3 minutes')
        setGenerationError('Generation is taking longer than expected. Please wait a moment and refresh the page to see if the storyboards were created.')
      } else if (error.message?.includes('fetch') || error.message?.includes('network')) {
        console.log('🌐 Network error - checking if data was saved...')
        
        // Wait a moment and check if data was actually saved despite the error
        setTimeout(async () => {
          try {
            // Reload the preproduction data to see if storyboards were saved
            const { getPreProduction } = await import('@/services/preproduction-service')
            const updatedData = await getPreProduction(episodeData.id, currentUserId)
            
            if (updatedData?.storyboards && updatedData.storyboards.scenes?.length > 0) {
              console.log('✅ Storyboards were saved successfully despite network error!')
              setGenerationError(null)
              setLocalStoryboardsData(updatedData.storyboards)
            } else {
              setGenerationError('Network error occurred. Please refresh the page to check if storyboards were created.')
            }
          } catch (recheckError) {
            setGenerationError('Network error occurred. Please refresh the page to check if storyboards were created.')
          } finally {
            setIsGenerating(false)
          }
        }, 2000)
        return // Don't set isGenerating to false yet
      } else {
        setGenerationError(error.message || 'Failed to generate storyboards')
      }
      
      setImageGenerationProgress(null)
      setGeneratingImageFrameId(null)
      
      // Redirect to Script Breakdown tab if breakdown not found
      if (error.message?.includes('breakdown') || error.message?.includes('Script breakdown')) {
        router.push('/preproduction?storyBibleId=' + episodeData.storyBibleId + '&episodeNumber=' + episodeData.episodeNumber + '&episodeTitle=' + encodeURIComponent(episodeData.episodeTitle || '') + '&tab=breakdown')
      }
    } finally {
      setIsGenerating(false)
      setImageGenerationProgress(null)
      setGeneratingImageFrameId(null)
    }
  }

  const handleGenerateImage = async (frame: StoryboardFrame) => {
    const generateId = `gen_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    if (!frame.imagePrompt) {
      console.error(`❌ [${generateId}] No image prompt available for frame ${frame.id}`)
      alert('No image prompt available for this frame')
      return
    }

    console.log(`🎨 [${generateId}] Starting image generation for frame`, {
      frameId: frame.id,
      sceneNumber: frame.sceneNumber,
      shotNumber: frame.shotNumber,
      promptLength: frame.imagePrompt.length,
      promptPreview: frame.imagePrompt.substring(0, 100) + '...',
      userId: currentUserId ? currentUserId.substring(0, 8) + '...' : 'none'
    })

    setGeneratingImageFrameId(frame.id)

    try {
      // Get art style from storyboards data if available
      const artStyle = storyboardsData.artStyle
      
      if (artStyle) {
        console.log(`🎨 [${generateId}] Using art style:`, {
          name: artStyle.name,
          description: artStyle.description?.substring(0, 50) + '...'
        })
      }
      
      // Extract scene characters from breakdown data for precise character matching
      let sceneCharacters: string[] | undefined
      if (breakdownData?.scenes) {
        const sceneData = breakdownData.scenes.find((s: any) => s.sceneNumber === frame.sceneNumber)
        if (sceneData?.characters && Array.isArray(sceneData.characters)) {
          sceneCharacters = sceneData.characters.map((c: any) => c.name || c).filter((name: string) => name && name.trim())
          console.log(`🎨 [Single Frame] Frame ${frame.id}: Extracted ${sceneCharacters.length} scene characters: ${sceneCharacters.join(', ')}`)
        }
      }

      // Get reference images (character images + recent storyboard images) and character descriptions
      let referenceImages: string[] = []
      let characterDescriptions: Array<{ name: string; description: string }> = []
      let characterImageMap: Record<string, string> = {}
      let artStyleDescription: string = ''
      if (episodeData.storyBibleId) {
        try {
          const storyBible = await getStoryBible(episodeData.storyBibleId, currentUserId)
          if (storyBible) {
            const refData = await getStoryboardReferenceImages(
              frame,
              storyBible,
              episodeData.storyBibleId,
              currentUserId,
              episodeData.episodeNumber,
              sceneCharacters // NEW: Pass scene characters for precise filtering
            )
            referenceImages = refData.images
            characterDescriptions = refData.characterDescriptions
            characterImageMap = refData.characterImageMap || {}
            artStyleDescription = refData.artStyleDescription || ''
            console.log(`🎨 [${generateId}] Using ${referenceImages.length} reference image(s), ${characterDescriptions.length} character description(s), ${Object.keys(characterImageMap).length} character image mapping(s), art style: ${artStyleDescription}`)
          }
        } catch (refError: any) {
          console.warn(`⚠️ [${generateId}] Failed to get reference images:`, refError.message)
          // Continue without reference images - graceful degradation
        }
      }
      
      console.log(`📡 [${generateId}] Sending request to /api/generate-image`)
      const requestStartTime = Date.now()
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: frame.imagePrompt,
          artStyle: artStyle || undefined,
          userId: currentUserId,
          referenceImages: referenceImages.length > 0 ? referenceImages : undefined,
          characterDescriptions: characterDescriptions.length > 0 ? characterDescriptions : undefined,
          characterImageMap: Object.keys(characterImageMap).length > 0 ? characterImageMap : undefined,
          artStyleDescription: artStyleDescription || undefined
        })
      })
      const requestDuration = Date.now() - requestStartTime
      
      console.log(`📥 [${generateId}] Received response`, {
        status: response.status,
        statusText: response.statusText,
        duration: `${requestDuration}ms`,
        contentType: response.headers.get('content-type')
      })

      // Check content type first
      const contentType = response.headers.get('content-type') || ''
      const isJSON = contentType.includes('application/json')
      
      const text = await response.text()
      
      if (!response.ok) {
        let errorMessage = 'Image generation failed'
        if (text) {
          // Check if response is HTML (error page)
          if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
            console.error('❌ API returned HTML error page instead of JSON:', {
              status: response.status,
              statusText: response.statusText,
              preview: text.substring(0, 200)
            })
            errorMessage = `Server error: API route returned an error page (status ${response.status}). The API route may have crashed. Check server logs.`
          } else if (isJSON) {
            try {
              const errorData = JSON.parse(text)
              errorMessage = errorData.error || errorData.message || errorData.details || errorMessage
            } catch {
              errorMessage = text.substring(0, 200) || `Server error: ${response.status} ${response.statusText}`
            }
          } else {
            errorMessage = text.substring(0, 200) || `Server error: ${response.status} ${response.statusText}`
          }
        } else {
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      if (!text) {
        throw new Error('Empty response from server')
      }

      // Check if response is HTML (shouldn't happen for successful responses, but handle it)
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        console.error('❌ API returned HTML instead of JSON for successful response:', {
          status: response.status,
          preview: text.substring(0, 200)
        })
        throw new Error('Server returned HTML instead of JSON. The API route may have crashed. Check server logs.')
      }

      let result
      try {
        result = JSON.parse(text)
      } catch (e) {
        console.error('Failed to parse JSON response:', text.substring(0, 500))
        throw new Error(`Invalid response format: ${e instanceof Error ? e.message : 'Unknown error'}`)
      }

      // Check for both imageUrl and url (API returns both for compatibility)
      const imageUrl = result.imageUrl || result.url;
      
      if (!imageUrl) {
        throw new Error('Invalid response: imageUrl missing')
      }

      const imageSizeKB = imageUrl.startsWith('data:') 
        ? Math.round((imageUrl.length * 3) / 4 / 1024)
        : 'N/A'
      
      const isResponseStorageUrl = result.isStorageUrl || 
                                   imageUrl.includes('firebasestorage.googleapis.com') || 
                                   imageUrl.startsWith('https://storage.googleapis.com/')
      
      console.log(`✅ [${generateId}] Image received from API`, {
        imageLength: imageUrl.length,
        imageSize: imageUrl.startsWith('data:') ? `${imageSizeKB}KB` : 'N/A',
        imageUrl: imageUrl.substring(0, 60) + '...',
        frameId: frame.id,
        source: result.source || 'unknown'
      })

      // SIMPLIFIED FLOW: Match storage-test exactly - always upload to Storage
      if (!currentUserId) {
        throw new Error('You must be signed in to generate images')
      }

      let finalImageUrl: string

      // Check if API already returned a Storage URL (Admin SDK succeeded)
      const isAlreadyStorageUrl = imageUrl.includes('firebasestorage.googleapis.com') || 
                                   imageUrl.startsWith('https://storage.googleapis.com/')
      
      if (isAlreadyStorageUrl) {
        console.log(`✅ [${generateId}] API returned Storage URL (Admin SDK succeeded)`, {
          storageUrl: imageUrl.substring(0, 60) + '...'
        })
        // Log FULL URL separately so it's not truncated
        console.log(`🔗 [${generateId}] FULL Storage URL:`, imageUrl)
        finalImageUrl = imageUrl
      } else {
        // API returned base64 or external URL - upload to Storage client-side (same as storage-test)
        console.log(`📤 [${generateId}] Uploading image to Firebase Storage (client-side)`, {
          imageType: imageUrl.startsWith('data:') ? 'base64' : 'external URL',
          imageSize: imageUrl.startsWith('data:') ? `${imageSizeKB}KB` : 'unknown'
        })

        const { uploadImageToStorage } = await import('@/services/image-storage-service')
        const { hashPrompt } = await import('@/services/image-cache-service')
        
        // Prepare image data - convert external URLs to base64 if needed
        let imageDataToUpload = imageUrl
        if (!imageUrl.startsWith('data:')) {
          // External URL - download and convert to base64
          console.log(`📥 [${generateId}] Downloading external image to convert for Storage upload...`)
          const imageResponse = await fetch(imageUrl)
          if (!imageResponse.ok) {
            throw new Error(`Failed to fetch external image: ${imageResponse.statusText}`)
          }
          const imageBlob = await imageResponse.blob()
          imageDataToUpload = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(imageBlob)
          })
          console.log(`✅ [${generateId}] External image converted to base64`)
        }
        
        // Generate hash for Storage path (same as storage-test)
        const promptHash = await hashPrompt(frame.imagePrompt || `frame-${frame.id}`, artStyle || undefined)
        console.log(`🔑 [${generateId}] Hash generated: ${promptHash.substring(0, 16)}...`)
        
        // Upload to Storage (same as storage-test line 264)
        finalImageUrl = await uploadImageToStorage(currentUserId, imageDataToUpload, promptHash)
        
        console.log(`✅ [${generateId}] Image uploaded to Firebase Storage!`, {
          storageUrl: finalImageUrl.substring(0, 60) + '...'
        })
        // Log FULL URL separately so it's not truncated
        console.log(`🔗 [${generateId}] FULL Storage URL:`, finalImageUrl)
        
        // Validate Storage URL format
        if (!finalImageUrl.startsWith('https://firebasestorage.googleapis.com/') && 
            !finalImageUrl.startsWith('https://storage.googleapis.com/')) {
          throw new Error(`Invalid Storage URL format: ${finalImageUrl.substring(0, 50)}`)
        }
      }

      // Final validation: NEVER save base64 to Firestore
      if (finalImageUrl.startsWith('data:')) {
        console.error(`❌ [${generateId}] CRITICAL: Attempting to save base64 to Firestore!`, {
          url: finalImageUrl.substring(0, 60) + '...'
        })
        throw new Error('Cannot save base64 image. Upload to Storage failed.')
      }

      // Validate it's a Storage URL
      if (!finalImageUrl.startsWith('https://firebasestorage.googleapis.com/') && 
          !finalImageUrl.startsWith('https://storage.googleapis.com/')) {
        console.error(`❌ [${generateId}] Invalid URL format - not a Storage URL!`, {
          url: finalImageUrl.substring(0, 60) + '...'
        })
        throw new Error('Invalid image URL format. Expected Firebase Storage URL.')
      }
      
      // Log FULL URL after validation
      console.log(`🔗 [${generateId}] FULL Validated Storage URL:`, finalImageUrl)

      // Then save to Firestore FIRST (with Storage URL!) - this ensures it's saved before local state update
      console.log(`💾 [${generateId}] ========== SAVING TO FIRESTORE ==========`)
      console.log(`💾 [${generateId}] Saving frame update to Firestore`, {
        frameId: frame.id,
        imageType: 'Firebase Storage URL ✅',
        imageUrl: finalImageUrl.substring(0, 80) + '...',
        userId: currentUserId.substring(0, 8) + '...',
        hasDirectUpdate: !!onFrameUpdate
      })
      // Log FULL URL separately so it's not truncated
      console.log(`🔗 [${generateId}] FULL Storage URL being saved:`, finalImageUrl)
      
      const saveStartTime = Date.now()
      try {
        // CRITICAL: Use direct update path if available (has verification), otherwise fall back to handleFrameUpdate
        if (onFrameUpdate) {
          console.log(`✅ [${generateId}] Using direct updateStoryboardFrame path (with verification)`)
          await onFrameUpdate(frame.id, {
            frameImage: finalImageUrl  // Storage URL only!
          })
        } else {
          console.log(`⚠️ [${generateId}] Using handleFrameUpdate path (no direct update available)`)
          await handleFrameUpdate(frame.id, {
            frameImage: finalImageUrl  // Storage URL only!
          })
        }
        const saveDuration = Date.now() - saveStartTime

        console.log(`✅ [${generateId}] ========== FIRESTORE SAVE SUCCESS ==========`, {
          saveDuration: `${saveDuration}ms`,
          totalDuration: `${Date.now() - requestStartTime}ms`,
          frameId: frame.id,
          imageType: 'Firebase Storage URL ✅',
          imageUrl: finalImageUrl.substring(0, 80) + '...',
          usedDirectUpdate: !!onFrameUpdate
        })
        // Log FULL URL separately so it's not truncated
        console.log(`🔗 [${generateId}] FULL Storage URL saved to Firestore:`, finalImageUrl)
        
        // NOW update local state after Firestore save succeeds
        console.log(`🔄 [${generateId}] Updating local state with Storage URL (after Firestore save)`)
      setLocalStoryboardsData(prevData => {
          if (!prevData) {
            console.warn(`⚠️  [${generateId}] No previous data, cannot update local state`)
            return prevData
          }
        
        const updatedScenes = prevData.scenes.map(scene => ({
          ...scene,
          frames: scene.frames.map(f => 
              f.id === frame.id ? { ...f, frameImage: finalImageUrl } : f
          )
        }))
        
          console.log(`✅ [${generateId}] Image updated in local state for frame ${frame.id}`)
        return {
          ...prevData,
          scenes: updatedScenes
        }
      })
      } catch (saveError: any) {
        console.error(`❌ [${generateId}] ========== FIRESTORE SAVE FAILED ==========`, {
          error: saveError.message,
          stack: saveError.stack,
          frameId: frame.id,
          imageUrl: finalImageUrl.substring(0, 80) + '...'
        })
        throw saveError
      }
    } catch (error: any) {
      console.error(`❌ [${generateId}] Error generating image:`, {
        error: error.message,
        stack: error.stack,
        frameId: frame.id,
        prompt: frame.imagePrompt.substring(0, 100) + '...'
      })
      alert(`Failed to generate image: ${error.message}`)
    } finally {
      setGeneratingImageFrameId(null)
      console.log(`🏁 [${generateId}] Image generation process complete`)
    }
  }

  const handleGenerateAllImages = async () => {
    if (!storyboardsData) {
      alert('No storyboards available')
      return
    }

    // Count frames that need images
    const framesNeedingImages = storyboardsData.scenes?.reduce((count, scene) => {
      return count + (scene.frames || []).filter(frame => {
        if (!frame.imagePrompt) return false
        // Skip if already has a Storage URL
        const hasStorageUrl = frame.frameImage && 
          (frame.frameImage.startsWith('https://firebasestorage.googleapis.com/') ||
           frame.frameImage.startsWith('https://storage.googleapis.com/'))
        return !hasStorageUrl
      }).length
    }, 0) || 0

    if (framesNeedingImages === 0) {
      // Show info modal instead of alert
      setConfirmModalData({
        framesCount: 0,
        onConfirm: () => {
          setShowConfirmModal(false)
          setConfirmModalData(null)
        }
      })
      setShowConfirmModal(true)
      return
    }

    // Show confirmation modal instead of browser confirm
    setConfirmModalData({
      framesCount: framesNeedingImages,
      onConfirm: async () => {
        setShowConfirmModal(false)
        setConfirmModalData(null)
        await proceedWithImageGeneration(framesNeedingImages)
      }
    })
    setShowConfirmModal(true)
  }

  const proceedWithImageGeneration = async (framesNeedingImages: number) => {
    setIsGeneratingAllImages(true)
    setBulkImageProgress({ current: 0, total: framesNeedingImages, frameId: null })
    setCurrentlyGeneratingFrameId(null)
    setGenerationError(null)
    setBulkGenerationStartTime(Date.now())
    setBulkGenerationElapsedTime(0)

    try {
      // Get story bible for reference images
      let storyBible: StoryBible | undefined
      if (episodeData.storyBibleId) {
        try {
          const bible = await getStoryBible(episodeData.storyBibleId, currentUserId)
          if (bible) {
            storyBible = bible
          }
        } catch (error) {
          console.warn('Failed to load story bible for reference images:', error)
        }
      }

      // Use onFrameUpdate callback if available, otherwise use handleFrameUpdate
      const frameUpdateCallback: (frameId: string, updates: { frameImage: string }) => Promise<void> = 
        onFrameUpdate || (async (frameId: string, updates: { frameImage: string }) => {
          await handleFrameUpdate(frameId, updates)
        })

      const result = await generateAllStoryboardImages(
        storyboardsData,
        currentUserId,
        frameUpdateCallback,
        {
          onProgress: (progress) => {
            setBulkImageProgress({
              current: progress.current,
              total: progress.total,
              frameId: progress.frameId || null
            })
            setCurrentlyGeneratingFrameId(progress.frameId || null)
          },
          onFrameComplete: (frameId, success, error) => {
            if (!success && error) {
              console.error(`Failed to generate image for frame ${frameId}:`, error)
            }
            // Clear the generating indicator for this frame
            if (currentlyGeneratingFrameId === frameId) {
              setCurrentlyGeneratingFrameId(null)
            }
          }
        },
        undefined, // options
        storyBible,
        episodeData.storyBibleId,
        breakdownData // NEW: Pass breakdown data for scene character extraction
      )

      if (result.failed > 0) {
        setGenerationError(`${result.success} images generated successfully, but ${result.failed} failed. Check console for details.`)
        // Keep modal open to show error
      } else {
        setGenerationError(null)
        // Show success, then close modal after a brief delay
        setTimeout(() => {
          setIsGeneratingAllImages(false)
          setBulkImageProgress(null)
          setCurrentlyGeneratingFrameId(null)
          setBulkGenerationStartTime(null)
          setBulkGenerationElapsedTime(0)
        }, 2000)
      }
    } catch (error: any) {
      console.error('Failed to generate all images:', error)
      setGenerationError(`Failed to generate images: ${error.message}`)
      // Keep modal open to show error
    } finally {
      // Modal will stay open if there's an error, or close after success delay
      // Don't reset progress here - let it show until modal closes
    }
  }

  // Update elapsed time every second when generating
  useEffect(() => {
    if (!isGeneratingAllImages || !bulkGenerationStartTime) {
      if (!isGeneratingAllImages) {
        setBulkGenerationElapsedTime(0)
      }
      return
    }
    
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - bulkGenerationStartTime) / 1000) // seconds
      setBulkGenerationElapsedTime(elapsed)
    }, 1000)
    
    return () => clearInterval(interval)
  }, [isGeneratingAllImages, bulkGenerationStartTime])

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAddComment = async (frameId: string, content: string) => {
    const newComment = {
      id: `comment_${Date.now()}`,
      userId: currentUserId,
      userName: currentUserName,
      content,
      timestamp: Date.now()
    }

    const updatedScenes = (storyboardsData?.scenes || []).map(scene => ({
      ...scene,
      frames: (scene.frames || []).map(frame =>
        frame.id === frameId
          ? { ...frame, comments: [...(frame.comments || []), newComment] }
          : frame
      )
    }))

    await onUpdate('storyboards', {
      ...storyboardsData,
      scenes: updatedScenes,
      lastUpdated: Date.now()
    })
  }

  const totalFrames = storyboardsData?.scenes?.reduce((sum, scene) => sum + (scene.frames?.length || 0), 0) || 0

  // Safety check - if no data, show loading
  if (!storyboardsData) {
    return (
      <div className="space-y-6">
        <div className="text-center p-8">
          <p className="text-[#e7e7e7]/50">Loading storyboards...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#e7e7e7]">Visual Storyboards</h2>
          <p className="text-sm text-[#e7e7e7]/70">
            {totalFrames} frames across {storyboardsData?.scenes?.length || 0} scenes
          </p>
          {storyboardsData?.artStyle && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-[#e7e7e7]/50">Art Style:</span>
              <span className="text-xs font-medium text-[#10B981]">{storyboardsData.artStyle.name}</span>
              {storyboardsData.artStyle.description && (
                <span className="text-xs text-[#e7e7e7]/60">({storyboardsData.artStyle.description})</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {totalFrames > 0 && (
            <button
              onClick={handleGenerateAllImages}
              disabled={isGeneratingAllImages || isGenerating}
              className="px-4 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-lg font-medium hover:from-[#059669] hover:to-[#047857] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGeneratingAllImages ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {bulkImageProgress 
                    ? `Generating ${bulkImageProgress.current}/${bulkImageProgress.total}...`
                    : 'Generating images...'}
                </>
              ) : (
                <>
                  <span>🎨</span>
                  <span>Generate All Images</span>
                </>
              )}
            </button>
          )}
          <button
            onClick={handleGenerateStoryboards}
            disabled={isGenerating || isGeneratingAllImages}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {isGenerating 
              ? (imageGenerationProgress 
                  ? `🔄 Generating images (${imageGenerationProgress.current}/${imageGenerationProgress.total})...` 
                  : '🔄 Generating storyboards...')
              : '✨ Generate Storyboards'}
          </button>
        </div>
      </div>

      {/* Generation Error */}
      {generationError && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">{generationError}</p>
        </div>
      )}

      {/* Empty State */}
      {totalFrames === 0 ? (
        <div className="text-center py-16 bg-[#2a2a2a] rounded-lg border border-[#36393f]">
          <div className="text-6xl mb-4">🖼️</div>
          <h3 className="text-xl font-bold text-[#e7e7e7] mb-2">No Storyboards Created</h3>
          <p className="text-[#e7e7e7]/70 mb-6">
            Generate visual storyboards from your script breakdown
          </p>
          {!breakdownData && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-400 mb-2">⚠️ Prerequisites Required</p>
              <p className="text-xs text-[#e7e7e7]/70">
                Please generate a script breakdown first in the Script Breakdown tab
              </p>
            </div>
          )}
          <button
            onClick={handleGenerateStoryboards}
            disabled={isGenerating || !breakdownData}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating 
              ? (imageGenerationProgress 
                  ? `🔄 Generating images (${imageGenerationProgress.current}/${imageGenerationProgress.total})...` 
                  : '🔄 Generating storyboards...')
              : '✨ Generate with AI'}
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {(storyboardsData?.scenes || []).map((scene) => (
            <div key={scene.sceneNumber} className="space-y-6">
              {/* Scene Header */}
              <div className="flex items-center justify-between border-b border-[#36393f] pb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-[#10B981]">Scene {scene.sceneNumber}: {scene.sceneTitle}</h3>
                  <span className="text-sm text-[#e7e7e7]/50">
                    {scene.frames.length} shot{scene.frames.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  onClick={() => handleAddFrame(scene.sceneNumber)}
                  className="px-4 py-2 bg-[#10B981] text-black rounded-lg text-sm font-medium hover:bg-[#059669] transition-colors"
                >
                  + Add Shot
                </button>
              </div>

              {/* Large Image Cards Grid (3 columns) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(scene.frames || [])
                  // CRITICAL: Deduplicate frames by ID before rendering to prevent duplicates
                  .filter((frame, index, self) => {
                    if (!frame.id) {
                      console.warn(`⚠️ [RENDER] Frame without ID at index ${index} in scene ${scene.sceneNumber} (shotNumber: ${frame.shotNumber})`)
                      return false
                    }
                    const firstIndex = self.findIndex((f) => f.id === frame.id)
                    if (firstIndex !== index) {
                      console.warn(`⚠️ [RENDER] Duplicate frame ID ${frame.id} detected at index ${index} in scene ${scene.sceneNumber} (shotNumber: ${frame.shotNumber}), removing duplicate. First occurrence at index ${firstIndex}`)
                      return false
                    }
                    return true
                  })
                  .map((frame) => (
                  <StoryboardFrameCard
                    key={frame.id}
                    frame={frame}
                    onUpdate={(updates) => handleFrameUpdate(frame.id, updates)}
                    onAddComment={(content) => handleAddComment(frame.id, content)}
                    onGenerateImage={() => handleGenerateImage(frame)}
                    currentUserId={currentUserId}
                    currentUserName={currentUserName}
                    isSelected={selectedFrame === frame.id}
                    isGeneratingImage={generatingImageFrameId === frame.id || currentlyGeneratingFrameId === frame.id}
                    onSelect={() => setSelectedFrame(frame.id === selectedFrame ? null : frame.id)}
                    episodeData={episodeData}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Progress Modal for Bulk Image Generation */}
      <AnimatePresence>
        {isGeneratingAllImages && bulkImageProgress && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-4"
          >
            <div className="min-h-screen flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-lg bg-[#1A1A1A] border border-[#10B981]/30 rounded-2xl shadow-2xl overflow-hidden my-8"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/10 to-transparent pointer-events-none" />
                
                <div className="relative p-8">
                  {/* Warning Banner */}
                  <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">⚠️</span>
                      <div>
                        <p className="text-yellow-300 font-semibold mb-1">Please Stay on This Page</p>
                        <p className="text-yellow-200/80 text-sm">
                          Do not navigate away or close this tab while images are generating. 
                          This will cause generation to fail.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-[#10B981]/10 border-2 border-[#10B981]/40 rounded-full flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold text-white text-center mb-3">
                    Generating Storyboard Images
                  </h2>

                  {/* Progress */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/70 text-sm">
                        Progress
                      </span>
                      <span className="text-[#10B981] font-semibold">
                        {bulkImageProgress.current} / {bulkImageProgress.total}
                      </span>
                    </div>
                    <div className="w-full rounded-full h-3 bg-[#2A2A2A] overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-[#10B981] to-[#059669] h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(bulkImageProgress.current / bulkImageProgress.total) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-white/50 text-xs">
                        {bulkImageProgress.current === bulkImageProgress.total 
                          ? 'Finalizing...' 
                          : `Generating frame ${bulkImageProgress.current + 1} of ${bulkImageProgress.total}...`}
                      </p>
                      <p className="text-[#10B981]/70 text-xs font-mono">
                        {formatTime(bulkGenerationElapsedTime)}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  {!generationError && (
                    <div className="text-center">
                      <p className="text-white/70 text-sm">
                        Images will appear automatically as they're generated
                      </p>
                    </div>
                  )}

                  {/* Error Display */}
                  {generationError && (
                    <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                      <p className="text-red-300 font-semibold mb-1">Error</p>
                      <p className="text-red-200/80 text-sm">{generationError}</p>
                      <button
                        onClick={() => {
                          setIsGeneratingAllImages(false)
                          setBulkImageProgress(null)
                          setCurrentlyGeneratingFrameId(null)
                          setGenerationError(null)
                        }}
                        className="mt-3 px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                      >
                        Close
                      </button>
                    </div>
                  )}

                  {/* Success Message */}
                  {!generationError && bulkImageProgress && bulkImageProgress.current === bulkImageProgress.total && (
                    <div className="mt-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                      <p className="text-green-300 font-semibold">✅ All images generated successfully!</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Image Generation */}
      <AnimatePresence>
        {showConfirmModal && confirmModalData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-4"
            onClick={() => {
              setShowConfirmModal(false)
              setConfirmModalData(null)
            }}
          >
            <div className="min-h-screen flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-md bg-[#1A1A1A] border border-[#10B981]/30 rounded-2xl shadow-2xl overflow-hidden my-8"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/10 to-transparent pointer-events-none" />
                
                <div className="relative p-8">
                  {/* Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-[#10B981]/10 border-2 border-[#10B981]/40 rounded-full flex items-center justify-center">
                      <span className="text-4xl">🎨</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold text-white text-center mb-3">
                    {confirmModalData.framesCount === 0 ? 'All Images Generated' : 'Generate Images'}
                  </h2>

                  {/* Message */}
                  <p className="text-white/70 text-center mb-6">
                    {confirmModalData.framesCount === 0 ? (
                      'All frames already have images!'
                    ) : (
                      <>
                        Generate images for <strong className="text-[#10B981]">{confirmModalData.framesCount}</strong> frame{confirmModalData.framesCount !== 1 ? 's' : ''}?
                        <br />
                        <span className="text-sm text-white/50 mt-2 block">
                          This will skip frames that already have images.
                        </span>
                      </>
                    )}
                  </p>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowConfirmModal(false)
                        setConfirmModalData(null)
                      }}
                      className="flex-1 px-6 py-3 bg-[#2a2a2a] border border-[#36393f] text-white font-medium rounded-lg hover:bg-[#3a3a3a] transition-all"
                    >
                      Cancel
                    </button>
                    {confirmModalData.framesCount > 0 && (
                      <button
                        onClick={confirmModalData.onConfirm}
                        className="flex-1 px-6 py-3 bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] font-bold rounded-lg hover:bg-[#10B981]/30 transition-all"
                      >
                        Generate
                      </button>
                    )}
                    {confirmModalData.framesCount === 0 && (
                      <button
                        onClick={confirmModalData.onConfirm}
                        className="flex-1 px-6 py-3 bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] font-bold rounded-lg hover:bg-[#10B981]/30 transition-all"
                      >
                        OK
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Component to handle image display with blob URL conversion
function StoryboardImage({ src, alt }: { src: string; alt: string }) {
  const [displayUrl, setDisplayUrl] = useState<string>(src || '');
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset error when src changes
    setError(false);
    
    // Validate src is not empty
    if (!src || typeof src !== 'string' || src.trim() === '') {
      console.warn('StoryboardImage: Empty or invalid src provided');
      setDisplayUrl('');
      setError(true);
      return;
    }

    // Convert base64 data URL to blob URL for better performance
    if (isDataUrl(src)) {
      // Validate data URL format
      if (!src.startsWith('data:image/')) {
        console.warn('StoryboardImage: Invalid data URL format (not an image):', src.substring(0, 50));
        setDisplayUrl(src); // Try anyway
        return;
      }
      
      try {
        const blobUrl = dataUrlToBlobUrl(src);
        setDisplayUrl(blobUrl);
        
        // Cleanup blob URL on unmount
        return () => {
          revokeBlobUrl(blobUrl);
        };
      } catch (error) {
        console.error('StoryboardImage: Failed to convert data URL to blob URL:', error);
        setDisplayUrl(src); // Fallback to data URL
      }
    } else if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('blob:')) {
      // Valid external URL or blob URL (including Firebase Storage URLs)
      if (src.startsWith('https://firebasestorage.googleapis.com/') || 
          src.startsWith('https://storage.googleapis.com/')) {
        console.log('🖼️ StoryboardImage: Using Firebase Storage URL', {
          url: src.substring(0, 80) + '...',
          alt: alt || 'unnamed'
        })
      }
      setDisplayUrl(src);
    } else {
      // Unknown format, try anyway but log warning
      console.warn('StoryboardImage: Unknown URL format:', src.substring(0, 50));
      setDisplayUrl(src);
    }
  }, [src]);

  // Show error state if no valid URL
  if (error || !displayUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center text-red-400 text-xs bg-[#1a1a1a] rounded">
        {error ? 'Failed to load image' : 'No image available'}
      </div>
    );
  }

  return (
    <img 
      src={displayUrl} 
      alt={alt || 'Storyboard frame'} 
      className="w-full h-full object-cover"
      onError={(e) => {
        console.error('StoryboardImage: Image failed to load:', {
          displayUrl: displayUrl.substring(0, 100),
          src: src.substring(0, 100),
          error: e
        });
        setError(true);
      }}
      onLoad={() => {
        // Reset error on successful load
        setError(false);
      }}
    />
  );
}

// Storyboard Frame Card - Concept 1: Large Cards Grid (matching design preview)
function StoryboardFrameCard({
  frame,
  onUpdate,
  onAddComment,
  onGenerateImage,
  currentUserId,
  currentUserName,
  isSelected,
  isGeneratingImage,
  onSelect,
  episodeData
}: {
  frame: StoryboardFrame
  onUpdate: (updates: Partial<StoryboardFrame>) => void
  onAddComment: (content: string) => void
  onGenerateImage: () => void
  currentUserId: string
  currentUserName: string
  isSelected: boolean
  isGeneratingImage: boolean
  onSelect: () => void
  episodeData: EpisodePreProductionData
}) {
  // Helper to get frame key
  const getFrameKey = (sceneNumber: number, shotNumber: string): string => {
    return `s${sceneNumber}-shot${shotNumber}`
  }
  
  // Get storage key using episode data - safe fallback if episodeData is missing
  const getStorageKey = (): string | null => {
    if (!episodeData || !episodeData.storyBibleId || !episodeData.episodeNumber) {
      console.warn('⚠️ [StoryboardFrameCard] Cannot get storage key - episodeData missing or incomplete', {
        hasEpisodeData: !!episodeData,
        hasStoryBibleId: !!episodeData?.storyBibleId,
        hasEpisodeNumber: !!episodeData?.episodeNumber
      })
      return null
    }
    return `storyboard-images-${episodeData.storyBibleId}-ep${episodeData.episodeNumber}`
  }
  
  // Load images from localStorage using correct storage key - safe fallback
  const loadImagesFromLocalStorage = (): Record<string, string> => {
    try {
      const storageKey = getStorageKey()
      if (!storageKey) {
        // episodeData is missing, return empty object
        return {}
      }
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        return JSON.parse(stored)
      }
      return {}
    } catch (e) {
      console.warn('⚠️ [StoryboardFrameCard] Failed to load images from localStorage:', e)
      return {}
    }
  }
  
  // CRITICAL: frame.frameImage from Firestore is THE source of truth
  // If frame.frameImage exists, use it DIRECTLY - NO localStorage check whatsoever
  const imageUrl = useMemo(() => {
    // PRIMARY: frame.frameImage from Firestore (Firebase Storage URL) - use it if it exists
    if (frame.frameImage) {
      return frame.frameImage
    }
    
    // ONLY if frame.frameImage is completely missing, check localStorage (for in-progress images)
    // This should be rare - most images should be in Firestore
    if (episodeData?.storyBibleId) {
      const storedImages = loadImagesFromLocalStorage()
      const stableKey = getFrameKey(frame.sceneNumber, frame.shotNumber)
      const storedImage = storedImages[stableKey] || storedImages[frame.id]
      if (storedImage) {
        console.log(`🔄 [StoryboardFrameCard] Using localStorage fallback (no Firestore image) for Scene ${frame.sceneNumber} Shot ${frame.shotNumber}`)
        return storedImage
      }
    }
    
    return null
  }, [frame.frameImage, frame.sceneNumber, frame.shotNumber, frame.id, episodeData])
  
  // Log image state for validation
  useEffect(() => {
    if (imageUrl) {
      // Image found - log success
      const isStorageUrl = imageUrl.startsWith('https://firebasestorage.googleapis.com/') || 
                          imageUrl.startsWith('https://storage.googleapis.com/')
      console.log(`✅ [StoryboardFrameCard] Image URL resolved for Scene ${frame.sceneNumber} Shot ${frame.shotNumber}`, {
        frameId: frame.id,
        imageType: isStorageUrl ? 'Firebase Storage URL' : imageUrl.startsWith('data:') ? 'base64' : 'external',
        source: frame.frameImage ? 'frame.frameImage (Firestore)' : 'localStorage fallback',
        preview: imageUrl.substring(0, 100)
      })
    } else if (!isGeneratingImage) {
      // Image missing - log detailed info
      console.warn(`⚠️ [StoryboardFrameCard] Missing image for Scene ${frame.sceneNumber} Shot ${frame.shotNumber}`, {
        frameId: frame.id,
        hasFrameImage: !!frame.frameImage,
        frameImageType: typeof frame.frameImage,
        frameImageLength: frame.frameImage?.length || 0,
        frameImagePreview: frame.frameImage ? frame.frameImage.substring(0, 80) + '...' : 'none',
        hasEpisodeData: !!episodeData,
        hasStoryBibleId: !!episodeData?.storyBibleId,
        isGenerating: isGeneratingImage
      })
    }
  }, [imageUrl, frame, isGeneratingImage, episodeData])
  
  return (
    <div className="bg-[#1a1a1a] border border-[#36393f] rounded-lg overflow-hidden">
      {/* Image/Video */}
      <div className="w-full h-48 bg-[#2a2a2a] flex items-center justify-center relative overflow-hidden">
        {/* Show video if available, otherwise show image */}
        {frame.referenceVideos && frame.referenceVideos.length > 0 ? (
          <div className="w-full h-full">
            <video
              src={frame.referenceVideos[0]}
              controls
              className="w-full h-full object-cover"
              preload="metadata"
              onError={(e) => {
                console.error('Video load error:', e)
                // Fallback to image if video fails
              }}
            >
              Your browser does not support the video tag.
            </video>
            {frame.referenceVideos.length > 1 && (
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                +{frame.referenceVideos.length - 1} more
              </div>
            )}
          </div>
        ) : imageUrl ? (
          <StoryboardImage src={imageUrl} alt={`Shot ${frame.shotNumber}`} />
        ) : (
          <div className="text-center p-4">
            <span className="text-4xl">📷</span>
            <p className="text-xs text-[#e7e7e7]/50 mt-2">No image</p>
            {frame.imagePrompt && (
              <button
                onClick={onGenerateImage}
                disabled={isGeneratingImage}
                className="mt-2 px-3 py-1 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {isGeneratingImage ? 'Generating...' : '🎨 Generate Image'}
              </button>
            )}
          </div>
        )}
        {isGeneratingImage && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm z-10">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <div className="text-white text-sm font-medium">Generating image...</div>
              <div className="text-white/70 text-xs mt-1">Please wait</div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-xs font-medium mb-2 text-[#e7e7e7]/50">
          Scene {frame.sceneNumber} • Shot {frame.shotNumber}
        </div>
        
        {/* Narrative-first blurb */}
        {(frame.notes || frame.imagePrompt) && (
          <div className="mb-2">
            <div className="text-[11px] uppercase tracking-wide text-[#e7e7e7]/50 mb-1">Story beat</div>
            <p className="text-sm text-[#e7e7e7] leading-snug line-clamp-3">
              {frame.notes
                ? frame.notes.length > 160
                  ? `${frame.notes.substring(0, 160)}...`
                  : frame.notes
                : frame.imagePrompt
                  ? frame.imagePrompt.length > 160
                    ? `${frame.imagePrompt.substring(0, 160)}...`
                    : frame.imagePrompt
                  : 'No description'}
            </p>
          </div>
        )}

        {/* Script context - actual action from script */}
        {frame.scriptContext && (
          <div className="mb-2 p-2 bg-[#1a1a1a] rounded border-l-2 border-[#F59E0B]/50">
            <div className="text-[11px] uppercase tracking-wide text-[#F59E0B]/80 mb-1">Script Action</div>
            <p className="text-sm text-[#F59E0B] font-medium leading-snug">
              {frame.scriptContext}
            </p>
          </div>
        )}

        {/* Dialogue snippet if available */}
        {frame.dialogueSnippet && frame.dialogueSnippet.trim() && (
          <div className="mb-2 p-2 bg-[#2a2a2a] rounded border-l-2 border-[#10B981]/50">
            <p className="text-xs text-[#10B981]/80 italic">
              "{frame.dialogueSnippet.length > 80 ? `${frame.dialogueSnippet.substring(0, 80)}...` : frame.dialogueSnippet}"
            </p>
          </div>
        )}
        
        {/* Camera and technical info */}
        <div className="flex items-center gap-3 text-xs text-[#e7e7e7]/70">
          <span className="flex items-center gap-1">
            <span className="text-[#e7e7e7]/50">📷</span>
            {frame.cameraAngle || 'Medium'}
          </span>
          <span className="flex items-center gap-1">
            <span className="text-[#e7e7e7]/50">🎬</span>
            {frame.cameraMovement || 'Static'}
          </span>
          {frame.lightingNotes && frame.lightingNotes.trim() && (
            <span className="flex items-center gap-1" title={frame.lightingNotes}>
              <span className="text-[#e7e7e7]/50">💡</span>
              <span className="truncate max-w-[100px]">{frame.lightingNotes.substring(0, 20)}</span>
            </span>
          )}
          {frame.referenceVideos && frame.referenceVideos.length > 0 && (
            <span className="flex items-center gap-1" title={`${frame.referenceVideos.length} reference video(s)`}>
              <span className="text-[#e7e7e7]/50">🎥</span>
              {frame.referenceVideos.length} video{frame.referenceVideos.length !== 1 ? 's' : ''}
            </span>
          )}
              </div>
      </div>
    </div>
  )
}
