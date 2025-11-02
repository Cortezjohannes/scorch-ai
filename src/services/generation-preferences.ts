/**
 * Generation Preferences Service
 * Manages user preferences for story bible generation
 */

export interface GenerationPreferences {
  tone: 'balanced' | 'light' | 'dark' | 'gritty' | 'whimsical'
  pacing: 'slow-burn' | 'moderate' | 'fast-paced'
  complexity: 'straightforward' | 'layered' | 'complex'
  focusArea: 'character' | 'plot' | 'world' | 'balanced'
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
 * Get default preferences
 */
export function getDefaultPreferences(): Omit<GenerationPreferences, 'savedAt'> {
  return {
    tone: 'balanced',
    pacing: 'moderate',
    complexity: 'layered',
    focusArea: 'balanced'
  }
}

/**
 * Check if preferences are set
 */
export function hasStoredPreferences(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null
}







