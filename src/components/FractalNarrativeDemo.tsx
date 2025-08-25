'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PremiseEngine } from '@/services/premise-engine'
import { Character3DEngine } from '@/services/character-engine'
import { FractalNarrativeEngine, NarrativeArc, NarrativeEpisode, NarrativeScene } from '@/services/fractal-narrative-engine'

export function FractalNarrativeDemo() {
  const [narrativeArc, setNarrativeArc] = useState<NarrativeArc | null>(null)
  const [selectedEpisode, setSelectedEpisode] = useState<NarrativeEpisode | null>(null)
  const [selectedScene, setSelectedScene] = useState<NarrativeScene | null>(null)
  const [activeView, setActiveView] = useState<'arc' | 'episode' | 'scene'>('arc')
  const [isGenerating, setIsGenerating] = useState(false)

  const generateFractalNarrative = async () => {
    setIsGenerating(true)
    
    try {
      // Generate premise and characters first
      const premise = PremiseEngine.generatePremise(
        'courage',
        'A young firefighter must overcome their fear of enclosed spaces to save lives in a collapsed building.'
      )
      const premiseEquation = PremiseEngine.expandToEquation(premise, 'firefighter courage story')
      
      // Generate 3D characters
      const protagonist = Character3DEngine.generateProtagonist(premise, premiseEquation, 'firefighter courage story')
      const antagonist = Character3DEngine.generateAntagonist(premise, premiseEquation, protagonist)
      const supporting = Character3DEngine.generateSupportingCharacter('catalyst', premise, [protagonist, antagonist], ['courage catalyst'])
      
      const characters = [protagonist, antagonist, supporting]
      
      // Generate complete narrative arc
      const arc = FractalNarrativeEngine.generateNarrativeArc(premise, characters, 3, 9)
      
      setNarrativeArc(arc)
      setSelectedEpisode(arc.episodes[0])
      setSelectedScene(arc.episodes[0].scenes[0])
      
    } catch (error) {
      console.error('Error generating fractal narrative:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6 mb-8">
      <h3 className="text-xl font-bold text-[#e2c376] mb-4">🎬 Fractal Narrative Engine Demo</h3>
      <p className="text-[#e7e7e7]/70 mb-6">
        Experience nested story structures where every Arc, Episode, and Scene follows proven dramatic patterns with mandatory turning points.
      </p>
      
      <button
        onClick={generateFractalNarrative}
        disabled={isGenerating}
        className="bg-[#e2c376] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#d4b46a] transition-colors mb-6 disabled:opacity-50"
      >
        {isGenerating ? 'Generating Fractal Narrative...' : 'Generate Fractal Structure'}
      </button>

      {narrativeArc && (
        <div className="space-y-6">
          {/* Navigation Tabs */}
          <div className="flex justify-center">
            <div className="bg-[#2a2a2a] rounded-lg p-1 flex">
              {(['arc', 'episode', 'scene'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === view 
                      ? 'bg-[#e2c376] text-black' 
                      : 'text-[#e7e7e7]/70 hover:bg-[#36393f]'
                  }`}
                >
                  {view === 'arc' ? '🏛️ Arc Structure' : 
                   view === 'episode' ? '📺 Episode Detail' : 
                   '🎭 Scene Breakdown'}
                </button>
              ))}
            </div>
          </div>

          {/* Arc Structure View */}
          {activeView === 'arc' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Arc Overview */}
              <div className="bg-[#2a2a2a] rounded-lg p-6">
                <h4 className="text-[#e2c376] font-bold mb-4">🏛️ Arc Structure: {narrativeArc.title}</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-white font-semibold mb-3">Arc Progression</h5>
                    <div className="space-y-2 text-sm">
                      <p><strong>Premise:</strong> {narrativeArc.progression.premise}</p>
                      <p><strong>Stakes:</strong> {narrativeArc.progression.stakes}</p>
                      <p><strong>Climax:</strong> {narrativeArc.progression.climax}</p>
                      <p><strong>Resolution:</strong> {narrativeArc.progression.resolution}</p>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-white font-semibold mb-3">Structure Info</h5>
                    <div className="space-y-2 text-sm">
                      <p><strong>Macro Structure:</strong> {narrativeArc.macroStructure}</p>
                      <p><strong>Total Episodes:</strong> {narrativeArc.totalEpisodes}</p>
                      <p><strong>Total Acts:</strong> {narrativeArc.acts.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acts Breakdown */}
              <div className="grid gap-4">
                <h5 className="text-[#e2c376] font-bold">📚 Acts Breakdown</h5>
                {narrativeArc.acts.map((act, index) => (
                  <div key={index} className="bg-[#2a2a2a] rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h6 className="text-white font-semibold">
                        Act {act.actNumber}: {act.title}
                      </h6>
                      <span className="text-[#e2c376] text-sm font-medium">
                        Episodes {act.startEpisode}-{act.endEpisode}
                      </span>
                    </div>
                    <p className="text-[#e7e7e7]/90 text-sm mb-3">{act.function}</p>
                    <div>
                      <p className="text-[#e7e7e7]/70 text-sm">
                        <strong>Key Beats:</strong> {act.keyBeats.join(' → ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Episode Timeline */}
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <h5 className="text-[#e2c376] font-bold mb-4">📺 Episode Timeline</h5>
                <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
                  {narrativeArc.episodes.map((episode, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedEpisode(episode)
                        setActiveView('episode')
                      }}
                      className="bg-[#1a1a1a] hover:bg-[#36393f] rounded-lg p-3 text-center transition-colors"
                    >
                      <div className="text-[#e2c376] font-bold text-sm">E{episode.episodeNumber}</div>
                      <div className="text-xs text-[#e7e7e7]/70 mt-1">
                        {episode.arcFunction.split(':')[0]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Episode Detail View */}
          {activeView === 'episode' && selectedEpisode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Episode Header */}
              <div className="bg-[#2a2a2a] rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-[#e2c376] font-bold">
                    📺 Episode {selectedEpisode.episodeNumber}: {selectedEpisode.title}
                  </h4>
                  <div className="text-right">
                    <p className="text-[#e7e7e7] text-sm">Framework: {selectedEpisode.microFramework}</p>
                    <p className="text-[#e7e7e7]/70 text-sm">Duration: {selectedEpisode.estimatedDuration} min</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-white font-semibold mb-3">Episode Function</h5>
                    <div className="space-y-2 text-sm">
                      <p><strong>Arc Function:</strong> {selectedEpisode.arcFunction}</p>
                      <p><strong>Macro Goal:</strong> {selectedEpisode.macroGoal}</p>
                      <p><strong>Premise Test:</strong> {selectedEpisode.premiseTest}</p>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-white font-semibold mb-3">Focus Characters</h5>
                    <div className="space-y-1 text-sm">
                      {selectedEpisode.focusCharacters.map((char, index) => (
                        <p key={index}>• {char}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hook and Cliffhanger */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[#2a2a2a] rounded-lg p-4 border-l-4 border-green-400">
                  <h5 className="text-green-400 font-bold mb-2">🎣 Hook</h5>
                  <p className="text-sm text-[#e7e7e7]/90 mb-2">
                    <strong>Type:</strong> {selectedEpisode.hook.type}
                  </p>
                  <p className="text-sm">{selectedEpisode.hook.content}</p>
                </div>
                <div className="bg-[#2a2a2a] rounded-lg p-4 border-l-4 border-orange-400">
                  <h5 className="text-orange-400 font-bold mb-2">🪝 Cliffhanger</h5>
                  <p className="text-sm text-[#e7e7e7]/90 mb-2">
                    <strong>Type:</strong> {selectedEpisode.cliffhanger.type}
                  </p>
                  <p className="text-sm mb-2">{selectedEpisode.cliffhanger.content}</p>
                  <p className="text-xs text-orange-400">{selectedEpisode.cliffhanger.teaser}</p>
                </div>
              </div>

              {/* Character Arcs */}
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <h5 className="text-[#e2c376] font-bold mb-4">👥 Character Arcs This Episode</h5>
                <div className="grid gap-3">
                  {selectedEpisode.characterArcs.map((arc, index) => (
                    <div key={index} className="bg-[#1a1a1a] rounded-lg p-4">
                      <h6 className="text-white font-semibold mb-2">{arc.character}</h6>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-blue-400 font-bold mb-1">WANT</p>
                          <p>{arc.want}</p>
                        </div>
                        <div>
                          <p className="text-red-400 font-bold mb-1">OBSTACLE</p>
                          <p>{arc.obstacle}</p>
                        </div>
                        <div>
                          <p className="text-green-400 font-bold mb-1">GROWTH</p>
                          <p>{arc.growth}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scenes */}
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <h5 className="text-[#e2c376] font-bold mb-4">🎭 Scenes</h5>
                <div className="grid gap-2">
                  {selectedEpisode.scenes.map((scene, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedScene(scene)
                        setActiveView('scene')
                      }}
                      className="bg-[#1a1a1a] hover:bg-[#36393f] rounded-lg p-4 text-left transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <h6 className="text-white font-semibold">Scene {scene.sceneNumber}: {scene.title}</h6>
                        <span className="text-[#e2c376] text-sm">{scene.turningPoint.type}</span>
                      </div>
                      <p className="text-[#e7e7e7]/70 text-sm mt-1">
                        Goal: {scene.goal.objective} | Obstacle: {scene.obstacle.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Scene Detail View */}
          {activeView === 'scene' && selectedScene && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Scene Header */}
              <div className="bg-[#2a2a2a] rounded-lg p-6">
                <h4 className="text-[#e2c376] font-bold mb-4">
                  🎭 Scene {selectedScene.sceneNumber}: {selectedScene.title}
                </h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <p><strong>Location:</strong> {selectedScene.location}</p>
                  <p><strong>Time:</strong> {selectedScene.timeOfDay}</p>
                  <p><strong>Duration:</strong> {selectedScene.duration}</p>
                  <p><strong>Mood:</strong> {selectedScene.mood}</p>
                  <p><strong>Conflict Type:</strong> {selectedScene.conflict.type}</p>
                  <p><strong>Intensity:</strong> {selectedScene.conflict.intensity}/10</p>
                </div>
              </div>

              {/* G.O.D.D. Framework */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-[#2a2a2a] rounded-lg p-4 border-l-4 border-blue-400">
                    <h5 className="text-blue-400 font-bold mb-2">🎯 GOAL</h5>
                    <div className="text-sm space-y-1">
                      <p><strong>Character:</strong> {selectedScene.goal.character}</p>
                      <p><strong>Objective:</strong> {selectedScene.goal.objective}</p>
                      <p><strong>Motivation:</strong> {selectedScene.goal.motivation}</p>
                      <p><strong>Stakes:</strong> {selectedScene.goal.stakes}</p>
                    </div>
                  </div>
                  
                  <div className="bg-[#2a2a2a] rounded-lg p-4 border-l-4 border-red-400">
                    <h5 className="text-red-400 font-bold mb-2">🚧 OBSTACLE</h5>
                    <div className="text-sm space-y-1">
                      <p><strong>Type:</strong> {selectedScene.obstacle.type}</p>
                      <p><strong>Source:</strong> {selectedScene.obstacle.source}</p>
                      <p><strong>Description:</strong> {selectedScene.obstacle.description}</p>
                      <p><strong>Difficulty:</strong> {selectedScene.obstacle.difficulty}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#2a2a2a] rounded-lg p-4 border-l-4 border-yellow-400">
                    <h5 className="text-yellow-400 font-bold mb-2">⚖️ DILEMMA</h5>
                    <div className="text-sm space-y-2">
                      <p>{selectedScene.dilemma.description}</p>
                      <div>
                        <p className="font-bold">Options:</p>
                        <ul className="list-disc list-inside ml-2">
                          {selectedScene.dilemma.options.map((option, index) => (
                            <li key={index}>{option}</li>
                          ))}
                        </ul>
                      </div>
                      <p><strong>No Easy Way:</strong> {selectedScene.dilemma.noEasyWay}</p>
                    </div>
                  </div>
                  
                  <div className="bg-[#2a2a2a] rounded-lg p-4 border-l-4 border-green-400">
                    <h5 className="text-green-400 font-bold mb-2">✅ DECISION</h5>
                    <div className="text-sm space-y-1">
                      <p><strong>Character:</strong> {selectedScene.decision.character}</p>
                      <p><strong>Choice:</strong> {selectedScene.decision.choice}</p>
                      <p><strong>Reasoning:</strong> {selectedScene.decision.reasoning}</p>
                      <p><strong>Cost:</strong> {selectedScene.decision.cost}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Turning Point */}
              <div className="bg-[#2a2a2a] rounded-lg p-6 border-2 border-[#e2c376]">
                <h5 className="text-[#e2c376] font-bold mb-4">⚡ MANDATORY TURNING POINT</h5>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-[#e2c376] font-bold text-sm">TYPE</p>
                      <p className="text-sm">{selectedScene.turningPoint.type}</p>
                    </div>
                    <div>
                      <p className="text-[#e2c376] font-bold text-sm">STIMULUS</p>
                      <p className="text-sm">{selectedScene.turningPoint.stimulus}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[#e2c376] font-bold text-sm">REACTION</p>
                      <p className="text-sm">{selectedScene.turningPoint.reaction}</p>
                    </div>
                    <div>
                      <p className="text-[#e2c376] font-bold text-sm">SHIFT</p>
                      <p className="text-sm">{selectedScene.turningPoint.shift}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-[#1a1a1a] rounded-lg p-3">
                  <p className="text-[#e2c376] font-bold text-sm mb-1">NEW DIRECTION</p>
                  <p className="text-sm">{selectedScene.turningPoint.newDirection}</p>
                </div>
              </div>

              {/* Dialogue Strategy */}
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <h5 className="text-[#e2c376] font-bold mb-3">🗣️ Dialogue Strategy</h5>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-[#e2c376] font-bold mb-1">SUBTEXT</p>
                    <p>{selectedScene.dialogueApproach.subtext}</p>
                  </div>
                  <div>
                    <p className="text-[#e2c376] font-bold mb-1">STRATEGY</p>
                    <p>{selectedScene.dialogueApproach.strategy}</p>
                  </div>
                  <div>
                    <p className="text-[#e2c376] font-bold mb-1">CONFLICT</p>
                    <p>{selectedScene.dialogueApproach.conflict}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Revolutionary Features Summary */}
          <div className="bg-gradient-to-r from-[#e2c376]/20 to-[#c4a75f]/20 rounded-lg p-6 border border-[#e2c376]/50">
            <h4 className="text-[#e2c376] font-bold mb-4">🚀 Fractal Narrative Revolution</h4>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h5 className="text-white font-semibold mb-3">🏛️ Arc Level</h5>
                <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
                  <li>✅ Complete narrative structure</li>
                  <li>✅ Act-based progression</li>
                  <li>✅ Premise-driven arcs</li>
                  <li>✅ Clear climax mapping</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-3">📺 Episode Level</h5>
                <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
                  <li>✅ 5-minute narrative chunks</li>
                  <li>✅ Compressed structures</li>
                  <li>✅ Hooks & cliffhangers</li>
                  <li>✅ Character arc progression</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-3">🎭 Scene Level</h5>
                <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
                  <li>✅ G.O.D.D. framework</li>
                  <li>✅ Mandatory turning points</li>
                  <li>✅ Strategic dialogue</li>
                  <li>✅ Value-shift mechanics</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-[#1a1a1a] rounded-lg">
              <p className="text-sm text-[#e7e7e7]/90">
                <strong>The Fractal Principle:</strong> Every level mirrors the whole - Arc has acts, Episodes have micro-acts, 
                Scenes have beginning/middle/end. Each level contains complete dramatic structures with mandatory conflict and resolution.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 