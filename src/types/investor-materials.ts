/**
 * Investor Materials Types
 * Type definitions for investor materials package structure
 */

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

export interface CharacterProfile {
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
  // Actor materials enrichment
  throughLine?: {
    superObjective: string
    explanation: string
  }
  performanceReference?: Array<{
    characterName: string
    source: string
    reason: string
  }>
  physicalWork?: {
    posture: string
    movement: string
    gestures: string[]
  }
  voicePatterns?: {
    speechPattern: string
    vocalRange: string
    emotionalRange: string[]
  }
  keyScenes?: Array<{
    sceneNumber: number
    objective: string
    emotionalState: string
  }>
}

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

