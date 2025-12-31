/**
 * Unified Character Creation System Types
 * Supports 3 complexity modes: minimal, balanced, detailed
 */

export type CharacterComplexity = 'minimal' | 'balanced' | 'detailed'

export type CharacterRole =
  | 'protagonist'
  | 'antagonist'
  | 'secondary-antagonist'
  | 'love-interest'
  | 'mentor'
  | 'ally'
  | 'rival'
  | 'family'
  | 'friend'
  | 'authority-figure'
  | 'comic-relief'
  | 'wildcard'
  | 'ensemble'
  | 'catalyst'
  | 'mirror'
  | 'threshold'

// Core character data (all modes)
export interface CharacterCore {
  id: string
  name: string
  role: CharacterRole
  complexity: CharacterComplexity
}

// Basic info (all modes)
export interface CharacterBasic {
  description: string
  archetype?: string
  premiseFunction?: string
}

// Simplified physiology for balanced mode
export interface SimplifiedPhysiology {
  age?: string
  gender: string
  appearance: string
  build?: string
  health?: string
  keyTraits: string[]
}

// Core psychology for balanced mode
export interface CorePsychology {
  coreValue: string
  opposingValue?: string
  moralStandpoint?: string
  want: string
  need: string
  primaryFlaw: string
  secondaryFlaws?: string[]
  temperament: string[]
  attitude?: string
  keyFears: string[]
  keyStrengths: string[]
}

// Basic voice profile for balanced mode
export interface BasicVoice {
  speechPattern: string
  vocabulary?: string
  quirks?: string[]
}

// Balanced mode data (balanced + detailed)
export interface CharacterBalanced {
  physiology: SimplifiedPhysiology
  psychology: CorePsychology
  backstory: string
  voiceProfile: BasicVoice
}

// Full 3D character data (detailed mode only)
export interface CharacterDetailed {
  fullPhysiology: any // From Character3D['physiology']
  fullSociology: any // From Character3D['sociology']
  fullPsychology: any // From Character3D['psychology']
  characterEvolution?: any[]
  relationships?: any[]
}

// Unified character model supporting all 3 modes
export interface UnifiedCharacter {
  // Core (required for all modes)
  id: string
  name: string
  role: CharacterRole
  complexity: CharacterComplexity

  // Basic (all modes)
  basic: CharacterBasic

  // Balanced+ (balanced & detailed)
  balanced?: CharacterBalanced

  // Detailed only (detailed mode)
  detailed?: CharacterDetailed

  // Metadata
  createdAt: string
  updatedAt: string
  aiGenerated: boolean
  lastEditedBy?: 'user' | 'ai'
}

// Generation options
export interface CharacterGenerationOptions {
  yoloMode?: boolean
  aiAssist?: boolean
  referenceCharacters?: string[]
  storyContext?: any // StoryBible
}

// Generation result
export interface CharacterGenerationResult {
  character: UnifiedCharacter
  confidence?: number
  reasoning?: string
}

// Mode selection info for UI
export interface CharacterModeInfo {
  id: CharacterComplexity
  title: string
  subtitle: string
  description: string
  timeEstimate: string
  recommended?: boolean
  useCase: string
  example: string
  fields: string[]
}

// Form validation rules by mode
export interface CharacterValidationRules {
  requiredFields: string[]
  recommendedFields: string[]
  optionalFields: string[]
}

// Character upgrade options
export type CharacterUpgradeDirection = 'minimal-to-balanced' | 'balanced-to-detailed'

export interface CharacterUpgradeResult {
  success: boolean
  character: UnifiedCharacter
  changes: string[]
  error?: string
}