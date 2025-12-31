/**
 * Investor Materials Types
 * Type definitions for investor materials package structure
 */

import type { 
  CharacterStudyGuide,
  PerformanceReference,
  ThroughLine as ActorThroughLine,
  GOTEAnalysis,
  RelationshipMap as ActorRelationshipMap,
  SceneBreakdown,
  EmotionalBeat,
  PhysicalCharacterWork,
  VoicePatterns,
  MonologuePractice,
  KeyScene,
  OnSetPreparation
} from './actor-materials'

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface GenerateInvestorMaterialsRequest {
  userId: string
  storyBibleId: string
  arcIndex: number
  customization?: {
    whyYou?: string
  }
}

export interface GenerateInvestorMaterialsResponse {
  success: boolean
  package?: InvestorMaterialsPackage
  errors?: string[]
  warnings?: string[]
  error?: string
}

// ============================================================================
// CORE PACKAGE TYPES
// ============================================================================

export interface InvestorMaterialsPackage {
  id: string
  storyBibleId: string
  arcIndex: number
  arcTitle: string
  generatedAt: string
  
  hook: HookSection
  story: StorySection
  pilot: PilotSection
  episodeScripts?: Record<number, PilotSection> // All episode scripts in the arc
  visuals: VisualsSection
  characters: CharactersSection
  depth: DepthSection
  keyScenes: KeyScenesSection
  production: ProductionSection
  marketing: MarketingSection
  characterDepth?: CharacterDepthSection[]
  callToAction: CallToActionSection
  
  materialsStatus: MaterialsStatus
}

export interface MaterialsStatus {
  storyBible: boolean
  episodes: boolean
  preProduction: boolean
  marketing: boolean
  actorMaterials: boolean
}

// ============================================================================
// SECTION TYPES
// ============================================================================

export interface HookSection {
  seriesTitle: string
  logline: string
  genre: string
  theme: string
  synopsis?: string
}

export interface StorySection {
  arcTitle: string
  arcDescription: string
  episodes: EpisodeSummary[]
  transformation: {
    start: string
    end: string
    journey: string
  }
}

export interface EpisodeSummary {
  episodeNumber: number
  title: string
  summary: string
  keyBeat?: string
  emotionalBeat?: string
  scenes?: Array<{
    sceneNumber: number
    title: string
    content: string
  }>
  episodeRundown?: string
}

export interface PilotSection {
  episodeNumber: number
  episodeTitle: string
  fullScript: string
  sceneStructure: SceneStructure
}

export interface SceneStructure {
  totalScenes: number
  totalPages: number
  estimatedRuntime: number
  scenes: SceneStructureItem[]
}

export interface SceneStructureItem {
  sceneNumber: number
  heading: string
  pageCount: number
  synopsis: string
  characters: string[]
}

export interface VisualsSection {
  // Organized by episode → scene structure
  episodes: Record<number, {
    episodeNumber: number
    episodeTitle: string
    scenes: Array<{
      sceneNumber: number
      sceneTitle: string
      frames: StoryboardFrame[] // All storyboard frames per scene
    }>
  }>
  totalFrames: number
  // Legacy flat array for backward compatibility
  storyboardFrames?: StoryboardFrame[]
}

export interface StoryboardFrame {
  frameId?: string
  episodeNumber?: number // Track which episode this frame is from
  sceneNumber: number
  shotNumber: number
  description: string
  cameraAngle: string
  cameraMovement: string
  dialogueSnippet?: string
  scriptContext?: string // Actual script action for this frame (shown in orange)
  imageUrl?: string
  imagePrompt?: string
  visualNotes?: string
  lightingNotes?: string
  frameStatus?: 'draft' | 'revised' | 'final' | string
  // Additional fields from pre-production to fully reflect storyboard tab
  notes?: string // Script-accurate description/notes
  propsInFrame?: string[]
  referenceImages?: string[]
  referenceVideos?: string[] // AI-generated reference videos (VEO 3)
}

export interface CharactersSection {
  mainCharacters: CharacterProfile[]
  relationshipMap: RelationshipMap[]
}

/**
 * Lightweight characters section for main document
 * Detailed data stored in subcollection
 */
export interface CharactersSectionLight {
  mainCharacters: CharacterProfileLight[]
  relationshipMap: RelationshipMap[]
}

// Story Bible 3D Character Data
export interface CharacterPhysiology {
  gender?: string
  appearance?: string
  height?: string
  build?: string
  physicalTraits?: string[]
  health?: string
  defects?: string[]
  heredity?: string
}

export interface CharacterSociology {
  class?: 'working' | 'middle' | 'upper' | 'underclass'
  occupation?: string
  education?: string
  homeLife?: string
  religion?: string
  race?: string
  nationality?: string
  politicalAffiliation?: string
  hobbies?: string[]
  communityStanding?: string
  economicStatus?: string
  familyRelationships?: string[]
}

export interface CharacterPsychology {
  coreValue?: string
  opposingValue?: string
  moralStandpoint?: string
  want?: string
  need?: string
  primaryFlaw?: string
  secondaryFlaws?: string[]
  temperament?: string[]
  attitude?: string
  complexes?: string[]
  ambitions?: string[]
  frustrations?: string[]
  fears?: string[]
  superstitions?: string[]
  likes?: string[]
  dislikes?: string[]
  iq?: number
  abilities?: string[]
  talents?: string[]
  childhood?: string
  trauma?: string[]
  successes?: string[]
}

/**
 * Lightweight character data for main investor materials document
 * Keeps the main document under 1MB by storing only essential info
 */
export interface CharacterProfileLight {
  name: string
  role: string
  age?: string
  background: string // Short background summary
  motivation: string // Short motivation summary
  keyTraits: string[] // Top 3-5 traits only
  // Image generation
  imageUrl?: string
  imagePrompt?: string
  // Flag indicating detailed data is available in subcollection
  hasDetailedData?: boolean
}

/**
 * Detailed character data stored in subcollection
 * Contains all actor materials and Story Bible 3D data
 */
export interface CharacterProfileDetailed {
  name: string
  role: string
  age?: string
  background: string
  motivation: string
  conflicts: string[]
  arc: string
  relationships: string[]
  keyTraits: string[]
  // Image generation
  imageUrl?: string
  imagePrompt?: string
  // Story Bible 3D Data
  physiology?: CharacterPhysiology
  sociology?: CharacterSociology
  psychology?: CharacterPsychology
  
  // Actor Materials - Complete Data
  studyGuide?: CharacterStudyGuide
  performanceReference?: PerformanceReference[]
  throughLine?: ActorThroughLine
  gotAnalysis?: GOTEAnalysis[]
  relationshipMapActor?: ActorRelationshipMap[]  // Renamed to avoid conflict with RelationshipMap
  sceneBreakdowns?: SceneBreakdown[]
  emotionalBeats?: EmotionalBeat[]
  physicalWork?: PhysicalCharacterWork
  voicePatterns?: VoicePatterns
  monologues?: MonologuePractice[]
  keyScenes?: KeyScene[]
  onSetPrep?: OnSetPreparation
  researchSuggestions?: {
    historical?: string[]
    realWorld?: string[]
    cultural?: string[]
    resources?: string[]
  }
  wardrobeNotes?: {
    howItAffects: string
    keyChoices: string[]
    comfortNotes?: string
  }
  memorizationAids?: {
    techniques: string[]
    order: number[]
    tips: string[]
  }
  techniqueFocus?: string
  techniqueExercises?: {
    sceneNumber: number
    exercises: string[]
  }[]
}

/**
 * Full character profile (backwards compatible)
 * Used during generation, then split into light + detailed for storage
 */
export type CharacterProfile = CharacterProfileDetailed

export interface RelationshipMap {
  character1: string
  character2: string
  relationshipType: string
  description: string
  keyMoments: string[]
  evolution: string
}

export interface WorldBuildingLocation {
  name: string
  type: 'campus' | 'neighborhood' | 'home' | 'hangout' | 'institution' | 'hidden' | 'event-space' | 'authority' | 'other'
  description: string
  significance: string
  recurringEvents?: string[]
  conflicts?: string[]
  imageUrl?: string
}

export interface DepthSection {
  world: {
    setting: string
    rules: string[]
    locations: WorldBuildingLocation[]
  }
  livingWorld: {
    backgroundEvents: string
    socialDynamics: string
    economicFactors: string
    politicalUndercurrents: string
    culturalShifts: string
  }
}

export interface KeyScenesSection {
  episode3?: SceneExcerpt
  episode5?: SceneExcerpt
  episode7?: SceneExcerpt
  episode8?: SceneExcerpt
}

export interface SceneExcerpt {
  episodeNumber: number
  episodeTitle: string
  sceneNumber: number
  sceneTitle: string
  excerpt: string
  context: string
  whyItMatters: string
}

export interface ProductionSection {
  budget: BudgetSummary
  locations: LocationSummary[]
  props: PropSummary[]
  casting: CastingSummary
  equipment?: any // EquipmentSection - will be properly typed later
  wardrobe?: any // WardrobeSection - will be properly typed later
  schedule?: any // ScheduleSummary - will be properly typed later
}

export interface BudgetSummary {
  perEpisode: {
    base: number
    optional: number
    total: number
  }
  arcTotal: number
  breakdown: {
    base: {
      extras: number
      props: number
      locations: number
    }
    optional: {
      crew: number
      equipment: number
      postProduction: number
      miscellaneous: number
    }
  }
  analysis?: string
  // EXACT 1:1 REPLICA FIELDS
  totalArcBudget?: {
    total: number
    status: {
      color: string
      label: string
      status: 'excellent' | 'good' | 'warning' | 'over'
    }
    target: {
      min: number
      max: number
      episodeCount: number
    }
    liveEstimate?: {
      total: number
      breakdown: Array<{ label: string; amount: number }>
    }
  }
  baseBudget?: {
    total: number
    extras: number
    props: number
    locations: number
  }
  optionalBudget?: {
    total: number
    crew: Array<{
      id: string
      role: string
      suggestedCost: number
      included: boolean
      necessity: string
      description?: string
      range?: string
    }>
    equipment: Array<{
      id: string
      item: string
      suggestedCost: number
      included: boolean
      necessity: string
      description?: string
      range?: string
    }>
    miscellaneous: Array<{
      id: string
      item: string
      suggestedCost: number
      included: boolean
      necessity: string
      description?: string
      range?: string
    }>
  }
  budgetAnalysis?: {
    baseOnly: number
    withHighlyRecommended: number
    withRecommended: number
    withAll: number
    recommendation: string
  }
  // NEW FIELDS FOR EXACT 1:1 REPLICA
  episodeCount?: number
  tabCosts?: {
    total: number
    breakdown: Array<{ label: string; amount: number }>
  }
  locationCosts?: {
    totalLocationCosts: number
    breakdown: Array<{
      locationName: string
      cost: number
      scenes?: number[]
      episodes?: number[]
    }>
  }
}

export interface LocationSummary {
  name: string
  description: string
  usedIn: string[]
  cost: number
  imageUrl?: string
  address?: string  // NEW: Added for Section 8 requirement
  venueName?: string
  venueType?: string
  episodesUsed?: number[]
  totalCost?: number
  dayRate?: number
  permitCost?: number
  depositAmount?: number
  pros?: string[]
  cons?: string[]
  logistics?: any
}

export interface PropSummary {
  name: string
  description: string
  significance?: string
  usedIn: string[]
  cost: number
  imageUrl?: string
}

export interface CastingSummary {
  characters: CastingCharacter[]
  stats?: {
    totalCast: number
    confirmedCount: number
    leadCount: number
    supportingCount: number
    totalPayroll: number
  }
}

export interface CastingCharacter {
  name: string
  ageRange: string
  description: string
  actorType: string
  references: string[]
}

export interface MarketingSection {
  targetAudience: {
    primary: string
    secondary: string
  }
  keySellingPoints: string[]
  loglines: string[]
  taglines: string[]
  socialMediaStrategy: {
    platforms: string[]
    contentApproach: string
    engagementIdeas?: string[]
  }
  marketingStrategyOverview?: string
  seriesPosterConcept?: string
  seriesTeaserTrailerConcept?: string
  visualTemplates?: string[]
  visualAssets?: {
    seriesPoster?: {
      imageUrl?: string
      prompt?: string
      generatedAt?: string
      source?: string
      promptVersion?: string
      title?: string
      description?: string
    }
    seriesTeaser?: {
      videoUrl?: string
      imageUrl?: string
      thumbnailUrl?: string
      prompt?: string
      duration?: string
      aspectRatio?: string
      generatedAt?: string
      source?: string
      metadata?: any
      title?: string
      description?: string
    }
    platformTemplates?: {
      characterSpotlights?: any[]
      campaignGraphics?: {
        launch?: any[]
        milestones?: any[]
        arcTransitions?: any[]
      }
    }
  }
  ugcStrategy?: {
    actorMarketing?: string[]
    authenticityMaintenance?: string[]
    communityBuilding?: string[]
    containerStrategy?: {
      showProfile?: string
      actorProfile?: string
      permeability?: string
    }
  }
  peerCastingLoop?: {
    strategy?: string
    marketingDeliverables?: string[]
    multiplierEffect?: string
  }
  uniqueValueProposition?: string
  marketingHooks?: {
    seriesHooks?: string[]
    characterHooks?: string[]
    episodeHooks?: string[]
    viralPotentialScenes?: string[]
  }
  platformStrategies?: {
    tiktok?: {
      contentFormat?: string
      postingSchedule?: string
      hashtagStrategy?: string[]
      textOverlayStrategy?: string
    }
    instagram?: {
      contentFormat?: string
      postingSchedule?: string
      gridAesthetic?: string
      broadcastChannelStrategy?: string
      hashtagStrategy?: string[]
    }
    youtube?: {
      contentFormat?: string
      seoTitleStrategy?: string
      relatedVideoStrategy?: string
      longevityStrategy?: string
    }
  }
  arcLaunchStrategy?: {
    preLaunch?: string[]
    launch?: string[]
    postLaunch?: string[]
  }
  crossEpisodeThemes?: string[]
  visualStyle?: {
    colorPalette: string
    imageryThemes: string
    posterConcepts: string[]
  }
  audioStrategy?: {
    musicGenre: string
    soundDesign: string
    voiceoverTone: string
  }
  // Three-level marketing structure
  seriesLevel?: MarketingSection
  arcLevel?: MarketingSection
  episodeLevel?: Record<number, EpisodeMarketingData>
}

// Episode-specific marketing data structure (1:1 with generated data)
export interface EpisodeMarketingData {
  episodeNumber?: number
  episodeTitle?: string
  marketingHooks?: string[]
  viralPotentialScenes?: Array<{
    sceneNumber: number
    timestamp: string
    hook: string
    platform: string
    suggestedCaption?: string
    suggestedHashtags?: string[]
  }>
  platformContent?: {
    tiktok?: { captions: string[]; hashtags: string[] }
    instagram?: { captions: string[]; hashtags: string[] }
    youtube?: { captions: string[]; hashtags: string[] }
  }
  readyToUsePosts?: Array<{
    platform: string
    caption: string
    hashtags: string[]
  }>
  thumbnail?: {
    imageUrl: string
    prompt: string
    generatedAt: string
    source: 'gemini' | 'azure' | 'mock'
    promptVersion?: string
    frameId?: string
    sceneNumber?: number
  }
  // Also include standard marketing fields if present
  targetAudience?: {
    primary: string
    secondary: string
  }
  keySellingPoints?: string[]
  loglines?: string[]
  taglines?: string[]
  socialMediaStrategy?: {
    platforms: string[]
    contentApproach: string
    engagementIdeas?: string[]
  }
  visualStyle?: {
    colorPalette: string
    imageryThemes: string
    posterConcepts: string[]
  }
  audioStrategy?: {
    musicGenre: string
    soundDesign: string
    voiceoverTone: string
  }
}

export interface CharacterDepthSection {
  characterName: string
  studyGuide?: {
    throughLine: string
    superObjective: string
    keyScenes: string[]
  }
  performanceReference?: {
    references: string[]
    notes: string
  }
}

export interface CallToActionSection {
  whyYou?: string
  nextSteps: string[]
}

// ============================================================================
// SHARED TYPES
// ============================================================================

export interface SharedInvestorMaterials {
  linkId: string
  investorPackage: InvestorMaterialsPackage
  ownerId?: string
  ownerName?: string
  createdAt: string
  expiresAt?: string
  viewCount: number
  isActive: boolean
}

