'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from '@/components/ui/ClientMotion'
import type { VisualsSection, StoryboardFrame } from '@/types/investor-materials'

interface StoryboardComicBookProps {
  visuals: VisualsSection
}

interface ComicPage {
  episodeNumber: number
  episodeTitle: string
  panels: Array<{
    frame: StoryboardFrame
    actionText?: string
    dialogueText?: string
  }>
}

export default function StoryboardComicBook({ visuals }: StoryboardComicBookProps) {
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [panelsPerPage, setPanelsPerPage] = useState(4)

  // Initialize selected episode
  useEffect(() => {
    if (!selectedEpisode && visuals.episodes) {
      const firstEpisode = Object.keys(visuals.episodes)[0]
      if (firstEpisode) {
        setSelectedEpisode(Number(firstEpisode))
      }
    }
  }, [selectedEpisode, visuals.episodes])

  // Generate comic pages from storyboard frames
  const generateComicPages = (): ComicPage[] => {
    const pages: ComicPage[] = []
    const episodes = visuals.episodes || {}

    Object.entries(episodes).forEach(([epNum, episode]) => {
      const episodeNumber = Number(epNum)
      const panels: ComicPage['panels'] = []

      episode.scenes.forEach((scene) => {
        scene.frames.forEach((frame) => {
          // Extract action and dialogue from description
          const description = frame.description || ''
          const actionMatch = description.match(/(?:ACTION:|action:?\s*)(.*?)(?:\n|$)/i)
          const dialogueMatch = description.match(/(?:DIALOGUE:|dialogue:?\s*["""]?(.*?)["""]?)/i)

          panels.push({
            frame,
            actionText: actionMatch ? actionMatch[1].trim() : frame.notes || description.split('\n')[0],
            dialogueText: dialogueMatch ? dialogueMatch[1].trim() : frame.dialogueSnippet
          })
        })
      })

      // Split panels into pages
      for (let i = 0; i < panels.length; i += panelsPerPage) {
        pages.push({
          episodeNumber,
          episodeTitle: episode.episodeTitle,
          panels: panels.slice(i, i + panelsPerPage)
        })
      }
    })

    return pages
  }

  const allPages = generateComicPages()
  const currentEpisodePages = allPages.filter(p => p.episodeNumber === selectedEpisode)
  const currentPageData = currentEpisodePages[currentPage] || allPages[0]

  // Get episode list for sidebar
  const episodes = visuals.episodes ? Object.values(visuals.episodes) : []

  const getPanelLayout = (panelCount: number): string => {
    switch (panelCount) {
      case 1:
        return 'grid-cols-1'
      case 2:
        return 'grid-cols-2'
      case 3:
        return 'grid-cols-3'
      case 4:
        return 'grid-cols-2 grid-rows-2'
      default:
        return 'grid-cols-2'
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#121212]/95 backdrop-blur-sm border-b border-[#e2c376]/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="px-3 py-2 bg-[#2a2a2a] hover:bg-[#36393f] rounded text-sm"
            >
              {sidebarOpen ? '←' : '☰'} Episodes
            </button>
            <div className="text-sm text-white/70">
              {currentPageData?.episodeTitle} • Page {currentPage + 1} of {currentEpisodePages.length}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={panelsPerPage}
              onChange={(e) => setPanelsPerPage(Number(e.target.value))}
              className="px-3 py-1 bg-[#2a2a2a] text-white rounded text-sm border border-[#36393f]"
            >
              <option value={1}>1 Panel</option>
              <option value={2}>2 Panels</option>
              <option value={4}>4 Panels</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-[#121212] border-r border-[#e2c376]/20 overflow-y-auto max-h-[calc(100vh-80px)]"
            >
              <div className="p-4">
                <h3 className="font-bold text-[#e2c376] mb-4 text-lg">Episodes</h3>
                <div className="space-y-2">
                  {episodes.map((episode) => {
                    const episodePages = allPages.filter(p => p.episodeNumber === episode.episodeNumber)
                    const isSelected = selectedEpisode === episode.episodeNumber
                    
                    return (
                      <button
                        key={episode.episodeNumber}
                        onClick={() => {
                          setSelectedEpisode(episode.episodeNumber)
                          setCurrentPage(0)
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                          isSelected
                            ? 'bg-[#e2c376] text-black'
                            : 'bg-[#2a2a2a] text-white/80 hover:bg-[#36393f]'
                        }`}
                      >
                        <div className="font-semibold">Episode {episode.episodeNumber}</div>
                        <div className="text-xs opacity-70 mt-1">{episode.episodeTitle}</div>
                        <div className="text-xs opacity-60 mt-1">{episodePages.length} pages</div>
                      </button>
                    )
                  })}
                </div>

                {/* Page Navigation */}
                {selectedEpisode && currentEpisodePages.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-white/80 mb-2 text-sm">Pages</h4>
                    <div className="space-y-1">
                      {currentEpisodePages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentPage(idx)}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            currentPage === idx
                              ? 'bg-[#e2c376]/20 text-[#e2c376]'
                              : 'text-white/60 hover:text-white/80 hover:bg-[#2a2a2a]'
                          }`}
                        >
                          Page {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Comic Area */}
        <div className="flex-1 p-4 md:p-8">
          {currentPageData && selectedEpisode && (
            <motion.div
              key={`${currentPageData.episodeNumber}-${currentPage}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto"
            >
              {/* Comic Page */}
              <div className="bg-white rounded-lg shadow-2xl p-8 comic-page">
                {/* Page Header */}
                <div className="text-center mb-6 pb-4 border-b-2 border-black">
                  <h2 className="text-2xl font-bold text-black">
                    {currentPageData.episodeTitle}
                  </h2>
                  <div className="text-sm text-gray-600 mt-1">
                    Episode {currentPageData.episodeNumber} • Page {currentPage + 1}
                  </div>
                </div>

                {/* Panels Grid */}
                <div className={`grid ${getPanelLayout(Math.min(currentPageData.panels.length, panelsPerPage))} gap-4 md:gap-6`}>
                  {currentPageData.panels.map((panel, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="comic-panel relative"
                    >
                      {/* Panel Border */}
                      <div className="border-4 border-black rounded-lg overflow-hidden bg-white shadow-lg">
                        {/* Image */}
                        <div className="aspect-video bg-gray-200 relative overflow-hidden">
                          {panel.frame.imageUrl ? (
                            <img
                              src={panel.frame.imageUrl}
                              alt={panel.frame.description}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <div className="text-center">
                                <div className="text-4xl mb-2">🎬</div>
                                <div className="text-sm">Shot {panel.frame.shotNumber}</div>
                              </div>
                            </div>
                          )}

                          {/* Shot Badge */}
                          <div className="absolute top-2 left-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-mono">
                            Ep {panel.frame.episodeNumber} • Sc {panel.frame.sceneNumber} • Sh {panel.frame.shotNumber}
                          </div>
                        </div>

                        {/* Orange Action Text */}
                        {panel.actionText && (
                          <div className="bg-[#FF8C00] text-black p-3 border-t-2 border-black">
                            <div className="text-xs font-bold uppercase mb-1 tracking-wide">Action:</div>
                            <div className="text-sm leading-relaxed">{panel.actionText}</div>
                          </div>
                        )}

                        {/* Green Dialogue Bubble */}
                        {panel.dialogueText && (
                          <div className="bg-[#32CD32] text-black p-3 border-t-2 border-black relative">
                            <div className="text-xs font-bold uppercase mb-1 tracking-wide">Dialogue:</div>
                            <div className="text-sm leading-relaxed italic">"{panel.dialogueText}"</div>
                            {/* Speech bubble tail */}
                            <div className="absolute -top-2 right-8 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-[#32CD32]"></div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="px-6 py-3 bg-[#2a2a2a] hover:bg-[#36393f] disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  ← Previous
                </button>
                <div className="text-sm text-white/60">
                  Page {currentPage + 1} of {currentEpisodePages.length}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(currentEpisodePages.length - 1, currentPage + 1))}
                  disabled={currentPage === currentEpisodePages.length - 1}
                  className="px-6 py-3 bg-[#e2c376] hover:bg-[#d4b46a] disabled:bg-gray-600 disabled:cursor-not-allowed text-black rounded-lg transition-colors font-medium"
                >
                  Next →
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Comic Book Styles */}
      <style jsx>{`
        .comic-page {
          background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
          min-height: 800px;
        }
        
        .comic-panel {
          position: relative;
        }
        
        .comic-panel::before {
          content: '';
          position: absolute;
          inset: -2px;
          border: 2px solid rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}





