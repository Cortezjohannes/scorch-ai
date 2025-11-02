/**
 * Relationship Types
 */

export type RelationshipType = 'allies' | 'enemies' | 'romantic' | 'family' | 'rivals' | 'neutral' | 'mentor-student' | 'professional'

export interface RelationshipEvolution {
  episode: number
  change: string
  context?: string
  timestamp?: Date
}

export interface CharacterRelationship {
  id?: string
  characters: [string, string] // Two character names
  type: RelationshipType
  strength: number // 1-10
  description: string
  evolution: RelationshipEvolution[]
  createdAt?: Date
  updatedAt?: Date
  source: 'auto' | 'manual' | 'episode_reflection'
}

export interface RelationshipNetwork {
  characterRelations: CharacterRelationship[]
  lastUpdated?: Date
}

export interface RelationshipSuggestion {
  characters: [string, string]
  suggestedType: RelationshipType
  reasoning: string
  confidence: number // 0-100
  basedOnEpisodes: number[]
}


