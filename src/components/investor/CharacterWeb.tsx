'use client'

import React, { useState } from 'react'
import type { CharactersSection } from '@/types/investor-materials'
import CharacterDossier from './CharacterDossier'

interface CharacterWebProps {
  characters: CharactersSection
}

export default function CharacterWeb({ characters }: CharacterWebProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)
  const [hoveredCharacter, setHoveredCharacter] = useState<string | null>(null)

  // Find protagonist (first character or character with most relationships)
  const protagonist = characters.mainCharacters[0]
  const otherCharacters = characters.mainCharacters.slice(1)

  // Calculate positions in a circle around center
  // Adjust radius based on number of characters to prevent crowding
  const getCharacterPosition = (index: number, total: number) => {
    if (total === 0) return { x: 50, y: 50 }
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2 // Start at top
    // Increase radius for more characters to spread them out
    const baseRadius = 35
    const radius = total > 6 ? baseRadius + (total - 6) * 3 : baseRadius
    const maxRadius = 45 // Cap at 45% to keep within bounds
    const finalRadius = Math.min(radius, maxRadius)
    return {
      x: 50 + finalRadius * Math.cos(angle),
      y: 50 + finalRadius * Math.sin(angle)
    }
  }

  const getRelationshipLine = (char1: string, char2: string) => {
    const relationship = characters.relationshipMap.find(
      rel => (rel.character1 === char1 && rel.character2 === char2) ||
             (rel.character1 === char2 && rel.character2 === char1)
    )
    return relationship
  }

  return (
    <div className="relative w-full min-h-[400px] h-[600px] bg-[#0A0A0A] rounded-xl overflow-hidden">
      {/* SVG Container for Relationship Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Draw lines between all characters */}
        {characters.mainCharacters.map((char1, idx1) => {
          const pos1 = idx1 === 0 
            ? { x: 50, y: 50 } 
            : getCharacterPosition(idx1 - 1, otherCharacters.length)
          
          return characters.mainCharacters.slice(idx1 + 1).map((char2, idx2) => {
            const pos2 = idx1 === 0
              ? getCharacterPosition(idx2, otherCharacters.length)
              : getCharacterPosition(idx1 + idx2, otherCharacters.length)
            
            const relationship = getRelationshipLine(char1.name, char2.name)
            const strokeWidth = relationship ? 3 : 1
            const opacity = relationship ? 0.4 : 0.1

            return (
              <line
                key={`${char1.name}-${char2.name}`}
                x1={`${pos1.x}%`}
                y1={`${pos1.y}%`}
                x2={`${pos2.x}%`}
                y2={`${pos2.y}%`}
                stroke="#10B981"
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
          style={{ transform: 'translate(-50%, -50%)' }}
          onClick={() => setSelectedCharacter(protagonist.name)}
          onMouseEnter={() => setHoveredCharacter(protagonist.name)}
          onMouseLeave={() => setHoveredCharacter(null)}
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] border-4 border-[#0A0A0A] flex items-center justify-center text-2xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform overflow-hidden">
            {protagonist.imageUrl ? (
              <img
                src={protagonist.imageUrl}
                alt={protagonist.name}
                className="w-full h-full object-cover"
              />
            ) : (
              protagonist.name.split(' ').map(n => n[0]).join('')
            )}
          </div>
          <p className="text-center mt-2 text-sm font-semibold text-white group-hover:text-[#10B981] transition-colors">
            {protagonist.name}
          </p>
          {hoveredCharacter === protagonist.name && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-[#121212] border border-[#10B981]/20 rounded-lg text-xs text-white/90 whitespace-nowrap z-30">
              {protagonist.role}
            </div>
          )}
        </div>
      )}

      {/* Surrounding Characters */}
      {otherCharacters.map((character, idx) => {
        const position = getCharacterPosition(idx, otherCharacters.length)
        const isHovered = hoveredCharacter === character.name

        return (
          <div
            key={character.name}
            className="absolute z-10 cursor-pointer group"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            onClick={() => setSelectedCharacter(character.name)}
            onMouseEnter={() => setHoveredCharacter(character.name)}
            onMouseLeave={() => setHoveredCharacter(null)}
          >
            <div className={`w-16 h-16 rounded-full bg-[#121212] border-2 ${
              isHovered ? 'border-[#10B981]' : 'border-white/20'
            } flex items-center justify-center text-lg font-bold text-white/90 group-hover:scale-110 transition-all shadow-lg overflow-hidden`}>
              {character.imageUrl ? (
                <img
                  src={character.imageUrl}
                  alt={character.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                character.name.split(' ').map(n => n[0]).join('')
              )}
            </div>
            <p className={`text-center mt-1 text-xs font-medium ${
              isHovered ? 'text-[#10B981]' : 'text-white/70'
            } transition-colors`}>
              {character.name.split(' ')[0]}
            </p>
            {isHovered && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-[#121212] border border-[#10B981]/20 rounded-lg text-xs text-white/90 whitespace-nowrap z-30">
                {character.role}
              </div>
            )}
          </div>
        )
      })}

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/50 text-center">
        Click a character to view details • Double-click for full dossier
      </div>

      {/* Character Dossier Modal */}
      {selectedCharacter && (() => {
        const selectedChar = characters.mainCharacters.find(c => c.name === selectedCharacter)!
        return (
          <CharacterDossier
            character={selectedChar}
            relationships={characters.relationshipMap.filter(
              rel => rel.character1 === selectedCharacter || rel.character2 === selectedCharacter
            )}
            isOpen={!!selectedCharacter}
            onClose={() => setSelectedCharacter(null)}
            characterImage={selectedChar.imageUrl}
          />
        )
      })()}
    </div>
  )
}

