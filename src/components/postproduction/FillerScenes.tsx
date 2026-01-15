'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from '@/components/ui/ClientMotion'
import { useAuth } from '@/context/AuthContext'
import type { EpisodePreProductionData, Shot, ShotListScene } from '@/types/preproduction'
import { getEpisodePreProduction, updatePreProduction } from '@/services/preproduction-firestore'

interface FillerScenesProps {
  storyBibleId?: string
  episodeNumber?: number
  arcIndex?: number | null
  arcEpisodes?: number[]
}

interface SceneGroup {
  sceneNumber: number
  sceneTitle: string
  shots: Shot[]
}

export function FillerScenes({ storyBibleId, episodeNumber, arcIndex, arcEpisodes }: FillerScenesProps = {}) {
  const { user } = useAuth()
  const [preProductionData, setPreProductionData] = useState<EpisodePreProductionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [generatingShots, setGeneratingShots] = useState<Set<string>>(new Set())
  const [expandedScenes, setExpandedScenes] = useState<Set<number>>(new Set())
  const [expandedPrompts, setExpandedPrompts] = useState<Set<string>>(new Set())
  const [selectedEpisode, setSelectedEpisode] = useState<number>(episodeNumber || 1)

  // Load pre-production data for the selected episode
  useEffect(() => {
    const loadData = async () => {
      if (!storyBibleId || !selectedEpisode || !user?.id) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const data = await getEpisodePreProduction(user.id, storyBibleId, selectedEpisode)
        setPreProductionData(data)
        // Auto-expand all scenes by default
        if (data?.shotList?.scenes) {
          const sceneNumbers = new Set(data.shotList.scenes.map(s => s.sceneNumber))
          setExpandedScenes(sceneNumbers)
        }
      } catch (error) {
        console.error('Error loading pre-production data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [storyBibleId, selectedEpisode, user?.id])

  // Helper function to get storyboard frame image for a shot
  const getStoryboardImage = (shot: Shot): string | undefined => {
    if (!shot.storyboardFrameId || !preProductionData?.storyboards?.scenes) {
      return undefined
    }

    // Find the storyboard frame that matches this shot's storyboardFrameId
    for (const scene of preProductionData.storyboards.scenes) {
      const frame = scene.frames?.find(f => f.id === shot.storyboardFrameId)
      if (frame?.frameImage) {
        return frame.frameImage
      }
    }

    return undefined
  }

  // Group AI-generatable shots by scene
  const sceneGroups: SceneGroup[] = useMemo(() => {
    if (!preProductionData?.shotList?.scenes) return []

    const groups: SceneGroup[] = []
    preProductionData.shotList.scenes.forEach(scene => {
      const aiShots = scene.shots.filter(shot => shot.canBeAIGenerated)
      if (aiShots.length > 0) {
        groups.push({
          sceneNumber: scene.sceneNumber,
          sceneTitle: scene.sceneTitle,
          shots: aiShots.sort((a, b) => {
            const aNum = parseInt(a.shotNumber) || 0
            const bNum = parseInt(b.shotNumber) || 0
            return aNum - bNum
          })
        })
      }
    })

    return groups.sort((a, b) => a.sceneNumber - b.sceneNumber)
  }, [preProductionData])

  // Calculate stats
  const stats = useMemo(() => {
    const total = sceneGroups.reduce((sum, group) => sum + group.shots.length, 0)
    const generated = sceneGroups.reduce(
      (sum, group) => sum + group.shots.filter(s => s.aiGeneratedVideoUrl).length,
      0
    )
    const remaining = total - generated
    const progress = total > 0 ? (generated / total) * 100 : 0

    return { total, generated, remaining, progress }
  }, [sceneGroups])

  const handleGenerateVideo = async (shot: Shot) => {
    if (!preProductionData || !storyBibleId || !selectedEpisode || !user?.id) {
      alert('Missing required data')
      return
    }

    setGeneratingShots(prev => new Set(prev).add(shot.id))
    try {
      // Ensure EmptyRanges is defined (Safari/iOS compatibility)
      if (typeof window !== 'undefined' && typeof (window as any).EmptyRanges === 'undefined') {
        (window as any).EmptyRanges = Object.freeze([])
      }

      const response = await fetch('/api/generate/filler-scene-sample', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shotId: shot.id,
          preProductionId: preProductionData.id,
          storyBibleId: storyBibleId,
          episodeNumber: selectedEpisode,
          userId: user.id,
          shotDescription: shot.description,
          sceneContext: `Scene ${shot.sceneNumber}: ${shot.description}`,
          aiGenerationPrompt: shot.aiGenerationPrompt,
        })
      })

      // Handle response safely - check status first
      let result
      try {
        const text = await response.text()
        if (!text) {
          throw new Error('Empty response from server')
        }
        result = JSON.parse(text)
      } catch (parseError) {
        console.error('Failed to parse response:', parseError)
        throw new Error(`Invalid response from server: ${response.status} ${response.statusText}`)
      }

      if (!response.ok || !result.success) {
        if (result.contentPolicyBlocked) {
          throw new Error('Video generation blocked by content policy. Please try a different shot or modify the description.')
        }
        throw new Error(result.error || `Failed to generate video: ${response.status} ${response.statusText}`)
      }

      // Validate that we have a video URL
      if (!result.videoUrl) {
        console.error('Response missing videoUrl:', result)
        throw new Error('Video generation succeeded but no video URL was returned')
      }

      // Validate URL format (should be proxy URL or valid HTTP/HTTPS URL)
      if (typeof result.videoUrl !== 'string' || result.videoUrl.trim() === '') {
        console.error('Invalid videoUrl format:', result.videoUrl)
        throw new Error('Invalid video URL format returned from server')
      }

      console.log('✅ Video generation successful:', {
        shotId: shot.id,
        videoUrl: result.videoUrl.substring(0, 100) + '...',
        isProxyUrl: result.videoUrl.includes('/api/veo3-video-proxy')
      })

      // Save video URL to Firestore
      if (!result.videoUrl) {
        throw new Error('No video URL in response')
      }

      if (!preProductionData || !user.id) {
        throw new Error('Missing pre-production data or user ID')
      }

      const shotList = preProductionData.shotList
      if (!shotList?.scenes) {
        throw new Error('Shot list data not found in pre-production data')
      }

      const updatedScenes = shotList.scenes.map(scene => ({
        ...scene,
        shots: scene.shots.map(s => {
          if (s.id === shot.id) {
            return {
              ...s,
              aiGeneratedVideoUrl: result.videoUrl,
              aiGenerationSampleGenerated: true,
              aiGenerationPrompt: s.aiGenerationPrompt || shot.aiGenerationPrompt
            }
          }
          return s
        })
      }))

      await updatePreProduction(
        preProductionData.id,
        {
          shotList: {
            ...shotList,
            scenes: updatedScenes,
            lastUpdated: Date.now(),
            updatedBy: user.id
          }
        },
        user.id,
        storyBibleId
      )

      // Update local state - ensure we're updating the correct structure
      const updatedPreProductionData = {
        ...preProductionData,
        shotList: {
          ...shotList,
          scenes: updatedScenes,
          lastUpdated: Date.now(),
          updatedBy: user.id
        }
      }
      
      setPreProductionData(updatedPreProductionData)

      console.log('✅ Video URL saved to Firestore and local state updated:', {
        shotId: shot.id,
        videoUrl: result.videoUrl.substring(0, 50) + '...',
        updatedScenesCount: updatedScenes.length
      })
    } catch (error: any) {
      console.error('Error generating video:', error)
      // Handle EmptyRanges error specifically
      if (error.message?.includes('EmptyRanges') || (error.name === 'ReferenceError' && error.message?.includes('EmptyRanges'))) {
        console.warn('EmptyRanges error detected, fixing and showing user-friendly message...')
        if (typeof window !== 'undefined') {
          (window as any).EmptyRanges = Object.freeze([])
        }
        alert('A browser compatibility issue was detected and fixed. Please try generating the video again.')
        return
      }
      alert(error.message || 'Failed to generate video')
    } finally {
      setGeneratingShots(prev => {
        const next = new Set(prev)
        next.delete(shot.id)
        return next
      })
    }
  }

  const handleToggleManuallyShot = async (shot: Shot) => {
    if (!preProductionData || !storyBibleId || !user?.id) {
      return
    }

    const newManuallyShot = !shot.manuallyShot
    const shotList = preProductionData.shotList
    if (shotList?.scenes) {
      const updatedScenes = shotList.scenes.map(scene => ({
        ...scene,
        shots: scene.shots.map(s => {
          if (s.id === shot.id) {
            return {
              ...s,
              manuallyShot: newManuallyShot
            }
          }
          return s
        })
      }))

      try {
        await updatePreProduction(
          preProductionData.id,
          {
            shotList: {
              ...shotList,
              scenes: updatedScenes,
              lastUpdated: Date.now(),
              updatedBy: user.id
            }
          },
          user.id,
          storyBibleId
        )

        // Update local state
        setPreProductionData({
          ...preProductionData,
          shotList: {
            ...shotList,
            scenes: updatedScenes
          }
        })
      } catch (error) {
        console.error('Error updating manually shot status:', error)
        alert('Failed to update shot status')
      }
    }
  }

  const toggleScene = (sceneNumber: number) => {
    setExpandedScenes(prev => {
      const next = new Set(prev)
      if (next.has(sceneNumber)) {
        next.delete(sceneNumber)
      } else {
        next.add(sceneNumber)
      }
      return next
    })
  }

  const togglePrompt = (shotId: string) => {
    setExpandedPrompts(prev => {
      const next = new Set(prev)
      if (next.has(shotId)) {
        next.delete(shotId)
      } else {
        next.add(shotId)
      }
      return next
    })
  }

  const copyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt)
      alert('Prompt copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy prompt:', error)
      alert('Failed to copy prompt to clipboard')
    }
  }

  const getRecommendationBadge = (recommendation?: 'high' | 'medium' | 'low', isManuallyShot?: boolean) => {
    if (isManuallyShot) {
      return (
        <div className="px-3 py-1 bg-[#36393f]/50 border border-[#36393f] rounded-full text-xs font-semibold text-[#6B7280] inline-flex items-center gap-1 opacity-50">
          <span>🎬</span>
          <span>Shot Manually</span>
        </div>
      )
    }

    switch (recommendation) {
      case 'high':
        return (
          <div className="px-3 py-1 bg-gradient-to-r from-[#10B981]/30 to-[#059669]/30 border border-[#10B981] rounded-full text-xs font-semibold text-[#10B981] inline-flex items-center gap-1">
            <span>🤖</span>
            <span>AI Highly Recommended</span>
          </div>
        )
      case 'medium':
        return (
          <div className="px-3 py-1 bg-[#F59E0B]/20 border border-[#F59E0B]/40 rounded-full text-xs font-semibold text-[#F59E0B] inline-flex items-center gap-1">
            <span>🤖</span>
            <span>AI Recommended</span>
          </div>
        )
      case 'low':
        return (
          <div className="px-3 py-1 bg-[#6B7280]/20 border border-[#6B7280]/40 rounded-full text-xs font-semibold text-[#6B7280] inline-flex items-center gap-1">
            <span>🤖</span>
            <span>AI Optional</span>
          </div>
        )
      default:
        return (
          <div className="px-3 py-1 bg-[#6B7280]/20 border border-[#6B7280]/40 rounded-full text-xs font-semibold text-[#6B7280] inline-flex items-center gap-1">
            <span>🤖</span>
            <span>AI-Generatable</span>
          </div>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#e7e7e7]/70">Loading filler generator...</p>
        </div>
      </div>
    )
  }

  if (!preProductionData) {
    return (
      <div className="text-center py-12">
        <p className="text-[#e7e7e7]/70">No pre-production data found for this episode.</p>
      </div>
    )
  }

  if (sceneGroups.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎬</div>
        <h3 className="text-xl font-bold text-[#e7e7e7] mb-2">No AI-Generatable Shots Found</h3>
        <p className="text-[#e7e7e7]/70">
          No shots in this episode are marked as AI-generatable. Check the pre-production shot list to identify shots that can be AI-generated.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#10B981]/10 via-[#059669]/10 to-[#10B981]/10 border border-[#10B981]/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-[#e7e7e7] mb-2">Filler Generator</h2>
            <p className="text-sm text-[#e7e7e7]/70">
              Generate AI-recommended filler scene videos to save time and budget
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-4"
          >
            <div className="text-sm text-[#e7e7e7]/70 mb-1">Total Shots</div>
            <div className="text-2xl font-bold text-[#e7e7e7]">{stats.total}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-4"
          >
            <div className="text-sm text-[#e7e7e7]/70 mb-1">Generated</div>
            <div className="text-2xl font-bold text-[#10B981] flex items-center gap-2">
              <span>✓</span>
              <span>{stats.generated}</span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-4"
          >
            <div className="text-sm text-[#e7e7e7]/70 mb-1">Remaining</div>
            <div className="text-2xl font-bold text-[#e7e7e7]">{stats.remaining}</div>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#e7e7e7]/70">
            <span>Generation Progress</span>
            <span>{Math.round(stats.progress)}%</span>
          </div>
          <div className="w-full bg-[#1a1a1a] border border-[#36393f] rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-[#10B981] text-xl">💡</span>
          <div className="flex-1">
            <h3 className="text-[#10B981] font-semibold mb-2">AI Video Generation</h3>
            <p className="text-sm text-[#e7e7e7]/80 mb-3">
              Generate AI-recommended filler scene videos to save time and budget. Each shot can be generated individually.
            </p>
            <div className="text-xs text-[#e7e7e7]/60 space-y-1">
              <p className="font-semibold mb-1">Recommendation Levels:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li><span className="text-[#10B981] font-medium">🤖 AI Highly Recommended:</span> Strongly recommend AI (establishing shots, landscapes, B-roll)</li>
                <li><span className="text-[#F59E0B] font-medium">🤖 AI Recommended:</span> Can use AI (transitions, background plates)</li>
                <li><span className="text-[#6B7280] font-medium">🤖 AI Optional:</span> Actors should probably shoot, but AI can save time</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Scene Sections */}
      <div className="space-y-4">
        {sceneGroups.map((group) => {
          const isExpanded = expandedScenes.has(group.sceneNumber)
          const sceneGenerated = group.shots.filter(s => s.aiGeneratedVideoUrl).length
          const sceneTotal = group.shots.length

          return (
            <motion.div
              key={group.sceneNumber}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1a1a1a] border border-[#36393f] rounded-lg overflow-hidden"
            >
              {/* Scene Header */}
              <button
                onClick={() => toggleScene(group.sceneNumber)}
                className="w-full p-4 flex items-center justify-between hover:bg-[#2a2a2a] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg className="w-5 h-5 text-[#e7e7e7]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-[#e7e7e7]">
                      Scene {group.sceneNumber}: {group.sceneTitle}
                    </h3>
                    <p className="text-xs text-[#e7e7e7]/50">
                      {sceneGenerated}/{sceneTotal} shots generated
                    </p>
                  </div>
                </div>
                <div className="text-sm text-[#e7e7e7]/50">
                  {group.shots.length} shot{group.shots.length !== 1 ? 's' : ''}
                </div>
              </button>

              {/* Scene Shots */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 space-y-4 border-t border-[#36393f]">
                      {group.shots.map((shot, index) => {
                        const isGenerating = generatingShots.has(shot.id)
                        const hasVideo = !!shot.aiGeneratedVideoUrl
                        const isPromptExpanded = expandedPrompts.has(shot.id)
                        const isManuallyShot = shot.manuallyShot || false
                        const storyboardImage = getStoryboardImage(shot)

                        return (
                          <motion.div
                            key={shot.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`bg-[#0a0a0a] border rounded-lg p-5 ${
                              isManuallyShot ? 'border-[#36393f] opacity-60' : 'border-[#36393f]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4 mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3 flex-wrap">
                                  {getRecommendationBadge(shot.aiGenerationRecommendation, isManuallyShot)}
                                  <span className="text-xs text-[#e7e7e7]/50">
                                    Shot {shot.shotNumber}
                                  </span>
                                </div>
                                
                                {/* Storyboard Image and Description */}
                                <div className="flex gap-4 mb-3">
                                  {storyboardImage && (
                                    <div className="flex-shrink-0">
                                      <div className="w-32 h-20 rounded-lg overflow-hidden border border-[#36393f] bg-[#1a1a1a]">
                                        <img
                                          src={storyboardImage}
                                          alt={`Storyboard for Shot ${shot.shotNumber}`}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            // Hide image if it fails to load
                                            e.currentTarget.style.display = 'none'
                                          }}
                                        />
                                      </div>
                                      <p className="text-xs text-[#e7e7e7]/50 mt-1 text-center">Storyboard</p>
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <p className={`text-sm ${isManuallyShot ? 'text-[#e7e7e7]/50' : 'text-[#e7e7e7]'}`}>
                                      {shot.description}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className={`flex items-center gap-4 text-xs flex-wrap ${
                                  isManuallyShot ? 'text-[#e7e7e7]/30' : 'text-[#e7e7e7]/50'
                                }`}>
                                  <span>📷 {shot.cameraAngle}</span>
                                  <span>🎬 {shot.cameraMovement}</span>
                                  {shot.durationEstimate && (
                                    <span>⏱️ {shot.durationEstimate}s</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  onClick={() => handleToggleManuallyShot(shot)}
                                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                    isManuallyShot
                                      ? 'bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] hover:bg-[#10B981]/30'
                                      : 'bg-[#36393f] border border-[#36393f] text-[#e7e7e7]/70 hover:bg-[#36393f]/80 hover:text-[#e7e7e7]'
                                  }`}
                                  title={isManuallyShot ? 'Mark as not shot manually' : 'Mark as shot manually'}
                                >
                                  {isManuallyShot ? '✓ Shot Manually' : '🎬 Mark as Shot'}
                                </button>
                                {!hasVideo && !isManuallyShot && (
                                  <button
                                    onClick={() => handleGenerateVideo(shot)}
                                    disabled={isGenerating}
                                    className="px-4 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-black font-medium rounded-lg hover:from-[#059669] hover:to-[#10B981] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                  >
                                    {isGenerating ? (
                                      <>
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin inline-block mr-2" />
                                        Generating...
                                      </>
                                    ) : (
                                      '✨ Generate'
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Video Player */}
                            {hasVideo && shot.aiGeneratedVideoUrl && (
                              <div className="mb-4">
                                <label className="text-xs text-[#e7e7e7]/60 uppercase mb-2 block">Generated Video</label>
                                <div className="relative w-full" style={{ aspectRatio: '9/16', maxWidth: '300px' }}>
                                  <video
                                    key={shot.aiGeneratedVideoUrl} // Force re-render on URL change
                                    src={shot.aiGeneratedVideoUrl}
                                    controls
                                    preload="metadata"
                                    className="w-full h-full rounded-lg border border-[#36393f]"
                                    style={{ aspectRatio: '9/16' }}
                                    onError={(e) => {
                                      console.error('Video load error:', {
                                        url: shot.aiGeneratedVideoUrl,
                                        error: e
                                      })
                                      // Show error message to user
                                      const videoElement = e.currentTarget
                                      const errorMsg = document.createElement('div')
                                      errorMsg.className = 'absolute inset-0 flex items-center justify-center bg-red-900/50 rounded-lg text-red-200 text-xs p-2 text-center'
                                      errorMsg.textContent = 'Failed to load video. Please try regenerating.'
                                      videoElement.parentElement?.appendChild(errorMsg)
                                    }}
                                    onLoadedData={() => {
                                      console.log('Video loaded successfully:', shot.aiGeneratedVideoUrl)
                                    }}
                                  >
                                    Your browser does not support the video tag.
                                  </video>
                                </div>
                              </div>
                            )}

                            {/* Expandable Prompt */}
                            {shot.aiGenerationPrompt && (
                              <div className="border-t border-[#36393f] pt-4">
                                <button
                                  onClick={() => togglePrompt(shot.id)}
                                  className="flex items-center justify-between w-full text-left mb-2 hover:text-[#10B981] transition-colors"
                                >
                                  <span className="text-xs font-semibold text-[#e7e7e7]/70 uppercase">
                                    AI Generation Prompt
                                  </span>
                                  <motion.svg
                                    animate={{ rotate: isPromptExpanded ? 180 : 0 }}
                                    className="w-4 h-4 text-[#e7e7e7]/50"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </motion.svg>
                                </button>
                                <AnimatePresence>
                                  {isPromptExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="bg-[#2a2a2a] border border-[#36393f] rounded-lg p-3 relative">
                                        <button
                                          onClick={() => copyPrompt(shot.aiGenerationPrompt!)}
                                          className="absolute top-2 right-2 px-2 py-1 text-xs bg-[#10B981]/20 text-[#10B981] rounded hover:bg-[#10B981]/30 transition-colors"
                                        >
                                          Copy
                                        </button>
                                        <p className="text-xs text-[#e7e7e7]/70 whitespace-pre-wrap break-words pr-16 max-h-96 overflow-y-auto">
                                          {shot.aiGenerationPrompt}
                                        </p>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
