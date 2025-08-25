'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PremiseEngine } from '@/services/premise-engine'
import { Character3DEngine } from '@/services/character-engine'
import { FractalNarrativeEngine } from '@/services/fractal-narrative-engine'
import { IntelligentTropeSystem, TropeDeploymentPlan, TropeAnalysis, TropeStrategy } from '@/services/intelligent-trope-system'

export function IntelligentTropeDemo() {
  const [deploymentPlan, setDeploymentPlan] = useState<TropeDeploymentPlan | null>(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState<TropeAnalysis | null>(null)
  const [activeView, setActiveView] = useState<'overview' | 'analysis' | 'balance'>('overview')
  const [isGenerating, setIsGenerating] = useState(false)

  const generateTropeAnalysis = async () => {
    setIsGenerating(true)
    
    try {
      // Generate story context
      const premise = PremiseEngine.generatePremise(
        'redemption',
        'A former villain must work with their old enemies to save the world, discovering that true strength comes from admitting past mistakes.'
      )
      const premiseEquation = PremiseEngine.expandToEquation(premise, 'redemption story')
      
      // Generate characters
      const protagonist = Character3DEngine.generateProtagonist(premise, premiseEquation, 'redemption story')
      const antagonist = Character3DEngine.generateAntagonist(premise, premiseEquation, protagonist)
      const supporting = Character3DEngine.generateSupportingCharacter('catalyst', premise, [protagonist, antagonist], ['redemption catalyst'])
      
      // Generate narrative arc
      const arc = FractalNarrativeEngine.generateNarrativeArc(premise, [protagonist, antagonist, supporting], 3, 12)
      
      // Generate intelligent trope deployment plan
      const plan = IntelligentTropeSystem.createDeploymentPlan(
        premise,
        [protagonist, antagonist, supporting],
        arc,
        'fantasy',
        'general'
      )
      
      setDeploymentPlan(plan)
      setSelectedAnalysis(plan.tropeDecisions[0]?.analysis || null)
      
    } catch (error) {
      console.error('Error generating trope analysis:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getStrategyColor = (strategy: TropeStrategy): string => {
    const colors = {
      'deploy-straight': 'bg-green-600',
      'deploy-enhanced': 'bg-blue-600',
      'subvert-gentle': 'bg-yellow-600',
      'subvert-strong': 'bg-orange-600',
      'subvert-complete': 'bg-red-600',
      'avoid-entirely': 'bg-gray-600'
    }
    return colors[strategy] || 'bg-gray-600'
  }

  const getStrategyIcon = (strategy: TropeStrategy): string => {
    const icons = {
      'deploy-straight': '✅',
      'deploy-enhanced': '⭐',
      'subvert-gentle': '🔄',
      'subvert-strong': '⚡',
      'subvert-complete': '🔀',
      'avoid-entirely': '❌'
    }
    return icons[strategy] || '❓'
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6 mb-8">
      <h3 className="text-xl font-bold text-[#e2c376] mb-4">🎨 Intelligent Trope System Demo</h3>
      <p className="text-[#e7e7e7]/70 mb-6">
        Experience strategic trope deployment that uses familiar patterns when they serve the story and subverts them only when it strengthens the premise.
      </p>
      
      <button
        onClick={generateTropeAnalysis}
        disabled={isGenerating}
        className="bg-[#e2c376] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#d4b46a] transition-colors mb-6 disabled:opacity-50"
      >
        {isGenerating ? 'Analyzing Tropes...' : 'Generate Intelligent Trope Analysis'}
      </button>

      {/* Strategy Overview */}
      <div className="mb-6 bg-[#2a2a2a] rounded-lg p-4">
        <h4 className="text-[#e2c376] font-bold mb-4">🎯 Strategic Trope Deployment Options</h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-green-400">
            <h5 className="text-green-400 font-semibold text-sm mb-1">✅ DEPLOY STRAIGHT</h5>
            <p className="text-xs text-[#e7e7e7]/90">Use the trope as expected - it serves the story perfectly</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-blue-400">
            <h5 className="text-blue-400 font-semibold text-sm mb-1">⭐ DEPLOY ENHANCED</h5>
            <p className="text-xs text-[#e7e7e7]/90">Use the trope but add unique, premise-driven elements</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-yellow-400">
            <h5 className="text-yellow-400 font-semibold text-sm mb-1">🔄 SUBVERT GENTLE</h5>
            <p className="text-xs text-[#e7e7e7]/90">Slight twist that surprises but still satisfies expectations</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-orange-400">
            <h5 className="text-orange-400 font-semibold text-sm mb-1">⚡ SUBVERT STRONG</h5>
            <p className="text-xs text-[#e7e7e7]/90">Major reversal that better serves the premise</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-red-400">
            <h5 className="text-red-400 font-semibold text-sm mb-1">🔀 SUBVERT COMPLETE</h5>
            <p className="text-xs text-[#e7e7e7]/90">Total inversion for maximum premise alignment</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-gray-400">
            <h5 className="text-gray-400 font-semibold text-sm mb-1">❌ AVOID ENTIRELY</h5>
            <p className="text-xs text-[#e7e7e7]/90">Skip this pattern - doesn't fit the story needs</p>
          </div>
        </div>
      </div>

      {deploymentPlan && (
        <div className="space-y-6">
          {/* Navigation Tabs */}
          <div className="flex justify-center">
            <div className="bg-[#2a2a2a] rounded-lg p-1 flex">
              {(['overview', 'analysis', 'balance'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === view 
                      ? 'bg-[#e2c376] text-black' 
                      : 'text-[#e7e7e7]/70 hover:bg-[#36393f]'
                  }`}
                >
                  {view === 'overview' ? '📋 Overview' : 
                   view === 'analysis' ? '🔍 Analysis' : 
                   '⚖️ Balance'}
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
              {/* Story Context */}
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <h4 className="text-[#e2c376] font-bold mb-3">📖 Story Context</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Premise:</strong> {deploymentPlan.storyContext.premise.premiseStatement}</p>
                    <p><strong>Theme:</strong> {deploymentPlan.storyContext.premise.theme}</p>
                    <p><strong>Genre:</strong> {deploymentPlan.storyContext.genre}</p>
                  </div>
                  <div>
                    <p><strong>Target Audience:</strong> {deploymentPlan.storyContext.targetAudience}</p>
                    <p><strong>Main Characters:</strong> {deploymentPlan.storyContext.characters.length}</p>
                    <p><strong>Tropes Analyzed:</strong> {deploymentPlan.tropeDecisions.length}</p>
                  </div>
                </div>
              </div>

              {/* Trope Decisions */}
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <h4 className="text-[#e2c376] font-bold mb-4">🎭 Trope Deployment Decisions</h4>
                <div className="space-y-3">
                  {deploymentPlan.tropeDecisions.map((decision, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setSelectedAnalysis(decision.analysis)
                        setActiveView('analysis')
                      }}
                      className="bg-[#1a1a1a] rounded-lg p-4 cursor-pointer hover:bg-[#2a2a2a] transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="text-white font-semibold">{decision.trope.name}</h5>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getStrategyIcon(decision.finalStrategy)}</span>
                          <span className={`text-xs text-white px-2 py-1 rounded ${getStrategyColor(decision.finalStrategy)}`}>
                            {decision.finalStrategy.replace('-', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-[#e7e7e7]/90 mb-2">{decision.trope.description}</p>
                      <p className="text-xs text-[#e7e7e7]/70">
                        <strong>Reasoning:</strong> {decision.analysis.reasoning}
                      </p>
                      <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
                        <div className="text-center">
                          <p className="text-[#e7e7e7]/60">Genre Fit</p>
                          <p className="text-[#e2c376] font-bold">{decision.analysis.genreRelevance}/10</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[#e7e7e7]/60">Premise Service</p>
                          <p className="text-[#e2c376] font-bold">{decision.analysis.premiseService}/10</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[#e7e7e7]/60">Character Fit</p>
                          <p className="text-[#e2c376] font-bold">{decision.analysis.characterFit}/10</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[#e7e7e7]/60">Expected Impact</p>
                          <p className="text-[#e2c376] font-bold">{decision.analysis.predictedImpact.satisfaction}/10</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategic Recommendations */}
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <h4 className="text-[#e2c376] font-bold mb-3">💡 Strategic Recommendations</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-green-400 font-semibold mb-2">Strengths</h5>
                    <ul className="text-sm space-y-1">
                      {deploymentPlan.strengthAreas.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-400">✓</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-yellow-400 font-semibold mb-2">Recommendations</h5>
                    <ul className="text-sm space-y-1">
                      {deploymentPlan.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-400">→</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {deploymentPlan.potentialRisks.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-red-400 font-semibold mb-2">Potential Risks</h5>
                    <ul className="text-sm space-y-1">
                      {deploymentPlan.potentialRisks.map((risk, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-400">⚠</span>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Analysis View */}
          {activeView === 'analysis' && selectedAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Detailed Trope Analysis */}
              <div className="bg-[#2a2a2a] rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-[#e2c376] font-bold text-xl">{selectedAnalysis.trope.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getStrategyIcon(selectedAnalysis.recommendedStrategy)}</span>
                    <span className={`text-sm text-white px-3 py-1 rounded-lg ${getStrategyColor(selectedAnalysis.recommendedStrategy)}`}>
                      {selectedAnalysis.recommendedStrategy.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <p className="text-[#e7e7e7]/90 mb-4">{selectedAnalysis.trope.description}</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-[#1a1a1a] rounded-lg p-4">
                      <h5 className="text-[#e2c376] font-semibold mb-2">📊 Effectiveness Scores</h5>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Genre Relevance</span>
                            <span className="text-sm font-bold">{selectedAnalysis.genreRelevance}/10</span>
                          </div>
                          <div className="w-full bg-[#36393f] rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${selectedAnalysis.genreRelevance * 10}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Premise Service</span>
                            <span className="text-sm font-bold">{selectedAnalysis.premiseService}/10</span>
                          </div>
                          <div className="w-full bg-[#36393f] rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${selectedAnalysis.premiseService * 10}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Character Fit</span>
                            <span className="text-sm font-bold">{selectedAnalysis.characterFit}/10</span>
                          </div>
                          <div className="w-full bg-[#36393f] rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full" 
                              style={{ width: `${selectedAnalysis.characterFit * 10}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Audience Expectation</span>
                            <span className="text-sm font-bold">{selectedAnalysis.audienceExpectation}/10</span>
                          </div>
                          <div className="w-full bg-[#36393f] rounded-full h-2">
                            <div 
                              className="bg-yellow-500 h-2 rounded-full" 
                              style={{ width: `${selectedAnalysis.audienceExpectation * 10}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-[#1a1a1a] rounded-lg p-4">
                      <h5 className="text-[#e2c376] font-semibold mb-2">🎯 Predicted Impact</h5>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="text-center">
                          <p className="text-[#e7e7e7]/60">Emotional</p>
                          <p className="text-[#e2c376] font-bold">{selectedAnalysis.predictedImpact.emotional}/10</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[#e7e7e7]/60">Surprise</p>
                          <p className="text-[#e2c376] font-bold">{selectedAnalysis.predictedImpact.surprise}/10</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[#e7e7e7]/60">Satisfaction</p>
                          <p className="text-[#e2c376] font-bold">{selectedAnalysis.predictedImpact.satisfaction}/10</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[#e7e7e7]/60">Premise Strength</p>
                          <p className="text-[#e2c376] font-bold">{selectedAnalysis.predictedImpact.premiseStrength}/10</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-[#1a1a1a] rounded-lg p-4">
                      <h5 className="text-[#e2c376] font-semibold mb-2">🧠 Strategic Reasoning</h5>
                      <p className="text-sm text-[#e7e7e7]/90">{selectedAnalysis.reasoning}</p>
                    </div>
                    
                    <div className="bg-[#1a1a1a] rounded-lg p-4">
                      <h5 className="text-[#e2c376] font-semibold mb-2">⚙️ Implementation</h5>
                      {selectedAnalysis.executionNotes && (
                        <div>
                          <p className="text-green-400 font-bold text-sm mb-2">Execution Notes:</p>
                          <ul className="text-sm space-y-1">
                            {selectedAnalysis.executionNotes.map((note, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-green-400">•</span>
                                <span>{note}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {selectedAnalysis.subversionApproach && (
                        <div className="mt-3">
                          <p className="text-orange-400 font-bold text-sm mb-2">Subversion Approach:</p>
                          <p className="text-sm text-[#e7e7e7]/90">{selectedAnalysis.subversionApproach}</p>
                        </div>
                      )}
                      
                      {selectedAnalysis.subversionRisks && selectedAnalysis.subversionRisks.length > 0 && (
                        <div className="mt-3">
                          <p className="text-red-400 font-bold text-sm mb-2">Subversion Risks:</p>
                          <ul className="text-sm space-y-1">
                            {selectedAnalysis.subversionRisks.map((risk, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-red-400">⚠</span>
                                <span>{risk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-[#1a1a1a] rounded-lg p-4">
                      <h5 className="text-[#e2c376] font-semibold mb-2">📚 Trope Function</h5>
                      <div className="space-y-2 text-sm">
                        <p><strong>Narrative Function:</strong> {selectedAnalysis.trope.narrative_function}</p>
                        <p><strong>Emotional Purpose:</strong> {selectedAnalysis.trope.emotional_purpose}</p>
                        <p><strong>Audience Benefit:</strong> {selectedAnalysis.trope.audience_benefit}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Balance View */}
          {activeView === 'balance' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Story Balance Metrics */}
              <div className="bg-[#2a2a2a] rounded-lg p-6">
                <h4 className="text-[#e2c376] font-bold mb-4">⚖️ Story Balance Analysis</h4>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold">Familiarity Score</span>
                        <span className="font-bold text-[#e2c376]">{deploymentPlan.balance.familiarityScore}/10</span>
                      </div>
                      <div className="w-full bg-[#36393f] rounded-full h-3">
                        <div 
                          className="bg-blue-500 h-3 rounded-full" 
                          style={{ width: `${deploymentPlan.balance.familiarityScore * 10}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-[#e7e7e7]/70 mt-1">How familiar vs surprising the story feels</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold">Originality Score</span>
                        <span className="font-bold text-[#e2c376]">{deploymentPlan.balance.originalityScore}/10</span>
                      </div>
                      <div className="w-full bg-[#36393f] rounded-full h-3">
                        <div 
                          className="bg-purple-500 h-3 rounded-full" 
                          style={{ width: `${deploymentPlan.balance.originalityScore * 10}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-[#e7e7e7]/70 mt-1">How original vs traditional the approach is</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold">Premise Service</span>
                        <span className="font-bold text-[#e2c376]">{deploymentPlan.balance.premiseService}/10</span>
                      </div>
                      <div className="w-full bg-[#36393f] rounded-full h-3">
                        <div 
                          className="bg-green-500 h-3 rounded-full" 
                          style={{ width: `${deploymentPlan.balance.premiseService * 10}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-[#e7e7e7]/70 mt-1">How well tropes serve the premise</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold">Audience Satisfaction</span>
                        <span className="font-bold text-[#e2c376]">{deploymentPlan.balance.audienceSatisfaction}/10</span>
                      </div>
                      <div className="w-full bg-[#36393f] rounded-full h-3">
                        <div 
                          className="bg-yellow-500 h-3 rounded-full" 
                          style={{ width: `${deploymentPlan.balance.audienceSatisfaction * 10}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-[#e7e7e7]/70 mt-1">Predicted audience satisfaction</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-[#1a1a1a] rounded-lg">
                  <h5 className="text-[#e2c376] font-bold mb-2">🎯 Balance Interpretation</h5>
                  <p className="text-sm text-[#e7e7e7]/90">
                    {deploymentPlan.balance.familiarityScore > 7 && deploymentPlan.balance.originalityScore < 4 && (
                      "Story relies heavily on familiar patterns. Consider adding more original elements."
                    )}
                    {deploymentPlan.balance.originalityScore > 7 && deploymentPlan.balance.familiarityScore < 4 && (
                      "Story is highly original but may challenge audience expectations. Consider grounding with some familiar elements."
                    )}
                    {deploymentPlan.balance.familiarityScore >= 4 && deploymentPlan.balance.familiarityScore <= 7 && 
                     deploymentPlan.balance.originalityScore >= 4 && deploymentPlan.balance.originalityScore <= 7 && (
                      "Excellent balance between familiar and original elements. This approach should satisfy audiences while offering surprises."
                    )}
                    {deploymentPlan.balance.premiseService >= 8 && (
                      " Trope choices strongly support the premise."
                    )}
                    {deploymentPlan.balance.premiseService < 6 && (
                      " Consider aligning trope decisions more closely with premise proof."
                    )}
                  </p>
                </div>
              </div>

              {/* Strategy Distribution */}
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <h4 className="text-[#e2c376] font-bold mb-4">📊 Strategy Distribution</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(
                    deploymentPlan.tropeDecisions.reduce((acc, decision) => {
                      acc[decision.finalStrategy] = (acc[decision.finalStrategy] || 0) + 1
                      return acc
                    }, {} as Record<TropeStrategy, number>)
                  ).map(([strategy, count]) => (
                    <div key={strategy} className="bg-[#1a1a1a] rounded-lg p-3 text-center">
                      <div className="text-2xl mb-1">{getStrategyIcon(strategy as TropeStrategy)}</div>
                      <div className="text-sm font-semibold">{strategy.replace('-', ' ').toUpperCase()}</div>
                      <div className="text-[#e2c376] font-bold">{count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Intelligent Trope Revolution Summary */}
          <div className="bg-gradient-to-r from-[#e2c376]/20 to-[#c4a75f]/20 rounded-lg p-6 border border-[#e2c376]/50">
            <h4 className="text-[#e2c376] font-bold mb-4">🚀 Intelligent Trope Revolution</h4>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h5 className="text-white font-semibold mb-3">🎯 Strategic Analysis</h5>
                <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
                  <li>✅ Genre relevance scoring</li>
                  <li>✅ Premise service evaluation</li>
                  <li>✅ Character fit analysis</li>
                  <li>✅ Audience expectation mapping</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-3">⚖️ Smart Deployment</h5>
                <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
                  <li>✅ Use when effective</li>
                  <li>✅ Enhance when good</li>
                  <li>✅ Subvert when beneficial</li>
                  <li>✅ Avoid when harmful</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-3">🎨 Balance Mastery</h5>
                <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
                  <li>✅ Familiarity vs originality</li>
                  <li>✅ Audience satisfaction</li>
                  <li>✅ Premise strengthening</li>
                  <li>✅ Strategic recommendations</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-[#1a1a1a] rounded-lg">
              <p className="text-sm text-[#e7e7e7]/90">
                <strong>The Intelligence Principle:</strong> Tropes exist because they work. Smart storytelling knows when 
                to embrace familiar patterns and when to subvert them. The goal is premise service, not blind originality.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 