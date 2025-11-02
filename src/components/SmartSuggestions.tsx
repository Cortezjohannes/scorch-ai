'use client'

import { useState, useEffect } from 'react'
import { Lightbulb, RefreshCw, X, ChevronRight, CheckCircle, XCircle, Info } from 'lucide-react'
import { storySuggestionsEngine, StorySuggestion } from '@/services/story-suggestions-engine'

// ============================================================================
// TYPES
// ============================================================================

interface SmartSuggestionsProps {
  storyBible: any
  episodes: any[]
  onApplySuggestion?: (suggestion: StorySuggestion) => void
  onDismissSuggestion?: (suggestionId: string) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

// ============================================================================
// SMART SUGGESTIONS COMPONENT
// ============================================================================

export default function SmartSuggestions({
  storyBible,
  episodes,
  onApplySuggestion,
  onDismissSuggestion,
  isCollapsed = false,
  onToggleCollapse
}: SmartSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<StorySuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<string>>(new Set())

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (storyBible && !isCollapsed) {
      loadSuggestions()
    }
  }, [storyBible, episodes.length, isCollapsed])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const loadSuggestions = async () => {
    setIsLoading(true)

    try {
      const result = await storySuggestionsEngine.generateSuggestions(storyBible, episodes)
      setSuggestions(result.suggestions)
    } catch (error) {
      console.error('Error loading suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    loadSuggestions()
    setDismissedIds(new Set())
  }

  const handleDismiss = (suggestionId: string) => {
    setDismissedIds(prev => new Set([...prev, suggestionId]))
    if (onDismissSuggestion) {
      onDismissSuggestion(suggestionId)
    }
  }

  const handleApply = (suggestion: StorySuggestion) => {
    if (onApplySuggestion) {
      onApplySuggestion(suggestion)
    }
    handleDismiss(suggestion.id)
  }

  const toggleExpand = (suggestionId: string) => {
    const newExpanded = new Set(expandedSuggestions)
    if (newExpanded.has(suggestionId)) {
      newExpanded.delete(suggestionId)
    } else {
      newExpanded.add(suggestionId)
    }
    setExpandedSuggestions(newExpanded)
  }

  // ============================================================================
  // FILTERING
  // ============================================================================

  const filteredSuggestions = suggestions.filter(s => {
    if (dismissedIds.has(s.id)) return false
    if (selectedCategory === 'all') return true
    return s.category === selectedCategory
  })

  const sortedSuggestions = storySuggestionsEngine.sortByPriority(filteredSuggestions)

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'character':
        return '👤'
      case 'world':
        return '🌍'
      case 'plot':
        return '📖'
      case 'theme':
        return '🎭'
      case 'relationship':
        return '💫'
      default:
        return '💡'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isCollapsed) {
    return (
      <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-40">
        <button
          onClick={onToggleCollapse}
          className="bg-gradient-to-br from-purple-600 to-pink-600 text-white p-4 rounded-l-lg shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
        >
          <Lightbulb className="w-5 h-5" />
          <span className="text-sm font-medium">Suggestions</span>
          {sortedSuggestions.length > 0 && (
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
              {sortedSuggestions.length}
            </span>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="fixed right-0 top-0 bottom-0 w-96 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border-l border-purple-500/30 shadow-2xl z-40 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-purple-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Smart Suggestions</h3>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
              title="Refresh suggestions"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'character', 'world', 'plot', 'theme', 'relationship'].map(category => {
            const count = category === 'all'
              ? sortedSuggestions.length
              : sortedSuggestions.filter(s => s.category === category).length

            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {category === 'all' ? '📋' : getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                {count > 0 && (
                  <span className="ml-1.5 bg-white/20 px-1.5 rounded-full text-xs">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Suggestions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400">Analyzing your story...</p>
          </div>
        ) : sortedSuggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <CheckCircle className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-center">No suggestions at the moment.<br />Your story looks great!</p>
          </div>
        ) : (
          sortedSuggestions.map(suggestion => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              isExpanded={expandedSuggestions.has(suggestion.id)}
              onToggleExpand={() => toggleExpand(suggestion.id)}
              onApply={() => handleApply(suggestion)}
              onDismiss={() => handleDismiss(suggestion.id)}
              getCategoryIcon={getCategoryIcon}
              getPriorityColor={getPriorityColor}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-purple-500/30 bg-gray-900/50">
        <p className="text-xs text-gray-500 text-center">
          AI-powered suggestions to enhance your story
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// SUGGESTION CARD
// ============================================================================

function SuggestionCard({
  suggestion,
  isExpanded,
  onToggleExpand,
  onApply,
  onDismiss,
  getCategoryIcon,
  getPriorityColor
}: {
  suggestion: StorySuggestion
  isExpanded: boolean
  onToggleExpand: () => void
  onApply: () => void
  onDismiss: () => void
  getCategoryIcon: (category: string) => string
  getPriorityColor: (priority: string) => string
}) {
  return (
    <div className={`bg-gray-800/50 rounded-lg border-2 transition-all ${
      isExpanded ? 'border-purple-500' : 'border-gray-700'
    }`}>
      {/* Header */}
      <div
        onClick={onToggleExpand}
        className="p-3 cursor-pointer hover:bg-gray-800/80 transition-colors rounded-t-lg"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">{getCategoryIcon(suggestion.category)}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-semibold text-white text-sm line-clamp-2">{suggestion.title}</h4>
              <ChevronRight className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${
                isExpanded ? 'rotate-90' : ''
              }`} />
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(suggestion.priority)}`}>
                {suggestion.priority}
              </span>
              <span className="text-xs text-gray-400">{suggestion.category}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-gray-700">
          <div className="pt-3">
            <p className="text-sm text-gray-300">{suggestion.description}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <Info className="w-3 h-3" />
              <span>Why this matters:</span>
            </div>
            <p className="text-xs text-gray-400 pl-5">{suggestion.reasoning}</p>
          </div>

          {suggestion.suggestedAction && (
            <div>
              <div className="text-xs font-medium text-purple-400 mb-1">Suggested Action:</div>
              <p className="text-xs text-gray-300 pl-3 border-l-2 border-purple-500">{suggestion.suggestedAction}</p>
            </div>
          )}

          {suggestion.relatedContent && suggestion.relatedContent.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-400 mb-1">Related:</div>
              <div className="flex flex-wrap gap-1">
                {suggestion.relatedContent.map((item, idx) => (
                  <span key={idx} className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {suggestion.actionable && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onApply()
                }}
                className="flex-1 px-3 py-1.5 rounded bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all text-sm font-medium"
              >
                Apply
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDismiss()
                }}
                className="px-3 py-1.5 rounded bg-gray-700 text-white hover:bg-gray-600 transition-colors text-sm"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

