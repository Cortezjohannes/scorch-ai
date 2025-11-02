import { Location, LocationType, PermitStatus } from '@/types/preproduction'
import { cleanAIContent, detectContentStructure } from './scriptParser'

/**
 * Location Parser
 * 
 * Parses location scouting content into structured location data.
 * Handles both JSON and text formats.
 */

export interface ParsedLocationsData {
  locations: Location[]
}

/**
 * Parse location content into individual location cards
 */
export const parseLocations = (locationText: string): ParsedLocationsData => {
  if (!locationText) return { locations: [] }
  
  // Use unified content cleaner
  const cleanText = cleanAIContent(locationText)
  const structure = detectContentStructure(cleanText)
  
  // Try JSON parsing first if it looks like structured data
  if (structure.hasJSON) {
    try {
      const parsed = JSON.parse(cleanText)
      return {
        locations: parsed.locations || parsed.sets || []
      }
    } catch (e) {
      console.log('🏗️ JSON parsing failed, falling back to text parsing')
    }
  }
  
  const lines = cleanText.split('\n').filter(line => line.trim())
  const locations: Location[] = []
  let currentLocation: Partial<Location> | null = null
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    // Enhanced location name patterns
    if (line.match(/^Location \d+:/i) || 
        line.match(/^\d+\.\s*[A-Z]/) || 
        line.match(/^[A-Z][A-Za-z\s]+:$/) ||
        line.match(/^[A-Z][A-Z\s]+(OFFICE|BUILDING|HOUSE|PARK|STUDIO|LOCATION)/i) ||
        line.match(/^(INT\.|EXT\.)/i) ||
        (line.length < 50 && line.match(/^[A-Z][A-Za-z\s]+(Building|Office|House|Studio|Park|Location|Room|Space)/i))) {
      
      // Save previous location
      if (currentLocation && currentLocation.name) {
        locations.push(currentLocation as Location)
      }
      
      // Start new location
      let locationName = line
        .replace(/^Location \d+:/i, '')
        .replace(/^\d+\.\s*/, '')
        .replace(/:$/, '')
        .replace(/^(INT\.|EXT\.)/i, '')
        .trim()
      
      // If location name is too generic, try to extract a better name
      if (locationName.length < 3) {
        locationName = `Location ${locations.length + 1}`
      }
      
      currentLocation = {
        name: locationName,
        type: determineLocationType(line),
        description: '',
        scenes: [],
        requirements: {
          features: [],
          accessibility: ''
        },
        logistics: {
          permits: 'not-required'
        },
        timeOfDay: []
      }
    }
    // Extract specific details
    else if (line.toLowerCase().includes('type:') || line.toLowerCase().includes('category:')) {
      if (currentLocation) {
        const typeText = line.replace(/.*type:\s*/i, '').replace(/.*category:\s*/i, '').toLowerCase()
        currentLocation.type = typeText.includes('exterior') ? 'exterior' : 'interior'
      }
    }
    else if (line.toLowerCase().includes('requirement')) {
      if (currentLocation && currentLocation.requirements) {
        const requirement = line.replace(/.*requirement[s]*:\s*/i, '').trim()
        currentLocation.requirements.features.push(requirement)
      }
    }
    else if (line.toLowerCase().includes('access') || line.toLowerCase().includes('permission')) {
      if (currentLocation && currentLocation.requirements) {
        currentLocation.requirements.accessibility = line.replace(/.*access[ibility]*:\s*/i, '').replace(/.*permission:\s*/i, '').trim()
      }
    }
    else if (line.toLowerCase().includes('permit') || line.toLowerCase().includes('license')) {
      if (currentLocation && currentLocation.logistics) {
        const permitText = line.toLowerCase()
        currentLocation.logistics.permits = permitText.includes('required') ? 'required' : 'not-required'
      }
    }
    else if (line.toLowerCase().includes('scene') || line.toLowerCase().includes('shot')) {
      if (currentLocation) {
        const scenes = extractScenes(line)
        currentLocation.scenes = scenes
      }
    }
    else if (line.toLowerCase().includes('time') || line.toLowerCase().includes('hour')) {
      if (currentLocation) {
        const timeMatch = line.match(/(morning|afternoon|evening|night|dawn|dusk|day)/gi)
        if (timeMatch) currentLocation.timeOfDay = timeMatch
      }
    }
    else if (line.toLowerCase().includes('cost') || line.toLowerCase().includes('budget')) {
      if (currentLocation && currentLocation.logistics) {
        currentLocation.logistics.estimatedCost = line.replace(/.*cost:\s*/i, '').replace(/.*budget:\s*/i, '').trim()
      }
    }
    else if (line.toLowerCase().includes('address')) {
      if (currentLocation) {
        currentLocation.address = line.replace(/.*address:\s*/i, '').trim()
      }
    }
    else if (line.toLowerCase().includes('parking')) {
      if (currentLocation && currentLocation.logistics) {
        const parkingMatch = line.match(/(\d+)\s*space/i)
        if (parkingMatch) {
          currentLocation.logistics.parkingSpaces = parseInt(parkingMatch[1])
        }
      }
    }
    else {
      // General description
      if (currentLocation) {
        currentLocation.description += (currentLocation.description ? ' ' : '') + line
      }
    }
  }
  
  // Don't forget the last location
  if (currentLocation && currentLocation.name) {
    locations.push(currentLocation as Location)
  }
  
  // If no locations were parsed, try to extract multiple locations from the content
  if (locations.length === 0 && cleanText.trim()) {
    // Try to split by common location separators
    const chunks = cleanText.split(/(?:\n\s*\n+|---+|\*\*Location|\*\*LOCATION|Location \d+:|### |## )/i)
      .filter(chunk => chunk.trim().length > 30)
    
    if (chunks.length > 1) {
      chunks.forEach((chunk, index) => {
        const trimmedChunk = chunk.trim()
        const firstLine = trimmedChunk.split('\n')[0].trim()
        const locationName = firstLine.length < 100 ? firstLine : `Location ${index + 1}`
        
        locations.push({
          name: locationName.replace(/^\d+\.\s*/, '').replace(/:$/, '').trim(),
          type: 'interior',
          description: trimmedChunk,
          scenes: [],
          requirements: {
            features: [],
            accessibility: ''
          },
          logistics: {
            permits: 'not-required'
          },
          timeOfDay: []
        })
      })
    } else {
      // Single location
      locations.push({
        name: 'Primary Location',
        type: 'interior',
        description: cleanText,
        scenes: [],
        requirements: {
          features: [],
          accessibility: ''
        },
        logistics: {
          permits: 'not-required'
        },
        timeOfDay: []
      })
    }
  }
  
  return { locations }
}

// Helper functions

const determineLocationType = (text: string): LocationType => {
  const lowerText = text.toLowerCase()
  if (lowerText.includes('ext.') || lowerText.includes('exterior') || lowerText.includes('outdoor')) {
    return 'exterior'
  } else if (lowerText.includes('int.') || lowerText.includes('interior') || lowerText.includes('indoor')) {
    return 'interior'
  } else if (lowerText.includes('int/ext') || lowerText.includes('interior/exterior')) {
    return 'interior-exterior'
  }
  return 'interior'
}

const extractScenes = (text: string): number[] => {
  const match = text.match(/scenes?[\s:]*([0-9,\s-]+)/i)
  if (!match) return []
  
  const sceneText = match[1].trim()
  const scenes: number[] = []
  
  // Handle ranges like "1-3"
  const rangeMatch = sceneText.match(/(\d+)-(\d+)/)
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1])
    const end = parseInt(rangeMatch[2])
    for (let i = start; i <= end; i++) {
      scenes.push(i)
    }
  } else {
    // Handle comma-separated like "1, 2, 3"
    const numbers = sceneText.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n))
    scenes.push(...numbers)
  }
  
  return scenes
}

/**
 * Validate location data
 */
export const validateLocation = (location: any): location is Location => {
  return (
    typeof location.name === 'string' &&
    typeof location.type === 'string' &&
    typeof location.description === 'string' &&
    Array.isArray(location.scenes) &&
    location.requirements &&
    typeof location.requirements.accessibility === 'string' &&
    Array.isArray(location.requirements.features) &&
    location.logistics &&
    typeof location.logistics.permits === 'string' &&
    Array.isArray(location.timeOfDay)
  )
}

