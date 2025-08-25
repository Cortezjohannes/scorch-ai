'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  GenreMasterySystem, 
  GenreProfile, 
  GenreMasteredStory, 
  GenreBlend,
  GenreAuthenticity 
} from '@/services/genre-mastery-system'

export function GenreMasteryDemo() {
  const [selectedGenre, setSelectedGenre] = useState<GenreProfile | null>(null)
  const [genreMasteredStory, setGenreMasteredStory] = useState<GenreMasteredStory | null>(null)
  const [genreBlend, setGenreBlend] = useState<GenreBlend | null>(null)
  const [activeView, setActiveView] = useState<'genres' | 'story' | 'blend' | 'authenticity'>('genres')
  const [isGenerating, setIsGenerating] = useState(false)
  const [userInput, setUserInput] = useState({
    synopsis: 'A former assassin discovers their memory has been altered and must uncover the truth while being hunted by their former organization.',
    theme: 'identity',
    targetAudience: 'adult',
    innovationLevel: 7
  })
  const [selectedBlendGenres, setSelectedBlendGenres] = useState<string[]>([])

  const availableGenres = [
    {
      id: 'epic-fantasy',
      name: 'Epic Fantasy',
      icon: '🐉',
      description: 'Large-scale fantasy adventures with magic and heroic quests',
      complexity: 9,
      popularity: 8
    },
    {
      id: 'psychological-thriller',
      name: 'Psychological Thriller',
      icon: '🧠',
      description: 'Suspenseful narratives focused on psychological tension',
      complexity: 8,
      popularity: 7
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk',
      icon: '🤖',
      description: 'High-tech dystopian futures with corporate domination',
      complexity: 9,
      popularity: 6
    },
    {
      id: 'romantic-comedy',
      name: 'Romantic Comedy',
      icon: '💕',
      description: 'Light-hearted romance with comedic elements',
      complexity: 5,
      popularity: 9
    },
    {
      id: 'hard-sci-fi',
      name: 'Hard Science Fiction',
      icon: '🚀',
      description: 'Science-based speculation with rigorous scientific accuracy',
      complexity: 10,
      popularity: 5
    },
    {
      id: 'noir-detective',
      name: 'Noir Detective',
      icon: '🕵️',
      description: 'Dark crime stories with morally ambiguous characters',
      complexity: 7,
      popularity: 6
    },
    {
      id: 'urban-fantasy',
      name: 'Urban Fantasy',
      icon: '🌆',
      description: 'Fantasy elements in contemporary urban settings',
      complexity: 7,
      popularity: 8
    },
    {
      id: 'space-opera',
      name: 'Space Opera',
      icon: '🌌',
      description: 'Grand-scale space adventures with epic scope',
      complexity: 8,
      popularity: 7
    }
  ]

  const generateGenreMasteredStory = async () => {
    if (!selectedGenre) return

    setIsGenerating(true)
    
    try {
      // Simulate genre mastery system generation
      const masteredStory = GenreMasterySystem.generateGenreMasteredStory(
        selectedGenre.id,
        userInput,
        genreBlend || undefined
      )
      
      setGenreMasteredStory(masteredStory)
      
    } catch (error) {
      console.error('Error generating genre mastered story:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const createGenreBlend = () => {
    if (selectedBlendGenres.length === 0) return

    const blendingStrategy = {
      approach: 'dominant-secondary' as const,
      integrationMethod: 'layered' as const,
      riskTolerance: 'moderate' as const
    }

    const blend = GenreMasterySystem.createGenreBlend(
      selectedGenre?.id || 'psychological-thriller',
      selectedBlendGenres,
      blendingStrategy
    )

    setGenreBlend(blend)
  }

  const getGenreIcon = (genreId: string) => {
    const genre = availableGenres.find(g => g.id === genreId)
    return genre?.icon || '📚'
  }

  const getGenreName = (genreId: string) => {
    const genre = availableGenres.find(g => g.id === genreId)
    return genre?.name || genreId
  }

  const getAuthenticityColor = (score: number) => {
    if (score >= 8) return 'text-green-400'
    if (score >= 6) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getComplexityColor = (complexity: number) => {
    if (complexity >= 8) return 'border-red-400'
    if (complexity >= 6) return 'border-yellow-400'
    return 'border-green-400'
  }

  const mockGenreProfile = (genreId: string): GenreProfile => {
    const genre = availableGenres.find(g => g.id === genreId)
    return {
      id: genreId,
      name: genre?.name || genreId,
      category: genreId.includes('fantasy') ? 'speculative' : 
                genreId.includes('thriller') ? 'commercial' : 
                genreId.includes('comedy') ? 'commercial' : 'speculative',
      definition: genre?.description || 'Genre description',
      coreElements: ['element1', 'element2', 'element3'],
      essentialMoods: ['mood1', 'mood2'],
      audienceExpectations: [
        {
          expectation: 'Genre-appropriate premise',
          importance: 9,
          flexibilityLevel: 3
        }
      ],
      satisfactionRequirements: [
        {
          requirement: 'Meet genre conventions',
          criticality: 'essential' as const,
          alternativeApproaches: ['subvert meaningfully']
        }
      ],
      taboos: [
        {
          taboo: 'Genre-inappropriate elements',
          severity: 'major' as const,
          rationale: 'Breaks audience contract'
        }
      ],
      typicalPremises: [
        {
          pattern: 'Genre-typical premise pattern',
          examples: ['Example 1', 'Example 2'],
          frequency: 8,
          effectiveness: 7,
          modernization: 'Contemporary update approach'
        }
      ],
      characterArchetypes: [
        {
          universalArchetype: 'Hero',
          genreSpecificVersion: 'Genre Hero',
          requiredTraits: ['brave', 'determined'],
          optionalTraits: ['mysterious past'],
          avoidTraits: ['completely evil'],
          exampleCharacters: ['Character A', 'Character B']
        }
      ],
      structuralPatterns: [
        {
          name: 'Genre Structure',
          structure: 'Beginning → Middle → End',
          acts: [
            {
              name: 'Act 1',
              duration: '25%',
              purpose: 'Setup',
              keyElements: ['introduction', 'inciting incident']
            }
          ],
          pacing: [
            {
              phase: 'opening',
              pace: 'measured',
              focus: 'character establishment'
            }
          ],
          mandatoryElements: ['protagonist', 'conflict'],
          optionalElements: ['subplot'],
          climaxRequirements: ['resolution of central conflict']
        }
      ],
      dialogueConventions: [
        {
          convention: 'Genre-appropriate speech',
          description: 'Characters speak in genre-typical manner',
          examples: ['Example dialogue'],
          appropriateContexts: ['action scenes'],
          modernAdaptations: ['contemporary speech patterns']
        }
      ],
      tropeUsage: [
        {
          trope: 'Genre Trope',
          usage: 'common' as const,
          deployment: 'Use when appropriate',
          subversionOpportunity: 'Twist for surprise'
        }
      ],
      worldBuildingRules: [
        {
          rule: 'World must fit genre',
          rationale: 'Maintains genre authenticity',
          flexibility: 'moderate' as const,
          exceptions: ['innovative approaches']
        }
      ],
      choiceFrameworks: [
        {
          framework: 'Genre Choices',
          description: 'Choices appropriate to genre',
          typicalChoices: ['Choice A', 'Choice B'],
          stakesLevel: 7,
          consequencePatterns: ['Pattern A', 'Pattern B']
        }
      ],
      innovationOpportunities: [
        {
          area: 'Genre Innovation',
          description: 'Opportunity for genre evolution',
          riskLevel: 'moderate' as const,
          potentialImpact: 'high' as const,
          examples: ['Innovation example']
        }
      ],
      subversionPotential: [
        {
          element: 'Genre Element',
          subversionType: 'Expectation Reversal',
          description: 'Subvert genre expectation',
          riskLevel: 'moderate' as const,
          audienceReaction: 'mixed',
          executionTips: ['Execute carefully']
        }
      ],
      crossGenreCompatibility: [
        {
          genre: 'other-genre',
          compatibility: 7,
          blendingStrategy: 'Combine strengths',
          successExamples: ['Example work'],
          pitfalls: ['Potential issue']
        }
      ],
      genreAuthenticity: {
        overallScore: 0,
        componentScores: {},
        issues: [],
        recommendations: [],
        genreCompliance: false,
        innovationLevel: 0
      },
      commercialViability: {
        marketSize: 'large',
        competitionLevel: 'moderate',
        monetizationPotential: 'high',
        audienceLoyalty: 'strong',
        transmediaOpportunities: ['films', 'games']
      },
      criticalReception: {
        literaryRespectability: 'moderate',
        academicInterest: 'growing',
        awardPotential: 'moderate',
        culturalImpact: 'significant',
        longevityProspects: 'good'
      }
    }
  }

  const mockGenreMasteredStory = (): GenreMasteredStory => {
    if (!selectedGenre) throw new Error('No genre selected')

    return {
      genre: selectedGenre,
      genreBlend: genreBlend || undefined,
      premise: {
        theme: userInput.theme,
        premiseStatement: `In ${selectedGenre.name}, ${userInput.theme} drives the narrative conflict`,
        premiseType: 'cause-effect' as const,
        character: 'Genre-appropriate protagonist',
        conflict: 'Genre-specific central conflict',
        resolution: 'Resolution that serves both premise and genre',
        isTestable: true,
        isSpecific: true,
        isArgued: true
      },
      characters: [
        {
          name: 'Genre Protagonist',
          physiology: {
            age: 32,
            build: 'athletic',
            distinguishingFeatures: ['piercing eyes', 'confident posture'],
            health: 'excellent',
            physicalSkills: ['combat training', 'quick reflexes']
          },
          sociology: {
            socioeconomicStatus: 'middle class',
            education: 'specialized training',
            occupation: 'genre-appropriate role',
            family: 'complicated relationships',
            culturalBackground: 'relevant to genre'
          },
          psychology: {
            coreValue: 'justice',
            opposingValue: 'revenge',
            want: 'to uncover the truth',
            need: 'to accept help from others',
            primaryFlaw: 'trust issues',
            strengths: ['determination', 'intelligence'],
            fears: ['betrayal', 'losing control'],
            motivations: ['protecting innocents', 'finding answers'],
            backstory: 'Genre-appropriate tragic past',
            personalityTraits: ['brooding', 'dedicated', 'secretive'],
            speechPatterns: 'terse, direct communication',
            mentalState: 'focused but haunted'
          },
          premiseRole: 'protagonist' as const,
          premiseFunction: 'Tests the premise through personal journey',
          arcIntroduction: 1,
          characterEvolution: [
            {
              episode: 1,
              change: 'Initial resistance to help',
              trigger: 'Betrayal revelation',
              premiseConnection: 'Sets up identity crisis'
            }
          ]
        }
      ],
      narrative: {} as any, // Would be properly generated
      dialogue: {}, // Would be properly generated
      tropes: {} as any, // Would be properly generated
      world: {} as any, // Would be properly generated
      choices: [], // Would be properly generated
      authenticity: {
        overallScore: 8.2,
        componentScores: {
          premise: 8.5,
          characters: 8.0,
          structure: 8.1,
          dialogue: 7.8,
          tropes: 8.4,
          world: 8.0,
          choices: 8.2
        },
        issues: ['Minor dialogue modernization needed'],
        recommendations: ['Strengthen supporting character arcs'],
        genreCompliance: true,
        innovationLevel: 7
      },
      innovation: {
        innovationLevel: userInput.innovationLevel,
        innovativeElements: ['Modern tech integration', 'Psychological depth'],
        riskRewardBalance: 'Balanced approach with controlled innovation'
      },
      audienceMatch: {
        matchScore: 8.7,
        targetAudienceAlignment: 'Strong alignment with target demographic',
        potentialAudienceExpansion: 'Could attract crossover audience'
      },
      engineHarmony: {
        harmonyScore: 9.1,
        engineSynergies: ['Premise-character alignment', 'Structure-choice integration'],
        conflictResolutions: ['Dialogue-trope balance achieved']
      },
      narrativeCoherence: {
        coherenceScore: 8.8,
        coherenceFactors: ['Consistent tone', 'Logical progression'],
        potentialIssues: ['Pacing in middle section']
      },
      genreEvolution: {
        evolutionPotential: 7.5,
        genreContributions: ['Modern psychological elements'],
        influenceOnGenre: 'Potential to modernize genre conventions'
      }
    }
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6 mb-8">
      <h3 className="text-xl font-bold text-[#e2c376] mb-4">🎭 Genre Mastery System Demo</h3>
      <p className="text-[#e7e7e7]/70 mb-6">
        Experience sophisticated genre-perfect storytelling where all seven engines coordinate to create 
        authentic narratives that honor conventions while finding creative opportunities for innovation.
      </p>

      {/* Genre Mastery Principles */}
      <div className="mb-6 bg-[#2a2a2a] rounded-lg p-4">
        <h4 className="text-[#e2c376] font-bold mb-4">🎯 Genre Mastery Principles</h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-purple-400">
            <h5 className="text-purple-400 font-semibold text-sm mb-1">⚙️ ENGINE COORDINATION</h5>
            <p className="text-xs text-[#e7e7e7]/90">All seven engines work in perfect genre harmony</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-blue-400">
            <h5 className="text-blue-400 font-semibold text-sm mb-1">🎭 AUTHENTIC STORYTELLING</h5>
            <p className="text-xs text-[#e7e7e7]/90">Honor genre conventions while innovating meaningfully</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-green-400">
            <h5 className="text-green-400 font-semibold text-sm mb-1">🌀 CROSS-GENRE FUSION</h5>
            <p className="text-xs text-[#e7e7e7]/90">Intelligent blending creates unique narrative experiences</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-yellow-400">
            <h5 className="text-yellow-400 font-semibold text-sm mb-1">📊 QUALITY ASSURANCE</h5>
            <p className="text-xs text-[#e7e7e7]/90">Continuous validation ensures genre authenticity</p>
          </div>
        </div>
      </div>

      {/* User Input */}
      <div className="mb-6 bg-[#2a2a2a] rounded-lg p-4">
        <h4 className="text-[#e2c376] font-bold mb-4">📝 Story Input</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#e7e7e7] mb-2">Synopsis</label>
            <textarea
              value={userInput.synopsis}
              onChange={(e) => setUserInput({...userInput, synopsis: e.target.value})}
              className="w-full p-3 bg-[#1a1a1a] border border-[#36393f] rounded-lg text-[#e7e7e7] text-sm resize-none"
              rows={3}
              placeholder="Enter your story synopsis..."
            />
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#e7e7e7] mb-2">Theme</label>
              <input
                value={userInput.theme}
                onChange={(e) => setUserInput({...userInput, theme: e.target.value})}
                className="w-full p-3 bg-[#1a1a1a] border border-[#36393f] rounded-lg text-[#e7e7e7] text-sm"
                placeholder="Central theme..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#e7e7e7] mb-2">Innovation Level: {userInput.innovationLevel}/10</label>
              <input
                type="range"
                min="1"
                max="10"
                value={userInput.innovationLevel}
                onChange={(e) => setUserInput({...userInput, innovationLevel: parseInt(e.target.value)})}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-[#e7e7e7]/60 mt-1">
                <span>Conservative</span>
                <span>Experimental</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-6">
        <div className="bg-[#2a2a2a] rounded-lg p-1 flex">
          {(['genres', 'story', 'blend', 'authenticity'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === view 
                  ? 'bg-[#e2c376] text-black' 
                  : 'text-[#e7e7e7]/70 hover:bg-[#36393f]'
              }`}
            >
              {view === 'genres' ? '🎭 Genres' : 
               view === 'story' ? '📖 Story' : 
               view === 'blend' ? '🌀 Blend' : 
               '✅ Authenticity'}
            </button>
          ))}
        </div>
      </div>

      {/* Genres View */}
      {activeView === 'genres' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-[#2a2a2a] rounded-lg p-4">
            <h4 className="text-[#e2c376] font-bold mb-4">🎭 Select Primary Genre</h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableGenres.map((genre) => (
                <motion.div
                  key={genre.id}
                  onClick={() => {
                    setSelectedGenre(mockGenreProfile(genre.id))
                    setGenreMasteredStory(null)
                  }}
                  className={`bg-[#1a1a1a] rounded-lg p-4 cursor-pointer transition-colors border-2 ${
                    selectedGenre?.id === genre.id 
                      ? 'border-[#e2c376] bg-[#e2c376]/10' 
                      : `${getComplexityColor(genre.complexity)} hover:bg-[#2a2a2a]`
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{genre.icon}</span>
                    <div>
                      <h5 className="font-semibold text-white">{genre.name}</h5>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[#e7e7e7]/60">Complexity: {genre.complexity}/10</span>
                        <span className="text-[#e7e7e7]/60">•</span>
                        <span className="text-[#e7e7e7]/60">Popularity: {genre.popularity}/10</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-[#e7e7e7]/90">{genre.description}</p>
                  
                  {selectedGenre?.id === genre.id && (
                    <div className="mt-3 p-2 bg-[#e2c376]/20 rounded border border-[#e2c376]/30">
                      <p className="text-xs text-[#e2c376] font-semibold">✓ Primary Genre Selected</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            
            {selectedGenre && (
              <div className="mt-6">
                <button
                  onClick={() => {
                    setGenreMasteredStory(mockGenreMasteredStory())
                    setActiveView('story')
                  }}
                  disabled={isGenerating}
                  className="bg-[#e2c376] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#d4b46a] transition-colors disabled:opacity-50"
                >
                  {isGenerating ? 'Generating Genre-Perfect Story...' : 'Generate Genre-Mastered Story'}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Story View */}
      {activeView === 'story' && genreMasteredStory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Story Overview */}
          <div className="bg-[#2a2a2a] rounded-lg p-4">
            <h4 className="text-[#e2c376] font-bold mb-4">📖 Genre-Mastered Story</h4>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                  {getGenreIcon(genreMasteredStory.genre.id)}
                  {genreMasteredStory.genre.name} Story
                </h5>
                
                <div className="space-y-3">
                  <div className="bg-[#1a1a1a] rounded-lg p-3">
                    <p className="text-xs text-[#e2c376] font-semibold mb-1">Premise Statement</p>
                    <p className="text-sm text-[#e7e7e7]/90">{genreMasteredStory.premise.premiseStatement}</p>
                  </div>
                  
                  <div className="bg-[#1a1a1a] rounded-lg p-3">
                    <p className="text-xs text-[#e2c376] font-semibold mb-1">Genre Adaptation</p>
                    <p className="text-sm text-[#e7e7e7]/90">
                      All engines coordinated for {genreMasteredStory.genre.name} authenticity while 
                      maintaining innovation level {genreMasteredStory.innovation.innovationLevel}/10
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="text-white font-semibold mb-3">👤 Genre-Adapted Character</h5>
                <div className="bg-[#1a1a1a] rounded-lg p-3">
                  <p className="font-semibold text-[#e2c376] mb-2">{genreMasteredStory.characters[0].name}</p>
                  <div className="space-y-2 text-sm">
                    <p><strong>Role:</strong> {genreMasteredStory.characters[0].premiseRole}</p>
                    <p><strong>Want:</strong> {genreMasteredStory.characters[0].psychology.want}</p>
                    <p><strong>Need:</strong> {genreMasteredStory.characters[0].psychology.need}</p>
                    <p><strong>Genre Function:</strong> {genreMasteredStory.characters[0].premiseFunction}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Engine Coordination */}
          <div className="bg-[#2a2a2a] rounded-lg p-4">
            <h4 className="text-[#e2c376] font-bold mb-4">⚙️ Engine Coordination Status</h4>
            
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-400">{genreMasteredStory.engineHarmony.harmonyScore}/10</p>
                <p className="text-xs text-[#e7e7e7]/70">Engine Harmony</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-400">{genreMasteredStory.narrativeCoherence.coherenceScore}/10</p>
                <p className="text-xs text-[#e7e7e7]/70">Narrative Coherence</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-purple-400">{genreMasteredStory.audienceMatch.matchScore}/10</p>
                <p className="text-xs text-[#e7e7e7]/70">Audience Match</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <h6 className="text-white font-semibold mb-2">🔗 Engine Synergies</h6>
                <div className="space-y-1">
                  {genreMasteredStory.engineHarmony.engineSynergies.map((synergy, index) => (
                    <div key={index} className="bg-[#1a1a1a] rounded p-2">
                      <p className="text-sm text-green-400">✓ {synergy}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h6 className="text-white font-semibold mb-2">⚖️ Conflict Resolutions</h6>
                <div className="space-y-1">
                  {genreMasteredStory.engineHarmony.conflictResolutions.map((resolution, index) => (
                    <div key={index} className="bg-[#1a1a1a] rounded p-2">
                      <p className="text-sm text-blue-400">⚖️ {resolution}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Blend View */}
      {activeView === 'blend' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-[#2a2a2a] rounded-lg p-4">
            <h4 className="text-[#e2c376] font-bold mb-4">🌀 Create Genre Blend</h4>
            
            {selectedGenre && (
              <div className="mb-6">
                <h5 className="text-white font-semibold mb-3">Primary Genre</h5>
                <div className="bg-[#1a1a1a] rounded-lg p-3 border-2 border-[#e2c376]">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getGenreIcon(selectedGenre.id)}</span>
                    <div>
                      <p className="font-semibold text-[#e2c376]">{selectedGenre.name}</p>
                      <p className="text-sm text-[#e7e7e7]/70">Primary genre foundation</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mb-6">
              <h5 className="text-white font-semibold mb-3">Select Secondary Genres</h5>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableGenres
                  .filter(g => g.id !== selectedGenre?.id)
                  .map((genre) => (
                    <motion.div
                      key={genre.id}
                      onClick={() => {
                        setSelectedBlendGenres(prev => 
                          prev.includes(genre.id) 
                            ? prev.filter(id => id !== genre.id)
                            : [...prev, genre.id]
                        )
                      }}
                      className={`bg-[#1a1a1a] rounded-lg p-3 cursor-pointer transition-colors border ${
                        selectedBlendGenres.includes(genre.id) 
                          ? 'border-blue-400 bg-blue-400/10' 
                          : 'border-[#36393f] hover:bg-[#2a2a2a]'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{genre.icon}</span>
                        <div>
                          <p className="font-semibold text-sm">{genre.name}</p>
                          <p className="text-xs text-[#e7e7e7]/60">
                            Compatibility: {Math.floor(Math.random() * 3) + 7}/10
                          </p>
                        </div>
                      </div>
                      
                      {selectedBlendGenres.includes(genre.id) && (
                        <div className="mt-2 p-1 bg-blue-400/20 rounded">
                          <p className="text-xs text-blue-400">✓ Selected for blend</p>
                        </div>
                      )}
                    </motion.div>
                  ))
                }
              </div>
            </div>
            
            {selectedBlendGenres.length > 0 && (
              <div className="space-y-4">
                <button
                  onClick={() => {
                    const mockBlend: GenreBlend = {
                      id: `blend-${selectedGenre?.id}-${selectedBlendGenres.join('-')}`,
                      name: `${selectedGenre?.name} × ${selectedBlendGenres.map(id => getGenreName(id)).join(' × ')}`,
                      primaryGenre: selectedGenre!,
                      secondaryGenres: selectedBlendGenres.map(id => mockGenreProfile(id)),
                      blendingApproach: {
                        integrationMethod: {
                          method: 'layered',
                          description: 'Layer genre elements strategically',
                          implementation: 'Primary genre provides structure, secondary adds flavor'
                        },
                        dominanceStrategy: '70-30 split',
                        hybridizationAreas: ['character archetypes', 'dialogue style', 'world elements']
                      },
                      dominanceRatio: {
                        primary: 0.7,
                        secondary: selectedBlendGenres.map(() => 0.3 / selectedBlendGenres.length)
                      },
                      integrationMethod: {
                        method: 'layered',
                        description: 'Layer genre elements strategically',
                        implementation: 'Primary genre provides structure, secondary adds flavor'
                      },
                      hybridElements: [
                        {
                          name: 'Cross-Genre Character',
                          description: 'Character combining archetypes from both genres',
                          sourceGenres: [selectedGenre!.id, ...selectedBlendGenres],
                          premiseInfluence: {},
                          characterInfluence: {},
                          structuralInfluence: {},
                          dialogueInfluence: {},
                          tropeInfluence: {},
                          worldInfluence: {},
                          choiceInfluence: {}
                        }
                      ],
                      innovativeFeatures: [
                        {
                          feature: 'Genre Fusion Innovation',
                          innovation: 'Unique combination creates new storytelling possibilities',
                          marketDifferentiation: 'Stands out in crowded marketplace'
                        }
                      ],
                      uniqueSellingPoints: [
                        {
                          point: 'Never-before-seen genre combination',
                          marketValue: 'High differentiation',
                          audienceAppeal: 'Appeals to multiple fandoms'
                        }
                      ],
                      audienceReception: {
                        riskLevel: 'moderate' as const,
                        riskFactors: ['Audience may not understand blend'],
                        mitigationStrategies: ['Clear marketing positioning']
                      },
                      marketViability: {
                        riskLevel: 'moderate' as const,
                        marketConcerns: ['Niche audience'],
                        competitiveAdvantages: ['Unique positioning']
                      },
                      executionComplexity: {
                        riskLevel: 'high' as const,
                        complexityFactors: ['Balancing multiple genre expectations'],
                        executionChallenges: ['Maintaining coherence across genres']
                      },
                      precedents: [
                        {
                          work: 'Example Work',
                          blendingApproach: 'Similar approach',
                          successFactors: ['Strong execution'],
                          lessons: ['Focus on core strengths']
                        }
                      ],
                      inspirations: [
                        {
                          source: 'Inspiration Source',
                          inspirationalElement: 'Key element to adapt',
                          adaptationPotential: 'High potential for success'
                        }
                      ]
                    }
                    setGenreBlend(mockBlend)
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                  Create Genre Blend
                </button>
                
                {genreBlend && (
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h6 className="text-[#e2c376] font-bold mb-3">🌀 {genreBlend.name}</h6>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white mb-2">Blending Strategy</p>
                        <p className="text-sm text-[#e7e7e7]/90">{genreBlend.blendingApproach.integrationMethod.description}</p>
                        
                        <p className="text-sm font-semibold text-white mb-2 mt-3">Dominance Ratio</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{getGenreName(genreBlend.primaryGenre.id)}: {Math.round(genreBlend.dominanceRatio.primary * 100)}%</span>
                          <div className="flex-1 bg-[#36393f] rounded-full h-2">
                            <div 
                              className="bg-[#e2c376] h-2 rounded-full" 
                              style={{ width: `${genreBlend.dominanceRatio.primary * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-semibold text-white mb-2">Risk Assessment</p>
                        <div className="space-y-1 text-xs">
                          <p>Audience Reception: <span className="text-yellow-400">{genreBlend.audienceReception.riskLevel}</span></p>
                          <p>Market Viability: <span className="text-yellow-400">{genreBlend.marketViability.riskLevel}</span></p>
                          <p>Execution Complexity: <span className="text-red-400">{genreBlend.executionComplexity.riskLevel}</span></p>
                        </div>
                        
                        <p className="text-sm font-semibold text-white mb-2 mt-3">Innovation Features</p>
                        <div className="space-y-1">
                          {genreBlend.innovativeFeatures.map((feature, index) => (
                            <p key={index} className="text-xs text-green-400">✨ {feature.feature}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Authenticity View */}
      {activeView === 'authenticity' && genreMasteredStory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-[#2a2a2a] rounded-lg p-4">
            <h4 className="text-[#e2c376] font-bold mb-4">✅ Genre Authenticity Analysis</h4>
            
            {/* Overall Score */}
            <div className="text-center mb-6">
              <div className="inline-block bg-[#1a1a1a] rounded-lg p-6">
                <p className={`text-4xl font-bold ${getAuthenticityColor(genreMasteredStory.authenticity.overallScore)}`}>
                  {genreMasteredStory.authenticity.overallScore}/10
                </p>
                <p className="text-sm text-[#e7e7e7]/70 mt-2">Overall Authenticity Score</p>
                {genreMasteredStory.authenticity.genreCompliance && (
                  <p className="text-xs text-green-400 mt-1">✓ Genre Compliant</p>
                )}
              </div>
            </div>
            
            {/* Component Scores */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {Object.entries(genreMasteredStory.authenticity.componentScores).map(([component, score]) => (
                <div key={component} className="bg-[#1a1a1a] rounded-lg p-3">
                  <p className="text-xs text-[#e2c376] font-semibold mb-1 capitalize">{component}</p>
                  <div className="flex items-center justify-between">
                    <p className={`font-bold ${getAuthenticityColor(score as number)}`}>{score}/10</p>
                    <div className="w-16 bg-[#36393f] rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          (score as number) >= 8 ? 'bg-green-400' : 
                          (score as number) >= 6 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${(score as number) * 10}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Issues and Recommendations */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-white font-semibold mb-3">⚠️ Issues Identified</h5>
                {genreMasteredStory.authenticity.issues.length > 0 ? (
                  <div className="space-y-2">
                    {genreMasteredStory.authenticity.issues.map((issue, index) => (
                      <div key={index} className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-yellow-400">
                        <p className="text-sm text-[#e7e7e7]/90">⚠️ {issue}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#1a1a1a] rounded-lg p-3">
                    <p className="text-sm text-green-400">✓ No major issues detected</p>
                  </div>
                )}
              </div>
              
              <div>
                <h5 className="text-white font-semibold mb-3">💡 Recommendations</h5>
                {genreMasteredStory.authenticity.recommendations.length > 0 ? (
                  <div className="space-y-2">
                    {genreMasteredStory.authenticity.recommendations.map((rec, index) => (
                      <div key={index} className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-blue-400">
                        <p className="text-sm text-[#e7e7e7]/90">💡 {rec}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#1a1a1a] rounded-lg p-3">
                    <p className="text-sm text-green-400">✓ Story meets all genre standards</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Innovation vs Authenticity Balance */}
          <div className="bg-[#2a2a2a] rounded-lg p-4">
            <h4 className="text-[#e2c376] font-bold mb-4">⚖️ Innovation vs Authenticity Balance</h4>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-white font-semibold mb-3">🔬 Innovation Analysis</h5>
                <div className="bg-[#1a1a1a] rounded-lg p-3">
                  <p className="text-sm mb-2">
                    <strong>Innovation Level:</strong> 
                    <span className="text-[#e2c376] ml-2">{genreMasteredStory.innovation.innovationLevel}/10</span>
                  </p>
                  <p className="text-xs text-[#e7e7e7]/90 mb-2">{genreMasteredStory.innovation.riskRewardBalance}</p>
                  <div className="space-y-1">
                    {genreMasteredStory.innovation.innovativeElements.map((element, index) => (
                      <p key={index} className="text-xs text-purple-400">✨ {element}</p>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="text-white font-semibold mb-3">🎯 Genre Evolution Potential</h5>
                <div className="bg-[#1a1a1a] rounded-lg p-3">
                  <p className="text-sm mb-2">
                    <strong>Evolution Potential:</strong> 
                    <span className="text-[#e2c376] ml-2">{genreMasteredStory.genreEvolution.evolutionPotential}/10</span>
                  </p>
                  <p className="text-xs text-[#e7e7e7]/90 mb-2">{genreMasteredStory.genreEvolution.influenceOnGenre}</p>
                  <div className="space-y-1">
                    {genreMasteredStory.genreEvolution.genreContributions.map((contribution, index) => (
                      <p key={index} className="text-xs text-green-400">🌱 {contribution}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Genre Mastery Revolution Summary */}
      <div className="bg-gradient-to-r from-[#e2c376]/20 to-[#c4a75f]/20 rounded-lg p-6 border border-[#e2c376]/50">
        <h4 className="text-[#e2c376] font-bold mb-4">🎭 Genre Mastery Revolution</h4>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h5 className="text-white font-semibold mb-3">⚙️ Engine Coordination</h5>
            <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
              <li>✅ Seven engines in harmony</li>
              <li>✅ Genre-specific adaptations</li>
              <li>✅ Conflict resolution system</li>
              <li>✅ Priority matrix management</li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-semibold mb-3">🎯 Authentic Innovation</h5>
            <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
              <li>✅ Honor genre conventions</li>
              <li>✅ Meaningful innovation</li>
              <li>✅ Audience expectation balance</li>
              <li>✅ Creative opportunity identification</li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-semibold mb-3">🌀 Cross-Genre Mastery</h5>
            <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
              <li>✅ Intelligent genre blending</li>
              <li>✅ Risk-reward optimization</li>
              <li>✅ Market viability analysis</li>
              <li>✅ Precedent-based guidance</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-[#1a1a1a] rounded-lg">
          <p className="text-sm text-[#e7e7e7]/90">
            <strong>The Genre Mastery Principle:</strong> True mastery means understanding the rules so deeply 
            that you know exactly when and how to break them. Our system honors genre conventions while 
            finding intelligent opportunities for innovation, creating stories that feel both familiar and fresh.
          </p>
        </div>
      </div>
    </div>
  )
} 