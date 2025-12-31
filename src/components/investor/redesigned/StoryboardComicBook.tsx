'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import type { VisualsSection, StoryboardFrame } from '@/types/investor-materials'

interface StoryboardComicBookProps {
  visuals: VisualsSection
}

interface ComicPanel {
  frame: StoryboardFrame
  episodeNumber: number
  sceneNumber: number
  shotNumber: number
  actionText?: string
  dialogueText?: string
  panelStyle: 'wide' | 'tall' | 'square' | 'splash'
}

export default function StoryboardComicBook({ visuals }: StoryboardComicBookProps) {
  const [currentPanel, setCurrentPanel] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [viewMode, setViewMode] = useState<'comic' | 'cinematographer'>('comic')
  const [showBehindScenes, setShowBehindScenes] = useState(false)
  const [autoPlay, setAutoPlay] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)
  const [hotspots, setHotspots] = useState<Array<{x: number, y: number, label: string, type: 'prop' | 'character' | 'lighting'}>>([])

  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  // Generate comic panels from storyboard frames
  const generateComicPanels = (): ComicPanel[] => {
    const panels: ComicPanel[] = []
    const episodes = visuals.episodes || {}

    Object.entries(episodes).forEach(([epNum, episode]) => {
      episode.scenes.forEach(scene => {
        scene.frames.forEach((frame, frameIdx) => {
          // Extract action and dialogue from frame description
          const description = frame.description || ''
          const actionMatch = description.match(/(?:ACTION:|action:?\s*)(.*?)(?:\n|$)/i)
          const dialogueMatch = description.match(/(?:DIALOGUE:|dialogue:?\s*["""]?(.*?)["""]?)/i)

          // Determine panel style based on content and position
          let panelStyle: ComicPanel['panelStyle'] = 'square'
          if (frameIdx === 0) panelStyle = 'splash' // First frame of scene
          else if (frame.cameraAngle?.toLowerCase().includes('wide')) panelStyle = 'wide'
          else if (frame.cameraAngle?.toLowerCase().includes('close')) panelStyle = 'tall'

          panels.push({
            frame,
            episodeNumber: parseInt(epNum),
            sceneNumber: scene.sceneNumber,
            shotNumber: frame.shotNumber,
            actionText: actionMatch ? actionMatch[1].trim() : undefined,
            dialogueText: dialogueMatch ? dialogueMatch[1].trim() : undefined,
            panelStyle
          })
        })
      })
    })

    return panels
  }

  const panels = generateComicPanels()
  const totalPanels = panels.length

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay) {
      autoPlayRef.current = setInterval(() => {
        setCurrentPanel(prev => (prev + 1) % totalPanels)
      }, 4000) // 4 seconds per panel
    } else {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
        autoPlayRef.current = null
      }
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [autoPlay, totalPanels])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        navigatePanel('next')
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        navigatePanel('prev')
      } else if (e.key === 'Escape') {
        setShowBehindScenes(false)
        setSelectedCharacter(null)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentPanel, totalPanels])

  const navigatePanel = (direction: 'next' | 'prev') => {
    if (isTransitioning) return

    setIsTransitioning(true)
    setTimeout(() => {
      if (direction === 'next') {
        setCurrentPanel(prev => (prev + 1) % totalPanels)
      } else {
        setCurrentPanel(prev => (prev - 1 + totalPanels) % totalPanels)
      }
      setIsTransitioning(false)
    }, 300)
  }

  const goToPanel = (index: number) => {
    if (index >= 0 && index < totalPanels) {
      setCurrentPanel(index)
    }
  }

  const getPanelDimensions = (style: ComicPanel['panelStyle']) => {
    switch (style) {
      case 'splash': return 'aspect-[16/9] max-w-4xl'
      case 'wide': return 'aspect-[21/9] max-w-5xl'
      case 'tall': return 'aspect-[9/16] max-w-2xl'
      case 'square': return 'aspect-square max-w-3xl'
      default: return 'aspect-square max-w-3xl'
    }
  }

  const renderComicPanel = (panel: ComicPanel, index: number) => {
    const isActive = index === currentPanel
    const hasVideo = panel.frame.referenceVideos && panel.frame.referenceVideos.length > 0
    const displayUrl = hasVideo ? panel.frame.referenceVideos![0] : panel.frame.imageUrl

    return (
      <motion.div
        key={`${panel.episodeNumber}-${panel.sceneNumber}-${panel.shotNumber}`}
        className={`relative ${getPanelDimensions(panel.panelStyle)} mx-auto overflow-hidden comic-panel`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: isActive ? 1 : 0,
          scale: isActive ? 1 : 0.8,
          zIndex: isActive ? 10 : 1
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ display: isActive ? 'block' : 'none' }}
      >
        {/* Comic Panel Border */}
        <div className="absolute inset-0 border-4 border-black bg-white shadow-2xl">
          {/* Panel gutters effect */}
          <div className="absolute inset-2 border-2 border-gray-800">
            <div className="absolute inset-1 border border-gray-600">
              {/* Content area */}
              <div className="relative w-full h-full overflow-hidden">

                {/* Background Image/Video */}
                {displayUrl ? (
                  <>
                    {hasVideo ? (
                      <video
                        src={displayUrl}
                        autoPlay
                        muted
                        loop
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <motion.img
                        src={displayUrl}
                        alt={panel.frame.description}
                        className="w-full h-full object-cover"
                        initial={{ scale: 1.1, filter: 'blur(10px)' }}
                        animate={{ scale: 1, filter: 'blur(0px)' }}
                        transition={{ duration: 0.8 }}
                      />
                    )}

                    {/* Ken Burns effect for static images */}
                    {!hasVideo && (
                      <motion.div
                        className="absolute inset-0"
                        animate={{
                          scale: [1, 1.05, 1],
                          x: [0, 10, 0],
                          y: [0, -5, 0]
                        }}
                        transition={{
                          duration: 20,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                      />
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <div className="text-center text-white/50">
                      <div className="text-6xl mb-4">🎬</div>
                      <p>Storyboard frame loading...</p>
                    </div>
                  </div>
                )}

                {/* Behind the Scenes Overlay */}
                <AnimatePresence>
                  {showBehindScenes && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/70 flex items-center justify-center"
                    >
                      <div className="text-white text-center space-y-4">
                        <h3 className="text-xl font-bold">Behind the Scenes</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-semibold">Camera Angle:</p>
                            <p>{panel.frame.cameraAngle}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Camera Movement:</p>
                            <p>{panel.frame.cameraMovement}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Lighting:</p>
                            <p>{panel.frame.lightingNotes || 'Natural'}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Shot Type:</p>
                            <p>Shot {panel.shotNumber}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Orange Action Text Overlay */}
                {panel.actionText && (
                  <motion.div
                    className="absolute bottom-4 left-4 right-4 bg-orange-500/90 text-black p-3 rounded-lg border-2 border-orange-600"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.5 }}
                  >
                    <div className="text-sm font-bold uppercase tracking-wide mb-1">Action:</div>
                    <div className="text-sm leading-relaxed">{panel.actionText}</div>
                  </motion.div>
                )}

                {/* Green Dialogue Bubble */}
                {panel.dialogueText && (
                  <motion.div
                    className="absolute top-4 right-4 bg-green-500/90 text-black p-3 rounded-lg border-2 border-green-600 max-w-xs"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.5, duration: 0.5, type: 'spring' }}
                  >
                    <div className="text-sm leading-relaxed italic">"{panel.dialogueText}"</div>
                    {/* Speech bubble tail */}
                    <div className="absolute -bottom-2 right-8 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-600"></div>
                  </motion.div>
                )}

                {/* Hotspots for interactive elements */}
                {hotspots.map((hotspot, idx) => (
                  <motion.div
                    key={idx}
                    className="absolute w-4 h-4 bg-red-500 rounded-full cursor-pointer border-2 border-white shadow-lg"
                    style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                    whileHover={{ scale: 1.5 }}
                    onClick={() => {
                      // Show hotspot info
                      alert(`${hotspot.type}: ${hotspot.label}`)
                    }}
                  />
                ))}

                {/* Motion blur effect for camera movements */}
                {panel.frame.cameraMovement?.toLowerCase().includes('pan') && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                )}

              </div>
            </div>
          </div>
        </div>

        {/* Panel Info Badge */}
        <div className="absolute top-2 left-2 bg-black/80 text-white px-3 py-1 rounded text-xs font-mono">
          Ep {panel.episodeNumber} • Scene {panel.sceneNumber} • Shot {panel.shotNumber}
        </div>

        {/* Video indicator */}
        {hasVideo && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
            🎥 VIDEO
          </div>
        )}
      </motion.div>
    )
  }

  const renderCinematographerView = () => {
    const currentPanelData = panels[currentPanel]
    if (!currentPanelData) return null

    const sceneFrames = panels.filter(p =>
      p.episodeNumber === currentPanelData.episodeNumber &&
      p.sceneNumber === currentPanelData.sceneNumber
    )

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-8">
        {sceneFrames.map((panel, idx) => (
          <motion.div
            key={idx}
            className="aspect-video bg-gray-800 rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-[#10B981]"
            onClick={() => goToPanel(panels.indexOf(panel))}
            whileHover={{ scale: 1.05 }}
          >
            {panel.frame.imageUrl ? (
              <img
                src={panel.frame.imageUrl}
                alt={`Shot ${panel.shotNumber}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/50">
                Shot {panel.shotNumber}
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2">
              Shot {panel.shotNumber}: {panel.frame.cameraAngle}
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  if (viewMode === 'cinematographer') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#121212]/95 backdrop-blur-sm border-b border-[#10B981]/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewMode('comic')}
                className="px-4 py-2 bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#10B981] rounded-lg"
              >
                ← Comic View
              </button>
              <h2 className="text-xl font-bold">Cinematographer Mode</h2>
            </div>
            <div className="text-sm text-white/70">
              Scene {panels[currentPanel]?.sceneNumber || 0} • {panels.filter(p => p.sceneNumber === panels[currentPanel]?.sceneNumber).length} shots
            </div>
          </div>
        </div>

        {renderCinematographerView()}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white relative">
      {/* Header Controls */}
      <div className="sticky top-0 z-50 bg-[#121212]/95 backdrop-blur-sm border-b border-[#10B981]/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm"
            >
              {sidebarCollapsed ? '☰' : '←'} Thumbnails
            </button>
            <div className="text-sm text-white/70">
              Panel {currentPanel + 1} of {totalPanels}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode('cinematographer')}
              className="px-4 py-2 bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#10B981] rounded-lg text-sm"
            >
              🎥 Cinematographer View
            </button>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showBehindScenes}
                onChange={(e) => setShowBehindScenes(!showBehindScenes)}
                className="rounded"
              />
              Behind Scenes
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoPlay}
                onChange={(e) => setAutoPlay(!autoPlay)}
                className="rounded"
              />
              Auto Play
            </label>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm"
            >
              📄 Export PDF
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 bg-white/10 rounded-full h-2">
          <motion.div
            className="bg-[#10B981] h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentPanel + 1) / totalPanels) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Thumbnails */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-[#121212] border-r border-[#10B981]/20 overflow-y-auto max-h-[calc(100vh-120px)]"
            >
              <div className="p-4">
                <h3 className="font-bold text-[#10B981] mb-4">Storyboard Panels</h3>
                <div className="grid grid-cols-2 gap-2">
                  {panels.map((panel, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToPanel(idx)}
                      className={`aspect-video rounded border-2 overflow-hidden ${
                        currentPanel === idx
                          ? 'border-[#10B981] ring-2 ring-[#10B981]/50'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                    >
                      {panel.frame.imageUrl ? (
                        <img
                          src={panel.frame.imageUrl}
                          alt={`Panel ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs text-white/50">
                          {idx + 1}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Comic Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[calc(100vh-120px)]">
          {/* Comic Panels Container */}
          <div className="relative w-full max-w-6xl">
            {panels.map((panel, idx) => renderComicPanel(panel, idx))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-8 mt-8">
            <button
              onClick={() => navigatePanel('prev')}
              disabled={currentPanel === 0 || isTransitioning}
              className="px-6 py-3 bg-[#10B981]/20 hover:bg-[#10B981]/30 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-lg"
            >
              ← Previous
            </button>

            <div className="text-center">
              <div className="text-sm text-white/60 mb-2">
                {panels[currentPanel]?.frame.description?.split('\n')[0] || 'Storyboard Panel'}
              </div>
              <div className="text-xs text-white/40">
                Click or use arrow keys to navigate • Space for next
              </div>
            </div>

            <button
              onClick={() => navigatePanel('next')}
              disabled={currentPanel === totalPanels - 1 || isTransitioning}
              className="px-6 py-3 bg-[#10B981] hover:bg-[#059669] disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-lg"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Comic Book Style CSS */}
      <style jsx>{`
        .comic-panel {
          background: white;
          box-shadow:
            0 0 0 1px #000,
            0 0 0 3px #fff,
            0 0 0 5px #000,
            0 10px 30px rgba(0,0,0,0.5);
        }

        .comic-panel::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,0.1) 2px,
            rgba(255,255,255,0.1) 4px
          );
          pointer-events: none;
        }

        @media print {
          .comic-panel {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  )
}
