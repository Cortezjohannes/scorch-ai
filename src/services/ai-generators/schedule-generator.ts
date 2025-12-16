// AI-powered shooting schedule generator with cross-episode optimization
import { EngineAIRouter } from '@/services/engine-ai-router'
import type {
  ShootingScheduleData,
  ShootingDay,
  SceneReference,
  CastReference,
  ScriptBreakdownData,
  LocationsData,
  CastingData,
  EquipmentData,
  RehearsalSession,
  ArcLocationsData,
  ArcLocationGroup,
  ShootingLocationSuggestion
} from '@/types/preproduction'

// Local type definition for GeneratedScript (not exported from types)
interface GeneratedScript {
  title: string
  episodeNumber?: number
  pages: any[]
  metadata?: {
    pageCount?: number
    sceneCount?: number
    characterCount?: number
    estimatedRuntime?: string
    generatedAt?: number
  }
}

interface ScheduleGenerationParams {
  storyBibleId: string
  episodeNumbers: number[] // Single or multiple episodes
  breakdownData: Record<number, ScriptBreakdownData> // Keyed by episode number
  scriptsData: Record<number, GeneratedScript>
  storyBible: any
  locationsData?: Record<number, LocationsData> // Episode-level locations (legacy)
  arcLocationsData?: ArcLocationsData // Arc-level locations (preferred)
  castingData?: Record<number, CastingData>
  equipmentData?: Record<number, EquipmentData>
  schedulingMode: 'single-episode' | 'cross-episode'
  optimizationPriority: 'location' | 'cast' | 'balanced'
  userId: string
}

/**
 * Get selected venue for a location group (selectedSuggestionId or cheapest)
 */
function getSelectedVenue(locationGroup: ArcLocationGroup): ShootingLocationSuggestion | null {
  if (!locationGroup.shootingLocationSuggestions || locationGroup.shootingLocationSuggestions.length === 0) {
    return null
  }

  // Use selectedSuggestionId if available
  if (locationGroup.selectedSuggestionId) {
    const selected = locationGroup.shootingLocationSuggestions.find(
      s => s.id === locationGroup.selectedSuggestionId
    )
    if (selected) return selected
  }

  // Fallback to cheapest option
  const sorted = [...locationGroup.shootingLocationSuggestions].sort((a, b) => {
    const costA = (a.costBreakdown?.dayRate || a.estimatedCost || 0) + (a.permitCost || a.logistics?.permitCost || 0) + (a.depositAmount || 0)
    const costB = (b.costBreakdown?.dayRate || b.estimatedCost || 0) + (b.permitCost || b.logistics?.permitCost || 0) + (b.depositAmount || 0)
    return costA - costB
  })
  return sorted[0] || null
}

/**
 * Map breakdown scenes to location groups and selected venues
 */
function mapScenesToLocationGroups(
  breakdownData: Record<number, ScriptBreakdownData>,
  arcLocationsData: ArcLocationsData
): Map<string, {
  locationGroup: ArcLocationGroup
  selectedVenue: ShootingLocationSuggestion | null
  scenes: Array<{ episodeNumber: number; sceneNumber: number; location: string }>
}> {
  const mapping = new Map<string, {
    locationGroup: ArcLocationGroup
    selectedVenue: ShootingLocationSuggestion | null
    scenes: Array<{ episodeNumber: number; sceneNumber: number; location: string }>
  }>()

  // Build scene lookup: episodeNumber -> sceneNumber -> location
  const sceneLocationMap = new Map<string, string>() // key: "epNum:sceneNum"
  
  Object.entries(breakdownData).forEach(([epNumStr, breakdown]) => {
    const epNum = parseInt(epNumStr)
    breakdown.scenes?.forEach(scene => {
      const key = `${epNum}:${scene.sceneNumber}`
      sceneLocationMap.set(key, scene.location || 'Unspecified Location')
    })
  })

  // For each location group, find matching scenes
  arcLocationsData.locationGroups.forEach(locationGroup => {
    const matchingScenes: Array<{ episodeNumber: number; sceneNumber: number; location: string }> = []

    locationGroup.episodeUsage?.forEach(usage => {
      usage.sceneNumbers?.forEach(sceneNum => {
        const key = `${usage.episodeNumber}:${sceneNum}`
        const location = sceneLocationMap.get(key)
        if (location) {
          matchingScenes.push({
            episodeNumber: usage.episodeNumber,
            sceneNumber: sceneNum,
            location
          })
        }
      })
    })

    if (matchingScenes.length > 0) {
      const selectedVenue = getSelectedVenue(locationGroup)
      const canonicalId = locationGroup.canonicalLocationId || locationGroup.id
      mapping.set(canonicalId, {
        locationGroup,
        selectedVenue,
        scenes: matchingScenes
      })
    }
  })

  return mapping
}

export async function generateSchedule(params: ScheduleGenerationParams): Promise<ShootingScheduleData> {
  const {
    storyBible,
    episodeNumbers,
    breakdownData,
    scriptsData,
    locationsData,
    castingData,
    schedulingMode,
    optimizationPriority,
    userId
  } = params

  console.log(`🎬 Generating ${schedulingMode} schedule for episodes:`, episodeNumbers)

  // Validate all episodes have breakdowns
  for (const epNum of episodeNumbers) {
    if (!breakdownData[epNum] || !breakdownData[epNum].scenes || breakdownData[epNum].scenes.length === 0) {
      throw new Error(`Episode ${epNum} does not have a script breakdown. Generate breakdown first.`)
    }
  }

  // Map scenes to location groups if arcLocationsData is available
  let locationMapping: Map<string, {
    locationGroup: ArcLocationGroup
    selectedVenue: ShootingLocationSuggestion | null
    scenes: Array<{ episodeNumber: number; sceneNumber: number; location: string }>
  }> | null = null

  if (params.arcLocationsData) {
    locationMapping = mapScenesToLocationGroups(breakdownData, params.arcLocationsData)
    console.log(`📍 Mapped ${locationMapping.size} location groups to scenes`)
  }

  // Calculate total scenes and determine if batching is needed
  let totalScenes = 0
  const locationSceneCounts = new Map<string, number>()
  Object.values(breakdownData).forEach(breakdown => {
    breakdown.scenes?.forEach(scene => {
      totalScenes++
      const location = scene.location || 'Unspecified Location'
      locationSceneCounts.set(location, (locationSceneCounts.get(location) || 0) + 1)
    })
  })

  // Group locations with their scenes (keep all scenes for a location together)
  const locationGroups: Array<{ location: string; scenes: number }> = []
  locationSceneCounts.forEach((sceneCount, location) => {
    locationGroups.push({ location, scenes: sceneCount })
  })
  
  // Sort by scene count (descending) to prioritize locations with more scenes
  locationGroups.sort((a, b) => b.scenes - a.scenes)

  // Batch by scene count (not location count) to prevent truncation
  // Target ~30-40 scenes per batch to stay within token limits
  const MAX_SCENES_PER_BATCH = 35
  const batches: Array<{ locations: string[]; totalScenes: number }> = []
  let currentBatch: { locations: string[]; totalScenes: number } = { locations: [], totalScenes: 0 }

  locationGroups.forEach(({ location, scenes }) => {
    // If adding this location would exceed batch limit, start new batch
    if (currentBatch.totalScenes + scenes > MAX_SCENES_PER_BATCH && currentBatch.locations.length > 0) {
      batches.push(currentBatch)
      currentBatch = { locations: [], totalScenes: 0 }
    }
    // Add location to current batch (all its scenes stay together)
    currentBatch.locations.push(location)
    currentBatch.totalScenes += scenes
  })

  // Add final batch if it has locations
  if (currentBatch.locations.length > 0) {
    batches.push(currentBatch)
  }

  console.log(`📦 Processing ${totalScenes} scenes across ${locationGroups.length} locations`)
  console.log(`   Grouped into ${batches.length} batch(es) to prevent truncation`)

  // If we have many scenes, process in batches
  if (batches.length > 1) {
    console.log('🔄 Using batch processing to prevent truncation...')
    const allDays: ShootingDay[] = []
    let currentDayNumber = 1

    for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
      const batch = batches[batchIdx]
      const batchLocations = batch.locations
      console.log(`\n📦 Batch ${batchIdx + 1}/${batches.length}: Processing ${batchLocations.length} locations (${batch.totalScenes} scenes)...`)

      // Filter breakdown data to only include scenes from this batch's locations
      const batchBreakdownData: Record<number, ScriptBreakdownData> = {}
      Object.entries(breakdownData).forEach(([epNumStr, breakdown]) => {
        const epNum = parseInt(epNumStr)
        const filteredScenes = breakdown.scenes?.filter(scene => 
          batchLocations.includes(scene.location || '')
        ) || []
        
        if (filteredScenes.length > 0) {
          batchBreakdownData[epNum] = {
            ...breakdown,
            scenes: filteredScenes
          }
        }
      })

      // Get episodes that have scenes in this batch
      const batchEpisodeNumbers = Object.keys(batchBreakdownData).map(n => parseInt(n))

      if (batchEpisodeNumbers.length === 0) {
        console.log(`  ⏭️  Skipping batch ${batchIdx + 1} (no scenes)`)
        continue
      }

      const systemPrompt = buildSystemPrompt(schedulingMode, optimizationPriority)
      const userPrompt = buildUserPrompt(
        storyBible,
        batchEpisodeNumbers,
        batchBreakdownData,
        locationsData,
        castingData,
        schedulingMode,
        params.arcLocationsData,
        locationMapping,
        batchIdx + 1,
        batches.length,
        batchLocations
      )

      try {
        console.log(`  🤖 Generating schedule for batch ${batchIdx + 1}...`)
        const response = await EngineAIRouter.generateContent({
          prompt: userPrompt,
          systemPrompt: systemPrompt,
          temperature: 0.6,
          maxTokens: 8000, // Increased from 4000 to prevent truncation
          engineId: 'schedule-generator',
          forceProvider: 'azure',
          allowFallback: false
        })

        console.log(`  ✅ Batch ${batchIdx + 1} response received:`, response.metadata.contentLength, 'characters')
        console.log(`  📄 Batch ${batchIdx + 1} response preview:`, response.content.substring(0, 300))

        const batchSchedule = parseSchedule(
          response.content,
          batchEpisodeNumbers,
          batchBreakdownData,
          schedulingMode,
          userId,
          locationMapping
        )

        // Renumber days to be sequential
        batchSchedule.days.forEach(day => {
          day.dayNumber = currentDayNumber++
          allDays.push(day)
        })

        console.log(`  ✅ Batch ${batchIdx + 1} complete: ${batchSchedule.days.length} days`)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`  ❌ Error in batch ${batchIdx + 1}:`, {
          error: errorMessage,
          stack: error instanceof Error ? error.stack : '',
          batchLocations,
          batchEpisodeNumbers
        })
        
        // Fallback for this batch
        const batchFallback = buildFallbackSchedule(
          batchEpisodeNumbers,
          batchBreakdownData,
          schedulingMode,
          userId,
          params.arcLocationsData,
          locationMapping
        )
        batchFallback.days.forEach(day => {
          day.dayNumber = currentDayNumber++
          allDays.push(day)
        })
        console.warn(`  ⚠️  Using fallback for batch ${batchIdx + 1}. Error: ${errorMessage}`)
      }
    }

    // Combine all batches into final schedule
    const scheduleData: ShootingScheduleData = {
      episodeNumber: schedulingMode === 'single-episode' ? episodeNumbers[0] : undefined,
      episodeNumbers: schedulingMode === 'cross-episode' ? episodeNumbers : undefined,
      episodeTitle: schedulingMode === 'single-episode' 
        ? breakdownData[episodeNumbers[0]]?.episodeTitle 
        : undefined,
      schedulingMode: schedulingMode as 'single-episode' | 'cross-episode',
      optimizationPriority: 'location',
      totalShootDays: allDays.length,
      days: allDays,
      restDays: [],
      rehearsals: [],
      lastUpdated: Date.now(),
      updatedBy: userId
    }

    console.log(`\n✅ Schedule generated from ${batches.length} batches: ${scheduleData.totalShootDays} shoot days`)
    return scheduleData
  }

  // Single batch (original flow)
  const systemPrompt = buildSystemPrompt(schedulingMode, optimizationPriority)
  const userPrompt = buildUserPrompt(
    storyBible,
    episodeNumbers,
    breakdownData,
    locationsData,
    castingData,
    schedulingMode,
    params.arcLocationsData,
    locationMapping
  )

  try {
    console.log('🤖 Calling AI for schedule generation...')
    const response = await EngineAIRouter.generateContent({
      prompt: userPrompt,
      systemPrompt: systemPrompt,
      temperature: 0.6, // Balance creativity with structure
      maxTokens: 8000, // Increased from 4000 to prevent truncation
      engineId: 'schedule-generator',
      forceProvider: 'azure',
      allowFallback: false
    })

    console.log('✅ AI Response received:', response.metadata.contentLength, 'characters')
    console.log('📄 Response preview (first 500 chars):', response.content.substring(0, 500))

    const scheduleData = parseSchedule(
      response.content,
      episodeNumbers,
      breakdownData,
      schedulingMode,
      userId,
      locationMapping
    )

    console.log(`✅ Schedule generated: ${scheduleData.totalShootDays} shoot days, ${scheduleData.days.length} total days`)

    return scheduleData
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : ''
    console.error('❌ Error generating schedule:', {
      error: errorMessage,
      stack: errorStack,
      episodeNumbers,
      schedulingMode
    })
    
    // Fallback: build a basic location-grouped schedule so users aren't blocked
    const fallback = buildFallbackSchedule(
      episodeNumbers,
      breakdownData,
      schedulingMode,
      userId,
      params.arcLocationsData,
      locationMapping
    )
    console.warn(`⚠️ Returning fallback schedule. Error: ${errorMessage}`)
    return fallback
  }
}

function buildSystemPrompt(schedulingMode: string, priority: string): string {
  return `You are an experienced 1st Assistant Director (1st AD) specializing in micro-budget web series production.

**CRITICAL RULES:**

1. **LOCATION OPTIMIZATION IS PARAMOUNT**: Group all scenes at the same location together, even across multiple episodes. Location changes cost 2-4 hours of production time and significant money.

2. **STRIPBOARD METHODOLOGY**:
   - Identify all unique locations across episodes
   - Group scenes by location FIRST, episode second
   - Schedule complex scenes (stunts, effects, emotional) when cast/crew are fresh (early in day/week)
   - Consider weather: outdoor scenes need contingencies
   - Always provide weather contingency plans for outdoor locations

3. **MICRO-BUDGET CONSTRAINTS**:
   - Minimize equipment moves (setup/teardown takes 30-60 minutes)
   - Group similar camera setups together
   - Schedule cast efficiently (minimize their wait time)
   - Build in buffer time for setup/breakdown between locations
   - 3-5 scenes per shoot day maximum for micro-budget
   - NEVER exceed 10-hour shoot days

4. **CROSS-EPISODE EFFICIENCY** (when applicable):
   - If shooting Episode 1 Scene 5 and Episode 3 Scene 2 at same location, shoot both on same day
   - Maintain episode continuity awareness (costume changes, character arcs, props)
   - Clearly note which episodes are being shot per day
   - Prioritize high-priority scenes first

5. **REALISTIC SCHEDULING**:
   - Account for setup time (30-60 min per location change)
   - Build in lunch breaks (1 hour) and rest periods
   - Allow wrap time for equipment pack-down
   - Consider cast/crew energy levels throughout the day
   - Schedule emotionally demanding scenes earlier in the day when performers are fresh

6. **CALL TIMES AND LOGISTICS**:
   - Standard call times are 8:00 AM or 9:00 AM for micro-budget
   - Allow 30-45 minutes for cast/crew arrival and setup before first scene
   - Estimated wrap times should account for all scenes plus buffer
   - Note special equipment requirements for each day

7. **DAY COUNT LIMITS (DO NOT EXCEED)**:
   - Per arc: target **3-5 total shoot days**, but allow up to **7** max if truly needed.
   - Whole series: target **~3 weeks (~21 days)**; hard cap **≤ 4 weeks (28 days)** across all arcs/episodes.
   - If needed, increase scenes per day while staying within 10-hour days; prioritize location grouping to hit the cap.

8. **STRICT LOCATION-BASED SCHEDULING (CRITICAL)**:
   - **ONE LOCATION PER DAY RULE**: Each shooting day must contain scenes from ONLY ONE location.
   - **Complete location before moving on**: All scenes at a location must be scheduled in consecutive days (1-3 days max per location) before moving to the next location.
   - **No multi-location days**: Never combine multiple locations in a single day, regardless of scene count or duration.
   - **Split by time if needed**: For exterior locations with both DAY and NIGHT scenes, you may split into separate consecutive days (Day 1: DAY scenes, Day 2: NIGHT scenes at same location).
   - **If location exceeds 10-hour day**: Split that location across 2-3 consecutive days (same location) until all scenes are scheduled, then move to next location.
   - **Use only locations actually appearing in the selected episodes**—ignore unused locations.
   - Name each day by its actual location; avoid generic labels like "remaining minor locations."

**OUTPUT FORMAT**: 
Provide STRICTLY valid JSON with an array of shooting days. Each day must contain:
- dayNumber (sequential)
- location (primary filming location for the day)
- callTime (HH:MM format)
- estimatedWrapTime (HH:MM format)
- scenes (array of scene objects with episodeNumber, sceneNumber, sceneTitle, estimatedDuration, priority, location)
- castRequired (array of character objects with characterName, actorName, isAvailable)
- crewRequired (array of strings: e.g., ["Director", "DP", "Sound"])
- equipmentRequired (array of strings: e.g., ["Camera", "Lights", "Sound kit"])
- specialNotes (string with important production notes)
- weatherContingency (string, required for outdoor locations)
- setupNotes (string with camera/lighting setup details)

NO markdown, NO code blocks, NO explanations - ONLY the JSON array of shooting days.

Current mode: ${schedulingMode}
Optimization priority: ${priority}`
}

function buildUserPrompt(
  storyBible: any,
  episodeNumbers: number[],
  breakdownData: Record<number, ScriptBreakdownData>,
  locationsData?: Record<number, LocationsData>,
  castingData?: Record<number, CastingData>,
  schedulingMode?: string,
  arcLocationsData?: ArcLocationsData,
  locationMapping?: Map<string, {
    locationGroup: ArcLocationGroup
    selectedVenue: ShootingLocationSuggestion | null
    scenes: Array<{ episodeNumber: number; sceneNumber: number; location: string }>
  }> | null,
  batchNumber?: number,
  totalBatches?: number,
  batchLocations?: string[]
): string {
  const seriesTitle = storyBible?.seriesTitle || storyBible?.title || 'Untitled Series'
  const seriesOverview = storyBible?.seriesOverview || ''
  const genre = storyBible?.genre || 'Drama'
  const tone = storyBible?.tone || 'Realistic'
  const worldSetting = storyBible?.worldBuilding?.setting || storyBible?.setting || ''
  const maxDays = Math.min(7, Math.max(3, Math.ceil(episodeNumbers.length / 2)))
  const targetSeriesDays = 21
  const maxSeriesDays = 28
  const maxHoursPerDay = 10
  const bufferMinutes = 60 // setup/teardown buffer
  const isExteriorLocation = (loc: string) => {
    const upper = (loc || '').toUpperCase()
    return upper.includes('EXT') || upper.includes('EXTERIOR') || upper.includes('OUTSIDE') || upper.includes('STREET') || upper.includes('PARK')
  }

  let prompt = batchNumber && totalBatches
    ? `Generate shooting schedule for BATCH ${batchNumber} of ${totalBatches} for "${seriesTitle}".\n`
    : `Generate an optimized shooting schedule for ${episodeNumbers.length} episode(s) of "${seriesTitle}".\n`
  
  if (batchNumber && totalBatches) {
    prompt += `**NOTE: This is batch ${batchNumber} of ${totalBatches}. Only schedule the locations provided in this batch. Day numbers will be adjusted when batches are combined.**\n`
  }
  prompt += `\n`

  prompt += `**SERIES CONTEXT:**\n`
  if (seriesOverview) {
    prompt += `Series Overview: ${seriesOverview}\n`
  }
  prompt += `Genre: ${genre}\n`
  prompt += `Tone: ${tone}\n`
  if (worldSetting) {
    prompt += `World Setting: ${worldSetting}\n`
  }
  prompt += `Scheduling Mode: ${schedulingMode}\n\n`
  prompt += `TOTAL SHOOT DAYS CAP: target 3-5 days; allow up to ${maxDays} days for this arc/selection if absolutely needed. If more episodes are included (full series), target ~${targetSeriesDays} days (≈3 weeks) and NEVER exceed ${maxSeriesDays} days total (4-week cap).\n`
  prompt += `\n**CRITICAL LOCATION RULES:**\n`
  prompt += `1. ONE LOCATION PER DAY: Each day must contain scenes from ONLY ONE location. Never combine multiple locations in a single day.\n`
  prompt += `2. COMPLETE LOCATION BEFORE MOVING ON: Schedule ALL scenes at a location in consecutive days (1-3 days max per location) before moving to the next location.\n`
  prompt += `3. SPLIT BY DURATION: If a location's scenes exceed ~${maxHoursPerDay} hours (including ${bufferMinutes} min buffer), split that location across 2-3 consecutive days (same location) until all scenes are scheduled.\n`
  prompt += `4. EXTERIOR DAY/NIGHT: For exterior locations with both DAY and NIGHT scenes, you may split into separate consecutive days (Day 1: DAY scenes, Day 2: NIGHT scenes at same location).\n`
  prompt += `5. NO RETURN TRIPS: Once you finish a location, do not return to it later. Complete all scenes at Location A before starting Location B.\n`
  prompt += `6. NAME BY LOCATION: Name each day by its actual location (use venue name if available from Locations tab).\n\n`

  // Aggregate all locations across episodes
  const allLocations = new Map<string, number>()
  const locationStats = new Map<
    string,
    { scenes: number; totalDuration: number; timeOfDayCounts: Record<string, number>; isExterior: boolean }
  >()
  const episodeSceneCounts = new Map<number, number>()

  episodeNumbers.forEach(epNum => {
    const breakdown = breakdownData[epNum]
    if (!breakdown || !breakdown.scenes) return

    episodeSceneCounts.set(epNum, breakdown.scenes.length)

    breakdown.scenes.forEach(scene => {
      const location = scene.location || 'Unspecified Location'
      allLocations.set(location, (allLocations.get(location) || 0) + 1)

       const existing = locationStats.get(location) || {
        scenes: 0,
        totalDuration: 0,
        timeOfDayCounts: {},
        isExterior: isExteriorLocation(location)
      }
      existing.scenes += 1
      existing.totalDuration += scene.estimatedShootTime || 45
      const todKey = (scene.timeOfDay || 'DAY').toUpperCase()
      existing.timeOfDayCounts[todKey] = (existing.timeOfDayCounts[todKey] || 0) + 1
      locationStats.set(location, existing)
    })
  })

  prompt += `**EPISODES TO SCHEDULE:**\n`
  episodeNumbers.forEach(epNum => {
    const breakdown = breakdownData[epNum]
    const episodeTitle = breakdown?.episodeTitle || `Episode ${epNum}`
    const sceneCount = episodeSceneCounts.get(epNum) || 0
    prompt += `- Episode ${epNum}: "${episodeTitle}" (${sceneCount} scenes)\n`
  })
  prompt += `\n`

  prompt += `**UNIQUE LOCATIONS IDENTIFIED (${allLocations.size} total):**\n`
  const sortedLocations = Array.from(allLocations.entries()).sort((a, b) => b[1] - a[1])
  
  if (batchNumber && totalBatches && batchLocations) {
    prompt += `**BATCH ${batchNumber}/${totalBatches} - SCHEDULE ONLY THESE LOCATIONS:**\n`
    // Show only locations in this batch
    const batchLocationSet = new Set(batchLocations)
    sortedLocations
      .filter(([location]) => batchLocationSet.has(location))
      .forEach(([location, count]) => {
        prompt += `- ${location}: ${count} scene(s)\n`
      })
    prompt += `\n⚠️ IMPORTANT: Only schedule the locations listed above. Do not schedule any other locations.\n\n`
  } else {
  // Limit to top 15 most-used locations to reduce prompt verbosity
  sortedLocations.slice(0, 15).forEach(([location, count]) => {
    prompt += `- ${location}: ${count} scene(s)\n`
  })
  if (sortedLocations.length > 15) {
    prompt += `- ... and ${sortedLocations.length - 15} more locations\n`
    }
  }
  prompt += `\n`

  // Location stats (no easy/complexity logic)
  prompt += `**LOCATION STATS (used in selected episodes only):**\n`
  sortedLocations.slice(0, 15).forEach(([location]) => {
    const stats = locationStats.get(location)
    if (!stats) return
    const todKeys = Object.entries(stats.timeOfDayCounts)
      .map(([k, v]) => `${k}:${v}`)
      .join(', ')
    const estimatedDays = Math.ceil(stats.totalDuration / (maxHoursPerDay * 60 - bufferMinutes))
    prompt += `- ${location}: ${stats.scenes} scene(s), ~${stats.totalDuration} min, time-of-day [${todKeys || 'DAY:unknown'}], exterior=${stats.isExterior ? 'yes' : 'no'}, estimated days needed: ${estimatedDays}\n`
  })
  prompt += `\n`

  // Add real venue information from Locations tab if available
  if (locationMapping && locationMapping.size > 0) {
    prompt += `**REAL-WORLD VENUE INFORMATION (from Locations tab):**\n`
    locationMapping.forEach(({ locationGroup, selectedVenue, scenes }) => {
      const locationName = locationGroup.parentLocationName || 'Unknown Location'
      if (selectedVenue) {
        const venueName = selectedVenue.venueName || locationName
        const address = selectedVenue.address || selectedVenue.searchGuidance || 'Address TBD'
        const logistics: string[] = []
        if (selectedVenue.logistics?.parking) logistics.push('Parking: Available')
        if (selectedVenue.logistics?.power) logistics.push('Power: Available')
        if (selectedVenue.logistics?.restrooms !== undefined) logistics.push(`Restrooms: ${selectedVenue.logistics.restrooms ? 'Yes' : 'No'}`)
        
        const dayRate = selectedVenue.costBreakdown?.dayRate || selectedVenue.estimatedCost || 0
        const permitCost = selectedVenue.permitCost || selectedVenue.logistics?.permitCost || 0
        const depositAmount = selectedVenue.depositAmount || 0
        const cost = dayRate + permitCost + depositAmount
        const permitRequired = selectedVenue.logistics?.permitRequired || selectedVenue.permitCost !== undefined || false
        const insuranceRequired = selectedVenue.insuranceRequired || false
        
        prompt += `- ${locationName} → ${venueName} (${address})\n`
        if (logistics.length > 0) {
          prompt += `  Logistics: ${logistics.join(', ')}\n`
        }
        prompt += `  Cost: $${cost}/day`
        if (permitRequired) prompt += ` | Permit required: Yes`
        if (insuranceRequired) prompt += ` | Insurance required: Yes`
        prompt += `\n`
        prompt += `  Scenes: ${scenes.length} scene(s) across episodes ${[...new Set(scenes.map(s => s.episodeNumber))].join(', ')}\n`
      } else {
        prompt += `- ${locationName}: Venue selection pending (${scenes.length} scene(s))\n`
      }
    })
    prompt += `\n`
    prompt += `**IMPORTANT**: Use the real venue names above (e.g., "${Array.from(locationMapping.values())[0]?.selectedVenue?.venueName || 'Venue Name'}") in your schedule day labels, NOT generic location names like "Coffee Shop" or "Office".\n\n`
  }

  // Scene details for each episode
  prompt += `**DETAILED SCENE BREAKDOWN:**\n\n`
  episodeNumbers.forEach(epNum => {
    const breakdown = breakdownData[epNum]
    if (!breakdown || !breakdown.scenes) return

    prompt += `=== EPISODE ${epNum}: ${breakdown.episodeTitle || `Episode ${epNum}`} ===\n`
    breakdown.scenes.forEach(scene => {
      // Shorten character names if more than 5
      const characters = scene.characters.map(c => c.name)
      const characterStr = characters.length > 5 
        ? characters.slice(0, 3).map(n => n.substring(0, 3)).join(', ') + ` +${characters.length - 3}`
        : characters.join(', ') || 'None'
      
      prompt += `Scene ${scene.sceneNumber}: ${scene.sceneTitle || `Scene ${scene.sceneNumber}`}\n`
      prompt += `  Location: ${scene.location || 'Unspecified'}\n`
      prompt += `  Time of Day: ${scene.timeOfDay || 'DAY'}\n`
      prompt += `  Characters: ${characterStr}\n`
      prompt += `  Duration: ${scene.estimatedShootTime || 30}min\n`
      // Only include special requirements if they exist (reduce verbosity)
      if (scene.specialRequirements && scene.specialRequirements.length > 0) {
        prompt += `  Requirements: ${scene.specialRequirements.slice(0, 2).join(', ')}\n`
      }
      prompt += `\n`
    })
    prompt += `\n`
  })

  // Cast availability if provided
  if (castingData) {
    prompt += `**CAST INFORMATION:**\n`
    episodeNumbers.forEach(epNum => {
      const casting = castingData[epNum]
      if (!casting || !casting.cast) return

      casting.cast.forEach(member => {
        prompt += `- ${member.characterName}${member.actorName ? ` (${member.actorName})` : ''}`
        
        if (member.availabilityWindows && member.availabilityWindows.length > 0) {
          prompt += ` - Available: ${member.availabilityWindows.map(w => `${w.startDate} to ${w.endDate}`).join(', ')}`
        } else if (member.availabilityNotes) {
          prompt += ` - ${member.availabilityNotes}`
        }
        
        if (member.preferredShootingDays && member.preferredShootingDays.length > 0) {
          prompt += ` - Prefers: ${member.preferredShootingDays.join(', ')}`
        }
        
        if (member.blackoutDates && member.blackoutDates.length > 0) {
          prompt += ` - NOT available: ${member.blackoutDates.join(', ')}`
        }
        
        prompt += `\n`
      })
    })
    prompt += `\n`
  }

  prompt += `**INSTRUCTIONS:**\n`
  if (schedulingMode === 'cross-episode') {
    prompt += `Create a CROSS-EPISODE optimized schedule that groups scenes by LOCATION across all episodes.\n`
    prompt += `Example: If Episode 1 Scene 3 and Episode 3 Scene 7 are both at "Coffee Shop", schedule them on the same day.\n`
    prompt += `This approach saves MASSIVE time and money by minimizing location moves.\n\n`
  } else {
    prompt += `Create a single-episode schedule that groups scenes by LOCATION within the episode.\n\n`
  }

  prompt += `Generate a practical shooting schedule:\n`
  prompt += `1. Group ALL scenes by location (one location per day, no exceptions)\n`
  prompt += `2. Complete each location fully (1-3 consecutive days) before moving to next location\n`
  prompt += `3. If location exceeds 10-hour day, split across 2-3 consecutive days (same location)\n`
  prompt += `4. For exterior DAY + NIGHT: split into separate consecutive days if needed\n`
  prompt += `5. Stay within 10-hour shoot days (including buffers)\n`
  prompt += `6. Consider cast availability within each location's days\n`
  prompt += `7. Only schedule locations listed above (ignore unused locations)\n\n`

  prompt += `Output ONLY a JSON array. Keep descriptions brief (max 100 chars each). NO markdown.`

  return prompt
}

function parseSchedule(
  aiResponse: string,
  episodeNumbers: number[],
  breakdownData: Record<number, ScriptBreakdownData>,
  schedulingMode: string,
  userId: string,
  locationMapping?: Map<string, {
    locationGroup: ArcLocationGroup
    selectedVenue: ShootingLocationSuggestion | null
    scenes: Array<{ episodeNumber: number; sceneNumber: number; location: string }>
  }> | null
): ShootingScheduleData {
  try {
    let cleaned = aiResponse.trim()
    
    // Check for potential truncation
    const lastChar = cleaned.charAt(cleaned.length - 1)
    const endsWithBracket = lastChar === ']' || lastChar === '}'
    const endsWithBackticks = cleaned.endsWith('```')
    
    if (!endsWithBracket && !endsWithBackticks && cleaned.length > 100) {
      console.warn('⚠️ Response may be truncated - does not end with ] or }', {
        lastChars: cleaned.substring(cleaned.length - 50),
        responseLength: cleaned.length
      })
    }
    
    // Extract JSON from markdown code blocks
    const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch && jsonMatch[1]) {
      cleaned = jsonMatch[1].trim()
    } else if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }
    
    // Find JSON boundaries (first [ to last ] for array)
    const firstBracket = cleaned.indexOf('[')
    const lastBracket = cleaned.lastIndexOf(']')
    
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      cleaned = cleaned.substring(firstBracket, lastBracket + 1)
    }
    
    // Clean up common JSON issues
    cleaned = cleaned
      .replace(/,\s*}/g, '}') // Remove trailing commas before }
      .replace(/,\s*]/g, ']') // Remove trailing commas before ]
      .replace(/\/\/.*$/gm, '') // Remove comments
      .replace(/,\s*$/, '') // Remove trailing comma at end of string
      .trim()
    
    // If the response doesn't end with a closing bracket, try to fix it
    if (!cleaned.endsWith(']') && !cleaned.endsWith('}')) {
      console.warn('⚠️ Response incomplete - attempting to close JSON array/object')
      
      // Try to find the last complete object and close the array
      const lastCompleteObjectMatch = cleaned.lastIndexOf('}')
      if (lastCompleteObjectMatch !== -1) {
        // Find if we're in an array context
        const openBrackets = (cleaned.match(/\[/g) || []).length
        const closeBrackets = (cleaned.match(/\]/g) || []).length
        
        if (openBrackets > closeBrackets) {
          // We have unclosed array brackets
          cleaned = cleaned.substring(0, lastCompleteObjectMatch + 1) + ']'
          console.log('✅ Auto-closed JSON array')
        }
      }
    }

    // Try to parse JSON
    let parsedDays: any
    try {
      parsedDays = JSON.parse(cleaned)
    } catch (parseError) {
      console.error('❌ JSON parse error. First 1000 chars of cleaned response:', cleaned.substring(0, 1000))
      console.error('❌ Last 500 chars of cleaned response:', cleaned.substring(Math.max(0, cleaned.length - 500)))
      
      // If parsing fails, try to extract just the days array
      const daysMatch = cleaned.match(/"days"\s*:\s*\[([\s\S]*?)\]/)
      if (daysMatch) {
        const daysArrayStr = `[${daysMatch[1]}]`
        try {
          parsedDays = JSON.parse(daysArrayStr)
          console.log('✅ Recovered by extracting days array')
        } catch (recoveryError) {
          const recoveryMsg = recoveryError instanceof Error ? recoveryError.message : 'Unknown error'
          throw new Error(`Failed to parse JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}. Recovery attempt also failed: ${recoveryMsg}. Response length: ${cleaned.length} chars. Response may be truncated or malformed.`)
        }
      } else {
        throw new Error(`Failed to parse JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}. No 'days' array found. Response length: ${cleaned.length} chars. Response may be truncated or malformed.`)
      }
    }

    if (!Array.isArray(parsedDays)) {
      throw new Error('Invalid AI response structure: expected an array of shooting days')
    }

    // Helper to find location metadata for a day's location name
    const findLocationMetadata = (locationName: string) => {
      if (!locationMapping) return null
      
      // Try to match by location group name or venue name
      for (const [canonicalId, { locationGroup, selectedVenue }] of locationMapping.entries()) {
        const groupName = locationGroup.parentLocationName || ''
        const venueName = selectedVenue?.venueName || ''
        
        // Match if location name contains group name or venue name
        if (locationName.includes(groupName) || locationName.includes(venueName) || 
            groupName.includes(locationName) || venueName.includes(locationName)) {
          if (selectedVenue) {
            const dayRate = selectedVenue.costBreakdown?.dayRate || selectedVenue.estimatedCost || 0
            const permitCost = selectedVenue.permitCost || selectedVenue.logistics?.permitCost || 0
            const depositAmount = selectedVenue.depositAmount || 0
            const cost = dayRate + permitCost + depositAmount
            return {
              locationId: canonicalId,
              venueId: selectedVenue.id,
              venueName: selectedVenue.venueName || locationGroup.parentLocationName,
              venueAddress: selectedVenue.address || selectedVenue.searchGuidance || undefined,
              permitRequired: selectedVenue.logistics?.permitRequired || selectedVenue.permitCost !== undefined || false,
              insuranceRequired: selectedVenue.insuranceRequired || false,
              locationCost: cost
            }
          }
        }
      }
      return null
    }

    const shootingDays: ShootingDay[] = parsedDays.map((day: any, idx: number) => {
      const dayLocation = day.location || 'Unspecified Location'
      const locationMeta = findLocationMetadata(dayLocation)
      
      return {
      dayNumber: day.dayNumber || idx + 1,
      date: day.date || undefined,
        location: dayLocation,
      callTime: day.callTime || '09:00',
      estimatedWrapTime: day.estimatedWrapTime || '18:00',
      scenes: Array.isArray(day.scenes)
        ? day.scenes.map((scene: any) => ({
            episodeNumber: scene.episodeNumber || episodeNumbers[0],
            sceneNumber: scene.sceneNumber || 0,
            sceneTitle: scene.sceneTitle || `Scene ${scene.sceneNumber}`,
            estimatedDuration: parseInt(scene.estimatedDuration) || 30,
            priority: scene.priority || 'must-have',
              location: scene.location || dayLocation
          }))
        : [],
      castRequired: Array.isArray(day.castRequired)
        ? day.castRequired.map((cast: any) => ({
            characterName: cast.characterName || cast,
            actorName: cast.actorName || undefined,
            isAvailable: cast.isAvailable !== false
          }))
        : [],
      crewRequired: Array.isArray(day.crewRequired) ? day.crewRequired : [],
      equipmentRequired: Array.isArray(day.equipmentRequired) ? day.equipmentRequired : [],
      specialNotes: day.specialNotes || '',
      weatherContingency: day.weatherContingency || undefined,
      status: 'scheduled',
      setupNotes: day.setupNotes || undefined,
        comments: [],
        // Add location metadata if available
        ...(locationMeta || {})
      }
    })

    // Calculate total shoot days (excluding rest days)
    const totalShootDays = shootingDays.length

    return {
      episodeNumber: schedulingMode === 'single-episode' ? episodeNumbers[0] : undefined,
      episodeNumbers: schedulingMode === 'cross-episode' ? episodeNumbers : undefined,
      episodeTitle: schedulingMode === 'single-episode' 
        ? breakdownData[episodeNumbers[0]]?.episodeTitle 
        : undefined,
      schedulingMode: schedulingMode as 'single-episode' | 'cross-episode',
      optimizationPriority: 'location',
      totalShootDays,
      days: shootingDays,
      restDays: [],
      rehearsals: [], // Will be populated separately
      lastUpdated: Date.now(),
      updatedBy: userId
    }
  } catch (error) {
    console.error('❌ Error parsing AI response for schedule:', error)
    console.error('Response preview (first 1000 chars):', aiResponse.substring(0, 1000))
    console.error('Response preview (last 500 chars):', aiResponse.substring(Math.max(0, aiResponse.length - 500)))
    console.error('Response length:', aiResponse.length, 'characters')
    throw new Error(`Failed to parse schedule: ${error instanceof Error ? error.message : 'Unknown error'}. Response length: ${aiResponse.length} chars.`)
  }
}

function buildFallbackSchedule(
  episodeNumbers: number[],
  breakdownData: Record<number, ScriptBreakdownData>,
  schedulingMode: string,
  userId: string,
  arcLocationsData?: ArcLocationsData,
  locationMapping?: Map<string, {
    locationGroup: ArcLocationGroup
    selectedVenue: ShootingLocationSuggestion | null
    scenes: Array<{ episodeNumber: number; sceneNumber: number; location: string }>
  }> | null
): ShootingScheduleData {
  // Flatten scenes across episodes, group by location, and pack by duration/time-of-day to meet day caps
  type FlatScene = {
    episodeNumber: number
    sceneNumber: number
    sceneTitle: string
    location: string
    estimatedDuration: number
    timeOfDay: string
    orderIndex: number
  }

  const isExteriorLocation = (loc: string) => {
    const upper = (loc || '').toUpperCase()
    return upper.includes('EXT') || upper.includes('EXTERIOR') || upper.includes('OUTSIDE') || upper.includes('STREET') || upper.includes('PARK')
  }
  const sumMinutes = (scenes: { estimatedDuration: number }[]) =>
    scenes.reduce((total, scene) => total + (scene.estimatedDuration || 0), 0)

  const scenes: FlatScene[] = []
  episodeNumbers.forEach((epNum) => {
    const breakdown = breakdownData[epNum]
    breakdown?.scenes?.forEach((scene) => {
      const orderIndex = scenes.length
      const timeOfDay = (scene.timeOfDay || 'DAY').toString()
      scenes.push({
        episodeNumber: epNum,
        sceneNumber: scene.sceneNumber,
        sceneTitle: scene.sceneTitle || `Scene ${scene.sceneNumber}`,
        location: scene.location || 'Unspecified Location',
        estimatedDuration: scene.estimatedShootTime || 45,
        timeOfDay,
        orderIndex
      })
    })
  })

  // Group by location to keep cross-episode efficiency
  const byLocation = new Map<string, FlatScene[]>()
  scenes.forEach((scene) => {
    const bucket = byLocation.get(scene.location) || []
    bucket.push(scene)
    byLocation.set(scene.location, bucket)
  })

  const days: ShootingDay[] = []
  let dayNumber = 1
  const maxDaysTarget = Math.min(7, Math.max(3, Math.ceil(episodeNumbers.length / 2)))
  const maxMinutesPerDay = 10 * 60 // 10 hours
  const bufferMinutes = 60 // setup/teardown buffer
  const effectiveCap = maxMinutesPerDay - bufferMinutes
  const locations = Array.from(byLocation.entries())

  // Helper to get venue name and metadata for a location
  const getVenueInfo = (locationName: string) => {
    if (!locationMapping) return { venueName: locationName, metadata: null }
    
    for (const [canonicalId, { locationGroup, selectedVenue }] of locationMapping.entries()) {
      const groupName = locationGroup.parentLocationName || ''
      if (locationName.includes(groupName) || groupName.includes(locationName)) {
        if (selectedVenue) {
          const venueName = selectedVenue.venueName || groupName
          const dayRate = selectedVenue.costBreakdown?.dayRate || selectedVenue.estimatedCost || 0
          const permitCost = selectedVenue.permitCost || selectedVenue.logistics?.permitCost || 0
          const depositAmount = selectedVenue.depositAmount || 0
          const cost = dayRate + permitCost + depositAmount
          return {
            venueName,
            metadata: {
              locationId: canonicalId,
              venueId: selectedVenue.id,
              venueName,
              venueAddress: selectedVenue.address || selectedVenue.searchGuidance || undefined,
              permitRequired: selectedVenue.logistics?.permitRequired || selectedVenue.permitCost !== undefined || false,
              insuranceRequired: selectedVenue.insuranceRequired || false,
              locationCost: cost
            }
          }
        }
        return { venueName: groupName, metadata: null }
      }
    }
    return { venueName: locationName, metadata: null }
  }

  // Sort locations by first appearance to respect scene flow
  const sortedLocations = [...locations].sort((a, b) => {
    const aFirst = Math.min(...a[1].map(s => s.orderIndex))
    const bFirst = Math.min(...b[1].map(s => s.orderIndex))
    return aFirst - bFirst
  })

  // STRICT ONE-LOCATION-PER-DAY: Process each location completely before moving to next
  sortedLocations.forEach(([location, locScenes]) => {
    const isExterior = isExteriorLocation(location)
    const dayScenes = locScenes.filter((s) => (s.timeOfDay || 'DAY').toUpperCase() !== 'NIGHT')
    const nightScenes = locScenes.filter((s) => (s.timeOfDay || 'DAY').toUpperCase() === 'NIGHT')
    
    // For exterior locations with both DAY and NIGHT, split into separate days
    const sceneGroups: FlatScene[][] = []
    if (isExterior && dayScenes.length > 0 && nightScenes.length > 0) {
      sceneGroups.push(dayScenes)
      sceneGroups.push(nightScenes)
    } else {
      sceneGroups.push(locScenes)
    }

    // Pack each scene group into consecutive days (same location)
    sceneGroups.forEach((sceneGroup) => {
      const sortedScenes = [...sceneGroup].sort((a, b) => b.estimatedDuration - a.estimatedDuration)
      let currentDayScenes: FlatScene[] = []
      let currentDayMinutes = 0

      const flushLocationDay = () => {
        if (currentDayScenes.length === 0) return
        
        const venueInfo = getVenueInfo(location)
        const hasNight = sceneGroup === nightScenes || sceneGroup.some(s => (s.timeOfDay || 'DAY').toUpperCase() === 'NIGHT')
        
        days.push({
          dayNumber: dayNumber++,
          date: undefined,
          location: venueInfo.venueName,
          callTime: '08:00',
          estimatedWrapTime: '18:00',
          scenes: currentDayScenes.map((scene) => ({
            episodeNumber: scene.episodeNumber,
            sceneNumber: scene.sceneNumber,
            sceneTitle: scene.sceneTitle,
            estimatedDuration: scene.estimatedDuration,
            priority: 'must-have',
            location: scene.location,
            timeOfDay: scene.timeOfDay
          })),
          castRequired: [],
          crewRequired: [],
          equipmentRequired: [],
          specialNotes: `Fallback schedule: AI response unavailable | Location: ${location}${
            hasNight ? ' | NIGHT exterior' : ''
          }`,
          weatherContingency: isExterior
            ? 'Check weather and daylight for exterior; plan lighting for night scenes.'
            : 'Add weather contingency during review',
          status: 'scheduled',
          setupNotes: hasNight ? 'Includes NIGHT exterior; plan lighting and power.' : '',
          comments: [],
          // Add location metadata if available
          ...(venueInfo.metadata || {})
        })
        
        currentDayScenes = []
        currentDayMinutes = 0
      }

      sortedScenes.forEach((scene) => {
        // If adding this scene would exceed the day cap, flush current day and start new day (same location)
        if (currentDayMinutes + scene.estimatedDuration > effectiveCap && currentDayScenes.length > 0) {
          flushLocationDay()
        }
        currentDayScenes.push(scene)
        currentDayMinutes += scene.estimatedDuration
      })
      
      // Flush any remaining scenes
      flushLocationDay()
    })
  })


  return {
    episodeNumber: schedulingMode === 'single-episode' ? episodeNumbers[0] : undefined,
    episodeNumbers: schedulingMode === 'cross-episode' ? episodeNumbers : undefined,
    episodeTitle: schedulingMode === 'single-episode'
      ? breakdownData[episodeNumbers[0]]?.episodeTitle
      : undefined,
    schedulingMode: schedulingMode as 'single-episode' | 'cross-episode',
    optimizationPriority: 'location',
    totalShootDays: days.length,
    days,
    restDays: [],
    rehearsals: [],
    lastUpdated: Date.now(),
    updatedBy: userId
  }
}

export async function generateRehearsalSuggestions(
  scheduleData: ShootingScheduleData,
  breakdownData: Record<number, ScriptBreakdownData>
): Promise<RehearsalSession[]> {
  console.log('🎪 Generating rehearsal suggestions...')

  const systemPrompt = `You are an experienced director and acting coach for web series production.

**TASK**: Analyze the shooting schedule and suggest rehearsals based on scene complexity.

**RULES**:
1. Suggest rehearsals for:
   - Complex emotional scenes (long dialogue, conflict, intimate moments)
   - Scenes with stunts or choreography
   - Scenes with multiple actors (ensemble scenes)
   - First scenes of the production (to build rapport)

2. Rehearsal types:
   - **table-read**: Script reading for all episodes (1-2 hours, all cast)
   - **blocking**: Physical movement rehearsal (1-2 hours per scene)
   - **technical**: Integration with camera/lights (30-60 minutes)
   - **full-run**: Complete run-through (episode length)

3. Timing:
   - Table reads: 1 week before first shoot day
   - Blocking: 2-3 days before scene's shoot day
   - Technical: Day before shoot day
   - Full runs: Mid-production for continuity check

4. Be selective: Don't suggest rehearsals for simple scenes (establishing shots, background action)

**OUTPUT**: JSON array of rehearsal suggestions. Each must have:
- date (suggested date, YYYY-MM-DD)
- time (suggested time, HH:MM)
- duration (minutes)
- scenes (array of scene objects with episodeNumber, sceneNumber, sceneTitle)
- actors (array of actor/character names)
- location ('in-person' or 'video-call')
- rehearsalType
- goals (array of strings explaining why this rehearsal is valuable)

NO markdown, NO explanations - ONLY the JSON array.`

  // Build context about scenes from schedule
  let userPrompt = `Suggest rehearsals for the following shooting schedule:\n\n`

  userPrompt += `**SHOOTING SCHEDULE:**\n`
  scheduleData.days.forEach(day => {
    userPrompt += `Day ${day.dayNumber} (${day.date || 'TBD'}) at ${day.location}:\n`
    day.scenes.forEach(scene => {
      const breakdown = breakdownData[scene.episodeNumber]
      const sceneDetails = breakdown?.scenes?.find(s => s.sceneNumber === scene.sceneNumber)
      
      userPrompt += `  - Ep${scene.episodeNumber} Scene ${scene.sceneNumber}: ${scene.sceneTitle}\n`
      if (sceneDetails) {
        userPrompt += `    Characters: ${sceneDetails.characters.map(c => c.name).join(', ')}\n`
        userPrompt += `    Duration: ${scene.estimatedDuration} minutes\n`
        if (sceneDetails.specialRequirements && sceneDetails.specialRequirements.length > 0) {
          userPrompt += `    Special Requirements: ${sceneDetails.specialRequirements.join(', ')}\n`
        }
      }
    })
    userPrompt += `\n`
  })

  userPrompt += `\nGenerate 3-5 strategic rehearsal suggestions that will improve production quality.`

  try {
    const response = await EngineAIRouter.generateContent({
      prompt: userPrompt,
      systemPrompt,
      temperature: 0.7,
      maxTokens: 4000,
      engineId: 'rehearsal-suggester',
      forceProvider: 'gemini'
    })

    let cleaned = response.content.trim()
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }

    const parsedSuggestions = JSON.parse(cleaned)

    if (!Array.isArray(parsedSuggestions)) {
      throw new Error('Invalid rehearsal suggestions structure')
    }

    const rehearsals: RehearsalSession[] = parsedSuggestions.map((suggestion: any, idx: number) => ({
      id: `rehearsal_suggested_${Date.now()}_${idx}`,
      date: suggestion.date || '',
      time: suggestion.time || '10:00',
      duration: parseInt(suggestion.duration) || 120,
      scenes: Array.isArray(suggestion.scenes)
        ? suggestion.scenes.map((scene: any) => ({
            episodeNumber: scene.episodeNumber || 1,
            sceneNumber: scene.sceneNumber || 0,
            sceneTitle: scene.sceneTitle || '',
            estimatedDuration: scene.estimatedDuration || 30,
            priority: 'must-have' as const
          }))
        : [],
      actors: Array.isArray(suggestion.actors) ? suggestion.actors : [],
      location: suggestion.location || 'in-person',
      locationDetails: suggestion.locationDetails || undefined,
      rehearsalType: suggestion.rehearsalType || 'blocking',
      goals: Array.isArray(suggestion.goals) ? suggestion.goals : [],
      sessionNotes: '',
      status: 'suggested',
      suggestedByAI: true,
      comments: []
    }))

    console.log(`✅ Generated ${rehearsals.length} rehearsal suggestions`)
    return rehearsals
  } catch (error) {
    console.error('❌ Error generating rehearsal suggestions:', error)
    // Return empty array if rehearsal generation fails (non-critical)
    return []
  }
}


