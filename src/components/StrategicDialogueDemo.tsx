'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PremiseEngine } from '@/services/premise-engine'
import { Character3DEngine } from '@/services/character-engine'
import { FractalNarrativeEngine } from '@/services/fractal-narrative-engine'
import { StrategicDialogueEngine, DialogueExchange, DialogueLine, DialogueTactic } from '@/services/strategic-dialogue-engine'

export function StrategicDialogueDemo() {
  const [dialogueExchange, setDialogueExchange] = useState<DialogueExchange | null>(null)
  const [selectedLine, setSelectedLine] = useState<DialogueLine | null>(null)
  const [activeView, setActiveView] = useState<'exchange' | 'tactics' | 'subtext'>('exchange')
  const [isGenerating, setIsGenerating] = useState(false)

  const generateStrategicDialogue = async () => {
    setIsGenerating(true)
    
    try {
      // Generate premise and characters
      const premise = PremiseEngine.generatePremise(
        'truth',
        'Two detectives with different approaches must work together to solve a case while dealing with their conflicting philosophies.'
      )
      const premiseEquation = PremiseEngine.expandToEquation(premise, 'detective partnership story')
      
      // Generate 3D characters
      const protagonist = Character3DEngine.generateProtagonist(premise, premiseEquation, 'detective story')
      const antagonist = Character3DEngine.generateAntagonist(premise, premiseEquation, protagonist)
      
      // Generate a scene for dialogue context
      const scene = FractalNarrativeEngine.generateScene(protagonist, 'investigation', premise, 1)
      
      // Generate strategic dialogue
      const exchange = StrategicDialogueEngine.generateDialogueExchange(
        scene,
        [protagonist, antagonist],
        'confrontation'
      )
      
      setDialogueExchange(exchange)
      setSelectedLine(exchange.lines[0])
      
    } catch (error) {
      console.error('Error generating strategic dialogue:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const tacticExamples: { tactic: DialogueTactic; description: string; example: string }[] = [
    {
      tactic: 'direct-approach',
      description: 'Say exactly what you want',
      example: '"I need you to tell me where you were last night."'
    },
    {
      tactic: 'feigned-innocence',
      description: 'Pretend not to know something',
      example: '"I\'m not sure what you mean by \'alibi\'..."'
    },
    {
      tactic: 'emotional-appeal',
      description: 'Use feelings to persuade',
      example: '"Think about the victim\'s family. They deserve justice."'
    },
    {
      tactic: 'logical-argument',
      description: 'Use reason and facts',
      example: '"The evidence clearly contradicts your statement."'
    },
    {
      tactic: 'intimidation',
      description: 'Use fear or power',
      example: '"You might want to reconsider lying to a federal agent."'
    },
    {
      tactic: 'vulnerability',
      description: 'Show weakness to gain sympathy',
      example: '"I have to admit, this case is really getting to me."'
    }
  ]

  return (
    <div className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6 mb-8">
      <h3 className="text-xl font-bold text-[#e2c376] mb-4">🗣️ Strategic Dialogue Engine Demo</h3>
      <p className="text-[#e7e7e7]/70 mb-6">
        Experience dialogue as character warfare where every line serves plot, character, and conflict through tactical word choices and subtext layers.
      </p>
      
      <button
        onClick={generateStrategicDialogue}
        disabled={isGenerating}
        className="bg-[#e2c376] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#d4b46a] transition-colors mb-6 disabled:opacity-50"
      >
        {isGenerating ? 'Generating Strategic Dialogue...' : 'Generate Tactical Conversation'}
      </button>

      {/* Tactical Overview */}
      <div className="mb-6 bg-[#2a2a2a] rounded-lg p-4">
        <h4 className="text-[#e2c376] font-bold mb-4">⚔️ Dialogue Tactics Arsenal</h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tacticExamples.map((item, index) => (
            <div key={index} className="bg-[#1a1a1a] rounded-lg p-3">
              <h5 className="text-white font-semibold text-sm mb-1">{item.tactic.replace('-', ' ').toUpperCase()}</h5>
              <p className="text-xs text-[#e7e7e7]/70 mb-2">{item.description}</p>
              <p className="text-xs text-[#e2c376]">{item.example}</p>
            </div>
          ))}
        </div>
      </div>

      {dialogueExchange && (
        <div className="space-y-6">
          {/* Navigation Tabs */}
          <div className="flex justify-center">
            <div className="bg-[#2a2a2a] rounded-lg p-1 flex">
              {(['exchange', 'tactics', 'subtext'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === view 
                      ? 'bg-[#e2c376] text-black' 
                      : 'text-[#e7e7e7]/70 hover:bg-[#36393f]'
                  }`}
                >
                  {view === 'exchange' ? '💬 Exchange' : 
                   view === 'tactics' ? '⚔️ Tactics' : 
                   '🎭 Subtext'}
                </button>
              ))}
            </div>
          </div>

          {/* Exchange View */}
          {activeView === 'exchange' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Scene Context */}
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <h4 className="text-[#e2c376] font-bold mb-3">🎬 Scene Context</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Setting:</strong> {dialogueExchange.sceneContext}</p>
                    <p><strong>Conflict Type:</strong> {dialogueExchange.conflictType}</p>
                    <p><strong>Participants:</strong> {dialogueExchange.participants.map(p => p.name).join(', ')}</p>
                  </div>
                  <div>
                    <p><strong>Starting Tension:</strong> {dialogueExchange.escalation.startingTension}/10</p>
                    <p><strong>Peak Tension:</strong> {dialogueExchange.escalation.peakTension}/10</p>
                    <p><strong>Turning Point:</strong> Line {dialogueExchange.escalation.turningPoint}</p>
                  </div>
                </div>
              </div>

              {/* Character Objectives */}
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <h4 className="text-[#e2c376] font-bold mb-3">🎯 Character Objectives</h4>
                <div className="grid gap-3">
                  {dialogueExchange.objectives.map((obj, index) => (
                    <div key={index} className="bg-[#1a1a1a] rounded-lg p-3">
                      <h5 className="text-white font-semibold mb-2">{obj.character}</h5>
                      <div className="grid md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-green-400 font-bold">WANTS</p>
                          <p>{obj.wants}</p>
                        </div>
                        <div>
                          <p className="text-red-400 font-bold">FEARS</p>
                          <p>{obj.fears}</p>
                        </div>
                        <div>
                          <p className="text-blue-400 font-bold">STRATEGY</p>
                          <p>{obj.strategy}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dialogue Lines */}
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <h4 className="text-[#e2c376] font-bold mb-4">💬 Dialogue Exchange</h4>
                <div className="space-y-3">
                  {dialogueExchange.lines.map((line, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedLine(line)}
                      className={`bg-[#1a1a1a] rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedLine === line ? 'border-2 border-[#e2c376]' : 'hover:bg-[#2a2a2a]'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="text-white font-semibold">{line.character}</h5>
                        <div className="flex gap-2">
                          <span className="text-xs bg-[#e2c376] text-black px-2 py-1 rounded">
                            {line.tactic.replace('-', ' ')}
                          </span>
                          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                            {line.delivery.tone}
                          </span>
                        </div>
                      </div>
                      <p className="text-[#e7e7e7] mb-2">"{line.text}"</p>
                      <div className="text-xs text-[#e7e7e7]/70">
                        <p><strong>Objective:</strong> {line.objective}</p>
                        <p><strong>Purpose:</strong> {line.purpose.plot}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exchange Outcome */}
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <h4 className="text-[#e2c376] font-bold mb-3">🏆 Exchange Outcome</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-bold text-white mb-2">Results:</p>
                    <ul className="space-y-1">
                      <li>• <strong>Winner:</strong> {dialogueExchange.resolution.winner || 'Stalemate'}</li>
                      <li>• <strong>Reveals:</strong> {dialogueExchange.resolution.reveals.join(', ')}</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold text-white mb-2">Consequences:</p>
                    <ul className="space-y-1">
                      {dialogueExchange.resolution.consequences.map((consequence, index) => (
                        <li key={index}>• {consequence}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p className="mt-3 text-sm"><strong>Relationship Change:</strong> {dialogueExchange.resolution.relationshipChange}</p>
              </div>
            </motion.div>
          )}

          {/* Tactics View */}
          {activeView === 'tactics' && selectedLine && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Selected Line Analysis */}
              <div className="bg-[#2a2a2a] rounded-lg p-6">
                <h4 className="text-[#e2c376] font-bold mb-4">⚔️ Tactical Analysis: {selectedLine.character}</h4>
                
                <div className="bg-[#1a1a1a] rounded-lg p-4 mb-6">
                  <p className="text-lg text-white mb-2">"{selectedLine.text}"</p>
                  <div className="flex gap-2">
                    <span className="text-xs bg-[#e2c376] text-black px-2 py-1 rounded">
                      {selectedLine.tactic.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                      {selectedLine.delivery.tone}
                    </span>
                    <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                      {selectedLine.delivery.volume}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-[#1a1a1a] rounded-lg p-4">
                      <h5 className="text-[#e2c376] font-bold mb-2">🎯 Strategic Purpose</h5>
                      <div className="space-y-2 text-sm">
                        <p><strong>Objective:</strong> {selectedLine.objective}</p>
                        <p><strong>Target:</strong> {selectedLine.target}</p>
                        <p><strong>Tactic:</strong> {selectedLine.tactic.replace('-', ' ')}</p>
                      </div>
                    </div>
                    
                    <div className="bg-[#1a1a1a] rounded-lg p-4">
                      <h5 className="text-[#e2c376] font-bold mb-2">📢 Delivery</h5>
                      <div className="space-y-2 text-sm">
                        <p><strong>Tone:</strong> {selectedLine.delivery.tone}</p>
                        <p><strong>Volume:</strong> {selectedLine.delivery.volume}</p>
                        <p><strong>Pace:</strong> {selectedLine.delivery.pace}</p>
                        {selectedLine.delivery.emphasis && (
                          <p><strong>Emphasis:</strong> {selectedLine.delivery.emphasis}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-[#1a1a1a] rounded-lg p-4">
                      <h5 className="text-[#e2c376] font-bold mb-2">📝 Natural Elements</h5>
                      <div className="space-y-2 text-sm">
                        <p><strong>Contractions:</strong> {selectedLine.naturalElements.contractions ? 'Yes' : 'No'}</p>
                        {selectedLine.naturalElements.interruptions && (
                          <p><strong>Interruptions:</strong> {selectedLine.naturalElements.interruptions}</p>
                        )}
                        {selectedLine.naturalElements.pauses && selectedLine.naturalElements.pauses.length > 0 && (
                          <p><strong>Pauses:</strong> {selectedLine.naturalElements.pauses.join(', ')}</p>
                        )}
                        {selectedLine.naturalElements.gestures && selectedLine.naturalElements.gestures.length > 0 && (
                          <p><strong>Gestures:</strong> {selectedLine.naturalElements.gestures.join(', ')}</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#1a1a1a] rounded-lg p-4">
                      <h5 className="text-[#e2c376] font-bold mb-2">⚡ Triple Function</h5>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-green-400 font-bold">PLOT</p>
                          <p>{selectedLine.purpose.plot}</p>
                        </div>
                        <div>
                          <p className="text-blue-400 font-bold">CHARACTER</p>
                          <p>{selectedLine.purpose.character}</p>
                        </div>
                        <div>
                          <p className="text-red-400 font-bold">CONFLICT</p>
                          <p>{selectedLine.purpose.conflict}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Subtext View */}
          {activeView === 'subtext' && selectedLine && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Subtext Layers */}
              <div className="bg-[#2a2a2a] rounded-lg p-6">
                <h4 className="text-[#e2c376] font-bold mb-4">🎭 Subtext Layers: {selectedLine.character}</h4>
                
                <div className="bg-[#1a1a1a] rounded-lg p-4 mb-6">
                  <p className="text-lg text-white">"{selectedLine.text}"</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#1a1a1a] rounded-lg p-4 border-l-4 border-white">
                    <h5 className="text-white font-bold mb-2">💬 Surface Level</h5>
                    <p className="text-sm">{selectedLine.subtext.surfaceLevel}</p>
                    <p className="text-xs text-[#e7e7e7]/60 mt-1">What they literally say</p>
                  </div>

                  <div className="bg-[#1a1a1a] rounded-lg p-4 border-l-4 border-yellow-400">
                    <h5 className="text-yellow-400 font-bold mb-2">❤️ Emotional Level</h5>
                    <p className="text-sm">{selectedLine.subtext.emotionalLevel}</p>
                    <p className="text-xs text-[#e7e7e7]/60 mt-1">What they feel</p>
                  </div>

                  <div className="bg-[#1a1a1a] rounded-lg p-4 border-l-4 border-blue-400">
                    <h5 className="text-blue-400 font-bold mb-2">🎯 Intentional Level</h5>
                    <p className="text-sm">{selectedLine.subtext.intentionalLevel}</p>
                    <p className="text-xs text-[#e7e7e7]/60 mt-1">What they want to achieve</p>
                  </div>

                  {selectedLine.subtext.fearLevel && (
                    <div className="bg-[#1a1a1a] rounded-lg p-4 border-l-4 border-red-400">
                      <h5 className="text-red-400 font-bold mb-2">😰 Fear Level</h5>
                      <p className="text-sm">{selectedLine.subtext.fearLevel}</p>
                      <p className="text-xs text-[#e7e7e7]/60 mt-1">What they're afraid of revealing</p>
                    </div>
                  )}

                  {selectedLine.subtext.powerLevel && (
                    <div className="bg-[#1a1a1a] rounded-lg p-4 border-l-4 border-purple-400">
                      <h5 className="text-purple-400 font-bold mb-2">👑 Power Level</h5>
                      <p className="text-sm">{selectedLine.subtext.powerLevel}</p>
                      <p className="text-xs text-[#e7e7e7]/60 mt-1">Status/dominance implications</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Strategic Dialogue Revolution Summary */}
          <div className="bg-gradient-to-r from-[#e2c376]/20 to-[#c4a75f]/20 rounded-lg p-6 border border-[#e2c376]/50">
            <h4 className="text-[#e2c376] font-bold mb-4">🚀 Strategic Dialogue Revolution</h4>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h5 className="text-white font-semibold mb-3">⚔️ Tactical Warfare</h5>
                <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
                  <li>✅ 12 dialogue tactics</li>
                  <li>✅ Character objectives</li>
                  <li>✅ Strategic escalation</li>
                  <li>✅ Conflict resolution</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-3">🎭 Layered Subtext</h5>
                <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
                  <li>✅ Surface meaning</li>
                  <li>✅ Emotional undertones</li>
                  <li>✅ Hidden intentions</li>
                  <li>✅ Power dynamics</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-3">🗣️ Natural Speech</h5>
                <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
                  <li>✅ Contractions & rhythm</li>
                  <li>✅ Character-specific patterns</li>
                  <li>✅ Interruptions & pauses</li>
                  <li>✅ Triple function validation</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-[#1a1a1a] rounded-lg">
              <p className="text-sm text-[#e7e7e7]/90">
                <strong>The Strategic Principle:</strong> Every line serves plot, character, and conflict through tactical objectives. 
                Characters use words as weapons to achieve goals, creating layered conversations with multiple levels of meaning.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 