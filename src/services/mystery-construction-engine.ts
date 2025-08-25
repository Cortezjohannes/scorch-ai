/**
 * The Mystery Construction Engine - Master of Logical Puzzles
 * 
 * This system brings mathematical precision to mystery construction, mastering
 * fair play principles, orchestrating clue distribution, managing red herrings,
 * and timing revelations for maximum impact while maintaining logical integrity.
 * 
 * Key Principle: Every mystery must be solvable by the audience with the same information as the detective
 */

import { StoryPremise } from './premise-engine'
import { Character3D } from './character-engine'
import { NarrativeScene } from './fractal-narrative-engine'
import { DialogueExchange } from './strategic-dialogue-engine'
import { TensionState } from './tension-escalation-engine'
import { WorldBlueprint } from './world-building-engine'
import { GenreProfile } from './genre-mastery-system'
import { MysteryEngineV2, type MysteryEngineRecommendation } from './mystery-engine-v2'

// Core Mystery Architecture
export interface MysteryBlueprint {
  id: string;
  name: string;
  mysteryType: MysteryType;
  
  // Mystery Core Elements
  centralMystery: CentralMystery;
  mysteryStructure: MysteryStructure;
  solutionArchitecture: SolutionArchitecture;
  fairPlayPrinciples: FairPlayPrinciples;
  
  // Clue Systems
  clueDistribution: ClueDistribution;
  evidenceManagement: EvidenceManagement;
  redHerringStrategy: RedHerringStrategy;
  revelationTiming: RevelationTiming;
  
  // Investigation Framework
  investigationProcess: InvestigationProcess;
  detectiveReasoning: DetectiveReasoning;
  puzzleMechanics: PuzzleMechanics;
  deductiveLogic: DeductiveLogic;
  
  // Character Integration
  mysteryCharacters: MysteryCharacter[];
  suspectProfiles: SuspectProfile[];
  witnessTestimonies: WitnessTestimony[];
  
  // Story Integration
  premiseMystery: PremiseMystery;
  narrativeIntegration: NarrativeIntegration;
  thematicResonance: ThematicResonance;
  genreAuthenticity: GenreAuthenticity;
  
  // Audience Engagement
  puzzleComplexity: PuzzleComplexity;
  solvabilityFactor: SolvabilityFactor;
  mysteryImpact: MysteryImpact;
  
  // Quality Metrics
  logicalConsistency: LogicalConsistency;
  fairPlayRating: FairPlayRating;
  mysteryAuthenticity: MysteryAuthenticity;
}

export type MysteryType = 
  | 'whodunit' | 'howdunit' | 'whydunit' | 'locked-room' | 'impossible-crime'
  | 'procedural' | 'cozy-mystery' | 'hard-boiled' | 'psychological-mystery'
  | 'historical-mystery' | 'amateur-detective' | 'police-procedural'

// Central Mystery System
export interface CentralMystery {
  // Core Mystery Elements
  mysteryQuestion: string;            // The central question to be solved
  mysteryCategory: MysteryCategory;   // Type of mystery problem
  complexityLevel: number;            // Difficulty rating (1-10)
  solutionUniqueness: number;         // How many possible solutions exist
  
  // Mystery Components
  criminalAct: CriminalAct;          // What happened
  perpetrator: Perpetrator;          // Who did it
  motive: Motive;                    // Why they did it
  method: Method;                    // How they did it
  opportunity: Opportunity;          // When/where they could do it
  
  // Mystery Stakes
  personalStakes: string;            // What matters to characters
  socialStakes: string;              // Broader implications
  moralStakes: string;               // Ethical dimensions
  
  // Solution Requirements
  solutionElements: SolutionElement[];
  requiredDeductions: string[];      // Logical steps needed
  criticalInsights: string[];        // Key realizations
}

export type MysteryCategory = 
  | 'murder' | 'theft' | 'disappearance' | 'fraud' | 'conspiracy'
  | 'kidnapping' | 'blackmail' | 'espionage' | 'sabotage' | 'identity'

export interface CriminalAct {
  description: string;
  timeline: CrimeTimeline[];
  location: CrimeLocation;
  evidence: EvidenceTrace[];
  
  // Act Characteristics
  plannedVsSpontaneous: number;      // How premeditated (1-10)
  skillLevel: number;                // Expertise required (1-10)
  riskLevel: number;                 // Danger/boldness involved (1-10)
  sophistication: number;            // Complexity of execution (1-10)
}

// Clue Distribution System
export interface ClueDistribution {
  // Clue Categories
  physicalClues: PhysicalClue[];
  testimonialClues: TestimonialClue[];
  circumstantialClues: CircumstantialClue[];
  behavioralClues: BehavioralClue[];
  
  // Distribution Strategy
  clueProgression: ClueProgression;
  difficultyScaling: DifficultyScaling;
  accessibilityPattern: AccessibilityPattern;
  
  // Clue Relationships
  clueConnections: ClueConnection[];
  clueConflicts: ClueConflict[];
  clueCombinations: ClueCombination[];
  
  // Fair Play Management
  visibilityEnsurance: VisibilityEnsurance;
  comprehensibilityCheck: ComprehensibilityCheck;
  deducibilityValidation: DeducibilityValidation;
}

export interface PhysicalClue {
  id: string;
  description: string;
  location: string;
  discoveryTiming: number;           // When it should be found (1-10)
  
  // Clue Properties
  obviousness: number;               // How noticeable it is (1-10)
  interpretability: number;          // How clear its meaning is (1-10)
  significance: number;              // How important to solution (1-10)
  uniqueness: number;                // How distinctive it is (1-10)
  
  // Forensic Details
  forensicValue: ForensicValue;
  chainOfCustody: string[];
  expertiseRequired: string[];       // What knowledge needed to interpret
  
  // Logical Connections
  connectsTo: string[];              // Other clues this relates to
  contradicts: string[];             // What this clue disputes
  confirms: string[];                // What this clue supports
}

// Red Herring Strategy System
export interface RedHerringStrategy {
  // Red Herring Types
  falseClues: FalseClue[];
  misdirectionTactics: MisdirectionTactic[];
  suspicionManipulation: SuspicionManipulation[];
  
  // Strategic Implementation
  herringDistribution: HerringDistribution;
  believabilityMaintenance: BelievabilityMaintenance;
  revelationManagement: RevelationManagement;
  
  // Fair Play Balance
  herringToRealClueRatio: number;    // Balance of false vs real clues
  misdirectionIntensity: number;     // How strongly audience is misled
  clarificationTiming: number[];     // When red herrings are revealed
  
  // Audience Psychology
  expectationManagement: ExpectationManagement;
  suspenseEnhancement: SuspenseEnhancement;
  satisfactionProtection: SatisfactionProtection;
}

export interface FalseClue {
  id: string;
  description: string;
  believabilityScore: number;        // How convincing it is (1-10)
  
  // Misdirection Elements
  suggestedConclusion: string;       // What it seems to indicate
  actualExplanation: string;         // The innocent truth
  discoveryContext: string;          // How/where it's found
  
  // Red Herring Management
  sustainabilityDuration: number;    // How long misdirection lasts
  clarificationMethod: string;       // How truth is revealed
  audienceClues: string[];           // Hints that it's a red herring
  
  // Story Integration
  characterRelevance: string;        // How it relates to characters
  plotFunction: string;              // What story purpose it serves
  thematicConnection: string;        // How it supports themes
}

// Investigation Process System
export interface InvestigationProcess {
  // Investigation Structure
  investigationPhases: InvestigationPhase[];
  methodologyApproach: MethodologyApproach;
  evidenceGathering: EvidenceGathering;
  
  // Detective Work
  questioningStrategy: QuestioningStrategy;
  observationTechniques: ObservationTechnique[];
  analyticalMethods: AnalyticalMethod[];
  
  // Process Flow
  investigationRhythm: InvestigationRhythm;
  discoveryPacing: DiscoveryPacing;
  breakthroughMoments: BreakthroughMoment[];
  
  // Logical Progression
  deductiveSteps: DeductiveStep[];
  eliminationProcess: EliminationProcess;
  synthesisPhase: SynthesisPhase;
}

export interface InvestigationPhase {
  name: string;
  duration: number;                  // Percentage of total investigation
  primaryFocus: string;              // Main objective of this phase
  
  // Phase Activities
  keyActivities: string[];           // What detective does
  expectedDiscoveries: string[];     // What should be found
  characterInteractions: string[];   // Who detective talks to
  
  // Phase Outcomes
  knowledgeGained: string[];         // What detective learns
  questionsRaised: string[];         // New mysteries that emerge
  suspicionsGenerated: string[];     // Who becomes suspicious
  
  // Transition Elements
  phaseTransition: string;           // What moves to next phase
  cliffhangerPotential: string;      // How phase can end dramatically
}

// Character Mystery Integration
export interface MysteryCharacter {
  character: Character3D;
  mysteryRole: MysteryRole;
  secretsHeld: Secret[];
  
  // Character Mystery Profile
  knowledgeLevel: number;            // How much they know (1-10)
  involvementLevel: number;          // How connected to mystery (1-10)
  credibilityRating: number;         // How trustworthy they seem (1-10)
  suspicionLevel: number;            // How suspicious they appear (1-10)
  
  // Mystery Behaviors
  mysteryBehaviors: MysteryBehavior[];
  investigativeCapacity: InvestigativeCapacity;
  informationSharing: InformationSharing;
  
  // Character Arc Through Mystery
  mysteryGrowth: MysteryGrowth;
  relationshipChanges: RelationshipChange[];
  moralEvolution: MoralEvolution;
}

export type MysteryRole = 
  | 'detective' | 'suspect' | 'witness' | 'victim' | 'expert'
  | 'red-herring' | 'informant' | 'obstacle' | 'ally' | 'catalyst'

export interface Secret {
  description: string;
  secretType: SecretType;
  relevanceToMystery: number;        // How connected to main mystery (1-10)
  
  // Secret Characteristics
  damageIfRevealed: number;          // Consequences of exposure (1-10)
  difficultyToDiscover: number;      // How hard to uncover (1-10)
  willingnessToShare: number;        // Character's openness about it (1-10)
  
  // Revelation Management
  revelationTriggers: string[];      // What would cause disclosure
  revelationConsequences: string[];  // What happens when revealed
  protectionMethods: string[];       // How character hides it
}

export type SecretType = 
  | 'guilty-knowledge' | 'personal-shame' | 'protective-lie' | 'innocent-misdeed'
  | 'romantic-secret' | 'financial-secret' | 'family-secret' | 'professional-secret'

// Mystery Construction Engine - Master Orchestrator
export class MysteryConstructionEngine {
  
  /**
   * V2.0 ENHANCED: Generate sophisticated mystery using comprehensive theoretical frameworks
   */
  static async generateEnhancedMystery(
    context: {
      projectTitle: string;
      mysteryType: 'whodunit' | 'howdunit' | 'whydunit' | 'locked-room' | 'impossible-crime' | 'police-procedural' | 'cozy' | 'hardboiled';
      setting: 'contemporary' | 'historical' | 'international' | 'small-town' | 'urban' | 'isolated';
      targetAudience: string;
      narrativeScope: 'short-story' | 'novella' | 'novel' | 'series' | 'episodic' | 'serialized';
      thematicElements: string[];
      mysteryObjectives: string[];
      genreHybridization: string[];
    },
    requirements: {
      architecturalApproach: 'doyle-cerebral' | 'christie-social' | 'hybrid' | 'modern';
      logicalComplexity: 'simple' | 'moderate' | 'complex' | 'expert';
      characterFocus: 'detective-driven' | 'ensemble' | 'victim-focused' | 'psychological';
      fairPlayAdherence: 'strict' | 'flexible' | 'modern' | 'experimental';
      modernElements: 'traditional' | 'forensic' | 'digital' | 'global';
      genreIntegration: 'pure' | 'light-hybrid' | 'balanced-hybrid' | 'heavy-hybrid';
    },
    options: {
      deceptionMastery?: boolean;
      logicalRigidity?: boolean;
      characterDepth?: boolean;
      genreInnovation?: boolean;
      modernAdaptation?: boolean;
    } = {}
  ): Promise<{ blueprint: MysteryBlueprint; mysteryFramework: MysteryEngineRecommendation }> {
    try {
      // Generate V2.0 Mystery Framework
      const mysteryFramework = await MysteryEngineV2.generateMysteryEngineRecommendation(
        context,
        requirements,
        options
      );
      
      // Convert V2.0 context to legacy format
      const legacyInputs = this.convertToLegacyMysteryInputs(
        context,
        requirements,
        mysteryFramework
      );
      
      // Generate enhanced mystery blueprint using V2.0 insights
      const blueprint = this.generateMysteryBlueprint(
        legacyInputs.premise,
        legacyInputs.characters,
        legacyInputs.worldBlueprint,
        legacyInputs.genre,
        legacyInputs.mysteryComplexity,
        legacyInputs.solvabilityLevel
      );
      
      // Apply V2.0 framework enhancements to blueprint
      const enhancedBlueprint = this.applyMysteryFrameworkToBlueprint(
        blueprint,
        mysteryFramework
      );
      
      return {
        blueprint: enhancedBlueprint,
        mysteryFramework
      };
    } catch (error) {
      console.error('Error generating enhanced mystery:', error);
      throw error;
    }
  }

  /**
   * Generates comprehensive mystery blueprint for the story
   */
  static generateMysteryBlueprint(
    premise: StoryPremise,
    characters: Character3D[],
    worldBlueprint: WorldBlueprint,
    genre: GenreProfile,
    mysteryComplexity: MysteryComplexity = 'moderate',
    solvabilityLevel: SolvabilityLevel = 'challenging'
  ): MysteryBlueprint {
    
    // Analyze story requirements for mystery
    const mysteryRequirements = this.analyzeMysteryRequirements(
      premise, characters, worldBlueprint, genre
    );
    
    // Determine optimal mystery type
    const mysteryType = this.determineMysteryType(
      genre, mysteryRequirements, mysteryComplexity
    );
    
    // Generate central mystery
    const centralMystery = this.generateCentralMystery(
      mysteryType, characters, premise, mysteryComplexity
    );
    
    // Create solution architecture
    const solutionArchitecture = this.generateSolutionArchitecture(
      centralMystery, characters, solvabilityLevel
    );
    
    // Build clue distribution system
    const clueDistribution = this.generateClueDistribution(
      centralMystery, solutionArchitecture, mysteryComplexity
    );
    
    // Develop mystery characters
    const mysteryCharacters = this.generateMysteryCharacters(
      characters, mysteryType, centralMystery
    );
    
    // Create investigation framework
    const investigationProcess = this.generateInvestigationProcess(
      mysteryType, clueDistribution, mysteryCharacters
    );
    
    // Generate red herring strategy
    const redHerringStrategy = this.generateRedHerringStrategy(
      clueDistribution, mysteryComplexity, solvabilityLevel
    );
    
    // Establish fair play principles
    const fairPlayPrinciples = this.establishFairPlayPrinciples(
      clueDistribution, redHerringStrategy, solutionArchitecture
    );
    
    // Integrate with story elements
    const storyIntegration = this.integrateMysteryWithStory(
      premise, centralMystery, mysteryCharacters
    );
    
    // Validate mystery quality
    const qualityMetrics = this.validateMysteryQuality(
      centralMystery, clueDistribution, solutionArchitecture, 
      fairPlayPrinciples, storyIntegration
    );
    
    return {
      id: `mystery-${Date.now()}`,
      name: `${mysteryType} Mystery System`,
      mysteryType,
      
      centralMystery,
      mysteryStructure: this.generateMysteryStructure(centralMystery),
      solutionArchitecture,
      fairPlayPrinciples,
      
      clueDistribution,
      evidenceManagement: this.generateEvidenceManagement(clueDistribution),
      redHerringStrategy,
      revelationTiming: this.generateRevelationTiming(clueDistribution),
      
      investigationProcess,
      detectiveReasoning: this.generateDetectiveReasoning(investigationProcess),
      puzzleMechanics: this.generatePuzzleMechanics(centralMystery),
      deductiveLogic: this.generateDeductiveLogic(solutionArchitecture),
      
      mysteryCharacters,
      suspectProfiles: mysteryCharacters.filter(mc => mc.mysteryRole === 'suspect').map(mc => this.generateSuspectProfile(mc)),
      witnessTestimonies: mysteryCharacters.filter(mc => mc.mysteryRole === 'witness').map(mc => this.generateWitnessTestimony(mc)),
      
      premiseMystery: storyIntegration.premiseMystery,
      narrativeIntegration: storyIntegration.narrativeIntegration,
      thematicResonance: storyIntegration.thematicResonance,
      genreAuthenticity: storyIntegration.genreAuthenticity,
      
      puzzleComplexity: this.generatePuzzleComplexity(mysteryComplexity),
      solvabilityFactor: this.generateSolvabilityFactor(solvabilityLevel),
      mysteryImpact: this.calculateMysteryImpact(qualityMetrics),
      
      logicalConsistency: qualityMetrics.consistency,
      fairPlayRating: qualityMetrics.fairPlay,
      mysteryAuthenticity: qualityMetrics.authenticity
    };
  }
  
  /**
   * Applies mystery elements to specific scenes
   */
  static applyMysteryElements(
    scene: NarrativeScene,
    mysteryBlueprint: MysteryBlueprint,
    characters: Character3D[],
    investigationState: InvestigationState
  ): MysterySceneApplication {
    
    // Identify mystery opportunities in scene
    const mysteryOpportunities = this.identifyMysteryOpportunities(
      scene, characters, mysteryBlueprint
    );
    
    // Select appropriate mystery techniques
    const selectedTechniques = this.selectMysteryTechniques(
      mysteryOpportunities, mysteryBlueprint, investigationState
    );
    
    // Generate clue reveals
    const clueReveals = this.generateSceneClueReveals(
      scene, selectedTechniques, mysteryBlueprint
    );
    
    // Calculate deductive progression
    const deductiveProgression = this.calculateSceneDeductiveProgression(
      clueReveals, mysteryBlueprint.deductiveLogic
    );
    
    // Apply investigation techniques
    const investigationApplication = this.applyInvestigationTechniques(
      deductiveProgression, mysteryBlueprint.investigationProcess, scene
    );
    
    // Integrate mystery tension
    const mysteryTension = this.integrateMysteryTension(
      scene, mysteryBlueprint.puzzleMechanics, investigationApplication
    );
    
    return {
      scene,
      mysteryOpportunities,
      selectedTechniques,
      clueReveals,
      deductiveProgression,
      investigationApplication,
      mysteryTension,
      expectedInsight: this.predictSceneInsight(investigationApplication),
      storyImpact: this.assessMysteryStoryImpact(investigationApplication, scene)
    };
  }
  
  /**
   * Generates mystery-specific dialogue and questioning
   */
  static generateMysteryDialogue(
    character: Character3D,
    mysteryCharacter: MysteryCharacter,
    dialogueContext: DialogueContext,
    mysteryBlueprint: MysteryBlueprint,
    questioningIntensity: number
  ): MysteryDialogue {
    
    // Analyze character's mystery state
    const mysteryState = this.analyzeCharacterMysteryState(
      character, mysteryCharacter, questioningIntensity
    );
    
    // Generate investigation-driven dialogue
    const mysteryContent = this.generateMysteryDialogueContent(
      character, dialogueContext, mysteryState, mysteryBlueprint
    );
    
    // Apply deductive reasoning to delivery
    const deductiveDelivery = this.applyDeductiveReasoningToDialogue(
      mysteryContent, mysteryState, mysteryBlueprint.deductiveLogic
    );
    
    // Create interrogation enhancements
    const interrogationEnhancements = this.createInterrogationEnhancements(
      deductiveDelivery, mysteryBlueprint.investigationProcess
    );
    
    // Generate information reveals
    const informationReveals = this.generateInformationReveals(
      character, mysteryState, dialogueContext
    );
    
    return {
      character,
      mysteryContent,
      deductiveDelivery,
      interrogationEnhancements,
      informationReveals,
      expectedRevelation: this.predictDialogueRevelation(deductiveDelivery),
      investigativeValue: this.assessInvestigativeValue(informationReveals)
    };
  }
  
  /**
   * Manages mystery progression and revelation timing
   */
  static manageMysteryProgression(
    mysteryBlueprint: MysteryBlueprint,
    currentKnowledge: InvestigationState,
    narrativeContext: NarrativeContext
  ): MysteryProgressionManagement {
    
    // Analyze current investigation progress
    const progressAnalysis = this.analyzeInvestigationProgress(
      currentKnowledge, narrativeContext, mysteryBlueprint
    );
    
    // Determine reveal appropriateness
    const revealAppropriateness = this.assessRevealAppropriateness(
      progressAnalysis, mysteryBlueprint, narrativeContext
    );
    
    // Calculate pacing balance
    const pacingBalance = this.calculateMysteryPacingBalance(
      currentKnowledge, mysteryBlueprint, revealAppropriateness
    );
    
    // Generate progression coordination
    const progressionCoordination = this.coordinateMysteryProgression(
      pacingBalance, mysteryBlueprint, progressAnalysis
    );
    
    // Plan revelation timing
    const revelationPlanning = this.planRevelationTiming(
      progressionCoordination, mysteryBlueprint, narrativeContext
    );
    
    return {
      progressAnalysis,
      revealAppropriateness,
      pacingBalance,
      progressionCoordination,
      revelationPlanning,
      progressionRecommendations: this.generateProgressionRecommendations(
        progressionCoordination, revelationPlanning
      ),
      solvabilityAssessment: this.assessCurrentSolvability(
        pacingBalance, narrativeContext
      )
    };
  }
  
  /**
   * Coordinates mystery with all other narrative engines
   */
  static coordinateMysteryWithEngines(
    mysteryBlueprint: MysteryBlueprint,
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
      horror?: any;
      romance?: any;
    }
  ): MysteryEngineCoordinationResult {
    
    // Coordinate with Character Engine
    const characterCoordination = this.coordinateMysteryWithCharacters(
      mysteryBlueprint, engineInputs.characters
    );
    
    // Coordinate with Dialogue Engine
    const dialogueCoordination = this.coordinateMysteryWithDialogue(
      mysteryBlueprint, engineInputs.dialogue, characterCoordination
    );
    
    // Coordinate with Tension Engine
    const tensionCoordination = this.coordinateMysteryWithTension(
      mysteryBlueprint, engineInputs.tension, engineInputs.narrative
    );
    
    // Coordinate with World Building Engine
    const worldCoordination = this.coordinateMysteryWithWorld(
      mysteryBlueprint, engineInputs.world, characterCoordination
    );
    
    // Coordinate with other specialization engines
    const comedyCoordination = engineInputs.comedy ? 
      this.coordinateMysteryWithComedy(mysteryBlueprint, engineInputs.comedy) : null;
    
    const horrorCoordination = engineInputs.horror ? 
      this.coordinateMysteryWithHorror(mysteryBlueprint, engineInputs.horror) : null;
    
    const romanceCoordination = engineInputs.romance ? 
      this.coordinateMysteryWithRomance(mysteryBlueprint, engineInputs.romance) : null;
    
    return {
      characterCoordination,
      dialogueCoordination,
      tensionCoordination,
      worldCoordination,
      comedyCoordination,
      horrorCoordination,
      romanceCoordination,
      overallHarmony: this.assessMysteryEngineHarmony([
        characterCoordination,
        dialogueCoordination,
        tensionCoordination,
        worldCoordination,  
        comedyCoordination,
        horrorCoordination,
        romanceCoordination
      ].filter(Boolean)),
      mysteryIntegrity: this.validateMysteryIntegrity(mysteryBlueprint, engineInputs)
    };
  }
  
  // Helper methods for mystery generation
  
  private static analyzeMysteryRequirements(
    premise: StoryPremise,
    characters: Character3D[],
    world: WorldBlueprint,
    genre: GenreProfile
  ): MysteryRequirements {
    
    return {
      genreExpectations: this.analyzeGenreMysteryExpectations(genre),
      premiseMystery: this.analyzePremiseMysteryPotential(premise),
      characterMystery: this.analyzeCharacterMysteryPotential(characters),
      worldMystery: this.analyzeWorldMysteryOpportunities(world),
      audienceExpectations: this.analyzeAudienceMysteryExpectations(genre),
      complexityRequirements: this.analyzeComplexityRequirements(premise, genre)
    };
  }
  
  private static determineMysteryType(
    genre: GenreProfile,
    requirements: MysteryRequirements,
    complexity: MysteryComplexity
  ): MysteryType {
    
    // Analyze genre mystery alignment
    const genreAlignment = this.analyzeGenreMysteryAlignment(genre);
    
    // Check complexity preferences
    const complexityPreferences = this.analyzeComplexityPreferences(complexity);
    
    // Calculate best mystery type
    const mysteryScores = this.calculateMysteryTypeScores(
      genreAlignment, complexityPreferences, requirements
    );
    
    // Return highest scoring mystery type
    return Object.entries(mysteryScores)
      .sort(([,a], [,b]) => b - a)[0][0] as MysteryType;
  }
  
  private static generateCentralMystery(
    mysteryType: MysteryType,
    characters: Character3D[],
    premise: StoryPremise,
    complexity: MysteryComplexity
  ): CentralMystery {
    
    return {
      mysteryQuestion: 'Who killed the wealthy businessman and how?',
      mysteryCategory: 'murder',
      complexityLevel: 7,
      solutionUniqueness: 1,
      criminalAct: {
        description: 'Businessman found dead in locked office',
        timeline: [
          { time: '9:00 PM', event: 'Victim enters office', evidence: ['security footage'] },
          { time: '9:15 PM', event: 'Last phone call recorded', evidence: ['phone records'] },
          { time: '9:30 PM', event: 'Estimated time of death', evidence: ['medical examination'] }
        ],
        location: {
          name: 'Private office',
          description: 'Locked from inside, no other exits',
          accessibility: 'Limited',
          security: 'High',
          forensics: []
        },
        evidence: [
          { type: 'physical', description: 'Poison residue in coffee cup', significance: 9 },
          { type: 'circumstantial', description: 'Office locked from inside', significance: 8 },
          { type: 'digital', description: 'Deleted security footage', significance: 7 }
        ],
        plannedVsSpontaneous: 9,
        skillLevel: 8,
        riskLevel: 7,
        sophistication: 8
      },
      perpetrator: {
        identity: 'Business partner',
        motive: 'Financial fraud cover-up',
        capability: 8,
        opportunity: 9,
        alibi: 'Fabricated meeting',
        discoveryClues: ['Financial records', 'Forged documents', 'Witness testimony']
      },
      motive: {
        type: 'financial',
        description: 'Victim discovered embezzlement',
        strength: 9,
        believability: 8,
        complexity: 7,
        personalConnection: 'Business partnership',
        timeline: 'Discovered two days before murder'
      },
      method: {
        description: 'Slow-acting poison in coffee',
        sophistication: 8,
        detectability: 6,
        accessibility: 7,
        expertiseRequired: 'Basic chemistry knowledge',
        evidenceLeft: ['Residue', 'Purchase records', 'Research history']
      },
      opportunity: {
        timeWindow: '15 minutes',
        accessMethod: 'Legitimate business meeting',
        witnesses: 'None direct',
        alibiFabrication: 'False meeting documentation',
        riskLevel: 7
      },
      personalStakes: 'Family financial security',
      socialStakes: 'Community business trust',
      moralStakes: 'Justice vs mercy',
      solutionElements: [
        { element: 'Identify poison', difficulty: 6, clueRequirement: 'Chemical analysis' },
        { element: 'Establish motive', difficulty: 7, clueRequirement: 'Financial investigation' },
        { element: 'Prove opportunity', difficulty: 8, clueRequirement: 'Timeline reconstruction' }
      ],
      requiredDeductions: [
        'Poison was slow-acting',
        'Killer had financial motive',
        'Office was accessible earlier'
      ],
      criticalInsights: [
        'Locked room was misdirection',
        'Murder occurred before victim entered office',
        'Killer used legitimate access'
      ]
    };
  }
  
  // Additional helper method stubs for completeness
  private static generateSolutionArchitecture(mystery: CentralMystery, chars: Character3D[], solvability: SolvabilityLevel): SolutionArchitecture {
    return {
      solutionComponents: mystery.solutionElements,
      deductiveChain: mystery.requiredDeductions,
      criticalRealizations: mystery.criticalInsights,
      solutionValidation: { logicalConsistency: 9, evidenceSupport: 8, fairPlay: 9 },
      alternativeSolutions: [],
      solutionPresentation: { revelation: 'dramatic-confrontation', evidence: 'comprehensive', logic: 'step-by-step' }
    };
  }
  
  // More helper method stubs...
  private static generateClueDistribution(mystery: CentralMystery, solution: SolutionArchitecture, complexity: MysteryComplexity): ClueDistribution {
    return {
      physicalClues: [],
      testimonialClues: [],
      circumstantialClues: [],
      behavioralClues: [],
      clueProgression: { pattern: 'escalating-revelation', pacing: 'steady', peaks: 3 },
      difficultyScaling: { start: 3, middle: 6, end: 9 },
      accessibilityPattern: { immediate: 0.3, investigation: 0.5, deduction: 0.2 },
      clueConnections: [],
      clueConflicts: [],
      clueCombinations: [],
      visibilityEnsurance: { prominence: 8, clarity: 7, accessibility: 9 },
      comprehensibilityCheck: { understanding: 8, interpretation: 7, significance: 8 },
      deducibilityValidation: { logic: 9, evidence: 8, reasoning: 9 }
    };
  }
  
  private static generateMysteryCharacters(chars: Character3D[], type: MysteryType, mystery: CentralMystery): MysteryCharacter[] {
    return [];
  }
  
  // More helper method stubs continue...
  private static generateInvestigationProcess(type: MysteryType, clues: ClueDistribution, chars: MysteryCharacter[]): InvestigationProcess {
    return {
      investigationPhases: [],
      methodologyApproach: { style: 'systematic', focus: 'evidence-based', approach: 'deductive' },
      evidenceGathering: { methods: ['observation', 'questioning', 'analysis'], thoroughness: 8 },
      questioningStrategy: { approach: 'strategic', intensity: 'moderate', effectiveness: 8 },
      observationTechniques: [],
      analyticalMethods: [],
      investigationRhythm: { pacing: 'steady', intensification: 'gradual', variety: 8 },
      discoveryPacing: { early: 0.3, middle: 0.5, late: 0.2 },
      breakthroughMoments: [],
      deductiveSteps: [],
      eliminationProcess: { systematic: 9, thorough: 8, logical: 9 },
      synthesisPhase: { integration: 9, insight: 8, revelation: 10 }
    };
  }
  
  private static generateRedHerringStrategy(clues: ClueDistribution, complexity: MysteryComplexity, solvability: SolvabilityLevel): RedHerringStrategy {
    return {
      falseClues: [],
      misdirectionTactics: [],
      suspicionManipulation: [],
      herringDistribution: { ratio: 0.3, timing: 'early-to-middle', revelation: 'gradual' },
      believabilityMaintenance: { credibility: 8, sustainability: 7, naturalness: 9 },
      revelationManagement: { timing: 'before-solution', method: 'evidence-based', satisfaction: 8 },
      herringToRealClueRatio: 0.3,
      misdirectionIntensity: 6,
      clarificationTiming: [0.4, 0.7, 0.9],
      expectationManagement: { manipulation: 6, restoration: 9, satisfaction: 8 },
      suspenseEnhancement: { contribution: 8, sustainability: 7, resolution: 9 },
      satisfactionProtection: { fairness: 9, logic: 8, revelation: 9 }
    };
  }

  /**
   * Helper method to convert V2.0 context to legacy format
   */
  private static convertToLegacyMysteryInputs(
    context: any,
    requirements: any,
    framework: MysteryEngineRecommendation
  ): any {
    return {
      premise: {
        id: `premise-${Date.now()}`,
        theme: context.thematicElements[0] || 'Mystery and truth',
        premiseStatement: `${context.mysteryType} mystery in ${context.setting} setting`,
        character: 'Detective seeking truth',
        conflict: 'Puzzle vs deception',
        want: 'Solution to mystery',
        need: 'Justice and understanding',
        change: 'Discovery of truth',
        result: requirements.fairPlayAdherence === 'strict' ? 'Logical resolution' : 'Satisfying conclusion'
      } as StoryPremise,
      
      characters: [
        {
          name: 'Mystery Detective',
          background: `Investigator specializing in ${context.mysteryType} cases`,
          motivation: context.mysteryObjectives[0] || 'Seeking truth',
          personalityTraits: requirements.characterFocus === 'detective-driven' ? 
            ['observant', 'logical', 'persistent'] : 
            ['collaborative', 'intuitive', 'empathetic'],
          skills: requirements.modernElements === 'forensic' ? 
            ['forensic analysis', 'scientific method'] : 
            ['deduction', 'observation', 'interrogation']
        }
      ] as Character3D[],
      
      worldBlueprint: {
        id: `world-${Date.now()}`,
        description: `${context.setting} world with ${context.mysteryType} mystery elements`,
        mysteryElements: context.mysteryObjectives
      } as WorldBlueprint,
      
      genre: {
        id: 'mystery',
        category: 'mystery',
        conventions: [`${context.mysteryType} structure`, `${requirements.architecturalApproach} approach`],
        hybridElements: context.genreHybridization
      } as GenreProfile,
      
      mysteryComplexity: requirements.logicalComplexity === 'expert' ? 'intricate' :
                        requirements.logicalComplexity === 'complex' ? 'complex' :
                        requirements.logicalComplexity === 'simple' ? 'simple' : 'moderate',
      
      solvabilityLevel: requirements.fairPlayAdherence === 'strict' ? 'challenging' :
                       requirements.fairPlayAdherence === 'experimental' ? 'expert' : 'challenging'
    };
  }

  /**
   * Helper method to apply V2.0 framework enhancements to existing blueprint
   */
  private static applyMysteryFrameworkToBlueprint(
    blueprint: MysteryBlueprint,
    framework: MysteryEngineRecommendation
  ): MysteryBlueprint {
    const enhancedBlueprint = { ...blueprint };
    
    // Add framework metadata
    (enhancedBlueprint as any).mysteryFrameworkV2 = {
      frameworkVersion: 'MysteryEngineV2',
      confidence: framework.primaryRecommendation.confidence,
      
      // Foundational Structures
      architecturalFoundation: {
        blueprintApproach: framework.primaryRecommendation.foundationalStructures.blueprintApproach,
        fairPlayPrinciples: framework.primaryRecommendation.foundationalStructures.fairPlayPrinciples,
        misdirectionArt: framework.primaryRecommendation.foundationalStructures.misdirectionArt,
        clueDelivery: framework.primaryRecommendation.foundationalStructures.clueDelivery
      },
      
      // Logical Core
      logicalConstruction: {
        narrativeLogicPuzzle: framework.primaryRecommendation.logicalCore.narrativeLogicPuzzle,
        informationPacing: framework.primaryRecommendation.logicalCore.informationPacing,
        logicalIntegrity: framework.primaryRecommendation.logicalCore.logicalIntegrity
      },
      
      // Human Element
      characterDrivenMystery: {
        detectiveArchetype: framework.primaryRecommendation.humanElement.detectiveArchetype,
        suspectCarousel: framework.primaryRecommendation.humanElement.suspectCarousel,
        victimGhost: framework.primaryRecommendation.humanElement.victimGhost,
        unreliableWitness: framework.primaryRecommendation.humanElement.unreliableWitness,
        characterClueIntegration: framework.primaryRecommendation.humanElement.characterClueIntegration
      },
      
      // Genre Hybridization
      hybridFrameworks: {
        horrorMystery: framework.primaryRecommendation.genreHybridization.horrorMystery,
        comedyMystery: framework.primaryRecommendation.genreHybridization.comedyMystery,
        actionMystery: framework.primaryRecommendation.genreHybridization.actionMystery,
        romanceMystery: framework.primaryRecommendation.genreHybridization.romanceMystery,
        historicalMystery: framework.primaryRecommendation.genreHybridization.historicalMystery
      },
      
      // Modern Investigation
      modernTechniques: {
        technologyForensics: framework.primaryRecommendation.modernInvestigation.technologyForensics,
        socialMediaDigital: framework.primaryRecommendation.modernInvestigation.socialMediaDigital,
        internationalCrossCultural: framework.primaryRecommendation.modernInvestigation.internationalCrossCultural,
        serializedMystery: framework.primaryRecommendation.modernInvestigation.serializedMystery
      },
      
      // Strategic Guidance
      mysteryStrategy: framework.mysteryStrategy,
      implementationGuidance: framework.implementationGuidance,
      mysteryCraft: framework.mysteryCraft
    };
    
    // Enhance central mystery with V2.0 architectural insights
    if (enhancedBlueprint.centralMystery) {
      (enhancedBlueprint.centralMystery as any).frameworkEnhancement = {
        architecturalApproach: framework.primaryRecommendation.foundationalStructures.blueprintApproach,
        logicalConstruction: framework.primaryRecommendation.logicalCore.narrativeLogicPuzzle,
        characterIntegration: framework.primaryRecommendation.humanElement.characterClueIntegration
      };
    }
    
    // Enhance clue distribution with V2.0 delivery optimization
    if (enhancedBlueprint.clueDistribution) {
      (enhancedBlueprint.clueDistribution as any).v2Enhancement = {
        breadcrumbTrail: framework.primaryRecommendation.foundationalStructures.clueDelivery,
        informationPacing: framework.primaryRecommendation.logicalCore.informationPacing,
        misdirectionArt: framework.primaryRecommendation.foundationalStructures.misdirectionArt
      };
    }
    
    // Enhance red herring strategy with V2.0 deception mastery
    if (enhancedBlueprint.redHerringStrategy) {
      (enhancedBlueprint.redHerringStrategy as any).frameworkGuidance = {
        deceptionArchitecture: framework.primaryRecommendation.foundationalStructures.misdirectionArt,
        characterMisdirection: framework.primaryRecommendation.humanElement.unreliableWitness,
        logicalPlausibility: framework.primaryRecommendation.logicalCore.logicalIntegrity
      };
    }
    
    // Enhance fair play principles with V2.0 modern interpretation
    if (enhancedBlueprint.fairPlayPrinciples) {
      (enhancedBlueprint.fairPlayPrinciples as any).v2Framework = {
        modernInterpretation: framework.primaryRecommendation.foundationalStructures.fairPlayPrinciples,
        contractFulfillment: framework.primaryRecommendation.logicalCore.logicalIntegrity,
        expectationManagement: framework.mysteryCraft.deceptionMastery
      };
    }
    
    // Enhance mystery characters with V2.0 character integration
    if (enhancedBlueprint.mysteryCharacters) {
      enhancedBlueprint.mysteryCharacters.forEach((character: any) => {
        character.frameworkGuidance = {
          detectiveArchetype: framework.primaryRecommendation.humanElement.detectiveArchetype,
          characterClueIntegration: framework.primaryRecommendation.humanElement.characterClueIntegration,
          psychologicalDepth: framework.primaryRecommendation.humanElement.suspectCarousel
        };
      });
    }
    
    return enhancedBlueprint;
  }
}

// Supporting interfaces and types
export type MysteryComplexity = 'simple' | 'moderate' | 'complex' | 'intricate';
export type SolvabilityLevel = 'easy' | 'challenging' | 'difficult' | 'expert';

export interface MysteryRequirements {
  genreExpectations: any;
  premiseMystery: any;
  characterMystery: any;
  worldMystery: any;
  audienceExpectations: any;
  complexityRequirements: any;
}

export interface MysterySceneApplication {
  scene: NarrativeScene;
  mysteryOpportunities: any[];
  selectedTechniques: any[];
  clueReveals: any[];
  deductiveProgression: any;
  investigationApplication: any;
  mysteryTension: any;
  expectedInsight: any;
  storyImpact: any;
}

export interface MysteryDialogue {
  character: Character3D;
  mysteryContent: any;
  deductiveDelivery: any;
  interrogationEnhancements: any;
  informationReveals: any;
  expectedRevelation: any;
  investigativeValue: any;
}

export interface MysteryProgressionManagement {
  progressAnalysis: any;
  revealAppropriateness: any;
  pacingBalance: any;
  progressionCoordination: any;
  revelationPlanning: any;
  progressionRecommendations: any;
  solvabilityAssessment: any;
}

export interface MysteryEngineCoordinationResult {
  characterCoordination: any;
  dialogueCoordination: any;
  tensionCoordination: any;
  worldCoordination: any;
  comedyCoordination: any;
  horrorCoordination: any;
  romanceCoordination: any;
  overallHarmony: number;
  mysteryIntegrity: boolean;
}

// Additional supporting interfaces...
export interface CrimeTimeline { time: string; event: string; evidence: string[]; }
export interface CrimeLocation { name: string; description: string; accessibility: string; security: string; forensics: any[]; }
export interface EvidenceTrace { type: string; description: string; significance: number; }
export interface Perpetrator { identity: string; motive: string; capability: number; opportunity: number; alibi: string; discoveryClues: string[]; }
export interface Motive { type: string; description: string; strength: number; believability: number; complexity: number; personalConnection: string; timeline: string; }
export interface Method { description: string; sophistication: number; detectability: number; accessibility: number; expertiseRequired: string; evidenceLeft: string[]; }
export interface Opportunity { timeWindow: string; accessMethod: string; witnesses: string; alibiFabrication: string; riskLevel: number; }
export interface SolutionElement { element: string; difficulty: number; clueRequirement: string; }
export interface TestimonialClue { witness: string; statement: string; reliability: number; bias: number; }
export interface CircumstantialClue { circumstance: string; implication: string; strength: number; alternatives: string[]; }
export interface BehavioralClue { behavior: string; character: string; interpretation: string; significance: number; }
export interface ClueProgression { pattern: string; pacing: string; peaks: number; }
export interface DifficultyScaling { start: number; middle: number; end: number; }
export interface AccessibilityPattern { immediate: number; investigation: number; deduction: number; }
export interface ClueConnection { clue1: string; clue2: string; relationship: string; strength: number; }
export interface ClueConflict { clue1: string; clue2: string; contradiction: string; resolution: string; }
export interface ClueCombination { clues: string[]; insight: string; difficulty: number; }
export interface VisibilityEnsurance { prominence: number; clarity: number; accessibility: number; }
export interface ComprehensibilityCheck { understanding: number; interpretation: number; significance: number; }
export interface DeducibilityValidation { logic: number; evidence: number; reasoning: number; }
export interface ForensicValue { type: string; reliability: number; expertise: string; }
export interface MisdirectionTactic { tactic: string; effectiveness: number; duration: number; }
export interface SuspicionManipulation { target: string; method: string; intensity: number; }
export interface HerringDistribution { ratio: number; timing: string; revelation: string; }
export interface BelievabilityMaintenance { credibility: number; sustainability: number; naturalness: number; }
export interface RevelationManagement { timing: string; method: string; satisfaction: number; }
export interface ExpectationManagement { manipulation: number; restoration: number; satisfaction: number; }
export interface SuspenseEnhancement { contribution: number; sustainability: number; resolution: number; }
export interface SatisfactionProtection { fairness: number; logic: number; revelation: number; }
export interface MethodologyApproach { style: string; focus: string; approach: string; }
export interface EvidenceGathering { methods: string[]; thoroughness: number; }
export interface QuestioningStrategy { approach: string; intensity: string; effectiveness: number; }
export interface ObservationTechnique { technique: string; effectiveness: number; }
export interface AnalyticalMethod { method: string; reliability: number; }
export interface InvestigationRhythm { pacing: string; intensification: string; variety: number; }
export interface DiscoveryPacing { early: number; middle: number; late: number; }
export interface BreakthroughMoment { description: string; significance: number; timing: number; }
export interface DeductiveStep { step: string; logic: string; evidence: string[]; }
export interface EliminationProcess { systematic: number; thorough: number; logical: number; }
export interface SynthesisPhase { integration: number; insight: number; revelation: number; }
export interface InvestigativeCapacity { skills: string[]; experience: number; intuition: number; }
export interface InformationSharing { willingness: number; accuracy: number; completeness: number; }
export interface MysteryBehavior { behavior: string; frequency: number; significance: number; }
export interface MysteryGrowth { development: string; catalyst: string; outcome: string; }
export interface RelationshipChange { relationship: string; change: string; impact: number; }
export interface MoralEvolution { from: string; to: string; journey: string; }
export interface SolutionArchitecture { solutionComponents: SolutionElement[]; deductiveChain: string[]; criticalRealizations: string[]; solutionValidation: any; alternativeSolutions: any[]; solutionPresentation: any; }
export interface MysteryStructure { acts: string[]; phases: string[]; progression: string; }
export interface FairPlayPrinciples { visibility: number; comprehensibility: number; deducibility: number; }
export interface EvidenceManagement { cataloging: string; analysis: string; presentation: string; }
export interface RevelationTiming { pattern: string; pacing: string; climax: string; }
export interface DetectiveReasoning { method: string; accuracy: number; insight: number; }
export interface PuzzleMechanics { type: string; difficulty: number; satisfaction: number; }
export interface DeductiveLogic { soundness: number; completeness: number; elegance: number; }
export interface SuspectProfile { suspect: string; motive: string; opportunity: number; alibi: string; }
export interface WitnessTestimony { witness: string; account: string; reliability: number; bias: number; }
export interface PremiseMystery { integration: number; service: string; enhancement: string; }
export interface NarrativeIntegration { plot: number; character: number; theme: number; }
export interface ThematicResonance { themes: string[]; expression: string; depth: number; }
export interface GenreAuthenticity { fit: number; enhancement: string; authenticity: number; }
export interface PuzzleComplexity { layers: number; difficulty: number; satisfaction: number; }
export interface SolvabilityFactor { difficulty: number; fairness: number; satisfaction: number; }
export interface MysteryImpact { intrigue: number; satisfaction: number; memorability: number; }
export interface LogicalConsistency { internal: number; external: number; deductive: number; }
export interface FairPlayRating { clueAccess: number; deducibility: number; satisfaction: number; }
export interface MysteryAuthenticity { believability: number; genre: number; logic: number; }
export interface InvestigationState { knowledge: string[]; suspicions: string[]; evidence: string[]; progress: number; }
export interface NarrativeContext { episode: number; tension: number; pacing: string; focus: string; }
export interface DialogueContext { setting: string; purpose: string; participants: string[]; intensity: number; } 