/**
 * Location Matcher Utility
 * Matches scenes to previously used locations for consistency across episodes
 */

import type { Location } from '@/types/preproduction'

/**
 * Normalize location name from scene title
 * Example: "INT. JASON'S APARTMENT - MORNING" → "jasons_apartment"
 */
export function normalizeLocationName(sceneTitle: string): string {
  // Extract location from scene title (format: "INT./EXT. LOCATION NAME - TIME")
  const match = sceneTitle.match(/^(?:INT|EXT)\.\s*(.+?)(?:\s*-\s*[A-Z]+)?$/i)
  if (match && match[1]) {
    let locationName = match[1].trim()
    // Normalize: lowercase, remove apostrophes, replace non-alphanumeric with underscore
    locationName = locationName.toLowerCase()
      .replace(/'/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
    return locationName
  }
  // Fallback: normalize the entire scene title
  return sceneTitle.toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

/**
 * Extract character names from scene title and script data
 * Returns array of character names found in the scene
 */
export function extractCharacterFromScene(sceneTitle: string, scriptData?: any): string[] {
  const characters: string[] = []
  
  // Try to extract from scene title (e.g., "JASON'S APARTMENT" → "Jason")
  const titleMatch = sceneTitle.match(/(\w+)'?S\s+\w+/i)
  if (titleMatch && titleMatch[1]) {
    characters.push(titleMatch[1])
  }
  
  // If script data is available, try to find characters in the scene
  if (scriptData?.scenes) {
    const sceneMatch = scriptData.scenes.find((s: any) => 
      s.title === sceneTitle || s.sceneNumber === sceneTitle.match(/\d+/)?.[0]
    )
    if (sceneMatch?.characters && Array.isArray(sceneMatch.characters)) {
      sceneMatch.characters.forEach((char: any) => {
        const charName = typeof char === 'string' ? char : char.name || char.characterName
        if (charName && !characters.includes(charName)) {
          characters.push(charName)
        }
      })
    }
  }
  
  return characters
}

/**
 * Match scene to previous location using multiple strategies
 * Returns the best matching location or null
 */
export function matchLocationToPrevious(
  sceneTitle: string,
  previousLocations: Location[],
  scriptData?: any
): Location | null {
  if (!previousLocations || previousLocations.length === 0) {
    return null
  }
  
  const normalizedSceneLocation = normalizeLocationName(sceneTitle)
  const sceneCharacters = extractCharacterFromScene(sceneTitle, scriptData)
  
  // Strategy 1: Exact match by normalized location key
  for (const location of previousLocations) {
    if (location.recurringLocationKey) {
      if (location.recurringLocationKey === normalizedSceneLocation) {
        console.log(`  ✅ Exact match found by recurringLocationKey: ${location.name}`)
        return location
      }
    }
    
    // Also check by normalizing location name directly
    const normalizedLocationName = normalizeLocationName(location.name)
    if (normalizedLocationName === normalizedSceneLocation) {
      console.log(`  ✅ Exact match found by location name: ${location.name}`)
      return location
    }
  }
  
  // Strategy 2: Character association match
  // If scene has "Jason" and we find "Jason's apartment" in previous locations
  if (sceneCharacters.length > 0) {
    for (const location of previousLocations) {
      const locationNameLower = location.name.toLowerCase()
      
      for (const charName of sceneCharacters) {
        const charNameLower = charName.toLowerCase()
        // Check if location name contains character name (e.g., "jason's apartment")
        if (locationNameLower.includes(charNameLower + "'s") || 
            locationNameLower.includes(charNameLower + "s ") ||
            locationNameLower.includes(charNameLower + "' ")) {
          console.log(`  ✅ Character association match: ${charName} → ${location.name}`)
          return location
        }
      }
    }
  }
  
  // Strategy 3: Semantic keyword match
  // Match by location type keywords (apartment, office, cafe, etc.) + character if available
  const locationTypeKeywords = ['apartment', 'office', 'home', 'house', 'cafe', 'restaurant', 'club', 'loft', 'hq', 'headquarters']
  const sceneKeywords = normalizedSceneLocation.split('_').filter(k => k.length > 2)
  
  for (const location of previousLocations) {
    const locationNameLower = location.name.toLowerCase()
    const locationKeywords = locationNameLower.split(/[^a-z0-9]+/).filter(k => k.length > 2)
    
    // Check if location type matches (e.g., both contain "apartment")
    const typeMatch = locationTypeKeywords.some(type => 
      sceneKeywords.includes(type) && locationKeywords.includes(type)
    )
    
    if (typeMatch) {
      // If we have character info, prefer matches with character
      if (sceneCharacters.length > 0) {
        const hasCharacterMatch = sceneCharacters.some(char => 
          locationNameLower.includes(char.toLowerCase())
        )
        if (hasCharacterMatch) {
          console.log(`  ✅ Semantic + character match: ${location.name}`)
          return location
        }
      } else {
        // No character info, just match by type
        console.log(`  ✅ Semantic type match: ${location.name}`)
        return location
      }
    }
  }
  
  return null
}

/**
 * Find matching story bible location for a scene
 */
export function matchStoryBibleLocation(
  sceneTitle: string,
  storyBibleLocations: any[]
): any | null {
  if (!storyBibleLocations || storyBibleLocations.length === 0) {
    return null
  }
  
  const normalizedSceneLocation = normalizeLocationName(sceneTitle)
  
  for (const sbLocation of storyBibleLocations) {
    const locationName = typeof sbLocation === 'string' ? sbLocation : sbLocation.name
    if (!locationName) continue
    
    const normalizedSBLocation = normalizeLocationName(locationName)
    
    // Check for exact match
    if (normalizedSBLocation === normalizedSceneLocation) {
      return sbLocation
    }
    
    // Check for partial match (scene location contains story bible location or vice versa)
    if (normalizedSceneLocation.includes(normalizedSBLocation) || 
        normalizedSBLocation.includes(normalizedSceneLocation)) {
      return sbLocation
    }
  }
  
  return null
}


