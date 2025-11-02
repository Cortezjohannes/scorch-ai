'use client'

import { useState } from 'react'
import { Heart, Plus, Edit2, Trash2, TrendingUp, TrendingDown, Info } from 'lucide-react'
import { CharacterRelationship, RelationshipType } from '@/types/relationships'

// ============================================================================
// TYPES
// ============================================================================

interface RelationshipMapProps {
  relationships: CharacterRelationship[]
  characters: string[]
  onAddRelationship?: (relationship: Partial<CharacterRelationship>) => void
  onEditRelationship?: (id: string, updates: Partial<CharacterRelationship>) => void
  onDeleteRelationship?: (id: string) => void
  readOnly?: boolean
}

// ============================================================================
// RELATIONSHIP MAP COMPONENT
// ============================================================================

export default function RelationshipMap({
  relationships,
  characters,
  onAddRelationship,
  onEditRelationship,
  onDeleteRelationship,
  readOnly = false
}: RelationshipMapProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)
  const [selectedRelationship, setSelectedRelationship] = useState<CharacterRelationship | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // ============================================================================
  // HELPERS
  // ============================================================================

  const getRelationshipColor = (type: RelationshipType): string => {
    switch (type) {
      case 'allies':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'enemies':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'romantic':
        return 'bg-pink-500/20 text-pink-400 border-pink-500/50'
      case 'family':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'rivals':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50'
      case 'mentor-student':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50'
      case 'professional':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  const getRelationshipIcon = (type: RelationshipType): string => {
    switch (type) {
      case 'allies':
        return '🤝'
      case 'enemies':
        return '⚔️'
      case 'romantic':
        return '💕'
      case 'family':
        return '👨‍👩‍👧'
      case 'rivals':
        return '🥊'
      case 'mentor-student':
        return '🎓'
      case 'professional':
        return '💼'
      default:
        return '👥'
    }
  }

  const getCharacterRelationships = (characterName: string): CharacterRelationship[] => {
    return relationships.filter(rel =>
      rel.characters.includes(characterName)
    )
  }

  const getRelatedCharacter = (relationship: CharacterRelationship, currentChar: string): string => {
    return relationship.characters[0] === currentChar
      ? relationship.characters[1]
      : relationship.characters[0]
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart className="w-6 h-6 text-pink-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Character Relationships</h2>
            <p className="text-sm text-gray-400">
              {relationships.length} relationship{relationships.length !== 1 ? 's' : ''} across {characters.length} characters
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
          >
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </button>

          {!readOnly && onAddRelationship && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Relationship
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Character Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Select Character</h3>
            <div className="grid grid-cols-2 gap-3">
              {characters.map(char => {
                const charRelationships = getCharacterRelationships(char)
                const isSelected = selectedCharacter === char

                return (
                  <button
                    key={char}
                    onClick={() => setSelectedCharacter(isSelected ? null : char)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-700 bg-gray-800/50 hover:border-purple-500/50'
                    }`}
                  >
                    <div className="font-semibold text-white mb-1">{char}</div>
                    <div className="text-sm text-gray-400">
                      {charRelationships.length} relationship{charRelationships.length !== 1 ? 's' : ''}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Relationships Display */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              {selectedCharacter ? `${selectedCharacter}'s Relationships` : 'All Relationships'}
            </h3>

            {selectedCharacter ? (
              <div className="space-y-3">
                {getCharacterRelationships(selectedCharacter).map(rel => (
                  <RelationshipCard
                    key={rel.id}
                    relationship={rel}
                    focusCharacter={selectedCharacter}
                    onClick={() => setSelectedRelationship(rel)}
                    isSelected={selectedRelationship?.id === rel.id}
                    getColor={getRelationshipColor}
                    getIcon={getRelationshipIcon}
                    getRelatedCharacter={getRelatedCharacter}
                    onEdit={!readOnly && onEditRelationship ? onEditRelationship : undefined}
                    onDelete={!readOnly && onDeleteRelationship ? onDeleteRelationship : undefined}
                  />
                ))}

                {getCharacterRelationships(selectedCharacter).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No relationships found for {selectedCharacter}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a character to view their relationships</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {relationships.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No relationships defined yet</p>
            </div>
          ) : (
            relationships.map(rel => (
              <RelationshipCard
                key={rel.id}
                relationship={rel}
                onClick={() => setSelectedRelationship(rel)}
                isSelected={selectedRelationship?.id === rel.id}
                getColor={getRelationshipColor}
                getIcon={getRelationshipIcon}
                getRelatedCharacter={getRelatedCharacter}
                onEdit={!readOnly && onEditRelationship ? onEditRelationship : undefined}
                onDelete={!readOnly && onDeleteRelationship ? onDeleteRelationship : undefined}
              />
            ))
          )}
        </div>
      )}

      {/* Relationship Details Modal */}
      {selectedRelationship && (
        <RelationshipDetailsModal
          relationship={selectedRelationship}
          onClose={() => setSelectedRelationship(null)}
          getColor={getRelationshipColor}
          getIcon={getRelationshipIcon}
        />
      )}
    </div>
  )
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function RelationshipCard({
  relationship,
  focusCharacter,
  onClick,
  isSelected,
  getColor,
  getIcon,
  getRelatedCharacter,
  onEdit,
  onDelete
}: {
  relationship: CharacterRelationship
  focusCharacter?: string
  onClick: () => void
  isSelected: boolean
  getColor: (type: RelationshipType) => string
  getIcon: (type: RelationshipType) => string
  getRelatedCharacter: (rel: CharacterRelationship, char: string) => string
  onEdit?: (id: string, updates: Partial<CharacterRelationship>) => void
  onDelete?: (id: string) => void
}) {
  const displayName = focusCharacter
    ? getRelatedCharacter(relationship, focusCharacter)
    : `${relationship.characters[0]} ↔ ${relationship.characters[1]}`

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-purple-500 bg-purple-500/10'
          : 'border-gray-700 bg-gray-800/50 hover:border-purple-500/50'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getIcon(relationship.type)}</span>
          <div>
            <h4 className="font-semibold text-white">{displayName}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded border ${getColor(relationship.type)}`}>
                {relationship.type.replace(/-/g, ' ')}
              </span>
              <span className="text-xs text-gray-400">Strength: {relationship.strength}/10</span>
            </div>
          </div>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(relationship.id!, relationship)
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm('Delete this relationship?')) {
                    onDelete(relationship.id!)
                  }
                }}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <p className="text-sm text-gray-300 line-clamp-2">{relationship.description}</p>

      {relationship.evolution.length > 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
          <Info className="w-3 h-3" />
          <span>{relationship.evolution.length} evolution point{relationship.evolution.length !== 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  )
}

function RelationshipDetailsModal({
  relationship,
  onClose,
  getColor,
  getIcon
}: {
  relationship: CharacterRelationship
  onClose: () => void
  getColor: (type: RelationshipType) => string
  getIcon: (type: RelationshipType) => string
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl shadow-2xl border border-purple-500/30 max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-purple-500/30">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{getIcon(relationship.type)}</span>
            <div>
              <h3 className="text-2xl font-bold text-white">
                {relationship.characters[0]} ↔ {relationship.characters[1]}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded border ${getColor(relationship.type)}`}>
                  {relationship.type.replace(/-/g, ' ')}
                </span>
                <span className="text-xs text-gray-400">Strength: {relationship.strength}/10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)] space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">Description</h4>
            <p className="text-white">{relationship.description}</p>
          </div>

          {relationship.evolution.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3">Evolution Timeline</h4>
              <div className="space-y-3">
                {relationship.evolution.map((evo, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-purple-600 border-4 border-gray-900 flex items-center justify-center text-white font-bold text-sm">
                      E{evo.episode}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">{evo.change}</div>
                      {evo.context && (
                        <p className="text-sm text-gray-400 mt-1">{evo.context}</p>
                      )}
                      {evo.timestamp && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(evo.timestamp).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Source:</span>
              <span className="ml-2 text-white">{relationship.source}</span>
            </div>
            {relationship.createdAt && (
              <div>
                <span className="text-gray-400">Created:</span>
                <span className="ml-2 text-white">
                  {new Date(relationship.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-purple-500/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

