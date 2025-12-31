/**
 * Investor Materials Service
 * Aggregates data from Story Bible, Episodes, Pre-Production, Marketing, and Actor Materials
 * to create comprehensive investor pitch packages
 */

import { getStoryBible } from './story-bible-service'
import { getEpisodesForStoryBible } from './episode-service'
import { 
  getEpisodePreProduction, 
  getArcPreProduction,
  getEpisodeRangeForArc 
} from './preproduction-firestore'
import { getActorMaterials } from './actor-materials-firestore'
import { generateContentWithGemini } from '@/services/gemini-ai'
import type { 
  InvestorMaterialsPackage,
  EpisodeSummary,
  SceneStructureItem,
  StoryboardFrame,
  CharacterProfile,
  RelationshipMap,
  SceneExcerpt,
  BudgetSummary,
  LocationSummary,
  PropSummary,
  CastingSummary,
  PilotSection,
  MarketingSection,
  EpisodeMarketingData
} from '@/types/investor-materials'

/**
 * Generate complete investor materials package for an arc
 */
export async function generateInvestorPackage(
  userId: string,
  storyBibleId: string,
  arcIndex: number,
  customization?: { whyYou?: string }
): Promise<{ package: InvestorMaterialsPackage; errors: string[]; warnings: string[] }> {
  const errors: string[] = []
  const warnings: string[] = []
  
  try {
    // 1. Get Story Bible
    const storyBible = await getStoryBible(storyBibleId, userId)
    if (!storyBible) {
      throw new Error('Story Bible not found')
    }
    
    // 2. Get Arc information
    const arc = storyBible.narrativeArcs?.[arcIndex]
    if (!arc) {
      throw new Error(`Arc ${arcIndex} not found in Story Bible`)
    }
    
    const arcTitle = arc.title || `Arc ${arcIndex + 1}`
    const episodeNumbers = getEpisodeRangeForArc(storyBible, arcIndex)
    
    // 3. Get Episodes
    const episodesRecord = await getEpisodesForStoryBible(storyBibleId, userId)
    // Convert Record<number, Episode> to array
    const episodesArray = Object.values(episodesRecord)
    const arcEpisodes = episodeNumbers
      .map(epNum => episodesArray.find(e => e.episodeNumber === epNum))
      .filter(Boolean)
    
    if (arcEpisodes.length === 0) {
      errors.push('No episodes found for this arc')
    }
    
    // 4. Get Pre-Production data for ALL episodes in the arc
    const allEpisodePreProd: Record<number, any> = {}
    for (const epNum of episodeNumbers) {
      try {
        console.log(`📦 [GENERATE INVESTOR PACKAGE] Fetching pre-production for Episode ${epNum}...`)
        const preProd = await getEpisodePreProduction(userId, storyBibleId, epNum)
        if (preProd) {
          // CRITICAL: Directly check the raw data structure
          console.log(`📦 [GENERATE INVESTOR PACKAGE] Episode ${epNum} raw data keys:`, Object.keys(preProd))
          console.log(`📦 [GENERATE INVESTOR PACKAGE] Episode ${epNum} has storyboards:`, !!preProd.storyboards)
          
          // Cast to any to access storyboards
          const storyboards = (preProd as any).storyboards
          if (storyboards && storyboards.scenes) {
            const totalFrames = storyboards.scenes.reduce((sum: number, s: any) => 
              sum + (Array.isArray(s.frames) ? s.frames.length : 0), 0
            )
            
            // Check EVERY frame for images
            let framesWithImages = 0
            storyboards.scenes.forEach((scene: any) => {
              if (!Array.isArray(scene.frames)) return
              scene.frames.forEach((f: any) => {
                const hasImage = f.frameImage && typeof f.frameImage === 'string' && f.frameImage.trim().length > 0
                if (hasImage) {
                  framesWithImages++
                  console.log(`  ✅ [GENERATE INVESTOR PACKAGE] Episode ${epNum} - Found frameImage in Scene ${scene.sceneNumber}, Frame ${f.id}:`, {
                    frameId: f.id,
                    sceneNumber: scene.sceneNumber,
                    shotNumber: f.shotNumber,
                    frameImageLength: f.frameImage.length,
                    frameImagePreview: f.frameImage.substring(0, 100),
                    isStorageUrl: f.frameImage.startsWith('https://firebasestorage.googleapis.com/') || f.frameImage.startsWith('https://storage.googleapis.com/')
                  })
                } else {
                  console.warn(`  ⚠️  [GENERATE INVESTOR PACKAGE] Episode ${epNum} - Frame ${f.id} has NO frameImage`, {
                    frameId: f.id,
                    sceneNumber: scene.sceneNumber,
                    shotNumber: f.shotNumber,
                    frameKeys: Object.keys(f),
                    hasFrameImage: !!f.frameImage,
                    frameImageType: typeof f.frameImage,
                    frameImageValue: f.frameImage
                  })
                }
              })
            })
            
            console.log(`📦 [GENERATE INVESTOR PACKAGE] Episode ${epNum} pre-production loaded: ${totalFrames} frames, ${framesWithImages} with images`)
          } else {
            console.warn(`⚠️  [GENERATE INVESTOR PACKAGE] Episode ${epNum} pre-production has no storyboards or scenes`)
          }
          allEpisodePreProd[epNum] = preProd
        } else {
          console.warn(`⚠️  [GENERATE INVESTOR PACKAGE] Episode ${epNum} pre-production returned null`)
        }
      } catch (e) {
        // Continue - pre-production data is optional for individual episodes
        console.error(`❌ [GENERATE INVESTOR PACKAGE] Error fetching Episode ${epNum} pre-production:`, e)
        warnings.push(`Pre-Production data not found for Episode ${epNum}`)
      }
    }
    
    // Episode 1 pre-production is required for pilot script
    const episode1PreProd = allEpisodePreProd[1]
    if (!episode1PreProd) {
      errors.push('Pre-Production data for Episode 1 is required')
    }
    
    // 5. Get Arc-level Pre-Production (for marketing, etc.)
    const arcPreProd = await getArcPreProduction(userId, storyBibleId, arcIndex)
    
    // 6. Get Actor Materials (optional)
    let actorMaterials = null
    try {
      actorMaterials = await getActorMaterials(userId, storyBibleId, arcIndex)
    } catch (e) {
      warnings.push('Actor materials not found (optional)')
    }
    
    // 7. Extract characters first (needed for synopsis generation)
    // Pass actorMaterials to merge data
    const charactersData = extractCharacters(storyBible, actorMaterials)
    
    // 8. Extract scripts for ALL episodes in the arc
    const episodeScripts: Record<number, PilotSection> = {}
    for (const epNum of episodeNumbers) {
      const episode = arcEpisodes.find((e: any) => e && e.episodeNumber === epNum)
      const preProd = allEpisodePreProd[epNum]
      if (episode && preProd) {
        try {
          episodeScripts[epNum] = extractPilot(episode, preProd)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          warnings.push(`Failed to extract script for Episode ${epNum}: ${errorMessage}`)
        }
      }
    }
    
    // Build the package (with async AI generation)
    const pitchPackage: InvestorMaterialsPackage = {
      id: `investor-${storyBibleId}-arc${arcIndex}-${Date.now()}`,
      storyBibleId,
      arcIndex,
      arcTitle,
      generatedAt: new Date().toISOString(),
      
      // Section 1: Hook (with AI-generated synopsis)
      hook: await extractHook(storyBible, storyBible.mainCharacters || []),
      
      // Section 2: Story
      story: extractStory(arc, arcEpisodes, storyBible),
      
      // Section 3: Pilot (Episode 1)
      pilot: extractPilot(arcEpisodes[0], episode1PreProd),
      
      // All episode scripts (for navigation)
      episodeScripts: Object.keys(episodeScripts).length > 0 ? episodeScripts : undefined,
      
      // Section 4: Visuals (aggregated from all episodes)
      visuals: extractVisuals(allEpisodePreProd, episodeNumbers, arcEpisodes),
      
      // Section 5: Characters
      characters: charactersData,
      
      // Section 6: Depth (with AI-generated theme exploration)
      depth: extractDepth(storyBible),
      
      // Section 7: Key Scenes
      keyScenes: extractKeyScenes(arcEpisodes, episodeNumbers),
      
      // Section 8: Production (aggregated from all episodes)
      production: extractProduction(allEpisodePreProd, arcPreProd, episodeNumbers, storyBible),
      
      // Section 9: Marketing
      marketing: extractMarketing(arcPreProd, storyBible, allEpisodePreProd, episodeNumbers),
      
      // Section 10: Character Depth (optional)
      characterDepth: actorMaterials ? extractCharacterDepth(actorMaterials) : undefined,
      
      // Section 11: Call to Action
      callToAction: {
        whyYou: customization?.whyYou,
        nextSteps: [
          'Schedule a call to discuss',
          'Learn more about the production process',
          'Invest in this series'
        ]
      },
      
      // Materials status
      materialsStatus: {
        storyBible: !!storyBible,
        episodes: arcEpisodes.length > 0,
        preProduction: !!episode1PreProd,
        marketing: !!(arcPreProd as any)?.marketing,
        actorMaterials: !!actorMaterials
      }
    }
    
    return { package: pitchPackage, errors, warnings }
  } catch (error: any) {
    errors.push(error.message || 'Failed to generate investor package')
    throw error
  }
}

// ============================================================================
// AI GENERATION HELPERS
// ============================================================================

/**
 * Generate a polished synopsis for the pitch materials
 */
async function generatePitchSynopsis(
  seriesTitle: string,
  logline: string,
  premise: string,
  characters: any[],
  theme: string
): Promise<string> {
  try {
    const characterNames = characters.slice(0, 5).map(c => c.name || c.characterName).filter(Boolean).join(', ')
    const characterDetails = characters.slice(0, 3).map(c => {
      const name = c.name || c.characterName || ''
      const role = c.role || c.archetype || ''
      return name ? `${name}${role ? ` (${role})` : ''}` : null
    }).filter(Boolean).join(', ')
    
    // Build a richer context from premise
    const contextText = premise && premise.length > 50 ? premise : 
                       (logline && logline.length > 50 ? logline : 'Not provided')
    
    const prompt = `You are a professional TV series pitch writer. Write a compelling, rich single-paragraph synopsis for a TV series pitch.

IMPORTANT: Do NOT simply repeat or rephrase the logline. Create a unique, expanded synopsis that tells the story in one comprehensive paragraph.

Series Title: ${seriesTitle}
Logline: ${logline}
Premise/Context: ${contextText}
Main Characters: ${characterDetails || characterNames || 'Not specified'}
Theme: ${theme || 'Not specified'}

Write a polished, engaging synopsis (ONE paragraph, 4-6 sentences) that:
- EXPANDS on the logline with specific details and context
- Introduces the main characters and their motivations
- Describes the central conflict and what's at stake
- Sets up the world and tone of the series
- Uses professional, pitch-ready language
- Creates intrigue without spoiling major plot points
- Is DISTINCT from the logline - it should read like a full synopsis, not a one-liner
- Is rich with content, well-crafted, and high quality

The synopsis must be a single, flowing paragraph that is substantially different from the logline. Return only the synopsis text, no additional commentary.`

    const systemPrompt = 'You are a professional TV series pitch writer specializing in creating compelling, rich single-paragraph synopses that expand on loglines. Your synopses are always unique, high-quality, and never simply repeat the logline.'

    // Use Gemini 3 Pro to generate synopsis
    console.log('🎬 [PITCH SYNOPSIS] Starting Gemini 3 generation...')
    console.log('  Series Title:', seriesTitle)
    console.log('  Logline:', logline)
    console.log('  Premise length:', premise?.length || 0)
    
    const synopsis = await generateContentWithGemini(
      systemPrompt,
      prompt,
      'gemini-3-pro-preview'
    )

    console.log('✅ [PITCH SYNOPSIS] Gemini response received')
    console.log('  Response length:', synopsis?.length || 0)
    console.log('  Response preview:', synopsis?.substring(0, 200) || 'empty')

    const trimmedSynopsis = synopsis?.trim() || ''
    
    // Validate that synopsis is actually different from logline
    // More lenient validation - just check it's substantial and not identical
    const isValidLength = trimmedSynopsis.length > 80 // Reduced from 100
    const isDifferentFromLogline = trimmedSynopsis.toLowerCase() !== logline.toLowerCase()
    // Check if synopsis is substantially longer than logline (at least 2x)
    const isSubstantiallyLonger = trimmedSynopsis.length > (logline.length * 2)
    // Check if it's not just the logline with minimal additions
    const isNotJustLogline = !trimmedSynopsis.toLowerCase().startsWith(logline.toLowerCase()) || 
                             trimmedSynopsis.length > (logline.length + 50)
    
    console.log('🔍 [PITCH SYNOPSIS] Validation:')
    console.log('  Length > 80:', isValidLength, `(${trimmedSynopsis.length})`)
    console.log('  Different from logline:', isDifferentFromLogline)
    console.log('  Substantially longer:', isSubstantiallyLonger, `(${trimmedSynopsis.length} vs ${logline.length})`)
    console.log('  Not just logline:', isNotJustLogline)
    
    // Accept if it's valid length and different, OR if it's substantially longer
    if (trimmedSynopsis && isValidLength && isDifferentFromLogline && (isSubstantiallyLonger || isNotJustLogline)) {
      console.log('✅ [PITCH SYNOPSIS] Validation passed, using generated synopsis')
      return trimmedSynopsis
    }
    
    console.warn('⚠️ [PITCH SYNOPSIS] Validation failed, using fallback')
    console.warn('  Generated synopsis:', trimmedSynopsis.substring(0, 200))
    console.warn('  Logline:', logline)
    
    // If validation fails, try to generate a better fallback
    if (premise && premise.length > 100 && premise !== logline) {
      console.log('  Using premise as fallback')
      return premise
    }
    
    // Last resort: create a basic synopsis from available data
    const fallbackSynopsis = `In ${seriesTitle}, ${logline} This series explores themes of ${theme || 'human nature'} through the lens of ${characterNames || 'its compelling characters'}, as they navigate complex challenges and discover what truly matters.`
    console.log('  Using constructed fallback')
    return fallbackSynopsis
  } catch (error) {
    console.error('❌ [PITCH SYNOPSIS] Error generating synopsis:', error)
    console.error('  Error details:', error instanceof Error ? error.message : String(error))
    console.error('  Stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    // Better fallback that's not just the logline
    if (premise && premise.length > 100 && premise !== logline) {
      console.log('  Using premise as error fallback')
      return premise
    }
    const errorFallback = `A compelling series that explores ${theme || 'the depths of human experience'} through the story of ${seriesTitle}.`
    console.log('  Using error fallback')
    return errorFallback
  }
}

/**
 * Generate polished theme exploration text
 */
async function generateThemeExploration(
  primaryTheme: string,
  whatItExplores: string,
  coreQuestions: string[]
): Promise<string> {
  try {
    const questionsText = coreQuestions.length > 0 
      ? `Core questions explored: ${coreQuestions.join(', ')}`
      : ''

    const prompt = `Write a polished, engaging exploration of a TV series theme for investor pitch materials.

Primary Theme: ${primaryTheme}
What It Explores: ${whatItExplores}
${questionsText}

Write 2-3 paragraphs that:
- Deeply explore the theme's significance
- Connect it to universal human experiences
- Explain why this theme matters now
- Use professional, thought-provoking language

Return only the exploration text, no additional commentary.`

    const systemPrompt = 'You are a professional TV series analyst and writer. Write insightful, polished theme explorations that demonstrate depth and cultural relevance.'

    // Use Gemini 3 Pro to generate theme exploration
    const exploration = await generateContentWithGemini(
      systemPrompt,
      prompt,
      'gemini-3-pro-preview'
    )

    return exploration.trim() || whatItExplores
  } catch (error) {
    console.error('Error generating theme exploration:', error)
    return whatItExplores || primaryTheme
  }
}

// ============================================================================
// EXTRACTION HELPERS
// ============================================================================

async function extractHook(storyBible: any, characters: any[]): Promise<any> {
  console.log('📋 [EXTRACT HOOK] Starting hook extraction...')
  const seriesTitle = storyBible.seriesTitle || 'Untitled Series'
  const logline = storyBible.logline || storyBible.synopsis || ''
  const genre = storyBible.genre || 'Drama'
  const theme = storyBible.theme || ''
  const premise = storyBible.premise?.premise || storyBible.seriesOverview || storyBible.synopsis || ''
  
  console.log('📋 [EXTRACT HOOK] Data extracted:')
  console.log('  Series Title:', seriesTitle)
  console.log('  Logline:', logline)
  console.log('  Characters count:', characters?.length || 0)
  console.log('  Theme:', theme)
  console.log('  Premise length:', premise?.length || 0)
  
  // Generate AI synopsis
  console.log('📋 [EXTRACT HOOK] Calling generatePitchSynopsis...')
  const synopsis = await generatePitchSynopsis(
    seriesTitle,
    logline,
    premise,
    characters,
    theme
  )
  
  console.log('📋 [EXTRACT HOOK] Synopsis generated:')
  console.log('  Length:', synopsis?.length || 0)
  console.log('  Preview:', synopsis?.substring(0, 150) || 'empty')

  return {
    seriesTitle,
    logline,
    genre,
    theme,
    synopsis
  }
}

function extractStory(arc: any, episodes: any[], storyBible: any) {
  const episodeSummaries: EpisodeSummary[] = episodes.map((ep, idx) => {
    // Extract summary from various possible fields
    const summary = ep.synopsis || ep.summary || ep.episodeSummary || 
                   (ep.scenes && ep.scenes.length > 0 ? ep.scenes[0]?.content?.substring(0, 200) : '') ||
                   `Episode ${ep.episodeNumber} of the arc`
    
    // Extract full episode content: scenes array with prose
    const scenes = ep.scenes && Array.isArray(ep.scenes) 
      ? ep.scenes.map((scene: any) => ({
          sceneNumber: scene.sceneNumber || 0,
          title: scene.title || scene.sceneTitle || `Scene ${scene.sceneNumber || 0}`,
          content: scene.content || scene.prose || scene.text || ''
        })).filter((s: any) => s.content) // Only include scenes with content
      : undefined
    
    // Extract episode rundown if available
    const episodeRundown = ep.episodeRundown || ep.rundown || ep.episodeSummary || undefined
    
    return {
      episodeNumber: ep.episodeNumber || idx + 1,
      title: ep.episodeTitle || ep.title || `Episode ${ep.episodeNumber || idx + 1}`,
      summary: summary,
      keyBeat: extractKeyBeat(ep),
      emotionalBeat: ep.emotionalBeat || ep.keyBeat || extractKeyBeat(ep),
      scenes: scenes,
      episodeRundown: episodeRundown
    }
  })
  
  // Determine transformation from actual episode data
  const firstEp = episodes[0]
  const lastEp = episodes[episodes.length - 1]
  
  const startBeat = firstEp ? extractKeyBeat(firstEp) : 'The journey begins'
  const endBeat = lastEp ? extractKeyBeat(lastEp) : 'The arc concludes'
  
  // Get arc transformation from arc data or story bible
  const arcTransformation = arc.progression?.premise || 
                           arc.transformation || 
                           arc.summary || 
                           storyBible.premise?.premise ||
                           'The journey from doubt to conviction'
  
  return {
    arcTitle: arc.title || 'Arc 1',
    arcDescription: arc.summary || arc.description || arc.progression?.premise || '',
    episodes: episodeSummaries,
    transformation: {
      start: firstEp ? `Episode ${firstEp.episodeNumber}: ${startBeat}` : 'The journey begins',
      end: lastEp ? `Episode ${lastEp.episodeNumber}: ${endBeat}` : 'The arc concludes',
      journey: arcTransformation
    }
  }
}

function extractKeyBeat(episode: any): string {
  // Try multiple sources for key beat
  if (episode.keyBeat) return episode.keyBeat
  if (episode.keyEvent) return episode.keyEvent
  if (episode.keyEvents && Array.isArray(episode.keyEvents) && episode.keyEvents.length > 0) {
    return episode.keyEvents[0]
  }
  
  // Try to extract from scenes
  if (episode.scenes && episode.scenes.length > 0) {
    const keyScene = episode.scenes[Math.floor(episode.scenes.length / 2)]
    if (keyScene?.content) {
      return keyScene.content.substring(0, 150).trim() + (keyScene.content.length > 150 ? '...' : '')
    }
    if (keyScene?.heading) {
      return keyScene.heading
    }
  }
  
  // Fallback to synopsis
  const synopsis = episode.synopsis || episode.summary || episode.episodeSummary
  if (synopsis) {
    return synopsis.substring(0, 150).trim() + (synopsis.length > 150 ? '...' : '')
  }
  
  return 'A pivotal moment in the arc'
}

function extractPilot(episode: any, preProd: any) {
  if (!episode) {
    return {
      episodeNumber: 1,
      episodeTitle: 'Episode 1',
      fullScript: '',
      sceneStructure: {
        totalScenes: 0,
        totalPages: 0,
        estimatedRuntime: 0,
        scenes: []
      }
    }
  }
  
  // Get script from pre-production - CORRECT PATH: scripts.fullScript
  const scriptObj = preProd?.scripts?.fullScript
  
  // Extract scene structure from script object or breakdown
  const scenes: SceneStructureItem[] = []
  let sceneCounter = 0
  
  if (scriptObj?.pages && Array.isArray(scriptObj.pages)) {
    scriptObj.pages.forEach((page: any) => {
      if (page.elements && Array.isArray(page.elements)) {
        page.elements.forEach((el: any) => {
          if (el.type === 'slug') {
            sceneCounter++
            const sceneHeading = el.content || ''
            scenes.push({
              sceneNumber: el.metadata?.sceneNumber || sceneCounter,
              heading: sceneHeading,
              pageCount: 1,
              synopsis: '',
              characters: []
            })
          } else if (el.type === 'character' && scenes.length > 0 && el.metadata?.characterName) {
            // Track characters in current scene
            const lastScene = scenes[scenes.length - 1]
            if (!lastScene.characters.includes(el.metadata.characterName)) {
              lastScene.characters.push(el.metadata.characterName)
            }
          }
        })
      }
    })
  }
  
  // Fallback: Try script breakdown if script object not found
  const scriptBreakdown = preProd?.scriptBreakdown || 
                         preProd?.breakdown ||
                         preProd?.script?.breakdown ||
                         preProd?.scripts?.breakdown
  
  // If no scenes extracted from script object, use breakdown
  if (scenes.length === 0 && scriptBreakdown?.scenes) {
    scriptBreakdown.scenes.forEach((scene: any, idx: number) => {
      scenes.push({
        sceneNumber: scene.sceneNumber || idx + 1,
        heading: scene.sceneTitle || scene.heading || `Scene ${idx + 1}`,
        pageCount: scene.pageCount || 1,
        synopsis: scene.synopsis || scene.description || '',
        characters: scene.characters?.map((c: any) => c.name || c) || []
      })
    })
  }
  
  // Final fallback: Use episode scenes if nothing else available
  if (scenes.length === 0 && episode.scenes) {
    episode.scenes.forEach((scene: any, idx: number) => {
      scenes.push({
        sceneNumber: scene.sceneNumber || idx + 1,
        heading: scene.heading || `Scene ${idx + 1}`,
        pageCount: 1,
        synopsis: scene.content?.substring(0, 200) || scene.description || '',
        characters: []
      })
    })
  }
  
  // Use metadata from script object if available
  const totalPages = scriptObj?.metadata?.pageCount || scenes.reduce((sum, s) => sum + s.pageCount, 0)
  const totalScenes = scriptObj?.metadata?.sceneCount || scenes.length
  const estimatedRuntime = scriptObj?.metadata?.estimatedRuntime 
    ? parseInt(scriptObj.metadata.estimatedRuntime.replace(/[^0-9]/g, '')) || Math.ceil(scenes.length * 1.5)
    : Math.ceil(scenes.length * 1.5)
  
  return {
    episodeNumber: episode.episodeNumber || 1,
    episodeTitle: episode.episodeTitle || episode.title || scriptObj?.title || 'Episode 1',
    fullScript: scriptObj || null, // Return the script object, not text
    sceneStructure: {
      totalScenes,
      totalPages,
      estimatedRuntime,
      scenes
    }
  }
}

function extractVisuals(allEpisodePreProd: Record<number, any>, episodeNumbers: number[], arcEpisodes: any[]): { episodes: Record<number, any>; totalFrames: number; storyboardFrames: StoryboardFrame[] } {
  const episodes: Record<number, any> = {}
  const allFrames: StoryboardFrame[] = []
  
  console.log('🎨 [EXTRACT VISUALS] Starting storyboard extraction...')
  console.log('🎨 [EXTRACT VISUALS] Pre-production data keys:', Object.keys(allEpisodePreProd))
  
  // Extract storyboards directly from pre-production, organized by episode → scene
  episodeNumbers.forEach(epNum => {
    const preProd = allEpisodePreProd[epNum]
    if (!preProd) {
      console.log(`  ⚠️  Episode ${epNum}: No pre-production data`)
      return
    }
    
    console.log(`  🔍 Episode ${epNum}: Inspecting pre-production data structure...`, {
      hasPreProd: !!preProd,
      preProdKeys: preProd ? Object.keys(preProd) : [],
      hasStoryboards: !!preProd.storyboards,
      storyboardsType: typeof preProd.storyboards,
      storyboardsKeys: preProd.storyboards ? Object.keys(preProd.storyboards) : []
    })
    
    // DIRECT PATH: storyboards is a StoryboardsData object with scenes property
    const storyboardsData = preProd?.storyboards
    
    if (!storyboardsData) {
      console.error(`  ❌ Episode ${epNum}: No storyboards data found in preProd`, {
        hasPreProd: !!preProd,
        preProdKeys: preProd ? Object.keys(preProd) : [],
        preProdString: JSON.stringify(preProd).substring(0, 500) // First 500 chars for debugging
      })
      return
    }
    
    // Access scenes array directly from storyboards object
    const scenes = storyboardsData.scenes || []
    
    console.log(`  📊 Episode ${epNum}: Storyboards data structure:`, {
      hasScenes: !!scenes,
      scenesType: typeof scenes,
      scenesIsArray: Array.isArray(scenes),
      scenesLength: Array.isArray(scenes) ? scenes.length : 'not array',
      storyboardsDataKeys: Object.keys(storyboardsData)
    })
    
    if (!Array.isArray(scenes) || scenes.length === 0) {
      console.log(`  ⚠️  Episode ${epNum}: No scenes in storyboards`, {
        hasStoryboardsData: !!storyboardsData,
        storyboardsDataKeys: storyboardsData ? Object.keys(storyboardsData) : [],
        scenesType: typeof scenes,
        scenesLength: Array.isArray(scenes) ? scenes.length : 'not array'
      })
      return
    }
    
    // Count total frames and frames with images before processing
    const totalFramesBefore = scenes.reduce((sum, s) => sum + (Array.isArray(s.frames) ? s.frames.length : 0), 0)
    const framesWithImagesBefore = scenes.reduce((sum, s) => {
      if (!Array.isArray(s.frames)) return sum
      return sum + s.frames.filter((f: any) => f.frameImage && typeof f.frameImage === 'string' && f.frameImage.length > 0).length
    }, 0)
    
    console.log(`  ✅ Episode ${epNum}: Found ${scenes.length} scenes with ${totalFramesBefore} total frames (${framesWithImagesBefore} with images)`)
    
    // Get episode title
    const episode = arcEpisodes.find((e: any) => e.episodeNumber === epNum)
    const episodeTitle = episode?.episodeTitle || episode?.title || storyboardsData.episodeTitle || `Episode ${epNum}`
    
    // Process scenes and keep every storyboard frame (preserve saved images)
    const processedScenes: Array<{ sceneNumber: number; sceneTitle: string; frames: StoryboardFrame[] }> = []
    
    scenes.forEach((scene: any, sceneIdx: number) => {
      const sceneFrames = Array.isArray(scene.frames) ? scene.frames : []
      
      if (sceneFrames.length === 0) {
        console.log(`    ⚠️  Scene ${scene.sceneNumber}: No frames`)
        return
      }
      
      // Log frame data before mapping - check ALL possible image fields
      console.log(`    📸 Scene ${scene.sceneNumber}: Processing ${sceneFrames.length} frames`)
      sceneFrames.forEach((frame: any, idx: number) => {
        // Check all possible image fields - be thorough
        const frameImage = frame.frameImage
        const imageUrl = frame.imageUrl
        const image = frame.image
        const referenceImages = frame.referenceImages
        
        // Check if frameImage exists and is valid
        const hasFrameImage = frameImage && typeof frameImage === 'string' && frameImage.trim().length > 0
        const hasImageUrl = imageUrl && typeof imageUrl === 'string' && imageUrl.trim().length > 0
        const hasImage = image && typeof image === 'string' && image.trim().length > 0
        const hasReferenceImages = Array.isArray(referenceImages) && referenceImages.length > 0
        
        // Also check for any other image-like fields
        const allKeys = Object.keys(frame)
        const imageLikeKeys = allKeys.filter(key => 
          key.toLowerCase().includes('image') || 
          key.toLowerCase().includes('url') ||
          key.toLowerCase().includes('photo') ||
          key.toLowerCase().includes('picture')
        )
        
        if (hasFrameImage) {
          const isStorageUrl = frameImage.trim().startsWith('https://firebasestorage.googleapis.com/') || 
                              frameImage.trim().startsWith('https://storage.googleapis.com/')
          const preview = frameImage.trim().substring(0, 80)
          console.log(`      ✅ Frame ${idx + 1} (${frame.id || 'no-id'}): Has frameImage (${isStorageUrl ? 'Storage URL ✅' : 'other format'}) - ${preview}...`)
        } else if (hasImageUrl) {
          const preview = imageUrl.trim().substring(0, 80)
          console.log(`      ✅ Frame ${idx + 1} (${frame.id || 'no-id'}): Has imageUrl (fallback) - ${preview}...`)
        } else if (hasImage) {
          const preview = image.trim().substring(0, 80)
          console.log(`      ✅ Frame ${idx + 1} (${frame.id || 'no-id'}): Has image (fallback) - ${preview}...`)
        } else if (hasReferenceImages) {
          console.log(`      ✅ Frame ${idx + 1} (${frame.id || 'no-id'}): Has referenceImages (${referenceImages.length} items)`)
        } else {
          console.warn(`      ⚠️  Frame ${idx + 1} (${frame.id || 'no-id'}): No image found - checked frameImage, imageUrl, image, referenceImages`)
          console.warn(`         Frame keys:`, allKeys)
          if (imageLikeKeys.length > 0) {
            console.warn(`         Found image-like keys (but empty):`, imageLikeKeys)
            imageLikeKeys.forEach(key => {
              const value = frame[key]
              console.warn(`           ${key}:`, typeof value, value ? String(value).substring(0, 50) : 'null/undefined')
            })
          }
        }
      })
      
      const mappedFrames = sceneFrames
        .map((frame: any, frameIdx: number): StoryboardFrame | null => {
          const mapped = mapStoryboardFrame(frame, {
            episodeNumber: epNum,
            fallbackSceneNumber: scene.sceneNumber || sceneIdx + 1,
            fallbackShotNumber: frameIdx + 1
          })
          
          if (!mapped) return null
          
          // CRITICAL: Validate image was preserved during mapping
          // Check ALL possible image sources and ensure at least one is preserved
          const originalImage = frame.frameImage || frame.imageUrl || frame.image || 
                                (Array.isArray(frame.referenceImages) && frame.referenceImages.length > 0 ? frame.referenceImages[0] : undefined)
          
          // Determine which field the image came from for logging
          const imageSource = frame.frameImage ? 'frameImage' : 
                             frame.imageUrl ? 'imageUrl' : 
                             frame.image ? 'image' : 
                             'referenceImages'
          
          if (originalImage && !mapped.imageUrl) {
            console.error(`❌ [EXTRACT VISUALS] IMAGE LOST: Frame ${frame.id || frameIdx} had image in ${imageSource} but mapped frame has no imageUrl`, {
              originalFrameImage: frame.frameImage ? String(frame.frameImage).substring(0, 100) : undefined,
              originalImageUrl: frame.imageUrl ? String(frame.imageUrl).substring(0, 100) : undefined,
              originalImage: frame.image ? String(frame.image).substring(0, 100) : undefined,
              originalReferenceImages: frame.referenceImages,
              resolvedOriginalImage: typeof originalImage === 'string' ? originalImage.substring(0, 100) : String(originalImage).substring(0, 100),
              mappedImageUrl: mapped.imageUrl,
              frameId: frame.id,
              sceneNumber: scene.sceneNumber,
              imageSource
            })
            
            // Try to recover by directly setting it - be more lenient with format validation
            if (typeof originalImage === 'string') {
              const trimmed = originalImage.trim()
              // Accept any non-empty string that's reasonably long (likely a URL or base64)
              if (trimmed.length > 0) {
                mapped.imageUrl = trimmed
                console.warn(`⚠️ [EXTRACT VISUALS] Recovered image from ${imageSource} for frame ${frame.id || frameIdx}`, {
                  imageLength: trimmed.length,
                  preview: trimmed.substring(0, 100)
                })
              }
            } else {
              // If it's not a string, try to convert it
              mapped.imageUrl = String(originalImage)
              console.warn(`⚠️ [EXTRACT VISUALS] Recovered image (converted to string) from ${imageSource} for frame ${frame.id || frameIdx}`)
            }
          }
          
          // Double-check: if we still don't have an imageUrl but originalImage exists, force it
          if (!mapped.imageUrl && originalImage) {
            const trimmed = typeof originalImage === 'string' ? originalImage.trim() : String(originalImage).trim()
            if (trimmed.length > 0) {
              mapped.imageUrl = trimmed
              console.warn(`⚠️ [EXTRACT VISUALS] Final recovery attempt: forced imageUrl from ${imageSource} for frame ${frame.id || frameIdx}`, {
                imageLength: trimmed.length,
                preview: trimmed.substring(0, 100)
              })
            }
          }
          
          return mapped
        })
        .filter((frame: StoryboardFrame | null): frame is StoryboardFrame => !!frame)
      
      // Log mapped frames - CRITICAL: Count frames that had images in source vs mapped
      // Check ALL possible image sources, not just frameImage
      const sourceFramesWithImages = sceneFrames.filter((f: any) => {
        const hasFrameImage = f.frameImage && typeof f.frameImage === 'string' && f.frameImage.trim().length > 0
        const hasImageUrl = f.imageUrl && typeof f.imageUrl === 'string' && f.imageUrl.trim().length > 0
        const hasImage = f.image && typeof f.image === 'string' && f.image.trim().length > 0
        const hasReferenceImages = Array.isArray(f.referenceImages) && f.referenceImages.length > 0
        return hasFrameImage || hasImageUrl || hasImage || hasReferenceImages
      }).length
      const mappedFramesWithImages = mappedFrames.filter((f: StoryboardFrame) => f.imageUrl).length
      
      if (sourceFramesWithImages > mappedFramesWithImages) {
        console.error(`❌ [EXTRACT VISUALS] IMAGE COUNT MISMATCH in Scene ${scene.sceneNumber}: Source had ${sourceFramesWithImages} images, mapped has ${mappedFramesWithImages}`)
      }
      
      console.log(`    ✅ Scene ${scene.sceneNumber}: Mapped ${mappedFrames.length} frames (${mappedFramesWithImages} with images, source had ${sourceFramesWithImages})`)
      
      if (mappedFrames.length > 0) {
        processedScenes.push({
          sceneNumber: scene.sceneNumber || sceneIdx + 1,
          sceneTitle: scene.sceneTitle || `Scene ${scene.sceneNumber || sceneIdx + 1}`,
          frames: mappedFrames
        })
        
        mappedFrames.forEach((mappedFrame: StoryboardFrame) => {
          allFrames.push(mappedFrame)
        })
      }
    })
    
    if (processedScenes.length > 0) {
      episodes[epNum] = {
        episodeNumber: epNum,
        episodeTitle,
        scenes: processedScenes
      }
    }
  })
  
  const totalFrames = allFrames.length
  const framesWithImages = allFrames.filter(f => f.imageUrl).length
  console.log(`✅ [EXTRACT VISUALS] Extracted ${totalFrames} storyboard frames (${framesWithImages} with images) across ${Object.keys(episodes).length} episodes`)
  
  // Log summary by episode
  Object.keys(episodes).forEach(epNum => {
    const ep = episodes[Number(epNum)]
    const epFramesWithImages = ep.scenes.reduce((sum: number, scene: any) => 
      sum + scene.frames.filter((f: StoryboardFrame) => f.imageUrl).length, 0
    )
    console.log(`  📊 Episode ${epNum}: ${ep.scenes.reduce((sum: number, s: any) => sum + s.frames.length, 0)} frames (${epFramesWithImages} with images)`)
  })
  
  return {
    episodes,
    totalFrames,
    storyboardFrames: allFrames // Backward compatibility
  }
}

interface MapStoryboardFrameOptions {
  episodeNumber: number
  fallbackSceneNumber: number
  fallbackShotNumber: number
}

function mapStoryboardFrame(frame: any, options: MapStoryboardFrameOptions): StoryboardFrame | null {
  if (!frame) return null
  
  const sceneNumber = typeof frame.sceneNumber === 'number'
    ? frame.sceneNumber
    : options.fallbackSceneNumber
  
  const parsedShotNumber = typeof frame.shotNumber === 'string'
    ? parseInt(frame.shotNumber, 10)
    : frame.shotNumber
  
  const shotNumber = Number.isFinite(parsedShotNumber)
    ? parsedShotNumber as number
    : options.fallbackShotNumber
  
  // Prioritize notes (script-accurate description) over generic description
  const description = frame.notes || frame.description || frame.visualDescription || frame.dialogueSnippet || ''
  // CRITICAL: frameImage from pre-production needs to be mapped to imageUrl for investor materials
  const imageUrl = frame.frameImage || frame.imageUrl || frame.image || 
                  (Array.isArray(frame.referenceImages) && frame.referenceImages.length > 0 ? frame.referenceImages[0] : undefined)
  
  // CRITICAL: Validate imageUrl was resolved - log if frame had frameImage but we lost it
  if (frame.frameImage && !imageUrl) {
    console.error(`❌ [MAP FRAME] IMAGE LOST during mapping! Frame ${frame.id || 'unknown'} had frameImage but imageUrl is undefined`, {
      frameId: frame.id,
      sceneNumber: frame.sceneNumber,
      shotNumber: frame.shotNumber,
      frameImage: frame.frameImage,
      frameImageType: typeof frame.frameImage,
      frameImageLength: frame.frameImage?.length || 0,
      resolvedImageUrl: imageUrl
    })
  }
  
  return {
    frameId: frame.id || frame.frameId || `${options.episodeNumber}-scene${sceneNumber}-shot${shotNumber}`,
    episodeNumber: options.episodeNumber,
    sceneNumber,
    shotNumber,
    description: description || frame.imagePrompt || 'Storyboard frame',
    cameraAngle: frame.cameraAngle || frame.angle || 'medium',
    cameraMovement: frame.cameraMovement || frame.movement || 'static',
    dialogueSnippet: frame.dialogueSnippet || frame.dialogue || undefined,
    scriptContext: frame.scriptContext || undefined, // Script action for this frame (orange)
    imageUrl, // CRITICAL: This MUST be set if frame.frameImage exists
    imagePrompt: frame.imagePrompt || frame.prompt || undefined,
    visualNotes: frame.visualNotes || (frame.notes && frame.notes !== description ? frame.notes : undefined),
    lightingNotes: frame.lightingNotes || undefined,
    frameStatus: frame.status || frame.frameStatus || undefined,
    // Include all additional fields from pre-production
    notes: frame.notes || undefined, // Script-accurate description
    propsInFrame: Array.isArray(frame.propsInFrame) && frame.propsInFrame.length > 0 ? frame.propsInFrame : undefined,
    referenceImages: Array.isArray(frame.referenceImages) && frame.referenceImages.length > 0 ? frame.referenceImages : undefined,
    referenceVideos: Array.isArray(frame.referenceVideos) && frame.referenceVideos.length > 0 ? frame.referenceVideos : undefined
  }
}

function resolveStoryboardImageUrl(frame: any): string | undefined {
  // CRITICAL: Check ALL possible image fields and return the first valid one
  // Order of priority: frameImage > imageUrl > image > referenceImages[0]
  
  const imageCandidates = [
    { field: 'frameImage', value: frame.frameImage },
    { field: 'imageUrl', value: frame.imageUrl },
    { field: 'image', value: frame.image },
    { field: 'referenceImages[0]', value: Array.isArray(frame.referenceImages) && frame.referenceImages.length > 0 ? frame.referenceImages[0] : undefined }
  ]
  
  for (const candidate of imageCandidates) {
    if (candidate.value && typeof candidate.value === 'string') {
      const trimmed = candidate.value.trim()
      
      // Accept any non-empty string that looks like a URL or data URL
      // Be more lenient - if it's a string and has reasonable length, accept it
      if (trimmed.length > 0) {
        // Check if it's a valid URL format (http/https/data/blob) OR if it's a long string (likely base64 or URL)
        const isValidUrl = trimmed.startsWith('http') || 
                          trimmed.startsWith('data:') || 
                          trimmed.startsWith('blob:') ||
                          trimmed.length > 50 // Accept long strings as they might be base64 or URLs without protocol
        
        if (isValidUrl) {
          const isStorageUrl = trimmed.startsWith('https://firebasestorage.googleapis.com/') || 
                              trimmed.startsWith('https://storage.googleapis.com/')
          const imageType = isStorageUrl 
            ? 'Firebase Storage URL' 
            : trimmed.startsWith('data:') 
            ? 'base64' 
            : trimmed.startsWith('blob:')
            ? 'blob URL'
            : trimmed.startsWith('http')
            ? 'external URL'
            : 'unknown format (long string)'
          
          console.log(`✅ [RESOLVE IMAGE URL] Using ${candidate.field} for frame ${frame.id || 'unknown'}:`, {
            type: imageType,
            length: trimmed.length,
            preview: trimmed.substring(0, 100)
          })
          return trimmed
        } else {
          console.warn(`⚠️ [RESOLVE IMAGE URL] ${candidate.field} exists but seems invalid for frame ${frame.id || 'unknown'}:`, {
            preview: trimmed.substring(0, 100),
            length: trimmed.length
          })
        }
      }
    }
  }
  
  // Log for debugging if no image found
  if (frame.id) {
    console.error(`❌ [RESOLVE IMAGE URL] NO IMAGE FOUND for frame ${frame.id} (Scene ${frame.sceneNumber}, Shot ${frame.shotNumber})`, {
      hasFrameImage: !!frame.frameImage,
      frameImageValue: frame.frameImage ? String(frame.frameImage).substring(0, 100) : undefined,
      frameImageType: typeof frame.frameImage,
      frameImageLength: frame.frameImage?.length || 0,
      hasImageUrl: !!frame.imageUrl,
      imageUrlValue: frame.imageUrl ? String(frame.imageUrl).substring(0, 100) : undefined,
      hasImage: !!frame.image,
      imageValue: frame.image ? String(frame.image).substring(0, 100) : undefined,
      hasReferenceImages: Array.isArray(frame.referenceImages) && frame.referenceImages.length > 0,
      referenceImagesCount: Array.isArray(frame.referenceImages) ? frame.referenceImages.length : 0,
      allFrameKeys: Object.keys(frame)
    })
  }
  
  return undefined
}

function extractCharacters(storyBible: any, actorMaterials: any): { mainCharacters: CharacterProfile[]; relationshipMap: RelationshipMap[] } {
  const characters = storyBible.mainCharacters || []
  
  if (characters.length === 0) {
    return {
      mainCharacters: [],
      relationshipMap: []
    }
  }
  
  // Helper to normalize character names for matching
  const normalizeName = (name: string): string => {
    return name.toLowerCase().trim().replace(/\s+/g, ' ')
  }
  
  // Helper to find actor materials for a character
  const findActorMaterials = (charName: string) => {
    if (!actorMaterials?.characters) return null
    const normalized = normalizeName(charName)
    return actorMaterials.characters.find((am: any) => 
      normalizeName(am.characterName || '') === normalized
    ) || null
  }
  
  // Extract all main characters (no limit)
  const mainChars = characters.map((char: any) => {
    const charName = char.name || 'Unnamed Character'
    const actorMat = findActorMaterials(charName)
    
    // Extract background from multiple possible fields
    let background = char.background || 
                    char.description || 
                    char.bio || 
                    char.backstory ||
                    (char.characterProfile?.background) ||
                    ''
    
    // Enhance background with actor materials context if available
    if (actorMat?.studyGuide?.background) {
      background = background ? `${background} ${actorMat.studyGuide.background}` : actorMat.studyGuide.background
    }
    
    // Extract motivation
    let motivation = char.motivation || 
                    char.goal || 
                    char.want ||
                    (char.characterProfile?.motivation) ||
                    ''
    
    // Enhance with through line super objective
    if (actorMat?.throughLine?.superObjective) {
      motivation = motivation ? `${motivation} Their super objective: ${actorMat.throughLine.superObjective}` : actorMat.throughLine.superObjective
    }
    
    // Extract arc
    let arc = char.arc || 
             char.characterArc || 
             char.growth ||
             (char.characterProfile?.arc) ||
             ''
    
    // Enhance arc with through line explanation if available
    if (actorMat?.throughLine?.explanation) {
      arc = arc ? `${arc} ${actorMat.throughLine.explanation}` : actorMat.throughLine.explanation
    }
    
    // Extract conflicts
    let conflicts: string[] = []
    if (Array.isArray(char.conflicts)) {
      conflicts = char.conflicts
    } else if (char.conflict) {
      conflicts = [char.conflict]
    } else if (char.obstacles && Array.isArray(char.obstacles)) {
      conflicts = char.obstacles
    }
    
    // Extract traits
    let traits: string[] = []
    if (Array.isArray(char.traits)) {
      traits = char.traits
    } else if (char.keyTraits && Array.isArray(char.keyTraits)) {
      traits = char.keyTraits
    } else if (char.personality && Array.isArray(char.personality)) {
      traits = char.personality
    }
    
    // Build image prompt for cinematic character portrait
    const physicalDesc = char.physicalDescription || char.description || char.background || ''
    const imagePrompt = `Cinematic portrait of ${charName}, ${char.role || 'character'}. ${physicalDesc.substring(0, 200)}. ${background.substring(0, 150)}. Moody lighting, dramatic composition, film still, character study, professional photography, cinematic style`
    
    // Extract character image from story bible visualReference
    const imageUrl = char.visualReference?.imageUrl || undefined
    
    // Extract ALL Actor Materials data (complete mapping)
    const studyGuide = actorMat?.studyGuide ? {
      background: actorMat.studyGuide.background || '',
      motivations: actorMat.studyGuide.motivations || [],
      relationships: actorMat.studyGuide.relationships || [],
      characterArc: actorMat.studyGuide.characterArc || '',
      internalConflicts: actorMat.studyGuide.internalConflicts || []
    } : undefined
    
    const performanceReference = actorMat?.performanceReference || undefined
    
    const throughLine = actorMat?.throughLine ? {
      superObjective: actorMat.throughLine.superObjective || '',
      explanation: actorMat.throughLine.explanation || '',
      keyScenes: actorMat.throughLine.keyScenes || []
    } : undefined
    
    const gotAnalysis = actorMat?.gotAnalysis || undefined
    const relationshipMapActor = actorMat?.relationshipMap || undefined
    const sceneBreakdowns = actorMat?.sceneBreakdowns || undefined
    const emotionalBeats = actorMat?.emotionalBeats || undefined
    
    const physicalWork = actorMat?.physicalWork ? {
      bodyLanguage: Array.isArray(actorMat.physicalWork.bodyLanguage) ? actorMat.physicalWork.bodyLanguage : [],
      movement: Array.isArray(actorMat.physicalWork.movement) ? actorMat.physicalWork.movement : [],
      posture: Array.isArray(actorMat.physicalWork.posture) ? actorMat.physicalWork.posture : [],
      transformationNotes: actorMat.physicalWork.transformationNotes
    } : undefined
    
    const voicePatterns = actorMat?.voicePatterns ? {
      vocabulary: Array.isArray(actorMat.voicePatterns.vocabulary) ? actorMat.voicePatterns.vocabulary : [],
      rhythm: actorMat.voicePatterns.rhythm || '',
      accent: actorMat.voicePatterns.accent,
      keyPhrases: Array.isArray(actorMat.voicePatterns.keyPhrases) ? actorMat.voicePatterns.keyPhrases : [],
      verbalTics: Array.isArray(actorMat.voicePatterns.verbalTics) ? actorMat.voicePatterns.verbalTics : undefined
    } : undefined
    
    const monologues = actorMat?.monologues || undefined
    const keyScenes = actorMat?.keyScenes || undefined
    const onSetPrep = actorMat?.onSetPrep ? {
      preScene: Array.isArray(actorMat.onSetPrep.preScene) ? actorMat.onSetPrep.preScene : [],
      warmUp: Array.isArray(actorMat.onSetPrep.warmUp) ? actorMat.onSetPrep.warmUp : [],
      emotionalPrep: Array.isArray(actorMat.onSetPrep.emotionalPrep) ? actorMat.onSetPrep.emotionalPrep : [],
      mentalChecklist: Array.isArray(actorMat.onSetPrep.mentalChecklist) ? actorMat.onSetPrep.mentalChecklist : []
    } : undefined
    
    const researchSuggestions = actorMat?.researchSuggestions || undefined
    const wardrobeNotes = actorMat?.wardrobeNotes || undefined
    const memorizationAids = actorMat?.memorizationAids || undefined
    const techniqueFocus = actorMat?.techniqueFocus || undefined
    const techniqueExercises = actorMat?.techniqueExercises || undefined
    
    // Extract Story Bible 3D Character Data (physiology, sociology, psychology)
    // Check for detailed character data (Character3D structure)
    const detailedChar = char.detailed || char
    const physiologyData = detailedChar.physiology || detailedChar.fullPhysiology
    const sociologyData = detailedChar.sociology || detailedChar.fullSociology
    const psychologyData = detailedChar.psychology || detailedChar.fullPsychology
    
    // Build physiology object
    const physiology = physiologyData ? {
      gender: physiologyData.gender,
      appearance: physiologyData.appearance,
      height: physiologyData.height,
      build: physiologyData.build,
      physicalTraits: Array.isArray(physiologyData.physicalTraits) ? physiologyData.physicalTraits : [],
      health: physiologyData.health,
      defects: Array.isArray(physiologyData.defects) ? physiologyData.defects : [],
      heredity: physiologyData.heredity
    } : undefined
    
    // Build sociology object
    const sociology = sociologyData ? {
      class: sociologyData.class,
      occupation: sociologyData.occupation,
      education: sociologyData.education,
      homeLife: sociologyData.homeLife,
      religion: sociologyData.religion,
      race: sociologyData.race,
      nationality: sociologyData.nationality,
      politicalAffiliation: sociologyData.politicalAffiliation,
      hobbies: Array.isArray(sociologyData.hobbies) ? sociologyData.hobbies : [],
      communityStanding: sociologyData.communityStanding,
      economicStatus: sociologyData.economicStatus,
      familyRelationships: Array.isArray(sociologyData.familyRelationships) ? sociologyData.familyRelationships : []
    } : undefined
    
    // Build psychology object
    const psychology = psychologyData ? {
      coreValue: psychologyData.coreValue,
      opposingValue: psychologyData.opposingValue,
      moralStandpoint: psychologyData.moralStandpoint,
      want: psychologyData.want,
      need: psychologyData.need,
      primaryFlaw: psychologyData.primaryFlaw,
      secondaryFlaws: Array.isArray(psychologyData.secondaryFlaws) ? psychologyData.secondaryFlaws : [],
      temperament: Array.isArray(psychologyData.temperament) ? psychologyData.temperament : [],
      attitude: psychologyData.attitude,
      complexes: Array.isArray(psychologyData.complexes) ? psychologyData.complexes : [],
      ambitions: Array.isArray(psychologyData.ambitions) ? psychologyData.ambitions : [],
      frustrations: Array.isArray(psychologyData.frustrations) ? psychologyData.frustrations : [],
      fears: Array.isArray(psychologyData.fears) ? psychologyData.fears : [],
      superstitions: Array.isArray(psychologyData.superstitions) ? psychologyData.superstitions : [],
      likes: Array.isArray(psychologyData.likes) ? psychologyData.likes : [],
      dislikes: Array.isArray(psychologyData.dislikes) ? psychologyData.dislikes : [],
      iq: psychologyData.iq,
      abilities: Array.isArray(psychologyData.abilities) ? psychologyData.abilities : [],
      talents: Array.isArray(psychologyData.talents) ? psychologyData.talents : [],
      childhood: psychologyData.childhood,
      trauma: Array.isArray(psychologyData.trauma) ? psychologyData.trauma : [],
      successes: Array.isArray(psychologyData.successes) ? psychologyData.successes : []
    } : undefined
    
    // Enhance keyTraits with physical traits from physiology if available
    const enhancedTraits = traits.length > 0 ? traits : 
      (physiologyData?.physicalTraits && Array.isArray(physiologyData.physicalTraits) 
        ? physiologyData.physicalTraits 
        : [])
    
    return {
      name: charName,
      role: char.role || char.archetype || char.type || 'Character',
      age: char.age?.toString() || undefined,
      background: background,
      motivation: motivation,
      conflicts: conflicts,
      arc: arc,
      relationships: extractCharacterRelationships(char, characters),
      keyTraits: enhancedTraits,
      imageUrl: imageUrl,
      imagePrompt: imagePrompt,
      // Story Bible 3D Data
      physiology: physiology,
      sociology: sociology,
      psychology: psychology,
      // Actor Materials - Complete Data
      studyGuide: studyGuide,
      performanceReference: performanceReference,
      throughLine: throughLine,
      gotAnalysis: gotAnalysis,
      relationshipMapActor: relationshipMapActor,
      sceneBreakdowns: sceneBreakdowns,
      emotionalBeats: emotionalBeats,
      physicalWork: physicalWork,
      voicePatterns: voicePatterns,
      monologues: monologues,
      keyScenes: keyScenes,
      onSetPrep: onSetPrep,
      researchSuggestions: researchSuggestions,
      wardrobeNotes: wardrobeNotes,
      memorizationAids: memorizationAids,
      techniqueFocus: techniqueFocus,
      techniqueExercises: techniqueExercises
    }
  }).filter((char: any) => char.name && char.name !== 'Unnamed Character') // Filter out empty characters
  
  // Build relationship map for all characters
  const relationshipMap: RelationshipMap[] = []
  if (mainChars.length >= 2) {
    for (let i = 0; i < mainChars.length; i++) {
      for (let j = i + 1; j < mainChars.length; j++) {
        const char1 = mainChars[i]
        const char2 = mainChars[j]
        
        relationshipMap.push({
          character1: char1.name,
          character2: char2.name,
          relationshipType: 'complex',
          description: `Dynamic relationship between ${char1.name} and ${char2.name}`,
          keyMoments: [],
          evolution: 'Evolves throughout the arc'
        })
      }
    }
  }
  
  return {
    mainCharacters: mainChars,
    relationshipMap
  }
}

function extractCharacterRelationships(char: any, allChars: any[]): string[] {
  const relationships: string[] = []
  const charName = char.name || ''
  
  allChars.forEach((otherChar: any) => {
    if (otherChar.name !== charName) {
      relationships.push(otherChar.name)
    }
  })
  
  return relationships // Return all relationships
}

function extractDepth(storyBible: any) {
  // Extract world building - copy the entire structure from story bible
  const worldBuilding = storyBible.worldBuilding || {}
  
  // Extract setting
  const setting = worldBuilding.setting || worldBuilding.timePeriod || 'Contemporary setting'
  
  // Extract rules - handle both string and array
  let rules: string[] = []
  if (Array.isArray(worldBuilding.rules)) {
    rules = worldBuilding.rules
  } else if (typeof worldBuilding.rules === 'string') {
    rules = worldBuilding.rules.split('.').filter((r: string) => r.trim()).map((r: string) => r.trim())
  }
  
  // Extract locations with full details
  let locations: any[] = []
  if (Array.isArray(worldBuilding.locations)) {
    locations = worldBuilding.locations.map((loc: any) => {
      // Handle both object and string formats
      if (typeof loc === 'string') {
        return {
          name: loc,
          type: 'other' as const,
          description: '',
          significance: ''
        }
      }
      // Ensure all required fields are present
      return {
        name: loc.name || 'Unnamed Location',
        type: loc.type || 'other',
        description: loc.description || '',
        significance: loc.significance || '',
        recurringEvents: loc.recurringEvents || [],
        conflicts: loc.conflicts || [],
        imageUrl: loc.conceptArt?.imageUrl || undefined
      }
    })
  }
  
  // Extract living world dynamics - 1:1 reflection from Story Bible
  const livingWorldDynamics = storyBible.livingWorldDynamics || {}
  
  return {
    world: {
      setting,
      rules,
      locations
    },
    livingWorld: {
      backgroundEvents: livingWorldDynamics.backgroundEvents || '',
      socialDynamics: livingWorldDynamics.socialDynamics || '',
      economicFactors: livingWorldDynamics.economicFactors || '',
      politicalUndercurrents: livingWorldDynamics.politicalUndercurrents || '',
      culturalShifts: livingWorldDynamics.culturalShifts || ''
    }
  }
}

function extractSettings(storyBible: any): string[] {
  const settings: string[] = []
  
  if (storyBible.worldBuilding?.locations) {
    if (Array.isArray(storyBible.worldBuilding.locations)) {
      storyBible.worldBuilding.locations.forEach((loc: any) => {
        if (typeof loc === 'string') {
          settings.push(loc)
        } else if (loc && loc.name) {
          settings.push(loc.name)
        }
      })
    }
  }
  
  return settings.length > 0 ? settings : ['Conference rooms', 'Coffee shops', 'Portfolio company offices']
}

function extractKeyScenes(episodes: any[], episodeNumbers: number[]): {
  episode3?: SceneExcerpt
  episode5?: SceneExcerpt
  episode7?: SceneExcerpt
  episode8?: SceneExcerpt
} {
  const keyScenes: any = {}
  
  // Use available episodes, prioritize later episodes for comparison
  const availableEpNumbers = episodes.map(e => e.episodeNumber).sort((a, b) => a - b)
  const targetEpisodes = [3, 5, 7, 8].filter(epNum => availableEpNumbers.includes(epNum))
  
  // If we don't have the target episodes, use first and last available
  if (targetEpisodes.length < 2 && availableEpNumbers.length >= 2) {
    targetEpisodes.push(availableEpNumbers[0], availableEpNumbers[availableEpNumbers.length - 1])
  }
  
  targetEpisodes.forEach(epNum => {
    const episode = episodes.find(e => e.episodeNumber === epNum)
    if (episode) {
      let scene = null
      let sceneNumber = 1
      let sceneTitle = `Scene 1`
      let excerpt = ''
      
      // Try to find a key scene
      if (episode.scenes && episode.scenes.length > 0) {
        // Prefer middle scene or a scene with content
        const midIndex = Math.floor(episode.scenes.length / 2)
        scene = episode.scenes[midIndex] || episode.scenes[0]
        
        sceneNumber = scene.sceneNumber || midIndex + 1
        sceneTitle = scene.heading || scene.sceneTitle || `Scene ${sceneNumber}`
        excerpt = scene.content || scene.excerpt || scene.description || ''
      } else if (episode.synopsis || episode.summary) {
        // Fallback to episode summary
        excerpt = episode.synopsis || episode.summary
      }
      
      if (excerpt || scene) {
        keyScenes[`episode${epNum}`] = {
          episodeNumber: epNum,
          episodeTitle: episode.episodeTitle || episode.title || `Episode ${epNum}`,
          sceneNumber: sceneNumber,
          sceneTitle: sceneTitle,
          excerpt: excerpt ? excerpt.substring(0, 500) : `A key moment from ${episode.episodeTitle || `Episode ${epNum}`}`,
          context: `A pivotal moment from Episode ${epNum}: ${episode.episodeTitle || ''}`,
          whyItMatters: episode.keyBeat || episode.keyEvent || 'This scene represents a key turning point in the arc'
        }
      }
    }
  })
  
  return keyScenes
}

// Helper function to compute tab costs from equipment, props/wardrobe, casting, permits
function computeTabCosts(arcPreProd: any, episodePreProdData: Record<number, any>) {
  const breakdown: Array<{ label: string; amount: number }> = []
  
  // Helper to collect all equipment items
  const collectEquipmentItems = (equipmentData: any) => {
    if (!equipmentData) return [] as any[]
    if (Array.isArray(equipmentData.items)) return equipmentData.items
    const categories = ['camera', 'lens', 'lighting', 'audio', 'grip', 'other']
    return categories.flatMap(category => (Array.isArray(equipmentData[category]) ? equipmentData[category] : []))
  }

  // 1. Equipment costs (arc-level, all costs)
  const equipmentItems = collectEquipmentItems(arcPreProd?.equipment)
  const equipmentTotal = equipmentItems.reduce((sum: number, item: any) => {
    const cost = Number(item.totalCost ?? item.costPerDay ?? item.cost ?? 0)
    const quantity = Number(item.quantity ?? 1)
    return sum + cost * quantity
  }, 0)
  if (equipmentTotal > 0) {
    breakdown.push({ label: 'Equipment', amount: equipmentTotal })
  }

  // 2. Props & Wardrobe (arc-level, fallback to episode aggregation)
  const arcPropsWardrobe = arcPreProd?.propsWardrobe
  const arcPropsTotal = arcPropsWardrobe
    ? [...(arcPropsWardrobe.props || []), ...(arcPropsWardrobe.wardrobe || [])].reduce(
        (sum: number, item: any) => sum + (Number(item.estimatedCost) || 0),
        0
      )
    : 0

  let episodePropsTotal = 0
  if (episodePreProdData) {
    Object.values(episodePreProdData).forEach((epPreProd: any) => {
      const propsWardrobe = epPreProd?.propsWardrobe
      if (!propsWardrobe) return
      const items = [...(propsWardrobe.props || []), ...(propsWardrobe.wardrobe || [])]
      episodePropsTotal += items.reduce(
        (sum: number, item: any) => sum + (Number(item.estimatedCost) || 0),
        0
      )
    })
  }

  const propsTotal = arcPropsTotal || episodePropsTotal
  if (propsTotal > 0) {
    breakdown.push({ label: 'Props & Wardrobe', amount: propsTotal })
  }

  // 3. Cast payments (paid only)
  const sumCastPayments = (castingData: any) => {
    const cast = castingData?.cast || []
    return cast.reduce((sum: number, member: any) => {
      const isPaid = member.payment === 'paid'
      const amount = Number(member.paymentAmount ?? member.payRate ?? 0) || 0
      return sum + (isPaid ? amount : 0)
    }, 0)
  }

  const arcCastTotal = sumCastPayments(arcPreProd?.casting)
  let castTotal = arcCastTotal
  if (!castTotal && episodePreProdData) {
    castTotal = Object.values(episodePreProdData).reduce((sum: number, epPreProd: any) => {
      return sum + sumCastPayments(epPreProd?.casting)
    }, 0)
  }
  if (castTotal > 0) {
    breakdown.push({ label: 'Cast Payments', amount: castTotal })
  }

  // 4. Permits
  const permitsTotal = (arcPreProd?.permits?.permits || []).reduce(
    (sum: number, permit: any) => sum + (Number(permit.cost) || 0),
    0
  )
  if (permitsTotal > 0) {
    breakdown.push({ label: 'Permits', amount: permitsTotal })
  }

  const total = breakdown.reduce((sum, item) => sum + item.amount, 0)
  return { total, breakdown }
}

// Helper function to compute location costs
function computeLocationCosts(arcPreProd: any, episodePreProdData: Record<number, any>) {
  const arcLocationsData = arcPreProd?.locations as any
  
  // Check if we have the new format with costRollup
  if (arcLocationsData?.costRollup) {
    const costRollup = arcLocationsData.costRollup
    const breakdown = costRollup.perLocation.map((loc: any) => ({
      locationName: loc.parentLocationName,
      cost: loc.total,
      scenes: [],
      episodes: []
    }))
    
    return {
      totalLocationCosts: costRollup.arcTotal || 0,
      breakdown
    }
  }
  
  // Fallback: use locationGroups
  const locationGroups = arcLocationsData?.locationGroups || []
  if (locationGroups.length > 0) {
    const breakdown = locationGroups
      .filter((group: any) => group.status === 'booked' || group.status === 'confirmed')
      .map((group: any) => {
        const selectedSuggestion = group.shootingLocationSuggestions?.find(
          (s: any) => s.id === group.selectedSuggestionId
        ) || group.shootingLocationSuggestions?.[0]
        
        const dayRate = selectedSuggestion?.costBreakdown?.dayRate ?? 
                       selectedSuggestion?.estimatedCost ?? 
                       group.costEstimate?.dayRate ?? 0
        const permitCost = selectedSuggestion?.costBreakdown?.permitCost ?? 
                          selectedSuggestion?.permitCost ?? 
                          selectedSuggestion?.logistics?.permitCost ?? 
                          group.costEstimate?.permitCost ?? 0
        const depositAmount = selectedSuggestion?.costBreakdown?.depositAmount ?? 
                              selectedSuggestion?.depositAmount ?? 
                              group.costEstimate?.depositAmount ?? 0
        
        const total = Math.max(0, dayRate) + Math.max(0, permitCost) + Math.max(0, depositAmount)
        
        return {
          locationName: group.parentLocationName,
          cost: total,
          scenes: [],
          episodes: group.episodeUsage?.map((u: any) => u.episodeNumber) || []
        }
      })
    
    const totalLocationCosts = breakdown.reduce((sum: number, item: any) => sum + item.cost, 0)
    
    return { totalLocationCosts, breakdown }
  }
  
  return { totalLocationCosts: 0, breakdown: [] }
}

function extractProduction(
  allEpisodePreProd: Record<number, any>,
  arcPreProd: any,
  episodeNumbers: number[],
  storyBible?: any
): {
  budget: BudgetSummary
  locations: LocationSummary[]
  props: PropSummary[]
  casting: CastingSummary
  equipment?: any // EquipmentSection
  wardrobe?: any // WardrobeSection
  schedule?: any // ScheduleSummary
} {
  // PRIORITY: Use Production Assistant (arc-level) budget data first
  let totalBaseExtras = 0
  let totalBaseProps = 0
  let totalBaseLocations = 0
  let totalOptionalCrew = 0
  let totalOptionalEquipment = 0
  let totalOptionalPostProd = 0
  let totalOptionalMisc = 0
  
  const episodeCount = episodeNumbers.length
  const arcTotalEstimatedRaw = arcPreProd?.budget?.totalEstimated || 0
  const arcBudgetLiveEstimate = arcPreProd?.budget?.liveEstimate
  
  // PRIMARY SOURCE: Arc-level budget from Production Assistant
  const arcBudgetData = arcPreProd?.budget || {}
  const arcCategories = arcBudgetData.categories || []
  let arcTotalEstimated = arcBudgetData.totalEstimated || arcTotalEstimatedRaw || 0
  const newBudgetShape = arcBudgetData?.baseBudget && arcBudgetData?.optionalBudget
  
  // Include live estimate contributions from other tabs (e.g., equipment, props/wardrobe) if present
  if (arcBudgetLiveEstimate) {
    const liveEquipment = Number(arcBudgetLiveEstimate.equipment || 0)
    const livePropsWardrobe = Number(
      arcBudgetLiveEstimate['props & wardrobe'] ||
      arcBudgetLiveEstimate.propsWardrobe ||
      arcBudgetLiveEstimate.props
    )
    if (isFinite(liveEquipment)) totalOptionalEquipment += liveEquipment
    if (isFinite(livePropsWardrobe)) totalBaseProps += livePropsWardrobe
    // If no totalEstimated yet, accumulate into arcTotalEstimated so we don't fall back to 0
    if (arcTotalEstimated === 0) {
      arcTotalEstimated = liveEquipment + livePropsWardrobe
    }
  }

  // If the budget is in the new GeneratedBudget shape (baseBudget/optionalBudget/totalBudget), prioritize it
  if (newBudgetShape) {
    const baseTotal = arcBudgetData.baseBudget?.total || 0

    // optionalBudget.total is maintained as sum of included items; fall back to summing included flags
    const optionalBudget = arcBudgetData.optionalBudget || {}
    let optionalTotal = typeof optionalBudget.total === 'number' ? optionalBudget.total : 0
    if (optionalTotal === 0) {
      const gather = (arr: any[] = []) =>
        arr.filter(i => i?.included !== false).reduce((sum, i) => sum + (i?.suggestedCost || 0), 0)
      optionalTotal =
        gather(optionalBudget.crew) +
        gather(optionalBudget.equipment) +
        gather(optionalBudget.miscellaneous)
    }

    const totalBudget = arcBudgetData.totalBudget || baseTotal + optionalTotal || arcTotalEstimated

    const baseExtras = arcBudgetData.baseBudget?.extras || 0
    const baseProps = arcBudgetData.baseBudget?.props || 0
    const baseLocations = arcBudgetData.baseBudget?.locations || (baseTotal ? Math.max(0, baseTotal - baseExtras - baseProps) : 0)

    const optCrew = Array.isArray(optionalBudget.crew)
      ? optionalBudget.crew.filter((i: any) => i?.included !== false).reduce((sum: number, i: any) => sum + (i?.suggestedCost || 0), 0)
      : 0
    const optEquipment = Array.isArray(optionalBudget.equipment)
      ? optionalBudget.equipment.filter((i: any) => i?.included !== false).reduce((sum: number, i: any) => sum + (i?.suggestedCost || 0), 0)
      : 0
    const optMisc = Array.isArray(optionalBudget.miscellaneous)
      ? optionalBudget.miscellaneous.filter((i: any) => i?.included !== false).reduce((sum: number, i: any) => sum + (i?.suggestedCost || 0), 0)
      : 0
    const optPost = 0 // Post is AI-handled in this model

    // Override the running totals to reuse the existing aggregation below
    totalBaseExtras = baseExtras
    totalBaseProps = baseProps
    totalBaseLocations = baseLocations
    totalOptionalCrew = optCrew
    totalOptionalEquipment = optEquipment
    totalOptionalPostProd = optPost
    totalOptionalMisc = optMisc
    arcTotalEstimated = totalBudget || baseTotal + optionalTotal || arcTotalEstimated
  }
  
  if (arcCategories.length > 0 || arcTotalEstimated > 0) {
    // Extract from arc-level categories
    arcCategories.forEach((cat: any) => {
      const categoryName = (cat.category || '').toLowerCase()
      
      // Calculate total from category totalEstimated or totalActual, or sum line items
      let total = cat.totalEstimated || cat.totalActual || 0
      
      // If no total, try to sum line items
      if (total === 0 && cat.items && Array.isArray(cat.items)) {
        total = cat.items.reduce((sum: number, item: any) => {
          const itemCost = item.estimatedCost || item.actualCost || 0
          return sum + (typeof itemCost === 'number' ? itemCost : 0)
        }, 0)
      }
      
      // Categorize into base vs optional
      if (categoryName.includes('extras') || categoryName.includes('background')) {
        totalBaseExtras = total
      } else if (categoryName.includes('props') || categoryName.includes('wardrobe') || categoryName.includes('props-wardrobe')) {
        totalBaseProps = total
      } else if (categoryName.includes('location')) {
        totalBaseLocations = total
      } else if (categoryName.includes('crew') || categoryName.includes('talent') || categoryName.includes('cast')) {
        totalOptionalCrew = total
      } else if (categoryName.includes('equipment') || categoryName.includes('gear')) {
        totalOptionalEquipment = total
      } else if (categoryName.includes('post') || categoryName.includes('editing') || categoryName.includes('vfx') || categoryName.includes('post-production')) {
        totalOptionalPostProd = total
      } else {
        totalOptionalMisc = total
      }
    })
    
    // If no categories but we have arcTotalEstimated, distribute proportionally
    if (arcCategories.length === 0 && arcTotalEstimated > 0) {
      totalBaseExtras = arcTotalEstimated * 0.1
      totalBaseProps = arcTotalEstimated * 0.15
      totalBaseLocations = arcTotalEstimated * 0.15
      totalOptionalCrew = arcTotalEstimated * 0.2
      totalOptionalEquipment = arcTotalEstimated * 0.15
      totalOptionalPostProd = arcTotalEstimated * 0.2
      totalOptionalMisc = arcTotalEstimated * 0.05
    }
  } else {
    // FALLBACK: Aggregate from individual episode budgets if arc budget doesn't exist
    episodeNumbers.forEach(epNum => {
      const preProd = allEpisodePreProd[epNum]
      if (!preProd) return
      
      const budgetData = preProd?.budget || {}
      const categories = budgetData.categories || []
      
      categories.forEach((cat: any) => {
        const categoryName = (cat.category || '').toLowerCase()
        
        let total = cat.totalEstimated || cat.totalActual || 0
        
        if (total === 0 && cat.items && Array.isArray(cat.items)) {
          total = cat.items.reduce((sum: number, item: any) => {
            const itemCost = item.estimatedCost || item.actualCost || 0
            return sum + (typeof itemCost === 'number' ? itemCost : 0)
          }, 0)
        }
        
        if (categoryName.includes('extras') || categoryName.includes('background')) {
          totalBaseExtras += total
        } else if (categoryName.includes('props') || categoryName.includes('wardrobe') || categoryName.includes('props-wardrobe')) {
          totalBaseProps += total
        } else if (categoryName.includes('location')) {
          totalBaseLocations += total
        } else if (categoryName.includes('crew') || categoryName.includes('talent') || categoryName.includes('cast')) {
          totalOptionalCrew += total
        } else if (categoryName.includes('equipment') || categoryName.includes('gear')) {
          totalOptionalEquipment += total
        } else if (categoryName.includes('post') || categoryName.includes('editing') || categoryName.includes('vfx') || categoryName.includes('post-production')) {
          totalOptionalPostProd += total
        } else {
          totalOptionalMisc += total
        }
      })
      
      // If no categories but we have totalEstimated at top level
      if (categories.length === 0 && budgetData.totalEstimated) {
        const estimatedTotal = budgetData.totalEstimated
        totalBaseExtras += estimatedTotal * 0.1
        totalBaseProps += estimatedTotal * 0.15
        totalBaseLocations += estimatedTotal * 0.15
        totalOptionalCrew += estimatedTotal * 0.2
        totalOptionalEquipment += estimatedTotal * 0.15
        totalOptionalPostProd += estimatedTotal * 0.2
        totalOptionalMisc += estimatedTotal * 0.05
      }
    })
  }
  
  const perEpisodeBase = episodeCount > 0 
    ? (totalBaseExtras + totalBaseProps + totalBaseLocations) / episodeCount
    : (totalBaseExtras + totalBaseProps + totalBaseLocations)
  
  const perEpisodeOptional = episodeCount > 0
    ? (totalOptionalCrew + totalOptionalEquipment + totalOptionalPostProd + totalOptionalMisc) / episodeCount
    : (totalOptionalCrew + totalOptionalEquipment + totalOptionalPostProd + totalOptionalMisc)

  // Fallback: if we have an arc total but no category sums, use it directly
  let resolvedPerEpisodeBase = perEpisodeBase
  let resolvedPerEpisodeOptional = perEpisodeOptional
  if (resolvedPerEpisodeBase === 0 && resolvedPerEpisodeOptional === 0 && arcTotalEstimated > 0) {
    const perEp = episodeCount > 0 ? arcTotalEstimated / episodeCount : arcTotalEstimated
    resolvedPerEpisodeBase = perEp
    resolvedPerEpisodeOptional = 0
  }
  
  // Calculate live estimate from other tabs (equipment, props/wardrobe)
  const liveEstimateBreakdown: Array<{ label: string; amount: number }> = []
  let liveEstimateTotal = 0
  
  // Equipment costs
  const equipmentData = arcPreProd?.equipment
  if (equipmentData) {
    const equipmentItems = Array.isArray(equipmentData.items) 
      ? equipmentData.items 
      : ['camera', 'lens', 'lighting', 'audio', 'grip', 'other'].flatMap(cat => 
          Array.isArray(equipmentData[cat]) ? equipmentData[cat] : []
        )
    const equipmentTotal = equipmentItems.reduce((sum: number, item: any) => {
      const cost = Number(item.totalCost ?? item.costPerDay ?? item.cost ?? 0)
      const quantity = Number(item.quantity ?? 1)
      return sum + cost * quantity
    }, 0)
    if (equipmentTotal > 0) {
      liveEstimateBreakdown.push({ label: 'Equipment', amount: equipmentTotal })
      liveEstimateTotal += equipmentTotal
    }
  }
  
  // Props & Wardrobe costs
  const propsWardrobeData = arcPreProd?.propsWardrobe
  if (propsWardrobeData) {
    const propsTotal = [...(propsWardrobeData.props || []), ...(propsWardrobeData.wardrobe || [])].reduce(
      (sum: number, item: any) => sum + (Number(item.estimatedCost) || 0),
      0
    )
    if (propsTotal > 0) {
      liveEstimateBreakdown.push({ label: 'Props & Wardrobe', amount: propsTotal })
      liveEstimateTotal += propsTotal
    }
  }
  
  // Calculate total arc budget with live estimate
  const finalArcTotal = Math.round(
    arcTotalEstimated > 0
      ? arcTotalEstimated + liveEstimateTotal
      : (resolvedPerEpisodeBase + resolvedPerEpisodeOptional) * (episodeCount || 1) + liveEstimateTotal
  )
  
  // Calculate budget status
  const arcBudgetMin = 30 * (episodeCount || 1)
  const arcBudgetMax = 625 * (episodeCount || 1)
  const getBudgetStatus = (total: number) => {
    if (total <= arcBudgetMin * 0.5) return { color: '#10B981', label: '🟢 Ultra-low budget', status: 'excellent' as const }
    if (total <= arcBudgetMax * 0.7) return { color: '#FCD34D', label: '🟡 Moderate micro-budget', status: 'good' as const }
    if (total <= arcBudgetMax) return { color: '#FB923C', label: '🟠 Approaching max', status: 'warning' as const }
    return { color: '#EF4444', label: `🔴 Exceeds target ($${arcBudgetMax}/arc)`, status: 'over' as const }
  }
  const budgetStatus = getBudgetStatus(finalArcTotal)
  
  const budget: BudgetSummary = {
    perEpisode: {
      base: Math.round(resolvedPerEpisodeBase),
      optional: Math.round(resolvedPerEpisodeOptional),
      total: Math.round(resolvedPerEpisodeBase + resolvedPerEpisodeOptional)
    },
    arcTotal: finalArcTotal,
    breakdown: {
      base: {
        extras: episodeCount > 0 ? Math.round(totalBaseExtras / episodeCount) : Math.round(totalBaseExtras),
        props: episodeCount > 0 ? Math.round(totalBaseProps / episodeCount) : Math.round(totalBaseProps),
        locations: episodeCount > 0 ? Math.round(totalBaseLocations / episodeCount) : Math.round(totalBaseLocations)
      },
      optional: {
        crew: episodeCount > 0 ? Math.round(totalOptionalCrew / episodeCount) : Math.round(totalOptionalCrew),
        equipment: episodeCount > 0 ? Math.round(totalOptionalEquipment / episodeCount) : Math.round(totalOptionalEquipment),
        postProduction: episodeCount > 0 ? Math.round(totalOptionalPostProd / episodeCount) : Math.round(totalOptionalPostProd),
        miscellaneous: episodeCount > 0 ? Math.round(totalOptionalMisc / episodeCount) : Math.round(totalOptionalMisc)
      }
    },
    analysis: arcBudgetData.budgetAnalysis?.recommendation,
    // EXACT 1:1 REPLICA FIELDS
    totalArcBudget: {
      total: finalArcTotal,
      status: budgetStatus,
      target: {
        min: arcBudgetMin,
        max: arcBudgetMax,
        episodeCount: episodeCount || 1
      },
      liveEstimate: liveEstimateTotal > 0 ? {
        total: liveEstimateTotal,
        breakdown: liveEstimateBreakdown
      } : undefined
    },
    baseBudget: arcBudgetData.baseBudget ? {
      total: arcBudgetData.baseBudget.total || 0,
      extras: arcBudgetData.baseBudget.extras || 0,
      props: arcBudgetData.baseBudget.props || 0,
      locations: arcBudgetData.baseBudget.locations || 0
    } : undefined,
    optionalBudget: arcBudgetData.optionalBudget ? {
      total: typeof arcBudgetData.optionalBudget.total === 'number' 
        ? arcBudgetData.optionalBudget.total 
        : (Array.isArray(arcBudgetData.optionalBudget.crew) 
            ? arcBudgetData.optionalBudget.crew.filter((i: any) => i?.included !== false).reduce((sum: number, i: any) => sum + (i?.suggestedCost || 0), 0)
            : 0) +
          (Array.isArray(arcBudgetData.optionalBudget.equipment)
            ? arcBudgetData.optionalBudget.equipment.filter((i: any) => i?.included !== false).reduce((sum: number, i: any) => sum + (i?.suggestedCost || 0), 0)
            : 0) +
          (Array.isArray(arcBudgetData.optionalBudget.miscellaneous)
            ? arcBudgetData.optionalBudget.miscellaneous.filter((i: any) => i?.included !== false).reduce((sum: number, i: any) => sum + (i?.suggestedCost || 0), 0)
            : 0),
      crew: Array.isArray(arcBudgetData.optionalBudget.crew) 
        ? arcBudgetData.optionalBudget.crew.map((item: any) => ({
            id: item.id || '',
            role: item.role || '',
            suggestedCost: item.suggestedCost || 0,
            included: item.included !== false,
            necessity: item.necessity || 'optional',
            description: item.description,
            range: item.range
          }))
        : [],
      equipment: Array.isArray(arcBudgetData.optionalBudget.equipment)
        ? arcBudgetData.optionalBudget.equipment.map((item: any) => ({
            id: item.id || '',
            item: item.item || '',
            suggestedCost: item.suggestedCost || 0,
            included: item.included !== false,
            necessity: item.necessity || 'optional',
            description: item.description,
            range: item.range
          }))
        : [],
      miscellaneous: Array.isArray(arcBudgetData.optionalBudget.miscellaneous)
        ? arcBudgetData.optionalBudget.miscellaneous.map((item: any) => ({
            id: item.id || '',
            item: item.item || '',
            suggestedCost: item.suggestedCost || 0,
            included: item.included !== false,
            necessity: item.necessity || 'optional',
            description: item.description,
            range: item.range
          }))
        : []
    } : undefined,
    budgetAnalysis: arcBudgetData.budgetAnalysis ? {
      baseOnly: arcBudgetData.budgetAnalysis.baseOnly || 0,
      withHighlyRecommended: arcBudgetData.budgetAnalysis.withHighlyRecommended || 0,
      withRecommended: arcBudgetData.budgetAnalysis.withRecommended || 0,
      withAll: arcBudgetData.budgetAnalysis.withAll || 0,
      recommendation: arcBudgetData.budgetAnalysis.recommendation || ''
    } : undefined,
    // NEW FIELDS FOR EXACT 1:1 REPLICA - Computed from other tabs
    episodeCount: episodeCount || 1,
    tabCosts: computeTabCosts(arcPreProd, allEpisodePreProd),
    locationCosts: computeLocationCosts(arcPreProd, allEpisodePreProd)
  }
  
  // Build locations: prioritize arc-level selected real-world locations (locationGroups)
  const locations: LocationSummary[] = []
  const arcLocationsDataObj = arcPreProd?.locations || {}
  const arcLocationGroups = Array.isArray((arcLocationsDataObj as any)?.locationGroups)
    ? (arcLocationsDataObj as any).locationGroups
    : []

  if (Array.isArray(arcLocationGroups) && arcLocationGroups.length > 0) {
    arcLocationGroups.forEach((group: any) => {
      const parentName = group.parentLocationName || group.id
      if (!parentName) return

      const selected =
        group.shootingLocationSuggestions?.find((s: any) => s.id === group.selectedSuggestionId) ||
        group.shootingLocationSuggestions?.find((s: any) => s.isPreferred) ||
        null

      // Only show selected locations
      if (!selected) return

      const episodesUsedNums: number[] =
        group.episodesUsed ||
        (Array.isArray(group.episodeUsage)
          ? group.episodeUsage.map((u: any) => u.episodeNumber)
          : episodeNumbers)

      const dayRate = selected?.costBreakdown?.dayRate ?? selected?.estimatedCost ?? group.costEstimate?.dayRate ?? 0
      const permitCost = selected?.costBreakdown?.permitCost ?? selected?.permitCost ?? selected?.logistics?.permitCost ?? group.costEstimate?.permitCost ?? 0
      const depositAmount = selected?.costBreakdown?.depositAmount ?? selected?.depositAmount ?? group.costEstimate?.depositAmount ?? 0
      const totalCost = Math.round(Math.max(0, dayRate) + Math.max(0, permitCost) + Math.max(0, depositAmount))

      locations.push({
        name: selected.venueName || parentName,
        venueName: selected.venueName,
        venueType: selected.venueType,
        description: group.storyBibleReference || '',
        usedIn: episodesUsedNums.map((ep: number) => `Episode ${ep}`),
        episodesUsed: episodesUsedNums,
        cost: totalCost,
        totalCost,
        dayRate,
        permitCost,
        depositAmount,
        address: selected.address,
        imageUrl: selected.imageUrl || selected.referencePhotos?.[0],
        pros: selected.pros || [],
        cons: selected.cons || [],
        logistics: {
          parking: selected.logistics?.parking,
          power: selected.logistics?.power,
          restrooms: selected.logistics?.restrooms,
          permitRequired: selected.logistics?.permitRequired,
          permitCost: selected.logistics?.permitCost || selected.permitCost || permitCost,
          notes: selected.logistics?.notes
        },
        sourcing: selected.sourcing,
        specificVenueUrl: selected.specificVenueUrl,
        searchGuidance: selected.searchGuidance,
        status: group.status,
        // Story location group metadata for exact 1:1 replica
        storyLocationType: group.type,
        totalScenes: group.totalScenes,
        totalEpisodes: group.totalEpisodes,
        subLocationsCount: group.subLocations?.length || 0,
        storyBibleReference: group.storyBibleReference,
        confidence: group.confidence,
        aiProvider: group.aiProvider,
        aiModel: group.aiModel,
        insuranceRequired: selected.insuranceRequired || selected.costBreakdown?.insuranceRequired || group.costEstimate?.insuranceRequired,
        episodeUsage: group.episodeUsage || episodesUsedNums.map((ep: number) => {
          const usage = group.episodeUsage?.find((u: any) => u.episodeNumber === ep)
          return {
            episodeNumber: ep,
            episodeTitle: usage?.episodeTitle || `Episode ${ep}`,
            sceneNumbers: usage?.sceneNumbers || [],
            sceneCount: usage?.sceneCount || 0
          }
        })
      })
    })
  }

  // Fallback: if no selected locations, reuse legacy aggregation to avoid empty UI
  if (locations.length === 0) {
  const locationsMap = new Map<string, LocationSummary>()
  
    // Extract from episode-level locations
  episodeNumbers.forEach(epNum => {
    const preProd = allEpisodePreProd[epNum]
    if (!preProd) return
    
    const locationsDataObj = preProd?.locations || {}
    const locationsArray = Array.isArray(locationsDataObj) ? locationsDataObj : (locationsDataObj.locations || [])
    
    if (Array.isArray(locationsArray)) {
      locationsArray.forEach((loc: any) => {
        const locName = loc.name || loc.locationName || ''
        if (locName && !locationsMap.has(locName)) {
          locationsMap.set(locName, {
            name: locName,
            description: loc.description || '',
            usedIn: [`Episode ${epNum}`],
            cost: loc.cost || loc.estimatedCost || 0,
            imageUrl: loc.imageUrl || loc.image || loc.referencePhotos?.[0],
            address: loc.address || loc.locationAddress || undefined
          })
        } else if (locName && locationsMap.has(locName)) {
          const existing = locationsMap.get(locName)!
          if (!existing.usedIn.includes(`Episode ${epNum}`)) {
            existing.usedIn.push(`Episode ${epNum}`)
          }
        }
      })
    }
  })
  
    // Arc-level legacy locations
  const arcLocationsArray = Array.isArray(arcLocationsDataObj) ? arcLocationsDataObj : (arcLocationsDataObj.locations || [])
  if (Array.isArray(arcLocationsArray)) {
    arcLocationsArray.forEach((loc: any) => {
      const locName = loc.name || loc.locationName || ''
      if (locName && !locationsMap.has(locName)) {
        const episodesUsed = loc.scenes?.map((s: any) => s.episodeNumber || s.episode || episodeNumbers[0]).filter((ep: number, idx: number, arr: number[]) => arr.indexOf(ep) === idx) || episodeNumbers
        locationsMap.set(locName, {
          name: locName,
          description: loc.description || '',
          usedIn: episodesUsed.map((ep: number) => `Episode ${ep}`),
          cost: loc.cost || loc.estimatedCost || 0,
          imageUrl: loc.imageUrl || loc.image || loc.referencePhotos?.[0],
          address: loc.address || loc.locationAddress || undefined
        })
      }
    })
  }
  
  if (locationsMap.size === 0 && storyBible?.worldBuilding?.locations) {
    const worldLocations = storyBible.worldBuilding.locations
    if (Array.isArray(worldLocations) && worldLocations.length > 0) {
      const firstWorldLoc = worldLocations[0]
      const locName = firstWorldLoc.name || ''
      if (locName) {
        locationsMap.set(locName, {
          name: locName,
          description: firstWorldLoc.description || '',
          usedIn: episodeNumbers.map(ep => `Episode ${ep}`),
          cost: 0,
          address: undefined
        })
      }
    }
  }
  
    locations.push(...Array.from(locationsMap.values()).slice(0, 10))
  }
  
  // Aggregate props from all episodes (deduplicate by name)
  const propsMap = new Map<string, PropSummary>()
  
  // Extract props from PropsWardrobeData structure (has props array property)
  episodeNumbers.forEach(epNum => {
    const preProd = allEpisodePreProd[epNum]
    if (!preProd) return
    
    const propsWardrobeData = preProd?.propsWardrobe || {}
    const propsArray = propsWardrobeData.props || []
    
    if (Array.isArray(propsArray)) {
      propsArray.forEach((prop: any) => {
        const propName = prop.name || prop.item || ''
        if (propName && !propsMap.has(propName)) {
          propsMap.set(propName, {
            name: propName,
            description: prop.description || '',
            significance: prop.importance || prop.significance,
            usedIn: [`Episode ${epNum}`],
            cost: prop.actualCost || prop.estimatedCost || 0,
            imageUrl: prop.referencePhotos?.[0] || prop.imageUrl || prop.image
          })
        } else if (propName && propsMap.has(propName)) {
          const existing = propsMap.get(propName)!
          if (!existing.usedIn.includes(`Episode ${epNum}`)) {
            existing.usedIn.push(`Episode ${epNum}`)
          }
        }
      })
    }
  })
  
  // Also check arc-level props (if stored at arc level)
  // Note: Props are typically episode-level, but check just in case
  const arcPropsWardrobeData = arcPreProd?.propsWardrobe || {}
  const arcPropsArray = arcPropsWardrobeData.props || []
  
  if (Array.isArray(arcPropsArray)) {
    arcPropsArray.forEach((prop: any) => {
      const propName = prop.name || prop.item || ''
      if (propName && !propsMap.has(propName)) {
        propsMap.set(propName, {
          name: propName,
          description: prop.description || '',
          significance: prop.importance || prop.significance,
          usedIn: episodeNumbers.map(ep => `Episode ${ep}`),
          cost: prop.actualCost || prop.estimatedCost || 0,
          imageUrl: prop.referencePhotos?.[0] || prop.imageUrl || prop.image
        })
      }
    })
  }
  
  const props = Array.from(propsMap.values()).slice(0, 15) // Top 15 unique props
  
  // EXACT 1:1 REPLICA - Extract casting from arc-level Production Assistant
  const arcCastingData = arcPreProd?.casting || {}
  const castMembers = Array.isArray(arcCastingData.cast) ? arcCastingData.cast : []
  
  // Filter to main cast (lead and supporting roles)
  const mainCast = castMembers.filter((m: any) => m.role === 'lead' || m.role === 'supporting')
  
  // Calculate stats
  const totalCast = mainCast.length
  const confirmedCount = mainCast.filter((m: any) => m.confirmed).length
  const leadCount = mainCast.filter((m: any) => m.role === 'lead').length
  const supportingCount = mainCast.filter((m: any) => m.role === 'supporting').length
  const totalPayroll = mainCast.reduce((sum: number, m: any) => sum + (m.payRate || 0), 0)
  
  // Map cast members to CastingCharacter format with all fields
  const characters = mainCast.map((member: any) => {
    // Find story bible character for image
    const findStoryBibleCharacter = (characterName: string) => {
      const norm = characterName.toLowerCase().trim()
      const candidates = [
        ...(storyBible?.characters || []),
        ...(storyBible?.mainCharacters || [])
      ]
      return candidates.find((char: any) => {
        const charName = (char.name || char.characterName || '').toLowerCase().trim()
        return charName === norm || charName.includes(norm) || norm.includes(charName)
      })
    }
    const storyBibleCharacter = findStoryBibleCharacter(member.characterName || '')
    const storyBibleImage = storyBibleCharacter?.visualReference || undefined
    
    // Get episodes this character appears in
    const characterEpisodes = member.scenes && episodeNumbers
      ? [...new Set(member.scenes.map((scene: any) => {
          // Simplified: if we have episode numbers, show all episodes
          return episodeNumbers[0] // Default to first episode for now
        }))]
      : episodeNumbers || []
    
    return {
      name: member.characterName || member.name || '',
      characterName: member.characterName || member.name || '',
      actorName: member.actorName || '',
      role: member.role || 'lead',
      status: member.status || 'casting',
      confirmed: member.confirmed || false,
      headshot: member.headshot || '',
      storyBibleImage: storyBibleImage ? { imageUrl: storyBibleImage.imageUrl || storyBibleImage } : undefined,
      ageRange: member.characterProfile?.ageRange 
        ? `${member.characterProfile.ageRange.min}-${member.characterProfile.ageRange.max}`
        : member.ageRange || '',
      description: member.characterProfile?.backstory || member.description || '',
      actorType: member.role || 'Lead',
      references: (member.characterProfile?.actorTemplates || []).map((t: any) => t.name || ''),
      scenes: member.scenes || [],
      episodes: characterEpisodes,
      payRate: member.payRate || 0,
      payment: member.payment || 'deferred',
      paymentAmount: member.paymentAmount || 0,
      characterProfile: member.characterProfile ? {
        archetype: member.characterProfile.archetype,
        ageRange: member.characterProfile.ageRange,
        actorTemplates: member.characterProfile.actorTemplates || [],
        castingPriority: member.characterProfile.castingPriority,
        screenTimeMetrics: member.characterProfile.screenTimeMetrics,
        characterArc: member.characterProfile.characterArc,
        keyScenes: member.characterProfile.keyScenes,
        relationships: member.characterProfile.relationships,
        backstory: member.characterProfile.backstory,
        objectives: member.characterProfile.objectives,
        voiceRequirements: member.characterProfile.voiceRequirements
      } : undefined
    }
  })
  
  const casting: CastingSummary = {
    characters,
    stats: {
      totalCast,
      confirmedCount,
      leadCount,
      supportingCount,
      totalPayroll
    }
  }
  
  const equipment = buildEquipmentSection(arcPreProd, allEpisodePreProd, episodeNumbers)
  const wardrobe = buildWardrobeSection(arcPreProd, allEpisodePreProd, episodeNumbers)
  const schedule = buildScheduleSection(arcPreProd, allEpisodePreProd, episodeNumbers)
  
  return { budget, locations, props, casting, equipment, wardrobe, schedule }
}

function buildEquipmentSection(
  arcPreProd: any,
  allEpisodePreProd: Record<number, any>,
  episodeNumbers: number[]
): any {
  const sources: Array<{ data: any; episodes: number[] }> = []
  if (arcPreProd?.equipment) {
    sources.push({ data: arcPreProd.equipment, episodes: episodeNumbers })
  }
  episodeNumbers.forEach(epNum => {
    const epEquipment = allEpisodePreProd[epNum]?.equipment
    if (epEquipment) {
      sources.push({ data: epEquipment, episodes: [epNum] })
    }
  })

  if (sources.length === 0) return undefined

  const categoryOrder = ['camera', 'lens', 'lighting', 'audio', 'grip', 'other']
  const categoriesMap = new Map<string, any>()
  categoryOrder.forEach(cat => {
    categoriesMap.set(cat, {
      category: cat,
      totalItems: 0,
      obtainedItems: 0,
      totalCost: 0,
      items: []
    })
  })

  let totalItems = 0
  let obtainedItems = 0
  let totalCost = 0

  const isObtained = (status?: string) => status === 'obtained' || status === 'returned'

  sources.forEach(({ data, episodes }) => {
    const episodeUsage = episodes.map(ep => `Episode ${ep}`)
    const buckets: Record<string, any[]> = {
      camera: data.camera || [],
      lens: data.lens || [],
      lighting: data.lighting || [],
      audio: data.audio || [],
      grip: data.grip || [],
      other: data.other || []
    }

    Object.entries(buckets).forEach(([category, items]) => {
      const summary = categoriesMap.get(category) || {
        category,
        totalItems: 0,
        obtainedItems: 0,
        totalCost: 0,
        items: []
      }

      if (Array.isArray(items)) {
        items.forEach((item: any) => {
          const itemCost = typeof item.totalCost === 'number'
            ? item.totalCost
            : typeof item.costPerDay === 'number'
            ? item.costPerDay
            : 0

          const itemSummary: any = {
            name: item.name || 'Equipment',
            category,
            status: item.status,
            ownership: item.ownership,
            totalCost: itemCost,
            costPerDay: item.costPerDay,
            vendor: item.vendor,
            quantity: item.quantity,
            pickupDate: item.pickupDate,
            returnDate: item.returnDate,
            episodeUsage,
            notes: item.notes
          }

          summary.items.push(itemSummary)
          summary.totalItems += 1
          summary.totalCost += itemCost
          totalItems += 1
          totalCost += itemCost

          if (isObtained(item.status)) {
            summary.obtainedItems += 1
            obtainedItems += 1
          }
        })
      }

      categoriesMap.set(category, summary)
    })
  })

  const categories = Array.from(categoriesMap.values()).filter(cat => cat.totalItems > 0)
  if (categories.length === 0) return undefined

  const status = totalItems === 0
    ? 'missing'
    : obtainedItems > 0 && obtainedItems < totalItems
    ? 'partial'
    : 'complete'

  return {
    totalItems,
    obtainedItems,
    totalCost: Math.round(totalCost),
    categories,
    status
  }
}

function buildWardrobeSection(
  arcPreProd: any,
  allEpisodePreProd: Record<number, any>,
  episodeNumbers: number[]
): any {
  const wardrobeItems: any[] = []
  const propsItems: PropSummary[] = []
  let totalCost = 0

  const sources: Array<{ data: any; episodes: number[] }> = []
  if (arcPreProd?.propsWardrobe) {
    sources.push({ data: arcPreProd.propsWardrobe, episodes: episodeNumbers })
  }
  episodeNumbers.forEach(epNum => {
    const epPropsWardrobe = allEpisodePreProd[epNum]?.propsWardrobe
    if (epPropsWardrobe) {
      sources.push({ data: epPropsWardrobe, episodes: [epNum] })
    }
  })

  if (sources.length === 0) return undefined

  const mergeUsage = (existing: { usedIn: string[] }, episodes: number[]) => {
    const labels = episodes.map(ep => `Episode ${ep}`)
    labels.forEach(label => {
      if (!existing.usedIn.includes(label)) existing.usedIn.push(label)
    })
  }

  sources.forEach(({ data, episodes }) => {
    const labels = episodes.map(ep => `Episode ${ep}`)

    if (Array.isArray(data.props)) {
      data.props.forEach((prop: any) => {
        const name = prop.name || prop.item || ''
        if (!name) return
        const cost = prop.actualCost || prop.estimatedCost || 0
        totalCost += typeof cost === 'number' ? cost : 0

        const existing = propsItems.find(p => p.name === name)
        if (existing) {
          mergeUsage(existing, episodes)
        } else {
          propsItems.push({
            name,
            description: prop.description || '',
            significance: prop.importance || prop.significance,
            usedIn: [...labels],
            cost: cost || 0,
            imageUrl: prop.referencePhotos?.[0] || prop.imageUrl || prop.image
        })
      }
    })
  }
  
    if (Array.isArray(data.wardrobe)) {
      data.wardrobe.forEach((item: any) => {
        const name = item.name || item.item || ''
        if (!name) return
        const cost = item.actualCost || item.estimatedCost || 0
        totalCost += typeof cost === 'number' ? cost : 0

        const existing = wardrobeItems.find(w => w.name === name)
        if (existing) {
          mergeUsage(existing, episodes)
        } else {
          wardrobeItems.push({
            name,
            description: item.description || '',
            significance: item.importance || item.significance,
            usedIn: [...labels],
            cost: cost || 0,
            imageUrl: item.referencePhotos?.[0] || item.imageUrl || item.image,
            category: item.category
          })
        }
      })
    }
  })

  if (wardrobeItems.length === 0 && propsItems.length === 0) return undefined

  const status = wardrobeItems.length > 0 || propsItems.length > 0
    ? 'complete'
    : 'missing'

  return {
    wardrobe: wardrobeItems.slice(0, 20),
    props: propsItems.slice(0, 20),
    totalCost: Math.round(totalCost),
    status
  }
}

function buildScheduleSection(
  arcPreProd: any,
  allEpisodePreProd: Record<number, any>,
  episodeNumbers: number[]
): any {
  // EXACT 1:1 REPLICA - Extract from arc-level Production Assistant
  let schedule = arcPreProd?.shootingSchedule || arcPreProd?.schedule
  let sourceEpisodes: number[] | undefined = arcPreProd?.shootingSchedule ? episodeNumbers : undefined

  if (!schedule) {
    for (const epNum of episodeNumbers) {
      const epSchedule = allEpisodePreProd[epNum]?.shootingSchedule || allEpisodePreProd[epNum]?.schedule
      if (epSchedule) {
        schedule = epSchedule
        sourceEpisodes = [epNum]
        break
      }
    }
  }

  if (!schedule) return undefined

  const daysRaw = Array.isArray(schedule.days) ? schedule.days : []
  const days: any[] = daysRaw.map((day: any) => ({
    dayNumber: day.dayNumber,
    date: day.date,
    location: day.location,
    status: day.status || 'scheduled',
    scenes: Array.isArray(day.scenes) ? day.scenes.length : undefined,
    callTime: day.callTime,
    wrapTime: day.estimatedWrapTime || day.actualWrapTime,
    estimatedWrapTime: day.estimatedWrapTime,
    scenesList: Array.isArray(day.scenes) ? day.scenes.map((scene: any) => ({
      episodeNumber: scene.episodeNumber,
      sceneNumber: scene.sceneNumber || scene,
      sceneTitle: scene.sceneTitle,
      estimatedDuration: scene.estimatedDuration
    })) : undefined,
    castRequired: Array.isArray(day.castRequired) ? day.castRequired.map((cast: any) => ({
      characterName: cast.characterName || cast,
      actorName: cast.actorName
    })) : undefined,
    castCount: Array.isArray(day.castRequired) ? day.castRequired.length : 0,
    equipmentRequired: Array.isArray(day.equipmentRequired) ? day.equipmentRequired : undefined,
    specialNotes: day.specialNotes,
    weatherContingency: day.weatherContingency,
    locationId: day.locationId,
    venueId: day.venueId,
    venueName: day.venueName,
    venueAddress: day.venueAddress,
    permitRequired: day.permitRequired,
    insuranceRequired: day.insuranceRequired,
    locationCost: day.locationCost
  }))

  const rehearsalsRaw = Array.isArray(schedule.rehearsals) ? schedule.rehearsals : []
  const rehearsals = rehearsalsRaw.length > 0 ? {
    total: rehearsalsRaw.length,
    completed: rehearsalsRaw.filter((r: any) => r.status === 'completed').length
  } : undefined

  const totalShootDays = schedule.totalShootDays || daysRaw.length || 0
  const completedDays = daysRaw.filter((d: any) => d.status === 'shot').length
  const upcomingDays = daysRaw.filter((d: any) => d.status === 'scheduled' || d.status === 'confirmed').length
  const totalScenes = daysRaw.reduce((sum: number, day: any) => sum + (Array.isArray(day.scenes) ? day.scenes.length : 0), 0)
  const uniqueLocations = new Set(daysRaw.map((d: any) => d.location).filter(Boolean)).size
  const status = totalShootDays > 0 ? 'complete' : 'missing'

  return {
    mode: schedule.schedulingMode,
    totalShootDays,
    startDate: schedule.startDate,
    endDate: schedule.endDate,
    days,
    rehearsals,
    episodesCovered: schedule.episodeNumbers || (schedule.episodeNumber ? [schedule.episodeNumber] : sourceEpisodes),
    status,
    stats: {
      totalShootDays,
      completedDays,
      upcomingDays,
      totalScenes,
      uniqueLocations
    }
  }
}

// Helper function to extract a MarketingSection from a marketing object
function extractMarketingSection(marketing: any, storyBible?: any): MarketingSection | undefined {
  if (!marketing || Object.keys(marketing).length === 0) {
    return undefined
  }
  
  const visualAssets = marketing.visualAssets || marketing.visuals || {}
  
  // Extract target audience
  const targetAudience = marketing.targetAudience || {}
  const primaryAudience = targetAudience.primary || 
                         targetAudience.primaryAudience ||
                         storyBible?.targetAudience?.primary ||
                         'Primary target audience'
  const secondaryAudience = targetAudience.secondary || 
                           targetAudience.secondaryAudience ||
                           storyBible?.targetAudience?.secondary ||
                           'Secondary target audience'
  
  // Extract key selling points
  let keySellingPoints: string[] = []
  if (Array.isArray(marketing.keySellingPoints)) {
    keySellingPoints = marketing.keySellingPoints
  } else if (marketing.sellingPoints && Array.isArray(marketing.sellingPoints)) {
    keySellingPoints = marketing.sellingPoints
  } else if (marketing.uniqueSellingPoints && Array.isArray(marketing.uniqueSellingPoints)) {
    keySellingPoints = marketing.uniqueSellingPoints
  }
  
  // Extract loglines and taglines
  const loglines = Array.isArray(marketing.loglines) ? marketing.loglines :
                  (marketing.logline ? [marketing.logline] : [])
  const taglines = Array.isArray(marketing.taglines) ? marketing.taglines :
                  (marketing.tagline ? [marketing.tagline] : [])
  
  // Use story bible logline if no marketing loglines
  if (loglines.length === 0 && storyBible?.logline) {
    loglines.push(storyBible.logline)
  }
  
  // Extract social media strategy
  const socialStrategy = marketing.socialMediaStrategy || marketing.socialStrategy || {}
  const platforms = Array.isArray(socialStrategy.platforms) ? socialStrategy.platforms :
                   (socialStrategy.platform ? [socialStrategy.platform] : [])
  
  // Extract teaser/poster/visual templates
  const seriesPosterConcept =
    marketing.seriesPosterConcept ||
    marketing.posterConcept ||
    marketing.poster ||
    marketing.visualStyle?.posterConcepts?.[0] ||
    visualAssets.seriesPoster

  const seriesTeaserTrailerConcept =
    marketing.seriesTeaserTrailerConcept ||
    marketing.teaserTrailerConcept ||
    marketing.teaserConcept ||
    marketing.trailerConcept ||
    visualAssets.seriesTeaser

  const collectedTemplates: any[] = []
  if (Array.isArray(marketing.visualTemplates)) collectedTemplates.push(...marketing.visualTemplates)
  if (Array.isArray(marketing.templates)) collectedTemplates.push(...marketing.templates)
  if (visualAssets.platformTemplates) {
    const pt = visualAssets.platformTemplates
    // Flatten character spotlights into individual platform templates with labels
    if (Array.isArray(pt.characterSpotlights)) {
      pt.characterSpotlights.forEach((spot: any) => {
        const characterName = spot.characterName || spot.name
        if (spot.templates) {
          Object.entries(spot.templates).forEach(([platform, tpl]: any) => {
            if (tpl) {
              collectedTemplates.push({
                ...tpl,
                platform,
                title: characterName ? `${characterName} (${platform})` : platform
              })
            }
          })
        }
      })
    }
    // Campaign graphics (already flat)
    if (pt.campaignGraphics) {
      const cg = pt.campaignGraphics
      ;['launch', 'milestones', 'arcTransitions'].forEach((key) => {
        const arr = cg[key]
        if (Array.isArray(arr)) collectedTemplates.push(...arr)
      })
    }
  }
  // Flatten any spotlight-style templates that contain per-platform entries
  const visualTemplates = collectedTemplates.flatMap((tpl: any) => {
    if (tpl?.templates && typeof tpl.templates === 'object') {
      const characterName = tpl.characterName || tpl.name
      return Object.entries(tpl.templates)
        .filter(([_, t]) => !!t)
        .map(([platform, t]: any) => ({
          ...t,
          platform,
          title: characterName ? `${characterName} (${platform})` : platform
        }))
    }
    return [tpl]
  })

  // Extract UGC strategy, normalize arrays
  const ugcStrategyRaw = marketing.ugcStrategy || {}
  const normUgcArr = (val: any) => {
    if (!val) return []
    if (Array.isArray(val)) return val
    if (typeof val === 'string') return [val]
    return []
  }
  const ugcStrategy = {
    actorMarketing: normUgcArr(ugcStrategyRaw.actorMarketing),
    authenticityMaintenance: normUgcArr(ugcStrategyRaw.authenticityMaintenance),
    communityBuilding: normUgcArr(ugcStrategyRaw.communityBuilding),
    containerStrategy: ugcStrategyRaw.containerStrategy
  }

  // Extract peer casting loop
  const peerCastingLoop = marketing.peerCastingLoop || marketing.peerCasting || {}

  // Extract hooks if present, normalizing string -> array
  const hooksRaw = marketing.marketingHooks || marketing.hooks || {}
  const toArr = (val: any) => {
    if (!val) return []
    if (Array.isArray(val)) return val
    if (typeof val === 'string') return [val]
    return []
  }

  // Extract platform strategies
  const platformStrategies = marketing.platformStrategies || {}

  // Extract launch strategy
  const arcLaunchStrategy = marketing.arcLaunchStrategy || marketing.launchStrategy || {}

  return {
    targetAudience: {
      primary: primaryAudience,
      secondary: secondaryAudience
    },
    keySellingPoints: keySellingPoints.length > 0 ? keySellingPoints : [
      'Compelling narrative',
      'Strong character development',
      'Relevant themes'
    ],
    loglines: loglines.length > 0 ? loglines : [storyBible?.logline || storyBible?.synopsis?.substring(0, 200) || ''],
    taglines: taglines.length > 0 ? taglines : (loglines.length > 0 ? loglines.slice(0, 3) : []),
    marketingStrategyOverview: marketing.marketingStrategy?.primaryApproach || marketing.strategyOverview || marketing.overview,
    seriesPosterConcept,
    seriesTeaserTrailerConcept,
    visualTemplates,
    ugcStrategy,
    peerCastingLoop: peerCastingLoop.strategy || peerCastingLoop.marketingDeliverables || peerCastingLoop.multiplierEffect
      ? {
          strategy: peerCastingLoop.strategy,
          marketingDeliverables: peerCastingLoop.marketingDeliverables,
          multiplierEffect: peerCastingLoop.multiplierEffect
        }
      : undefined,
    uniqueValueProposition: marketing.uniqueValueProposition || marketing.marketingStrategy?.uniqueValueProposition,
    marketingHooks: {
      seriesHooks: toArr(hooksRaw.seriesHooks || hooksRaw.series),
      characterHooks: toArr(hooksRaw.characterHooks || hooksRaw.characters),
      episodeHooks: toArr(hooksRaw.episodeHooks || hooksRaw.episodes),
      viralPotentialScenes: toArr(hooksRaw.viralPotentialScenes)
    },
    platformStrategies: {
      tiktok: platformStrategies.tiktok,
      instagram: platformStrategies.instagram,
      youtube: platformStrategies.youtube
    },
    arcLaunchStrategy: {
      preLaunch: arcLaunchStrategy.preLaunch || arcLaunchStrategy.pre || [],
      launch: arcLaunchStrategy.launch || [],
      postLaunch: arcLaunchStrategy.postLaunch || arcLaunchStrategy.post || []
    },
    crossEpisodeThemes: marketing.crossEpisodeThemes || marketing.themes || [],
    socialMediaStrategy: {
      platforms: platforms.length > 0 ? platforms : ['LinkedIn', 'X (Twitter)', 'YouTube'],
      contentApproach: socialStrategy.contentApproach || 
                      socialStrategy.strategy ||
                      marketing.contentStrategy ||
                      'Engaging, shareable content',
      engagementIdeas: Array.isArray(socialStrategy.engagementIdeas) ? socialStrategy.engagementIdeas : []
    },
    visualStyle: marketing.visualStyle ? {
      colorPalette: marketing.visualStyle.colorPalette || '',
      imageryThemes: marketing.visualStyle.imageryThemes || '',
      posterConcepts: Array.isArray(marketing.visualStyle.posterConcepts) ? marketing.visualStyle.posterConcepts : []
    } : undefined,
    audioStrategy: marketing.audioStrategy ? {
      musicGenre: marketing.audioStrategy.musicGenre || '',
      soundDesign: marketing.audioStrategy.soundDesign || '',
      voiceoverTone: marketing.audioStrategy.voiceoverTone || ''
    } : undefined,
    visualAssets
  }
}

function extractMarketing(
  arcPreProd: any, 
  storyBible: any, 
  allEpisodePreProd?: Record<number, any>, 
  episodeNumbers?: number[]
) {
  // Extract Series Level marketing from story bible
  // Story bible marketing can be in marketingGuide or marketing, and might have nested structure
  const seriesMarketingRaw = storyBible?.marketingGuide || storyBible?.marketing
  let seriesMarketing = seriesMarketingRaw
  
  // If it's the generated structure with marketingStrategy nested, extract it
  if (seriesMarketingRaw?.marketingStrategy) {
    seriesMarketing = {
      targetAudience: {
        primary: Array.isArray(seriesMarketingRaw.marketingStrategy.targetAudience?.primary) 
          ? seriesMarketingRaw.marketingStrategy.targetAudience.primary.join(', ')
          : seriesMarketingRaw.marketingStrategy.targetAudience?.primary || '',
        secondary: Array.isArray(seriesMarketingRaw.marketingStrategy.targetAudience?.secondary)
          ? seriesMarketingRaw.marketingStrategy.targetAudience.secondary.join(', ')
          : seriesMarketingRaw.marketingStrategy.targetAudience?.secondary || ''
      },
      keySellingPoints: seriesMarketingRaw.marketingStrategy?.keySellingPoints || [],
      loglines: seriesMarketingRaw.marketingHooks?.seriesHooks || [],
      taglines: [],
      socialMediaStrategy: {
        platforms: Object.keys(seriesMarketingRaw.platformStrategies || {}),
        contentApproach: seriesMarketingRaw.marketingStrategy?.primaryApproach || '',
        engagementIdeas: []
      },
      marketingStrategyOverview: seriesMarketingRaw.marketingStrategy?.primaryApproach,
      seriesPosterConcept: seriesMarketingRaw.seriesPosterConcept || seriesMarketingRaw.posterConcept,
      seriesTeaserTrailerConcept: seriesMarketingRaw.seriesTeaserTrailerConcept || seriesMarketingRaw.teaserTrailerConcept,
      visualTemplates: seriesMarketingRaw.visualTemplates,
    visualAssets: seriesMarketingRaw.visualAssets,
      ugcStrategy: seriesMarketingRaw.ugcStrategy,
      peerCastingLoop: seriesMarketingRaw.peerCastingLoop,
      platformStrategies: seriesMarketingRaw.platformStrategies,
      arcLaunchStrategy: seriesMarketingRaw.arcLaunchStrategy || seriesMarketingRaw.launchStrategy,
      crossEpisodeThemes: seriesMarketingRaw.crossEpisodeThemes || seriesMarketingRaw.themes,
      visualStyle: seriesMarketingRaw.visualStyle,
      audioStrategy: seriesMarketingRaw.audioStrategy,
      // Include all other fields
      ...seriesMarketingRaw
    }
  }
  const seriesLevel = extractMarketingSection(seriesMarketing, storyBible)
  
  // Extract Arc Level marketing from production assistant
  // ArcMarketingData has nested marketingStrategy structure
  const arcMarketingRaw = arcPreProd?.marketing
  let arcMarketing = arcMarketingRaw
  
  // If it's ArcMarketingData structure, convert it to flat format
  if (arcMarketingRaw?.marketingStrategy) {
    arcMarketing = {
      targetAudience: {
        primary: Array.isArray(arcMarketingRaw.marketingStrategy.targetAudience?.primary)
          ? arcMarketingRaw.marketingStrategy.targetAudience.primary.join(', ')
          : arcMarketingRaw.marketingStrategy.targetAudience?.primary || '',
        secondary: Array.isArray(arcMarketingRaw.marketingStrategy.targetAudience?.secondary)
          ? arcMarketingRaw.marketingStrategy.targetAudience.secondary.join(', ')
          : arcMarketingRaw.marketingStrategy.targetAudience?.secondary || ''
      },
      keySellingPoints: arcMarketingRaw.marketingStrategy?.keySellingPoints || [],
      loglines: [],
      taglines: [],
      socialMediaStrategy: {
        platforms: Object.keys(arcMarketingRaw.platformStrategies || {}),
        contentApproach: arcMarketingRaw.marketingStrategy?.primaryApproach || '',
        engagementIdeas: []
      },
      marketingStrategyOverview: arcMarketingRaw.marketingStrategy?.primaryApproach,
      seriesPosterConcept: arcMarketingRaw.seriesPosterConcept || arcMarketingRaw.posterConcept,
      seriesTeaserTrailerConcept: arcMarketingRaw.seriesTeaserTrailerConcept || arcMarketingRaw.teaserTrailerConcept,
      visualTemplates: arcMarketingRaw.visualTemplates,
      ugcStrategy: arcMarketingRaw.ugcStrategy,
      peerCastingLoop: arcMarketingRaw.peerCastingLoop,
      platformStrategies: arcMarketingRaw.platformStrategies,
      arcLaunchStrategy: arcMarketingRaw.arcLaunchStrategy,
      crossEpisodeThemes: arcMarketingRaw.crossEpisodeThemes,
      visualStyle: arcMarketingRaw.visualStyle,
    audioStrategy: arcMarketingRaw.audioStrategy,
    visualAssets: arcMarketingRaw.visualAssets
    }
  }
  const arcLevel = extractMarketingSection(arcMarketing, storyBible)
  
  // Extract Episode Level marketing from episode pre-production
  // Preserve the actual episode marketing structure (1:1 with generated data)
  const episodeLevel: Record<number, EpisodeMarketingData> = {}
  if (allEpisodePreProd && episodeNumbers) {
    for (const epNum of episodeNumbers) {
      const episodePreProd = allEpisodePreProd[epNum]
      if (episodePreProd?.marketing) {
        // Get episode title from pre-production data
        const episodeTitle = episodePreProd.episodeTitle || `Episode ${epNum}`
        
        // Check if it's already in EpisodeMarketingData format
        const marketing = episodePreProd.marketing
        if (marketing.marketingHooks || marketing.viralPotentialScenes || marketing.platformContent || marketing.readyToUsePosts || marketing.thumbnail) {
          // It's episode-specific marketing data - preserve it as-is
          episodeLevel[epNum] = {
            episodeNumber: epNum,
            episodeTitle: episodeTitle,
            marketingHooks: marketing.marketingHooks,
            viralPotentialScenes: marketing.viralPotentialScenes,
            platformContent: marketing.platformContent,
            readyToUsePosts: marketing.readyToUsePosts,
            thumbnail: marketing.thumbnail,
            // Also include any standard marketing fields if present
            targetAudience: marketing.targetAudience,
            keySellingPoints: marketing.keySellingPoints,
            loglines: marketing.loglines,
            taglines: marketing.taglines,
            socialMediaStrategy: marketing.socialMediaStrategy,
            visualStyle: marketing.visualStyle,
            audioStrategy: marketing.audioStrategy
          }
        } else {
          // It's standard marketing format - convert it
          const episodeMarketing = extractMarketingSection(marketing, storyBible)
          if (episodeMarketing) {
            episodeLevel[epNum] = {
              episodeNumber: epNum,
              episodeTitle: episodeTitle,
              targetAudience: episodeMarketing.targetAudience,
              keySellingPoints: episodeMarketing.keySellingPoints,
              loglines: episodeMarketing.loglines,
              taglines: episodeMarketing.taglines,
              socialMediaStrategy: episodeMarketing.socialMediaStrategy,
              visualStyle: episodeMarketing.visualStyle,
              audioStrategy: episodeMarketing.audioStrategy
            }
          }
        }
      }
    }
  }
  
  // For backward compatibility, use arc level as the main marketing section
  // but include all three levels in the structure
  const mainMarketing = arcLevel || seriesLevel || {
    targetAudience: {
      primary: 'Primary target audience',
      secondary: 'Secondary target audience'
    },
    keySellingPoints: ['Compelling narrative', 'Strong character development', 'Relevant themes'],
    loglines: [storyBible?.logline || storyBible?.synopsis?.substring(0, 200) || ''],
    taglines: [],
    socialMediaStrategy: {
      platforms: ['LinkedIn', 'X (Twitter)', 'YouTube'],
      contentApproach: 'Engaging, shareable content',
      engagementIdeas: []
    }
  }

  // Preserve visual assets on all levels so they survive sharing
  const storyVisualAssets = storyBible?.marketing?.visualAssets || storyBible?.visualAssets
  if (mainMarketing && !(mainMarketing as any).visualAssets) {
    ;(mainMarketing as any).visualAssets = storyVisualAssets
  }
  if (seriesLevel && !(seriesLevel as any).visualAssets) {
    ;(seriesLevel as any).visualAssets = storyVisualAssets
  }
  if (arcLevel && !(arcLevel as any).visualAssets) {
    ;(arcLevel as any).visualAssets = storyVisualAssets
  }
  
  return {
    ...mainMarketing,
    seriesLevel,
    arcLevel,
    episodeLevel: Object.keys(episodeLevel).length > 0 ? episodeLevel : undefined
  }
}

function extractCharacterDepth(actorMaterials: any) {
  if (!actorMaterials?.characters) return undefined
  
  return actorMaterials.characters.slice(0, 3).map((charMat: any) => ({
    characterName: charMat.characterName || '',
    studyGuide: charMat.throughLine ? {
      throughLine: charMat.throughLine.explanation || '',
      superObjective: charMat.throughLine.superObjective || '',
      keyScenes: charMat.throughLine.keyScenes || []
    } : undefined,
    performanceReference: charMat.performanceReference ? {
      references: charMat.performanceReference.map((ref: any) => ref.characterName || ''),
      notes: 'Study these performances for inspiration'
    } : undefined
  }))
}

