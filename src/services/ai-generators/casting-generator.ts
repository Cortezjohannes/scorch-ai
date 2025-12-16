/**
 * Casting Generator - AI Service
 * Generates casting profiles for all characters with archetypes, actor templates, and requirements
 * 
 * Uses EngineAIRouter with Gemini 3 Pro Preview for analytical + creative casting analysis
 * 
 * Standards:
 * - Extract characters from script breakdown
 * - Generate character archetypes (The Hero, The Mentor, etc.)
 * - Suggest 2-3 real actor templates per character
 * - Create comprehensive casting profiles with physical/performance requirements
 * - Focus on micro-budget accessible actors (emerging talent, indie actors)
 */

import { EngineAIRouter } from '@/services/engine-ai-router'
import type { ScriptBreakdownData, CastingData, CastMember, CharacterCastingProfile } from '@/types/preproduction'

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

interface CastingGenerationParams {
  breakdownData: ScriptBreakdownData
  scriptData: GeneratedScript
  storyBible: any
  episodeNumber: number
  episodeTitle: string
}

interface CharacterInfo {
  name: string
  importance: 'lead' | 'supporting' | 'background'
  lineCount: number
  scenes: number[]
  sceneDescriptions: string[] // Brief description of scenes where character appears
}

/**
 * Generate casting profiles for all characters
 */
export async function generateCasting(params: CastingGenerationParams): Promise<CastingData> {
  const { breakdownData, scriptData, storyBible, episodeNumber, episodeTitle } = params

  console.log('🎭 Generating casting profiles for Episode', episodeNumber)
  console.log('📋 Analyzing', breakdownData.scenes.length, 'scenes')

  // Extract from script/breakdown then anchor to story bible as canon
  const extractedCharacters = extractCharacters(breakdownData, scriptData)
  const canonicalCharacters = buildCanonicalCharactersFromStoryBible(storyBible, extractedCharacters, breakdownData)
  console.log('✅ Canonical characters (story bible first):', canonicalCharacters.length)

  if (canonicalCharacters.length === 0) {
    throw new Error('No characters found (story bible + breakdown). Please add characters to the story bible or generate a breakdown.')
  }

  // Build system prompt (same for all batches)
  const systemPrompt = buildSystemPrompt()

  // Split characters into batches (5-8 characters per batch for optimal token usage)
  const BATCH_SIZE = 6
  const batches: CharacterInfo[][] = []
  for (let i = 0; i < canonicalCharacters.length; i += BATCH_SIZE) {
    batches.push(canonicalCharacters.slice(i, i + BATCH_SIZE))
  }

  console.log(`📦 Splitting ${canonicalCharacters.length} characters into ${batches.length} batch(es)`)
  
  try {
    // Generate casting profiles for each batch
    const allCastMembers: CastMember[] = []
    const batchErrors: string[] = []

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex]
      console.log(`\n🔄 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} characters)...`)
      
      try {
        // Build prompt for this batch only
        const userPrompt = buildUserPrompt(batch, breakdownData, storyBible, episodeTitle)
        
        // Calculate token limit for this batch (2000 per character, min 15000, max 30000)
        const batchTokens = Math.max(15000, Math.min(30000, batch.length * 2000))
        
        console.log(`   Token limit: ${batchTokens}`)
        
        // Generate for this batch
        let response = await EngineAIRouter.generateContent({
          prompt: userPrompt,
          systemPrompt: systemPrompt,
          temperature: 0.7,
          maxTokens: batchTokens,
          engineId: 'casting-generator',
          forceProvider: 'azure'
        })

        console.log(`   ✅ Response received: ${response.metadata.contentLength} characters`)
        
        // Check if response might be truncated
        let responseContent = response.content
        const isLikelyTruncated = responseContent.trim().endsWith(',') || 
                                  (!responseContent.trim().endsWith('}') && !responseContent.trim().endsWith(']')) ||
                                  (responseContent.match(/{/g) || []).length !== (responseContent.match(/}/g) || []).length
        
        // If truncated, retry with higher limit
        if (isLikelyTruncated && batchTokens < 30000) {
          console.warn(`   ⚠️ Response appears truncated, retrying batch ${batchIndex + 1}...`)
          const retryTokens = Math.min(30000, batchTokens * 2)
          response = await EngineAIRouter.generateContent({
            prompt: userPrompt,
            systemPrompt: systemPrompt,
            temperature: 0.7,
            maxTokens: retryTokens,
            engineId: 'casting-generator',
            forceProvider: 'azure'
          })
          console.log(`   ✅ Retry response received: ${response.metadata.contentLength} characters`)
          responseContent = response.content
        }
        
        // Parse batch response
        const batchCastingData = parseCastingProfiles(responseContent, batch, episodeNumber, episodeTitle)
        
        // Add to combined results
        allCastMembers.push(...batchCastingData.cast)
        console.log(`   ✅ Batch ${batchIndex + 1} complete: ${batchCastingData.cast.length} characters`)
        
      } catch (batchError) {
        const errorMsg = `Batch ${batchIndex + 1} failed: ${batchError instanceof Error ? batchError.message : 'Unknown error'}`
        console.error(`   ❌ ${errorMsg}`)
        batchErrors.push(errorMsg)
        
        // Continue with other batches even if one fails
        // Create minimal fallback entries for failed batch
        for (const char of batch) {
          allCastMembers.push({
            id: `cast_${Date.now()}_${char.name}`,
            characterName: char.name,
            role: char.importance,
            scenes: char.scenes,
            totalShootDays: new Set(char.scenes).size,
            payment: 'deferred',
            paymentAmount: 0,
            payRate: 0,
            availability: [],
            specialNeeds: [],
            rehersalNotes: '',
            actorNotes: '',
            status: 'casting',
            confirmed: false,
            comments: [],
            characterProfile: {
              characterName: char.name,
              archetype: 'The Character',
              ageRange: { min: 25, max: 35 },
              physicalRequirements: {},
              performanceRequirements: {
                actingStyle: 'naturalistic',
                emotionalRange: 'standard dramatic range',
                specialSkills: []
              },
              actorTemplates: [],
              castingNotes: 'Profile generation failed - please regenerate',
              priority: char.importance,
              scenes: char.scenes
            }
          })
        }
      }
    }

    // Combine all results
    const castingData: CastingData = {
      episodeNumber,
      episodeTitle,
      totalCharacters: allCastMembers.length,
      confirmedCast: allCastMembers.filter(m => m.confirmed).length,
      cast: allCastMembers,
      lastUpdated: Date.now(),
      updatedBy: 'ai-generator'
    }
    
    console.log(`\n✅ All batches complete!`)
    console.log(`   Total characters: ${castingData.cast.length}`)
    console.log(`   Leads: ${castingData.cast.filter(c => c.characterProfile?.priority === 'lead').length}`)
    console.log(`   Supporting: ${castingData.cast.filter(c => c.characterProfile?.priority === 'supporting').length}`)
    
    if (batchErrors.length > 0) {
      console.warn(`   ⚠️ ${batchErrors.length} batch(es) had errors (fallback profiles created)`)
    }
    
    return castingData
  } catch (error) {
    console.error('❌ Error generating casting profiles:', error)
    throw new Error(`Casting generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Normalize character name for deduplication
 */
function normalizeCharacterName(name: string): string {
  // Convert to title case and remove common suffixes/prefixes
  let normalized = name.trim()
  
  // Remove V.O. / (V.O.) / (O.S.) etc
  normalized = normalized.replace(/\s*\(V\.O\.\)/i, '')
  normalized = normalized.replace(/\s*\(O\.S\.\)/i, '')
  normalized = normalized.replace(/\s*\(CONT\'D\)/i, '')
  
  // Remove parentheticals like "(50s)" or "(40s)"
  normalized = normalized.replace(/\s*\(\d+s\)/i, '')
  
  // Extract main name (before parentheses)
  if (normalized.includes('(')) {
    normalized = normalized.split('(')[0].trim()
  }
  
  // Title case for matching
  return normalized
}

/**
 * Convert character name to proper title case for display
 */
function toTitleCase(name: string): string {
  // If already has mixed case, preserve it
  if (name !== name.toUpperCase() && name !== name.toLowerCase()) {
    return name.trim()
  }
  
  // Convert all caps or all lowercase to title case
  return name
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Extract unique characters directly from script
 */
function extractCharacters(
  breakdown: ScriptBreakdownData,
  script: GeneratedScript
): CharacterInfo[] {
  const characterMap = new Map<string, CharacterInfo>()
  const nameVariations = new Map<string, string>() // Maps variations to canonical name

  // First, extract character names directly from script pages
  const scriptCharacterNames = new Set<string>()
  
  for (const page of script.pages || []) {
    for (const element of page.elements || []) {
      if (element.type === 'character') {
        const charName = element.content.trim().toUpperCase()
        // Skip common screenplay elements
        if (!charName.match(/^(INT\.|EXT\.|FADE|CUT|LATER|SCENE|THE END)$/i)) {
          scriptCharacterNames.add(charName)
        }
      }
      // Also check action lines for character names in parentheses (e.g., "JASON CALACANIS (50s)")
      if (element.type === 'action') {
        const actionText = element.content || ''
        // Match character names in format: "NAME (age)" or "NAME"
        const charMatches = actionText.match(/([A-Z][A-Z\s]+?)\s*\(/g)
        if (charMatches) {
          charMatches.forEach(match => {
            const name = match.replace(/\s*\(.*/, '').trim().toUpperCase()
            if (name.length > 1 && !name.match(/^(INT\.|EXT\.|FADE|CUT)/i)) {
              scriptCharacterNames.add(name)
            }
          })
        }
      }
    }
  }

  // Create normalized map to deduplicate variations (e.g., "JASON" and "JASON CALACANIS")
  const normalizedToCanonical = new Map<string, string>()
  
  // Sort names by length (longest first) to prefer full names over short names
  const sortedNames = Array.from(scriptCharacterNames).sort((a, b) => b.length - a.length)
  
  for (const scriptName of sortedNames) {
    const normalized = normalizeCharacterName(scriptName).toLowerCase()
    
    // Find if we already have a similar name
    let canonical = scriptName
    let merged = false
    
    for (const [existingNorm, existingCanonical] of normalizedToCanonical.entries()) {
      // If normalized names match exactly
      if (normalized === existingNorm) {
        // Use the longer, more specific name as canonical
        canonical = scriptName.length > existingCanonical.length ? scriptName : existingCanonical
        normalizedToCanonical.set(normalized, canonical)
        nameVariations.set(scriptName, canonical)
        merged = true
        break
      }
      
      // If one name contains the other (e.g., "JASON" and "JASON CALACANIS")
      const existingNormLower = existingNorm.toLowerCase()
      if (normalized.includes(existingNormLower) || existingNormLower.includes(normalized)) {
        // Use the longer, more specific name as canonical
        const longerName = scriptName.length > existingCanonical.length ? scriptName : existingCanonical
        const sharedNorm = normalized.length > existingNorm.length ? normalized : existingNorm
        
        // Update the map with the shared normalized name pointing to the longer canonical name
        normalizedToCanonical.set(sharedNorm, longerName)
        nameVariations.set(scriptName, longerName)
        nameVariations.set(existingCanonical, longerName)
        merged = true
        break
      }
    }
    
    if (!merged) {
      normalizedToCanonical.set(normalized, canonical)
      nameVariations.set(scriptName, canonical)
    }
  }

  // Now use breakdown to get scene info, but merge duplicates
  for (const scene of breakdown.scenes || []) {
    if (scene.characters && scene.characters.length > 0) {
      for (const char of scene.characters) {
        const normalizedName = normalizeCharacterName(char.name).toLowerCase()
        
        // Find canonical name from our map
        let finalName = char.name.toUpperCase()
        let found = false
        
        // First try exact match
        if (normalizedToCanonical.has(normalizedName)) {
          finalName = normalizedToCanonical.get(normalizedName)!
          found = true
        } else {
          // Try fuzzy matching
          for (const [norm, canon] of normalizedToCanonical.entries()) {
            if (normalizedName === norm || 
                normalizedName.includes(norm) || 
                norm.includes(normalizedName)) {
              finalName = canon
              found = true
              break
            }
          }
        }
        
        // If not found in map but exists in script, use the script version
        if (!found) {
          // Check if any script name matches
          for (const scriptName of scriptCharacterNames) {
            const scriptNormalized = normalizeCharacterName(scriptName).toLowerCase()
            if (normalizedName === scriptNormalized || 
                normalizedName.includes(scriptNormalized) || 
                scriptNormalized.includes(normalizedName)) {
              finalName = nameVariations.get(scriptName) || scriptName
              found = true
              break
            }
          }
        }

        const existing = characterMap.get(finalName) || {
          name: finalName,
          importance: char.importance,
          lineCount: 0,
          scenes: [],
          sceneDescriptions: []
        }

        // Add scene number if not already present
        if (!existing.scenes.includes(scene.sceneNumber)) {
          existing.scenes.push(scene.sceneNumber)
        }

        // Update importance to highest level (lead > supporting > background)
        if (char.importance === 'lead' || 
            (char.importance === 'supporting' && existing.importance === 'background')) {
          existing.importance = char.importance
        }

        // Accumulate line count
        existing.lineCount += char.lineCount || 0

        // Add scene description
        const sceneDesc = scene.sceneTitle || `Scene ${scene.sceneNumber}`
        if (!existing.sceneDescriptions.includes(sceneDesc)) {
          existing.sceneDescriptions.push(sceneDesc)
        }

        characterMap.set(finalName, existing)
      }
    }
  }

  // Filter out noise characters (background extras, V.O. only, etc.)
  const validCharacters = Array.from(characterMap.values())
    .filter(char => {
      const nameUpper = char.name.toUpperCase()
      // Skip if it's just "VOICE" or "V.O." without a name
      if (nameUpper.match(/^(VOICE|V\.O\.|O\.S\.|BACKGROUND|CROWD|ALL|EXTRA|EXTRAS)$/i)) {
        return false
      }
      // Skip if it's a generic group name without specific character
      if (nameUpper.match(/^(FOCUSED DEVELOPERS|DEVELOPERS|CROWD|EVERYONE|ALL|PEOPLE|GUESTS|STAFF)$/i)) {
        return false
      }
      // Skip if name is too short (likely noise)
      if (char.name.length < 2) {
        return false
      }
      return true
    })
    .map(char => ({
      ...char,
      name: toTitleCase(char.name) // Convert to title case for display
    }))

  // Sort by importance (lead first, then supporting, then background)
  validCharacters.sort((a, b) => {
    const importanceOrder = { lead: 0, supporting: 1, background: 2 }
    const importanceDiff = importanceOrder[a.importance] - importanceOrder[b.importance]
    if (importanceDiff !== 0) return importanceDiff
    // Within same importance, sort by line count (descending)
    return b.lineCount - a.lineCount
  })

  return validCharacters
}

/**
 * Build canonical character list using story bible as the source of truth.
 * Falls back to extracted characters if the bible is empty.
 */
function buildCanonicalCharactersFromStoryBible(
  storyBible: any,
  extracted: CharacterInfo[],
  breakdown: ScriptBreakdownData
): CharacterInfo[] {
  const canonChars = Array.isArray(storyBible?.characters) ? storyBible.characters : []
  if (!canonChars.length && extracted.length) {
    return dedupeCharacterInfo(extracted)
  }

  const extractedByNorm = new Map<string, CharacterInfo>()
  extracted.forEach(c => extractedByNorm.set(normalizeCharacterName(c.name).toLowerCase(), c))

  const merged: CharacterInfo[] = []

  for (const char of canonChars) {
    const name = char.name || char.characterName
    if (!name) continue
    const norm = normalizeCharacterName(name).toLowerCase()
    const extractedMatch = extractedByNorm.get(norm)

    // Pull scenes/line counts from breakdown by name
    const breakdownScenes = breakdown?.scenes || []
    const sceneNumbers: number[] = []
    let lineCount = extractedMatch?.lineCount || 0
    breakdownScenes.forEach(scene => {
      scene.characters?.forEach(ch => {
        const chNorm = normalizeCharacterName(ch.name || '').toLowerCase()
        if (chNorm === norm) {
          sceneNumbers.push(scene.sceneNumber)
          lineCount += ch.lineCount || 0
        }
      })
    })

    merged.push({
      name: toTitleCase(name),
      importance: (char.importance || char.role || extractedMatch?.importance || 'supporting') as CharacterInfo['importance'],
      lineCount: lineCount || extractedMatch?.lineCount || 0,
      scenes: sceneNumbers.length ? sceneNumbers : extractedMatch?.scenes || [],
      sceneDescriptions: extractedMatch?.sceneDescriptions || []
    })
  }

  return dedupeCharacterInfo(merged.length ? merged : extracted)
}

function dedupeCharacterInfo(list: CharacterInfo[]): CharacterInfo[] {
  const byNorm = new Map<string, CharacterInfo>()
  for (const c of list) {
    const norm = normalizeCharacterName(c.name).toLowerCase()
    if (!byNorm.has(norm)) {
      byNorm.set(norm, c)
    }
  }
  return Array.from(byNorm.values())
}

/**
 * Extract audition-ready key scenes with dialogue for a character.
 * Uses breakdown to find scenes and script pages to pull actual dialogue text.
 */
export function extractKeyScenesWithDialogue(
  characterName: string,
  script: GeneratedScript,
  breakdown: ScriptBreakdownData,
  maxScenes: number = 3
): Array<{
  sceneNumber: number
  episodeNumber: number
  dialogue: string
  context: string
}> {
  const norm = normalizeCharacterName(characterName).toLowerCase()
  const scenes: Array<{
    sceneNumber: number
    episodeNumber: number
    dialogue: string
    context: string
    lineCount: number
  }> = []

  if (!script || !breakdown?.scenes) return []

  const pages = script.pages || []

  // Build index of script dialogue by sceneNumber
  const sceneDialogueMap = new Map<number, { dialogue: string[]; contextParts: string[] }>()
  for (const page of pages) {
    for (const element of page.elements || []) {
      const sceneNum = element.metadata?.sceneNumber
      if (!sceneNum) continue
      if (!sceneDialogueMap.has(sceneNum)) {
        sceneDialogueMap.set(sceneNum, { dialogue: [], contextParts: [] })
      }
      const bucket = sceneDialogueMap.get(sceneNum)!
      if (element.type === 'character') {
        const charName = (element.content || '').trim().toLowerCase()
        if (charName && normalizeCharacterName(charName).toLowerCase() === norm) {
          // dialogue will be captured on dialogue element; keep marker
          bucket.contextParts.push(`CHARACTER: ${element.content}`)
        }
      } else if (element.type === 'dialogue') {
        const lastContext = bucket.contextParts[bucket.contextParts.length - 1] || ''
        const lastChar = lastContext.replace('CHARACTER:', '').trim()
        if (lastChar && normalizeCharacterName(lastChar).toLowerCase() === norm) {
          const dialogLine = (element.content || '').trim()
          if (dialogLine) {
            bucket.dialogue.push(dialogLine)
          }
        }
      } else if (element.type === 'slug' || element.type === 'action') {
        const val = (element.content || '').trim()
        if (val) {
          bucket.contextParts.push(val)
        }
      }
    }
  }

  // Walk breakdown scenes to identify appearances and assemble context
  for (const scene of breakdown.scenes) {
    const hasChar = scene.characters?.some((c: any) =>
      normalizeCharacterName(c.name || c.characterName || '').toLowerCase() === norm
    )
    if (!hasChar) continue
    const dialogueEntry = sceneDialogueMap.get(scene.sceneNumber)
    const dialogLines = dialogueEntry?.dialogue || []
    const contextParts = dialogueEntry?.contextParts || []
    const context =
      scene.sceneTitle ||
      scene.location ||
      contextParts.filter(Boolean).slice(0, 3).join(' • ') ||
      'Scene context'

    scenes.push({
      sceneNumber: scene.sceneNumber,
      episodeNumber: breakdown.episodeNumber,
      dialogue: dialogLines.join('\n'),
      context,
      lineCount: dialogLines.length
    })
  }

  // Sort by line count (desc) then scene number
  scenes.sort((a, b) => b.lineCount - a.lineCount || a.sceneNumber - b.sceneNumber)

  return scenes.slice(0, maxScenes).map(({ lineCount: _omit, ...rest }) => rest)
}

/**
 * Build system prompt for AI
 */
function buildSystemPrompt(): string {
  return `You are a professional casting director for micro-budget web series production.

Your job is to generate comprehensive casting profiles for all characters in the script, including character archetypes, actor template suggestions, and casting requirements.

**CRITICAL RULES:**

1. **CHARACTER ARCHETYPES**
   - Use industry-standard archetypes based on Campbell's Hero's Journey and character function theory
   - Lead roles: The Hero, The Anti-Hero, The Everyman, The Reluctant Hero
   - Supporting roles: The Mentor, The Ally, The Rival, The Love Interest, The Trickster, The Threshold Guardian
   - Background roles: The Comic Relief, The Authority Figure, The Antagonist, The Herald
   - Assign archetype based on character's function in the story, not just screen time

2. **ACTOR TEMPLATE SUGGESTIONS**
   - Suggest 2-3 real actors per character as reference templates
   - Focus on actors accessible for micro-budget production (indie/emerging actors, not just A-list)
   - Include diverse representation (consider ethnicity, age range, body type)
   - Explain why each actor matches: "Similar energy to [Actor] in [Role]" or "Physical presence reminiscent of [Actor]"
   - Examples: "Tom Holland energy" (not requiring Tom Holland, but that type), "Miles Teller naturalistic style"
   - Consider actors who have performed in similar genres/roles
   - Mix well-known actors (for understanding the type) with lesser-known/emerging actors (for accessibility)

3. **PHYSICAL REQUIREMENTS**
   - Height range: Only if relevant to character (e.g., tall for authority, short for vulnerability)
   - Build: athletic-lean, average, stocky, lean, muscular, etc. - only if relevant
   - Ethnicity: Only if specifically relevant to the character or story
   - Distinctive features: Only if mentioned in script or story (e.g., "expressive eyes", "strong jawline")
   - Be realistic - don't require impossible physical attributes

4. **PERFORMANCE REQUIREMENTS**
   - Acting style: naturalistic, heightened, comedic, dramatic, physical, etc.
   - Emotional range: Specific emotional beats required (e.g., "vulnerability to determination", "comedy to tragedy")
   - Special skills: Only if needed (accent, physical ability, musical talent, stunt work)
   - Match requirements to what the character actually does in the script

5. **AGE RANGE**
   - Determine from story context and character description
   - Consider what age reads correctly for the character (e.g., "reads 25-32 but can play older")
   - Be realistic for micro-budget (consider available talent pool age ranges)

6. **CASTING NOTES**
   - Professional casting notes and recommendations
   - Micro-budget considerations (prefer actors willing to work deferred payment/credit)
   - Note any special considerations (travel constraints, scheduling, special needs)
   - Suggest emerging talent over established stars where appropriate
   - Note if character can bring their own resources (wardrobe, props)

7. **MICRO-BUDGET FOCUS**
   - Prioritize actors who can work for deferred payment/credit
   - Suggest emerging talent over established stars
   - Consider actors who bring their own resources (wardrobe, props)
   - Note travel constraints (prefer local actors)
   - Be realistic about actor availability for micro-budget productions

8. **OUTPUT FORMAT**
   - Valid JSON only
   - No markdown, no code blocks, no explanations
   - Match the exact structure specified
   - Include all characters from the script breakdown`
}

/**
 * Build user prompt with all context
 */
function buildUserPrompt(
  characters: CharacterInfo[],
  breakdown: ScriptBreakdownData,
  storyBible: any,
  episodeTitle: string
): string {
  let prompt = `Generate comprehensive casting profiles for all characters in this ${episodeTitle} episode.\n\n`

  // Story context (CORE DATA)
  prompt += `**STORY CONTEXT:**\n`
  prompt += `Series: ${storyBible?.seriesTitle || storyBible?.title || 'Untitled Series'}\n`
  if (storyBible?.seriesOverview) {
    prompt += `\nSeries Overview (Big Picture): ${storyBible.seriesOverview}\n\n`
  }
  prompt += `Genre: ${storyBible?.genre || 'Drama'}\n`
  if (storyBible?.tone) prompt += `Tone: ${storyBible.tone}\n`
  if (storyBible?.setting) prompt += `Setting: ${storyBible.setting}\n`
  if (storyBible?.worldBuilding?.setting) prompt += `World Setting: ${storyBible.worldBuilding.setting}\n`
  if (storyBible?.logline) prompt += `Series Logline: ${storyBible.logline}\n`
  prompt += `\n`
  
  // Add technical tabs for better casting context
  if (storyBible?.dialogueStrategy) {
    prompt += `**DIALOGUE STYLE (for character voices):**\n`
    const dialogue = storyBible.dialogueStrategy
    if (dialogue.rawContent) {
      prompt += `${dialogue.rawContent.substring(0, 300)}\n\n`
    } else {
      if (dialogue.characterVoice) prompt += `Character Voice: ${dialogue.characterVoice}\n`
      if (dialogue.speechPatterns) prompt += `Speech Patterns: ${dialogue.speechPatterns}\n\n`
    }
  }
  
  if (storyBible?.genreEnhancement) {
    prompt += `**GENRE STYLE (for casting aesthetic):**\n`
    const genre = storyBible.genreEnhancement
    if (genre.rawContent) {
      prompt += `${genre.rawContent.substring(0, 250)}\n\n`
    } else if (genre.visualStyle) {
      prompt += `Visual Style: ${genre.visualStyle}\n\n`
    }
  }

  // Episode context
  prompt += `**EPISODE:** ${episodeTitle}\n`
  prompt += `Production Model: Micro-budget web series ($1k-$20k total series budget)\n`
  prompt += `Casting Budget: Prefer actors willing to work for deferred payment/credit\n`
  prompt += `Target: Emerging talent, indie actors, local talent pool\n\n`

  // Character information
  prompt += `**CHARACTERS TO CAST:**\n\n`
  
  for (const char of characters) {
    prompt += `Character: ${char.name}\n`
    prompt += `  Importance: ${char.importance}\n`
    prompt += `  Line Count: ${char.lineCount} lines\n`
    prompt += `  Scenes: ${char.scenes.sort((a, b) => a - b).join(', ')} (appears in ${char.scenes.length} scene${char.scenes.length !== 1 ? 's' : ''})\n`
    prompt += `  Scene Context:\n`
    char.sceneDescriptions.forEach(desc => {
      prompt += `    - ${desc}\n`
    })
    prompt += `\n`
  }

  // Get character descriptions from story bible if available
  // Match characters by name (normalized) for better matching
  if (storyBible?.characters && Array.isArray(storyBible.characters)) {
    prompt += `**CHARACTER DESCRIPTIONS (from Story Bible):**\n`
    for (const char of characters) {
      // Try to find matching character in story bible
      const charDesc = storyBible.characters.find((sbChar: any) => {
        const sbName = normalizeCharacterName(sbChar.name || sbChar.characterName || '')
        const charName = normalizeCharacterName(char.name)
        
        // Match if names are similar or one contains the other
        return sbName.toLowerCase() === charName.toLowerCase() ||
               sbName.toLowerCase().includes(charName.toLowerCase()) ||
               charName.toLowerCase().includes(sbName.toLowerCase())
      })
      
      if (charDesc) {
        const desc = charDesc.description || charDesc.role || charDesc.arc || charDesc.persona || ''
        if (desc) {
          prompt += `${char.name}: ${desc}\n`
          if (charDesc.age || charDesc.ageRange) {
            prompt += `  Age: ${charDesc.age || charDesc.ageRange}\n`
          }
          if (charDesc.gender) {
            prompt += `  Gender: ${charDesc.gender}\n`
          }
          if (charDesc.background) {
            prompt += `  Backstory: ${charDesc.background}\n`
          }
          if (Array.isArray(charDesc.relationships) && charDesc.relationships.length > 0) {
            prompt += `  Relationships: ${JSON.stringify(charDesc.relationships)}\n`
          }
          if (charDesc.arc || charDesc.emotionalJourney) {
            prompt += `  CharacterArc: ${charDesc.arc || charDesc.emotionalJourney}\n`
          }
        }
      }
    }
    prompt += `\n`
  }

  // Output format
  prompt += `**TASK:**\n`
  prompt += `For EACH character above, generate a comprehensive casting profile with audition-ready materials.\n\n`

  prompt += `For each character, provide:\n`
  prompt += `- characterName: Exact character name\n`
  prompt += `- archetype: Character archetype (e.g., "The Hero", "The Mentor", "The Trickster")\n`
  prompt += `- ageRange: { min: number, max: number } - realistic age range for the character\n`
  prompt += `- physicalRequirements: {\n`
  prompt += `    height: Optional height range string (e.g., "5'8\"-6'2\"") if relevant\n`
  prompt += `    build: Optional build description (e.g., "athletic-lean", "average") if relevant\n`
  prompt += `    ethnicity: Optional ethnicity if specifically relevant to character\n`
  prompt += `    distinctiveFeatures: Optional distinctive features (e.g., "strong jawline, expressive eyes") if relevant\n`
  prompt += `  }\n`
  prompt += `- performanceRequirements: {\n`
  prompt += `    actingStyle: Acting style description (e.g., "naturalistic, grounded", "heightened, comedic")\n`
  prompt += `    emotionalRange: Emotional range required (e.g., "vulnerability to determination")\n`
  prompt += `    specialSkills: Array of special skills needed if any (e.g., ["action sequences", "emotional depth", "accent"])\n`
  prompt += `  }\n`
  prompt += `- actorTemplates: Array of 2-3 objects, each with:\n`
  prompt += `    - name: Real actor name as reference\n`
  prompt += `    - whyMatch: Explanation of why this actor matches (e.g., "Similar youthful energy and vulnerability, proven in action-heavy roles")\n`
  prompt += `- castingNotes: Professional casting notes and recommendations\n`
  prompt += `- characterArc: { keyBeats: string[], emotionalJourney: string }\n`
  prompt += `- keyScenes: Array (2-3) of { sceneNumber, episodeNumber, dialogue, context } // dialogue as multi-line string for auditions\n`
  prompt += `- relationships: Array of { characterName, relationshipType, chemistryRequired }\n`
  prompt += `- backstory: Concise backstory from story bible\n`
  prompt += `- screenTimeMetrics: { totalScenes, totalLines, estimatedMinutes }\n`
  prompt += `- objectives: { superObjective, sceneObjectives: string[] }\n`
  prompt += `- voiceRequirements: { style, accent, vocalQuality }\n`
  prompt += `- castingPriority: { level: "critical" | "high" | "medium", deadline?: string }\n`
  prompt += `- priority: "lead" | "supporting" | "extra" (based on character importance)\n`
  prompt += `- scenes: Array of scene numbers where character appears\n\n`

  prompt += `**OUTPUT FORMAT:**\n\n`
  prompt += `Provide ONLY valid JSON with this structure:\n\n`
  prompt += `{\n`
  prompt += `  "cast": [\n`
  prompt += `    {\n`
  prompt += `      "characterName": "Alex",\n`
  prompt += `      "archetype": "The Hero",\n`
  prompt += `      "ageRange": { "min": 25, "max": 32 },\n`
  prompt += `      "physicalRequirements": {\n`
  prompt += `        "height": "5'8\"-6'2\"",\n`
  prompt += `        "build": "athletic-lean",\n`
  prompt += `        "distinctiveFeatures": "strong jawline, expressive eyes"\n`
  prompt += `      },\n`
  prompt += `      "performanceRequirements": {\n`
  prompt += `        "actingStyle": "naturalistic, grounded",\n`
  prompt += `        "emotionalRange": "vulnerability to determination",\n`
  prompt += `        "specialSkills": ["action sequences", "emotional depth"]\n`
  prompt += `      },\n`
  prompt += `      "actorTemplates": [\n`
  prompt += `        {\n`
  prompt += `          "name": "Tom Holland",\n`
  prompt += `          "whyMatch": "Similar youthful energy and vulnerability, proven in action-heavy roles with emotional depth"\n`
  prompt += `        },\n`
  prompt += `        {\n`
  prompt += `          "name": "Miles Teller",\n`
  prompt += `          "whyMatch": "Naturalistic performance style, strong in character-driven drama with physical elements"\n`
  prompt += `        }\n`
  prompt += `      ],\n`
  prompt += `      "characterArc": {\n`
  prompt += `        "keyBeats": ["Inciting guilt in Ep1", "Moral pivot in Ep3"],\n`
  prompt += `        "emotionalJourney": "From ambition to accountability"\n`
  prompt += `      },\n`
  prompt += `      "keyScenes": [\n`
  prompt += `        {\n`
  prompt += `          "sceneNumber": 12,\n`
  prompt += `          "episodeNumber": 1,\n`
  prompt += `          "dialogue": "ALEX: I can't keep lying to them...\\nALEX: This ends tonight.",\n`
  prompt += `          "context": "Confession on the office rooftop at night"\n`
  prompt += `        }\n`
  prompt += `      ],\n`
  prompt += `      "relationships": [\n`
  prompt += `        { "characterName": "Jordan", "relationshipType": "mentor/mentee", "chemistryRequired": true }\n`
  prompt += `      ],\n`
  prompt += `      "backstory": "Former prodigy who burned out after a failed startup...",\n`
  prompt += `      "screenTimeMetrics": { "totalScenes": 8, "totalLines": 42, "estimatedMinutes": 11 },\n`
  prompt += `      "objectives": { "superObjective": "Redeem the company", "sceneObjectives": ["Win investor trust", "Protect team"] },\n`
  prompt += `      "voiceRequirements": { "style": "grounded, dry wit", "accent": "neutral US", "vocalQuality": "warm baritone" },\n`
  prompt += `      "castingPriority": { "level": "critical", "deadline": "2025-02-01" },\n`
  prompt += `      "castingNotes": "Looking for an actor who can balance vulnerability with physicality. Should read early-to-mid 20s but play slightly older. Prefer actors with indie film experience who can work on micro-budget timeline.",\n`
  prompt += `      "priority": "lead",\n`
  prompt += `      "scenes": [1, 2, 3, 5]\n`
  prompt += `    }\n`
  prompt += `  ]\n`
  prompt += `}\n\n`

  prompt += `**CRITICAL REMINDERS:**\n`
  prompt += `- Output ONLY valid JSON (no markdown, no code blocks, no explanation)\n`
  prompt += `- Include ALL characters from the character list above\n`
  prompt += `- Generate 2-3 actor templates per character\n`
  prompt += `- Focus on actors accessible for micro-budget production\n`
  prompt += `- Be realistic about physical requirements (only include if relevant)\n`
  prompt += `- Consider diverse representation in actor template suggestions\n`
  prompt += `- Match archetype to character's story function, not just screen time`

  return prompt
}

/**
 * Parse AI response into structured casting data
 */
function parseCastingProfiles(
  aiResponse: string,
  characterInfo: CharacterInfo[],
  episodeNumber: number,
  episodeTitle: string
): CastingData {
  try {
    // Clean AI output (remove markdown code blocks if present)
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
    
    // Find JSON boundaries (first { to last })
    const firstBrace = cleaned.indexOf('{')
    const lastBrace = cleaned.lastIndexOf('}')
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1)
    }
    
    // Clean up common JSON issues
    cleaned = cleaned
      .replace(/,\s*}/g, '}') // Remove trailing commas before }
      .replace(/,\s*]/g, ']') // Remove trailing commas before ]
      .replace(/\/\/.*$/gm, '') // Remove comments
      .trim()

    // Try to parse JSON
    let parsed: any
    try {
      parsed = JSON.parse(cleaned)
    } catch (parseError) {
      // If parsing fails, try to recover from truncated JSON
      console.warn('⚠️ Initial JSON parse failed, attempting recovery...', parseError)
      
      // Try to fix incomplete JSON by closing open structures
      let fixed = cleaned
      
      // Count open/close braces and brackets to see if we need to close them
      const openBraces = (fixed.match(/{/g) || []).length
      const closeBraces = (fixed.match(/}/g) || []).length
      const openBrackets = (fixed.match(/\[/g) || []).length
      const closeBrackets = (fixed.match(/\]/g) || []).length
      
      // If we have unclosed structures, try to close them
      if (openBraces > closeBraces) {
        // Remove incomplete last property if it exists
        const lastComma = fixed.lastIndexOf(',')
        if (lastComma > fixed.lastIndexOf('}')) {
          // Remove incomplete property after last comma
          fixed = fixed.substring(0, lastComma) + '\n'
        }
        // Close remaining braces
        fixed += '\n' + '}'.repeat(openBraces - closeBraces)
      }
      
      if (openBrackets > closeBrackets) {
        fixed += ']'.repeat(openBrackets - closeBrackets)
      }
      
      // Try parsing the fixed version
      try {
        parsed = JSON.parse(fixed)
        console.log('✅ Successfully recovered from truncated JSON')
      } catch (recoveryError) {
        // If recovery fails, try to extract just the cast array with partial parsing
        const castMatch = cleaned.match(/"cast"\s*:\s*\[([\s\S]*)/)
        if (castMatch) {
          try {
            // Try to extract character objects from the cast array (including incomplete ones)
            const castContent = castMatch[1]
            
            // Find all character objects (including those that might be incomplete)
            // Look for opening braces followed by "characterName"
            const validCharacters: any[] = []
            let depth = 0
            let currentObj = ''
            let inString = false
            let escapeNext = false
            
            for (let i = 0; i < castContent.length; i++) {
              const char = castContent[i]
              
              if (escapeNext) {
                currentObj += char
                escapeNext = false
                continue
              }
              
              if (char === '\\') {
                escapeNext = true
                currentObj += char
                continue
              }
              
              if (char === '"' && !escapeNext) {
                inString = !inString
                currentObj += char
                continue
              }
              
              if (inString) {
                currentObj += char
                continue
              }
              
              if (char === '{') {
                if (depth === 0) {
                  currentObj = '{'
                } else {
                  currentObj += char
                }
                depth++
              } else if (char === '}') {
                currentObj += char
                depth--
                if (depth === 0) {
                  // Try to parse this complete object
                  try {
                    const charObj = JSON.parse(currentObj)
                    if (charObj.characterName) {
                      validCharacters.push(charObj)
                    }
                  } catch {
                    // Try to fix common issues and parse again
                    try {
                      let fixedObj = currentObj
                        .replace(/,\s*}/g, '}')
                        .replace(/,\s*]/g, ']')
                        .replace(/,\s*$/gm, '')
                      
                      // If it doesn't end with }, try to close it
                      if (!fixedObj.trim().endsWith('}')) {
                        fixedObj += '}'
                      }
                      
                      const charObj = JSON.parse(fixedObj)
                      if (charObj.characterName) {
                        validCharacters.push(charObj)
                      }
                    } catch {
                      // Skip this character object
                    }
                  }
                  currentObj = ''
                }
              } else {
                currentObj += char
              }
            }
            
            // Try to parse the last incomplete object if it has characterName
            if (currentObj.trim() && currentObj.includes('"characterName"')) {
              try {
                let fixedObj = currentObj
                  .replace(/,\s*$/gm, '')
                  .replace(/,\s*}/g, '}')
                
                // Close any open structures
                const openCount = (fixedObj.match(/{/g) || []).length
                const closeCount = (fixedObj.match(/}/g) || []).length
                fixedObj += '}'.repeat(Math.max(0, openCount - closeCount))
                
                const charObj = JSON.parse(fixedObj)
                if (charObj.characterName) {
                  validCharacters.push(charObj)
                }
              } catch {
                // Skip incomplete object
              }
            }
            
            if (validCharacters.length > 0) {
              parsed = { cast: validCharacters }
              console.log(`⚠️ Recovered ${validCharacters.length} characters from truncated response`)
            } else {
              throw new Error(`Failed to parse JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}. Response may be truncated.`)
            }
          } catch (extractError) {
            throw new Error(`Failed to parse JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}. Response may be truncated.`)
          }
        } else {
          throw new Error(`Failed to parse JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}. Response may be truncated.`)
        }
      }
    }

    if (!parsed.cast || !Array.isArray(parsed.cast)) {
      throw new Error('Invalid AI response structure: missing cast array')
    }

    // Convert to CastMember objects
    const cast: CastMember[] = parsed.cast.map((char: any, idx: number) => {
      // Find matching character info
      const charInfo = characterInfo.find(c => 
        c.name.toLowerCase() === (char.characterName || '').toLowerCase()
      ) || characterInfo[idx]

      const characterName = toTitleCase(char.characterName || charInfo.name)
      
      const profile: CharacterCastingProfile = {
        characterName,
        archetype: char.archetype || 'The Character',
        ageRange: char.ageRange || { min: 25, max: 35 },
        physicalRequirements: {
          height: char.physicalRequirements?.height || undefined,
          build: char.physicalRequirements?.build || undefined,
          ethnicity: char.physicalRequirements?.ethnicity || undefined,
          distinctiveFeatures: char.physicalRequirements?.distinctiveFeatures || undefined
        },
        performanceRequirements: {
          actingStyle: char.performanceRequirements?.actingStyle || 'naturalistic',
          emotionalRange: char.performanceRequirements?.emotionalRange || 'standard dramatic range',
          specialSkills: Array.isArray(char.performanceRequirements?.specialSkills) && char.performanceRequirements.specialSkills.length > 0
            ? char.performanceRequirements.specialSkills 
            : []
        },
        actorTemplates: Array.isArray(char.actorTemplates) && char.actorTemplates.length > 0
          ? char.actorTemplates.map((template: any) => ({
              name: template.name || 'Unknown Actor',
              whyMatch: template.whyMatch || 'Matches character type'
            }))
          : [],
        castingNotes: char.castingNotes && char.castingNotes.trim() ? char.castingNotes : '',
        priority: char.priority || charInfo.importance,
        scenes: Array.isArray(char.scenes) ? char.scenes : charInfo.scenes,
        characterArc: char.characterArc || undefined,
        keyScenes: Array.isArray(char.keyScenes) ? char.keyScenes : undefined,
        relationships: Array.isArray(char.relationships) ? char.relationships : undefined,
        backstory: char.backstory || undefined,
        screenTimeMetrics: char.screenTimeMetrics || undefined,
        objectives: char.objectives || undefined,
        voiceRequirements: char.voiceRequirements || undefined,
        castingPriority: char.castingPriority || undefined
      }

      return {
        id: `cast_${Date.now()}_${idx}`,
        characterName,
        actorName: undefined, // No actor assigned yet
        role: profile.priority,
        scenes: profile.scenes,
        totalShootDays: new Set(profile.scenes).size, // Unique scene count
        payment: 'deferred', // Default for micro-budget
        paymentAmount: 0,
        payRate: 0,
        availability: [],
        specialNeeds: [],
        rehersalNotes: '',
        actorNotes: '',
        status: 'casting',
        confirmed: false,
        comments: [],
        characterProfile: profile
      }
    }).filter(Boolean)

    // De-dupe by normalized name (story bible = canon)
    const dedupedCastMap = new Map<string, CastMember>()
    cast.forEach(member => {
      const norm = normalizeCharacterName(member.characterName).toLowerCase()
      if (!dedupedCastMap.has(norm)) {
        dedupedCastMap.set(norm, member)
      }
    })
    const dedupedCast = Array.from(dedupedCastMap.values())

    // Calculate totals
    const totalCharacters = dedupedCast.length
    const confirmedCast = dedupedCast.filter(m => m.confirmed).length

    return {
      episodeNumber,
      episodeTitle,
      totalCharacters,
      confirmedCast,
      cast: dedupedCast,
      lastUpdated: Date.now(),
      updatedBy: 'ai-generator'
    }
  } catch (error) {
    console.error('❌ Error parsing AI response:', error)
    console.error('Response:', aiResponse.substring(0, 500))
    throw new Error(`Failed to parse casting profiles: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

