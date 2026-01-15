/**
 * AI-powered Location Generator
 * Generates 2-3 alternative location options per scene for micro-budget web series
 */

import { EngineAIRouter } from '@/services/engine-ai-router'
import type { LocationOption, LocationOptionsData, Location, LocationSceneReference, CastingData } from '@/types/preproduction'

/**
 * Scene location requirement interface
 */
export interface SceneLocationRequirement {
  sceneNumber: number
  sceneTitle: string
  locationType: 'INT' | 'EXT'
  timeOfDay: string
  sceneDescription: string
  characterCount: number
  specialRequirements: string[]
}

/**
 * Cast location information for proximity-based recommendations
 */
export interface CastLocationInfo {
  primaryCity?: string
  primaryState?: string
  primaryCountry?: string
  metroAreas: string[]
  castLocations: Array<{
    city?: string
    state?: string
    country?: string
  }>
}

/**
 * Parameters for generating locations for a single scene
 */
interface GenerateLocationsForSceneParams {
  sceneRequirement: SceneLocationRequirement
  storyBible: any
  episodeTitle: string
  castLocationInfo?: CastLocationInfo
  episodeNumber?: number
  scriptData?: any
  locationPreference?: 'story-based' | 'user-based'
  previousEpisodeLocations?: Location[]
  storyBibleLocations?: any[]
}

/**
 * Result of generating locations for a scene
 */
interface GenerateLocationsForSceneResult {
  locationOptions: LocationOption[]
  reusedFromEpisode?: number
  reusedFromLocationId?: string
}

/**
 * Parameters for generating locations (episode or arc level)
 */
interface GenerateLocationsParams {
  breakdownData: any
  scriptData: any
  storyBible: any
  castingData?: CastingData | any
  episodeNumber?: number
  episodeTitle?: string
  arcIndex?: number
  episodeNumbers?: number[]
  onProgress?: (progress: {
    currentScene: number
    totalScenes: number
    currentSceneTitle: string
    completedScenes: number
  }) => void
}

/**
 * Extract cast location information from casting data
 */
export function extractCastLocationInfo(castingData?: CastingData | any): CastLocationInfo {
  if (!castingData?.cast || !Array.isArray(castingData.cast)) {
    return { metroAreas: [], castLocations: [] }
  }

  const confirmedCast = castingData.cast.filter((c: any) => c.status === 'confirmed')
  const castWithLocation = confirmedCast.filter((c: any) => c.city || c.state || c.country)

  if (castWithLocation.length === 0) {
    return { metroAreas: [], castLocations: [] }
  }

  // Extract unique locations
  const locations = castWithLocation.map((c: any) => ({
    city: c.city,
    state: c.state,
    country: c.country
  }))

  // Find most common city/state/country
  const cityCounts = new Map<string, number>()
  const stateCounts = new Map<string, number>()
  const countryCounts = new Map<string, number>()

  locations.forEach((loc: { city?: string; state?: string; country?: string }) => {
    if (loc.city) cityCounts.set(loc.city, (cityCounts.get(loc.city) || 0) + 1)
    if (loc.state) stateCounts.set(loc.state, (stateCounts.get(loc.state) || 0) + 1)
    if (loc.country) countryCounts.set(loc.country, (countryCounts.get(loc.country) || 0) + 1)
  })

  const primaryCity = Array.from(cityCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0]
  const primaryState = Array.from(stateCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0]
  const primaryCountry = Array.from(countryCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0]

  // Build metro areas list
  const metroAreas: string[] = []
  locations.forEach((loc: { city?: string; state?: string; country?: string }) => {
    if (loc.city && loc.state) {
      const metro = `${loc.city}, ${loc.state}`
      if (!metroAreas.includes(metro)) metroAreas.push(metro)
    } else if (loc.city) {
      if (!metroAreas.includes(loc.city)) metroAreas.push(loc.city)
    }
  })

  return {
    primaryCity,
    primaryState,
    primaryCountry,
    metroAreas,
    castLocations: locations
  }
}

/**
 * Generate location options for a single scene
 */
export async function generateLocationsForScene(
  params: GenerateLocationsForSceneParams
): Promise<GenerateLocationsForSceneResult> {
  const {
    sceneRequirement,
    storyBible,
    episodeTitle,
    castLocationInfo,
    episodeNumber,
    scriptData,
    locationPreference = 'story-based',
    previousEpisodeLocations = [],
    storyBibleLocations = []
  } = params

  console.log(`🎬 Generating locations for Scene ${sceneRequirement.sceneNumber}: ${sceneRequirement.sceneTitle}`)

  // Check for location reuse opportunities
  let reusedFromEpisode: number | undefined
  let reusedFromLocationId: string | undefined

  if (previousEpisodeLocations.length > 0 && episodeNumber && episodeNumber > 1) {
    // Try to find a matching location from previous episodes
    const sceneLocationKey = sceneRequirement.sceneTitle.toLowerCase().trim()
    const matchingLocation = previousEpisodeLocations.find((loc: Location) => {
      const locKey = loc.recurringLocationKey || loc.name?.toLowerCase().trim()
      return locKey && sceneLocationKey.includes(locKey) || locKey?.includes(sceneLocationKey)
    })

    if (matchingLocation) {
      reusedFromEpisode = matchingLocation.originalEpisode || episodeNumber - 1
      reusedFromLocationId = matchingLocation.id
      console.log(`  ♻️  Found reusable location from Episode ${reusedFromEpisode}`)
    }
  }

  // Build AI prompts
  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt(
    sceneRequirement,
    storyBible,
    episodeTitle,
    castLocationInfo,
    locationPreference,
    previousEpisodeLocations,
    storyBibleLocations,
    reusedFromEpisode
  )

  try {
    console.log('🤖 Calling AI for location generation...')
    const response = await EngineAIRouter.generateContent({
      prompt: userPrompt,
      systemPrompt,
      temperature: 0.7, // Balanced creativity and practicality
      maxTokens: 3000, // Enough for 2-3 location options with details
      engineId: 'location-generator',
      forceProvider: 'gemini'
    })

    console.log('✅ AI Response received:', response.metadata.contentLength, 'characters')

    // Parse AI response into location options
    const locationOptions = parseLocationOptions(response.content, sceneRequirement, reusedFromEpisode, reusedFromLocationId)

    console.log(`✅ Generated ${locationOptions.length} location options for Scene ${sceneRequirement.sceneNumber}`)

    return {
      locationOptions,
      reusedFromEpisode,
      reusedFromLocationId
    }
  } catch (error) {
    console.error('❌ Error generating locations:', error)
    throw new Error(`Location generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate location options for all scenes (episode or arc level)
 */
export async function generateLocations(params: GenerateLocationsParams): Promise<LocationOptionsData> {
  const {
    breakdownData,
    scriptData,
    storyBible,
    castingData,
    episodeNumber,
    episodeTitle,
    arcIndex,
    episodeNumbers,
    onProgress
  } = params

  console.log('📍 Generating location options for', arcIndex !== undefined ? 'arc' : 'episode')

  // Extract cast location info
  const castLocationInfo = extractCastLocationInfo(castingData)

  // Get scenes from breakdown
  const scenes = breakdownData.scenes || []
  const totalScenes = scenes.length

  if (totalScenes === 0) {
    throw new Error('No scenes found in breakdown data')
  }

  console.log(`📋 Processing ${totalScenes} scenes...`)

  // Generate locations for each scene
  const sceneRequirements: LocationOptionsData['sceneRequirements'] = []

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i]
    const sceneEpisodeNumber = scene.episodeNumber || scene.linkedEpisode || episodeNumber || 1

    // Update progress
    if (onProgress) {
      onProgress({
        currentScene: i + 1,
        totalScenes,
        currentSceneTitle: scene.sceneTitle || `Scene ${scene.sceneNumber}`,
        completedScenes: i
      })
    }

    // Build scene requirement
    const sceneRequirement: SceneLocationRequirement = {
      sceneNumber: scene.sceneNumber,
      sceneTitle: scene.sceneTitle || `Scene ${scene.sceneNumber}`,
      locationType: (scene.location?.toUpperCase().includes('INT') ? 'INT' : 'EXT') as 'INT' | 'EXT',
      timeOfDay: scene.timeOfDay || 'DAY',
      sceneDescription: scene.sceneTitle || `Scene ${scene.sceneNumber}`,
      characterCount: scene.characters?.length || 0,
      specialRequirements: scene.specialRequirements || []
    }

    // Generate locations for this scene
    try {
      const result = await generateLocationsForScene({
        sceneRequirement,
        storyBible,
        episodeTitle: episodeTitle || `Episode ${sceneEpisodeNumber}`,
        castLocationInfo,
        episodeNumber: sceneEpisodeNumber,
        scriptData,
        locationPreference: 'story-based' // Default for now
      })

      // Add to scene requirements
      sceneRequirements.push({
        episodeNumber: sceneEpisodeNumber,
        sceneNumber: scene.sceneNumber,
        sceneTitle: scene.sceneTitle || `Scene ${scene.sceneNumber}`,
        locationType: sceneRequirement.locationType,
        timeOfDay: sceneRequirement.timeOfDay,
        options: result.locationOptions
      })

      console.log(`  ✅ Scene ${scene.sceneNumber}: ${result.locationOptions.length} options`)
    } catch (error) {
      console.error(`  ❌ Error generating locations for Scene ${scene.sceneNumber}:`, error)
      // Continue with other scenes even if one fails
      sceneRequirements.push({
        episodeNumber: sceneEpisodeNumber,
        sceneNumber: scene.sceneNumber,
        sceneTitle: scene.sceneTitle || `Scene ${scene.sceneNumber}`,
        locationType: sceneRequirement.locationType,
        timeOfDay: sceneRequirement.timeOfDay,
        options: [] // Empty options on error
      })
    }
  }

  // Build result
  const result: LocationOptionsData = {
    sceneRequirements,
    lastUpdated: Date.now(),
    generated: true,
    locationPreference: 'story-based'
  }

  // Add episode or arc metadata
  if (arcIndex !== undefined && episodeNumbers) {
    result.arcIndex = arcIndex
    result.episodeNumbers = episodeNumbers
  } else if (episodeNumber) {
    result.episodeNumber = episodeNumber
    result.episodeTitle = episodeTitle || `Episode ${episodeNumber}`
  }

  console.log(`✅ Location generation complete: ${sceneRequirements.length} scene requirements, ${sceneRequirements.reduce((sum, req) => sum + req.options.length, 0)} total options`)

  return result
}

/**
 * Build system prompt for location generation
 */
function buildSystemPrompt(): string {
  return `You are an experienced location scout specializing in micro-budget web series production.

**CRITICAL RULES:**

1. **BUDGET IS PARAMOUNT**: Generate 2-3 location options per scene, prioritizing:
   - FREE locations (public spaces, actor-owned properties) - $0
   - LOW-COST locations (Airbnb, Agoda, Booking.com, Expedia) - $0-$150/day
   - MODERATE locations (rentals) - $150-$500/day
   - Avoid expensive locations ($500+/day) unless absolutely necessary

2. **LOCATION TYPES**:
   - **Interior (INT)**: Indoor spaces (apartments, offices, cafes, stores)
   - **Exterior (EXT)**: Outdoor spaces (parks, streets, parking lots, rooftops)
   - **Both**: Spaces that can serve as both interior and exterior

3. **SOURCING PLATFORMS** (PRIORITIZE IN THIS ORDER):
   - **Google Maps**: For ALL locations with addresses - provides reliable links to actual locations (FREE to link)
   - **Airbnb**: Short-term rentals, global platform, often affordable ($50-$200/day) - PREFERRED
   - **Agoda**: Global hotel/booking platform, good for international locations ($50-$300/day)
   - **Booking.com**: Global booking platform, wide availability ($50-$300/day)
   - **Expedia**: Global booking platform, good coverage ($50-$300/day)
   - **Public Space**: Free parks, streets, libraries (FREE) - use "google-maps" sourcing
   - **Actor-Owned**: Cast member's property (FREE or minimal cost)
   - **Rental**: Traditional location rental ($200-$500/day)
   - **Peerspace**: Professional filming spaces ($100-$300/day) - use only if Airbnb/booking platforms unavailable
   - **Giggster**: Location marketplace ($50-$500/day) - use only if Airbnb/booking platforms unavailable

4. **LOGISTICS REQUIREMENTS**:
   - Parking: Essential for crew/equipment
   - Power Access: For lighting/equipment
   - Restroom Access: For cast/crew comfort
   - Permit Requirements: Note if permits are needed and estimated cost

5. **OUTPUT FORMAT**:
Provide STRICTLY valid JSON array of 2-3 location options. Each option must have:
- id (unique identifier, e.g., "loc_scene1_option1")
- name (location name)
- description (brief description, max 200 chars)
- type ("interior", "exterior", or "both")
- estimatedCost (number in dollars, prefer $0-$150)
- pros (array of 3-5 advantages)
- cons (array of 2-3 challenges)
- logistics (object with parkingAvailable, powerAccess, restroomAccess, permitRequired, permitCost, notes)
- sourcing ("google-maps", "airbnb", "agoda", "booking-com", "expedia", "public-space", "actor-owned", "rental", "venue-website", "peerspace", "giggster", or "other")
- sourcingPlatform (suggested platform text, e.g., "Search Airbnb for 'modern apartment' in [city]" or "Find on Google Maps")
- address (example/generic address or "TBD")
- status ("suggested")
- selected (false)

NO markdown, NO code blocks, NO explanations - ONLY the JSON array.`
}

/**
 * Build user prompt for location generation
 */
function buildUserPrompt(
  sceneRequirement: SceneLocationRequirement,
  storyBible: any,
  episodeTitle: string,
  castLocationInfo?: CastLocationInfo,
  locationPreference: 'story-based' | 'user-based' = 'story-based',
  previousEpisodeLocations: Location[] = [],
  storyBibleLocations: any[] = [],
  reusedFromEpisode?: number
): string {
  const seriesTitle = storyBible?.seriesTitle || storyBible?.title || 'Untitled Series'
  const genre = storyBible?.genre || 'Drama'
  const tone = storyBible?.tone || 'Realistic'
  const setting = storyBible?.setting || storyBible?.worldBuilding?.setting || 'Contemporary'

  let prompt = `Generate 2-3 location options for a scene in "${seriesTitle}".\n\n`

  prompt += `**SERIES CONTEXT:**\n`
  prompt += `Title: ${seriesTitle}\n`
  prompt += `Genre: ${genre}\n`
  prompt += `Tone: ${tone}\n`
  prompt += `Setting: ${setting}\n`
  prompt += `Episode: ${episodeTitle}\n\n`
  
  // Add CORE story bible data
  if (storyBible?.seriesOverview) {
    prompt += `**SERIES OVERVIEW (Big Picture):**\n${storyBible.seriesOverview}\n\n`
  }
  
  if (storyBible?.worldBuilding) {
    prompt += `**WORLD/SETTING DETAILS:**\n`
    if (typeof storyBible.worldBuilding === 'string') {
      prompt += `${storyBible.worldBuilding.substring(0, 350)}\n\n`
    } else {
      if (storyBible.worldBuilding.setting) prompt += `Setting: ${storyBible.worldBuilding.setting}\n`
      if (storyBible.worldBuilding.rules) {
        prompt += `World Rules: ${typeof storyBible.worldBuilding.rules === 'string' ? storyBible.worldBuilding.rules : ''}\n`
      }
      if (storyBible.worldBuilding.atmosphere) prompt += `Atmosphere: ${storyBible.worldBuilding.atmosphere}\n`
      if (storyBible.worldBuilding.culturalContext) prompt += `Cultural Context: ${storyBible.worldBuilding.culturalContext}\n`
      if (storyBible.worldBuilding.locations && Array.isArray(storyBible.worldBuilding.locations)) {
        prompt += `\nEstablished Locations (use these for authenticity):\n`
        storyBible.worldBuilding.locations.forEach((loc: any) => {
          prompt += `- ${loc.name}: ${loc.description || ''}`
          if (loc.atmosphere) prompt += ` (${loc.atmosphere})`
          prompt += `\n`
        })
      }
      prompt += `\n`
    }
  }
  
  if (storyBible?.genreEnhancement) {
    prompt += `**GENRE STYLE (for location aesthetics):**\n`
    const genreEnh = storyBible.genreEnhancement
    if (genreEnh.rawContent) {
      prompt += `${genreEnh.rawContent.substring(0, 250)}\n\n`
    } else if (genreEnh.visualStyle) {
      prompt += `Visual Style: ${genreEnh.visualStyle}\n\n`
    }
  }

  prompt += `**SCENE REQUIREMENTS:**\n`
  prompt += `Scene ${sceneRequirement.sceneNumber}: ${sceneRequirement.sceneTitle}\n`
  prompt += `Type: ${sceneRequirement.locationType} (${sceneRequirement.locationType === 'INT' ? 'Interior' : 'Exterior'})\n`
  prompt += `Time of Day: ${sceneRequirement.timeOfDay}\n`
  prompt += `Description: ${sceneRequirement.sceneDescription}\n`
  prompt += `Characters: ${sceneRequirement.characterCount}\n`
  if (sceneRequirement.specialRequirements.length > 0) {
    prompt += `Special Requirements: ${sceneRequirement.specialRequirements.join(', ')}\n`
  }
  prompt += `\n`

  // Add location preference context
  if (locationPreference === 'user-based' && castLocationInfo && castLocationInfo.metroAreas.length > 0) {
    prompt += `**CAST LOCATION PREFERENCE:**\n`
    prompt += `Primary Location: ${castLocationInfo.primaryCity || 'N/A'}`
    if (castLocationInfo.primaryState) prompt += `, ${castLocationInfo.primaryState}`
    if (castLocationInfo.primaryCountry) prompt += `, ${castLocationInfo.primaryCountry}`
    prompt += `\n`
    prompt += `Metro Areas: ${castLocationInfo.metroAreas.join(', ')}\n`
    prompt += `\n`
    prompt += `**IMPORTANT**: Prioritize locations in or near these areas for practical filming.\n\n`
  } else {
    prompt += `**LOCATION PREFERENCE:** Story-based (match the narrative setting)\n\n`
  }

  // Add previous locations for reuse opportunities
  if (previousEpisodeLocations.length > 0) {
    prompt += `**PREVIOUS EPISODE LOCATIONS (for potential reuse):**\n`
    previousEpisodeLocations.slice(0, 5).forEach((loc: Location) => {
      prompt += `- ${loc.name} (${loc.address || 'Address TBD'}) - $${loc.cost || 0}/day`
      if (loc.recurringLocationKey) {
        prompt += ` [Key: ${loc.recurringLocationKey}]`
      }
      prompt += `\n`
    })
    prompt += `\n`
    prompt += `**NOTE**: If a previous location matches this scene's needs, consider reusing it to save costs.\n\n`
  }

  // Add story bible locations
  if (storyBibleLocations.length > 0) {
    prompt += `**STORY BIBLE LOCATIONS:**\n`
    storyBibleLocations.slice(0, 3).forEach((loc: any) => {
      prompt += `- ${loc.name || loc.title || 'Unnamed Location'}: ${loc.description || loc.notes || 'No description'}\n`
    })
    prompt += `\n`
  }

  if (reusedFromEpisode) {
    prompt += `**REUSE OPPORTUNITY**: A similar location was used in Episode ${reusedFromEpisode}. Consider reusing it if it matches.\n\n`
  }

  prompt += `**INSTRUCTIONS:**\n`
  prompt += `Generate 2-3 practical location options that:\n`
  prompt += `1. Match the scene's requirements (${sceneRequirement.locationType}, ${sceneRequirement.timeOfDay})\n`
  prompt += `2. Fit the series tone and genre (${genre}, ${tone})\n`
  prompt += `3. Are budget-friendly (prefer $0-$150/day, max $500/day)\n`
  prompt += `4. Have good logistics (parking, power, restrooms)\n`
  if (locationPreference === 'user-based' && castLocationInfo) {
    prompt += `5. Are located in or near: ${castLocationInfo.metroAreas.join(', ')}\n`
  }
  prompt += `\n`

  prompt += `Output ONLY a JSON array of 2-3 location options. NO markdown, NO explanations.`

  return prompt
}

/**
 * Parse AI response into LocationOption objects
 */
function parseLocationOptions(
  aiResponse: string,
  sceneRequirement: SceneLocationRequirement,
  reusedFromEpisode?: number,
  reusedFromLocationId?: string
): LocationOption[] {
  try {
    let cleaned = aiResponse.trim()

    // Extract JSON from markdown code blocks
    const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch && jsonMatch[1]) {
      cleaned = jsonMatch[1].trim()
    } else if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }

    // Find JSON array boundaries
    const firstBracket = cleaned.indexOf('[')
    const lastBracket = cleaned.lastIndexOf(']')

    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      cleaned = cleaned.substring(firstBracket, lastBracket + 1)
    }

    // Clean up common JSON issues
    cleaned = cleaned
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
      .replace(/\/\/.*$/gm, '')
      .trim()

    // Parse JSON
    const parsed = JSON.parse(cleaned)

    if (!Array.isArray(parsed)) {
      throw new Error('AI response is not an array')
    }

    // Convert to LocationOption format
    const locationOptions: LocationOption[] = parsed.map((opt: any, index: number) => ({
      id: opt.id || `loc_scene${sceneRequirement.sceneNumber}_option${index + 1}_${Date.now()}`,
      sceneNumbers: [sceneRequirement.sceneNumber], // Legacy format
      name: opt.name || `Location Option ${index + 1}`,
      description: opt.description || '',
      type: (opt.type || 'interior') as 'interior' | 'exterior' | 'both',
      estimatedCost: typeof opt.estimatedCost === 'number' ? opt.estimatedCost : parseFloat(opt.estimatedCost) || 0,
      pros: Array.isArray(opt.pros) ? opt.pros : [],
      cons: Array.isArray(opt.cons) ? opt.cons : [],
      logistics: {
        parkingAvailable: opt.logistics?.parkingAvailable ?? true,
        powerAccess: opt.logistics?.powerAccess ?? true,
        restroomAccess: opt.logistics?.restroomAccess ?? true,
        permitRequired: opt.logistics?.permitRequired ?? false,
        permitCost: opt.logistics?.permitCost || 0,
        notes: opt.logistics?.notes || ''
      },
      sourcing: (opt.sourcing || 'other') as LocationOption['sourcing'],
      sourcingPlatform: opt.sourcingPlatform || undefined,
      address: opt.address || undefined,
      status: 'suggested' as const,
      selected: false,
      reusedFromEpisode: reusedFromEpisode,
      reusedFromLocationId: reusedFromLocationId,
      isReuse: !!reusedFromEpisode
    }))

    return locationOptions
  } catch (error) {
    console.error('❌ Error parsing location options:', error)
    console.error('AI Response:', aiResponse.substring(0, 500))
    throw new Error(`Failed to parse location options: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
