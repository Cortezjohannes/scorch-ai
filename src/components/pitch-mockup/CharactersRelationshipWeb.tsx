'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from '@/components/ui/ClientMotion'
import type { CharactersSection, CharacterProfile } from '@/types/investor-materials'

interface CharactersRelationshipWebProps {
  characters: CharactersSection
}

export default function CharactersRelationshipWeb({ characters }: CharactersRelationshipWebProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)
  const [hoveredCharacter, setHoveredCharacter] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)

  const protagonist = characters.mainCharacters[0]
  const otherCharacters = characters.mainCharacters.slice(1)

  // Calculate positions in a circle
  const getCharacterPosition = (index: number, total: number) => {
    if (total === 0) return { x: 50, y: 50 }
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2
    const radius = total > 6 ? 35 + (total - 6) * 3 : 35
    const finalRadius = Math.min(radius, 45)
    return {
      x: 50 + finalRadius * Math.cos(angle),
      y: 50 + finalRadius * Math.sin(angle)
    }
  }

  const getRelationship = (char1: string, char2: string) => {
    return characters.relationshipMap.find(
      rel =>
        (rel.character1 === char1 && rel.character2 === char2) ||
        (rel.character1 === char2 && rel.character2 === char1)
    )
  }

  const getRelationshipTypes = () => {
    const types = new Set<string>()
    characters.relationshipMap.forEach(rel => types.add(rel.relationshipType))
    return Array.from(types)
  }

  const filteredRelationships = filterType
    ? characters.relationshipMap.filter(rel => rel.relationshipType === filterType)
    : characters.relationshipMap

  const selectedChar = selectedCharacter
    ? characters.mainCharacters.find(c => c.name === selectedCharacter)
    : null

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h2 className="text-3xl font-bold text-[#e2c376] mb-4">Character Relationship Web</h2>
        <p className="text-white/70 text-lg leading-relaxed">
          Explore the connections between characters. Click on any character to see their relationships.
        </p>
      </div>

      <div className="flex gap-8">
        {/* Main Web Visualization */}
        <div className="flex-1">
          <div className="bg-[#121212] rounded-xl p-8 border border-[#e2c376]/20">
            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-4">
                <button
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                  className="px-3 py-1 bg-[#2a2a2a] hover:bg-[#36393f] rounded text-sm"
                >
                  −
                </button>
                <span className="text-sm text-white/70">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
                  className="px-3 py-1 bg-[#2a2a2a] hover:bg-[#36393f] rounded text-sm"
                >
                  +
                </button>
              </div>
              <div className="flex gap-2">
                {getRelationshipTypes().map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(filterType === type ? null : type)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      filterType === type
                        ? 'bg-[#e2c376] text-black'
                        : 'bg-[#2a2a2a] text-white/80 hover:bg-[#36393f]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
                {filterType && (
                  <button
                    onClick={() => setFilterType(null)}
                    className="px-3 py-1 bg-[#2a2a2a] text-white/80 hover:bg-[#36393f] rounded text-sm"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>

            {/* SVG Container */}
            <div className="relative w-full h-[600px] bg-[#0A0A0A] rounded-lg overflow-hidden">
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Draw relationship lines */}
                {characters.mainCharacters.map((char1, idx1) => {
                  const pos1 =
                    idx1 === 0
                      ? { x: 50, y: 50 }
                      : getCharacterPosition(idx1 - 1, otherCharacters.length)

                  return characters.mainCharacters.slice(idx1 + 1).map((char2, idx2) => {
                    const pos2 =
                      idx1 === 0
                        ? getCharacterPosition(idx2, otherCharacters.length)
                        : getCharacterPosition(idx1 + idx2, otherCharacters.length)

                    const relationship = getRelationship(char1.name, char2.name)
                    const isFiltered =
                      filterType && relationship && relationship.relationshipType !== filterType

                    if (isFiltered || (!relationship && filterType)) return null

                    const strokeWidth = relationship ? 3 : 1
                    const opacity = relationship ? 0.5 : 0.1
                    const color = relationship
                      ? selectedCharacter === char1.name || selectedCharacter === char2.name
                        ? '#e2c376'
                        : '#10B981'
                      : '#666'

                    return (
                      <line
                        key={`${char1.name}-${char2.name}`}
                        x1={`${pos1.x}%`}
                        y1={`${pos1.y}%`}
                        x2={`${pos2.x}%`}
                        y2={`${pos2.y}%`}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        opacity={opacity}
                      />
                    )
                  })
                })}
              </svg>

              {/* Central Character (Protagonist) */}
              {protagonist && (
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                  style={{ transform: `translate(-50%, -50%) scale(${zoom})` }}
                  onClick={() => setSelectedCharacter(protagonist.name)}
                  onMouseEnter={() => setHoveredCharacter(protagonist.name)}
                  onMouseLeave={() => setHoveredCharacter(null)}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`w-24 h-24 rounded-full bg-gradient-to-br from-[#e2c376] to-[#d4b46a] border-4 border-[#0A0A0A] flex items-center justify-center text-2xl font-bold text-black shadow-lg overflow-hidden ${
                      selectedCharacter === protagonist.name ? 'ring-4 ring-[#e2c376]' : ''
                    }`}
                  >
                    {protagonist.imageUrl ? (
                      <img
                        src={protagonist.imageUrl}
                        alt={protagonist.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      protagonist.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                    )}
                  </motion.div>
                  <p className="text-center mt-2 text-sm font-semibold text-white group-hover:text-[#e2c376] transition-colors">
                    {protagonist.name}
                  </p>
                  {hoveredCharacter === protagonist.name && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-[#121212] border border-[#e2c376]/20 rounded-lg text-xs text-white/90 whitespace-nowrap z-30">
                      {protagonist.role}
                    </div>
                  )}
                </div>
              )}

              {/* Surrounding Characters */}
              {otherCharacters.map((character, idx) => {
                const position = getCharacterPosition(idx, otherCharacters.length)
                const isHovered = hoveredCharacter === character.name
                const isSelected = selectedCharacter === character.name

                return (
                  <div
                    key={character.name}
                    className="absolute z-10 cursor-pointer group"
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                      transform: `translate(-50%, -50%) scale(${zoom})`
                    }}
                    onClick={() => setSelectedCharacter(character.name)}
                    onMouseEnter={() => setHoveredCharacter(character.name)}
                    onMouseLeave={() => setHoveredCharacter(null)}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`w-16 h-16 rounded-full bg-[#121212] border-2 ${
                        isSelected
                          ? 'border-[#e2c376] ring-4 ring-[#e2c376]/50'
                          : isHovered
                          ? 'border-[#e2c376]'
                          : 'border-white/20'
                      } flex items-center justify-center text-lg font-bold text-white/90 shadow-lg overflow-hidden transition-all`}
                    >
                      {character.imageUrl ? (
                        <img
                          src={character.imageUrl}
                          alt={character.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        character.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                      )}
                    </motion.div>
                    <p
                      className={`text-center mt-1 text-xs font-medium transition-colors ${
                        isHovered || isSelected ? 'text-[#e2c376]' : 'text-white/70'
                      }`}
                    >
                      {character.name.split(' ')[0]}
                    </p>
                    {isHovered && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-[#121212] border border-[#e2c376]/20 rounded-lg text-xs text-white/90 whitespace-nowrap z-30">
                        {character.role}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Character Details Panel */}
        <AnimatePresence>
          {selectedChar && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="w-full lg:w-96 bg-[#121212] rounded-xl p-6 border border-[#e2c376]/20 max-h-[600px] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold text-[#e2c376]">{selectedChar.name}</h3>
                <button
                  onClick={() => setSelectedCharacter(null)}
                  className="text-white/60 hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-white/60 mb-1">Role</h4>
                  <p className="text-white">{selectedChar.role}</p>
                </div>

                {selectedChar.age && (
                  <div>
                    <h4 className="text-sm font-semibold text-white/60 mb-1">Age</h4>
                    <p className="text-white">{selectedChar.age}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold text-white/60 mb-1">Background</h4>
                  <p className="text-white leading-relaxed">{selectedChar.background}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white/60 mb-1">Motivation</h4>
                  <p className="text-white leading-relaxed">{selectedChar.motivation}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white/60 mb-1">Character Arc</h4>
                  <p className="text-white leading-relaxed">{selectedChar.arc}</p>
                </div>

                {selectedChar.keyTraits && selectedChar.keyTraits.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-white/60 mb-2">Key Traits</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedChar.keyTraits.map((trait, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-[#2a2a2a] text-white/80 rounded text-xs"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Relationships */}
                <div>
                  <h4 className="text-sm font-semibold text-white/60 mb-2">Relationships</h4>
                  <div className="space-y-2">
                    {characters.relationshipMap
                      .filter(
                        rel =>
                          rel.character1 === selectedChar.name || rel.character2 === selectedChar.name
                      )
                      .map((rel, idx) => {
                        const otherChar =
                          rel.character1 === selectedChar.name ? rel.character2 : rel.character1
                        return (
                          <div
                            key={idx}
                            className="p-3 bg-[#2a2a2a] rounded-lg border-l-4 border-[#e2c376]"
                          >
                            <div className="font-semibold text-white mb-1">{otherChar}</div>
                            <div className="text-xs text-[#e2c376] mb-1">
                              {rel.relationshipType}
                            </div>
                            <div className="text-sm text-white/80 leading-relaxed">
                              {rel.description}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}





