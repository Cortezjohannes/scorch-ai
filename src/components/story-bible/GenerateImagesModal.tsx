'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

interface GenerateImagesModalProps {
  isOpen: boolean
  onClose: () => void
  storyBibleId: string
  userId: string
  storyBible?: any // Story Bible data for calculating counts
  onComplete?: (updatedStoryBible: any) => void
}

type SectionType = 'hero' | 'characters' | 'arcs' | 'world'

interface GenerationProgress {
  section: string
  progress: number
  currentItem?: string
  totalItems?: number
  completedItems?: number
}

export default function GenerateImagesModal({
  isOpen,
  onClose,
  storyBibleId,
  userId,
  storyBible,
  onComplete
}: GenerateImagesModalProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [selectedSections, setSelectedSections] = useState<SectionType[]>(['hero', 'characters', 'world'])
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<GenerationProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  
  const sectionLabels: Record<SectionType, string> = {
    hero: 'Hero Image',
    characters: 'Character Portraits',
    world: 'Location Concepts'
  }
  
  // Calculate estimated image counts and costs
  const estimatedImages = {
    hero: 1,
    characters: storyBible?.mainCharacters?.length || 0,
    arcs: storyBible?.narrativeArcs?.length || 0,
    world: storyBible?.worldBuilding?.locations?.length || 0
  }
  
  const totalImages = selectedSections.reduce((sum, section) => 
    sum + estimatedImages[section], 0
  )
  
  // Estimate: ~5 seconds per image, ~$0.05 per image (example - adjust based on actual costs)
  const estimatedTimeSeconds = Math.ceil(totalImages * 5)
  const estimatedCost = totalImages * 0.05 // Example: $0.05 per image
  
  const isLargeBatch = totalImages > 20
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  // Update elapsed time every second when generating
  useEffect(() => {
    if (!isGenerating || !startTime) {
      setElapsedTime(0)
      return
    }
    
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000 // seconds
      setElapsedTime(elapsed)
    }, 1000)
    
    return () => clearInterval(interval)
  }, [isGenerating, startTime])
  
  const toggleSection = (section: SectionType) => {
    if (isGenerating) return
    
    setSelectedSections(prev => 
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }
  
  const selectAll = () => {
    if (isGenerating) return
    setSelectedSections(['hero', 'characters', 'world'])
  }
  
  const deselectAll = () => {
    if (isGenerating) return
    setSelectedSections([])
  }
  
  const handleGenerate = async () => {
    console.log('🎨 [GenerateImagesModal] Generate Selected clicked', {
      selectedSections,
      storyBibleId,
      userId: userId ? `${userId.substring(0, 8)}...` : 'missing',
      hasStoryBible: !!storyBible
    })
    
    if (selectedSections.length === 0) {
      console.warn('⚠️ [GenerateImagesModal] No sections selected')
      setError('Please select at least one section to generate')
      return
    }
    
    if (!userId) {
      console.error('❌ [GenerateImagesModal] Missing userId')
      setError('User ID is required. Please sign in.')
      return
    }
    
    if (!storyBibleId) {
      console.error('❌ [GenerateImagesModal] Missing storyBibleId')
      setError('Story Bible ID is required.')
      return
    }
    
    console.log('✅ [GenerateImagesModal] Starting generation...')
    setIsGenerating(true)
    setError(null)
    setProgress(null)
    setCompleted(false)
    const now = Date.now()
    setStartTime(now)
    setElapsedTime(0)
    
    // Collect all items that need images (like clicking buttons one by one)
    const itemsToGenerate: Array<{ type: 'hero' | 'character' | 'arc' | 'location'; index?: number; name: string }> = []
    
    // Hero image
    if (selectedSections.includes('hero')) {
      itemsToGenerate.push({ type: 'hero', index: 0, name: 'Hero Image' })
    }
    
    // Characters
    if (selectedSections.includes('characters') && storyBible?.mainCharacters) {
      storyBible.mainCharacters.forEach((char: any, index: number) => {
        // Only generate if no image exists
        if (!char.visualReference?.imageUrl || char.visualReference.imageUrl.trim() === '') {
          itemsToGenerate.push({ type: 'character', index, name: char.name || `Character ${index + 1}` })
        }
      })
    }
    
    // Arcs
    if (selectedSections.includes('arcs') && storyBible?.narrativeArcs) {
      storyBible.narrativeArcs.forEach((arc: any, index: number) => {
        // Only generate if no image exists
        if (!arc.keyArt?.imageUrl || arc.keyArt.imageUrl.trim() === '') {
          itemsToGenerate.push({ type: 'arc', index, name: arc.title || `Arc ${index + 1}` })
        }
      })
    }
    
    // Locations
    if (selectedSections.includes('world') && storyBible?.worldBuilding?.locations) {
      storyBible.worldBuilding.locations.forEach((loc: any, index: number) => {
        // Only generate if no image exists
        if (!loc.conceptArt?.imageUrl || loc.conceptArt.imageUrl.trim() === '') {
          itemsToGenerate.push({ type: 'location', index, name: loc.name || `Location ${index + 1}` })
        }
      })
    }
    
    if (itemsToGenerate.length === 0) {
      setError('All selected images already exist!')
      setIsGenerating(false)
      return
    }
    
    setProgress({
      section: 'Starting...',
      progress: 0,
      totalItems: itemsToGenerate.length,
      completedItems: 0
    })
    
    // Generate each image one by one - EXACT copy of what clicking individual buttons does
    let completed = 0
    const { getStoryBible, saveStoryBible } = await import('@/services/story-bible-service')
    const { uploadImageToStorage } = await import('@/services/image-storage-service')
    const { hashPrompt } = await import('@/services/image-cache-service')
    
    for (let i = 0; i < itemsToGenerate.length; i++) {
      const item = itemsToGenerate[i]
      
      try {
        setProgress({
          section: item.type,
          progress: Math.round((completed / itemsToGenerate.length) * 100),
          currentItem: item.name,
          totalItems: itemsToGenerate.length,
          completedItems: completed
        })
        
        console.log(`🎨 Generating ${item.name}...`)
        
        // EXACT same API call as individual button
        const sections: ('hero' | 'characters' | 'world')[] = []
        if (item.type === 'hero') sections.push('hero')
        else if (item.type === 'character') sections.push('characters')
        else if (item.type === 'location') sections.push('world')
        
        const response = await fetch('/api/generate/story-bible-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storyBibleId,
            userId,
            sections,
            regenerate: true,
            specificIndex: item.type === 'hero' 
              ? { type: 'hero', index: 0 }
              : item.index !== undefined 
                ? { type: item.type, index: item.index } 
                : undefined,
            storyBible: storyBible || undefined
          })
        })
        
        if (!response.ok) {
          throw new Error('Failed to generate image')
        }
        
        // EXACT same SSE handling as individual button
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        
        if (!reader) throw new Error('No response body')
        
        let buffer = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.substring(6))
              
              // EXACT same handling as individual button
              if (data.type === 'image-generated' && data.imageData) {
                let imageData = { ...data.imageData }
                
                // Upload base64 to Storage if needed
                if (imageData.imageUrl?.startsWith('data:')) {
                  const context = data.imageType === 'hero' ? 'hero' : 
                                 data.imageType === 'character' ? 'character' : 
                                 data.imageType === 'arc' ? 'arc' : 'location'
                  const promptText = imageData.prompt || `${data.imageType}-${data.itemIndex || 0}`
                  const hash = await hashPrompt(promptText, undefined, context)
                  
                  const storageUrl = await uploadImageToStorage(userId, imageData.imageUrl, hash)
                  imageData.imageUrl = storageUrl
                  
                  // Save to Firestore
                  const currentBible = await getStoryBible(storyBibleId, userId)
                  
                  if (currentBible) {
                    let updatingPath: string | undefined
                    
                    if (data.imageType === 'hero') {
                      currentBible.visualAssets = currentBible.visualAssets || {}
                      currentBible.visualAssets.heroImage = imageData
                      updatingPath = 'visualAssets.heroImage'
                    } else if (data.imageType === 'character' && data.itemIndex !== undefined) {
                      currentBible.mainCharacters = currentBible.mainCharacters || []
                      if (!currentBible.mainCharacters[data.itemIndex]) {
                        currentBible.mainCharacters[data.itemIndex] = { name: `Character ${data.itemIndex + 1}` }
                      }
                      currentBible.mainCharacters[data.itemIndex].visualReference = imageData
                      updatingPath = `mainCharacters[${data.itemIndex}].visualReference`
                    } else if (data.imageType === 'arc' && data.itemIndex !== undefined && currentBible.narrativeArcs) {
                      if (currentBible.narrativeArcs[data.itemIndex]) {
                        currentBible.narrativeArcs[data.itemIndex].keyArt = imageData
                        updatingPath = `narrativeArcs[${data.itemIndex}].keyArt`
                      }
                    } else if (data.imageType === 'location' && data.itemIndex !== undefined && currentBible.worldBuilding?.locations) {
                      if (currentBible.worldBuilding.locations[data.itemIndex]) {
                        currentBible.worldBuilding.locations[data.itemIndex].conceptArt = imageData
                        updatingPath = `worldBuilding.locations[${data.itemIndex}].conceptArt`
                      }
                    }
                    
                    await saveStoryBible(currentBible, userId, updatingPath)
                    console.log(`✅ Saved ${data.imageType} image`)
                  }
                }
              }
            }
          }
        }
        
        completed++
        console.log(`✅ Completed ${item.name}`)
        
        // Delay between images
        await new Promise(resolve => setTimeout(resolve, 500))
        
      } catch (err: any) {
        console.error(`❌ Failed ${item.name}:`, err.message)
        setError(`Failed to generate ${item.name}`)
        // Continue anyway
      }
    }
    
    // Complete
    setProgress({
      section: 'complete',
      progress: 100,
      totalItems: itemsToGenerate.length,
      completedItems: completed
    })
    setCompleted(true)
    setIsGenerating(false)
    
    // Reload story bible
    try {
      const finalBible = await getStoryBible(storyBibleId, userId)
      if (finalBible && onComplete) {
        onComplete(finalBible)
      }
    } catch (err) {
      console.error('Failed to reload:', err)
    }
    
    // Auto-close
    setTimeout(() => {
      handleClose()
    }, 2000)
  }
  
  const handleCancel = () => {
    setIsGenerating(false)
    setStartTime(null)
    setEstimatedTimeRemaining(null)
  }
  
  const handleClose = () => {
    // Allow closing even if generating (user can force close)
    setIsGenerating(false)
    setSelectedSections(['hero', 'characters', 'world'])
    setProgress(null)
    setError(null)
    setCompleted(false)
    setStartTime(null)
    setEstimatedTimeRemaining(null)
    onClose()
  }
  
  if (!isOpen) return null
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`${isDark ? 'bg-[#1A1A1A] border-[#36393F]' : 'bg-white border-[#E5E5E5]'} rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-[#36393F]' : 'border-[#E5E5E5]'}`}>
            <div className="flex items-center gap-3">
              <Sparkles className={`w-6 h-6 ${isDark ? 'text-[#10B981]' : 'text-[#10B981]'}`} />
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>Generate Story Bible Images</h2>
            </div>
            <button
              onClick={handleClose}
              disabled={isGenerating}
              className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-[#666666] hover:text-[#1A1A1A]'} transition-colors disabled:opacity-50 rounded-lg hover:bg-[#2a2a2a]/50 p-1`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Section Selection */}
            {!isGenerating && !completed && (
              <>
                <div>
                  <p className={`${isDark ? 'text-[#E7E7E7]' : 'text-[#666666]'} mb-4`}>
                    Select which sections to generate images for. Images will be generated using semi-realistic concept art style.
                  </p>
                  
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={selectAll}
                      className={`px-3 py-1 text-sm rounded transition-colors ${isDark ? 'bg-[#2A2A2A] text-white hover:bg-[#333]' : 'bg-[#FAFAFA] text-[#1A1A1A] hover:bg-[#E5E5E5]'}`}
                    >
                      Select All
                    </button>
                    <button
                      onClick={deselectAll}
                      className={`px-3 py-1 text-sm rounded transition-colors ${isDark ? 'bg-[#2A2A2A] text-white hover:bg-[#333]' : 'bg-[#FAFAFA] text-[#1A1A1A] hover:bg-[#E5E5E5]'}`}
                    >
                      Deselect All
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {(Object.keys(sectionLabels) as SectionType[]).map(section => (
                      <label
                        key={section}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${isDark ? 'border-[#36393F] hover:border-[#10B981]/50' : 'border-[#E5E5E5] hover:border-[#10B981]/50'}`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedSections.includes(section)}
                            onChange={() => toggleSection(section)}
                            className="w-5 h-5 text-[#10B981] rounded focus:ring-[#10B981]"
                          />
                          <span className={`${isDark ? 'text-white' : 'text-[#1A1A1A]'} font-medium`}>{sectionLabels[section]}</span>
                        </div>
                        {section !== 'hero' && estimatedImages[section] > 0 && (
                          <span className={`${isDark ? 'text-[#E7E7E7]' : 'text-[#666666]'} text-sm`}>
                            ({estimatedImages[section]})
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                  
                  {/* Style Reference Status */}
                  {storyBible?.styleReferenceImages && storyBible.styleReferenceImages.length > 0 && (
                    <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-100'} p-3 rounded-lg`}>
                      <div className={`flex items-center gap-2 mb-2`}>
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          🎨 Style locked: Using reference images for consistency
                        </span>
                      </div>
                      <div className={`flex gap-2`}>
                        {storyBible.styleReferenceImages.slice(0, 3).map((imgUrl: string, idx: number) => (
                          <img 
                            key={idx}
                            src={imgUrl} 
                            alt={`Style reference ${idx + 1}`}
                            className={`w-12 h-12 rounded object-cover`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Cost Estimation */}
                  {totalImages > 0 && (
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border border-blue-500/50' : 'bg-blue-50 border border-blue-200'}`}>
                      <p className={`${isDark ? 'text-blue-300' : 'text-blue-700'} text-sm mb-2`}>
                        <strong>Estimated:</strong> {totalImages} image{totalImages !== 1 ? 's' : ''} 
                        {' • '}
                        ~{Math.ceil(estimatedTimeSeconds / 60)} minute{Math.ceil(estimatedTimeSeconds / 60) !== 1 ? 's' : ''}
                        {' • '}
                        ~${estimatedCost.toFixed(2)} in AI credits
                      </p>
                      {isLargeBatch && (
                        <p className={`${isDark ? 'text-yellow-300' : 'text-yellow-700'} text-xs mt-1`}>
                          ⚠️ Large batch detected. Consider generating in smaller batches for better performance.
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                {error && (
                  <div className={`p-4 rounded-lg flex items-start gap-3 ${isDark ? 'bg-red-900/20 border border-red-500/50' : 'bg-red-50 border border-red-200'}`}>
                    <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                    <div>
                      <p className={`${isDark ? 'text-red-400' : 'text-red-700'} font-semibold`}>Error</p>
                      <p className={`${isDark ? 'text-red-300' : 'text-red-600'} text-sm`}>{error}</p>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {/* Progress */}
            {isGenerating && progress && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`${isDark ? 'text-white' : 'text-[#1A1A1A]'} font-medium`}>
                      {progress.section === 'complete' ? 'Complete' : `Generating ${progress.section}...`}
                    </span>
                    <span className={`${isDark ? 'text-[#E7E7E7]' : 'text-[#666666]'} text-sm`}>
                      {Math.round(progress.progress)}%
                    </span>
                  </div>
                  <div className={`w-full rounded-full h-2 ${isDark ? 'bg-[#2A2A2A]' : 'bg-[#E5E5E5]'}`}>
                    <motion.div
                      className="bg-gradient-to-r from-[#10B981] to-[#059669] h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
                
                {progress.currentItem && (
                  <p className={`${isDark ? 'text-[#E7E7E7]' : 'text-[#666666]'} text-sm`}>
                    Current: {progress.currentItem}
                    {progress.totalItems && progress.completedItems !== undefined && (
                      <span className="ml-2">
                        ({progress.completedItems}/{progress.totalItems})
                      </span>
                    )}
                  </p>
                )}
                
                {startTime && (
                  <p className={`${isDark ? 'text-[#E7E7E7]' : 'text-[#666666]'} text-xs font-mono`}>
                    Elapsed: {formatTime(elapsedTime)}
                  </p>
                )}
              </div>
            )}
            
            {/* Completed */}
            {completed && (
              <div className={`p-4 rounded-lg flex items-start gap-3 ${isDark ? 'bg-green-900/20 border border-green-500/50' : 'bg-green-50 border border-green-200'}`}>
                <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                <div>
                  <p className={`${isDark ? 'text-green-400' : 'text-green-700'} font-semibold`}>Images Generated Successfully!</p>
                  <p className={`${isDark ? 'text-green-300' : 'text-green-600'} text-sm mt-1`}>
                    All selected images have been generated and saved to your Story Bible.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className={`flex items-center justify-end gap-3 p-6 border-t ${isDark ? 'border-[#36393F]' : 'border-[#E5E5E5]'} bg-transparent`}>
            {!isGenerating && !completed && (
              <>
                <button
                  onClick={handleClose}
                  className={`px-4 py-2 transition-colors ${isDark ? 'text-[#E7E7E7] hover:text-white' : 'text-[#666666] hover:text-[#1A1A1A]'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('🔘 [GenerateImagesModal] Button clicked')
                    handleGenerate()
                  }}
                  disabled={selectedSections.length === 0 || !userId || !storyBibleId}
                  className="px-6 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-lg font-semibold hover:from-[#059669] hover:to-[#047857] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  title={selectedSections.length === 0 ? 'Please select at least one section' : !userId || !storyBibleId ? 'Missing required data' : 'Generate images for selected sections'}
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Selected
                </button>
              </>
            )}
            
            {isGenerating && (
              <button
                onClick={handleCancel}
                className={`px-4 py-2 transition-colors ${isDark ? 'text-[#E7E7E7] hover:text-white' : 'text-[#666666] hover:text-[#1A1A1A]'}`}
              >
                Cancel
              </button>
            )}
            
            {completed && (
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-[#10B981] text-white rounded-lg font-semibold hover:bg-[#059669] transition-colors"
              >
                Done
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

