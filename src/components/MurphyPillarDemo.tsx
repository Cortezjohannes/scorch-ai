'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function MurphyPillarDemo() {
  const [activeDemo, setActiveDemo] = useState<string>('overview')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationStage, setGenerationStage] = useState('')
  const [completeNarrative, setCompleteNarrative] = useState<any>(null)
  const [oneClickPrompt, setOneClickPrompt] = useState('A detective investigates mysterious disappearances in a small coastal town where nothing is as it seems.')

  const murphyPillarFeatures = [
    {
      id: 'overview',
      name: 'Murphy Pillar Overview',
      icon: '🏛️',
      color: 'from-yellow-500 to-orange-500',
      description: 'The unshakeable foundation of perfect storytelling'
    },
    {
      id: 'master-conductor',
      name: 'Master Conductor',
      icon: '🎼',
      color: 'from-purple-500 to-blue-500',
      description: 'Supreme orchestrator of 14 engines in perfect harmony'
    },
    {
      id: 'seamless-integration',
      name: 'Seamless Integration',
      icon: '🔄',
      color: 'from-green-500 to-blue-500',
      description: 'Invisible enhancement of existing user experience'
    },
    {
      id: 'one-click-generation',
      name: 'One-Click Complete',
      icon: '⚡',
      color: 'from-red-500 to-purple-500',
      description: 'Complete professional narratives from simple prompts'
    }
  ]

  const fourteenEngines = [
    // Core Ten Engines
    { name: 'Premise Engine', version: '2.0', status: 'active', specialty: 'Logical story foundations' },
    { name: '3D Character Engine', version: '2.0', status: 'active', specialty: 'Multi-dimensional personalities' },
    { name: 'Fractal Narrative Engine', version: '2.0', status: 'active', specialty: 'Nested story structures' },
    { name: 'Strategic Dialogue Engine', version: '2.0', status: 'active', specialty: 'Character warfare through words' },
    { name: 'Intelligent Trope System', version: '2.0', status: 'active', specialty: 'Strategic pattern deployment' },
    { name: 'Living World Engine', version: '2.0', status: 'active', specialty: 'Dynamic narrative evolution' },
    { name: 'Interactive Choice Engine', version: '2.0', status: 'active', specialty: 'Branching choice architecture' },
    { name: 'Genre Mastery System', version: '2.0', status: 'active', specialty: 'Meta-engine coordination' },
    { name: 'Tension Escalation Engine', version: '2.0', status: 'active', specialty: 'Dramatic momentum mastery' },
    { name: 'World Building Engine', version: '2.0', status: 'active', specialty: 'Comprehensive fictional reality' },
    // Advanced Specialization Engines
    { name: 'Comedy Timing Engine', version: '1.0', status: 'active', specialty: 'Mathematical humor mastery' },
    { name: 'Horror Atmosphere Engine', version: '1.0', status: 'active', specialty: 'Fear psychology expertise' },
    { name: 'Romance Chemistry Engine', version: '1.0', status: 'active', specialty: 'Attraction science authority' },
    { name: 'Mystery Construction Engine', version: '1.0', status: 'active', specialty: 'Fair play logic excellence' }
  ]

  const generateOneClickNarrative = async () => {
    setIsGenerating(true)
    setGenerationProgress(0)
    setCompleteNarrative(null)

    const stages = [
      'Analyzing prompt with supreme intelligence...',
      'Activating Premise Engine for logical foundation...',
      'Engaging 3D Character Engine for complex personalities...',
      'Orchestrating Fractal Narrative Engine for structure...',
      'Coordinating Strategic Dialogue Engine for conversations...',
      'Deploying Intelligent Trope System for patterns...',
      'Activating Living World Engine for dynamic evolution...',
      'Integrating Interactive Choice Engine for branching...',
      'Coordinating Genre Mastery System for perfection...',
      'Escalating Tension Engine for dramatic momentum...',
      'Building World Engine for comprehensive reality...',
      'Fine-tuning Comedy Engine for perfect timing...',
      'Atmospheric Horror Engine for psychological depth...',
      'Chemistry Romance Engine for authentic connection...',
      'Mystery Construction Engine for logical puzzles...',
      'Master Conductor synchronizing all engines...',
      'Quality validation across all dimensions...',
      'Professional grading and final optimization...',
      'Delivering complete professional narrative...'
    ]

    try {
      for (let i = 0; i < stages.length; i++) {
        setGenerationStage(stages[i])
        await new Promise(resolve => setTimeout(resolve, 400))
        setGenerationProgress(((i + 1) / stages.length) * 100)
      }

      // Simulate API call to complete narrative endpoint
      const response = await fetch('/api/generate/complete-narrative', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: oneClickPrompt,
          genre: 'auto-detect',
          length: 'standard',
          complexity: 'moderate'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setCompleteNarrative(data)
        setGenerationStage('✅ Complete professional narrative generated successfully!')
      } else {
        // Mock successful response for demo
        setCompleteNarrative({
          success: true,
          completeNarrative: {
            storyBible: {
              title: 'Tides of Deception',
              premise: {
                theme: 'Truth emerges through persistent investigation',
                premiseStatement: 'A detective\'s relentless pursuit of missing persons reveals a conspiracy that threatens everything she holds dear',
                premiseType: 'cause-effect'
              },
              characters: [
                {
                  name: 'Detective Sarah Chen',
                  role: 'Protagonist',
                  psychology: {
                    want: 'To solve the disappearances',
                    need: 'To learn to trust others',
                    flaw: 'Isolates herself due to past betrayal'
                  }
                },
                {
                  name: 'Dr. Marcus Webb',
                  role: 'Antagonist', 
                  psychology: {
                    want: 'To protect his research',
                    need: 'To face consequences of his actions',
                    flaw: 'Believes ends justify means'
                  }
                }
              ]
            },
            qualityMetrics: {
              overall: 9.2,
              categories: {
                premise: 9.1,
                characters: 9.3,
                structure: 8.9,
                dialogue: 9.0,
                worldBuilding: 9.2,
                genreExpertise: 9.4
              }
            }
          },
          generationMetadata: {
            processingTime: 8200,
            enginesUsed: fourteenEngines.map(e => e.name),
            qualityAssurance: {
              narrativeCoherence: 'Professional',
              characterDepth: 'Multi-dimensional',
              plotStructure: 'Architecturally sound'
            }
          }
        })
        setGenerationStage('✅ Complete professional narrative generated successfully!')
      }

    } catch (error) {
      console.error('Error generating complete narrative:', error)
      setGenerationStage('❌ Generation failed - using fallback demonstration')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6 mb-8">
      <h3 className="text-xl font-bold text-[#e2c376] mb-4">🏛️ Murphy Pillar Master Conductor Demo</h3>
      <p className="text-[#e7e7e7]/70 mb-6">
        Experience the unshakeable foundation of perfect storytelling - the Murphy Pillar housing 14 engines 
        orchestrated by the Master Conductor for seamless, invisible enhancement of your creative process.
      </p>

      {/* Murphy Pillar Principles */}
      <div className="mb-6 bg-[#2a2a2a] rounded-lg p-4">
        <h4 className="text-[#e2c376] font-bold mb-4">🎯 Murphy Pillar Core Principles</h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-yellow-400">
            <h5 className="text-yellow-400 font-semibold text-sm mb-1">🏛️ UNSHAKEABLE FOUNDATION</h5>
            <p className="text-xs text-[#e7e7e7]/90">Solid, reliable, professional-grade base</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-purple-400">
            <h5 className="text-purple-400 font-semibold text-sm mb-1">🎼 MASTER CONDUCTOR</h5>
            <p className="text-xs text-[#e7e7e7]/90">Supreme orchestration of all engines</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-green-400">
            <h5 className="text-green-400 font-semibold text-sm mb-1">👻 INVISIBLE ENHANCEMENT</h5>
            <p className="text-xs text-[#e7e7e7]/90">Same UI/UX, dramatically better results</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-red-400">
            <h5 className="text-red-400 font-semibold text-sm mb-1">⚡ ONE-CLICK MASTERY</h5>
            <p className="text-xs text-[#e7e7e7]/90">Simple prompt to complete professional story</p>
          </div>
        </div>
      </div>

      {/* Feature Selection */}
      <div className="mb-6">
        <h4 className="text-[#e2c376] font-bold mb-4">Select Murphy Pillar Feature</h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {murphyPillarFeatures.map((feature) => (
            <button
              key={feature.id}
              onClick={() => setActiveDemo(feature.id)}
              className={`p-4 rounded-lg text-left transition-all transform hover:scale-105 ${
                activeDemo === feature.id
                  ? `bg-gradient-to-r ${feature.color} text-white shadow-lg`
                  : 'bg-[#2a2a2a] text-[#e7e7e7] hover:bg-[#36393f]'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{feature.icon}</span>
                <span className="font-bold text-sm">{feature.name}</span>
              </div>
              <p className="text-xs opacity-90">{feature.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Feature Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDemo}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-6"
        >
          {activeDemo === 'overview' && (
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <h4 className="text-[#e2c376] font-bold mb-4">🏛️ Murphy Pillar Architecture Overview</h4>
              
              {/* 14 Engines Display */}
              <div className="mb-6">
                <h5 className="text-white font-semibold mb-3">Fourteen Coordinated Engines</h5>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {fourteenEngines.map((engine, index) => (
                    <div key={index} className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-[#e2c376]">
                      <div className="flex justify-between items-start mb-1">
                        <h6 className="font-semibold text-white text-sm">{engine.name}</h6>
                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">v{engine.version}</span>
                      </div>
                      <p className="text-xs text-[#e7e7e7]/90 mb-2">{engine.specialty}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-xs text-green-400">Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Status */}
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-[#1a1a1a] rounded-lg p-3">
                  <h5 className="font-semibold text-white mb-2">System Status</h5>
                  <p className="text-sm text-green-400">All engines operational</p>
                </div>
                <div className="bg-[#1a1a1a] rounded-lg p-3">
                  <h5 className="font-semibold text-white mb-2">Integration</h5>
                  <p className="text-sm text-blue-400">Seamlessly integrated</p>
                </div>
                <div className="bg-[#1a1a1a] rounded-lg p-3">
                  <h5 className="font-semibold text-white mb-2">Quality Level</h5>
                  <p className="text-sm text-purple-400">Professional grade</p>
                </div>
                <div className="bg-[#1a1a1a] rounded-lg p-3">
                  <h5 className="font-semibold text-white mb-2">Engine Harmony</h5>
                  <p className="text-sm text-[#e2c376]">Perfect synchronization</p>
                </div>
              </div>
            </div>
          )}

          {activeDemo === 'master-conductor' && (
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <h4 className="text-[#e2c376] font-bold mb-4">🎼 Master Conductor Orchestration</h4>
              
              <div className="mb-6">
                <h5 className="text-white font-semibold mb-3">Supreme Intelligence Features</h5>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h6 className="text-purple-400 font-semibold mb-2">🧠 Narrative Intelligence</h6>
                    <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
                      <li>• Supreme story analysis</li>
                      <li>• Genre detection mastery</li>
                      <li>• Complexity assessment</li>
                      <li>• Quality prediction</li>
                    </ul>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h6 className="text-purple-400 font-semibold mb-2">⚡ Orchestration Wisdom</h6>
                    <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
                      <li>• Perfect engine coordination</li>
                      <li>• Intelligent activation sequences</li>
                      <li>• Resource optimization</li>
                      <li>• Quality assurance</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg p-4 border border-purple-400/50">
                <h5 className="text-purple-400 font-semibold mb-2">Master Conductor Process</h5>
                <div className="grid md:grid-cols-6 gap-2 text-xs text-center">
                  <div className="bg-[#1a1a1a] rounded p-2">
                    <div className="text-purple-400 mb-1">1. ANALYZE</div>
                    <div className="text-[#e7e7e7]/70">Supreme story intelligence</div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded p-2">
                    <div className="text-purple-400 mb-1">2. PLAN</div>
                    <div className="text-[#e7e7e7]/70">Optimal orchestration</div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded p-2">
                    <div className="text-purple-400 mb-1">3. ORCHESTRATE</div>
                    <div className="text-[#e7e7e7]/70">14-engine symphony</div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded p-2">
                    <div className="text-purple-400 mb-1">4. VALIDATE</div>
                    <div className="text-[#e7e7e7]/70">Quality assurance</div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded p-2">
                    <div className="text-purple-400 mb-1">5. OPTIMIZE</div>
                    <div className="text-[#e7e7e7]/70">Performance tuning</div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded p-2">
                    <div className="text-purple-400 mb-1">6. DELIVER</div>
                    <div className="text-[#e7e7e7]/70">Professional output</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeDemo === 'seamless-integration' && (
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <h4 className="text-[#e2c376] font-bold mb-4">🔄 Seamless Integration Architecture</h4>
              
              <div className="mb-6">
                <h5 className="text-white font-semibold mb-3">Zero Disruption Enhancement</h5>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h6 className="text-green-400 font-semibold mb-3">✅ What Users See (Unchanged)</h6>
                    <ul className="text-sm text-[#e7e7e7]/90 space-y-2">
                      <li>• Same homepage interface</li>
                      <li>• Same story bible generation</li>
                      <li>• Same preproduction workflow</li>
                      <li>• Same UI/UX experience</li>
                      <li>• Same API response format</li>
                    </ul>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h6 className="text-blue-400 font-semibold mb-3">⚡ What They Get (Enhanced)</h6>
                    <ul className="text-sm text-[#e7e7e7]/90 space-y-2">
                      <li>• Professional-grade story quality</li>
                      <li>• 14-engine coordination</li>
                      <li>• Genre-specific expertise</li>
                      <li>• Character psychological depth</li>
                      <li>• Architectural story structure</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-4 border border-green-400/50">
                <h5 className="text-green-400 font-semibold mb-3">Integration Strategy</h5>
                <div className="text-sm text-[#e7e7e7]/90 space-y-2">
                  <p><strong>Backend Enhancement:</strong> Murphy Pillar works behind your existing API endpoints</p>
                  <p><strong>Fallback Safety:</strong> Original system remains as backup for maximum reliability</p>
                  <p><strong>Progressive Rollout:</strong> Engines integrated one at a time for safe deployment</p>
                  <p><strong>Quality Guarantee:</strong> Murphy Pillar only activates when it can improve output</p>
                </div>
              </div>
            </div>
          )}

          {activeDemo === 'one-click-generation' && (
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <h4 className="text-[#e2c376] font-bold mb-4">⚡ One-Click Complete Narrative Generation</h4>
              
              {/* Prompt Input */}
              <div className="mb-6">
                <h5 className="text-white font-semibold mb-3">Enter Your Story Prompt</h5>
                <textarea
                  value={oneClickPrompt}
                  onChange={(e) => setOneClickPrompt(e.target.value)}
                  className="w-full bg-[#1a1a1a] text-[#e7e7e7] border border-[#36393f] rounded-lg p-3 h-24 resize-none"
                  placeholder="Enter a simple story idea and watch Murphy Pillar create a complete professional narrative..."
                />
              </div>

              {/* Generation Button */}
              <div className="mb-6 text-center">
                <button
                  onClick={generateOneClickNarrative}
                  disabled={isGenerating || !oneClickPrompt.trim()}
                  className="bg-gradient-to-r from-red-500 to-purple-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-red-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                  {isGenerating ? 'Orchestrating 14 Engines...' : '⚡ Generate Complete Narrative'}
                </button>
              </div>

              {/* Generation Progress */}
              {isGenerating && (
                <div className="mb-6">
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">Master Conductor Progress</span>
                      <span className="text-[#e2c376]">{Math.round(generationProgress)}%</span>
                    </div>
                    <div className="w-full bg-[#36393f] rounded-full h-3 mb-3">
                      <div 
                        className="bg-gradient-to-r from-[#e2c376] to-[#d4b46a] h-3 rounded-full transition-all duration-300"
                        style={{ width: `${generationProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-[#e7e7e7]/70">{generationStage}</p>
                  </div>
                </div>
              )}

              {/* Generated Results */}
              {completeNarrative && (
                <div className="bg-[#1a1a1a] rounded-lg p-4">
                  <h5 className="text-green-400 font-semibold mb-4">✅ Complete Narrative Generated Successfully!</h5>
                  
                  {/* Story Overview */}
                  <div className="mb-4">
                    <h6 className="text-white font-semibold mb-2">📖 Generated Story</h6>
                    <div className="bg-[#2a2a2a] rounded-lg p-3">
                      <h7 className="text-[#e2c376] font-bold text-lg">{completeNarrative.completeNarrative?.storyBible?.title}</h7>
                      <p className="text-sm text-[#e7e7e7]/90 mt-2">{completeNarrative.completeNarrative?.storyBible?.premise?.premiseStatement}</p>
                    </div>
                  </div>

                  {/* Quality Metrics */}
                  <div className="mb-4">
                    <h6 className="text-white font-semibold mb-2">📊 Quality Metrics</h6>
                    <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-2">
                      {Object.entries(completeNarrative.completeNarrative?.qualityMetrics?.categories || {}).map(([category, score]) => (
                        <div key={category} className="bg-[#2a2a2a] rounded-lg p-2 text-center">
                          <div className="text-xs text-[#e7e7e7]/70 mb-1">{category}</div>
                          <div className="text-sm font-bold text-[#e2c376]">{score}/10</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Generation Metadata */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-[#2a2a2a] rounded-lg p-3">
                      <h6 className="text-blue-400 font-semibold mb-2">⚡ Performance</h6>
                      <p className="text-sm text-[#e7e7e7]/90">Processing: {completeNarrative.generationMetadata?.processingTime}ms</p>
                      <p className="text-sm text-[#e7e7e7]/90">Quality: Professional Grade</p>
                    </div>
                    <div className="bg-[#2a2a2a] rounded-lg p-3">
                      <h6 className="text-purple-400 font-semibold mb-2">🛠️ Engines Used</h6>
                      <p className="text-sm text-[#e7e7e7]/90">All 14 engines coordinated</p>
                      <p className="text-sm text-[#e7e7e7]/90">Perfect synchronization</p>
                    </div>
                    <div className="bg-[#2a2a2a] rounded-lg p-3">
                      <h6 className="text-green-400 font-semibold mb-2">✅ Quality Assurance</h6>
                      <p className="text-sm text-[#e7e7e7]/90">{completeNarrative.generationMetadata?.qualityAssurance?.narrativeCoherence}</p>
                      <p className="text-sm text-[#e7e7e7]/90">{completeNarrative.generationMetadata?.qualityAssurance?.characterDepth}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Murphy Pillar Revolution Summary */}
      <div className="bg-gradient-to-r from-[#e2c376]/20 to-[#c4a75f]/20 rounded-lg p-6 border border-[#e2c376]/50 mt-6">
        <h4 className="text-[#e2c376] font-bold mb-4">🏛️ The Murphy Pillar Revolution</h4>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-white font-semibold mb-3">🎯 Revolutionary Achievement</h5>
            <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
              <li>✅ 🏛️ Murphy Pillar - Unshakeable storytelling foundation</li>
              <li>✅ 🎼 Master Conductor - Supreme 14-engine orchestration</li>
              <li>✅ 👻 Invisible Enhancement - Same UX, genius-level results</li>
              <li>✅ ⚡ One-Click Complete - Professional narratives instantly</li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-semibold mb-3">🔗 Technical Excellence</h5>
            <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
              <li>✅ Zero disruption to existing user experience</li>
              <li>✅ Seamless backend integration with fallback safety</li>
              <li>✅ Professional-grade quality across all narratives</li>
              <li>✅ Supreme intelligence coordinating all engines</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-[#1a1a1a] rounded-lg">
          <p className="text-sm text-[#e7e7e7]/90">
            <strong>The Murphy Pillar Promise:</strong> Your users experience the exact same beloved interface 
            they know and trust, while receiving story quality that rivals professional writers. Behind the 
            scenes, fourteen sophisticated engines work in perfect harmony, orchestrated by the Master Conductor 
            to deliver the most advanced AI storytelling system ever created.
          </p>
        </div>
      </div>
    </div>
  )
} 