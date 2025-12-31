'use client'

import React, { useState } from 'react'
import { BookOpen, ArrowLeft, Sparkles } from 'lucide-react'
import { UnifiedCharacter } from '@/types/unified-character'
import { StoryBible } from '@/services/story-bible-service'
import CharacterCreationWizard from '@/components/modals/CharacterCreationWizard'

interface DetailedCharacterFormProps {
  storyBible: StoryBible
  onGenerate: (characterData: Partial<UnifiedCharacter>) => Promise<void>
  onBack: () => void
  isGenerating?: boolean
}

export default function DetailedCharacterForm({
  storyBible,
  onGenerate,
  onBack,
  isGenerating = false
}: DetailedCharacterFormProps) {

  const [showWizard, setShowWizard] = useState(false)

  const handleWizardComplete = (characterData: any) => {
    // Convert the wizard's CharacterData to UnifiedCharacter format
    const unifiedCharacter: Partial<UnifiedCharacter> = {
      name: characterData.name,
      role: characterData.archetype?.toLowerCase().includes('hero') ? 'protagonist' :
            characterData.archetype?.toLowerCase().includes('villain') ? 'antagonist' : 'supporting',
      basic: {
        description: characterData.premiseFunction || '',
        archetype: characterData.archetype,
        premiseFunction: characterData.premiseFunction
      },
      detailed: {
        fullPhysiology: characterData.physiology,
        fullSociology: characterData.sociology,
        fullPsychology: characterData.psychology,
        characterEvolution: [],
        relationships: []
      }
    }

    onGenerate(unifiedCharacter)
  }

  if (showWizard) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowWizard(false)}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors border border-gray-700 rounded-lg hover:border-gray-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Overview
          </button>
          <div className="text-sm text-gray-400">
            Using Enhanced Character Creation Wizard
          </div>
        </div>

        {/* Wizard */}
        <CharacterCreationWizard
          isOpen={true}
          onClose={() => setShowWizard(false)}
          onComplete={handleWizardComplete}
          storyBible={storyBible}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <BookOpen className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Detailed Character Creation</h2>
            <p className="text-gray-400">Full Egri 3D psychological model</p>
          </div>
        </div>
        <p className="text-gray-300 max-w-lg mx-auto">
          Create deeply complex characters using Lajos Egri's three-dimensional character model.
          Perfect for protagonists, antagonists, and characters with significant arcs.
        </p>
      </div>

      {/* Overview */}
      <div className="max-w-4xl mx-auto space-y-6">

        {/* What You'll Get */}
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-orange-300 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            What You'll Create
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <div className="font-medium text-white">Physiology</div>
              <ul className="text-gray-400 space-y-1">
                <li>• Physical appearance</li>
                <li>• Age, build, health</li>
                <li>• Distinctive features</li>
                <li>• Hereditary traits</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-white">Sociology</div>
              <ul className="text-gray-400 space-y-1">
                <li>• Social class & occupation</li>
                <li>• Education & background</li>
                <li>• Economic status</li>
                <li>• Cultural influences</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-white">Psychology</div>
              <ul className="text-gray-400 space-y-1">
                <li>• Want vs Need arc</li>
                <li>• Core values & flaws</li>
                <li>• Personality depth</li>
                <li>• Motivations & fears</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Process Overview */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">7-Step Process</h3>
          <div className="space-y-3">
            {[
              { step: 1, title: 'Basic Info', desc: 'Name, archetype, premise function' },
              { step: 2, title: 'Physiology', desc: 'Physical traits and appearance' },
              { step: 3, title: 'Sociology', desc: 'Social background and environment' },
              { step: 4, title: 'Psychology', desc: 'Inner life and motivations' },
              { step: 5, title: 'Backstory', desc: 'Personal history and development' },
              { step: 6, title: 'Voice', desc: 'Speech patterns and mannerisms' },
              { step: 7, title: 'Review', desc: 'Final review and creation' }
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
                  {item.step}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">{item.title}</div>
                  <div className="text-sm text-gray-400">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Assistance */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI-Powered Assistance
          </h3>
          <div className="space-y-3 text-sm text-gray-300">
            <p>
              At each step, you can request AI assistance to generate options based on your character concept.
              The AI considers your story's genre, tone, and existing characters to create contextually appropriate suggestions.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-800/50 p-3 rounded">
                <div className="font-medium text-white mb-1">Smart Suggestions</div>
                <div className="text-gray-400">AI generates 3 options for each section</div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded">
                <div className="font-medium text-white mb-1">Story Context</div>
                <div className="text-gray-400">Considers genre, tone, and existing cast</div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded">
                <div className="font-medium text-white mb-1">Editable Results</div>
                <div className="text-gray-400">Customize AI suggestions before applying</div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded">
                <div className="font-medium text-white mb-1">YOLO Mode</div>
                <div className="text-gray-400">Let AI generate complete character instantly</div>
              </div>
            </div>
          </div>
        </div>

        {/* Time Estimate */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300">Estimated time: 5-10 minutes</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-700">
          <button
            onClick={onBack}
            className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
          >
            ← Back to mode selection
          </button>

          <button
            onClick={() => setShowWizard(true)}
            className="px-8 py-3 rounded-lg font-semibold bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 transition-all flex items-center gap-2 shadow-lg"
          >
            <BookOpen className="w-4 h-4" />
            Start Detailed Creation
          </button>
        </div>
      </div>

      {/* Help Text */}
      <div className="text-center text-sm text-gray-400 max-w-lg mx-auto">
        <p>
          This is the most comprehensive character creation experience, based on Lajos Egri's
          proven three-dimensional character method. Perfect for characters who drive your story's themes.
        </p>
      </div>
    </div>
  )
}