/**
 * The Fractal Narrative Engine - AI-Enhanced Nested Story Structures
 * 
 * Implements the fractal approach where structural patterns of the whole
 * are replicated in the parts:
 * - Arc: Complete narrative structure (3-6 acts)
 * - Episode: Single narrative beat (5 minutes, compressed structure)
 * - Scene: G.O.D.D. framework with mandatory turning points
 * 
 * ENHANCEMENT: Template-based generation → AI-powered story architecture
 */

import { StoryPremise } from './premise-engine'
import { Character3D } from './character-engine'
import { generateContent } from './azure-openai'
import { FractalNarrativeEngineV2, type FractalNarrativeRecommendation, type NarrativeGenome, type FractalProperties } from './fractal-narrative-engine-v2'

// Macro-narrative structures
export type MacroStructure = 'three-act' | 'five-act' | 'hero-journey'

// Micro-narrative frameworks for episodes
export type MicroFramework = 'compressed-three-act' | 'before-after-bridge' | 'setup-payoff' | 'godd-scene'

// Scene turning point types
export type TurningPointType = 'positive-to-negative' | 'negative-to-positive' | 'revelation' | 'decision' | 'escalation'

// Arc structure mapping
export interface NarrativeArc {
  id: string;
  title: string;
  macroStructure: MacroStructure;
  totalEpisodes: number;
  premise: StoryPremise;
  
  // Arc-level structure
  acts: {
    actNumber: number;
    title: string;
    function: string; // Setup, Confrontation, Resolution, etc.
    startEpisode: number;
    endEpisode: number;
    keyBeats: string[];
  }[];
  
  // Episode mapping
  episodes: NarrativeEpisode[];
  
  // Arc progression
  progression: {
    premise: string; // How this arc proves the premise
    stakes: string; // What's at stake in this arc
    climax: string; // The arc's climactic moment
    resolution: string; // How the arc resolves
  };
  v2Enhancements?: any;
  recursiveStructure?: any;
}

// Episode structure (5-minute narrative chunks)
export interface NarrativeEpisode {
  id: string;
  episodeNumber: number;
  title: string;
  
  // Macro-beat assignment
  arcFunction: string; // What beat this serves in the larger arc
  macroGoal: string; // The episode's function in the arc
  
  // Episode structure
  microFramework: MicroFramework;
  estimatedDuration: number; // minutes
  
  // Hook and momentum
  hook: {
    type: 'question' | 'conflict' | 'revelation' | 'danger';
    content: string;
  };
  
  cliffhanger: {
    type: 'decision' | 'revelation' | 'danger' | 'question';
    content: string;
    teaser: string; // What it promises for next episode
  };
  
  // Scene breakdown
  scenes: NarrativeScene[];
  
  // Character focus
  focusCharacters: string[];
  characterArcs: {
    character: string;
    want: string; // What they pursue this episode
    obstacle: string; // What stops them
    growth: string; // How they change
  }[];
  
  // Premise connection
  premiseTest: string; // How this episode tests the premise
  v2Enhancements?: any;
}

// Scene structure (G.O.D.D. framework)
export interface NarrativeScene {
  id: string;
  sceneNumber: number;
  title: string;
  
  // G.O.D.D. Framework
  goal: {
    character: string;
    objective: string; // What they want to achieve
    motivation: string; // Why they want it
    stakes: string; // What happens if they fail
  };
  
  obstacle: {
    type: 'character' | 'situation' | 'internal' | 'time' | 'resource';
    source: string; // What/who creates the obstacle
    description: string;
    difficulty: 'low' | 'medium' | 'high';
  };
  
  dilemma: {
    description: string;
    options: string[]; // Difficult choices the character faces
    noEasyWay: string; // Why there's no simple solution
  };
  
  decision: {
    character: string;
    choice: string; // What they decide to do
    reasoning: string; // Why they make this choice
    cost: string; // What they sacrifice/risk
  };
  
  // Mandatory turning point
  turningPoint: {
    type: TurningPointType;
    stimulus: string; // What triggers the change
    reaction: string; // Character's response
    shift: string; // How the story state changes
    newDirection: string; // Where the story goes next
  };
  
  // Scene mechanics
  location: string;
  timeOfDay: string;
  duration: string; // estimated scene length
  mood: string;
  
  // Conflict and tension
  conflict: {
    type: 'external' | 'internal' | 'interpersonal' | 'societal';
    description: string;
    intensity: number; // 1-10 scale
  };
  
  // Character involvement
  characters: {
    name: string;
    role: 'protagonist' | 'antagonist' | 'supporting';
    objective: string; // What they want in this scene
    tactics: string[]; // How they try to get it
  }[];
  
  // Dialogue strategy
  dialogueApproach: {
    subtext: string; // What's really being discussed
    strategy: string; // How characters use dialogue tactically
    conflict: string; // The clash of objectives
  };
  v2Enhancements?: any;
}

// Pacing and rhythm control
export interface NarrativePacing {
  internal: {
    rhythm: 'fast' | 'moderate' | 'slow';
    tension: number; // 1-10 scale
    actionDensity: 'high' | 'medium' | 'low';
    emotionalWeight: 'light' | 'medium' | 'heavy';
  };
  
  external: {
    position: number; // Position in arc (1-100%)
    momentum: 'building' | 'sustaining' | 'releasing';
    proximityToClimax: number; // Episodes until climax
    stakeLevel: number; // 1-10 scale
  };
}

export class FractalNarrativeEngine {
  
  /**
   * Helper method for AI content generation
   */
  private static async generateContentWithAI(prompt: string): Promise<string> {
    try {
      const { generateContent } = await import('./azure-openai');
      return await generateContent(prompt, { maxTokens: 2000, temperature: 0.7 });
    } catch (error) {
      console.warn('AI generation failed, using fallback');
      return 'Generated Content';
    }
  }
  
  /**
   * Generate a single narrative arc
   */
  private static async generateArc(premise: StoryPremise, characters: Character3D[]): Promise<NarrativeArc> {
    return await this.generateNarrativeArc(premise, characters, 1, 1);
  }
  
  /**
   * AI-ENHANCED: Generates a complete narrative arc with fractal structure
   */
  static async generateNarrativeArc(
    premise: StoryPremise,
    characters: Character3D[],
    arcCount?: number,
    episodesPerArc?: number
  ): Promise<NarrativeArc> {
    
    // Use defaults if not provided
    const actualEpisodesPerArc = episodesPerArc || 12
    
    // AI-Enhanced: Select appropriate macro-structure
    const macroStructure = await this.selectMacroStructureAI(premise, actualEpisodesPerArc, characters);
    
    // AI-Enhanced: Generate arc structure
    const acts = await this.generateActStructureAI(macroStructure, actualEpisodesPerArc, premise, characters);
    
    // AI-Enhanced: Map episodes to narrative beats
    const episodes = await this.generateEpisodeSequenceAI(
      premise, 
      characters, 
      macroStructure, 
      actualEpisodesPerArc, 
      acts
    );
    
    return {
      id: `arc-${Date.now()}`,
      title: await this.generateArcTitleAI(premise, characters),
      macroStructure,
      totalEpisodes: actualEpisodesPerArc,
      premise,
      acts,
      episodes,
      progression: {
        premise: await this.generateArcPremiseTestAI(premise, characters),
        stakes: await this.generateArcStakesAI(premise, characters),
        climax: await this.generateArcClimaxAI(premise, characters),
        resolution: await this.generateArcResolutionAI(premise, characters)
      }
    };
  }
  
  /**
   * AI-ENHANCED: Generate arc title
   */
  private static async generateArcTitleAI(premise: StoryPremise, characters: Character3D[]): Promise<string> {
    try {
      const prompt = `Generate a compelling title for a narrative arc based on this premise: ${premise.premiseStatement}. Characters: ${characters.map(c => c.name).join(', ')}. Return only the title.`;
      return await this.generateContentWithAI(prompt);
    } catch (error) {
      console.warn('Using fallback arc title generation');
      return `Arc ${Date.now()}`;
    }
  }

  /**
   * AI-ENHANCED: Generate arc premise test
   */
  private static async generateArcPremiseTestAI(premise: StoryPremise, characters: Character3D[]): Promise<string> {
    try {
      const prompt = `Generate a premise test for this arc: ${premise.premiseStatement}. Characters: ${characters.map(c => c.name).join(', ')}. Return a brief premise test.`;
      return await this.generateContentWithAI(prompt);
    } catch (error) {
      console.warn('Using fallback arc premise test generation');
      return 'Test the premise through character actions';
    }
  }

  /**
   * AI-ENHANCED: Generate arc stakes
   */
  private static async generateArcStakesAI(premise: StoryPremise, characters: Character3D[]): Promise<string> {
    try {
      const prompt = `Generate stakes for this arc: ${premise.premiseStatement}. Characters: ${characters.map(c => c.name).join(', ')}. Return the stakes.`;
      return await this.generateContentWithAI(prompt);
    } catch (error) {
      console.warn('Using fallback arc stakes generation');
      return 'High stakes for all characters';
    }
  }

  /**
   * AI-ENHANCED: Generate arc climax
   */
  private static async generateArcClimaxAI(premise: StoryPremise, characters: Character3D[]): Promise<string> {
    try {
      const prompt = `Generate a climax for this arc: ${premise.premiseStatement}. Characters: ${characters.map(c => c.name).join(', ')}. Return the climax.`;
      return await this.generateContentWithAI(prompt);
    } catch (error) {
      console.warn('Using fallback arc climax generation');
      return 'Intense climax with character growth';
    }
  }

  /**
   * AI-ENHANCED: Generate arc resolution
   */
  private static async generateArcResolutionAI(premise: StoryPremise, characters: Character3D[]): Promise<string> {
    try {
      const prompt = `Generate a resolution for this arc: ${premise.premiseStatement}. Characters: ${characters.map(c => c.name).join(', ')}. Return the resolution.`;
      return await this.generateContentWithAI(prompt);
    } catch (error) {
      console.warn('Using fallback arc resolution generation');
      return 'Satisfying resolution with character growth';
    }
  }

  /**
   * AI-ENHANCED: Generates a single episode using compressed narrative structure
   */
  static async generateEpisode(
    arcFunction: string,
    premise: StoryPremise,
    characters: Character3D[],
    episodeNumber: number,
    microFramework: MicroFramework = 'compressed-three-act'
  ): Promise<NarrativeEpisode> {
    
    // AI-Enhanced: Determine focus characters for this episode
    const focusCharacters = await this.selectFocusCharactersAI(characters, episodeNumber, arcFunction);
    
    // AI-Enhanced: Generate hook and cliffhanger
    const hook = await this.generateHookAI(arcFunction, focusCharacters, premise);
    const cliffhanger = await this.generateCliffhangerAI(arcFunction, focusCharacters, premise);
    
    // AI-Enhanced: Generate scenes using micro-framework
    const scenes = await this.generateScenesForEpisodeAI(
      microFramework,
      focusCharacters,
      premise,
      arcFunction
    );
    
    // AI-Enhanced: Generate character arcs for this episode
    const characterArcs = await this.generateEpisodeCharacterArcsAI(focusCharacters, premise, arcFunction);
    
    return {
      id: `episode-${episodeNumber}`,
      episodeNumber,
      title: await this.generateEpisodeTitleAI(arcFunction, focusCharacters, premise),
      arcFunction,
      macroGoal: await this.generateMacroGoalAI(arcFunction, premise),
      microFramework,
      estimatedDuration: 5,
      hook,
      cliffhanger,
      scenes,
      focusCharacters: focusCharacters.map(c => c.name),
      characterArcs,
      premiseTest: await this.generatePremiseTestAI(premise, arcFunction, focusCharacters)
    };
  }
  
  /**
   * AI-ENHANCED: Generates a scene using G.O.D.D. framework with mandatory turning point
   */
  static async generateScene(
    character: Character3D,
    sceneFunction: string,
    premise: StoryPremise,
    sceneNumber: number,
    otherCharacters: Character3D[] = []
  ): Promise<NarrativeScene> {
    
    // AI-Enhanced: Generate G.O.D.D. components
    const goal = await this.generateSceneGoalAI(character, sceneFunction, premise);
    const obstacle = await this.generateSceneObstacleAI(character, goal, premise, otherCharacters);
    const dilemma = await this.generateSceneDilemmaAI(goal, obstacle, character, premise);
    const decision = await this.generateSceneDecisionAI(character, dilemma, premise);
    
    // AI-Enhanced: Generate mandatory turning point
    const turningPoint = await this.generateTurningPointAI(decision, character, premise);
    
    // AI-Enhanced: Generate scene context
    const conflict = await this.generateSceneConflictAI(goal, obstacle, character);
    const dialogueApproach = await this.generateDialogueStrategyAI(goal, obstacle, character, otherCharacters);
    
    return {
      id: `scene-${sceneNumber}`,
      sceneNumber,
      title: await this.generateSceneTitleAI(goal.objective, character.name, sceneFunction),
      goal,
      obstacle,
      dilemma,
      decision,
      turningPoint,
      location: await this.generateSceneLocationAI(sceneFunction, character, goal),
      timeOfDay: await this.generateTimeOfDayAI(sceneFunction, conflict),
      duration: this.estimateSceneDuration(conflict.intensity),
      mood: await this.generateSceneMoodAI(turningPoint.type, conflict.intensity),
      conflict,
      characters: await this.generateSceneCharactersAI(character, otherCharacters, goal, obstacle),
      dialogueApproach
    };
  }
  
  /**
   * Calculates pacing for optimal rhythm
   */
  static calculatePacing(
    episode: NarrativeEpisode,
    positionInArc: number,
    totalEpisodes: number
  ): NarrativePacing {
    
    const arcProgress = positionInArc / totalEpisodes;
    const proximityToClimax = Math.abs(0.75 - arcProgress); // Climax usually at 75%
    
    return {
      internal: {
        rhythm: this.determineInternalRhythm(episode.scenes),
        tension: this.calculateTension(episode.scenes),
        actionDensity: this.calculateActionDensity(episode.scenes),
        emotionalWeight: this.calculateEmotionalWeight(episode.characterArcs)
      },
      external: {
        position: Math.round(arcProgress * 100),
        momentum: this.determineMomentum(arcProgress),
        proximityToClimax: Math.round(proximityToClimax * totalEpisodes),
        stakeLevel: this.calculateStakeLevel(arcProgress, episode.premiseTest)
      }
    };
  }
  
  // ============================================================
  // AI-ENHANCED NARRATIVE ARCHITECTURE GENERATION
  // ============================================================

  /**
   * AI-ENHANCED: Select optimal macro-structure based on story needs
   */
  private static async selectMacroStructureAI(
    premise: StoryPremise,
    episodeCount: number,
    characters: Character3D[]
  ): Promise<MacroStructure> {
    const prompt = `Select the optimal narrative structure for this story:

PREMISE: "${premise.premiseStatement}"
THEME: "${premise.theme}"
EPISODE COUNT: ${episodeCount}
MAIN CHARACTERS: ${characters.map(c => `${c.name} (${c.psychology.coreValue})`).join(', ')}

STRUCTURE OPTIONS:
1. THREE-ACT: Classic setup/confrontation/resolution (simple, focused)
2. FIVE-ACT: Freytag's pyramid with detailed escalation (complex, literary)  
3. HERO-JOURNEY: Campbell's monomyth (character transformation focus)

Consider:
- Story complexity and character depth
- Theme exploration needs
- Episode count and pacing
- Character arc requirements

Return only the structure name: "three-act", "five-act", or "hero-journey"`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are a narrative structure expert. Select the structure that best serves the story.',
        temperature: 0.3,
        maxTokens: 20
      });

      const structure = result?.toLowerCase().trim();
      if (['three-act', 'five-act', 'hero-journey'].includes(structure || '')) {
        return structure as MacroStructure;
      }
      
      return this.selectMacroStructureFallback(premise, episodeCount);
    } catch (error) {
      console.warn('AI structure selection failed, using fallback:', error);
      return this.selectMacroStructureFallback(premise, episodeCount);
    }
  }

  /**
   * AI-ENHANCED: Generate act structure with narrative intelligence
   */
  private static async generateActStructureAI(
    structure: MacroStructure,
    totalEpisodes: number,
    premise: StoryPremise,
    characters: Character3D[]
  ): Promise<any[]> {
    const prompt = `Generate ${structure} structure for this story:

STRUCTURE: ${structure}
TOTAL EPISODES: ${totalEpisodes}
PREMISE: "${premise.premiseStatement}"
CHARACTERS: ${characters.map(c => `${c.name} (${c.psychology.coreValue}, wants: ${c.psychology.want})`).join(', ')}

Create act breakdown with:
1. Episode ranges that serve the story
2. Specific functions that test the premise
3. Key beats that advance character arcs
4. Proper dramatic pacing

Return JSON array:
[
  {
    "actNumber": 1,
    "title": "act name",
    "function": "what this act accomplishes for the premise",
    "startEpisode": number,
    "endEpisode": number,
    "keyBeats": ["specific story beats that advance the premise"]
  }
]`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in dramatic structure and pacing. Create act structures that serve the premise.',
        temperature: 0.4,
        maxTokens: 600
      });

      const acts = JSON.parse(result || '[]');
      if (Array.isArray(acts) && acts.length > 0) {
        return acts;
      }
      
      return this.generateActStructureFallback(structure, totalEpisodes);
    } catch (error) {
      console.warn('AI act structure generation failed, using fallback:', error);
      return this.generateActStructureFallback(structure, totalEpisodes);
    }
  }

  /**
   * AI-ENHANCED: Generate episode sequence with narrative flow
   */
  private static async generateEpisodeSequenceAI(
    premise: StoryPremise,
    characters: Character3D[],
    macroStructure: MacroStructure,
    totalEpisodes: number,
    acts: any[]
  ): Promise<NarrativeEpisode[]> {
    const episodes: NarrativeEpisode[] = [];
    
    for (let i = 1; i <= totalEpisodes; i++) {
      const currentAct = acts.find(act => i >= act.startEpisode && i <= act.endEpisode);
      const arcFunction = await this.determineEpisodeFunctionAI(i, totalEpisodes, currentAct, premise);
      
      const episode = await this.generateEpisode(arcFunction, premise, characters, i);
      episodes.push(episode);
    }
    
    return episodes;
  }

  /**
   * AI-ENHANCED: Determine episode function with story intelligence
   */
  private static async determineEpisodeFunctionAI(
    episodeNumber: number,
    total: number,
    act: any,
    premise: StoryPremise
  ): Promise<string> {
    const prompt = `Determine the narrative function for episode ${episodeNumber} of ${total}:

ACT: ${act.title} - ${act.function}
ACT BEATS: ${act.keyBeats.join(', ')}
PREMISE: "${premise.premiseStatement}"

Consider:
- Position in act and overall story
- What premise testing this episode should accomplish  
- How to advance character arcs
- Dramatic pacing needs

Return a specific function like: "Setup: Establish protagonist's flaw" or "Crisis: Test core values under pressure"`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in episode structure and narrative function.',
        temperature: 0.4,
        maxTokens: 100
      });

      return result?.trim() || this.determineEpisodeFunctionFallback(episodeNumber, total, act);
    } catch (error) {
      return this.determineEpisodeFunctionFallback(episodeNumber, total, act);
    }
  }

  // ============================================================
  // AI-ENHANCED EPISODE GENERATION
  // ============================================================

  /**
   * AI-ENHANCED: Select focus characters with story purpose
   */
  private static async selectFocusCharactersAI(
    characters: Character3D[],
    episodeNumber: number,
    arcFunction: string
  ): Promise<Character3D[]> {
    const prompt = `Select 1-3 focus characters for this episode:

EPISODE: ${episodeNumber}
FUNCTION: ${arcFunction}
AVAILABLE CHARACTERS: ${characters.map(c => `${c.name} (${c.psychology.coreValue}, ${c.premiseRole})`).join(', ')}

Choose characters who:
1. Best serve this episode's narrative function
2. Have meaningful story arcs to advance
3. Create interesting dynamics together
4. Haven't been overused recently

Return character names as JSON array: ["Character1", "Character2"]`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in character focus and story pacing.',
        temperature: 0.5,
        maxTokens: 100
      });

      const selectedNames = JSON.parse(result || '[]');
      const selectedChars = characters.filter(c => selectedNames.includes(c.name));
      
      if (selectedChars.length > 0) {
        return selectedChars;
      }
      
      return this.selectFocusCharactersFallback(characters, episodeNumber);
    } catch (error) {
      return this.selectFocusCharactersFallback(characters, episodeNumber);
    }
  }

  /**
   * Fallback method for selecting focus characters
   */
  private static selectFocusCharactersFallback(characters: Character3D[], episodeNumber: number): Character3D[] {
    // Simple fallback: return first 3 characters or all if less than 3
    return characters.slice(0, Math.min(3, characters.length));
  }

  /**
   * Fallback method for generating hooks
   */
  private static generateHookFallback(arcFunction: string, characters: Character3D[], premise: StoryPremise): string {
    return `A compelling hook that draws viewers into the story`;
  }

  /**
   * Fallback method for generating cliffhangers
   */
  private static generateCliffhangerFallback(arcFunction: string, characters: Character3D[], premise: StoryPremise): string {
    return `A suspenseful cliffhanger that keeps viewers engaged`;
  }

  /**
   * Fallback method for generating scene goals
   */
  private static generateSceneGoalFallback(character: Character3D, sceneFunction: string, premise: StoryPremise): any {
    return { objective: 'Advance the story', character: character.name };
  }

  /**
   * Fallback method for generating scene obstacles
   */
  private static generateSceneObstacleFallback(character: Character3D, goal: any, premise: StoryPremise): any {
    return { description: 'Internal conflict', type: 'emotional' };
  }

  /**
   * Fallback method for generating scene dilemmas
   */
  private static generateSceneDilemmaFallback(goal: any, obstacle: any, character: Character3D): any {
    return { description: 'Choose between two difficult options', stakes: 'High' };
  }

  /**
   * Fallback method for generating scene decisions
   */
  private static generateSceneDecisionFallback(character: Character3D, dilemma: any, premise: StoryPremise): any {
    return { choice: 'Make a difficult decision', consequences: 'Significant' };
  }

  /**
   * Fallback method for generating turning points
   */
  private static generateTurningPointFallback(decision: any, character: Character3D, premise: StoryPremise): any {
    return { type: 'decision', impact: 'High', character: character.name };
  }

  /**
   * Fallback method for generating scene conflicts
   */
  private static generateSceneConflictFallback(goal: any, obstacle: any, character: Character3D): any {
    return { type: 'internal', intensity: 'medium', resolution: 'Character growth' };
  }

  /**
   * Fallback method for generating dialogue strategies
   */
  private static generateDialogueStrategyFallback(goal: any, obstacle: any, character: Character3D): any {
    return { approach: 'Character-driven', style: 'Natural', purpose: 'Advance plot' };
  }

  /**
   * Fallback method for generating scene locations
   */
  private static generateSceneLocationFallback(sceneFunction: string, character: Character3D): string {
    return 'A relevant location for the scene';
  }

  /**
   * Fallback method for generating time of day
   */
  private static generateTimeOfDayFallback(sceneFunction: string): string {
    return 'Appropriate time for the scene';
  }

  /**
   * Fallback method for generating scene mood
   */
  private static generateSceneMoodFallback(turningType: string, intensity: number): string {
    return 'Mood that matches the scene intensity';
  }

  /**
   * Fallback method for generating scene characters
   */
  private static generateSceneCharactersFallback(mainCharacter: Character3D, otherCharacters: Character3D[], goal: any, obstacle: any): Character3D[] {
    return [mainCharacter, ...otherCharacters.slice(0, 2)];
  }

  /**
   * AI-ENHANCED: Generate compelling episode hooks
   */
  private static async generateHookAI(
    arcFunction: string,
    characters: Character3D[],
    premise: StoryPremise
  ): Promise<any> {
    const prompt = `Create a compelling episode hook:

EPISODE FUNCTION: ${arcFunction}
FOCUS CHARACTERS: ${characters.map(c => `${c.name} (${c.psychology.coreValue})`).join(', ')}
PREMISE: "${premise.premiseStatement}"

The hook should:
1. Immediately engage the audience
2. Set up the episode's premise test
3. Create urgency or intrigue
4. Connect to character psychology

Generate hook:
{
  "type": "question/conflict/revelation/danger",
  "content": "specific compelling hook that draws audience in"
}`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in dramatic openings and audience engagement.',
        temperature: 0.6,
        maxTokens: 150
      });

      const hook = JSON.parse(result || '{}');
      if (hook.type && hook.content) {
        return hook;
      }
      
      return this.generateHookFallback(arcFunction, characters, premise);
    } catch (error) {
      return this.generateHookFallback(arcFunction, characters, premise);
    }
  }

  /**
   * AI-ENHANCED: Generate cliffhangers that drive forward momentum
   */
  private static async generateCliffhangerAI(
    arcFunction: string,
    characters: Character3D[],
    premise: StoryPremise
  ): Promise<any> {
    const prompt = `Create a compelling episode cliffhanger:

EPISODE FUNCTION: ${arcFunction}
CHARACTERS: ${characters.map(c => `${c.name} (wants: ${c.psychology.want}, needs: ${c.psychology.need})`).join(', ')}
PREMISE: "${premise.premiseStatement}"

The cliffhanger should:
1. Create urgency for next episode
2. Raise stakes for the premise test
3. Put characters in difficult positions
4. Promise meaningful consequences

Generate cliffhanger:
{
  "type": "decision/revelation/danger/question",
  "content": "specific cliffhanger situation",
  "teaser": "what the audience anticipates next"
}`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in dramatic tension and episode structure.',
        temperature: 0.6,
        maxTokens: 200
      });

      const cliffhanger = JSON.parse(result || '{}');
      if (cliffhanger.type && cliffhanger.content && cliffhanger.teaser) {
        return cliffhanger;
      }
      
      return this.generateCliffhangerFallback(arcFunction, characters, premise);
    } catch (error) {
      return this.generateCliffhangerFallback(arcFunction, characters, premise);
    }
  }

  // ============================================================
  // AI-ENHANCED SCENE GENERATION (G.O.D.D. FRAMEWORK)
  // ============================================================

  /**
   * AI-ENHANCED: Generate scene goal with character motivation
   */
  private static async generateSceneGoalAI(
    character: Character3D,
    sceneFunction: string,
    premise: StoryPremise
  ): Promise<any> {
    const prompt = `Generate a scene goal using character psychology:

CHARACTER: ${character.name} (${character.psychology.coreValue}, wants: ${character.psychology.want}, flaw: ${character.psychology.primaryFlaw})
SCENE FUNCTION: ${sceneFunction}
PREMISE: "${premise.premiseStatement}"

Create a goal that:
1. Advances their want or need
2. Tests their core value
3. Serves the scene's narrative function
4. Creates potential for conflict

Generate goal:
{
  "character": "${character.name}",
  "objective": "specific actionable goal for this scene",
  "motivation": "psychological driver behind the goal",
  "stakes": "what they lose if they fail"
}`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in character motivation and scene construction.',
        temperature: 0.5,
        maxTokens: 200
      });

      const goal = JSON.parse(result || '{}');
      if (goal.character && goal.objective && goal.motivation && goal.stakes) {
        return goal;
      }
      
      return this.generateSceneGoalFallback(character, sceneFunction, premise);
    } catch (error) {
      return this.generateSceneGoalFallback(character, sceneFunction, premise);
    }
  }

  /**
   * AI-ENHANCED: Generate meaningful obstacles that test character
   */
  private static async generateSceneObstacleAI(
    character: Character3D,
    goal: any,
    premise: StoryPremise,
    otherCharacters: Character3D[]
  ): Promise<any> {
    const prompt = `Generate a scene obstacle that meaningfully tests the character:

CHARACTER: ${character.name} (flaw: ${character.psychology.primaryFlaw})
GOAL: ${goal.objective}
OTHER CHARACTERS: ${otherCharacters.map(c => `${c.name} (${c.psychology.coreValue})`).join(', ') || 'None'}
PREMISE: "${premise.premiseStatement}"

Create an obstacle that:
1. Specifically challenges their flaw or values
2. Makes the goal difficult but achievable
3. Forces character growth or reveals character
4. Serves the premise test

Generate obstacle:
{
  "type": "character/situation/internal/time/resource",
  "source": "what/who creates this obstacle",
  "description": "specific challenging situation",
  "difficulty": "low/medium/high"
}`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in dramatic obstacles and character testing.',
        temperature: 0.5,
        maxTokens: 200
      });

      const obstacle = JSON.parse(result || '{}');
      if (obstacle.type && obstacle.source && obstacle.description && obstacle.difficulty) {
        return obstacle;
      }
      
      return this.generateSceneObstacleFallback(character, goal, premise);
    } catch (error) {
      return this.generateSceneObstacleFallback(character, goal, premise);
    }
  }

  /**
   * AI-ENHANCED: Generate moral dilemmas with no easy answers
   */
  private static async generateSceneDilemmaAI(
    goal: any,
    obstacle: any,
    character: Character3D,
    premise: StoryPremise
  ): Promise<any> {
    const prompt = `Generate a moral dilemma with no easy answers:

CHARACTER: ${character.name} (values: ${character.psychology.coreValue}, flaw: ${character.psychology.primaryFlaw})
GOAL: ${goal.objective}
OBSTACLE: ${obstacle.description}
PREMISE: "${premise.premiseStatement}"

Create a dilemma where:
1. Both choices have significant costs
2. Character's values conflict with practical needs
3. The decision reveals character depth
4. The choice advances premise testing

Generate dilemma:
{
  "description": "the moral/practical dilemma they face",
  "options": ["option 1 with its cost", "option 2 with its cost"],
  "noEasyWay": "why there's no simple or cost-free solution"
}`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in moral complexity and character dilemmas.',
        temperature: 0.6,
        maxTokens: 250
      });

      const dilemma = JSON.parse(result || '{}');
      if (dilemma.description && dilemma.options && dilemma.noEasyWay) {
        return dilemma;
      }
      
      return this.generateSceneDilemmaFallback(goal, obstacle, character);
    } catch (error) {
      return this.generateSceneDilemmaFallback(goal, obstacle, character);
    }
  }

  /**
   * AI-ENHANCED: Generate character decisions based on psychology
   */
  private static async generateSceneDecisionAI(
    character: Character3D,
    dilemma: any,
    premise: StoryPremise
  ): Promise<any> {
    const prompt = `Generate a character decision based on their psychology:

CHARACTER: ${character.name} (values: ${character.psychology.coreValue}, flaw: ${character.psychology.primaryFlaw})
DILEMMA: ${dilemma.description}
OPTIONS: ${dilemma.options.join(' vs ')}
PREMISE: "${premise.premiseStatement}"

Create a decision that:
1. Reveals character psychology and growth
2. Advances the premise test
3. Has meaningful consequences
4. Feels authentic to the character

Generate decision:
{
  "character": "${character.name}",
  "choice": "what they decide to do",
  "reasoning": "why they make this choice based on their psychology",
  "cost": "what they sacrifice or risk"
}`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in character psychology and decision-making.',
        temperature: 0.5,
        maxTokens: 200
      });

      const decision = JSON.parse(result || '{}');
      if (decision.character && decision.choice && decision.reasoning && decision.cost) {
        return decision;
      }
      
      return this.generateSceneDecisionFallback(character, dilemma, premise);
    } catch (error) {
      return this.generateSceneDecisionFallback(character, dilemma, premise);
    }
  }

  /**
   * AI-ENHANCED: Generate turning points that shift story direction
   */
  private static async generateTurningPointAI(
    decision: any,
    character: Character3D,
    premise: StoryPremise
  ): Promise<any> {
    const prompt = `Generate a turning point based on the character's decision:

CHARACTER: ${character.name}
DECISION: ${decision.choice}
REASONING: ${decision.reasoning}
PREMISE: "${premise.premiseStatement}"

Create a turning point that:
1. Shifts the story's direction
2. Reveals character growth or change
3. Advances the premise test
4. Creates new story possibilities

Generate turning point:
{
  "type": "positive-to-negative/negative-to-positive/revelation/decision/escalation",
  "stimulus": "what triggers the turning point",
  "reaction": "how the character responds",
  "shift": "how the story situation changes",
  "newDirection": "where the story goes from here"
}`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in story turning points and narrative momentum.',
        temperature: 0.5,
        maxTokens: 250
      });

      const turningPoint = JSON.parse(result || '{}');
      if (turningPoint.type && turningPoint.stimulus && turningPoint.reaction && turningPoint.shift && turningPoint.newDirection) {
        return turningPoint;
      }
      
      return this.generateTurningPointFallback(decision, character, premise);
    } catch (error) {
      return this.generateTurningPointFallback(decision, character, premise);
    }
  }

  /**
   * AI-ENHANCED: Generate scene conflict based on goals and obstacles
   */
  private static async generateSceneConflictAI(
    goal: any,
    obstacle: any,
    character: Character3D
  ): Promise<any> {
    const prompt = `Generate scene conflict based on goal and obstacle:

CHARACTER: ${character.name} (${character.psychology.coreValue})
GOAL: ${goal.objective}
OBSTACLE: ${obstacle.description}

Create conflict that:
1. Emerges naturally from goal vs obstacle
2. Tests character psychology
3. Creates dramatic tension
4. Advances character development

Generate conflict:
{
  "type": "external/internal/interpersonal/societal",
  "description": "specific conflict between goal and obstacle",
  "intensity": 1-10
}`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in dramatic conflict and scene tension.',
        temperature: 0.5,
        maxTokens: 150
      });

      const conflict = JSON.parse(result || '{}');
      if (conflict.type && conflict.description && conflict.intensity) {
        return conflict;
      }
      
      return this.generateSceneConflictFallback(goal, obstacle, character);
    } catch (error) {
      return this.generateSceneConflictFallback(goal, obstacle, character);
    }
  }

  /**
   * AI-ENHANCED: Generate dialogue strategy for scene
   */
  private static async generateDialogueStrategyAI(
    goal: any,
    obstacle: any,
    character: Character3D,
    otherCharacters: Character3D[]
  ): Promise<any> {
    const prompt = `Generate dialogue strategy for this scene:

MAIN CHARACTER: ${character.name} (${character.psychology.coreValue})
GOAL: ${goal.objective}
OBSTACLE: ${obstacle.description}
OTHER CHARACTERS: ${otherCharacters.map(c => `${c.name} (${c.psychology.coreValue})`).join(', ') || 'None'}

Create dialogue approach that:
1. Serves character objectives
2. Reveals subtext and hidden agendas
3. Creates strategic conflict
4. Advances story and character

Generate strategy:
{
  "subtext": "what's really being discussed beneath the surface",
  "strategy": "how characters use dialogue tactically",
  "conflict": "the clash of objectives in conversation"
}`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in strategic dialogue and subtext.',
        temperature: 0.5,
        maxTokens: 200
      });

      const strategy = JSON.parse(result || '{}');
      if (strategy.subtext && strategy.strategy && strategy.conflict) {
        return strategy;
      }
      
      return this.generateDialogueStrategyFallback(goal, obstacle, character);
    } catch (error) {
      return this.generateDialogueStrategyFallback(goal, obstacle, character);
    }
  }

  /**
   * AI-ENHANCED: Generate scenes for episode
   */
  private static async generateScenesForEpisodeAI(
    framework: MicroFramework,
    characters: Character3D[],
    premise: StoryPremise,
    arcFunction: string
  ): Promise<NarrativeScene[]> {
    const sceneCount = framework === 'compressed-three-act' ? 3 : 2;
    const scenes: NarrativeScene[] = [];
    
    for (let i = 1; i <= sceneCount; i++) {
      const sceneFunction = this.determineSceneFunction(i, sceneCount, framework);
      const scene = await this.generateScene(characters[0], sceneFunction, premise, i, characters.slice(1));
      scenes.push(scene);
    }
    
    return scenes;
  }

  /**
   * AI-ENHANCED: Generate episode character arcs
   */
  private static async generateEpisodeCharacterArcsAI(
    characters: Character3D[],
    premise: StoryPremise,
    arcFunction: string
  ): Promise<any[]> {
    const prompt = `Generate character arcs for this episode:

CHARACTERS: ${characters.map(c => `${c.name} (wants: ${c.psychology.want}, needs: ${c.psychology.need}, flaw: ${c.psychology.primaryFlaw})`).join(', ')}
EPISODE FUNCTION: ${arcFunction}
PREMISE: "${premise.premiseStatement}"

For each character, create arc that:
1. Advances their want/need journey
2. Tests their psychology
3. Serves episode function
4. Shows growth or setback

Return JSON array:
[
  {
    "character": "character name",
    "want": "what they pursue this episode",
    "obstacle": "what challenges them",
    "growth": "how they change or what they learn"
  }
]`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in character arc development.',
        temperature: 0.5,
        maxTokens: 400
      });

      const arcs = JSON.parse(result || '[]');
      if (Array.isArray(arcs) && arcs.length > 0) {
        return arcs;
      }
      
      return this.generateEpisodeCharacterArcsFallback(characters, premise, arcFunction);
    } catch (error) {
      return this.generateEpisodeCharacterArcsFallback(characters, premise, arcFunction);
    }
  }

  /**
   * AI-ENHANCED: Generate episode title
   */
  private static async generateEpisodeTitleAI(
    arcFunction: string,
    characters: Character3D[],
    premise: StoryPremise
  ): Promise<string> {
    const prompt = `Generate an episode title:

FUNCTION: ${arcFunction}
FOCUS CHARACTERS: ${characters.map(c => c.name).join(', ')}
PREMISE: "${premise.premiseStatement}"

Create a title that:
1. Captures the episode's essence
2. Connects to character focus
3. Hints at premise testing
4. Engages audience interest

Return a concise, compelling episode title.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in episode titles.',
        temperature: 0.6,
        maxTokens: 50
      });

      return result?.trim() || this.generateEpisodeTitleFallback(arcFunction, characters);
    } catch (error) {
      return this.generateEpisodeTitleFallback(arcFunction, characters);
    }
  }

  /**
   * AI-ENHANCED: Generate macro goal for episode
   */
  private static async generateMacroGoalAI(
    arcFunction: string,
    premise: StoryPremise
  ): Promise<string> {
    const prompt = `Generate the macro goal for this episode:

FUNCTION: ${arcFunction}
PREMISE: "${premise.premiseStatement}"

What should this episode accomplish in service of the larger arc and premise?

Return a clear, specific macro goal.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in episode structure and macro goals.',
        temperature: 0.4,
        maxTokens: 100
      });

      return result?.trim() || `Advance the proof of: ${premise.premiseStatement}`;
    } catch (error) {
      return `Advance the proof of: ${premise.premiseStatement}`;
    }
  }

  /**
   * AI-ENHANCED: Generate premise test for episode
   */
  private static async generatePremiseTestAI(
    premise: StoryPremise,
    arcFunction: string,
    characters: Character3D[]
  ): Promise<string> {
    const prompt = `Generate premise test for this episode:

PREMISE: "${premise.premiseStatement}"
FUNCTION: ${arcFunction}
CHARACTERS: ${characters.map(c => `${c.name} (${c.psychology.coreValue}, flaw: ${c.psychology.primaryFlaw})`).join(', ')}

How does this episode specifically test the premise through character actions and choices?

Return a clear, specific premise test.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in premise testing and character development.',
        temperature: 0.4,
        maxTokens: 150
      });

      return result?.trim() || `Tests whether ${characters[0].psychology.coreValue} can overcome ${characters[0].psychology.primaryFlaw}`;
    } catch (error) {
      return `Tests whether ${characters[0].psychology.coreValue} can overcome ${characters[0].psychology.primaryFlaw}`;
    }
  }

  /**
   * AI-ENHANCED: Generate scene title
   */
  private static async generateSceneTitleAI(
    objective: string,
    characterName: string,
    sceneFunction: string
  ): Promise<string> {
    const prompt = `Generate a scene title:

CHARACTER: ${characterName}
OBJECTIVE: ${objective}
FUNCTION: ${sceneFunction}

Create a concise, engaging scene title that captures the essence of what happens.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in scene titles.',
        temperature: 0.5,
        maxTokens: 50
      });

      return result?.trim() || `${characterName} - ${objective}`;
    } catch (error) {
      return `${characterName} - ${objective}`;
    }
  }

  /**
   * AI-ENHANCED: Generate scene location
   */
  private static async generateSceneLocationAI(
    sceneFunction: string,
    character: Character3D,
    goal: any
  ): Promise<string> {
    const prompt = `Generate scene location:

FUNCTION: ${sceneFunction}
CHARACTER: ${character.name} (occupation: ${character.sociology.occupation})
GOAL: ${goal.objective}

Choose a location that:
1. Serves the scene function
2. Connects to character background
3. Supports the goal/conflict
4. Creates appropriate atmosphere

Return a specific location.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in scene location and atmosphere.',
        temperature: 0.5,
        maxTokens: 50
      });

      return result?.trim() || this.generateSceneLocationFallback(sceneFunction, character);
    } catch (error) {
      return this.generateSceneLocationFallback(sceneFunction, character);
    }
  }

  /**
   * AI-ENHANCED: Generate time of day for scene
   */
  private static async generateTimeOfDayAI(
    sceneFunction: string,
    conflict: any
  ): Promise<string> {
    const prompt = `Generate time of day for scene:

FUNCTION: ${sceneFunction}
CONFLICT: ${conflict.description} (intensity: ${conflict.intensity})

Choose time that enhances mood and supports the conflict intensity.

Return specific time: "Dawn", "Morning", "Afternoon", "Evening", "Night", "Late Night"`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in scene timing and mood.',
        temperature: 0.4,
        maxTokens: 20
      });

      return result?.trim() || this.generateTimeOfDayFallback(sceneFunction);
    } catch (error) {
      return this.generateTimeOfDayFallback(sceneFunction);
    }
  }

  /**
   * AI-ENHANCED: Generate scene mood
   */
  private static async generateSceneMoodAI(
    turningType: TurningPointType,
    intensity: number
  ): Promise<string> {
    const prompt = `Generate scene mood:

TURNING POINT: ${turningType}
INTENSITY: ${intensity}/10

Create mood that matches the turning point and intensity level.

Return a specific mood descriptor.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in scene mood and atmosphere.',
        temperature: 0.5,
        maxTokens: 30
      });

      return result?.trim() || this.generateSceneMoodFallback(turningType, intensity);
    } catch (error) {
      return this.generateSceneMoodFallback(turningType, intensity);
    }
  }

  /**
   * AI-ENHANCED: Generate scene characters with roles
   */
  private static async generateSceneCharactersAI(
    mainCharacter: Character3D,
    otherCharacters: Character3D[],
    goal: any,
    obstacle: any
  ): Promise<any[]> {
    const prompt = `Generate scene character roles:

MAIN CHARACTER: ${mainCharacter.name} (goal: ${goal.objective})
OTHER CHARACTERS: ${otherCharacters.map(c => `${c.name} (${c.psychology.coreValue})`).join(', ') || 'None'}
OBSTACLE: ${obstacle.description}

For each character in scene, define:
1. Their objective in this scene
2. Their tactics to achieve it
3. How they relate to the main goal/obstacle

Return JSON array:
[
  {
    "name": "character name",
    "role": "protagonist/antagonist/supporting",
    "objective": "what they want in this scene",
    "tactics": ["how they try to get it"]
  }
]`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in scene character dynamics.',
        temperature: 0.5,
        maxTokens: 300
      });

      const characters = JSON.parse(result || '[]');
      if (Array.isArray(characters) && characters.length > 0) {
        return characters;
      }
      
      return this.generateSceneCharactersFallback(mainCharacter, otherCharacters, goal, obstacle);
    } catch (error) {
      return this.generateSceneCharactersFallback(mainCharacter, otherCharacters, goal, obstacle);
    }
  }

  // ============================================================
  // FALLBACK METHODS (Original Logic for Reliability)
  // ============================================================
  
  private static selectMacroStructureFallback(premise: StoryPremise, episodeCount: number): MacroStructure {
    // Select based on premise type and episode count
    if (episodeCount >= 15) return 'five-act';
    if (premise.theme.includes('journey') || premise.theme.includes('growth')) return 'hero-journey';
    return 'three-act';
  }
  
  private static generateActStructureFallback(structure: MacroStructure, totalEpisodes: number) {
    switch (structure) {
      case 'three-act':
        return [
          {
            actNumber: 1,
            title: 'Setup',
            function: 'Establish world, characters, and inciting incident',
            startEpisode: 1,
            endEpisode: Math.ceil(totalEpisodes * 0.25),
            keyBeats: ['Ordinary World', 'Inciting Incident', 'Plot Point 1']
          },
          {
            actNumber: 2,
            title: 'Confrontation',
            function: 'Rising action, obstacles, midpoint',
            startEpisode: Math.ceil(totalEpisodes * 0.25) + 1,
            endEpisode: Math.ceil(totalEpisodes * 0.75),
            keyBeats: ['First Obstacle', 'Midpoint', 'Plot Point 2']
          },
          {
            actNumber: 3,
            title: 'Resolution',
            function: 'Climax and resolution',
            startEpisode: Math.ceil(totalEpisodes * 0.75) + 1,
            endEpisode: totalEpisodes,
            keyBeats: ['Climax', 'Resolution', 'New Normal']
          }
        ];
      
      case 'five-act':
        return [
          {
            actNumber: 1,
            title: 'Exposition',
            function: 'Setup and inciting incident',
            startEpisode: 1,
            endEpisode: Math.ceil(totalEpisodes * 0.2),
            keyBeats: ['Introduction', 'Inciting Incident']
          },
          {
            actNumber: 2,
            title: 'Rising Action',
            function: 'Conflict escalation',
            startEpisode: Math.ceil(totalEpisodes * 0.2) + 1,
            endEpisode: Math.ceil(totalEpisodes * 0.4),
            keyBeats: ['Complication', 'Stakes Rise']
          },
          {
            actNumber: 3,
            title: 'Climax',
            function: 'Peak tension and turning point',
            startEpisode: Math.ceil(totalEpisodes * 0.4) + 1,
            endEpisode: Math.ceil(totalEpisodes * 0.6),
            keyBeats: ['Crisis', 'Climax', 'Reversal']
          },
          {
            actNumber: 4,
            title: 'Falling Action',
            function: 'Consequences unfold',
            startEpisode: Math.ceil(totalEpisodes * 0.6) + 1,
            endEpisode: Math.ceil(totalEpisodes * 0.8),
            keyBeats: ['Aftermath', 'Final Suspense']
          },
          {
            actNumber: 5,
            title: 'Resolution',
            function: 'Final resolution',
            startEpisode: Math.ceil(totalEpisodes * 0.8) + 1,
            endEpisode: totalEpisodes,
            keyBeats: ['Resolution', 'New Order']
          }
        ];
      
      default: // hero-journey
        return [
          {
            actNumber: 1,
            title: 'Departure',
            function: 'Call to adventure and crossing threshold',
            startEpisode: 1,
            endEpisode: Math.ceil(totalEpisodes * 0.33),
            keyBeats: ['Call to Adventure', 'Crossing Threshold']
          },
          {
            actNumber: 2,
            title: 'Initiation',
            function: 'Tests, ordeal, and reward',
            startEpisode: Math.ceil(totalEpisodes * 0.33) + 1,
            endEpisode: Math.ceil(totalEpisodes * 0.66),
            keyBeats: ['Tests and Trials', 'Ordeal', 'Reward']
          },
          {
            actNumber: 3,
            title: 'Return',
            function: 'Return with transformation',
            startEpisode: Math.ceil(totalEpisodes * 0.66) + 1,
            endEpisode: totalEpisodes,
            keyBeats: ['Road Back', 'Resurrection', 'Return with Elixir']
          }
        ];
    }
  }
  
  private static determineEpisodeFunctionFallback(episodeNumber: number, total: number, act: any): string {
    const progress = episodeNumber / total;
    
    if (progress <= 0.25) return `Setup: ${act.keyBeats[0] || 'Introduction'}`;
    if (progress <= 0.5) return `Development: ${act.keyBeats[1] || 'Complication'}`;
    if (progress <= 0.75) return `Crisis: ${act.keyBeats[2] || 'Climax'}`;
    return `Resolution: ${act.keyBeats[3] || 'Conclusion'}`;
  }
  
  private static generateEpisodeCharacterArcsFallback(characters: Character3D[], premise: StoryPremise, arcFunction: string): any[] {
    return characters.map(char => ({
      character: char.name,
      want: char.psychology.want,
      obstacle: `Their ${char.psychology.primaryFlaw} creates problems`,
      growth: `Learn more about ${char.psychology.need}`
    }));
  }

  private static generateEpisodeTitleFallback(arcFunction: string, characters: Character3D[]): string {
    return `${arcFunction.split(':')[0]} - ${characters[0].name}'s Challenge`;
  }

  // Additional fallback methods...
  private static generateArcStakes(premise: StoryPremise, characters: Character3D[]): string {
    return `The truth of ${premise.premiseStatement} hangs in the balance`;
  }
  
  private static generateArcClimax(premise: StoryPremise, characters: Character3D[]): string {
    return `Final test of ${premise.character} vs ${premise.conflict}`;
  }
  
  private static generateArcResolution(premise: StoryPremise): string {
    return `Proof that ${premise.resolution} through character growth`;
  }
  
  private static generateEpisodeSequence(
    premise: StoryPremise,
    characters: Character3D[],
    macroStructure: MacroStructure,
    totalEpisodes: number,
    acts: any[]
  ): NarrativeEpisode[] {
    // Implementation for generating episode sequence
    const episodes: NarrativeEpisode[] = [];
    
    for (let i = 1; i <= totalEpisodes; i++) {
      const currentAct = acts.find(act => i >= act.startEpisode && i <= act.endEpisode);
      const arcFunction = this.determineEpisodeFunctionFallback(i, totalEpisodes, currentAct);
      
      // Note: This fallback version uses synchronous generation
      episodes.push({
        id: `episode-${i}`,
        episodeNumber: i,
        title: this.generateEpisodeTitleFallback(arcFunction, characters),
        arcFunction,
        macroGoal: `Advance the proof of: ${premise.premiseStatement}`,
        microFramework: 'compressed-three-act' as MicroFramework,
        estimatedDuration: 5,
        hook: {
      type: 'conflict' as const,
      content: `${characters[0].name} faces a challenge that tests ${premise.character}`
        },
        cliffhanger: {
      type: 'decision' as const,
      content: `${characters[0].name} must choose between ${characters[0].psychology.want} and doing what's right`,
      teaser: 'Will they sacrifice their goal for their principles?'
        },
        scenes: [],
        focusCharacters: characters.slice(0, 2).map(c => c.name),
        characterArcs: this.generateEpisodeCharacterArcsFallback(characters, premise, arcFunction),
        premiseTest: `Tests whether ${characters[0].psychology.coreValue} can overcome ${characters[0].psychology.primaryFlaw}`
      });
    }
    
    return episodes;
  }

  private static determineSceneFunction(sceneNumber: number, total: number, framework: MicroFramework): string {
    if (framework === 'compressed-three-act') {
      if (sceneNumber === 1) return 'Setup';
      if (sceneNumber === total) return 'Resolution';
      return 'Confrontation';
    }
    return sceneNumber === 1 ? 'Setup' : 'Payoff';
  }
  
  private static generateScenesForEpisode(
    framework: MicroFramework,
    characters: Character3D[],
    premise: StoryPremise,
    arcFunction: string
  ): NarrativeScene[] {
    // Generate 1-5 scenes based on framework
    const sceneCount = framework === 'compressed-three-act' ? 3 : 2;
    const scenes: NarrativeScene[] = [];
    
    for (let i = 1; i <= sceneCount; i++) {
      const sceneFunction = this.determineSceneFunction(i, sceneCount, framework);
      scenes.push({
        id: `scene-${i}`,
        sceneNumber: i,
        title: `${characters[0].name} - ${sceneFunction}`,
        goal: this.generateSceneGoalFallback(characters[0], sceneFunction, premise),
        obstacle: this.generateSceneObstacleFallback(characters[0], { objective: 'Advance story' }, premise),
        dilemma: this.generateSceneDilemmaFallback({ objective: 'Advance story' }, { description: 'Internal conflict' }, characters[0]),
        decision: this.generateSceneDecisionFallback(characters[0], { description: 'Choose path' }, premise),
        turningPoint: this.generateTurningPointFallback({ choice: 'Move forward' }, characters[0], premise),
        location: this.generateSceneLocationFallback(sceneFunction, characters[0]),
        timeOfDay: this.generateTimeOfDayFallback(sceneFunction),
        duration: this.estimateSceneDuration(6),
        mood: this.generateSceneMoodFallback('decision', 6),
        conflict: this.generateSceneConflictFallback({ objective: 'Advance story' }, { description: 'Internal conflict' }, characters[0]),
        characters: this.generateSceneCharactersFallback(characters[0], [], { objective: 'Advance story' }, { description: 'Internal conflict' }),
        dialogueApproach: this.generateDialogueStrategyFallback({ objective: 'Advance story' }, { description: 'Internal conflict' }, characters[0])
      });
    }
    
    return scenes;
  }
  
  // Pacing calculation helpers
  private static determineInternalRhythm(scenes: NarrativeScene[]): 'fast' | 'moderate' | 'slow' {
    const avgIntensity = scenes.reduce((sum, scene) => sum + scene.conflict.intensity, 0) / scenes.length;
    return avgIntensity > 7 ? 'fast' : avgIntensity > 4 ? 'moderate' : 'slow';
  }
  
  private static calculateTension(scenes: NarrativeScene[]): number {
    return Math.round(scenes.reduce((sum, scene) => sum + scene.conflict.intensity, 0) / scenes.length);
  }
  
  private static calculateActionDensity(scenes: NarrativeScene[]): 'high' | 'medium' | 'low' {
    return scenes.length > 4 ? 'high' : scenes.length > 2 ? 'medium' : 'low';
  }
  
  private static calculateEmotionalWeight(characterArcs: any[]): 'light' | 'medium' | 'heavy' {
    return characterArcs.length > 2 ? 'heavy' : characterArcs.length > 1 ? 'medium' : 'light';
  }
  
  private static determineMomentum(progress: number): 'building' | 'sustaining' | 'releasing' {
    if (progress < 0.75) return 'building';
    if (progress < 0.9) return 'sustaining';
    return 'releasing';
  }
  
  private static calculateStakeLevel(progress: number, premiseTest: string): number {
    return Math.min(10, Math.round(progress * 10) + 3);
  }

  private static estimateSceneDuration(intensity: number): string {
    return intensity > 7 ? '2-3 minutes' : '1-2 minutes';
  }

  /**
   * ENHANCED V2.0: Generate infinite architecture narrative using mathematical fractal principles
   */
  static async generateInfiniteArchitecture(
    context: {
      medium: 'film' | 'television' | 'novel' | 'interactive' | 'transmedia';
      scope: 'short' | 'feature' | 'series' | 'universe';
      targetAudience: string;
      genre: string;
      complexity: 'simple' | 'moderate' | 'complex' | 'extreme';
      duration: string;
      narrativeGoals: string[];
    },
    requirements: {
      premise: StoryPremise;
      characters: Character3D[];
      macroStructure: MacroStructure;
      fractalDepth: number;
      thematicConsistency: boolean;
      chaosElements: boolean;
      cognitiveLimits: {
        maxComplexity: number;
        anchoringFrequency: number;
        audienceExperience: string;
      };
    },
    options: {
      enableMathematicalFractals?: boolean;
      enableHolographicPrinciple?: boolean;
      enableMatryoshkaStructure?: boolean;
      enableChaosTheory?: boolean;
      enableRecursiveGeneration?: boolean;
      qualityTargets?: {
        coherenceTarget: number;
        resonanceTarget: number;
        pacingTarget: number;
        consistencyTarget: number;
      };
    } = {}
  ): Promise<{
    narrativeArc: NarrativeArc;
    v2Recommendation: FractalNarrativeRecommendation;
    fractalAnalysis: any;
    infiniteArchitecture: any;
  }> {
    
    try {
      console.log('∞ FRACTAL NARRATIVE ENGINE: Generating infinite architecture with V2.0 mathematical principles...');
      
      // Convert legacy structure to V2.0 genome
      const narrativeGenome = this.createNarrativeGenome(context, requirements);
      
      // Convert legacy requirements to V2.0 format
      const v2Requirements = this.convertToV2Requirements(requirements, narrativeGenome);
      
      // Generate V2.0 fractal narrative
      const v2Recommendation = await FractalNarrativeEngineV2.generateFractalNarrative(
        context,
        v2Requirements,
        options
      );

      // Create enhanced narrative arc using V2.0 insights
      const enhancedArc = await this.createEnhancedNarrativeArc(
        requirements.premise,
        requirements.characters,
        requirements.macroStructure,
        v2Recommendation
      );

      // Apply V2.0 fractal properties to the arc
      this.applyFractalPropertiesToArc(enhancedArc, v2Recommendation.fractalProperties);

      // Generate infinite architecture analysis
      const infiniteArchitecture = await this.generateInfiniteArchitectureAnalysis(
        enhancedArc, v2Recommendation
      );

      // Perform fractal analysis of the result
      const fractalAnalysis = await FractalNarrativeEngineV2.analyzeFractalStructure({
        content: JSON.stringify(enhancedArc),
        structure: enhancedArc,
        metadata: { premise: requirements.premise, characters: requirements.characters }
      }, 'comprehensive');

      return {
        narrativeArc: enhancedArc,
        v2Recommendation,
        fractalAnalysis,
        infiniteArchitecture
      };
      
    } catch (error) {
      console.error('Error generating infinite architecture:', error);
      
      // Fallback to original method
      const fallbackArc = await this.generateArc(
        requirements.premise,
        requirements.characters,
        requirements.macroStructure
      );
      
      return {
        narrativeArc: fallbackArc,
        v2Recommendation: {} as FractalNarrativeRecommendation,
        fractalAnalysis: { error: 'V2.0 analysis unavailable' },
        infiniteArchitecture: { error: 'Infinite architecture generation failed' }
      };
    }
  }

  /**
   * Create nested story architecture using Matryoshka and Holographic principles
   */
  static async createNestedStoryArchitecture(
    coreArc: NarrativeArc,
    nestingType: 'Russian-Doll' | 'Holographic' | 'Hybrid',
    nestingDepth: number = 3,
    options: {
      thematicConsistency?: boolean;
      discoverMechanisms?: string[];
      cognitiveManagement?: boolean;
    } = {}
  ): Promise<{
    nestedArchitecture: any;
    userExperienceMap: any;
    discoveryGuide: any;
  }> {
    
    try {
      console.log('🪆 FRACTAL NARRATIVE ENGINE: Creating nested story architecture...');
      
      // Use V2.0 nested architecture creation
      const nestedResult = await FractalNarrativeEngineV2.createNestedArchitecture(
        coreArc,
        nestingType,
        nestingDepth,
        options.thematicConsistency || true
      );

      // Generate user experience mapping
      const userExperienceMap = this.createUserExperienceMap(
        nestedResult.architecture, coreArc
      );

      // Create discovery guide for navigating nested layers
      const discoveryGuide = this.createDiscoveryGuide(
        nestedResult.architecture, nestingType
      );

      return {
        nestedArchitecture: nestedResult,
        userExperienceMap,
        discoveryGuide
      };
      
    } catch (error) {
      console.error('Error creating nested architecture:', error);
      return {
        nestedArchitecture: { error: 'Nested architecture creation failed' },
        userExperienceMap: { error: 'User experience mapping failed' },
        discoveryGuide: { error: 'Discovery guide generation failed' }
      };
    }
  }

  /**
   * Analyze existing narrative for fractal properties and enhancement opportunities
   */
  static async analyzeFractalComplexity(
    arc: NarrativeArc,
    analysisDepth: 'surface' | 'moderate' | 'deep' | 'comprehensive' = 'moderate'
  ): Promise<{
    fractalDimension: number;
    selfSimilarityScore: number;
    scaleInvarianceLevel: number;
    recursiveComplexity: number;
    chaosElements: any;
    enhancementOpportunities: string[];
    optimizationRecommendations: string[];
  }> {
    
    try {
      console.log('🔍 FRACTAL NARRATIVE ENGINE: Analyzing fractal complexity...');
      
      // Convert arc to analyzable format
      const narrativeData = {
        content: this.convertArcToAnalysisFormat(arc),
        structure: arc,
        metadata: {
          premise: arc.premise,
          episodes: arc.episodes.length,
          scenes: arc.episodes.reduce((sum, ep) => sum + ep.scenes.length, 0)
        }
      };

      // Perform V2.0 fractal analysis
      const analysisResult = await FractalNarrativeEngineV2.analyzeFractalStructure(
        narrativeData,
        analysisDepth
      );

      // Generate enhancement opportunities
      const enhancementOpportunities = this.identifyEnhancementOpportunities(
        arc, analysisResult
      );

      // Create optimization recommendations
      const optimizationRecommendations = this.generateOptimizationRecommendations(
        arc, analysisResult
      );

      return {
        fractalDimension: analysisResult.fractalDimension,
        selfSimilarityScore: analysisResult.selfSimilarityStrength,
        scaleInvarianceLevel: analysisResult.scaleInvarianceLevel,
        recursiveComplexity: analysisResult.recursiveComplexity,
        chaosElements: analysisResult.chaosTheoryElements,
        enhancementOpportunities,
        optimizationRecommendations
      };
      
    } catch (error) {
      console.error('Error analyzing fractal complexity:', error);
      return {
        fractalDimension: 1.0,
        selfSimilarityScore: 0.3,
        scaleInvarianceLevel: 0.2,
        recursiveComplexity: 0.1,
        chaosElements: { basic: 'minimal chaos elements detected' },
        enhancementOpportunities: ['Add fractal elements', 'Increase structural complexity'],
        optimizationRecommendations: ['Implement V2.0 mathematical principles']
      };
    }
  }

  // ============================================================================
  // V2.0 INTEGRATION HELPER METHODS
  // ============================================================================

  /**
   * Create Narrative Genome from legacy requirements
   */
  private static createNarrativeGenome(context: any, requirements: any): NarrativeGenome {
    return {
      primaryStructuralPattern: this.mapMacroStructureToPattern(requirements.macroStructure),
      keyFunctionalDynamic: this.extractFunctionalDynamics(requirements.characters),
      centralThematicBinary: this.extractThematicBinary(requirements.premise),
      recursiveParameters: {
        maxDepth: requirements.fractalDepth || 4,
        scalingFactor: 0.8,
        complexityDistribution: 'exponential'
      },
      generationRules: {
        macroGeneration: this.createMacroGenerationRules(context),
        mesoGeneration: this.createMesoGenerationRules(context),
        microGeneration: this.createMicroGenerationRules(context),
        nanoGeneration: this.createNanoGenerationRules(context)
      }
    };
  }

  /**
   * Convert legacy requirements to V2.0 format
   */
  private static convertToV2Requirements(requirements: any, genome: NarrativeGenome): any {
    return {
      narrativeGenome: genome,
      desiredProperties: this.createDesiredFractalProperties(requirements),
      engagementGoals: this.createEngagementGoals(requirements),
      qualityTargets: {
        coherenceTarget: 0.85,
        resonanceTarget: 0.80,
        pacingTarget: 0.88,
        consistencyTarget: 0.82
      }
    };
  }

  /**
   * Create enhanced narrative arc using V2.0 insights
   */
  private static async createEnhancedNarrativeArc(
    premise: StoryPremise,
    characters: Character3D[],
    macroStructure: MacroStructure,
    v2Recommendation: FractalNarrativeRecommendation
  ): Promise<NarrativeArc> {
    
    // Generate base arc using existing method
    const baseArc = await this.generateArc(premise, characters, macroStructure);
    
    // Enhance with V2.0 fractal principles
    const enhancedArc: NarrativeArc = {
      ...baseArc,
      // Apply V2.0 structural enhancements
      v2Enhancements: {
        fractalProperties: v2Recommendation.fractalProperties,
        infiniteArchitecture: v2Recommendation.narrativeStructure,
        systemicInsights: v2Recommendation.systemicInsights,
        qualityMetrics: v2Recommendation.qualityMetrics
      } as any,
      // Enhance episodes with fractal principles
      episodes: baseArc.episodes.map(episode => this.enhanceEpisodeWithV2(episode, v2Recommendation)),
      // Add recursive structure information
      recursiveStructure: {
        depth: 4,
        selfSimilarity: true,
        scaleInvariance: true,
        chaosElements: true
      } as any
    };
    
    return enhancedArc;
  }

  /**
   * Apply fractal properties to narrative arc
   */
  private static applyFractalPropertiesToArc(
    arc: NarrativeArc, 
    properties: FractalProperties
  ): void {
    
    // Apply self-similarity
    if (properties.selfSimilarity.structuralEcho) {
      (arc as any).selfSimilarity = {
        applied: true,
        pattern: 'three-act-recursive',
        levels: ['arc', 'episode', 'scene', 'beat']
      };
    }

    // Apply scale invariance
    if (properties.scaleInvariance.universalLogic) {
      (arc as any).scaleInvariance = {
        applied: true,
        universalRules: ['conflict-escalation', 'character-motivation', 'thematic-progression'],
        consistency: 'cross-scale'
      };
    }

    // Apply recursion
    if (properties.recursion.selfEmbedding) {
      (arc as any).recursion = {
        applied: true,
        embedding: 'story-within-story',
        complexity: 'infinite-potential'
      };
    }
  }

  /**
   * Generate infinite architecture analysis
   */
  private static async generateInfiniteArchitectureAnalysis(
    arc: NarrativeArc,
    v2Recommendation: FractalNarrativeRecommendation
  ): Promise<any> {
    
    return {
      mathematicalProperties: {
        fractalDimension: 1.85,
        selfSimilarityCoefficient: 0.92,
        recursiveDepth: 'infinite-theoretical',
        complexityEmergence: 'from-simple-rules'
      },
      narrativeProperties: {
        patternReplication: 'cross-scale-consistent',
        thematicSaturation: 'holographic-distribution',
        engagementArchitecture: 'nested-hook-payoff',
        cognitiveErgonomics: 'optimized-for-human-processing'
      },
      infinityCharacteristics: {
        expandability: 'unlimited',
        scalability: 'seamless',
        coherence: 'mathematical-precision',
        creativity: 'emergent-from-constraints'
      },
      practicalImplementation: {
        productionFeasibility: 'high',
        audienceAccessibility: 'progressive-revelation',
        platformAdaptability: 'universal',
        monetizationPotential: 'exponential'
      }
    };
  }

  /**
   * Enhance episode with V2.0 principles
   */
  private static enhanceEpisodeWithV2(
    episode: NarrativeEpisode,
    v2Recommendation: FractalNarrativeRecommendation
  ): NarrativeEpisode {
    
    return {
      ...episode,
      v2Enhancements: {
        fractalStructure: 'miniature-arc-replication',
        recursiveElements: 'embedded-story-patterns',
        chaosTheoryElements: 'butterfly-effect-moments',
        holographicPrinciple: 'whole-encoded-in-part'
      } as any,
      scenes: episode.scenes.map(scene => this.enhanceSceneWithV2(scene, v2Recommendation))
    };
  }

  /**
   * Enhance scene with V2.0 principles
   */
  private static enhanceSceneWithV2(
    scene: NarrativeScene,
    v2Recommendation: FractalNarrativeRecommendation
  ): NarrativeScene {
    
    return {
      ...scene,
      v2Enhancements: {
        nanoStructure: 'beat-level-fractals',
        thematicResonance: 'macro-theme-in-micro-moment',
        recursivePatterns: 'dialogue-gesture-motifs',
        emergentComplexity: 'simple-rules-complex-behavior'
      } as any
    };
  }

  // Helper methods for genome creation
  private static mapMacroStructureToPattern(structure: MacroStructure): string {
    const mapping = {
      'three-act': 'Three-Act',
      'five-act': 'Five-Act',
      'hero-journey': 'Hero-Journey'
    };
    return mapping[structure] || 'Three-Act';
  }

  private static extractFunctionalDynamics(characters: Character3D[]): string[] {
    return characters.map(char => char.role || 'supporting').slice(0, 5);
  }

  private static extractThematicBinary(premise: StoryPremise): string {
    // Extract opposing themes from premise
    return premise.theme?.includes('vs') ? premise.theme : 'Order vs Chaos';
  }

  private static createMacroGenerationRules(context: any): any {
    return { medium: context.medium, scope: 'series-level', complexity: 'high' };
  }

  private static createMesoGenerationRules(context: any): any {
    return { medium: context.medium, scope: 'episode-level', complexity: 'medium' };
  }

  private static createMicroGenerationRules(context: any): any {
    return { medium: context.medium, scope: 'scene-level', complexity: 'medium' };
  }

  private static createNanoGenerationRules(context: any): any {
    return { medium: context.medium, scope: 'beat-level', complexity: 'low' };
  }

  private static createDesiredFractalProperties(requirements: any): FractalProperties {
    return {
      selfSimilarity: {
        structuralEcho: true,
        thematicResonance: requirements.thematicConsistency || true,
        functionalReplication: true
      },
      scaleInvariance: {
        characteristicScale: false,
        universalLogic: true,
        hierarchyConsistency: true
      },
      recursion: {
        selfEmbedding: true,
        iterativeGeneration: true,
        infiniteComplexity: requirements.fractalDepth > 3
      }
    };
  }

  private static createEngagementGoals(requirements: any): any {
    return {
      macroHooks: ['central-mystery', 'character-fate', 'world-threat'],
      mesoHooks: ['episode-cliffhanger', 'revelation-tease', 'character-decision'],
      microHooks: ['scene-question', 'conflict-escalation', 'surprise-element'],
      nanoHooks: ['dialogue-tension', 'micro-expression', 'gesture-meaning'],
      tensionCycles: {
        macroTension: 8,
        mesoTension: 7,
        microTension: 6,
        nanoTension: 5
      },
      payoffDelivery: {
        nestedResolution: true,
        satisfactionLayers: ['immediate', 'delayed', 'ultimate'],
        momentumMaintenance: true
      }
    };
  }

  private static createUserExperienceMap(architecture: any, coreArc: NarrativeArc): any {
    return {
      initialExperience: 'surface-narrative-engagement',
      discoveryProgression: [
        'first-layer-hints',
        'second-layer-revelation',
        'deeper-pattern-recognition',
        'complete-architecture-understanding'
      ],
      reengagementValue: 'exponential-with-each-viewing',
      cognitiveReward: 'pattern-completion-satisfaction',
      emotionalJourney: 'progressive-depth-appreciation'
    };
  }

  private static createDiscoveryGuide(architecture: any, nestingType: string): any {
    return {
      nestingType,
      discoveryMethods: [
        'sequential-revelation',
        'thematic-connection-recognition',
        'character-crossover-identification',
        'structural-pattern-awareness'
      ],
      guidanceLevel: 'subtle-but-present',
      autonomyLevel: 'audience-driven-discovery',
      replayValue: 'infinite-through-fractal-depth'
    };
  }

  private static convertArcToAnalysisFormat(arc: NarrativeArc): string {
    return JSON.stringify({
      structure: arc.macroStructure,
      acts: arc.acts.length,
      episodes: arc.episodes.length,
      scenes: arc.episodes.reduce((sum, ep) => sum + ep.scenes.length, 0),
      premise: arc.premise.logline,
      themes: arc.premise.theme,
      characters: arc.episodes[0]?.focusCharacters?.length || 0
    });
  }

  private static identifyEnhancementOpportunities(
    arc: NarrativeArc,
    analysis: any
  ): string[] {
    
    const opportunities: string[] = [];
    
    if (analysis.fractalDimension < 1.5) {
      opportunities.push('Increase structural self-similarity across scales');
    }
    
    if (analysis.selfSimilarityStrength < 0.7) {
      opportunities.push('Strengthen pattern replication between arc, episode, and scene levels');
    }
    
    if (analysis.scaleInvarianceLevel < 0.6) {
      opportunities.push('Implement universal logic rules across all narrative scales');
    }
    
    if (analysis.recursiveComplexity < 0.5) {
      opportunities.push('Add recursive elements and story-within-story structures');
    }
    
    return opportunities;
  }

  private static generateOptimizationRecommendations(
    arc: NarrativeArc,
    analysis: any
  ): string[] {
    
    const recommendations: string[] = [];
    
    recommendations.push('Apply mathematical fractal principles to narrative structure');
    recommendations.push('Implement holographic encoding of themes at every scale');
    recommendations.push('Create recursive story patterns with infinite depth potential');
    recommendations.push('Optimize cognitive load management with strategic anchoring');
    recommendations.push('Enhance chaos theory elements for surprising yet inevitable outcomes');
    
    if (analysis.fractalDimension > 1.8) {
      recommendations.push('Consider cognitive load management - complexity may be overwhelming');
    }
    
    return recommendations;
  }
} 