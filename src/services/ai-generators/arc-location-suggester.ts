/**
 * Arc Location Suggester
 * Generates real-world shooting location suggestions using AI
 */

import { EngineAIRouter } from '@/services/engine-ai-router'
import type {
  ArcLocationGroup,
  ShootingLocationSuggestion
} from '@/types/preproduction'
import type { CastingData } from '@/types/preproduction'

export interface GenerateSuggestionsParams {
  locationGroups: ArcLocationGroup[]
  storyBible: any
  castingData?: CastingData | any
  onProgress?: (progress: {
    currentLocation: number
    totalLocations: number
    currentLocationName: string
    completedLocations: number
  }) => void
}

/**
 * Extract cast location information for proximity-based recommendations
 */
function extractCastLocationInfo(castingData?: CastingData | any): {
  primaryCity?: string
  primaryState?: string
  primaryCountry?: string
  metroAreas: string[]
} {
  if (!castingData?.cast || !Array.isArray(castingData.cast)) {
    return { metroAreas: [] }
  }

  const confirmedCast = castingData.cast.filter((c: any) => c.status === 'confirmed')
  const castWithLocation = confirmedCast.filter((c: any) => c.city || c.state || c.country)

  if (castWithLocation.length === 0) {
    return { metroAreas: [] }
  }

  const cityCounts = new Map<string, number>()
  const stateCounts = new Map<string, number>()
  const countryCounts = new Map<string, number>()

  castWithLocation.forEach((c: any) => {
    if (c.city) cityCounts.set(c.city, (cityCounts.get(c.city) || 0) + 1)
    if (c.state) stateCounts.set(c.state, (stateCounts.get(c.state) || 0) + 1)
    if (c.country) countryCounts.set(c.country, (countryCounts.get(c.country) || 0) + 1)
  })

  const primaryCity = Array.from(cityCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0]
  const primaryState = Array.from(stateCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0]
  const primaryCountry = Array.from(countryCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0]

  const metroAreas: string[] = []
  castWithLocation.forEach((c: any) => {
    if (c.city && c.state) {
      const metro = `${c.city}, ${c.state}`
      if (!metroAreas.includes(metro)) metroAreas.push(metro)
    } else if (c.city) {
      if (!metroAreas.includes(c.city)) metroAreas.push(c.city)
    }
  })

  return {
    primaryCity,
    primaryState,
    primaryCountry,
    metroAreas
  }
}

/**
 * Build system prompt for location suggestion generation
 */
function buildSystemPrompt(): string {
  return `You are an experienced location scout specializing in micro-budget web series production.

**CRITICAL RULES:**

1. **BUDGET IS PARAMOUNT**: Generate 2-3 location options per location, prioritizing:
   - FREE locations (public spaces, actor-owned properties) - $0
   - LOW-COST locations (Airbnb, Peerspace, Giggster) - $0-$150/day
   - MODERATE locations (rentals) - $150-$500/day
   - Avoid expensive locations ($500+/day) unless absolutely necessary

2. **SPECIFIC VENUES**: When possible, suggest ACTUAL real-world venues:
   - Public libraries (e.g., "Los Angeles Public Library - Central Branch")
   - Public parks (e.g., "Griffith Park, Los Angeles")
   - Community centers
   - University campuses (if accessible)
   - Coffee shops (specific chains or locations)
   - Avoid generic suggestions when specific venues exist

3. **LOCATION TYPES**:
   - **Interior (INT)**: Indoor spaces (apartments, offices, cafes, stores)
   - **Exterior (EXT)**: Outdoor spaces (parks, streets, parking lots, rooftops)
   - **Both**: Spaces that can serve as both interior and exterior

4. **SOURCING PLATFORMS**:
   - **Airbnb**: Short-term rentals, often affordable ($50-$200/day)
   - **Peerspace**: Professional filming spaces ($100-$300/day)
   - **Giggster**: Location marketplace ($50-$500/day)
   - **Public Space**: Free parks, streets, libraries (FREE)
   - **Actor-Owned**: Cast member's property (FREE or minimal cost)
   - **Rental**: Traditional location rental ($200-$500/day)
   - **Specific-Venue**: Actual real-world location (cost varies)

5. **LOGISTICS REQUIREMENTS**:
   - Parking: Essential for crew/equipment
   - Power Access: For lighting/equipment
   - Restroom Access: For cast/crew comfort
   - Permit Requirements: Note if permits are needed and estimated cost
   - Insurance/Deposits: Mention if required

6. **OUTPUT FORMAT**:
Provide STRICTLY valid JSON array of 2-3 location options. Each option must have:
- id (unique identifier, e.g., "suggestion_loc1_option1")
- venueName (specific venue name when possible, e.g., "Los Angeles Public Library")
- venueType (e.g., "Public Library", "Office Building", "Coffee Shop")
- address (specific address or area, e.g., "630 W 5th St, Los Angeles, CA 90071"). If no exact address, include area + searchGuidance.
- estimatedCost (number in dollars, prefer $0-$150) AND permitCost (number, 0 if none), insuranceRequired (boolean), depositAmount (number, 0 if none)
- pros (array of 3-4 advantages, keep each item concise and on a single line)
- cons (array of 2-3 challenges, keep each item concise and on a single line)
- logistics (object with parking, power, restrooms, permitRequired, permitCost, notes)
- sourcing ("airbnb", "peerspace", "giggster", "public-space", "actor-owned", "rental", "specific-venue", or "other")
- searchGuidance (if not specific venue, e.g., "Search Peerspace for 'modern loft' in [city]")
- specificVenueUrl (if suggesting actual venue, provide website URL if known)
- isPreferred (false)
- costBreakdown (object: dayRate, permitCost, insuranceRequired, depositAmount, notes)

**CRITICAL JSON RULES:**
- All string values MUST escape newlines as \\n (not actual newlines)
- Keep pros/cons items concise (max 100 characters each)
- Use single-line strings - NO actual line breaks in JSON string values
- Ensure all control characters (newlines, tabs) are properly escaped
- NO markdown, NO code blocks, NO explanations - ONLY the JSON array.`
}

/**
 * Build user prompt for a specific location group
 */
function buildUserPrompt(
  locationGroup: ArcLocationGroup,
  storyBible: any,
  castLocationInfo: {
    primaryCity?: string
    primaryState?: string
    primaryCountry?: string
    metroAreas: string[]
  }
): string {
  const seriesTitle = storyBible?.seriesTitle || storyBible?.title || 'Untitled Series'
  const genre = storyBible?.genre || 'Drama'
  const tone = storyBible?.tone || 'Realistic'
  const setting = storyBible?.setting || storyBible?.worldBuilding?.setting || 'Contemporary'

  let prompt = `Generate 2-3 real-world shooting location suggestions for "${locationGroup.parentLocationName}" in "${seriesTitle}".\n\n`

  prompt += `**SERIES CONTEXT:**\n`
  prompt += `Title: ${seriesTitle}\n`
  prompt += `Genre: ${genre}\n`
  prompt += `Tone: ${tone}\n`
  prompt += `Setting: ${setting}\n\n`

  prompt += `**LOCATION REQUIREMENTS:**\n`
  prompt += `Location Name: ${locationGroup.parentLocationName}\n`
  prompt += `Type: ${locationGroup.type} (${locationGroup.type === 'interior' ? 'Indoor' : locationGroup.type === 'exterior' ? 'Outdoor' : 'Indoor/Outdoor'})\n`
  prompt += `Used in ${locationGroup.totalEpisodes} episode(s), ${locationGroup.totalScenes} scene(s)\n`
  const episodesUsed = (locationGroup as any).episodesUsed || locationGroup.episodeUsage?.map(e => e.episodeNumber) || []
  const scenesUsed = (locationGroup as any).scenesUsed || []
  const timeOfDay = (locationGroup as any).timeOfDay || []

  if (episodesUsed.length > 0) {
    prompt += `Episodes: ${episodesUsed.join(', ')}\n`
  }
  if (scenesUsed.length > 0) {
    prompt += `Scenes: ${scenesUsed.join(', ')}\n`
  }
  if (timeOfDay.length > 0) {
    prompt += `Common Times: ${timeOfDay.join(', ')}\n`
  }
  
  if (locationGroup.subLocations.length > 0) {
    prompt += `Sub-locations: ${locationGroup.subLocations.map(sl => sl.name).join(', ')}\n`
  }
  
  if (locationGroup.storyBibleReference) {
    prompt += `Story Bible Reference: ${locationGroup.storyBibleReference}\n`
  }
  prompt += `\n`

  // Add story bible location details if available
  if (locationGroup.storyBibleReference) {
    const storyBibleLocations = storyBible?.worldBuilding?.locations || []
    const sbLoc = storyBibleLocations.find((loc: any) => {
      const name = typeof loc === 'string' ? loc : loc.name || loc.title
      return name === locationGroup.storyBibleReference
    })
    
    if (sbLoc) {
      prompt += `**STORY BIBLE LOCATION DETAILS:**\n`
      if (typeof sbLoc === 'object') {
        if (sbLoc.description) prompt += `Description: ${sbLoc.description}\n`
        if (sbLoc.significance) prompt += `Significance: ${sbLoc.significance}\n`
        if (sbLoc.type) prompt += `Type: ${sbLoc.type}\n`
      }
      prompt += `\n`
    }
  }

  // Add cast location preference
  if (castLocationInfo.metroAreas.length > 0) {
    prompt += `**CAST LOCATION PREFERENCE:**\n`
    prompt += `Primary Location: ${castLocationInfo.primaryCity || 'N/A'}`
    if (castLocationInfo.primaryState) prompt += `, ${castLocationInfo.primaryState}`
    if (castLocationInfo.primaryCountry) prompt += `, ${castLocationInfo.primaryCountry}`
    prompt += `\n`
    prompt += `Metro Areas: ${castLocationInfo.metroAreas.join(', ')}\n`
    prompt += `\n`
    prompt += `**IMPORTANT**: Prioritize locations in or near these areas for practical filming.\n\n`
  }

  prompt += `**INSTRUCTIONS:**\n`
  prompt += `Generate 2-3 practical, real-world shooting location suggestions that:\n`
  prompt += `1. Match the location type (${locationGroup.type})\n`
  prompt += `2. Fit the series tone and genre (${genre}, ${tone})\n`
  prompt += `3. Are budget-friendly (prefer $0-$150/day, max $500/day)\n`
  prompt += `4. Have good logistics (parking, power, restrooms)\n`
  if (castLocationInfo.metroAreas.length > 0) {
    prompt += `5. Are located in or near: ${castLocationInfo.metroAreas.join(', ')}\n`
  }
  prompt += `6. When possible, suggest SPECIFIC real-world venues (libraries, parks, specific buildings)\n`
  prompt += `7. Include permitCost (number), insuranceRequired (boolean), depositAmount (number) and address or searchGuidance.\n`
  prompt += `\n`

  prompt += `**JSON FORMAT REQUIREMENTS:**\n`
  prompt += `- Escape all newlines in string values as \\n (not actual newlines)\n`
  prompt += `- Keep pros/cons items concise (max 100 characters each, single line)\n`
  prompt += `- Ensure valid JSON with no control characters in string literals\n`
  prompt += `\n`

  prompt += `Output ONLY a JSON array of 2-3 location suggestions. NO markdown, NO code blocks, NO explanations.`

  return prompt
}

/**
 * Parse AI response into ShootingLocationSuggestion objects
 */
function parseLocationSuggestions(
  aiResponse: string,
  locationGroupId: string
): ShootingLocationSuggestion[] {
  try {
    const toNumber = (val: any, fallback = 0) => {
      if (typeof val === 'number' && !Number.isNaN(val)) return val
      const parsed = parseFloat(val)
      return Number.isFinite(parsed) ? parsed : fallback
    }

    const sanitize = (text: string) =>
      text
        .trim()
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/,\s*([\]}])/g, '$1') // trailing commas
        .replace(/\r/g, '')
        .replace(/\t/g, ' ')

    let cleaned = sanitize(aiResponse)

    // CRITICAL FIX: Pre-process to escape ALL literal newlines in string values BEFORE any parsing
    // This handles the case where AI returns: "text\n more text" instead of "text\\n more text"
    cleaned = cleaned.replace(/"([^"]*?)"/g, (match, content) => {
      const escaped = content.replace(/\n/g, '\\n').replace(/\r/g, '')
      return `"${escaped}"`
    })

    // Extract JSON from markdown code blocks
    const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch && jsonMatch[1]) {
      cleaned = sanitize(jsonMatch[1])
      // Re-apply newline fix after sanitize
      cleaned = cleaned.replace(/"([^"]*?)"/g, (match, content) => {
        const escaped = content.replace(/\n/g, '\\n').replace(/\r/g, '')
        return `"${escaped}"`
      })
    } else if (cleaned.startsWith('```json')) {
      cleaned = sanitize(cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, ''))
      cleaned = cleaned.replace(/"([^"]*?)"/g, (match, content) => {
        const escaped = content.replace(/\n/g, '\\n').replace(/\r/g, '')
        return `"${escaped}"`
      })
    } else if (cleaned.startsWith('```')) {
      cleaned = sanitize(cleaned.replace(/^```\s*/, '').replace(/\s*```$/, ''))
      cleaned = cleaned.replace(/"([^"]*?)"/g, (match, content) => {
        const escaped = content.replace(/\n/g, '\\n').replace(/\r/g, '')
        return `"${escaped}"`
      })
    }

    // Extract array boundaries
    const firstBracket = cleaned.indexOf('[')
    const lastBracket = cleaned.lastIndexOf(']')
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      cleaned = cleaned.substring(firstBracket, lastBracket + 1)
    }

    // Handle double-wrapped arrays like [[{...}]]
    while (cleaned.startsWith('[[') && cleaned.endsWith(']]')) {
      cleaned = cleaned.slice(1, -1).trim()
    }

    // If still not starting with [, try to locate the first array using regex
    if (!cleaned.trim().startsWith('[')) {
      const arrayMatch = cleaned.match(/\[([\s\S]*)\]/m)
      if (arrayMatch && arrayMatch[0]) {
        cleaned = arrayMatch[0]
      }
    }

    // Drop invalid standalone backslashes (not part of valid escape sequences)
    cleaned = cleaned.replace(/\\(?!["\\/bfnrtu])/g, '')

    // Final cleanup
    cleaned = cleaned
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
      .replace(/\/\/.*$/gm, '')
      .trim()

    // Try parsing with multiple strategies
    const tryParses = [
      // 1. Direct parse (should work now with pre-escaped newlines)
      () => JSON.parse(cleaned),
      // 2. Wrap single object in array if needed
      () => JSON.parse(cleaned.startsWith('{') ? `[${cleaned}]` : cleaned),
      // 3. Collapse multiple bracket layers
      () => {
        const collapsed = cleaned.replace(/^\[+/, '[').replace(/\]+$/, ']')
        return JSON.parse(collapsed)
      },
      // 4. NUCLEAR: Manual character-by-character newline stripper (backup)
      () => {
        let repaired = ''
        let inString = false
        let escapeNext = false
        for (let i = 0; i < cleaned.length; i++) {
          const char = cleaned[i]
          if (escapeNext) {
            repaired += char
            escapeNext = false
            continue
          }
          if (char === '\\') {
            escapeNext = true
            repaired += char
            continue
          }
          if (char === '"') {
            inString = !inString
            repaired += char
            continue
          }
          if (inString && (char === '\n' || char === '\r')) {
            repaired += ' '
            continue
          }
          repaired += char
        }
        return JSON.parse(repaired)
      }
    ]

    let parsed: any
    let lastErr: any
    for (const attempt of tryParses) {
      try {
        parsed = attempt()
        break
      } catch (err) {
        lastErr = err
      }
    }

    if (!parsed) throw lastErr || new Error('Unable to parse suggestions')
    if (!Array.isArray(parsed)) {
      throw new Error('AI response is not an array')
    }

    // Convert to ShootingLocationSuggestion format
    const suggestions: ShootingLocationSuggestion[] = parsed
      .filter((opt: any) => opt && (opt.venueName || opt.address || opt.searchGuidance))
      .slice(0, 3)
      .map((opt: any, index: number) => {
      const pros = Array.isArray(opt.pros) ? opt.pros.map((p: any) => String(p).trim()) : []
      const cons = Array.isArray(opt.cons) ? opt.cons.map((c: any) => String(c).trim()) : []
      const address = opt.address || ''
      const searchGuidance = opt.searchGuidance || (address ? undefined : 'Search nearby options')

      return {
      id: opt.id || `suggestion_${locationGroupId}_option${index + 1}_${Date.now()}`,
      venueName: opt.venueName || `Location Option ${index + 1}`,
      venueType: opt.venueType || 'Location',
        address: address || 'Address TBD',
        estimatedCost: toNumber(opt.estimatedCost),
        permitCost: toNumber(opt.permitCost),
        insuranceRequired: !!opt.insuranceRequired,
        depositAmount: toNumber(opt.depositAmount),
        pros,
        cons,
      logistics: {
        parking: opt.logistics?.parking ?? true,
        power: opt.logistics?.power ?? true,
        restrooms: opt.logistics?.restrooms ?? true,
        permitRequired: opt.logistics?.permitRequired ?? false,
          permitCost: toNumber(opt.logistics?.permitCost),
        notes: opt.logistics?.notes || ''
      },
      sourcing: (opt.sourcing || 'other') as ShootingLocationSuggestion['sourcing'],
        searchGuidance,
      specificVenueUrl: opt.specificVenueUrl || undefined,
        isPreferred: false,
        costBreakdown: opt.costBreakdown ? {
          dayRate: toNumber(opt.costBreakdown.dayRate, toNumber(opt.estimatedCost)),
          permitCost: toNumber(opt.costBreakdown.permitCost),
          insuranceRequired: !!opt.costBreakdown.insuranceRequired,
          depositAmount: toNumber(opt.costBreakdown.depositAmount),
          notes: opt.costBreakdown.notes
        } : {
          dayRate: toNumber(opt.estimatedCost),
          permitCost: toNumber(opt.permitCost || opt.logistics?.permitCost),
          insuranceRequired: !!opt.insuranceRequired,
          depositAmount: toNumber(opt.depositAmount)
        }
      }
    })

    if (suggestions.length === 0) {
      throw new Error('No valid suggestions returned')
    }

    return suggestions
  } catch (error) {
    console.error('❌ Error parsing location suggestions:', error)
    console.error('AI Response:', aiResponse.substring(0, 800))
    throw new Error(`Failed to parse location suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate shooting location suggestions for all location groups
 */
export async function generateShootingLocationSuggestions(
  params: GenerateSuggestionsParams
): Promise<ArcLocationGroup[]> {
  const {
    locationGroups,
    storyBible,
    castingData,
    onProgress
  } = params

  console.log(`📍 Generating shooting location suggestions for ${locationGroups.length} location groups...`)

  const castLocationInfo = extractCastLocationInfo(castingData)
  const systemPrompt = buildSystemPrompt()

  const updatedGroups: ArcLocationGroup[] = []

  for (let i = 0; i < locationGroups.length; i++) {
    const group = locationGroups[i]

    // Update progress
    if (onProgress) {
      onProgress({
        currentLocation: i + 1,
        totalLocations: locationGroups.length,
        currentLocationName: group.parentLocationName,
        completedLocations: i
      })
    }

    console.log(`  🎬 Generating suggestions for: ${group.parentLocationName} (${i + 1}/${locationGroups.length})`)

    try {
      const userPrompt = buildUserPrompt(group, storyBible, castLocationInfo)

      const response = await EngineAIRouter.generateContent({
        prompt: userPrompt,
        systemPrompt,
        temperature: 0.7,
        maxTokens: 4500, // Increased from 3000 to handle longer responses with detailed pros/cons
        engineId: 'arc-location-suggester',
        forceProvider: 'gemini'
      })

      console.log(`  ✅ AI Response received for ${group.parentLocationName}`)

      const suggestions = parseLocationSuggestions(response.content, group.id)

      console.log(`  ✅ Generated ${suggestions.length} suggestions for ${group.parentLocationName}`)

      updatedGroups.push({
        ...group,
        shootingLocationSuggestions: suggestions
      })
    } catch (error) {
      console.error(`  ❌ Error generating suggestions for ${group.parentLocationName}:`, error)
      // Continue with empty suggestions on error
      updatedGroups.push({
        ...group,
        shootingLocationSuggestions: []
      })
    }
  }

  console.log(`✅ Location suggestion generation complete: ${updatedGroups.length} location groups processed`)

  return updatedGroups
}



