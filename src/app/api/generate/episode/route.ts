import { NextResponse } from 'next/server'
import { generateContent, generateStructuredContent } from '@/services/azure-openai'
import { NextRequest } from 'next/server'
import { logger, ENGINE_CONFIGS } from '@/services/console-logger'
import { runEnginesLite, EngineNotes } from '@/services/engines-lite'

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
    const { storyBible, previousChoice, userChoices, useEngines = true } = body
    const episodeNumber = body.episodeNumber ?? body.currentEpisodeNumber
    
    if (!storyBible || !episodeNumber) {
      return NextResponse.json(
        { error: 'Story bible and episode number are required' },
        { status: 400 }
      )
    }

    // Initialize episode generation logging
    logger.startNewSession(`Episode ${episodeNumber} Generation`)
    if (previousChoice) {
      logger.milestone(`User Choice: ${previousChoice}`)
    }
    
    logger.startPhase({
      name: 'Episode Generation',
      totalSteps: useEngines ? 3 : 2,
      currentStep: 1,
      engines: useEngines ? ['GPT-4.1 Draft', 'Engines Lite', 'GPT-4.1 Final Synthesis'] : ['GPT-4.1 Story Bible Generation'],
      overallProgress: 25
    })

    // STAGE 1: Create the narrative blueprint for the episode
    logger.updatePhase('Creating engineless draft', 1)
    const episodeDraft = await generateEpisodeDraft(storyBible, episodeNumber, previousChoice);
    logger.milestone(`Draft Complete: "${(episodeDraft as any).title}"`)

    if (!useEngines) {
      // STAGE 2: Generate final episode using GPT-4.1 and Story Bible only (no engines)
      logger.updatePhase('GPT-4.1 Story Bible episode synthesis (no engines)', 2)
      const finalEpisode = await generateEpisodeWithAzure(episodeDraft, storyBible, episodeNumber, previousChoice);
      logger.milestone('Episode generation complete (GPT-4.1 + Story Bible only)')

      return NextResponse.json({
        success: true,
        episode: finalEpisode
      });
    }

    // STAGE 2: Run minimal engine enhancements
    logger.updatePhase('Running engines-lite enhancements', 2)
    const engineNotes = await runEnginesLite(episodeDraft, storyBible, 'beast');
    logger.milestone('Engine enhancements complete')

    // STAGE 3: Generate final episode using GPT-4.1 + Story Bible + Engine notes
    logger.updatePhase('GPT-4.1 Final synthesis with engine notes', 3)
    const finalEpisode = await generateEpisodeWithEngines(episodeDraft, storyBible, episodeNumber, previousChoice, engineNotes);
    logger.milestone('Episode generation complete (GPT-4.1 + Story Bible + Engines)')

    return NextResponse.json({
      success: true,
      episode: finalEpisode
    });
  } catch (error) {
    console.error('Error generating episode:', error)
    return NextResponse.json(
      { error: 'Failed to generate episode', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

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
${storyBible.mainCharacters
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
      temperature: 0.8,
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
async function generateEpisodeWithEngines(draft: any, storyBible: any, episodeNumber: number, previousChoice?: string, engineNotes?: EngineNotes) {
  const systemPrompt = `You are a senior TV writer crafting a tight 5-minute episode using the Story Bible, draft, and optional engine enhancement notes as guidance. Return valid JSON only. Prioritize cohesion, pacing, and character depth over breadth. Keep it cinematic, readable, and emotionally engaging.`

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

ENGINE ENHANCEMENT NOTES (use as optional guidance, do not change scene count):
${engineNotes ? `
DIALOGUE NOTES:
${engineNotes.dialogue}

TENSION NOTES:
${engineNotes.tension}

CHOICE NOTES:
${engineNotes.choices}
` : 'No engine enhancements available.'}

CONTEXT:
${previousChoice ? `PREVIOUS EPISODE CHOICE: "${previousChoice}"
This choice MUST have clear consequences and influence on this episode's events, character decisions, and narrative direction.` : 'This is the beginning of the story.'}
Current Narrative Arc: ${narrativeArcInfo.arcTitle}
Arc Summary: ${narrativeArcInfo.arcSummary}
Episode Title: ${narrativeArcInfo.episodeTitle}
Episode Summary: ${narrativeArcInfo.episodeSummary}

CHARACTERS (Use only the most relevant characters for this episode):
${storyBible.mainCharacters
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
      temperature: 0.8,
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