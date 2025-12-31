'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, User, Tag, FileText, Wand2 } from 'lucide-react'
import { CharacterRole, UnifiedCharacter } from '@/types/unified-character'
import { StoryBible } from '@/services/story-bible-service'

interface MinimalCharacterFormProps {
  storyBible: StoryBible
  onGenerate: (characterData: Partial<UnifiedCharacter>) => Promise<void>
  onBack: () => void
  isGenerating?: boolean
}

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

export default function MinimalCharacterForm({
  storyBible,
  onGenerate,
  onBack,
  isGenerating = false
}: MinimalCharacterFormProps) {

  const [characterData, setCharacterData] = useState({
    name: '',
    role: '' as CharacterRole | '',
    description: ''
  })

  const [aiSuggestion, setAiSuggestion] = useState('')
  const [showAISuggestions, setShowAISuggestions] = useState(false)

  // Generate AI suggestion when role changes
  useEffect(() => {
    if (characterData.role && characterData.name) {
      generateAISuggestion()
    }
  }, [characterData.role, characterData.name])

  const generateAISuggestion = async () => {
    if (!characterData.role || !characterData.name) return

    try {
      // Simple AI suggestion for description
      const suggestion = `${characterData.name} is a ${characterData.role} who ${getRoleDescription(characterData.role)}.`

      setAiSuggestion(suggestion)
      setShowAISuggestions(true)
    } catch (error) {
      console.warn('AI suggestion failed:', error)
    }
  }

  const getRoleDescription = (role: CharacterRole): string => {
    const descriptions: Record<CharacterRole, string> = {
      protagonist: 'drives the main story forward with determination and courage',
      antagonist: 'stands in opposition to the main goals, creating conflict',
      ally: 'provides crucial support and assistance to the main characters',
      mentor: 'offers wisdom, guidance, and life lessons to others',
      'love-interest': 'shares a deep romantic connection with another character',
      rival: 'competes with others, pushing them to grow and improve',
      family: 'shares blood ties and complex familial relationships',
      friend: 'provides loyalty, companionship, and emotional support',
      'authority-figure': 'holds power and makes important decisions',
      'comic-relief': 'lightens tense moments with humor and levity',
      wildcard: 'introduces unpredictability and surprises to the story',
      ensemble: 'contributes to group dynamics and collective goals',
      catalyst: 'triggers significant changes in other characters\' lives',
      mirror: 'reflects the qualities and flaws of other characters',
      threshold: 'guards important transitions and tests character readiness',
      'secondary-antagonist': 'provides additional conflict and opposition'
    }

    return descriptions[role] || 'plays an important role in the story'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!characterData.name.trim() || !characterData.role) {
      alert('Please fill in at least a name and role')
      return
    }

    const finalDescription = characterData.description.trim() || aiSuggestion || `${characterData.name} is a ${characterData.role} character.`

    await onGenerate({
      name: characterData.name.trim(),
      role: characterData.role as CharacterRole,
      basic: {
        description: finalDescription
      }
    })
  }

  const canProceed = characterData.name.trim().length > 0 && characterData.role

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Create Minimal Character</h2>
            <p className="text-gray-400">Quick character for supporting roles</p>
          </div>
        </div>
        <p className="text-gray-300 max-w-lg mx-auto">
          Perfect for background characters, supporting roles, and rapid prototyping.
          Just provide the essentials and let AI fill in the rest.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">

        {/* Name Field */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <User className="w-4 h-4" />
            Character Name *
          </label>
          <input
            type="text"
            value={characterData.name}
            onChange={(e) => setCharacterData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter character name..."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            disabled={isGenerating}
          />
        </div>

        {/* Role Field */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Tag className="w-4 h-4" />
            Character Role *
          </label>
          <select
            value={characterData.role}
            onChange={(e) => setCharacterData(prev => ({ ...prev, role: e.target.value as CharacterRole }))}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            disabled={isGenerating}
          >
            <option value="">Select a role...</option>
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {characterData.role && (
            <p className="text-sm text-gray-400">
              {roleOptions.find(r => r.value === characterData.role)?.description}
            </p>
          )}
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <FileText className="w-4 h-4" />
            Description (Optional)
          </label>
          <textarea
            value={characterData.description}
            onChange={(e) => setCharacterData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Brief description of who this character is..."
            rows={3}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            disabled={isGenerating}
          />

          {/* AI Suggestion */}
          {showAISuggestions && aiSuggestion && !characterData.description.trim() && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Wand2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-300 mb-2">AI Suggestion:</p>
                  <p className="text-sm text-gray-300 italic mb-3">{aiSuggestion}</p>
                  <button
                    type="button"
                    onClick={() => setCharacterData(prev => ({ ...prev, description: aiSuggestion }))}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded transition-colors"
                  >
                    Use this suggestion
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        {canProceed && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Preview:</h4>
            <div className="text-white">
              <strong>{characterData.name || 'Unnamed'}</strong> - {characterData.role ? roleOptions.find(r => r.value === characterData.role)?.label : 'No role'}
              {characterData.description && (
                <p className="text-gray-400 text-sm mt-1">{characterData.description}</p>
              )}
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
                ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 shadow-lg'
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
                <Sparkles className="w-4 h-4" />
                Create Character
              </>
            )}
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="text-center text-sm text-gray-400 max-w-lg mx-auto">
        <p>
          This creates a lightweight character that integrates with your story.
          You can add more detail later by upgrading to balanced or detailed mode.
        </p>
      </div>
    </div>
  )
}