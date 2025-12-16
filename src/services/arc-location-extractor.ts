/**
 * Arc Location Extractor
 * Extracts locations from episode scripts and groups them with sub-locations
 */

import type {
  ArcLocationGroup,
  SubLocation,
  LocationSceneReference
} from '@/types/preproduction'

export interface ExtractedLocation {
  name: string
  fullName: string // Original scene heading location
  type: 'interior' | 'exterior' | 'both'
  episodeNumber: number
  sceneNumber: number
  sceneTitle?: string
  timeOfDay?: string
}

export interface EpisodeScriptData {
  episodeNumber: number
  episodeTitle: string
  scriptText?: string
  breakdownScenes?: Array<{
    sceneNumber: number
    sceneTitle?: string
    location?: string
    timeOfDay?: string
  }>
}

// Re-export for use in API route
export type { EpisodeScriptData as ArcEpisodeScriptData }

/**
 * Extract locations from scene headings in script text
 */
function extractLocationsFromScriptText(
  scriptText: string,
  episodeNumber: number
): ExtractedLocation[] {
  if (!scriptText || typeof scriptText !== 'string') {
    return []
  }

  const locations: ExtractedLocation[] = []
  
  // Match scene headings: INT./EXT. LOCATION - TIME
  const sceneHeadingRegex = /(?:INT\.|EXT\.|INT\/EXT\.)\s+([^-]+?)(?:\s*-\s*([A-Z]+))?/gi
  let match
  let sceneNumber = 1

  while ((match = sceneHeadingRegex.exec(scriptText)) !== null) {
    const locationText = match[1]?.trim() || ''
    const timeOfDay = match[2]?.trim() || 'DAY'
    const isInterior = match[0].toUpperCase().includes('INT')
    const isExterior = match[0].toUpperCase().includes('EXT')
    
    if (locationText) {
      const type: 'interior' | 'exterior' | 'both' = 
        isInterior && isExterior ? 'both' :
        isInterior ? 'interior' :
        'exterior'

      locations.push({
        name: locationText,
        fullName: locationText,
        type,
        episodeNumber,
        sceneNumber: sceneNumber++,
        timeOfDay
      })
    }
  }

  return locations
}

/**
 * Extract locations from breakdown scenes
 */
function extractLocationsFromBreakdown(
  breakdownScenes: Array<{
    sceneNumber: number
    sceneTitle?: string
    location?: string
    timeOfDay?: string
  }>,
  episodeNumber: number
): ExtractedLocation[] {
  if (!Array.isArray(breakdownScenes)) {
    return []
  }

  return breakdownScenes
    .filter(scene => scene.location)
    .map(scene => {
      const locationText = scene.location || ''
      const isInterior = locationText.toUpperCase().includes('INT') || 
                        locationText.toLowerCase().includes('interior')
      const isExterior = locationText.toUpperCase().includes('EXT') || 
                         locationText.toLowerCase().includes('exterior')
      
      const type: 'interior' | 'exterior' | 'both' = 
        isInterior && isExterior ? 'both' :
        isInterior ? 'interior' :
        isExterior ? 'exterior' :
        'interior' // Default to interior

      return {
        name: locationText.replace(/^(INT\.|EXT\.|INT\/EXT\.)\s*/i, '').trim(),
        fullName: locationText,
        type,
        episodeNumber,
        sceneNumber: scene.sceneNumber,
        sceneTitle: scene.sceneTitle,
        timeOfDay: scene.timeOfDay
      }
    })
}

/**
 * Normalize location name for grouping
 */
function normalizeLocationName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

/**
 * Compute a simple similarity score between two strings (0-1)
 * using normalized Levenshtein-like ratio (LCS approximation).
 */
function stringSimilarity(a: string, b: string): number {
  const s1 = normalizeLocationName(a)
  const s2 = normalizeLocationName(b)
  if (!s1 || !s2) return 0
  if (s1 === s2) return 1
  const len = Math.max(s1.length, s2.length)
  let matches = 0
  for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
    if (s1[i] === s2[i]) matches++
  }
  return Math.max(matches / len, 0)
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}

/**
 * Detect parent-child relationship between locations
 * e.g., "Greenlit HQ - Loft" → parent: "Greenlit HQ", child: "Loft"
 */
function detectParentChild(
  location1: string,
  location2: string
): { parent: string; child: string } | null {
  const norm1 = normalizeLocationName(location1)
  const norm2 = normalizeLocationName(location2)

  // Pattern: "Location - Sublocation"
  const dashPattern = /^(.+?)\s*-\s*(.+)$/
  
  const match1 = location1.match(dashPattern)
  const match2 = location2.match(dashPattern)

  if (match1) {
    const parent1 = match1[1].trim()
    const child1 = match1[2].trim()
    
    // Check if location2 matches the parent
    if (normalizeLocationName(location2) === normalizeLocationName(parent1)) {
      return { parent: parent1, child: child1 }
    }
    
    // Check if location2 is another sub-location of the same parent
    if (match2 && normalizeLocationName(match2[1]) === normalizeLocationName(parent1)) {
      return { parent: parent1, child: child1 }
    }
  }

  if (match2) {
    const parent2 = match2[1].trim()
    const child2 = match2[2].trim()
    
    // Check if location1 matches the parent
    if (normalizeLocationName(location1) === normalizeLocationName(parent2)) {
      return { parent: parent2, child: child2 }
    }
  }

  // Check if one location contains the other (fuzzy match)
  if (norm1.includes(norm2) && norm1.length > norm2.length) {
    return { parent: location2, child: location1.replace(new RegExp(norm2, 'i'), '').trim().replace(/^-\s*/, '') }
  }
  
  if (norm2.includes(norm1) && norm2.length > norm1.length) {
    return { parent: location1, child: location2.replace(new RegExp(norm1, 'i'), '').trim().replace(/^-\s*/, '') }
  }

  return null
}

/**
 * Group locations by parent-child relationships
 */
function groupSubLocations(
  extractedLocations: ExtractedLocation[]
): Map<string, ExtractedLocation[]> {
  const locationMap = new Map<string, ExtractedLocation[]>()
  const processed = new Set<string>()

  // First pass: group exact matches
  extractedLocations.forEach(loc => {
    const key = normalizeLocationName(loc.name)
    if (!locationMap.has(key)) {
      locationMap.set(key, [])
    }
    locationMap.get(key)!.push(loc)
  })

  // Second pass: detect parent-child relationships
  const parentChildMap = new Map<string, string[]>() // parent -> children
  const childParentMap = new Map<string, string>() // child -> parent

  const locationNames = Array.from(locationMap.keys())
  
  for (let i = 0; i < locationNames.length; i++) {
    for (let j = i + 1; j < locationNames.length; j++) {
      const loc1 = locationNames[i]
      const loc2 = locationNames[j]
      
      const relationship = detectParentChild(loc1, loc2)
      if (relationship) {
        const parentKey = normalizeLocationName(relationship.parent)
        const childKey = normalizeLocationName(relationship.child)
        
        if (!parentChildMap.has(parentKey)) {
          parentChildMap.set(parentKey, [])
        }
        if (!parentChildMap.get(parentKey)!.includes(childKey)) {
          parentChildMap.get(parentKey)!.push(childKey)
        }
        
        childParentMap.set(childKey, parentKey)
      }
    }
  }

  // Merge children into parents
  childParentMap.forEach((parentKey, childKey) => {
    const parentLocs = locationMap.get(parentKey)
    const childLocs = locationMap.get(childKey)
    
    if (parentLocs && childLocs) {
      // Add child locations to parent group
      parentLocs.push(...childLocs)
      locationMap.delete(childKey)
    }
  })

  return locationMap
}

/**
 * Main extraction function
 */
export function extractLocationsFromScripts(
  episodeScripts: EpisodeScriptData[]
): ExtractedLocation[] {
  const allLocations: ExtractedLocation[] = []

  episodeScripts.forEach(episode => {
    // Use breakdown first (structured)
    if (episode.breakdownScenes && episode.breakdownScenes.length > 0) {
      const breakdownLocs = extractLocationsFromBreakdown(
        episode.breakdownScenes,
        episode.episodeNumber
      )
      allLocations.push(...breakdownLocs)
    }

    // Fallback to script text parsing
    if (episode.scriptText) {
      const scriptLocs = extractLocationsFromScriptText(
        episode.scriptText,
        episode.episodeNumber
      )
      // Only add if we didn't get locations from breakdown for this episode
      if (allLocations.filter(l => l.episodeNumber === episode.episodeNumber).length === 0) {
        allLocations.push(...scriptLocs)
      }
    }
  })

  return allLocations
}

/**
 * Create location groups from extracted locations
 */
export function createLocationGroups(
  extractedLocations: ExtractedLocation[],
  storyBible?: any
): ArcLocationGroup[] {
  // Group locations
  const grouped = groupSubLocations(extractedLocations)
  
  // Get story bible locations for cross-reference
  const storyBibleLocations = storyBible?.worldBuilding?.locations || []
  const storyBibleLocationMap = new Map<string, any>()
  
  storyBibleLocations.forEach((loc: any) => {
    const name = typeof loc === 'string' ? loc : loc.name || loc.title
    if (name) {
      storyBibleLocationMap.set(normalizeLocationName(name), loc)
    }
  })

  const locationGroups: ArcLocationGroup[] = []

  grouped.forEach((locations, normalizedKey) => {
    if (locations.length === 0) return

    // Use the most common name as parent
    const nameCounts = new Map<string, number>()
    locations.forEach(loc => {
      const name = loc.name.split(' - ')[0].trim() // Get parent part
      nameCounts.set(name, (nameCounts.get(name) || 0) + 1)
    })
    
    const parentName = Array.from(nameCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || locations[0].name.split(' - ')[0].trim()

    // Determine type (most common)
    const typeCounts = new Map<'interior' | 'exterior' | 'both', number>()
    locations.forEach(loc => {
      typeCounts.set(loc.type, (typeCounts.get(loc.type) || 0) + 1)
    })
    const type = Array.from(typeCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'interior'

    // Create sub-locations
    const subLocationMap = new Map<string, SubLocation>()
    
    locations.forEach(loc => {
      const fullName = loc.fullName || loc.name
      const dashMatch = fullName.match(/^(.+?)\s*-\s*(.+)$/)
      
      let subLocationName: string
      if (dashMatch && normalizeLocationName(dashMatch[1]) === normalizeLocationName(parentName)) {
        subLocationName = dashMatch[2].trim()
      } else if (normalizeLocationName(loc.name) !== normalizeLocationName(parentName)) {
        // Different name but grouped together - treat as sub-location
        subLocationName = loc.name.replace(new RegExp(parentName, 'i'), '').trim().replace(/^-\s*/, '')
      } else {
        // Same as parent - no sub-location
        subLocationName = ''
      }

      const subLocKey = subLocationName || '_main'
      
      if (!subLocationMap.has(subLocKey)) {
        subLocationMap.set(subLocKey, {
          id: `subloc_${normalizedKey}_${subLocKey}`,
          name: subLocationName || parentName,
          fullName: subLocationName ? `${parentName} - ${subLocationName}` : parentName,
          type: loc.type,
          sceneReferences: [],
          totalScenes: 0
        })
      }

      const subLoc = subLocationMap.get(subLocKey)!
      subLoc.sceneReferences.push({
        episodeNumber: loc.episodeNumber,
        sceneNumber: loc.sceneNumber
      })
      subLoc.totalScenes++
    })

    const subLocations = Array.from(subLocationMap.values())

    // Create episode usage
    const episodeUsageMap = new Map<number, {
      episodeNumber: number
      episodeTitle: string
      sceneNumbers: number[]
      subLocationIds: string[]
    }>()

    locations.forEach(loc => {
      if (!episodeUsageMap.has(loc.episodeNumber)) {
        // Find episode title from original data
        const episodeTitle = `Episode ${loc.episodeNumber}`
        episodeUsageMap.set(loc.episodeNumber, {
          episodeNumber: loc.episodeNumber,
          episodeTitle,
          sceneNumbers: [],
          subLocationIds: []
        })
      }

      const usage = episodeUsageMap.get(loc.episodeNumber)!
      if (!usage.sceneNumbers.includes(loc.sceneNumber)) {
        usage.sceneNumbers.push(loc.sceneNumber)
      }

      // Find sub-location ID
      const subLoc = subLocations.find(sl => 
        sl.sceneReferences.some(ref => 
          ref.episodeNumber === loc.episodeNumber && ref.sceneNumber === loc.sceneNumber
        )
      )
      if (subLoc && !usage.subLocationIds.includes(subLoc.id)) {
        usage.subLocationIds.push(subLoc.id)
      }
    })

    const episodeUsage = Array.from(episodeUsageMap.values()).map(usage => ({
      ...usage,
      sceneCount: usage.sceneNumbers.length
    }))

    // Cross-reference with story bible using fuzzy match
    let storyBibleReference: string | undefined
    let confidence = 0
    const parentKey = normalizeLocationName(parentName)
    storyBibleLocationMap.forEach((sbLoc, sbKey) => {
      const score = stringSimilarity(parentKey, sbKey)
      if (score > confidence) {
        confidence = score
        storyBibleReference = typeof sbLoc === 'string' ? sbLoc : sbLoc.name || sbLoc.title
      }
    })
    if (confidence < 0.5) {
      storyBibleReference = undefined
      confidence = 0
    }

    const totalScenes = locations.length
    const episodeNumbers = Array.from(new Set(locations.map(l => l.episodeNumber)))
    const scenesUsed = unique(locations.map(l => l.sceneNumber)).sort((a, b) => a - b)
    const timeOfDay = unique(
      locations
        .map(l => l.timeOfDay)
        .filter(Boolean) as string[]
    )
    const firstUsedEpisode = Math.min(...episodeNumbers)
    const lastUsedEpisode = Math.max(...episodeNumbers)
    const canonicalLocationId = `loc_${parentKey}`

    locationGroups.push({
      id: `locgroup_${normalizedKey}`,
      parentLocationName: parentName,
      type,
      subLocations,
      shootingLocationSuggestions: [], // Will be populated by AI suggester
      episodeUsage,
      totalScenes,
      totalEpisodes: episodeNumbers.length,
      storyBibleReference,
      canonicalLocationId,
      confidence,
      episodesUsed: episodeNumbers,
      scenesUsed,
      timeOfDay,
      firstUsedEpisode,
      lastUsedEpisode
    })
  })

  return locationGroups.sort((a, b) => b.totalEpisodes - a.totalEpisodes)
}

/**
 * Build location groups directly from story bible worldBuilding.locations
 * ignoring episode scripts. This is a clean “from scratch” source when
 * episodes are defunct.
 */
export function createStoryBibleLocationGroups(storyBible: any): ArcLocationGroup[] {
  const locations = Array.isArray(storyBible?.worldBuilding?.locations) ? storyBible.worldBuilding.locations : []
  const groups: ArcLocationGroup[] = []

  locations.forEach((loc: any, idx: number) => {
    const name = typeof loc === 'string' ? loc : loc.name || loc.title || `Location ${idx + 1}`
    if (!name) return
    const type = (loc.type === 'exterior' || loc.type === 'both') ? (loc.type as any) : 'interior'
    const id = `sb_loc_${normalizeLocationName(name)}`

    const subLocations: SubLocation[] = [{
      id: `${id}_main`,
      name,
      fullName: name,
      type,
      sceneReferences: [],
      totalScenes: 0
    }]

    groups.push({
      id,
      parentLocationName: name,
      type,
      subLocations,
      shootingLocationSuggestions: [],
      episodeUsage: [],
      totalScenes: 0,
      totalEpisodes: 0,
      storyBibleReference: name,
      canonicalLocationId: id,
      confidence: 1,
      episodesUsed: [],
      scenesUsed: [],
      timeOfDay: [],
      firstUsedEpisode: 0,
      lastUsedEpisode: 0
    })
  })

  return groups
}

/**
 * Build EpisodeScriptData from episode pre-production data (breakdowns / scripts)
 */
function buildEpisodeScriptsFromPreProd(
  episodePreProdData: Record<number | string, any> | undefined
): EpisodeScriptData[] {
  if (!episodePreProdData) return []
  const scripts: EpisodeScriptData[] = []
  Object.entries(episodePreProdData).forEach(([epNumStr, epData]: [string, any]) => {
    const episodeNumber = parseInt(epNumStr, 10)
    if (Number.isNaN(episodeNumber)) return
    scripts.push({
      episodeNumber,
      episodeTitle: epData?.episodeTitle || `Episode ${episodeNumber}`,
      scriptText: epData?.scriptText || epData?.script?.text || '',
      breakdownScenes: epData?.scriptBreakdown?.scenes || []
    })
  })
  return scripts
}

/**
 * Attach episode usage (scenes, episodes, times of day) to existing Story Bible groups.
 * Does NOT create new groups; only enriches existing ones via fuzzy match.
 */
export function attachEpisodeUsageToStoryGroups(
  storyGroups: ArcLocationGroup[],
  episodePreProdData: Record<number | string, any> | undefined
): ArcLocationGroup[] {
  if (!storyGroups || storyGroups.length === 0) return storyGroups
  const scripts = buildEpisodeScriptsFromPreProd(episodePreProdData)
  if (scripts.length === 0) return storyGroups

  const extracted = extractLocationsFromScripts(scripts)
  if (extracted.length === 0) return storyGroups

  // Index story groups by normalized name
  const groupByName = new Map<string, ArcLocationGroup>()
  storyGroups.forEach(g => {
    groupByName.set(normalizeLocationName(g.parentLocationName), g)
  })

  extracted.forEach(loc => {
    const normLoc = normalizeLocationName(loc.name)
    let bestGroup: ArcLocationGroup | undefined
    let bestScore = 0

    groupByName.forEach((group, key) => {
      const score = stringSimilarity(normLoc, key)
      if (score > bestScore) {
        bestScore = score
        bestGroup = group
      }
    })

    // Only attach if we have a reasonably similar match
    if (bestGroup && bestScore >= 0.45) {
      // Ensure sub-location exists (use first/main)
      const subLoc = bestGroup.subLocations[0]
      if (subLoc) {
        subLoc.sceneReferences.push({
          episodeNumber: loc.episodeNumber,
          sceneNumber: loc.sceneNumber
        })
        subLoc.totalScenes = subLoc.sceneReferences.length
      }

      // Episode usage
      const usage = bestGroup.episodeUsage.find(e => e.episodeNumber === loc.episodeNumber)
      if (usage) {
        if (!usage.sceneNumbers.includes(loc.sceneNumber)) {
          usage.sceneNumbers.push(loc.sceneNumber)
          usage.sceneCount = usage.sceneNumbers.length
        }
        if (!usage.subLocationIds.includes(subLoc?.id || '')) {
          usage.subLocationIds.push(subLoc?.id || '')
        }
      } else {
        bestGroup.episodeUsage.push({
          episodeNumber: loc.episodeNumber,
          episodeTitle: `Episode ${loc.episodeNumber}`,
          sceneNumbers: [loc.sceneNumber],
          sceneCount: 1,
          subLocationIds: subLoc?.id ? [subLoc.id] : []
        })
      }
    }
  })

  // Recompute totals and metadata
  return storyGroups.map(group => {
    const episodeNumbers = group.episodeUsage.map(u => u.episodeNumber)
    const scenesUsed = unique(
      group.episodeUsage.flatMap(u => u.sceneNumbers || [])
    ).sort((a, b) => a - b)
    const totalScenes = scenesUsed.length
    const totalEpisodes = episodeNumbers.length
    const timeOfDay: string[] = [] // Could be enhanced if we map times
    const firstUsedEpisode = episodeNumbers.length ? Math.min(...episodeNumbers) : 0
    const lastUsedEpisode = episodeNumbers.length ? Math.max(...episodeNumbers) : 0

    return {
      ...group,
      totalScenes,
      totalEpisodes,
      episodesUsed: episodeNumbers,
      scenesUsed,
      timeOfDay,
      firstUsedEpisode,
      lastUsedEpisode
    }
  })
}



