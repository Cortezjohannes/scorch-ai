'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'

interface Character {
  id: string
  name: string
  role: string
  description: string
  relationships?: string[]
  arc?: string
  traits?: string[]
  backstory?: string
  personality?: string
  goals?: string
  conflicts?: string
}

export function CharacterGalaxy({ storyData }: { storyData: any }) {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [viewMode, setViewMode] = useState<'galaxy' | 'list' | 'relationships'>('galaxy')

  // Extract characters from the existing story data structure
  const extractCharacters = (data: any): Character[] => {
    const bible = data?.storyBible || data
    
    if (bible?.characters && Array.isArray(bible.characters)) {
      return bible.characters.map((char: any, index: number) => ({
        id: char.id || char.name || `character-${index}`,
        name: char.name || char.character || `Character ${index + 1}`,
        role: char.role || char.type || 'Character',
        description: char.description || char.summary || char.details || 'No description available',
        arc: char.arc || char.characterArc || char.development,
        traits: char.traits || char.personality || [],
        backstory: char.backstory || char.background,
        personality: char.personality,
        goals: char.goals || char.motivation,
        conflicts: char.conflicts || char.challenges,
        relationships: char.relationships || []
      }))
    }
    
    return []
  }

  const characters = extractCharacters(storyData)

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-h2 font-bold text-high-contrast elegant-fire">Character Universe</h2>
        <div className="flex gap-2">
          {[
            { mode: 'galaxy', icon: '🌌', label: 'Galaxy View' },
            { mode: 'list', icon: '📋', label: 'List View' },
            { mode: 'relationships', icon: '🕸️', label: 'Relationships' }
          ].map((option) => (
            <button
              key={option.mode}
              onClick={() => setViewMode(option.mode as any)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all touch-target
                ${viewMode === option.mode
                  ? 'bg-ember-gold/20 text-ember-gold border border-ember-gold/30'
                  : 'text-medium-contrast hover:text-high-contrast hover:bg-white/5'
                }
              `}
            >
              <span>{option.icon}</span>
              <span className="hidden sm:inline text-caption">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Character Count & Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        <Card variant="status" className="text-center p-3">
          <div className="text-xl mb-1">👥</div>
          <div className="text-body text-ember-gold font-bold">{characters.length}</div>
          <div className="text-caption text-medium-contrast">Characters</div>
        </Card>
        <Card variant="status" className="text-center p-3">
          <div className="text-xl mb-1">🦸</div>
          <div className="text-body text-ember-gold font-bold">
            {characters.filter(c => c.role?.toLowerCase().includes('protagonist')).length}
          </div>
          <div className="text-caption text-medium-contrast">Protagonists</div>
        </Card>
        <Card variant="status" className="text-center p-3">
          <div className="text-xl mb-1">🦹</div>
          <div className="text-body text-ember-gold font-bold">
            {characters.filter(c => c.role?.toLowerCase().includes('antagonist')).length}
          </div>
          <div className="text-caption text-medium-contrast">Antagonists</div>
        </Card>
        <Card variant="status" className="text-center p-3">
          <div className="text-xl mb-1">🤝</div>
          <div className="text-body text-ember-gold font-bold">
            {characters.filter(c => c.role?.toLowerCase().includes('support')).length}
          </div>
          <div className="text-caption text-medium-contrast">Supporting</div>
        </Card>
        <Card variant="status" className="text-center p-3">
          <div className="text-xl mb-1">📈</div>
          <div className="text-body text-ember-gold font-bold">
            {characters.filter(c => c.arc).length}
          </div>
          <div className="text-caption text-medium-contrast">With Arcs</div>
        </Card>
        <Card variant="status" className="text-center p-3">
          <div className="text-xl mb-1">🔗</div>
          <div className="text-body text-ember-gold font-bold">
            {characters.reduce((sum, c) => sum + (c.relationships?.length || 0), 0)}
          </div>
          <div className="text-caption text-medium-contrast">Connections</div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Character View */}
        <div className="lg:col-span-2">
          {viewMode === 'galaxy' && (
            <CharacterGalaxyView 
              characters={characters}
              selectedCharacter={selectedCharacter}
              onSelectCharacter={setSelectedCharacter}
            />
          )}
          {viewMode === 'list' && (
            <CharacterListView 
              characters={characters}
              onSelectCharacter={setSelectedCharacter}
            />
          )}
          {viewMode === 'relationships' && (
            <CharacterRelationshipView 
              characters={characters}
              selectedCharacter={selectedCharacter}
              onSelectCharacter={setSelectedCharacter}
            />
          )}
        </div>

        {/* Character Detail Panel */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedCharacter ? (
              <CharacterDetailPanel 
                key={selectedCharacter.id}
                character={selectedCharacter}
                onClose={() => setSelectedCharacter(null)}
              />
            ) : (
              <CharacterSelectionPrompt />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// Galaxy visualization of characters
function CharacterGalaxyView({ 
  characters, 
  selectedCharacter, 
  onSelectCharacter 
}: {
  characters: Character[]
  selectedCharacter: Character | null
  onSelectCharacter: (character: Character) => void
}) {
  if (characters.length === 0) {
    return (
      <Card variant="content" className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-h3 text-medium-contrast mb-2">No Characters Found</h3>
          <p className="text-body text-medium-contrast">
            Characters will appear here once your story bible is generated with character profiles.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card variant="content" className="h-96 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
        {/* Character Nodes */}
        {characters.map((character, index) => {
          const angle = (index / characters.length) * 2 * Math.PI
          const radius = Math.min(120, 80 + characters.length * 2)
          const x = Math.cos(angle) * radius + 50
          const y = Math.sin(angle) * radius + 50

          return (
            <motion.button
              key={character.id}
              className={`
                absolute w-16 h-16 rounded-full border-2 
                flex items-center justify-center text-2xl font-bold
                transition-all duration-300 hover:scale-110 touch-target-comfortable
                ${selectedCharacter?.id === character.id
                  ? 'border-ember-gold bg-ember-gold/20 shadow-lg shadow-ember-gold/30 scale-110'
                  : 'border-white/30 bg-white/10 hover:border-white/50'
                }
              `}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => onSelectCharacter(character)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: selectedCharacter?.id === character.id ? 1.1 : 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.95 }}
              title={character.name}
            >
              {getCharacterEmoji(character.role)}
            </motion.button>
          )
        })}

        {/* Center Hub */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <motion.div 
            className="w-20 h-20 rounded-full bg-ember-gold/20 border-2 border-ember-gold flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <span className="text-3xl">🎭</span>
          </motion.div>
        </div>

        {/* Character Names */}
        {characters.map((character, index) => {
          const angle = (index / characters.length) * 2 * Math.PI
          const radius = Math.min(120, 80 + characters.length * 2)
          const nameRadius = radius + 30
          const x = Math.cos(angle) * nameRadius + 50
          const y = Math.sin(angle) * nameRadius + 50

          return (
            <div
              key={`name-${character.id}`}
              className="absolute text-caption text-center pointer-events-none"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
                color: selectedCharacter?.id === character.id ? '#e2c376' : 'rgba(255,255,255,0.7)'
              }}
            >
              {character.name}
            </div>
          )
        })}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-medium-contrast text-caption">
        Click characters to explore their profiles and relationships
      </div>
    </Card>
  )
}

// Character detail panel
function CharacterDetailPanel({ 
  character, 
  onClose 
}: { 
  character: Character
  onClose: () => void 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <Card variant="content" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-h3 text-high-contrast font-bold elegant-fire">{character.name}</h3>
          <button
            onClick={onClose}
            className="text-medium-contrast hover:text-high-contrast transition-colors touch-target"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{getCharacterEmoji(character.role)}</span>
            <div>
              <div className="text-ember-gold text-caption font-medium">Role</div>
              <div className="text-body text-high-contrast">{character.role}</div>
            </div>
          </div>

          <div>
            <label className="text-ember-gold text-caption font-medium block mb-1">Description</label>
            <p className="text-body text-medium-contrast leading-relaxed">
              {character.description}
            </p>
          </div>

          {character.personality && (
            <div>
              <label className="text-ember-gold text-caption font-medium block mb-1">Personality</label>
              <p className="text-body text-medium-contrast leading-relaxed">
                {character.personality}
              </p>
            </div>
          )}

          {character.goals && (
            <div>
              <label className="text-ember-gold text-caption font-medium block mb-1">Goals & Motivation</label>
              <p className="text-body text-medium-contrast leading-relaxed">
                {character.goals}
              </p>
            </div>
          )}

          {character.arc && (
            <div>
              <label className="text-ember-gold text-caption font-medium block mb-1">Character Arc</label>
              <p className="text-body text-medium-contrast leading-relaxed">
                {character.arc}
              </p>
            </div>
          )}

          {character.conflicts && (
            <div>
              <label className="text-ember-gold text-caption font-medium block mb-1">Conflicts</label>
              <p className="text-body text-medium-contrast leading-relaxed">
                {character.conflicts}
              </p>
            </div>
          )}

          {character.traits && Array.isArray(character.traits) && character.traits.length > 0 && (
            <div>
              <label className="text-ember-gold text-caption font-medium block mb-2">Key Traits</label>
              <div className="flex flex-wrap gap-2">
                {character.traits.map((trait: any, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-white/10 rounded text-caption text-medium-contrast"
                  >
                    {typeof trait === 'string' ? trait : String(trait)}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-white/10">
            <button className="w-full burn-button py-2 text-body touch-target-comfortable">
              Edit Character
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function CharacterSelectionPrompt() {
  return (
    <Card variant="content" className="text-center p-6">
      <div className="text-4xl mb-4">👥</div>
      <h3 className="text-h3 text-high-contrast mb-2 elegant-fire">
        Select a Character
      </h3>
      <p className="text-body text-medium-contrast">
        Choose a character from the galaxy or list to view detailed information, relationships, and development arcs.
      </p>
    </Card>
  )
}

// List view for characters
function CharacterListView({ characters, onSelectCharacter }: {
  characters: Character[]
  onSelectCharacter: (character: Character) => void
}) {
  if (characters.length === 0) {
    return (
      <Card variant="content" className="text-center p-8">
        <div className="text-4xl mb-4">👥</div>
        <h3 className="text-h3 text-medium-contrast mb-2">No Characters Found</h3>
        <p className="text-body text-medium-contrast">
          Character profiles will appear here once your story bible contains character information.
        </p>
      </Card>
    )
  }

  return (
    <Card variant="content" className="p-6">
      <div className="space-y-3">
        {characters.map((character: Character, index: number) => (
          <motion.button
            key={character.id}
            className="w-full p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left touch-target-comfortable"
            onClick={() => onSelectCharacter(character)}
            whileHover={{ x: 5 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{getCharacterEmoji(character.role)}</span>
              <div className="flex-1">
                <h4 className="font-medium text-high-contrast text-body elegant-fire">{character.name}</h4>
                <p className="text-caption text-medium-contrast">{character.role}</p>
                {character.description && (
                  <p className="text-caption text-medium-contrast mt-1 line-clamp-2">
                    {character.description.substring(0, 120)}...
                  </p>
                )}
              </div>
              <div className="text-ember-gold text-caption">
                View →
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </Card>
  )
}

function CharacterRelationshipView({ characters, selectedCharacter, onSelectCharacter }: {
  characters: Character[]
  selectedCharacter: Character | null
  onSelectCharacter: (character: Character) => void
}) {
  return (
    <Card variant="content" className="p-6 text-center">
      <div className="text-4xl mb-4">🕸️</div>
      <h3 className="text-h3 text-medium-contrast mb-2">Relationship Map</h3>
      <p className="text-body text-medium-contrast">
        Advanced relationship visualization coming soon. This will show character connections, conflicts, and dynamics.
      </p>
    </Card>
  )
}

// Helper function to get character emoji based on role
function getCharacterEmoji(role: string): string {
  const roleMap: Record<string, string> = {
    'protagonist': '🦸',
    'main character': '🦸',
    'hero': '🦸',
    'antagonist': '🦹',
    'villain': '🦹',
    'enemy': '🦹',
    'mentor': '🧙',
    'teacher': '🧙',
    'guide': '🧙',
    'love interest': '💕',
    'romantic': '💕',
    'sidekick': '🤝',
    'friend': '🤝',
    'ally': '🤝',
    'comic relief': '🎭',
    'funny': '🎭',
    'humor': '🎭',
    'authority': '👑',
    'leader': '👑',
    'boss': '👑',
    'victim': '😰',
    'innocent': '😰',
    'herald': '📢',
    'messenger': '📢',
    'threshold guardian': '🚪',
    'guardian': '🚪',
    'parent': '👨‍👩‍👧‍👦',
    'child': '🧒',
    'family': '👨‍👩‍👧‍👦',
    'supporting': '👤',
    'secondary': '👤'
  }
  
  const lowerRole = role.toLowerCase()
  for (const [key, emoji] of Object.entries(roleMap)) {
    if (lowerRole.includes(key)) {
      return emoji
    }
  }
  
  return '👤'
}
