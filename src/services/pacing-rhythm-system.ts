/**
 * The Pacing & Rhythm System - AI-Enhanced Master of Narrative Flow
 * 
 * This system controls the heartbeat of storytelling with AI-powered intelligence,
 * managing tension curves, emotional peaks, and the delicate art of timing that
 * keeps audiences completely engaged from beginning to end.
 * 
 * Key Principle: Pacing is the breath of story - when to accelerate, when to pause
 * 
 * ENHANCEMENT: Static pacing templates → AI-powered dynamic rhythm generation
 */

import { StoryPremise } from './premise-engine'
import { Character3D } from './character-engine'
import { NarrativeScene, NarrativeArc } from './fractal-narrative-engine'
import { DialogueExchange } from './strategic-dialogue-engine'
import { WorldBlueprint } from './world-building-engine'
import { ConflictArchitecture } from './conflict-architecture-engine'
import { ThemeIntegrationBlueprint } from './theme-integration-engine'
import { GenreProfile } from './genre-mastery-system'
import { generateContent } from './azure-openai'
import { PacingRhythmEngineV2, type PacingRhythmRecommendation } from './pacing-rhythm-engine-v2'

// Core Pacing Architecture
export interface PacingRhythmBlueprint {
  id: string;
  name: string;
  pacingType: PacingType;
  
  // Overall Narrative Rhythm
  narrativeTempo: NarrativeTempo;
  storyRhythm: StoryRhythm;
  globalPacing: GlobalPacing;
  tempoProgression: TempoProgression;
  
  // Act-Level Pacing
  actPacing: ActPacing[];
  transitionRhythms: TransitionRhythm[];
  climaxBuilds: ClimaxBuild[];
  
  // Scene-Level Rhythm
  scenePacing: ScenePacing[];
  dialoguePacing: DialoguePacing[];
  actionPacing: ActionPacing[];
  introspectionPacing: IntrospectionPacing[];
  
  // Tension Management
  tensionCurves: TensionCurve[];
  pressurePoints: PressurePoint[];
  reliefMoments: ReliefMoment[];
  intensityWaves: IntensityWave[];
  
  // Emotional Flow
  emotionalPacing: EmotionalPacing;
  moodRhythms: MoodRhythm[];
  emotionalBeats: EmotionalBeat[];
  catharticMoments: CatharticMoment[];
  
  // Engagement Strategy
  attentionManagement: AttentionManagement;
  revealPacing: RevealPacing;
  informationFlow: InformationFlow;
  audienceEngagement: AudienceEngagement;
  
  // Genre-Specific Rhythm
  genreRhythmPatterns: GenreRhythmPattern[];
  pacingConventions: PacingConvention[];
  rhythmInnovations: RhythmInnovation[];
  
  // Quality Metrics
  pacingConsistency: PacingConsistencyMetrics;
  rhythmEffectiveness: RhythmEffectivenessMetrics;
  engagementPrediction: EngagementPredictionMetrics;
}

export type PacingType = 
  | 'action-thriller'        // Fast, relentless, high-energy
  | 'contemplative-drama'    // Slow, thoughtful, reflective
  | 'romantic-comedy'        // Light, bouncy, playful
  | 'psychological-horror'   // Building dread, calculated tension
  | 'epic-adventure'         // Varied, sweeping, heroic
  | 'mystery-suspense'       // Methodical reveals, mounting tension
  | 'literary-fiction'       // Nuanced, character-driven flow
  | 'fantasy-quest'          // Journey rhythm, escalating stakes
  | 'sci-fi-exploration'     // Discovery pacing, wonder beats
  | 'historical-saga'        // Generational flow, time passage
  | 'coming-of-age'         // Growth rhythm, milestone beats
  | 'family-drama'          // Intimate pacing, relationship focus
  | 'war-epic'              // Battle rhythm, quiet moments
  | 'crime-noir'            // Methodical investigation, dark beats
  | 'superhero-action'      // Power beats, heroic rhythm

export interface NarrativeTempo {
  overallPace: OverallPace;          // Story's general speed
  tempoVariation: TempoVariation;    // How pace changes
  rhythmPattern: RhythmPattern;      // Underlying beat structure
  breathingRoom: BreathingRoom;      // Moments of pause
  momentumBuilding: MomentumBuilding; // How energy accumulates
}

export interface StoryRhythm {
  openingTempo: string;              // How story begins
  risingActionRhythm: string;        // Building tension pattern
  climaxRhythm: string;              // Peak intensity flow
  fallingActionTempo: string;        // Resolution pacing
  conclusionRhythm: string;          // Ending tempo
  
  rhythmicPatterns: RhythmicPattern[]; // Repeating motifs
  tempoShifts: TempoShift[];         // Major pace changes
  pacingAnchors: PacingAnchor[];     // Key rhythm moments
}

// Scene-Level Pacing Control
export interface ScenePacing {
  sceneId: string;
  sceneType: SceneType;
  
  // Scene Rhythm
  openingBeat: SceneBeat;            // How scene starts
  developmentBeats: SceneBeat[];     // Scene progression
  climaxBeat: SceneBeat;             // Scene peak
  resolutionBeat: SceneBeat;         // Scene conclusion
  
  // Tempo Control
  sceneLength: SceneLength;          // Duration expectations
  intensityLevel: IntensityLevel;    // Energy requirements
  pacingStrategy: PacingStrategy;    // Flow approach
  tempoModulation: TempoModulation;  // Speed variations
  
  // Engagement Elements
  hookElements: HookElement[];       // Attention grabbers
  sustainmentTactics: SustainmentTactic[]; // Maintaining interest
  payoffMoments: PayoffMoment[];     // Satisfying beats
  
  // Integration
  characterPacing: CharacterPacing[]; // Character-specific tempo
  conflictPacing: ConflictPacing;    // Conflict development speed
  dialogueRhythm: DialogueRhythm;    // Conversation flow
  actionRhythm: ActionRhythm;        // Physical activity tempo
}

// The AI-Enhanced Pacing & Rhythm System
export class PacingRhythmSystem {
  
  /**
   * V2.0 ENHANCED: Generate sophisticated pacing using comprehensive theoretical frameworks
   */
  static async generateEnhancedPacingRhythm(
    context: {
      projectTitle: string;
      genre: 'horror' | 'comedy' | 'drama' | 'action' | 'romance' | 'thriller' | 'sci-fi' | 'fantasy';
      medium: 'film' | 'series' | 'book' | 'game' | 'interactive' | 'social-media';
      duration: string;
      targetAudience: string[];
      narrativeComplexity: 'simple' | 'moderate' | 'complex';
      productionBudget: 'micro' | 'indie' | 'mid' | 'studio';
    },
    requirements: {
      pacingObjectives: string[];
      rhythmicStyle: 'classical' | 'modern' | 'experimental';
      audienceEngagement: 'passive' | 'active' | 'interactive';
      emotionalJourney: 'steady' | 'dynamic' | 'extreme';
      technicalComplexity: 'basic' | 'advanced' | 'cutting-edge';
      platformOptimization: boolean;
    },
    options: {
      murchRuleApproach?: boolean;
      musicalTheoryApplication?: boolean;
      physiologicalSynchrony?: boolean;
      modernMediaAdaptation?: boolean;
      genreSubversion?: boolean;
    } = {}
  ): Promise<{ blueprint: PacingRhythmBlueprint; pacingFramework: PacingRhythmRecommendation }> {
    try {
      // Generate V2.0 Pacing Framework
      const pacingFramework = await PacingRhythmEngineV2.generatePacingFramework(
        context,
        requirements,
        options
      );
      
      // Convert V2.0 context to legacy format
      const legacyInputs = this.convertToLegacyPacingInputs(
        context,
        requirements,
        pacingFramework
      );
      
      // Generate enhanced pacing blueprint using V2.0 insights
      const blueprint = await this.generatePacingRhythmBlueprint(
        legacyInputs.premise,
        legacyInputs.characters,
        legacyInputs.narrative,
        legacyInputs.world,
        legacyInputs.conflict,
        legacyInputs.theme,
        legacyInputs.genre,
        legacyInputs.pacingRequirements
      );
      
      // Apply V2.0 framework enhancements to blueprint
      const enhancedBlueprint = this.applyPacingFrameworkToBlueprint(
        blueprint,
        pacingFramework
      );
      
      return {
        blueprint: enhancedBlueprint,
        pacingFramework
      };
    } catch (error) {
      console.error('Error generating enhanced pacing rhythm:', error);
      throw error;
    }
  }

  /**
   * AI-ENHANCED: Generate comprehensive pacing & rhythm blueprint
   */
  static async generatePacingRhythmBlueprint(
    premise: StoryPremise,
    characters: Character3D[],
    narrative: NarrativeArc,
    world: WorldBlueprint,
    conflict: ConflictArchitecture,
    theme: ThemeIntegrationBlueprint,
    genre: GenreProfile,
    pacingRequirements?: PacingRequirements
  ): Promise<PacingRhythmBlueprint> {
    
    // AI-Enhanced: Analyze story for optimal pacing type
    const pacingType = await this.determinePacingTypeAI(premise, genre, conflict);
    
    // AI-Enhanced: Generate narrative tempo
    const narrativeTempo = await this.generateNarrativeTempoAI(
      premise, characters, narrative, genre
    );
    
    // AI-Enhanced: Create story rhythm pattern
    const storyRhythm = await this.generateStoryRhythmAI(
      narrative, conflict, theme, pacingType
    );
    
    // AI-Enhanced: Design global pacing strategy
    const globalPacing = await this.generateGlobalPacingAI(
      premise, narrative, genre, pacingRequirements
    );
    
    // AI-Enhanced: Create tempo progression
    const tempoProgression = await this.generateTempoProgressionAI(
      narrative, conflict, theme
    );
    
    // AI-Enhanced: Generate act-level pacing
    const actPacing = await this.generateActPacingAI(
      narrative, conflict, characters, pacingType
    );
    
    // AI-Enhanced: Create scene-level pacing
    const scenePacing = await this.generateScenePacingAI(
      narrative.scenes, characters, conflict, theme
    );
    
    // AI-Enhanced: Design tension curves
    const tensionCurves = await this.generateTensionCurvesAI(
      conflict, narrative, characters, pacingType
    );
    
    // AI-Enhanced: Create emotional pacing
    const emotionalPacing = await this.generateEmotionalPacingAI(
      characters, theme, narrative, genre
    );
    
    // AI-Enhanced: Design attention management
    const attentionManagement = await this.generateAttentionManagementAI(
      narrative, conflict, characters, genre
    );
    
    // AI-Enhanced: Create genre-specific rhythms
    const genreRhythmPatterns = await this.generateGenreRhythmPatternsAI(
      genre, pacingType, narrative
    );
    
    return {
      id: `pacing-rhythm-${Date.now()}`,
      name: `${premise.title} - Pacing & Rhythm`,
      pacingType,
      narrativeTempo,
      storyRhythm,
      globalPacing,
      tempoProgression,
      actPacing,
      transitionRhythms: await this.generateTransitionRhythmsAI(narrative, conflict),
      climaxBuilds: await this.generateClimaxBuildsAI(narrative, conflict, characters),
      scenePacing,
      dialoguePacing: await this.generateDialoguePacingAI(characters, narrative, theme),
      actionPacing: await this.generateActionPacingAI(narrative, conflict, genre),
      introspectionPacing: await this.generateIntrospectionPacingAI(characters, theme),
      tensionCurves,
      pressurePoints: await this.generatePressurePointsAI(conflict, narrative),
      reliefMoments: await this.generateReliefMomentsAI(narrative, characters, genre),
      intensityWaves: await this.generateIntensityWavesAI(conflict, narrative, pacingType),
      emotionalPacing,
      moodRhythms: await this.generateMoodRhythmsAI(theme, characters, narrative),
      emotionalBeats: await this.generateEmotionalBeatsAI(characters, conflict, theme),
      catharticMoments: await this.generateCatharticMomentsAI(narrative, conflict, theme),
      attentionManagement,
      revealPacing: await this.generateRevealPacingAI(narrative, conflict, characters),
      informationFlow: await this.generateInformationFlowAI(narrative, conflict, theme),
      audienceEngagement: await this.generateAudienceEngagementAI(genre, narrative, characters),
      genreRhythmPatterns,
      pacingConventions: await this.generatePacingConventionsAI(genre, pacingType),
      rhythmInnovations: await this.generateRhythmInnovationsAI(genre, narrative, conflict),
      pacingConsistency: await this.calculatePacingConsistencyMetricsAI(scenePacing, actPacing),
      rhythmEffectiveness: await this.calculateRhythmEffectivenessMetricsAI(tensionCurves, emotionalPacing),
      engagementPrediction: await this.calculateEngagementPredictionMetricsAI(attentionManagement, narrative)
    };
  }
  
  /**
   * AI-ENHANCED: Generate optimized scene pacing
   */
  static async generateOptimizedScenePacing(
    scene: NarrativeScene,
    characters: Character3D[],
    conflict: ConflictArchitecture,
    theme: ThemeIntegrationBlueprint,
    contextualPacing: ContextualPacing
  ): Promise<ScenePacing> {
    
    // AI-Enhanced: Determine scene type and requirements
    const sceneType = await this.determineSceneTypeAI(scene, conflict, theme);
    
    // AI-Enhanced: Generate scene beats
    const sceneBeats = await this.generateSceneBeatsAI(
      scene, characters, conflict, sceneType
    );
    
    // AI-Enhanced: Create tempo control
    const tempoControl = await this.generateTempoControlAI(
      scene, sceneType, contextualPacing
    );
    
    // AI-Enhanced: Design engagement elements
    const engagementElements = await this.generateEngagementElementsAI(
      scene, characters, conflict, theme
    );
    
    // AI-Enhanced: Create character-specific pacing
    const characterPacing = await this.generateCharacterPacingAI(
      characters, scene, conflict
    );
    
    return {
      sceneId: scene.sceneId,
      sceneType,
      openingBeat: sceneBeats.opening,
      developmentBeats: sceneBeats.development,
      climaxBeat: sceneBeats.climax,
      resolutionBeat: sceneBeats.resolution,
      sceneLength: tempoControl.length,
      intensityLevel: tempoControl.intensity,
      pacingStrategy: tempoControl.strategy,
      tempoModulation: tempoControl.modulation,
      hookElements: engagementElements.hooks,
      sustainmentTactics: engagementElements.sustainment,
      payoffMoments: engagementElements.payoffs,
      characterPacing,
      conflictPacing: await this.generateConflictPacingAI(scene, conflict),
      dialogueRhythm: await this.generateDialogueRhythmAI(scene, characters),
      actionRhythm: await this.generateActionRhythmAI(scene, conflict)
    };
  }
  
  /**
   * AI-ENHANCED: Analyze and optimize existing pacing
   */
  static async analyzePacingEffectiveness(
    narrative: NarrativeArc,
    blueprint: PacingRhythmBlueprint,
    audienceData?: AudienceData
  ): Promise<PacingAnalysis> {
    
    // AI-Enhanced: Analyze pacing patterns
    const pacingPatterns = await this.analyzePacingPatternsAI(
      narrative, blueprint
    );
    
    // AI-Enhanced: Evaluate engagement potential
    const engagementAnalysis = await this.analyzeEngagementPotentialAI(
      blueprint, audienceData
    );
    
    // AI-Enhanced: Identify improvement opportunities
    const improvements = await this.identifyPacingImprovementsAI(
      narrative, blueprint, pacingPatterns
    );
    
    return {
      overallEffectiveness: await this.calculateOverallEffectivenessAI(pacingPatterns),
      pacingPatterns,
      engagementAnalysis,
      problemAreas: await this.identifyProblemAreasAI(pacingPatterns),
      strengths: await this.identifyPacingStrengthsAI(pacingPatterns),
      improvements,
      recommendations: await this.generatePacingRecommendationsAI(improvements, narrative)
    };
  }

  // ============================================================
  // AI-ENHANCED GENERATION METHODS
  // ============================================================

  /**
   * AI-ENHANCED: Determine optimal pacing type for story
   */
  private static async determinePacingTypeAI(
    premise: StoryPremise,
    genre: GenreProfile,
    conflict: ConflictArchitecture
  ): Promise<PacingType> {
    const prompt = `Determine the optimal pacing type for this story:

PREMISE: "${premise.premiseStatement}"
GENRE: ${genre.name}
CONFLICT TYPE: ${conflict.conflictCore.centralQuestion}
CONFLICT INTENSITY: ${conflict.escalationArchitecture?.overallProgression || 'Building'}

Analyze the story requirements and recommend the best pacing type:

PACING TYPES:
1. action-thriller - Fast, relentless, high-energy
2. contemplative-drama - Slow, thoughtful, reflective
3. romantic-comedy - Light, bouncy, playful
4. psychological-horror - Building dread, calculated tension
5. epic-adventure - Varied, sweeping, heroic
6. mystery-suspense - Methodical reveals, mounting tension
7. literary-fiction - Nuanced, character-driven flow
8. fantasy-quest - Journey rhythm, escalating stakes
9. sci-fi-exploration - Discovery pacing, wonder beats
10. historical-saga - Generational flow, time passage
11. coming-of-age - Growth rhythm, milestone beats
12. family-drama - Intimate pacing, relationship focus
13. war-epic - Battle rhythm, quiet moments
14. crime-noir - Methodical investigation, dark beats
15. superhero-action - Power beats, heroic rhythm

Consider:
- Genre expectations and conventions
- Conflict intensity and type
- Character arc requirements
- Thematic depth needs
- Audience engagement goals

Return the most appropriate pacing type with brief justification.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in narrative pacing and story rhythm. Select optimal pacing types.',
        temperature: 0.6,
        maxTokens: 400
      });

      const pacingData = JSON.parse(result || '{}');
      
      if (pacingData.pacingType) {
        return pacingData.pacingType as PacingType;
      }
      
      return this.determinePacingTypeFallback(premise, genre);
    } catch (error) {
      console.warn('AI pacing type determination failed, using fallback:', error);
      return this.determinePacingTypeFallback(premise, genre);
    }
  }

  /**
   * AI-ENHANCED: Generate narrative tempo with intelligent analysis
   */
  private static async generateNarrativeTempoAI(
    premise: StoryPremise,
    characters: Character3D[],
    narrative: NarrativeArc,
    genre: GenreProfile
  ): Promise<NarrativeTempo> {
    const prompt = `Create the narrative tempo for this story:

PREMISE: "${premise.premiseStatement}"
GENRE: ${genre.name}
CHARACTER COUNT: ${characters.length}
STORY ARC: ${narrative.arcType}
EPISODES: ${narrative.episodes.length}

Design the overall narrative tempo:

1. OVERALL PACE: The story's general speed and energy level
2. TEMPO VARIATION: How the pace changes throughout
3. RHYTHM PATTERN: Underlying beat structure and flow
4. BREATHING ROOM: Moments of pause and reflection
5. MOMENTUM BUILDING: How energy accumulates and releases

Consider:
- Genre pacing conventions
- Character development needs
- Plot complexity requirements
- Emotional journey pacing
- Audience attention spans

Create a comprehensive tempo that serves the story perfectly.

Return detailed narrative tempo analysis.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in narrative tempo and story pacing. Create effective story rhythms.',
        temperature: 0.7,
        maxTokens: 800
      });

      const tempoData = JSON.parse(result || '{}');
      
      if (tempoData.overallPace && tempoData.rhythmPattern) {
        return this.buildNarrativeTempoFromAI(tempoData);
      }
      
      return this.generateNarrativeTempoFallback(premise, genre);
    } catch (error) {
      console.warn('AI narrative tempo generation failed, using fallback:', error);
      return this.generateNarrativeTempoFallback(premise, genre);
    }
  }

  /**
   * AI-ENHANCED: Generate tension curves with precise control
   */
  private static async generateTensionCurvesAI(
    conflict: ConflictArchitecture,
    narrative: NarrativeArc,
    characters: Character3D[],
    pacingType: PacingType
  ): Promise<TensionCurve[]> {
    const prompt = `Create tension curves for this story:

CONFLICT CORE: ${conflict.conflictCore.centralQuestion}
ESCALATION: ${conflict.escalationArchitecture?.overallProgression || 'Building'}
PACING TYPE: ${pacingType}
STORY LENGTH: ${narrative.episodes.length} episodes
MAIN CHARACTERS: ${characters.slice(0, 3).map(c => c.name).join(', ')}

Design tension curves that include:

1. OVERALL TENSION ARC: Story-wide tension progression
2. ACT TENSION CURVES: Tension within each major story section
3. EPISODE TENSION PATTERNS: Individual episode tension flow
4. CHARACTER TENSION ARCS: Personal stakes and pressure
5. CONFLICT TENSION WAVES: Specific conflict escalation patterns

For each curve, specify:
- Starting tension level (1-10)
- Peak tension moments
- Relief/release points
- Building patterns
- Resolution approaches

Create multiple overlapping curves that work together for maximum impact.

Return comprehensive tension curve analysis.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in tension management and dramatic pacing. Create effective tension curves.',
        temperature: 0.7,
        maxTokens: 1000
      });

      const tensionData = JSON.parse(result || '{}');
      
      if (tensionData.curves && Array.isArray(tensionData.curves)) {
        return this.buildTensionCurvesFromAI(tensionData.curves);
      }
      
      return this.generateTensionCurvesFallback(conflict, narrative);
    } catch (error) {
      console.warn('AI tension curve generation failed, using fallback:', error);
      return this.generateTensionCurvesFallback(conflict, narrative);
    }
  }

  // ============================================================
  // FALLBACK METHODS
  // ============================================================

  /**
   * Fallback pacing type determination
   */
  private static determinePacingTypeFallback(premise: StoryPremise, genre: GenreProfile): PacingType {
    const genreName = genre.name.toLowerCase();
    
    if (genreName.includes('action') || genreName.includes('thriller')) {
      return 'action-thriller';
    } else if (genreName.includes('romance') && genreName.includes('comedy')) {
      return 'romantic-comedy';
    } else if (genreName.includes('horror') || genreName.includes('psychological')) {
      return 'psychological-horror';
    } else if (genreName.includes('mystery') || genreName.includes('suspense')) {
      return 'mystery-suspense';
    } else if (genreName.includes('fantasy') || genreName.includes('adventure')) {
      return 'epic-adventure';
    } else if (genreName.includes('sci-fi') || genreName.includes('science')) {
      return 'sci-fi-exploration';
    } else if (genreName.includes('drama')) {
      return 'contemplative-drama';
    } else {
      return 'literary-fiction';
    }
  }

  /**
   * Fallback narrative tempo generation
   */
  private static generateNarrativeTempoFallback(premise: StoryPremise, genre: GenreProfile): NarrativeTempo {
    return {
      overallPace: {
        speed: 'moderate',
        consistency: 'varied',
        energyLevel: 'building',
        tempoClassification: 'balanced'
      },
      tempoVariation: {
        variationType: 'episodic',
        changeFrequency: 'regular',
        intensityRange: 'moderate',
        transitionStyle: 'smooth'
      },
      rhythmPattern: {
        baseRhythm: 'three-act-structure',
        rhythmElements: ['setup', 'development', 'payoff'],
        patternComplexity: 'standard',
        rhythmInnovations: []
      },
      breathingRoom: {
        frequency: 'regular',
        duration: 'appropriate',
        placement: 'after-intensity',
        purpose: 'reflection-and-processing'
      },
      momentumBuilding: {
        buildingStrategy: 'incremental',
        accelerationPoints: ['act-breaks', 'conflict-escalations'],
        peakManagement: 'controlled',
        sustainmentTechniques: ['character-investment', 'plot-momentum']
      }
    };
  }

  /**
   * Fallback tension curves generation
   */
  private static generateTensionCurvesFallback(
    conflict: ConflictArchitecture,
    narrative: NarrativeArc
  ): TensionCurve[] {
    return [
      {
        curveId: 'overall-story-tension',
        curveName: 'Main Story Tension',
        curveType: 'story-wide',
        startingTension: 2,
        peakTension: 9,
        endingTension: 3,
        tensionPattern: 'rising-action-climax-resolution',
        keyPoints: [
          { point: 'opening-hook', tension: 3, description: 'Initial engagement' },
          { point: 'inciting-incident', tension: 5, description: 'Story begins' },
          { point: 'midpoint', tension: 7, description: 'Major escalation' },
          { point: 'climax', tension: 9, description: 'Peak conflict' },
          { point: 'resolution', tension: 3, description: 'Peaceful conclusion' }
        ],
        reliefPoints: [
          { point: 'character-moments', tension: 4, description: 'Breathing room' },
          { point: 'humor-beats', tension: 3, description: 'Tension relief' }
        ],
        buildingTechniques: ['mystery', 'stakes-escalation', 'time-pressure'],
        sustainmentMethods: ['character-investment', 'plot-momentum']
      }
    ];
  }

  /**
   * Build narrative tempo from AI data
   */
  private static buildNarrativeTempoFromAI(data: any): NarrativeTempo {
    return {
      overallPace: data.overallPace || {
        speed: 'moderate',
        consistency: 'varied',
        energyLevel: 'building',
        tempoClassification: 'balanced'
      },
      tempoVariation: data.tempoVariation || {
        variationType: 'dynamic',
        changeFrequency: 'regular',
        intensityRange: 'wide',
        transitionStyle: 'smooth'
      },
      rhythmPattern: data.rhythmPattern || {
        baseRhythm: 'custom-pattern',
        rhythmElements: ['setup', 'development', 'climax', 'resolution'],
        patternComplexity: 'sophisticated',
        rhythmInnovations: []
      },
      breathingRoom: data.breathingRoom || {
        frequency: 'optimal',
        duration: 'perfectly-timed',
        placement: 'strategic',
        purpose: 'emotional-processing'
      },
      momentumBuilding: data.momentumBuilding || {
        buildingStrategy: 'strategic',
        accelerationPoints: ['key-moments'],
        peakManagement: 'masterful',
        sustainmentTechniques: ['engagement-tactics']
      }
    };
  }

  /**
   * Build tension curves from AI data
   */
  private static buildTensionCurvesFromAI(curves: any[]): TensionCurve[] {
    return curves.map((curve, index) => ({
      curveId: curve.id || `tension-curve-${index}`,
      curveName: curve.name || `Tension Curve ${index + 1}`,
      curveType: curve.type || 'story-element',
      startingTension: curve.startingTension || 2,
      peakTension: curve.peakTension || 8,
      endingTension: curve.endingTension || 3,
      tensionPattern: curve.pattern || 'building-climax-resolution',
      keyPoints: curve.keyPoints || [],
      reliefPoints: curve.reliefPoints || [],
      buildingTechniques: curve.buildingTechniques || ['gradual-escalation'],
      sustainmentMethods: curve.sustainmentMethods || ['maintained-stakes']
    }));
  }

  /**
   * Helper method to convert V2.0 context to legacy format
   */
  private static convertToLegacyPacingInputs(
    context: any,
    requirements: any,
    framework: PacingRhythmRecommendation
  ): any {
    return {
      premise: {
        id: `premise-${Date.now()}`,
        theme: context.targetAudience[0] || 'Audience engagement',
        premiseStatement: `${context.genre} ${context.medium} with ${requirements.rhythmicStyle} pacing`,
        character: 'Protagonist navigating temporal flow',
        conflict: 'Pacing vs engagement challenges',
        want: 'Optimal narrative rhythm',
        need: 'Audience psychological satisfaction',
        change: 'Temporal mastery development',
        result: requirements.emotionalJourney === 'extreme' ? 'Dynamic journey' : 'Satisfying progression'
      } as StoryPremise,
      
      characters: [
        {
          name: 'Pacing Protagonist',
          role: 'protagonist',
          backgroundStory: `Character experiencing ${context.genre} narrative rhythm`,
          internalConflicts: requirements.pacingObjectives,
          externalConflicts: ['Temporal constraints', 'Audience expectations']
        }
      ] as Character3D[],
      
      narrative: {
        title: context.projectTitle,
        macroStructure: requirements.rhythmicStyle === 'experimental' ? 'non-linear' : 'three-act',
        totalEpisodes: context.medium === 'series' ? 10 : 1,
        premise: `${context.genre} with ${requirements.rhythmicStyle} pacing approach`,
        theme: 'Temporal flow mastery',
        characterArc: 'Rhythm development journey'
      } as NarrativeArc,
      
      world: {
        id: `world-${Date.now()}`,
        description: `${context.genre} world optimized for ${requirements.rhythmicStyle} pacing`,
        premise: context.projectTitle
      } as WorldBlueprint,
      
      conflict: {
        id: `conflict-${Date.now()}`,
        name: 'Pacing Tension Architecture',
        conflictType: 'rhythm-vs-engagement'
      } as ConflictArchitecture,
      
      theme: {
        id: `theme-${Date.now()}`,
        title: 'Temporal Flow Mastery',
        description: 'Integration of pacing theory with narrative excellence'
      } as ThemeIntegrationBlueprint,
      
      genre: {
        id: context.genre,
        category: context.genre,
        definition: `${context.genre} genre conventions with ${requirements.rhythmicStyle} pacing`,
        coreElements: requirements.pacingObjectives
      } as GenreProfile,
      
      pacingRequirements: {
        targetAudience: context.targetAudience.includes('young') ? 'young-adult' : 'general',
        attentionSpan: context.medium === 'social-media' ? 'short' : 
                      context.medium === 'film' ? 'medium' : 'long',
        intensityPreference: requirements.emotionalJourney === 'extreme' ? 'extreme' :
                            requirements.emotionalJourney === 'dynamic' ? 'intense' : 'moderate',
        pacingStyle: requirements.rhythmicStyle === 'classical' ? 'traditional' :
                    requirements.rhythmicStyle === 'modern' ? 'modern' : 'experimental',
        engagementGoals: requirements.pacingObjectives
      } as PacingRequirements
    };
  }

  /**
   * Helper method to apply V2.0 framework enhancements to existing blueprint
   */
  private static applyPacingFrameworkToBlueprint(
    blueprint: PacingRhythmBlueprint,
    framework: PacingRhythmRecommendation
  ): PacingRhythmBlueprint {
    const enhancedBlueprint = { ...blueprint };
    
    // Add framework metadata
    (enhancedBlueprint as any).pacingFrameworkV2 = {
      frameworkVersion: 'PacingRhythmEngineV2',
      confidence: framework.primaryRecommendation.confidence,
      
      // Psychological Foundations
      psychologyFoundations: {
        cognitiveFramework: framework.primaryRecommendation.cognitiveFramework,
        pacingSpectrum: framework.primaryRecommendation.pacingSpectrum,
        physiologicalSync: framework.primaryRecommendation.cognitiveFramework.physiologicalSynchrony
      },
      
      // Musical Theory Application
      musicalFramework: {
        sonataForm: framework.primaryRecommendation.sonataForm,
        musicalTechniques: framework.primaryRecommendation.musicalTechniques,
        diagnosticTools: 'Musical vocabulary for precise pacing analysis'
      },
      
      // Beat Architecture
      beatArchitecture: {
        beatManagement: framework.primaryRecommendation.beatManagement,
        structuralTiming: framework.primaryRecommendation.structuralTiming,
        silenceFunction: 'Strategic pause placement and timing'
      },
      
      // Modern Media Adaptations
      modernAdaptations: {
        streamingFramework: framework.primaryRecommendation.streamingFramework,
        socialMediaFramework: framework.primaryRecommendation.socialMediaFramework,
        interactiveFramework: framework.primaryRecommendation.interactiveFramework
      },
      
      // Multi-Disciplinary Coordination
      productionCoordination: {
        murchRule: framework.primaryRecommendation.murchRule,
        departmentalAlignment: framework.primaryRecommendation.productionDepartments
      },
      
      // Strategic Guidance
      pacingStrategy: framework.pacingStrategy,
      implementationGuidance: framework.implementationGuidance,
      pacingCraft: framework.pacingCraft
    };
    
    // Enhance narrative tempo with V2.0 insights
    if (enhancedBlueprint.narrativeTempo) {
      (enhancedBlueprint.narrativeTempo as any).frameworkEnhancement = {
        psychologicalFoundation: framework.frameworkBreakdown.psychologicalMastery,
        musicalApplication: framework.frameworkBreakdown.structuralArchitecture,
        modernOptimization: framework.frameworkBreakdown.modernOptimization
      };
    }
    
    // Enhance story rhythm with musical theory
    if (enhancedBlueprint.storyRhythm) {
      (enhancedBlueprint.storyRhythm as any).v2Enhancement = {
        sonataFormApplication: framework.primaryRecommendation.sonataForm,
        musicalTechniques: framework.primaryRecommendation.musicalTechniques,
        beatHierarchy: framework.primaryRecommendation.beatManagement
      };
    }
    
    // Enhance tension curves with V2.0 psychology
    if (enhancedBlueprint.tensionCurves) {
      enhancedBlueprint.tensionCurves.forEach((curve: any) => {
        curve.frameworkGuidance = {
          cognitiveLoadManagement: framework.primaryRecommendation.cognitiveFramework.cognitiveLoadManagement,
          physiologicalSynchrony: framework.primaryRecommendation.cognitiveFramework.physiologicalSynchrony,
          genreSpecificRhythm: framework.primaryRecommendation.genrePacingFramework
        };
      });
    }
    
    // Enhance emotional pacing with V2.0 emotional journey mapping
    if (enhancedBlueprint.emotionalPacing) {
      (enhancedBlueprint.emotionalPacing as any).v2Framework = {
        emotionalProcessing: framework.primaryRecommendation.cognitiveFramework.cognitiveLoadManagement.emotionalProcessing,
        neurochemicalRewards: framework.primaryRecommendation.cognitiveFramework.cognitiveLoadManagement.neurochemicalReward,
        pacingSpectrum: framework.primaryRecommendation.pacingSpectrum
      };
    }
    
    return enhancedBlueprint;
  }
}

// ============================================================
// TYPE DEFINITIONS FOR PACING & RHYTHM SYSTEM
// ============================================================

export interface PacingRequirements {
  targetAudience: 'general' | 'young-adult' | 'adult' | 'literary' | 'commercial';
  attentionSpan: 'short' | 'medium' | 'long' | 'variable';
  intensityPreference: 'gentle' | 'moderate' | 'intense' | 'extreme';
  pacingStyle: 'traditional' | 'modern' | 'experimental' | 'genre-specific';
  engagementGoals: string[];
}

export interface ContextualPacing {
  previousScenePacing: string;
  upcomingScenePacing: string;
  actPosition: string;
  storyProgress: number;
  tensionLevel: number;
  emotionalState: string;
}

export interface AudienceData {
  demographicProfiles: DemographicProfile[];
  attentionPatterns: AttentionPattern[];
  engagementPreferences: EngagementPreference[];
  pacingFeedback: PacingFeedback[];
}

// Core structure types
export interface OverallPace {
  speed: string;
  consistency: string;
  energyLevel: string;
  tempoClassification: string;
}

export interface TempoVariation {
  variationType: string;
  changeFrequency: string;
  intensityRange: string;
  transitionStyle: string;
}

export interface RhythmPattern {
  baseRhythm: string;
  rhythmElements: string[];
  patternComplexity: string;
  rhythmInnovations: string[];
}

export interface BreathingRoom {
  frequency: string;
  duration: string;
  placement: string;
  purpose: string;
}

export interface MomentumBuilding {
  buildingStrategy: string;
  accelerationPoints: string[];
  peakManagement: string;
  sustainmentTechniques: string[];
}

export interface GlobalPacing {
  pacingPhilosophy: string;
  overallStrategy: string;
  pacingGoals: string[];
  balancingApproach: string;
}

export interface TempoProgression {
  progressionType: string;
  progressionCurve: string;
  milestonePoints: string[];
  evolutionPattern: string;
}

export interface ActPacing {
  actNumber: number;
  actPurpose: string;
  pacingStrategy: string;
  tempoCharacteristics: string;
  intensityProgression: string;
  keyRhythmElements: string[];
}

export interface TensionCurve {
  curveId: string;
  curveName: string;
  curveType: string;
  startingTension: number;
  peakTension: number;
  endingTension: number;
  tensionPattern: string;
  keyPoints: TensionPoint[];
  reliefPoints: ReliefPoint[];
  buildingTechniques: string[];
  sustainmentMethods: string[];
}

export interface TensionPoint {
  point: string;
  tension: number;
  description: string;
}

export interface ReliefPoint {
  point: string;
  tension: number;
  description: string;
}

// Additional comprehensive type definitions would continue...
// (Showing key examples for the extensive pacing system)

export type SceneType = 'action' | 'dialogue' | 'introspection' | 'revelation' | 'transition' | 'conflict' | 'resolution';
export type SceneLength = 'brief' | 'standard' | 'extended' | 'epic';
export type IntensityLevel = 'low' | 'moderate' | 'high' | 'extreme';

export interface SceneBeat {
  beatType: string;
  duration: string;
  intensity: number;
  purpose: string;
  techniques: string[];
}

export interface PacingStrategy {
  approach: string;
  techniques: string[];
  goals: string[];
  adaptations: string[];
}

export interface EmotionalPacing {
  emotionalFlow: string;
  moodProgression: string;
  catharticTiming: string;
  emotionalBeats: string[];
}

export interface AttentionManagement {
  attentionStrategy: string;
  engagementTactics: string[];
  focusDirection: string[];
  sustainmentMethods: string[];
}

export interface PacingAnalysis {
  overallEffectiveness: number;
  pacingPatterns: any;
  engagementAnalysis: any;
  problemAreas: string[];
  strengths: string[];
  improvements: string[];
  recommendations: string[];
} 
/**
 * The Pacing & Rhythm System - AI-Enhanced Master of Narrative Flow
 * 
 * This system controls the heartbeat of storytelling with AI-powered intelligence,
 * managing tension curves, emotional peaks, and the delicate art of timing that
 * keeps audiences completely engaged from beginning to end.
 * 
 * Key Principle: Pacing is the breath of story - when to accelerate, when to pause
 * 
 * ENHANCEMENT: Static pacing templates → AI-powered dynamic rhythm generation
 */

import { StoryPremise } from './premise-engine'
import { Character3D } from './character-engine'
import { NarrativeScene, NarrativeArc } from './fractal-narrative-engine'
import { DialogueExchange } from './strategic-dialogue-engine'
import { WorldBlueprint } from './world-building-engine'
import { ConflictArchitecture } from './conflict-architecture-engine'
import { ThemeIntegrationBlueprint } from './theme-integration-engine'
import { GenreProfile } from './genre-mastery-system'
import { generateContent } from './azure-openai'

// Core Pacing Architecture
export interface PacingRhythmBlueprint {
  id: string;
  name: string;
  pacingType: PacingType;
  
  // Overall Narrative Rhythm
  narrativeTempo: NarrativeTempo;
  storyRhythm: StoryRhythm;
  globalPacing: GlobalPacing;
  tempoProgression: TempoProgression;
  
  // Act-Level Pacing
  actPacing: ActPacing[];
  transitionRhythms: TransitionRhythm[];
  climaxBuilds: ClimaxBuild[];
  
  // Scene-Level Rhythm
  scenePacing: ScenePacing[];
  dialoguePacing: DialoguePacing[];
  actionPacing: ActionPacing[];
  introspectionPacing: IntrospectionPacing[];
  
  // Tension Management
  tensionCurves: TensionCurve[];
  pressurePoints: PressurePoint[];
  reliefMoments: ReliefMoment[];
  intensityWaves: IntensityWave[];
  
  // Emotional Flow
  emotionalPacing: EmotionalPacing;
  moodRhythms: MoodRhythm[];
  emotionalBeats: EmotionalBeat[];
  catharticMoments: CatharticMoment[];
  
  // Engagement Strategy
  attentionManagement: AttentionManagement;
  revealPacing: RevealPacing;
  informationFlow: InformationFlow;
  audienceEngagement: AudienceEngagement;
  
  // Genre-Specific Rhythm
  genreRhythmPatterns: GenreRhythmPattern[];
  pacingConventions: PacingConvention[];
  rhythmInnovations: RhythmInnovation[];
  
  // Quality Metrics
  pacingConsistency: PacingConsistencyMetrics;
  rhythmEffectiveness: RhythmEffectivenessMetrics;
  engagementPrediction: EngagementPredictionMetrics;
}

export type PacingType = 
  | 'action-thriller'        // Fast, relentless, high-energy
  | 'contemplative-drama'    // Slow, thoughtful, reflective
  | 'romantic-comedy'        // Light, bouncy, playful
  | 'psychological-horror'   // Building dread, calculated tension
  | 'epic-adventure'         // Varied, sweeping, heroic
  | 'mystery-suspense'       // Methodical reveals, mounting tension
  | 'literary-fiction'       // Nuanced, character-driven flow
  | 'fantasy-quest'          // Journey rhythm, escalating stakes
  | 'sci-fi-exploration'     // Discovery pacing, wonder beats
  | 'historical-saga'        // Generational flow, time passage
  | 'coming-of-age'         // Growth rhythm, milestone beats
  | 'family-drama'          // Intimate pacing, relationship focus
  | 'war-epic'              // Battle rhythm, quiet moments
  | 'crime-noir'            // Methodical investigation, dark beats
  | 'superhero-action'      // Power beats, heroic rhythm

export interface NarrativeTempo {
  overallPace: OverallPace;          // Story's general speed
  tempoVariation: TempoVariation;    // How pace changes
  rhythmPattern: RhythmPattern;      // Underlying beat structure
  breathingRoom: BreathingRoom;      // Moments of pause
  momentumBuilding: MomentumBuilding; // How energy accumulates
}

export interface StoryRhythm {
  openingTempo: string;              // How story begins
  risingActionRhythm: string;        // Building tension pattern
  climaxRhythm: string;              // Peak intensity flow
  fallingActionTempo: string;        // Resolution pacing
  conclusionRhythm: string;          // Ending tempo
  
  rhythmicPatterns: RhythmicPattern[]; // Repeating motifs
  tempoShifts: TempoShift[];         // Major pace changes
  pacingAnchors: PacingAnchor[];     // Key rhythm moments
}

// Scene-Level Pacing Control
export interface ScenePacing {
  sceneId: string;
  sceneType: SceneType;
  
  // Scene Rhythm
  openingBeat: SceneBeat;            // How scene starts
  developmentBeats: SceneBeat[];     // Scene progression
  climaxBeat: SceneBeat;             // Scene peak
  resolutionBeat: SceneBeat;         // Scene conclusion
  
  // Tempo Control
  sceneLength: SceneLength;          // Duration expectations
  intensityLevel: IntensityLevel;    // Energy requirements
  pacingStrategy: PacingStrategy;    // Flow approach
  tempoModulation: TempoModulation;  // Speed variations
  
  // Engagement Elements
  hookElements: HookElement[];       // Attention grabbers
  sustainmentTactics: SustainmentTactic[]; // Maintaining interest
  payoffMoments: PayoffMoment[];     // Satisfying beats
  
  // Integration
  characterPacing: CharacterPacing[]; // Character-specific tempo
  conflictPacing: ConflictPacing;    // Conflict development speed
  dialogueRhythm: DialogueRhythm;    // Conversation flow
  actionRhythm: ActionRhythm;        // Physical activity tempo
}

// The AI-Enhanced Pacing & Rhythm System
export class PacingRhythmSystem {
  
  /**
   * AI-ENHANCED: Generate comprehensive pacing & rhythm blueprint
   */
  static async generatePacingRhythmBlueprint(
    premise: StoryPremise,
    characters: Character3D[],
    narrative: NarrativeArc,
    world: WorldBlueprint,
    conflict: ConflictArchitecture,
    theme: ThemeIntegrationBlueprint,
    genre: GenreProfile,
    pacingRequirements?: PacingRequirements
  ): Promise<PacingRhythmBlueprint> {
    
    // AI-Enhanced: Analyze story for optimal pacing type
    const pacingType = await this.determinePacingTypeAI(premise, genre, conflict);
    
    // AI-Enhanced: Generate narrative tempo
    const narrativeTempo = await this.generateNarrativeTempoAI(
      premise, characters, narrative, genre
    );
    
    // AI-Enhanced: Create story rhythm pattern
    const storyRhythm = await this.generateStoryRhythmAI(
      narrative, conflict, theme, pacingType
    );
    
    // AI-Enhanced: Design global pacing strategy
    const globalPacing = await this.generateGlobalPacingAI(
      premise, narrative, genre, pacingRequirements
    );
    
    // AI-Enhanced: Create tempo progression
    const tempoProgression = await this.generateTempoProgressionAI(
      narrative, conflict, theme
    );
    
    // AI-Enhanced: Generate act-level pacing
    const actPacing = await this.generateActPacingAI(
      narrative, conflict, characters, pacingType
    );
    
    // AI-Enhanced: Create scene-level pacing
    const scenePacing = await this.generateScenePacingAI(
      narrative.scenes, characters, conflict, theme
    );
    
    // AI-Enhanced: Design tension curves
    const tensionCurves = await this.generateTensionCurvesAI(
      conflict, narrative, characters, pacingType
    );
    
    // AI-Enhanced: Create emotional pacing
    const emotionalPacing = await this.generateEmotionalPacingAI(
      characters, theme, narrative, genre
    );
    
    // AI-Enhanced: Design attention management
    const attentionManagement = await this.generateAttentionManagementAI(
      narrative, conflict, characters, genre
    );
    
    // AI-Enhanced: Create genre-specific rhythms
    const genreRhythmPatterns = await this.generateGenreRhythmPatternsAI(
      genre, pacingType, narrative
    );
    
    return {
      id: `pacing-rhythm-${Date.now()}`,
      name: `${premise.title} - Pacing & Rhythm`,
      pacingType,
      narrativeTempo,
      storyRhythm,
      globalPacing,
      tempoProgression,
      actPacing,
      transitionRhythms: await this.generateTransitionRhythmsAI(narrative, conflict),
      climaxBuilds: await this.generateClimaxBuildsAI(narrative, conflict, characters),
      scenePacing,
      dialoguePacing: await this.generateDialoguePacingAI(characters, narrative, theme),
      actionPacing: await this.generateActionPacingAI(narrative, conflict, genre),
      introspectionPacing: await this.generateIntrospectionPacingAI(characters, theme),
      tensionCurves,
      pressurePoints: await this.generatePressurePointsAI(conflict, narrative),
      reliefMoments: await this.generateReliefMomentsAI(narrative, characters, genre),
      intensityWaves: await this.generateIntensityWavesAI(conflict, narrative, pacingType),
      emotionalPacing,
      moodRhythms: await this.generateMoodRhythmsAI(theme, characters, narrative),
      emotionalBeats: await this.generateEmotionalBeatsAI(characters, conflict, theme),
      catharticMoments: await this.generateCatharticMomentsAI(narrative, conflict, theme),
      attentionManagement,
      revealPacing: await this.generateRevealPacingAI(narrative, conflict, characters),
      informationFlow: await this.generateInformationFlowAI(narrative, conflict, theme),
      audienceEngagement: await this.generateAudienceEngagementAI(genre, narrative, characters),
      genreRhythmPatterns,
      pacingConventions: await this.generatePacingConventionsAI(genre, pacingType),
      rhythmInnovations: await this.generateRhythmInnovationsAI(genre, narrative, conflict),
      pacingConsistency: await this.calculatePacingConsistencyMetricsAI(scenePacing, actPacing),
      rhythmEffectiveness: await this.calculateRhythmEffectivenessMetricsAI(tensionCurves, emotionalPacing),
      engagementPrediction: await this.calculateEngagementPredictionMetricsAI(attentionManagement, narrative)
    };
  }
  
  /**
   * AI-ENHANCED: Generate optimized scene pacing
   */
  static async generateOptimizedScenePacing(
    scene: NarrativeScene,
    characters: Character3D[],
    conflict: ConflictArchitecture,
    theme: ThemeIntegrationBlueprint,
    contextualPacing: ContextualPacing
  ): Promise<ScenePacing> {
    
    // AI-Enhanced: Determine scene type and requirements
    const sceneType = await this.determineSceneTypeAI(scene, conflict, theme);
    
    // AI-Enhanced: Generate scene beats
    const sceneBeats = await this.generateSceneBeatsAI(
      scene, characters, conflict, sceneType
    );
    
    // AI-Enhanced: Create tempo control
    const tempoControl = await this.generateTempoControlAI(
      scene, sceneType, contextualPacing
    );
    
    // AI-Enhanced: Design engagement elements
    const engagementElements = await this.generateEngagementElementsAI(
      scene, characters, conflict, theme
    );
    
    // AI-Enhanced: Create character-specific pacing
    const characterPacing = await this.generateCharacterPacingAI(
      characters, scene, conflict
    );
    
    return {
      sceneId: scene.sceneId,
      sceneType,
      openingBeat: sceneBeats.opening,
      developmentBeats: sceneBeats.development,
      climaxBeat: sceneBeats.climax,
      resolutionBeat: sceneBeats.resolution,
      sceneLength: tempoControl.length,
      intensityLevel: tempoControl.intensity,
      pacingStrategy: tempoControl.strategy,
      tempoModulation: tempoControl.modulation,
      hookElements: engagementElements.hooks,
      sustainmentTactics: engagementElements.sustainment,
      payoffMoments: engagementElements.payoffs,
      characterPacing,
      conflictPacing: await this.generateConflictPacingAI(scene, conflict),
      dialogueRhythm: await this.generateDialogueRhythmAI(scene, characters),
      actionRhythm: await this.generateActionRhythmAI(scene, conflict)
    };
  }
  
  /**
   * AI-ENHANCED: Analyze and optimize existing pacing
   */
  static async analyzePacingEffectiveness(
    narrative: NarrativeArc,
    blueprint: PacingRhythmBlueprint,
    audienceData?: AudienceData
  ): Promise<PacingAnalysis> {
    
    // AI-Enhanced: Analyze pacing patterns
    const pacingPatterns = await this.analyzePacingPatternsAI(
      narrative, blueprint
    );
    
    // AI-Enhanced: Evaluate engagement potential
    const engagementAnalysis = await this.analyzeEngagementPotentialAI(
      blueprint, audienceData
    );
    
    // AI-Enhanced: Identify improvement opportunities
    const improvements = await this.identifyPacingImprovementsAI(
      narrative, blueprint, pacingPatterns
    );
    
    return {
      overallEffectiveness: await this.calculateOverallEffectivenessAI(pacingPatterns),
      pacingPatterns,
      engagementAnalysis,
      problemAreas: await this.identifyProblemAreasAI(pacingPatterns),
      strengths: await this.identifyPacingStrengthsAI(pacingPatterns),
      improvements,
      recommendations: await this.generatePacingRecommendationsAI(improvements, narrative)
    };
  }

  // ============================================================
  // AI-ENHANCED GENERATION METHODS
  // ============================================================

  /**
   * AI-ENHANCED: Determine optimal pacing type for story
   */
  private static async determinePacingTypeAI(
    premise: StoryPremise,
    genre: GenreProfile,
    conflict: ConflictArchitecture
  ): Promise<PacingType> {
    const prompt = `Determine the optimal pacing type for this story:

PREMISE: "${premise.premiseStatement}"
GENRE: ${genre.name}
CONFLICT TYPE: ${conflict.conflictCore.centralQuestion}
CONFLICT INTENSITY: ${conflict.escalationArchitecture?.overallProgression || 'Building'}

Analyze the story requirements and recommend the best pacing type:

PACING TYPES:
1. action-thriller - Fast, relentless, high-energy
2. contemplative-drama - Slow, thoughtful, reflective
3. romantic-comedy - Light, bouncy, playful
4. psychological-horror - Building dread, calculated tension
5. epic-adventure - Varied, sweeping, heroic
6. mystery-suspense - Methodical reveals, mounting tension
7. literary-fiction - Nuanced, character-driven flow
8. fantasy-quest - Journey rhythm, escalating stakes
9. sci-fi-exploration - Discovery pacing, wonder beats
10. historical-saga - Generational flow, time passage
11. coming-of-age - Growth rhythm, milestone beats
12. family-drama - Intimate pacing, relationship focus
13. war-epic - Battle rhythm, quiet moments
14. crime-noir - Methodical investigation, dark beats
15. superhero-action - Power beats, heroic rhythm

Consider:
- Genre expectations and conventions
- Conflict intensity and type
- Character arc requirements
- Thematic depth needs
- Audience engagement goals

Return the most appropriate pacing type with brief justification.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in narrative pacing and story rhythm. Select optimal pacing types.',
        temperature: 0.6,
        maxTokens: 400
      });

      const pacingData = JSON.parse(result || '{}');
      
      if (pacingData.pacingType) {
        return pacingData.pacingType as PacingType;
      }
      
      return this.determinePacingTypeFallback(premise, genre);
    } catch (error) {
      console.warn('AI pacing type determination failed, using fallback:', error);
      return this.determinePacingTypeFallback(premise, genre);
    }
  }

  /**
   * AI-ENHANCED: Generate narrative tempo with intelligent analysis
   */
  private static async generateNarrativeTempoAI(
    premise: StoryPremise,
    characters: Character3D[],
    narrative: NarrativeArc,
    genre: GenreProfile
  ): Promise<NarrativeTempo> {
    const prompt = `Create the narrative tempo for this story:

PREMISE: "${premise.premiseStatement}"
GENRE: ${genre.name}
CHARACTER COUNT: ${characters.length}
STORY ARC: ${narrative.arcType}
EPISODES: ${narrative.episodes.length}

Design the overall narrative tempo:

1. OVERALL PACE: The story's general speed and energy level
2. TEMPO VARIATION: How the pace changes throughout
3. RHYTHM PATTERN: Underlying beat structure and flow
4. BREATHING ROOM: Moments of pause and reflection
5. MOMENTUM BUILDING: How energy accumulates and releases

Consider:
- Genre pacing conventions
- Character development needs
- Plot complexity requirements
- Emotional journey pacing
- Audience attention spans

Create a comprehensive tempo that serves the story perfectly.

Return detailed narrative tempo analysis.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in narrative tempo and story pacing. Create effective story rhythms.',
        temperature: 0.7,
        maxTokens: 800
      });

      const tempoData = JSON.parse(result || '{}');
      
      if (tempoData.overallPace && tempoData.rhythmPattern) {
        return this.buildNarrativeTempoFromAI(tempoData);
      }
      
      return this.generateNarrativeTempoFallback(premise, genre);
    } catch (error) {
      console.warn('AI narrative tempo generation failed, using fallback:', error);
      return this.generateNarrativeTempoFallback(premise, genre);
    }
  }

  /**
   * AI-ENHANCED: Generate tension curves with precise control
   */
  private static async generateTensionCurvesAI(
    conflict: ConflictArchitecture,
    narrative: NarrativeArc,
    characters: Character3D[],
    pacingType: PacingType
  ): Promise<TensionCurve[]> {
    const prompt = `Create tension curves for this story:

CONFLICT CORE: ${conflict.conflictCore.centralQuestion}
ESCALATION: ${conflict.escalationArchitecture?.overallProgression || 'Building'}
PACING TYPE: ${pacingType}
STORY LENGTH: ${narrative.episodes.length} episodes
MAIN CHARACTERS: ${characters.slice(0, 3).map(c => c.name).join(', ')}

Design tension curves that include:

1. OVERALL TENSION ARC: Story-wide tension progression
2. ACT TENSION CURVES: Tension within each major story section
3. EPISODE TENSION PATTERNS: Individual episode tension flow
4. CHARACTER TENSION ARCS: Personal stakes and pressure
5. CONFLICT TENSION WAVES: Specific conflict escalation patterns

For each curve, specify:
- Starting tension level (1-10)
- Peak tension moments
- Relief/release points
- Building patterns
- Resolution approaches

Create multiple overlapping curves that work together for maximum impact.

Return comprehensive tension curve analysis.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in tension management and dramatic pacing. Create effective tension curves.',
        temperature: 0.7,
        maxTokens: 1000
      });

      const tensionData = JSON.parse(result || '{}');
      
      if (tensionData.curves && Array.isArray(tensionData.curves)) {
        return this.buildTensionCurvesFromAI(tensionData.curves);
      }
      
      return this.generateTensionCurvesFallback(conflict, narrative);
    } catch (error) {
      console.warn('AI tension curve generation failed, using fallback:', error);
      return this.generateTensionCurvesFallback(conflict, narrative);
    }
  }

  // ============================================================
  // FALLBACK METHODS
  // ============================================================

  /**
   * Fallback pacing type determination
   */
  private static determinePacingTypeFallback(premise: StoryPremise, genre: GenreProfile): PacingType {
    const genreName = genre.name.toLowerCase();
    
    if (genreName.includes('action') || genreName.includes('thriller')) {
      return 'action-thriller';
    } else if (genreName.includes('romance') && genreName.includes('comedy')) {
      return 'romantic-comedy';
    } else if (genreName.includes('horror') || genreName.includes('psychological')) {
      return 'psychological-horror';
    } else if (genreName.includes('mystery') || genreName.includes('suspense')) {
      return 'mystery-suspense';
    } else if (genreName.includes('fantasy') || genreName.includes('adventure')) {
      return 'epic-adventure';
    } else if (genreName.includes('sci-fi') || genreName.includes('science')) {
      return 'sci-fi-exploration';
    } else if (genreName.includes('drama')) {
      return 'contemplative-drama';
    } else {
      return 'literary-fiction';
    }
  }

  /**
   * Fallback narrative tempo generation
   */
  private static generateNarrativeTempoFallback(premise: StoryPremise, genre: GenreProfile): NarrativeTempo {
    return {
      overallPace: {
        speed: 'moderate',
        consistency: 'varied',
        energyLevel: 'building',
        tempoClassification: 'balanced'
      },
      tempoVariation: {
        variationType: 'episodic',
        changeFrequency: 'regular',
        intensityRange: 'moderate',
        transitionStyle: 'smooth'
      },
      rhythmPattern: {
        baseRhythm: 'three-act-structure',
        rhythmElements: ['setup', 'development', 'payoff'],
        patternComplexity: 'standard',
        rhythmInnovations: []
      },
      breathingRoom: {
        frequency: 'regular',
        duration: 'appropriate',
        placement: 'after-intensity',
        purpose: 'reflection-and-processing'
      },
      momentumBuilding: {
        buildingStrategy: 'incremental',
        accelerationPoints: ['act-breaks', 'conflict-escalations'],
        peakManagement: 'controlled',
        sustainmentTechniques: ['character-investment', 'plot-momentum']
      }
    };
  }

  /**
   * Fallback tension curves generation
   */
  private static generateTensionCurvesFallback(
    conflict: ConflictArchitecture,
    narrative: NarrativeArc
  ): TensionCurve[] {
    return [
      {
        curveId: 'overall-story-tension',
        curveName: 'Main Story Tension',
        curveType: 'story-wide',
        startingTension: 2,
        peakTension: 9,
        endingTension: 3,
        tensionPattern: 'rising-action-climax-resolution',
        keyPoints: [
          { point: 'opening-hook', tension: 3, description: 'Initial engagement' },
          { point: 'inciting-incident', tension: 5, description: 'Story begins' },
          { point: 'midpoint', tension: 7, description: 'Major escalation' },
          { point: 'climax', tension: 9, description: 'Peak conflict' },
          { point: 'resolution', tension: 3, description: 'Peaceful conclusion' }
        ],
        reliefPoints: [
          { point: 'character-moments', tension: 4, description: 'Breathing room' },
          { point: 'humor-beats', tension: 3, description: 'Tension relief' }
        ],
        buildingTechniques: ['mystery', 'stakes-escalation', 'time-pressure'],
        sustainmentMethods: ['character-investment', 'plot-momentum']
      }
    ];
  }

  /**
   * Build narrative tempo from AI data
   */
  private static buildNarrativeTempoFromAI(data: any): NarrativeTempo {
    return {
      overallPace: data.overallPace || {
        speed: 'moderate',
        consistency: 'varied',
        energyLevel: 'building',
        tempoClassification: 'balanced'
      },
      tempoVariation: data.tempoVariation || {
        variationType: 'dynamic',
        changeFrequency: 'regular',
        intensityRange: 'wide',
        transitionStyle: 'smooth'
      },
      rhythmPattern: data.rhythmPattern || {
        baseRhythm: 'custom-pattern',
        rhythmElements: ['setup', 'development', 'climax', 'resolution'],
        patternComplexity: 'sophisticated',
        rhythmInnovations: []
      },
      breathingRoom: data.breathingRoom || {
        frequency: 'optimal',
        duration: 'perfectly-timed',
        placement: 'strategic',
        purpose: 'emotional-processing'
      },
      momentumBuilding: data.momentumBuilding || {
        buildingStrategy: 'strategic',
        accelerationPoints: ['key-moments'],
        peakManagement: 'masterful',
        sustainmentTechniques: ['engagement-tactics']
      }
    };
  }

  /**
   * Build tension curves from AI data
   */
  private static buildTensionCurvesFromAI(curves: any[]): TensionCurve[] {
    return curves.map((curve, index) => ({
      curveId: curve.id || `tension-curve-${index}`,
      curveName: curve.name || `Tension Curve ${index + 1}`,
      curveType: curve.type || 'story-element',
      startingTension: curve.startingTension || 2,
      peakTension: curve.peakTension || 8,
      endingTension: curve.endingTension || 3,
      tensionPattern: curve.pattern || 'building-climax-resolution',
      keyPoints: curve.keyPoints || [],
      reliefPoints: curve.reliefPoints || [],
      buildingTechniques: curve.buildingTechniques || ['gradual-escalation'],
      sustainmentMethods: curve.sustainmentMethods || ['maintained-stakes']
    }));
  }
}

// ============================================================
// TYPE DEFINITIONS FOR PACING & RHYTHM SYSTEM
// ============================================================

export interface PacingRequirements {
  targetAudience: 'general' | 'young-adult' | 'adult' | 'literary' | 'commercial';
  attentionSpan: 'short' | 'medium' | 'long' | 'variable';
  intensityPreference: 'gentle' | 'moderate' | 'intense' | 'extreme';
  pacingStyle: 'traditional' | 'modern' | 'experimental' | 'genre-specific';
  engagementGoals: string[];
}

export interface ContextualPacing {
  previousScenePacing: string;
  upcomingScenePacing: string;
  actPosition: string;
  storyProgress: number;
  tensionLevel: number;
  emotionalState: string;
}

export interface AudienceData {
  demographicProfiles: DemographicProfile[];
  attentionPatterns: AttentionPattern[];
  engagementPreferences: EngagementPreference[];
  pacingFeedback: PacingFeedback[];
}

// Core structure types
export interface OverallPace {
  speed: string;
  consistency: string;
  energyLevel: string;
  tempoClassification: string;
}

export interface TempoVariation {
  variationType: string;
  changeFrequency: string;
  intensityRange: string;
  transitionStyle: string;
}

export interface RhythmPattern {
  baseRhythm: string;
  rhythmElements: string[];
  patternComplexity: string;
  rhythmInnovations: string[];
}

export interface BreathingRoom {
  frequency: string;
  duration: string;
  placement: string;
  purpose: string;
}

export interface MomentumBuilding {
  buildingStrategy: string;
  accelerationPoints: string[];
  peakManagement: string;
  sustainmentTechniques: string[];
}

export interface GlobalPacing {
  pacingPhilosophy: string;
  overallStrategy: string;
  pacingGoals: string[];
  balancingApproach: string;
}

export interface TempoProgression {
  progressionType: string;
  progressionCurve: string;
  milestonePoints: string[];
  evolutionPattern: string;
}

export interface ActPacing {
  actNumber: number;
  actPurpose: string;
  pacingStrategy: string;
  tempoCharacteristics: string;
  intensityProgression: string;
  keyRhythmElements: string[];
}

export interface TensionCurve {
  curveId: string;
  curveName: string;
  curveType: string;
  startingTension: number;
  peakTension: number;
  endingTension: number;
  tensionPattern: string;
  keyPoints: TensionPoint[];
  reliefPoints: ReliefPoint[];
  buildingTechniques: string[];
  sustainmentMethods: string[];
}

export interface TensionPoint {
  point: string;
  tension: number;
  description: string;
}

export interface ReliefPoint {
  point: string;
  tension: number;
  description: string;
}

// Additional comprehensive type definitions would continue...
// (Showing key examples for the extensive pacing system)

export type SceneType = 'action' | 'dialogue' | 'introspection' | 'revelation' | 'transition' | 'conflict' | 'resolution';
export type SceneLength = 'brief' | 'standard' | 'extended' | 'epic';
export type IntensityLevel = 'low' | 'moderate' | 'high' | 'extreme';

export interface SceneBeat {
  beatType: string;
  duration: string;
  intensity: number;
  purpose: string;
  techniques: string[];
}

export interface PacingStrategy {
  approach: string;
  techniques: string[];
  goals: string[];
  adaptations: string[];
}

export interface EmotionalPacing {
  emotionalFlow: string;
  moodProgression: string;
  catharticTiming: string;
  emotionalBeats: string[];
}

export interface AttentionManagement {
  attentionStrategy: string;
  engagementTactics: string[];
  focusDirection: string[];
  sustainmentMethods: string[];
}

export interface PacingAnalysis {
  overallEffectiveness: number;
  pacingPatterns: any;
  engagementAnalysis: any;
  problemAreas: string[];
  strengths: string[];
  improvements: string[];
  recommendations: string[];
} 