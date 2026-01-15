'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { InvestorMaterialsPackage } from '@/types/investor-materials'
import { getStoryBible } from '@/services/story-bible-service'

interface NarrativeTechnicalitiesProps {
  pitchPackage: InvestorMaterialsPackage
  linkId: string
}

export default function NarrativeTechnicalities({ pitchPackage, linkId }: NarrativeTechnicalitiesProps) {
  const [activeTab, setActiveTab] = useState('premise')
  const [storyBible, setStoryBible] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Use dark theme prefix for investor materials
  const prefix = 'dark'

  useEffect(() => {
    const fetchStoryBible = async () => {
      try {
        if (pitchPackage.storyBibleId) {
          // Fetch story bible through API route
          const response = await fetch(`/api/investor-shared/${linkId}/story-bible`)
          if (response.ok) {
            const data = await response.json()
            setStoryBible(data.storyBible)
          } else {
            // Fallback: try direct fetch
            try {
              const bible = await getStoryBible(pitchPackage.storyBibleId)
              setStoryBible(bible)
            } catch (err) {
              console.error('Error fetching story bible:', err)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching story bible:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStoryBible()
  }, [pitchPackage.storyBibleId, linkId])

  // Helper function to safely get content with fallback - same as story bible page
  const getContentOrFallback = (obj: any, field: string) => {
    const value = obj?.[field] ?? obj?.rawContent
    if (!value) return 'Content not available'

    const tryParseJSON = (s: unknown) => {
      if (typeof s !== 'string') return null
      const t = s.trim()
      if (!(t.startsWith('{') || t.startsWith('['))) return null
      try { return JSON.parse(t) } catch { return null }
    }

    const stringifyItem = (item: any): string => {
      if (item == null) return ''
      if (typeof item === 'string') return item

      if (Array.isArray(item)) {
        const parts = item.map((it) => stringifyItem(it)).filter(Boolean)
        return parts.join(' • ')
      }

      if (typeof item === 'object') {
        // Special handling for genre tropes object
        if ('embrace' in item || 'subvert' in item || 'avoid' in item) {
          const fmt = (x: any) => Array.isArray(x) ? x.join(', ') : String(x ?? '')
          return `Embrace: ${fmt(item.embrace)} | Subvert: ${fmt(item.subvert)} | Avoid: ${fmt(item.avoid)}`
        }

        // Prefer common label/description fields if present
        const labelKeys = ['title', 'name', 'label', 'decisionID', 'id', 'character', 'choice', 'key', 'type', 'arc', 'role']
        const descKeys  = ['summary', 'description', 'text', 'details', 'value', 'impact']
        const labelKey = labelKeys.find(k => k in item)
        const descKey  = descKeys.find(k => k in item)

        if (labelKey || descKey) {
          const parts = []
          if (labelKey) parts.push(String(item[labelKey]))
          if (descKey) parts.push(String(item[descKey]))
          return parts.join(' — ')
        }

        // Flatten shallow key: value pairs where values are strings/arrays
        const pairs = Object.entries(item).map(([k, v]) => {
          if (typeof v === 'string') return `${k}: ${v}`
          if (Array.isArray(v)) {
            const s = v.map((it) => stringifyItem(it)).filter(Boolean).join(', ')
            return s ? `${k}: ${s}` : ''
          }
          return ''
        }).filter(Boolean)

        if (pairs.length) return pairs.join(' • ')

        // Fallback to compact JSON
        return JSON.stringify(item)
      }

      return String(item)
    }

    // If we got a JSON-like string, parse then format
    const parsed = tryParseJSON(value)
    return stringifyItem(parsed ?? value)
  }

  const tabs = [
    { id: 'premise', label: 'Premise' },
    { id: 'tension', label: 'Tension' },
    { id: 'choice-arch', label: 'Choice Architecture' },
    { id: 'trope', label: 'Trope Analysis' },
    { id: 'cohesion', label: 'Cohesion' },
    { id: 'dialogue', label: 'Dialogue' },
    { id: 'genre', label: 'Genre' },
    { id: 'theme', label: 'Theme' },
  ]

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981] mx-auto mb-4"></div>
        <p className="text-white/70">Loading narrative technicalities...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4 crt-text-glow">
          Narrative Technicalities
        </h1>
        <p className="text-lg text-white/70 max-w-2xl mx-auto mb-6">
          Technical aspects of the story used as reference by the AI in writing episodes
        </p>
        
        {/* Disclaimer Note */}
        <div className="max-w-3xl mx-auto p-6 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl mb-8">
          <p className="text-white/80 text-sm leading-relaxed italic">
            <strong className="text-[#10B981] not-italic">Note:</strong> Reading this part of the story bible is optional, the data here is used as the reference for the AI showrunner in co-writing the series but If you actually read this you're one step ahead of the rest.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#10B981]/20">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition-all duration-300 border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#10B981] text-[#10B981]'
                  : 'border-transparent text-white/60 hover:text-white/80 hover:border-white/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content - Exact same structure as story bible */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Premise Section */}
          {activeTab === 'premise' && storyBible?.premise && (
            <>
              <div>
                <h2 className={`text-3xl font-bold ${prefix}-text-primary mb-2`}>Premise</h2>
                <p className={`text-base ${prefix}-text-secondary mb-8`}>
                  The foundational statement that drives your entire story forward.
                </p>
              </div>
              
              <div className={`${prefix}-card ${prefix}-border rounded-lg p-6 border-l-4 ${prefix}-border-accent`}>
                <h3 className={`text-xl font-bold ${prefix}-text-primary mb-2`}>
                    "{getContentOrFallback(storyBible.premise, 'premiseStatement')}"
                </h3>
                  <p className={`${prefix}-text-tertiary`}>
                    <strong>Egri's Equation:</strong> {getContentOrFallback(storyBible.premise, 'character')} + {getContentOrFallback(storyBible.premise, 'conflict')} → {getContentOrFallback(storyBible.premise, 'resolution')}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                  <h3 className={`text-lg font-semibold ${prefix}-text-primary`}>Core Elements</h3>
                    <div className="space-y-3">
                    <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                      <p className={`text-sm ${prefix}-text-tertiary mb-1`}>Theme</p>
                      <p className={`font-semibold ${prefix}-text-primary`}>{getContentOrFallback(storyBible.premise, 'theme')}</p>
                      </div>
                    <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                      <p className={`text-sm ${prefix}-text-tertiary mb-1`}>Premise Type</p>
                      <p className={`font-semibold ${prefix}-text-primary`}>{getContentOrFallback(storyBible.premise, 'premiseType')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                  <h3 className={`text-lg font-semibold ${prefix}-text-primary`}>Story Function</h3>
                    <p className={`${prefix}-text-secondary text-sm leading-relaxed`}>
                      Every character, scene, and user choice in this story serves to prove this central premise. 
                      This ensures narrative coherence and emotional satisfaction by building toward a logical conclusion.
                    </p>
                    
                    {storyBible.premiseValidation && (
                    <div className={`${prefix}-card ${prefix}-border rounded-lg p-4 ${
                      storyBible.premiseValidation.strength === 'strong' ? `${prefix}-border-accent` : ''
                    }`}>
                      <p className={`text-sm font-semibold ${prefix}-text-primary`}>
Premise Strength: {typeof storyBible.premiseValidation.strength === 'string' ? storyBible.premiseValidation.strength.toUpperCase() : getContentOrFallback(storyBible.premiseValidation, 'strength')}
                        </p>
                        {storyBible.premiseValidation.issues && storyBible.premiseValidation.issues.length > 0 && (
                        <p className={`text-xs mt-1 ${prefix}-text-tertiary`}>
                            {storyBible.premiseValidation.issues.join(', ')}
                          </p>
                        )}
                      </div>
                    )}
                </div>
              </div>
            </>
          )}

          {/* Tension Section */}
          {activeTab === 'tension' && storyBible?.tensionStrategy && (
            <>
              <div>
                <h2 className={`text-3xl font-bold ${prefix}-text-primary mb-2`}>Tension</h2>
                <p className={`text-base ${prefix}-text-secondary mb-8`}>
                  Analysis of the story's tension strategy, including rising action, climax points, and character stakes.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Tension Curve</h3>
                  <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.tensionStrategy, 'tensionCurve')}</p>
                </div>
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Climax Points</h3>
                  <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.tensionStrategy, 'climaxPoints')}</p>
                </div>
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Release Moments</h3>
                  <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.tensionStrategy, 'releaseMoments')}</p>
                </div>
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Escalation Techniques</h3>
                  <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.tensionStrategy, 'escalationTechniques')}</p>
                </div>
              </div>
              <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Emotional Beats</h3>
                <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.tensionStrategy, 'emotionalBeats')}</p>
              </div>
            </>
          )}

          {/* Choice Architecture Section */}
          {activeTab === 'choice-arch' && storyBible?.choiceArchitecture && (
            <>
              <div>
                <h2 className={`text-3xl font-bold ${prefix}-text-primary mb-2`}>Choice Architecture</h2>
                <p className={`text-base ${prefix}-text-secondary mb-8`}>
                  Examines the design of user choices within the narrative, ensuring they are meaningful, impactful, and lead to distinct branching paths.
                </p>
              </div>
              <div className="space-y-6">
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Key Decisions</h3>
                  <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.choiceArchitecture, 'keyDecisions')}</p>
                </div>
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Moral Choices</h3>
                  <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.choiceArchitecture, 'moralChoices')}</p>
                </div>
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Consequence Mapping</h3>
                  <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.choiceArchitecture, 'consequenceMapping')}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Character Growth</h3>
                    <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.choiceArchitecture, 'characterGrowth')}</p>
                  </div>
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Thematic Choices</h3>
                    <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.choiceArchitecture, 'thematicChoices')}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Trope Analysis Section */}
          {activeTab === 'trope' && storyBible?.tropeAnalysis && (
            <>
              <div>
                <h2 className={`text-3xl font-bold ${prefix}-text-primary mb-2`}>Trope Analysis</h2>
                <p className={`text-base ${prefix}-text-secondary mb-8`}>
                  Identifies and analyzes the use of common narrative tropes, ensuring they are either subverted, played straight, or deconstructed effectively.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Genre Tropes Used</h3>
                  <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.tropeAnalysis, 'genreTropes')}</p>
                </div>
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Subverted Tropes</h3>
                  <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.tropeAnalysis, 'subvertedTropes')}</p>
                </div>
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Original Elements</h3>
                  <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.tropeAnalysis, 'originalElements')}</p>
                </div>
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Audience Expectations</h3>
                  <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.tropeAnalysis, 'audienceExpectations')}</p>
                </div>
              </div>
              <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Innovative Twists</h3>
                <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.tropeAnalysis, 'innovativeTwists')}</p>
              </div>
            </>
          )}

          {/* Cohesion Section */}
          {activeTab === 'cohesion' && storyBible?.cohesionAnalysis && (
            <>
              <div>
                <h2 className={`text-3xl font-bold ${prefix}-text-primary mb-2`}>Cohesion</h2>
                <p className={`text-base ${prefix}-text-secondary mb-8`}>
                  Evaluates the consistency and logical flow of the narrative, ensuring all plot threads, character motivations, and world rules remain coherent.
                </p>
              </div>
              <div className="space-y-6">
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Narrative Cohesion</h3>
                  <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.cohesionAnalysis, 'narrativeCohesion')}</p>
                </div>
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Thematic Continuity</h3>
                  <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.cohesionAnalysis, 'thematicContinuity')}</p>
                </div>
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Character Arcs</h3>
                  <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.cohesionAnalysis, 'characterArcs')}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Plot Consistency</h3>
                    <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.cohesionAnalysis, 'plotConsistency')}</p>
                  </div>
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Emotional Journey</h3>
                    <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.cohesionAnalysis, 'emotionalJourney')}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Dialogue Section */}
          {activeTab === 'dialogue' && (
            <>
              <div>
                <h2 className={`text-3xl font-bold ${prefix}-text-primary mb-2`}>Dialogue</h2>
                <p className={`text-base ${prefix}-text-secondary mb-8`}>
                  Outlines the stylistic approach to dialogue, including character voices, pacing, language, and subtext.
                </p>
              </div>
              
              {/* Dialogue Language Setting - Prominent Display */}
              {storyBible?.dialogueLanguage && (
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-6 border-l-4 ${prefix}-border-accent mb-6`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-xl font-bold ${prefix}-text-primary flex items-center gap-2`}>
                      🗣️ Dialogue Language
                    </h3>
                  </div>
                  <p className={`${prefix}-text-secondary mb-2`}>
                    {storyBible.dialogueLanguage === 'tagalog' && 
                      '🇵🇭 All dialogue will be generated in authentic Taglish (Tagalog-English code-switching) with Filipino cultural expressions and values.'}
                    {storyBible.dialogueLanguage === 'thai' && 
                      '🇹🇭 All dialogue will be generated in Thai script with appropriate politeness particles and cultural context.'}
                    {storyBible.dialogueLanguage === 'spanish' && 
                      '🇪🇸 All dialogue will be generated in Spanish with natural conversational flow and cultural nuances.'}
                    {storyBible.dialogueLanguage === 'korean' && 
                      '🇰🇷 All dialogue will be generated in Korean script with appropriate speech levels and honorifics.'}
                    {storyBible.dialogueLanguage === 'japanese' && 
                      '🇯🇵 All dialogue will be generated in Japanese with appropriate politeness levels and cultural expressions.'}
                    {storyBible.dialogueLanguage === 'french' && 
                      '🇫🇷 All dialogue will be generated in French with appropriate formality and cultural nuances.'}
                    {storyBible.dialogueLanguage === 'chinese' && 
                      '🇨🇳 All dialogue will be generated in Mandarin Chinese characters with cultural context.'}
                    {(!storyBible.dialogueLanguage || storyBible.dialogueLanguage === 'english') && 
                      '🇺🇸 All dialogue will be generated in English (default).'}
                  </p>
                  <p className={`text-sm ${prefix}-text-tertiary italic`}>
                    Note: Narrative prose and scene descriptions remain in English for readability. Only character dialogue uses the selected language.
                  </p>
                </div>
              )}
              
              {storyBible?.dialogueStrategy && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Character Voice</h3>
                    <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.dialogueStrategy, 'characterVoice')}</p>
                  </div>
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Conflict Dialogue</h3>
                    <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.dialogueStrategy, 'conflictDialogue')}</p>
                  </div>
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Subtext</h3>
                    <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.dialogueStrategy, 'subtext')}</p>
                  </div>
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Speech Patterns</h3>
                    <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.dialogueStrategy, 'speechPatterns')}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Genre Section */}
          {activeTab === 'genre' && storyBible?.genreEnhancement && (
            <>
              <div>
                <h2 className={`text-3xl font-bold ${prefix}-text-primary mb-2`}>Genre</h2>
                <p className={`text-base ${prefix}-text-secondary mb-8`}>
                  Analyzes and suggests ways to enhance the story's adherence to or subversion of its primary genre conventions.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Visual Style</h3>
                  <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.genreEnhancement, 'visualStyle')}</p>
                </div>
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Pacing</h3>
                  <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.genreEnhancement, 'pacing')}</p>
                </div>
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Tropes</h3>
                  <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.genreEnhancement, 'tropes')}</p>
                </div>
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Audience Expectations</h3>
                  <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.genreEnhancement, 'audienceExpectations')}</p>
                </div>
              </div>
            </>
          )}

          {/* Theme Section */}
          {activeTab === 'theme' && storyBible?.themeIntegration && (
            <>
              <div>
                <h2 className={`text-3xl font-bold ${prefix}-text-primary mb-2`}>Theme</h2>
                <p className={`text-base ${prefix}-text-secondary mb-8`}>
                  Details how the central themes are woven into the narrative, characters, and choices, ensuring a consistent and impactful thematic message.
                </p>
              </div>
              <div className="space-y-6">
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Character Integration</h3>
                  <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.themeIntegration, 'characterIntegration')}</p>
                </div>
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Plot Integration</h3>
                  <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.themeIntegration, 'plotIntegration')}</p>
                </div>
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Symbolic Elements</h3>
                  <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.themeIntegration, 'symbolicElements')}</p>
                </div>
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Resolution Strategy</h3>
                  <p className={`${prefix}-text-secondary`}>{getContentOrFallback(storyBible.themeIntegration, 'resolutionStrategy')}</p>
                </div>
              </div>
            </>
          )}

          {/* No Data Message */}
          {!storyBible && !loading && (
            <div className={`${prefix}-card ${prefix}-border rounded-lg p-12 text-center`}>
              <p className={`${prefix}-text-secondary`}>No story bible data available</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

