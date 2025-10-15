'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface EpisodeStudioProps {
  storyBible: any
  episodeNumber: number
  previousChoice?: string
}

interface VibeSettings {
  tone: number // 0-100: Dark/Gritty <---> Light/Comedic
  pacing: number // 0-100: Slow Burn <---> High Octane
  dialogueStyle: number // 0-100: Sparse/Subtextual <---> Snappy/Expository
}

interface BeatSheetGeneration {
  isGenerating: boolean
  error: string | null
  generatedBeats: string
}

interface ScriptGeneration {
  isGenerating: boolean
  error: string | null
}

export default function EpisodeStudio({ storyBible, episodeNumber, previousChoice }: EpisodeStudioProps) {
  const router = useRouter()
  
  // State management
  const [episodeGoal, setEpisodeGoal] = useState('')
  const [beatSheet, setBeatSheet] = useState('')
  const [directorsNotes, setDirectorsNotes] = useState('')
  const [vibeSettings, setVibeSettings] = useState<VibeSettings>({
    tone: 50,
    pacing: 50,
    dialogueStyle: 50
  })
  
  const [beatSheetGen, setBeatSheetGen] = useState<BeatSheetGeneration>({
    isGenerating: false,
    error: null,
    generatedBeats: ''
  })
  
  const [scriptGen, setScriptGen] = useState<ScriptGeneration>({
    isGenerating: false,
    error: null
  })

  // Director's Playbook modal state
  const [showPlaybook, setShowPlaybook] = useState(false)
  
  // Previous episode options for inspiration
  const [previousEpisodeOptions, setPreviousEpisodeOptions] = useState<any[]>([])
  const [showInspirationOptions, setShowInspirationOptions] = useState(false)

  // Story Bible Cheat Sheet
  const [showCheatSheet, setShowCheatSheet] = useState(true)

  // Check if "Write the Script" button should be enabled
  const canWriteScript = beatSheet.trim().length > 0 && !scriptGen.isGenerating

  // Function to collect edited scenes from previous episodes
  const getEditedScenesFromPreviousEpisodes = () => {
    if (episodeNumber <= 1) return []
    
    try {
      const savedEpisodes = localStorage.getItem('greenlit-episodes') || 
                           localStorage.getItem('scorched-episodes') || 
                           localStorage.getItem('reeled-episodes')
      
      if (!savedEpisodes) return []
      
      const episodes = JSON.parse(savedEpisodes)
      const editedScenes: any[] = []
      
      // Collect scenes from all previous episodes
      for (let i = 1; i < episodeNumber; i++) {
        if (episodes[i] && episodes[i].scenes) {
          episodes[i].scenes.forEach((scene: any, sceneIndex: number) => {
            // Check if this scene was edited (we'll add a flag when editing)
            if (scene._edited) {
              editedScenes.push({
                episodeNumber: i,
                sceneNumber: sceneIndex + 1,
                content: scene.content
              })
            }
          })
        }
      }
      
      return editedScenes
    } catch (error) {
      console.error('Error collecting edited scenes:', error)
      return []
    }
  }

  // Load previous episode options for inspiration
  useEffect(() => {
    if (episodeNumber > 1) {
      try {
        const savedEpisodes = localStorage.getItem('greenlit-episodes') || 
                            localStorage.getItem('scorched-episodes') || 
                            localStorage.getItem('reeled-episodes')
        
        if (savedEpisodes) {
          const episodes = JSON.parse(savedEpisodes)
          const prevEpisode = episodes[episodeNumber - 1]
          
          if (prevEpisode && prevEpisode.branchingOptions && Array.isArray(prevEpisode.branchingOptions)) {
            setPreviousEpisodeOptions(prevEpisode.branchingOptions)
          }
        }
      } catch (error) {
        console.error('Error loading previous episode options:', error)
      }
    }
  }, [episodeNumber])

  // STAGE 1: Generate Beat Sheet
  const handleGenerateBeatSheet = async () => {
    if (!episodeGoal.trim()) {
      alert('Please enter an episode goal first')
      return
    }

    setBeatSheetGen({ isGenerating: true, error: null, generatedBeats: '' })

    try {
      const response = await fetch('/api/generate/beat-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyBible,
          episodeNumber,
          episodeGoal: episodeGoal.trim(),
          previousChoice
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && data.beatSheet) {
        setBeatSheet(data.beatSheet)
        setBeatSheetGen({ isGenerating: false, error: null, generatedBeats: data.beatSheet })
      } else {
        throw new Error(data.error || 'Failed to generate beat sheet')
      }
    } catch (error) {
      console.error('Beat sheet generation error:', error)
      setBeatSheetGen({ 
        isGenerating: false, 
        error: error instanceof Error ? error.message : 'Failed to generate beat sheet',
        generatedBeats: ''
      })
    }
  }

  // STAGE 2: Generate Script
  const handleWriteScript = async () => {
    if (!beatSheet.trim()) {
      alert('Please generate or edit the beat sheet first')
      return
    }

    setScriptGen({ isGenerating: true, error: null })

    try {
      const response = await fetch('/api/generate/episode-from-beats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyBible,
          episodeNumber,
          beatSheet: beatSheet.trim(),
          vibeSettings,
          directorsNotes: directorsNotes.trim(),
          previousChoice,
          editedScenes: getEditedScenesFromPreviousEpisodes()
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && data.episode) {
        // Save episode to storage
        const savedEpisodes = localStorage.getItem('greenlit-episodes') || '{}'
        const episodes = JSON.parse(savedEpisodes)
        episodes[episodeNumber] = data.episode
        localStorage.setItem('greenlit-episodes', JSON.stringify(episodes))

        // Navigate to episode view
        router.push(`/episode/${episodeNumber}`)
      } else {
        throw new Error(data.error || 'Failed to generate script')
      }
    } catch (error) {
      console.error('Script generation error:', error)
      setScriptGen({ 
        isGenerating: false, 
        error: error instanceof Error ? error.message : 'Failed to generate script'
      })
    }
  }

  // SURPRISE ME: Generate beat sheet automatically, then create episode
  const handleSurpriseMe = async () => {
    // First, generate a beat sheet if we don't have one
    if (!beatSheet.trim()) {
      setBeatSheetGen({ isGenerating: true, error: null, generatedBeats: '' })
      
      try {
        const beatResponse = await fetch('/api/generate/beat-sheet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storyBible,
            episodeNumber,
            episodeGoal: episodeGoal.trim() || 'Create an exciting and engaging episode',
            previousChoice
          })
        })

        if (!beatResponse.ok) {
          throw new Error('Failed to generate beat sheet')
        }

        const beatData = await beatResponse.json()
        
        if (beatData.success && beatData.beatSheet) {
          setBeatSheet(beatData.beatSheet)
          setBeatSheetGen({ isGenerating: false, error: null, generatedBeats: beatData.beatSheet })
        } else {
          throw new Error(beatData.error || 'Failed to generate beat sheet')
        }
      } catch (error) {
        console.error('Beat sheet generation error:', error)
        setBeatSheetGen({ 
          isGenerating: false, 
          error: error instanceof Error ? error.message : 'Failed to generate beat sheet',
          generatedBeats: ''
        })
        return // Stop if beat sheet generation fails
      }
    }

    // Now generate the episode from the beat sheet (using the Director's Chair workflow)
    setScriptGen({ isGenerating: true, error: null })

    try {
      const response = await fetch('/api/generate/episode-from-beats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyBible,
          episodeNumber,
          beatSheet: beatSheet.trim() || beatSheetGen.generatedBeats,
          vibeSettings,
          directorsNotes: directorsNotes.trim() || 'Create an engaging, surprise episode with creative freedom',
          previousChoice,
          editedScenes: getEditedScenesFromPreviousEpisodes()
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && data.episode) {
        // Save episode to storage
        const savedEpisodes = localStorage.getItem('greenlit-episodes') || '{}'
        const episodes = JSON.parse(savedEpisodes)
        episodes[episodeNumber] = data.episode
        localStorage.setItem('greenlit-episodes', JSON.stringify(episodes))

        // Navigate to episode view
        router.push(`/episode/${episodeNumber}`)
      } else {
        throw new Error(data.error || 'Failed to generate surprise episode')
      }
    } catch (error) {
      console.error('Surprise episode generation error:', error)
      setScriptGen({ 
        isGenerating: false, 
        error: error instanceof Error ? error.message : 'Failed to generate surprise episode'
      })
    }
  }

  // Slider label helpers
  const getToneLabel = (value: number) => {
    if (value < 25) return 'Dark/Gritty'
    if (value < 75) return 'Balanced'
    return 'Light/Comedic'
  }

  const getPacingLabel = (value: number) => {
    if (value < 25) return 'Slow Burn'
    if (value < 75) return 'Steady'
    return 'High Octane'
  }

  const getDialogueLabel = (value: number) => {
    if (value < 25) return 'Sparse/Subtextual'
    if (value < 75) return 'Balanced'
    return 'Snappy/Expository'
  }

  return (
    <div className="min-h-screen bg-[rgb(18,18,18)] text-white">
      {/* Header */}
      <div className="border-b border-[#36393f] bg-[#1a1a1a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#00FF99] mb-2">Episode Studio</h1>
              <p className="text-[#e7e7e7]/70">
                Episode {episodeNumber} • {storyBible?.seriesTitle || 'Untitled Series'}
              </p>
              <button
                onClick={() => setShowPlaybook(true)}
                className="bg-gradient-to-r from-[#00FF99] to-[#00cc7a] text-black px-4 py-2 rounded-lg font-semibold text-sm hover:from-[#00cc7a] hover:to-[#00b366] transition-all duration-200 shadow-[0_0_15px_rgba(0,255,153,0.3)] hover:shadow-[0_0_20px_rgba(0,255,153,0.5)] mt-3"
              >
                📖 The Director's Playbook: How to Execute Your Vision
              </button>
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-[#e7e7e7]/70 hover:text-[#e7e7e7] transition-colors"
            >
              ← Back to Workspace
            </button>
          </div>
        </div>
      </div>

      {/* Story Bible Cheat Sheet - Fixed Sidebar */}
      <AnimatePresence>
        {showCheatSheet && storyBible && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="fixed left-0 top-0 h-screen w-80 bg-[#1a1a1a] border-r border-[#36393f] overflow-y-auto z-40 shadow-2xl"
          >
            <div className="p-6">
              {/* Header with close button */}
              <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#1a1a1a] pb-4 border-b border-[#36393f]">
                <h3 className="text-lg font-bold text-[#00FF99]">📖 Story Bible</h3>
                <button
                  onClick={() => setShowCheatSheet(false)}
                  className="text-[#e7e7e7]/50 hover:text-[#e7e7e7] transition-colors"
                  title="Hide cheat sheet"
                >
                  ✕
                </button>
              </div>

              {/* Series Title */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-[#00FF99]/70 mb-2">Series</h4>
                <p className="text-[#e7e7e7] font-bold text-lg">{storyBible.seriesTitle || 'Untitled'}</p>
              </div>

              {/* Premise */}
              {storyBible.premise && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-[#00FF99]/70 mb-2">Premise</h4>
                  <p className="text-[#e7e7e7]/80 text-sm">
                    {typeof storyBible.premise === 'string' 
                      ? storyBible.premise 
                      : storyBible.premise?.premise || storyBible.premise?.premiseStatement || 'N/A'}
                  </p>
                </div>
              )}

              {/* Characters */}
              {storyBible.mainCharacters && storyBible.mainCharacters.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-[#00FF99]/70 mb-2">
                    Characters ({storyBible.mainCharacters.length})
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {storyBible.mainCharacters.map((char: any, i: number) => (
                      <div key={i} className="bg-[#2a2a2a] rounded-lg p-3">
                        <p className="font-semibold text-[#00FF99] text-sm">{char.name}</p>
                        {char.premiseFunction && (
                          <p className="text-[#e7e7e7]/60 text-xs mt-1">{char.premiseFunction}</p>
                        )}
                        {char.psychology?.want && (
                          <p className="text-[#e7e7e7]/50 text-xs mt-1">
                            <span className="text-blue-400">Want:</span> {char.psychology.want}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* World Rules */}
              {storyBible.worldBuilding?.rules && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-[#00FF99]/70 mb-2">World Rules</h4>
                  <ul className="space-y-1 text-xs text-[#e7e7e7]/70">
                    {(Array.isArray(storyBible.worldBuilding.rules) 
                      ? storyBible.worldBuilding.rules 
                      : [storyBible.worldBuilding.rules]).slice(0, 5).map((rule: any, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#00FF99] mt-0.5">•</span>
                        <span>{typeof rule === 'string' ? rule : JSON.stringify(rule)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Current Arc */}
              {storyBible.narrativeArcs && storyBible.narrativeArcs.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-[#00FF99]/70 mb-2">Current Arc</h4>
                  {(() => {
                    // Find which arc this episode belongs to
                    let currentArc = storyBible.narrativeArcs[0]
                    for (const arc of storyBible.narrativeArcs) {
                      if (arc.episodes && arc.episodes.some((ep: any) => ep.number === episodeNumber)) {
                        currentArc = arc
                        break
                      }
                    }
                    return (
                      <div className="bg-[#2a2a2a] rounded-lg p-3">
                        <p className="font-semibold text-[#00FF99] text-sm">{currentArc.title}</p>
                        <p className="text-[#e7e7e7]/60 text-xs mt-1">{currentArc.summary}</p>
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* Quick Link to Full Bible */}
              <div className="mt-6 pt-4 border-t border-[#36393f]">
                <button
                  onClick={() => router.push('/story-bible')}
                  className="w-full px-4 py-2 bg-[#00FF99]/10 hover:bg-[#00FF99]/20 text-[#00FF99] rounded-lg text-sm font-semibold transition-colors border border-[#00FF99]/30"
                >
                  View Full Story Bible →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button when cheat sheet is hidden */}
      {!showCheatSheet && (
        <button
          onClick={() => setShowCheatSheet(true)}
          className="fixed left-0 top-1/2 -translate-y-1/2 bg-[#00FF99] text-black px-3 py-6 rounded-r-lg font-bold text-sm shadow-lg hover:px-4 transition-all z-40"
          title="Show story bible cheat sheet"
        >
          📖
        </button>
      )}

      {/* Main Content - Adjust margin when cheat sheet is open */}
      <div className={`max-w-7xl mx-auto px-6 py-8 transition-all duration-300 ${showCheatSheet ? 'ml-80' : 'ml-0'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* COLUMN 1: THE BLUEPRINT (Structure) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="card">
              <h2 className="text-xl font-bold text-[#00FF99] mb-4">
                📋 The Blueprint
              </h2>
              <p className="text-[#e7e7e7]/70 mb-6">
                Define the structure and narrative foundation for your episode.
              </p>

              {/* Episode Goal Input */}
              <div className="mb-6">
                <label htmlFor="episodeGoal" className="block text-sm font-medium text-[#e2c376] mb-2">
                  Episode Goal: What must happen in this episode?
                </label>
                <textarea
                  id="episodeGoal"
                  rows={4}
                  className="input-field"
                  placeholder="Define the key narrative goal, character development, or plot advancement that must occur..."
                  value={episodeGoal}
                  onChange={(e) => setEpisodeGoal(e.target.value)}
                  disabled={beatSheetGen.isGenerating}
                />
              </div>

              {/* Generate Beat Sheet Button */}
              <button
                onClick={handleGenerateBeatSheet}
                disabled={!episodeGoal.trim() || beatSheetGen.isGenerating}
                className="btn-primary mb-6 w-full border border-[#00FF99] bg-transparent text-[#00FF99] hover:bg-[#00FF99] hover:text-black transition-all"
              >
                {beatSheetGen.isGenerating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Generating Beat Sheet...
                  </div>
                ) : (
                  'Generate Beat Sheet'
                )}
              </button>

              {/* Error Display */}
              {beatSheetGen.error && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{beatSheetGen.error}</p>
                </div>
              )}

              {/* AI Beat Sheet Editor */}
              <div>
                <label htmlFor="beatSheet" className="block text-sm font-medium text-[#e2c376] mb-2">
                  AI Beat Sheet (Editable):
                </label>
                <textarea
                  id="beatSheet"
                  rows={12}
                  className="input-field font-mono text-sm"
                  placeholder="Generated beat sheet will appear here. You can edit it as needed..."
                  value={beatSheet}
                  onChange={(e) => setBeatSheet(e.target.value)}
                  disabled={beatSheetGen.isGenerating}
                />
                <p className="text-xs text-[#e7e7e7]/50 mt-1">
                  Edit the generated beats to perfect your episode structure.
                </p>
              </div>
            </div>
          </motion.div>

          {/* COLUMN 2: THE DIRECTOR'S CHAIR (Vibe & Soul) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="card">
              <h2 className="text-xl font-bold text-[#00FF99] mb-4">
                🎬 The Director's Chair
              </h2>
              <p className="text-[#e7e7e7]/70 mb-6">
                Shape the vibe, tone, and soul of your episode.
              </p>

              {/* Vibe Check Sliders */}
              <div className="space-y-6 mb-8">
                <h3 className="text-lg font-semibold text-[#e2c376]">Vibe Check</h3>
                
                {/* Tone Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Tone</label>
                    <span className="text-xs text-[#00FF99]">{getToneLabel(vibeSettings.tone)}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={vibeSettings.tone}
                      onChange={(e) => setVibeSettings({ ...vibeSettings, tone: parseInt(e.target.value) })}
                      className="w-full h-2 bg-[#36393f] rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-[#e7e7e7]/50 mt-1">
                      <span>Dark/Gritty</span>
                      <span>Light/Comedic</span>
                    </div>
                  </div>
                </div>

                {/* Pacing Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Pacing</label>
                    <span className="text-xs text-[#00FF99]">{getPacingLabel(vibeSettings.pacing)}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={vibeSettings.pacing}
                      onChange={(e) => setVibeSettings({ ...vibeSettings, pacing: parseInt(e.target.value) })}
                      className="w-full h-2 bg-[#36393f] rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-[#e7e7e7]/50 mt-1">
                      <span>Slow Burn</span>
                      <span>High Octane</span>
                    </div>
                  </div>
                </div>

                {/* Dialogue Style Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Dialogue Style</label>
                    <span className="text-xs text-[#00FF99]">{getDialogueLabel(vibeSettings.dialogueStyle)}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={vibeSettings.dialogueStyle}
                      onChange={(e) => setVibeSettings({ ...vibeSettings, dialogueStyle: parseInt(e.target.value) })}
                      className="w-full h-2 bg-[#36393f] rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-[#e7e7e7]/50 mt-1">
                      <span>Sparse/Subtextual</span>
                      <span>Snappy/Expository</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Director's Notes */}
              <div className="mb-8">
                <label htmlFor="directorsNotes" className="block text-sm font-medium text-[#e2c376] mb-2">
                  Director's Notes (Subtext, Specifics, Sensory Details):
                </label>
                <textarea
                  id="directorsNotes"
                  rows={6}
                  className="input-field"
                  placeholder="Add specific directorial vision, subtext guidance, atmosphere details, visual motifs, or any other creative notes..."
                  value={directorsNotes}
                  onChange={(e) => setDirectorsNotes(e.target.value)}
                />
              </div>

              {/* Write the Script Button */}
              <button
                onClick={handleWriteScript}
                disabled={!canWriteScript}
                className={`btn-primary w-full text-lg font-semibold py-4 transition-all mb-4 ${
                  canWriteScript 
                    ? 'bg-[#00FF99] text-black hover:bg-[#00cc7a] shadow-[0_0_20px_rgba(0,255,153,0.3)]' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                {scriptGen.isGenerating ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                    Writing the Script...
                  </div>
                ) : (
                  '🎬 Write the Script'
                )}
              </button>

              {/* Previous Episode Options or Surprise Me Button */}
              {episodeNumber > 1 && previousEpisodeOptions.length > 0 ? (
                <button
                  onClick={() => setShowInspirationOptions(true)}
                  disabled={scriptGen.isGenerating || beatSheetGen.isGenerating}
                  className="btn-primary w-full text-lg font-semibold py-4 transition-all bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-2 border-blue-400 hover:border-purple-400 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.4)]"
                >
                  💡 Inspirations
                </button>
              ) : (
                <button
                  onClick={handleSurpriseMe}
                  disabled={scriptGen.isGenerating || beatSheetGen.isGenerating}
                  className="btn-primary w-full text-lg font-semibold py-4 transition-all bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-2 border-purple-400 hover:border-pink-400 shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(219,39,119,0.4)]"
                >
                  {scriptGen.isGenerating ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                      Creating Magic...
                    </div>
                  ) : (
                    '✨ Surprise Me! (Skip Planning)'
                  )}
                </button>
              )}

              {/* Script Generation Error */}
              {scriptGen.error && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{scriptGen.error}</p>
                </div>
              )}

              {/* Help Text */}
              {!canWriteScript && !scriptGen.isGenerating && (
                <div className="text-xs text-[#e7e7e7]/50 mt-4 text-center space-y-1">
                  <p>Generate and review your beat sheet before writing the script</p>
                  <p className="text-purple-400">...or hit "Surprise Me!" to skip planning entirely</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Director's Playbook Modal */}
      {showPlaybook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-[#36393f] rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
            {/* Modal Header */}
            <div className="border-b border-[#36393f] p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#00FF99]">📖 The Director's Playbook: Executing Your Vision</h2>
              <button
                onClick={() => setShowPlaybook(false)}
                className="text-[#e7e7e7]/70 hover:text-[#e7e7e7] text-2xl transition-colors"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 text-[#e7e7e7]">
              {/* Intro */}
              <div className="bg-[#2a2a2a] border border-[#36393f] rounded-lg p-4">
                <p className="text-lg leading-relaxed">
                  Welcome to the Director's Chair. The Story Bible is the map, but the Episode Studio is where you drive. 
                  This is where you control the pacing, the tone, and the soul of your episode. The Auteur Engine is powerful, 
                  but it follows your lead.
                </p>
              </div>

              {/* Mastering the Episode Studio Workflow */}
              <div className="space-y-5">
                <h3 className="text-xl font-bold text-[#00FF99] border-b border-[#36393f] pb-2">
                  Mastering the Episode Studio Workflow
                </h3>

                {/* Episode Goal */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-white">1. Episode Goal (The Objective)</h4>
                  <p className="text-[#e7e7e7]/90">
                    <strong className="text-[#00FF99]">The Tactic:</strong> Define the main objective for this 3-5 minute episode. 
                    Keep it laser-focused. (e.g., "Character A must hide the secret, but Character B gets suspicious and confronts them.")
                  </p>
                </div>

                {/* Beat Sheet */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">2. The Beat Sheet (The Blueprint - CRITICAL STEP)</h4>
                  <p className="text-[#e7e7e7]/90">
                    <strong className="text-[#00FF99]">The Tactic:</strong> The Architect Engine generates a beat sheet - think of it as a 
                    detailed outline that breaks your episode into 3-6 story moments (beats). Each beat is a mini-scene with purpose.
                  </p>
                  
                  {/* What IS a Beat Sheet */}
                  <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
                    <h5 className="font-semibold text-blue-400 mb-2">🤔 What the hell is a "beat"?</h5>
                    <p className="text-sm text-[#e7e7e7]/90 mb-3">
                      A <strong>"beat"</strong> is one story moment - like a scene in a play. Your episode is made of 3-6 beats total.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div><strong className="text-white">Beat 1:</strong> Character A discovers the secret</div>
                      <div><strong className="text-white">Beat 2:</strong> Character B gets suspicious and starts investigating</div>
                      <div><strong className="text-white">Beat 3:</strong> The confrontation - B confronts A directly</div>
                      <div><strong className="text-white">Beat 4:</strong> The aftermath - how it changes their relationship</div>
                    </div>
                    <p className="text-xs text-blue-300 mt-2">Think: Beginning → Rising tension → Climax → Resolution</p>
                  </div>

                  {/* Why Edit It */}
                  <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-lg">
                    <h5 className="font-semibold text-yellow-400 mb-2">⚠️ Why you MUST edit the generated beat sheet:</h5>
                    <ul className="text-sm text-[#e7e7e7]/90 space-y-1 list-disc list-inside">
                      <li>The AI gives you a <strong>generic template</strong> - make it specific to YOUR story</li>
                      <li>Add <strong>concrete actions</strong> instead of vague descriptions</li>
                      <li>Remove beats that feel unnecessary or weak</li>
                      <li>Reorder beats if the flow feels wrong</li>
                      <li>This is your <strong>last chance</strong> to fix the story structure before scripting</li>
                    </ul>
                  </div>

                  {/* How to Edit */}
                  <div className="bg-[#2a2a2a] border-l-4 border-[#00FF99] p-4 space-y-3">
                    <h5 className="font-semibold text-[#00FF99] mb-2">✂️ How to edit like a pro:</h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-red-900/20 border border-red-500/30 p-3 rounded">
                        <div className="text-red-400 font-semibold mb-2">❌ Vague (AI-generated):</div>
                        <div className="text-sm">"They have an argument about trust"</div>
                      </div>
                      <div className="bg-green-900/20 border border-green-500/30 p-3 rounded">
                        <div className="text-green-400 font-semibold mb-2">✅ Specific (Your edit):</div>
                        <div className="text-sm">"Maya confronts Jake about the photos. He lies, but accidentally calls her by her sister's name - revealing he's been watching them both."</div>
                      </div>
                    </div>

                    <div className="bg-[#1a1a1a] p-3 rounded mt-3">
                      <h6 className="font-semibold text-white mb-2">Quick editing checklist:</h6>
                      <ul className="text-xs text-[#e7e7e7]/80 space-y-1">
                        <li>• Does each beat have a clear PURPOSE? (advance plot, reveal character, build tension)</li>
                        <li>• Are the actions SPECIFIC? (not "they fight" but "she throws his keys in the trash")</li>
                        <li>• Does the order make EMOTIONAL sense? (build to the biggest moment)</li>
                        <li>• Do you have 3-6 beats total? (3 = tight, 6 = detailed)</li>
                      </ul>
                    </div>
                  </div>

                  {/* The Stakes */}
                  <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
                    <h5 className="font-semibold text-red-400 mb-2">🎯 Why this matters:</h5>
                    <p className="text-sm text-[#e7e7e7]/90">
                      The beat sheet IS your episode structure. Once you hit "Write the Script," the AI follows this blueprint religiously. 
                      <strong className="text-white"> If the beat sheet is boring, your episode will be boring.</strong> 
                      If it's confusing, your episode will be confusing. This is your power moment - use it.
                    </p>
                  </div>

                  {/* Pro Tips */}
                  <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-lg">
                    <h5 className="font-semibold text-purple-400 mb-2">💡 Pro editing tips:</h5>
                    <div className="space-y-3 text-sm">
                      <div>
                        <strong className="text-white">Start with emotion:</strong> What should the audience FEEL in each beat? 
                        Nervous? Excited? Heartbroken? Lead with that, then add the action.
                      </div>
                      <div>
                        <strong className="text-white">Use the "But/Therefore" test:</strong> Each beat should connect with "but" or "therefore." 
                        "Maya finds the photos, BUT Jake denies everything, THEREFORE she starts investigating his computer..."
                      </div>
                      <div>
                        <strong className="text-white">Add stakes to every beat:</strong> What does the character risk losing in this moment? 
                        Their relationship? Their secret? Their dignity? Make it clear.
                      </div>
                      <div>
                        <strong className="text-white">Think in movie moments:</strong> If this was a movie trailer, which beats would they show? 
                        Those are your most important ones - make them pop.
                      </div>
                    </div>
                  </div>

                  {/* Example Transformation */}
                  <div className="bg-[#2a2a2a] border border-[#36393f] p-4 rounded-lg">
                    <h5 className="font-semibold text-[#00FF99] mb-3">📝 Real example transformation:</h5>
                    
                    <div className="space-y-4">
                      <div className="bg-red-900/20 border border-red-500/30 p-3 rounded">
                        <div className="text-red-400 font-semibold mb-2">❌ AI-Generated Beat Sheet (Boring):</div>
                        <div className="text-xs space-y-1">
                          <div><strong>Beat 1:</strong> Sarah discovers something suspicious</div>
                          <div><strong>Beat 2:</strong> She investigates further</div>
                          <div><strong>Beat 3:</strong> Confrontation with the other character</div>
                          <div><strong>Beat 4:</strong> Resolution of the conflict</div>
                        </div>
                      </div>
                      
                      <div className="bg-green-900/20 border border-green-500/30 p-3 rounded">
                        <div className="text-green-400 font-semibold mb-2">✅ Your Edited Version (Compelling):</div>
                        <div className="text-xs space-y-1">
                          <div><strong>Beat 1:</strong> Sarah finds Marcus's phone unlocked - sees texts from "Baby ❤️" but she's right there. Her stomach drops.</div>
                          <div><strong>Beat 2:</strong> She pretends everything's normal while secretly checking the bathroom mirror he installed. She discovers it's two-way glass.</div>
                          <div><strong>Beat 3:</strong> Marcus catches her with a screwdriver, dismantling the mirror. He doesn't deny it - just asks "How long have you known?"</div>
                          <div><strong>Beat 4:</strong> Sarah's escape attempt fails. The door was already locked. Marcus reveals this was all a test - and she failed.</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-[#1a1a1a] p-3 rounded mt-3">
                      <p className="text-xs text-[#e7e7e7]/80">
                        <strong className="text-[#00FF99]">See the difference?</strong> Same basic story structure, but the edited version has 
                        specific actions, emotional stakes, and concrete details that create tension. This is what turns a generic episode into compelling content.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vibe Check Sliders */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-white">3. Vibe Check Sliders (The Tone & Pacing)</h4>
                  <p className="text-[#e7e7e7]/90">
                    <strong className="text-[#00FF99]">The Tactic:</strong> Use these to define the atmosphere and rhythm.
                  </p>
                  <div className="bg-[#2a2a2a] p-4 space-y-3">
                    <div>
                      <strong className="text-yellow-400">Tense Confrontation?</strong> Set Tone to "Dark/Gritty," 
                      Pacing to "Slow Burn," and Dialogue to "Sparse/Subtextual."
                    </div>
                    <div>
                      <strong className="text-yellow-400">Comedic Fight?</strong> Set Tone to "Light/Comedic," 
                      Pacing to "High Octane," and Dialogue to "Snappy/Expository."
                    </div>
                    <div className="text-[#00FF99] font-semibold">
                      Pro Tip: The AI heavily weights these settings. Use them deliberately.
                    </div>
                  </div>
                </div>

                {/* Director's Notes */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-white">4. Director's Notes (The Soul - MOST IMPORTANT)</h4>
                  <p className="text-[#e7e7e7]/90">
                    <strong className="text-[#00FF99]">The Tactic:</strong> This is where you inject the magic, the nuance, 
                    and the artistry. The Auteur Engine prioritizes these notes above everything else. This is how you avoid generic output.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="bg-[#2a2a2a] border-l-4 border-blue-400 p-4">
                      <strong className="text-blue-400">Focus on Subtext (The unspoken):</strong> What are characters thinking but not saying? 
                      What are their hidden motivations?
                      <div className="mt-2 p-3 bg-[#1a1a1a] rounded text-sm">
                        <strong>Example:</strong> "She says she forgives him, but her body language is closed off. 
                        She's lying, and he knows it, but neither is admitting it."
                      </div>
                    </div>

                    <div className="bg-[#2a2a2a] border-l-4 border-purple-400 p-4">
                      <strong className="text-purple-400">Focus on Sensory Details (The atmosphere):</strong> Specific sights or sounds 
                      that define the mood.
                      <div className="mt-2 p-3 bg-[#1a1a1a] rounded text-sm">
                        <strong>Example:</strong> "Focus on the sound of the heavy rain outside," "The awkward silence is deafening," 
                        "The flickering neon light makes everyone look guilty."
                      </div>
                    </div>
                  </div>

                  {/* Applying the Notes Examples */}
                  <div className="mt-4">
                    <h5 className="font-semibold text-white mb-3">Applying the Notes:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-red-900/20 border border-red-500/30 p-4 rounded">
                        <div className="text-red-400 font-semibold mb-2">❌ Mid Input:</div>
                        <div className="text-sm">"Make the scene intense and sad."</div>
                      </div>
                      <div className="bg-green-900/20 border border-green-500/30 p-4 rounded">
                        <div className="text-green-400 font-semibold mb-2">✨ S-Tier Input:</div>
                        <div className="text-sm">"The tension is unbearable. They are speaking quietly but viciously. 
                        Focus on the ticking clock on the wall. Character A is trying desperately not to cry, but a single tear escapes."</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Case Studies */}
              <div className="space-y-5">
                <h3 className="text-xl font-bold text-[#00FF99] border-b border-[#36393f] pb-2">
                  Case Studies: Director's Notes in Action
                </h3>

                {/* Case 1 */}
                <div className="bg-[#2a2a2a] border border-[#36393f] rounded-lg p-5">
                  <h4 className="text-lg font-semibold text-yellow-400 mb-2">Case 1: High School Drama ("The Burn List")</h4>
                  <p className="text-white mb-2"><strong>Scene Goal:</strong> Maya realizes her anonymous account has gone too far.</p>
                  <div className="bg-[#1a1a1a] p-3 rounded border-l-4 border-yellow-400">
                    <strong className="text-yellow-400">Director's Notes:</strong> "The vibe is paranoid and manic. Focus on the harsh blue light 
                    from the phone screen reflecting in her eyes. When she sees the devastating comment, the sound cuts out – pure panic. 
                    She is disgusted with herself but addicted to the power."
                  </div>
                </div>

                {/* Case 2 */}
                <div className="bg-[#2a2a2a] border border-[#36393f] rounded-lg p-5">
                  <h4 className="text-lg font-semibold text-pink-400 mb-2">Case 2: Office Rom-Com ("Terms of Service")</h4>
                  <p className="text-white mb-2"><strong>Scene Goal:</strong> The cynical rep tries to flirt with the optimistic HR manager 
                  during a terrible wellness seminar.</p>
                  <div className="bg-[#1a1a1a] p-3 rounded border-l-4 border-pink-400">
                    <strong className="text-pink-400">Director's Notes:</strong> "Maximum cringe comedy. The wellness guru is overly sincere and ridiculous. 
                    The Rep keeps looking directly at the camera (fourth wall break) after every failed attempt to flirt. 
                    The HR manager is totally oblivious but kind."
                  </div>
                </div>

                {/* Case 3 */}
                <div className="bg-[#2a2a2a] border border-[#36393f] rounded-lg p-5">
                  <h4 className="text-lg font-semibold text-red-400 mb-2">Case 3: Grounded Thriller ("Echo Chamber")</h4>
                  <p className="text-white mb-2"><strong>Scene Goal:</strong> The Podcaster realizes the voice on the other end is manipulative.</p>
                  <div className="bg-[#1a1a1a] p-3 rounded border-l-4 border-red-400">
                    <strong className="text-red-400">Director's Notes:</strong> "The tone is claustrophobic and terrifying. Everything happens within 
                    the recording booth. Focus on the sound design – the static, the slight delay in the Partner's voice. 
                    The Partner's voice is perfectly calm and loving, which is what makes it so sinister."
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="text-center pt-4 border-t border-[#36393f]">
                <button
                  onClick={() => setShowPlaybook(false)}
                  className="btn-primary bg-[#00FF99] text-black px-6 py-3 rounded-lg hover:bg-[#00cc7a] transition-colors"
                >
                  Got it! Let's Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Previous Episode Inspiration Options Modal */}
      {showInspirationOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-[#36393f] rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
            {/* Modal Header */}
            <div className="border-b border-[#36393f] p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#00FF99]">💡 Previous Episode Inspiration</h2>
              <button
                onClick={() => setShowInspirationOptions(false)}
                className="text-[#e7e7e7]/70 hover:text-[#e7e7e7] text-2xl transition-colors"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 text-[#e7e7e7]">
              <div className="bg-[#2a2a2a] border border-[#36393f] rounded-lg p-4">
                <p className="text-lg leading-relaxed">
                  Choose one of the three options from Episode {episodeNumber - 1} to continue your story. 
                  The AI will analyze your choice and automatically configure all settings, then generate a beat sheet for you to review and edit.
                </p>
              </div>

              {/* Previous Episode Options */}
              <div className="space-y-4">
                {previousEpisodeOptions.map((option, index) => (
                  <button
                    key={option.id || index}
                    onClick={async () => {
                      try {
                        // Show loading state
                        setShowInspirationOptions(false)
                        
                        // Call AI to analyze the choice
                        const response = await fetch('/api/analyze-choice', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            choiceText: option.text,
                            choiceDescription: option.description,
                            storyBible,
                            episodeNumber
                          })
                        })

                        if (!response.ok) {
                          throw new Error('Failed to analyze choice')
                        }

                        const data = await response.json()
                        
                        if (data.success && data.analysis) {
                          const analysis = data.analysis
                          
                          // Fill all form fields with AI analysis
                          setEpisodeGoal(analysis.episodeGoal || option.text)
                          
                          if (analysis.vibeSettings) {
                            setVibeSettings({
                              tone: analysis.vibeSettings.tone || 50,
                              pacing: analysis.vibeSettings.pacing || 50,
                              dialogueStyle: analysis.vibeSettings.dialogueStyle || 50
                            })
                          }
                          
                          setDirectorsNotes(analysis.directorsNotes || `Building on: "${option.text}"`)
                          
                          // Automatically generate beat sheet after AI analysis
                          setTimeout(() => {
                            handleGenerateBeatSheet()
                          }, 500) // Small delay to ensure state is updated
                        } else {
                          // Fallback to simple fill if AI analysis fails
                          setEpisodeGoal(option.text)
                          setDirectorsNotes(`Building on: "${option.text}"\n\n${option.description}`)
                          
                          // Still generate beat sheet for fallback
                          setTimeout(() => {
                            handleGenerateBeatSheet()
                          }, 500)
                        }
                      } catch (error) {
                        console.error('Error analyzing choice:', error)
                        // Fallback to simple fill
                        setEpisodeGoal(option.text)
                        setDirectorsNotes(`Building on: "${option.text}"\n\n${option.description}`)
                        
                        // Still generate beat sheet for error fallback
                        setTimeout(() => {
                          handleGenerateBeatSheet()
                        }, 500)
                      }
                    }}
                    className="w-full text-left bg-[#2a2a2a] border border-[#36393f] rounded-lg p-5 hover:bg-[#36393f] hover:border-[#00FF99]/50 transition-all duration-200 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#00FF99]/20 text-[#00FF99] flex items-center justify-center font-bold flex-shrink-0 group-hover:bg-[#00FF99]/30 transition-colors">
                        {option.id || index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-[#00FF99] transition-colors">{option.text}</h4>
                        <p className="text-[#e7e7e7]/80">{option.description}</p>
                      </div>
                      <div className="text-[#00FF99] opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Close Button */}
              <div className="text-center pt-4 border-t border-[#36393f]">
                <button
                  onClick={() => setShowInspirationOptions(false)}
                  className="btn-primary bg-[#2a2a2a] text-[#e7e7e7] px-6 py-3 rounded-lg hover:bg-[#36393f] transition-colors border border-[#36393f]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for sliders */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #00FF99;
          cursor: pointer;
          border: 2px solid #1a1a1a;
          box-shadow: 0 0 10px rgba(0, 255, 153, 0.3);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #00FF99;
          cursor: pointer;
          border: 2px solid #1a1a1a;
          box-shadow: 0 0 10px rgba(0, 255, 153, 0.3);
        }
        
        .slider::-webkit-slider-track {
          background: linear-gradient(to right, 
            rgba(255, 255, 255, 0.1) 0%, 
            rgba(0, 255, 153, 0.3) var(--slider-value, 50%), 
            rgba(255, 255, 255, 0.1) var(--slider-value, 50%)
          );
        }
      `}</style>
    </div>
  )
}
