'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ActorMaterialsExamplesProps {
  theme: 'light' | 'dark'
}

export default function ActorMaterialsExamples({ theme }: ActorMaterialsExamplesProps) {
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'
  
  const [activeLayout, setActiveLayout] = React.useState(1)
  const [activeSection, setActiveSection] = React.useState<'overview' | 'scene-work' | 'physical-voice' | 'practice' | null>('overview')
  const [selectedCharacter, setSelectedCharacter] = React.useState('Jason Calacanis')
  const [readingMode, setReadingMode] = React.useState<'professional' | 'guided'>('professional')
  const [activeConcept, setActiveConcept] = React.useState<Record<string, number>>({
    studyGuide: 1,
    gote: 1,
    performanceRef: 1,
    emotionalBeats: 1,
    physical: 1,
    voice: 1,
    keyScenes: 1,
    monologue: 1,
    onSet: 1
  })

  // Sample data for 3 characters
  const sampleMaterials = {
    arcTitle: 'The Foundation',
    characters: [
      {
        characterName: 'Jason Calacanis',
        characterId: 'jason',
        studyGuide: {
          background: 'A serial entrepreneur and angel investor who co-founded LAUNCH. Known for his bold convictions and willingness to take calculated risks in the tech world.',
          motivations: [
            'Build a lasting legacy in tech',
            'Prove that conviction beats market pressure',
            'Mentor the next generation of founders'
          ],
          relationships: [
            { characterName: 'Molly Wood', relationship: 'Co-founder and trusted partner, shares vision but challenges decisions' },
            { characterName: 'Sterling', relationship: 'Respected advisor, provides strategic counsel' }
          ],
          characterArc: 'Starts confident but faces doubt. Must reconcile his public persona with private uncertainty, ultimately finding strength in authenticity.',
          internalConflicts: [
            'Public confidence vs private doubt',
            'Legacy building vs present moment',
            'Risk-taking vs responsibility to team'
          ]
        },
        performanceReference: [
          {
            characterName: 'Tony Soprano',
            source: 'The Sopranos',
            reason: 'Both navigate the tension between public persona and private vulnerability',
            sceneExample: 'Season 1, Episode 1 - Therapy session',
            keySimilarities: [
              'Public confidence masking internal conflict',
              'Leadership under scrutiny',
              'Complex relationship with partners'
            ]
          }
        ],
        throughLine: {
          superObjective: 'Prove that staying true to conviction is more valuable than cashing out',
          explanation: 'Jason must navigate market pressure while maintaining his core values. His journey is about finding strength in vulnerability.',
          keyScenes: [1, 3, 5]
        },
        gotAnalysis: [
          {
            sceneNumber: 1,
            episodeNumber: 1,
            goal: 'Convince the team to hold firm despite market pressure',
            obstacle: 'Team members questioning his judgment',
            tactics: ['Appeal to shared vision', 'Acknowledge valid concerns', 'Lead by example'],
            expectation: 'Team will follow but remain skeptical',
            techniqueNotes: 'Use Stanislavski emotional memory for the weight of leadership'
          },
          {
            sceneNumber: 3,
            episodeNumber: 1,
            goal: 'Reconcile public confidence with private doubt',
            obstacle: 'Internal conflict about the right path forward',
            tactics: ['Self-reflection', 'Honest conversation with Molly', 'Accept vulnerability'],
            expectation: 'Find clarity through authenticity',
            techniqueNotes: 'Meisner repetition exercise for the internal monologue'
          }
        ],
        relationshipMap: [
          {
            characterName: 'Molly Wood',
            relationshipType: 'ally',
            description: 'Co-founder who challenges and supports in equal measure',
            keyMoments: [
              { episodeNumber: 1, sceneNumber: 1, moment: 'Molly questions the decision to hold' },
              { episodeNumber: 1, sceneNumber: 3, moment: 'Molly provides emotional support' }
            ],
            evolution: 'Relationship deepens as they navigate crisis together, moving from business partners to true confidants.'
          }
        ],
        sceneBreakdowns: [
          {
            sceneNumber: 1,
            episodeNumber: 1,
            objective: 'Maintain team confidence while addressing concerns',
            emotionalState: 'Confident but strained',
            tactics: ['Direct communication', 'Show vulnerability', 'Lead with conviction'],
            keyLines: [
              'We\'ve been here before. Every time we make a bold move, the doubters come out.',
              'This isn\'t just doubt, Molly. This is different.'
            ],
            subtext: 'I\'m questioning myself but can\'t show it',
            techniqueNotes: 'Use given circumstances to ground the performance'
          }
        ],
        emotionalBeats: [
          { episodeNumber: 1, sceneNumber: 1, emotion: 'confident', intensity: 7, description: 'Public face of leadership' },
          { episodeNumber: 1, sceneNumber: 2, emotion: 'doubtful', intensity: 5, description: 'Private moment of uncertainty' },
          { episodeNumber: 1, sceneNumber: 3, emotion: 'resolved', intensity: 9, description: 'Finding strength in authenticity' }
        ],
        physicalWork: {
          bodyLanguage: ['Confident posture in public', 'Slight tension in shoulders when stressed', 'Open gestures when speaking to team'],
          movement: ['Purposeful stride', 'Pauses before important statements', 'Leans forward when making a point'],
          posture: ['Upright and commanding in public', 'Slightly hunched in private moments', 'Relaxed when with Molly']
        },
        voicePatterns: {
          vocabulary: ['conviction', 'legacy', 'prove', 'bold', 'calculated'],
          rhythm: 'Measured and deliberate, with occasional bursts of passion',
          accent: 'Standard American with slight California influence',
          keyPhrases: [
            'We\'ve been here before',
            'This is different',
            'Prove our convictions'
          ],
          verbalTics: ['Pauses before key statements', 'Emphasizes "we" and "us"']
        },
        monologues: [
          {
            sceneNumber: 3,
            episodeNumber: 1,
            text: 'I\'ve spent my entire career building something that matters. Not just for me, but for everyone who believes in what we\'re doing. And now, when the pressure is highest, that\'s when we prove who we really are.',
            emotionalBeats: [
              { line: 'I\'ve spent my entire career', emotion: 'reflective' },
              { line: 'when the pressure is highest', emotion: 'determined' },
              { line: 'that\'s when we prove who we really are', emotion: 'resolved' }
            ],
            practiceNotes: [
              'Build from quiet reflection to strong resolve',
              'Use pauses to let the weight of the words land',
              'Connect to personal stakes in each phrase'
            ],
            performanceTips: [
              'Start internal, build external',
              'Let vulnerability show through strength',
              'End with conviction, not bravado'
            ]
          }
        ],
        keyScenes: [
          {
            sceneNumber: 1,
            episodeNumber: 1,
            importance: 5,
            whyItMatters: ['Establishes character\'s public persona', 'Sets up internal conflict'],
            whatToFocusOn: ['Balance confidence with vulnerability', 'Physical presence in the room'],
            quickPrepTips: ['Review team dynamics', 'Practice the pause before speaking', 'Connect to personal leadership moments']
          },
          {
            sceneNumber: 3,
            episodeNumber: 1,
            importance: 5,
            whyItMatters: ['Character\'s emotional turning point', 'Key monologue moment'],
            whatToFocusOn: ['Authentic vulnerability', 'Building to resolution'],
            quickPrepTips: ['Warm up voice for monologue', 'Practice emotional transitions', 'Memorize key phrases']
          }
        ],
        onSetPrep: {
          preScene: ['Review scene objective', 'Check blocking notes', 'Confirm props placement'],
          warmUp: ['Voice warm-up (5 min)', 'Physical stretches', 'Breathing exercises'],
          emotionalPrep: ['Connect to character\'s stakes', 'Review relationship dynamics', 'Set emotional starting point'],
          mentalChecklist: ['Know your objective', 'Remember the obstacle', 'Trust your preparation']
        }
      },
      {
        characterName: 'Molly Wood',
        characterId: 'molly',
        studyGuide: {
          background: 'Co-founder of LAUNCH, known for her analytical mind and emotional intelligence. Balances business acumen with genuine care for the team.',
          motivations: [
            'Build sustainable business practices',
            'Support team through challenges',
            'Maintain integrity in decision-making'
          ],
          relationships: [
            { characterName: 'Jason Calacanis', relationship: 'Co-founder, challenges decisions but provides support' }
          ],
          characterArc: 'Learns to balance analytical thinking with emotional support, becoming a stronger leader.',
          internalConflicts: [
            'Logic vs emotion in decision-making',
            'Supporting Jason vs questioning decisions',
            'Team needs vs business needs'
          ]
        },
        performanceReference: [],
        throughLine: {
          superObjective: 'Support the team while maintaining business integrity',
          explanation: 'Molly must balance her analytical nature with emotional support, learning that leadership requires both.',
          keyScenes: [1, 3]
        },
        gotAnalysis: [
          {
            sceneNumber: 1,
            episodeNumber: 1,
            goal: 'Question the decision while supporting the team',
            obstacle: 'Conflict between logic and loyalty',
            tactics: ['Ask direct questions', 'Show concern', 'Offer alternative perspective'],
            expectation: 'Team will appreciate honesty',
            techniqueNotes: 'Use active listening techniques'
          }
        ],
        relationshipMap: [],
        sceneBreakdowns: [],
        emotionalBeats: [],
        physicalWork: {
          bodyLanguage: ['Open and approachable', 'Leans in when listening', 'Hand gestures when explaining'],
          movement: ['Graceful and purposeful', 'Pauses to think', 'Moves closer when offering support'],
          posture: ['Relaxed but alert', 'Slight forward lean when engaged', 'Straightens when making a point']
        },
        voicePatterns: {
          vocabulary: ['consider', 'support', 'team', 'balance', 'integrity'],
          rhythm: 'Thoughtful and measured, with warmth',
          keyPhrases: ['We need to consider', 'I support you, but', 'Let\'s think about this'],
          verbalTics: ['Uses "we" language', 'Asks clarifying questions']
        },
        monologues: [],
        keyScenes: [],
        onSetPrep: {
          preScene: ['Review scene objective', 'Check blocking'],
          warmUp: ['Voice warm-up', 'Physical stretches'],
          emotionalPrep: ['Connect to character stakes'],
          mentalChecklist: ['Know your objective', 'Remember the obstacle']
        }
      }
    ]
  }

  const currentCharacter = sampleMaterials.characters.find(c => c.characterName === selectedCharacter) || sampleMaterials.characters[0]

  return (
    <div className="w-full space-y-8">
      <div>
        <h2 className={`text-3xl font-bold mb-2 ${prefix}-text-primary`}>
          Actor Preparation Materials
        </h2>
        <p className={`text-base mb-6 ${prefix}-text-secondary`}>
          Redesign concepts for actor-friendly preparation materials - less overwhelming, more scannable
        </p>
      </div>

      {/* Layout Selector */}
      <div className={`p-6 rounded-lg ${prefix}-card`}>
        <h3 className={`text-xl font-semibold mb-4 ${prefix}-text-primary`}>
          Overall Page Layout
        </h3>
        <div className="flex gap-3 flex-wrap">
          {[1, 2, 3].map((layout) => (
            <button
              key={layout}
              onClick={() => setActiveLayout(layout)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeLayout === layout
                  ? `${prefix}-bg-accent ${prefix}-text-accent`
                  : `${prefix}-bg-secondary ${prefix}-text-secondary hover:${prefix}-bg-accent/20`
              }`}
            >
              {layout === 1 ? 'Tabbed Dashboard' : layout === 2 ? 'Sidebar Navigation' : 'Card-Based Flow'}
            </button>
          ))}
        </div>
      </div>

      {/* Reading Mode Toggle */}
      <div className={`p-4 rounded-lg ${prefix}-card-secondary flex items-center justify-between`}>
        <span className={`${prefix}-text-primary font-medium`}>Reading Mode:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setReadingMode('professional')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              readingMode === 'professional'
                ? `${prefix}-bg-accent ${prefix}-text-accent`
                : `${prefix}-bg-secondary ${prefix}-text-secondary`
            }`}
          >
            Professional
          </button>
          <button
            onClick={() => setReadingMode('guided')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              readingMode === 'guided'
                ? `${prefix}-bg-accent ${prefix}-text-accent`
                : `${prefix}-bg-secondary ${prefix}-text-secondary`
            }`}
          >
            Guided
          </button>
        </div>
      </div>

      {/* Layout Renderers */}
      <AnimatePresence mode="wait">
        {activeLayout === 1 && (
          <motion.div
            key="layout-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Character Selector */}
            <div className={`p-4 rounded-lg ${prefix}-card`}>
              <label className={`block text-sm font-medium mb-3 ${prefix}-text-primary`}>
                Select Character
              </label>
              <div className="flex flex-wrap gap-2">
                {sampleMaterials.characters.map((char) => (
                  <button
                    key={char.characterName}
                    onClick={() => setSelectedCharacter(char.characterName)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCharacter === char.characterName
                        ? `${prefix}-bg-accent ${prefix}-text-accent`
                        : `${prefix}-bg-secondary ${prefix}-text-secondary hover:${prefix}-bg-accent/20`
                    }`}
                  >
                    {char.characterName}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Tabs */}
            <div className={`border-b ${prefix}-border`}>
              <div className="flex gap-1">
                {['overview', 'scene-work', 'physical-voice', 'practice'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveSection(tab as any)}
                    className={`px-6 py-3 font-medium relative ${
                      activeSection === tab
                        ? `${prefix}-text-primary border-b-2 ${prefix}-border-accent`
                        : `${prefix}-text-secondary hover:${prefix}-text-primary`
                    }`}
                  >
                    {tab === 'overview' ? 'Overview' : tab === 'scene-work' ? 'Scene Work' : tab === 'physical-voice' ? 'Physical & Voice' : 'Practice'}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeSection === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Character Study Guide */}
                  <div className={`p-6 rounded-lg ${prefix}-card`}>
                    <h3 className={`text-xl font-semibold mb-4 ${prefix}-text-primary`}>
                      Character Study Guide
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className={`font-medium mb-2 ${prefix}-text-primary`}>Background</h4>
                        <p className={`${prefix}-text-secondary`}>{currentCharacter.studyGuide.background}</p>
                      </div>
                      <div>
                        <h4 className={`font-medium mb-2 ${prefix}-text-primary`}>Core Motivations</h4>
                        <ul className={`list-disc list-inside space-y-1 ${prefix}-text-secondary`}>
                          {currentCharacter.studyGuide.motivations.map((m, i) => (
                            <li key={i}>{m}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className={`font-medium mb-2 ${prefix}-text-primary`}>Relationships</h4>
                        <div className="space-y-2">
                          {currentCharacter.studyGuide.relationships.map((rel, i) => (
                            <div key={i} className={`p-3 rounded-lg ${prefix}-card-secondary`}>
                              <span className={`font-medium ${prefix}-text-primary`}>{rel.characterName}: </span>
                              <span className={prefix + '-text-secondary'}>{rel.relationship}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className={`font-medium mb-2 ${prefix}-text-primary`}>Character Arc</h4>
                        <p className={`${prefix}-text-secondary`}>{currentCharacter.studyGuide.characterArc}</p>
                      </div>
                      <div>
                        <h4 className={`font-medium mb-2 ${prefix}-text-primary`}>Internal Conflicts</h4>
                        <ul className={`list-disc list-inside space-y-1 ${prefix}-text-secondary`}>
                          {currentCharacter.studyGuide.internalConflicts.map((conflict, i) => (
                            <li key={i}>{conflict}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Performance Reference */}
                  {currentCharacter.performanceReference && currentCharacter.performanceReference.length > 0 && (
                    <div className={`p-6 rounded-lg ${prefix}-card`}>
                      <h3 className={`text-xl font-semibold mb-4 ${prefix}-text-primary`}>
                        Performance Reference
                      </h3>
                      <div className="space-y-4">
                        {currentCharacter.performanceReference.map((ref, i) => (
                          <div key={i} className={`p-4 rounded-lg ${prefix}-card-secondary`}>
                            <div className={`font-semibold mb-2 ${prefix}-text-primary`}>
                              {ref.characterName} from "{ref.source}"
                            </div>
                            <p className={`text-sm mb-2 ${prefix}-text-secondary`}>{ref.reason}</p>
                            {ref.sceneExample && (
                              <p className={`text-xs mb-2 ${prefix}-text-secondary`}>
                                Watch: {ref.sceneExample}
                              </p>
                            )}
                            <div>
                              <span className={`text-sm font-medium ${prefix}-text-primary`}>Key Similarities: </span>
                              <ul className={`list-disc list-inside ml-4 text-sm ${prefix}-text-secondary`}>
                                {ref.keySimilarities.map((sim, j) => (
                                  <li key={j}>{sim}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Through Line */}
                  <div className={`p-6 rounded-lg ${prefix}-card`}>
                    <h3 className={`text-xl font-semibold mb-4 ${prefix}-text-primary`}>
                      Through Line / Super-Objective
                    </h3>
                    <div className={`p-4 rounded-lg ${prefix}-card-accent`}>
                      <p className={`font-semibold mb-2 ${prefix}-text-primary`}>
                        {currentCharacter.throughLine.superObjective}
                      </p>
                      <p className={`text-sm ${prefix}-text-secondary`}>
                        {currentCharacter.throughLine.explanation}
                      </p>
                      <div className={`mt-3 text-sm ${prefix}-text-secondary`}>
                        Key Scenes: {currentCharacter.throughLine.keyScenes.join(', ')}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              {activeSection === 'scene-work' && (
                <motion.div
                  key="scene-work"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Section Concept Selector */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setActiveConcept({ ...activeConcept, gote: 1 })}
                      className={`px-3 py-1 rounded text-sm ${
                        activeConcept.gote === 1 ? `${prefix}-bg-accent ${prefix}-text-accent` : `${prefix}-bg-secondary ${prefix}-text-secondary`
                      }`}
                    >
                      GOTE: Table
                    </button>
                    <button
                      onClick={() => setActiveConcept({ ...activeConcept, gote: 2 })}
                      className={`px-3 py-1 rounded text-sm ${
                        activeConcept.gote === 2 ? `${prefix}-bg-accent ${prefix}-text-accent` : `${prefix}-bg-secondary ${prefix}-text-secondary`
                      }`}
                    >
                      GOTE: Cards
                    </button>
                  </div>

                  {/* GOTE Analysis */}
                  <div className={`p-6 rounded-lg ${prefix}-card`}>
                    <h4 className={`font-semibold mb-4 ${prefix}-text-primary`}>GOTE Analysis</h4>
                    {activeConcept.gote === 1 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className={`border-b ${prefix}-border`}>
                              <th className={`text-left py-2 px-4 ${prefix}-text-primary`}>Scene</th>
                              <th className={`text-left py-2 px-4 ${prefix}-text-primary`}>Goal</th>
                              <th className={`text-left py-2 px-4 ${prefix}-text-primary`}>Obstacle</th>
                              <th className={`text-left py-2 px-4 ${prefix}-text-primary`}>Tactics</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentCharacter.gotAnalysis.map((gote, i) => (
                              <tr key={i} className={`border-b ${prefix}-border`}>
                                <td className={`py-3 px-4 ${prefix}-text-secondary`}>Ep {gote.episodeNumber}, Sc {gote.sceneNumber}</td>
                                <td className={`py-3 px-4 ${prefix}-text-secondary`}>{gote.goal}</td>
                                <td className={`py-3 px-4 ${prefix}-text-secondary`}>{gote.obstacle}</td>
                                <td className={`py-3 px-4 ${prefix}-text-secondary`}>
                                  <ul className="list-disc list-inside">
                                    {gote.tactics.map((t, j) => (
                                      <li key={j} className="text-xs">{t}</li>
                                    ))}
                                  </ul>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentCharacter.gotAnalysis.map((gote, i) => (
                          <div key={i} className={`p-4 rounded-lg ${prefix}-card-secondary`}>
                            <div className={`text-sm font-medium mb-2 ${prefix}-text-primary`}>
                              Episode {gote.episodeNumber}, Scene {gote.sceneNumber}
                            </div>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className={`font-medium ${prefix}-text-primary`}>Goal: </span>
                                <span className={prefix + '-text-secondary'}>{gote.goal}</span>
                              </div>
                              <div>
                                <span className={`font-medium ${prefix}-text-primary`}>Obstacle: </span>
                                <span className={prefix + '-text-secondary'}>{gote.obstacle}</span>
                              </div>
                              <div>
                                <span className={`font-medium ${prefix}-text-primary`}>Tactics: </span>
                                <ul className={`list-disc list-inside ml-4 ${prefix}-text-secondary`}>
                                  {gote.tactics.map((t, j) => (
                                    <li key={j}>{t}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Scene Breakdowns */}
                  <div className={`p-6 rounded-lg ${prefix}-card`}>
                    <h4 className={`font-semibold mb-4 ${prefix}-text-primary`}>Scene Breakdowns</h4>
                    <div className="space-y-4">
                      {currentCharacter.sceneBreakdowns.map((scene, i) => (
                        <div key={i} className={`p-4 rounded-lg ${prefix}-card-secondary`}>
                          <div className={`font-medium mb-2 ${prefix}-text-primary`}>
                            Episode {scene.episodeNumber}, Scene {scene.sceneNumber}
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className={`font-medium ${prefix}-text-primary`}>Objective: </span>
                              <span className={prefix + '-text-secondary'}>{scene.objective}</span>
                            </div>
                            <div>
                              <span className={`font-medium ${prefix}-text-primary`}>Emotional State: </span>
                              <span className={`px-2 py-1 rounded ${prefix}-bg-accent/20 ${prefix}-text-accent`}>
                                {scene.emotionalState}
                              </span>
                            </div>
                            <div>
                              <span className={`font-medium ${prefix}-text-primary`}>Key Lines: </span>
                              <ul className={`list-disc list-inside ml-4 ${prefix}-text-secondary`}>
                                {scene.keyLines.map((line, j) => (
                                  <li key={j} className="italic">"{line}"</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Emotional Beats */}
                  <div className={`p-6 rounded-lg ${prefix}-card`}>
                    <h4 className={`font-semibold mb-4 ${prefix}-text-primary`}>Emotional Beats</h4>
                    <div className="space-y-3">
                      {currentCharacter.emotionalBeats.map((beat, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className={`w-24 text-sm ${prefix}-text-secondary`}>
                            Ep {beat.episodeNumber}, Sc {beat.sceneNumber || 'N/A'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-medium ${prefix}-text-primary`}>{beat.emotion}</span>
                              <div className={`flex-1 h-2 rounded-full ${prefix}-bg-secondary`}>
                                <div
                                  className={`h-full rounded-full ${prefix}-bg-accent`}
                                  style={{ width: `${beat.intensity * 10}%` }}
                                />
                              </div>
                              <span className={`text-xs ${prefix}-text-secondary`}>{beat.intensity}/10</span>
                            </div>
                            <p className={`text-sm ${prefix}-text-secondary`}>{beat.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              {activeSection === 'physical-voice' && (
                <motion.div
                  key="physical-voice"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Physical Work */}
                  <div className={`p-6 rounded-lg ${prefix}-card`}>
                    <h4 className={`font-semibold mb-4 ${prefix}-text-primary`}>Physical Character Work</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h5 className={`font-medium mb-2 ${prefix}-text-primary`}>Body Language</h5>
                        <ul className={`space-y-1 ${prefix}-text-secondary`}>
                          {currentCharacter.physicalWork.bodyLanguage.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="mt-1">✓</span>
                              <span className="text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className={`font-medium mb-2 ${prefix}-text-primary`}>Movement</h5>
                        <ul className={`space-y-1 ${prefix}-text-secondary`}>
                          {currentCharacter.physicalWork.movement.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="mt-1">✓</span>
                              <span className="text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className={`font-medium mb-2 ${prefix}-text-primary`}>Posture</h5>
                        <ul className={`space-y-1 ${prefix}-text-secondary`}>
                          {currentCharacter.physicalWork.posture.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="mt-1">✓</span>
                              <span className="text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Voice Patterns */}
                  <div className={`p-6 rounded-lg ${prefix}-card`}>
                    <h4 className={`font-semibold mb-4 ${prefix}-text-primary`}>Voice & Speech Patterns</h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className={`font-medium mb-2 ${prefix}-text-primary`}>Key Vocabulary</h5>
                        <div className="flex flex-wrap gap-2">
                          {currentCharacter.voicePatterns.vocabulary.map((word, i) => (
                            <span key={i} className={`px-3 py-1 rounded ${prefix}-bg-accent/20 ${prefix}-text-accent`}>
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className={`font-medium mb-2 ${prefix}-text-primary`}>Rhythm</h5>
                        <p className={`${prefix}-text-secondary`}>{currentCharacter.voicePatterns.rhythm}</p>
                      </div>
                      {currentCharacter.voicePatterns.accent && (
                        <div>
                          <h5 className={`font-medium mb-2 ${prefix}-text-primary`}>Accent</h5>
                          <p className={`${prefix}-text-secondary`}>{currentCharacter.voicePatterns.accent}</p>
                        </div>
                      )}
                      <div>
                        <h5 className={`font-medium mb-2 ${prefix}-text-primary`}>Key Phrases</h5>
                        <ul className={`list-disc list-inside space-y-1 ${prefix}-text-secondary`}>
                          {currentCharacter.voicePatterns.keyPhrases.map((phrase, i) => (
                            <li key={i} className="italic">"{phrase}"</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              {activeSection === 'practice' && (
                <motion.div
                  key="practice"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Monologues */}
                  {currentCharacter.monologues.length > 0 && (
                    <div className={`p-6 rounded-lg ${prefix}-card`}>
                      <h4 className={`font-semibold mb-4 ${prefix}-text-primary`}>Monologue Practice</h4>
                      {currentCharacter.monologues.map((mono, i) => (
                        <div key={i} className={`mb-6 p-4 rounded-lg ${prefix}-card-secondary`}>
                          <div className={`text-sm font-medium mb-3 ${prefix}-text-primary`}>
                            Episode {mono.episodeNumber}, Scene {mono.sceneNumber}
                          </div>
                          <div className={`p-4 rounded ${prefix}-bg-secondary mb-4`}>
                            <p className={`text-sm leading-relaxed ${prefix}-text-secondary font-mono`}>
                              {mono.text}
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className={`font-medium mb-2 text-sm ${prefix}-text-primary`}>Practice Notes</h5>
                              <ul className={`list-disc list-inside space-y-1 text-sm ${prefix}-text-secondary`}>
                                {mono.practiceNotes.map((note, j) => (
                                  <li key={j}>{note}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className={`font-medium mb-2 text-sm ${prefix}-text-primary`}>Performance Tips</h5>
                              <ul className={`list-disc list-inside space-y-1 text-sm ${prefix}-text-secondary`}>
                                {mono.performanceTips.map((tip, j) => (
                                  <li key={j}>{tip}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Key Scenes */}
                  <div className={`p-6 rounded-lg ${prefix}-card`}>
                    <h4 className={`font-semibold mb-4 ${prefix}-text-primary`}>Key Scenes</h4>
                    <div className="space-y-4">
                      {currentCharacter.keyScenes.map((scene, i) => (
                        <div key={i} className={`p-4 rounded-lg ${prefix}-card-secondary`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className={`font-medium ${prefix}-text-primary`}>
                              Episode {scene.episodeNumber}, Scene {scene.sceneNumber}
                            </div>
                            <div className="flex">
                              {[...Array(5)].map((_, j) => (
                                <span key={j} className={j < scene.importance ? 'text-yellow-400' : 'text-gray-400'}>
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className={`font-medium ${prefix}-text-primary`}>Why It Matters: </span>
                              <ul className={`list-disc list-inside ml-4 ${prefix}-text-secondary`}>
                                {scene.whyItMatters.map((item, j) => (
                                  <li key={j}>{item}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <span className={`font-medium ${prefix}-text-primary`}>Focus On: </span>
                              <ul className={`list-disc list-inside ml-4 ${prefix}-text-secondary`}>
                                {scene.whatToFocusOn.map((item, j) => (
                                  <li key={j}>{item}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <span className={`font-medium ${prefix}-text-primary`}>Quick Prep: </span>
                              <ul className={`list-disc list-inside ml-4 ${prefix}-text-secondary`}>
                                {scene.quickPrepTips.map((tip, j) => (
                                  <li key={j}>{tip}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* On-Set Preparation */}
                  <div className={`p-6 rounded-lg ${prefix}-card`}>
                    <h4 className={`font-semibold mb-4 ${prefix}-text-primary`}>On-Set Preparation</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className={`font-medium mb-2 ${prefix}-text-primary`}>Pre-Scene</h5>
                        <ul className={`space-y-1 ${prefix}-text-secondary`}>
                          {currentCharacter.onSetPrep.preScene.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <input type="checkbox" className="mt-1" />
                              <span className="text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className={`font-medium mb-2 ${prefix}-text-primary`}>Warm-Up</h5>
                        <ul className={`space-y-1 ${prefix}-text-secondary`}>
                          {currentCharacter.onSetPrep.warmUp.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <input type="checkbox" className="mt-1" />
                              <span className="text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className={`font-medium mb-2 ${prefix}-text-primary`}>Emotional Prep</h5>
                        <ul className={`space-y-1 ${prefix}-text-secondary`}>
                          {currentCharacter.onSetPrep.emotionalPrep.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <input type="checkbox" className="mt-1" />
                              <span className="text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className={`font-medium mb-2 ${prefix}-text-primary`}>Mental Checklist</h5>
                        <ul className={`space-y-1 ${prefix}-text-secondary`}>
                          {currentCharacter.onSetPrep.mentalChecklist.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <input type="checkbox" className="mt-1" />
                              <span className="text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
        {activeLayout === 2 && (
          <motion.div
            key="layout-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex gap-6"
          >
            {/* Sidebar */}
            <div className={`w-64 p-4 rounded-lg ${prefix}-card`}>
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-3 ${prefix}-text-primary`}>
                  Character
                </label>
                <select
                  value={selectedCharacter}
                  onChange={(e) => setSelectedCharacter(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg ${prefix}-bg-secondary ${prefix}-text-primary border ${prefix}-border`}
                >
                  {sampleMaterials.characters.map((char) => (
                    <option key={char.characterName} value={char.characterName}>
                      {char.characterName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                {['Study Guide', 'Performance Ref', 'Through Line', 'GOTE Analysis', 'Scene Breakdowns', 'Emotional Beats', 'Physical Work', 'Voice Patterns', 'Key Scenes', 'Monologues', 'On-Set Prep'].map((section) => (
                  <button
                    key={section}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      activeSection === section.toLowerCase().replace(/\s+/g, '-')
                        ? `${prefix}-bg-accent ${prefix}-text-accent`
                        : `${prefix}-text-secondary hover:${prefix}-bg-secondary`
                    }`}
                  >
                    {section}
                  </button>
                ))}
              </div>
            </div>
            {/* Main Content */}
            <div className={`flex-1 p-6 rounded-lg ${prefix}-card`}>
              <h3 className={`text-xl font-semibold mb-4 ${prefix}-text-primary`}>
                Sidebar Navigation Layout
              </h3>
              <p className={`${prefix}-text-secondary`}>
                Left sidebar for navigation, main area shows selected section. Right panel for quick reference coming next.
              </p>
            </div>
            {/* Right Panel - Quick Reference */}
            <div className={`w-64 p-4 rounded-lg ${prefix}-card-secondary`}>
              <h4 className={`font-semibold mb-3 ${prefix}-text-primary`}>Quick Reference</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <p className={`font-medium ${prefix}-text-primary`}>Key Scenes</p>
                  <p className={`${prefix}-text-secondary`}>Scene 1, 3, 5</p>
                </div>
                <div>
                  <p className={`font-medium ${prefix}-text-primary`}>On-Set Checklist</p>
                  <ul className={`list-disc list-inside ${prefix}-text-secondary`}>
                    <li>Review objective</li>
                    <li>Warm up voice</li>
                    <li>Connect to stakes</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {activeLayout === 3 && (
          <motion.div
            key="layout-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Hero Card */}
            <div className={`p-8 rounded-lg ${prefix}-card-accent`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
                    {currentCharacter.characterName}
                  </h3>
                  <p className={`${prefix}-text-secondary`}>{sampleMaterials.arcTitle}</p>
                </div>
                <select
                  value={selectedCharacter}
                  onChange={(e) => setSelectedCharacter(e.target.value)}
                  className={`px-4 py-2 rounded-lg ${prefix}-bg-secondary ${prefix}-text-primary border ${prefix}-border`}
                >
                  {sampleMaterials.characters.map((char) => (
                    <option key={char.characterName} value={char.characterName}>
                      {char.characterName}
                    </option>
                  ))}
                </select>
              </div>
              <p className={`${prefix}-text-secondary`}>{currentCharacter.studyGuide.background}</p>
            </div>
            {/* Flow Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-6 rounded-lg ${prefix}-card`}>
                <h4 className={`font-semibold mb-2 ${prefix}-text-primary`}>Study</h4>
                <p className={`text-sm ${prefix}-text-secondary`}>Character background, motivations, relationships</p>
              </div>
              <div className={`p-6 rounded-lg ${prefix}-card`}>
                <h4 className={`font-semibold mb-2 ${prefix}-text-primary`}>Practice</h4>
                <p className={`text-sm ${prefix}-text-secondary`}>Scene work, monologues, key moments</p>
              </div>
              <div className={`p-6 rounded-lg ${prefix}-card`}>
                <h4 className={`font-semibold mb-2 ${prefix}-text-primary`}>Perform</h4>
                <p className={`text-sm ${prefix}-text-secondary`}>On-set prep, quick reference, checklists</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

