/**
 * Engines Lite - Minimal, Reliable Engine Enhancements for Episode Generation
 * 
 * Provides targeted enhancements without changing episode structure or scene count.
 * All outputs are used as reference for final GPT-4.1 synthesis.
 */

import { AIOrchestrator } from './ai-orchestrator'

export interface EngineNotes {
  dialogue: string
  tension: string
  choices: string
}

export interface EngineSet {
  dialogue?: boolean
  tension?: boolean
  choices?: boolean
}

/**
 * Run minimal engine enhancements for episode generation
 * Returns short, delimited text blocks for final synthesis
 */
export async function runEnginesLite(
  episodeJson: any, 
  storyBible: any, 
  mode: 'beast' | 'stable' = 'beast',
  engineSet: (keyof EngineSet)[] = ['dialogue', 'tension', 'choices']
): Promise<EngineNotes> {
  const out: EngineNotes = { dialogue: 'N/A', tension: 'N/A', choices: 'N/A' };

  console.log('🚀 ENGINES LITE: Starting minimal enhancement pass...');

  // Extract concise episode context for engines
  const episodeContext = {
    title: episodeJson.title,
    synopsis: episodeJson.synopsis,
    sceneCount: episodeJson.scenes?.length || 1,
    characters: storyBible.mainCharacters?.slice(0, 4)?.map((c: any) => c.name) || [],
    genre: storyBible.genre || 'drama',
    premise: storyBible.premise?.premiseStatement || 'Character development through challenge'
  };

  // DIALOGUE ENGINE: Enhance character conversations
  if (engineSet.includes('dialogue')) {
    console.log('💬 ENGINE: Strategic Dialogue - Enhancing character conversations...');
    try {
      const dialogueTask = `Return 3-5 concise dialogue exchanges that could enhance the episode scenes. Format: "Character: Line — subtext/purpose". Do not change scene count. If unsure, return "N/A".`;
      
      const dialogueResult = await callEngine('StrategicDialogue', dialogueTask, episodeContext, 0.5, 600, mode);
      out.dialogue = ensureNonEmpty(dialogueResult);
      console.log(`✅ DIALOGUE ENGINE: Generated ${out.dialogue.length} characters`);
    } catch (error) {
      console.warn('⚠️ DIALOGUE ENGINE failed:', error);
      out.dialogue = 'N/A';
    }
  }

  // TENSION ENGINE: Sharpen dramatic beats
  if (engineSet.includes('tension')) {
    console.log('⚡ ENGINE: Tension Escalation - Sharpening dramatic beats...');
    try {
      const tensionTask = `Return 1-3 escalation notes per scene to improve dramatic momentum. Keep it brief. If none needed, return "N/A".`;
      
      const tensionResult = await callEngine('TensionEscalation', tensionTask, episodeContext, 0.4, 500, mode);
      out.tension = ensureNonEmpty(tensionResult);
      console.log(`✅ TENSION ENGINE: Generated ${out.tension.length} characters`);
    } catch (error) {
      console.warn('⚠️ TENSION ENGINE failed:', error);
      out.tension = 'N/A';
    }
  }

  // CHOICE ENGINE: Improve branching decisions
  if (engineSet.includes('choices')) {
    console.log('🎬 ENGINE: Choice Quality - Improving branching decisions...');
    try {
      const choiceTask = `Return 3 diegetic choices grounded in the final scene with one-line stakes. If unsure, return "N/A".`;
      
      const choiceResult = await callEngine('ChoiceQuality', choiceTask, episodeContext, 0.5, 400, mode);
      out.choices = ensureNonEmpty(choiceResult);
      console.log(`✅ CHOICE ENGINE: Generated ${out.choices.length} characters`);
    } catch (error) {
      console.warn('⚠️ CHOICE ENGINE failed:', error);
      out.choices = 'N/A';
    }
  }

  console.log('🎯 ENGINES LITE: Enhancement pass complete');
  return out;
}

/**
 * Call individual engine via AI Orchestrator
 */
async function callEngine(
  name: string, 
  task: string, 
  context: any, 
  temperature: number, 
  maxTokens: number,
  mode: 'beast' | 'stable'
): Promise<string> {
  try {
    const prompt = `TASK:\n${task}\n\nCONTEXT:\n${delimit('EPISODE', JSON.stringify(context))}`;
    
    const response = await AIOrchestrator.generateContent({
      prompt,
      systemPrompt: `${name} — return short bullet points or notes only. Be concise and actionable.`,
      temperature,
      maxTokens,
      mode
    }, name);

    return ensureNonEmpty(trimTo(response.content, maxTokens));
  } catch (error) {
    console.error(`❌ ${name} engine call failed:`, error);
    return 'N/A';
  }
}

/**
 * Utility functions
 */
function delimit(label: string, text: string): string {
  return `<<<${label}>>>\n${text}\n<<<END ${label}>>>`;
}

function ensureNonEmpty(s?: string): string {
  return (s && s.trim()) ? s.trim() : 'N/A';
}

function trimTo(s: string, maxChars: number): string {
  return s.length > maxChars ? s.slice(0, maxChars) + '...' : s;
} 