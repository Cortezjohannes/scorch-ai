/**
 * Actor Materials Generator - Enhanced Version
 * Generates comprehensive actor preparation materials with real-time progress updates
 * 
 * Strategy: 3 AI calls per character (scales with number of characters in arc)
 * - Call 1: Core materials (study guide, scene analysis, emotional journey)
 * - Call 2: Deep relationships & dynamics (comprehensive relationship map)
 * - Call 3: Practice & performance materials (monologues, references, prep)
 */

import { generateContent } from '@/services/azure-openai'
import { cleanAndParseJSON } from '@/lib/json-utils'
import type { 
  ActorPreparationMaterials, 
  CharacterMaterials,
  ActingTechnique 
} from '@/types/actor-materials'

interface GenerateActorMaterialsParams {
  storyBible: any
  storyBibleId: string
  userId: string
  arcIndex: number
  episodeNumbers: number[]
  technique?: ActingTechnique
  episodeData: any
  episodePreProdData: any
  onProgress?: (update: ProgressUpdate) => void
}

export interface ProgressUpdate {
  type: 'character' | 'phase' | 'complete'
  characterName?: string
  characterIndex?: number
  totalCharacters?: number
  phase?: string
  message: string
  percentage: number
}

/**
 * Main function to generate all actor materials for an arc
 */
export async function generateActorMaterials(
  params: GenerateActorMaterialsParams
): Promise<ActorPreparationMaterials> {
  const {
    storyBible,
    storyBibleId,
    userId,
    arcIndex,
    episodeNumbers,
    technique,
    episodeData,
    episodePreProdData,
    onProgress
  } = params

  console.log('🎭 Starting enhanced actor materials generation')
  console.log(`  Arc: ${arcIndex}, Episodes: ${episodeNumbers.join(', ')}`)

  // Get arc info
  const arc = storyBible.narrativeArcs?.[arcIndex]
  if (!arc) {
    throw new Error(`Arc ${arcIndex} not found in story bible`)
  }

  // Get main characters for this arc
  const characters = getMainCharacters(storyBible, arc, episodeData, episodeNumbers)
  console.log(`  Characters: ${characters.length}`)

  // Generate materials for each character (3 AI calls per character)
  const characterMaterials: CharacterMaterials[] = []
  
  for (let i = 0; i < characters.length; i++) {
    const character = characters[i]
    const charPercentageStart = (i / characters.length) * 100
    const charPercentageEnd = ((i + 1) / characters.length) * 100
    
    console.log(`\n📝 Generating materials for ${character.name} (${i + 1}/${characters.length})`)
    
    onProgress?.({
      type: 'character',
      characterName: character.name,
      characterIndex: i,
      totalCharacters: characters.length,
      message: `Starting ${character.name}`,
      percentage: charPercentageStart
    })
    
    try {
      const materials = await generateCharacterMaterials(
        character,
        storyBible,
        arc,
        episodeData,
        episodePreProdData,
        episodeNumbers,
        technique,
        (phase: string) => {
          // Map phase to readable name
          let phaseName = phase
          if (phase === 'Generating study guide & scene analysis' || phase.includes('core')) {
            phaseName = 'Generating study guide & scene analysis'
          } else if (phase === 'Analyzing character relationships' || phase.includes('relationship')) {
            phaseName = 'Analyzing character relationships'
          } else if (phase === 'Creating practice materials' || phase.includes('practice')) {
            phaseName = 'Creating practice materials'
          }
          
          // Calculate accurate percentage: each phase is 1/3 of character progress
          const phaseInChar = phase.includes('core') || phase.includes('study') ? 0.33 :
                             phase.includes('relationship') ? 0.66 : 1.0
          const phaseProgress = charPercentageStart + ((charPercentageEnd - charPercentageStart) * phaseInChar)
          
          onProgress?.({
            type: 'phase',
            characterName: character.name,
            characterIndex: i,
            totalCharacters: characters.length,
            phase: phaseName,
            message: `${character.name}: ${phaseName}`,
            percentage: Math.min(phaseProgress, charPercentageEnd - 1) // Don't hit 100% until complete
          })
        }
      )
      characterMaterials.push(materials)
      console.log(`✅ Completed ${character.name}`)
      
      onProgress?.({
        type: 'character',
        characterName: character.name,
        characterIndex: i,
        totalCharacters: characters.length,
        message: `Completed ${character.name}`,
        percentage: charPercentageEnd
      })
    } catch (error) {
      console.error(`❌ Error generating materials for ${character.name}:`, error)
      // Continue with other characters
    }
  }
  
  // Compile final materials
  const materials: ActorPreparationMaterials = {
    id: `actor-materials-${storyBibleId}-arc${arcIndex}-${Date.now()}`,
    userId,
    storyBibleId,
    arcIndex,
    arcTitle: arc.title || `Arc ${arcIndex + 1}`,
    characters: characterMaterials,
    technique,
    generatedAt: Date.now(),
    lastUpdated: Date.now(),
    accessList: [userId]
  }
  
  console.log('\n✅ Actor materials generation complete')
  console.log(`  Total characters: ${characterMaterials.length}`)
  console.log(`  Total AI calls: ${characterMaterials.length * 3}`)

  onProgress?.({
    type: 'complete',
    message: 'Generation complete',
    percentage: 100
  })

  return materials
}

/**
 * Get main characters for the arc
 */
function getMainCharacters(
  storyBible: any,
  arc: any,
  episodeData: any,
  episodeNumbers: number[]
): Array<{ id: string; name: string; description: string }> {
  const characters: Array<{ id: string; name: string; description: string }> = []
  const seen = new Set<string>()

  // Get characters from story bible
  if (storyBible.mainCharacters) {
    for (const char of storyBible.mainCharacters) {
      if (!seen.has(char.name)) {
        characters.push({
          id: char.id || char.name.toLowerCase().replace(/\s+/g, '-'),
          name: char.name,
          description: char.description || char.background || ''
        })
        seen.add(char.name)
      }
    }
  }

  // Get additional characters from arc episodes
  for (const episodeNum of episodeNumbers) {
    const episode = episodeData[episodeNum]
    if (episode?.characters) {
      for (const char of episode.characters) {
        if (!seen.has(char.name) && char.importance !== 'minor') {
          characters.push({
            id: char.name.toLowerCase().replace(/\s+/g, '-'),
            name: char.name,
            description: char.description || ''
          })
          seen.add(char.name)
        }
      }
    }
  }

  // Return all main characters
  return characters
}

/**
 * Generate all materials for a single character (3 AI calls)
 */
async function generateCharacterMaterials(
  character: { id: string; name: string; description: string },
  storyBible: any,
  arc: any,
  episodeData: any,
  episodePreProdData: any,
  episodeNumbers: number[],
  technique?: ActingTechnique,
  onPhaseUpdate?: (phase: string) => void
): Promise<CharacterMaterials> {
  
  // Gather context about the character across all episodes
  const context = gatherCharacterContext(
    character,
    storyBible,
    arc,
    episodeData,
    episodePreProdData,
    episodeNumbers
  )

  // CALL 1: Generate core materials
  console.log(`  [1/3] Generating core materials...`)
  onPhaseUpdate?.('Generating study guide & scene analysis')
  const coreMaterials = await generateCoreMaterials(character, context, storyBible, technique)
  onPhaseUpdate?.('core') // Signal phase 1 complete

  // CALL 2: Generate deep relationship analysis
  console.log(`  [2/3] Generating relationship dynamics...`)
  onPhaseUpdate?.('Analyzing character relationships')
  const relationshipMaterials = await generateRelationshipMaterials(character, context, storyBible, coreMaterials)
  onPhaseUpdate?.('relationships') // Signal phase 2 complete

  // CALL 3: Generate practice materials
  console.log(`  [3/3] Generating practice materials...`)
  onPhaseUpdate?.('Creating practice materials')
  const practiceMaterials = await generatePracticeMaterials(character, context, storyBible, technique)
  onPhaseUpdate?.('practice') // Signal phase 3 complete

  // Combine all materials
  return {
    characterName: character.name,
    characterId: character.id,
    
    // From core materials (call 1)
    studyGuide: coreMaterials.studyGuide,
    throughLine: coreMaterials.throughLine,
    gotAnalysis: coreMaterials.gotAnalysis,
    sceneBreakdowns: coreMaterials.sceneBreakdowns,
    emotionalBeats: coreMaterials.emotionalBeats,
    physicalWork: coreMaterials.physicalWork,
    voicePatterns: coreMaterials.voicePatterns,
    
    // From relationship materials (call 2) - ENHANCED
    relationshipMap: relationshipMaterials.relationshipMap,
    
    // From practice materials (call 3)
    performanceReference: practiceMaterials.performanceReference,
    monologues: practiceMaterials.monologues,
    keyScenes: practiceMaterials.keyScenes,
    onSetPrep: practiceMaterials.onSetPrep,
    researchSuggestions: practiceMaterials.researchSuggestions,
    wardrobeNotes: practiceMaterials.wardrobeNotes,
    memorizationAids: practiceMaterials.memorizationAids,
    
    // Technique-specific
    techniqueFocus: technique,
    techniqueExercises: practiceMaterials.techniqueExercises
  }
}

/**
 * Gather all context about a character from episodes
 */
function gatherCharacterContext(
  character: { id: string; name: string; description: string },
  storyBible: any,
  arc: any,
  episodeData: any,
  episodePreProdData: any,
  episodeNumbers: number[]
) {
  const scenes: any[] = []
  const relationships: any[] = []
  const dialogue: string[] = []
  const otherCharacters = new Set<string>()
  
  // Get deep character data from story bible
  let characterDeepData: any = null
  if (storyBible.mainCharacters) {
    characterDeepData = storyBible.mainCharacters.find((c: any) => 
      c.name.toLowerCase() === character.name.toLowerCase()
    )
  }

  for (const episodeNum of episodeNumbers) {
    const episode = episodeData[episodeNum]
    const preProd = episodePreProdData[episodeNum]

    if (episode?.scenes) {
      for (const scene of episode.scenes) {
        const sceneText = scene.content || scene.screenplay || ''
        if (sceneText.toUpperCase().includes(character.name.toUpperCase())) {
          scenes.push({
            episodeNumber: episodeNum,
            sceneNumber: scene.sceneNumber,
            content: sceneText,
            heading: scene.heading || '',
            location: scene.location || '',
            time: scene.timeOfDay || ''
          })

          // Extract dialogue lines
          const lines = extractCharacterLines(sceneText, character.name)
          dialogue.push(...lines)

          // Find other characters in scene
          const charNames = extractAllCharacterNames(sceneText)
          charNames.forEach(name => {
            if (name !== character.name) {
              otherCharacters.add(name)
            }
          })
        }
      }
    }

    // Get character relationships
    if (episode?.characters) {
      const charData = episode.characters.find((c: any) => 
        c.name.toLowerCase() === character.name.toLowerCase()
      )
      if (charData?.relationships) {
        relationships.push(...charData.relationships)
      }
    }
  }

  return {
    character,
    characterDeepData, // Include deep character data
    storyBible,
    arc,
    scenes,
    relationships,
    dialogue: dialogue.slice(0, 30),
    otherCharacters: Array.from(otherCharacters),
    episodeNumbers,
    genre: storyBible.genre || 'Drama',
    themes: storyBible.themes || [],
    seriesOverview: storyBible.seriesOverview || '',
    worldSetting: storyBible.worldBuilding?.setting || ''
  }
}

/**
 * Extract all character names from a scene (in screenplay format)
 */
function extractAllCharacterNames(sceneText: string): string[] {
  const names = new Set<string>()
  const lines = sceneText.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    // Character names in screenplay are ALL CAPS on their own line
    if (trimmed && trimmed === trimmed.toUpperCase() && trimmed.length > 2 && trimmed.length < 30) {
      // Filter out common scene headings
      if (!trimmed.startsWith('INT.') && !trimmed.startsWith('EXT.') && !trimmed.startsWith('FADE')) {
        // Remove parentheticals like (CONT'D)
        const cleanName = trimmed.replace(/\(.*?\)/g, '').trim()
        if (cleanName) {
          names.add(cleanName)
        }
      }
    }
  }

  return Array.from(names)
}

/**
 * Extract dialogue lines for a specific character from a scene
 */
function extractCharacterLines(sceneText: string, characterName: string): string[] {
  const lines: string[] = []
  const upperName = characterName.toUpperCase()
  const sceneLines = sceneText.split('\n')

  for (let i = 0; i < sceneLines.length; i++) {
    const line = sceneLines[i].trim()
    if (line === upperName || line.startsWith(upperName + ' ') || line.startsWith(upperName + ':')) {
      let j = i + 1
      while (j < sceneLines.length) {
        const dialogueLine = sceneLines[j].trim()
        if (!dialogueLine) {
          j++
          continue
        }
        if (dialogueLine === dialogueLine.toUpperCase() && dialogueLine.length > 2) {
          break
        }
        if (dialogueLine.startsWith('(') && dialogueLine.endsWith(')')) {
          j++
          continue
        }
        lines.push(dialogueLine)
        j++
        if (lines.length >= 40) break
      }
    }
  }

  return lines
}

/**
 * AI CALL 1: Generate core materials for a character
 */
async function generateCoreMaterials(
  character: any,
  context: any,
  storyBible: any,
  technique?: ActingTechnique
) {
  const systemPrompt = `You are an expert acting coach and script analyst. Generate comprehensive, professional actor preparation materials. Include playable actions, moment-to-moment beats, and psychological depth.

CRITICAL JSON FORMATTING REQUIREMENTS:
- Return ONLY valid JSON, no markdown code blocks, no explanations
- Every array element MUST be separated by commas: ["item1", "item2", "item3"]
- Every object property MUST be separated by commas: {"key1": "value1", "key2": "value2"}
- No trailing commas before closing brackets or braces
- All strings must be properly quoted with double quotes
- All special characters in strings must be escaped (\\n, \\t, \\", etc.)
- Ensure proper nesting - every opening { must have a closing }, every [ must have a ]
- Validate your JSON before returning it`

  const userPrompt = `Generate enhanced core actor preparation materials for "${context.character.name}" in a ${context.genre} series.

STORY CONTEXT:
Title: ${storyBible.title}
${storyBible.seriesOverview ? `Series Overview: ${storyBible.seriesOverview}\n` : ''}
Genre: ${context.genre}
Logline: ${storyBible.logline || 'Not provided'}
${storyBible.worldBuilding?.setting ? `World Setting: ${storyBible.worldBuilding.setting}\n` : ''}
Character Description: ${context.character.description}

SCENES: ${context.scenes.length} scenes across episodes ${context.episodeNumbers.join(', ')}

Sample scenes:
${context.scenes.slice(0, 5).map((s: any) => `
Episode ${s.episodeNumber}, Scene ${s.sceneNumber}:
${s.heading}
${s.content.substring(0, 400)}...
`).join('\n')}

DEEP CHARACTER DATA (CRITICAL):
${context.characterDeepData ? `
Physiology: ${JSON.stringify(context.characterDeepData.physiology || {}).substring(0, 300)}
Sociology: ${JSON.stringify(context.characterDeepData.sociology || {}).substring(0, 300)}
Psychology: ${JSON.stringify(context.characterDeepData.psychology || {}).substring(0, 300)}
` : 'Deep character data not available - infer from scenes'}

DIALOGUE SAMPLES:
${context.dialogue.slice(0, 15).join('\n')}

${technique ? `ACTING TECHNIQUE: ${technique} - Include technique-specific insights.` : ''}

Generate comprehensive materials in JSON format:

{
  "studyGuide": {
    "background": "Detailed 3-4 sentence background",
    "motivations": ["primary want", "secondary want", "hidden desire"],
    "relationships": [
      {"characterName": "other character", "relationship": "detailed 2-sentence description"}
    ],
    "characterArc": "3 sentences about transformation",
    "internalConflicts": ["conflict 1 (2 sentences)", "conflict 2", "conflict 3"],
    "psychologicalProfile": {
      "coreNeed": "What they fundamentally need (Maslow's hierarchy)",
      "greatestFear": "What terrifies them most",
      "defenseMechanisms": ["mechanism 1", "mechanism 2"],
      "emotionalWounds": ["past trauma 1", "past trauma 2"]
    }
  },
  "throughLine": {
    "superObjective": "Character's ultimate goal (specific, playable)",
    "explanation": "3 sentences explaining super-objective and why it matters",
    "keyScenes": [scene numbers],
    "wantsVsNeeds": {
      "wants": "What they think they want",
      "needs": "What they actually need",
      "conflict": "Why these are at odds"
    }
  },
  "gotAnalysis": [
    {
      "sceneNumber": 1,
      "episodeNumber": 1,
      "goal": "Specific, playable goal (I want to...)",
      "obstacle": "Concrete obstacle blocking goal",
      "tactics": ["PLAYABLE verb 1 (to intimidate, to seduce, to comfort)", "verb 2", "verb 3"],
      "expectation": "What character expects to happen",
      "techniqueNotes": "Technique-specific notes",
      "playableActions": ["specific physical/verbal action 1", "action 2"],
      "momentBeats": ["beat 1: what changes", "beat 2: shift", "beat 3: revelation"]
    }
    // 8-12 key scenes with deep analysis
  ],
  "sceneBreakdowns": [
    {
      "sceneNumber": 1,
      "episodeNumber": 1,
      "objective": "Specific scene objective",
      "emotionalState": "emotion at scene start",
      "tactics": ["playable tactic 1", "tactic 2", "tactic 3"],
      "keyLines": ["actual line", "another line"],
      "subtext": "What's really happening beneath surface",
      "techniqueNotes": "Technique notes",
      "innerMonologue": "What character is thinking but not saying",
      "sensoryWork": {
        "see": "What they notice visually",
        "hear": "What sounds affect them",
        "feel": "Physical sensations",
        "smell": "Any relevant scents"
      },
      "beforeAfter": {
        "before": "Emotional state entering scene",
        "after": "How they've changed by end"
      }
    }
    // 12-18 detailed scene breakdowns
  ],
  "emotionalBeats": [
    {
      "episodeNumber": 1,
      "sceneNumber": 1,
      "emotion": "specific emotion",
      "intensity": 7,
      "description": "What triggers this emotion",
      "physicalManifestation": "How it shows in body"
    }
    // Track full emotional journey (20-30 beats)
  ],
  "physicalWork": {
    "bodyLanguage": ["specific gesture/posture 1", "gesture 2", "etc"],
    "movement": ["how they move in space", "movement pattern 2"],
    "posture": ["default posture", "when stressed", "when confident"],
    "transformationNotes": "Physical changes through arc",
    "psychologicalGestures": ["gesture embodying inner state 1", "gesture 2"],
    "centerOfGravity": "Where character's physical center is (head/heart/gut)",
    "animalWork": "Animal comparison for physicality"
  },
  "voicePatterns": {
    "vocabulary": ["word/phrase 1", "phrase 2", "phrase 3", "phrase 4"],
    "rhythm": "Detailed description of speech rhythm",
    "accent": "Accent details if applicable",
    "keyPhrases": ["actual phrase from dialogue", "another", "another"],
    "verbalTics": ["tic 1", "tic 2"],
    "speechPatterns": {
      "whenNervous": "How speech changes",
      "whenAngry": "How speech changes",
      "whenVulnerable": "How speech changes"
    },
    "breathWork": "Where they breathe from, how it affects speech"
  }
}

Be extremely detailed and specific. All tactics should be PLAYABLE VERBS. Include psychological depth and sensory work.`

  try {
    const response = await generateContent(userPrompt, {
      systemPrompt,
      model: 'gpt-4.1',
      temperature: 0.5, // Lower temperature for more consistent JSON formatting
      maxTokens: 16000 // Increased to handle comprehensive materials without truncation
    })
    
    // Use the robust JSON cleaning utility
    try {
      const parsed = cleanAndParseJSON(response)
      return parsed
    } catch (parseError: any) {
      console.error('❌ JSON parse error in core materials:', parseError.message)
      console.error('Response length:', response.length)
      console.error('Response preview (first 500 chars):', response.substring(0, 500))
      
      // Try to find the error position and show context
      const errorPos = parseError.message.match(/position (\d+)/)?.[1]
      if (errorPos) {
        const pos = parseInt(errorPos)
        const start = Math.max(0, pos - 100)
        const end = Math.min(response.length, pos + 100)
        console.error(`Error context (position ${pos}):`, response.substring(start, end))
      }
      
      return getMinimalCoreMaterials(context)
    }
  } catch (error) {
    console.error('Error generating core materials:', error)
    return getMinimalCoreMaterials(context)
  }
}

/**
 * AI CALL 2: Generate comprehensive relationship materials (ENHANCED)
 */
async function generateRelationshipMaterials(
  character: any,
  context: any,
  storyBible: any,
  coreMaterials: any
) {
  const systemPrompt = `You are an expert in character dynamics and relationship analysis for actors. Create detailed, actionable relationship maps that reveal power dynamics, emotional dependencies, and conflict patterns. Return ONLY valid JSON.`

  const userPrompt = `Generate a COMPREHENSIVE relationship map for "${context.character.name}" with ALL other characters in the story.

CHARACTER: ${context.character.name}
Description: ${context.character.description}

OTHER CHARACTERS IN SCENES: ${context.otherCharacters.join(', ')}

MAIN STORY CHARACTERS:
${storyBible.mainCharacters?.map((c: any) => `- ${c.name}: ${c.description || 'Character in story'}`).join('\n') || 'See above'}

SCENES WITH INTERACTIONS:
${context.scenes.slice(0, 6).map((s: any) => `
Episode ${s.episodeNumber}, Scene ${s.sceneNumber}:
${s.content.substring(0, 300)}...
`).join('\n')}

CONTEXT: ${context.genre} series across ${context.episodeNumbers.length} episodes

Generate an EXTENSIVE relationship map in JSON format:

{
  "relationshipMap": [
    {
      "characterName": "Other Character Name",
      "relationshipType": "ally|enemy|love|family|mentor|rival|neutral|complex",
      "description": "2-3 sentence detailed description of relationship",
      "keyMoments": [
        {
          "episodeNumber": 1,
          "sceneNumber": 1,
          "moment": "Specific interaction that defines relationship",
          "emotionalImpact": "How it affects ${context.character.name}"
        }
        // 3-5 key moments per relationship
      ],
      "evolution": "3-4 sentences about how relationship develops/changes",
      "powerDynamics": {
        "whoHasPower": "Which character has power and why",
        "howPowerShifts": "How power balance changes",
        "statusGame": "High/low status tactics each uses"
      },
      "emotionalDependency": {
        "level": "high|medium|low|none",
        "what${context.character.name}Needs": "What they need from this person",
        "whatOtherNeeds": "What other character needs from them"
      },
      "conflictPatterns": {
        "sourceOfConflict": "Root cause of friction",
        "howItManifests": "How conflict plays out",
        "triggerPoints": ["trigger 1", "trigger 2"]
      },
      "historyTogether": {
        "pastEvents": "Their shared history (2-3 sentences)",
        "unresolved": "Unresolved issues between them",
        "secrets": "Any secrets one keeps from the other"
      },
      "actorNotes": {
        "playableApproach": "How to play this relationship (specific tactics)",
        "whatToAvoid": "Common pitfalls in playing this dynamic",
        "keyToConnection": "The heart of this relationship"
      },
      "sceneBySceneEvolution": [
        {
          "episode": 1,
          "scene": 1,
          "status": "Relationship status at this point",
          "temperature": "hot|warm|cool|cold",
          "whatChanged": "What shifted in this scene"
        }
        // Track evolution scene-by-scene
      ]
    }
    // Include ALL significant relationships (minimum 5-8 relationships)
  ],
  "relationshipSummary": {
    "primaryAllies": ["name", "name"],
    "primaryConflicts": ["name", "name"],
    "romanticInterests": ["name"],
    "familyConnections": ["name"],
    "mentorFigures": ["name"],
    "complexDynamics": [
      {
        "character": "name",
        "complexity": "Why this relationship is layered/complicated"
      }
    ]
  },
  "socialCircle": {
    "innerCircle": ["closest people"],
    "outerCircle": ["acquaintances"],
    "adversaries": ["opponents"],
    "unknownQuantities": ["mysterious figures"]
  },
  "loyaltyMap": {
    "mostLoyal": "Who they'd never betray",
    "conditional": ["Who they'd betray under circumstances"],
    "wouldBetra": ["Who they'd definitely betray"]
  }
}

Be EXTREMELY detailed. This is the most important material for the actor. Include ALL characters they interact with, even minor ones. Focus on PLAYABLE dynamics an actor can use.`

  try {
    const response = await generateContent(userPrompt, {
      systemPrompt,
      model: 'gpt-4.1',
      temperature: 0.5, // Lower temperature for more consistent JSON formatting
      maxTokens: 16000 // Increased to handle comprehensive materials without truncation
    })
    
    // Use the robust JSON cleaning utility
    try {
      const parsed = cleanAndParseJSON(response)
      return parsed
    } catch (parseError: any) {
      console.error('❌ JSON parse error in relationships:', parseError.message)
      console.error('Response length:', response.length)
      
      const errorPos = parseError.message.match(/position (\d+)/)?.[1]
      if (errorPos) {
        const pos = parseInt(errorPos)
        const start = Math.max(0, pos - 100)
        const end = Math.min(response.length, pos + 100)
        console.error(`Error context (position ${pos}):`, response.substring(start, end))
      }
      
      return { relationshipMap: [] }
    }
  } catch (error) {
    console.error('Error generating relationship materials:', error)
    return { relationshipMap: [] }
  }
}

/**
 * AI CALL 3: Generate practice materials for a character
 */
async function generatePracticeMaterials(
  character: any,
  context: any,
  storyBible: any,
  technique?: ActingTechnique
) {
  const systemPrompt = `You are an expert acting coach specializing in actor preparation and practice techniques. Generate practical, actor-friendly materials for rehearsal and performance.

CRITICAL JSON FORMATTING REQUIREMENTS:
- Return ONLY valid JSON, no markdown code blocks, no explanations
- Every array element MUST be separated by commas: ["item1", "item2", "item3"]
- Every object property MUST be separated by commas: {"key1": "value1", "key2": "value2"}
- No trailing commas before closing brackets or braces
- All strings must be properly quoted with double quotes
- All special characters in strings must be escaped (\\n, \\t, \\", etc.)
- Ensure proper nesting - every opening { must have a closing }, every [ must have a ]
- Validate your JSON before returning it`

  const userPrompt = `Generate comprehensive practice and preparation materials for "${context.character.name}" in a ${context.genre} series.

CHARACTER: ${context.character.name}
Description: ${context.character.description}

DIALOGUE SAMPLES:
${context.dialogue.slice(0, 20).join('\n')}

SCENES: ${context.scenes.length} scenes in episodes ${context.episodeNumbers.join(', ')}

${technique ? `ACTING TECHNIQUE: ${technique} - Include technique-specific exercises.` : ''}

Generate materials in JSON format:

{
  "performanceReference": [
    {
      "characterName": "Similar Character",
      "source": "Show/Movie",
      "reason": "Detailed reason why comparison works (3-4 sentences)",
      "sceneExample": "Specific scene to watch",
      "keySimilarities": ["similarity 1", "similarity 2", "similarity 3"],
      "keyDifferences": ["difference 1", "difference 2"],
      "whatToSteal": "What specific elements to borrow",
      "whatToAvoid": "What not to copy"
    }
    // 3-4 diverse references
  ],
  "monologues": [
    {
      "sceneNumber": 1,
      "episodeNumber": 1,
      "text": "Full monologue text from script",
      "emotionalBeats": [
        {"line": "key line", "emotion": "emotion", "action": "playable action"}
      ],
      "practiceNotes": ["practice tip 1", "tip 2", "tip 3", "tip 4"],
      "performanceTips": ["performance tip 1", "tip 2", "tip 3"],
      "commonMistakes": ["mistake to avoid 1", "mistake 2"]
    }
    // 3-5 key monologues
  ],
  "keyScenes": [
    {
      "sceneNumber": 1,
      "episodeNumber": 1,
      "importance": 5,
      "whyItMatters": ["reason 1 (detailed)", "reason 2"],
      "whatToFocusOn": ["focus area 1", "focus area 2", "focus area 3"],
      "quickPrepTips": ["tip 1", "tip 2", "tip 3"],
      "rehearsalExercises": ["exercise 1", "exercise 2"],
      "commonChallenges": ["challenge 1", "challenge 2"]
    }
    // 8-10 most important scenes
  ],
  "onSetPrep": {
    "preScene": ["prep item 1", "item 2", "item 3", "item 4"],
    "warmUp": ["warmup 1", "warmup 2", "warmup 3", "warmup 4"],
    "emotionalPrep": ["emotional prep 1", "prep 2", "prep 3"],
    "mentalChecklist": ["checklist item 1", "item 2", "item 3"],
    "physicalWarmup": ["physical prep 1", "prep 2"],
    "voiceWarmup": ["voice prep 1", "prep 2"]
  },
  "researchSuggestions": {
    "historical": ["research topic 1 (with why)", "topic 2"],
    "realWorld": ["real world parallel 1", "parallel 2"],
    "cultural": ["cultural element 1", "element 2"],
    "resources": ["Book: Title (why to read)", "Film: Title (what to watch for)", "Documentary: Title"],
    "peopleToStudy": ["Real person 1 (why relevant)", "Person 2"]
  },
  "wardrobeNotes": {
    "howItAffects": "Detailed analysis of how costume affects character (3-4 sentences)",
    "keyChoices": ["choice 1 and its significance", "choice 2", "choice 3"],
    "comfortNotes": "Practical comfort considerations",
    "psychologicalImpact": "How wearing these clothes makes character feel"
  },
  "memorizationAids": {
    "techniques": ["technique 1 (detailed)", "technique 2", "technique 3"],
    "order": [scene numbers in memorization order],
    "tips": ["tip 1", "tip 2", "tip 3", "tip 4"],
    "difficultLines": [
      {"line": "hard line", "trick": "how to remember it"}
    ]
  },
  "techniqueExercises": [
    {
      "sceneNumber": 1,
      "exercises": ["detailed exercise 1 for this scene", "exercise 2", "exercise 3"]
    }
    // Technique-specific exercises for 5-8 key scenes
  ]
}

Be specific, detailed, and practical. Base everything on professional actor training.`

  try {
    const response = await generateContent(userPrompt, {
      systemPrompt,
      model: 'gpt-4.1',
      temperature: 0.5, // Lower temperature for more consistent JSON formatting
      maxTokens: 16000 // Increased to handle comprehensive materials without truncation
    })
    
    console.log('📄 Practice materials response length:', response.length)
    
    // Use the robust JSON cleaning utility
    try {
      const parsed = cleanAndParseJSON(response)
      return parsed
    } catch (parseError: any) {
      console.error('❌ JSON parse error in practice materials:', parseError.message)
      
      const errorPos = parseError.message.match(/position (\d+)/)?.[1]
      if (errorPos) {
        const pos = parseInt(errorPos)
        const start = Math.max(0, pos - 100)
        const end = Math.min(response.length, pos + 100)
        console.error(`Error context (position ${pos}):`, response.substring(start, end))
        console.error('Character at error:', response[pos], 'Code:', response.charCodeAt(pos))
      }
      
      return getMinimalPracticeMaterials(context)
    }
  } catch (error) {
    console.error('Error generating practice materials:', error)
    return getMinimalPracticeMaterials(context)
  }
}

/**
 * Minimal fallback for core materials
 */
function getMinimalCoreMaterials(context: any) {
  return {
    studyGuide: {
      background: context.character.description || 'Character background not available',
      motivations: ['Survive the story'],
      relationships: [],
      characterArc: 'Character develops throughout the arc',
      internalConflicts: []
    },
    throughLine: {
      superObjective: 'Navigate the challenges of the story',
      explanation: 'The character must overcome obstacles and grow',
      keyScenes: []
    },
    gotAnalysis: [],
    sceneBreakdowns: [],
    emotionalBeats: [],
    physicalWork: {
      bodyLanguage: [],
      movement: [],
      posture: []
    },
    voicePatterns: {
      vocabulary: [],
      rhythm: 'Natural speech patterns',
      keyPhrases: context.dialogue.slice(0, 5),
      verbalTics: []
    }
  }
}

/**
 * Minimal fallback for practice materials
 */
function getMinimalPracticeMaterials(context: any) {
  return {
    performanceReference: [],
    monologues: [],
    keyScenes: [],
    onSetPrep: {
      preScene: ['Review script', 'Get into character mindset'],
      warmUp: ['Vocal warmups', 'Physical warmups'],
      emotionalPrep: ['Connect to character emotions'],
      mentalChecklist: ['Know your objective', 'Stay present']
    },
    researchSuggestions: {},
    wardrobeNotes: {},
    memorizationAids: {},
    techniqueExercises: []
  }
}
