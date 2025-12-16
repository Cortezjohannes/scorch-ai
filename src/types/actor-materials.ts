/**
 * Actor Preparation Materials Types
 * Types for actor-friendly preparation materials (not technical story bible)
 */

export type ActingTechnique =
  // Psychological Techniques
  | 'stanislavski'
  | 'meisner'
  | 'method-acting'
  | 'adler'
  | 'hagen'
  // Physical Techniques
  | 'chekhov'
  | 'laban'
  | 'alexander'
  | 'viewpoints'
  | 'suzuki'
  | 'biomechanics'
  | 'butoh'
  // Voice Techniques
  | 'linklater'
  | 'fitzmaurice'
  | 'roy-hart'
  // Practical Techniques
  | 'practical-aesthetics'
  | 'spolin'
  // Classical & Style
  | 'classical'
  | 'brechtian'
  | 'grotowski'
  // Improvisational
  | 'improv'
  | 'spolin-games'

export interface PerformanceReference {
  characterName: string // e.g., "Tony Soprano"
  source: string // e.g., "The Sopranos"
  reason: string // Why this comparison works
  sceneExample?: string // Specific scene to watch
  keySimilarities: string[] // 2-3 bullet points max
}

export interface GOTEAnalysis {
  sceneNumber: number
  episodeNumber: number
  goal: string // One sentence max
  obstacle: string // One sentence max
  tactics: string[] // 2-3 tactics, one sentence each
  expectation: string // One sentence max
  techniqueNotes?: string // Technique-specific notes if technique selected
}

export interface ThroughLine {
  superObjective: string // One sentence summary (bold)
  explanation: string // Max 2 sentences
  keyScenes: number[] // Scene numbers it's most relevant to
}

export interface RelationshipMap {
  characterName: string
  relationshipType: 'ally' | 'enemy' | 'love' | 'family' | 'mentor' | 'rival' | 'neutral' | 'complex'
  description: string // One sentence
  keyMoments: {
    episodeNumber: number
    sceneNumber: number
    moment: string // One sentence
  }[]
  evolution: string // How relationship changes through arc (max 2 sentences)
}

export interface SceneBreakdown {
  sceneNumber: number
  episodeNumber: number
  objective: string // One sentence
  emotionalState: string // One word or short phrase
  tactics: string[] // Max 3 tactics
  keyLines: string[] // Actual lines from script (max 3)
  subtext?: string // One sentence
  techniqueNotes?: string // Technique-specific notes
}

export interface EmotionalBeat {
  episodeNumber: number
  sceneNumber?: number
  emotion: string // e.g., "angry", "sad", "happy", "anxious"
  intensity: number // 1-10
  description: string // One sentence
}

export interface MonologuePractice {
  sceneNumber: number
  episodeNumber: number
  text: string // Actual monologue text
  emotionalBeats: {
    line: string
    emotion: string
  }[]
  practiceNotes: string[] // Max 4 tips
  performanceTips: string[] // Max 3 tips
}

export interface CharacterStudyGuide {
  background: string // Max 2 sentences
  motivations: string[] // Max 3 bullet points
  relationships: {
    characterName: string
    relationship: string // One sentence
  }[]
  characterArc: string // Max 2 sentences
  internalConflicts: string[] // Max 3 bullet points
}

export interface PhysicalCharacterWork {
  bodyLanguage: string[] // Max 5 action items
  movement: string[] // Max 5 action items
  posture: string[] // Max 5 action items
  transformationNotes?: string // If character physically changes
}

export interface VoicePatterns {
  vocabulary: string[] // Key words/phrases (max 5)
  rhythm: string // One sentence
  accent?: string // One sentence
  keyPhrases: string[] // Actual lines that show voice (max 5)
  verbalTics?: string[] // Max 3
}

export interface KeyScene {
  sceneNumber: number
  episodeNumber: number
  importance: number // 1-5 stars
  whyItMatters: string[] // Max 2 bullets
  whatToFocusOn: string[] // Max 2 bullets
  quickPrepTips: string[] // Max 3 tips
}

export interface OnSetPreparation {
  preScene: string[] // Max 5 items
  warmUp: string[] // Max 5 items
  emotionalPrep: string[] // Max 5 items
  mentalChecklist: string[] // Max 5 items
}

export interface CharacterMaterials {
  characterName: string
  characterId: string
  
  // Core materials
  studyGuide: CharacterStudyGuide
  performanceReference: PerformanceReference[] // 2-3 max
  throughLine: ThroughLine
  gotAnalysis: GOTEAnalysis[] // Per scene
  relationshipMap: RelationshipMap[]
  sceneBreakdowns: SceneBreakdown[]
  emotionalBeats: EmotionalBeat[]
  
  // Physical & Voice
  physicalWork: PhysicalCharacterWork
  voicePatterns: VoicePatterns
  
  // Practice & Preparation
  monologues: MonologuePractice[]
  keyScenes: KeyScene[]
  onSetPrep: OnSetPreparation
  
  // Additional materials
  researchSuggestions?: {
    historical?: string[]
    realWorld?: string[]
    cultural?: string[]
    resources?: string[] // Books/films
  }
  wardrobeNotes?: {
    howItAffects: string // Max 2 sentences
    keyChoices: string[] // Max 3
    comfortNotes?: string // Max 1 sentence
  }
  memorizationAids?: {
    techniques: string[] // Max 5
    order: number[] // Scene numbers in memorization order
    tips: string[] // Max 5
  }
  
  // Technique-specific (if technique selected)
  techniqueFocus?: ActingTechnique
  techniqueExercises?: {
    sceneNumber: number
    exercises: string[] // Max 3 per scene
  }[]
}

export interface ActorPreparationMaterials {
  id: string
  userId: string
  storyBibleId: string
  arcIndex: number
  arcTitle: string
  
  // All characters in the arc
  characters: CharacterMaterials[]
  
  // Generation metadata
  technique?: ActingTechnique // Technique used for generation
  generatedAt: number
  lastUpdated: number
  
  // Access control
  shareLinkId?: string
  accessList: string[] // User IDs or emails with access
}





