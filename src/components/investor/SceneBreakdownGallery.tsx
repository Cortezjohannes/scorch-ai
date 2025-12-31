'use client'

import React, { useState } from 'react'
import type { VisualsSection, StoryboardFrame } from '@/types/investor-materials'
import InvestorLightbox from './shared/InvestorLightbox'

interface SceneBreakdownGalleryProps {
  visuals: VisualsSection
}

export default function SceneBreakdownGallery({ visuals }: SceneBreakdownGalleryProps) {
  const [selectedFrame, setSelectedFrame] = useState<StoryboardFrame | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'story'>('story') // 'story' is narrative-first

  const episodes = visuals.episodes || {}
  const episodeNumbers = Object.keys(episodes)
    .map(Number)
    .sort((a, b) => a - b)
  
  // Initialize with Episode 1 expanded (or first episode if Episode 1 doesn't exist)
  const [expandedEpisode, setExpandedEpisode] = useState<number | null>(() => {
    // Prefer Episode 1, otherwise use the first available episode
    if (episodeNumbers.includes(1)) {
      return 1
    }
    return episodeNumbers.length > 0 ? episodeNumbers[0] : null
  })

  const hasStoryboards =
    episodeNumbers.length > 0 || (visuals.storyboardFrames && visuals.storyboardFrames.length > 0)

  if (!hasStoryboards) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4 opacity-50">🎨</div>
        <h3 className="text-xl font-bold text-white mb-2">No Storyboards Available</h3>
        <p className="text-white/70">
          Storyboard frames will appear here once they are generated in Pre-Production.
        </p>
      </div>
    )
  }

  const renderFrameCard = (frame: StoryboardFrame, episodeNumber: number, key: string) => {
    // CRITICAL: Validate imageUrl exists and is valid
    const imageUrl = frame.imageUrl && typeof frame.imageUrl === 'string' && frame.imageUrl.trim().length > 0 
      ? frame.imageUrl.trim() 
      : undefined
    
    // Log if image is missing
    if (!imageUrl && frame.frameId) {
      console.warn(`⚠️ [SceneBreakdownGallery] Missing imageUrl for frame ${frame.frameId}`, {
        frameId: frame.frameId,
        sceneNumber: frame.sceneNumber,
        shotNumber: frame.shotNumber,
        hasImageUrl: !!frame.imageUrl,
        imageUrlType: typeof frame.imageUrl,
        imageUrlValue: frame.imageUrl
      })
    }
    
    const handleSelect = () => setSelectedFrame(frame)
    // Show video if available, otherwise show image
    const hasVideo = frame.referenceVideos && frame.referenceVideos.length > 0
    const displayUrl = hasVideo ? frame.referenceVideos![0] : imageUrl

    return (
      <div
        key={key}
        className="group relative bg-[#121212] rounded-xl border border-[#10B981]/20 overflow-hidden hover:border-[#10B981]/40 transition-all"
      >
        {/* Image/Video Container - Natural aspect ratio */}
        <button
          type="button"
          onClick={handleSelect}
          className="w-full relative bg-[#0A0A0A] overflow-hidden block"
        >
          {displayUrl ? (
            <div className="relative w-full">
              {hasVideo ? (
                <video
                  src={displayUrl}
                  controls
                  className="w-full h-auto bg-[#0A0A0A]"
                  preload="metadata"
                  onError={(e) => {
                    console.error('Video load error:', e)
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={displayUrl}
                  alt={frame.description}
                  className="w-full h-auto bg-[#0A0A0A]"
                />
              )}
              
              {/* Overlay badges */}
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs text-white/90">
                Scene {frame.sceneNumber} • Shot {frame.shotNumber}
              </div>
              {episodeNumber && (
                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs text-white/70">
                  Ep {episodeNumber}
                </div>
              )}
              {hasVideo && frame.referenceVideos!.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  +{frame.referenceVideos!.length - 1} more
                </div>
              )}
            </div>
          ) : (
            <div className="w-full aspect-video flex flex-col items-center justify-center p-8 gap-3 bg-[#0A0A0A]">
              <span className="text-4xl text-white/20">🎬</span>
              <p className="text-xs text-white/60 text-center">
                Image not yet generated
                {frame.imagePrompt ? ' (queued from storyboard data)' : ''}
              </p>
              {frame.description && (
                <p className="text-xs text-white/50 text-center max-w-xs truncate mt-2">{frame.description}</p>
              )}
            </div>
          )}
        </button>

        {/* Context - Always Visible */}
        <div className="p-3 space-y-2.5">
          {/* Story Beat (optional) */}
          {(frame.notes || frame.description) && (
            <div>
              <div className="text-[9px] uppercase tracking-wide text-white/40 mb-0.5">Story Beat</div>
              <p className="text-[11px] text-white/80 leading-relaxed line-clamp-2">
                {frame.notes || frame.description}
              </p>
            </div>
          )}

          {/* Script Action - Orange */}
          {frame.scriptContext && (
            <div className="p-2 bg-[#1a1a1a] rounded border-l-2 border-[#F59E0B]/50">
              <div className="text-[9px] uppercase tracking-wide text-[#F59E0B]/80 mb-0.5">Script Action</div>
              <p className="text-[11px] text-[#F59E0B] font-medium leading-relaxed line-clamp-3">
                {frame.scriptContext.length > 100 
                  ? `${frame.scriptContext.substring(0, 100)}...` 
                  : frame.scriptContext}
              </p>
            </div>
          )}

          {/* Dialogue Snippet - Green */}
          {frame.dialogueSnippet && frame.dialogueSnippet.trim() && (
            <div className="p-2 bg-[#0a1a14] rounded border-l-2 border-[#10B981]/50">
              <p className="text-[11px] text-[#10B981] italic leading-relaxed line-clamp-2">
                "{frame.dialogueSnippet.length > 80 
                  ? `${frame.dialogueSnippet.substring(0, 80)}...` 
                  : frame.dialogueSnippet}"
              </p>
            </div>
          )}

          {/* Technical Info */}
          <div className="flex items-center gap-2.5 text-[9px] text-white/50 pt-1">
            <span className="flex items-center gap-1">
              <span>📷</span>
              {frame.cameraAngle}
            </span>
            <span className="flex items-center gap-1">
              <span>🎬</span>
              {frame.cameraMovement}
            </span>
            {hasVideo && (
              <span className="flex items-center gap-1">
                <span>🎥</span>
                Video
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Get all frames in chronological order
  const allFrames = episodeNumbers.flatMap(epNum => {
    const episode = episodes[epNum]
    if (!episode || !episode.scenes || episode.scenes.length === 0) return []
    
    return episode.scenes.flatMap(scene => 
      scene.frames.map(frame => ({
        ...frame,
        episodeNumber: epNum,
        episodeTitle: episode.episodeTitle,
        sceneTitle: scene.sceneTitle
      }))
    )
  })

  return (
    <div className="space-y-8">
      {/* Header with View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Visual Storyboards</h2>
          <p className="text-sm text-white/50">
            {visuals.totalFrames} frame{visuals.totalFrames !== 1 ? 's' : ''} across{' '}
            {episodeNumbers.length} episode{episodeNumbers.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-[#121212] rounded-lg p-1 border border-[#10B981]/20">
          <button
            onClick={() => setViewMode('story')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'story'
                ? 'bg-[#10B981] text-black'
                : 'text-white/70 hover:text-white'
            }`}
          >
            📖 Story View
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'grid'
                ? 'bg-[#10B981] text-black'
                : 'text-white/70 hover:text-white'
            }`}
          >
            🎨 Gallery View
          </button>
        </div>
      </div>

      {/* Story View - Accordion organized by Episode & Scene */}
      {viewMode === 'story' && (
        <div className="space-y-3">
          {episodeNumbers.map(epNum => {
            const episode = episodes[epNum]
            if (!episode || !episode.scenes || episode.scenes.length === 0) return null

            const isExpanded = expandedEpisode === epNum
            const totalShots = episode.scenes.reduce((sum: number, scene: any) => sum + scene.frames.length, 0)

            const toggleEpisode = () => {
              // Accordion behavior: if clicking the open one, close it; otherwise open this one and close others
              setExpandedEpisode(isExpanded ? null : epNum)
            }

            return (
              <div key={epNum} className="bg-[#121212] rounded-xl border border-[#10B981]/20 overflow-hidden">
                {/* Episode Header - Clickable */}
                <button
                  onClick={toggleEpisode}
                  className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Chevron Icon */}
                    <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                      <svg className="w-5 h-5 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-white">
                        Episode {epNum}: {episode.episodeTitle}
                      </h3>
                      <p className="text-sm text-white/60 mt-0.5">
                        {episode.scenes.length} scene{episode.scenes.length !== 1 ? 's' : ''} • {totalShots} shot{totalShots !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs uppercase tracking-wide px-3 py-1.5 rounded-full transition-colors ${
                    isExpanded 
                      ? 'bg-[#10B981] text-black' 
                      : 'bg-[#10B981]/10 text-white/60'
                  }`}>
                    {isExpanded ? 'Expanded' : 'Click to Expand'}
                  </span>
                </button>

                {/* Episode Content - Collapsible */}
                {isExpanded && (
                  <div className="px-5 pb-5 space-y-6 pt-2 border-t border-[#10B981]/20">
                    {/* Scenes */}
                    {episode.scenes.map(scene => {
                      return (
                        <div key={`ep${epNum}_scene${scene.sceneNumber}`} className="space-y-4">
                          {/* Scene Header */}
                          <div className="flex items-center gap-3 px-2">
                            <h4 className="text-lg font-bold text-white">Scene {scene.sceneNumber}</h4>
                            {scene.sceneTitle && scene.sceneTitle !== `Scene ${scene.sceneNumber}` && (
                              <span className="text-sm text-white/60">• {scene.sceneTitle}</span>
                            )}
                            <span className="text-xs text-[#10B981]/70 ml-auto">
                              {scene.frames.length} shot{scene.frames.length !== 1 ? 's' : ''}
                            </span>
                          </div>

                          {/* Frames Grid - 3 columns on large screens */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {scene.frames.map((frame: StoryboardFrame, idx: number) =>
                              renderFrameCard(
                                frame,
                                epNum,
                                frame.frameId || `ep${epNum}-scene${scene.sceneNumber}-shot${frame.shotNumber}-${idx}`
                              )
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Gallery View - All frames in one grid - 3 columns on large screens */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {allFrames.map((frame, idx) =>
            renderFrameCard(
              frame,
              frame.episodeNumber!,
              frame.frameId || `frame-${idx}`
            )
          )}
        </div>
      )}

      {/* Lightbox for Full View */}
      {selectedFrame && (
        <InvestorLightbox
          isOpen={!!selectedFrame}
          onClose={() => setSelectedFrame(null)}
          title={`Scene ${selectedFrame.sceneNumber} • Shot ${selectedFrame.shotNumber}${
            selectedFrame.episodeNumber ? ` • Episode ${selectedFrame.episodeNumber}` : ''
          }`}
          maxWidth="xl"
        >
          <div className="space-y-6">
            {/* Show video if available, otherwise show image */}
            {selectedFrame.referenceVideos && selectedFrame.referenceVideos.length > 0 ? (
              <div className="w-full">
                <video
                  src={selectedFrame.referenceVideos[0]}
                  controls
                  className="w-full rounded-lg bg-[#0A0A0A]"
                  preload="metadata"
                  onError={(e) => {
                    console.error('Video load error in lightbox:', e, selectedFrame.referenceVideos?.[0])
                  }}
                >
                  Your browser does not support the video tag.
                </video>
                {selectedFrame.referenceVideos.length > 1 && (
                  <div className="mt-2 text-xs text-white/50">
                    +{selectedFrame.referenceVideos.length - 1} more reference video{selectedFrame.referenceVideos.length - 1 !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            ) : selectedFrame.imageUrl && selectedFrame.imageUrl.trim().length > 0 ? (
              <img
                src={selectedFrame.imageUrl.trim()}
                alt={selectedFrame.description}
                className="w-full rounded-lg bg-[#0A0A0A]"
                onError={(e) => {
                  console.error('Image load error in lightbox:', {
                    imageUrl: selectedFrame.imageUrl,
                    frameId: selectedFrame.frameId,
                    error: e
                  })
                }}
                onLoad={() => {
                  console.log('✅ Image loaded successfully in lightbox:', selectedFrame.imageUrl?.substring(0, 100))
                }}
              />
            ) : (
              <div className="w-full aspect-video bg-[#0A0A0A] rounded-lg border border-dashed border-white/10 flex flex-col items-center justify-center gap-3 p-8 text-center">
                <span className="text-4xl text-white/20">🎬</span>
                <p className="text-white/60">Image not yet generated</p>
              </div>
            )}

            {/* Story Beat */}
            {(selectedFrame.notes || selectedFrame.description) && (
              <div>
                <h4 className="text-sm font-semibold text-white/50 mb-2">Story Beat</h4>
                <p className="text-white/90 leading-relaxed">{selectedFrame.notes || selectedFrame.description}</p>
              </div>
            )}

            {/* Script Action */}
            {selectedFrame.scriptContext && (
              <div className="p-4 bg-[#1a1a1a] rounded-lg border-l-4 border-[#F59E0B]/50">
                <h4 className="text-sm font-semibold text-[#F59E0B]/80 mb-2 uppercase tracking-wide">Script Action</h4>
                <p className="text-white/90 text-[#F59E0B] leading-relaxed">{selectedFrame.scriptContext}</p>
              </div>
            )}

            {/* Dialogue */}
            {selectedFrame.dialogueSnippet && (
              <div className="p-4 bg-[#0a1a14] rounded-lg border-l-4 border-[#10B981]/50">
                <h4 className="text-sm font-semibold text-[#10B981]/80 mb-2 uppercase tracking-wide">Dialogue</h4>
                <p className="text-white/90 text-[#10B981] italic leading-relaxed">"{selectedFrame.dialogueSnippet}"</p>
              </div>
            )}

            {/* Technical Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-white/50 mb-1">Camera Angle</h4>
                <p className="text-white/90">{selectedFrame.cameraAngle}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white/50 mb-1">Camera Movement</h4>
                <p className="text-white/90">{selectedFrame.cameraMovement}</p>
              </div>
            </div>

            {selectedFrame.lightingNotes && (
              <div>
                <h4 className="text-sm font-semibold text-white/50 mb-1">Lighting Notes</h4>
                <p className="text-white/90">{selectedFrame.lightingNotes}</p>
              </div>
            )}

            {selectedFrame.propsInFrame && selectedFrame.propsInFrame.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white/50 mb-2">Props in Frame</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedFrame.propsInFrame.map((prop, idx) => (
                    <span key={idx} className="px-2 py-1 bg-[#10B981]/20 text-[#10B981] rounded text-xs">
                      {prop}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedFrame.visualNotes && selectedFrame.visualNotes !== selectedFrame.notes && (
              <div>
                <h4 className="text-sm font-semibold text-white/50 mb-2">Visual Notes</h4>
                <p className="text-white/90">{selectedFrame.visualNotes}</p>
              </div>
            )}

            {selectedFrame.imagePrompt && !selectedFrame.imageUrl && (
              <div>
                <h4 className="text-sm font-semibold text-white/50 mb-2">Image Prompt</h4>
                <p className="text-white/80 text-sm whitespace-pre-line">{selectedFrame.imagePrompt}</p>
              </div>
            )}

            {selectedFrame.frameStatus && (
              <div>
                <h4 className="text-sm font-semibold text-white/50 mb-1">Status</h4>
                <p className="text-white/90 capitalize">{selectedFrame.frameStatus}</p>
              </div>
            )}
          </div>
        </InvestorLightbox>
      )}
    </div>
  )
}
