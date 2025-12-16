/**
 * Generation Preferences Service
 * Manages user preferences for story bible generation
 */

// Genre options for story generation
export const GENRE_OPTIONS = [
  { value: 'default', label: 'Default (AI Decides)' },
  { value: 'drama', label: 'Drama' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'romance', label: 'Romance' },
  { value: 'thriller', label: 'Thriller' },
  { value: 'horror', label: 'Horror' },
  { value: 'sci-fi', label: 'Science Fiction' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'action', label: 'Action' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'crime', label: 'Crime' },
  { value: 'documentary', label: 'Documentary' },
  { value: 'historical', label: 'Historical' },
  { value: 'war', label: 'War' },
  { value: 'western', label: 'Western' },
  { value: 'musical', label: 'Musical' },
  { value: 'animation', label: 'Animation' },
  { value: 'family', label: 'Family' },
  { value: 'sports', label: 'Sports' },
  { value: 'biographical', label: 'Biographical' },
  { value: 'noir', label: 'Film Noir' },
  { value: 'psychological', label: 'Psychological' },
  { value: 'supernatural', label: 'Supernatural' },
  { value: 'dystopian', label: 'Dystopian' },
  { value: 'post-apocalyptic', label: 'Post-Apocalyptic' },
  { value: 'slice-of-life', label: 'Slice of Life' },
  { value: 'coming-of-age', label: 'Coming of Age' },
  { value: 'legal', label: 'Legal Drama' },
  { value: 'medical', label: 'Medical Drama' },
  { value: 'political', label: 'Political' },
  { value: 'mockumentary', label: 'Mockumentary' },
  { value: 'dark-comedy', label: 'Dark Comedy' },
  { value: 'romantic-comedy', label: 'Romantic Comedy' },
  { value: 'anthology', label: 'Anthology' }
] as const

// Language options for dialogue
export const LANGUAGE_OPTIONS = [
  { value: 'english', label: 'English' },
  { value: 'tagalog', label: 'Tagalog (Taglish)' },
  { value: 'french', label: 'French' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'thai', label: 'Thai' },
  { value: 'korean', label: 'Korean' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'chinese', label: 'Chinese' }
] as const

// Series length presets
export const SERIES_LENGTH_OPTIONS = [
  { value: 'mini', label: 'Mini-series (3 arcs / 24 episodes)', arcs: 3, episodesPerArc: 8 },
  { value: 'limited', label: 'Limited series (4 arcs / 32 episodes)', arcs: 4, episodesPerArc: 8 },
  { value: 'full', label: 'Full series (5 arcs / 40 episodes)', arcs: 5, episodesPerArc: 8 },
  { value: 'anthology', label: 'Anthology (standalone episodes)', arcs: 1, episodesPerArc: 12 }
] as const

export interface AdvancedSettings {
  // Core Settings
  seriesTitle: string
  initialCharacterCount: number | null // null = AI decides
  genre: string
  tone: number // 0 (Gritty) to 100 (Lighthearted)
  matureThemes: boolean // R16+ content
  dialogueLanguage: string
  
  // Structural Settings
  seriesLength: 'mini' | 'limited' | 'full' | 'anthology'
  episodesPerArc: number
  endingType: 'open-ended' | 'conclusive' | 'ambiguous' | 'cyclical'
  
  // Narrative Settings
  povStyle: 'single' | 'ensemble' | 'rotating' | 'unreliable'
  timelineStructure: 'linear' | 'non-linear' | 'multiple' | 'real-time'
  conflictType: 'internal' | 'interpersonal' | 'external' | 'cosmic'
  
  // Character Settings
  protagonistMorality: 'heroic' | 'anti-hero' | 'ambiguous' | 'villain'
  romanceSubplot: 'none' | 'light' | 'central' | 'primary'
  characterAgeRange: 'children' | 'teens' | 'young-adults' | 'adults' | 'mixed'
  
  // Production Settings
  settingScope: 'single' | 'limited' | 'multiple' | 'epic'
  visualStyle: 'realistic' | 'stylized' | 'surreal' | 'documentary'
  
  // Audience Settings
  humorLevel: 'serious' | 'occasional' | 'dark-comedy' | 'full-comedy'
  violenceLevel: 'none' | 'implied' | 'moderate' | 'graphic'
}

export interface GenerationPreferences {
  // Legacy fields (kept for backward compatibility)
  tone: 'balanced' | 'light' | 'dark' | 'gritty' | 'whimsical'
  pacing: 'slow-burn' | 'moderate' | 'fast-paced'
  complexity: 'straightforward' | 'layered' | 'complex'
  focusArea: 'character' | 'plot' | 'world' | 'balanced'
  
  // New advanced settings
  useAdvancedSettings: boolean
  advancedSettings: AdvancedSettings
  
  savedAt: string
}

const STORAGE_KEY = 'greenlit_generation_prefs'

/**
 * Save generation preferences to localStorage
 */
export function saveGenerationPreferences(prefs: Omit<GenerationPreferences, 'savedAt'>): void {
  try {
    const prefsWithTimestamp: GenerationPreferences = {
      ...prefs,
      savedAt: new Date().toISOString()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefsWithTimestamp))
    console.log('✅ Generation preferences saved:', prefsWithTimestamp)
  } catch (error) {
    console.error('❌ Failed to save generation preferences:', error)
  }
}

/**
 * Load generation preferences from localStorage
 */
export function loadGenerationPreferences(): GenerationPreferences | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return null
    }
    
    const prefs = JSON.parse(stored) as GenerationPreferences
    console.log('📖 Loaded generation preferences:', prefs)
    return prefs
  } catch (error) {
    console.error('❌ Failed to load generation preferences:', error)
    return null
  }
}

/**
 * Clear saved preferences
 */
export function clearGenerationPreferences(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    console.log('🗑️ Generation preferences cleared')
  } catch (error) {
    console.error('❌ Failed to clear generation preferences:', error)
  }
}

/**
 * Get default advanced settings
 */
export function getDefaultAdvancedSettings(): AdvancedSettings {
  return {
    // Core Settings
    seriesTitle: '',
    initialCharacterCount: null, // AI decides
    genre: 'default',
    tone: 50, // Middle of Gritty to Lighthearted
    matureThemes: false,
    dialogueLanguage: 'english',
    
    // Structural Settings
    seriesLength: 'limited',
    episodesPerArc: 8,
    endingType: 'conclusive',
    
    // Narrative Settings
    povStyle: 'single',
    timelineStructure: 'linear',
    conflictType: 'interpersonal',
    
    // Character Settings
    protagonistMorality: 'heroic',
    romanceSubplot: 'light',
    characterAgeRange: 'adults',
    
    // Production Settings
    settingScope: 'multiple',
    visualStyle: 'realistic',
    
    // Audience Settings
    humorLevel: 'occasional',
    violenceLevel: 'implied'
  }
}

/**
 * Get default preferences
 */
export function getDefaultPreferences(): Omit<GenerationPreferences, 'savedAt'> {
  return {
    tone: 'balanced',
    pacing: 'moderate',
    complexity: 'layered',
    focusArea: 'balanced',
    useAdvancedSettings: false,
    advancedSettings: getDefaultAdvancedSettings()
  }
}

/**
 * Check if preferences are set
 */
export function hasStoredPreferences(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null
}







