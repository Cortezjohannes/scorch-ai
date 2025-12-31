'use client'

import React, { useState } from 'react'
import { X, ArrowUp, Sparkles, Clock, Star } from 'lucide-react'
import { CharacterComplexity, UnifiedCharacter, CharacterUpgradeDirection } from '@/types/unified-character'
import { StoryBible } from '@/services/story-bible-service'
import { characterCreatorUnified } from '@/services/character-creator-unified'

interface CharacterUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (upgradedCharacter: UnifiedCharacter) => void
  character: any // Old format character
  storyBible: StoryBible
}

const upgradeOptions: Record<CharacterComplexity, {
  from: CharacterComplexity
  to: CharacterComplexity
  title: string
  description: string
  benefits: string[]
  timeEstimate: string
  aiEffort: string
}[]> = {
  minimal: [{
    from: 'minimal',
    to: 'balanced',
    title: 'Upgrade to Balanced',
    description: 'Add psychological depth and story integration',
    benefits: [
      'Want vs Need character arc',
      'Detailed psychology and motivations',
      'Physical appearance description',
      'Backstory and voice profile',
      'Better AI image generation'
    ],
    timeEstimate: '30 seconds',
    aiEffort: 'AI fills gaps intelligently'
  }],
  balanced: [{
    from: 'balanced',
    to: 'detailed',
    title: 'Upgrade to Detailed',
    description: 'Full Egri 3D character model with complete depth',
    benefits: [
      'Complete physiology (Egri model)',
      'Full sociology and background',
      'Enhanced psychology with enneagram',
      'Character evolution tracking',
      'Relationship mapping',
      'Most detailed AI assistance'
    ],
    timeEstimate: '2-3 minutes',
    aiEffort: 'AI generates comprehensive model'
  }],
  detailed: [] // No upgrades available
}

export default function CharacterUpgradeModal({
  isOpen,
  onClose,
  onComplete,
  character,
  storyBible
}: CharacterUpgradeModalProps) {

  const [isUpgrading, setIsUpgrading] = useState(false)
  const [upgradeProgress, setUpgradeProgress] = useState('')
  const [selectedUpgrade, setSelectedUpgrade] = useState<CharacterUpgradeDirection | null>(null)

  if (!isOpen || !character) return null

  // Determine current complexity level
  const currentComplexity: CharacterComplexity = character.complexity || 'minimal'

  // Get available upgrades
  const availableUpgrades = upgradeOptions[currentComplexity] || []

  const handleUpgrade = async (upgradeDirection: CharacterUpgradeDirection) => {
    setIsUpgrading(true)
    setUpgradeProgress('Analyzing current character...')
    setSelectedUpgrade(upgradeDirection)

    try {
      // Convert old format to unified format
      const unifiedCharacter = convertOldToUnified(character)

      // Generate upgrade
      const upgradeResult = await characterCreatorUnified.upgradeCharacter(
        unifiedCharacter,
        upgradeDirection,
        storyBible
      )

      setUpgradeProgress('Upgrade complete!')

      setTimeout(() => {
        onComplete(upgradeResult.character)
        onClose()
        setIsUpgrading(false)
        setUpgradeProgress('')
        setSelectedUpgrade(null)
      }, 1000)

    } catch (error) {
      console.error('Character upgrade failed:', error)
      setUpgradeProgress('Upgrade failed. Please try again.')
      setTimeout(() => {
        setIsUpgrading(false)
        setUpgradeProgress('')
        setSelectedUpgrade(null)
      }, 2000)
    }
  }

  const convertOldToUnified = (oldChar: any): UnifiedCharacter => {
    return {
      id: oldChar.id || `char_${Date.now()}`,
      name: oldChar.name,
      role: oldChar.archetype?.toLowerCase().includes('hero') ? 'protagonist' :
            oldChar.archetype?.toLowerCase().includes('villain') ? 'antagonist' : 'supporting',
      complexity: oldChar.complexity || 'minimal',
      basic: {
        description: oldChar.description || '',
        archetype: oldChar.archetype,
        premiseFunction: oldChar.premiseFunction
      },
      createdAt: oldChar.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aiGenerated: oldChar.aiGenerated || false,
      lastEditedBy: 'user'
    }
  }

  const getComplexityColor = (complexity: CharacterComplexity) => {
    switch (complexity) {
      case 'minimal': return 'text-emerald-400 bg-emerald-500/20'
      case 'balanced': return 'text-purple-400 bg-purple-500/20'
      case 'detailed': return 'text-orange-400 bg-orange-500/20'
    }
  }

  const getComplexityIcon = (complexity: CharacterComplexity) => {
    switch (complexity) {
      case 'minimal': return <Sparkles className="w-5 h-5" />
      case 'balanced': return <Star className="w-5 h-5" />
      case 'detailed': return <ArrowUp className="w-5 h-5" />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl shadow-2xl border border-purple-500/30 max-w-4xl w-full max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/30">
          <div>
            <h2 className="text-2xl font-bold text-white">Upgrade Character</h2>
            <p className="text-sm text-gray-400 mt-1">
              Add more depth to {character.name}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isUpgrading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isUpgrading ? (
            // Upgrade Progress
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <ArrowUp className="w-6 h-6 text-purple-400" />
                </div>
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-white">Upgrading Character</h3>
                <p className="text-gray-400 max-w-md">
                  {upgradeProgress || 'AI is enhancing your character...'}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                This may take 30 seconds to 2 minutes depending on upgrade complexity
              </div>
            </div>
          ) : (
            // Upgrade Options
            <div className="space-y-8">
              {/* Current Character Info */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${getComplexityColor(currentComplexity)}`}>
                    {getComplexityIcon(currentComplexity)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{character.name}</h3>
                    <p className="text-sm text-gray-400">
                      Current: {currentComplexity.charAt(0).toUpperCase() + currentComplexity.slice(1)} Mode
                    </p>
                  </div>
                </div>

                <div className="text-sm text-gray-300">
                  <p><strong>Role:</strong> {character.archetype || 'Not specified'}</p>
                  {character.description && (
                    <p><strong>Description:</strong> {character.description}</p>
                  )}
                </div>
              </div>

              {/* Available Upgrades */}
              {availableUpgrades.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Available Upgrades</h3>

                  {availableUpgrades.map((upgrade) => (
                    <div
                      key={`${upgrade.from}-to-${upgrade.to}`}
                      className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white mb-2">{upgrade.title}</h4>
                          <p className="text-gray-300 mb-3">{upgrade.description}</p>

                          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {upgrade.timeEstimate}
                            </div>
                            <div className="flex items-center gap-1">
                              <Sparkles className="w-4 h-4" />
                              {upgrade.aiEffort}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Benefits */}
                      <div className="mb-6">
                        <h5 className="text-sm font-medium text-purple-300 mb-2">What You'll Get:</h5>
                        <ul className="space-y-1">
                          {upgrade.benefits.map((benefit, index) => (
                            <li key={index} className="text-sm text-gray-300 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Upgrade Button */}
                      <button
                        onClick={() => handleUpgrade(`${upgrade.from}-to-${upgrade.to}` as CharacterUpgradeDirection)}
                        className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 font-medium"
                      >
                        <ArrowUp className="w-4 h-4" />
                        Upgrade to {upgrade.to.charAt(0).toUpperCase() + upgrade.to.slice(1)} Mode
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                // No upgrades available
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">✨</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Fully Upgraded!</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    This character is already at the highest complexity level (Detailed Mode).
                    It has full Egri 3D character depth and comprehensive AI assistance.
                  </p>
                </div>
              )}

              {/* Help Text */}
              <div className="text-center text-sm text-gray-400">
                <p>
                  Upgrades are one-way but add significant value. Characters maintain all existing data while gaining new depth.
                  You can always edit upgraded characters to customize the AI-generated content.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}