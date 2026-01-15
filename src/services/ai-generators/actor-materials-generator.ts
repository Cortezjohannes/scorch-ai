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
  characterId?: string // Optional: generate for single character
  characterName?: string // Optional: generate for single character by name
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
    characterId,
    characterName,
    onProgress
  } = params

  console.log('🎭 Starting enhanced actor materials generation')
  console.log(`  Arc: ${arcIndex}, Episodes: ${episodeNumbers.join(', ')}`)
  if (characterId || characterName) {
    console.log(`  Single character mode: ${characterName || characterId}`)
  }

  // Get arc info
  const arc = storyBible.narrativeArcs?.[arcIndex]
  if (!arc) {
    throw new Error(`Arc ${arcIndex} not found in story bible`)
  }

  // Get main characters for this arc (only those appearing in script breakdown)
  let characters = getMainCharacters(storyBible, arc, episodeData, episodeNumbers, episodePreProdData)
  console.log(`  Characters appearing in arc: ${characters.length}`)

  // Filter to single character if specified
  if (characterId || characterName) {
    const targetName = characterName?.toLowerCase()
    const targetId = characterId?.toLowerCase()
    characters = characters.filter(char => 
      char.name.toLowerCase() === targetName || 
      char.id.toLowerCase() === targetId ||
      char.name.toLowerCase().includes(targetName || '') ||
      char.id.toLowerCase().includes(targetId || '')
    )
    
    if (characters.length === 0) {
      throw new Error(`Character not found: ${characterName || characterId}`)
    }
    
    console.log(`  Filtered to single character: ${characters[0].name}`)
  }

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
 * Get main characters for the arc - ONLY characters that appear in script breakdown scenes
 */
function getMainCharacters(
  storyBible: any,
  arc: any,
  episodeData: any,
  episodeNumbers: number[],
  episodePreProdData: any
): Array<{ id: string; name: string; description: string }> {
  // Collect all character names from MULTIPLE sources to ensure completeness
  const charactersInArc = new Set<string>()
  
  console.log(`  Processing ${episodeNumbers.length} episodes in arc: ${episodeNumbers.join(', ')}`)
  
  // SOURCE 1: Script breakdown scenes (most accurate)
  let hasScriptBreakdown = false
  for (const episodeNum of episodeNumbers) {
    const preProd = episodePreProdData[episodeNum]
    const scriptBreakdown = preProd?.scriptBreakdown
    
    if (scriptBreakdown?.scenes && Array.isArray(scriptBreakdown.scenes)) {
      hasScriptBreakdown = true
      console.log(`  Episode ${episodeNum}: Found ${scriptBreakdown.scenes.length} scenes in script breakdown`)
      for (const scene of scriptBreakdown.scenes) {
        // Extract characters from script breakdown scene
        if (scene.characters && Array.isArray(scene.characters)) {
          for (const char of scene.characters) {
            // ScriptBreakdownCharacter has a 'name' property
            const charName = char.name || (typeof char === 'string' ? char : null)
            if (charName && typeof charName === 'string' && charName.trim()) {
              charactersInArc.add(charName.trim())
            }
          }
        }
      }
    } else {
      console.log(`  Episode ${episodeNum}: No script breakdown found`)
    }
  }
  
  // SOURCE 2: Episode characters list (important for characters that may not be in breakdown)
  for (const episodeNum of episodeNumbers) {
    const episode = episodeData[episodeNum]
    if (episode?.characters) {
      console.log(`  Episode ${episodeNum}: Found ${episode.characters.length} characters in episode list`)
      for (const char of episode.characters) {
        if (char.importance !== 'minor' && char.name) {
          charactersInArc.add(char.name)
        }
      }
    } else {
      console.log(`  Episode ${episodeNum}: No episode data or characters list`)
    }
  }
  
  // SOURCE 3: Extract from scene content/screenplay (catch characters mentioned in dialogue/action)
  for (const episodeNum of episodeNumbers) {
    const episode = episodeData[episodeNum]
    if (episode?.scenes) {
      console.log(`  Episode ${episodeNum}: Processing ${episode.scenes.length} scenes for character extraction`)
      for (const scene of episode.scenes) {
        const sceneText = scene.content || scene.screenplay || ''
        if (sceneText) {
          // Use existing extraction function to find character names in scene text
          const extractedNames = extractAllCharacterNames(sceneText)
          if (extractedNames.length > 0) {
            console.log(`    Scene ${scene.sceneNumber}: Found ${extractedNames.length} characters: ${extractedNames.join(', ')}`)
          }
          extractedNames.forEach(name => charactersInArc.add(name))
        }
      }
    } else {
      console.log(`  Episode ${episodeNum}: No scenes found in episode data`)
    }
  }
  
  // SOURCE 4: Also check pre-production scene notes for character mentions
  for (const episodeNum of episodeNumbers) {
    const preProd = episodePreProdData[episodeNum]
    if (preProd?.scenes) {
      console.log(`  Episode ${episodeNum}: Processing ${preProd.scenes.length} pre-prod scenes for character extraction`)
      for (const preProdScene of preProd.scenes) {
        const sceneText = preProdScene.linkedSceneContent || preProdScene.notes || ''
        if (sceneText) {
          const extractedNames = extractAllCharacterNames(sceneText)
          extractedNames.forEach(name => charactersInArc.add(name))
        }
      }
    }
  }
  
  console.log(`  Total unique characters found across all ${episodeNumbers.length} episodes: ${charactersInArc.size}`)
  console.log(`  Characters: ${Array.from(charactersInArc).join(', ')}`)
  console.log(`  Episodes processed: ${episodeNumbers.length}/${episodeNumbers.length} (${episodeNumbers.join(', ')})`)
  
  // Helper function to normalize character names for matching
  const normalizeName = (name: string): string => {
    return name.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[^\w\s]/g, '')
  }
  
  // Helper function to check if two names match (flexible matching)
  const namesMatch = (name1: string, name2: string): boolean => {
    const norm1 = normalizeName(name1)
    const norm2 = normalizeName(name2)
    
    // Exact match
    if (norm1 === norm2) return true
    
    // Check if one contains the other (for "JACE" vs "Jace" or "JASON CALACANIS" vs "JASON")
    if (norm1.includes(norm2) || norm2.includes(norm1)) {
      // Only match if the shorter name is at least 3 characters (avoid false matches)
      const shorter = norm1.length < norm2.length ? norm1 : norm2
      if (shorter.length >= 3) return true
    }
    
    // Check first name match (for "JASON CALACANIS" vs "JASON")
    const firstWord1 = norm1.split(' ')[0]
    const firstWord2 = norm2.split(' ')[0]
    if (firstWord1 === firstWord2 && firstWord1.length >= 3) return true
    
    return false
  }
  
  // Create normalized map of extracted characters for faster lookup
  const extractedCharsNormalized = new Map<string, string>() // normalized -> original
  Array.from(charactersInArc).forEach(name => {
    const normalized = normalizeName(name)
    if (!extractedCharsNormalized.has(normalized)) {
      extractedCharsNormalized.set(normalized, name)
    }
  })
  
  const characters: Array<{ id: string; name: string; description: string }> = []
  const seen = new Set<string>()

  // Get characters from story bible - use flexible matching
  if (storyBible.mainCharacters) {
    console.log(`  Checking ${storyBible.mainCharacters.length} story bible characters against extracted list...`)
    for (const char of storyBible.mainCharacters) {
      const charName = char.name
      if (!charName) continue
      
      // Check if this character appears in extracted list (flexible matching)
      const appearsInArc = Array.from(charactersInArc).some(extractedName => 
        namesMatch(extractedName, charName)
      ) || Array.from(extractedCharsNormalized.keys()).some(normalized => 
        namesMatch(normalized, charName)
      )
      
      // Also check if character appears in any episode's character list
      let appearsInEpisodeList = false
      for (const episodeNum of episodeNumbers) {
        const episode = episodeData[episodeNum]
        if (episode?.characters) {
          const found = episode.characters.some((epChar: any) => 
            epChar.name && namesMatch(epChar.name, charName) && epChar.importance !== 'minor'
          )
          if (found) {
            appearsInEpisodeList = true
            break
          }
        }
      }
      
      // If character is in story bible and appears in any episode of the arc, include them
      // This ensures we don't miss characters that are in the story but extraction missed
      if ((appearsInArc || appearsInEpisodeList) && !seen.has(charName)) {
        characters.push({
          id: char.id || charName.toLowerCase().replace(/\s+/g, '-'),
          name: charName,
          description: char.description || char.background || ''
        })
        seen.add(charName)
        console.log(`    ✓ Included: ${charName} (matched from ${appearsInArc ? 'extraction' : 'episode list'})`)
      } else if (!seen.has(charName)) {
        console.log(`    ✗ Skipped: ${charName} (not found in arc)`)
      }
    }
  }

  // Get additional characters from arc episodes that appear in episodes but not in story bible
  for (const episodeNum of episodeNumbers) {
    const episode = episodeData[episodeNum]
    if (episode?.characters) {
      for (const char of episode.characters) {
        const charName = char.name
        if (!charName || char.importance === 'minor') continue
        
        // Check if already added from story bible
        const alreadyAdded = Array.from(seen).some(seenName => namesMatch(seenName, charName))
        
        if (!alreadyAdded) {
          // Check if they appear in extracted list or episode list
          const appearsInExtracted = Array.from(charactersInArc).some(extractedName => 
            namesMatch(extractedName, charName)
          )
          
          if (appearsInExtracted && !seen.has(charName)) {
          characters.push({
              id: charName.toLowerCase().replace(/\s+/g, '-'),
              name: charName,
            description: char.description || ''
          })
            seen.add(charName)
            console.log(`    ✓ Added from episode: ${charName}`)
          }
        }
      }
    }
  }

  console.log(`  Filtered to ${characters.length} characters that appear in arc script breakdown`)
  // Return only characters that appear in the arc
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

  // CALL 1: Generate core materials (with batched GOTE if needed)
  console.log(`  [1/3] Generating core materials...`)
  onPhaseUpdate?.('Generating study guide & scene analysis')
  const coreMaterials = await generateCoreMaterials(character, context, storyBible, technique, onPhaseUpdate)
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

  // Collect pre-production notes and character insights
  const preProdNotes: any[] = []
  const characterNotes: any[] = []

  for (const episodeNum of episodeNumbers) {
    const episode = episodeData[episodeNum]
    const preProd = episodePreProdData[episodeNum]

    // Get pre-production scene notes and character insights
    if (preProd) {
      // Get scene notes from pre-production
      if (preProd.scenes) {
        for (const preProdScene of preProd.scenes) {
          const sceneText = episode?.scenes?.find((s: any) => s.sceneNumber === preProdScene.sceneNumber)?.content || ''
          if (sceneText && sceneText.toUpperCase().includes(character.name.toUpperCase())) {
            preProdNotes.push({
              episodeNumber: episodeNum,
              sceneNumber: preProdScene.sceneNumber,
              notes: preProdScene.notes || '',
              directorNotes: preProdScene.directorNotes || '',
              characterNotes: preProdScene.characterNotes || '',
              blocking: preProdScene.blocking || '',
              emotionalBeats: preProdScene.emotionalBeats || []
            })
          }
        }
      }

      // Get character-specific notes from pre-production
      if (preProd.characters) {
        const charPreProd = preProd.characters.find((c: any) => 
          c.name?.toLowerCase() === character.name.toLowerCase()
        )
        if (charPreProd) {
          characterNotes.push({
            episodeNumber: episodeNum,
            notes: charPreProd.notes || '',
            characterMotivation: charPreProd.characterMotivation || '',
            emotionalState: charPreProd.emotionalState || '',
            objectives: charPreProd.objectives || [],
            relationships: charPreProd.relationships || []
          })
        }
      }
    }

    // Helper function to check if character appears in scene (flexible matching)
    const characterAppearsInScene = (sceneText: string, characterName: string): boolean => {
      const upperText = sceneText.toUpperCase()
      const upperName = characterName.toUpperCase()
      
      // Direct name match
      if (upperText.includes(upperName)) return true
      
      // Check for first name match (e.g., "JACE" matches "Jace Castro")
      const firstName = characterName.split(' ')[0].toUpperCase()
      if (firstName.length >= 3 && upperText.includes(firstName)) {
        // Verify it's not part of another word
        const regex = new RegExp(`\\b${firstName}\\b`, 'i')
        if (regex.test(sceneText)) return true
      }
      
      return false
    }
    
    // Check script breakdown scenes first (more reliable)
    if (preProd?.scriptBreakdown?.scenes) {
      for (const breakdownScene of preProd.scriptBreakdown.scenes) {
        // Check if character is listed in script breakdown
        const charInBreakdown = breakdownScene.characters?.some((c: any) => {
          const charName = c.name || (typeof c === 'string' ? c : '')
          if (!charName) return false
          
          // Flexible name matching
          const normalizedChar = charName.toLowerCase().trim()
          const normalizedTarget = character.name.toLowerCase().trim()
          
          if (normalizedChar === normalizedTarget) return true
          if (normalizedChar.includes(normalizedTarget) || normalizedTarget.includes(normalizedChar)) return true
          
          // First name match
          const firstName1 = normalizedChar.split(' ')[0]
          const firstName2 = normalizedTarget.split(' ')[0]
          if (firstName1 === firstName2 && firstName1.length >= 3) return true
          
          return false
        })
        
        if (charInBreakdown) {
          // PRIORITY 1: Use linkedSceneContent from script breakdown (actual screenplay)
          // PRIORITY 2: Use screenplay from episode.scenes (actual screenplay format)
          // PRIORITY 3: Use content from episode.scenes (narrative format)
          const scene = episode?.scenes?.find((s: any) => s.sceneNumber === breakdownScene.sceneNumber)
          const sceneText = breakdownScene.linkedSceneContent || scene?.screenplay || scene?.content || ''
          
          if (sceneText) {
            const preProdScene = preProd?.scenes?.find((s: any) => s.sceneNumber === breakdownScene.sceneNumber)
            
            // Check if we already added this scene
            const alreadyAdded = scenes.some((s: any) => 
              s.episodeNumber === episodeNum && s.sceneNumber === breakdownScene.sceneNumber
            )
            
            if (!alreadyAdded) {
              // Log which data source we're using
              const dataSource = breakdownScene.linkedSceneContent 
                ? 'script breakdown linkedSceneContent' 
                : scene?.screenplay 
                  ? 'episode.scenes.screenplay' 
                  : 'episode.scenes.content'
              console.log(`    Scene ${breakdownScene.sceneNumber}: Using ${dataSource} for ${character.name}`)
              
              scenes.push({
                episodeNumber: episodeNum,
                sceneNumber: breakdownScene.sceneNumber,
                content: sceneText,
                heading: scene?.heading || breakdownScene.sceneTitle || '',
                location: scene?.location || breakdownScene.location || '',
                time: scene?.timeOfDay || breakdownScene.timeOfDay || '',
                // Include pre-production notes if available
                preProdNotes: preProdScene?.notes || '',
                directorNotes: preProdScene?.directorNotes || '',
                characterNotes: preProdScene?.characterNotes || '',
                blocking: preProdScene?.blocking || '',
                emotionalBeats: preProdScene?.emotionalBeats || []
              })

              // Extract dialogue lines
              const lines = extractCharacterLines(sceneText, character.name)
              dialogue.push(...lines)

              // Find other characters in scene from MULTIPLE sources:
              // 1. From script breakdown (most reliable - lists all characters in scene)
              breakdownScene.characters?.forEach((c: any) => {
                const charName = c.name || (typeof c === 'string' ? c : '')
                if (charName && charName.trim()) {
                  const normalizedChar = charName.toLowerCase().trim()
                  const normalizedTarget = character.name.toLowerCase().trim()
                  // Don't add the character themselves
                  if (normalizedChar !== normalizedTarget) {
                    // Flexible name matching
                    if (normalizedChar === normalizedTarget) return
                    if (normalizedChar.includes(normalizedTarget) || normalizedTarget.includes(normalizedChar)) {
                      const shorter = normalizedChar.length < normalizedTarget.length ? normalizedChar : normalizedTarget
                      if (shorter.length >= 3) return // Would match, skip
                    }
                    const firstName1 = normalizedChar.split(' ')[0]
                    const firstName2 = normalizedTarget.split(' ')[0]
                    if (firstName1 === firstName2 && firstName1.length >= 3) return // Would match, skip
                    
                    // Add the character
                    otherCharacters.add(charName.trim())
                  }
                }
              })
              
              // 2. From scene text extraction (fallback - catches characters mentioned but not in breakdown)
              const charNames = extractAllCharacterNames(sceneText)
              charNames.forEach(name => {
                if (name && name.trim()) {
                  const normalizedName = name.toLowerCase().trim()
                  const normalizedTarget = character.name.toLowerCase().trim()
                  // Don't add the character themselves
                  if (normalizedName !== normalizedTarget) {
                    otherCharacters.add(name.trim())
                  }
                }
              })
            }
          } else {
            console.warn(`    Scene ${breakdownScene.sceneNumber}: Character ${character.name} in breakdown but no scene content found`)
          }
        }
      }
    }
    
    // Also check episode scenes directly (fallback for scenes not in script breakdown)
    // This ensures we catch scenes that might not be in script breakdown yet
    if (episode?.scenes) {
      for (const scene of episode.scenes) {
        // PRIORITY: Use screenplay format if available (actual screenplay), otherwise use content
        const sceneText = scene.screenplay || scene.content || ''
        
        if (!sceneText) continue
        
        // Check if character appears in scene (using flexible matching)
        if (characterAppearsInScene(sceneText, character.name)) {
          // Check if we already added this scene (from script breakdown)
          const alreadyAdded = scenes.some((s: any) => 
            s.episodeNumber === episodeNum && s.sceneNumber === scene.sceneNumber
          )
          
          if (!alreadyAdded) {
            // Also check if this scene is in script breakdown (to use breakdown metadata)
            const breakdownScene = preProd?.scriptBreakdown?.scenes?.find((s: any) => s.sceneNumber === scene.sceneNumber)
            const preProdScene = preProd?.scenes?.find((s: any) => s.sceneNumber === scene.sceneNumber)
            
            // Log which data source we're using
            const dataSource = scene.screenplay ? 'episode.scenes.screenplay' : 'episode.scenes.content'
            console.log(`    Scene ${scene.sceneNumber}: Using ${dataSource} for ${character.name} (not in script breakdown)`)
            
          scenes.push({
            episodeNumber: episodeNum,
            sceneNumber: scene.sceneNumber,
            content: sceneText,
              heading: scene.heading || breakdownScene?.sceneTitle || '',
              location: scene.location || breakdownScene?.location || '',
              time: scene.timeOfDay || breakdownScene?.timeOfDay || '',
              // Include pre-production notes if available
              preProdNotes: preProdScene?.notes || '',
              directorNotes: preProdScene?.directorNotes || '',
              characterNotes: preProdScene?.characterNotes || '',
              blocking: preProdScene?.blocking || '',
              emotionalBeats: preProdScene?.emotionalBeats || []
          })

          // Extract dialogue lines
          const lines = extractCharacterLines(sceneText, character.name)
          dialogue.push(...lines)

            // Find other characters in scene from MULTIPLE sources:
            // 1. From script breakdown if available (most reliable)
            if (breakdownScene?.characters) {
              breakdownScene.characters.forEach((c: any) => {
                const charName = c.name || (typeof c === 'string' ? c : '')
                if (charName && charName.trim()) {
                  const normalizedChar = charName.toLowerCase().trim()
                  const normalizedTarget = character.name.toLowerCase().trim()
                  // Don't add the character themselves
                  if (normalizedChar !== normalizedTarget) {
                    // Flexible name matching to avoid duplicates
                    if (normalizedChar === normalizedTarget) return
                    if (normalizedChar.includes(normalizedTarget) || normalizedTarget.includes(normalizedChar)) {
                      const shorter = normalizedChar.length < normalizedTarget.length ? normalizedChar : normalizedTarget
                      if (shorter.length >= 3) return // Would match, skip
                    }
                    const firstName1 = normalizedChar.split(' ')[0]
                    const firstName2 = normalizedTarget.split(' ')[0]
                    if (firstName1 === firstName2 && firstName1.length >= 3) return // Would match, skip
                    
                    // Add the character
                    otherCharacters.add(charName.trim())
                  }
                }
              })
            }
            
            // 2. From scene text extraction (fallback - catches characters mentioned but not in breakdown)
          const charNames = extractAllCharacterNames(sceneText)
          charNames.forEach(name => {
              if (name && name.trim()) {
                const normalizedName = name.toLowerCase().trim()
                const normalizedTarget = character.name.toLowerCase().trim()
                // Don't add the character themselves
                if (normalizedName !== normalizedTarget) {
                  otherCharacters.add(name.trim())
                }
              }
            })
          }
        }
      }
    }

    // Get character relationships from episode data
    if (episode?.characters) {
      const charData = episode.characters.find((c: any) => 
        c.name.toLowerCase() === character.name.toLowerCase()
      )
      if (charData?.relationships) {
        relationships.push(...charData.relationships)
      }
    }
  }

  // Log context gathering results for debugging
  const scenesFromBreakdown = scenes.filter((s: any) => {
    // Check if scene was found via script breakdown
    return episodePreProdData[s.episodeNumber]?.scriptBreakdown?.scenes?.some((bs: any) => 
      bs.sceneNumber === s.sceneNumber
    )
  }).length
  
  console.log(`  📊 Context gathered for ${character.name}:`, {
    scenes: scenes.length,
    scenesFromScriptBreakdown: scenesFromBreakdown,
    scenesFromEpisode: scenes.length - scenesFromBreakdown,
    dialogue: dialogue.length,
    otherCharacters: otherCharacters.size,
    relationships: relationships.length,
    preProdNotes: preProdNotes.length,
    characterNotes: characterNotes.length,
    dataSources: {
      scriptBreakdown: scenesFromBreakdown > 0 ? '✓ used' : '✗ not used',
      episodeScenes: (scenes.length - scenesFromBreakdown) > 0 ? '✓ used' : '✗ not used',
      linkedSceneContent: scenes.some((s: any) => {
        const breakdown = episodePreProdData[s.episodeNumber]?.scriptBreakdown?.scenes?.find((bs: any) => 
          bs.sceneNumber === s.sceneNumber
        )
        return breakdown?.linkedSceneContent
      }) ? '✓ used' : '✗ not used'
    }
  })
  
  if (scenes.length === 0) {
    console.warn(`  ⚠️ WARNING: No scenes found for ${character.name} in episodes ${episodeNumbers.join(', ')}`)
    console.warn(`  ⚠️ Checked sources:`)
    console.warn(`    - Script breakdown scenes (preProd.scriptBreakdown.scenes)`)
    console.warn(`    - Episode scenes (episode.scenes)`)
    console.warn(`    - Linked scene content (breakdownScene.linkedSceneContent)`)
    console.warn(`  ⚠️ This character may not appear in any scenes, or name matching failed`)
  }
  
  if (otherCharacters.size === 0 && scenes.length > 0) {
    console.warn(`  ⚠️ WARNING: No other characters found in scenes for ${character.name}`)
    console.warn(`  ⚠️ This may indicate the character appears alone or character name extraction failed`)
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
    worldSetting: storyBible.worldBuilding?.setting || '',
    preProdNotes, // Pre-production scene notes
    characterNotes // Character-specific pre-production notes
  }
}

/**
 * Extract all character names from a scene (in screenplay format)
 */
function extractAllCharacterNames(sceneText: string): string[] {
  const names = new Set<string>()
  const lines = sceneText.split('\n')

  // Invalid patterns to filter out (screenplay formatting, sound effects, etc.)
  const invalidPatterns = [
    /^(INT\.|EXT\.|FADE|CUT TO|DISSOLVE|SMASH|MATCH|JUMP)/i, // Scene headings and transitions
    /^(THWACK|SQUEAK|THUD|PING|BANG|CRASH|BOOM|WHAM|POW|ZAP|BUZZ|BEEP|RING|CLICK|TICK|HISS|POP|CRACK|SNAP|WHIP|SLAM|SMACK|THUMP|CLAP|TAP|KNOCK|DING|DONG|BONG|GONG|CHIME|BELL|ALARM|SIREN|HORN|WHISTLE|SCREAM|SHOUT|YELL|WHISPER|MURMUR|MUMBLE|GRUNT|GROAN|SIGH|GASP|CHOKE|COUGH|SNEEZE|SNIFF|SNORT|LAUGH|GIGGLE|CHUCKLE|GUFFAW|CRY|SOB|WAIL|MOAN|WHINE|COMPLAIN|COMPLAINT|PROTEST|OBJECT|ARGUE|DEBATE|DISCUSS|TALK|SPEAK|SAY|TELL|ASK|ANSWER|REPLY|RESPOND|EXCLAIM|DECLARE|ANNOUNCE|PROCLAIM|STATE|MENTION|NOTE|OBSERVE|REMARK|COMMENT|QUIP|JOKE|TEASE|TAUNT|MOCK|RIDICULE|MIMIC|IMITATE|PARODY|SATIRIZE|CRITICIZE|PRAISE|COMPLIMENT|FLATTER|INSULT|OFFEND|HURT|WOUND|INJURE|HARM|DAMAGE|DESTROY|RUIN|WRECK|BREAK|SMASH|SHATTER|CRUSH|SQUASH|SQUEEZE|PRESS|PUSH|PULL|DRAG|LIFT|CARRY|DROP|THROW|TOSS|FLING|HURL|PITCH|CATCH|GRAB|SNATCH|SEIZE|TAKE|GIVE|HAND|PASS|THROW|TOSS|FLING|HURL|PITCH|CATCH|GRAB|SNATCH|SEIZE|TAKE|GIVE|HAND|PASS)\.?$/i, // Sound effects
    /^[A-Z\s]{1,3}\.$/, // Short all-caps with period (like "A.", "B.", "C.")
    /^[A-Z]{1,2}$/, // Single or double letters
    /^(BLINDING|FADE|CUT|DISSOLVE|SMASH|MATCH|JUMP|FLASH|FREEZE|SLOW|FAST|QUICK|INSTANT|SUDDEN|ABRUPT|GRADUAL|SLOWLY|QUICKLY|SUDDENLY|ABRUPTLY|GRADUALLY)/i, // Transitions and directions
  ]

  for (const line of lines) {
    const trimmed = line.trim()
    // Character names in screenplay are ALL CAPS on their own line
    if (trimmed && trimmed === trimmed.toUpperCase() && trimmed.length > 2 && trimmed.length < 30) {
      // Filter out invalid patterns
      const isInvalid = invalidPatterns.some(pattern => pattern.test(trimmed))
      if (isInvalid) continue
      
      // Filter out common scene headings
      if (!trimmed.startsWith('INT.') && !trimmed.startsWith('EXT.') && !trimmed.startsWith('FADE')) {
        // Remove parentheticals like (CONT'D), (V.O.), (O.S.), etc.
        const cleanName = trimmed.replace(/\(.*?\)/g, '').trim()
        if (cleanName && cleanName.length > 2) {
          // Additional check: must contain at least one letter (not just punctuation/numbers)
          if (/[A-Z]/.test(cleanName)) {
          names.add(cleanName)
          }
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
  technique?: ActingTechnique,
  onPhaseUpdate?: (phase: string) => void
) {
  const systemPrompt = `You are an expert acting coach and script analyst. Generate comprehensive, professional actor preparation materials. Include playable actions, moment-to-moment beats, and psychological depth.

CRITICAL: USE ONLY PROVIDED CONTEXT
- You MUST base ALL materials ONLY on the scenes, dialogue, and character data provided below
- DO NOT invent details, backstories, or events that are not explicitly in the provided scenes
- DO NOT make assumptions about character motivations beyond what is shown in the scenes
- If information is not provided, state that it's not available rather than inventing it
- All dialogue quotes MUST be exact quotes from the provided scenes
- All scene references MUST be to actual scenes provided in the context
- Character traits MUST be derived from actual dialogue and actions in the scenes

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

WARNING: CRITICAL INSTRUCTION: Base ALL materials ONLY on the provided scenes, dialogue, and character data below. DO NOT invent details not present in the provided context.

STORY CONTEXT:
Title: ${storyBible.title}
${storyBible.seriesOverview ? `Series Overview: ${storyBible.seriesOverview}\n` : ''}
Genre: ${context.genre}
Logline: ${storyBible.logline || 'Not provided'}
${storyBible.worldBuilding?.setting ? `World Setting: ${storyBible.worldBuilding.setting}\n` : ''}
Character Description: ${context.character.description}

ALL SCENES WITH THIS CHARACTER (${context.scenes.length} scenes across episodes ${context.episodeNumbers.join(', ')}):
${context.scenes.map((s: any) => `
=== Episode ${s.episodeNumber}, Scene ${s.sceneNumber} ===
${s.heading || 'No heading'}
Location: ${s.location || 'Not specified'}
Time: ${s.time || 'Not specified'}
${s.preProdNotes ? `Pre-Production Notes: ${s.preProdNotes}\n` : ''}
${s.directorNotes ? `Director Notes: ${s.directorNotes}\n` : ''}
${s.characterNotes ? `Character Notes: ${s.characterNotes}\n` : ''}
${s.blocking ? `Blocking: ${s.blocking}\n` : ''}
${s.emotionalBeats && s.emotionalBeats.length > 0 ? `Emotional Beats: ${JSON.stringify(s.emotionalBeats)}\n` : ''}
SCENE CONTENT:
${s.content}
`).join('\n---\n')}

CHARACTER-SPECIFIC PRE-PRODUCTION NOTES:
${context.characterNotes.length > 0 ? context.characterNotes.map((note: any) => `
Episode ${note.episodeNumber}:
${note.notes ? `Notes: ${note.notes}\n` : ''}
${note.characterMotivation ? `Motivation: ${note.characterMotivation}\n` : ''}
${note.emotionalState ? `Emotional State: ${note.emotionalState}\n` : ''}
${note.objectives && note.objectives.length > 0 ? `Objectives: ${JSON.stringify(note.objectives)}\n` : ''}
${note.relationships && note.relationships.length > 0 ? `Relationships: ${JSON.stringify(note.relationships)}\n` : ''}
`).join('\n') : 'No character-specific pre-production notes available'}

DEEP CHARACTER DATA FROM STORY BIBLE:
${context.characterDeepData ? `
Physiology: ${JSON.stringify(context.characterDeepData.physiology || {})}
Sociology: ${JSON.stringify(context.characterDeepData.sociology || {})}
Psychology: ${JSON.stringify(context.characterDeepData.psychology || {})}
` : 'WARNING: Deep character data not available - use ONLY what is shown in the scenes above'}

EXACT DIALOGUE FROM SCENES (use these exact quotes):
${context.dialogue.length > 0 ? context.dialogue.map((line: string, i: number) => `${i + 1}. "${line}"`).join('\n') : 'WARNING: No dialogue found - character may not speak in provided scenes'}

OTHER CHARACTERS IN SCENES:
${context.otherCharacters.length > 0 ? context.otherCharacters.join(', ') : 'No other characters identified in scenes'}

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
    // Generate GOTE analysis for ALL scenes provided above (not just key scenes)
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

WARNING: REMEMBER: 
- Use ONLY information from the scenes, dialogue, and character data provided above
- All dialogue quotes MUST be exact quotes from the scenes above
- All scene references MUST be to actual scenes listed above
- DO NOT invent backstories, motivations, or details not present in the provided context
- If something is not shown in the scenes, state "Not shown in provided scenes" rather than inventing it
- Base all analysis on actual dialogue and actions from the scenes

Be extremely detailed and specific. All tactics should be PLAYABLE VERBS. Include psychological depth and sensory work based on what is actually shown in the scenes.`

  try {
    const response = await generateContent(userPrompt, {
      systemPrompt,
      model: 'gpt-4.1',
      temperature: 0.5, // Lower temperature for more consistent JSON formatting
      maxTokens: 16000 // Increased to handle comprehensive materials without truncation
    })
    
    // Use the robust JSON cleaning utility
    let parsed: any
    try {
      parsed = cleanAndParseJSON(response)
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

    // If there are more than 8 scenes, batch generate GOTE analysis for all scenes
    const totalScenes = context.scenes.length
    const GOTE_BATCH_SIZE = 8
    
    if (totalScenes > GOTE_BATCH_SIZE) {
      console.log(`  📦 Batching GOTE analysis: ${totalScenes} scenes in ${Math.ceil(totalScenes / GOTE_BATCH_SIZE)} batches`)
      onPhaseUpdate?.('Generating GOTE analysis for all scenes')
      
      const allGOTEAnalysis: any[] = []
      
      // Process scenes in batches of 8
      for (let i = 0; i < context.scenes.length; i += GOTE_BATCH_SIZE) {
        const batch = context.scenes.slice(i, i + GOTE_BATCH_SIZE)
        const batchNumber = Math.floor(i / GOTE_BATCH_SIZE) + 1
        const totalBatches = Math.ceil(context.scenes.length / GOTE_BATCH_SIZE)
        
        console.log(`  📦 Processing GOTE batch ${batchNumber}/${totalBatches}: ${batch.length} scenes`)
        onPhaseUpdate?.(`Generating GOTE analysis (batch ${batchNumber}/${totalBatches})`)
        
        const gotePrompt = `Generate detailed GOTE (Goal, Obstacle, Tactics, Expectation) analysis for "${context.character.name}" for these ${batch.length} specific scenes.

CHARACTER: ${context.character.name}
Description: ${context.character.description}

SCENES TO ANALYZE:
${batch.map((s: any) => `
=== Episode ${s.episodeNumber}, Scene ${s.sceneNumber} ===
${s.heading || 'No heading'}
Location: ${s.location || 'Not specified'}
Time: ${s.time || 'Not specified'}
${s.preProdNotes ? `Pre-Production Notes: ${s.preProdNotes}\n` : ''}
${s.directorNotes ? `Director Notes: ${s.directorNotes}\n` : ''}
${s.characterNotes ? `Character Notes: ${s.characterNotes}\n` : ''}
${s.blocking ? `Blocking: ${s.blocking}\n` : ''}
SCENE CONTENT:
${s.content}
`).join('\n---\n')}

${technique ? `ACTING TECHNIQUE: ${technique} - Include technique-specific notes.` : ''}

Generate GOTE analysis for ALL ${batch.length} scenes above in JSON format:

{
  "gotAnalysis": [
    {
      "sceneNumber": 1,
      "episodeNumber": 1,
      "goal": "Specific, playable goal (I want to...)",
      "obstacle": "Concrete obstacle blocking goal",
      "tactics": ["PLAYABLE verb 1 (to intimidate, to seduce, to comfort)", "verb 2", "verb 3"],
      "expectation": "What character expects to happen",
      "techniqueNotes": "${technique ? 'Technique-specific notes' : 'Optional technique notes'}",
      "playableActions": ["specific physical/verbal action 1", "action 2"],
      "momentBeats": ["beat 1: what changes", "beat 2: shift", "beat 3: revelation"]
    }
    // Generate GOTE for ALL ${batch.length} scenes listed above
  ]
}

WARNING: CRITICAL:
- Generate GOTE analysis for EVERY scene listed above
- Base goals, obstacles, and tactics ONLY on what is shown in each scene
- All tactics must be PLAYABLE VERBS
- All moment beats must reference actual changes in the scene
- Use exact episode and scene numbers from the scenes above`

        try {
          const goteResponse = await generateContent(gotePrompt, {
            systemPrompt: `You are an expert acting coach specializing in GOTE analysis. Generate detailed, playable GOTE analysis for actors. Return ONLY valid JSON.`,
            model: 'gpt-4.1',
            temperature: 0.5,
            maxTokens: 12000 // Reduced per batch to avoid parsing errors
          })
          
          try {
            const goteParsed = cleanAndParseJSON(goteResponse)
            if (goteParsed.gotAnalysis && Array.isArray(goteParsed.gotAnalysis)) {
              allGOTEAnalysis.push(...goteParsed.gotAnalysis)
              console.log(`  ✅ GOTE batch ${batchNumber} complete: ${goteParsed.gotAnalysis.length} scenes analyzed`)
            }
          } catch (goteParseError: any) {
            console.error(`❌ JSON parse error in GOTE batch ${batchNumber}:`, goteParseError.message)
            // Continue with next batch
          }
        } catch (goteError) {
          console.error(`❌ Error generating GOTE batch ${batchNumber}:`, goteError)
          // Continue with next batch
        }
      }
      
      // Replace the initial GOTE analysis with the comprehensive batched version
      if (allGOTEAnalysis.length > 0) {
        parsed.gotAnalysis = allGOTEAnalysis
        console.log(`  ✅ GOTE analysis complete: ${allGOTEAnalysis.length} scenes analyzed`)
      }
    } else {
      // 8 or fewer scenes - use the GOTE from the initial response
      console.log(`  ✅ GOTE analysis complete: ${parsed.gotAnalysis?.length || 0} scenes analyzed`)
    }
    
    return parsed
  } catch (error) {
    console.error('Error generating core materials:', error)
    return getMinimalCoreMaterials(context)
  }
}

/**
 * AI CALL 2: Generate comprehensive relationship materials (ENHANCED)
 * Batches relationships when there are more than 6 characters to avoid JSON parsing errors
 */
async function generateRelationshipMaterials(
  character: any,
  context: any,
  storyBible: any,
  coreMaterials: any
) {
  const systemPrompt = `You are an expert in character dynamics and relationship analysis for actors. Create detailed, actionable relationship maps that reveal power dynamics, emotional dependencies, and conflict patterns.

CRITICAL: USE ONLY PROVIDED CONTEXT
- Base ALL relationship analysis ONLY on actual scenes, dialogue, and interactions provided
- DO NOT invent relationship dynamics not shown in the provided scenes
- All key moments MUST reference actual scenes and episodes provided
- All relationship descriptions MUST be based on actual interactions in the scenes
- If a relationship is not shown in scenes, state "Limited interaction in provided scenes" rather than inventing details
- Return ONLY valid JSON.`

  // Get story bible characters for matching
  const storyBibleCharacters = storyBible.mainCharacters || []
  const storyBibleCharacterNames = new Set(
    storyBibleCharacters.map((c: any) => c.name?.toLowerCase().trim()).filter(Boolean)
  )
  
  // Helper function for flexible name matching
  const namesMatch = (name1: string, name2: string): boolean => {
    if (!name1 || !name2) return false
    const norm1 = name1.toLowerCase().trim().replace(/\s+/g, ' ')
    const norm2 = name2.toLowerCase().trim().replace(/\s+/g, ' ')
    if (norm1 === norm2) return true
    if (norm1.includes(norm2) || norm2.includes(norm1)) {
      const shorter = norm1.length < norm2.length ? norm1 : norm2
      if (shorter.length >= 3) return true
    }
    const first1 = norm1.split(' ')[0]
    const first2 = norm2.split(' ')[0]
    if (first1 === first2 && first1.length >= 3) return true
    return false
  }
  
  // Helper to find matching story bible character
  const findStoryBibleMatch = (charName: string): string | null => {
    const matchingSBChar = storyBibleCharacters.find((sbChar: any) => 
      namesMatch(charName, sbChar.name)
    )
    return matchingSBChar?.name || null
  }
  
  // Filter otherCharacters to only include characters that match story bible characters
  // Map scene character names to story bible character names
  const matchedCharacters: string[] = []
  const unmatchedCharacters: string[] = []
  
  for (const charName of context.otherCharacters) {
    // Skip if it's the character themselves
    if (namesMatch(charName, context.character.name)) {
      continue
    }
    
    // Try to find a story bible match
    const sbMatch = findStoryBibleMatch(charName)
    if (sbMatch) {
      matchedCharacters.push(sbMatch) // Use story bible name
    } else {
      unmatchedCharacters.push(charName)
    }
  }
  
  // Remove duplicates
  const uniqueOtherCharacters = Array.from(new Set(matchedCharacters))
  
  console.log(`  🔗 Relationship generation for ${context.character.name}:`, {
    originalOtherCharacters: context.otherCharacters.length,
    matchedToStoryBible: uniqueOtherCharacters.length,
    unmatched: unmatchedCharacters.length,
    matchedCharacters: uniqueOtherCharacters.slice(0, 10).join(', ') + (uniqueOtherCharacters.length > 10 ? `... (+${uniqueOtherCharacters.length - 10} more)` : ''),
    unmatchedSample: unmatchedCharacters.slice(0, 5).join(', ') + (unmatchedCharacters.length > 5 ? `...` : ''),
    scenesAvailable: context.scenes.length,
    dataSource: 'script breakdown + episode scenes cross-referenced, filtered to story bible characters',
    sceneNumbers: context.scenes.map((s: any) => `E${s.episodeNumber}S${s.sceneNumber}`).join(', '),
    storyBibleCharacters: storyBibleCharacters.length,
    storyBibleNames: storyBibleCharacters.map((c: any) => c.name).slice(0, 10).join(', ')
  })
  
  if (uniqueOtherCharacters.length === 0 && context.otherCharacters.length > 0) {
    console.warn(`  ⚠️ WARNING: Found ${context.otherCharacters.length} characters in scenes but none matched story bible characters`)
    console.warn(`  ⚠️ Scene characters: ${context.otherCharacters.slice(0, 10).join(', ')}`)
    console.warn(`  ⚠️ Story bible characters: ${storyBibleCharacters.map((c: any) => c.name).join(', ')}`)
    console.warn(`  ⚠️ Attempting to match each scene character...`)
    context.otherCharacters.slice(0, 10).forEach((sceneChar: string) => {
      const match = findStoryBibleMatch(sceneChar)
      console.warn(`    "${sceneChar}" -> ${match || 'NO MATCH'}`)
    })
  }
  
  const totalRelationships = uniqueOtherCharacters.length
  const BATCH_SIZE = 6 // Process 6 characters at a time to avoid JSON parsing errors
  
  // If we have more than 6 characters, batch the generation
  if (totalRelationships > BATCH_SIZE) {
    console.log(`  📦 Batching relationship generation: ${totalRelationships} characters in ${Math.ceil(totalRelationships / BATCH_SIZE)} batches`)
    
    const allRelationships: any[] = []
    const relationshipSummary: any = {
      primaryAllies: [] as string[],
      primaryConflicts: [] as string[],
      romanticInterests: [] as string[],
      familyConnections: [] as string[],
      mentorFigures: [] as string[],
      complexDynamics: [] as any[]
    }
    const socialCircle: any = {
      innerCircle: [] as string[],
      outerCircle: [] as string[],
      adversaries: [] as string[],
      unknownQuantities: [] as string[]
    }
    const loyaltyMap: any = {
      mostLoyal: '',
      conditional: [] as string[],
      wouldBetray: [] as string[]
    }

    // Process in batches
    for (let i = 0; i < uniqueOtherCharacters.length; i += BATCH_SIZE) {
      const batch = uniqueOtherCharacters.slice(i, i + BATCH_SIZE)
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1
      const totalBatches = Math.ceil(uniqueOtherCharacters.length / BATCH_SIZE)
      
      console.log(`  📦 Processing batch ${batchNumber}/${totalBatches}: ${batch.join(', ')}`)
      
      // Log which scenes will be used for this batch
      const batchScenes = context.scenes.filter((s: any) => {
        const sceneText = s.content || ''
        if (!sceneText) return false
        const mainCharInText = sceneText.toUpperCase().includes(context.character.name.toUpperCase()) ||
          (context.character.name.split(' ')[0].toUpperCase().length >= 3 &&
           sceneText.toUpperCase().includes(context.character.name.split(' ')[0].toUpperCase()))
        const batchCharInText = batch.some((name: string) => {
          const upperText = sceneText.toUpperCase()
          const upperName = name.toUpperCase()
          if (upperText.includes(upperName)) return true
          const firstName = name.split(' ')[0].toUpperCase()
          if (firstName.length >= 3 && upperText.includes(firstName)) {
            const regex = new RegExp(`\\b${firstName}\\b`, 'i')
            if (regex.test(sceneText)) return true
          }
          return false
        })
        return mainCharInText && batchCharInText
      })
      console.log(`    Batch ${batchNumber} will use ${batchScenes.length} scenes: ${batchScenes.map((s: any) => `E${s.episodeNumber}S${s.sceneNumber}`).join(', ')}`)
      
      const userPrompt = `WARNING: CRITICAL - Base ALL relationship analysis ONLY on the actual scenes provided below. DO NOT invent interactions or dynamics not shown in the scenes.

Generate relationship analysis for "${context.character.name}" with these ${batch.length} characters: ${batch.join(', ')}.

CHARACTER: ${context.character.name}
Description: ${context.character.description}

CHARACTERS IN THIS BATCH (these characters appear in scenes with ${context.character.name}):
${batch.map((name: string) => {
  const char = storyBible.mainCharacters?.find((c: any) => c.name === name)
  return `- ${name}: ${char?.description || 'Character in story'}`
}).join('\n')}

WARNING: Only analyze relationships for characters that appear in the scenes below. If a character is listed above but has no scenes below, skip them entirely.

ALL SCENES WITH INTERACTIONS BETWEEN ${context.character.name} AND THESE CHARACTERS:
${(() => {
  // Find scenes where both the main character AND at least one batch character appear
  // Use flexible name matching to catch variations (full name, first name, partial)
  const relevantScenes: any[] = []
  
  for (const scene of context.scenes) {
    const sceneText = scene.content || ''
    if (!sceneText) continue
    
    // Check if main character is in scene (should always be true since these are context.scenes)
    const mainCharInText = sceneText.toUpperCase().includes(context.character.name.toUpperCase()) ||
      (context.character.name.split(' ')[0].toUpperCase().length >= 3 &&
       sceneText.toUpperCase().includes(context.character.name.split(' ')[0].toUpperCase()))
    
    // Check if any batch character appears in scene text (flexible matching)
    const batchCharInText = batch.some((name: string) => {
      const upperText = sceneText.toUpperCase()
      const upperName = name.toUpperCase()
      // Direct name match
      if (upperText.includes(upperName)) return true
      // First name match (for "JACE" matching "Jace Castro")
      const firstName = name.split(' ')[0].toUpperCase()
      if (firstName.length >= 3 && upperText.includes(firstName)) {
        const regex = new RegExp(`\\b${firstName}\\b`, 'i')
        if (regex.test(sceneText)) return true
      }
      return false
    })
    
    if (mainCharInText && batchCharInText) {
      relevantScenes.push(scene)
    }
  }
  
  if (relevantScenes.length === 0) {
    return `\nWARNING: NO SCENES FOUND: ${context.character.name} does not appear in any scenes with these characters (${batch.join(', ')}) in the provided episodes. SKIP these characters entirely - do not generate relationship data for them.\n`
  }
  
  console.log(`    Found ${relevantScenes.length} scenes with interactions between ${context.character.name} and ${batch.join(', ')}`)
  
  return relevantScenes.map((s: any) => `
=== Episode ${s.episodeNumber}, Scene ${s.sceneNumber} ===
${s.heading || 'No heading'}
Location: ${s.location || 'Not specified'}
Time: ${s.time || 'Not specified'}
${s.preProdNotes ? `Pre-Production Notes: ${s.preProdNotes}\n` : ''}
${s.directorNotes ? `Director Notes: ${s.directorNotes}\n` : ''}
${s.characterNotes ? `Character Notes: ${s.characterNotes}\n` : ''}
${s.blocking ? `Blocking: ${s.blocking}\n` : ''}
SCENE CONTENT (from actual screenplay/episode):
${s.content}
`).join('\n---\n')
})()}

WARNING: Use ONLY the scenes above. All key moments MUST reference actual scenes listed above. DO NOT invent interactions.

CONTEXT: ${context.genre} series across ${context.episodeNumbers.length} episodes

Generate relationship map for ONLY these ${batch.length} characters in JSON format:

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

Be EXTREMELY detailed. Focus on PLAYABLE dynamics an actor can use. Return ONLY the relationshipMap array for these ${batch.length} characters.`

      try {
        const response = await generateContent(userPrompt, {
          systemPrompt,
          model: 'gpt-4.1',
          temperature: 0.5,
          maxTokens: 12000 // Reduced per batch to avoid parsing errors
        })
        
        try {
          const parsed = cleanAndParseJSON(response)
          
          // Handle both formats: array directly or object with relationshipMap property
          let relationshipArray: any[] = []
          
          if (Array.isArray(parsed)) {
            // AI returned array directly
            relationshipArray = parsed
            console.log(`    ✅ Batch ${batchNumber} generated ${relationshipArray.length} relationships (array format)`)
          } else if (parsed.relationshipMap && Array.isArray(parsed.relationshipMap)) {
            // AI returned object with relationshipMap property
            relationshipArray = parsed.relationshipMap
            console.log(`    ✅ Batch ${batchNumber} generated ${relationshipArray.length} relationships (object format)`)
          } else {
            console.warn(`    ⚠️ Batch ${batchNumber} returned no relationshipMap or invalid format`)
            console.warn(`    Response type:`, Array.isArray(parsed) ? 'array' : typeof parsed)
            console.warn(`    Response keys:`, parsed && typeof parsed === 'object' ? Object.keys(parsed) : 'null')
            console.warn(`    Response preview:`, JSON.stringify(parsed).substring(0, 200))
          }
          
          if (relationshipArray.length > 0) {
            // Filter relationships to only include story bible characters
            const validRelationships = relationshipArray
              .filter((rel: any) => {
                const charName = rel.characterName || rel.character || ''
                if (!charName || charName.trim().length === 0) return false
                
                // Filter out script directions and invalid names
                const invalidNames = ['CUT TO:', 'FADE IN:', 'FADE OUT:', 'INT.', 'EXT.', 'THWACK.', 'SQUEAK.', 'THUD.', 'PING.']
                if (invalidNames.some(invalid => charName.toUpperCase().includes(invalid))) return false
                
                // Check if character name matches a story bible character (use the helper function)
                const matchesStoryBible = findStoryBibleMatch(charName) !== null
                
                if (!matchesStoryBible) {
                  console.log(`    ⚠️ Filtered out relationship with "${charName}" (not in story bible)`)
                }
                
                return matchesStoryBible
              })
              .map((rel: any) => {
                // Normalize character names to match story bible names
                const charName = rel.characterName || rel.character || ''
                const sbMatch = findStoryBibleMatch(charName)
                if (sbMatch) {
                  return { ...rel, characterName: sbMatch }
                }
                return rel
              })
            
            if (validRelationships.length < relationshipArray.length) {
              console.log(`    ⚠️ Filtered out ${relationshipArray.length - validRelationships.length} relationships (not in story bible or invalid)`)
            }
            
            allRelationships.push(...validRelationships)
          }
          
          // Merge summaries (take first non-empty values or combine)
          if (parsed.relationshipSummary) {
            if (parsed.relationshipSummary.primaryAllies) relationshipSummary.primaryAllies.push(...parsed.relationshipSummary.primaryAllies)
            if (parsed.relationshipSummary.primaryConflicts) relationshipSummary.primaryConflicts.push(...parsed.relationshipSummary.primaryConflicts)
            if (parsed.relationshipSummary.romanticInterests) relationshipSummary.romanticInterests.push(...parsed.relationshipSummary.romanticInterests)
            if (parsed.relationshipSummary.familyConnections) relationshipSummary.familyConnections.push(...parsed.relationshipSummary.familyConnections)
            if (parsed.relationshipSummary.mentorFigures) relationshipSummary.mentorFigures.push(...parsed.relationshipSummary.mentorFigures)
            if (parsed.relationshipSummary.complexDynamics) relationshipSummary.complexDynamics.push(...parsed.relationshipSummary.complexDynamics)
          }
          
          if (parsed.socialCircle) {
            if (parsed.socialCircle.innerCircle) socialCircle.innerCircle.push(...parsed.socialCircle.innerCircle)
            if (parsed.socialCircle.outerCircle) socialCircle.outerCircle.push(...parsed.socialCircle.outerCircle)
            if (parsed.socialCircle.adversaries) socialCircle.adversaries.push(...parsed.socialCircle.adversaries)
            if (parsed.socialCircle.unknownQuantities) socialCircle.unknownQuantities.push(...parsed.socialCircle.unknownQuantities)
          }
          
          if (parsed.loyaltyMap) {
            if (parsed.loyaltyMap.mostLoyal && !loyaltyMap.mostLoyal) loyaltyMap.mostLoyal = parsed.loyaltyMap.mostLoyal
            if (parsed.loyaltyMap.conditional) loyaltyMap.conditional.push(...parsed.loyaltyMap.conditional)
            if (parsed.loyaltyMap.wouldBetray) loyaltyMap.wouldBetray.push(...parsed.loyaltyMap.wouldBetray)
          }
        } catch (parseError: any) {
          console.error(`❌ JSON parse error in batch ${batchNumber}:`, parseError.message)
          console.error(`    Characters in batch: ${batch.join(', ')}`)
          console.error(`    Response preview:`, response.substring(0, 500))
          // Continue with next batch even if this one fails
        }
      } catch (error) {
        console.error(`❌ Error generating batch ${batchNumber}:`, error)
        // Continue with next batch
      }
    }

    // Return combined results
    console.log(`  ✅ Relationship generation complete for ${context.character.name}:`, {
      totalRelationships: allRelationships.length,
      relationshipTypes: allRelationships.length > 0 ? allRelationships.map((r: any) => r.relationshipType || 'unknown').join(', ') : 'none',
      characterNames: allRelationships.length > 0 ? allRelationships.map((r: any) => r.characterName || 'unknown').join(', ') : 'none'
    })
    
      if (allRelationships.length === 0) {
        console.warn(`  ⚠️ WARNING: No relationships generated for ${context.character.name} despite ${uniqueOtherCharacters.length} other story bible characters found`)
        console.warn(`  ⚠️ This may indicate:`)
        console.warn(`    - Scene filtering too strict (characters not found in scene text)`)
        console.warn(`    - AI returned empty relationshipMap`)
        console.warn(`    - JSON parsing failed for all batches`)
      }
    
    return {
      relationshipMap: allRelationships,
      relationshipSummary,
      socialCircle,
      loyaltyMap
    }
  }

  // Original single-call approach for 6 or fewer characters
  const userPrompt = `WARNING: CRITICAL: Base ALL relationship analysis ONLY on the actual scenes provided below. DO NOT invent interactions or dynamics not shown in the scenes.

Generate a COMPREHENSIVE relationship map for "${context.character.name}" with ALL other characters in the story.

CHARACTER: ${context.character.name}
Description: ${context.character.description}

OTHER CHARACTERS THAT APPEAR IN SCENES WITH ${context.character.name}: ${context.otherCharacters.length > 0 ? context.otherCharacters.join(', ') : 'NONE - This character appears alone in all scenes'}

WARNING: CRITICAL: Only analyze relationships with characters listed above. Do NOT include characters that don't appear in the scenes below. If no characters are listed above, return an empty relationshipMap array.

ALL SCENES WITH THIS CHARACTER (${context.scenes.length} scenes):
${context.scenes.map((s: any) => `
=== Episode ${s.episodeNumber}, Scene ${s.sceneNumber} ===
${s.heading || 'No heading'}
${s.preProdNotes ? `Pre-Production Notes: ${s.preProdNotes}\n` : ''}
${s.directorNotes ? `Director Notes: ${s.directorNotes}\n` : ''}
${s.characterNotes ? `Character Notes: ${s.characterNotes}\n` : ''}
SCENE CONTENT:
${s.content}
`).join('\n---\n')}

WARNING: Use ONLY the scenes above. All key moments MUST reference actual scenes listed above. DO NOT invent interactions.

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
    "wouldBetray": ["Who they'd definitely betray"]
  }
}

WARNING: REMEMBER:
- Use ONLY information from the scenes provided above
- Only include relationships for characters that appear in the scenes above
- If ${context.otherCharacters.length === 0 ? 'no other characters appear in scenes' : 'a character is listed above but has no scenes with them'}, DO NOT generate relationship data for them - skip them entirely or return empty relationshipMap
- All key moments MUST reference actual scenes and episodes listed above
- All relationship descriptions MUST be based on actual interactions in the scenes
- DO NOT invent relationship dynamics not shown in the provided scenes
- If a relationship is not shown in scenes, DO NOT include it in the relationshipMap array

Be EXTREMELY detailed. This is the most important material for the actor. Include ONLY characters they actually interact with in the provided scenes. Focus on PLAYABLE dynamics an actor can use based on what is actually shown in the scenes.`

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
      
      // Handle both formats: array directly or object with relationshipMap property
      let relationshipMap: any[] = []
      
      if (Array.isArray(parsed)) {
        // AI returned array directly
        relationshipMap = parsed
        console.log(`  ✅ Generated ${relationshipMap.length} relationships (array format)`)
      } else if (parsed.relationshipMap && Array.isArray(parsed.relationshipMap)) {
        // AI returned object with relationshipMap property
        relationshipMap = parsed.relationshipMap
        console.log(`  ✅ Generated ${relationshipMap.length} relationships (object format)`)
      } else {
        console.warn(`  ⚠️ No relationshipMap found in response`)
        console.warn(`  Response type:`, Array.isArray(parsed) ? 'array' : typeof parsed)
        console.warn(`  Response keys:`, parsed && typeof parsed === 'object' ? Object.keys(parsed) : 'null')
      }
      
      // Filter relationships to only include story bible characters
      if (relationshipMap.length > 0) {
        const storyBibleCharacters = storyBible.mainCharacters || []
        
        // Helper function for flexible name matching
        const namesMatch = (name1: string, name2: string): boolean => {
          if (!name1 || !name2) return false
          const norm1 = name1.toLowerCase().trim().replace(/\s+/g, ' ')
          const norm2 = name2.toLowerCase().trim().replace(/\s+/g, ' ')
          if (norm1 === norm2) return true
          if (norm1.includes(norm2) || norm2.includes(norm1)) {
            const shorter = norm1.length < norm2.length ? norm1 : norm2
            if (shorter.length >= 3) return true
          }
          const first1 = norm1.split(' ')[0]
          const first2 = norm2.split(' ')[0]
          if (first1 === first2 && first1.length >= 3) return true
          return false
        }
        
        // Helper to find matching story bible character
        const findStoryBibleMatch = (charName: string): string | null => {
          const matchingSBChar = storyBibleCharacters.find((sbChar: any) => 
            namesMatch(charName, sbChar.name)
          )
          return matchingSBChar?.name || null
        }
        
        const invalidNames = ['CUT TO:', 'FADE IN:', 'FADE OUT:', 'INT.', 'EXT.', 'THWACK.', 'SQUEAK.', 'THUD.', 'PING.', 'BLINDING WHITE.']
        const validRelationships = relationshipMap
          .filter((rel: any) => {
            const charName = rel.characterName || rel.character || ''
            if (!charName || charName.trim().length === 0) return false
            
            // Filter out script directions and invalid names
            if (invalidNames.some(invalid => charName.toUpperCase().includes(invalid))) return false
            if (/^[A-Z\s]{1,3}\.$/.test(charName.trim())) return false
            
            // Check if character name matches a story bible character
            const matchesStoryBible = findStoryBibleMatch(charName) !== null
            
            if (!matchesStoryBible) {
              console.log(`  ⚠️ Filtered out relationship with "${charName}" (not in story bible)`)
            }
            
            return matchesStoryBible
          })
          .map((rel: any) => {
            // Normalize character names to match story bible names
            const charName = rel.characterName || rel.character || ''
            const sbMatch = findStoryBibleMatch(charName)
            if (sbMatch) {
              return { ...rel, characterName: sbMatch }
            }
            return rel
          })
        
        if (validRelationships.length < relationshipMap.length) {
          console.log(`  ⚠️ Filtered out ${relationshipMap.length - validRelationships.length} relationships (not in story bible or invalid)`)
        }
        
        relationshipMap = validRelationships
      }
      
      return {
        relationshipMap,
        relationshipSummary: parsed.relationshipSummary || {},
        socialCircle: parsed.socialCircle || {},
        loyaltyMap: parsed.loyaltyMap || {}
      }
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

CRITICAL: USE ONLY PROVIDED CONTEXT
- Base ALL practice materials ONLY on the scenes, dialogue, and character data provided
- All monologues MUST be actual dialogue from the provided scenes
- All key scenes MUST reference actual scenes provided
- DO NOT invent scenes, dialogue, or character moments not in the provided context
- If information is not provided, state that it's not available rather than inventing it

CRITICAL JSON FORMATTING REQUIREMENTS:
- Return ONLY valid JSON, no markdown code blocks, no explanations
- Every array element MUST be separated by commas: ["item1", "item2", "item3"]
- Every object property MUST be separated by commas: {"key1": "value1", "key2": "value2"}
- No trailing commas before closing brackets or braces
- All strings must be properly quoted with double quotes
- All special characters in strings must be escaped (\\n, \\t, \\", etc.)
- Ensure proper nesting - every opening { must have a closing }, every [ must have a ]
- Validate your JSON before returning it`

  const userPrompt = `WARNING: CRITICAL: Base ALL practice materials ONLY on the actual scenes and dialogue provided below. DO NOT invent monologues, scenes, or moments not present in the provided context.

Generate comprehensive practice and preparation materials for "${context.character.name}" in a ${context.genre} series.

CHARACTER: ${context.character.name}
Description: ${context.character.description}

ALL SCENES WITH THIS CHARACTER (${context.scenes.length} scenes):
${context.scenes.map((s: any) => `
=== Episode ${s.episodeNumber}, Scene ${s.sceneNumber} ===
${s.heading || 'No heading'}
SCENE CONTENT:
${s.content}
`).join('\n---\n')}

EXACT DIALOGUE FROM SCENES (use these exact quotes for monologues):
${context.dialogue.length > 0 ? context.dialogue.map((line: string, i: number) => `${i + 1}. "${line}"`).join('\n') : 'WARNING: No dialogue found - character may not speak in provided scenes'}

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

WARNING: REMEMBER:
- Use ONLY information from the scenes and dialogue provided above
- All monologues MUST be exact quotes from the dialogue above
- All key scenes MUST reference actual scenes listed above
- DO NOT invent scenes, dialogue, or character moments not in the provided context
- Base all practice materials on what is actually shown in the scenes

Be specific, detailed, and practical. Base everything on professional actor training and the actual scenes provided.`

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
