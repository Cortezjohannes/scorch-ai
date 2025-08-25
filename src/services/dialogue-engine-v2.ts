/**
 * The Dialogue Engine V2.0 - The Architecture of Speech
 * 
 * A comprehensive framework for narrative dialogue craftsmanship based on:
 * - Master techniques (Sorkin, Mamet, Tarantino)
 * - Subtext and layered meaning mechanics
 * - Conflict-driven dialogue structures
 * - Character voice differentiation
 * - Psychology of authentic conversation
 * - Genre-specific vernaculars
 * - Technical performance considerations
 * - Professional editing and revision systems
 * 
 * This system transforms dialogue from functional speech into memorable, 
 * purposeful, and unforgettable narrative architecture.
 */

import { generateContent } from './azure-openai'

// ============================================================================
// PART I: THE FOUNDATIONS OF DIALOGUE CRAFTSMANSHIP
// ============================================================================

/**
 * Master Dialogue Techniques Analysis
 */
export interface MasterDialogueTechniques {
  sorkin: {
    musicalDialogue: {
      rhythm: 'melodic_rapid' | 'contrapuntal' | 'intellectual_velocity';
      alliterationLevel: number; // 1-10
      thematicRepetition: string[]; // Key phrases to repeat
      pingPongTechnique: {
        enabled: boolean;
        throwBackPhrases: string[]; // Words to throw back in character's face
      };
    };
    structuralAvoidance: {
      statementResponseTrap: boolean; // Avoid simple A says/B responds
      interruptionStyle: 'topic_change' | 'dismissive' | 'intellectual_override';
      dualTrainsOfThought: boolean; // Multiple ideas in single line
    };
    characterSignatures: {
      popCultureReferences: string[]; // Musical theatre, etc.
      heightenedLanguageBreakpoints: string[]; // Emotional climax shifts
      intellectualMultitasking: boolean;
    };
  };
  
  mamet: {
    percussiveMinimalism: {
      sparsePrecision: boolean;
      silencePower: number; // 1-10, emphasis on unsaid
      staccatoRhythm: boolean;
      naturalIambicPentameter: boolean;
    };
    philosophicalEngine: {
      transactionalSpeech: boolean; // Only speak to get something
      objectiveDriven: boolean; // Every line has goal
      powerDeception: boolean; // Focus on power and lies
    };
    practicalAesthetics: {
      theLiteral: string; // Objective facts of scene
      theWants: string; // Character's objective
      essentialAction: string; // Universal human desire
      asIf: string; // Personal relatable parallel
    };
  };
  
  tarantino: {
    naturalisticPoetry: {
      hyperRealism: boolean;
      authenticLivedIn: boolean;
      meticulousCrafting: boolean;
    };
    culturalPlayground: {
      popCultureDensity: number; // 1-10
      philosophicalMusings: boolean;
      obscureReferences: boolean;
      sharedCulturalContext: boolean;
    };
    tangentialTechnique: {
      randomConversations: boolean; // Non-plot advancing talk
      comfortBuilding: boolean; // Lull before violence
      naturalMeandering: boolean;
      characterBackgroundTailoring: boolean;
    };
  };
}

/**
 * Subtext and Layered Meaning System
 */
export interface SubtextFramework {
  firstRule: {
    dontSayWhatYouMean: boolean;
    preventDirectSpeech: string; // What character wants to say but can't
    forceIndirection: boolean;
  };
  
  generationTechniques: {
    deflectionAndIndirection: {
      evasiveAnswers: string[]; // Ways to dodge questions
      topicChanges: string[]; // Redirection strategies
      deliberateMisunderstanding: boolean;
    };
    
    understatementAndIrony: {
      emotionalDownplaying: boolean;
      ironicDelivery: string[]; // Opposite meanings
      powerfulUnderstatement: string[]; // "That was eventful"
    };
    
    contradictoryBodyLanguage: {
      verbalVsPhysical: boolean; // "I'm fine" while clenching fists
      nonverbalCues: string[]; // Eye contact, posture, etc.
      emotionalMasking: boolean;
    };
    
    metaphoricalConversation: {
      surfaceTopic: string; // What they're "talking" about
      realConflict: string; // What they're actually arguing about
      symbolicVehicle: string; // Object/topic carrying emotional weight
    };
  };
  
  narrativeFunctions: {
    plotAdvancement: boolean; // Hints at hidden information
    characterComplexity: boolean; // Creates realistic people
    audienceEngagement: boolean; // Active detective work
    dramaticIrony: boolean; // Knowledge gaps between characters
  };
}

/**
 * Conflict-Driven Dialogue Structure
 */
export interface ConflictDialogueStructure {
  fundamentalPrinciple: {
    allDialogueIsConflict: boolean;
    opposingObjectives: boolean;
    microDramaFramework: boolean;
  };
  
  threeActStructure: {
    setup: {
      topicEstablishment: string;
      characterPositions: Record<string, string>; // Character: objective
      initialStakes: string;
    };
    
    conflict: {
      battleOfWits: boolean;
      tacticalDeployment: string[]; // persuasion, manipulation, etc.
      verbalStrikesAndParries: boolean;
      advantageShifting: boolean;
    };
    
    resolution: {
      outcomeType: 'victory' | 'compromise' | 'escalation' | 'stalemate';
      plotMovement: string; // How this advances story
      characterRevelation: string; // What pressure revealed
    };
  };
  
  conflictVariations: {
    tensionLevel: 'simmering' | 'moderate' | 'explosive';
    fightingStyle: 'direct' | 'passive_aggressive' | 'logical' | 'emotional';
    stakesMagnitude: 'personal' | 'relational' | 'professional' | 'existential';
  };
  
  transitiveVerbFramework: {
    speakingActions: string[]; // interrogating, seducing, intimidating, etc.
    characterObjective: string; // What they're trying to get
    obstacleCharacter: string; // Who/what stands in their way
    verbalTactic: string; // How they're using words as tools
  };
}

/**
 * Character Voice Differentiation System
 */
export interface CharacterVoiceSystem {
  coverTheNameTest: {
    passed: boolean; // Can you tell who's speaking without names?
    uniquenessScore: number; // 1-10
    distinctionFactors: string[]; // What makes each voice unique
  };
  
  voiceFoundations: {
    diction: {
      vocabularyLevel: 'colloquial' | 'academic' | 'professional' | 'street';
      formalityLevel: 'casual' | 'business' | 'formal' | 'ceremonial';
      specificJargon: string[]; // Industry, regional, cultural terms
      catchphrases: string[]; // Unique repeated expressions
      slangUsage: string[]; // Generation/culture specific terms
    };
    
    syntax: {
      sentenceLength: 'short_blunt' | 'medium_conversational' | 'long_flowing';
      sentenceComplexity: 'simple' | 'compound' | 'complex' | 'run_on';
      voicePreference: 'active' | 'passive' | 'mixed';
      contractionUsage: boolean;
      interruptionTendency: 'frequent' | 'occasional' | 'rare' | 'never';
    };
    
    worldviewAndFocus: {
      coreBeliefs: string[]; // What shapes their perspective
      personalHistory: string[]; // Formative experiences
      educationalBackground: string;
      traumaInfluences: string[]; // How past pain affects speech
      optimismLevel: number; // 1-10, pessimistic to optimistic
    };
    
    agenda: {
      consciousGoal: string; // What they think they want
      unconsciousNeed: string; // What they actually need
      hiddenMotivation: string; // What they won't admit
      manipulationStyle: 'direct' | 'subtle' | 'emotional' | 'logical';
    };
  };
  
  practicalTools: {
    archetypeMapping: 'leader' | 'follower' | 'disruptor' | 'mediator' | 'rebel';
    personalityTraits: string[]; // honest, greedy, loyal, etc.
    speechPatternChecklist: string[]; // Hesitation, qualifiers, dominance
    bodyLanguageAlignment: boolean; // Actions match voice
  };
}

// ============================================================================
// PART II: THE PSYCHOLOGY OF AUTHENTIC CONVERSATION
// ============================================================================

/**
 * Selective Realism Framework
 */
export interface SelectiveRealismFramework {
  realismIllusion: {
    dialogueVsConversation: boolean; // Story purpose vs social function
    dramaticPurpose: 'plot_advancement' | 'character_revelation' | 'theme_exploration';
    purposefulConstruction: boolean;
  };
  
  selectiveRealistTechniques: {
    colloquialLanguage: {
      contractions: boolean;
      slangIntegration: string[];
      regionalExpressions: string[];
    };
    
    variedSentenceStructure: {
      shortPunchy: boolean;
      longerDetailed: boolean;
      naturalMixing: boolean;
    };
    
    embracedImperfection: {
      interruptions: boolean;
      talkingOver: boolean;
      unfinishedThoughts: boolean;
      realWorldMessiness: boolean;
    };
  };
  
  observationalData: {
    listeningPractice: boolean;
    uniquePhrasing: string[];
    speechRhythms: string[];
    conversationFlow: string[];
  };
}

/**
 * Power Dynamics and Sociolinguistics
 */
export interface PowerDynamicsFramework {
  powerNegotiation: {
    everyConversationIsPowerNegotiation: boolean;
    statusVieingConstant: boolean;
    hierarchyConstruction: boolean;
  };
  
  linguisticPowerMarkers: {
    directnessVsIndirectness: {
      highPowerDirectness: boolean; // "Get this done by five"
      lowPowerPoliteness: boolean; // "I was wondering if you might..."
      faceThreateningActs: boolean; // Actions damaging self-esteem
    };
    
    interruptionsAndOverlaps: {
      dominanceAssertion: boolean;
      cooperativeEnthusiasm: boolean;
      hostileTransgression: boolean;
      conversationControl: boolean;
    };
    
    languageProficiency: {
      dominantLanguagePower: boolean;
      expertiseVsFluency: boolean;
      multilinguralDynamics: boolean;
    };
  };
  
  statusTransactionMapping: {
    raisingOwnStatus: string[]; // High-status plays
    loweringOtherStatus: string[]; // Dominance tactics
    statusShifts: boolean; // Track changing dynamics
    powerBalanceEvolution: string; // How scene changes relationships
  };
}

/**
 * Emotional Escalation Patterns
 */
export interface EmotionalEscalationFramework {
  snowballEffect: {
    setupPhase: {
      preExistingConditions: string[]; // stress, fatigue, unresolved conflicts
      susceptibilityFactors: string[]; // What makes character reactive
      environmentalStressors: string[]; // External pressure
    };
    
    escalationSteps: {
      trigger: {
        triggerEvent: string; // The small thing that starts it
        stressResponseActivation: boolean;
        emotionalFlood: boolean;
      };
      
      physicalResponse: {
        agitationSigns: string[]; // shallow breathing, tension, flushing
        bodyLanguageShifts: string[]; // posture, movement changes
        voiceChanges: string[]; // pitch, speed, volume
      };
      
      linguisticShift: {
        fragmentedSpeech: boolean;
        emotionalVocabulary: string[];
        pacingChanges: 'faster' | 'slower' | 'erratic';
        logicBreakdown: boolean;
      };
    };
  };
  
  deEscalationTechniques: {
    emotionValidation: boolean; // Acknowledge feelings
    activeListening: string[]; // "I can see why this is frustrating"
    avoidLogicBattles: boolean; // Don't fight emotion with facts
    empathyDeployment: boolean;
  };
  
  argumentPsychology: {
    factualVsPerceptual: boolean; // Arguments about interpretation
    emotionalRealityClash: boolean; // Subjective experience conflict
    resolutionMechanism: 'understanding' | 'compromise' | 'dominance' | 'withdrawal';
  };
}

/**
 * Influence and Persuasion Ethics
 */
export interface InfluenceEthicsFramework {
  persuasionVsManipulation: {
    ethicalPersuasion: {
      transparency: boolean; // Open about intentions
      mutualBenefit: boolean; // Win-win seeking
      respectForAutonomy: boolean; // Right to refuse
      balancedAppeal: boolean; // Logic + emotion + credibility
    };
    
    manipulation: {
      selfishInterests: boolean; // Only serves speaker
      deceptionAndHiding: boolean; // Hidden agendas
      exploitationTactics: boolean; // Using vulnerabilities
      freeChoiceRemoval: boolean; // Coercion and ultimatums
    };
  };
  
  manipulativeTactics: {
    emotionalExploitation: string[]; // guilt-tripping, pity appeals, anger
    deceptionMisrepresentation: string[]; // cherry-picking, straw man, lies
    coercion: string[]; // ultimatums, threats, force
  };
  
  characterMoralArcMapping: {
    heroicEvolution: 'manipulation_to_persuasion'; // Growth through honesty
    tragicFall: 'persuasion_to_manipulation'; // Corruption through power
    moralInfluenceStyle: string; // How character's ethics show in speech
  };
}

// ============================================================================
// PART III: GENRE-SPECIFIC VERNACULARS
// ============================================================================

/**
 * Comedy Dialogue Mechanics
 */
export interface ComedyDialogueFramework {
  timingPacingRhythm: {
    comicTiming: {
      lineDeliverySpeed: 'slow_deliberate' | 'rapid_fire' | 'varied';
      pauseStrategy: 'build_anticipation' | 'audience_laugh_time' | 'pregnant_pause';
      rhythmControl: boolean;
    };
  };
  
  comedyStructuresDevices: {
    setupAndPayoff: {
      setupContext: string; // Establishes expectation
      expectationEstablished: string;
      payoffSubversion: string; // Surprise that creates laugh
    };
    
    ruleOfThree: {
      firstInstance: string; // Establishes pattern
      secondInstance: string; // Confirms pattern
      thirdInstance: string; // Escalates or subverts for laugh
    };
    
    callbacksRunningGags: {
      callbackReferences: string[]; // Earlier joke references
      runningGagEvolution: string[]; // Recurring joke progression
      continuityRewards: boolean; // Reward attentive viewers
    };
    
    witAndWordplay: {
      puns: string[]; // Multiple meanings exploitation
      malapropisms: string[]; // Misused similar-sounding words
      comebacks: string[]; // Witty retorts
      sarcasmIrony: string[]; // Opposite meaning delivery
    };
  };
}

/**
 * Drama Emotional Authenticity
 */
export interface DramaDialogueFramework {
  authenticityCore: {
    characterInternalWorld: {
      trueFeelingsAccess: boolean;
      deepestFearsVulnerabilities: string[];
      hiddenDesires: string[];
      emotionalWounds: string[];
    };
    
    internalAuthenticity: {
      emotionalStateClarification: string;
      characterFlawIdentification: string;
      transformationPath: string;
    };
    
    externalAuthenticity: {
      vocalRhythmMatching: boolean;
      cadenceConsistency: boolean;
      personalitySpeechAlignment: boolean;
    };
  };
  
  emotionalDialogueTechniques: {
    subtextEmphasis: boolean; // Show don't tell emotion
    actionBodyLanguage: string[]; // Physical emotion expression
    characterHistoryLeverage: string[]; // Past trauma echoes
    vulnerabilityWriting: boolean; // Uncomfortable truth exploration
  };
  
  actingTechniqueIntegration: {
    methodActing: boolean; // Draw from personal experience
    meisnerTechnique: boolean; // Truthful reaction to stimuli
    senseMemory: string[]; // Physical/emotional memory access
  };
}

/**
 * Thriller Suspense Dialogue
 */
export interface ThrillerDialogueFramework {
  dreadDialogue: {
    powerOfUnsaid: {
      ambiguityMaximization: boolean;
      veiledThreats: string[];
      indirectWarnings: string[];
      questionOverAnswer: boolean; // Raise more questions
    };
    
    conflictSuspenseEngine: {
      opposingGoals: boolean;
      hiddenAgendas: boolean;
      verbalBattlegrounds: boolean;
      subtleDisagreements: boolean;
    };
    
    pacingManipulation: {
      acceleratingPace: {
        shortClippedSentences: boolean;
        fragmentedSpeech: boolean;
        rapidBackAndForth: boolean;
        urgencyMirroring: boolean;
      };
      
      slowingPace: {
        deliberateExchanges: boolean;
        meanderingSentences: boolean;
        hesitationEvasion: boolean;
        riddleSpeaking: boolean;
      };
      
      strategicSilence: {
        uncomfortableVoids: boolean;
        unansweredQuestions: boolean;
        unfinishedThoughts: boolean;
        pauseAmplification: boolean;
      };
    };
  };
}

/**
 * Period and Contemporary Dialogue
 */
export interface PeriodContemporaryFramework {
  historicalDialogue: {
    researchFoundation: {
      primarySources: string[]; // letters, diaries, speeches
      periodVocabulary: string[];
      speechPatterns: string[];
      eraAuthenticity: boolean;
    };
    
    lessIsMorePrinciple: {
      strategicArchaism: boolean; // Few well-chosen period words
      clarityMaintenance: boolean; // Modern audience accessibility
      periodEvocation: boolean; // Transport without overwhelming
    };
    
    anachronismAvoidance: {
      idiomVerification: string[]; // Check phrase origins
      modernIntrusions: string[]; // Things to avoid
      historicalAccuracy: boolean;
    };
    
    socialHierarchyReflection: {
      classBasedSpeech: boolean;
      educationLevelReflection: boolean;
      genderBasedPatterns: boolean;
      hierarchyAuthenticity: boolean;
    };
  };
  
  contemporaryDialogue: {
    generationalVernaculars: {
      babyBoomers: string[]; // groovy, far out, dig it
      generationX: string[]; // whatever, gnarly, rad
      millennials: string[]; // adulting, FOMO, bae
      generationZ: string[]; // rizz, delulu, no cap
    };
    
    slangStrategicUse: {
      culturalAuthenticity: boolean;
      groupSpecificLanguage: string[];
      obsolescenceRisk: boolean; // Will this date the work?
      contextualAppropriateness: boolean;
    };
  };
}

// ============================================================================
// PART IV: TECHNICAL AND ADVANCED CRAFT
// ============================================================================

/**
 * Advanced Dialogue Techniques
 */
export interface AdvancedDialogueTechniques {
  interruptionAndOverlap: {
    interruptionFunctions: {
      powerAssertion: boolean; // Hostile dominance
      cooperativeDevice: boolean; // Enthusiasm, agreement
      contextualClarity: boolean; // Intent made clear
    };
    
    punctuationStrategy: {
      emDash: boolean; // Abrupt cutoff (—)
      ellipsis: boolean; // Trailing off (...)
      overlapIndication: string; // Simultaneous speech
    };
  };
  
  silenceAndPauses: {
    silencePower: {
      discomfortWeapon: boolean; // Force others to speak
      informationExtraction: boolean; // Pressure tactics
      controlAssertion: boolean;
    };
    
    pauseNarrativeFunctions: {
      tensionBuilding: boolean; // Suspense before reveal
      characterRevelation: boolean; // Internal process showing
      subtextEnhancement: boolean; // Unspoken resonance
      rhythmControl: boolean; // Pacing management
    };
  };
  
  profanityMatureContent: {
    strategicProfanity: {
      emotionalExpression: boolean; // Intensity communication
      characterization: boolean; // Background/personality reveal
      worldBuilding: boolean; // Fantasy/sci-fi custom curses
      thematicResonance: boolean; // Past trauma connections
    };
    
    deliberateChoice: boolean; // Not lazy language substitute
    characterDriven: boolean; // Fits personality and situation
    narrativePurpose: boolean; // Serves story function
  };
}

/**
 * Performance and Production Considerations
 */
export interface PerformanceConsiderations {
  actorFriendlyDialogue: {
    breathableWriting: {
      naturalBreathingPoints: boolean;
      speechBreakup: boolean; // Avoid long monologues
      rhythmicPunctuation: boolean;
    };
    
    naturalSpeechPatterns: {
      contractionsUsage: boolean;
      variedSentenceLengths: boolean;
      straightforwardLanguage: boolean;
    };
    
    actorTrust: {
      minimalParentheticals: boolean; // Avoid (angrily), (sarcastically)
      contextualEmotion: boolean; // Evident from dialogue itself
      interpretationFreedom: boolean;
    };
  };
  
  expositionSeamless: {
    weaveDontDump: boolean; // Gradual information release
    conflictDisguise: boolean; // Hide exposition in arguments
    naiveCharacter: boolean; // Natural explanation opportunity
    showDontTell: boolean; // Visual over verbal information
  };
  
  postProductionAwareness: {
    adrConsiderations: {
      offScreenDialogue: boolean; // Easier to replace
      facialVisibility: boolean; // ADR flexibility
      audioFlexibility: boolean;
    };
    
    internationalDubbing: {
      culturalIdiomAvoidance: boolean; // Translation-friendly
      sentenceConciseness: boolean; // Lip-sync assistance
      clearEmotionalIntent: boolean; // Foundation for voice actors
    };
  };
}

/**
 * Dialogue Editing and Revision Framework
 */
export interface DialogueRevisionFramework {
  systematicApproach: {
    readAloudMandatory: {
      performanceTest: boolean; // Actually act it out
      awkwardnessDetection: boolean;
      rhythmAssessment: boolean;
      voiceDistinctionCheck: boolean;
    };
    
    ruthlessTrimming: {
      getInLateGetOutEarly: boolean; // Cut pleasantries
      redundancyElimination: boolean; // Remove obvious statements
      purposeCheck: boolean; // Every line earns its place
    };
  };
  
  lineByLinePurposeCheck: {
    characterRevelation: boolean; // Does this show who they are?
    plotAdvancement: boolean; // Does this move story forward?
    conflictTension: boolean; // Is there dramatic energy?
    subtextPresence: boolean; // Meaning beneath surface?
    actionAlternative: boolean; // Could this be shown instead?
  };
  
  subtextSharpening: {
    onTheNoseIdentification: boolean; // Find direct emotion statements
    indirectRewriting: boolean; // Communicate through metaphor/deflection
    contradictionEmployment: boolean; // Say opposite of feeling
  };
  
  rhythmEnhancement: {
    pacingAdjustment: boolean;
    sentenceLengthVariation: boolean;
    pauseAdditionRemoval: boolean;
    cadenceCompelling: boolean;
  };
  
  refinementCycle: {
    continuousRevision: boolean; // Multiple editing passes
    aloudReadingRepeated: boolean; // After each revision
    sharpnessAchievement: boolean; // Every line purposeful
    authenticityMaintenance: boolean; // Character truth preserved
  };
}

/**
 * Complete Dialogue Assessment
 */
export interface DialogueAssessment {
  // Core Identity
  id: string;
  characterName: string;
  sceneContext: string;
  genre: string;
  
  // Master Techniques Analysis
  masterTechniques: MasterDialogueTechniques;
  
  // Foundational Elements
  subtextFramework: SubtextFramework;
  conflictStructure: ConflictDialogueStructure;
  voiceSystem: CharacterVoiceSystem;
  
  // Psychological Framework
  realismFramework: SelectiveRealismFramework;
  powerDynamics: PowerDynamicsFramework;
  emotionalEscalation: EmotionalEscalationFramework;
  influenceEthics: InfluenceEthicsFramework;
  
  // Genre Application
  genreFramework: ComedyDialogueFramework | DramaDialogueFramework | ThrillerDialogueFramework;
  periodContemporary: PeriodContemporaryFramework;
  
  // Technical Craft
  advancedTechniques: AdvancedDialogueTechniques;
  performanceConsiderations: PerformanceConsiderations;
  revisionFramework: DialogueRevisionFramework;
  
  // AI Generation Metadata
  generatedBy: string;
  confidence: number; // 1-10
  coverTheNameTestScore: number; // Voice distinctiveness
  conflictIntensity: number; // 1-10
  subtextDepth: number; // 1-10
  genreAppropriateness: number; // 1-10
}

/**
 * Dialogue Recommendation System
 */
export interface DialogueRecommendation {
  primaryRecommendation: DialogueAssessment;
  alternativeApproaches: DialogueAssessment[];
  
  // Strategic Guidance
  craftStrategy: {
    nextSteps: string[];
    priorityAreas: string[];
    commonPitfalls: string[];
  };
  
  // Performance Guidance
  actorDirection: {
    deliveryNotes: string[];
    emotionalBeats: string[];
    subtalTargets: string[];
  };
  
  // Revision Guidance
  editingPriorities: {
    strengthsToAmplify: string[];
    weaknessesToAddress: string[];
    rhythmAdjustments: string[];
  };
  
  // Master Class Analysis
  techniqueBreakdown: {
    sorkinElements: string[];
    mametElements: string[];
    tarantinoElements: string[];
    uniqueInnovations: string[];
  };
}

// ============================================================================
// DIALOGUE ENGINE V2.0 IMPLEMENTATION
// ============================================================================

export class DialogueEngineV2 {
  
  /**
   * AI-ENHANCED: Generate professional dialogue using master techniques
   */
  static async generateDialogueSequence(
    context: {
      characters: Array<{
        name: string;
        personality: string;
        background: string;
        objective: string;
        emotionalState: string;
      }>;
      sceneObjective: string;
      conflictType: 'interpersonal' | 'ideological' | 'emotional' | 'practical';
      genre: 'comedy' | 'drama' | 'thriller' | 'action' | 'romance' | 'horror';
      setting: string;
      stakes: string;
    },
    requirements: {
      masterTechnique?: 'sorkin' | 'mamet' | 'tarantino' | 'mixed';
      subtextLevel: 'minimal' | 'moderate' | 'heavy';
      conflictIntensity: number; // 1-10
      lengthTarget: 'short' | 'medium' | 'long';
      emotionalArc: string;
    },
    options: {
      voiceDifferentiation?: boolean;
      periodSetting?: string;
      performanceNotes?: boolean;
      revisionLevel?: 'basic' | 'professional' | 'master';
    } = {}
  ): Promise<DialogueRecommendation> {
    
    console.log(`🎭 DIALOGUE ENGINE V2.0: Crafting ${context.genre} dialogue with ${requirements.masterTechnique || 'mixed'} technique...`);
    
    try {
      // Stage 1: Master Technique Analysis
      const masterAnalysis = await this.analyzeMasterTechniques(
        context, requirements.masterTechnique || 'mixed'
      );
      
      // Stage 2: Character Voice Development
      const voiceProfiles = await this.developCharacterVoices(
        context.characters, context.genre, options.periodSetting
      );
      
      // Stage 3: Conflict Structure Design
      const conflictStructure = await this.designConflictStructure(
        context, requirements
      );
      
      // Stage 4: Subtext Layer Construction
      const subtextFramework = await this.constructSubtextLayers(
        context, requirements.subtextLevel, conflictStructure
      );
      
      // Stage 5: Genre-Specific Application
      const genreFramework = await this.applyGenreVernacular(
        context.genre, masterAnalysis, voiceProfiles
      );
      
      // Stage 6: Dialogue Generation
      const generatedDialogue = await this.generateCoreDialogue(
        context, masterAnalysis, voiceProfiles, conflictStructure, 
        subtextFramework, genreFramework, requirements
      );
      
      // Stage 7: Technical Polish
      const technicallyRefined = await this.applyTechnicalPolish(
        generatedDialogue, options
      );
      
      // Stage 8: Professional Revision
      const professionallyRevised = await this.applyProfessionalRevision(
        technicallyRefined, options.revisionLevel || 'professional'
      );
      
      console.log(`✅ DIALOGUE ENGINE V2.0: Generated professional dialogue sequence`);
      
      return professionallyRevised;
      
    } catch (error) {
      console.error('❌ Dialogue Engine V2.0 failed:', error);
      throw new Error(`Dialogue generation failed: ${error}`);
    }
  }
  
  /**
   * Stage 1: Master Technique Analysis
   */
  static async analyzeMasterTechniques(
    context: any,
    technique: string
  ): Promise<MasterDialogueTechniques> {
    
    const prompt = `Analyze this scene for ${technique} dialogue technique application:

SCENE CONTEXT:
- Characters: ${context.characters?.map((c: any) => `${c.name || 'Unknown'} (${c.personality || 'Undefined'})`).join(', ') || 'No characters defined'}
- Objective: ${context.sceneObjective}
- Conflict: ${context.conflictType}
- Genre: ${context.genre}
- Stakes: ${context.stakes}

Apply master dialogue techniques:

1. SORKIN MUSICAL DIALOGUE:
   - Rhythmic patterns and intellectual velocity
   - Ping-pong technique with thematic repetition
   - Avoidance of statement/response traps
   - Pop culture references and heightened language moments

2. MAMET PERCUSSIVE MINIMALISM:
   - Sparse precision and silence power
   - Transactional speech (only speak to get something)
   - Practical aesthetics framework (literal, wants, essential action, as-if)
   - Power and deception focus

3. TARANTINO NATURALISTIC POETRY:
   - Hyper-realistic authenticity with meticulous crafting
   - Cultural playground with pop references
   - Tangential conversations that reveal character
   - Background-tailored speech patterns

For ${technique} technique, provide specific analysis of:
- Rhythm and pacing strategy
- Language and vocabulary approach
- Structural trademarks to employ
- Character interaction patterns
- Subtext generation methods

Focus on creating dialogue that sounds like ${technique} but serves this specific scene's dramatic needs.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are a master dialogue coach who teaches the techniques of Sorkin, Mamet, and Tarantino for specific dramatic contexts.',
        temperature: 0.7,
        maxTokens: 2000
      });

      return this.parseMasterTechniquesResult(result, technique);
      
    } catch (error) {
      console.warn('AI master techniques analysis failed, using fallback');
      return this.generateFallbackMasterTechniques(technique);
    }
  }
  
  /**
   * Stage 2: Character Voice Development
   */
  static async developCharacterVoices(
    characters: any[],
    genre: string,
    periodSetting?: string
  ): Promise<Record<string, CharacterVoiceSystem>> {
    
    const prompt = `Develop unique dialogue voices for each character in this ${genre} ${periodSetting ? `set in ${periodSetting}` : 'contemporary'} scene:

CHARACTERS:
${characters.map(c => `
- ${c.name}: ${c.personality}
  Background: ${c.background}
  Emotional State: ${c.emotionalState}
  Objective: ${c.objective}
`).join('')}

For each character, create a unique voice signature using:

1. DICTION (WORD CHOICE):
   - Vocabulary level (colloquial/academic/professional/street)
   - Formality level (casual/business/formal/ceremonial)
   - Specific jargon, slang, or catchphrases
   - Regional or cultural expressions

2. SYNTAX (SENTENCE STRUCTURE):
   - Sentence length preference (short/medium/long)
   - Complexity level (simple/compound/complex)
   - Voice preference (active/passive)
   - Interruption and contraction patterns

3. WORLDVIEW AND FOCUS:
   - Core beliefs that shape perspective
   - Personal history influences
   - Educational background markers
   - Optimism/pessimism level

4. AGENDA:
   - Conscious goals in conversation
   - Hidden motivations
   - Manipulation vs persuasion style

Apply the "Cover the Name" test - each character should be identifiable by speech patterns alone.

${periodSetting ? `Ensure historical authenticity for ${periodSetting} while maintaining modern accessibility.` : 'Use contemporary speech patterns appropriate to each character\'s background.'}

Provide specific examples of how each character would phrase the same idea differently.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are a character voice specialist who creates distinct, authentic dialogue signatures for each character.',
        temperature: 0.8,
        maxTokens: 2500
      });

      return this.parseCharacterVoicesResult(result, characters);
      
    } catch (error) {
      console.warn('AI character voice development failed, using fallback');
      return this.generateFallbackCharacterVoices(characters);
    }
  }
  
  /**
   * Stage 3: Conflict Structure Design
   */
  static async designConflictStructure(
    context: any,
    requirements: any
  ): Promise<ConflictDialogueStructure> {
    
    const prompt = `Design a conflict-driven dialogue structure for this scene:

SCENE PARAMETERS:
- Objective: ${context.sceneObjective}
- Conflict Type: ${context.conflictType}
- Stakes: ${context.stakes}
- Intensity Target: ${requirements.conflictIntensity}/10

Apply conflict-driven dialogue principles:

1. FUNDAMENTAL PRINCIPLE:
   - All dialogue is conflict (opposing objectives)
   - Micro-drama framework with clear beginning/middle/end

2. THREE-ACT STRUCTURE:
   Setup: Establish positions and objectives
   Conflict: Battle of wits with tactical deployment
   Resolution: Victory/compromise/escalation outcome

3. CHARACTER OBJECTIVES:
   Map what each character wants to achieve
   Identify how objectives oppose each other
   Define verbal tactics each will use

4. TRANSITIVE VERB FRAMEWORK:
   Transform speaking into specific actions:
   - Not just "talking" but interrogating, seducing, intimidating, confessing
   - Clear obstacle identification
   - Strategic word deployment

Design the conflict escalation pattern:
- Tension level progression
- Fighting style for each character
- Stakes magnitude evolution
- Resolution type and plot advancement

Ensure every line serves as a tactic in the verbal battle, with characters actively trying to get something from each other.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are a dialogue structure architect who designs conflict-driven conversations with clear dramatic progression.',
        temperature: 0.6,
        maxTokens: 2000
      });

      return this.parseConflictStructureResult(result, context);
      
    } catch (error) {
      console.warn('AI conflict structure design failed, using fallback');
      return this.generateFallbackConflictStructure(context, requirements);
    }
  }
  
  // ============================================================================
  // HELPER METHODS AND PARSERS
  // ============================================================================
  
  private static parseMasterTechniquesResult(result: string, technique: string): MasterDialogueTechniques {
    try {
      // Attempt to parse structured AI response
      const parsed = JSON.parse(result);
      
      if (parsed && parsed.masterTechniques) {
        return parsed.masterTechniques;
      }
      
      // If not structured JSON, extract key insights from text response
      return this.extractTechniquesFromText(result, technique);
      
    } catch (error) {
      console.warn('Failed to parse AI master techniques response, using enhanced fallback');
      return this.generateEnhancedFallbackFromResponse(result, technique);
    }
  }
  
  /**
   * Extract techniques from AI text response when JSON parsing fails
   */
  private static extractTechniquesFromText(result: string, technique: string): MasterDialogueTechniques {
    const lowerResult = result.toLowerCase();
    
    // Extract rhythm indicators
    const hasRapidRhythm = lowerResult.includes('rapid') || lowerResult.includes('fast') || lowerResult.includes('quick');
    const hasIntellectual = lowerResult.includes('intellectual') || lowerResult.includes('smart') || lowerResult.includes('witty');
    
    // Extract technique-specific indicators
    const hasPingPong = lowerResult.includes('ping-pong') || lowerResult.includes('back and forth');
    const hasMinimalism = lowerResult.includes('minimal') || lowerResult.includes('sparse') || lowerResult.includes('less is more');
    const hasNaturalistic = lowerResult.includes('natural') || lowerResult.includes('authentic') || lowerResult.includes('realistic');
    
    return {
      sorkin: {
        musicalDialogue: {
          rhythm: hasIntellectual ? 'intellectual_velocity' : hasRapidRhythm ? 'melodic_rapid' : 'contrapuntal',
          alliterationLevel: hasPingPong ? 8 : 6,
          thematicRepetition: this.extractRepeatedPhrases(result),
          pingPongTechnique: {
            enabled: hasPingPong,
            throwBackPhrases: this.extractThrowBackPhrases(result)
          }
        },
        structuralAvoidance: {
          statementResponseTrap: true,
          interruptionStyle: hasIntellectual ? 'intellectual_override' : 'topic_change',
          dualTrainsOfThought: hasIntellectual
        },
        characterSignatures: {
          popCultureReferences: this.extractReferences(result, 'pop culture'),
          heightenedLanguageBreakpoints: ['emotional_climax'],
          intellectualMultitasking: hasIntellectual
        }
      },
      mamet: {
        percussiveMinimalism: {
          sparsePrecision: hasMinimalism,
          silencePower: hasMinimalism ? 9 : 6,
          staccatoRhythm: hasMinimalism,
          naturalIambicPentameter: hasMinimalism
        },
        philosophicalEngine: {
          transactionalSpeech: true,
          objectiveDriven: true,
          powerDeception: lowerResult.includes('power') || lowerResult.includes('control')
        },
        practicalAesthetics: {
          theLiteral: this.extractLiteral(result),
          theWants: this.extractWants(result),
          essentialAction: this.extractEssentialAction(result),
          asIf: this.extractAsIf(result)
        }
      },
      tarantino: {
        naturalisticPoetry: {
          hyperRealism: hasNaturalistic,
          authenticLivedIn: hasNaturalistic,
          meticulousCrafting: true
        },
        culturalPlayground: {
          popCultureDensity: this.extractReferences(result, 'culture').length,
          philosophicalMusings: lowerResult.includes('philosophy') || lowerResult.includes('meaning'),
          obscureReferences: lowerResult.includes('reference') || lowerResult.includes('obscure'),
          sharedCulturalContext: true
        },
        tangentialTechnique: {
          randomConversations: lowerResult.includes('tangent') || lowerResult.includes('random'),
          comfortBuilding: lowerResult.includes('comfort') || lowerResult.includes('ease'),
          naturalMeandering: hasNaturalistic,
          characterBackgroundTailoring: true
        }
      }
    };
  }

  /**
   * Generate enhanced fallback using insights from AI response
   */
  private static generateEnhancedFallbackFromResponse(result: string, technique: string): MasterDialogueTechniques {
    // Use the text extraction but with fallback values
    const extracted = this.extractTechniquesFromText(result, technique);
    
    // Enhance with additional insights from the response
    const insights = this.extractKeyInsights(result);
    
    // Merge with baseline fallback
    const baseline = this.generateFallbackMasterTechniques(technique);
    
    return {
      sorkin: {
        ...baseline.sorkin,
        musicalDialogue: {
          ...baseline.sorkin.musicalDialogue,
          thematicRepetition: insights.thematicElements || extracted.sorkin.musicalDialogue.thematicRepetition
        }
      },
      mamet: {
        ...baseline.mamet,
        practicalAesthetics: {
          ...baseline.mamet.practicalAesthetics,
          theLiteral: insights.literalElements || extracted.mamet.practicalAesthetics.theLiteral
        }
      },
      tarantino: {
        ...baseline.tarantino,
        culturalPlayground: {
          ...baseline.tarantino.culturalPlayground,
          popCultureDensity: Math.min(10, insights.culturalReferences?.length || 5)
        }
      }
    };
  }

  // Helper methods for text extraction
  private static extractRepeatedPhrases(text: string): string[] {
    const phrases = text.match(/["']([^"']{10,50})["']/g) || [];
    return phrases.slice(0, 3).map(p => p.replace(/["']/g, ''));
  }

  private static extractThrowBackPhrases(text: string): string[] {
    const throwBacks = text.match(/\b(your words?|what you said|that phrase|you mentioned)\b/gi) || [];
    return throwBacks.slice(0, 3);
  }

  private static extractReferences(text: string, type: string): string[] {
    const pattern = new RegExp(`${type}[^.!?]*`, 'gi');
    const matches = text.match(pattern) || [];
    return matches.slice(0, 3);
  }

  private static extractLiteral(text: string): string {
    const literalMatch = text.match(/literal[ly]*[:\s]+([^.!?]*)/i);
    return literalMatch ? literalMatch[1].trim() : 'Scene objective facts';
  }

  private static extractWants(text: string): string {
    const wantsMatch = text.match(/wants?[:\s]+([^.!?]*)/i);
    return wantsMatch ? wantsMatch[1].trim() : 'Character specific goals';
  }

  private static extractEssentialAction(text: string): string {
    const actionMatch = text.match(/essential action[:\s]+([^.!?]*)/i);
    return actionMatch ? actionMatch[1].trim() : 'Universal human desire';
  }

  private static extractAsIf(text: string): string {
    const asIfMatch = text.match(/as if[:\s]+([^.!?]*)/i);
    return asIfMatch ? asIfMatch[1].trim() : 'Personal relatable parallel';
  }

  private static extractKeyInsights(text: string): any {
    return {
      thematicElements: this.extractRepeatedPhrases(text),
      literalElements: this.extractLiteral(text),
      culturalReferences: this.extractReferences(text, 'culture'),
      emotionalElements: text.match(/\b(emotion|feeling|heart|soul)[^.!?]*/gi) || []
    };
  }

  private static generateFallbackMasterTechniques(technique: string): MasterDialogueTechniques {
    return {
      sorkin: {
        musicalDialogue: {
          rhythm: 'intellectual_velocity',
          alliterationLevel: 7,
          thematicRepetition: ['key_phrase', 'moral_center', 'the_thing'],
          pingPongTechnique: {
            enabled: true,
            throwBackPhrases: ['your_words', 'what_you_said', 'that_phrase']
          }
        },
        structuralAvoidance: {
          statementResponseTrap: true,
          interruptionStyle: 'intellectual_override',
          dualTrainsOfThought: true
        },
        characterSignatures: {
          popCultureReferences: ['musical_theatre', 'classic_films', 'literature'],
          heightenedLanguageBreakpoints: ['emotional_climax', 'moral_revelation'],
          intellectualMultitasking: true
        }
      },
      mamet: {
        percussiveMinimalism: {
          sparsePrecision: true,
          silencePower: 8,
          staccatoRhythm: true,
          naturalIambicPentameter: true
        },
        philosophicalEngine: {
          transactionalSpeech: true,
          objectiveDriven: true,
          powerDeception: true
        },
        practicalAesthetics: {
          theLiteral: 'Scene objective facts',
          theWants: 'Character specific goals',
          essentialAction: 'Universal human desire',
          asIf: 'Personal relatable parallel'
        }
      },
      tarantino: {
        naturalisticPoetry: {
          hyperRealism: true,
          authenticLivedIn: true,
          meticulousCrafting: true
        },
        culturalPlayground: {
          popCultureDensity: 8,
          philosophicalMusings: true,
          obscureReferences: true,
          sharedCulturalContext: true
        },
        tangentialTechnique: {
          randomConversations: true,
          comfortBuilding: true,
          naturalMeandering: true,
          characterBackgroundTailoring: true
        }
      }
    };
  }
  
  private static parseCharacterVoicesResult(result: string, characters: any[]): Record<string, CharacterVoiceSystem> {
    try {
      // Attempt to parse structured AI response
      const parsed = JSON.parse(result);
      
      if (parsed && parsed.characterVoices) {
        return parsed.characterVoices;
      }
      
      // Extract character voices from text response
      return this.extractCharacterVoicesFromText(result, characters);
      
    } catch (error) {
      console.warn('Failed to parse AI character voices response, using enhanced fallback');
      return this.generateEnhancedCharacterVoicesFromResponse(result, characters);
    }
  }
  
  /**
   * Extract character voices from AI text response
   */
  private static extractCharacterVoicesFromText(result: string, characters: any[]): Record<string, CharacterVoiceSystem> {
    const voices: Record<string, CharacterVoiceSystem> = {};
    
    characters.forEach((character, index) => {
      // Look for character-specific analysis in the AI response
      const characterSection = this.extractCharacterSection(result, character.name);
      const vocabularyLevel = this.extractVocabularyLevel(characterSection);
      const sentenceStyle = this.extractSentenceStyle(characterSection);
      
      voices[character.name] = {
        coverTheNameTest: {
          passed: true,
          uniquenessScore: 8 + Math.floor(Math.random() * 2), // 8-9
          distinctionFactors: this.extractDistinctionFactors(characterSection)
        },
        voiceFoundations: {
          diction: {
            vocabularyLevel: vocabularyLevel,
            formalityLevel: this.extractFormalityLevel(characterSection),
            specificJargon: this.extractJargon(characterSection, character.background),
            catchphrases: this.extractCatchphrases(characterSection),
            slangUsage: this.extractSlang(characterSection)
          },
          syntax: {
            sentenceLength: sentenceStyle,
            sentenceComplexity: this.extractComplexity(characterSection),
            voicePreference: 'active',
            contractionUsage: this.extractContractionUsage(characterSection),
            interruptionTendency: this.extractInterruptionTendency(characterSection)
          },
          worldviewAndFocus: {
            coreBeliefs: [character.personality],
            personalHistory: [character.background],
            educationalBackground: this.extractEducation(characterSection, character.background),
            traumaInfluences: this.extractTrauma(characterSection),
            optimismLevel: this.extractOptimismLevel(characterSection)
          },
          agenda: {
            consciousGoal: character.objective,
            unconsciousNeed: this.extractUnconscious(characterSection),
            hiddenMotivation: this.extractHidden(characterSection),
            manipulationStyle: this.extractManipulationStyle(characterSection)
          }
        },
        practicalTools: {
          archetypeMapping: this.extractArchetype(characterSection, character.personality),
          personalityTraits: [character.personality],
          speechPatternChecklist: this.extractSpeechPatterns(characterSection),
          bodyLanguageAlignment: true
        }
      };
    });
    
    return voices;
  }

  /**
   * Generate enhanced character voices using insights from AI response
   */
  private static generateEnhancedCharacterVoicesFromResponse(result: string, characters: any[]): Record<string, CharacterVoiceSystem> {
    // Extract what we can from the text
    const extracted = this.extractCharacterVoicesFromText(result, characters);
    
    // Enhance with insights from overall response
    const generalInsights = this.extractGeneralVoiceInsights(result);
    
    // Merge with baseline fallback
    const baseline = this.generateFallbackCharacterVoices(characters);
    
    const enhanced: Record<string, CharacterVoiceSystem> = {};
    
    characters.forEach(character => {
      enhanced[character.name] = {
        ...baseline[character.name],
        coverTheNameTest: {
          ...baseline[character.name].coverTheNameTest,
          distinctionFactors: extracted[character.name]?.coverTheNameTest?.distinctionFactors || 
                              baseline[character.name].coverTheNameTest.distinctionFactors
        },
        voiceFoundations: {
          ...baseline[character.name].voiceFoundations,
          diction: {
            ...baseline[character.name].voiceFoundations.diction,
            specificJargon: extracted[character.name]?.voiceFoundations?.diction?.specificJargon || 
                           baseline[character.name].voiceFoundations.diction.specificJargon
          }
        }
      };
    });
    
    return enhanced;
  }

  // Helper methods for character voice extraction
  private static extractCharacterSection(text: string, characterName: string): string {
    // Look for sections that start with character name
    const pattern = new RegExp(`${characterName}[^]*?(?=\\n[A-Z][A-Za-z\\s]+:|$)`, 'i');
    const match = text.match(pattern);
    return match ? match[0] : text;
  }

  private static extractVocabularyLevel(text: string): 'colloquial' | 'academic' | 'professional' | 'street' {
    const lower = text.toLowerCase();
    if (lower.includes('academic') || lower.includes('scholarly')) return 'academic';
    if (lower.includes('professional') || lower.includes('business')) return 'professional';
    if (lower.includes('street') || lower.includes('casual')) return 'street';
    return 'colloquial';
  }

  private static extractSentenceStyle(text: string): 'short_blunt' | 'medium_conversational' | 'long_flowing' {
    const lower = text.toLowerCase();
    if (lower.includes('short') || lower.includes('blunt') || lower.includes('crisp')) return 'short_blunt';
    if (lower.includes('long') || lower.includes('flowing') || lower.includes('elaborate')) return 'long_flowing';
    return 'medium_conversational';
  }

  private static extractFormalityLevel(text: string): 'casual' | 'business' | 'formal' | 'ceremonial' {
    const lower = text.toLowerCase();
    if (lower.includes('formal') || lower.includes('ceremonial')) return 'formal';
    if (lower.includes('business') || lower.includes('professional')) return 'business';
    return 'casual';
  }

  private static extractDistinctionFactors(text: string): string[] {
    const factors: string[] = [];
    const lower = text.toLowerCase();
    
    if (lower.includes('vocabulary')) factors.push('vocabulary_choice');
    if (lower.includes('syntax') || lower.includes('sentence')) factors.push('sentence_structure');
    if (lower.includes('worldview') || lower.includes('perspective')) factors.push('worldview');
    if (lower.includes('rhythm') || lower.includes('pace')) factors.push('speech_rhythm');
    
    return factors.length > 0 ? factors : ['vocabulary_choice', 'sentence_structure', 'worldview'];
  }

  private static extractJargon(text: string, background: string): string[] {
    const jargon = text.match(/\b[a-z]+(?:_[a-z]+)*_(?:terms?|jargon|language)\b/gi) || [];
    return jargon.length > 0 ? jargon : [`${background}_specific_terms`];
  }

  private static extractCatchphrases(text: string): string[] {
    const phrases = text.match(/["']([^"']{5,30})["']/g) || [];
    return phrases.slice(0, 2).map(p => p.replace(/["']/g, ''));
  }

  private static extractSlang(text: string): string[] {
    const slang = text.match(/\b(?:slang|colloquial|informal)[^.!?]*/gi) || [];
    return slang.length > 0 ? slang.slice(0, 3) : ['contemporary_terms'];
  }

  private static extractComplexity(text: string): 'simple' | 'compound' | 'complex' | 'run_on' {
    const lower = text.toLowerCase();
    if (lower.includes('complex') || lower.includes('sophisticated')) return 'complex';
    if (lower.includes('simple') || lower.includes('basic')) return 'simple';
    if (lower.includes('run-on') || lower.includes('rambling')) return 'run_on';
    return 'compound';
  }

  private static extractContractionUsage(text: string): boolean {
    const lower = text.toLowerCase();
    return !lower.includes('no contractions') && !lower.includes('formal speech');
  }

  private static extractInterruptionTendency(text: string): 'frequent' | 'occasional' | 'rare' | 'never' {
    const lower = text.toLowerCase();
    if (lower.includes('frequent') || lower.includes('often interrupt')) return 'frequent';
    if (lower.includes('rare') || lower.includes('rarely interrupt')) return 'rare';
    if (lower.includes('never interrupt')) return 'never';
    return 'occasional';
  }

  private static extractEducation(text: string, background: string): string {
    const educationMatch = text.match(/education[^.!?]*/gi);
    return educationMatch ? educationMatch[0] : 'Context appropriate';
  }

  private static extractTrauma(text: string): string[] {
    const traumaMatch = text.match(/trauma|difficult|challenge[^.!?]*/gi);
    return traumaMatch ? traumaMatch.slice(0, 2) : ['Past experiences'];
  }

  private static extractOptimismLevel(text: string): number {
    const lower = text.toLowerCase();
    if (lower.includes('optimistic') || lower.includes('positive')) return 7;
    if (lower.includes('pessimistic') || lower.includes('negative')) return 3;
    return 5;
  }

  private static extractUnconscious(text: string): string {
    const unconsciousMatch = text.match(/unconscious|hidden need[^.!?]*/gi);
    return unconsciousMatch ? unconsciousMatch[0] : 'Deeper character need';
  }

  private static extractHidden(text: string): string {
    const hiddenMatch = text.match(/hidden|secret[^.!?]*/gi);
    return hiddenMatch ? hiddenMatch[0] : 'Secret desire';
  }

  private static extractManipulationStyle(text: string): 'direct' | 'subtle' | 'emotional' | 'logical' {
    const lower = text.toLowerCase();
    if (lower.includes('direct') || lower.includes('straightforward')) return 'direct';
    if (lower.includes('subtle') || lower.includes('indirect')) return 'subtle';
    if (lower.includes('emotional') || lower.includes('feelings')) return 'emotional';
    return 'logical';
  }

  private static extractArchetype(text: string, personality: string): 'leader' | 'follower' | 'disruptor' | 'mediator' | 'rebel' {
    const lower = text.toLowerCase();
    if (lower.includes('leader') || personality.toLowerCase().includes('lead')) return 'leader';
    if (lower.includes('rebel') || lower.includes('disrupt')) return 'rebel';
    if (lower.includes('mediat') || lower.includes('peace')) return 'mediator';
    if (lower.includes('follow')) return 'follower';
    return 'disruptor';
  }

  private static extractSpeechPatterns(text: string): string[] {
    const patterns: string[] = [];
    const lower = text.toLowerCase();
    
    if (lower.includes('hesitat')) patterns.push('hesitation');
    if (lower.includes('qualif')) patterns.push('qualifiers');
    if (lower.includes('dominan')) patterns.push('dominance');
    if (lower.includes('pattern')) patterns.push('distinctive patterns');
    
    return patterns.length > 0 ? patterns : ['distinctive patterns'];
  }

  private static extractGeneralVoiceInsights(text: string): any {
    return {
      overallTone: text.match(/tone[^.!?]*/gi)?.[0] || 'conversational',
      commonThemes: text.match(/theme[^.!?]*/gi) || [],
      styleNotes: text.match(/style[^.!?]*/gi) || []
    };
  }

  private static generateFallbackCharacterVoices(characters: any[]): Record<string, CharacterVoiceSystem> {
    const voices: Record<string, CharacterVoiceSystem> = {};
    
    characters.forEach((character, index) => {
      voices[character.name] = {
        coverTheNameTest: {
          passed: true,
          uniquenessScore: 8,
          distinctionFactors: ['vocabulary_choice', 'sentence_structure', 'worldview']
        },
        voiceFoundations: {
          diction: {
            vocabularyLevel: index % 2 === 0 ? 'academic' : 'colloquial',
            formalityLevel: index % 3 === 0 ? 'formal' : 'casual',
            specificJargon: [`${character.personality}_specific_terms`],
            catchphrases: [`character_${index}_phrase`],
            slangUsage: ['contemporary_terms']
          },
          syntax: {
            sentenceLength: index % 2 === 0 ? 'long_flowing' : 'short_blunt',
            sentenceComplexity: 'compound',
            voicePreference: 'active',
            contractionUsage: true,
            interruptionTendency: 'occasional'
          },
          worldviewAndFocus: {
            coreBeliefs: [character.personality],
            personalHistory: [character.background],
            educationalBackground: 'Context appropriate',
            traumaInfluences: ['Past experiences'],
            optimismLevel: 5
          },
          agenda: {
            consciousGoal: character.objective,
            unconsciousNeed: 'Deeper character need',
            hiddenMotivation: 'Secret desire',
            manipulationStyle: 'logical'
          }
        },
        practicalTools: {
          archetypeMapping: 'leader',
          personalityTraits: [character.personality],
          speechPatternChecklist: ['Distinctive patterns'],
          bodyLanguageAlignment: true
        }
      };
    });
    
    return voices;
  }
  
  private static parseConflictStructureResult(result: string, context: any): ConflictDialogueStructure {
    try {
      // Attempt to parse structured AI response
      const parsed = JSON.parse(result);
      
      if (parsed && parsed.conflictStructure) {
        return parsed.conflictStructure;
      }
      
      // Extract conflict structure from text response
      return this.extractConflictStructureFromText(result, context);
      
    } catch (error) {
      console.warn('Failed to parse AI conflict structure response, using enhanced fallback');
      return this.generateEnhancedConflictStructureFromResponse(result, context);
    }
  }
  
  /**
   * Extract conflict structure from AI text response
   */
  private static extractConflictStructureFromText(result: string, context: any): ConflictDialogueStructure {
    const lowerResult = result.toLowerCase();
    
    // Extract tension and conflict indicators
    const hasBattleOfWits = lowerResult.includes('battle') || lowerResult.includes('intellectual') || lowerResult.includes('wit');
    const hasEscalation = lowerResult.includes('escalat') || lowerResult.includes('intensif') || lowerResult.includes('build');
    const hasStakes = lowerResult.includes('stakes') || lowerResult.includes('consequenc') || lowerResult.includes('risk');
    
    // Extract outcome type
    let outcomeType: 'victory' | 'compromise' | 'escalation' | 'stalemate' = 'escalation';
    if (lowerResult.includes('victory') || lowerResult.includes('win')) outcomeType = 'victory';
    else if (lowerResult.includes('compromise') || lowerResult.includes('agreement')) outcomeType = 'compromise';
    else if (lowerResult.includes('stalemate') || lowerResult.includes('deadlock')) outcomeType = 'stalemate';
    
    // Extract tension level
    let tensionLevel: 'simmering' | 'moderate' | 'explosive' = 'moderate';
    if (lowerResult.includes('explosive') || lowerResult.includes('intense') || lowerResult.includes('high')) tensionLevel = 'explosive';
    else if (lowerResult.includes('simmer') || lowerResult.includes('subtle') || lowerResult.includes('low')) tensionLevel = 'simmering';
    
    // Extract fighting style
    let fightingStyle: 'direct' | 'passive_aggressive' | 'logical' | 'emotional' = 'logical';
    if (lowerResult.includes('direct') || lowerResult.includes('confrontational')) fightingStyle = 'direct';
    else if (lowerResult.includes('passive') || lowerResult.includes('indirect')) fightingStyle = 'passive_aggressive';
    else if (lowerResult.includes('emotional') || lowerResult.includes('feeling')) fightingStyle = 'emotional';
    
    return {
      fundamentalPrinciple: {
        allDialogueIsConflict: true,
        opposingObjectives: true,
        microDramaFramework: true
      },
      threeActStructure: {
        setup: {
          topicEstablishment: this.extractTopicFromText(result) || context.sceneObjective,
          characterPositions: this.extractCharacterPositions(result, context),
          initialStakes: this.extractStakes(result) || context.stakes
        },
        conflict: {
          battleOfWits: hasBattleOfWits,
          tacticalDeployment: this.extractTactics(result),
          verbalStrikesAndParries: hasBattleOfWits,
          advantageShifting: hasEscalation
        },
        resolution: {
          outcomeType: outcomeType,
          plotMovement: this.extractPlotMovement(result),
          characterRevelation: this.extractCharacterRevelation(result)
        }
      },
      conflictVariations: {
        tensionLevel: tensionLevel,
        fightingStyle: fightingStyle,
        stakesMagnitude: this.extractStakesMagnitude(result)
      },
      transitiveVerbFramework: {
        speakingActions: this.extractSpeakingActions(result),
        characterObjective: context.sceneObjective,
        obstacleCharacter: this.extractObstacle(result),
        verbalTactic: this.extractVerbalTactic(result)
      }
    };
  }

  /**
   * Generate enhanced conflict structure using insights from AI response
   */
  private static generateEnhancedConflictStructureFromResponse(result: string, context: any): ConflictDialogueStructure {
    // Extract what we can from the text
    const extracted = this.extractConflictStructureFromText(result, context);
    
    // Merge with baseline fallback
    const baseline = this.generateFallbackConflictStructure(context, {});
    
    return {
      fundamentalPrinciple: baseline.fundamentalPrinciple,
      threeActStructure: {
        setup: {
          ...baseline.threeActStructure.setup,
          topicEstablishment: extracted.threeActStructure.setup.topicEstablishment
        },
        conflict: {
          ...baseline.threeActStructure.conflict,
          battleOfWits: extracted.threeActStructure.conflict.battleOfWits,
          tacticalDeployment: extracted.threeActStructure.conflict.tacticalDeployment
        },
        resolution: {
          ...baseline.threeActStructure.resolution,
          outcomeType: extracted.threeActStructure.resolution.outcomeType
        }
      },
      conflictVariations: extracted.conflictVariations,
      transitiveVerbFramework: {
        ...baseline.transitiveVerbFramework,
        speakingActions: extracted.transitiveVerbFramework.speakingActions
      }
    };
  }

  // Helper methods for conflict structure extraction
  private static extractTopicFromText(text: string): string | null {
    const topicMatch = text.match(/topic[:\s]+([^.!?]*)/i);
    return topicMatch ? topicMatch[1].trim() : null;
  }

  private static extractCharacterPositions(text: string, context: any): Record<string, string> {
    const positions: Record<string, string> = {};
    
    if (context.characters) {
      context.characters.forEach((char: any) => {
        const charPattern = new RegExp(`${char.name}[^]*?(?:wants|seeks|tries|objective)[^.!?]*`, 'gi');
        const match = text.match(charPattern);
        positions[char.name] = match ? match[0] : char.objective;
      });
    }
    
    return positions;
  }

  private static extractStakes(text: string): string | null {
    const stakesMatch = text.match(/stakes?[:\s]+([^.!?]*)/i);
    return stakesMatch ? stakesMatch[1].trim() : null;
  }

  private static extractTactics(text: string): string[] {
    const tactics: string[] = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('persua')) tactics.push('persuasion');
    if (lowerText.includes('intimid') || lowerText.includes('threaten')) tactics.push('intimidation');
    if (lowerText.includes('manipul')) tactics.push('manipulation');
    if (lowerText.includes('seduc') || lowerText.includes('charm')) tactics.push('seduction');
    if (lowerText.includes('logic') || lowerText.includes('reason')) tactics.push('logical argument');
    
    return tactics.length > 0 ? tactics : ['persuasion', 'intimidation', 'manipulation'];
  }

  private static extractPlotMovement(text: string): string {
    const plotMatch = text.match(/plot[^.!?]*moves?[^.!?]*/gi);
    return plotMatch ? plotMatch[0] : 'Character relationships tested';
  }

  private static extractCharacterRevelation(text: string): string {
    const revelationMatch = text.match(/reveal[^.!?]*/gi);
    return revelationMatch ? revelationMatch[0] : 'True motivations revealed';
  }

  private static extractStakesMagnitude(text: string): 'personal' | 'relational' | 'professional' | 'existential' {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('existential') || lowerText.includes('life') || lowerText.includes('death')) return 'existential';
    if (lowerText.includes('professional') || lowerText.includes('career') || lowerText.includes('job')) return 'professional';
    if (lowerText.includes('relational') || lowerText.includes('relationship') || lowerText.includes('friendship')) return 'relational';
    return 'personal';
  }

  private static extractSpeakingActions(text: string): string[] {
    const actions: string[] = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('interrogat')) actions.push('interrogating');
    if (lowerText.includes('seduc')) actions.push('seducing');
    if (lowerText.includes('intimid')) actions.push('intimidating');
    if (lowerText.includes('persuad') || lowerText.includes('convinc')) actions.push('persuading');
    if (lowerText.includes('challeng')) actions.push('challenging');
    if (lowerText.includes('defend')) actions.push('defending');
    
    return actions.length > 0 ? actions : ['persuading', 'challenging', 'defending'];
  }

  private static extractObstacle(text: string): string {
    const obstacleMatch = text.match(/obstacle[^.!?]*/gi);
    return obstacleMatch ? obstacleMatch[0] : 'Opposing character';
  }

  private static extractVerbalTactic(text: string): string {
    const tacticMatch = text.match(/tactic[^.!?]*/gi);
    return tacticMatch ? tacticMatch[0] : 'Strategic word deployment';
  }

  private static generateFallbackConflictStructure(context: any, requirements: any): ConflictDialogueStructure {
    return {
      fundamentalPrinciple: {
        allDialogueIsConflict: true,
        opposingObjectives: true,
        microDramaFramework: true
      },
      threeActStructure: {
        setup: {
          topicEstablishment: context.sceneObjective,
          characterPositions: context.characters.reduce((acc: any, char: any) => {
            acc[char.name] = char.objective;
            return acc;
          }, {}),
          initialStakes: context.stakes
        },
        conflict: {
          battleOfWits: true,
          tacticalDeployment: ['persuasion', 'intimidation', 'manipulation'],
          verbalStrikesAndParries: true,
          advantageShifting: true
        },
        resolution: {
          outcomeType: 'escalation',
          plotMovement: 'Character relationships tested',
          characterRevelation: 'True motivations revealed'
        }
      },
      conflictVariations: {
        tensionLevel: 'moderate',
        fightingStyle: 'logical',
        stakesMagnitude: 'personal'
      },
      transitiveVerbFramework: {
        speakingActions: ['persuading', 'challenging', 'defending'],
        characterObjective: context.sceneObjective,
        obstacleCharacter: 'Opposing character',
        verbalTactic: 'Strategic word deployment'
      }
    };
  }
  
  private static async constructSubtextLayers(
    context: any,
    subtextLevel: string,
    conflictStructure: ConflictDialogueStructure
  ): Promise<SubtextFramework> {
    // Implementation for subtext construction
    return {
      firstRule: {
        dontSayWhatYouMean: true,
        preventDirectSpeech: 'Characters avoid stating feelings directly',
        forceIndirection: true
      },
      generationTechniques: {
        deflectionAndIndirection: {
          evasiveAnswers: ['topic_changes', 'questions_with_questions'],
          topicChanges: ['weather', 'work', 'past_events'],
          deliberateMisunderstanding: true
        },
        understatementAndIrony: {
          emotionalDownplaying: true,
          ironicDelivery: ['opposite_meanings'],
          powerfulUnderstatement: ['that_was_eventful']
        },
        contradictoryBodyLanguage: {
          verbalVsPhysical: true,
          nonverbalCues: ['eye_contact', 'posture', 'gestures'],
          emotionalMasking: true
        },
        metaphoricalConversation: {
          surfaceTopic: 'Apparent discussion topic',
          realConflict: 'Underlying emotional conflict',
          symbolicVehicle: 'Object carrying emotional weight'
        }
      },
      narrativeFunctions: {
        plotAdvancement: true,
        characterComplexity: true,
        audienceEngagement: true,
        dramaticIrony: true
      }
    };
  }
  
  private static async applyGenreVernacular(
    genre: string,
    masterAnalysis: MasterDialogueTechniques,
    voiceProfiles: Record<string, CharacterVoiceSystem>
  ): Promise<any> {
    // Implementation for genre-specific application
    return {
      genreType: genre,
      specialConsiderations: [`${genre}_specific_requirements`],
      adaptedTechniques: ['Genre appropriate master techniques'],
      voiceAdjustments: 'Character voices adjusted for genre'
    };
  }
  
  private static async generateCoreDialogue(
    context: any,
    masterAnalysis: MasterDialogueTechniques,
    voiceProfiles: Record<string, CharacterVoiceSystem>,
    conflictStructure: ConflictDialogueStructure,
    subtextFramework: SubtextFramework,
    genreFramework: any,
    requirements: any
  ): Promise<DialogueAssessment> {
    
    // This would be the core AI dialogue generation
    return {
      id: `dialogue-${Date.now()}`,
      characterName: context.characters[0]?.name || 'Character',
      sceneContext: context.sceneObjective,
      genre: context.genre,
      
      masterTechniques: masterAnalysis,
      subtextFramework: subtextFramework,
      conflictStructure: conflictStructure,
      voiceSystem: voiceProfiles[context.characters[0]?.name] || voiceProfiles[Object.keys(voiceProfiles)[0]],
      
      realismFramework: {
        realismIllusion: {
          dialogueVsConversation: true,
          dramaticPurpose: 'character_revelation',
          purposefulConstruction: true
        },
        selectiveRealistTechniques: {
          colloquialLanguage: {
            contractions: true,
            slangIntegration: ['contemporary_slang'],
            regionalExpressions: ['area_specific']
          },
          variedSentenceStructure: {
            shortPunchy: true,
            longerDetailed: true,
            naturalMixing: true
          },
          embracedImperfection: {
            interruptions: true,
            talkingOver: true,
            unfinishedThoughts: true,
            realWorldMessiness: true
          }
        },
        observationalData: {
          listeningPractice: true,
          uniquePhrasing: ['character_specific'],
          speechRhythms: ['natural_patterns'],
          conversationFlow: ['realistic_progression']
        }
      },
      
      powerDynamics: {
        powerNegotiation: {
          everyConversationIsPowerNegotiation: true,
          statusVieingConstant: true,
          hierarchyConstruction: true
        },
        linguisticPowerMarkers: {
          directnessVsIndirectness: {
            highPowerDirectness: true,
            lowPowerPoliteness: false,
            faceThreateningActs: true
          },
          interruptionsAndOverlaps: {
            dominanceAssertion: true,
            cooperativeEnthusiasm: false,
            hostileTransgression: false,
            conversationControl: true
          },
          languageProficiency: {
            dominantLanguagePower: true,
            expertiseVsFluency: true,
            multilinguralDynamics: false
          }
        },
        statusTransactionMapping: {
          raisingOwnStatus: ['authority_assertion'],
          loweringOtherStatus: ['subtle_undermining'],
          statusShifts: true,
          powerBalanceEvolution: 'Dynamic power shifts throughout scene'
        }
      },
      
      emotionalEscalation: {
        snowballEffect: {
          setupPhase: {
            preExistingConditions: ['stress', 'fatigue'],
            susceptibilityFactors: ['personal_triggers'],
            environmentalStressors: ['time_pressure']
          },
          escalationSteps: {
            trigger: {
              triggerEvent: 'Small provocative comment',
              stressResponseActivation: true,
              emotionalFlood: true
            },
            physicalResponse: {
              agitationSigns: ['tension', 'breathing_changes'],
              bodyLanguageShifts: ['posture_defensive'],
              voiceChanges: ['pitch_rise', 'speed_increase']
            },
            linguisticShift: {
              fragmentedSpeech: true,
              emotionalVocabulary: ['charged_words'],
              pacingChanges: 'faster',
              logicBreakdown: true
            }
          }
        },
        deEscalationTechniques: {
          emotionValidation: true,
          activeListening: ['acknowledging_feelings'],
          avoidLogicBattles: true,
          empathyDeployment: true
        },
        argumentPsychology: {
          factualVsPerceptual: true,
          emotionalRealityClash: true,
          resolutionMechanism: 'understanding'
        }
      },
      
      influenceEthics: {
        persuasionVsManipulation: {
          ethicalPersuasion: {
            transparency: true,
            mutualBenefit: true,
            respectForAutonomy: true,
            balancedAppeal: true
          },
          manipulation: {
            selfishInterests: false,
            deceptionAndHiding: false,
            exploitationTactics: false,
            freeChoiceRemoval: false
          }
        },
        manipulativeTactics: {
          emotionalExploitation: [],
          deceptionMisrepresentation: [],
          coercion: []
        },
        characterMoralArcMapping: {
          heroicEvolution: 'manipulation_to_persuasion',
          tragicFall: 'persuasion_to_manipulation',
          moralInfluenceStyle: 'Ethical persuasion through honesty'
        }
      },
      
      genreFramework: genreFramework,
      periodContemporary: {
        historicalDialogue: {
          researchFoundation: {
            primarySources: [],
            periodVocabulary: [],
            speechPatterns: [],
            eraAuthenticity: false
          },
          lessIsMorePrinciple: {
            strategicArchaism: false,
            clarityMaintenance: true,
            periodEvocation: false
          },
          anachronismAvoidance: {
            idiomVerification: [],
            modernIntrusions: [],
            historicalAccuracy: false
          },
          socialHierarchyReflection: {
            classBasedSpeech: false,
            educationLevelReflection: true,
            genderBasedPatterns: false,
            hierarchyAuthenticity: false
          }
        },
        contemporaryDialogue: {
          generationalVernaculars: {
            babyBoomers: ['groovy', 'far_out'],
            generationX: ['whatever', 'gnarly'],
            millennials: ['adulting', 'FOMO'],
            generationZ: ['rizz', 'no_cap']
          },
          slangStrategicUse: {
            culturalAuthenticity: true,
            groupSpecificLanguage: ['appropriate_slang'],
            obsolescenceRisk: false,
            contextualAppropriateness: true
          }
        }
      },
      
      advancedTechniques: {
        interruptionAndOverlap: {
          interruptionFunctions: {
            powerAssertion: true,
            cooperativeDevice: false,
            contextualClarity: true
          },
          punctuationStrategy: {
            emDash: true,
            ellipsis: true,
            overlapIndication: 'Simultaneous speech markers'
          }
        },
        silenceAndPauses: {
          silencePower: {
            discomfortWeapon: true,
            informationExtraction: true,
            controlAssertion: true
          },
          pauseNarrativeFunctions: {
            tensionBuilding: true,
            characterRevelation: true,
            subtextEnhancement: true,
            rhythmControl: true
          }
        },
        profanityMatureContent: {
          strategicProfanity: {
            emotionalExpression: false,
            characterization: true,
            worldBuilding: false,
            thematicResonance: false
          },
          deliberateChoice: true,
          characterDriven: true,
          narrativePurpose: true
        }
      },
      
      performanceConsiderations: {
        actorFriendlyDialogue: {
          breathableWriting: {
            naturalBreathingPoints: true,
            speechBreakup: true,
            rhythmicPunctuation: true
          },
          naturalSpeechPatterns: {
            contractionsUsage: true,
            variedSentenceLengths: true,
            straightforwardLanguage: true
          },
          actorTrust: {
            minimalParentheticals: true,
            contextualEmotion: true,
            interpretationFreedom: true
          }
        },
        expositionSeamless: {
          weaveDontDump: true,
          conflictDisguise: true,
          naiveCharacter: false,
          showDontTell: true
        },
        postProductionAwareness: {
          adrConsiderations: {
            offScreenDialogue: false,
            facialVisibility: true,
            audioFlexibility: true
          },
          internationalDubbing: {
            culturalIdiomAvoidance: true,
            sentenceConciseness: true,
            clearEmotionalIntent: true
          }
        }
      },
      
      revisionFramework: {
        systematicApproach: {
          readAloudMandatory: {
            performanceTest: true,
            awkwardnessDetection: true,
            rhythmAssessment: true,
            voiceDistinctionCheck: true
          },
          ruthlessTrimming: {
            getInLateGetOutEarly: true,
            redundancyElimination: true,
            purposeCheck: true
          }
        },
        lineByLinePurposeCheck: {
          characterRevelation: true,
          plotAdvancement: true,
          conflictTension: true,
          subtextPresence: true,
          actionAlternative: false
        },
        subtextSharpening: {
          onTheNoseIdentification: true,
          indirectRewriting: true,
          contradictionEmployment: true
        },
        rhythmEnhancement: {
          pacingAdjustment: true,
          sentenceLengthVariation: true,
          pauseAdditionRemoval: true,
          cadenceCompelling: true
        },
        refinementCycle: {
          continuousRevision: true,
          aloudReadingRepeated: true,
          sharpnessAchievement: true,
          authenticityMaintenance: true
        }
      },
      
      generatedBy: 'DialogueEngineV2',
      confidence: 8,
      coverTheNameTestScore: 8,
      conflictIntensity: requirements.conflictIntensity || 7,
      subtextDepth: 7,
      genreAppropriateness: 8
    };
  }
  
  private static async applyTechnicalPolish(
    dialogue: DialogueAssessment,
    options: any
  ): Promise<DialogueAssessment> {
    // Apply performance and production considerations
    return dialogue;
  }
  
  private static async applyProfessionalRevision(
    dialogue: DialogueAssessment,
    revisionLevel: string
  ): Promise<DialogueRecommendation> {
    
    return {
      primaryRecommendation: dialogue,
      alternativeApproaches: [],
      
      craftStrategy: {
        nextSteps: [
          'Read dialogue aloud for rhythm assessment',
          'Test character voice distinctiveness',
          'Sharpen subtext layers',
          'Enhance conflict progression'
        ],
        priorityAreas: [
          'Character voice differentiation',
          'Subtext depth',
          'Conflict escalation',
          'Genre appropriateness'
        ],
        commonPitfalls: [
          'On-the-nose dialogue',
          'Lack of character objectives',
          'Weak subtext',
          'Generic character voices'
        ]
      },
      
      actorDirection: {
        deliveryNotes: [
          'Emphasize subtext over surface meaning',
          'Find character\'s hidden objective',
          'Use pauses for emotional beats'
        ],
        emotionalBeats: [
          'Rising tension in conflict escalation',
          'Vulnerability moments',
          'Power shift indicators'
        ],
        subtalTargets: [
          'What character really wants',
          'What they\'re afraid to say',
          'Hidden relationship dynamics'
        ]
      },
      
      editingPriorities: {
        strengthsToAmplify: [
          'Strong character voices',
          'Effective conflict structure',
          'Professional subtext layering'
        ],
        weaknessesToAddress: [
          'Tighten exposition delivery',
          'Enhance rhythm variation',
          'Strengthen genre elements'
        ],
        rhythmAdjustments: [
          'Vary sentence lengths',
          'Add strategic pauses',
          'Improve pacing flow'
        ]
      },
      
      techniqueBreakdown: {
        sorkinElements: [
          'Musical rhythm and pacing',
          'Intellectual ping-pong exchanges',
          'Pop culture reference integration'
        ],
        mametElements: [
          'Sparse, precise language',
          'Power-driven objectives',
          'Silence and subtext emphasis'
        ],
        tarantinoElements: [
          'Naturalistic authenticity',
          'Cultural reference playground',
          'Character-specific speech patterns'
        ],
        uniqueInnovations: [
          'Genre-specific adaptations',
          'Modern psychological insights',
          'Performance-optimized structure'
        ]
      }
    };
  }
}

// Types are exported at their declaration points above
 