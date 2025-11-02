'use client'

import { useState } from 'react'
import { X, Sparkles, Check, Edit2 } from 'lucide-react'
import { aiPromptAssistant, AIOption } from '@/services/ai-prompt-assistant'

// ============================================================================
// TYPES
// ============================================================================

interface AIEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (content: any) => void
  title: string
  subtitle?: string
  editType: 'worldBuilding' | 'storyArc' | 'dialogue' | 'rules'
  currentContent?: any
  context?: any // storyBible or character data
}

// ============================================================================
// AI EDIT MODAL
// ============================================================================

export default function AIEditModal({
  isOpen,
  onClose,
  onSave,
  title,
  subtitle,
  editType,
  currentContent,
  context
}: AIEditModalProps) {
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiOptions, setAiOptions] = useState<AIOption[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState<any>(currentContent || '')
  const [isGenerating, setIsGenerating] = useState(false)

  if (!isOpen) return null

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) {
      alert('Please enter a description or request for the AI')
      return
    }

    setIsGenerating(true)
    setAiOptions([])
    setSelectedOption(null)

    try {
      let result

      switch (editType) {
        case 'worldBuilding':
          result = await aiPromptAssistant.generateWorldBuildingElement(
            {
              seriesTitle: context?.seriesTitle,
              genre: context?.genre,
              theme: context?.theme,
              existingWorld: context?.worldBuilding
            },
            'setting',
            aiPrompt
          )
          break

        case 'storyArc':
          result = await aiPromptAssistant.generateStoryArc(
            {
              storyBible: context,
              existingArcs: context?.narrativeArcs || []
            },
            aiPrompt,
            context?.narrativeArcs || []
          )
          break

        case 'dialogue':
          result = await aiPromptAssistant.enrichDialogueProfile(
            context, // character data
            aiPrompt
          )
          break

        case 'rules':
          result = await aiPromptAssistant.expandWorldRules(
            context?.worldBuilding || {},
            aiPrompt
          )
          break

        default:
          throw new Error(`Unknown edit type: ${editType}`)
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

  const handleSave = () => {
    onSave(editingContent)
    onClose()
    
    // Reset state
    setAiPrompt('')
    setAiOptions([])
    setSelectedOption(null)
    setEditingContent(currentContent || '')
  }

  const handleManualEdit = () => {
    setEditingContent(currentContent || '')
    setAiOptions([])
    setSelectedOption(null)
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  const getPlaceholder = () => {
    switch (editType) {
      case 'worldBuilding':
        return 'Describe the world element you want to create... (e.g., "A dystopian megacity with flying cars")'
      case 'storyArc':
        return 'Describe the story arc you want to create... (e.g., "A redemption arc for the antagonist")'
      case 'dialogue':
        return 'Describe the voice you want... (e.g., "Formal and eloquent" or "Street-smart and sarcastic")'
      case 'rules':
        return 'Describe the rules you want to add... (e.g., "Magic requires sacrifice" or "Technology is banned")'
      default:
        return 'Describe what you want...'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl shadow-2xl border border-purple-500/30 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/30">
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* AI Generation Section */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
            </div>

            <div className="space-y-4">
              <textarea
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder={getPlaceholder()}
                rows={3}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
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

                <button
                  onClick={handleManualEdit}
                  className="px-6 py-3 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Manual Edit
                </button>
              </div>
            </div>

            {/* AI Options */}
            {aiOptions.length > 0 && (
              <div className="mt-6 space-y-4">
                <h4 className="text-sm font-medium text-gray-300">Select an option to customize:</h4>
                {aiOptions.map((option, idx) => (
                  <div
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedOption === option.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-700 hover:border-purple-500/50 bg-gray-900/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-semibold text-white">Option {idx + 1}</h5>
                      <span className="text-xs text-purple-400">{option.confidence}% match</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{option.reasoning}</p>
                    <div className="bg-gray-900 rounded p-3 text-sm text-gray-300 max-h-48 overflow-y-auto">
                      {typeof option.content === 'string' ? (
                        <p>{option.content}</p>
                      ) : (
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {JSON.stringify(option.content, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Editing Section */}
          {editingContent && (
            <div className="bg-gray-800/50 rounded-lg p-6 border border-green-500/30">
              <div className="flex items-center gap-2 mb-4">
                <Edit2 className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Edit Content</h3>
              </div>

              {typeof editingContent === 'string' ? (
                <textarea
                  value={editingContent}
                  onChange={e => setEditingContent(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              ) : (
                <textarea
                  value={JSON.stringify(editingContent, null, 2)}
                  onChange={e => {
                    try {
                      const parsed = JSON.parse(e.target.value)
                      setEditingContent(parsed)
                    } catch {
                      // Keep as string if invalid JSON
                      setEditingContent(e.target.value)
                    }
                  }}
                  rows={12}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              )}
            </div>
          )}

          {/* Current Content Display */}
          {currentContent && !editingContent && (
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Current Content:</h4>
              {typeof currentContent === 'string' ? (
                <p className="text-gray-300">{currentContent}</p>
              ) : (
                <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
                  {JSON.stringify(currentContent, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-purple-500/30 bg-gray-900/50">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!editingContent}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}


