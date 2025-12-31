/**
 * The Character Engine V2.0 - Architecture of the Soul
 * 
 * A comprehensive character engineering system based on modern psychological science,
 * narrative therapy, and industry best practices for creating multi-dimensional characters.
 * 
 * This system synthesizes:
 * - Enneagram psychological typing for core motivation
 * - Narrative Therapy for character arc development  
 * - Jungian psychology for internal conflict
 * - Big Five personality model for behavioral consistency
 * - Three-dimensional framework (Physiology, Sociology, Psychology)
 * - Advanced voice engineering and chemistry algorithms
 */

import { generateEngineContent as generateContent } from './engine-ai-router'
import type { StoryPremise } from './premise-engine'

// ============================================================================
// PART I: THE PSYCHOLOGICAL FOUNDATION
// ============================================================================

/**
 * Enneagram Type-to-Arc Matrix - The Core Motivation Engine
 */
export interface EnneagramType {
  number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  name: string;
  basicDesire: string;
  basicFear: string;
  passion: string; // Core vice/emotional habit
  virtue: string; // Transcendent state
  stressDirection: number; // Moves to unhealthy traits of this type
  growthDirection: number; // Moves to healthy traits of this type
  motivationCore: string;
  avoidancePattern: string;
  defenseMechanism: string;
}

export const ENNEAGRAM_TYPES: Record<number, EnneagramType> = {
  1: {
    number: 1,
    name: "The Reformer",
    basicDesire: "To be good, to have integrity, to be perfect",
    basicFear: "Of being corrupt, evil, defective",
    passion: "Anger",
    virtue: "Serenity", 
    stressDirection: 4,
    growthDirection: 7,
    motivationCore: "Driven by an inner critic demanding perfection",
    avoidancePattern: "Avoids making mistakes or being wrong",
    defenseMechanism: "Reaction formation - expressing opposite of true feelings"
  },
  2: {
    number: 2,
    name: "The Helper",
    basicDesire: "To be loved and wanted",
    basicFear: "Of being unwanted, unworthy of love",
    passion: "Pride",
    virtue: "Humility",
    stressDirection: 8,
    growthDirection: 4,
    motivationCore: "Driven by need to be needed and indispensable",
    avoidancePattern: "Avoids acknowledging own needs",
    defenseMechanism: "Repression - pushing down own needs and feelings"
  },
  3: {
    number: 3,
    name: "The Achiever", 
    basicDesire: "To be valuable and worthwhile",
    basicFear: "Of being worthless without achievements",
    passion: "Deceit",
    virtue: "Authenticity",
    stressDirection: 9,
    growthDirection: 6,
    motivationCore: "Driven by need for validation through success",
    avoidancePattern: "Avoids failure and appearing unsuccessful", 
    defenseMechanism: "Identification - becoming the role they play"
  },
  4: {
    number: 4,
    name: "The Individualist",
    basicDesire: "To find themselves and their significance",
    basicFear: "Of having no identity or personal significance", 
    passion: "Envy",
    virtue: "Equanimity",
    stressDirection: 2,
    growthDirection: 1,
    motivationCore: "Driven by need to be unique and authentic",
    avoidancePattern: "Avoids being ordinary or insignificant",
    defenseMechanism: "Introjection - taking in others' negative judgments"
  },
  5: {
    number: 5,
    name: "The Investigator",
    basicDesire: "To be capable and competent",
    basicFear: "Of being useless, helpless, or incapable",
    passion: "Avarice", 
    virtue: "Non-attachment",
    stressDirection: 7,
    growthDirection: 8,
    motivationCore: "Driven by need to understand and master their environment",
    avoidancePattern: "Avoids being overwhelmed or invaded",
    defenseMechanism: "Isolation - withdrawing from others"
  },
  6: {
    number: 6,
    name: "The Loyalist",
    basicDesire: "To have security and support",
    basicFear: "Of being without support or guidance",
    passion: "Fear",
    virtue: "Courage",
    stressDirection: 3,
    growthDirection: 9,
    motivationCore: "Driven by need for security and certainty",
    avoidancePattern: "Avoids taking risks or being unsupported",
    defenseMechanism: "Projection - attributing own feelings to others"
  },
  7: {
    number: 7,
    name: "The Enthusiast",
    basicDesire: "To be satisfied and content",
    basicFear: "Of being trapped in pain and deprivation",
    passion: "Gluttony",
    virtue: "Sobriety",
    stressDirection: 1,
    growthDirection: 5,
    motivationCore: "Driven by need to maintain happiness and avoid pain",
    avoidancePattern: "Avoids negative emotions and limitations",
    defenseMechanism: "Rationalization - reframing negative experiences"
  },
  8: {
    number: 8,
    name: "The Challenger",
    basicDesire: "To be self-reliant and in control of own life",
    basicFear: "Of being controlled or vulnerable to others",
    passion: "Lust",
    virtue: "Innocence",
    stressDirection: 5,
    growthDirection: 2,
    motivationCore: "Driven by need for autonomy and justice",
    avoidancePattern: "Avoids being controlled or showing weakness",
    defenseMechanism: "Denial - refusing to acknowledge vulnerability"
  },
  9: {
    number: 9,
    name: "The Peacemaker",
    basicDesire: "To have inner and outer peace",
    basicFear: "Of loss and separation; of fragmentation",
    passion: "Sloth",
    virtue: "Action",
    stressDirection: 6,
    growthDirection: 3,
    motivationCore: "Driven by need for harmony and avoiding conflict",
    avoidancePattern: "Avoids conflict and making difficult decisions",
    defenseMechanism: "Narcotization - numbing out from problems"
  }
};

/**
 * Narrative Therapy Framework for Character Arcs
 */
export interface NarrativeTherapyArc {
  problematicStory: string; // The dominant negative narrative they believe
  externalizationPhase: {
    problemName: string; // "The Anger", "The Shame", etc.
    problemInfluence: string; // How it affects their life
    resistanceEvidence: string[]; // Times they fought back
  };
  deconstructionPhase: {
    problemOrigins: string[]; // Where the problem came from
    culturalInfluences: string[]; // Societal pressures sustaining it
    affectedDomains: string[]; // Life areas it impacts
  };
  reauthoringPhase: {
    preferredStory: string; // New identity they're building
    uniqueOutcomes: string[]; // Evidence for new story
    supportingEvidence: string[]; // Proof of their capability
  };
}

/**
 * Jungian Psychology - The Shadow and Persona System
 */
export interface JungianPsyche {
  persona: {
    publicMask: string; // How they present to the world
    socialRole: string; // Their professional/family identity
    acceptableTraits: string[]; // Qualities they show
    socialStrategies: string[]; // How they navigate relationships
  };
  shadow: {
    repressedTraits: string[]; // What they deny about themselves
    hiddenDesires: string[]; // Secret wants they won't admit
    shamefulAspects: string[]; // Parts of self they find unacceptable
    projectedQualities: string[]; // Traits they see in others but deny in self
  };
  anima_animus: {
    receptiveEnergy: number; // 1-10 scale of intuitive, emotional energy
    activeEnergy: number; // 1-10 scale of logical, assertive energy
    energyBalance: 'receptive-dominant' | 'active-dominant' | 'balanced';
    unconsciousContrasexual: string; // Qualities they're unconscious of
  };
  archetypes: {
    primary: string; // Dominant archetypal pattern
    secondary: string; // Supporting archetypal influence
    shadowArchetype: string; // Repressed archetypal energy
  };
}

/**
 * Big Five Personality Model for Behavioral Consistency
 */
export interface BigFiveProfile {
  openness: {
    score: number; // 1-10
    traits: string[]; // Specific manifestations
    creativity: number;
    curiosity: number;
    aestheticSensitivity: number;
  };
  conscientiousness: {
    score: number;
    traits: string[];
    organization: number;
    discipline: number;
    reliability: number;
  };
  extraversion: {
    score: number;
    traits: string[];
    sociability: number;
    assertiveness: number;
    energySource: 'internal' | 'external' | 'balanced';
  };
  agreeableness: {
    score: number;
    traits: string[];
    empathy: number;
    cooperation: number;
    trust: number;
  };
  neuroticism: {
    score: number;
    traits: string[];
    emotionalStability: number;
    stressResponse: string;
    anxietyTriggers: string[];
  };
}

// ============================================================================
// PART II: THE THREE-DIMENSIONAL FRAMEWORK
// ============================================================================

/**
 * Physiology - The Body as Narrative Canvas
 */
export interface CharacterPhysiology {
  // Basic Physical Traits
  age: number;
  gender: string;
  height: string;
  build: string;
  appearance: string;
  
  // Method Acting Inspired Elements
  senseMemory: {
    triggerSense: 'sight' | 'sound' | 'smell' | 'taste' | 'touch';
    triggerStimulus: string;
    associatedMemory: string;
    physiologicalResponse: string;
  };
  
  animalEssence: {
    primaryAnimal: string; // Hawk, bear, fox, etc.
    movementQuality: string;
    posturalHabits: string;
    spatialNeeds: string;
    observationalStyle: string;
  };
  
  privateMoments: {
    soloRituals: string[]; // What they do when completely alone
    unguardedBehaviors: string[];
    secretHabits: string[];
    vulnerableMoments: string[];
  };
  
  // Physical Conditioning
  healthConditions: string[];
  chronicPain: string[];
  physicalLimitations: string[];
  bodyImage: string;
  relationshipToPhysicality: string;
}

/**
 * Sociology - The Character in Cultural Matrix  
 */
export interface CharacterSociology {
  // Social Structures
  socialClass: {
    economic: 'underclass' | 'working' | 'middle' | 'upper-middle' | 'upper';
    cultural: string; // Cultural capital and education
    socialMobility: string; // Moving up, down, or stable
    classMarkers: string[]; // Speech, dress, behavior indicators
  };
  
  familySystem: {
    structure: string; // Nuclear, extended, single-parent, etc.
    dynamics: string; // Authoritarian, permissive, chaotic, etc.
    birthOrder: string;
    familyRole: string; // Caretaker, rebel, golden child, etc.
    intergenerationalTrauma: string[];
  };
  
  profession: {
    occupation: string;
    careerStage: string;
    workCulture: string;
    professionalIdentity: string;
    workRelationships: string[];
  };
  
  education: {
    level: string;
    institutions: string[];
    learningStyle: string;
    intellectualCuriosity: number;
    knowledgeAreas: string[];
  };
  
  // Cultural Anthropology
  culturalBackground: {
    ethnicity: string;
    nationality: string;
    regionalCulture: string;
    immigrationStatus?: string;
    generationInCountry?: number;
  };
  
  culturalSoftware: {
    communicationStyle: 'direct' | 'indirect' | 'high-context' | 'low-context';
    conflictStyle: string;
    authorityRelation: string;
    timeOrientation: 'past' | 'present' | 'future';
    individualismCollectivism: number; // 1-10 scale
  };
  
  religiousSpirituality: {
    beliefs: string;
    practices: string[];
    spiritualIdentity: string;
    relationToSacred: string;
  };
}

/**
 * Psychology - The Contradictory Heart
 */
export interface CharacterPsychology {
  // Core Conflict Engine (Want vs Need)
  want: {
    consciousGoal: string;
    externalObjective: string;
    whatTheyThinkWillMakeThemHappy: string;
    pursuitStrategy: string;
  };
  
  need: {
    unconsciousTruth: string;
    internalLesson: string;
    whatTheyActuallyNeedForFulfillment: string;
    thematicSignificance: string;
  };
  
  lieTheyBelieve: {
    falseWorldview: string;
    originOfLie: string;
    howLieManifests: string;
    evidenceAgainstLie: string[];
  };
  
  // Psychological vs Moral Needs
  psychologicalNeed: string; // Flaw that hurts them
  moralNeed: string; // Flaw that hurts others
  
  // Internal Contradictions
  coreContradictions: {
    statedBelief: string;
    conflictingFlaw: string;
    crucibleScenario: string;
    contradictoryAction: string;
  }[];
  
  // Vulnerability and Agency Balance
  vulnerabilities: {
    emotionalAchillesHeel: string;
    deepInsecurities: string[];
    fears: string[];
    internalConflicts: string[];
  };
  
  agency: {
    decisionMakingStyle: string;
    problemSolvingApproach: string;
    leadershipCapacity: number;
    influenceStrategies: string[];
  };
}

// ============================================================================
// PART III: ADVANCED NARRATIVE ENGINEERING
// ============================================================================

/**
 * Character Voice Engineering
 */
export interface CharacterVoice {
  lexicon: {
    vocabularyLevel: 'simple' | 'conversational' | 'sophisticated' | 'academic';
    professionalJargon: string[];
    culturalExpressions: string[];
    slangUsage: string[];
    uniqueWords: string[];
  };
  
  syntax: {
    sentenceLength: 'short' | 'medium' | 'long' | 'varied';
    complexity: 'simple' | 'compound' | 'complex';
    voicePreference: 'active' | 'passive' | 'mixed';
    interruptionPattern: string;
    grammarPrecision: number; // 1-10
  };
  
  rhythm: {
    speakingPace: 'slow' | 'moderate' | 'fast' | 'variable';
    pauseUsage: string;
    emphasisPatterns: string[];
    conversationalDominance: number; // 1-10
  };
  
  verbalTics: {
    fillerWords: string[];
    catchphrases: string[];
    repetitivePatterns: string[];
    nervousHabits: string[];
  };
  
  subtext: {
    hiddenMeanings: string[];
    emotionalUndercurrents: string[];
    powerDynamics: string[];
    intimacyMarkers: string[];
  };
}

/**
 * Character Chemistry Algorithm
 */
export interface CharacterChemistry {
  vulnerability: {
    sharedSecrets: string[];
    mutualRecognition: string;
    hiddenSelfRevelation: string;
    intimacyLevel: number;
  };
  
  desire: {
    attractionType: 'physical' | 'intellectual' | 'emotional' | 'social';
    magneticQualities: string[];
    admirationFocus: string;
    desireIntensity: number;
  };
  
  resistance: {
    internalObstacles: string[];
    externalBarriers: string[];
    personalFlaws: string[];
    socialConstraints: string[];
  };
  
  behavioralEvidence: {
    conflictAndBanter: string[];
    mirroringBehaviors: string[];
    subtextualCommunication: string[];
    bodyLanguageCues: string[];
    sharedMoments: string[];
  };
}

// ============================================================================
// MAIN CHARACTER ARCHITECTURE
// ============================================================================

/**
 * The Complete Multi-Dimensional Character
 */
export interface ArchitectedCharacter {
  // Basic Identity
  id: string;
  name: string;
  role: string;
  
  // Psychological Foundation
  enneagramType: EnneagramType;
  narrativeArc: NarrativeTherapyArc;
  jungianPsyche: JungianPsyche;
  bigFiveProfile: BigFiveProfile;
  
  // Three-Dimensional Framework
  physiology: CharacterPhysiology;
  sociology: CharacterSociology;
  psychology: CharacterPsychology;
  
  // Advanced Engineering
  voice: CharacterVoice;
  chemistryProfiles: Record<string, CharacterChemistry>; // With other characters
  
  // Arc Development
  arcType: 'positive' | 'negative' | 'flat';
  arcSubtype?: 'corruption' | 'disillusionment' | 'fall';
  transformationStages: string[];
  
  // Industry Context
  complexityLevel: 'lean-forward' | 'lean-back';
  narrativeFormat: 'feature' | 'series' | 'limited-series';
  targetAudience: string;
  
  // Quality Metrics
  psychologicalConsistency: number; // 1-10
  culturalAuthenticity: number; // 1-10
  narrativeFunction: number; // 1-10
  audienceConnection: number; // 1-10
}

// ============================================================================
// CHARACTER ENGINE V2.0 IMPLEMENTATION
// ============================================================================

export class CharacterEngineV2 {
  
  /**
   * AI-ENHANCED: Generate a complete multi-dimensional character
   */
  static async architectCharacter(
    premise: StoryPremise,
    characterRole: string,
    characterConcept: string,
    options: {
      complexityLevel?: 'lean-forward' | 'lean-back';
      narrativeFormat?: 'feature' | 'series' | 'limited-series';
      culturalBackground?: string;
      targetAudience?: string;
      enneagramHint?: number;
    } = {}
  ): Promise<ArchitectedCharacter> {
    
    console.log(`🧠 CHARACTER ENGINE V2.0: Architecting ${characterRole}...`);
    console.log(`📝 CHARACTER CONCEPT: ${characterConcept}`);
    
    try {
      // Stage 1: Foundation - Psychological Engine
      const psychologicalFoundation = await this.buildPsychologicalFoundation(
        premise, characterRole, characterConcept, options
      );
      
      // Stage 2: Construction - Three-Dimensional Framework  
      const threedimensionalFramework = await this.buildThreeDimensionalFramework(
        psychologicalFoundation, characterConcept, characterRole, options
      );
      
      // Stage 3: Dynamics - Advanced Narrative Engineering
      const narrativeDynamics = await this.engineerNarrativeDynamics(
        psychologicalFoundation, threedimensionalFramework, characterConcept, characterRole, options
      );
      
      // Stage 4: Integration - Complete Character Assembly
      const architectedCharacter = await this.assembleCharacterArchitecture(
        psychologicalFoundation,
        threedimensionalFramework,
        narrativeDynamics,
        characterConcept,
        characterRole,
        options
      );
      
      console.log(`✅ CHARACTER ENGINE V2.0: ${architectedCharacter.name} architecture complete`);
      
      return architectedCharacter;
      
    } catch (error) {
      console.error('❌ Character Engine V2.0 failed:', error);
      throw new Error(`Character architecture failed: ${error}`);
    }
  }
  
  /**
   * Stage 1: Build Psychological Foundation
   */
  private static async buildPsychologicalFoundation(
    premise: StoryPremise,
    role: string,
    concept: string,
    options: any
  ): Promise<{
    enneagramType: EnneagramType;
    narrativeArc: NarrativeTherapyArc;
    jungianPsyche: JungianPsyche;
    bigFiveProfile: BigFiveProfile;
  }> {
    
    const prompt = `As a psychological expert, architect the internal world of this character:

🚨 CRITICAL INSTRUCTIONS - READ CAREFULLY:
The user has provided SPECIFIC character details below. You MUST use these exact details. Do NOT replace them with generic or different information.

USER-PROVIDED CHARACTER INFORMATION (USE THESE EXACT DETAILS):
${concept}

ROLE IN STORY: ${role}
STORY PREMISE: ${premise.premiseStatement}

COMPLEXITY LEVEL: ${options.complexityLevel || 'lean-forward'}
CULTURAL BACKGROUND: ${options.culturalBackground || 'General American'}

🎯 MANDATORY REQUIREMENTS:
1. If the user specified a NAME (e.g., "Jane Lee"), that IS the character's name - use it exactly
2. If the user specified an OCCUPATION (e.g., "actress", "kpop idol", "former kpop idol"), that IS their occupation - do not change it to something else
3. If the user specified APPEARANCE (e.g., "5'5, 23 years old, Korean-American"), those ARE their physical traits - use them exactly
4. If the user specified WANT (e.g., "to step out of being typecasted"), that IS their want - do not replace it with a different goal
5. If the user specified NEED (e.g., "to learn how to be more confident"), that IS their need - do not replace it
6. If the user specified PRIMARY FLAW (e.g., "Low internal confidence"), that IS their flaw - use it
7. If the user specified BACKGROUND (e.g., "former kpop idol", "Korean-American"), that IS their background - include it in sociology

❌ DO NOT:
- Replace user-specified details with generic alternatives
- Ignore specific requirements (age, ethnicity, occupation, etc.)
- Change the Want/Need/Flaw to something "more interesting"
- Generate a different character than what the user described

✅ DO:
- Use the psychological frameworks to ADD DEPTH and NUANCE to the user's provided details
- Expand upon what they provided with psychological complexity
- Connect their specific details to deeper psychological patterns
- Honor every specific detail they mentioned

Using advanced psychological frameworks, create a psychological foundation that USES and ENHANCES the user's exact provided details:

1. ENNEAGRAM TYPE ANALYSIS:
   - Which of the 9 types best fits this character concept?
   - What is their core motivation (basic desire vs basic fear)?
   - How does their type manifest in this specific story context?
   - What is their current health level (1-9 scale)?

2. NARRATIVE THERAPY ARC:
   - What is the problematic story they believe about themselves?
   - How can this problem be externalized? (Name it: "The Anger", "The Shame", etc.)
   - What are the origins of this problem in their backstory?
   - What would their preferred, healthier story look like?

3. JUNGIAN PSYCHOLOGY:
   - What persona (mask) do they show the world?
   - What shadow aspects do they repress or deny?
   - What is the primary archetype they embody?
   - How do their anima/animus energies balance?

4. BIG FIVE PERSONALITY:
   - Rate them 1-10 on: Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism
   - How do these traits manifest in specific behaviors?
   - What are their emotional patterns and stress responses?

Create a psychologically complex character whose internal world drives compelling external action.`;

    try {
      const result = await generateContent({
        prompt,
        systemPrompt: 'You are a master psychologist and character architect. Create deep, nuanced psychological profiles using established psychological frameworks.',
        temperature: 0.7,
        maxTokens: 8000 // Increased to prevent truncation for full 3D character generation
      });

      return this.parsePsychologicalFoundation(result, options);
      
    } catch (error) {
      console.warn('AI psychological foundation failed, using structured fallback');
      return this.generateFallbackPsychologicalFoundation(concept, role, options);
    }
  }
  
  /**
   * Stage 2: Build Three-Dimensional Framework
   */
  private static async buildThreeDimensionalFramework(
    foundation: any,
    characterConcept: string,
    characterRole: string,
    options: any
  ): Promise<{
    physiology: CharacterPhysiology;
    sociology: CharacterSociology;
    psychology: CharacterPsychology;
  }> {
    
    const prompt = `Build the three-dimensional framework for this character:

🚨 CRITICAL INSTRUCTIONS - READ CAREFULLY:
The user has provided SPECIFIC character details below. You MUST use these exact details in the three-dimensional framework. Do NOT replace them.

USER-PROVIDED CHARACTER INFORMATION (USE THESE EXACT DETAILS):
${characterConcept}

ROLE IN STORY: ${characterRole}

PSYCHOLOGICAL FOUNDATION (from previous stage):
- Enneagram Type: ${foundation.enneagramType.name}
- Core Motivation: ${foundation.enneagramType.basicDesire}
- Primary Fear: ${foundation.enneagramType.basicFear}
- Shadow Elements: ${foundation.jungianPsyche.shadow.repressedTraits?.join(', ')}

CULTURAL CONTEXT: ${options.culturalBackground || 'General American'}
NARRATIVE FORMAT: ${options.narrativeFormat || 'series'}

🎯 MANDATORY REQUIREMENTS FOR EACH DIMENSION:

1. PHYSIOLOGY (Body as Narrative Canvas):
   - If user specified AGE (e.g., "23 years old"), use that EXACT age
   - If user specified GENDER/IDENTITY (e.g., "Korean-American", "Female"), use that EXACT identity
   - If user specified APPEARANCE (e.g., "5'5", "Korean-American", "kpop idol visual"), use those EXACT details
   - If user specified DISTINCTIVE FEATURES, include them
   - Enhance with psychological depth, but KEEP the user's core physical description

2. SOCIOLOGY (Cultural Matrix):
   - If user specified OCCUPATION (e.g., "actress", "former kpop idol", "actor-producer"), that IS their occupation
   - If user specified BACKGROUND (e.g., "Korean-American", "former kpop idol"), that IS their cultural/educational background
   - If user specified EDUCATION or TRAINING, include it
   - If user specified SOCIAL CLASS or ECONOMIC STATUS, use it
   - Expand upon these details, but DO NOT replace them with different occupations or backgrounds

3. PSYCHOLOGY (Want vs Need Engine):
   - If user specified WANT (e.g., "to step out of being typecasted as a bubbly innocent love interest"), that IS their want - use it exactly
   - If user specified NEED (e.g., "to learn how to be more confident"), that IS their need - use it exactly
   - If user specified PRIMARY FLAW (e.g., "Low internal confidence"), that IS their flaw - use it
   - If user specified CORE VALUE/TRAIT, use it
   - Add psychological depth and nuance, but HONOR what they specified

❌ DO NOT:
- Replace "actress" with "business executive" or "VP"
- Replace "23 years old" with "32 years old"
- Replace "Korean-American" with "Non-binary" (unless user specified that)
- Replace user's Want/Need/Flaw with different goals
- Ignore specific background details (kpop idol, etc.)

✅ DO:
- Use the EXACT details the user provided
- Add depth and psychological complexity to those details
- Connect their specific traits to deeper patterns
- Honor every specific requirement

Example: If user says "Jane Lee, 23 years old, Korean-American, former kpop idol, actress, wants to step out of typecasting":
- Age MUST be 23 (not 32)
- Identity MUST include Korean-American
- Occupation MUST include actress/performer
- Sociology MUST include kpop idol background
- Want MUST be about typecasting/acting roles (not becoming a VP)

Create comprehensive three-dimensional profile that USES the user's EXACT provided details:

1. PHYSIOLOGY (Body as Narrative Canvas):
   - Physical traits that reflect their psychology
   - Sense memory trigger from their backstory
   - Animal essence that captures their movement quality
   - Private moments/rituals when alone
   - How their body shapes their worldview

2. SOCIOLOGY (Cultural Matrix):
   - Social class and economic background
   - Family system and dynamics
   - Professional identity and work culture
   - Educational background and learning style
   - Cultural communication patterns
   - Religious/spiritual orientation

3. PSYCHOLOGY (Want vs Need Engine):
   - WANT: What they consciously pursue (external goal)
   - NEED: What they unconsciously require (internal lesson)
   - THE LIE: False belief driving their want
   - Core contradictions between stated beliefs and hidden flaws
   - Vulnerabilities vs agency balance
   - CORE VALUE: Their fundamental belief or value that drives them (extract from enneagram or generate)
   - MORAL STANDPOINT: Their ethical framework and moral position
   - PRIMARY FLAW: Their main character flaw that creates obstacles (extract from psychologicalNeed or moralNeed)
   - TEMPERAMENT: Array of 3-5 temperament traits (e.g., ["Melodramatic", "Hyper-focused", "Resilient"])
   - ATTITUDE: Their general attitude toward life and others
   - IQ: Brief description of their intelligence level and type (e.g., "High social intelligence and pattern recognition, low self-awareness")

Ensure all three dimensions reinforce each other and the psychological foundation.

**OUTPUT FORMAT:**
Provide your response as a valid JSON object with this structure:
{
  "physiology": {
    "age": <number>,
    "gender": "<string>",
    "height": "<string>",
    "build": "<string>",
    "appearance": "<string>",
    "health": "<string> - Description of their physical health and condition",
    "physicalTraits": ["<string>", ...] - Array of distinctive physical features,
    "senseMemory": { ... },
    "animalEssence": { ... },
    "privateMoments": { ... },
    "healthConditions": [],
    "chronicPain": [],
    "physicalLimitations": [],
    "bodyImage": "<string>",
    "relationshipToPhysicality": "<string>"
  },
  "sociology": {
    "socialClass": { ... },
    "familySystem": { ... },
    "profession": { ... },
    "education": { ... },
    "culturalBackground": { ... },
    "culturalSoftware": { ... },
    "religiousSpirituality": { ... },
    "homeLife": "<string> - Description of their living situation and home environment",
    "economicStatus": "<string> - Their financial situation and economic standing",
    "communityStanding": "<string> - How they are viewed in their community"
  },
  "psychology": {
    "want": { ... },
    "need": { ... },
    "lieTheyBelieve": { ... },
    "psychologicalNeed": "<string>",
    "moralNeed": "<string>",
    "coreValue": "<string> - Their fundamental belief or value that drives them",
    "moralStandpoint": "<string> - Their ethical framework and moral position",
    "primaryFlaw": "<string> - Their main character flaw that creates obstacles",
    "temperament": ["<string>", ...] - Array of 3-5 temperament traits,
    "attitude": "<string> - Their general attitude toward life and others",
    "iq": "<string> - Brief description of their intelligence level and type",
    "coreContradictions": [],
    "vulnerabilities": {
      ...,
      "fears": ["<string>", ...] - Array of fears (first one is their top fear)
    },
    "agency": { ... }
  }
}

Output ONLY valid JSON (no markdown, no explanation).`;

    try {
      const result = await generateContent({
        prompt,
        systemPrompt: 'You are an expert in character development using the three-dimensional framework. Create cohesive, realistic character profiles. Output ONLY valid JSON.',
        temperature: 0.7,
        maxTokens: 8000 // Increased to prevent truncation for full 3D character generation
      });

      console.log('📝 [3D FRAMEWORK] AI Response length:', result.length)
      console.log('📝 [3D FRAMEWORK] AI Response preview:', result.substring(0, 500))

      return this.parseThreeDimensionalFramework(result, foundation);
      
    } catch (error) {
      console.warn('AI three-dimensional framework failed, using structured fallback');
      return this.generateFallbackThreeDimensionalFramework(foundation, options);
    }
  }
  
  /**
   * Stage 3: Engineer Narrative Dynamics
   */
  private static async engineerNarrativeDynamics(
    foundation: any,
    framework: any,
    characterConcept: string,
    characterRole: string,
    options: any
  ): Promise<{
    voice: CharacterVoice;
    arcDevelopment: any;
  }> {
    
    const prompt = `Engineer the narrative dynamics for this character:

⚠️ CRITICAL: The user has provided this specific character concept - you MUST honor these details:
CHARACTER CONCEPT: "${characterConcept}"
ROLE IN STORY: ${characterRole}

CHARACTER FOUNDATION:
- Type: ${foundation.enneagramType.name}
- Social Class: ${framework.sociology.socialClass.economic}
- Education: ${framework.sociology.education.level}
- Occupation: ${framework.sociology.occupation?.primary || 'Not specified'}
- Personality: Big Five scores provided
- Core Conflict: ${framework.psychology.want.consciousGoal} vs ${framework.psychology.need.unconsciousTruth}

IMPORTANT: The character concept above contains specific user requirements. The voice and arc MUST reflect these details.
For example, if the concept mentions "kpop idol", the voice should reflect that cultural/linguistic background.
If the concept mentions "actress", the voice should reflect performance/acting background.

Create advanced narrative engineering that honors the user's specific character concept:

1. CHARACTER VOICE:
   - Lexicon: Vocabulary level, jargon, cultural expressions
   - Syntax: Sentence structure, complexity, grammar precision
   - Rhythm: Speaking pace, pause usage, emphasis patterns
   - Verbal tics: Filler words, catchphrases, nervous habits
   - Subtext: Hidden meanings, emotional undercurrents

2. ARC DEVELOPMENT:
   - Arc type: Positive, negative, or flat?
   - Transformation stages through the story
   - How stress/growth directions manifest (Enneagram)
   - Key turning points and character revelations
   - Relationship to thematic journey

Design voice and arc that feel authentic to this specific character's background and psychology.

**OUTPUT FORMAT:**
Provide your response as a valid JSON object with this structure:
{
  "voice": {
    "lexicon": { ... },
    "syntax": { ... },
    "rhythm": { ... },
    "verbalTics": { ... },
    "subtext": { ... }
  },
  "arcDevelopment": {
    "type": "<positive|negative|flat>",
    "subtype": "<optional>",
    "stages": ["...", "..."]
  }
}

Output ONLY valid JSON (no markdown, no explanation).`;

    try {
      const result = await generateContent({
        prompt,
        systemPrompt: 'You are a master of character voice and narrative arc development. Create distinctive, authentic character dynamics. Output ONLY valid JSON.',
        temperature: 0.8,
        maxTokens: 8000 // Increased to prevent truncation for full 3D character generation
      });

      console.log('📝 [NARRATIVE DYNAMICS] AI Response length:', result.length)
      console.log('📝 [NARRATIVE DYNAMICS] AI Response preview:', result.substring(0, 500))

      return this.parseNarrativeDynamics(result, foundation, framework);
      
    } catch (error) {
      console.warn('AI narrative dynamics failed, using structured fallback');
      return this.generateFallbackNarrativeDynamics(foundation, framework);
    }
  }
  
  /**
   * Stage 4: Assemble Complete Character Architecture
   */
  private static async assembleCharacterArchitecture(
    foundation: any,
    framework: any,
    dynamics: any,
    characterConcept: string,
    characterRole: string,
    options: any
  ): Promise<ArchitectedCharacter> {
    
    // Extract name from characterConcept if it contains a name
    // The concept format is structured with sections like "Name: Jane Lee\n\nDescription: ..."
    let providedName: string | null = null
    
    // Try format: "Name: Jane Lee" (at the start of the concept, followed by newline or end)
    const nameLineMatch = characterConcept.match(/^Name:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/m)
    if (nameLineMatch && nameLineMatch[1]) {
      providedName = nameLineMatch[1].trim()
      console.log(`📝 [ASSEMBLY] Found provided name in concept (format: "Name: ..."): ${providedName}`)
    } else {
      // Try format: "Name: description" (single line format)
      const nameMatch = characterConcept.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*):\s*(.+)$/m)
      if (nameMatch && nameMatch[1] && nameMatch[1].length < 50) { // Reasonable name length
        providedName = nameMatch[1].trim()
        console.log(`📝 [ASSEMBLY] Found provided name in concept (format: "Name: description"): ${providedName}`)
      } else {
        // Try format: "Name description" (name at start, followed by space and description)
        // Match 1-3 capitalized words at the start that look like a name
        const namePattern = /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\s+([a-z]|is|was|are|were|the|a|an|Description|Archetype|Premise)/
        const namePatternMatch = characterConcept.match(namePattern)
        if (namePatternMatch && namePatternMatch[1]) {
          const potentialName = namePatternMatch[1].trim()
          // Validate it's likely a name (2-3 words, all capitalized first letters, reasonable length)
          if (potentialName.split(' ').length <= 3 && 
              potentialName.length < 50 &&
              /^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/.test(potentialName)) {
            providedName = potentialName
            console.log(`📝 [ASSEMBLY] Extracted name from concept (format: "Name description"): ${providedName}`)
          }
        }
      }
    }
    
    // Use provided name if found, otherwise generate one
    const name = providedName || await this.generateCharacterName(foundation, framework, options);
    
    if (providedName) {
      console.log(`✅ [ASSEMBLY] Using user-provided name: ${name}`)
    } else {
      console.log(`⚠️ [ASSEMBLY] No name found in concept, generated: ${name}`)
      console.log(`⚠️ [ASSEMBLY] Concept preview (first 200 chars): ${characterConcept.substring(0, 200)}`)
    }
    
    return {
      id: `char-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name,
      role: characterRole || options.role || 'Character',
      
      // Psychological Foundation
      enneagramType: foundation.enneagramType,
      narrativeArc: foundation.narrativeArc,
      jungianPsyche: foundation.jungianPsyche,
      bigFiveProfile: foundation.bigFiveProfile,
      
      // Three-Dimensional Framework
      physiology: framework.physiology,
      sociology: framework.sociology,
      psychology: framework.psychology,
      
      // Advanced Engineering
      voice: dynamics.voice,
      chemistryProfiles: {}, // To be populated when interacting with other characters
      
      // Arc Development
      arcType: dynamics.arcDevelopment.type,
      arcSubtype: dynamics.arcDevelopment.subtype,
      transformationStages: dynamics.arcDevelopment.stages,
      
      // Industry Context
      complexityLevel: options.complexityLevel || 'lean-forward',
      narrativeFormat: options.narrativeFormat || 'series',
      targetAudience: options.targetAudience || 'General',
      
      // Quality Metrics (to be calculated)
      psychologicalConsistency: 8,
      culturalAuthenticity: 7,
      narrativeFunction: 8,
      audienceConnection: 7
    };
  }
  
  // ============================================================================
  // HELPER METHODS AND PARSERS
  // ============================================================================
  
  private static parsePsychologicalFoundation(result: string, options: any): any {
    // Parse AI response and extract psychological elements
    // This would be more sophisticated in production
    const enneagramHint = options.enneagramHint || 3; // Default to Type 3
    const enneagramType = ENNEAGRAM_TYPES[enneagramHint];
    
    return {
      enneagramType,
      narrativeArc: {
        problematicStory: "I must achieve to be worthy",
        externalizationPhase: {
          problemName: "The Performance Pressure",
          problemInfluence: "Forces constant achievement seeking",
          resistanceEvidence: ["Moments of genuine connection", "Times of authentic vulnerability"]
        },
        deconstructionPhase: {
          problemOrigins: ["Childhood achievement pressure", "Conditional love"],
          culturalInfluences: ["Success-oriented society", "Social media validation"],
          affectedDomains: ["Relationships", "Self-worth", "Career choices"]
        },
        reauthoringPhase: {
          preferredStory: "I am worthy regardless of achievements",
          uniqueOutcomes: ["Times they helped others without recognition"],
          supportingEvidence: ["Natural talents", "Genuine friendships"]
        }
      },
      jungianPsyche: {
        persona: {
          publicMask: "Successful, confident achiever",
          socialRole: "The one who has it all together",
          acceptableTraits: ["Competent", "Driven", "Polished"],
          socialStrategies: ["Image management", "Strategic networking"]
        },
        shadow: {
          repressedTraits: ["Insecurity", "Vulnerability", "Failure"],
          hiddenDesires: ["To be loved for who they are, not what they do"],
          shamefulAspects: ["Fear of being ordinary", "Deep loneliness"],
          projectedQualities: ["Laziness in others", "Authenticity"]
        },
        anima_animus: {
          receptiveEnergy: 4,
          activeEnergy: 8,
          energyBalance: 'active-dominant',
          unconsciousContrasexual: "Deep emotional needs and intuitive wisdom"
        },
        archetypes: {
          primary: "Hero",
          secondary: "Ruler", 
          shadowArchetype: "Fool"
        }
      },
      bigFiveProfile: {
        openness: { score: 7, traits: ["Creative problem-solving", "Adaptable"], creativity: 8, curiosity: 6, aestheticSensitivity: 7 },
        conscientiousness: { score: 9, traits: ["Highly organized", "Goal-oriented"], organization: 9, discipline: 9, reliability: 8 },
        extraversion: { score: 8, traits: ["Socially confident", "Assertive"], sociability: 8, assertiveness: 9, energySource: 'external' },
        agreeableness: { score: 5, traits: ["Competitive", "Direct"], empathy: 4, cooperation: 5, trust: 4 },
        neuroticism: { score: 6, traits: ["Performance anxiety", "Image concerns"], emotionalStability: 4, stressResponse: "Increased activity and control", anxietyTriggers: ["Failure", "Judgment", "Loss of control"] }
      }
    };
  }
  
  private static parseThreeDimensionalFramework(result: string, foundation: any): any {
    // Parse AI response for three-dimensional elements
    try {
      const { cleanAndParseJSON } = require('@/lib/json-utils')
      const parsed = cleanAndParseJSON(result)
      
      console.log('✅ [3D FRAMEWORK] Successfully parsed JSON from AI response')
      console.log('📊 [3D FRAMEWORK] Parsed data:', {
        hasPhysiology: !!parsed.physiology,
        hasSociology: !!parsed.sociology,
        hasPsychology: !!parsed.psychology,
        age: parsed.physiology?.age,
        gender: parsed.physiology?.gender,
        occupation: parsed.sociology?.profession?.occupation || parsed.sociology?.occupation
      })
      
      // Return parsed data - this is the ACTUAL AI-generated data, not hardcoded!
      return parsed
      
    } catch (error) {
      console.error('❌ [3D FRAMEWORK] Failed to parse AI response:', error)
      console.log('📄 [3D FRAMEWORK] Raw response (first 1000 chars):', result.substring(0, 1000))
      // Re-throw error so caller can use fallback
      throw error
    }
  }
  
  private static parseNarrativeDynamics(result: string, foundation: any, framework: any): any {
    // Parse AI response for narrative dynamics (voice and arc)
    try {
      const { cleanAndParseJSON } = require('@/lib/json-utils')
      const parsed = cleanAndParseJSON(result)
      
      console.log('✅ [NARRATIVE DYNAMICS] Successfully parsed JSON from AI response')
      
      // Return parsed data - this is the ACTUAL AI-generated data, not hardcoded!
      return parsed
      
    } catch (error) {
      console.error('❌ [NARRATIVE DYNAMICS] Failed to parse AI response:', error)
      console.log('📄 [NARRATIVE DYNAMICS] Raw response (first 1000 chars):', result.substring(0, 1000))
      // Re-throw error so caller can use fallback
      throw error
    }
  }
  
  private static async generateCharacterName(foundation: any, framework: any, options: any): Promise<string> {
    const prompt = `Generate an authentic name for this character:

BACKGROUND:
- Social Class: ${framework.sociology.socialClass.economic}
- Cultural Background: ${framework.sociology.culturalBackground.ethnicity}
- Generation: ${framework.sociology.culturalBackground.generationInCountry}
- Professional Context: ${framework.sociology.profession.occupation}
- Personality: ${foundation.enneagramType.name}

Suggest 3 first names that would fit this character's background and personality.
Consider cultural authenticity, generational appropriateness, and professional context.`;

    try {
      const result = await generateContent({
        prompt,
        systemPrompt: 'You are an expert in names and cultural authenticity. Suggest appropriate character names.',
        temperature: 0.8,
        maxTokens: 200
      });

      // Extract first suggested name
      const names = result.match(/\d+\.\s*([A-Za-z]+)/g);
      if (names && names.length > 0) {
        return names[0].replace(/\d+\.\s*/, '');
      }
      
      return "Alex"; // Fallback
      
    } catch (error) {
      return "Jordan"; // Fallback
    }
  }
  
  // Fallback methods for when AI fails
  private static generateFallbackPsychologicalFoundation(concept: string, role: string, options: any): any {
    const defaultType = options.enneagramHint || 3;
    return {
      enneagramType: ENNEAGRAM_TYPES[defaultType],
      narrativeArc: {
        problematicStory: "I must prove my worth through achievement",
        externalizationPhase: {
          problemName: "The Pressure",
          problemInfluence: "Drives constant striving",
          resistanceEvidence: ["Moments of genuine connection"]
        },
        deconstructionPhase: {
          problemOrigins: ["Childhood conditioning"],
          culturalInfluences: ["Achievement culture"],
          affectedDomains: ["Relationships", "Self-worth"]
        },
        reauthoringPhase: {
          preferredStory: "I am worthy as I am",
          uniqueOutcomes: ["Acts of authentic kindness"],
          supportingEvidence: ["Natural abilities"]
        }
      },
      jungianPsyche: {
        persona: {
          publicMask: "Competent professional",
          socialRole: "The achiever",
          acceptableTraits: ["Successful", "Driven"],
          socialStrategies: ["Performance", "Image management"]
        },
        shadow: {
          repressedTraits: ["Vulnerability", "Insecurity"],
          hiddenDesires: ["Unconditional acceptance"],
          shamefulAspects: ["Fear of failure"],
          projectedQualities: ["Laziness"]
        },
        anima_animus: {
          receptiveEnergy: 4,
          activeEnergy: 8,
          energyBalance: 'active-dominant',
          unconsciousContrasexual: "Emotional depth"
        },
        archetypes: {
          primary: "Hero",
          secondary: "Ruler",
          shadowArchetype: "Fool"
        }
      },
      bigFiveProfile: {
        openness: { score: 7, traits: ["Creative"], creativity: 7, curiosity: 6, aestheticSensitivity: 6 },
        conscientiousness: { score: 9, traits: ["Organized"], organization: 9, discipline: 9, reliability: 9 },
        extraversion: { score: 8, traits: ["Outgoing"], sociability: 8, assertiveness: 8, energySource: 'external' },
        agreeableness: { score: 5, traits: ["Competitive"], empathy: 5, cooperation: 5, trust: 5 },
        neuroticism: { score: 6, traits: ["Anxious"], emotionalStability: 4, stressResponse: "Increased activity", anxietyTriggers: ["Failure"] }
      }
    };
  }
  
  private static generateFallbackThreeDimensionalFramework(foundation: any, options: any): any {
    return {
      physiology: {
        age: 30,
        gender: "Non-binary",
        height: "Average",
        build: "Average",
        appearance: "Professional",
        senseMemory: {
          triggerSense: 'sound',
          triggerStimulus: "Applause",
          associatedMemory: "First success",
          physiologicalResponse: "Energy boost"
        },
        animalEssence: {
          primaryAnimal: "Hawk",
          movementQuality: "Purposeful",
          posturalHabits: "Upright",
          spatialNeeds: "Open space",
          observationalStyle: "Scanning"
        },
        privateMoments: {
          soloRituals: ["Goal review"],
          unguardedBehaviors: ["Self-doubt"],
          secretHabits: ["Comparison"],
          vulnerableMoments: ["After failure"]
        },
        healthConditions: [],
        chronicPain: [],
        physicalLimitations: [],
        bodyImage: "Image-conscious",
        relationshipToPhysicality: "Tool for success"
      },
      sociology: {
        socialClass: {
          economic: 'middle',
          cultural: "Professional",
          socialMobility: "Upward",
          classMarkers: ["Speech", "Dress"]
        },
        familySystem: {
          structure: "Nuclear",
          dynamics: "Achievement-focused",
          birthOrder: "Eldest",
          familyRole: "Achiever",
          intergenerationalTrauma: ["Performance pressure"]
        },
        profession: {
          occupation: "Professional",
          careerStage: "Rising",
          workCulture: "Competitive",
          professionalIdentity: "High performer",
          workRelationships: ["Strategic"]
        },
        education: {
          level: "College",
          institutions: ["University"],
          learningStyle: "Goal-oriented",
          intellectualCuriosity: 7,
          knowledgeAreas: ["Professional skills"]
        },
        culturalBackground: {
          ethnicity: "Mixed",
          nationality: "American",
          regionalCulture: "Urban",
          immigrationStatus: undefined,
          generationInCountry: undefined
        },
        culturalSoftware: {
          communicationStyle: 'direct',
          conflictStyle: "Competitive",
          authorityRelation: "Merit-based",
          timeOrientation: 'future',
          individualismCollectivism: 7
        },
        religiousSpirituality: {
          beliefs: "Secular",
          practices: ["Goal-setting"],
          spiritualIdentity: "Self-reliant",
          relationToSacred: "Achievement"
        }
      },
      psychology: {
        want: {
          consciousGoal: "Professional success",
          externalObjective: "Recognition",
          whatTheyThinkWillMakeThemHappy: "Achievement",
          pursuitStrategy: "Hard work"
        },
        need: {
          unconsciousTruth: "Self-acceptance",
          internalLesson: "Worth isn't earned",
          whatTheyActuallyNeedForFulfillment: "Authentic connection",
          thematicSignificance: "Performance to authenticity"
        },
        lieTheyBelieve: {
          falseWorldview: "Worth equals achievement",
          originOfLie: "Childhood conditioning",
          howLieManifests: "Constant striving",
          evidenceAgainstLie: ["Unconditional love moments"]
        },
        psychologicalNeed: "Overcome impostor syndrome",
        moralNeed: "Stop using others",
        coreContradictions: [{
          statedBelief: "Teamwork is important",
          conflictingFlaw: "Competitive nature",
          crucibleScenario: "Team member threatens position",
          contradictoryAction: "Subtle undermining"
        }],
        vulnerabilities: {
          emotionalAchillesHeel: "Fear of inadequacy",
          deepInsecurities: ["Impostor syndrome"],
          fears: ["Failure", "Being ordinary"],
          internalConflicts: ["Success vs authenticity"]
        },
        agency: {
          decisionMakingStyle: "Strategic",
          problemSolvingApproach: "Systematic",
          leadershipCapacity: 7,
          influenceStrategies: ["Competence display"]
        }
      }
    };
  }
  
  private static generateFallbackNarrativeDynamics(foundation: any, framework: any): any {
    return {
      voice: {
        lexicon: {
          vocabularyLevel: 'sophisticated',
          professionalJargon: ["Strategic", "Optimize"],
          culturalExpressions: ["Touch base"],
          slangUsage: ["Minimal"],
          uniqueWords: ["Execute", "Leverage"]
        },
        syntax: {
          sentenceLength: 'medium',
          complexity: 'compound',
          voicePreference: 'active',
          interruptionPattern: "Strategic",
          grammarPrecision: 8
        },
        rhythm: {
          speakingPace: 'fast',
          pauseUsage: "For emphasis",
          emphasisPatterns: ["Achievements"],
          conversationalDominance: 7
        },
        verbalTics: {
          fillerWords: ["Actually"],
          catchphrases: ["Make it happen"],
          repetitivePatterns: ["Success references"],
          nervousHabits: ["Fast speech when challenged"]
        },
        subtext: {
          hiddenMeanings: ["Self-promotion"],
          emotionalUndercurrents: ["Masked insecurity"],
          powerDynamics: ["Positioning for advantage"],
          intimacyMarkers: ["Rare vulnerability"]
        }
      },
      arcDevelopment: {
        type: 'positive',
        subtype: undefined,
        stages: [
          "Establishing competence",
          "Performance isn't enough",
          "Relationship consequences",
          "Validation crisis",
          "Finding authentic worth",
          "Integration of drive and connection"
        ]
      }
    };
  }
}

 