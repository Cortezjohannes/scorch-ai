'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'
import type { StorySection, EpisodeSummary } from '@/types/investor-materials'

interface StoryArcTimelineProps {
  story: StorySection
}

interface EpisodeNode {
  episode: EpisodeSummary
  progress: number // 0-1 position along the arc
  characters: string[]
  emotionalState: string
}

export default function StoryArcTimeline({ story }: StoryArcTimelineProps) {
  const [selectedEpisode, setSelectedEpisode] = useState<EpisodeSummary | null>(null)
  const [hoveredEpisode, setHoveredEpisode] = useState<number | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [viewMode, setViewMode] = useState<'arc' | 'filmstrip'>('arc')

  const containerRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)

  // Generate episode nodes with calculated positions
  const generateEpisodeNodes = (): EpisodeNode[] => {
    return story.episodes.map((episode, idx) => {
      // Calculate progress position (0-1) along the story arc
      let progress = 0
      if (idx === 0) progress = 0 // Setup
      else if (idx === 1) progress = 0.15 // Rising action start
      else if (idx === story.episodes.length - 2) progress = 0.85 // Falling action start
      else if (idx === story.episodes.length - 1) progress = 1 // Resolution
      else {
        // Distribute middle episodes
        const middleCount = story.episodes.length - 4
        const middleProgress = (idx - 1) / Math.max(1, middleCount - 1)
        progress = 0.15 + (middleProgress * 0.7)
      }

      return {
        episode,
        progress,
        characters: [], // Would be populated from episode scenes
        emotionalState: episode.emotionalBeat || 'Neutral'
      }
    })
  }

  const episodeNodes = generateEpisodeNodes()

  // Scroll-based progress tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      setScrollProgress(latest)
    })
    return unsubscribe
  }, [scrollYProgress])

  // Calculate position along curved path
  const getPositionAlongArc = (progress: number, arcHeight: number = 300, width: number = 800) => {
    // Create a parabolic arc: y = -height * (x - 0.5)^2 + height
    const x = progress
    const y = -arcHeight * Math.pow(x - 0.5, 2) + arcHeight

    // Add some wave motion
    const waveOffset = Math.sin(progress * Math.PI * 4) * 20

    return {
      x: x * width,
      y: y + waveOffset,
      rotation: Math.atan2(y - (-arcHeight * Math.pow((progress - 0.01) - 0.5, 2) + arcHeight) + waveOffset, 10) * 180 / Math.PI
    }
  }

  const renderArcView = () => {
    const arcWidth = 1000
    const arcHeight = 400

    // Create SVG path for the story arc
    const pathData = `M 0 ${arcHeight}
      Q ${arcWidth * 0.25} ${arcHeight * 0.3} ${arcWidth * 0.5} ${arcHeight * 0.8}
      Q ${arcWidth * 0.75} ${arcHeight * 0.3} ${arcWidth} ${arcHeight}`

    return (
      <div className="relative w-full min-h-screen flex items-center justify-center py-20">
        <div className="relative" style={{ width: arcWidth + 200, height: arcHeight + 200 }}>

          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#121212] to-[#0A0A0A] opacity-50" />

          {/* Story Arc Path */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox={`0 0 ${arcWidth + 200} ${arcHeight + 200}`}
          >
            {/* Path outline */}
            <path
              d={pathData}
              fill="none"
              stroke="#10B981"
              strokeWidth="4"
              opacity="0.3"
            />

            {/* Animated path reveal */}
            <motion.path
              d={pathData}
              fill="none"
              stroke="#10B981"
              strokeWidth="6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: scrollProgress }}
              transition={{ duration: 0.5 }}
              style={{
                filter: 'drop-shadow(0 0 10px #10B981)'
              }}
            />

            {/* Episode nodes */}
            {episodeNodes.map((node, idx) => {
              const position = getPositionAlongArc(node.progress, arcHeight * 0.8, arcWidth)
              const isVisible = scrollProgress >= node.progress - 0.1
              const isHovered = hoveredEpisode === idx
              const isSelected = selectedEpisode?.episodeNumber === node.episode.episodeNumber

              return (
                <motion.g
                  key={node.episode.episodeNumber}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: isVisible ? (isSelected ? 1.5 : isHovered ? 1.2 : 1) : 0,
                    opacity: isVisible ? 1 : 0
                  }}
                  transition={{ delay: idx * 0.1, type: 'spring' }}
                  onHoverStart={() => setHoveredEpisode(idx)}
                  onHoverEnd={() => setHoveredEpisode(null)}
                  onClick={() => setSelectedEpisode(isSelected ? null : node.episode)}
                  className="cursor-pointer"
                >
                  {/* Episode node */}
                  <circle
                    cx={position.x + 100}
                    cy={position.y + 50}
                    r={isSelected ? 25 : isHovered ? 20 : 15}
                    fill={isSelected ? "#10B981" : "#1A1A1A"}
                    stroke="#10B981"
                    strokeWidth="3"
                    style={{
                      filter: isHovered ? 'drop-shadow(0 0 15px #10B981)' : 'none'
                    }}
                  />

                  {/* Episode number */}
                  <text
                    x={position.x + 100}
                    y={position.y + 55}
                    textAnchor="middle"
                    className="text-white font-bold text-sm fill-current"
                  >
                    {node.episode.episodeNumber}
                  </text>

                  {/* Episode title (visible on hover) */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.text
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        x={position.x + 100}
                        y={position.y + 25}
                        textAnchor="middle"
                        className="text-white font-semibold text-xs fill-current"
                      >
                        {node.episode.title}
                      </motion.text>
                    )}
                  </AnimatePresence>
                </motion.g>
              )
            })}
          </svg>

          {/* Floating episode details */}
          <AnimatePresence>
            {selectedEpisode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
              >
                <div className="bg-[#121212] border border-[#10B981]/30 rounded-xl p-8 max-w-md shadow-2xl">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Episode {selectedEpisode.episodeNumber}
                      </h3>
                      {selectedEpisode.title && (
                        <p className="text-[#10B981] font-semibold">{selectedEpisode.title}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedEpisode(null)}
                      className="text-white/50 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  {selectedEpisode.summary && (
                    <p className="text-white/80 mb-4 leading-relaxed">{selectedEpisode.summary}</p>
                  )}

                  {selectedEpisode.keyBeat && (
                    <div className="mb-4">
                      <p className="text-white/70 text-sm font-semibold mb-1">Key Beat:</p>
                      <p className="text-white/90 text-sm">{selectedEpisode.keyBeat}</p>
                    </div>
                  )}

                  {selectedEpisode.emotionalBeat && (
                    <div className="mb-4">
                      <p className="text-white/70 text-sm font-semibold mb-1">Emotional Beat:</p>
                      <p className="text-[#10B981] text-sm font-medium">{selectedEpisode.emotionalBeat}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Story arc labels */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
            <div className="flex justify-between w-full text-xs text-white/60 mb-2">
              <span>Setup</span>
              <span>Rising Action</span>
              <span>Climax</span>
              <span>Falling Action</span>
              <span>Resolution</span>
            </div>
            <div className="text-xs text-white/40">
              Scroll to reveal the story journey
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderFilmstripView = () => {
    return (
      <div className="relative w-full min-h-screen overflow-hidden">
        {/* Filmstrip background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] to-[#121212]">
          {/* Filmstrip perforation pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `repeating-linear-gradient(
                90deg,
                transparent,
                transparent 40px,
                rgba(16, 185, 129, 0.3) 40px,
                rgba(16, 185, 129, 0.3) 60px
              )`,
              backgroundSize: '100px 100%'
            }}
          />
        </div>

        {/* Episodes as film frames */}
        <div className="relative z-10 flex flex-col items-center space-y-8 py-20">
          {story.episodes.map((episode, idx) => {
            const isVisible = scrollProgress >= (idx / story.episodes.length) - 0.1
            const isHovered = hoveredEpisode === idx
            const isSelected = selectedEpisode?.episodeNumber === episode.episodeNumber

            return (
              <motion.div
                key={episode.episodeNumber}
                initial={{ opacity: 0, scale: 0.8, y: 100 }}
                animate={{
                  opacity: isVisible ? 1 : 0,
                  scale: isVisible ? (isSelected ? 1.1 : isHovered ? 1.05 : 1) : 0.8,
                  y: isVisible ? 0 : 100
                }}
                transition={{
                  delay: idx * 0.2,
                  type: 'spring',
                  stiffness: 100
                }}
                onHoverStart={() => setHoveredEpisode(idx)}
                onHoverEnd={() => setHoveredEpisode(null)}
                onClick={() => setSelectedEpisode(isSelected ? null : episode)}
                className="cursor-pointer relative"
              >
                {/* Film frame container */}
                <div className="relative bg-black border-4 border-gray-800 rounded-lg overflow-hidden shadow-2xl">
                  {/* Film frame aspect ratio (2.35:1 for cinematic) */}
                  <div className="relative" style={{ width: '400px', height: '170px' }}>

                    {/* Episode thumbnail/image placeholder */}
                    <div className="w-full h-full bg-gradient-to-br from-[#10B981]/20 to-[#121212] flex items-center justify-center">
                      <div className="text-center text-white/60">
                        <div className="text-4xl mb-2">🎬</div>
                        <p className="text-sm">Episode {episode.episodeNumber}</p>
                      </div>
                    </div>

                    {/* Film perforation holes */}
                    <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-around px-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="w-3 h-3 bg-gray-600 rounded-full"></div>
                      ))}
                    </div>
                    <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-around px-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="w-3 h-3 bg-gray-600 rounded-full"></div>
                      ))}
                    </div>

                    {/* Episode info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-bold text-sm">
                            Episode {episode.episodeNumber}
                          </p>
                          {episode.title && (
                            <p className="text-[#10B981] text-xs font-semibold">
                              {episode.title}
                            </p>
                          )}
                        </div>
                        <div className="text-white/60 text-xs">
                          {episode.episodeNumber}/{story.episodes.length}
                        </div>
                      </div>
                    </div>

                    {/* Development animation overlay */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{
                        duration: 2,
                        delay: idx * 0.5,
                        ease: 'easeInOut'
                      }}
                    />
                  </div>
                </div>

                {/* Hover expansion */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 bg-[#121212] border border-[#10B981]/20 rounded-lg p-4 max-w-md"
                    >
                      <p className="text-white/80 text-sm leading-relaxed">
                        {episode.summary || 'Episode summary not available.'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* Progress indicator */}
        <div className="fixed top-4 right-4 z-20">
          <div className="bg-[#121212] border border-[#10B981]/20 rounded-lg p-4">
            <div className="text-xs text-white/60 mb-2">Story Progress</div>
            <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#10B981] rounded-full"
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>
            <div className="text-xs text-[#10B981] mt-1">
              {Math.round(scrollProgress * 100)}% Complete
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative w-full min-h-[200vh] bg-[#0A0A0A]">

      {/* Header Controls */}
      <div className="sticky top-0 z-30 bg-[#121212]/95 backdrop-blur-sm border-b border-[#10B981]/20 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode('arc')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                viewMode === 'arc' ? 'bg-[#10B981] text-black' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Story Arc
            </button>
            <button
              onClick={() => setViewMode('filmstrip')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                viewMode === 'filmstrip' ? 'bg-[#10B981] text-black' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Film Strip
            </button>
          </div>

          <div className="text-sm text-white/70">
            {story.episodes.length} Episodes • Scroll to explore the journey
          </div>
        </div>
      </div>

      {/* Story Title Header */}
      <div className="sticky top-20 z-20 bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-[#10B981]/10 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            The Story Journey
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-[#10B981] font-light"
          >
            {story.arcTitle}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/70 mt-4 max-w-2xl mx-auto"
          >
            {story.arcDescription}
          </motion.p>

          {/* Character transformation preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex justify-center items-center space-x-8"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 border-2 border-red-500 rounded-full flex items-center justify-center text-2xl mb-2">
                🐢
              </div>
              <p className="text-sm text-white/60">Beginning</p>
              <p className="text-xs text-red-400">{story.transformation.start}</p>
            </div>

            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="text-4xl text-[#10B981]"
            >
              →
            </motion.div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center text-2xl mb-2">
                🦅
              </div>
              <p className="text-sm text-white/60">End</p>
              <p className="text-xs text-green-400">{story.transformation.end}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'arc' ? (
          <motion.div
            key="arc"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderArcView()}
          </motion.div>
        ) : (
          <motion.div
            key="filmstrip"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderFilmstripView()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating episode modal */}
      <AnimatePresence>
        {selectedEpisode && viewMode === 'filmstrip' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEpisode(null)}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#121212] border border-[#10B981]/30 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Episode {selectedEpisode.episodeNumber}
                    </h2>
                    {selectedEpisode.title && (
                      <p className="text-[#10B981] text-lg mt-1">{selectedEpisode.title}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedEpisode(null)}
                    className="text-white/50 hover:text-white text-xl"
                  >
                    ✕
                  </button>
                </div>

                {selectedEpisode.summary && (
                  <p className="text-white/90 mb-6 leading-relaxed text-lg">
                    {selectedEpisode.summary}
                  </p>
                )}

                {selectedEpisode.episodeRundown && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-[#10B981] mb-3">Episode Rundown</h3>
                    <p className="text-white/80 leading-relaxed">{selectedEpisode.episodeRundown}</p>
                  </div>
                )}

                {selectedEpisode.scenes && selectedEpisode.scenes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-[#10B981] mb-3">Key Scenes</h3>
                    <div className="space-y-4">
                      {selectedEpisode.scenes.slice(0, 3).map((scene, idx) => (
                        <div key={idx} className="bg-[#0A0A0A] border border-white/10 rounded-lg p-4">
                          <h4 className="text-white font-semibold mb-2">
                            Scene {scene.sceneNumber}: {scene.title}
                          </h4>
                          <p className="text-white/70 text-sm leading-relaxed">{scene.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}