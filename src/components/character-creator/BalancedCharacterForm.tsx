'use client'

import React, { useState, useEffect } from 'react'
import { Target, User, Tag, Heart, Eye, MessageSquare, ChevronDown, ChevronRight, Wand2, Check } from 'lucide-react'
import { CharacterRole, UnifiedCharacter } from '@/types/unified-character'
import { StoryBible } from '@/services/story-bible-service'

interface BalancedCharacterFormProps {
  storyBible: StoryBible
  onGenerate: (characterData: Partial<UnifiedCharacter>) => Promise<void>
  onBack: () => void
  isGenerating?: boolean
}

type FormSection = 'basic' | 'psychology' | 'appearance' | 'voice'

const roleOptions: { value: CharacterRole; label: string; description: string }[] = [
  { value: 'protagonist', label: 'Protagonist', description: 'Main hero of the story' },
  { value: 'antagonist', label: 'Antagonist', description: 'Main villain/opposition' },
  { value: 'ally', label: 'Ally', description: 'Helps the protagonist' },
  { value: 'mentor', label: 'Mentor', description: 'Guides and teaches' },
  { value: 'love-interest', label: 'Love Interest', description: 'Romantic partner' },
  { value: 'rival', label: 'Rival', description: 'Competitor or challenger' },
  { value: 'family', label: 'Family Member', description: 'Blood relation' },
  { value: 'friend', label: 'Friend', description: 'Close companion' },
  { value: 'authority-figure', label: 'Authority Figure', description: 'Boss, leader, or official' },
  { value: 'comic-relief', label: 'Comic Relief', description: 'Provides humor' },
  { value: 'wildcard', label: 'Wildcard', description: 'Unpredictable element' },
  { value: 'ensemble', label: 'Ensemble', description: 'Part of a group' },
  { value: 'catalyst', label: 'Catalyst', description: 'Sparks change in others' },
  { value: 'mirror', label: 'Mirror', description: 'Reflects protagonist\'s journey' },
  { value: 'threshold', label: 'Threshold Guardian', description: 'Guards important transitions' },
  { value: 'secondary-antagonist', label: 'Secondary Antagonist', description: 'Supporting villain' }
]

const archetypeOptions = [
  'Hero', 'Villain', 'Mentor', 'Ally', 'Trickster', 'Herald', 'Shapeshifter',
  'Guardian', 'Everyman', 'Ruler', 'Creator', 'Magician', 'Sage', 'Explorer',
  'Warrior', 'Lover', 'Caregiver', 'Rebel', 'Innocent', 'Orphan', 'Wanderer',
  'Destroyer', 'Anti-Hero', 'Redeemed Villain', 'Tragic Hero', 'Wise Fool'
]

export default function BalancedCharacterForm({
  storyBible,
  onGenerate,
  onBack,
  isGenerating = false
}: BalancedCharacterFormProps) {

  const [currentSection, setCurrentSection] = useState<FormSection>('basic')
  const [completedSections, setCompletedSections] = useState<Set<FormSection>>(new Set())

  const [characterData, setCharacterData] = useState({
    // Basic Info
    name: '',
    role: '' as CharacterRole | '',
    archetype: '',

    // Psychology
    coreTrait: '',
    primaryFlaw: '',
    want: '',
    need: '',
    relationshipToPremise: '',

    // Appearance
    physicalDescription: '',
    distinctiveFeatures: '',

    // Voice (optional)
    speechPattern: ''
  })

  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string>>({})

  // Track section completion
  useEffect(() => {
    const newCompleted = new Set<FormSection>()

    // Basic section
    if (characterData.name.trim() && characterData.role && characterData.archetype) {
      newCompleted.add('basic')
    }

    // Psychology section
    if (characterData.coreTrait && characterData.primaryFlaw && characterData.want && characterData.need) {
      newCompleted.add('psychology')
    }

    // Appearance section
    if (characterData.physicalDescription.trim()) {
      newCompleted.add('appearance')
    }

    // Voice is optional
    if (characterData.speechPattern.trim()) {
      newCompleted.add('voice')
    }

    setCompletedSections(newCompleted)
  }, [characterData])

  // Generate AI suggestions when relevant fields change
  useEffect(() => {
    if (characterData.role && characterData.archetype) {
      generatePsychologySuggestions()
    }
  }, [characterData.role, characterData.archetype])

  useEffect(() => {
    if (characterData.coreTrait && characterData.primaryFlaw) {
      generateAppearanceSuggestions()
    }
  }, [characterData.coreTrait, characterData.primaryFlaw])

  const generatePsychologySuggestions = async () => {
    if (!characterData.role || !characterData.archetype) return

    try {
      const suggestions = {
        coreTrait: `${characterData.archetype} qualities like determination and courage`,
        primaryFlaw: `Common ${characterData.archetype.toLowerCase()} flaws like arrogance or recklessness`,
        want: `External goals fitting a ${characterData.archetype.toLowerCase()}`,
        need: `Internal growth needed by this character type`
      }

      setAiSuggestions(prev => ({ ...prev, ...suggestions }))
    } catch (error) {
      console.warn('AI psychology suggestions failed:', error)
    }
  }

  const generateAppearanceSuggestions = async () => {
    if (!characterData.coreTrait) return

    try {
      const suggestion = `A ${characterData.coreTrait.toLowerCase()} appearance that reflects their ${characterData.primaryFlaw.toLowerCase()} character.`

      setAiSuggestions(prev => ({ ...prev, physicalDescription: suggestion }))
    } catch (error) {
      console.warn('AI appearance suggestions failed:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check minimum requirements
    const hasBasic = characterData.name.trim() && characterData.role && characterData.archetype
    const hasPsychology = characterData.want && characterData.need && characterData.primaryFlaw

    if (!hasBasic || !hasPsychology) {
      alert('Please complete at least the basic info and psychology sections')
      return
    }

    // Build a comprehensive description from all provided fields
    const descriptionParts: string[] = []
    if (characterData.archetype) {
      descriptionParts.push(characterData.archetype)
    }
    if (characterData.coreTrait) {
      descriptionParts.push(`with ${characterData.coreTrait.toLowerCase()} as a core trait`)
    }
    if (characterData.physicalDescription) {
      descriptionParts.push(`appearance: ${characterData.physicalDescription.substring(0, 100)}`)
    }
    const fullDescription = descriptionParts.length > 0 
      ? descriptionParts.join(', ')
      : `${characterData.archetype || 'Character'} ${characterData.role || ''}`.trim()

    await onGenerate({
      name: characterData.name.trim(),
      role: characterData.role as CharacterRole,
      basic: {
        description: fullDescription,
        archetype: characterData.archetype,
        premiseFunction: characterData.relationshipToPremise || `Serves as ${characterData.role} in the story`
      },
      balanced: {
        physiology: {
          appearance: characterData.physicalDescription,
          keyTraits: characterData.distinctiveFeatures ? characterData.distinctiveFeatures.split(',').map(t => t.trim()) : []
        },
        psychology: {
          coreValue: characterData.coreTrait,
          want: characterData.want,
          need: characterData.need,
          primaryFlaw: characterData.primaryFlaw,
          temperament: [],
          keyFears: [],
          keyStrengths: []
        },
        backstory: '',
        voiceProfile: {
          speechPattern: characterData.speechPattern || 'Speaks naturally'
        }
      }
    })
  }

  const toggleSection = (section: FormSection) => {
    setCurrentSection(section)
  }

  const getSectionStatus = (section: FormSection) => {
    if (completedSections.has(section)) return 'completed'
    if (currentSection === section) return 'active'
    return 'pending'
  }

  const getSectionIcon = (section: FormSection) => {
    switch (section) {
      case 'basic': return <User className="w-4 h-4" />
      case 'psychology': return <Heart className="w-4 h-4" />
      case 'appearance': return <Eye className="w-4 h-4" />
      case 'voice': return <MessageSquare className="w-4 h-4" />
    }
  }

  const sections: { id: FormSection; title: string; description: string; required: boolean }[] = [
    { id: 'basic', title: 'Basic Info', description: 'Name, role, and archetype', required: true },
    { id: 'psychology', title: 'Psychology', description: 'Motivations and personality', required: true },
    { id: 'appearance', title: 'Appearance', description: 'Physical description', required: true },
    { id: 'voice', title: 'Voice (Optional)', description: 'Speech and mannerisms', required: false }
  ]

  const canProceed = completedSections.has('basic') && completedSections.has('psychology') && completedSections.has('appearance')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Target className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Create Balanced Character</h2>
            <p className="text-gray-400">Rich character with story integration</p>
          </div>
        </div>
        <p className="text-gray-300 max-w-lg mx-auto">
          Build a character with depth and psychological complexity.
          Perfect for main characters and recurring roles.
        </p>
      </div>

      {/* Progress Overview */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          {sections.map((section, index) => {
            const status = getSectionStatus(section.id)
            const isCompleted = completedSections.has(section.id)
            const isActive = currentSection === section.id

            return (
              <React.Fragment key={section.id}>
                <div
                  onClick={() => toggleSection(section.id)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all
                    ${isActive ? 'bg-purple-600 text-white' : isCompleted ? 'bg-green-600/20 text-green-400' : 'bg-gray-700 text-gray-400'}
                  `}
                >
                  {getSectionIcon(section.id)}
                  <span className="text-sm font-medium">{section.title}</span>
                  {isCompleted && <Check className="w-3 h-3" />}
                </div>
                {index < sections.length - 1 && (
                  <div className={`flex-1 h-px ${isCompleted ? 'bg-green-500' : 'bg-gray-600'}`} />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">

        {/* Basic Info Section */}
        {currentSection === 'basic' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">Basic Information</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Character Name *</label>
              <input
                type="text"
                value={characterData.name}
                onChange={(e) => setCharacterData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter character name..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isGenerating}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Character Role *</label>
                <select
                  value={characterData.role}
                  onChange={(e) => setCharacterData(prev => ({ ...prev, role: e.target.value as CharacterRole }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isGenerating}
                >
                  <option value="">Select a role...</option>
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Archetype *</label>
              <select
                value={characterData.archetype}
                onChange={(e) => setCharacterData(prev => ({ ...prev, archetype: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isGenerating}
              >
                <option value="">Select an archetype...</option>
                {archetypeOptions.map((archetype) => (
                  <option key={archetype} value={archetype}>
                    {archetype}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Psychology Section */}
        {currentSection === 'psychology' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">Psychology & Motivation</h3>
            </div>

          <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Core Trait/Strength *</label>
                <input
                  type="text"
                  value={characterData.coreTrait}
                  onChange={(e) => setCharacterData(prev => ({ ...prev, coreTrait: e.target.value }))}
                  placeholder="e.g., Courageous, Intelligent, Compassionate..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isGenerating}
                />
                {aiSuggestions.coreTrait && !characterData.coreTrait && (
                  <div className="text-sm text-gray-400 italic">{aiSuggestions.coreTrait}</div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Primary Flaw/Weakness *</label>
              <input
                type="text"
                  value={characterData.primaryFlaw}
                  onChange={(e) => setCharacterData(prev => ({ ...prev, primaryFlaw: e.target.value }))}
                  placeholder="e.g., Impatient, Stubborn, Reckless..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isGenerating}
              />
                {aiSuggestions.primaryFlaw && !characterData.primaryFlaw && (
                  <div className="text-sm text-gray-400 italic">{aiSuggestions.primaryFlaw}</div>
                )}
            </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">What They Want (External Goal) *</label>
                <input
                  type="text"
                value={characterData.want}
                onChange={(e) => setCharacterData(prev => ({ ...prev, want: e.target.value }))}
                  placeholder="Their conscious pursuit..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isGenerating}
                />
                {aiSuggestions.want && !characterData.want && (
                  <div className="text-sm text-gray-400 italic">{aiSuggestions.want}</div>
                )}
            </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">What They Need (Internal Lesson) *</label>
                <input
                  type="text"
                value={characterData.need}
                onChange={(e) => setCharacterData(prev => ({ ...prev, need: e.target.value }))}
                  placeholder="Their unconscious growth requirement..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isGenerating}
                />
                {aiSuggestions.need && !characterData.need && (
                  <div className="text-sm text-gray-400 italic">{aiSuggestions.need}</div>
                )}
            </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Relationship to Story Premise</label>
                <textarea
                  value={characterData.relationshipToPremise}
                  onChange={(e) => setCharacterData(prev => ({ ...prev, relationshipToPremise: e.target.value }))}
                  placeholder="How does this character help prove the story's premise?"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  disabled={isGenerating}
                />
              </div>
            </div>
          </div>
        )}

        {/* Appearance Section */}
        {currentSection === 'appearance' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">Physical Appearance</h3>
            </div>

          <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Physical Description *</label>
              <textarea
                  value={characterData.physicalDescription}
                  onChange={(e) => setCharacterData(prev => ({ ...prev, physicalDescription: e.target.value }))}
                  placeholder="Describe their appearance, build, age, clothing style..."
                  rows={4}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  disabled={isGenerating}
                />
                {aiSuggestions.physicalDescription && !characterData.physicalDescription && (
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 mt-2">
                    <div className="flex items-start gap-2">
                      <Wand2 className="w-4 h-4 text-purple-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-purple-300">AI Suggestion:</p>
                        <p className="text-sm text-gray-300 italic">{aiSuggestions.physicalDescription}</p>
                      </div>
                    </div>
                  </div>
                )}
            </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Distinctive Features</label>
                <input
                  type="text"
                  value={characterData.distinctiveFeatures}
                  onChange={(e) => setCharacterData(prev => ({ ...prev, distinctiveFeatures: e.target.value }))}
                  placeholder="e.g., scar on cheek, tattoos, unusual hair color..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isGenerating}
                />
                <p className="text-xs text-gray-400">Separate multiple features with commas</p>
              </div>
            </div>
          </div>
        )}

        {/* Voice Section */}
        {currentSection === 'voice' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">Voice & Speech (Optional)</h3>
            </div>

          <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Speech Pattern</label>
              <textarea
                  value={characterData.speechPattern}
                  onChange={(e) => setCharacterData(prev => ({ ...prev, speechPattern: e.target.value }))}
                  placeholder="How do they speak? Fast/slow, formal/casual, accent, catchphrases..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  disabled={isGenerating}
              />
            </div>
            </div>
          </div>
        )}

      {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-700">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            disabled={isGenerating}
          >
            ← Back to mode selection
          </button>

          <button
            type="submit"
            disabled={!canProceed || isGenerating}
            className={`
              px-8 py-3 rounded-lg font-semibold transition-all flex items-center gap-2
              ${canProceed && !isGenerating
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Character...
              </>
            ) : (
              <>
                <Target className="w-4 h-4" />
                Create Character
              </>
            )}
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="text-center text-sm text-gray-400 max-w-lg mx-auto">
        <p>
          Complete the required sections (marked with *) to create a rich, story-integrated character.
          The psychology section is key to making your character feel real and compelling.
        </p>
      </div>
    </div>
  )
}