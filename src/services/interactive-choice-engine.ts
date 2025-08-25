/**
 * The Interactive Choice Engine - Sophisticated Branching Narratives
 * 
 * This system creates meaningful player agency while maintaining story coherence.
 * Features include:
 * - Complex choice cascades with long-term consequences
 * - Intelligent narrative convergence that preserves differences
 * - Dramatic escape hatches that can completely derail storylines
 * - Quantum choice states that exist in superposition
 * - Butterfly effect tracking for cascading changes
 * 
 * Key Principle: Player agency serves the premise while allowing genuine surprise
 */

import { StoryPremise } from './premise-engine'
import { Character3D } from './character-engine'
import { NarrativeArc, NarrativeEpisode } from './fractal-narrative-engine'
import { WorldState } from './living-world-engine'
import { ChoiceEngineV2, type ChoiceEngineRecommendation } from './choice-engine-v2'

// Core choice architecture
export interface InteractiveChoice {
  id: string;
  text: string;
  description: string;
  
  // Choice classification
  type: ChoiceType;
  magnitude: ChoiceMagnitude;
  scope: ChoiceScope;
  
  // Premise relationship
  premiseAlignment: PremiseAlignment;
  premiseTest: string;
  
  // Consequences and requirements
  immediateConsequences: Consequence[];
  longTermEffects: LongTermEffect[];
  requirements: ChoiceRequirement[];
  
  // Branching mechanics
  branchingPotential: BranchingPotential;
  convergenceTarget?: ConvergencePoint;
  escapeHatch?: EscapeHatch;
  
  // Player psychology
  emotionalAppeal: EmotionalAppeal;
  moralComplexity: MoralComplexity;
  difficultyLevel: number; // 1-10: How hard is this choice?
}

// Choice classification system
export type ChoiceType = 
  | 'character-defining'    // Reveals/changes character nature
  | 'plot-advancing'        // Moves story forward
  | 'relationship-shaping'  // Affects character relationships
  | 'world-altering'        // Changes the story world
  | 'premise-testing'       // Directly tests the premise
  | 'escape-triggering'     // Can derail the storyline
  | 'convergence-steering'  // Guides toward story reunion

export type ChoiceMagnitude = 
  | 'micro'        // Small choice, local impact
  | 'minor'        // Modest choice, episode impact
  | 'moderate'     // Important choice, arc impact
  | 'major'        // Big choice, story impact
  | 'pivotal'      // Crucial choice, premise impact
  | 'catastrophic' // Choice that can destroy/remake the story

export type ChoiceScope = 
  | 'personal'     // Affects only the choosing character
  | 'interpersonal'// Affects relationships
  | 'communal'     // Affects group/community
  | 'global'       // Affects entire story world
  | 'meta'         // Affects story structure itself

// Branching and convergence system
export interface NarrativeBranch {
  id: string;
  parentBranch?: string;
  originChoice: string; // Choice ID that created this branch
  
  // Branch characteristics
  name: string;
  description: string;
  thematicShift: string;
  
  // Story state
  branchedEpisode: number;
  currentEpisode: number;
  worldState: WorldState;
  characterStates: BranchCharacterState[];
  
  // Convergence management
  convergenceTarget?: ConvergencePoint;
  convergenceSchedule: ConvergenceSchedule;
  branchSpecificElements: BranchElement[];
  
  // Escape potential
  escapeHatches: EscapeHatch[];
  derailmentRisk: number; // 1-10: How likely to completely change story
  
  // Player journey
  choiceHistory: ChoiceHistory[];
  playerInvestment: PlayerInvestment;
}

export interface ConvergencePoint {
  id: string;
  name: string;
  targetEpisode: number;
  
  // Convergence mechanics
  convergenceType: ConvergenceType;
  convergenceForce: number; // 1-10: How strongly branches are pulled together
  
  // Story justification
  narrativeJustification: string;
  premiseService: string;
  
  // Difference preservation
  convergenceScars: ConvergenceScar[];
  lastingDifferences: LastingDifference[];
  
  // Requirements
  requiredElements: ConvergenceRequirement[];
  flexibleElements: FlexibleElement[];
}

export type ConvergenceType = 
  | 'natural'      // Branches naturally meet at event
  | 'forced'       // Story mechanics force convergence
  | 'optional'     // Branches can meet or remain separate
  | 'inevitable'   // Physics of story demands convergence
  | 'catastrophic' // Major event forces all branches together
  | 'character'    // Character decision reunites branches

// Escape hatch system for dramatic derailment
export interface EscapeHatch {
  id: string;
  name: string;
  triggerChoice: string;
  
  // Escape mechanics
  escapeType: EscapeType;
  derailmentLevel: DerailmentLevel;
  activationRequirements: EscapeRequirement[];
  
  // New direction
  newStoryDirection: NewStoryDirection;
  emergencyNarrative: EmergencyNarrative;
  
  // Premise relationship
  premiseHandling: PremiseHandling;
  thematicShift: ThematicShift;
  
  // Risk assessment
  storyCoherence: number; // 1-10: How coherent after escape
  playerSatisfaction: number; // 1-10: Predicted satisfaction
  narrativeValue: number; // 1-10: Story value of derailment
}

export type EscapeType = 
  | 'gentle-derailment'    // Slight story redirection
  | 'moderate-shift'       // Significant but manageable change
  | 'major-pivot'          // Complete story direction change
  | 'narrative-revolution' // Story becomes something entirely different
  | 'premise-abandonment'  // Original premise no longer applies
  | 'meta-break'          // Story acknowledges its own change

export type DerailmentLevel = 
  | 'cosmetic'    // Same story, different flavor
  | 'structural'  // Same premise, different path
  | 'thematic'    // Different premise, same world
  | 'existential' // Different story entirely
  | 'temporal'    // Time/reality changes
  | 'genre'       // Story changes genre completely

// Choice consequence system
export interface Consequence {
  id: string;
  description: string;
  
  // Impact scope
  affectedElements: AffectedElement[];
  severity: number; // 1-10: How severe the consequence
  
  // Timing
  immediateEffect: string;
  delayedEffect?: DelayedEffect;
  
  // Cascade potential
  cascadeRisk: number; // 1-10: Likelihood of triggering more consequences
  butterflyPotential: ButterflyEffect[];
  
  // Reversibility
  reversible: boolean;
  reversalRequirements?: ReversalRequirement[];
}

export interface ButterflyEffect {
  description: string;
  probabilityThreshold: number; // 0-1: Chance this effect triggers
  cascadeDelay: number; // Episodes until effect manifests
  ultimateImpact: string;
}

// Choice presentation and player psychology
export interface ChoicePresentation {
  choice: InteractiveChoice;
  
  // Presentation strategy
  presentationStyle: PresentationStyle;
  framingStrategy: FramingStrategy;
  informationLevel: InformationLevel;
  
  // Player guidance
  consequences: ConsequenceHint[];
  characterAdvice: CharacterAdvice[];
  moralFraming: MoralFraming;
  
  // Engagement tactics
  timeConstraint?: TimeConstraint;
  emotionalPressure: EmotionalPressure;
  stakesClarity: StakesClarity;
}

export type PresentationStyle = 
  | 'stark'        // Simple, clear options
  | 'detailed'     // Rich description and context
  | 'mysterious'   // Consequences unclear
  | 'urgent'       // Time pressure emphasized
  | 'philosophical'// Deep moral/thematic framing
  | 'dramatic'     // High stakes, emotional

// Quantum choice states - choices in superposition
export interface QuantumChoice {
  id: string;
  name: string;
  
  // Superposition state
  possibleOutcomes: QuantumOutcome[];
  collapseConditions: CollapseCondition[];
  
  // Quantum mechanics
  probabilityDistribution: ChoiceProbability[];
  observerEffect: ObserverEffect;
  
  // Story integration
  quantumDuration: number; // Episodes before collapse required
  realityStabilization: StabilizationRequirement;
}

export interface QuantumOutcome {
  outcome: string;
  probability: number; // 0-1
  worldStateChanges: WorldStateChange[];
  characterImpacts: CharacterImpact[];
}

// Master choice engine class
export class InteractiveChoiceEngine {
  
  /**
   * V2.0 ENHANCED: Generates sophisticated choice system using advanced interactive narrative frameworks
   */
  static async generateEnhancedChoiceSystem(
    context: {
      projectTitle: string;
      medium: 'game' | 'interactive-fiction' | 'vr-experience' | 'web-series' | 'mobile-app' | 'mixed-reality';
      platform: 'pc' | 'console' | 'mobile' | 'web' | 'cross-platform';
      targetAudience: string;
      narrativeScope: 'intimate' | 'medium' | 'epic' | 'systemic';
      thematicElements: string[];
      interactivityGoals: string[];
      choiceObjectives: string[];
      storyComplexity: string;
    },
    requirements: {
      agencyLevel: 'low' | 'medium' | 'high' | 'emergent';
      narrativeStructure: 'linear-controlled' | 'guided-branching' | 'open-branching' | 'systemic';
      choiceComplexity: 'simple' | 'moderate' | 'complex' | 'advanced';
      userEngagement: 'passive' | 'guided' | 'active' | 'collaborative';
      moralComplexity: 'basic' | 'moderate' | 'complex' | 'philosophical';
      resourceIntegration: boolean;
      socialFeatures: boolean;
    },
    options: {
      aiEnhancement?: boolean;
      crossPlatformSupport?: boolean;
      accessibilityFocus?: boolean;
      culturalAdaptation?: boolean;
      realTimeAdaptation?: boolean;
      communityFeatures?: boolean;
    } = {}
  ): Promise<{ choiceSystem: InteractiveChoice[]; choiceFramework: ChoiceEngineRecommendation }> {
    try {
      // Generate V2.0 Choice Framework
      const choiceFramework = await ChoiceEngineV2.generateChoiceRecommendation(
        context,
        requirements,
        options
      );
      
      // Convert V2.0 context to legacy format
      const legacyContext = this.convertToLegacyChoiceContext(
        context,
        requirements,
        choiceFramework
      );
      
      // Generate enhanced choice system using V2.0 insights
      const choiceSystem = this.generateChoices(
        legacyContext.currentState,
        legacyContext.choiceContext
      );
      
      // Apply V2.0 framework enhancements to choices
      const enhancedChoiceSystem = this.applyChoiceFrameworkToSystem(
        choiceSystem,
        choiceFramework
      );
      
      return {
        choiceSystem: enhancedChoiceSystem,
        choiceFramework
      };
    } catch (error) {
      console.error('Error generating enhanced choice system:', error);
      throw error;
    }
  }

  /**
   * Generates contextually appropriate choices based on story state
   */
  static generateChoices(
    currentState: {
      worldState: WorldState;
      premise: StoryPremise;
      characters: Character3D[];
      episode: NarrativeEpisode;
      branch: NarrativeBranch;
    },
    choiceContext: ChoiceContext
  ): InteractiveChoice[] {
    
    // Analyze story needs
    const storyNeeds = this.analyzeStoryNeeds(currentState, choiceContext);
    
    // Generate choice candidates
    const candidates = this.generateChoiceCandidates(currentState, storyNeeds);
    
    // Apply choice filters and ranking
    const filteredChoices = this.filterAndRankChoices(candidates, currentState, storyNeeds);
    
    // Add escape hatches if appropriate
    const choicesWithEscapes = this.addEscapeHatches(filteredChoices, currentState);
    
    // Finalize choice presentation
    return this.finalizeChoicePresentation(choicesWithEscapes, currentState);
  }
  
  /**
   * Processes player choice and manages branching/convergence
   */
  static processChoice(
    choiceId: string,
    currentBranch: NarrativeBranch,
    worldState: WorldState,
    premise: StoryPremise
  ): ChoiceResult {
    
    const choice = this.getChoice(choiceId);
    if (!choice) throw new Error(`Choice ${choiceId} not found`);
    
    // Process immediate consequences
    const immediateResults = this.processImmediateConsequences(choice, worldState);
    
    // Handle branching logic
    const branchingResult = this.handleBranching(choice, currentBranch, immediateResults);
    
    // Check for escape hatch activation
    const escapeResult = this.checkEscapeActivation(choice, branchingResult);
    
    // Plan future convergence
    const convergencePlan = this.planConvergence(branchingResult, premise);
    
    // Update world state and character psychology
    const updatedWorldState = this.updateWorldState(worldState, immediateResults, escapeResult);
    
    return {
      choice,
      immediateResults,
      branchingResult: escapeResult || branchingResult,
      convergencePlan,
      updatedWorldState,
      newChoices: this.generateFollowUpChoices(choice, updatedWorldState, premise)
    };
  }
  
  /**
   * Manages intelligent narrative convergence
   */
  static executeConvergence(
    branches: NarrativeBranch[],
    convergencePoint: ConvergencePoint,
    premise: StoryPremise
  ): ConvergenceResult {
    
    // Analyze branch differences
    const branchAnalysis = this.analyzeBranchDifferences(branches);
    
    // Plan convergence strategy
    const convergenceStrategy = this.planConvergenceStrategy(
      branchAnalysis,
      convergencePoint,
      premise
    );
    
    // Execute convergence
    const convergenceExecution = this.executeConvergenceStrategy(
      branches,
      convergenceStrategy
    );
    
    // Preserve meaningful differences
    const convergenceScars = this.preserveMeaningfulDifferences(
      branchAnalysis,
      convergenceExecution
    );
    
    // Create unified narrative
    const unifiedNarrative = this.createUnifiedNarrative(
      convergenceExecution,
      convergenceScars,
      premise
    );
    
    return {
      unifiedBranch: unifiedNarrative,
      convergenceScars,
      lastingDifferences: branchAnalysis.meaningfulDifferences,
      convergenceSuccess: convergenceExecution.success,
      playerSatisfaction: this.predictPlayerSatisfaction(convergenceExecution)
    };
  }
  
  /**
   * Handles dramatic story derailment through escape hatches
   */
  static activateEscapeHatch(
    escapeHatch: EscapeHatch,
    currentBranch: NarrativeBranch,
    worldState: WorldState,
    premise: StoryPremise
  ): EscapeResult {
    
    // Validate escape activation
    const activationCheck = this.validateEscapeActivation(escapeHatch, currentBranch, worldState);
    if (!activationCheck.valid) {
      throw new Error(`Escape hatch activation failed: ${activationCheck.reason}`);
    }
    
    // Execute escape sequence
    const escapeSequence = this.executeEscapeSequence(escapeHatch, currentBranch, worldState);
    
    // Handle premise transformation
    const premiseHandling = this.handlePremiseTransformation(
      escapeHatch.premiseHandling,
      premise,
      escapeSequence
    );
    
    // Generate emergency narrative
    const emergencyNarrative = this.generateEmergencyNarrative(
      escapeHatch.emergencyNarrative,
      escapeSequence,
      premiseHandling.newPremise || premise
    );
    
    // Create derailed branch
    const derailedBranch = this.createDerailedBranch(
      currentBranch,
      escapeSequence,
      emergencyNarrative,
      premiseHandling
    );
    
    return {
      derailedBranch,
      escapeSequence,
      premiseTransformation: premiseHandling,
      emergencyNarrative,
      derailmentSuccess: true,
      playerShock: this.calculatePlayerShock(escapeHatch, escapeSequence)
    };
  }
  
  /**
   * Tracks butterfly effects and cascading consequences
   */
  static trackButterflyEffects(
    choiceHistory: ChoiceHistory[],
    currentWorldState: WorldState,
    episodes: number
  ): ButterflyAnalysis {
    
    const activeEffects: ActiveButterflyEffect[] = [];
    const emergingEffects: EmergingButterflyEffect[] = [];
    const cascadePotential: CascadePotential[] = [];
    
    // Analyze each past choice for butterfly potential
    choiceHistory.forEach((choiceEvent, index) => {
      const timeSinceChoice = episodes - choiceEvent.episode;
      
      choiceEvent.choice.immediateConsequences.forEach(consequence => {
        consequence.butterflyPotential.forEach(butterfly => {
          
          // Check if butterfly effect should manifest
          if (timeSinceChoice >= butterfly.cascadeDelay) {
            const manifestationProbability = this.calculateManifestationProbability(
              butterfly,
              currentWorldState,
              choiceHistory
            );
            
            if (manifestationProbability >= butterfly.probabilityThreshold) {
              activeEffects.push({
                originChoice: choiceEvent.choice.id,
                butterfly,
                manifestationEpisode: episodes,
                impact: butterfly.ultimateImpact
              });
            }
          } else {
            // Effect is still building
            emergingEffects.push({
              originChoice: choiceEvent.choice.id,
              butterfly,
              expectedManifestation: choiceEvent.episode + butterfly.cascadeDelay,
              currentProbability: this.calculateCurrentProbability(butterfly, timeSinceChoice)
            });
          }
        });
      });
    });
    
    // Calculate cascade potential
    activeEffects.forEach(effect => {
      const cascades = this.calculateCascadePotential(effect, currentWorldState);
      cascadePotential.push(...cascades);
    });
    
    return {
      activeEffects,
      emergingEffects,
      cascadePotential,
      butterflyStorm: this.detectButterflyStorm(activeEffects, cascadePotential),
      systemicRisk: this.calculateSystemicRisk(activeEffects, cascadePotential)
    };
  }
  
  /**
   * Creates quantum choice states for complex decisions
   */
  static createQuantumChoice(
    baseChoices: InteractiveChoice[],
    worldState: WorldState,
    premise: StoryPremise
  ): QuantumChoice {
    
    // Create superposition of possible outcomes
    const quantumOutcomes = baseChoices.map(choice => ({
      outcome: choice.text,
      probability: this.calculateChoiceProbability(choice, worldState, premise),
      worldStateChanges: this.predictWorldStateChanges(choice, worldState),
      characterImpacts: this.predictCharacterImpacts(choice, worldState.activeCharacters)
    }));
    
    // Define collapse conditions
    const collapseConditions = this.generateCollapseConditions(baseChoices, worldState);
    
    // Configure quantum mechanics
    const observerEffect = this.calculateObserverEffect(baseChoices, premise);
    
    return {
      id: `quantum-${Date.now()}`,
      name: 'Quantum Decision State',
      possibleOutcomes: quantumOutcomes,
      collapseConditions,
      probabilityDistribution: quantumOutcomes.map(outcome => ({
        choiceId: baseChoices.find(c => c.text === outcome.outcome)?.id || '',
        probability: outcome.probability
      })),
      observerEffect,
      quantumDuration: this.calculateQuantumDuration(baseChoices, worldState),
      realityStabilization: this.defineStabilizationRequirements(baseChoices, premise)
    };
  }
  
  // Private helper methods for complex choice logic
  
  private static analyzeStoryNeeds(
    currentState: any,
    choiceContext: ChoiceContext
  ): StoryNeeds {
    return {
      premiseProgression: this.assessPremiseProgression(currentState.premise, currentState.worldState),
      characterDevelopment: this.assessCharacterDevelopment(currentState.characters),
      plotAdvancement: this.assessPlotAdvancement(currentState.episode),
      conflictEscalation: this.assessConflictNeeds(currentState.worldState),
      convergenceUrgency: this.assessConvergenceUrgency(currentState.branch),
      escapeReadiness: this.assessEscapeReadiness(currentState, choiceContext)
    };
  }
  
  private static generateChoiceCandidates(
    currentState: any,
    storyNeeds: StoryNeeds
  ): InteractiveChoice[] {
    const candidates: InteractiveChoice[] = [];
    
    // Generate premise-testing choices
    if (storyNeeds.premiseProgression < 0.7) {
      candidates.push(...this.generatePremiseChoices(currentState.premise, currentState.worldState));
    }
    
    // Generate character development choices
    candidates.push(...this.generateCharacterChoices(currentState.characters, storyNeeds.characterDevelopment));
    
    // Generate plot advancement choices
    candidates.push(...this.generatePlotChoices(currentState.episode, storyNeeds.plotAdvancement));
    
    // Generate escape hatch choices if ready
    if (storyNeeds.escapeReadiness > 0.6) {
      candidates.push(...this.generateEscapeChoices(currentState));
    }
    
    return candidates;
  }
  
  private static generatePremiseChoices(premise: StoryPremise, worldState: WorldState): InteractiveChoice[] {
    return [
      {
        id: `premise-test-${Date.now()}`,
        text: `Test the premise: ${premise.character} faces ${premise.conflict}`,
        description: `A choice that directly tests whether ${premise.premiseStatement}`,
        type: 'premise-testing',
        magnitude: 'major',
        scope: 'global',
        premiseAlignment: {
          supports: premise.premiseStatement,
          tests: premise.conflict,
          proves: premise.resolution
        },
        premiseTest: `Will ${premise.character} choose ${premise.resolution} over easier alternatives?`,
        immediateConsequences: [],
        longTermEffects: [],
        requirements: [],
        branchingPotential: {
          branchCount: 2,
          divergenceLevel: 'moderate',
          convergenceLikelihood: 0.7
        },
        emotionalAppeal: {
          primaryEmotion: 'tension',
          moralWeight: 8,
          personalStakes: 9
        },
        moralComplexity: {
          clearRight: false,
          grayAreas: ['personal cost vs greater good', 'immediate vs long-term consequences'],
          philosophicalDepth: 8
        },
        difficultyLevel: 8
      }
    ];
  }
  
  private static generateCharacterChoices(characters: Character3D[], developmentNeeds: any): InteractiveChoice[] {
    return characters.map(character => ({
      id: `character-${character.name}-${Date.now()}`,
      text: `${character.name} must choose between ${character.psychology.want} and ${character.psychology.need}`,
      description: `A defining moment for ${character.name}'s character arc`,
      type: 'character-defining',
      magnitude: 'major',
      scope: 'personal',
      premiseAlignment: {
        supports: `${character.name}'s growth serves the premise`,
        tests: character.psychology.primaryFlaw,
        proves: character.psychology.need
      },
      premiseTest: `Will ${character.name} choose growth over comfort?`,
      immediateConsequences: [],
      longTermEffects: [],
      requirements: [],
      branchingPotential: {
        branchCount: 2,
        divergenceLevel: 'minor',
        convergenceLikelihood: 0.8
      },
      emotionalAppeal: {
        primaryEmotion: 'empathy',
        moralWeight: 6,
        personalStakes: 8
      },
      moralComplexity: {
        clearRight: false,
        grayAreas: ['personal desires vs character growth'],
        philosophicalDepth: 6
      },
      difficultyLevel: 6
    }));
  }
  
  private static generateEscapeChoices(currentState: any): InteractiveChoice[] {
    return [
      {
        id: `escape-${Date.now()}`,
        text: 'Take an unexpected path that changes everything',
        description: 'A choice that could completely derail the planned storyline',
        type: 'escape-triggering',
        magnitude: 'catastrophic',
        scope: 'meta',
        premiseAlignment: {
          supports: 'Player agency over predetermined story',
          tests: 'Story flexibility',
          proves: 'Narrative can adapt to player will'
        },
        premiseTest: 'Should the story serve the player or the original premise?',
        immediateConsequences: [],
        longTermEffects: [],
        requirements: [],
        branchingPotential: {
          branchCount: 1,
          divergenceLevel: 'catastrophic',
          convergenceLikelihood: 0.1
        },
        escapeHatch: {
          id: `escape-hatch-${Date.now()}`,
          name: 'Narrative Revolution',
          triggerChoice: `escape-${Date.now()}`,
          escapeType: 'narrative-revolution',
          derailmentLevel: 'existential',
          activationRequirements: [],
          newStoryDirection: {
            newGenre: 'player-determined',
            newPremise: 'to-be-discovered',
            newProtagonist: 'player-choice'
          },
          emergencyNarrative: {
            fallbackPlot: 'improvisational',
            characterContinuity: 'flexible',
            worldConsistency: 'adaptable'
          },
          premiseHandling: {
            originalPremise: 'archived',
            newPremise: 'emergent',
            transition: 'revolutionary'
          },
          thematicShift: {
            from: currentState.premise.theme,
            to: 'player-agency',
            bridgeMethod: 'meta-commentary'
          },
          storyCoherence: 3,
          playerSatisfaction: 9,
          narrativeValue: 8
        },
        emotionalAppeal: {
          primaryEmotion: 'excitement',
          moralWeight: 4,
          personalStakes: 10
        },
        moralComplexity: {
          clearRight: false,
          grayAreas: ['author intent vs player freedom', 'story integrity vs player agency'],
          philosophicalDepth: 9
        },
        difficultyLevel: 10
      }
    ];
  }
  
  // More helper methods would continue...
  
  private static assessPremiseProgression(premise: StoryPremise, worldState: WorldState): number {
    return worldState.premiseProgression / 100;
  }
  
  private static assessCharacterDevelopment(characters: Character3D[]): any {
    return characters.map(char => ({
      character: char.name,
      developmentNeeded: this.calculateDevelopmentNeed(char)
    }));
  }
  
  private static calculateDevelopmentNeed(character: Character3D): number {
    // Calculate how much character development is still needed
    return 0.5; // Simplified
  }
  
  private static assessPlotAdvancement(episode: NarrativeEpisode): any {
    return {
      currentPace: episode.pacing,
      advancementNeeded: 0.6
    };
  }
  
  private static assessConflictNeeds(worldState: WorldState): any {
    return {
      currentTension: worldState.activeCharacters.reduce((sum, char) => sum + char.conflictLevel, 0) / worldState.activeCharacters.length,
      escalationNeeded: 0.4
    };
  }
  
  private static assessConvergenceUrgency(branch: NarrativeBranch): number {
    return branch.convergenceTarget ? 0.7 : 0.2;
  }
  
  private static assessEscapeReadiness(currentState: any, choiceContext: ChoiceContext): number {
    // Assess if story is ready for potential derailment
    return 0.3; // Conservative default
  }

  /**
   * Helper method to convert V2.0 context to legacy format
   */
  private static convertToLegacyChoiceContext(
    context: any,
    requirements: any,
    framework: ChoiceEngineRecommendation
  ): any {
    // Create simplified legacy context for compatibility
    return {
      currentState: {
        worldState: {
          id: `world-${Date.now()}`,
          state: 'active',
          complexity: requirements.choiceComplexity
        },
        premise: {
          id: `premise-${Date.now()}`,
          theme: context.thematicElements[0] || 'Interactive narrative',
          premiseStatement: `${context.medium} experience with ${requirements.agencyLevel} player agency`,
          character: 'Interactive protagonist making meaningful choices',
          conflict: 'Navigating complex decision landscape',
          want: 'Achieve desired narrative outcome',
          need: 'Learn through choice consequences',
          change: 'Growth through decision-making',
          result: requirements.agencyLevel === 'emergent' ? 'Emergent narrative outcome' : 'Guided story resolution'
        },
        characters: [
          {
            name: 'Choice Protagonist',
            role: 'protagonist',
            backgroundStory: `Character in ${context.medium} with ${requirements.agencyLevel} agency`,
            internalConflicts: context.thematicElements,
            externalConflicts: context.choiceObjectives
          }
        ],
        episode: {
          id: `episode-${Date.now()}`,
          title: `${context.projectTitle} - Interactive Episode`,
          summary: `Episode featuring ${requirements.choiceComplexity} choices`,
          structure: requirements.narrativeStructure
        },
        branch: {
          id: `branch-${Date.now()}`,
          name: 'Main Interactive Branch',
          type: requirements.narrativeStructure === 'systemic' ? 'emergent' : 'guided',
          significance: requirements.agencyLevel
        }
      },
      choiceContext: {
        currentTension: requirements.moralComplexity === 'philosophical' ? 0.8 : 0.5,
        availableChoices: requirements.choiceComplexity === 'advanced' ? 4 : 
                          requirements.choiceComplexity === 'complex' ? 3 : 2,
        storyPhase: context.narrativeScope === 'epic' ? 'climax' : 'development',
        playerEngagement: requirements.userEngagement,
        moralStakes: requirements.moralComplexity,
        resourceConstraints: requirements.resourceIntegration
      }
    };
  }

  /**
   * Helper method to apply V2.0 framework enhancements to existing choice system
   */
  private static applyChoiceFrameworkToSystem(
    choiceSystem: InteractiveChoice[],
    framework: ChoiceEngineRecommendation
  ): InteractiveChoice[] {
    // Apply framework enhancements to existing choice system
    const enhancedChoices = choiceSystem.map((choice, index) => {
      const enhancedChoice = { ...choice };
      
      // Add framework metadata
      (enhancedChoice as any).choiceFrameworkV2 = {
        frameworkVersion: 'ChoiceEngineV2',
        confidence: framework.primaryRecommendation.confidence,
        
        // Agency Structures
        agencyStructures: {
          narrativeArchitecture: framework.primaryRecommendation.agencyStructures.narrativeArchitecture,
          narrativeParadox: framework.primaryRecommendation.agencyStructures.narrativeParadox
        },
        
        // Choice Psychology
        choicePsychology: {
          meaningfulnessFactors: framework.primaryRecommendation.choicePsychology.meaningfulChoiceFramework,
          cognitiveDrivers: framework.primaryRecommendation.choicePsychology.cognitiveDrivers,
          narrativeSatisfaction: framework.primaryRecommendation.choicePsychology.narrativeSatisfaction
        },
        
        // Decision Framework
        decisionFramework: {
          architecturalGuidance: framework.primaryRecommendation.decisionFramework,
          advancedSystems: framework.primaryRecommendation.advancedSystems
        },
        
        // Platform Integration
        platformIntegration: framework.primaryRecommendation.platformIntegration,
        
        // User Experience
        userExperience: framework.primaryRecommendation.userExperienceFramework,
        
        // Cultural Adaptation
        culturalAdaptation: framework.primaryRecommendation.adaptationFramework,
        
        // Strategic Guidance
        choiceStrategy: framework.choiceStrategy,
        implementationGuidance: framework.implementationGuidance,
        choiceCraft: framework.choiceCraft
      };
      
      // Enhance choice with meaningful choice framework
      if (enhancedChoice.emotionalAppeal) {
        (enhancedChoice.emotionalAppeal as any).frameworkEnhancement = {
          perceivedImpact: framework.primaryRecommendation.choicePsychology.meaningfulChoiceFramework.perceptionOfImpact,
          feedbackValidation: framework.primaryRecommendation.choicePsychology.meaningfulChoiceFramework.feedbackValidation,
          cognitiveDrivers: framework.primaryRecommendation.choicePsychology.cognitiveDrivers
        };
      }
      
      // Enhance moral complexity with advanced frameworks
      if (enhancedChoice.moralComplexity) {
        (enhancedChoice.moralComplexity as any).v2Enhancement = {
          moralFramework: framework.primaryRecommendation.advancedSystems.moralDilemmFramework,
          systemicApproach: framework.primaryRecommendation.advancedSystems.moralDilemmFramework.systemicConsequenceBased,
          ethicalComplexity: framework.primaryRecommendation.advancedSystems.moralDilemmFramework.ethicalComplexity
        };
      }
      
      // Enhance branching potential with architectural insights
      if (enhancedChoice.branchingPotential) {
        (enhancedChoice.branchingPotential as any).architecturalGuidance = {
          complexityManagement: framework.primaryRecommendation.decisionFramework.treeArchitecture.complexityManagement,
          pacingPlacement: framework.primaryRecommendation.decisionFramework.treeArchitecture.pacingPlacement,
          characterIntegration: framework.primaryRecommendation.decisionFramework.characterDevelopment
        };
      }
      
      // Enhance consequences with narrative satisfaction principles
      if (enhancedChoice.longTermEffects) {
        enhancedChoice.longTermEffects.forEach((effect: any) => {
          effect.frameworkGuidance = {
            narrativeSatisfaction: framework.primaryRecommendation.choicePsychology.narrativeSatisfaction,
            weightDistribution: framework.primaryRecommendation.agencyStructures.narrativeParadox.weightConsequenceDistribution,
            systemicCulmination: framework.primaryRecommendation.advancedSystems.systemicCulmination
          };
        });
      }
      
      return enhancedChoice;
    });
    
    return enhancedChoices;
  }
}

// Supporting interfaces and types

export interface ChoiceContext {
  playerHistory: ChoiceHistory[];
  storyPressure: number;
  narrativeFlexibility: number;
}

export interface StoryNeeds {
  premiseProgression: number;
  characterDevelopment: any;
  plotAdvancement: any;
  conflictEscalation: any;
  convergenceUrgency: number;
  escapeReadiness: number;
}

export interface ChoiceResult {
  choice: InteractiveChoice;
  immediateResults: any;
  branchingResult: any;
  convergencePlan: any;
  updatedWorldState: WorldState;
  newChoices: InteractiveChoice[];
}

export interface ConvergenceResult {
  unifiedBranch: NarrativeBranch;
  convergenceScars: ConvergenceScar[];
  lastingDifferences: LastingDifference[];
  convergenceSuccess: boolean;
  playerSatisfaction: number;
}

export interface EscapeResult {
  derailedBranch: NarrativeBranch;
  escapeSequence: any;
  premiseTransformation: any;
  emergencyNarrative: any;
  derailmentSuccess: boolean;
  playerShock: number;
}

export interface ButterflyAnalysis {
  activeEffects: ActiveButterflyEffect[];
  emergingEffects: EmergingButterflyEffect[];
  cascadePotential: CascadePotential[];
  butterflyStorm: boolean;
  systemicRisk: number;
}

// Additional supporting types would continue...

export interface PremiseAlignment {
  supports: string;
  tests: string;
  proves: string;
}

export interface BranchingPotential {
  branchCount: number;
  divergenceLevel: 'minor' | 'moderate' | 'major' | 'catastrophic';
  convergenceLikelihood: number;
}

export interface EmotionalAppeal {
  primaryEmotion: string;
  moralWeight: number;
  personalStakes: number;
}

export interface MoralComplexity {
  clearRight: boolean;
  grayAreas: string[];
  philosophicalDepth: number;
}

export interface ChoiceHistory {
  choice: InteractiveChoice;
  episode: number;
  consequences: any[];
}

export interface ConvergenceScar {
  description: string;
  evidence: string;
  permanence: string;
}

export interface LastingDifference {
  aspect: string;
  differences: string[];
  impact: string;
}

export interface ActiveButterflyEffect {
  originChoice: string;
  butterfly: ButterflyEffect;
  manifestationEpisode: number;
  impact: string;
}

export interface EmergingButterflyEffect {
  originChoice: string;
  butterfly: ButterflyEffect;
  expectedManifestation: number;
  currentProbability: number;
}

export interface CascadePotential {
  trigger: string;
  cascadeChain: string[];
  ultimateEffect: string;
}

export interface NewStoryDirection {
  newGenre: string;
  newPremise: string;
  newProtagonist: string;
}

export interface EmergencyNarrative {
  fallbackPlot: string;
  characterContinuity: string;
  worldConsistency: string;
}

export interface PremiseHandling {
  originalPremise: string;
  newPremise: string;
  transition: string;
}

export interface ThematicShift {
  from: string;
  to: string;
  bridgeMethod: string;
} 