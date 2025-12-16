/**
 * Pre-Production System Types
 * Comprehensive type definitions for micro-budget short-form web series production
 */

// ============================================================================
// SHARED TYPES
// ============================================================================

export type StatusType = 
  | 'not-started'
  | 'in-progress'
  | 'completed'
  | 'blocked'
  | 'cancelled'

export type PriorityType = 'critical' | 'high' | 'medium' | 'low'

export type BudgetStatus = 'estimated' | 'confirmed' | 'paid'

export interface Comment {
  id: string
  userId: string
  userName: string
  content: string
  timestamp: number
  mentions?: string[] // User IDs mentioned
  resolved?: boolean
}

export interface Collaborator {
  userId: string
  name: string
  email: string
  role: 'owner' | 'crew' | 'viewer'
  avatar?: string
}

// ============================================================================
// TAB 1: SCRIPT BREAKDOWN
// ============================================================================

export interface ScriptBreakdownCharacter {
  name: string
  lineCount: number
  importance: 'lead' | 'supporting' | 'background'
  entranceBeat?: string
  exitBeat?: string
  emotionalBeat?: string
  goal?: string
  conflict?: string
  stakes?: string
  continuityNotes?: string
  returningFromPrevScene?: boolean
}

export interface ScriptBreakdownProp {
  item: string
  importance: 'hero' | 'secondary' | 'background'
  source: 'buy' | 'rent' | 'borrow' | 'actor-owned'
  estimatedCost: number
  isCriticalForStory?: boolean
  reusabilityAcrossScenes?: number[]
  sourcingNotes?: string
  rentDays?: number
}

export interface ScriptBreakdownScene {
  id: string
  sceneNumber: number
  sceneTitle: string
  location: string
  timeOfDay: 'DAY' | 'NIGHT' | 'SUNRISE' | 'SUNSET' | 'MAGIC_HOUR'
  estimatedShootTime: number // minutes
  characters: ScriptBreakdownCharacter[]
  props: ScriptBreakdownProp[]
  specialRequirements: string[]
  budgetImpact: number // dollars
  budgetDetails?: {
    locationCost?: number
    propCost?: number
    extrasCost?: number
    specialEqCost?: number
    contingency?: number
    savingsTips?: string[]
    assumptions?: string[]
  }
  logistics?: {
    nightShoot?: boolean
    stunts?: boolean
    vfx?: boolean
    crowdSize?: number
    vehicle?: string
    childActor?: boolean
    animal?: boolean
    fxMakeup?: boolean
    companyMoveRequired?: boolean
    weatherRisk?: string
    timePressure?: 'low' | 'medium' | 'high'
  }
  coverage?: {
    suggestedSetupCount?: number
    complexity?: 'simple' | 'moderate' | 'complex'
    blockingNotes?: string
    continuityRisks?: string[]
    altLocation?: string
  }
  continuity?: {
    keyPropsCarried?: string[]
    wardrobeNotes?: string
    reusabilityAcrossScenes?: number[]
  }
  warnings?: string[]
  status: StatusType
  notes: string
  comments: Comment[]
  linkedEpisode: number
  linkedSceneContent?: string // Actual scene content from workspace
}

export interface ScriptBreakdownData {
  episodeNumber: number
  episodeTitle: string
  totalScenes: number
  totalEstimatedTime: number // minutes
  totalBudgetImpact: number
  scenes: ScriptBreakdownScene[]
  lastUpdated: number
  updatedBy: string
  schemaVersion?: string
  warnings?: string[]
}

// ============================================================================
// TAB 1B: SCRIPT ANALYSIS (NEW)
// ============================================================================

export interface ScriptAnalysisScene {
  sceneNumber: number
  sceneTitle: string
  location: string
  timeOfDay: 'DAY' | 'NIGHT' | 'SUNRISE' | 'SUNSET' | 'MAGIC_HOUR'
  summary: string
  relevanceToPlot: string
  characterArcsAffected: string[]
  emotionalTone: string
  pacingRole: 'setup' | 'complication' | 'climax' | 'denouement' | 'bridge'
  stakesSummary: string
  foreshadowingOrCallBacks: string[]
  openQuestions: string[]
  continuityDependencies: string[]
  keyPropsAndSymbols: string[]
  themeTieIn: string
  audienceTakeaway: string
  marketingHook?: string
}

export interface ScriptAnalysisData {
  episodeNumber: number
  episodeTitle: string
  synopsis?: string
  scenes: ScriptAnalysisScene[]
  beatSheet?: string[]
  arcProgressions?: Array<{
    character: string
    arc: string
    keyMoments: string[]
  }>
  themesHeatmap?: Array<{
    theme: string
    scenes: number[]
  }>
  lastUpdated: number
  updatedBy: string
  schemaVersion?: string
}

// ============================================================================
// TAB 2: SHOOTING SCHEDULE
// ============================================================================

// Scene reference with episode context (for cross-episode scheduling)
export interface SceneReference {
  episodeNumber: number
  sceneNumber: number
  sceneTitle: string
  estimatedDuration: number // minutes
  priority: 'must-have' | 'nice-to-have' | 'optional'
  location?: string
  timeOfDay?: string
}

// Cast reference with availability
export interface CastReference {
  characterName: string
  actorName?: string
  availability?: AvailabilityWindow[]
  isAvailable: boolean // For this specific shoot day
}

// Actor availability tracking
export interface AvailabilityWindow {
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'all-day'
  notes?: string
}

export interface ShootingDay {
  dayNumber: number
  date?: string // YYYY-MM-DD
  location: string
  callTime: string // HH:MM
  estimatedWrapTime: string // HH:MM
  scenes: SceneReference[] // Changed to support cross-episode
  castRequired: CastReference[]
  crewRequired: string[]
  equipmentRequired: string[]
  specialNotes: string
  weatherContingency?: string
  status: 'scheduled' | 'confirmed' | 'shot' | 'postponed'
  actualWrapTime?: string // HH:MM (filled after shoot)
  setupNotes?: string // Camera/lighting setup details
  comments: Comment[]
  // Location metadata from Locations tab
  locationId?: string // canonicalLocationId from ArcLocationGroup
  venueId?: string // selectedSuggestionId
  venueName?: string // from selected ShootingLocationSuggestion
  venueAddress?: string // from selected suggestion
  permitRequired?: boolean
  insuranceRequired?: boolean
  locationCost?: number // dayRate + permitCost + depositAmount
}

export interface ShootingScheduleData {
  episodeNumber?: number // Optional for cross-episode schedules
  episodeNumbers?: number[] // For cross-episode schedules
  episodeTitle?: string
  schedulingMode: 'single-episode' | 'cross-episode'
  optimizationPriority: 'location' | 'cast' | 'balanced'
  totalShootDays: number
  startDate?: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD
  days: ShootingDay[]
  restDays: number[] // Day numbers that are rest days
  rehearsals: RehearsalSession[] // Unified with schedule
  lastUpdated: number
  updatedBy: string
}

// ============================================================================
// TAB 3: SHOT LIST
// ============================================================================

export interface Shot {
  id: string
  shotNumber: string // e.g., "1A", "2B"
  sceneNumber: number
  description: string
  cameraAngle: 'wide' | 'medium' | 'close-up' | 'extreme-close-up' | 'over-shoulder' | 'pov' | 'dutch'
  cameraMovement: 'static' | 'pan' | 'tilt' | 'dolly' | 'tracking' | 'handheld' | 'steadicam' | 'crane'
  lensRecommendation?: string // e.g., "50mm", "24-70mm"
  durationEstimate: number // seconds
  priority: 'must-have' | 'nice-to-have' | 'optional'
  fpsCameraFrameRate?: number // e.g., 24, 30, 60, 120 for slow-mo
  notes: string
  status: 'planned' | 'got-it' | 'need-pickup' | 'cut'
  shootDay?: number
  actorInstructions?: string // Performance and emotional beats
  cameraCrewInstructions?: string // Camera team setup and execution notes
  lightingSetup?: string // Key/fill/rim, motivation, gear
  audioRequirements?: string // Dialogue cues, mic needs, ambience to capture
  continuityNotes?: string // Wardrobe/props/positioning continuity
  blockingDescription?: string // Text blocking reference for actors
  storyboardFrameId?: string // Reference to storyboard frame for this shot
  setupGroup?: string // Grouping label for batching setups
  estimatedSetupTime?: number // Minutes to prep this shot/setup
  comments: Comment[]
}

export interface ShotListScene {
  sceneNumber: number
  sceneTitle: string
  location: string
  shots: Shot[]
  totalShots: number
  completedShots: number
}

export interface ShotListData {
  episodeNumber: number
  episodeTitle: string
  totalShots: number
  completedShots: number
  scenes: ShotListScene[]
  lastUpdated: number
  updatedBy: string
}

// ============================================================================
// TAB 4: BUDGET TRACKER
// ============================================================================

export interface BudgetLineItem {
  id: string
  category: 
    | 'pre-production'
    | 'production'
    | 'props-wardrobe'
    | 'locations'
    | 'equipment'
    | 'cast'
    | 'crew'
    | 'post-production'
    | 'marketing'
    | 'contingency'
    | 'other'
  item: string
  description: string
  estimatedCost: number
  actualCost?: number
  status: BudgetStatus
  vendor?: string
  dueDate?: string // YYYY-MM-DD
  paidDate?: string // YYYY-MM-DD
  notes: string
  comments: Comment[]
}

export interface BudgetCategory {
  category: string
  totalEstimated: number
  totalActual: number
  items: BudgetLineItem[]
}

export interface BudgetTrackerData {
  episodeNumber: number
  episodeTitle: string
  targetBudget: number // User's target budget
  totalEstimated: number
  totalActual: number
  contingencyPercentage: number // e.g., 15 for 15%
  categories: BudgetCategory[]
  lastUpdated: number
  updatedBy: string
  fundDeploymentRequests?: FundDeploymentRequest[]
  totalRequested?: number
  totalApproved?: number
}

export interface FundDeploymentRequest {
  id: string
  requestedAmount: number
  requestedDate: string // YYYY-MM-DD
  purpose: string
  breakdown: Array<{
    category: string
    amount: number
    description?: string
    justification?: string
  }>
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  submittedAt?: number
  approvedAt?: number
  rejectedAt?: number
  comments: Comment[]
  notes?: string
}

// ============================================================================
// TAB 5: LOCATIONS
// ============================================================================

export interface LocationPermit {
  required: boolean
  cost: number
  status: 'not-needed' | 'pending' | 'obtained'
  expirationDate?: string // YYYY-MM-DD
  notes: string
}

export interface LocationScoutingReport {
  technical: {
    powerAccess: boolean
    powerOutlets: number
    maxPowerLoad?: string // e.g., "100A", "15kW"
    lighting: 'excellent' | 'good' | 'adequate' | 'poor' | 'requires-setup'
    naturalLight: boolean
    acoustics: 'quiet' | 'moderate' | 'noisy'
    noiseIssues: string[]
    cellSignal: 'excellent' | 'good' | 'fair' | 'poor'
    wifiAvailable: boolean
  }
  logistics: {
    parkingAvailable: boolean
  parkingSpaces?: number
    parkingCost?: number
    parkingNotes?: string
    loadingAccess: 'easy' | 'moderate' | 'difficult'
    elevatorAccess: boolean
    stairsOnly: boolean
    restroomAccess: boolean
    restroomCount?: number
    nearbyFood: boolean
    nearbyFoodOptions?: string[]
  }
  space: {
    squareFootage?: number
    ceilingHeight?: number // feet
    floorType?: string
    wallColor?: string
    windowCount?: number
    spaceFlexibility: 'high' | 'moderate' | 'limited'
    furnitureIncluded: boolean
    canRedecorate: boolean
  }
  permits: {
    permitRequired: boolean
    permitType?: string
    permitCost?: number
    permitProcessingDays?: number
    permitContactInfo?: string
    restrictedHours?: string
    maxCrewSize?: number
    insuranceAmount?: string
    securityRequired: boolean
    securityCost?: number
  }
  restrictions: {
    noiseRestrictions: boolean
    timeRestrictions: string[]
    equipmentRestrictions: string[]
    otherRestrictions: string[]
  }
  scoutNotes: string
  scoutedBy?: string
  scoutedDate?: number
  recommendationLevel: 'highly-recommended' | 'recommended' | 'acceptable' | 'not-recommended'
  weather?: {
    weatherDependent: boolean
    rainBackupPlan?: string
    shadedAreas: boolean
    directSunIssues?: string
  }
}

// Scene reference for arc-level locations
export interface LocationSceneReference {
  episodeNumber: number
  sceneNumber: number
}

export interface Location {
  id: string
  name: string
  address: string
  type?: 'interior' | 'exterior' | 'both'
  scenes: LocationSceneReference[] // Episode-scene pairs using this location (arc-level)
  scenesLegacy?: number[] // Legacy support for episode-level locations (for migration)
  requirements?: string[]
  
  // Legacy fields (kept for backward compatibility)
  contactPerson?: string
  contactPhone?: string
  contactEmail?: string
  permitInfo?: LocationPermit
  availableDays?: string[] // YYYY-MM-DD
  availableHours?: string // e.g., "9am-5pm"
  weatherConsiderations?: string
  backupLocation?: string
  crewNotes?: string
  
  // Enhanced contact information
  contact?: string
  phone?: string
  email?: string
  
  // Enhanced sourcing metadata
  sourcing?: 'airbnb' | 'peerspace' | 'giggster' | 'public-space' | 'actor-owned' | 'rental' | 'other'
  sourcingUrl?: string // Link to Airbnb listing, etc.
  listingId?: string // External platform listing ID
  
  // Financial
  cost: number // Daily rental/fee
  permitCost?: number // Separate permit cost
  insuranceRequired?: boolean
  depositAmount?: number
  
  // Availability & booking
  status: 'scouted' | 'contacted' | 'quoted' | 'booked' | 'confirmed'
  secured?: boolean
  availability?: string[] // Date strings
  bookingReference?: string
  
  // Full scouting report (supports both new simplified and legacy formats)
  scoutingReport?: LocationScoutingReport
  
  // Legacy fields (kept for backward compatibility)
  powerAccess?: boolean
  parkingAvailable?: boolean
  restroomAccess?: boolean
  
  // Metadata
  photos?: string[] // URLs or file paths (legacy)
  imageUrls?: string[] // Photos/videos (new)
  notes?: string
  comments?: Comment[]
  
  // Location reuse tracking
  recurringLocationKey?: string // Normalized key for matching (e.g., "jasons_apartment")
  originalEpisode?: number // First episode this location was used
  reusedFromLocationId?: string // If reused, reference to original location
}

export interface LocationOption {
  id: string
  sceneNumbers: number[]  // Scene numbers (within episode) - for backward compatibility
  sceneReferences?: LocationSceneReference[]  // Episode-scene pairs (for arc-level)
  name: string
  description: string
  type: 'interior' | 'exterior' | 'both'
  estimatedCost: number
  pros: string[]  // Array of advantages
  cons: string[]  // Array of challenges
  logistics: {
    parkingAvailable: boolean
    powerAccess: boolean
    restroomAccess: boolean
    permitRequired: boolean
    permitCost?: number
    notes: string
  }
  sourcing: 'airbnb' | 'peerspace' | 'giggster' | 'public-space' | 'actor-owned' | 'rental' | 'other'
  sourcingPlatform?: string // Platform suggestion text
  address?: string  // Example/generic address
  scoutingReport?: LocationScoutingReport // Supports both simplified and legacy formats
  status: 'suggested' | 'selected' | 'rejected'
  selected: boolean  // User has selected this option
  
  // Location reuse tracking
  reusedFromEpisode?: number // If this is a reused location, which episode it came from
  reusedFromLocationId?: string // Reference to original location
  isReuse?: boolean // Flag for UI display
}

export interface LocationOptionsData {
  // Episode-level (legacy)
  episodeNumber?: number
  episodeTitle?: string
  // Arc-level
  arcIndex?: number
  episodeNumbers?: number[]
  sceneRequirements: {
    episodeNumber: number  // Episode this scene belongs to (required for arc-level)
    sceneNumber: number
    sceneTitle: string
    locationType: 'INT' | 'EXT'
    timeOfDay: string
    options: LocationOption[]  // 2-3 options per scene
  }[]
  lastUpdated: number
  generated: true
  locationPreference?: 'story-based' | 'user-based' // New: Choose location source
}

export interface LocationsData {
  // Episode-level (legacy - for backward compatibility)
  episodeNumber?: number
  episodeTitle?: string
  // Arc-level
  arcIndex?: number
  episodeNumbers?: number[]
  totalLocations: number
  locations: Location[]
  lastUpdated: number
  updatedBy: string
}

// Series-wide location usage tracking
export interface SeriesLocationUsage {
  locationId: string
  locationName: string
  locationAddress: string
  baseLocation: Location
  episodesUsed: Array<{
    episodeNumber: number
    episodeTitle: string
    sceneNumbers: number[]
    sceneCount: number
    shootDays: number[]
  }>
  totalRentalCost: number
  costPerEpisode: number
  savingsFromReuse: number
  totalScenes: number
  totalEpisodes: number
  totalShootDays: number
  firstUsedEpisode: number
  lastUsedEpisode: number
}

// ============================================================================
// ARC-LEVEL LOCATION GENERATION TYPES
// ============================================================================

// Sub-location within a parent location group
export interface SubLocation {
  id: string
  name: string // e.g., "Loft", "Kitchen"
  fullName: string // e.g., "Greenlit HQ - Loft"
  type: 'interior' | 'exterior' | 'both'
  sceneReferences: LocationSceneReference[] // Which episodes/scenes use this sub-location
  totalScenes: number
}

// Real-world shooting location suggestion
export interface ShootingLocationSuggestion {
  id: string
  venueName: string // e.g., "Los Angeles Public Library"
  venueType: string // e.g., "Public Space", "Office Building"
  address: string
  estimatedCost: number
  pros: string[]
  cons: string[]
  logistics: {
    parking: boolean
    power: boolean
    restrooms: boolean
    permitRequired: boolean
    permitCost?: number
    notes: string
  }
  sourcing: 'airbnb' | 'peerspace' | 'giggster' | 'public-space' | 'rental' | 'specific-venue' | 'other'
  searchGuidance?: string // e.g., "Search Peerspace for 'modern loft' in LA"
  specificVenueUrl?: string // If suggesting actual venue
  isPreferred: boolean // User selection
  permitCost?: number
  insuranceRequired?: boolean
  depositAmount?: number
  costBreakdown?: {
    dayRate: number
    permitCost?: number
    insuranceRequired?: boolean
    depositAmount?: number
    notes?: string
  }
}

// Episode usage for a location group
export interface EpisodeUsage {
  episodeNumber: number
  episodeTitle: string
  sceneNumbers: number[]
  sceneCount: number
  subLocationIds: string[] // Which sub-locations are used in this episode
}

// Arc-level location group with sub-locations and shooting suggestions
export interface ArcLocationGroup {
  id: string
  parentLocationName: string // e.g., "Greenlit HQ"
  type: 'interior' | 'exterior' | 'both'
  subLocations: SubLocation[] // e.g., "Loft", "Kitchen", etc.
  shootingLocationSuggestions: ShootingLocationSuggestion[] // 2-3 real-world venue options
  episodeUsage: EpisodeUsage[] // Which episodes use this location
  totalScenes: number
  totalEpisodes: number
  storyBibleReference?: string // Link to story bible location name
  firstUsedEpisode: number
  lastUsedEpisode: number
  // Optional fields for rebuilt flow
  canonicalLocationId?: string
  confidence?: number
  episodesUsed?: number[]
  scenesUsed?: number[]
  timeOfDay?: string[]
  selectedSuggestionId?: string
  costEstimate?: {
    dayRate: number
    permitCost?: number
    insuranceRequired?: boolean
    depositAmount?: number
    total?: number
  }
  status?: 'scouted' | 'contacted' | 'quoted' | 'booked' | 'confirmed'
  notes?: string
  aiProvider?: 'azure' | 'gemini'
  aiModel?: string
  generationError?: string
}

// Arc-level locations data structure
export interface ArcLocationsData {
  arcIndex: number
  episodeNumbers: number[]
  locationGroups: ArcLocationGroup[]
  totalLocations: number
  lastUpdated: number
  generated: boolean
  generatedBy?: string
  costRollup?: {
    perLocation: Array<{
      locationId: string
      parentLocationName: string
      selectedSuggestionId?: string
      dayRate: number
      permitCost?: number
      insuranceRequired?: boolean
      depositAmount?: number
      total: number
    }>
    arcTotal: number
  }
}

// ============================================================================
// TAB 6: PROPS & WARDROBE
// ============================================================================

export interface PropItem {
  id: string
  type: 'prop' | 'wardrobe'
  name: string
  description: string
  scenes: number[] // Scene numbers where used
  importance: 'hero' | 'secondary' | 'background'
  source: 'buy' | 'rent' | 'borrow' | 'actor-owned' | 'diy'
  estimatedCost: number
  actualCost?: number
  vendor?: string
  procurementStatus: 'needed' | 'sourced' | 'obtained' | 'packed'
  responsiblePerson?: string
  characterAssociated?: string // For wardrobe
  referencePhotos: string[] // URLs or file paths
  notes: string
  comments: Comment[]
}

export interface PropsWardrobeData {
  episodeNumber: number
  episodeTitle: string
  totalItems: number
  obtainedItems: number
  totalCost: number
  props: PropItem[]
  wardrobe: PropItem[]
  questionnaireAnswers?: Record<string, any> // Answers to contextual questionnaire
  lastUpdated: number
  updatedBy: string
}

// Arc-level props/wardrobe data
export interface ArcPropsWardrobeData {
  arcTitle: string
  arcIndex: number
  episodeNumbers: number[]
  totalItems: number
  obtainedItems: number
  totalCost: number
  props: PropItem[]
  wardrobe: PropItem[]
  questionnaireAnswers?: Record<string, any>
  lastUpdated: number
  updatedBy: string
}

// ============================================================================
// TAB 7: EQUIPMENT
// ============================================================================

export interface EquipmentItem {
  id: string
  category: 'camera' | 'lens' | 'lighting' | 'audio' | 'grip' | 'other'
  name: string
  description: string
  ownership: 'owned' | 'renting' | 'borrowing'
  costPerDay?: number
  totalCost: number
  vendor?: string
  pickupDate?: string // YYYY-MM-DD
  returnDate?: string // YYYY-MM-DD
  responsiblePerson?: string
  status: 'needed' | 'reserved' | 'obtained' | 'returned'
  quantity: number
  notes: string
  comments: Comment[]
}

export interface EquipmentData {
  episodeNumber: number
  episodeTitle: string
  totalItems: number
  obtainedItems: number
  totalCost: number
  camera: EquipmentItem[]
  lens: EquipmentItem[]
  lighting: EquipmentItem[]
  audio: EquipmentItem[]
  grip: EquipmentItem[]
  other: EquipmentItem[]
  lastUpdated: number
  updatedBy: string
}

// ============================================================================
// TAB 8: CASTING
// ============================================================================

export interface ActorAvailability {
  date: string // YYYY-MM-DD
  available: boolean
  notes?: string
}

export interface ActorTemplate {
  name: string // Real actor name as reference
  whyMatch: string // Explanation of why this actor matches the character
}

export interface CharacterCastingProfile {
  characterName: string
  archetype: string // e.g., "The Hero", "The Mentor", "The Trickster"
  ageRange: { min: number; max: number }
  physicalRequirements: {
    height?: string // e.g., "5'8\"-6'2\""
    build?: string // e.g., "athletic-lean", "average", "stocky"
    ethnicity?: string // Only if relevant to character
    distinctiveFeatures?: string // e.g., "strong jawline, expressive eyes"
  }
  performanceRequirements: {
    actingStyle: string // e.g., "naturalistic, grounded", "heightened, comedic"
    emotionalRange: string // e.g., "vulnerability to determination"
    specialSkills: string[] // e.g., ["action sequences", "emotional depth", "accent"]
  }
  actorTemplates: ActorTemplate[] // 2-3 real actors as references
  castingNotes: string
  priority: 'lead' | 'supporting' | 'extra'
  scenes: number[] // Scene numbers character appears in
  characterArc?: {
    keyBeats: string[]
    emotionalJourney: string
  }
  keyScenes?: Array<{
    sceneNumber: number
    episodeNumber: number
    dialogue: string
    context: string
  }>
  relationships?: Array<{
    characterName: string
    relationshipType: string
    chemistryRequired: boolean
  }>
  backstory?: string
  screenTimeMetrics?: {
    totalScenes: number
    totalLines: number
    estimatedMinutes: number
  }
  objectives?: {
    superObjective: string
    sceneObjectives: string[]
  }
  voiceRequirements?: {
    style: string
    accent?: string
    vocalQuality: string
  }
  castingPriority?: {
    level: 'critical' | 'high' | 'medium'
    deadline?: string
  }
}

export interface CastMember {
  id: string
  characterName: string
  actorName?: string
  headshot?: string // URL or file path
  role?: 'lead' | 'supporting' | 'extra' // Legacy field for compatibility
  contact?: {
    email?: string
    phone?: string
    agent?: string
  }
  contactEmail?: string // Legacy field
  contactPhone?: string // Legacy field
  // Location fields for proximity-based location recommendations
  city?: string // e.g., "San Francisco", "Manila", "Los Angeles"
  state?: string // e.g., "CA", "NY" (US states)
  country?: string // e.g., "USA", "Philippines"
  zipCode?: string
  address?: string // Full or partial address
  travelWillingness?: 'local-only' | 'same-city' | 'regional' | 'flexible' // How far actor can travel
  availability: ActorAvailability[]
  availabilityWindows?: AvailabilityWindow[] // New: for cross-episode scheduling
  availabilityNotes?: string // Free-form text for AI parsing
  preferredShootingDays?: string[] // e.g., ["Monday", "Tuesday", "Friday"]
  blackoutDates?: string[] // YYYY-MM-DD format
  scenes: number[] // Scene numbers character appears in
  totalShootDays: number
  payment: 'paid' | 'deferred' | 'volunteer'
  paymentAmount?: number
  payRate?: number // Legacy field for compatibility
  specialNeeds: string[] // Dietary, accessibility, etc.
  rehersalNotes: string
  notes?: string // Legacy field for compatibility
  actorNotes: string
  status: 'casting' | 'offered' | 'confirmed' | 'declined'
  confirmed?: boolean // Legacy field for compatibility
  comments: Comment[]
  characterProfile?: CharacterCastingProfile // AI-generated casting profile
}

export interface CastingData {
  episodeNumber: number
  episodeTitle: string
  totalCharacters: number
  confirmedCast: number
  cast: CastMember[]
  lastUpdated: number
  updatedBy: string
}

// ============================================================================
// TAB 9: STORYBOARDS
// ============================================================================

export interface StoryboardFrame {
  id: string
  shotNumber: string
  sceneNumber: number
  frameImage?: string // AI-generated or uploaded sketch
  imagePrompt?: string // For AI regeneration
  scriptContext?: string // NEW: Actual script action/dialogue for this specific frame
  cameraAngle: string
  cameraMovement: string
  dialogueSnippet: string
  lightingNotes: string
  propsInFrame: string[]
  referenceImages: string[]
  referenceVideos?: string[] // AI-generated reference videos (VEO 3)
  status: 'draft' | 'revised' | 'final'
  notes: string
  comments: Comment[]
}

export interface StoryboardScene {
  sceneNumber: number
  sceneTitle: string
  frames: StoryboardFrame[]
}

export interface StoryboardArtStyle {
  name: string // e.g., "Cinematic Sketch", "Realistic", "Animated"
  description: string // Detailed style description
  colorTreatment: string // e.g., "black and white", "muted colors", "vibrant"
  renderingStyle: string // e.g., "sketch", "photorealistic", "illustrated"
  lineWeight: string // e.g., "bold", "fine", "variable"
  shadingStyle: string // e.g., "crosshatch", "soft gradient", "flat"
  referenceStyle: string // e.g., "film noir", "anime", "documentary"
}

export interface StoryboardsData {
  episodeNumber: number
  episodeTitle: string
  totalFrames: number
  finalizedFrames: number
  scenes: StoryboardScene[]
  lastUpdated: number
  updatedBy: string
  artStyle?: StoryboardArtStyle // Unified art style for all storyboard images
}

// ============================================================================
// TAB 10: PERMITS & CONTRACTS
// ============================================================================

export interface PermitContract {
  id: string
  type: 
    | 'location-permit'
    | 'actor-release'
    | 'music-license'
    | 'insurance'
    | 'vendor-contract'
    | 'other'
  title: string
  description: string
  linkedTo?: string // Location ID, Actor ID, etc.
  status: 'not-needed' | 'pending' | 'obtained'
  cost: number
  expirationDate?: string // YYYY-MM-DD
  reminderDate?: string // YYYY-MM-DD
  documentFile?: string // File path or URL
  vendor?: string
  notes: string
  comments: Comment[]
}

// Simplified Permit interface for Permits tab (legacy/alternative format)
export interface Permit {
  id: string
  name: string
  type: 'filming' | 'parking' | 'noise' | 'drone' | 'other'
  location: string
  authority: string
  applicationDate: string
  expiryDate: string
  status: 'not-applied' | 'pending' | 'approved' | 'denied'
  cost: number
  contactPerson?: string
  contactPhone?: string
  documentUrl?: string // File URL
  documentFileName?: string // File name for display
  documentFileSize?: number // File size in bytes
  documentUploadDate?: string // ISO date string
  notes: string
  comments: Comment[]
}

// Permits data structure
export interface PermitsData {
  permits: Permit[]
  checklist?: Array<{
    item: string
    description?: string
    completed: boolean
  }>
  lastUpdated: number
}

export interface PermitsContractsData {
  episodeNumber: number
  episodeTitle: string
  totalDocuments: number
  obtainedDocuments: number
  permits: PermitContract[]
  lastUpdated: number
  updatedBy: string
}

// ============================================================================
// TAB 11: REHEARSAL SCHEDULE
// ============================================================================

export interface RehearsalSession {
  id: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
  duration: number // minutes
  scenes: SceneReference[] // Changed to support cross-episode
  actors: string[] // Actor names
  location: 'in-person' | 'video-call'
  locationDetails?: string
  rehearsalType: 'table-read' | 'blocking' | 'technical' | 'full-run'
  goals: string[]
  sessionNotes: string
  status: 'suggested' | 'scheduled' | 'completed' | 'cancelled'
  suggestedByAI: boolean // Mark AI-suggested rehearsals
  linkedToShootDay?: number // Optional link to shoot day
  comments: Comment[]
}

export interface RehearsalScheduleData {
  episodeNumber: number
  episodeTitle: string
  totalSessions: number
  completedSessions: number
  sessions: RehearsalSession[]
  lastUpdated: number
  updatedBy: string
}

// ============================================================================
// MASTER PRE-PRODUCTION DATA
// ============================================================================

// Base interface with common fields
interface BasePreProductionData {
  id: string // Firestore document ID
  userId: string
  storyBibleId: string
  
  // Tab data
  shootingSchedule?: ShootingScheduleData
  budget?: BudgetTrackerData
  equipment?: EquipmentData
  casting?: CastingData
  permits?: PermitsData | PermitsContractsData // Support both formats
  
  // Metadata
  createdAt: number
  lastUpdated: number
  collaborators: Collaborator[]
  generationStatus: 'not-started' | 'generating' | 'completed' | 'error'
  generationProgress?: number // 0-100
}

// Episode marketing data
export interface EpisodeMarketingData {
  episodeNumber: number
  marketingHooks: string[]
  viralPotentialScenes: Array<{
    sceneNumber: number
    timestamp: string
    hook: string
    platform: string
    suggestedCaption?: string
    suggestedHashtags?: string[]
  }>
  platformContent: {
    tiktok?: { captions: string[]; hashtags: string[] }
    instagram?: { captions: string[]; hashtags: string[] }
    youtube?: { captions: string[]; hashtags: string[] }
  }
  readyToUsePosts: Array<{
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
    frameId?: string // Reference to storyboard frame if selected from existing
    sceneNumber?: number
  }
}

// Episode-specific pre-production data
export interface EpisodePreProductionData extends BasePreProductionData {
  type: 'episode'
  episodeNumber: number
  episodeTitle: string
  
  // Episode-specific tab data
  scriptBreakdown?: ScriptBreakdownData
  scriptAnalysis?: ScriptAnalysisData
  shotList?: ShotListData
  locations?: LocationsData  // Optional - locations now managed at arc level
  propsWardrobe?: PropsWardrobeData
  storyboards?: StoryboardsData
  rehearsal?: RehearsalScheduleData
  scripts?: any // Episode scripts
  marketing?: EpisodeMarketingData
}

// Arc marketing data
export interface ArcMarketingData {
  arcIndex: number
  arcTitle: string
  marketingStrategy: {
    primaryApproach: string
    targetAudience: {
      primary: string[]
      secondary: string[]
    }
    keySellingPoints: string[]
    uniqueValueProposition: string
  }
  crossEpisodeThemes: string[]
  arcLaunchStrategy: {
    preLaunch: string[]
    launch: string[]
    postLaunch: string[]
  }
  platformStrategies: {
    tiktok?: { contentFormat: string; postingSchedule: string; hashtagStrategy: string[] }
    instagram?: { contentFormat: string; gridAesthetic: string; broadcastChannelStrategy: string }
    youtube?: { contentFormat: string; seoTitleStrategy: string; relatedVideoStrategy: string }
  }
}

// Arc-specific pre-production data
export interface ArcPreProductionData extends BasePreProductionData {
  type: 'arc'
  arcIndex: number
  arcTitle: string
  episodeNumbers: number[]
  propsWardrobe?: ArcPropsWardrobeData
  
  // Arc-specific tab data
  locations?: LocationsData  // Arc-level locations for all episodes
  marketing?: ArcMarketingData
}

// Union type for pre-production data
export type PreProductionData = EpisodePreProductionData | ArcPreProductionData

// ============================================================================
// GENERATION CONTEXT
// ============================================================================

export interface PreProductionGenerationContext {
  storyBible: any // From existing story bible
  episode: any // Episode content from workspace
  budgetRange: {
    min: number
    max: number
  }
  shootingDuration: number // days
  episodeDuration: number // minutes
  userPreferences?: {
    preferredLocations?: string[]
    ownedEquipment?: string[]
    availableCrew?: string[]
  }
}

// ============================================================================
// GREENLIT FUND REQUEST
// ============================================================================

export interface EpisodeBudgetBreakdown {
  episodeNumber: number
  episodeTitle: string
  sceneCount: number
  totalBudget: number
  baseBudget: number
  optionalBudget: number
  locationCosts: number
  equipmentCosts: number
  propsWardrobeCosts: number
}

export interface CastSummary {
  totalConfirmed: number
  totalPending: number
  leads: Array<{
    characterName: string
    actorName?: string
    status: string
  }>
  supporting: Array<{
    characterName: string
    actorName?: string
    status: string
  }>
}

export interface LocationSummary {
  totalLocations: number
  uniqueLocations: number
  totalCost: number
  reuseSavings: number
  keyLocations: Array<{
    name: string
    address: string
    episodesUsed: number[]
    cost: number
  }>
}

export interface EquipmentSummary {
  totalItems: number
  totalRentalCost: number
  categories: {
    camera: number
    lens: number
    lighting: number
    audio: number
    grip: number
    other: number
  }
}

export interface StoryBibleHighlights {
  premise: string
  theme: string
  genre: string
  tone: string
  setting: string
  targetAudience: string
}

export interface CharacterArc {
  characterName: string
  arcDescription: string
  keyMoments: string[]
}

export interface ProductionTimeline {
  estimatedShootStart: string // YYYY-MM-DD
  estimatedShootEnd: string // YYYY-MM-DD
  estimatedPostProduction: string // YYYY-MM-DD
  estimatedDistribution: string // YYYY-MM-DD
  deadline: string // "2-3 weeks from funding approval"
  totalShootDays: number
}

export interface FundRequestSummary {
  seriesTitle: string
  genre: string
  arcIndex: number
  arcTitle: string
  episodeCount: number
  totalBudget: number
  episodeBreakdowns: EpisodeBudgetBreakdown[]
  castSummary: CastSummary
  locationSummary: LocationSummary
  equipmentSummary: EquipmentSummary
  storyBibleHighlights: StoryBibleHighlights
  characterArcs: CharacterArc[]
  productionTimeline: ProductionTimeline
  createdAt: number
  userId: string
  userName: string
  userEmail?: string
  userPhone?: string
}

export interface FundRequestRecord {
  id: string // Firestore document ID
  requestId: string // Token for read-only view access
  arcPreProductionId: string
  storyBibleId: string
  userId: string
  summary: FundRequestSummary
  readOnlyViewUrl: string
  status: 'pending' | 'reviewed' | 'approved' | 'rejected'
  createdAt: number
  reviewedAt?: number
  reviewedBy?: string
  notes?: string
}
