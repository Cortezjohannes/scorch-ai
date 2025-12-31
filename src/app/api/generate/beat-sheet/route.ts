import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/services/azure-openai'
import { logger } from '@/services/console-logger'

// Set maximum execution time to 3 minutes (180 seconds) - beat sheets are faster
export const maxDuration = 180

// 🎯 STAGE 1: Beat Sheet Generation from Episode Goal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storyBible, episodeNumber, episodeGoal, previousChoice, previousEpisode, allPreviousEpisodes } = body
    
    if (!storyBible || !episodeNumber || !episodeGoal) {
      return NextResponse.json(
        { error: 'Story bible, episode number, and episode goal are required' },
        { status: 400 }
      )
    }

    logger.startNewSession(`Beat Sheet Generation - Episode ${episodeNumber}`)
    logger.milestone(`Episode Goal: ${episodeGoal}`)
    console.log(`   Previous episode: ${previousEpisode ? 'Yes' : 'None'}`)
    console.log(`   All previous episodes: ${allPreviousEpisodes?.length || 0} episodes`)
    
    // Build comprehensive context for beat sheet generation
    const beatSheetPrompt = buildBeatSheetPrompt(storyBible, episodeNumber, episodeGoal, previousChoice, previousEpisode, allPreviousEpisodes)
    
    const systemPrompt = `You are a master story architect specializing in episode structure and narrative beats. You create detailed, flexible beat sheets that serve as the structural foundation for cinematic episodes.

Your beat sheets are:
- FLEXIBLE: Support 3-6 scenes based on narrative needs (no rigid 3-scene constraint)
- CINEMATIC: Focus on visual storytelling and dramatic moments
- CHARACTER-DRIVEN: Center on character development and relationships
- COHERENT: Maintain continuity with series and previous episodes
- ENGAGING: Include compelling hooks, conflicts, and resolutions

Return ONLY the beat sheet content - no JSON, no explanations, just the structured beats.`

    console.log('🎯 Generating beat sheet for episode goal:', episodeGoal)
    
    const result = await generateContent(beatSheetPrompt, {
      model: 'gpt-4.1',
      systemPrompt,
      temperature: 0.85, // High creativity for structure
      maxTokens: 2000
    })
    
    // Validate and enhance the result
    let finalBeatSheet = result
    if (!result || result.length < 50) {
      // Generate fallback beat sheet if the result is too short
      finalBeatSheet = generateFallbackBeatSheet(episodeGoal, episodeNumber, storyBible)
      console.warn('Generated fallback beat sheet due to short AI response')
    }
    
    logger.milestone('Beat sheet generation complete')
    
    return NextResponse.json({
      success: true,
      beatSheet: finalBeatSheet,
      episodeNumber,
      episodeGoal,
      fallbackUsed: finalBeatSheet !== result
    })
    
  } catch (error) {
    console.error('❌ Beat sheet generation error:', error)
    logger.error('Beat Sheet Generation', 'Beat Sheet Engine', error instanceof Error ? error.message : 'Unknown error')
    
    return NextResponse.json(
      { 
        error: 'Beat sheet generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper function to build comprehensive story bible context
function buildComprehensiveStoryBibleContext(storyBible: any): string {
  if (!storyBible) return 'No story bible provided.';
  
  const sections: string[] = [];
  
  // Core Identity
  sections.push('=== SERIES IDENTITY ===');
  if (storyBible.seriesTitle) sections.push(`Series Title: ${storyBible.seriesTitle}`);
  if (storyBible.genre) sections.push(`Genre: ${storyBible.genre}`);
  if (storyBible.tone) sections.push(`Tone: ${storyBible.tone}`);
  if (storyBible.targetAudience) {
    const audience = typeof storyBible.targetAudience === 'string' 
      ? storyBible.targetAudience 
      : storyBible.targetAudience.primary || storyBible.targetAudience.primaryAudience || '';
    if (audience) sections.push(`Target Audience: ${audience}`);
  }
  
  // Premise
  if (storyBible.premise) {
    sections.push('\n=== PREMISE ===');
    if (typeof storyBible.premise === 'string') {
      sections.push(storyBible.premise);
    } else {
      if (storyBible.premise.premiseStatement) sections.push(storyBible.premise.premiseStatement);
      if (storyBible.premise.coreConflict) sections.push(`Core Conflict: ${storyBible.premise.coreConflict}`);
      if (storyBible.premise.stakes) sections.push(`Stakes: ${storyBible.premise.stakes}`);
    }
  }
  
  // Characters (ALL characters, not truncated)
  if (storyBible.mainCharacters && storyBible.mainCharacters.length > 0) {
    sections.push('\n=== CHARACTERS ===');
    storyBible.mainCharacters.forEach((char: any, index: number) => {
      const charDetails: string[] = [];
      charDetails.push(`${index + 1}. ${char.name || 'Unnamed Character'}`);
      if (char.archetype || char.premiseRole) charDetails.push(`   Archetype/Role: ${char.archetype || char.premiseRole}`);
      if (char.description) {
        const desc = typeof char.description === 'string' ? char.description : JSON.stringify(char.description);
        charDetails.push(`   Description: ${desc}`);
      }
      if (char.background) {
        const bg = typeof char.background === 'string' ? char.background : JSON.stringify(char.background);
        charDetails.push(`   Background: ${bg}`);
      }
      if (char.psychology) {
        if (char.psychology.want) charDetails.push(`   Want: ${char.psychology.want}`);
        if (char.psychology.need) charDetails.push(`   Need: ${char.psychology.need}`);
        if (char.psychology.fear) charDetails.push(`   Fear: ${char.psychology.fear}`);
        if (char.psychology.flaw || char.psychology.primaryFlaw) charDetails.push(`   Flaw: ${char.psychology.flaw || char.psychology.primaryFlaw}`);
      }
      if (char.relationships) {
        const rels = typeof char.relationships === 'string' ? char.relationships : JSON.stringify(char.relationships);
        charDetails.push(`   Relationships: ${rels}`);
      }
      if (char.arc) {
        const arc = typeof char.arc === 'string' ? char.arc : JSON.stringify(char.arc);
        charDetails.push(`   Character Arc: ${arc}`);
      }
      if (char.motivation) charDetails.push(`   Motivation: ${char.motivation}`);
      if (char.internalConflict) charDetails.push(`   Internal Conflict: ${char.internalConflict}`);
      if (char.voice) charDetails.push(`   Voice: ${char.voice}`);
      if (char.goals) {
        const goals = typeof char.goals === 'string' ? char.goals : JSON.stringify(char.goals);
        charDetails.push(`   Goals: ${goals}`);
      }
      if (char.fears) {
        const fears = typeof char.fears === 'string' ? char.fears : JSON.stringify(char.fears);
        charDetails.push(`   Fears: ${fears}`);
      }
      if (char.secrets) {
        const secrets = typeof char.secrets === 'string' ? char.secrets : JSON.stringify(char.secrets);
        charDetails.push(`   Secrets: ${secrets}`);
      }
      sections.push(charDetails.join('\n'));
    });
  }
  
  // World Building
  if (storyBible.worldBuilding) {
    sections.push('\n=== WORLD BUILDING ===');
    if (typeof storyBible.worldBuilding === 'string') {
      sections.push(storyBible.worldBuilding);
    } else {
      if (storyBible.worldBuilding.setting) {
        const setting = typeof storyBible.worldBuilding.setting === 'string' 
          ? storyBible.worldBuilding.setting 
          : JSON.stringify(storyBible.worldBuilding.setting);
        sections.push(`Setting: ${setting}`);
      }
      if (storyBible.worldBuilding.rules) {
        if (Array.isArray(storyBible.worldBuilding.rules)) {
          sections.push(`World Rules:\n${storyBible.worldBuilding.rules.map((r: string) => `- ${r}`).join('\n')}`);
        } else {
          sections.push(`World Rules: ${storyBible.worldBuilding.rules}`);
        }
      }
      if (storyBible.worldBuilding.locations && Array.isArray(storyBible.worldBuilding.locations)) {
        sections.push('\nLocations:');
        storyBible.worldBuilding.locations.forEach((loc: any) => {
          const locDetails: string[] = [];
          if (loc.name) locDetails.push(`  - ${loc.name}`);
          if (loc.type) locDetails.push(`    Type: ${loc.type}`);
          if (loc.description) {
            const desc = typeof loc.description === 'string' ? loc.description : JSON.stringify(loc.description);
            locDetails.push(`    Description: ${desc}`);
          }
          if (loc.significance) locDetails.push(`    Significance: ${loc.significance}`);
          if (loc.recurringEvents && Array.isArray(loc.recurringEvents)) {
            locDetails.push(`    Recurring Events: ${loc.recurringEvents.join(', ')}`);
          }
          if (loc.conflicts && Array.isArray(loc.conflicts)) {
            locDetails.push(`    Conflicts: ${loc.conflicts.join(', ')}`);
          }
          sections.push(locDetails.join('\n'));
        });
      }
    }
  }
  
  // Themes
  if (storyBible.theme || storyBible.themes) {
    sections.push('\n=== THEMES ===');
    if (storyBible.themes && Array.isArray(storyBible.themes)) {
      storyBible.themes.forEach((theme: string, index: number) => {
        sections.push(`${index + 1}. ${theme}`);
      });
    } else if (storyBible.theme) {
      sections.push(storyBible.theme);
    }
  }
  
  // Narrative Elements
  if (storyBible.narrativeElements) {
    sections.push('\n=== NARRATIVE ELEMENTS ===');
    if (storyBible.narrativeElements.callbacks) {
      sections.push(`Callbacks: ${storyBible.narrativeElements.callbacks}`);
    }
    if (storyBible.narrativeElements.foreshadowing) {
      sections.push(`Foreshadowing: ${storyBible.narrativeElements.foreshadowing}`);
    }
    if (storyBible.narrativeElements.recurringMotifs) {
      sections.push(`Recurring Motifs: ${storyBible.narrativeElements.recurringMotifs}`);
    }
  }
  
  // Narrative Arcs
  if (storyBible.narrativeArcs && Array.isArray(storyBible.narrativeArcs)) {
    sections.push('\n=== NARRATIVE ARCS ===');
    storyBible.narrativeArcs.forEach((arc: any, index: number) => {
      const arcDetails: string[] = [];
      arcDetails.push(`Arc ${index + 1}: ${arc.title || `Arc ${index + 1}`}`);
      if (arc.summary) {
        const summary = typeof arc.summary === 'string' ? arc.summary : JSON.stringify(arc.summary);
        arcDetails.push(`  Summary: ${summary}`);
      }
      if (arc.episodes && Array.isArray(arc.episodes)) {
        arcDetails.push(`  Episodes: ${arc.episodes.length} episodes`);
        arc.episodes.forEach((ep: any) => {
          if (ep.title) arcDetails.push(`    - Episode ${ep.number || '?'}: ${ep.title}`);
        });
      }
      sections.push(arcDetails.join('\n'));
    });
  }
  
  return sections.join('\n');
}

function buildBeatSheetPrompt(
  storyBible: any, 
  episodeNumber: number, 
  episodeGoal: string, 
  previousChoice?: string,
  previousEpisode?: any,
  allPreviousEpisodes?: any[]
): string {
  // Build comprehensive story bible context
  const storyBibleContext = buildComprehensiveStoryBibleContext(storyBible);
  
  // Find relevant narrative arc for episode positioning
  const narrativeArcInfo = (storyBible.narrativeArcs || [])
    .filter((arc: any) => {
      const episodes = arc.episodes || []
      return episodes.some((ep: any) => ep.number === episodeNumber)
    })
    .map((arc: any) => {
      const episode = (arc.episodes || []).find((ep: any) => ep.number === episodeNumber)
      return {
        arcTitle: arc.title || `Arc ${Math.ceil(episodeNumber / 10)}`,
        arcSummary: arc.summary || 'Continuing journey',
        episodeTitle: episode?.title || `Episode ${episodeNumber}`
      }
    })[0] || {
      arcTitle: `Arc ${Math.ceil(episodeNumber / 10)}`,
      arcSummary: 'Story progression continues...',
      episodeTitle: `Episode ${episodeNumber}`
    }

  // Build ALL previous episodes context for full story continuity
  let allPreviousEpisodesContext = ''
  if (allPreviousEpisodes && allPreviousEpisodes.length > 0) {
    allPreviousEpisodesContext = `\n\n📺 ALL PREVIOUS EPISODES (Full Story Context):`
    
    // Sort episodes by episode number
    const sortedEpisodes = [...allPreviousEpisodes].sort((a, b) => {
      const aNum = a.episodeNumber || 0
      const bNum = b.episodeNumber || 0
      return aNum - bNum
    })
    
    sortedEpisodes.forEach((ep: any) => {
      const epNum = ep.episodeNumber || '?'
      const epTitle = ep.title || ep.episodeTitle || `Episode ${epNum}`
      const epSynopsis = ep.synopsis || ''
      
      allPreviousEpisodesContext += `\n\nEpisode ${epNum}: "${epTitle}"`
      if (epSynopsis) {
        allPreviousEpisodesContext += `\nSynopsis: ${epSynopsis}`
      }
      
      // Include key scenes for context (limit to last 2 scenes to avoid token bloat)
      const scenes = ep.scenes || []
      if (scenes.length > 0) {
        const keyScenes = scenes.slice(-2)
        keyScenes.forEach((scene: any, index: number) => {
          const sceneTitle = scene.title || `Scene ${scene.sceneNumber || index + 1}`
          const sceneContent = scene.content || scene.screenplay || scene.sceneContent || ''
          // Include scene preview (first 200 chars)
          const preview = sceneContent.substring(0, 200) + (sceneContent.length > 200 ? '...' : '')
          allPreviousEpisodesContext += `\n\n  ${sceneTitle}:\n  ${preview}`
        })
      }
    })
  }
  
  // Build immediate previous episode context (full detail)
  let previousEpisodeContext = ''
  if (previousEpisode) {
    const prevEpTitle = previousEpisode.title || previousEpisode.episodeTitle || `Episode ${episodeNumber - 1}`
    const prevEpSynopsis = previousEpisode.synopsis || ''
    const prevEpScenes = previousEpisode.scenes || []
    
    previousEpisodeContext = `\n\nPREVIOUS EPISODE (Episode ${episodeNumber - 1}): "${prevEpTitle}"`
    
    if (prevEpSynopsis) {
      previousEpisodeContext += `\nSynopsis: ${prevEpSynopsis}`
    }
    
    if (prevEpScenes.length > 0) {
      previousEpisodeContext += `\n\nPrevious Episode Scenes:`
      prevEpScenes.forEach((scene: any, index: number) => {
        const sceneTitle = scene.title || `Scene ${scene.sceneNumber || index + 1}`
        const sceneContent = scene.content || scene.screenplay || scene.sceneContent || ''
        // Include full scene content for better context
        previousEpisodeContext += `\n\n${sceneTitle}:\n${sceneContent}`
      })
    }
  }

  // Previous choice context
  const previousChoiceContext = previousChoice ? `
PREVIOUS CHOICE: "${previousChoice}"

CRITICAL NARRATIVE STRUCTURE REQUIREMENTS:
When a previous choice exists, the beat sheet MUST follow this progression:
1. START: Show the immediate aftermath and consequences of the previous episode's ending
   - Reference specific events, characters, and situations from the previous episode above
   - Where do the characters find themselves after the choice was made?
   - What are the immediate reactions and ripple effects?
   
2. MIDDLE: Build tension, conflict, and development leading toward the chosen option
   - Create escalating complications that naturally lead to the chosen option's narrative moment
   - Develop character motivations, conflicts, and situations that build toward the choice
   - DO NOT jump directly to the choice's consequences - show the journey there
   
3. END: Place the chosen option's narrative beat near the end (final 1-2 beats)
   - The chosen option should feel like the natural culmination of the episode's buildup
   - The final beat should end on a specific emotional note (high/low, good/bad) reflecting the choice's impact
   - Set up the consequences for the next episode, but don't fully resolve them yet

The episode should feel like a gradual progression toward the chosen option, not a sudden jump.
  ` : ''
  
  const previousContext = `${allPreviousEpisodesContext}${previousEpisodeContext}${previousChoiceContext}`

  return `Create a detailed beat sheet for Episode ${episodeNumber} of "${storyBible.seriesTitle || 'Untitled Series'}".

${storyBibleContext}

CURRENT EPISODE CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Arc: ${narrativeArcInfo.arcTitle}
Arc Summary: ${narrativeArcInfo.arcSummary}
Episode: ${narrativeArcInfo.episodeTitle}

${previousContext}

EPISODE GOAL:
"${episodeGoal}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEAT SHEET REQUIREMENTS:
• Create 3-6 scenes based on what the story needs (no rigid constraints)
• Each beat should advance the episode goal while developing characters
• Include specific dramatic moments, conflicts, and character interactions
• Ensure each scene has clear purpose and emotional stakes
• Design scenes for approximately 5-minute total runtime
• Include compelling opening hook and cliffhanger ending
• Maintain series continuity and character consistency
• Consider the genre and tone in scene construction

BEAT SHEET FORMAT:
══════════════════════════════════════════════════════════════
EPISODE ${episodeNumber}: [Episode Title]
══════════════════════════════════════════════════════════════

OPENING HOOK (30-60 seconds):
[Compelling opening that immediately engages audience]

BEAT 1: [Scene Title] (Location - Time)
PURPOSE: [What this scene accomplishes]
CONFLICT: [Central tension or obstacle]
CHARACTER FOCUS: [Which characters drive this scene]
KEY MOMENTS:
• [Specific dramatic beat]
• [Character development moment]
• [Plot advancement]
TRANSITION: [How it leads to next scene]

BEAT 2: [Scene Title] (Location - Time)
[Same detailed structure]

[Continue for 3-6 beats as needed]

CLIFFHANGER/RESOLUTION (30-60 seconds):
[Compelling ending that resolves episode goal while setting up future episodes]

EPISODE THEME: [What deeper meaning or character growth occurs]
CHARACTER ARCS: [How characters change or develop]
SERIES IMPACT: [How this episode affects the larger story]
══════════════════════════════════════════════════════════════

Create a beat sheet that transforms the episode goal into compelling, cinematic storytelling that advances both character and plot while maintaining the series' unique voice and vision.`
}

// Fallback beat sheet generator for when AI fails
function generateFallbackBeatSheet(episodeGoal: string, episodeNumber: number, storyBible: any): string {
  const seriesTitle = storyBible.seriesTitle || 'Untitled Series'
  const mainCharacter = storyBible.mainCharacters?.[0]?.name || 'Protagonist'
  
  return `══════════════════════════════════════════════════════════════
EPISODE ${episodeNumber}: ${episodeGoal}
══════════════════════════════════════════════════════════════

OPENING HOOK (30-60 seconds):
${mainCharacter} faces an immediate challenge that connects to the episode goal: "${episodeGoal}"

BEAT 1: Establishing the Situation (Location - Present)
PURPOSE: Set up the central conflict and character motivations
CONFLICT: ${mainCharacter} must confront the main challenge
CHARACTER FOCUS: ${mainCharacter} and supporting characters
KEY MOMENTS:
• Introduction of the episode's central problem
• Character reactions and initial decisions
• Stakes are established
TRANSITION: Conflict escalates, forcing action

BEAT 2: Rising Action and Development (Location - Present)  
PURPOSE: Develop the conflict and character relationships
CONFLICT: Obstacles increase, tensions rise
CHARACTER FOCUS: Character interactions and growth
KEY MOMENTS:
• Characters work toward resolving the episode goal
• Relationships are tested or strengthened
• New complications arise
TRANSITION: Builds toward climactic moment

BEAT 3: Resolution and Forward Movement (Location - Present)
PURPOSE: Address the episode goal and set up future episodes
CONFLICT: Final confrontation or decision point
CHARACTER FOCUS: Character growth and change
KEY MOMENTS:
• Episode goal is addressed (success/failure/complication)
• Character development is solidified
• Series progression is advanced
TRANSITION: Sets up next episode

CLIFFHANGER/RESOLUTION (30-60 seconds):
The resolution of "${episodeGoal}" leads to new questions and challenges for future episodes

EPISODE THEME: Growth, challenge, and progression
CHARACTER ARCS: ${mainCharacter} develops through facing the episode challenge
SERIES IMPACT: This episode advances the overall narrative of ${seriesTitle}
══════════════════════════════════════════════════════════════`
}
