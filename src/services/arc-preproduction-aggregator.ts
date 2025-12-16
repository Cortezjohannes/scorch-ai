/**
 * Production Assistant Aggregation Utilities
 * Aggregates data from multiple episodes into arc-wide data
 */

import type {
  CastingData,
  CastMember,
  EquipmentData,
  EquipmentItem,
  PermitsData,
  Permit,
  LocationsData,
  Location
} from '@/types/preproduction'

/**
 * Aggregate casting data from all episodes in an arc
 */
export function aggregateCastingFromEpisodes(
  episodePreProdData: Record<number, any>
): CastingData {
  const castMap = new Map<string, CastMember>()
  
  console.log('🔍 aggregateCastingFromEpisodes - Input:', {
    episodeCount: Object.keys(episodePreProdData).length,
    episodeNumbers: Object.keys(episodePreProdData).map(k => parseInt(k))
  })
  
  Object.entries(episodePreProdData).forEach(([epNumStr, epPreProd]) => {
    const epNum = parseInt(epNumStr)
    const casting = epPreProd.casting
    
    console.log(`  Episode ${epNum}:`, {
      hasCasting: !!casting,
      castingType: typeof casting,
      hasCast: !!casting?.cast,
      castIsArray: Array.isArray(casting?.cast),
      castLength: casting?.cast?.length || 0,
      castingKeys: casting ? Object.keys(casting) : []
    })
    
    if (!casting?.cast || !Array.isArray(casting.cast)) {
      return
    }
    
    casting.cast.forEach((member: CastMember) => {
      // Use character name as key for deduplication
      const key = member.characterName.toLowerCase().trim()
      
      if (castMap.has(key)) {
        // Merge with existing cast member
        const existing = castMap.get(key)!
        const episodesUsed = existing.episodesUsed || []
        if (!episodesUsed.includes(epNum)) {
          episodesUsed.push(epNum)
        }
        
        // Merge scenes
        const mergedScenes = [...new Set([...(existing.scenes || []), ...(member.scenes || [])])]
        
        // Update stats
        castMap.set(key, {
          ...existing,
          scenes: mergedScenes,
          totalShootDays: Math.max(existing.totalShootDays || 0, member.totalShootDays || 0),
          episodesUsed,
          // Use most recent status
          status: member.status || existing.status,
          confirmed: existing.confirmed || member.confirmed,
          // Merge notes
          notes: [existing.notes, member.notes].filter(Boolean).join(' | '),
          actorNotes: [existing.actorNotes, member.actorNotes].filter(Boolean).join(' | ')
        })
      } else {
        // New cast member
        castMap.set(key, {
          ...member,
          // Store episodes used as metadata (not part of CastMember interface)
          episodesUsed: [epNum] as any,
          originalEpisode: epNum as any
        })
      }
    })
  })
  
  const cast = Array.from(castMap.values())
  
  // Calculate aggregate stats
  const totalConfirmed = cast.filter(c => c.confirmed).length
  const leads = cast.filter(c => c.role === 'lead')
  const supporting = cast.filter(c => c.role === 'supporting')
  
  return {
    cast,
    totalConfirmed,
    totalPending: cast.length - totalConfirmed,
    leads: leads.length,
    supporting: supporting.length,
    lastUpdated: Date.now(),
    updatedBy: ''
  }
}

/**
 * Aggregate equipment data from all episodes in an arc
 */
export function aggregateEquipmentFromEpisodes(
  episodePreProdData: Record<number, any>
): EquipmentData {
  const equipmentMap = new Map<string, EquipmentItem>()
  
  console.log('🔍 aggregateEquipmentFromEpisodes - Input:', {
    episodeCount: Object.keys(episodePreProdData).length,
    episodeNumbers: Object.keys(episodePreProdData).map(k => parseInt(k))
  })
  
  Object.entries(episodePreProdData).forEach(([epNumStr, epPreProd]) => {
    const epNum = parseInt(epNumStr)
    const equipment = epPreProd.equipment
    
    console.log(`  Episode ${epNum}:`, {
      hasEquipment: !!equipment,
      equipmentType: typeof equipment,
      equipmentKeys: equipment ? Object.keys(equipment) : [],
      hasItems: !!equipment?.items,
      itemsIsArray: Array.isArray(equipment?.items),
      itemsLength: equipment?.items?.length || 0,
      hasCamera: !!equipment?.camera,
      cameraLength: equipment?.camera?.length || 0,
      hasLighting: !!equipment?.lighting,
      lightingLength: equipment?.lighting?.length || 0
    })
    
    if (!equipment) {
      return
    }
    
    // Equipment can be stored in category arrays (camera, lens, lighting, etc.) OR in items array
    const allItems: EquipmentItem[] = []
    
    // Check for category arrays (standard EquipmentData structure)
    const categories: Array<'camera' | 'lens' | 'lighting' | 'audio' | 'grip' | 'other'> = 
      ['camera', 'lens', 'lighting', 'audio', 'grip', 'other']
    
    categories.forEach(category => {
      if (equipment[category] && Array.isArray(equipment[category])) {
        equipment[category].forEach((item: EquipmentItem) => {
          allItems.push({ ...item, category })
        })
      }
    })
    
    // Also check for items array (alternative structure)
    if (equipment.items && Array.isArray(equipment.items)) {
      equipment.items.forEach((item: EquipmentItem) => {
        allItems.push(item)
      })
    }
    
    if (allItems.length === 0) {
      return
    }
    
    allItems.forEach((item: EquipmentItem) => {
      // Use name + category as key for deduplication
      const key = `${item.name?.toLowerCase().trim()}_${item.category || 'other'}`
      
      if (equipmentMap.has(key)) {
        // Merge with existing equipment
        const existing = equipmentMap.get(key)!
        const episodesUsed = (existing as any).episodesUsed || []
        if (!episodesUsed.includes(epNum)) {
          episodesUsed.push(epNum)
        }
        
        // Aggregate quantities
        const totalQuantity = (existing.quantity || 0) + (item.quantity || 1)
        
        // Use highest cost if different
        const maxCost = Math.max(existing.totalCost || 0, item.totalCost || 0)
        
        equipmentMap.set(key, {
          ...existing,
          quantity: totalQuantity,
          totalCost: maxCost,
          episodesUsed: episodesUsed as any,
          // Merge notes
          notes: [existing.notes, item.notes].filter(Boolean).join(' | ')
        } as any)
      } else {
        // New equipment item
        equipmentMap.set(key, {
          ...item,
          episodesUsed: [epNum] as any,
          originalEpisode: epNum as any
        } as any)
      }
    })
  })
  
  const allEquipment = Array.from(equipmentMap.values())
  
  // Group by category for EquipmentData structure
  const camera: EquipmentItem[] = []
  const lens: EquipmentItem[] = []
  const lighting: EquipmentItem[] = []
  const audio: EquipmentItem[] = []
  const grip: EquipmentItem[] = []
  const other: EquipmentItem[] = []
  
  allEquipment.forEach(item => {
    switch (item.category) {
      case 'camera':
        camera.push(item)
        break
      case 'lens':
        lens.push(item)
        break
      case 'lighting':
        lighting.push(item)
        break
      case 'audio':
        audio.push(item)
        break
      case 'grip':
        grip.push(item)
        break
      default:
        other.push(item)
    }
  })
  
  // Calculate aggregate stats
  const totalCost = allEquipment.reduce((sum, item) => sum + (item.totalCost || 0), 0)
  const obtainedItems = allEquipment.filter(item => item.status === 'obtained' || item.status === 'reserved').length
  
  return {
    episodeNumber: 0, // Arc-level, not episode-specific
    episodeTitle: '',
    totalItems: allEquipment.length,
    obtainedItems,
    totalCost,
    camera,
    lens,
    lighting,
    audio,
    grip,
    other,
    lastUpdated: Date.now(),
    updatedBy: ''
  }
}

/**
 * Aggregate permits data from all episodes in an arc
 */
export function aggregatePermitsFromEpisodes(
  episodePreProdData: Record<number, any>
): PermitsData {
  const permitsMap = new Map<string, Permit>()
  
  console.log('🔍 aggregatePermitsFromEpisodes - Input:', {
    episodeCount: Object.keys(episodePreProdData).length,
    episodeNumbers: Object.keys(episodePreProdData).map(k => parseInt(k))
  })
  
  Object.entries(episodePreProdData).forEach(([epNumStr, epPreProd]) => {
    const epNum = parseInt(epNumStr)
    const permits = epPreProd.permits
    
    console.log(`  Episode ${epNum}:`, {
      hasPermits: !!permits,
      permitsType: typeof permits,
      hasPermitsArray: !!permits?.permits,
      permitsIsArray: Array.isArray(permits?.permits),
      permitsLength: permits?.permits?.length || 0,
      permitsKeys: permits ? Object.keys(permits) : []
    })
    
    if (!permits?.permits || !Array.isArray(permits.permits)) {
      return
    }
    
    permits.permits.forEach((permit: Permit) => {
      // Use name + type + location as key for deduplication
      const key = `${permit.name?.toLowerCase().trim()}_${permit.type}_${permit.location?.toLowerCase().trim() || ''}`
      
      if (permitsMap.has(key)) {
        // Merge with existing permit
        const existing = permitsMap.get(key)!
        const episodesUsed = existing.episodesUsed || []
        if (!episodesUsed.includes(epNum)) {
          episodesUsed.push(epNum)
        }
        
        // Use highest cost if different
        const maxCost = Math.max(existing.cost || 0, permit.cost || 0)
        
        // Use most recent status
        const status = permit.status || existing.status
        
        permitsMap.set(key, {
          ...existing,
          cost: maxCost,
          status,
          episodesUsed,
          // Merge notes
          notes: [existing.notes, permit.notes].filter(Boolean).join(' | ')
        })
      } else {
        // New permit
        permitsMap.set(key, {
          ...permit,
          episodesUsed: [epNum],
          originalEpisode: epNum
        })
      }
    })
  })
  
  const permits = Array.from(permitsMap.values())
  
  return {
    permits,
    checklist: [], // Will be populated from first episode or generated separately
    lastUpdated: Date.now()
  }
}

/**
 * Aggregate locations data from all episodes in an arc
 * @deprecated Locations are now generated at arc level, not aggregated from episodes.
 * This function is kept for migration purposes only.
 */
export function aggregateLocationsFromEpisodes(
  episodePreProdData: Record<number, any>
): LocationsData {
  const locationMap = new Map<string, Location>()
  
  console.log('🔍 aggregateLocationsFromEpisodes - Input:', {
    episodeCount: Object.keys(episodePreProdData).length,
    episodeNumbers: Object.keys(episodePreProdData).map(k => parseInt(k))
  })
  
  Object.entries(episodePreProdData).forEach(([epNumStr, epPreProd]) => {
    const epNum = parseInt(epNumStr)
    const locations = epPreProd.locations
    
    // Log ALL properties of the locations object to see what's actually there
    const locationsKeys = locations ? Object.keys(locations) : []
    const allArrayProperties = locations && typeof locations === 'object' && !Array.isArray(locations)
      ? Object.entries(locations)
          .filter(([k, v]) => Array.isArray(v))
          .map(([k, v]) => ({ 
            key: k, 
            length: (v as any[]).length, 
            firstItem: (v as any[]).length > 0 ? (v as any[])[0] : null,
            firstItemKeys: (v as any[]).length > 0 && typeof (v as any[])[0] === 'object' ? Object.keys((v as any[])[0]) : []
          }))
      : []
    
    console.log(`  Episode ${epNum}:`, {
      hasLocations: !!locations,
      locationsType: typeof locations,
      isNull: locations === null,
      isUndefined: locations === undefined,
      isObject: locations && typeof locations === 'object' && !Array.isArray(locations),
      isArray: Array.isArray(locations),
      locationsKeys: locationsKeys,
      // Check specific properties
      hasLocationsArray: !!locations?.locations,
      locationsArrayLength: locations?.locations?.length || 0,
      hasSelectedLocations: !!(locations as any)?.selectedLocations,
      selectedLocationsLength: (locations as any)?.selectedLocations?.length || 0,
      // All array properties with details
      allArrayProperties: allArrayProperties,
      // Log full structure for debugging - FULL STRUCTURE, not truncated
      locationsStructure: locations ? JSON.stringify(locations, null, 2) : 'null/undefined'
    })
    
    // Handle different data structures
    let locationsArray: Location[] = []
    
    if (locations) {
      // Case 1: locations.locations (standard LocationsData structure)
      if (locations.locations && Array.isArray(locations.locations) && locations.locations.length > 0) {
        locationsArray = locations.locations
        console.log(`    ✅ Episode ${epNum}: Found ${locationsArray.length} locations in locations.locations`)
      }
      // Case 2: locations.selectedLocations (alternative structure used by LocationsTab)
      else if ((locations as any).selectedLocations && Array.isArray((locations as any).selectedLocations) && (locations as any).selectedLocations.length > 0) {
        locationsArray = (locations as any).selectedLocations
        console.log(`    ✅ Episode ${epNum}: Found ${locationsArray.length} locations in locations.selectedLocations`)
      }
      // Case 3: locations is directly an array (legacy or different structure)
      else if (Array.isArray(locations) && locations.length > 0) {
        locationsArray = locations
        console.log(`    ✅ Episode ${epNum}: Found ${locationsArray.length} locations (direct array)`)
      }
      // Case 4: Check for other possible structures
      else if (typeof locations === 'object') {
        // Try to find any array property that might contain locations
        const possibleArrays = Object.entries(locations)
          .filter(([k, v]) => Array.isArray(v) && (v as any[]).length > 0)
          .map(([k, v]) => ({ key: k, array: v as any[] }))
        
        if (possibleArrays.length > 0) {
          console.log(`    ⚠️  Episode ${epNum}: Found ${possibleArrays.length} non-empty array properties:`, possibleArrays.map(a => `${a.key} (${a.array.length} items)`))
          // Try to find an array that looks like locations (has objects with 'name' property)
          const locationArray = possibleArrays.find(({ array }) => 
            array.length > 0 && 
            array[0] && 
            typeof array[0] === 'object' && 
            ('name' in array[0] || 'id' in array[0])
          )
          
          if (locationArray) {
            locationsArray = locationArray.array as Location[]
            console.log(`    ✅ Episode ${epNum}: Found ${locationsArray.length} locations in ${locationArray.key}`)
          } else {
            // If no array looks like locations, log what we found
            console.log(`    ⚠️  Episode ${epNum}: Found arrays but none look like locations:`, possibleArrays.map(a => a.key))
          }
        }
      }
    }
    
    if (locationsArray.length === 0) {
      console.log(`    ⚠️  Episode ${epNum}: No locations found after checking all structures`)
      return
    }
    
    locationsArray.forEach((loc: Location) => {
      // Use recurringLocationKey if available, otherwise use name + address
      const key = loc.recurringLocationKey || 
        `${loc.name?.toLowerCase().trim()}_${loc.address?.toLowerCase().trim() || ''}`
      
      if (locationMap.has(key)) {
        // Merge with existing location
        const existing = locationMap.get(key)!
        const episodesUsed = (existing as any).episodesUsed || []
        if (!episodesUsed.includes(epNum)) {
          episodesUsed.push(epNum)
        }
        
        // Merge scenes
        const mergedScenes = [...new Set([...(existing.scenes || []), ...(loc.scenes || [])])]
        
        // Use highest cost if different
        const maxCost = Math.max(existing.cost || 0, loc.cost || 0)
        const maxPermitCost = Math.max(existing.permitCost || 0, loc.permitCost || 0)
        
        locationMap.set(key, {
          ...existing,
          scenes: mergedScenes,
          cost: maxCost,
          permitCost: maxPermitCost,
          episodesUsed: episodesUsed as any,
          // Merge notes
          notes: [existing.notes, loc.notes].filter(Boolean).join(' | ')
        } as any)
      } else {
        // New location
        locationMap.set(key, {
          ...loc,
          episodesUsed: [epNum] as any,
          originalEpisode: epNum as any
        } as any)
      }
    })
  })
  
  const aggregatedLocations = Array.from(locationMap.values())
  
  console.log('📍 aggregateLocationsFromEpisodes - Results:', {
    totalLocations: aggregatedLocations.length,
    locationNames: aggregatedLocations.map(loc => loc.name || 'Unnamed'),
    totalScenes: aggregatedLocations.reduce((sum, loc) => sum + (loc.scenes?.length || 0), 0),
    totalCost: aggregatedLocations.reduce((sum, loc) => sum + (loc.cost || 0) + (loc.permitCost || 0), 0)
  })
  
  return {
    episodeNumber: 0, // Arc-level, not episode-specific
    episodeTitle: '', // Arc-level
    totalLocations: aggregatedLocations.length,
    locations: aggregatedLocations,
    lastUpdated: Date.now(),
    updatedBy: '' // Will be set by caller if needed
  }
}

