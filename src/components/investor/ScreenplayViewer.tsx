'use client'

import React, { useState, useEffect } from 'react'
import type { PilotSection, StorySection } from '@/types/investor-materials'
import { ScriptRenderer } from '@/components/preproduction/tabs/ScriptRenderer'

interface ScreenplayViewerProps {
  pilot: PilotSection
  story: StorySection
  storyBibleId: string
  userId?: string
  linkId?: string
  episodeScripts?: Record<number, PilotSection> // Pre-loaded episode scripts from package
}

interface EpisodeScript {
  episodeNumber: number
  episodeTitle: string
  fullScript: any // Script object from pre-production
  sceneStructure: {
    totalScenes: number
    totalPages: number
    estimatedRuntime: number
    scenes: Array<{
      sceneNumber: number
      heading: string
      pageCount: number
      synopsis: string
      characters: string[]
    }>
  }
}

export default function ScreenplayViewer({ pilot, story, storyBibleId, userId, linkId, episodeScripts: preloadedScripts }: ScreenplayViewerProps) {
  const [selectedEpisode, setSelectedEpisode] = useState<number>(pilot.episodeNumber)
  const [selectedScene, setSelectedScene] = useState<number | null>(null)
  const [episodeScripts, setEpisodeScripts] = useState<Map<number, EpisodeScript>>(new Map())
  const [loading, setLoading] = useState<boolean>(false)

  // Initialize with pilot script and pre-loaded scripts
  useEffect(() => {
    const scriptsMap = new Map<number, EpisodeScript>()
    
    // Add pilot script
    scriptsMap.set(pilot.episodeNumber, pilot)
    
    // Add pre-loaded episode scripts if available
    if (preloadedScripts) {
      Object.entries(preloadedScripts).forEach(([epNum, script]) => {
        scriptsMap.set(parseInt(epNum), script)
      })
    }
    
    setEpisodeScripts(scriptsMap)
  }, [pilot, preloadedScripts])

  // Fetch episode script when selected
  const fetchEpisodeScript = async (episodeNumber: number) => {
    if (episodeScripts.has(episodeNumber)) return

    setLoading(true)
    try {
      // Fetch script from API using linkId
      if (!linkId) {
        console.error('LinkId is required to fetch episode scripts')
        setLoading(false)
        return
      }

      const response = await fetch(`/api/investor-shared/${linkId}/episode-script?episodeNumber=${episodeNumber}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch script: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success && data.script) {
        setEpisodeScripts(prev => new Map(prev).set(episodeNumber, data.script))
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error fetching episode script:', error)
      // Fallback: Script not available
      const episode = story.episodes.find(ep => ep.episodeNumber === episodeNumber)
      if (episode) {
        // Don't set a placeholder - let the empty state handle it
        console.warn(`Script not available for Episode ${episodeNumber}`)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Fetch script if not already loaded and it's not the pilot episode
    if (selectedEpisode !== pilot.episodeNumber && !episodeScripts.has(selectedEpisode)) {
      fetchEpisodeScript(selectedEpisode)
    }
  }, [selectedEpisode]) // Only depend on selectedEpisode to avoid infinite loops

  const currentScript = episodeScripts.get(selectedEpisode)
  const currentEpisode = story.episodes.find(ep => ep.episodeNumber === selectedEpisode)

  // Show loading state if script is being fetched
  if (loading || !currentScript) {
    return (
      <div className="flex flex-col h-full min-h-[600px]">
        {/* Episode Navigation Tabs */}
        <div className="flex-shrink-0 bg-[#121212] border-b border-[#10B981]/20 overflow-x-auto">
          <div className="flex gap-2 p-4">
            {story.episodes.map((episode) => (
              <button
                key={episode.episodeNumber}
                onClick={() => {
                  setSelectedEpisode(episode.episodeNumber)
                  setSelectedScene(null)
                }}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  selectedEpisode === episode.episodeNumber
                    ? 'bg-[#10B981] text-black font-bold'
                    : 'bg-[#0A0A0A] text-white/70 hover:bg-white/5 hover:text-white border border-[#10B981]/20'
                }`}
              >
                <span className="font-semibold">Ep {episode.episodeNumber}</span>
                <span className="ml-2 opacity-75">{episode.title}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981] mx-auto mb-4"></div>
            <p className="text-white/70">Loading script for Episode {selectedEpisode}...</p>
          </div>
        </div>
      </div>
    )
  }

  // Handle empty script
  if (!currentScript.fullScript || !currentScript.fullScript.pages || currentScript.fullScript.pages.length === 0) {
    return (
      <div className="flex flex-col h-full min-h-[600px]">
        {/* Episode Navigation Tabs */}
        <div className="flex-shrink-0 bg-[#121212] border-b border-[#10B981]/20 overflow-x-auto">
          <div className="flex gap-2 p-4">
            {story.episodes.map((episode) => (
              <button
                key={episode.episodeNumber}
                onClick={() => {
                  setSelectedEpisode(episode.episodeNumber)
                  setSelectedScene(null)
                }}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  selectedEpisode === episode.episodeNumber
                    ? 'bg-[#10B981] text-black font-bold'
                    : 'bg-[#0A0A0A] text-white/70 hover:bg-white/5 hover:text-white border border-[#10B981]/20'
                }`}
              >
                <span className="font-semibold">Ep {episode.episodeNumber}</span>
                <span className="ml-2 opacity-75">{episode.title}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-12">
            <div className="text-6xl mb-4 opacity-50">🎬</div>
            <h3 className="text-xl font-bold text-white mb-2">Script Not Available</h3>
            <p className="text-white/70 mb-4">
              The script for {currentEpisode?.title || `Episode ${selectedEpisode}`} has not been generated yet.
            </p>
            <p className="text-white/50 text-sm">
              Generate the script in Pre-Production to view it here.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-[600px]">
      {/* Episode Navigation Tabs */}
      <div className="flex-shrink-0 bg-[#121212] border-b border-[#10B981]/20 overflow-x-auto">
        <div className="flex gap-2 p-4">
          {story.episodes.map((episode) => (
            <button
              key={episode.episodeNumber}
              onClick={() => {
                setSelectedEpisode(episode.episodeNumber)
                setSelectedScene(null)
              }}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                selectedEpisode === episode.episodeNumber
                  ? 'bg-[#10B981] text-black font-bold'
                  : 'bg-[#0A0A0A] text-white/70 hover:bg-white/5 hover:text-white border border-[#10B981]/20'
              }`}
            >
              <span className="font-semibold">Ep {episode.episodeNumber}</span>
              <span className="ml-2 opacity-75">{episode.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Script Content - Full Width */}
      <div className="flex-1 overflow-y-auto bg-[#0A0A0A]">
        {/* Header Info */}
        <div className="sticky top-0 bg-[#121212]/95 backdrop-blur-sm border-b border-[#10B981]/20 p-6 z-10">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-2">
              Episode {currentScript.episodeNumber}: {currentScript.episodeTitle || currentEpisode?.title}
            </h2>
            <div className="flex gap-6 text-sm text-white/70">
              <span>{currentScript.sceneStructure.totalScenes} scenes</span>
              <span>{currentScript.sceneStructure.totalPages} pages</span>
              <span>~{currentScript.sceneStructure.estimatedRuntime} min</span>
            </div>
          </div>
        </div>

        {/* Script Content - Use ScriptRenderer from pre-production */}
        <div className="p-8 md:p-12">
          <div className="max-w-5xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981] mx-auto mb-4"></div>
                <p className="text-white/70">Loading script...</p>
              </div>
            ) : currentScript.fullScript ? (
              <ScriptRenderer script={currentScript.fullScript} showPageNumbers={true} />
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 opacity-50">📝</div>
                <h3 className="text-xl font-bold text-white mb-2">No Script Available</h3>
                <p className="text-white/70">The full script for this episode is not yet available in Pre-Production.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

