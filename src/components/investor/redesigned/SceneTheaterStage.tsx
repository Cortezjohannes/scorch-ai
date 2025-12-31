'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import type { KeyScenesSection } from '@/types/investor-materials'

interface SceneTheaterStageProps {
  keyScenes: KeyScenesSection
  onSceneSelect?: (episodeNumber: number, sceneNumber: number) => void
}

interface ScenePerformance {
  episodeNumber: number
  sceneTitle: string
  excerpt: string
  context: string
  whyItMatters: string
  mood: 'dramatic' | 'tense' | 'emotional' | 'action' | 'comedic'
  characters: string[]
  lightingPreset: 'warm' | 'cool' | 'dramatic' | 'natural' | 'night'
}

export default function SceneTheaterStage({ keyScenes, onSceneSelect }: SceneTheaterStageProps): React.ReactElement {
  const [selectedScene, setSelectedScene] = useState<ScenePerformance | null>(null)
  const [curtainsOpen, setCurtainsOpen] = useState(false)
  const [performanceMode, setPerformanceMode] = useState<'theater' | 'analysis'>('theater')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentLine, setCurrentLine] = useState(0)
  const [showDirectorNotes, setShowDirectorNotes] = useState(false)

  const performanceIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const sceneContainerRef = useRef<HTMLDivElement>(null)

  // Convert key scenes to performance format
  const generateScenePerformances = (): ScenePerformance[] => {
    const scenes: ScenePerformance[] = []

    const addScene = (sceneData: any, episodeNum: number) => {
      if (!sceneData) return

      scenes.push({
        episodeNumber: episodeNum,
        sceneTitle: sceneData.sceneTitle || `Scene ${sceneData.sceneNumber}`,
        excerpt: sceneData.excerpt,
        context: sceneData.context,
        whyItMatters: sceneData.whyItMatters,
        mood: determineMood(sceneData.excerpt),
        characters: extractCharacters(sceneData.excerpt),
        lightingPreset: determineLighting(sceneData.excerpt)
      })
    }

    if (keyScenes.episode3) addScene(keyScenes.episode3, 3)
    if (keyScenes.episode5) addScene(keyScenes.episode5, 5)
    if (keyScenes.episode7) addScene(keyScenes.episode7, 7)
    if (keyScenes.episode8) addScene(keyScenes.episode8, 8)

    return scenes
  }

  const scenePerformances = generateScenePerformances()

  // Helper functions
  const determineMood = (excerpt: string): ScenePerformance['mood'] => {
    const lower = excerpt.toLowerCase()
    if (lower.includes('laugh') || lower.includes('joke') || lower.includes('funny')) return 'comedic'
    if (lower.includes('fight') || lower.includes('chase') || lower.includes('run')) return 'action'
    if (lower.includes('cry') || lower.includes('heart') || lower.includes('love')) return 'emotional'
    if (lower.includes('tense') || lower.includes('suspense') || lower.includes('fear')) return 'tense'
    return 'dramatic'
  }

  const determineLighting = (excerpt: string): ScenePerformance['lightingPreset'] => {
    const lower = excerpt.toLowerCase()
    if (lower.includes('night') || lower.includes('dark') || lower.includes('moon')) return 'night'
    if (lower.includes('warm') || lower.includes('sunset') || lower.includes('fire')) return 'warm'
    if (lower.includes('cold') || lower.includes('blue') || lower.includes('ice')) return 'cool'
    if (lower.includes('shadow') || lower.includes('dramatic') || lower.includes('contrast')) return 'dramatic'
    return 'natural'
  }

  const extractCharacters = (excerpt: string): string[] => {
    // Simple character extraction from dialogue patterns
    const characterMatches = excerpt.match(/([A-Z][A-Z\s]+):/g) || []
    return characterMatches.map(match => match.replace(':', '').trim())
  }

  // Performance mode logic
  useEffect(() => {
    if (isPlaying && selectedScene) {
      const lines = selectedScene.excerpt.split('\n').filter(line => line.trim().length > 0)
      let lineIndex = 0

      performanceIntervalRef.current = setInterval(() => {
        setCurrentLine(lineIndex)
        lineIndex++

        if (lineIndex >= lines.length) {
          setIsPlaying(false)
          setCurrentLine(0)
        }
      }, 2000) // 2 seconds per line
    } else {
      if (performanceIntervalRef.current) {
        clearInterval(performanceIntervalRef.current)
        performanceIntervalRef.current = null
      }
      setCurrentLine(0)
    }

    return () => {
      if (performanceIntervalRef.current) {
        clearInterval(performanceIntervalRef.current)
      }
    }
  }, [isPlaying, selectedScene])

  const handleSceneSelect = (scene: ScenePerformance) => {
    setSelectedScene(scene)
    setCurtainsOpen(true)
    setIsPlaying(false)
    setCurrentLine(0)
    onSceneSelect?.(scene.episodeNumber, 0) // Scene number not available in key scenes
  }

  const handleClosePerformance = () => {
    setCurtainsOpen(false)
    setTimeout(() => setSelectedScene(null), 500)
    setIsPlaying(false)
    setCurrentLine(0)
  }

  const getLightingColors = (preset: ScenePerformance['lightingPreset']) => {
    switch (preset) {
      case 'warm': return { primary: '#F59E0B', secondary: '#F97316', ambient: 'rgba(245, 158, 11, 0.1)' }
      case 'cool': return { primary: '#3B82F6', secondary: '#1D4ED8', ambient: 'rgba(59, 130, 246, 0.1)' }
      case 'dramatic': return { primary: '#DC2626', secondary: '#B91C1C', ambient: 'rgba(220, 38, 38, 0.1)' }
      case 'night': return { primary: '#1F2937', secondary: '#111827', ambient: 'rgba(31, 41, 55, 0.3)' }
      default: return { primary: '#10B981', secondary: '#059669', ambient: 'rgba(16, 185, 129, 0.1)' }
    }
  }

  const renderSceneSelector = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
        {scenePerformances.map((scene, idx) => {
          const lighting = getLightingColors(scene.lightingPreset)

          return (
            <motion.div
              key={scene.episodeNumber}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              className="relative cursor-pointer group"
              onClick={() => handleSceneSelect(scene)}
            >
              {/* Scene Card */}
              <div className="bg-[#1A1A1A] border border-[#10B981]/20 rounded-xl p-6 hover:border-[#10B981]/40 transition-all duration-300 overflow-hidden">
                {/* Mood indicator */}
                <div className="absolute top-4 right-4 w-3 h-3 rounded-full" style={{ backgroundColor: lighting.primary }} />

                {/* Episode badge */}
                <div className="inline-block px-3 py-1 bg-[#10B981]/20 text-[#10B981] text-sm font-semibold rounded-full mb-4">
                  Episode {scene.episodeNumber}
                </div>

                {/* Scene title */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#10B981] transition-colors">
                  {scene.sceneTitle}
                </h3>

                {/* Scene preview */}
                <p className="text-white/80 text-sm leading-relaxed mb-4 line-clamp-3">
                  {scene.excerpt.substring(0, 150)}...
                </p>

                {/* Why it matters */}
                <div className="bg-[#121212] rounded-lg p-3">
                  <p className="text-[#10B981] text-sm font-semibold mb-1">Why It Matters:</p>
                  <p className="text-white/70 text-sm">{scene.whyItMatters}</p>
                </div>

                {/* Characters */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {scene.characters.slice(0, 3).map((character, charIdx) => (
                    <span
                      key={charIdx}
                      className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded-full"
                    >
                      {character}
                    </span>
                  ))}
                  {scene.characters.length > 3 && (
                    <span className="px-2 py-1 bg-white/10 text-white/60 text-xs rounded-full">
                      +{scene.characters.length - 3} more
                    </span>
                  )}
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#10B981]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          )
        })}
      </div>
    )
  }

  const renderTheaterMode = () => {
    if (!selectedScene) return null

    const lighting = getLightingColors(selectedScene.lightingPreset)
    const lines = selectedScene.excerpt.split('\n').filter(line => line.trim().length > 0)

    return (
      <div className="relative w-full h-full bg-black overflow-hidden">
        {/* Stage Lighting */}
        <div
          className="absolute inset-0 transition-all duration-1000"
          style={{
            background: `radial-gradient(ellipse at center, ${lighting.ambient} 0%, transparent 70%)`
          }}
        />

        {/* Curtains */}
        <AnimatePresence>
          {!curtainsOpen && (
            <>
              {/* Left Curtain */}
              <motion.div
                initial={{ x: 0 }}
                animate={{ x: 0 }}
                exit={{ x: '-50%' }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                className="absolute left-0 top-0 bottom-0 w-1/2 bg-gradient-to-r from-red-900 via-red-800 to-red-900 z-20"
                style={{
                  background: 'linear-gradient(90deg, #7F1D1D 0%, #991B1B 50%, #7F1D1D 100%)',
                  boxShadow: 'inset -10px 0 20px rgba(0,0,0,0.5)'
                }}
              >
                <div 
                  className="absolute inset-0 bg-repeat opacity-20"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext fill='rgba(255,255,255,0.1)' font-size='80' y='80'%3E🎭%3C/text%3E%3C/svg%3E")`
                  }}
                />
              </motion.div>

              {/* Right Curtain */}
              <motion.div
                initial={{ x: 0 }}
                animate={{ x: 0 }}
                exit={{ x: '50%' }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-red-900 via-red-800 to-red-900 z-20"
                style={{
                  background: 'linear-gradient(-90deg, #7F1D1D 0%, #991B1B 50%, #7F1D1D 100%)',
                  boxShadow: 'inset 10px 0 20px rgba(0,0,0,0.5)'
                }}
              >
                <div 
                  className="absolute inset-0 bg-repeat opacity-20"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext fill='rgba(255,255,255,0.1)' font-size='80' y='80'%3E🎭%3C/text%3E%3C/svg%3E")`
                  }}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Stage */}
        <AnimatePresence>
          {curtainsOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative z-10 h-full flex flex-col"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between p-6 bg-black/50 backdrop-blur-sm">
                <div>
                  <h2 className="text-2xl font-bold text-white">Episode {selectedScene.episodeNumber}</h2>
                  <p className="text-[#10B981]">{selectedScene.sceneTitle}</p>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setPerformanceMode('analysis')}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
                  >
                    🎬 Analysis View
                  </button>

                  <button
                    onClick={handleClosePerformance}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
                  >
                    ✕ Close
                  </button>
                </div>
              </div>

              {/* Performance Controls */}
              <div className="flex items-center justify-center space-x-4 p-4 bg-black/30">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    isPlaying
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-[#10B981] hover:bg-[#059669] text-white'
                  }`}
                >
                  {isPlaying ? '⏸️ Pause' : '▶️ Play Performance'}
                </button>

                <button
                  onClick={() => setCurrentLine(0)}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                >
                  🔄 Restart
                </button>
              </div>

              {/* Main Stage Area */}
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="max-w-4xl w-full">
                  {/* Scene Context */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                  >
                    <h3 className="text-lg font-semibold text-[#10B981] mb-2">Scene Context</h3>
                    <p className="text-white/80">{selectedScene.context}</p>
                  </motion.div>

                  {/* Script Performance */}
                  <div className="bg-black/50 backdrop-blur-sm rounded-lg p-8 border border-white/10">
                    <div className="space-y-4">
                      {lines.map((line, idx) => {
                        const isActive = isPlaying && idx === currentLine
                        const isCharacter = line.trim().match(/^[A-Z][A-Z\s]+:$/)
                        const isDialogue = !isCharacter && line.trim().length > 0 && !line.trim().startsWith('(')

                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0.3 }}
                            animate={{
                              opacity: isActive ? 1 : (idx < currentLine ? 0.7 : 0.3),
                              scale: isActive ? 1.02 : 1
                            }}
                            className={`transition-all duration-300 ${
                              isActive ? 'bg-white/10 rounded-lg p-3 -m-3' : ''
                            }`}
                          >
                            {isCharacter ? (
                              <div className="text-center mb-2">
                                <span className={`font-bold uppercase text-lg ${
                                  isActive ? 'text-[#10B981]' : 'text-white'
                                }`}>
                                  {line.replace(':', '')}
                                </span>
                              </div>
                            ) : isDialogue ? (
                              <div className="text-center max-w-md mx-auto">
                                <span className={`text-lg leading-relaxed italic ${
                                  isActive ? 'text-white' : 'text-white/80'
                                }`}>
                                  "{line.trim()}"
                                </span>
                              </div>
                            ) : (
                              <div className="text-center">
                                <span className={`text-sm italic ${
                                  isActive ? 'text-white/60' : 'text-white/40'
                                }`}>
                                  {line.trim()}
                                </span>
                              </div>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Why It Matters */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-8"
                  >
                    <h3 className="text-lg font-semibold text-[#10B981] mb-2">Why This Scene Matters</h3>
                    <p className="text-white/80 max-w-2xl mx-auto">{selectedScene.whyItMatters}</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  const renderAnalysisMode = () => {
    if (!selectedScene) return null

    const lines = selectedScene.excerpt.split('\n').filter(line => line.trim().length > 0)

    return (
      <div className="relative w-full h-full bg-[#0A0A0A] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-[#121212]/95 backdrop-blur-sm border-b border-[#10B981]/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Scene Analysis</h2>
              <p className="text-[#10B981]">Episode {selectedScene.episodeNumber} • {selectedScene.sceneTitle}</p>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setPerformanceMode('theater')}
                className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] rounded-lg text-white text-sm transition-colors"
              >
                🎭 Theater View
              </button>

              <button
                onClick={handleClosePerformance}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
              >
                ✕ Close
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-6xl mx-auto">
          {/* Scene Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Script with Analysis */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[#10B981] mb-4">Script Breakdown</h3>

              {lines.map((line, idx) => {
                const isCharacter = line.trim().match(/^[A-Z][A-Z\s]+:$/)
                const isDialogue = !isCharacter && line.trim().length > 0 && !line.trim().startsWith('(')

                return (
                  <div key={idx} className="bg-[#1A1A1A] border border-white/10 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      {/* Line number */}
                      <div className="text-white/50 text-sm font-mono w-8 flex-shrink-0">
                        {idx + 1}
                      </div>

                      {/* Script line */}
                      <div className="flex-1">
                        {isCharacter ? (
                          <div className="font-bold text-[#10B981] uppercase mb-1">
                            {line.replace(':', '')}
                          </div>
                        ) : isDialogue ? (
                          <div className="text-white italic">
                            "{line.trim()}"
                          </div>
                        ) : (
                          <div className="text-white/60 text-sm italic">
                            {line.trim()}
                          </div>
                        )}
                      </div>

                      {/* Analysis notes */}
                      <div className="w-32 flex-shrink-0 text-xs text-white/60">
                        {isCharacter && 'CHARACTER'}
                        {isDialogue && 'DIALOGUE'}
                        {!isCharacter && !isDialogue && line.trim().startsWith('(') && 'PARENTHETICAL'}
                        {!isCharacter && !isDialogue && !line.trim().startsWith('(') && 'ACTION'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Technical Analysis */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-[#10B981] mb-4">Technical Analysis</h3>

              {/* Shot breakdown */}
              <div className="bg-[#1A1A1A] border border-white/10 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">Estimated Shots</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Wide establishing:</span>
                    <span className="text-[#10B981]">1 shot</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Character close-ups:</span>
                    <span className="text-[#10B981]">{selectedScene.characters.length} shots</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Reaction shots:</span>
                    <span className="text-[#10B981]">{Math.max(1, selectedScene.characters.length - 1)} shots</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex justify-between font-semibold">
                    <span className="text-white">Total estimated:</span>
                    <span className="text-[#10B981]">
                      {2 + selectedScene.characters.length + Math.max(1, selectedScene.characters.length - 1)} shots
                    </span>
                  </div>
                </div>
              </div>

              {/* Director's notes */}
              <div className="bg-[#1A1A1A] border border-white/10 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3 flex items-center justify-between">
                  Director's Notes
                  <button
                    onClick={() => setShowDirectorNotes(!showDirectorNotes)}
                    className="text-[#10B981] text-sm hover:text-white transition-colors"
                  >
                    {showDirectorNotes ? 'Hide' : 'Show'}
                  </button>
                </h4>

                <AnimatePresence>
                  {showDirectorNotes && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-white/80 text-sm space-y-2"
                    >
                      <p>• <strong>Pacing:</strong> This scene should build tension gradually, peaking at the emotional revelation.</p>
                      <p>• <strong>Blocking:</strong> Characters should start distant and move closer as the conversation deepens.</p>
                      <p>• <strong>Performance:</strong> Focus on subtext - what's unsaid is as important as what's spoken.</p>
                      <p>• <strong>Visual style:</strong> {selectedScene.lightingPreset} lighting to enhance the {selectedScene.mood} mood.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Context and significance */}
              <div className="bg-[#1A1A1A] border border-white/10 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">Scene Significance</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-white/70 mb-1">Context:</p>
                    <p className="text-white/80">{selectedScene.context}</p>
                  </div>
                  <div>
                    <p className="text-white/70 mb-1">Why it matters:</p>
                    <p className="text-white/80">{selectedScene.whyItMatters}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#121212]/95 backdrop-blur-sm border-b border-[#10B981]/20 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#10B981]">Scene Theater</h1>
            <p className="text-sm text-white/70">Experience key scenes through performance and analysis</p>
          </div>

          {selectedScene && (
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setPerformanceMode(performanceMode === 'theater' ? 'analysis' : 'theater')}
                className="px-4 py-2 bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#10B981] rounded-lg text-sm transition-colors"
              >
                {performanceMode === 'theater' ? '🎬 Analysis Mode' : '🎭 Theater Mode'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div ref={sceneContainerRef} className="relative min-h-[calc(100vh-80px)]">
        <AnimatePresence mode="wait">
          {!selectedScene ? (
            <motion.div
              key="selector"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderSceneSelector()}
            </motion.div>
          ) : performanceMode === 'theater' ? (
            <motion.div
              key="theater"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              {renderTheaterMode()}
            </motion.div>
          ) : (
            <motion.div
              key="analysis"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              {renderAnalysisMode()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}