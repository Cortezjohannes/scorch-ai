'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PremiseEngine } from '@/services/premise-engine'
import { Character3DEngine } from '@/services/character-engine'
import { FractalNarrativeEngine } from '@/services/fractal-narrative-engine'
import { LivingWorldEngine, WorldState, ActiveCharacter, WorldLocation, CharacterIntroduction, CharacterDeparture, LocationEvolution } from '@/services/living-world-engine'

export function LivingWorldDemo() {
  const [worldState, setWorldState] = useState<WorldState | null>(null)
  const [selectedEpisode, setSelectedEpisode] = useState(1)
  const [selectedCharacter, setSelectedCharacter] = useState<ActiveCharacter | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<WorldLocation | null>(null)
  const [activeView, setActiveView] = useState<'overview' | 'characters' | 'locations' | 'timeline'>('overview')
  const [isGenerating, setIsGenerating] = useState(false)
  const [evolutionHistory, setEvolutionHistory] = useState<any[]>([])

  const generateLivingWorld = async () => {
    setIsGenerating(true)
    
    try {
      // Generate story foundation
      const premise = PremiseEngine.generatePremise(
        'transformation',
        'A dying industrial town must reinvent itself when a mysterious energy source is discovered, but the change threatens to destroy the community bonds that hold it together.'
      )
      
      // Generate initial characters
      const protagonist = Character3DEngine.generateProtagonist(premise, PremiseEngine.expandToEquation(premise, 'transformation story'), 'industrial town transformation')
      const antagonist = Character3DEngine.generateAntagonist(premise, PremiseEngine.expandToEquation(premise, 'transformation story'), protagonist)
      const catalyst = Character3DEngine.generateSupportingCharacter('catalyst', premise, [protagonist, antagonist], ['change catalyst'])
      
      // Generate narrative arc
      const arc = FractalNarrativeEngine.generateNarrativeArc(premise, [protagonist, antagonist, catalyst], 3, 12)
      
      // Create initial locations
      const startingLocations = generateInitialLocations(premise)
      
      // Initialize living world
      const initialState = LivingWorldEngine.initializeWorldState(
        premise,
        [protagonist, antagonist, catalyst],
        arc,
        startingLocations
      )
      
      setWorldState(initialState)
      setEvolutionHistory([initialState])
      
    } catch (error) {
      console.error('Error generating living world:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const evolveToEpisode = async (targetEpisode: number) => {
    if (!worldState) return
    
    try {
      // Simulate evolution to target episode
      const narrativeRequirements = generateNarrativeRequirements(targetEpisode)
      
      const evolvedState = LivingWorldEngine.evolveWorldForEpisode(
        worldState,
        targetEpisode,
        worldState.activeCharacters[0]?.character ? 
          PremiseEngine.generatePremise('transformation', 'community transformation story') : 
          worldState.activeCharacters[0]?.character as any,
        narrativeRequirements
      )
      
      setWorldState(evolvedState)
      setEvolutionHistory(prev => [...prev, evolvedState])
      setSelectedEpisode(targetEpisode)
      
    } catch (error) {
      console.error('Error evolving world:', error)
    }
  }

  const generateInitialLocations = (premise: any): WorldLocation[] => [
    {
      id: 'town-square',
      name: 'Town Square',
      type: { category: 'public', characteristics: ['gathering place', 'symbolic center'] },
      description: 'A weathered square with empty storefronts and a cracked fountain, reflecting the town\'s decline.',
      atmosphere: { mood: 'melancholic', tension: 3, energy: 'low' },
      significance: { narrativeImportance: 9, premiseRelevance: 8, characterAttachment: ['protagonist'] },
      evolutionHistory: [],
      currentPhase: { current: 'decline', duration: 5, nextPhase: 'renovation' },
      narrativeRole: { function: 'community heart', premiseService: 'shows transformation progress' },
      premiseReflection: 'Physical decay mirrors community bonds',
      activeCharacters: [],
      keyEvents: []
    },
    {
      id: 'old-factory',
      name: 'Abandoned Steel Mill',
      type: { category: 'industrial', characteristics: ['abandoned', 'dangerous', 'symbolic'] },
      description: 'Rusted machinery and broken windows tell the story of better times.',
      atmosphere: { mood: 'haunting', tension: 6, energy: 'stagnant' },
      significance: { narrativeImportance: 8, premiseRelevance: 9, characterAttachment: ['antagonist'] },
      evolutionHistory: [],
      currentPhase: { current: 'abandoned', duration: 10, nextPhase: 'discovery' },
      narrativeRole: { function: 'past symbol', premiseService: 'represents old way of life' },
      premiseReflection: 'Death of industry that defined the community',
      activeCharacters: [],
      keyEvents: []
    },
    {
      id: 'community-center',
      name: 'Community Center',
      type: { category: 'social', characteristics: ['meeting place', 'adaptive'] },
      description: 'A multi-purpose building that serves as the town\'s social hub.',
      atmosphere: { mood: 'hopeful', tension: 4, energy: 'moderate' },
      significance: { narrativeImportance: 7, premiseRelevance: 8, characterAttachment: ['catalyst'] },
      evolutionHistory: [],
      currentPhase: { current: 'active', duration: 3, nextPhase: 'expansion' },
      narrativeRole: { function: 'gathering point', premiseService: 'where community bonds are tested' },
      premiseReflection: 'Space where transformation discussions happen',
      activeCharacters: [],
      keyEvents: []
    }
  ]

  const generateNarrativeRequirements = (episode: number) => [
    {
      type: 'character-development',
      description: `Episode ${episode} character growth`,
      priority: 8
    },
    {
      type: 'premise-testing',
      description: 'Test community vs change tension',
      priority: 9
    }
  ]

  const getCharacterStatusColor = (status: string) => {
    const colors = {
      'active': 'bg-green-600',
      'dormant': 'bg-yellow-600',
      'departed': 'bg-red-600',
      'potential': 'bg-blue-600'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-600'
  }

  const getLocationPhaseColor = (phase: string) => {
    const colors = {
      'decline': 'bg-red-600',
      'stagnant': 'bg-gray-600',
      'discovery': 'bg-yellow-600',
      'renovation': 'bg-blue-600',
      'active': 'bg-green-600',
      'expansion': 'bg-purple-600'
    }
    return colors[phase as keyof typeof colors] || 'bg-gray-600'
  }

  const getEvolutionIcon = (type: string) => {
    const icons = {
      'character-introduction': '👋',
      'character-departure': '👋',
      'location-evolution': '🏗️',
      'premise-testing': '⚖️',
      'world-event': '⚡'
    }
    return icons[type as keyof typeof icons] || '📝'
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6 mb-8">
      <h3 className="text-xl font-bold text-[#e2c376] mb-4">🌍 Living World Engine Demo</h3>
      <p className="text-[#e7e7e7]/70 mb-6">
        Experience dynamic narrative evolution where characters are introduced when needed, locations evolve naturally, 
        and the world adapts to serve the premise - creating truly living stories.
      </p>
      
      <button
        onClick={generateLivingWorld}
        disabled={isGenerating}
        className="bg-[#e2c376] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#d4b46a] transition-colors mb-6 disabled:opacity-50"
      >
        {isGenerating ? 'Creating Living World...' : 'Generate Living World'}
      </button>

      {/* Living World Principles */}
      <div className="mb-6 bg-[#2a2a2a] rounded-lg p-4">
        <h4 className="text-[#e2c376] font-bold mb-4">🧬 Living World Principles</h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-green-400">
            <h5 className="text-green-400 font-semibold text-sm mb-1">👋 CHARACTER LIFECYCLE</h5>
            <p className="text-xs text-[#e7e7e7]/90">Characters enter when needed, leave when purpose fulfilled</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-blue-400">
            <h5 className="text-blue-400 font-semibold text-sm mb-1">🏗️ LOCATION EVOLUTION</h5>
            <p className="text-xs text-[#e7e7e7]/90">Places change and adapt based on story progression</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-purple-400">
            <h5 className="text-purple-400 font-semibold text-sm mb-1">⚖️ PREMISE-DRIVEN</h5>
            <p className="text-xs text-[#e7e7e7]/90">All changes serve the central story argument</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-yellow-400">
            <h5 className="text-yellow-400 font-semibold text-sm mb-1">🌊 ORGANIC FLOW</h5>
            <p className="text-xs text-[#e7e7e7]/90">Changes feel natural and inevitable</p>
          </div>
        </div>
      </div>

      {worldState && (
        <div className="space-y-6">
          {/* Episode Navigator */}
          <div className="bg-[#2a2a2a] rounded-lg p-4">
            <h4 className="text-[#e2c376] font-bold mb-3">📺 Episode Navigator</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {Array.from({ length: 12 }, (_, i) => i + 1).map(episode => (
                <button
                  key={episode}
                  onClick={() => evolveToEpisode(episode)}
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                    selectedEpisode >= episode 
                      ? 'bg-[#e2c376] text-black' 
                      : 'bg-[#36393f] text-[#e7e7e7]/70 hover:bg-[#4a4d55]'
                  }`}
                >
                  Ep {episode}
                </button>
              ))}
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p><strong>Current Episode:</strong> {worldState.currentEpisode}</p>
                <p><strong>Story Time:</strong> {worldState.totalTimeElapsed} days</p>
              </div>
              <div>
                <p><strong>Active Characters:</strong> {worldState.activeCharacters.filter(c => c.status === 'active').length}</p>
                <p><strong>Current Locations:</strong> {worldState.currentLocations.length}</p>
              </div>
              <div>
                <p><strong>Premise Progress:</strong> {worldState.premiseProgression}%</p>
                <p><strong>World Events:</strong> {worldState.worldEvents.length}</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex justify-center">
            <div className="bg-[#2a2a2a] rounded-lg p-1 flex">
              {(['overview', 'characters', 'locations', 'timeline'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === view 
                      ? 'bg-[#e2c376] text-black' 
                      : 'text-[#e7e7e7]/70 hover:bg-[#36393f]'
                  }`}
                >
                  {view === 'overview' ? '🌍 Overview' : 
                   view === 'characters' ? '👥 Characters' : 
                   view === 'locations' ? '🏗️ Locations' : 
                   '📊 Timeline'}
                </button>
              ))}
            </div>
          </div>

          {/* Overview View */}
          {activeView === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* World Status */}
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <h4 className="text-[#e2c376] font-bold mb-4">🌍 World Status</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-white font-semibold mb-3">Character Dynamics</h5>
                    <div className="space-y-2">
                      {worldState.activeCharacters.map((activeChar, index) => (
                        <div key={index} className="flex items-center justify-between bg-[#1a1a1a] rounded-lg p-3">
                          <div>
                            <p className="font-semibold">{activeChar.character.name}</p>
                            <p className="text-xs text-[#e7e7e7]/70">{activeChar.premiseContribution}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs text-white px-2 py-1 rounded ${getCharacterStatusColor(activeChar.status)}`}>
                              {activeChar.status.toUpperCase()}
                            </span>
                            <div className="text-right text-xs">
                              <p>Conflict: {activeChar.conflictLevel}/10</p>
                              <p className="text-[#e7e7e7]/60">{activeChar.purposeStatus}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-white font-semibold mb-3">Location States</h5>
                    <div className="space-y-2">
                      {worldState.currentLocations.map((location, index) => (
                        <div key={index} className="bg-[#1a1a1a] rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold">{location.name}</p>
                            <span className={`text-xs text-white px-2 py-1 rounded ${getLocationPhaseColor(location.currentPhase.current)}`}>
                              {location.currentPhase.current.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-[#e7e7e7]/90 mb-1">{location.description}</p>
                          <p className="text-xs text-[#e7e7e7]/60">{location.premiseReflection}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Changes */}
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <h4 className="text-[#e2c376] font-bold mb-4">📈 Recent Evolution</h4>
                <div className="space-y-3">
                  {worldState.characterIntroductions.slice(-3).map((intro, index) => (
                    <div key={index} className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-green-400">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">👋</span>
                        <p className="font-semibold">Character Introduction</p>
                        <span className="text-xs bg-[#36393f] px-2 py-1 rounded">Episode {intro.episodeNumber}</span>
                      </div>
                      <p className="text-sm text-[#e7e7e7]/90">
                        <strong>{intro.character.name}</strong> introduced - {intro.premiseService}
                      </p>
                    </div>
                  ))}
                  
                  {worldState.characterDepartures.slice(-3).map((departure, index) => (
                    <div key={index} className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-red-400">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">👋</span>
                        <p className="font-semibold">Character Departure</p>
                        <span className="text-xs bg-[#36393f] px-2 py-1 rounded">Episode {departure.episodeNumber}</span>
                      </div>
                      <p className="text-sm text-[#e7e7e7]/90">
                        <strong>{departure.character.name}</strong> departed - {departure.premiseService}
                      </p>
                    </div>
                  ))}
                  
                  {worldState.locationEvolutions.slice(-3).map((evolution, index) => (
                    <div key={index} className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-blue-400">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🏗️</span>
                        <p className="font-semibold">Location Evolution</p>
                        <span className="text-xs bg-[#36393f] px-2 py-1 rounded">Episode {evolution.episodeNumber}</span>
                      </div>
                      <p className="text-sm text-[#e7e7e7]/90">
                        {evolution.evolutionReason} - {evolution.premiseAlignment}
                      </p>
                    </div>
                  ))}
                  
                  {worldState.characterIntroductions.length === 0 && 
                   worldState.characterDepartures.length === 0 && 
                   worldState.locationEvolutions.length === 0 && (
                    <div className="text-center py-8 text-[#e7e7e7]/50">
                      <p>No evolution events yet. Progress through episodes to see dynamic changes!</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Characters View */}
          {activeView === 'characters' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <h4 className="text-[#e2c376] font-bold mb-4">👥 Character Lifecycle Management</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  {worldState.activeCharacters.map((activeChar, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedCharacter(activeChar)}
                      className="bg-[#1a1a1a] rounded-lg p-4 cursor-pointer hover:bg-[#2a2a2a] transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="text-white font-semibold">{activeChar.character.name}</h5>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs text-white px-2 py-1 rounded ${getCharacterStatusColor(activeChar.status)}`}>
                            {activeChar.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <p><strong>Role:</strong> {activeChar.character.premiseRole}</p>
                        <p><strong>Purpose:</strong> {activeChar.purposeStatus}</p>
                        <p><strong>Introduced:</strong> Episode {activeChar.introductionEpisode}</p>
                        {activeChar.departureEpisode && (
                          <p><strong>Departed:</strong> Episode {activeChar.departureEpisode}</p>
                        )}
                        <p><strong>Conflict Level:</strong> {activeChar.conflictLevel}/10</p>
                      </div>
                      
                      <div className="mt-3 p-2 bg-[#2a2a2a] rounded">
                        <p className="text-xs text-[#e7e7e7]/90">{activeChar.premiseContribution}</p>
                      </div>
                      
                      {activeChar.nextMilestone && (
                        <div className="mt-2 p-2 bg-blue-900/20 rounded border border-blue-500/20">
                          <p className="text-xs text-blue-400 font-semibold mb-1">Next Milestone:</p>
                          <p className="text-xs text-[#e7e7e7]/90">{activeChar.nextMilestone.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Locations View */}
          {activeView === 'locations' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <h4 className="text-[#e2c376] font-bold mb-4">🏗️ Dynamic Location Evolution</h4>
                <div className="space-y-4">
                  {worldState.currentLocations.map((location, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedLocation(location)}
                      className="bg-[#1a1a1a] rounded-lg p-4 cursor-pointer hover:bg-[#2a2a2a] transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="text-white font-semibold">{location.name}</h5>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs text-white px-2 py-1 rounded ${getLocationPhaseColor(location.currentPhase.current)}`}>
                            {location.currentPhase.current}
                          </span>
                          <div className="text-right text-xs">
                            <p>Importance: {location.significance.narrativeImportance}/10</p>
                            <p>Premise: {location.significance.premiseRelevance}/10</p>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-[#e7e7e7]/90 mb-3">{location.description}</p>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><strong>Type:</strong> {location.type.category}</p>
                          <p><strong>Atmosphere:</strong> {location.atmosphere.mood} (tension: {location.atmosphere.tension}/10)</p>
                          <p><strong>Function:</strong> {location.narrativeRole.function}</p>
                        </div>
                        <div>
                          <p><strong>Current Phase:</strong> {location.currentPhase.current}</p>
                          <p><strong>Phase Duration:</strong> {location.currentPhase.duration} episodes</p>
                          {location.currentPhase.nextPhase && (
                            <p><strong>Next Phase:</strong> {location.currentPhase.nextPhase}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3 p-2 bg-[#2a2a2a] rounded">
                        <p className="text-xs text-[#e7e7e7]/90">
                          <strong>Premise Reflection:</strong> {location.premiseReflection}
                        </p>
                      </div>
                      
                      {location.evolutionHistory.length > 0 && (
                        <div className="mt-2 p-2 bg-purple-900/20 rounded border border-purple-500/20">
                          <p className="text-xs text-purple-400 font-semibold mb-1">Recent Evolution:</p>
                          <p className="text-xs text-[#e7e7e7]/90">
                            {location.evolutionHistory[location.evolutionHistory.length - 1]?.evolutionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Timeline View */}
          {activeView === 'timeline' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <h4 className="text-[#e2c376] font-bold mb-4">📊 Evolution Timeline</h4>
                <div className="space-y-4">
                  {evolutionHistory.map((state, index) => (
                    <div key={index} className="bg-[#1a1a1a] rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-[#e2c376] text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                          {state.currentEpisode}
                        </div>
                        <div>
                          <h5 className="text-white font-semibold">Episode {state.currentEpisode}</h5>
                          <p className="text-xs text-[#e7e7e7]/60">
                            {state.activeCharacters.filter((c: any) => c.status === 'active').length} active characters, 
                            {state.currentLocations.length} locations, 
                            {state.premiseProgression}% premise progress
                          </p>
                        </div>
                      </div>
                      
                      {state.premiseInfluences.filter((inf: any) => inf.episodeNumber === state.currentEpisode).length > 0 && (
                        <div className="mt-3 space-y-2">
                          {state.premiseInfluences
                            .filter((inf: any) => inf.episodeNumber === state.currentEpisode)
                            .map((influence: any, infIndex: number) => (
                              <div key={infIndex} className="flex items-center gap-2 text-sm bg-[#2a2a2a] rounded p-2">
                                <span className="text-lg">{getEvolutionIcon(influence.influenceType)}</span>
                                <span className="text-[#e7e7e7]/90">{influence.description}</span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {evolutionHistory.length === 0 && (
                    <div className="text-center py-8 text-[#e7e7e7]/50">
                      <p>Progress through episodes to see the evolution timeline!</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Living World Revolution Summary */}
          <div className="bg-gradient-to-r from-[#e2c376]/20 to-[#c4a75f]/20 rounded-lg p-6 border border-[#e2c376]/50">
            <h4 className="text-[#e2c376] font-bold mb-4">🌊 Living World Revolution</h4>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h5 className="text-white font-semibold mb-3">👥 Character Lifecycle</h5>
                <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
                  <li>✅ Strategic introductions</li>
                  <li>✅ Purpose-driven departures</li>
                  <li>✅ Dynamic role evolution</li>
                  <li>✅ Premise-aligned growth</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-3">🏗️ Location Evolution</h5>
                <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
                  <li>✅ Atmospheric adaptation</li>
                  <li>✅ Premise reflection</li>
                  <li>✅ Character-driven change</li>
                  <li>✅ Natural progression</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-3">⚖️ Premise Integration</h5>
                <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
                  <li>✅ Every change serves argument</li>
                  <li>✅ World reflects theme</li>
                  <li>✅ Organic progression</li>
                  <li>✅ Continuity preservation</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-[#1a1a1a] rounded-lg">
              <p className="text-sm text-[#e7e7e7]/90">
                <strong>The Living Principle:</strong> Stories breathe and evolve. Characters enter with purpose and leave with dignity. 
                Locations grow and change as the narrative demands. Everything serves the premise while feeling beautifully organic.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 