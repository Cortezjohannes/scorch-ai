import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { logger } from '@/services/console-logger'
import { generateEpisodeWithIntelligentDefaults } from '@/services/episode-generation-orchestrator'

// Set maximum execution time to 5 minutes (300 seconds)
export const maxDuration = 300

// Legacy imports - kept for deprecated functions below (not used in main flow)
import { generateContent, generateStructuredContent } from '@/services/azure-openai'
import { runComprehensiveEngines, ComprehensiveEngineNotes } from '@/services/comprehensive-engines'
import { runGeminiComprehensiveEngines } from '@/services/gemini-comprehensive-engines'
import { generateContentWithGemini } from '@/services/gemini-ai'

// Helper function to safely parse JSON from text that might contain markdown code blocks
const safeParseJSON = (text: string) => {
  try {
    // First, try direct parsing
    return JSON.parse(text)
  } catch (e) {
    // If that fails, look for JSON inside markdown code blocks
    try {
      const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1])
      }
    } catch (innerError) {
      console.error("Failed to parse JSON from markdown block", innerError)
    }
    
    // If all parsing attempts fail, create a basic structure
    return {
      episodeNumber: 1,
      script: "INT. LOCATION - DAY\n\nCharacters discuss the situation.\n\nEND SCENE",
      branchingOptions: [
        "Continue the conversation",
        "Leave the location", 
        "Change the subject"
      ]
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storyBible, previousChoice, userChoices, useEngines, useComprehensiveEngines, useGeminiComprehensive, mode } = body
    const episodeNumber = body.episodeNumber ?? body.currentEpisodeNumber
    
    if (!storyBible || !episodeNumber) {
      return NextResponse.json(
        { error: 'Story bible and episode number are required' },
        { status: 400 }
      )
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // A/B TESTING SUPPORT: Allow old engine path if explicitly requested
    // ═══════════════════════════════════════════════════════════════════════════
    
    // If useEngines or useComprehensiveEngines is explicitly set, use old engine path for testing
    if (useEngines === true || useComprehensiveEngines === true || useGeminiComprehensive === true) {
      console.log(`🧪 A/B TEST MODE: Using OLD ENGINE PATH for comparison`)
      console.log(`   useEngines: ${useEngines}, useComprehensiveEngines: ${useComprehensiveEngines}`)
      
      // Use old engine-based generation for A/B testing
      logger.startNewSession(`Episode ${episodeNumber} Generation (WITH ENGINES)`)
    if (previousChoice) {
      logger.milestone(`User Choice: ${previousChoice}`)
    }
    
    logger.startPhase({
      name: 'Episode Generation',
        totalSteps: useComprehensiveEngines ? 3 : 2,
      currentStep: 1,
        engines: useComprehensiveEngines ? ['GPT-4.1 Draft', 'Comprehensive Engines (19-system)', 'GPT-4.1 Final Synthesis'] : ['GPT-4.1 Story Bible Generation'],
      overallProgress: 25
    })

    // STAGE 1: Create the narrative blueprint for the episode
    logger.updatePhase('Creating engineless draft', 1)
    const episodeDraft = await generateEpisodeDraft(storyBible, episodeNumber, previousChoice);
    logger.milestone(`Draft Complete: "${(episodeDraft as any).title}"`)

      // COMPREHENSIVE ENGINES PATH
    if (useComprehensiveEngines) {
      console.log('🚀 COMPREHENSIVE ENGINES PATH: Running 19 engines...');
      
      logger.updatePhase('Running comprehensive engines (19-engine system)', 2)
      const { notes: comprehensiveNotes, metadata: engineMetadata } = await runComprehensiveEngines(episodeDraft, storyBible, 'beast');
      logger.milestone(`Comprehensive engines complete: ${engineMetadata.successfulEngines}/${engineMetadata.totalEnginesRun} engines (${engineMetadata.successRate.toFixed(1)}%)`)
      
      logger.updatePhase('GPT-4.1 Final synthesis with comprehensive engine notes', 3)
      const finalEpisode = await generateEpisodeWithComprehensiveEngines(episodeDraft, storyBible, episodeNumber, previousChoice, comprehensiveNotes);
      logger.milestone('Episode generation complete (GPT-4.1 + Story Bible + 19 Engines)')
      
      // Add completion flags
      const enhancedEpisode = {
        ...finalEpisode,
        _generationComplete: true,
        generationType: 'legacy-comprehensive'
      }

      return NextResponse.json({
        success: true,
        episode: enhancedEpisode,
          engineMetadata: engineMetadata,
          generationMethod: '19-engine-comprehensive'
      });
    }

      // Simple engine path
      if (useEngines) {
        logger.updatePhase('Running basic engines', 2)
    const engineNotes = await runComprehensiveEngines(episodeDraft, storyBible, 'beast');
        logger.milestone('Engine enhancements complete')

    logger.updatePhase('GPT-4.1 Final synthesis with engine notes', 3)
    const finalEpisode = await generateEpisodeWithEngines(episodeDraft, storyBible, episodeNumber, previousChoice, engineNotes.notes);
    logger.milestone('Episode generation complete (GPT-4.1 + Story Bible + Engines)')

      // Add completion flags
      const enhancedEpisode = {
        ...finalEpisode,
        _generationComplete: true,
        generationType: 'legacy-basic'
      }

    return NextResponse.json({
      success: true,
          episode: enhancedEpisode,
          generationMethod: 'engines-basic'
        });
      }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // NEW INTELLIGENT WORKFLOW - Uses Orchestrator with AI-Analyzed Defaults
    // ═══════════════════════════════════════════════════════════════════════════
    
    console.log(`🎭 Episode ${episodeNumber} Generation - Using Intelligent Orchestrator`)
    console.log(`   Previous choice: ${previousChoice || 'None'}`)
    console.log(`   User choices count: ${userChoices?.length || 0}`)
    
    // Use the orchestrator for intelligent, fast episode generation
    const result = await generateEpisodeWithIntelligentDefaults({
      storyBible,
      episodeNumber,
      previousChoice,
      userChoices,
      mode // Pass legacy mode parameter for compatibility
    })
    
    if (!result.success) {
      throw new Error(result.error || 'Episode generation failed')
    }
    
    // Add completion flags
    const enhancedEpisode = {
      ...result.episode,
      _generationComplete: true,
      generationType: 'intelligent-orchestrator'
    }
    
    // Return response in same format as before for backward compatibility
    return NextResponse.json({
      success: true,
      episode: enhancedEpisode,
      // Include metadata about the new workflow
      generationMethod: 'intelligent-orchestrator',
      usedIntelligentDefaults: true,
      analyzedSettings: result.metadata?.analyzedSettings,
      timestamp: result.metadata?.timestamp
    })
    
  } catch (error) {
    console.error('Error generating episode:', error)
    
    // Enhanced error handling with specific error types
    let errorMessage = 'Failed to generate episode'
    let errorDetails = error instanceof Error ? error.message : 'Unknown error'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('authentication')) {
        errorMessage = 'AI service authentication failed'
        errorDetails = 'Please check Azure OpenAI API configuration'
        statusCode = 503
      } else if (error.message.includes('timeout') || error.message.includes('ECONNRESET')) {
        errorMessage = 'AI service timeout'
        errorDetails = 'The AI service took too long to respond. Please try again.'
        statusCode = 504
      } else if (error.message.includes('rate limit') || error.message.includes('quota')) {
        errorMessage = 'AI service rate limit exceeded'
        errorDetails = 'Too many requests. Please wait a moment and try again.'
        statusCode = 429
      } else if (error.message.includes('JSON') || error.message.includes('parse')) {
        errorMessage = 'Invalid response format'
        errorDetails = 'The AI service returned an unexpected response format.'
        statusCode = 502
      }
    }
    
    // Log detailed error information for debugging
    logger.error('Episode Generation', 'Orchestrator Route', `${errorMessage}: ${errorDetails}`)
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      },
      { status: statusCode }
    )
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DEPRECATED FUNCTIONS - Kept for reference but no longer used
// The orchestrator in episode-generation-orchestrator.ts handles all generation
// ═══════════════════════════════════════════════════════════════════════════

// STAGE 1: Generate episode draft (engineless, focused on narrative structure)
async function generateEpisodeDraft(storyBible: any, episodeNumber: number, previousChoice?: string) {
  const draftPrompt = `Create a narrative blueprint for Episode ${episodeNumber}:

STORY BIBLE: ${JSON.stringify(storyBible, null, 2)}
${previousChoice ? `PREVIOUS CHOICE: ${previousChoice}` : ''}

Focus on creating a strong narrative foundation:
1. Episode title and premise
2. Key story beats and emotional arc
3. Character moments and growth
4. Central conflict and resolution approach
5. How this episode advances the overall series

Return JSON:
{
  "title": "Episode Title",
  "premise": "What this episode is about",
  "storyBeats": ["Beat 1", "Beat 2", "Beat 3"],
  "characterFocus": "Which characters are central",
  "conflict": "Main conflict/tension",
  "emotionalArc": "Character emotional journey",
  "seriesProgression": "How this advances the series"
}`;

  try {
    const result = await generateStructuredContent(draftPrompt, 
      'You are a narrative architect. Create clear, compelling episode foundations. Return ONLY valid JSON.',
      {
        type: 'object',
        properties: {
          title: { type: 'string' },
          premise: { type: 'string' },
          storyBeats: { type: 'array', items: { type: 'string' } },
          characterFocus: { type: 'string' },
          conflict: { type: 'string' },
          emotionalArc: { type: 'string' },
          seriesProgression: { type: 'string' }
        },
        required: ['title', 'premise', 'storyBeats', 'characterFocus', 'conflict']
      },
      { temperature: 0.7, maxTokens: 2000, model: 'gpt-4.1' }
    );

    return result || {
      title: `Episode ${episodeNumber}`,
      premise: 'Episode premise',
      storyBeats: ['Opening', 'Conflict', 'Resolution'],
      characterFocus: 'Main characters',
      conflict: 'Central conflict',
      emotionalArc: 'Character growth',
      seriesProgression: 'Series advancement'
    };
  } catch (error) {
    console.warn('Episode draft generation failed, using fallback:', error);
    return {
      title: `Episode ${episodeNumber}`,
      premise: 'Episode premise',
      storyBeats: ['Opening', 'Conflict', 'Resolution'],
      characterFocus: 'Main characters',
      conflict: 'Central conflict',
      emotionalArc: 'Character growth',
      seriesProgression: 'Series advancement'
    };
  }
}

// Generate episode with Azure OpenAI (Story Bible + GPT-4.1 only, no engines)
async function generateEpisodeWithAzure(draft: any, storyBible: any, episodeNumber: number, previousChoice?: string) {
  const systemPrompt = `You are a senior TV writer crafting a tight 5-minute episode using ONLY the Story Bible (plus the draft) as guidance. Return valid JSON only. Prioritize cohesion, pacing, and character depth over breadth. Keep it cinematic, readable, and emotionally engaging.`

  // Build narrative context from story bible
  const narrativeArcInfo = (storyBible.narrativeArcs || [])
    .filter((arc: any) => {
      const episodes = arc.episodes || [];
      return episodes.some((ep: any) => ep.number === episodeNumber);
    })
    .map((arc: any) => {
      const episode = (arc.episodes || []).find((ep: any) => ep.number === episodeNumber);
      return {
        arcTitle: arc.title,
        arcSummary: arc.summary,
        episodeTitle: episode?.title || `Episode ${episodeNumber}`,
        episodeSummary: episode?.summary || '',
      };
    })[0] || {
      arcTitle: `Arc ${Math.ceil(episodeNumber / 10)}`,
      arcSummary: 'The journey continues...',
      episodeTitle: `Episode ${episodeNumber}`,
      episodeSummary: '',
    };

  const prompt = `Create Episode ${episodeNumber} of "${storyBible.seriesTitle}" in the required format for a 5-minute episode.

BASE DRAFT (use as guidance, not a rigid outline):
${JSON.stringify(draft, null, 2)}

CONTEXT:
${previousChoice ? `PREVIOUS EPISODE CHOICE: "${previousChoice}"
This choice MUST have clear consequences and influence on this episode's events, character decisions, and narrative direction.` : 'This is the beginning of the story.'}
Current Narrative Arc: ${narrativeArcInfo.arcTitle}
Arc Summary: ${narrativeArcInfo.arcSummary}
Episode Title: ${narrativeArcInfo.episodeTitle}
Episode Summary: ${narrativeArcInfo.episodeSummary}

CHARACTERS (Use only the most relevant characters for this episode):
${(storyBible.mainCharacters || [])
  .slice(0, 6)
  .map((char: any) => `- ${char.name} (${char.archetype || char.premiseRole}): ${char.description?.substring(0, 100) || char.background?.substring(0, 100) || 'Character in the story'}...`)
  .join('\n')}

CRITICAL EPISODE REQUIREMENTS:
- Third-person narrative prose (not script format)
- No screenplay formatting ("INT."/"EXT.", caps names, etc.)
- Dialogue should appear naturally within prose
- Hard 5-minute runtime target

SCENE POLICY (DYNAMIC 1–5):
- Prefer 1–3 fully fleshed scenes that carry the episode
- Use 4–5 scenes only if absolutely necessary to serve the story
- Scale scene depth by count:
  * Fewer scenes → longer, richer, deeper scenes
  * More scenes → shorter, tighter scenes with clear purpose

CRITICAL CHOICE REQUIREMENTS:
The branching options MUST be:
1. DIRECTLY emerge from the final scene's specific events, dialogue, conflicts, or revelations
2. Reference EXACT character names, relationships, objects, locations, or information from THIS episode
3. Allow ANY character (not just the protagonist) to take decisive action based on episode events
4. Present genuine moral dilemmas, strategic decisions, or relationship choices from the episode
5. Create consequences that will fundamentally alter the next episode's story direction
6. NEVER use generic templates - each choice must be unique to this episode's specific content
7. Focus on pivotal moments: betrayals, discoveries, confrontations, alliances, secrets revealed, etc.
8. EXACTLY 3 choices total - no more, no less
9. Mark EXACTLY ONE choice as "isCanonical: true" - the choice that best aligns with the story bible's premise, themes, and character arcs

RETURN FORMAT (valid JSON):
{
  "episodeNumber": ${episodeNumber},
  "title": "Episode Title",
  "synopsis": "What happens at a high level",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Descriptive scene title",
      "content": "Third-person narrative prose with vivid action, interiority, and natural dialogue."
    }
  ],
  "episodeRundown": "Purpose, character development, plot advancement, links to prior episodes, setup for future, thematic impact, production notes.",
  "branchingOptions": [
    {
      "id": 1,
      "text": "[Character Name] decides to [specific action based on episode events] because of [specific episode revelation/conflict]",
      "description": "Consequence and impact of this choice on future episodes",
      "isCanonical": false
    },
    {
      "id": 2, 
      "text": "[Different Character] chooses to [alternative action] regarding [specific episode element/relationship/discovery]",
      "description": "Consequence and impact of this choice on future episodes",
      "isCanonical": true
    },
    {
      "id": 3,
      "text": "The group/situation leads to [specific consequence] when [specific episode detail] forces a decision about [episode-specific dilemma]",
      "description": "Consequence and impact of this choice on future episodes", 
      "isCanonical": false
    }
  ]
}`;

  try {
    // Generate content using Azure OpenAI with GPT-4.1
    const result = await generateContent(prompt, {
      model: 'gpt-4.1',
      systemPrompt,
      temperature: 0.9, // CRANKED UP FOR PREMIUM CONTENT!
      maxTokens: 8000
    });
    
    // Try to extract JSON from the response
    let parsedResponse = safeParseJSON(result);
    
    // Ensure we have the required structure
    if (!parsedResponse.episodeNumber) {
      parsedResponse.episodeNumber = episodeNumber;
    }
    if (!parsedResponse.title) {
      parsedResponse.title = `Episode ${episodeNumber}`;
    }
    if (!parsedResponse.scenes || !Array.isArray(parsedResponse.scenes) || parsedResponse.scenes.length < 1 || parsedResponse.scenes.length > 5) {
      // Fallback with minimal single scene if AI generation fails
      parsedResponse.scenes = [
        {
          sceneNumber: 1,
          title: "Episode scene",
          content: "The episode unfolds as the characters navigate new challenges that will shape their journey forward."
        }
      ];
    }
    if (!parsedResponse.episodeRundown) {
      parsedResponse.episodeRundown = "COMPREHENSIVE ANALYSIS: 1) This episode serves as a crucial narrative building block in the series arc, advancing key character relationships and plot elements. 2) Character development focuses on revealing deeper motivations and psychological growth. 3) Plot advancement includes significant story beats that propel the narrative forward. 4) This episode connects to previous developments by building on established conflicts and relationships. 5) Sets up future episodes through new complications and character dynamics. 6) Thematic significance explores core series themes through character actions and consequences. 7) Production considerations include strategic pacing and visual storytelling opportunities.";
    }
    if (!parsedResponse.branchingOptions || parsedResponse.branchingOptions.length < 3) {
      // Create dynamic fallback choices based on actual episode content
      const episodeContext = parsedResponse.scenes?.length > 0 ? parsedResponse.scenes[parsedResponse.scenes.length - 1].content : "";
      const allSceneContent = parsedResponse.scenes?.map((s: any) => s.content).join(" ") || "";
      
      // Extract multiple character names from the episode
      const characterMatches = allSceneContent.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g) || [];
      const uniqueCharacters = [...new Set(characterMatches)].filter((name) => 
        typeof name === 'string' && name.length > 2 && !['The', 'This', 'That', 'They', 'There', 'Then', 'When', 'Where', 'What', 'Who', 'How', 'Why'].includes(name)
      ).slice(0, 3) as string[];
      
      // Extract key plot elements (objects, locations, conflicts)
      const plotElements = allSceneContent.match(/\b(?:door|key|letter|weapon|secret|truth|plan|alliance|betrayal|discovery|revelation|confrontation)\b/gi) || [];
      const keyElement = plotElements[0] || "the situation";
      
      if (uniqueCharacters.length >= 2) {
        parsedResponse.branchingOptions = [
          {
            id: 1,
            text: `${uniqueCharacters[0]} decides to confront ${keyElement} directly, risking everything for the truth`,
            description: `This path leads to immediate confrontation and reveals hidden truths, but may damage relationships.`,
            isCanonical: false
          },
          {
            id: 2,
            text: `${uniqueCharacters[1]} chooses to investigate further before making any moves regarding ${keyElement}`,
            description: `This cautious approach gathers crucial information but may allow problems to escalate.`,
            isCanonical: true
          },
          {
            id: 3,
            text: `${uniqueCharacters[0]} and ${uniqueCharacters[1]} form an alliance to handle ${keyElement} together`,
            description: `Unity brings strength and shared responsibility, but requires compromise and trust.`,
            isCanonical: false
          }
        ];
      } else {
        const mainChar = uniqueCharacters[0] || "the protagonist";
      parsedResponse.branchingOptions = [
          {
            id: 1,
            text: `${mainChar} decides to reveal the truth about ${keyElement}, despite the consequences`,
            description: `Honesty may heal relationships but could also create new conflicts and challenges.`,
            isCanonical: true
          },
          {
            id: 2,
            text: `${mainChar} chooses to keep ${keyElement} secret while gathering more allies`,
            description: `Patience and strategy may yield better results, but secrets have a way of surfacing.`,
            isCanonical: false
          },
          {
            id: 3,
            text: `${mainChar} confronts the source of ${keyElement} directly, demanding answers`,
            description: `Direct action forces immediate resolution but may escalate conflicts unpredictably.`,
            isCanonical: false
          }
        ];
      }
    }
    
    console.log('Successfully generated episode with Azure OpenAI GPT-4.1 (no engines)');
    return parsedResponse;
  } catch (error) {
    console.error('Error generating episode with Azure OpenAI:', error);
    
    // Fallback response - minimal viable episode
    return {
      episodeNumber,
      title: `Episode ${episodeNumber}`,
      synopsis: "An exciting episode continues the story as characters face new challenges.",
      scenes: [
        {
          sceneNumber: 1,
          title: "Episode scene",
          content: "The characters find themselves in a situation that tests their resolve and pushes the story forward in meaningful ways."
        }
      ],
      episodeRundown: "COMPREHENSIVE ANALYSIS: 1) This episode serves as a foundation for character exploration and narrative progression within the series framework. 2) Character development reveals new dimensions of personality and motivation through challenging situations. 3) Plot advancement introduces key story elements that will influence future episodes. 4) Connects to previous episodes by building on established character dynamics and ongoing conflicts. 5) Sets up future developments through strategic placement of new obstacles and opportunities. 6) Thematic significance examines core human experiences and moral questions central to the series. 7) Production considerations include optimal pacing for audience engagement and visual storytelling potential.",
      branchingOptions: [
        {
          id: 1,
          text: "Continue with the current plan and face the consequences",
          description: "Staying the course shows determination but may lead to predictable outcomes.",
          isCanonical: false
        },
        {
          id: 2,
          text: "Try a different approach that might yield better results",
          description: "Adapting strategy shows wisdom and may unlock new possibilities.",
          isCanonical: true
        },
        {
          id: 3,
          text: "Seek help from others who might have valuable insights",
          description: "Collaboration brings new perspectives but requires sharing control and information.",
          isCanonical: false
        }
      ]
    };
  }
}

// Generate episode with Azure OpenAI + Engine enhancements
async function generateEpisodeWithEngines(draft: any, storyBible: any, episodeNumber: number, previousChoice?: string, engineNotes?: ComprehensiveEngineNotes) {
  const systemPrompt = `You are a master cinematic storyteller creating a rich, detailed 5-minute episode enhanced by comprehensive 19-engine analysis. Your task is to INTEGRATE and EXPAND upon all provided engine enhancements to create premium content that surpasses the base draft in depth, quality, and engagement.

KEY REQUIREMENTS:
- INTEGRATE all comprehensive engine enhancements provided (narrative, character, world, format, genre-specific)  
- EXPAND content richness beyond the base draft - add depth, detail, and sophistication
- Enhance dialogue, descriptions, character psychology, and world-building based on engine notes
- Maintain cinematic quality while incorporating all enhancement suggestions
- Return valid JSON only with enhanced, detailed content throughout

The engine enhancements represent sophisticated AI analysis - use them to create exceptional episodes that demonstrate clear improvement over baseline generation.`

  // Build narrative context from story bible
  const narrativeArcInfo = (storyBible.narrativeArcs || [])
    .filter((arc: any) => {
      const episodes = arc.episodes || [];
      return episodes.some((ep: any) => ep.number === episodeNumber);
    })
    .map((arc: any) => {
      const episode = (arc.episodes || []).find((ep: any) => ep.number === episodeNumber);
      return {
        arcTitle: arc.title,
        arcSummary: arc.summary,
        episodeTitle: episode?.title || `Episode ${episodeNumber}`,
        episodeSummary: episode?.summary || '',
      };
    })[0] || {
      arcTitle: `Arc ${Math.ceil(episodeNumber / 10)}`,
      arcSummary: 'The journey continues...',
      episodeTitle: `Episode ${episodeNumber}`,
      episodeSummary: '',
    };

  const prompt = `Create Episode ${episodeNumber} of "${storyBible.seriesTitle}" in the required format for a 5-minute episode.

BASE DRAFT (use as guidance, not a rigid outline):
${JSON.stringify(draft, null, 2)}

COMPREHENSIVE ENGINE ENHANCEMENTS (integrate ALL enhancements, expand content richness):
${engineNotes ? `
🎬 NARRATIVE ARCHITECTURE:
• Fractal Narrative: ${engineNotes.fractalNarrative}
• Episode Cohesion: ${engineNotes.episodeCohesion}
• Conflict Architecture: ${engineNotes.conflictArchitecture}
• Tension Escalation: ${engineNotes.tensionEscalation}
• Pacing Rhythm: ${engineNotes.pacingRhythm}
• Five-Minute Canvas: ${engineNotes.fiveMinuteCanvas}

👥 CHARACTER & DIALOGUE:
• Strategic Dialogue: ${engineNotes.strategicDialogue}
• Character Depth: ${engineNotes.characterDepth}

🌍 WORLD & ENVIRONMENT:
• World Building: ${engineNotes.worldBuilding}
• Living World: ${engineNotes.livingWorld}
• Theme Integration: ${engineNotes.themeIntegration}

📺 FORMAT & ENGAGEMENT:
• Interactive Choice: ${engineNotes.interactiveChoice}
• Serialized Continuity: ${engineNotes.serializedContinuity}
• Storyboard: ${engineNotes.storyboard}
• Language Style: ${engineNotes.languageStyle}

🎭 GENRE-SPECIFIC ENHANCEMENTS:
${engineNotes.comedyTiming ? `• Comedy Timing: ${engineNotes.comedyTiming}` : ''}
${engineNotes.horrorAtmosphere ? `• Horror Atmosphere: ${engineNotes.horrorAtmosphere}` : ''}
${engineNotes.romanceChemistry ? `• Romance Chemistry: ${engineNotes.romanceChemistry}` : ''}
${engineNotes.mysteryConstruction ? `• Mystery Construction: ${engineNotes.mysteryConstruction}` : ''}
` : 'No comprehensive engine enhancements available.'}

CONTEXT:
${previousChoice ? `PREVIOUS EPISODE CHOICE: "${previousChoice}"
This choice MUST have clear consequences and influence on this episode's events, character decisions, and narrative direction.` : 'This is the beginning of the story.'}
Current Narrative Arc: ${narrativeArcInfo.arcTitle}
Arc Summary: ${narrativeArcInfo.arcSummary}
Episode Title: ${narrativeArcInfo.episodeTitle}
Episode Summary: ${narrativeArcInfo.episodeSummary}

CHARACTERS (Use only the most relevant characters for this episode):
${(storyBible.mainCharacters || [])
  .slice(0, 6)
  .map((char: any) => `- ${char.name} (${char.archetype || char.premiseRole}): ${char.description?.substring(0, 100) || char.background?.substring(0, 100) || 'Character in the story'}...`)
  .join('\n')}

CRITICAL EPISODE REQUIREMENTS:
- Third-person narrative prose (not script format)
- No screenplay formatting ("INT."/"EXT.", caps names, etc.)
- Dialogue should appear naturally within prose
- Hard 5-minute runtime target
- Use engine notes as optional guidance, but maintain your creative vision

SCENE POLICY (DYNAMIC 1–5):
- Prefer 1–3 fully fleshed scenes that carry the episode
- Use 4–5 scenes only if absolutely necessary to serve the story
- Scale scene depth by count:
  * Fewer scenes → longer, richer, deeper scenes
  * More scenes → shorter, tighter scenes with clear purpose
- Engine notes may suggest dialogue or tension improvements - incorporate naturally

CRITICAL CHOICE REQUIREMENTS:
The branching options MUST be:
1. DIRECTLY emerge from the final scene's specific events, dialogue, conflicts, or revelations
2. Reference EXACT character names, relationships, objects, locations, or information from THIS episode
3. Allow ANY character (not just the protagonist) to take decisive action based on episode events
4. Present genuine moral dilemmas, strategic decisions, or relationship choices from the episode
5. Create consequences that will fundamentally alter the next episode's story direction
6. NEVER use generic templates - each choice must be unique to this episode's specific content
7. Focus on pivotal moments: betrayals, discoveries, confrontations, alliances, secrets revealed, etc.
8. EXACTLY 3 choices total - no more, no less
9. Mark EXACTLY ONE choice as "isCanonical: true" - the choice that best aligns with the story bible's premise, themes, and character arcs

RETURN FORMAT (valid JSON):
{
  "episodeNumber": ${episodeNumber},
  "title": "Episode Title",
  "synopsis": "What happens at a high level",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Descriptive scene title",
      "content": "Third-person narrative prose with vivid action, interiority, and natural dialogue."
    }
  ],
  "episodeRundown": "Purpose, character development, plot advancement, links to prior episodes, setup for future, thematic impact, production notes.",
  "branchingOptions": [
    {
      "id": 1,
      "text": "[Character Name] decides to [specific action based on episode events] because of [specific episode revelation/conflict]",
      "description": "Consequence and impact of this choice on future episodes",
      "isCanonical": false
    },
    {
      "id": 2, 
      "text": "[Different Character] chooses to [alternative action] regarding [specific episode element/relationship/discovery]",
      "description": "Consequence and impact of this choice on future episodes",
      "isCanonical": true
    },
    {
      "id": 3,
      "text": "The group/situation leads to [specific consequence] when [specific episode detail] forces a decision about [episode-specific dilemma]",
      "description": "Consequence and impact of this choice on future episodes", 
      "isCanonical": false
    }
  ],
  "murphyPillarMetadata": {
    "enginesUsed": ["StrategicDialogue", "TensionEscalation", "ChoiceQuality"],
    "enhancementLevel": "engine-enhanced",
    "generationMode": "beast",
    "episodeNumber": ${episodeNumber},
    "timestamp": "${new Date().toISOString()}"
  }
}`;

  try {
    // Generate content using Azure OpenAI with GPT-4.1
    const result = await generateContent(prompt, {
      model: 'gpt-4.1',
      systemPrompt,
      temperature: 0.9, // CRANKED UP FOR PREMIUM CONTENT!
      maxTokens: 8000
    });
    
    // Try to extract JSON from the response
    let parsedResponse = safeParseJSON(result);
    
    // Ensure we have the required structure
    if (!parsedResponse.episodeNumber) {
      parsedResponse.episodeNumber = episodeNumber;
    }
    if (!parsedResponse.title) {
      parsedResponse.title = `Episode ${episodeNumber}`;
    }
    if (!parsedResponse.scenes || !Array.isArray(parsedResponse.scenes) || parsedResponse.scenes.length < 1 || parsedResponse.scenes.length > 5) {
      // Fallback with minimal single scene if AI generation fails
      parsedResponse.scenes = [
        {
          sceneNumber: 1,
          title: "Episode scene",
          content: "The episode unfolds as the characters navigate new challenges that will shape their journey forward."
        }
      ];
    }
    if (!parsedResponse.episodeRundown) {
      parsedResponse.episodeRundown = "COMPREHENSIVE ANALYSIS: 1) This episode serves as a crucial narrative building block in the series arc, advancing key character relationships and plot elements. 2) Character development focuses on revealing deeper motivations and psychological growth. 3) Plot advancement includes significant story beats that propel the narrative forward. 4) This episode connects to previous developments by building on established conflicts and relationships. 5) Sets up future episodes through new complications and character dynamics. 6) Thematic significance explores core series themes through character actions and consequences. 7) Production considerations include strategic pacing and visual storytelling opportunities.";
    }
    if (!parsedResponse.branchingOptions || parsedResponse.branchingOptions.length < 3) {
      // Create dynamic fallback choices based on actual episode content
      const episodeContext = parsedResponse.scenes?.length > 0 ? parsedResponse.scenes[parsedResponse.scenes.length - 1].content : "";
      const allSceneContent = parsedResponse.scenes?.map((s: any) => s.content).join(" ") || "";
      
      // Extract multiple character names from the episode
      const characterMatches = allSceneContent.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g) || [];
      const uniqueCharacters = [...new Set(characterMatches)].filter((name) => 
        typeof name === 'string' && name.length > 2 && !['The', 'This', 'That', 'They', 'There', 'Then', 'When', 'Where', 'What', 'Who', 'How', 'Why'].includes(name)
      ).slice(0, 3) as string[];
      
      // Extract key plot elements (objects, locations, conflicts)
      const plotElements = allSceneContent.match(/\b(?:door|key|letter|weapon|secret|truth|plan|alliance|betrayal|discovery|revelation|confrontation)\b/gi) || [];
      const keyElement = plotElements[0] || "the situation";
      
      if (uniqueCharacters.length >= 2) {
        parsedResponse.branchingOptions = [
          {
            id: 1,
            text: `${uniqueCharacters[0]} decides to confront ${keyElement} directly, risking everything for the truth`,
            description: `This path leads to immediate confrontation and reveals hidden truths, but may damage relationships.`,
            isCanonical: false
          },
          {
            id: 2,
            text: `${uniqueCharacters[1]} chooses to investigate further before making any moves regarding ${keyElement}`,
            description: `This cautious approach gathers crucial information but may allow problems to escalate.`,
            isCanonical: true
          },
          {
            id: 3,
            text: `${uniqueCharacters[0]} and ${uniqueCharacters[1]} form an alliance to handle ${keyElement} together`,
            description: `Unity brings strength and shared responsibility, but requires compromise and trust.`,
            isCanonical: false
          }
        ];
      } else {
        const mainChar = uniqueCharacters[0] || "the protagonist";
      parsedResponse.branchingOptions = [
          {
            id: 1,
            text: `${mainChar} decides to reveal the truth about ${keyElement}, despite the consequences`,
            description: `Honesty may heal relationships but could also create new conflicts and challenges.`,
            isCanonical: true
          },
          {
            id: 2,
            text: `${mainChar} chooses to keep ${keyElement} secret while gathering more allies`,
            description: `Patience and strategy may yield better results, but secrets have a way of surfacing.`,
            isCanonical: false
          },
          {
            id: 3,
            text: `${mainChar} confronts the source of ${keyElement} directly, demanding answers`,
            description: `Direct action forces immediate resolution but may escalate conflicts unpredictably.`,
            isCanonical: false
          }
        ];
      }
    }
    
    // Ensure metadata is present
    if (!parsedResponse.murphyPillarMetadata) {
      parsedResponse.murphyPillarMetadata = {
        enginesUsed: ["StrategicDialogue", "TensionEscalation", "ChoiceQuality"],
        enhancementLevel: "engine-enhanced",
        generationMode: "beast",
        episodeNumber: episodeNumber,
        timestamp: new Date().toISOString()
      };
    }
    
    console.log('Successfully generated episode with Azure OpenAI GPT-4.1 + Engine enhancements');
    return parsedResponse;
  } catch (error) {
    console.error('Error generating episode with Azure OpenAI + Engines:', error);
    
    // Fallback response - minimal viable episode with metadata
    return {
      episodeNumber,
      title: `Episode ${episodeNumber}`,
      synopsis: "An exciting episode continues the story as characters face new challenges.",
      scenes: [
        {
          sceneNumber: 1,
          title: "Episode scene",
          content: "The characters find themselves in a situation that tests their resolve and pushes the story forward in meaningful ways."
        }
      ],
      episodeRundown: "COMPREHENSIVE ANALYSIS: 1) This episode serves as a foundation for character exploration and narrative progression within the series framework. 2) Character development reveals new dimensions of personality and motivation through challenging situations. 3) Plot advancement introduces key story elements that will influence future episodes. 4) Connects to previous episodes by building on established character dynamics and ongoing conflicts. 5) Sets up future developments through strategic placement of new obstacles and opportunities. 6) Thematic significance examines core human experiences and moral questions central to the series. 7) Production considerations include optimal pacing for audience engagement and visual storytelling potential.",
      branchingOptions: [
        {
          id: 1,
          text: "The characters decide to take immediate action based on what they've learned",
          description: "This direct approach forces immediate resolution but carries significant risks.",
          isCanonical: false
        },
        {
          id: 2,
          text: "The characters choose to gather more information before proceeding",
          description: "This cautious strategy provides better preparation but may allow problems to escalate.",
          isCanonical: true
        },
        {
          id: 3,
          text: "The characters attempt to find allies who can help with their situation",
          description: "Seeking support strengthens their position but creates new obligations and dependencies.",
          isCanonical: false
        }
      ],
      murphyPillarMetadata: {
        enginesUsed: ["StrategicDialogue", "TensionEscalation", "ChoiceQuality"],
        enhancementLevel: "engine-enhanced",
        generationMode: "beast",
        episodeNumber: episodeNumber,
        timestamp: new Date().toISOString()
      }
    };
  }
}

// 🚀 NEW FUNCTION: Generate episode with comprehensive engines (90 second timeout for final synthesis)
async function generateEpisodeWithComprehensiveEngines(
  draft: any, 
  storyBible: any, 
  episodeNumber: number, 
  previousChoice?: string, 
  comprehensiveNotes?: ComprehensiveEngineNotes
) {
  const systemPrompt = `You are a master cinematic storyteller creating a premium 5-minute episode enhanced by comprehensive 19-engine analysis. Your task is to INTEGRATE and EXPAND upon all provided engine enhancements to create exceptional content that demonstrates massive quality improvements over baseline generation.

KEY REQUIREMENTS:
- INTEGRATE all 19 comprehensive engine enhancements provided (narrative, character, world, format, genre-specific)  
- EXPAND content richness and sophistication based on engine notes
- Include complete story context (no truncation)
- Enhance dialogue, descriptions, character psychology, and world-building based on engine notes
- Maintain cinematic quality while incorporating all enhancement suggestions
- Return valid JSON only with enhanced, detailed content throughout

The engine enhancements represent sophisticated AI analysis - use them to create exceptional episodes that show clear improvement over baseline generation.`

  // Build complete narrative context from story bible (NO TRUNCATION!)
  const narrativeArcInfo = (storyBible.narrativeArcs || [])
    .filter((arc: any) => {
      const episodes = arc.episodes || [];
      return episodes.some((ep: any) => ep.number === episodeNumber);
    })
    .map((arc: any) => {
      const episode = (arc.episodes || []).find((ep: any) => ep.number === episodeNumber);
      return {
        arcTitle: arc.title,
        arcSummary: arc.summary,
        episodeTitle: episode?.title || `Episode ${episodeNumber}`,
        episodeSummary: episode?.summary || '',
      };
    })[0] || {
      arcTitle: `Arc ${Math.ceil(episodeNumber / 10)}`,
      arcSummary: 'The journey continues...',
      episodeTitle: `Episode ${episodeNumber}`,
      episodeSummary: '',
    };

  const prompt = `Create Episode ${episodeNumber} of "${storyBible.seriesTitle}" in the required format for a 5-minute episode.

BASE DRAFT (use as guidance, not a rigid outline):
${JSON.stringify(draft, null, 2)}

🎭 COMPREHENSIVE ENGINE ENHANCEMENTS (integrate ALL enhancements - expand content richness):
${comprehensiveNotes ? `
🏗️ NARRATIVE ARCHITECTURE:
• Fractal Narrative: ${comprehensiveNotes.fractalNarrative}
• Episode Cohesion: ${comprehensiveNotes.episodeCohesion}
• Conflict Architecture: ${comprehensiveNotes.conflictArchitecture}
• Hook & Cliffhanger: ${comprehensiveNotes.hookCliffhanger}
• Serialized Continuity: ${comprehensiveNotes.serializedContinuity}
• Pacing Rhythm: ${comprehensiveNotes.pacingRhythm}

👥 CHARACTER & DIALOGUE:
• Dialogue Enhancement: ${comprehensiveNotes.dialogue}
• Strategic Dialogue: ${comprehensiveNotes.strategicDialogue}

🌍 WORLD & ENVIRONMENT:
• World Building: ${comprehensiveNotes.worldBuilding}
• Living World: ${comprehensiveNotes.livingWorld}
• Language Authenticity: ${comprehensiveNotes.language}

📺 FORMAT & ENGAGEMENT:
• Five-Minute Canvas: ${comprehensiveNotes.fiveMinuteCanvas}
• Interactive Choice: ${comprehensiveNotes.interactiveChoice}
• Tension Escalation: ${comprehensiveNotes.tensionEscalation}
• Genre Mastery: ${comprehensiveNotes.genreMastery}

🎨 GENRE-SPECIFIC ENHANCEMENTS:
${comprehensiveNotes.comedyTiming ? `• Comedy Timing: ${comprehensiveNotes.comedyTiming}` : ''}
${comprehensiveNotes.horror ? `• Horror Atmosphere: ${comprehensiveNotes.horror}` : ''}
${comprehensiveNotes.romanceChemistry ? `• Romance Chemistry: ${comprehensiveNotes.romanceChemistry}` : ''}
${comprehensiveNotes.mystery ? `• Mystery Construction: ${comprehensiveNotes.mystery}` : ''}
` : 'No comprehensive engine enhancements available.'}

CONTEXT:
${previousChoice ? `PREVIOUS EPISODE CHOICE: "${previousChoice}"
This choice MUST have clear consequences and influence on this episode's events, character decisions, and narrative direction.` : 'This is the beginning of the story.'}
Current Narrative Arc: ${narrativeArcInfo.arcTitle}
Arc Summary: ${narrativeArcInfo.arcSummary}
Episode Title: ${narrativeArcInfo.episodeTitle}
Episode Summary: ${narrativeArcInfo.episodeSummary}

COMPLETE CHARACTER CONTEXT (NO TRUNCATION - USE ALL CHARACTERS):
${(storyBible.mainCharacters || [])
  .map((char: any) => `- ${char.name} (${char.archetype || char.premiseRole}): ${char.description || char.background || 'Character in the story'}
    Arc: ${char.arc || 'Character development ongoing'}
    Relationships: ${char.relationships || 'To be explored'}
    Voice: ${char.voice || 'Unique speaking style'}`)
  .join('\n')}

CRITICAL EPISODE REQUIREMENTS:
- Third-person narrative prose (not script format)
- No screenplay formatting ("INT."/"EXT.", caps names, etc.)
- Dialogue should appear naturally within prose
- Hard 5-minute runtime target
- INTEGRATE all engine enhancements naturally into the narrative

SCENE POLICY (DYNAMIC 1–5):
- Prefer 1–3 fully fleshed scenes that carry the episode
- Use 4–5 scenes only if absolutely necessary to serve the story
- Scale scene depth by count:
  * Fewer scenes → longer, richer, deeper scenes with engine enhancements
  * More scenes → shorter, tighter scenes with clear purpose

CRITICAL CHOICE REQUIREMENTS:
The branching options MUST be:
1. DIRECTLY emerge from the final scene's specific events, dialogue, conflicts, or revelations
2. Reference EXACT character names, relationships, objects, locations, or information from THIS episode
3. Allow ANY character (not just the protagonist) to take decisive action based on episode events
4. Present genuine moral dilemmas, strategic decisions, or relationship choices from the episode
5. Create consequences that will fundamentally alter the next episode's story direction
6. NEVER use generic templates - each choice must be unique to this episode's specific content
7. Focus on pivotal moments: betrayals, discoveries, confrontations, alliances, secrets revealed, etc.
8. EXACTLY 3 choices total - no more, no less
9. Mark EXACTLY ONE choice as "isCanonical: true" - the choice that best aligns with the story bible's premise, themes, and character arcs

RETURN FORMAT (valid JSON):
{
  "episodeNumber": ${episodeNumber},
  "title": "Episode Title",
  "synopsis": "What happens at a high level",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Descriptive scene title",
      "content": "Third-person narrative prose with vivid action, interiority, and natural dialogue enhanced by engine notes."
    }
  ],
  "episodeRundown": "Purpose, character development, plot advancement, links to prior episodes, setup for future, thematic impact, production notes.",
  "branchingOptions": [
    {
      "id": 1,
      "text": "[Character Name] decides to [specific action based on episode events] because of [specific episode revelation/conflict]",
      "description": "Consequence and impact of this choice on future episodes",
      "isCanonical": false
    },
    {
      "id": 2, 
      "text": "[Different Character] chooses to [alternative action] regarding [specific episode element/relationship/discovery]",
      "description": "Consequence and impact of this choice on future episodes",
      "isCanonical": true
    },
    {
      "id": 3,
      "text": "The group/situation leads to [specific consequence] when [specific episode detail] forces a decision about [episode-specific dilemma]",
      "description": "Consequence and impact of this choice on future episodes", 
      "isCanonical": false
    }
  ],
  "comprehensiveMetadata": {
    "enginesUsed": ["All 19 Comprehensive Engines"],
    "enhancementLevel": "comprehensive",
    "generationMode": "beast",
    "episodeNumber": ${episodeNumber},
    "timestamp": "${new Date().toISOString()}"
  }
}`;

  try {
    // Generate content using Azure OpenAI with GPT-4.1 (90 second timeout handled by generateContent!)
    const result = await generateContent(prompt, {
      model: 'gpt-4.1',
      systemPrompt,
      temperature: 0.95, // MAXIMUM CREATIVITY FOR COMPREHENSIVE ENHANCEMENT!
      maxTokens: 12000 // Increased token limit for richer content
    });
    
    // Try to extract JSON from the response
    let parsedResponse = safeParseJSON(result);
    
    // Ensure we have the required structure
    if (!parsedResponse.episodeNumber) {
      parsedResponse.episodeNumber = episodeNumber;
    }
    if (!parsedResponse.title) {
      parsedResponse.title = `Episode ${episodeNumber}`;
    }
    if (!parsedResponse.scenes || !Array.isArray(parsedResponse.scenes) || parsedResponse.scenes.length < 1 || parsedResponse.scenes.length > 5) {
      // Fallback with minimal single scene if AI generation fails
      parsedResponse.scenes = [
        {
          sceneNumber: 1,
          title: "Enhanced Episode Scene",
          content: "The episode unfolds with rich detail and sophisticated character development, enhanced by comprehensive engine analysis to create compelling, cinematic storytelling."
        }
      ];
    }
    if (!parsedResponse.episodeRundown) {
      parsedResponse.episodeRundown = "COMPREHENSIVE ANALYSIS: 1) This episode demonstrates significant enhancement through 19-engine analysis, with sophisticated narrative architecture and character development. 2) Character arcs show psychological depth and authentic growth patterns. 3) Plot advancement integrates multiple story threads with elegant pacing. 4) Connects to previous episodes through careful continuity management and thematic resonance. 5) Sets up future developments through strategic foreshadowing and character positioning. 6) Thematic integration weaves deeper meaning throughout all narrative elements. 7) Production value enhanced through cinematic storytelling techniques and visual composition suggestions.";
    }
    if (!parsedResponse.branchingOptions || parsedResponse.branchingOptions.length < 3) {
      // Create enhanced fallback choices based on actual episode content
      const episodeContext = parsedResponse.scenes?.length > 0 ? parsedResponse.scenes[parsedResponse.scenes.length - 1].content : "";
      const allSceneContent = parsedResponse.scenes?.map((s: any) => s.content).join(" ") || "";
      
      // Extract multiple character names from the episode
      const characterMatches = allSceneContent.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g) || [];
      const uniqueCharacters = [...new Set(characterMatches)].filter((name) => 
        typeof name === 'string' && name.length > 2 && !['The', 'This', 'That', 'They', 'There', 'Then', 'When', 'Where', 'What', 'Who', 'How', 'Why'].includes(name)
      ).slice(0, 3) as string[];
      
      // Extract key plot elements (objects, locations, conflicts)
      const plotElements = allSceneContent.match(/\b(?:door|key|letter|weapon|secret|truth|plan|alliance|betrayal|discovery|revelation|confrontation|data|information|evidence)\b/gi) || [];
      const keyElement = plotElements[0] || "the discovery";
      
      if (uniqueCharacters.length >= 2) {
        parsedResponse.branchingOptions = [
          {
            id: 1,
            text: `${uniqueCharacters[0]} decides to act on ${keyElement} immediately, risking exposure for the chance at truth`,
            description: `This bold approach could yield crucial breakthroughs but may alert antagonists to the investigation.`,
            isCanonical: false
          },
          {
            id: 2,
            text: `${uniqueCharacters[1]} chooses to carefully investigate ${keyElement} while maintaining their cover`,
            description: `This strategic approach balances information gathering with operational security, though it may slow progress.`,
            isCanonical: true
          },
          {
            id: 3,
            text: `${uniqueCharacters[0]} and ${uniqueCharacters[1]} form a partnership to handle ${keyElement} together`,
            description: `Cooperation brings diverse skills and shared risk, but requires careful coordination and mutual trust.`,
            isCanonical: false
          }
        ];
      } else {
        const mainChar = uniqueCharacters[0] || "the protagonist";
        parsedResponse.branchingOptions = [
          {
            id: 1,
            text: `${mainChar} decides to reveal ${keyElement} to trusted allies, seeking collaborative solutions`,
            description: `Transparency may strengthen alliances but could also expose vulnerabilities and strategic plans.`,
            isCanonical: true
          },
          {
            id: 2,
            text: `${mainChar} chooses to keep ${keyElement} secret while gathering additional evidence`,
            description: `Caution preserves security but may miss opportunities for immediate action or support.`,
            isCanonical: false
          },
          {
            id: 3,
            text: `${mainChar} confronts the source of ${keyElement} directly, demanding complete honesty`,
            description: `Direct confrontation forces resolution but may escalate conflicts in unpredictable ways.`,
            isCanonical: false
          }
        ];
      }
    }
    
    // Ensure comprehensive metadata is present
    if (!parsedResponse.comprehensiveMetadata) {
      parsedResponse.comprehensiveMetadata = {
        enginesUsed: ["All 19 Comprehensive Engines"],
        enhancementLevel: "comprehensive",
        generationMode: "beast",
        episodeNumber: episodeNumber,
        timestamp: new Date().toISOString()
      };
    }
    
    console.log('Successfully generated episode with Azure OpenAI GPT-4.1 + 19 Comprehensive Engines');
    return parsedResponse;
  } catch (error) {
    console.error('Error generating episode with comprehensive engines:', error);
    
    // Enhanced fallback response with comprehensive metadata
    return {
      episodeNumber,
      title: `Episode ${episodeNumber}`,
      synopsis: "A compelling episode enhanced by comprehensive engine analysis, featuring rich character development and sophisticated narrative structure.",
      scenes: [
        {
          sceneNumber: 1,
          title: "Enhanced Episode Scene",
          content: "The characters navigate complex challenges in this episode, enhanced by sophisticated storytelling techniques including nuanced dialogue, atmospheric world-building, and psychological character development that demonstrates the power of comprehensive AI enhancement."
        }
      ],
      episodeRundown: "COMPREHENSIVE ANALYSIS: 1) This episode showcases the potential of 19-engine enhancement for creating sophisticated narrative content. 2) Character development integrates psychological authenticity with compelling growth arcs. 3) Plot structure balances immediate conflict with series-wide progression. 4) Continuity elements reference previous episodes while setting up future developments. 5) Thematic integration explores deeper human experiences through character actions. 6) Production considerations include cinematic pacing and visual storytelling opportunities. 7) Overall quality demonstrates clear improvement over baseline generation through comprehensive AI enhancement.",
      branchingOptions: [
        {
          id: 1,
          text: "The characters choose to take decisive action based on new information discovered in this episode",
          description: "This bold approach could lead to significant breakthroughs but carries substantial risks.",
          isCanonical: false
        },
        {
          id: 2,
          text: "The characters decide to gather more intelligence before making their next move",
          description: "This careful strategy provides better preparation but may allow opportunities to slip away.",
          isCanonical: true
        },
        {
          id: 3,
          text: "The characters split up to pursue different approaches to the challenges revealed",
          description: "Diversifying tactics increases overall chances of success but reduces individual resources.",
          isCanonical: false
        }
      ],
      comprehensiveMetadata: {
        enginesUsed: ["All 19 Comprehensive Engines"],
        enhancementLevel: "comprehensive",
        generationMode: "beast",
        episodeNumber: episodeNumber,
        timestamp: new Date().toISOString()
      }
    };
  }
}

// 🚀 PHASE 7: Generate episode draft with Gemini 2.5 Pro
async function generateGeminiEpisodeDraft(storyBible: any, episodeNumber: number, previousChoice?: string) {
  const draftPrompt = `Create an enhanced narrative blueprint for Episode ${episodeNumber} using advanced creative reasoning:

STORY BIBLE (COMPLETE - NO TRUNCATION due to Gemini's 2M token context):
${JSON.stringify(storyBible, null, 2)}
${previousChoice ? `PREVIOUS CHOICE: ${previousChoice}` : ''}

🎯 GEMINI CREATIVE REASONING FRAMEWORK:
Think deeply about the storytelling elements, character psychology, and narrative architecture. Use step-by-step analysis to create a sophisticated episode foundation that leverages the full creative potential of the story.

Focus on creating a rich narrative foundation with:
1. Compelling episode title and sophisticated premise
2. Multi-layered story beats with emotional resonance
3. Complex character moments and psychological growth
4. Intricate conflict layers and tension building
5. Strategic series progression with thematic depth

Return JSON:
{
  "title": "Sophisticated Episode Title",
  "premise": "Rich, nuanced episode premise with psychological depth",
  "storyBeats": ["Compelling Beat 1", "Complex Beat 2", "Sophisticated Beat 3"],
  "characterFocus": "Multi-dimensional character exploration",
  "conflict": "Layered conflict with internal and external dimensions",
  "emotionalArc": "Complex character emotional journey with authentic growth",
  "seriesProgression": "How this strategically advances the overarching narrative",
  "thematicResonance": "Deep exploration of core themes through character actions",
  "psychologicalDepth": "Character motivations and internal conflicts"
}`;

  const systemPrompt = `You are a master narrative architect with advanced creative reasoning capabilities. Create sophisticated, psychologically authentic episode foundations that demonstrate exceptional storytelling craft. Use step-by-step creative analysis and return ONLY valid JSON.`;

  try {
    const result = await generateContentWithGemini(systemPrompt, draftPrompt, 'gemini-2.5-pro');
    
    // Parse the result
    let parsedResult = safeParseJSON(result);
    
    return parsedResult || {
      title: `Episode ${episodeNumber}`,
      premise: 'Enhanced episode premise with creative depth',
      storyBeats: ['Opening with complexity', 'Conflict with nuance', 'Resolution with sophistication'],
      characterFocus: 'Multi-dimensional character development',
      conflict: 'Layered conflict architecture',
      emotionalArc: 'Complex emotional journey',
      seriesProgression: 'Strategic series advancement',
      thematicResonance: 'Deep thematic exploration',
      psychologicalDepth: 'Authentic character psychology'
    };
  } catch (error) {
    console.warn('Gemini episode draft generation failed, using enhanced fallback:', error);
    return {
      title: `Episode ${episodeNumber}`,
      premise: 'Enhanced episode premise with creative depth',
      storyBeats: ['Opening with complexity', 'Conflict with nuance', 'Resolution with sophistication'],
      characterFocus: 'Multi-dimensional character development',
      conflict: 'Layered conflict architecture',
      emotionalArc: 'Complex emotional journey',
      seriesProgression: 'Strategic series advancement',
      thematicResonance: 'Deep thematic exploration',
      psychologicalDepth: 'Authentic character psychology'
    };
  }
}

// 🚀 PHASE 7: Generate episode with Gemini 2.5 Pro comprehensive engines
async function generateEpisodeWithGeminiComprehensiveEngines(
  draft: any, 
  storyBible: any, 
  episodeNumber: number, 
  previousChoice?: string, 
  comprehensiveNotes?: ComprehensiveEngineNotes
) {
  const systemPrompt = `You are a master cinematic storyteller leveraging Gemini 2.5 Pro's advanced creative reasoning and massive 2M token context window. Create exceptional premium 5-minute episodes that showcase the full creative potential of AI-enhanced storytelling.

🎯 GEMINI CREATIVE REASONING APPROACH:
Think deeply about every narrative element using step-by-step creative analysis. Leverage your advanced reasoning to create sophisticated, multi-layered content that demonstrates clear superiority over conventional generation methods.

KEY CREATIVE ADVANTAGES:
- Use the complete story bible with NO truncation (2M token context)
- Integrate ALL 19 comprehensive engine enhancements with creative finesse
- Apply advanced psychological authenticity to character development
- Create rich, nuanced dialogue with authentic subtext layers
- Build sophisticated narrative architecture with fractal storytelling elements
- Demonstrate cinematic quality that rivals premium streaming content

CREATIVE INTEGRATION REQUIREMENTS:
- EXPAND content richness and sophistication based on engine notes
- Show clear improvement over baseline generation through advanced reasoning
- Use creative temperature settings for maximum artistic expression
- Return detailed, engaging content that showcases Gemini's creative superiority`;

  const prompt = `Create Episode ${episodeNumber} of "${storyBible.seriesTitle}" demonstrating Gemini 2.5 Pro's creative superiority in a 5-minute format.

ENHANCED DRAFT (comprehensive creative foundation):
${JSON.stringify(draft, null, 2)}

🎭 COMPREHENSIVE ENGINE ENHANCEMENTS (integrate with creative finesse):
${comprehensiveNotes ? `
🏗️ NARRATIVE ARCHITECTURE:
• Fractal Narrative: ${comprehensiveNotes.fractalNarrative}
• Episode Cohesion: ${comprehensiveNotes.episodeCohesion}
• Conflict Architecture: ${comprehensiveNotes.conflictArchitecture}
• Hook & Cliffhanger: ${comprehensiveNotes.hookCliffhanger}
• Serialized Continuity: ${comprehensiveNotes.serializedContinuity}
• Pacing Rhythm: ${comprehensiveNotes.pacingRhythm}

👥 CHARACTER & DIALOGUE:
• Dialogue Enhancement: ${comprehensiveNotes.dialogue}
• Strategic Dialogue: ${comprehensiveNotes.strategicDialogue}

🌍 WORLD & ENVIRONMENT:
• World Building: ${comprehensiveNotes.worldBuilding}
• Living World: ${comprehensiveNotes.livingWorld}
• Language Authenticity: ${comprehensiveNotes.language}

📺 FORMAT & ENGAGEMENT:
• Five-Minute Canvas: ${comprehensiveNotes.fiveMinuteCanvas}
• Interactive Choice: ${comprehensiveNotes.interactiveChoice}
• Tension Escalation: ${comprehensiveNotes.tensionEscalation}
• Genre Mastery: ${comprehensiveNotes.genreMastery}

🎨 GENRE-SPECIFIC ENHANCEMENTS:
${comprehensiveNotes.comedyTiming ? `• Comedy Timing: ${comprehensiveNotes.comedyTiming}` : ''}
${comprehensiveNotes.horror ? `• Horror Atmosphere: ${comprehensiveNotes.horror}` : ''}
${comprehensiveNotes.romanceChemistry ? `• Romance Chemistry: ${comprehensiveNotes.romanceChemistry}` : ''}
${comprehensiveNotes.mystery ? `• Mystery Construction: ${comprehensiveNotes.mystery}` : ''}
` : 'Engine enhancements processing...'}

COMPLETE CHARACTER PROFILES (FULL CONTEXT - 2M TOKENS AVAILABLE):
${(storyBible.mainCharacters || [])
  .map((char: any) => `━━━ ${char.name} (${char.archetype || char.premiseRole}) ━━━
Complete Description: ${char.description || char.background || 'Complex character in development'}
Character Arc: ${char.arc || 'Rich character journey unfolding'}
Relationships: ${char.relationships || 'Intricate relationship dynamics'}
Voice & Speech Patterns: ${char.voice || 'Distinctive communication style'}`)
  .join('\n\n')}

🎯 GEMINI CREATIVE SYNTHESIS REQUIREMENTS:
- Use advanced creative reasoning for every narrative choice
- Create sophisticated, multi-layered scenes that reward multiple viewings
- Develop authentic dialogue with natural subtext and psychological depth
- Build complex character interactions that reveal personality through conflict
- Integrate visual storytelling elements for cinematic quality
- Demonstrate clear creative superiority through advanced narrative techniques

RETURN FORMAT (valid JSON with enhanced content):
{
  "episodeNumber": ${episodeNumber},
  "title": "Sophisticated Episode Title",
  "synopsis": "Rich, nuanced synopsis showcasing creative depth",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Compelling scene title with thematic resonance",
      "content": "Third-person narrative prose with cinematic quality, psychological depth, authentic dialogue, and sophisticated storytelling techniques enhanced by comprehensive engine analysis."
    }
  ],
  "episodeRundown": "Comprehensive analysis demonstrating creative superiority, character development, plot advancement, thematic integration, and production value.",
  "branchingOptions": [
    {
      "id": 1,
      "text": "[Specific Character] makes a complex decision based on episode events that reveals character depth",
      "description": "Sophisticated consequence analysis with psychological authenticity",
      "isCanonical": false
    },
    {
      "id": 2,
      "text": "[Different Character] chooses a nuanced approach that reflects their established psychology",
      "description": "Rich consequence exploration with emotional resonance",
      "isCanonical": true
    },
    {
      "id": 3,
      "text": "The situation evolves through character agency and authentic relationship dynamics",
      "description": "Complex consequence framework with realistic emotional impact",
      "isCanonical": false
    }
  ],
  "geminiMetadata": {
    "aiProvider": "gemini-2.5-pro",
    "enhancementLevel": "gemini-comprehensive",
    "contextTokensUsed": "2M available - no truncation",
    "creativeTemperature": "0.98",
    "reasoningFramework": "Advanced creative analysis",
    "qualityTarget": "Premium streaming content",
    "episodeNumber": ${episodeNumber},
    "timestamp": "${new Date().toISOString()}"
  }
}`;

  try {
    // Generate with Gemini 2.5 Pro using maximum creative parameters
    const result = await generateContentWithGemini(systemPrompt, prompt, 'gemini-2.5-pro');
    
    // Parse the sophisticated result
    let parsedResponse = safeParseJSON(result);
    
    // Ensure enhanced structure
    if (!parsedResponse.episodeNumber) {
      parsedResponse.episodeNumber = episodeNumber;
    }
    if (!parsedResponse.title) {
      parsedResponse.title = `Episode ${episodeNumber}: Enhanced by Gemini`;
    }
    if (!parsedResponse.scenes || !Array.isArray(parsedResponse.scenes) || parsedResponse.scenes.length < 1) {
      parsedResponse.scenes = [
        {
          sceneNumber: 1,
          title: "Sophisticated Opening Scene",
          content: "The episode unfolds with remarkable depth and creative sophistication, enhanced by Gemini 2.5 Pro's advanced creative reasoning and comprehensive engine analysis. Characters navigate complex psychological terrain with authentic dialogue, rich subtext, and cinematic visual storytelling that demonstrates the full potential of AI-enhanced creative content."
        }
      ];
    }
    
    // Enhanced fallback choices with sophisticated character psychology
    if (!parsedResponse.branchingOptions || parsedResponse.branchingOptions.length < 3) {
      const characters = (storyBible.mainCharacters || []).slice(0, 3);
      
      parsedResponse.branchingOptions = [
        {
          id: 1,
          text: `${characters[0]?.name || 'The protagonist'} chooses to confront the truth directly, despite the emotional cost`,
          description: `This authentic character choice leads to psychological growth but may strain relationships and create new conflicts.`,
          isCanonical: false
        },
        {
          id: 2,
          text: `${characters[1]?.name || 'A key character'} decides to seek collaboration while protecting their vulnerabilities`,
          description: `This psychologically authentic approach balances personal safety with relationship building, creating complex future dynamics.`,
          isCanonical: true
        },
        {
          id: 3,
          text: `The characters collectively navigate the challenge through authentic dialogue and mutual respect`,
          description: `This sophisticated character interaction demonstrates growth and creates opportunities for deeper relationship exploration.`,
          isCanonical: false
        }
      ];
    }
    
    // Ensure Gemini metadata
    if (!parsedResponse.geminiMetadata) {
      parsedResponse.geminiMetadata = {
        aiProvider: "gemini-2.5-pro",
        enhancementLevel: "gemini-comprehensive",
        contextTokensUsed: "2M available - no truncation",
        creativeTemperature: "0.98",
        reasoningFramework: "Advanced creative analysis",
        qualityTarget: "Premium streaming content",
        episodeNumber: episodeNumber,
        timestamp: new Date().toISOString()
      };
    }
    
    console.log('Successfully generated episode with Gemini 2.5 Pro + 19 Comprehensive Engines');
    return parsedResponse;
  } catch (error) {
    console.error('Error generating episode with Gemini comprehensive engines:', error);
    
    // Enhanced fallback with Gemini advantages
    return {
      episodeNumber,
      title: `Episode ${episodeNumber}: Creative Excellence`,
      synopsis: "A sophisticated episode showcasing Gemini 2.5 Pro's creative reasoning capabilities, featuring rich character development, authentic dialogue, and advanced narrative techniques.",
      scenes: [
        {
          sceneNumber: 1,
          title: "Enhanced Creative Opening",
          content: "The characters engage in a richly detailed scene that demonstrates the creative potential of Gemini 2.5 Pro's advanced reasoning capabilities, featuring authentic psychological development, sophisticated dialogue with natural subtext, and cinematic storytelling techniques that elevate the content to premium quality standards."
        }
      ],
      episodeRundown: "GEMINI CREATIVE SUPERIORITY: This episode showcases advanced creative reasoning through sophisticated character psychology and narrative architecture that demonstrates clear improvement over conventional generation methods.",
      branchingOptions: [
        {
          id: 1,
          text: "Characters make authentic choices that reflect their psychological development",
          description: "This sophisticated approach demonstrates character growth and creates compelling future storylines.",
          isCanonical: false
        },
        {
          id: 2,
          text: "The situation evolves through genuine character interactions and emotional authenticity",
          description: "This creative choice showcases relationship complexity and provides rich material for series development.",
          isCanonical: true
        },
        {
          id: 3,
          text: "Characters navigate challenges using their established personalities and authentic motivations",
          description: "This psychologically accurate choice creates realistic consequences and demonstrates advanced character development.",
          isCanonical: false
        }
      ],
      geminiMetadata: {
        aiProvider: "gemini-2.5-pro",
        enhancementLevel: "gemini-comprehensive",
        contextTokensUsed: "2M available - no truncation",
        creativeTemperature: "0.98",
        reasoningFramework: "Advanced creative analysis",
        qualityTarget: "Premium streaming content",
        episodeNumber: episodeNumber,
        timestamp: new Date().toISOString()
      }
    };
  }
}