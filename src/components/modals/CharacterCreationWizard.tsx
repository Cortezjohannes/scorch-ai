'use client'

import { useState } from 'react'
import { X, Sparkles, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { aiPromptAssistant, AIOption } from '@/services/ai-prompt-assistant'

// ============================================================================
// TYPES
// ============================================================================

interface CharacterCreationWizardProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (character: any) => void
  storyBible?: any
}

type WizardStep = 'basic' | 'physiology' | 'sociology' | 'psychology' | 'backstory' | 'voice' | 'review'

interface CharacterData {
  name: string
  archetype: string
  premiseFunction: string
  physiology: {
    age: string
    gender: string
    appearance: string
    build: string
    health: string
    physicalTraits: string[]
  }
  sociology: {
    class: string
    occupation: string
    education: string
    homeLife: string
    economicStatus: string
    communityStanding: string
  }
  psychology: {
    coreValue: string
    moralStandpoint: string
    want: string
    need: string
    primaryFlaw: string
    temperament: string[]
    enneagramType: string
    fears: string[]
    strengths: string[]
  }
  backstory: string
  arc: string
  voiceProfile: {
    speechPattern: string
    vocabulary: string
    quirks: string[]
  }
}

// ============================================================================
// CHARACTER CREATION WIZARD
// ============================================================================

export default function CharacterCreationWizard({
  isOpen,
  onClose,
  onComplete,
  storyBible
}: CharacterCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('basic')
  const [characterData, setCharacterData] = useState<CharacterData>({
    name: '',
    archetype: '',
    premiseFunction: '',
    physiology: {
      age: '',
      gender: '',
      appearance: '',
      build: '',
      health: '',
      physicalTraits: []
    },
    sociology: {
      class: '',
      occupation: '',
      education: '',
      homeLife: '',
      economicStatus: '',
      communityStanding: ''
    },
    psychology: {
      coreValue: '',
      moralStandpoint: '',
      want: '',
      need: '',
      primaryFlaw: '',
      temperament: [],
      enneagramType: '',
      fears: [],
      strengths: []
    },
    backstory: '',
    arc: '',
    voiceProfile: {
      speechPattern: '',
      vocabulary: '',
      quirks: []
    }
  })

  const [aiPrompt, setAiPrompt] = useState('')
  const [aiOptions, setAiOptions] = useState<AIOption[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [editingContent, setEditingContent] = useState<any>(null)
  const [isYoloGenerating, setIsYoloGenerating] = useState(false)

  const steps: WizardStep[] = ['basic', 'physiology', 'sociology', 'psychology', 'backstory', 'voice', 'review']

  if (!isOpen) return null

  // ============================================================================
  // AI GENERATION HANDLERS
  // ============================================================================

  const handleGenerateAI = async (stepType: string) => {
    if (!aiPrompt.trim()) {
      alert('Please enter a description or request for the AI')
      return
    }

    setIsGenerating(true)
    setAiOptions([])
    setSelectedOption(null)

    try {
      let result

      switch (stepType) {
        case 'physiology':
        case 'sociology':
        case 'psychology':
        case 'voiceProfile':
          result = await aiPromptAssistant.generateCharacterSection(
            {
              name: characterData.name,
              archetype: characterData.archetype,
              premiseFunction: characterData.premiseFunction,
              existingData: characterData
            },
            stepType as any,
            aiPrompt
          )
          break

        case 'backstory':
          result = await aiPromptAssistant.generateCharacterSection(
            {
              name: characterData.name,
              archetype: characterData.archetype,
              premiseFunction: characterData.premiseFunction,
              existingData: characterData
            },
            'backstory',
            aiPrompt
          )
          break

        default:
          throw new Error(`Unknown step type: ${stepType}`)
      }

      setAiOptions(result.options)
      console.log('✅ AI generated options:', result.options)
    } catch (error) {
      console.error('Error generating AI options:', error)
      alert('Failed to generate AI options. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSelectOption = (optionId: string) => {
    setSelectedOption(optionId)
    const option = aiOptions.find(opt => opt.id === optionId)
    if (option) {
      setEditingContent(option.content)
    }
  }

  const handleApplyOption = () => {
    if (!editingContent) return

    const stepMap: Record<WizardStep, keyof CharacterData> = {
      physiology: 'physiology',
      sociology: 'sociology',
      psychology: 'psychology',
      backstory: 'backstory',
      voice: 'voiceProfile',
      basic: 'name',
      review: 'name'
    }

    const field = stepMap[currentStep]
    
    if (field === 'backstory') {
      setCharacterData(prev => ({ ...prev, backstory: editingContent, arc: editingContent }))
    } else {
      setCharacterData(prev => ({ ...prev, [field]: editingContent }))
    }

    // Clear AI state
    setAiOptions([])
    setSelectedOption(null)
    setEditingContent(null)
    setAiPrompt('')
  }

  // ============================================================================
  // YOLO MODE - 100% AI GENERATED CHARACTER
  // ============================================================================

  const handleYOLO = async () => {
    if (!confirm(
      '🎲 YOLO MODE: The AI will generate a complete character that fits your story!\n\n' +
      'This will create a contextually-relevant character with full details across all sections. ' +
      'You can still edit the final result before saving.\n\nReady to roll the dice?'
    )) {
      return
    }

    setIsYoloGenerating(true)

    try {
      // Build context from story bible
      const storyContext = storyBible ? `
Story Title: ${storyBible.seriesTitle || 'Untitled'}
Genre: ${storyBible.genre || 'Unknown'}
Tone: ${storyBible.tone || 'Unknown'}
Setting: ${storyBible.worldBuilding?.locations?.map((l: any) => l.name).join(', ') || 'Unknown'}
Existing Characters: ${storyBible.characters?.map((c: any) => `${c.name} (${c.archetype})`).join(', ') || 'None'}
Story Premise: ${storyBible.premise || 'Unknown'}
` : 'No story context available'

      console.log('🎲 YOLO MODE: Generating full character with story context...')

      // Generate all sections at once with full context
      const [physiologyResult, sociologyResult, psychologyResult, backstoryResult, voiceResult] = await Promise.all([
        aiPromptAssistant.generateCharacterSection(
          {
            name: 'New Character',
            archetype: 'Supporting Character',
            premiseFunction: 'To be determined by AI based on story needs',
            existingData: characterData
          },
          'physiology',
          `Create a character that would fit naturally in this story:\n${storyContext}\n\nMake them distinct from existing characters but thematically relevant.`
        ),
        aiPromptAssistant.generateCharacterSection(
          {
            name: 'New Character',
            archetype: 'Supporting Character',
            premiseFunction: 'To be determined by AI',
            existingData: characterData
          },
          'sociology',
          `Create sociology for a character in this world:\n${storyContext}\n\nEnsure they fit the setting and social dynamics.`
        ),
        aiPromptAssistant.generateCharacterSection(
          {
            name: 'New Character',
            archetype: 'Supporting Character',
            premiseFunction: 'To be determined by AI',
            existingData: characterData
          },
          'psychology',
          `Create psychology that serves the story's themes:\n${storyContext}\n\nGive them depth and motivation that could create interesting conflict or support.`
        ),
        aiPromptAssistant.generateCharacterSection(
          {
            name: 'New Character',
            archetype: 'Supporting Character',
            premiseFunction: 'To be determined by AI',
            existingData: characterData
          },
          'backstory',
          `Create a backstory that connects to this world:\n${storyContext}\n\nMake it relevant to the story's themes and setting.`
        ),
        aiPromptAssistant.generateCharacterSection(
          {
            name: 'New Character',
            archetype: 'Supporting Character',
            premiseFunction: 'To be determined by AI',
            existingData: characterData
          },
          'voiceProfile',
          `Create a distinct voice for a character in this story:\n${storyContext}\n\nMake their dialogue style memorable and fitting.`
        )
      ])

      // Pick the best options (highest confidence) from each
      const bestPhysiology = physiologyResult.options.sort((a, b) => b.confidence - a.confidence)[0]
      const bestSociology = sociologyResult.options.sort((a, b) => b.confidence - a.confidence)[0]
      const bestPsychology = psychologyResult.options.sort((a, b) => b.confidence - a.confidence)[0]
      const bestBackstory = backstoryResult.options.sort((a, b) => b.confidence - a.confidence)[0]
      const bestVoice = voiceResult.options.sort((a, b) => b.confidence - a.confidence)[0]

      // Generate a contextually relevant name and archetype
      const namePrompt = `Based on this character profile and story context:\n${storyContext}\n\nPhysiology: ${JSON.stringify(bestPhysiology.content)}\nSociology: ${JSON.stringify(bestSociology.content)}\n\nSuggest a fitting name and archetype.`
      
      // For now, use a sensible default name/archetype - we can enhance this later
      const suggestedName = 'AI-Generated Character'
      const suggestedArchetype = 'Supporting Character'

      // Apply all generated data
      setCharacterData({
        name: suggestedName,
        archetype: suggestedArchetype,
        premiseFunction: `Contextually-relevant character for ${storyBible?.seriesTitle || 'the story'}`,
        physiology: bestPhysiology.content,
        sociology: bestSociology.content,
        psychology: bestPsychology.content,
        backstory: bestBackstory.content,
        arc: '',
        voiceProfile: bestVoice.content
      })

      // Jump to review step
      setCurrentStep('review')

      console.log('✅ YOLO character generated successfully!')
      alert('🎉 YOLO character generated! Review the details and edit anything you want before creating.')
    } catch (error) {
      console.error('❌ YOLO generation failed:', error)
      alert('Failed to generate YOLO character. Please try again or use the step-by-step wizard.')
    } finally {
      setIsYoloGenerating(false)
    }
  }

  // ============================================================================
  // NAVIGATION
  // ============================================================================

  const getCurrentStepIndex = () => steps.indexOf(currentStep)

  const canProceed = () => {
    switch (currentStep) {
      case 'basic':
        return (
          characterData.name.trim().length > 0 &&
          characterData.archetype.trim().length > 0 &&
          characterData.premiseFunction.trim().length > 0
        )
      case 'physiology':
        return (
          characterData.physiology.age.trim().length > 0 &&
          characterData.physiology.gender.trim().length > 0 &&
          characterData.physiology.appearance.trim().length > 0
        )
      case 'sociology':
        return (
          characterData.sociology.class.trim().length > 0 &&
          characterData.sociology.occupation.trim().length > 0
        )
      case 'psychology':
        return (
          characterData.psychology.want.trim().length > 0 &&
          characterData.psychology.need.trim().length > 0 &&
          characterData.psychology.primaryFlaw.trim().length > 0
        )
      case 'backstory':
        return characterData.backstory.trim().length > 0
      case 'voice':
        return characterData.voiceProfile.speechPattern.trim().length > 0
      case 'review':
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    const currentIndex = getCurrentStepIndex()
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
      setAiOptions([])
      setSelectedOption(null)
      setEditingContent(null)
      setAiPrompt('')
    }
  }

  const handlePrevious = () => {
    const currentIndex = getCurrentStepIndex()
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
      setAiOptions([])
      setSelectedOption(null)
      setEditingContent(null)
      setAiPrompt('')
    }
  }

  const handleComplete = () => {
    if (!characterData.name.trim()) {
      alert('Character name is required')
      return
    }

    onComplete(characterData)
    onClose()
    
    // Reset for next use
    setCurrentStep('basic')
    setCharacterData({
      name: '',
      archetype: '',
      premiseFunction: '',
      physiology: {
        age: '',
        gender: '',
        appearance: '',
        build: '',
        health: '',
        physicalTraits: []
      },
      sociology: {
        class: '',
        occupation: '',
        education: '',
        homeLife: '',
        economicStatus: '',
        communityStanding: ''
      },
      psychology: {
        coreValue: '',
        moralStandpoint: '',
        want: '',
        need: '',
        primaryFlaw: '',
        temperament: [],
        enneagramType: '',
        fears: [],
        strengths: []
      },
      backstory: '',
      arc: '',
      voiceProfile: {
        speechPattern: '',
        vocabulary: '',
        quirks: []
      }
    })
  }

  // ============================================================================
  // STEP RENDERERS
  // ============================================================================

  const renderStepContent = () => {
    switch (currentStep) {
      case 'basic':
        return <BasicInfoStep characterData={characterData} setCharacterData={setCharacterData} />
      
      case 'physiology':
        return (
          <AIAssistedStep
            title="Physiology"
            subtitle="Define the character's physical traits"
            aiPrompt={aiPrompt}
            setAiPrompt={setAiPrompt}
            aiOptions={aiOptions}
            selectedOption={selectedOption}
            editingContent={editingContent}
            setEditingContent={setEditingContent}
            isGenerating={isGenerating}
            onGenerate={() => handleGenerateAI('physiology')}
            onSelectOption={handleSelectOption}
            onApply={handleApplyOption}
            currentData={characterData.physiology}
            stepType="physiology"
          />
        )
      
      case 'sociology':
        return (
          <AIAssistedStep
            title="Sociology"
            subtitle="Define the character's social background"
            aiPrompt={aiPrompt}
            setAiPrompt={setAiPrompt}
            aiOptions={aiOptions}
            selectedOption={selectedOption}
            editingContent={editingContent}
            setEditingContent={setEditingContent}
            isGenerating={isGenerating}
            onGenerate={() => handleGenerateAI('sociology')}
            onSelectOption={handleSelectOption}
            onApply={handleApplyOption}
            currentData={characterData.sociology}
            stepType="sociology"
          />
        )
      
      case 'psychology':
        return (
          <AIAssistedStep
            title="Psychology"
            subtitle="Define the character's inner life"
            aiPrompt={aiPrompt}
            setAiPrompt={setAiPrompt}
            aiOptions={aiOptions}
            selectedOption={selectedOption}
            editingContent={editingContent}
            setEditingContent={setEditingContent}
            isGenerating={isGenerating}
            onGenerate={() => handleGenerateAI('psychology')}
            onSelectOption={handleSelectOption}
            onApply={handleApplyOption}
            currentData={characterData.psychology}
            stepType="psychology"
          />
        )
      
      case 'backstory':
        return (
          <AIAssistedStep
            title="Backstory & Arc"
            subtitle="Define the character's history and journey"
            aiPrompt={aiPrompt}
            setAiPrompt={setAiPrompt}
            aiOptions={aiOptions}
            selectedOption={selectedOption}
            editingContent={editingContent}
            setEditingContent={setEditingContent}
            isGenerating={isGenerating}
            onGenerate={() => handleGenerateAI('backstory')}
            onSelectOption={handleSelectOption}
            onApply={handleApplyOption}
            currentData={characterData.backstory}
            stepType="backstory"
          />
        )
      
      case 'voice':
        return (
          <AIAssistedStep
            title="Voice Profile"
            subtitle="Define how the character speaks"
            aiPrompt={aiPrompt}
            setAiPrompt={setAiPrompt}
            aiOptions={aiOptions}
            selectedOption={selectedOption}
            editingContent={editingContent}
            setEditingContent={setEditingContent}
            isGenerating={isGenerating}
            onGenerate={() => handleGenerateAI('voiceProfile')}
            onSelectOption={handleSelectOption}
            onApply={handleApplyOption}
            currentData={characterData.voiceProfile}
            stepType="voiceProfile"
          />
        )
      
      case 'review':
        return <ReviewStep characterData={characterData} />
      
      default:
        return null
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl shadow-2xl border border-purple-500/30 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/30">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Create Character</h2>
              <p className="text-sm text-gray-400 mt-1">
                Step {getCurrentStepIndex() + 1} of {steps.length}: {currentStep.charAt(0).toUpperCase() + currentStep.slice(1)}
              </p>
            </div>
            
            {/* YOLO Button - Only show on basic step */}
            {currentStep === 'basic' && (
              <button
                onClick={handleYOLO}
                disabled={isYoloGenerating}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                title="Let AI generate a complete character instantly"
              >
                <Sparkles className="w-4 h-4" />
                {isYoloGenerating ? 'Generating...' : '🎲 YOLO MODE'}
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, idx) => (
              <div key={step} className="flex-1 flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    idx <= getCurrentStepIndex()
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {idx < getCurrentStepIndex() ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-colors ${
                      idx < getCurrentStepIndex() ? 'bg-purple-600' : 'bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-purple-500/30 bg-gray-900/50">
          <button
            onClick={handlePrevious}
            disabled={getCurrentStepIndex() === 0}
            className="px-6 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="text-sm text-gray-400">
            {characterData.name || 'Unnamed Character'}
          </div>

          {currentStep === 'review' ? (
            <button
              onClick={handleComplete}
              disabled={!canProceed()}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Create Character
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="px-6 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// STEP COMPONENTS
// ============================================================================

function BasicInfoStep({
  characterData,
  setCharacterData
}: {
  characterData: CharacterData
  setCharacterData: (data: CharacterData | ((prev: CharacterData) => CharacterData)) => void
}) {
  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-l-4 border-yellow-500 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-300">
            <p className="font-medium text-yellow-300 mb-1">🎯 Two Ways to Create:</p>
            <ul className="space-y-1 text-gray-400">
              <li>• <strong>Step-by-Step:</strong> Fill required fields (*) and use AI assistance at each step</li>
              <li>• <strong>YOLO Mode:</strong> Let AI instantly generate a complete, story-relevant character</li>
            </ul>
            <p className="mt-2 text-xs text-gray-500">⚠️ All fields are required - quality takes time!</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Character Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={characterData.name}
          onChange={e => setCharacterData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter character name..."
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Archetype <span className="text-red-500">*</span>
        </label>
        <select
          value={characterData.archetype}
          onChange={e => setCharacterData(prev => ({ ...prev, archetype: e.target.value }))}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Select archetype...</option>
          <option value="Protagonist">Protagonist</option>
          <option value="Antagonist">Antagonist</option>
          <option value="Mentor">Mentor</option>
          <option value="Ally">Ally</option>
          <option value="Trickster">Trickster</option>
          <option value="Herald">Herald</option>
          <option value="Shapeshifter">Shapeshifter</option>
          <option value="Guardian">Guardian</option>
          <option value="Supporting Character">Supporting Character</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Premise Function <span className="text-red-500">*</span>
        </label>
        <textarea
          value={characterData.premiseFunction}
          onChange={e => setCharacterData(prev => ({ ...prev, premiseFunction: e.target.value }))}
          placeholder="What role does this character play in proving the story's premise?"
          rows={4}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
    </div>
  )
}

function AIAssistedStep({
  title,
  subtitle,
  aiPrompt,
  setAiPrompt,
  aiOptions,
  selectedOption,
  editingContent,
  setEditingContent,
  isGenerating,
  onGenerate,
  onSelectOption,
  onApply,
  currentData,
  stepType
}: any) {
  const hasCurrentData = currentData && (
    typeof currentData === 'string' ? currentData.length > 0 : Object.keys(currentData).length > 0
  )

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-400">{subtitle}</p>
      </div>

      {/* AI Generation Section */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-purple-500/30">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h4 className="text-lg font-semibold text-white">AI Assistant</h4>
        </div>

        <div className="space-y-4">
          <textarea
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            placeholder={`Describe what you want for this character's ${stepType}... (e.g., "A weathered detective in their 50s" or "Someone from a working-class background")`}
            rows={3}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button
            onClick={onGenerate}
            disabled={isGenerating || !aiPrompt.trim()}
            className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating Options...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate 3 Options
              </>
            )}
          </button>
        </div>

        {/* AI Options */}
        {aiOptions.length > 0 && (
          <div className="mt-6 space-y-4">
            <h5 className="text-sm font-medium text-gray-300">Select an option to customize:</h5>
            {aiOptions.map((option: AIOption, idx: number) => (
              <div
                key={option.id}
                onClick={() => onSelectOption(option.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedOption === option.id
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 hover:border-purple-500/50 bg-gray-900/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h6 className="font-semibold text-white">Option {idx + 1}</h6>
                  <span className="text-xs text-purple-400">{option.confidence}% match</span>
                </div>
                <p className="text-sm text-gray-400 mb-2">{option.reasoning}</p>
                <div className="text-xs text-gray-500 font-mono max-h-32 overflow-y-auto">
                  {JSON.stringify(option.content, null, 2)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Editing Section */}
        {editingContent && (
          <div className="mt-6 space-y-4">
            <h5 className="text-sm font-medium text-gray-300">Customize your selection:</h5>
            <textarea
              value={typeof editingContent === 'string' ? editingContent : JSON.stringify(editingContent, null, 2)}
              onChange={e => {
                try {
                  const parsed = JSON.parse(e.target.value)
                  setEditingContent(parsed)
                } catch {
                  setEditingContent(e.target.value)
                }
              }}
              rows={12}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={onApply}
              className="w-full px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Apply to Character
            </button>
          </div>
        )}
      </div>

      {/* Current Data Display */}
      {hasCurrentData && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
          <h5 className="text-sm font-medium text-green-400 mb-2">✓ Current Data:</h5>
          <pre className="text-xs text-gray-300 overflow-x-auto">
            {JSON.stringify(currentData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

function ReviewStep({ characterData }: { characterData: CharacterData }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Review Character</h3>
        <p className="text-sm text-gray-400">Review all details before creating the character</p>
      </div>

      <div className="space-y-4">
        <ReviewSection title="Basic Info">
          <ReviewItem label="Name" value={characterData.name} />
          <ReviewItem label="Archetype" value={characterData.archetype} />
          <ReviewItem label="Premise Function" value={characterData.premiseFunction} />
        </ReviewSection>

        <ReviewSection title="Physiology">
          <ReviewItem label="Age" value={characterData.physiology.age} />
          <ReviewItem label="Gender" value={characterData.physiology.gender} />
          <ReviewItem label="Appearance" value={characterData.physiology.appearance} />
          <ReviewItem label="Build" value={characterData.physiology.build} />
        </ReviewSection>

        <ReviewSection title="Sociology">
          <ReviewItem label="Class" value={characterData.sociology.class} />
          <ReviewItem label="Occupation" value={characterData.sociology.occupation} />
          <ReviewItem label="Education" value={characterData.sociology.education} />
        </ReviewSection>

        <ReviewSection title="Psychology">
          <ReviewItem label="Core Value" value={characterData.psychology.coreValue} />
          <ReviewItem label="Want" value={characterData.psychology.want} />
          <ReviewItem label="Need" value={characterData.psychology.need} />
          <ReviewItem label="Primary Flaw" value={characterData.psychology.primaryFlaw} />
        </ReviewSection>

        <ReviewSection title="Backstory & Arc">
          <ReviewItem label="Backstory" value={characterData.backstory} multiline />
        </ReviewSection>

        <ReviewSection title="Voice Profile">
          <ReviewItem label="Speech Pattern" value={characterData.voiceProfile.speechPattern} />
          <ReviewItem label="Vocabulary" value={characterData.voiceProfile.vocabulary} />
          <ReviewItem label="Quirks" value={characterData.voiceProfile.quirks.join(', ')} />
        </ReviewSection>
      </div>
    </div>
  )
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
      <h4 className="text-lg font-semibold text-purple-400 mb-3">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function ReviewItem({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  if (!value) return null

  return (
    <div>
      <span className="text-sm font-medium text-gray-400">{label}:</span>
      {multiline ? (
        <p className="text-white mt-1">{value}</p>
      ) : (
        <span className="text-white ml-2">{value}</span>
      )}
    </div>
  )
}

