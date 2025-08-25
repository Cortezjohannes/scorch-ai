/**
 * The Living World Engine - Dynamic Narrative Evolution
 * 
 * This system creates truly living narratives where:
 * - Characters are introduced when needed and leave when their purpose is served
 * - Locations evolve and transform based on story requirements
 * - World elements adapt to serve the premise
 * - Everything feels organic and premise-driven
 * 
 * Key Principle: The world serves the story, and the story serves the premise
 */

import { StoryPremise } from './premise-engine'
import { Character3D } from './character-engine'
import { NarrativeArc, NarrativeEpisode } from './fractal-narrative-engine'

// World state management
export interface WorldState {
  currentEpisode: number;
  currentArc: number;
  totalTimeElapsed: number; // Story days/months/years
  
  // Active story elements
  activeCharacters: ActiveCharacter[];
  currentLocations: WorldLocation[];
  worldEvents: WorldEvent[];
  
  // Evolution tracking
  characterIntroductions: CharacterIntroduction[];
  characterDepartures: CharacterDeparture[];
  locationEvolutions: LocationEvolution[];
  
  // Premise influence
  premiseProgression: number; // 0-100: How much premise has been proven
  premiseInfluences: PremiseInfluence[];
  
  // Context preservation
  establishedFacts: EstablishedFact[];
  continuityRules: ContinuityRule[];
}

// Character lifecycle management
export interface ActiveCharacter {
  character: Character3D;
  
  // Lifecycle status
  status: 'active' | 'dormant' | 'departed' | 'potential';
  introductionEpisode: number;
  departureEpisode?: number;
  
  // Story function
  currentRole: CharacterRole;
  purposeStatus: 'serving' | 'fulfilled' | 'evolving';
  premiseContribution: string;
  
  // Relationship dynamics
  activeRelationships: CharacterRelationship[];
  conflictLevel: number; // 1-10: Current conflict intensity
  
  // Evolution potential
  growthTrajectory: CharacterGrowthPath;
  nextMilestone?: CharacterMilestone;
}

export interface CharacterIntroduction {
  episodeNumber: number;
  character: Character3D;
  introductionReason: IntroductionReason;
  introductionMethod: IntroductionMethod;
  expectedDuration: number; // Episodes they'll likely stay
  premiseService: string;
}

export interface CharacterDeparture {
  episodeNumber: number;
  character: Character3D;
  departureReason: DepartureReason;
  departureMethod: DepartureMethod;
  impact: DepartureImpact;
  premiseService: string;
}

// Dynamic location system
export interface WorldLocation {
  id: string;
  name: string;
  type: LocationType;
  
  // Current state
  description: string;
  atmosphere: LocationAtmosphere;
  significance: LocationSignificance;
  
  // Evolution tracking
  evolutionHistory: LocationEvolution[];
  currentPhase: LocationPhase;
  nextEvolution?: ScheduledEvolution;
  
  // Story function
  narrativeRole: LocationRole;
  premiseReflection: string;
  
  // Presence tracking
  activeCharacters: string[]; // Character IDs present
  keyEvents: LocationEvent[];
}

export interface LocationEvolution {
  episodeNumber: number;
  evolutionType: EvolutionType;
  previousState: string;
  newState: string;
  evolutionReason: string;
  premiseAlignment: string;
  characterReactions: CharacterReaction[];
}

// World events and dynamics
export interface WorldEvent {
  id: string;
  name: string;
  type: EventType;
  
  // Timing and scope
  startEpisode: number;
  endEpisode?: number;
  scope: EventScope;
  
  // Story impact
  premiseInfluence: string;
  characterImpacts: CharacterImpact[];
  locationImpacts: LocationImpact[];
  
  // Cascading effects
  triggeredEvents: string[]; // Other event IDs
  resolutionRequirements: ResolutionRequirement[];
}

// Premise-driven evolution system
export interface PremiseInfluence {
  episodeNumber: number;
  influenceType: 'character-introduction' | 'character-departure' | 'location-evolution' | 'world-event';
  description: string;
  premiseAspect: string; // Which part of premise this serves
  strength: number; // 1-10: How strongly it serves premise
}

// Evolution decision system
export type IntroductionReason = 
  | 'premise-catalyst'      // Needed to advance premise proof
  | 'conflict-escalation'   // Raises stakes for existing characters
  | 'world-expansion'       // Opens new story possibilities
  | 'character-growth'      // Helps existing character develop
  | 'plot-advancement'      // Moves story forward
  | 'thematic-deepening'    // Explores theme more deeply

export type DepartureReason =
  | 'purpose-fulfilled'     // Character served their story function
  | 'premise-proven'        // Their contribution to premise complete
  | 'natural-progression'   // Story naturally moves past them
  | 'dramatic-necessity'    // Departure serves dramatic purpose
  | 'world-evolution'       // World has changed beyond their role
  | 'character-choice'      // Their own decision drives departure

export type EvolutionType =
  | 'gradual-change'        // Slow transformation over episodes
  | 'dramatic-shift'        // Sudden significant change
  | 'cyclical-return'       // Returns to previous state
  | 'premise-reflection'    // Changes to reflect premise progress
  | 'character-influence'   // Changed by character actions
  | 'world-event-impact'    // Changed by major world events

// Evolution planning and prediction
export interface EvolutionPlan {
  worldState: WorldState;
  
  // Planned changes
  upcomingIntroductions: PlannedIntroduction[];
  plannedDepartures: PlannedDeparture[];
  locationEvolutions: PlannedLocationEvolution[];
  worldEvents: PlannedWorldEvent[];
  
  // Evolution logic
  premiseRequirements: PremiseRequirement[];
  evolutionPressures: EvolutionPressure[];
  
  // Continuity preservation
  consistencyChecks: ConsistencyCheck[];
  establishedConstraints: EstablishedConstraint[];
}

export interface PlannedIntroduction {
  plannedEpisode: number;
  characterConcept: CharacterConcept;
  introductionReason: IntroductionReason;
  expectedContribution: string;
  integrationStrategy: IntegrationStrategy;
}

export interface PlannedDeparture {
  plannedEpisode: number;
  character: Character3D;
  departureReason: DepartureReason;
  departureImpact: string;
  transitionStrategy: TransitionStrategy;
}

export class LivingWorldEngine {
  
  /**
   * Creates initial world state from story bible and narrative arc
   */
  static initializeWorldState(
    premise: StoryPremise,
    characters: Character3D[],
    arc: NarrativeArc,
    startingLocations: WorldLocation[]
  ): WorldState {
    
    const activeCharacters: ActiveCharacter[] = characters.map(char => ({
      character: char,
      status: 'active',
      introductionEpisode: char.arcIntroduction || 1,
      currentRole: this.determineCharacterRole(char, premise),
      purposeStatus: 'serving',
      premiseContribution: this.calculatePremiseContribution(char, premise),
      activeRelationships: this.initializeRelationships(char, characters),
      conflictLevel: this.calculateInitialConflictLevel(char, characters, premise),
      growthTrajectory: this.planCharacterGrowth(char, premise, arc),
    }));
    
    return {
      currentEpisode: 1,
      currentArc: 1,
      totalTimeElapsed: 0,
      activeCharacters,
      currentLocations: startingLocations,
      worldEvents: [],
      characterIntroductions: [],
      characterDepartures: [],
      locationEvolutions: [],
      premiseProgression: 0,
      premiseInfluences: [],
      establishedFacts: this.extractEstablishedFacts(characters, startingLocations),
      continuityRules: this.generateContinuityRules(premise, characters)
    };
  }
  
  /**
   * Evolves world state for next episode based on premise needs
   */
  static evolveWorldForEpisode(
    currentState: WorldState,
    targetEpisode: number,
    premise: StoryPremise,
    narrativeRequirements: NarrativeRequirement[]
  ): WorldState {
    
    const evolutionPlan = this.planEvolution(currentState, targetEpisode, premise, narrativeRequirements);
    
    // Apply character introductions
    const updatedCharacters = this.applyCharacterIntroductions(
      currentState.activeCharacters,
      evolutionPlan.upcomingIntroductions,
      targetEpisode
    );
    
    // Apply character departures
    const charactersAfterDepartures = this.applyCharacterDepartures(
      updatedCharacters,
      evolutionPlan.plannedDepartures,
      targetEpisode
    );
    
    // Evolve locations
    const evolvedLocations = this.evolveLocations(
      currentState.currentLocations,
      evolutionPlan.locationEvolutions,
      targetEpisode,
      premise
    );
    
    // Process world events
    const updatedEvents = this.processWorldEvents(
      currentState.worldEvents,
      evolutionPlan.worldEvents,
      targetEpisode
    );
    
    // Update premise progression
    const updatedProgression = this.calculatePremiseProgression(
      charactersAfterDepartures,
      evolvedLocations,
      updatedEvents,
      premise
    );
    
    return {
      ...currentState,
      currentEpisode: targetEpisode,
      totalTimeElapsed: currentState.totalTimeElapsed + 1,
      activeCharacters: charactersAfterDepartures,
      currentLocations: evolvedLocations,
      worldEvents: updatedEvents,
      characterIntroductions: [
        ...currentState.characterIntroductions,
        ...evolutionPlan.upcomingIntroductions.filter(intro => intro.plannedEpisode === targetEpisode)
          .map(intro => this.convertToActualIntroduction(intro, targetEpisode))
      ],
      characterDepartures: [
        ...currentState.characterDepartures,
        ...evolutionPlan.plannedDepartures.filter(dep => dep.plannedEpisode === targetEpisode)
          .map(dep => this.convertToActualDeparture(dep, targetEpisode))
      ],
      locationEvolutions: [
        ...currentState.locationEvolutions,
        ...evolutionPlan.locationEvolutions.filter(evo => evo.plannedEpisode === targetEpisode)
          .map(evo => this.convertToActualEvolution(evo, targetEpisode))
      ],
      premiseProgression: updatedProgression,
      premiseInfluences: [
        ...currentState.premiseInfluences,
        ...this.generatePremiseInfluences(evolutionPlan, targetEpisode, premise)
      ]
    };
  }
  
  /**
   * Determines when and why to introduce new characters
   */
  static planCharacterIntroduction(
    worldState: WorldState,
    targetEpisode: number,
    premise: StoryPremise,
    narrativeNeeds: NarrativeNeed[]
  ): PlannedIntroduction | null {
    
    // Analyze current character landscape
    const activeCharacters = worldState.activeCharacters.filter(ac => ac.status === 'active');
    const currentRoles = activeCharacters.map(ac => ac.currentRole);
    
    // Check if premise needs new perspective
    const premiseGaps = this.identifyPremiseGaps(activeCharacters, premise, targetEpisode);
    
    // Check if conflict needs escalation
    const conflictNeeds = this.analyzeConflictNeeds(activeCharacters, narrativeNeeds);
    
    // Check if world expansion is needed
    const worldExpansionNeeds = this.analyzeWorldExpansionNeeds(worldState, targetEpisode);
    
    // Determine strongest need
    const strongestNeed = this.prioritizeIntroductionNeeds(premiseGaps, conflictNeeds, worldExpansionNeeds);
    
    if (!strongestNeed) return null;
    
    // Generate character concept
    const characterConcept = this.generateCharacterConcept(strongestNeed, premise, activeCharacters);
    
    // Plan integration strategy
    const integrationStrategy = this.planCharacterIntegration(characterConcept, worldState, premise);
    
    return {
      plannedEpisode: targetEpisode,
      characterConcept,
      introductionReason: strongestNeed.reason,
      expectedContribution: strongestNeed.contribution,
      integrationStrategy
    };
  }
  
  /**
   * Determines when and why characters should depart
   */
  static planCharacterDeparture(
    character: ActiveCharacter,
    worldState: WorldState,
    targetEpisode: number,
    premise: StoryPremise
  ): PlannedDeparture | null {
    
    // Check if character's purpose is fulfilled
    const purposeStatus = this.evaluateCharacterPurpose(character, worldState, premise);
    
    // Check if character has natural departure point
    const departureOpportunity = this.identifyDepartureOpportunity(character, worldState, targetEpisode);
    
    // Check if departure would serve premise
    const premiseService = this.evaluateDeparturePremiseService(character, premise, worldState);
    
    // Check if departure would impact other characters meaningfully
    const dramaticImpact = this.evaluateDramaticImpact(character, worldState);
    
    if (purposeStatus === 'fulfilled' && departureOpportunity && premiseService > 6) {
      return {
        plannedEpisode: targetEpisode,
        character: character.character,
        departureReason: 'purpose-fulfilled',
        departureImpact: dramaticImpact.description,
        transitionStrategy: this.planDepartureTransition(character, worldState, premise)
      };
    }
    
    return null;
  }
  
  /**
   * Plans location evolution based on story progression
   */
  static planLocationEvolution(
    location: WorldLocation,
    worldState: WorldState,
    targetEpisode: number,
    premise: StoryPremise
  ): PlannedLocationEvolution | null {
    
    // Check if location needs to reflect premise progression
    const premiseReflection = this.evaluateLocationPremiseReflection(location, worldState, premise);
    
    // Check if character actions should affect location
    const characterInfluence = this.evaluateCharacterLocationInfluence(location, worldState);
    
    // Check if world events require location changes
    const eventInfluence = this.evaluateEventLocationInfluence(location, worldState.worldEvents);
    
    // Check if natural evolution is due
    const naturalEvolution = this.evaluateNaturalLocationEvolution(location, targetEpisode);
    
    const strongestInfluence = this.prioritizeLocationInfluences(
      premiseReflection,
      characterInfluence,
      eventInfluence,
      naturalEvolution
    );
    
    if (!strongestInfluence) return null;
    
    return {
      plannedEpisode: targetEpisode,
      location,
      evolutionType: strongestInfluence.type,
      newState: strongestInfluence.targetState,
      evolutionReason: strongestInfluence.reason,
      premiseAlignment: this.calculateLocationPremiseAlignment(strongestInfluence.targetState, premise)
    };
  }
  
  /**
   * Maintains story continuity while allowing organic change
   */
  static validateEvolution(
    evolutionPlan: EvolutionPlan,
    worldState: WorldState,
    premise: StoryPremise
  ): ValidationResult {
    
    const issues: ValidationIssue[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Check character introduction consistency
    evolutionPlan.upcomingIntroductions.forEach(intro => {
      const consistencyCheck = this.checkCharacterIntroductionConsistency(intro, worldState);
      if (consistencyCheck.issues.length > 0) {
        issues.push(...consistencyCheck.issues);
      }
    });
    
    // Check departure impact on ongoing arcs
    evolutionPlan.plannedDepartures.forEach(departure => {
      const impactCheck = this.checkDepartureImpact(departure, worldState);
      if (impactCheck.criticalImpact) {
        issues.push({
          type: 'critical-departure',
          description: `${departure.character.name} departure would break ongoing arc`,
          resolution: 'Delay departure or provide transition character'
        });
      }
    });
    
    // Check location evolution believability
    evolutionPlan.locationEvolutions.forEach(evolution => {
      const believabilityCheck = this.checkLocationEvolutionBelievability(evolution, worldState);
      if (!believabilityCheck.believable) {
        warnings.push({
          type: 'location-evolution',
          description: believabilityCheck.concern,
          suggestion: believabilityCheck.suggestion
        });
      }
    });
    
    // Check overall premise service
    const premiseService = this.evaluateEvolutionPremiseService(evolutionPlan, premise);
    if (premiseService < 7) {
      warnings.push({
        type: 'premise-service',
        description: 'Evolution plan may not effectively serve premise',
        suggestion: 'Align more changes with premise proof'
      });
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      warnings,
      overallScore: this.calculateEvolutionScore(evolutionPlan, worldState, premise)
    };
  }
  
  /**
   * Generates natural character introductions that feel organic
   */
  static generateOrganicIntroduction(
    characterConcept: CharacterConcept,
    worldState: WorldState,
    premise: StoryPremise
  ): CharacterIntroduction {
    
    // Determine most natural introduction method
    const introductionMethod = this.selectIntroductionMethod(characterConcept, worldState);
    
    // Create introduction that serves premise
    const premiseService = this.designPremiseServiceIntroduction(characterConcept, premise);
    
    // Plan integration with existing characters
    const relationshipEstablishment = this.planInitialRelationships(characterConcept, worldState);
    
    return {
      episodeNumber: worldState.currentEpisode + 1,
      character: this.realizeCharacterConcept(characterConcept, premise, worldState),
      introductionReason: characterConcept.reason,
      introductionMethod,
      expectedDuration: this.calculateExpectedDuration(characterConcept, premise),
      premiseService: premiseService.description
    };
  }
  
  /**
   * Creates meaningful character departures that serve the story
   */
  static generateMeaningfulDeparture(
    character: ActiveCharacter,
    worldState: WorldState,
    premise: StoryPremise
  ): CharacterDeparture {
    
    // Determine most meaningful departure method
    const departureMethod = this.selectDepartureMethod(character, worldState, premise);
    
    // Calculate departure impact on other characters
    const departureImpact = this.calculateDepartureImpact(character, worldState);
    
    // Ensure departure serves premise
    const premiseService = this.designPremiseServiceDeparture(character, premise);
    
    return {
      episodeNumber: worldState.currentEpisode + 1,
      character: character.character,
      departureReason: this.determineDepartureReason(character, worldState, premise),
      departureMethod,
      impact: departureImpact,
      premiseService: premiseService.description
    };
  }
  
  // Private helper methods for world evolution logic
  
  private static determineCharacterRole(character: Character3D, premise: StoryPremise): CharacterRole {
    // Determine character's role based on premise and psychology
    return character.premiseRole as CharacterRole;
  }
  
  private static calculatePremiseContribution(character: Character3D, premise: StoryPremise): string {
    return `${character.name} serves premise by ${character.premiseFunction}`;
  }
  
  private static initializeRelationships(character: Character3D, allCharacters: Character3D[]): CharacterRelationship[] {
    // Initialize relationships between characters
    return [];
  }
  
  private static calculateInitialConflictLevel(character: Character3D, characters: Character3D[], premise: StoryPremise): number {
    // Calculate initial conflict level based on character dynamics
    return 5; // Default moderate conflict
  }
  
  private static planCharacterGrowth(character: Character3D, premise: StoryPremise, arc: NarrativeArc): CharacterGrowthPath {
    return {
      startingPoint: character.psychology.want,
      destination: character.psychology.need,
      milestones: [],
      premiseAlignment: premise.premiseStatement
    };
  }
  
  private static extractEstablishedFacts(characters: Character3D[], locations: WorldLocation[]): EstablishedFact[] {
    return [
      {
        id: 'character-count',
        description: `Story begins with ${characters.length} main characters`,
        type: 'character-baseline',
        immutable: false
      }
    ];
  }
  
  private static generateContinuityRules(premise: StoryPremise, characters: Character3D[]): ContinuityRule[] {
    return [
      {
        id: 'premise-consistency',
        description: 'All changes must serve or test the premise',
        priority: 'critical',
        enforcement: 'strict'
      }
    ];
  }
  
  private static planEvolution(
    currentState: WorldState,
    targetEpisode: number,
    premise: StoryPremise,
    narrativeRequirements: NarrativeRequirement[]
  ): EvolutionPlan {
    // Create comprehensive evolution plan
    return {
      worldState: currentState,
      upcomingIntroductions: [],
      plannedDepartures: [],
      locationEvolutions: [],
      worldEvents: [],
      premiseRequirements: [],
      evolutionPressures: [],
      consistencyChecks: [],
      establishedConstraints: []
    };
  }
  
  // More helper methods would continue...
  
  private static applyCharacterIntroductions(
    characters: ActiveCharacter[],
    introductions: PlannedIntroduction[],
    episode: number
  ): ActiveCharacter[] {
    return characters; // Simplified for now
  }
  
  private static applyCharacterDepartures(
    characters: ActiveCharacter[],
    departures: PlannedDeparture[],
    episode: number
  ): ActiveCharacter[] {
    return characters; // Simplified for now
  }
  
  private static evolveLocations(
    locations: WorldLocation[],
    evolutions: PlannedLocationEvolution[],
    episode: number,
    premise: StoryPremise
  ): WorldLocation[] {
    return locations; // Simplified for now
  }
  
  private static processWorldEvents(
    currentEvents: WorldEvent[],
    plannedEvents: PlannedWorldEvent[],
    episode: number
  ): WorldEvent[] {
    return currentEvents; // Simplified for now
  }
  
  private static calculatePremiseProgression(
    characters: ActiveCharacter[],
    locations: WorldLocation[],
    events: WorldEvent[],
    premise: StoryPremise
  ): number {
    return 0; // Simplified calculation
  }
  
  private static convertToActualIntroduction(intro: PlannedIntroduction, episode: number): CharacterIntroduction {
    return {
      episodeNumber: episode,
      character: {} as Character3D, // Would be properly generated
      introductionReason: intro.introductionReason,
      introductionMethod: {} as IntroductionMethod,
      expectedDuration: 5,
      premiseService: intro.expectedContribution
    };
  }
  
  private static convertToActualDeparture(departure: PlannedDeparture, episode: number): CharacterDeparture {
    return {
      episodeNumber: episode,
      character: departure.character,
      departureReason: departure.departureReason,
      departureMethod: {} as DepartureMethod,
      impact: {} as DepartureImpact,
      premiseService: departure.departureImpact
    };
  }
  
  private static convertToActualEvolution(evolution: PlannedLocationEvolution, episode: number): LocationEvolution {
    return {
      episodeNumber: episode,
      evolutionType: evolution.evolutionType,
      previousState: 'previous',
      newState: evolution.newState,
      evolutionReason: evolution.evolutionReason,
      premiseAlignment: evolution.premiseAlignment,
      characterReactions: []
    };
  }
  
  private static generatePremiseInfluences(
    plan: EvolutionPlan,
    episode: number,
    premise: StoryPremise
  ): PremiseInfluence[] {
    return [];
  }
}

// Supporting interfaces and types
export interface CharacterRole {
  type: string;
  description: string;
}

export interface CharacterRelationship {
  characterA: string;
  characterB: string;
  relationshipType: string;
  strength: number;
}

export interface CharacterGrowthPath {
  startingPoint: string;
  destination: string;
  milestones: CharacterMilestone[];
  premiseAlignment: string;
}

export interface CharacterMilestone {
  episode: number;
  description: string;
  premiseTest: string;
}

export interface EstablishedFact {
  id: string;
  description: string;
  type: string;
  immutable: boolean;
}

export interface ContinuityRule {
  id: string;
  description: string;
  priority: 'critical' | 'important' | 'preferred';
  enforcement: 'strict' | 'flexible';
}

export interface NarrativeRequirement {
  type: string;
  description: string;
  priority: number;
}

export interface NarrativeNeed {
  type: string;
  urgency: number;
  description: string;
}

export interface CharacterConcept {
  role: string;
  purpose: string;
  reason: IntroductionReason;
  traits: string[];
}

export interface IntegrationStrategy {
  method: string;
  relationshipTargets: string[];
  conflictPotential: number;
}

export interface TransitionStrategy {
  method: string;
  duration: number;
  impact: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  warnings: ValidationWarning[];
  overallScore: number;
}

export interface ValidationIssue {
  type: string;
  description: string;
  resolution: string;
}

export interface ValidationWarning {
  type: string;
  description: string;
  suggestion: string;
}

export interface PlannedLocationEvolution {
  plannedEpisode: number;
  location: WorldLocation;
  evolutionType: EvolutionType;
  newState: string;
  evolutionReason: string;
  premiseAlignment: string;
}

export interface PlannedWorldEvent {
  episodeNumber: number;
  eventType: string;
  description: string;
  impact: string;
}

// Location-specific types
export interface LocationType {
  category: string;
  characteristics: string[];
}

export interface LocationAtmosphere {
  mood: string;
  tension: number;
  energy: string;
}

export interface LocationSignificance {
  narrativeImportance: number;
  premiseRelevance: number;
  characterAttachment: string[];
}

export interface LocationPhase {
  current: string;
  duration: number;
  nextPhase?: string;
}

export interface ScheduledEvolution {
  targetEpisode: number;
  evolutionType: EvolutionType;
  trigger: string;
}

export interface LocationRole {
  function: string;
  premiseService: string;
}

export interface LocationEvent {
  episode: number;
  event: string;
  impact: string;
}

export interface CharacterReaction {
  character: string;
  reaction: string;
  emotionalImpact: number;
}

// Event system types
export interface EventType {
  category: string;
  scope: string;
}

export interface EventScope {
  geographical: string;
  temporal: string;
  characterImpact: string;
}

export interface CharacterImpact {
  character: string;
  impactType: string;
  severity: number;
}

export interface LocationImpact {
  location: string;
  impactType: string;
  permanence: string;
}

export interface ResolutionRequirement {
  requirement: string;
  characters: string[];
  deadline?: number;
}

export interface IntroductionMethod {
  approach: string;
  location: string;
  timing: string;
}

export interface DepartureMethod {
  approach: string;
  finality: string;
  ceremony: string;
}

export interface DepartureImpact {
  emotional: number;
  narrative: string;
  relationships: CharacterImpact[];
} 