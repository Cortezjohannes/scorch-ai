'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import type { PreProductionData, EpisodePreProductionData, ShotListData, Shot, ShotListScene } from '@/types/preproduction'
import { StatusBadge } from '../shared/StatusBadge'
import { CollaborativeNotes } from '../shared/CollaborativeNotes'
import { EditableField } from '../shared/EditableField'
import { getStoryBible } from '@/services/story-bible-service'

interface ShotListTabProps {
  preProductionData: PreProductionData
  onUpdate: (tabName: string, tabData: any) => Promise<void>
  currentUserId: string
  currentUserName: string
}

export function ShotListTab({
  preProductionData,
  onUpdate,
  currentUserId,
  currentUserName
}: ShotListTabProps) {
  const router = useRouter()
  const [expandedScenes, setExpandedScenes] = useState<Set<number>>(new Set([0]))
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterAIGeneratable, setFilterAIGeneratable] = useState<string>('all') // 'all' | 'ai-generatable' | 'requires-actors'
  const [viewMode, setViewMode] = useState<'narrative' | 'efficiency'>('narrative')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [isGeneratingSample, setIsGeneratingSample] = useState<string | null>(null) // shotId being generated
  const [selectedShotForGeneration, setSelectedShotForGeneration] = useState<Shot | null>(null) // Selected shot for video generation
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`ai-disclaimer-dismissed-${preProductionData.storyBibleId}-ep${(preProductionData as EpisodePreProductionData).episodeNumber}`) !== 'true'
    }
    return true
  })
  const [showSampleDisclaimer, setShowSampleDisclaimer] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`ai-sample-disclaimer-dismissed-${preProductionData.storyBibleId}-ep${(preProductionData as EpisodePreProductionData).episodeNumber}`) !== 'true'
    }
    return true
  })
  const episodeData = preProductionData as EpisodePreProductionData
  const shotListData = episodeData.shotList

  const breakdownData = episodeData.scriptBreakdown
  const scriptsData = (episodeData as any).scripts
  const storyboardsData = episodeData.storyboards

  const handleGenerateShotList = async () => {
    setIsGenerating(true)
    setGenerationError(null)

    try {
      console.log('🎬 Generating shot list...')

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

      // Script data is required
      if (!scriptsData?.fullScript) {
        setGenerationError('Please generate script first. Go to Scripts tab and generate a script.')
        setIsGenerating(false)
        router.push('/preproduction?storyBibleId=' + episodeData.storyBibleId + '&episodeNumber=' + episodeData.episodeNumber + '&episodeTitle=' + encodeURIComponent(episodeData.episodeTitle || '') + '&tab=scripts')
        return
      }
      console.log('✅ Script data found')

      // Storyboards are optional but helpful
      if (storyboardsData && storyboardsData.scenes && storyboardsData.scenes.length > 0) {
        console.log('✅ Storyboards found - will use as reference')
      } else {
        console.log('⚠️ No storyboards found - will generate directly from script')
      }

      // 2. Fetch story bible
      console.log('📖 Fetching story bible...')
      const storyBible = await getStoryBible(episodeData.storyBibleId, currentUserId)

      if (!storyBible) {
        throw new Error('Story bible not found')
      }

      console.log('✅ Story bible loaded:', storyBible.seriesTitle || storyBible.title)

      // 3. Call generation API
      console.log('🤖 Calling shot list generation API...')
      const response = await fetch('/api/generate/shot-list', {
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
          scriptData: scriptsData.fullScript,
          storyBibleData: storyBible,
          storyboardsData: storyboardsData || null
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

      console.log('✅ Shot list generated:', result.shotList.totalShots, 'shots')

      await onUpdate('shotList', {
        ...result.shotList,
        lastUpdated: Date.now(),
        updatedBy: currentUserId
      })

      console.log('✅ Shot list saved to Firestore')
    } catch (error: any) {
      console.error('❌ Error generating shot list:', error)
      setGenerationError(error.message || 'Failed to generate shot list')
      
      if (error.message?.includes('breakdown') || error.message?.includes('Script breakdown')) {
        router.push('/preproduction?storyBibleId=' + episodeData.storyBibleId + '&episodeNumber=' + episodeData.episodeNumber + '&episodeTitle=' + encodeURIComponent(episodeData.episodeTitle || '') + '&tab=breakdown')
      } else if (error.message?.includes('script') || error.message?.includes('Script')) {
        router.push('/preproduction?storyBibleId=' + episodeData.storyBibleId + '&episodeNumber=' + episodeData.episodeNumber + '&episodeTitle=' + encodeURIComponent(episodeData.episodeTitle || '') + '&tab=scripts')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  // Sync selectedShotForGeneration with shotListData when it updates (from Firestore subscription)
  // This must be before any early returns to maintain hook call order
  useEffect(() => {
    if (selectedShotForGeneration && shotListData) {
      const updatedShot = shotListData.scenes
        ?.flatMap(s => s.shots)
        .find(s => s.id === selectedShotForGeneration.id)
      
      if (updatedShot && updatedShot.aiGeneratedVideoUrl && !selectedShotForGeneration.aiGeneratedVideoUrl) {
        setSelectedShotForGeneration(updatedShot)
      }
    }
  }, [shotListData, selectedShotForGeneration])

  // If no data, show initialize prompt
  if (!shotListData) {
    const hasBreakdown = breakdownData && breakdownData.scenes && breakdownData.scenes.length > 0
    const hasScript = scriptsData?.fullScript

    return (
      <div className="text-center py-16">
        <div className="mb-6">
          <span className="text-6xl">🎬</span>
        </div>
        <h2 className="text-2xl font-bold text-[#e7e7e7] mb-4">
          Shot List Not Generated
        </h2>
        <p className="text-[#e7e7e7]/70 mb-6 max-w-md mx-auto">
          Generate a shot list to plan every camera setup and maximize on-set efficiency.
        </p>
        
        {!hasBreakdown && (
          <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg max-w-md mx-auto">
            <p className="text-yellow-400 text-sm">
              ⚠️ Please generate script breakdown first
            </p>
          </div>
        )}
        
        {!hasScript && hasBreakdown && (
          <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg max-w-md mx-auto">
            <p className="text-yellow-400 text-sm">
              ⚠️ Please generate script first
            </p>
          </div>
        )}

        <button
          onClick={handleGenerateShotList}
          disabled={isGenerating || !hasBreakdown || !hasScript}
          className="px-6 py-3 bg-[#10B981] text-black font-medium rounded-lg hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? '🔄 Generating...' : '✨ Generate Shot List'}
        </button>

        {generationError && (
          <div className="mt-4 p-4 bg-red-900/20 border border-red-700/50 rounded-lg max-w-md mx-auto">
            <p className="text-red-400 text-sm">{generationError}</p>
          </div>
        )}
      </div>
    )
  }

  const toggleScene = (sceneNumber: number) => {
    const newExpanded = new Set(expandedScenes)
    if (newExpanded.has(sceneNumber)) {
      newExpanded.delete(sceneNumber)
    } else {
      newExpanded.add(sceneNumber)
    }
    setExpandedScenes(newExpanded)
  }

  const expandAll = () => {
    setExpandedScenes(new Set(shotListData.scenes.map(s => s.sceneNumber)))
  }

  const collapseAll = () => {
    setExpandedScenes(new Set())
  }

  const handleShotUpdate = async (sceneIndex: number, shotIndex: number, field: string, value: any) => {
    const updatedScenes = [...shotListData.scenes]
    const updatedShots = [...updatedScenes[sceneIndex].shots]
    updatedShots[shotIndex] = {
      ...updatedShots[shotIndex],
      [field]: value
    }
    updatedScenes[sceneIndex] = {
      ...updatedScenes[sceneIndex],
      shots: updatedShots,
      completedShots: updatedShots.filter(s => s.status === 'got-it').length
    }

    await onUpdate('shotList', {
      ...shotListData,
      scenes: updatedScenes,
      completedShots: updatedScenes.reduce((sum, scene) => sum + scene.completedShots, 0),
      lastUpdated: Date.now(),
      updatedBy: currentUserId
    })
  }

  const handleAddComment = async (sceneIndex: number, shotIndex: number, commentContent: string, mentions?: string[]) => {
    const shot = shotListData.scenes[sceneIndex].shots[shotIndex]
    const newComment = {
      id: `comment-${Date.now()}`,
      userId: currentUserId,
      userName: currentUserName,
      content: commentContent,
      timestamp: Date.now()
    }

    const updatedScenes = [...shotListData.scenes]
    const updatedShots = [...updatedScenes[sceneIndex].shots]
    updatedShots[shotIndex] = {
      ...shot,
      comments: [...(shot.comments || []), newComment]
    }
    updatedScenes[sceneIndex] = {
      ...updatedScenes[sceneIndex],
      shots: updatedShots
    }

    await onUpdate('shotList', {
      ...shotListData,
      scenes: updatedScenes,
      lastUpdated: Date.now(),
      updatedBy: currentUserId
    })
  }

  // Check if any sample has been generated for this episode
  const hasGeneratedSample = shotListData?.scenes?.some(scene =>
    scene.shots.some(shot => shot.aiGenerationSampleGenerated === true)
  ) || false

  // Filter shots by status and AI-generatability
  const filteredScenes = shotListData.scenes.map(scene => ({
    ...scene,
    shots: scene.shots.filter(shot => {
      // Status filter
      const statusMatch = filterStatus === 'all' || shot.status === filterStatus
      
      // AI-generatability filter
      let aiMatch = true
      if (filterAIGeneratable === 'ai-generatable') {
        aiMatch = shot.canBeAIGenerated === true
      } else if (filterAIGeneratable === 'requires-actors') {
        aiMatch = shot.canBeAIGenerated !== true
      }
      
      return statusMatch && aiMatch
    })
  })).filter(scene => scene.shots.length > 0)

  const handleDismissDisclaimer = () => {
    setShowDisclaimerModal(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`ai-disclaimer-dismissed-${episodeData.storyBibleId}-ep${episodeData.episodeNumber}`, 'true')
    }
  }

  const handleDismissSampleDisclaimer = () => {
    setShowSampleDisclaimer(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`ai-sample-disclaimer-dismissed-${episodeData.storyBibleId}-ep${episodeData.episodeNumber}`, 'true')
    }
  }

  const handleSelectShotForGeneration = (shot: Shot) => {
    if (!shot.canBeAIGenerated) {
      alert('This shot is not marked as AI-generatable.')
      return
    }
    setSelectedShotForGeneration(shot)
    // Scroll to top to show video player section
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleGenerateSample = async () => {
    if (!selectedShotForGeneration) {
      alert('Please select a shot first')
      return
    }

    const shot = selectedShotForGeneration
    if (hasGeneratedSample) {
      alert('A sample video has already been generated for this episode. Only one sample per episode is allowed.')
      return
    }

    setIsGeneratingSample(shot.id)
    try {
      const response = await fetch('/api/generate/filler-scene-sample', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shotId: shot.id,
          preProductionId: episodeData.id,
          storyBibleId: episodeData.storyBibleId,
          episodeNumber: episodeData.episodeNumber,
          userId: currentUserId,
          shotDescription: shot.description,
          sceneContext: `Scene ${shot.sceneNumber}: ${shot.description}`,
          aiGenerationPrompt: shot.aiGenerationPrompt,
          preProductionData: episodeData // Pass pre-production data to avoid Firestore auth issues
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        // Check if it was blocked by content policy
        if (result.contentPolicyBlocked) {
          throw new Error('Video generation blocked by content policy. This shot description may contain content that violates safety policies. Please try a different shot or modify the description.')
        }
        throw new Error(result.error || 'Failed to generate sample video')
      }

      // Save video URL to Firestore (client-side, following image pattern)
      // VEO already provides a URL (via proxy), so we just save it directly - no Storage upload needed
      if (result.videoUrl) {
        // Find the shot in the shot list and update it
        const shotList = episodeData.shotList
        if (shotList?.scenes) {
          // Update the shot with video URL
          const updatedScenes = shotList.scenes.map(scene => ({
            ...scene,
            shots: scene.shots.map(s => {
              if (s.id === shot.id) {
                return {
                  ...s,
                  aiGeneratedVideoUrl: result.videoUrl,
                  aiGenerationSampleGenerated: true,
                  aiGenerationPrompt: shot.aiGenerationPrompt || s.aiGenerationPrompt
                }
              }
              return s
            })
          }))

          // Save to Firestore via onUpdate (client-side, like images)
          await onUpdate('shotList', {
            ...shotList,
            scenes: updatedScenes,
            lastUpdated: Date.now(),
            updatedBy: currentUserId
          })
        }

        // Update the selected shot state with the video URL
        setSelectedShotForGeneration(prev => prev ? {
          ...prev,
          aiGeneratedVideoUrl: result.videoUrl,
          aiGenerationSampleGenerated: true,
          aiGenerationPrompt: prev.aiGenerationPrompt || shot.aiGenerationPrompt
        } : null)
      }

      // Scroll to top to show the video player
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error: any) {
      console.error('Error generating sample:', error)
      alert(error.message || 'Failed to generate sample video')
    } finally {
      setIsGeneratingSample(null)
    }
  }

  const getSortedShots = (shots: Shot[]) => {
    if (viewMode === 'narrative') return shots
    return [...shots].sort((a, b) => {
      const groupA = a.setupGroup || ''
      const groupB = b.setupGroup || ''
      if (groupA !== groupB) return groupA.localeCompare(groupB)
      const lensA = a.lensRecommendation || ''
      const lensB = b.lensRecommendation || ''
      if (lensA !== lensB) return lensA.localeCompare(lensB)
      return (a.cameraAngle || '').localeCompare(b.cameraAngle || '')
    })
  }

  const completionPercent = (shotListData.completedShots / shotListData.totalShots) * 100

  // Find the shot with generated video (if any) - prioritize selected shot if it has video
  const shotWithVideo = selectedShotForGeneration?.aiGeneratedVideoUrl 
    ? selectedShotForGeneration
    : shotListData?.scenes
      ?.flatMap(s => s.shots)
      .find(s => s.aiGeneratedVideoUrl)

  return (
    <div className="space-y-6">
      {/* Disclaimer Modal */}
      <AnimatePresence>
        {showDisclaimerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={handleDismissDisclaimer}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-6 max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[#10B981] text-2xl">🤖</span>
                <h3 className="text-xl font-bold text-[#e7e7e7]">AI Generation Available</h3>
              </div>
              <p className="text-[#e7e7e7]/80 mb-6">
                Some shots in this episode can be generated by AI in case you want to save on time and budget.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={handleDismissDisclaimer}
                  className="px-6 py-2 bg-[#10B981] text-black font-medium rounded-lg hover:bg-[#059669] transition-colors"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sample Selection Disclaimer Banner */}
      {showSampleDisclaimer && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-[#10B981]/20 border border-[#10B981]/40 rounded-lg p-4 flex items-start justify-between gap-4"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#10B981] text-lg">✨</span>
              <h3 className="text-[#10B981] font-semibold">Try AI Video Generation</h3>
            </div>
            <p className="text-[#e7e7e7]/80 text-sm mb-2">
              You can select one AI-generatable shot to generate a sample video. Look for shots with the "AI" badge and click "Select for Generation" to try it out.
            </p>
            <div className="text-xs text-[#e7e7e7]/60 space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#10B981]/30 border border-[#10B981] text-[#10B981] rounded text-[10px]">🤖 AI Highly</span>
                <span>Strongly recommend AI (establishing shots, landscapes, B-roll)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B] rounded text-[10px]">🤖 AI Recommended</span>
                <span>Can use AI (transitions, background plates)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#6B7280]/20 border border-[#6B7280]/40 text-[#6B7280] rounded text-[10px]">🤖 AI Optional</span>
                <span>Actors should probably shoot, but AI can save time</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleDismissSampleDisclaimer}
            className="text-[#e7e7e7]/50 hover:text-[#e7e7e7] transition-colors flex-shrink-0"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* Video Player Section - At the Top */}
      {(selectedShotForGeneration || shotWithVideo) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-6"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#e7e7e7] mb-2">AI-Generated Video Sample</h3>
              <p className="text-sm text-[#e7e7e7]/70">
                {shotWithVideo 
                  ? `Sample video for Shot ${shotWithVideo.shotNumber} (Scene ${shotWithVideo.sceneNumber})`
                  : selectedShotForGeneration 
                    ? `Selected: Shot ${selectedShotForGeneration.shotNumber} (Scene ${selectedShotForGeneration.sceneNumber})`
                    : ''}
              </p>
            </div>
            {selectedShotForGeneration && !shotWithVideo && (
              <button
                onClick={() => setSelectedShotForGeneration(null)}
                className="text-[#e7e7e7]/50 hover:text-[#e7e7e7] transition-colors"
                aria-label="Clear selection"
              >
                ✕
              </button>
            )}
          </div>

          {(shotWithVideo?.aiGeneratedVideoUrl || selectedShotForGeneration?.aiGeneratedVideoUrl) ? (
            <div className="space-y-4">
              <div className="relative w-full" style={{ aspectRatio: '9/16', maxWidth: '400px', margin: '0 auto' }}>
                <video
                  src={(shotWithVideo?.aiGeneratedVideoUrl || selectedShotForGeneration?.aiGeneratedVideoUrl) || ''}
                  controls
                  className="w-full h-full rounded-lg border border-[#36393f]"
                  style={{ aspectRatio: '9/16' }}
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              <p className="text-xs text-[#e7e7e7]/50 text-center">
                The rest can be generated in post-production
              </p>
            </div>
          ) : selectedShotForGeneration ? (
            <div className="space-y-4">
              <div className="bg-[#2a2a2a] border border-[#36393f] rounded-lg p-4">
                <p className="text-sm text-[#e7e7e7] mb-2">{selectedShotForGeneration.description}</p>
                <div className="flex items-center gap-4 text-xs text-[#e7e7e7]/50 mb-4">
                  <span>📷 {selectedShotForGeneration.cameraAngle}</span>
                  <span>🎬 {selectedShotForGeneration.cameraMovement}</span>
                  <span>⏱️ {selectedShotForGeneration.durationEstimate}s</span>
                </div>
                {selectedShotForGeneration.aiGenerationPrompt && (
                  <div className="bg-[#1a1a1a] border border-[#36393f] rounded p-3 mb-4">
                    <label className="text-xs text-[#e7e7e7]/60 uppercase mb-2 block">AI Generation Prompt</label>
                    <p className="text-xs text-[#e7e7e7]/70 whitespace-pre-wrap">
                      {selectedShotForGeneration.aiGenerationPrompt}
                    </p>
                  </div>
                )}
                <button
                  onClick={handleGenerateSample}
                  disabled={isGeneratingSample !== null || hasGeneratedSample}
                  className="w-full px-4 py-3 bg-[#10B981] text-black font-medium rounded-lg hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingSample === selectedShotForGeneration.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin inline-block mr-2" />
                      Generating...
                    </>
                  ) : hasGeneratedSample ? (
                    'Sample Already Generated'
                  ) : (
                    '✨ Try a Sample'
                  )}
                </button>
              </div>
            </div>
          ) : null}
        </motion.div>
      )}

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <ShotListStatCard
          icon="🎬"
          label="Total Shots"
          value={shotListData.totalShots}
          subtitle={`${shotListData.scenes.length} scenes`}
        />
        <ShotListStatCard
          icon="✓"
          label="Completed"
          value={shotListData.completedShots}
          subtitle={`${completionPercent.toFixed(0)}% done`}
          color="#10B981"
        />
        <ShotListStatCard
          icon="📋"
          label="Remaining"
          value={shotListData.totalShots - shotListData.completedShots}
          subtitle="Shots to capture"
          color="#60A5FA"
        />
        <ShotListStatCard
          icon="⏱️"
          label="Avg Duration"
          value={`${calculateAverageDuration(shotListData)}s`}
          subtitle="Per shot"
        />
        <ShotListStatCard
          icon="🛠️"
          label="Est. Setup Time"
          value={`${calculateTotalSetupMinutes(shotListData)}m`}
          subtitle={viewMode === 'efficiency' ? 'Optimizing setups' : 'Switch to efficiency view'}
        />
      </div>

      {/* Progress Bar */}
      <div className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-[#e7e7e7]">Shot Progress</h3>
          <span className="text-2xl font-bold text-[#10B981]">
            {completionPercent.toFixed(0)}%
          </span>
        </div>
        <div className="h-6 bg-[#2a2a2a] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-[#10B981] rounded-full"
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-[#e7e7e7]/50">
          <span>0 shots</span>
          <span>{shotListData.totalShots} shots</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-bold text-[#e7e7e7]">
            Production Shot List
          </h2>
          <span className="text-sm text-[#e7e7e7]/50">
            {shotListData.totalShots} shots across {shotListData.scenes.length} scenes
          </span>
          
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-[#2a2a2a] border border-[#36393f] rounded-lg text-[#e7e7e7] text-sm focus:outline-none focus:border-[#10B981]"
          >
            <option value="all">All Shots</option>
            <option value="planned">Planned</option>
            <option value="got-it">Got It</option>
            <option value="need-pickup">Need Pickup</option>
            <option value="cut">Cut</option>
          </select>

          {/* AI Generatability Filter */}
          <select
            value={filterAIGeneratable}
            onChange={(e) => setFilterAIGeneratable(e.target.value)}
            className="px-4 py-2 bg-[#2a2a2a] border border-[#36393f] rounded-lg text-[#e7e7e7] text-sm focus:outline-none focus:border-[#10B981]"
          >
            <option value="all">All Shots</option>
            <option value="ai-generatable">AI Generatable</option>
            <option value="requires-actors">Requires Actors</option>
          </select>

          {/* View toggle */}
          <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#36393f] rounded-lg p-1">
            <button
              onClick={() => setViewMode('narrative')}
              className={`px-3 py-1 text-xs rounded-md ${viewMode === 'narrative' ? 'bg-[#10B981] text-black' : 'text-[#e7e7e7]/70'}`}
            >
              Narrative Order
            </button>
            <button
              onClick={() => setViewMode('efficiency')}
              className={`px-3 py-1 text-xs rounded-md ${viewMode === 'efficiency' ? 'bg-[#10B981] text-black' : 'text-[#e7e7e7]/70'}`}
            >
              Efficiency Order
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateShotList}
            disabled={isGenerating}
            className="px-4 py-2 bg-[#10B981] text-black font-medium rounded-lg hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isGenerating ? '🔄 Generating...' : '🔄 Regenerate'}
          </button>
          <button
            onClick={expandAll}
            className="px-4 py-2 bg-[#2a2a2a] text-[#e7e7e7] rounded-lg hover:bg-[#36393f] transition-colors text-sm"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-4 py-2 bg-[#2a2a2a] text-[#e7e7e7] rounded-lg hover:bg-[#36393f] transition-colors text-sm"
          >
            Collapse All
          </button>
        </div>
      </div>

      {generationError && (
        <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
          <p className="text-red-400 text-sm">{generationError}</p>
        </div>
      )}

      {/* Shot List Cards */}
      <div className="space-y-4">
        {filteredScenes.map((scene) => {
          const actualSceneIndex = shotListData.scenes.findIndex(s => s.sceneNumber === scene.sceneNumber)
          const sceneShots = getSortedShots(scene.shots)
          return (
            <SceneSection
              key={scene.sceneNumber}
              scene={{ ...scene, shots: sceneShots }}
              isExpanded={expandedScenes.has(scene.sceneNumber)}
              onToggle={() => toggleScene(scene.sceneNumber)}
              onShotUpdate={(shotIndex, field, value) => handleShotUpdate(actualSceneIndex, shotIndex, field, value)}
              onAddComment={(shotIndex, comment, mentions) => handleAddComment(actualSceneIndex, shotIndex, comment, mentions)}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              storyboardsData={storyboardsData}
              hasGeneratedSample={hasGeneratedSample}
              onGenerateSample={handleGenerateSample}
              isGeneratingSample={isGeneratingSample}
              selectedShotForGeneration={selectedShotForGeneration}
              onSelectShotForGeneration={handleSelectShotForGeneration}
            />
          )
        })}
      </div>
    </div>
  )
}

// Helper Functions
function calculateAverageDuration(data: ShotListData): number {
  const totalDuration = data.scenes.reduce(
    (sum, scene) => sum + scene.shots.reduce((s, shot) => s + shot.durationEstimate, 0),
    0
  )
  return Math.round(totalDuration / data.totalShots)
}

function calculateTotalSetupMinutes(data: ShotListData): number {
  return data.scenes.reduce(
    (sum, scene) => sum + scene.shots.reduce((s, shot) => s + (shot.estimatedSetupTime || 0), 0),
    0
  )
}

// Shot List Stat Card
function ShotListStatCard({ 
  icon, 
  label, 
  value, 
  subtitle,
  color = '#e7e7e7'
}: { 
  icon: string
  label: string
  value: number | string
  subtitle?: string
  color?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-4"
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{icon}</span>
        <div className="flex-1">
          <div className="text-sm text-[#e7e7e7]/50">{label}</div>
        </div>
      </div>
      <div className="text-2xl font-bold" style={{ color }}>
        {value}
      </div>
      {subtitle && (
        <div className="text-xs text-[#e7e7e7]/50 mt-1">
          {subtitle}
        </div>
      )}
    </motion.div>
  )
}

// Scene Section Component
function SceneSection({
  scene,
  isExpanded,
  onToggle,
  onShotUpdate,
  onAddComment,
  currentUserId,
  currentUserName,
  storyboardsData,
  hasGeneratedSample,
  onGenerateSample,
  isGeneratingSample,
  selectedShotForGeneration,
  onSelectShotForGeneration
}: {
  scene: ShotListScene
  isExpanded: boolean
  onToggle: () => void
  onShotUpdate: (shotIndex: number, field: string, value: any) => void
  onAddComment: (shotIndex: number, comment: string, mentions?: string[]) => Promise<void>
  currentUserId: string
  currentUserName: string
  storyboardsData: any
  hasGeneratedSample: boolean
  onGenerateSample?: (shot: Shot) => void
  isGeneratingSample: string | null
  selectedShotForGeneration: Shot | null
  onSelectShotForGeneration: (shot: Shot) => void
}) {
  const completionPercent = (scene.completedShots / scene.totalShots) * 100
  const getStoryboardFrame = (shot: Shot) => {
    return storyboardsData?.scenes
      ?.find((s: any) => s.sceneNumber === scene.sceneNumber)
      ?.frames?.find((f: any) => (shot.storyboardFrameId ? f.id === shot.storyboardFrameId : f.shotNumber === shot.shotNumber))
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#36393f] rounded-lg overflow-hidden">
      {/* Scene Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-[#2a2a2a]/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold text-[#10B981]">
            Scene {scene.sceneNumber}
          </div>
          <div>
            <div className="text-left text-lg font-medium text-[#e7e7e7]">
              {scene.sceneTitle}
            </div>
            <div className="text-left text-sm text-[#e7e7e7]/50">
              {scene.location}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-[#e7e7e7]">
              {scene.completedShots} / {scene.totalShots} shots
            </div>
            <div className="text-xs text-[#10B981]">
              {completionPercent.toFixed(0)}% complete
            </div>
          </div>
          <div className="text-2xl text-[#e7e7e7]/50">
            {isExpanded ? '▼' : '▶'}
          </div>
        </div>
      </button>

      {/* Shots List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[#36393f]"
          >
            <div className="p-4 space-y-3">
              {scene.shots.map((shot, idx) => (
                <ShotItem
                  key={shot.id}
                  shot={shot}
                  onUpdate={(field, value) => onShotUpdate(idx, field, value)}
                  onAddComment={async (comment, mentions) => await onAddComment(idx, comment, mentions)}
                  currentUserId={currentUserId}
                  currentUserName={currentUserName}
                  storyboardFrame={getStoryboardFrame(shot)}
                  hasGeneratedSample={hasGeneratedSample}
                  onGenerateSample={onGenerateSample}
                  isGeneratingSample={isGeneratingSample === shot.id}
                  selectedShotForGeneration={selectedShotForGeneration}
                  onSelectShotForGeneration={onSelectShotForGeneration}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Shot Item Component
function ShotItem({
  shot,
  onUpdate,
  onAddComment,
  currentUserId,
  currentUserName,
  storyboardFrame,
  hasGeneratedSample,
  onGenerateSample,
  isGeneratingSample,
  selectedShotForGeneration,
  onSelectShotForGeneration
}: {
  shot: Shot
  onUpdate: (field: string, value: any) => void
  onAddComment: (comment: string, mentions?: string[]) => Promise<void>
  currentUserId: string
  currentUserName: string
  storyboardFrame?: any
  hasGeneratedSample: boolean
  onGenerateSample?: (shot: Shot) => void
  isGeneratingSample: boolean
  selectedShotForGeneration: Shot | null
  onSelectShotForGeneration: (shot: Shot) => void
}) {
  const [isImageOpen, setIsImageOpen] = useState(false)
  const priorityColors = {
    'must-have': '#10B981',
    'nice-to-have': '#60A5FA',
    'optional': '#9CA3AF'
  }

  const setupLabel = shot.setupGroup || `${shot.cameraAngle} • ${shot.cameraMovement}`

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`bg-[#2a2a2a] border-l-4 rounded-lg p-4 ${
        shot.status === 'got-it' ? 'opacity-60' : ''
      }`}
      style={{ borderLeftColor: priorityColors[shot.priority] }}
    >
      <div className="grid grid-cols-1 gap-4">
        {/* Overview row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-xl font-bold text-[#10B981]">{shot.shotNumber}</div>
              <div className="text-xs text-[#e7e7e7]/60">{shot.durationEstimate}s</div>
            </div>
            <div className="px-3 py-1 bg-[#1a1a1a] border border-[#36393f] rounded-md text-xs text-[#e7e7e7]">
              {setupLabel}
            </div>
            {shot.estimatedSetupTime !== undefined && (
              <div className="text-xs text-[#e7e7e7]/60">
                Setup ~{shot.estimatedSetupTime}m
              </div>
            )}
            {shot.canBeAIGenerated && (
              <div className="flex items-center gap-2">
                <div 
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    shot.manuallyShot
                      ? 'bg-[#6B7280]/20 border border-[#6B7280]/40 text-[#6B7280] opacity-50'
                      : shot.aiGenerationRecommendation === 'high' 
                        ? 'bg-[#10B981]/30 border border-[#10B981] text-[#10B981]' 
                        : shot.aiGenerationRecommendation === 'medium'
                          ? 'bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B]'
                          : 'bg-[#6B7280]/20 border border-[#6B7280]/40 text-[#6B7280]'
                  }`}
                  title={
                    shot.manuallyShot
                      ? 'This shot was shot manually - AI recommendation disabled'
                      : shot.aiGenerationRecommendation === 'high' 
                        ? 'Highly Recommended: Strongly recommend using AI for this shot (establishing shots, landscapes, B-roll)' 
                        : shot.aiGenerationRecommendation === 'medium'
                          ? 'Recommended: Can use AI generation for this shot (transitions, background plates)'
                          : 'Low Priority: Actors should probably shoot this, but AI can save time if needed'
                  }
                >
                  🤖 AI {shot.aiGenerationRecommendation === 'high' ? 'Highly' : shot.aiGenerationRecommendation === 'medium' ? 'Recommended' : 'Optional'}
                </div>
                <button
                  onClick={() => onUpdate('manuallyShot', !shot.manuallyShot)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    shot.manuallyShot
                      ? 'bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] hover:bg-[#10B981]/30'
                      : 'bg-[#6B7280]/20 border border-[#6B7280]/40 text-[#6B7280] hover:bg-[#6B7280]/30'
                  }`}
                  title={shot.manuallyShot ? 'Click to enable AI recommendation' : 'Mark this shot as already shot manually'}
                >
                  {shot.manuallyShot ? '✓ Shot Manually' : 'Mark as Shot'}
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-[#e7e7e7]/50">Priority</div>
            <select
              value={shot.priority}
              onChange={(e) => onUpdate('priority', e.target.value)}
              className="px-2 py-1 bg-[#1a1a1a] border border-[#36393f] rounded text-xs font-medium"
              style={{ color: priorityColors[shot.priority] }}
            >
              <option value="must-have">Must-Have</option>
              <option value="nice-to-have">Nice-to-Have</option>
              <option value="optional">Optional</option>
            </select>
            <StatusBadge 
              status={shot.status} 
              editable 
              onClick={() => {
                const statuses = ['planned', 'got-it', 'need-pickup', 'cut']
                const currentIndex = statuses.indexOf(shot.status)
                const nextStatus = statuses[(currentIndex + 1) % statuses.length]
                onUpdate('status', nextStatus)
              }}
            />
          </div>
        </div>

        {/* Description */}
        <EditableField
          value={shot.description}
          onSave={(value) => onUpdate('description', value)}
          type="textarea"
          rows={2}
          placeholder="Shot coverage description..."
        />

        {/* AI Generation Section */}
        {shot.canBeAIGenerated && (
          <div className={`rounded-lg p-4 space-y-3 transition-opacity ${
            shot.manuallyShot
              ? 'opacity-50 bg-[#6B7280]/5 border border-[#6B7280]/20'
              : shot.aiGenerationRecommendation === 'high' 
                ? 'bg-[#10B981]/10 border border-[#10B981]/30' 
                : shot.aiGenerationRecommendation === 'medium'
                  ? 'bg-[#F59E0B]/10 border border-[#F59E0B]/30'
                  : 'bg-[#6B7280]/10 border border-[#6B7280]/30'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <div>
                  <h4 className={`font-semibold text-sm ${
                    shot.aiGenerationRecommendation === 'high' 
                      ? 'text-[#10B981]' 
                      : shot.aiGenerationRecommendation === 'medium'
                        ? 'text-[#F59E0B]'
                        : 'text-[#6B7280]'
                  }`}>
                    AI-Generatable Shot
                  </h4>
                  <p className="text-xs text-[#e7e7e7]/60 mt-0.5">
                    {shot.aiGenerationRecommendation === 'high' && '⭐ Highly Recommended: Strongly recommend using AI (establishing shots, landscapes, B-roll)'}
                    {shot.aiGenerationRecommendation === 'medium' && '✓ Recommended: Can use AI generation (transitions, background plates)'}
                    {shot.aiGenerationRecommendation === 'low' && '~ Optional: Actors should probably shoot, but AI can save time'}
                    {!shot.aiGenerationRecommendation && 'Can be AI-generated'}
                  </p>
                </div>
              </div>
              {!shot.aiGeneratedVideoUrl && !shot.manuallyShot && (
                <button
                  onClick={() => onSelectShotForGeneration(shot)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                    selectedShotForGeneration?.id === shot.id
                      ? 'bg-[#10B981] text-black'
                      : 'bg-[#2a2a2a] text-[#e7e7e7] hover:bg-[#36393f] border border-[#36393f]'
                  }`}
                >
                  {selectedShotForGeneration?.id === shot.id ? '✓ Selected' : 'Select for Generation'}
                </button>
              )}
              {shot.manuallyShot && (
                <div className="px-3 py-1 bg-[#6B7280]/20 border border-[#6B7280]/40 rounded text-xs text-[#6B7280]">
                  Shot Manually
                </div>
              )}
              {shot.aiGeneratedVideoUrl && (
                <div className="px-3 py-1 bg-[#10B981]/20 border border-[#10B981]/40 rounded text-xs text-[#10B981]">
                  Sample Generated
                </div>
              )}
            </div>
            
            {shot.aiGenerationPrompt && (
              <div className="space-y-1">
                <label className="text-xs text-[#e7e7e7]/60 uppercase">AI Generation Prompt</label>
                <div className="text-xs text-[#e7e7e7]/70 bg-[#1a1a1a] border border-[#36393f] rounded p-2 max-h-32 overflow-y-auto">
                  {shot.aiGenerationPrompt}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Camera & crew */}
          <div className="space-y-2 bg-[#1a1a1a] border border-[#36393f] rounded-lg p-3">
            <div className="text-xs text-[#e7e7e7]/60 uppercase">Camera</div>
            <div className="flex items-center gap-2">
              <span className="text-[#e7e7e7]/50">📷</span>
              <select
                value={shot.cameraAngle}
                onChange={(e) => onUpdate('cameraAngle', e.target.value)}
                className="flex-1 px-2 py-1 bg-[#0f0f0f] border border-[#36393f] rounded text-[#e7e7e7] text-xs focus:outline-none focus:border-[#10B981]"
              >
                <option value="wide">Wide</option>
                <option value="medium">Medium</option>
                <option value="close-up">Close-up</option>
                <option value="extreme-close-up">Extreme Close-up</option>
                <option value="over-shoulder">Over Shoulder</option>
                <option value="pov">POV</option>
                <option value="dutch">Dutch Angle</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#e7e7e7]/50">🎥</span>
              <select
                value={shot.cameraMovement}
                onChange={(e) => onUpdate('cameraMovement', e.target.value)}
                className="flex-1 px-2 py-1 bg-[#0f0f0f] border border-[#36393f] rounded text-[#e7e7e7] text-xs focus:outline-none focus:border-[#10B981]"
              >
                <option value="static">Static</option>
                <option value="pan">Pan</option>
                <option value="tilt">Tilt</option>
                <option value="dolly">Dolly</option>
                <option value="tracking">Tracking</option>
                <option value="handheld">Handheld</option>
                <option value="steadicam">Steadicam</option>
                <option value="crane">Crane</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#e7e7e7]/50">🔍</span>
              <EditableField
                value={shot.lensRecommendation || ''}
                onSave={(value) => onUpdate('lensRecommendation', value)}
                type="text"
                placeholder="Lens..."
                className="flex-1 px-2 py-1 bg-[#0f0f0f] border border-[#36393f] rounded text-[#e7e7e7] text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#e7e7e7]/50">⚡</span>
              <EditableField
                value={shot.fpsCameraFrameRate ? shot.fpsCameraFrameRate.toString() : ''}
                onSave={(value) => onUpdate('fpsCameraFrameRate', parseInt(String(value)) || undefined)}
                type="text"
                placeholder="FPS (default 24)"
                className="flex-1 px-2 py-1 bg-[#0f0f0f] border border-[#36393f] rounded text-[#e7e7e7] text-xs"
              />
            </div>
            <div className="text-xs text-[#e7e7e7]/60 uppercase">Camera crew instructions</div>
            <div className="text-sm text-[#e7e7e7] bg-[#0f0f0f] border border-[#36393f] rounded p-2 min-h-[52px]">
              {shot.cameraCrewInstructions || 'AI-generated: camera crew instructions will appear after generation.'}
            </div>
          </div>

          {/* Actor / blocking / continuity */}
          <div className="space-y-2 bg-[#1a1a1a] border border-[#36393f] rounded-lg p-3">
            <div className="text-xs text-[#e7e7e7]/60 uppercase">Actors & Continuity</div>
            <div className="text-sm text-[#e7e7e7] bg-[#0f0f0f] border border-[#36393f] rounded p-2 min-h-[52px]">
              {shot.actorInstructions || 'AI-generated: actor performance/eyeline notes will appear after generation.'}
            </div>
            <div className="text-sm text-[#e7e7e7] bg-[#0f0f0f] border border-[#36393f] rounded p-2 min-h-[52px]">
              {shot.blockingDescription || 'AI-generated: blocking description will appear after generation.'}
            </div>
            <div className="text-sm text-[#e7e7e7] bg-[#0f0f0f] border border-[#36393f] rounded p-2 min-h-[52px]">
              {shot.continuityNotes || 'AI-generated: continuity (wardrobe/props/positions) will appear after generation.'}
            </div>
            <div className="text-sm text-[#e7e7e7] bg-[#0f0f0f] border border-[#36393f] rounded p-2 min-h-[52px]">
              {shot.lightingSetup || 'AI-generated: lighting setup/motivation will appear after generation.'}
            </div>
          </div>

          {/* Audio / storyboard / notes */}
          <div className="space-y-2 bg-[#1a1a1a] border border-[#36393f] rounded-lg p-3">
            <div className="text-xs text-[#e7e7e7]/60 uppercase">Audio & References</div>
            <div className="text-sm text-[#e7e7e7] bg-[#0f0f0f] border border-[#36393f] rounded p-2 min-h-[52px]">
              {shot.audioRequirements || 'AI-generated: audio needs (boom/lav, wild lines, ambience) will appear after generation.'}
            </div>
            <div className="text-sm text-[#e7e7e7] bg-[#0f0f0f] border border-[#36393f] rounded p-2 min-h-[52px]">
              {shot.notes || 'AI-generated production notes will appear after generation.'}
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs text-[#e7e7e7]/60">Estimated setup (min)</div>
              <EditableField
                value={shot.estimatedSetupTime?.toString() || ''}
                onSave={(value) => onUpdate('estimatedSetupTime', parseInt(String(value)) || 0)}
                type="text"
                placeholder="5"
                className="w-20 px-2 py-1 bg-[#0f0f0f] border border-[#36393f] rounded text-[#e7e7e7] text-xs"
              />
            </div>
            {storyboardFrame?.frameImage && (
              <>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsImageOpen(true)}
                    className="w-20 h-14 rounded border border-[#36393f] overflow-hidden block hover:ring-2 hover:ring-[#10B981]"
                  >
                    <img src={storyboardFrame.frameImage} className="w-full h-full object-cover" alt="Storyboard" />
                  </button>
                  <div className="flex-1 text-xs text-[#e7e7e7]/70">
                    Storyboard {storyboardFrame.id || storyboardFrame.shotNumber}
                  </div>
                </div>
                {isImageOpen && (
                  <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setIsImageOpen(false)}>
                    <div className="max-w-5xl max-h-[90vh] relative">
                      <button
                        onClick={() => setIsImageOpen(false)}
                        className="absolute -top-10 right-0 text-white bg-black/60 px-3 py-1 rounded"
                      >
                        Close
                      </button>
                      <img src={storyboardFrame.frameImage} className="w-full h-full object-contain rounded" alt="Storyboard Full" />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Comments */}
        <div className="flex items-start justify-between gap-2">
          <CollaborativeNotes
            comments={shot.comments || []}
            onAddComment={async (content, mentions) => await onAddComment(content, mentions)}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
          />
        </div>
      </div>
    </motion.div>
  )
}

