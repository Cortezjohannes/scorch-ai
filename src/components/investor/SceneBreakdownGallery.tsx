'use client'

import React, { useState } from 'react'
import type { VisualsSection, StoryboardFrame } from '@/types/investor-materials'
import InvestorLightbox from './shared/InvestorLightbox'

interface SceneBreakdownGalleryProps {
  visuals: VisualsSection
}

export default function SceneBreakdownGallery({ visuals }: SceneBreakdownGalleryProps) {
  const [expandedScenes, setExpandedScenes] = useState<Set<string>>(new Set())
  const [selectedFrame, setSelectedFrame] = useState<StoryboardFrame | null>(null)

  const episodes = visuals.episodes || {}
  const episodeNumbers = Object.keys(episodes)
    .map(Number)
    .sort((a, b) => a - b)

  const toggleScene = (episodeNumber: number, sceneNumber: number) => {
    const key = `ep${episodeNumber}_scene${sceneNumber}`
    setExpandedScenes(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

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
      <button
        key={key}
        type="button"
        onClick={handleSelect}
        className="group relative aspect-video bg-[#0A0A0A] rounded-lg overflow-hidden border border-[#10B981]/20 hover:border-[#10B981]/40 transition-all text-left"
      >
        {displayUrl ? (
          <>
            {hasVideo ? (
              <video
                src={displayUrl}
                controls
                className="w-full h-full object-cover"
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
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-[#10B981]">Shot {frame.shotNumber}</span>
                <span className="text-xs text-white/70">{frame.cameraAngle}</span>
                {hasVideo && (
                  <span className="text-xs text-white/70">🎥</span>
                )}
              </div>
              {frame.dialogueSnippet && (
                <p className="text-xs text-white/80 italic truncate">{frame.dialogueSnippet}</p>
              )}
              {frame.description && frame.description !== frame.dialogueSnippet && (
                <p className="text-xs text-white/70 truncate mt-1">{frame.description}</p>
              )}
            </div>
            {hasVideo && frame.referenceVideos!.length > 1 && (
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                +{frame.referenceVideos!.length - 1} more
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-3">
            <span className="text-4xl text-white/20">🎬</span>
            <p className="text-xs text-white/60 text-center">
              Image not yet generated
              {frame.imagePrompt ? ' (queued from storyboard data)' : ''}
            </p>
            {frame.description && (
              <p className="text-xs text-white/50 text-center max-w-xs truncate">{frame.description}</p>
            )}
          </div>
        )}

        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs text-white/90">
          Scene {frame.sceneNumber} • Shot {frame.shotNumber}
        </div>
        {episodeNumber && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs text-white/70">
            Ep {episodeNumber}
        </div>
      )}
      </button>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Storyboard Breakdown</h2>
        <span className="text-sm text-white/50">
          {visuals.totalFrames} frame{visuals.totalFrames !== 1 ? 's' : ''} across{' '}
          {episodeNumbers.length} episode{episodeNumbers.length !== 1 ? 's' : ''}
        </span>
      </div>

      {episodeNumbers.map(epNum => {
        const episode = episodes[epNum]
        if (!episode || !episode.scenes || episode.scenes.length === 0) return null

        return (
          <div key={epNum} className="space-y-4">
            <div className="bg-gradient-to-r from-[#10B981]/20 to-transparent border-l-4 border-[#10B981] p-4 rounded-r-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">
                  Episode {epNum}: {episode.episodeTitle}
                </h3>
                <span className="text-xs uppercase tracking-wide text-white/60">
                  {episode.scenes.reduce((sum: number, scene: any) => sum + scene.frames.length, 0)} shots
                            </span>
              </div>
            </div>

            {episode.scenes.map(scene => {
              const sceneKey = `ep${epNum}_scene${scene.sceneNumber}`
              const isExpanded = expandedScenes.has(sceneKey)

              return (
                <div
                  key={sceneKey}
                  className="bg-[#121212] rounded-xl border border-[#10B981]/20 overflow-hidden"
                >
                  <button
                    onClick={() => toggleScene(epNum, scene.sceneNumber)}
                    className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <h4 className="text-xl font-bold text-white">Scene {scene.sceneNumber}</h4>
                      {scene.sceneTitle && scene.sceneTitle !== `Scene ${scene.sceneNumber}` && (
                        <span className="text-sm text-white/70">• {scene.sceneTitle}</span>
                      )}
                    </div>
                    <span className="text-[#10B981] text-sm font-medium">
                      {isExpanded ? '−' : '+'} {scene.frames.length} shot
                      {scene.frames.length !== 1 ? 's' : ''}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="p-6 pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {scene.frames.map((frame: StoryboardFrame, idx: number) =>
                          renderFrameCard(
                            frame,
                            epNum,
                            frame.frameId || `ep${epNum}-scene${scene.sceneNumber}-shot${frame.shotNumber}-${idx}`
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}

      {selectedFrame && (
          <InvestorLightbox
            isOpen={!!selectedFrame}
            onClose={() => setSelectedFrame(null)}
          title={`Scene ${selectedFrame.sceneNumber} • Shot ${selectedFrame.shotNumber}${
            selectedFrame.episodeNumber ? ` • Episode ${selectedFrame.episodeNumber}` : ''
          }`}
            maxWidth="xl"
          >
            <div className="space-y-4">
            {/* Show video if available, otherwise show image */}
            {selectedFrame.referenceVideos && selectedFrame.referenceVideos.length > 0 ? (
              <div className="w-full">
                <video
                  src={selectedFrame.referenceVideos[0]}
                  controls
                  className="w-full rounded-lg"
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
                className="w-full rounded-lg"
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

            {/* Description - prioritize notes (script-accurate) */}
            {(selectedFrame.notes || selectedFrame.description) && (
            <div>
                <h4 className="text-sm font-semibold text-white/50 mb-2">
                  {selectedFrame.notes ? 'Frame Description (Script-Accurate)' : 'Description'}
                </h4>
                <p className="text-white/90">{selectedFrame.notes || selectedFrame.description}</p>
            </div>
            )}

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

            {selectedFrame.dialogueSnippet && (
              <div>
                <h4 className="text-sm font-semibold text-white/50 mb-2">Dialogue</h4>
                <p className="text-white/90 italic bg-white/5 p-3 rounded">{selectedFrame.dialogueSnippet}</p>
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
