'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'
import type { CharactersSection, CharacterProfile } from '@/types/investor-materials'
import CharacterDossier from '../CharacterDossier'

interface CharacterUniverse3DProps {
  characters: CharactersSection
}

interface CharacterNode {
  character: CharacterProfile
  x: number
  y: number
  z: number
  velocityX: number
  velocityY: number
  velocityZ: number
  connections: string[]
  type: 'protagonist' | 'supporting' | 'antagonist'
}

export default function CharacterUniverse3D({ characters }: CharacterUniverse3DProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)
  const [hoveredCharacter, setHoveredCharacter] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'web' | 'timeline' | 'gallery'>('web')
  const [cameraRotation, setCameraRotation] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [draggedCharacter, setDraggedCharacter] = useState<string | null>(null)
  const [showRelationshipDetails, setShowRelationshipDetails] = useState(false)
  const [selectedRelationship, setSelectedRelationship] = useState<{char1: string, char2: string} | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>()

  // Initialize character nodes with physics
  const initializeCharacterNodes = useCallback((): CharacterNode[] => {
    const protagonist = characters.mainCharacters[0]
    const supportingChars = characters.mainCharacters.slice(1)

    const nodes: CharacterNode[] = []

    // Protagonist at center
    if (protagonist) {
      nodes.push({
        character: protagonist,
        x: 0,
        y: 0,
        z: 0,
        velocityX: 0,
        velocityY: 0,
        velocityZ: 0,
        connections: characters.relationshipMap
          .filter(rel => rel.character1 === protagonist.name || rel.character2 === protagonist.name)
          .map(rel => rel.character1 === protagonist.name ? rel.character2 : rel.character1),
        type: 'protagonist'
      })
    }

    // Supporting characters in orbit
    supportingChars.forEach((char, idx) => {
      const angle = (idx * 2 * Math.PI) / supportingChars.length
      const radius = 200
      const height = Math.sin(idx * 0.5) * 50 // Add some vertical variation

      nodes.push({
        character: char,
        x: Math.cos(angle) * radius,
        y: height,
        z: Math.sin(angle) * radius,
        velocityX: (Math.random() - 0.5) * 0.5,
        velocityY: (Math.random() - 0.5) * 0.5,
        velocityZ: (Math.random() - 0.5) * 0.5,
        connections: characters.relationshipMap
          .filter(rel => rel.character1 === char.name || rel.character2 === char.name)
          .map(rel => rel.character1 === char.name ? rel.character2 : rel.character1),
        type: char.role.toLowerCase().includes('antagonist') ? 'antagonist' : 'supporting'
      })
    })

    return nodes
  }, [characters])

  const [characterNodes, setCharacterNodes] = useState<CharacterNode[]>(() => initializeCharacterNodes())

  // Physics simulation for character movement
  useEffect(() => {
    const updatePhysics = () => {
      setCharacterNodes(prevNodes => {
        return prevNodes.map(node => {
          // Apply forces from relationships
          let forceX = 0, forceY = 0, forceZ = 0

          prevNodes.forEach(otherNode => {
            if (otherNode.character.name === node.character.name) return

            const dx = otherNode.x - node.x
            const dy = otherNode.y - node.y
            const dz = otherNode.z - node.z
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

            // Attraction force for connected characters
            if (node.connections.includes(otherNode.character.name)) {
              const attractionStrength = 0.01
              const force = attractionStrength / (distance * distance + 100)
              forceX += dx * force
              forceY += dy * force
              forceZ += dz * force
            }

            // Repulsion force for all characters (prevent clustering)
            const repulsionStrength = 50
            const repulsionForce = repulsionStrength / (distance * distance + 50)
            forceX -= dx * repulsionForce
            forceY -= dy * repulsionForce
            forceZ -= dz * repulsionForce
          })

          // Protagonist stays at center
          if (node.type === 'protagonist') {
            forceX -= node.x * 0.1
            forceY -= node.y * 0.1
            forceZ -= node.z * 0.1
          }

          // Apply damping
          const damping = 0.98
          const newVelocityX = (node.velocityX + forceX) * damping
          const newVelocityY = (node.velocityY + forceY) * damping
          const newVelocityZ = (node.velocityZ + forceZ) * damping

          // Limit maximum speed
          const maxSpeed = 2
          const speed = Math.sqrt(newVelocityX * newVelocityX + newVelocityY * newVelocityY + newVelocityZ * newVelocityZ)
          const limitedVelocityX = speed > maxSpeed ? (newVelocityX / speed) * maxSpeed : newVelocityX
          const limitedVelocityY = speed > maxSpeed ? (newVelocityY / speed) * maxSpeed : newVelocityY
          const limitedVelocityZ = speed > maxSpeed ? (newVelocityZ / speed) * maxSpeed : newVelocityZ

          return {
            ...node,
            x: node.x + limitedVelocityX,
            y: node.y + limitedVelocityY,
            z: node.z + limitedVelocityZ,
            velocityX: limitedVelocityX,
            velocityY: limitedVelocityY,
            velocityZ: limitedVelocityZ
          }
        })
      })

      animationFrameRef.current = requestAnimationFrame(updatePhysics)
    }

    if (viewMode === 'web') {
      animationFrameRef.current = requestAnimationFrame(updatePhysics)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [characterNodes, viewMode])

  // Mouse drag handling for 3D rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode !== 'web') return
    setIsDragging(true)
    setDraggedCharacter(null)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || viewMode !== 'web') return

    const sensitivity = 0.5
    setCameraRotation(prev => ({
      x: prev.x + e.movementY * sensitivity,
      y: prev.y + e.movementX * sensitivity
    }))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const getRelationshipType = (char1: string, char2: string) => {
    return characters.relationshipMap.find(
      rel => (rel.character1 === char1 && rel.character2 === char2) ||
             (rel.character1 === char2 && rel.character2 === char1)
    )
  }

  const getNodePosition = (node: CharacterNode) => {
    // Apply camera rotation
    const cosX = Math.cos(cameraRotation.x * Math.PI / 180)
    const sinX = Math.sin(cameraRotation.x * Math.PI / 180)
    const cosY = Math.cos(cameraRotation.y * Math.PI / 180)
    const sinY = Math.sin(cameraRotation.y * Math.PI / 180)

    // Rotate around Y axis first, then X axis
    const rotatedY = node.y * cosX - node.z * sinX
    const rotatedZ = node.y * sinX + node.z * cosX

    const finalX = node.x * cosY + rotatedZ * sinY
    const finalZ = -node.x * sinY + rotatedZ * cosY

    // Perspective projection
    const perspective = 1000
    const scale = perspective / (perspective + finalZ + 500)
    const screenX = finalX * scale + 400 // Center on 400px
    const screenY = rotatedY * scale + 300 // Center on 300px

    return { x: screenX, y: screenY, scale }
  }

  const renderRelationshipLines = () => {
    const lines: JSX.Element[] = []

    characterNodes.forEach((node1, idx1) => {
      node1.connections.forEach(connection => {
        const node2 = characterNodes.find(n => n.character.name === connection)
        if (!node2 || idx1 >= characterNodes.indexOf(node2)) return

        const pos1 = getNodePosition(node1)
        const pos2 = getNodePosition(node2)
        const relationship = getRelationshipType(node1.character.name, node2.character.name)

        if (!relationship) return

        // Determine line color based on relationship type
        let strokeColor = '#10B981' // default green
        const desc = relationship.description.toLowerCase()
        if (desc.includes('love') || desc.includes('romantic')) strokeColor = '#ef4444' // red
        else if (desc.includes('rival') || desc.includes('enemy')) strokeColor = '#f59e0b' // amber
        else if (desc.includes('family') || desc.includes('mentor')) strokeColor = '#8b5cf6' // purple

        // Animated particles along the line
        const particleCount = 3
        const particles = Array.from({ length: particleCount }).map((_, i) => {
          const t = (Date.now() * 0.001 + i * 0.5) % 1
          const particleX = pos1.x + (pos2.x - pos1.x) * t
          const particleY = pos1.y + (pos2.y - pos1.y) * t

          return (
            <motion.circle
              key={`${node1.character.name}-${node2.character.name}-particle-${i}`}
              cx={particleX}
              cy={particleY}
              r="2"
              fill={strokeColor}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )
        })

        lines.push(
          <g key={`${node1.character.name}-${node2.character.name}`}>
            <line
              x1={pos1.x}
              y1={pos1.y}
              x2={pos2.x}
              y2={pos2.y}
              stroke={strokeColor}
              strokeWidth={relationship ? 3 : 1}
              opacity={0.6}
              className="pointer-events-none"
            />
            {particles}
          </g>
        )
      })
    })

    return lines
  }

  const renderCharacterNode = (node: CharacterNode) => {
    const position = getNodePosition(node)
    const isHovered = hoveredCharacter === node.character.name
    const isSelected = selectedCharacter === node.character.name

    return (
      <motion.div
        key={node.character.name}
        className="absolute cursor-pointer group"
        style={{
          left: position.x,
          top: position.y,
          transform: `translate(-50%, -50%) scale(${position.scale})`,
          zIndex: node.type === 'protagonist' ? 20 : 10
        }}
        onClick={() => setSelectedCharacter(isSelected ? null : node.character.name)}
        onMouseEnter={() => setHoveredCharacter(node.character.name)}
        onMouseLeave={() => setHoveredCharacter(null)}
        whileHover={{ scale: position.scale * 1.2 }}
        animate={{
          scale: position.scale * (isSelected ? 1.3 : isHovered ? 1.1 : 1)
        }}
      >
        {/* Character Avatar */}
        <div className={`relative rounded-full border-4 overflow-hidden shadow-lg transition-all duration-300 ${
          node.type === 'protagonist'
            ? 'w-24 h-24 border-[#10B981] bg-gradient-to-br from-[#10B981] to-[#059669]'
            : node.type === 'antagonist'
            ? 'w-16 h-16 border-red-500 bg-gradient-to-br from-red-600 to-red-800'
            : 'w-16 h-16 border-white/30 bg-[#121212]'
        }`}>
          {node.character.imageUrl ? (
            <img
              src={node.character.imageUrl}
              alt={node.character.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
              {node.character.name.split(' ').map(n => n[0]).join('')}
            </div>
          )}

          {/* Glow effect for protagonist */}
          {node.type === 'protagonist' && (
            <div className="absolute inset-0 rounded-full bg-[#10B981] opacity-20 animate-pulse" />
          )}
        </div>

        {/* Character Name */}
        <div className={`text-center mt-2 text-sm font-semibold transition-colors ${
          isHovered || isSelected ? 'text-[#10B981]' : 'text-white/70'
        }`}>
          {node.character.name}
        </div>

        {/* Role Badge */}
        <div className="text-center mt-1">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            node.type === 'protagonist'
              ? 'bg-[#10B981]/20 text-[#10B981]'
              : node.type === 'antagonist'
              ? 'bg-red-500/20 text-red-400'
              : 'bg-white/10 text-white/60'
          }`}>
            {node.character.role}
          </span>
        </div>

        {/* Hover Tooltip */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-3 bg-[#121212] border border-[#10B981]/20 rounded-lg text-xs text-white/90 whitespace-nowrap z-30 max-w-xs"
            >
              <div className="font-semibold mb-1">{node.character.name}</div>
              <div className="text-white/70">{node.character.background?.substring(0, 100)}...</div>
              <div className="text-[#10B981] mt-1">Click to view dossier</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  const renderTimelineView = () => {
    // Simple timeline view - characters positioned by importance/development
    return (
      <div className="space-y-6 p-8">
        <h3 className="text-2xl font-bold text-white text-center mb-8">Character Development Timeline</h3>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#10B981]/50 transform -translate-x-1/2" />

          {characters.mainCharacters.map((character, idx) => (
            <motion.div
              key={character.name}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -100 : 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.2 }}
              className={`relative flex items-center mb-8 ${
                idx % 2 === 0 ? 'justify-start' : 'justify-end'
              }`}
            >
              <div className={`w-96 p-6 bg-[#121212] border border-[#10B981]/20 rounded-lg cursor-pointer hover:border-[#10B981]/40 transition-colors ${
                idx % 2 === 0 ? 'mr-8' : 'ml-8'
              }`}
              onClick={() => setSelectedCharacter(character.name)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#10B981]">
                    {character.imageUrl ? (
                      <img src={character.imageUrl} alt={character.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#10B981] flex items-center justify-center text-white font-bold">
                        {character.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white">{character.name}</h4>
                    <p className="text-[#10B981] text-sm">{character.role}</p>
                    <p className="text-white/70 text-sm mt-1">{character.arc}</p>
                  </div>
                </div>
              </div>

              {/* Timeline dot */}
              <div className="absolute left-1/2 w-4 h-4 bg-[#10B981] rounded-full transform -translate-x-1/2 border-4 border-[#0A0A0A]" />
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  const renderGalleryView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
        {characters.mainCharacters.map((character, idx) => (
          <motion.div
            key={character.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-[#121212] border border-[#10B981]/20 rounded-lg p-6 cursor-pointer hover:border-[#10B981]/40 transition-colors"
            onClick={() => setSelectedCharacter(character.name)}
          >
            <div className="text-center space-y-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#10B981] mx-auto">
                {character.imageUrl ? (
                  <img src={character.imageUrl} alt={character.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#10B981] flex items-center justify-center text-white font-bold text-2xl">
                    {character.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{character.name}</h3>
                <p className="text-[#10B981]">{character.role}</p>
                <p className="text-white/70 text-sm mt-2">{character.background?.substring(0, 120)}...</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <div className="relative w-full min-h-[600px] bg-[#0A0A0A] rounded-xl overflow-hidden">
      {/* Header Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setViewMode('web')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              viewMode === 'web' ? 'bg-[#10B981] text-black' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            3D Web
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              viewMode === 'timeline' ? 'bg-[#10B981] text-black' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setViewMode('gallery')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              viewMode === 'gallery' ? 'bg-[#10B981] text-black' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Gallery
          </button>
        </div>

        {viewMode === 'web' && (
          <div className="text-xs text-white/50">
            Drag to rotate • Click characters to explore
          </div>
        )}
      </div>

      {/* Main Content */}
      <div
        ref={containerRef}
        className="w-full h-full relative overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <AnimatePresence mode="wait">
          {viewMode === 'web' && (
            <motion.div
              key="web"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full relative"
            >
              {/* SVG for relationship lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                {renderRelationshipLines()}
              </svg>

              {/* Character nodes */}
              {characterNodes.map(renderCharacterNode)}

              {/* Instructions */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/50 text-center">
                {isDragging ? 'Release to stop rotating' : 'Drag to rotate view • Click characters to explore relationships'}
              </div>
            </motion.div>
          )}

          {viewMode === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="w-full h-full"
            >
              {renderTimelineView()}
            </motion.div>
          )}

          {viewMode === 'gallery' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full h-full overflow-y-auto"
            >
              {renderGalleryView()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Relationship Details Modal */}
      <AnimatePresence>
        {showRelationshipDetails && selectedRelationship && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRelationshipDetails(false)}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#121212] border border-[#10B981]/20 rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-white mb-4">Relationship Details</h3>
              {(() => {
                const relationship = getRelationshipType(selectedRelationship.char1, selectedRelationship.char2)
                if (!relationship) return <p>No relationship data available</p>

                return (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-[#10B981] font-semibold">{selectedRelationship.char1}</span>
                      <span className="text-white/50">↔</span>
                      <span className="text-[#10B981] font-semibold">{selectedRelationship.char2}</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{relationship.relationshipType}</p>
                      <p className="text-white/80 text-sm mt-2">{relationship.description}</p>
                    </div>
                    {relationship.keyMoments.length > 0 && (
                      <div>
                        <p className="text-white font-semibold mb-2">Key Moments:</p>
                        <ul className="text-white/80 text-sm space-y-1">
                          {relationship.keyMoments.map((moment, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <span className="text-[#10B981]">•</span>
                              <span>{moment}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character Dossier Modal */}
      <AnimatePresence>
        {selectedCharacter && (
          <CharacterDossier
            character={characters.mainCharacters.find(c => c.name === selectedCharacter)!}
            relationships={characters.relationshipMap.filter(
              rel => rel.character1 === selectedCharacter || rel.character2 === selectedCharacter
            )}
            isOpen={!!selectedCharacter}
            onClose={() => setSelectedCharacter(null)}
            characterImage={characters.mainCharacters.find(c => c.name === selectedCharacter)?.imageUrl}
          />
        )}
      </AnimatePresence>
    </div>
  )
}