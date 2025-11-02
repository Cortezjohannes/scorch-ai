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
}

export interface ScriptBreakdownProp {
  item: string
  importance: 'hero' | 'secondary' | 'background'
  source: 'buy' | 'rent' | 'borrow' | 'actor-owned'
  estimatedCost: number
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

export interface Location {
  id: string
  name: string
  address: string
  contactPerson?: string
  contactPhone?: string
  contactEmail?: string
  scenes: number[] // Scene numbers using this location
  permitInfo: LocationPermit
  availableDays: string[] // YYYY-MM-DD
  availableHours?: string // e.g., "9am-5pm"
  powerAccess: boolean
  parkingAvailable: boolean
  restroomAccess: boolean
  weatherConsiderations: string
  backupLocation?: string
  photos: string[] // URLs or file paths
  cost: number // Rental/fee
  status: 'scouted' | 'confirmed' | 'booked'
  crewNotes: string
  comments: Comment[]
}

export interface LocationOption {
  id: string
  sceneNumbers: number[]  // Which scenes can use this location
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
  sourcing: 'free' | 'rental' | 'borrow' | 'owned' | 'public-space'
  address?: string  // Example/generic address
  status: 'suggested' | 'selected' | 'rejected'
  selected: boolean  // User has selected this option
}

export interface LocationOptionsData {
  episodeNumber: number
  episodeTitle: string
  sceneRequirements: {
    sceneNumber: number
    sceneTitle: string
    locationType: 'INT' | 'EXT'
    timeOfDay: string
    options: LocationOption[]  // 2-3 options per scene
  }[]
  lastUpdated: number
  generated: true
}

export interface LocationsData {
  episodeNumber: number
  episodeTitle: string
  totalLocations: number
  locations: Location[]
  lastUpdated: number
  updatedBy: string
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
  cameraAngle: string
  cameraMovement: string
  dialogueSnippet: string
  lightingNotes: string
  propsInFrame: string[]
  referenceImages: string[]
  status: 'draft' | 'revised' | 'final'
  notes: string
  comments: Comment[]
}

export interface StoryboardScene {
  sceneNumber: number
  sceneTitle: string
  frames: StoryboardFrame[]
}

export interface StoryboardsData {
  episodeNumber: number
  episodeTitle: string
  totalFrames: number
  finalizedFrames: number
  scenes: StoryboardScene[]
  lastUpdated: number
  updatedBy: string
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

export interface PreProductionData {
  id: string // Firestore document ID
  userId: string
  storyBibleId: string
  episodeNumber: number
  episodeTitle: string
  
  // Tab data
  scriptBreakdown?: ScriptBreakdownData
  shootingSchedule?: ShootingScheduleData
  shotList?: ShotListData
  budget?: BudgetTrackerData
  locations?: LocationsData
  propsWardrobe?: PropsWardrobeData
  equipment?: EquipmentData
  casting?: CastingData
  storyboards?: StoryboardsData
  permits?: PermitsData | PermitsContractsData // Support both formats
  rehearsal?: RehearsalScheduleData
  
  // Metadata
  createdAt: number
  lastUpdated: number
  collaborators: Collaborator[]
  generationStatus: 'not-started' | 'generating' | 'completed' | 'error'
  generationProgress?: number // 0-100
}

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
