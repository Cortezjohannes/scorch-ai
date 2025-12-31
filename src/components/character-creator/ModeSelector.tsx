'use client'

import React from 'react'
import { Clock, Zap, Star, Users, BookOpen, Target } from 'lucide-react'
import { CharacterComplexity, CharacterModeInfo } from '@/types/unified-character'

interface ModeSelectorProps {
  selectedMode: CharacterComplexity | null
  onModeSelect: (mode: CharacterComplexity) => void
  onNext: () => void
}

// Mode information for display
const modeInfo: Record<CharacterComplexity, CharacterModeInfo> = {
  minimal: {
    id: 'minimal',
    title: 'Minimal',
    subtitle: 'Speed Mode',
    description: 'Quick supporting characters and background roles',
    timeEstimate: '30 seconds',
    useCase: 'Supporting characters, extras, rapid prototyping',
    example: 'A mysterious bartender, a loyal assistant, a street vendor',
    fields: ['Name', 'Role', 'One-line description']
  },
  balanced: {
    id: 'balanced',
    title: 'Balanced',
    subtitle: 'Recommended',
    description: 'Rich characters with depth and story integration',
    timeEstimate: '2-3 minutes',
    recommended: true,
    useCase: 'Main characters, recurring roles, story-relevant characters',
    example: 'A detective with a haunted past, a scientist with moral dilemmas',
    fields: ['Name', 'Role', 'Archetype', 'Core trait/flaw', 'Physical description', 'Key motivation']
  },
  detailed: {
    id: 'detailed',
    title: 'Detailed',
    subtitle: 'Deep Dive',
    description: 'Full psychological complexity using Egri\'s 3D model',
    timeEstimate: '5-10 minutes',
    useCase: 'Protagonists, antagonists, complex character arcs',
    example: 'A hero with layered motivations, a villain with redeeming qualities',
    fields: ['Complete 7-step wizard', 'Full Egri model', 'Character evolution', 'Relationships']
  }
}

export default function ModeSelector({ selectedMode, onModeSelect, onNext }: ModeSelectorProps) {

  const getModeIcon = (mode: CharacterComplexity) => {
    switch (mode) {
      case 'minimal':
        return <Zap className="w-6 h-6" />
      case 'balanced':
        return <Target className="w-6 h-6" />
      case 'detailed':
        return <BookOpen className="w-6 h-6" />
    }
  }

  const getModeColor = (mode: CharacterComplexity) => {
    switch (mode) {
      case 'minimal':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          icon: 'text-emerald-400',
          title: 'text-emerald-300'
        }
      case 'balanced':
        return {
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/30',
          icon: 'text-purple-400',
          title: 'text-purple-300'
        }
      case 'detailed':
        return {
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/30',
          icon: 'text-orange-400',
          title: 'text-orange-300'
        }
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Choose Creation Mode</h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Select the level of detail that fits your character's role in the story.
          You can always upgrade characters later.
        </p>
      </div>

      {/* Mode Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {Object.values(modeInfo).map((mode) => {
          const colors = getModeColor(mode.id)
          const isSelected = selectedMode === mode.id

  return (
    <div
              key={mode.id}
              onClick={() => onModeSelect(mode.id)}
              className={`
                relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300
                ${colors.bg} ${colors.border}
                ${isSelected
                  ? 'ring-2 ring-white/50 scale-105 shadow-2xl'
                  : 'hover:scale-102 hover:shadow-lg'
                }
              `}
    >
      {/* Recommended Badge */}
      {mode.recommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Recommended
          </div>
        </div>
      )}

      {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${colors.icon}`}>
                  {getModeIcon(mode.id)}
          </div>
          <div>
                  <h3 className={`text-xl font-bold ${colors.title}`}>
                    {mode.title}
                  </h3>
            <p className="text-sm text-gray-400">{mode.subtitle}</p>
          </div>
      </div>

      {/* Time Estimate */}
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-300">{mode.timeEstimate}</span>
      </div>

      {/* Description */}
              <p className="text-gray-300 mb-4 leading-relaxed">
        {mode.description}
      </p>

              {/* Use Case */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-300">Best for:</span>
                </div>
                <p className="text-sm text-gray-400">{mode.useCase}</p>
              </div>

              {/* Example */}
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-300 mb-1">Examples:</div>
                <p className="text-sm text-gray-400 italic">{mode.example}</p>
          </div>

              {/* Fields Required */}
              <div>
                <div className="text-sm font-medium text-gray-300 mb-2">You'll provide:</div>
                <div className="flex flex-wrap gap-1">
                  {mode.fields.map((field) => (
                    <span
                      key={field}
                      className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-md"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-purple-600 rounded-full" />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
      <button
          onClick={onNext}
          disabled={!selectedMode}
          className={`
            px-8 py-3 rounded-lg font-semibold transition-all flex items-center gap-3
            ${selectedMode
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {selectedMode ? (
            <>
              Continue with {modeInfo[selectedMode].title} Mode
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </>
          ) : (
            'Select a mode to continue'
          )}
      </button>
      </div>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-sm text-gray-400">
          Not sure which to choose? Start with <strong className="text-purple-400">Balanced</strong> for most characters.
          You can always add more detail later.
          </p>
        </div>
    </div>
  )
}