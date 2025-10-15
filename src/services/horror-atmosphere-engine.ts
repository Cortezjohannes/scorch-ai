/**
 * The Horror Atmosphere Engine - Master of Fear Psychology
 * 
 * This system brings scientific understanding to horror, mastering fear psychology,
 * building sustained dread, orchestrating perfectly-timed scares, and creating
 * atmospheric tension that penetrates the audience's psychological defenses.
 * 
 * Key Principle: True horror lives in the unknown - the fear of what might be lurking
 */

import { StoryPremise } from './premise-engine'
import { Character3D } from './character-engine'
import { NarrativeScene } from './fractal-narrative-engine'
import { DialogueExchange } from './strategic-dialogue-engine'
import { TensionState } from './tension-escalation-engine'
import { WorldBlueprint } from './world-building-engine'
import { GenreProfile } from './genre-mastery-system'
import { HorrorEngineV2, type HorrorEngineRecommendation } from './horror-engine-v2'

// Core Horror Architecture
export interface HorrorBlueprint {
  id: string;
  name: string;
  horrorType: HorrorType;
  
  // Fear Psychology Systems
  fearPsychology: FearPsychology;
  dreadMechanics: DreadMechanics;
  atmosphericTension: AtmosphericTension;
  unknownFactor: UnknownFactor;
  
  // Horror Structures
  scareArchitecture: ScareArchitecture;
  fearEscalation: FearEscalation;
  suspenseBuilding: SuspenseBuilding;
  horrorRelease: HorrorRelease;
  
  // Atmospheric Elements
  environmentalHorror: EnvironmentalHorror;
  soundscapeDesign: SoundscapeDesign;
  visualAtmosphere: VisualAtmosphere;
  sensoryManipulation: SensoryManipulation;
  
  // Character Fear Integration
  characterFears: CharacterFear[];
  fearDynamics: FearDynamics;
  horrorVulnerabilities: HorrorVulnerability[];
  
  // Story Integration
  premiseHorror: PremiseHorror;
  narrativeIntegration: NarrativeIntegration;
  thematicResonance: ThematicResonance;
  genreAuthenticity: GenreAuthenticity;
  
  // Audience Psychology
  fearProfile: FearProfile;
  terrorImpact: TerrorImpact;
  horrorEffectiveness: HorrorEffectiveness;
  
  // Quality Metrics
  atmosphereMetrics: AtmosphereMetrics;
  fearConsistency: FearConsistency;
  horrorAuthenticity: HorrorAuthenticity;
}

export type HorrorType = 
  | 'psychological' | 'supernatural' | 'body-horror' | 'cosmic-horror'
  | 'slasher' | 'monster' | 'ghost-story' | 'survival-horror'
  | 'folk-horror' | 'gothic' | 'zombie' | 'vampire'

// Fear Psychology System
export interface FearPsychology {
  // Fundamental Fear Types
  primalFears: PrimalFear[];
  culturalFears: CulturalFear[];
  personalFears: PersonalFear[];
  existentialFears: ExistentialFear[];
  
  // Fear Mechanisms
  anticipationFear: AnticipationFear;
  suddenFear: SuddenFear;
  prolongedFear: ProlongedFear;
  compoundFear: CompoundFear;
  
  // Psychological Triggers
  fearTriggers: FearTrigger[];
  phobicElements: PhobicElement[];
  anxietyAmplifiers: AnxietyAmplifier[];
  
  // Fear Resistance
  desensitizationRisk: number;      // Risk of audience becoming numb
  fearTolerance: number;            // Audience's fear threshold
  recoveryTime: number;             // Time between fear spikes
  buildupSustainability: number;    // How long fear can be maintained
}

export interface PrimalFear {
  type: PrimalFearType;
  description: string;
  universality: number;             // How universal this fear is (1-10)
  intensity: number;                // Base fear intensity
  triggers: string[];               // What activates this fear
  manifestations: string[];         // How this fear appears in story
}

export type PrimalFearType = 
  | 'darkness' | 'isolation' | 'death' | 'unknown' | 'predators'
  | 'heights' | 'confined-spaces' | 'loss-of-control' | 'abandonment'
  | 'pain' | 'suffocation' | 'being-watched' | 'losing-identity'

// Dread Mechanics System
export interface DreadMechanics {
  // Dread Building Patterns
  dreadPattern: DreadPattern;
  buildupCurve: BuildupCurve;
  sustainedTension: SustainedTension;
  dreadRelease: DreadRelease;
  
  // Atmospheric Pressure
  atmosphericPressure: AtmosphericPressure;
  environmentalOppression: EnvironmentalOppression;
  psychologicalWeight: PsychologicalWeight;
  
  // Foreboding Elements
  ominousSignals: OminousSignal[];
  portents: Portent[];
  warnings: Warning[];
  prophecies: Prophecy[];
  
  // Dread Sustainability
  intensityManagement: IntensityManagement;
  fatiguePrevention: FatiguePrevention;
  variationTechniques: VariationTechnique[];
}

export interface DreadPattern {
  name: string;
  description: string;
  phases: DreadPhase[];
  duration: number;                 // Total time for pattern
  peakIntensity: number;           // Maximum dread level
  sustainabilityRating: number;    // How long this can be maintained
}

export interface DreadPhase {
  name: string;
  duration: number;                // Percentage of total pattern
  dreadLevel: number;              // Intensity during this phase
  techniques: string[];            // Methods used in this phase
  transitions: PhaseTransition[];   // How to move to next phase
}

// Scare Architecture System
export interface ScareArchitecture {
  // Scare Types and Timing
  jumpScares: JumpScare[];
  creepingScares: CreepingScare[];
  revelationScares: RevelationScare[];
  atmosphericScares: AtmosphericScare[];
  
  // Scare Orchestration
  scareSequencing: ScareSequencing;
  scarePacing: ScarePacing;
  scareEscalation: ScareEscalation;
  
  // Setup and Payoff
  scareSetups: ScareSetup[];
  fearPayoffs: FearPayoff[];
  falseScares: FalseScare[];
  scareVariations: ScareVariation[];
  
  // Recovery and Reset
  scareRecovery: ScareRecovery[];
  tensionReset: TensionReset[];
  audienceRecalibration: AudienceRecalibration;
}

export interface JumpScare {
  id: string;
  setup: ScareSetup;
  trigger: ScareTrigger;
  execution: ScareExecution;
  
  // Timing Elements
  buildupDuration: number;          // How long to build suspense
  triggerTiming: number;            // Precise moment of scare
  recoveryTime: number;             // Time for audience to recover
  
  // Effectiveness Factors
  surpriseLevel: number;            // How unexpected this is
  intensityLevel: number;           // How frightening this is
  authenticity: number;             // How genuine the scare feels
  storyRelevance: number;           // How much this serves story
}

// Environmental Horror System
export interface EnvironmentalHorror {
  // Location Horror
  locations: HorrorLocation[];
  spatialManipulation: SpatialManipulation;
  architecturalHorror: ArchitecturalHorror;
  
  // Atmospheric Conditions
  weather: WeatherHorror;
  lighting: LightingHorror;
  temperature: TemperatureHorror;
  air: AirHorror;
  
  // Sensory Environment
  visualDisturbances: VisualDisturbance[];
  auditoryHorror: AuditoryHorror;
  tactileHorror: TactileHorror;
  olfactoryHorror: OlfactoryHorror;
  
  // Environmental Storytelling
  environmentalClues: EnvironmentalClue[];
  atmosphericNarrative: AtmosphericNarrative;
  locationCharacter: LocationCharacter;
}

export interface HorrorLocation {
  name: string;
  baseHorrorLevel: number;          // Inherent scariness (1-10)
  horrorTypes: HorrorType[];        // What types of horror this supports
  
  // Physical Characteristics
  layout: LocationLayout;
  accessibility: LocationAccessibility;
  visibility: LocationVisibility;
  isolation: LocationIsolation;
  
  // Horror Potential
  fearTriggers: string[];           // What fears this location activates
  scareOpportunities: string[];     // Possible scare moments here
  atmosphericElements: string[];    // Horror atmosphere contributors
  
  // Story Integration
  narrativeFunction: string;        // Role in story progression
  characterSignificance: string;    // What this means to characters
  thematicResonance: string;        // How this supports themes
}

// Character Fear Integration
export interface CharacterFear {
  character: Character3D;
  fearProfile: CharacterFearProfile;
  vulnerabilities: FearVulnerability[];
  
  // Fear Responses
  fearReactions: FearReaction[];
  copingMechanisms: CopingMechanism[];
  fearEvolution: FearEvolution;
  
  // Horror Role
  horrorRole: HorrorRole;
  fearDynamics: CharacterFearDynamics;
  horrorArc: HorrorArc;
  
  // Story Integration
  fearMotivation: FearMotivation;
  horrorGrowth: HorrorGrowth;
  fearResolution: FearResolution;
}

export type HorrorRole = 
  | 'final-girl' | 'skeptic' | 'believer' | 'victim' | 'survivor'
  | 'investigator' | 'harbinger' | 'innocent' | 'corrupted' | 'hero'

export interface CharacterFearProfile {
  dominantFears: PrimalFearType[];
  fearIntensity: number;            // How easily frightened (1-10)
  fearExpression: FearExpression;   // How they show fear
  fearRecovery: number;             // How quickly they recover
  
  // Fear Triggers
  specificTriggers: string[];       // What specifically scares them
  phobias: string[];               // Irrational fears
  traumaResponses: string[];        // Fear from past trauma
  
  // Fear Resistance
  courageLevel: number;             // Ability to face fears
  rationalityFactor: number;        // Logic vs fear balance
  groupDependence: number;          // Need others to feel safe
}

// Horror Atmosphere Engine - Master Orchestrator
export class HorrorAtmosphereEngine {
  
  /**
   * V2.0 ENHANCED: Generate sophisticated horror using comprehensive terror architecture
   */
  static async generateEnhancedHorror(
    context: {
      projectTitle: string;
      horrorSubgenre: 'psychological' | 'supernatural' | 'body' | 'cosmic' | 'slasher' | 'folk' | 'social' | 'eco' | 'found-footage';
      setting: 'isolated' | 'confined' | 'domestic' | 'urban' | 'rural' | 'digital' | 'historical';
      targetAudience: string;
      narrativeScope: 'short' | 'feature' | 'series' | 'interactive' | 'vr' | 'streaming';
      thematicElements: string[];
      terrorObjectives: string[];
      atmosphericGoals: string[];
    },
    requirements: {
      psychologicalApproach: 'neurobiological' | 'evolutionary' | 'existential' | 'cultural';
      atmosphericIntensity: 'subtle' | 'moderate' | 'intense' | 'overwhelming';
      scareStrategy: 'psychological' | 'atmospheric' | 'jump-scares' | 'visceral' | 'existential';
      visualStyle: 'classic' | 'modern' | 'experimental' | 'hybrid';
      contemporaryRelevance: 'traditional' | 'digital' | 'social' | 'global' | 'interactive';
      culturalSensitivity: 'standard' | 'high' | 'international' | 'respectful';
    },
    options: {
      fearEngineering?: boolean;
      atmosphericMastery?: boolean;
      subgenreInnovation?: boolean;
      visualTerror?: boolean;
      modernAdaptation?: boolean;
    } = {}
  ): Promise<{ blueprint: HorrorBlueprint; horrorFramework: HorrorEngineRecommendation }> {
    try {
      // Generate V2.0 Horror Framework
      const horrorFramework = await HorrorEngineV2.generateHorrorEngineRecommendation(
        context,
        requirements,
        options
      );
      
      // Convert V2.0 context to legacy format
      const legacyInputs = this.convertToLegacyHorrorInputs(
        context,
        requirements,
        horrorFramework
      );
      
      // Generate enhanced horror blueprint using V2.0 insights
      const blueprint = this.generateHorrorBlueprint(
        legacyInputs.premise,
        legacyInputs.characters,
        legacyInputs.worldBlueprint,
        legacyInputs.genre,
        legacyInputs.horrorIntensity,
        legacyInputs.audienceType
      );
      
      // Apply V2.0 framework enhancements to blueprint
      const enhancedBlueprint = this.applyHorrorFrameworkToBlueprint(
        blueprint,
        horrorFramework
      );
      
      return {
        blueprint: enhancedBlueprint,
        horrorFramework
      };
    } catch (error) {
      console.error('Error generating enhanced horror:', error);
      throw error;
    }
  }

  /**
   * Generates comprehensive horror blueprint for the story
   */
  static generateHorrorBlueprint(
    premise: StoryPremise,
    characters: Character3D[],
    worldBlueprint: WorldBlueprint,
    genre: GenreProfile,
    horrorIntensity: HorrorIntensity = 'moderate',
    audienceType: HorrorAudience = 'general'
  ): HorrorBlueprint {
    
    // Analyze story requirements for horror
    const horrorRequirements = this.analyzeHorrorRequirements(
      premise, characters, worldBlueprint, genre
    );
    
    // Determine optimal horror type
    const horrorType = this.determineHorrorType(
      genre, horrorRequirements, audienceType
    );
    
    // Generate fear psychology framework
    const fearPsychology = this.generateFearPsychology(
      horrorType, horrorRequirements, audienceType
    );
    
    // Create dread mechanics
    const dreadMechanics = this.generateDreadMechanics(
      horrorType, fearPsychology, horrorIntensity
    );
    
    // Build scare architecture
    const scareArchitecture = this.generateScareArchitecture(
      horrorType, dreadMechanics, characters
    );
    
    // Develop environmental horror
    const environmentalHorror = this.generateEnvironmentalHorror(
      worldBlueprint, horrorType, horrorRequirements
    );
    
    // Create character fear integration
    const characterFears = this.generateCharacterFears(
      characters, horrorType, fearPsychology
    );
    
    // Establish atmospheric tension
    const atmosphericTension = this.generateAtmosphericTension(
      environmentalHorror, dreadMechanics, scareArchitecture
    );
    
    // Integrate with story elements
    const storyIntegration = this.integrateHorrorWithStory(
      premise, characters, horrorType, scareArchitecture
    );
    
    // Validate horror quality
    const qualityMetrics = this.validateHorrorQuality(
      fearPsychology, dreadMechanics, scareArchitecture, storyIntegration
    );
    
    return {
      id: `horror-${Date.now()}`,
      name: `${horrorType} Horror System`,
      horrorType,
      
      fearPsychology,
      dreadMechanics,
      atmosphericTension,
      unknownFactor: this.generateUnknownFactor(horrorType, scareArchitecture),
      
      scareArchitecture,
      fearEscalation: this.generateFearEscalation(scareArchitecture),
      suspenseBuilding: this.generateSuspenseBuilding(dreadMechanics),
      horrorRelease: this.generateHorrorRelease(dreadMechanics),
      
      environmentalHorror,
      soundscapeDesign: this.generateSoundscapeDesign(environmentalHorror),
      visualAtmosphere: this.generateVisualAtmosphere(environmentalHorror),
      sensoryManipulation: this.generateSensoryManipulation(environmentalHorror),
      
      characterFears,
      fearDynamics: this.generateFearDynamics(characterFears),
      horrorVulnerabilities: characterFears.map(cf => cf.vulnerabilities).flat(),
      
      premiseHorror: storyIntegration.premiseHorror,
      narrativeIntegration: storyIntegration.narrativeIntegration,
      thematicResonance: storyIntegration.thematicResonance,
      genreAuthenticity: storyIntegration.genreAuthenticity,
      
      fearProfile: this.generateFearProfile(audienceType),
      terrorImpact: this.calculateTerrorImpact(fearPsychology, audienceType),
      horrorEffectiveness: this.predictHorrorEffectiveness(qualityMetrics),
      
      atmosphereMetrics: qualityMetrics.atmosphere,
      fearConsistency: qualityMetrics.consistency,
      horrorAuthenticity: qualityMetrics.authenticity
    };
  }
  
  /**
   * Applies horror atmosphere to specific scenes
   */
  static applyHorrorAtmosphere(
    scene: NarrativeScene,
    horrorBlueprint: HorrorBlueprint,
    characters: Character3D[],
    tensionState: TensionState
  ): HorrorSceneApplication {
    
    // Identify horror opportunities in scene
    const horrorOpportunities = this.identifyHorrorOpportunities(
      scene, characters, horrorBlueprint
    );
    
    // Select appropriate horror techniques
    const selectedTechniques = this.selectHorrorTechniques(
      horrorOpportunities, horrorBlueprint, tensionState
    );
    
    // Generate atmospheric elements
    const atmosphericElements = this.generateSceneAtmosphericElements(
      scene, selectedTechniques, horrorBlueprint
    );
    
    // Calculate fear progression
    const fearProgression = this.calculateSceneFearProgression(
      atmosphericElements, horrorBlueprint.fearPsychology
    );
    
    // Apply dread mechanics
    const dreadApplication = this.applyDreadMechanics(
      fearProgression, horrorBlueprint.dreadMechanics, scene
    );
    
    // Integrate environmental horror
    const environmentalIntegration = this.integrateEnvironmentalHorror(
      scene, horrorBlueprint.environmentalHorror, atmosphericElements
    );
    
    return {
      scene,
      horrorOpportunities,
      selectedTechniques,
      atmosphericElements,
      fearProgression,
      dreadApplication,
      environmentalIntegration,
      expectedFear: this.predictSceneFearResponse(dreadApplication),
      storyImpact: this.assessHorrorStoryImpact(dreadApplication, scene)
    };
  }
  
  /**
   * Generates horror-specific dialogue and character interactions
   */
  static generateHorrorDialogue(
    character: Character3D,
    characterFear: CharacterFear,
    dialogueContext: DialogueContext,
    horrorBlueprint: HorrorBlueprint,
    currentFearLevel: number
  ): HorrorDialogue {
    
    // Analyze character's fear state
    const fearState = this.analyzeCharacterFearState(
      character, characterFear, currentFearLevel
    );
    
    // Generate fear-influenced dialogue
    const horrorContent = this.generateHorrorDialogueContent(
      character, dialogueContext, fearState, horrorBlueprint
    );
    
    // Apply fear psychology to delivery
    const fearDelivery = this.applyFearPsychologyToDialogue(
      horrorContent, fearState, horrorBlueprint.fearPsychology
    );
    
    // Create atmospheric dialogue enhancements
    const atmosphericEnhancements = this.createAtmosphericDialogueEnhancements(
      fearDelivery, horrorBlueprint.atmosphericTension
    );
    
    // Generate character fear responses
    const fearResponses = this.generateCharacterFearResponses(
      character, fearState, dialogueContext
    );
    
    return {
      character,
      horrorContent,
      fearDelivery,
      atmosphericEnhancements,
      fearResponses,
      expectedImpact: this.predictDialogueHorrorImpact(fearDelivery),
      audienceEffect: this.predictAudienceFearResponse(atmosphericEnhancements)
    };
  }
  
  /**
   * Manages horror integration with tension and pacing
   */
  static manageHorrorTensionBalance(
    horrorBlueprint: HorrorBlueprint,
    tensionState: TensionState,
    narrativeContext: NarrativeContext
  ): HorrorTensionBalance {
    
    // Analyze current fear vs tension levels
    const fearTensionAnalysis = this.analyzeFearTensionLevels(
      tensionState, narrativeContext, horrorBlueprint
    );
    
    // Determine horror appropriateness
    const horrorAppropriateness = this.assessHorrorAppropriateness(
      fearTensionAnalysis, horrorBlueprint, narrativeContext
    );
    
    // Calculate fear escalation balance
    const fearBalance = this.calculateFearEscalationBalance(
      tensionState, horrorBlueprint, horrorAppropriateness
    );
    
    // Generate horror-tension coordination
    const horrorCoordination = this.coordinateHorrorWithTension(
      fearBalance, horrorBlueprint, fearTensionAnalysis
    );
    
    // Plan horror pacing
    const horrorPacing = this.planHorrorPacing(
      horrorCoordination, horrorBlueprint, narrativeContext
    );
    
    return {
      fearTensionAnalysis,
      horrorAppropriateness,
      fearBalance,
      horrorCoordination,
      horrorPacing,
      balanceRecommendations: this.generateHorrorBalanceRecommendations(
        horrorCoordination, horrorPacing
      ),
      riskAssessment: this.assessHorrorRisks(
        fearBalance, narrativeContext
      )
    };
  }
  
  /**
   * Coordinates horror with all other narrative engines
   */
  static coordinateHorrorWithEngines(
    horrorBlueprint: HorrorBlueprint,
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
      comedy?: any;
    }
  ): HorrorEngineCoordinationResult {
    
    // Coordinate with Character Engine
    const characterCoordination = this.coordinateHorrorWithCharacters(
      horrorBlueprint, engineInputs.characters
    );
    
    // Coordinate with World Building Engine
    const worldCoordination = this.coordinateHorrorWithWorld(
      horrorBlueprint, engineInputs.world, characterCoordination
    );
    
    // Coordinate with Tension Engine
    const tensionCoordination = this.coordinateHorrorWithTension(
      horrorBlueprint, engineInputs.tension, engineInputs.narrative
    );
    
    // Coordinate with Dialogue Engine
    const dialogueCoordination = this.coordinateHorrorWithDialogue(
      horrorBlueprint, engineInputs.dialogue, characterCoordination
    );
    
    // Coordinate with Comedy Engine (if present)
    const comedyCoordination = engineInputs.comedy ? 
      this.coordinateHorrorWithComedy(horrorBlueprint, engineInputs.comedy) : null;
    
    return {
      characterCoordination,
      worldCoordination,
      tensionCoordination,
      dialogueCoordination,
      comedyCoordination,
      overallHarmony: this.assessHorrorEngineHarmony([
        characterCoordination,
        worldCoordination,
        tensionCoordination,
        dialogueCoordination,
        comedyCoordination
      ].filter(Boolean)),
      horrorIntegrity: this.validateHorrorIntegrity(horrorBlueprint, engineInputs)
    };
  }
  
  // Helper methods for horror generation
  
  private static analyzeHorrorRequirements(
    premise: StoryPremise,
    characters: Character3D[],
    world: WorldBlueprint,
    genre: GenreProfile
  ): HorrorRequirements {
    
    return {
      genreExpectations: this.analyzeGenreHorrorExpectations(genre),
      premiseHorror: this.analyzePremiseHorrorPotential(premise),
      characterFears: this.analyzeCharacterHorrorPotential(characters),
      worldHorror: this.analyzeWorldHorrorOpportunities(world),
      audienceExpectations: this.analyzeAudienceHorrorExpectations(genre),
      atmosphereRequirements: this.analyzeAtmosphereRequirements(premise, world)
    };
  }
  
  private static determineHorrorType(
    genre: GenreProfile,
    requirements: HorrorRequirements,
    audience: HorrorAudience
  ): HorrorType {
    
    // Analyze genre horror alignment
    const genreAlignment = this.analyzeGenreHorrorAlignment(genre);
    
    // Check audience preferences
    const audiencePreferences = this.analyzeAudienceHorrorPreferences(audience);
    
    // Calculate best horror type
    const horrorScores = this.calculateHorrorTypeScores(
      genreAlignment, audiencePreferences, requirements
    );
    
    // Return highest scoring horror type
    return Object.entries(horrorScores)
      .sort(([,a], [,b]) => b - a)[0][0] as HorrorType;
  }
  
  private static generateFearPsychology(
    horrorType: HorrorType,
    requirements: HorrorRequirements,
    audience: HorrorAudience
  ): FearPsychology {
    
    const primalFears: PrimalFear[] = [
      {
        type: 'darkness',
        description: 'Fear of the unseen and unknown',
        universality: 9,
        intensity: 8,
        triggers: ['loss of light', 'shadows', 'night scenes'],
        manifestations: ['visual obscurity', 'hidden threats', 'unknown sounds']
      },
      {
        type: 'isolation',
        description: 'Fear of being alone and helpless',
        universality: 8,
        intensity: 7,
        triggers: ['separation from group', 'empty spaces', 'silence'],
        manifestations: ['character alone', 'communication failure', 'abandoned places']
      },
      {
        type: 'death',
        description: 'Fear of mortality and ending',
        universality: 10,
        intensity: 9,
        triggers: ['violence', 'decay', 'corpses'],
        manifestations: ['character deaths', 'morbid imagery', 'life threats']
      }
    ];
    
    return {
      primalFears,
      culturalFears: this.generateCulturalFears(horrorType, audience),
      personalFears: this.generatePersonalFears(requirements),
      existentialFears: this.generateExistentialFears(horrorType),
      anticipationFear: { buildup: 'gradual', peakTiming: 0.8, sustainDuration: 30 },
      suddenFear: { triggerSpeed: 0.1, intensitySpike: 10, recoveryTime: 5 },
      prolongedFear: { duration: 120, intensity: 6, fatigueFactor: 0.7 },
      compoundFear: { layering: 3, amplification: 1.5, complexity: 8 },
      fearTriggers: this.generateFearTriggers(primalFears),
      phobicElements: this.generatePhobicElements(horrorType),
      anxietyAmplifiers: this.generateAnxietyAmplifiers(requirements),
      desensitizationRisk: 0.3,
      fearTolerance: 7,
      recoveryTime: 10,
      buildupSustainability: 8
    };
  }
  
  // Additional helper method stubs for completeness
  private static generateDreadMechanics(type: HorrorType, psychology: FearPsychology, intensity: HorrorIntensity): DreadMechanics {
    return {
      dreadPattern: { name: 'Gradual Escalation', description: 'Slowly building dread', phases: [], duration: 180, peakIntensity: 9, sustainabilityRating: 8 },
      buildupCurve: { pattern: 'exponential', duration: 120, peakPoint: 0.85 },
      sustainedTension: { level: 7, duration: 60, techniques: ['atmospheric pressure', 'ominous music'] },
      dreadRelease: { method: 'gradual-relief', timing: 15, effectiveness: 8 },
      atmosphericPressure: { weight: 8, oppression: 7, claustrophobia: 6 },
      environmentalOppression: { visual: 8, auditory: 9, spatial: 7 },
      psychologicalWeight: { intensity: 8, persistence: 9, accumulation: 7 },
      ominousSignals: [],
      portents: [],
      warnings: [],
      prophecies: [],
      intensityManagement: { peakControl: 9, valleyBalance: 6, sustainability: 8 },
      fatiguePrevention: { variation: 8, recovery: 7, pacing: 9 },
      variationTechniques: []
    };
  }
  
  // More helper method stubs...
  private static generateScareArchitecture(type: HorrorType, dread: DreadMechanics, chars: Character3D[]): ScareArchitecture {
    return {
      jumpScares: [],
      creepingScares: [],
      revelationScares: [],
      atmosphericScares: [],
      scareSequencing: { pattern: 'escalating', spacing: 'variable', peaks: 3 },
      scarePacing: { rhythm: 'irregular', buildupRatio: 0.7, releaseRatio: 0.3 },
      scareEscalation: { progression: 'exponential', peakNumber: 5, finalIntensity: 10 },
      scareSetups: [],
      fearPayoffs: [],
      falseScares: [],
      scareVariations: [],
      scareRecovery: [],
      tensionReset: [],
      audienceRecalibration: { frequency: 'as-needed', method: 'relief-moment', effectiveness: 8 }
    };
  }
  
  private static generateEnvironmentalHorror(world: WorldBlueprint, type: HorrorType, req: HorrorRequirements): EnvironmentalHorror {
    return {
      locations: [],
      spatialManipulation: { disorientation: 8, impossibleGeometry: 6, claustrophobia: 9 },
      architecturalHorror: { design: 'oppressive', lighting: 'minimal', acoustics: 'echo-heavy' },
      weather: { storms: 8, fog: 9, temperature: 'cold', pressure: 'low' },
      lighting: { darkness: 9, shadows: 8, flicker: 7, contrast: 'high' },
      temperature: { cold: 8, drafts: 7, humidity: 'oppressive' },
      air: { staleness: 8, odors: 'decay', breathing: 'difficult' },
      visualDisturbances: [],
      auditoryHorror: { silence: 9, suddenSounds: 8, ambientDread: 7 },
      tactileHorror: { texture: 'unpleasant', temperature: 'shocking', pressure: 'oppressive' },
      olfactoryHorror: { decay: 8, chemical: 6, unknown: 9 },
      environmentalClues: [],
      atmosphericNarrative: { storytelling: 'environmental', clues: 'visual', history: 'implied' },
      locationCharacter: { personality: 'malevolent', awareness: 'sentient', hostility: 'active' }
    };
  }
  
  private static generateCharacterFears(chars: Character3D[], type: HorrorType, psychology: FearPsychology): CharacterFear[] {
    return [];
  }
  
  // More helper method stubs...
  private static generateAtmosphericTension(env: EnvironmentalHorror, dread: DreadMechanics, scare: ScareArchitecture): any { return {}; }
  private static integrateHorrorWithStory(premise: StoryPremise, chars: Character3D[], type: HorrorType, scare: ScareArchitecture): any { return {}; }
  private static validateHorrorQuality(psychology: FearPsychology, dread: DreadMechanics, scare: ScareArchitecture, integration: any): any { return {}; }
  private static generateUnknownFactor(type: HorrorType, scare: ScareArchitecture): any { return {}; }

  /**
   * Helper method to convert V2.0 context to legacy format
   */
  private static convertToLegacyHorrorInputs(
    context: any,
    requirements: any,
    framework: HorrorEngineRecommendation
  ): any {
    return {
      premise: {
        id: `premise-${Date.now()}`,
        theme: context.thematicElements[0] || 'Fear and terror',
        premiseStatement: `${context.horrorSubgenre} horror in ${context.setting} setting`,
        character: 'Protagonist facing terror',
        conflict: 'Survival vs horrific threat',
        want: 'Safety and escape',
        need: 'Courage to confront fear',
        change: 'Transformation through terror',
        result: requirements.scareStrategy === 'existential' ? 'Profound fear realization' : 'Terror survived'
      } as StoryPremise,
      
      characters: [
        {
          name: 'Horror Protagonist',
          background: `Character experiencing ${context.horrorSubgenre} terror`,
          motivation: context.terrorObjectives[0] || 'Survival',
          personalityTraits: requirements.psychologicalApproach === 'neurobiological' ? 
            ['reactive', 'intuitive', 'vulnerable'] : 
            ['analytical', 'skeptical', 'resourceful'],
          fears: requirements.scareStrategy === 'psychological' ? 
            ['loss of sanity', 'helplessness'] : 
            ['physical harm', 'death', 'unknown']
        }
      ] as Character3D[],
      
      worldBlueprint: {
        id: `world-${Date.now()}`,
        description: `${context.setting} environment designed for ${context.horrorSubgenre} horror`,
        horrorElements: context.atmosphericGoals
      } as WorldBlueprint,
      
      genre: {
        id: 'horror',
        category: 'horror',
        conventions: [`${context.horrorSubgenre} subgenre`, `${requirements.scareStrategy} approach`],
        horrorStyle: requirements.atmosphericIntensity
      } as GenreProfile,
      
      horrorIntensity: requirements.atmosphericIntensity === 'overwhelming' ? 'extreme' :
                      requirements.atmosphericIntensity === 'intense' ? 'intense' :
                      requirements.atmosphericIntensity === 'subtle' ? 'mild' : 'moderate',
      
      audienceType: context.targetAudience.includes('mature') ? 'mature' :
                   context.targetAudience.includes('adult') ? 'adult' :
                   context.targetAudience.includes('teen') ? 'teen' : 'general'
    };
  }

  /**
   * Helper method to apply V2.0 framework enhancements to existing blueprint
   */
  private static applyHorrorFrameworkToBlueprint(
    blueprint: HorrorBlueprint,
    framework: HorrorEngineRecommendation
  ): HorrorBlueprint {
    const enhancedBlueprint = { ...blueprint };
    
    // Add framework metadata
    (enhancedBlueprint as any).horrorFrameworkV2 = {
      frameworkVersion: 'HorrorEngineV2',
      confidence: framework.primaryRecommendation.confidence,
      
      // Psychological Architecture
      psychologicalFoundations: {
        neurobiologyOfTerror: framework.primaryRecommendation.psychologicalArchitecture.neurobiologyOfTerror,
        evolutionaryFears: framework.primaryRecommendation.psychologicalArchitecture.evolutionaryFears,
        existentialDread: framework.primaryRecommendation.psychologicalArchitecture.existentialDread,
        culturalMirror: framework.primaryRecommendation.psychologicalArchitecture.culturalMirror
      },
      
      // Grammar of Atmosphere
      atmosphericConstruction: {
        psychologyOfSpace: framework.primaryRecommendation.grammarOfAtmosphere.psychologyOfSpace,
        architectureOfSound: framework.primaryRecommendation.grammarOfAtmosphere.architectureOfSound,
        chiaroscuroTerror: framework.primaryRecommendation.grammarOfAtmosphere.chiaroscuroTerror,
        rhythmOfFear: framework.primaryRecommendation.grammarOfAtmosphere.rhythmOfFear
      },
      
      // Taxonomy of Terror
      subgenreFrameworks: {
        psychologicalHorror: framework.primaryRecommendation.taxonomyOfTerror.psychologicalHorror,
        supernaturalHorror: framework.primaryRecommendation.taxonomyOfTerror.supernaturalHorror,
        bodyHorror: framework.primaryRecommendation.taxonomyOfTerror.bodyHorror,
        cosmicHorror: framework.primaryRecommendation.taxonomyOfTerror.cosmicHorror,
        slasherHorror: framework.primaryRecommendation.taxonomyOfTerror.slasherHorror,
        folkHorror: framework.primaryRecommendation.taxonomyOfTerror.folkHorror
      },
      
      // Visual Language
      cinematographicTerror: {
        predatorEye: framework.primaryRecommendation.visualLanguage.predatorEye,
        craftingNightmares: framework.primaryRecommendation.visualLanguage.craftingNightmares,
        colorOfFear: framework.primaryRecommendation.visualLanguage.colorOfFear
      },
      
      // Future of Fear
      contemporaryInnovation: {
        digitalGhost: framework.primaryRecommendation.futureOfFear.digitalGhost,
        horrorAsMetaphor: framework.primaryRecommendation.futureOfFear.horrorAsMetaphor,
        globalScream: framework.primaryRecommendation.futureOfFear.globalScream,
        newCanvases: framework.primaryRecommendation.futureOfFear.newCanvases
      },
      
      // Strategic Guidance
      horrorStrategy: framework.horrorStrategy,
      implementationGuidance: framework.implementationGuidance,
      terrorCraft: framework.terrorCraft
    };
    
    // Enhance fear psychology with V2.0 neurobiological insights
    if (enhancedBlueprint.fearPsychology) {
      (enhancedBlueprint.fearPsychology as any).frameworkEnhancement = {
        neurobiologicalFoundation: framework.primaryRecommendation.psychologicalArchitecture.neurobiologyOfTerror,
        evolutionaryBasis: framework.primaryRecommendation.psychologicalArchitecture.evolutionaryFears,
        existentialCore: framework.primaryRecommendation.psychologicalArchitecture.existentialDread
      };
    }
    
    // Enhance atmospheric tension with V2.0 space psychology
    if (enhancedBlueprint.atmosphericTension) {
      (enhancedBlueprint.atmosphericTension as any).v2Enhancement = {
        spaceManipulation: framework.primaryRecommendation.grammarOfAtmosphere.psychologyOfSpace,
        soundArchitecture: framework.primaryRecommendation.grammarOfAtmosphere.architectureOfSound,
        lightingTerror: framework.primaryRecommendation.grammarOfAtmosphere.chiaroscuroTerror
      };
    }
    
    // Enhance scare architecture with V2.0 rhythm of fear
    if (enhancedBlueprint.scareArchitecture) {
      (enhancedBlueprint.scareArchitecture as any).frameworkGuidance = {
        temporalManipulation: framework.primaryRecommendation.grammarOfAtmosphere.rhythmOfFear,
        subgenreSpecialization: framework.primaryRecommendation.taxonomyOfTerror,
        visualExecution: framework.primaryRecommendation.visualLanguage.predatorEye
      };
    }
    
    // Enhance environmental horror with V2.0 visual language
    if (enhancedBlueprint.environmentalHorror) {
      (enhancedBlueprint.environmentalHorror as any).v2Framework = {
        cinematographicApproach: framework.primaryRecommendation.visualLanguage.predatorEye,
        effectsIntegration: framework.primaryRecommendation.visualLanguage.craftingNightmares,
        colorPsychology: framework.primaryRecommendation.visualLanguage.colorOfFear
      };
    }
    
    // Enhance character fears with V2.0 psychological architecture
    if (enhancedBlueprint.characterFears) {
      enhancedBlueprint.characterFears.forEach((fear: any) => {
        fear.frameworkGuidance = {
          evolutionaryFears: framework.primaryRecommendation.psychologicalArchitecture.evolutionaryFears,
          culturalMirror: framework.primaryRecommendation.psychologicalArchitecture.culturalMirror,
          contemporaryRelevance: framework.primaryRecommendation.futureOfFear.horrorAsMetaphor
        };
      });
    }
    
    return enhancedBlueprint;
  }
}

// Supporting interfaces and types
export type HorrorIntensity = 'mild' | 'moderate' | 'intense' | 'extreme';
export type HorrorAudience = 'family' | 'teen' | 'adult' | 'mature' | 'hardcore';

export interface HorrorRequirements {
  genreExpectations: any;
  premiseHorror: any;
  characterFears: any;
  worldHorror: any;
  audienceExpectations: any;
  atmosphereRequirements: any;
}

export interface HorrorSceneApplication {
  scene: NarrativeScene;
  horrorOpportunities: any[];
  selectedTechniques: any[];
  atmosphericElements: any;
  fearProgression: any;
  dreadApplication: any;
  environmentalIntegration: any;
  expectedFear: any;
  storyImpact: any;
}

export interface HorrorDialogue {
  character: Character3D;
  horrorContent: any;
  fearDelivery: any;
  atmosphericEnhancements: any;
  fearResponses: any;
  expectedImpact: any;
  audienceEffect: any;
}

export interface HorrorTensionBalance {
  fearTensionAnalysis: any;
  horrorAppropriateness: any;
  fearBalance: any;
  horrorCoordination: any;
  horrorPacing: any;
  balanceRecommendations: any;
  riskAssessment: any;
}

export interface HorrorEngineCoordinationResult {
  characterCoordination: any;
  worldCoordination: any;
  tensionCoordination: any;
  dialogueCoordination: any;
  comedyCoordination: any;
  overallHarmony: number;
  horrorIntegrity: boolean;
}

// Additional supporting interfaces...
export interface CulturalFear { culture: string; fear: string; intensity: number; }
export interface PersonalFear { character: string; fear: string; origin: string; }
export interface ExistentialFear { concept: string; description: string; universality: number; }
export interface AnticipationFear { buildup: string; peakTiming: number; sustainDuration: number; }
export interface SuddenFear { triggerSpeed: number; intensitySpike: number; recoveryTime: number; }
export interface ProlongedFear { duration: number; intensity: number; fatigueFactor: number; }
export interface CompoundFear { layering: number; amplification: number; complexity: number; }
export interface FearTrigger { trigger: string; effectiveness: number; universality: number; }
export interface PhobicElement { phobia: string; manifestation: string; intensity: number; }
export interface AnxietyAmplifier { amplifier: string; effect: number; duration: number; }
export interface BuildupCurve { pattern: string; duration: number; peakPoint: number; }
export interface SustainedTension { level: number; duration: number; techniques: string[]; }
export interface DreadRelease { method: string; timing: number; effectiveness: number; }
export interface AtmosphericPressure { weight: number; oppression: number; claustrophobia: number; }
export interface EnvironmentalOppression { visual: number; auditory: number; spatial: number; }
export interface PsychologicalWeight { intensity: number; persistence: number; accumulation: number; }
export interface OminousSignal { signal: string; interpretation: string; foreboding: number; }
export interface Portent { event: string; meaning: string; accuracy: number; }
export interface Warning { source: string; message: string; heeded: boolean; }
export interface Prophecy { prophecy: string; fulfillment: string; inevitability: number; }
export interface IntensityManagement { peakControl: number; valleyBalance: number; sustainability: number; }
export interface FatiguePrevention { variation: number; recovery: number; pacing: number; }
export interface VariationTechnique { technique: string; effectiveness: number; }
export interface PhaseTransition { fromPhase: string; toPhase: string; method: string; }
export interface ScareSequencing { pattern: string; spacing: string; peaks: number; }
export interface ScarePacing { rhythm: string; buildupRatio: number; releaseRatio: number; }
export interface ScareEscalation { progression: string; peakNumber: number; finalIntensity: number; }
export interface ScareSetup { description: string; duration: number; subtlety: number; }
export interface ScareTrigger { trigger: string; timing: number; effectiveness: number; }
export interface ScareExecution { method: string; intensity: number; duration: number; }
export interface FearPayoff { setup: string; payoff: string; satisfaction: number; }
export interface FalseScare { setup: string; misdirection: string; relief: number; }
export interface ScareVariation { baseType: string; variation: string; novelty: number; }
export interface ScareRecovery { method: string; duration: number; effectiveness: number; }
export interface TensionReset { trigger: string; method: string; completeness: number; }
export interface AudienceRecalibration { frequency: string; method: string; effectiveness: number; }
export interface SpatialManipulation { disorientation: number; impossibleGeometry: number; claustrophobia: number; }
export interface ArchitecturalHorror { design: string; lighting: string; acoustics: string; }
export interface WeatherHorror { storms: number; fog: number; temperature: string; pressure: string; }
export interface LightingHorror { darkness: number; shadows: number; flicker: number; contrast: string; }
export interface TemperatureHorror { cold: number; drafts: number; humidity: string; }
export interface AirHorror { staleness: number; odors: string; breathing: string; }
export interface VisualDisturbance { type: string; intensity: number; frequency: number; }
export interface AuditoryHorror { silence: number; suddenSounds: number; ambientDread: number; }
export interface TactileHorror { texture: string; temperature: string; pressure: string; }
export interface OlfactoryHorror { decay: number; chemical: number; unknown: number; }
export interface EnvironmentalClue { clue: string; implication: string; visibility: number; }
export interface AtmosphericNarrative { storytelling: string; clues: string; history: string; }
export interface LocationCharacter { personality: string; awareness: string; hostility: string; }
export interface LocationLayout { complexity: string; accessibility: string; safety: string; }
export interface LocationAccessibility { entrances: number; exits: number; mobility: string; }
export interface LocationVisibility { sightlines: string; hidingSpots: number; exposure: string; }
export interface LocationIsolation { distance: string; communication: string; help: string; }
export interface CharacterFearProfile { dominantFears: PrimalFearType[]; fearIntensity: number; fearExpression: any; fearRecovery: number; specificTriggers: string[]; phobias: string[]; traumaResponses: string[]; courageLevel: number; rationalityFactor: number; groupDependence: number; }
export interface FearVulnerability { vulnerability: string; trigger: string; intensity: number; }
export interface FearReaction { trigger: string; reaction: string; intensity: number; }
export interface CopingMechanism { mechanism: string; effectiveness: number; sustainability: number; }
export interface FearEvolution { progression: string; milestones: string[]; resolution: string; }
export interface CharacterFearDynamics { fearInteractions: string[]; influence: number; }
export interface HorrorArc { beginning: string; middle: string; end: string; }
export interface FearMotivation { motivation: string; strength: number; }
export interface HorrorGrowth { growth: string; catalyst: string; }
export interface FearResolution { resolution: string; satisfaction: number; }
export interface FearExpression { physical: string[]; verbal: string[]; behavioral: string[]; }
export interface NarrativeContext { episode: number; tension: number; pacing: string; timeOfDay: string; }
export interface DialogueContext { setting: string; purpose: string; participants: string[]; fearLevel: number; } 
/**
 * The Horror Atmosphere Engine - Master of Fear Psychology
 * 
 * This system brings scientific understanding to horror, mastering fear psychology,
 * building sustained dread, orchestrating perfectly-timed scares, and creating
 * atmospheric tension that penetrates the audience's psychological defenses.
 * 
 * Key Principle: True horror lives in the unknown - the fear of what might be lurking
 */

