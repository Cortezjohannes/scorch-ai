'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PremiseEngine } from '@/services/premise-engine'
import { Character3DEngine } from '@/services/character-engine'
import { FractalNarrativeEngine } from '@/services/fractal-narrative-engine'
import { LivingWorldEngine } from '@/services/living-world-engine'
import { 
  InteractiveChoiceEngine, 
  InteractiveChoice, 
  NarrativeBranch, 
  ConvergencePoint,
  EscapeHatch,
  ButterflyAnalysis,
  QuantumChoice
} from '@/services/interactive-choice-engine'

export function InteractiveChoiceDemo() {
  const [currentBranch, setCurrentBranch] = useState<NarrativeBranch | null>(null)
  const [availableChoices, setAvailableChoices] = useState<InteractiveChoice[]>([])
  const [choiceHistory, setChoiceHistory] = useState<any[]>([])
  const [butterflyEffects, setButterflyEffects] = useState<ButterflyAnalysis | null>(null)
  const [convergencePoints, setConvergencePoints] = useState<ConvergencePoint[]>([])
  const [quantumState, setQuantumState] = useState<QuantumChoice | null>(null)
  const [activeView, setActiveView] = useState<'choices' | 'branches' | 'effects' | 'quantum'>('choices')
  const [isGenerating, setIsGenerating] = useState(false)
  const [storyState, setStoryState] = useState<any>(null)
  const [escapeHatches, setEscapeHatches] = useState<EscapeHatch[]>([])
  const [derailmentRisk, setDerailmentRisk] = useState(0)

  const initializeChoiceSystem = async () => {
    setIsGenerating(true)
    
    try {
      // Create story foundation
      const premise = PremiseEngine.generatePremise(
        'sacrifice',
        'A resistance leader must choose between saving their captured team or protecting crucial intel that could end the war, knowing they cannot do both.'
      )
      
      // Generate characters
      const protagonist = Character3DEngine.generateProtagonist(premise, PremiseEngine.expandToEquation(premise, 'war sacrifice'), 'resistance leadership')
      const antagonist = Character3DEngine.generateAntagonist(premise, PremiseEngine.expandToEquation(premise, 'war sacrifice'), protagonist)
      const ally = Character3DEngine.generateSupportingCharacter('ally', premise, [protagonist, antagonist], ['loyal friend'])
      
      // Create world state
      const worldState = LivingWorldEngine.initializeWorldState(
        premise,
        [protagonist, antagonist, ally],
        FractalNarrativeEngine.generateNarrativeArc(premise, [protagonist, antagonist, ally], 2, 8),
        generateWarTimeLocations()
      )
      
      // Create initial branch
      const initialBranch: NarrativeBranch = {
        id: 'main-branch',
        originChoice: 'story-start',
        name: 'Main Timeline',
        description: 'The original story path where hard choices define the hero',
        thematicShift: 'none',
        branchedEpisode: 1,
        currentEpisode: 1,
        worldState,
        characterStates: [
          {
            character: protagonist,
            branchSpecificTraits: ['torn by duty'],
            relationships: [{ with: ally.name, status: 'trusting', strength: 8 }],
            stressLevel: 7
          }
        ],
        convergenceSchedule: {
          upcomingPoints: [],
          nextMajorConvergence: 5,
          flexibilityWindow: 2
        },
        branchSpecificElements: [
          { type: 'location', name: 'Resistance Hideout', status: 'safe for now' }
        ],
        escapeHatches: [],
        derailmentRisk: 3,
        choiceHistory: [],
        playerInvestment: {
          emotionalAttachment: 6,
          timeInvested: 0,
          consequencesExperienced: 0
        }
      }
      
      // Generate initial choices
      const initialChoices = generateDemoChoices(premise, protagonist, ally)
      
      // Create convergence points
      const convergencePoints: ConvergencePoint[] = [
        {
          id: 'final-confrontation',
          name: 'The Final Confrontation',
          targetEpisode: 6,
          convergenceType: 'inevitable',
          convergenceForce: 9,
          narrativeJustification: 'All paths lead to facing the enemy',
          premiseService: 'Final test of sacrifice vs victory',
          convergenceScars: [],
          lastingDifferences: [],
          requiredElements: [
            { element: 'protagonist alive', flexibility: 'none' },
            { element: 'intel status determined', flexibility: 'high' }
          ],
          flexibleElements: [
            { element: 'team composition', adaptability: 'high' },
            { element: 'location details', adaptability: 'moderate' }
          ]
        }
      ]
      
      // Generate escape hatches
      const escapeHatches: EscapeHatch[] = [
        {
          id: 'peaceful-resolution',
          name: 'The Diplomatic Solution',
          triggerChoice: 'attempt-negotiation',
          escapeType: 'major-pivot',
          derailmentLevel: 'thematic',
          activationRequirements: [
            { condition: 'player chose peaceful options before', probability: 0.7 }
          ],
          newStoryDirection: {
            newGenre: 'political thriller',
            newPremise: 'Diplomacy over violence leads to unexpected alliances',
            newProtagonist: 'same character, different role'
          },
          emergencyNarrative: {
            fallbackPlot: 'negotiation and intrigue',
            characterContinuity: 'maintained with new motivations',
            worldConsistency: 'same world, different conflict resolution'
          },
          premiseHandling: {
            originalPremise: 'evolved',
            newPremise: 'Words can be mightier than swords when sacrifice means swallowing pride',
            transition: 'gradual shift'
          },
          thematicShift: {
            from: 'sacrifice in war',
            to: 'sacrifice of ego for peace',
            bridgeMethod: 'character growth revelation'
          },
          storyCoherence: 8,
          playerSatisfaction: 7,
          narrativeValue: 9
        }
      ]
      
      setStoryState({ premise, characters: [protagonist, antagonist, ally], worldState })
      setCurrentBranch(initialBranch)
      setAvailableChoices(initialChoices)
      setConvergencePoints(convergencePoints)
      setEscapeHatches(escapeHatches)
      setDerailmentRisk(3)
      
    } catch (error) {
      console.error('Error initializing choice system:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const makeChoice = (choiceId: string) => {
    if (!currentBranch || !storyState) return
    
    const choice = availableChoices.find(c => c.id === choiceId)
    if (!choice) return
    
    // Add to history
    const newHistoryEntry = {
      episode: currentBranch.currentEpisode,
      choice,
      consequences: choice.immediateConsequences,
      timestamp: Date.now()
    }
    
    const updatedHistory = [...choiceHistory, newHistoryEntry]
    setChoiceHistory(updatedHistory)
    
    // Handle choice consequences and branching
    let updatedBranch = { ...currentBranch }
    let newChoices: InteractiveChoice[] = []
    
    // Check for escape hatch activation
    const triggeringEscape = escapeHatches.find(eh => eh.triggerChoice === choiceId)
    if (triggeringEscape && Math.random() > 0.7) { // 30% chance of activation
      // STORY DERAILMENT!
      updatedBranch = {
        ...updatedBranch,
        name: `${updatedBranch.name} → ${triggeringEscape.name}`,
        description: `DERAILED: ${triggeringEscape.newStoryDirection.newPremise}`,
        thematicShift: triggeringEscape.thematicShift.to,
        derailmentRisk: 0, // Reset after successful derailment
        escapeHatches: [] // Clear escape hatches after derailment
      }
      
      newChoices = generatePostEscapeChoices(triggeringEscape, choice)
      setDerailmentRisk(0)
      
    } else {
      // Normal choice processing
      if (choice.type === 'premise-testing') {
        updatedBranch.worldState.premiseProgression = Math.min(
          updatedBranch.worldState.premiseProgression + 15, 
          100
        )
      }
      
      // Generate follow-up choices
      newChoices = generateFollowUpChoices(choice, updatedBranch, storyState.premise)
      
      // Increase derailment risk slightly
      setDerailmentRisk(prev => Math.min(prev + 1, 10))
    }
    
    // Update butterfly effects
    const butterflyAnalysis = InteractiveChoiceEngine.trackButterflyEffects(
      updatedHistory,
      updatedBranch.worldState,
      updatedBranch.currentEpisode
    )
    setButterflyEffects(butterflyAnalysis)
    
    // Check for quantum states
    if (choice.magnitude === 'pivotal' && newChoices.length > 2) {
      const quantum = InteractiveChoiceEngine.createQuantumChoice(
        newChoices.slice(0, 3),
        updatedBranch.worldState,
        storyState.premise
      )
      setQuantumState(quantum)
    }
    
    updatedBranch.currentEpisode += 1
    setCurrentBranch(updatedBranch)
    setAvailableChoices(newChoices)
  }

  const generateDemoChoices = (premise: any, protagonist: any, ally: any): InteractiveChoice[] => [
    {
      id: 'save-team',
      text: 'Prioritize rescuing the captured team members',
      description: 'Rush to save your loyal friends, knowing the intel might be lost forever',
      type: 'character-defining',
      magnitude: 'major',
      scope: 'interpersonal',
      premiseAlignment: {
        supports: 'Loyalty over strategy',
        tests: 'Personal bonds vs greater good',
        proves: 'Some things matter more than victory'
      },
      premiseTest: 'Will personal loyalty trump strategic thinking?',
      immediateConsequences: [
        {
          id: 'team-saved',
          description: 'Team members rescued but intel compromised',
          affectedElements: [{ type: 'relationship', target: 'team', change: '+loyalty' }],
          severity: 6,
          immediateEffect: 'Team morale boost',
          delayedEffect: { description: 'Enemy adapts to compromised intel', delay: 2 },
          cascadeRisk: 7,
          butterflyPotential: [
            {
              description: 'Saved team member becomes crucial in final battle',
              probabilityThreshold: 0.6,
              cascadeDelay: 3,
              ultimateImpact: 'Alternative victory path opens'
            }
          ],
          reversible: false
        }
      ],
      longTermEffects: [
        {
          description: 'War continues longer due to lost intel',
          episodes: [4, 5, 6],
          severity: 8
        }
      ],
      requirements: [],
      branchingPotential: {
        branchCount: 2,
        divergenceLevel: 'moderate',
        convergenceLikelihood: 0.6
      },
      emotionalAppeal: {
        primaryEmotion: 'loyalty',
        moralWeight: 8,
        personalStakes: 9
      },
      moralComplexity: {
        clearRight: false,
        grayAreas: ['loyalty vs duty', 'few vs many'],
        philosophicalDepth: 7
      },
      difficultyLevel: 8
    },
    {
      id: 'protect-intel',
      text: 'Secure the intel and let the team fend for themselves',
      description: 'Make the hard strategic choice that could end the war sooner',
      type: 'premise-testing',
      magnitude: 'pivotal',
      scope: 'global',
      premiseAlignment: {
        supports: 'Strategic sacrifice for greater good',
        tests: 'Personal cost of leadership',
        proves: 'Victory requires impossible choices'
      },
      premiseTest: 'Can strategic thinking overcome personal loyalty?',
      immediateConsequences: [
        {
          id: 'intel-secured',
          description: 'Intel secured but team potentially lost',
          affectedElements: [{ type: 'war-effort', target: 'intel', change: '+strategic-advantage' }],
          severity: 7,
          immediateEffect: 'Strategic advantage gained',
          delayedEffect: { description: 'Guilt and team resentment', delay: 1 },
          cascadeRisk: 6,
          butterflyPotential: [
            {
              description: 'Intel leads to quick war victory but protagonist becomes isolated',
              probabilityThreshold: 0.7,
              cascadeDelay: 2,
              ultimateImpact: 'Pyrrhic victory - win war, lose humanity'
            }
          ],
          reversible: false
        }
      ],
      longTermEffects: [
        {
          description: 'War ends sooner but at personal cost',
          episodes: [3, 4],
          severity: 9
        }
      ],
      requirements: [],
      branchingPotential: {
        branchCount: 3,
        divergenceLevel: 'major',
        convergenceLikelihood: 0.4
      },
      emotionalAppeal: {
        primaryEmotion: 'duty',
        moralWeight: 9,
        personalStakes: 8
      },
      moralComplexity: {
        clearRight: false,
        grayAreas: ['utilitarian ethics', 'leadership burdens'],
        philosophicalDepth: 9
      },
      difficultyLevel: 9
    },
    {
      id: 'attempt-negotiation',
      text: 'Try an impossible third option: negotiate',
      description: 'Risk everything on a desperate diplomatic gambit',
      type: 'escape-triggering',
      magnitude: 'catastrophic',
      scope: 'meta',
      premiseAlignment: {
        supports: 'Creative solutions over binary choices',
        tests: 'Willingness to break narrative expectations',
        proves: 'Sometimes the story itself can be changed'
      },
      premiseTest: 'Will you accept the story\'s limitations or try to transcend them?',
      immediateConsequences: [
        {
          id: 'negotiation-attempt',
          description: 'Story derailment possibility activated',
          affectedElements: [{ type: 'narrative', target: 'story-structure', change: '+flexibility' }],
          severity: 10,
          immediateEffect: 'Escape hatch activated',
          cascadeRisk: 10,
          butterflyPotential: [
            {
              description: 'Story becomes entirely different',
              probabilityThreshold: 0.3,
              cascadeDelay: 0,
              ultimateImpact: 'Genre shift to political thriller'
            }
          ],
          reversible: false
        }
      ],
      longTermEffects: [],
      requirements: [],
      branchingPotential: {
        branchCount: 1,
        divergenceLevel: 'catastrophic',
        convergenceLikelihood: 0.1
      },
      escapeHatch: escapeHatches[0], // Would be properly linked
      emotionalAppeal: {
        primaryEmotion: 'hope',
        moralWeight: 6,
        personalStakes: 10
      },
      moralComplexity: {
        clearRight: false,
        grayAreas: ['player agency vs narrative integrity'],
        philosophicalDepth: 10
      },
      difficultyLevel: 10
    }
  ]

  const generateWarTimeLocations = () => [
    {
      id: 'hideout',
      name: 'Resistance Hideout',
      type: { category: 'secret', characteristics: ['hidden', 'temporary'] },
      description: 'Underground bunker serving as rebel headquarters',
      atmosphere: { mood: 'tense', tension: 7, energy: 'high' },
      significance: { narrativeImportance: 8, premiseRelevance: 7, characterAttachment: ['protagonist'] },
      evolutionHistory: [],
      currentPhase: { current: 'operational', duration: 3 },
      narrativeRole: { function: 'safe haven', premiseService: 'represents what we fight for' },
      premiseReflection: 'The fragile hope that drives resistance',
      activeCharacters: [],
      keyEvents: []
    }
  ]

  const generateFollowUpChoices = (previousChoice: InteractiveChoice, branch: NarrativeBranch, premise: any): InteractiveChoice[] => {
    if (previousChoice.id === 'save-team') {
      return [
        {
          id: 'regroup-hideout',
          text: 'Regroup at the hideout with the rescued team',
          description: 'Plan your next move with your loyal friends by your side',
          type: 'plot-advancing',
          magnitude: 'minor',
          scope: 'interpersonal',
          premiseAlignment: {
            supports: 'Strength through unity',
            tests: 'Team coordination under pressure',
            proves: 'Loyalty breeds loyalty'
          },
          premiseTest: 'Can teamwork overcome strategic disadvantage?',
          immediateConsequences: [],
          longTermEffects: [],
          requirements: [],
          branchingPotential: { branchCount: 2, divergenceLevel: 'minor', convergenceLikelihood: 0.8 },
          emotionalAppeal: { primaryEmotion: 'relief', moralWeight: 5, personalStakes: 6 },
          moralComplexity: { clearRight: true, grayAreas: [], philosophicalDepth: 3 },
          difficultyLevel: 4
        }
      ]
    }
    
    if (previousChoice.id === 'protect-intel') {
      return [
        {
          id: 'analyze-intel',
          text: 'Study the intel to find the enemy\'s weakness',
          description: 'Use the hard-won intelligence to plan a decisive strike',
          type: 'plot-advancing',
          magnitude: 'major',
          scope: 'global',
          premiseAlignment: {
            supports: 'Strategic thinking pays off',
            tests: 'Ability to act on difficult choices',
            proves: 'Sacrifice can lead to victory'
          },
          premiseTest: 'Will the strategic sacrifice prove worthwhile?',
          immediateConsequences: [],
          longTermEffects: [],
          requirements: [],
          branchingPotential: { branchCount: 2, divergenceLevel: 'moderate', convergenceLikelihood: 0.7 },
          emotionalAppeal: { primaryEmotion: 'determination', moralWeight: 7, personalStakes: 8 },
          moralComplexity: { clearRight: false, grayAreas: ['ends justify means'], philosophicalDepth: 6 },
          difficultyLevel: 6
        }
      ]
    }
    
    return []
  }

  const generatePostEscapeChoices = (escapeHatch: EscapeHatch, triggerChoice: InteractiveChoice): InteractiveChoice[] => [
    {
      id: 'diplomatic-mission',
      text: 'Arrange a secret meeting with enemy leadership',
      description: 'Risk everything on the possibility of peace',
      type: 'plot-advancing',
      magnitude: 'major',
      scope: 'global',
      premiseAlignment: {
        supports: escapeHatch.newStoryDirection.newPremise,
        tests: 'Faith in human decency',
        proves: 'Communication can bridge any divide'
      },
      premiseTest: 'Can words succeed where weapons have failed?',
      immediateConsequences: [],
      longTermEffects: [],
      requirements: [],
      branchingPotential: { branchCount: 3, divergenceLevel: 'major', convergenceLikelihood: 0.5 },
      emotionalAppeal: { primaryEmotion: 'hope', moralWeight: 9, personalStakes: 10 },
      moralComplexity: { clearRight: false, grayAreas: ['trust vs caution'], philosophicalDepth: 8 },
      difficultyLevel: 9
    }
  ]

  const getChoiceTypeColor = (type: string) => {
    const colors = {
      'character-defining': 'border-purple-400',
      'premise-testing': 'border-yellow-400',
      'plot-advancing': 'border-blue-400',
      'escape-triggering': 'border-red-400',
      'relationship-shaping': 'border-green-400'
    }
    return colors[type as keyof typeof colors] || 'border-gray-400'
  }

  const getMagnitudeIcon = (magnitude: string) => {
    const icons = {
      'micro': '◦',
      'minor': '•',
      'moderate': '●',
      'major': '◉',
      'pivotal': '⬢',
      'catastrophic': '💥'
    }
    return icons[magnitude as keyof typeof icons] || '◦'
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6 mb-8">
      <h3 className="text-xl font-bold text-[#e2c376] mb-4">🎮 Interactive Choice Engine Demo</h3>
      <p className="text-[#e7e7e7]/70 mb-6">
        Experience sophisticated branching narratives with intelligent convergence, meaningful consequences, 
        and dramatic escape hatches that can completely derail the storyline when the story demands it.
      </p>
      
      <button
        onClick={initializeChoiceSystem}
        disabled={isGenerating}
        className="bg-[#e2c376] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#d4b46a] transition-colors mb-6 disabled:opacity-50"
      >
        {isGenerating ? 'Initializing Choice System...' : 'Initialize Interactive Story'}
      </button>

      {/* Choice System Architecture */}
      <div className="mb-6 bg-[#2a2a2a] rounded-lg p-4">
        <h4 className="text-[#e2c376] font-bold mb-4">⚙️ Choice System Architecture</h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-purple-400">
            <h5 className="text-purple-400 font-semibold text-sm mb-1">🌀 BRANCHING LOGIC</h5>
            <p className="text-xs text-[#e7e7e7]/90">Choices create meaningful story divergence</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-blue-400">
            <h5 className="text-blue-400 font-semibold text-sm mb-1">🔄 SMART CONVERGENCE</h5>
            <p className="text-xs text-[#e7e7e7]/90">Branches reunite while preserving differences</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-yellow-400">
            <h5 className="text-yellow-400 font-semibold text-sm mb-1">🦋 BUTTERFLY EFFECTS</h5>
            <p className="text-xs text-[#e7e7e7]/90">Small choices cascade into major changes</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-red-400">
            <h5 className="text-red-400 font-semibold text-sm mb-1">🚪 ESCAPE HATCHES</h5>
            <p className="text-xs text-[#e7e7e7]/90">Dramatic derailment when story demands it</p>
          </div>
        </div>
      </div>

      {currentBranch && (
        <div className="space-y-6">
          {/* Story Status */}
          <div className="bg-[#2a2a2a] rounded-lg p-4">
            <h4 className="text-[#e2c376] font-bold mb-3">📖 Current Story State</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p><strong>Branch:</strong> {currentBranch.name}</p>
                <p><strong>Episode:</strong> {currentBranch.currentEpisode}</p>
                <p><strong>Theme:</strong> {currentBranch.thematicShift || 'Original'}</p>
              </div>
              <div>
                <p><strong>Premise Progress:</strong> {currentBranch.worldState.premiseProgression}%</p>
                <p><strong>Choices Made:</strong> {choiceHistory.length}</p>
                <p><strong>Derailment Risk:</strong> {derailmentRisk}/10</p>
              </div>
              <div>
                <p><strong>Active Effects:</strong> {butterflyEffects?.activeEffects.length || 0}</p>
                <p><strong>Emerging Effects:</strong> {butterflyEffects?.emergingEffects.length || 0}</p>
                <p><strong>Escape Hatches:</strong> {escapeHatches.length}</p>
              </div>
            </div>
            
            {currentBranch.description && (
              <div className="mt-3 p-3 bg-[#1a1a1a] rounded">
                <p className="text-sm text-[#e7e7e7]/90">{currentBranch.description}</p>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex justify-center">
            <div className="bg-[#2a2a2a] rounded-lg p-1 flex">
              {(['choices', 'branches', 'effects', 'quantum'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === view 
                      ? 'bg-[#e2c376] text-black' 
                      : 'text-[#e7e7e7]/70 hover:bg-[#36393f]'
                  }`}
                >
                  {view === 'choices' ? '🎯 Choices' : 
                   view === 'branches' ? '🌿 Branches' : 
                   view === 'effects' ? '🦋 Effects' : 
                   '⚛️ Quantum'}
                </button>
              ))}
            </div>
          </div>

          {/* Choices View */}
          {activeView === 'choices' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <h4 className="text-[#e2c376] font-bold mb-4">🎯 Available Choices</h4>
                
                {availableChoices.length > 0 ? (
                  <div className="space-y-4">
                    {availableChoices.map((choice, index) => (
                      <motion.div
                        key={choice.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => makeChoice(choice.id)}
                        className={`bg-[#1a1a1a] rounded-lg p-4 cursor-pointer hover:bg-[#2a2a2a] transition-colors border-l-4 ${getChoiceTypeColor(choice.type)}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="text-white font-semibold flex items-center gap-2">
                            <span className="text-lg">{getMagnitudeIcon(choice.magnitude)}</span>
                            {choice.text}
                          </h5>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-[#36393f] px-2 py-1 rounded">
                              {choice.type.replace('-', ' ').toUpperCase()}
                            </span>
                            <span className="text-xs bg-[#e2c376] text-black px-2 py-1 rounded font-bold">
                              {choice.magnitude.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-[#e7e7e7]/90 mb-3">{choice.description}</p>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="text-[#e2c376] font-semibold mb-1">Premise Test:</p>
                            <p className="text-[#e7e7e7]/80">{choice.premiseTest}</p>
                          </div>
                          <div>
                            <p className="text-[#e2c376] font-semibold mb-1">Branching:</p>
                            <p className="text-[#e7e7e7]/80">
                              {choice.branchingPotential.branchCount} paths, 
                              {Math.round(choice.branchingPotential.convergenceLikelihood * 100)}% convergence
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex justify-between items-center text-xs">
                          <div className="flex gap-4">
                            <span>Moral Weight: {choice.moralComplexity.philosophicalDepth}/10</span>
                            <span>Difficulty: {choice.difficultyLevel}/10</span>
                          </div>
                          {choice.escapeHatch && (
                            <span className="bg-red-600 text-white px-2 py-1 rounded">
                              🚪 ESCAPE HATCH
                            </span>
                          )}
                        </div>
                        
                        {choice.immediateConsequences.length > 0 && (
                          <div className="mt-3 p-2 bg-[#2a2a2a] rounded">
                            <p className="text-xs text-[#e2c376] font-semibold mb-1">Immediate Consequences:</p>
                            {choice.immediateConsequences.map((cons, i) => (
                              <p key={i} className="text-xs text-[#e7e7e7]/90">
                                • {cons.description} (Severity: {cons.severity}/10)
                              </p>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#e7e7e7]/50">
                    <p>Initialize the story to see available choices!</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Butterfly Effects View */}
          {activeView === 'effects' && butterflyEffects && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <h4 className="text-[#e2c376] font-bold mb-4">🦋 Butterfly Effect Analysis</h4>
                
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-400">{butterflyEffects.activeEffects.length}</p>
                    <p className="text-xs text-[#e7e7e7]/70">Active Effects</p>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-yellow-400">{butterflyEffects.emergingEffects.length}</p>
                    <p className="text-xs text-[#e7e7e7]/70">Emerging Effects</p>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-red-400">{Math.round(butterflyEffects.systemicRisk * 10)}/10</p>
                    <p className="text-xs text-[#e7e7e7]/70">Systemic Risk</p>
                  </div>
                </div>
                
                {butterflyEffects.activeEffects.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="text-white font-semibold">🌪️ Active Butterfly Effects</h5>
                    {butterflyEffects.activeEffects.map((effect, index) => (
                      <div key={index} className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-green-400">
                        <p className="text-sm font-semibold text-green-400 mb-1">
                          Effect #{index + 1} - Episode {effect.manifestationEpisode}
                        </p>
                        <p className="text-sm text-[#e7e7e7]/90 mb-2">{effect.butterfly.description}</p>
                        <p className="text-xs text-[#e7e7e7]/70">
                          <strong>Ultimate Impact:</strong> {effect.impact}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                
                {butterflyEffects.emergingEffects.length > 0 && (
                  <div className="space-y-3 mt-6">
                    <h5 className="text-white font-semibold">⏳ Emerging Effects</h5>
                    {butterflyEffects.emergingEffects.map((effect, index) => (
                      <div key={index} className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-yellow-400">
                        <p className="text-sm font-semibold text-yellow-400 mb-1">
                          Emerging Effect #{index + 1} - Expected Episode {effect.expectedManifestation}
                        </p>
                        <p className="text-sm text-[#e7e7e7]/90 mb-2">{effect.butterfly.description}</p>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#e7e7e7]/70">
                            Current Probability: {Math.round(effect.currentProbability * 100)}%
                          </span>
                          <div className="w-20 bg-[#36393f] rounded-full h-2">
                            <div 
                              className="bg-yellow-400 h-2 rounded-full" 
                              style={{ width: `${effect.currentProbability * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {butterflyEffects.butterflyStorm && (
                  <div className="mt-6 p-4 bg-red-900/20 rounded-lg border border-red-500/20">
                    <h5 className="text-red-400 font-bold mb-2">🌪️ BUTTERFLY STORM DETECTED!</h5>
                    <p className="text-sm text-[#e7e7e7]/90">
                      Multiple butterfly effects are cascading simultaneously. The story is entering 
                      a period of chaotic change where small actions could have massive consequences.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Choice History */}
          <div className="bg-[#2a2a2a] rounded-lg p-4">
            <h4 className="text-[#e2c376] font-bold mb-4">📚 Choice History</h4>
            {choiceHistory.length > 0 ? (
              <div className="space-y-3">
                {choiceHistory.map((entry, index) => (
                  <div key={index} className="bg-[#1a1a1a] rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold">Episode {entry.episode}: {entry.choice.text}</p>
                      <span className={`text-xs px-2 py-1 rounded ${getChoiceTypeColor(entry.choice.type)} bg-opacity-20`}>
                        {entry.choice.type}
                      </span>
                    </div>
                    <p className="text-sm text-[#e7e7e7]/90">{entry.choice.description}</p>
                    {entry.consequences.length > 0 && (
                      <div className="mt-2 text-xs text-[#e7e7e7]/70">
                        <p><strong>Consequences:</strong> {entry.consequences.length} immediate effects</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#e7e7e7]/50">
                <p>No choices made yet. Make your first choice to begin tracking history!</p>
              </div>
            )}
          </div>

          {/* Interactive Choice Revolution Summary */}
          <div className="bg-gradient-to-r from-[#e2c376]/20 to-[#c4a75f]/20 rounded-lg p-6 border border-[#e2c376]/50">
            <h4 className="text-[#e2c376] font-bold mb-4">🎮 Interactive Choice Revolution</h4>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h5 className="text-white font-semibold mb-3">🌀 Smart Branching</h5>
                <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
                  <li>✅ Meaningful consequences</li>
                  <li>✅ Intelligent convergence</li>
                  <li>✅ Preserved differences</li>
                  <li>✅ Premise-driven choices</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-3">🦋 Cascade Effects</h5>
                <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
                  <li>✅ Butterfly effect tracking</li>
                  <li>✅ Long-term consequences</li>
                  <li>✅ Emergent complexity</li>
                  <li>✅ Systemic change detection</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-3">🚪 Escape Hatches</h5>
                <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
                  <li>✅ Dramatic derailment</li>
                  <li>✅ Story transformation</li>
                  <li>✅ Player agency respect</li>
                  <li>✅ Narrative flexibility</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-[#1a1a1a] rounded-lg">
              <p className="text-sm text-[#e7e7e7]/90">
                <strong>The Choice Revolution:</strong> Every decision matters. Branches diverge meaningfully and converge intelligently. 
                Small choices cascade into major changes. And when the story demands it, dramatic escape hatches allow complete 
                narrative transformation - respecting player agency while maintaining story coherence.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 