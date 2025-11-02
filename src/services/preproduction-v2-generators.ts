// =================================================================
// V2 PRE-PRODUCTION GENERATORS - ENGINE-ENHANCED GPT-4.1 (AZURE OPENAI)
// =================================================================

import { generateContent } from '@/services/azure-openai'
import { cleanAndParseJSON } from '@/lib/json-utils'
import { DialogueEngineV2 } from '@/services/dialogue-engine-v2'
import { TensionEscalationEngine } from '@/services/tension-escalation-engine'
import { PerformanceCoachingEngineV2 } from '@/services/performance-coaching-engine-v2'
import { LanguageEngineV2 } from '@/services/language-engine-v2'
import { FiveMinuteCanvasEngineV2 } from '@/services/five-minute-canvas-engine-v2'
import type { StoryPremise } from '@/services/premise-engine'
import { retryWithModelFallback } from '@/services/model-fallback-utils'

// Engine options interface based on user's design - COMPREHENSIVE 8-ENGINE SUITE
interface ScriptEngineOptions {
  useEngines?: boolean
  engineLevel?: 'basic' | 'professional' | 'master'
  masterTechnique?: 'sorkin' | 'mamet' | 'tarantino' | 'mixed'
  subtextLevel?: 'minimal' | 'moderate' | 'heavy'
  conflictIntensity?: number // 1-10 scale
  useTensionEngine?: boolean // TensionEscalationEngine
  tensionLevel?: 'subtle' | 'moderate' | 'intense' | 'extreme'
  usePerformanceEngine?: boolean // PerformanceCoachingEngineV2
  useLanguageEngine?: boolean // LanguageEngineV2
  culturalContext?: 'filipino' | 'american' | 'multicultural' | 'generic'
  voiceDifferentiation?: 'basic' | 'advanced' | 'master'
  useFormatEngine?: boolean // FiveMinuteCanvasEngineV2
  useGenreMastery?: boolean // GenreMasterySystem
  useCharacterEngine?: boolean // CharacterEngineV2
  attentionStrategy?: 'retention-maximized' | 'engagement-focused' | 'standard'
  compressionLevel?: 'moderate' | 'aggressive' | 'extreme'
  mode?: 'beast' | 'stable'
}

// 🎭 ENGINE-ENHANCED SCRIPT GENERATION (Based on user's ENHANCED_SCRIPT_USAGE_DEMO.md)
async function generateEngineEnhancedScript(scene: any, storyBible: any, options: ScriptEngineOptions) {
  
  try {
    // Build proper context for DialogueEngineV2
    const dialogueContext = {
      characters: [
        { name: "CHARACTER_A", personality: "determined", background: "unknown", objective: "scene objective", emotionalState: "engaged" },
        { name: "CHARACTER_B", personality: "supportive", background: "unknown", objective: "response objective", emotionalState: "responsive" }
      ],
      sceneObjective: scene.content,
      conflictType: 'interpersonal' as const,
      genre: (storyBible.genre?.toLowerCase() || 'drama') as 'comedy' | 'drama' | 'thriller' | 'action' | 'romance' | 'horror',
      setting: "scene location",
      stakes: "character relationship and goals"
    };

    const dialogueRequirements = {
      masterTechnique: options.masterTechnique || 'mixed',
      subtextLevel: options.subtextLevel || 'moderate',
      conflictIntensity: options.conflictIntensity || 6,
      lengthTarget: 'medium' as const,
      emotionalArc: 'building tension to resolution'
    };

    const dialogueOptions = {
      voiceDifferentiation: options.voiceDifferentiation === 'advanced' || options.voiceDifferentiation === 'master',
      performanceNotes: options.usePerformanceEngine,
      revisionLevel: options.engineLevel || 'professional'
    };

    // Generate enhanced dialogue using DialogueEngineV2 
    const dialogueResult = await DialogueEngineV2.generateDialogueSequence(
      dialogueContext,
      dialogueRequirements,
      dialogueOptions
    );

    
    // Generate actual screenplay format using the dialogue result
    const screenplayContent = await generateActualScreenplayFromDialogue(dialogueResult, scene, storyBible);
    
    return {
      screenplay: screenplayContent,
      enhancedContent: true,
      metadata: {
        engineUsed: 'DialogueEngineV2',
        masterTechnique: options.masterTechnique || 'mixed',
        subtextLevel: options.subtextLevel || 'moderate',
        engineLevel: options.engineLevel || 'professional'
      }
    };

  } catch (error) {
    console.error('❌ Engine enhancement failed:', error);
    throw error; // Let it fall back to standard generation
  }
}

// Generate actual screenplay format from dialogue result
async function generateActualScreenplayFromDialogue(dialogueResult: any, scene: any, storyBible: any): Promise<string> {
  
  try {
    // Extract dialogue and characters from the result
    const dialogue = dialogueResult.dialogue || dialogueResult;
    const characters = dialogue.characters || [];
    
    // Generate proper screenplay format
       const screenplayPrompt = `Convert this dialogue and scene content into proper screenplay format:

SCENE CONTENT:
${scene.content}

DIALOGUE RESULT:
${JSON.stringify(dialogue, null, 2)}

STORY BIBLE:
Genre: ${storyBible.genre}
Series: ${storyBible.seriesTitle}

REQUIREMENTS:
1. Start with proper scene heading: INT./EXT. LOCATION - TIME OF DAY
2. Add action lines describing the scene setup
3. Format character names in ALL CAPS, centered (NO HTML tags)
4. Format dialogue with proper indentation
5. Add parentheticals where appropriate
6. Use proper screenplay margins and spacing
7. Make it look like a real script, not narrative prose
8. NO HTML tags like <center> or <b> - use plain text formatting only

EXAMPLE FORMAT:
INT. COFFEE SHOP - DAY

Sarah sits at a corner table, nervously checking her phone.

SARAH
(whispering to herself)
Where is he?

The door opens. Mike enters, scanning the room.

MIKE
Hey, sorry I'm late.

SARAH
You're always late.

Return ONLY the formatted screenplay scene.`;

    const { generateGeminiContent } = await import('@/services/gemini-api');
    const result = await generateGeminiContent(screenplayPrompt, {
      temperature: 0.3,
      maxTokens: 2000,
      systemPrompt: "You are a professional screenwriter. Convert dialogue and scene content into proper screenplay format with scene headings, character names, dialogue, and action lines. NEVER include narrative prose, descriptive writing, or HTML tags. Use ONLY plain text formatting."
    });
    
    return result;
  } catch (error) {
    console.error('❌ Failed to generate screenplay format:', error);
    // Fallback to basic format
    return `INT. SCENE - DAY

${scene.content}

CHARACTER
This is placeholder dialogue.`;
  }
}

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

// STEP 2: Generate Scripts Per Scene (Temperature 0.35) - NOW WITH ENGINE ENHANCEMENT
export async function generateV2Scripts(
  context: any, 
  narrative: any, 
  updateProgress: (stepName: string, detail: string, stepProgress: number, stepIndex: number) => Promise<void>,
  options: ScriptEngineOptions = {}
) {
  const { storyBible, actualEpisodes } = context;
  
  // Safety checks
  if (!actualEpisodes || !Array.isArray(actualEpisodes) || actualEpisodes.length === 0) {
    console.error('❌ No actualEpisodes provided to generateV2Scripts');
    return { episodes: [], totalScenes: 0, format: 'scene-by-scene-screenplay' };
  }

  // 🚀 ENGINE ENHANCEMENT LOGIC (Based on user's design)
  const useEngines = options.useEngines || context.useEngines;
  if (useEngines) {
  } else {
    console.log('📝 Using standard script generation (no engines)');
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

      // Use model fallback for script generation
      const sceneScript = await retryWithModelFallback(
        // Operation function - accepts useFallbackModel parameter and modelType
        async (useFallbackModel, modelType = 'gemini') => {
          console.log(`📝 SCRIPT GENERATION: Scene ${episode.episodeNumber}-${j + 1}${useFallbackModel ? ` (using ${modelType} model)` : ' (using gemini model)'}`);
          
          // 🎭 ENGINE-ENHANCED GENERATION (Based on user's design)
          if (useEngines) {
            try {
              // For now, we're keeping the engine enhancement separate from model fallback
              // In a future implementation, we could integrate them more deeply
              return await generateEngineEnhancedScript(scene, storyBible, options);
            } catch (error) {
              console.warn('⚠️ Engine enhancement failed, falling back to standard generation:', error);
              // Fall through to standard generation with model fallback
            }
          }

          // 📝 ENHANCED SCREENPLAY GENERATION with proper dialogue structure
          const prompt = `Transform this narrative prose into a professional screenplay scene with rich, engaging dialogue. Use STRICT screenplay format. This is Scene ${j + 1} from a 5-minute episode.

NARRATIVE SCENE:
${scene.content}

STORY BIBLE CONTEXT:
Series: ${storyBible.seriesTitle}
Genre: ${storyBible.genre}

CRITICAL REQUIREMENTS:
- Generate ACTUAL DIALOGUE between characters, not narrative prose
- Use proper screenplay formatting with scene headings, character names, and dialogue
- Expand the dialogue naturally from the narrative content
- Include 2-3 characters who have a conversation (based on the narrative)
- Each character should speak multiple times
- Include conflict, tension, and character development through dialogue
- DO NOT add scenes or characters not implied by the narrative
- This is one scene from a 5-minute episode - keep it focused and concise

MANDATORY SCREENPLAY FORMAT:
1. Scene Heading: INT./EXT. LOCATION - TIME OF DAY
2. Action Lines: Short, present-tense, observable actions only
3. Character Names: ALL CAPS, centered above dialogue
4. Dialogue: Natural, engaging conversation that reveals character
5. Parentheticals: (sparingly) for essential direction only

DIALOGUE REQUIREMENTS:
- Create actual conversations between characters
- Each character should speak 3-5 times minimum per scene
- Include subtext, conflict, and character voice
- Make dialogue feel authentic and engaging
- Add conversational flow with responses, questions, and reactions
- Characters should interrupt, disagree, and have distinct speaking patterns
- Use proper character names (extract from scene content or create appropriate names)

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
- NO embedded dialogue in action lines

SCENE LENGTH: 300-500 words with substantial dialogue
FOCUS: Character interaction and conversation, not just plot advancement

EXAMPLE FORMAT:
INT. COFFEE SHOP - DAY

Sarah sits at a corner table, nervously checking her phone.

SARAH
(whispering to herself)
Where is he?

The door opens. Mike enters, scanning the room.

MIKE
Hey, sorry I'm late.

SARAH
You're always late.

MIKE
Traffic was insane.

SARAH
That's what you said last time.

MIKE
Because it's always insane.

SARAH
Maybe you should leave earlier.

MIKE
Maybe you should pick a closer coffee shop.

Return ONLY the formatted screenplay scene.`;

          const systemPrompt = "You are a professional screenwriter. Generate ONLY proper screenplay format with scene headings, character names, dialogue, and action lines. NEVER include narrative prose, descriptive writing, or emotional analysis. Create actual conversations between characters with proper screenplay formatting. Each character must speak multiple times in a natural conversation. Use proper indentation and formatting for character names and dialogue.";
          
          let result;
          if (modelType === 'gemini') {
            // Use Gemini for generation
            const { generateGeminiContent } = await import('@/services/gemini-api');
            result = await generateGeminiContent(prompt, {
              temperature: 0.5,
              maxTokens: 2000,
              systemPrompt: systemPrompt
            });
          } else {
            // Use OpenAI model for generation
            const { generateContent } = await import('@/services/azure-openai');
            result = await generateContent(prompt, {
              temperature: 0.5,
              maxTokens: 2000,
              systemPrompt: systemPrompt,
              model: modelType
            });
          }
          
          return { 
            screenplay: result, 
            enhancedContent: false,
            metadata: {
              modelUsed: modelType
            }
          };
        }, 
        `Script Scene ${episode.episodeNumber}-${j + 1}`,
        3, // Max retries
        { 
          primaryModel: 'gemini', // Use Gemini as primary model
          useGPT41: true,         // Use GPT-4.1 as first fallback
          useGPT4: true,          // Use GPT-4 as second fallback
          useGPT35Turbo: true     // Use GPT-3.5 Turbo as third fallback
        }
      );

      scriptScenes.push({
        sceneNumber: j + 1,
        screenplay: sceneScript?.screenplay || "Scene script generation failed",
        // Store metadata for engine-enhanced content if available
        scriptMetadata: sceneScript?.metadata || null,
        engineEnhanced: sceneScript?.enhancedContent || false
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
    format: 'scene-by-scene-screenplay',
    engineEnhanced: useEngines
  };
}

// Interface for storyboard enhancement options based on user's design
export interface StoryboardEnhancementOptions {
  useEngines?: boolean
  engineLevel?: 'basic' | 'professional' | 'master'
  cinematographerStyle?: 'naturalistic' | 'classical' | 'stylized' | 'kinetic' | 'atmospheric'
  enhancementLevel?: 'STANDARD' | 'ENHANCED' | 'PREMIUM'
  visualPriority?: 'artistic' | 'functional' | 'cinematic' | 'dynamic'
  shotCompositionStyle?: 'rule-of-thirds' | 'symmetrical' | 'minimalist' | 'dynamic'
  lightingMood?: 'dramatic' | 'neutral' | 'atmospheric' | 'high-key' | 'low-key'
  cameraMovementPreference?: 'static' | 'fluid' | 'dynamic' | 'minimal' | 'extensive'
  genreConsideration?: boolean
  colorPsychologyFocus?: boolean
  generateImages?: boolean // NEW: Enable AI image generation for shots
  imageQuality?: 'standard' | 'hd'
}

// STEP 3: Generate Storyboards Per Scene (Based on Script)
export async function generateV2Storyboards(context: any, narrative: any, script: any, updateProgress: (stepName: string, detail: string, stepProgress: number, stepIndex: number) => Promise<void>, options: StoryboardEnhancementOptions = {}) {
  const { storyBible, actualEpisodes, useEnhancedVisuals = false } = context;
  
  // Check if enhanced visual generation is enabled
  if ((useEnhancedVisuals || options.useEngines) && context.useEngines) {
    console.log('🎨 STORYBOARD ENGINES ENABLED: Using enhanced visual planning...');
    return await generateV2StoryboardsWithEngines(context, narrative, script, updateProgress, options);
  }
  
  return await generateV2StoryboardsOriginal(context, narrative, script, updateProgress);
}

// Original storyboard generation function preserved as fallback
async function generateV2StoryboardsOriginal(context: any, narrative: any, script: any, updateProgress: (stepName: string, detail: string, stepProgress: number, stepIndex: number) => Promise<void>) {
  const { storyBible, actualEpisodes } = context;
  
  // Safety checks
  if (!actualEpisodes || !Array.isArray(actualEpisodes) || actualEpisodes.length === 0) {
    console.error('❌ No actualEpisodes provided to generateV2StoryboardsOriginal');
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
        const prompt = `Create a visual storyboard for this scene from a 5-minute episode. Break it into 3-5 shots for proper coverage.

NARRATIVE SCENE:
${scene.content}

SCRIPT (if available):
${scriptScene?.screenplay || 'No script available'}

STORY CONTEXT:
Series: ${storyBible.seriesTitle}
Genre: ${storyBible.genre}

REQUIREMENTS:
- Break down into 3-5 visual shots (this is one scene from a 5-minute episode)
- For each shot, specify: shot type (wide/medium/close), camera angle, camera movement
- Describe lighting, mood, and atmosphere
- Note any special effects or key props visible in frame
- Keep professional film production format
- DO NOT add scenes or shots not implied by the narrative

Format as a detailed shot list starting with "SHOT 1:", "SHOT 2:", etc.`;

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

// ENGINE-ENHANCED STORYBOARD GENERATION
export async function generateV2StoryboardsWithEngines(
  context: any,
  narrative: any, 
  script: any,
  updateProgress: (stepName: string, detail: string, stepProgress: number, stepIndex: number) => Promise<void>,
  options: StoryboardEnhancementOptions = {}
) {
  // Preserve existing structure but enhance visual planning
  const { storyBible, actualEpisodes } = context;
  
  if (!actualEpisodes || !Array.isArray(actualEpisodes) || actualEpisodes.length === 0) {
    console.error('❌ No actualEpisodes provided to generateV2StoryboardsWithEngines');
    return { episodes: [], totalScenes: 0, format: 'visual-storyboard' };
  }

  const episodes = [];
  let processedScenes = 0;

  for (let i = 0; i < actualEpisodes.length; i++) {
    const episode = actualEpisodes[i];
    const episodeScenes = episode.scenes || [];
    const scriptEpisode = script?.episodes?.find((ep: any) => ep.episodeNumber === episode.episodeNumber);
    const storyboardScenes = [];
    
    for (let j = 0; j < episodeScenes.length; j++) {
      const scene = episodeScenes[j];
      const scriptScene = scriptEpisode?.scenes?.find((s: any) => s.sceneNumber === j + 1);
      processedScenes++;
      
      await updateProgress('Storyboard', `Episode ${episode.episodeNumber}, Scene ${j + 1}/${episodeScenes.length}`, 
        Math.round((processedScenes / context.totalScenes) * 100), 3);

      // ENHANCED: Use engine-powered visual planning with model fallback
      const storyboard = await retryWithModelFallback(
        // Operation function - accepts useFallbackModel parameter and modelType
        async (useFallbackModel, modelType = 'gemini') => {
          console.log(`🎨 STORYBOARD ENGINE V2.0: Enhancing scene ${episode.episodeNumber}-${j + 1} with ${options.cinematographerStyle || 'naturalistic'} style...${useFallbackModel ? ` (using ${modelType} model)` : ' (using gemini model)'}`);
          
          try {
            // Convert scene to the format expected by StoryboardEngineV2
            const scriptSceneForEngine: any = {
              sceneHeading: `Scene ${j + 1}`,
              location: scene.content.split(' ').slice(0, 3).join(' '),
              timeOfDay: 'DAY',
              characters: [] as string[],
              actionLines: [scene.content],
              dialogueBlocks: [] as any[]
            };
            
            // Extract characters if available in script
            if (scriptScene?.screenplay) {
              const lines = scriptScene.screenplay.split('\n');
              for (const line of lines) {
                // Extract character names (all caps)
                const characterMatch = line.match(/^([A-Z]{2,})(\s*\(.*\))?$/);
                if (characterMatch && !scriptSceneForEngine.characters.includes(characterMatch[1])) {
                  scriptSceneForEngine.characters.push(characterMatch[1]);
                }
                
                // Extract dialogue blocks if needed
                if (line.trim() && !line.match(/^[A-Z]{2,}/) && !line.match(/^(INT\.|EXT\.)/)) {
                  if (scriptSceneForEngine.characters.length > 0 && !line.startsWith('  ')) {
                    scriptSceneForEngine.dialogueBlocks.push({
                      character: scriptSceneForEngine.characters[scriptSceneForEngine.characters.length - 1],
                      dialogue: line,
                      emotionalContext: 'neutral'
                    });
                  } else if (!line.match(/^[A-Z]{2,}/)) {
                    scriptSceneForEngine.actionLines.push(line);
                  }
                }
              }
            }
            
            // Create a detailed prompt for model-based generation
            const prompt = `Create a visual storyboard for this scene from a 5-minute episode. Break it into 3-5 shots for proper coverage. Use a ${options.cinematographerStyle || 'naturalistic'} cinematography style.

SCENE CONTENT:
${scene.content}

SCRIPT (if available):
${scriptScene?.screenplay || 'No script available'}

CHARACTERS:
${scriptSceneForEngine.characters.join(', ') || 'Characters not specified'}

STORY CONTEXT:
Series: ${storyBible.seriesTitle}
Genre: ${storyBible.genre}

REQUIREMENTS:
- Break down into 3-5 visual shots (this is one scene from a 5-minute episode)
- Use ${options.cinematographerStyle || 'naturalistic'} cinematography style
- For each shot, specify: shot type (wide/medium/close), camera angle, camera movement
- Describe lighting, mood, and atmosphere
- Note any special effects or key props visible in frame
- DO NOT add scenes or shots not implied by the narrative
- Format as a professional shot list starting with "SHOT 1:", "SHOT 2:", etc.
- Include shot size (close-up, medium, wide, etc.)
- Include camera movement (static, pan, dolly, etc.)
- Include a brief description of what happens in each shot
- Include the emotional purpose of key shots

FORMAT EACH SHOT AS:
SHOT #: [Shot Size]
Camera: [Camera Angle] - [Camera Movement]
Description: [What we see]
Purpose: [Emotional/narrative purpose]`;

            const systemPrompt = "You are a professional cinematographer and storyboard artist specializing in the " + 
              (options.cinematographerStyle || 'naturalistic') + " style. Create detailed, professional storyboards that directors and DPs can immediately use for filming.";
            
            // If using Gemini (primary) or any fallback model, use the direct prompt approach
            if (modelType === 'gemini' || useFallbackModel) {
              console.log(`🔄 Using ${modelType} model for storyboard generation...`);
              
              let result;
              if (modelType === 'gemini') {
                // Use Gemini for generation
                const { generateGeminiContent } = await import('@/services/gemini-api');
                result = await generateGeminiContent(prompt, {
                  temperature: 0.4,
                  maxTokens: 2000,
                  systemPrompt: systemPrompt
                });
              } else {
                // Use OpenAI model for generation
                const { generateContent } = await import('@/services/azure-openai');
                result = await generateContent(prompt, {
                  temperature: 0.4,
                  maxTokens: 2000,
                  systemPrompt: systemPrompt,
                  model: modelType
                });
              }
              
              // Format the result as an enhanced storyboard
              const formattedStoryboard = `ENHANCED STORYBOARD (${modelType.toUpperCase()} MODEL) - Scene ${j+1} - ${options.cinematographerStyle || 'naturalistic'} style\n\n${result}`;
              
              return { 
                storyboard: formattedStoryboard,
                enhancedContent: true, 
                metadata: {
                  engineUsed: `${modelType.toUpperCase()}Model`,
                  style: options.cinematographerStyle || 'naturalistic',
                  enhancementLevel: options.enhancementLevel || 'STANDARD'
                }
              };
            }

            // This code path should not be reached with current configuration
            // but keeping it for future use with specialized engines
            const { StoryboardEngineV2 } = await import('./storyboard-engine-v2');
            
            const storyboardSequence = await StoryboardEngineV2.generateStoryboardSequence(
              scriptSceneForEngine,
              [], // Characters would be populated here in full implementation
              { 
                title: scene.content,
                genre: storyBible.genre || 'drama',
                theme: 'dynamic',
                premiseStatement: scene.content,
                premiseType: 'scene',
                character: { name: 'character', goal: 'complete scene', motivation: 'story progression' },
                setting: { location: 'scene location', time: 'present day', context: 'narrative' },
                conflict: { type: 'default', description: 'scene conflict' },
                resolution: 'standard'
              } as unknown as StoryPremise,
              {
                genre: storyBible.genre,
                cinematographerStyle: options.cinematographerStyle || 'naturalistic',
                complexity: options.enhancementLevel === 'PREMIUM' ? 'lean-forward' : 'lean-back',
                budget: 'medium',
                targetDuration: 5
              }
            );
            
            
            // Format the storyboard sequence into a text representation
            let formattedStoryboard = `ENHANCED STORYBOARD - Scene ${j+1} - ${options.cinematographerStyle || 'naturalistic'} style\n\n`;
            
            storyboardSequence.shots.forEach((shot, index) => {
              formattedStoryboard += `SHOT ${index+1}: ${shot.shotSize?.name || 'Medium Shot'}\n`;
              formattedStoryboard += `Camera: ${shot.cameraAngle?.name || 'Eye Level'} - ${shot.cameraMovement?.name || 'Static'}\n`;
              formattedStoryboard += `Description: ${shot.description}\n`;
              if (shot.emotionalPurpose) {
                formattedStoryboard += `Purpose: ${shot.emotionalPurpose}\n`;
              }
              formattedStoryboard += `\n`;
            });
            
            return { 
              storyboard: formattedStoryboard,
              enhancedContent: true, 
              metadata: {
                engineUsed: 'StoryboardEngineV2',
                shotCount: storyboardSequence.shots.length,
                style: options.cinematographerStyle || 'naturalistic',
                enhancementLevel: options.enhancementLevel || 'STANDARD'
              }
            };
          } catch (error) {
            console.warn(`Storyboard generation with ${modelType} model failed for scene ${episode.episodeNumber}-${j + 1}:`, error);
            throw error; // Let it try the next model or fallback to standard generation
          }
        }, 
        `Enhanced Storyboard Scene ${episode.episodeNumber}-${j + 1}`,
        3, // Max retries
        { 
          primaryModel: 'gemini', // Use Gemini as primary model
          useGPT41: true,         // Use GPT-4.1 as first fallback
          useGPT4: true,          // Use GPT-4 as second fallback
          useGPT35Turbo: true     // Use GPT-3.5 Turbo as third fallback
        }
      );

      // 🎨 GENERATE AI REFERENCE IMAGES if enabled
      let shotImages: string[] = [];
      if (options.generateImages && storyboard?.storyboard) {
        try {
          console.log(`🎨 Generating AI reference images for scene ${episode.episodeNumber}-${j + 1}...`);
          const { AIImageGenerator } = await import('./ai-image-generator');
          
          // Extract shots from storyboard text (simplified approach)
          const shotMatches = storyboard.storyboard.match(/SHOT \d+:([^\n]+)/gi) || [];
          const shotDescriptions = shotMatches.slice(0, 5); // Max 5 images per scene
          
          for (let k = 0; k < shotDescriptions.length; k++) {
            const shotDesc = shotDescriptions[k].replace(/SHOT \d+:/i, '').trim();
            const shotType = shotDesc.split(/\n/)[0].trim();
            
            const imageUrl = await AIImageGenerator.generateStoryboardFrame(
              scene.content,
              shotType,
              '16:9',
              { quality: options.imageQuality || 'standard' }
            );
            
            shotImages.push(imageUrl);
            console.log(`   ✓ Generated image ${k + 1}/${shotDescriptions.length} for shot: ${shotType.substring(0, 40)}...`);
          }
          
          console.log(`✅ Generated ${shotImages.length} AI reference images for scene ${episode.episodeNumber}-${j + 1}`);
        } catch (error) {
          console.warn(`Failed to generate images for scene ${episode.episodeNumber}-${j + 1}:`, error);
          // Continue without images - not a fatal error
        }
      }

      storyboardScenes.push({
        sceneNumber: j + 1,
        storyboard: storyboard?.storyboard || storyboard?.enhancedContent || "Storyboard generation failed",
        // Store visual metadata for consistency tracking if available
        visualMetadata: storyboard?.metadata || null,
        // NEW: AI-generated reference images
        referenceImages: shotImages.length > 0 ? shotImages : undefined
      });
    }

    episodes.push({
      episodeNumber: episode.episodeNumber,
      episodeTitle: episode.episodeTitle || episode.title,
      scenes: storyboardScenes
    });
  }
  
  await updateProgress('Storyboard', 'Enhanced storyboards generated for all scenes', 100, 3);
  return {
    episodes,
    totalScenes: processedScenes,
    format: 'visual-storyboard-enhanced',
    engineEnhanced: true,
    metadata: {
      engineUsed: 'StoryboardEngineV2'
    }
  } as any;
}

// Interface for props enhancement options based on user's design
export interface PropsEnhancementOptions {
  useEngines?: boolean
  engineLevel?: 'basic' | 'professional' | 'master'
  designApproach?: 'authentic_world_building' | 'narrative_driven' | 'stylized_artistic' | 'practical_optimized'
  enhancementLevel?: 'STANDARD' | 'ENHANCED' | 'PREMIUM'
  worldConsistency?: boolean
  budgetOptimization?: boolean
  narrativeIntegration?: boolean
  productionConstraints?: string[]
  visualStyle?: string
  generateImages?: boolean // NEW: Enable AI image generation for props/wardrobe
  imageQuality?: 'standard' | 'hd'
}

// STEP 4: Generate Props Per Episode (Based on Narrative & Storyboard)
export async function generateV2Props(context: any, narrative: any, storyboard: any, updateProgress: (stepName: string, detail: string, stepProgress: number, stepIndex: number) => Promise<void>, options: PropsEnhancementOptions = {}) {
  const { storyBible, actualEpisodes, useEnhancedProductionDesign = false } = context;
  
  // Check if enhanced props generation is enabled
  if ((useEnhancedProductionDesign || options.useEngines) && context.useEngines) {
    console.log('🍘 PROPS ENGINES ENABLED: Using enhanced production design...');
    return await generateV2PropsWithEngines(context, narrative, storyboard, updateProgress, options);
  }
  
  console.log('👟 Using standard props generation (no engines)');
  return await generateV2PropsOriginal(context, narrative, storyboard, updateProgress);
}

// Original props generation function preserved as fallback
async function generateV2PropsOriginal(context: any, narrative: any, storyboard: any, updateProgress: (stepName: string, detail: string, stepProgress: number, stepIndex: number) => Promise<void>) {
  const { storyBible, actualEpisodes } = context;
  
  // Safety checks
  if (!actualEpisodes || !Array.isArray(actualEpisodes) || actualEpisodes.length === 0) {
    console.error('❌ No actualEpisodes provided to generateV2PropsOriginal');
    return { episodes: [], format: 'production-props' };
  }
  
  const episodes = [];

  await updateProgress('Props', 'Starting props generation (standard)...', 0, 4);

  for (let i = 0; i < actualEpisodes.length; i++) {
    const episode = actualEpisodes[i];
    const narrativeEpisode = narrative.episodes.find((ep: any) => ep.episodeNumber === episode.episodeNumber);
    const storyboardEpisode = storyboard.episodes.find((ep: any) => ep.episodeNumber === episode.episodeNumber);
    
    await updateProgress('Props', `Episode ${episode.episodeNumber}/${actualEpisodes.length}`, 
      Math.round(((i + 1) / actualEpisodes.length) * 100), 4);

    const props = await retryWithFallback(async () => {
      const sceneCount = narrativeEpisode?.scenes?.length || 0
      const prompt = `Extract ONLY the props and wardrobe explicitly mentioned or clearly implied in these ${sceneCount} scenes. This is a 5-minute episode - be realistic.

EPISODE NARRATIVE (${sceneCount} scenes):
${narrativeEpisode?.scenes?.map((s: any, idx: number) => `Scene ${idx + 1}: ${s.content}`).join('\n\n') || 'No narrative available'}

STORYBOARD INFO:
${storyboardEpisode?.scenes?.map((s: any, idx: number) => `Scene ${idx + 1}: ${s.storyboard?.substring(0, 200)}...`).join('\n\n') || 'No storyboard available'}

STORY CONTEXT:
Series: ${storyBible.seriesTitle}
Genre: ${storyBible.genre}
Episode: ${episode.episodeNumber} - ${episode.episodeTitle || episode.title}

STRICT REQUIREMENTS:
- Extract ONLY props that characters interact with or are visible in scenes (expect 10-15 items for ${sceneCount} scenes)
- Include ONLY wardrobe for characters who actually appear in these scenes
- DO NOT invent props or characters not mentioned in the scenes
- Focus on: hand props, essential set pieces, character wardrobe
- Include sourcing suggestions (buy/rent/make)
- This is ${sceneCount} scenes in a 5-minute episode - be concise

Format as organized production list with bullet points.`;

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

// NEW: Enhanced props generation with engines
export async function generateV2PropsWithEngines(
  context: any,
  narrative: any,
  storyboard: any,
  updateProgress: (stepName: string, detail: string, stepProgress: number, stepIndex: number) => Promise<void>,
  options: PropsEnhancementOptions = {}
) {
  const { storyBible, actualEpisodes } = context;
  
  // Safety checks
  if (!actualEpisodes || !Array.isArray(actualEpisodes) || actualEpisodes.length === 0) {
    console.error('❌ No actualEpisodes provided to generateV2PropsWithEngines');
    return { episodes: [], format: 'production-props' };
  }
  
  const episodes = [];

  await updateProgress('Props', 'Starting enhanced props generation...', 0, 4);

  for (let i = 0; i < actualEpisodes.length; i++) {
    const episode = actualEpisodes[i];
    const narrativeEpisode = narrative.episodes.find((ep: any) => ep.episodeNumber === episode.episodeNumber);
    const storyboardEpisode = storyboard.episodes.find((ep: any) => ep.episodeNumber === episode.episodeNumber);
    
    await updateProgress('Props', `Episode ${episode.episodeNumber}/${actualEpisodes.length} with enhanced design`, 
      Math.round(((i + 1) / actualEpisodes.length) * 100), 4);

    // ENHANCED: Use engine-powered props design with fallback
    const props = await retryWithFallback(async () => {
      try {
        console.log(`🍘 PROPS ENGINE: Designing production elements for episode ${episode.episodeNumber} with ${options.designApproach || 'authentic_world_building'} approach...`);
        
        // Import and use VisualDesignEngineV2
        const { VisualDesignEngineV2 } = await import('./visual-design-engine-v2');
        
        // Generate enhanced props design
        const propsDesign = await generateEnhancedPropsDesign(episode, narrativeEpisode, storyboardEpisode, {
          storyBible,
          episodeNumber: episode.episodeNumber,
          episodeTitle: episode.episodeTitle || episode.title,
          enhancementLevel: options.enhancementLevel || 'STANDARD',
          designApproach: options.designApproach || 'authentic_world_building',
          worldConsistency: options.worldConsistency !== false,
          budgetOptimization: options.budgetOptimization !== false,
          visualStyle: options.visualStyle || storyBible.visualStyle || 'standard'
        });
        
        
        return { 
          propsList: propsDesign,
          enhancedContent: true, 
          metadata: {
            engineUsed: 'VisualDesignEngineV2',
            designApproach: options.designApproach || 'authentic_world_building',
            enhancementLevel: options.enhancementLevel || 'STANDARD'
          }
        };
        
      } catch (error) {
        console.warn(`Enhanced props design failed for episode ${episode.episodeNumber}, using fallback:`, error);
        throw error; // Let it fall back to standard generation
      }
    }, `Enhanced Props Episode ${episode.episodeNumber}`);

    // 🎨 GENERATE AI REFERENCE IMAGES FOR KEY PROPS if enabled
    let propImages: Record<string, string> = {};
    if (options.generateImages && props?.propsList) {
      try {
        console.log(`🎨 Generating AI reference images for props in episode ${episode.episodeNumber}...`);
        const { AIImageGenerator } = await import('./ai-image-generator');
        
        // Extract hero props from the props list (simplified approach)
        // Look for items marked as "hero" or "key" or extract first few items
        const propMatches = props.propsList.match(/(?:^|\n)[-•]\s*([^:\n]+):/gm) || [];
        const keyProps = propMatches.slice(0, 8).map((m: string) => m.replace(/[-•\n]/g, '').replace(':', '').trim());
        
        for (let k = 0; k < Math.min(keyProps.length, 5); k++) {
          const propName = keyProps[k];
          
          const imageUrl = await AIImageGenerator.generatePropReference(
            propName,
            { quality: options.imageQuality || 'standard' }
          );
          
          propImages[propName] = imageUrl;
          console.log(`   ✓ Generated prop image ${k + 1}/${Math.min(keyProps.length, 5)}: ${propName.substring(0, 40)}...`);
        }
        
        console.log(`✅ Generated ${Object.keys(propImages).length} AI prop reference images for episode ${episode.episodeNumber}`);
      } catch (error) {
        console.warn(`Failed to generate prop images for episode ${episode.episodeNumber}:`, error);
        // Continue without images - not a fatal error
      }
    }

    episodes.push({
      episodeNumber: episode.episodeNumber,
      episodeTitle: episode.episodeTitle || episode.title,
      props: props?.propsList || props?.enhancedContent || "Props generation failed",
      // NEW: Design metadata for production planning
      propsMetadata: props?.metadata || null,
      // NEW: AI-generated prop reference images
      propImages: Object.keys(propImages).length > 0 ? propImages : undefined
    });
  }
  
  await updateProgress('Props', 'Enhanced props generated for all episodes', 100, 4);
  return {
    episodes,
    format: 'production-props-enhanced',
    engineEnhanced: true
  };
}

// Helper function for enhanced props design
async function generateEnhancedPropsDesign(episode: any, narrativeEpisode: any, storyboardEpisode: any, context: any): Promise<string> {
  // Extract scenes for analysis
  const scenes = narrativeEpisode?.scenes || [];
  const storyboardScenes = storyboardEpisode?.scenes || [];
  const sceneCount = scenes.length
  
  // Create enhanced prompt for props design
  const enhancedPrompt = `Extract ONLY the props and wardrobe explicitly mentioned or clearly implied in these ${sceneCount} scenes. This is a 5-minute episode - be realistic.

EPISODE NARRATIVE (${sceneCount} scenes):
${scenes.map((s: any, idx: number) => `Scene ${idx + 1}: ${s.content}`).join('\n\n')}

VISUAL STORYBOARD:
${storyboardScenes.map((s: any, idx: number) => `Scene ${idx + 1}: ${s.storyboard?.substring(0, 300)}...`).join('\n\n')}

STORY CONTEXT:
Series: ${context.storyBible?.seriesTitle}
Genre: ${context.storyBible?.genre}
Episode: ${context.episodeNumber} - ${context.episodeTitle}
Design Approach: ${context.designApproach}
Visual Style: ${context.visualStyle}

STRICT DESIGN REQUIREMENTS:
1. SCENE-BY-SCENE BREAKDOWN (${sceneCount} scenes):
   - Extract ONLY props that characters interact with or are visible (expect 10-15 items total for ${sceneCount} scenes)
   - Include character-specific props and personal items ONLY if mentioned
   - DO NOT invent set decoration not mentioned in scenes
   - Highlight special/hero props that are plot-critical

2. CHARACTER WARDROBE:
   - Costume breakdown ONLY for characters who appear in these scenes
   - Include accessories, makeup, styling notes ONLY if relevant to scenes
   - Note any costume changes or continuity requirements
   - Provide character-appropriate design elements

3. PRODUCTION CONSIDERATIONS:
   - Sourcing suggestions (buy/rent/make)
   - Budget optimization recommendations
   - Special requirements or technical needs
   - Backup options for complex items

4. WORLD-BUILDING ELEMENTS:
   - Period-appropriate items (if applicable) based on what's in scenes
   - Cultural authenticity considerations
   - World consistency with established universe
   - Visual storytelling through design elements

This is ${sceneCount} scenes in a 5-minute episode. Format as a professional production design breakdown organized by scene, with clear categories for Props, Costumes, Set Decoration, and Special Items. Keep it focused and concise.`;

  // Generate enhanced content
  const result = await generateContent(enhancedPrompt, {
    systemPrompt: 'You are a professional production designer and props master with extensive film and television experience. Create detailed, practical production design breakdowns that are immediately actionable for production teams.',
    temperature: 0.4,
    maxTokens: 3000
  });
  
  return result;
}

// Interface for locations enhancement options based on user's design
export interface LocationsEnhancementOptions {
  useEngines?: boolean
  engineLevel?: 'basic' | 'professional' | 'master'
  scoutingApproach?: 'narrative_driven' | 'technical_optimized' | 'visual_storytelling' | 'practical_logistics'
  enhancementLevel?: 'STANDARD' | 'ENHANCED' | 'PREMIUM'
  narrativeIntegration?: boolean
  technicalConsiderations?: boolean
  logisticsOptimization?: boolean
  budgetConstraints?: boolean
  visualRequirements?: string[]
  generateImages?: boolean // NEW: Enable AI image generation for locations
  imageQuality?: 'standard' | 'hd'
}

// STEP 5: Generate Locations Per Episode (Based on Narrative & Storyboard)
export async function generateV2Locations(context: any, narrative: any, storyboard: any, updateProgress: (stepName: string, detail: string, stepProgress: number, stepIndex: number) => Promise<void>, options: LocationsEnhancementOptions = {}) {
  const { storyBible, actualEpisodes, useEnhancedProductionDesign = false } = context;
  
  // Check if enhanced locations generation is enabled
  if ((useEnhancedProductionDesign || options.useEngines) && context.useEngines) {
    console.log('🏐 LOCATIONS ENGINES ENABLED: Using enhanced location scouting...');
    return await generateV2LocationsWithEngines(context, narrative, storyboard, updateProgress, options);
  }
  
  console.log('📍 Using standard locations generation (no engines)');
  return await generateV2LocationsOriginal(context, narrative, storyboard, updateProgress);
}

// Original locations generation function preserved as fallback
async function generateV2LocationsOriginal(context: any, narrative: any, storyboard: any, updateProgress: (stepName: string, detail: string, stepProgress: number, stepIndex: number) => Promise<void>) {
  const { storyBible, actualEpisodes } = context;
  
  // Safety checks
  if (!actualEpisodes || !Array.isArray(actualEpisodes) || actualEpisodes.length === 0) {
    console.error('❌ No actualEpisodes provided to generateV2LocationsOriginal');
    return { episodes: [], format: 'location-guide' };
  }
  
  const episodes = [];

  await updateProgress('Locations', 'Starting location scouting (standard)...', 0, 5);

  for (let i = 0; i < actualEpisodes.length; i++) {
    const episode = actualEpisodes[i];
    const narrativeEpisode = narrative.episodes.find((ep: any) => ep.episodeNumber === episode.episodeNumber);
    const storyboardEpisode = storyboard.episodes.find((ep: any) => ep.episodeNumber === episode.episodeNumber);
    
    await updateProgress('Locations', `Episode ${episode.episodeNumber}/${actualEpisodes.length}`, 
      Math.round(((i + 1) / actualEpisodes.length) * 100), 5);

    const locations = await retryWithFallback(async () => {
      const sceneCount = narrativeEpisode?.scenes?.length || 0
      const prompt = `Identify ONLY the filming locations explicitly stated in these ${sceneCount} scenes. This is a 5-minute episode.

EPISODE NARRATIVE (${sceneCount} scenes):
${narrativeEpisode?.scenes?.map((s: any, idx: number) => `Scene ${idx + 1}: ${s.content}`).join('\n\n') || 'No narrative available'}

STORYBOARD INFO:
${storyboardEpisode?.scenes?.map((s: any, idx: number) => `Scene ${idx + 1}: ${s.storyboard?.substring(0, 200)}...`).join('\n\n') || 'No storyboard available'}

STORY CONTEXT:
Series: ${storyBible.seriesTitle}
Genre: ${storyBible.genre}
Episode: ${episode.episodeNumber} - ${episode.episodeTitle || episode.title}

STRICT REQUIREMENTS:
- Extract ONLY locations explicitly mentioned in the ${sceneCount} scenes (expect 1-3 locations max)
- DO NOT invent locations not in the scene descriptions
- For each location: type, characteristics, lighting needs, sound considerations
- Include backup location options for the actual locations mentioned
- Note permits and permissions needed
- Suggest optimal filming times/conditions
- Include estimated time needed per location
- This is ${sceneCount} scenes in a 5-minute episode - keep concise

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

// NEW: Enhanced locations generation with engines
export async function generateV2LocationsWithEngines(
  context: any,
  narrative: any,
  storyboard: any,
  updateProgress: (stepName: string, detail: string, stepProgress: number, stepIndex: number) => Promise<void>,
  options: LocationsEnhancementOptions = {}
) {
  const { storyBible, actualEpisodes } = context;
  
  // Safety checks
  if (!actualEpisodes || !Array.isArray(actualEpisodes) || actualEpisodes.length === 0) {
    console.error('❌ No actualEpisodes provided to generateV2LocationsWithEngines');
    return { episodes: [], format: 'location-guide' };
  }
  
  const episodes = [];

  await updateProgress('Locations', 'Starting enhanced location scouting...', 0, 5);

  for (let i = 0; i < actualEpisodes.length; i++) {
    const episode = actualEpisodes[i];
    const narrativeEpisode = narrative.episodes.find((ep: any) => ep.episodeNumber === episode.episodeNumber);
    const storyboardEpisode = storyboard.episodes.find((ep: any) => ep.episodeNumber === episode.episodeNumber);
    
    await updateProgress('Locations', `Episode ${episode.episodeNumber}/${actualEpisodes.length} with enhanced scouting`, 
      Math.round(((i + 1) / actualEpisodes.length) * 100), 5);

    // ENHANCED: Use engine-powered location scouting with fallback
    const locations = await retryWithFallback(async () => {
      try {
        console.log(`🏐 LOCATIONS ENGINE: Scouting locations for episode ${episode.episodeNumber} with ${options.scoutingApproach || 'narrative_driven'} approach...`);
        
        // Import and use LocationEngineV2
        const { LocationEngineV2 } = await import('./location-engine-v2');
        
        // Generate enhanced location scouting
        const locationGuide = await generateEnhancedLocationScouting(episode, narrativeEpisode, storyboardEpisode, {
          storyBible,
          episodeNumber: episode.episodeNumber,
          episodeTitle: episode.episodeTitle || episode.title,
          enhancementLevel: options.enhancementLevel || 'STANDARD',
          scoutingApproach: options.scoutingApproach || 'narrative_driven',
          narrativeIntegration: options.narrativeIntegration !== false,
          technicalConsiderations: options.technicalConsiderations !== false,
          logisticsOptimization: options.logisticsOptimization !== false,
          budgetConstraints: options.budgetConstraints !== false,
          visualRequirements: options.visualRequirements || []
        });
        
        
        return { 
          locationGuide: locationGuide,
          enhancedContent: true, 
          metadata: {
            engineUsed: 'LocationEngineV2',
            scoutingApproach: options.scoutingApproach || 'narrative_driven',
            enhancementLevel: options.enhancementLevel || 'STANDARD'
          }
        };
        
      } catch (error) {
        console.warn(`Enhanced location scouting failed for episode ${episode.episodeNumber}, using fallback:`, error);
        throw error; // Let it fall back to standard generation
      }
    }, `Enhanced Locations Episode ${episode.episodeNumber}`);

    episodes.push({
      episodeNumber: episode.episodeNumber,
      episodeTitle: episode.episodeTitle || episode.title,
      locations: locations?.locationGuide || locations?.enhancedContent || "Location generation failed",
      // NEW: Scouting metadata for production planning
      locationsMetadata: locations?.metadata || null
    });
  }
  
  await updateProgress('Locations', 'Enhanced location guides generated', 100, 5);
  return {
    episodes,
    format: 'location-guide-enhanced',
    engineEnhanced: true
  };
}

// Helper function for enhanced location scouting
async function generateEnhancedLocationScouting(episode: any, narrativeEpisode: any, storyboardEpisode: any, context: any): Promise<string> {
  // Extract scenes for analysis
  const scenes = narrativeEpisode?.scenes || [];
  const storyboardScenes = storyboardEpisode?.scenes || [];
  const sceneCount = scenes.length
  
  // Create enhanced prompt for location scouting
  const enhancedPrompt = `Identify ONLY the filming locations explicitly stated in these ${sceneCount} scenes. This is a 5-minute episode.

EPISODE NARRATIVE (${sceneCount} scenes):
${scenes.map((s: any, idx: number) => `Scene ${idx + 1}: ${s.content}`).join('\n\n')}

VISUAL STORYBOARD:
${storyboardScenes.map((s: any, idx: number) => `Scene ${idx + 1}: ${s.storyboard?.substring(0, 300)}...`).join('\n\n')}

STORY CONTEXT:
Series: ${context.storyBible?.seriesTitle}
Genre: ${context.storyBible?.genre}
Episode: ${context.episodeNumber} - ${context.episodeTitle}
Scouting Approach: ${context.scoutingApproach}

STRICT LOCATION REQUIREMENTS:
1. SCENE-BY-SCENE BREAKDOWN (${sceneCount} scenes):
   - Extract ONLY locations explicitly mentioned in the scenes (expect 1-3 locations max)
   - DO NOT invent locations not in the scene descriptions
   - Specific location type needed for each scene
   - Atmosphere and mood requirements
   - Physical space needs for action and blocking
   - Character interaction requirements

2. TECHNICAL CONSIDERATIONS:
   - Lighting conditions and natural light needs
   - Sound considerations (acoustics, ambient noise)
   - Camera movement and positioning space
   - Equipment access and setup requirements

3. LOGISTICS & PLANNING:
   - Permits and permissions needed
   - Public vs private location access
   - Backup location alternatives
   - Travel and transportation logistics

4. PRODUCTION EFFICIENCY:
   - Location grouping suggestions for schedule optimization
   - Multiple scene usage recommendations
   - Budget considerations and cost estimates
   - Time efficiency recommendations

5. NARRATIVE INTEGRATION:
   - How locations support story and character arcs
   - Visual storytelling through environment
   - Symbolic or thematic location elements
   - World consistency considerations

This is ${sceneCount} scenes in a 5-minute episode - keep concise

Format as a professional location scouting guide organized by scene, with detailed specifications and practical recommendations for production.`;

  // Generate enhanced content
  const result = await generateContent(enhancedPrompt, {
    systemPrompt: 'You are a professional location scout and production manager with extensive film and television experience. Create detailed, practical location guides that are immediately actionable for production teams.',
    temperature: 0.4,
    maxTokens: 3000
  });
  
  return result;
}

// Interface for casting enhancement options based on user's design
export interface CastingEnhancementOptions {
  useEngines?: boolean
  engineLevel?: 'basic' | 'professional' | 'master'
  castingApproach?: 'method_based' | 'chemistry_focused' | 'commercial_optimized' | 'artistic_integrity'
  performanceMethodology?: 'stanislavski' | 'meisner' | 'method' | 'practical' | 'hybrid'
  enhancementLevel?: 'STANDARD' | 'ENHANCED' | 'PREMIUM'
  diversityOptimization?: boolean
  commercialConsideration?: boolean
  representationGoals?: string[]
  ensembleOptimization?: boolean
  riskAssessment?: boolean
  includeActorReferences?: boolean // NEW: Add real-world actor references for inspiration
  referencesPerCharacter?: number // How many actor references per character (2-3 recommended)
}

// STEP 6: Generate Casting Per Arc (Based on Narrative & Story Bible)
export async function generateV2Casting(context: any, narrative: any, updateProgress: (stepName: string, detail: string, stepProgress: number, stepIndex: number) => Promise<void>, options: CastingEnhancementOptions = {}) {
  const { storyBible, actualEpisodes, useEnhancedCasting = false } = context;
  
  // Check if enhanced casting generation is enabled
  if ((useEnhancedCasting || options.useEngines) && context.useEngines) {
    return await generateV2CastingWithEngines(context, narrative, updateProgress, options);
  }
  
  console.log('👥 Using standard casting generation (no engines)');
  return await generateV2CastingOriginal(context, narrative, updateProgress);
}

// Original casting generation function preserved as fallback
async function generateV2CastingOriginal(context: any, narrative: any, updateProgress: (stepName: string, detail: string, stepProgress: number, stepIndex: number) => Promise<void>) {
  const { storyBible, actualEpisodes } = context;
  
  // Safety checks
  if (!actualEpisodes || !Array.isArray(actualEpisodes) || actualEpisodes.length === 0) {
    console.error('❌ No actualEpisodes provided to generateV2CastingOriginal');
    return { castingBreakdown: 'No episodes available for casting analysis', format: 'casting-guide' };
  }

  await updateProgress('Casting', 'Analyzing characters across arc (standard)...', 50, 6);

  const casting = await retryWithFallback(async () => {
    const allScenes = narrative.episodes.flatMap((ep: any) => 
      ep.scenes?.map((scene: any, idx: number) => `Episode ${ep.episodeNumber}, Scene ${idx + 1}: ${scene.content}`) || []
    ).join('\n\n');

    const prompt = `Create a casting guide for ONLY the characters who appear in these ${actualEpisodes.length} episode(s). This is a 5-minute episode format.

ARC NARRATIVE (${actualEpisodes.length} Episode(s)):
${allScenes}

STORY CONTEXT:
Series: ${storyBible.seriesTitle}
Genre: ${storyBible.genre}
Story Bible: ${JSON.stringify(storyBible, null, 2)}
Episodes in Arc: ${actualEpisodes.length}

STRICT REQUIREMENTS:
- Identify ONLY characters who speak or are clearly visible in these specific episodes (expect 2-4 characters for a 5-minute episode)
- DO NOT include characters from the story bible who don't appear in these episodes
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

// NEW: Enhanced casting generation with engines
export async function generateV2CastingWithEngines(
  context: any,
  narrative: any,
  updateProgress: (stepName: string, detail: string, stepProgress: number, stepIndex: number) => Promise<void>,
  options: CastingEnhancementOptions = {}
) {
  const { storyBible, actualEpisodes } = context;
  
  // Safety checks
  if (!actualEpisodes || !Array.isArray(actualEpisodes) || actualEpisodes.length === 0) {
    console.error('❌ No actualEpisodes provided to generateV2CastingWithEngines');
    return { castingBreakdown: 'No episodes available for casting analysis', format: 'casting-guide' };
  }

  await updateProgress('Casting', 'Analyzing characters with professional engines...', 25, 6);

  // ENHANCED: Use engine-powered casting analysis with fallback
  const casting = await retryWithFallback(async () => {
    try {
      
      // Import and use CastingEngineV2
      const { CastingEngineV2 } = await import('./casting-engine-v2');
      
      // Extract all scenes content for analysis
      const allScenes = narrative.episodes.flatMap((ep: any) => 
        ep.scenes?.map((scene: any, idx: number) => ({
          episode: ep.episodeNumber,
          scene: idx + 1,
          content: scene.content
        })) || []
      );
      
      // Create mock character profiles for analysis
      const characterProfiles = await extractCharactersFromNarrative(allScenes, storyBible);
      
      // Create mock candidate pool for demonstration
      const candidatePool = generateMockCandidatePool();
      
      // Generate casting recommendations using CastingEngineV2
      const castingRecommendations = await CastingEngineV2.generateCastingRecommendation(
        {
          projectType: 'television',
          genre: storyBible.genre || 'drama',
          budget: 1000000, // Mock budget
          targetAudience: storyBible.targetAudience || 'general',
          distributionStrategy: 'streaming',
          awardsStrategy: false,
          timeline: 'standard'
        },
        {
          characters: characterProfiles,
          ensembleNeeds: {
            systemBalance: {
              headTypes: 2,
              heartTypes: 2,
              gutTypes: 2
            },
            archetypeDistribution: {
              protagonist: true,
              antagonist: true,
              mentor: true,
              ally: true,
              threshold: false,
              shapeshifter: false,
              trickster: false
            },
            dynamicPotential: {
              conflictGeneration: 8,
              supportSystem: 7,
              comedicPotential: 6,
              dramaticTension: 8
            }
          },
          representationGoals: options.representationGoals || ['diverse', 'authentic', 'inclusive'],
          commercialTargets: {
            audience: 'broad'
          },
          constraints: {
            budget: 1000000,
            schedule: 'standard',
            specialRequirements: []
          }
        },
        candidatePool
      );
      
      // Format the enhanced casting breakdown
      const enhancedBreakdown = formatEnhancedCastingBreakdown(castingRecommendations, storyBible);
      
      
      return { 
        castingBreakdown: enhancedBreakdown,
        enhancedContent: true, 
        metadata: {
          engineUsed: 'CastingEngineV2',
          characterCount: characterProfiles.length,
          castingApproach: options.castingApproach || 'artistic_integrity',
          performanceMethodology: options.performanceMethodology || 'practical',
          enhancementLevel: options.enhancementLevel || 'STANDARD'
        }
      };
      
    } catch (error) {
      console.warn(`Enhanced casting generation failed, using fallback:`, error);
      throw error; // Let it fall back to standard generation
    }
  }, `Enhanced Casting Analysis`);

  await updateProgress('Casting', 'Professional casting guide generated', 100, 6);
  
  // Parse enhanced casting into structured format
  const castingContent = casting?.castingBreakdown || "Casting generation failed";
  // Parse the casting content into structured format
  const characters = parseEnhancedCastingData(castingContent, casting?.metadata);
  
  return {
    characters,
    arcIndex: context.arcIndex || 0,
    format: 'casting-guide-enhanced',
    generatedAt: new Date().toISOString(),
    // NEW: Enhanced metadata for professional insights
    castingMetadata: casting?.metadata || null,
    engineEnhanced: true
  };
}

// Helper functions for enhanced casting
async function extractCharactersFromNarrative(scenes: any[], storyBible: any): Promise<any[]> {
  // This would be a more sophisticated character extraction in production
  // For now, we'll create mock character profiles
  const characterNames = new Set<string>();
  
  // Extract character names from scenes
  scenes.forEach(scene => {
    const content = scene.content;
    // Simple regex to find potential character names (capitalized words)
    const potentialNames = content.match(/\b[A-Z][a-z]+\b/g) || [];
    if (potentialNames) {
      for (const name of potentialNames) {
        if (typeof name === 'string') {
          characterNames.add(name);
        }
      }
    }
  });
  
  // Create character profiles
  const namesArray = Array.from(characterNames);
  return namesArray.map((name: string, index: number) => ({
    id: `char-${index}`,
    name: name,
    narrative: {
      importance: index < 2 ? 'Lead' : index < 5 ? 'Supporting' : 'Featured' as 'Lead' | 'Supporting' | 'Featured' | 'Ensemble',
      arcType: 'Character Development',
      objectives: ['Overcome obstacle', 'Achieve goal'],
      superObjective: 'Find happiness',
      emotionalArc: 'Growth through adversity'
    },
    psychological: {
      mbtiType: 'INFJ',
      enneagramType: 4,
      coreFear: 'Rejection',
      basicDesire: 'Connection',
      motivations: ['Love', 'Purpose']
    },
    physical: {
      ageRange: [25, 35],
      physicalDemands: ['Expressive face'],
      transformationRequired: false,
      periodicAccuracy: true
    },
    vocal: {
      dialectRequired: 'Standard',
      vocalDemands: ['Clear articulation'],
      emotionalRange: ['Joy', 'Sorrow']
    },
    relationships: {
      keyDynamics: {},
      chemistryRequirements: ['Natural rapport'],
      ensembleRole: 'Emotional center'
    }
  }));
}

function generateMockCandidatePool(): any[] {
  // Generate a mock pool of actor candidates
  return Array(20).fill(null).map((_, index) => ({
    id: `actor-${index}`,
    name: `Actor ${index + 1}`,
    basicInfo: {
      age: 30 + index % 15,
      gender: index % 2 === 0 ? 'Male' : 'Female',
      ethnicity: 'Diverse',
      location: 'Los Angeles'
    },
    training: {
      institution: 'RADA',
      specificStudio: 'Meisner',
      strengths: {
        technicalControl: 8,
        physicalExpressiveness: 7,
        vocalPower: 8,
        ensembleWork: 9,
        versatility: 7,
        filmExperience: 8
      },
      suitability: {
        classicalTheatre: 7,
        periodDrama: 8,
        physicalTransformation: 6,
        contemporaryDrama: 9,
        comedy: 7,
        action: 6
      }
    },
    personality: {
      mbti: {
        type: 'INFJ',
        dominantFunction: 'Ni',
        auxiliaryFunction: 'Fe',
        naturalRange: ['INFJ', 'INFP', 'ENFJ']
      },
      enneagram: {
        coreType: 4,
        wing: '4w5',
        coreFear: 'Being insignificant',
        basicDesire: 'To find identity',
        motivation: 'To express uniqueness',
        integrationDirection: 1,
        disintegrationDirection: 2
      },
      actingRange: {
        naturalTypes: ['INFJ', 'INFP'],
        stretchTypes: ['ENTJ', 'ESTP'],
        impossibleTypes: ['ESTJ']
      }
    },
    methodology: {
      technique: 'Moderate',
      immersionLevel: 7,
      staysInCharacter: false,
      emotionalMemoryUse: true,
      riskFactors: {
        psychologicalRisk: 3,
        productionDisruption: 2,
        interpersonalChallenges: 3,
        recoveryChallenges: 2
      },
      supportRequired: {
        psychologicalSupport: false,
        intimacyCoordinator: false,
        specializedDirection: false,
        extendedRecovery: false
      }
    },
    starPower: {
      bankability: {
        ulmerScore: 50 + index,
        qScore: {
          familiarity: 60,
          appeal: 70,
          ratio: 1.17
        },
        boxOfficeROI: 2.5,
        prealesValue: 1000000
      },
      socialMedia: {
        totalFollowers: 1000000,
        engagementRate: 0.05,
        audienceDemographics: {
          age: { '18-24': 30, '25-34': 40, '35-44': 20, '45+': 10 },
          gender: { 'male': 45, 'female': 55 },
          geography: { 'US': 60, 'International': 40 }
        },
        platformStrength: {
          instagram: 8,
          tiktok: 7,
          twitter: 6,
          youtube: 5
        }
      },
      international: {
        globalAppeal: 7,
        territoryStrength: { 'US': 8, 'Europe': 7, 'Asia': 6 },
        diasporaConnections: ['Global']
      }
    },
    diversity: {
      demographics: {
        racialEthnic: 'Diverse',
        gender: index % 2 === 0 ? 'Male' : 'Female',
        lgbtqPlus: false,
        disability: false,
        age: 30 + index % 15,
        socioeconomic: 'Middle class'
      },
      representation: {
        authenticity: 8,
        culturalConsultation: true,
        avoidsTropes: true,
        dimensionalPortrayal: true
      },
      industryImpact: {
        ampasEligibility: true,
        diversityUplift: 10,
        representationGap: []
      }
    },
    riskProfile: {
      reputationalRisk: {
        socialMediaHistory: 2,
        publicControversies: [],
        cancelCultureRisk: 2,
        brandSafetyScore: 9
      },
      productionRisk: {
        reliability: 9,
        professionalism: 9,
        healthFactors: 9,
        insurability: 9
      },
      specialRequirements: {
        intimacyCoordination: false,
        psychologicalSupport: false,
        physicalSafety: false,
        unionCompliance: true
      },
      mitigationStrategies: {
        mediaTraining: true,
        behaviorClauses: true,
        insuranceCoverage: true,
        supportSystems: true
      }
    },
    performanceMetrics: {
      stanislavski: {
        magicIf: {
          specificityLevel: 8,
          logicalChoices: true,
          objectiveDriven: true
        },
        givenCircumstances: {
          textualSupport: 8,
          periodAccuracy: true,
          relationshipAwareness: true
        },
        objectives: {
          sceneObjectiveClarity: 9,
          superObjectiveAlignment: true,
          emotionalTruth: 8
        }
      },
      meisner: {
        listeningCapability: {
          activeListening: 9,
          spontaneousResponse: true,
          momentToMoment: true
        },
        authenticity: {
          livingTruthfully: 8,
          presentness: 9,
          instinctualResponse: true
        },
        connection: {
          chemistryPotential: 8,
          vulnerability: true,
          adaptability: 7
        }
      }
    }
  }));
}

function formatEnhancedCastingBreakdown(recommendations: any, storyBible: any): string {
  let breakdown = `ENHANCED CASTING BREAKDOWN - ${storyBible.seriesTitle}\n`;
  breakdown += `Genre: ${storyBible.genre}\n`;
  breakdown += `Casting Approach: Professional Performance Analysis\n\n`;
  
  // Group characters by importance
  const leadCharacters = recommendations.filter((rec: any) => 
    rec.characterAnalysis.narrative.importance === 'Lead'
  );
  
  const supportingCharacters = recommendations.filter((rec: any) => 
    rec.characterAnalysis.narrative.importance === 'Supporting'
  );
  
  const featuredCharacters = recommendations.filter((rec: any) => 
    rec.characterAnalysis.narrative.importance === 'Featured' || 
    rec.characterAnalysis.narrative.importance === 'Ensemble'
  );
  
  // Format lead characters
  if (leadCharacters.length > 0) {
    breakdown += `=== LEAD CHARACTERS ===\n\n`;
    leadCharacters.forEach((rec: any) => {
      breakdown += formatCharacterRecommendation(rec);
    });
  }
  
  // Format supporting characters
  if (supportingCharacters.length > 0) {
    breakdown += `=== SUPPORTING CHARACTERS ===\n\n`;
    supportingCharacters.forEach((rec: any) => {
      breakdown += formatCharacterRecommendation(rec);
    });
  }
  
  // Format featured characters
  if (featuredCharacters.length > 0) {
    breakdown += `=== FEATURED CHARACTERS ===\n\n`;
    featuredCharacters.forEach((rec: any) => {
      breakdown += formatCharacterRecommendation(rec);
    });
  }
  
  // Add ensemble considerations
  breakdown += `\n=== ENSEMBLE CONSIDERATIONS ===\n\n`;
  breakdown += `Chemistry Requirements: Ensure natural rapport between lead characters\n`;
  breakdown += `Performance Methodology: Practical approach recommended for television pacing\n`;
  breakdown += `Diversity Optimization: Authentic representation across all character roles\n`;
  
  return breakdown;
}

function formatCharacterRecommendation(recommendation: any): string {
  const character = recommendation.characterAnalysis;
  let output = `CHARACTER: ${character.name.toUpperCase()}\n`;
  
  output += `Role: ${character.narrative.importance}\n`;
  output += `Psychological Profile: ${character.psychological.mbtiType} (Enneagram ${character.psychological.enneagramType})\n`;
  
  if (character.physical.ageRange) {
    output += `Age Range: ${character.physical.ageRange[0]}-${character.physical.ageRange[1]}\n`;
  }
  
  if (character.physical.physicalDemands && character.physical.physicalDemands.length > 0) {
    output += `Physical Requirements: ${character.physical.physicalDemands.join(', ')}\n`;
  }
  
  if (character.vocal.emotionalRange && character.vocal.emotionalRange.length > 0) {
    output += `Emotional Range: ${character.vocal.emotionalRange.join(', ')}\n`;
  }
  
  output += `Character Arc: ${character.narrative.emotionalArc}\n`;
  
  // Add performance guidance
  output += `Performance Notes: ${character.psychological.motivations.join(', ')}\n`;
  
  // Add top casting recommendation
  if (recommendation.topCandidates && recommendation.topCandidates.length > 0) {
    const topCandidate = recommendation.topCandidates[0];
    output += `Casting Recommendation: ${topCandidate.recommendationLevel} match\n`;
    
    if (topCandidate.strengths && topCandidate.strengths.length > 0) {
      output += `Strengths: ${topCandidate.strengths.join(', ')}\n`;
    }
    
    if (topCandidate.concerns && topCandidate.concerns.length > 0) {
      output += `Considerations: ${topCandidate.concerns.join(', ')}\n`;
    }
  }
  
  output += `\n`;
  return output;
}

function parseEnhancedCastingData(castingContent: string, metadata?: any): any[] {
  const characters = [];
  
  try {
    // Extract character sections from the enhanced casting breakdown
    const sections = castingContent.split('CHARACTER:');
    
    // Skip the first section (header)
    for (let i = 1; i < sections.length; i++) {
      const section = sections[i].trim();
      const lines = section.split('\n');
      
      // First line contains the character name
      const name = lines[0].trim();
      
      // Combine the rest of the lines as the description
      const description = `CHARACTER: ${name}\n${lines.slice(1).join('\n')}`;
      
      characters.push({
        name,
        description
      });
    }
    
    // If parsing failed, create a fallback structure
    if (characters.length === 0) {
      characters.push({
        name: 'Enhanced Character Analysis',
        description: castingContent
      });
    }
    
  } catch (e) {
    console.error('Error parsing enhanced casting data:', e);
    characters.push({
      name: 'Enhanced Casting Information',
      description: castingContent
    });
  }
  
  return characters;
}

// Import marketing engine integration
import { MarketingEnhancementOptions, generateV2MarketingWithEngines } from './marketing-engine-integration';

// STEP 7: Generate Marketing Per Episode (Based on Narrative)
export async function generateV2Marketing(context: any, narrative: any, updateProgress: (stepName: string, detail: string, stepProgress: number, stepIndex: number) => Promise<void>, options: MarketingEnhancementOptions = {}) {
  const { storyBible, actualEpisodes, useEnhancedDistribution = false } = context;
  
  // Check if enhanced marketing generation is enabled
  if ((useEnhancedDistribution || options.useEngines) && context.useEngines) {
    console.log('📢 MARKETING ENGINES ENABLED: Using enhanced marketing strategy...');
    return await generateV2MarketingWithEngines(context, narrative, updateProgress, options);
  }
  
  console.log('📰 Using standard marketing generation (no engines)');
  
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

// Import post-production engine integration
import { PostProductionEnhancementOptions, generateV2PostProductionWithEngines } from './postproduction-engine-integration';

// STEP 8: Generate Post-Production Per Scene (Based on Storyboard)
export async function generateV2PostProduction(context: any, storyboard: any, updateProgress: (stepName: string, detail: string, stepProgress: number, stepIndex: number) => Promise<void>, options: PostProductionEnhancementOptions = {}) {
  const { storyBible, actualEpisodes, useEnhancedDistribution = false } = context;
  
  // Check if enhanced post-production generation is enabled
  if ((useEnhancedDistribution || options.useEngines) && context.useEngines) {
    return await generateV2PostProductionWithEngines(context, storyboard, updateProgress, options);
  }
  
  
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
