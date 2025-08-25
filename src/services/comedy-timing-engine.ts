/**
 * The Comedy Timing Engine - AI-Enhanced Master of Mathematical Humor
 * 
 * This system brings scientific precision to comedy, understanding humor psychology,
 * managing comedic timing, orchestrating setup-punchline relationships, and ensuring
 * comedy serves story rather than derailing it.
 * 
 * Key Principle: Comedy is mathematics made emotional - timing, surprise, and truth collide
 * 
 * ENHANCEMENT: Template-based generation → AI-powered humor creation
 */

import { StoryPremise } from './premise-engine'
import { Character3D } from './character-engine'
import { NarrativeScene } from './fractal-narrative-engine'
import { DialogueExchange } from './strategic-dialogue-engine'
import { TensionStrategy } from './tension-escalation-engine'
import { WorldBlueprint } from './world-building-engine'
import { GenreProfile } from './genre-mastery-system'
import { generateContent } from './azure-openai'
import { ComedyTimingEngineV2, type ComedyTimingRecommendation } from './comedy-timing-engine-v2'

// Core Comedy Architecture
export interface ComedyBlueprint {
  id: string;
  name: string;
  comedyType: ComedyType;
  
  // Humor Mathematics
  humorFormula: HumorFormula;
  timingMechanics: TimingMechanics;
  surpriseArchitecture: SurpriseArchitecture;
  truthResonance: TruthResonance;
  
  // Comedy Structures
  setupPayoffPairs: SetupPayoffPair[];
  comedicRhythms: ComedyRhythm[];
  humorEscalation: HumorEscalation;
  comedyRelease: ComedyRelease;
  
  // Character Comedy
  characterHumor: CharacterHumor[];
  comedicVoices: ComedyVoice[];
  humorPersonalities: HumorPersonality[];
  
  // Story Integration
  premiseService: ComedyPremiseService;
  narrativeBalance: NarrativeBalance;
  tensionRelief: TensionRelief;
  genreHarmony: GenreHarmony;
  
  // Audience Psychology
  audienceProfile: AudienceProfile;
  humorResonance: HumorResonance;
  comedyImpact: ComedyImpact;
  
  // Quality Metrics
  comedyMetrics: ComedyMetrics;
  timingPrecision: TimingPrecision;
  humorAuthenticity: HumorAuthenticity;
}

export type ComedyType = 
  | 'slapstick' | 'wit' | 'satire' | 'parody' | 'irony' | 'wordplay'
  | 'situational' | 'character-driven' | 'observational' | 'absurd'
  | 'dark-comedy' | 'romantic-comedy' | 'action-comedy' | 'horror-comedy'

// Humor Mathematics System
export interface HumorFormula {
  // Core Comedy Equation: Setup + Surprise + Truth = Humor
  setupComponent: SetupComponent;
  surpriseComponent: SurpriseComponent;
  truthComponent: TruthComponent;
  
  // Timing Variables
  setupDuration: number;        // How long to establish setup
  pauseLength: number;          // Beat before punchline
  deliverySpeed: number;        // Punchline delivery timing
  recoveryTime: number;         // Time for audience reaction
  
  // Amplification Factors
  relatabilityMultiplier: number;    // How much audience connects
  unexpectednessBonus: number;       // Surprise factor boost
  characterConsistency: number;      // Humor fits character
  contextualRelevance: number;       // Humor serves story
  
  // Diminishing Returns
  repetitionPenalty: number;         // Comedy fatigue factor
  oversaturationRisk: number;        // Too much comedy risk
  audienceFamiliarity: number;       // Predictability penalty
}

export interface SetupComponent {
  establishment: string;           // What expectation is created
  misdirection: string;           // How audience is led astray
  implantedAssumption: string;    // What audience believes
  setupIntensity: number;         // How strongly setup is established
  setupSubtlety: number;          // How obvious the setup is
  setupDuration: number;          // Time to establish
}

export interface SurpriseComponent {
  expectationSubversion: string;   // How expectation is violated
  surpriseIntensity: number;       // Magnitude of surprise
  surpriseLogic: string;          // Why surprise makes sense
  surpriseDelay: number;          // Optimal timing for reveal
  foreshadowingClues: string[];   // Hints that make surprise fair
}

export interface TruthComponent {
  universalTruth: string;         // What human truth is revealed
  characterTruth: string;         // What this reveals about character
  situationalTruth: string;       // What this says about situation
  emotionalResonance: number;     // How much truth resonates
  insightDepth: number;           // Profundity of the truth
}

// Timing Mechanics System
export interface TimingMechanics {
  // Comedy Rhythms
  primaryRhythm: ComedyRhythm;
  secondaryRhythms: ComedyRhythm[];
  rhythmVariation: RhythmVariation[];
  
  // Beat Management
  comedyBeats: ComedyBeat[];
  beatSpacing: BeatSpacing;
  beatIntensity: BeatIntensity[];
  
  // Pause Dynamics
  comedicPauses: ComedyPause[];
  pauseTiming: PauseTiming;
  audienceAnticipation: AnticipationCurve;
  
  // Delivery Mechanics
  deliveryStyles: DeliveryStyle[];
  characterTiming: CharacterTiming[];
  ensembleRhythm: EnsembleRhythm;
}

export interface ComedyRhythm {
  pattern: string;                // E.g., "setup-setup-punchline"
  tempo: number;                  // Beats per minute equivalent
  variation: number;              // How much rhythm can vary
  buildingIntensity: boolean;     // Does rhythm accelerate
  naturalPauses: number[];        // Where natural breaks occur
  audienceBreathing: number[];    // Where audience needs recovery
}

export interface ComedyBeat {
  type: BeatType;
  timing: number;                 // When in sequence this occurs
  intensity: number;              // How funny this beat is
  setup: boolean;                 // Is this establishing setup
  payoff: boolean;                // Is this delivering punchline
  callback: boolean;              // Does this reference earlier joke
  escalation: boolean;            // Does this build on previous
}

export type BeatType = 
  | 'setup' | 'misdirection' | 'callback' | 'punchline' | 'topper'
  | 'runner' | 'plant' | 'payoff' | 'escalation' | 'deflation'

// Setup-Punchline Architecture
export interface SetupPayoffPair {
  id: string;
  setupMoment: SetupMoment;
  payoffMoment: PayoffMoment;
  
  // Relationship Dynamics
  separationDistance: number;      // Time/space between setup and payoff
  connectionStrength: number;      // How clearly linked they are
  surpriseFactor: number;         // How unexpected the payoff is
  satisfactionLevel: number;      // How rewarding the payoff feels
  
  // Story Integration
  plotRelevance: number;          // How much this serves story
  characterGrowth: string;        // What this reveals about character
  themeReinforcement: string;     // How this supports theme
  
  // Callback Potential
  repeatability: number;          // Can this be referenced again
  escalationPotential: number;    // Can this be built upon
  runningGagPotential: number;    // Can this become recurring
}

export interface SetupMoment {
  content: string;
  location: string;               // Where in story this occurs
  establishmentMethod: string;    // How setup is planted
  subtlety: number;              // How obvious the setup is
  audienceAwareness: number;     // How much audience notices
  foreshadowing: string[];       // Clues that support setup
}

export interface PayoffMoment {
  content: string;
  location: string;               // Where payoff occurs
  deliveryMethod: string;         // How punchline is delivered
  surpriseLevel: number;          // How unexpected this is
  satisfactionLevel: number;      // How rewarding this feels
  characterReaction: string[];    // How characters respond
}

// Character Comedy System
export interface CharacterHumor {
  character: Character3D;
  humorStyle: HumorStyle;
  comedyRole: ComedyRole;
  
  // Humor Personality
  humorPersonality: HumorPersonality;
  comedyTiming: CharacterTiming;
  humorRange: HumorRange;
  
  // Comedy Relationships
  comedyPartners: ComedyPartnership[];
  straightManDynamic: StraightManDynamic;
  ensembleFunction: EnsembleFunction;
  
  // Character Growth Through Comedy
  humorEvolution: HumorEvolution;
  comedyArcs: ComedyArc[];
  humorChallenges: HumorChallenge[];
}

export type HumorStyle = 
  | 'deadpan' | 'animated' | 'self-deprecating' | 'observational'
  | 'physical' | 'verbal' | 'improvisational' | 'methodical'
  | 'sarcastic' | 'innocent' | 'manic' | 'laid-back'

export type ComedyRole = 
  | 'comic-relief' | 'straight-man' | 'comic-protagonist' | 'comedic-antagonist'
  | 'ensemble-player' | 'comedic-mentor' | 'humor-catalyst' | 'reaction-character'

export interface HumorPersonality {
  primaryStyle: HumorStyle;
  secondaryStyles: HumorStyle[];
  humorTriggers: string[];        // What makes them funny
  comedyDefenses: string[];       // How they use humor defensively
  humorVulnerabilities: string[]; // What they can't joke about
  comedyGrowth: string;          // How their humor evolves
}

// Comedy Timing Engine - Master Orchestrator
export class ComedyTimingEngine {
  
  /**
   * V2.0 ENHANCED: Generates comprehensive comedy blueprint using advanced psychological frameworks
   */
  static async generateEnhancedComedyBlueprint(
    context: {
      projectTitle: string;
      genre: 'comedy' | 'dramedy' | 'action-comedy' | 'horror-comedy' | 'romantic-comedy' | 'workplace-comedy';
      medium: 'film' | 'television' | 'stand-up' | 'sketch' | 'digital' | 'stage';
      targetAudience: string;
      culturalContext: string;
      humorStyle: string;
      comedyObjectives: string[];
      tonalRequirements: string[];
    },
    requirements: {
      humorIntensity: 'subtle' | 'moderate' | 'bold' | 'outrageous';
      timingComplexity: 'simple' | 'moderate' | 'sophisticated';
      culturalSensitivity: 'standard' | 'high' | 'expert';
      audienceEngagement: 'passive' | 'interactive' | 'participatory';
      deliveryStyle: 'conversational' | 'theatrical' | 'cinematic' | 'digital-native';
      socialCommentary: boolean;
    },
    options: {
      bergsonApproach?: boolean;
      freudianRelease?: boolean;
      benignViolation?: boolean;
      culturalAdaptation?: boolean;
      genreSubversion?: boolean;
      modernOptimization?: boolean;
    } = {}
  ): Promise<{ blueprint: ComedyBlueprint; comedyFramework: ComedyTimingRecommendation }> {
    try {
      // Generate V2.0 Comedy Framework
      const comedyFramework = await ComedyTimingEngineV2.generateComedyRecommendation(
        context,
        requirements,
        options
      );
      
      // Convert V2.0 context to legacy format
      const legacyContext = this.convertToLegacyComedyContext(
        context,
        requirements,
        comedyFramework
      );
      
      // Generate enhanced blueprint using V2.0 insights
      const blueprint = await this.generateComedyBlueprint(
        legacyContext.premise,
        legacyContext.characters,
        legacyContext.world,
        legacyContext.genre,
        legacyContext.comedyLevel,
        legacyContext.audienceType
      );
      
      // Apply V2.0 framework enhancements to blueprint
      const enhancedBlueprint = this.applyComedyFrameworkToBlueprint(
        blueprint,
        comedyFramework
      );
      
      return {
        blueprint: enhancedBlueprint,
        comedyFramework
      };
    } catch (error) {
      console.error('Error generating enhanced comedy blueprint:', error);
      throw error;
    }
  }

  /**
   * AI-ENHANCED: Generates a comprehensive comedy blueprint for the story
   */
  static async generateComedyBlueprint(
    premise: StoryPremise,
    characters: Character3D[],
    worldBlueprint: WorldBlueprint,
    genre: GenreProfile,
    comedyLevel: ComedyLevel = 'moderate',
    audienceType: AudienceType = 'general'
  ): Promise<ComedyBlueprint> {
    
    // AI-Enhanced: Analyze story requirements for comedy
    const comedyRequirements = await this.analyzeComedyRequirementsAI(
      premise, characters, worldBlueprint, genre
    );
    
    // AI-Enhanced: Determine optimal comedy type
    const comedyType = await this.determineComedyTypeAI(
      genre, comedyRequirements, audienceType, premise
    );
    
    // AI-Enhanced: Generate humor mathematics
    const humorFormula = await this.generateHumorFormulaAI(
      comedyType, characters, premise, comedyLevel
    );
    
    // AI-Enhanced: Create timing mechanics
    const timingMechanics = await this.generateTimingMechanicsAI(
      comedyType, humorFormula, comedyLevel, characters
    );
    
    // AI-Enhanced: Build setup-payoff architecture
    const setupPayoffPairs = await this.generateSetupPayoffPairsAI(
      characters, premise, comedyRequirements, comedyType
    );
    
    // AI-Enhanced: Develop character comedy
    const characterHumor = await this.generateCharacterHumorAI(
      characters, comedyType, premise, comedyLevel
    );
    
    // AI-Enhanced: Create comedy rhythms
    const comedicRhythms = await this.generateComedyRhythmsAI(
      timingMechanics, characterHumor, comedyLevel, premise
    );
    
    // AI-Enhanced: Establish story integration
    const storyIntegration = await this.integrateComedyWithStoryAI(
      premise, characters, setupPayoffPairs, characterHumor
    );
    
    // Validate comedy quality
    const qualityMetrics = this.validateComedyQuality(
      humorFormula, timingMechanics, characterHumor, storyIntegration
    );
    
    return {
      id: `comedy-${Date.now()}`,
      name: `${comedyType} Comedy System`,
      comedyType,
      
      humorFormula,
      timingMechanics,
      surpriseArchitecture: await this.generateSurpriseArchitectureAI(setupPayoffPairs, premise),
      truthResonance: await this.generateTruthResonanceAI(premise, characterHumor),
      
      setupPayoffPairs,
      comedicRhythms,
      humorEscalation: await this.generateHumorEscalationAI(comedicRhythms, premise),
      comedyRelease: await this.generateComedyReleaseAI(timingMechanics, comedyLevel),
      
      characterHumor,
      comedicVoices: await this.generateComedyVoicesAI(characterHumor, premise),
      humorPersonalities: characterHumor.map(ch => ch.humorPersonality),
      
      premiseService: storyIntegration.premiseService,
      narrativeBalance: storyIntegration.narrativeBalance,
      tensionRelief: storyIntegration.tensionRelief,
      genreHarmony: storyIntegration.genreHarmony,
      
      audienceProfile: await this.generateAudienceProfileAI(audienceType, premise),
      humorResonance: await this.calculateHumorResonanceAI(humorFormula, audienceType, premise),
      comedyImpact: await this.predictComedyImpactAI(qualityMetrics, audienceType),
      
      comedyMetrics: qualityMetrics.comedy,
      timingPrecision: qualityMetrics.timing,
      humorAuthenticity: qualityMetrics.authenticity
    };
  }
  
  /**
   * AI-ENHANCED: Applies comedy timing to specific scenes
   */
  static async applyComedyTiming(
    scene: NarrativeScene,
    comedyBlueprint: ComedyBlueprint,
    characters: Character3D[],
    tensionState: TensionStrategy
  ): Promise<ComedySceneApplication> {
    
    // AI-Enhanced: Identify comedy opportunities in scene
    const comedyOpportunities = await this.identifyComedyOpportunitiesAI(
      scene, characters, comedyBlueprint
    );
    
    // AI-Enhanced: Select appropriate comedy techniques
    const selectedTechniques = await this.selectComedyTechniquesAI(
      comedyOpportunities, comedyBlueprint, tensionState
    );
    
    // AI-Enhanced: Generate comedy beats for scene
    const comedyBeats = await this.generateSceneComedyBeatsAI(
      scene, selectedTechniques, comedyBlueprint, characters
    );
    
    // Calculate optimal timing
    const timingCalculations = this.calculateOptimalTiming(
      comedyBeats, comedyBlueprint.timingMechanics
    );
    
    // AI-Enhanced: Apply humor formula
    const humorApplication = await this.applyHumorFormulaAI(
      comedyBeats, comedyBlueprint.humorFormula, characters, scene
    );
    
    // AI-Enhanced: Integrate with dialogue
    const dialogueIntegration = await this.integrateComedyWithDialogueAI(
      comedyBeats, characters, comedyBlueprint, scene
    );
    
    return {
      scene,
      comedyOpportunities,
      selectedTechniques,
      comedyBeats,
      timingCalculations,
      humorApplication,
      dialogueIntegration,
      expectedLaughter: await this.predictLaughterResponseAI(humorApplication, comedyBlueprint),
      storyImpact: await this.assessComedyStoryImpactAI(humorApplication, scene)
    };
  }
  
  /**
   * AI-ENHANCED: Generates character-specific comedy dialogue
   */
  static async generateComedyDialogue(
    character: Character3D,
    characterHumor: CharacterHumor,
    dialogueContext: DialogueContext,
    comedyBlueprint: ComedyBlueprint,
    setupPayoffPair?: SetupPayoffPair
  ): Promise<ComedyDialogue> {
    
    // AI-Enhanced: Analyze character's humor style
    const humorStyle = await this.analyzeCharacterHumorStyleAI(
      character, characterHumor
    );
    
    // AI-Enhanced: Generate comedy content
    const comedyContent = await this.generateComedyContentAI(
      character, dialogueContext, humorStyle, setupPayoffPair, comedyBlueprint
    );
    
    // Apply timing mechanics
    const timingApplication = this.applyDialogueTimingMechanics(
      comedyContent, comedyBlueprint.timingMechanics, character
    );
    
    // Calculate humor formula
    const humorCalculation = this.calculateDialogueHumorFormula(
      comedyContent, comedyBlueprint.humorFormula, character
    );
    
    // AI-Enhanced: Generate delivery instructions
    const deliveryInstructions = await this.generateDeliveryInstructionsAI(
      timingApplication, humorCalculation, characterHumor, comedyContent
    );
    
    return {
      character,
      comedyContent,
      timingApplication,
      humorCalculation,
      deliveryInstructions,
      expectedReaction: await this.predictCharacterReactionAI(comedyContent, character),
      audienceResponse: await this.predictAudienceResponseAI(humorCalculation, comedyBlueprint)
    };
  }
  
  /**
   * Manages comedy integration with tension and pacing
   */
  static manageComedyTensionBalance(
    comedyBlueprint: ComedyBlueprint,
    tensionState: TensionStrategy,
    narrativeContext: NarrativeContext
  ): ComedyTensionBalance {
    
    // Analyze current tension levels
    const tensionAnalysis = this.analyzeTensionForComedy(
      tensionState, narrativeContext
    );
    
    // Determine comedy appropriateness
    const comedyAppropriiateness = this.assessComedyAppropriateness(
      tensionAnalysis, comedyBlueprint, narrativeContext
    );
    
    // Calculate relief vs tension balance
    const reliefBalance = this.calculateReliefBalance(
      tensionState, comedyBlueprint, comedyAppropriiateness
    );
    
    // Generate tension-comedy coordination
    const tensionCoordination = this.coordinateComedyWithTension(
      reliefBalance, comedyBlueprint, tensionAnalysis
    );
    
    // Plan comedy pacing
    const comedyPacing = this.planComedyPacing(
      tensionCoordination, comedyBlueprint, narrativeContext
    );
    
    return {
      tensionAnalysis,
      comedyAppropriiateness,
      reliefBalance,
      tensionCoordination,
      comedyPacing,
      balanceRecommendations: this.generateBalanceRecommendations(
        tensionCoordination, comedyPacing
      ),
      riskAssessment: this.assessComedyRisks(
        reliefBalance, narrativeContext
      )
    };
  }
  
  /**
   * Coordinates comedy with all other narrative engines
   */
  static coordinateComedyWithEngines(
    comedyBlueprint: ComedyBlueprint,
    engineInputs: {
      premise: StoryPremise;
      characters: Character3D[];
      narrative: any;
      dialogue: DialogueExchange;
      tropes: any;
      world: WorldBlueprint;
      livingWorld: any;
      choices: any;
      genre: GenreProfile;
      tension: TensionState;
    }
  ): ComedyEngineCoordinationResult {
    
    // Coordinate with Character Engine
    const characterCoordination = this.coordinateComedyWithCharacters(
      comedyBlueprint, engineInputs.characters
    );
    
    // Coordinate with Dialogue Engine
    const dialogueCoordination = this.coordinateComedyWithDialogue(
      comedyBlueprint, engineInputs.dialogue, characterCoordination
    );
    
    // Coordinate with Tension Engine
    const tensionCoordination = this.coordinateComedyWithTension(
      comedyBlueprint, engineInputs.tension, engineInputs.narrative
    );
    
    // Coordinate with World Building Engine
    const worldCoordination = this.coordinateComedyWithWorld(
      comedyBlueprint, engineInputs.world, characterCoordination
    );
    
    // Coordinate with Genre System
    const genreCoordination = this.coordinateComedyWithGenre(
      comedyBlueprint, engineInputs.genre, engineInputs.premise
    );
    
    return {
      characterCoordination,
      dialogueCoordination,
      tensionCoordination,
      worldCoordination,
      genreCoordination,
      overallHarmony: this.assessComedyEngineHarmony([
        characterCoordination,
        dialogueCoordination,
        tensionCoordination,
        worldCoordination,
        genreCoordination
      ]),
      comedyIntegrity: this.validateComedyIntegrity(comedyBlueprint, engineInputs)
    };
  }
  
  // ============================================================
  // AI-ENHANCED COMEDY GENERATION METHODS
  // ============================================================
  
  /**
   * AI-ENHANCED: Analyze story requirements for comedy integration
   */
  private static async analyzeComedyRequirementsAI(
    premise: StoryPremise,
    characters: Character3D[],
    worldBlueprint: WorldBlueprint,
    genre: GenreProfile
  ): Promise<ComedyRequirements> {
    const prompt = `Analyze comedy requirements for this story:

PREMISE: "${premise.premiseStatement}"
THEME: "${premise.theme}"
GENRE: ${genre.primaryGenre} (${genre.subGenres.join(', ')})
CHARACTERS: ${characters.map(c => `${c.name} (${c.psychology.coreValue}, ${c.sociology.class})`).join(', ')}
WORLD: ${worldBlueprint.name} - ${worldBlueprint.description}

Determine comedy needs:
1. What humor expectations does this genre have?
2. How can comedy support the premise without undermining it?
3. What comedy opportunities exist in character personalities?
4. What worldbuilding elements create natural humor?
5. What audience needs should comedy serve?
6. How should comedy balance with drama/tension?

Return JSON with specific comedy guidance.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in comedy writing and story structure. Analyze how comedy can serve this specific story.',
        temperature: 0.6,
        maxTokens: 700
      });

      const requirements = JSON.parse(result || '{}');
      if (requirements.genreExpectations) {
        return requirements as ComedyRequirements;
      }
      
      return this.analyzeComedyRequirementsFallback(premise, characters, worldBlueprint, genre);
    } catch (error) {
      console.warn('AI comedy requirements analysis failed, using fallback:', error);
      return this.analyzeComedyRequirementsFallback(premise, characters, worldBlueprint, genre);
    }
  }

  /**
   * AI-ENHANCED: Determine optimal comedy type for the story
   */
  private static async determineComedyTypeAI(
    genre: GenreProfile,
    requirements: ComedyRequirements,
    audienceType: AudienceType,
    premise: StoryPremise
  ): Promise<ComedyType> {
    const prompt = `Determine the best comedy type for this story:

GENRE: ${genre.primaryGenre} (${genre.subGenres.join(', ')})
PREMISE: "${premise.premiseStatement}"
AUDIENCE: ${audienceType}
REQUIREMENTS: ${JSON.stringify(requirements)}

Comedy type options: slapstick, wit, satire, parody, irony, wordplay, situational, character-driven, observational, absurd, dark-comedy, romantic-comedy, action-comedy, horror-comedy

Consider:
- What comedy style fits this genre naturally?
- What serves the premise without undermining drama?
- What resonates with the target audience?
- What creates the most story opportunities?

Return the single best comedy type with brief reasoning.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in comedy genres and audience psychology. Choose the optimal comedy type.',
        temperature: 0.5,
        maxTokens: 300
      });

      // Extract comedy type from response
      const comedyTypes: ComedyType[] = ['slapstick', 'wit', 'satire', 'parody', 'irony', 'wordplay', 'situational', 'character-driven', 'observational', 'absurd', 'dark-comedy', 'romantic-comedy', 'action-comedy', 'horror-comedy'];
      
      for (const type of comedyTypes) {
        if (result?.toLowerCase().includes(type)) {
          return type;
        }
      }
      
      return this.determineComedyTypeFallback(genre, requirements, audienceType);
    } catch (error) {
      console.warn('AI comedy type determination failed, using fallback:', error);
      return this.determineComedyTypeFallback(genre, requirements, audienceType);
    }
  }

  /**
   * AI-ENHANCED: Generate sophisticated humor formula with mathematics
   */
  private static async generateHumorFormulaAI(
    comedyType: ComedyType,
    characters: Character3D[],
    premise: StoryPremise,
    comedyLevel: ComedyLevel
  ): Promise<HumorFormula> {
    const prompt = `Create a mathematical humor formula for ${comedyType} comedy:

COMEDY TYPE: ${comedyType}
COMEDY LEVEL: ${comedyLevel}
PREMISE: "${premise.premiseStatement}"
CHARACTERS: ${characters.map(c => `${c.name} (${c.psychology.coreValue})`).join(', ')}

Using the formula: Setup + Surprise + Truth = Humor

Design:
1. Setup Component: How to establish expectations effectively
2. Surprise Component: How to subvert expectations cleverly  
3. Truth Component: What universal/character truths to reveal
4. Timing Variables: Optimal durations and pauses
5. Amplification Factors: What boosts humor effectiveness
6. Diminishing Returns: How to avoid comedy fatigue

Create specific numbers and strategies for this story's comedy needs.

Return detailed humor formula with mathematical precision.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in comedy mathematics and humor psychology. Create precise comedy formulas.',
        temperature: 0.6,
        maxTokens: 800
      });

      const formulaData = JSON.parse(result || '{}');
      
      if (formulaData.setupComponent && formulaData.surpriseComponent && formulaData.truthComponent) {
        return this.buildHumorFormulaFromAI(formulaData, comedyType, comedyLevel);
      }
      
      return this.generateHumorFormulaFallback(comedyType, characters, premise);
    } catch (error) {
      console.warn('AI humor formula generation failed, using fallback:', error);
      return this.generateHumorFormulaFallback(comedyType, characters, premise);
    }
  }

  /**
   * AI-ENHANCED: Generate character-specific humor personalities
   */
  private static async generateCharacterHumorAI(
    characters: Character3D[],
    comedyType: ComedyType,
    premise: StoryPremise,
    comedyLevel: ComedyLevel
  ): Promise<CharacterHumor[]> {
    const characterHumor: CharacterHumor[] = [];

    for (const character of characters) {
      const prompt = `Create a humor personality for this character:

CHARACTER: ${character.name}
PSYCHOLOGY: ${character.psychology.coreValue}, ${character.psychology.primaryFlaw}
SOCIOLOGY: ${character.sociology.class}, ${character.sociology.education}
PREMISE ROLE: ${character.premiseRole}
COMEDY TYPE: ${comedyType}
COMEDY LEVEL: ${comedyLevel}

Design their humor profile:
1. Primary humor style (deadpan, animated, self-deprecating, etc.)
2. Comedy role (comic-relief, straight-man, etc.)
3. What triggers their humor
4. How they use humor defensively
5. What they can't joke about (vulnerabilities)
6. Their comedy timing patterns
7. How their humor evolves through the story

Create humor that serves their character arc and premise testing.

Return detailed character humor profile.`;

      try {
        const result = await generateContent(prompt, {
          systemPrompt: 'You are an expert in character development and comedy psychology. Create authentic character humor.',
          temperature: 0.7,
          maxTokens: 600
        });

        const humorData = JSON.parse(result || '{}');
        
        if (humorData.primaryStyle && humorData.comedyRole) {
          characterHumor.push(this.buildCharacterHumorFromAI(character, humorData, comedyType));
        } else {
          characterHumor.push(this.generateCharacterHumorFallback(character, comedyType));
        }
      } catch (error) {
        console.warn(`AI character humor generation failed for ${character.name}, using fallback:`, error);
        characterHumor.push(this.generateCharacterHumorFallback(character, comedyType));
      }
    }

    return characterHumor;
  }

  /**
   * AI-ENHANCED: Generate setup-payoff pairs with sophisticated relationships
   */
  private static async generateSetupPayoffPairsAI(
    characters: Character3D[],
    premise: StoryPremise,
    requirements: ComedyRequirements,
    comedyType: ComedyType
  ): Promise<SetupPayoffPair[]> {
    const prompt = `Create setup-payoff pairs for ${comedyType} comedy:

PREMISE: "${premise.premiseStatement}"
CHARACTERS: ${characters.map(c => `${c.name} (${c.psychology.coreValue}, ${c.premiseRole})`).join(', ')}
COMEDY REQUIREMENTS: ${JSON.stringify(requirements)}

Design 3-5 setup-payoff pairs that:
1. Test the premise through humor
2. Reveal character depths
3. Have optimal separation distance
4. Create satisfying surprises
5. Offer callback/escalation potential
6. Serve the story meaningfully

For each pair, specify:
- Setup moment and method
- Payoff moment and delivery
- Separation distance and timing
- Character involvement
- Story relevance
- Callback potential

Return detailed setup-payoff architecture.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in comedy structure and narrative callbacks. Create sophisticated setup-payoff relationships.',
        temperature: 0.7,
        maxTokens: 900
      });

      const pairsData = JSON.parse(result || '[]');
      
      if (Array.isArray(pairsData) && pairsData.length > 0) {
        return this.buildSetupPayoffPairsFromAI(pairsData, characters, premise);
      }
      
      return this.generateSetupPayoffPairsFallback(characters, premise, requirements);
    } catch (error) {
      console.warn('AI setup-payoff generation failed, using fallback:', error);
      return this.generateSetupPayoffPairsFallback(characters, premise, requirements);
    }
  }

  /**
   * AI-ENHANCED: Generate comedy content for specific dialogue
   */
  private static async generateComedyContentAI(
    character: Character3D,
    dialogueContext: DialogueContext,
    humorStyle: any,
    setupPayoffPair: SetupPayoffPair | undefined,
    comedyBlueprint: ComedyBlueprint
  ): Promise<any> {
    const prompt = `Generate comedy dialogue for this character:

CHARACTER: ${character.name}
PSYCHOLOGY: ${character.psychology.coreValue}, ${character.psychology.primaryFlaw}
HUMOR STYLE: ${JSON.stringify(humorStyle)}
CONTEXT: ${JSON.stringify(dialogueContext)}
COMEDY TYPE: ${comedyBlueprint.comedyType}
${setupPayoffPair ? `SETUP/PAYOFF: ${JSON.stringify(setupPayoffPair)}` : ''}

Create comedy that:
1. Fits their personality perfectly
2. Uses their natural humor style
3. Serves the scene's purpose
4. Advances character or plot
5. Uses proper setup-surprise-truth structure
6. Has optimal timing beats

Generate 2-3 specific comedy lines with:
- Exact dialogue text
- Delivery instructions
- Timing beats
- Expected reaction
- Story function

Return comedy content that feels authentic to this character.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert comedy writer and dialogue specialist. Create authentic character-specific humor.',
        temperature: 0.8,
        maxTokens: 600
      });

      const comedyData = JSON.parse(result || '{}');
      
      if (comedyData.lines || comedyData.content) {
        return comedyData;
      }
      
      return this.generateComedyContentFallback(character, dialogueContext, humorStyle);
    } catch (error) {
      console.warn(`AI comedy content generation failed for ${character.name}, using fallback:`, error);
      return this.generateComedyContentFallback(character, dialogueContext, humorStyle);
    }
  }

  // ============================================================
  // FALLBACK METHODS (Original Logic for Reliability)
  // ============================================================
  
  private static analyzeComedyRequirementsFallback(
    premise: StoryPremise,
    characters: Character3D[],
    worldBlueprint: WorldBlueprint,
    genre: GenreProfile
  ): ComedyRequirements {
    console.warn('Using fallback comedy requirements analysis.');
    return {
      genreExpectations: {
        primaryGenre: genre.primaryGenre,
        subGenres: genre.subGenres,
        expectations: 'Standard genre expectations'
      },
      premiseHumor: {
        potential: 'High',
        challenges: 'None'
      },
      characterComedy: {
        potential: 'High',
        challenges: 'None'
      },
      worldHumor: {
        opportunities: 'Many',
        challenges: 'None'
      },
      audienceNeeds: {
        needs: 'Entertainment, engagement, laughter',
        balance: 'Comedy should not overshadow story'
      },
      balanceRequirements: {
        comedyRatio: 0.3,
        dramaRatio: 0.7,
        tensionRelief: 'Comedy should provide relief'
      }
    };
  }
  
  private static determineComedyTypeFallback(
    genre: GenreProfile,
    requirements: ComedyRequirements,
    audience: AudienceType
  ): ComedyType {
    console.warn('Using fallback comedy type determination.');
    return 'slapstick'; // Default to a safe option
  }
  
  private static generateHumorFormulaFallback(
    comedyType: ComedyType,
    characters: Character3D[],
    premise: StoryPremise
  ): HumorFormula {
    console.warn('Using fallback humor formula generation.');
    return {
      setupComponent: {
        establishment: 'Create expectation through character behavior',
        misdirection: 'Lead audience toward logical conclusion',
        implantedAssumption: 'Audience assumes normal outcome',
        setupIntensity: 7,
        setupSubtlety: 6,
        setupDuration: 30
      },
      surpriseComponent: {
        expectationSubversion: 'Character acts unexpectedly but consistently',
        surpriseIntensity: 8,
        surpriseLogic: 'Surprise reveals deeper character truth',
        surpriseDelay: 5,
        foreshadowingClues: ['Character trait hint', 'Previous behavior pattern']
      },
      truthComponent: {
        universalTruth: 'Everyone has unexpected depths',
        characterTruth: 'Character is more complex than appears',
        situationalTruth: 'Assumptions often prove wrong',
        emotionalResonance: 8,
        insightDepth: 7
      },
      setupDuration: 30,
      pauseLength: 2,
      deliverySpeed: 8,
      recoveryTime: 5,
      relatabilityMultiplier: 1.5,
      unexpectednessBonus: 1.3,
      characterConsistency: 1.4,
      contextualRelevance: 1.6,
      repetitionPenalty: 0.8,
      oversaturationRisk: 0.7,
      audienceFamiliarity: 0.9
    };
  }
  
  private static generateTimingMechanics(type: ComedyType, formula: HumorFormula, level: ComedyLevel): TimingMechanics {
    return {
      primaryRhythm: { pattern: 'setup-setup-punchline', tempo: 120, variation: 0.2, buildingIntensity: true, naturalPauses: [10, 20], audienceBreathing: [5, 15] },
      secondaryRhythms: [],
      rhythmVariation: [],
      comedyBeats: [],
      beatSpacing: { minimum: 5, maximum: 30, optimal: 15 },
      beatIntensity: [],
      comedicPauses: [],
      pauseTiming: { beforePunchline: 2, afterPunchline: 3, betweenSetups: 1 },
      audienceAnticipation: { buildCurve: 'exponential', peakTiming: 0.8, releaseTiming: 1.0 },
      deliveryStyles: [],
      characterTiming: [],
      ensembleRhythm: { synchronization: 0.8, counterpoint: 0.6, harmony: 0.9 }
    };
  }
  
  private static generateSetupPayoffPairs(chars: Character3D[], premise: StoryPremise, req: ComedyRequirements): SetupPayoffPair[] {
    return [];
  }
  
  private static generateCharacterHumor(chars: Character3D[], type: ComedyType, premise: StoryPremise): CharacterHumor[] {
    return [];
  }
  
  // More helper method stubs...
  private static generateComedyRhythms(timing: TimingMechanics, humor: CharacterHumor[], level: ComedyLevel): ComedyRhythm[] { return []; }
  private static integrateComedyWithStory(premise: StoryPremise, chars: Character3D[], pairs: SetupPayoffPair[], humor: CharacterHumor[]): any { return {}; }
  private static validateComedyQuality(formula: HumorFormula, timing: TimingMechanics, humor: CharacterHumor[], integration: any): any { return {}; }
  private static generateSurpriseArchitecture(pairs: SetupPayoffPair[]): any { return {}; }
  private static generateTruthResonance(premise: StoryPremise, humor: CharacterHumor[]): any { return {}; }
  private static generateHumorEscalation(rhythms: ComedyRhythm[]): any { return {}; }
  private static generateComedyRelease(timing: TimingMechanics): any { return {}; }
  private static generateComedyVoices(humor: CharacterHumor[]): any[] { return []; }
  private static generateAudienceProfile(type: AudienceType): any { return {}; }
  private static calculateHumorResonance(formula: HumorFormula, type: AudienceType): any { return {}; }
  private static predictComedyImpact(metrics: any): any { return {}; }

  // ============================================================
  // AI-ENHANCED COMEDY GENERATION METHODS (Continued)
  // ============================================================

  /**
   * AI-ENHANCED: Generate sophisticated surprise architecture
   */
  private static async generateSurpriseArchitectureAI(pairs: SetupPayoffPair[], premise: StoryPremise): Promise<SurpriseArchitecture> {
    const prompt = `Create a sophisticated surprise architecture for ${premise.premiseStatement}:

PREMISE: "${premise.premiseStatement}"
SETUP-PAYOFF PAIRS: ${JSON.stringify(pairs)}

Design the surprise architecture:
1. Surprise Types: What types of surprises (expectation subversion, truth revelation, etc.) are used?
2. Escalation Pattern: How does the surprise build intensity?
3. Timing: Optimal moments for surprises.
4. Clues: What hints or clues give away the surprise?
5. Logic: Why does the surprise make sense?

Return a detailed surprise architecture JSON.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in comedy surprise and escalation. Create a sophisticated surprise architecture.',
        temperature: 0.7,
        maxTokens: 700
      });

      const surpriseData = JSON.parse(result || '{}');
      
      if (surpriseData.surpriseTypes && surpriseData.escalationPattern) {
        return surpriseData as SurpriseArchitecture;
      }
      
      return this.generateSurpriseArchitectureFallback(pairs);
    } catch (error) {
      console.warn('AI surprise architecture generation failed, using fallback:', error);
      return this.generateSurpriseArchitectureFallback(pairs);
    }
  }

  /**
   * AI-ENHANCED: Generate sophisticated truth resonance
   */
  private static async generateTruthResonanceAI(premise: StoryPremise, humor: CharacterHumor[]): Promise<TruthResonance> {
    const prompt = `Create a sophisticated truth resonance for ${premise.premiseStatement}:

PREMISE: "${premise.premiseStatement}"
CHARACTER HUMOR: ${JSON.stringify(humor)}

Design the truth resonance:
1. Universal Truths: What are the core truths revealed?
2. Character Insights: What truths reveal character depth?
3. Situational Truths: What truths are revealed about the situation?
4. Emotional Resonance: How do these truths emotionally resonate?
5. Insight Depth: How profound are the truths?

Return a detailed truth resonance JSON.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in comedy truth and character psychology. Create a sophisticated truth resonance.',
        temperature: 0.7,
        maxTokens: 700
      });

      const truthData = JSON.parse(result || '{}');
      
      if (truthData.universalTruths && truthData.characterInsights) {
        return truthData as TruthResonance;
      }
      
      return this.generateTruthResonanceFallback(premise, humor);
    } catch (error) {
      console.warn('AI truth resonance generation failed, using fallback:', error);
      return this.generateTruthResonanceFallback(premise, humor);
    }
  }

  /**
   * AI-ENHANCED: Generate sophisticated humor escalation
   */
  private static async generateHumorEscalationAI(rhythms: ComedyRhythm[], premise: StoryPremise): Promise<HumorEscalation> {
    const prompt = `Create a sophisticated humor escalation for ${premise.premiseStatement}:

PREMISE: "${premise.premiseStatement}"
COMEDIC RHYTHMS: ${JSON.stringify(rhythms)}

Design the humor escalation:
1. Pattern: How does the humor build intensity?
2. Peak Intensity: At what point does the humor reach its highest point?
3. Timing: Optimal moments for escalation.
4. Diminishing Returns: How does the humor diminish?
5. Story Integration: How does the escalation serve the story?

Return a detailed humor escalation JSON.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in comedy escalation and rhythm. Create a sophisticated humor escalation.',
        temperature: 0.7,
        maxTokens: 700
      });

      const escalationData = JSON.parse(result || '{}');
      
      if (escalationData.pattern && escalationData.peakIntensity) {
        return escalationData as HumorEscalation;
      }
      
      return this.generateHumorEscalationFallback(rhythms);
    } catch (error) {
      console.warn('AI humor escalation generation failed, using fallback:', error);
      return this.generateHumorEscalationFallback(rhythms);
    }
  }

  /**
   * AI-ENHANCED: Generate sophisticated comedy release
   */
  private static async generateComedyReleaseAI(timing: TimingMechanics, comedyLevel: ComedyLevel): Promise<ComedyRelease> {
    const prompt = `Create a sophisticated comedy release for ${comedyLevel} comedy:

COMEDY LEVEL: ${comedyLevel}
TIMING MECHANICS: ${JSON.stringify(timing)}

Design the comedy release:
1. Method: How does the comedy end?
2. Timing: Optimal moment for release.
3. Diminishing Returns: How does the humor diminish?
4. Story Integration: How does the release serve the story?

Return a detailed comedy release JSON.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in comedy release and rhythm. Create a sophisticated comedy release.',
        temperature: 0.7,
        maxTokens: 700
      });

      const releaseData = JSON.parse(result || '{}');
      
      if (releaseData.method && releaseData.timing) {
        return releaseData as ComedyRelease;
      }
      
      return this.generateComedyReleaseFallback(timing);
    } catch (error) {
      console.warn('AI comedy release generation failed, using fallback:', error);
      return this.generateComedyReleaseFallback(timing);
    }
  }

  /**
   * AI-ENHANCED: Generate sophisticated comedy voices
   */
  private static async generateComedyVoicesAI(humor: CharacterHumor[], premise: StoryPremise): Promise<ComedyVoice[]> {
    const voices: ComedyVoice[] = [];

    for (const character of humor) {
      const prompt = `Create a specific comedy voice for this character:

CHARACTER: ${character.character.name}
HUMOR STYLE: ${JSON.stringify(character.humorStyle)}
COMEDY TYPE: ${character.comedyRole}
PREMISE ROLE: ${character.character.premiseRole}

Design their voice:
1. Primary voice pattern (deadpan, animated, etc.)
2. Delivery style (physical, verbal, etc.)
3. Character traits reflected in voice
4. Natural rhythm
5. How they use intonation for humor

Return a specific voice pattern for this character.`;

      try {
        const result = await generateContent(prompt, {
          systemPrompt: 'You are an expert in voice acting and character development. Create a specific voice for this character.',
          temperature: 0.8,
          maxTokens: 500
        });

        const voiceData = JSON.parse(result || '{}');
        
        if (voiceData.voicePattern) {
          voices.push({ character: character.character.name, voicePattern: voiceData.voicePattern });
        } else {
          voices.push({ character: character.character.name, voicePattern: 'Natural' }); // Fallback
        }
      } catch (error) {
        console.warn(`AI voice generation failed for ${character.character.name}, using fallback:`, error);
        voices.push({ character: character.character.name, voicePattern: 'Natural' }); // Fallback
      }
    }

    return voices;
  }

  /**
   * AI-ENHANCED: Generate sophisticated audience profile
   */
  private static async generateAudienceProfileAI(type: AudienceType, premise: StoryPremise): Promise<AudienceProfile> {
    const prompt = `Create a sophisticated audience profile for ${type} audience:

AUDIENCE TYPE: ${type}
PREMISE: "${premise.premiseStatement}"

Design the audience profile:
1. Demographics: Age, gender, education, income, location
2. Preferences: What humor they find funny, what genres they like
3. Expectations: What they expect from comedy
4. Reactions: How they react to different humor types
5. Memorable moments: What made them laugh the most

Return a detailed audience profile JSON.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in audience psychology and comedy. Create a sophisticated audience profile.',
        temperature: 0.7,
        maxTokens: 700
      });

      const profileData = JSON.parse(result || '{}');
      
      if (profileData.demographics && profileData.preferences) {
        return profileData as AudienceProfile;
      }
      
      return this.generateAudienceProfileFallback(type);
    } catch (error) {
      console.warn('AI audience profile generation failed, using fallback:', error);
      return this.generateAudienceProfileFallback(type);
    }
  }

  /**
   * AI-ENHANCED: Calculate sophisticated humor resonance
   */
  private static async calculateHumorResonanceAI(formula: HumorFormula, type: AudienceType, premise: StoryPremise): Promise<HumorResonance> {
    const prompt = `Calculate the humor resonance for ${premise.premiseStatement} for ${type} audience:

PREMISE: "${premise.premiseStatement}"
COMEDY TYPE: ${type}
HUMOR FORMULA: ${JSON.stringify(formula)}

Calculate the resonance:
1. Resonance Level: How strongly does the humor connect with the audience?
2. Connection Points: What specific aspects of the humor resonate?
3. Emotional Impact: How does the humor emotionally affect the audience?
4. Story Integration: How does the humor serve the story?

Return a detailed humor resonance JSON.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in humor psychology and story integration. Calculate the humor resonance.',
        temperature: 0.7,
        maxTokens: 700
      });

      const resonanceData = JSON.parse(result || '{}');
      
      if (resonanceData.resonanceLevel && resonanceData.connectionPoints) {
        return resonanceData as HumorResonance;
      }
      
      return this.calculateHumorResonanceFallback(formula, type);
    } catch (error) {
      console.warn('AI humor resonance calculation failed, using fallback:', error);
      return this.calculateHumorResonanceFallback(formula, type);
    }
  }

  /**
   * AI-ENHANCED: Predict sophisticated comedy impact
   */
  private static async predictComedyImpactAI(metrics: any, type: AudienceType): Promise<ComedyImpact> {
    const prompt = `Predict the comedy impact for ${type} audience:

AUDIENCE TYPE: ${type}
COMEDY METRICS: ${JSON.stringify(metrics)}

Predict the impact:
1. Laughter Prediction: How likely is the audience to laugh?
2. Memorable Moments: What moments made them remember the comedy?
3. Story Integration: How did the comedy serve the story?
4. Emotional Response: How did the comedy emotionally affect them?

Return a detailed comedy impact JSON.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in comedy impact and audience psychology. Predict the comedy impact.',
        temperature: 0.7,
        maxTokens: 700
      });

      const impactData = JSON.parse(result || '{}');
      
      if (impactData.laughterPrediction && impactData.memorability) {
        return impactData as ComedyImpact;
      }
      
      return this.predictComedyImpactFallback(metrics, type);
    } catch (error) {
      console.warn('AI comedy impact prediction failed, using fallback:', error);
      return this.predictComedyImpactFallback(metrics, type);
    }
  }

  // ============================================================
  // FALLBACK METHODS (Original Logic for Reliability)
  // ============================================================

  private static generateSurpriseArchitectureFallback(pairs: SetupPayoffPair[]): SurpriseArchitecture {
    console.warn('Using fallback surprise architecture generation.');
    return {
      surpriseTypes: ['expectation subversion', 'truth revelation', 'character reveal'],
      escalationPattern: 'Gradual escalation, peak at payoff'
    };
  }

  private static generateTruthResonanceFallback(premise: StoryPremise, humor: CharacterHumor[]): TruthResonance {
    console.warn('Using fallback truth resonance generation.');
    return {
      universalTruths: ['Everyone has unexpected depths', 'Assumptions often prove wrong'],
      characterInsights: ['Character is more complex than appears', 'Everyone has hidden motivations']
    };
  }

  private static generateHumorEscalationFallback(rhythms: ComedyRhythm[]): HumorEscalation {
    console.warn('Using fallback humor escalation generation.');
    return {
      pattern: 'Gradual escalation, peak at payoff',
      peakIntensity: 0.9
    };
  }

  private static generateComedyReleaseFallback(timing: TimingMechanics): ComedyRelease {
    console.warn('Using fallback comedy release generation.');
    return {
      method: 'Gradual release, peak at payoff',
      timing: 0.9
    };
  }

  private static generateComedyVoicesFallback(humor: CharacterHumor[]): any[] {
    console.warn('Using fallback comedy voices generation.');
    return humor.map(ch => ({ character: ch.character.name, voicePattern: 'Natural' }));
  }

  private static generateAudienceProfileFallback(type: AudienceType): AudienceProfile {
    console.warn('Using fallback audience profile generation.');
    return {
      demographics: ['General audience'],
      preferences: ['Entertainment', 'Laughter', 'Engagement']
    };
  }

  private static calculateHumorResonanceFallback(formula: HumorFormula, type: AudienceType): HumorResonance {
    console.warn('Using fallback humor resonance calculation.');
    return {
      resonanceLevel: 0.8,
      connectionPoints: ['Character truth', 'Universal truth']
    };
  }

  private static predictComedyImpactFallback(metrics: any, type: AudienceType): ComedyImpact {
    console.warn('Using fallback comedy impact prediction.');
    return {
      laughterPrediction: 0.7,
      memorability: 0.8
    };
  }

  // ============================================================
  // Helper methods for comedy generation
  
  private static analyzeComedyRequirementsFallback(
    premise: StoryPremise,
    characters: Character3D[],
    worldBlueprint: WorldBlueprint,
    genre: GenreProfile
  ): ComedyRequirements {
    console.warn('Using fallback comedy requirements analysis.');
    return {
      genreExpectations: {
        primaryGenre: genre.primaryGenre,
        subGenres: genre.subGenres,
        expectations: 'Standard genre expectations'
      },
      premiseHumor: {
        potential: 'High',
        challenges: 'None'
      },
      characterComedy: {
        potential: 'High',
        challenges: 'None'
      },
      worldHumor: {
        opportunities: 'Many',
        challenges: 'None'
      },
      audienceNeeds: {
        needs: 'Entertainment, engagement, laughter',
        balance: 'Comedy should not overshadow story'
      },
      balanceRequirements: {
        comedyRatio: 0.3,
        dramaRatio: 0.7,
        tensionRelief: 'Comedy should provide relief'
      }
    };
  }
  
  private static determineComedyTypeFallback(
    genre: GenreProfile,
    requirements: ComedyRequirements,
    audience: AudienceType
  ): ComedyType {
    console.warn('Using fallback comedy type determination.');
    return 'slapstick'; // Default to a safe option
  }
  
  private static generateHumorFormulaFallback(
    comedyType: ComedyType,
    characters: Character3D[],
    premise: StoryPremise
  ): HumorFormula {
    console.warn('Using fallback humor formula generation.');
    return {
      setupComponent: {
        establishment: 'Create expectation through character behavior',
        misdirection: 'Lead audience toward logical conclusion',
        implantedAssumption: 'Audience assumes normal outcome',
        setupIntensity: 7,
        setupSubtlety: 6,
        setupDuration: 30
      },
      surpriseComponent: {
        expectationSubversion: 'Character acts unexpectedly but consistently',
        surpriseIntensity: 8,
        surpriseLogic: 'Surprise reveals deeper character truth',
        surpriseDelay: 5,
        foreshadowingClues: ['Character trait hint', 'Previous behavior pattern']
      },
      truthComponent: {
        universalTruth: 'Everyone has unexpected depths',
        characterTruth: 'Character is more complex than appears',
        situationalTruth: 'Assumptions often prove wrong',
        emotionalResonance: 8,
        insightDepth: 7
      },
      setupDuration: 30,
      pauseLength: 2,
      deliverySpeed: 8,
      recoveryTime: 5,
      relatabilityMultiplier: 1.5,
      unexpectednessBonus: 1.3,
      characterConsistency: 1.4,
      contextualRelevance: 1.6,
      repetitionPenalty: 0.8,
      oversaturationRisk: 0.7,
      audienceFamiliarity: 0.9
    };
  }
  
  private static generateTimingMechanics(type: ComedyType, formula: HumorFormula, level: ComedyLevel): TimingMechanics {
    return {
      primaryRhythm: { pattern: 'setup-setup-punchline', tempo: 120, variation: 0.2, buildingIntensity: true, naturalPauses: [10, 20], audienceBreathing: [5, 15] },
      secondaryRhythms: [],
      rhythmVariation: [],
      comedyBeats: [],
      beatSpacing: { minimum: 5, maximum: 30, optimal: 15 },
      beatIntensity: [],
      comedicPauses: [],
      pauseTiming: { beforePunchline: 2, afterPunchline: 3, betweenSetups: 1 },
      audienceAnticipation: { buildCurve: 'exponential', peakTiming: 0.8, releaseTiming: 1.0 },
      deliveryStyles: [],
      characterTiming: [],
      ensembleRhythm: { synchronization: 0.8, counterpoint: 0.6, harmony: 0.9 }
    };
  }
  
  private static generateSetupPayoffPairs(chars: Character3D[], premise: StoryPremise, req: ComedyRequirements): SetupPayoffPair[] {
    return [];
  }
  
  private static generateCharacterHumor(chars: Character3D[], type: ComedyType, premise: StoryPremise): CharacterHumor[] {
    return [];
  }
  
  // More helper method stubs...
  private static generateComedyRhythms(timing: TimingMechanics, humor: CharacterHumor[], level: ComedyLevel): ComedyRhythm[] { return []; }
  private static integrateComedyWithStory(premise: StoryPremise, chars: Character3D[], pairs: SetupPayoffPair[], humor: CharacterHumor[]): any { return {}; }
  private static validateComedyQuality(formula: HumorFormula, timing: TimingMechanics, humor: CharacterHumor[], integration: any): any { return {}; }
  private static generateSurpriseArchitecture(pairs: SetupPayoffPair[]): any { return {}; }
  private static generateTruthResonance(premise: StoryPremise, humor: CharacterHumor[]): any { return {}; }
  private static generateHumorEscalation(rhythms: ComedyRhythm[]): any { return {}; }
  private static generateComedyRelease(timing: TimingMechanics): any { return {}; }
  private static generateComedyVoices(humor: CharacterHumor[]): any[] { return []; }
  private static generateAudienceProfile(type: AudienceType): any { return {}; }
  private static calculateHumorResonance(formula: HumorFormula, type: AudienceType): any { return {}; }
  private static predictComedyImpact(metrics: any): any { return {}; }

  /**
   * Helper method to convert V2.0 context to legacy format
   */
  private static convertToLegacyComedyContext(
    context: any,
    requirements: any,
    framework: ComedyTimingRecommendation
  ): any {
    // Create simplified legacy context for compatibility
    return {
      premise: {
        id: `premise-${Date.now()}`,
        theme: context.comedyObjectives[0] || 'Humor and Entertainment',
        premiseStatement: `${context.genre} project focused on ${context.humorStyle} humor`,
        character: 'Comedic protagonist navigating humorous situations',
        conflict: 'Comedy vs. Serious Moments',
        want: 'Generate laughter and entertainment',
        need: 'Authentic humor that serves the story',
        change: 'Develop comedic timing and authenticity',
        result: requirements.humorIntensity === 'outrageous' ? 'Maximum comedic impact' : 'Balanced humor integration'
      },
      
      characters: [
        {
          name: 'Comedy Lead',
          role: 'protagonist',
          backgroundStory: `Character with ${context.humorStyle} comedic sensibilities`,
          internalConflicts: context.tonalRequirements,
          externalConflicts: ['Timing challenges', 'Audience expectations']
        }
      ],
      
      world: {
        id: `world-${Date.now()}`,
        description: `${context.genre} world optimized for ${context.humorStyle} comedy`,
        premise: context.projectTitle
      },
      
      genre: {
        id: context.genre,
        category: context.genre,
        definition: `${context.genre} genre conventions with comedic integration`,
        coreElements: context.comedyObjectives
      },
      
      comedyLevel: requirements.humorIntensity === 'outrageous' ? 'dominant' :
                   requirements.humorIntensity === 'bold' ? 'heavy' :
                   requirements.humorIntensity === 'moderate' ? 'moderate' : 'light' as ComedyLevel,
      
      audienceType: requirements.audienceEngagement === 'participatory' ? 'sophisticated' :
                    requirements.culturalSensitivity === 'expert' ? 'sophisticated' :
                    context.targetAudience.includes('family') ? 'family' : 'general' as AudienceType
    };
  }

  /**
   * Helper method to apply V2.0 framework enhancements to existing blueprint
   */
  private static applyComedyFrameworkToBlueprint(
    blueprint: ComedyBlueprint,
    framework: ComedyTimingRecommendation
  ): ComedyBlueprint {
    // Apply framework enhancements to existing blueprint
    const enhancedBlueprint = { ...blueprint };
    
    // Add framework metadata
    (enhancedBlueprint as any).comedyFrameworkV2 = {
      frameworkVersion: 'ComedyTimingEngineV2',
      confidence: framework.primaryRecommendation.confidence,
      
      // Psychological Foundations
      humorPsychology: {
        bergsonMechanical: framework.primaryRecommendation.humorPsychology.bergsonMechanical,
        freudianRelease: framework.primaryRecommendation.humorPsychology.freudianRelease,
        modernCognitive: framework.primaryRecommendation.humorPsychology.modernCognitive
      },
      
      // Cultural and Generational Matrix
      culturalMatrix: {
        globalAdaptation: framework.primaryRecommendation.culturalMatrix,
        contemporaryFramework: framework.primaryRecommendation.contemporaryFramework
      },
      
      // Architectural Blueprints
      comedyArchitecture: {
        setupPayoffFramework: framework.primaryRecommendation.comedyArchitecture.setupPayoffFramework,
        patternRecognition: framework.primaryRecommendation.comedyArchitecture.patternRecognition,
        physicalVerbalComedy: framework.primaryRecommendation.comedyArchitecture.physicalVerbalComedy
      },
      
      // Performance and Delivery
      deliveryFramework: {
        timingPsychology: framework.primaryRecommendation.deliveryFramework.timingPsychology,
        actorDirectorFramework: framework.primaryRecommendation.deliveryFramework.actorDirectorFramework,
        postProductionCraft: framework.primaryRecommendation.deliveryFramework.postProductionCraft
      },
      
      // Genre Integration
      hybridGenreFramework: framework.primaryRecommendation.hybridGenreFramework,
      
      // Strategic Guidance
      comedyStrategy: framework.comedyStrategy,
      implementationGuidance: framework.implementationGuidance,
      comedyCraft: framework.comedyCraft
    };
    
    // Enhance humor formula with V2.0 insights
    if (enhancedBlueprint.humorFormula) {
      (enhancedBlueprint.humorFormula as any).frameworkEnhancement = {
        psychologicalFoundation: framework.frameworkBreakdown.psychologicalMastery,
        structuralExcellence: framework.frameworkBreakdown.structuralExcellence,
        deliveryPrecision: framework.frameworkBreakdown.deliveryPrecision,
        culturalAuthenticity: framework.frameworkBreakdown.culturalAuthenticity
      };
    }
    
    // Enhance timing mechanics with V2.0 precision
    if (enhancedBlueprint.timingMechanics) {
      (enhancedBlueprint.timingMechanics as any).v2Enhancement = {
        logicEmotionDelay: framework.primaryRecommendation.deliveryFramework.timingPsychology.logicEmotionDelay,
        audienceResponsePatterns: framework.primaryRecommendation.deliveryFramework.timingPsychology.audienceResponsePatterns,
        pauseAndSilence: framework.primaryRecommendation.deliveryFramework.timingPsychology.pauseAndSilence
      };
    }
    
    // Enhance setup-payoff pairs with architectural precision
    if (enhancedBlueprint.setupPayoffPairs) {
      enhancedBlueprint.setupPayoffPairs.forEach((pair, index) => {
        (pair as any).frameworkGuidance = {
          expectationManagement: framework.primaryRecommendation.comedyArchitecture.setupPayoffFramework.expectationManagement,
          misdirectionTechniques: framework.primaryRecommendation.comedyArchitecture.setupPayoffFramework.misdirectionTechniques,
          ruleOfThreeApplication: framework.primaryRecommendation.comedyArchitecture.patternRecognition.ruleOfThree
        };
      });
    }
    
    return enhancedBlueprint;
  }
}

// Supporting interfaces and types
export type ComedyLevel = 'light' | 'moderate' | 'heavy' | 'dominant';
export type AudienceType = 'family' | 'adult' | 'sophisticated' | 'general' | 'niche';

export interface ComedyRequirements {
  genreExpectations: any;
  premiseHumor: any;
  characterComedy: any;
  worldHumor: any;
  audienceNeeds: any;
  balanceRequirements: any;
}

export interface ComedySceneApplication {
  scene: NarrativeScene;
  comedyOpportunities: any[];
  selectedTechniques: any[];
  comedyBeats: ComedyBeat[];
  timingCalculations: any;
  humorApplication: any;
  dialogueIntegration: any;
  expectedLaughter: any;
  storyImpact: any;
}

export interface ComedyDialogue {
  character: Character3D;
  comedyContent: any;
  timingApplication: any;
  humorCalculation: any;
  deliveryInstructions: any;
  expectedReaction: any;
  audienceResponse: any;
}

export interface ComedyTensionBalance {
  tensionAnalysis: any;
  comedyAppropriiateness: any;
  reliefBalance: any;
  tensionCoordination: any;
  comedyPacing: any;
  balanceRecommendations: any;
  riskAssessment: any;
}

export interface ComedyEngineCoordinationResult {
  characterCoordination: any;
  dialogueCoordination: any;
  tensionCoordination: any;
  worldCoordination: any;
  genreCoordination: any;
  overallHarmony: number;
  comedyIntegrity: boolean;
}

// Additional supporting interfaces...
export interface SurpriseArchitecture { surpriseTypes: string[]; escalationPattern: string; }
export interface TruthResonance { universalTruths: string[]; characterInsights: string[]; }
export interface HumorEscalation { pattern: string; peakIntensity: number; }
export interface ComedyRelease { method: string; timing: number; }
export interface ComedyPremiseService { supportLevel: number; integration: string; }
export interface NarrativeBalance { comedyRatio: number; dramaRatio: number; }
export interface TensionRelief { reliefPoints: number[]; intensity: number; }
export interface GenreHarmony { alignment: number; enhancement: string; }
export interface AudienceProfile { demographics: string[]; preferences: string[]; }
export interface HumorResonance { resonanceLevel: number; connectionPoints: string[]; }
export interface ComedyImpact { laughterPrediction: number; memorability: number; }
export interface ComedyMetrics { effectiveness: number; authenticity: number; }
export interface TimingPrecision { accuracy: number; consistency: number; }
export interface HumorAuthenticity { genuineness: number; characterFit: number; }
export interface RhythmVariation { type: string; frequency: number; }
export interface BeatSpacing { minimum: number; maximum: number; optimal: number; }
export interface BeatIntensity { level: number; duration: number; }
export interface ComedyPause { duration: number; purpose: string; }
export interface PauseTiming { beforePunchline: number; afterPunchline: number; betweenSetups: number; }
export interface AnticipationCurve { buildCurve: string; peakTiming: number; releaseTiming: number; }
export interface DeliveryStyle { style: string; effectiveness: number; }
export interface CharacterTiming { character: string; naturalRhythm: number; }
export interface EnsembleRhythm { synchronization: number; counterpoint: number; harmony: number; }
export interface ComedyVoice { character: string; voicePattern: string; }
export interface ComedyPartnership { partner: string; dynamic: string; }
export interface StraightManDynamic { straightMan: boolean; foilCharacter: string; }
export interface EnsembleFunction { role: string; contribution: string; }
export interface HumorEvolution { direction: string; milestones: string[]; }
export interface ComedyArc { beginning: string; middle: string; end: string; }
export interface HumorChallenge { challenge: string; resolution: string; }
export interface DialogueContext { setting: string; purpose: string; participants: string[]; }
export interface NarrativeContext { episode: number; tension: number; pacing: string; }
export interface HumorRange { styles: HumorStyle[]; flexibility: number; } 