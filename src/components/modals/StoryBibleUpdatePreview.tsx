'use client'

import { useState } from 'react'
import { X, Check, Edit2, Trash2, Eye, MapPin, Users, Book, Calendar, Heart, AlertTriangle } from 'lucide-react'
import { EpisodeReflectionData } from '@/services/episode-reflection-service'

// ============================================================================
// TYPES
// ============================================================================

interface StoryBibleUpdatePreviewProps {
  isOpen: boolean
  onClose: () => void
  onApply: (selectedUpdates: SelectedUpdates) => void
  reflectionData: EpisodeReflectionData
  storyBible: any
}

type TabType = 'characters' | 'locations' | 'developments' | 'world' | 'timeline' | 'relationships'

interface SelectedUpdates {
  newCharacters: any[]
  newLocations: any[]
  characterDevelopments: any[]
  worldBuildingReveals: any[]
  timelineEvents: any[]
  relationshipChanges: any[]
}

// ============================================================================
// STORY BIBLE UPDATE PREVIEW MODAL
// ============================================================================

export default function StoryBibleUpdatePreview({
  isOpen,
  onClose,
  onApply,
  reflectionData,
  storyBible
}: StoryBibleUpdatePreviewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('characters')
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({})
  const [editingItem, setEditingItem] = useState<{ type: string; index: number; data: any } | null>(null)

  if (!isOpen) return null

  // Initialize all items as selected
  const initializeSelections = () => {
    const selections: Record<string, boolean> = {}
    
    reflectionData.newCharacters.forEach((_, idx) => {
      selections[`character-${idx}`] = true
    })
    reflectionData.newLocations.forEach((_, idx) => {
      selections[`location-${idx}`] = true
    })
    reflectionData.characterDevelopments.forEach((_, idx) => {
      selections[`development-${idx}`] = true
    })
    reflectionData.worldBuildingReveals.forEach((_, idx) => {
      selections[`world-${idx}`] = true
    })
    reflectionData.timelineEvents.forEach((_, idx) => {
      selections[`timeline-${idx}`] = true
    })
    reflectionData.relationshipChanges.forEach((_, idx) => {
      selections[`relationship-${idx}`] = true
    })
    
    return selections
  }

  // Initialize selections on mount
  if (Object.keys(selectedItems).length === 0) {
    const initialSelections = initializeSelections()
    setSelectedItems(initialSelections)
  }

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const toggleItem = (key: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const toggleAll = (type: string) => {
    const items = getItemsByType(type)
    const allSelected = items.every((_, idx) => selectedItems[`${type}-${idx}`])
    
    const newSelections = { ...selectedItems }
    items.forEach((_, idx) => {
      newSelections[`${type}-${idx}`] = !allSelected
    })
    
    setSelectedItems(newSelections)
  }

  const getItemsByType = (type: string) => {
    switch (type) {
      case 'character':
        return reflectionData.newCharacters
      case 'location':
        return reflectionData.newLocations
      case 'development':
        return reflectionData.characterDevelopments
      case 'world':
        return reflectionData.worldBuildingReveals
      case 'timeline':
        return reflectionData.timelineEvents
      case 'relationship':
        return reflectionData.relationshipChanges
      default:
        return []
    }
  }

  const handleApply = () => {
    const selectedUpdates: SelectedUpdates = {
      newCharacters: reflectionData.newCharacters.filter((_, idx) => selectedItems[`character-${idx}`]),
      newLocations: reflectionData.newLocations.filter((_, idx) => selectedItems[`location-${idx}`]),
      characterDevelopments: reflectionData.characterDevelopments.filter((_, idx) => selectedItems[`development-${idx}`]),
      worldBuildingReveals: reflectionData.worldBuildingReveals.filter((_, idx) => selectedItems[`world-${idx}`]),
      timelineEvents: reflectionData.timelineEvents.filter((_, idx) => selectedItems[`timeline-${idx}`]),
      relationshipChanges: reflectionData.relationshipChanges.filter((_, idx) => selectedItems[`relationship-${idx}`])
    }

    onApply(selectedUpdates)
    onClose()
  }

  const getTotalSelectedCount = () => {
    return Object.values(selectedItems).filter(Boolean).length
  }

  const getTotalItemsCount = () => {
    return (
      reflectionData.newCharacters.length +
      reflectionData.newLocations.length +
      reflectionData.characterDevelopments.length +
      reflectionData.worldBuildingReveals.length +
      reflectionData.timelineEvents.length +
      reflectionData.relationshipChanges.length
    )
  }

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderTabContent = () => {
    switch (activeTab) {
      case 'characters':
        return renderCharacters()
      case 'locations':
        return renderLocations()
      case 'developments':
        return renderDevelopments()
      case 'world':
        return renderWorldBuilding()
      case 'timeline':
        return renderTimeline()
      case 'relationships':
        return renderRelationships()
      default:
        return null
    }
  }

  const renderCharacters = () => {
    if (reflectionData.newCharacters.length === 0) {
      return <EmptyState message="No new characters detected in this episode" />
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">New Characters ({reflectionData.newCharacters.length})</h3>
          <button
            onClick={() => toggleAll('character')}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Toggle All
          </button>
        </div>

        {reflectionData.newCharacters.map((character, idx) => (
          <SelectableItem
            key={`character-${idx}`}
            isSelected={selectedItems[`character-${idx}`]}
            onToggle={() => toggleItem(`character-${idx}`)}
            icon={<Users className="w-5 h-5 text-blue-400" />}
            title={character.name}
            subtitle={character.role}
            description={character.description}
            badge={`Episode ${character.firstAppearance.episodeNumber}`}
            metadata={[
              { label: 'Context', value: character.firstAppearance.context },
              { label: 'Updates Tab', value: 'Characters' }
            ]}
          />
        ))}
      </div>
    )
  }

  const renderLocations = () => {
    if (reflectionData.newLocations.length === 0) {
      return <EmptyState message="No new locations detected in this episode" />
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">New Locations ({reflectionData.newLocations.length})</h3>
          <button
            onClick={() => toggleAll('location')}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Toggle All
          </button>
        </div>

        {reflectionData.newLocations.map((location, idx) => (
          <SelectableItem
            key={`location-${idx}`}
            isSelected={selectedItems[`location-${idx}`]}
            onToggle={() => toggleItem(`location-${idx}`)}
            icon={<MapPin className="w-5 h-5 text-green-400" />}
            title={location.name}
            subtitle={location.type}
            description={location.description}
            badge={`Episode ${location.firstMentioned.episodeNumber}`}
            metadata={[
              { label: 'Significance', value: location.significance },
              { label: 'Updates Tab', value: 'World Building' }
            ]}
          />
        ))}
      </div>
    )
  }

  const renderDevelopments = () => {
    if (reflectionData.characterDevelopments.length === 0) {
      return <EmptyState message="No character developments detected in this episode" />
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Character Developments ({reflectionData.characterDevelopments.length})</h3>
          <button
            onClick={() => toggleAll('development')}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Toggle All
          </button>
        </div>

        {reflectionData.characterDevelopments.map((dev, idx) => (
          <SelectableItem
            key={`development-${idx}`}
            isSelected={selectedItems[`development-${idx}`]}
            onToggle={() => toggleItem(`development-${idx}`)}
            icon={<Users className="w-5 h-5 text-yellow-400" />}
            title={dev.characterName}
            subtitle={dev.developmentType}
            description={dev.description}
            badge={`Significance: ${dev.significance}/10`}
            metadata={[
              { label: 'Emotional Impact', value: dev.emotionalImpact },
              { label: 'Updates Tab', value: 'Characters (Arc)' }
            ]}
          />
        ))}
      </div>
    )
  }

  const renderWorldBuilding = () => {
    if (reflectionData.worldBuildingReveals.length === 0) {
      return <EmptyState message="No world-building reveals detected in this episode" />
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">World Building Reveals ({reflectionData.worldBuildingReveals.length})</h3>
          <button
            onClick={() => toggleAll('world')}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Toggle All
          </button>
        </div>

        {reflectionData.worldBuildingReveals.map((reveal, idx) => (
          <SelectableItem
            key={`world-${idx}`}
            isSelected={selectedItems[`world-${idx}`]}
            onToggle={() => toggleItem(`world-${idx}`)}
            icon={<Book className="w-5 h-5 text-purple-400" />}
            title={reveal.title}
            subtitle={reveal.category}
            description={reveal.description}
            badge={`Significance: ${reveal.significance}/10`}
            metadata={[
              { label: 'Implications', value: reveal.implications },
              { label: 'Updates Tab', value: 'World Building' }
            ]}
          />
        ))}
      </div>
    )
  }

  const renderTimeline = () => {
    if (reflectionData.timelineEvents.length === 0) {
      return <EmptyState message="No timeline events detected in this episode" />
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Timeline Events ({reflectionData.timelineEvents.length})</h3>
          <button
            onClick={() => toggleAll('timeline')}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Toggle All
          </button>
        </div>

        {reflectionData.timelineEvents.map((event, idx) => (
          <SelectableItem
            key={`timeline-${idx}`}
            isSelected={selectedItems[`timeline-${idx}`]}
            onToggle={() => toggleItem(`timeline-${idx}`)}
            icon={<Calendar className="w-5 h-5 text-pink-400" />}
            title={event.title}
            subtitle={event.type.replace(/_/g, ' ')}
            description={event.description}
            badge={`Significance: ${event.significance}/10`}
            metadata={[
              { label: 'Characters', value: event.relatedCharacters.join(', ') || 'None' },
              { label: 'Locations', value: event.relatedLocations.join(', ') || 'None' },
              { label: 'Updates Tab', value: 'Timeline' }
            ]}
          />
        ))}
      </div>
    )
  }

  const renderRelationships = () => {
    if (reflectionData.relationshipChanges.length === 0) {
      return <EmptyState message="No relationship changes detected in this episode" />
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Relationship Changes ({reflectionData.relationshipChanges.length})</h3>
          <button
            onClick={() => toggleAll('relationship')}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Toggle All
          </button>
        </div>

        {reflectionData.relationshipChanges.map((rel, idx) => (
          <SelectableItem
            key={`relationship-${idx}`}
            isSelected={selectedItems[`relationship-${idx}`]}
            onToggle={() => toggleItem(`relationship-${idx}`)}
            icon={<Heart className="w-5 h-5 text-red-400" />}
            title={`${rel.characters[0]} ↔ ${rel.characters[1]}`}
            subtitle={rel.relationshipType}
            description={rel.context}
            badge={`Strength: ${rel.strength}/10`}
            metadata={[
              { label: 'Change', value: `${rel.previousRelation} → ${rel.newRelation}` },
              { label: 'Updates Tab', value: 'Relationships' }
            ]}
          />
        ))}
      </div>
    )
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl shadow-2xl border border-purple-500/30 max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-purple-500/30">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Update Story Bible</h2>
              <p className="text-sm text-gray-400 mt-1">
                Review and select changes from Episode {reflectionData.episodeNumber}: {reflectionData.episodeTitle}
              </p>
              {reflectionData.needsReview && (
                <div className="flex items-center gap-2 mt-2 text-yellow-400 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>AI confidence: {reflectionData.aiConfidence}% - Please review carefully</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto">
            <TabButton
              active={activeTab === 'characters'}
              onClick={() => setActiveTab('characters')}
              icon={<Users className="w-4 h-4" />}
              label="Characters"
              count={reflectionData.newCharacters.length}
            />
            <TabButton
              active={activeTab === 'locations'}
              onClick={() => setActiveTab('locations')}
              icon={<MapPin className="w-4 h-4" />}
              label="Locations"
              count={reflectionData.newLocations.length}
            />
            <TabButton
              active={activeTab === 'developments'}
              onClick={() => setActiveTab('developments')}
              icon={<Users className="w-4 h-4" />}
              label="Developments"
              count={reflectionData.characterDevelopments.length}
            />
            <TabButton
              active={activeTab === 'world'}
              onClick={() => setActiveTab('world')}
              icon={<Book className="w-4 h-4" />}
              label="World"
              count={reflectionData.worldBuildingReveals.length}
            />
            <TabButton
              active={activeTab === 'timeline'}
              onClick={() => setActiveTab('timeline')}
              icon={<Calendar className="w-4 h-4" />}
              label="Timeline"
              count={reflectionData.timelineEvents.length}
            />
            <TabButton
              active={activeTab === 'relationships'}
              onClick={() => setActiveTab('relationships')}
              icon={<Heart className="w-4 h-4" />}
              label="Relationships"
              count={reflectionData.relationshipChanges.length}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderTabContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-purple-500/30 bg-gray-900/50">
          <div className="text-sm text-gray-400">
            {getTotalSelectedCount()} of {getTotalItemsCount()} items selected
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={getTotalSelectedCount() === 0}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Apply to Story Bible ({getTotalSelectedCount()})
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function TabButton({
  active,
  onClick,
  icon,
  label,
  count
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  count: number
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
        active
          ? 'bg-purple-600 text-white'
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
      {count > 0 && (
        <span className={`px-2 py-0.5 rounded-full text-xs ${
          active ? 'bg-white/20' : 'bg-purple-600/20 text-purple-400'
        }`}>
          {count}
        </span>
      )}
    </button>
  )
}

function SelectableItem({
  isSelected,
  onToggle,
  icon,
  title,
  subtitle,
  description,
  badge,
  metadata
}: {
  isSelected: boolean
  onToggle: () => void
  icon: React.ReactNode
  title: string
  subtitle: string
  description: string
  badge: string
  metadata: { label: string; value: string }[]
}) {
  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-purple-500 bg-purple-500/10'
          : 'border-gray-700 bg-gray-800/50 hover:border-purple-500/50'
      }`}
      onClick={onToggle}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-1 ${
          isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-600'
        }`}>
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </div>

        {/* Icon */}
        <div className="mt-1">{icon}</div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-white">{title}</h4>
              <p className="text-sm text-gray-400">{subtitle}</p>
            </div>
            <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
              {badge}
            </span>
          </div>

          <p className="text-sm text-gray-300 mb-3">{description}</p>

          <div className="space-y-1">
            {metadata.map((item, idx) => (
              <div key={idx} className="flex gap-2 text-xs">
                <span className="text-gray-500">{item.label}:</span>
                <span className="text-gray-400">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
      <Eye className="w-12 h-12 mb-4 opacity-50" />
      <p>{message}</p>
    </div>
  )
}


