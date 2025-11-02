'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import type { PreProductionData, StoryboardFrame, StoryboardsData } from '@/types/preproduction'
import { EditableField } from '../shared/EditableField'
import { CollaborativeNotes } from '../shared/CollaborativeNotes'
import { getStoryBible } from '@/services/story-bible-service'

interface StoryboardsTabProps {
  preProductionData: PreProductionData
  onUpdate: (tabName: string, tabData: any) => Promise<void>
  currentUserId: string
  currentUserName: string
}

export function StoryboardsTab({
  preProductionData,
  onUpdate,
  currentUserId,
  currentUserName
}: StoryboardsTabProps) {
  const router = useRouter()
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [generatingImageFrameId, setGeneratingImageFrameId] = useState<string | null>(null)
  
  const storyboardsData: StoryboardsData = preProductionData.storyboards || {
    episodeNumber: preProductionData.episodeNumber,
    episodeTitle: preProductionData.episodeTitle || `Episode ${preProductionData.episodeNumber}`,
    totalFrames: 0,
    finalizedFrames: 0,
    scenes: [],
    lastUpdated: Date.now(),
    updatedBy: currentUserId
  }

  const breakdownData = preProductionData.scriptBreakdown
  const scriptsData = (preProductionData as any).scripts

  const handleFrameUpdate = async (frameId: string, updates: Partial<StoryboardFrame>) => {
    const updatedScenes = storyboardsData.scenes.map(scene => ({
      ...scene,
      frames: scene.frames.map(frame =>
        frame.id === frameId ? { ...frame, ...updates } : frame
      )
    }))
    
    // Recalculate totals
    const totalFrames = updatedScenes.reduce((sum, scene) => sum + scene.frames.length, 0)
    const finalizedFrames = updatedScenes.reduce((sum, scene) => 
      sum + scene.frames.filter(f => f.status === 'final').length, 0
    )
    
    await onUpdate('storyboards', {
      ...storyboardsData,
      scenes: updatedScenes,
      totalFrames,
      finalizedFrames,
      lastUpdated: Date.now()
    })
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
    
    const updatedScenes = storyboardsData.scenes.map(s =>
      s.sceneNumber === sceneNumber
        ? { ...s, frames: [...s.frames, newFrame] }
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
      const storyBible = await getStoryBible(preProductionData.storyBibleId, currentUserId)

      if (!storyBible) {
        throw new Error('Story bible not found')
      }

      console.log('✅ Story bible loaded:', storyBible.seriesTitle || storyBible.title)

      // 3. Call generation API
      console.log('🤖 Calling storyboard generation API...')
      const response = await fetch('/api/generate/storyboards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preProductionId: preProductionData.id,
          storyBibleId: preProductionData.storyBibleId,
          episodeNumber: preProductionData.episodeNumber,
          userId: currentUserId,
          breakdownData,
          scriptData: scriptsData?.fullScript || null,
          storyBibleData: storyBible
        })
      })

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

      // 4. Save to Firestore
      await onUpdate('storyboards', {
        ...result.storyboards,
        lastUpdated: Date.now(),
        updatedBy: currentUserId
      })

      console.log('✅ Storyboards saved to Firestore')
    } catch (error: any) {
      console.error('❌ Error generating storyboards:', error)
      setGenerationError(error.message || 'Failed to generate storyboards')
      
      // Redirect to Script Breakdown tab if breakdown not found
      if (error.message?.includes('breakdown') || error.message?.includes('Script breakdown')) {
        router.push('/preproduction?storyBibleId=' + preProductionData.storyBibleId + '&episodeNumber=' + preProductionData.episodeNumber + '&episodeTitle=' + encodeURIComponent(preProductionData.episodeTitle || '') + '&tab=breakdown')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateImage = async (frame: StoryboardFrame) => {
    if (!frame.imagePrompt) {
      alert('No image prompt available for this frame')
      return
    }

    setGeneratingImageFrameId(frame.id)

    try {
      console.log('🎨 Generating image for frame', frame.id)
      console.log('  Prompt:', frame.imagePrompt.substring(0, 100) + '...')

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: frame.imagePrompt
        })
      })

      if (!response.ok) {
        let errorMessage = 'Image generation failed'
        try {
          const text = await response.text()
          if (text) {
            try {
              const errorData = JSON.parse(text)
              errorMessage = errorData.error || errorData.details || errorMessage
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

      if (!result.imageUrl) {
        throw new Error('Invalid response: imageUrl missing')
      }

      console.log('✅ Image generated:', result.imageUrl)

      // Update frame with image URL
      await handleFrameUpdate(frame.id, {
        frameImage: result.imageUrl
      })
    } catch (error: any) {
      console.error('❌ Error generating image:', error)
      alert(`Failed to generate image: ${error.message}`)
    } finally {
      setGeneratingImageFrameId(null)
    }
  }

  const handleAddComment = async (frameId: string, content: string) => {
    const newComment = {
      id: `comment_${Date.now()}`,
      userId: currentUserId,
      userName: currentUserName,
      content,
      timestamp: Date.now()
    }

    const updatedScenes = storyboardsData.scenes.map(scene => ({
      ...scene,
      frames: scene.frames.map(frame =>
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

  const totalFrames = storyboardsData.scenes.reduce((sum, scene) => sum + scene.frames.length, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#e7e7e7]">Visual Storyboards</h2>
          <p className="text-sm text-[#e7e7e7]/70">
            {totalFrames} frames across {storyboardsData.scenes.length} scenes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateStoryboards}
            disabled={isGenerating}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {isGenerating ? '🔄 Generating...' : '✨ Generate Storyboards'}
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
            {isGenerating ? '🔄 Generating...' : '✨ Generate with AI'}
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {storyboardsData.scenes.map((scene) => (
            <div key={scene.sceneNumber} className="space-y-4">
              {/* Scene Header */}
              <div className="flex items-center justify-between border-b border-[#36393f] pb-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-[#00FF99]">Scene {scene.sceneNumber}: {scene.sceneTitle}</h3>
                  <span className="text-sm text-[#e7e7e7]/50">
                    {scene.frames.length} shot{scene.frames.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  onClick={() => handleAddFrame(scene.sceneNumber)}
                  className="px-3 py-1 bg-[#00FF99] text-black rounded text-xs font-medium hover:bg-[#00CC7A] transition-colors"
                >
                  + Add Shot
                </button>
              </div>

              {/* Frames Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {scene.frames.map((frame) => (
                  <StoryboardFrameCard
                    key={frame.id}
                    frame={frame}
                    onUpdate={(updates) => handleFrameUpdate(frame.id, updates)}
                    onAddComment={(content) => handleAddComment(frame.id, content)}
                    onGenerateImage={() => handleGenerateImage(frame)}
                    currentUserId={currentUserId}
                    currentUserName={currentUserName}
                    isSelected={selectedFrame === frame.id}
                    isGeneratingImage={generatingImageFrameId === frame.id}
                    onSelect={() => setSelectedFrame(frame.id === selectedFrame ? null : frame.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Storyboard Frame Card
function StoryboardFrameCard({
  frame,
  onUpdate,
  onAddComment,
  onGenerateImage,
  currentUserId,
  currentUserName,
  isSelected,
  isGeneratingImage,
  onSelect
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
}) {
  return (
    <motion.div
      layout
      className={`bg-[#2a2a2a] rounded-lg border transition-colors ${
        isSelected ? 'border-[#00FF99]' : 'border-[#36393f]'
      }`}
    >
      {/* Frame Image */}
      <div className="aspect-video bg-[#1a1a1a] rounded-t-lg flex items-center justify-center relative overflow-hidden">
        {frame.frameImage ? (
          <img src={frame.frameImage} alt={`Shot ${frame.shotNumber}`} className="w-full h-full object-cover" />
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
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 rounded text-xs font-bold text-white">
          Shot {frame.shotNumber}
        </div>
        {isGeneratingImage && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white text-sm">Generating image...</div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Notes/Description */}
        <EditableField
          value={frame.notes}
          onSave={(value) => onUpdate({ notes: value })}
          placeholder="Shot description..."
          className="text-sm text-[#e7e7e7]"
        />

        {/* Camera Angle & Movement */}
        <div className="grid grid-cols-2 gap-2">
          <select
            value={frame.cameraAngle}
            onChange={(e) => onUpdate({ cameraAngle: e.target.value })}
            className="bg-[#1a1a1a] border border-[#36393f] rounded px-2 py-1 text-[#e7e7e7] text-xs"
          >
            <option value="wide">Wide</option>
            <option value="medium">Medium</option>
            <option value="close-up">Close-up</option>
            <option value="extreme-close-up">Extreme Close-up</option>
            <option value="over-shoulder">Over Shoulder</option>
            <option value="two-shot">Two Shot</option>
            <option value="dutch-angle">Dutch Angle</option>
          </select>

          <select
            value={frame.cameraMovement}
            onChange={(e) => onUpdate({ cameraMovement: e.target.value })}
            className="bg-[#1a1a1a] border border-[#36393f] rounded px-2 py-1 text-[#e7e7e7] text-xs"
          >
            <option value="static">Static</option>
            <option value="pan">Pan</option>
            <option value="tilt">Tilt</option>
            <option value="dolly">Dolly</option>
            <option value="zoom">Zoom</option>
            <option value="handheld">Handheld</option>
            <option value="tracking">Tracking</option>
            <option value="crane">Crane</option>
          </select>
        </div>

        {/* Expand/Collapse */}
        <button
          onClick={onSelect}
          className="w-full py-1 text-xs text-[#00FF99] hover:text-[#00CC7A] transition-colors"
        >
          {isSelected ? '▲ Less' : '▼ More'}
        </button>

        {/* Expanded Content */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2 pt-2 border-t border-[#36393f]"
            >
              {/* Dialogue */}
              <div>
                <div className="text-xs text-[#e7e7e7]/50 mb-1">Dialogue</div>
                <EditableField
                  value={frame.dialogueSnippet}
                  onSave={(value) => onUpdate({ dialogueSnippet: value })}
                  placeholder="Add dialogue..."
                  multiline
                  className="text-xs text-[#e7e7e7]"
                />
              </div>

              {/* Lighting Notes */}
              <div>
                <div className="text-xs text-[#e7e7e7]/50 mb-1">Lighting</div>
                <EditableField
                  value={frame.lightingNotes}
                  onSave={(value) => onUpdate({ lightingNotes: value })}
                  placeholder="Lighting notes..."
                  multiline
                  className="text-xs text-[#e7e7e7]"
                />
              </div>

              {/* Props in Frame */}
              {frame.propsInFrame && frame.propsInFrame.length > 0 && (
                <div>
                  <div className="text-xs text-[#e7e7e7]/50 mb-1">Props</div>
                  <div className="flex flex-wrap gap-1">
                    {frame.propsInFrame.map((prop, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-[#1a1a1a] rounded text-xs text-[#e7e7e7]/70">
                        {prop}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Prompt (for reference) */}
              {frame.imagePrompt && (
                <div>
                  <div className="text-xs text-[#e7e7e7]/50 mb-1">Image Prompt</div>
                  <div className="text-xs text-[#e7e7e7]/60 bg-[#1a1a1a] rounded p-2">
                    {frame.imagePrompt}
                  </div>
                  {!frame.frameImage && (
                    <button
                      onClick={onGenerateImage}
                      disabled={isGeneratingImage}
                      className="mt-2 w-full px-3 py-1.5 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {isGeneratingImage ? 'Generating...' : '🎨 Generate Image'}
                    </button>
                  )}
                  {frame.frameImage && (
                    <button
                      onClick={onGenerateImage}
                      disabled={isGeneratingImage}
                      className="mt-2 w-full px-3 py-1.5 bg-purple-600/50 text-white rounded text-xs font-medium hover:bg-purple-700/50 transition-colors disabled:opacity-50"
                    >
                      {isGeneratingImage ? 'Regenerating...' : '🔄 Regenerate Image'}
                    </button>
                  )}
                </div>
              )}

              {/* Notes */}
              <div>
                <div className="text-xs text-[#e7e7e7]/50 mb-1">Notes</div>
                <EditableField
                  value={frame.notes}
                  onSave={(value) => onUpdate({ notes: value })}
                  placeholder="Add notes..."
                  multiline
                  className="text-xs text-[#e7e7e7]"
                />
              </div>

              {/* Comments */}
              <CollaborativeNotes
                comments={frame.comments || []}
                onAddComment={onAddComment}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
