'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TensionEscalationEngine, 
  TensionState, 
  TensionManagementPlan,
  EscalationPattern,
  ClimaxArchitecture,
  ReleaseStrategy 
} from '@/services/tension-escalation-engine'

export function TensionEscalationDemo() {
  const [tensionPlan, setTensionPlan] = useState<TensionManagementPlan | null>(null)
  const [currentEpisode, setCurrentEpisode] = useState(1)
  const [tensionHistory, setTensionHistory] = useState<TensionState[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [selectedTensionType, setSelectedTensionType] = useState<string>('dramatic')
  const [activeView, setActiveView] = useState<'tension' | 'patterns' | 'climax' | 'release'>('tension')
  const [isGenerating, setIsGenerating] = useState(false)

  const tensionTypes = [
    { id: 'dramatic', name: 'Dramatic', icon: '🎭', color: 'bg-red-500' },
    { id: 'emotional', name: 'Emotional', icon: '💗', color: 'bg-pink-500' },
    { id: 'physical', name: 'Physical', icon: '⚡', color: 'bg-orange-500' },
    { id: 'psychological', name: 'Psychological', icon: '🧠', color: 'bg-purple-500' },
    { id: 'social', name: 'Social', icon: '👥', color: 'bg-blue-500' },
    { id: 'moral', name: 'Moral', icon: '⚖️', color: 'bg-green-500' },
    { id: 'temporal', name: 'Temporal', icon: '⏰', color: 'bg-yellow-500' },
    { id: 'existential', name: 'Existential', icon: '🌌', color: 'bg-indigo-500' }
  ]

  const generateTensionPlan = async () => {
    setIsGenerating(true)
    
    try {
      // Mock tension plan generation
      const mockPlan = createMockTensionPlan()
      setTensionPlan(mockPlan)
      
      // Generate tension history for demonstration
      const history = generateTensionHistory(mockPlan, 12)
      setTensionHistory(history)
      
    } catch (error) {
      console.error('Error generating tension plan:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const createMockTensionPlan = (): TensionManagementPlan => {
    const currentTension: TensionState = {
      episode: 1,
      scene: 1,
      timestamp: Date.now(),
      tensionTypes: {
        dramatic: { current: 4, potential: 9, trajectory: 'building', sources: [], releaseOpportunities: [] },
        emotional: { current: 3, potential: 10, trajectory: 'building', sources: [], releaseOpportunities: [] },
        physical: { current: 2, potential: 8, trajectory: 'stable', sources: [], releaseOpportunities: [] },
        psychological: { current: 6, potential: 10, trajectory: 'volatile', sources: [], releaseOpportunities: [] },
        social: { current: 3, potential: 7, trajectory: 'building', sources: [], releaseOpportunities: [] },
        moral: { current: 5, potential: 9, trajectory: 'building', sources: [], releaseOpportunities: [] },
        temporal: { current: 1, potential: 8, trajectory: 'stable', sources: [], releaseOpportunities: [] },
        existential: { current: 4, potential: 10, trajectory: 'building', sources: [], releaseOpportunities: [] }
      },
      overallTension: 3.5,
      tensionVelocity: 0.5,
      tensionDirection: 'rising',
      suspenseLevel: 4,
      anticipationLevel: 5,
      emotionalInvestment: 6,
      tensionReleaseNeeded: false,
      lastReleaseEpisode: 0,
      releaseDeficit: 0
    }

    const escalationPattern: EscalationPattern = {
      id: 'dramatic-spiral',
      name: 'Dramatic Spiral',
      description: 'Classic escalating tension with strategic releases',
      phases: [
        {
          name: 'Setup & Hook',
          duration: 20,
          tensionTarget: 4,
          primaryTechniques: ['character introduction', 'initial conflict'],
          characterFocus: ['protagonist'],
          keyMoments: [
            {
              moment: 'Inciting incident',
              tensionImpact: 2,
              emotionalWeight: 6,
              plotImportance: 8,
              audienceReaction: 'intrigued'
            }
          ]
        },
        {
          name: 'Rising Action',
          duration: 50,
          tensionTarget: 7,
          primaryTechniques: ['escalating obstacles', 'character revelations'],
          characterFocus: ['protagonist', 'antagonist'],
          keyMoments: [
            {
              moment: 'Midpoint revelation',
              tensionImpact: 3,
              emotionalWeight: 8,
              plotImportance: 9,
              audienceReaction: 'shocked engagement'
            }
          ]
        },
        {
          name: 'Climactic Resolution',
          duration: 30,
          tensionTarget: 10,
          primaryTechniques: ['maximum stakes', 'all conflicts converge'],
          characterFocus: ['all characters'],
          keyMoments: [
            {
              moment: 'Final confrontation',
              tensionImpact: 4,
              emotionalWeight: 10,
              plotImportance: 10,
              audienceReaction: 'peak investment'
            }
          ]
        }
      ],
      duration: 12,
      peakIntensity: 10,
      genreEffectiveness: { thriller: 9, drama: 8, action: 7 },
      audienceImpact: { engagement: 9, satisfaction: 8, memorability: 9 },
      triggerConditions: [],
      escalationTechniques: [],
      releaseStrategies: [],
      characterRequirements: [],
      choiceInfluence: [],
      dialogueIntegration: [],
      tropeUtilization: []
    }

    const climaxArchitecture: ClimaxArchitecture = {
      climaxType: 'confrontational',
      buildupStrategy: { approach: 'gradual-escalation', duration: 10, keyBuildupMoments: [] },
      peakMoment: { description: 'Ultimate test', tensionLevel: 10, emotionalImpact: 10, duration: 'single scene' },
      resolutionCurve: { pattern: 'gradual-descent', duration: 2, satisfactionLevel: 9 },
      primaryClimax: {
        focus: 'Main conflict resolution',
        tensionPeak: 10,
        emotionalImpact: 9,
        resolutionSatisfaction: 9,
        premiseService: 'Proves central argument'
      },
      characterClimax: {
        focus: 'Character growth',
        tensionPeak: 9,
        emotionalImpact: 10,
        resolutionSatisfaction: 8,
        premiseService: 'Character embodies lesson'
      },
      thematicClimax: {
        focus: 'Theme resolution',
        tensionPeak: 8,
        emotionalImpact: 8,
        resolutionSatisfaction: 9,
        premiseService: 'Theme demonstration'
      },
      emotionalClimax: {
        focus: 'Emotional payoff',
        tensionPeak: 9,
        emotionalImpact: 10,
        resolutionSatisfaction: 10,
        premiseService: 'Emotional validation'
      },
      tensionResolution: { resolutionStyle: 'complete', loose_ends: [], sequelPotential: 3 },
      audienceSatisfaction: { catharsis: 9, closure: 8, memorability: 9 },
      sequelPotential: { newTensionSeeds: [], characterContinuation: [], worldExpansion: [] }
    }

    return {
      currentTension,
      tensionSources: [
        {
          id: 'protagonist-crisis',
          type: 'internal-struggle',
          description: 'Internal identity crisis',
          intensity: 7,
          persistence: 9,
          escalationPotential: 8,
          characterInvolvement: ['protagonist'],
          premiseRelevance: 9
        },
        {
          id: 'external-threat',
          type: 'external-threat',
          description: 'Growing external danger',
          intensity: 6,
          persistence: 8,
          escalationPotential: 9,
          characterInvolvement: ['antagonist'],
          premiseRelevance: 8
        }
      ],
      escalationPatterns: [escalationPattern],
      climaxArchitecture,
      releaseStrategies: [
        {
          id: 'comic-relief',
          name: 'Comic Relief',
          description: 'Humor to break tension',
          releaseType: 'comic-relief',
          intensity: 3,
          duration: 1,
          timing: { when: 'after-high-tension', conditions: ['tension > 7'] },
          techniques: [{ technique: 'character humor', implementation: 'natural dialogue' }],
          characterInvolvement: ['supporting'],
          genreAppropriate: ['thriller', 'drama'],
          audienceImpact: 'relief and re-engagement',
          tensionRebuild: { method: 'gradual', timeline: '2 scenes', intensity: 5 },
          premiseIntegration: 'Maintains audience connection'
        }
      ],
      tensionRoadmap: {},
      genreOptimization: {},
      audienceEngagement: {},
      engineCoordination: {}
    }
  }

  const generateTensionHistory = (plan: TensionManagementPlan, episodes: number): TensionState[] => {
    const history: TensionState[] = []
    
    for (let ep = 1; ep <= episodes; ep++) {
      const progress = (ep - 1) / (episodes - 1)
      
      // Calculate tension levels based on escalation pattern
      const pattern = plan.escalationPatterns[0]
      let phaseIndex = 0
      let cumulativeDuration = 0
      
      for (let i = 0; i < pattern.phases.length; i++) {
        cumulativeDuration += pattern.phases[i].duration
        if (progress * 100 <= cumulativeDuration) {
          phaseIndex = i
          break
        }
      }
      
      const currentPhase = pattern.phases[phaseIndex]
      const baseTarget = currentPhase.tensionTarget
      
      // Add some natural variation
      const variation = (Math.sin(ep * 0.5) * 0.5 + Math.random() * 0.3 - 0.15)
      
      // Calculate individual tension types
      const tensionState: TensionState = {
        episode: ep,
        scene: 1,
        timestamp: Date.now() + ep * 1000,
        tensionTypes: {
          dramatic: {
            current: Math.min(10, Math.max(1, baseTarget + variation)),
            potential: 9,
            trajectory: ep < episodes * 0.8 ? 'building' : 'releasing',
            sources: [],
            releaseOpportunities: []
          },
          emotional: {
            current: Math.min(10, Math.max(1, baseTarget * 1.1 + variation)),
            potential: 10,
            trajectory: 'building',
            sources: [],
            releaseOpportunities: []
          },
          physical: {
            current: Math.min(10, Math.max(1, baseTarget * 0.7 + variation)),
            potential: 8,
            trajectory: 'volatile',
            sources: [],
            releaseOpportunities: []
          },
          psychological: {
            current: Math.min(10, Math.max(1, baseTarget * 1.2 + variation)),
            potential: 10,
            trajectory: 'building',
            sources: [],
            releaseOpportunities: []
          },
          social: {
            current: Math.min(10, Math.max(1, baseTarget * 0.8 + variation)),
            potential: 7,
            trajectory: 'stable',
            sources: [],
            releaseOpportunities: []
          },
          moral: {
            current: Math.min(10, Math.max(1, baseTarget * 0.9 + variation)),
            potential: 9,
            trajectory: 'building',
            sources: [],
            releaseOpportunities: []
          },
          temporal: {
            current: Math.min(10, Math.max(1, baseTarget * 0.6 + variation)),
            potential: 8,
            trajectory: ep > episodes * 0.7 ? 'building' : 'stable',
            sources: [],
            releaseOpportunities: []
          },
          existential: {
            current: Math.min(10, Math.max(1, baseTarget * 1.1 + variation)),
            potential: 10,
            trajectory: 'building',
            sources: [],
            releaseOpportunities: []
          }
        },
        overallTension: baseTarget + variation,
        tensionVelocity: phaseIndex === 0 ? 0.3 : phaseIndex === 1 ? 0.6 : 0.9,
        tensionDirection: ep < episodes * 0.9 ? 'rising' : 'falling',
        suspenseLevel: Math.min(10, baseTarget + 1),
        anticipationLevel: Math.min(10, baseTarget + 2),
        emotionalInvestment: Math.min(10, 3 + progress * 7),
        tensionReleaseNeeded: ep % 4 === 0 && ep < episodes - 2,
        lastReleaseEpisode: Math.max(0, ep - 4),
        releaseDeficit: ep % 4 === 0 ? 2 : 0
      }
      
      history.push(tensionState)
    }
    
    return history
  }

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && tensionHistory.length > 0) {
      const interval = setInterval(() => {
        setCurrentEpisode(prev => {
          if (prev >= tensionHistory.length) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 1000 / playbackSpeed)
      
      return () => clearInterval(interval)
    }
  }, [isPlaying, playbackSpeed, tensionHistory.length])

  const getCurrentTension = (): TensionState | null => {
    return tensionHistory[currentEpisode - 1] || null
  }

  const getTensionTypeColor = (type: string) => {
    const tensionType = tensionTypes.find(tt => tt.id === type)
    return tensionType?.color || 'bg-gray-500'
  }

  const getTensionTypeIcon = (type: string) => {
    const tensionType = tensionTypes.find(tt => tt.id === type)
    return tensionType?.icon || '📊'
  }

  const currentTension = getCurrentTension()

  return (
    <div className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6 mb-8">
      <h3 className="text-xl font-bold text-[#e2c376] mb-4">🎢 Tension Escalation Engine Demo</h3>
      <p className="text-[#e7e7e7]/70 mb-6">
        Experience sophisticated dramatic tension management that ensures your stories maintain gripping momentum 
        with intelligent pacing, emotional escalation, and perfectly timed climactic moments.
      </p>
      
      <button
        onClick={generateTensionPlan}
        disabled={isGenerating}
        className="bg-[#e2c376] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#d4b46a] transition-colors mb-6 disabled:opacity-50"
      >
        {isGenerating ? 'Generating Tension Plan...' : 'Generate Tension Management System'}
      </button>

      {/* Tension Engine Principles */}
      <div className="mb-6 bg-[#2a2a2a] rounded-lg p-4">
        <h4 className="text-[#e2c376] font-bold mb-4">🎯 Tension Engine Principles</h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-red-400">
            <h5 className="text-red-400 font-semibold text-sm mb-1">📊 MULTI-DIMENSIONAL</h5>
            <p className="text-xs text-[#e7e7e7]/90">Track 8 different types of tension simultaneously</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-orange-400">
            <h5 className="text-orange-400 font-semibold text-sm mb-1">📈 INTELLIGENT ESCALATION</h5>
            <p className="text-xs text-[#e7e7e7]/90">Strategic tension building with perfect pacing</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-blue-400">
            <h5 className="text-blue-400 font-semibold text-sm mb-1">💨 PRESSURE RELEASE</h5>
            <p className="text-xs text-[#e7e7e7]/90">Strategic tension relief to prevent audience fatigue</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-purple-400">
            <h5 className="text-purple-400 font-semibold text-sm mb-1">🎭 CLIMAX MASTERY</h5>
            <p className="text-xs text-[#e7e7e7]/90">Multi-layered climactic architecture for maximum impact</p>
          </div>
        </div>
      </div>

      {tensionPlan && (
        <div className="space-y-6">
          {/* Playback Controls */}
          <div className="bg-[#2a2a2a] rounded-lg p-4">
            <h4 className="text-[#e2c376] font-bold mb-4">🎮 Tension Playback</h4>
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                  isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                {isPlaying ? '⏸️ Pause' : '▶️ Play'}
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#e7e7e7]">Speed:</span>
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="bg-[#1a1a1a] border border-[#36393f] rounded px-2 py-1 text-sm text-[#e7e7e7]"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1x</option>
                  <option value={2}>2x</option>
                  <option value={4}>4x</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#e7e7e7]">Episode:</span>
                <input
                  type="range"
                  min="1"
                  max={tensionHistory.length}
                  value={currentEpisode}
                  onChange={(e) => setCurrentEpisode(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-[#e2c376] font-bold">{currentEpisode}/{tensionHistory.length}</span>
              </div>
            </div>
            
            {currentTension && (
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p><strong>Overall Tension:</strong> {currentTension.overallTension.toFixed(1)}/10</p>
                  <p><strong>Direction:</strong> {currentTension.tensionDirection}</p>
                </div>
                <div>
                  <p><strong>Suspense Level:</strong> {currentTension.suspenseLevel}/10</p>
                  <p><strong>Velocity:</strong> {currentTension.tensionVelocity.toFixed(1)}</p>
                </div>
                <div>
                  <p><strong>Anticipation:</strong> {currentTension.anticipationLevel}/10</p>
                  <p><strong>Investment:</strong> {currentTension.emotionalInvestment}/10</p>
                </div>
                <div>
                  <p><strong>Release Needed:</strong> {currentTension.tensionReleaseNeeded ? 'Yes' : 'No'}</p>
                  <p><strong>Release Deficit:</strong> {currentTension.releaseDeficit}</p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex justify-center">
            <div className="bg-[#2a2a2a] rounded-lg p-1 flex">
              {(['tension', 'patterns', 'climax', 'release'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === view 
                      ? 'bg-[#e2c376] text-black' 
                      : 'text-[#e7e7e7]/70 hover:bg-[#36393f]'
                  }`}
                >
                  {view === 'tension' ? '📊 Tension' : 
                   view === 'patterns' ? '📈 Patterns' : 
                   view === 'climax' ? '🎭 Climax' : 
                   '💨 Release'}
                </button>
              ))}
            </div>
          </div>

          {/* Tension View */}
          {activeView === 'tension' && currentTension && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Multi-Dimensional Tension Visualization */}
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <h4 className="text-[#e2c376] font-bold mb-4">📊 Multi-Dimensional Tension State</h4>
                
                {/* Tension Type Selector */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {tensionTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedTensionType(type.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedTensionType === type.id
                          ? 'bg-[#e2c376] text-black'
                          : 'bg-[#1a1a1a] text-[#e7e7e7] hover:bg-[#36393f]'
                      }`}
                    >
                      <span className="text-lg">{type.icon}</span>
                      {type.name}
                    </button>
                  ))}
                </div>
                
                {/* Tension Levels Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {tensionTypes.map((type) => {
                    const tensionLevel = currentTension.tensionTypes[type.id as keyof typeof currentTension.tensionTypes]
                    return (
                      <div
                        key={type.id}
                        className={`bg-[#1a1a1a] rounded-lg p-4 border-2 transition-colors ${
                          selectedTensionType === type.id ? 'border-[#e2c376]' : 'border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xl">{type.icon}</span>
                          <div>
                            <h5 className="font-semibold text-white">{type.name}</h5>
                            <p className="text-xs text-[#e7e7e7]/60">{tensionLevel.trajectory}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Current</span>
                            <span className="font-bold text-[#e2c376]">{tensionLevel.current.toFixed(1)}/10</span>
                          </div>
                          
                          <div className="w-full bg-[#36393f] rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full transition-all duration-500 ${type.color}`}
                              style={{ width: `${(tensionLevel.current / 10) * 100}%` }}
                            ></div>
                          </div>
                          
                          <div className="flex justify-between text-xs text-[#e7e7e7]/70">
                            <span>Potential: {tensionLevel.potential}/10</span>
                            <span className={`font-semibold ${
                              tensionLevel.trajectory === 'building' ? 'text-red-400' :
                              tensionLevel.trajectory === 'releasing' ? 'text-green-400' :
                              tensionLevel.trajectory === 'volatile' ? 'text-yellow-400' :
                              'text-blue-400'
                            }`}>
                              {tensionLevel.trajectory === 'building' ? '📈' :
                               tensionLevel.trajectory === 'releasing' ? '📉' :
                               tensionLevel.trajectory === 'volatile' ? '📊' : '➡️'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              {/* Tension Timeline Graph */}
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <h4 className="text-[#e2c376] font-bold mb-4">📈 Tension Timeline</h4>
                <div className="relative h-64 bg-[#1a1a1a] rounded-lg p-4">
                  <svg className="w-full h-full">
                    {/* Grid lines */}
                    {Array.from({ length: 11 }, (_, i) => (
                      <line
                        key={i}
                        x1="0"
                        y1={`${(i / 10) * 100}%`}
                        x2="100%"
                        y2={`${(i / 10) * 100}%`}
                        stroke="#36393f"
                        strokeWidth="1"
                        opacity="0.3"
                      />
                    ))}
                    
                    {/* Tension line */}
                    {tensionHistory.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="#e2c376"
                        strokeWidth="3"
                        points={tensionHistory.map((tension, index) => {
                          const x = (index / (tensionHistory.length - 1)) * 100
                          const y = 100 - (tension.overallTension / 10) * 100
                          return `${x}%,${y}%`
                        }).join(' ')}
                      />
                    )}
                    
                    {/* Current position indicator */}
                    {currentTension && (
                      <circle
                        cx={`${((currentEpisode - 1) / (tensionHistory.length - 1)) * 100}%`}
                        cy={`${100 - (currentTension.overallTension / 10) * 100}%`}
                        r="6"
                        fill="#e2c376"
                        stroke="#1a1a1a"
                        strokeWidth="2"
                      />
                    )}
                  </svg>
                  
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-[#e7e7e7]/60 pointer-events-none">
                    {Array.from({ length: 6 }, (_, i) => (
                      <span key={i}>{10 - i * 2}</span>
                    ))}
                  </div>
                  
                  {/* X-axis labels */}
                  <div className="absolute bottom-0 w-full flex justify-between text-xs text-[#e7e7e7]/60 pointer-events-none">
                    <span>Ep 1</span>
                    <span>Ep {Math.floor(tensionHistory.length / 2)}</span>
                    <span>Ep {tensionHistory.length}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Patterns View */}
          {activeView === 'patterns' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <h4 className="text-[#e2c376] font-bold mb-4">📈 Escalation Patterns</h4>
                
                {tensionPlan.escalationPatterns.map((pattern, index) => (
                  <div key={index} className="bg-[#1a1a1a] rounded-lg p-4 mb-4">
                    <h5 className="text-white font-semibold mb-3">{pattern.name}</h5>
                    <p className="text-sm text-[#e7e7e7]/90 mb-4">{pattern.description}</p>
                    
                    <div className="space-y-4">
                      {pattern.phases.map((phase, phaseIndex) => (
                        <div key={phaseIndex} className="bg-[#2a2a2a] rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <h6 className="font-semibold text-[#e2c376]">{phase.name}</h6>
                            <div className="text-right text-sm">
                              <p>Duration: {phase.duration}%</p>
                              <p>Target: {phase.tensionTarget}/10</p>
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-semibold text-white mb-1">Techniques:</p>
                              <ul className="text-[#e7e7e7]/90 space-y-1">
                                {phase.primaryTechniques.map((technique, i) => (
                                  <li key={i}>• {technique}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="font-semibold text-white mb-1">Character Focus:</p>
                              <ul className="text-[#e7e7e7]/90 space-y-1">
                                {phase.characterFocus.map((character, i) => (
                                  <li key={i}>• {character}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          
                          {phase.keyMoments.length > 0 && (
                            <div className="mt-3">
                              <p className="font-semibold text-white mb-2">Key Moments:</p>
                              {phase.keyMoments.map((moment, i) => (
                                <div key={i} className="bg-[#1a1a1a] rounded p-2 mb-2">
                                  <p className="text-sm text-[#e2c376] font-semibold">{moment.moment}</p>
                                  <div className="grid grid-cols-3 gap-2 text-xs mt-1">
                                    <span>Impact: {moment.tensionImpact}/10</span>
                                    <span>Emotion: {moment.emotionalWeight}/10</span>
                                    <span>Plot: {moment.plotImportance}/10</span>
                                  </div>
                                  <p className="text-xs text-[#e7e7e7]/70 mt-1">
                                    Audience: {moment.audienceReaction}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Climax View */}
          {activeView === 'climax' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <h4 className="text-[#e2c376] font-bold mb-4">🎭 Climax Architecture</h4>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h5 className="text-white font-semibold mb-3">Climax Design</h5>
                    <div className="bg-[#1a1a1a] rounded-lg p-3 space-y-2 text-sm">
                      <p><strong>Type:</strong> {tensionPlan.climaxArchitecture.climaxType}</p>
                      <p><strong>Buildup:</strong> {tensionPlan.climaxArchitecture.buildupStrategy.approach}</p>
                      <p><strong>Peak Tension:</strong> {tensionPlan.climaxArchitecture.peakMoment.tensionLevel}/10</p>
                      <p><strong>Peak Impact:</strong> {tensionPlan.climaxArchitecture.peakMoment.emotionalImpact}/10</p>
                      <p><strong>Resolution:</strong> {tensionPlan.climaxArchitecture.resolutionCurve.pattern}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-white font-semibold mb-3">Audience Satisfaction</h5>
                    <div className="bg-[#1a1a1a] rounded-lg p-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Catharsis:</span>
                        <span className="text-[#e2c376] font-bold">
                          {tensionPlan.climaxArchitecture.audienceSatisfaction.catharsis}/10
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Closure:</span>
                        <span className="text-[#e2c376] font-bold">
                          {tensionPlan.climaxArchitecture.audienceSatisfaction.closure}/10
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Memorability:</span>
                        <span className="text-[#e2c376] font-bold">
                          {tensionPlan.climaxArchitecture.audienceSatisfaction.memorability}/10
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Multi-Layer Climax */}
                <div>
                  <h5 className="text-white font-semibold mb-3">Multi-Layered Climax Structure</h5>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { name: 'Primary', layer: tensionPlan.climaxArchitecture.primaryClimax, color: 'border-red-400' },
                      { name: 'Character', layer: tensionPlan.climaxArchitecture.characterClimax, color: 'border-blue-400' },
                      { name: 'Thematic', layer: tensionPlan.climaxArchitecture.thematicClimax, color: 'border-green-400' },
                      { name: 'Emotional', layer: tensionPlan.climaxArchitecture.emotionalClimax, color: 'border-purple-400' }
                    ].map((item, index) => (
                      <div key={index} className={`bg-[#1a1a1a] rounded-lg p-3 border-l-4 ${item.color}`}>
                        <h6 className="font-semibold text-white mb-2">{item.name} Climax</h6>
                        <p className="text-xs text-[#e7e7e7]/90 mb-2">{item.layer.focus}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <span>Peak: {item.layer.tensionPeak}/10</span>
                          <span>Impact: {item.layer.emotionalImpact}/10</span>
                          <span>Satisfaction: {item.layer.resolutionSatisfaction}/10</span>
                        </div>
                        <p className="text-xs text-[#e7e7e7]/70 mt-2">{item.layer.premiseService}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Release View */}
          {activeView === 'release' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <h4 className="text-[#e2c376] font-bold mb-4">💨 Tension Release Strategies</h4>
                
                {tensionPlan.releaseStrategies.map((strategy, index) => (
                  <div key={index} className="bg-[#1a1a1a] rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="text-white font-semibold">{strategy.name}</h5>
                        <p className="text-sm text-[#e7e7e7]/90">{strategy.description}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-[#e2c376] font-bold">Intensity: {strategy.intensity}/10</p>
                        <p className="text-[#e7e7e7]/70">Duration: {strategy.duration} episodes</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-semibold text-white mb-2">Release Type</p>
                        <p className="text-[#e7e7e7]/90 capitalize">{strategy.releaseType.replace('-', ' ')}</p>
                        
                        <p className="font-semibold text-white mb-2 mt-3">Timing</p>
                        <p className="text-[#e7e7e7]/90">{strategy.timing.when}</p>
                        {strategy.timing.conditions.length > 0 && (
                          <ul className="text-xs text-[#e7e7e7]/70 mt-1">
                            {strategy.timing.conditions.map((condition, i) => (
                              <li key={i}>• {condition}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      
                      <div>
                        <p className="font-semibold text-white mb-2">Characters Involved</p>
                        <ul className="text-[#e7e7e7]/90 space-y-1">
                          {strategy.characterInvolvement.map((character, i) => (
                            <li key={i}>• {character}</li>
                          ))}
                        </ul>
                        
                        <p className="font-semibold text-white mb-2 mt-3">Genre Appropriate</p>
                        <ul className="text-[#e7e7e7]/90 space-y-1">
                          {strategy.genreAppropriate.map((genre, i) => (
                            <li key={i}>• {genre}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-3 p-3 bg-[#2a2a2a] rounded">
                      <p className="text-sm">
                        <strong className="text-white">Audience Impact:</strong> 
                        <span className="text-[#e7e7e7]/90 ml-2">{strategy.audienceImpact}</span>
                      </p>
                      <p className="text-sm mt-1">
                        <strong className="text-white">Tension Rebuild:</strong> 
                        <span className="text-[#e7e7e7]/90 ml-2">
                          {strategy.tensionRebuild.method} over {strategy.tensionRebuild.timeline} 
                          (intensity: {strategy.tensionRebuild.intensity}/10)
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Release Timing Visualization */}
                <div className="bg-[#1a1a1a] rounded-lg p-4">
                  <h5 className="text-white font-semibold mb-3">Release Timing Pattern</h5>
                  <div className="relative h-16 bg-[#2a2a2a] rounded-lg">
                    {tensionHistory.map((tension, index) => {
                      const isReleasePoint = tension.tensionReleaseNeeded
                      return (
                        <div
                          key={index}
                          className={`absolute top-0 h-full w-1 ${
                            isReleasePoint ? 'bg-green-400' : 'bg-transparent'
                          }`}
                          style={{ left: `${(index / (tensionHistory.length - 1)) * 100}%` }}
                          title={isReleasePoint ? `Release point at episode ${index + 1}` : ''}
                        />
                      )
                    })}
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-[#e7e7e7]/70">
                      Green bars indicate optimal tension release points
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tension Escalation Revolution Summary */}
          <div className="bg-gradient-to-r from-[#e2c376]/20 to-[#c4a75f]/20 rounded-lg p-6 border border-[#e2c376]/50">
            <h4 className="text-[#e2c376] font-bold mb-4">🎢 Tension Escalation Revolution</h4>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h5 className="text-white font-semibold mb-3">📊 Multi-Dimensional Tracking</h5>
                <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
                  <li>✅ 8 tension types simultaneously</li>
                  <li>✅ Real-time trajectory analysis</li>
                  <li>✅ Potential vs current mapping</li>
                  <li>✅ Velocity and direction tracking</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-3">📈 Intelligent Escalation</h5>
                <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
                  <li>✅ Phase-based progression</li>
                  <li>✅ Strategic technique deployment</li>
                  <li>✅ Character-focused escalation</li>
                  <li>✅ Key moment orchestration</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-3">🎭 Climax Mastery</h5>
                <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
                  <li>✅ Multi-layered architecture</li>
                  <li>✅ Perfect timing coordination</li>
                  <li>✅ Maximum emotional impact</li>
                  <li>✅ Satisfying resolution curves</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-[#1a1a1a] rounded-lg">
              <p className="text-sm text-[#e7e7e7]/90">
                <strong>The Tension Principle:</strong> Tension is the invisible force that pulls readers through your story. 
                Master the art of building, releasing, and escalating tension at precisely the right moments to create 
                narratives that grip audiences from the first page to the last.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 