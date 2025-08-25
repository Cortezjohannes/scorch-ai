// =================================================================
// V2 PRE-PRODUCTION GENERATORS - ENGINELESS GPT-4.1 (AZURE OPENAI)
// =================================================================

import { generateContent } from '@/services/azure-openai'
import { cleanAndParseJSON } from '@/lib/json-utils'

// RETRY UTILITY FUNCTION
async function retryWithFallback<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = 3
): Promise<T | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 ${operationName} - Attempt ${attempt}/${maxRetries}`);
      const result = await operation();
      console.log(`✅ ${operationName} - Success on attempt ${attempt}`);
      return result;
    } catch (error) {
      console.warn(`⚠️ ${operationName} - Attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        console.error(`❌ ${operationName} - All ${maxRetries} attempts failed, skipping`);
        return null;
      }
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  return null;
}

// STEP 2: Generate Scripts Per Scene (Temperature 0.35)
export async function generateV2Scripts(context: any, narrative: any, updateProgress: (stepName: string, detail: string, stepProgress: number, stepIndex: number) => Promise<void>) {
  const { storyBible, actualEpisodes } = context;
  
  // Safety checks
  if (!actualEpisodes || !Array.isArray(actualEpisodes) || actualEpisodes.length === 0) {
    console.error('❌ No actualEpisodes provided to generateV2Scripts');
    return { episodes: [], totalScenes: 0, format: 'scene-by-scene-screenplay' };
  }
  
  const episodes = [];
  let processedScenes = 0;

  for (let i = 0; i < actualEpisodes.length; i++) {
    const episode = actualEpisodes[i];
    const episodeScenes = episode.scenes || [];
    
    console.log(`📝 Generating script for Episode ${episode.episodeNumber}: ${episodeScenes.length} scenes`);
    
    const scriptScenes = [];
    
    for (let j = 0; j < episodeScenes.length; j++) {
      const scene = episodeScenes[j];
      processedScenes++;
      
      await updateProgress('Script', `Episode ${episode.episodeNumber}, Scene ${j + 1}/${episodeScenes.length}`, 
        Math.round((processedScenes / context.totalScenes) * 100), 2);

      const sceneScript = await retryWithFallback(async () => {
        const prompt = `Create a professional screenplay scene with rich, engaging dialogue based on the narrative content. Use STRICT screenplay format:

NARRATIVE SCENE:
${scene.content}

STORY BIBLE CONTEXT:
Series: ${storyBible.seriesTitle}
Genre: ${storyBible.genre}

MANDATORY SCREENPLAY FORMAT:
1. Scene Heading: INT./EXT. LOCATION - TIME OF DAY
2. Action Lines: Short, present-tense, observable actions only
3. Character Names: ALL CAPS, left-aligned
4. Dialogue: Natural, engaging conversation that reveals character
5. Parentheticals: (sparingly) for essential direction only

DIALOGUE REQUIREMENTS:
- EXPAND dialogue significantly - make conversations fuller and more natural
- Each character should speak 2-3 times minimum per scene
- Include subtext, conflict, and character voice
- Make dialogue feel authentic and engaging
- Add conversational flow with responses, questions, and reactions
- Characters should interrupt, disagree, and have distinct speaking patterns

ACTION LINE RULES:
- Keep action lines short and visual: "John enters." "Sarah closes the door."
- NO emotional descriptions: "angrily" → use dialogue/action to show emotion
- NO internal thoughts or feelings
- Focus on what the camera sees

FORBIDDEN ELEMENTS:
- NO narrative prose or storytelling language
- NO character analysis or emotional descriptions  
- NO phrases like "realizes," "feels," "seems," "appears"
- NO scene transitions like "meanwhile," "suddenly"

SCENE LENGTH: 200-400 words with substantial dialogue
FOCUS: Character interaction and conversation, not just plot advancement

Return ONLY the formatted screenplay scene.`;

        const result = await generateContent({
          prompt,
          temperature: 0.5, 
          maxTokens: 2000,
          systemPrompt: "You are a professional screenwriter who follows strict screenplay formatting. Write ONLY in proper screenplay format with scene headings, character names, dialogue, and simple action lines. NEVER include narrative prose, descriptive writing, or emotional analysis. Focus on observable actions and spoken dialogue only."
        });
        
        return { screenplay: result };
      }, `Script Scene ${episode.episodeNumber}-${j + 1}`);

      scriptScenes.push({
        sceneNumber: j + 1,
        screenplay: sceneScript?.screenplay || "Scene script generation failed"
      });
    }

    episodes.push({
      episodeNumber: episode.episodeNumber,
      episodeTitle: episode.episodeTitle || episode.title,
      scenes: scriptScenes
    });
  }
  
  return {
    episodes,
    totalScenes: processedScenes,
    format: 'scene-by-scene-screenplay'
  };
}

// STEP 3: Generate Storyboards Per Scene (Based on Script)
export async function generateV2Storyboards(context: any, narrative: any, script: any, updateProgress: (stepName: string, detail: string, stepProgress: number, stepIndex: number) => Promise<void>) {
  const { storyBible, actualEpisodes } = context;
  
  // Safety checks
  if (!actualEpisodes || !Array.isArray(actualEpisodes) || actualEpisodes.length === 0) {
    console.error('❌ No actualEpisodes provided to generateV2Storyboards');
    return { episodes: [], totalScenes: 0, format: 'visual-storyboard' };
  }
  
  const episodes = [];
  let processedScenes = 0;

  await updateProgress('Storyboard', 'Starting storyboard generation...', 0, 3);

  for (let i = 0; i < actualEpisodes.length; i++) {
    const episode = actualEpisodes[i];
    const episodeScenes = episode.scenes || [];
    const scriptEpisode = script.episodes.find((ep: any) => ep.episodeNumber === episode.episodeNumber);
    const storyboardScenes = [];

    for (let j = 0; j < episodeScenes.length; j++) {
      const scene = episodeScenes[j];
      const scriptScene = scriptEpisode?.scenes?.find((s: any) => s.sceneNumber === j + 1);
      processedScenes++;
      
      await updateProgress('Storyboard', `Episode ${episode.episodeNumber}, Scene ${j + 1}/${episodeScenes.length}`, 
        Math.round((processedScenes / context.totalScenes) * 100), 3);

      const storyboard = await retryWithFallback(async () => {
        const prompt = `Create a detailed visual storyboard for this scene.

NARRATIVE SCENE:
${scene.content}

SCRIPT (if available):
${scriptScene?.screenplay || 'No script available'}

STORY CONTEXT:
Series: ${storyBible.seriesTitle}
Genre: ${storyBible.genre}

REQUIREMENTS:
- Break down into 4-8 visual shots
- Include camera angles and movements
- Describe lighting, mood, and atmosphere
- Note any special effects or props needed
- Keep professional film production format

Format as a detailed shot list.`;

        const result = await generateContent(prompt, { 
          temperature: 0.4, 
          maxTokens: 1500,
          systemPrompt: "You are a professional storyboard artist and cinematographer."
        });
        
        return { storyboard: result };
      }, `Storyboard Scene ${episode.episodeNumber}-${j + 1}`);

      storyboardScenes.push({
        sceneNumber: j + 1,
        storyboard: storyboard?.storyboard || "Storyboard generation failed"
      });
    }

    episodes.push({
      episodeNumber: episode.episodeNumber,
      episodeTitle: episode.episodeTitle || episode.title,
      scenes: storyboardScenes
    });
  }
  
  await updateProgress('Storyboard', 'Storyboards generated for all scenes', 100, 3);
  return {
    episodes,
    totalScenes: processedScenes,
    format: 'visual-storyboard'
  };
}

// STEP 4: Generate Props Per Episode (Based on Narrative & Storyboard)
export async function generateV2Props(context: any, narrative: any, storyboard: any, updateProgress: (stepName: string, detail: string, stepProgress: number, stepIndex: number) => Promise<void>) {
  const { storyBible, actualEpisodes } = context;
  
  // Safety checks
  if (!actualEpisodes || !Array.isArray(actualEpisodes) || actualEpisodes.length === 0) {
    console.error('❌ No actualEpisodes provided to generateV2Props');
    return { episodes: [], format: 'production-props' };
  }
  
  const episodes = [];

  await updateProgress('Props', 'Starting props generation...', 0, 4);

  for (let i = 0; i < actualEpisodes.length; i++) {
    const episode = actualEpisodes[i];
    const narrativeEpisode = narrative.episodes.find((ep: any) => ep.episodeNumber === episode.episodeNumber);
    const storyboardEpisode = storyboard.episodes.find((ep: any) => ep.episodeNumber === episode.episodeNumber);
    
    await updateProgress('Props', `Episode ${episode.episodeNumber}/${actualEpisodes.length}`, 
      Math.round(((i + 1) / actualEpisodes.length) * 100), 4);

    const props = await retryWithFallback(async () => {
      const prompt = `Create a comprehensive props and wardrobe list for this episode.

EPISODE NARRATIVE:
${narrativeEpisode?.scenes?.map((s: any, idx: number) => `Scene ${idx + 1}: ${s.content}`).join('\n\n') || 'No narrative available'}

STORYBOARD INFO:
${storyboardEpisode?.scenes?.map((s: any, idx: number) => `Scene ${idx + 1}: ${s.storyboard?.substring(0, 200)}...`).join('\n\n') || 'No storyboard available'}

STORY CONTEXT:
Series: ${storyBible.seriesTitle}
Genre: ${storyBible.genre}
Episode: ${episode.episodeNumber} - ${episode.episodeTitle || episode.title}

REQUIREMENTS:
- List ALL props needed for each scene
- Include wardrobe for each character
- Categorize by: Props, Costumes, Set Decoration, Special Items
- Include sourcing suggestions (buy/rent/make)
- Note any budget considerations

Format as organized production list.`;

      const result = await generateContent(prompt, { 
        temperature: 0.3, 
        maxTokens: 2000,
        systemPrompt: "You are a professional props master and costume designer."
      });
      
      return { propsList: result };
    }, `Props Episode ${episode.episodeNumber}`);

    episodes.push({
      episodeNumber: episode.episodeNumber,
      episodeTitle: episode.episodeTitle || episode.title,
      props: props?.propsList || "Props generation failed"
    });
  }
  
  await updateProgress('Props', 'Props generated for all episodes', 100, 4);
  return {
    episodes,
    format: 'production-props'
  };
}

// STEP 5: Generate Locations Per Episode (Based on Narrative & Storyboard)
export async function generateV2Locations(context: any, narrative: any, storyboard: any, updateProgress: (stepName: string, detail: string, stepProgress: number, stepIndex: number) => Promise<void>) {
  const { storyBible, actualEpisodes } = context;
  
  // Safety checks
  if (!actualEpisodes || !Array.isArray(actualEpisodes) || actualEpisodes.length === 0) {
    console.error('❌ No actualEpisodes provided to generateV2Locations');
    return { episodes: [], format: 'location-guide' };
  }
  
  const episodes = [];

  await updateProgress('Locations', 'Starting location scouting...', 0, 5);

  for (let i = 0; i < actualEpisodes.length; i++) {
    const episode = actualEpisodes[i];
    const narrativeEpisode = narrative.episodes.find((ep: any) => ep.episodeNumber === episode.episodeNumber);
    const storyboardEpisode = storyboard.episodes.find((ep: any) => ep.episodeNumber === episode.episodeNumber);
    
    await updateProgress('Locations', `Episode ${episode.episodeNumber}/${actualEpisodes.length}`, 
      Math.round(((i + 1) / actualEpisodes.length) * 100), 5);

    const locations = await retryWithFallback(async () => {
      const prompt = `Create a comprehensive location guide for filming this episode.

EPISODE NARRATIVE:
${narrativeEpisode?.scenes?.map((s: any, idx: number) => `Scene ${idx + 1}: ${s.content}`).join('\n\n') || 'No narrative available'}

STORYBOARD INFO:
${storyboardEpisode?.scenes?.map((s: any, idx: number) => `Scene ${idx + 1}: ${s.storyboard?.substring(0, 200)}...`).join('\n\n') || 'No storyboard available'}

STORY CONTEXT:
Series: ${storyBible.seriesTitle}
Genre: ${storyBible.genre}
Episode: ${episode.episodeNumber} - ${episode.episodeTitle || episode.title}

REQUIREMENTS:
- Identify ALL filming locations needed
- Suggest specific location types and characteristics
- Include backup location options
- Note permits and permissions needed
- Consider lighting, sound, and practical concerns
- Suggest optimal filming times/conditions
- Include estimated time needed per location

Format as professional location scouting guide.`;

      const result = await generateContent(prompt, { 
        temperature: 0.35, 
        maxTokens: 2000,
        systemPrompt: "You are a professional location scout and production manager."
      });
      
      return { locationGuide: result };
    }, `Locations Episode ${episode.episodeNumber}`);

    episodes.push({
      episodeNumber: episode.episodeNumber,
      episodeTitle: episode.episodeTitle || episode.title,
      locations: locations?.locationGuide || "Location generation failed"
    });
  }
  
  await updateProgress('Locations', 'Location guides generated for all episodes', 100, 5);
  return {
    episodes,
    format: 'location-guide'
  };
}

// STEP 6: Generate Casting Per Arc (Based on Narrative & Story Bible)
export async function generateV2Casting(context: any, narrative: any, updateProgress: (stepName: string, detail: string, stepProgress: number, stepIndex: number) => Promise<void>) {
  const { storyBible, actualEpisodes } = context;
  
  // Safety checks
  if (!actualEpisodes || !Array.isArray(actualEpisodes) || actualEpisodes.length === 0) {
    console.error('❌ No actualEpisodes provided to generateV2Casting');
    return { castingBreakdown: 'No episodes available for casting analysis', format: 'casting-guide' };
  }

  await updateProgress('Casting', 'Analyzing characters across arc...', 50, 6);

  const casting = await retryWithFallback(async () => {
    const allScenes = narrative.episodes.flatMap((ep: any) => 
      ep.scenes?.map((scene: any, idx: number) => `Episode ${ep.episodeNumber}, Scene ${idx + 1}: ${scene.content}`) || []
    ).join('\n\n');

    const prompt = `Create a comprehensive casting guide for all characters appearing in this story arc.

ARC NARRATIVE (All Episodes):
${allScenes}

STORY CONTEXT:
Series: ${storyBible.seriesTitle}
Genre: ${storyBible.genre}
Story Bible: ${JSON.stringify(storyBible, null, 2)}
Episodes in Arc: ${actualEpisodes.length}

REQUIREMENTS:
- Identify ALL speaking characters across the arc
- Create detailed character profiles for casting
- Include physical descriptions, age ranges, personality traits
- Suggest actor types or references (no specific names)
- Note character importance (lead, supporting, guest)
- Include any special skills or requirements needed
- Consider diversity and representation
- Organize by character importance

Format as professional casting breakdown.`;

    const result = await generateContent(prompt, { 
      temperature: 0.3, 
      maxTokens: 3000,
      systemPrompt: "You are a professional casting director with extensive experience."
    });
    
    return { castingBreakdown: result };
  }, `Casting for Arc`);

  await updateProgress('Casting', 'Casting guide generated for entire arc', 100, 6);
  
  // Parse the casting breakdown into structured character data for UI
  const castingText = casting?.castingBreakdown || "Casting generation failed";
  const characters = [];
  
  try {
    // Extract character names and descriptions from the generated text
    const lines = castingText.split('\n').filter((line: string) => line.trim());
    let currentCharacter = null;
    
    for (const line of lines) {
      // Look for character names (lines that start with capital letters or have character-like patterns)
      if (line.match(/^[A-Z][A-Z\s]+[:-]/) || line.match(/^\d+\.\s*[A-Z]/)) {
        if (currentCharacter) {
          characters.push(currentCharacter);
        }
        currentCharacter = {
          name: line.replace(/^(\d+\.\s*|\-\s*|[:-]\s*)/, '').replace(/[:-].*/, '').trim(),
          description: line
        };
      } else if (currentCharacter && line.trim()) {
        currentCharacter.description += '\n' + line;
      }
    }
    
    if (currentCharacter) {
      characters.push(currentCharacter);
    }
    
    // If parsing failed, create a fallback structure
    if (characters.length === 0) {
      characters.push({
        name: 'Main Characters',
        description: castingText
      });
    }
  } catch (e) {
    console.error('Error parsing casting breakdown:', e);
    characters.push({
      name: 'Casting Information',
      description: castingText
    });
  }
  
  return {
    characters,
    arcIndex: context.arcIndex || 0,
    format: 'casting-guide',
    generatedAt: new Date().toISOString()
  };
}

// STEP 7: Generate Marketing Per Episode (Based on Narrative)
export async function generateV2Marketing(context: any, narrative: any, updateProgress: (stepName: string, detail: string, stepProgress: number, stepIndex: number) => Promise<void>) {
  const { storyBible, actualEpisodes } = context;
  
  // Safety checks
  if (!actualEpisodes || !Array.isArray(actualEpisodes) || actualEpisodes.length === 0) {
    console.error('❌ No actualEpisodes provided to generateV2Marketing');
    return { episodes: [], format: 'marketing-strategy' };
  }
  
  const episodes = [];

  await updateProgress('Marketing', 'Starting marketing strategy...', 0, 7);

  for (let i = 0; i < actualEpisodes.length; i++) {
    const episode = actualEpisodes[i];
    const narrativeEpisode = narrative.episodes.find((ep: any) => ep.episodeNumber === episode.episodeNumber);
    
    await updateProgress('Marketing', `Episode ${episode.episodeNumber}/${actualEpisodes.length}`, 
      Math.round(((i + 1) / actualEpisodes.length) * 100), 7);

    const marketing = await retryWithFallback(async () => {
      const prompt = `Create a targeted marketing strategy for this episode.

EPISODE NARRATIVE:
${narrativeEpisode?.scenes?.map((s: any, idx: number) => `Scene ${idx + 1}: ${s.content}`).join('\n\n') || 'No narrative available'}

STORY CONTEXT:
Series: ${storyBible.seriesTitle}
Genre: ${storyBible.genre}
Episode: ${episode.episodeNumber} - ${episode.episodeTitle || episode.title}
Target Audience: ${storyBible.targetAudience || 'General audience'}

REQUIREMENTS:
- Identify key marketing hooks and selling points
- Create compelling episode descriptions (short, medium, long)
- Suggest social media content and hashtags
- Identify target audience segments
- Create trailer/teaser concepts
- Suggest promotional partnerships or tie-ins
- Include content warnings if needed
- Consider platform-specific strategies

Format as comprehensive marketing brief.`;

      const result = await generateContent(prompt, { 
        temperature: 0.4, 
        maxTokens: 2000,
        systemPrompt: "You are a professional entertainment marketing strategist."
      });
      
      return { marketingStrategy: result };
    }, `Marketing Episode ${episode.episodeNumber}`);

    // Parse marketing strategy into structured data for UI
    const marketingText = marketing?.marketingStrategy || "Marketing generation failed";
    const marketingHooks = [];
    const hashtags = [];
    
    try {
      // Extract marketing hooks and hashtags from the generated text
      const lines = marketingText.split('\n').filter((line: string) => line.trim());
      
      for (const line of lines) {
        // Look for hashtags (lines containing #)
        const hashtagMatches = line.match(/#[\w]+/g);
        if (hashtagMatches) {
          hashtags.push(...hashtagMatches.map((tag: string) => tag.replace('#', '')));
        }
        
        // Look for marketing hooks (bullet points, numbered lists, or hook indicators)
        if (line.match(/^[\-\*•]\s*/) || line.match(/^\d+\.\s*/) || 
            line.toLowerCase().includes('hook') || 
            line.toLowerCase().includes('selling point') ||
            line.toLowerCase().includes('appeal')) {
          const hook = line.replace(/^[\-\*•\d\.\s]+/, '').trim();
          if (hook && hook.length > 10) {
            marketingHooks.push(hook);
          }
        }
      }
      
      // If no hooks found, create some from the text
      if (marketingHooks.length === 0) {
        const sentences = marketingText.split(/[.!?]+/).filter((s: string) => s.trim().length > 20);
        marketingHooks.push(...sentences.slice(0, 3).map((s: string) => s.trim()));
      }
      
      // If no hashtags found, generate some basic ones
      if (hashtags.length === 0) {
        const seriesName = storyBible.seriesTitle?.replace(/\s+/g, '') || 'Series';
        hashtags.push(seriesName, `${seriesName}Episode${episode.episodeNumber}`, storyBible.genre || 'Drama');
      }
      
    } catch (e) {
      console.error('Error parsing marketing strategy:', e);
      marketingHooks.push(marketingText);
      hashtags.push('NewEpisode', 'ComingSoon');
    }

    episodes.push({
      episodeNumber: episode.episodeNumber,
      episodeTitle: episode.episodeTitle || episode.title,
      marketingHooks: marketingHooks.slice(0, 5), // Limit to 5 hooks
      hashtags: [...new Set(hashtags)].slice(0, 8) // Remove duplicates and limit to 8
    });
  }
  
  await updateProgress('Marketing', 'Marketing strategies generated for all episodes', 100, 7);
  return {
    episodes,
    totalEpisodes: episodes.length,
    format: 'marketing-strategy',
    generatedAt: new Date().toISOString()
  };
}

// STEP 8: Generate Post-Production Per Scene (Based on Storyboard)
export async function generateV2PostProduction(context: any, storyboard: any, updateProgress: (stepName: string, detail: string, stepProgress: number, stepIndex: number) => Promise<void>) {
  const { storyBible, actualEpisodes } = context;
  
  // Safety checks
  if (!actualEpisodes || !Array.isArray(actualEpisodes) || actualEpisodes.length === 0) {
    console.error('❌ No actualEpisodes provided to generateV2PostProduction');
    return { episodes: [], totalScenes: 0, format: 'post-production-guide' };
  }
  
  const episodes = [];
  let processedScenes = 0;

  await updateProgress('Post-Production', 'Starting post-production planning...', 0, 8);

  for (let i = 0; i < actualEpisodes.length; i++) {
    const episode = actualEpisodes[i];
    const storyboardEpisode = storyboard.episodes.find((ep: any) => ep.episodeNumber === episode.episodeNumber);
    const episodeScenes = episode.scenes || [];
    const postProdScenes = [];

    for (let j = 0; j < episodeScenes.length; j++) {
      const storyboardScene = storyboardEpisode?.scenes?.find((s: any) => s.sceneNumber === j + 1);
      processedScenes++;
      
      await updateProgress('Post-Production', `Episode ${episode.episodeNumber}, Scene ${j + 1}/${episodeScenes.length}`, 
        Math.round((processedScenes / context.totalScenes) * 100), 8);

      const postProd = await retryWithFallback(async () => {
        const prompt = `Create a detailed post-production guide for this scene.

STORYBOARD:
${storyboardScene?.storyboard || 'No storyboard available'}

STORY CONTEXT:
Series: ${storyBible.seriesTitle}
Genre: ${storyBible.genre}
Episode: ${episode.episodeNumber} - Scene ${j + 1}

REQUIREMENTS:
- Editing notes and pacing guidelines
- Color grading and visual tone suggestions
- Sound design and music cues
- Visual effects (VFX) requirements
- Audio post-production needs
- Graphics and title overlays
- Transition recommendations
- Quality control checkpoints

Format as professional post-production workflow.`;

        const result = await generateContent(prompt, { 
          temperature: 0.35, 
          maxTokens: 1500,
          systemPrompt: "You are a professional post-production supervisor and editor."
        });
        
        return { postProdGuide: result };
      }, `Post-Production Scene ${episode.episodeNumber}-${j + 1}`);

      postProdScenes.push({
        sceneNumber: j + 1,
        sceneTitle: `Scene ${j + 1}`,
        notes: postProd?.postProdGuide || "Post-production generation failed"
      });
    }

    episodes.push({
      episodeNumber: episode.episodeNumber,
      episodeTitle: episode.episodeTitle || episode.title,
      scenes: postProdScenes
    });
  }
  
  await updateProgress('Post-Production', 'Post-production guides generated for all scenes', 100, 8);
  return {
    episodes,
    totalScenes: processedScenes,
    format: 'post-production-guide'
  };
}
