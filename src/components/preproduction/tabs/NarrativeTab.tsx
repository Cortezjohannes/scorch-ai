'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface NarrativeTabProps {
  episodeData: any
  storyBible: any
  episodeNumber: number
  episodeTitle: string
}

export function NarrativeTab({
  episodeData,
  storyBible,
  episodeNumber,
  episodeTitle
}: NarrativeTabProps) {
  // Helper to get arc info for episode (similar to workspace)
  const getArcInfoForEpisodeHelper = (epNum: number) => {
    if (!storyBible || !storyBible.narrativeArcs) {
      return { arcIndex: 0, arcTitle: 'Arc 1', episodeInArc: epNum, totalInArc: 10 }
    }
    
    let runningCount = 0
    for (let i = 0; i < storyBible.narrativeArcs.length; i++) {
      const arc = storyBible.narrativeArcs[i]
      const arcEpisodeCount = arc.episodes?.length || 10
      
      if (epNum <= runningCount + arcEpisodeCount) {
        return {
          arcIndex: i,
          arcTitle: arc.title || `Arc ${i + 1}`,
          episodeInArc: epNum - runningCount,
          totalInArc: arcEpisodeCount
        }
      }
      runningCount += arcEpisodeCount
    }
    
    return { arcIndex: 0, arcTitle: 'Arc 1', episodeInArc: epNum, totalInArc: 10 }
  }

  const arcInfo = getArcInfoForEpisodeHelper(episodeNumber)
  const arc = storyBible?.narrativeArcs?.[arcInfo.arcIndex]
  const episodeInfo = arc?.episodes?.[arcInfo.episodeInArc - 1]
  
  const synopsis = episodeInfo?.summary || episodeData?.synopsis || 'No synopsis available.'
  const scenes = episodeData?.scenes || []
  const sceneCount = scenes.length
  
  // Extract characters from episode data
  const characters = React.useMemo(() => {
    if (episodeInfo?.characters && Array.isArray(episodeInfo.characters)) {
      return episodeInfo.characters
    }
    
    // Try to extract from scenes
    const characterSet = new Set<string>()
    scenes.forEach((scene: any) => {
      if (scene.characters) {
        scene.characters.forEach((char: any) => {
          if (typeof char === 'string') {
            characterSet.add(char)
          } else if (char.name) {
            characterSet.add(char.name)
          }
        })
      }
    })
    
    return Array.from(characterSet)
  }, [episodeInfo, scenes])

  // Calculate runtime estimate (3-5 minutes per episode typically)
  const runtimeEstimate = sceneCount > 0 ? Math.max(3, Math.min(5, Math.round(sceneCount * 0.7))) : 3

  return (
    <div className="space-y-6">
      {/* Vertical Timeline Layout */}
      <div className="flex gap-8">
        {/* Left: Timeline */}
        <div className="flex-shrink-0 w-64">
          <div className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6 sticky top-8">
            <h3 className="text-lg font-bold text-[#e7e7e7] mb-6">Arc Timeline</h3>
            
            {/* Vertical Timeline */}
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#36393f]" />
              
              {/* Timeline Episodes */}
              <div className="space-y-4">
                {Array.from({ length: arcInfo.totalInArc }).map((_, idx) => {
                  const epNum = idx + 1
                  const isCurrent = epNum === arcInfo.episodeInArc
                  const isPast = epNum < arcInfo.episodeInArc
                  
                  return (
                    <div key={idx} className="relative flex items-center gap-4">
                      {/* Timeline Dot */}
                      <div
                        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-sm z-10 ${
                          isCurrent
                            ? 'bg-[#10B981] border-[#10B981] text-black'
                            : isPast
                            ? 'bg-[#10B981]/50 border-[#10B981]/50 text-[#10B981]'
                            : 'bg-[#1a1a1a] border-[#36393f] text-[#e7e7e7]/30'
                        }`}
                      >
                        {isPast ? '✓' : epNum}
                      </div>
                      
                      {/* Episode Info */}
                      {isCurrent && (
                        <div className="flex-1">
                          <div className="text-sm font-bold text-[#10B981]">Episode {epNum}</div>
                          <div className="text-xs text-[#e7e7e7]/50 truncate">{episodeTitle}</div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Arc Info */}
            <div className="mt-6 pt-6 border-t border-[#36393f]">
              <div className="text-xs text-[#e7e7e7]/50 mb-1">Arc {arcInfo.arcIndex + 1}</div>
              <div className="text-sm font-bold text-[#e7e7e7]">{arcInfo.arcTitle}</div>
              <div className="text-xs text-[#e7e7e7]/50 mt-1">
                Episode {arcInfo.episodeInArc} of {arcInfo.totalInArc}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Content */}
        <div className="flex-1 space-y-6">
      {/* Episode Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#1a1a1a] to-[#252628] border border-[#36393f] rounded-xl p-8"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-3 py-1 rounded-full bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40">
                Episode {episodeNumber}
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-[#2a2a2a] text-[#e7e7e7]/70 border border-[#36393f]">
                {arcInfo.arcTitle} • Episode {arcInfo.episodeInArc} of {arcInfo.totalInArc}
              </span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {episodeTitle}
            </h2>
          </div>
        </div>
        
        <p className="text-[#e7e7e7]/80 text-base leading-relaxed mb-6">
          {synopsis}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-[#1a1a1a]/50 rounded-lg p-4 border border-[#36393f]">
            <div className="text-xs text-[#e7e7e7]/50 mb-1">Scenes</div>
            <div className="text-2xl font-bold text-[#10B981]">{sceneCount}</div>
          </div>
          <div className="bg-[#1a1a1a]/50 rounded-lg p-4 border border-[#36393f]">
            <div className="text-xs text-[#e7e7e7]/50 mb-1">Characters</div>
            <div className="text-2xl font-bold text-[#10B981]">{characters.length}</div>
          </div>
          <div className="bg-[#1a1a1a]/50 rounded-lg p-4 border border-[#36393f]">
            <div className="text-xs text-[#e7e7e7]/50 mb-1">Runtime</div>
            <div className="text-2xl font-bold text-[#10B981]">~{runtimeEstimate} min</div>
          </div>
        </div>
      </motion.div>

      {/* Characters Section */}
      {characters.length > 0 && (
        <div className="bg-[#2a2a2a] rounded-lg border border-[#36393f] p-6">
          <h3 className="text-lg font-bold text-[#e7e7e7] mb-4">Characters in This Episode</h3>
          <div className="flex flex-wrap gap-2">
            {characters.map((character: string, idx: number) => {
              const initials = character
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
              
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] rounded-lg border border-[#36393f]"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 border-2 border-[#10B981]/40 flex items-center justify-center text-sm font-bold text-[#10B981]">
                    {initials}
                  </div>
                  <span className="text-[#e7e7e7] font-medium">{character}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Scenes Summary */}
      {scenes.length > 0 && (
        <div className="bg-[#2a2a2a] rounded-lg border border-[#36393f] p-6">
          <h3 className="text-lg font-bold text-[#e7e7e7] mb-4">Scenes Summary</h3>
          <div className="space-y-3">
            {scenes.map((scene: any, idx: number) => (
              <div
                key={idx}
                className="bg-[#1a1a1a] rounded-lg p-4 border border-[#36393f]"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#10B981]/20 flex items-center justify-center text-[#10B981] font-bold text-sm">
                      {scene.sceneNumber || idx + 1}
                    </div>
                    <div>
                      <div className="font-medium text-[#e7e7e7]">
                        {scene.title || scene.heading || `Scene ${scene.sceneNumber || idx + 1}`}
                      </div>
                      <div className="text-xs text-[#e7e7e7]/50 mt-1">
                        {scene.location || scene.setting || 'Location TBD'}
                        {scene.timeOfDay && ` • ${scene.timeOfDay}`}
                      </div>
                    </div>
                  </div>
                </div>
                
                {scene.summary && (
                  <p className="text-sm text-[#e7e7e7]/70 mt-2">
                    {scene.summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Arc Context */}
      {arc && (
        <div className="bg-[#1a1a1a]/50 rounded-lg border border-[#36393f] p-6">
          <h3 className="text-lg font-bold text-[#e7e7e7] mb-2">Arc Context</h3>
          <p className="text-sm text-[#e7e7e7]/70 mb-3">
            <span className="font-medium text-[#10B981]">{arcInfo.arcTitle}</span>
            {' • '}
            <span>Episode {arcInfo.episodeInArc} of {arcInfo.totalInArc} in this arc</span>
          </p>
          {arc.summary && (
            <p className="text-sm text-[#e7e7e7]/60 italic">
              {arc.summary}
            </p>
          )}
        </div>
      )}

      {/* Episode Metadata */}
      {episodeData && (
        <div className="bg-[#2a2a2a] rounded-lg border border-[#36393f] p-4">
          <div className="flex items-center gap-2 text-xs text-[#e7e7e7]/50">
            {episodeData.generatedAt && (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  Generated {new Date(episodeData.generatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </>
            )}
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  )
}

