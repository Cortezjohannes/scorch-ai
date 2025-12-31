'use client'

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { CharactersSection, VisualsSection } from '@/types/investor-materials'
import CharacterDossier from './CharacterDossier'
import CharacterParticles from './CharacterParticles'
import { getRelationshipStyle, getComplexGradientId } from '@/utils/relationshipColors'

interface CharacterWebProps {
  characters: CharactersSection
  linkId?: string // For fetching detailed character data
  visuals?: VisualsSection // Storyboard frames for character key scenes
}

interface CharacterPosition {
  x: number
  y: number
}

interface DraggingState {
  characterName: string
  startX: number
  startY: number
}

export default function CharacterWeb({ characters, linkId, visuals }: CharacterWebProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)
  const [hoveredCharacter, setHoveredCharacter] = useState<string | null>(null)
  const [characterPositions, setCharacterPositions] = useState<Record<string, CharacterPosition>>({})
  const [dragging, setDragging] = useState<DraggingState | null>(null)
  const [enabledRelationshipTypes, setEnabledRelationshipTypes] = useState<Set<string>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  // Find protagonist (first character)
  const protagonist = characters.mainCharacters[0]
  const otherCharacters = characters.mainCharacters.slice(1)

  // Initialize positions and enabled relationship types
  useEffect(() => {
    const initialPositions: Record<string, CharacterPosition> = {}
    
    // Protagonist at center
    if (protagonist) {
      initialPositions[protagonist.name] = { x: 50, y: 50 }
    }

    // Other characters in circle
    otherCharacters.forEach((character, idx) => {
      const angle = (idx * 2 * Math.PI) / otherCharacters.length - Math.PI / 2
      const baseRadius = 25  // Reduced from 35 for tighter layout
      const radius = otherCharacters.length > 6 ? baseRadius + (otherCharacters.length - 6) * 3 : baseRadius
      const finalRadius = Math.min(radius, 35)  // Cap at 35% instead of 45%
      
      initialPositions[character.name] = {
        x: 50 + finalRadius * Math.cos(angle),
        y: 50 + finalRadius * Math.sin(angle)
      }
    })

    setCharacterPositions(initialPositions)

    // Initialize all relationship types as enabled
    const allTypes = new Set<string>()
    characters.relationshipMap.forEach(rel => {
      if (rel.relationshipType) {
        allTypes.add(rel.relationshipType.toLowerCase())
      }
    })
    setEnabledRelationshipTypes(allTypes)
    setHasLoaded(true)
  }, [characters, protagonist, otherCharacters])

  // Get relationship between two characters
  const getRelationship = useCallback((char1: string, char2: string) => {
    return characters.relationshipMap.find(
      rel => (rel.character1 === char1 && rel.character2 === char2) ||
             (rel.character1 === char2 && rel.character2 === char1)
    )
  }, [characters.relationshipMap])

  // Get connected characters for a given character
  const getConnectedCharacters = useCallback((characterName: string): string[] => {
    const connected: string[] = []
    characters.relationshipMap.forEach(rel => {
      if (rel.character1 === characterName) connected.push(rel.character2)
      if (rel.character2 === characterName) connected.push(rel.character1)
    })
    return connected
  }, [characters.relationshipMap])

  // Reset to default layout
  const resetLayout = useCallback(() => {
    const defaultPositions: Record<string, CharacterPosition> = {}
    
    if (protagonist) {
      defaultPositions[protagonist.name] = { x: 50, y: 50 }
    }

    otherCharacters.forEach((character, idx) => {
      const angle = (idx * 2 * Math.PI) / otherCharacters.length - Math.PI / 2
      const baseRadius = 25  // Reduced from 35 for tighter layout
      const radius = otherCharacters.length > 6 ? baseRadius + (otherCharacters.length - 6) * 3 : baseRadius
      const finalRadius = Math.min(radius, 35)  // Cap at 35% instead of 45%
      
      defaultPositions[character.name] = {
        x: 50 + finalRadius * Math.cos(angle),
        y: 50 + finalRadius * Math.sin(angle)
      }
    })

    setCharacterPositions(defaultPositions)
  }, [protagonist, otherCharacters])

  // Handle drag start
  const handleDragStart = (characterName: string, event: React.PointerEvent) => {
    const position = characterPositions[characterName]
    setDragging({
      characterName,
      startX: position.x,
      startY: position.y
    })
    event.preventDefault()
  }

  // Handle drag move
  const handleDragMove = useCallback((event: PointerEvent) => {
    if (!dragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    // Keep within bounds
    const clampedX = Math.max(5, Math.min(95, x))
    const clampedY = Math.max(5, Math.min(95, y))

    setCharacterPositions(prev => ({
      ...prev,
      [dragging.characterName]: { x: clampedX, y: clampedY }
    }))
  }, [dragging])

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDragging(null)
  }, [])

  // Set up drag listeners
  useEffect(() => {
    if (dragging) {
      window.addEventListener('pointermove', handleDragMove)
      window.addEventListener('pointerup', handleDragEnd)
      return () => {
        window.removeEventListener('pointermove', handleDragMove)
        window.removeEventListener('pointerup', handleDragEnd)
      }
    }
  }, [dragging, handleDragMove, handleDragEnd])

  // Check if relationship should be visible
  const isRelationshipVisible = useCallback((relationship: { relationshipType: string }) => {
    if (!relationship.relationshipType) return true
    return enabledRelationshipTypes.has(relationship.relationshipType.toLowerCase())
  }, [enabledRelationshipTypes])

  // Get all unique relationship types
  const relationshipTypes = useMemo(() => {
    const types = new Set<string>()
    characters.relationshipMap.forEach(rel => {
      if (rel.relationshipType) {
        types.add(rel.relationshipType)
      }
    })
    return Array.from(types)
  }, [characters.relationshipMap])

  // Toggle relationship type filter
  const toggleRelationshipType = (type: string) => {
    setEnabledRelationshipTypes(prev => {
      const next = new Set(prev)
      const lowerType = type.toLowerCase()
      if (next.has(lowerType)) {
        next.delete(lowerType)
      } else {
        next.add(lowerType)
      }
      return next
    })
  }

  // Get curved path for SVG
  const getCurvedPath = (x1: number, y1: number, x2: number, y2: number): string => {
    const midX = (x1 + x2) / 2
    const midY = (y1 + y2) / 2
    const dx = x2 - x1
    const dy = y2 - y1
    const curvature = Math.sqrt(dx * dx + dy * dy) * 0.3
    const controlX = midX + (dy * curvature) / 100
    const controlY = midY - (dx * curvature) / 100
    return `M ${x1}% ${y1}% Q ${controlX}% ${controlY}% ${x2}% ${y2}%`
  }

  // Check if character should be highlighted
  const isHighlighted = useCallback((characterName: string) => {
    if (!hoveredCharacter) return false
    if (characterName === hoveredCharacter) return true
    const connected = getConnectedCharacters(hoveredCharacter)
    return connected.includes(characterName)
  }, [hoveredCharacter, getConnectedCharacters])

  // Get all relationships for rendering
  const allRelationships = useMemo(() => {
    const relationships: Array<{
      char1: string
      char2: string
      relationship: any
      style: ReturnType<typeof getRelationshipStyle>
    }> = []

    characters.mainCharacters.forEach((char1, idx1) => {
      characters.mainCharacters.slice(idx1 + 1).forEach(char2 => {
        const relationship = getRelationship(char1.name, char2.name)
        
        // Always draw lines between characters
        // If relationship exists and is visible, use it; otherwise use default
        if (relationship && isRelationshipVisible(relationship)) {
          // Ensure we have a relationshipType, default to 'complex' if missing
          const relType = relationship.relationshipType || 'complex'
          relationships.push({
            char1: char1.name,
            char2: char2.name,
            relationship,
            style: getRelationshipStyle(relType)
          })
        } else {
          // Draw default connection line for characters without defined relationships
          // or when relationship type is filtered out
          relationships.push({
            char1: char1.name,
            char2: char2.name,
            relationship: { 
              relationshipType: '', 
              character1: char1.name, 
              character2: char2.name,
              description: `Connection between ${char1.name} and ${char2.name}`
            },
            style: getRelationshipStyle('') // Will use default style with opacity 0.5
          })
        }
      })
    })

    return relationships
  }, [characters.mainCharacters, getRelationship, isRelationshipVisible])

  // Get active connections for particles (connections involving hovered character)
  const activeConnections = useMemo(() => {
    if (!hoveredCharacter) return []
    return allRelationships
      .filter(rel => rel.char1 === hoveredCharacter || rel.char2 === hoveredCharacter)
      .map(rel => ({ char1: rel.char1, char2: rel.char2 }))
  }, [hoveredCharacter, allRelationships])

  if (!hasLoaded || Object.keys(characterPositions).length === 0) {
    return (
      <div className="relative w-full min-h-[400px] h-[600px] bg-[#0A0A0A] rounded-xl flex items-center justify-center">
        <div className="text-white/50">Loading character web...</div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[80vh] max-h-[1000px] min-h-[600px] bg-[#0A0A0A] rounded-xl overflow-hidden"
    >
      {/* Particle System - lowest layer */}
      <CharacterParticles
        hoveredCharacter={hoveredCharacter}
        characterPositions={characterPositions}
        activeConnections={activeConnections}
      />

      {/* SVG Container for Relationship Lines - above particles */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <defs>
          {/* Gradient definitions for complex relationships */}
          {allRelationships
            .filter(rel => rel.relationship.relationshipType?.toLowerCase().includes('complex'))
            .map(rel => (
              <linearGradient 
                key={getComplexGradientId(rel.char1, rel.char2)} 
                id={getComplexGradientId(rel.char1, rel.char2)}
                x1="0%" 
                y1="0%" 
                x2="100%" 
                y2="100%"
              >
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="50%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#EC4899" />
                <animateTransform
                  attributeName="gradientTransform"
                  type="rotate"
                  values="0;360"
                  dur="10s"
                  repeatCount="indefinite"
                />
              </linearGradient>
            ))}
          
          {/* Animated gradient for all lines */}
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.8">
              <animate attributeName="offset" values="0;1;0" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#10B981" stopOpacity="0.4">
              <animate attributeName="offset" values="0;1;0" dur="3s" begin="1s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.8">
              <animate attributeName="offset" values="0;1;0" dur="3s" begin="2s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>

        {/* Render relationship lines */}
        {allRelationships.map((rel) => {
          const pos1 = characterPositions[rel.char1]
          const pos2 = characterPositions[rel.char2]
          
          if (!pos1 || !pos2) return null

          const isHighlightedConnection = hoveredCharacter && 
            (rel.char1 === hoveredCharacter || rel.char2 === hoveredCharacter)
          const isDimmed = hoveredCharacter && !isHighlightedConnection

          const path = getCurvedPath(pos1.x, pos1.y, pos2.x, pos2.y)
          const relType = rel.relationship.relationshipType || ''
          const isComplex = relType.toLowerCase().includes('complex')
          const gradientId = isComplex ? getComplexGradientId(rel.char1, rel.char2) : undefined

          // Ensure minimum opacity for visibility (at least 0.5 for default connections)
          const baseOpacity = Math.max(rel.style.opacity, 0.5)
          const finalOpacity = isDimmed ? 0.2 : (isHighlightedConnection ? Math.min(baseOpacity * 1.5, 1) : baseOpacity)

          return (
            <motion.path
              key={`${rel.char1}-${rel.char2}`}
              d={path}
              fill="none"
              stroke={gradientId ? `url(#${gradientId})` : rel.style.color}
              strokeWidth={rel.style.strokeWidth}
              strokeDasharray={rel.style.strokeDasharray}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: 1, 
                opacity: finalOpacity
              }}
              transition={{ 
                pathLength: { duration: 0.5, ease: "easeOut" },
                opacity: { duration: 0.2 }
              }}
              style={{
                filter: isHighlightedConnection ? 'drop-shadow(0 0 4px currentColor)' : undefined
              }}
            />
          )
        })}
      </svg>

      {/* Control Panel */}
      <div className="absolute top-4 right-4 z-30 bg-[#121212]/95 backdrop-blur-sm border border-[#10B981]/20 rounded-lg p-3 space-y-2 max-h-[400px] overflow-y-auto">
        <div className="text-xs font-semibold text-white mb-2">Filters</div>
        {relationshipTypes.length > 0 ? (
          relationshipTypes.map(type => {
            const isEnabled = enabledRelationshipTypes.has(type.toLowerCase())
            const style = getRelationshipStyle(type)
            return (
              <label
                key={type}
                className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-1 rounded"
              >
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={() => toggleRelationshipType(type)}
                  className="rounded border-[#10B981]/30"
                />
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: style.color }}
                />
                <span className="text-xs text-white/70">{type}</span>
              </label>
            )
          })
        ) : (
          <div className="text-xs text-white/50">No relationship types</div>
        )}
        <button
          onClick={resetLayout}
          className="w-full mt-2 px-3 py-1.5 text-xs bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#10B981] rounded transition-colors"
        >
          Reset Layout
        </button>
      </div>

      {/* Central Character (Protagonist) */}
      {protagonist && characterPositions[protagonist.name] && (
        <motion.div
          className="absolute z-20 cursor-grab active:cursor-grabbing"
          style={{
            left: `${characterPositions[protagonist.name].x}%`,
            top: `${characterPositions[protagonist.name].y}%`,
            transform: 'translate(-50%, -50%)'
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: isHighlighted(protagonist.name) ? 1.1 : 1,
            opacity: 1
          }}
          transition={{
            scale: { type: "spring", stiffness: 300, damping: 20 },
            opacity: { duration: 0.3 }
          }}
          onPointerDown={(e) => handleDragStart(protagonist.name, e)}
          onClick={() => setSelectedCharacter(protagonist.name)}
          onMouseEnter={() => setHoveredCharacter(protagonist.name)}
          onMouseLeave={() => setHoveredCharacter(null)}
          whileHover={{ scale: 1.15 }}
        >
          <motion.div
            className="w-24 h-24 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] border-4 border-[#0A0A0A] flex items-center justify-center text-2xl font-bold text-white shadow-lg overflow-hidden relative"
            animate={{
              boxShadow: isHighlighted(protagonist.name) 
                ? ['0 0 0px #10B981', '0 0 20px #10B981', '0 0 0px #10B981']
                : '0 4px 20px rgba(0,0,0,0.5)'
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {protagonist.imageUrl ? (
              <img
                src={protagonist.imageUrl}
                alt={protagonist.name}
                className="w-full h-full object-cover"
              />
            ) : (
              protagonist.name.split(' ').map(n => n[0]).join('')
            )}
          </motion.div>
          <motion.p 
            className="text-center mt-2 text-sm font-semibold text-white"
            animate={{
              color: isHighlighted(protagonist.name) ? '#10B981' : '#FFFFFF'
            }}
            transition={{ duration: 0.2 }}
          >
            {protagonist.name}
          </motion.p>
          <AnimatePresence>
            {hoveredCharacter === protagonist.name && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-[#121212] border border-[#10B981]/20 rounded-lg text-xs text-white/90 whitespace-nowrap z-30"
              >
                {protagonist.role}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Surrounding Characters */}
      {otherCharacters.map((character, idx) => {
        const position = characterPositions[character.name]
        if (!position) return null

        return (
          <motion.div
            key={character.name}
            className="absolute z-10 cursor-grab active:cursor-grabbing"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: isHighlighted(character.name) ? 1.15 : 1,
              opacity: isHighlighted(character.name) || !hoveredCharacter ? 1 : 0.4
            }}
            transition={{
              scale: { 
                type: "spring", 
                stiffness: 400, 
                damping: 25,
                delay: idx * 0.05
              },
              opacity: { duration: 0.2 }
            }}
            onPointerDown={(e) => handleDragStart(character.name, e)}
            onClick={() => setSelectedCharacter(character.name)}
            onMouseEnter={() => setHoveredCharacter(character.name)}
            onMouseLeave={() => setHoveredCharacter(null)}
            whileHover={{ scale: 1.1 }}
          >
            <motion.div
              className={`w-16 h-16 rounded-full bg-[#121212] border-2 flex items-center justify-center text-lg font-bold text-white/90 shadow-lg overflow-hidden relative ${
                isHighlighted(character.name) ? 'border-[#10B981]' : 'border-white/20'
              }`}
              animate={{
                boxShadow: isHighlighted(character.name)
                  ? ['0 0 0px #10B981', '0 0 15px #10B981', '0 0 0px #10B981']
                  : '0 2px 10px rgba(0,0,0,0.3)'
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {character.imageUrl ? (
                <img
                  src={character.imageUrl}
                  alt={character.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                character.name.split(' ').map(n => n[0]).join('')
              )}
            </motion.div>
            <motion.p
              className={`text-center mt-1 text-xs font-medium`}
              animate={{
                color: isHighlighted(character.name) ? '#10B981' : '#B3B3B3'
              }}
              transition={{ duration: 0.2 }}
            >
              {character.name.split(' ')[0]}
            </motion.p>
            <AnimatePresence>
              {hoveredCharacter === character.name && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-[#121212] border border-[#10B981]/20 rounded-lg text-xs text-white/90 whitespace-nowrap z-30"
                >
                  {character.role}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}

      {/* Instructions */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/50 text-center bg-[#0A0A0A]/80 px-4 py-2 rounded-lg backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Drag characters to reposition • Hover to highlight connections
      </motion.div>

      {/* Character Dossier Modal */}
      <AnimatePresence>
        {selectedCharacter && (() => {
          const selectedChar = characters.mainCharacters.find(c => c.name === selectedCharacter)
          if (!selectedChar) return null
          
          return (
            <CharacterDossier
              character={selectedChar}
              relationships={characters.relationshipMap.filter(
                rel => rel.character1 === selectedCharacter || rel.character2 === selectedCharacter
              )}
              isOpen={!!selectedCharacter}
              onClose={() => setSelectedCharacter(null)}
              characterImage={selectedChar.imageUrl}
              linkId={linkId}
              visuals={visuals}
            />
          )
        })()}
      </AnimatePresence>
    </div>
  )
}
