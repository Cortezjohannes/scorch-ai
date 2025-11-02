/**
 * Location Generator - AI Service
 * Generates 2-3 alternative location options per scene based on script breakdown and screenplay
 * 
 * Uses EngineAIRouter with Gemini 2.5 Pro for analytical + creative alternatives
 * 
 * Standards:
 * - Generate 2-3 realistic alternatives per scene requirement
 * - Focus on micro-budget options ($0-$500 per location)
 * - Provide honest pros/cons for decision-making
 * - Consider logistics (parking, power, permits, proximity)
 * - Prioritize free/low-cost options for UGC web series
 */

import { EngineAIRouter } from '@/services/engine-ai-router'
import type { ScriptBreakdownData, CastingData } from '@/types/preproduction'
import type { LocationOptionsData, LocationOption } from '@/types/preproduction'

interface GeneratedScript {
  title: string
  episodeNumber: number
  pages: any[]
  metadata: {
    pageCount: number
    sceneCount: number
    characterCount: number
    estimatedRuntime: string
  }
}

interface LocationGenerationParams {
  breakdownData: ScriptBreakdownData
  scriptData: GeneratedScript
  storyBible: any
  castingData?: CastingData // Optional: includes cast location info
  episodeNumber: number
  episodeTitle: string
}

interface SceneLocationRequirement {
  sceneNumber: number
  sceneTitle: string
  locationType: 'INT' | 'EXT'
  timeOfDay: string
  sceneDescription: string
  characterCount: number
  specialRequirements: string[]
}

/**
 * Generate location options for all scenes
 */
export async function generateLocations(params: LocationGenerationParams): Promise<LocationOptionsData> {
  const { breakdownData, scriptData, storyBible, castingData, episodeNumber, episodeTitle } = params

  console.log('📍 Generating location options for Episode', episodeNumber)
  console.log('📋 Analyzing', breakdownData.scenes.length, 'scenes')
  if (castingData?.cast) {
    const confirmedCast = castingData.cast.filter(c => c.status === 'confirmed')
    console.log('👥 Cast location data:', confirmedCast.length, 'confirmed actors')
  }

  // Extract location requirements per scene
  const locationRequirements = extractLocationRequirements(breakdownData, scriptData)
  console.log('✅ Extracted', locationRequirements.length, 'location requirements')

  // Extract cast location info
  const castLocationInfo = extractCastLocationInfo(castingData)

  // Build AI prompts
  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt(locationRequirements, storyBible, episodeTitle, castLocationInfo)

  try {
    // Use EngineAIRouter with Gemini 2.5 Pro (analytical + creative)
    console.log('🤖 Calling AI for location options...')
    const response = await EngineAIRouter.generateContent({
      prompt: userPrompt,
      systemPrompt: systemPrompt,
      temperature: 0.7, // Creative alternatives, but practical
      maxTokens: 8000, // Enough for multiple alternatives per scene
      engineId: 'location-generator',
      forceProvider: 'gemini' // Gemini excels at analytical + creative tasks
    })

    console.log('✅ AI Response received:', response.metadata.contentLength, 'characters')
    
    // Parse AI response into structured location options
    const locationOptions = parseLocationOptions(response.content, locationRequirements, episodeNumber, episodeTitle)
    
    console.log('✅ Location options generated:', locationOptions.sceneRequirements.length, 'scene requirements')
    console.log('  Total options:', locationOptions.sceneRequirements.reduce((sum, req) => sum + req.options.length, 0))
    
    return locationOptions
  } catch (error) {
    console.error('❌ Error generating location options:', error)
    throw new Error(`Location generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Extract location requirements from breakdown and script
 */
function extractLocationRequirements(
  breakdown: ScriptBreakdownData,
  script: GeneratedScript
): SceneLocationRequirement[] {
  const requirements: SceneLocationRequirement[] = []

  for (const scene of breakdown.scenes) {
    // Get scene description from script if available
    let sceneDescription = scene.sceneTitle || `Scene ${scene.sceneNumber}`
    
    // Try to find scene content in script
    const scriptScene = findSceneInScript(script, scene.sceneNumber)
    if (scriptScene) {
      sceneDescription = scriptScene.description || sceneDescription
    }

    // Determine location type from breakdown location field
    const locationType = scene.location?.toUpperCase().includes('INT') ? 'INT' : 'EXT'

    requirements.push({
      sceneNumber: scene.sceneNumber,
      sceneTitle: scene.sceneTitle || `Scene ${scene.sceneNumber}`,
      locationType,
      timeOfDay: scene.timeOfDay || 'DAY',
      sceneDescription,
      characterCount: scene.characters?.length || 0,
      specialRequirements: scene.specialRequirements || []
    })
  }

  return requirements
}

/**
 * Find scene in script by scene number
 */
function findSceneInScript(script: GeneratedScript, sceneNumber: number): { description: string } | null {
  // Try to find scene in script pages
  for (const page of script.pages || []) {
    for (const element of page.elements || []) {
      if (element.metadata?.sceneNumber === sceneNumber && element.type === 'action') {
        return { description: element.content }
      }
    }
  }
  return null
}

/**
 * Build system prompt for AI
 */
function buildSystemPrompt(): string {
  return `You are a professional location scout for micro-budget web series production.

Your job is to generate 2-3 realistic alternative location options per scene requirement.

**CRITICAL RULES:**

1. **ALWAYS GENERATE 2-3 OPTIONS PER SCENE**
   - Option 1: Recommended (best match, may have cost)
   - Option 2: Budget-friendly (free/low-cost, may require compromise)
   - Option 3: Alternative style/vibe (different aesthetic, similar function)
   - Each option must be viable - no impossible locations

2. **MICRO-BUDGET FOCUS (UGC WEB SERIES)**
   - Total series budget: $1k-$20k for ALL episodes
   - Per location budget: $0-$500 (most should be $0-$150)
   - Prioritize: Free > Public spaces > Low-cost rental > Paid rental
   - Focus on UGC-friendly options: homes, cafes, public spaces, actor-owned spaces

3. **COST REALISM**
   - Free: Actor's home, friend's space, public space (may need permit)
   - Low-cost ($0-$50): Basic permit fees, minimal rental
   - Moderate ($50-$150): Short-term rental, Airbnb-style booking
   - Higher ($150-$500): Professional studio, event venue (rare for micro-budget)
   - Always provide cost estimate in dollars

4. **GEOGRAPHIC PROXIMITY & CAST LOCATION**
   - PRIMARY PRIORITY: Locations must match STORY SETTING (if story is set in Manila, recommend Manila locations)
   - SECONDARY PRIORITY: If cast location data is provided, prioritize locations near cast base to minimize travel costs
   - Ideal: Story location matches cast location (e.g., Manila story with Manila-based actors = Manila locations)
   - Compromise: If story location differs from cast location, recommend locations in cast's city that can represent story setting
   - Always consider travel costs when cast must travel - factor into pros/cons
   - Include proximity notes in logistics (e.g., "10 minutes from actor residence", "Central to cast locations")

5. **PROS AND CONS (HONEST)**
   - Pros: Real advantages (cost, logistics, aesthetic, control)
   - Cons: Real challenges (limitations, restrictions, hidden costs, availability)
   - Be honest - help decision-making, don't just sell options
   - Each option should have 2-4 pros and 2-4 cons

6. **LOGISTICS ASSESSMENT**
   - Parking: Available/not available/varies
   - Power: Essential for lighting/equipment
   - Restrooms: For crew comfort
   - Permits: Required/not required, cost if needed
   - Notes: Important considerations (insurance, restrictions, accessibility)

7. **SOURCING SUGGESTIONS**
   - free: Actor-owned, friend's space, public space
   - rental: Airbnb, event venue, studio rental
   - borrow: Friend/family property (no cost)
   - owned: Producer/crew owns space
   - public-space: Park, library, cafe (may need permission)

8. **EVALUATION CRITERIA**
   - Cost: $0 (free) > $50 (low) > $150 (moderate) > $300+ (expensive)
   - Logistics: Parking, power, restrooms, accessibility
   - Permits: None > Simple > Complex/Expensive
   - Availability: Flexible > Limited dates > Fixed schedule
   - Aesthetic Match: Perfect > Good > Acceptable > Poor
   - Control: Full > Partial > Limited (public spaces)

9. **OUTPUT FORMAT**
   - Valid JSON only
   - No markdown, no code blocks, no explanations
   - Match the exact structure specified
   - Always include exactly 2-3 options per scene requirement`
}

/**
 * Extract cast location information for proximity-based recommendations
 */
function extractCastLocationInfo(castingData?: CastingData): {
  storyLocation: string
  primaryCastLocation: string | null
  castLocations: Array<{ characterName: string; city?: string; state?: string; country?: string }>
  castLocationMatch: boolean
} {
  if (!castingData?.cast || castingData.cast.length === 0) {
    return {
      storyLocation: '',
      primaryCastLocation: null,
      castLocations: [],
      castLocationMatch: false
    }
  }

  // Get confirmed cast with location info
  const confirmedCast = castingData.cast
    .filter(c => c.status === 'confirmed' && (c.city || c.state || c.country))
    .map(c => ({
      characterName: c.characterName,
      city: c.city,
      state: c.state,
      country: c.country
    }))

  // Find most common cast location (primary hub)
  const locationCounts = new Map<string, number>()
  confirmedCast.forEach(c => {
    const loc = c.city || c.state || c.country || ''
    if (loc) locationCounts.set(loc, (locationCounts.get(loc) || 0) + 1)
  })
  
  const primaryCastLocation = Array.from(locationCounts.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null

  return {
    storyLocation: '',
    primaryCastLocation,
    castLocations: confirmedCast,
    castLocationMatch: false // Will be set based on story comparison
  }
}

/**
 * Build user prompt with all context
 */
function buildUserPrompt(
  requirements: SceneLocationRequirement[],
  storyBible: any,
  episodeTitle: string,
  castLocationInfo: ReturnType<typeof extractCastLocationInfo>
): string {
  let prompt = `Generate 2-3 alternative location options for each scene requirement in this ${episodeTitle} episode.\n\n`

  // Story context
  const storyLocation = storyBible?.setting || storyBible?.location || storyBible?.storyLocation || 'Urban'
  prompt += `**STORY CONTEXT:**\n`
  prompt += `Series: ${storyBible?.seriesTitle || storyBible?.title || 'Untitled Series'}\n`
  prompt += `Genre: ${storyBible?.genre || 'Drama'}\n`
  prompt += `Story Setting/Location: ${storyLocation}\n`
  prompt += `Tone: ${storyBible?.tone || 'Realistic'}\n\n`

  // Cast location context
  if (castLocationInfo.castLocations.length > 0) {
    prompt += `**CAST LOCATION INFORMATION:**\n`
    if (castLocationInfo.primaryCastLocation) {
      prompt += `Primary Cast Hub: ${castLocationInfo.primaryCastLocation}\n`
    }
    prompt += `Confirmed Actors with Location Data:\n`
    castLocationInfo.castLocations.forEach(cast => {
      const locParts = [cast.city, cast.state, cast.country].filter(Boolean)
      if (locParts.length > 0) {
        prompt += `  - ${cast.characterName}: ${locParts.join(', ')}\n`
      }
    })
    
    // Check if cast location matches story location
    const storyLocationLower = storyLocation.toLowerCase()
    const castLocationLower = castLocationInfo.primaryCastLocation?.toLowerCase() || ''
    const locationMatch = storyLocationLower.includes(castLocationLower) || 
                         castLocationLower.includes(storyLocationLower) ||
                         castLocationInfo.castLocations.some(c => 
                           c.city?.toLowerCase().includes(storyLocationLower) ||
                           storyLocationLower.includes(c.city?.toLowerCase() || '')
                         )
    
    if (locationMatch) {
      prompt += `✅ Cast locations MATCH story setting - prioritize locations in ${castLocationInfo.primaryCastLocation || storyLocation}\n`
    } else {
      prompt += `⚠️ Cast locations may differ from story setting - recommend locations that work for BOTH:\n`
      prompt += `   - Story requires: ${storyLocation}\n`
      prompt += `   - Cast based in: ${castLocationInfo.primaryCastLocation || 'various'}\n`
      prompt += `   - Solution: Recommend locations in ${castLocationInfo.primaryCastLocation || storyLocation} that can represent ${storyLocation || castLocationInfo.primaryCastLocation || 'the story setting'}\n`
    }
    prompt += `\n`
  } else {
    // No cast location data, use story location only
    prompt += `**LOCATION REQUIREMENT:**\n`
    prompt += `Recommend locations based on STORY SETTING: ${storyLocation}\n`
    prompt += `(No cast location data available - prioritize story authenticity)\n\n`
  }

  // Episode context
  prompt += `**EPISODE:** ${episodeTitle}\n`
  prompt += `Production Model: Micro-budget web series ($1k-$20k total series budget)\n`
  prompt += `Location Budget: $0-$500 per location (prefer $0-$150)\n\n`

  // Scene requirements
  prompt += `**SCENE REQUIREMENTS:**\n\n`
  
  for (const req of requirements) {
    prompt += `Scene ${req.sceneNumber}: ${req.sceneTitle}\n`
    prompt += `  Location Type: ${req.locationType} (${req.locationType === 'INT' ? 'Interior' : 'Exterior'})\n`
    prompt += `  Time of Day: ${req.timeOfDay}\n`
    prompt += `  Description: ${req.sceneDescription}\n`
    prompt += `  Characters: ${req.characterCount}\n`
    if (req.specialRequirements.length > 0) {
      prompt += `  Special Requirements: ${req.specialRequirements.join(', ')}\n`
    }
    prompt += `\n`
  }

  // Output format
  prompt += `**TASK:**\n`
  prompt += `For EACH scene requirement above, generate exactly 2-3 location options.\n\n`

  prompt += `For each option, provide:\n`
  prompt += `- name: Specific, descriptive location name\n`
  prompt += `- description: Brief description of the space\n`
  prompt += `- type: "interior" | "exterior" | "both"\n`
  prompt += `- estimatedCost: Number in dollars ($0-$500)\n`
  prompt += `- pros: Array of 2-4 advantages (strings)\n`
  prompt += `- cons: Array of 2-4 challenges/limitations (strings)\n`
  prompt += `- logistics: Object with parkingAvailable (boolean), powerAccess (boolean), restroomAccess (boolean), permitRequired (boolean), permitCost (number or null), notes (string)\n`
  prompt += `- sourcing: "free" | "rental" | "borrow" | "owned" | "public-space"\n`
  prompt += `- address: Optional example/generic address string\n\n`

  prompt += `**OUTPUT FORMAT:**\n\n`
  prompt += `Provide ONLY valid JSON with this structure:\n\n`
  prompt += `{\n`
  prompt += `  "sceneRequirements": [\n`
  prompt += `    {\n`
  prompt += `      "sceneNumber": 1,\n`
  prompt += `      "sceneTitle": "Jason's Penthouse - Night",\n`
  prompt += `      "locationType": "INT",\n`
  prompt += `      "timeOfDay": "NIGHT",\n`
  prompt += `      "options": [\n`
  prompt += `        {\n`
  prompt += `          "name": "Modern High-Rise Apartment (Rental)",\n`
  prompt += `          "description": "Contemporary penthouse-style apartment with city views",\n`
  prompt += `          "type": "interior",\n`
  prompt += `          "estimatedCost": 200,\n`
  prompt += `          "pros": ["Matches script aesthetic", "Good natural light", "Professional look"],\n`
  prompt += `          "cons": ["Requires rental fee", "May need permit", "Limited availability"],\n`
  prompt += `          "logistics": {\n`
  prompt += `            "parkingAvailable": true,\n`
  prompt += `            "powerAccess": true,\n`
  prompt += `            "restroomAccess": true,\n`
  prompt += `            "permitRequired": true,\n`
  prompt += `            "permitCost": 50,\n`
  prompt += `            "notes": "Building may require insurance certificate"\n`
  prompt += `          },\n`
  prompt += `          "sourcing": "rental",\n`
  prompt += `          "address": "Modern apartment building, urban area"\n`
  prompt += `        },\n`
  prompt += `        {\n`
  prompt += `          "name": "Actor's Own Apartment",\n`
  prompt += `          "description": "Use lead actor's actual modern apartment",\n`
  prompt += `          "type": "interior",\n`
  prompt += `          "estimatedCost": 0,\n`
  prompt += `          "pros": ["No rental cost", "Actor comfortable", "No permit needed"],\n`
  prompt += `          "cons": ["May not match exact aesthetic", "Privacy concerns", "Limited control"],\n`
  prompt += `          "logistics": {\n`
  prompt += `            "parkingAvailable": false,\n`
  prompt += `            "powerAccess": true,\n`
  prompt += `            "restroomAccess": true,\n`
  prompt += `            "permitRequired": false,\n`
  prompt += `            "permitCost": null,\n`
  prompt += `            "notes": "Check with building management for filming policy"\n`
  prompt += `          },\n`
  prompt += `          "sourcing": "free",\n`
  prompt += `          "address": "Actor's residence"\n`
  prompt += `        },\n`
  prompt += `        {\n`
  prompt += `          "name": "Airbnb Short-Term Rental",\n`
  prompt += `          "description": "Book modern apartment via Airbnb for shoot day",\n`
  prompt += `          "type": "interior",\n`
  prompt += `          "estimatedCost": 120,\n`
  prompt += `          "pros": ["Flexible booking", "Often good for filming", "Can preview online"],\n`
  prompt += `          "cons": ["Host approval needed", "Limited to 1-2 days", "May have restrictions"],\n`
  prompt += `          "logistics": {\n`
  prompt += `            "parkingAvailable": true,\n`
  prompt += `            "powerAccess": true,\n`
  prompt += `            "restroomAccess": true,\n`
  prompt += `            "permitRequired": false,\n`
  prompt += `            "permitCost": null,\n`
  prompt += `            "notes": "Negotiate filming rights upfront, not just booking"\n`
  prompt += `          },\n`
  prompt += `          "sourcing": "rental",\n`
  prompt += `          "address": "Airbnb listing, urban area"\n`
  prompt += `        }\n`
  prompt += `      ]\n`
  prompt += `    }\n`
  prompt += `  ]\n`
  prompt += `}\n\n`

  prompt += `**CRITICAL REMINDERS:**\n`
  prompt += `- Output ONLY valid JSON (no markdown, no code blocks, no explanation)\n`
  prompt += `- Generate exactly 2-3 options per scene requirement\n`
  prompt += `- All options must be realistic and viable for micro-budget production\n`
  prompt += `- Prioritize free/low-cost options but include variety\n`
  prompt += `- Be honest with pros/cons - help decision-making\n`
  prompt += `- Consider logistics: parking, power, restrooms, permits\n`
  prompt += `- Cost range: $0-$500 (prefer $0-$150)\n`

  return prompt
}

/**
 * Parse AI response into structured location options
 */
function parseLocationOptions(
  aiResponse: string,
  requirements: SceneLocationRequirement[],
  episodeNumber: number,
  episodeTitle: string
): LocationOptionsData {
  try {
    // Clean AI output (remove markdown code blocks if present)
    let cleaned = aiResponse.trim()
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }

    const parsed = JSON.parse(cleaned)

    if (!parsed.sceneRequirements || !Array.isArray(parsed.sceneRequirements)) {
      throw new Error('Invalid AI response structure: missing sceneRequirements array')
    }

    const sceneRequirements = parsed.sceneRequirements.map((req: any, idx: number) => {
      const originalReq = requirements[idx]
      if (!originalReq) {
        throw new Error(`Scene requirement ${idx} not found in original requirements`)
      }

      if (!req.options || !Array.isArray(req.options) || req.options.length === 0) {
        throw new Error(`Scene ${req.sceneNumber || idx + 1} has no options`)
      }

      // Ensure 2-3 options
      if (req.options.length < 2) {
        console.warn(`⚠️  Scene ${req.sceneNumber} only has ${req.options.length} option(s), expected 2-3`)
      }
      if (req.options.length > 3) {
        console.warn(`⚠️  Scene ${req.sceneNumber} has ${req.options.length} options, limiting to 3`)
        req.options = req.options.slice(0, 3)
      }

      const options: LocationOption[] = req.options.map((opt: any, optIdx: number) => ({
        id: `loc_opt_${req.sceneNumber}_${optIdx + 1}`,
        sceneNumbers: [req.sceneNumber],
        name: opt.name || `Location Option ${optIdx + 1}`,
        description: opt.description || '',
        type: opt.type || 'interior',
        estimatedCost: typeof opt.estimatedCost === 'number' ? opt.estimatedCost : 0,
        pros: Array.isArray(opt.pros) ? opt.pros : [],
        cons: Array.isArray(opt.cons) ? opt.cons : [],
        logistics: {
          parkingAvailable: opt.logistics?.parkingAvailable === true,
          powerAccess: opt.logistics?.powerAccess !== false, // Default true
          restroomAccess: opt.logistics?.restroomAccess !== false, // Default true
          permitRequired: opt.logistics?.permitRequired === true,
          permitCost: typeof opt.logistics?.permitCost === 'number' ? opt.logistics.permitCost : undefined,
          notes: opt.logistics?.notes || ''
        },
        sourcing: opt.sourcing || 'free',
        address: opt.address,
        status: 'suggested' as const,
        selected: false
      }))

      return {
        sceneNumber: req.sceneNumber || originalReq.sceneNumber,
        sceneTitle: req.sceneTitle || originalReq.sceneTitle,
        locationType: req.locationType || originalReq.locationType,
        timeOfDay: req.timeOfDay || originalReq.timeOfDay,
        options
      }
    })

    return {
      episodeNumber,
      episodeTitle,
      sceneRequirements,
      lastUpdated: Date.now(),
      generated: true
    }
  } catch (error) {
    console.error('❌ Error parsing AI response:', error)
    console.error('Response:', aiResponse.substring(0, 500))
    throw new Error(`Failed to parse location options: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
