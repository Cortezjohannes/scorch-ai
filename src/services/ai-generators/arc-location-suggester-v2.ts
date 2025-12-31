import { EngineAIRouter } from '@/services/engine-ai-router'
import type { ArcLocationGroup, ShootingLocationSuggestion } from '@/types/preproduction'
import type { CastingData } from '@/types/preproduction'
import { LocationSuggestionsResponseSchema } from '@/schemas/location-suggestion.schema'
import { applyPriceEstimationIfNeeded } from '@/services/location-pricing-estimator'

type Provider = 'azure' | 'gemini'

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

const RETRY_DELAYS_MS = [1000, 2000, 4000]

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Build a concise system prompt that forces clean JSON
 */
function buildSystemPrompt(): string {
  return `You are a senior film location scout. Return STRICT JSON only.
- Never include markdown or code fences.
- Do not include explanations.
- Escape all newlines as \\n inside strings.
- Provide 2-3 options only.`
}

/**
 * Build a simple user prompt for one location
 */
function buildUserPrompt(locationGroup: ArcLocationGroup, storyBible: any): string {
  const seriesTitle = storyBible?.seriesTitle || storyBible?.title || 'Untitled Series'
  const seriesOverview = storyBible?.seriesOverview || ''
  const genre = storyBible?.genre || 'Drama'
  const setting = storyBible?.worldBuilding?.setting || storyBible?.setting || 'Contemporary'
  const worldRules = storyBible?.worldBuilding?.rules || ''

  const sbLocations = Array.isArray(storyBible?.worldBuilding?.locations)
    ? storyBible.worldBuilding.locations
    : []
  const sbEntry = sbLocations.find((loc: any) => {
    const name = typeof loc === 'string' ? loc : loc?.name || loc?.title
    return name && name.toLowerCase() === locationGroup.parentLocationName.toLowerCase()
  })

  const description =
    typeof sbEntry === 'object'
      ? sbEntry?.description || sbEntry?.summary || ''
      : ''

  return [
    `Generate 2-3 real-world filming options for "${locationGroup.parentLocationName}".`,
    `Series: ${seriesTitle}${seriesOverview ? ` (${seriesOverview})` : ''}`,
    `Genre: ${genre} | Setting: ${setting}`,
    worldRules ? `World Rules: ${typeof worldRules === 'string' ? worldRules.substring(0, 200) : ''}` : '',
    description ? `Story bible notes: ${description}` : '',
    `Location type: ${locationGroup.type}.`,
    `PRICING GUIDANCE - Provide realistic day rates:`,
    `  - Airbnb: $100-300/day`,
    `  - Peerspace: $150-400/day`,
    `  - Giggster: $200-500/day`,
    `  - Specific venues: $300-800/day`,
    `  - Rentals: $250-600/day`,
    `  - Public spaces: $0/day (free)`,
    `Do NOT return $0 unless the location is genuinely free (public park, library, street, etc.).`,
    `Examples: Modern loft on Peerspace: $250/day, Office building: $400/day, Public park: $0/day, Residential Airbnb: $180/day.`,
    `costBreakdown.dayRate must always be populated with realistic values.`,
    `Output JSON with shape: {"suggestions":[{venueName,venueType,address,estimatedCost,permitCost,depositAmount,insuranceRequired,pros,cons,logistics:{parking,power,restrooms,permitRequired,permitCost,notes},sourcing,searchGuidance,specificVenueUrl,isPreferred:false,costBreakdown:{dayRate,permitCost,insuranceRequired,depositAmount,notes}}]}`
  ]
    .filter(Boolean)
    .join('\n')
}

/**
 * Very small sanitizer to strip markdown fences and smart quotes
 */
function sanitize(raw: string): string {
  let text = raw.trim()
  text = text.replace(/```(?:json)?/gi, '').replace(/```/g, '')
  text = text.replace(/[“”]/g, '"').replace(/[‘’]/g, "'")
  // Remove leading text before first { or [
  const firstBrace = Math.min(
    ...[text.indexOf('{'), text.indexOf('[')].filter((i) => i >= 0)
  )
  if (firstBrace > 0) text = text.slice(firstBrace)
  // Replace literal newlines inside quotes with space
  let repaired = ''
  let inString = false
  let escapeNext = false
  for (const char of text) {
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
  return repaired
}

function parseAndValidateSuggestions(raw: string): ShootingLocationSuggestion[] {
  const cleaned = sanitize(raw)

  const tryParses = [
    () => JSON.parse(cleaned),
    () => {
      const firstBracket = cleaned.indexOf('[')
      const lastBracket = cleaned.lastIndexOf(']')
      if (firstBracket >= 0 && lastBracket > firstBracket) {
        return JSON.parse(cleaned.slice(firstBracket, lastBracket + 1))
      }
      throw new Error('No JSON array found')
    },
    () => {
      const firstBrace = cleaned.indexOf('{')
      const lastBrace = cleaned.lastIndexOf('}')
      if (firstBrace >= 0 && lastBrace > firstBrace) {
        return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1))
      }
      throw new Error('No JSON object found')
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

  if (!parsed) {
    throw lastErr || new Error('Unable to parse AI response')
  }

  // Normalize into { suggestions: [...] }
  let payload: any
  if (Array.isArray(parsed)) {
    payload = { suggestions: parsed }
  } else if (parsed.suggestions) {
    payload = parsed
  } else {
    payload = { suggestions: [parsed] }
  }

  const validated = LocationSuggestionsResponseSchema.parse(payload)

  // Apply price estimation for any suggestions with $0 or missing prices
  const suggestionsWithPricing = validated.suggestions.map(suggestion =>
    applyPriceEstimationIfNeeded(suggestion)
  )

  return suggestionsWithPricing
}

async function generateWithProvider(
  provider: Provider,
  locationGroup: ArcLocationGroup,
  storyBible: any
): Promise<{ suggestions: ShootingLocationSuggestion[]; model?: string; provider: Provider }> {
  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt(locationGroup, storyBible)

  const response = await EngineAIRouter.generateContent({
    prompt: userPrompt,
    systemPrompt,
    temperature: 0.45,
    maxTokens: 1400,
    engineId: 'arc-location-suggester-v2',
    forceProvider: provider
  })

  const suggestions = parseAndValidateSuggestions(response.content)
  return {
    suggestions,
    model: response.model,
    provider
  }
}

async function generateWithRetries(
  locationGroup: ArcLocationGroup,
  storyBible: any
): Promise<{ suggestions: ShootingLocationSuggestion[]; aiProvider: Provider; aiModel?: string }> {
  // Force Azure first; Gemini fallback is disabled for this flow.
  const providers: Provider[] = ['azure']
  let lastError: any

  for (const provider of providers) {
    for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt++) {
      try {
        const result = await generateWithProvider(provider, locationGroup, storyBible)
        return { suggestions: result.suggestions, aiProvider: provider, aiModel: result.model }
      } catch (error) {
        lastError = error
        const delay = RETRY_DELAYS_MS[attempt]
        if (attempt < RETRY_DELAYS_MS.length - 1) {
          await sleep(delay)
        }
      }
    }
  }

  throw lastError || new Error('All providers failed')
}

/**
 * Generate shooting location suggestions for all location groups (one-by-one)
 */
export async function generateAllLocationSuggestions(
  params: GenerateSuggestionsParams
): Promise<ArcLocationGroup[]> {
  const { locationGroups, storyBible, onProgress } = params

  const updated: ArcLocationGroup[] = []

  for (let i = 0; i < locationGroups.length; i++) {
    const group = locationGroups[i]

    if (onProgress) {
      onProgress({
        currentLocation: i + 1,
        totalLocations: locationGroups.length,
        currentLocationName: group.parentLocationName,
        completedLocations: i
      })
    }

    try {
      const { suggestions, aiProvider, aiModel } = await generateWithRetries(group, storyBible)
      updated.push({
        ...group,
        shootingLocationSuggestions: suggestions,
        aiProvider,
        aiModel,
        generationError: undefined
      })
    } catch (error: any) {
      console.error(`❌ Failed to generate suggestions for ${group.parentLocationName}:`, error)
      updated.push({
        ...group,
        shootingLocationSuggestions: [],
        aiProvider: undefined,
        aiModel: undefined,
        generationError: error?.message || 'Failed to generate suggestions'
      })
    }
  }

  return updated
}

