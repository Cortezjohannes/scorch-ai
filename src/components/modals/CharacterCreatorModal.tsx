'use client'

import React, { useState, useEffect } from 'react'
import { X, Loader } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { CharacterComplexity, UnifiedCharacter } from '@/types/unified-character'
import { StoryBible } from '@/services/story-bible-service'
import ModeSelector from '@/components/character-creator/ModeSelector'
import MinimalCharacterForm from '@/components/character-creator/MinimalCharacterForm'
import BalancedCharacterForm from '@/components/character-creator/BalancedCharacterForm'
import DetailedCharacterForm from '@/components/character-creator/DetailedCharacterForm'

interface CharacterCreatorModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (character: UnifiedCharacter) => void
  storyBible: StoryBible
}

type ModalStep = 'mode-selection' | 'form' | 'generating'

export default function CharacterCreatorModal({
  isOpen,
  onClose,
  onComplete,
  storyBible
}: CharacterCreatorModalProps) {

  const { theme } = useTheme()
  const [currentStep, setCurrentStep] = useState<ModalStep>('mode-selection')
  const [selectedMode, setSelectedMode] = useState<CharacterComplexity | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState('')

  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'

  if (!isOpen) return null

  const handleModeSelect = (mode: CharacterComplexity) => {
    setSelectedMode(mode)
  }

  const handleModeNext = () => {
    if (selectedMode) {
      setCurrentStep('form')
    }
  }

  const handleFormBack = () => {
    setCurrentStep('mode-selection')
    setSelectedMode(null)
  }

  const handleGenerateCharacter = async (characterData: Partial<UnifiedCharacter>) => {
    setIsGenerating(true)
    setGenerationProgress('Initializing character creation...')
    setCurrentStep('generating')

    try {
      console.log('🎭 [Client] Starting character generation...', { mode: selectedMode, name: characterData.name })
      
      setGenerationProgress('Analyzing story context...')
      
      // Call the API route for server-side generation
      const response = await fetch('/api/characters/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: selectedMode,
          userInput: characterData,
          storyContext: storyBible,
          options: {
            yoloMode: false,
            aiAssist: true
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Character generation failed')
      }

      const data = await response.json()
      console.log('✅ [Client] Character generated successfully:', data.result.character.name)

      setGenerationProgress('Character created successfully!')
      setTimeout(() => {
        onComplete(data.result.character)
        onClose()
        // Reset state
        setCurrentStep('mode-selection')
        setSelectedMode(null)
        setIsGenerating(false)
        setGenerationProgress('')
      }, 1000)

    } catch (error: any) {
      console.error('❌ [Client] Character generation failed:', error)
      setGenerationProgress(`Failed: ${error.message || 'Please try again'}`)
      setTimeout(() => {
        setCurrentStep('form')
        setIsGenerating(false)
        setGenerationProgress('')
      }, 3000)
    }
  }

  const renderContent = () => {
    switch (currentStep) {
      case 'mode-selection':
        return (
          <ModeSelector
            selectedMode={selectedMode}
            onModeSelect={handleModeSelect}
            onNext={handleModeNext}
          />
        )

      case 'form':
        if (!selectedMode) return null

        switch (selectedMode) {
          case 'minimal':
            return (
              <MinimalCharacterForm
                storyBible={storyBible}
                onGenerate={handleGenerateCharacter}
                onBack={handleFormBack}
                isGenerating={isGenerating}
              />
            )
          case 'balanced':
            return (
              <BalancedCharacterForm
                storyBible={storyBible}
                onGenerate={handleGenerateCharacter}
                onBack={handleFormBack}
                isGenerating={isGenerating}
              />
            )
          case 'detailed':
            return (
              <DetailedCharacterForm
                storyBible={storyBible}
                onGenerate={handleGenerateCharacter}
                onBack={handleFormBack}
                isGenerating={isGenerating}
              />
            )
          default:
            return null
        }

      case 'generating':
        return (
          <div className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="relative">
              <div
                className="w-16 h-16 border-4 rounded-full animate-spin"
                style={{
                  borderColor: `${isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.3)'}`,
                  borderTopColor: '#10B981'
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader className="w-6 h-6" style={{ color: '#10B981' }} />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h3 className={`text-xl font-semibold ${prefix}-text-primary`}>Creating Your Character</h3>
              <p className={`max-w-md ${prefix}-text-secondary`}>
                {generationProgress || 'AI is crafting a story-ready character...'}
              </p>
            </div>

            <div className={`flex items-center gap-2 text-sm ${prefix}-text-secondary`}>
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: '#10B981' }}
              ></div>
              This may take 30 seconds to 2 minutes depending on complexity
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const getModalTitle = () => {
    switch (currentStep) {
      case 'mode-selection':
        return 'Create New Character'
      case 'form':
        return selectedMode ? `Create ${selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)} Character` : 'Create Character'
      case 'generating':
        return 'Generating Character...'
      default:
        return 'Create Character'
    }
  }

  const getModalSubtitle = () => {
    switch (currentStep) {
      case 'mode-selection':
        return 'Choose the right level of detail for your character\'s role'
      case 'form':
        if (selectedMode === 'minimal') return 'Quick character for supporting roles'
        if (selectedMode === 'balanced') return 'Rich character with story integration'
        if (selectedMode === 'detailed') return 'Full psychological depth using Egri\'s model'
        return ''
      case 'generating':
        return 'AI is working its magic...'
      default:
        return ''
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <div
        className={`rounded-xl shadow-2xl border max-w-5xl w-full max-h-[90vh] overflow-hidden ${prefix}-card`}
        style={{
          boxShadow: isDark
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(16, 185, 129, 0.1)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(16, 185, 129, 0.15)'
        }}
      >

        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${prefix}-border`}>
          <div>
            <h2 className={`text-2xl font-bold ${prefix}-text-primary`}>{getModalTitle()}</h2>
            <p className={`text-sm mt-1 ${prefix}-text-secondary`}>{getModalSubtitle()}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${prefix}-btn-ghost disabled:opacity-50 disabled:cursor-not-allowed`}
            style={{
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              color: isDark ? '#E7E7E7' : '#666666'
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {renderContent()}
        </div>

        {/* Footer - Only show on mode selection */}
        {currentStep === 'mode-selection' && (
          <div className={`flex items-center justify-end p-6 border-t ${prefix}-border ${prefix}-bg-secondary`}>
            <div className={`text-sm ${prefix}-text-secondary flex items-center gap-2`}>
              <span style={{ color: '#10B981' }}>⬆️</span>
              Characters can be upgraded later: Minimal → Balanced → Detailed
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
